assert = require('chai').assert
AttackAction = require('../lib/actions/AttackAction')
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
    f = (opt) ->
      (new Tile(opt.x,opt.y)).tap ->
        @walkable = true
    @loadMatrix([
      [f, f, f, f, f],
      [f, w, f, f, f],
      [f, w, f, f, f],
    ])

describe 'AttackAction', ->
  it 'can attack a target', ->
    ctn = createStage()
    char1 = new Character()
    char1.tap ->
      @tile = ctn.getTile(0,0)
      @weapons = [
        new PersonalWeapon(user: char1)
      ]
    char2 = new Character().tap ->
      @tile = ctn.getTile(2,0)
    action = new AttackAction(actor: char1, target: char2)

    assert.isTrue action.isReady()
    assert.equal char2.health, 1000

    action.execute()

    assert.equal char2.health, 990

    char1.weapons.forEach (w)=> 
      w.destroy()

  it 'can move to attack a target', ->
    ctn = createStage()
    char1 = new Character()
    char1.tap ->
      @tile = ctn.getTile(0,2)
      @weapons = [
        new PersonalWeapon(user: char1)
      ]
    char2 = new Character().tap ->
      @tile = ctn.getTile(4,2)
    action = new AttackAction(actor: char1, target: char2)

    assert.isTrue action.isReady()

    action.execute()

    assert.equal char2.health, 1000
    assert.exists char1.walk

    char1.walk.timing.running = false
    char1.walk.pathTimeout.prc = 1
    char1.walk.finish()

    assert.equal char1.tile.x, 1
    assert.equal char1.tile.y, 0
    assert.equal char2.health, 990

    char1.weapons.forEach (w)=> 
      w.destroy()



