const async                   = require('async');
const AppController           = require('./AppController');
const logger                  = log4js.getLogger('WebviewController');
const version                 = Date.now();

const globalState = {
  tokens: global.GLOBAL_TOKEN
}

const transferString = `window["GLOBAL_STATE"]=${JSON.stringify(globalState)}`
module.exports = AppController.extends({
  classname: 'WebviewController',
  mainPage: function (req, res) {
    res.render('index', {
      title: 'Kyber Network Tracker',
      version: version,
      transferString: transferString
    });
  },

});
