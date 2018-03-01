const _                       = require('lodash');
const ExternalServiceAdapter  = require('sota-core').load('external_service/foundation/ExternalServiceAdapter');
const BaseController          = require('sota-core').load('controller/BaseController');

module.exports = BaseController.extends({
  classname: 'AppController',

});
