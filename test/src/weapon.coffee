assert = require('chai').assert
Weapon = require('../lib/Weapon')
Projectile = require('../lib/Projectile')
Tile = require('parallelio-tiles').Tile
Timing = require('../lib/Timing')

describe 'Weapon', ->
  it 'fire projectile', ->
    timing = new Timing(false)
    weapon = new Weapon({
      autoFire:false,
      autoFire:false,
      tile:new Tile(),
      target:new Tile()
    })
    assert.isTrue weapon.charged
    projectile = weapon.fire()
    assert.instanceOf projectile, Projectile
    assert.isFalse weapon.charged
  it 'cannot fire when heavily damaged', ->
    timing = new Timing(false)
    weapon = new Weapon({
      autoFire:false,
      autoFire:false,
      tile:new Tile(),
      target:new Tile()
      health: 20
    })
    assert.isTrue weapon.charged
    assert.isFalse weapon.canFire
    projectile = weapon.fire()
    assert.isUndefined projectile

