const _               = require('lodash');
const async           = require('async');
const BN              = require('bn.js');
const network         = require('../../config/network');
const Utils           = require('../common/Utils');
const ExSession       = require('sota-core').load('common/ExSession');
const logger          = require('sota-core').getLogger('getKyberTradeFromTransaction');

const web3            = Utils.getWeb3Instance();
const abiDecoder      = Utils.getKyberABIDecoder();

module.exports = (block, tx, callback) => {
  async.auto({
    receipt: (next) => {
      web3.eth.getTransactionReceipt(tx.hash, next);
    },
  }, (err, ret) => {
    if (err) {
      return callback(err);
    }

    const record = {};
    const receipt = ret.receipt;

    if (!tx || !receipt) {
      return callback(`Something went wrong. Cannot get transaction information.`);
    }

    const inputData = abiDecoder.decodeMethod(tx.input);
    if (!inputData || inputData.name !== 'burnReserveFees') {
      logger.info(`Transaction is not burnReserveFees transaction: ${tx.hash}`);
      return callback(null, null);
    }

    if (!web3.utils.hexToNumber(receipt.status)) {
      logger.info(`Transaction receipt is failed: ${tx.hash}`);
      return callback(null, null);
    }

    record.tx = tx.hash;
    record.blockNumber = tx.blockNumber;
    record.blockHash = tx.blockHash;
    record.blockTimestamp = block.timestamp;
    record.burnerAddress = tx.from;
    record.burnerContract = tx.to;

    record.reserveContract = _.find(inputData.params, (param) => param.name === 'reserve').value;

    _.forEach(receipt.logs, (log) => {
      if (log.address.toLowerCase() === Utils.getKNCTokenAddress() &&
          log.topics[0].toLowerCase() === Utils.getERC20TransferTopicHash()) {
        const senderAddr = web3.eth.abi.decodeParameter('address', log.topics[1]);
        const receiverAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
        const amount = web3.eth.abi.decodeParameter('uint256', log.data);

        if (receiverAddr.toLowerCase() === tx.to.toLowerCase()) {
          record.reserveWallet = senderAddr;
          record.amount = amount;
        }
      }

    });

    return insertRecord(record, callback);
  });
}

function insertRecord(data, callback) {
  const exSession = new ExSession();
  const BurnedFeeModel = exSession.getModel('BurnedFeeModel');

  async.auto({
    existed: (next) => {
      BurnedFeeModel.findOne({
        where: 'tx = ?',
        params: [data.tx]
      }, next);
    },
    insert: ['existed', (ret, next) => {
      if (ret.existed) {
        logger.info(`Transaction was processed already: ${data.tx}`);
        return next(null, null);
      }

      BurnedFeeModel.add(data, next);
    }],
    commit: ['insert', (ret, next) => {
      exSession.commit(next);
    }]
  }, (err, ret) => {
    exSession.destroy();

    if (err) {
      logger.error(err);
      return callback(err);
    }

    callback(null, null);
  });
}
