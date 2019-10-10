Tiled = require('parallelio-tiles').Tiled
Damageable = require('./Damageable')
WalkAction = require('./actions/WalkAction')

module.exports = class Character extends Tiled
  @extend Damageable
  constructor: (@name) ->
    super()

  @properties
    game:
      change: (val, old)->
        if @game 
          @setDefaults()

    offsetX:
      composed: true
      default: 0.5

    offsetY:
      composed: true
      default: 0.5

    tile:
      composed: true

    defaultAction:
      calcul: ->
        new WalkAction
          actor: this

    providedActions:
      collection: true
      calcul: (invalidator)->
        invalidator.propPath("tile.providedActions") || []

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