WalkAction = require('./WalkAction')
AttackAction = require('./AttackAction')
TargetAction = require('./TargetAction')
PathFinder = require('parallelio-pathfinder')
LineOfSight = require('../LineOfSight')
PropertyWatcher = require('spark-starter').watchers.PropertyWatcher
EventBind = require('spark-starter').EventBind

module.exports = class AttackMoveAction extends TargetAction
  @properties
    walkAction:
      calcul: ->
        walkAction = new WalkAction(actor: @actor, target: @target, parent: @parent)
        walkAction
    enemySpotted:
      calcul: ->
        @path = new PathFinder(@actor.tile.container, @actor.tile, false, {
          validTile: (tile)=>
            tile.transparent and (new LineOfSight(@actor.tile.container, @actor.tile.x, @actor.tile.y, tile.x, tile.y)).getSuccess()
          arrived: (step)=>
            step.enemy = step.tile.children.find (c) => @isEnemy(c)
          efficiency: (tile)=>
        })
        @path.calcul()
        @path.solution?.enemy
    tileWatcher:
      calcul: ->
        new PropertyWatcher({
          callback: =>
            @testEnemySpotted()
          property: @actor.propertiesManager.getProperty('tile')
        })
      destroy: true
    interruptBinder:
      calcul: ->
        new EventBind 'interrupted', null, =>
          @interrupt()
      destroy: true

  isEnemy: (elem)->
    @actor.owner?.isEnemy?(elem)

  validTarget: ()->
    @walkAction.validTarget()

  testEnemySpotted: ()->
    @enemySpottedProperty.invalidate()
    if @enemySpotted
      @attackAction = new AttackAction(actor: @actor, target: @enemySpotted)
      @attackAction.on 'finished', =>
        if @isReady()
          @start()
      @interruptBinder.bindTo(@attackAction)
      @walkAction.interrupt()
      @walkActionProperty.invalidate()
      @attackAction.execute()

  execute: ->
    unless @testEnemySpotted()
      @walkAction.on 'finished', =>
        @finished()
      @interruptBinder.bindTo(@walkAction)
      @tileWatcher.bind()
      @walkAction.execute()