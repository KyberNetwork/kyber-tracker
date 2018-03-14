<template>
  <div>
    <canvas :id="elementId" height="250px" class="mt-20"></canvas>
  </div>
</template>

<script>

  import _ from 'lodash';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';
  import AppRequest from '../request/AppRequest';
  import util from '../helper/util';
  import network from '../../../../../config/network';

  export default {
    props: {
      elementId: {
        type: String,
      },
    },
    data() {
      return {
        chartInstance: undefined
      };
    },
    methods: {
      _buildChartData(ret) {
        const labels = [];
        const dataset = [];

        for (let i = 0; i < ret.length; i++) {
          labels.push(ret[i].symbol);
          dataset.push(Math.round(ret[i].volumeUSD * 100) / 100);
        }

        return {
          labels,
          datasets: [{
            data: dataset,
            pointRadius: 0,
            backgroundColor: ['rgb(240, 219, 121)', 'rgb(57, 146, 202)', 'rgb(226, 79, 139)', 'rgb(141, 198, 196)',
              'rgb(135, 126, 145)', 'rgb(240, 219, 121)', 'rgb(57, 146, 202)', 'rgb(226, 79, 139)', 'rgb(141, 198, 196)',
              'rgb(135, 126, 145)', 'rgb(240, 219, 121)', 'rgb(57, 146, 202)', 'rgb(226, 79, 139)', 'rgb(141, 198, 196)',
              'rgb(135, 126, 145)'],
            showLine: true,
            spanGaps: true,
          }]
        };
      },
      _getChartOptions() {
        const callbacks = {
          label: (tooltipItem, data) => {
            const index = tooltipItem.index;
            return this.$t('chart.title.network_volume') + ': ' + util.numberWithCommas(data.datasets[0].data[index])
              + ' $';
          }
        };

        const yAxeScale = {
          ticks: {
            callback: (label, index, labels) => {
              return util.numberWithCommas(label);
            }
          },
          maxTicksLimit: 5
        };

        return {
          tooltips: {
            mode: 'index',
            axis: 'x',
            intersect: false,
            callbacks,
          },
          scales: {
            yAxes: [yAxeScale],
          },
          legend: {
            display: false
          },
          maintainAspectRatio: false,
        };
      },
      refresh(period) {
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
          const ctx = document.getElementById(this.elementId);
          const data = this._buildChartData(ret);
          const options = this._getChartOptions();

          if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = undefined;
          }

          this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options,
          });
        });
      },
    },
  };
</script>
