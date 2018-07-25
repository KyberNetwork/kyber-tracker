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
    return (Date.now() >= tokens[tokenSymbol].hidden);
  },

  getStringExp10: function(decimal) {
    return '1' + '0'.repeat(decimal);
  },

  getERC20TransferTopicHash: function () {
    return network.logTopics.erc20Transfer;
  },

  getKNCTokenAddress: function() {
    return network.tokens.KNC.address;
  },

  isBurnerContractAddress: function (addr) {
    if (!addr) {
      return false;
    }
    return this.containNoCase(contractAddresses.feeBurners, addr);
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
  },

  cors: function(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,HEAD,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  },

  fromWei: function(value, decimals) {
    return (new BigNumber(value).div(Math.pow(10, decimals || 18))).toNumber();
  },

  equalNocase: function(text1, text2) {
    if (text1 === text2) return true;
    if (!text1 || !text2) return false;

    return text1.toLowerCase() === text2.toLowerCase();
  },

  containNoCase: function(array, text) {
    for(let i = 0; i < array.length; i++) {
      if (this.equalNocase(array[i], text)) {
        return true;
      }
    }

    return false;
  },

  isNewToken (tokenSymbol) {
      var bornMs = tokens[tokenSymbol].hidden;
      if (typeof bornMs != 'number') return false;
      return Date.now() <= bornMs + 24 * 60 * 60 * 1000;
  }

};
