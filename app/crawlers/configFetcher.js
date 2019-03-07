require('dotenv').config();
const axios = require('axios');
const network = require('../../config/network');
const async     = require('async');
const _         = require('lodash');
const apisEndpint = network.endpoints.apis + "/currencies?only_official_reserve=false"

const getAllReserve                     = require('./leveldbCache').getAllReserve;
const getReserveType                    = require('./leveldbCache').getReserveType;

const getReserveTokensList              = require('./leveldbCache').getReserveTokensList;
const getPermissionlessTokensList       = require('./leveldbCache').getPermissionlessTokensList;

const getTokenInfo         = require('./leveldbCache').getTokenInfo;
const getTokenReserve      = require('./leveldbCache').getTokenReserve;

const ethConfig = network.ETH

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
    returnConfig[t.address.toLowerCase()] = {
      // ...network.tokens[t.symbol],
      name: t.name,
      address: t.address.toLowerCase(),
      symbol: t.symbol,
      decimal: t.decimals,
      cmcIdv2: t.cmc_id,
      cgId: t.cg_id,
      reservesSrc: t.reserves_src || [],
      reservesDest: t.reserves_dest || [],
      // delisted: true
      hidden: t.listing_time,
      ...((t.reserves_src || t.reserves_dest) && {reservesAddr: [...(t.reserves_src || []), ...(t.reserves_dest || [])]})
    }
  })
  return returnConfig
}

const standardizeReserveTokenType = (tokens) => {
  const returnConfig = {}
  Object.values(tokens).map(t => {
    const reserveObj = {}
    t.address = t.address.toLowerCase()
    if(t.reservesAddr){
      t.reservesAddr.map(r => {
        if(global.NETWORK_RESERVES[r.toLowerCase()] == '1') {
          reserveObj[r.toLowerCase()] = '1'
          t.type = '1'
        }
        else reserveObj[r.toLowerCase()] = '2'
      })
    }
    
    returnConfig[t.address.toLowerCase()] = {
      ...t,
      reserves: reserveObj
    }
    delete returnConfig[t.address.toLowerCase()].reservesAddr
  })

  // console.log("+++++++++++++++++++++ config", returnConfig)
  return returnConfig
}

const fetchReserveListFromNetwork = (callback) => {
  getAllReserve((err, arrayReserve) => {
    if(err){
      console.log(err)
      return callback(err)
    }
    async.parallelLimit(arrayReserve.map(r => (asyncCallback) =>  getReserveType(r, asyncCallback)) , 10,
    (err, arrayTypeOfReserve) => {  
      if(err) return callback(err)

      const reserveType = {}
      arrayReserve.map((r, i) => {
        reserveType[r.toLowerCase()] = arrayTypeOfReserve[i]
      })
      global.NETWORK_RESERVES = reserveType
      return callback(null)
    })
  })
}

const getTokensFromApis = callback => {
  try {
    fetchData({
      url: apisEndpint,
      method: "get"
    }).then(currencies => {
      const tokens = standardizeTokens(currencies)

      fetchReserveListFromNetwork((err) => {
        if(err) return callback(err)
        return callback(null, standardizeReserveTokenType(tokens))
      })
    })
    .catch(err => callback(err));
  } catch (error) {
    return callback(error)
  }
}

const getTokensFromNetwork = callback => {
  // getAllReserve((err, arrayReserve) => {
  //   if(err){
  //     console.log(err)
  //     return callback(err)
  //   }

  //   async.parallelLimit(arrayReserve.map(r => (asyncCallback) =>  getReserveType(r, asyncCallback)) , 10,
  //   (err, arrayTypeOfReserve) => {  
  //     // [ '2', '2', '1' ]
  //     async.parallelLimit(
  //       arrayTypeOfReserve.map((t, i) => (next) => {
  //         if(t == '1'){
  //           // none
  //           getReserveTokensList(arrayReserve[i], (err, arrayTokens) => next(err, arrayTokens &&
  //             arrayTokens.map(t => ({
  //               reserveAddr: arrayReserve[i],
  //               type: '1',
  //               tokenAddr: t
  //             }))
  //           ))
  //         }
  //         if(t == '2'){
  //           // permissionless
  //           getPermissionlessTokensList(arrayReserve[i], (err, arrayTokens) => next(err, arrayTokens &&
  //             arrayTokens.map(t => ({
  //               reserveAddr: arrayReserve[i],
  //               type: '2',
  //               tokenAddr: t
  //             }))
  //           ))
  //         }
  //       }), 10, (err, tokensAddr) => {
          
  //         if(err){
  //           console.log(err)
  //           return callback(err)
  //         }
  //         const allTokens = _.flatten(tokensAddr)
  //         async.parallel(
  //           allTokens.map(t => {
  //             return (next) => {
  //               // console.log("_________________", t.tokenAddr, t.type)
  //               getTokenInfo(t.tokenAddr, t.type, (err, info) => {
  //                 return next(err, {...t, info})
  //               });
  //             }
  //           }),
  //           (err, allTokenWithInfo) => {
  //             if(err) return callback(err)
  //             ////////////// 
  //             const allTokenObj = {[ethConfig.address.toLowerCase()]: ethConfig}
              
  //             allTokenWithInfo.map(t => {
  //               const tokenInfo = t.info
  //               tokenInfo.address = tokenInfo.address.toLowerCase()
  //               if(! allTokenObj[tokenInfo.address]){
  //                 allTokenObj[tokenInfo.address] = { ...tokenInfo, reserves: {[t.reserveAddr.toLowerCase()]: t.type}}
  //               } else {
  //                 allTokenObj[tokenInfo.address].reserves[t.reserveAddr.toLowerCase()] = t.type
  //               }
  //             })

  //             return callback(null, allTokenObj)
  //           }
  //         )
  //       }
  //     )
  
  //   })
  // })


  fetchReserveListFromNetwork((err) => {
    if(err) return callback(err)
    // return callback(null, standardizeReserveTokenType(tokens))

    async.parallelLimit(Object.keys(global.NETWORK_RESERVES).map(r => {
      return (next) => {
        if(global.NETWORK_RESERVES[r] == '1'){
          // console.log("-------------- get token for reserve 1", r)
          getReserveTokensList(r, (err, arrayTokens) => next(err, arrayTokens &&
            arrayTokens.map(t => ({
              reserveAddr: r,
              type: '1',
              tokenAddr: t
            }))
          ))
        } else {
          // console.log("-------------- get token for reserve 2", r)
          getPermissionlessTokensList(r, (err, arrayTokens) => next(err, arrayTokens &&
            arrayTokens.map(t => ({
              reserveAddr: r,
              type: '2',
              tokenAddr: t
            }))
          ))
        }
      }
    }), 5, (err, tokensAddr) => {
      if(err){
        console.log(err)
        return callback(err)
      }
      const allTokens = _.flatten(tokensAddr)
      async.parallel(
        allTokens.map(t => {
          return (next) => {
            // console.log("_________________", t.tokenAddr, t.type)
            getTokenInfo(t.tokenAddr, t.type, (err, info) => {
              return next(err, {...t, info})
            });
          }
        }),
        (err, allTokenWithInfo) => {
          if(err) return callback(err)
          ////////////// 
          const allTokenObj = {[ethConfig.address.toLowerCase()]: ethConfig}
          
          allTokenWithInfo.map(t => {
            const tokenInfo = t.info
            tokenInfo.address = tokenInfo.address.toLowerCase()
            if(! allTokenObj[tokenInfo.address]){
              allTokenObj[tokenInfo.address] = { ...tokenInfo, reserves: {[t.reserveAddr.toLowerCase()]: t.type}}
            } else {
              allTokenObj[tokenInfo.address].reserves[t.reserveAddr.toLowerCase()] = t.type
            }
          })

          return callback(null, allTokenObj)
        }
      )
    })
  })


  

}

module.exports.fetchConfigTokens = (callback) => {
  // return getTokensFromNetwork(callback)
  return getTokensFromApis(callback)
}

module.exports.fetchReserveListFromNetwork = fetchReserveListFromNetwork
module.exports.standardizeReserveTokenType = standardizeReserveTokenType

module.exports.fetchTokenAndItsReserve = (tokenAddress, blockNo, callback) => {
  async.parallel({
    info: (_next) => getTokenInfo(tokenAddress, '2', _next),
    sourceReserve: (_next) => getTokenReserve(tokenAddress, 'source', blockNo, _next),
    destReserve: (_next) => getTokenReserve(tokenAddress, 'dest', blockNo, _next)
  })
  
}