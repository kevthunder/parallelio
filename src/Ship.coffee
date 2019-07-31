Element = require('spark-starter').Element
Travel = require('./Travel')

module.exports = class Ship extends Element
  @properties
    location: 
      default: null
    travel: 
      default: null

  travelTo: (location)->
    travel = new Travel({
      traveller: this
      startLocation: @location
      targetLocation: location
    })
    if travel.valid
      travel.start()
      @travel = travel

