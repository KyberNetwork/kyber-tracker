const _ = require('lodash');
const BaseJob = require('./BaseJob');
const CacheInfo = require('../../config/cache/info');

class TradesListCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    const params = options.params;
    const interval = params.interval || 'H1';
    const period = params.period || 'D7';
    let key = `${CacheInfo.TradesList.key + params.page}-${params.limit}`;
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
module.exports = TradesListCacheRefresher;
