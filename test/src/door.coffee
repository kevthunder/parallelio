assert = require('chai').assert
EventEmitter = require("wolfy87-eventemitter")
Door = require('../lib/Door')
Door.include EventEmitter.prototype
Floor = require('../lib/Floor')

describe 'Door', ->
  it 'make the tile un-walkable when closed', ->
    floor = new Floor()
    door = new Door()
    door.open = false
    door.tile = floor

    debugger
    assert.isFalse floor.walkable
    
  it 'make the tile walkable when open', ->
    floor = new Floor()
    door = new Door()
    door.open = false
    door.tile = floor

    assert.isFalse floor.walkable

    door.open = true
    assert.isTrue floor.walkable
