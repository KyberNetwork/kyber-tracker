require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const KyberCreateCache = require('./app/crawlers/KyberCreateCache');
  const createCache = new KyberCreateCache();
  createCache.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
