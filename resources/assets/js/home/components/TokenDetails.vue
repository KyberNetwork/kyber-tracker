<template>
  <div class="col-sm-12">
    <div class="panel-heading pb-16">
        <img class="token-logo-detail"  v-bind:src="this.logoUrl">
        <span class="no-margin panel-title">{{this.symbol}} - {{this.tokenName}}
          - <a class="address-link" :href="getAddressLink(this.tokenAddress)" target="_blank">({{getShortedAddr(this.tokenAddress)}})</a>
        </span>
      </div>

    <b-card :header="$t('chart.title.token_volume', [getFilterTokenSymbol()])">
      <b-tab no-body active>
        <chart-volume ref="chartVolume"
          :elementId="'chart-volume'"
          :tokenSymbol="getFilterTokenSymbol()">
        </chart-volume>
      </b-tab>
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
  const GLOBAL_TOKENS = window["GLOBAL_STATE"].tokens
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
        tokens: _.keyBy(_.values(GLOBAL_TOKENS), 'address'),
        selectedPeriod: 'D30',
        selectedInterval: 'D1',
        myChart: undefined,
        symbol: undefined,
        tokenName: undefined,
        tokenAddress: undefined,
        logoUrl: undefined
      };
    },

    methods: {
      refresh() {
        if (!this.$refs.datatable) {
          window.clearInterval(this._refreshInterval);
          return;
        }
        this.symbol = this.getFilterTokenSymbol();
        const tokenInfo = GLOBAL_TOKENS[this.symbol];
        this.tokenName = tokenInfo.name;
        this.tokenAddress = tokenInfo.address;
        //const icon = tokenInfo.icon || (tokenInfo.symbol.toLowerCase() + ".svg");
        // this.logoUrl = "https://raw.githubusercontent.com/KyberNetwork/KyberWallet/master/src/assets/img/tokens/" + icon + "?sanitize=true";
        this.logoUrl = util.getTokenIcon(tokenInfo.symbol, tokenInfo.icon, (replaceUrl) => {this.logoUrl = replaceUrl})
        this.refreshChartsData();
        this.$refs.datatable.fetch();
      },
      getAddressLink(addr){
        return network.endpoints.ethScan + "address/" + addr;
      },
      getShortedAddr(addr){
        return util.shortenAddress(addr, 8, 7)
      },
      getListTitle() {
        return this.$t("common.token_trade_history");
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
          this.$refs.chartVolume.refresh(this.selectedPeriod, this.selectedInterval, this.symbol);
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
