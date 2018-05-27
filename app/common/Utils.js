const _ = require('lodash');

const abiDecoder = require('abi-decoder');
const BigNumber = require('bignumber.js');
const getWeb3Instance = require('./getWeb3Instance');
const kyberABI = require('../../config/abi/kyber');
const burnedFeeABI = require('../../config/abi/burned_fee');
const wrapperABI = require('../../config/abi/wrapper');
abiDecoder.addABI(kyberABI);
abiDecoder.addABI(burnedFeeABI);
abiDecoder.addABI(wrapperABI);

const network = require('../../config/network');
const tokens = network.tokens;
const contractAddresses = network.contractAddresses;
const tokensByAddress = _.keyBy(_.values(tokens), o => o.address.toLowerCase());

module.exports = {

  getKyberABIDecoder: function() {
    return abiDecoder;
  },

  getWeb3Instance: function() {
    return getWeb3Instance();
  },

  getTokenFromAddress: function(address) {
    return tokensByAddress[address.toLowerCase()] || null;
  },

  shouldShowToken: function(tokenSymbol) {
    // return !this.tokens[item.symbol].hidden;
    if(!tokens[tokenSymbol].hidden) return true;
    if (typeof tokens[tokenSymbol].hidden != 'number') return false;
    return new Date().getTime() - tokens[tokenSymbol].hidden > 0 ;
  },

  getStringExp10: function(decimal) {
    return '1' + '0'.repeat(decimal);
  },

  getExchangeTopicHash: function() {
    return network.logTopics.exchange;
  },

  getFeeToWalletTopicHash: function() {
    return network.logTopics.feeToWallet;
  },

  getBurnFeesTopicHash: function() {
    return network.logTopics.burnFee;
  },

  getERC20TransferTopicHash: function () {
    return network.logTopics.erc20Transfer;
  },

  getKyberNetworkContractAddress: function() {
    return network.contractAddresses.network;
  },

  getKNCTokenAddress: function() {
    return network.tokens.KNC.address;
  },

  isBurnerContractAddress: function (addr) {
    if (!addr) {
      return false;
    }

    addr = addr.toLowerCase();

    return addr === contractAddresses.feeBurner1 || addr === contractAddresses.feeBurner2;
  },
  sumBig(arrayParams, initState) {
    return arrayParams.reduce((a, b) => {
      let bigA = a ? new BigNumber(a.toString()) : new BigNumber(0)
      let bigB = b ? new BigNumber(b.toString()) : new BigNumber(0)
      return bigA.plus(bigB)
    }, new BigNumber(initState))
    .toString()
  },

  getRateTokenArray: function() {
    let supportedTokens = [];
    let supportedAddressArray = []
    Object.keys(tokens).forEach(symbol => {
      if (this.shouldShowToken(symbol) && symbol !== "ETH") {
        supportedAddressArray.push(tokens[symbol].address);
        supportedTokens.push(tokens[symbol]);
      }
    })

    const ethArray = Array(supportedAddressArray.length).fill(tokens.ETH.address);

    const srcArray = supportedAddressArray.concat(ethArray);
    const destArray = ethArray.concat(supportedAddressArray);
    const qtyArray = Array(srcArray.length).fill("0x0");

    return {
      supportedTokens: supportedTokens,
      supportedAddressArray: supportedAddressArray,
      srcArray: srcArray,
      destArray: destArray,
      qtyArray: qtyArray
    }
  }

};
