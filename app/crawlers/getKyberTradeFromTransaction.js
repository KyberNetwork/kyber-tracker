const _               = require('lodash');
const async           = require('async');
const exchangeLogABI  = require('../../config/abi/log_exchange');
const feeLogABI       = require('../../config/abi/log_fee');
const burnLogABI      = require('../../config/abi/log_burn');
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
    if (!inputData || inputData.name !== 'trade') {
      logger.info(`Transaction is not trade transaction: ${tx.hash}`);
      return callback(null, null);
    }

    if (!web3.utils.hexToNumber(receipt.status)) {
      logger.info(`Transaction receipt is failed: ${tx.hash}`);
      return callback(null, null);
    }

    record.tx = tx.hash;
    record.blockNumber = tx.blockNumber;
    record.blockHash = tx.blockHash;
    record.takerAddress = tx.from;
    record.makerAddress = tx.to;
    record.gasLimit = tx.gas;
    record.gasPrice = tx.gasPrice;
    record.gasUsed = receipt.gasUsed;
    record.blockTimestamp = block.timestamp;
    record.minuteSeq = Math.floor(block.timestamp / 60);
    record.hourSeq = Math.floor(block.timestamp / 3600);
    record.daySeq = Math.floor(block.timestamp / 86400);

    _.forEach(receipt.logs, (log) => {
      if (log.address.toLowerCase() === Utils.getKyberNetworkContractAddress() &&
          log.topics[0].toLowerCase() === Utils.getExchangeTopicHash()) {
        const { src, dest, srcAmount, destAmount } = web3.eth.abi.decodeParameters(exchangeLogABI, log.data);

        logger.info(`Got new trade: ${JSON.stringify({ src, dest, srcAmount, destAmount })}`);

        const srcToken = Utils.getTokenFromAddress(src);
        const destToken = Utils.getTokenFromAddress(dest);

        if(!srcToken || !destToken) {
          if(!srcToken) logger.error(`Cannot get src token with address: ${src}`);
          if(!destToken) logger.error(`Cannot get src token with address: ${dest}`);
        }

        record.takerTokenAddress = srcToken.address;
        record.takerTokenSymbol = srcToken.symbol;
        record.takerTokenAmount = srcAmount;


        record.makerTokenAddress = destToken.address;
        record.makerTokenSymbol = destToken.symbol;
        record.makerTokenAmount = destAmount;

        /*
        if (srcToken.symbol === 'ETH') {
          record.volumeEth = srcAmount;
        } else if (destToken.symbol === 'ETH') {
          record.volumeEth = destAmount;
        }
        */
      }

      if (log.topics[0].toLowerCase() === Utils.getBurnFeesTopicHash()) {
        const { reserveAddr, burnFees } = web3.eth.abi.decodeParameters(burnLogABI, log.data);
        record.reserveAddress = reserveAddr;
        record.burnFees = burnFees;
      }

      if (log.topics[0].toLowerCase() === Utils.getFeeToWalletTopicHash()) {
        const { reserveAddr, walletAddr, walletFee } = web3.eth.abi.decodeParameters(feeLogABI, log.data);
        record.takerFee = walletFee;
      }

    });

    return insertTradeRecord(record, callback);
  });
}

function insertTradeRecord(data, callback) {
  const exSession = new ExSession();
  const KyberTradeModel = exSession.getModel('KyberTradeModel');
  const CMCService = exSession.getService('CMCService');

  async.auto({
    existed: (next) => {
      KyberTradeModel.findOne({
        where: 'tx = ?',
        params: [data.tx]
      }, next);
    },
    takerPrice: (next) => {
      CMCService.getHistoricalPrice(data.takerTokenSymbol, data.blockTimestamp * 1000, next);
    },
    makerPrice: (next) => {
      CMCService.getHistoricalPrice(data.makerTokenSymbol, data.blockTimestamp * 1000, next);
    },
    insert: ['existed', 'takerPrice', 'makerPrice', (ret, next) => {
      if (ret.existed) {
        logger.info(`Transaction was inserted already: ${data.tx}`);
        return next(null, null);
      }

      data.makerPriceBtc = ret.makerPrice.price_btc;
      data.makerPriceEth = ret.makerPrice.price_eth;
      data.makerPriceUsd = ret.makerPrice.price_usd;
      data.takerPriceBtc = ret.takerPrice.price_btc;
      data.takerPriceEth = ret.takerPrice.price_eth;
      data.takerPriceUsd = ret.takerPrice.price_usd;
      KyberTradeModel.add(data, next);
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
