let assert = require('assert')
let Sophist = require('../lib/')
let TM = require('./test-models')

// Models
let Person = TM.Person
let Pet = TM.Pet

describe('Database', () => {
  it('initializes correctly', done => {
    Sophist.Database.Setup([Person, Pet]).then(() => {
      done()
    })
  })
})