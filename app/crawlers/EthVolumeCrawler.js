const _                           = require('lodash');
const async                       = require('async');
const BigNumber                   = require('bignumber.js');
const getLatestBlockNumber        = require('./getLatestBlockNumber');
const getUnprocessedTrades        = require("./getUnprocessedTrades")
const getBlockTimestamp           = require('./leveldbCache').getBlockTimestamp;
const getCoinPrice                = require('./leveldbCache').getCoinPrice;
const Utils                       = require('../common/Utils');
const networkConfig               = require('../../config/network');
const ExSession                   = require('sota-core').load('common/ExSession');
const logger                      = require('sota-core').getLogger('TradeCrawler');
const configFetcher               = require('./configFetcher')


let UNPROCESSED_TRADES = [];
const BATCH_TRADES_SIZE = parseInt(process.env.BATCH_TRADES_SIZE || 10);
const REQUIRED_CONFIRMATION = parseInt(process.env.REQUIRED_CONFIRMATION || 7);
const PARALLEL_INSERT_LIMIT = 10;
const web3 = Utils.getWeb3Instance();

let tokenConfig = _.transform(networkConfig.tokens, (result, v, k) => {result[v.address.toLowerCase()] = {...v, address: v.address.toLowerCase()}})
let tokensByAddress, tokensBySymbol

// networkConfig.tokens
const processTokens = (tokens) => ({
  tokensByAddress: _.keyBy(tokens, 'address'),
  tokensBySymbol: _.keyBy(tokens, 'symbol')
})

class EthVolumeCrawler {

  start () {
    async.auto({
      config: (next) => {
        configFetcher.fetchConfigTokens((err, tokens) => {
          if(err) return next(err)
          tokenConfig = _.merge(tokens, tokenConfig)
          // processTokens(tokenConfig)
          return next(null, processTokens(tokenConfig))
        })
      },
      unprocessedTrades: ['config', (ret, next) => {
        global.GLOBAL_TOKEN=ret.config.tokensBySymbol
        // console.log("====================config: ", global.GLOBAL_TOKEN)
        if (UNPROCESSED_TRADES.length > 0) {
          return next(null, UNPROCESSED_TRADES);
        }

        getUnprocessedTrades(next, "KyberTradeModel");
      }],
      processTrades: ['unprocessedTrades', (ret, next) => {
        const exSession = new ExSession();
        this.processTrades(exSession, ret.unprocessedTrades, (err, result) => {
          exSession.destroy()
          return next(err, result)
        });
      }]
    }, (err, ret) => {
      
      let timer = networkConfig.averageCGQuery;
      if (err) {
        logger.error(err);
        logger.info(`Crawler will be restarted in 13 seconds...`);
        timer = 13000;
      } else {
        logger.info(`Already processed pack ${process.env.LIMIT_TRADES_SIZE} trades. Crawler will be restarted ...`);
      }

      setTimeout(() => {
        this.start();     
      }, timer);
    });
  }

  processTrades (exSession, unprocessedTrades, callback) {
    // Crawl the newest block already

    if (!unprocessedTrades.length) {
      return callback(null, true);
    }

    const selectedTrades = unprocessedTrades.slice(0, BATCH_TRADES_SIZE)

    this._processTradesOnce(exSession, selectedTrades, (err, ret) => {
      if (err) {
        return callback(err);
      }
      unprocessedTrades.splice(0, BATCH_TRADES_SIZE);
      process.nextTick(() => {
        this.processTrades(exSession, unprocessedTrades, callback);
      });

    });
  }

  _processTradesOnce (exSession, packTrades, callback) {
    logger.info(`_process ${packTrades.length} trades: ids: [${packTrades.map(t => t.id).join(' , ')}]`);
    // const exSession = new ExSession();
    const CMCService = exSession.getService('CMCService');

    const dateTrade = {}
    packTrades.map(trade => {
      if(!dateTrade[trade.date]) dateTrade[trade.date] = []
      dateTrade[trade.date].push({
        ids: trade.id,
        usdPrice: null
      })
    })


    async.eachLimit(Object.keys(dateTrade), PARALLEL_INSERT_LIMIT, (date, asyncCallback) => {
      CMCService.getCoingeckoHistoryPrice('ETH', date, (err, result) => {
        if(err) return asyncCallback(err)

        dateTrade[date].usdPrice = result.price_usd
        return asyncCallback(null)
      });
    }, err => {
      // exSession.destroy();
      if(err) return callback(err)

      this._updateTradePrice(exSession, packTrades, dateTrade, callback)
    })

  }

  _updateTradePrice(exSession, packTrades, datePrice, callback){
    // const exSession = new ExSession();
    const KyberTradeModel = exSession.getModel('KyberTradeModel');
    const updateRows = []
    packTrades.map(t => {
      updateRows.push({
        id: t.id,
        volumeUsd: t.volume_eth * datePrice[t.date].usdPrice
      })
    })

    async.waterfall([
      (next) => {
        async.eachLimit(updateRows, PARALLEL_INSERT_LIMIT, (record, _next) => {
          KyberTradeModel.update(record, _next);
      
        }, next);
      },
      (next) => {
        exSession.commit(next);
      }
    ], (err, ret) => {
      // exSession.destroy();
      if (err) {
        return callback(err);
      }

      return callback(null, true);
    });
    

   
  }

};

module.exports = EthVolumeCrawler;
