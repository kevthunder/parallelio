assert = require('chai').assert
Tile = require('parallelio-tiles').Tile
TileContainer = require('parallelio-tiles').TileContainer
PersonalWeapon = require('../lib/PersonalWeapon')
Damageable = require('../lib/Damageable')



createStage = ->
  ctn = new TileContainer()
  ctn.tap ->
    w = (opt) ->
      (new Tile(opt.x,opt.y)).tap ->
        @walkable = false
    f = (opt) ->
      (new Tile(opt.x,opt.y)).tap ->
        @walkable = true
    @loadMatrix([
      [f, f, f, f, f],
      [f, w, f, f, f],
      [f, f, f, f, f],
    ])

describe 'PersonalWeapon', ->
  it 'can find if target is in range', ->
    ctn = createStage()
    weapon = new PersonalWeapon(range: 3)
    
    assert.isTrue weapon.inRange(ctn.getTile(0,0), {tile:ctn.getTile(0,2)})
    assert.isFalse weapon.inRange(ctn.getTile(0,0), {tile:ctn.getTile(4,0)})

  it 'can if it has line of sight over a target', ->
    ctn = createStage()
    weapon = new PersonalWeapon()
    
    assert.isTrue weapon.hasLineOfSight(ctn.getTile(0,0), {tile:ctn.getTile(0,2)})
    assert.isFalse weapon.hasLineOfSight(ctn.getTile(0,1), {tile:ctn.getTile(4,1)})

  it 'can damage a target', ->
    target = new Damageable()
    weapon = new PersonalWeapon()

    assert.equal target.health, 1000
    weapon.useOn target
    assert.equal target.health, 990


