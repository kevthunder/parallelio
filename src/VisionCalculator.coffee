LineOfSight = require('./LineOfSight')
Direction = require('parallelio-tiles').Direction
TileContainer = require('parallelio-tiles').TileContainer
TileReference = require('parallelio-tiles').TileReference

class VisionCalculator
  constructor: (@originTile, @offset = {x:0.5,y:0.5})->
    @pts = {}
    @visibility = {}
    @stack = []
    @calculated = false
  calcul: ->
    @init()
    while @stack.length
      @step()
    @calculated = true
  init: ->
    @pts = {}
    @visibility = {}
    initialPts = [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}]
    initialPts.forEach (pt)=>
      @setPt(@originTile.x+pt.x, @originTile.y+pt.y, true)
    firstBatch = [
      {x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:-1,y:2},
      {x:2,y:-1},{x:2,y:0},{x:2,y:1},{x:2,y:2},
      {x:0,y:-1},{x:1,y:-1},
      {x:0,y:2},{x:1,y:2}
    ]
    @stack = firstBatch.map (pt) => {x:@originTile.x+pt.x, y:@originTile.y+pt.y}
  setPt: (x, y, val)->
    @pts[x+':'+y] = val
    adjancent = [{x:0,y:0},{x:-1,y:0},{x:0,y:-1},{x:-1,y:-1}]
    adjancent.forEach (pt)=>
      @addVisibility(x+pt.x, y+pt.y, if val then 1/adjancent.length else 0)
  getPt: (x, y)->
    @pts[x+':'+y]
  addVisibility: (x, y, val)->
    unless @visibility[x]?
      @visibility[x] = {}
    if @visibility[x][y]?
      @visibility[x][y] += val
    else
      @visibility[x][y] = val
  getVisibility: (x,y)->
    if !@visibility[x]? or !@visibility[x][y]?
      0
    else
      @visibility[x][y]
  canProcess: (x, y)->
    !@stack.some((pt)=> pt.x == x and pt.y == y) and !@getPt(x,y)?
  step: ->
    pt = @stack.shift()
    los = new LineOfSight(@originTile.container, @originTile.x+@offset.x, @originTile.y+@offset.y, pt.x, pt.y)
    los.reverseTracing()
    los.traversableCallback = (tile,entryX,entryY)=>
      if tile?
        if @getVisibility(tile.x,tile.y) == 1
          los.forceSuccess()
        else
          tile.transparent
    @setPt(pt.x,pt.y, los.getSuccess())
    if los.getSuccess()
      Direction.all.forEach (direction)=>
        nextPt = {x:pt.x+direction.x, y:pt.y+direction.y}
        if @canProcess(nextPt.x, nextPt.y)
          @stack.push(nextPt)

  getBounds: ->
    boundaries = {top:null,left:null,bottom:null,right:null}
    for x, col of @visibility
      for y, val of col
        if !boundaries.top? || y < boundaries.top
          boundaries.top = y
        if !boundaries.left? || x < boundaries.left
          boundaries.left = x
        if !boundaries.bottom? || y > boundaries.bottom
          boundaries.bottom = y
        if !boundaries.right? || x > boundaries.right
          boundaries.right = x
    boundaries

  toContainer: ->
    res = new TileContainer()
    res.owner = false
    for x, col of @visibility
      for y, val of col
        tile = @originTile.container.getTile(x,y)
        if val!=0 and tile?
          tile = new TileReference(tile)
          tile.visibility = val
          res.addTile tile
    res

  toMap: ->
    res = Object.assign({map:[]},@getBounds())
    for y in [res.top..res.bottom-1]
      res.map[y-res.top] = []
      for x in [res.left..res.right-1]
        res.map[y-res.top][x-res.left] = @getVisibility(x,y)
    res