const _ = require('lodash');
const logger = require('sota-core').getLogger('HistoryCacheRefresher');
const Const = require('../common/Const');
const ExSession = require('sota-core').load('common/ExSession');

const BaseJob = require('./BaseJob');

class VolumesCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  executeJob(callback) {
    const params = {
      symbol: '',
      period: 'D30',
      interval: 'D1',
      fromDate: '',
      toDate: ''
    };
    const interval = params.interval || 'H1';
    const period = params.period || 'D7';
    const time_exprire = {
      ttl: 1.5 * Const.MINUTE_IN_MILLISECONDS
    }
    let key = `vol-${period}-${interval}`;
    if (params.symbol) {
      key = params.symbol + '-' + key;
    }
    if (params.fromDate) {
      key = params.fromDate + '-' + key;
    }
    if (params.toDate) {
      key = params.toDate + '-' + key;
    }
    params.time_exprire = time_exprire
    params.interval = interval;
    params.period = period;
    params.key = key;
    const tradeService = new ExSession().getService('TradeService');
    tradeService._getNetworkVolumes(params, (err, ret) => {
      if (err) {
        logger.error(err);
        return callback(err)
      }
      return callback(null, ret)
    });
  }
};
module.exports = VolumesCacheRefresher;