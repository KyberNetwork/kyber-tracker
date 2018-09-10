const async                   = require('async');
const AppController           = require('./AppController');
const logger                  = log4js.getLogger('WebviewController');
const version                 = Date.now();

module.exports = AppController.extends({
  classname: 'NotFoundviewController',

  notFoundPage: function (req, res) {
    res.render('404', {
      msg: version,
    });
  },
});
