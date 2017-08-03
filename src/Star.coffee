#--- Standalone ---
Element = @Spark?.Element || require('spark-starter').Element
#--- Standalone end ---


class Star extends Element
  constructor: (@x, @y) ->
    @init()
  @properties
    x:{}
    y:{}
    links:
      collection:
        findStar: (star)->
          @find((link)-> link.star2 == star || link.star1 == star)
  init: ->
  linkTo: (star)->
    unless @links.findStar(star)
      @addLink(new Star.Link(this,star))
  addLink: (link)->
    @links.add(link)
    link.otherStar(this).links.add(link)
    link
  dist: (x,y)->
    xDist = @x - x
    yDist = @y - y
    Math.sqrt((xDist*xDist)+(yDist*yDist))

class Star.Link extends Element
  constructor: (@star1, @star2) ->
  remove: ->
    @star1.links.remove(this)
    @star2.links.remove(this)
  otherStar: (star)->
    if star == @star1
      @star2
    else
      @star1
  getLength: ->
    @star1.dist(@star2.x, @star2.y)
  inBoundaryBox: (x, y, padding=0) ->
    x1 = Math.min(@star1.x, @star2.x) - padding
    y1 = Math.min(@star1.y, @star2.y) - padding
    x2 = Math.max(@star1.x, @star2.x) + padding
    y2 = Math.max(@star1.y, @star2.y) + padding
    x >= x1 and x <= x2 and y >= y1 and y <= y2
  closeToPoint: (x, y, minDist)->
    unless @inBoundaryBox(x,y,minDist)
      return false
    a = @star1
    b = @star2
    c = {"x":x, "y":y}
    
    xAbDist = b.x - a.x
    yAbDist = b.y - a.y
    abDist = Math.sqrt((xAbDist*xAbDist)+(yAbDist*yAbDist))
    abxAngle = Math.atan(yAbDist/xAbDist)
    
    xAcDist = c.x - a.x
    yAcDist = c.y - a.y
    acDist = Math.sqrt((xAcDist*xAcDist)+(yAcDist*yAcDist))
    acxAngle = Math.atan(yAcDist/xAcDist)
    
    abcAngle = abxAngle - acxAngle
    cdDist = Math.abs(Math.sin(abcAngle)*acDist)
    cdDist <= minDist
  intersectLink: (link)->
    x1 = @star1.x
    y1 = @star1.y
    x2 = @star2.x
    y2 = @star2.y
    x3 = link.star1.x
    y3 = link.star1.y
    x4 = link.star2.x
    y4 = link.star2.y
    
    s1_x = x2 - x1
    s1_y = y2 - y1
    s2_x = x4 - x3
    s2_y = y4 - y3

    s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y)
    t = ( s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y)
    
    s > 0 and s < 1 and t > 0 and t < 1

if Parallelio?
  Parallelio.Star = Star
#--- Standalone ---
if module?
  module.exports = Star
else
  unless @Parallelio?
    @Parallelio = {}
  @Parallelio.Star = Star
#--- Standalone end ---