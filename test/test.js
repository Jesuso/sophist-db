let assert = require('assert');
let Sophist = require('../lib/')
let TM = require('./test-models')

// Models
let Person = TM.Person
let Pet = TM.Pet

describe('Database', () => {
  it('initializes correctly', done => {
    Sophist.Database.Setup([Person, Pet]).then((result, db) => {
      done()
    })
  })
})

describe('Model', () => {
  let alice_id = null
  
  describe('inserts correctly' , () => {
    let alice = null

    it('without errors', done => {
      Person.create({ name: "Alice" }).then(model => {
        alice = model
        alice_id = alice.getAttribute('id')
        done()
      })
    })

    it ('and has the correct class', () => {
      assert.equal(Person.name, alice.constructor.name)
    })

    it ('and has the correct id', () => {
      assert.equal(alice_id, alice.getAttribute('id'))
    })

    it ('and has the correct name', () => {
      assert.equal('Alice', alice.getAttribute('name'))
    })
  })

  describe('can be found', () => {
    let alice = null

    it('without errors', done => {
      Person
        .find(alice_id)
        .then((model) => {
          alice = model
          done()
        })
    })

    it ('and has the correct class', () => {
      assert.equal(Person.name, alice.constructor.name)
    })

    it ('and has the correct id', () => {
      assert.equal(alice_id, alice.getAttribute('id'))
    })

    it ('and has the correct name', () => {
      assert.equal('Alice', alice.getAttribute('name'))
    })
  })

  describe('can be selected in chunks', () => {
    let models = null

    it('Executes successfully', done => {
      Person
        .all()
        .then((results) => {
          models = results
          done()
        })
    })

    describe('and the result', () => {
      it ('is an array', () => {
        assert.ok(Array.isArray(models))
      })

      it ('isn\'t empty', () => {
        assert.ok(models.length > 0)
      })

      it ('contains Persons', () => {
        let model = models[0]
        console.log('Model: ', model)
        assert.equal(Person.name, model.constructor.name)
      })
    })
  })
});
