TargetAction = require('./TargetAction')
Travel = require('../Travel')

module.exports = class TravelAction extends TargetAction
  @properties
    travel: 
      calcul: ->
        new Travel(
          traveller: @actor
          startLocation: @actor.location
          targetLocation: @target
        )

  validTarget: ()->
    @travel.valid
  execute: ->
    @travel.start()
