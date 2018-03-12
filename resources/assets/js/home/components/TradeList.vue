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
      this.refreshChartsData();
    },
    refreshChartsData () {
      this._refreshNetworkVolumeChart();
      this._refreshFeeToBurnChart();
      this._refreshTopTopkensChart();
    },
    _refreshNetworkVolumeChart () {
      AppRequest.getNetworkVolume('D7', 'H1', (err, ret) => {
        const keyedVolumeData = _.keyBy(ret, 'hourSeq');
        const ctx = document.getElementById('chart-volume');
        const labels = [];
        const dataSetData = [];
        for (let seq = ret[0].hourSeq; seq <= ret[ret.length-1].hourSeq; seq++) {
          const d = moment(seq * 3600 * 1000);
          labels.push(d.format('MMM D HH:mm'));

          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0) * 725;
          dataSetData.push(volume);
        }

        const data = {
          labels: labels,
          datasets: [{
            label: 'Network volume',
            data: dataSetData,
          }]
        };
        const options = {
          // TODO
        };
        const myChart = new Chart(ctx, {
          type: 'line',
          data,
          options
        });
      });
    },
    _refreshFeeToBurnChart () {
      AppRequest.getNetworkVolume('D7', 'H1', (err, ret) => {
        const keyedVolumeData = _.keyBy(ret, 'hourSeq');
        const ctx = document.getElementById('chart-fee');
        const labels = [];
        const dataSetData = [];
        for (let seq = ret[0].hourSeq; seq <= ret[ret.length-1].hourSeq; seq++) {
          labels.push(seq);
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0) * 725;
          dataSetData.push(volume);
        }

        const data = {
          labels: labels,
          datasets: [{
            label: 'Network volume',
            data: dataSetData,
          }]
        };
        const options = {};
        const myChart = new Chart(ctx, {
          type: 'line',
          data,
          options
        });
      });
    },
    _refreshTopTopkensChart () {
      AppRequest.getNetworkVolume('D7', 'H1', (err, ret) => {
        const keyedVolumeData = _.keyBy(ret, 'hourSeq');
        const ctx = document.getElementById('chart-top-tokens');
        const labels = [];
        const dataSetData = [];
        for (let seq = ret[0].hourSeq; seq <= ret[ret.length-1].hourSeq; seq++) {
          labels.push(seq);
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0) * 725;
          dataSetData.push(volume);
        }

        const data = {
          labels: labels,
          datasets: [{
            label: 'Network volume',
            data: dataSetData,
          }]
        };
        const options = {};
        const myChart = new Chart(ctx, {
          type: 'line',
          data,
          options
        });
      });
    }
  },

  mounted() {
    this._refreshInterval = window.setInterval(() => {
      this.refresh();
    }, 10000);

    this.refresh();
    this.refreshChartsData();
  }

}
</script>

<style scoped lang="css">
  .chart-period-picker {
    position: absolute;
    top: 5;
    right: 5;
  }
</style>
