<template>
  <div v-if="!hideTable">
    <div class="panel panel-default trade-list">

      <button v-if="isShowExport" type="button" class="btn btn-default btn-export pointer" @click="exportData()">{{ $t("trade_list.export_csv") }}</button>
      <!-- trade list for large screen device -->
      <div v-if="($mq == 'xl' || $mq == 'lg')" class="table-responsive-wraper clear pt-10">

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

        <div v-if="isShowTotal" class="pt-3 float-right">Total: {{totalTrade && totalTrade >= 2 ? `${totalTrade} trades` : `${totalTrade} trade`}}</div>

        <table class="table table-responsive table-round table-striped">
          <thead>
            <tr>
              <th class="pl-4" style="width: 20%;">{{ $t("trade_list.date") }}</th>
              <!-- <th  class="pl-4">{{ $t("trade_list.exchange_from") }}</th> -->
              <th class="text-center" style="width: 40%;" >{{ $t("trade_list.tx") }}</th>
              <th class="text-center" style="width: 30%;">{{ $t("trade_list.fee") }} (KNC)</th>
              <th class="text-left" style="width: 10%;">{{ $t("trade_list.view_on") }}</th>
              <!-- <th></th> -->
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <tr v-for="(row, index) in rows" :item="row" :index="index">
              <td class="pl-4">{{ getDateInfo(row) }}</td>
              <td class="text-center font-semi-bold">
                {{ getShortedAddr(row.tx) }}
              </td>
              
              <td class="text-center">
                {{ formatTokenNumber(network.KNC.address, row.collectedFees || row.amount, network.KNC.decimal) }}
              </td>
              
              <td class="text-center pr-4 view-on d-flex" >
                <a :href="getTxEtherscanLink(row.tx)" target="_blank"><img class="etherscan" src="/images/etherscan-logo.png" /></a>
                <a :href="getEnjinxLink(row.tx)" target="_blank"><img class="enj" src="/images/kyber-enj-logo.png" /></a>
              </td>
            </tr>
          </tbody>
        </table>

        <paginate v-if="maxPage > 1 && !isHidePaginate"
          ref="bottomPaginator"
          :page-count="maxPage"
          :initial-page="currentPage"
          :page-range="($mq !== 'md' && $mq !== 'lg') ? 0 : 1"
          :click-handler="clickToPage"
          :prev-text="$t('token_list.prev')"
          :next-text="$t('token_list.next')"
          :container-class="'pagination'"
          :page-class="'page-item'"
          :page-link-class="'page-link'"
          :prev-class="'page-item'"
          :prev-link-class="'page-link'"
          :next-class="'page-item'"
          :next-link-class="'page-link'"
          :active-class="'active'"
          :class="'home-pagination-block full-width-pagination justify-content-center font-semi-bold'"
          :hide-prev-next="true"
          >
          <span slot="prevContent"><span class="color-green prev-last"><img src="/images/ic-arrow-left.svg" class="pb-1"/>  {{$t('token_list.prev')}}</span></span>
          <span slot="nextContent" ><span class="color-green prev-last">{{$t('token_list.next')}}  <img src="/images/ic-arrow-right.svg"  class="pb-1"/></span></span>
        </paginate>

        <div v-if="isLoading || isParentLoading" class="trade-loading"><div></div><div></div><div></div></div>
        <div v-if="rows.length == 0 && !isLoading && !isParentLoading" class="no-row">{{ $t("trade_list.no_row") }}</div>
      </div>




      <!-- small trade list for mobile -->
      <div v-if="$mq !== 'xl' && $mq !== 'lg'" class="mini-trade clear list-group-striped">
        <b-list-group v-for="row in rows">
          <b-list-group-item class="pointer">
            <div class="time-link d-flex justify-content-between">
              <span class="time-ago"> {{ getDateInfo(row) }}</span>
              <span class="link">
                <a :href="getTxEtherscanLink(row.tx)" target="_blank"><img class="etherscan" src="/images/etherscan-logo.png" /></a>
                <a :href="getEnjinxLink(row.tx)" target="_blank"><img class="enj" src="/images/kyber-enj-logo.png" /></a>
              </span>
            </div>
            <div class="trade font-semi-bold pt-2 pb-2" >
              <!-- <span class="source col-5 text-right no-padding">
                {{ formatTokenNumber(row.takerTokenAddress, row.takerTokenAmount, row.takerTokenDecimal) }} 
              
                <span v-if="isOfficial(row.takerTokenAddress)">{{ row.takerTokenSymbol }}</span>
                <span v-else><a class="address-link" :href="getAddressLink(row.takerTokenAddress)" target="_blank">({{getShortedAddr(row.takerTokenAddress)}})</a></span>
              </span>
              <span class="angle col-2 text-center no-padding color-green">
                <span class="entypo-right"></span>
              </span>
              <span class="dest col-5 text-left no-padding">
                {{ formatTokenNumber(row.makerTokenAddress, row.makerTokenAmount,row.makerTokenDecimal) }} 
                <span v-if="isOfficial(row.makerTokenAddress)">{{ row.makerTokenSymbol }}</span>
                <span v-else><a class="address-link" :href="getAddressLink(row.makerTokenAddress)" target="_blank">({{getShortedAddr(row.makerTokenAddress)}})</a></span>
              </span> -->
              Fee: {{ formatTokenNumber(network.KNC.address, row.collectedFees || row.amount, network.KNC.decimal) }} KNC
            </div>
            <div class="rate">
              {{ getShortedAddr(row.tx) }}
            </div>

          </b-list-group-item>
        </b-list-group>

        <paginate v-if="maxPage > 1 && !isHidePaginate"
          ref="bottomPaginator"
          :page-count="maxPage"
          :initial-page="currentPage"
          :page-range="($mq !== 'md' && $mq !== 'lg') ? 0 : 1"
          :click-handler="clickToPage"
          :prev-text="$t('token_list.prev')"
          :next-text="$t('token_list.next')"
          :container-class="'pagination'"
          :page-class="'page-item'"
          :page-link-class="'page-link'"
          :prev-class="'page-item'"
          :prev-link-class="'page-link'"
          :next-class="'page-item'"
          :next-link-class="'page-link'"
          :active-class="'active'"
          :class="'home-pagination-block full-width-pagination justify-content-center font-semi-bold pt-5'"
          :hide-prev-next="true"
          >
          <span slot="prevContent"><span class="color-green prev-last"><img src="/images/ic-arrow-left.svg" class="pb-1"/>  {{$t('token_list.mini-prev')}}</span></span>
          <span slot="nextContent" ><span class="color-green prev-last">{{$t('token_list.next')}}  <img src="/images/ic-arrow-right.svg"  class="pb-1"/></span></span>
        </paginate>

        <div v-if="isLoading || isParentLoading" class="trade-loading"><div></div><div></div><div></div></div>
        <div v-if="rows.length == 0 && !isLoading && !isParentLoading" class="no-row">{{ $t("trade_list.no_row") }}</div>
      </div>

      




      <div v-if="isShowTotal" class="pt-1">Total: {{totalTrade && totalTrade >= 2 ? `${totalTrade} trades` : `${totalTrade} trade`}}</div>
    </div>
  </div>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment,{ locale } from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../request/AppRequest';
import util from '../helper/util';
import network from '../../../../../config/network';
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens
const partners = network.partners

export default {
  model: {
    event: ['fetchDone', 'changeDate']
  },
  props: {
    getFilterTokenAddress: {
      type: Function,
    },
    getFilterReserveAddress: {
      type: Function,
    },

    searchFromDate: {
      type: Date
    },
    searchToDate: {
      type: Date
    },
    title: {
      type: String,
    },
    pageSize: {
      type: Number,
    },
    isHidePartnerCommission: {
      type: Boolean
    },
    isShowTotal: {
      type: Boolean
    },
    isShowExport: {
      type: Boolean
    },
    isParentLoading: {
      type: Boolean,
      default: false
    },
    hideTable: {
      type: Boolean,
      default: false
    },

    searchResult: {
      // type: Function,
      // default: function () {
      //   if (this.rows && this.rows.length) {
      //     return '';
      //   }

      //   return this.$t("trade_list.msg_no_result");
      // }
       type: Object

    },
    partner:{
      type: Boolean
    },
    getSearchResultTitle: {
      type: Function,
      default: () => ""
    },
    fetch: {
      type: Function,
      default: function (isShowLoading) {
        const params = this.getRequestParams();
        if(isShowLoading) {
          this.isLoading = true
          this.rows = [];
        }
        AppRequest
          .getTrades(this.currentPage, this.pageSize || 20, params, (err, res) => {
            const data = res.data;
            const pagination = res.pagination;

            this.rows = data;
            this.maxPage = pagination.maxPage;
            this.totalTrade = pagination.totalCount;

            this.volumeUsd = pagination.volumeUsd;
            this.volumeEth = pagination.volumeEth;
            this.collectedFees = pagination.collectedFees;
            this.isLoading = false
            this.$emit('fetchDone')
          });
      }
    },
    exportData: {
      type: Function
    },
    isHideDatepicker: {
      type: Boolean,
      default: false,
    },
    isHidePaginate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rows: [],
      currentPage: 0,
      maxPage: 0,
      totalTrade: 0,
      volumeUsd: 0,
      volumeEth: 0,
      collectedFees: 0,
      tokens: TOKENS_BY_ADDR,
      network: network,
      highlightedToday: {
        dates: [new Date()]
      },
      isLoading: false,
      disabledFromDates: {
        //
      },
      disabledToDates: {
        //
      }
    };
  },
  methods: {
    getTxEtherscanLink(tx) {
      return network.endpoints.ethScan + "tx/" + tx;
    },
    getAddressLink(addr){
      return network.endpoints.ethScan + "address/" + addr;
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 20, 15)
    },
    isOfficial(address){
      return util.isOfficial(TOKENS_BY_ADDR[address.toLowerCase()])
    },
    getAddressEtherscanLink(tx) {
      if(!util.isAddress(tx)) tx=partners[tx.toLowerCase()]
      return network.endpoints.ethScan + "address/" + tx;
    },
    getTxEtherscanLink(tx) {
      return network.endpoints.ethScan + "tx/" + tx;
    },
    getEnjinxLink(tx){
      return "https://kyber.enjinx.io/eth/transaction/" + tx;
    },
    getRequestParams () {
      let params = {
        address: this.getFilterTokenAddress ? this.getFilterTokenAddress() : undefined,
        reserve: this.getFilterReserveAddress ? this.getFilterReserveAddress() : undefined
      };

      params.fromDate = this.searchFromDate ? moment(this.searchFromDate).startOf('day').unix() : undefined
      params.toDate = this.searchToDate ? moment(this.searchToDate).endOf('day').unix() : undefined

      return params;
    },
    getDateInfo (trade, isShort) {
      return util.getDateInfo(trade.blockTimestamp * 1000, isShort);
    },
    getRate (trade) {
      if (!trade.makerTokenAmount || !trade.takerTokenAmount || !trade.makerTokenDecimal || !trade.takerTokenDecimal) {
        return "";
      }

      const bigMakerTokenAmount = new BigNumber(
        trade.makerTokenAmount.toString()
      )

      const bigTakerTokenAmount = new BigNumber(
        trade.takerTokenAmount.toString()
      )
      

      const makerAmount = bigMakerTokenAmount.div(Math.pow(10, trade.makerTokenDecimal));
      
      const takerAmount = bigTakerTokenAmount.div(Math.pow(10, trade.takerTokenDecimal));

      const bigRate = makerAmount.div(takerAmount)

      if(!bigRate.isZero() && !bigRate.isNaN() && !bigRate.isFinite() && !takerAmount.isZero()){
        return util.roundingNumber(bigRate.toString());
      }

      // const newBigRate = bigMakerTokenAmount.div(bigTakerTokenAmount).times(Math.pow(10, trade.takerTokenDecimal - trade.makerTokenDecimal))
      const newBigRate =( bigMakerTokenAmount.times(Math.pow(10, trade.takerTokenDecimal)) ).div(   bigTakerTokenAmount.times(Math.pow(10, trade.makerTokenDecimal))  )

      return util.roundingNumber(newBigRate.toString());
    },
    formatTokenNumber (address, amount, decimal) {
      const tokenInfo = this.tokens[address.toLowerCase()];
      return util.formatTokenAmount(amount, decimal, 4);
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
    getTradeLink (id) {
      return `/trades/${id}`;
    },
    onClickRow (row) {
      this.$router.push({
        name: 'trade-details',
        params: {
          id: row.id
        },
        query: { 
          partner: this.partner 
        }
      });
    },
    clickToPage (page) {
      this.currentPage = this.$refs.bottomPaginator.selected = page - 1;
      this.fetch(true);
    },

    shouldShowRow (row) {
      let taker = tokens[row.takerTokenAddress].hidden
      let maker = tokens[row.makerTokenAddress].hidden

      return util.shouldShowToken(row.takerTokenAddress) && util.shouldShowToken(row.makerTokenAddress)
     
    },

    resetPagingate(){
      this.currentPage = 0
      if(this.$refs.bottomPaginator){
        this.$refs.bottomPaginator.selected = 0
      }
      
    }
  },

  
  computed: {
    locale () {
      return util.getLocale(util.getBrowserLanguage())
    }
  },
  watch: {
    searchFromDate (val) {
      this.$emit('changeDate')
      this.resetPagingate()
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
        this.fetch(true);
      });
    },
    searchToDate (val) {
      this.$emit('changeDate')
      this.resetPagingate()
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
        this.fetch(true);
      });
    }
  }
};
</script>

<style language="css">
  .vdp-datepicker__calendar .cell.day-header {
    white-space: nowrap;
  }
  .not-found-message {
    width: 100%;
    text-align: center;
  }
</style>>