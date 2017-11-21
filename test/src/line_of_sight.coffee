assert = require('chai').assert
LineOfSight = require('../lib/LineOfSight')
Tile = require('parallelio-tiles').Tile
TileContainer = require('parallelio-tiles').TileContainer

describe 'LineOfSight', ->
  it 'see when no obstacles', ->
    ctn = new TileContainer()
    ctn.tap ->
      f = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = true
      @loadMatrix([
        [f, f, f],
        [f, f, f],
        [f, f, f],
      ])
    los = new LineOfSight(ctn,1,0,1,2)
    assert.isTrue los.getSuccess()
    assert.equal los.getEndPoint().x, 1
    assert.equal los.getEndPoint().y, 2

  it 'see when obstacle (horizontal)', ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = false
      f = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = true
      @loadMatrix([
        [f, f, f],
        [f, w, f],
        [f, f, f],
      ])
    los = new LineOfSight(ctn,0.5,1.5,2.5,1.5)
    assert.isFalse los.getSuccess()
    assert.equal los.getEndPoint().x, 1
    assert.equal los.getEndPoint().y, 1.5

  it 'see when obstacle (vertical)', ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = false
      f = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = true
      @loadMatrix([
        [f, f, f],
        [f, w, f],
        [f, f, f],
      ])
    los = new LineOfSight(ctn,1.5,0.5,1.5,2.5)
    assert.isFalse los.getSuccess()
    assert.equal los.getEndPoint().x, 1.5
    assert.equal los.getEndPoint().y, 1

  it 'see when obstacle (diagonal)', ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = false
      f = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = true
      @loadMatrix([
        [f, f, f],
        [f, w, f],
        [f, f, f],
      ])
    los = new LineOfSight(ctn,0.5,0.5,2.5,2.5)
    assert.isFalse los.getSuccess()
    assert.equal los.getEndPoint().x, 1
    assert.equal los.getEndPoint().y, 1

  it 'see through oppening', ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = false
      f = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = true
      @loadMatrix([
        [f, f, f],
        [w, f, w],
        [f, f, f],
      ])
    los = new LineOfSight(ctn,1,0.5,2,2.5)
    assert.isTrue los.getSuccess()
    assert.equal los.getEndPoint().x, 2
    assert.equal los.getEndPoint().y, 2.5