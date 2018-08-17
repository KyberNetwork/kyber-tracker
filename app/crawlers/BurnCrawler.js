const _                     = require('lodash');
const async                 = require('async');
const network               = require('../../config/network');
const getLatestBlockNumber  = require('./getLatestBlockNumber');
const getBurnedFeeFromTransaction     = require('./getBurnedFeeFromTransaction');
const Utils                 = require('../common/Utils');
const logger                = require('sota-core').getLogger('BurnCrawler');
const networkConfig               = require('../../config/network');
const ExSession                   = require('sota-core').load('common/ExSession');
const BigNumber                   = require('bignumber.js');

const web3                  = Utils.getWeb3Instance();
const abiDecoder            = Utils.getKyberABIDecoder();

let LATEST_PROCESSED_BLOCK = 0;
const REQUIRED_CONFIRMATION = process.env.REQUIRED_CONFIRMATION || 7;

/**
 * Traversal through all blocks from the moment contract was deployed
 * Find and record all burned fees in local database
 * NOTE: this class is currently only use for collecting burned fees
 * Trade data are crawled by KyberTradeCrawler
 */
class BurnCrawler {

  start() {
    async.auto({
      startBlockNumber: (next) => {
        if (LATEST_PROCESSED_BLOCK > 0) {
          return next(null, LATEST_PROCESSED_BLOCK);
        }
        getLatestBlockNumber(next, "BurnedFeeModel", "BURNED_BLOCK_START");
      },
      processBlock: ['startBlockNumber', (ret, next) => {
        this.processBlocks(ret.startBlockNumber, next);
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
      }, network.averageBlockTime * 20);
    });
  }

  processBlocks (latestProcessedBlock, callback) {
    let fromBlockNumber, toBlockNumber;
    console.log('startBlockNumber',latestProcessedBlock)
    async.auto({
      latestOnchainBlock: (next) => {
        web3.eth.getBlockNumber(next);
      },
      processBlocksOnce: ['latestOnchainBlock', (ret, next) => {
        const latestOnchainBlock = ret.latestOnchainBlock;
        fromBlockNumber = latestProcessedBlock;
        toBlockNumber = latestOnchainBlock;
        if (toBlockNumber <= fromBlockNumber) {
          return next(null, true);
        }

        this._processBlocksOnce(fromBlockNumber, toBlockNumber, next);
      }]
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      if (ret.processBlocksOnce === true) {
        return callback(null, true);
      }

      LATEST_PROCESSED_BLOCK = toBlockNumber;
      process.nextTick(() => {
        this.processBlocks(LATEST_PROCESSED_BLOCK, callback);
      });
    });
  }

  _processBlocksOnce (fromBlockNumber, toBlockNumber, callback) {
    logger.info(`_processBlocksOnce: ${fromBlockNumber} → ${toBlockNumber}`);

    async.auto({
      logs: (next) => {
        web3.getLogs({
          fromBlock: web3.utils.toHex(fromBlockNumber),
          toBlock: web3.utils.toHex(toBlockNumber),
          address: [networkConfig.tokens.KNC.address],
          topics: [
              networkConfig.logTopics.burned
          ]
        }, (err, ret) => {
          if (err) {
            return next(`Cannot query data from network: ${err.toString()}`);
          }
          return next(null, ret);
        });
      },
      processData: ['logs', (ret, next) => {
        this._processLogData(ret.logs, next);
      }],
    }, callback);
  }

  _processLogData(logs, callback) {
    async.each(logs, (log, next) => {
      async.auto({
        block: (_next) => {
          web3.eth.getBlock(log.blockNumber, true, _next);
        },
        processBurnedFeeTransactions: ['block', (ret, _next) => {
          if (!ret.block) {
            return _next(`Empty block response. Wait for the next run..`);
          }
          const transactions = _.filter(ret.block.transactions, (tx) => {
            return Utils.isBurnerContractAddress(tx.to);
          });
          async.each(transactions, (tx, _next_) => {
            getBurnedFeeFromTransaction(ret.block, tx, _next_);
          }, _next);
        }]
      }, next);
    },callback);
  }
}

module.exports = BurnCrawler;
