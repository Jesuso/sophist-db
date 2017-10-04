let nSQL = require("nano-sql").nSQL;

class Model {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  constructor (attributes) {
    Object.defineProperty(this, '_attributes', { value: attributes, writable: true })
  }

  // Create the model we want to save
  static async create (attributes) {
    // If the db isn't ready, delay the execution
    if (!this.db) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          this.create(attributes).then(res).catch(rej)
        }, 100)
      })
    }

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
    // If the db isn't ready, delay the execution
    if (!this.constructor.db) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          this.save().then(res)
        }, 100)
      })
    }

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
    // If the db isn't ready, delay the execution
    if (!this.db) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          this.all().then(res)
        }, 100)
      })
    }
    
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
    // If the db isn't ready, delay the execution
    if (!this.db) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          this.find(key).then(res).catch(rej)
        }, 100)
      })
    }

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
    return 'id'
  }

  get keyAttribute () {
    return this.constructor.keyAttribute
  }

  static get table() {
    return this.name.toLowerCase()
  }

  get table () {
    return this.constructor.table
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
