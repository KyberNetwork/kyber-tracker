require('dotenv').config();
const _           = require('lodash');
const async       = require('async');
const path        = require('path');
const network     = require('../config/network');
const SotaCore    = require('sota-core');
const ExSession   = SotaCore.load('common/ExSession');
const Resolution  = require('../app/common/Resolution');
const logger      = SotaCore.getLogger();

const tokens = _.keyBy(_.values(network.tokens), 'symbol');

const app = SotaCore.createApp({
  rootDir: path.resolve('.')
});
app.start();

process.nextTick(execute);

function execute() {
  //logger.info(`Start update rate seqs...`);
  const exSession = new ExSession();
  const model = exSession.getModel('RateModel');

  async.waterfall([
    (next) => {
        model.find({
        where: 'block_timestamp > 0 AND day_seq = 0',
        limit: 10,
      }, next);
    },
    (records, next) => {
      if (!records || !records.length) {
        logger.info(`FINISHED! No more rows need to be updated.`);
        process.exit(0);
        return;
      }

      async.eachLimit(records, 10, (record, _next) => {
        tryUpdateOneRecord(record, _next);
      }, next);
    },
    (ret, next) => {
      if (typeof ret === 'function') {
        next = ret;
        ret = null;
      }

      exSession.commit(next);
    }
  ], (err, ret) => {
    exSession.destroy();

    if (err) {
      logger.error(`Something went wrong, process will be exited...`);
      logger.error(err);
      process.exit(1);
    }

    execute();
  });
}

function tryUpdateOneRecord (record, callback) {
  //const stamp = new Date(record.blockTimestamp * 1000).toString();
  //logger.info(`Try update record: ${record.blockNumber} : ${stamp}`);
    Resolution.addSeqs(record);
    record.save(callback);
}
