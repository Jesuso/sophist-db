var nSQL = require("nano-sql").nSQL

class Database {
  static async Setup(models) {
    if (this.db) {
      throw new Error('The database was already initialized')
    }

    this.db = nSQL()

    models.forEach(modelClass => {
      nSQL(modelClass.table)
        .model(modelClass.schema)
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
