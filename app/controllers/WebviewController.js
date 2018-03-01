const async                   = require('async');
const AppController           = require('./AppController');
const logger                  = log4js.getLogger('WebviewController');
const version                 = Date.now();

module.exports = AppController.extends({
  classname: 'WebviewController',

  mainPage: function (req, res) {
    res.render('index', {
      title: 'Kyber Tracker',
      version: version,
    });
  },

});
