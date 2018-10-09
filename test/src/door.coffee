assert = require('chai').assert
EventEmitter = require('spark-starter').EventEmitter
Door = require('../lib/Door')
Floor = require('../lib/Floor')

describe 'Door', ->
  before ->
    Door = Door.definition()
    Door.include EventEmitter.prototype
    
  it 'make the tile un-walkable when closed', ->
    floor = new Floor()
    door = new Door()
    door.open = false
    door.tile = floor

    assert.isFalse floor.walkable
    
  it 'make the tile walkable when open', ->
    floor = new Floor()
    door = new Door()
    door.open = false
    door.tile = floor

    assert.isFalse floor.walkable

    door.open = true
    assert.isTrue floor.walkable
