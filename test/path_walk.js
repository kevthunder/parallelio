(function() {
  var PathFinder, PathWalk, Tile, TileContainer, assert;

  assert = require('chai').assert;

  PathWalk = require('../lib/PathWalk');

  Tile = require('parallelio-tiles').Tile;

  TileContainer = require('parallelio-tiles').TileContainer;

  PathFinder = require('parallelio-pathfinder');

  describe('PathWalk', function() {
    var createTiles;
    createTiles = function() {
      var ctn;
      ctn = new TileContainer();
      return ctn.tap(function() {
        var f, w;
        w = function(opt) {
          return (new Tile(opt.x, opt.y)).tap(function() {
            return this.walkable = false;
          });
        };
        f = function(opt) {
          return (new Tile(opt.x, opt.y)).tap(function() {
            return this.walkable = true;
          });
        };
        return this.loadMatrix([[w, w, w, w, w, w, w], [w, f, w, f, f, f, w], [w, f, w, f, w, f, w], [w, f, w, f, w, f, w], [w, f, f, f, w, f, w], [w, f, w, f, f, f, w], [w, w, w, w, w, w, w]]);
      });
    };
    return it('start walking', function() {
      var character, ctn, path, walk;
      character = {};
      ctn = createTiles();
      path = new PathFinder(ctn, ctn.getTile(1, 1), ctn.getTile(5, 1), {
        validTile: function(tile) {
          return tile.walkable;
        }
      });
      walk = new PathWalk(this, path);
      return walk.start();
    });
  });

}).call(this);
