const _ = require('lodash');
const BaseJob = require('./BaseJob');

 class InMonthTradingViewCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    callback(null, options)
  }
};
module.exports = InMonthTradingViewCacheRefresher;