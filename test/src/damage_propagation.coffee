assert = require('chai').assert
DamagePropagation = require('../lib/DamagePropagation')
Damageable = require('../lib/Damageable')
Tile = require('parallelio-tiles').Tile
TileContainer = require('parallelio-tiles').TileContainer


describe 'DamagePropagation', ->
  DamagableTile = null
  before ->
    DamagableTile = Tile.definition()
    DamagableTile.extend(Damageable)
  createTiles = ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new DamagableTile(opt.x,opt.y)).tap ->
          @transparent = false
      f = (opt) ->
        (new DamagableTile(opt.x,opt.y)).tap ->
          @transparent = true
      @loadMatrix([
        [w, w, w, w, w, w, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, w, w, w, w, w, w],
      ])

  describe 'Normal', ->
    it 'dammage tile in range', ->
      ctn = createTiles()
      target = ctn.getTile(3,3)
      dm = new DamagePropagation.Normal({tile:target,power:100,range:2})
      assert.isDefined target.health
      assert.equal target.health, target.maxHealth, 'before'

      assert.equal dm.initialDamage(target, 1).damage, 100
      dm.apply()
      assert.equal target.health, target.maxHealth-100, 'center'
      assert.equal ctn.getTile(2,3).health, ctn.getTile(2,3).maxHealth-100, '1 from center'
      assert.equal ctn.getTile(1,3).health, ctn.getTile(1,3).maxHealth, '2 from center'

  describe 'Thermic', ->
    it 'dammage tile in range plus propagation', ->
      ctn = createTiles()
      target = ctn.getTile(3,3)
      dm = new DamagePropagation.Thermic({tile:target,power:500,range:2})
      assert.isDefined target.health
      assert.equal target.health, target.maxHealth, 'before'

      assert.equal dm.initialDamage(target, 2).damage, 500/2
      dm.apply()
      assert.equal target.health, target.maxHealth-100, 'center'
      assert.equal ctn.getTile(2,3).health, ctn.getTile(2,3).maxHealth-100, '1 from center'
      assert.equal ctn.getTile(1,3).health, ctn.getTile(1,3).maxHealth-16, '2 from center'

    it 'propagete less to heavy dammaged tiles', ->
      ctn = createTiles()
      startAt = 100
      ctn.allTiles().forEach (tile)->
        tile.health = startAt
      target = ctn.getTile(3,3)
      dm = new DamagePropagation.Thermic({tile:target,power:500,range:2})
      assert.isDefined target.health
      assert.equal target.health, startAt, 'before'

      dm.apply()
      assert.equal target.health, startAt-100, 'center'
      assert.equal ctn.getTile(2,3).health, startAt-100, '1 from center'
      assert.isAbove ctn.getTile(1,3).health, startAt-16, '2 from center'

