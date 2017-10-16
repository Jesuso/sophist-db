let Sophist = require('../lib/')

// Define a model
class Person extends Sophist.Model {
  static get schema () {
    return [ // Table/Store
      { key: 'id', type: 'int', props:['pk'] },
      { key: 'name', type: 'string' },
      { key: 'age', type: 'int' },
      { key: '_pets', type: 'pet[]', props:["ref=>_owner"], model: Pet }
    ]
  }
}

class Pet extends Sophist.Model {
  static get schema () {
    return [ // Table/Store
      { key: 'id', type: 'int', props:['pk'] },
      { key: 'name', type: 'string' },
      { key: '_owner', type: 'person', props:["ref=>_pets"], model: Person }
    ]
  }
}

module.exports = {
  Person,
  Pet
}
