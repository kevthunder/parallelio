(function(definition){RoomGenerator=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);RoomGenerator.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=RoomGenerator;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.RoomGenerator=RoomGenerator;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.RoomGenerator=RoomGenerator;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var TileContainer = dependencies.hasOwnProperty("TileContainer") ? dependencies.TileContainer : require('parallelio-tiles').TileContainer;
var Tile = dependencies.hasOwnProperty("Tile") ? dependencies.Tile : require('parallelio-tiles').Tile;
var Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : require('./Door');
var RoomGenerator, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
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
        var k, l, ref, ref1, tiles, x, y;
        tiles = new TileContainer();
        for (x = k = 0, ref = this.width; 0 <= ref ? k <= ref : k >= ref; x = 0 <= ref ? ++k : --k) {
          for (y = l = 0, ref1 = this.height; 0 <= ref1 ? l <= ref1 : l >= ref1; y = 0 <= ref1 ? ++l : --l) {
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
        var direction, k, len, next, ref;
        ref = _this.allDirections;
        for (k = 0, len = ref.length; k < len; k++) {
          direction = ref[k];
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
        var opt;
        if (tile.factory != null) {
          opt = {
            x: tile.x,
            y: tile.y
          };
          if (tile.factoryOptions != null) {
            opt = Object.assign(opt, tile.factoryOptions);
          }
          return tile.factory(opt);
        }
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
    var k, len, next, ref, second, success, tile;
    if (max == null) {
      max = 0;
    }
    success = false;
    ref = room.tiles;
    for (k = 0, len = ref.length; k < len; k++) {
      tile = ref[k];
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
    var direction, k, len, next, nextRoom, otherSide, ref, results, tile;
    ref = room.tiles;
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      tile = ref[k];
      results.push((function() {
        var l, len1, ref1, results1;
        ref1 = this.allDirections;
        results1 = [];
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          direction = ref1[l];
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
    var door, k, len, ref, results, room, walls;
    ref = this.rooms;
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      room = ref[k];
      results.push((function() {
        var l, len1, ref1, results1;
        ref1 = room.wallsByRooms();
        results1 = [];
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          walls = ref1[l];
          if ((walls.room != null) && room.doorsForRoom(walls.room) < 1) {
            door = walls.tiles[Math.floor(this.rng() * walls.tiles.length)];
            door.factory = this.doorFactory;
            door.factoryOptions = {
              direction: this.tiles.getTile(door.x + 1, door.y).factory === this.floorFactory ? Door.directions.vertical : Door.directions.horizontal
            };
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
    var k, len, ref, wall;
    ref = this.walls;
    for (k = 0, len = ref.length; k < len; k++) {
      wall = ref[k];
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
    var k, len, pos, ref, res, rooms, wall;
    rooms = [];
    res = [];
    ref = this.walls;
    for (k = 0, len = ref.length; k < len; k++) {
      wall = ref[k];
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
    var door, k, len, ref, res;
    res = [];
    ref = this.doors;
    for (k = 0, len = ref.length; k < len; k++) {
      door = ref[k];
      if (door.nextRoom === room) {
        res.push(door.tile);
      }
    }
    return res;
  };

  return Room;

})();

return(RoomGenerator);});