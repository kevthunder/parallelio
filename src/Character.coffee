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
      candidates = @game.mainTileContainer.tiles.filter (tile)->
        tile.walkable != false
      @tile = candidates[Math.floor(Math.random()*candidates.length)]


  walkTo: (tile) ->
    if @walk?
      @walk.end()
    path = new PathFinder(@tile.container, @tile, tile, {
      validTile: (tile) ->
        tile.walkable
    })
    @walk = new PathWalk(this, path)
    @walk.start()