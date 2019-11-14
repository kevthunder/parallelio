
const assert = require('chai').assert
const Character = require('../lib/Character')
const Tile = require('parallelio-tiles').Tile

describe('Character', function () {
  it('get added as a tile child when tile is set', function () {
    var char, tile
    char = new Character()
    tile = new Tile()
    char.tile = tile
    return assert.isTrue(tile.children.includes(char))
  })
  it('cannot go on walkable Tile', function () {
    var char, tile
    char = new Character()
    tile = new Tile()
    tile.walkable = false
    return assert.isFalse(char.canGoOnTile(tile))
  })
})
