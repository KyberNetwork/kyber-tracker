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
const logger        = require('sota-core').getLogger('CMCService');

module.exports = BaseService.extends({
  classname: 'CMCService',

  getCurrentPrice: function(symbol, callback) {
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

        return callback(null, price);
      });
  },

});
