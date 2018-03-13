const _             = require('lodash');
const BaseEntity    = require('sota-core').load('entity/BaseEntity');
const BigNumber     = require('bignumber.js');
const network       = require('../../config/network');
const tokens        = _.keyBy(_.values(network.tokens), 'symbol');

module.exports = BaseEntity.extends({
  classname: 'KyberTradeEntity',

  _recalculate: function () {
    const makerToken = tokens[this.makerTokenSymbol];
    const takerToken = tokens[this.takerTokenSymbol];

    const makerAmount = (new BigNumber(this.makerTokenAmount)).div(Math.pow(10, makerToken.decimal)).toPrecision(6);
    const takerAmount = (new BigNumber(this.takerTokenAmount)).div(Math.pow(10, takerToken.decimal)).toPrecision(6);

    this.makerTotalBtc = makerAmount * this.makerPriceBtc;
    this.makerTotalEth = makerAmount * this.makerPriceEth;
    this.makerTotalUsd = makerAmount * this.makerPriceUsd;

    this.takerTotalBtc = takerAmount * this.takerPriceBtc;
    this.takerTotalEth = takerAmount * this.takerPriceEth;
    this.takerTotalUsd = takerAmount * this.takerPriceUsd;

    return this;
  },

  save: function ($super, callback) {
    this._recalculate();
    $super(callback);
  },

});
