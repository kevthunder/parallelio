
const assert = require('chai').assert
const RoomGenerator = require('../lib/RoomGenerator')
const Alea = require('seedrandom/lib/alea')

describe('RoomGenerator', function () {
  it('create rooms', function () {
    var expected, gen, map, tiles, x, y
    gen = new RoomGenerator({
      rng: new Alea('seed'),
      width: 12,
      height: 12,
      minVolume: 10,
      maxVolume: 15
    })
    tiles = gen.getTiles()
    map = (function () {
      var i, ref, results
      results = []
      for (x = i = 0, ref = gen.width; (ref >= 0 ? i <= ref : i >= ref); x = ref >= 0 ? ++i : --i) {
        results.push((function () {
          var j, ref1, results1
          results1 = []
          for (y = j = 0, ref1 = gen.height; (ref1 >= 0 ? j <= ref1 : j >= ref1); y = ref1 >= 0 ? ++j : --j) {
            results1.push(0)
          }
          return results1
        })())
      }
      return results
    })()
    tiles.forEach(function (tile) {
      map[tile.x][tile.y] = 1
    })
    expected = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0], [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0], [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    return assert.deepEqual(map, expected)
  })
})
