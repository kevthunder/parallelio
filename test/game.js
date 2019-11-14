
const assert = require('chai').assert
const View = require('../lib/View')
const Game = require('../lib/Game')
const Timing = require('parallelio-timing')

describe('Game', function () {
  it('has some default Timing', function () {
    var game
    game = new Game()
    return assert.instanceOf(game.timing, Timing)
  })
  it('has some default View', function () {
    var game
    game = new Game()
    return assert.instanceOf(game.mainView, View)
  })
})
