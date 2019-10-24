Tiled = require('parallelio-tiles').Tiled

directions = {
  horizontal: 'horizontal'
  vertical: 'vertical'
}

module.exports = class Door extends Tiled
  @properties
    tile:
      change: (val, old) ->
        @updateTileMembers(old)
    open:
      default: false
    direction: 
      default: directions.horizontal

  updateTileMembers:(old)->
    if old?
      old.walkableMembers?.removeProperty(@openProperty)
      old.transparentMembers?.removeProperty(@openProperty)
    if @tile
      @tile.walkableMembers?.addProperty(@openProperty)
      @tile.transparentMembers?.addProperty(@openProperty)

  @directions = directions
