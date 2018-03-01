const _                       = require('lodash');
const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Const                   = require('../common/Const');
const logger                  = log4js.getLogger('TradeController');

module.exports = AppController.extends({
  classname: 'TradeController',

  getList: function (req, res) {
    const [err, params] = new Checkit({
      'page': ['naturalNonZero'],
      'fromDate': ['naturalNonZero'],
      'toDate': ['naturalNonZero'],
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

});
