<template>
  <div>
    <div class="panel panel-default trade-list">

      <div v-if="!!title" class="panel-heading pt-56 pb-16">
        <span class="panel-title no-margin"> {{ title }} </span>
      </div>

      <!-- <div v-if="!!getSearchResultTitle()" class="clear p-10">
        <b v-html="getSearchResultTitle()" />
      </div> -->

      <div v-if="searchResult" class="clear pb-10">
        <!-- <div v-html="getSearchResultMessage()" /> -->


        <div v-if="!searchResult.data">
          {{searchResult.error}}
        </div>

        <div v-if="searchResult.isValid && searchResult.data">          

          <div class="wallet-detail-title panel-heading pb-16">
            <span v-if="!partner" class="no-margin panel-title">{{$t('wallet_detail.wallet_detail')}} </span>
            <span v-else class="no-margin panel-title">{{$t('wallet_detail.partner_details')}} </span>
          </div>

          <!-- address detail ################## -->
          <div class="address-detail-container">
            <div class="wallet-title">
              {{$t('wallet_detail.address')}}:
              <a class="wallet-address" target="_blank" :href="getAddressEtherscanLink(searchResult.data.query)">{{ searchResult.data.query }}</a>
            </div>

            <div class="row wallet-value vdivide">
              <div class="col border-right">
                <div class="value-number">
                  {{searchResult.data.numberTrades || '0'}}
                </div>
                <div class="value-label">
                  {{$t('wallet_detail.trades')}}
                </div>
                
              </div>
              <div class="col">
                <div class="value-number">
                  {{searchResult.data.totalCollectedFees || '0'}} KNC
                </div>
                <div class="value-label">
                  {{$t('wallet_detail.collected_fees')}}
                </div>
                
              </div>


              <div v-if="partner" class="col border-left">
                <div class="value-number">
                  {{searchResult.data.commission || '0'}} KNC
                </div>
                <div class="value-label">
                  {{$t('wallet_detail.commission')}}
                </div>
                
              </div>
            </div>


            <div class="wallet-title">
              {{$t('wallet_detail.total_trading_volune')}}
            </div>

            <div class="row wallet-value vdivide">
              <div class="col border-right">
                <div class="value-number">
                  {{searchResult.data.totalEth}}
                </div>
                <div class="value-label">
                  {{$t('wallet_detail.value_in_eth')}}
                </div>
                
              </div>
              <div class="col">
                <div class="value-number">
                  {{searchResult.data.totalUsd}}
                </div>
                <div class="value-label">
                  {{$t('wallet_detail.value_in_usd')}}*
                </div>
                
              </div>
            </div>


            <div class="walet-note">
              *{{$t('wallet_detail.notice')}}
            </div>
          </div>

          <div class="wallet-detail-title panel-heading pt-56 pb-16">
            <span class="no-margin">{{$t('wallet_detail.history')}} </span>
          </div>


        </div>

      </div>

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

      <paginate v-if="maxPage > 1 && !isHidePaginate"
        ref="topPaginator"
        :page-count="maxPage"
        :initial-page="currentPage"
        :page-range="1"
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
        :class="'home-pagination-block full-width-pagination'"
        >
      </paginate>
      
      <button v-if="isShowExport" type="button" class="btn btn-default btn-export pointer" @click="exportData()">{{ $t("trade_list.export_csv") }}</button>
      <!-- trade list for large screen device -->
      <div v-if="($mq == 'md' || $mq == 'lg')" class="table-responsive-wraper clear pt-10">
        <table class="table table-responsive table-round table-striped">
          <thead>
            <tr>
              <th class="pl-4">{{ $t("trade_list.date") }}</th>
              <th colspan="2" class="pl-4">{{ $t("trade_list.exchange_from") }}</th>
              <th class="pl-4">{{ $t("trade_list.exchange_to") }}</th>
              <th v-bind:colspan="partner ? 1 : 2" class="pl-4">{{ $t("trade_list.rate") }}</th>
              <th v-if="partner" colspan="2" class="pl-4" >{{ $t("trade_list.commission") }}</th>
              <!-- <th class="text-right">{{ $t("trade_list.fee_to_burn") }}</th> -->
              <!-- <th></th> -->
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <tr v-for="(row, index) in rows" :item="row" v-if="shouldShowRow(row)" :index="index">
              <td class="pl-4">{{ getDateInfo(row) }}</td>
              <td class="text-left pl-4 font-semi-bold">{{ formatTokenNumber(row.takerTokenSymbol, row.takerTokenAmount) }} {{ row.takerTokenSymbol }}</td>
              <!-- <td class="text-left no-padding-right"></td> -->
              <td><i class="k k-angle right"></i></td>
              <td class="text-left pl-4">{{ formatTokenNumber(row.makerTokenSymbol, row.makerTokenAmount) }} {{ row.makerTokenSymbol }}</td>
              <!-- <td class="text-left"></td> -->
              <td class="text-left pl-4">1 <span class="font-semi-bold">{{ row.takerTokenSymbol }}</span> = {{ getRate(row) }} <span class="font-semi-bold">{{ row.makerTokenSymbol }}</span></td>
              <!-- <td>{{ row.makerTokenSymbol }}</td> -->
              <td v-if="partner" class="text-left pl-4">{{ formatTokenNumber('KNC', row.commission) }} KNC</td>
              <!-- <td class="text-right no-padding-right">{{ formatFeeToBurn('KNC', row.burnFees) }} KNC</td>
              <td><span class="pull-right ml-10">
                <i class="k k-angle right"></i>
              </span></td> -->
              <td class="pointer text-right pr-4" @click="onClickRow(row)">
                <!-- <img src="/images/more.svg" /> -->
                <span class="entypo-dot-3 table-more"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- small trade list for mobile -->
      <div v-if="$mq !== 'md' && $mq !== 'lg'" class=" clear pt-10">
        <table class="table table-hover  table-striped">
          <thead>
            <tr>
              <th class="pl-4">{{ $t("trade_list.date") }}</th>
              <th class="pl-4">{{ $t("trade_list.pair") }}</th>
              <th class="pl-4">{{ $t("trade_list.rate") }}</th>
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <tr v-for="(row, index) in rows" v-if="shouldShowRow(row)" :item="row" :index="index" @click="onClickRow(row)">
              <td class="pl-4">{{ getDateInfo(row, false) }}</td>
              <td class="text-left pl-4 trade-direction">
                <span class="font-semi-bold">{{ formatTokenNumber(row.takerTokenSymbol, row.takerTokenAmount) }} {{ row.takerTokenSymbol }}</span>
                <br/>
                <span class="entypo-down-dir trade-direction-down-symbol"></span>
                {{ formatTokenNumber(row.makerTokenSymbol, row.makerTokenAmount) }} {{ row.makerTokenSymbol }}
              </td>
              <!-- <td class="text-left pl-4"></td> -->
              <td class="text-left pl-4">
                <span class="font-semi-bold">{{ row.takerTokenSymbol }}/{{ row.makerTokenSymbol }}</span>
                <br/>
                {{ getRate(row) }}
              </td>
              
              <!-- <td class="pointer text-right pr-4" @click="onClickRow(row)"><img src="/images/more.svg" /></td> -->
            </tr>
          </tbody>
        </table>
      </div>






      <paginate v-if="maxPage > 1 && !isHidePaginate"
        ref="bottomPaginator"
        :page-count="maxPage"
        :initial-page="currentPage"
        :page-range="1"
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
        :class="'home-pagination-block full-width-pagination'"
        >
      </paginate>

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
const partners = network.partners

const tokens = network.tokens;

export default {
  props: {
    getFilterTokenSymbol: {
      type: Function,
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
    isShowExport: {
      type: Boolean
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
      default: function () {
        const params = this.getRequestParams();
        AppRequest
          .getTrades(this.currentPage, this.pageSize || 20, params, (err, res) => {
            const data = res.data;
            const pagination = res.pagination;
            this.rows = data;
            this.maxPage = pagination.maxPage;
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
      searchFromDate: null,
      searchToDate: null,
      tokens: _.keyBy(_.values(network.tokens), 'symbol'),
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
    getTxEtherscanLink(tx) {
      return network.endpoints.ethScan + "tx/" + tx;
    },
    getAddressEtherscanLink(tx) {
      if(!util.isAddress(tx)) tx=partners[tx.toLowerCase()]
      return network.endpoints.ethScan + "address/" + tx;
    },
    getRequestParams () {
      let params = {
        symbol: this.getFilterTokenSymbol(),
        
      };

      if(!this.isHideDatepicker){
        params.fromDate = this.searchFromDate ? moment(this.searchFromDate).startOf('day').unix() : undefined
        params.toDate = this.searchToDate ? moment(this.searchToDate).endOf('day').unix() : undefined
      }

      return params;
    },
    getDateInfo (trade, isShort) {
      return util.getDateInfo(trade.blockTimestamp * 1000, isShort);
    },
    getRate (trade) {
      const makerToken = this.tokens[trade.makerTokenSymbol];
      const takerToken = this.tokens[trade.takerTokenSymbol];

      const makerAmount = (new BigNumber(trade.makerTokenAmount.toString())).div(Math.pow(10, makerToken.decimal));
      const takerAmount = (new BigNumber(trade.takerTokenAmount.toString())).div(Math.pow(10, takerToken.decimal));
      return util.roundingNumber(makerAmount.div(takerAmount).toNumber());
    },
    formatTokenNumber (symbol, amount) {
      const tokenInfo = this.tokens[symbol];
      return util.formatTokenAmount(amount, tokenInfo.decimal);
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
      this.currentPage = this.$refs.topPaginator.selected = this.$refs.bottomPaginator.selected = page - 1;
      this.fetch();
    },

    shouldShowRow (row) {
      let taker = tokens[row.takerTokenSymbol].hidden
      let maker = tokens[row.makerTokenSymbol].hidden

      return this.shouldShowToken(row.takerTokenSymbol) && this.shouldShowToken(row.makerTokenSymbol)
      // if(!tokens[row.takerTokenSymbol].hidden && !tokens[row.makerTokenSymbol].hidden) return true;
      // // return !this.tokens[item.symbol].hidden;
      // // if(!this.tokens[item.symbol].hidden) return true;
      // console.log(new Date().getTime() - tokens[row.takerTokenSymbol].hidden)
      // console.log(new Date().getTime() - tokens[row.makerTokenSymbol].hidden)

      // if (typeof tokens[row.takerTokenSymbol].hidden != 'number' || typeof tokens[row.makerTokenSymbol].hidden != 'number') return false;
      
      // return new Date().getTime() - tokens[row.takerTokenSymbol].hidden > 0 && new Date().getTime() - tokens[row.makerTokenSymbol].hidden > 0;
    },

    shouldShowToken (tokenSymbol) {
      // return !this.tokens[item.symbol].hidden;
      if(!this.tokens[tokenSymbol].hidden) return true;
      if (typeof this.tokens[tokenSymbol].hidden != 'number') return false;
      return new Date().getTime() - this.tokens[tokenSymbol].hidden > 0 ;
    },
  },

  
  computed: {
    locale () {
      return util.getLocale(util.getBrowserLanguage())
    }
  },
  watch: {
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
        this.fetch();
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
        this.fetch();
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