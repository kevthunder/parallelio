(function() {
  var DamagePropagation, Damageable, Invalidator, Projectile, Tile, TileContainer, Timing, assert;

  assert = require('chai').assert;

  Projectile = require('../lib/Projectile');

  Tile = require('parallelio-tiles').Tile;

  Timing = require('parallelio-timing');

  Damageable = require('../lib/Damageable');

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
      DamagableTile = DamagableTile = class DamagableTile extends Tile {};
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
      timing = new Timing({
        running: false
      });
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
    it('damage tiles after some time', function() {
      var ctn, projectile, timing;
      timing = new Timing({
        running: false
      });
      ctn = createTiles();
      projectile = new Projectile({
        origin: ctn.getTile(1, 1),
        target: ctn.getTile(3, 3),
        propagationType: DamagePropagation.Normal,
        timing: timing
      });
      projectile.launch();
      assert.equal(ctn.getTile(3, 3).health, ctn.getTile(3, 3).maxHealth);
      projectile.pathTimeout.tick();
      return assert.isBelow(ctn.getTile(3, 3).health, ctn.getTile(3, 3).maxHealth);
    });
    return it('get position at half time', function() {
      var ctn, projectile, timer, timing;
      timing = new Timing({
        running: false
      });
      ctn = createTiles();
      projectile = new Projectile({
        origin: ctn.getTile(1, 1),
        target: ctn.getTile(5, 2),
        propagationType: DamagePropagation.Normal,
        timing: timing
      });
      projectile.launch();
      assert.equal(projectile.startPos.x, 1.5);
      assert.equal(projectile.startPos.y, 1.5);
      timer = projectile.pathTimeout;
      timer.remainingTime = timer.time / 2;
      assert.equal(projectile.x, 3.5);
      return assert.equal(projectile.y, 2);
    });
  });

}).call(this);

//# sourceMappingURL=maps/projectile.js.map
