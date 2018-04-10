import _ from 'lodash';
import request from 'superagent';
import BaseRequest from '../foundation/BaseRequest';

class AppRequest extends BaseRequest {

  getTrades (page=0, limit=20, query={}, callback) {
    const url = `/api/trades`;
    return request
            .get(url)
            .query(_.assign({ limit, page }, query))
            .then((res) => {
              return callback(null, res.body);
            })
            .catch(this._handleError)
  }

  searchTrades (q, page=0, limit=20, fromDate, toDate, callback) {
    const url = `/api/search`;
    return request
            .get(url)
            .query({ q, limit, page, fromDate, toDate })
            .then((res) => {
              return callback(null, res.body);
            })
            .catch(this._handleError);
  }

  getNetworkVolume(period, interval, symbol, callback) {
    if (typeof symbol === 'function') {
      callback = symbol;
      symbol = null;
    }

    const url = `/api/volumes`;
    return request
            .get(url)
            .query({ period, interval, symbol })
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getBurnedFees(period, interval, symbol, callback) {
    if (typeof symbol === 'function') {
      callback = symbol;
      symbol = null;
    }

    const url = `/api/fees/burned`;
    return request
            .get(url)
            .query({ period, interval, symbol })
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getCollectedFees(period, interval, symbol, callback) {
    if (typeof symbol === 'function') {
      callback = symbol;
      symbol = null;
    }

    const url = `/api/fees/collected`;
    return request
            .get(url)
            .query({ period, interval, symbol })
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getFeeToBurn(period, interval, symbol, callback) {
    if (typeof symbol === 'function') {
      callback = symbol;
      symbol = null;
    }

    const url = `/api/fees/to_burn`;
    return request
            .get(url)
            .query({ period, interval, symbol })
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getTopToken(fromDate, toDate, callback) {

    const url = `/api/tokens/top`;
    return request
            .get(url)
            .query({ fromDate, toDate })
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getTradeDetails (id, params={}) {
    const url = `/api/trades/${id}`;
    return this.get(url, {});
  }

  getStats24h () {
    const url = `/api/stats24h`;
    return this.get(url, {});
  }

  getTopTokens (params={}) {
    const url = `/api/tokens/top`;
    return this.get(url, params);
  }

  _handleError(err) {
    window.EventBus.$emit('EVENT_COMMON_ERROR', err);
  }

}

const instance = new AppRequest();
export default instance;
