Element = require('spark-starter').Element
LineOfSight = require('./LineOfSight')
Direction = require('parallelio-tiles').Direction

class DamagePropagation extends Element
  constructor: (options)->
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
  getDamaged: ->
    unless @_damaged?
      @_damaged = []
      tiles = @getInitialTiles()
      for tile in tiles
        if tile.damageable and dmg = @initialDamage(tile, tiles.length)
          @_damaged.push(dmg)
      if @extendedDamage?
        added = @_damaged
        while (added = @extend(added)).length
          @_damaged = added.concat(@_damaged)
    @_damaged
  inDamaged: (target, damaged)->
    for damage in damaged
      return damage if damage.target == target
    false
  extend: (damaged) ->
    ctn = @getTileContainer()
    added = []
    for damage in damaged
      local = []
      if damage.target.x?
        for dir in Direction.adjacents
          tile = ctn.getTile(damage.target.x + dir.x, damage.target.y + dir.y)
          if tile? and tile.damageable and !@inDamaged(tile, added.concat(@_damaged))
            local.push tile
      for target in local
        if dmg = @extendedDamage(target, damage, local.length)
          added.push(dmg)
    added
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

class DamagePropagation.Explosive extends DamagePropagation
  getDamaged: ->
    @_damaged = []
    ctn = @getTileContainer()
    shards = Math.pow(@range+1, 2)
    shardPower = @power / shards
    inside = @tile.health <= @modifyDamage(@tile,shardPower)
    shardPower *= 4 if inside
    for shard in [0..shards]
      angle = Math.random()*Math.PI*2
      dist = @range * Math.random()
      target = {x: @tile.x + dist * Math.cos(angle), y: @tile.y + dist * Math.sin(angle)}
      vertex = new LineOfSight(ctn, @tile.x+0.5, @tile.y+0.5, target.x+0.5, target.y+0.5)
      vertex.traversableCallback = (tile)->
        !inside or !tile.getSolid()
      if vertex.getEndPoint().tile?
        target = vertex.getEndPoint().tile
        @_damaged.push({
          target: target
          power: shardPower
          damage: @modifyDamage(target,shardPower)
        })
    @_damaged