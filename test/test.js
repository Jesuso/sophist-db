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

describe('Model', () => {
  let alice_id = null
  let alice = null
  
  describe('inserts correctly' , () => {

    it('without errors', done => {
      Person.create({ name: 'Alice', age: 21 }).then(model => {
        alice = model
        alice_id = alice.id
        done()
      })
    })

    it('and has the correct class', () => {
      assert.equal(Person.name, alice.constructor.name)
    })

    it('and has the correct id', () => {
      assert.equal(alice_id, alice.getAttribute('id'))
    })

    it('and has the correct name', () => {
      assert.equal('Alice', alice.getAttribute('name'))
    })
  })

  describe('inserts with relations', () => {
    let sarah_id = null
    let pet_id = null

    it ('without errors', done => {
      Person.create({
        name: 'Sarah',
        age: 21,
        pets: [
          { name: 'Fiddo' },
          { name: 'Max' }
        ]
      }).then(model => {
        sarah_id = model.id
        pet_id = model.pets[1]
        done()
      })
    })

    it ('and relations exist afterwards', done => {
      Person.find(sarah_id).then(model => {
        if (model.pets.length == 2) {
          return done()
        }

        done(new Error('No pets found in database after insertion'))
      })
    })

    it ('and the relation goes both ways', done => {
      Pet.find(pet_id).then(model => {
        if (model.name == 'Max') {
          return done()
        }

        done(new Error('The relation found doesn\'t seem to be what expected'))
      })
    })
  })

  describe('can be saved from instance', () => {
    let bob = new Person({ name: 'Bob' })

    it('without errors', (done) => {
      bob.save().then((model) => {
        done()
      })
    })

    it('and has the correct class', () => {
      assert.equal(Person.name, bob.constructor.name)
    })

    it('and has the correct name', () => {
      assert.equal('Bob', bob.getAttribute('name'))
    })
  })

  describe('can be found', () => {
    it('without errors', done => {
      Person
        .find(alice_id)
        .then((model) => {
          alice = model
          done()
        })
    })

    it('and has the correct class', () => {
      assert.equal(Person.name, alice.constructor.name)
    })

    it('and has the correct id', () => {
      assert.equal(alice_id, alice.getAttribute('id'))
    })

    it('and has the correct name', () => {
      assert.equal('Alice', alice.getAttribute('name'))
    })
  })

  describe('can be updated', () => {
    it('without errors', (done) => {
      alice.setAttribute('age', 18)

      alice.save().then((model) => {
        done()
      })
    })

    it('and has the correct age', () => {
      assert.equal(18, alice.getAttribute('age'))
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
      it('is an array', () => {
        assert.ok(Array.isArray(models))
      })

      it('isn\'t empty', () => {
        assert.ok(models.length > 0)
      })

      it('contains Persons', () => {
        let model = models[0]
        assert.equal(Person.name, model.constructor.name)
      })
    })
  })
})
