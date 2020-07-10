const _ = require('lodash');

const abiDecoder = require('abi-decoder');
const BigNumber = require('bignumber.js');
const getWeb3Instance = require('./getWeb3Instance');
const kyberABI = require('../../config/abi/kyber');
const burnedFeeABI = require('../../config/abi/burned_fee');
const wrapperABI = require('../../config/abi/wrapper');
const katalystFeeHandleABI = require('../../config/abi/katalyst_fee_handle')
abiDecoder.addABI(kyberABI);
abiDecoder.addABI(burnedFeeABI);
abiDecoder.addABI(wrapperABI);
abiDecoder.addABI(katalystFeeHandleABI);

const network = require('../../config/network');
const ethConfig = network.ETH
// const tokens = network.tokens;
const contractAddresses = network.contractAddresses;

module.exports = {
  isBurnableToken: function(tokenAddr){
    const tokenData = global.TOKENS_BY_ADDR[tokenAddr.toLowerCase()]

    if(!tokenData) return true

    if(['ETH', 'WETH', 'KCC', 'PT'].indexOf(tokenData.symbol) >= 0){
      return false
    }

    return true
  },

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
    return this.containNoCase(contractAddresses.feeBurners, addr) || this.containNoCase(contractAddresses.feeHandler, addr);
  },

  sumBig(arrayParams, initState) {
    return arrayParams.reduce((a, b) => {
      let bigA = a ? new BigNumber(a.toString()) : new BigNumber(0)
      let bigB = b ? new BigNumber(b.toString()) : new BigNumber(0)
      return bigA.plus(bigB)
    }, new BigNumber(initState))
    .toString()
  },

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },
  
  timesBig(arrayParams) {
    return arrayParams.reduce((a, b) => 
      new BigNumber(a || 0).multipliedBy(new BigNumber(b || 0))
    , 1)
    .toString()
  },

  caculateDestAmount(srcQty=0, rate=0, dstDecimals=18, srcDecimals=18, PRECISION=Math.pow(10, 18)){
    if (dstDecimals >= srcDecimals) {
      // (srcQty * rate * (10**(dstDecimals - srcDecimals))) / PRECISION
      const bigAmountAndRate = new BigNumber(srcQty.toString()).multipliedBy(rate.toString())
      const multiplier = Math.pow(10, (dstDecimals - srcDecimals))
      return bigAmountAndRate.multipliedBy(multiplier).dividedBy(PRECISION).toFixed(0).toString();
    } else {
      // (srcQty * rate) / (PRECISION * (10**(srcDecimals - dstDecimals)));

      const bigAmountAndRate = new BigNumber(srcQty.toString()).multipliedBy(rate.toString())
      const divisor = new BigNumber(PRECISION).multipliedBy(Math.pow(10, (srcDecimals - dstDecimals)))
      return bigAmountAndRate.dividedBy(divisor).toFixed(0).toString()
    }
  },

  caculateRebateFee(total, bps=10000){
    const bigTotal = new BigNumber(total.toString())
    return bigTotal.multipliedBy(bps).dividedBy(10000).toFixed(0).toString()
  },

  snakeToCamel(obj={}) {
    const snakeToCamel = (str) => str.replace(
      /([-_][a-z])/g,
      (group) => group.toUpperCase()
                      .replace('-', '')
                      .replace('_', '')
    );
    const returnObj = {}
    Object.keys(obj).map(k => {
      returnObj[snakeToCamel(k)] = obj[k]
    })

    return returnObj
  },

  divBig(divisor, dividend){
    if(!divisor) return 0
    if(!dividend) return "NaN"
  
    let bigDivisor = new BigNumber(divisor)
    return bigDivisor.dividedBy(dividend).toFixed()
  },

  toT(number, decimal, round, reverse) {
    if(!number) return 0
    var bigNumber = new BigNumber(number.toString())
    var result
    if (bigNumber == 'NaN' || bigNumber == 'Infinity') {
      return number
    } else if (this.acceptableTyping(number)) {
      return number
    }
    if (decimal) {
      result = bigNumber.dividedBy(Math.pow(10, decimal));
    }
    else {
      result = bigNumber.dividedBy(1000000000000000000)
    }
    if(reverse){
      result = result.pow(-1)
    }
    if (round !== undefined) {
      return result.decimalPlaces(round).toString()
    } else {
      return result.toString()
    }
  },

  acceptableTyping(number) {
    // ends with a dot
    if (number.length > 0 && number[number.length - 1] == ".") {
      return true
    }
  
    // TODO refactor format
    // zero suffixed with real number
    // if (number.length > 0 && number[number.length - 1] == "0") {
    //   for (var i = 0; i < number.length; i++) {
    //     if (number[i] == ".") {
    //       return true
    //     }
    //   }
    // }
    return false
  },

  numberToHex: function(number) {
    return "0x" + (new BigNumber(number)).toString(16)
  },
  
  caculateTokenRateAmount(decimal){
    // console.log("____________decimal", decimal)
    const tDecimal = decimal || 18
    const bigAmount = new BigNumber(10).pow(Math.round(tDecimal / 2))
    return "0x" + bigAmount.toString(16)
  },

  getRateTokenArray: function() {
    let supportedTokens = [];
    let supportedAddressArray = []
    let tokenRateAmountArray = []
    Object.keys(global.TOKENS_BY_ADDR).forEach(address => {
      if (this.shouldShowToken(address.toLowerCase()) && address.toLowerCase() !== network.ETH.address ) {
        supportedAddressArray.push(address);
        supportedTokens.push(global.TOKENS_BY_ADDR[address]);
        tokenRateAmountArray.push(this.caculateTokenRateAmount(global.TOKENS_BY_ADDR[address].decimal))
      }
    })

    const ethArray = Array(supportedAddressArray.length).fill(network.ETH.address);

    const srcArray = supportedAddressArray.concat(ethArray);
    const destArray = ethArray.concat(supportedAddressArray);
    const ethRateAmountArray = Array(ethArray.length).fill("0x2386F26FC10000");
    const qtyArray = tokenRateAmountArray.concat(ethRateAmountArray)

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
  },
  ignoreETH: (side) => {
    return ` AND ${side}_token_address <> "${network.ETH.address}"`
  }
};
