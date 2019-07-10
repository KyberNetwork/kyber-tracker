const _ = require('lodash');
const BaseJob = require('./BaseJob');

 class InDayTradingViewCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    callback(null, options)
  }
};
module.exports = InDayTradingViewCacheRefresher;