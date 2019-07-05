assert = require('chai').assert
VisionCalculator = require('../lib/VisionCalculator')
Tile = require('parallelio-tiles').Tile
TileContainer = require('parallelio-tiles').TileContainer

describe 'VisionCalculator', ->
  it 'can caculate vision', ->
    ctn = new TileContainer()
    ctn.tap ->
      w = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = false
      f = (opt) ->
        (new Tile(opt.x,opt.y)).tap ->
          @transparent = true
      @loadMatrix([
        [f, w, f, f, f],
        [f, w, f, f, f],
        [f, f, f, f, f],
        [f, w, f, f, f],
        [f, w, f, f, f],
      ])
    caculator = new VisionCalculator(ctn.getTile(0,2))
    caculator.calcul()
    expected = [ 
        [ 0.25, 0.5, 0.25, 0,   0,   0,    0,   ],
        [ 0.5,  1,   0.5,  0,   0,   0.25, 0.25 ],
        [ 0.5,  1,   0.75, 0.5, 0.5, 0.75, 0.5, ],
        [ 0.5,  1,   1,    1,   1,   1,    0.5, ],
        [ 0.5,  1,   0.75, 0.5, 0.5, 0.75, 0.5, ],
        [ 0.5,  1,   0.5,  0,   0,   0.25, 0.25 ],
        [ 0.25, 0.5, 0.25, 0,   0,   0,    0,   ]
     ]
    console.log(caculator.toMap())
    assert.deepEqual caculator.toMap().map, expected
