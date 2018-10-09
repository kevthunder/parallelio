assert = require('chai').assert
EventEmitter = require('spark-starter').EventEmitter
AutomaticDoor = require('../lib/AutomaticDoor')
Floor = require('../lib/Floor')
Tile = require('parallelio-tiles').Tile
Tiled = require('parallelio-tiles').Tiled
TileContainer = require('parallelio-tiles').TileContainer

describe 'AutomaticDoor', ->
  before ->
    AutomaticDoor = AutomaticDoor.definition()
    AutomaticDoor.include EventEmitter.prototype
    
    Floor = Floor.definition()
    Floor.include EventEmitter.prototype

  createStage = ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = false
      f = (opt) ->
        new Floor(opt.x,opt.y)
      d = (opt) ->
        (new Floor(opt.x,opt.y)).tap ->
          ctn.door = new AutomaticDoor(AutomaticDoor.directions.horizontal)
          @addChild(ctn.door)
      @loadMatrix([
        [f, f, f],
        [w, d, w],
        [f, f, f],
      ])
    ctn
    
  it 'is walkable when unlocked', ->
    stage = createStage()
    stage.door.locked = false
    assert.isTrue stage.door.tile.walkable

  it 'is un-walkable when locked', ->
    stage = createStage()
    stage.door.locked = true
    assert.isFalse stage.door.tile.walkable
    
  it 'is closed when an activator is not front of it', ->
    activator = new Tiled()
    stage = createStage()
    stage.door.canBeActivatedBy = (elem)->
        elem == activator
    stage.getTile(0,0).addChild(activator)
    assert.isFalse stage.door.open

  it 'open when an activator is in front of it', ->
    activator = new Tiled()
    stage = createStage()
    stage.door.canBeActivatedBy = (elem)->
        elem == activator
    stage.getTile(1,0).addChild(activator)
    assert.isTrue stage.door.open
    stage.getTile(1,0).removeChild(activator)
    assert.isFalse stage.door.open
    stage.getTile(1,2).addChild(activator)
    assert.isTrue stage.door.open
    
  it 'open when an activator is inside the doorway', ->
    activator = new Tiled()
    stage = createStage()
    stage.door.canBeActivatedBy = (elem)->
        elem == activator
    stage.getTile(1,1).addChild(activator)
    assert.isTrue stage.door.open

    
