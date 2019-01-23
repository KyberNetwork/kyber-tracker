/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _ = require('lodash');
const async = require('async');
const BigNumber = require('bignumber.js');
const request = require('superagent');
const Const = require('../common/Const');
const network = require('../../config/network');
const Utils = require('sota-core').load('util/Utils');
const BaseService = require('sota-core').load('service/BaseService');
const logger = require('sota-core').getLogger('CMCService');
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');
const CacheInfo = require('../../config/cache/info');
const CMC_GRAPH_API_TICKER = 300 * 1000; // 5 minutes in milliseconds

module.exports = BaseService.extends({
  classname: 'CMCService',

  getCurrentPrice: function (address, callback) {
    const key = CacheInfo.CmcCurrentPrice.key + address;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        return callback(null, ret);
      }
      if (!address || typeof address !== 'string') {
        return callback(`Cannot get price of invalid address: ${address}`);
      }

      const tokenInfo = global.TOKENS_BY_ADDR[address];
      if (!tokenInfo) {
        return callback(`Cannot find token info of address: ${address}`);
      }

      request
        .get(`https://api.coinmarketcap.com/v2/ticker/${tokenInfo.cmcIdv2}/`)
        .timeout({
          response: 5000,  // Wait 5 seconds for the server to start sending,
          deadline: 60000, // but allow 1 minute for the file to finish loading.
        })
        .end((err, response) => {
          if (err) {
            console.log(err)
            return callback(err);
          }
          let price;
          try {
            price = parseFloat(response.body.data.quotes.USD.price);
          } catch (e) {
            return callback(e);
          }

          logger.debug(`Current price of [${address}] is: $${price}`);
          RedisCache.setAsync(key, price, CacheInfo.CmcCurrentPrice.TTL);
          return callback(null, price);
        });
    });
  },

  getAllRates: function (callback) {
    const key = CacheInfo.CmcAllRates.key;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        const body = JSON.parse(ret);
        body.getRate = function (source, dest) {
          let rate = this.data.filter(x => {
            return x.source === source && x.dest === dest;
          });

          if (!rate || !rate.length) return 0;

          return new BigNumber(rate[0].rate).div(Math.pow(10, 18)).toNumber();
        };
        return callback(null, body);
      }
      request
        .get(network.endpoints.getRate || `https://production-cache.kyber.network/getRate`)
        .timeout({
          response: 5000,  // Wait 5 seconds for the server to start sending,
          deadline: 60000, // but allow 1 minute for the file to finish loading.
        })
        .end((err, response) => {
          if (err) {
            return callback(err);
          }

          if (!response || !response.body || !response.body.data || !response.body.data.length) {
            return callback("Cannot get rate from production cache.");
          }

          const body = response.body;
          body.getRate = function (source, dest) {
            let rate = this.data.filter(x => {
              return x.source === source && x.dest === dest;
            });

            if (!rate || !rate.length) return 0;

            return new BigNumber(rate[0].rate).div(Math.pow(10, 18)).toNumber();
          };

          RedisCache.setAsync(key, JSON.stringify(body), CacheInfo.CmcAllRates.TTL);

          return callback(null, body);
        });
    });
  },

  getCurrentRate: function (address, base, callback) {
    const key = CacheInfo.CmcCurrentRate.key + address;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        return callback(null, JSON.parse(ret));
      }
      if (!address || typeof address !== 'string') {
        return callback(`Cannot get price of invalid address: ${address}`);
      }

      if (!base || typeof base !== 'string') {
        return callback(`Cannot get price of invalid base: ${base}`);
      }

      const tokenInfo = global.TOKENS_BY_ADDR[address];
      if (!tokenInfo) {
        return callback(`Cannot find token info of address: ${address}`);
      }
      request
        .get(network.endpoints.getRate || `https://production-cache.kyber.network/getRate`)
        .timeout({
          response: 5000,  // Wait 5 seconds for the server to start sending,
          deadline: 60000, // but allow 1 minute for the file to finish loading.
        })
        .end((err, response) => {
          if (err) {
            return callback(err);
          }

          if (!response || !response.body || !response.body.data || !response.body.data.length) {
            return callback("cannot get response data");
          }

          let rateData = response.body.data.filter(x => {
            return x.source === address && x.dest === base
          });

          if (!rateData || !rateData.length) {
            return callback(null, {rate: 0});
          }

          if (rateData[0].rate) {
            RedisCache.setAsync(key, JSON.stringify(rateData[0]), CacheInfo.CmcCurrentRate.TTL);
          }
          return callback(null, rateData[0]);
        });
    });
  },

  getPriceOfAllTokens: function (callback) {
    const tokenAddresses = _.keys(global.TOKENS_BY_ADDR);
    const result = {};

    async.forEach(tokenAddresses, (address, next) => {
      this.getCurrentPrice(address, (err, price) => {
        if (err) {
          return next(err);
        }

        result[address] = price;
        return next(null, null);
      });
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      return callback(null, result);
    });

  },

  getCMCTokenInfo: function (address, callback) {
    const key = CacheInfo.CMCTokenInfo.key + address;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        return callback(null, JSON.parse(ret));
      }
      if (!address || typeof address !== 'string') {
        return callback(`Cannot get config of invalid address: ${address}`);
      }

      const tokenInfo = global.TOKENS_BY_ADDR[address];
      if (!tokenInfo) {
        return callback(`Cannot find token config of address: ${address}`);
      }

      request
        .get(`https://api.coinmarketcap.com/v2/ticker/${tokenInfo.cmcIdv2}/`)
        .timeout({
          response: 5000,  // Wait 5 seconds for the server to start sending,
          deadline: 60000, // but allow 1 minute for the file to finish loading.
        })
        .end((err, response) => {
          if (err) {
            return callback(err);
          }

          const result = response.body.data;

          RedisCache.setAsync(key, JSON.stringify(result), CacheInfo.CMCTokenInfo.TTL);
          return callback(null, result);
        });
    });
  },

  getETHCoingeckoHistoryPrice: function(date, callback){
    // logger.info(`_getHistoricalPrice ` + cgId);
    // if (!cgId || typeof cgId !== 'string') {
    //   return callback(`Cannot get historical price of invalid: ${cgId}`);
    // }

    // const tokenInfo = global.TOKENS_BY_ADDR[address];
    // if (!tokenInfo) {
    //   return callback(`Cannot find token info of address: ${address}`);
    // }

    // if(!tokenInfo.cgId){
    //   return callback(`Token ${address} dont have coigecko id`);
    // }

    this._getCoingeckoHistoryPrice(network.ETH.cgId, date, callback)
  },
  
  _getCoingeckoHistoryPrice: function(cgId, date, callback){
    

    request
      .get(`https://api.coingecko.com/api/v3/coins/${cgId}/history?date=${date}`)
      .timeout({
        response: 5000,  // Wait 5 seconds for the server to start sending,
        deadline: 60000, // but allow 1 minute for the file to finish loading.
      })
      .end((err, response) => {
        if (err) {
          return callback(err);
        }

        const result = {};

        try {
          const data = response.body;

          result.current_price= data.market_data.current_price.usd
          result.market_cap= data.market_data.market_cap.usd
          result.total_volume= data.market_data.total_volume.usd
          

          result.price_usd = result.current_price;
        } catch (e) {
          // Tried more than 3 times. It's failed.
          return callback(`Cannot get price of [${cgId}] at [${date}]`);
        }

        logger.debug(`Price of [${cgId}] at [${date}] is: $${result.price_usd}`);
        return callback(null, result);
      });

  },


  getHistoricalPrice: function (address, timeInMillis, callback) {
    if (!address || typeof address !== 'string') {
      return callback(`Cannot get historical price of invalid address: ${address}`);
    }

    const tokenInfo = global.TOKENS_BY_ADDR[address];
    if (!tokenInfo) {
      return callback(`Cannot find token info of address: ${address}`);
    }

    const fromTime = timeInMillis - CMC_GRAPH_API_TICKER;
    const toTime = timeInMillis + CMC_GRAPH_API_TICKER;

    this._getHistoricalPrice(tokenInfo, fromTime, toTime, callback);
  },

  _getHistoricalPrice: function (tokenInfo, fromTime, toTime, callback) {
    logger.debug(`_getHistoricalPrice tokenInfo=` + JSON.stringify(tokenInfo));
    const address = tokenInfo.address;
    const cmcId = tokenInfo.cmcId;
    const timeInMillis = (fromTime + toTime) / 2;

    if (!cmcId) {
      return callback(`_getHistoricalPrice invalid tokenInfo: ` + JSON.stringify(tokenInfo));
    }

    request
      .get(`https://graphs2.coinmarketcap.com/currencies/${cmcId}/${fromTime}/${toTime}`)
      .timeout({
        response: 5000,  // Wait 5 seconds for the server to start sending,
        deadline: 60000, // but allow 1 minute for the file to finish loading.
      })
      .end((err, response) => {
        if (err) {
          return callback(err);
        }

        const result = {};

        try {
          const data = response.body;
          if (address === 'BTC_address') {
            result.price_btc = 1;
          } else {
            result.price_btc = data.price_btc[0][1];
          }

          if (address === network.ETH.address) {
            result.price_eth = 1;
          } else {
            result.price_eth = data.price_platform[0][1];
          }

          result.price_usd = data.price_usd[0][1];
        } catch (e) {
          // Tried more than 3 times. It's failed.
          if (toTime - fromTime > 10 * CMC_GRAPH_API_TICKER) {
            return callback(`Cannot get price of [${address}] at [${timeInMillis}]`);
          }

          return this._getHistoricalPrice(tokenInfo, fromTime - CMC_GRAPH_API_TICKER, toTime + CMC_GRAPH_API_TICKER, callback);
        }

        logger.debug(`Price of [${cmcId}] at [${timeInMillis}] is: $${result.price_usd}`);
        return callback(null, result);
      });


  },

});
