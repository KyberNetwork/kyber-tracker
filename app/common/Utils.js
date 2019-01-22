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
const ethConfig = network.ETH
// const tokens = network.tokens;
const contractAddresses = network.contractAddresses;

module.exports = {

  getKyberABIDecoder: function() {
    return abiDecoder;
  },

  getWeb3Instance: function() {
    return getWeb3Instance();
  },

  getTokenFromAddress: function(address) {
    return global.TOKENS_BY_ADDR[address.toLowerCase()] || null;
  },

  shouldShowToken: function(tokenAddress, tokenList, timeStamp) {
    tokenList = tokenList || global.TOKENS_BY_ADDR;

    if(!tokenList[tokenAddress.toLowerCase()] || !tokenList[tokenAddress.toLowerCase()].hidden) return true;
    
    if (typeof tokenList[tokenAddress].hidden != 'number') return false;
    return (timeStamp || Date.now()) >= tokenList[tokenAddress].hidden;
  },

  filterOfficial(official, tokenData){
    if(!official) return true

    if(tokenData.official) return true

    if(tokenData && tokenData.reserves && Object.values(tokenData.reserves).indexOf('1') >= 0) return true
    return false
  },

  getStringExp10: function(decimal) {
    return '1' + '0'.repeat(decimal);
  },

  getERC20TransferTopicHash: function () {
    return network.logTopics.erc20Transfer;
  },

  getKNCTokenAddress: function() {
    return network.KNC.address;
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
    Object.keys(global.TOKENS_BY_ADDR).forEach(address => {
      if (this.shouldShowToken(address.toLowerCase()) && address.toLowerCase() !== network.ETH.address ) {
        supportedAddressArray.push(address);
        supportedTokens.push(global.TOKENS_BY_ADDR[address]);
      }
    })

    const ethArray = Array(supportedAddressArray.length).fill(network.ETH.address);

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
  isNewToken (tokenAddress) {
      var bornMs = global.TOKENS_BY_ADDR[tokenAddress].hidden;
      if (typeof bornMs != 'number') return false;
      return Date.now() <= bornMs + (network.newTokenDuration || 3 * 24 * 60 * 60 * 1000);
  },
  isDelisted (tokenAddress) {
    let delisted = global.TOKENS_BY_ADDR[tokenAddress].delisted;
    if (typeof bornMs !== 'undefined') return false;
    return delisted;
  },

  ignoreToken: (arraySymbol) => {
    let queryString = ''
    if(!arraySymbol) return queryString
    let arrayAddress = []
    arraySymbol.map(s => {
      if(network.tokens[s]) arrayAddress.push(network.tokens[s].address)
    })
    
    queryString = arrayAddress
    .map(s => `!(maker_token_address = "${ethConfig.address}" AND taker_token_address = "${s}") AND !(maker_token_address = "${s}" AND taker_token_address = "${ethConfig.address}") `)
    .join(' AND ')

    return ` AND (${queryString})`
  }
};
