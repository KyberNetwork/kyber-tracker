require('dotenv').config();
const _           = require('lodash');
const async       = require('async');
const path        = require('path');
const network     = require('../config/network');
const SotaCore    = require('sota-core');
const ExSession   = SotaCore.load('common/ExSession');
const logger      = SotaCore.getLogger();

const tokens = _.keyBy(_.values(network.tokens), 'symbol');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(doPriceUpdate);

function doPriceUpdate() {
  logger.info(`Start update price and volume for kyber trades...`);
  const exSession = new ExSession();
  const KyberTradeModel = exSession.getModel('KyberTradeModel');

  async.waterfall([
    (next) => {
      KyberTradeModel.find({
        where: 'maker_price_usd IS NULL',
        limit: 3,
      }, next);
    },
    (records, next) => {
      if (!records || !records.length) {
        logger.info(`FINISHED! No more rows need to be updated.`);
        process.exit(0);
      }

      async.eachSeries(records, (record, _next) => {
        tryUpdateOneRecord(record, _next);
      }, next);
    },
    (ret, next) => {
      if (typeof ret === 'function') {
        next = ret;
        ret = null;
      }

      exSession.commit(next);
    }
  ], (err, ret) => {
    exSession.destroy();

    if (err) {
      logger.error(`Something went wrong, process will be exited...`);
      logger.error(err);
      process.exit(1);
    }

    doPriceUpdate();
  });
}

function tryUpdateOneRecord (record, callback) {
  const CMCService = record.getModel().getService('CMCService');
  const blockTimestampInMillis = record.blockTimestamp * 1000;
  logger.info(`Try update record: ${record.id}`);

  async.auto({
    makerPrice: (next) => {
      CMCService.getHistoricalPrice(record.makerTokenSymbol, blockTimestampInMillis, next);
    },
    takerPrice: (next) => {
      CMCService.getHistoricalPrice(record.takerTokenSymbol, blockTimestampInMillis, next);
    },
    updateRecord: ['makerPrice', 'takerPrice', (ret, next) => {
      record.makerPriceBtc = ret.makerPrice.price_btc;
      record.makerPriceEth = ret.makerPrice.price_eth;
      record.makerPriceUsd = ret.makerPrice.price_usd;
      record.takerPriceBtc = ret.takerPrice.price_btc;
      record.takerPriceEth = ret.takerPrice.price_eth;
      record.takerPriceUsd = ret.takerPrice.price_usd;
      record.save(next);
    }]
  }, callback);
}
