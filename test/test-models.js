let Sophist = require('../lib/')

// Define a model
class Person extends Sophist.Model {
  static get schema () {
    return [ // Table/Store
      { key: 'id', type: 'int', props:['pk'] },
      { key: 'name', type: 'string' },
      { key: 'pets', type: 'Pet[]' }
    ]
  }
}

class Pet extends Sophist.Model {
  static get schema () {
    return [ // Table/Store
      { key: 'id', type: 'int', props:['pk'] },
      { key: 'name', type: 'string' },
      { key: 'owner', type: 'Person' }
    ]
  }
}

module.exports = {
  Person,
  Pet
}
