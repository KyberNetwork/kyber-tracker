<template>
  <div class="col-sm-12">
    <div class="wallet-detail-title panel-heading pb-20">
    <span class="no-margin panel-title">{{ getReservename(getFilterReserveAddress())}} </span>
    <div v-if="!isHideDatepicker" class="datepicker-container pb-16">
      <!-- <span>{{ $t('filter.from') }}</span> -->
      <datepicker v-model="searchFromDate" name="searchFromDate" class="calendar-icon from"
        :language="locale"
        :format="formatDatepicker"
        :clear-button="true"
        :highlighted="highlightedToday"
        :disabled="disabledFromDates"
        :placeholder="$t('filter.from')"
        >
      </datepicker>
      <!-- <span>{{ $t('filter.to') }}</span> -->
      <datepicker v-model="searchToDate" name="searchToDate" class="calendar-icon to ml-2"
        :language="locale"
        :format="formatDatepicker"
        :clear-button="true"
        :highlighted="highlightedToday"
        :disabled="disabledToDates"
        :placeholder="$t('filter.to')"
        >
      </datepicker>
    </div>
  </div>

  <!-- address detail ################## -->
  <div class="reserve-detail-container mb-2">
    <div class="reserve-address-title">
      <span>{{$t('wallet_detail.address')}}:</span>
      <span>
        <a class="wallet-address" target="_blank" :href="getAddressEtherscanLink(getFilterReserveAddress())">{{ getFilterReserveAddress() }}</a>
        <button v-if="isMaintenance" type="button" class="btn btn-outline-warning btn-sm">Maintenance</button>
      </span>
      
    </div>

    <div class="reserve-body row">


      <div class="reserve-stat reserve-column col-xl-5 mr-xl-2">
        <div class="reserve-value vdivide border-bottom">
          <div class="row pb-3">
            <div class="col">
              <div class="pb-2">
                {{$t('wallet_detail.trades')}}
              </div>
              <div class="font-semi-bold">
                <span v-if="!isLoading">{{totalTrade}}</span>
                <img v-else src="/images/waiting.svg" />
              </div>
              
            </div>
            <!-- <div class="col">
              <div class="pb-2">
                {{$t('wallet_detail.knc_collected')}}
              </div>
              <div class="font-semi-bold">
                <span v-if="!isLoading">{{formatTokenAmount(collectedFees.toString(), 18)}}</span>
                <img v-else src="/images/waiting.svg" />
                KNC
              </div>
            </div> -->
          </div>
        </div>
        

        <div class="reserve-value vdivide">
          <div class="reserve-title pb-2">
              {{$t('wallet_detail.total_trading_volune')}}
            </div>
            
            <div class="row pb-3">
              <div class="col">
                <!-- <div>
                  {{$t('wallet_detail.value_in_eth')}}
                </div> -->
                <div class="font-semi-bold">
                  <span v-if="!isLoading">{{round(volumeEth)}}</span>
                  <img v-else src="/images/waiting.svg" />
                  ETH
                </div>
                
                
              </div>
              <div class="col ">
                <!-- <div>
                  {{$t('wallet_detail.value_in_usd')}}*
                </div> -->
                <div class="font-semi-bold">
                  <span v-if="!isLoading">{{round(volumeUsd)}}</span>
                  <img v-else src="/images/waiting.svg" />
                  USD*
                </div>
              </div>
            </div>
            <div class="note">
              *{{$t('wallet_detail.notice')}}
            </div>
        </div>
      </div>

      
     

      <div class="reserve-tokens-list reserve-column vdivide no-border col ml-xl-2" v-if="tokenAprData">
        <div class="reserve-value">
          <div class="reserve-title pb-4">
            {{$t('wallet_detail.tokens_balance')}} {{reserveTokens && reserveTokens.length ? `(${reserveTokens.length})` : ''}}
          </div>
          <div v-if="isLoading">
            <img src="/images/waiting.svg" />
          </div>
          <div class="row">
            <div class="col-12">
              <div class="row pb-2">
                <div class="col-4 ">
                  <a class="address-link" :href="getAddressEtherscanLink(tokenAprData.address)" target="_blank">{{ tokenAprData.symbol }}</a>
                </div>
                <div class="col-8 font-semi-bold">
                 {{tokenAprAmount}} 
                 <!-- <span v-if="tokenAprUSDValue">({{tokenAprUSDValue}} USD)</span> -->
                 <div v-if="tokenAprETHValue && tokenAprUSDValue">(~{{tokenAprETHValue}} ETH / {{tokenAprUSDValue}} USD)</div>
                </div>
              </div>

              <div class="row pb-2" v-if="balanceEth">
                <div class="col-4 ">
                  <a class="address-link" :href="getAddressEtherscanLink(ethAddress)" target="_blank">ETH</a>
                </div>
                <div class="col-8 font-semi-bold">
                 {{balanceEth}} 
                </div>
              </div>
            </div>
            <!-- <div v-if="!isOpenlLoadmore && isShowLoadmore" class="gradient-trans row"></div> -->
          </div>
          
          <label v-if="isShowLoadmore" class="row d-flex justify-content-center mt-5">
            <button type="button" class="btn btn-light" @click="toggleLoadMore()">{{getLoadmoreTitle()}}</button>
          </label>  


        </div>

        
      </div>

      


    </div>

  </div>


  

  <div class="wallet-detail-title panel-heading pt-56 pb-16">
    <span class="no-margin panel-title">{{$t('wallet_detail.history')}} </span>
  </div>
    <mini-trade-list ref="datatable"
      :getFilterTokenAddress="getFilterTokenAddress"
      :getFilterReserveAddress="getFilterReserveAddress"
      :exportData="exportData"
      :isHideDatepicker="true"
      :searchFromDate="searchFromDate"
      :searchToDate="searchToDate"
      :isShowExport="false"
      v-on:fetchDone="reloadView"
      :isParentLoading="isLoading"
      :isReserveTrade="true"
    >
    </mini-trade-list>
  </div>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment,{ locale } from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../../core/request/AppRequest';
import util from '../../core/helper/util';
import network from '../../../../../config/network';
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens
import Chart from 'chart.js';
// const tokens = network.tokens;

const reserveName = _.transform(network.reserves, (r, v, k) => {r[k.toLowerCase()] = v})

export default {

  data() {
    return {
      resultCount: 0,
      totalUsd: 0,
      totalEth: 0,
      totalCollectedFees: 0,
      searchFromDate: null,
      searchToDate: null,
      tokens: TOKENS_BY_ADDR,
      ethAddress: network.ETH.address,

      totalTrade: 0,
      volumeEth: 0,
      volumeUsd: 0,
      collectedFees: 0,

      reserveTokens: [],
      burnedFee: 0,
      burnFee: 0,
      walletFee: 0,

      isShowLoadmore: false,
      isOpenlLoadmore: false,
      isMaintenance: false,
      tokenAprAmount: 0,
      tokenAprUSDValue: 0,
      tokenAprETHValue: 0,
      balanceEth: 0,
      tokenAprData: null,
      isLoading: true,
      highlightedToday: {
        dates: [new Date()]
      },
      disabledFromDates: {
        //
      },
      disabledToDates: {
        //
      }
    };
  },

  methods: {
    refresh () {
      if (!this.$refs.datatable) {
        return;
      }
      this.$refs.datatable.fetch();
      this.fetchReserveDetail()
      this.fetchAprStatus()
    },
    getFilterReserveAddress() {
      return this.$route.params.reserveAddr;
    },
    getFilterTokenAddress(){
      return undefined
    },
    isOfficial(address, symbol){
      if(symbol) return true
      return util.isOfficial(TOKENS_BY_ADDR[address.toLowerCase()])
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 4, 4)
    },
    getReservename(addr){
      const reserveData = reserveName[addr.toLowerCase()]
      if(!reserveData) return this.$t('wallet_detail.reserve_detail')

      return reserveName[addr.toLowerCase()][0]
    },
    getAddressEtherscanLink(address) {
      return network.endpoints.ethScan + "address/" + address;
    },
    round(num){
      return util.roundingNumber(num)
    },
    formatTokenAmount(amount, decimal){
      return util.formatTokenAmount(amount, decimal);
    },
    reloadView(){
      this.totalTrade = this.$refs.datatable ? this.$refs.datatable.totalTrade : 0
      this.volumeEth = this.$refs.datatable ? this.$refs.datatable.volumeEth : 0
      this.volumeUsd = this.$refs.datatable ? this.$refs.datatable.volumeUsd : 0
      // this.collectedFees = this.$refs.datatable ? this.$refs.datatable.collectedFees : 0
    },

    toggleLoadMore(){
      this.isOpenlLoadmore = !this.isOpenlLoadmore
    },
    getLoadmoreTitle(){
      return this.isOpenlLoadmore ? 'View less' : 'See all tokens'
    },

    onchangeDate(){
      this.isLoading = true
      this.reserveTokens = []
      
      this.fetchReserveDetail()
    },

    // exportData (){
    //   const currentPage = this.$refs.datatable.currentPage;
    //   const pageSize = this.$refs.datatable.pageSize || 20;
    //   const q = this.$route.query.q;
    //   const fromDate = this.$refs.datatable.searchFromDate ? moment(this.$refs.datatable.searchFromDate).startOf('day').unix() : undefined
    //   const toDate = this.$refs.datatable.searchToDate ? moment(this.$refs.datatable.searchToDate).endOf('day').unix() : undefined

    //   AppRequest
    //     .searchTrades(q, currentPage, pageSize, fromDate, toDate, true, (err, res) => {
    //       const data = res.data;
    //       var csvHeader = "data:text/csv;charset=utf-8,";
    //       var notice = "*USD Rates are calculated at transaction time\n"
    //       var csvContent = ""
    //       csvContent += data.map(function(d){
    //         let time = new Date(+d.blockTimestamp * 1000).toUTCString().replace(",",'')
    //         let fromToken = d.takerTokenAddress
    //         let fromAmount = TOKENS_BY_ADDR[fromToken] ? (new BigNumber(d.takerTokenAmount.toString())).div(Math.pow(10, TOKENS_BY_ADDR[fromToken].decimal)).toString() : 0

    //         let toToken = d.makerTokenAddress
    //         let toAmount = TOKENS_BY_ADDR[toToken] ? (new BigNumber(d.makerTokenAmount.toString())).div(Math.pow(10, TOKENS_BY_ADDR[toToken].decimal)).toString() : 0

    //         // let rate = fromAmount.isZero() ? 0 : toAmount.div(fromAmount)
    //         let usdAmount =  d.volumeUsd ? d.volumeUsd.toString() : 0

    //         return `${time},${fromToken},${fromAmount},${toToken},${toAmount},${usdAmount}`
    //       })
    //       .join('\n') 
    //       .replace(/(^\{)|(\}$)/mg, '');
    //       let csvData = csvHeader + notice + 'Time,From Token,From Amount,To Token,To Amount,USD Value*\n' + csvContent

    //       // window.open( encodeURI(csvData) );
    //       let dataCSV = encodeURI(csvData);

    //       let link = document.createElement('a');
    //       link.href = dataCSV
    //       link.target = '_blank'
    //       link.download = new Date().toUTCString() + " " + q + '.csv'
          
    //       document.body.appendChild(link);
    //       link.click();
    //     });
    // },

    fetchReserveDetail(){
      let fromDate = this.searchFromDate ? moment(this.searchFromDate).startOf('day').unix() : undefined
      let toDate = this.searchToDate ? moment(this.searchToDate).endOf('day').unix() : undefined
       AppRequest.getReserveDetail({reserveAddr: this.getFilterReserveAddress(), fromDate: fromDate, toDate: toDate}).then(data => {
          this.reserveTokens = data.tokens
          this.burnedFee = data.burned

          const collectedFeeDest = data.collectedFee.dest
          const collectedFeeSource = data.collectedFee.source

          const tolalFeeToBurn = new BigNumber(collectedFeeDest.burnFee.toString()).plus(new BigNumber(collectedFeeSource.burnFee.toString()))
          const tolalCollectedFee = new BigNumber(collectedFeeDest.walletFee.toString()).plus(new BigNumber(collectedFeeSource.walletFee.toString()))

          this.collectedFees = tolalFeeToBurn.plus(tolalCollectedFee).toString()
          this.isLoading = false
          // if(data && data.tokens && data.tokens.length > 10) {
          //   this.isShowLoadmore = true
          // }
       })
    },

    fetchAprStatus(){
      AppRequest.getAprStatus().then(data => {
        if(!data || !data.length) return
        const reserveAddress = this.getFilterReserveAddress()
        if(!reserveAddress) return 
        const reserveData = data.find(d => d.reserve.toLowerCase() == reserveAddress.toLowerCase())
        if(!reserveData) return

        let tokenAmount = 0
        let tokenAddress
        if(reserveData.token_a.toLowerCase() == network.ETH.address.toLowerCase()){
          this.balanceEth = util.formatTokenAmount(reserveData.amount_a, 18, 4);
          tokenAmount = reserveData.amount_b
          tokenAddress = reserveData.token_b.toLowerCase()
        } else if (reserveData.token_b.toLowerCase() == network.ETH.address.toLowerCase()){
          this.balanceEth = util.formatTokenAmount(reserveData.amount_b, 18, 4);
          tokenAmount = reserveData.amount_a 
          tokenAddress = reserveData.token_a.toLowerCase()
        }

        if(reserveData.rate_a_b == "0" && reserveData.rate_b_a == 0){
          this.isMaintenance = true
        }

        this.tokenAprData = TOKENS_BY_ADDR[tokenAddress]
        if(!this.tokenAprData) return
        this.tokenAprAmount = util.formatTokenAmount(tokenAmount, this.tokenAprData.decimal, 4);


        AppRequest.getTokenPrices().then(tokenPrices => {
          if(!tokenPrices) return
          
          const foundTokenPrice = tokenPrices[this.tokenAprData.symbol]
          if(!foundTokenPrice) return

          this.tokenAprUSDValue = util.getTokenUsdalue(tokenAmount, foundTokenPrice.price_USD, this.tokenAprData.decimal, 4)
          this.tokenAprETHValue = util.getTokenUsdalue(tokenAmount, foundTokenPrice.price_ETH, this.tokenAprData.decimal, 4)
        })
      })
    },

    formatDatepicker (date) {
      switch (util.getLocale()) {
        case 'vi':
          return moment(date).format('DD/MM/YYYY');
          break;
        case 'ko':
          return moment(date).format('YYYY MM DD');
          break;
      
        default:
          return moment(date).format('DD MMM YYYY');
          break;
      }
    },
  },

  computed: {
    locale () {
      return util.getLocale();
    }
  },

  watch: {
    '$route.query' () {
      this.refresh();
    },
     searchFromDate (val) {
       this.onchangeDate()
       window.setTimeout(() => {
        this.disabledToDates = { to: this.searchFromDate };
        // this.fetch(true);
      });
     },
     searchToDate (val) {
       this.onchangeDate()
       window.setTimeout(() => {
        this.disabledFromDates = { from: this.searchToDate };
        // this.fetch(true);
      });
     }
  },

  mounted() {
    this.refresh();
  }

}
</script>

<style scoped lang="css">
</style>
