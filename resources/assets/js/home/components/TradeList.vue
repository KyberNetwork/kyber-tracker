<template>
  <div class="col-sm-12">
    <b-card no-body>
      <div class="chart-period-picker">
      <b-button-group class="cus-pagination">
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
          @click="selectPeriod('D30', 'H1')">1M
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
        <b-tab no-body :title="$t('chart.title.network_volume')" active>
          <canvas id="chart-volume" width="100" height="25"></canvas>
        </b-tab>
        <b-tab no-body :title="$t('chart.title.fee_to_burn')">
          <canvas id="chart-fee" width="100" height="25"></canvas>
        </b-tab>
        <b-tab no-body :title="$t('chart.title.top_token')">
          <canvas id="chart-top-tokens" width="100" height="25"></canvas>
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

export default {

  data() {
    return {
      pageSize: 10,
      tokens: _.keyBy(_.values(network.tokens), 'symbol'),
      selectedPeriod: 'D7',
      selectedInterval: 'H1',
      volumeChart: undefined,
      feeToBurnChart: undefined,
      topTokenChart: undefined,
    };
  },

  methods: {
    refresh () {
      if (!this.$refs.datatable) {
        window.clearInterval(this._refreshInterval);
        return;
      }

      this.$refs.datatable.fetch();
    },
    getListTitle () {
      return this.$t("trade_list.title");
    },
    getFilterTokenSymbol () {
      const tokenAddr = this.$route.params.tokenAddr;
      const tokenDef = this.tokens[tokenAddr];
      return tokenDef ? tokenDef.symbol : null;
    },
    selectPeriod (period, interval) {
      this.selectedPeriod = period;
      this.selectedInterval = interval;
      this.refreshChartsData(period, interval);
    },
    refreshChartsData (period, interval) {
      this._refreshNetworkVolumeChart(period, interval);
      this._refreshFeeToBurnChart(period, interval);
      this._refreshTopTopkensChart(period);
    },
    _refreshNetworkVolumeChart (period, interval) {
      AppRequest.getNetworkVolume(period, interval, (err, ret) => {
        const ctx = document.getElementById('chart-volume');
        const chartData = this._createChartData(ret, interval);
        const data = {
          labels: chartData.labels,
          datasets: [{
            label: 'Network volume',
            data: chartData.dataSetData,
          }]
        };
        const options = {
          // TODO
        };
        if(this.volumeChart){
          this.volumeChart.destroy();
        }
        this.volumeChart = new Chart(ctx, {
          type: 'line',
          data,
          options
        });
      });
    },
    _refreshFeeToBurnChart (period, interval) {
      AppRequest.getFeeToBurn(period, interval, (err, ret) => {
        const ctx = document.getElementById('chart-fee');
        const chartData = this._createChartData(ret, interval);
        const data = {
          labels: chartData.labels,
          datasets: [{
            label: 'Network volume',
            data: chartData.dataSetData,
          }]
        };
        const options = {};
        if(this.feeToBurnChart){
          this.feeToBurnChart.destroy();
        }
        this.feeToBurnChart = new Chart(ctx, {
          type: 'line',
          data,
          options
        });
      });
    },
    _refreshTopTopkensChart (period) {
      const now = Date.now() / 1000 | 0;
      let start;
      switch(period){
        case 'H24':
          start = now - 60 * 60 * 24;
          break;
        case 'D7':
          start = now - 60 * 60 * 24 * 7;
          break;
        case 'D30':
          start = now - 60 * 60 * 24 * 30;
          break;
        case 'Y1':
          start = now - 60 * 60 * 24 * 365;
          break;
        default:
          start = now - 60 * 60 * 24 * 365 * 10;
          break;
      }
      AppRequest.getTopToken(start, now, (err, ret) => {
        const ctx = document.getElementById('chart-top-tokens');
        const labels = [];
        const dataSetData = [];
        for (let i = 0; i < ret.length; i++) {
          labels.push(ret[i].symbol);
          dataSetData.push(ret[i].volumeUSD);
        }

        const data = {
          labels: labels,
          datasets: [{
            label: 'Network volume',
            data: dataSetData,
          }]
        };
        const options = {};
        if(this.topTokenChart){
          this.topTokenChart.destroy();
        }
        this.topTokenChart = new Chart(ctx, {
          type: 'bar',
          data,
          options
        });
      });
    },
    _createChartData(ret, interval) {
      const labels = [];
      const dataSetData = [];
      if(interval === 'H1') {
        const keyedVolumeData = _.keyBy(ret, 'hourSeq');
        for (let seq = ret[0].hourSeq; seq <= ret[ret.length-1].hourSeq; seq++) {
          const d = moment(seq * 3600 * 1000);
          labels.push(d.format('MMM D HH:mm'));
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0) * 725;
          dataSetData.push(volume);
        }
      } else if(interval === 'D1') {
        const keyedVolumeData = _.keyBy(ret, 'daySeq');
        for (let seq = ret[0].daySeq; seq <= ret[ret.length-1].daySeq; seq++) {
          const d = moment(seq * 3600 * 24 * 1000);
          labels.push(d.format('MMM D'));
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0) * 725;
          dataSetData.push(volume);
        }
      }
      return {
        dataSetData: dataSetData,
        labels: labels,
      };
    }
  },

  mounted() {
    this._refreshInterval = window.setInterval(() => {
      this.refresh();
    }, 10000);

    this.refresh();
    this.refreshChartsData(this.selectedPeriod, this.selectedInterval);
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
