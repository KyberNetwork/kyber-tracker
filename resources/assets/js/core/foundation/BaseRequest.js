import _ from 'lodash';
import axios from 'axios';

// Promised-based request
export default class BaseRequest {

  get(url, params = {}) {
    return this._doRequest('GET', url, { params });
  }

  put(url, data = {}) {
    return this._doRequest('put', url, { data });
  }

  post(url, data = {}) {
    return this._doRequest('post', url, { data });
  }

  _doRequest (method, url, paramsConfig) {
    const headers = {};
    const config = _.assign({
      method,
      url,
      headers
    }, paramsConfig);

    return new Promise((resolve, reject) => {
      axios(config)
        .then(response => {
          if (!response.data) {
            window.EventBus.$emit('EVENT_COMMON_ERROR', 'Invalid response format: ' + response);
            return;
          }

          if (!response.data.data) {
            resolve(response.data);
            return;
          }

          resolve(response.data.data, response.data.pagination);
        })
        .catch(err => {
          window.EventBus.$emit('EVENT_COMMON_ERROR', err);
        });
    });
  }

};
