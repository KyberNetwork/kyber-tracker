/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _ = require('lodash');
const async = require('async');
const util = require('util');
const BigNumber = require('bignumber.js');
const network = require('../../config/network');
const Const = require('../common/Const');
const helper = require('../common/Utils');
const Utils = require('sota-core').load('util/Utils');
const BaseService = require('sota-core').load('service/BaseService');
const logger = require('sota-core').getLogger('CurrenciesService');
const Resolution              = require('../common/Resolution');
const tokens = network.tokens;
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');
const CacheInfo = require('../../config/cache/info');

module.exports = BaseService.extends({
    classname: 'ChartService',

    chart_history_all: function(options, callback) {
      if (!tokens) return callback(null, {});
      const nowInMs = Date.now();
      const nowInSeconds = Math.floor(nowInMs / 1000);
      const DAY_IN_SECONDS = 24 * 60 * 60;
      const day31Ago = nowInSeconds - 31 * DAY_IN_SECONDS;
      let pairs = {};
      Object.keys(tokens).map(token => {
        if ((token.toUpperCase() !== "ETH") &&
          !tokens[token].delisted &&
          helper.shouldShowToken(token)) {
          const params = {
            symbol: token,
            rateType: options.rateType,
            resolution: options.resolution,
            from: day31Ago,
            to: nowInSeconds,
            seqType: Resolution.toColumn(options.resolution)
          };
          pairs[token] = (asyncCallback) => this.history(params, asyncCallback);
        }
      });
      async.auto(pairs, 10, (err, pairs)=>{
        if(err){
          callback(err)
        }
        Object.entries(pairs).forEach(([key, value]) => {
          const cache_key = options.cache.name + key;
          RedisCache.setAsync(cache_key, JSON.stringify(value), options.cache.time_exprire);
        });
        callback(err, pairs);
      });
    },

    // options: symbol, rateType, seqType, from, to
    history: function (options, callback) {
        if(!options.symbol || !tokens[options.symbol]){
            return callback("token not supported")
        }
        const col = options.rateType + "_expected";
        const seqCol = options.seqType || "hour_req";

        const rawQuery = `select
            ${seqCol} as seq,
            MAX(${col}) as high,
            MIN(${col}) as low,
            SUBSTRING_INDEX(GROUP_CONCAT(CAST(${col} AS CHAR) ORDER BY block_number ASC SEPARATOR ';'), ';', 1 ) as open,
            SUBSTRING_INDEX(GROUP_CONCAT(CAST(${col} AS CHAR) ORDER BY block_number DESC SEPARATOR ';'), ';', 1 ) as close
            from rate
            where ${col} > 0 AND quote_symbol = ?
            AND block_timestamp >= ? AND block_timestamp <= ?
            group by ${seqCol}`;

        const params = [options.symbol, options.from, options.to];

        // From any model, get adapter to connect database
        // Use master adapter for writing data, and slave for reading
        const adapter = this.getModel('RateModel').getSlaveAdapter();
        // Execute the raw query
        async.auto({
            history: (next) => {
                adapter.execRaw(rawQuery, params, next);
            }
          },(err, ret) => {
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
              if (ret.history.length === 0) {
                data.s = "no_data";
              } else {
                data.s = "ok";
                ret.history.forEach((value) => {
                  if (value.seq == 0) return;
                  data.t.push(Resolution.toTimestamp(options.resolution, value.seq));
                  data.o.push(parseFloat(value.open));
                  data.h.push(value.high);
                  data.l.push(value.low);
                  data.c.push(parseFloat(value.close));
                });
              }
              return callback( null , data);
          })
    },

    klines: function (options, callback) {
      if(!options.symbol || !tokens[options.symbol]){
        return callback("token not supported")
      }
      const col = options.rateType + "_expected";
      const seqCol = options.seqType || "hour_req";

      const rawQuery = `select
              SUBSTRING_INDEX(GROUP_CONCAT(CAST(${col} AS CHAR) ORDER BY block_number DESC SEPARATOR ';'), ';', 1 ) as close
              from rate
              where ${col} > 0 AND quote_symbol = ?
              AND block_timestamp >= ? AND block_timestamp <= ?
              group by ${seqCol}`;

      const params = [options.symbol, options.from, options.to];
      const adapter = this.getModel('RateModel').getSlaveAdapter();
      async.auto({
        history: (next) => {
          adapter.execRaw(rawQuery, params, next);
        }
      },(err, ret) => {
        if (err) {
          logger.error(err);
          return callback(err);
        };
        var data = [];
        ret.history.forEach((value) => {
          data.push(parseFloat(value.close));
        });
        return callback( null , data);
      })
    },
});
