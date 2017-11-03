#= require <Tiled>
#--- Standalone ---
Tiled = @Parallelio?.Tiled || require('parallelio-tiles').Tiled
#--- Standalone end ---

class Door extends Tiled
  constructor: (@direction = Door.directions.horizontal) ->
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
  

if Parallelio?
  Parallelio.Door = Door
#--- Standalone ---
if module?
  module.exports = Door
else
  unless @Parallelio?
    @Parallelio = {}
  @Parallelio.Door = Door
#--- Standalone end ---