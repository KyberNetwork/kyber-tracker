<template>
  <div class="col-sm-12">
    <trade-list ref="datatable"
      :getFilterTokenSymbol="getFilterTokenSymbol"
      :fetch="requestSearch"
      :isHideDatepicker="false"
      :getSearchResultMessage="getSearchResultMessage"
      :getSearchResultTitle="getSearchResultTitle"
      :searchFromDate="searchFromDate"
      :searchToDate="searchToDate"
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
      tokens: _.keyBy(_.values(network.tokens), 'address')
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
      if(!util.isTxHash(this.$route.query.q) && !util.isAddress(this.$route.query.q)){
        return '<span>'+ this.$t('search_page.invalid_query') +'</span>'
      }

      if(util.isTxHash(this.$route.query.q) && !this.resultCount){
        return '<span>'+ this.$t('search_page.no_txhash_data') +'</span>'
      }
      return '<span>' + this.$t('search_page.result_msg', [this.resultCount]) 
            + '</br>' 
            + this.$t('search_page.total_usd_msg', [this.totalUsd])
            + '</br>' 
            + this.$t('search_page.total_eth_msg', [this.totalEth])
            + '</br>' 
            + this.$t('search_page.total_fee', [this.totalCollectedFees])
            + '</span>'
    },
    requestSearch () {
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const q = this.$route.query.q;
      const fromDate = this.$refs.datatable.searchFromDate ? moment(this.$refs.datatable.searchFromDate).startOf('day').unix() : undefined
      const toDate = this.$refs.datatable.searchToDate ? moment(this.$refs.datatable.searchToDate).endOf('day').unix() : undefined

      AppRequest
          .searchTrades(q, currentPage, pageSize, fromDate, toDate, (err, res) => {
            const data = res.data;
            if (data && data.id > 0) {
              this.$router.push(`/trades/${data.id}`);
              return;
            }

            const pagination = res.pagination;
            this.$refs.datatable.rows = data;

            if (pagination) {
              this.resultCount = pagination.totalCount;
              this.totalUsd = new BigNumber(pagination.volumeUsd).toFormat(2)
              this.totalEth = new BigNumber(pagination.volumeEth).toFormat(3);
              this.totalCollectedFees = new BigNumber(pagination.collectedFees.toString()).div(Math.pow(10, 18)).toFormat(3);

              this.$refs.datatable.maxPage = pagination.maxPage;
            } else {
              this.resultCount = 0;
            }
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
