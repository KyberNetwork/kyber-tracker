<template>
  <div class="col-sm-12">
    <div class="chart-period-picker">
      <b-button
        :variant="selectedPeriod === 'H24' ? 'primary' : 'outline-primary'"
        @click="selectPeriod('H24', 'H1')">24H
      </b-button>
      <b-button
        :variant="selectedPeriod === 'D7' ? 'primary' : 'outline-primary'"
        @click="selectPeriod('D7', 'H1')">7D
      </b-button>
      <b-button
        :variant="selectedPeriod === 'D30' ? 'primary' : 'outline-primary'"
        @click="selectPeriod('D30', 'D1')">1M
      </b-button>
      <b-button
        :variant="selectedPeriod === 'Y1' ? 'primary' : 'outline-primary'"
        @click="selectPeriod('Y1', 'D1')">1Y
      </b-button>
      <b-button
        :variant="selectedPeriod === 'ALL' ? 'primary' : 'outline-primary'"
        @click="selectPeriod('ALL', 'D1')">ALL
      </b-button>
    </div>
    <canvas id="myChart" width="100" height="25"></canvas>
    <trade-list ref="datatable"
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
        tokens: _.keyBy(_.values(network.tokens), 'address'),
        selectedPeriod: 'D7',
        selectedInterval: 'H1',
        myChart: undefined,
        symbol: undefined,
      };
    },

    methods: {
      refresh() {
        if (!this.$refs.datatable) {
          window.clearInterval(this._refreshInterval);
          return;
        }

        this.symbol = this.getFilterTokenSymbol();
        this.refreshChartsData(this.selectedPeriod, this.selectedInterval, this.symbol);
        this.$refs.datatable.fetch();
      },
      selectPeriod (period, interval) {
        this.selectedPeriod = period;
        this.selectedInterval = interval;
        this.refreshChartsData(period, interval, this.symbol);
      },
      getFilterTokenSymbol() {
        const tokenAddr = this.$route.params.tokenAddr;
        const tokenDef = this.tokens[tokenAddr];
        return tokenDef ? tokenDef.symbol : null;
      },
      refreshChartsData (period, interval, symbol) {
        this._refreshTokenDetailChart(period, interval, symbol);
      },
      _refreshTokenDetailChart (period, interval, symbol) {
        AppRequest.getNetworkVolume(period, interval, symbol, (err, ret) => {
          const ctx = document.getElementById('myChart');
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
          if(this.myChart){
            this.myChart.destroy();
          }
          this.myChart = new Chart(ctx, {
            type: 'line',
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

    watch: {
      '$route.query'() {
        this.refresh();
      }
    },

    mounted() {
      this.symbol = this.getFilterTokenSymbol();
      if (!this.symbol) {
        return;
      }

      this.refresh();

      this.refreshChartsData(this.selectedPeriod, this.selectedInterval, this.symbol);
    }

  }
</script>
<style scoped lang="css">
  .chart-period-picker {
    position: absolute;
    top: 5px;
    right: 5px;
  }
</style>
