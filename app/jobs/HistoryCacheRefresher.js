const _ = require('lodash');
const CacheInfo = require('../../config/cache/info');
const BaseJob = require('./BaseJob');

class HistoryCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    const nowInMs = Date.now();
    const nowInSeconds = Math.floor(nowInMs / 1000);
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const day31Ago = nowInSeconds - 31 * DAY_IN_SECONDS;
    const minutes_to = Math.floor(nowInSeconds / 600);
    const key = CacheInfo.chart_history_1h.key + minutes_to.toString();
    options.cache.name = key;
    callback(null, options)
  }
};
module.exports = HistoryCacheRefresher;
