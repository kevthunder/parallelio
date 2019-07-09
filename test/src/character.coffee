assert = require('chai').assert
Character = require('../lib/Character')
Tile = require('parallelio-tiles').Tile

describe 'Character', ->
  it 'get added as a tile child when tile is set', ->
    char = new Character()
    tile = new Tile()
    char.tile = tile
    assert.isTrue tile.children.includes(char)

  it 'cannot go on walkable Tile', ->
    char = new Character()
    tile = new Tile()
    tile.walkable = false
    assert.isFalse char.canGoOnTile(tile)
