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
    const tradeAdapter = db.model().getSlaveAdapter();
    const rateAdapter = db.model('RateModel').getSlaveAdapter();

    let pairs = {}

    Object.keys(tokens).forEach(token => {
      if((token.toUpperCase() !== "ETH") && helper.shouldShowToken(token)){
        pairs[token] = (asyncCallback) => this._getRateInfo(token, {
          tradeAdapter: tradeAdapter,
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

    const tradeAdapter = options.tradeAdapter;
    const rateAdapter = options.rateAdapter;

    const nowInSeconds = Utils.nowInSeconds();
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const dayAgo = nowInSeconds - DAY_IN_SECONDS;
    const weekAgo = nowInSeconds - DAY_IN_SECONDS * 7;

    // volume SQL
    const tradeWhere = "block_timestamp >= ? AND (maker_token_symbol = ? OR taker_token_symbol = ?)";
    const tradeSql = `select IFNULL(sum(volume_eth),0) as ETH, IFNULL(sum(volume_usd),0) as USD from kyber_trade where ${tradeWhere}`;
    const tradeParams = [dayAgo, symbol, symbol];

    // 24h price SQL
    const lastSql = `SELECT mid_expected as '24h' FROM rate
      WHERE quote_symbol = ? AND mid_expected > 0 ORDER BY ABS(block_timestamp - ${dayAgo}) LIMIT 1`;
    const lastParams = [symbol];

    // 7 days points
    //const pointSql = "select FLOOR(AVG(block_timestamp)) as timestamp, AVG(mid_expected) as rate from rate " +
    const pointSql = "select AVG(mid_expected) as rate from rate " +
      "where quote_symbol = ? AND mid_expected > 0 AND block_timestamp >= ? group by h6_seq";
    const pointParams = [symbol, weekAgo];

    async.auto({
      volume: (next) => {
        tradeAdapter.execRaw(tradeSql, tradeParams, next);
      },
      rate: (next) => {
        rateAdapter.execRaw(lastSql, lastParams, next);
      },
      points: (next) => {
        rateAdapter.execRaw(pointSql, pointParams, next);
      }
    }, callback);
  },

  getConvertiblePairs: function (callback) {
    if(!tokens) return callback(null, {});

    let pairs = {}

    Object.keys(tokens).map(token => {
      // if((token.toUpperCase() !== "ETH") && !tokens[token].hidden){
      if((token.toUpperCase() !== "ETH") && helper.shouldShowToken(token)){
        const cmcName = tokens[token].cmcSymbol || token;
        pairs["ETH_" + cmcName] = (asyncCallback) => this._getCurrencyInfo({
          token: token,
          fromCurrencyCode: "ETH"
        }, asyncCallback)
      }
    })
    if(pairs && Object.keys(pairs).length){
      async.auto(
        pairs,
        (err, ret) => {
          return callback(null, ret);
        })
    } else {
      return callback(null, {});
    }
    
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
          where: 'block_timestamp > ? AND ((maker_token_symbol = ? AND taker_token_symbol = ?) OR (maker_token_symbol = ? AND taker_token_symbol = ?))',
          params: [nowInSeconds - DAY_IN_SECONDS, tokenSymbol, base, base, tokenSymbol],
        }, next);
      },
      quoteVolumeTaker: (next) => {
        KyberTradeModel.sum('taker_token_amount', {
          where: 'block_timestamp > ? AND maker_token_symbol = ? AND taker_token_symbol = ?',
          params: [nowInSeconds - DAY_IN_SECONDS, base, tokenSymbol],
        }, next);
      },
      quoteVolumeMaker: (next) => {
        KyberTradeModel.sum('maker_token_amount', {
          where: 'block_timestamp > ? AND maker_token_symbol = ? AND taker_token_symbol = ?',
          params: [nowInSeconds - DAY_IN_SECONDS, tokenSymbol, base],
        }, next);
      },
      price: (next) => {
        CMCService.getCurrentRate(tokenSymbol, base, next);
      },
      lastTrade: (next) => {
        KyberTradeModel.findOne({
          where: '(taker_token_symbol = ? and maker_token_symbol = ?) or (taker_token_symbol = ? and maker_token_symbol = ?)',
          params: [tokenSymbol, base, base, tokenSymbol],
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

        if(ret.lastTrade.takerTokenSymbol == base && !bigMakerAmount.isZero()){
          let amountTaker = bigTakerAmount.div(Math.pow(10, baseTokenData.decimal))
          let amountMaker = bigMakerAmount.div(Math.pow(10, tokenData.decimal))
          lastPrice = amountTaker.div(amountMaker).toNumber()
        }
        else if(ret.lastTrade.makerTokenSymbol == base && !bigTakerAmount.isZero()){
          let amountMaker = bigMakerAmount.div(Math.pow(10, baseTokenData.decimal))
          let amountTaker = bigTakerAmount.div(Math.pow(10, tokenData.decimal))          
          lastPrice = amountMaker.div(amountTaker).toNumber()
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

});