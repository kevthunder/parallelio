WalkAction = require('./WalkAction')
TargetAction = require('./TargetAction')
EventBind = require('spark-starter').EventBind
PropertyWatcher = require('spark-starter').watchers.PropertyWatcher

module.exports = class AttackAction extends TargetAction
  @properties
    walkAction:
      calcul: ->
        walkAction = new WalkAction(actor: @actor, target: @target, parent: @parent)
        walkAction.pathFinder.arrivedCallback = (step) =>
          @canUseWeaponAt(step.tile)
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
    interruptBinder:
      calcul: ->
        new EventBind 'interrupted', null, =>
          @interrupt()
      destroy: true
    weaponChargeWatcher:
      calcul: ->
        new PropertyWatcher({
          callback: ()=>
            if @bestUsableWeapon.charged
              @useWeapon()
          property: @bestUsableWeapon.propertiesManager.getProperty('charged')
        })
      destroy: true

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

  useWeapon: ->
    @bestUsableWeapon.useOn(@target)
    @finish()

  execute: ->
    if @actor.walk?
      @actor.walk.interrupt()
    if @bestUsableWeapon?
      if @bestUsableWeapon.charged
        @useWeapon()
      else
        @weaponChargeWatcher.bind()
    else
      @walkAction.on 'finished', =>
        @interruptBinder.unbind()
        @walkAction.destroy()
        @walkActionProperty.invalidate()
        if @isReady()
          @start()
      @interruptBinder.bindTo(@walkAction)
      @walkAction.execute()