const _               = require('lodash');
const BaseEntity      = require('sota-core').load('entity/BaseEntity');
const BigNumber       = require('bignumber.js');
const network         = require('../../config/network');
const Utils           = require('../common/Utils');
const logger          = require('sota-core').getLogger('TradeCrawler');

module.exports = BaseEntity.extends({
  classname: 'KyberTradeEntity',

  _recalculate: function () {

    if (!this.burnFees) this.burnFees = 0;
    if (!this.commission) this.commission = 0;
    this.collectedFees = ((new BigNumber(this.burnFees)).plus(new BigNumber(this.commission))).toString();

    this.minuteSeq = Math.floor(this.blockTimestamp / 60);
    this.hourSeq = Math.floor(this.blockTimestamp / 3600);
    this.daySeq = Math.floor(this.blockTimestamp / 86400);

    const dt = new Date(this.blockTimestamp * 1000);
    this.year = dt.getUTCFullYear();
    this.month = this.year + ('0' + (dt.getUTCMonth() + 1)).substr(-2);

    return this;
  },

  save: function ($super, callback) {
    this._recalculate();
    $super(callback);
  },

});
