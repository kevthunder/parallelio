Tiled = require('parallelio-tiles').Tiled

class Door extends Tiled
  constructor: (@direction = Door.directions.horizontal) ->
    super()
  @properties
    tile:
      change: (old,overrided) ->
        overrided()
        @updateTileMembers(old)
    open:
      default: false
    direction: {}

  updateTileMembers:(old)->
    if old?
      old.walkableMembers?.removeRef('open',this)
      old.transparentMembers?.removeRef('open',this)
    if @tile
      @tile.walkableMembers?.addPropertyRef('open',this)
      @tile.transparentMembers?.addPropertyRef('open',this)

  @directions = {
    horizontal: 'horizontal'
    vertical: 'vertical'
  }
