const expect = require('chai').expect
const AirlockGenerator = require('../../lib/generators/AirlockGenerator')
const Airlock = require('../../lib/Airlock')
const Floor = require('../../lib/Floor')
const Alea = require('seedrandom/lib/alea')
const Tile = require('parallelio-tiles').Tile
const TileContainer = require('parallelio-tiles').TileContainer
const Direction = require('parallelio-tiles').Direction

describe('AirlockGenerator', function () {
  class Wall extends Tile {};
  Wall.properties({
    walkable: {
      default: false
    }
  })

  const usingFactories = function (fn) {
    const w = function (opt) {
      return new Wall(opt.x, opt.y)
    }
    const f = function (opt) {
      return new Floor(opt.x, opt.y)
    }
    return fn(w, f)
  }
  const makeStage = function () {
    const ctn = new TileContainer()
    usingFactories((w, f) => {
      ctn.loadMatrix([
        [w, w, w, w, w, w, w],
        [w, f, f, w, f, f, w],
        [w, w, f, w, w, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, w, f, f, w],
        [w, f, f, w, f, w, w],
        [w, w, w, w, w, w, w]
      ])
    })
    return ctn
  }
  const usingTileExpectation = function (fn) {
    const w = function (val, tile, pos) {
      expect(tile.walkable, `(${pos.x},${pos.y})`).to.be.false
    }
    const f = function (val, tile, pos) {
      expect(tile.walkable, `(${pos.x},${pos.y})`).to.be.true
    }
    const n = function (val, tile, pos) {
      expect(tile, `(${pos.x},${pos.y})`).to.be.undefined
    }
    const a = function (val, tile, pos) {
      expect(tile, `(${pos.x},${pos.y})`).to.be.instanceOf(Airlock)
    }
    return fn(w, f, n, a)
  }
  it('can create airlock', function () {
    const ctn = makeStage()
    const gen = usingFactories((w, f) => {
      return new AirlockGenerator({
        tileContainer: ctn,
        rng: new Alea('seed'),
        direction: Direction.up,
        wallFactory: w,
        floorFactory: f
      })
    })
    gen.generate()
    usingTileExpectation((w, f, n, a) => {
      ctn.reduceMatrix([
        [n, n, n, n, w, a, w],
        [w, w, w, w, w, f, w],
        [w, f, f, w, f, f, w],
        [w, w, f, w, w, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, w, f, f, w],
        [w, f, f, w, f, w, w],
        [w, w, w, w, w, w, w]
      ], null, { x: 0, y: -1 })
    })
    expect(ctn.getTile(5, -1).direction).to.be.equal(Direction.up)
  })
  it('can create airlock - bottom', function () {
    const ctn = makeStage()
    const gen = usingFactories((w, f) => {
      return new AirlockGenerator({
        tileContainer: ctn,
        rng: new Alea('seed'),
        direction: Direction.down,
        wallFactory: w,
        floorFactory: f
      })
    })
    gen.generate()
    usingTileExpectation((w, f, n, a) => {
      ctn.reduceMatrix([
        [w, w, w, w, w, w, w],
        [w, f, f, w, f, f, w],
        [w, w, f, w, w, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, w, f, f, w],
        [w, f, f, w, f, w, w],
        [w, w, f, w, w, w, w],
        [n, w, a, w, n, n, n]
      ])
    })
    expect(ctn.getTile(2, 7).direction).to.be.equal(Direction.down)
  })
  it('can create airlock - right', function () {
    const ctn = makeStage()
    const gen = usingFactories((w, f) => {
      return new AirlockGenerator({
        tileContainer: ctn,
        rng: new Alea('seed'),
        direction: Direction.right,
        wallFactory: w,
        floorFactory: f
      })
    })
    gen.generate()
    usingTileExpectation((w, f, n, a) => {
      ctn.reduceMatrix([
        [w, w, w, w, w, w, w, n],
        [w, f, f, w, f, f, w, n],
        [w, w, f, w, w, f, w, w],
        [w, f, f, f, f, f, f, a],
        [w, f, f, w, f, f, w, w],
        [w, f, f, w, f, w, w, n],
        [w, w, w, w, w, w, w, n]
      ])
    })
    expect(ctn.getTile(7, 3).direction).to.be.equal(Direction.right)
  })
})
