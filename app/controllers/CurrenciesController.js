const _                       = require('lodash');
const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Const                   = require('../common/Const');
const Utils                   = require('../common/Utils');
const network                 = require('../../config/network');
const LocalCache              = require('sota-core').load('cache/foundation/LocalCache');
const logger                  = log4js.getLogger('CurrenciesController');

module.exports = AppController.extends({
  classname: 'CurrenciesController',

  getSupportedTokens: function (req, res) {
    Utils.cors(res);

    const ret = [];
    const tokens = network.tokens;
    Object.keys(tokens).forEach(symbol => {
      if (Utils.shouldShowToken(symbol) && !tokens[symbol].delisted) {
        const token = tokens[symbol];
        const id = token.symbol || symbol;
        ret.push({
          symbol: id,
          cmcName: token.cmcSymbol || id,
          name: token.name,
          decimals: token.decimal,
          contractAddress: token.address
        });
      }
    });

    res.json(ret);
  },

  getConvertiblePairs: function (req, res) {
    Utils.cors(res);

    const CACHE_KEY = 'getConvertiblePairs';
    const cachedData = LocalCache.getSync(CACHE_KEY);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    const CurrenciesService = req.getService('CurrenciesService');
    CurrenciesService.getConvertiblePairs((err, ret) => {
      LocalCache.setSync(CACHE_KEY, ret, {ttl: Const.MINUTE_IN_MILLISECONDS});
      res.json(ret);
    });
  },

  getPair24hData: function (req, res) {
    Utils.cors(res);

    const CACHE_KEY = 'getPair24hData';
    const cachedData = LocalCache.getSync(CACHE_KEY);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    const CurrenciesService = req.getService('CurrenciesService');
    CurrenciesService.getPair24hData((err, ret) => {
      LocalCache.setSync(CACHE_KEY, ret, {ttl: Const.MINUTE_IN_MILLISECONDS});
      res.json(ret);
    });
  },

  getAllRateInfo: function (req, res) {
    Utils.cors(res);
    const service = req.getService('CurrenciesService');
    
    const CACHE_KEY = 'allrates';
    const cachedData = LocalCache.getSync(CACHE_KEY);
    const CACHE_TTL = 10 * Const.MINUTE_IN_MILLISECONDS;
    const PRELOAD_TIMING = CACHE_TTL - 20000; // 20 seconds

    if (cachedData) {
      res.json(cachedData.value);
      if (Date.now() - cachedData.timestamp < PRELOAD_TIMING) {
        return;
      }
    }

    service.getAllRateInfo((err, ret) => {
      if (err) {
        logger.error(err);
        res.json(ret);
        return;
      }
      // pack the result
      const pack = {};
      Object.keys(ret).forEach((symbol) => {
        const token = ret[symbol];
        const item = pack[symbol] = {
          e: token.volume[0].ETH,
          u: token.volume[0].USD,
          r: token.rate.length?token.rate[0]["24h"]:0,
          p: []
        };
        token.points.forEach((p) => {
          item.p.push(p.rate);
        });
      });
      LocalCache.setSync(CACHE_KEY, {timestamp: Date.now(), value: pack},
        {ttl: CACHE_TTL});
      !cachedData && res.json(pack);
    });
  }

});
