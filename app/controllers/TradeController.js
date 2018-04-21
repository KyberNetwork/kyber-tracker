const _                       = require('lodash');
const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Const                   = require('../common/Const');
const Utils                   = require('sota-core').load('util/Utils');
const logger                  = log4js.getLogger('TradeController');

module.exports = AppController.extends({
  classname: 'TradeController',

  getTradesList: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      page: ['required', 'natural'],
      limit: ['required', 'naturalNonZero'],
      fromDate: ['naturalNonZero'],
      toDate: ['naturalNonZero'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getTradesList(params, this.ok.bind(this, req, res));
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
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const now = Utils.nowInSeconds();
    let fromDate = params.fromDate || 0;
    let toDate = params.toDate || now;

    const TradeService = req.getService('TradeService');
    TradeService.getTopTokensList(fromDate, toDate, this.ok.bind(this, req, res));
  },

  getStats24h: function (req, res) {
    const TradeService = req.getService('TradeService');
    TradeService.getStats24h(this.ok.bind(this, req, res));
  },

  getVolumes: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      period: ['string'],
      interval: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getNetworkVolumes(params, this.ok.bind(this, req, res));
  },

  getBurnedFees: function (req, res) {
    const [err, params] = new Checkit({
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getBurnedFees(params, this.ok.bind(this, req, res));
  },

  getCollectedFees: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getCollectedFees(params, this.ok.bind(this, req, res));
  },

  getToBurnFees: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getToBurnFees(params, this.ok.bind(this, req, res));
  },

  getToWalletFees: function (req, res) {
    const [err, params] = new Checkit({
      symbol: ['string'],
      interval: ['string'],
      period: ['string'],
      fromDate: ['natural'],
      toDate: ['natural']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');
    TradeService.getToWalletFees(params, this.ok.bind(this, req, res));
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
