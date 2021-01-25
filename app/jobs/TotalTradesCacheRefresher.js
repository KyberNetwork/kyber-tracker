const _ = require('lodash');
const CacheInfo = require('../../config/cache/info');
const BaseJob = require('./BaseJob');

class TotalTradesCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    const params = options.params;
    const interval = params.interval || 'H1';
    const period = params.period || 'D7';
    let key = `${CacheInfo.NumberTrades.key + period}-${interval}`;
    if (params.symbol) {
      key = params.symbol + '-' + key;
    }
    if (params.fromDate) {
      key = params.fromDate + '-' + key;
    }
    if (params.toDate) {
      key = params.toDate + '-' + key;
    }
    options.cache.name = key;
    callback(null, options)
  }
};
module.exports = TotalTradesCacheRefresher;
