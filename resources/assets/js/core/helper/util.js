import _ from 'lodash';
import jQuery from 'jquery';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import network from '../../../../../config/network';

BigNumber.config({ DECIMAL_PLACES: 6 });
const tokens = _.keyBy(_.values(network.tokens), 'symbol');

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

export default {

  qs: function (key) {
    key = key.replace(/[*+?^$.[]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    let match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },

  numberWithCommas: function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

  getLocale: function() {
    return localStorage.getItem('locale') || 'en';
  },

  getTokenInfo: function (symbol) {
    return tokens[symbol];
  },

  getDateInfo: function(timestamp) {
    return moment(timestamp).fromNow();
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

  formatTokenAmount: function (amount, decimal=18, precision=6) {
    const bigNumber = new BigNumber(amount.toString());
    let result = bigNumber.div(Math.pow(10, decimal));
    return this.numberWithCommas(parseFloat(result.toFixed(3).toString()));
  },

  roundingNumber: function (number) {
    return kyberRoundingNumber(number);
  }

};
