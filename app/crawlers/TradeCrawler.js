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
const { Op, KyberTradeModel, ReserveTradeModel, TokenInfoModel, RebateFeeModel } = require('../databaseModel');

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
    // console.log('================ ', networkConfig.contractAddresses.internal, networkConfig.logTopics.katalystKyberTrade)
    async.auto({
      logs: (next) => {
        web3.getLogs({
          fromBlock: web3.utils.toHex(fromBlockNumber),
          toBlock: web3.utils.toHex(toBlockNumber),
          address: networkConfig.contractAddresses.networks
            .concat(networkConfig.contractAddresses.internal)
            .concat(networkConfig.contractAddresses.feeBurners)
            .concat(networkConfig.contractAddresses.feeHandler)
            .concat(networkConfig.contractAddresses.workers),
          topics: [
            [
              networkConfig.logTopics.exchange,
              networkConfig.logTopics.feeToWallet,
              networkConfig.logTopics.burnFee,
              networkConfig.logTopics.etherReceival,
              networkConfig.logTopics.kyberTrade,
              networkConfig.logTopics.katalystKyberTrade,
              networkConfig.logTopics.feeDistributed,
              networkConfig.logTopics.katalystExecuteTrade
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
          if(record.katalyst) {
            record.block_number= log.blockNumber
            record.block_hash= log.blockHash
            record.block_timestamp= timestamp
            record.tx= log.transactionHash
            record.maker_address = log.address.toLowerCase();
            record.taker_address = web3.eth.abi.decodeParameter('address', log.topics[1]).toLowerCase();

            record.decodedExecuteTrade = web3.eth.abi.decodeParameters([
              {
                type: 'address',
                name: 'src'
              },
              {
                type: 'address',
                name: 'dest'
              },
              {
                type: 'uint256',
                name: 'actualSrcAmount'
              },
              {
                type: 'uint256',
                name: 'actualDestAmount'
              }
          ], web3.utils.bytesToHex(data));
    
            record.taker_token_amount = record.decodedExecuteTrade.actualSrcAmount.toString()
            record.maker_token_amount = record.decodedExecuteTrade.actualDestAmount.toString()

          
            records.push(record)
            record = JSON.parse(JSON.stringify(initRecord))
            break;
          }

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
          } 

          break;

        case networkConfig.logTopics.feeDistributed:
          record.fee_token = web3.eth.abi.decodeParameter('address', log.topics[1]).toLowerCase();
          record.fee_platform_wallet = web3.eth.abi.decodeParameter('address', log.topics[2]).toLowerCase();
          record.decodedFeeDistributed = web3.eth.abi.decodeParameters([
            {
              type: 'uint256',
              name: 'platformFeeWei'
            },
            {
              type: 'uint256',
              name: 'rewardWei'
            },
            {
              type: 'uint256',
              name: 'rebateWei'
            },
            {
              type: 'address[]',
              name: 'rebateWallets'
            },
            {
              type: 'uint256[]',
              name: 'rebatePercentBpsPerWallet'
            },
            {
              type: 'uint256',
              name: 'burnAmtWei'
            },
        ], web3.utils.bytesToHex(data));
          record.fee_total_collected=Utils.sumBig([record.decodedFeeDistributed.platformFeeWei, record.decodedFeeDistributed.rewardWei,
            record.decodedFeeDistributed.rebateWei, record.decodedFeeDistributed.burnAmtWei
          ], 0)
          record.fee_platform = record.decodedFeeDistributed.platformFeeWei
          record.burn_fees = record.decodedFeeDistributed.burnAmtWei
          record.fee_rebate = record.decodedFeeDistributed.rebateWei
          record.fee_burn_atm = record.decodedFeeDistributed.burnAmtWei         
          break;
        case networkConfig.logTopics.katalystKyberTrade:
          record.katalyst = true
          /// todo new kyber trade handle katalyst
          record.unique_tag = log.transactionHash + "_" + log.id
          record.decodedKatalystTrade = web3.eth.abi.decodeParameters([
            {
              type: 'uint256',
              name: 'ethWeiValue'
            },
            {
              type: 'uint256',
              name: 'networkFeeWei'
            },
            {
              type: 'uint256',
              name: 'platformFeeWei'
            },
            {
              type: 'bytes32[]',
              name: 'arrayT2eReserveIds'
            },
            {
              type: 'bytes32[]',
              name: 'arrayE2tReserveIds'
            },
            {
              type: 'uint256[]',
              name: 'arrayT2eSrcAmounts'
            },
            {
              type: 'uint256[]',
              name: 'arrayE2tSrcAmounts'
            },
            {
              type: 'uint256[]',
              name: 'arrayT2eRates'
            },
            {
              type: 'uint256[]',
              name: 'arrayE2tRates'
            }
        ], web3.utils.bytesToHex(data));

        record.volume_eth = Utils.fromWei(record.decodedKatalystTrade.ethWeiValue)
        record.tx_value_eth = record.volume_eth
        record.decodedKatalystTrade.sourceAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
        record.decodedKatalystTrade.destAddress = web3.eth.abi.decodeParameter('address', log.topics[2]);

        
        // maker, reserve, dest
        // taker, user, source
        record.taker_token_address = record.decodedKatalystTrade.sourceAddress.toLowerCase()
        record.maker_token_address = record.decodedKatalystTrade.destAddress.toLowerCase()
        
        break;

      case networkConfig.logTopics.katalystExecuteTrade:
        record.block_number= log.blockNumber
        record.block_hash= log.blockHash
        record.block_timestamp= timestamp
        record.tx= log.transactionHash
        record.maker_address = log.address.toLowerCase();
        record.taker_address = web3.eth.abi.decodeParameter('address', log.topics[1]).toLowerCase();

        record.decodedExecuteTrade = web3.eth.abi.decodeParameters([
          {
            type: 'address',
            name: 'src'
          },
          {
            type: 'address',
            name: 'dest'
          },
          {
            type: 'address',
            name: 'destAddress'
          },
          {
            type: 'uint256',
            name: 'actualSrcAmount'
          },
          {
            type: 'uint256',
            name: 'actualDestAmount'
          },
          {
            type: 'address',
            name: 'platformWallet'
          },
          {
            type: 'uint256',
            name: 'platformFeeBps'
          }
      ], web3.utils.bytesToHex(data));

        record.taker_token_amount = record.decodedExecuteTrade.actualSrcAmount.toString()
        record.maker_token_amount = record.decodedExecuteTrade.actualDestAmount.toString()

        records.push(record)
        record = JSON.parse(JSON.stringify(initRecord))
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

  _addNewTrade (transaction, record, callback) {
    // check token exist

    async.auto({
      sourceToken: asyncCallback => {
        this.getTokenData(record.taker_token_address, asyncCallback)
      },
      destToken: ['sourceToken', (ret, asyncCallback) => {
        this.getTokenData(record.maker_token_address, asyncCallback)
      }],
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
      }],
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

      if(record.maker_token_address && global.TOKENS_BY_ADDR[record.maker_token_address]) {
        record.maker_token_address = record.maker_token_address.toLowerCase()
        // record.maker_token_symbol = global.TOKENS_BY_ADDR[record.maker_token_address].symbol
        // record.maker_token_decimal = global.TOKENS_BY_ADDR[record.maker_token_address].decimal
      }

      if(record.taker_token_address && global.TOKENS_BY_ADDR[record.taker_token_address]) {
        record.taker_token_address = record.taker_token_address.toLowerCase()
        // record.taker_token_symbol = global.TOKENS_BY_ADDR[record.taker_token_address].symbol
        // record.taker_token_decimal = global.TOKENS_BY_ADDR[record.taker_token_address].decimal 
      } 

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


      const arrayReserveTrades = []
      const arrayRebate = []
      if(record.katalyst){
        // caculate sourceAmount and destAmount
        // if token -> eth: sourceAmount = sum arrayT2eSrcAmounts, destAmount = arrayT2eSrcAmounts * arrayT2eRates
        // if eth -> token: sourceAmount = sum arrayE2tSrcAmounts, destAmount = arrayE2tSrcAmounts * arrayE2tRates
        // if token -> token: sourceAmount = sum arrayT2eSrcAmounts, destAmount = arrayE2tSrcAmounts * arrayE2tRates


        // if(record.taker_token_address.toLowerCase() == networkConfig.ETH.address.toLowerCase()){
        //   // eth -> token
        //   record.taker_token_amount = Utils.sumBig(record.decodedKatalystTrade.arrayE2tSrcAmounts, 0)
        //   if(results.sourceToken && results.destToken){
        //     record.maker_token_amount = Utils.sumBig(record.decodedKatalystTrade.arrayE2tSrcAmounts.map((amount,i) => {
        //       // const amountAndRate = Utils.timesBig([amount, record.decodedKatalystTrade.arrayE2tRates[i]])
        //       // return Utils.toT(amountAndRate, 18, 0)
        //       return Utils.caculateDestAmount(amount, record.decodedKatalystTrade.arrayE2tRates[i], results.destToken.decimal, results.sourceToken.decimal)
        //     }), 0)
        //   }
        // } else if(record.maker_token_address.toLowerCase() == networkConfig.ETH.address.toLowerCase()){
        //   // token -> eth
        //   record.taker_token_amount = Utils.sumBig(record.decodedKatalystTrade.arrayT2eSrcAmounts, 0)
        //   if(results.sourceToken && results.destToken){
        //     record.maker_token_amount = Utils.sumBig(record.decodedKatalystTrade.arrayT2eSrcAmounts.map((amount,i) => {
        //       // const amountAndRate = Utils.timesBig([a, record.decodedKatalystTrade.arrayT2eRates[i]])
        //       // return Utils.toT(amountAndRate, 18, 0)
        //       return Utils.caculateDestAmount(amount, record.decodedKatalystTrade.arrayT2eRates[i], results.destToken.decimal, results.sourceToken.decimal)
        //     }), 0)
        //   }
        // } else {
        //   // token -> token
        //   record.taker_token_amount = Utils.sumBig(record.decodedKatalystTrade.arrayT2eSrcAmounts, 0)
        //   if(results.sourceToken && results.destToken){
        //     record.maker_token_amount = Utils.sumBig(record.decodedKatalystTrade.arrayE2tSrcAmounts.map((amount,i) => {
        //       // const amountAndRate = Utils.timesBig([a, record.decodedKatalystTrade.arrayE2tRates[i]])
        //       // return Utils.toT(amountAndRate, 18, 0)
        //       return Utils.caculateDestAmount(amount, record.decodedKatalystTrade.arrayE2tRates[i], results.destToken.decimal, results.sourceToken.decimal)
        //     }), 0)
        //   }
        // }



        //todo save to reserve trade 
        const initReserveTrade = {
          tx: record.tx,
          block_number: record.block_number,
          block_timestamp: record.block_timestamp,
        }

        if(record.decodedKatalystTrade.arrayT2eReserveIds && record.decodedKatalystTrade.arrayT2eReserveIds.length){
          // token -> eth
          record.decodedKatalystTrade.arrayT2eReserveIds.map((r, i) => {
            const newReserveTrade = JSON.parse(JSON.stringify(initReserveTrade))
            newReserveTrade.reserve_id = r
            newReserveTrade.source_address = record.taker_address.toLowerCase()
            newReserveTrade.dest_address = record.maker_address.toLowerCase()
            newReserveTrade.source_token_address = record.taker_token_address.toLowerCase()
            newReserveTrade.dest_token_address = networkConfig.ETH.address.toLowerCase()
            newReserveTrade.source_amount = record.decodedKatalystTrade.arrayT2eSrcAmounts[i]
            newReserveTrade.rate = record.decodedKatalystTrade.arrayT2eRates[i]
            newReserveTrade.dest_amount =  Utils.caculateDestAmount(newReserveTrade.source_amount, record.decodedKatalystTrade.arrayT2eRates[i], 18, results.sourceToken.decimal)
            // Utils.toT(   Utils.timesBig([newReserveTrade.source_amount, record.decodedKatalystTrade.arrayT2eRates[i]])   , 18, 0)
            newReserveTrade.eth_wei_value = newReserveTrade.dest_amount
            newReserveTrade.value_eth = Utils.toT(newReserveTrade.dest_amount, 18)
            newReserveTrade.unique_tag = record.unique_tag + "_" + r + "_t2e"
            arrayReserveTrades.push(newReserveTrade)
          })
        }

        if(record.decodedKatalystTrade.arrayE2tReserveIds && record.decodedKatalystTrade.arrayE2tReserveIds.length){
          // eth -> token
          record.decodedKatalystTrade.arrayE2tReserveIds.map((r, i) => {
            const newReserveTrade = JSON.parse(JSON.stringify(initReserveTrade))
            newReserveTrade.reserve_id = r
            newReserveTrade.source_address = record.taker_address.toLowerCase()
            newReserveTrade.dest_address = record.maker_address.toLowerCase()
            newReserveTrade.source_token_address = networkConfig.ETH.address.toLowerCase() 
            newReserveTrade.dest_token_address = record.maker_token_address.toLowerCase()
            newReserveTrade.source_amount = record.decodedKatalystTrade.arrayE2tSrcAmounts[i]
            newReserveTrade.rate = record.decodedKatalystTrade.arrayE2tRates[i]
            newReserveTrade.dest_amount = Utils.caculateDestAmount(newReserveTrade.source_amount, record.decodedKatalystTrade.arrayE2tRates[i], results.destToken.decimal, 18)
            // Utils.toT(   Utils.timesBig([newReserveTrade.source_amount, record.decodedKatalystTrade.arrayE2tRates[i]])   , 18, 0)
            newReserveTrade.eth_wei_value = newReserveTrade.source_amount
            newReserveTrade.value_eth = Utils.toT(newReserveTrade.source_amount, 18)
            newReserveTrade.unique_tag = record.unique_tag + "_" + r + "_e2t"
            arrayReserveTrades.push(newReserveTrade)
          })
        } 


        if(record.decodedFeeDistributed && record.decodedFeeDistributed.rebateWallets && record.decodedFeeDistributed.rebateWallets.length){
          const totalRebate = record.decodedFeeDistributed.rebateWei
          record.decodedFeeDistributed.rebateWallets.map((rWallet, i) => {
            const rebateBps = record.decodedFeeDistributed.rebatePercentBpsPerWallet[i]
            const rebateWei = Utils.caculateRebateFee(totalRebate, rebateBps)
            arrayRebate.push({
              tx: record.tx,
              token: record.fee_token,
              rebate_wallet: rWallet.toLowerCase(),
              rebate_bps: rebateBps,
              rebate_fee: rebateWei,
              unique_tag: record.unique_tag + "_" + i + "_" + rWallet,
              block_number: record.block_number,
              block_timestamp: record.block_timestamp
            })
          })

        }

      } else {

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



        // save old tx to reserve trade 
        if(record.source_reserve){
          const newSourceReserveTrade = {
            tx: record.tx,
            reserve_address: record.source_reserve,
            block_number: record.block_number,
            block_timestamp: record.block_timestamp,
            source_address: record.taker_address.toLowerCase(),
            dest_address: record.maker_address.toLowerCase(),
            source_token_address: record.taker_token_address.toLowerCase(),
            dest_token_address: record.maker_token_address.toLowerCase(),
            source_amount: record.taker_token_amount,
            // rate: record.decodedKatalystTrade.arrayT2eRates[i],
            dest_amount: record.maker_token_amount,
            value_eth: record.tx_value_eth,
            unique_tag: record.unique_tag + "_" + record.source_reserve + "_s",
          }
          
          arrayReserveTrades.push(newSourceReserveTrade)
        }
        if(record.dest_reserve){
          const newDestReserveTrade = {
            tx: record.tx,
            reserve_address: record.dest_reserve,
            block_number: record.block_number,
            block_timestamp: record.block_timestamp,
            source_address: record.taker_address.toLowerCase(),
            dest_address: record.maker_address.toLowerCase(),
            source_token_address: record.taker_token_address.toLowerCase(),
            dest_token_address: record.maker_token_address.toLowerCase(),
            source_amount: record.taker_token_amount,
            // rate: record.decodedKatalystTrade.arrayT2eRates[i],
            dest_amount: record.maker_token_amount,
            value_eth: record.tx_value_eth,
            unique_tag: record.unique_tag + "_" + record.dest_reserve + "_d",
          }
          
          arrayReserveTrades.push(newDestReserveTrade)
        }
      }



      const insertReserveTrade = (record, tokenObj) => {
        if(tokenObj[record.source_token_address]){
          record.source_token_symbol = tokenObj[record.source_token_address].symbol
          record.source_token_decimal = tokenObj[record.source_token_address].decimal
        }
        if(tokenObj[record.dest_token_address]){
          record.dest_token_symbol = tokenObj[record.dest_token_address].symbol
          record.dest_token_decimal = tokenObj[record.dest_token_address].decimal
        }
        return ReserveTradeModel.findOne({
          where: {
            unique_tag: record.unique_tag
          }
        }, transaction)
        .then(existReserveTrade => {
          if(existReserveTrade) return existReserveTrade.update(record, transaction)
          else return ReserveTradeModel.create(record)
        })
      }

      const insertRebateFee = (record) => {
        return RebateFeeModel.findOne({
          where: {
            unique_tag: record.unique_tag
          }
        }, transaction)
        .then(existRebate => {
          if(existRebate) return existRebate.update(record, transaction)
          else return RebateFeeModel.create(record)
        })
      }
      
      // logger.info(`Add new trade: ${JSON.stringify(record)}`);
      TokenInfoModel.findAll({
        where: {
          [Op.or]: [
            {address: record.taker_token_address},
            {address: record.maker_token_address},
            {address: networkConfig.ETH.address},
          ]
        },
        raw: true
      })
      .then(founds => {
        const tokenObj = _.keyBy(founds, 'address')
        if(tokenObj[record.taker_token_address.toLowerCase()]){
          record.taker_token_symbol = tokenObj[record.taker_token_address.toLowerCase()].symbol
          record.taker_token_decimal = tokenObj[record.taker_token_address.toLowerCase()].decimal 
        }
        if(tokenObj[record.maker_token_address.toLowerCase()]){
          record.maker_token_symbol = tokenObj[record.maker_token_address.toLowerCase()].symbol
          record.maker_token_decimal = tokenObj[record.maker_token_address.toLowerCase()].decimal
        }

        KyberTradeModel.findOne({
          where: {
            unique_tag: record.unique_tag
          }
        })
        .then(existKyberTrade => {
          if(existKyberTrade) return existKyberTrade.update(record)
          else return KyberTradeModel.create(record)
        })
        .then(result => {
          return Promise.all(arrayReserveTrades.map(rTrade => (insertReserveTrade(rTrade, tokenObj).bind(rTrade))))
        })
        .then(result => {
          return Promise.all(arrayRebate.map(rebateFee => (insertRebateFee(rebateFee).bind(rebateFee))))
        })
        .then(result => {
          return callback(null)
        })
        .catch(err => {
          console.log("-------------- transaction rollback ", record)
          return callback(err)
        })


      })
      
    }) 
  }

  getTokenData(address, callback){
    TokenInfoModel.findOne({
      where: {
        address: address
      }
    })
    .then(existToken => {
      if(existToken) return Promise.resolve(existToken.dataValues)
      else {
        return this.getAndSaveTokenInfo(address)
      }
    })
    .then(tokenData => callback(null, tokenData))
    .catch(err => {
      console.log("---------------- err ----------", err)
      callback(null)
    })
  }

  getAndSaveTokenInfo(address){
    return new Promise((resolve, reject) => {
      getTokenInfo(address, null, (err, tokenData) => {
        if(err || !tokenData.decimal) {
          if(tokenConfig[address.toLowerCase()]) {
            // return callback(null, tokenConfig[address.toLowerCase()])
            console.log("========================= run to get token from config file")
            tokenData = tokenConfig[address.toLowerCase()]
          } else {
            return reject(err || `token info not found for address ${address}`)
          }
        }
        
        if(address.toLowerCase() == networkConfig.ETH.address.toLowerCase()){
          tokenData = networkConfig.ETH
        }

        if(!tokenData.decimal) resolve(null)
        else {
          TokenInfoModel.create(tokenData)
          .then(result => resolve(tokenData))
          .catch(err => reject(err))
        }
      })
    })
  }

};

module.exports = TradeCrawler;
