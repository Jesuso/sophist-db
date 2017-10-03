let nSQL = require("nano-sql").nSQL;

class Model {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  constructor (attributes) {
    Object.defineProperty(this, '_attributes', { value: attributes })
    Object.defineProperty(this, '_table', { writable: false })
    Object.defineProperty(this, '_keyAttribute', { value: 'id', writable: true })
  }

  static get schema()
  {
    throw new Error('Schema not declared')
  }

  // Create the model we want to save
  static async create (attributes) {
    return new Promise((res, rej) => {
      nSQL(this.table)
        .query('upsert', attributes)
        .exec()
        .then((result, db) => {
          let model = new this(result[0].rows[0])
          // Grab the last inserted record and inflate it
          res(model)
        })
    })
  }

  static async all () {
    return new Promise((res, rej) => {
      // Get all the models from the db and inflate them
      nSQL(this.table)
        .query('select')
        .exec()
        .then((result, db) => {
          let models = []

          result.forEach(result => {
            models.push(new this(result))
          })

          res(models)
        })
    })
  }

  /**
   * Returns a single model
   */
  static async find (key) {
    return new Promise((res, rej) => {
      nSQL(this.table)
        .query('select')
        .where([this.keyAttribute, '=', key])
        .exec()
        .then((result, db) => {
          let model = new this(result[0])
          res(model)
        })
    })
  }

  static get keyAttribute () {
    return this._keyAttribute ? this._keyAttribute : 'id'
  }

  get keyAttribute () {
    return this._keyAttribute ? this._keyAttribute : 'id'
  }

  static get table() {
    return (new this).table
  }

  get table () {
    return this._table ? this._table : this.constructor.name.toLowerCase()
  }

  get attributes () {
    return this._attributes
  }

  getAttribute (attr, def) {
    if (this._attributes[attr]) {
      return this._attributes[attr]
    }

    return def
  }
}

module.exports = Model
