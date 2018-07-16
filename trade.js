require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const KyberTradeCrawler2 = require('./app/crawlers/KyberTradeCrawler2');
  const crawler = new KyberTradeCrawler2();
  crawler.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
