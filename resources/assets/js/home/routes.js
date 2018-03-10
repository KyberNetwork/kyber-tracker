import TradeList      from './components/TradeList.vue';
import TradeDetails   from './components/TradeDetails.vue';
import TokenList      from './components/TokenList.vue';
import TokenDetails   from './components/TokenDetails.vue';
import SearchResult   from './components/SearchResultPage.vue';

export default {
  routes: [
    { path: '/',                  name: 'home',           component: TradeList },
    { path: '/trades/:id',        name: 'trade-details',  component: TradeDetails },
    { path: '/tokens',            name: 'token-list',     component: TokenList },
    { path: '/tokens/:tokenAddr', name: 'token-details',  component: TokenDetails },
    { path: '/search',            name: 'search',         component: SearchResult },
  ]
};
