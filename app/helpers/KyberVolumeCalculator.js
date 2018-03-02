const _               = require('lodash');
const async           = require('async');
const moment          = require('moment');
const getKyberTrade   = require('./getKyberTradeFromTransaction');
const Const           = require('../common/Const');
const Utils           = require('sota-core').load('util/Utils');
const ExSession       = require('sota-core').load('common/ExSession');
const logger          = require('sota-core').getLogger('KyberVolumeCalculator');

const TIME_START = moment('2018-02-01 00Z').unix();

class KyberVolumeCalculator {

  start () {
    const interval = Const.CHART_INTERVAL.H1;
    const now = Utils.nowInSeconds();
    const count = Math.floor((now - TIME_START) / interval);
    const timestamps = [];
    for (let i = 0; i <= count; i++) {
      timestamps.push(TIME_START + i * interval);
    }

    async.forEachLimit(timestamps, 5, (timestamp, next) => {
      this.calculateForATimeFrame(timestamp, interval, next);
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      }

      logger.info('FINISH...');
      process.exit(0);
    });
  }

  calculateForATimeFrame (beginTimestamp, interval, callback) {
    logger.info(`Start calculate for timeframe: ${beginTimestamp}, interval=${interval}`);
    const exSession = new ExSession();
    const VolumeHourModel = exSession.getModel('VolumeHourModel');
    const KyberTradeModel = exSession.getModel('KyberTradeModel');

    async.auto({
      valueBuy: (next) => {
        KyberTradeModel.sum('taker_token_amount', {
          where: 'taker_token_symbol = ? AND block_timestamp > ?',
          params: ['ETH', nowInSeconds - DAY_IN_SECONDS],
        }, next);
      }
    })

    callback(null, null);
  }

}

module.exports = KyberVolumeCalculator;
