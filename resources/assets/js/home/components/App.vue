<template>
  <div id="wrapper">
    <div id="page-content" class="content-wrapper">
      <b-nav
        v-if="$mq !== 'md' && $mq !== 'lg'"
        class="mobile-header"
        v-click-outside="() => onClickOutside(true)"
      >
        <b-nav-item href="javascript:void(0)" class="nav-burger-wrapper p-0" id="nav-burger-wrapper">
          <img class="nav-burger pt-4 pr-4 pb-4 pl-4 mt-1" src="/images/hamburger.svg" v-on:click="toggleNav"/>
        </b-nav-item>
        <b-nav-item :class="openSearchInput ? 'transform-0 w-0 nav-item-logo' : 'nav-item-logo'">
          <router-link to="/">
            <img class="nav-logo ml-0" src="/images/nav-logo.svg" />
          </router-link>
        </b-nav-item>
        <b-nav-item class="d-flex h-100 mobile-search-nav">
          <div
            ref="searchComponent"
            v-bind:class="[openSearchInput ? 'search-expand' : 'search-colapse']"
          >
            <b-input-group-append class="btn-mobile-search d-flex justify-content-between">
              <vue-autosuggest
                ref="seatchInputRef"
                :suggestions="[{
                  data: [
                  ...this.addressesMetamask, 
                  ...this.searchData]
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

              <b-btn
                type="submit"
                class="search-button"
                variant="default cursor-pointer"
                @click="doSearch()"
              >
                <!-- <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="26px" width="26px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                -->
                <img class="search" src="/images/search-icon.svg" />
              </b-btn>
            </b-input-group-append>
          </div>
        </b-nav-item>
      </b-nav>

      <b-navbar toggleable="md" type="dark" class="heading-bar col-12 col-sm-12 no-padding">
        <div
          class="heading-wrapper no-padding col-12 col-sm-12 d-flex"
          v-click-outside="() => onClickOutside()"
        >
          <!-- <b-dropdown class="change-official h-100" @shown="clickHeading()" >
            <template slot="button-content">
              {{isAllTokens() ? $t('navigator.all_network') : $t('navigator.verified_reserves_network')}}
            </template>
            <b-dropdown-item @click="onChangeOfficial('all')">
              <span>{{ $t('navigator.all_network') }}</span>
            </b-dropdown-item>
            <b-dropdown-item @click="onChangeOfficial('official')">
              <span>{{ $t('navigator.verified_reserves_network') }}</span>
            </b-dropdown-item>
          </b-dropdown>-->

          <carousel
            ref="headingSum"
            class="heading-summary position-relative"
            @click="moveSumarySlide(true)"
            @mouseover="isHoverSumary = true"
            @mouseleave="isHoverSumary = false"
          >
            <div ref="headingInner" class="heading-inner d-flex position-absolute">
              <div ref="slide_0" class="slide-item">
                <div class="text-nowrap d-block">{{ $t('status_bar.network_volume') }}</div>
                <div class="topbar-value text-nowrap">{{ networkVolume }}</div>
              </div>
              <!-- <div ref="slide_1" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.knc_price') }}</span>
                <div class="d-inline-flex">
                  <span class="topbar-value text-nowrap">
                    {{ kncPrice }} 
                    </span>
                  <span class="topbar-value" :class="getPriceChangeClass(this.kncPriceChange24h)">({{ formatedKNCPriceChange24h }})</span>
                </div>
                
              </div>-->

              <!-- <div ref="slide_2" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.eth_price') }}</span>
                <div class="d-inline-flex">
                  <span class="topbar-value" >{{ ethPrice }} </span>
                  <span class="topbar-value" :class="getPriceChangeClass(this.ethPriceChange24h)">({{ formatedETHPriceChange24h }})</span>
                </div>
              </div>-->

              <!-- <div ref="slide_3" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.knc_collected') }}</span>
                <span class="topbar-value text-nowrap">{{ kncCollected }}</span>
              </div>-->
              <div ref="slide_1" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.fee_collected') }}</span>
                <span class="topbar-value text-nowrap">{{ feeCollected }}</span>
              </div>

              <div v-if="kncSupply" ref="slide_2" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.knc_supply') }}</span>
                <span class="topbar-value text-nowrap">{{ kncSupply }}</span>
              </div>

              <!-- ============================== -->
              <!-- <div v-if="isLoopSumary" class="slide-item">
                <div class="text-nowrap d-block">{{ $t('status_bar.network_volume') }}</div>
                <div class="topbar-value text-nowrap">{{ networkVolume }}</div>
              </div>
              <div v-if="isLoopSumary" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.knc_price') }}</span>
                <div class="d-inline-flex">
                  <span class="topbar-value text-nowrap">{{ kncPrice }}</span>
                  <span
                    class="topbar-value"
                    :class="getPriceChangeClass(this.kncPriceChange24h)"
                  >({{ formatedKNCPriceChange24h }})</span>
                </div>
              </div>

              <div v-if="isLoopSumary" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.eth_price') }}</span>
                <div class="d-inline-flex">
                  <span class="topbar-value">{{ ethPrice }}</span>
                  <span
                    class="topbar-value"
                    :class="getPriceChangeClass(this.ethPriceChange24h)"
                  >({{ formatedETHPriceChange24h }})</span>
                </div>
              </div> -->

              <!-- <div v-if="isLoopSumary" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.knc_collected') }}</span>
                <span class="topbar-value text-nowrap">{{ kncCollected }}</span>
              </div>
              <div v-if="isLoopSumary" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.fee_collected') }}</span>
                <span class="topbar-value text-nowrap">{{ feeCollected }}</span>
              </div>
              <div v-if="isLoopSumary" class="slide-item">
                <span class="text-nowrap d-block">{{ $t('status_bar.fees_burned') }}</span>
                <span class="topbar-value text-nowrap">{{ totalBurnedFee }}</span>
              </div> -->
            </div>
          </carousel>

          <div v-if="$mq == 'md' || $mq == 'lg'" class="search-and-swap d-flex ml-auto">
            <div ref="searchComponent" class="search-expand">
              <b-input-group-append
                class="btn-search d-flex justify-content-between h-100 position-relative"
              >
                <vue-autosuggest
                  ref="seatchInputRef"
                  :suggestions="[{
                    data: [
                    ...this.addressesMetamask, 
                    ...this.searchData]
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

                <b-btn
                  type="submit"
                  class="search-button expand-btn-search"
                  variant="default cursor-pointer"
                  @click="doSearch()"
                >
                  <!-- <svg fill="currentColor" preserveAspectRatio="xMidYMid meet" height="26px" width="26px" viewBox="0 0 40 40" style="vertical-align: middle;"><g><path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                  -->
                  <img class="search" src="/images/search-icon.svg" />
                </b-btn>
              </b-input-group-append>
            </div>

            <a
              href="https://kyberswap.com"
              :title="$t('navigator.go_to_exchange')"
              class="go-exchange d-flex"
              target="_blank"
            >
              <span class="text-go text-nowrap">{{ $t('navigator.go_to_exchange') }}</span>
            </a>
          </div>
        </div>

        <!-- <div v-if="this.showColapseBtn" class="colapse-button indicator" @click="colapseHeader()">
            <span  class="entypo-up-open"></span>
        </div>-->
      </b-navbar>

      <div
        id="mySidenav"
        class="sidenav"
        v-bind:style="getSideNavWidth()"
        v-click-outside="onClickOutsideNav"
      >
        <div class="nav-line nav-logo">
          <a href="javascript:void(0)" class="icon-icon-side h-100" @click="toggleNav()">
            <span class="icon-side h-100 icon-arrow">
              <img
                src="/images/collapse-icon.svg"
                v-if="$mq == 'sm' || $mq == 'ml'"
                v-bind:class="isNavOpen ? '' : 'rolate'"
              />
            </span>
          </a>

          <a
            v-if="$mq !== 'md' && $mq !== 'lg'"
            href="https://kyberswap.com"
            :title="$t('navigator.go_to_exchange')"
            target="_blank"
            v-bind:class="[isNavOpen ? 'nav-text go-exchange d-flex' : 'nav-text go-exchange d-flex w-0']"
          >
            <span class="text-go text-nowrap">{{ $t('navigator.go_to_exchange') }}</span>
          </a>
          <router-link v-else to="/" v-bind:class="[isNavOpen ? 'nav-text ' : 'nav-text w-0']">
            <img class="nav-logo ml-0" src="/images/nav-logo.svg" />
          </router-link>
        </div>

        <router-link to="/" class="nav-line highlight-hover">
          <div class="icon-side">
            <img src="/images/volumn-icon.svg" />
          </div>
          <div
            v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']"
          >{{ $t('navigator.volume') }}</div>
        </router-link>
        <router-link to="/tokens" class="nav-line highlight-hover">
          <div class="icon-side">
            <img class="nav-logo icon-token" src="/images/token-icon.svg" />
          </div>

          <div
            v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']"
          >{{ $t('navigator.tokens') }}</div>
        </router-link>
        <router-link to="/reserves" class="nav-line highlight-hover">
          <div class="icon-side">
            <img class="nav-logo icon-reserve" src="/images/reserve-icon.svg" />
          </div>

          <div
            v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']"
          >{{ $t('navigator.reserves') }}</div>
        </router-link>
        <router-link to="/trades" class="nav-line highlight-hover">
          <div class="icon-side">
            <img src="/images/trade-icon.svg" />
          </div>

          <div
            v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']"
          >{{ $t('navigator.trade_history') }}</div>
        </router-link>
        <!-- <router-link to="/fees" class="nav-line highlight-hover">
          <div class="icon-side">
            <img class="nav-logo icon-reserve" src="/images/fees.svg" />
          </div>
          
          <div v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']" >{{ $t('navigator.fees') }}</div>
        </router-link>-->
        <router-link to="/defi" class="nav-line highlight-hover">
          <div class="icon-side">
            <img class="nav-logo icon-reserve" src="/images/defi.svg" />
          </div>

          <div
            v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']"
          >{{ $t('navigator.defi') }}</div>
        </router-link>
        <router-link to="/updates" class="nav-line highlight-hover">
          <div class="icon-side">
            <img class="nav-logo icon-reserve" src="/images/updates.svg" />
          </div>
          <div
            v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']"
          >{{ $t('navigator.updates') }}</div>
        </router-link>

        <!-- <div class="nav-line">
          <div class="icon-side">
           
          </div>
          <div v-bind:class="[isNavOpen ? 'nav-text font-semi-bold' : 'nav-text w-0 font-semi-bold']" >
              
          </div>
        </div>-->

        <div class="nav-line token-price-container">
          <div class="icon-side h-100"></div>
          <div
            v-bind:class="[isNavOpen ? 'nav-text token-prive-nav d-flex flex-column justify-content-end h-100' : 'nav-text w-0']"
          >
            <div class="slide-item">
              <span class="text-nowrap d-block price-label">{{ $t('status_bar.knc_price') }}</span>
              <div class="d-inline-flex">
                <span class="topbar-value price-value">{{ kncPrice }}</span>
                <span
                  class="topbar-value price-percent"
                  :class="getPriceChangeClass(this.kncPriceChange24h)"
                >({{ formatedKNCPriceChange24h }})</span>
              </div>
            </div>

            <div class="slide-item">
              <span class="text-nowrap d-block price-label">{{ $t('status_bar.eth_price') }}</span>
              <div class="d-inline-flex">
                <span class="topbar-value price-value">{{ ethPrice }}</span>
                <span
                  class="topbar-value price-percent"
                  :class="getPriceChangeClass(this.ethPriceChange24h)"
                >({{ formatedETHPriceChange24h }})</span>
              </div>
            </div>
          </div>
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
      </b-navbar>-->

      <div class="container">
        <div
          v-if="isShowInfoBar && Date.now() > infoBarTimeFrom && Date.now() < infoBarTimeTo"
          class="info-bar d-flex justify-content-center pt-3"
        >
        <div class="alert alert-primary" role="alert">
          <img class="pb-1" src="/images/info-infobar.svg" />
          &nbsp;{{ infoBarMess }} &nbsp; &nbsp;
          <button type="button" class="btn btn-primary btn-sm mr-2">
            <a :href="infoBarUrl" target="_blank">
              {{ $t('info_bar.join') }} 
              <!-- {{ $t('info_bar.check_ranking') }}  -->
            </a>
          </button>
          <a class="cursor-pointer" @click="closeInfoBar()"><img  src="/images/close.svg" /></a>
          
        </div>
          <!-- <div class="btn-group">
            <button type="button" class="btn btn-primary border-right-white">{{ infoBarMess }}</button>
            <button type="button" class="btn btn-primary clearfix">
              <a :href="infoBarUrl" target="_blank">
                {{ $t('info_bar.join') }} &nbsp;
                <img
                  class="search"
                  src="/images/ic-arrow-forward.svg"
                />
              </a>
            </button>

            <button type="button" class="btn btn-primary close-btn" @click="closeInfoBar()">
              <img class="search" src="/images/ic-close.svg" />
            </button>
          </div> -->
          <!-- <span class="label label-primary">KNC trading contest goes live with $5,000 prize to be won&nbsp;<a href="https://kyberswap.com/promo/knc?utm_source=ks-web&amp;utm_medium=notibar&amp;utm_campaign=knc-contest"><button type="button" class="btn btn-primary">Join Now</button></a></span> -->
        </div>
        <div class="row pt-40">
          <router-view></router-view>
        </div>
      </div>
    </div>

    <div id="footer">
      <div class="container footer-container" v-if="$mq == 'sm' || $mq == 'ml'">
        <div class="row m-0">
          <div class="col-12 col-xl-6 pr-xl-4">
            <div class="row d-xl-fex d-xl-flex-column-reverse">
              <div class="col-12 col-md-4">
                <div class="row">
                  <div class="col-5">
                    <div class="row">
                      <div class="col p-0 d-flex justify-content-center">
                        <a href="https://t.me/kybernetwork" target="_blank">
                          <img class="ml-0" src="/images/telegram.svg" />
                        </a>
                      </div>
                      <div class="col p-0 d-flex justify-content-center">
                        <a href="https://twitter.com/KyberNetwork" target="_blank">
                          <img class src="/images/twitter.svg" />
                        </a>
                      </div>
                      <div class="col p-0 pt-md-1 d-flex justify-content-center">
                        <a href="https://discord.com/invite/HdXWUb2pQM" target="_blank">
                          <img class="pt-1" src="/images/dircord.svg" />
                        </a>
                      </div>
                      <div class="col p-0 d-flex justify-content-center">
                        <a href="https://github.com/kybernetwork" target="_blank">
                          <img class src="/images/github.svg" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div class="col-7">
                    <div class="row">
                      <div class="col p-0 d-flex justify-content-center">
                        <a
                          href="https://kyber.network/"
                          target="_blank"
                          class="remove-link-style color-green"
                        >Kyber Network</a>
                      </div>
                      <div class="col p-0 d-flex justify-content-center">
                        <a
                          href="https://kyber.org/"
                          target="_blank"
                          class="remove-link-style color-blue"
                        >Kyber DAO</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-8 d-flex justify-content-center pt-2 pt-md-0">
                <div class="row w-100 justify-content-around justify-content-md-center">
                  <div class="col d-flex justify-content-center p-0">
                    <a
                      href="https://developer.kyber.network/docs/Addresses-Intro/"
                      target="_blank"
                      class="remove-link-style"
                    >Contract data</a>
                  </div>
                  <div class="col p-md-0 d-flex justify-content-center p-0">
                    <a
                      href=" https://developer.kyber.network/tx-diagnose/"
                      target="_blank"
                      class="remove-link-style"
                    >Transaction debugger</a>
                  </div>

                  <!-- <div class="col-3 d-flex justify-content-center p-0">
                    <b-dropdown class="change-language-button" right>
                      <template slot="button-content">
                        <span class="footer-icon">
                          {{this.getLanguageText()}}
                        </span>
                      </template>
                      <b-dropdown-item @click="changeLanguage('en')">
                        <img src="images/locales/en.svg" />
                        English
                      </b-dropdown-item>
                      <b-dropdown-item @click="changeLanguage('vi')">
                        <img src="images/locales/vi.svg" />
                        Tiếng Việt
                      </b-dropdown-item>
                      <b-dropdown-item @click="changeLanguage('ko')">
                        <img src="images/locales/ko.svg" />
                        한국어
                      </b-dropdown-item>
                      <b-dropdown-item @click="changeLanguage('zh')">
                        <img src="images/locales/zh.svg" />
                        中文
                      </b-dropdown-item>
                    </b-dropdown>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-xl-6 pl-xl-4">
            <div class="row">
              <!-- <div class="col-12 col-md-6">
                <div class="row">
                  <div class="col d-flex justify-content-around">
                    <a href="https://kyber.network/" target="_blank" class="remove-link-style color-green">
                      Kyber Network
                    </a>
                  </div>
                  <div class="col d-flex justify-content-around">
                    <a href="https://kyber.org/" target="_blank" class="remove-link-style color-blue">
                      Kyber DAO
                    </a>
                  </div>
                </div>
              </div>-->
              <div class="col-12 col-md-6 text-center">
                <span class="pl-2">Copyright 2020 @ Kyber Network</span>
              </div>
            </div>
          </div>

          <!-- <div class="col-7 footer-menu text-left footer-link" >
            <div class="d-flex flex-row footer-ul " v-bind:class="$mq == 'sm' || $mq == 'ml' ? 'container' : ''">
              <ul class="links">
                <li>
                  <a href="https://t.me/KyberTrackerBot" target="_blank">
                    <img class="footer-icon ml-0" src="/images/telegram.svg" />
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/KyberNetwork" target="_blank">
                    <img class="footer-icon" src="/images/twitter.svg" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/kyberNetwork/kyber-tracker/" target="_blank">
                    <img class="footer-icon" src="/images/dircord.svg" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/kyberNetwork/kyber-tracker/" target="_blank">
                    <img class="footer-icon" src="/images/github.svg" />
                  </a>
                </li>
              </ul>
              <span class="pl-4">
                <a href="https://github.com/kyberNetwork/kyber-tracker/" target="_blank">
                  Contract data
                </a>
              </span>
              <span class="pl-4">
                <a href="https://github.com/kyberNetwork/kyber-tracker/" target="_blank">
                  Transaction debugger
                </a>
              </span>
              <span class="select-lang-box">
                <b-dropdown class="change-language-button" right>
                  <template slot="button-content">
                    <span class="footer-icon">
                      {{this.getLanguageText()}}
                    </span>
                  </template>
                  <b-dropdown-item @click="changeLanguage('en')">
                    <img src="images/locales/en.svg" /> 
                    English
                  </b-dropdown-item>
                  <b-dropdown-item @click="changeLanguage('vi')">
                    <img src="images/locales/vi.svg" /> 
                    Tiếng Việt
                  </b-dropdown-item>
                  <b-dropdown-item @click="changeLanguage('ko')">
                    <img src="images/locales/ko.svg" /> 
                    한국어
                  </b-dropdown-item>
                  <b-dropdown-item @click="changeLanguage('zh')">
                    <img src="images/locales/zh.svg" /> 
                    中文
                  </b-dropdown-item>
                </b-dropdown> 
              </span>
            </div>
          </div>
          <div class="col footer-menu text-right">
             <span class="pl-2">
                Kyber Network
              </span>
              <span class="pl-2">
                Kyber DAO
              </span>
              <span class="pl-2">
                Copyright 2018 @ Kyber Network 
              </span>
          </div>
          -->
        </div>
      </div>

      <div class="container" v-if="$mq !== 'sm' && $mq !== 'ml'">
        <div class="row m-0">
          <div class="col-12 col-xl-6 pr-xl-4">
            <div class="row d-xl-fex d-xl-flex-column-reverse">
              <div class="col-12 col-md-4">
                <div class="row">
                  <div class="col p-md-0 d-flex justify-content-center">
                    <a href="https://t.me/kybernetwork" target="_blank">
                      <img class="footer-icon ml-0" src="/images/telegram.svg" />
                    </a>
                  </div>
                  <div class="col p-md-0 d-flex justify-content-center">
                    <a href="https://twitter.com/KyberNetwork" target="_blank">
                      <img class="footer-icon" src="/images/twitter.svg" />
                    </a>
                  </div>
                  <div class="col p-md-0 pt-md-1 d-flex justify-content-center">
                    <a href="https://discord.com/invite/HdXWUb2pQM" target="_blank">
                      <img class="footer-icon" src="/images/dircord.svg" />
                    </a>
                  </div>
                  <div class="col p-md-0 d-flex justify-content-center">
                    <a href="https://github.com/kybernetwork" target="_blank">
                      <img class="footer-icon" src="/images/github.svg" />
                    </a>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-8 d-flex justify-content-center pt-2 pt-md-0">
                <div class="row w-100 justify-content-around justify-content-md-center">
                  <div class="col d-flex justify-content-center p-0">
                    <a
                      href="https://developer.kyber.network/docs/Addresses-Intro/"
                      target="_blank"
                      class="remove-link-style"
                    >Contract data</a>
                  </div>
                  <div class="col p-md-0 d-flex justify-content-center p-0">
                    <a
                      href=" https://developer.kyber.network/tx-diagnose/"
                      target="_blank"
                      class="remove-link-style"
                    >Transaction debugger</a>
                  </div>
                  <!-- <div class="col-3 d-flex justify-content-center p-0">
                    <b-dropdown class="change-language-button" right>
                      <template slot="button-content">
                        <span class="footer-icon">
                          {{this.getLanguageText()}}
                        </span>
                      </template>
                      <b-dropdown-item @click="changeLanguage('en')">
                        <img src="images/locales/en.svg" />
                        English
                      </b-dropdown-item>
                      <b-dropdown-item @click="changeLanguage('vi')">
                        <img src="images/locales/vi.svg" />
                        Tiếng Việt
                      </b-dropdown-item>
                      <b-dropdown-item @click="changeLanguage('ko')">
                        <img src="images/locales/ko.svg" />
                        한국어
                      </b-dropdown-item>
                      <b-dropdown-item @click="changeLanguage('zh')">
                        <img src="images/locales/zh.svg" />
                        中文
                      </b-dropdown-item>
                    </b-dropdown>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-xl-6 pl-xl-4">
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="row">
                  <div class="col d-flex justify-content-around">
                    <a
                      href="https://kyber.network/"
                      target="_blank"
                      class="remove-link-style color-green"
                    >Kyber Network</a>
                  </div>
                  <div class="col d-flex justify-content-around">
                    <a
                      href="https://kyber.org/"
                      target="_blank"
                      class="remove-link-style color-blue"
                    >Kyber DAO</a>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 text-center">
                <span class="pl-2">Copyright 2020 @ Kyber Network</span>
              </div>
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
import BigNumber from 'bignumber.js';
import _ from "lodash";
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens;

const fmt = {
  prefix: '=> ',
  decimalSeparator: ',',
  groupSeparator: '.',
  groupSize: 3,
  secondaryGroupSize: 2
}
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
      kncCollected: "",
      feeCollected: "",
      kncSupply: '',
      searchData: [],
      addressesMetamask: [],
      isOpenFee: false,
      isShowInfoBar: true,
      infoBarUrl:
        "https://krystal.app/campaign.html",
      infoBarMess:
        "Our friends at Krystal are running a 20,000 BUSD trading campaign!",
      infoBarTimeFrom: 1613998800000,
      infoBarTimeTo: 1624201200000,
      indexShowmore: -1,
      showColapseBtn: false,
      dropdownText: this.$t("navigator.volume"),
      isNavOpen: true,
      openSearchInput: false,
      initSideNav: true,
      loopHeading: false,
      slideNavigate: 0,
      intervalSlide: null,
      isLoopSumary: false,
      isHoverSumary: false
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
      // let arrayLi = this.$refs.headingSum.children;
      // if (arrayLi && arrayLi.length) {
      //   this.indexShowmore = [...arrayLi].findIndex(x => x.offsetTop > 60) - 1;
      // }

      // if (arrayLi && arrayLi[arrayLi.length - 1].offsetTop > 60) {
      //   let headerClass = this.$refs.headingSum.className;
      //   if (headerClass.indexOf("header-expand") > -1) {
      //     this.showColapseBtn = true;
      //   } else {
      //     this.showColapseBtn = false;
      //   }
      // } else {
      //   this.showColapseBtn = false;
      // }
      this.isLoopSumary = this.checkLoopSumary();
      if (!this.isLoopSumary) {
        this.$refs.headingInner.style.transform = `translate(-0px)`;
        return;
      }
    },
    closeInfoBar() {
      this.isShowInfoBar = false;
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

    checkLoopSumary() {
      if (
        !this.$refs.slide_0 ||
        !this.$refs.slide_1 ||
        !this.$refs.slide_2 ||
        // !this.$refs.slide_3 ||
        // !this.$refs.slide_4 ||
        !this.$refs.headingSum
      ) {
        return false;
      } else {
        let sumaryWidth = 0;
        for (let i = 0; i <= 2; i++) {
          sumaryWidth = sumaryWidth + this.$refs[`slide_${i}`].clientWidth;
        }
        const headingSumWidth = this.$refs.headingSum.clientWidth;
        if (headingSumWidth < sumaryWidth - 25) return true;
        return false;
      }
    },

    moveSumarySlide(skipHover){
      if (!skipHover && this.isHoverSumary) return;

      if (!this.isLoopSumary) {
        this.$refs.headingInner.style.transform = `translate(-0px)`;
        return;
      }
      this.slideNavigate = this.slideNavigate + 1;
      if (this.slideNavigate >= 3) this.slideNavigate = 0;
      let scrollWidth = 0;
      for (let i = 0; i < this.slideNavigate; i++) {
        scrollWidth = scrollWidth + this.$refs[`slide_${i}`].clientWidth;
      }
      this.$refs.headingInner.style.transform = `translate(-${scrollWidth}px)`;
    },

    intervalSlideSumary() {
      this.intervalSlide = setInterval(this.moveSumarySlide, 5000);
    },

    getLanguageText() {
      moment.locale("en");
      return "English";
      // if (
      //   typeof window.i18n != "undefined" &&
      //   typeof window.i18n.locale != "undefined"
      // ) {
      //   // return window.i18n.locale;
      //   switch (window.i18n.locale) {
      //     case "en":
      //       return "English";
      //     case "vi":
      //       return "Tiếng Việt";
      //     case "ko":
      //       return "한국어";
      //     case "zh":
      //       return "中文";
      //     default:
      //       return "English";
      //   }
      // } else {
      //   moment.locale("en");
      //   return "English";
      // }
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
        if (address) {
          this.addressesMetamask = [
            {
              type: "metamask",
              addr: address
            }
          ];
        }
      } catch (e) {
        console.log(e);
      }
    },

    getSlideItemPerPage() {
      if (this.$mq == "sm" || this.$mq == "ml") {
        return [
          [445, 3],
          [655, 4]
        ];
      } else {
        return [
          [785, 1],
          [925, 2],
          [1075, 3],
          [1240, 4],
          [1500, 5]
        ];
      }
    },

    refresh() {
      AppRequest.getStats24h().then(stats => {
        this.networkVolume = stats.networkVolume;
        this.networkFee = stats.networkFee;
        this.tradeCount = stats.tradeCount;
        this.totalBurnedFee = stats.totalBurnedFee + " KNC";

        this.kncCollected = stats.collectedFees + " KNC";
        this.feeCollected = stats.feeKatalystCollected + " ETH";

        this.kncPrice = "$" + stats.kncPrice;
        this.kncPriceChange24h = stats.kncChange24h;
        this.ethPrice = "$" + stats.ethPrice;
        this.ethPriceChange24h = stats.ethChange24h;
      });

      request
        .get("https://api.coingecko.com/api/v3/coins/kyber-network")
        .then(res => {
          const data = res.body;
          if (!data || !data.market_data) {
            return;
          }
          const marketData = data.market_data
          

          if(marketData.circulating_supply && marketData.total_supply){
            const circulatingSupply = new BigNumber(marketData.circulating_supply.toString()).toFormat(0)
            const totalSuplply =new BigNumber(marketData.total_supply.toString()).toFormat(0)
            this.kncSupply = circulatingSupply + ' / ' + totalSuplply
          }
          
        });

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
      if (
        this.$refs.searchComponent &&
        this.$refs.searchComponent.className.indexOf("search-expand") == -1
      ) {
        this.openSearchInput = true;
        return;
      }

      if (
        !this.searchString &&
        this.$refs.searchComponent.className.indexOf("search-expand") > -1
      ) {
        // this.onClickOutside();
        this.openSearchInput = false;
        return;
      }
      this.searchString = this.searchString.trim();

      const foundToken = Object.values(TOKENS_BY_ADDR).find(
        t =>
          t.symbol && t.symbol.toLowerCase() == this.searchString.toLowerCase()
      );
      if (foundToken) {
        const foundTokenAddr = foundToken.address;
        this.$router.push({
          path: `/tokens/${foundTokenAddr}`
        });

        return;
      }

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
      this.searchData = this.searchData ? this.searchData.slice(0, 5) : [];
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
      return store.get("kyber-official-network") ? false : true;
    },

    onChangeOfficial(value) {
      if (value == "official") {
        // window.OFFICIAL_TOKENS = true
        store.set("kyber-official-network", true);
      } else {
        store.set("kyber-official-network", false);
      }
      location.reload();
    },

    onClickOutside(isMobile) {
      if (isMobile) {
        if (this.$mq !== "md" && this.$mq !== "lg") {
          this.openSearchInput = false;
        }
      } else {
        if (this.$mq == "md" || this.$mq == "lg") {
          this.openSearchInput = false;
        }
      }
    },

    onClickOutsideNav(e) {
      if (!e || !e.path) return;
      let isClickBurger = false;
      e.path.map(el => {
        if (el.id == "nav-burger-wrapper") isClickBurger = true;
      });
      if (isClickBurger) return;
      this.isNavOpen = false;
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
      console.log("__________-----toggleNav", this.initSideNav)
      this.initSideNav = false;

      if (this.$mq !== "md" && this.$mq !== "lg") {
        this.isNavOpen = !this.isNavOpen;
      }
    },

    getSideNavWidth() {
      if (this.$mq == "md" || this.$mq == "lg") {
        this.isNavOpen = true;
        return { width: "200px" };
      }

      if (this.initSideNav) {
        if (this.$mq == "sm") {
          return { width: "0px", zIndex: "0" };
        } else if (this.$mq == "ml") {
          return { width: "50px" };
        }
      }
      if (this.isNavOpen) {
        // document.getElementById("mySidenav").style.width = "200px";
        return { width: "200px" };
      } else {
        if (this.$mq == "sm") {
          return { width: "0px", zIndex: "0" };
        } else if (this.$mq == "ml") {
          return { width: "50px" };
        }
      }
    },
    addPathToMouseEvent() {
      if (!("path" in MouseEvent.prototype))
        Object.defineProperty(MouseEvent.prototype, "path", {
          get: function() {
            var path = [];
            var currentElem = this.target;
            while (currentElem) {
              path.push(currentElem);
              currentElem = currentElem.parentElement;
            }
            if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
              path.push(document);
            if (path.indexOf(window) === -1) path.push(window);
            return path;
          }
        });
    }
  },

  updated: function() {
    this.handleResize();
    // if(this.$mq !== 'md' && this.$mq !== 'lg')  this.isNavOpen = false
  },

  beforeDestroy: function() {
    // window.removeEventListener('resize', this.handleResize)
    window.clearInterval(this.intervalResize);
    window.clearInterval(this.intervalSlide);
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

    setTimeout(() => {
      if (this.$mq !== "md" && this.$mq !== "lg") this.isNavOpen = false;
    }, 1000);

    this.intervalSlideSumary();
    this.addPathToMouseEvent();
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
