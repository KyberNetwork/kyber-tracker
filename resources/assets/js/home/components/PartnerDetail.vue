<template>
  <div class="col-sm-12">
    <trade-list ref="datatable"
      :getFilterTokenSymbol="getFilterTokenSymbol"
      :fetch="requestSearch"
      :exportData="exportData"
      :isHideDatepicker="false"
      :searchResult="getSearchResultMessage()"
      :getSearchResultTitle="getSearchResultTitle"
      :searchFromDate="searchFromDate"
      :searchToDate="searchToDate"
      :isShowExport="true"
      :partner="true"
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
import network from '../../../../../config/network';
const GLOBAL_TOKENS = window["GLOBAL_STATE"].tokens
const partners = network.partners;
// const tokens = network.tokens;
import Chart from 'chart.js';

export default {

  data() {
    return {
      resultCount: 0,
      totalUsd: 0,
      totalEth: 0,
      totalCollectedFees: 0,
      searchFromDate: null,
      searchToDate: null,
      tokens: _.keyBy(_.values(GLOBAL_TOKENS), 'address')
    };
  },

  methods: {
    refresh () {
      if (!this.$refs.datatable) {
        return;
      }
      this.$refs.datatable.fetch();
    },

    getFilterTokenSymbol () {
      return undefined;
    },
    getSearchResultTitle(){
      if(!util.isTxHash(this.$route.query.q) && !util.isAddress(this.$route.query.q)){
        return "<span class='long-address'>" + this.$route.query.q + "</span>";
      }
      if(util.isTxHash(this.$route.query.q) && !this.resultCount){
        return "<span class='long-address'>" + 
              this.$t('search_page.tx_hash') + 
              "<a href=\"https://etherscan.io/tx/"+ this.$route.query.q + "\" target=\"blank\">" + 
              this.$route.query.q + 
              "</a>"
            "</span>";
      }

      return "<span class='long-address'>" + 
              this.$t('search_page.result_title') + 
              "<a href=\"https://etherscan.io/address/"+ this.$route.query.q + "\" target=\"blank\">" + 
              this.$route.query.q + 
              "</a>"
            "</span>";
    },
    getSearchResultMessage () {
      if(!this.$route.params.partnerId || (!util.isAddress(this.$route.params.partnerId) && !partners[this.$route.params.partnerId.toLowerCase()])){

        return {
          isValid: false,
          error: this.$t('search_page.invalid_query'),
          data: null
        }
      }
      return {
        isValid: true,
        error: null,
        data: {
          numberTrades : this.resultCount,
          totalUsd : this.totalUsd,
          totalEth : this.totalEth,
          commission: this.commission,
          totalPartnerFee : this.totalPartnerFee,
          totalCollectedFees: this.totalCollectedFees,
          type: util.isAddress(this.$route.query.q) ? 'address' : 'txHash',
          query: this.$route.params.partnerId
        }
      }
    },
    requestSearch () {
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const partnerId = this.$route.params.partnerId;
      const fromDate = this.$refs.datatable.searchFromDate ? moment(this.$refs.datatable.searchFromDate).startOf('day').unix() : undefined
      const toDate = this.$refs.datatable.searchToDate ? moment(this.$refs.datatable.searchToDate).endOf('day').unix() : undefined

      AppRequest
          .getPartnerDetail(partnerId, currentPage, pageSize, fromDate, toDate, false, (err, res) => {
            const data = res.data;
            if (data && data.id > 0) {
              this.$router.push(`/trades/${data.id}`);
              return;
            }

            const pagination = res.pagination;
            this.$refs.datatable.rows = data;

            if (pagination) {
              this.resultCount = pagination.totalCount;
              this.totalUsd = new BigNumber(pagination.volumeUsd.toString()).toFormat(2)
              this.totalEth = new BigNumber(pagination.volumeEth.toString()).toFormat(3);
              this.commission = new BigNumber(pagination.commission.toString()).div(Math.pow(10, 18)).toFormat(3);
              this.totalCollectedFees = new BigNumber(pagination.collectedFees.toString()).div(Math.pow(10, 18)).toFormat(3);
              this.$refs.datatable.maxPage = pagination.maxPage;
            } else {
              this.resultCount = 0;
            }
          });
    },

    exportData (){
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const partnerId = this.$route.params.partnerId;
      const fromDate = this.$refs.datatable.searchFromDate ? moment(this.$refs.datatable.searchFromDate).startOf('day').unix() : undefined
      const toDate = this.$refs.datatable.searchToDate ? moment(this.$refs.datatable.searchToDate).endOf('day').unix() : undefined

      AppRequest
          .getPartnerDetail(partnerId, currentPage, pageSize, fromDate, toDate, true, (err, res) => {
            const data = res.data;

            var csvHeader = "data:text/csv;charset=utf-8,";
            var notice = "*USD Rates are calculated at transaction time\n"
            var csvContent = ""
            csvContent += data.map(function(d){
              let time = new Date(+d.blockTimestamp * 1000).toUTCString().replace(",",'')
              let fromToken = d.takerTokenSymbol
              let fromAmount = tokens[fromToken] ? (new BigNumber(d.takerTokenAmount.toString())).div(Math.pow(10, tokens[fromToken].decimal)).toString() : 0

              let toToken = d.makerTokenSymbol
              let toAmount = tokens[toToken] ? (new BigNumber(d.makerTokenAmount.toString())).div(Math.pow(10, tokens[toToken].decimal)).toString() : 0
              let commission = d.commission ? new BigNumber(d.commission.toString()).div(Math.pow(10, 18)).toString() : 0
              // let rate = fromAmount.isZero() ? 0 : toAmount.div(fromAmount)
              let usdAmount =  d.volumeUsd ? d.volumeUsd.toString() : 0

              return `${time},${fromToken},${fromAmount},${toToken},${toAmount},${usdAmount},${commission}`
            })
            .join('\n') 
            .replace(/(^\{)|(\}$)/mg, '');
            let csvData = csvHeader + notice + 'Time,From Token,From Amount,To Token,To Amount,USD Value*, Commission(KNC)\n' + csvContent

            // window.open( encodeURI(csvData) );
            let dataCSV = encodeURI(csvData);

            let link = document.createElement('a');
            link.setAttribute('href', dataCSV);
            link.setAttribute('download', new Date().toUTCString() + " " + partnerId);
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
