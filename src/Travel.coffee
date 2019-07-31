Element = require('spark-starter').Element

module.exports = class Travel extends Element
  @properties
    traveller: 
      default: null
    startLocation: 
      default: null
    targetLocation:
      default: null
    currentSection:
      calcul: ->
        @startLocation.links.findStar(@targetLocation)
    duration:
      default: 1000
    moving: 
      default: false
    valid: 
      calcul: ->
        if @targetLocation == @startLocation
          return false
        if @targetLocation.links? and @startLocation.links?
          return @currentSection?
    timing:
      calcul: ->
        new Timing()

  start: (location)->
    if @valid
      @moving = true
      @pathTimeout = @timing.setTimeout =>
        @traveller.location = @targetLocation
        @moving = false
      , @duration

