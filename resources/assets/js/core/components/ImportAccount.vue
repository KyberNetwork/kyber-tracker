<template>
  <div class="col-sm-12">
    {{address}}
  </div>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import Web3Service from '../helper/web3';
import bowser from 'bowser'

export default {

  data() {
    return {
      address: null
    };
  },

  methods: {
    refresh () {
    },
    getListTitle () {
      return '';
    },
    getList () {
    },
    formatVolumeUSD (item) {
      // return '$' + (new BigNumber(item.volumeUSD.toString())).toFormat(2);
    },
    getTokenImageLink (symbol) {
      // return 'images/tokens/' + this.tokens[symbol].icon;
    },
    toTokenDetails (symbol) {
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
    async connect (e) {   
      if (typeof web3 === "undefined") {
        // this.props.dispatch(throwError(this.props.translate('error.metamask_not_install') || 'Cannot connect to metamask. Please make sure you have metamask installed'))
        alert('Cannot connect to metamask. Please make sure you have metamask installed')
        return
      }            
      var web3Service = new Web3Service(web3)
      
      let browser = bowser.name
      if(browser != 'Chrome' && browser != 'Firefox'){
        if(!web3Service.isTrust()){
          // let erroMsg = this.props.translate("error.browser_not_support_metamask", {browser: browser}) || `Metamask is not supported on ${browser}, you can use Chrome or Firefox instead.`
          alert(`Metamask is not supported on ${browser}, you can use Chrome or Firefox instead.`)
          // this.props.dispatch(throwError(erroMsg))
          return
        }
      }
      let metaMaskAddress = await web3Service.getCoinbase()
      console.log("*******************")
      console.log(metaMaskAddress)
      this.address = metaMaskAddress
      // this.dispatchAccMetamask(web3Service);
    },

    // dispatchAccMetamask(web3Service){
    //   this.props.dispatch(importAccountMetamask(web3Service, BLOCKCHAIN_INFO.networkId,
    //     this.props.ethereum, this.props.tokens, this.props.translate))
    // }
  },

  watch: {

  },

  mounted() {
    this.connect();
  }

}
</script>

<style scoped lang="css">
</style>
