-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: tracker-prod-replica.crykeebdajmp.ap-southeast-1.rds.amazonaws.com    Database: kyber_tracker
-- ------------------------------------------------------
-- Server version	5.5.5-10.2.12-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `burned_fee`
--

DROP TABLE IF EXISTS `burned_fee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=358 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kyber_trade`
--

DROP TABLE IF EXISTS `kyber_trade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  UNIQUE KEY `kyber_trade_tx_unique` (`tx`),
  KEY `kyber_trade_block_number_index` (`block_number`),
  KEY `kyber_trade_block_hash_index` (`block_hash`),
  KEY `kyber_trade_block_timestamp_index` (`block_timestamp`),
  KEY `kyber_trade_maker_address_index` (`maker_address`),
  KEY `kyber_trade_maker_token_address_index` (`maker_token_address`),
  KEY `kyber_trade_maker_token_symbol_index` (`maker_token_symbol`),
  KEY `kyber_trade_taker_address_index` (`taker_address`),
  KEY `kyber_trade_taker_token_address_index` (`taker_token_address`),
  KEY `kyber_trade_taker_token_symbol_index` (`taker_token_symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=187356 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rate`
--

DROP TABLE IF EXISTS `rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4324271 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rate7d`
--

DROP TABLE IF EXISTS `rate7d`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4324212 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'kyber_tracker'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `copy_rate7d` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = latin1 */ ;;
/*!50003 SET character_set_results = latin1 */ ;;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'UTC' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`tracker_prod`@`%`*/ /*!50106 EVENT `copy_rate7d` ON SCHEDULE EVERY 10 MINUTE STARTS '2018-07-30 09:59:17' ON COMPLETION NOT PRESERVE DISABLE ON SLAVE COMMENT 'Copy latest rate to rate7d table' DO BEGIN
  SET @max7dblock = (SELECT ifnull(max(block_number),0) FROM rate7d);
  insert ignore into rate7d (select * from rate where block_timestamp > UNIX_TIMESTAMP() - 7.1 * 24 * 60 * 60 and block_number >= @max7dblock);
  delete from rate7d where block_timestamp <= UNIX_TIMESTAMP() - 7.1 * 24 * 60 * 60;
END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'kyber_tracker'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-01-26 14:18:13
