const _               = require('lodash');
const async           = require('async');
const network         = require('../../config/network');
const getKyberTrade   = require('./getKyberTradeFromTransaction');
const Utils           = require('./Utils');
const logger          = require('sota-core').getLogger('KyberTradeCrawler');

const web3            = Utils.getWeb3Instance();
const abiDecoder      = Utils.getKyberABIDecoder();

let LATEST_PROCESSED_BLOCK = 0;

/**
 * Traversal through all blocks from the moment contract was deployed
 * Find and record all transactions in local database
 */
class KyberTradeCrawler {

  start() {
    async.auto({
      startBlockNumber: (next) => {
        return next(null, LATEST_PROCESSED_BLOCK || network.startBlockNumber);
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
    logger.info(`processBlock: ${blockNumber}`);
    async.auto({
      currentBlockNumber: (next) => {
        web3.eth.getBlockNumber(next);
      },
      block: (next) => {
        web3.eth.getBlock(blockNumber, true, next);
      },
      processTransactions: ['currentBlockNumber', 'block', (ret, next) => {
        const transactions = _.filter(ret.block.transactions, (tx) => {
          return tx.to && tx.to.toLowerCase() === network.contractAddresses.network;
        });

        async.each(transactions, (tx, _next) => {
          getKyberTrade(ret.block, tx, _next);
        }, next);
      }]
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      LATEST_PROCESSED_BLOCK = blockNumber;

      // Finish crawling
      if (blockNumber >= ret.currentBlockNumber) {
        return callback(null, null);
      }

      this.processBlock(blockNumber + 1, callback);
    });
  }

}

module.exports = KyberTradeCrawler;
