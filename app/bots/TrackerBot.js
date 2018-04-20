const Utils = require('sota-core').load('util/Utils');
const logger = log4js.getLogger('TrackerBot');
const Bot = require('node-telegram-bot-api');

const commands = {
    start: {
        regex: /\b\/?start(?:@\w+)?\b/i
    },
    help: {
        regex: /\b\/?help(?:@\w+)?\b/i
    },
    last: {
        regex: /\b\/?last(?:@\w+)?(?:\s+(\w+))?\b/i,
        needDb: true
    },
    today: {
        regex: /\b\/?today(?:@\w+)?\b/i,
        needDb: true
    },
    yesterday: {
        regex: /\b\/?yesterday(?:@\w+)?\b/i,
        needDb: true
    },
    burn: {
        regex: /\b\/?burn(?:@\w+)?\b/i,
        needDb: true
    }
}

function keepReq(body) {
    if (!body.message) return false;
    if (!body.message.text) return false;

    const text = body.message.text;

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
    if (!n) return "N/A";
    return round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function mention(user) {
    if (user.username) {
        return `[@${user.username}](tg://user?id=${user.id})`;
    } else {
        return `[@${user.first_name}${user.last_name?(" " + user.last_name):""}](tg://user?id=${user.id})`;
    }
}

function reply(bot, msg, markdown, autoMention = true) {
    if (autoMention && msg.reply_to_message && msg.reply_to_message.from &&
        msg.reply_to_message.from.id != msg.from.id && !msg.reply_to_message.from.is_bot) {
        markdown = mention(msg.reply_to_message.from) + "\n" + markdown;
    }
    bot.sendMessage(msg.chat.id, markdown, {
        reply_to_message_id: msg.message_id,
        parse_mode: "Markdown"
    });
}

function percent(a, b) {
    if (!b) return "N/A ";
    return round(100 * a / b);
}

function average(volume, count) {
    if (!count) return "N/A";
    return round2(volume / count);
}

function sendData(bot, msg, from, to, prefix, tellUtcTime) {
    const TradeService = bot._tracker.getService();
    const internal = !!bot._tracker.internal;
    TradeService.getStats(from, to, internal, (err, ret) => {
        if (!!err) {
            reply(bot, msg, "An unknown error occurs. Please try again later.");
            logger.error(err);
        } else {
            let text = `*${prefix}* VOLUME`;
            text += "\n=================";
            text += `\nVolume: *${format(ret.volumeEth)} ETH* ($${format(ret.volumeUsd)})`;
            text += `\nNumber of Tx: *${format(ret.tradeCount)}*`;
            text += `\nAverage ETH/Tx: *${average(ret.volumeEth, ret.tradeCount)}*`;
            if (internal) {
                text += `\nBurn & Tax: *${format(ret.burnAndTax)} KNC*`;
                text += "\n\nCOMMISSIONED PARTNER";
                text += "\n=================";
                text += `\nVolume: *${format(ret.partnerVolumeEth)} ETH* (${percent(ret.partnerVolumeEth, ret.volumeEth)}%)`;
                text += `\nNumber of Tx: *${format(ret.partnerCount)}* (${percent(ret.partnerCount, ret.tradeCount)}%)`;
                text += `\nAverage ETH/Tx: *${average(ret.partnerVolumeEth, ret.partnerCount)}*`;
                text += `\nCommission: *${format(ret.commission)} KNC*`;
            }

            if (tellUtcTime) {
                text += `\n\nCurrent time in UTC: *${new Date().toUTCString()}*`;
            }

            reply(bot, msg, text);
        }
        bot._tracker.finish();
    });
}

function setupBot(bot) {

    // Matches "/start[whatever] or start[whatever]"
    bot.onText(commands.start.regex, (msg, match) => {
        let text = "Please type a command.\n\n";
        text += "Example:\n";
        text += "/last to view summary for last 24h\n";
        text += "You could also type 'last 7d' or 'last 10h'. ";
        text += "It supports 'd' and 'h'.\n\n";
        text += "/today to view summary for today (UTC time)\n";
        text += "/yesterday to view summary for yesterday (UTC time)";
        text += "\n\nThe '/' character is optional.";

        reply(bot, msg, text);
    });

    // Matches "/help[whatever] or help[whatever]"
    bot.onText(commands.help.regex, (msg, match) => {
        let text = "/last to view summary for last 24h\n";
        text += "You could also type 'last 7d' or 'last 10h'. ";
        text += "It supports 'd' and 'h'.\n\n";
        text += "/today to view summary for today (UTC time)\n";
        text += "/yesterday to view summary for yesterday (UTC time)";
        text += "\n\nThe '/' character is optional.";

        reply(bot, msg, text);
    });

    // Matches "/last[whatever] or last[whatever]"
    bot.onText(commands.last.regex, (msg, match) => {
        const resp = (match[1] || "24h").trim().toUpperCase();

        const parts = resp.match(/^(\d+)(H|D)$/);
        if (!parts || parts.length != 3) {
            reply(bot, msg, "Invalid syntax. Try _last 1d_, _last 12h_, or just /last.", false);
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

        sendData(bot, msg, sinceSeconds, nowSeconds, "LAST " + resp);
    });

    // Matches "/today or today"
    bot.onText(commands.today.regex, (msg, match) => {

        const nowSeconds = Utils.nowInSeconds() + 100;
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todaySeconds = Math.floor(today.getTime() / 1000);
        
        sendData(bot, msg, todaySeconds, nowSeconds, "TODAY (UTC)", true);
    });

    // Matches "/yesterday or yesterday"
    bot.onText(commands.yesterday.regex, (msg, match) => {

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todaySeconds = Math.floor(today.getTime() / 1000);

        const yestSeconds = todaySeconds - 24 * 60 * 60;
        
        sendData(bot, msg, yestSeconds, todaySeconds, "YESTERDAY (UTC)", true);
    });

    // Matches "/burn or burn"
    bot.onText(commands.burn.regex, (msg, match) => {
        const TradeService = bot._tracker.getService();
        TradeService.getTotalBurnedFees((err, ret) => {
            if (!!err) {
                reply(bot, msg, "An unknown error occurs. Please try again later.");
                logger.error(err);
            } else {
                let text = `*${format(ret.burned)} KNC* has been burnt to date.`;

                reply(bot, msg, text);
            }
            bot._tracker.finish();
        });
    });
};

module.exports = {
    processRequest: (body, options) => {
        // new bot per req, to avoid concerns about simultanous requests
        const bot = new Bot(options.botToken || process.env.TRACKER_BOT_TOKEN);
        bot._tracker = options;
        setupBot(bot);
        bot.processUpdate(body);

        if (!keepReq(body)) {
            options.finish();
        }
    }
};