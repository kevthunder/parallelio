Tiled = require('parallelio-tiles').Tiled
Damageable = require('./Damageable')
WalkAction = require('./actions/WalkAction')

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
        new WalkAction
          actor: this

    availableActions:
      collection: true
      calcul: (invalidator)->
        tile = invalidator.prop("tile")
        if tile
          invalidator.prop("providedActions",tile)
        else
          []

  setDefaults: ->
    if !@tile && @game.mainTileContainer?
      @putOnRandomTile(@game.mainTileContainer.tiles)

  canGoOnTile: (tile)->
    tile?.walkable != false

  walkTo: (tile) ->
    action = new WalkAction
      actor: this
      target: tile

    action.execute()
    action

  isSelectableBy: (player)->
    true