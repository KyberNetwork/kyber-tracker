const _               = require('lodash');
const async           = require('async');
// const network         = require('../../config/network');
const Utils           = require('../common/Utils');
const ExSession       = require('sota-core').load('common/ExSession');
const logger          = require('sota-core').getLogger('getBurnedFeeFromTransaction');
const request         = require('superagent');
const BigNumber       = require('bignumber.js');
const Twitter         = require('twitter-lite');

const web3            = Utils.getWeb3Instance();
const abiDecoder      = Utils.getKyberABIDecoder();
const PRE_BURN = 48.61873337
const twitClient = new Twitter({
  subdomain: "api",
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

module.exports = (block, tx, callback) => {
  async.auto({
    receipt: (next) => {
      web3.eth.getTransactionReceipt(tx.hash, next);
    },
  }, (err, ret) => {
    if (err) {
      return callback(err);
    }

    const record = {};
    const receipt = ret.receipt;

    if (!tx || !receipt) {
      return callback(`Something went wrong. Cannot get transaction information.`);
    }

    const inputData = abiDecoder.decodeMethod(tx.input);
    if (!inputData || (inputData.name !== 'burnReserveFees' && inputData.name !== 'burnKnc')) {
      logger.info(`Transaction is not burnReserveFees or burnKnc transaction: ${tx.hash}`);
      return callback(null, null);
    }

    if (!web3.utils.hexToNumber(receipt.status)) {
      logger.info(`Transaction receipt is failed: ${tx.hash}`);
      return callback(null, null);
    }

    record.tx = tx.hash;
    record.blockNumber = tx.blockNumber;
    record.blockHash = tx.blockHash;
    
    record.blockTimestamp = block.timestamp;
    record.minuteSeq = Math.floor(record.blockTimestamp / 60);
    record.hourSeq = Math.floor(record.blockTimestamp / 3600);
    record.daySeq = Math.floor(record.blockTimestamp / 86400);

    const dt = new Date(record.blockTimestamp * 1000);
    record.year = dt.getUTCFullYear();
    record.month = record.year + ('0' + (dt.getUTCMonth() + 1)).substr(-2);

    record.burnerAddress = tx.from;
    record.burnerContract = tx.to;

    if(inputData.name == 'burnReserveFees'){
      record.reserveContract = _.find(inputData.params, (param) => param.name === 'reserve').value;
    }
    
    _.forEach(receipt.logs, (log) => {
      if (log.address.toLowerCase() === Utils.getKNCTokenAddress() &&
          log.topics[0].toLowerCase() === Utils.getERC20TransferTopicHash()) {
        const senderAddr = web3.eth.abi.decodeParameter('address', log.topics[1]);
        const receiverAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
        const amount = web3.eth.abi.decodeParameter('uint256', log.data);

        if (receiverAddr.toLowerCase() === tx.to.toLowerCase()) {
          if(inputData.name == 'burnReserveFees'){
            record.reserveWallet = senderAddr;
          } 
          record.amount = amount;
        }
      }

    });

    return insertRecord(record, callback);
  });
}

function insertRecord(data, callback) {
  const exSession = new ExSession();
  const BurnedFeeModel = exSession.getModel('BurnedFeeModel');

  async.auto({
    existed: (next) => {
      BurnedFeeModel.findOne({
        where: 'tx = ?',
        params: [data.tx]
      }, next);
    },
    insert: ['existed', (ret, next) => {
      if (ret.existed) {
        logger.info(`Transaction was processed already: ${data.tx}`);
        return next(null, null);
      }

      BurnedFeeModel.add(data, (err) => {
        return next(err, data)
      });
    }],
    commit: ['insert', (ret, next) => {
      exSession.commit(next);
    }],
    notify : ['commit', (ret, next) => {
      if (ret.existed) {
        return next(null)
      }
      if(!ret.insert){
        return next(null)
      }

      const mins = Math.floor((Date.now() / 1000 - ret.insert.blockTimestamp) / 60);
      if (mins > 30) return next(null);

      const amount = new BigNumber(ret.insert.amount).div(Math.pow(10, 18));
      if (amount.lt(100)) return next(null)
      
      let notifyGroups = (process.env.NOTIFY_GROUPS || "").split(";");
      if (!notifyGroups || !notifyGroups.length) return next(null);

      const link = `https://etherscan.io/tx/${ret.insert.tx}`;
      const text = encodeURIComponent(`${amount.toFormat(1)} KNC was burnt just ${mins} minutes ago ${link}`);

      const botToken = process.env.TRACKER_BOT_TOKEN;
      const sanityLog = (e) => {
        return JSON.stringify(e).replace(botToken, "TRACKER_BOT_TOKEN");
      };
      notifyGroups.forEach((group) => {
        if (!group) return;
        try {
          const uri = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${group}&text=${text}`;
          request
            .get(uri)
            .end((err, response) => {
              if (err) {
                logger.error(sanityLog(err));
                return;
              }
              logger.info(text);
            });
        } catch (e) {
          logger.error(sanityLog(e));
        }
      });

      BurnedFeeModel.sum('amount', {
        where: '1',
        params: []
      }, (err, totalBurn) => {
        if(err){
          logger.info(err);
        }

        const bigTotal = new BigNumber(totalBurn.toString()).div(Math.pow(10, 18))
        const bigPreburn = new BigNumber(PRE_BURN)
        const rawText = `${amount.toFormat(1)} KNC was burnt just ${mins} minutes ago.\nTotal burn: ${bigTotal.plus(bigPreburn).toFormat(1)} KNC ${link}`
        twitClient.post('statuses/update', {status: rawText})
        .then(results => {
          return;
        })
        .catch(e => {
          console.log("twitter error: ", e)
          return;
        })
      }); 

      return next(null)
    }]
  }, (err, ret) => {
    exSession.destroy();

    if (err) {
      logger.error(err);
      return callback(err);
    }

    callback(null, null);
  });
}
