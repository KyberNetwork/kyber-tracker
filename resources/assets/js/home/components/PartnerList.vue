<template>
  <div class="col-sm-12">
    <!-- <div class="panel-heading pb-20">
      <span class="no-margin panel-title">{{$t('navigator.top_token')}} </span>
    </div>

    <b-card no-body>
      <div class="chart-period-picker" v-if="$mq !== 'sm' && $mq !== 'ml'">
        <b-button-group class="cus-pagination full-width-btn-group">
          <b-button
            :variant="selectedPeriod === 'H24' ? 'active' : ''"
            @click="selectPeriod('H24', 'H1')">24H
          </b-button>
          <b-button
            :variant="selectedPeriod === 'D7' ? 'active' : ''"
            @click="selectPeriod('D7', 'H1')">7D
          </b-button>
          <b-button
            :variant="selectedPeriod === 'D30' ? 'active' : ''"
            @click="selectPeriod('D30', 'D1')">1M
          </b-button>
          <b-button
            :variant="selectedPeriod === 'Y1' ? 'active' : ''"
            @click="selectPeriod('Y1', 'D1')">1Y
          </b-button>
          <b-button
            :variant="selectedPeriod === 'ALL' ? 'active' : ''"
            @click="selectPeriod('ALL', 'D1')">ALL
          </b-button>
        </b-button-group>
      </div>
      <b-tabs card>
        <b-tab :title="$t('chart.title.top_token')">


          <div class="chart-period-picker text-right pt-2" v-if="$mq == 'sm' || $mq == 'ml'">
            <b-button-group class="cus-pagination full-width-btn-group">
              <b-button
                :variant="selectedPeriod === 'H24' ? 'active' : ''"
                @click="selectPeriod('H24', 'H1')">24H
              </b-button>
              <b-button
                :variant="selectedPeriod === 'D7' ? 'active' : ''"
                @click="selectPeriod('D7', 'H1')">7D
              </b-button>
              <b-button
                :variant="selectedPeriod === 'D30' ? 'active' : ''"
                @click="selectPeriod('D30', 'D1')">1M
              </b-button>
              <b-button
                :variant="selectedPeriod === 'Y1' ? 'active' : ''"
                @click="selectPeriod('Y1', 'D1')">1Y
              </b-button>
              <b-button
                :variant="selectedPeriod === 'ALL' ? 'active' : ''"
                @click="selectPeriod('ALL', 'D1')">ALL
              </b-button>
            </b-button-group>
          </div>


          <chart-token
            ref="chartToken"
            :elementId="'chart-token'">
          </chart-token>
        </b-tab>
      </b-tabs>
    </b-card> -->

    <div class="panel-heading pb-20">
      <span class="no-margin panel-title">{{ $t("common.defi") }} {{data && data.length ? `(${data.length})` : null}}</span>
    </div>

    <div class="table-responsive-wraper">
      <div class="chart-period-picker text-right pt-2">
        <b-button-group class="cus-pagination full-width-btn-group">
          <b-button
            :variant="periodDay === 1 ? 'active' : ''"
            @click="selectPeriod(1)">24H
          </b-button>
          <b-button
            :variant="periodDay ===  7? 'active' : ''"
            @click="selectPeriod(7)">7D
          </b-button>
          <b-button
            :variant="periodDay === 30 ? 'active' : ''"
            @click="selectPeriod(30)">1M
          </b-button>
          <b-button
            :variant="selectedPeriod === 365 ? 'active' : ''"
            @click="selectPeriod(365)">1Y
          </b-button>
          <b-button
            :variant="selectedPeriod === null ? 'active' : ''"
            @click="selectPeriod(null)">ALL
          </b-button>
        </b-button-group>
      </div>

      <div class="pb-3" height="400px">
        <chart-partner
          ref="chartPartner"
          :elementId="'chart-partner'"
          :volumeData="data"
          >
        </chart-partner>
      </div>
    

    
      

      <data-table v-if="($mq == 'md' || $mq == 'lg')" ref="datatable"
          :title="getListTitle()"
          :rows="data"
          >
        <template slot="header">
          <th class="text-center"></th>
          <th class="text-left pl-3">{{ $t("common.source") }}</th>
          <th class="text-left pl-4">{{ $t("common.usd_volume") }}</th>
          <th class="text-left pl-4">{{ $t("common.eth_volume") }}</th>
          <th class="text-left pl-4">{{ $t("common.trades") }}</th>
          <th ></th>
          <!-- <th class="text-right">{{ $t("common.volume_24h_token") }}</th> -->
          <!-- <th></th> -->
        </template>

        <template slot="body" scope="slot">
          <tr class="pointer" @click="toTokenDetails(slot.item.partnerAddress.toLowerCase())">
            <!-- <td class="text-center">{{ (slot.index + 1) }}</td> -->
            <td  class="text-left pl-3">
              <img class="image-inline-td mr-1" :src="partnerIcons[slot.item.partnerAddress.toLowerCase()] || getPartnerImageLink(slot.item)" />            
            </td>
            <td class="text-left pl-5">{{ getpartnerName(slot.item) }}</td>
            <!-- <td class="pl-5">
                <div class="token-name">
                    
                    <span v-if="slot.item.official && slot.item.name">{{ slot.item.name }}</span>
                    <span v-if="!slot.item.official || !slot.item.name"><a class="address-link indicator" @click="toTokenDetails(slot.item.address)">{{getShortedAddr(slot.item.address)}}</a></span>
                    <span v-bind:class="{ fresher: slot.item.isNewToken, delised: slot.item.isDelisted }"></span>
                    <span v-bind:class="{ tooltiptext: slot.item.isNewToken || slot.item.isDelisted }">{{ slot.item.isNewToken || slot.item.isDelisted ? slot.item.isNewToken ? $t("tooltip.new_coin") : $t("tooltip.delisted")  :"" }}</span>
                </div>
            </td> -->
            
            <td class="text-left pl-5" >{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
            <td class="text-left pl-5">{{ formatVolumn(slot.item.volumeETH) }}</td>
            <td class="text-left pl-5">{{ slot.item.trades }}</td>


            <!-- <td class="pointer text-right pr-5" >
              <span class="entypo-dot-3 table-more"></span>
            </td> -->
          </tr>
        </template>
      </data-table>

      <data-table v-if="($mq !== 'md' && $mq !== 'lg')" ref="datatable" class="small-table table-hover"
          :title="getListTitle()"
          :rows="data"
          >
        <template slot="header">
          <th class="text-left pl-4">{{ $t("common.source") }}</th>
          <th class="text-right pr-4">{{ $t("common.volume_24h_usd") }}</th>
          <!-- <th class="text-right pr-4">{{ $t("common.volume_24h_eth") }}</th> -->
          <th class="text-left pl-4">{{ $t("common.trades") }}</th>
        </template>

        <template slot="body" scope="slot">
          <tr @click="toTokenDetails(slot.item.partnerAddress.toLowerCase())">
            <td  class="text-left pl-4">
                {{getpartnerName(slot.item)}}
            </td>
            <td class="text-right pr-4">{{ '$' + formatVolumn(slot.item.volumeUSD) }}</td>
            <!-- <td class="text-right pr-4">{{ formatVolumn(slot.item.volumeETH) }}</td> -->
            <td class="text-right pr-4">{{ slot.item.trades }}</td>
          </tr>
        </template>
      </data-table>
    </div>

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
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens

export default {

  data() {
    return {
      tokens: TOKENS_BY_ADDR,
      selectedPeriod: 'D30',
      selectedInterval: 'D1',
      partnerIcons: {},
      data: [],
      periodDay: 30
    };
  },

  methods: {
    refresh () {
      // this.$refs.datatable.fetch();
      // this.refreshTopTopkensChart(this.selectedPeriod);
      this.getList()
    },
    getListTitle () {
      return '';
    },
    getAddressLink(addr){
      return network.endpoints.ethScan + "address/" + addr;
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 9, 8)
    },
    selectPeriod(periodDay) {
      this.periodDay = periodDay
      this.getList()
    },

    getList() {
      const now = Date.now() / 1000 | 0;
      const timeStamp = this.$route.query.timeStamp
      console.log("+==================", this.selectedPeriod, this.selectedInterval)
      const requestParams = {
        fromDate: this.periodDay ? now - 24 * 60 * 60 * this.periodDay : null,
        toDate: now,
      }
      if(timeStamp) requestParams.timeStamp = timeStamp
      AppRequest.getPartnersList(requestParams).then(data => {
        this.data = data
      })
    },

    shouldShowToken (item) {
      // return !this.tokens[item.symbol].hidden;
      return util.shouldShowToken(item.address)
    },

    // isNewToken(item) {
    //   return util.isNewToken(item.symbol);
    // },
    formatVolumn(number){
      if (!number) return 0
      return (new BigNumber(number.toString())).toFormat(2)
    },
    getpartnerName(partner){
      const partnerAddress = partner.partnerAddress.toLowerCase()
      const partnerName = network.dapps[partnerAddress]
      if(partnerName) return partnerName

      return util.shortenAddress(partnerAddress, 9, 8)
    },
    getPartnerImageLink (partner) {
      // let icon = typeof this.tokens[symbol].icon !== 'undefined' ? this.tokens[symbol].icon : (symbol.toLowerCase() + ".svg");
      // // if (!this.tokens[symbol].hidden) {
      // //   return 'images/tokens/' + icon;
      // // }
      // return "https://raw.githubusercontent.com/KyberNetwork/KyberWallet/master/src/assets/img/tokens/" +
      //    icon + "?sanitize=true";
      const partnerAddress = partner.partnerAddress.toLowerCase()

      if(!this.partnerIcons[partner.address]){
        if(!network.dapps[partnerAddress]) {
          this.partnerIcons[partnerAddress] = "/images/tokens/unknown-token.svg"
        } else {
          
          const partnerName = network.dapps[partnerAddress]
          this.partnerIcons[partnerAddress] = util.getPartnerLogo(partnerName, (replaceUrl) => {
            this.partnerIcons[partnerAddress] = replaceUrl
          })
        }
      }
       
      return this.partnerIcons[partnerAddress]

    },
    
    toTokenDetails (partnerAddress) {
      console.log("---------------- address", partnerAddress, this.partnerIcons, this.partnerIcons[partnerAddress])
      const partnerUrl = network.endpoints.ethScan + "address/" + partnerAddress
      window.open(partnerUrl, '_blank');
      // const tokenInfo = this.tokens[symbol];
      // if (!tokenInfo) {
      //   return;
      // }

      // this.$router.push({
      //   name: 'token-details',
      //   params: {
      //     tokenAddr: tokenInfo.address
      //   }
      // });
    },
    // refreshTopTopkensChart(period) {
    //   console.log("----------- run to refresh -----------")
    //   if (this.$refs.chartPartner) {
        
    //     // this.$refs.chartPartner.refresh(period);

    //     console.log("++++++++++++++++", this.$refs.datatable)
    //   }
    // },

    beforeDestroy() {
      window.clearInterval(this._refreshInterval);
    }
  },

  watch: {

  },

  mounted() {
    this._refreshInterval = window.setInterval(() => {
        this.refresh();
      }, 10000);
    this.refresh();
  },

  destroyed(){
    window.clearInterval(this._refreshInterval)
  }

}
</script>

<style scoped lang="css">
</style>
