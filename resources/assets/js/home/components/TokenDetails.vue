<template>
  <div>
    <div class="card">
      <div class="tabs">
        <div class="card-header">
          <div class="chart-period-picker">
            <b-button-group class="cus-pagination">
              <b-button
                :variant="selectedPeriod === 'H24' ? 'active' : 'outline-primary'"
                @click="selectPeriod('H24', 'H1')">24H
              </b-button>
              <b-button
                :variant="selectedPeriod === 'D7' ? 'active' : 'outline-primary'"
                @click="selectPeriod('D7', 'H1')">7D
              </b-button>
              <b-button
                :variant="selectedPeriod === 'D30' ? 'active' : 'outline-primary'"
                @click="selectPeriod('D30', 'D1')">1M
              </b-button>
              <b-button
                :variant="selectedPeriod === 'Y1' ? 'active' : 'outline-primary'"
                @click="selectPeriod('Y1', 'D1')">1Y
              </b-button>
              <b-button
                :variant="selectedPeriod === 'ALL' ? 'active' : 'outline-primary'"
                @click="selectPeriod('ALL', 'D1')">ALL
              </b-button>
            </b-button-group>
          </div>
        </div>
      </div>

      <canvas id="myChart" width="100" height="25"></canvas>
    </div>
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

  const defaultChartOptions = {
    legend: {
      display: false
    },
    tooltips: {
      mode: 'index',
      axis: 'x',
      intersect: false,
    }
  };

  export default {

    data() {
      return {
        tokens: _.keyBy(_.values(network.tokens), 'address'),
        selectedPeriod: 'H24',
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
            counts: chartData.counts,
            datasets: [{
              label: 'Network volume',
              data: chartData.dataSetData,
              pointRadius: 0,
              backgroundColor: 'rgb(148, 190, 190)',
              borderColor: 'rgb(148, 190, 190)',
              showLine: true,
              spanGaps: true,
            }]
          };
          const options = _.assign(defaultChartOptions, {
            tooltips: {
              mode: 'index',
              axis: 'x',
              intersect: false,
              callbacks: {
                label: function () {
                  return ;
                },
                afterBody: function (tooltipItem, data) {
                  const index = tooltipItem[0].index;
                  const label = 'volume: ' + data.datasets[0].data[index];
                  const count = 'trades: ' + data.counts[index];
                  return [label, count];
                }
              }
            },
            scales: {
              yAxes: [{
                ticks: {
                  callback: (label, index, labels) => {
                    return label + ' KNC';
                  }
                },
                maxTicksLimit: 5
              }],
              xAxes: [{
                ticks: {
                  callback: (label, index, labels) => {
                    const d = moment(label);
                    return d.format('MMM D');
                  },
                  maxTicksLimit: 5
                }
              }]
            }
          });
          if(this.myChart){
            this.myChart.destroy();
          }
          this.myChart = new Chart(ctx, {
            type: 'LineWithLine',
            data,
            options
          });
        });
      },
      _createChartData(ret, interval) {
        const labels = [];
        const dataSetData = [];
        const counts = [];
        if(interval === 'H1') {
          const keyedVolumeData = _.keyBy(ret, 'hourSeq');
          for (let seq = ret[0].hourSeq; seq <= ret[ret.length-1].hourSeq; seq++) {
            const d = moment(seq * 3600 * 1000);
            labels.push(d.format('MMM D HH:mm'));
            const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0) * 725;
            dataSetData.push(Math.round(volume * 100) / 100);
            counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0);
          }
        } else if(interval === 'D1') {
          const keyedVolumeData = _.keyBy(ret, 'daySeq');
          for (let seq = ret[0].daySeq; seq <= ret[ret.length-1].daySeq; seq++) {
            const d = moment(seq * 3600 * 24 * 1000);
            labels.push(d.format('MMM D'));
            const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0) * 725;
            dataSetData.push(Math.round(volume * 100) / 100);
            counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0);
          }
        }
        return {
          dataSetData: dataSetData,
          labels: labels,
          counts: counts,
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
