const _                     = require('lodash');
const async                 = require('async');
const network               = require('../../config/network');
const kyberABI              = require('../../config/abi/kyber');
const wrapperABI            = require('../../config/abi/wrapper');
const networkABI            = require('../../config/abi/network')
const oldNetwordABI         = require('../../config/abi/oldNetwork')
const getLatestBlockNumber  = require('./getLatestBlockNumber');
const Utils                 = require('../common/Utils');
const Resolution            = require('../common/Resolution');
const ExSession             = require('sota-core').load('common/ExSession');
const logger                = require('sota-core').getLogger('RateCrawler');
const configFetcher         = require('./configFetcher')

const BigNumber             = require('bignumber.js');

const web3                  = Utils.getWeb3Instance();
const wrapperContract       = new web3.eth.Contract(wrapperABI, network.contractAddresses.wrapper);
const abiDecoder            = Utils.getKyberABIDecoder();
let tokenConfig = _.transform(network.tokens, (result, v, k) => {result[v.address.toLowerCase()] = {...v, address: v.address.toLowerCase()}})

let LAST_PROCESSED_BLOCK = 0;
const REQUIRED_CONFIRMATION = 2;
// const BLOCK_STEP_SIZE = 40; // ~10 mins
const BLOCK_STEP_SIZE = parseInt(process.env['RATE_BLOCK_STEP_SIZE'] || network.rateBlockStepSize)
const RATE_FREQ_BLOCK = parseInt(process.env['RATE_FREQ_BLOCK'] || 40)
const PARALLEL_QUERY_SIZE = 100;
const PARALLEL_INSERT_LIMIT = 10;
var rateTokenArrays

// networkConfig.tokens
const processTokens = (tokens) => ({
  tokensByAddress: _.keyBy(tokens, 'address'),
  tokensBySymbol: _.keyBy(tokens, 'symbol')
})

const oldNetworkAddr = network.contractAddresses.networks[0];
const oldNetworkContract = new web3.eth.Contract(oldNetwordABI, oldNetworkAddr);

const networkAddr = network.contractAddresses.networks[network.contractAddresses.networks.length - 1 ];
const networkContract = new web3.eth.Contract(networkABI, networkAddr);


class RateCrawler {

  start() {
    async.auto({
      config: (next) => {
        configFetcher.fetchConfigTokens((err, tokens) => {
          if(err) return next(err)
          tokenConfig = _.merge(tokens, tokenConfig)
          // processTokens(tokenConfig)
          return next(null, processTokens(tokenConfig))
        })
      },
      startBlockNumber: ['config', (ret, next) => {
        global.TOKENS_BY_ADDR=ret.config.tokensByAddress
        rateTokenArrays = Utils.getRateTokenArray();

        if (LAST_PROCESSED_BLOCK) {
          return next(null, LAST_PROCESSED_BLOCK);
        }

        getLatestBlockNumber(next, "RateModel", "RATE_BLOCK_START");
      }],
      processBlocks: ['startBlockNumber', (ret, next) => {
        LAST_PROCESSED_BLOCK = ret.startBlockNumber;
        this.processBlocks(next);
      }],
    }, (err, ret) => {
      // let timer = network.averageBlockTime * PARALLEL_QUERY_SIZE;
      let timer = 15000
      if (err) {
        logger.error(err);
        timer = 15000;
        logger.info(`Crawler will be restart in ${timer} ms...`);

      } else {
        logger.info(`Crawler will be restart in ${PARALLEL_QUERY_SIZE} blocks...`);
      }

      setTimeout(() => {
        this.start();
      }, timer);
    });
  }

  processBlocks (callback) {
    async.auto({
      latestOnchainBlock: (next) => {
        const end_block = process.env["RATE_BLOCK_END"];
        if (end_block) {
          next(null, end_block);
        } else {
          web3.eth.getBlockNumber(next);
        }
      },
      process: ['latestOnchainBlock', (ret, next) => {
        this._processBlocksOnce(ret.latestOnchainBlock, next);
      }]
    }, (err, ret) => {
      if (err) {
        return callback(err);
      }

      if (!!ret.process && !!ret.process.lastBlockNo) {
        this.processBlocks(callback);
      } else {
        //logger.info("Stopping crawler...");
        callback(null, null);
      }
    });
  }

  _processBlocksOnce (latestOnchainBlock, callback) {
    const blocks = this._breakPoints(LAST_PROCESSED_BLOCK + RATE_FREQ_BLOCK, latestOnchainBlock);


    if (!blocks.last()) {
      logger.info("Reached last block already.");
      return callback(null, null);
    }

    logger.info(`_processBlocks: ${blocks.numbers[0]} -> ${blocks.numbers[blocks.numbers.length - 1]}`);

    async.auto ({
      rates: (next) => {
        Promise.all(blocks.promises).then((rates) => {
            // logger.info("rates=================", rates)
            next(null, rates);
          }, (err) => {
            logger.error(err)

            // next(err, rates);
            next(err, null);
          });
        },
      blockTimestamps: ['rates', (ret, next) => {
        const blockTimestamps = {};
        async.each(blocks.numbers, (blockNumber, _next) => {
          web3.eth.getBlock(blockNumber, (_err, block) => {
            if (_err) {
              return _next(_err);
            }
            blockTimestamps[blockNumber] = block.timestamp;
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
        const processedData = [];
        for (let i = 0; i < blocks.numbers.length; i++) {
          const blockNo = blocks.numbers[i];
          const blockRates = ret.rates[i];
          const blockStamp = ret.blockTimestamps[blockNo];
          processedData.push(this._processRateData(blockRates, blockNo, blockStamp));
        }
        next (null, processedData);
      }],
      saveData: ['processData', (ret, next) => {
        this._insertData(ret.processData, next);
      }],
      lastBlockNo: ['saveData', (ret, next) => {
        const lastBlockNo = blocks.last();
        !!lastBlockNo && (LAST_PROCESSED_BLOCK = lastBlockNo);
        next(null, lastBlockNo);
      }]
    }, callback);
  }

  _insertData(rows, callback) {
    if(!rows || !rows.length) return callback(null, true);

    const exSession = new ExSession();
    async.waterfall([
      (next) => {
        async.eachLimit(rows, PARALLEL_INSERT_LIMIT, (row, _next) => {
          this._insertRow(exSession, row, _next);
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

  _insertRow (exSession, row, callback) {
    const model = exSession.getModel('RateModel');
    model.add(row, {isInsertIgnore: true}, callback);
  }

  _getRatesFromBlockPromise(blockNo) {

    const addressNetwork = blockNo >= network.startBlockNumberV2 ? networkAddr : oldNetworkAddr
    const contractNetwork = blockNo >= network.startBlockNumberV2 ? networkContract : oldNetworkContract

    return new Promise((resolve, reject) => {
      return wrapperContract.methods.getExpectedRates(
        addressNetwork,
        rateTokenArrays.srcArray,
        rateTokenArrays.destArray,
        rateTokenArrays.qtyArray
      )
      .call(undefined, blockNo)
      .then(result => {
        if(!result || !result[0] || !result[0].length || !result[1] || !result[1].length){
          return Promise.all(rateTokenArrays.qtyArray.map((qty, i) => {
            return new Promise((_resolve, _reject) => {
              contractNetwork.methods.getExpectedRate(
                rateTokenArrays.srcArray[i],
                rateTokenArrays.destArray[i],
                qty
              )
              .call(undefined, blockNo)
              .then(_result => _resolve(_result))
              .catch(_err => _resolve({
                '0': '0',
                '1': '0',
                'expectedRate': '0',
                'slippageRate': '0'
              }))
            })
          }))
          .then(results => {
            return resolve(this._arrayRate(results))
          })
          .catch(errors => {
            return reject(errors)
          })

        } else {
          return resolve(result)
        }
      })
    });
    

  }

  _breakPoints(start, max) {
    const blockNos = [];
    const blockPromises = [];
    for (let i = 0; i < PARALLEL_QUERY_SIZE; i++) {
      const blockNo = start + i * RATE_FREQ_BLOCK;
      if (blockNo <= max) {
        // const blockNo = start + i * RATE_FREQ_BLOCK;
        blockNos.push(blockNo);
        blockPromises.push(this._getRatesFromBlockPromise(blockNo));
      } else {
        break;
      }
    }

    return {
      numbers: blockNos,
      promises: blockPromises,
      last: () => {
        if (!blockNos.length) return null;
        return blockNos[blockNos.length - 1];
      }
    };

  }

  _arrayRate(rates){
    const returnObj = {
      '0': [],
      '1': [],
      'expectedRate': [],
      'slippageRate': []
    }
    rates.map(r => {
      returnObj['0'].push(r['0'])
      returnObj['1'].push(r['1'])
      returnObj['expectedRate'].push(r['expectedRate'])
      returnObj['slippageRate'].push(r['slippageRate'])
    })

    return returnObj
  }

  _sellRate(rate) {
    if (!rate || rate == '0') return 0;
    return BigNumber(rate).div(BigNumber(10).pow(18)).toNumber();
  }

  _buyRate(rate) {
    if (!rate || rate == '0') return 0;
    return BigNumber(10).pow(18).div(BigNumber(rate)).toNumber();
  }

  _isValidRate(rate) {
    return rate > 0 && rate < 100;
  }

  _midRate(sell, buy) {
    if (!sell) return buy;
    if (!buy) return sell;

    return (buy + sell) / 2;
  }

  _processRateData(rates, blockNo, blockTimestamp) {
    if (!rates || !rates.expectedRate || !rates.expectedRate.length) {
      return [];
    }

    const supportedTokens = rateTokenArrays.supportedTokens;
    const expectedArray = rates.expectedRate;

    const dataArray = [];
    const baseAddress = network.ETH.address;
    const baseSymbol = network.ETH.symbol;
    const baseDecimal = network.ETH.decimal

    const len = supportedTokens.length;

    for (let i = 0; i < len; i++) {
      const quoteSymbol = supportedTokens[i].symbol;
      const quoteDecimal = supportedTokens[i].decimal;
      let sellExpected = this._sellRate(expectedArray[i]);
      let buyExpected = this._buyRate(expectedArray[len + i]);
      if (this._isValidRate(sellExpected) || this._isValidRate(buyExpected)) {
        if (!this._isValidRate(sellExpected)) sellExpected = 0;
        if (!this._isValidRate(buyExpected)) buyExpected = 0;
        const data = {};
        data.blockNumber = blockNo;
        data.blockTimestamp = blockTimestamp;
        data.baseAddress = baseAddress.toLowerCase();
        data.baseSymbol = baseSymbol;
        data.baseDecimal = baseDecimal;

        data.quoteAddress = supportedTokens[i].address.toLowerCase();
        data.quoteSymbol = quoteSymbol;
        data.quoteDecimal = quoteDecimal

        data.sellExpected = sellExpected;
        data.buyExpected = buyExpected;
        data.midExpected = this._midRate (data.sellExpected, data.buyExpected);

        dataArray.push(Resolution.addSeqs(data));
      }
    }
    // console.log("++++++++++ save rate :", JSON.stringify(dataArray))
    return dataArray;
  }

}

module.exports = RateCrawler;
