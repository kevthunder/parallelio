Element = require('spark-starter').Element
Timing = require('./Timing')

class Projectile extends Element
  constructor: (options) ->
    @setProperties(options)
  @properties
    origin:
      default: null
    target:
      default: null
    power:
      default: 10
    blastRange:
      default: 1
    propagationType:
      default: null
    speed:
      default: 10
    pathLength: 
      calcul: ->
        if @origin? && @target?
          originTile = @origin.tile || @origin
          targetTile = @target.tile || @target
          dist = originTile.dist(targetTile)
          if dist
            return dist.length
        100
    timing:
      calcul: ->
        new Timing()
  launch: ->
    @pathTimeout = @timing.setTimeout =>
      @deliverPayload()
    , @pathLength / @speed * 1000
  deliverPayload: ->
    payload = new @propagationType({
      tile: @target.tile || @target
      power: @power
      range: @blastRange
    })
    payload.apply()
    @payloadDelivered()
    payload
  payloadDelivered: ->
    @destroy()
  destroy: ->
