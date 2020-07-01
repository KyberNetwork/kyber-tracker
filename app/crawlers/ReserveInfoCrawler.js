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
const { ReserveInfoModel, ReserveTradeModel } = require('../databaseModel');
const { Op } = require("sequelize");

let LATEST_PROCESSED_BLOCK = 0;
const PARALLEL_INSERT_LIMIT = 10;
const RESERVE_TRADES_LIMIT = 500
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
      startBlockNumber: (next) => {
        if (LATEST_PROCESSED_BLOCK > 0) {
          return next(null, LATEST_PROCESSED_BLOCK);
        }
        getLatestBlockNumber(next, "ReserveInfoModel", "RESERVE_INFO_BLOCK_START");
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
          address: [network.contractAddresses.katalystStorage],
          topics: [
            [
                network.logTopics.katalystAddReserve,
                network.logTopics.kataLystRemoveReserve,
                network.logTopics.kataLystSetReserveWallet
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
        const blockNumbers = _.uniq(_.map(ret.logs, 'blockNumber'));
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
      processLogsData: ['blockTimestamps', (ret, next) => {
        this._processLogData(ret.logs, ret.blockTimestamps, next);
      }],
      getUnprocessedReserveTrade: ['processLogsData', (ret, next) => {
        this._getUnprocessedReserveTrades(next);
      }]
    }, callback);
  }

  _processLogData(logs, blockTimestamps, callback) {
    const records = [];
    const exSession = new ExSession();
    _.each(logs, (log, logIndex) => {
        const txid = log.transactionHash;
        // if (!records[txid]) {
        //   records[txid] = {};
        // }
        const timestamp = blockTimestamps[log.blockNumber];
        if (!timestamp) {
            return callback(`Cannot get block info for log id=${log.id}, tx=${log.transactionHash}`);
        }
        
        const topic = log.topics[0];
        const data = web3.utils.hexToBytes(log.data);
        let record = {}

        switch (topic) {
            case network.logTopics.katalystAddReserve:
                // console.log("_____________ add reserve")
                record = {}
                const addReserveData = web3.eth.abi.decodeParameters([
                    {
                      type: 'uint8',
                      name: 'reserveType'
                    },
                    {
                      type: 'bool',
                      name: 'add'
                    },
                ], web3.utils.bytesToHex(data));

                record.reserve_address = web3.eth.abi.decodeParameter('address', log.topics[1]).toLowerCase();
                record.reserve_id = web3.eth.abi.decodeParameter('bytes32', log.topics[2]);
                record.reserve_wallet = web3.eth.abi.decodeParameter('address', log.topics[3]).toLowerCase();
                record.reserve_type = addReserveData.reserveType
                record.unique_tag = log.transactionHash + "_" + log.id
                record.action = 1
                record.block_number= log.blockNumber
                record.block_timestamp= timestamp

                records.push(record)
                break;
            case network.logTopics.kataLystRemoveReserve:
                // console.log("_____________ remove reserve")
                record = {}
                record.reserve_address = web3.eth.abi.decodeParameter('address', log.topics[1]).toLowerCase();
                record.reserve_id = web3.eth.abi.decodeParameter('bytes32', log.topics[2]);
                record.unique_tag = log.transactionHash + "_" + log.id
                record.action = 2
                record.block_number= log.blockNumber
                record.block_timestamp= timestamp

                records.push(record)
                break;
            case network.logTopics.kataLystSetReserveWallet:
                // console.log("_____________ set reserve wallet")
                record = {}
                record.reserve_id = web3.eth.abi.decodeParameter('bytes32', log.topics[1]);
                record.reserve_wallet = web3.eth.abi.decodeParameter('address', log.topics[2]).toLowerCase();
                record.unique_tag = log.transactionHash + "_" + log.id
                record.action = 3
                record.block_number= log.blockNumber
                record.block_timestamp= timestamp

                records.push(record)
                break;
            
        }

    })


    async.waterfall([
        (next) => {
          async.eachLimit(records, PARALLEL_INSERT_LIMIT, (record, _next) => {
            this._addReserveInfo(exSession, record, _next);
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
  _addReserveInfo (transaction, record, callback) {
    ReserveInfoModel.findOne({
        where: {
          unique_tag: record.unique_tag
        }
      })
      .then(existReserveInfo => {
        if(existReserveInfo) return existReserveInfo.update(record)
        else return ReserveInfoModel.create(record)
      })
      .then(result => {
        return callback(null)
      })
      .catch(err => {
        return callback(err)
      })
  }

  _getUnprocessedReserveTrades(callback){
    ReserveTradeModel.findAll({
        limit: RESERVE_TRADES_LIMIT,
        where: {
          block_number:  {[Op.gt]: network.startKataLystBlock},
          reserve_id: {[Op.not]: null},
          reserve_address: {[Op.is]: null},
        }
    })
    .then(results => {
        async.each(results, (item, _next) => {
            ReserveInfoModel.findAll({
                limit: 1,
                where: {
                  // block_number:  {[Op.lt]: item.block_number},
                  reserve_id: item.reserve_id,
                  action: 1
                },
                order: [ ['block_timestamp', 'DESC'] ]
            })
            .then(founds => {
                if(founds && founds[0]){
                    item.reserve_address = founds[0].reserve_address
                    return item.update({reserve_address: founds[0].reserve_address.toLowerCase()})
                } else {
                    return null
                }
            })
            .then(result => _next(null))
        }, callback)
    })
  }
}

module.exports = ReserveInfoCrawler;
