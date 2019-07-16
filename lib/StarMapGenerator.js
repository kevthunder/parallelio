(function(definition){var StarMapGenerator=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);StarMapGenerator.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=StarMapGenerator;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.StarMapGenerator=StarMapGenerator;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.StarMapGenerator=StarMapGenerator;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Map = dependencies.hasOwnProperty("Map") ? dependencies.Map : require('./Map');
var Star = dependencies.hasOwnProperty("Star") ? dependencies.Star : require('./Star');
var StarMapGenerator;
StarMapGenerator = (function() {
  class StarMapGenerator extends Element {
    constructor(options) {
      super();
      this.opt = Object.assign({}, this.defOpt, options);
    }

    generate() {
      this.map = new this.opt.mapClass();
      this.stars = this.map.locations.copy();
      this.links = [];
      this.createStars(this.opt.nbStars);
      this.makeLinks();
      return this.map;
    }

    createStars(nb) {
      var i, k, ref, results;
      results = [];
      for (i = k = 0, ref = nb; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        results.push(this.createStar());
      }
      return results;
    }

    createStar() {
      var j, pos;
      j = 0;
      while (true) {
        pos = {
          x: Math.floor(this.opt.rng() * (this.opt.maxX - this.opt.minX) + this.opt.minX),
          y: Math.floor(this.opt.rng() * (this.opt.maxY - this.opt.minY) + this.opt.minY)
        };
        if (!(j < 10 && this.stars.find((star) => {
          return star.dist(pos.x, pos.y) <= this.opt.minStarDist;
        }))) {
          break;
        }
        j++;
      }
      if (!(j >= 10)) {
        return this.createStarAtPos(pos.x, pos.y);
      }
    }

    createStarAtPos(x, y) {
      var star;
      star = new this.opt.starClass(x, y);
      this.map.locations.push(star);
      this.stars.push(star);
      return star;
    }

    makeLinks() {
      return this.stars.forEach((star) => {
        return this.makeLinksFrom(star);
      });
    }

    makeLinksFrom(star) {
      var close, closests, link, needed, results, tries;
      tries = this.opt.linkTries;
      needed = this.opt.linksByStars - star.links.count();
      if (needed > 0) {
        closests = this.stars.filter((star2) => {
          return star2 !== star && !star.links.findStar(star2);
        }).closests(star.x, star.y);
        if (closests.count() > 0) {
          results = [];
          while (true) {
            close = closests.shift();
            link = this.createLink(star, close);
            if (this.validateLink(link)) {
              this.links.push(link);
              star.addLink(link);
              needed -= 1;
            } else {
              tries -= 1;
            }
            if (!(needed > 0 && tries > 0 && closests.count() > 0)) {
              break;
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      }
    }

    createLink(star1, star2) {
      return new this.opt.linkClass(star1, star2);
    }

    validateLink(link) {
      return !this.stars.find((star) => {
        return star !== link.star1 && star !== link.star2 && link.closeToPoint(star.x, star.y, this.opt.minLinkDist);
      }) && !this.links.find((link2) => {
        return link2.intersectLink(link);
      });
    }

  };

  StarMapGenerator.prototype.defOpt = {
    nbStars: 20,
    minX: 0,
    maxX: 500,
    minY: 0,
    maxY: 500,
    minStarDist: 10,
    minLinkDist: 10,
    linksByStars: 3,
    linkTries: 3,
    mapClass: Map,
    starClass: Star,
    linkClass: Star.Link,
    rng: Math.random
  };

  return StarMapGenerator;

}).call(this);

return(StarMapGenerator);});