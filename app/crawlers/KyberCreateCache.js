const _ = require('lodash');
const async = require('async');
const network = require('../../config/network');
const logger = require('sota-core').getLogger('KyberCreateCache');
const ExSession = require('sota-core').load('common/ExSession');
const Resolution = require('../common/Resolution');
const helper = require('../common/Utils');
const time_out = 10 * 60 * 1000;
const redis = require('redis');
const port = process.env.REDISPOST || 6379;
const host = process.env.REDISHOST || '127.0.0.1';
const client = redis.createClient(port, host);
client.on('error', (err) => {
  logger.error(err);
});
const tokens = network.tokens;

class KyberCreateCache {
  start() {
    async.auto({
      process: (next) => {
        this.process(next);
      },
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(`Finish Create Cache...`);
      }
      logger.info(`Create Cache will be restart in 10'`);
      setTimeout(() => {
        this.start();
      }, time_out);
    });
  };

  process(callback) {
    if (!tokens) return callback(null, {});
    Object.keys(tokens).map(token => {
      if ((token.toUpperCase() !== "ETH") &&
        !tokens[token].delisted &&
        helper.shouldShowToken(token)) {
        this._process({
          token: token
        }, callback);
      }
    })
    async.auto(null, 10, callback)
  }

  _process(options, callback) {
    if (!options.token || !tokens[options.token]) {
      return callback("token not supported")
    }

    const tokenSymbol = options.token
    const nowInMs = Date.now();
    const nowInSeconds = Math.floor(nowInMs / 1000);
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const day31Ago = nowInSeconds - 31 * DAY_IN_SECONDS;

    const params = {
      symbol: tokenSymbol,
      rateType: 'sell',
      resolution: '60',
      from: day31Ago,
      to: nowInSeconds
    }
    params.seqType = Resolution.toColumn(params.resolution);
    const date = new Date(params.to * 1000);
    const dateDetails = helper.getDateDetails(date);
    const minutes =  Math.floor(dateDetails.minutes / 10) * 10
    
    const key_cache = params.symbol + dateDetails.year + dateDetails.month + dateDetails.day + dateDetails.hour + minutes;
    const service = new ExSession().getService('ChartService');
    async.auto({
      addDataToCache: (next) => {
        service.history(params, (err, ret) => {
          if (err) {
            logger.error(err);
            return callback(err);
          }
          var data = {
            t: [],
            o: [],
            h: [],
            l: [],
            c: [],
          };
          if (ret.length === 0) {
            data.s = "no_data";
          } else {
            data.s = "ok";
            ret.forEach((value) => {
              if (value.seq == 0) return;
              data.t.push(Resolution.toTimestamp(params.resolution, value.seq));
              data.o.push(parseFloat(value.open));
              data.h.push(value.high);
              data.l.push(value.low);
              data.c.push(parseFloat(value.close));
            });
          }
          //add to cache with rateType = sell and time 60
          if (params.rateType === 'sell' && params.resolution === '60') {
            client.setex(key_cache, 15 * 60, JSON.stringify(data));
          }
        });
      }
    }, callback)
  };
}

module.exports = KyberCreateCache;