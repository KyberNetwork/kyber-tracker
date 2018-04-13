const async                   = require('async');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Utils                   = require('sota-core').load('util/Utils');
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

function round(n) {
    return Math.round(n*10)/10;
}

function round2(n) {
    return Math.round(n*100)/100;
}

function format(n) {
    return round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sendHtml(html) {
    bot.sendMessage(bot, html, {
        parse_mode: "html"
    });
}

function keepReq(req) {
    if (!req.body) return false;
    if (!req.body.message) return false;
    if (!req.body.message.text) return false;

    const needDb = [
        /\/?last(.*)/,
        /\/?today/,
        /\/?yesterday/
    ]

    for (let i = 0; i < needDb.length; i++) {
        if (!!req.body.message.text.match(needDb[i])) {
            return true;
        }
    };

    return false;
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

function sendData(chatId, from, to, prefix, tellUtcTime) {
    const TradeService = bot._req.getService('TradeService');
    TradeService.getStats(from, to, (err, ret) => {
        if (!!err) {
            bot.sendMessage(chatId, "An unknown error occurs. Please try again later.");
            logger.error(err);
        } else {
            let text = prefix  + " SUMMARY";
            text += "\nVolume: " + format(ret.volumeEth) + " ETH ($" + format(ret.volumeUsd) + ")";
            text += "\nNumber of Tx: " + format(ret.tradeCount);
            text += "\nAverage ETH/Tx: " + round2(ret.volumeEth / ret.tradeCount);
            text += "\nBurn & Tax: " + format(ret.burnAndTax) + " KNC";
            text += "\n\nVIA PARTNER";
            text += "\nVolume: " + format(ret.partnerVolumeEth) + " ETH (" + round(100 * ret.partnerVolumeEth / ret.volumeEth) + "%)";
            text += "\nNumber of Tx: " + format(ret.partnerCount) + " (" + round(100 * ret.partnerCount / ret.tradeCount) + "%)";
            text += "\nAverage ETH/Tx: " + round2(ret.partnerVolumeEth / ret.partnerCount);
            text += "\nCommission: " + format(ret.commission) + " KNC";

            if (tellUtcTime) {
                text += "\n\nCurrent time in UTC: " + new Date().toUTCString();
            }

            bot.sendMessage(chatId, text);
            //sendHtml(text);
        }
        bot._res.sendStatus(200);
    });
}

// Matches "/last[whatever] or last[whatever]"
bot.onText(/\/?last(.*)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = (match[1] || "24h").trim().toUpperCase();

    const parts = resp.match(/^(\d+)(H|D)$/);
    if (!parts || parts.length != 3) {
        bot.sendMessage(chatId, "Invalid syntax. Try 'last 1d', 'last 12h', or just 'last'.");
        return;
    }

    const duration = parseInt(parts[1]);
    const type = parts[2];
    let seconds = duration * 60 * 60;
    if (type === "D") {
        seconds *= 24;
    }

    const nowSeconds = Utils.nowInSeconds();
    const sinceSeconds = nowSeconds - seconds;

    sendData(chatId, sinceSeconds, nowSeconds, resp)
});

// Matches "/today or today"
bot.onText(/\/?today/, (msg, match) => {
    const chatId = msg.chat.id;

    const nowSeconds = Utils.nowInSeconds() + 100;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todaySeconds = Math.floor(today.getTime() / 1000);
    
    sendData(chatId, todaySeconds, nowSeconds, "TODAY (UTC)", true);
});

// Matches "/yesterday or yesterday"
bot.onText(/\/?yesterday/, (msg, match) => {
    const chatId = msg.chat.id;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todaySeconds = Math.floor(today.getTime() / 1000);

    const yestSeconds = todaySeconds - 24 * 60 * 60;
    
    sendData(chatId, yestSeconds, todaySeconds, "YESTERDAY (UTC)", true);
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
    bot._req = req;
    bot._res = res;
    bot.processUpdate(req.body);
    
    if (!keepReq(req)) {
        res.sendStatus(200);
    }
  },

});