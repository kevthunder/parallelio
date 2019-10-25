Tiled = require('parallelio-tiles').Tiled

module.exports = class Obstacle extends Tiled
  @properties
    tile:
      change: (val, old,overrided) ->
        overrided(old)
        @updateWalkables(old)

  updateWalkables:(old)->
    if old?
      old.walkableMembers?.removeRef({name: 'walkable', obj: this})
    if @tile
      @tile.walkableMembers?.setValueRef(false,'walkable',this)