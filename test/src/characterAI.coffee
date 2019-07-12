assert = require('chai').assert
CharacterAI = require('../lib/CharacterAI')
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
      [w, w, w, w, w, w, w],
      [w, f, f, f, f, f, w],
      [w, w, f, w, w, w, w],
      [w, f, f, f, f, f, w],
      [w, f, f, f, f, f, w],
      [w, f, f, f, f, w, w],
      [w, w, w, w, w, w, f],
    ])

describe 'CharacterAI', ->
  it 'can find the next tile to explore', ->
    ctn = createStage()
    char = (new Character()).tap ->
      @tile = ctn.getTile(4,3)
    ai = new CharacterAI(char)
    ai.updateVisionMemory()
    assert.equal ai.getClosestUnexplored().getFinalTile(), ctn.getTile(2,2)

  it 'update vision when tile change', ->
    ctn = createStage()
    char = (new Character()).tap ->
      @tile = ctn.getTile(6,6)
    ai = new CharacterAI(char)
    ai.tileWatcher.bind()
    assert.isNull ai.getClosestUnexplored()
    char.tile = ctn.getTile(4,3)
    assert.equal ai.getClosestUnexplored().getFinalTile(), ctn.getTile(2,2)

  it 'can remember past seen tile', ->
    ctn = createStage()
    char = (new Character()).tap ->
      @tile = ctn.getTile(4,3)
    ai = new CharacterAI(char)
    ai.tileWatcher.bind()
    char.tile = ctn.getTile(6,6)
    assert.equal ai.getClosestUnexplored().getFinalTile(), ctn.getTile(2,2)