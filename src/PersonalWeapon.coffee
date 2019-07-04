Element = require('spark-starter').Element
LineOfSight = require('./LineOfSight')

class PersonalWeapon extends Element
  constructor: (options) ->
    super()
    @setProperties(options)
  @properties
    rechargeTime:
      default: 1000
    power:
      default: 10
    dps:
      calcul: (invalidator)->
        invalidator.prop('power') / invalidator.prop('rechargeTime') * 1000
    range:
      default: 10
    user:
      default: null

  canUseOn: (target)->
    @canUseFrom(@user.tile, target)


  canUseFrom: (tile, target)->
    if @range == 1
      @inMeleeRange(tile, target)
    else
      @inRange(tile, target) and @hasLineOfSight(tile,target)

  inRange: (tile, target)->
    tile.dist(target.tile)?.length <= @range

  inMeleeRange: (tile,target)->
    Math.abs(@target.tile.x - @actor.tile.x) + Math.abs(@target.tile.y - @actor.tile.y) == 1

  hasLineOfSight: (tile,target)->
    los = new LineOfSight(target.tile.container, tile.x+0.5, tile.y+0.5, target.tile.x+0.5, target.tile.y+0.5)
    los.traversableCallback = (tile) ->
      tile.walkable
    los.getSuccess()

  useOn: (target)->
    target.damage(@power)
