
const assert = require('chai').assert
const AttackAction = require('../lib/actions/AttackAction')
const Tile = require('parallelio-tiles').Tile
const TileContainer = require('parallelio-tiles').TileContainer
const Character = require('../lib/Character')
const PersonalWeapon = require('../lib/PersonalWeapon')

const createStage = function () {
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
      [f, f, f, f, f],
      [f, w, f, f, f],
      [f, w, f, f, f]
    ])
  })
}

describe('AttackAction', function () {
  it('can attack a target', function () {
    var action, char1, char2, ctn
    ctn = createStage()
    char1 = new Character()
    char1.tap(function () {
      this.tile = ctn.getTile(0, 0)
      this.weapons = [
        new PersonalWeapon({
          user: char1
        })
      ]
    })
    char2 = new Character().tap(function () {
      this.tile = ctn.getTile(2, 0)
    })
    action = new AttackAction({
      actor: char1,
      target: char2
    })
    assert.isTrue(action.isReady())
    assert.equal(char2.health, 1000)
    action.execute()
    assert.equal(char2.health, 990)
    return char1.weapons.forEach((w) => {
      return w.destroy()
    })
  })
  it('can move to attack a target', function () {
    var action, char1, char2, ctn
    ctn = createStage()
    char1 = new Character()
    char1.tap(function () {
      this.tile = ctn.getTile(0, 2)
      this.weapons = [
        new PersonalWeapon({
          user: char1
        })
      ]
    })
    char2 = new Character().tap(function () {
      this.tile = ctn.getTile(4, 2)
    })
    action = new AttackAction({
      actor: char1,
      target: char2
    })
    assert.isTrue(action.isReady())
    action.execute()
    assert.equal(char2.health, 1000)
    assert.exists(char1.walk)
    char1.walk.timing.running = false
    char1.walk.pathTimeout.prc = 1
    char1.walk.finish()
    assert.equal(char1.tile.x, 1)
    assert.equal(char1.tile.y, 0)
    assert.equal(char2.health, 990)
    return char1.weapons.forEach((w) => {
      return w.destroy()
    })
  })
})
