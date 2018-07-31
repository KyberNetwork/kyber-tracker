const _ = require('lodash');
const network = require('../../config/network');
const logger = require('sota-core').getLogger('HistoryCacheRefresher');
const Const = require('../common/Const');
const ExSession = require('sota-core').load('common/ExSession');

const BaseJob = require('./BaseJob');

const tokens = network.tokens;

class AllRateInfoCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  executeJob(callback) {
    if (!tokens) return callback(null, {});
    const currenciesService = new ExSession().getService('CurrenciesService');
    const redisCacheService = new ExSession().getService('RedisCacheService');
    const CACHE_KEY = 'allrates';
    const CACHE_TTL = 15 * Const.MINUTE_IN_MILLISECONDS;
    currenciesService.getAllRateInfo((err, ret) => {
      if (err) {
        logger.error(err);
        return callback(err)
      }
      // pack the result
      const pack = {};
      Object.keys(ret).forEach((symbol) => {
        const token = ret[symbol];
        const item = pack[symbol] = {
          //e: token.volume[0].ETH,
          //u: token.volume[0].USD,
          r: token.rate.length ? token.rate[0]["24h"] : 0,
          p: []
        };
        token.points.forEach((p) => {
          item.p.push(p.rate);
        });
      });
      redisCacheService.setCacheByKey(CACHE_KEY, pack, {
        ttl: CACHE_TTL
      });
      return callback(null, pack)
    });
  }
};
module.exports = AllRateInfoCacheRefresher;