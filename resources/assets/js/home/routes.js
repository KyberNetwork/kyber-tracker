import TradeList      from './components/TradeList.vue';
import TradeDetails   from './components/TradeDetails.vue';

export default {
  routes: [
    { path: '/',        component: TradeList },
    { path: '/trade',   component: TradeDetails },
  ]
};
