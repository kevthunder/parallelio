Door = require('./Door')
Character = require('./Character')

module.exports = class AutomaticDoor extends Door
  @properties
    open:
      calcul: (invalidate) ->
        !invalidate.prop('locked') && @isActivatorPresent(invalidate)
    locked:
      default: false
    unlocked:
      calcul: (invalidate) ->
        !invalidate.prop('locked')

  updateTileMembers:(old)->
    if old?
      old.walkableMembers?.removeRef('unlocked',this)
      old.transparentMembers?.removeRef('open',this)
    if @tile
      @tile.walkableMembers?.addPropertyRef('unlocked',this)
      @tile.transparentMembers?.addPropertyRef('open',this)

  init: ->
    super()
    @open

  isActivatorPresent:(invalidate)->
    @getReactiveTiles(invalidate).some (tile) =>
      children = if invalidate then invalidate.prop('children',tile) else tile.children
      children.some (child) =>
        @canBeActivatedBy(child)

  canBeActivatedBy:(elem)->
    elem instanceof Character

  getReactiveTiles: (invalidate)->
    tile = if invalidate then invalidate.prop('tile') else @tile
    unless tile
      return []
    direction = if invalidate then invalidate.prop('direction') else @direction
    if direction == Door.directions.horizontal
      [
        tile
        tile.getRelativeTile(0, 1)
        tile.getRelativeTile(0, -1)
      ].filter (t) -> t?
    else
      [
        tile
        tile.getRelativeTile(1, 0)
        tile.getRelativeTile(-1, 0)
      ].filter (t) -> t?