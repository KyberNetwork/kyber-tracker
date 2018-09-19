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
      if(!volumeData) return 
      const labels = [];
      const counts = [];
      const dataset = [];
      const eths = [];
      if (interval === 'H1') {
        const keyedVolumeData = _.keyBy(volumeData, 'hourSeq');
        for (let seq = volumeData[0].hourSeq; seq <= volumeData[volumeData.length - 1].hourSeq; seq++) {
          labels.push(seq * 3600 * 1000);
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
          dataset.push(Math.round(volume * 100) / 100);
          const volumeEth = (keyedVolumeData[seq] ? keyedVolumeData[seq].sumEth : 0);
          eths.push(Math.round(volumeEth * 1000) / 1000);
          counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
        }
      } else if (interval === 'D1') {
        const keyedVolumeData = _.keyBy(volumeData, 'daySeq');
        for (let seq = volumeData[0].daySeq; seq <= volumeData[volumeData.length - 1].daySeq; seq++) {
          labels.push(seq * 3600 * 24 * 1000);
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
          dataset.push(Math.round(volume * 100) / 100);
          const volumeEth = (keyedVolumeData[seq] ? keyedVolumeData[seq].sumEth : 0);
          eths.push(Math.round(volumeEth * 1000) / 1000);
          counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
        }
      }

      return {
        labels,
        counts,
        eths,
        datasets: [{
          data: dataset,
          pointRadius: 0,
          backgroundColor: 'rgba(51,102,204,.3)',
          borderColor: 'rgb(51,102,204)',
          borderWidth: 2,
          showLine: true,
          spanGaps: true,
        }]
      };
    },
    refresh (period, interval, tokenSymbol=null) {
      AppRequest.getNetworkVolume(period, interval, tokenSymbol, (err, volumeData) => {
        const ctx = document.getElementById(this.elementId);

        // Ignore render chart if the page has been changed and the chart element is omitted
        if (!ctx) {
          return;
        }

        const data = this._buildChartData(volumeData, interval);
        const options = this._getChartOptions(interval);
        if (this.chartInstance) {
          this.chartInstance.config.data = data;
          this.chartInstance.options = options;
          this.chartInstance.update(0);
        }
        else {
          this.chartInstance = new Chart(ctx, {
            type: 'LineWithLine',
            data: data,
            options: options,
          });
        }
      });
    },
    _getChartOptions (interval) {
      const callbacks = {
        title: (tooltipItem, data) => {
          const index = tooltipItem[0].index;
          const value = data.labels[index];
          const d= moment(value);
          if(interval === 'H1') {
            return util.getLocale() === 'vi' ? d.format('dddd, D/MM/YYYY, HH:mm UTCZ') : d.format('ddd, MMM Do YYYY, HH:mm UTCZ');
          } else {
            return util.getLocale() === 'vi' ? d.format('dddd, D/MM/YYYY UTC') : d.format('ddd, MMM Do YYYY UTC');
          }
        },
        label: () => {
        },
        afterBody: (tooltipItem, data) => {
          const index = tooltipItem[0].index;
          const label = this.$t('chart.title.label_volume') + ' (USD): $' + util.numberWithCommas(data.datasets[0].data[index]);
          const eth = this.$t('chart.title.label_volume') + ' (ETH): ' + util.numberWithCommas(data.eths[index]);
          const count = this.$t('chart.title.label_count') + ': ' + util.numberWithCommas(data.counts[index]);
          return [label, eth, count];
        }
      };

      const yAxeScale = {
        ticks: {
          beginAtZero: true,
          maxRotation: 0,
          fontFamily: "Montserrat, My-Montserrat, sans-serif",
          fontSize: 12,
          maxTicksLimit: 5,
          callback: (label, index, labels) => {
            return '$' + util.numberWithCommas(label / 1000) + "k";
          }
        }
      };

      const xAxeScale = {
        ticks: {
          maxRotation: 0,
          fontFamily: "Montserrat, My-Montserrat, sans-serif",
          fontSize: 12,
          maxTicksLimit: 5,
          callback: (label, index, labels) => {
            if (index === 0) {
              return " ";
            }
            const d = moment(label);
            if (util.getLocale() === 'vi') {
              return d.format('D/MM');
            } else {
              return d.format('D MMM');
            }
          },
        },
        gridLines: {
            drawBorder: false
        }
      };

      return {
        tooltips: {
          mode: 'index',
          axis: 'x',
          intersect: false,
          fontFamily: "Montserrat, My-Montserrat, sans-serif",
          backgroundColor: 'rgba(25, 46, 59, 0.8)',
          titleFontSize: 13,
          titleFontColor: "#f8f8f8",
          bodyFontSize: 14,
          bodyFontColor: "#f8f8f8",
          bodySpacing: 6,
          titleMarginBottom: 15,
          xPadding: 12,
          yPadding: 12,
          callbacks,
        },
        scales: {
          yAxes: [yAxeScale],
          xAxes: [xAxeScale],
        },
        legend: {
          display: false
        },
        plugins: {
          datalabels: false
        },
        maintainAspectRatio: false
      };
    },
  },
};
</script>