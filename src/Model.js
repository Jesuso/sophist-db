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
          let model = new this(result[1][0])
          // Grab the last inserted record and inflate it
          res(model)
        })
    })
  }

  static all () {
    // Get all the models from the db and inflate them
    return nSQL(this.table)
      .query('select')
  }

  /**
   * Returns a single model
   */
  static find (key) {
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
   * @return Promise
   */
  belongsToMany (TargetClass, PivotClass, localKey, foreignKey) {
    return {
      TargetClass,
      PivotClass,
      /**
       * @returns Promise
       */
      save: (data, pivotData) => new Promise((resolve, reject) => {
        console.debug('Model::belongsToMany::save')
        // Instantiate the data in its own model
        let targetModel = new TargetClass(data)

        // Save the model
        targetModel.save().then(() => {
          console.debug('Model::belongsToMany::save - Saved targetModel:', targetModel)
          let pivotModel = new PivotClass(pivotData)
          // Set the targetModel's keyPath in the pivotModel's attributes
          pivotModel.attributes[pivotModel.keyAttribute[0]] = targetModel.key
          // Set the current model's keyPath in the pivotModel's attributes
          pivotModel.attributes[pivotModel.keyAttribute[1]] = this.key
          console.log('PivotModel', pivotModel, pivotModel.keyAttribute, pivotModel.key)

          // Save the pivot
          pivotModel.save().then(() => {
            console.debug('Model::belongsToMany::save - Saved pivotModel:', pivotModel)
            resolve(targetModel, pivotModel)
          }).catch(error => {
            console.error('Model::belongsToMany::save::pivotModel.save()', error)
            throw new Error('Model::belongsToMany::save::pivotModel.save() - Error while saving pivotModel. ' + error.error)
          })
        }).catch(error => {
          console.error('Model::belongsToMany::save::targetModel.save()', error)
          throw new Error('Model::belongsToMany::save() - Error while saving targetModel' + error.error)
        })
      }),
      create: (data, pivotData) => new Promise((resolve, reject) => {
        TargetClass.create(data).then(model => {
          console.debug('Model::belongsToMany::create. Created target model', model)
          PivotClass.create(pivotData).then(pivotModel => {
            console.debug('Model::belongsToMany::create. Created pivot model', pivotModel)
            resolve(model)
          }).error(reject)
        }).catch(error => {
          console.error('Model::belongsToMany::create', error)
          reject(error)
        })
      }),
      find: (key) => new Promise((resolve, reject) => {
        console.debug('Model::belongsToMany::find. Key:', key)
        throw new Error('Not implemented')
      }),
      get: () => new Promise((resolve, reject) => {
        PivotClass.where(foreignKey, this.attributes[localKey]).then(models => {
          resolve(models)
        }).catch(resolve)
      })
    }
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
