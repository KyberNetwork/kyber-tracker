require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(() => {
  const KyberVolumeCalculator = require('../app/helpers/KyberVolumeCalculator');
  const calculator = new KyberVolumeCalculator();
  calculator.start();
});

module.exports = app;
module.exports.SotaCore = SotaCore;
