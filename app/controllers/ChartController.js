const _                       = require('lodash');
const async                   = require('async');
const network                 = require('../../config/network');
const AppController           = require('./AppController');
const Checkit                 = require('cc-checkit');
const Utils                   = require('../common/Utils');
const Resolution              = require('../common/Resolution');
const logger                  = log4js.getLogger('ChartController');

const supportedTokens = Utils.getRateTokenArray().supportedTokens;

function cors(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return res;
}

module.exports = AppController.extends({
  classname: 'ChartController',

  config: function (req, res) {
      cors(res).json({
        supported_resolutions: ['60','120','240','360','720','D','W','M'],
        supports_group_request: false,
        supports_marks: false,
        supports_search: true,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [],
        symbolsTypes: []
      });
  },

  symbols: function (req, res) {
    const [err, params] = new Checkit({
        symbol: ['string', 'required']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const token = network.tokens[params.symbol];
    if (!token || !Utils.shouldShowToken(params.symbol)) {
        res.badRequest("Symbol not supported.");
        return;
    }

    cors(res).json({
        name: token.symbol,
        ticker: token.symbol,
        description: token.name,
        type: "Ethereum Token",
        session: "24x7",
        //exchange: "Kyber Network",
        listed_exchange: "Kyber Network",
        timezone: "Asia/Singapore",
        minmov: 1,
        pricescale: 1000000,
        minmove2: 0,
        fractional: false,
        has_intraday: true,
        supported_resolutions: ['60','120','240','360','720','D','W','M'],
        intraday_multipliers: ['60','120','240','360','720'],
        has_seconds: false,
        seconds_multipliers: [],
        has_daily: true,
        has_weekly_and_monthly: true,
        has_empty_bars: true,
        force_session_rebuild: false,
        has_no_volume: true,
        volume_precision: 3,
        data_status: "pulsed",
        expired: false,
        //expiration_date: null,
        //sector: "Some sector",
        //industry: "Some industry",
        currency_code: "ETH"
    });

  },

  search: function (req, res) {
    const [err, params] = new Checkit({
        query: ['string'],
        limit:  ['naturalNonZero']
    }).validateSync(req.allParams);

    if (err) {
      res.badRequest(err.toString());
      return;
    }

    const ret = [];
    const query = (params.query || "").toUpperCase();
    const limit = parseInt(params.limit || supportedTokens.length);
    let counter = 0;
    supportedTokens.forEach((token) => {
        if (counter > limit) return;
        if (!query || token.symbol.indexOf(query) >= 0) {
            ret.push({
                symbol: token.symbol,
                full_name: token.symbol,
                description: token.name
            });
            counter++;
        }
    });

    cors(res).json(ret);

  },

  history: function (req, res) {
    const [err, params] = new Checkit({
        symbol: ['string', 'required'],
        resolution:  ['string', 'required'],
        from:  ['naturalNonZero', 'required'],
        to:  ['naturalNonZero', 'required'],
        rateType: ['string', 'required']
    }).validateSync(req.allParams);

    if (err) {
        res.badRequest(err.toString());
        return;
    }

    if (params.rateType !== "sell" && params.rateType !== "buy" && params.rateType !== "mid") {
        res.badRequest("rateType must be 'sell', 'buy', or 'mid'.");
        return;
    }

    params.seqType = Resolution.toColumn(params.resolution);
    if (!params.seqType) {
        res.badRequest("Unsupported resolution.");
        return;
    }

    const service = req.getService('ChartService');
    service.history(params, (err, ret) => {
        if (err) {
            logger.error(err);
            return;
        }

        var data ={
            t: [],
            o: [],
            h: [],
            l: [],
            c: [],
            //v: []
        };
        if (ret.length === 0){
            data.s = "no_data";
        } else {
            data.s = "ok";
            ret.forEach((value) => {
                if (value.seq == 0) return;
                data.t.push(Resolution.toTimestamp(params.resolution, value.seq));
                data.o.push(parseFloat(value.open));
                data.h.push(value.high);
                data.l.push(value.low);
                data.c.push(parseFloat(value.close));
                // data.v.push(0); //volume
            });
        }

        cors(res).json(data);
    });

  },

  time: function (req, res) {
    cors(res).send("" + Math.floor(Date.now() / 1000));
  },

});
