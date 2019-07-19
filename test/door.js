(function() {
  var Door, EventEmitter, Floor, assert;

  assert = require('chai').assert;

  EventEmitter = require('spark-starter').EventEmitter;

  Door = require('../lib/Door');

  Floor = require('../lib/Floor');

  describe('Door', function() {
    it('make the tile un-walkable when closed', function() {
      var door, floor;
      floor = new Floor();
      door = new Door();
      door.open = false;
      door.tile = floor;
      return assert.isFalse(floor.walkable);
    });
    return it('make the tile walkable when open', function() {
      var door, floor;
      floor = new Floor();
      door = new Door();
      door.open = false;
      door.tile = floor;
      assert.isFalse(floor.walkable);
      door.open = true;
      return assert.isTrue(floor.walkable);
    });
  });

}).call(this);
