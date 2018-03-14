<template>
  <div class="col-sm-12">
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
        <b-tab no-body @click="onSelectTab('chartVolume')" :title="$t('chart.title.network_volume')" active>
          <chart-volume ref="chartVolume"
            :elementId="'chart-volume'">
          </chart-volume>
        </b-tab>
        <b-tab no-body @click="onSelectTab('chartFee')" :title="$t('chart.title.fee_to_burn')">
          <chart-fee ref="chartFee"
            :elementId="'chart-fee'">
          </chart-fee>
        </b-tab>
        <b-tab no-body @click="onSelectTab('chartToken')" :title="$t('chart.title.top_token')">
          <chart-token ref="chartToken"
            :elementId="'chart-token'">
          </chart-token>
        </b-tab>
      </b-tabs>
    </b-card>
    <trade-list ref="datatable"
                :title="getListTitle()"
                :getFilterTokenSymbol="getFilterTokenSymbol">
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

  const defaultChartOptions = {
    legend: {
      display: false
    }
  };

  export default {

    data() {
      return {
        pageSize: 10,
        tokens: _.keyBy(_.values(network.tokens), 'symbol'),
        selectedPeriod: 'H24',
        selectedInterval: 'H1',
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
      getFilterTokenSymbol() {
        const tokenAddr = this.$route.params.tokenAddr;
        const tokenDef = this.tokens[tokenAddr];
        return tokenDef ? tokenDef.symbol : null;
      },
      selectPeriod(period, interval) {
        this.selectedPeriod = period;
        this.selectedInterval = interval;
        this.refreshChartsData();
      },
      onSelectTab (tabName) {
        this.refreshChartsData();
      },
      refreshChartsData() {
        const period = this.selectedPeriod;
        const interval = this.selectedInterval;

        this._refreshNetworkVolumeChart(period, interval);
        this._refreshFeeToBurnChart(period, interval);
        this._refreshTopTopkensChart(period);
      },
      _refreshNetworkVolumeChart(period, interval) {
        if (this.$refs.chartVolume) {
          this.$refs.chartVolume.refresh(period, interval);
        }
      },
      _refreshFeeToBurnChart(period, interval) {
        if (this.$refs.chartFee) {
          this.$refs.chartFee.refresh(period, interval);
        }
      },

      _refreshTopTopkensChart(period) {
        if (this.$refs.chartToken) {
          this.$refs.chartToken.refresh(period);
        }
      }
    },

    mounted() {
      this._refreshInterval = window.setInterval(() => {
        this.refresh();
      }, 10000);

      this.refresh();
      this.refreshChartsData();
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
