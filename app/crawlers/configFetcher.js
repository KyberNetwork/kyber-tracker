require('dotenv').config();
const axios = require('axios');
const network = require('../../config/network');
const apisEndpint = process.env['APIS_ENDPOINT'] + "/internal/currencies"

const getAllReserve                     = require('./leveldbCache').getAllReserve;
const getReserveType                    = require('./leveldbCache').getReserveType;

const getReserveTokensList              = require('./leveldbCache').getReserveTokensList;
const getPermissionlessTokensList       = require('./leveldbCache').getPermissionlessTokensList;

const getTokenInfo         = require('./leveldbCache').getTokenInfo;


const fetchData = params => new Promise((resolve, reject) => {
  axios(params)
    .then((response) => {
      if (!response.data) {
        reject(response.statusText);
      } else {
        resolve(response.data.data);
      }
    })
    .catch((err) => {
      reject(err);
    });
});

const standardizeTokens = (arrayTokens) => {
  const returnConfig = {}
  arrayTokens.map(t => {
    returnConfig[t.symbol] = {
      ...network.tokens[t.symbol],
      name: t.name,
      address: t.address,
      symbol: t.symbol,
      decimal: t.decimals,
      cmcIdv2: t.cmc_id,
      cgId: t.cg_id,
      // delisted: true
      hidden: t.listing_time
    }
  })
  return returnConfig
}

const getTokensFromApis = callback => {
  try {
    fetchData({
      url: apisEndpint,
      method: "get"
    }).then(currencies => {
      const tokens = standardizeTokens(currencies)
      return callback(null, tokens)
    })
    .catch(err => callback(err));
  } catch (error) {
    return callback(error)
  }
}

const getTokensFromNetwork = callback => {
  getAllReserve((err, arrayReserve) => {
    //[ '0x975b54A3F8036DA7E96b570f39E5B09cd625a4D5',
    // '0x82a428804514ECef24879c2fF24718F08a55cDcC',
    // '0xEB52Ce516a8d054A574905BDc3D4a176D3a2d51a' ]
    console.log("list all reserve ", err, arrayReserve)
    if(err){
      console.log(err)
    }

    async.parallelLimit(arrayReserve.map(r => (asyncCallback) =>  getReserveType(r, asyncCallback)) , 10,
    (err, arrayTypeOfReserve) => {  
      // [ '2', '2', '1' ]
      async.parallelLimit(
        arrayTypeOfReserve.map((t, i) => (next) => {
          if(t == '1'){
            // none
            getReserveTokensList(arrayReserve[i], (err, arrayTokens) => next(err, arrayTokens &&
              arrayTokens.map(t => ({
                reserveAddr: arrayReserve[i],
                type: '1',
                tokenAddr: t
              }))
            ))
          }
          if(t == '2'){
            // permissionless
            getPermissionlessTokensList(arrayReserve[i], (err, arrayTokens) => next(err, arrayTokens &&
              arrayTokens.map(t => ({
                reserveAddr: arrayReserve[i],
                type: '2',
                tokenAddr: t
              }))
            ))
          }
        }), 10, (err, tokensAddr) => {
          
          if(err){
            console.log(err)
            return 
          }
          const allTokens = _.flatten(tokensAddr)
  
          async.parallelLimit(
            allTokens.map(t => next => getTokenInfo(t.tokenAddr, t.type, (err, info) => next(err, {...t, info}))),
            10,
            (err, allTokenWithInfo) => {
              ////////////// 
              const allTokenObj = {}
  
              allTokenWithInfo.map(t => {
                const tokenInfo = t.info
                if(! allTokenObj[tokenInfo.symbol]){
                  allTokenObj[tokenInfo.symbol] = { ...tokenInfo, reserves: {[t.reserveAddr]: t.type}}
                } else {
                  allTokenObj[tokenInfo.symbol].reserves[t.reserveAddr] = t.type
                }
              })
              return callback(null, allTokenObj)
            }
          )
        }
      )
  
    })
  })
}

module.exports.fetchConfigTokens = (callback) => {
  try {
    fetchData({
      url: apisEndpint,
      method: "get"
    }).then(currencies => {
      const tokens = standardizeTokens(currencies)
      return callback(null, tokens)
    })
    .catch(err => callback(err));
  } catch (error) {
    return callback(error)
  }
  
}