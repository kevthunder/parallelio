Element = require('spark-starter').Element

module.exports = class Map extends Element
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
    boundaries:
      calcul:->
        boundaries = {top:null,left:null,bottom:null,right:null}
        @locations.forEach (location)=>
          @_addToBondaries(location, boundaries)
        boundaries
      output:(val)->
        Object.assign({},val)

  _addToBondaries: (location, boundaries)->
    if !boundaries.top? || location.y < boundaries.top
      boundaries.top = location.y
    if !boundaries.left? || location.x < boundaries.left
      boundaries.left = location.x
    if !boundaries.bottom? || location.y > boundaries.bottom
      boundaries.bottom = location.y
    if !boundaries.right? || location.x > boundaries.right
      boundaries.right = location.x
