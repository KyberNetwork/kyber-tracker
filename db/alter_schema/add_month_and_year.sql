-- SET GLOBAL time_zone = '+00:00'; -- Need super admin right
SET time_zone = '+00:00';
SELECT @@global.time_zone, @@session.time_zone;

ALTER TABLE burned_fee ADD COLUMN month int(6) AFTER amount;
ALTER TABLE burned_fee ADD COLUMN year int(4) AFTER amount;

ALTER TABLE kyber_trade ADD COLUMN month int(6) AFTER day_seq;
ALTER TABLE kyber_trade ADD COLUMN year int(4) AFTER month;

UPDATE burned_fee SET year = YEAR(FROM_UNIXTIME(block_timestamp)), month = CONCAT(YEAR(FROM_UNIXTIME(block_timestamp)), LPAD(MONTH(FROM_UNIXTIME(block_timestamp)), 2, '0'));
UPDATE kyber_trade SET year = YEAR(FROM_UNIXTIME(block_timestamp)), month = CONCAT(YEAR(FROM_UNIXTIME(block_timestamp)), LPAD(MONTH(FROM_UNIXTIME(block_timestamp)), 2, '0'));
