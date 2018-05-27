/* eslint no-multi-spaces: ["error", { exceptions: { "VariableDeclarator": true } }] */
const BaseModel         = require('sota-core').load('model/BaseModel');

module.exports = BaseModel.extends({
  classname: 'RateModel',

  $tableName: 'rate',
  $dsConfig: {
    read: 'mysql-slave',
    write: 'mysql-master'
  },

});
