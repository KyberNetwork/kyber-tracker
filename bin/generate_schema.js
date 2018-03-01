const _                     = require('lodash');
const path                  = require('path');
const FileUtils             = require('sota-core').load('util/FileUtils');
const MySQLSchemaGenerator  = require('sota-core').load('data/mysql/MySQLSchemaGenerator');
let Adapters                = require('../config/Adapters');
const LocalConfig           = require('../config/Local');

run();

function run () {
  if (LocalConfig.adapters) {
    Adapters = _.merge(Adapters, LocalConfig.adapters);
  }

  var rootDir = path.join(path.resolve('.'))
  var coreModelDir = path.resolve(rootDir, './node_modules/sota-core', 'model')
  var appModelDir = path.resolve(rootDir, 'app', 'models')
  var files = FileUtils.listFiles(coreModelDir, {
    regex: /.js$/i,
    isRecursive: false
  })
  files = files.concat(FileUtils.listFiles(appModelDir, {
    regex: /.js$/i,
    isRecursive: true
  }))
  var tables = []
  var config = Adapters['mysql-master']
  var targetFile = path.resolve(rootDir, 'config', 'ModelSchema.js')

  if (!files.length) {
    throw new Error('Model directories are empty: ' + [coreModelDir, appModelDir])
  }

  _.forEach(files, function (file) {
    if (!FileUtils.isFileSync(file)) {
      throw new Error('Invalid model file: ' + file)
    }

    var model = require(file)
    if (model.tableName) {
      tables.push(model)
    }
  })

  var schemaGetter = new MySQLSchemaGenerator(config, tables, targetFile)
  schemaGetter.run()
}
