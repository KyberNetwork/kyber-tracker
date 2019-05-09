<template>
  <div>
    <div class="panel panel-default trade-list total-trades">

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

          <div class="wallet-detail-title panel-heading pb-20">
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

          <div class="wallet-detail-title panel-heading pt-56 pb-20 d-flex justify-content-between">
            <span class="no-margin panel-title">{{$t('wallet_detail.history')}} </span>

            <button v-if="isShowExport" type="button" class="btn btn-default btn-export pointer float-left" @click="exportData()">{{ $t("trade_list.export_csv") }}</button>
          </div>

          


        </div>

      </div>

      

      <!-- <paginate v-if="maxPage > 1 && !isHidePaginate"
        ref="topPaginator"
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
        :class="'home-pagination-block full-width-pagination'"
        :hide-prev-next="true"
        >
      </paginate> -->
      
      
      
      
      
      
      <!-- trade list for large screen device -->
      <div v-if="($mq == 'md' || $mq == 'lg')" class="table-responsive-wraper clear pt-10">

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
              <th class="text-center" style="width: 40%;" >{{ $t("trade_list.trade") }}</th>
              <th v-bind:colspan="partner ? 1 : 1" class="text-left rate" style="width: 30%;">{{ $t("trade_list.rate") }}</th>
              <th v-if="partner" class="pl-4" >{{ $t("trade_list.commission") }}</th>
              <th class="text-left" style="width: 10%;">VIEW ON</th>
              <!-- <th></th> -->
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <tr v-for="(row, index) in rows" :item="row" :index="index" class="pointer">
              <td class="pl-4"   @click="onClickRow(row)">{{ getDateInfo(row) }}</td>
              <td class="font-semi-bold row"  @click="onClickRow(row)">
                <div class="source col-5 text-right no-padding d-inline-block">
                  {{ formatTokenNumber(row.takerTokenAddress, row.takerTokenAmount, row.takerTokenDecimal) }} 
                
                  <span v-if="isOfficial(row.takerTokenAddress)">{{ row.takerTokenSymbol }}</span>
                  <span v-else><a class="address-link" :href="getAddressLink(row.takerTokenAddress)" target="_blank">({{getShortedAddr(row.takerTokenAddress)}})</a></span>
                </div><!--  
            --><div class="angle col-2 text-center no-padding d-inline-block">
                  <span class="entypo-right"></span>
                </div><!--  
            --><div class="dest col-5 text-left no-padding d-inline-block">
                  {{ formatTokenNumber(row.makerTokenAddress, row.makerTokenAmount,row.makerTokenDecimal) }} 
                  <span v-if="isOfficial(row.makerTokenAddress)">{{ row.makerTokenSymbol }}</span>
                  <span v-else><a class="address-link" :href="getAddressLink(row.makerTokenAddress)" target="_blank">({{getShortedAddr(row.makerTokenAddress)}})</a></span>
                </div>
                
              </td>
              
              <td class="text-left rate"  @click="onClickRow(row)">1 
                <span>
                  <span v-if="isOfficial(row.takerTokenAddress)">{{ row.takerTokenSymbol }}</span>
                  <span v-else><a class="address-link" :href="getAddressLink(row.takerTokenAddress)" target="_blank">({{getShortedAddr(row.takerTokenAddress)}})</a></span>
                </span> = {{ getRate(row) }} 
                <span>
                  <span v-if="isOfficial(row.makerTokenAddress)">{{ row.makerTokenSymbol }}</span>
                  <span v-else><a class="address-link" :href="getAddressLink(row.makerTokenAddress)" target="_blank">({{getShortedAddr(row.makerTokenAddress)}})</a></span>
                </span>
              </td>
              <td v-if="partner" class="text-left pl-4"  @click="onClickRow(row)">{{ formatTokenNumber(network.KNC.address, row.commission, network.KNC.decimal) }} KNC</td>
              <td class="text-center view-on d-flex" >
                <!-- <img src="/images/more.svg" /> -->
                <!-- <span class="entypo-dot-3 table-more"></span> -->
                <a :href="getTxEtherscanLink(row.tx)" target="_blank"><img class="etherscan" src="/images/etherscan-logo.png" /></a>
                <a :href="getEnjinxLink(row.tx)" target="_blank"><img class="enj" src="/images/kyber-enj-logo.png" /></a>

                <!-- <b-dropdown class="trade-view-on" no-caret right>
                  <template slot="button-content">
                    <span class="entypo-dot-3 table-more" data-toggle="dropdown"></span>
                  </template>
                  <b-dropdown-item :href="getTxEtherscanLink(row.tx)" target="_blank">{{ $t("trade_list.view_on_etherscan") }}</b-dropdown-item>
                  <b-dropdown-item :href="getEnjinxLink(row.tx)" target="_blank">{{ $t("trade_list.view_on_enjinx") }}</b-dropdown-item>
                  
                </b-dropdown> -->

              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="isLoading || isParentLoading" class="trade-loading"><div></div><div></div><div></div></div>
        <div v-if="rows.length == 0 && !isLoading && !isParentLoading" class="no-row">{{ $t("trade_list.no_row") }}</div>

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

        <div class="text-center" v-if="seeAllUrl">
          <router-link :to="seeAllUrl">
            <button type="button" class="btn btn-default see-all-trade mx-auto">{{ $t("common.see_all") }}</button>
          </router-link>
          
        </div>
      </div>





      <!-- small trade list for mobile -->
      <div v-if="$mq !== 'md' && $mq !== 'lg'" class="mini-trade clear list-group-striped">
        <b-list-group v-for="row in rows">
          <b-list-group-item class="pointer">
            <div class="time-link d-flex justify-content-between">
              <span class="time-ago"> {{ getDateInfo(row) }}</span>
              <span class="link">
                <a :href="getTxEtherscanLink(row.tx)" target="_blank"><img class="etherscan" src="/images/etherscan-logo.png" /></a>
                <a :href="getEnjinxLink(row.tx)" target="_blank"><img class="enj" src="/images/kyber-enj-logo.png" /></a>
              </span>
            </div>
            <div class="trade font-semi-bold pt-2 pb-2" @click="onClickRow(row)">
              <span class="source col-5 text-right no-padding">
                {{ formatTokenNumber(row.takerTokenAddress, row.takerTokenAmount, row.takerTokenDecimal) }} 
              
                <span v-if="isOfficial(row.takerTokenAddress)">{{ row.takerTokenSymbol }}</span>
                <span v-else><a class="address-link" :href="getAddressLink(row.takerTokenAddress)" target="_blank">({{getShortedAddr(row.takerTokenAddress)}})</a></span>
              </span>
              <span class="angle col-2 text-center no-padding color-green">
                <!-- <i class="k k-angle right"></i> -->
                <span class="entypo-right"></span>
              </span>
              <span class="dest col-5 text-left no-padding">
                {{ formatTokenNumber(row.makerTokenAddress, row.makerTokenAmount,row.makerTokenDecimal) }} 
                <span v-if="isOfficial(row.makerTokenAddress)">{{ row.makerTokenSymbol }}</span>
                <span v-else><a class="address-link" :href="getAddressLink(row.makerTokenAddress)" target="_blank">({{getShortedAddr(row.makerTokenAddress)}})</a></span>
              </span>
            </div>
            <div class="rate"  @click="onClickRow(row)">1
              <span>
                <span v-if="isOfficial(row.takerTokenAddress)">{{ row.takerTokenSymbol }}</span>
                <span v-else><a class="address-link" :href="getAddressLink(row.takerTokenAddress)" target="_blank">({{getShortedAddr(row.takerTokenAddress)}})</a></span>
              </span> = {{ getRate(row) }} 
              <span>
                <span v-if="isOfficial(row.makerTokenAddress)">{{ row.makerTokenSymbol }}</span>
                <span v-else><a class="address-link" :href="getAddressLink(row.makerTokenAddress)" target="_blank">({{getShortedAddr(row.makerTokenAddress)}})</a></span>
              </span>
            </div>

          </b-list-group-item>
        </b-list-group>


        <!-- <table class="table table-hover  table-striped">
          <thead>
            <tr>
              <th class="pl-4">{{ $t("trade_list.date") }}</th>
              <th class="pl-4">{{ $t("trade_list.pair") }}</th>
              <th class="pl-4">{{ $t("trade_list.rate") }}</th>
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <tr v-for="(row, index) in rows" :item="row" :index="index" @click="onClickRow(row)">
              <td class="pl-4">{{ getDateInfo(row, false) }}</td>
              <td class="text-left pl-4 trade-direction">
                <span class="font-semi-bold">
                  {{ formatTokenNumber(row.takerTokenAddress, row.takerTokenAmount, row.takerTokenDecimal) }} 
              
                  <span v-if="isOfficial(row.takerTokenAddress)">{{ row.takerTokenSymbol }}</span>
                  <span v-else><a class="address-link" :href="getAddressLink(row.takerTokenAddress)" target="_blank">({{getShortedAddr(row.takerTokenAddress)}})</a></span>
                </span>
                <br/>
                <span class="entypo-down-dir trade-direction-down-symbol"></span>
                <span>
                  {{ formatTokenNumber(row.makerTokenAddress, row.makerTokenAmount, row.makerTokenDecimal) }} 
                  <span v-if="isOfficial(row.makerTokenAddress)">{{ row.makerTokenSymbol }}</span>
                  <span v-else><a class="address-link" :href="getAddressLink(row.makerTokenAddress)" target="_blank">({{getShortedAddr(row.makerTokenAddress)}})</a></span>
                </span>
              </td>
              <td class="text-left pl-4">
                <span class="font-semi-bold">
                  <span>
                    <span v-if="isOfficial(row.takerTokenAddress)">{{ row.takerTokenSymbol }}</span>
                    <span v-else><a class="address-link" :href="getAddressLink(row.takerTokenAddress)" target="_blank">({{getShortedAddr(row.takerTokenAddress)}})</a></span>
                  </span>
                  /
                  <span>
                    <span v-if="isOfficial(row.makerTokenAddress)">{{ row.makerTokenSymbol }}</span>
                    <span v-else><a class="address-link" :href="getAddressLink(row.makerTokenAddress)" target="_blank">({{getShortedAddr(row.makerTokenAddress)}})</a></span>
                  </span>
                </span>
                <br/>
                {{ getRate(row) }}
              </td>
            </tr>
          </tbody>
        </table> -->

        

        <div v-if="isLoading || isParentLoading" class="trade-loading"><div></div><div></div><div></div></div>
        <div v-if="rows.length == 0 && !isLoading && !isParentLoading" class="no-row">{{ $t("trade_list.no_row") }}</div>

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
        
        <div class="text-center" v-if="seeAllUrl">
          <router-link :to="seeAllUrl">
            <button type="button" class="btn btn-default see-all-trade mx-auto">{{ $t("common.see_all") }}</button>
          </router-link>
          
        </div>
      </div>

      





      


      
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

    // searchFromDate: {
    //   type: Number
    // },
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
    seeAllUrl: {
      type: String,
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
      searchFromDate: null,
      searchToDate: null,
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
      return util.shortenAddress(addr, 4, 4)
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
      console.log("************* click to page", page)
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