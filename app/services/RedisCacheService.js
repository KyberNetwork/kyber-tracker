const _ = require('lodash');
const async = require('async');
const logger = require('sota-core').getLogger('RedisCacheService');
const BaseService = require('sota-core').load('service/BaseService');
// const Resolution = require('../common/Resolution');
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');

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
});
