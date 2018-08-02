const _ = require('lodash');
const async = require('async');
const network = require('../../config/network');
const logger = require('sota-core').getLogger('HistoryCacheRefresher');
const ExSession = require('sota-core').load('common/ExSession');
const CacheInfo = require('../../config/cache/info');
const helper = require('../common/Utils');
const BaseJob = require('./BaseJob');

const tokens = network.tokens;

class HistoryCacheRefresher extends BaseJob {
  constructor() {
    super();
  }

  executeJob(callback) {
    if (!tokens) return callback(null, {});
    let pairs = {};
    const chartService = new ExSession().getService('ChartService');
    const redisCacheService = new ExSession().getService('RedisCacheService');
    const nowInMs = Date.now();
    const nowInSeconds = Math.floor(nowInMs / 1000);
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const day31Ago = nowInSeconds - 31 * DAY_IN_SECONDS;

    const time_exprire = CacheInfo.chart_history_1h.timeMnsTool;


    Object.keys(tokens).map(token => {
      if ((token.toUpperCase() !== "ETH") &&
        !tokens[token].delisted &&
        helper.shouldShowToken(token)) {
        const params = {
          symbol: token,
          rateType: 'sell',
          resolution: '60',
          from: day31Ago,
          to: nowInSeconds
        };
        let conditionCreateCache = false;
        if (params.rateType === 'sell' && params.resolution === '60') {
          conditionCreateCache = true;
        }
        const minutes = Math.floor(params.to / 600)

        const key_cache = CacheInfo.chart_history_1h.key + params.symbol + minutes;

        pairs[token] = (asyncCallback) => redisCacheService._process_chart_history({
          chartService: chartService,
          token: token,
          params: params,
          time_exprire: time_exprire,
          conditionCreateCache: conditionCreateCache,
          key_cache: key_cache
        }, asyncCallback);
      }
    })
    async.auto(pairs, 10, callback);
  }
};
module.exports = HistoryCacheRefresher;
