const path = require('path');
const logger = log4js.getLogger('AlarmBot');
const Bot = require('node-telegram-bot-api');

const bot = new Bot(process.env.ALARM_BOT_TOKEN);

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

// Matches "/register [password]"
bot.onText(/^\/register (.+)$/, (msg, match) => {
    
    const chatId = msg.chat.id;
    const password = match[1]; // the captured "password"
  
    if (password === process.env.ALARM_BOT_PWD) {
        const key = getKey(msg);

        db.get(key, (err, val) => {
            if (!err) {
                bot.sendMessage(chatId, "Welcome back, you were *already* white listed.", {
                    reply_to_message_id: msg.message_id,
                    parse_mode: "Markdown"
                });
            } else {
                db.put(key, JSON.stringify(getValue(msg)), (err) => {
                    if (!err) {
                        bot.sendMessage(chatId,
                            "Hi there, you are white listed! Now you can sleep sound at nights!",{
                                reply_to_message_id: msg.message_id
                            });
                    } else {
                        bot.sendMessage(chatId,
                            "Cannot white list you. Please try again later. If failure persists, contact my master.", {
                                reply_to_message_id: msg.message_id
                            });
                    }
                })
            }
        })
    } else {
        bot.sendMessage(chatId, "No, *not this way*. To know how I work, please contact my master.", {
            reply_to_message_id: msg.message_id,
            parse_mode: "Markdown"
        });
    }
});


module.exports = {
    processRequest: (body) => {
        bot.processUpdate(body);
    },
    alarm: () => {
        db.createKeyStream()
        .on('data', function (data) {
            bot.sendMessage(data.substr(3), params.message);
        })
        .on('error', function (err) {
            logger.error("Fail to get white listed telegram accounts to alarm!");
        })
    },
    support: (body) => {
        if (!body.message) return false;
        if (!body.message.text) return false;
        return !!body.message.text.match(/^\/register (.+)$/);
    }
}