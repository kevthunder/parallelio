(function() {
  var Invalidator, Projectile, Tile, Timing, Weapon, assert;

  assert = require('chai').assert;

  Weapon = require('../lib/Weapon');

  Projectile = require('../lib/Projectile');

  Tile = require('parallelio-tiles').Tile;

  Timing = require('parallelio-timing');

  Invalidator = require('spark-starter').Invalidator;

  describe('Weapon', function() {
    beforeEach(function() {
      return Invalidator.strict = false;
    });
    afterEach(function() {
      return Invalidator.strict = true;
    });
    it('fire projectile', function() {
      var projectile, timing, weapon;
      timing = new Timing(false);
      weapon = new Weapon({
        autoFire: false,
        autoFire: false,
        tile: new Tile(),
        target: new Tile(),
        timing: timing
      });
      assert.isTrue(weapon.charged);
      projectile = weapon.fire();
      assert.isDefined(projectile);
      assert.instanceOf(projectile, Projectile);
      return assert.isFalse(weapon.charged);
    });
    return it('cannot fire when heavily damaged', function() {
      var projectile, timing, weapon;
      timing = new Timing(false);
      weapon = new Weapon({
        autoFire: false,
        autoFire: false,
        tile: new Tile(),
        target: new Tile(),
        health: 20,
        timing: timing
      });
      assert.isTrue(weapon.charged);
      assert.isFalse(weapon.canFire);
      projectile = weapon.fire();
      return assert.isUndefined(projectile);
    });
  });

}).call(this);