Element = require('spark-starter').Element
Travel = require('./Travel')
TravelAction = require('./actions/TravelAction')

module.exports = class Ship extends Element
  @properties
    location: 
      default: null
    travel: 
      default: null
    providedActions:
      collection: true
      calcul: (invalidator)->
        new TravelAction
          actor: this
    spaceCoodinate:
      calcul: (invalidator)->
        if invalidator.prop('travel')
          invalidator.propPath('travel.spaceCoodinate')
        else
          {
            x: invalidator.propPath('location.x')
            y: invalidator.propPath('location.y')
          }

  travelTo: (location)->
    travel = new Travel({
      traveller: this
      startLocation: @location
      targetLocation: location
    })
    if travel.valid
      travel.start()
      @travel = travel

