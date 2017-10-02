var nSQL = require("nano-sql").nSQL

class Database {
  static Setup(models) {
    if (this.db) {
      throw new Error('The database was already initialized')
    }

    models.forEach(modelClass => {

      nSQL(modelClass.table)
        .model(modelClass.schema)
    })

    this.db = nSQL()
    
    return this.db
      .config({
        persistent: true,
        history:false
      })
      .connect()
  }
}

module.exports = Database
