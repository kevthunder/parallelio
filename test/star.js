(function() {
  var Star, assert;

  assert = require('chai').assert;

  Star = require('../lib/Star');

  describe('Star', function() {
    return it('can calcul the distance to a point', function() {
      var a, b;
      a = new Star(0, 0);
      b = new Star(3, 4);
      return assert.equal(a.dist(b.x, b.y), 5);
    });
  });

  describe('Star.link', function() {
    it('can get the length', function() {
      var a, ab, b;
      a = new Star(0, 0);
      b = new Star(3, 4);
      ab = a.linkTo(b);
      return assert.equal(ab.getLength(), 5);
    });
    it('can find if it intersect another path - true', function() {
      var a, ab, b, c, cd, d;
      a = new Star(0, 0);
      b = new Star(4, 4);
      ab = a.linkTo(b);
      c = new Star(4, 0);
      d = new Star(0, 4);
      cd = c.linkTo(d);
      return assert.isTrue(ab.intersectLink(cd));
    });
    it('can find if it intersect another path - false', function() {
      var a, ab, b, c, cd, d;
      a = new Star(0, 0);
      b = new Star(4, 4);
      ab = a.linkTo(b);
      c = new Star(2, 2);
      d = new Star(0, 4);
      cd = c.linkTo(d);
      return assert.isFalse(ab.intersectLink(cd));
    });
    it('can find if it is close to a point - true', function() {
      var a, ab, b, c;
      a = new Star(0, 0);
      b = new Star(4, 4);
      ab = a.linkTo(b);
      c = new Star(3, 2);
      return assert.isTrue(ab.closeToPoint(c.x, c.y, 1));
    });
    return it('can find if it is close to a point - false', function() {
      var a, ab, b, c;
      a = new Star(0, 0);
      b = new Star(8, 8);
      ab = a.linkTo(b);
      c = new Star(6, 4);
      return assert.isFalse(ab.closeToPoint(c.x, c.y, 1));
    });
  });

}).call(this);
