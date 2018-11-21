Tiled = require('parallelio-tiles').Tiled
PathFinder = require('parallelio-pathfinder')
PathWalk = require('./PathWalk')
Damageable = require('./Damageable')
TargetAction = require('./actions/TargetAction')

class Character extends Tiled
  @extend Damageable
  constructor: (@name) ->
    super()

  @properties
    game:
      change: (old)->
        if @game 
          @setDefaults()

    offsetX:
      default: 0.5

    offsetY:
      default: 0.5

    defaultAction:
      calcul: ->
        new @constructor.WalkAction
          actor: this

  setDefaults: ->
    if !@tile && @game.mainTileContainer?
      candidates = @game.mainTileContainer.tiles.filter (tile)->
        tile.walkable != false
      @tile = candidates[Math.floor(Math.random()*candidates.length)]

  walkTo: (tile) ->
    action = new @constructor.WalkAction
      actor: this
      target: tile

    action.execute()
    action

  isSelectableBy: (player)->
    true

class Character.WalkAction extends TargetAction
  @properties
    pathFinder:
      calcul: ->
        new PathFinder(@actor.tile.container, @actor.tile, @target, {
          validTile: (tile) ->
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
    #todo: this will be slow for invalid targets
    @pathFinder.calcul()
    @pathFinder.solution?