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
            .catch((err) => {
              window.EventBus.$emit('EVENT_COMMON_ERROR', err);
            })
  }

  searchTrades (q, page=0, limit=20, callback) {
    const url = `/api/search`;
    return request
            .get(url)
            .query({ q, limit, page })
            .then((res) => {
              return callback(null, res.body);
            })
            .catch((err) => {
              window.EventBus.$emit('EVENT_COMMON_ERROR', err);
            });
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

}

const instance = new AppRequest();
export default instance;
