
const assert = require('chai').assert
const Tile = require('parallelio-tiles').Tile
const TileContainer = require('parallelio-tiles').TileContainer
const PersonalWeapon = require('../lib/PersonalWeapon')
const Damageable = require('../lib/Damageable')

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
      [f, f, f, f, f]
    ])
  })
}

describe('PersonalWeapon', function () {
  it('can find if target is in range', function () {
    var ctn, weapon
    ctn = createStage()
    weapon = new PersonalWeapon({
      range: 3
    })
    assert.isTrue(weapon.inRange(ctn.getTile(0, 0), ctn.getTile(0, 2)))
    return assert.isFalse(weapon.inRange(ctn.getTile(0, 0), ctn.getTile(4, 0)))
  })
  it('can if it has line of sight over a target', function () {
    var ctn, weapon
    ctn = createStage()
    weapon = new PersonalWeapon()
    assert.isTrue(weapon.hasLineOfSight(ctn.getTile(0, 0), ctn.getTile(0, 2)))
    return assert.isFalse(weapon.hasLineOfSight(ctn.getTile(0, 1), ctn.getTile(4, 1)))
  })
  it('can damage a target', function () {
    var target, weapon
    target = new Damageable()
    weapon = new PersonalWeapon()
    assert.equal(target.health, 1000)
    weapon.useOn(target)
    assert.equal(target.health, 990)
    return weapon.destroy()
  })
})
