ALTER TABLE `kyber_tracker`.`kyber_trade` 
DROP INDEX `kyber_trade_tx_unique` ;

ALTER TABLE `kyber_tracker`.`kyber_trade` 
ADD COLUMN `unique_tag` VARCHAR(100) NOT NULL AFTER `updated_by`,
ADD UNIQUE INDEX `unique_tag_UNIQUE` (`unique_tag` ASC);
