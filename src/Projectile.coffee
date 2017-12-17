Element = require('spark-starter').Element
Timing = require('parallelio-timing')

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
    container:
      calcul: (invalidate)->
        originTile = invalidate.prop('originTile')
        targetTile = invalidate.prop('targetTile')
        if originTile.container == targetTile.container
          originTile.container
        else if invalidate.prop('prcPath') > 0.5
          targetTile.container
        else
          originTile.container
    x:
      calcul: (invalidate)->
        startPos = invalidate.prop('startPos')
        (invalidate.prop('targetPos').x - startPos.x)*invalidate.prop('prcPath') + startPos.x
    y:
      calcul: (invalidate)->
        startPos = invalidate.prop('startPos')
        (invalidate.prop('targetPos').y - startPos.y)*invalidate.prop('prcPath') + startPos.y
    startPos:
      calcul: (invalidate)->
        originTile = invalidate.prop('originTile')
        container = invalidate.prop('container')
        offset = @startOffset;
        unless originTile.container == container
          dist = container.dist(originTile.container)
          offset.x += dist.x
          offset.y += dist.y
        {
          x: originTile.x+offset.x
          y: originTile.y+offset.y
        }
      output:(val)->
        Object.assign({},val)
    targetPos:
      calcul: (invalidate)->
        targetTile = invalidate.prop('targetTile')
        container = invalidate.prop('container')
        offset = @targetOffset;
        unless targetTile.container == container
          dist = container.dist(targetTile.container)
          offset.x += dist.x
          offset.y += dist.y
        {
          x: targetTile.x+offset.x
          y: targetTile.y+offset.y
        }
      output:(val)->
        Object.assign({},val)
    startOffset: 
      default: {x:0.5,y:0.5}
      output:(val)->
        Object.assign({},val)
    targetOffset: 
      default: {x:0.5,y:0.5}
      output:(val)->
        Object.assign({},val)
    prcPath:
      calcul: ->
        @pathTimeout?.getPrc() || 0
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
