/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const _ = require('lodash');
const async = require('async');
const util = require('util');
const BigNumber = require('bignumber.js');
const network = require('../../config/network');
const Const = require('../common/Const');
const helper = require('../common/Utils');
const Utils = require('sota-core').load('util/Utils');
const BaseService = require('sota-core').load('service/BaseService');
const LocalCache = require('sota-core').load('cache/foundation/LocalCache');
const logger = require('sota-core').getLogger('TestService');

module.exports = BaseService.extends({
  classname: 'TestService',

  testCustomQuery: function (callback) {
    const rawQuery = 'select \
      day_seq, \
      sum(`volume_eth`) as volume_eth, \
      sum(`volume_usd`) as volume_usd, \
      count(1) as trade_count, \
      count(distinct `taker_address`) as taker_count \
    from \
      kyber_trade \
    where \
      `taker_token_symbol` = ? OR `maker_token_symbol` = ? \
    group by \
      day_seq'

    const params = ['KNC', 'KNC'];

    // From any model, get adapter to connect database
    // Use master adapter for writing data, and slave for reading
    const adapter = this.getModel('KyberTradeModel').getSlaveAdapter();

    // Execute the raw query
    adapter.execRaw(rawQuery, params, callback);
  },

});
