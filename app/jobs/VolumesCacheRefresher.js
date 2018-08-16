const _ = require('lodash');
const CacheInfo = require('../../config/cache/info');
const BaseJob = require('./BaseJob');

class VolumesCacheRefresher extends BaseJob {
  constructor() {
    super();
  }
  setCacheOptions(options, callback) {
    const params = options.params;
    const interval = params.interval || 'H1';
    const period = params.period || 'D7';
    let key = `${CacheInfo.NetworkVolumes.key + period}-${interval}`;
    if (params.symbol) {
      key = params.symbol + '-' + key;
    }
    if (params.fromDate) {
      key = params.fromDate + '-' + key;
    }
    if (params.toDate) {
      key = params.toDate + '-' + key;
    }
    options.cache.name = key;
    callback(null, options)
  }
};
module.exports = VolumesCacheRefresher;
