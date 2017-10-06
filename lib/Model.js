function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let nSQL = require("nano-sql").nSQL;

class Model {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  constructor(attributes) {
    Object.defineProperty(this, '_attributes', { value: attributes, writable: true });
  }

  /**
   *
   */
  static create(attributes) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return new _this(attributes).save();
    })();
  }

  /**
   *
   */
  save() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      // If the db isn't ready, delay the execution
      if (!_this2.constructor.db) {
        return new Promise(function (res, rej) {
          setTimeout(function () {
            _this2.save().then(res);
          }, 100);
        });
      }

      _this2.saveRawRelationsTemporarily();

      let result = yield nSQL(_this2.table).query('upsert', _this2.attributes).exec();

      // Update the attributes with the ones provided by the database
      _this2.attributes = result[0].rows[0];

      yield _this2.saveTemporaryRelations();

      // return the updated model
      return _this2;
    })();
  }

  /**
   * Saves any relation objects in this.attributes on a temporary property
   * to process later (Ex. if 'this' doesn't have an id yet)
   */
  saveRawRelationsTemporarily() {
    this.temporaryRawRelations = {};

    for (let relation of this.relations) {
      this.temporaryRawRelations[relation.key] = this.attributes[relation.key];
    }
  }

  /**
   *
   */
  saveTemporaryRelations() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      for (let relation of _this3.relations) {
        if (!_this3.temporaryRawRelations[relation.key]) {
          continue;
        }

        let ids = [];

        // Handle Arrays (hasMany)
        if (Array.isArray(_this3.temporaryRawRelations[relation.key])) {
          for (let attributes of _this3.temporaryRawRelations[relation.key]) {
            let model = yield new relation.model(attributes).save();
            ids.push(model.key);
          }
        } else {
          let attributes = _this3.temporaryRawRelations[relation.key];
          let model = yield new relation.model(attributes).save();
          ids.push(model.key);
        }

        _this3.setAttribute([relation.key], ids);

        // Update database
        yield nSQL(_this3.table).updateORM('set', relation.key, ids).where([_this3.keyAttribute, "=", _this3.key]).exec();
      }

      // Clear temporaryRawRelations
      delete _this3.temporaryRawRelations;
      return true;
    })();
  }

  /**
   *
   */
  static all() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      // If the db isn't ready, delay the execution
      if (!_this4.db) {
        return new Promise(function (res, rej) {
          setTimeout(function () {
            _this4.all().then(res);
          }, 100);
        });
      }

      let result = yield nSQL(_this4.table).query('select').exec();

      let models = [];

      result.forEach(function (result) {
        models.push(new _this4(result));
      });

      return models;
    })();
  }

  /**
   * Returns a single model
   */
  static find(key) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      // If the db isn't ready, delay the execution
      if (!_this5.db) {
        return new Promise(function (res, rej) {
          setTimeout(function () {
            _this5.find(key).then(res).catch(rej);
          }, 100);
        });
      }

      return new Promise(function (res, rej) {
        nSQL(_this5.table).query('select').where([_this5.keyAttribute, '=', key]).exec().then(function (result, db) {
          let model = new _this5(result[0]);
          res(model);
        });
      });
    })();
  }

  /**
   *
   */
  get relations() {
    let relations = [];

    this.schema.forEach(column => {
      if (!this.columnTypes.includes(column.type)) {
        relations.push(column);
      }
    });

    return relations;
  }

  /**
   * The model table schema
   */
  static get schema() {
    throw new Error('Schema not declared');
  }

  get schema() {
    return this.constructor.schema;
  }

  static get keyAttribute() {
    return 'id';
  }

  get keyAttribute() {
    return this.constructor.keyAttribute;
  }

  get key() {
    return this.getAttribute(this.keyAttribute);
  }

  static get table() {
    return this.name.toLowerCase();
  }

  get table() {
    return this.constructor.table;
  }

  get attributes() {
    return this._attributes;
  }

  set attributes(attributes) {
    this._attributes = attributes;
  }

  /**
   *
   */
  static get columnTypes() {
    return ['string', 'safestr', 'timeId', 'timeIdms', 'uuid', 'int', 'float', 'array', 'map', 'bool', 'blob', 'any',
    // Arrays
    'string[]', 'safestr[]', 'timeId[]', 'timeIdms[]', 'uuid[]', 'int[]', 'float[]', 'array[]', 'map[]', 'bool[]', 'blob[]', 'any[]'];
  }

  /**
   *
   */
  get columnTypes() {
    return this.constructor.columnTypes;
  }

  /**
   *
   */
  getAttribute(attr, def) {
    if (this._attributes[attr]) {
      return this._attributes[attr];
    }

    return def;
  }

  /**
   *
   */
  setAttribute(attr, val) {
    let copy = Object.assign({}, this.attributes);
    let updated = false;

    this.schema.forEach(col => {
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
}

module.exports = Model;