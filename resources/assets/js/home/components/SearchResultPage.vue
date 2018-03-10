<template>
  <div class="col-sm-12">
    <h1>SEARCH RESULT</h1>
    <trade-list ref="datatable"
      :getFilterTokenSymbol="getFilterTokenSymbol"
      :fetch="requestSearch"
      :isHideDatepicker="true"
      :getSearchResultMessage="getSearchResultMessage">
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
    getSearchResultMessage () {
      if (!this.resultCount) {
        return `No result found for ${this.$route.query.q}`;
      }

      return `${this.resultCount} results found for ${this.$route.query.q}`;
    },
    requestSearch () {
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const q = this.$route.query.q;

      AppRequest
          .searchTrades(q, currentPage, pageSize, (err, res) => {
            const data = res.data;
            if (data && data.id > 0) {
              this.$router.push(`/trades/${data.id}`);
              return;
            }

            const pagination = res.pagination;
            this.$refs.datatable.rows = data;

            if (pagination) {
              this.resultCount = pagination.totalCount;
              this.$refs.datatable.maxPage = pagination.maxPage;
            }
          });
    },
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
