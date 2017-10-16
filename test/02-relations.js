import { expect } from 'chai'
import { Model, Database } from '../lib/'
import { Person, Pet } from './test-models'

describe('Relations', () => {
  let sarah = null

  it ('are recognized by reading the schema', () => {
    expect(Person.isRelation('pets')).to.not.equal(null)
    expect(Pet.isRelation('owner')).to.not.equal(null)
  })

  it ('instantiate child relations', () => {
    let alice = new Person({
      name: 'Alice',
      age: 21,
      pets: [{
        name: 'Max'
      }]
    })

    expect(alice.constructor.name).to.equal(Person.name)
    expect(alice.name).to.equal('Alice')
    expect(alice.age).to.equal(21)
    expect(alice.pets).to.be.an('array')
    expect(alice.pets).to.have.lengthOf(1)
    expect(alice.pets[0].constructor.name).to.equal(Pet.name)
  })

  it('are created when nested in model creation (hasMany)', done => {
    Person.create({
      name: 'Sarah',
      age: 21,
      pets: [
        { name: 'Fiddo' },
        { name: 'Max' },
      ]
    }).then(model => {
      sarah = model
      
      try {
        expect(model.pets).to.be.an('array')
        expect(model.pets).to.have.lengthOf(2)
        expect(model.pets[0].constructor.name).to.equal(Pet.name)
        expect(model.pets[0].name).to.equal('Fiddo')
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it ('are created when nested in model creation (belongsTo)', done => {
    Pet.create({
      name: 'Bella',
      owner: {
        name: 'Sarah',
        age: 21,
      }
    }).then(model => {
      try {
        expect(model.constructor.name).to.equal(Pet.name)
        expect(model.id).to.be.a('number')
        expect(model.name).to.equal('Bella')
        expect(model.owner).to.be.an('object')
        expect(model.owner.constructor.name).to.equal(Person.name)
        expect(model.owner.id).to.be.a('number')
        expect(model.owner.name).to.equal('Sarah')

        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it ('and relations exist after re-consulting', done => {
    Person.find(sarah.id, ['pets']).then(model => {
      try {
        expect(model.pets).to.be.an('array')
        expect(model.pets).to.have.lengthOf(2)
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it ('and re-saving works', done => {
    sarah.save().then(model => {
      try {
        expect(model.attributes).to.deep.equal(sarah.attributes)
        expect(model.pets).to.be.an('array')
        expect(model.pets).to.have.lengthOf(2)
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it ('relations can be consulted synchronously after retrieval', () => {
    expect(sarah.pets).to.be.an('array')
    expect(sarah.pets).to.have.lengthOf(2)
    expect(sarah.pets[0]).to.be.an('object')
    expect(sarah.pets[0].constructor.name).to.equal(Pet.name)
    expect(sarah.pets[0].name).to.equal('Fiddo')
  })
})
