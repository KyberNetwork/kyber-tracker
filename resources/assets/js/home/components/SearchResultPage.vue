<template>
  <div class="col-sm-12">
    <div v-if="!isHideDatepicker" class="datepicker-container">
        <span>{{ $t('filter.from') }}</span>
        <datepicker v-model="searchFromDate" name="searchFromDate" class="calendar-icon"
          :language="locale"
          :format="formatDatepicker"
          :clear-button="true"
          :highlighted="highlightedToday"
          :disabled="disabledFromDates">
        </datepicker>
        <span>{{ $t('filter.to') }}</span>
        <datepicker v-model="searchToDate" name="searchToDate" class="calendar-icon"
          :language="locale"
          :format="formatDatepicker"
          :clear-button="true"
          :highlighted="highlightedToday"
          :disabled="disabledToDates">
        </datepicker>
      </div>

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
  props: {
    isHideDatepicker: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      resultCount: 0,
      totalUsd: 0,
      searchFromDate: null,
      searchToDate: null,
      highlightedToday: {
        dates: [new Date()]
      },
      disabledFromDates: {
        //
      },
      disabledToDates: {
        //
      },
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
      // if (!this.resultCount) {
      //   return this.$t('search_page.no_result_msg', [this.$route.query.q]);
      // }

      return '<span>' + this.$t('search_page.result_msg', [this.resultCount]) 
            + '</br>' 
            + this.$t('search_page.total_usd_msg', [this.totalUsd]) + " USD"
            + '</span>'
      // <div>
      //   <span> {{resultMsg}} </span> 
      //   <br />
      //   <span> {{totalMsg}} USD </span>
      // </div>

      // return this.$t('search_page.result_msg', [this.resultCount]);
    },
    // getTotalUsdMessage (){
    //   return this.$t('search_page.total_usd_msg', [this.totalUsd]);
    // },
    requestSearch () {
      const currentPage = this.$refs.datatable.currentPage;
      const pageSize = this.$refs.datatable.pageSize || 20;
      const q = this.$route.query.q;
      const fromDate = this.searchFromDate ? moment(this.searchFromDate).startOf('day').unix() : undefined
      const toDate = this.searchToDate ? moment(this.searchToDate).endOf('day').unix() : undefined

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
              this.totalUsd = new BigNumber(pagination.makerUsds).plus(new BigNumber(pagination.takerUsds)).toFormat(2)  ;
              this.$refs.datatable.maxPage = pagination.maxPage;
            } else {
              this.resultCount = 0;
            }
          });
    },
    formatDatepicker (date) {
      if (util.getLocale() === 'vi') {
        return moment(date).format('DD/MM/YYYY');
      } else {
        return moment(date).format('DD MMM YYYY');
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
      const fromDate = val ? val.getTime() : 0;
      const toDate = this.searchToDate ? this.searchToDate.getTime() : 0;

      if (fromDate > 0 && toDate > 0 && fromDate > toDate) {
        window.EventBus.$emit('EVENT_COMMON_ERROR', `From-date must be equal or less than to-date`);
        window.setTimeout(() => {
          this.searchFromDate = null;
        });
        return;
      }

      window.setTimeout(() => {
        this.disabledToDates = { to: this.searchFromDate };
        this.refresh();
      });
    },
    searchToDate (val) {
      const toDate = val ? val.getTime() : 0;
      const fromDate = this.searchFromDate ? this.searchFromDate.getTime() : 0;

      if (fromDate > 0 && toDate > 0 && fromDate > toDate) {
        window.EventBus.$emit('EVENT_COMMON_ERROR', `To-date must be equal or greater than from-date`);
        window.setTimeout(() => {
          this.searchToDate = null;
        });
        return;
      }

      window.setTimeout(() => {
        this.disabledFromDates = { from: this.searchToDate };
        this.refresh();
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
