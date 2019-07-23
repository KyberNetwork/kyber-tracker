const _                           = require('lodash');
const async                       = require('async');
const BigNumber                   = require('bignumber.js');
const getLatestBlockNumber        = require('./getLatestBlockNumber');
const getBlockTimestamp           = require('./leveldbCache').getBlockTimestamp;
const getCoinPrice                = require('./leveldbCache').getCoinPrice;
const getTokenReserve             = require('./leveldbCache').getTokenReserve;
const getTokenInfo                = require('./leveldbCache').getTokenInfo;

const Utils                       = require('../common/Utils');
const networkConfig               = require('../../config/network');
const ExSession                   = require('sota-core').load('common/ExSession');
const logger                      = require('sota-core').getLogger('TradeCrawler');
const configFetcher               = require('./configFetcher')


let LATEST_PROCESSED_BLOCK = 0;
const BATCH_BLOCK_SIZE = parseInt(process.env.BATCH_BLOCK_SIZE || 3000);
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

class TradeCrawler {

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
      latestProcessedBlock: ['config', (ret, next) => {
        
        global.TOKENS_BY_ADDR=ret.config.tokensByAddress
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
        return callback(`Cannot get block info for log id=${log.id}, tx=${log.transactionHash}`);
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

          if(!record.commissionReserveArray) record.commissionReserveArray = []
          record.commissionReserveArray.push(rAddr)
          
          record.commissionReceiveAddress = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.commission = new BigNumber((record.commission || 0)).plus(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)))).toString();
          break;
        case networkConfig.logTopics.burnFee:
          // For token-token, burns twice, MIGHT from 2 reserves
          const bAddr = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          if (!record.burnReserveAddress || record.burnReserveAddress == bAddr) {
            record.burnReserveAddress = bAddr;
            record.sourceReserve = bAddr
          } else {
            record.burnReserveAddress += ";" + bAddr;
            record.destReserve = bAddr
          }

          if(!record.numberBurnEvent){
            record.numberBurnEvent = 1
          } else {
            record.numberBurnEvent = record.numberBurnEvent + 1
          }

          if(!record.burnReserveArray) record.burnReserveArray = []
          record.burnReserveArray.push(bAddr)
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
          record.uniqueTag = log.transactionHash + "_" + log.id


          record.blockNumber= log.blockNumber,
          record.blockHash= log.blockHash,
          record.blockTimestamp= timestamp,
          record.tx= log.transactionHash

          const reserveObj = this.processReserveAddrOldTx(record.takerTokenAddress, record.makerTokenAddress, record.burnReserveArray, record.commissionReserveArray)
          record.sourceReserve = reserveObj.sourceReserve
          record.destReserve = reserveObj.destReserve

          if(reserveObj.getFromEmiterExecute){
            record.sourceReserve = log.address
          }
          
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
          
          record.sourceReserve = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(192, 224)));
          record.destReserve = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(224, 256)));
          
          record.uniqueTag = log.transactionHash + "_" + log.id
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

  processReserveAddrOldTx(srcAddress, destAddress, burnReserveArray = [], commissionReserveArray = []){
    const returnObj = {
      sourceReserve: null,
      destReserve: null
    }

    if(Utils.isBurnableToken(srcAddress)){
      if(Utils.isBurnableToken(destAddress)){
        if(burnReserveArray.length == 2){
          returnObj.sourceReserve = burnReserveArray[0]
          returnObj.destReserve = burnReserveArray[1]
        } else {
          logger.warn(`unexpected burn fees, need 2 burn fees (src-dst)`)
        }
      } else {
        if(burnReserveArray.length == 1){
          returnObj.sourceReserve = burnReserveArray[0]
        } else {
          logger.warn(`unexpected burn fees, need 1 burn fees (src)`)
        }
      }
    } else if (Utils.isBurnableToken(destAddress)){
      if(burnReserveArray.length == 1){
        returnObj.destReserve = burnReserveArray[0]
      } else {
        logger.warn(`unexpected burn fees, need 1 burn fees (dst)`)
      }
    } else if (commissionReserveArray.length != 0){
      if(commissionReserveArray.length == 1){
        returnObj.sourceReserve = commissionReserveArray[0]
      } else {
        returnObj.sourceReserve = commissionReserveArray[0]
        returnObj.destReserve = commissionReserveArray[1]
      }
    } else {
      // need to get from tx receipt
      logger.info(`fall back to get reserve from tx receipt with tokens, ${srcAddress} > ${destAddress}`)
      returnObj.getFromEmiterExecute = true
    }

    if(!returnObj.sourceReserve && !returnObj.destReserve){
      returnObj.getFromEmiterExecute = true
    }
    
    return returnObj


  }

  _addNewTrade (exSession, record, callback) {
    // check token exist

    async.auto({
      checkSourceToken: (asyncCallback) => {
        if(!global.TOKENS_BY_ADDR[record.takerTokenAddress.toLowerCase()]){
          // fetch token and its reserve
          async.parallel({
            info: (_next) => (getTokenInfo(record.takerTokenAddress, '2', _next)),
            reserves: (_next) => getTokenReserve(record.takerTokenAddress, 'source', record.blockNumber, _next)
          }, (err, results) => asyncCallback(err, results))
        } else {
          return asyncCallback(null)
        }
      },
      checkDestToken: (asyncCallback) => {
        if(!global.TOKENS_BY_ADDR[record.makerTokenAddress.toLowerCase()]){
          // fetch token and its reserve
          async.parallel({
            info: (_next) => (getTokenInfo(record.makerTokenAddress, '2', _next)),
            reserves: (_next) => getTokenReserve(record.makerTokenAddress, 'source', record.blockNumber, _next)
          }, (err, results) => asyncCallback(err, results))
        } else {
          return asyncCallback(null)
        }
      },
      checkReserves: ['checkSourceToken', 'checkDestToken', (ret, next) => {
        if(ret.checkSourceToken || ret.checkDestToken){
          // re fetch reserves list and type
          configFetcher.fetchReserveListFromNetwork(err => {
            if(err) return next(err)

            const extraTokens = configFetcher.standardizeReserveTokenType([
              ...(ret.checkSourceToken ? [{...ret.checkSourceToken.info, reservesAddr: ret.checkSourceToken.reserves}] : []),
              ...(ret.checkDestToken ? [{...ret.checkDestToken.info, reservesAddr: ret.checkDestToken.reserves}] : [])
            ])

            global.TOKENS_BY_ADDR = _.merge(global.TOKENS_BY_ADDR, extraTokens)
            return next(null)
          })

        } else {
          return next(null, null)
        }
      }]
    }, (err, results) => {
      const KyberTradeModel = exSession.getModel('KyberTradeModel');


      if(record.sourceReserve) {
        record.sourceReserve = record.sourceReserve.toLowerCase()
      }
      if(record.destReserve) {
        record.destReserve = record.destReserve.toLowerCase()
      }

      if(record.makerTokenAddress) {
        record.makerTokenAddress = record.makerTokenAddress.toLowerCase()
        const makerTokenInfo = global.TOKENS_BY_ADDR[record.makerTokenAddress]
        record.makerTokenSymbol = global.TOKENS_BY_ADDR[record.makerTokenAddress].symbol
        record.makerTokenDecimal = global.TOKENS_BY_ADDR[record.makerTokenAddress].decimal
      }

      if(record.takerTokenAddress) {
        record.takerTokenAddress = record.takerTokenAddress.toLowerCase()
        const takerTokenInfo = global.TOKENS_BY_ADDR[record.takerTokenAddress]
        record.takerTokenSymbol = global.TOKENS_BY_ADDR[record.takerTokenAddress].symbol
        record.takerTokenDecimal = global.TOKENS_BY_ADDR[record.takerTokenAddress].decimal 
      } 


      const ethAddress = networkConfig.ETH.address.toLowerCase();
      if (record.takerTokenAddress === ethAddress) {
        record.volumeEth = Utils.fromWei(record.takerTokenAmount);
        record.sourceOfficial = 1
      } else {
        if(!record.sourceReserve || (record.sourceReserve && global.NETWORK_RESERVES && global.NETWORK_RESERVES[record.sourceReserve] == '1')){
          record.sourceOfficial = 1
        } else {
          record.sourceOfficial = 0
        }

      }
      
      if (record.makerTokenAddress === ethAddress) {
        record.volumeEth = Utils.fromWei(record.makerTokenAmount);
        record.destOfficial = 1
      } else {
        if(!record.destReserve ||  (record.destReserve && global.NETWORK_RESERVES && global.NETWORK_RESERVES[record.destReserve] == '1')){
          record.destOfficial = 1
        } else {
          record.destOfficial = 0
        }
      }


      if(record.numberBurnEvent > 1){
        record.volumeEth = record.volumeEth * record.numberBurnEvent
      }


      // console.log("_________________", record.sourceReserve, record.sourceOfficial, record.destReserve,  record.destOfficial)
      
      logger.info(`Add new trade: ${JSON.stringify(record)}`);

      KyberTradeModel.add(record, {
        isInsertIgnore: true
      }, callback);

    }) 
  }

};

module.exports = TradeCrawler;
