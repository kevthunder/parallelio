assert = require('chai').assert
Character = require('../lib/Character')
Tile = require('parallelio-tiles').Tile

describe 'Character', ->
  it 'cannot go on walkable Tile', ->
    char = new Character()
    tile = new Tile()
    tile.walkable = false
    assert.isFalse char.canGoOnTile(tile)
