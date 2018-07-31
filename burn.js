require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const KyberBurnCrawler = require('./app/crawlers/KyberBurnCrawler');
  const crawler = new KyberBurnCrawler();
  crawler.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
