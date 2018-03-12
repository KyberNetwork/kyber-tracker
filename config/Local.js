/**
 * Copy the _Local.js.template to Local.js then modify it
 * Here comes your own configuration for local environment
 * This will override all other settings
 * Local.js should be ignored on git repos
 */

module.exports = {
  adapters: {
    'mysql-master' : {
      dbName  : process.env.MYSQL_DBNAME,
      dbUser  : process.env.MYSQL_USERNAME,
      dbPwd   : process.env.MYSQL_PASSWORD,
      dbHost  : process.env.MYSQL_DB_HOST,
      dbPort  : process.env.MYSQL_DB_PORT,
    },
    'mysql-slave' : {
      dbName  : process.env.MYSQL_DBNAME,
      dbUser  : process.env.MYSQL_USERNAME,
      dbPwd   : process.env.MYSQL_PASSWORD,
      dbHost  : process.env.MYSQL_DB_HOST,
      dbPort  : process.env.MYSQL_DB_PORT,
    },
    'mysql-master-test' : {
      dbName  : process.env.MYSQL_DBNAME,
      dbUser  : process.env.MYSQL_USERNAME,
      dbPwd   : process.env.MYSQL_PASSWORD,
      dbHost  : process.env.MYSQL_DB_HOST,
      dbPort  : process.env.MYSQL_DB_PORT,
    },
    'mysql-slave-test' : {
      dbName  : process.env.MYSQL_DBNAME,
      dbUser  : process.env.MYSQL_USERNAME,
      dbPwd   : process.env.MYSQL_PASSWORD,
      dbHost  : process.env.MYSQL_DB_HOST,
      dbPort  : process.env.MYSQL_DB_PORT,
    },
  }
}
