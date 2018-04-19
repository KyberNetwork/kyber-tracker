const Utils = require('sota-core').load('util/Utils');
const logger = log4js.getLogger('TrackerBot');
const Bot = require('node-telegram-bot-api');

const commands = {
    start: {
        regex: /\b\/?start(?:@\w+)?\s*$/i
    },
    help: {
        regex: /\b\/?help(?:@\w+)?\s*$/i
    },
    last: {
        regex: /\b\/?last(?:@\w+)?(?:\s+(\w+))?\s*$/i,
        needDb: true
    },
    today: {
        regex: /\b\/?today(?:@\w+)?\s*$/i,
        needDb: true
    },
    yesterday: {
        regex: /\b\/?yesterday(?:@\w+)?\s*$/i,
        needDb: true
    },
    burn: {
        regex: /\b\/?burn(?:@\w+)?\s*$/i,
        needDb: true
    }
}

function keepReq(body) {
    if (!body.message) return false;
    if (!body.message.text) return false;

    const text = body.message.text;

    const needDb = [
        commands.last,
        commands.today,
        commands.yesterday,
        commands.burn,
    ]

    for (let key in commands) {
        const value = commands[key];
        if (value.needDb && !!text.match(value.regex)) {
            return true;
        }
    }

    return false;
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

function percent(a, b) {
    if (!b) return "";
    return " (" + round(100 * a / b) + "%)";
}

function average(volume, count) {
    if (!count) return "N/A";
    return round2(volume / count);
}

function sendData(bot, chatId, from, to, prefix, tellUtcTime) {
    const TradeService = bot._tracker.getService();
    TradeService.getStats(from, to, (err, ret) => {
        if (!!err) {
            bot.sendMessage(chatId, "An unknown error occurs. Please try again later.");
            logger.error(err);
        } else {
            let text = prefix  + " SUMMARY";
            text += "\n=================";
            text += "\nVolume: " + format(ret.volumeEth) + " ETH ($" + format(ret.volumeUsd) + ")";
            text += "\nNumber of Tx: " + format(ret.tradeCount);
            text += "\nAverage ETH/Tx: " + average(ret.volumeEth, ret.tradeCount);
            text += "\nBurn & Tax: " + format(ret.burnAndTax) + " KNC";
            text += "\n\nVIA PARTNER";
            text += "\n=================";
            text += "\nVolume: " + format(ret.partnerVolumeEth) + " ETH" + percent(ret.partnerVolumeEth, ret.volumeEth);
            text += "\nNumber of Tx: " + format(ret.partnerCount) + percent(ret.partnerCount, ret.tradeCount);
            text += "\nAverage ETH/Tx: " + average(ret.partnerVolumeEth, ret.partnerCount);
            text += "\nCommission: " + format(ret.commission) + " KNC";

            if (tellUtcTime) {
                text += "\n\nCurrent time in UTC: " + new Date().toUTCString();
            }

            bot.sendMessage(chatId, text);
            //sendHtml(text);
        }
        bot._tracker.finish();
    });
}

function setupBot(bot) {

    // Matches "/start[whatever] or start[whatever]"
    bot.onText(commands.start, (msg, match) => {
        let text = "Please type a command.\n\n";
        text += "Example:\n";
        text += "/last to view summary for last 24h\n";
        text += "You could also type 'last 7d' or 'last 10h'. ";
        text += "It supports 'd' and 'h'.\n\n";
        text += "/today to view summary for today (UTC time)\n";
        text += "/yesterday to view summary for yesterday (UTC time)";
        text += "\n\nThe '/' character is optional.";

        bot.sendMessage(msg.chat.id, text);
    });

    // Matches "/help[whatever] or help[whatever]"
    bot.onText(commands.help, (msg, match) => {
        let text = "/last to view summary for last 24h\n";
        text += "You could also type 'last 7d' or 'last 10h'. ";
        text += "It supports 'd' and 'h'.\n\n";
        text += "/today to view summary for today (UTC time)\n";
        text += "/yesterday to view summary for yesterday (UTC time)";
        text += "\n\nThe '/' character is optional.";

        bot.sendMessage(msg.chat.id, text);
    });

    // Matches "/last[whatever] or last[whatever]"
    bot.onText(commands.last, (msg, match) => {
        const chatId = msg.chat.id;
        const resp = (match[1] || "24h").trim().toUpperCase();

        const parts = resp.match(/^(\d+)(H|D)$/);
        if (!parts || parts.length != 3) {
            bot.sendMessage(chatId, "Invalid syntax. Try _last 1d_, _last 12h_, or just _last_.", {
                reply_to_message_id: msg.message_id,
                parse_mode: "Markdown"
            });
            bot._tracker.finish();
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

        sendData(bot, chatId, sinceSeconds, nowSeconds, resp)
    });

    // Matches "/today or today"
    bot.onText(commands.today, (msg, match) => {
        const chatId = msg.chat.id;

        const nowSeconds = Utils.nowInSeconds() + 100;
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todaySeconds = Math.floor(today.getTime() / 1000);
        
        sendData(bot, chatId, todaySeconds, nowSeconds, "TODAY (UTC)", true);
    });

    // Matches "/yesterday or yesterday"
    bot.onText(commands.yesterday, (msg, match) => {
        const chatId = msg.chat.id;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todaySeconds = Math.floor(today.getTime() / 1000);

        const yestSeconds = todaySeconds - 24 * 60 * 60;
        
        sendData(bot, chatId, yestSeconds, todaySeconds, "YESTERDAY (UTC)", true);
    });

    // Matches "/burn or burn"
    bot.onText(commands.burn, (msg, match) => {
        const chatId = msg.chat.id;

        const nowSeconds = Utils.nowInSeconds() + 100;
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todaySeconds = Math.floor(today.getTime() / 1000);
        
        sendData(bot, chatId, todaySeconds, nowSeconds, "TODAY (UTC)", true);
    });
}

module.exports = {
    processRequest: (body, options) => {
        // new bot per req, to avoid concerns about simultanous requests
        const bot = new Bot(process.env.TRACKER_BOT_TOKEN);
        bot._tracker = options;
        setupBot(bot);
        bot.processUpdate(body);

        if (!keepReq(body)) {
            options.finish();
        }
    }
};