<template>
  <div class="col-sm-12">
    <div class="wallet-detail-title panel-heading pb-16">
    <span class="no-margin panel-title">{{$t('wallet_detail.wallet_detail')}} </span>
  </div>

  <!-- address detail ################## -->
  <div class="address-detail-container">
    <div class="wallet-title">
      {{$t('wallet_detail.address')}}:
      <!-- <a class="wallet-address" target="_blank" :href="getAddressEtherscanLink(searchResult.data.query)">{{ searchResult.data.query }}</a> -->
    </div>

    <div class="row wallet-value vdivide">
      <div class="col border-right">
        <div class="value-number">
          {{totalTrade}}
        </div>
        <div class="value-label">
          {{$t('wallet_detail.trades')}}
        </div>
        
      </div>
      <div class="col">
        <div class="value-number">
          {{collectedFees}} KNC
        </div>
        <div class="value-label">
          {{$t('wallet_detail.collected_fees')}}
        </div>
        
      </div>
    </div>


    <div class="wallet-title">
      {{$t('wallet_detail.total_trading_volune')}}
    </div>

    <div class="row wallet-value vdivide">
      <div class="col border-right">
        <div class="value-number">
          {{volumeEth}}
        </div>
        <div class="value-label">
          {{$t('wallet_detail.value_in_eth')}}
        </div>
        
      </div>
      <div class="col">
        <div class="value-number">
          {{volumeUsd}}
        </div>
        <div class="value-label">
          {{$t('wallet_detail.value_in_usd')}}*
        </div>
        
      </div>
    </div>
    <div class="walet-note">
      *{{$t('wallet_detail.notice')}}
    </div>

    <div class="wallet-title">
      {{$t('wallet_detail.current_listing')}}
    </div>
    <div class="row wallet-value vdivide">
      <div class="col border-right">
        <div class="value-number">
          0
        </div>
        <div class="value-label">
          {{$t('wallet_detail.trades')}}
        </div>
        
      </div>
      <div class="col">
        <div class="value-number">
          0 KNC
        </div>
        <div class="value-label">
          0
        </div>
        
      </div>
    </div>

  </div>

  <div class="wallet-detail-title panel-heading pt-56 pb-16">
    <span class="no-margin">{{$t('wallet_detail.history')}} </span>
  </div>


    <trade-list ref="datatable"
      :getFilterTokenAddress="getFilterTokenAddress"
      :getFilterReserveAddress="getFilterReserveAddress"
      :exportData="exportData"
      :isHideDatepicker="false"
      :searchFromDate="searchFromDate"
      :searchToDate="searchToDate"
      :isShowExport="true"
      v-on:fetchDone="reloadView"
    >
    </trade-list>
  </div>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../../core/request/AppRequest';
import util from '../../core/helper/util';
// import network from '../../../../../config/network';
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens
import Chart from 'chart.js';
// const tokens = network.tokens;

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

      totalTrade: 0,
      volumeEth: 0,
      volumeUsd: 0,
      collectedFees: 0
    };
  },

  methods: {
    refresh () {
      if (!this.$refs.datatable) {
        return;
      }
      this.$refs.datatable.fetch();
    },
    getFilterReserveAddress() {
      return this.$route.params.reserveAddr;
    },
    getFilterTokenAddress(){
      return undefined
    },

    reloadView(){
      console.log("++++++++++++++ load done", this.$refs.datatable)
      this.totalTrade = this.$refs.datatable ? this.$refs.datatable.totalTrade : 0
      this.volumeEth = this.$refs.datatable ? this.$refs.datatable.volumeEth : 0,
      this.volumeUsd = this.$refs.datatable ? this.$refs.datatable.volumeUsd : 0,
      this.collectedFees = this.$refs.datatable ? this.$refs.datatable.collectedFees : 0
    },

    exportData (){
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const q = this.$route.query.q;
      const fromDate = this.$refs.datatable.searchFromDate ? moment(this.$refs.datatable.searchFromDate).startOf('day').unix() : undefined
      const toDate = this.$refs.datatable.searchToDate ? moment(this.$refs.datatable.searchToDate).endOf('day').unix() : undefined

      AppRequest
        .searchTrades(q, currentPage, pageSize, fromDate, toDate, true, (err, res) => {
          const data = res.data;
          var csvHeader = "data:text/csv;charset=utf-8,";
          var notice = "*USD Rates are calculated at transaction time\n"
          var csvContent = ""
          csvContent += data.map(function(d){
            let time = new Date(+d.blockTimestamp * 1000).toUTCString().replace(",",'')
            let fromToken = d.takerTokenAddress
            let fromAmount = TOKENS_BY_ADDR[fromToken] ? (new BigNumber(d.takerTokenAmount.toString())).div(Math.pow(10, TOKENS_BY_ADDR[fromToken].decimal)).toString() : 0

            let toToken = d.makerTokenAddress
            let toAmount = TOKENS_BY_ADDR[toToken] ? (new BigNumber(d.makerTokenAmount.toString())).div(Math.pow(10, TOKENS_BY_ADDR[toToken].decimal)).toString() : 0

            // let rate = fromAmount.isZero() ? 0 : toAmount.div(fromAmount)
            let usdAmount =  d.volumeUsd ? d.volumeUsd.toString() : 0

            return `${time},${fromToken},${fromAmount},${toToken},${toAmount},${usdAmount}`
          })
          .join('\n') 
          .replace(/(^\{)|(\}$)/mg, '');
          let csvData = csvHeader + notice + 'Time,From Token,From Amount,To Token,To Amount,USD Value*\n' + csvContent

          // window.open( encodeURI(csvData) );
          let dataCSV = encodeURI(csvData);

          let link = document.createElement('a');
          link.href = dataCSV
          link.target = '_blank'
          link.download = new Date().toUTCString() + " " + q + '.csv'
          
          document.body.appendChild(link);
          link.click();
        });
    }
  },

  computed: {
    locale () {
      return util.getLocale();
    }
  },

  watch: {
    '$route.query' () {
      this.refresh();
    }
  },

  mounted() {
    this.refresh();
  }

}
</script>

<style scoped lang="css">
</style>
