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
        return next(null)
      }]
    }, callback);
  }

  saveTokenData(tokenData, callback){
    TokenInfoModel.findOne({
        where: {
          address: tokenData.address
        }
      })
      .then(existToken => {
        if(existToken) return null
        else return TokenInfoModel.create(tokenData)
      })
      .then(result => callback(null, result))
      .catch(err => callback(err))
  }

  getTokenData(address, callback){
    if(address.toLowerCase() == network.ETH.address.toLowerCase()){
        return callback(null, network.ETH)
    }
    return getTokenInfo(address, null, callback);
  }

}

module.exports = ReserveInfoCrawler;
