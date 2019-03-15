require('dotenv').config();
const _           = require('lodash');
const path = require('path');
const SotaCore = require('sota-core');
const network = require('./config/network')
const schedule = require('node-schedule');
const configFetcher = require('./app/crawlers/configFetcher')
const logger = require('sota-core').getLogger('TradeService');
const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

const timer = 5 * 60 * 1000

const Jobs = require('./config/cache/lists');

let tokenConfig = _.transform(network.tokens, (result, v, k) => {result[v.address.toLowerCase()] = {...v, official: true, address: v.address.toLowerCase()}})

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
  intervalUpdateConfig()


  Object.keys(Jobs).map((index) => {
    var job = Jobs[index];
    logger.info("schedule job start")
    schedule.scheduleJob(job.when, () => {
      const jobClass = require(`./app/jobs/${job.run}`)
      const create_job = new jobClass();
      create_job.start(job);
    });
  });

})
module.exports = app;
module.exports.SotaCore = SotaCore;
