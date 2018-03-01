<template>
  <div>

    <b-navbar toggleable="md" type="light" variant="">
      <b-navbar-nav>
        <b-nav-item>
          <router-link to="/">
            <img src="images/logo_nav.svg" />
          </router-link>
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav>
        <b-nav-item @click="changeLanguage('en')"><img src="images/locales/en.svg" /></b-nav-item>
        <b-nav-item @click="changeLanguage('vi')"><img src="images/locales/vi.svg" /></b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <b-navbar toggleable="md" type="dark" variant="info">
      <b-navbar-nav>
        <b-nav-item>
          NETWORK VOLUME (24H)<br />
          {{ networkVolume }}
        </b-nav-item>
        <b-nav-item>
          NETWORK FEE (24H)<br />
          {{ networkFee }}
        </b-nav-item>
        <b-nav-item>
          TRADES (24H)<br />
          {{ tradeCount }}
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <div class="container-fluid">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

import AppRequest from '../../core/request/AppRequest';
import util from '../../core/helper/util';

export default {
  data() {
    return {
      networkVolume: '',
      networkFee: '',
      tradeCount: ''
    };
  },

  methods: {
    changeLanguage (locale) {
      localStorage.setItem('locale', locale);
      window.i18n.locale = locale;
    },
    refresh () {
      AppRequest.getStats24h().then((stats) => {
        this.networkVolume = stats.networkVolume;
        this.networkFee = stats.networkFee;
        this.tradeCount = stats.tradeCount;
      });
    }
  },

  mounted () {
    this.refresh();
  }
}
</script>

<style scoped>

</style>
