Door = require('./Door')
Character = require('./Character')

module.exports = class AutomaticDoor extends Door
  @properties
    open:
      calcul: (invalidate) ->
        !invalidate.prop(@lockedProperty) && @isActivatorPresent(invalidate)
    locked:
      default: false
    unlocked:
      calcul: (invalidate) ->
        !invalidate.prop(@lockedProperty)

  updateTileMembers:(old)->
    if old?
      old.walkableMembers?.removeProperty(this.unlockedProperty)
      old.transparentMembers?.removeProperty(this.openProperty)
    if @tile
      @tile.walkableMembers?.addProperty(this.unlockedProperty)
      @tile.transparentMembers?.addProperty(this.openProperty)

  init: ->
    super()
    @open

  isActivatorPresent:(invalidate)->
    @getReactiveTiles(invalidate).some (tile) =>
      children = if invalidate then invalidate.prop(tile.childrenProperty) else tile.children
      children.some (child) =>
        @canBeActivatedBy(child)

  canBeActivatedBy:(elem)->
    elem instanceof Character

  getReactiveTiles: (invalidate)->
    tile = if invalidate then invalidate.prop(@tileProperty) else @tile
    unless tile
      return []
    direction = if invalidate then invalidate.prop(@directionProperty) else @direction
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