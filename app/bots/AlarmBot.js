const path = require('path');
const logger = log4js.getLogger('AlarmBot');
const Bot = require('node-telegram-bot-api');

const bot = new Bot(process.env.ALARM_BOT_TOKEN);

const level = require('level');
const db = level(path.join(__dirname, '../../db/telegram'));

function getKey(msg) {
    if (!!msg.chat && !!msg.chat.id) {
        return "tg_" + msg.chat.id;
    }

    return "tg_" + msg;
}

function getValue(msg) {
    return {
        chat: msg.chat,
        from: msg.from
    }
}

const commands = {
    register: /^\/register(?:@\w+)? (.+)$/,
    list: /^\/list(?:@\w+)? (.+)$/,
    unregister: /^\/unregister(?:@\w+)?(?:\s+(\S+)\s+(\S+))?$/
}

function support(body) {
    if (!body.message) return false;
    if (!body.message.text) return false;

    const text = body.message.text;

    for (let key in commands) {
        const regex = commands[key];

        if (regex.test(text)) {
            return true;
        }
    }

    return false;
}

// Matches "/register [password]"
bot.onText(commands.register, (msg, match) => {
    
    const chatId = msg.chat.id;
    const password = match[1]; // the captured "password"
  
    if (password === process.env.ALARM_BOT_PWD) {
        const key = getKey(msg);

        db.get(key, (err, val) => {
            if (!err) {
                bot.sendMessage(chatId, "This conversation were already white-listed, so no need to register again.", {
                    reply_to_message_id: msg.message_id
                });
            } else {
                if (err.notFound) {
                    db.put(key, JSON.stringify(getValue(msg)), (err) => {
                        if (!err) {
                            bot.sendMessage(chatId,
                                "Success!",{
                                    reply_to_message_id: msg.message_id
                                });
                        } else {
                            logger.error(err);
                            bot.sendMessage(chatId,
                                "Error!", {
                                    reply_to_message_id: msg.message_id
                                });
                        }
                    })
                } else {
                    logger.error(err);
                    bot.sendMessage(chatId,
                        "Error!", {
                            reply_to_message_id: msg.message_id
                        });
                }
            }
        })
    } else {
        bot.sendMessage(chatId, "Invalid!", {
            reply_to_message_id: msg.message_id
        });
    }
});

// Matches "/unregister" or "/unregister [password] [chatId]"
bot.onText(commands.unregister, (msg, match) => {
    
    let chatId = msg.chat.id;

    if (match.length > 2 && typeof(match[1]) !== "undefined") {
        if (match[1] === process.env.ALARM_BOT_PWD) {
            chatId = match[2].trim();
        } else {
            bot.sendMessage(msg.chat.id, "Invalid!", {
                reply_to_message_id: msg.message_id
            });
            return;
        }
    }
    let password = match[1];   
  
    const key = getKey(chatId);
    db.get(key, (err, val) => {
        if (!err) {
            db.del(key, (err) => {
                if (!err) {
                    bot.sendMessage(msg.chat.id,
                        "Success!",{
                            reply_to_message_id: msg.message_id
                        });
                } else {
                    logger.error(err);
                    bot.sendMessage(msg.chat.id,
                        "Error!", {
                            reply_to_message_id: msg.message_id
                        });
                }
            })
        } else {
            if (err.notFound) {
                bot.sendMessage(msg.chat.id, "The conversation is not registerd so no need to unregister.", {
                    reply_to_message_id: msg.message_id
                });
            } else {
                logger.error(err);
                bot.sendMessage(msg.chat.id,
                    "Error!", {
                        reply_to_message_id: msg.message_id
                    });
            }
        }
    })
});

// Matches "/list [password]"
bot.onText(commands.list, (msg, match) => {

    const chatId = msg.chat.id;
    const password = match[1]; // the captured "password"

    if (password === process.env.ALARM_BOT_PWD) {
        let text = "";
        let count = 0;
        db.createValueStream()
            .on('data', function (data) {
                count++;
                const chat = JSON.parse(data).chat;
                text += `\n${count}. ${chat.type} ${chat.username ? ("@" + chat.username) : chat.title} (ID: ${chat.id})`;
            })
            .on('error', function (err) {
                logger.error(err);
            })
            .on('end', function () {
                if (!text.length) {
                    text = "No registered users or groups.";
                } else {
                    text = "REGISTERED: " + count + text;
                }
                bot.sendMessage(chatId, text, {
                    reply_to_message_id: msg.message_id,
                    parse_mode: "Markdown"
                });
            });
    } else {
        bot.sendMessage(chatId, "Invalid!", {
            reply_to_message_id: msg.message_id
        });
    }
});


module.exports = {
    processRequest: (body) => {
        bot.processUpdate(body);
    },
    alarm: (params) => {
        db.createKeyStream()
        .on('data', function (data) {
            const text = "================\n‼️ ATTENTION ‼️\n================\n" + params.message; 
            try {
                bot.sendMessage(data.substr(3), text);
            } catch(err) {
                logger.error(err);
            }
        })
        .on('error', function (err) {
            logger.error(err);
        })
    },
    support: support
}