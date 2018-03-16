<template>
  <div class="col-sm-12">
    <b-card :header="$t('chart.title.token_volume')">
      <b-tab no-body active>
        <chart-volume ref="chartVolume"
          :elementId="'chart-volume'"
          :tokenSymbol="getFilterTokenSymbol()">
        </chart-volume>
      </b-tab>
    </b-card>

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
        selectedPeriod: 'D30',
        selectedInterval: 'D1',
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
      refreshChartsData () {
        if (this.$refs.chartVolume) {
          this.$refs.chartVolume.refresh(this.selectedPeriod, this.selectedInterval);
        }
      },
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
      this.refreshChartsData();
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
