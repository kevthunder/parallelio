assert = require('chai').assert
Projectile = require('../lib/Projectile')
Tile = require('parallelio-tiles').Tile
Timing = require('../lib/Timing')
TileContainer = require('parallelio-tiles').TileContainer
DamagePropagation = require('../lib/DamagePropagation')
Invalidator = require('spark-starter').Invalidator

describe 'Projectile', ->
  DamagableTile = null

  beforeEach ->
    Invalidator.strict = false
  afterEach ->
    Invalidator.strict = true
  before ->
    DamagableTile = Tile.definition()
    DamagableTile.extend(Damageable)

  createTiles = ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new DamagableTile(opt.x,opt.y)).tap ->
          @walkable = false
      f = (opt) ->
        (new DamagableTile(opt.x,opt.y)).tap ->
          @walkable = true
      @loadMatrix([
        [w, w, w, w, w, w, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, f, f, f, f, f, w],
        [w, w, w, w, w, w, w],
      ])

  it 'can damage tiles', ->
    timing = new Timing(false)
    ctn = createTiles()
    projectile = new Projectile({
      origin: ctn.getTile(1,1),
      target: ctn.getTile(3,3),
      propagationType: DamagePropagation.Normal,
      timing:timing
    })
    payload = projectile.deliverPayload()
    assert.instanceOf payload, DamagePropagation

    assert.isBelow ctn.getTile(3,3).health, ctn.getTile(3,3).maxHealth

  it 'damage tiles after some time', ->
    timing = new Timing(false)
    ctn = createTiles()
    projectile = new Projectile({
      origin: ctn.getTile(1,1),
      target: ctn.getTile(3,3),
      propagationType: DamagePropagation.Normal,
      timing:timing
    })
    projectile.launch()

    assert.equal ctn.getTile(3,3).health, ctn.getTile(3,3).maxHealth

    assert.isAbove timing.children.length, 0

    timing.children.slice().forEach (timer)->
      timer.tick()

    assert.equal timing.children.length, 0

    assert.isBelow ctn.getTile(3,3).health, ctn.getTile(3,3).maxHealth

