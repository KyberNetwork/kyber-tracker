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

module.exports = BaseService.extends({
  classname: 'CurrenciesService',

  getConvertiblePairs: function (callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');

    let whereClauses = '1=1';
    let params = [];

    // if (options.symbol) {
    //   whereClauses += ' AND (taker_token_symbol = ? OR maker_token_symbol = ?)';
    //   params.push(options.symbol);
    //   params.push(options.symbol);
    // }

    // if (options.fromDate) {
    //   whereClauses += ' AND block_timestamp > ?';
    //   params.push(options.fromDate);
    // }

    // if (options.toDate) {
    //   whereClauses += ' AND block_timestamp < ?';
    //   params.push(options.toDate);
    // }

    const queryOptions = {
      where: whereClauses,
      params: params,
      limit: options.limit,
      offset: options.page * options.limit,
      orderBy: 'id DESC'
    };

    async.auto({
      list: (next) => {
        KyberTradeModel.find(queryOptions, next);
      },
      count: (next) => {
        KyberTradeModel.count({
          where: whereClauses,
          params: params
        }, next);
      }
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      return callback(null, {
        data: ret.list,
        // pagination: {
        //   page: options.page,
        //   limit: options.limit,
        //   totalCount: ret.count,
        //   maxPage: Math.ceil(ret.count / options.limit)
        // }
      });
    });
  }

});
