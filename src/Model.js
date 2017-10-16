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

    let result = await nSQL(this.table)
      .query('upsert', this.attributes)
      .exec()

    // Update the attributes with the ones provided by the database
    this.attributes = result[0].rows[0]

    await this.saveRelations()

    // return the updated model
    return this
  }

  /**
   *
   */
  async saveRelations () {
    for (let relation of this.relations) {
      // Remove the underscore "_" to the relation
      let relName = relation.key.replace('_', '')
      let objects = this[relName]

      // There's nothing to save, just continue
      if (!objects) {
        continue;
      }

      let ids = []
      let models = []

      // Handle Arrays (hasMany)
      if (Array.isArray(objects)) {
        for (let attributes of objects) {
          let model = await (new relation.model(attributes)).save()
          models.push(model)
          ids.push(model.key)
        }
      } else {
        models = await (new relation.model(objects)).save()
        ids.push(models.key)
      }

      this.setAttribute(relation.key, ids)
      this.setAttribute(relName, models)

      // Update database
      await nSQL(this.table)
        // .query('upsert', this.attributes, true)
        .updateORM('set', relation.key, ids)
        .where([this.keyAttribute, "=", this.key])
        .exec()
    }

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
  static async find (key, orm = []) {
    orm = orm.map(e => '_'+e)
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
        .orm(orm)
        .where([this.keyAttribute, '=', key])
        .exec()
        .then((result, db) => {
          let attributes = result[0]

          // Convert the orm back to ids
          for (let r of orm) {
            let rel = this.isRelation(r.substr(1))
            attributes[r.substr(1)] = attributes[r]

            let ids = []
            for (let obj of attributes[r]) {
              ids.push(obj[rel.model.keyAttribute])
            }
            attributes[r] = ids
          }

          let model = new this(attributes)
          res(model)
        })
    })
  }

  /**
   *
   */
  static get relations () {
    return this.schema.filter(c => c.model)
  }

  /**
   *
   */
  get relations () {
    return this.constructor.relations
  }

  /**
   *
   */
  static isAttribute (attr) {
    return this.schema.find(c => c.key == attr)
  }

  /**
   *
   */
  isAttribute (attr) {
    return this.constructor.isAttribute(attr)
  }

  /**
   *
   */
  static isRelation (attr) {
    return this.relations.find(c => c.model && c.key == '_' + attr)
  }

  isRelation (attr) {
    return this.constructor.isRelation(attr)
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

    if (this.isAttribute(attr)) {
      copy[attr] = val
      this[attr] = val
    }

    let rel = this.isRelation(attr)
    if (rel) {
      let inflated = []

      if (Array.isArray(val)) {
        for (let a of val) {
          if (a.constructor.name == rel.model.name) {
            inflated.push(a)
            continue
          }
          
          inflated.push(new rel.model(a))
        }
      } else {
        if (val.constructor.name != rel.model.name) {
          inflated = val
        } else {
          inflated = new rel.model(val)
        }
      }
      
      copy[attr] = inflated
      this[attr] = inflated
    }

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
