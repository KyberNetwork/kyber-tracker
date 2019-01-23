<template>
  <div class="col-sm-12">
    <div class="panel-heading pb-16">
        <img class="token-logo-detail"  v-bind:src="this.logoUrl">
        <span v-if="this.isOfficial" class="no-margin panel-title">{{this.symbol}} - {{this.tokenName}}
          - <a class="address-link" :href="getAddressLink(this.tokenAddress)" target="_blank">({{getShortedAddr(this.tokenAddress)}})</a>
        </span>
        <span v-else class="no-margin panel-title">
          <a class="address-link" :href="getAddressLink(this.tokenAddress)" target="_blank">{{this.tokenAddress}}</a>
        </span>
      </div>

    <b-card :header="$t('chart.title.token_volume', [''])">
      <b-tab no-body active>
        <chart-volume ref="chartVolume"
          :elementId="'chart-volume'"
          :tokenSymbol="getFilterTokenAddress()">
        </chart-volume>
      </b-tab>
    </b-card>

    <trade-list ref="datatable"
      :title="getListTitle()"
      :getFilterTokenAddress="getFilterTokenAddress">
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
  const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens
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
        tokens: TOKENS_BY_ADDR,
        selectedPeriod: 'D30',
        selectedInterval: 'D1',
        myChart: undefined,
        symbol: undefined,
        tokenName: undefined,
        tokenAddress: undefined,
        logoUrl: undefined,
        isOffcial: undefined
      };
    },

    methods: {
      refresh() {
        if (!this.$refs.datatable) {
          window.clearInterval(this._refreshInterval);
          return;
        }
        this.address = this.getFilterTokenAddress();
        const tokenInfo = this.tokens[this.address];
        this.tokenName = tokenInfo.name;
        this.tokenAddress = tokenInfo.address;
        this.isOfficial = tokenInfo.official;
        //const icon = tokenInfo.icon || (tokenInfo.symbol.toLowerCase() + ".svg");
        // this.logoUrl = "https://raw.githubusercontent.com/KyberNetwork/KyberWallet/master/src/assets/img/tokens/" + icon + "?sanitize=true";
        this.logoUrl = util.getTokenIcon(tokenInfo.symbol, (replaceUrl) => {this.logoUrl = replaceUrl})
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
      getFilterTokenAddress() {
        // const tokenAddr = this.$route.params.tokenAddr;
        // const tokenDef = this.tokens[tokenAddr];
        return this.$route.params.tokenAddr;
      },
      refreshChartsData () {
        if (this.$refs.chartVolume) {
          this.$refs.chartVolume.refresh(this.selectedPeriod, this.selectedInterval, this.symbol);
        }
      },
      getAddressEtherscanLink(addr) {
      return network.endpoints.ethScan + "address/" + addr;
    },
    },

    watch: {
      '$route.query'() {
        this.refresh();
      }
    },

    mounted() {
      this.address = this.getFilterTokenAddress();
      if (!this.address) {
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
