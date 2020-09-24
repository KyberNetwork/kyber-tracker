<template>
  <div>
    <canvas :id="elementId" height="300px" class="mt-20"></canvas>
  </div>
</template>

<script>

import _ from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import network from '../../../../../config/network';
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
    volumeData: {
        type: Array,
        default: [],
    }
  },
  data() {
    return {
      chartInstance: undefined
    };
  },
  methods: {
    _buildChartData (volumeData) {
      if(!volumeData || !volumeData.length) return 

      const ChartData = {
            datasets: [{
                data: []
            }],
            labels: []
      }
      const eths = [];
      const momentNow = moment.utc()

        volumeData.map(data => {
            ChartData.dataset.data.push(data.volumeETH)
            ChartData.labels.push(this._getPartnerName(data))
        })


      return ChartData;
    },
    _getPartnerName(partner){
        const partnerAddress = partner.partnerAddress.toLowerCase()
        const partnerName = network.dapps[partnerAddress]
        if(partnerName) return partnerName

        return util.shortenAddress(partnerAddress, 9, 8)
    },
    // refresh (period, interval, tokenAddress=null) {
    //   AppRequest.getNetworkVolume(period, interval, tokenAddress, (err, volumeData) => {
    //     const ctx = document.getElementById(this.elementId);

    //     // Ignore render chart if the page has been changed and the chart element is omitted
    //     if (!ctx) {
    //       return;
    //     }

    //     const data = this._buildChartData(volumeData, interval);
    //     const options = this._getChartOptions(interval);
    //     if (this.chartInstance) {
    //       this.chartInstance.config.data = data;
    //       this.chartInstance.options = options;
    //       this.chartInstance.update(0);
    //     }
    //     else {
    //       this.chartInstance = new Chart(ctx, {
    //         type: 'doughnut',
    //         data: data,
    //         options: options,
    //       });
    //     }
    //   });
    // },
    // _getChartOptions (interval) {
    //   const callbacks = {
    //     title: (tooltipItem, data) => {
    //       const index = tooltipItem[0].index;
    //       const value = data.labels[index];
    //       const d= moment.utc(value);
    //       if(interval === 'H1') {
    //         return util.getLocale() === 'vi' ? d.format('dddd, D/MM/YYYY, HH:mm UTCZ') : d.format('ddd, MMM Do YYYY, HH:mm UTCZ');
    //       } else {
    //         return util.getLocale() === 'vi' ? d.format('dddd, D/MM/YYYY UTC') : d.format('ddd, MMM Do YYYY UTC');
    //       }
    //     },
    //     label: () => {
    //     },
    //     afterBody: (tooltipItem, data) => {
    //       const index = tooltipItem[0].index;
    //       const label = this.$t('chart.title.label_volume') + ' (USD): $' + util.numberWithCommas(data.datasets[0].data[index]);
    //       const eth = this.$t('chart.title.label_volume') + ' (ETH): ' + util.numberWithCommas(data.eths[index]);
    //       const count = this.$t('chart.title.label_count') + ': ' + util.numberWithCommas(data.counts[index]);
    //       return [label, eth, count];
    //     }
    //   };

    //   const yAxeScale = {
    //     ticks: {
    //       beginAtZero: true,
    //       maxRotation: 0,
    //       fontFamily: "Montserrat, My-Montserrat, sans-serif",
    //       fontSize: 12,
    //       maxTicksLimit: 5,
    //       callback: (label, index, labels) => {
    //         return '$' + util.numberWithCommas(label / 1000) + "k";
    //       }
    //     }
    //   };

    //   const xAxeScale = {
    //     // categoryPercentage: 1,
    //     // barPercentage: 1,
    //     barThickness: 'flex',
    //     ticks: {
    //       maxRotation: 0,
    //       fontFamily: "Montserrat, My-Montserrat, sans-serif",
    //       fontSize: 12,
    //       maxTicksLimit: 5,
    //       callback: (label, index, labels) => {
    //         if (index === 0) {
    //           return " ";
    //         }
    //         const d = moment.utc(label);
    //         if (util.getLocale() === 'vi') {
    //           return d.format('D/MM');
    //         } else {
    //           return d.format('D MMM');
    //         }
    //       },
    //     },
    //     gridLines: {
    //         drawBorder: false
    //     }
    //   };

    //   return {
    //     responsive: true,
    //     tooltips: {
    //       mode: 'index',
    //       axis: 'x',
    //       intersect: false,
    //       fontFamily: "Montserrat, My-Montserrat, sans-serif",
    //       backgroundColor: 'rgba(25, 46, 59, 0.8)',
    //       titleFontSize: 13,
    //       titleFontColor: "#f8f8f8",
    //       bodyFontSize: 14,
    //       bodyFontColor: "#f8f8f8",
    //       bodySpacing: 6,
    //       titleMarginBottom: 15,
    //       xPadding: 12,
    //       yPadding: 12,
    //       callbacks,
    //     },
    //     scales: {
    //       yAxes: [yAxeScale],
    //       xAxes: [xAxeScale],
    //     },
    //     legend: {
    //       display: false
    //     },
    //     plugins: {
    //       datalabels: false
    //     },
    //     maintainAspectRatio: false
    //   };
    // },
  },
  watch: {
      volumeData(val){
          const newChartData = this._buildChartData(val)

          if (this.chartInstance) {
            this.chartInstance.config.data = newChartData;
            // this.chartInstance.options = options;
            // this.chartInstance.update(0);
            }
            else {
                this.chartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: newChartData,
                });
            }
            
        }
  },
};
</script>