Element = require('spark-starter').Element
PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher
Confrontation = require('./Confrontation')

module.exports = class EncounterManager extends Element
  @properties
    subject: 
      default: null
    baseProbability: 
      default: 0.2
    locationWatcher:
      calcul: ->
        new PropertyWatcher({
          callback: =>
            @testEncounter()
          property: @subject.getPropertyInstance('location')
        })

  init: ->
    @locationWatcher.bind()

  testEncounter: ->
    if Math.random() <= @baseProbability
      @startEncounter()

  startEncounter: ->
    encounter = new Confrontation({
      subject: @subject
    })
    encounter.start()


