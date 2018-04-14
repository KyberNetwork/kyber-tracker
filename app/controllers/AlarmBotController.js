const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const bot                     = require('../bots/AlarmBot');


module.exports = AppController.extends({
  classname: 'AlarmBotController',

  alarm: function (req, res) {
    
    const [err, params] = new Checkit({
        message: ['string'],
        hash: ['string']
      }).validateSync(req.allParams);
  
      if (err) {
        res.badRequest(err.toString());
        return;
      }

    bot.alarm();
    res.sendStatus(200);
  },

  haveChat: function (req, res) {
    bot.processRequest(req.body);
    res.sendStatus(200);
  },

});