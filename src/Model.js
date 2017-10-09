let nSQL = require("nano-sql").nSQL;

class Model {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  constructor (attributes) {
    Object.defineProperty(this, '_attributes', { writable: true, enumerable: false })
    this.setAttributes(attributes)
  }

  /**
   *
   */
  static async create (attributes) {
    return (new this(attributes)).save()
  }

  /**
   *
   */
  async save () {
    // If the db isn't ready, delay the execution
    if (!this.constructor.db) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          this.save().then(res)
        }, 100)
      })
    }

    this.saveRawRelationsTemporarily()

    let result = await nSQL(this.table)
      .query('upsert', this.attributes)
      .exec()

    // Update the attributes with the ones provided by the database
    this.attributes = result[0].rows[0]

    await this.saveTemporaryRawRelations()

    // return the updated model
    return this
  }

  /**
   * Saves any relation objects in this.attributes on a temporary property
   * to process later (Ex. if 'this' doesn't have an id yet)
   */
  saveRawRelationsTemporarily () {
    this.temporaryRawRelations = {}

    for (let relation of this.relations) {
      // Check a possible raw hasOne object
      if (typeof this.attributes[relation.key] == 'object' && !Array.isArray(this.attributes[relation.key])) {
        this.temporaryRawRelations[relation.key] = [this.attributes[relation.key]]
      }

      // If it's an array
      if (Array.isArray(this.attributes[relation.key])) {
        // Check the contents (first element) are objects
        if (typeof this.attributes[relation.key][0] == 'object') {
          this.temporaryRawRelations[relation.key] = this.attributes[relation.key]
        }
      }
    }
  }

  /**
   *
   */
  async saveTemporaryRawRelations () {
    for (let relation of this.relations) {
      if (!this.temporaryRawRelations[relation.key]) {
        continue;
      }

      let ids = []

      // Handle Arrays (hasMany)
      if (Array.isArray(this.temporaryRawRelations[relation.key])) {
        for (let attributes of this.temporaryRawRelations[relation.key]) {
          let model = await (new relation.model(attributes)).save()
          ids.push(model.key)
        }
      } else {
        let attributes = this.temporaryRawRelations[relation.key]
        let model = await (new relation.model(attributes)).save()
        ids.push(model.key)
      }

      this.setAttribute([relation.key], ids)

      // Update database
      await nSQL(this.table)
        .updateORM('set', relation.key, ids)
        .where([this.keyAttribute, "=", this.key])
        .exec()
    }

    // Clear temporaryRawRelations
    delete this.temporaryRawRelations
    return true
  }

  /**
   *
   */
  static async all () {
    // If the db isn't ready, delay the execution
    if (!this.db) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          this.all().then(res)
        }, 100)
      })
    }

    let result = await nSQL(this.table)
      .query('select')
      .exec()

    let models = []

    result.forEach(result => {
      models.push(new this(result))
    })

    return models
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

  static get relations () {
    let relations = []

    this.schema.forEach(column => {
      if (!this.columnTypes.includes(column.type)) {
        relations.push(column)
      }
    })

    return relations
  }

  /**
   *
   */
  get relations () {
    return this.constructor.relations
  }

  /**
   * The model table schema
   */
  static get schema () {
    throw new Error('Schema not declared')
  }

  get schema () {
    return this.constructor.schema
  }

  static get keyAttribute () {
    return 'id'
  }

  get keyAttribute () {
    return this.constructor.keyAttribute
  }

  get key () {
    return this.getAttribute(this.keyAttribute)
  }

  static get table () {
    return this.name.toLowerCase()
  }

  get table () {
    return this.constructor.table
  }

  get attributes () {
    return this._attributes
  }

  set attributes (attributes) {
    this.setAttributes(attributes)
  }

  /**
   *
   */
  static get columnTypes () {
    return [
      'string', 'safestr', 'timeId', 'timeIdms', 'uuid', 'int', 'float',
      'array', 'map', 'bool', 'blob', 'any',
      // Arrays
      'string[]', 'safestr[]', 'timeId[]', 'timeIdms[]', 'uuid[]', 'int[]', 'float[]',
      'array[]', 'map[]', 'bool[]', 'blob[]', 'any[]'
    ]
  }

  /**
   *
   */
  get columnTypes () {
    return this.constructor.columnTypes
  }

  /**
   *
   */
  getAttribute (attr, def) {
    if (this._attributes[attr]) {
      return this._attributes[attr]
    }

    return def
  }

  /**
   *
   */
  setAttribute (attr, val) {
    let copy = Object.assign({}, this.attributes)
    let updated = false

    this.schema.forEach(col => {
      if (attr == col.key) {
        copy[attr] = val
        this[attr] = val
      } else if (attr == '_' + col.key) {
        copy['_' + attr] = val
        this['_' + attr] = val
      }
    })

    return this._attributes = copy
  }

  /**
   *
   */
  setAttributes (attributes) {
    for (let attr in attributes) {
      this.setAttribute(attr, attributes[attr])
    }

    return this.attributes
  }
}

module.exports = Model
