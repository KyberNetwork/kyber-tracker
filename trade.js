require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const KyberTradeCrawler = require('./app/crawlers/TradeCrawler');
  const crawler = new KyberTradeCrawler();
  crawler.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
