/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _             = require('lodash');
const async         = require('async');
const Utils         = require('sota-core').load('util/Utils');
const Paginator2    = require('sota-core').load('util/Paginator2');
const BaseService   = require('sota-core').load('service/BaseService');

module.exports = BaseService.extends({
  classname: 'TradeService',

  getTradesList: function (params, pagination, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    // TODO: filter by time/token/address,...
    const queryOptions = {
      limit: pagination.limit,
      offset: pagination.offset,
      orderBy: 'id DESC'
    };

    KyberTradeModel.find(queryOptions, (err, ret) => {
      if (err) {
        return callback(err);
      }

      return callback(null, {
        data: ret,
        pagination: pagination
      });
    });
  },

  getTradesList2: function (params, pagination, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    // TODO: filter by time/token/address,...
    const queryOptions = {};

    Paginator2.find(KyberTradeModel, queryOptions, pagination, callback);
  },

  getTradeDetails: function (tradeId, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    KyberTradeModel.findOne(tradeId, callback);
  },

});
