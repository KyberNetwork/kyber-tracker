<template>
  <div id="wrapper">
    <div id="page-content">
      <b-navbar toggleable="md" type="dark" class="heading-bar  col-12 col-sm-12">
        <div class="no-padding d-flex justify-content-between col-12 col-sm-12" v-click-outside="onClickOutside">
          <ul ref="headingSum" class="heading-summary p-relative" @click="clickHeading()">
            <li id="network-volume">
              <span class="light-text">{{ $t('status_bar.network_volume') }}</span><br />
              <span class="topbar-value">{{ networkVolume }}</span>
              <img v-if="this.indexShowmore == 0" class="show-more" src="/images/drop-down.svg"/>
            </li>
            <li id="knc-price">
              <span class="light-text">{{ $t('status_bar.knc_price') }}</span><br />
              <span class="topbar-value">
                {{ kncPrice }} 
                </span>
              <span class="topbar-value" :class="getPriceChangeClass(this.kncPriceChange24h)">({{ formatedKNCPriceChange24h }})</span>
              <img v-if="this.indexShowmore == 1" class="show-more" src="/images/drop-down.svg"/>
            </li>

            <li id="eth-price">
              <span class="light-text">{{ $t('status_bar.eth_price') }}</span><br />
              <span class="topbar-value" >{{ ethPrice }} </span>
              <span class="topbar-value" :class="getPriceChangeClass(this.ethPriceChange24h)">({{ formatedETHPriceChange24h }})</span>
              <img v-if="this.indexShowmore == 2" class="show-more" src="/images/drop-down.svg"/>
            </li>

            <li id="fee-to-burn">
              <span class="light-text">{{ $t('status_bar.collected_fees') }}</span><br />
              <span class="topbar-value">{{ collectedFees }}</span>
              <img v-if="this.indexShowmore == 3" class="show-more" src="/images/drop-down.svg"/>
            </li>
                

            <li id="total-burn-fee">
              <span class="light-text">{{ $t('status_bar.fees_burned') }}</span><br />
              <span class="topbar-value">{{ totalBurnedFee }}</span>
            </li> 

            <li>
              <select @change="onChangeOfficial">
                <option value="all" :selected="!isOfficial()">All</option>
                <option value="official" :selected="isOfficial()">Official Tokens</option>
              </select>
            </li>

            <!-- <i class="fas fa-caret-down fa-2x show-more"></i> -->
            <!-- <img class="show-more" src="/images/drop-down.svg"/> -->
            

            <!-- <li>
              <span class="light-text">{{ $t('status_bar.trades') }}</span><br />
              <span class="topbar-value">{{ tradeCount }}</span>
            </li> 
            <li class="network-fee" >
                
            </li>
             -->
          </ul>

          <div ref="searchComponent" class="p-relative cursor-pointer d-flex justify-content-end pt-2 pb-2 pr-3" >
            <vue-autosuggest
              class="ajsbd"
              ref="seatchInputRef"
              :suggestions="[{
                data: [...this.addressesMetamask, ...this.searchData]
              }]"
              @keyup.enter="doSearch"
              @focus="onfocus"
              :getSuggestionValue="getSuggestionValue"
              :renderSuggestion="renderSuggestion"
              :onSelected="onSelected"
              :inputProps="{
                id:'autosuggest__input', 
                onInputChange: this.onInputChange, 
                placeholder:$t('common.searchbox_placeholder'),
                autocomplete: 'off'
              }"
            />
            <b-input-group-append class="btn-search">
              <b-btn type="submit" class="search-button" variant="default cursor-pointer" @click="doSearch()">
                <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="26px" width="26px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
              </b-btn>
            </b-input-group-append>
          </div>
        </div>

        
        

        

      </b-navbar>

      <b-navbar toggleable="sm" type="dark" class="second-heading-bar d-flex justify-content-between">
        <div>
          <!-- <b-navbar-toggle target="nav_collapse"></b-navbar-toggle> -->
          <!-- <b-collapse is-nav id="nav_collapse"> -->
            <b-navbar-nav>
              <b-nav-item class="navbar tracker-logo">
                <router-link to="/">
                  <img class="kyber-logo" src="/images/logo.svg" />
                  <!-- <span class="inline-logo"></span> -->
                  <!-- <img src="/images/network.svg" /> -->
                  <!-- <i class="fas fa-signal icon-second-header"></i> -->
                  <span class="entypo-chart-bar icon-second-heade"></span>
                  <span class="pl-1">{{ $t('navigator.volume') }}</span>
                  
                </router-link>
              </b-nav-item>
              <b-nav-item class="navbar">
                <router-link to="/trades">
                <!-- <img src="/images/trade.svg" /> -->
                <!-- <i class="fas fa-exchange-alt icon-second-header"></i> -->
                <span class="entypo-switch icon-second-heade"></span>
                <span class="pl-1">{{ $t('navigator.trade_history') }}</span>
                </router-link>
              </b-nav-item>
              <b-nav-item class="navbar">
                <router-link to="/tokens">
                <!-- <img src="/images/token.svg" /> -->
                <!-- <i class="fas fa-database icon-second-header"></i> -->
                <span class="entypo-database icon-second-heade"></span>
                <span class="pl-1">{{ $t('navigator.tokens') }}</span>
                </router-link>
              </b-nav-item>
            </b-navbar-nav>
          <!-- </b-collapse> -->

          <!-- <b-navbar-nav class="ml-auto search-box-container">
            <form action="javasript:void(0)" class="no-margin no-padding search-form">
              <b-nav-item class="no-padding-right">
                <b-input-group size="sm"> -->
                  <!-- <b-form-input v-model="searchString" :placeholder="$t('common.searchbox_placeholder')"></b-form-input> -->

                  
                  <!-- <vue-autosuggest
                      ref="seatchInputRef"
                      :suggestions="[{
                        data: [...this.addressesMetamask, ...this.searchData]
                      }]"
                      @keyup.enter="doSearch"
                      @focus="onfocus"
                      :getSuggestionValue="getSuggestionValue"
                      :renderSuggestion="renderSuggestion"
                      :onSelected="onSelected"
                      :inputProps="{
                        id:'autosuggest__input', 
                        onInputChange: this.onInputChange, 
                        placeholder:$t('common.searchbox_placeholder'),
                        autocomplete: 'off'
                      }"
                  /> -->
                  
                  <!-- <b-input-group-append>
                    <b-btn type="submit" class="search-button" variant="default cursor-pointer" @click="doSearch()">
                      <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="26px" width="26px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                    </b-btn>
                  </b-input-group-append> -->
                  
                <!-- </b-input-group>
              </b-nav-item>
            </form>
          </b-navbar-nav> -->
        </div>
        <a href="https://kyber.network/swap" :title="$t('navigator.go_to_exchange')" class="go-exchange" target="_blank">
          <button type="button" class="btn btn-default pointer">
            <span class="entypo-right-circled icon-go"></span>
            <span class="text-go">{{ $t('navigator.go_to_exchange') }}</span>
          </button>
        </a>
      </b-navbar>

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
            Copyright 2018 @ Kyber Network 
          </div>
          <div class="col footer-menu text-right footer-link">
            <div class="d-inline-block">
              <!-- Developed with <span class="emoji"> ❤️ </span> and <span class="emoji"> ☕ </span><br> -->
              <ul class="links">
                <li><a href="https://t.me/KyberTrackerBot" target="_blank"><img class="footer-icon" src="/images/telegram.svg" /></a></li>
                <li><a href="https://twitter.com/KyberNetwork" target="_blank"><img class="footer-icon" src="/images/twitter.svg" /></a></li>
                <li><a href="https://github.com/kyberNetwork/kyber-tracker/" target="_blank"><img class="footer-icon" src="/images/github.svg" /></a></li>
                <li>
                  <b-dropdown class="change-language-button" no-caret right>
                    <template slot="button-content">
                      <span><img class="footer-icon" :src="'images/locales/' + this.getLanguage() + '.svg'" /></span>
                    </template>
                    <b-dropdown-item @click="changeLanguage('en')"><img src="images/locales/en.svg" /> English</b-dropdown-item>
                    <b-dropdown-item @click="changeLanguage('vi')"><img src="images/locales/vi.svg" /> Tiếng Việt</b-dropdown-item>
                    <b-dropdown-item @click="changeLanguage('ko')"><img src="images/locales/ko.svg" /> 한국어</b-dropdown-item>
                    <b-dropdown-item @click="changeLanguage('zh')"><img src="images/locales/zh.svg" /> 中文</b-dropdown-item>
                  </b-dropdown> 
              </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import moment,{ locale } from "moment";
import request from "superagent";
import AppRequest from "../../core/request/AppRequest";
import util from "../../core/helper/util";
import Web3Service from "../../core/helper/web3";
import bowser from "bowser";
import store from "../../core/helper/store";
import ClickOutside from 'vue-click-outside'
import _ from'lodash'

export default {
  data() {
    return {
      networkVolume: "",
      networkFee: "",
      tradeCount: "",
      kncPrice: "",
      kncPriceChange24h: 0,
      ethPrice: "",
      ethPriceChange24h: 0,
      totalBurnedFee: "",
      searchString: "",
      pageTitle: "",
      collectedFees: "",
      searchData: [],
      addressesMetamask: [],
      isOpenFee: false,
      indexShowmore: -1
    };
  },

  // ready: function () {
  //   window.addEventListener('resize', this.handleResize)
  // },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  },

  computed: {
    formatedKNCPriceChange24h() {
      if (this.kncPriceChange24h > 0) {
        return "+" + this.kncPriceChange24h + "%";
      } else {
        return this.kncPriceChange24h + "%";
      }
    },
    formatedETHPriceChange24h() {
      if (this.ethPriceChange24h > 0) {
        return "+" + this.ethPriceChange24h + "%";
      } else {
        return this.ethPriceChange24h + "%";
      }
    }
  },

  methods: {
    changeLanguage(locale) {
      localStorage.setItem("locale", locale);
      window.i18n.locale = locale;
      moment.locale(locale);
      window.location.reload();
    },
    handleResize (event) { 
      let arrayLi = this.$refs.headingSum.children
      if(arrayLi && arrayLi.length){
        this.indexShowmore = [...arrayLi].findIndex( x => x.offsetTop > 60) - 1
      }
    },
    getLanguage() {
      if (
        typeof window.i18n != "undefined" &&
        typeof window.i18n.locale != "undefined"
      ) {
        return window.i18n.locale;
      } else {
        moment.locale("en");
        return "en";
      }
    },

    onToggleFee() {
      this.isOpenFee = !this.isOpenFee;
    },

    getPriceChangeClass(price) {
      if (price === 0) return "";
      return price < 0 ? "neg-value" : "pos-value";
    },
    connectMetaMask(e) {
      if (typeof web3 === "undefined") {
        return;
      }
      var web3Service = new Web3Service(web3);

      let browser = bowser.name;
      if (browser != "Chrome" && browser != "Firefox") {
        if (!web3Service.isTrust()) {
          return;
        }
      }

      try {
        let address = web3.eth.accounts[0]
        this.addressesMetamask = [{
          type: "metamask",
          addr: address
        }];
      } catch (e) {
        console.log(e);
      }
    },

    refresh() {
      AppRequest.getStats24h().then(stats => {
        this.networkVolume = stats.networkVolume;
        this.networkFee = stats.networkFee;
        this.tradeCount = stats.tradeCount;
        this.totalBurnedFee = stats.totalBurnedFee + " KNC";
        this.collectedFees = stats.collectedFees + " KNC";
      });

      request
        .get("https://api.coinmarketcap.com/v1/ticker/kyber-network/")
        .then(res => {
          const data = res.body && res.body[0];
          if (!data || !data.id || !data.price_usd || !data.percent_change_24h) {
            return;
          }

          this.kncPrice = "$" + parseFloat(data.price_usd).toFixed(2);
          this.kncPriceChange24h = parseFloat(data.percent_change_24h);
        });

      request
        .get("https://api.coinmarketcap.com/v1/ticker/ethereum/")
        .then(res => {
          const data = res.body && res.body[0];
          if (!data || !data.id || !data.price_usd || !data.percent_change_24h) {
            return;
          }

          this.ethPrice = "$" + parseFloat(data.price_usd).toFixed(2);
          this.ethPriceChange24h = parseFloat(data.percent_change_24h);
        });
    },
    doSearch() {
      if(this.$mq == 'sm' || this.$mq == 'ml'){
        if(this.$refs.seatchInputRef.$el && this.$refs.seatchInputRef.$el.className.indexOf("search-expand") == -1){
          this.$refs.seatchInputRef.$el.className = "search-expand ml-0"
          this.$refs.headingSum.className = "d-none"
          this.$refs.searchComponent.className += ' col-12'
          return
        } 
      }
      if (!this.searchString) {
        return;
      }
      this.searchString = this.searchString.trim();

      this.$router.push({
        name: "search",
        query: {
          q: this.searchString
        }
      });

      //add search string to suggest input
      let indexItemExist = [...this.addressesMetamask, ...this.searchData]
        .map(item => item.addr)
        .indexOf(this.searchString);

      if (indexItemExist < 0) {
        if (this.isAddress(this.searchString)) {
          this.searchData.unshift({
            type: "address",
            addr: this.searchString
          });
        }
        if (this.isTxHash(this.searchString)) {
          this.searchData.unshift({
            type: "txHash",
            addr: this.searchString
          });
        }
      }
      this.searchData = this.searchData.slice(0, 5);
      store.set("searchData", this.searchData);

      window.setTimeout(() => {
        this.searchString = "";
        this.$refs.seatchInputRef.searchInput = "";
      });
    },

    clickHeading(){
      let headerClass = this.$refs.headingSum.className
      if(headerClass.indexOf("header-expand") !== -1 ){
        this.$refs.headingSum.className = "heading-summary p-relative"
      } else {
        this.$refs.headingSum.className = "heading-summary p-relative header-expand"
      }
      // 
      
    },
    isOfficial(){
      return store.get('official') ? true : false
    },
    onChangeOfficial(e){
      if(e.target.value == 'official') {
        // window.OFFICIAL_TOKENS = true
        store.set('official', true)
      } else {
        store.set('official', false)
      }
    },
    onClickOutside(){
      this.$refs.seatchInputRef.$el.className = ""
      this.$refs.headingSum.className = "heading-summary p-relative"
      this.$refs.searchComponent.className = 'p-relative cursor-pointer d-flex justify-content-end pt-2 pb-2 pr-3'

    },
    isTxHash(hash) {
      return /^0x([A-Fa-f0-9]{64})$/i.test(hash);
    },
    isAddress(address) {
      return /^(0x)?[0-9a-f]{40}$/i.test(address);
    },

    renderSuggestion(suggestion) {
      let logoUrl ;
      switch (suggestion.item.type) {
        case "address":
          logoUrl = <span class="entypo-layout history-logo"></span>
          break;
        case "txHash":
          logoUrl = <span class="entypo-switch history-logo"></span>
          break;
        case "metamask":
          logoUrl = <img class="history-logo" src="/images/metamask-icon.svg" />
          
          break;
      }
      return (
        <div class="suggest-item-wrapper clearfix">
          <div class="logo-suggest-wraper float-left text-center">
            {logoUrl}
          </div>
          
          <span class="suggest-text">
            {suggestion.item.addr.slice(0, 14)} ...{" "}
            {suggestion.item.addr.slice(-12)}{" "}
          </span>
        </div>
      );
    },

    getSuggestionValue(suggestion) {
      return suggestion.item.addr;
    },

    onInputChange(text, oldText) {
      this.searchString = text;
    },

    onSelected(selected) {
      if (selected && selected.item && selected.item.addr) {
        this.searchString = selected.item.addr;
        // document.getElementById("autosuggest__input").focus()
        this.doSearch();
      }
    },

    onfocus() {
      this.connectMetaMask();
    }
  },

  updated: function () {
    this.handleResize()
  },

  beforeDestroy: function () {
    // window.removeEventListener('resize', this.handleResize)
    window.clearInterval(this.intervalResize)
  },

  mounted() {
    this.refresh();
    this.searchData = store.get("searchData") || [];
    window.setInterval(this.refresh, 60000); // Refresh each minute

    this.intervalResize = window.setInterval(this.handleResize, 2000);


    // this.debouncedOnResize = _.debounce(this.handleResize, 500)
    window.addEventListener('resize', () => {
      this.indexShowmore = -1
      this.handleResize()
    })
    this.handleResize()
  },
  directives: {
    ClickOutside
  }
};
</script>

<style lang="scss">
@import "../../../css/app.scss";
.navbar .router-link-exact-active {
  color: #2ed573 !important;
}
</style>
