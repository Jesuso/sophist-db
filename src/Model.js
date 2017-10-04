let nSQL = require("nano-sql").nSQL;

class Model {
  // Column Types: string, safestr, timeId, timeIdms, uuid, int, float, array, map, bool, blob, any

  constructor (attributes) {
    Object.defineProperty(this, '_attributes', { value: attributes, writable: true })
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

    await this.saveTemporaryRelations()

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
      this.temporaryRawRelations[relation.key] = this.attributes[relation.key]
    }
  }

  /**
   *
   */
  async saveTemporaryRelations () {
    for (let relation of this.relations) {
      if (!this.temporaryRawRelations[relation.key]) {
        continue;
      }

      let ids = []

      for (let attributes of this.temporaryRawRelations[relation.key]) {
        let model = await (new relation.model(attributes)).save()
        ids.push(model.key)
      }

      this.setAttribute([relation.key], ids)

      // Update database
      await nSQL(this.table)
        .updateORM('add', relation.key, ids)
        .where([this.keyAttribute, "=", this.key])
        .exec()
    }

    // Clear temporaryRawRelations
    this.temporaryRawRelations = []
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

  /**
   *
   */
  get relations () {
    let relations = []

    this.schema.forEach(column => {
      if (!this.columnTypes.includes(column.type)) {
        relations.push(column)
      }
    })

    return relations
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
    this._attributes = attributes
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
