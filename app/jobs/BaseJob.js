const _ = require('lodash');
const async = require('async');
const logger = require('sota-core').getLogger('BaseJob');
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');
const ExSession = require('sota-core').load('common/ExSession');

class BaseJob {

  start(options) {
    const exSession = new ExSession();
    async.auto({
      process: (next) => {
        this.setCacheOptions(options, next);
      },
      execute: ['process', (ret, next) => {
        options = ret.process;
        this.executeService(options, exSession, next);
      }]
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(`Finish Job  ${options.run}...`);
      }
      exSession.destroy();
      logger.info(`Job ${options.run} will be restart in ${options.when}`);
    });
  };

  setCacheOptions() {
    throw new Error('Implement me.');
  };

  executeService(options, exSession, callback) {
    if (options.service === null || options.functionName === null || options.cache === null) {
      callback("can't run job with service")
    }
    const service = exSession.getService(options.service);
    if(!options.setCache){
      options.params.cache = options.cache;
    }
    service[options.functionName](options.params, (err, ret) => {
      if (err) {
        logger.error(err);
        callback(err);
      }
      if (ret && options.setCache) {
        RedisCache.setAsync(options.cache.name, JSON.stringify(ret), options.cache.time_exprire);
      }
      callback(null, ret);
    });
  }

}

module.exports = BaseJob;
