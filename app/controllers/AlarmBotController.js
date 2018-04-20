const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const alarmBot                = require('../bots/AlarmBot');
const trackerBot              = require('../bots/TrackerBot');


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

    alarmBot.alarm();
    res.sendStatus(200);
  },

  haveChat: function (req, res) {
    if (alarmBot.support(req.body)) {
      alarmBot.processRequest(req.body);
      res.sendStatus(200);
    } else {
      trackerBot.processRequest(req.body, {
        botToken: process.env.ALARM_BOT_TOKEN,
        internal: true,
        getService: (name = "TradeService") => {
          return req.getService(name)
        },
        finish: () => {
          res.sendStatus(200);
        }
      });
    }
  },

});