Tiled = require('parallelio-tiles').Tiled

class Door extends Tiled
  constructor: (@direction = Door.directions.horizontal) ->
    super()
  @properties
    tile:
      change: (old,overrided) ->
        overrided()
        if old?
          old.walkableMembers?.removePropertyRef('open',this)
          old.transparentMembers?.removePropertyRef('open',this)
        if @tile
          @tile.walkableMembers?.addPropertyRef('open',this,)
          @tile.transparentMembers?.addPropertyRef('open',this)
    open:
      default: false
    direction: {}


  @directions = {
    horizontal: 'horizontal'
    vertical: 'vertical'
  }
