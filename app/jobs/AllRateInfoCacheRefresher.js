const _ = require('lodash');
const BaseJob = require('./BaseJob');

class AllRateInfoCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    callback(null, options)
  }
};
module.exports = AllRateInfoCacheRefresher;
