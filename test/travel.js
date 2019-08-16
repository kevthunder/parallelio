(function() {
  var Ship, StarMapGenerator, Timing, Travel, alea, assert;

  assert = require('chai').assert;

  Ship = require('../lib/Ship');

  Travel = require('../lib/Travel');

  StarMapGenerator = require('../lib/StarMapGenerator');

  alea = require('seedrandom/lib/alea');

  Timing = require('parallelio-timing');

  describe('Travel', function() {
    return it('make a ship go from location A a to location B', function() {
      var gen, locationA, locationB, map, ship, travel;
      gen = new StarMapGenerator({
        nbStars: 5,
        rng: new alea('test seed')
      });
      map = gen.generate();
      locationA = map.locations.get(0);
      locationB = map.locations.get(0).links.get(0).otherStar(locationA);
      ship = new Ship({
        location: locationA
      });
      travel = new Travel({
        traveller: ship,
        startLocation: locationA,
        targetLocation: locationB,
        timing: new Timing({
          running: false
        })
      });
      assert.isTrue(travel.valid);
      assert.equal(ship.location, locationA);
      assert.equal(ship.spaceCoodinate.x, locationA.x);
      assert.equal(ship.spaceCoodinate.y, locationA.y);
      travel.start();
      assert.isTrue(travel.moving);
      assert.equal(ship.location, locationA);
      travel.pathTimeout.prc = 0.5;
      assert.equal(ship.spaceCoodinate.x, (locationA.x - locationB.x) * 0.5 + locationB.x);
      assert.equal(ship.spaceCoodinate.y, (locationA.y - locationB.y) * 0.5 + locationB.y);
      travel.pathTimeout.tick();
      assert.equal(travel.pathTimeout.remainingTime, 0);
      assert.isFalse(travel.moving);
      assert.equal(ship.location, locationB);
      assert.equal(ship.spaceCoodinate.x, locationB.x);
      return assert.equal(ship.spaceCoodinate.y, locationB.y);
    });
  });

}).call(this);

//# sourceMappingURL=maps/travel.js.map
