
const assert = require('chai').assert
const AutomaticDoor = require('../lib/AutomaticDoor')
const Floor = require('../lib/Floor')
const Tile = require('parallelio-tiles').Tile
const Tiled = require('parallelio-tiles').Tiled
const TileContainer = require('parallelio-tiles').TileContainer

describe('AutomaticDoor', function () {
  var createStage
  createStage = function () {
    var ctn
    ctn = new TileContainer()
    ctn.tap(function () {
      var d, f, w
      w = function (opt) {
        return (new Tile(opt.x, opt.y)).tap(function () {
          this.transparent = false
        })
      }
      f = function (opt) {
        return new Floor(opt.x, opt.y)
      }
      d = function (opt) {
        return (new Floor(opt.x, opt.y)).tap(function () {
          ctn.door = new AutomaticDoor(AutomaticDoor.directions.horizontal)
          this.addChild(ctn.door)
        })
      }
      return this.loadMatrix([
        [f, f, f],
        [w, d, w],
        [f, f, f]
      ])
    })
    return ctn
  }
  it('is walkable when unlocked', function () {
    var stage
    stage = createStage()
    stage.door.locked = false
    return assert.isTrue(stage.door.tile.walkable)
  })
  it('is un-walkable when locked', function () {
    var stage
    stage = createStage()
    stage.door.locked = true
    return assert.isFalse(stage.door.tile.walkable)
  })
  it('is closed when an activator is not front of it', function () {
    var activator, stage
    activator = new Tiled()
    stage = createStage()
    stage.door.canBeActivatedBy = function (elem) {
      return elem === activator
    }
    stage.getTile(0, 0).addChild(activator)
    return assert.isFalse(stage.door.open)
  })
  it('open when an activator is in front of it', function () {
    var activator, stage
    activator = new Tiled()
    stage = createStage()
    stage.door.canBeActivatedBy = function (elem) {
      return elem === activator
    }
    stage.getTile(1, 0).addChild(activator)
    assert.isTrue(stage.door.open)
    stage.getTile(1, 0).removeChild(activator)
    assert.isFalse(stage.door.open)
    stage.getTile(1, 2).addChild(activator)
    return assert.isTrue(stage.door.open)
  })
  it('open when an activator is inside the doorway', function () {
    var activator, stage
    activator = new Tiled()
    stage = createStage()
    stage.door.canBeActivatedBy = function (elem) {
      return elem === activator
    }
    stage.getTile(1, 1).addChild(activator)
    return assert.isTrue(stage.door.open)
  })
})
