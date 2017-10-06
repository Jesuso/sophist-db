'use strict';

require('babel-polyfill');

var _Database = require('./Database.js');

var _Database2 = _interopRequireDefault(_Database);

var _Model = require('./Model.js');

var _Model2 = _interopRequireDefault(_Model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = { Database: _Database2.default, Model: _Model2.default };