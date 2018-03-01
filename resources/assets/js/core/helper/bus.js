import Vue from 'vue';
import jQuery from 'jquery';
import axios from 'axios';
import util from './util';

export const EventBus = new Vue();
window.EventBus = EventBus;
window.jQuery = jQuery;

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

EventBus.$on('EVENT_COMMON_ERROR', (err) => {
  let errMsg = err.toString();
  if (typeof err === 'string' ||
      typeof err === 'number') {
    errMsg = err.toString();
  } else if (typeof err === 'object') {
    if (err.response) {
      const response = err.response;
      if (response.body) {
        const body = response.body;
        if (body.meta) {
          const meta = body.meta;
          if (meta.msg) {
            errMsg = meta.msg;
          } else if (meta.message) {
            errMsg = meta.message;
          }
        } else if (body.msg) {
          errMsg = body.msg;
        } else if (body.message) {
          errMsg = body.message;
        }
      } else if (response.data) {
        const body = response.data;
        if (body.meta) {
          const meta = body.meta;
          if (meta.msg) {
            errMsg = meta.msg;
          } else if (meta.message) {
            errMsg = meta.message;
          }
        } else if (body.msg) {
          errMsg = body.msg;
        } else if (body.message) {
          errMsg = body.message;
        }
      } else if (response.text) {
        errMsg = response.text;
      } else if (response.error) {
        errMsg = response.error.toString();
      }
    }
  }

  util.growl(errMsg, { type: 'danger' });
});

EventBus.$on('EVENT_COMMON_MSG', (msg) => {
  util.growl(msg);
});

export default EventBus;
