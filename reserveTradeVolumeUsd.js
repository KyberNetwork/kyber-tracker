require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const ReserveTradeVolumeUsdCrawler = require('./app/crawlers/ReserveTradeVolumeUsdCrawler');
  const crawler = new ReserveTradeVolumeUsdCrawler();
  crawler.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
