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
    assert.equal map.locations.get(1).links.count(), 3
