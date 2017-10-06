var nSQL = require("nano-sql").nSQL

class Database {
  static async Setup (models) {
    if (this.db) {
      throw new Error('The database was already initialized')
    }

    this.db = nSQL()

    models.forEach(modelClass => {
      nSQL(modelClass.table)
        .model(modelClass.schema)

      // Define model attributes/relations as getters
      for (let attr of modelClass.schema) {
        Object.defineProperty(modelClass.prototype, attr.key, {
          get: function () {
            return this.getAttribute(attr.key)
          }
        })
      }

      for (let rel of modelClass.relations) {
        let methodName = rel.key
          .replace('_', ' ')
          .replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
          .replace(' ', '')
          .replace (/^/,'get')
        
        modelClass.prototype[methodName] = async function () {
          // Relationship rows hold primary keys.
          return new Promise((res, rej) => {
            nSQL(modelClass.table)
              .query("select").orm([rel.key]).where([this.keyAttribute, "=", this.key])
              .exec().then(rows => {
                let models = []
                
                for (let attributes of rows[0][rel.key]) {
                  let model = new rel.model(attributes)
                  models.push(model)
                }
                
                res(models)
            })
          })
        }
      }
    })

    return new Promise ((res, rej) => {
      this.db
        .config({
          persistent: true,
          history:false
        })
        .connect()
        .then((result, db) => {
          models.forEach(modelClass => {
            modelClass.db = db
          })

          res(db)
        })
    })
  }
}

module.exports = Database
