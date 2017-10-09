import { expect } from 'chai'
import { Model, Database } from '../lib/'
import { Person, Pet } from './test-models'

describe('Relations', () => {
  let sarah = null

  it('are created when nested in model creation (hasMany)', done => {
    Person.create({
      name: 'Sarah',
      age: 21,
      pets: [
        { name: 'Fiddo' },
        { name: 'Max' },
      ]
    }).then(model => {
      try {
        sarah = model
        expect(model.pets).to.be.an('array')
        expect(model.pets).to.have.lengthOf(2)
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
        expect(model.owner).to.be.an('array')
        expect(model.owner).to.have.lengthOf(1)
        expect(model.owner[0]).to.be.a('number')

        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it ('and relations exist after re-consulting', done => {
    Person.find(sarah.id).then(model => {
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
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it ('can be consulted from parent model', done => {
    sarah.getPets().then(pets => {
      try {
        expect(pets).to.be.an('array')
        expect(pets).to.have.lengthOf(2)
        expect(pets[0]).to.be.an('object')
        expect(pets[0].constructor.name).to.equal(Pet.name)
        expect(pets[0].name).to.equal('Fiddo')
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it ('relations can be consulted synchronously after retrieval', done => {
    try {
      expect(sarah._pets).to.be.an('array')
      expect(sarah._pets).to.have.lengthOf(2)
      expect(sarah._pets[0]).to.be.an('object')
      expect(sarah._pets[0].constructor.name).to.equal(Pet.name)
      expect(sarah._pets[0].name).to.equal('Fiddo')
      done()
    } catch (e) {
      done(e)
    }
  })
})
