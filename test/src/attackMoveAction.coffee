assert = require('chai').assert
AttackMoveAction = require('../lib/actions/AttackMoveAction')
Tile = require('parallelio-tiles').Tile
TileContainer = require('parallelio-tiles').TileContainer
Character = require('../lib/Character')
PersonalWeapon = require('../lib/PersonalWeapon')


createStage = ->
  ctn = new TileContainer()
  ctn.tap ->
    w = (opt) ->
      (new Tile(opt.x,opt.y)).tap ->
        @walkable = false
        @transparent = false
    f = (opt) ->
      (new Tile(opt.x,opt.y)).tap ->
        @walkable = true
        @transparent = true
    @loadMatrix([
      [f, f, f, f, f],
      [w, w, f, w, w],
      [f, f, f, f, f],
      [w, w, f, w, w],
      [f, f, f, f, f],
    ])

describe 'AttackMoveAction', ->
  it 'can attack a target if spotted', ->
    ctn = createStage()
    p1 = {isEnemy:(elem)-> elem.owner? and elem.owner != this}
    p2 = {}
    char1 = new Character()
    char1.tap ->
      @tile = ctn.getTile(0,2)
      @weapons = [
        new PersonalWeapon(user: char1)
      ]
      @owner = p1
    char2 = new Character().tap ->
      @tile = ctn.getTile(2,0)
      @owner = p2
    action = new AttackMoveAction(actor: char1, target: ctn.getTile(4,2))

    assert.isTrue action.isReady()
    assert.equal char2.health, 1000

    action.execute()

    char1.walk.pathTimeout.setPrc(0.5)
    char1.walk.pathTimeout.updater.dispatcher.update()

    assert.equal char1.tile.x, 2
    assert.equal char1.tile.y, 2
    assert.isTrue action.enemySpotted
    assert.equal char2.health, 990


