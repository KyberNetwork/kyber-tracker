require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const ReserveInfoCrawler = require('./app/crawlers/TokenInfoCrawler');
  const crawler = new ReserveInfoCrawler();
  crawler.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
