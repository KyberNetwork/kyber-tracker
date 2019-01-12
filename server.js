require('dotenv').config();
const _           = require('lodash');
const path        = require('path');
const SotaCore    = require('sota-core');
const logger      = require('sota-core').getLogger('TradeCrawler');
const network = require('./config/network')
const configFetcher = require('./app/crawlers/configFetcher')
const timer = 5 * 60 * 1000

let tokenConfig = _.transform(network.tokens, (result, v, k) => {result[v.address.toLowerCase()] = v})

const app = SotaCore.createServer({
  rootDir: path.resolve('.'),
  useSocket: false,
});

const processTokens = (tokens) => ({
  tokensByAddress: _.keyBy(tokens, 'address'),
  tokensBySymbol: _.keyBy(tokens, 'symbol')
})

const intervalUpdateConfig = () => {
  setInterval(() => {
    configFetcher.fetchConfigTokens((err, tokens) => {
      // console.log("_____________ token fetched", tokens)
      if(err) {
        return logger.error(err);
      }
      tokenConfig = {...tokenConfig, ...tokens}

      const processedTokens = processTokens(tokenConfig)
      global.GLOBAL_TOKEN = processedTokens.tokensBySymbol
    })  
  }, timer);
}

configFetcher.fetchConfigTokens((err, tokens) => {
  if(err) {
    return logger.error(err);
  }
  tokenConfig = {...tokenConfig, ...tokens}

  const processedTokens = processTokens(tokenConfig)
  global.GLOBAL_TOKEN = processedTokens.tokensBySymbol
  
  intervalUpdateConfig()
  app.start();
})

module.exports = app;
module.exports.SotaCore = SotaCore;
