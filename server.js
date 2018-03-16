require('dotenv').config();
const path        = require('path');
const SotaCore    = require('sota-core');

const app = SotaCore.createServer({
  rootDir: path.resolve('.'),
  useSocket: false,
});
app.start();

module.exports = app;
module.exports.SotaCore = SotaCore;
