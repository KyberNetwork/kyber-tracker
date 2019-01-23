<template>
  <span v-if="isOfficial(symbol)" @click.stop="onClickToken()">{{ symbol }}</span>
  <span v-else @click.stop="onClickToken()">({{ getShortedAddr(getAddress())}})</span>
</template>

<script>

import _ from 'lodash';
import io from 'socket.io-client';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import AppRequest from '../request/AppRequest';
import util from '../helper/util';
// import network from '../../../../../config/network';
const TOKENS_BY_ADDR = window["GLOBAL_STATE"].tokens
export default {
  props: {
    address: {
      type: String,
    },
  },
  data() {
    return {
      // tokens: _.keyBy(_.values(TOKENS_BY_ADDR), 'symbol')
      tokens: TOKENS_BY_ADDR
    };
  },
  methods: {
    getLink () {
      const tokenDef = this.tokens[this.address && this.address.toLowerCase()];
      if (!tokenDef) {
        return '';
      }

      return `/tokens/${this.address}`;
    },
    getAddress(){
      const token = this.tokens[this.address]
      if(!token) return ''
      return token.address
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 4, 4)
    },
    isOfficial(address){
      return util.isOfficial(TOKENS_BY_ADDR[address.toLowerCase()])
    },
    onClickToken () {
      const tokenDef = this.tokens[this.address && this.address.toLowerCase()];
      if (!tokenDef) {
        return;
      }

      this.$router.replace({
        name: 'token-details',
        params: {
          tokenAddr: tokenDef.address
        }
      });
    },
  },
};
</script>
