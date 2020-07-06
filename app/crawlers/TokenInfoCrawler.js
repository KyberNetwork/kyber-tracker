const _                     = require('lodash');
const async                 = require('async');
const network               = require('../../config/network');
const getLatestBlockNumber  = require('./getLatestBlockNumber');
const getBurnedFeeFromTransaction     = require('./getBurnedFeeFromTransaction');
const getBlockTimestamp           = require('./leveldbCache').getBlockTimestamp;
const Utils                 = require('../common/Utils');
const logger                = require('sota-core').getLogger('ReserveInfoCrawler');
const ExSession                   = require('sota-core').load('common/ExSession');
const BigNumber                   = require('bignumber.js');
const configFetcher               = require('./configFetcher')
const web3                  = Utils.getWeb3Instance();
const abiDecoder            = Utils.getKyberABIDecoder();

const getTokenInfo         = require('./leveldbCache').getTokenInfo;
const { ReserveInfoModel, ReserveTradeModel, KyberTradeModel, TokenInfoModel } = require('../databaseModel');
const { Op } = require("sequelize");

let LATEST_PROCESSED_BLOCK = 0;
const PARALLEL_INSERT_LIMIT = 10;
const TOKEN_INFO_LIMIT = 500
const BATCH_BLOCK_SIZE = parseInt(process.env.BATCH_RESERVE_INFO_BLOCK_SIZE || 10000);
const REQUIRED_CONFIRMATION = parseInt(process.env.REQUIRED_CONFIRMATION || 7);

let tokenConfig = _.transform(network.tokens, (result, v, k) => {result[v.address.toLowerCase()] = {...v, address: v.address.toLowerCase()}})
// networkConfig.tokens
const processTokens = (tokens) => ({
  tokensByAddress: _.keyBy(tokens, 'address'),
  tokensBySymbol: _.keyBy(tokens, 'symbol')
})
/**
 * Traversal through all blocks from the moment contract was deployed
 * Find and record all burned fees in local database
 * NOTE: this class is currently only use for collecting burned fees
 * Trade data are crawled by KyberTradeCrawler
 */
class ReserveInfoCrawler {

  start() {
    async.auto({
      txDontHaveTokenInfo: (next) => {
        KyberTradeModel.findAll({
            limit: TOKEN_INFO_LIMIT,
            where: {
                [Op.or]: [
                    {
                        taker_token_address: {[Op.not]: null},
                        taker_token_symbol: {[Op.is]: null},
                    },
                    {
                        maker_token_address: {[Op.not]: null},
                        maker_token_symbol: {[Op.is]: null},
                    }
                ]
            }
        })
        .then(founds => next(null, founds))
        .catch(err => next(err))
      },
      processTx: ['txDontHaveTokenInfo', (ret, next) => {
        async.eachLimit(ret.txDontHaveTokenInfo, 1 , (tx, _next) => this.processTx(tx, _next), next)
      }],
      reserveTradeDontHaveTokenInfo: ['processTx', (ret, next) => {
        ReserveTradeModel.findAll({
          limit: TOKEN_INFO_LIMIT,
          where: {
              [Op.or]: [
                  {
                      source_token_address: {[Op.not]: null},
                      source_token_symbol: {[Op.is]: null},
                  },
                  {
                      dest_token_address: {[Op.not]: null},
                      dest_token_symbol: {[Op.is]: null},
                  }
              ]
          }
      })
      .then(founds => next(null, founds))
      .catch(err => next(err))
      }],
      processReserveTradeTx: ['reserveTradeDontHaveTokenInfo', (ret, next) => {
        async.eachLimit(ret.reserveTradeDontHaveTokenInfo, 1 , (tx, _next) => this.processReserveTradeTx(tx, _next), next)
      }],
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(`Finish crawling...`);
      }

      logger.info(`Crawler will be restart in 20 blocks...`);
      setTimeout(() => {
        this.start();
      }, 15000);
    });
  }

  processTx (tx, callback) {
    const dataValue = tx.dataValues
    async.auto({
      processTaker: (next) => {
        if(!tx.taker_token_symbol) this.getTokenData(dataValue.taker_token_address, next)
        else next(null)
      },
      saveTaker: ['processTaker', (ret, next) => {
        if(ret.processTaker) return this.saveTokenData(ret.processTaker, next)
        else return next(null)
      }],
      processMaker: (next) => {
        if(!tx.maker_token_symbol) this.getTokenData(dataValue.maker_token_address, next)
        else return next(null)
      },
      saveMaker: ['processMaker', (ret, next) => {
        if(ret.processMaker) return this.saveTokenData(ret.processMaker, next)
        else return next(null)
      }],
      saveTx: ['saveTaker', 'saveMaker', (ret, next) => {
        // return next(null)
        this.saveTx(tx, ret.saveTaker, ret.saveMaker, next)
      }]
    }, callback);
  }

  processReserveTradeTx(tx, callback){
    const dataValue = tx.dataValues
    async.auto({
      processSource: (next) => {
        if(!tx.source_token_symbol) this.getTokenData(dataValue.source_token_address, next)
        else next(null)
      },
      saveSource: ['processSource', (ret, next) => {
        if(ret.processSource) return this.saveTokenData(ret.processSource, next)
        else return next(null)
      }],
      processDest: (next) => {
        if(!tx.dest_token_symbol) this.getTokenData(dataValue.dest_token_address, next)
        else return next(null)
      },
      saveDest: ['processDest', (ret, next) => {
        if(ret.processDest) return this.saveTokenData(ret.processDest, next)
        else return next(null)
      }],
      saveTx: ['saveSource', 'saveDest', (ret, next) => {
        // return next(null)
        this.saveReserveTx(tx, ret.saveSource, ret.saveDest, next)
      }]
    }, callback);
  }

  saveTokenData(tokenData, callback){
    if(!tokenData.decimal) return callback(null)

    TokenInfoModel.findOne({
        where: {
          address: tokenData.address
        }
      })
      .then(existToken => {
        if(existToken) return null
        else return TokenInfoModel.create(tokenData)
      })
      .then(result => callback(null, tokenData))
      .catch(err => callback(err))
  }

  getTokenData(address, callback){
    if(address.toLowerCase() == network.ETH.address.toLowerCase()){
        return callback(null, network.ETH)
    }

    return getTokenInfo(address, null, (err, tokenInfo) => {
      if(err || !tokenInfo.decimal) {
        if(tokenConfig[address.toLowerCase()]) {
          return callback(null, tokenConfig[address.toLowerCase()])
        }

        return callback(err)
      }

      return callback(null, tokenInfo)
    });
  }

  saveTx(tx, takerToken, makerToken, callback) { 
    const updateData = {
      ...(takerToken && {
        taker_token_symbol: takerToken.symbol,
        taker_token_decimal: takerToken.decimal,
      }),
      ...(makerToken && {
        maker_token_symbol: makerToken.symbol,
        maker_token_decimal: makerToken.decimal,
      })
    }

    tx.update(updateData)
    .then(result => callback(null))
    .catch(err => callback(err))
  }

  saveReserveTx(tx, sourceToken, destToken, callback) { 
    const updateData = {
      ...(sourceToken && {
        source_token_symbol: sourceToken.symbol,
        source_token_decimal: sourceToken.decimal,
      }),
      ...(destToken && {
        dest_token_symbol: destToken.symbol,
        dest_token_decimal: destToken.decimal,
      })
    }

    tx.update(updateData)
    .then(result => callback(null))
    .catch(err => callback(err))
  }

}

module.exports = ReserveInfoCrawler;
