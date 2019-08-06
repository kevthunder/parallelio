assert = require('chai').assert
StarMapGenerator = require('../lib/StarMapGenerator')
alea = require('seedrandom/lib/alea');

describe 'StarMapGenerator', ->
  it 'can generate a map', ->
    gen = new StarMapGenerator({
      nbStars: 20
      rng: new alea('test seed')
    })
    map = gen.generate()
    assert.equal map.locations.count(), 20
    assert.isAtLeast map.locations.get(1).links.count(), 3

    assert.isNumber map.locations.get(1).x
    assert.isNumber map.locations.get(1).y

    assert.notDeepEqual {x:map.locations.get(1).x, y:map.locations.get(1).y}, {x:map.locations.get(2).x, y:map.locations.get(2).y}

    assert.isString map.locations.get(1).name
    assert.isAbove map.locations.get(1).name.length, 1

    assert.notEqual map.locations.get(1).name, map.locations.get(2).name


