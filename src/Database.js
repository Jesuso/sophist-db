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

      for (let rel of modelClass.relations) {
        if (!rel.key.startsWith('_')) {
          throw new Error('Relations must start with an underscore "_"')
        }

        // converts to getPascalCase. ex: pets to getPets
        let asyncMethodName = rel.key
          .replace('_', ' ')
          .replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
          .replace(' ', '')
          .replace (/^/,'get')

        // model.getPets().then(...)
        modelClass.prototype[asyncMethodName] = async function () {
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

                console.log('Setting ', rel.key, 'to: ', models)
                this.setAttribute(rel.key, models)
                
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
