(function() {
  var StarMapGenerator, alea, assert;

  assert = require('chai').assert;

  StarMapGenerator = require('../lib/StarMapGenerator');

  alea = require('seedrandom/lib/alea');

  describe('StarMapGenerator', function() {
    return it('can generate a map', function() {
      var gen, map;
      gen = new StarMapGenerator({
        nbStars: 20,
        rng: new alea('test seed')
      });
      map = gen.generate();
      assert.equal(map.locations.count(), 20);
      return assert.equal(map.locations.get(1).links.count(), 3);
    });
  });

}).call(this);
