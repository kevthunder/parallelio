var Element, RoomGenerator, Tile, TileContainer, ref, ref1, ref2,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Element = ((ref = this.Spark) != null ? ref.Element : void 0) || require('spark-starter').Element;

TileContainer = ((ref1 = this.Parallelio) != null ? ref1.TileContainer : void 0) || require('parallelio-tiles').TileContainer;

Tile = ((ref2 = this.Parallelio) != null ? ref2.Tile : void 0) || require('parallelio-tiles').Tile;

RoomGenerator = (function(superClass) {
  extend(RoomGenerator, superClass);

  function RoomGenerator(options) {
    this.setProperties(options);
    this.directions = [
      {
        x: 1,
        y: 0
      }, {
        x: -1,
        y: 0
      }, {
        x: 0,
        y: 1
      }, {
        x: 0,
        y: -1
      }
    ];
    this.corners = [
      {
        x: 1,
        y: 1
      }, {
        x: -1,
        y: -1
      }, {
        x: -1,
        y: 1
      }, {
        x: 1,
        y: -1
      }
    ];
    this.allDirections = this.directions.concat(this.corners);
  }

  RoomGenerator.properties({
    rng: {
      "default": Math.random
    },
    maxVolume: {
      "default": 25
    },
    minVolume: {
      "default": 50
    },
    width: {
      "default": 30
    },
    height: {
      "default": 15
    },
    tiles: {
      calcul: function() {
        var k, l, ref3, ref4, tiles, x, y;
        tiles = new TileContainer();
        for (x = k = 0, ref3 = this.width; 0 <= ref3 ? k <= ref3 : k >= ref3; x = 0 <= ref3 ? ++k : --k) {
          for (y = l = 0, ref4 = this.height; 0 <= ref4 ? l <= ref4 : l >= ref4; y = 0 <= ref4 ? ++l : --l) {
            tiles.addTile(new Tile(x, y));
          }
        }
        return tiles;
      }
    },
    floorFactory: {
      "default": function(opt) {
        return new Tile(opt.x, opt.y);
      }
    },
    wallFactory: {
      "default": null
    },
    doorFactory: {
      calcul: function() {
        return this.floorFactory;
      }
    }
  });

  RoomGenerator.prototype.init = function() {
    this.finalTiles = null;
    this.rooms = [];
    return this.free = this.tiles.allTiles().filter((function(_this) {
      return function(tile) {
        var direction, k, len, next, ref3;
        ref3 = _this.allDirections;
        for (k = 0, len = ref3.length; k < len; k++) {
          direction = ref3[k];
          next = _this.tiles.getTile(tile.x + direction.x, tile.y + direction.y);
          if (next == null) {
            return false;
          }
        }
        return true;
      };
    })(this));
  };

  RoomGenerator.prototype.calcul = function() {
    var i;
    this.init();
    i = 0;
    while (this.step() || this.newRoom()) {
      i++;
    }
    this.createDoors();
    this.rooms;
    return this.makeFinalTiles();
  };

  RoomGenerator.prototype.makeFinalTiles = function() {
    return this.finalTiles = this.tiles.allTiles().map((function(_this) {
      return function(tile) {
        return typeof tile.factory === "function" ? tile.factory({
          x: tile.x,
          y: tile.y
        }) : void 0;
      };
    })(this)).filter((function(_this) {
      return function(tile) {
        return tile != null;
      };
    })(this));
  };

  RoomGenerator.prototype.getTiles = function() {
    if (this.finalTiles == null) {
      this.calcul();
    }
    return this.finalTiles;
  };

  RoomGenerator.prototype.newRoom = function() {
    if (this.free.length) {
      this.volume = Math.floor(this.rng() * (this.maxVolume - this.minVolume)) + this.minVolume;
      return this.room = new RoomGenerator.Room();
    }
  };

  RoomGenerator.prototype.randomDirections = function() {
    var i, j, o, x;
    o = this.directions.slice();
    j = void 0;
    x = void 0;
    i = o.length;
    while (i) {
      j = Math.floor(this.rng() * i);
      x = o[--i];
      o[i] = o[j];
      o[j] = x;
    }
    return o;
  };

  RoomGenerator.prototype.step = function() {
    var success, tries;
    if (this.room) {
      if (this.free.length && this.room.tiles.length < this.volume - 1) {
        if (this.room.tiles.length) {
          tries = this.randomDirections();
          success = false;
          while (tries.length && !success) {
            success = this.expand(this.room, tries.pop(), this.volume);
          }
          if (!success) {
            this.roomDone();
          }
          return success;
        } else {
          this.allocateTile(this.randomFreeTile(), this.room);
          return true;
        }
      } else {
        this.roomDone();
        return false;
      }
    }
  };

  RoomGenerator.prototype.roomDone = function() {
    this.rooms.push(this.room);
    this.allocateWalls(this.room);
    return this.room = null;
  };

  RoomGenerator.prototype.expand = function(room, direction, max) {
    var k, len, next, ref3, second, success, tile;
    if (max == null) {
      max = 0;
    }
    success = false;
    ref3 = room.tiles;
    for (k = 0, len = ref3.length; k < len; k++) {
      tile = ref3[k];
      if (max === 0 || room.tiles.length < max) {
        if (next = this.tileOffsetIsFree(tile, direction)) {
          this.allocateTile(next, room);
          success = true;
        }
        if ((second = this.tileOffsetIsFree(tile, direction, 2)) && !this.tileOffsetIsFree(tile, direction, 3)) {
          this.allocateTile(second, room);
        }
      }
    }
    return success;
  };

  RoomGenerator.prototype.allocateWalls = function(room) {
    var direction, k, len, next, nextRoom, otherSide, ref3, results, tile;
    ref3 = room.tiles;
    results = [];
    for (k = 0, len = ref3.length; k < len; k++) {
      tile = ref3[k];
      results.push((function() {
        var l, len1, ref4, results1;
        ref4 = this.allDirections;
        results1 = [];
        for (l = 0, len1 = ref4.length; l < len1; l++) {
          direction = ref4[l];
          next = this.tiles.getTile(tile.x + direction.x, tile.y + direction.y);
          if ((next != null) && next.room !== room) {
            if (indexOf.call(this.corners, direction) < 0) {
              otherSide = this.tiles.getTile(tile.x + direction.x * 2, tile.y + direction.y * 2);
              nextRoom = (otherSide != null ? otherSide.room : void 0) != null ? otherSide.room : null;
              room.addWall(next, nextRoom);
              if (nextRoom != null) {
                nextRoom.addWall(next, room);
              }
            }
            next.factory = this.wallFactory;
            results1.push(this.allocateTile(next));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  RoomGenerator.prototype.createDoors = function() {
    var door, k, len, ref3, results, room, walls;
    ref3 = this.rooms;
    results = [];
    for (k = 0, len = ref3.length; k < len; k++) {
      room = ref3[k];
      results.push((function() {
        var l, len1, ref4, results1;
        ref4 = room.wallsByRooms();
        results1 = [];
        for (l = 0, len1 = ref4.length; l < len1; l++) {
          walls = ref4[l];
          if ((walls.room != null) && room.doorsForRoom(walls.room) < 1) {
            door = walls.tiles[Math.floor(this.rng() * walls.tiles.length)];
            door.factory = this.doorFactory;
            room.addDoor(door, walls.room);
            results1.push(walls.room.addDoor(door, room));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  RoomGenerator.prototype.allocateTile = function(tile, room) {
    var index;
    if (room == null) {
      room = null;
    }
    if (room != null) {
      room.addTile(tile);
      tile.factory = this.floorFactory;
    }
    index = this.free.indexOf(tile);
    if (index > -1) {
      return this.free.splice(index, 1);
    }
  };

  RoomGenerator.prototype.tileOffsetIsFree = function(tile, direction, multiply) {
    if (multiply == null) {
      multiply = 1;
    }
    return this.tileIsFree(tile.x + direction.x * multiply, tile.y + direction.y * multiply);
  };

  RoomGenerator.prototype.tileIsFree = function(x, y) {
    var tile;
    tile = this.tiles.getTile(x, y);
    if ((tile != null) && indexOf.call(this.free, tile) >= 0) {
      return tile;
    } else {
      return false;
    }
  };

  RoomGenerator.prototype.randomFreeTile = function() {
    return this.free[Math.floor(this.rng() * this.free.length)];
  };

  return RoomGenerator;

})(Element);

RoomGenerator.Room = (function() {
  function Room() {
    this.tiles = [];
    this.walls = [];
    this.doors = [];
  }

  Room.prototype.addTile = function(tile) {
    this.tiles.push(tile);
    return tile.room = this;
  };

  Room.prototype.containsWall = function(tile) {
    var k, len, ref3, wall;
    ref3 = this.walls;
    for (k = 0, len = ref3.length; k < len; k++) {
      wall = ref3[k];
      if (wall.tile === tile) {
        return wall;
      }
    }
    return false;
  };

  Room.prototype.addWall = function(tile, nextRoom) {
    var existing;
    existing = this.containsWall(tile);
    if (existing) {
      return existing.nextRoom = nextRoom;
    } else {
      return this.walls.push({
        tile: tile,
        nextRoom: nextRoom
      });
    }
  };

  Room.prototype.wallsByRooms = function() {
    var k, len, pos, ref3, res, rooms, wall;
    rooms = [];
    res = [];
    ref3 = this.walls;
    for (k = 0, len = ref3.length; k < len; k++) {
      wall = ref3[k];
      pos = rooms.indexOf(wall.nextRoom);
      if (pos === -1) {
        pos = rooms.length;
        rooms.push(wall.nextRoom);
        res.push({
          room: wall.nextRoom,
          tiles: []
        });
      }
      res[pos].tiles.push(wall.tile);
    }
    return res;
  };

  Room.prototype.addDoor = function(tile, nextRoom) {
    return this.doors.push({
      tile: tile,
      nextRoom: nextRoom
    });
  };

  Room.prototype.doorsForRoom = function(room) {
    var door, k, len, ref3, res;
    res = [];
    ref3 = this.doors;
    for (k = 0, len = ref3.length; k < len; k++) {
      door = ref3[k];
      if (door.nextRoom === room) {
        res.push(door.tile);
      }
    }
    return res;
  };

  return Room;

})();

if (typeof Parallelio !== "undefined" && Parallelio !== null) {
  Parallelio.RoomGenerator = RoomGenerator;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = RoomGenerator;
} else {
  if (this.Parallelio == null) {
    this.Parallelio = {};
  }
  this.Parallelio.RoomGenerator = RoomGenerator;
}
