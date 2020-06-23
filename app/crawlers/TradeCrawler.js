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
const { KyberTradeModel } = require('../databaseModel');


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
    const CMCService = exSession.getService('CMCService');
    
    const initRecord = {
      burnFeeReserve: {},
      walletFeeReserve: {}
    }
    let record = JSON.parse(JSON.stringify(initRecord))
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
          const rEventFee = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)))
          record.walletFeeReserve[rAddr.toLowerCase()] = rEventFee
          if (!record.commissionReserveAddress || record.commissionReserveAddress == rAddr) {
            record.commission_reserve_address = rAddr;
            // record.sourceWalletFee = rEventFee
          } else {
            record.commission_reserve_address += ";" + rAddr;
            // record.destWalletFee = rEventFee
          }

          if(!record.commissionReserveArray) record.commissionReserveArray = []
          record.commissionReserveArray.push(rAddr)
          
          record.commission_receive_address = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.commission = new BigNumber((record.commission || 0)).plus(rEventFee).toString();
          break;
        case networkConfig.logTopics.burnFee:
          // For token-token, burns twice, MIGHT from 2 reserves
          const bAddr = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          const bEventFee = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(32, 64)))
          record.burnFeeReserve[bAddr.toLowerCase()] = bEventFee
          if (!record.burn_reserve_address || record.burn_reserve_address == bAddr) {
            record.burn_reserve_address = bAddr;
            record.source_reserve = bAddr
            // record.sourceBurnFee = bEventFee
          } else {
            record.burn_reserve_address += ";" + bAddr;
            record.dest_reserve = bAddr
            // record.destBurnFee = bEventFee
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
          record.burn_fees = new BigNumber((record.burn_fees || 0)).plus(bEventFee).toString();
          break;
        case networkConfig.logTopics.etherReceival:
          record.volume_eth = Utils.fromWei(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(0, 32))));
          break;
        case networkConfig.logTopics.exchange:
          if(log.blockNumber >= networkConfig.startPermissionlessReserveBlock) break;
          record.maker_address = log.address;
          record.taker_address = web3.eth.abi.decodeParameter('address', log.topics[1]);
          record.taker_token_address = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          record.maker_token_address = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.taker_token_amount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)));
          record.maker_token_amount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(96, 128)));
          record.unique_tag = log.transactionHash + "_" + log.id


          record.block_number= log.blockNumber,
          record.block_hash= log.blockHash,
          record.block_timestamp= timestamp,
          record.tx= log.transactionHash

          const reserveObj = this.processReserveAddrOldTx(record.taker_token_address, record.maker_token_address, record.burn_reserve_array, record.commission_reserve_array)
          record.source_reserve = reserveObj.source_reserve
          record.dest_reserve = reserveObj.dest_reserve

          if(reserveObj.getFromEmiterExecute){
            record.source_reserve = log.address
          }
          
          records.push(record)
          record = JSON.parse(JSON.stringify(initRecord))
          break;
        case networkConfig.logTopics.feeDistributed:
          record.feeToken = web3.eth.abi.decodeParameter('address', log.topics[1]);
          record.feePlatformWallet = web3.eth.abi.decodeParameter('address', log.topics[2]);
          record.platformFeeWei = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
          record.feeRewardWei = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
          record.feeRebateWei = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(64, 96)));
          record.arrayFeeRebateWallet = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(96, 128)));
          record.arrayRebatePercentBpsPerWallet = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(128, 160)));
          ecord.feeBurnAmtWei = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(128, 160)));

          break;
        case networkConfig.logTopics.kyberTrade:
          if(log.blockNumber < networkConfig.startPermissionlessReserveBlock) break;

          if(log.blockNumber < networkConfig.startKataLystBlock) {
            record.taker_address = web3.eth.abi.decodeParameter('address', log.topics[1]);

            record.taker_token_address = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
            record.maker_token_address = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
            
            record.taker_token_amount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(64, 96)));
            record.maker_token_amount = web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(96, 128)));
            
            record.maker_address = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(128, 160)));
            record.volume_eth = Utils.fromWei(web3.eth.abi.decodeParameter('uint256', web3.utils.bytesToHex(data.slice(160, 192))));
            
            record.source_reserve = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(192, 224)));
            record.dest_reserve = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(224, 256)));
            
            record.unique_tag = log.transactionHash + "_" + log.id
            record.block_number= log.blockNumber
            record.block_hash= log.blockHash
            record.block_timestamp= timestamp
            record.tx= log.transactionHash
            records.push(record)
            record = JSON.parse(JSON.stringify(initRecord))
            break;
          } else {
            record.katalyst = true
            record.blockNumber= log.blockNumber,
            record.blockHash= log.blockHash,
            record.blockTimestamp= timestamp,
            record.tx= log.transactionHash
            /// todo new kyber trade handle katalyst
            record.uniqueTag = log.transactionHash + "_" + log.id
            
            record.sourceAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
            record.destAddress = web3.eth.abi.decodeParameter('address', log.topics[2]);
            record.ethWeiValue = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(0, 32)));
            record.networkFeeWei = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(32, 64)));
            record.platformFeeWei = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(64, 96)));
            record.arrayT2eReserveIds = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(96, 128)));
            record.arrayE2tReserveIds = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(128, 160)));

            record.arrayT2eSrcAmounts = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(160, 192)));
            record.arrayE2tSrcAmounts = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(192, 224)));

            record.arrayT2eRates = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(224, 256)));
            record.arrayE2tRates = web3.eth.abi.decodeParameter('address', web3.utils.bytesToHex(data.slice(256, 288)));

            records.push(record)
            record = JSON.parse(JSON.stringify(initRecord))
            break;
          }

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
          returnObj.source_reserve = burnReserveArray[0]
          returnObj.dest_reserve = burnReserveArray[1]
        } else {
          logger.warn(`unexpected burn fees, need 2 burn fees (src-dst)`)
        }
      } else {
        if(burnReserveArray.length == 1){
          returnObj.source_reserve = burnReserveArray[0]
        } else {
          logger.warn(`unexpected burn fees, need 1 burn fees (src)`)
        }
      }
    } else if (Utils.isBurnableToken(destAddress)){
      if(burnReserveArray.length == 1){
        returnObj.dest_reserve = burnReserveArray[0]
      } else {
        logger.warn(`unexpected burn fees, need 1 burn fees (dst)`)
      }
    } else if (commissionReserveArray.length != 0){
      if(commissionReserveArray.length == 1){
        returnObj.source_reserve = commissionReserveArray[0]
      } else {
        returnObj.source_reserve = commissionReserveArray[0]
        returnObj.dest_reserve = commissionReserveArray[1]
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
        if(!global.TOKENS_BY_ADDR[record.taker_token_address.toLowerCase()]){
          // fetch token and its reserve
          async.parallel({
            info: (_next) => (getTokenInfo(record.taker_token_address, '2', _next)),
            reserves: (_next) => getTokenReserve(record.taker_token_address, 'source', record.block_number, _next)
          }, (err, results) => asyncCallback(err, results))
        } else {
          return asyncCallback(null)
        }
      },
      checkDestToken: (asyncCallback) => {
        if(!global.TOKENS_BY_ADDR[record.maker_token_address.toLowerCase()]){
          // fetch token and its reserve
          async.parallel({
            info: (_next) => (getTokenInfo(record.maker_token_address, '2', _next)),
            reserves: (_next) => getTokenReserve(record.maker_token_address, 'source', record.block_number, _next)
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
      // const KyberTradeModel = exSession.getModel('KyberTradeModel');
      // const ReserveTradeModel = exSession.getModel('ReserveTradeModel');
      // const FeeDistributedModel = exSession.getModel('FeeDistributedModel');


      if(record.sourceReserve) {
        record.source_reserve = record.source_reserve.toLowerCase()
      }
      if(record.destReserve) {
        record.dest_reserve = record.dest_reserve.toLowerCase()
      }

      if(record.maker_token_address) {
        record.maker_token_address = record.maker_token_address.toLowerCase()
        record.maker_token_symbol = global.TOKENS_BY_ADDR[record.maker_token_address].symbol
        record.maker_token_decimal = global.TOKENS_BY_ADDR[record.maker_token_address].decimal
      }

      if(record.taker_token_address) {
        record.taker_token_address = record.taker_token_address.toLowerCase()
        record.taker_token_symbol = global.TOKENS_BY_ADDR[record.taker_token_address].symbol
        record.taker_token_decimal = global.TOKENS_BY_ADDR[record.taker_token_address].decimal 
      } 


      const ethAddress = networkConfig.ETH.address.toLowerCase();
      if (record.taker_token_address === ethAddress) {
        record.volume_eth = Utils.fromWei(record.taker_token_amount);
        record.source_reserve = null
        record.source_official = 1
      } else {
        if(!record.source_reserve || (record.source_reserve && global.NETWORK_RESERVES && global.NETWORK_RESERVES[record.source_reserve] == '1')){
          record.source_official = 1
        } else {
          record.source_official = 0
        }

      }
      
      if (record.maker_token_address === ethAddress) {
        record.volume_eth = Utils.fromWei(record.maker_token_amount);
        record.dest_reserve = null
        record.dest_official = 1
      } else {
        if(!record.dest_reserve ||  (record.dest_reserve && global.NETWORK_RESERVES && global.NETWORK_RESERVES[record.dest_reserve] == '1')){
          record.dest_official = 1
        } else {
          record.dest_official = 0
        }
      }

      record.tx_value_eth = record.volume_eth
      if(record.numberBurnEvent > 1){
        record.volume_eth = record.volume_eth * record.numberBurnEvent
      } else if( record.block_number >= networkConfig.startPermissionlessReserveBlock ) {
        let numberMultipleVol = 0
        if(record.sourceReserve && !networkConfig.ignoreReserveVolume[record.sourceReserve]){
          numberMultipleVol = numberMultipleVol + 1
        }
        if(record.destReserve && !networkConfig.ignoreReserveVolume[record.destReserve]){
          numberMultipleVol = numberMultipleVol + 1
        }
        if(numberMultipleVol > 1){
          record.volume_eth = record.volume_eth * numberMultipleVol
        }
      }

      if(record.burnFeeReserve){
        if(record.sourceReserve && record.burnFeeReserve[record.sourceReserve]){
          record.source_burn_fee = record.burnFeeReserve[record.sourceReserve]
        }
        if(record.destReserve && record.burnFeeReserve[record.destReserve]){
          record.dest_burn_fee = record.burnFeeReserve[record.destReserve]
        }
      }

      if(record.walletFeeReserve){
        if(record.sourceReserve && record.walletFeeReserve[record.sourceReserve]){
          record.source_wallet_Fee = record.walletFeeReserve[record.sourceReserve]
        }
        if(record.destReserve && record.walletFeeReserve[record.destReserve]){
          record.dest_wallet_fee = record.walletFeeReserve[record.destReserve]
        }
      }

      // maker, reserve, dest
      // taker, user, source

      //// make katalyst works with old database
      if(record.katalyst){
        //todo handle new Kyber Trade data
        if(record.sourceAddress){
          record.takerTokenAddress = record.sourceAddress.toLowerCase()
          record.takerTokenSymbol = global.TOKENS_BY_ADDR[record.takerTokenAddress].symbol
          record.takerTokenDecimal = global.TOKENS_BY_ADDR[record.takerTokenAddress].decimal 
        }

        if(record.destAddress){
          record.makerTokenAddress = record.destAddress.toLowerCase()
          record.makerTokenSymbol = global.TOKENS_BY_ADDR[record.makerTokenAddress].symbol
          record.makerTokenDecimal = global.TOKENS_BY_ADDR[record.makerTokenAddress].decimal
        }
        record.volumeEth
        record.txValueEth = record.ethWeiValue
        record.volumeEth = record.ethWeiValue

        // collectedFee, source, dest reserrve ....
      }






      // console.log("_________________", record.sourceReserve, record.sourceOfficial, record.destReserve,  record.destOfficial)
      
      // logger.info(`Add new trade: ${JSON.stringify(record)}`);

      console.log("&&&&&&&&&&&&&&&& ", record)
      // KyberTradeModel.add(record, {
      //   isInsertIgnore: true
      // }, callback);
      KyberTradeModel
      .findOne({
        where: {
          unique_tag: record.unique_tag
        }
      })
      .then(data => {
        if(data) return data.update(record)
        else return KyberTradeModel.create(record)
      })
      .then((result) => {
        // console.log("_______________ ", err, result)
        return callback(null)
      })
      .catch(err => {
        return callback(err)
      })

      if(record.katalyst){
        //todo save to reserve trade 


        ReserveTradeModel.add(record, {
          isInsertIgnore: true
        }, callback);




        //todo save to fee distributed
        FeeDistributedModel.add(record, {
          isInsertIgnore: true
        }, callback);

      }

    }) 
  }

};

module.exports = TradeCrawler;
