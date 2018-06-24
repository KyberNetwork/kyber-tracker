const _               = require('lodash');
const async           = require('async');
const network         = require('../../config/network');
const Utils           = require('../common/Utils');
const ExSession       = require('sota-core').load('common/ExSession');
const logger          = require('sota-core').getLogger('getBurnedFeeFromTransaction');
const request         = require('superagent');
const BigNumber       = require('bignumber.js');

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
    record.minuteSeq = Math.floor(record.blockTimestamp / 60);
    record.hourSeq = Math.floor(record.blockTimestamp / 3600);
    record.daySeq = Math.floor(record.blockTimestamp / 86400);

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

      if (ret.existed) {
        return;
      }

      const mins = Math.floor((Date.now() / 1000 - data.blockTimestamp) / 60);
      if (mins > 30) return;

      const amount = new BigNumber(data.amount).div(Math.pow(10, 18));
      if (amount.lt(100)) return;
      
      let notifyGroups = (process.env.NOTIFY_GROUPS || "").split(";");
      if (!notifyGroups || !notifyGroups.length) return;

      const link = `https://etherscan.io/tx/${data.tx}`;

      const text = encodeURIComponent(`${amount.toFormat(1)} KNC was burnt just ${mins} minutes ago ${link}`);

      const botToken = process.env.TRACKER_BOT_TOKEN;
      const sanityLog = (e) => {
        return JSON.stringify(e).replace(botToken, "TRACKER_BOT_TOKEN");
      };

      notifyGroups.forEach((group) => {
        if (!group) return;
        try {
          const uri = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${group}&text=${text}`;
          request
            .get(uri)
            .end((err, response) => {
              if (err) {
                logger.error(sanityLog(err));
                return;
              }
              logger.info(text);
            });
        } catch (e) {
          logger.error(sanityLog(e));
        }
      });
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
