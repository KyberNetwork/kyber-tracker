<template>
  <div id="wrapper">
    <div id="page-content" class="content-wrapper">
      <b-nav v-if="$mq !== 'md' && $mq !== 'lg'" class="mobile-header d-flex justify-content-between" v-click-outside="() => onClickOutside(true)">
        <b-nav-item @click="toggleNav()">
          <img class="nav-burger ml-0" src="/images/hamburger.svg" />
        </b-nav-item>
        <b-nav-item>
          <img class="nav-logo ml-0" src="/images/nav-logo.svg" />
        </b-nav-item>
        <b-nav-item class="d-flex h-100 mobile-search-nav">
          <div ref="searchComponent"  v-bind:class="[openSearchInput ? 'search-expand' : 'search-colapse']">
            <b-input-group-append class="btn-mobile-search d-flex justify-content-between">
              <vue-autosuggest
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
                  class: 'mr-0 p-0',
                  onInputChange: this.onInputChange, 
                  placeholder:$t('common.searchbox_placeholder'),
                  autocomplete: 'off'
                }"
              />

              <b-btn type="submit" class="search-button" variant="default cursor-pointer" @click="doSearch()">
                <!-- <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="26px" width="26px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                  -->
                  <img class="search" src="/images/search-icon.svg" />
              </b-btn>
            </b-input-group-append>
          </div>
        </b-nav-item>
      </b-nav>


      <b-navbar toggleable="md" type="dark" class="heading-bar  col-12 col-sm-12 no-padding">
        <div class="heading-wrapper no-padding col-12 col-sm-12 d-flex" v-click-outside="() => onClickOutside()">

          <b-dropdown class="change-official h-100" @shown="clickHeading()" >
            <template slot="button-content">
              {{isAllTokens() ? $t('navigator.all_network') : $t('navigator.verified_reserves_network')}}
            </template>
            <b-dropdown-item @click="onChangeOfficial('all')">
              <span>{{ $t('navigator.all_network') }}</span>
            </b-dropdown-item>
            <b-dropdown-item @click="onChangeOfficial('official')">
              <span>{{ $t('navigator.verified_reserves_network') }}</span>
            </b-dropdown-item>
          </b-dropdown> 


          <!-- <div ref="headingSum" class="heading-summary" @click="clickHeading()">
            

        
          </div> -->

          <carousel :perPage="5" :paginationEnabled="false" :autoplay="true" :autoplayTimeout="4000" :loop="true" ref="headingSum" class="heading-summary">
              <slide >
                <span >{{ $t('status_bar.network_volume') }}</span><br />
                <span class="topbar-value">{{ networkVolume }}</span>
                <!-- <img v-if="this.indexShowmore == 0" class="show-more" src="/images/drop-down.svg"/> -->
              </slide>
              <slide >
                <span >{{ $t('status_bar.knc_price') }}</span><br />
                <span class="topbar-value">
                  {{ kncPrice }} 
                  </span>
                <span class="topbar-value" :class="getPriceChangeClass(this.kncPriceChange24h)">({{ formatedKNCPriceChange24h }})</span>
                <!-- <img v-if="this.indexShowmore == 1" class="show-more" src="/images/drop-down.svg"/> -->
              </slide>

              <slide >
                <span >{{ $t('status_bar.eth_price') }}</span><br />
                <span class="topbar-value" >{{ ethPrice }} </span>
                <span class="topbar-value" :class="getPriceChangeClass(this.ethPriceChange24h)">({{ formatedETHPriceChange24h }})</span>
                <!-- <img v-if="this.indexShowmore == 2" class="show-more" src="/images/drop-down.svg"/> -->
              </slide>

              <slide >
                <span >{{ $t('status_bar.collected_fees') }}</span><br />
                <span class="topbar-value">{{ collectedFees }}</span>
                <!-- <img v-if="this.indexShowmore == 3" class="show-more" src="/images/drop-down.svg"/> -->
              </slide>
                  

              <slide>
                <span >{{ $t('status_bar.fees_burned') }}</span><br />
                <span class="topbar-value">{{ totalBurnedFee }}</span>
              </slide> 

            </carousel>
            
          
          <div v-if="$mq == 'md' || $mq == 'lg'" class="search-and-swap d-flex ml-auto">
            <div ref="searchComponent" :class="openSearchInput ? 'search-expand' : 'search-colapse'"  >
              <b-input-group-append class="btn-search d-flex justify-content-between">
                <vue-autosuggest
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
                    class: 'mr-0 p-0',
                    onInputChange: this.onInputChange, 
                    placeholder:$t('common.searchbox_placeholder'),
                    autocomplete: 'off'
                  }"
                />

                <b-btn type="submit" class="search-button" variant="default cursor-pointer" @click="doSearch()">
                  <!-- <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="26px" width="26px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                    -->
                    <img class="search" src="/images/search-icon.svg" />
                </b-btn>
              </b-input-group-append>
          
            </div>

          
            <a href="https://kyberswap.com" :title="$t('navigator.go_to_exchange')" class="go-exchange d-flex" target="_blank">
                <span class="text-go">{{ $t('navigator.go_to_exchange') }}</span>
            </a>
          </div>
          
        
        </div>

          <!-- <div v-if="this.showColapseBtn" class="colapse-button indicator" @click="colapseHeader()">
            <span  class="entypo-up-open"></span>
          </div> -->
        
        

        

      </b-navbar>


      <div id="mySidenav" class="sidenav">
        <div class="nav-line nav-logo">
            <a href="javascript:void(0)" class="icon-icon-side" @click="toggleNav()">
              <span class=" icon-side h-100">
                <img src="/images/collapse-icon.svg" />
              </span>
              
            </a>
            
            <a v-if="$mq !== 'md' && $mq !== 'lg'"  href="https://kyberswap.com" :title="$t('navigator.go_to_exchange')"  target="_blank" v-bind:class="[isNavOpen ? 'nav-text go-exchange d-flex' : 'nav-text go-exchange d-flex w-0']">
              <span class="text-go">{{ $t('navigator.go_to_exchange') }}</span>
            </a>
            <router-link v-else to="/" v-bind:class="[isNavOpen ? 'nav-text' : 'nav-text w-0']">
              <img  class="nav-logo ml-0" src="/images/nav-logo.svg" />
            </router-link>
        </div>
        
        <router-link to="/" class="nav-line highlight-hover">
          <div class="icon-side">
            <img src="/images/volumn-icon.svg" />
          </div>
          <div  v-bind:class="[isNavOpen ? 'nav-text' : 'nav-text w-0']">{{ $t('navigator.volume') }}</div>
        </router-link>
        <router-link to="/trades" class="nav-line highlight-hover">
          <div class="icon-side">
            <img src="/images/trade-icon.svg" />
          </div>
          
          <div  v-bind:class="[isNavOpen ? 'nav-text' : 'nav-text w-0']">{{ $t('navigator.trade_history') }}</div>
        </router-link>
        <router-link to="/tokens" class="nav-line highlight-hover">
          <div class="icon-side">
            <img class="nav-logo icon-token" src="/images/token-icon.svg" />
          </div>
          
          <div  v-bind:class="[isNavOpen ? 'nav-text' : 'nav-text w-0']">{{ $t('navigator.tokens') }}</div>
        </router-link>
        <router-link to="/reserves" class="nav-line highlight-hover">
          <div class="icon-side">
            <img class="nav-logo icon-reserve" src="/images/reserve-icon.svg" />
          </div>
          
          <div v-bind:class="[isNavOpen ? 'nav-text' : 'nav-text w-0']" >{{ $t('navigator.reserves') }}</div>
        </router-link>
        <div class="nav-line h-100">
          <div class="icon-side h-100">
          </div>
          <div  v-bind:class="[isNavOpen ? 'nav-text' : 'nav-text w-0']"></div>
        </div>
      </div>

      <!-- <b-navbar toggleable="md" type="dark" class="second-heading-bar ">
        <b-navbar-brand to="/">
          <img class="kyber-logo d-inline-block align-top" src="/images/logo.svg" />
        </b-navbar-brand>
        <b-nav-item-dropdown v-if="($mq == 'sm' || $mq == 'ml')"
          id="nav7_ddown"
          :text="this.dropdownText"
          extra-toggle-classes="nav-link-custom"
          left
        >
          <b-nav-item class="navbar" @click="changeTextDropdown($t('navigator.volume'))">
            <router-link to="/">
              <span class="entypo-chart-bar icon-second-header"></span>
              <span class="pl-1">{{ $t('navigator.volume') }}</span>
            </router-link> 
          </b-nav-item>
          <b-nav-item class="navbar" @click="changeTextDropdown($t('navigator.trade_history'))">
            <router-link to="/trades">
            <span class="entypo-switch icon-second-header"></span>
            <span class="pl-1">{{ $t('navigator.trade_history') }}</span>
            </router-link>
          </b-nav-item>
          <b-nav-item class="navbar" @click="changeTextDropdown($t('navigator.tokens'))">
            <router-link to="/tokens">
            <span class="entypo-database icon-second-header"></span>
            <span class="pl-1">{{ $t('navigator.tokens') }}</span>
            </router-link>
          </b-nav-item>
          <b-nav-item class="navbar" @click="changeTextDropdown($t('navigator.reserves'))">
            <router-link to="/reserves" >
            <span class="entypo-users icon-second-header"></span>
            <span class="pl-1">{{ $t('navigator.reserves') }}</span>
            </router-link>
          </b-nav-item>
        </b-nav-item-dropdown>


        <b-nav v-if="($mq !== 'sm' && $mq !== 'ml')" class="expand-navbar">
          <b-nav-item class="navbar">
            <router-link to="/">
              <span class="entypo-chart-bar icon-second-header"></span>
              <span class="pl-1">{{ $t('navigator.volume') }}</span>
              
            </router-link> 
          </b-nav-item>
          <b-nav-item class="navbar">
            <router-link to="/trades">
            <span class="entypo-switch icon-second-header"></span>
            <span class="pl-1">{{ $t('navigator.trade_history') }}</span>
            </router-link>
          </b-nav-item>
          <b-nav-item class="navbar">
            <router-link to="/tokens">
            <span class="entypo-database icon-second-header"></span>
            <span class="pl-1">{{ $t('navigator.tokens') }}</span>
            </router-link>
          </b-nav-item>
          <b-nav-item class="navbar">
            <router-link to="/reserves">
            <span class="entypo-users icon-second-header"></span>
            <span class="pl-1">{{ $t('navigator.reserves') }}</span>
            </router-link>
          </b-nav-item>
        </b-nav>

        <a href="https://kyberswap.com" :title="$t('navigator.go_to_exchange')" class="go-exchange" target="_blank">
          <button type="button" class="btn btn-default pointer">
            <span class="text-go">{{ $t('navigator.go_to_exchange') }}</span>
          </button>
        </a>
      </b-navbar> -->

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
import moment, { locale } from "moment";
import request from "superagent";
import AppRequest from "../../core/request/AppRequest";
import util from "../../core/helper/util";
import Web3Service from "../../core/helper/web3";
import bowser from "bowser";
import store from "../../core/helper/store";
import ClickOutside from "vue-click-outside";
import _ from "lodash";

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
      indexShowmore: -1,
      showColapseBtn: false,
      dropdownText: this.$t("navigator.volume"),
      isNavOpen: true,
      openSearchInput: false
    };
  },

  // ready: function () {
  //   window.addEventListener('resize', this.handleResize)
  // },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.handleResize);
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
    handleResize(event) {
      let arrayLi = this.$refs.headingSum.children;
      if (arrayLi && arrayLi.length) {
        this.indexShowmore = [...arrayLi].findIndex(x => x.offsetTop > 60) - 1;
      }

      if (arrayLi && arrayLi[arrayLi.length - 1].offsetTop > 60) {
        let headerClass = this.$refs.headingSum.className;
        if (headerClass.indexOf("header-expand") > -1) {
          this.showColapseBtn = true;
        } else {
          this.showColapseBtn = false;
        }
      } else {
        this.showColapseBtn = false;
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
        let address = web3.eth.accounts[0];
        this.addressesMetamask = [
          {
            type: "metamask",
            addr: address
          }
        ];
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

        this.kncPrice = "$" + stats.kncPrice;
        this.kncPriceChange24h = stats.kncChange24h;
        this.ethPrice = "$" + stats.ethPrice;
        this.ethPriceChange24h = stats.ethChange24h;
      });

      // request
      //   .get("https://api.coinmarketcap.com/v1/ticker/kyber-network/")
      //   .then(res => {
      //     const data = res.body && res.body[0];
      //     if (!data || !data.id || !data.price_usd || !data.percent_change_24h) {
      //       return;
      //     }
      //     this.kncPrice = "$" + parseFloat(data.price_usd).toFixed(4);
      //     this.kncPriceChange24h = parseFloat(data.percent_change_24h);
      //   });

      // request
      //   .get("https://api.coinmarketcap.com/v1/ticker/ethereum/")
      //   .then(res => {
      //     const data = res.body && res.body[0];
      //     if (!data || !data.id || !data.price_usd || !data.percent_change_24h) {
      //       return;
      //     }

      //     this.ethPrice = "$" + parseFloat(data.price_usd).toFixed(2);
      //     this.ethPriceChange24h = parseFloat(data.percent_change_24h);
      //   });
    },
    doSearch() {
      console.log("@@@@@@@@@@@@@@@@@", this.$refs.searchComponent)
      if(this.$refs.searchComponent && this.$refs.searchComponent.className.indexOf("search-expand") == -1){
        this.openSearchInput = true
        console.log("________________", this.openSearchInput, this.$refs.searchComponent)
        return;
      }
      
      
      if (!this.searchString && this.$refs.searchComponent.className.indexOf("search-expand") > -1) {
        // this.onClickOutside();
        this.openSearchInput = false
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

    changeTextDropdown(text) {
      console.log("============= change dropdown", text);
      this.dropdownText = text;
    },

    clickHeading() {
      // let headerClass = this.$refs.headingSum.className
      // if(headerClass.indexOf("header-expand") !== -1 ){
      //   this.$refs.headingSum.className = "heading-summary p-relative"
      // } else {
      //   this.$refs.headingSum.className = "heading-summary p-relative header-expand"
      // }
      //

      this.$refs.headingSum.className =
        "heading-summary p-relative header-expand";
      this.handleResize();
    },

    colapseHeader() {
      this.$refs.headingSum.className = "heading-summary p-relative";
    },

    isAllTokens() {
      return store.get("allTokens") ? true : false;
    },

    onChangeOfficial(value) {
      if (value == "official") {
        // window.OFFICIAL_TOKENS = true
        store.set("allTokens", false);
      } else {
        store.set("allTokens", true);
      }
      location.reload();
    },

    onClickOutside(isMobile) {
      // this.$refs.seatchInputRef.$el.className = "";
      // this.$refs.headingSum.className = "heading-summary p-relative";
      if(isMobile){
        if(this.$mq !== 'md' && this.$mq !== 'lg'){
          this.openSearchInput = false
        }
      } else {
        if(this.$mq == 'md' || this.$mq == 'lg'){
          this.openSearchInput = false
        }
      }
      // this.handleResize();
    },
    isTxHash(hash) {
      return /^0x([A-Fa-f0-9]{64})$/i.test(hash);
    },
    isAddress(address) {
      return /^(0x)?[0-9a-f]{40}$/i.test(address);
    },

    renderSuggestion(suggestion) {
      let logoUrl;
      switch (suggestion.item.type) {
        case "address":
          logoUrl = <span class="entypo-layout history-logo" />;
          break;
        case "txHash":
          logoUrl = <span class="entypo-switch history-logo" />;
          break;
        case "metamask":
          logoUrl = (
            <img class="history-logo" src="/images/metamask-icon.svg" />
          );

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

    toggleNav() {
      // document.getElementById("mySidenav").style.width = "250px";

      // var myElements = document.querySelectorAll(".nav-text");

      // for (var i = 0; i < myElements.length; i++) {
      //   myElements[i].style.display = "inline-block !important";
      // }
      this.isNavOpen = !this.isNavOpen;
      if (this.isNavOpen) {
        document.getElementById("mySidenav").style.width = "200px";
      } else {
        if(this.$mq !== 'md' && this.$mq !== 'lg'){
          document.getElementById("mySidenav").style.width = "0px";
        } else {
          document.getElementById("mySidenav").style.width = "50px";
        }
        
      }
    }
  },

  updated: function() {
    this.handleResize();
  },

  beforeDestroy: function() {
    // window.removeEventListener('resize', this.handleResize)
    window.clearInterval(this.intervalResize);
  },

  mounted() {
    this.refresh();
    this.searchData = store.get("searchData") || [];
    window.setInterval(this.refresh, 60000); // Refresh each minute

    this.intervalResize = window.setInterval(this.handleResize, 2000);

    switch (this.$route.path) {
      case "/trades":
        this.dropdownText = this.$t("navigator.trade_history");
        break;
      case "/tokens":
        this.dropdownText = this.$t("navigator.tokens");
        break;
      case "/reserves":
        this.dropdownText = this.$t("navigator.reserves");
        break;

      default:
        this.dropdownText = this.$t("navigator.volume");
        break;
    }
    // this.debouncedOnResize = _.debounce(this.handleResize, 500)
    window.addEventListener("resize", () => {
      this.indexShowmore = -1;
      this.showColapseBtn = false;
      this.handleResize();
    });
    this.handleResize();
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
