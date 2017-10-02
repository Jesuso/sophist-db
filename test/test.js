let assert = require('assert');
let Sophist = require('../lib/')
let TM = require('./test-models')

// Models
let Person = TM.Person
let Pet = TM.Pet

describe('Database', () => {
  it('Initializes correctly', done => {
    Sophist.Database.Setup([Person, Pet]).then((result, db) => {
      done()
    })
  })
})

describe('Models', () => {
  let alice_id = null
  let alice = null

  it('Inserts correctly', done => {
    Person.create({ name: "Alice" }).then(model => {
      if (model.getAttribute('name') == 'Alice') {
        alice_id = model.getAttribute('id')
        return done()
      }

      done(new Error('Expected name to be Alice. Got: ' + model.getAttribute('name')))
    })
  })

  it('Selects all', done => {
    Person
      .all()
      .exec()
      .then((models) => {
        done()
      })
  })

  it('Selects one', done => {
    Person
      .find(alice_id)
      .then((model) => {
        alice = model
        done()
      })
  })

  it ('Is the correct class', () => {
    assert.equal('Person', alice.constructor.name)
  })

  it ('Has the correct id', () => {
    assert.equal(alice_id, alice.getAttribute('id'))
  })

  it ('Has the correct name', () => {
    assert.equal('Alice', alice.getAttribute('name'))
  })
});
