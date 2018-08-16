const _ = require('lodash');
const async = require('async');
const AppController = require('./AppController');
const Checkit = require('cc-checkit');
const Const = require('../common/Const');
const Utils = require('../common/Utils');
const network = require('../../config/network');
const logger = log4js.getLogger('CurrenciesController');
const CacheInfo = require('../../config/cache/info');

module.exports = AppController.extends({
  classname: 'CurrenciesController',

  getSupportedTokens: function (req, res) {
    Utils.cors(res);

    const [err, params] = new Checkit({
      chain: ['string']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    let chain = params.chain;
    if (chain === "mainnet") {
      chain = "production";
    }
    if (chain && chain !== "ropsten" && chain !== "staging" && chain !== "production") {
      res.badRequest("Unknown chain: " + chain);
      return;
    }

    const ret = [];
    const tokens = require('../../config/network/chain')(chain).tokens;
    Object.keys(tokens).forEach(symbol => {
      if (Utils.shouldShowToken(symbol, tokens) && !tokens[symbol].delisted) {
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

    const CACHE_KEY = CacheInfo.ConvertiblePairs.key;
    const CurrenciesService = req.getService('CurrenciesService');
    const redisCacheService = req.getService('RedisCacheService');
    redisCacheService.getCacheByKey(CACHE_KEY, (err, ret) => {
      if (err) {
        logger.error(err)
        res.json(ret);
        return;
      }
      if (ret) {
        res.send(ret);
        return;
      }
      CurrenciesService.getConvertiblePairs((err, rett) => {
        if (err) {
          logger.error(err);
          res.json(rett);
          return;
        }
        redisCacheService.setCacheByKey(CACHE_KEY, rett, CacheInfo.ConvertiblePairs.TTL);
        res.json(rett);
      });
    });
  },

  getPair24hData: function (req, res) {
    Utils.cors(res);

    const CACHE_KEY = CacheInfo.Pair24hData.key;
    const CurrenciesService = req.getService('CurrenciesService');
    const redisCacheService = req.getService('RedisCacheService');
    redisCacheService.getCacheByKey(CACHE_KEY, (err, ret) => {
      if (err) {
        logger.error(err)
        res.json(ret);
        return;
      }
      if (ret) {
        res.send(ret);
        return;
      }
      CurrenciesService.getPair24hData((err, rett) => {
        if (err) {
          logger.error(err);
          res.json(rett);
          return;
        }
        redisCacheService.setCacheByKey(CACHE_KEY, rett, CacheInfo.Pair24hData.TTL);
        res.json(rett);
      });
    });
  },

  getAllRateInfo: function (req, res) {
    Utils.cors(res);
    const service = req.getService('CurrenciesService');

    const CACHE_KEY = CacheInfo.CurrenciesAllRates.key;
    const CACHE_TTL = CacheInfo.CurrenciesAllRates.TTL;
    const redisCacheService = req.getService('RedisCacheService');
    var loadData = () => {
      service.getAllRateInfo({},(err, ret) => {
        if (err) {
          logger.error(err);
          res.json(ret);
          return;
        }
        // pack the result
        const pack = data(ret);
        res.json(pack);
        redisCacheService.setCacheByKey(CACHE_KEY, ret, CACHE_TTL);
      });
    };
    const data = (ret) =>{
      const pack = {};
      Object.keys(ret).forEach((symbol) => {
        const token = ret[symbol];
        const item = pack[symbol] = {
          //e: token.volume[0].ETH,
          //u: token.volume[0].USD,
          r: token.rate.length ? token.rate[0]["24h"] : 0,
          p: []
        };
        token.points.forEach((p) => {
          item.p.push(p.rate7d);
        });
      });
      return pack
    };
    redisCacheService.getCacheByKey(CACHE_KEY, (err, ret) => {
      if (err) {
        logger.error(err)
        res.json(ret);
        return;
      }
      if (ret) {
        const pack = data(JSON.parse(ret))
        res.json(pack);
        return;
      }
      loadData();
    });

  },

  // rate 24h change
  get24hChangeData: function (req, res) {
    Utils.cors(res);
    const [err, params] = new Checkit({
      usd: ['string'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }
    const service = req.getService('CurrenciesService');
    service.get24hChangeData(params, (err, ret) => {
      if (err) {
        logger.error(err);
        res.json(ret);
        return;
      }
      res.json(ret);
    });
  },
});
