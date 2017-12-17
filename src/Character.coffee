Tiled = require('parallelio-tiles').Tiled
PathFinder = require('parallelio-pathfinder')
PathWalk = require('./PathWalk')
Damageable = require('./Damageable')

class Character extends Tiled
  @extend Damageable
  constructor: (@name) ->
    super()
  walkTo: (tile) ->
    if @walk?
      @walk.end()
    path = new Parallelio.PathFinder(@tile.container, @tile, tile, {
      validTile: (tile) ->
        tile.walkable
    })
    @walk = new PathWalk(this, path)
    @walk.start()