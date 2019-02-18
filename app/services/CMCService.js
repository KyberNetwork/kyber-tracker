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

  getCurrentPrice: function (symbol, callback) {
    const key = CacheInfo.CmcCurrentPrice.key + symbol;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        return callback(null, ret);
      }
      if (!symbol || typeof symbol !== 'string') {
        return callback(`Cannot get price of invalid symbol: ${symbol}`);
      }

      const tokenInfo = network.tokens[symbol];
      if (!tokenInfo) {
        return callback(`Cannot find token info of symbol: ${symbol}`);
      }

      request
        .get(`https://api.coinmarketcap.com/v1/ticker/${tokenInfo.cmcId}/`)
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
            price = parseFloat(response.body[0].price_usd);
          } catch (e) {
            return callback(e);
          }

          logger.debug(`Current price of [${symbol}] is: $${price}`);
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

  getCurrentRate: function (symbol, base, callback) {
    const key = CacheInfo.CmcCurrentRate.key + symbol;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        return callback(null, JSON.parse(ret));
      }
      if (!symbol || typeof symbol !== 'string') {
        return callback(`Cannot get price of invalid symbol: ${symbol}`);
      }

      if (!base || typeof base !== 'string') {
        return callback(`Cannot get price of invalid base: ${base}`);
      }

      const tokenInfo = network.tokens[symbol];
      if (!tokenInfo) {
        return callback(`Cannot find token info of symbol: ${symbol}`);
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
            return x.source === symbol && x.dest === base
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
    const tokenSymbols = _.keys(network.tokens);
    const result = {};

    async.forEach(tokenSymbols, (symbol, next) => {
      this.getCurrentPrice(symbol, (err, price) => {
        if (err) {
          return next(err);
        }

        result[symbol] = price;
        return next(null, null);
      });
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      return callback(null, result);
    });

  },

  getCMCTokenInfo: function (symbol, callback) {
    const key = CacheInfo.CMCTokenInfo.key + symbol;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        return callback(null, JSON.parse(ret));
      }
      if (!symbol || typeof symbol !== 'string') {
        return callback(`Cannot get config of invalid symbol: ${symbol}`);
      }

      const tokenInfo = network.tokens[symbol];
      if (!tokenInfo) {
        return callback(`Cannot find token config of symbol: ${symbol}`);
      }

      request
        .get(`https://api.coinmarketcap.com/v1/ticker/${tokenInfo.cmcId}/`)
        .timeout({
          response: 5000,  // Wait 5 seconds for the server to start sending,
          deadline: 60000, // but allow 1 minute for the file to finish loading.
        })
        .end((err, response) => {
          if (err) {
            return callback(err);
          }

          const result = response.body[0];

          RedisCache.setAsync(key, JSON.stringify(result), CacheInfo.CMCTokenInfo.TTL);
          return callback(null, result);
        });
    });
  },

  getHistoricalPrice: function (symbol, timeInMillis, callback) {
    if (!symbol || typeof symbol !== 'string') {
      return callback(`Cannot get historical price of invalid symbol: ${symbol}`);
    }

    const tokenInfo = network.tokens[symbol];
    if (!tokenInfo) {
      return callback(`Cannot find token info of symbol: ${symbol}`);
    }

    const fromTime = timeInMillis - CMC_GRAPH_API_TICKER;
    const toTime = timeInMillis + CMC_GRAPH_API_TICKER;

    this._getHistoricalPrice(tokenInfo, fromTime, toTime, callback);
  },

  _getHistoricalPrice: function (tokenInfo, fromTime, toTime, callback) {
    logger.debug(`_getHistoricalPrice tokenInfo=` + JSON.stringify(tokenInfo));
    const symbol = tokenInfo.symbol;
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
          if (symbol === 'BTC') {
            result.price_btc = 1;
          } else {
            result.price_btc = data.price_btc[0][1];
          }

          if (symbol === 'ETH') {
            result.price_eth = 1;
          } else {
            result.price_eth = data.price_platform[0][1];
          }

          result.price_usd = data.price_usd[0][1];
        } catch (e) {
          // Tried more than 3 times. It's failed.
          if (toTime - fromTime > 10 * CMC_GRAPH_API_TICKER) {
            return callback(`Cannot get price of [${symbol}] at [${timeInMillis}]`);
          }

          return this._getHistoricalPrice(tokenInfo, fromTime - CMC_GRAPH_API_TICKER, toTime + CMC_GRAPH_API_TICKER, callback);
        }

        logger.debug(`Price of [${cmcId}] at [${timeInMillis}] is: $${result.price_usd}`);
        return callback(null, result);
      });
  },

  getEthPrice: function (timeInMillis, callback){
    if(!timeInMillis){
      return callback(`Cannot find time in miliseconds`)
    }

    const jsDate = new Date(timeInMillis)
    const day = jsDate.getDate()
    const month = jsDate.getMonth() + 1
    const year = jsDate.getFullYear()
    const dateString = day + '-' + month + '-' + year

    const key = CacheInfo.CoingeckoETHPrice.key + dateString;
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        return callback(null, JSON.parse(ret));
      }

      this._getEthPriceFromCoinGecko(dateString, (err, result) => {
        if(err) return callback(err)

        RedisCache.setAsync(key, JSON.stringify(result), CacheInfo.CoingeckoETHPrice.TTL);
        return callback(null, result);
      })
    })
  },

  _getEthPriceFromCoinGecko: function(dateString, callback){

    request
      .get(`https://api.coingecko.com/api/v3/coins/ethereum/history?date=${dateString}`)
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
          return callback(`Cannot get ether price at [${dateString}]`);
        }

        // logger.debug(`Price of ethereum at [${dateString}] is: $${result.price_usd}`);
        logger.debug(`************ eth price at date ${dateString} is ${result.price_usd}`)
        return callback(null, result);
      });
  }




});
