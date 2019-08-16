Element = require('spark-starter').Element
Timing = require('parallelio-timing')

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
        if @targetLocation?.links? and @startLocation?.links?
          return @currentSection?
    timing:
      calcul: ->
        new Timing()
    spaceCoodinate:
      calcul: (invalidator)->
        startX = invalidator.propPath('startLocation.x')
        startY = invalidator.propPath('startLocation.y')
        endX = invalidator.propPath('targetLocation.x')
        endY = invalidator.propPath('targetLocation.y')
        prc = invalidator.propPath('pathTimeout.prc')
        {
          x: (startX - endX) * prc + endX
          y: (startY - endY) * prc + endY
        }

  start: (location)->
    if @valid
      @moving = true
      @traveller.travel = this
      @pathTimeout = @timing.setTimeout =>
        @traveller.location = @targetLocation
        @traveller.travel = null
        @moving = false
        console.log('stop moving')
      , @duration

