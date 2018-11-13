assert = require('chai').assert
View = require('../lib/View')
Game = require('../lib/Game')
Timing = require('parallelio-timing')

describe 'Game', ->
  it 'has some default Timing', ->
    game = new Game()
    assert.instanceOf(game.timing, Timing)
    
  it 'has some default View', ->
    game = new Game()
    assert.instanceOf(game.mainView, View)


