<template>
  <div id="wrapper">
    <div id="page-content">
      <b-navbar toggleable="md" type="dark" class="heading-bar no-padding">
        <div class="container p-relative">
          <div class="col no-padding">
            <ul class="heading-summary">
              <li>
                <span class="light-text">{{ $t('status_bar.network_volume') }}</span><br />
                {{ networkVolume }}
              </li>
              <li>
                <span class="light-text">{{ $t('status_bar.trades') }}</span><br />
                {{ tradeCount }}
              </li>
              <li>
                <span class="light-text">{{ $t('status_bar.burned_fee') }}</span><br />
                {{ totalBurnedFee }}
              </li>
              <li>
                <span class="light-text">{{ $t('status_bar.knc_price') }}</span><br />
                <span>{{ kncPrice }} </span>
                <span :class="getPriceChangeClass()">({{ formatedKNCPriceChange24h }})</span>
              </li>
            </ul>
          </div>

          <div class="float-lang-bar cursor-pointer">
            <b-navbar-nav>
              <b-dropdown class="change-language-button" no-caret right>
                <template slot="button-content">
                  <span><img :src="'images/locales/' + this.getLanguage() + '.svg'" /></span>
                </template>
                <b-dropdown-item @click="changeLanguage('en')"><img src="images/locales/en.svg" /> English</b-dropdown-item>
                <b-dropdown-item @click="changeLanguage('vi')"><img src="images/locales/vi.svg" /> Tiếng Việt</b-dropdown-item>
              </b-dropdown>
            </b-navbar-nav>

          </div>


        </div>
      </b-navbar>

      <b-navbar toggleable="sm" type="dark" class="second-heading-bar no-padding">
        <div class="container">
          <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
          <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
              <b-nav-item class="navbar tracker-logo">
                <router-link to="/">
                  <span class="inline-logo"></span><span class="text-logo">KYBER TRACKER</span>
                </router-link>
              </b-nav-item>
              <b-nav-item class="navbar">
                <router-link to="/trades">{{ $t('navigator.trades') }}</router-link>
              </b-nav-item>
              <b-nav-item class="navbar">
                <router-link to="/tokens">{{ $t('navigator.tokens') }}</router-link>
              </b-nav-item>
            </b-navbar-nav>
          </b-collapse>

          <b-navbar-nav class="ml-auto search-box-container">
            <form action="javasript:void(0)" class="no-margin no-padding search-form">
              <b-nav-item class="no-padding-right">
                <b-input-group size="sm">
                  <b-form-input v-model="searchString" :placeholder="$t('common.searchbox_placeholder')"></b-form-input>
                  <b-input-group-append>
                    <b-btn type="submit" class="search-button" variant="default cursor-pointer" @click="doSearch()">
                      <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="26px" width="26px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                    </b-btn>
                  </b-input-group-append>
                </b-input-group>
              </b-nav-item>
            </form>
          </b-navbar-nav>
        </div>
      </b-navbar>

      <div class="breadcrumbs" v-if="breadcrumbsItems.length > 0">
        <div class="container">
          <div class="row">
            <div class="col"><p class="big-heading" v-html="pageTitle"></p></div>
            <div class="col">
              <b-breadcrumb :items="breadcrumbsItems" class="ml-auto home-breadcrumb"/>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row pt-40">
          <router-view></router-view>
        </div>
      </div>
    </div>


    <div id="footer">
      <div class="container">
        <div class="row">
          <div class="col footer-menu">
            <ul class="links">
              <li><router-link to="/">Home</router-link></li>
              <li><a href="mailto:support@kyber.network">Product Feedback</a></li>
              <li><a href="https://kybernetwork.zendesk.com/" target="_blank">Help</a></li>
            </ul>
            ©️ 2018 Kyber Network
          </div>
          <div class="col footer-menu text-right">
            <div class="d-inline-block">
              Developed with <span class="emoji"> ❤️ </span> and <span class="emoji"> ☕ </span><br>
              <ul class="links">
                <li><a href="https://t.me/kybernetwork" target="_blank">Telegram</a></li>
                <li><a href="https://github.com/kyberNetwork/" target="_blank">GitHub</a></li>
                <li><a href="https://twitter.com/KyberNetwork" target="_blank">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

import moment from 'moment';
import request from 'superagent';
import AppRequest from '../../core/request/AppRequest';
import util from '../../core/helper/util';
import network from '../../../../../config/network';

export default {
  data() {
    return {
      networkVolume: '',
      networkFee: '',
      tradeCount: '',
      kncPrice: '',
      kncPriceChange24h: 0,
      totalBurnedFee: '',
      searchString: '',
      pageTitle: '',
      breadcrumbsItems: [],
    };
  },

  computed: {
    formatedKNCPriceChange24h () {
      if (this.kncPriceChange24h > 0) {
        return '+' + this.kncPriceChange24h + '%';
      } else {
        return this.kncPriceChange24h + '%';
      }
    }
  },

  methods: {
    changeLanguage (locale) {
      localStorage.setItem('locale', locale);
      window.i18n.locale = locale;
      moment.locale(locale);
      window.location.reload();
    },
    getLanguage () {
      if(typeof window.i18n != 'undefined' && typeof window.i18n.locale != 'undefined') {
        return window.i18n.locale;
      } else {
        window.i18n.locale = 'vi';
        moment.locale('vi');
        return 'vi';
      }
    },
    getPriceChangeClass () {
      if (this.kncPriceChange24h === 0) return '';
      return this.kncPriceChange24h < 0 ? 'neg-value' : 'pos-value'
    },
    refresh () {
      AppRequest.getStats24h().then((stats) => {
        this.networkVolume = stats.networkVolume;
        this.networkFee = stats.networkFee;
        this.tradeCount = stats.tradeCount;
        this.totalBurnedFee = stats.totalBurnedFee + ' KNC';
      });

      request
        .get('https://api.coinmarketcap.com/v1/ticker/kyber-network/')
        .then((res) => {
          const data = res.body[0];
          if (!data || !data.id) {
            return;
          }

          this.kncPrice = '$' + parseFloat(data.price_usd).toFixed(2);
          this.kncPriceChange24h = parseFloat(data.percent_change_24h);
        });
    },
    doSearch () {
      if (!this.searchString) {
        return;
      }

      this.$router.push({
        name: 'search',
        query: {
          q: this.searchString
        }
      });

      window.setTimeout(() => {
        this.searchString = '';
      });
    },
    loadBreadcumbs (route) {
      const routeName = route.name;

      switch (routeName) {
        case 'trade-list':
          this.pageTitle = this.$t('page_title.trade_list');
          this.breadcrumbsItems = [{
            text: this.$t('navigator.home'),
            to: { name: 'home' },
          }, {
            text: this.$t('navigator.trades'),
            active: true,
          }];
          return;
        case 'token-list':
          this.pageTitle = this.$t('page_title.token_list');
          this.breadcrumbsItems = [{
            text: this.$t('navigator.home'),
            to: { name: 'home' },
          }, {
            text: this.$t('navigator.tokens'),
            active: true,
          }];
          return;
        case 'trade-details':
          this.pageTitle = this.$t('page_title.trade_detail');
          this.breadcrumbsItems = [{
            text: this.$t('navigator.home'),
            to: { name: 'home' }
          }, {
            text: this.$t('navigator.trades'),
            to: { name: 'trade-list' }
          }, {
            text: this.$t('navigator.trade_detail'),
            active: true
          }];
          return;
        case 'token-details':
          const tokenInfo = _.find(_.values(network.tokens), (token) => {
            return token.address === route.params.tokenAddr;
          });

          this.pageTitle = this.$t('page_title.token_detail');
          if (tokenInfo) {
            this.pageTitle = `<img src="images/tokens/${tokenInfo.icon}" /> <span>${tokenInfo.name}</span> <span class='sub-title'>(${tokenInfo.symbol})</span>`;
          }

          this.breadcrumbsItems = [{
            text: this.$t('navigator.home'),
            to: { name: 'home' }
          }, {
            text: this.$t('navigator.tokens'),
            to: { name: 'token-list' }
          }, {
            text: this.$t('navigator.token_detail'),
            active: true
          }];
          return;
        case 'search':
          this.pageTitle = this.$t('page_title.search');
          this.breadcrumbsItems = [{
            text: this.$t('navigator.home'),
            to: { name: 'home' }
          }, {
            text: this.$t('navigator.search'),
            active: true
          }];
          return;
        case 'home':
          this.pageTitle = '';
          this.breadcrumbsItems = [];
          return;
        default:
          this.pageTitle = '';
          this.breadcrumbsItems = [];
          return;
      }
    }
  },

  watch: {
    '$route'(toVal, fromVal) {
      this.loadBreadcumbs(toVal);
    }
  },

  mounted () {
    this.refresh();
    this.loadBreadcumbs(this.$route);

    window.setInterval(this.refresh, 60000); // Refresh each minute
  }
}
</script>

<style lang="scss">
  @import '../../../css/app.scss';
  .breadcrumbs {
    width: 100%;
    background-color: #dcdcdc;
    .container-fluid {
      padding: 0 30px;
      -webkit-box-pack: justify !important;
      -ms-flex-pack: justify !important;
      display: -webkit-box !important;
      display: -moz-box !important;
      display: -ms-flexbox !important;
      display: -webkit-flex !important;
      display: flex !important;
      -webkit-justify-content: space-between !important;
      justify-content: space-between !important;
      .breadcrumb {
        float: right;
        background: none;
        margin: 0;
      }
      .title {
        float: left;
        justify-content: center;
        align-self: center;
        font-size: 16px;

        .sub-title {
          margin-left: 10px;
          color: #868e96;
        }
      }
    }
  }
  .navbar .router-link-exact-active {
    color: #3ee6c1 !important;
  }
</style>
