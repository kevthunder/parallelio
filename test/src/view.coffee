assert = require('chai').assert
View = require('../lib/View')
Game = require('../lib/Game')

describe 'View', ->
  it 'get some default bounds when added to a Game', ->
    game = new Game()
    view = new View()
    game.add(view)
    assert.isNotNull(view.bounds)
    assert.equal(view.game,game)
    assert.equal(game.mainView,view)
    assert.equal(view.bounds.top,0)
    assert.equal(view.bounds.left,0)
    assert.equal(view.bounds.bottom,1)
    assert.equal(view.bounds.right,1)
    
  it 'does not replace an existing mainView', ->
    game = new Game()
    view = new View()
    game.mainView
    game.add(view)
    assert.isNotNull(view.bounds)
    assert.equal(view.game,game)
    assert.notEqual(game.mainView,view)
    assert.equal(view.grid,game.mainView.grid)


