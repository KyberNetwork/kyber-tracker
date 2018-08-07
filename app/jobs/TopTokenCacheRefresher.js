const _ = require('lodash');
const BaseJob = require('./BaseJob');
const CacheInfo = require('../../config/cache/info');

class TopTokenCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    const date = new Date();
    const nowInMs = date.getTime();
    const nowInSeconds = Math.floor(nowInMs / 1000);
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const toDate = nowInSeconds;
    const fromDate = nowInSeconds - DAY_IN_SECONDS;
    let key = `${CacheInfo.TopTokensList.key}${Math.floor(fromDate / 60)}-${Math.floor(toDate / 60)}`;
    options.cache.name = key;
    options.params.fromDate = fromDate;
    options.params.toDate = toDate;
    callback(null, options)
  }
};
module.exports = TopTokenCacheRefresher;
