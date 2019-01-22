<template>
  
  <div class="col-sm-12">
    <div class="panel-heading pb-16">
        <span class="no-margin panel-title">{{$t('navigator.network')}} </span>
      </div>
    <b-card no-body>
      <div class="chart-period-picker">
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
        <b-tab @click="onSelectTab('chartVolume')" :title="$t('chart.title.network_volume')" active>
          <chart-volume ref="chartVolume"
            :elementId="'chart-volume'">
          </chart-volume>
        </b-tab>
        <b-tab @click="onSelectTab('chartFee')" :title="$t('chart.title.collected_fees')">
          <chart-fee ref="chartFee"
            :elementId="'chart-fee'">
          </chart-fee>
        </b-tab>
        <b-tab @click="onSelectTab('chartBurned')" :title="$t('chart.title.fees_burned')">
          <chart-fee ref="chartBurned"
            :elementId="'chart-burned'">
          </chart-fee>
        </b-tab>
        <!-- <b-tab @click="onSelectTab('chartToken')" :title="$t('chart.title.top_token')">
          <chart-token ref="chartToken"
            :elementId="'chart-token'">
          </chart-token>
        </b-tab> -->
      </b-tabs>
    </b-card>
    <trade-list ref="datatable"
                :title="getListTitle()"
                :getFilterTokenAddress="getFilterTokenAddress"
                :isHidePartnerCommission="true"
                :isHideDatepicker="true"
                :isHidePaginate="true"
                :pageSize="5"
                >
    </trade-list>
    <div class="text-center">
      <router-link to="/trades">
        <button type="button" class="btn btn-default see-all-trade mx-auto">{{ $t("common.see_all") }}</button>
      </router-link>
      
    </div>
    

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

  export default {

    data() {
      return {
        pageSize: 10,
        // tokens: _.keyBy(_.values(GLOBAL_TOKENS), 'symbol'),
        tokens: TOKENS_BY_ADDR,
        selectedPeriod: 'D30',
        selectedInterval: 'D1',
        selectedTab: 'chartVolume',
        volumeChart: undefined,
        feeToBurnChart: undefined,
        topTokenChart: undefined,
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
      onSelectTab (tabName) {
        this.selectedTab = tabName;
        this._refeshChart();
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
      }
    },

    mounted() {
      // console.log("********************", window["GLOBAL_STATE"])
      this._refreshInterval = window.setInterval(() => {
        this.refresh();
        this._refeshChart();
      }, 10000);

      this.refresh();
      //this._refreshNetworkVolumeChart();
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
