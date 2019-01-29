require('dotenv').config();
const _           = require('lodash');
const path        = require('path');
const SotaCore    = require('sota-core');
const logger      = require('sota-core').getLogger('TradeCrawler');
const network = require('./config/network')
const configFetcher = require('./app/crawlers/configFetcher')
const timer = 5 * 60 * 1000

let tokenConfig = _.transform(network.tokens, (result, v, k) => {result[v.address.toLowerCase()] = {...v, official: true, address: v.address.toLowerCase()}})

const app = SotaCore.createServer({
  rootDir: path.resolve('.'),
  useSocket: false,
});

const processTokens = (tokens) => {
  const allTokens = _.merge(tokens, tokenConfig)
  return {
    tokensByAddress: _.keyBy(allTokens, 'address'),
    tokensBySymbol: _.keyBy(allTokens, 'symbol')
  }
}

const intervalUpdateConfig = () => {
  setInterval(() => {
    configFetcher.fetchConfigTokens((err, tokens) => {
      // console.log("_____________ token fetched", tokens)
      if(err) {
        return logger.error(err);
      }

      const processedTokens = processTokens(tokens)
      global.TOKENS_BY_ADDR = processedTokens.tokensByAddress
    })  
  }, timer);
}

configFetcher.fetchConfigTokens((err, tokens) => {
  if(err) {
    return logger.error(err);
  }

  const processedTokens = processTokens(tokens)
  global.TOKENS_BY_ADDR = processedTokens.tokensByAddress
  // console.log('________________', global.TOKENS_BY_ADDR)
  intervalUpdateConfig()
  app.start();
})

module.exports = app;
module.exports.SotaCore = SotaCore;
