Element = require('spark-starter').Element
LineOfSight = require('./LineOfSight')
Timing = require('parallelio-timing')

module.exports = class PersonalWeapon extends Element
  constructor: (options) ->
    super()
    @setProperties(options)
  @properties
    rechargeTime:
      default: 1000
    charged:
      default: true
    charging:
      default: true
    power:
      default: 10
    dps:
      calcul: (invalidator)->
        invalidator.prop('power') / invalidator.prop('rechargeTime') * 1000
    range:
      default: 10
    user:
      default: null
    timing:
      calcul: ->
        new Timing()

  canBeUsed: ()->
    @charged

  canUseOn: (target)->
    @canUseFrom(@user.tile, target)


  canUseFrom: (tile, target)->
    if @range == 1
      @inMeleeRange(tile, target)
    else
      @inRange(tile, target) and @hasLineOfSight(tile,target)

  inRange: (tile, target)->
    targetTile = target.tile || target
    tile.dist(targetTile)?.length <= @range

  inMeleeRange: (tile,target)->
    targetTile = target.tile || target
    Math.abs(targetTile.x - tile.x) + Math.abs(targetTile.y - tile.y) == 1

  hasLineOfSight: (tile,target)->
    targetTile = target.tile || target
    los = new LineOfSight(targetTile.container, tile.x+0.5, tile.y+0.5, targetTile.x+0.5, targetTile.y+0.5)
    los.traversableCallback = (tile) ->
      tile.walkable
    los.getSuccess()

  useOn: (target)->
    if @canBeUsed()
      target.damage(@power)
      @charged = false
      @recharge()

  recharge: ->
    @charging = true
    @chargeTimeout = @timing.setTimeout =>
      @charging = false
      @recharged()
    , @rechargeTime

  recharged: ->
    @charged = true

  destroy: ->
    if @chargeTimeout
      @chargeTimeout.destroy()
