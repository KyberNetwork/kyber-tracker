<template>
  <div id="wrapper">
    <div id="page-content">
      <b-navbar toggleable="md" type="dark" class="heading-bar  col-12 col-sm-12">
        <div class="no-padding d-flex justify-content-between col-12 col-sm-12">
          <ul ref="headingSum" class="heading-summary p-relative">
            <li id="network-volume">
              <span class="light-text">{{ $t('status_bar.network_volume') }}</span><br />
              <span class="topbar-value">{{ networkVolume }}</span>
            </li>
            <li id="knc-price">
              <span class="light-text">{{ $t('status_bar.knc_price') }}</span><br />
              <span class="topbar-value">
                {{ kncPrice }} 
                </span>
              <span class="topbar-value" :class="getPriceChangeClass(this.kncPriceChange24h)">({{ formatedKNCPriceChange24h }})</span>
            </li>

            <li id="eth-price">
              <span class="light-text">{{ $t('status_bar.eth_price') }}</span><br />
              <span class="topbar-value" >{{ ethPrice }} </span>
              <span class="topbar-value" :class="getPriceChangeClass(this.ethPriceChange24h)">({{ formatedETHPriceChange24h }})</span>
            </li>

            <li id="fee-to-burn">
              <span class="light-text">{{ $t('status_bar.collected_fees') }}</span><br />
              <span class="topbar-value">{{ collectedFee }}</span>
              
            </li>
                

            <li id="total-burn-fee">
              <span class="light-text">{{ $t('status_bar.fees_burned') }}</span><br />
              <span class="topbar-value">{{ totalBurnedFee }}</span>
            </li> 

            <!-- <i class="fas fa-caret-down fa-2x show-more"></i> -->
            <img class="show-more" src="/images/drop-down.svg"/>

            <!-- <li>
              <span class="light-text">{{ $t('status_bar.trades') }}</span><br />
              <span class="topbar-value">{{ tradeCount }}</span>
            </li> 
            <li class="network-fee" >
                
            </li>
             -->
          </ul>

          <div ref="searchComponent" class="p-relative cursor-pointer d-flex justify-content-end pt-2 pb-2 pr-3" v-click-outside="onClickOutside">
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

      <b-navbar toggleable="sm" type="dark" class="second-heading-bar">
        <div>
          <!-- <b-navbar-toggle target="nav_collapse"></b-navbar-toggle> -->
          <!-- <b-collapse is-nav id="nav_collapse"> -->
            <b-navbar-nav>
              <b-nav-item class="navbar tracker-logo">
                <router-link to="/">
                  <img class="kyber-logo" src="/images/logo.png" />
                  <!-- <span class="inline-logo"></span> -->
                  <!-- <img src="/images/network.svg" /> -->
                  <!-- <i class="fas fa-signal icon-second-header"></i> -->
                  <span class="entypo-chart-bar icon-second-heade"></span>
                  {{ $t('navigator.network') }}
                  
                </router-link>
              </b-nav-item>
              <b-nav-item class="navbar">
                <router-link to="/trades">
                <!-- <img src="/images/trade.svg" /> -->
                <!-- <i class="fas fa-exchange-alt icon-second-header"></i> -->
                <span class="entypo-switch icon-second-heade"></span>
                {{ $t('navigator.trades') }}
                </router-link>
              </b-nav-item>
              <b-nav-item class="navbar">
                <router-link to="/tokens">
                <!-- <img src="/images/token.svg" /> -->
                <!-- <i class="fas fa-database icon-second-header"></i> -->
                <span class="entypo-database icon-second-heade"></span>
                {{ $t('navigator.tokens') }}
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
                <li><a href="https://kybernetwork.zendesk.com/hc/en-us" target="_blank"><img class="footer-icon" src="/images/zendesk.svg" /></a></li>
                <li><a href="https://twitter.com/KyberNetwork" target="_blank"><img class="footer-icon" src="/images/twitter.svg" /></a></li>
                <li><a href="https://github.com/kyberNetwork/" target="_blank"><img class="footer-icon" src="/images/github.svg" /></a></li>
                <li>
                  <b-dropdown class="change-language-button" no-caret right>
                    <template slot="button-content">
                      <span><img class="footer-icon" :src="'images/locales/' + this.getLanguage() + '.svg'" /></span>
                    </template>
                    <b-dropdown-item @click="changeLanguage('en')"><img src="images/locales/en.svg" /> English</b-dropdown-item>
                    <b-dropdown-item @click="changeLanguage('vi')"><img src="images/locales/vi.svg" /> Tiếng Việt</b-dropdown-item>
                    <b-dropdown-item @click="changeLanguage('kr')"><img src="images/locales/kr.svg" /> 한국어</b-dropdown-item>
                    <b-dropdown-item @click="changeLanguage('cn')"><img src="images/locales/cn.svg" /> 中文</b-dropdown-item>
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
import moment from "moment";
import request from "superagent";
import AppRequest from "../../core/request/AppRequest";
import util from "../../core/helper/util";
import network from "../../../../../config/network";
import Web3Service from "../../core/helper/web3";
import bowser from "bowser";
import store from "../../core/helper/store";
import ClickOutside from 'vue-click-outside'

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
      feeToBurn: "",
      collectedFee: "",
      breadcrumbsItems: [],
      searchData: [],
      addressesMetamask: [],
      isOpenFee: false
    };
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
    async connectMetaMask(e) {
      if (typeof web3 === "undefined") {
        // console.log(
        //  "Cannot connect to metamask. Please make sure you have metamask installed"
        //);
        return;
      }
      var web3Service = new Web3Service(web3);

      let browser = bowser.name;
      if (browser != "Chrome" && browser != "Firefox") {
        if (!web3Service.isTrust()) {
          // console.log(
          //  `Metamask is not supported on ${browser}, you can use Chrome or Firefox instead.`
          //);
          return;
        }
      }

      try {
        let addresses = await web3Service.getAllAddresses();
        let suggestData = addresses.map(addr => {
          return {
            type: "metamask",
            addr: addr
          };
        });
        this.addressesMetamask = suggestData;
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
        // stats.feeToBurn
        //   ? Math.round(
        //       +stats.totalBurnedFee.replace(",", "") /
        //         +stats.feeToBurn.replace(",", "") *
        //         1000
        //     ) /
        //       10 +
        //     " %"
        //   : 0;
        this.feeToBurn = stats.feeToBurn + " KNC";
        this.collectedFee = stats.collectedFees + " KNC"
        this.collectedFees = stats.collectedFees + " KNC";
      });

      request
        .get("https://api.coinmarketcap.com/v1/ticker/kyber-network/")
        .then(res => {
          const data = res.body[0];
          if (!data || !data.id) {
            return;
          }

          this.kncPrice = "$" + parseFloat(data.price_usd).toFixed(2);
          this.kncPriceChange24h = parseFloat(data.percent_change_24h);
        });

      request
        .get("https://api.coinmarketcap.com/v1/ticker/ethereum/")
        .then(res => {
          const data = res.body[0];
          if (!data || !data.id) {
            return;
          }

          this.ethPrice = "$" + parseFloat(data.price_usd).toFixed(2);
          this.ethPriceChange24h = parseFloat(data.percent_change_24h);
        });
    },
    doSearch() {
      if(this.$mq == 'sm' || this.$mq == 'ml'){
        if(!this.$refs.seatchInputRef.$el.className.includes("search-expand")){
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
      // return suggestion.item.type + " - " + suggestion.item.addr;
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
    },

    loadBreadcumbs(route) {
      const routeName = route.name;

      switch (routeName) {
        case "trade-list":
          this.pageTitle = this.$t("page_title.trade_list");
          this.breadcrumbsItems = [
            {
              text: this.$t("navigator.home"),
              to: { name: "home" }
            },
            {
              text: this.$t("navigator.trades"),
              active: true
            }
          ];
          return;
        case "token-list":
          this.pageTitle = this.$t("page_title.token_list");
          this.breadcrumbsItems = [
            {
              text: this.$t("navigator.home"),
              to: { name: "home" }
            },
            {
              text: this.$t("navigator.tokens"),
              active: true
            }
          ];
          return;
        case "trade-details":
          this.pageTitle = this.$t("page_title.trade_detail");
          this.breadcrumbsItems = [
            {
              text: this.$t("navigator.home"),
              to: { name: "home" }
            },
            {
              text: this.$t("navigator.trades"),
              to: { name: "trade-list" }
            },
            {
              text: this.$t("navigator.trade_detail"),
              active: true
            }
          ];
          return;
        case "token-details":
          const tokenInfo = _.find(_.values(network.tokens), token => {
            return token.address === route.params.tokenAddr;
          });

          this.pageTitle = this.$t("page_title.token_detail");
          if (tokenInfo) {
            const icon = tokenInfo.icon || (tokenInfo.symbol.toLowerCase() + ".svg");
            const path = tokenInfo.hidden ?  
                ("https://raw.githubusercontent.com/KyberNetwork/KyberWallet/master/src/assets/img/tokens/" + icon + "?sanitize=true") :
                ("images/tokens/" + icon);
            this.pageTitle = `<img class="token-logo-detail" src="${
              path
            }" /> <span>${tokenInfo.name}</span> <span class='sub-title'>(${
              tokenInfo.symbol
            })</span>`;
          }

          this.breadcrumbsItems = [
            {
              text: this.$t("navigator.home"),
              to: { name: "home" }
            },
            {
              text: this.$t("navigator.tokens"),
              to: { name: "token-list" }
            },
            {
              text: this.$t("navigator.token_detail"),
              active: true
            }
          ];
          return;
        case "search":
          this.pageTitle = this.$t("page_title.search");
          this.breadcrumbsItems = [
            {
              text: this.$t("navigator.home"),
              to: { name: "home" }
            },
            {
              text: this.$t("navigator.search"),
              active: true
            }
          ];
          return;
        case "home":
          this.pageTitle = "";
          this.breadcrumbsItems = [];
          return;
        default:
          this.pageTitle = "";
          this.breadcrumbsItems = [];
          return;
      }
    }
  },

  watch: {
    $route(toVal, fromVal) {
      this.loadBreadcumbs(toVal);
    }
  },

  mounted() {
    // this.customizeMoment();
    this.refresh();
    this.connectMetaMask();
    this.loadBreadcumbs(this.$route);
    this.searchData = store.get("searchData") || [];
    window.setInterval(this.refresh, 60000); // Refresh each minute
  },
  directives: {
    ClickOutside
  }
};
</script>

<style lang="scss">
@import "../../../css/app.scss";
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
  color: #2ed573 !important;
}
</style>
