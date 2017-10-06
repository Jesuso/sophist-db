import { expect } from 'chai'
import { Model, Database } from '../lib/'
import { Person, Pet } from './test-models'

describe('Model', () => {
  let alice = null
  
  it('inserts correctly', done => {
    Person.create({ name: 'Alice', age: 21 }).then(model => {
      try {
        expect(model.constructor.name).to.equal(Person.name)
        expect(model.id).to.be.a('number')
        expect(model.attributes).to.contain({
          name: 'Alice',
          age: 21,
        })

        alice = model
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('can be saved from instance', done => {
    (new Person({ name: 'Bob' })).save().then(model => {
      try {
        expect(model.constructor.name).to.equal(Person.name)
        expect(model.id).to.be.a('number')
        expect(model.attributes).to.contain({
          name: 'Bob',
        })
        done()
      } catch (e) {
        done(e)
      }
    })
  })
  
  it('can be found', done => {
    Person.find(alice.id).then(model => {
      try {
        expect(model.constructor.name).to.equal(Person.name)
        expect(model.attributes).to.contain({
          id: alice.id,
          name: 'Alice',
          age: 21,

        })
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('can be updated', done => {
    alice.setAttribute('age', 18)

    alice.save().then(model => {
      try {
        expect(model.constructor.name).to.equal(Person.name)
        expect(model.attributes).to.contain({
          id: alice.id,
          name: 'Alice',
          age: 18,
        })
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('can be selected in chunks', done => {
    Person.all().then(models => {
      try {
        expect(models).to.be.an('array')
        expect(models).to.have.lengthOf.above(0)
        expect(models[0].constructor.name).to.equal(Person.name)
        done()
      } catch (e) {
        done(e)
      }
    })
  })
})