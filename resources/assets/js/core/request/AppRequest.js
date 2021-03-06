import _ from 'lodash';
import request from 'superagent';
import BaseRequest from '../foundation/BaseRequest';
import network from '../../../../../config/network';
import store from "../../core/helper/store";

class AppRequest extends BaseRequest {

  isOfficial(){
    return store.get('kyber-official-network') ? true : false
  }

  getTrades (page=0, limit=20, query={}, callback) {
    const url = `/api/trades`;
    if(this.isOfficial()) query.official = true
    else query.official = false

    return request
            .get(url)
            .query(_.assign({ limit, page }, query))
            .then((res) => {
              return callback(null, res.body);
            })
            .catch(this._handleError)
  }

  getReserveTrades (page=0, limit=20, query={}, callback) {
    const url = `/api/reserveTrades`;
    return request
            .get(url)
            .query(_.assign({ limit, page }, query))
            .then((res) => {
              return callback(null, res.body);
            })
            .catch(this._handleError)
  }

  getCollectedFeeList (page=0, limit=20, query={}, callback) {
    const url = `/api/collectedFeeList`;
    if(this.isOfficial()) query.official = true
    else query.official = false

    return request
            .get(url)
            .query(_.assign({ limit, page }, query))
            .then((res) => {
              return callback(null, res.body);
            })
            .catch(this._handleError)
  }

  getBuntTransaction (page=0, limit=20, query={}, callback) {
    const url = `/api/fees/burned-list`;
    if(this.isOfficial()) query.official = true
    else query.official = false

    return request
            .get(url)
            .query(_.assign({ limit, page }, query))
            .then((res) => {
              return callback(null, res.body);
            })
            .catch(this._handleError)
  }

  searchTrades (q, page=0, limit=20, fromDate, toDate, exportData, callback) {
    const url = `/api/search`;
    let queryParams = { q, limit, page, fromDate, toDate }
    if(exportData) queryParams.exportData = true
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    return request
            .get(url)
            .query(queryParams)
            .then((res) => {
              return callback(null, res.body);
            })
            .catch((err => {
              this._handleError(err)
              // callback(err)
            }));
  }

  getPartnerDetail (partnerId, page=0, limit=20, fromDate, toDate, exportData, callback) {
    const url = `/api/partner/${partnerId}`;
    let queryParams = {limit, page, fromDate, toDate }
    if(exportData) queryParams.exportData = true
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    return request
            .get(url)
            .query(queryParams)
            .then((res) => {
              return callback(null, res.body);
            })
            .catch(err => {
              this._handleError(err)
              callback(err)
            });
  }

  // searchAllToExport (q, fromDate, toDate, callback) {
  //   const url = `/api/search`;
  //   return request
  //           .get(url)
  //           .query({ q, fromDate, toDate, exportData: true })
  //           .then((res) => {
  //             return callback(null, res.body);
  //           })
  //           .catch(this._handleError);
  // }

  getNetworkVolume(period, interval, address, callback) {
    if (typeof address === 'function') {
      callback = address;
      address = null;
    }
    let queryParams = { period, interval, address }
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    const url = `/api/volumes`;
    return request
            .get(url)
            .query(queryParams)
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

    let queryParams = { period, interval, symbol }
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    const url = `/api/fees/burned`;
    return request
            .get(url)
            .query(queryParams)
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
    let queryParams = { period, interval, symbol }
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    const url = `/api/fees/collected`;
    return request
            .get(url)
            .query(queryParams)
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getUniqueTraders(period, interval, address, callback) {
    if (typeof address === 'function') {
      callback = address;
      address = null;
    }
    let queryParams = { period, interval, address }
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    const url = `/api/unique_traders`;
    return request
            .get(url)
            .query(queryParams)
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getTotalTrades(period, interval, address, callback) {
    if (typeof address === 'function') {
      callback = address;
      address = null;
    }
    let queryParams = { period, interval, address }
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    const url = `/api/total_trades`;
    return request
            .get(url)
            .query(queryParams)
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
    let queryParams = { period, interval, symbol }
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    const url = `/api/fees/to_burn`;
    return request
            .get(url)
            .query(queryParams)
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getTopToken(fromDate, toDate, callback) {
    const url = `/api/tokens/top`;
    let queryParams = { fromDate, toDate }
    if(this.isOfficial()) queryParams.official = true
    else queryParams.official = false

    return request
            .get(url)
            .query(queryParams)
            .then((res) => {
              return callback(null, res.body.data);
            })
            .catch(this._handleError)
  }

  getTradeDetails (id, params={}) {
    const url = `/api/trades/${id}`;
    if(this.isOfficial()) params.official = true
    else params.official = false

    return this.get(url, params);
  }

  getStats24h () {
    const url = `/api/stats24h`;
    let params = {}
    if(this.isOfficial()) params.official = true
    else params.official = false

    return this.get(url, params);
  }

  getTopTokens (params={}) {
    const url = `/api/tokens/top`;
    if(this.isOfficial()) params.official = true
    else params.official = false

    return this.get(url, params);
  }

  getTokens (params={}) {
    const url = `/api/tokens`;
    if(this.isOfficial()) params.official = true
    else params.official = false

    return this.get(url, params);
  }

  getPartnersList(params={}){
    const url = `/api/partners`;
    return this.get(url, params);
  }

  getAprStatus(params={}){
    const url = network.endpoints.apis + '/apr_status'
    return this.get(url, params);
  }
  getTokenPrices(params={}){
    const url = network.endpoints.apis + '/prices'
    return this.get(url, params);
  }

  getTokenChange24h(params={}){
    const url = network.endpoints.apis + '/change24h'
    return this.get(url, params);
  }

  getReserveList(params={}){
    const url = `/api/reserves`;
    if(this.isOfficial()) params.official = true
    else params.official = false

    return this.get(url, params);
  }

  getReserveDetail(params){
    const url = `/api/reserves/${params.reserveAddr}`;
    if(this.isOfficial()) params.official = true
    else params.official = false

    return this.get(url, params);
  }

  _handleError(err) {
    // window.EventBus.$emit('EVENT_COMMON_ERROR', err);
  }

}

const instance = new AppRequest();
export default instance;
