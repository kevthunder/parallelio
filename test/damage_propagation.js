(function() {
  var DamagePropagation, Damageable, Tile, TileContainer, assert;

  assert = require('chai').assert;

  DamagePropagation = require('../lib/DamagePropagation');

  Damageable = require('../lib/Damageable');

  Tile = require('parallelio-tiles').Tile;

  TileContainer = require('parallelio-tiles').TileContainer;

  describe('DamagePropagation', function() {
    var DamagableTile, createTiles;
    DamagableTile = null;
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
            return this.transparent = false;
          });
        };
        f = function(opt) {
          return (new DamagableTile(opt.x, opt.y)).tap(function() {
            return this.transparent = true;
          });
        };
        return this.loadMatrix([[w, w, w, w, w, w, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, w, w, w, w, w, w]]);
      });
    };
    describe('Normal', function() {
      return it('dammage tile in range', function() {
        var ctn, dm, target;
        ctn = createTiles();
        target = ctn.getTile(3, 3);
        dm = new DamagePropagation.Normal({
          tile: target,
          power: 100,
          range: 2
        });
        assert.isDefined(target.health);
        assert.equal(target.health, target.maxHealth, 'before');
        assert.equal(dm.initialDamage(target, 1).damage, 100);
        dm.apply();
        assert.equal(target.health, target.maxHealth - 100, 'center');
        assert.equal(ctn.getTile(2, 3).health, ctn.getTile(2, 3).maxHealth - 100, '1 from center');
        return assert.equal(ctn.getTile(1, 3).health, ctn.getTile(1, 3).maxHealth, '2 from center');
      });
    });
    return describe('Thermic', function() {
      it('dammage tile in range plus propagation', function() {
        var ctn, dm, target;
        ctn = createTiles();
        target = ctn.getTile(3, 3);
        dm = new DamagePropagation.Thermic({
          tile: target,
          power: 500,
          range: 2
        });
        assert.isDefined(target.health);
        assert.equal(target.health, target.maxHealth, 'before');
        assert.equal(dm.initialDamage(target, 2).damage, 500 / 2);
        dm.apply();
        assert.equal(target.health, target.maxHealth - 100, 'center');
        assert.equal(ctn.getTile(2, 3).health, ctn.getTile(2, 3).maxHealth - 100, '1 from center');
        return assert.equal(ctn.getTile(1, 3).health, ctn.getTile(1, 3).maxHealth - 16, '2 from center');
      });
      return it('propagete less to heavy dammaged tiles', function() {
        var ctn, dm, startAt, target;
        ctn = createTiles();
        startAt = 100;
        ctn.allTiles().forEach(function(tile) {
          return tile.health = startAt;
        });
        target = ctn.getTile(3, 3);
        dm = new DamagePropagation.Thermic({
          tile: target,
          power: 500,
          range: 2
        });
        assert.isDefined(target.health);
        assert.equal(target.health, startAt, 'before');
        dm.apply();
        assert.equal(target.health, startAt - 100, 'center');
        assert.equal(ctn.getTile(2, 3).health, startAt - 100, '1 from center');
        return assert.isAbove(ctn.getTile(1, 3).health, startAt - 16, '2 from center');
      });
    });
  });

}).call(this);
