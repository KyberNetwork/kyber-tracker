/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _             = require('lodash');
const async         = require('async');
const BigNumber     = require('bignumber.js');
const Const         = require('../common/Const');
const Utils         = require('sota-core').load('util/Utils');
const Paginator2    = require('sota-core').load('util/Paginator2');
const BaseService   = require('sota-core').load('service/BaseService');
const LocalCache    = require('sota-core').load('cache/foundation/LocalCache');
const logger        = require('sota-core').getLogger('TradeService');

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

  getStats24h: function (callback) {
    const key = 'stats24h';
    const cachedData = LocalCache.getSync(key);
    if (cachedData) {
      return callback(null, cachedData);
    }

    const KyberTradeModel = this.getModel('KyberTradeModel');
    const CMCService = this.getService('CMCService');
    const nowInSeconds = Utils.nowInSeconds();
    const DAY_IN_SECONDS = 24 * 60 * 60;

    async.auto({
      volumeBuy: (next) => {
        KyberTradeModel.sum('taker_token_amount', {
          where: 'taker_token_symbol = ? AND block_timestamp > ?',
          params: ['ETH', nowInSeconds - DAY_IN_SECONDS],
        }, next);
      },
      volumeSell: (next) => {
        KyberTradeModel.sum('maker_token_amount', {
          where: 'maker_token_symbol = ? AND block_timestamp > ?',
          params: ['ETH', nowInSeconds - DAY_IN_SECONDS],
        }, next);
      },
      ethPrice: (next) => {
        CMCService.getCurrentPrice('ETH', next);
      },
      kncPrice: (next) => {
        CMCService.getCurrentPrice('KNC', next);
      },
      tradeCount: (next) => {
        KyberTradeModel.count({
          where: 'block_timestamp > ?',
          params: [nowInSeconds - DAY_IN_SECONDS]
        }, next);
      },
      fee: (next) => {
        KyberTradeModel.sum('taker_fee', {
          where: 'block_timestamp > ?',
          params: [nowInSeconds - DAY_IN_SECONDS]
        }, next);
      }
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      const volBuy = new BigNumber(ret.volumeBuy.toString());
      const volSell = new BigNumber(ret.volumeSell.toString());
      const volumeInETH = volBuy.plus(volSell).div(Math.pow(10, 18));
      const volumeInUSD = volumeInETH.times(ret.ethPrice);
      const feeInKNC = new BigNumber(ret.fee.toString()).div(Math.pow(10, 18));
      const feeInUSD = feeInKNC.times(ret.kncPrice);
      const result = {
        networkVolume: '$' + volumeInUSD.toFormat(2).toString(),
        networkFee: '$' + feeInUSD.toFormat(2).toString(),
        tradeCount: ret.tradeCount
      };

      LocalCache.setSync(key, result);

      return callback(null, result);
    });
  },

  getNetworkVolumes: function (params, callback) {
    // TODO: Implement me.
    const KyberTradeModel = this.getModel('KyberTradeModel');

    KyberTradeModel.sumGroupBy('volume_eth/1000000000000000000', {
      groupBy: ['hour_seq']
    }, callback);
  },

});
