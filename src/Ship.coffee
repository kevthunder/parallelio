Element = require('spark-starter').Element
Travel = require('./Travel')
TravelAction = require('./actions/TravelAction')

module.exports = class Ship extends Element
  @properties
    location: 
      default: null
    travel: 
      default: null
    availableActions:
      collection: true
      calcul: (invalidator)->
        new TravelAction
          actor: this

  travelTo: (location)->
    travel = new Travel({
      traveller: this
      startLocation: @location
      targetLocation: location
    })
    if travel.valid
      travel.start()
      @travel = travel

