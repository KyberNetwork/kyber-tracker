/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _ = require('lodash');
const async = require('async');
const util = require('util');
const BigNumber = require('bignumber.js');
const network = require('../../config/network');
const Const = require('../common/Const');
const Utils = require('sota-core').load('util/Utils');
const BaseService = require('sota-core').load('service/BaseService');
const LocalCache = require('sota-core').load('cache/foundation/LocalCache');
const logger = require('sota-core').getLogger('CurrenciesService');

const tokens = network.tokens;

module.exports = BaseService.extends({
  classname: 'CurrenciesService',

  getConvertiblePairs: function (callback) {
    if(!tokens) return callback(null, {});

    let pairs = {}

    Object.keys(tokens).map(token => {
      if(token.toUpperCase() !== "ETH"){
        pairs[token] = "ETH"
        pairs[token + "ETH"] = "ETH"
      }
    })

    return callback(null, {
      data: pairs,
    });
  },

  getCurrencyInfo: function (options, callback) {
    if(!options.token || !tokens[options.token]){
      return callback("token not supported")
    }

    if(!options.fromCurrencyCode || !tokens[options.fromCurrencyCode]){
      return callback("base not supported")
    }

    let tokenSymbol = options.token
    let base = options.fromCurrencyCode
    let tokenData = tokens[tokenSymbol]

    const KyberTradeModel = this.getModel('KyberTradeModel');
    const CMCService = this.getService('CMCService');
    const nowInSeconds = Utils.nowInSeconds();
    const DAY_IN_SECONDS = 24 * 60 * 60;

    async.auto({
      volumeBuy: (next) => {
        KyberTradeModel.sum('taker_total_usd', {
          where: 'taker_token_symbol = ? AND block_timestamp > ?',
          params: [tokenSymbol, nowInSeconds - DAY_IN_SECONDS],
        }, next);
      },
      volumeSell: (next) => {
        KyberTradeModel.sum('maker_total_usd', {
          where: 'maker_token_symbol = ? AND block_timestamp > ?',
          params: [tokenSymbol, nowInSeconds - DAY_IN_SECONDS],
        }, next);
      },
      price: (next) => {
        CMCService.getCurrentRate(tokenSymbol, base, next);
      },
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      const volume24h = new BigNumber(ret.volumeBuy).plus(new BigNumber(ret.volumeSell))
      const currentPrice = ret.price ? new BigNumber(ret.price.rate.toString()).div(Math.pow(10, tokenData.decimal)) : null
      return callback( null , {
        "name": tokenData.name,
        "symbol": tokenData.symbol,
        "code": tokenData.symbol,
        "decimals": tokenData.decimal,
        price: currentPrice.toNumber(),
        volume24h: volume24h.toNumber(),
        price24h: null,

      })
    })
  }

});
