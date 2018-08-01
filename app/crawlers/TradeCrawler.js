const _                           = require('lodash');
const async                       = require('async');
const BigNumber                   = require('bignumber.js');
const getLatestBlockNumber        = require('./getLatestBlockNumber');
const getBlockTimestamp           = require('./leveldbCache').getBlockTimestamp;
const getCoinPrice                = require('./leveldbCache').getCoinPrice;
const Utils                       = require('../common/Utils');
const networkConfig               = require('../../config/network');
const ExSession                   = require('sota-core').load('common/ExSession');
const logger                      = require('sota-core').getLogger('TradeCrawler');

let LATEST_PROCESSED_BLOCK = 0;
const BATCH_BLOCK_SIZE = process.env.BATCH_BLOCK_SIZE || 10000;
const REQUIRED_CONFIRMATION = process.env.REQUIRED_CONFIRMATION || 7;
const PARALLEL_INSERT_LIMIT = 10;
const web3 = Utils.getWeb3Instance();
const tokensByAddress = _.keyBy(networkConfig.tokens, 'address');
const tokensBySymbol = _.keyBy(networkConfig.tokens, 'symbol');

class TradeCrawler {

  start () {
    async.auto({
      latestProcessedBlock: (next) => {
        if (LATEST_PROCESSED_BLOCK > 0) {
          return next(null, LATEST_PROCESSED_BLOCK);
        }

        getLatestBlockNumber(next);
      },
      processBlocks: ['latestProcessedBlock', (ret, next) => {
        this.processBlocks(ret.latestProcessedBlock, next);
      }]
    }, (err, ret) => {
      let timer = networkConfig.averageBlockTime;
      if (err) {
        logger.error(err);
        logger.info(`Crawler will be restarted in 5 seconds...`);
        timer = 5000;
      } else {
        logger.info(`Already processed the newest block. Crawler will be restarted in 1 block...`);
      }

      setTimeout(() => {
        this.start();
      }, timer);
    });
  }

  processBlocks (latestProcessedBlock, callback) {
    let fromBlockNumber, toBlockNumber;
    async.auto({
      latestOnchainBlock: (next) => {
        web3.eth.getBlockNumber(next);
      },
      processBlocksOnce: ['latestOnchainBlock', (ret, next) => {
        const latestOnchainBlock = ret.latestOnchainBlock;
        fromBlockNumber = latestProcessedBlock;

        // Crawl the newest block already
        if (fromBlockNumber > latestOnchainBlock - REQUIRED_CONFIRMATION) {
          toBlockNumber = latestProcessedBlock;
          return next(null, true);
        }

        toBlockNumber = latestProcessedBlock + BATCH_BLOCK_SIZE;
        if (toBlockNumber > latestOnchainBlock - REQUIRED_CONFIRMATION) {
          toBlockNumber = latestOnchainBlock - REQUIRED_CONFIRMATION;
        }

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
          address: networkConfig.contractAddresses.networks
            .concat(networkConfig.contractAddresses.feeBurners)
            .concat(networkConfig.contractAddresses.workers),
          topics: [
            [
              networkConfig.logTopics.exchange,
              networkConfig.logTopics.feeToWallet,
              networkConfig.logTopics.burnFee,
              networkConfig.logTopics.etherReceival
            ]
          ]
        }, (err, ret) => {
          if (err) {
            return next(`Cannot query data from network: ${err.toString()}`);
          }

          return next(null, ret);
        });
      },
      blockTimestamps: ['logs', (ret, next) => {
        const blockNumbers = _.map(ret.logs, 'blockNumber');
        const blockTimestamps = {};
        async.each(blockNumbers, (blockNumber, _next) => {
          getBlockTimestamp(blockNumber, (_err, timestamp) => {
            if (_err) {
              logger.error(_err);
            }

            blockTimestamps[blockNumber] = timestamp;
            _next(null, null);
          });
        }, (_err) => {
          if (_err) {
            return next(_err);
          }

          return next(null, blockTimestamps);
        });
      }],
      processData: ['blockTimestamps', (ret, next) => {
        this._processLogData(ret.logs, ret.blockTimestamps, next);
      }],
    }, callback);
  }

  _processLogData (logs, blockTimestamps, callback) {
    const records = {};
    const exSession = new ExSession();
    const KyberTradeModel = exSession.getModel('KyberTradeModel');
    const CMCService = exSession.getService('CMCService');

    _.each(logs, (log) => {
      const txid = log.transactionHash;
      if (!records[txid]) {
        records[txid] = {};
      }

      const timestamp = blockTimestamps[log.blockNumber];
      if (!timestamp) {
        return next(`Cannot get block info for log id=${log.id}, tx=${log.transactionHash}`);
      }

      const record = records[txid];
      record.blockNumber = log.blockNumber;
      record.blockHash = log.blockHash;
      record.blockTimestamp = timestamp;
      record.tx = log.transactionHash;

      const topic = log.topics[0];
      const data = web3.utils.hexToBytes(log.data);

      switch (topic) {
        case networkConfig.logTopics.exchange:
          record.makerAddress = log.address;
          record.takerAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
          record.takerTokenAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          record.makerTokenAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.takerTokenAmount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)));
          record.makerTokenAmount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(96, 128)));
          break;
        case networkConfig.logTopics.feeToWallet:
          record.commissionReserveAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));;
          record.commissionReceiveAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.commission = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)));
          break;
        case networkConfig.logTopics.burnFee:
          // For token-token, burns twice but should from same reserve
          record.burnReserveAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          // This is the fee kyber collects from reserve (tax + burn, not include partner commission)
          // Note for token-token, burnFees twich
          record.burnFees = new BigNumber((record.burnFees || 0)).plus(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(32, 64)))).toString();
          break;
        case networkConfig.logTopics.etherReceival:
          record.volumeEth = Utils.fromWei(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(0, 32))));
          break;
      }
    });

    async.waterfall([
      (next) => {
        async.eachLimit(_.values(records), PARALLEL_INSERT_LIMIT, (record, _next) => {
          this._addNewTrade(exSession, record, _next);
        }, next);
      },
      (next) => {
        exSession.commit(next);
      }
    ], (err, ret) => {
      exSession.destroy();
      if (err) {
        return callback(err);
      }

      return callback(null, true);
    });
  }

  _addNewTrade (exSession, record, callback) {
    const KyberTradeModel = exSession.getModel('KyberTradeModel');
    const CMCService = exSession.getService('CMCService');
    logger.info(`Add new trade: ${JSON.stringify(record)}`);
    async.auto({
      price: (next) => {
        //getCoinPrice('ETH', record.blockTimestamp, next);
        CMCService.getHistoricalPrice('ETH', record.blockTimestamp * 1000, next);
      },
      model: ['price', (ret, next) => {
        const ethAddress = networkConfig.tokens.ETH.address.toLowerCase();
        if (record.takerTokenAddress.toLowerCase() === ethAddress) {
          record.volumeEth = Utils.fromWei(record.takerTokenAmount);
        }

        if (record.makerTokenAddress.toLowerCase() === ethAddress) {
          record.volumeEth = Utils.fromWei(record.makerTokenAmount);
        }

        record.volumeUsd = record.volumeEth * ret.price.price_usd;

        KyberTradeModel.add(record, {
          isInsertIgnore: true
        }, next);
      }],
    }, callback);
  }

};

module.exports = TradeCrawler;
