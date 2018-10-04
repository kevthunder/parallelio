assert = require('chai').assert
RoomGenerator = require('../lib/RoomGenerator')
alea = require('seedrandom/lib/alea');

describe 'RoomGenerator', ->
  it 'create rooms', ->
    gen = new RoomGenerator({rng:new alea('seed'),width:12,height:12,minVolume:10,maxVolume:15})
    debugger
    tiles = gen.getTiles()
    map = for x in [0..gen.width]
            for y in [0..gen.height]
              0
    tiles.forEach (tile)->
      map[tile.x][tile.y] = 1
    expected =  [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                  [ 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0 ],
                  [ 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0 ],
                  [ 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0 ],
                  [ 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0 ],
                  [ 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0 ],
                  [ 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],
                  [ 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0 ],
                  [ 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0 ],
                  [ 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0 ],
                  [ 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0 ],
                  [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 ],
                  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ]

    assert.deepEqual(map,expected)