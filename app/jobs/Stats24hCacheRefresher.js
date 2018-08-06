const _ = require('lodash');
const logger = require('sota-core').getLogger('HistoryCacheRefresher');
const Const = require('../common/Const');
const ExSession = require('sota-core').load('common/ExSession');
const CacheInfo = require('../../config/cache/info');
const BaseJob = require('./BaseJob');

class Stats24hCacheRefresher extends BaseJob {
  constructor() {
    super();
  };

  executeJob(callback) {
    const key = CacheInfo.Stats24h.key;
    const time_exprire = CacheInfo.Stats24h.TTLTool;
    let params = {};
    params.time_exprire = time_exprire;
    params.key = key;
    const tradeService = new ExSession().getService('TradeService');
    tradeService._getStats24h(params, (err, ret) => {
      if (err) {
        logger.error(err);
        return callback(err)
      }
      return callback(null, ret)
    });
  };
};
module.exports = Stats24hCacheRefresher;
