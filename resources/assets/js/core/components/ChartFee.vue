<template>
  <div>
    <canvas :id="elementId" height="300px" class="mt-20"></canvas>
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
    },
    data() {
      return {
        chartInstance: undefined
      };
    },
    methods: {
      _buildChartData(feeData, interval, accumulated) {
        if(!feeData) return 
        const labels = [];
        const dataset = [];
        let lastSum = feeData[0].sum;
        if (interval === 'H1') {
          const keyedVolumeData = _.keyBy(feeData, 'hourSeq');
          for (let seq = feeData[0].hourSeq; seq <= feeData[feeData.length - 1].hourSeq; seq++) {
            labels.push(seq * 3600 * 1000);
            let volume = 0;
            if (keyedVolumeData[seq]) {
              volume = keyedVolumeData[seq].sum;
              lastSum = volume;
            } else {
              volume = (accumulated ? lastSum : 0);
            }
            dataset.push(Math.round(volume * 100) / 100);
          }
        } else if (interval === 'D1') {
          const keyedVolumeData = _.keyBy(feeData, 'daySeq');
          for (let seq = feeData[0].daySeq; seq <= feeData[feeData.length - 1].daySeq; seq++) {
            labels.push(seq * 3600 * 24 * 1000);
            let volume = 0;
            if (keyedVolumeData[seq]) {
              volume = keyedVolumeData[seq].sum;
              lastSum = volume;
            } else {
              volume = (accumulated ? lastSum : 0);
            }
            dataset.push(Math.round(volume * 100) / 100);
          }
        }

        return {
          labels,
          datasets: [{
            data: dataset,
            pointRadius: 0,
            backgroundColor: (accumulated ? 'rgba(255, 165, 2,.3)' : 'rgba(0,173,168,.3)'),
            borderColor: (accumulated ? 'rgba(255, 165, 2,.3)' : 'rgba(0,173,168,.3)'),
            // borderWidth: 2,
            // showLine: true,
            // spanGaps: true,
            // cubicInterpolationMode: (accumulated ? 'monotone' : 'default')
            //lineTension: 0
          }]
        };
      },
      refresh(period, interval, method) {
        AppRequest[method].call(AppRequest, period, interval, (err, feeData) => {
          const ctx = document.getElementById(this.elementId);

          // Ignore render chart if the page has been changed and the chart element is omitted
          if (!ctx) {
            return;
          }
          
          const accumulated = (method === "getBurnedFees");
          const data = this._buildChartData(feeData, interval, accumulated);
          const options = this._getChartOptions(interval, accumulated);

          if (this.chartInstance) {
            // this.chartInstance.destroy();
            // this.chartInstance = undefined;
            this.chartInstance.config.data = data;
            this.chartInstance.options = options;
            this.chartInstance.update(0);
          } else {
            this.chartInstance = new Chart(ctx, {
              type: 'bar',
              data: data,
              options: options,
            });
          }
        });
      },
      _getChartOptions(interval, accumulated) {
        const callbacks = {
          title: (tooltipItem, data) => {
            const index = tooltipItem[0].index;
            const value = data.labels[index];
            const d = moment(value);
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
            const label = util.numberWithCommas(data.datasets[0].data[index]) + ' KNC';
            return [label];
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
              return accumulated ? util.numberWithCommas(label/1000) + 'k KNC' :  util.numberWithCommas(label) + ' KNC';
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
            }
          },
          gridLines: {
            drawBorder: false
          },
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