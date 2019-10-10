assert = require('chai').assert
StarSystem = require('../lib/StarSystem')
Collection = require('spark-starter').Collection

describe 'StarSystem', ->
  it 'can calcul the distance to a point', ->
    a = new StarSystem({x:0,y:0})
    b = new StarSystem({x:3,y:4})
    assert.equal a.dist(b.x, b.y), 5
    
describe 'StarSystem.collenctionFn', ->
  it 'can get closest point', ->
    coll = Collection.newSubClass(StarSystem.collenctionFn,[
      a = new StarSystem({x:2,y:4})
      b = new StarSystem({x:0,y:0})
      c = new StarSystem({x:3,y:4})
    ])
    d = new StarSystem({x:1,y:1})
    assert.equal coll.closest(d.x,d.y), b
  it 'can get closests points', ->
    coll = Collection.newSubClass(StarSystem.collenctionFn,[
      a = new StarSystem({x:2,y:4})
      b = new StarSystem({x:0,y:0})
      c = new StarSystem({x:3,y:4})
    ])
    d = new StarSystem({x:1,y:1})
    closests = coll.closests(d.x,d.y)
    assert.equal closests.get(0), b
    assert.equal closests.get(1), a
    assert.equal closests.get(2), c
    
describe 'StarSystem.Link', ->
  it 'can get the length', ->
    a = new StarSystem({x:0,y:0})
    b = new StarSystem({x:3,y:4})
    ab = a.linkTo(b)
    assert.equal ab.getLength(), 5
  it 'can find if it intersect another path - true', ->
    a = new StarSystem({x:0,y:0})
    b = new StarSystem({x:4,y:4})
    ab = a.linkTo(b)
    c = new StarSystem({x:4,y:0})
    d = new StarSystem({x:0,y:4})
    cd = c.linkTo(d)
    assert.isTrue ab.intersectLink(cd)
  it 'can find if it intersect another path - false', ->
    a = new StarSystem({x:0,y:0})
    b = new StarSystem({x:4,y:4})
    ab = a.linkTo(b)
    c = new StarSystem({x:2,y:2})
    d = new StarSystem({x:0,y:4})
    cd = c.linkTo(d)
    assert.isFalse ab.intersectLink(cd)
  it 'can find if it is close to a point - true', ->
    a = new StarSystem({x:0,y:0})
    b = new StarSystem({x:4,y:4})
    ab = a.linkTo(b)
    c = new StarSystem({x:3,y:2})
    assert.isTrue ab.closeToPoint(c.x,c.y,1)
  it 'can find if it is close to a point - false', ->
    a = new StarSystem({x:0,y:0})
    b = new StarSystem({x:8,y:8})
    ab = a.linkTo(b)
    c = new StarSystem({x:6,y:4})
    assert.isFalse ab.closeToPoint(c.x,c.y,1)