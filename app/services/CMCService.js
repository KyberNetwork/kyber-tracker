/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _             = require('lodash');
const async         = require('async');
const BigNumber     = require('bignumber.js');
const request       = require('superagent');
const Const         = require('../common/Const');
const network       = require('../../config/network');
const Utils         = require('sota-core').load('util/Utils');
const Paginator2    = require('sota-core').load('util/Paginator2');
const BaseService   = require('sota-core').load('service/BaseService');
const LocalCache    = require('sota-core').load('cache/foundation/LocalCache');
const logger        = require('sota-core').getLogger('CMCService');

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
        LocalCache.setSync(key, price);
        return callback(null, price);
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

        LocalCache.setSync(key, result);
        return callback(null, result);
      });
  },

});
