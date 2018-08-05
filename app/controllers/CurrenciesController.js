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

    const [err, params] = new Checkit({
      chain: ['string']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const chain = params.chain;
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
      if (err) {
        logger.error(err);
        res.json(ret);
        return;
      }

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
      if (err) {
        logger.error(err);
        res.json(ret);
        return;
      }

      LocalCache.setSync(CACHE_KEY, ret, {ttl: Const.MINUTE_IN_MILLISECONDS});
      res.json(ret);
    });
  },

  _waitForCache: function (key, timeout, callback){
    if (timeout <= 0) {
      return callback("timeout", null);
    }

    let value = LocalCache.getSync(key);
    if(!value) {
      setTimeout(() => {
        this._waitForCache(key, timeout - 150, callback)
      }, 150);
    } else {
      callback(null, value);
    }
  },

  getAllRateInfo: function (req, res) {
    Utils.cors(res);
    const service = req.getService('CurrenciesService');
    
    const CACHE_KEY = 'allrates';
    const CACHE_FLAG = 'allrates-flag';
    const CACHE_TTL = 10 * Const.MINUTE_IN_MILLISECONDS;
    const PRELOAD_TIMING = CACHE_TTL - 60000; // 60 seconds

    const cachedData = LocalCache.getSync(CACHE_KEY);

    if (cachedData) {
      res.json(cachedData.value);
      if (Date.now() - cachedData.timestamp < PRELOAD_TIMING ||
       LocalCache.getSync(CACHE_FLAG) == '1') {
        return;
      }
    }

    if (LocalCache.getSync(CACHE_FLAG) == '1') {
      this._waitForCache(CACHE_KEY, 10000, (err, cacheValue) => {
        if (err) {
          LocalCache.setSync(CACHE_FLAG, '0');
          res.json({error: err});
        } else {
          res.json(cacheValue.value);
        }
      });
      return;
    } else {
      LocalCache.setSync(CACHE_FLAG, '1');
    }

    var loadData = () => {
      try {
        service.getAllRateInfo((err, ret) => {
          if (err) {
            LocalCache.setSync(CACHE_FLAG, '0');
            logger.error(err);
            !cachedData && res.json(ret);
            return;
          }
          // pack the result
          const pack = {};
          Object.keys(ret).forEach((symbol) => {
            const token = ret[symbol];
            const item = pack[symbol] = {
              //e: token.volume[0].ETH,
              //u: token.volume[0].USD,
              r: token.rate.length?token.rate[0]["24h"]:0,
              p: []
            };
            token.points.forEach((p) => {
              item.p.push(p.rate);
            });
          });
          LocalCache.setSync(CACHE_KEY, {timestamp: Date.now(), value: pack},
            {ttl: CACHE_TTL});
          LocalCache.setSync(CACHE_FLAG, '0');
          !cachedData && res.json(pack);
        });
      } catch (exception) {
        logger.error(exception);
        !cachedData && res.json([]);
      }
    };

    //if (!cachedData) {
      loadData();
    //} else {
    //  setTimeout(loadData, 100);
    //}
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
    var CACHE_KEY = 'get24hChangeData';
    if(params.usd){
      if(params.usd!=="1"){
        res.badRequest("please request follow rule.");
        return;
      }
      CACHE_KEY += 'usd';
    }
    logger.info(CACHE_KEY);
    const cachedData = LocalCache.getSync(CACHE_KEY);
    if (cachedData) {
      res.json(cachedData);
      return;
    }
    const service = req.getService('CurrenciesService');
    service.get24hChangeData(params,(err, ret) => {
      if (err) {
        logger.error(err);
        res.json(ret);
        return;
      }
      // cache 5'
      LocalCache.setSync(CACHE_KEY, ret, {ttl: 5*Const.MINUTE_IN_MILLISECONDS});
      res.json(ret);
    });
  },
});
