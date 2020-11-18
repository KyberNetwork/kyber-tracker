<template>
  <div>
    <canvas :id="elementId" width="500px" height="200px" class="mt-20"></canvas>
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
    _getChartOptions(){
      return {
        responsive: false,
        legend: {
          position: 'right',
          labels: {
            fontStyle: '400',
            fontSize: 11
          }
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return data.labels[tooltipItem.index] + ': ' + data.datasets[0].data[tooltipItem.index] + " USD";
            }
          }
        },
        plugins: {
            datalabels: {
                display: false,
            },
        }
      }
    },
    _buildChartData (volumeData) {
      if(!volumeData || !volumeData.length) return 
      console.log("-------- volume data ----------", volumeData)

      const arrayData = []
      const arrayLabel = []
      const numberOtherIndex  = 6
      let otherVol = 0
      volumeData.map((item,i) => {
        if(i < numberOtherIndex){
          arrayData.push(Math.round(item.volumeUSD))
          arrayLabel.push(this._getPartnerName(item))
        } else {
          otherVol = otherVol + item.volumeUSD
        }
      })
      if(otherVol > 0){
        arrayData.push(Math.round(otherVol))
        arrayLabel.push("Others")
      }

      const ChartData = {
            datasets: [{
                data: arrayData,
                backgroundColor: ['#fb497c', '#ffc760', '#67c22b', '#4fccff', '#4d7bf3', '#214e9f'],
            }],
            labels: arrayLabel
      }
      const eths = [];
      const momentNow = moment.utc()

        // volumeData.map(data => {
        //     ChartData.dataset.data.push(data.volumeETH)
        //     ChartData.labels.push(this._getPartnerName(data))
        // })


      return ChartData;
    },
    _getPartnerName(partner){
        const partnerAddress = partner.partnerAddress.toLowerCase()
        const partnerName = network.dapps[partnerAddress]
        if(partnerName) return partnerName

        return util.shortenAddress(partnerAddress, 9, 8)
    },
    refresh (period, interval, tokenAddress=null) {
      console.log("=============== run to refresh -=================")
      const data = this._buildChartData(volumeData, interval);
      // AppRequest.getNetworkVolume(period, interval, tokenAddress, (err, volumeData) => {
      //   const ctx = document.getElementById(this.elementId);

      //   // Ignore render chart if the page has been changed and the chart element is omitted
      //   if (!ctx) {
      //     return;
      //   }

      //   const data = this._buildChartData(volumeData, interval);
      //   const options = this._getChartOptions(interval);
      //   if (this.chartInstance) {
      //     this.chartInstance.config.data = data;
      //     this.chartInstance.options = options;
      //     this.chartInstance.update(0);
      //   }
      //   else {
      //     this.chartInstance = new Chart(ctx, {
      //       type: 'doughnut',
      //       data: data,
      //       options: options,
      //     });
      //   }
      // });
    },
   
  },
  watch: {
      volumeData(val){
          const newChartData = this._buildChartData(val)
          const ctx = document.getElementById(this.elementId);
          if (!ctx) {
            return;
          }

          const options = this._getChartOptions()
          if (this.chartInstance) {
            this.chartInstance.config.data = newChartData;
            this.chartInstance.options = options
            this.chartInstance.update(0);
          } else {
            this.chartInstance = new Chart(ctx, {
              type: 'doughnut',
              data: newChartData,
              options: options,
            });
          }
        }
  },
  mounted() {
    console.log('-------- mounted')
  }
};
</script>