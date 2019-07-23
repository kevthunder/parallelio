(function() {
  var Collection, Star, assert;

  assert = require('chai').assert;

  Star = require('../lib/Star');

  Collection = require('spark-starter/lib/Collection');

  describe('Star', function() {
    return it('can calcul the distance to a point', function() {
      var a, b;
      a = new Star({
        x: 0,
        y: 0
      });
      b = new Star({
        x: 3,
        y: 4
      });
      return assert.equal(a.dist(b.x, b.y), 5);
    });
  });

  describe('Star.collenctionFn', function() {
    it('can get closest point', function() {
      var a, b, c, coll, d;
      coll = Collection.newSubClass(Star.collenctionFn, [
        a = new Star({
          x: 2,
          y: 4
        }),
        b = new Star({
          x: 0,
          y: 0
        }),
        c = new Star({
          x: 3,
          y: 4
        })
      ]);
      d = new Star({
        x: 1,
        y: 1
      });
      return assert.equal(coll.closest(d.x, d.y), b);
    });
    return it('can get closests points', function() {
      var a, b, c, closests, coll, d;
      coll = Collection.newSubClass(Star.collenctionFn, [
        a = new Star({
          x: 2,
          y: 4
        }),
        b = new Star({
          x: 0,
          y: 0
        }),
        c = new Star({
          x: 3,
          y: 4
        })
      ]);
      d = new Star({
        x: 1,
        y: 1
      });
      closests = coll.closests(d.x, d.y);
      assert.equal(closests.get(0), b);
      assert.equal(closests.get(1), a);
      return assert.equal(closests.get(2), c);
    });
  });

  describe('Star.Link', function() {
    it('can get the length', function() {
      var a, ab, b;
      a = new Star({
        x: 0,
        y: 0
      });
      b = new Star({
        x: 3,
        y: 4
      });
      ab = a.linkTo(b);
      return assert.equal(ab.getLength(), 5);
    });
    it('can find if it intersect another path - true', function() {
      var a, ab, b, c, cd, d;
      a = new Star({
        x: 0,
        y: 0
      });
      b = new Star({
        x: 4,
        y: 4
      });
      ab = a.linkTo(b);
      c = new Star({
        x: 4,
        y: 0
      });
      d = new Star({
        x: 0,
        y: 4
      });
      cd = c.linkTo(d);
      return assert.isTrue(ab.intersectLink(cd));
    });
    it('can find if it intersect another path - false', function() {
      var a, ab, b, c, cd, d;
      a = new Star({
        x: 0,
        y: 0
      });
      b = new Star({
        x: 4,
        y: 4
      });
      ab = a.linkTo(b);
      c = new Star({
        x: 2,
        y: 2
      });
      d = new Star({
        x: 0,
        y: 4
      });
      cd = c.linkTo(d);
      return assert.isFalse(ab.intersectLink(cd));
    });
    it('can find if it is close to a point - true', function() {
      var a, ab, b, c;
      a = new Star({
        x: 0,
        y: 0
      });
      b = new Star({
        x: 4,
        y: 4
      });
      ab = a.linkTo(b);
      c = new Star({
        x: 3,
        y: 2
      });
      return assert.isTrue(ab.closeToPoint(c.x, c.y, 1));
    });
    return it('can find if it is close to a point - false', function() {
      var a, ab, b, c;
      a = new Star({
        x: 0,
        y: 0
      });
      b = new Star({
        x: 8,
        y: 8
      });
      ab = a.linkTo(b);
      c = new Star({
        x: 6,
        y: 4
      });
      return assert.isFalse(ab.closeToPoint(c.x, c.y, 1));
    });
  });

}).call(this);
