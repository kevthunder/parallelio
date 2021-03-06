
const assert = require('chai').assert
const StarSystem = require('../lib/StarSystem')
const Collection = require('spark-starter').Collection

describe('StarSystem', function () {
  it('can calcul the distance to a point', function () {
    var a, b
    a = new StarSystem({
      x: 0,
      y: 0
    })
    b = new StarSystem({
      x: 3,
      y: 4
    })
    return assert.equal(a.dist(b.x, b.y), 5)
  })
})

describe('StarSystem.collenctionFn', function () {
  it('can get closest point', function () {
    const expected = new StarSystem({
      x: 0,
      y: 0
    })
    const coll = Collection.newSubClass(StarSystem.collenctionFn, [
      new StarSystem({
        x: 2,
        y: 4
      }),
      expected,
      new StarSystem({
        x: 3,
        y: 4
      })
    ])
    const origin = new StarSystem({
      x: 1,
      y: 1
    })
    return assert.equal(coll.closest(origin.x, origin.y), expected)
  })
  it('can get closests points', function () {
    var a, b, c, closests, coll, d
    coll = Collection.newSubClass(StarSystem.collenctionFn, [
      a = new StarSystem({
        x: 2,
        y: 4
      }),
      b = new StarSystem({
        x: 0,
        y: 0
      }),
      c = new StarSystem({
        x: 3,
        y: 4
      })
    ])
    d = new StarSystem({
      x: 1,
      y: 1
    })
    closests = coll.closests(d.x, d.y)
    assert.equal(closests.get(0), b)
    assert.equal(closests.get(1), a)
    return assert.equal(closests.get(2), c)
  })
})

describe('StarSystem.Link', function () {
  it('can get the length', function () {
    var a, ab, b
    a = new StarSystem({
      x: 0,
      y: 0
    })
    b = new StarSystem({
      x: 3,
      y: 4
    })
    ab = a.linkTo(b)
    return assert.equal(ab.getLength(), 5)
  })
  it('can find if it intersect another path - true', function () {
    var a, ab, b, c, cd, d
    a = new StarSystem({
      x: 0,
      y: 0
    })
    b = new StarSystem({
      x: 4,
      y: 4
    })
    ab = a.linkTo(b)
    c = new StarSystem({
      x: 4,
      y: 0
    })
    d = new StarSystem({
      x: 0,
      y: 4
    })
    cd = c.linkTo(d)
    return assert.isTrue(ab.intersectLink(cd))
  })
  it('can find if it intersect another path - false', function () {
    var a, ab, b, c, cd, d
    a = new StarSystem({
      x: 0,
      y: 0
    })
    b = new StarSystem({
      x: 4,
      y: 4
    })
    ab = a.linkTo(b)
    c = new StarSystem({
      x: 2,
      y: 2
    })
    d = new StarSystem({
      x: 0,
      y: 4
    })
    cd = c.linkTo(d)
    return assert.isFalse(ab.intersectLink(cd))
  })
  it('can find if it is close to a point - true', function () {
    var a, ab, b, c
    a = new StarSystem({
      x: 0,
      y: 0
    })
    b = new StarSystem({
      x: 4,
      y: 4
    })
    ab = a.linkTo(b)
    c = new StarSystem({
      x: 3,
      y: 2
    })
    return assert.isTrue(ab.closeToPoint(c.x, c.y, 1))
  })
  it('can find if it is close to a point - false', function () {
    var a, ab, b, c
    a = new StarSystem({
      x: 0,
      y: 0
    })
    b = new StarSystem({
      x: 8,
      y: 8
    })
    ab = a.linkTo(b)
    c = new StarSystem({
      x: 6,
      y: 4
    })
    return assert.isFalse(ab.closeToPoint(c.x, c.y, 1))
  })
})
