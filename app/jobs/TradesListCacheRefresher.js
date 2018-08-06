const _ = require('lodash');
const logger = require('sota-core').getLogger('HistoryCacheRefresher');
const Const = require('../common/Const');
const ExSession = require('sota-core').load('common/ExSession');
const BaseJob = require('./BaseJob');
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');
const CacheInfo = require('../../config/cache/info');

class TradesListCacheRefresher extends BaseJob {
  constructor() {
    super();
  }

  executeJob(callback) {
    const params = {
      symbol: '',
      page: 0,
      limit: 5,
      fromDate: '',
      toDate: '',
    };

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

    const tradeService = new ExSession().getService('TradeService');
    tradeService.getTradesList(params, (err, ret_1) => {
      if (err) {
        logger.error(err)
        callback(err)
      }
      if (ret_1) {
        RedisCache.setAsync(key, JSON.stringify(ret_1), CacheInfo.TradesList.TTLTool);
        callback(null, ret_1)
      }
    });
  }
};
module.exports = TradesListCacheRefresher;
