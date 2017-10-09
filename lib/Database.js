'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nSQL = require("nano-sql").nSQL;

var Database = function () {
  function Database() {
    _classCallCheck(this, Database);
  }

  _createClass(Database, null, [{
    key: 'Setup',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(models) {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.db) {
                  _context2.next = 2;
                  break;
                }

                throw new Error('The database was already initialized');

              case 2:

                this.db = nSQL();

                models.forEach(function (modelClass) {
                  nSQL(modelClass.table).model(modelClass.schema);

                  // Define model attributes/relations as getters
                  // for (let attr of modelClass.schema) {
                  //   Object.defineProperty(modelClass.prototype, attr.key, {
                  //     get: function () {
                  //       return this.getAttribute(attr.key)
                  //     }
                  //   })
                  // }

                  var _loop = function _loop(rel) {
                    // converts to getPascalCase. ex: pets to getPets
                    var asyncMethodName = rel.key.replace('_', ' ').replace(/(\w)(\w*)/g, function (g0, g1, g2) {
                      return g1.toUpperCase() + g2.toLowerCase();
                    }).replace(' ', '').replace(/^/, 'get');

                    // model.getPets().then(...)
                    modelClass.prototype[asyncMethodName] = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                      var _this = this;

                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              return _context.abrupt('return', new Promise(function (res, rej) {
                                nSQL(modelClass.table).query("select").orm([rel.key]).where([_this.keyAttribute, "=", _this.key]).exec().then(function (rows) {
                                  var models = [];

                                  var _iteratorNormalCompletion2 = true;
                                  var _didIteratorError2 = false;
                                  var _iteratorError2 = undefined;

                                  try {
                                    for (var _iterator2 = rows[0][rel.key][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                      var attributes = _step2.value;

                                      var model = new rel.model(attributes);
                                      models.push(model);
                                    }
                                  } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                  } finally {
                                    try {
                                      if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                        _iterator2.return();
                                      }
                                    } finally {
                                      if (_didIteratorError2) {
                                        throw _iteratorError2;
                                      }
                                    }
                                  }

                                  _this.setAttribute('_' + rel.key, models);

                                  res(models);
                                });
                              }));

                            case 1:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      }, _callee, this);
                    }));
                  };

                  var _iteratorNormalCompletion = true;
                  var _didIteratorError = false;
                  var _iteratorError = undefined;

                  try {
                    for (var _iterator = modelClass.relations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var rel = _step.value;

                      _loop(rel);
                    }
                  } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                      }
                    } finally {
                      if (_didIteratorError) {
                        throw _iteratorError;
                      }
                    }
                  }
                });

                return _context2.abrupt('return', new Promise(function (res, rej) {
                  _this2.db.config({
                    persistent: true,
                    history: false
                  }).connect().then(function (result, db) {
                    models.forEach(function (modelClass) {
                      modelClass.db = db;
                    });

                    res(db);
                  });
                }));

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function Setup(_x) {
        return _ref.apply(this, arguments);
      }

      return Setup;
    }()
  }]);

  return Database;
}();

module.exports = Database;