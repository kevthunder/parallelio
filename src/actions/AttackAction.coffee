
TargetAction = require('./TargetAction')

class AttackAction extends TargetAction
  @properties
    range:
      default: 10
    meleeDamage:
      default: 10
    rangedDamage:
      default: 8
    pathFinder:
      calcul: ->
        new PathFinder(@actor.tile.container, @actor.tile, @target, {
          validTile: (tile) =>
            if typeof @actor.canGoOnTile == "function"
              @actor.canGoOnTile(tile)
            else
              tile.walkable
          arrived: (tile) =>
            @inRangeAt(tile) and @hasLineOfSightFrom(tile)
        })

  validTarget: ()->
    @targetIsAttackable() and (@canUseWeapon() or @canWalkToTarget())
  targetIsAttackable: ()->
    @target.damageable and @target.health >=0
  canMelee: ->
    Math.abs(@target.tile.x - @actor.tile.x) + Math.abs(@target.tile.y - @actor.tile.y) == 1
  canUseWeapon: ->
    @actor.weapons?.length and @inRange() and @hasLineOfSight()
  inRange:->
    @inRangeAt(@actor.tile)
  inRangeAt: (tile)->
    Tile.dist(tile.x, tile.y, @target.tile.x, @target.tile.y) <= @range
  hasLineOfSight: ->
    @hasLineOfSightFrom(@actor.tile)
  hasLineOfSightFrom: (tile)->
    los = new LineOfSight(@target.tile.container, tile.x+0.5, tile.y+0.5, @target.tile.x+0.5, @target.tile.y+0.5)
    los.traversableCallback = (tile) ->
      tile.walkable
    los.getSuccess()
  canWalkToTarget: ->
    @pathFinder.calcul()
    @pathFinder.solution?

  execute: ->
    if @actor.walk?
      @actor.walk.end()
    if weapon = @bestUsableWeapon()
      weapon.useOn(target)
    else
      @actor.walk = new PathWalk(@actor, @pathFinder, {
        timing: game.timing
      })
      @actor.walk.on 'endReached' =>
        if @isReady
          @start()
      @actor.walk.start()