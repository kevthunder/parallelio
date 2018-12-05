Tiled = require('parallelio-tiles').Tiled

class Obstacle extends Tiled
  @properties
    tile:
      change: (old,overrided) ->
        overrided(old)
        @updateWalkables(old)

  updateWalkables:(old)->
    if old?
      old.walkableMembers?.removeRef('walkable',this)
    if @tile
      @tile.walkableMembers?.setValueRef(false,'walkable',this)