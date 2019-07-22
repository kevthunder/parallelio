(function() {
  var assert;

  assert = require('chai').assert;

  describe('concatened file check', function() {
    var Parallelio;
    Parallelio = null;
    before(function() {
      return Parallelio = require('../dist/parallelio.js');
    });
    it('contains Element', function() {
      return assert.isFunction(Parallelio.Element);
    });
    it('contains Star', function() {
      return assert.isFunction(Parallelio.Star);
    });
    it('contains PathFinder', function() {
      return assert.isFunction(Parallelio.PathFinder);
    });
    it('contains Timing', function() {
      return assert.isFunction(Parallelio.Timing);
    });
    it('contains TargetAction', function() {
      return assert.isFunction(Parallelio.actions.TargetAction);
    });
    it('contains Tile', function() {
      assert.isFunction(Parallelio.tiles.Tile);
      assert.isFunction(Parallelio.tiles.Tiled);
      return assert.isFunction(Parallelio.tiles.Direction);
    });
    it('contains Wire', function() {
      assert.isFunction(Parallelio.wiring.Wire);
      return assert.isFunction(Parallelio.wiring.Connected);
    });
    return it('contains strings', function() {
      assert.isObject(Parallelio.strings);
      return assert.isArray(Parallelio.strings.greekAlphabet);
    });
  });

}).call(this);
