Element = require('spark-starter').Element
TileContainer = require('parallelio-tiles').TileContainer
Tile = require('parallelio-tiles').Tile

class RoomGenerator extends Element
  constructor: (options) ->
    @setProperties(options)
    @directions = [
      {x:1, y:0}
      {x:-1, y:0}
      {x:0, y:1}
      {x:0, y:-1}
    ]
    @corners = [
      {x:1, y:1}
      {x:-1, y:-1}
      {x:-1, y:1}
      {x:1, y:-1}
    ]
    @allDirections = @directions.concat(@corners)
  @properties
    rng:
      default: Math.random
    maxVolume:
      default: 25
    minVolume:
      default: 50
    width:
      default: 30
    height:
      default: 15
    tiles:
      calcul: ->
        tiles = new TileContainer()
        for x in [0..@width]
          for y in [0..@height]
            tiles.addTile(new Tile(x,y))
        tiles
    floorFactory: 
      default: (opt) ->
        new Tile(opt.x,opt.y)
    wallFactory: 
      default: null
    doorFactory: 
      calcul: ->
        @floorFactory
  init: ->
    @finalTiles = null
    @rooms = []
    @free = @tiles.allTiles().filter (tile) =>
      for direction in @allDirections
        next = @tiles.getTile(tile.x + direction.x, tile.y + direction.y)
        unless next?
          return false
      true
  calcul: ->
    @init()
    i = 0
    while @step() or @newRoom()
      i++
    @createDoors()
    @rooms
    @makeFinalTiles()
  makeFinalTiles: ->
    @finalTiles = @tiles.allTiles().map (tile) =>
      tile.factory?({x:tile.x,y:tile.y})
    .filter (tile) =>
      tile?
  getTiles:->
    unless @finalTiles?
      @calcul()
    @finalTiles
  newRoom: ->
    if @free.length
      @volume = Math.floor(@rng() * (@maxVolume-@minVolume)) + @minVolume
      @room = new RoomGenerator.Room()
  randomDirections: ->
    o = @directions.slice()
    j = undefined
    x = undefined
    i = o.length
    while i
      j = Math.floor(@rng() * i)
      x = o[--i]
      o[i] = o[j]
      o[j] = x
    o
  step: ->
    if @room
      if @free.length and @room.tiles.length < @volume - 1
        if @room.tiles.length
          tries = @randomDirections()
          success = false
          while tries.length and !success
            success = @expand(@room, tries.pop(), @volume)
          unless success
            @roomDone()
          success
        else
          @allocateTile(@randomFreeTile(), @room)
          true
      else
        @roomDone()
        false
  roomDone: ->
    @rooms.push(@room)
    @allocateWalls(@room)
    @room = null
  expand: (room, direction, max = 0) ->
    success = false
    for tile in room.tiles
      if max == 0 or room.tiles.length < max
        if next = @tileOffsetIsFree(tile, direction)
          @allocateTile(next, room)
          success = true
        if (second = @tileOffsetIsFree(tile, direction, 2)) and !@tileOffsetIsFree(tile, direction, 3)
          @allocateTile(second, room)
    success
  allocateWalls: (room) ->
    for tile in room.tiles
      for direction in @allDirections
        next = @tiles.getTile(tile.x + direction.x, tile.y + direction.y)
        if next? and next.room != room
          unless direction in @corners
            otherSide = @tiles.getTile(tile.x + direction.x * 2, tile.y + direction.y * 2)
            nextRoom = if otherSide?.room? then otherSide.room else null
            room.addWall(next, nextRoom)
            nextRoom.addWall(next, room) if nextRoom?
          next.factory = @wallFactory
          @allocateTile(next)
  createDoors: ->
    for room in @rooms
      for walls in room.wallsByRooms()
        if walls.room? and room.doorsForRoom(walls.room) < 1
          door = walls.tiles[Math.floor(@rng()*walls.tiles.length)]
          door.factory = @doorFactory
          room.addDoor(door, walls.room)
          walls.room.addDoor(door, room)
  allocateTile: (tile, room = null) ->
    if room?
      room.addTile(tile)
      tile.factory = @floorFactory
    index = @free.indexOf(tile)
    if index > -1
      @free.splice(index, 1)
  tileOffsetIsFree: (tile, direction, multiply = 1) ->
    @tileIsFree(tile.x + direction.x * multiply, tile.y + direction.y * multiply)
  tileIsFree: (x,y) ->
    tile = @tiles.getTile(x,y)
    if tile? and tile in @free
      tile
    else
      false
  randomFreeTile: -> 
    @free[Math.floor(@rng() * @free.length)]


class RoomGenerator.Room
  constructor: () ->
    @tiles = []
    @walls = []
    @doors = []
  addTile: (tile) ->
    @tiles.push(tile)
    tile.room = this
  containsWall: (tile) ->
    for wall in @walls
      if wall.tile == tile
        return wall
    false
  addWall: (tile, nextRoom) ->
    existing = @containsWall(tile)
    if existing
      existing.nextRoom = nextRoom
    else
      @walls.push({tile:tile, nextRoom:nextRoom})
  wallsByRooms: ->
    rooms = []
    res = []
    for wall in @walls
      pos = rooms.indexOf(wall.nextRoom)
      if pos == -1
        pos = rooms.length
        rooms.push(wall.nextRoom)
        res.push({room:wall.nextRoom,tiles:[]})
      res[pos].tiles.push(wall.tile)
    res
  addDoor: (tile, nextRoom) ->
    @doors.push({tile:tile, nextRoom:nextRoom})
  doorsForRoom: (room) ->
    res = []
    for door in @doors
      if door.nextRoom == room
        res.push(door.tile)
    res