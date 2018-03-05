import TradeList      from './components/TradeList.vue';
import TradeDetails   from './components/TradeDetails.vue';
import TokenList      from './components/TokenList.vue';

export default {
  routes: [
    { path: '/',        component: TradeList },
    { path: '/trade',   component: TradeDetails },
    { path: '/tokens',  component: TokenList }
  ]
};
