let Sophist = require('../lib/')

// Define a model
class Person extends Sophist.Model {
  static get schema () {
    return [ // Table/Store
      { key: 'id', type: 'int', props:['pk'] },
      { key: 'name', type: 'string' },
      { key: 'age', type: 'int' },
      { key: 'pets', type: 'pet[]', props:["ref=>owner"], model: Pet }
    ]
  }

  pets () {
    return this.hasMany('Pet')
  }
}

class Pet extends Sophist.Model {
  static get schema () {
    return [ // Table/Store
      { key: 'id', type: 'int', props:['pk'] },
      { key: 'name', type: 'string' },
      { key: 'owner', type: 'person', props:["ref=>pets"], model: Person }
    ]
  }
}

module.exports = {
  Person,
  Pet
}
