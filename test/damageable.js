(function() {
  var Damageable, assert;

  assert = require('chai').assert;

  Damageable = require('../lib/Damageable');

  describe('Damageable', function() {
    it('can be damaged', function() {
      var damageable, init;
      damageable = new Damageable();
      assert.isTrue(damageable.damageable);
      init = damageable.health;
      damageable.damage(10);
      return assert.equal(damageable.health, init - 10);
    });
    return it('call whenNoHealth when no health', function() {
      var calls, damageable;
      calls = 0;
      damageable = new Damageable();
      damageable.whenNoHealth = function() {
        return calls++;
      };
      assert.equal(calls, 0);
      damageable.damage(damageable.maxHealth * 2);
      assert.equal(damageable.health, 0);
      return assert.equal(calls, 1);
    });
  });

}).call(this);

//# sourceMappingURL=maps/damageable.js.map
