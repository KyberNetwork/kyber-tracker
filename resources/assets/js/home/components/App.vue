<template>
  <div>
      <b-navbar toggleable="md" type="light" variant="">
        <div class="container">
        <b-navbar-nav>
          <b-nav-item>
            <router-link to="/">
              <img src="images/logo_nav.svg" />
            </router-link>
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">

          <b-dropdown class="change-language-button" right>
            <template slot="button-content">
              <span><img :src="'images/locales/' + this.getLanguage() + '.svg'" /></span>
            </template>
            <b-dropdown-item @click="changeLanguage('en')"><img src="images/locales/en.svg" /></b-dropdown-item>
            <b-dropdown-item @click="changeLanguage('vi')"><img src="images/locales/vi.svg" /></b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>
        </div>
      </b-navbar>

      <b-navbar toggleable="md" type="dark" class="heading-bar">
        <div class="container">
          <b-navbar-nav>
            <b-nav-text>
              <span class="light-text">{{ $t('status_bar.network_volume') }}</span><br />
              {{ networkVolume }}
            </b-nav-text>
            <b-nav-text class="ml-3">
              <span class="light-text">{{ $t('status_bar.trades') }}</span><br />
              {{ tradeCount }}
            </b-nav-text>
            <b-nav-text class="ml-3">
              <span class="light-text">{{ $t('status_bar.burned_fee') }}</span><br />
              {{ totalBurnedFee }}
            </b-nav-text>
            <b-nav-text class="ml-3">
              <span class="light-text">{{ $t('status_bar.knc_price') }}</span><br />
              <span>{{ kncPrice }} </span>
              <span :class="kncPriceChange24h < 0 ? 'neg-value' : 'pos-value'">({{ formatedKNCPriceChange24h }})</span>
            </b-nav-text>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item>
              <b-input-group>
                <b-form-input v-model="searchString"></b-form-input>
                <b-input-group-append>
                  <b-btn variant="default cursor-pointer" @click="doSearch()">
                    <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="24px" width="18px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                  </b-btn>
                </b-input-group-append>
              </b-input-group>
            </b-nav-item>
          </b-navbar-nav>
        </div>
      </b-navbar>

      <b-navbar toggleable="md" type="dark" class="second-heading-bar">
        <div class="container">
          <b-navbar-nav>
            <b-nav-item>
              <router-link to="/trades">{{ $t('navigator.trades') }}</router-link>
            </b-nav-item>
            <b-nav-item>
              <router-link to="/tokens">{{ $t('navigator.tokens') }}</router-link>
            </b-nav-item>
          </b-navbar-nav>
        </div>
      </b-navbar>

      <div class="breadcrumbs" v-if="breadcrumbsItems.length > 0">
        <div class="container-fluid">
          <div class="title">{{ pageTitle }}</div>
          <b-breadcrumb :items="breadcrumbsItems"/>
        </div>
      </div>

    <div class="container">
      <div class="row pt-40">
        <router-view></router-view>
      </div>
    </div>

    <div id="footer">
      <div class="container">
        <div class="row">
          <div class="col footer-menu">
            <ul class="links">
              <li><a href="https://home.kyber.network" target="_blank">Home</a></li>
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
      if (this.kncPriceChange24h >= 0) {
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
    loadBreadcumbs (routeName) {
      switch (routeName) {
        case 'home':
          this.pageTitle = '';
          this.breadcrumbsItems = [];
          return;
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
          this.pageTitle = this.$t('page_title.token_detail');
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
      }
    }
  },

  watch: {
    '$route'(toVal, fromVal) {
      this.loadBreadcumbs(toVal.name);
    }
  },

  mounted () {
    this.refresh();
    this.loadBreadcumbs(this.$route.name);

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
        display: flex;
        justify-content: center;
        align-self: center;
        font-size: 16px;
      }
    }
  }
</style>
