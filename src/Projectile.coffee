Element = require('spark-starter').Element
Timing = require('./Timing')

class Projectile extends Element
  constructor: (options) ->
    @setProperties(options)
    @init()
  init:->
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
        if @originTile? && @targetTile?
          dist = @originTile.dist(@targetTile)
          if dist
            return dist.length
        100
    originTile: 
      calcul: (invalidator)->
        origin = invalidator.prop('origin')
        if origin?
          origin.tile || origin
    targetTile: 
      calcul: (invalidator)->
        target = invalidator.prop('target')
        if target?
          target.tile || target
    startOffset: 
      default: {x:0.5,0.5}
      output:(val)->
        Object.assign({},val)
    targetOffset: 
      default: {x:0.5,0.5}
      output:(val)->
        Object.assign({},val)
    timing:
      calcul: ->
        new Timing()
    moving:
      default:false
  launch: ->
    @moving = true
    @pathTimeout = @timing.setTimeout =>
      @deliverPayload()
      @moving = false
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
