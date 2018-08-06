const _ = require('lodash');
const logger = require('sota-core').getLogger('HistoryCacheRefresher');
const Const = require('../common/Const');
const ExSession = require('sota-core').load('common/ExSession');
const BaseJob = require('./BaseJob');
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');
const CacheInfo = require('../../config/cache/info');

class TopTokenCacheRefresher extends BaseJob {
  constructor() {
    super();
  }

  executeJob(callback) {
    const date = new Date();
    const nowInMs = date.getTime();
    const nowInMinutes = Math.floor(nowInMs / 60000);
    let toDate = nowInMinutes;
    date.setMonth(date.getMonth() - 1);
    let fromDate = Math.floor(date.getTime() / 60000);
    let key = `${CacheInfo.TopTokensList.key}${fromDate / 60}-${toDate / 60}`;

    const tradeService = new ExSession().getService('TradeService');
    tradeService.getTopTokensList(fromDate, toDate, (err, ret_1) => {
      if (err) {
        logger.error(err);
        callback(err)
      }
      if (ret_1) {
        RedisCache.setAsync(key, JSON.stringify(ret_1), CacheInfo.TopTokensList.TTLTool);
        callback(null, ret_1)
      }
    });
  }
};
module.exports = TopTokenCacheRefresher;
