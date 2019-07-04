PathFinder = require('parallelio-pathfinder')
PathWalk = require('../PathWalk')
TargetAction = require('./TargetAction')

class AttackAction extends TargetAction
  @properties
    pathFinder:
      calcul: ->
        new PathFinder(@actor.tile.container, @actor.tile, @target, {
          validTile: (tile) =>
            if typeof @actor.canGoOnTile == "function"
              @actor.canGoOnTile(tile)
            else
              tile.walkable
          arrived: (tile) =>
            @canUseWeaponAt(tile)
        })
    bestUsableWeapon:
      calcul: (invalidator)->
        invalidator.propPath('actor.tile')
        if @actor.weapons?.length
          usableWeapons = @actor.weapons.filter (weapon)=>
            weapon.canUseOn(@target)
          usableWeapons.sort (a, b)=>
            return b.dps - a.dps
          usableWeapons[0]
        else
          null

  validTarget: ()->
    @targetIsAttackable() and (@canUseWeapon() or @canWalkToTarget())
  targetIsAttackable: ()->
    @target.damageable and @target.health >=0
  canMelee: ->
    Math.abs(@target.tile.x - @actor.tile.x) + Math.abs(@target.tile.y - @actor.tile.y) == 1
  canUseWeapon: ->
    @bestUsableWeapon?
  canUseWeaponAt: (tile)->
    @actor.weapons?.length and @actor.weapons.find (weapon)=>
      weapon.canUseFrom(tile, @target)
  canWalkToTarget: ->
    @pathFinder.calcul()
    @pathFinder.solution?

  execute: ->
    if @actor.walk?
      @actor.walk.end()
    if @bestUsableWeapon?
      @bestUsableWeapon.useOn(@target)
    else
      @actor.walk = new PathWalk(@actor, @pathFinder)
      @actor.walk.on 'endReached', =>
        if @isReady
          @start()
      @actor.walk.start()