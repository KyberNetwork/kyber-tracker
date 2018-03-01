import _ from 'lodash';
import jQuery from 'jquery';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import network from '../../../../../config/network';

const tokens = _.keyBy(_.values(network.tokens), 'symbol');

const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

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

  getTokenInfo: function (symbol) {
    return tokens[symbol];
  },

  getDateInfo: function(timestamp) {
    return moment(timestamp).fromNow();
  },

  formatTokenAmount: function (amount, decimal=18, precision=6) {
    const bigNumber = new BigNumber(amount.toString());
    let result = bigNumber.div(Math.pow(10, decimal));
    return result.precision(precision).toString();
  },

};
