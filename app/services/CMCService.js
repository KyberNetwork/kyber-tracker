/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _             = require('lodash');
const async         = require('async');
const BigNumber     = require('bignumber.js');
const request       = require('superagent');
const Const         = require('../common/Const');
const network       = require('../../config/network');
const Utils         = require('sota-core').load('util/Utils');
const BaseService   = require('sota-core').load('service/BaseService');
const LocalCache    = require('sota-core').load('cache/foundation/LocalCache');
const logger        = require('sota-core').getLogger('CMCService');

const CMC_GRAPH_API_TICKER = 300 * 1000; // 5 minutes in milliseconds

module.exports = BaseService.extends({
  classname: 'CMCService',

  getCurrentPrice: function(symbol, callback) {
    const key = 'price-' + symbol;
    const cachedData = LocalCache.getSync(key);
    if (cachedData) {
      return callback(null, cachedData);
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
      .end((err, response) => {
        if (err) {
          return callback(err);
        }

        let price;
        try {
          price = parseFloat(response.body[0].price_usd);
        } catch (e) {
          return callback(e);
        }

        logger.debug(`Current price of [${symbol}] is: $${price}`);
        LocalCache.setSync(key, price, { ttl: Const.MINUTE_IN_MILLISECONDS });
        return callback(null, price);
      });
  },

  getCurrentRate: function (symbol, base, callback) {
    const key = 'price-' + symbol;
    const cachedData = LocalCache.getSync(key);

    if (cachedData) {
      return callback(null, cachedData);
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
      .get(`https://production-cache.kyber.network/getRate`)
      .end((err, response) => {
        if (err) {
          return callback(err);
        }

        if(!response || !response.body || !response.body.data || !response.body.data.length){
          return callback("cannot get response data");
        }

        let rateData = response.body.data.filter(x => {
          return x.source == symbol && x.dest == base
        })

        if(!rateData || !rateData.length || !rateData[0].rate){
          return callback(`Cannot get token rate: ${symbol}`);
        }

        logger.debug(`Current price of [${symbol}] is: $${rateData[0].rate}`);
        LocalCache.setSync(key, rateData[0], { ttl: Const.MINUTE_IN_MILLISECONDS });
        return callback(null, rateData[0]);
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
    const key = 'cmc-info-' + symbol;
    const cachedData = LocalCache.getSync(key);
    if (cachedData) {
      return callback(null, cachedData);
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
      .end((err, response) => {
        if (err) {
          return callback(err);
        }

        const result = response.body[0];

        LocalCache.setSync(key, result, { ttl: Const.MINUTE_IN_MILLISECONDS });
        return callback(null, result);
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

});
