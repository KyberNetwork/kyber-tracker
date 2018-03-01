require('dotenv').config();

const _             = require('lodash');
let adapters        = require('./config/Adapters');
const localConfig   = require('./config/Local');
if (localConfig.adapters) {
  adapters = _.merge(adapters, localConfig.adapters);
}

const adapter       = adapters['mysql-master'];
const testAdapter   = adapters['mysql-master-test'];

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host: adapter.dbHost,
      user: adapter.dbUser,
      database: adapter.dbName,
      password: adapter.dbPwd,
      port: adapter.dbPort || 3306,
      charset: 'utf8'
    },
    migrations: {
      directory: './db/migrations_knex'
    },
    seeds: {
      directory: './db/seeds/development'
    }
  },

  test: {
    client: 'mysql',
    connection: {
      host: testAdapter.dbHost,
      user: testAdapter.dbUser,
      database: testAdapter.dbName,
      password: testAdapter.dbPwd,
      port: testAdapter.dbPort || 3306,
      charset: 'utf8'
    },
    migrations: {
      directory: './server/db/migrations_knex'
    },
    seeds: {
      directory: './server/db/seeds/test'
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host: adapter.dbHost,
      user: adapter.dbUser,
      database: adapter.dbName,
      password: adapter.dbPwd,
      port: adapter.dbPort || 3306,
      charset: 'utf8'
    },
    migrations: {
      directory: './db/migrations_knex'
    },
    seeds: {
      directory: './db/seeds/development'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: adapter.dbHost,
      user: adapter.dbUser,
      database: adapter.dbName,
      password: adapter.dbPwd,
      port: adapter.dbPort || 3306,
      charset: 'utf8'
    },
    migrations: {
      directory: './db/migrations_knex'
    },
    seeds: {
      directory: './db/seeds/production'
    }
  }

}
