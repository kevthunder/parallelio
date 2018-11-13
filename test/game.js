(function() {
  var Game, Timing, View, assert;

  assert = require('chai').assert;

  View = require('../lib/View');

  Game = require('../lib/Game');

  Timing = require('parallelio-timing');

  describe('Game', function() {
    it('has some default Timing', function() {
      var game;
      game = new Game();
      return assert.instanceOf(game.timing, Timing);
    });
    return it('has some default View', function() {
      var game;
      game = new Game();
      return assert.instanceOf(game.mainView, View);
    });
  });

}).call(this);
