'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nSQL = require("nano-sql").nSQL;

var Model = function () {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  function Model(attributes) {
    _classCallCheck(this, Model);

    Object.defineProperty(this, '_attributes', { value: attributes, writable: true });
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

                this.saveRawRelationsTemporarily();

                _context.next = 5;
                return nSQL(this.table).query('upsert', this.attributes).exec();

              case 5:
                result = _context.sent;


                // Update the attributes with the ones provided by the database
                this.attributes = result[0].rows[0];

                _context.next = 9;
                return this.saveTemporaryRawRelations();

              case 9:
                return _context.abrupt('return', this);

              case 10:
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
     * Saves any relation objects in this.attributes on a temporary property
     * to process later (Ex. if 'this' doesn't have an id yet)
     */

  }, {
    key: 'saveRawRelationsTemporarily',
    value: function saveRawRelationsTemporarily() {
      this.temporaryRawRelations = {};

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.relations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var relation = _step.value;

          // Check a possible raw hasOne object
          if (_typeof(this.attributes[relation.key]) == 'object' && !Array.isArray(this.attributes[relation.key])) {
            this.temporaryRawRelations[relation.key] = [this.attributes[relation.key]];
          }

          // If it's an array
          if (Array.isArray(this.attributes[relation.key])) {
            // Check the contents (first element) are objects
            if (_typeof(this.attributes[relation.key][0]) == 'object') {
              this.temporaryRawRelations[relation.key] = this.attributes[relation.key];
            }
          }
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
    }

    /**
     *
     */

  }, {
    key: 'saveTemporaryRawRelations',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, relation, ids, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, attributes, model, _attributes, _model;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 3;
                _iterator2 = this.relations[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context2.next = 52;
                  break;
                }

                relation = _step2.value;

                if (this.temporaryRawRelations[relation.key]) {
                  _context2.next = 9;
                  break;
                }

                return _context2.abrupt('continue', 49);

              case 9:
                ids = [];

                // Handle Arrays (hasMany)

                if (!Array.isArray(this.temporaryRawRelations[relation.key])) {
                  _context2.next = 41;
                  break;
                }

                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context2.prev = 14;
                _iterator3 = this.temporaryRawRelations[relation.key][Symbol.iterator]();

              case 16:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context2.next = 25;
                  break;
                }

                attributes = _step3.value;
                _context2.next = 20;
                return new relation.model(attributes).save();

              case 20:
                model = _context2.sent;

                ids.push(model.key);

              case 22:
                _iteratorNormalCompletion3 = true;
                _context2.next = 16;
                break;

              case 25:
                _context2.next = 31;
                break;

              case 27:
                _context2.prev = 27;
                _context2.t0 = _context2['catch'](14);
                _didIteratorError3 = true;
                _iteratorError3 = _context2.t0;

              case 31:
                _context2.prev = 31;
                _context2.prev = 32;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 34:
                _context2.prev = 34;

                if (!_didIteratorError3) {
                  _context2.next = 37;
                  break;
                }

                throw _iteratorError3;

              case 37:
                return _context2.finish(34);

              case 38:
                return _context2.finish(31);

              case 39:
                _context2.next = 46;
                break;

              case 41:
                _attributes = this.temporaryRawRelations[relation.key];
                _context2.next = 44;
                return new relation.model(_attributes).save();

              case 44:
                _model = _context2.sent;

                ids.push(_model.key);

              case 46:

                this.setAttribute([relation.key], ids);

                // Update database
                _context2.next = 49;
                return nSQL(this.table).updateORM('set', relation.key, ids).where([this.keyAttribute, "=", this.key]).exec();

              case 49:
                _iteratorNormalCompletion2 = true;
                _context2.next = 5;
                break;

              case 52:
                _context2.next = 58;
                break;

              case 54:
                _context2.prev = 54;
                _context2.t1 = _context2['catch'](3);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t1;

              case 58:
                _context2.prev = 58;
                _context2.prev = 59;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 61:
                _context2.prev = 61;

                if (!_didIteratorError2) {
                  _context2.next = 64;
                  break;
                }

                throw _iteratorError2;

              case 64:
                return _context2.finish(61);

              case 65:
                return _context2.finish(58);

              case 66:

                // Clear temporaryRawRelations
                delete this.temporaryRawRelations;
                return _context2.abrupt('return', true);

              case 68:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[3, 54, 58, 66], [14, 27, 31, 39], [32,, 34, 38], [59,, 61, 65]]);
      }));

      function saveTemporaryRawRelations() {
        return _ref2.apply(this, arguments);
      }

      return saveTemporaryRawRelations;
    }()

    /**
     *
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
      var updated = false;

      this.schema.forEach(function (col) {
        if (col.key == attr) {
          copy[attr] = val;
          updated = true;
        }
      });

      if (!updated) {
        throw new Error('Attribute ' + attr + ' doesn\'t exist in this model (' + this.constructor.name + ')');
      }

      return this.attributes = copy;
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
     * The model table schema
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
      this._attributes = attributes;
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

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.db) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt('return', new Promise(function (res, rej) {
                  setTimeout(function () {
                    _this3.find(key).then(res).catch(rej);
                  }, 100);
                }));

              case 2:
                return _context5.abrupt('return', new Promise(function (res, rej) {
                  nSQL(_this3.table).query('select').where([_this3.keyAttribute, '=', key]).exec().then(function (result, db) {
                    var model = new _this3(result[0]);
                    res(model);
                  });
                }));

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function find(_x2) {
        return _ref5.apply(this, arguments);
      }

      return find;
    }()
  }, {
    key: 'relations',
    get: function get() {
      var _this4 = this;

      var relations = [];

      this.schema.forEach(function (column) {
        if (!_this4.columnTypes.includes(column.type)) {
          relations.push(column);
        }
      });

      return relations;
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