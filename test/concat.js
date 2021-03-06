
const assert = require('chai').assert

describe('concatened file check', function () {
  const tests = function (file) {
    let Parallelio
    before(function () {
      Parallelio = require(file)
    })
    it('contains Element', function () {
      return assert.isFunction(Parallelio.Element)
    })
    it('contains StarSystem', function () {
      return assert.isFunction(Parallelio.StarSystem)
    })
    it('contains PathFinder', function () {
      return assert.isFunction(Parallelio.PathFinder)
    })
    it('contains Timing', function () {
      return assert.isFunction(Parallelio.Timing)
    })
    it('contains TargetAction', function () {
      return assert.isFunction(Parallelio.actions.TargetAction)
    })
    it('contains Tile', function () {
      assert.isFunction(Parallelio.tiles.Tile)
      assert.isFunction(Parallelio.tiles.Tiled)
      return assert.isFunction(Parallelio.tiles.Direction)
    })
    it('contains Wire', function () {
      assert.isFunction(Parallelio.wiring.Wire)
      return assert.isFunction(Parallelio.wiring.Connected)
    })
    it('contains strings', function () {
      assert.isObject(Parallelio.strings)
      return assert.isArray(Parallelio.strings.greekAlphabet)
    })
  }
  describe('index file', function () {
    tests('../lib/parallelio.js')
  })
  describe('dist/parallelio.js', function () {
    tests('../dist/parallelio.js')
  })
  describe('dist/parallelio.min.js', function () {
    tests('../dist/parallelio.min.js')
  })
})
