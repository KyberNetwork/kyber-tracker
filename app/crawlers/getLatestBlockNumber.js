const _               = require('lodash');
const async           = require('async');
const network         = require('../../config/network');
const ExSession       = require('sota-core').load('common/ExSession');
const logger          = require('sota-core').getLogger('getLatestBlockNumber');

module.exports = (callback) => {
  const exSession = new ExSession();
  const KyberTradeModel = exSession.getModel('KyberTradeModel');

  KyberTradeModel.findOne({
    orderBy: 'block_number DESC'
  }, (err, ret) => {
    exSession.destroy();
    if (err) {
      return callback(err);
    }

    if(process.env.BLOCK_START){
      logger.info(`Crawler start with custom blocknumber: ${process.env.BLOCK_START}`);
      return callback(null, +process.env.BLOCK_START)
    }

    if (!ret) {
      return callback(null, network.startBlockNumber);
    }

    return callback(null, ret.blockNumber);
  });
}
