assert = require('chai').assert
PathWalk = require('../lib/PathWalk')
Tile = require('parallelio-tiles').Tile
TileContainer = require('parallelio-tiles').TileContainer
PathFinder = require('parallelio-pathfinder')


describe 'PathWalk', ->
  createTiles = ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @walkable = false
      f = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @walkable = true
      @loadMatrix([
        [w, w, w, w, w, w, w],
        [w, f, w, f, f, f, w],
        [w, f, w, f, w, f, w],
        [w, f, w, f, w, f, w],
        [w, f, f, f, w, f, w],
        [w, f, w, f, f, f, w],
        [w, w, w, w, w, w, w],
      ])

  it 'start walking', ->
    character = {}
    ctn = createTiles()

    path = new PathFinder(ctn, ctn.getTile(1,1), ctn.getTile(5,1), {
      validTile: (tile) ->
        tile.walkable
    })

    walk = new PathWalk(this, path)
    walk.start()