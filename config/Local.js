/**
 * Copy the _Local.js.template to Local.js then modify it
 * Here comes your own configuration for local environment
 * This will override all other settings
 * Local.js should be ignored on git repos
 */

module.exports = {
  adapters: {
    'mysql-master' : {
      dbName  : 'kyber_tracker',
      dbUser  : 'root',
      dbPwd   : '1',
      dbHost  : '127.0.0.1',
    },
    'mysql-slave' : {
      dbName  : 'kyber_tracker',
      dbUser  : 'root',
      dbPwd   : '1',
      dbHost  : '127.0.0.1',
    },
    'mysql-master-test' : {
      dbName  : 'kyber_tracker',
      dbUser  : 'root',
      dbPwd   : '1',
      dbHost  : '127.0.0.1',
    },
    'mysql-slave-test' : {
      dbName  : 'kyber_tracker',
      dbUser  : 'root',
      dbPwd   : '1',
      dbHost  : '127.0.0.1',
    },
  }
}
