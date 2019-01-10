require('dotenv').config();
const _           = require('lodash');
const path        = require('path');
const SotaCore    = require('sota-core');
const logger      = require('sota-core').getLogger('TradeCrawler');
const network = require('./config/network')
const configFetcher = require('./app/crawlers/configFetcher')
const timer = 10000

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
      const processedTokens = processTokens(tokens)
      global.GLOBAL_TOKEN = {...network.tokens, ...processedTokens.tokensBySymbol}
    })  
  }, timer);
}

configFetcher.fetchConfigTokens((err, tokens) => {
  if(err) {
    return logger.error(err);
  }
  const processedTokens = processTokens(tokens)
  global.GLOBAL_TOKEN = {...network.tokens, ...processedTokens.tokensBySymbol}
  // console.log("_____________ token fetched_________", global.GLOBAL_TOKEN)
  intervalUpdateConfig()
  app.start();
})

module.exports = app;
module.exports.SotaCore = SotaCore;
