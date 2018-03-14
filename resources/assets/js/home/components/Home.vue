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
          <canvas id="chart-top-tokens" height="250px" class="mt-20"></canvas>
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
        const self = this;
        const now = Date.now() / 1000 | 0;
        let start;
        switch (period) {
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
            dataSetData.push(Math.round(ret[i].volumeUSD * 100) / 100);
          }

          const data = {
            labels: labels,
            datasets: [{
              data: dataSetData,
              pointRadius: 0,
              backgroundColor: ['rgb(240, 219, 121)', 'rgb(57, 146, 202)', 'rgb(226, 79, 139)', 'rgb(141, 198, 196)',
                'rgb(135, 126, 145)', 'rgb(240, 219, 121)', 'rgb(57, 146, 202)', 'rgb(226, 79, 139)', 'rgb(141, 198, 196)',
                'rgb(135, 126, 145)', 'rgb(240, 219, 121)', 'rgb(57, 146, 202)', 'rgb(226, 79, 139)', 'rgb(141, 198, 196)',
                'rgb(135, 126, 145)'],
              showLine: true,
              spanGaps: true,
            }]
          };
          const options = {
            maintainAspectRatio: false,
            tooltips: {
              mode: 'index',
              axis: 'x',
              intersect: false,
              callbacks: {
                label: function (tooltipItem, data) {
                  const index = tooltipItem.index;
                  return self.$t('chart.title.network_volume') + ': ' + util.numberWithCommas(data.datasets[0].data[index]);
                }
              }
            },
            scales: {
              yAxes : [{
                ticks: {
                  callback: (label, index, labels) => {
                    return util.numberWithCommas(label);
                  }
                },
                maxTicksLimit: 5
              }]
            },
            legend: {
              display: false
            },
          };

          if (this.topTokenChart) {
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
        const counts = [];
        if (interval === 'H1') {
          const keyedVolumeData = _.keyBy(ret, 'hourSeq');
          for (let seq = ret[0].hourSeq; seq <= ret[ret.length - 1].hourSeq; seq++) {
            labels.push(seq * 3600 * 1000);
            const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
            dataSetData.push(Math.round(volume * 100) / 100);
            counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
          }
        } else if (interval === 'D1') {
          const keyedVolumeData = _.keyBy(ret, 'daySeq');
          for (let seq = ret[0].daySeq; seq <= ret[ret.length - 1].daySeq; seq++) {
            labels.push(seq * 3600 * 24 * 1000);
            const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
            dataSetData.push(Math.round(volume * 100) / 100);
            counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
          }
        }
        return {
          dataSetData: dataSetData,
          counts: counts,
          labels: labels,
        };
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
