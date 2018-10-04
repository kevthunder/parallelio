Element = require('spark-starter').Element
LineOfSight = require('./LineOfSight')
Direction = require('parallelio-tiles').Direction

class DamagePropagation extends Element
  constructor: (options)->
    super()
    @setProperties(options)
  @properties
    tile:
      default: null
    power:
      default: 10
    range:
      default: 1
    type:
      default: null
  getTileContainer: ->
    @tile.container
  apply: ->
    for damage in @getDamaged()
      damage.target.damage(damage.damage)
  getInitialTiles: ->
    ctn = @getTileContainer()
    ctn.inRange(@tile, @range)
  getInitialDamages: ->
    damages = []
    tiles = @getInitialTiles()
    for tile in tiles
      if tile.damageable and dmg = @initialDamage(tile, tiles.length)
        damages.push(dmg)
    damages
  getDamaged: ->
    unless @_damaged?
      added = null
      while added = @step(added)
        true
    @_damaged
  step: (added)->
    if added?
      if @extendedDamage?
        added = @extend(added)
        @_damaged = added.concat(@_damaged)
        added.length > 0 && added
    else
      @_damaged = @getInitialDamages()
  inDamaged: (target, damaged)->
    for damage, index in damaged
      return index if damage.target == target
    false
  extend: (damaged) ->
    ctn = @getTileContainer()
    added = []
    for damage in damaged
      local = []
      if damage.target.x?
        for dir in Direction.adjacents
          tile = ctn.getTile(damage.target.x + dir.x, damage.target.y + dir.y)
          if tile? and tile.damageable and @inDamaged(tile, @_damaged) == false
            local.push tile
      for target in local
        if dmg = @extendedDamage(target, damage, local.length)
          if (existing = @inDamaged(target, added)) == false
            added.push(dmg)
          else
            added[existing] = @mergeDamage(added[existing], dmg)
    added
  mergeDamage:(d1, d2)->
    {
      target: d1.target
      power:  d1.power  + d2.power
      damage: d1.damage + d2.damage
    }
  modifyDamage:(target,power)->
    if typeof target.modifyDamage == 'function'
      Math.floor(target.modifyDamage(power, @type))
    else
      Math.floor(power)
    
class DamagePropagation.Normal extends DamagePropagation
  initialDamage: (target, nb) ->
    dmg = @modifyDamage(target, @power)
    if dmg > 0
      {
        target: target
        power: @power
        damage: dmg
      }
class DamagePropagation.Thermic extends DamagePropagation
  extendedDamage: (target, last, nb) ->
    power = (last.damage-1) / 2 / nb * Math.min(1,last.target.health/last.target.maxHealth*5)
    dmg = @modifyDamage(target, power)
    if dmg > 0
      {
        target: target
        power: power
        damage: dmg
      }
  initialDamage: (target, nb) ->
    power = @power / nb
    dmg = @modifyDamage(target, power)
    if dmg > 0
      {
        target: target
        power: power
        damage: dmg
      }

class DamagePropagation.Kinetic extends DamagePropagation
  extendedDamage: (target, last, nb) ->
    power = (last.power-last.damage)*Math.min(1,last.target.health/last.target.maxHealth*2)-1
    dmg = @modifyDamage(target, power)
    if dmg > 0
      {
        target: target
        power: power
        damage: dmg
      }
  initialDamage: (target, nb) ->
    dmg = @modifyDamage(target, @power)
    if dmg > 0
      {
        target: target
        power: @power
        damage: dmg
      }
  modifyDamage:(target,power)->
    if typeof target.modifyDamage == 'function'
      Math.floor(target.modifyDamage(power, @type))
    else
      Math.floor(power*0.25)
  mergeDamage:(d1, d2)->
    {
      target: d1.target
      power:  Math.floor((d1.power  + d2.power)  /2)
      damage: Math.floor((d1.damage + d2.damage) /2)
    }

class DamagePropagation.Explosive extends DamagePropagation
  @properties
    rng:
      default: Math.random
    traversableCallback:
      default: (tile)->
        !(typeof tile.getSolid == 'function' && tile.getSolid())

  getDamaged: ->
    @_damaged = []
    shards = Math.pow(@range+1, 2)
    shardPower = @power / shards
    inside = @tile.health <= @modifyDamage(@tile,shardPower)
    shardPower *= 4 if inside
    for shard in [0..shards]
      angle = @rng()*Math.PI*2
      target = @getTileHitByShard(inside,angle)
      if target?
        @_damaged.push({
          target: target
          power: shardPower
          damage: @modifyDamage(target,shardPower)
        })
    @_damaged

  getTileHitByShard: (inside,angle)->
    ctn = @getTileContainer()
    dist = @range * @rng()
    target = {x: @tile.x + 0.5 + dist * Math.cos(angle), y: @tile.y + 0.5 + dist * Math.sin(angle)}
    if inside
      vertex = new LineOfSight(ctn, @tile.x+0.5, @tile.y+0.5, target.x, target.y)
      vertex.traversableCallback = (tile)=>
        !inside or (tile? and @traversableCallback(tile))
      vertex.getEndPoint().tile
    else
      ctn.getTile Math.floor(target.x), Math.floor(target.y)