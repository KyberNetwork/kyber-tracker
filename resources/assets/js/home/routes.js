import TradeList      from './components/TradeList.vue';
import TradeDetails   from './components/TradeDetails.vue';
import TokenList      from './components/TokenList.vue';
import TokenDetails   from './components/TokenDetails.vue';

export default {
  routes: [
    { path: '/',                  component: TradeList },
    { path: '/trades/:id',        component: TradeDetails },
    { path: '/tokens',            component: TokenList },
    { path: '/tokens/:tokenAddr', component: TokenDetails },
  ]
};
