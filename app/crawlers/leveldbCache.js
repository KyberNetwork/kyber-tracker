require('dotenv').config();
const _         = require('lodash');
const async     = require('async');
const level     = require('level');
const path      = require('path');
const request   = require('superagent');
// const tokens    = require('../../config/network').tokens;
const Utils     = require('../common/Utils');
const logger    = require('sota-core').getLogger('leveldbCache');
const web3      = Utils.getWeb3Instance();

const internalAbi = require('../../config/abi/internal');
const reserveAbi = require('../../config/abi/reserve');
const permisionlessReserveAbi = require('../../config/abi/permissionless_reserve');
const erc20Abi = require('../../config/abi/erc20');

// TODO: refactor this mess
const db = level(path.join(__dirname, '../../db/level'));
const LOCAL_CMC_DATA = {};

const internalContract = new web3.eth.Contract(internalAbi, network.contractAddresses.internal)

function getBlockTimestamp (blockNumber, callback) {
  const key = getBlockTimestampKey(blockNumber);
  db.get(key, (err, ret) => {
    if (err) {
      queryBlockTimestampFromNetwork(blockNumber, callback);
      return;
    }

    if (!ret || isNaN(ret)) {
      logger.warn(`Invalid saved data for block ${blockNumber}. Will remove from db...`);
      db.del(key, (err) => {
        if (err) {
          logger.warn(`Error when remove data of block ${blockNumber}`);
        }
      });
      queryBlockTimestampFromNetwork(blockNumber, callback);
      return;
    }

    logger.trace(`Cache hit! Block ${blockNumber} time: ${ret}`);
    return callback(null, parseInt(ret));
  });
};

function getCoinPrice (symbol, timestamp, callback) {
  const tokenInfo = global.GLOBAL_TOKEN[symbol];
  if (!tokenInfo) {
    return callback(`getCoinPrice: could not find info of [${symbol}] token.`);
  }

  const key = getCoinPriceKey(symbol, timestamp);
  db.get(key, (err, ret) => {
    if (err) {
      queryCoinPriceFromNetwork(tokenInfo, timestamp, callback);
      return;
    }

    if (isNaN(ret)) {
      logger.warn(`Invalid saved data for coin ${symbol} at ${timestamp}. Will remove from db...`);
      db.del(key, (err) => {
        if (err) {
          logger.warn(`Error when remove data of coin ${symbol} at ${timestamp}`);
        }
      });
      queryCoinPriceFromNetwork(tokenInfo, timestamp, callback);
      return;
    }

    logger.trace(`Cache hit! Price of ${symbol} at ${timestamp} is: ${ret}`);
    return callback(null, parseFloat(ret));
  });
}

function getBlockTimestampKey (blockNumber) {
  return `block_timestamp_${blockNumber}`;
}

function getCoinPriceKey (symbol, timestamp) {
  return `price_${symbol}_${timestamp}`;
}

function queryBlockTimestampFromNetwork (blockNumber, callback) {
  web3.eth.getBlock(blockNumber, (err, block) => {
    if (err) {
      return callback(err);
    }

    logger.trace(`Requeried! Block ${blockNumber} time: ${block.timestamp}`);
    const key = getBlockTimestampKey(blockNumber);
    db.put(key, block.timestamp, (_err) => {
      if (_err) {
        logger.warn(`Something went wrong when updating block timestamp to DB: ${_err.toString()}`);
      }

      return callback(null, block.timestamp);
    });
  });
}

function queryCoinPriceFromNetwork (tokenInfo, timestamp, callback) {
  const timeInMillis = timestamp * 1000;
  const symbol = tokenInfo.symbol;

  let needFetch = false;
  if (!LOCAL_CMC_DATA[symbol]) {
    needFetch = true;
  } else {
    prices = LOCAL_CMC_DATA[symbol].price_usd;
    if (!prices || !prices.length) {
      needFetch = true;
    } else {
      // Before CMC begins, price was zero
      if (timeInMillis <= prices[0][0]) {
        return callback(null, prices[0][1]);
      }

      const len = prices.length;
      if (timeInMillis > prices[len-1][0]) {
        needFetch = true;
      }
    }
  }

  if (!needFetch) {
    searchPriceInLocalData(tokenInfo, timeInMillis, LOCAL_CMC_DATA[symbol].price_usd, callback);
    return;
  }

  fetchCMCData(tokenInfo, (err, ret) => {
    if (err) {
      return callback(err);
    }

    searchPriceInLocalData(tokenInfo, timeInMillis, LOCAL_CMC_DATA[symbol].price_usd, callback);
  });
}

function fetchCMCData (tokenInfo, callback) {
  request
    .get(`https://graphs2.coinmarketcap.com/currencies/${tokenInfo.cmcId}/`)
    .end((err, response) => {
      if (err) {
        return callback(`Could not get price history of ${tokenInfo.symbol} token from CMC: ${err.toString()}`);
      }

      LOCAL_CMC_DATA[tokenInfo.symbol] = response.body;
      return callback(null, true);
    });
}

function searchPriceInLocalData (tokenInfo, timeInMillis, prices, callback) {
  const timestamp = Math.floor(timeInMillis / 1000);
  const symbol = tokenInfo.symbol;
  const key = getCoinPriceKey(symbol, timestamp);
  if (!prices || !prices.length) {
    return callback(`searchPriceInLocalData: no data to search for ${tokenInfo.symbol} at ${timeInMillis}`);
  }

  const len = prices.length;
  if (timeInMillis < prices[0][0]) {
    return callback(`Could not get price of [${symbol}] at ${timeInMillis}`);
  }

  if (timeInMillis > prices[len-1][0]) {
    request
      .get(`https://api.coinmarketcap.com/v1/ticker/${tokenInfo.cmcId}/`)
      .end((err, response) => {
        if (err) {
          return callback(`Could not get ticker data of ${tokenInfo.symbol} from CMC: ${err.toString()}`);
        }

        let price;
        try {
          price = parseFloat(response.body[0].price_usd);
        } catch (e) {
          return callback(e);
        }

        return callback(null, price);
      });
    return;
  }

  if (len <= 2) {
    const price = parseFloat(prices[0][1]);
    db.put(key, price)
    return callback(null, price);
  }

  const searchIndex = Math.floor(len / 2);
  if (timeInMillis === prices[searchIndex][0]) {
    const price = parseFloat(prices[searchIndex][1]);
    db.put(key, price);
    return callback(null, price);
  }

  if (timeInMillis < prices[searchIndex][0]) {
    searchPriceInLocalData(tokenInfo, timeInMillis, prices.slice(0, searchIndex), callback);
  } else {
    searchPriceInLocalData(tokenInfo, timeInMillis, prices.slice(searchIndex, len), callback);
  }
}


function getAllReserve(callback){
  return internalContract.methods.getReserves().call(callback)
}

function getReserveType (reserveAddr, callback){
  return internalContract.methods.reserveType(reserveAddr).call(callback)
}

function getReserveTokensList (reserveAddr, callback){
  const reserveContract = new web3.eth.Contract(reserveAbi, reserveAddr)


  const dataConversationRate = reserveContract.methods.conversionRatesContract().encodeABI()
  web3.eth.call({
    to: reserveAddr,
    data: dataConversationRate
  }, (err, result) => {
    if(err || !result) return callback(err || "no conversion rate contract addr")
    if(result == '0x') return callback(null, [])

    const conversionRate = web3.eth.abi.decodeParameters(['address'], result)

    // console.log("----------conversionrate: ", reserveAddr, conversionRate[0])

    const conversionRatesContract = new web3.eth.Contract(CONSTANTS.ABIS.CONVERSION_RATE, conversionRate[0])
    const tokensListData = conversionRatesContract.methods.getListedTokens().encodeABI()

    web3.eth.call({
      to: conversionRate[0],
      data: tokensListData
    }, (errTokens, resultTokens) => {
      if(errTokens || !resultTokens) return callback(err || "no tokens for conversion rate contract addr " + conversionRate[0])
      const tokens = web3.eth.abi.decodeParameters(['address[]'], resultTokens)

      return callback(null, tokens[0])

    })

  })
  // reserveContract.methods.conversionRatesContract().call((err, conversionRateAddr) => {
  //   if(err || !conversionRateAddr) return callback(err || "no conversion rate contract addr")

  //   const conversionRatesContract = new web3.eth.Contract(CONSTANTS.ABIS.CONVERSION_RATE, conversionRateAddr)
  //   return conversionRatesContract.methods.getListedTokens().call((err, tokens) => {
  //     if(err || !tokens ) {
  //       console.log("$$$$$$$$$$$$$$$$ error with reserve " + reserveAddr)
  //       return callback(err || `cannot get tokens of reserve ${reserveAddr}`) 
  //     }
  //     return callback(null, tokens)
  //   })
  // })
}

function getPermissionlessTokensList (reserveAddr, callback){
  const permisionLessContract = new web3.eth.Contract(permisionlessReserveAbi, reserveAddr)

  var data = permisionLessContract.methods.contracts().encodeABI()


  web3.eth.call({
    to: reserveAddr,
    data: data
  }, (err, result) => {
    if(err || !result) return callback(err || `cannot get token of permissionless reserve ${reserveAddr}`) 


    var decoded = web3.eth.abi.decodeParameters(['address', 'address', 'address', 'address', 'address', 'address'], result)
    return callback(err, [decoded[1]])
  })


  // return permisionLessContract.methods.contracts().call((err, result)=> {
  //   console.log("$$$$$$$$$$$-----$$$$$ error with reserve " + reserveAddr)
  //   if(err || !result || !result.token) return callback(err || `cannot get token of permissionless reserve ${reserveAddr}`) 
  //   return callback(err, [result.token])
  // })
}

function getTokenInfo (tokenAddr, type, callback){
  const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddr)
  async.parallelLimit({
    name: tokenContract.methods.name().call,
    decimal: tokenContract.methods.name().call,
    address: asyncCb => asyncCb(null, tokenAddr),
    symbol: tokenContract.methods.symbol().call,
    type: asyncCb => asyncCb(null, type)
  }, 10, callback)
}



module.exports.getBlockTimestamp = getBlockTimestamp;
module.exports.getCoinPrice = getCoinPrice;

module.exports.getAllReserve = getAllReserve;
module.exports.getReserveType = getReserveType;

module.exports.getReserveTokensList = getReserveTokensList
module.exports.getPermissionlessTokensList = getPermissionlessTokensList

module.exports.getTokenInfo = getTokenInfo

