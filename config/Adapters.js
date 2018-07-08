const Const = require('sota-core').load('common/Const');

module.exports = {
  'mysql-master': {
    type: Const.DATA_SOURCE_TYPE.MYSQL,
    connectionLimit: 15,
    waitForConnections: true,
    queueLimit: 30
  },
  'mysql-slave': {
    type: Const.DATA_SOURCE_TYPE.MYSQL,
    connectionLimit: 100,
    waitForConnections: true,
    queueLimit: 200
  },
  'mysql-master-test': {
    type: Const.DATA_SOURCE_TYPE.MYSQL,
    connectionLimit: 2,
    waitForConnections: true,
    queueLimit: 50
  },
  'mysql-slave-test': {
    type: Const.DATA_SOURCE_TYPE.MYSQL,
    connectionLimit: 50,
    waitForConnections: false
  }
}
