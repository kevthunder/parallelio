Tiled = require('parallelio-tiles').Tiled
PathFinder = require('parallelio-pathfinder')
PathWalk = require('./PathWalk')
Damageable = require('./Damageable')

class Character extends Tiled
  @extend Damageable
  constructor: (@name) ->
    super()

  @properties
    game:
      change: (old)->
        if @game 
          @setDefaults()

  setDefaults: ->
    if !@tile && @game.mainTileContainer?
      @tile = @game.mainTileContainer.getRandomTile (tile)->
        tile.walkable != false


  walkTo: (tile) ->
    if @walk?
      @walk.end()
    path = new PathFinder(@tile.container, @tile, tile, {
      validTile: (tile) ->
        tile.walkable
    })
    @walk = new PathWalk(this, path)
    @walk.start()