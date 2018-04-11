const Bot = require('node-telegram-bot-api');
const token = process.env.ALARM_BOT_TOKEN;
const bot = new Bot(token);
//bot.setWebHook(process.env.ALARM_BOT_URL + token);

module.exports = bot;
