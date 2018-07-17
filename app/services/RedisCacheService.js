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

  _process_chart_history1h: function (options, callback) {
    if (!options.token || !tokens[options.token]) {
      return callback("token not supported")
    }
    var this_ = this;

    // logger.info(options.params.from, options.params.to)
    options.params.seqType = Resolution.toColumn(options.params.resolution);

    // key 10'
    const minutes = Math.floor(options.params.to / 600)

    const key_cache = "chart_history_1h_" + options.params.symbol + minutes;
    this_.getCacheByKey({
      key_cache: key_cache
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
          options.data = res.getDataToCache;

          //add to cache with rateType = sell and time 60
          if (options.params.rateType === 'sell' && options.params.resolution === '60') {
            this_.setCacheByKey({
              key_cache: key_cache,
              data: res.getDataToCache,
              time_exprire: options.time_exprire
            }, function (err, res_1) {
              if (err) {
                logger.info(err)
                callback(err)
              }
              logger.info("create key " + key_cache + " on redis " +res_1)
            });
          }
          return callback(null, options.data)
        });
      } else {
        return callback(null, JSON.parse(ret));
      }
    });
  }
});