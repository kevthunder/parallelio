assert = require('chai').assert
Star = require('../lib/Star')
Collection = require('spark-starter/lib/Collection')

describe 'Star', ->
  it 'can calcul the distance to a point', ->
    a = new Star(0,0)
    b = new Star(3,4)
    assert.equal a.dist(b.x, b.y), 5
    
describe 'Star.collenctionFn', ->
  it 'can get closest point', ->
    coll = Collection.newSubClass(Star.collenctionFn,[
      a = new Star(2,4)
      b = new Star(0,0)
      c = new Star(3,4)
    ])
    d = new Star(1,1)
    assert.equal coll.closest(d.x,d.y), b
  it 'can get closests points', ->
    coll = Collection.newSubClass(Star.collenctionFn,[
      a = new Star(2,4)
      b = new Star(0,0)
      c = new Star(3,4)
    ])
    d = new Star(1,1)
    closests = coll.closests(d.x,d.y)
    assert.equal closests.get(0), b
    assert.equal closests.get(1), a
    assert.equal closests.get(2), c
    
describe 'Star.Link', ->
  it 'can get the length', ->
    a = new Star(0,0)
    b = new Star(3,4)
    ab = a.linkTo(b)
    assert.equal ab.getLength(), 5
  it 'can find if it intersect another path - true', ->
    a = new Star(0,0)
    b = new Star(4,4)
    ab = a.linkTo(b)
    c = new Star(4,0)
    d = new Star(0,4)
    cd = c.linkTo(d)
    assert.isTrue ab.intersectLink(cd)
  it 'can find if it intersect another path - false', ->
    a = new Star(0,0)
    b = new Star(4,4)
    ab = a.linkTo(b)
    c = new Star(2,2)
    d = new Star(0,4)
    cd = c.linkTo(d)
    assert.isFalse ab.intersectLink(cd)
  it 'can find if it is close to a point - true', ->
    a = new Star(0,0)
    b = new Star(4,4)
    ab = a.linkTo(b)
    c = new Star(3,2)
    assert.isTrue ab.closeToPoint(c.x,c.y,1)
  it 'can find if it is close to a point - false', ->
    a = new Star(0,0)
    b = new Star(8,8)
    ab = a.linkTo(b)
    c = new Star(6,4)
    assert.isFalse ab.closeToPoint(c.x,c.y,1)