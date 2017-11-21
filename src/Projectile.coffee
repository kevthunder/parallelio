Element = require('spark-starter').Element

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
      default: 100
  deliverPayload: ->
    payload = new @propagationType({
      tile: @target.tile || @target
      power: @power
      range: @blastRange
    })
    payload.apply()
    @destroy()
    payload
  destroy: ->
