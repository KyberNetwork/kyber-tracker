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

  setCacheByKey: function (options, callback) {
    RedisCache.setAsync(options.key_cache, JSON.stringify(options.data), options.time_exprire, callback);
  },

  getCacheByKey: function (options, callback) {
    RedisCache.getAsync(options.key_cache, callback);
  },

  _process_chart_history: function (options, callback) {
    if (!options.token || !tokens[options.token]) {
      return callback("token not supported")
    }
    var this_ = this;

    // logger.info(options.params.from, options.params.to)
    options.params.seqType = Resolution.toColumn(options.params.resolution);

    this_.getCacheByKey({
      key_cache: options.key_cache
    }, function (err, ret) {
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
            this_.setCacheByKey({
              key_cache: options.key_cache,
              data: res.getDataToCache,
              time_exprire: options.time_exprire
            }, function (err, res_1) {
              if (err) {
                logger.info(err)
                callback(err)
              }
              logger.info("create key " + options.key_cache + " on redis " +res_1)
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