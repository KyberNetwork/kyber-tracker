require('dotenv').config();

const _             = require('lodash');
const async         = require('async');
const path          = require('path');
const request       = require('superagent');
const requireDir    = require('require-directory');
const SotaCore      = require('sota-core');
SotaCore.configureLogger({
  'appenders': [
    {
      'type': 'clustered',
      'appenders': [
        {
          'type': 'logLevelFilter',
          'level': process.env.LOG_LEVEL || 'ERROR',
          'appender': {
            'type': 'console'
          }
        }
      ]
    }
  ]
});

process.env.PORT = 3333;

before(startServer);

requireDir(module, './app', { recurse: true });
require('./example/Example.spec.js');

function startServer(done) {
  const app = SotaCore.createServer({
    rootDir: path.join(path.resolve('.', 'server'))
  });

  app.start();
  process.nextTick(done);
}

global.requestTest = function (url, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  request
    .get(`http://localhost:${process.env.PORT}${url}`)
    .query(params)
    .end((err, res) => {
      if (err) {
        return callback(err);
      }

      return callback(null, res.body);
    });
}