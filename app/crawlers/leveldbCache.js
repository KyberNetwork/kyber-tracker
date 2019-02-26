require('dotenv').config();
const _         = require('lodash');
const async     = require('async');
const level     = require('level');
const path      = require('path');
const request   = require('superagent');
const network    = require('../../config/network')
const Utils     = require('../common/Utils');
const logger    = require('sota-core').getLogger('leveldbCache');
const web3      = Utils.getWeb3Instance();

const internalAbi = require('../../config/abi/internal');
const reserveAbi = require('../../config/abi/reserve');
const bancorOrderbookAbi = require('../../config/abi/bancor_orderbook')
const permisionlessReserveAbi = require('../../config/abi/permissionless_reserve');
const erc20Abi = require('../../config/abi/erc20');
const conversionRateAbi = require('../../config/abi/conversion_rate');

// TODO: refactor this mess
const db = level(path.join(__dirname, '../../db/level'));
const LOCAL_CMC_DATA = {};
const MAXIMUN_RESERVES = 1000;
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

function getCoinPrice (address, timestamp, callback) {
  const tokenInfo = global.TOKENS_BY_ADDR[address];
  if (!tokenInfo) {
    return callback(`getCoinPrice: could not find info of [${address}] token.`);
  }

  const key = getCoinPriceKey(address, timestamp);
  db.get(key, (err, ret) => {
    if (err) {
      queryCoinPriceFromNetwork(tokenInfo, timestamp, callback);
      return;
    }

    if (isNaN(ret)) {
      logger.warn(`Invalid saved data for coin ${address} at ${timestamp}. Will remove from db...`);
      db.del(key, (err) => {
        if (err) {
          logger.warn(`Error when remove data of coin ${address} at ${timestamp}`);
        }
      });
      queryCoinPriceFromNetwork(tokenInfo, timestamp, callback);
      return;
    }

    logger.trace(`Cache hit! Price of ${address} at ${timestamp} is: ${ret}`);
    return callback(null, parseFloat(ret));
  });
}

function getBlockTimestampKey (blockNumber) {
  return `block_timestamp_${blockNumber}`;
}

function getCoinPriceKey (address, timestamp) {
  return `price_${address}_${timestamp}`;
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
  const address = tokenInfo.address.toLowerCase();

  let needFetch = false;
  if (!LOCAL_CMC_DATA[address]) {
    needFetch = true;
  } else {
    prices = LOCAL_CMC_DATA[address].price_usd;
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
    searchPriceInLocalData(tokenInfo, timeInMillis, LOCAL_CMC_DATA[address].price_usd, callback);
    return;
  }

  fetchCMCData(tokenInfo, (err, ret) => {
    if (err) {
      return callback(err);
    }

    searchPriceInLocalData(tokenInfo, timeInMillis, LOCAL_CMC_DATA[address].price_usd, callback);
  });
}

function fetchCMCData (tokenInfo, callback) {
  request
    .get(`https://graphs2.coinmarketcap.com/currencies/${tokenInfo.cmcId}/`)
    .end((err, response) => {
      if (err) {
        return callback(`Could not get price history of ${tokenInfo.symbol} token from CMC: ${err.toString()}`);
      }

      LOCAL_CMC_DATA[tokenInfo.address] = response.body;
      return callback(null, true);
    });
}

function searchPriceInLocalData (tokenInfo, timeInMillis, prices, callback) {
  const timestamp = Math.floor(timeInMillis / 1000);
  const address = tokenInfo.address.toLowerCase();
  const key = getCoinPriceKey(address, timestamp);
  if (!prices || !prices.length) {
    return callback(`searchPriceInLocalData: no data to search for ${tokenInfo.symbol} at ${timeInMillis}`);
  }

  const len = prices.length;
  if (timeInMillis < prices[0][0]) {
    return callback(`Could not get price of [${address}] at ${timeInMillis}`);
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
    if(err) {
      logger.error(err)
      return callback(null, [])
    } 

    if(!result){
      logger.error(`no conversion rate contract for reserve ${reserveAddr}`)
      return callback(null, [])
    } 

    if(result == '0x') {
      const bancorContract =  new web3.eth.Contract(JSON.parse(bancorOrderbookAbi), '0xb020636f8e30cb8c35a863412503cFD5E3d6D6cE')
      
      bancorContract.methods.token().call()
      .then(token => callback(null, [token]))
      .catch(err => callback(err))

    } else {
      const conversionRate = web3.eth.abi.decodeParameters(['address'], result)

      const conversionRatesContract = new web3.eth.Contract(conversionRateAbi, conversionRate[0])
      const tokensListData = conversionRatesContract.methods.getListedTokens().encodeABI()
      const tokenData = conversionRatesContract.methods.token().encodeABI()
      async.auto({
        getListedToken: (_next) => web3.eth.call({
          to: conversionRate[0],
          data: tokensListData
        }, (err, result) => _next(null, result)),

        token: (_next) => web3.eth.call({
          to: conversionRate[0],
          data: tokenData
        }, (err, result) => _next(null, result))
      }, (err, tokenresults) => {

        if(!tokenresults.getListedToken && !tokenresults.token){
          logger.error(`no tokens for conversion rate contract addr ${conversionRate[0]}`)
          return callback(null, [])
        }


        if(tokenresults.getListedToken){
          const tokens = web3.eth.abi.decodeParameters(['address[]'], tokenresults.getListedToken)
          return callback(null, tokens[0])
        }

        if(tokenresults.token){
          // const token = web3.eth.abi.decodeParameters(['address'], tokenresults.token)
          const token = web3.eth.abi.decodeParameters(['address'], tokenresults.token)
          return callback(null, [token[0]])
        }

        

        return callback(null, [])

      })
    }

    

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
    if(err){
      logger.error(err)
      return callback(null, [])
    }
    if(!result){
      logger.error(`cannot get token of permissionless reserve ${reserveAddr}`)
      return callback(null, [])
    }
    
    var decoded = web3.eth.abi.decodeParameters(['address', 'address', 'address', 'address', 'address', 'address'], result)
    return callback(null, [decoded[1]])
  })

}

function getTokenInfo (tokenAddr, type, callback){
  const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddr)
  async.parallel({
    name: tokenContract.methods.name().call,
    decimal: tokenContract.methods.decimals().call,
    address: asyncCb => asyncCb(null, tokenAddr),
    symbol: tokenContract.methods.symbol().call,
    type: asyncCb => asyncCb(null, type)
  }, (err, info) => {
    // console.log("-----------", err, info)
    if(err) return callback(null, {
      address: tokenAddr,
      type: type
    })
    return callback(null, info)
  })
}

function getTokenReserve (tokenAddr, type, blockNo, callback) {
  let getReserveFunc = ''
  let count = 0
  let allReserves = []
  if(type == 'source'){
    getReserveFunc = 'reservesPerTokenSrc'
  } else {
    getReserveFunc = 'reservesPerTokenDest'
  }

  async.until(()=> {
    return count > MAXIMUN_RESERVES
  },
  (_next) => {
    internalContract.methods[getReserveFunc](tokenAddr, web3.utils.toHex(count)).call(undefined, blockNo)
    .then(reserves => {
      count = count + 1
      allReserves.push(reserves.toLowerCase())
      return _next(null)
    })
    .catch(e => {
      return _next(e)
    })
  },
  (err, n) => {
    return callback(null, allReserves)
  })
}

module.exports.getBlockTimestamp = getBlockTimestamp;
module.exports.getCoinPrice = getCoinPrice;

module.exports.getAllReserve = getAllReserve;
module.exports.getReserveType = getReserveType;

module.exports.getReserveTokensList = getReserveTokensList
module.exports.getPermissionlessTokensList = getPermissionlessTokensList

module.exports.getTokenInfo = getTokenInfo
module.exports.getTokenReserve = getTokenReserve

