
const assert = require('chai').assert
const RoomGenerator = require('../lib/RoomGenerator')
const Alea = require('seedrandom/lib/alea')

describe('RoomGenerator', function () {
  it('create rooms', function () {
    var expected, gen, tiles
    gen = new RoomGenerator({
      rng: new Alea('seed'),
      width: 13,
      height: 13,
      minVolume: 10,
      maxVolume: 15
    })
    tiles = gen.getTiles()
    const map = Array.from(Array(gen.width), () =>
      Array.from(Array(gen.height), () => 0)
    )
    tiles.forEach(function (tile) {
      map[tile.x][tile.y] = 1
    })
    expected = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    return assert.deepEqual(map, expected)
  })
})
