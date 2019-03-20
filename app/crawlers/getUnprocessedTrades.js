const _               = require('lodash');
const async           = require('async');
const network         = require('../../config/network');
const ExSession       = require('sota-core').load('common/ExSession');
const logger          = require('sota-core').getLogger('getLatestBlockNumber');

const LIMIT_TRADES_SIZE = parseInt(process.env.LIMIT_TRADES_SIZE || 1000);

module.exports = (callback, modelName = 'KyberTradeModel', startId) => {
  if(startId){
    logger.info(`Crawler start with custom trade Id ${startId}`);
  }
  
  const exSession = new ExSession();
  const adapter = exSession.getModel(modelName).getSlaveAdapter();
  const sql = `
    SELECT id, volume_eth, FROM_UNIXTIME(block_timestamp, "%d-%m-%Y") as date, block_timestamp FROM kyber_tracker.kyber_trade
    where volume_usd is null and volume_eth is not null 
    ORDER BY id DESC
    limit ${LIMIT_TRADES_SIZE}
  `

  adapter.execRaw(sql, [], (err, results) => {
    exSession.destroy();
    return callback(err, results)
  });
}
