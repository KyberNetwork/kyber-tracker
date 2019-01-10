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
const configFetcher               = require('./configFetcher')


let LATEST_PROCESSED_BLOCK = 0;
const BATCH_BLOCK_SIZE = parseInt(process.env.BATCH_BLOCK_SIZE || 10000);
const REQUIRED_CONFIRMATION = parseInt(process.env.REQUIRED_CONFIRMATION || 7);
const PARALLEL_INSERT_LIMIT = 10;
const web3 = Utils.getWeb3Instance();

let tokenConfig = networkConfig.tokens
let tokensByAddress, tokensBySymbol

// networkConfig.tokens
const processTokens = (tokens) => {
  tokensByAddress = _.keyBy(tokens, 'address');
  tokensBySymbol = _.keyBy(tokens, 'symbol');
}

class TradeCrawler {

  start () {
    async.auto({
      config: (next) => {
        configFetcher.fetchConfigTokens((err, tokens) => {
          if(err) return next(err)
          tokenConfig = {...tokenConfig, ...tokens}
          processTokens(tokenConfig)
          return next(null, tokenConfig)
        })
      },
      latestProcessedBlock: ['config', (ret, next) => {
        global.GLOBAL_TOKEN=ret.config
        if (LATEST_PROCESSED_BLOCK > 0) {
          return next(null, LATEST_PROCESSED_BLOCK);
        }

        getLatestBlockNumber(next, "KyberTradeModel", "TRADE_BLOCK_START");
      }],
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
            .concat(networkConfig.contractAddresses.internal)
            .concat(networkConfig.contractAddresses.feeBurners)
            .concat(networkConfig.contractAddresses.workers),
          topics: [
            [
              networkConfig.logTopics.exchange,
              networkConfig.logTopics.feeToWallet,
              networkConfig.logTopics.burnFee,
              networkConfig.logTopics.etherReceival,
              networkConfig.logTopics.kyberTrade
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
    const records = [];
    const exSession = new ExSession();
    const KyberTradeModel = exSession.getModel('KyberTradeModel');
    const CMCService = exSession.getService('CMCService');
    
    var record = {}
    _.each(logs, (log, logIndex) => {
      
      const txid = log.transactionHash;
      // if (!records[txid]) {
      //   records[txid] = {};
      // }
      const timestamp = blockTimestamps[log.blockNumber];
      if (!timestamp) {
        return next(`Cannot get block info for log id=${log.id}, tx=${log.transactionHash}`);
      }

      
      const topic = log.topics[0];
      const data = web3.utils.hexToBytes(log.data);

      switch (topic) {
        case networkConfig.logTopics.feeToWallet:
          const rAddr = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          if (!record.commissionReserveAddress || record.commissionReserveAddress == rAddr) {
            record.commissionReserveAddress = rAddr;
          } else {
            record.commissionReserveAddress += ";" + rAddr;
          }
          record.commissionReceiveAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.commission = new BigNumber((record.commission || 0)).plus(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)))).toString();
          break;
        case networkConfig.logTopics.burnFee:
          // For token-token, burns twice, MIGHT from 2 reserves
          const bAddr = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          if (!record.burnReserveAddress || record.burnReserveAddress == bAddr) {
            record.burnReserveAddress = bAddr;
          } else {
            record.burnReserveAddress += ";" + bAddr;
          }
          // This is the fee kyber collects from reserve (tax + burn, not include partner commission)
          // Note for token-token, burnFees twich
          record.burnFees = new BigNumber((record.burnFees || 0)).plus(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(32, 64)))).toString();
          break;
        case networkConfig.logTopics.etherReceival:
          record.volumeEth = Utils.fromWei(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(0, 32))));
          break;
        case networkConfig.logTopics.exchange:
          if(log.blockNumber >= networkConfig.startPermissionlessReserveBlock) break;
          record.makerAddress = log.address;
          record.takerAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
          record.takerTokenAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          record.makerTokenAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.takerTokenAmount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)));
          record.makerTokenAmount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(96, 128)));
          record.uniqueTag = log.transactionHash + "_" + logIndex


          record.blockNumber= log.blockNumber,
          record.blockHash= log.blockHash,
          record.blockTimestamp= timestamp,
          record.tx= log.transactionHash

          records.push(record)
          record = {}
          break;
        case networkConfig.logTopics.kyberTrade:
          if(log.blockNumber < networkConfig.startPermissionlessReserveBlock) break;

          record.takerAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);

          record.takerTokenAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          record.makerTokenAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          
          record.takerTokenAmount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)));
          record.makerTokenAmount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(96, 128)));
          
          record.makerAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(128, 160)));
          record.volumeEth = Utils.fromWei(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(160, 192))));
          
          const reserve1 = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(192, 224)));
          const reserve2 = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(224, 256)));
          record.reserves = [reserve1, reserve2].join(';')
          
          record.uniqueTag = log.transactionHash + "_" + logIndex
          record.blockNumber= log.blockNumber
          record.blockHash= log.blockHash
          record.blockTimestamp= timestamp
          record.tx= log.transactionHash

          records.push(record)
          record = {}
          break;
      }
    });

    async.waterfall([
      (next) => {
        async.eachLimit(records, PARALLEL_INSERT_LIMIT, (record, _next) => {
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
    

    const ethAddress = networkConfig.ETH.address.toLowerCase();
    if (record.takerTokenAddress.toLowerCase() === ethAddress) {
      record.volumeEth = Utils.fromWei(record.takerTokenAmount);
    }

    if (record.makerTokenAddress.toLowerCase() === ethAddress) {
      record.volumeEth = Utils.fromWei(record.makerTokenAmount);
    }

    KyberTradeModel.add(record, {
      isInsertIgnore: true
    }, callback);



    // async.auto({
    //   price: (next) => {
    //     //getCoinPrice('ETH', record.blockTimestamp, next);
    //     CMCService.getHistoricalPrice('ETH', record.blockTimestamp * 1000, next);
    //   },
    //   model: ['price', (ret, next) => {
    //     const ethAddress = networkConfig.ETH.address.toLowerCase();
    //     if (record.takerTokenAddress.toLowerCase() === ethAddress) {
    //       record.volumeEth = Utils.fromWei(record.takerTokenAmount);
    //     }

    //     if (record.makerTokenAddress.toLowerCase() === ethAddress) {
    //       record.volumeEth = Utils.fromWei(record.makerTokenAmount);
    //     }

    //     record.volumeUsd = record.volumeEth * ret.price.price_usd;

    //     KyberTradeModel.add(record, {
    //       isInsertIgnore: true
    //     }, next);
    //   }],
    // }, callback);


  }

};

module.exports = TradeCrawler;
