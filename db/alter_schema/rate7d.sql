CREATE TABLE rate7d LIKE rate;
-- first time migrate
insert into rate7d (select * from rate where block_timestamp > UNIX_TIMESTAMP() - 7.1 * 24 * 60 * 60);
select count(*) from rate7d;

SET GLOBAL event_scheduler = ON;
select @@global.event_scheduler;
-- to make it persist
-- SET PERSIST event_scheduler = ON; -- not work
-- SET @@persist.event_scheduler = ON; -- not work
-- sudo nano /etc/mysql/my.cnf
-- [mysqld]
-- event_scheduler=ON

-- event
delimiter #

CREATE EVENT copy_rate7d
   ON SCHEDULE EVERY 10 MINUTE
   COMMENT 'Copy latest rate to rate7d table'
DO 
BEGIN
  SET @max7dblock = (SELECT ifnull(max(block_number),0) FROM rate7d);
  insert ignore into rate7d (select * from rate where block_timestamp > UNIX_TIMESTAMP() - 7.1 * 24 * 60 * 60 and block_number >= @max7dblock);
  delete from rate7d where block_timestamp <= UNIX_TIMESTAMP() - 7.1 * 24 * 60 * 60;
END#

delimiter ;
