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
import network from '../../../../../config/network';
const GLOBAL_TOKENS = window["GLOBAL_STATE"].tokens
export default {
  props: {
    symbol: {
      type: String,
    },
  },
  data() {
    return {
      tokens: _.keyBy(_.values(GLOBAL_TOKENS), 'symbol')
    };
  },
  methods: {
    getLink () {
      const tokenDef = this.tokens[this.symbol];
      if (!tokenDef) {
        return '';
      }

      return `/tokens/${tokenDef.address}`;
    },
    getAddress(){
      const token = this.tokens[this.symbol]
      if(!token) return ''
      return token.address
    },
    getShortedAddr(addr){
      return util.shortenAddress(addr, 4, 4)
    },
    isOfficial(symbol){
      return util.isOfficial(GLOBAL_TOKENS[symbol])
    },
    onClickToken () {
      const tokenDef = this.tokens[this.symbol];
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
