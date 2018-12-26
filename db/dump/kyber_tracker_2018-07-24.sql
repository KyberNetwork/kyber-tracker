# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.5.5-10.2.13-MariaDB)
# Database: kyber_tracker
# Generation Time: 2018-07-24 06:10:38 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table burned_fee
# ------------------------------------------------------------

DROP TABLE IF EXISTS `burned_fee`;

CREATE TABLE `burned_fee` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `block_number` int(11) NOT NULL,
  `block_hash` varchar(100) NOT NULL,
  `block_timestamp` bigint(20) NOT NULL,
  `tx` varchar(100) NOT NULL,
  `burner_address` varchar(100) NOT NULL,
  `burner_contract` varchar(50) NOT NULL DEFAULT '',
  `reserve_contract` varchar(50) NOT NULL DEFAULT '',
  `reserve_wallet` varchar(50) NOT NULL DEFAULT '',
  `amount` varchar(255) DEFAULT NULL,
  `year` int(4) DEFAULT NULL,
  `month` int(6) DEFAULT NULL,
  `day_seq` int(11) DEFAULT NULL,
  `hour_seq` int(11) DEFAULT NULL,
  `minute_seq` int(11) DEFAULT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  `updated_at` bigint(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `burned_fee_tx_unique` (`tx`),
  KEY `burned_fee_block_number_index` (`block_number`),
  KEY `burned_fee_block_hash_index` (`block_hash`),
  KEY `burned_fee_block_timestamp_index` (`block_timestamp`),
  KEY `burned_fee_burner_address_index` (`burner_address`),
  KEY `burned_fee_burner_contract_index` (`burner_contract`),
  KEY `burned_fee_reserve_contract_index` (`reserve_contract`),
  KEY `burned_fee_reserve_wallet_index` (`reserve_wallet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table kyber_trade
# ------------------------------------------------------------

DROP TABLE IF EXISTS `kyber_trade`;

CREATE TABLE `kyber_trade` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `block_number` int(11) NOT NULL,
  `block_hash` varchar(100) NOT NULL,
  `block_timestamp` bigint(20) NOT NULL,
  `tx` varchar(100) NOT NULL,
  `maker_address` varchar(255) NOT NULL,
  `maker_token_address` varchar(255) NOT NULL,
  `maker_token_symbol` varchar(10) NOT NULL,
  `maker_token_amount` varchar(100) NOT NULL,
  `taker_address` varchar(255) NOT NULL,
  `taker_token_address` varchar(255) NOT NULL,
  `taker_token_symbol` varchar(10) NOT NULL,
  `taker_token_amount` varchar(100) NOT NULL,
  `collected_fees` varchar(255) NOT NULL DEFAULT '0',
  `commission` varchar(255) NOT NULL DEFAULT '0',
  `commission_reserve_address` varchar(255) DEFAULT NULL,
  `commission_receive_address` varchar(255) DEFAULT NULL,
  `burn_fees` varchar(255) NOT NULL DEFAULT '0',
  `burn_reserve_address` varchar(255) NOT NULL,
  `minute_seq` int(11) DEFAULT NULL,
  `hour_seq` int(11) DEFAULT NULL,
  `day_seq` int(11) DEFAULT NULL,
  `month` int(6) DEFAULT NULL,
  `year` int(4) DEFAULT NULL,
  `volume_eth` decimal(20,10) DEFAULT NULL,
  `volume_usd` decimal(20,10) DEFAULT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  `updated_at` bigint(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  -- UNIQUE KEY `kyber_trade_tx_unique` (`tx`),
  KEY `kyber_trade_block_number_index` (`block_number`),
  KEY `kyber_trade_block_hash_index` (`block_hash`),
  KEY `kyber_trade_block_timestamp_index` (`block_timestamp`),
  KEY `kyber_trade_maker_address_index` (`maker_address`),
  KEY `kyber_trade_maker_token_address_index` (`maker_token_address`),
  KEY `kyber_trade_maker_token_symbol_index` (`maker_token_symbol`),
  KEY `kyber_trade_taker_address_index` (`taker_address`),
  KEY `kyber_trade_taker_token_address_index` (`taker_token_address`),
  KEY `kyber_trade_taker_token_symbol_index` (`taker_token_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table rate
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rate`;

CREATE TABLE `rate` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `block_number` int(11) NOT NULL,
  `block_timestamp` bigint(20) NOT NULL,
  `base_address` varchar(255) NOT NULL DEFAULT '',
  `base_symbol` varchar(50) NOT NULL DEFAULT '',
  `quote_address` varchar(255) NOT NULL DEFAULT '',
  `quote_symbol` varchar(50) NOT NULL DEFAULT '',
  `sell_expected` decimal(36,18) NOT NULL,
  `buy_expected` decimal(36,18) NOT NULL,
  `mid_expected` decimal(36,18) NOT NULL,
  `minute_seq` int(11) NOT NULL,
  `m5_seq` int(11) NOT NULL,
  `m15_seq` int(11) NOT NULL,
  `m30_seq` int(11) NOT NULL,
  `h2_seq` int(11) NOT NULL,
  `h4_seq` int(11) NOT NULL,
  `h6_seq` int(11) NOT NULL,
  `h12_seq` int(11) NOT NULL,
  `day_seq` int(11) NOT NULL,
  `week_seq` int(11) NOT NULL,
  `month_seq` int(11) NOT NULL,
  `hour_seq` int(11) NOT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  `updated_at` bigint(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `block_pair_unique` (`block_number`,`base_symbol`,`quote_symbol`),
  KEY `hour_seq` (`hour_seq`),
  KEY `h2_seq` (`h2_seq`),
  KEY `h4_seq` (`h4_seq`),
  KEY `h6_seq` (`h6_seq`),
  KEY `h12_seq` (`h12_seq`),
  KEY `day_seq` (`day_seq`),
  KEY `base_symbol` (`base_symbol`),
  KEY `quote_symbol` (`quote_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table rate7d
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rate7d`;

CREATE TABLE `rate7d` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `block_number` int(11) NOT NULL,
  `block_timestamp` bigint(20) NOT NULL,
  `base_address` varchar(255) NOT NULL DEFAULT '',
  `base_symbol` varchar(50) NOT NULL DEFAULT '',
  `quote_address` varchar(255) NOT NULL DEFAULT '',
  `quote_symbol` varchar(50) NOT NULL DEFAULT '',
  `sell_expected` decimal(36,18) NOT NULL,
  `buy_expected` decimal(36,18) NOT NULL,
  `mid_expected` decimal(36,18) NOT NULL,
  `minute_seq` int(11) NOT NULL,
  `m5_seq` int(11) NOT NULL,
  `m15_seq` int(11) NOT NULL,
  `m30_seq` int(11) NOT NULL,
  `h2_seq` int(11) NOT NULL,
  `h4_seq` int(11) NOT NULL,
  `h6_seq` int(11) NOT NULL,
  `h12_seq` int(11) NOT NULL,
  `day_seq` int(11) NOT NULL,
  `week_seq` int(11) NOT NULL,
  `month_seq` int(11) NOT NULL,
  `hour_seq` int(11) NOT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  `updated_at` bigint(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `block_pair_unique` (`block_number`,`base_symbol`,`quote_symbol`),
  KEY `hour_seq` (`hour_seq`),
  KEY `h2_seq` (`h2_seq`),
  KEY `h4_seq` (`h4_seq`),
  KEY `h6_seq` (`h6_seq`),
  KEY `h12_seq` (`h12_seq`),
  KEY `day_seq` (`day_seq`),
  KEY `base_symbol` (`base_symbol`),
  KEY `quote_symbol` (`quote_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `avatar_url` varchar(256) DEFAULT NULL,
  `email` varchar(40) NOT NULL,
  `password` varchar(128) DEFAULT NULL,
  `full_name` varchar(45) NOT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  `updated_at` bigint(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_username_unique` (`username`),
  UNIQUE KEY `user_email_unique` (`email`),
  KEY `user_full_name_index` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
