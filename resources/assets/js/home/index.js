import 'bootstrap/dist/css/bootstrap.css';
import "babel-polyfill";

import Vue from 'vue'
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import VueResource from 'vue-resource';
import BootstrapVue from 'bootstrap-vue';
import VuePaginate from 'vuejs-paginate';
import VueDatePicker from 'vuejs-datepicker';
import moment from 'moment';
import VTooltip from 'v-tooltip';
import { Hooper, Slide } from 'hooper';
// import 'hooper/dist/hooper.css';

import VueCarousel from 'vue-carousel';
// import carousel from 'vue-owl-carousel'

import App from './components/App.vue';
import DataTable from '../core/components/DataTable.vue';
import TradeList from '../core/components/TradeList.vue';
import MiniTradeList from '../core/components/MiniTradeList.vue';
import FeeList from '../core/components/FeeList.vue';
import TokenLink from '../core/components/TokenLink.vue';
import ChartVolume from '../core/components/ChartVolume.vue';
import ChartFee from '../core/components/ChartFee.vue';
import ChartUniqueTraders from '../core/components/ChartUniqueTraders.vue';
import ChartNumberTrades from '../core/components/ChartNumberTrades.vue';
import ChartToken from '../core/components/ChartToken.vue';
import ChartPartner from '../core/components/ChartPartner.vue'
import NotFound from './components/NotFound.vue';
import Oop from '../core/components/Oop.vue';
// import ImportAcount from '../core/components/ImportAccount.vue';
import VueAutosuggest from "vue-autosuggest";
import VueMq from 'vue-mq'
// import localforage from 'localforage';
import routes from './routes';

import network from '../../../../config/network'
import util from "../core/helper/util"
// localforage.config({
//   name: 'KyberTracker'
// });

const en = require('../../../lang/en.json');
const vi = require('../../../lang/vi.json');
const ko = require('../../../lang/ko.json');
const zh = require('../../../lang/zh.json');


// require('moment/locale/zh-cn.js');
// require('moment/locale/es.js');
// require('moment/locale/fr.js');
// require('moment/locale/nl.js');

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(VueResource);
Vue.use(BootstrapVue);
Vue.use(VTooltip)
Vue.use(VueAutosuggest)
// Vue.use(VueCarousel);
Vue.use(VueMq, {
  breakpoints: {
    sm: 576,
    ml: 768,
    md: 1200,
    lg: Infinity,
  }
})

Vue.component('data-table', DataTable);
Vue.component('trade-list', TradeList);
Vue.component('mini-trade-list', MiniTradeList);
Vue.component('fee-list', FeeList);
Vue.component('token-link', TokenLink);
Vue.component('chart-volume', ChartVolume);
Vue.component('chart-fee', ChartFee);
Vue.component('chart-token', ChartToken);
Vue.component('chart-partner', ChartPartner)
Vue.component('chart-unique-traders', ChartUniqueTraders);
Vue.component('chart-number-trades', ChartNumberTrades);
Vue.component('not-found', NotFound);
Vue.component('oop', Oop);

// Vue.component('import-acount', ImportAcount)
Vue.component('paginate', VuePaginate);
Vue.component('datepicker', VueDatePicker);
// Vue.component('carousel', carousel);

// Vue.component('hooper', Hooper);
// Vue.component('slide', Slide);

Vue.prototype.$tokens = "akjsbndkjansdnsa"
// const locale = localStorage.getItem('locale') || 'en';
const getMomentLanguage = () => {
  let langPackage = util.getLocale(util.getBrowserLanguage())
  return network.mappingLang_Moment[langPackage]
}

const i18n = new VueI18n({
  locale: util.getLocale(util.getBrowserLanguage()),
  fallbackLocale: 'en',
  messages: { en, vi, ko, zh },
});
window.i18n = i18n;

moment.updateLocale('vi', {
  relativeTime: {
    past: "%s trước",
    m: "1 phút",
    h: "1 giờ",
    d: "1 ngày",
    y: "1 năm",
  }
});

moment.updateLocale('en', {
  relativeTime: {
    past: "%s ago",
    m: "1 min",
    mm: "%d mins",
    h: "1 hour",
    d: "1 day",
    y: "1 year"
  }
});
moment.locale(getMomentLanguage());
const router = new VueRouter(routes);
window.vueRouter = router;

require ('../core/helper/_loader');

export const app = new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app');
