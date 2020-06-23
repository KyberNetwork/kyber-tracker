
/**
 * This file is auto-generated
 * Please don't update it manually
 * Run command `npm run schema` to re-generate this
 */

 module.exports = { BurnedFeeModel: 
   { block_number: { type: 'number', length: 11 },
     block_hash: { type: 'string', length: 300 },
     block_timestamp: { type: 'number', length: 20 },
     tx: { type: 'string', length: 300 },
     burner_address: { type: 'string', length: 300 },
     burner_contract: { type: 'string', length: 150 },
     reserve_contract: { type: 'string', length: 150 },
     reserve_wallet: { type: 'string', length: 150 },
     amount: { type: 'string', length: 765 },
     year: { type: 'number', length: 4 },
     month: { type: 'number', length: 6 },
     day_seq: { type: 'number', length: 11 },
     hour_seq: { type: 'number', length: 11 },
     minute_seq: { type: 'number', length: 11 } },
  KyberTradeModel: 
   { block_number: { type: 'number', length: 11 },
     block_hash: { type: 'string', length: 300 },
     block_timestamp: { type: 'number', length: 20 },
     tx: { type: 'string', length: 300 },
     unique_tag: { type: 'string', length: 300 },
     source_official: { type: 'number', length: 4 },
     dest_official: { type: 'number', length: 4 },
     source_reserve: { type: 'string', length: 765 },
     dest_reserve: { type: 'string', length: 765 },
     maker_address: { type: 'string', length: 765 },
     maker_token_address: { type: 'string', length: 765 },
     maker_token_decimal: { type: 'number', length: 4 },
     maker_token_symbol: { type: 'string', length: 30 },
     maker_token_amount: { type: 'string', length: 300 },
     taker_address: { type: 'string', length: 765 },
     taker_token_address: { type: 'string', length: 765 },
     taker_token_decimal: { type: 'number', length: 4 },
     taker_token_symbol: { type: 'string', length: 30 },
     taker_token_amount: { type: 'string', length: 300 },
     collected_fees: { type: 'string', length: 765 },
     commission: { type: 'string', length: 765 },
     commission_reserve_address: { type: 'string', length: 765 },
     commission_receive_address: { type: 'string', length: 765 },
     burn_fees: { type: 'string', length: 765 },
     source_burn_fee: { type: 'string', length: 765 },
     dest_burn_fee: { type: 'string', length: 765 },
     source_wallet_fee: { type: 'string', length: 765 },
     dest_wallet_fee: { type: 'string', length: 765 },
     burn_reserve_address: { type: 'string', length: 765 },
     minute_seq: { type: 'number', length: 11 },
     hour_seq: { type: 'number', length: 11 },
     day_seq: { type: 'number', length: 11 },
     month: { type: 'number', length: 6 },
     year: { type: 'number', length: 4 },
     volume_eth: { type: 'number', length: 22 },
     volume_usd: { type: 'number', length: 22 },
     tx_value_eth: { type: 'number', length: 22 },
     tx_value_usd: { type: 'number', length: 22 } 
  },
  ReserveTradeModel: {
    reserve_id: { type: 'number', length: 22 },
    reserve_address: { type: 'string', length: 765 },
    tx: { type: 'string', length: 300 },
    unique_tag: { type: 'string', length: 300 },
    block_number: { type: 'number', length: 11 },
    block_timestamp: { type: 'number', length: 20 },
    source_address: { type: 'string', length: 765 },
    dest_address: { type: 'string', length: 765 },
    eth_wei_value: { type: 'number', length: 22 },
    source_amount: { type: 'number', length: 22 },
    dest_amount: { type: 'number', length: 22 },
    rate: { type: 'number', length: 38 },
    rebate_fee: { type: 'number', length: 22 },
  },
  FeeDistributedModel: {
    tx: { type: 'string', length: 300 },
    unique_tag: { type: 'string', length: 300 },
    block_number: { type: 'number', length: 11 },
    block_timestamp: { type: 'number', length: 20 },
    token_address: { type: 'string', length: 765 },
    fee_wei: { type: 'number', length: 22 },
    fee_wallet: { type: 'string', length: 765 },
  },
  Rate7dModel: 
   { block_number: { type: 'number', length: 11 },
     block_timestamp: { type: 'number', length: 20 },
     base_address: { type: 'string', length: 765 },
     base_symbol: { type: 'string', length: 150 },
     base_decimal: { type: 'number', length: 4 },
     quote_address: { type: 'string', length: 765 },
     quote_symbol: { type: 'string', length: 150 },
     quote_decimal: { type: 'number', length: 4 },
     sell_expected: { type: 'number', length: 38 },
     buy_expected: { type: 'number', length: 38 },
     mid_expected: { type: 'number', length: 38 },
     minute_seq: { type: 'number', length: 11 },
     m5_seq: { type: 'number', length: 11 },
     m15_seq: { type: 'number', length: 11 },
     m30_seq: { type: 'number', length: 11 },
     h2_seq: { type: 'number', length: 11 },
     h4_seq: { type: 'number', length: 11 },
     h6_seq: { type: 'number', length: 11 },
     h12_seq: { type: 'number', length: 11 },
     day_seq: { type: 'number', length: 11 },
     week_seq: { type: 'number', length: 11 },
     month_seq: { type: 'number', length: 11 },
     hour_seq: { type: 'number', length: 11 } },
  RateModel: 
   { block_number: { type: 'number', length: 11 },
     block_timestamp: { type: 'number', length: 20 },
     base_address: { type: 'string', length: 765 },
     base_symbol: { type: 'string', length: 150 },
     base_decimal: { type: 'number', length: 4 },
     quote_address: { type: 'string', length: 765 },
     quote_symbol: { type: 'string', length: 150 },
     quote_decimal: { type: 'number', length: 4 },
     sell_expected: { type: 'number', length: 38 },
     buy_expected: { type: 'number', length: 38 },
     mid_expected: { type: 'number', length: 38 },
     minute_seq: { type: 'number', length: 11 },
     m5_seq: { type: 'number', length: 11 },
     m15_seq: { type: 'number', length: 11 },
     m30_seq: { type: 'number', length: 11 },
     h2_seq: { type: 'number', length: 11 },
     h4_seq: { type: 'number', length: 11 },
     h6_seq: { type: 'number', length: 11 },
     h12_seq: { type: 'number', length: 11 },
     day_seq: { type: 'number', length: 11 },
     week_seq: { type: 'number', length: 11 },
     month_seq: { type: 'number', length: 11 },
     hour_seq: { type: 'number', length: 11 } },
  UserModel: 
   { username: { type: 'string', length: 120 },
     avatar_url: { type: 'string', length: 768 },
     email: { type: 'string', length: 120 },
     password: { type: 'string', length: 384 },
     full_name: { type: 'string', length: 135 } } }