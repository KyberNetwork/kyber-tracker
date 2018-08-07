const network = require('../../config/network');
const Utils = require('sota-core').load('util/Utils');
const logger = log4js.getLogger('TrackerBot');
const Bot = require('node-telegram-bot-api');

const commands = {
    start: {
        match: /^\/?start(?:@\w+)?$/i,
        releaseReq: true,
        reply: (bot, msg, match) => {
            let text = `Please type a command.

Example:
/last to see volume for last 24h
You could also type 'last 7d' or 'last 10h'.
It supports 'd' and 'h'.

`;
            if (!bot._context.internal){
                text += `/today to see volume for today (UTC time)
/yesterday to see volume for yesterday (UTC time)
/burn to see how much KNC burned to date
/token to see volume by token`;
            } else {
                text += "Other common used commands: /today, /yesterday, /burn, /token, /partner, /trader, /price.";
            }
            reply(bot, msg, text, {no_reply: true});
        }
    },
    help: {
        match: /^\/?help(?:@\w+)?$/i,
        releaseReq: true,
        reply: (bot, msg, match) => {
            let text = `/last to see volume for last 24h
You could also type 'last 7d' or 'last 10h'.
It supports 'd' and 'h'.

`;
            if (!bot._context.internal){
                text += `/today to see volume for today (UTC time)
/yesterday to see volume for yesterday (UTC time)
/burn to see how much KNC burned to date
/token to see volume by token`;
            } else {
                text += "Other common used commands: /today, /yesterday, /burn, /token, /partner, /trader, /price.";
            }
            reply(bot, msg, text, {no_reply: true});
        }
    },
    last: {
        match: /^\/?(?:last|volume)(?:@\w+)?(?:\s+(\w+))?$/i,
        reply: (bot, msg, match) => {
            const resp = (match[1] || "24H").trim().toUpperCase();
            const seconds = parseSeconds(resp);
            if (seconds < 0) {
                reply(bot, msg, "Invalid syntax. Try _last 1d_, _last 12h_, or just /last.", {
                    parse_mode: "Markdown",
                    no_mention: true
                });
                bot._context.finish();
                return;
            }

            const nowSeconds = Utils.nowInSeconds();
            const sinceSeconds = nowSeconds - seconds;

            sendVolume(bot, msg, sinceSeconds, nowSeconds, "LAST " + resp);
        }
    },
    partner: {
        match: /^\/?partners?(?:@\w+)?(?:\s+(\w+))?$/i,
        internal: true,
        reply: (bot, msg, match) => {
            const resp = (match[1] || "24H").trim().toUpperCase();
            const seconds = parseSeconds(resp);
            if (seconds < 0) {
                reply(bot, msg, "Invalid syntax. Try _partner 1d_, _partner 12h_, or just /partner.", {
                    parse_mode: "Markdown",
                    no_mention: true
                });
                bot._context.finish();
                return;
            }

            const nowSeconds = Utils.nowInSeconds();
            const sinceSeconds = nowSeconds - seconds;

            sendPartnerSummary(bot, msg, sinceSeconds, nowSeconds, "LAST " + resp);
        }
    },
    trader: {
        match: /^\/?(?:traders?|investors?)(?:@\w+)?(?:\s+(\w+))?$/i,
        internal: true,
        reply: (bot, msg, match) => {
            const resp = (match[1] || "24H").trim().toUpperCase();
            const seconds = parseSeconds(resp);
            if (seconds < 0) {
                reply(bot, msg, "Invalid syntax. Try _trader 1d_, _trader 12h_, or just /trader.", {
                    parse_mode: "Markdown",
                    no_mention: true
                });
                bot._context.finish();
                return;
            }

            const nowSeconds = Utils.nowInSeconds();
            const sinceSeconds = nowSeconds - seconds;

            sendTraderSummary(bot, msg, sinceSeconds, nowSeconds, "LAST " + resp);
        }
    },
    today: {
        match: /^\/?today(?:@\w+)?$/i,
        reply: (bot, msg, match) => {
            send1dVolume(bot, msg, todayStartInSeconds(), "TODAY (UTC)");
        },
    },
    yesterday: {
        match: /^\/?yesterday(?:@\w+)?$/i,
        reply: (bot, msg, match) => {
            const from = todayStartInSeconds() - 24 * 60 * 60;
            send1dVolume(bot, msg, from, "YESTERDAY (UTC)");
        }
    },
    burn: {
        match: /^\/?burnt?(?:@\w+)?$/i,
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
        match: /^\/?(?:(?:kyber)?price|rates?)(?:@\w+)?$/i,
        reply: (bot, msg, match) => {
            if (!bot._context.internal &&
                msg.chat.type === "supergroup" && msg.chat.username !== "kyberprice") {
                reply(bot, msg, "Chat private to me or go to @kyberprice for price discussion.");
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
        match: /^\/?(?:when)?\s?moon(?:@\w+)?$/i,
        reply: "You can check the moon phases on https://www.timeanddate.com/moon/phases/"
    },
    whitepaper: {
        match: /^\/?(?:white)?\s?paper(?:@\w+)?$/i,
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
        match: /^\/?(?:road)\s?map(?:@\w+)?$/i,
        reply: "You can see the roadmap on Kyber Network home page https://home.kyber.network/about/company/#roadmap"
    },
    team: {
        match: /^\/?team(?:@\w+)?$/i,
        reply: "Our team is here https://home.kyber.network/about/company/#team"
    },
    introduce: {
        match: /^\/?introduce(?:@\w+)?$/i,
        reply: "Check out our 2-minute introduction clip https://www.youtube.com/watch?v=lNNLr2D0yig"
    },
    lambo: {
        match: /^\/?(?:when)?\s?lambo(?:@\w+)?$/i,
        reply: "Check it out here https://when-lambo.com/"
    },
    cmc: {
        match: /^\/?cmc(?:@\w+)?$/i,
        reply: "https://coinmarketcap.com/exchanges/kyber-network/"
    },
    lang: {
        match: /^\/?(?:language|groups?)(?:@\w+)?$/i,
        reply: `Kyber Network Official Telegram Groups.
English @KyberNetwork
한국어 @KyberKorea
中文 @KyberChinese
Tiếng Việt @KyberVietnamese`
    },
    trade: {
        match: /^\/?(?:trade|exchange|swap)(?:@\w+)?$/i,
        reply: "KyberSwap https://kyber.network/swap"
    },
    kyber: {
        match: /^\/?kyber(?:@\w+)?$/i,
        reply: "[http://starwars.wikia.com/wiki/Kyber_crystal](http://starwars.wikia.com/wiki/Kyber_crystal)",
        replyOptions: {
            parse_mode: "Markdown"
        }
    },
    reddit: {
        match: /^\/?reddit(?:@\w+)?$/i,
        reply: "https://www.reddit.com/r/kybernetwork/"
    },
    github: {
        match: /^\/?github(?:@\w+)?$/i,
        reply: "https://github.com/kyberNetwork/"
    },
    twitter: {
        match: /^\/?twitter(?:@\w+)?$/i,
        reply: "https://twitter.com/KyberNetwork"
    },
    facebook: {
        match: /^\/?facebook(?:@\w+)?$/i,
        reply: "https://www.facebook.com/kybernetwork/"
    },
    blog: {
        match: /^\/?(?:blog|medium)(?:@\w+)?$/i,
        reply: "https://blog.kyber.network/"
    },
    tracker: {
        match: /^\/?track(?:er)?(?:@\w+)?$/i,
        reply: "https://tracker.kyber.network",
    },
    token: {
        match: /^\/?tokens?(?:@\w+)?$/i,
        reply: (bot, msg, match) => {
            const resp = (match[1] || "24H").trim().toUpperCase();
            const seconds = parseSeconds(resp);
            if (seconds < 0) {
                reply(bot, msg, "Invalid syntax. Try _token 1d_, _token 12h_, or just /token.", {
                    parse_mode: "Markdown",
                    no_mention: true
                });
                bot._context.finish();
                return;
            }

            const nowSeconds = Utils.nowInSeconds();
            const sinceSeconds = nowSeconds - seconds;

            sendTokenSummary(bot, msg, sinceSeconds, nowSeconds, "LAST " + resp);
        }
    },
    market: {
        match: /^\/?market?(?:@\w+)?$/i,
        reply: "You can trade KNC on [Kyber Network](https://kyber.network/) and many [other major exchanges](https://coinmarketcap.com/currencies/kyber-network/#markets)",
        replyOptions: {
            parse_mode: "Markdown"
        }
    },
    thank: {
        match: /^\/?thanks?(?:@\w+)?$/i,
        reply: "You are welcome",
    },
    like: {
        match: /^\/?(?:like|love)(?:@\w+)?$/i,
        reply: "Thank you",
    },
    kyc: {
        match: /^\/?kyc(?:@\w+)?$/i,
        reply: "https://kyber.network/users/sign_in",
    },
    request: {
        match: /^\/?request(?:@\w+)?$/i,
        reply: "https://docs.google.com/forms/d/e/1FAIpQLSdXIGrbUxj3PYHcLGArWxx800DAS8tZSKGQhY4yIeYD1FrClg/viewform",
    },
    wallet: {
        match: /^\/?wallets?(?:@\w+)?$/i,
        internal: true,
        reply: "_wallet_ has multiple meanings. Please use /trader or /partner commands.",
        replyOptions: {
            parse_mode: "Markdown"
        }
    }
}

function keepReq(bot, body) {
    if (!body.message) return false;
    if (!body.message.text) return false;

    const text = body.message.text;

    for (let key in commands) {
        const value = commands[key];

        if (!!text.match(value.match)) {
            // if it is internal command & this is public bot
            // so no need to handle
            if (!!value.internal && !bot._context.internal) {
                return false;
            }

            if (!value.releaseReq && !!value.reply.call) {
                return true;
            }

            // skip after first match, cause we only setup first match
            break;
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
    return round(100 * (a || 0) / b);
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
                text += "\n\nCOMMISSIONED PARTNERS";
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

function partnerLink(addr) {
    if (!addr) return "No partner";

    let name = null;
    let lowerAddr = addr.toLowerCase();
    if (network.partners) {
        for (let key in network.partners) {
            if (network.partners[key].toLowerCase() === lowerAddr) {
                name = key;
                break;
            }
        }
    }

    if (!name) {
        name = addr.substr(0, 4) + "…" + addr.substr(-2);
    }

    return `[${name}](https://tracker.kyber.network/#/partner/${addr})`;
}

function sendPartnerSummary(bot, msg, from, to, prefix) {
    const TradeService = bot._context.getService();
    TradeService.getPartners(from, to, (err, ret) => {
        if (!!err) {
            reply(bot, msg, "An unknown error occurs. Please try again later.");
            logger.error(err);
        } else {
            let text = `*${prefix}*\nVOLUME BY PARTNER`;
            text += "\n=================";
            if (!ret || !Array.isArray(ret) || ret.length === 0) {
                text = "There is no transactions."
            } else {
                ret.sort((a, b) => {
                    return b.sum - a.sum;
                });
                let total = 0;
                ret.forEach((item) => {
                    total += item.sum;
                })
                ret.forEach((item) => {
                    text += "\n" + partnerLink(item.commissionReceiveAddress) + ": *" + format(item.sum) + " ETH* (" +
                        percent(item.sum, total) + "%)";
                });

                text += "\n-----\nTOTAL: *" + format(total) + " ETH*";
            }

            reply(bot, msg, text, {parse_mode: "Markdown", no_preview: true});
        }
        bot._context.finish();
    });
}

function sendTraderSummary(bot, msg, from, to, prefix) {
    const TradeService = bot._context.getService();
    TradeService.getTraders(from, to, (err, ret) => {
        if (!!err) {
            reply(bot, msg, "An unknown error occurs. Please try again later.");
            logger.error(err);
        } else {
            let text = `*${prefix}*\nVOLUME BY TRADER`;
            text += "\n=================";
            if (!ret || !Array.isArray(ret) || ret.length === 0) {
                text = "There is no transactions."
            } else {
                ret.sort((a, b) => {
                    return b.sum - a.sum;
                });
                let total = 0;
                ret.forEach((item) => {
                    total += item.sum;
                })

                let top5 = 0;
                let count = 5;
                if (ret.length < count) count = ret.length;
                for (let i = 0; i < count; i++) {
                    let item = ret[i];
                    top5 += item.sum;

                    text += "\n" + traderLink(item.takerAddress) + ": *$" + format(item.sum) + "* (" +
                        percent(item.sum, total) + "%)";
                }

                const others = total - top5;
                text += "\nOthers: *$" + format(others) + "* (" +
                            percent(others, total) + "%)";

                text += "\n-----\nTOTAL: *$" + format(total) + "*";
            }

            reply(bot, msg, text, {parse_mode: "Markdown", no_preview: true});
        }
        bot._context.finish();
    });
}

function traderLink(addr) {
    const shortAddress = addr.substr(0, 4) + "…" + addr.substr(-2);
    return `[${shortAddress}](https://tracker.kyber.network/#/search?q=${addr})`;
}

function tokenLink(symbol) {
    const address = network.tokens[symbol].address;
    return `[${symbol}](https://tracker.kyber.network/#/tokens/${address})`;
}

function sendTokenSummary(bot, msg, from, to, prefix) {
    const TradeService = bot._context.getService();
    let options = {
      from: from,
      to: to
    };
    TradeService.getTopTokensList(options, (err, ret) => {
        if (!!err) {
            reply(bot, msg, "An unknown error occurs. Please try again later.");
            logger.error(err);
        } else {
            let text = `*${prefix}*\nVOLUME BY TOKEN`;
            text += "\n=================";
            if (!ret || !Array.isArray(ret) || ret.length === 0) {
                text = "There is no transactions."
            } else {

                let total = 0;
                let top5 = 0;
                for (let i = 0; i <=5; i++) {
                    let item = ret[i];
                    if (i == 0) {
                        total = item.volumeUSD;
                    } else {
                        top5 += item.volumeUSD;
                        text += "\n" + tokenLink(item.symbol) + ": *$" + format(item.volumeUSD) + "* (" +
                            percent(item.volumeUSD, total) + "%)";
                    }
                }

                const others = total - top5;
                text += "\nOthers: *$" + format(others) + "* (" +
                            percent(others, total) + "%)";

                text += "\n-----\nTOTAL: *$" + format(total) + "*";

                text += "\n\n[See full list](https://tracker.kyber.network#/tokens)";
            }

            reply(bot, msg, text, {parse_mode: "Markdown", no_preview: true});
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

function setupBot(bot, body) {
    if (!body.message) return;
    if (!body.message.text) return;

    const msgText = body.message.text;
    let matchFound = false;
    for (const key in commands) {
        const value = commands[key];

        if (!!msgText.match(value.match)) {

            if (!!value.internal && !bot._context.internal) {
                break;
            }

            matchFound = true;

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

            // only setup first match, cause we have new tracker bot each request
            break;
        }
    }

    if (!matchFound) {
        bot.on('message', (msg) => {
            if (msg.text.startsWith("/") || msg.chat.type === "private") {
                reply(bot, msg, "Invalid command. Try /help.");
            }
          });
    }
};

module.exports = {
    processRequest: (body, context) => {
        // new bot per req, to avoid concerns about simultanous requests
        const bot = new Bot(context.botToken || process.env.TRACKER_BOT_TOKEN);
        bot._context = context;
        setupBot(bot, body);
        bot.processUpdate(body);

        if (!keepReq(bot, body)) {
            context.finish();
        }
    }
};
