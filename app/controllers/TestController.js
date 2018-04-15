const _                       = require('lodash');
const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Const                   = require('../common/Const');
const Utils                   = require('sota-core').load('util/Utils');
const logger                  = log4js.getLogger('TestController');

module.exports = AppController.extends({
  classname: 'TestController',

  testCustomQuery: function (req, res) {
    const TestService = req.getService('TestService');

    TestService.testCustomQuery(this.ok.bind(this, req, res));
  },

});
