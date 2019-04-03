const _ = require('lodash');
const async = require('async');
const AppController = require('./AppController');
// const network = require('../../config/network');
const Checkit = require('cc-checkit');
const Const = require('../common/Const');
const Utils = require('sota-core').load('util/Utils');
const Utils_Common = require('../common/Utils');
const logger = log4js.getLogger('TradeController');
const RedisCache = require('sota-core').load('cache/foundation/RedisCache');
const CacheInfo = require('../../config/cache/info');

module.exports = AppController.extends({
  classname: 'TradeController',

  getTradesList: function (req, res) {
    const [err, params] = new Checkit({
      address: ['string'],
      page: ['required', 'natural'],
      limit: ['required', 'naturalNonZero'],
      fromDate: ['naturalNonZero'],
      toDate: ['naturalNonZero'],
      official: ['string'],
      reserve: ['string']
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

    
    let key = `${CacheInfo.TradesList.key + params.page}-${params.limit}`;
    if (params.address) {
      const token = global.TOKENS_BY_ADDR[params.address];
      if (!token || !Utils_Common.shouldShowToken(params.address)) {
          res.json({
              s: "error",
              errmsg: "unknown_address " + params.address
          });
          return;
      }
      key = params.address + '-' + key;
    }
    if (params.fromDate) {
      key = params.fromDate + '-' + key;
    }
    if (params.toDate) {
      key = params.toDate + '-' + key;
    }
    if (params.reserve){
      key = params.reserve + '-' + key;
    }
    if(params.official){
      key = 'official-' + key
    }

    const TradeService = req.getService('TradeService');
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        res.send(JSON.parse(ret));
        return;
      }
      TradeService.getTradesList(params, (err, ret_1) => {
        if (err) {
          logger.error(err)
          res.badRequest(err.toString());
          return;
        }
        if (ret_1) {
          RedisCache.setAsync(key, JSON.stringify(ret_1), CacheInfo.TradesList.TTL);
          res.send(ret_1)
          return;
        }
      });
    });
  },

  getTradeDetails: function (req, res) {
    const [err, params] = new Checkit({
      tradeId: ['required', 'naturalNonZero'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getTradeDetails(params.tradeId, this.ok.bind(this, req, res));
  },

  getTopTokensList: function (req, res) {
    const [err, params] = new Checkit({
      fromDate: ['natural'],
      toDate: ['natural'],
      official: ['string']
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

    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    let key = `${CacheInfo.TopTokensList.key}${Math.floor(fromDate / 60)}-${Math.floor(toDate / 60)}`;
    if(params.official){
      key = 'official-' + key
    }

    const TradeService = req.getService('TradeService');
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        res.send(JSON.parse(ret));
        return;
      }
      let options = {
        fromDate: fromDate,
        toDate: toDate,
        official: params.official
      };
      TradeService.getTopTokensList(options, (err, ret_1) => {
        if (err) {
          logger.error(err)
          res.badRequest(err.toString());
          return;
        }
        if (ret_1) {
          RedisCache.setAsync(key, JSON.stringify(ret_1), CacheInfo.TopTokensList.TTL);
          res.send(ret_1)
          return;
        }
      });
    });
    // const TradeService = req.getService('TradeService');
    // TradeService.getTopTokensList(fromDate, toDate, this.ok.bind(this, req, res));
  },

  getTokens: function (req, res) {
    const [err, params] = new Checkit({
      fromDate: ['natural'],
      toDate: ['natural'],
      timeStamp: ['natural'],
      official: ['string']
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


    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    let key = `${CacheInfo.TokensList.key}${Math.floor(fromDate / 60)}-${Math.floor(toDate / 60)}`;
    if(params.timeStamp) key = key + '-' + params.timeStamp
    if(params.official){
      key = 'official-' + key
    }
    const TradeService = req.getService('TradeService');
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
      }
      if (ret) {
        res.send(JSON.parse(ret));
        return;
      }
      let options = {
        fromDate: fromDate,
        toDate: toDate,
        timeStamp: params.timeStamp,
        official: params.official
      };
      TradeService.getTokensList(options, (err, ret_1) => {
        if (err) {
          logger.error(err)
          res.badRequest(err.toString());
          return;
        }
        if (ret_1) {
          RedisCache.setAsync(key, JSON.stringify(ret_1), CacheInfo.TokensList.TTL);
          res.send(ret_1)
          return;
        }
      });
    });
    // const TradeService = req.getService('TradeService');
    // TradeService.getTopTokensList(fromDate, toDate, this.ok.bind(this, req, res));
  },

  getReservesList: function (req, res) {
    // const [err, params] = new Checkit({
    //   fromDate: ['natural'],
    //   toDate: ['natural'],
    // }).validateSync(req.allParams);

    // if (err) {
    //   res.badRequest(err.toString());
    //   return;
    // }

    // if(!params.fromDate) params.fromDate = 0;
    // if(!params.toDate){
    //   params.toDate = Utils.nowInSeconds()
    // }

    let key = `${CacheInfo.ReservesList.key}`;

    

    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
        return res.send(err)
      }
      if (ret) {
        return res.send(JSON.parse(ret));
      }

      const TradeService = req.getService('TradeService');
      TradeService.getReservesList({}, (err, results) => {
        if (err) {
          logger.error(err)
          res.badRequest(err.toString());
          return;
        }
  
        if (results) {
          RedisCache.setAsync(key, JSON.stringify(results), CacheInfo.ReservesList.TTL);
        }
        return res.json(results)
      });
    })
  },
  
  getReserveDetails: function (req, res) {
    const [err, params] = new Checkit({
      reserveAddr: ['required', 'string'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }
    let key = CacheInfo.ReserveDetail.key + '-' + params.reserveAddr;

    if(params.fromDate){
      key = key + '-' + params.fromDate
    } else {
      params.fromDate = 0;
    } 

    if(params.toDate){
      key = key + '-' + params.toDate
    } else {
      params.toDate = Utils.nowInSeconds()
    }

    
    RedisCache.getAsync(key, (err, ret) => {
      if (err) {
        logger.error(err)
        return res.send(err)
      }
      if (ret) {
        return res.send(JSON.parse(ret));
      }
      const TradeService = req.getService('TradeService');
      TradeService.getReserveDetails(params, (err, results) => {
        if (err) {
          logger.error(err)
          return res.send(err)
        }

        if (results) {
          RedisCache.setAsync(key, JSON.stringify(results), CacheInfo.ReservesList.TTL);
        }
        return res.json(results)
      });
    })
    
  },

  getStats24h: function (req, res) {
    const [err, params] = new Checkit({
      official: ['string']
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

    const TradeService = req.getService('TradeService');
    TradeService.getStats24h(params, this.ok.bind(this, req, res));
  },

  getVolumes: function (req, res) {
    const [err, params] = new Checkit({
      address: ['string'],
      period: ['string'],
      interval: ['string'],
      fromDate: ['natural'],
      toDate: ['natural'],
      pair: ['string'],
      official: ['string']
    }).validateSync(req.allParams);

    if (err || (params.interval && !Const.INTERVAL.includes(params.interval))) {
      res.badRequest(err && err.toString() || "Interval is not support");
      return;
    }

    if(!params.official || params.official == 'true'){
      params.official = true
    } else {
      params.official = false
    }


    const TradeService = req.getService('TradeService');
    TradeService.getNetworkVolumes(params, this.ok.bind(this, req, res));
  },

  getVolumesPairToken: function (req, res) {
    const [err, params] = new Checkit({
      fromTime: ['natural'],
      toTime: ['natural'],
      pairs: ['required', 'string']
    }).validateSync(req.allParams);
    if (err) {
      res.badRequest(err && err.toString());
      return;
    }

    const pairsArray = params.pairs.split(" ")
    params.pairsArray = pairsArray

    const TradeService = req.getService('TradeService');
    TradeService.getPairsVolumes(params, (errs, results) => {
      if (errs) {
        logger.error(errs)  
        return res.json({
          success: false
        }); 
      }
      return res.json({
        success: true,
        data: results
      });
    });
  },

  getBurnedFees: function (req, res) {
    const [err, params] = new Checkit({
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err || (params.interval && !Const.INTERVAL.includes(params.interval))) {
      res.badRequest(err && err.toString() || "Interval is not support");
      return;
    }


    const TradeService = req.getService('TradeService');
    TradeService.getBurnedFees(params, this.ok.bind(this, req, res));
  },

  getCollectedFees: function (req, res) {
    const [err, params] = new Checkit({
      address: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural'],
      official: ['string']
    }).validateSync(req.allParams);

    if (err || (params.interval && !Const.INTERVAL.includes(params.interval))) {
      res.badRequest(err && err.toString() || "Unsupported interval");
      return;
    }

    if(!params.official || params.official == 'true'){
      params.official = true
    } else {
      params.official = false
    }


    const TradeService = req.getService('TradeService');
    TradeService.getCollectedFees(params, this.ok.bind(this, req, res));
  },

  getToBurnFees: function (req, res) {
    const [err, params] = new Checkit({
      address: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural'],
      official: ['string']
    }).validateSync(req.allParams);

    if (err || (params.interval && !Const.INTERVAL.includes(params.interval))) {
      res.badRequest(err && err.toString() || "Interval is not support");
      return;
    }

    if(!params.official || params.official == 'true'){
      params.official = true
    } else {
      params.official = false
    }


    const TradeService = req.getService('TradeService');
    TradeService.getToBurnFees(params, this.ok.bind(this, req, res));
  },

  getToWalletFees: function (req, res) {
    const [err, params] = new Checkit({
      address: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural'],
      official: ['string']
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


    const TradeService = req.getService('TradeService');
    TradeService.getToWalletFees(params, this.ok.bind(this, req, res));
  },

  getPartnerDetail: function (req, res) {
    const [err, params] = new Checkit({
      exportData: ['string'],
      partnerId: ['required', 'string'],
      page: ['natural'],
      limit: ['naturalNonZero'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getPartnerDetail(params, this.ok.bind(this, req, res));

  },

  search: function (req, res) {
    const [err, params] = new Checkit({
      exportData: ['string'],
      q: ['required', 'string'],
      page: ['natural'],
      limit: ['naturalNonZero'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.search(params, this.ok.bind(this, req, res));
  },

  

  /*
  NOT USED
  countMarkerAddress: function (req, res) {
    const [err, params] = new Checkit({
      markerAddress: ['required', 'string'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    const TradeService = req.getService('TradeService');
    TradeService.getCountMarkerAddress(params.markerAddress, fromDate, toDate, this.ok.bind(this, req, res));
  },

  sumMarkerAddress: function (req, res) {
    const [err, params] = new Checkit({
      markerAddress: ['required', 'string'],
      fromDate: ['natural'],
      toDate: ['natural'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    const TradeService = req.getService('TradeService');
    TradeService.getSumMarkerAddress(params.markerAddress, fromDate, toDate, this.ok.bind(this, req, res));
  },
  */

});
