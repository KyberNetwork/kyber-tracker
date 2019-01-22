const async                   = require('async');
const AppController           = require('./AppController');
const logger                  = log4js.getLogger('WebviewController');
const version                 = Date.now();


module.exports = AppController.extends({
  classname: 'WebviewController',
  mainPage: function (req, res) {
    const globalState = {
      tokens: global.TOKENS_BY_ADDR
    }
    const transferString = `window["GLOBAL_STATE"]=${JSON.stringify(globalState)}`

    res.render('index', {
      title: 'Kyber Network Tracker',
      version: version,
      transferString: transferString
    });
  },

});
