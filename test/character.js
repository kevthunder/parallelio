(function() {
  var Character, Tile, assert;

  assert = require('chai').assert;

  Character = require('../lib/Character');

  Tile = require('parallelio-tiles').Tile;

  describe('Character', function() {
    return it('cannot go on walkable Tile', function() {
      var char, tile;
      char = new Character();
      tile = new Tile();
      tile.walkable = false;
      return assert.isFalse(char.canGoOnTile(tile));
    });
  });

}).call(this);
