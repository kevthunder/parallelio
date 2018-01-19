(function() {
  var Door, EventEmitter, Floor, assert;

  assert = require('chai').assert;

  EventEmitter = require("wolfy87-eventemitter");

  Door = require('../lib/Door');

  Floor = require('../lib/Floor');

  describe('Door', function() {
    before(function() {
      Door = Door.definition();
      return Door.include(EventEmitter.prototype);
    });
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
