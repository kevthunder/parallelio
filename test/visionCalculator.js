(function() {
  var Tile, TileContainer, VisionCalculator, assert;

  assert = require('chai').assert;

  VisionCalculator = require('../lib/VisionCalculator');

  Tile = require('parallelio-tiles').Tile;

  TileContainer = require('parallelio-tiles').TileContainer;

  describe('VisionCalculator', function() {
    return it('can caculate vision', function() {
      var caculator, ctn, expected;
      ctn = new TileContainer();
      ctn.tap(function() {
        var f, w;
        w = function(opt) {
          return (new Tile(opt.x, opt.y)).tap(function() {
            return this.transparent = false;
          });
        };
        f = function(opt) {
          return (new Tile(opt.x, opt.y)).tap(function() {
            return this.transparent = true;
          });
        };
        return this.loadMatrix([[f, w, f, f, f], [f, w, f, f, f], [f, f, f, f, f], [f, w, f, f, f], [f, w, f, f, f]]);
      });
      caculator = new VisionCalculator(ctn.getTile(0, 2));
      caculator.calcul();
      expected = [[0.25, 0.5, 0.25, 0, 0, 0, 0], [0.5, 1, 0.5, 0, 0, 0.25, 0.25], [0.5, 1, 0.75, 0.5, 0.5, 0.75, 0.5], [0.5, 1, 1, 1, 1, 1, 0.5], [0.5, 1, 0.75, 0.5, 0.5, 0.75, 0.5], [0.5, 1, 0.5, 0, 0, 0.25, 0.25], [0.25, 0.5, 0.25, 0, 0, 0, 0]];
      return assert.deepEqual(caculator.toMap().map, expected);
    });
  });

}).call(this);

//# sourceMappingURL=maps/visionCalculator.js.map
