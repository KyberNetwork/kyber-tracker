require('dotenv').config();
const axios = require('axios');
const network = require('../../config/network');
const apisEndpint = process.env['APIS_ENDPOINT'] + "/internal/currencies"

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