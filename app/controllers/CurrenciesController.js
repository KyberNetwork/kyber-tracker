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
      chain: ['string'],
      includeDelisted: ['string']
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
    let includeDelisted = params.includeDelisted;
    const ret = [];
    const tokens = require('../../config/network/chain')(chain).tokens;
    Object.keys(tokens).forEach(symbol => {
      if (Utils.shouldShowToken(symbol, tokens) && (includeDelisted ? true : !tokens[symbol].delisted)) {
        const token = tokens[symbol];
        const id = token.symbol || symbol;
        const data = {
          symbol: id,
          cmcName: token.cmcSymbol || id,
          name: token.name,
          decimals: token.decimal,
          contractAddress: token.address
        };
        if(includeDelisted && tokens[symbol].delisted){
          data.enable = false;
        }
        ret.push(data);
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
      CurrenciesService.getPair24hData({}, (err, rett) => {
        if (err) {
          logger.error(err);
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
    const loadData = (callback) => {
      service.getAllRateInfo({},(err, ret) => {
        if (err) {
          logger.error(err);
          return callback(err)
        }
        
        // redisCacheService.setCacheByKey(CACHE_KEY, ret, CACHE_TTL);
        const pack = data(ret);
        return callback(null, pack)
      });
    };

    var getCachedData = (callback) => {
      redisCacheService.getCacheByKey(CACHE_KEY, (err, ret) => {
        if (err) {
          logger.error(err)
          return callback(err)
        }
        if (ret) {
          const pack = data(JSON.parse(ret))
          return callback(null, pack)
        }
        // loadData();
        return callback(null, null)
      });
    }




    const data = (ret) =>{
      const pack = {};
      Object.keys(ret).forEach((symbol) => {
        const token = ret[symbol];
        const item = pack[symbol] = {
          r: token.rate && token.rate.length ? token.rate[0]["24h"] : 0,
          p: []
        };
        token.points && token.points.forEach((p) => {
          item.p.push(p.rate7d);
        });
      });
      return pack
    };



    getCachedData((err, ret) => {
      if(err) return res.send(err)

      if(!ret) return res.badRequest("No cached data")

      return res.json(ret)
    })

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
      }
      res.json(ret);
    });
  },
});
