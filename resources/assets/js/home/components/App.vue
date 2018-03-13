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
              {{ $t('status_bar.network_volume') }}<br />
              {{ networkVolume }}
            </b-nav-text>
            <b-nav-text class="ml-3">
              {{ $t('status_bar.trades') }}<br />
              {{ tradeCount }}
            </b-nav-text>
            <b-nav-text class="ml-3">
              {{ $t('status_bar.burned_fee') }}<br />
              {{ totalBurnedFee }}
            </b-nav-text>
            <b-nav-text class="ml-3">
              {{ $t('status_bar.knc_price') }}<br />
              {{ kncPrice }} ({{ kncPriceChange24h }})
            </b-nav-text>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item>
              <b-input-group>
                <b-form-input v-model="searchString"></b-form-input>
                <b-input-group-append>
                  <b-btn variant="default" @click="doSearch()">
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

    <div class="container">
      <div class="row">
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
import AppRequest from '../../core/request/AppRequest';
import util from '../../core/helper/util';

export default {
  data() {
    return {
      networkVolume: '',
      networkFee: '',
      tradeCount: '',
      kncPrice: '',
      kncPriceChange24h: '',
      totalBurnedFee: '',
      searchString: '',
    };
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
        this.kncPrice = '$' + parseFloat(stats.kncInfo.price_usd).toFixed(2);
        this.kncPriceChange24h = stats.kncInfo.percent_change_24h + '%';
        this.totalBurnedFee = stats.totalBurnedFee + ' KNC';
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
    }
  },

  mounted () {
    this.refresh();
  }
}
</script>

<style lang="scss">
  @import '../../../css/app.scss'
</style>
