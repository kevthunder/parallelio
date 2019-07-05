WalkAction = require('./WalkAction')
TargetAction = require('./TargetAction')

class AttackAction extends TargetAction
  @properties
    walkAction:
      calcul: ->
        walkAction = new WalkAction(actor: @actor, target: @target, parent: @parent)
        walkAction.pathFinder.arrivedCallback = (tile) =>
          @canUseWeaponAt(tile)
        walkAction
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
    @walkAction.isReady()

  execute: ->
    if @actor.walk?
      @actor.walk.interrupt()
    if @bestUsableWeapon?
      @bestUsableWeapon.useOn(@target)
      @finish()
    else
      @walkAction.on 'finished', =>
        if @isReady()
          @start()
      @walkAction.on 'interrupted', =>
        @interrupt()
      @walkAction.execute()