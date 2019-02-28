const _                       = require('lodash');
const async                   = require('async');
const network                 = require('../../config/network');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Utils                   = require('../common/Utils');
const Resolution              = require('../common/Resolution');
const logger                  = log4js.getLogger('ChartController');
const CacheInfo               = require('../../config/cache/info');
const supportedTokens         = Utils.getRateTokenArray().supportedTokens;
const RedisCache              = require('sota-core').load('cache/foundation/RedisCache');

module.exports = AppController.extends({
  classname: 'ChartController',

  config: function (req, res) {
      Utils.cors(res).json({
        supported_resolutions: ['60','120','240','360','720','D','W','M'],
        supports_group_request: false,
        supports_marks: false,
        supports_search: true,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [],
        symbolsTypes: []
      });
  },

  symbols: function (req, res) {
    Utils.cors(res);
    const [err, params] = new Checkit({
        symbol: ['string', 'required']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const token = network.tokens[params.symbol];
    if (!token || !Utils.shouldShowToken(params.symbol)) {
        res.json({
            s: "error",
            errmsg: "unknown_symbol " + params.symbol
        });
        return;
    }

    res.json({
        name: token.symbol,
        ticker: token.symbol,
        description: token.name,
        type: "Ethereum Token",
        session: "24x7",
        //exchange: "Kyber Network",
        listed_exchange: "Kyber Network",
        timezone: token.timezone || "Asia/Singapore",
        minmov: token.minmov || 1,
        pricescale: token.pricescale || 1000000,
        minmove2: 0,
        fractional: false,
        has_intraday: true,
        supported_resolutions: ['60','120','240','360','720','D','W','M'],
        intraday_multipliers: ['60','120','240','360','720'],
        has_seconds: false,
        seconds_multipliers: [],
        has_daily: true,
        has_weekly_and_monthly: true,
        has_empty_bars: true,
        force_session_rebuild: false,
        has_no_volume: true,
        volume_precision: token.volume_precision || 3,
        data_status: "pulsed",
        expired: false,
        //expiration_date: null,
        sector: token.sector,
        industry: token.industry,
        currency_code: "ETH"
    });

  },

  search: function (req, res) {
    Utils.cors(res);
    const [err, params] = new Checkit({
        query: ['string'],
        limit:  ['naturalNonZero']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }
    // if(params.query){
    //   const token = network.tokens[params.query];
    //   if (!token || !Utils.shouldShowToken(params.query)) {
    //       res.json({
    //           s: "error",
    //           errmsg: "unknown_symbol " + params.query
    //       });
    //       return;
    //   }
    // }
    const ret = [];
    const query = (params.query || "").toUpperCase();
    const limit = parseInt(params.limit || supportedTokens.length);
    let counter = 0;
    supportedTokens.forEach((token) => {
        if (counter >= limit) return;
        if (!token.delisted && (!query || token.symbol.includes(query)) && Utils.shouldShowToken(token.symbol)) {
            ret.push({
                symbol: token.symbol,
                full_name: token.symbol,
                description: token.name
            });
            counter++;
        }
    });

    res.json(ret);

  },

  history: function (req, res) {
      Utils.cors(res);
      const [err, params] = new Checkit({
          symbol: ['string', 'required'],
          resolution: ['string', 'required'],
          from: ['naturalNonZero', 'required'],
          to: ['naturalNonZero', 'required'],
          rateType: ['string', 'required']
      }).validateSync(req.allParams);

      if (err) {
          res.badRequest(err.toString());
          return;
      }

      if(params.to <= params.from) {
        res.badRequest("from time must be lest than to time");
        return;
      }

      if(!params.symbol || !network.tokens[params.symbol.toUpperCase()]){
        res.badRequest(`Token ${params.symbol} not supported`);
        return;
      }

      if (params.rateType !== "sell" && params.rateType !== "buy" && params.rateType !== "mid") {
          res.badRequest("rateType must be 'sell', 'buy', or 'mid'.");
          return;
      }

      params.seqType = Resolution.toColumn(params.resolution);
      if (!params.seqType) {
          res.badRequest("Unsupported resolution.");
          return;
      }
      const time_exprire = CacheInfo.chart_history_1h.TTL;

      const minutes_to = Math.floor(params.to / 600);
      const key = CacheInfo.chart_history_1h.key + minutes_to.toString() + params.symbol + params.seqType;
      const chartService = req.getService('ChartService');
      RedisCache.getAsync(key, (err, ret) => {
        if (err) {
          logger.error(err);
          res.json(ret);
          return;
        }
        if (ret) {
          res.json(JSON.parse(ret));
          return;
        }
        chartService.history(params,(err, ret_1)=>{
          if(err){
            logger.error(err);
          }
          if (params.rateType === 'sell' && params.resolution === '60') {
            RedisCache.setAsync(key, JSON.stringify(ret_1), time_exprire);
          }
          res.json(ret_1);
        });
      });
},

  time: function (req, res) {
    Utils.cors(res).send("" + Math.floor(Date.now() / 1000));
  },

  klines: function (req, res) {
    Utils.cors(res);
    const [err, params] = new Checkit({
      symbol: ['string', 'required'],
      interval: ['string', 'required'],
      rateType: ['string']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }
    const resolution = Resolution.toSeq(params.interval);

    if (!resolution) {
      res.badRequest("Unsupported interval.");
      return;
    }

    params.seqType = Resolution.toColumn(resolution.seq);
    if (!params.seqType) {
      res.badRequest("Unsupported resolution.");
      return;
    }
    params.resolution = resolution.seq;

    const rateType = params.rateType || 'sell';
    params.rateType = rateType;

    const nowInMs = Date.now();
    const nowInSeconds = Math.floor(nowInMs / 1000);
    params.from = nowInSeconds - resolution.value;
    params.to = nowInSeconds;
    const key = CacheInfo.klines.key + params.interval.toString() + params.rateType.toString() + params.symbol;
    const time_exprire = CacheInfo.klines.TTL;
    const chartService = req.getService('ChartService');
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err);
        res.json(ret);
        return;
      }
      if (ret) {
        res.json(JSON.parse(ret));
        return;
      }
      chartService.klines(params,(err, ret_1)=>{
        if(err){
          logger.error(err);
        }
        if (params.rateType === 'sell') {
          RedisCache.setAsync(key, JSON.stringify(ret_1), time_exprire);
        }
        res.json(ret_1);
      });
    });
  }
});
