PathFinder = require('parallelio-pathfinder')
PathWalk = require('../PathWalk')
TargetAction = require('./TargetAction')

class WalkAction extends TargetAction
  @properties
    pathFinder:
      calcul: ->
        new PathFinder(@actor.tile.container, @actor.tile, @target, {
          validTile: (tile) =>
            if typeof @actor.canGoOnTile == "function"
                @actor.canGoOnTile(tile)
            else
                tile.walkable
        })

  execute: -> 
    if @actor.walk?
      @actor.walk.end()
    @actor.walk = new PathWalk(@actor, @pathFinder, {
      timing:game.timing
    })
    @actor.walk.start()

  validTarget: ()->
    @pathFinder.calcul()
    @pathFinder.solution?