let nSQL = require("nano-sql").nSQL;

class Model {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  constructor (attributes) {
    Object.defineProperty(this, '_attributes', { value: attributes, writable: true })
    Object.defineProperty(this, '_table', { writable: false })
    Object.defineProperty(this, '_keyAttribute', { value: 'id', writable: true })
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

  async save () {
    return new Promise((res, rej) => {
      nSQL(this.table)
        .query('upsert', this.attributes)
        .exec()
        .then((result, db) => {
          // Update the attributes
          this.attributes = result[0].rows[0]

          // return the updated model
          res(this)
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

  /**
   * The model table schema
   */
  static get schema() {
    throw new Error('Schema not declared')
  }

  get schema() {
    return this.constructor.schema
  }

  static get keyAttribute () {
    return (new this).keyAttribute
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

  set attributes (attributes) {
    this._attributes = attributes
  }

  getAttribute (attr, def) {
    if (this._attributes[attr]) {
      return this._attributes[attr]
    }

    return def
  }

  setAttribute(attr, val) {
    let copy = Object.assign({}, this.attributes)
    let updated = false

    this.schema.forEach(col => {
      if (col.key == attr) {
        copy[attr] = val
        updated = true
      }
    })

    if (!updated) {
      throw new Error('Attribute ' + attr + ' doesn\'t exist in this model ('+ this.constructor.name +')')
    }

    return this.attributes = copy
  }
}

module.exports = Model
