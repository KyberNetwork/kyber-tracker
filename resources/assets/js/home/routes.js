import Home           from './components/Home.vue';
import TradeList      from './components/TradeList.vue';
import TradeDetails   from './components/TradeDetails.vue';
import TokenList      from './components/TokenList.vue';
import TokenDetails   from './components/TokenDetails.vue';
import SearchResult   from './components/SearchResultPage.vue';
import PartnerDetail  from './components/PartnerDetail.vue';
import PageNotFound   from './components/PageNotFound.vue';

export default {
  routes: [
    { path: '/',                  name: 'home',           component: Home },
    { path: '/trades',            name: 'trade-list',     component: TradeList },
    { path: '/trades/:id',        name: 'trade-details',  component: TradeDetails },
    { path: '/tokens',            name: 'token-list',     component: TokenList },
    { path: '/tokens/:tokenAddr', name: 'token-details',  component: TokenDetails },
    { path: '/search',            name: 'search',         component: SearchResult },
    { path: '/partner/:partnerId',name: 'partner-detail', component: PartnerDetail },
    { path: '*',                  name: 'not-found',      component: PageNotFound },
  ],
  // mode: 'history'
};
