Element = require('spark-starter').Element

class Map extends Element
  @properties
    locations:
      collection: 
        closest: (x,y)->
          min = null
          minDist = null
          @forEach (location)->
            dist = location.dist(x,y)
            if !min? or minDist > dist
              min = location
              minDist = dist
          min
        closests: (x,y)->
          dists = @map (location)-> {dist:location.dist(x,y), location:location}
          dists.sort (a, b)->
            a.dist - b.dist
          @copy(dists.map (dist)-> dist.location)
