
const assert = require('chai').assert
const StarMapGenerator = require('../lib/generators/StarMapGenerator')
const Alea = require('seedrandom/lib/alea')

describe('StarMapGenerator', function () {
  it('can generate a map', function () {
    var gen, map
    gen = new StarMapGenerator({
      nbStars: 20,
      rng: new Alea('test seed')
    })
    map = gen.generate()
    assert.equal(map.locations.count(), 20)
    assert.isAtLeast(map.locations.get(1).links.count(), 3)
    assert.isNumber(map.locations.get(1).x)
    assert.isNumber(map.locations.get(1).y)
    assert.notDeepEqual({
      x: map.locations.get(1).x,
      y: map.locations.get(1).y
    }, {
      x: map.locations.get(2).x,
      y: map.locations.get(2).y
    })
    assert.isString(map.locations.get(1).name)
    assert.isAbove(map.locations.get(1).name.length, 1)
    return assert.notEqual(map.locations.get(1).name, map.locations.get(2).name)
  })
})
