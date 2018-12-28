require('dotenv').config();
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

const intervalUpdateConfig = () => {
  setInterval(() => {
    configFetcher.fetchConfigTokens((err, tokens) => {
      // console.log("_____________ token fetched", tokens)
      if(err) {
        return logger.error(err);
      }
      global.GLOBAL_TOKEN = {...network.tokens, ...tokens}
    })  
  }, timer);
}

configFetcher.fetchConfigTokens((err, tokens) => {
  if(err) {
    return logger.error(err);
  }
  global.GLOBAL_TOKEN = {...network.tokens, ...tokens}
  // console.log("_____________ token fetched_________", global.GLOBAL_TOKEN)
  intervalUpdateConfig()
  app.start();
})

module.exports = app;
module.exports.SotaCore = SotaCore;
