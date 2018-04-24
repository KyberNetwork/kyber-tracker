const Utils = require('sota-core').load('util/Utils');
const logger = log4js.getLogger('TrackerBot');
const Bot = require('node-telegram-bot-api');

const commands = {
    start: {
        match: /\b\/?start(?:@\w+)?\b/i,
        reply: `Please type a command.
        
Example:
/last to view summary for last 24h
You could also type 'last 7d' or 'last 10h'.
It supports 'd' and 'h'.

/today to view summary for today (UTC time)
/yesterday to view summary for yesterday (UTC time)
/burn to see how much KNC burned to date`,
        replyOptions: {
            no_reply: true
        }
    },
    help: {
        match: /\b\/?help(?:@\w+)?\b/i,
        reply: `/last to view summary for last 24h
You could also type 'last 7d' or 'last 10h'.
It supports 'd' and 'h'.

/today to view summary for today (UTC time)
/yesterday to view summary for yesterday (UTC time)
/burn to see how much KNC burned to date`
    },
    last: {
        match: /\b\/?last(?:@\w+)?(?:\s+(\w+))?\b/i,
        needDb: true,
        reply: (bot, msg, match) => {
            const resp = (match[1] || "24H").trim().toUpperCase();
            const seconds = parseSeconds(resp);
            if (seconds < 0) {
                reply(bot, msg, "Invalid syntax. Try _last 1d_, _last 12h_, or just /last.", {no_mention: true});
                bot._context.finish();
                return;
            }
    
            const nowSeconds = Utils.nowInSeconds();
            const sinceSeconds = nowSeconds - seconds;
    
            sendVolume(bot, msg, sinceSeconds, nowSeconds, "LAST " + resp);
        }
    },
    today: {
        match: /\b\/?today(?:@\w+)?\b/i,
        needDb: true,
        reply: (bot, msg, match) => {
            send1dVolume(bot, msg, todayStartInSeconds(), "TODAY (UTC)");
        },
    },
    yesterday: {
        match: /\b\/?yesterday(?:@\w+)?\b/i,
        needDb: true,
        reply: (bot, msg, match) => {
            const from = todayStartInSeconds() - 24 * 60 * 60;
            send1dVolume(bot, msg, from, "YESTERDAY (UTC)");
        }
    },
    burn: {
        match: /\b\/?burn(?:@\w+)?\b/i,
        needDb: true,
        reply: (bot, msg, match) => {
            bot._context.getService().getTotalBurnedFees((err, ret) => {
                if (!!err) {
                    reply(bot, msg, "An unknown error occurs. Please try again later.");
                    logger.error(err);
                } else {
                    let text = `*${format(ret.burned)} KNC* has been burnt to date.`;
                    reply(bot, msg, text, {parse_mode: "Markdown"});
                }
                bot._context.finish();
            });
        }
    },
    price: {
        match: /\b\/?(?:price|rates?)(?:@\w+)?\b/i,
        needDb: true,
        reply: (bot, msg, match) => {
            if (!bot._context.internal && msg.chat.type === "supergroup") {
                reply(bot, msg, "Please go to @kyberprice for price discussion.");
            } else {
                bot._context.getService("CMCService").getCMCTokenInfo("KNC", (err, ret) => {
                    if (!!err) {
                        reply(bot, msg, "An unknown error occurs. Please try again later.");
                        logger.error(err);
                    } else {
                        const seconds = Math.floor((new Date().getTime() - ret.last_updated * 1000)/1000);
                        const text = `KNC/USD: *${ret.price_usd}*
KNC/BTC: *${ret.price_btc}*
1h change: *${emoji(ret.percent_change_1h)}*
24h change: *${emoji(ret.percent_change_24h)}*
7d change: *${emoji(ret.percent_change_7d)}*

Last updated: ${seconds} seconds ago.
Credit: CoinMarketCap`;
                        reply(bot, msg, text, {parse_mode: "Markdown"});
                    }
                });
            }
            // send http 200
            bot._context.finish();
        }
    },
    whenmoon: {
        match: /\b\/?(?:when)?\s?moon(?:@\w+)?\b/i,
        reply: "You can check the moon phases on https://www.timeanddate.com/moon/phases/"
    },
    whitepaper: {
        match: /\b\/?(?:white)?\s?paper(?:@\w+)?\b/i,
        reply: `Kyber Network White Paper is available in several languages.
[English](https://home.kyber.network/assets/KyberNetworkWhitepaper.pdf)
[한국어](https://home.kyber.network/assets/KyberNetworkWhitepaper-kr.pdf)
[中文](https://home.kyber.network/assets/KyberNetworkWhitepaper-cn.pdf)
Vietnamese version will be available soon.`,
        replyOptions: {
            parse_mode: "Markdown",
            no_preview: true
        }
    },
    roadmap: {
        match: /\b\/?(?:road)\s?map(?:@\w+)?\b/i,
        reply: "You can see the roadmap on Kyber Network home page https://home.kyber.network/#roadmap"
    },
    team: {
        match: /\b\/?team(?:@\w+)?\b/i,
        reply: "Our team is here https://home.kyber.network/#team"
    },
    introduce: {
        match: /\b\/?introduce(?:@\w+)?\b/i,
        reply: "Check out our 2-minute introduction clip https://www.youtube.com/watch?v=lNNLr2D0yig"
    },
    lambo: {
        match: /\b\/?(?:when)?\s?lambo(?:@\w+)?\b/i,
        reply: "Check it out here https://when-lambo.com/"
    },
    lang: {
        match: /\b\/?(?:lang|groups?)(?:@\w+)?\b/i,
        reply: `Kyber Network Official Telegram Groups.
English @KyberNetwork
한국어 @KyberKorea
中文 @KyberChinese
Tiếng Việt @KyberVietnamese`
    },
    trade: {
        match: /\b\/?trade(?:@\w+)?\b/i,
        reply: "Our exchange is live, you can trade now https://kyber.network/"
    },
    kyber: {
        match: /\b\/?kyber(?:@\w+)?\b/i,
        reply: "[http://starwars.wikia.com/wiki/Kyber_crystal](http://starwars.wikia.com/wiki/Kyber_crystal)",
        replyOptions: {
            parse_mode: "Markdown"
        }
    },
    reddit: {
        match: /\b\/?reddit(?:@\w+)?\b/i,
        reply: "https://www.reddit.com/r/kybernetwork/"
    },
    github: {
        match: /\b\/?github(?:@\w+)?\b/i,
        reply: "https://github.com/kyberNetwork/"
    },
    twitter: {
        match: /\b\/?twitter(?:@\w+)?\b/i,
        reply: "https://twitter.com/KyberNetwork"
    },
    facebook: {
        match: /\b\/?facebook(?:@\w+)?\b/i,
        reply: "https://www.facebook.com/kybernetwork/"
    },
    blog: {
        match: /\b\/?blog(?:@\w+)?\b/i,
        reply: "https://blog.kyber.network/"
    },
    tracker: {
        match: /\b\/?track(?:er)?(?:@\w+)?\b/i,
        reply: "https://tracker.kyber.network",
    },
    token: {
        match: /\b\/?tokens?(?:@\w+)?\b/i,
        reply: "List of supported tokens https://tracker.kyber.network#/tokens",
    },
    market: {
        match: /\b\/?market?(?:@\w+)?\b/i,
        reply: "You can trade KNC on [Kyber Network](https://kyber.network/) and many [other major exchanges](https://coinmarketcap.com/currencies/kyber-network/#markets)",
        replyOptions: {
            parse_mode: "Markdown"
        }
    }
}

function keepReq(body) {
    if (!body.message) return false;
    if (!body.message.text) return false;

    const text = body.message.text;

    for (let key in commands) {
        const value = commands[key];
        if (value.needDb && !!text.match(value.match)) {
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

function sign(n) {
    if (n > 0) return "+" + n;
    return n;
}

function emoji(n) {
    let text = sign(n) + "%";
    if (n > 9.9) {
        text = text + "🚀";
    } else if (n < -9.9) {
        text = text + "😢";
    }

    return text;
}

function mention(user) {
    if (user.username) {
        return `[@${user.username}](tg://user?id=${user.id})`;
    } else {
        return `[@${user.first_name}${user.last_name?(" " + user.last_name):""}](tg://user?id=${user.id})`;
    }
}

function reply(bot, msg, text, options) {
    options = options || {};
    if (!options.no_mention && !!msg.reply_to_message && !!msg.reply_to_message.from &&
        msg.reply_to_message.from.id != msg.from.id && !msg.reply_to_message.from.is_bot) {
            text = mention(msg.reply_to_message.from) + "\n" + text;
            options.parse_mode = "Markdown";
    }
    bot.sendMessage(msg.chat.id, text, {
        reply_to_message_id: !options.no_reply ? msg.message_id : undefined,
        parse_mode: !!options.parse_mode ? options.parse_mode : undefined,
        disable_web_page_preview: !!options.no_preview
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

function sendVolume(bot, msg, from, to, prefix, tellUtcTime) {
    const TradeService = bot._context.getService();
    const internal = !!bot._context.internal;
    TradeService.getStats(from, to, internal, (err, ret) => {
        if (!!err) {
            reply(bot, msg, "An unknown error occurs. Please try again later.");
            bot._context.finish();
            logger.error(err);
        } else {
            let text = `*${prefix}* VOLUME`;
            text += "\n=================";
            if (internal) {
                text += `\nVolume: *${format(ret.volumeEth)} ETH* ($${format(ret.volumeUsd)})`;
            } else {
                text += `\nVolume: *$${format(ret.volumeUsd)}* (${format(ret.volumeEth)} ETH)`;
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

            reply(bot, msg, text, {parse_mode: "Markdown"});
        }
        bot._context.finish();
    });
}

function send1dVolume(bot, msg, from, prefix){
    const to = from + 24 * 60 * 60;
    sendVolume(bot, msg, from, to, prefix, true)
}

function parseSeconds(resp) {
    resp = (resp || "24H").trim().toUpperCase();

    const parts = resp.match(/^(\d+)(H|D)$/);
    if (!parts || parts.length != 3) {
        return -1;
    }

    const duration = parseInt(parts[1]);
    const type = parts[2];
    let seconds = duration * 60 * 60;
    if (type === "D") {
        seconds *= 24;
    }

    return seconds;
}

function todayStartInSeconds(){
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return Math.floor(today.getTime() / 1000);
}

function setupBot(bot) {
    for (const key in commands) {
        const value = commands[key];
        let text = value.reply;
        if (text) {
            bot.onText(value.match, (msg, match) => {
                if (text.call) {
                    text.call(value, bot, msg, match);
                } else {
                    reply(bot, msg, text, value.replyOptions);
                }
            });
        }
    }
};

module.exports = {
    processRequest: (body, context) => {
        // new bot per req, to avoid concerns about simultanous requests
        const bot = new Bot(context.botToken || process.env.TRACKER_BOT_TOKEN);
        bot._context = context;
        setupBot(bot);
        bot.processUpdate(body);

        if (!keepReq(body)) {
            context.finish();
        }
    }
};