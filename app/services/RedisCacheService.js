const _ = require('lodash');
const async = require('async');
const logger = require('sota-core').getLogger('RedisCacheService');
const BaseService = require('sota-core').load('service/BaseService');
const Resolution = require('../common/Resolution');
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');
const network = require('../../config/network');

const tokens = network.tokens;

module.exports = BaseService.extends({
  classname: 'RedisCacheService',

  setCacheByKey: function (key_cache, data, time_exprire) {
    RedisCache.setAsync(key_cache, JSON.stringify(data), time_exprire, function (err, ret) {
      if (err) {
        logger.error(err)
      }
      logger.info("create key " + key_cache + " on redis " + ret)
    });
  },

  getCacheByKey: function (key_cache, callBack) {
    RedisCache.getAsync(key_cache, callBack);
  },

  _process_chart_history: function (options, callback) {
    if (!options.token || !tokens[options.token]) {
      return callback("token not supported")
    }
    // logger.info(options.params.from, options.params.to)
    options.params.seqType = Resolution.toColumn(options.params.resolution);

    RedisCache.getAsync(options.key_cache, function (err, ret) {
      if (err) {
        logger.error(err)
        return callback(err);
      }
      if (!ret) {
        async.auto({
          getDataToCache: (next) => {
            options.chartService.history(options.params, next)
          }
        }, (err, res) => {
          if (err) {
            logger.error(err);
            return callback(err);
          }

          //add to cache with rateType = sell and time 60
          if (options.conditionCreateCache) {
            RedisCache.setAsync(options.key_cache, JSON.stringify(res.getDataToCache), options.time_exprire, function (err, rett) {
              if (err) {
                logger.info(err)
                callback(err)
              }
              logger.info("create key " + options.key_cache + " on redis " + rett)
            });
          }
          return callback(null, res.getDataToCache)
        });
      } else {
        return callback(null, JSON.parse(ret));
      }
    });
  }
});