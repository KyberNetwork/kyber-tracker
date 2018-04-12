const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const logger                  = log4js.getLogger('HookController');
const path                    = require('path');
const bot                     = require('../common/Bot');

const level = require('level');
const db = level(path.join(__dirname, '../../db/telegram'));

function getKey(msg) {
    return "tg_" + msg.chat.id;
}

function getValue(msg) {
    return {
        chat_id: msg.chat.id,
        from: msg.from
    }
}

// Matches "/register[whatever]"
bot.onText(/\/register(.*)/, (msg, match) => {
    
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
  
    if (resp === " " + process.env.ALARM_BOT_PWD) {
        const key = getKey(msg);

        db.get(key, (err, val) => {
            if (!err) {
                bot.sendMessage(chatId, "Welcome back, you were already white listed.");
            } else {
                db.put(key, JSON.stringify(getValue(msg)), (err) => {
                    if (!err) {
                        bot.sendMessage(chatId, "Hi there, you are white listed! Now you can sleep sound at nights!");
                    } else {
                        bot.sendMessage(chatId, "Cannot white list you. Please try again later. If failure persists, contact my master.");
                    }
                })
            }
        })
    } else {
        bot.sendMessage(chatId, "No, not this way. To know how I work, please contact my master.");
    }
});

module.exports = AppController.extends({
  classname: 'HookController',

  alarm: function (req, res) {
    
    const [err, params] = new Checkit({
        message: ['string'],
        hash: ['string']
      }).validateSync(req.allParams);
  
      if (err) {
        res.badRequest(err.toString());
        return;
      }

    db.createKeyStream()
        .on('data', function (data) {
            bot.sendMessage(data.substr(3), params.message);
        })
        .on('error', function (err) {
            logger.error("Fail to get white listed telegram accounts to alarm!");
        })

    res.sendStatus(200);
  },

  haveChat: function (req, res) {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  },

});