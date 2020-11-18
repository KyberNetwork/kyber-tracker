<template>
  <div>
    <div class="chart-summary d-flex flex-row">
      <div class="chart-summary-icon unique-traders ml-3">
        <img src="/images/unique-traders.svg">
      </div>
      <div class="chart-summary-info ml-3">
        <div class="info-label pt-2">
          ADDRESSES
        </div>
        <div class="info-number font-weight-bold pt-2">
          {{total}}
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
    },
    data() {
      return {
        chartInstance: undefined,
        total: 0
      };
    },
    methods: {
      _buildChartData(chartData, interval, accumulated) {
        if (!chartData) return 
        const feeData = chartData.count

        if(!feeData || !feeData.length) return 
        const labels = [];
        const dataset = [];
        let lastSum = feeData[0].count;
        const momentNow = moment.utc()
        if (interval === 'H1') {
          const keyedVolumeData = _.keyBy(feeData, 'hour_seq');
          const lastHour = momentNow.subtract(1, 'hours').endOf('hour')
          for (let seq = feeData[0].hourSeq; seq <= feeData[feeData.length - 1].hourSeq; seq++) {
            const seqMs = seq * 3600 * 1000
            const thisTime = moment(seqMs)
            if(thisTime.isAfter(lastHour)){
              continue;
            }

            labels.push(seqMs);
            let volume = 0;
            if (keyedVolumeData[seq]) {
              volume = keyedVolumeData[seq].count;
              lastSum = volume;
            } else {
              volume = (accumulated ? lastSum : 0);
            }
            dataset.push(Math.round(volume * 100) / 100);
          }
        } else if (interval === 'D1') {
          const keyedVolumeData = _.keyBy(feeData, 'day_seq');
          const lastDay = momentNow.subtract(1, 'days').endOf('day')
          for (let seq = feeData[0].day_seq; seq <= feeData[feeData.length - 1].day_seq; seq++) {
            const seqMs = seq * 3600 * 24 * 1000
            const thisTime = moment(seqMs)
            if(thisTime.isAfter(lastDay)){
              continue;
            }

            labels.push(seqMs);
            let volume = 0;
            if (keyedVolumeData[seq]) {
              volume = keyedVolumeData[seq].count;
              lastSum = volume;
            } else {
              volume = (accumulated ? lastSum : 0);
            }
            dataset.push(Math.round(volume * 100) / 100);
          }
        }

        console.log("%%%%%%%%%%%%%%%%%%%%%% dataset %%%%%%%%%%%%%%%%% ", dataset)

        return {
          labels,
          datasets: [{
            data: dataset,
            pointRadius: 0,
            backgroundColor: 'rgba(139, 206, 241, 0.6)',
            borderColor: 'rgba(139, 206, 241, 0.6)',
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
          if(feeData.total){
            this.total = feeData.total
          }
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
            const d = moment.utc(value);
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
            const label = util.numberWithCommas(data.datasets[0].data[index]) + ' Addresses';
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