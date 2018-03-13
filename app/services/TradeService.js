/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _             = require('lodash');
const async         = require('async');
const BigNumber     = require('bignumber.js');
const network       = require('../../config/network');
const Const         = require('../common/Const');
const Utils         = require('sota-core').load('util/Utils');
const BaseService   = require('sota-core').load('service/BaseService');
const LocalCache    = require('sota-core').load('cache/foundation/LocalCache');
const logger        = require('sota-core').getLogger('TradeService');

module.exports = BaseService.extends({
  classname: 'TradeService',

  getTradesList: function (options, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');

    let whereClauses = '1=1';
    let params = [];

    if (options.symbol) {
      whereClauses += ' AND (taker_token_symbol = ? OR maker_token_symbol = ?)';
      params.push(options.symbol);
      params.push(options.symbol);
    }

    if (options.fromDate) {
      whereClauses += ' AND block_timestamp > ?';
      params.push(options.fromDate);
    }

    if (options.toDate) {
      whereClauses += ' AND block_timestamp < ?';
      params.push(options.toDate);
    }

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
        pagination: {
          page: options.page,
          limit: options.limit,
          totalCount: ret.count,
          maxPage: Math.ceil(ret.count/options.limit)
        }
      });
    });
  },

  getTradeDetails: function (tradeId, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    KyberTradeModel.findOne(tradeId, callback);
  },

  getTopTokensList: function (fromDate, toDate, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    const CMCService = this.getService('CMCService');

    async.auto({
      takerTrades: (next) => {
        KyberTradeModel.sumGroupBy('taker_token_amount', {
          where: 'block_timestamp > ? AND block_timestamp < ?',
          params: [fromDate, toDate],
          groupBy: ['taker_token_symbol']
        }, next);
      },
      makerTrades: (next) => {
        KyberTradeModel.sumGroupBy('maker_token_amount', {
          where: 'block_timestamp > ? AND block_timestamp < ?',
          params: [fromDate, toDate],
          groupBy: ['maker_token_symbol']
        }, next);
      },
      prices: (next) => {
        CMCService.getPriceOfAllTokens(next);
      }
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      const prices = ret.prices;
      const takerTrades = _.keyBy(ret.takerTrades, 'takerTokenSymbol');
      const makerTrades = _.keyBy(ret.makerTrades, 'makerTokenSymbol');
      const tokens = _.compact(_.map(network.tokens, (tokenConfig) => {
        const symbol = tokenConfig.symbol;

        let tokenVolume = new BigNumber(0);
        if (takerTrades[symbol]) {
          tokenVolume = tokenVolume.plus(new BigNumber(takerTrades[symbol].sum.toString()));
        }

        if (makerTrades[symbol]) {
          tokenVolume = tokenVolume.plus(new BigNumber(makerTrades[symbol].sum.toString()));
        }

        tokenVolume = tokenVolume.div(Math.pow(10, tokenConfig.decimal));

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          volumeToken: tokenVolume.toFormat(4).toString(),
          volumeUSD: tokenVolume.times(prices[symbol]).toNumber()
        };
      }));

      return callback(null, _.sortBy(tokens, (e) => {
        return -e.volumeUSD;
      }));
    });
  },

  getStats24h: function (callback) {
    const key = 'stats24h';
    const cachedData = LocalCache.getSync(key);
    if (cachedData) {
      return callback(null, cachedData);
    }

    const KyberTradeModel = this.getModel('KyberTradeModel');
    const BurnedFeeModel = this.getModel('BurnedFeeModel');
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
      kncInfo: (next) => {
        CMCService.getCMCTokenInfo('KNC', next);
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
      },
      totalBurnedFee: (next) => {
        BurnedFeeModel.sum('amount', {
          where: '1=1'
        }, next);
      },
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
      const totalBurnedFee = new BigNumber(ret.totalBurnedFee.toString()).div(Math.pow(10, 18));
      const result = {
        networkVolume: '$' + volumeInUSD.toFormat(2).toString(),
        networkFee: '$' + feeInUSD.toFormat(2).toString(),
        tradeCount: ret.tradeCount,
        kncInfo: ret.kncInfo,
        totalBurnedFee: totalBurnedFee.toFormat(2).toString(),
      };

      LocalCache.setSync(key, result);

      return callback(null, result);
    });
  },

  search: function (options, callback) {
    const q = options.q.toLowerCase();
    const page = options.page || 0;
    const limit = options.limit || 20;
    // Transaction hash
    if (q.length === 66) {
      this._searchByTxid(q, callback);
    }
    // Address
    else if (q.length === 42) {
      this._searchByAddress(q, page, limit, callback);
    }
    else {
      return callback(null, []);
    }
  },

  _searchByTxid: function (txid, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    KyberTradeModel.findOne({
      where: 'tx = ?',
      params: [txid]
    }, callback);
  },

  _searchByAddress: function (address, page, limit, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    const whereClauses = 'LOWER(maker_address) = ? OR LOWER(taker_address) = ?';
    const params = [address, address];

    async.auto({
      list: (next) => {
        KyberTradeModel.find({
          where: whereClauses,
          params: params,
          limit: limit,
          offset: page * limit,
          orderBy: 'block_timestamp DESC',
        }, next);
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
        pagination: {
          page: page,
          limit: limit,
          totalCount: ret.count,
          maxPage: Math.ceil(ret.count/limit)
        }
      });
    });
  },

  getNetworkVolumes: function (options, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    const interval = options.interval || 'H1';
    const period = options.period || 'D7';

    let key = `vol-${period}-${interval}`;
    if (options.symbol) {
      key = options.symbol + '-' + key;
    }

    const cachedData = LocalCache.getSync(key);
    if (cachedData) {
      return callback(null, cachedData);
    }

    const groupColumn = this._getGroupColumnByIntervalParam(interval);
    const [fromDate, toDate] = this._getRequestDatePeriods(options, period);

    let whereClauses = 'block_timestamp > ? AND block_timestamp < ?';
    let params = [fromDate, toDate];

    if (options.symbol) {
      whereClauses += ' AND (taker_token_symbol = ? OR maker_token_symbol = ?)';
      params.push(options.symbol);
      params.push(options.symbol);
    }

    KyberTradeModel.sumGroupBy('maker_total_usd', {
      where: whereClauses,
      params: params,
      groupBy: [groupColumn]
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      LocalCache.setSync(key, ret);
      return callback(null, ret);
    });
  },

  getToBurnFees: function (options, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    const interval = options.interval || 'H1';
    const period = options.period || 'D7';

    let key = `to-burn-fee-${period}-${interval}`;
    if (options.symbol) {
      key = options.symbol + '-' + key;
    }

    const cachedData = LocalCache.getSync(key);
    if (cachedData) {
      return callback(null, cachedData);
    }

    const groupColumn = this._getGroupColumnByIntervalParam(interval);
    const [fromDate, toDate] = this._getRequestDatePeriods(options, period);

    let whereClauses = 'block_timestamp > ? AND block_timestamp < ?';
    let params = [fromDate, toDate];

    if (options.symbol) {
      whereClauses += ' AND (taker_token_symbol = ? OR maker_token_symbol = ?)';
      params.push(options.symbol);
      params.push(options.symbol);
    }

    KyberTradeModel.sumGroupBy('burn_fees/1000000000000000000', {
      where: whereClauses,
      params: params,
      groupBy: [groupColumn]
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      LocalCache.setSync(key, ret);
      return callback(null, ret);
    });
  },

  getToWalletFees: function (options, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    const interval = options.interval || 'H1';
    const period = options.period || 'D7';

    let key = `to-wallet-fee-${period}-${interval}`;
    if (options.symbol) {
      key = options.symbol + '-' + key;
    }

    const cachedData = LocalCache.getSync(key);
    if (cachedData) {
      return callback(null, cachedData);
    }

    const groupColumn = this._getGroupColumnByIntervalParam(interval);
    const [fromDate, toDate] = this._getRequestDatePeriods(options, period);

    let whereClauses = 'block_timestamp > ? AND block_timestamp < ?';
    let params = [fromDate, toDate];

    if (options.symbol) {
      whereClauses += ' AND (taker_token_symbol = ? OR maker_token_symbol = ?)';
      params.push(options.symbol);
      params.push(options.symbol);
    }

    KyberTradeModel.sumGroupBy('taker_fee', {
      where: whereClauses,
      params: params,
      groupBy: [groupColumn]
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      LocalCache.setSync(key, ret);
      return callback(null, ret);
    });
  },

  getCountMarkerAddress: function (markerAddress, fromDate, toDate, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');

    let whereClauses = 'maker_address = ? AND block_timestamp > ? AND block_timestamp < ?';
    let params = [markerAddress, fromDate, toDate];

    KyberTradeModel.countGroupBy('maker_address', {
      where: whereClauses,
      params: params,
      groupBy: ['maker_address']
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }
      return callback(null, ret);
    });
  },

  getSumMarkerAddress: function (markerAddress, fromDate, toDate, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');

    let whereClauses = 'maker_address = ? AND block_timestamp > ? AND block_timestamp < ?';
    let params = [markerAddress, fromDate, toDate];

    KyberTradeModel.sumGroupBy('maker_total_usd', {
      where: whereClauses,
      params: params,
      groupBy: ['maker_address']
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }
      return callback(null, ret);
    });
  },

  _getGroupColumnByIntervalParam: function(interval) {
    switch (interval) {
      case 'H1':
        return 'hour_seq';
      case 'M1':
        return 'minute_seq';
      case 'D1':
        return 'day_seq';
    }
  },

  _getRequestDatePeriods: function (options, period) {
    let toDate = options.toDate || Utils.nowInSeconds();
    let fromDate = options.fromDate;

    if (!fromDate) {
      fromDate = toDate - Const.CHART_PERIOD[period];
    }

    return [fromDate, toDate];
  },

});
