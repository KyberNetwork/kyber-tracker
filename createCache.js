require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');
const schedule = require('node-schedule');
const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

const KyberCreateCache = require('./app/crawlers/KyberCreateCache');
const createCache = new KyberCreateCache();
var j = schedule.scheduleJob('*/10 * * * *', function(){
  createCache.start_chart_history_1h();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
