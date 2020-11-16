<template>
  <div>
    <div v-if="!hideSumary" class="chart-summary d-flex flex-row">
      <div class="chart-summary-icon volume ml-3">
        <img src="/images/volume-summary.svg">
      </div>
      <div class="chart-summary-info ml-3">
        <div class="info-label pt-2">
          VOLUME
        </div>
        <div class="info-number font-weight-bold pt-2">
          {{totalVolume}} USD
        </div>
      </div>
    </div>
    <div>
      <canvas :id="elementId" height="300px" class="mt-20"></canvas>
    </div>
  </div>
</template>

<script>

import _ from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../request/AppRequest';
import util from '../helper/util';

export default {
  props: {
    elementId: {
      type: String,
    },
    tokenSymbol: {
      type: String,
      default: null,
    },
    hideSumary: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      chartInstance: undefined,
      totalVolume: 0
    };
  },
  methods: {
    _buildChartData (volumeData, interval) {
      if(!volumeData) return 
      const labels = [];
      const counts = [];
      const dataset = [];
      const eths = [];
      const momentNow = moment.utc()
      if (interval === 'H1') {
        const keyedVolumeData = _.keyBy(volumeData, 'hourSeq');
        const lastHour = momentNow.subtract(1, 'hours').endOf('hour')
        for (let seq = volumeData[0].hourSeq; seq <= volumeData[volumeData.length - 1].hourSeq; seq++) {
          // check if seq > end of last hour -> continue
          const seqMs = seq * 3600 * 1000
          const thisTime = moment(seqMs)
          if(thisTime.isAfter(lastHour)){
            continue;
          }
          labels.push(seqMs);
          const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
          dataset.push(Math.round(volume * 100) / 100);
          const volumeEth = (keyedVolumeData[seq] ? keyedVolumeData[seq].sumEth : 0);
          eths.push(Math.round(volumeEth * 1000) / 1000);
          counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
        }
      } else if (interval === 'D1') {
        const keyedVolumeData = _.keyBy(volumeData, 'daySeq');
        const lastDay = momentNow.subtract(1, 'days').endOf('day')
        for (let seq = volumeData[0].daySeq; seq <= volumeData[volumeData.length - 1].daySeq; seq++) {
          // check if seq > end of last day -> continue
          const seqMs = seq * 3600 * 24 * 1000
          const thisTime = moment(seqMs)
          if(thisTime.isAfter(lastDay)){
            continue;
          }

          labels.push(seqMs);
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
          backgroundColor: 'rgba(139, 206, 241, 0.6)',
          borderColor: 'rgba(139, 206, 241, 0.6)',
          // barRadius: '3px',
          // borderWidth: 2,
          // showLine: true,
          // spanGaps: true,
        }]
      };
    },
    refresh (period, interval, tokenAddress=null) {
      AppRequest.getNetworkVolume(period, interval, tokenAddress, (err, results) => {
        const ctx = document.getElementById(this.elementId);

        // Ignore render chart if the page has been changed and the chart element is omitted
        if (!ctx) {
          return;
        }

        if(!results.count || !results.total) return

        const volumeData = results.count

        const data = this._buildChartData(volumeData, interval);
        const options = this._getChartOptions(interval);
        if (this.chartInstance) {
          this.chartInstance.config.data = data;
          this.chartInstance.options = options;
          this.chartInstance.update(0);
        }
        else {
          this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options,
          });
        }


        if(!results.total[0] || !results.total[0].sum) return
        this.totalVolume = util.numberWithCommas(results.total[0].sum.toFixed(2))
      });
    },
    _getChartOptions (interval) {
      const callbacks = {
        title: (tooltipItem, data) => {
          const index = tooltipItem[0].index;
          const value = data.labels[index];
          const d= moment.utc(value);
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
          // const count = this.$t('chart.title.label_count') + ': ' + util.numberWithCommas(data.counts[index]);
          return [label, eth];
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
        // categoryPercentage: 1,
        // barPercentage: 1,
        barThickness: 'flex',
        ticks: {
          maxRotation: 0,
          fontFamily: "Montserrat, My-Montserrat, sans-serif",
          fontSize: 12,
          maxTicksLimit: 5,
          callback: (label, index, labels) => {
            if (index === 0) {
              return " ";
            }
            const d = moment.utc(label);
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
        responsive: true,
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