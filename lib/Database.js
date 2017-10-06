function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var nSQL = require("nano-sql").nSQL;

class Database {
  static Setup(models) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.db) {
        throw new Error('The database was already initialized');
      }

      _this.db = nSQL();

      models.forEach(function (modelClass) {
        nSQL(modelClass.table).model(modelClass.schema);

        // Define model attributes as getters
        modelClass.schema.forEach(function (attr) {
          Object.defineProperty(modelClass.prototype, attr.key, {
            get: function () {
              return this.getAttribute(attr.key);
            }
          });
        });
      });

      return new Promise(function (res, rej) {
        _this.db.config({
          persistent: true,
          history: false
        }).connect().then(function (result, db) {
          models.forEach(function (modelClass) {
            modelClass.db = db;
          });

          res(db);
        });
      });
    })();
  }
}

module.exports = Database;