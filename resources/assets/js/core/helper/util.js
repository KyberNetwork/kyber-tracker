import _ from 'lodash';
import jQuery from 'jquery';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import network from '../../../../../config/network/production';
const iconEndpont = 'https://files.kyberswap.com/DesignAssets/tokens/'
const partnersEndpont = 'https://files.kyberswap.com/DesignAssets/partners/'
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens

BigNumber.config({ DECIMAL_PLACES: 6 });
const tokens = TOKENS_BY_ADDR
const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

function kyberRoundingNumber (number) {
  const MAX_DIGIS = 7, SIZE = 3;
  number = +number;
  let numberStr = number.toString();
  if (isNaN(number) || number <= 0) number = 0;
  if (number < 1e-7) number = 0;
  if (('' + Math.floor(number)).length >= MAX_DIGIS) {
    return Math.floor(number).toLocaleString();
  }

  let count_0 = 0
  for (let j of numberStr) {
    if(j == '.') continue
    if(j == 0)
      count_0++
    else
      break
  }

  let precision = number.toPrecision((number < 1 && number > 0) ? MAX_DIGIS - count_0 : MAX_DIGIS),
    arr = precision.split('.'),
    intPart = arr[0],
    i = intPart.length % SIZE || SIZE,
    result = intPart.substr(0, i);

  for (; i < intPart.length; i += SIZE) {
    result += ',' + intPart.substr(i, SIZE);
  }
  if (arr[1]) {
    result += '.' + arr[1];
  }
  return result;
}

function newRoundingNumber (input = 0, maxDigis) {
  const DEFAULT_DIGITS = 4
  const MAX_DIGIS = !maxDigis && maxDigis !== 0 ? DEFAULT_DIGITS : maxDigis

  const CustomBigNumber = BigNumber.clone({
    FORMAT: {
      // the decimal separator
      decimalSeparator: '.',
      // the grouping separator of the integer part
      groupSeparator: ',',
      // the primary grouping size of the integer part
      groupSize: 3,
      // the secondary grouping size of the integer part
      secondaryGroupSize: 0,
      // the grouping separator of the fraction part
      fractionGroupSeparator: ' ',
      // the grouping size of the fraction part
      fractionGroupSize: 0
    }
  })

  let bigInput = new CustomBigNumber(input.toString())
  if (bigInput == 'NaN' || bigInput == 'Infinity') {
    return "NaN"
  }

  // console.log("_________max digits", maxDigis, MAX_DIGIS, bigInput.e + 1)
  let precision = bigInput.e < 0 ? 
    bigInput.toPrecision(MAX_DIGIS || DEFAULT_DIGITS) 
    : 
    bigInput.toPrecision(Math.max(MAX_DIGIS, bigInput.e + 1) || DEFAULT_DIGITS)

  return new CustomBigNumber(precision).toFormat()
}

export default {

  qs: function (key) {
    key = key.replace(/[*+?^$.[]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    let match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },

  numberWithCommas: function (x) {
    if(!x) return 0
    //return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  },

  getAppEndpoint: function () {
    return `${location.protocol}//${location.hostname}:${location.port}`;
  },

  getEndpointUrl: function (url) {
    return Utils.getAppEndpoint() + url;
  },

  isValidUrl: function (url) {
    return urlPattern.test(url);
  },

  growl: function (text, options) {
    jQuery.bootstrapGrowl(text, options);
  },

  vueRedirect: function (path) {
    if (window.vueRouter) {
      window.vueRouter.replace(path);
    } else {
      console.warn(`[ERROR] Utils.vueRedirect: window.vueRouter does not initialized...`);
    }
  },

  getLocale: function(defaultVal) {
    return localStorage.getItem('locale') || defaultVal || 'en';
  },

  getBrowserLanguage: function(){
    const browserDefaultlanguage = navigator.language
    let defaultLanguage = 'en'
    if(browserDefaultlanguage){
      const nation = browserDefaultlanguage.split('-')[0]
      defaultLanguage = network.supportedLanguage.indexOf(nation) >= 0 ? nation : 'en'
    }
    return defaultLanguage
  },

  getTokenInfo: function (address) {
    return tokens[address];
  },

  getDateInfo: function(timestamp, isShort) {
    return moment(timestamp).fromNow(isShort);
  },

  formatFiatCurrency: function (amount) {
    if (amount === 0) {
      return '0';
    }

    if (!amount) {
      return '';
    }

    const bn = new BigNumber(amount.toString());
    return this.numberWithCommas(parseFloat(bn.toFixed(2).toString()));
  },

  shouldShowToken (tokenAddress, timeStamp) {
    // return !this.tokens[item.symbol].hidden;
    if(!tokens[tokenAddress.toLowerCase()].hidden) return true;
    if (typeof tokens[tokenAddress.toLowerCase()].hidden != 'number') return false;
    return (timeStamp || Date.now()) >= tokens[tokenAddress.toLowerCase()].hidden;
  },

  isNewToken (tokenAddress) {
    var bornMs = tokens[tokenAddress].hidden;
    if (typeof bornMs != 'number') return false;
    return Date.now() <= bornMs + 24 * 60 * 60 * 1000;
  },

  formatTokenAmount: function (amount, decimal=18, decimalFormat = 2) {
    const bigNumber = new BigNumber(amount.toString());
    let result = bigNumber.div(Math.pow(10, decimal));
    return this.numberWithCommas(parseFloat(result.toFixed(decimalFormat).toString()));
  },

  getTokenUsdalue: function(amount, usdPrice, decimal=18, decimalFormat = 2){
    const bigNumber = new BigNumber(amount.toString());
    let result = bigNumber.div(Math.pow(10, decimal)).multipliedBy(usdPrice.toString())
    return this.numberWithCommas(parseFloat(result.toFixed(decimalFormat).toString()));
  },

  roundingNumber: function (number) {
    // return kyberRoundingNumber(number);
    return newRoundingNumber(number, 6)
  },
  roundingAmount: function (number) {
    return newRoundingNumber(number, 2)
  },
  isTxHash: function(hash) {
    return /^0x([A-Fa-f0-9]{64})$/i.test(hash);
  },
  isAddress: function(address) {
    return /^(0x)?[0-9a-f]{40}$/i.test(address)
  },

  getTokenIcon: (symbol, callback) => {
    if(!symbol) return '/images/tokens/token-unknown.svg'
    
    let iconName = symbol.replace(/\./g, "_").replace(/ /g, "_").toLowerCase() + '.svg'
    let urlIcon = iconEndpont + iconName

    let img = new Image(); 
    img.onerror = () => {
      return callback('/images/tokens/token-unknown.svg')
    };
    img.src = urlIcon;

    return urlIcon
    
    // let icon = typeof this.tokens[symbol].icon !== 'undefined' ? this.tokens[symbol].icon : (symbol.toLowerCase() + ".svg");
    // return "https://raw.githubusercontent.com/KyberNetwork/KyberWallet/master/src/assets/img/tokens/" +
    //      icon + "?sanitize=true";
  },

  getPartnerLogo: (symbol, callback) => {
    if(!symbol) return '/images/tokens/token-unknown.svg'
    
    let iconName = symbol.replace(/\./g, "_").replace(/ /g, "_").toLowerCase()
    let svgImageName = iconName + '.svg'
    let svgUrl = partnersEndpont + svgImageName

    let svgImg = new Image(); 
    svgImg.onerror = () => {
      console.log("------------sgv image load error", svgUrl)
      let pngImageName = iconName + '.png'
      let pngUrl = partnersEndpont + pngImageName
      let pngImg = new Image()
      pngImg.onerror = () => {
        return callback('/images/tokens/token-unknown.svg')
      }
      pngImg.onload = () => {
        console.log("-_______________ png image onload _________", pngUrl)
        return callback(pngUrl)
      }
      pngImg.src = pngUrl
    };
    svgImg.src = svgUrl;

    return svgUrl
  
  },
  shortenAddress(address, startNum, endNum){
    if(!address) return ''
    return address.slice(0, startNum) + '...' + address.slice(-endNum)
  },

  isOfficial(tokenData){
    if(!tokenData) return false

    if(tokenData.official) return true

    if(tokenData.reserves && Object.values(tokenData.reserves).indexOf('1') >= 0) return true
    return false
  }

};
