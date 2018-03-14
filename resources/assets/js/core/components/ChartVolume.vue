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
    tokenSymbol: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      chartInstance: undefined
    };
  },
  methods: {
    _buildChartData (volumeData, interval) {
      const labels = [];
      const counts = [];
      const dataset = [];

      if (interval === 'H1') {
        const keyedVolumeData = _.keyBy(volumeData, 'hourSeq');
        for (let seq = volumeData[0].hourSeq; seq <= volumeData[volumeData.length - 1].hourSeq; seq++) {
          labels.push(seq * 3600 * 1000);
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
          dataset.push(Math.round(volume * 100) / 100);
          counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
        }
      } else if (interval === 'D1') {
        const keyedVolumeData = _.keyBy(volumeData, 'daySeq');
        for (let seq = volumeData[0].daySeq; seq <= volumeData[volumeData.length - 1].daySeq; seq++) {
          labels.push(seq * 3600 * 24 * 1000);
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
          dataset.push(Math.round(volume * 100) / 100);
          counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
        }
      }

      return {
        labels,
        counts,
        datasets: [{
          data: dataset,
          pointRadius: 0,
          backgroundColor: 'rgb(148, 190, 190)',
          borderColor: 'rgb(148, 190, 190)',
          showLine: true,
          spanGaps: true,
        }]
      };
    },
    refresh (period, interval) {
      AppRequest.getNetworkVolume(period, interval, (err, volumeData) => {
        const ctx = document.getElementById(this.elementId);
        const data = this._buildChartData(volumeData, interval);
        const options = this._getChartOptions();

        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = undefined;
        }

        this.chartInstance = new Chart(ctx, {
          type: 'LineWithLine',
          data: data,
          options: options,
        });
      });
    },
    _getChartOptions () {
      const callbacks = {
        label: function () {
          return;
        },
        afterBody: function (tooltipItem, data) {
          const index = tooltipItem[0].index;
          const label = 'volume: ' + data.datasets[0].data[index];
          const count = 'trades: ' + data.counts[index];
          return [label, count];
        }
      };

      const yAxeScale = {
        ticks: {
          callback: (label, index, labels) => {
            return '$' + label;
          }
        },
        maxTicksLimit: 5
      };

      const xAxeScale = {
        ticks: {
          callback: (label, index, labels) => {
            const d = moment(label);
            if (util.getLocale() === 'vi') {
              return d.format('DD/MM');
            } else {
              return d.format('MMM DD');
            }
          },
          maxTicksLimit: 5
        }
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
          xAxes: [xAxeScale],
        },
        legend: {
          display: false
        },
        maintainAspectRatio: false,
      };
    },
  },
};
</script>
