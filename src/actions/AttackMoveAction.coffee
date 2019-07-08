WalkAction = require('./WalkAction')
AttackAction = require('./AttackAction')
TargetAction = require('./TargetAction')
PathFinder = require('parallelio-pathfinder')
PropertyWatcher = require('spark-starter').PropertyWatcher

class AttackMoveAction extends TargetAction
  @properties
    walkAction:
      calcul: ->
        walkAction = new WalkAction(actor: @actor, target: @target, parent: @parent)
        walkAction
    enemySpotted: ->
      calcul: ->
        @path = new PathFinder(@actor.tile.container, @actor.tile, false, {
          validTile: (tile)=>
            tile.transparent and (new LineOfSight(@actor.tile.container, @actor.tile.x, @actor.tile.y, tile.x, tile.y)).getSuccess()
          arrived: (tile)=>
            tile.children.find (c) => @isEnemy(c)
          efficiency: (tile)=>
        })
        @path.calcul()
        @path.solution
    tileWatcher: ->
      new PropertyWatcher({
        callback: =>
          if @enemySpotted
            @attackAction = new AttackAction(actor: @actor, target: @enemySpotted)
            @attackAction.on 'finished', =>
              if @isReady()
                @start()
            @attackAction.on 'interrupted', =>
              @interrupt()
            @walkAction.execute()
        property: @actor.getPropertyIntance('tile')
      })

  isEnemy: (elem)->
    false

  validTarget: ()->
    @walkAction.validTarget()

  execute: ->
    @walkAction.on 'finished', =>
      @finished()
    @walkAction.on 'interrupted', =>
      @interrupt()
    @walkAction.execute()