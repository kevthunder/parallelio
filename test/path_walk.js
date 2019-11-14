
const assert = require('chai').assert
const PathWalk = require('../lib/PathWalk')
const Tile = require('parallelio-tiles').Tile
const TileContainer = require('parallelio-tiles').TileContainer
const PathFinder = require('parallelio-pathfinder')
const Element = require('spark-starter').Element

describe.skip('PathWalk', function () {
  var createTiles
  createTiles = function () {
    var ctn
    ctn = new TileContainer()
    return ctn.tap(function () {
      var f, w
      w = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.walkable = false
        })
      }
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.walkable = true
        })
      }
      return this.loadMatrix([
        [w, w, w, w, w, w, w],
        [w, f, w, f, f, f, w],
        [w, f, w, f, w, f, w],
        [w, f, w, f, w, f, w],
        [w, f, f, f, w, f, w],
        [w, f, w, f, f, f, w],
        [w, w, w, w, w, w, w]
      ])
    })
  }
  it('start walking', function () {
    var Walker, character, ctn, path, walk
    Walker = (function () {
      class Walker extends Element {};

      Walker.properties({
        offsetX: {
          composed: true
        },
        offsetY: {
          composed: true
        },
        tile: {
          composed: true
        }
      })

      return Walker
    }.call(this))
    character = new Walker()
    ctn = createTiles()
    path = new PathFinder(ctn, ctn.getTile(1, 1), ctn.getTile(5, 1), {
      validTile: function (tile) {
        return tile.walkable
      }
    })
    walk = new PathWalk(character, path)
    walk.timing.running = false
    walk.start()
    assert.isAbove(walk.pathLength, 0)
    assert.isAbove(walk.totalTime, 0)
    assert.equal(character.tile, ctn.getTile(1, 1), 'initial pos')
    walk.pathTimeout.prc = 0.5
    assert.equal(character.tile, ctn.getTile(3, 4), 'mid pos')
    walk.pathTimeout.prc = 1
    assert.equal(character.tile, ctn.getTile(5, 1), 'final pos')
    return walk.end()
  })
})
