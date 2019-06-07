<template>
  
  <div class="col-sm-12 fee-data">
    <div class="panel-heading pb-20">
        <span class="no-margin panel-title">{{$t('navigator.fees')}} </span>
      </div>
    <b-card no-body>
      <div class="chart-period-picker" v-if="$mq !== 'sm' && $mq !== 'ml'">
        <b-button-group class="cus-pagination full-width-btn-group">
          <b-button
            :variant="selectedPeriod === 'H24' ? 'active' : ''"
            @click="selectPeriod('H24', 'H1')">24H
          </b-button>
          <b-button
            :variant="selectedPeriod === 'D7' ? 'active' : ''"
            @click="selectPeriod('D7', 'H1')">7D
          </b-button>
          <b-button
            :variant="selectedPeriod === 'D30' ? 'active' : ''"
            @click="selectPeriod('D30', 'D1')">1M
          </b-button>
          <b-button
            :variant="selectedPeriod === 'Y1' ? 'active' : ''"
            @click="selectPeriod('Y1', 'D1')">1Y
          </b-button>
          <b-button
            :variant="selectedPeriod === 'ALL' ? 'active' : ''"
            @click="selectPeriod('ALL', 'D1')">ALL
          </b-button>
        </b-button-group>
      </div>
      <b-tabs card>

        <div class="chart-period-picker pt-3 text-right" v-if="$mq == 'sm' || $mq == 'ml'">
          <b-button-group class="cus-pagination full-width-btn-group">
            <b-button
              :variant="selectedPeriod === 'H24' ? 'active' : ''"
              @click="selectPeriod('H24', 'H1')">24H
            </b-button>
            <b-button
              :variant="selectedPeriod === 'D7' ? 'active' : ''"
              @click="selectPeriod('D7', 'H1')">7D
            </b-button>
            <b-button
              :variant="selectedPeriod === 'D30' ? 'active' : ''"
              @click="selectPeriod('D30', 'D1')">1M
            </b-button>
            <b-button
              :variant="selectedPeriod === 'Y1' ? 'active' : ''"
              @click="selectPeriod('Y1', 'D1')">1Y
            </b-button>
            <b-button
              :variant="selectedPeriod === 'ALL' ? 'active' : ''"
              @click="selectPeriod('ALL', 'D1')">ALL
            </b-button>
          </b-button-group>
        </div>

        <!-- <b-tab @click="onSelectTab('chartVolume')" :title="$t('chart.title.network_volume')" active>
          <chart-volume ref="chartVolume"
            :elementId="'chart-volume'">
          </chart-volume>
        </b-tab> -->
        <b-tab @click="onSelectTab('chartFee', 'getCollectedFeeList')" :title="$t('chart.title.collected_fees')">
          <chart-fee ref="chartFee"
            :elementId="'chart-fee'">
          </chart-fee>
        </b-tab>
        <b-tab @click="onSelectTab('chartBurned', 'getBuntTransaction')" :title="$t('chart.title.fees_burned')">
          <chart-fee ref="chartBurned"
            :elementId="'chart-burned'">
          </chart-fee>
        </b-tab>
      </b-tabs>
    </b-card>
    <!-- <trade-list ref="datatable"
                :title="getListTitle()"
                :getFilterTokenAddress="getFilterTokenAddress"
                :isHidePartnerCommission="true"
                :isHideDatepicker="true"
                :isHidePaginate="true"
                :pageSize="5"
                :seeAllUrl="'/trades'"
                >
    </trade-list> -->
    <div class="wallet-detail-title panel-heading pt-56 pb-20 d-lg-flex justify-content-lg-between">
      <span class="no-margin panel-title">{{getHistoryTitle()}} </span>

      <div class="">
        <div v-if="!isHideDatepicker" class="datepicker-container pb-16 " v-bind:class="timeRangeError ? 'date-error' : ''">
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
          <div v-if="timeRangeError" class="picker-error color-red pt-2">
            <i>{{timeRangeError}}</i>
          </div>
        </div>
        <button :disabled="timeRangeError" type="button" class="btn btn-default btn-export pointer" @click="exportData()">{{ $t("trade_list.export_csv") }}</button>
      </div>
      
    </div>

    <fee-list 
      ref="datatable"
      :fetch="fetch"
      :exportData="exportData"
      :isHideDatepicker="true"
      :getSearchResultTitle="getSearchResultTitle"
      :isShowExport="false"
      v-on:fetchDone="reloadView"
      :isParentLoading="isLoading"
    >
    </fee-list>
    

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
  import Chart from 'chart.js';
  const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens
  const defaultChartOptions = {
    legend: {
      display: false
    }
  };

  const TREE_MONTH = 60 * 60 * 24 * 90
  const ONE_MONTH = 60 * 60 * 24 * 30

  export default {

    data() {
      return {
        pageSize: 10,
        tokens: TOKENS_BY_ADDR,
        selectedPeriod: 'D30',
        selectedInterval: 'D1',
        selectedTab: 'chartFee',
        fetchFunc: 'getTrades',
        volumeChart: undefined,
        feeToBurnChart: undefined,
        topTokenChart: undefined,

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
        timeRangeError: null
        };
    },

    methods: {
      refresh() {
        if (!this.$refs.datatable) {
          window.clearInterval(this._refreshInterval);
          return;
        }

        this.$refs.datatable.fetch();
      },
      getListTitle() {
        return this.$t("common.network_activity");
      },
      getFilterTokenAddress() {
        // const tokenAddr = this.$route.params.tokenAddr;
        // const tokenDef = this.tokens[tokenAddr];
        // return tokenDef ? tokenDef.symbol : null;
        return this.$route.params.tokenAddr
      },
      selectPeriod(period, interval) {
        this.selectedPeriod = period;
        this.selectedInterval = interval;
        this._refeshChart();
      },
      onSelectTab (tabName, fetchFunc) {
        this.selectedTab = tabName;
        this.fetchFunc = fetchFunc
        this._refeshChart();
        this.resetTableData()
        this.$refs.datatable.fetch();
      },
      refreshChartsData() {
        const period = this.selectedPeriod;
        const interval = this.selectedInterval;

        this._refreshNetworkVolumeChart(period, interval);
        // this._refreshFeeToBurnChart(period, interval);
        // this._refreshTopTopkensChart(period);


        this._refreshFeeChart(period, interval);
        this._refreshFeeBurnedChart(period, interval);
      },
      _refreshNetworkVolumeChart(period, interval) {
        if (this.$refs.chartVolume) {
          this.$refs.chartVolume.refresh(period, interval);
        }
      },
      _refreshFeeChart(period, interval) {
        if (this.$refs.chartFee) {
          this.$refs.chartFee.refresh(period, interval, "getCollectedFees");
        }
      },
      _refreshFeeBurnedChart(period, interval) {
        if (this.$refs.chartBurned) {
          this.$refs.chartBurned.refresh(period, interval, "getBurnedFees");
        }
      },
      _refreshTopTopkensChart(period) {
        if (this.$refs.chartToken) {
          this.$refs.chartToken.refresh(period);
        }
      },
      _refeshChart() {
        const map = {
          chartVolume: this._refreshNetworkVolumeChart,
          chartFee: this._refreshFeeChart,
          chartBurned: this._refreshFeeBurnedChart,
          chartToken: this._refreshTopTopkensChart
        }

        map[this.selectedTab].call(this, this.selectedPeriod, this.selectedInterval);
      },

      fetch(isShowLoading){
        const currentPage = this.$refs.datatable.currentPage || 0;
        const pageSize = this.$refs.datatable.pageSize || 20;
        const fromDate = this.searchFromDate
          ? moment(this.searchFromDate)
              .startOf("day")
              .unix()
          : undefined;
        const toDate = this.searchToDate
          ? moment(this.searchToDate)
              .endOf("day")
              .unix()
          : undefined;

        const params = {
          fromDate, toDate
        }
        if(isShowLoading){
          this.$refs.datatable.rows = [];
          this.isLoading = true
        }
        
         AppRequest[this.fetchFunc](currentPage, pageSize || 20, params, (err, res) => {
            const pagination = res.pagination;

            this.$refs.datatable.rows = res.data;

            this.$refs.datatable.maxPage = pagination.maxPage;
            this.$refs.datatable.totalTrade = pagination.totalCount;
            this.isLoading = false
            this.$emit('fetchDone')
          });
      },

      resetTableData(){
        this.$refs.datatable.rows = [];

        this.$refs.datatable.maxPage = 0;
        this.$refs.datatable.totalTrade = 0;
        this.$refs.datatable.currentPage = 0
      },

      getHistoryTitle(){
        if(this.selectedTab == 'chartFee'){
          return this.$t('navigator.collected_fee_history')
        } else {
          return this.$t('navigator.burned_fee_history')
        }
      },

      exportData(){
        const currentPage = this.$refs.datatable.currentPage || 0;
        const pageSize = this.$refs.datatable.pageSize || 20;
        const fromDate = this.searchFromDate
          ? moment(this.searchFromDate)
              .startOf("day")
              .unix()
          : undefined;
        const toDate = this.searchToDate
          ? moment(this.searchToDate)
              .endOf("day")
              .unix()
          : undefined;


        if(!fromDate || !toDate){
          this.timeRangeError = 'Please select time range to export'
          return
        }

        if(toDate - fromDate > ONE_MONTH){
          this.timeRangeError = 'Max time range is 30 days'
          return
        }

        const params = {
          fromDate, toDate,
          exportData: true
        }


      AppRequest[this.fetchFunc](currentPage, pageSize || 20, params, (err, res) => {
        const data = res.data;

        var csvHeader = "data:text/csv;charset=utf-8,";
        var csvContent = ""
        csvContent += data.map(function(d){
            let time = new Date(+d.blockTimestamp * 1000).toUTCString().replace(",",'')
            let tx = d.tx
            

            let fee = (d.collectedFees || d.amount) ? new BigNumber((d.collectedFees || d.amount).toString()).div(Math.pow(10, 18)).toString() : 0

            return `${time},${tx},${fee}`
          })
          .join('\n') 
          .replace(/(^\{)|(\}$)/mg, '');
          let csvString = 'Time,Tx,Fee(KNC)\n' + csvContent

          // window.open( encodeURI(csvData) );
          // let dataCSV = encodeURI(csvData);

          let csvData = new Blob([csvString], { type: 'text/csv' }); 
          let csvUrl = URL.createObjectURL(csvData);
          let link = document.createElement('a');
          link.href =  csvUrl;
          const fileName = this.selectedTab == 'chartFee' ? 'Collected Fees' : 'Burnt Fees'
          link.download = new Date().toUTCString() + " " + fileName + '.csv'
          link.click();

          // let link = document.createElement('a');
          // link.href = dataCSV
          // link.target = '_blank'
          // const fileName = this.selectedTab == 'chartFee' ? 'Collected Fees' : 'Burnt Fees'
          // link.download = new Date().toUTCString() + " " + fileName + '.csv'
          
          // document.body.appendChild(link);
          // link.click();
        });




      }
    },

    mounted() {
      this._refreshInterval = window.setInterval(() => {
        this.refresh();
        this._refeshChart();
      }, 10000);

      this.refresh();
      //this._refreshNetworkVolumeChart();
    },

    destroyed(){
      window.clearInterval(this._refreshInterval)
    },

    watch: {
      // "$route.query"() {
      //   this.refresh();
      // },
      searchFromDate (val) {

        this.timeRangeError = null
        window.setTimeout(() => {
          this.disabledToDates = { to: this.searchFromDate };
          this.resetTableData()
          this.fetch();
        });
      },
      searchToDate (val) {
        this.timeRangeError = null
        window.setTimeout(() => {
          this.disabledFromDates = { from: this.searchToDate };
          this.resetTableData()
          this.fetch();
        });
      }
    },

  }
</script>

<style scoped lang="css">
  .chart-period-picker {
    position: absolute;
    top: 5px;
    right: 5px;
  }
</style>
