const _ = require('lodash');
const BaseJob = require('./BaseJob');

class Stats24hCacheRefresher extends BaseJob {
  constructor() {
    super();
  };
  setCacheOptions(options, callback) {
    callback(null, options)
  }
};
module.exports = Stats24hCacheRefresher;
