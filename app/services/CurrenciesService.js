/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _ = require('lodash');
const async = require('async');
const util = require('util');
const BigNumber = require('bignumber.js');
const network = require('../../config/network');
const Const = require('../common/Const');
const helper = require('../common/Utils');
const Utils = require('sota-core').load('util/Utils');
const BaseService = require('sota-core').load('service/BaseService');
const ExSession = require('sota-core').load('common/ExSession');
const LocalCache = require('sota-core').load('cache/foundation/LocalCache');
const logger = require('sota-core').getLogger('CurrenciesService');

const tokens = network.tokens;

module.exports = BaseService.extends({
  classname: 'CurrenciesService',

  getAllRateInfo: function (callback) {

    const db = this._getDbConnection();
    //const tradeAdapter = db.model().getSlaveAdapter();
    const rateAdapter = db.model('RateModel').getSlaveAdapter();

    let pairs = {}

    Object.keys(tokens).forEach(token => {
      if((token.toUpperCase() !== "ETH") && helper.shouldShowToken(token)){
        pairs[token] = (asyncCallback) => this._getRateInfo(token, {
          //tradeAdapter: tradeAdapter,
          rateAdapter: rateAdapter
        }, asyncCallback)
      }
    })
    async.auto(pairs, (err, ret) => {
      db.destroy();
      callback(err, ret);
    });
  },

  _getDbConnection: function () {
    let exSession = null;

    return {
      model: (modelName) => {
        modelName = modelName || 'KyberTradeModel';
        let model = this._exSession?this.getModel(modelName):undefined;
        if (!model) {
          exSession = new ExSession();
          model = exSession.getModel(modelName);
        }
        return model;
      },
      destroy: () => {
        if (exSession) {
          exSession.destroy();
          exSession = null;
        }
      }
    };
  },

  _getRateInfo: function(symbol, options, callback) {

    //const tradeAdapter = options.tradeAdapter;
    const rateAdapter = options.rateAdapter;

    const nowInSeconds = Utils.nowInSeconds();
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const dayAgo = nowInSeconds - DAY_IN_SECONDS;
    const hour30Ago = nowInSeconds - 30 * 60 * 60;
    const weekAgo = nowInSeconds - DAY_IN_SECONDS * 7;

    // volume SQL
    /*
    const tradeWhere = "block_timestamp >= ? AND (maker_token_symbol = ? OR taker_token_symbol = ?)";
    const tradeSql = `select IFNULL(sum(volume_eth),0) as ETH, IFNULL(sum(volume_usd),0) as USD from kyber_trade where ${tradeWhere}`;
    const tradeParams = [dayAgo, symbol, symbol];
    */

    // 24h price SQL
    const lastSql = `SELECT mid_expected as '24h' FROM rate
      WHERE quote_symbol = ? AND block_timestamp >= ? AND mid_expected > 0 ORDER BY ABS(block_timestamp - ${dayAgo}) LIMIT 1`;
    const lastParams = [symbol, hour30Ago];

    // 7 days points
    //const pointSql = "select FLOOR(AVG(block_timestamp)) as timestamp, AVG(mid_expected) as rate from rate " +
    const pointSql = "select AVG(mid_expected) as rate from rate " +
      "where quote_symbol = ? AND mid_expected > 0 AND block_timestamp >= ? group by h6_seq";
    const pointParams = [symbol, weekAgo];

    async.auto({
      /*
      volume: (next) => {
        try {
          tradeAdapter.execRaw(tradeSql, tradeParams, next);
        } catch (ex) {
          logger.error(ex);
          next(ex, {});
        }
      },
      */
      rate: (next) => {
        try {
          rateAdapter.execRaw(lastSql, lastParams, next);
        } catch (ex) {
          logger.error(ex);
          next(ex, {});
        }
      },
      points: (next) => {
        try {
          rateAdapter.execRaw(pointSql, pointParams, next);
        } catch (ex) {
          logger.error(ex);
          next(ex, {});
        }
      }
    }, callback);
  },

  getConvertiblePairs: function (callback) {
    if(!tokens) return callback(null, {});

    let pairs = {}

    Object.keys(tokens).map(token => {
      // if((token.toUpperCase() !== "ETH") && !tokens[token].hidden){
      if((token.toUpperCase() !== "ETH") && 
          !tokens[token].delisted &&
          helper.shouldShowToken(token)){
        const cmcName = tokens[token].cmcSymbol || token;
        pairs["ETH_" + cmcName] = (asyncCallback) => this._getCurrencyInfo({
          token: token,
          fromCurrencyCode: "ETH"
        }, asyncCallback)
      }
    })

    async.auto(pairs, 10, callback);
  },

  _getCurrencyInfo: function (options, callback) {
    if(!options.token || !tokens[options.token]){
      return callback("token not supported")
    }

    if(!options.fromCurrencyCode || !tokens[options.fromCurrencyCode]){
      return callback("base not supported")
    }

    let tokenSymbol = options.token
    let base = options.fromCurrencyCode
    let tokenData = tokens[tokenSymbol]
    let baseTokenData = tokens[base]

    const KyberTradeModel = this.getModel('KyberTradeModel');
    const CMCService = this.getService('CMCService');
    const nowInSeconds = Utils.nowInSeconds();
    const DAY_IN_SECONDS = 24 * 60 * 60;

    async.auto({
      baseVolume: (next) => {
        KyberTradeModel.sum('volume_eth', {
          where: 'block_timestamp > ? AND (maker_token_symbol = ? OR taker_token_symbol = ?)',
          params: [nowInSeconds - DAY_IN_SECONDS, tokenSymbol, tokenSymbol],
        }, next);
      },
      quoteVolumeTaker: (next) => {
        KyberTradeModel.sum('taker_token_amount', {
          where: 'block_timestamp > ? AND taker_token_symbol = ?',
          params: [nowInSeconds - DAY_IN_SECONDS, tokenSymbol],
        }, next);
      },
      quoteVolumeMaker: (next) => {
        KyberTradeModel.sum('maker_token_amount', {
          where: 'block_timestamp > ? AND maker_token_symbol = ?',
          params: [nowInSeconds - DAY_IN_SECONDS, tokenSymbol],
        }, next);
      },
      price: (next) => {
        CMCService.getCurrentRate(tokenSymbol, base, next);
      },
      lastTrade: (next) => {
        KyberTradeModel.findOne({
          where: 'taker_token_symbol = ? OR maker_token_symbol = ?',
          params: [tokenSymbol, tokenSymbol],
          orderBy: 'block_timestamp DESC',
        }, next)
      }
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      let lastPrice = 0
      if(ret.lastTrade){
        let bigMakerAmount = ret.lastTrade.makerTokenAmount ? new BigNumber(ret.lastTrade.makerTokenAmount) : new BigNumber(0)
        let bigTakerAmount = ret.lastTrade.takerTokenAmount ? new BigNumber(ret.lastTrade.takerTokenAmount) : new BigNumber(0)

        if(ret.lastTrade.takerTokenSymbol != tokenSymbol && !bigMakerAmount.isZero()){
          let amountTaker = ret.lastTrade.volumeEth; //bigTakerAmount.div(Math.pow(10, baseTokenData.decimal))
          let amountMaker = bigMakerAmount.div(Math.pow(10, tokenData.decimal));
          lastPrice = new BigNumber(amountTaker).div(amountMaker).toNumber()
        }
        else if(ret.lastTrade.makerTokenSymbol != tokenSymbol && !bigTakerAmount.isZero()){
          let amountMaker = ret.lastTrade.volumeEth; //bigMakerAmount.div(Math.pow(10, baseTokenData.decimal))
          let amountTaker = bigTakerAmount.div(Math.pow(10, tokenData.decimal))          
          lastPrice = new BigNumber(amountMaker).div(amountTaker).toNumber()
        }

      }

      // const baseVolume = new BigNumber(ret.baseVolume.toString()).div(Math.pow(10, baseTokenData.decimal)).toNumber()
      let bigQuoteVolumeTaker = ret.quoteVolumeTaker ? new BigNumber(ret.quoteVolumeTaker.toString()) : new BigNumber(0)
      let bigQuoteVolumeMaker = ret.quoteVolumeMaker ? new BigNumber(ret.quoteVolumeMaker.toString()) : new BigNumber(0)
      const quoteVolume = bigQuoteVolumeTaker.plus(bigQuoteVolumeMaker).div(Math.pow(10, tokenData.decimal)).toNumber()
      const currentPrice = ret.price ? new BigNumber(ret.price.rate.toString()).div(Math.pow(10, baseTokenData.decimal)) : null
      return callback( null , {
        "symbol": tokenData.cmcSymbol || tokenData.symbol,
        "name": tokenData.name,
        // "code": tokenData.symbol,
        "contractAddress": tokenData.address,
        "decimals": tokenData.decimal,
        currentPrice: currentPrice.toNumber(),
        lastPrice: lastPrice,
        lastTimestamp: ret.lastTrade ? ret.lastTrade.blockTimestamp : null,
        baseVolume: ret.baseVolume,
        quoteVolume: quoteVolume
      })
    })
  },

  getPair24hData: function (callback) {
    if(!tokens) return callback(null, {});

    let pairs = {};

    Object.keys(tokens).map(token => {
      if((token.toUpperCase() !== "ETH") && 
          !tokens[token].delisted &&
          helper.shouldShowToken(token)){
        pairs["ETH_" + token] = (asyncCallback) => this._getPair24hData({
          tradeAdapter: this.getModel('KyberTradeModel').getSlaveAdapter(),
          rateAdapter: this.getModel('RateModel').getSlaveAdapter(),
          token: token,
          fromCurrencyCode: "ETH"
        }, asyncCallback)
      }
    });

    pairs.allRates = this.getService('CMCService').getAllRates;

    async.auto(pairs, 10, function(err, pairs){
      if (!err) {
        const rates = pairs.allRates;
        delete pairs.allRates;
        Object.values(pairs).forEach((value) => {
          const askrate = rates.getRate(value.base_symbol, value.quote_symbol);
          const normalAsk = askrate ? (1 / askrate) : 0;
          const normalBid = rates.getRate(value.quote_symbol, value.base_symbol);
          if (normalAsk) {
            value.current_ask = normalAsk;
          }
          if (value.current_ask > value.past_24h_high) {
            value.past_24h_high = value.current_ask;
          }

          if (normalBid) {
            value.current_bid = normalBid;
          }
          if (value.current_bid < value.past_24h_low) {
            value.past_24h_low = value.current_bid;
          }

        });
      }

      callback(err, pairs);
    });
  },

  _getPair24hData: function (options, callback) {
    if(!options.token || !tokens[options.token]){
      return callback("token not supported")
    }

    if(!options.fromCurrencyCode || !tokens[options.fromCurrencyCode]){
      return callback("base not supported")
    }

    let tokenSymbol = options.token
    let baseSymbol = options.fromCurrencyCode
    let tokenData = tokens[tokenSymbol]

    const nowInMs = Date.now();
    const nowInSeconds = Math.floor(nowInMs / 1000);
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const dayAgo = nowInSeconds - DAY_IN_SECONDS;
    const KyberTradeModel = this.getModel('KyberTradeModel');
    // volume SQL
    const tradeWhere = 'block_timestamp > ? AND (maker_token_symbol = ?  OR  taker_token_symbol = ?)';
    const tradeSql = `select IFNULL(sum(volume_usd),0) as usd_24h_volume from kyber_trade where ${tradeWhere}`;
    const tradeParams = [dayAgo, tokenSymbol, tokenSymbol];

    // 24h price SQL
    const rateSql = `SELECT max(buy_expected) as 'past_24h_high', min(sell_expected) as 'past_24h_low' FROM rate
      WHERE quote_symbol = ? AND block_timestamp > ? AND sell_expected > 0`;
    const rateParams = [tokenSymbol, dayAgo];

    // last price SQL
    const lastSql = `SELECT buy_expected as 'current_ask', sell_expected as 'current_bid' FROM rate
      WHERE quote_symbol = ? AND buy_expected > 0 AND sell_expected > 0
      ORDER BY block_number DESC LIMIT 1`;
    const lastParams = [tokenSymbol];

    //volume base
    const volumeSql = `SELECT sum(taker_token_amount +maker_token_amount) as volume, sum(volume_eth) as volume_eth from kyber_trade where block_timestamp > ?
    AND (maker_token_symbol = ? OR taker_token_symbol = ?)`;
    const volumeParams = [nowInSeconds - DAY_IN_SECONDS, tokenSymbol,tokenSymbol];

    async.auto({
      trade: (next) => {
        options.tradeAdapter.execRaw(tradeSql, tradeParams, next);
      },
      rate: (next) => {
        options.rateAdapter.execRaw(rateSql, rateParams, next);
      },
      latest: (next) => {
        options.rateAdapter.execRaw(lastSql, lastParams, next);
      },
      volume: (next) => {
        options.tradeAdapter.execRaw(volumeSql, volumeParams, next);
      },
      lastTrade: (next) => {
        KyberTradeModel.findOne({
          where: 'taker_token_symbol = ? OR maker_token_symbol = ?',
          params: [tokenSymbol, tokenSymbol],
          orderBy: 'block_timestamp DESC',
        }, next)
      },
      quoteVolumeTaker: (next) => {
        KyberTradeModel.sum('taker_token_amount', {
          where: 'block_timestamp > ? AND taker_token_symbol = ?',
          params: [nowInSeconds - DAY_IN_SECONDS, tokenSymbol],
        }, next);
      },
      quoteVolumeMaker: (next) => {
        KyberTradeModel.sum('maker_token_amount', {
          where: 'block_timestamp > ? AND maker_token_symbol = ?',
          params: [nowInSeconds - DAY_IN_SECONDS, tokenSymbol],
        }, next);
      },
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }
      let lastPrice = 0
      if(ret.lastTrade){
        let bigMakerAmount = ret.lastTrade.makerTokenAmount ? new BigNumber(ret.lastTrade.makerTokenAmount) : new BigNumber(0)
        let bigTakerAmount = ret.lastTrade.takerTokenAmount ? new BigNumber(ret.lastTrade.takerTokenAmount) : new BigNumber(0)

        if(ret.lastTrade.takerTokenSymbol != tokenSymbol && !bigMakerAmount.isZero()){
          let amountTaker = ret.lastTrade.volumeEth; //bigTakerAmount.div(Math.pow(10, baseTokenData.decimal))
          let amountMaker = bigMakerAmount.div(Math.pow(10, tokenData.decimal));
          lastPrice = new BigNumber(amountTaker).div(amountMaker).toNumber()
        }
        else if(ret.lastTrade.makerTokenSymbol != tokenSymbol && !bigTakerAmount.isZero()){
          let amountMaker = ret.lastTrade.volumeEth; //bigMakerAmount.div(Math.pow(10, baseTokenData.decimal))
          let amountTaker = bigTakerAmount.div(Math.pow(10, tokenData.decimal))          
          lastPrice = new BigNumber(amountMaker).div(amountTaker).toNumber()
        }
      }
      const quoteVolume = ret.volume[0].volume ? new BigNumber(ret.volume[0].volume.toString()).div(Math.pow(10, tokenData.decimal)).toNumber() : 0
      const baseVolume = ret.volume[0].volume_eth ? ret.volume[0].volume_eth: 0
      return callback( null , {
        timestamp: nowInMs,
        quote_symbol: tokenSymbol,
        base_symbol: baseSymbol,
        past_24h_high: ret.rate.length ? (ret.rate[0].past_24h_high || 0) : 0,
        past_24h_low: ret.rate.length ? (ret.rate[0].past_24h_low || 0) : 0,
        usd_24h_volume: ret.trade.length ? (ret.trade[0].usd_24h_volume || 0) :0,
        current_bid: ret.latest.length ? (ret.latest[0].current_bid || 0) : 0,
        current_ask: ret.latest.length ? (ret.latest[0].current_ask || 0) : 0,
        volume_token:quoteVolume,
        last_traded:lastPrice,
        baseVolume: baseVolume,
      })
    })
  },

});