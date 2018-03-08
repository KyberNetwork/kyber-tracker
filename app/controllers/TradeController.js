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
      fromDate: ['naturalNonZero'],
      toDate: ['naturalNonZero'],
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const TradeService = req.getService('TradeService');

    if (req.pagination.type === 'cursor') {
      TradeService.getTradesList(params, req.pagination, this.ok.bind(this, req, res));
    } else if (req.pagination.type === 'cursor2') {
      const pagination = _.merge(req.pagination, Const.DEFAULT_PAGINATION);
      TradeService.getTradesList2(params, pagination, this.ok.bind(this, req, res));
    } else {
      res.badRequest(`Please use a valid pagination option.`);
    }
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

  getBurnedFees: function (req, res) {
    return res.badRequest(`TODO: implement me.`);
  },

});
