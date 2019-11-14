
const assert = require('chai').assert
const View = require('../lib/View')
const Game = require('../lib/Game')

describe('View', function () {
  it('get some default bounds when added to a Game', function () {
    var game, view
    game = new Game()
    view = new View()
    game.add(view)
    assert.isNotNull(view.bounds)
    assert.equal(view.game, game)
    assert.equal(game.mainView, view)
    assert.equal(view.bounds.top, 0)
    assert.equal(view.bounds.left, 0)
    assert.equal(view.bounds.bottom, 1)
    return assert.equal(view.bounds.right, 1)
  })
  it('does not replace an existing mainView', function () {
    var game, view
    game = new Game()
    view = new View()
    assert.isNotNull(game.mainView)
    game.add(view)
    assert.isNotNull(view.bounds)
    assert.equal(view.game, game)
    assert.notEqual(game.mainView, view)
    return assert.equal(view.grid, game.mainView.grid)
  })
})
