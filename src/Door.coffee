Tiled = require('parallelio-tiles').Tiled

module.exports = class Door extends Tiled
  constructor: (@direction = Door.directions.horizontal) ->
    super()
  @properties
    tile:
      change: (val, old) ->
        @updateTileMembers(old)
    open:
      default: false
    direction: {}

  updateTileMembers:(old)->
    if old?
      old.walkableMembers?.removeProperty(@openProperty)
      old.transparentMembers?.removeProperty(@openProperty)
    if @tile
      @tile.walkableMembers?.addProperty(@openProperty)
      @tile.transparentMembers?.addProperty(@openProperty)

  @directions = {
    horizontal: 'horizontal'
    vertical: 'vertical'
  }
