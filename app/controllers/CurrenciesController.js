const _ = require('lodash');
const async = require('async');
const AppController = require('./AppController');
const Checkit = require('cc-checkit');
const Const = require('../common/Const');
const Utils = require('../common/Utils');
// const network = require('../../config/network');
const logger = log4js.getLogger('CurrenciesController');
const CacheInfo = require('../../config/cache/info');

module.exports = AppController.extends({
  classname: 'CurrenciesController',

  getSupportedTokens: function (req, res) {
    Utils.cors(res);

    const [err, params] = new Checkit({
      chain: ['string'],
      includeDelisted: ['string'],
      official: ['string']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    // if(!params.official || params.official == 'true'){
    //   params.official = true
    // } else {
    //   params.official = false
    // }
    params.official = true

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
    // const tokens = require('../../config/network/chain')(chain).tokens;
    Object.keys(global.TOKENS_BY_ADDR).forEach(address => {
      if (Utils.shouldShowToken(address, global.TOKENS_BY_ADDR) && 
      (includeDelisted ? true : !global.TOKENS_BY_ADDR[address].delisted) &&
      Utils.filterOfficial(params.official, global.TOKENS_BY_ADDR[address])
      ) {
        const token = global.TOKENS_BY_ADDR[address];
        const id = token.address || address;
        const data = {
          address: id,
          cmcName: token.cmcSymbol || id,
          name: token.name,
          decimals: token.decimal,
          contractAddress: token.address
        };
        if(includeDelisted && tokens[address].delisted){
          data.enable = false;
        }
        ret.push(data);
      }
    });
    res.json(ret);
  },

  getConvertiblePairs: function (req, res) {
    Utils.cors(res);

    const [err, params] = new Checkit({
      useAddress: ['string']
    }).validateSync(req.allParams);

    // if (err) {
    //   res.badRequest(err.toString());
    //   return;
    // }
    if(params.useAddress == 'true'){
      params.useAddress = true
    } else {
      params.useAddress = false
    }

    params.official = true
    // const params = {official: true}

    let CACHE_KEY = CacheInfo.ConvertiblePairs.key;
    if(params.official){
      CACHE_KEY = 'official-' + CACHE_KEY
    }

    if(params.useAddress){
      CACHE_KEY = 'useAddress-' + CACHE_KEY
    }

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
      CurrenciesService.getConvertiblePairs(params, (err, rett) => {
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

    // const [err, params] = new Checkit({
    //   official: ['string']
    // }).validateSync(req.allParams);

    // if (err) {
    //   res.badRequest(err.toString());
    //   return;
    // }
    // if(!params.official || params.official == 'true'){
    //   params.official = true
    // } else {
    //   params.official = false
    // }
    const params = {official: true}

    let CACHE_KEY = CacheInfo.Pair24hData.key;
    if(params.official){
      CACHE_KEY = 'official-' + CACHE_KEY
    }
    const CurrenciesService = req.getService('CurrenciesService');
    const redisCacheService = req.getService('RedisCacheService');

    if(params.official){
      CACHE_KEY = 'official-' + CACHE_KEY
    }

    redisCacheService.getCacheByKey(CACHE_KEY, (err, ret) => {
      if (err) {
        logger.error(err)
        return res.json(err);
      }
      if(!ret) return res.badRequest("No cached data")

      return res.json(JSON.parse(ret));
    });
  },

  getAllRateInfo: function (req, res) {
    Utils.cors(res);

    const [err, params] = new Checkit({
      useAddress: ['string']
    }).validateSync(req.allParams);

    // if (err) {
    //   res.badRequest(err.toString());
    //   return;
    // }
    if(params.useAddress == 'true'){
      params.useAddress = true
    } else {
      params.useAddress = false
    }

    params.official = true
    // const params = {official: true}

    const service = req.getService('CurrenciesService');

    const CACHE_KEY = CacheInfo.CurrenciesAllRates.key;
    if(params.official){
      CACHE_KEY = 'official-' + CACHE_KEY
    }

    if(params.useAddress){
      CACHE_KEY = 'useAddress-' + CACHE_KEY
    }
    const redisCacheService = req.getService('RedisCacheService');

    const getCachedData = (callback) => {
      redisCacheService.getCacheByKey(CACHE_KEY, (err, ret) => {
        if (err) {
          logger.error(err)
          return callback(err)
        }
        if (ret) {
          const pack = JSON.parse(ret)
          return callback(null, pack)
        }
        return callback(null, null)
      });
    }


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
      official: ['string'],
      useAddress: ['string']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }
    if(!params.official || params.official == 'true'){
      params.official = true
    } else {
      params.official = false
    }

    if(params.useAddress == 'true'){
      params.useAddress = true
    } else {
      params.useAddress = false
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
