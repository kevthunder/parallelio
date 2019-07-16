(function(definition){var Map=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Map.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Map;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Map=Map;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Map=Map;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Map;
Map = (function() {
  class Map extends Element {};

  Map.properties({
    locations: {
      collection: {
        closest: function(x, y) {
          var min, minDist;
          min = null;
          minDist = null;
          this.forEach(function(location) {
            var dist;
            dist = location.dist(x, y);
            if ((min == null) || minDist > dist) {
              min = location;
              return minDist = dist;
            }
          });
          return min;
        },
        closests: function(x, y) {
          var dists;
          dists = this.map(function(location) {
            return {
              dist: location.dist(x, y),
              location: location
            };
          });
          dists.sort(function(a, b) {
            return a.dist - b.dist;
          });
          return this.copy(dists.map(function(dist) {
            return dist.location;
          }));
        }
      }
    }
  });

  return Map;

}).call(this);

return(Map);});