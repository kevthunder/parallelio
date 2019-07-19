module.exports = class LineOfSight
  constructor: (@tiles, @x1=0, @y1=0, @x2=0, @y2=0) ->
  setX1: (val) ->
    @x1 = val
    @invalidade()
  setY1: (val) ->
    @y1 = val
    @invalidade()
  setX2: (val) ->
    @x2 = val
    @invalidade()
  setY2: (val) ->
    @y2 = val
    @invalidade()
  invalidade: ->
    @endPoint = null
    @success = null
    @calculated = false
  testTile: (tile,entryX,entryY) ->
    if @traversableCallback?
      @traversableCallback(tile,entryX,entryY)
    else
      tile? and if typeof tile.getTransparent == 'function'
        tile.getTransparent()
      else if typeof tile.transparent != undefined
        tile.transparent
      else 
        true
  testTileAt: (x,y,entryX,entryY) ->
    @testTile(@tiles.getTile(Math.floor(x),Math.floor(y)),entryX,entryY)
  reverseTracing: ->
    tmpX = @x1
    tmpY = @y1
    @x1 = @x2
    @y1 = @y2
    @x2 = tmpX
    @y2 = tmpY
    @reversed = !@reversed
  calcul: ->
    ratio = (@x2-@x1)/(@y2-@y1)
    total = Math.abs(@x2-@x1)+Math.abs(@y2-@y1)
    positiveX = (@x2 - @x1) >= 0
    positiveY = (@y2 - @y1) >= 0
    tileX = x = @x1
    tileY = y = @y1
    if @reversed
      tileX = if positiveX then x else Math.ceil(x)-1
      tileY = if positiveY then y else Math.ceil(y)-1
    while total > Math.abs(x-@x1)+Math.abs(y-@y1) and @testTileAt(tileX, tileY, x, y)
      nextX = if positiveX then Math.floor(x)+1 else Math.ceil(x)-1
      nextY = if positiveY then Math.floor(y)+1 else Math.ceil(y)-1
      if @x2-@x1 == 0
        y = nextY
      else if @y2-@y1 == 0
        x = nextX
      else if Math.abs( (nextX-x)/(@x2-@x1) ) < Math.abs( (nextY-y)/(@y2-@y1) )
        x = nextX
        y = (nextX-@x1)/ratio+@y1
      else
        x = (nextY-@y1)*ratio+@x1
        y = nextY
      tileX = if positiveX then x else Math.ceil(x)-1
      tileY = if positiveY then y else Math.ceil(y)-1
    if total <= Math.abs(x-@x1)+Math.abs(y-@y1)
      @endPoint = {x: @x2, y: @y2, tile: @tiles.getTile(Math.floor(@x2),Math.floor(@y2))} 
      @success = true
    else
      @endPoint = {x: x, y: y, tile: @tiles.getTile(Math.floor(tileX),Math.floor(tileY))}
      @success = false
  forceSuccess: ()->
    @endPoint = {x: @x2, y: @y2, tile: @tiles.getTile(Math.floor(@x2),Math.floor(@y2))} 
    @success = true
    @calculated = true
  getSuccess: ->
    unless @calculated
      @calcul()
    @success
  getEndPoint: ->
    unless @calculated
      @calcul()
    @endPoint