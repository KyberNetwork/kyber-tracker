require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createServer({
  rootDir: path.resolve('.')
});
app.start();

module.exports = app;
module.exports.SotaCore = SotaCore;
