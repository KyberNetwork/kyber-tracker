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
const logger = require('sota-core').getLogger('TradeService');

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
          maxPage: Math.ceil(ret.count / options.limit)
        }
      });
    });
  },

  getTradeDetails: function (tradeId, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    KyberTradeModel.findOne(tradeId, callback);
  },

  // Use for totken list page & top token chart
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
      takerUsds: (next) => {
        // KyberTradeModel.sumGroupBy('taker_total_usd', {
        KyberTradeModel.sumGroupBy('volume_usd', {
          where: 'block_timestamp > ? AND block_timestamp < ?',
          params: [fromDate, toDate],
          groupBy: ['taker_token_symbol']
        }, next);
      },
      makerUsds: (next) => {
        // KyberTradeModel.sumGroupBy('maker_total_usd', {
        KyberTradeModel.sumGroupBy('taker_total_usd', {
          where: 'block_timestamp > ? AND block_timestamp < ?',
          params: [fromDate, toDate],
          groupBy: ['maker_token_symbol']
        }, next);
      },
      takerEth: (next) => {
        KyberTradeModel.sumGroupBy('volume_eth', {
          where: 'block_timestamp > ? AND block_timestamp < ?',
          params: [fromDate, toDate],
          groupBy: ['maker_token_symbol']
        }, next);
      },
      makerEth: (next) => {
        KyberTradeModel.sumGroupBy('volume_eth', {
          where: 'block_timestamp > ? AND block_timestamp < ?',
          params: [fromDate, toDate],
          groupBy: ['taker_token_symbol']
        }, next);
      },
      /* prices: (next) => {
        CMCService.getPriceOfAllTokens(next);
      } */
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      // const prices = ret.prices;
      const takerTrades = _.keyBy(ret.takerTrades, 'takerTokenSymbol');
      const makerTrades = _.keyBy(ret.makerTrades, 'makerTokenSymbol');
      const takerUsds = _.keyBy(ret.takerUsds, 'takerTokenSymbol');
      const makerUsds = _.keyBy(ret.makerUsds, 'makerTokenSymbol');
      const takerEth = _.keyBy(ret.takerEth, 'makerTokenSymbol');
      const makerEth = _.keyBy(ret.makerEth, 'takerTokenSymbol');
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

        let volumeUSD = new BigNumber(0);
        if (takerUsds[symbol]) {
          volumeUSD = volumeUSD.plus(new BigNumber(takerUsds[symbol].sum.toString()));
        }

        if (makerUsds[symbol]) {
          volumeUSD = volumeUSD.plus(new BigNumber(makerUsds[symbol].sum.toString()));
        }

        let ethVolume = new BigNumber(0);
        if (takerEth[symbol]) {
          ethVolume = ethVolume.plus(new BigNumber(takerEth[symbol].sum.toString()));
        }

        if (makerEth[symbol]) {
          ethVolume = ethVolume.plus(new BigNumber(makerEth[symbol].sum.toString()));
        }

        return {
          symbol: tokenConfig.symbol,
          name: tokenConfig.name,
          volumeToken: tokenVolume.toFormat(4).toString(),
          volumeTokenNumber: tokenVolume.toNumber(),
          volumeUSD: volumeUSD.toNumber(),
          volumeETH: ethVolume.toFormat(4).toString(),
          volumeEthNumber: ethVolume.toNumber(),
        };
      }));

      return callback(null, _.sortBy(tokens, (e) => {
        return -e.volumeUSD;
      }));
    });
  },

  // Use for topbar items
  getStats24h: function (callback) {
    const key = 'stats24h';
    const cachedData = LocalCache.getSync(key);

    if (cachedData) {
      return callback(null, cachedData);
    }

    this._getStats24h(key, callback);
  },

  _getStats24h: function (key, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    const BurnedFeeModel = this.getModel('BurnedFeeModel');
    const CMCService = this.getService('CMCService');
    const nowInSeconds = Utils.nowInSeconds();
    const DAY_IN_SECONDS = 24 * 60 * 60;

    async.auto({
      volumeUsd: (next) => {
        KyberTradeModel.sum('volume_usd', {
          where: 'block_timestamp > ?',
          params: [nowInSeconds - DAY_IN_SECONDS],
        }, next);
      },
      volumeEth: (next) => {
        KyberTradeModel.sum('volume_eth', {
          where: 'block_timestamp > ?',
          params: [nowInSeconds - DAY_IN_SECONDS],
        }, next);
      },
      /*
      ethPrice: (next) => {
        CMCService.getCurrentPrice('ETH', next);
      },
      kncPrice: (next) => {
        CMCService.getCurrentPrice('KNC', next);
      },
      */
      kncInfo: (next) => {
        CMCService.getCMCTokenInfo('KNC', next);
      },
      /*
      tradeCount: (next) => {
        KyberTradeModel.count({
          where: 'block_timestamp > ?',
          params: [nowInSeconds - DAY_IN_SECONDS]
        }, next);
      },
      partnerFee: (next) => {
        KyberTradeModel.sum('taker_fee', {
          where: 'block_timestamp > ?',
          params: [nowInSeconds - DAY_IN_SECONDS]
        }, next);
      },
      */
      totalBurnedFee: (next) => {
        BurnedFeeModel.sum('amount', {
          where: '1=1'
        }, next);
      },
      feeToBurn: (next) => {
        KyberTradeModel.sum('burn_fees', {
          where: '1=1'
          // where: 'block_timestamp > ?',
          // params: [nowInSeconds - DAY_IN_SECONDS]
        }, next);
      },
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      const volumeInUSD = new BigNumber(ret.volumeUsd.toString());
      const volumeInETH = new BigNumber(ret.volumeEth.toString());
      //const feeInKNC = new BigNumber(ret.partnerFee.toString()).div(Math.pow(10, 18));
      //const feeInUSD = feeInKNC.times(ret.kncPrice);
      const totalBurnedFee = new BigNumber(ret.totalBurnedFee.toString()).div(Math.pow(10, 18));
      const feeToBurn = new BigNumber(ret.feeToBurn.toString()).div(Math.pow(10, 18));
      const result = {
        networkVolume: '$' + volumeInUSD.toFormat(2).toString(),
        networkVolumeEth:  volumeInETH.toFormat(2).toString() + " ETH",
        //partnerFee: '$' + feeInUSD.toFormat(2).toString(),
        //tradeCount: ret.tradeCount,
        kncInfo: ret.kncInfo,
        totalBurnedFee: totalBurnedFee.toFormat(2).toString(),
        feeToBurn: feeToBurn.toFormat(2).toString()
      };

      LocalCache.setSync(key, result, {ttl: Const.MINUTE_IN_MILLISECONDS});

      return callback(null, result);
    });
  },

  _isTxHash: function(hash) {
    return /^0x([A-Fa-f0-9]{64})$/i.test(hash);
  },
  _isAddress: function(address) {
    return /^(0x)?[0-9a-f]{40}$/i.test(address)
  },

  search: function (options, callback) {
    const q = options.q.toLowerCase();
    const page = options.page || 0;
    const limit = options.limit || 20;
    const fromDate = options.fromDate
    const toDate = options.toDate
    // Transaction hash

    console.log("+++++++++++****************")
    console.log(q)
    if (this._isTxHash(q)) {
      console.log("is tx hash")
      this._searchByTxid(q, callback);
    }
    // Address
    else if (this._isAddress(q)) {
      console.log("+++++++++ is address")
      this._searchByAddress(q, page, limit, fromDate, toDate, callback);
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

  _searchByAddress: function (address, page, limit, fromDate, toDate, callback) {
    const KyberTradeModel = this.getModel('KyberTradeModel');
    let whereClauses = 'LOWER(maker_address) = ? OR LOWER(taker_address) = ?';
    let params = [address, address];

    if (fromDate) {
      whereClauses += ' AND block_timestamp > ?';
      params.push(fromDate);
    }

    if (toDate) {
      whereClauses += ' AND block_timestamp < ?';
      params.push(toDate);
    }

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
      },
      volumeUsd: (next) => {
        KyberTradeModel.sum('volume_usd', {
          where: whereClauses,
          params: params,
        }, next);
      },
      volumeEth: (next) => {
        KyberTradeModel.sum('volume_eth', {
          where: whereClauses,
          params: params,
        }, next);
      },
      partnerFee: (next) => {
        KyberTradeModel.sum('taker_fee', {
          where: whereClauses,
          params: params,
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
          volumeUsd: ret.volumeUsd,
          volumeEth: ret.volumeEth,
          partnerFee: ret.partnerFee,
          maxPage: Math.ceil(ret.count / limit)
        }
      });
    });
  },

  // Use for Volume charts
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

    async.auto({
      sum: (next) => {
        KyberTradeModel.sumGroupBy('volume_usd', {
          where: whereClauses,
          params: params,
          groupBy: [groupColumn],
        }, next);
      },
      sumEth: (next) => {
        KyberTradeModel.sumGroupBy('volume_eth', {
          where: whereClauses,
          params: params,
          groupBy: [groupColumn],
        }, next);
      },
      count: (next) => {
        KyberTradeModel.countGroupBy(groupColumn, {
          where: whereClauses,
          params: params,
          groupBy: [groupColumn]
        }, next);
      }
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      const returnData = [];
      if (ret.sum.length) {

        for (let i = 0; i < ret.sum.length; i++) {
          returnData.push({
            daySeq: ret.sum[i].daySeq,
            hourSeq: ret.sum[i].hourSeq,
            sum: ret.sum[i].sum,
            sumEth: ret.sumEth[i].sum,
            count: ret.count[i].count
          })
        }
        const lastSeq = returnData[returnData.length - 1][this._convertSeqColumnName(groupColumn)];
        const nowSeq = parseInt(toDate / Const.CHART_INTERVAL[interval]);
        if (nowSeq > lastSeq) {
          const nullData = {
            [this._convertSeqColumnName(groupColumn)]: nowSeq,
            sum: 0,
            sumEth: 0,
            count: 0
          };
          returnData.push(nullData);
        }

      } else {
        const firstSeq = fromDate / Const.CHART_INTERVAL[interval];
        const nowSeq = toDate / Const.CHART_INTERVAL[interval];
        returnData.push({
          [this._convertSeqColumnName(groupColumn)]: firstSeq,
          sum: 0,
          sumEth: 0,
          count: 0
        });
        returnData.push({
          [this._convertSeqColumnName(groupColumn)]: nowSeq,
          sum: 0,
          sumEth: 0,
          count: 0
        });
      }

      LocalCache.setSync(key, returnData, {ttl: Const.MINUTE_IN_MILLISECONDS});
      return callback(null, returnData);
    });
  },

  // Use for "Fees To Burn" chart
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

    async.auto({
      sum: (next) => {
        KyberTradeModel.sumGroupBy('burn_fees/1000000000000000000', {
          where: whereClauses,
          params: params,
          groupBy: [groupColumn],
        }, next);
      },
      count: (next) => {
        KyberTradeModel.countGroupBy(groupColumn, {
          where: whereClauses,
          params: params,
          groupBy: [groupColumn]
        }, next);
      }
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      const returnData = [];
      if (ret.sum.length) {

        for (let i = 0; i < ret.sum.length; i++) {
          returnData.push({
            daySeq: ret.sum[i].daySeq,
            hourSeq: ret.sum[i].hourSeq,
            sum: ret.sum[i].sum,
            count: ret.count[i].count
          })
        }
        const lastSeq = returnData[returnData.length - 1][this._convertSeqColumnName(groupColumn)];
        const nowSeq = parseInt(toDate / Const.CHART_INTERVAL[interval]);
        if (nowSeq > lastSeq) {
          const nullData = {
            [this._convertSeqColumnName(groupColumn)]: nowSeq,
            sum: 0,
            count: 0
          };
          returnData.push(nullData);
        }

      } else {
        const firstSeq = parseInt(fromDate / Const.CHART_INTERVAL[interval]);
        const nowSeq = parseInt(toDate / Const.CHART_INTERVAL[interval]);
        returnData.push({
          [this._convertSeqColumnName(groupColumn)]: firstSeq,
          sum: 0,
          count: 0
        });
        returnData.push({
          [this._convertSeqColumnName(groupColumn)]: nowSeq,
          sum: 0,
          count: 0
        });
      }

      LocalCache.setSync(key, returnData, {ttl: Const.MINUTE_IN_MILLISECONDS});
      return callback(null, returnData);
    });
  },

  // Use for "partner commision" chart (currently not used by front-end)
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

      LocalCache.setSync(key, ret, {ttl: Const.MINUTE_IN_MILLISECONDS});
      return callback(null, ret);
    });
  },

  // Seems not used anywhere
  /*
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
  */

  // Seems not used anywhere
  /*
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
  */

  _getGroupColumnByIntervalParam: function (interval) {
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

  _convertSeqColumnName: function (seq) {
    if (seq === 'day_seq') {
      return 'daySeq';
    }
    return 'hourSeq';
  },

});
