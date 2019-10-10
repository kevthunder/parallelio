Element = require('spark-starter').Element
Timing = require('parallelio-timing')

module.exports = class Projectile extends Element
  constructor: (options) ->
    super(options)
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
        origin = invalidator.prop(@originProperty)
        if origin?
          origin.tile || origin
    targetTile: 
      calcul: (invalidator)->
        target = invalidator.prop(@targetProperty)
        if target?
          target.tile || target
    container:
      calcul: (invalidate)->
        originTile = invalidate.prop(@originTileProperty)
        targetTile = invalidate.prop(@targetTileProperty)
        if originTile.container == targetTile.container
          originTile.container
        else if invalidate.prop(@prcPathProperty) > 0.5
          targetTile.container
        else
          originTile.container
    x:
      calcul: (invalidate)->
        startPos = invalidate.prop(@startPosProperty)
        (invalidate.prop(@targetPosProperty).x - startPos.x)*invalidate.prop(@prcPathProperty) + startPos.x
    y:
      calcul: (invalidate)->
        startPos = invalidate.prop(@startPosProperty)
        (invalidate.prop(@targetPosProperty).y - startPos.y)*invalidate.prop(@prcPathProperty) + startPos.y
    startPos:
      calcul: (invalidate)->
        originTile = invalidate.prop(@originTileProperty)
        container = invalidate.prop(@containerProperty)
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
        targetTile = invalidate.prop(@targetTileProperty)
        container = invalidate.prop(@containerProperty)
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
        @pathTimeout?.prc || 0
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
    @propertiesManager.destroy()
