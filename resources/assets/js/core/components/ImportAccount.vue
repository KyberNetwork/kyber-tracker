<template>
  <div class="col-sm-12">
    {{addresses}}
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
      addresses: []
    };
  },

  methods: {
    refresh () {
    },
    async connectMetaMask (e) {   
      if (typeof web3 === "undefined") {
        alert('Cannot connect to metamask. Please make sure you have metamask installed')
        return
      }            
      var web3Service = new Web3Service(web3)
      
      let browser = bowser.name
      if(browser != 'Chrome' && browser != 'Firefox'){
        if(!web3Service.isTrust()){
          alert(`Metamask is not supported on ${browser}, you can use Chrome or Firefox instead.`)
          return
        }
      }

      try{
        let addresses = await web3Service.getAllAddresses()
        console.log("*******************")
        console.log(addresses)
        this.addresses = addresses
      } catch(e){
        alert(e)
      }
    },
  },

  watch: {

  },

  mounted() {
    this.connectMetaMask();
  }

}
</script>

<style scoped lang="css">
</style>
