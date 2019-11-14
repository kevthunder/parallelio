
const assert = require('chai').assert
const ShipWeapon = require('../lib/ShipWeapon')
const Projectile = require('../lib/Projectile')
const Tile = require('parallelio-tiles').Tile
const Timing = require('parallelio-timing')
const Invalidator = require('spark-starter').Invalidator

describe('ShipWeapon', function () {
  beforeEach(function () {
    Invalidator.strict = false
  })
  afterEach(function () {
    Invalidator.strict = true
  })
  it('fire projectile', function () {
    var projectile, timing, weapon
    timing = new Timing({
      running: false
    })
    weapon = new ShipWeapon({
      autoFire: false,
      autoFire: false,
      tile: new Tile(),
      target: new Tile(),
      timing: timing
    })
    assert.isTrue(weapon.charged)
    projectile = weapon.fire()
    assert.isDefined(projectile)
    assert.instanceOf(projectile, Projectile)
    return assert.isFalse(weapon.charged)
  })
  it('cannot fire when heavily damaged', function () {
    var projectile, timing, weapon
    timing = new Timing({
      running: false
    })
    weapon = new ShipWeapon({
      autoFire: false,
      autoFire: false,
      tile: new Tile(),
      target: new Tile(),
      health: 20,
      timing: timing
    })
    assert.isTrue(weapon.charged)
    assert.isFalse(weapon.canFire)
    projectile = weapon.fire()
    return assert.isUndefined(projectile)
  })
})
