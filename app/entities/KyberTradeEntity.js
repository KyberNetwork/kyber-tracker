const _               = require('lodash');
const BaseEntity      = require('sota-core').load('entity/BaseEntity');
const BigNumber       = require('bignumber.js');
const network         = require('../../config/network');
const tokensBySymbol  = _.keyBy(_.values(network.tokens), 'symbol');
const tokensByAddress = _.keyBy(_.values(network.tokens), o => o.address.toLowerCase());

module.exports = BaseEntity.extends({
  classname: 'KyberTradeEntity',

  _recalculate: function () {
    this.makerTokenAddress = this.makerTokenAddress.toLowerCase();
    this.takerTokenAddress = this.takerTokenAddress.toLowerCase();
    const makerToken = tokensByAddress[this.makerTokenAddress];
    const takerToken = tokensByAddress[this.takerTokenAddress];

    this.makerTokenSymbol = makerToken.symbol;
    this.takerTokenSymbol = takerToken.symbol;

    const makerAmount = (new BigNumber(this.makerTokenAmount)).div(Math.pow(10, makerToken.decimal)).toPrecision(6);
    const takerAmount = (new BigNumber(this.takerTokenAmount)).div(Math.pow(10, takerToken.decimal)).toPrecision(6);

    if (!this.makerPriceBtc) this.makerPriceBtc = 0;
    if (!this.makerPriceEth) this.makerPriceEth = 0;
    if (!this.makerPriceUsd) this.makerPriceUsd = 0;
    if (!this.takerPriceBtc) this.takerPriceBtc = 0;
    if (!this.takerPriceEth) this.takerPriceEth = 0;
    if (!this.takerPriceUsd) this.takerPriceUsd = 0;
    if (!this.gasLimit) this.gasLimit = 0;
    if (!this.gasPrice) this.gasPrice = 0;
    if (!this.gasUsed) this.gasUsed = 0;

    this.makerTotalBtc = makerAmount * this.makerPriceBtc;
    this.makerTotalEth = makerAmount * this.makerPriceEth;
    this.makerTotalUsd = makerAmount * this.makerPriceUsd;

    this.takerTotalBtc = takerAmount * this.takerPriceBtc;
    this.takerTotalEth = takerAmount * this.takerPriceEth;
    this.takerTotalUsd = takerAmount * this.takerPriceUsd;

    if (this.makerTokenSymbol === "ETH") {
      this.volumeEth = makerAmount;
      this.volumeUsd = this.makerTotalUsd || this.takerTotalUsd;
    } else if (this.takerTokenSymbol === "ETH") {
      this.volumeEth = takerAmount;
      this.volumeUsd = this.takerTotalUsd || this.makerTotalUsd;
    } else {
      this.volumeEth = this.makerTotalEth || this.takerTotalEth;
      this.volumeUsd = this.makerTotalUsd || this.takerTotalUsd;
    }

    this.minuteSeq = Math.floor(this.blockTimestamp / 60);
    this.hourSeq = Math.floor(this.blockTimestamp / 3600);
    this.daySeq = Math.floor(this.blockTimestamp / 86400);

    return this;
  },

  save: function ($super, callback) {
    this._recalculate();
    $super(callback);
  },

});
