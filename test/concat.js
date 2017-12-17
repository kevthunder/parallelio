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
    return it('contains strings', function() {
      assert.isObject(Parallelio.strings);
      return assert.isArray(Parallelio.strings.greekAlphabet);
    });
  });

}).call(this);
