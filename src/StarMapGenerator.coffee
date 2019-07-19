Element = require('spark-starter').Element
Map = require('./Map')
Star = require('./Star')

module.exports = class StarMapGenerator extends Element
  constructor: (options)->
    super()
    @opt = Object.assign({},@defOpt,options)
  defOpt: {
    nbStars: 20
    minX: 0
    maxX: 500
    minY: 0
    maxY: 500
    minStarDist: 10
    minLinkDist: 10
    linksByStars: 3
    linkTries: 3
    mapClass: Map
    starClass: Star
    linkClass: Star.Link
    rng: Math.random
  }
  generate: ->
    @map = new @opt.mapClass()
    @stars = @map.locations.copy()
    @links = []
    @createStars(@opt.nbStars)
    @makeLinks()
    @map
  createStars: (nb)->
    for i in [0...nb]
      @createStar()
  createStar: ->
    j = 0
    loop
      pos = 
        x: Math.floor(@opt.rng() * (@opt.maxX - @opt.minX) + @opt.minX)
        y: Math.floor(@opt.rng() * (@opt.maxY - @opt.minY) + @opt.minY)
      break unless j < 10 and @stars.find((star)=> star.dist(pos.x,pos.y) <= @opt.minStarDist)
      j++
    unless j >= 10
      @createStarAtPos(pos.x,pos.y)
  createStarAtPos: (x,y)->
    star = new @opt.starClass(x,y)
    @map.locations.push(star)
    @stars.push(star)
    star
  makeLinks: ->
    @stars.forEach (star)=>
      @makeLinksFrom(star)
  makeLinksFrom: (star)->
    tries = @opt.linkTries
    needed = @opt.linksByStars - star.links.count()
    if needed > 0
      closests = @stars.filter(
        (star2)=> star2 != star and !star.links.findStar(star2)
      ).closests(star.x,star.y)
      if closests.count() > 0 
        loop
          close = closests.shift()
          link = @createLink(star,close)
          if @validateLink(link)
            @links.push(link)
            star.addLink(link)
            needed -= 1
          else
            tries -= 1
          break unless needed > 0 and tries > 0 and closests.count() > 0
  createLink: (star1,star2)->
    new @opt.linkClass(star1,star2)
  validateLink: (link)->
    !@stars.find((star)=> 
      star != link.star1 and 
      star != link.star2 and 
      link.closeToPoint(star.x,star.y,@opt.minLinkDist)
    ) and
    !@links.find((link2)=> 
      link2.intersectLink(link)
    ) 


  



        