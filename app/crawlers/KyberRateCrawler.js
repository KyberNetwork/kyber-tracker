const _                     = require('lodash');
const async                 = require('async');
const network               = require('../../config/network');
const kyberABI              = require('../../config/abi/kyber');
const wrapperABI            = require('../../config/abi/wrapper');
const getLatestBlockNumber  = require('./getLatestBlockNumber');
const Utils                 = require('../common/Utils');
const Resolution            = require('../common/Resolution');
const ExSession             = require('sota-core').load('common/ExSession');
const logger                = require('sota-core').getLogger('KyberRateCrawler');

const BigNumber             = require('bignumber.js');

const web3                  = Utils.getWeb3Instance();
const wrapperContract       = new web3.eth.Contract(wrapperABI, network.contractAddresses.wrapper);
const abiDecoder            = Utils.getKyberABIDecoder();
const rateTokenArrays       = Utils.getRateTokenArray();

let LAST_PROCESSED_BLOCK = 0;
const REQUIRED_CONFIRMATION = 2;
const BLOCK_STEP_SIZE = 20; // ~5 mins
const PARALLEL_QUERY_SIZE = 20;
const PARALLEL_INSERT_LIMIT = 10;

class KyberRateCrawler {

  start() {
    async.auto({
      startBlockNumber: (next) => {
        if (LAST_PROCESSED_BLOCK) {
          return next(null, LAST_PROCESSED_BLOCK);
        }

        getLatestBlockNumber(next, "RateModel", "RATE_BLOCK_START");
      },
      processBlocks: ['startBlockNumber', (ret, next) => {
        LAST_PROCESSED_BLOCK = ret.startBlockNumber;
        this.processBlocks(next);
      }],
    }, (err, ret) => {
      if (err) {
        logger.error(err);
      } else {
        //logger.info(`Finish crawling...`);
      }

      logger.info(`Crawler will be restart in 4 blocks...`);
      setTimeout(() => {
        this.start();
      }, network.averageBlockTime * 4);
    });
  }

  processBlocks (callback) {
    async.auto({
      latestOnchainBlock: (next) => {
        web3.eth.getBlockNumber(next);
      },
      process: ['latestOnchainBlock', (ret, next) => {
        const nextBlocks = this._breakPoints(LAST_PROCESSED_BLOCK + BLOCK_STEP_SIZE, ret.latestOnchainBlock);
        this._processBlocksOnce(nextBlocks, next);
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

  _processBlocksOnce (blocks, callback) {
     
    if (!blocks.last()) {
      logger.info("Reached last block already.");
      return callback(null, null);
    }

    logger.info(`_processBlocks: ${blocks.numbers[0]} -> ${blocks.numbers[blocks.numbers.length - 1]}`);

    async.auto ({
      rates: (next) => {
        Promise.all(blocks.promises).then((rates) => {
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
              return _next(err);
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
    return wrapperContract.methods.getExpectedRates(
      network.contractAddresses.network,
      rateTokenArrays.srcArray,
      rateTokenArrays.destArray,
      rateTokenArrays.qtyArray).call(undefined, blockNo);

  }

  _breakPoints(start, max) {
    const blockNos = [];
    const blockPromises = [];
    for (let i = 0; i < PARALLEL_QUERY_SIZE; i++) {
      const block = start + i * BLOCK_STEP_SIZE;
      if (block <= max) {
        const blockNo = start + i * BLOCK_STEP_SIZE;
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

  _sellRate(rate) {
    if (!rate || rate == '0') return 0;
    return BigNumber(rate).div(BigNumber(10).pow(18)).toNumber();
  }

  _buyRate(rate) {
    if (!rate || rate == '0') return 0;
    return BigNumber(10).pow(18).div(BigNumber(rate)).toNumber();
  }

  _isValidRate(rate) {
    return rate > 0 && rate < 20;
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
    const baseAddress = network.tokens.ETH.address;
    const baseSymbol = "ETH";

    const len = supportedTokens.length;

    for (let i = 0; i < len; i++) {
      const quoteSymbol = supportedTokens[i].symbol;
      let sellExpected = this._sellRate(expectedArray[i]);
      let buyExpected = this._buyRate(expectedArray[len + i]);
      if (this._isValidRate(sellExpected) || this._isValidRate(buyExpected)) {
        if (!this._isValidRate(sellExpected)) sellExpected = 0;
        if (!this._isValidRate(buyExpected)) buyExpected = 0;

        const data = {};
        data.blockNumber = blockNo;
        data.blockTimestamp = blockTimestamp;
        data.baseAddress = baseAddress;
        data.baseSymbol = baseSymbol;
        data.quoteAddress = supportedTokens[i].address;
        data.quoteSymbol = quoteSymbol;

        data.sellExpected = sellExpected;
        data.buyExpected = buyExpected;
        data.midExpected = this._midRate (data.sellExpected, data.buyExpected);

        dataArray.push(Resolution.addSeqs(data));
      }
    }

    return dataArray;
  }

}

module.exports = KyberRateCrawler;
