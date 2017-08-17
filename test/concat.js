(function() {
  var Parallelio, assert;

  assert = require('chai').assert;

  Parallelio = require('../dist/parallelio.min.js');

  describe('concatened file check', function() {
    it('contains Element', function() {
      return assert.isFunction(Parallelio.Element);
    });
    it('contains Star', function() {
      return assert.isFunction(Parallelio.Star);
    });
    it('contains PathFinder', function() {
      return assert.isFunction(Parallelio.PathFinder);
    });
    return it('contains strings', function() {
      assert.isObject(Parallelio.strings);
      return assert.isArray(Parallelio.strings.greekAlphabet);
    });
  });

}).call(this);
