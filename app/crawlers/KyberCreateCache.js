const _ = require('lodash');
const async = require('async');
const network = require('../../config/network');
const logger = require('sota-core').getLogger('KyberCreateCache');
const ExSession = require('sota-core').load('common/ExSession');

const Const = require('../common/Const');
const helper = require('../common/Utils');

const tokens = network.tokens;

class KyberCreateCache {
  start_chart_history_1h() {
    async.auto({
      process: (next) => {
        this.process_chart_history_1h(next);
      },
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(`Finish Create Cache Chart History 1h...`);
      }
      logger.info(`Create Cache Chart History 1h will be restart in 10'`);
    });
  };

  process_chart_history_1h(callback) {
    if (!tokens) return callback(null, {});
    let pairs = {}
    const chartService = new ExSession().getService('ChartService');
    const redisCacheService = new ExSession().getService('RedisCacheService');
    const nowInMs = Date.now();
    const nowInSeconds = Math.floor(nowInMs / 1000);
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const day31Ago = nowInSeconds - 31 * DAY_IN_SECONDS;
    
    const time_exprire = {
      ttl: 15 * 60 * 1000
    }
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
        }
        pairs[token] = (asyncCallback) => redisCacheService._process_chart_history1h({
          chartService: chartService,
          token: token,
          params: params,
          time_exprire: time_exprire
        }, asyncCallback);
      }
    })
    // return callback(null,pairs);
    async.auto(pairs, 10, callback)
  }

  
}

module.exports = KyberCreateCache;
