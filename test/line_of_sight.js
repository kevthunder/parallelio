
const assert = require('chai').assert
const LineOfSight = require('../lib/LineOfSight')
const Tile = require('parallelio-tiles').Tile
const TileContainer = require('parallelio-tiles').TileContainer

describe('LineOfSight', function () {
  it('see when no obstacles', function () {
    var ctn, los
    ctn = new TileContainer()
    ctn.tap(function () {
      var f
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = true
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [f, f, f],
        [f, f, f]
      ])
    })
    los = new LineOfSight(ctn, 1, 0, 1, 2)
    assert.isTrue(los.getSuccess())
    assert.equal(los.getEndPoint().x, 1)
    return assert.equal(los.getEndPoint().y, 2)
  })
  it('see edge (bottom-left)', function () {
    var ctn, los
    ctn = new TileContainer()
    ctn.tap(function () {
      var f
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = true
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [f, f, f],
        [f, f, f]
      ])
    })
    los = new LineOfSight(ctn, 0.5, 0.5, 0, 3)
    assert.isTrue(los.getSuccess())
    assert.equal(los.getEndPoint().x, 0)
    return assert.equal(los.getEndPoint().y, 3)
  })
  it('see edge (top-right)', function () {
    var ctn, los
    ctn = new TileContainer()
    ctn.tap(function () {
      var f
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = true
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [f, f, f],
        [f, f, f]
      ])
    })
    los = new LineOfSight(ctn, 2.5, 2.5, 3, 0)
    assert.isTrue(los.getSuccess())
    assert.equal(los.getEndPoint().x, 3)
    return assert.equal(los.getEndPoint().y, 0)
  })
  it('see when obstacle (horizontal)', function () {
    var ctn, los
    ctn = new TileContainer()
    ctn.tap(function () {
      var f, w
      w = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = false
        })
      }
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = true
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [f, w, f],
        [f, f, f]
      ])
    })
    los = new LineOfSight(ctn, 0.5, 1.5, 2.5, 1.5)
    assert.isFalse(los.getSuccess())
    assert.equal(los.getEndPoint().x, 1)
    return assert.equal(los.getEndPoint().y, 1.5)
  })
  it('see when obstacle (vertical)', function () {
    var ctn, los
    ctn = new TileContainer()
    ctn.tap(function () {
      var f, w
      w = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = false
        })
      }
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = true
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [f, w, f],
        [f, f, f]
      ])
    })
    los = new LineOfSight(ctn, 1.5, 0.5, 1.5, 2.5)
    assert.isFalse(los.getSuccess())
    assert.equal(los.getEndPoint().x, 1.5)
    return assert.equal(los.getEndPoint().y, 1)
  })
  it('see when obstacle (diagonal)', function () {
    var ctn, los
    ctn = new TileContainer()
    ctn.tap(function () {
      var f, w
      w = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = false
        })
      }
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = true
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [f, w, f],
        [f, f, f]
      ])
    })
    los = new LineOfSight(ctn, 0.5, 0.5, 2.5, 2.5)
    assert.isFalse(los.getSuccess())
    assert.equal(los.getEndPoint().x, 1)
    return assert.equal(los.getEndPoint().y, 1)
  })
  it('see through oppening', function () {
    var ctn, los
    ctn = new TileContainer()
    ctn.tap(function () {
      var f, w
      w = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = false
        })
      }
      f = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = true
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [w, f, w],
        [f, f, f]
      ])
    })
    los = new LineOfSight(ctn, 1, 0.5, 2, 2.5)
    assert.isTrue(los.getSuccess())
    assert.equal(los.getEndPoint().x, 2)
    return assert.equal(los.getEndPoint().y, 2.5)
  })
})
