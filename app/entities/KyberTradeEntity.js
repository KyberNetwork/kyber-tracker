const _               = require('lodash');
const BaseEntity      = require('sota-core').load('entity/BaseEntity');
const BigNumber       = require('bignumber.js');
const network         = require('../../config/network');
const Utils           = require('../common/Utils');


module.exports = BaseEntity.extends({
  classname: 'KyberTradeEntity',

  _recalculate: function () {

    if(this.sourceReserve) {
      this.sourceReserve = this.sourceReserve.toLowerCase()
    }
    if(this.destReserve) {
      this.destReserve = this.destReserve.toLowerCase()
    }


    if(this.makerTokenAddress) {
      this.makerTokenAddress = this.makerTokenAddress.toLowerCase()
      const makerTokenInfo = global.TOKENS_BY_ADDR[this.makerTokenAddress]
      this.makerTokenSymbol = global.TOKENS_BY_ADDR[this.makerTokenAddress].symbol
      this.makerTokenDecimal = global.TOKENS_BY_ADDR[this.makerTokenAddress].decimal
      
    }
    if(this.takerTokenAddress) {
      this.takerTokenAddress = this.takerTokenAddress.toLowerCase()
      const takerTokenInfo = global.TOKENS_BY_ADDR[this.takerTokenAddress]
      this.takerTokenSymbol = global.TOKENS_BY_ADDR[this.takerTokenAddress].symbol
      this.takerTokenDecimal = global.TOKENS_BY_ADDR[this.takerTokenAddress].decimal 
    } 



    const ethAddress = network.ETH.address.toLowerCase();
    if (this.takerTokenAddress.toLowerCase() === ethAddress) {
      this.volumeEth = Utils.fromWei(this.takerTokenAmount);
      this.sourceOfficial = 1
    } else {

      this.sourceOfficial = 0
      if(global.TOKENS_BY_ADDR && global.TOKENS_BY_ADDR[this.takerTokenAddress.toLowerCase()] && this.sourceReserve){
        const tokenInfo = global.TOKENS_BY_ADDR[this.takerTokenAddress.toLowerCase()]
        if(tokenInfo && tokenInfo.reserves && tokenInfo.reserves[this.sourceReserve] == '1'){
          this.sourceOfficial = 1
        }
      } 

    }

    if (this.makerTokenAddress.toLowerCase() === ethAddress) {
      this.volumeEth = Utils.fromWei(this.makerTokenAmount);
      this.destOfficial = 1
    } else {
      this.destOfficial = 0
      if(global.TOKENS_BY_ADDR && global.TOKENS_BY_ADDR[this.makerTokenAddress.toLowerCase()] && this.sourceReserve){
        const tokenInfo = global.TOKENS_BY_ADDR[this.makerTokenAddress.toLowerCase()]
        if(tokenInfo && tokenInfo.reserves && tokenInfo.reserves[this.destReserve] == '1'){
          this.destOfficial = 1
        }
      }

    }



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
