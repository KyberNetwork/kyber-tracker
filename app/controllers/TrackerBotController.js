const AppController           = require('./AppController');
const bot                     = require('../bots/TrackerBot');

module.exports = AppController.extends({
  classname: 'TrackerBotController',

  haveChat: function (req, res) {
    bot.processRequest(req.body, {
      getService: (name = "TradeService") => {
        return req.getService(name)
      },
      finish: () => {
        res.sendStatus(200);
      }
    });
  }

});