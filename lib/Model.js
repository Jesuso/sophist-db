'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nSQL = require("nano-sql").nSQL;

var Model = function () {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  function Model(attributes) {
    _classCallCheck(this, Model);

    Object.defineProperty(this, '_attributes', { writable: true, enumerable: false });
    this.setAttributes(attributes);
  }

  /**
   *
   */


  _createClass(Model, [{
    key: 'save',


    /**
     *
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.constructor.db) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return', new Promise(function (res, rej) {
                  setTimeout(function () {
                    _this.save().then(res);
                  }, 100);
                }));

              case 2:
                _context.next = 4;
                return nSQL(this.table).query('upsert', this.attributes).exec();

              case 4:
                result = _context.sent;


                // Update the attributes with the ones provided by the database
                this.attributes = result[0].rows[0];

                _context.next = 8;
                return this.saveRelations();

              case 8:
                return _context.abrupt('return', this);

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function save() {
        return _ref.apply(this, arguments);
      }

      return save;
    }()

    /**
     *
     */

  }, {
    key: 'saveRelations',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, relation, relName, objects, ids, models, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, attributes, model;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context2.prev = 3;
                _iterator = this.relations[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context2.next = 56;
                  break;
                }

                relation = _step.value;

                // Remove the underscore "_" to the relation
                relName = relation.key.replace('_', '');
                objects = this[relName];

                // There's nothing to save, just continue

                if (objects) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt('continue', 53);

              case 11:
                ids = [];
                models = [];

                // Handle Arrays (hasMany)

                if (!Array.isArray(objects)) {
                  _context2.next = 45;
                  break;
                }

                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 17;
                _iterator2 = objects[Symbol.iterator]();

              case 19:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context2.next = 29;
                  break;
                }

                attributes = _step2.value;
                _context2.next = 23;
                return new relation.model(attributes).save();

              case 23:
                model = _context2.sent;

                models.push(model);
                ids.push(model.key);

              case 26:
                _iteratorNormalCompletion2 = true;
                _context2.next = 19;
                break;

              case 29:
                _context2.next = 35;
                break;

              case 31:
                _context2.prev = 31;
                _context2.t0 = _context2['catch'](17);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t0;

              case 35:
                _context2.prev = 35;
                _context2.prev = 36;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 38:
                _context2.prev = 38;

                if (!_didIteratorError2) {
                  _context2.next = 41;
                  break;
                }

                throw _iteratorError2;

              case 41:
                return _context2.finish(38);

              case 42:
                return _context2.finish(35);

              case 43:
                _context2.next = 49;
                break;

              case 45:
                _context2.next = 47;
                return new relation.model(objects).save();

              case 47:
                models = _context2.sent;

                ids.push(models.key);

              case 49:

                this.setAttribute(relation.key, ids);
                this.setAttribute(relName, models);

                // Update database
                _context2.next = 53;
                return nSQL(this.table)
                // .query('upsert', this.attributes, true)
                .updateORM('set', relation.key, ids).where([this.keyAttribute, "=", this.key]).exec();

              case 53:
                _iteratorNormalCompletion = true;
                _context2.next = 5;
                break;

              case 56:
                _context2.next = 62;
                break;

              case 58:
                _context2.prev = 58;
                _context2.t1 = _context2['catch'](3);
                _didIteratorError = true;
                _iteratorError = _context2.t1;

              case 62:
                _context2.prev = 62;
                _context2.prev = 63;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 65:
                _context2.prev = 65;

                if (!_didIteratorError) {
                  _context2.next = 68;
                  break;
                }

                throw _iteratorError;

              case 68:
                return _context2.finish(65);

              case 69:
                return _context2.finish(62);

              case 70:
                return _context2.abrupt('return', true);

              case 71:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[3, 58, 62, 70], [17, 31, 35, 43], [36,, 38, 42], [63,, 65, 69]]);
      }));

      function saveRelations() {
        return _ref2.apply(this, arguments);
      }

      return saveRelations;
    }()

    /**
     *
     */

  }, {
    key: 'isAttribute',


    /**
     *
     */
    value: function isAttribute(attr) {
      return this.constructor.isAttribute(attr);
    }

    /**
     *
     */

  }, {
    key: 'isRelation',
    value: function isRelation(attr) {
      return this.constructor.isRelation(attr);
    }

    /**
     * The model table schema
     */

  }, {
    key: 'getAttribute',


    /**
     *
     */
    value: function getAttribute(attr, def) {
      if (this._attributes[attr]) {
        return this._attributes[attr];
      }

      return def;
    }

    /**
     *
     */

  }, {
    key: 'setAttribute',
    value: function setAttribute(attr, val) {
      var copy = Object.assign({}, this.attributes);

      if (this.isAttribute(attr)) {
        copy[attr] = val;
        this[attr] = val;
      }

      var rel = this.isRelation(attr);
      if (rel) {
        var inflated = [];

        if (Array.isArray(val)) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = val[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var a = _step3.value;

              if (a.constructor.name == rel.model.name) {
                inflated.push(a);
                continue;
              }

              inflated.push(new rel.model(a));
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        } else {
          if (val.constructor.name != rel.model.name) {
            inflated = val;
          } else {
            inflated = new rel.model(val);
          }
        }

        copy[attr] = inflated;
        this[attr] = inflated;
      }

      return this._attributes = copy;
    }

    /**
     *
     */

  }, {
    key: 'setAttributes',
    value: function setAttributes(attributes) {
      for (var attr in attributes) {
        this.setAttribute(attr, attributes[attr]);
      }

      return this.attributes;
    }
  }, {
    key: 'relations',


    /**
     *
     */
    get: function get() {
      return this.constructor.relations;
    }

    /**
     *
     */

  }, {
    key: 'schema',
    get: function get() {
      return this.constructor.schema;
    }
  }, {
    key: 'keyAttribute',
    get: function get() {
      return this.constructor.keyAttribute;
    }
  }, {
    key: 'key',
    get: function get() {
      return this.getAttribute(this.keyAttribute);
    }
  }, {
    key: 'table',
    get: function get() {
      return this.constructor.table;
    }
  }, {
    key: 'attributes',
    get: function get() {
      return this._attributes;
    },
    set: function set(attributes) {
      this.setAttributes(attributes);
    }

    /**
     *
     */

  }, {
    key: 'columnTypes',


    /**
     *
     */
    get: function get() {
      return this.constructor.columnTypes;
    }
  }], [{
    key: 'create',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(attributes) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', new this(attributes).save());

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function create(_x) {
        return _ref3.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'all',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _this2 = this;

        var result, models;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.db) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return', new Promise(function (res, rej) {
                  setTimeout(function () {
                    _this2.all().then(res);
                  }, 100);
                }));

              case 2:
                _context4.next = 4;
                return nSQL(this.table).query('select').exec();

              case 4:
                result = _context4.sent;
                models = [];


                result.forEach(function (result) {
                  models.push(new _this2(result));
                });

                return _context4.abrupt('return', models);

              case 8:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function all() {
        return _ref4.apply(this, arguments);
      }

      return all;
    }()

    /**
     * Returns a single model
     */

  }, {
    key: 'find',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(key) {
        var _this3 = this;

        var orm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                orm = orm.map(function (e) {
                  return '_' + e;
                });
                // If the db isn't ready, delay the execution

                if (this.db) {
                  _context5.next = 3;
                  break;
                }

                return _context5.abrupt('return', new Promise(function (res, rej) {
                  setTimeout(function () {
                    _this3.find(key).then(res).catch(rej);
                  }, 100);
                }));

              case 3:
                return _context5.abrupt('return', new Promise(function (res, rej) {
                  nSQL(_this3.table).query('select').orm(orm).where([_this3.keyAttribute, '=', key]).exec().then(function (result, db) {
                    var attributes = result[0];

                    // Convert the orm back to ids
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                      for (var _iterator4 = orm[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var r = _step4.value;

                        var rel = _this3.isRelation(r.substr(1));
                        attributes[r.substr(1)] = attributes[r];

                        var ids = [];
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                          for (var _iterator5 = attributes[r][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var obj = _step5.value;

                            ids.push(obj[rel.model.keyAttribute]);
                          }
                        } catch (err) {
                          _didIteratorError5 = true;
                          _iteratorError5 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                              _iterator5.return();
                            }
                          } finally {
                            if (_didIteratorError5) {
                              throw _iteratorError5;
                            }
                          }
                        }

                        attributes[r] = ids;
                      }
                    } catch (err) {
                      _didIteratorError4 = true;
                      _iteratorError4 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                          _iterator4.return();
                        }
                      } finally {
                        if (_didIteratorError4) {
                          throw _iteratorError4;
                        }
                      }
                    }

                    var model = new _this3(attributes);
                    res(model);
                  });
                }));

              case 4:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function find(_x3) {
        return _ref5.apply(this, arguments);
      }

      return find;
    }()

    /**
     *
     */

  }, {
    key: 'isAttribute',
    value: function isAttribute(attr) {
      return this.schema.find(function (c) {
        return c.key == attr;
      });
    }
  }, {
    key: 'isRelation',
    value: function isRelation(attr) {
      return this.relations.find(function (c) {
        return c.model && c.key == '_' + attr;
      });
    }
  }, {
    key: 'relations',
    get: function get() {
      return this.schema.filter(function (c) {
        return c.model;
      });
    }
  }, {
    key: 'schema',
    get: function get() {
      throw new Error('Schema not declared');
    }
  }, {
    key: 'keyAttribute',
    get: function get() {
      return 'id';
    }
  }, {
    key: 'table',
    get: function get() {
      return this.name.toLowerCase();
    }
  }, {
    key: 'columnTypes',
    get: function get() {
      return ['string', 'safestr', 'timeId', 'timeIdms', 'uuid', 'int', 'float', 'array', 'map', 'bool', 'blob', 'any',
      // Arrays
      'string[]', 'safestr[]', 'timeId[]', 'timeIdms[]', 'uuid[]', 'int[]', 'float[]', 'array[]', 'map[]', 'bool[]', 'blob[]', 'any[]'];
    }
  }]);

  return Model;
}();

module.exports = Model;