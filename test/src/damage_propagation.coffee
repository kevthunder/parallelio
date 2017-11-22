assert = require('chai').assert
DamagePropagation = require('../lib/DamagePropagation')
Damageable = require('../lib/Damageable')
Tile = require('parallelio-tiles').Tile
TileContainer = require('parallelio-tiles').TileContainer
alea = require('seedrandom/lib/alea')


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

  tileDamageMatrix = (ctn, startAt)->
    tiles = ctn.allTiles()
    unless startAt?
      startAt = tiles[0].maxHealth
    damages = for x in [0..6]
          for y in [0..6]
            0
    ctn.allTiles().forEach (tile)->
      damages[tile.x][tile.y] = startAt - tile.health
    damages

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

      expect = [ 
        [ 0, 0,   0,   0,   0, 0, 0 ],
        [ 0, 0,   0,   0,   0, 0, 0 ],
        [ 0, 0,   0, 100,   0, 0, 0 ],
        [ 0, 0, 100, 100, 100, 0, 0 ],
        [ 0, 0,   0, 100,   0, 0, 0 ],
        [ 0, 0,   0,   0,   0, 0, 0 ],
        [ 0, 0,   0,   0,   0, 0, 0 ]
      ]

      damages = tileDamageMatrix(ctn)
      assert.deepEqual damages, expect

  describe 'Thermic', ->
    it 'dammage step by step', ->
      damageMatrix = (damages)->
        matrix = for x in [0..6]
            for y in [0..6]
              0
        damages.forEach (damage)->
          matrix[damage.target.x][damage.target.y] = damage.damage
        matrix

      ctn = createTiles()
      target = ctn.getTile(3,3)
      dm = new DamagePropagation.Thermic({tile:target,power:500,range:2})

      expect = [ 
        [ 0, 0,   0,   0,   0, 0, 0 ],
        [ 0, 0,   0,   0,   0, 0, 0 ],
        [ 0, 0,   0, 100,   0, 0, 0 ],
        [ 0, 0, 100, 100, 100, 0, 0 ],
        [ 0, 0,   0, 100,   0, 0, 0 ],
        [ 0, 0,   0,   0,   0, 0, 0 ],
        [ 0, 0,   0,   0,   0, 0, 0 ]
      ]
      damages = dm.step()
      assert.equal damages.length, 5
      assert.deepEqual damageMatrix(damages), expect

      expect = [ 
        [ 0,  0,  0,  0,  0,  0, 0 ],
        [ 0,  0,  0, 16,  0,  0, 0 ],
        [ 0,  0, 32,  0, 32,  0, 0 ],
        [ 0, 16,  0,  0,  0, 16, 0 ],
        [ 0,  0, 32,  0, 32,  0, 0 ],
        [ 0,  0,  0, 16,  0,  0, 0 ],
        [ 0,  0,  0,  0,  0,  0, 0 ]
      ]
      damages = dm.step(damages)
      assert.equal damages.length, 8
      assert.deepEqual damageMatrix(damages), expect

      expect = [ 
        [ 0, 0, 0, 2, 0, 0, 0 ],
        [ 0, 0, 9, 0, 9, 0, 0 ],
        [ 0, 9, 0, 0, 0, 9, 0 ],
        [ 2, 0, 0, 0, 0, 0, 2 ],
        [ 0, 9, 0, 0, 0, 9, 0 ],
        [ 0, 0, 9, 0, 9, 0, 0 ],
        [ 0, 0, 0, 2, 0, 0, 0 ] 
      ]

      damages = dm.step(damages)
      assert.equal damages.length, 12
      assert.deepEqual damageMatrix(damages), expect

      expect = [ 
        [ 0, 0, 2, 0, 2, 0, 0 ],
        [ 0, 4, 0, 0, 0, 4, 0 ],
        [ 2, 0, 0, 0, 0, 0, 2 ],
        [ 0, 0, 0, 0, 0, 0, 0 ],
        [ 2, 0, 0, 0, 0, 0, 2 ],
        [ 0, 4, 0, 0, 0, 4, 0 ],
        [ 0, 0, 2, 0, 2, 0, 0 ]
      ]

      damages = dm.step(damages)
      assert.equal damages.length, 12
      assert.deepEqual damageMatrix(damages), expect

      damages = dm.step(damages)
      assert.isFalse damages

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

      expect = [ 
        [ 0,  0,   2,   2,   2,  0, 0 ],
        [ 0,  4,   9,  16,   9,  4, 0 ],
        [ 2,  9,  32, 100,  32,  9, 2 ],
        [ 2, 16, 100, 100, 100, 16, 2 ],
        [ 2,  9,  32, 100,  32,  9, 2 ],
        [ 0,  4,   9,  16,   9,  4, 0 ],
        [ 0,  0,   2,   2,   2,  0, 0 ] 
      ]

      damages = tileDamageMatrix(ctn)
      assert.deepEqual damages, expect

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

      expect = [ 
        [ 0, 0,   0,   0,   0, 0, 0 ],
        [ 0, 0,   1,   8,   1, 0, 0 ],
        [ 0, 1,  16, 100,  16, 1, 0 ],
        [ 0, 8, 100, 100, 100, 8, 0 ],
        [ 0, 1,  16, 100,  16, 1, 0 ],
        [ 0, 0,   1,   8,   1, 0, 0 ],
        [ 0, 0,   0,   0,   0, 0, 0 ] 
      ]

      damages = tileDamageMatrix(ctn,startAt)
      assert.deepEqual damages, expect

  describe 'Kinetic', ->
    it 'dammage tile in range plus propagation', ->
      ctn = createTiles()
      target = ctn.getTile(3,3)
      dm = new DamagePropagation.Kinetic({tile:target,power:500,range:2})
      assert.isDefined target.health
      assert.equal target.health, target.maxHealth, 'before'

      assert.equal dm.initialDamage(target, 2).damage, 500/4
      dm.apply()
      assert.equal target.health, target.maxHealth-125, 'center'
      assert.equal ctn.getTile(2,3).health, ctn.getTile(2,3).maxHealth-125, '1 from center'
      assert.equal ctn.getTile(1,3).health, ctn.getTile(1,3).maxHealth-93, '2 from center'
      assert.equal ctn.getTile(0,3).health, ctn.getTile(0,3).maxHealth-70, '3 from center'
      assert.equal ctn.getTile(0,0).health, ctn.getTile(0,0).maxHealth-29, 'corner'

      expect = [ 
        [ 29, 39,  52,  70,  52, 39, 29 ],
        [ 39, 52,  70,  93,  70, 52, 39 ],
        [ 52, 70,  93, 125,  93, 70, 52 ],
        [ 70, 93, 125, 125, 125, 93, 70 ],
        [ 52, 70,  93, 125,  93, 70, 52 ],
        [ 39, 52,  70,  93,  70, 52, 39 ],
        [ 29, 39,  52,  70,  52, 39, 29 ] 
      ]

      damages = tileDamageMatrix(ctn)
      assert.deepEqual damages, expect

    it 'propagete less in heavy dammaged tiles', ->
      ctn = createTiles()
      startAt = 200
      ctn.allTiles().forEach (tile)->
        tile.health = startAt
      target = ctn.getTile(3,3)
      dm = new DamagePropagation.Kinetic({tile:target,power:500,range:2})
      assert.isDefined target.health
      assert.equal target.health, startAt, 'before'

      dm.apply()
      assert.equal target.health, startAt-125, 'center'
      assert.equal ctn.getTile(2,3).health, startAt-125, '1 from center'
      assert.isAbove ctn.getTile(1,3).health, startAt-93, '2 from center'
      assert.isAbove ctn.getTile(0,3).health, startAt-70, '3 from center'
      assert.isAbove ctn.getTile(0,0).health, startAt-29, 'corner'

      expect = [ 
        [  0,  0,   3,  10,   3,  0,  0 ],
        [  0,  3,  10,  37,  10,  3,  0 ],
        [  3, 10,  37, 125,  37, 10,  3 ],
        [ 10, 37, 125, 125, 125, 37, 10 ],
        [  3, 10,  37, 125,  37, 10,  3 ],
        [  0,  3,  10,  37,  10,  3,  0 ],
        [  0,  0,   3,  10,   3,  0,  0 ] 
      ]

      damages = tileDamageMatrix(ctn,startAt)
      assert.deepEqual damages, expect

  describe 'Explosive', ->
    it 'low dammage outside hull', ->
      ctn = createTiles()
      target = ctn.getTile(3,3)
      dm = new DamagePropagation.Explosive({rng:new alea('seed'),tile:target,power:500,range:6})
      assert.isDefined target.health
      assert.equal target.health, target.maxHealth, 'before'
      dm.apply()

      expect = [ 
        [ 10, 10, 10,  0, 10,  0,  0 ],
        [  0,  0, 10,  0,  0,  0,  0 ],
        [  0, 10, 10, 10,  0,  0,  0 ],
        [ 10, 20,  0, 80, 10,  0, 10 ],
        [  0, 10, 10, 30, 20, 10, 10 ],
        [  0, 10,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0, 10,  0, 10 ]
      ]

      damages = tileDamageMatrix(ctn)
      assert.deepEqual damages, expect

    it 'high dammage inside hull', ->
      ctn = createTiles()
      target = ctn.getTile(3,3)
      target.health = 0
      dm = new DamagePropagation.Explosive({
        rng: new alea('seed'),
        traversableCallback: (tile)->
          tile.walkable
        tile: target,
        power: 500,
        range: 6
      })
      assert.isDefined target.health

      dm.apply()

      expect = [ 
        [  0, 120, 40,   80, 40,  0,   0 ],
        [  0,   0, 40,    0,  0,  0,   0 ],
        [  0,  40, 40,   40,  0,  0,  80 ],
        [ 40,  80,  0, 1000, 40,  0, 160 ],
        [ 80,  40, 40,  120, 80, 40,  80 ],
        [  0,  40,  0,    0,  0,  0,  40 ],
        [  0,   0,  80,  80, 80, 40,   0 ]
      ]

      damages = tileDamageMatrix(ctn)
      assert.deepEqual damages, expect



