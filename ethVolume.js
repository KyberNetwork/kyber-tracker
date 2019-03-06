require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const EthVolumeCrawler = require('./app/crawlers/NewEthVolumeCrawler');
  const crawler = new EthVolumeCrawler();
  crawler.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;