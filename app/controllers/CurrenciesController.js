const _                       = require('lodash');
const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Const                   = require('../common/Const');
const Utils                   = require('sota-core').load('util/Utils');
const logger                  = log4js.getLogger('CurrenciesController');

module.exports = AppController.extends({
  classname: 'CurrenciesController',

  getConvertiblePairs: function (req, res) {

    console.log("################# get covertiple pairs ")
    
    // const [err, params] = new Checkit({
    //   symbol: ['string'],
    //   page: ['required', 'natural'],
    //   limit: ['required', 'naturalNonZero'],
    //   fromDate: ['naturalNonZero'],
    //   toDate: ['naturalNonZero'],
    // }).validateSync(req.allParams);

    // if (err) {
    //   res.badRequest(err.toString());
    //   return;
    // }

    const CurrenciesService = req.getService('CurrenciesService');
    CurrenciesService.getConvertiblePairs(this.ok.bind(this, req, res));
  },

  getCurrencyInfo: function (req, res) {
    const [err, params] = new Checkit({
      token: ['string', 'required'],
      fromCurrencyCode: ['string', 'required']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const CurrenciesService = req.getService('CurrenciesService');
    CurrenciesService.getCurrencyInfo(params, this.ok.bind(this, req, res));
  }

});
