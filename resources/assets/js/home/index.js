import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import Vue from 'vue'
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import VueResource from 'vue-resource';
import BootstrapVue from 'bootstrap-vue';

import App from './components/App.vue';
import DataTable from '../core/components/DataTable.vue';
import routes from './routes';
import en from '../../../lang/en';
import vi from '../../../lang/vi';

Vue.component('data-table', DataTable);

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(VueResource);
Vue.use(BootstrapVue);

const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'en',
  messages: { en, vi },
});
window.i18n = i18n;

const router = new VueRouter(routes);
window.vueRouter = router;

require ('../core/helper/_loader');

export const app = new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app');
