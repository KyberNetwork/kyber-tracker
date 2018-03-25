USE kyber_tracker;
ALTER TABLE kyber_trade MODIFY volume_usd decimal(20,10);
update kyber_trade set volume_eth = null;
ALTER TABLE kyber_trade MODIFY volume_eth decimal(20,10);
update kyber_trade set volume_eth = maker_total_eth, volume_usd = maker_total_usd;
update kyber_trade set volume_eth = taker_total_eth, volume_usd = taker_total_usd where taker_token_symbol = "ETH";