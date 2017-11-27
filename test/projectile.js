(function() {
  var DamagePropagation, Invalidator, Projectile, Tile, TileContainer, Timing, assert;

  assert = require('chai').assert;

  Projectile = require('../lib/Projectile');

  Tile = require('parallelio-tiles').Tile;

  Timing = require('../lib/Timing');

  TileContainer = require('parallelio-tiles').TileContainer;

  DamagePropagation = require('../lib/DamagePropagation');

  Invalidator = require('spark-starter').Invalidator;

  describe('Projectile', function() {
    var DamagableTile, createTiles;
    DamagableTile = null;
    beforeEach(function() {
      return Invalidator.strict = false;
    });
    afterEach(function() {
      return Invalidator.strict = true;
    });
    before(function() {
      DamagableTile = Tile.definition();
      return DamagableTile.extend(Damageable);
    });
    createTiles = function() {
      var ctn;
      ctn = new TileContainer();
      return ctn.tap(function() {
        var f, w;
        w = function(opt) {
          return (new DamagableTile(opt.x, opt.y)).tap(function() {
            return this.walkable = false;
          });
        };
        f = function(opt) {
          return (new DamagableTile(opt.x, opt.y)).tap(function() {
            return this.walkable = true;
          });
        };
        return this.loadMatrix([[w, w, w, w, w, w, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, w, w, w, w, w, w]]);
      });
    };
    it('can damage tiles', function() {
      var ctn, payload, projectile, timing;
      timing = new Timing(false);
      ctn = createTiles();
      projectile = new Projectile({
        origin: ctn.getTile(1, 1),
        target: ctn.getTile(3, 3),
        propagationType: DamagePropagation.Normal,
        timing: timing
      });
      payload = projectile.deliverPayload();
      assert.instanceOf(payload, DamagePropagation);
      return assert.isBelow(ctn.getTile(3, 3).health, ctn.getTile(3, 3).maxHealth);
    });
    return it('damage tiles after some time', function() {
      var ctn, projectile, timing;
      timing = new Timing(false);
      ctn = createTiles();
      projectile = new Projectile({
        origin: ctn.getTile(1, 1),
        target: ctn.getTile(3, 3),
        propagationType: DamagePropagation.Normal,
        timing: timing
      });
      projectile.launch();
      assert.equal(ctn.getTile(3, 3).health, ctn.getTile(3, 3).maxHealth);
      assert.isAbove(timing.children.length, 0);
      timing.children.slice().forEach(function(timer) {
        return timer.tick();
      });
      assert.equal(timing.children.length, 0);
      return assert.isBelow(ctn.getTile(3, 3).health, ctn.getTile(3, 3).maxHealth);
    });
  });

}).call(this);
