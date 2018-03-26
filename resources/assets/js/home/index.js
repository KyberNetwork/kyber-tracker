import 'bootstrap/dist/css/bootstrap.css';

import Vue from 'vue'
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import VueResource from 'vue-resource';
import BootstrapVue from 'bootstrap-vue';
import VuePaginate from 'vuejs-paginate';
import VueDatePicker from 'vuejs-datepicker';
import moment from 'moment';
import VTooltip from 'v-tooltip'

import App from './components/App.vue';
import DataTable from '../core/components/DataTable.vue';
import TradeList from '../core/components/TradeList.vue';
import TokenLink from '../core/components/TokenLink.vue';
import ChartVolume from '../core/components/ChartVolume.vue';
import ChartFee from '../core/components/ChartFee.vue';
import ChartToken from '../core/components/ChartToken.vue';
import ImportAcount from '../core/components/ImportAccount.vue';
import routes from './routes';
const en = require('../../../lang/en.json');
const vi = require('../../../lang/vi.json');

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(VueResource);
Vue.use(BootstrapVue);
Vue.use(VTooltip)

Vue.component('data-table', DataTable);
Vue.component('trade-list', TradeList);
Vue.component('token-link', TokenLink);
Vue.component('chart-volume', ChartVolume);
Vue.component('chart-fee', ChartFee);
Vue.component('chart-token', ChartToken);
Vue.component('import-acount', ImportAcount)
Vue.component('paginate', VuePaginate);
Vue.component('datepicker', VueDatePicker);


const locale = localStorage.getItem('locale') || 'en';
const i18n = new VueI18n({
  locale: locale,
  messages: { en, vi },
});
window.i18n = i18n;

// moment.updateLocale('vi', {

// })
moment.locale(locale);

const router = new VueRouter(routes);
window.vueRouter = router;

require ('../core/helper/_loader');

export const app = new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app');
