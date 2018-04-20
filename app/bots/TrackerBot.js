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
    },
    whenmoon: {
        regex: /\b\/?(?:when)?\s?moon(?:@\w+)?\b/i
    },
    whitepaper: {
        regex: /\b\/?(?:white)?\s?paper(?:@\w+)?\b/i
    },
    roadmap: {
        regex: /\b\/?(?:road)\s?map(?:@\w+)?\b/i
    },
    lambo: {
        regex: /\b\/?(?:when)?\s?lambo(?:@\w+)?\b/i
    },
    lang: {
        regex: /\b\/?lang(?:@\w+)?\b/i
    },
    trade: {
        regex: /\b\/?trade(?:@\w+)?\b/i
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

function reply(bot, msg, markdown, autoMention = true, nopreview = false) {
    if (autoMention && msg.reply_to_message && msg.reply_to_message.from &&
        msg.reply_to_message.from.id != msg.from.id && !msg.reply_to_message.from.is_bot) {
        markdown = mention(msg.reply_to_message.from) + "\n" + markdown;
    }
    bot.sendMessage(msg.chat.id, markdown, {
        reply_to_message_id: msg.message_id,
        parse_mode: "Markdown",
        disable_web_page_preview: !!nopreview
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
            if (internal) {
                text += `\nVolume: *${format(ret.volumeEth)} ETH* ($${format(ret.volumeUsd)})`;
            } else {
                text += `\nVolume: *$${format(ret.volumeUsd)}* ($${format(ret.volumeEth)} ETH)`;
            }
            text += `\nNumber of Tx: *${format(ret.tradeCount)}*`;
            if (internal) {
                text += `\nAverage ETH/Tx: *${average(ret.volumeEth, ret.tradeCount)}*`;
            } else {
                text += `\nAverage USD/Tx: *$${average(ret.volumeUsd, ret.tradeCount)}*`;
            }
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

    bot.onText(commands.start.regex, (msg, match) => {
        let text = "Please type a command.\n\n";
        text += "Example:\n";
        text += "/last to view summary for last 24h\n";
        text += "You could also type 'last 7d' or 'last 10h'. ";
        text += "It supports 'd' and 'h'.\n\n";
        text += "/today to view summary for today (UTC time)\n";
        text += "/yesterday to view summary for yesterday (UTC time)";
        text += "/burn to see how much KNC burned to date";

        reply(bot, msg, text);
    });

    bot.onText(commands.help.regex, (msg, match) => {
        let text = "/last to view summary for last 24h\n";
        text += "You could also type 'last 7d' or 'last 10h'. ";
        text += "It supports 'd' and 'h'.\n\n";
        text += "/today to view summary for today (UTC time)\n";
        text += "/yesterday to view summary for yesterday (UTC time)";
        text += "/burn to see how much KNC burned to date";

        reply(bot, msg, text);
    });

    bot.onText(commands.whenmoon.regex, (msg, match) => {
        let text = "You could check the moon phases on https://www.timeanddate.com/moon/phases/";
        reply(bot, msg, text);
    });

    bot.onText(commands.lambo.regex, (msg, match) => {
        let text = "Check it out here https://when-lambo.com/";
        reply(bot, msg, text);
    });

    bot.onText(commands.trade.regex, (msg, match) => {
        let text = "Our exchange is live, you can trade now https://kyber.network/";
        reply(bot, msg, text);
    });

    bot.onText(commands.lang.regex, (msg, match) => {
        let text = "Kyber Network Official Telegram Groups.";
        text += "\nEnglish @Kybernetwork";
        text += "\nKorean @KyberKorea";
        text += "\nChinese @KyberChinese";
        text += "\nVietnamese @KyberVietnamese"
        reply(bot, msg, text, true, true);
    });

    bot.onText(commands.whitepaper.regex, (msg, match) => {
        let text = "Kyber Network White Paper is available in several languages.\n";
        text += "[English](https://home.kyber.network/assets/KyberNetworkWhitepaper.pdf)";
        text += "\n[한국어](https://home.kyber.network/assets/KyberNetworkWhitepaper-kr.pdf)";
        text += "\n[中文](https://home.kyber.network/assets/KyberNetworkWhitepaper-cn.pdf)";
        text += "\nVietnamese version will be available soon."
        reply(bot, msg, text, true, true);
    });

    bot.onText(commands.roadmap.regex, (msg, match) => {
        let text = "You could see the roadmap on Kyber Network home page https://home.kyber.network/";
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