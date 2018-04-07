const _                     = require('lodash');
const async                 = require('async');
const network               = require('../../config/network');
const getKyberTrade         = require('./getKyberTradeFromTransaction');
const getLatestBlockNumber  = require('./getLatestBlockNumber');
const getBurnedFeeFromTransaction     = require('./getBurnedFeeFromTransaction');
const Utils                 = require('../common/Utils');
const logger                = require('sota-core').getLogger('KyberTradeCrawler');

const web3                  = Utils.getWeb3Instance();
const abiDecoder            = Utils.getKyberABIDecoder();

let LATEST_PROCESSED_BLOCK = 0;
const REQUIRED_CONFIRMATION = 7;

/**
 * Traversal through all blocks from the moment contract was deployed
 * Find and record all transactions in local database
 */
class KyberTradeCrawler {

  start() {
    async.auto({
      startBlockNumber: (next) => {
        if (LATEST_PROCESSED_BLOCK > 0) {
          return next(null, LATEST_PROCESSED_BLOCK);
        }

        getLatestBlockNumber(next);
      },
      processBlock: ['startBlockNumber', (ret, next) => {
        this.processBlock(ret.startBlockNumber, next);
      }],
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info(`Finish crawling...`);
      }

      logger.info(`Crawler will be restart in 15 seconds...`);
      setTimeout(() => {
        this.start();
      }, network.averageBlockTime);
    });
  }

  processBlock (blockNumber, callback) {
    this._processBlockOnce(blockNumber, (err, ret) => {
      if (err) {
        return callback(err);
      }

      LATEST_PROCESSED_BLOCK = blockNumber;

      // Finish crawling
      if (blockNumber > ret.currentBlockNumber - REQUIRED_CONFIRMATION) {
        return callback(null, null);
      }

      this.processBlock(blockNumber + 1, callback);
    });
  }

  _processBlockOnce (blockNumber, callback) {
    logger.info(`_processBlock: ${blockNumber}`);
    async.auto({
      currentBlockNumber: (next) => {
        web3.eth.getBlockNumber(next);
      },
      block: (next) => {
        web3.eth.getBlock(blockNumber, true, next);
      },
      processTradeTransactions: ['block', (ret, next) => {
        if (!ret.block) {
          return next(`Empty block response. Wait for the next run..`);
        }

        const transactions = _.filter(ret.block.transactions, (tx) => {
          return tx.to && tx.to.toLowerCase() === network.contractAddresses.network;
        });

        async.each(transactions, (tx, _next) => {
          getKyberTrade(ret.block, tx, _next);
        }, next);
      }],
      processBurnedFeeTransactions: ['block', (ret, next) => {
        if (!ret.block) {
          return next(`Empty block response. Wait for the next run..`);
        }

        const transactions = _.filter(ret.block.transactions, (tx) => {
          return Utils.isBurnerContractAddress(tx.to);
        });

        async.each(transactions, (tx, _next) => {
          getBurnedFeeFromTransaction(ret.block, tx, _next);
        }, next);
      }]
    }, callback);
  }

  processSomeBlocks (blockNumbers, callback) {
    async.eachSeries(blockNumbers, (blockNumber, next) => {
      this._processBlockOnce(blockNumber, next)
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      callback(null, true);
    });
  }

}

module.exports = KyberTradeCrawler;
