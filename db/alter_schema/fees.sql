ALTER TABLE kyber_trade CHANGE maker_fee collected_fees varchar(255) NOT NULL DEFAULT 0;
ALTER TABLE kyber_trade CHANGE burn_fees burn_fees varchar(255) NOT NULL DEFAULT 0;
UPDATE kyber_trade SET burn_fees = 0 WHERE burn_fees IS NULL OR burn_fees = "";
ALTER TABLE kyber_trade CHANGE reserve_address burn_reserve_address varchar(255) NOT NULL;
ALTER TABLE kyber_trade CHANGE taker_fee commission varchar(255) NULL DEFAULT 0;
ALTER TABLE kyber_trade ADD COLUMN commission_reserve_address varchar(255) NULL AFTER commission;
ALTER TABLE kyber_trade ADD COLUMN commission_receive_address varchar(255) NULL AFTER commission_reserve_address;

ALTER TABLE burned_fee ADD COLUMN minute_seq int(11) AFTER amount;
ALTER TABLE burned_fee ADD COLUMN hour_seq int(11) AFTER amount;
ALTER TABLE burned_fee ADD COLUMN day_seq int(11) AFTER amount;
UPDATE burned_fee SET minute_seq = FLOOR(block_timestamp / 60), hour_seq = FLOOR(block_timestamp / 3600), day_seq = FLOOR(block_timestamp / 86400);