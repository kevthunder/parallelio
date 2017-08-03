var Element, Star, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Element = ((ref = this.Spark) != null ? ref.Element : void 0) || require('spark-starter').Element;

Star = (function(superClass) {
  extend(Star, superClass);

  function Star(x5, y5) {
    this.x = x5;
    this.y = y5;
    this.init();
  }

  Star.properties({
    x: {},
    y: {},
    links: {
      collection: {
        findStar: function(star) {
          return this.find(function(link) {
            return link.star2 === star || link.star1 === star;
          });
        }
      }
    }
  });

  Star.prototype.init = function() {};

  Star.prototype.linkTo = function(star) {
    if (!this.links.findStar(star)) {
      return this.addLink(new this.constructor.Link(this, star));
    }
  };

  Star.prototype.addLink = function(link) {
    this.links.add(link);
    link.otherStar(this).links.add(link);
    return link;
  };

  Star.prototype.dist = function(x, y) {
    var xDist, yDist;
    xDist = this.x - x;
    yDist = this.y - y;
    return Math.sqrt((xDist * xDist) + (yDist * yDist));
  };

  return Star;

})(Element);

Star.Link = (function(superClass) {
  extend(Link, superClass);

  function Link(star1, star2) {
    this.star1 = star1;
    this.star2 = star2;
  }

  Link.prototype.remove = function() {
    this.star1.links.remove(this);
    return this.star2.links.remove(this);
  };

  Link.prototype.otherStar = function(star) {
    if (star === this.star1) {
      return this.star2;
    } else {
      return this.star1;
    }
  };

  Link.prototype.getLength = function() {
    return this.star1.dist(this.star2.x, this.star2.y);
  };

  Link.prototype.inBoundaryBox = function(x, y, padding) {
    var x1, x2, y1, y2;
    if (padding == null) {
      padding = 0;
    }
    x1 = Math.min(this.star1.x, this.star2.x) - padding;
    y1 = Math.min(this.star1.y, this.star2.y) - padding;
    x2 = Math.max(this.star1.x, this.star2.x) + padding;
    y2 = Math.max(this.star1.y, this.star2.y) + padding;
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  };

  Link.prototype.closeToPoint = function(x, y, minDist) {
    var a, abDist, abcAngle, abxAngle, acDist, acxAngle, b, c, cdDist, xAbDist, xAcDist, yAbDist, yAcDist;
    if (!this.inBoundaryBox(x, y, minDist)) {
      return false;
    }
    a = this.star1;
    b = this.star2;
    c = {
      "x": x,
      "y": y
    };
    xAbDist = b.x - a.x;
    yAbDist = b.y - a.y;
    abDist = Math.sqrt((xAbDist * xAbDist) + (yAbDist * yAbDist));
    abxAngle = Math.atan(yAbDist / xAbDist);
    xAcDist = c.x - a.x;
    yAcDist = c.y - a.y;
    acDist = Math.sqrt((xAcDist * xAcDist) + (yAcDist * yAcDist));
    acxAngle = Math.atan(yAcDist / xAcDist);
    abcAngle = abxAngle - acxAngle;
    cdDist = Math.abs(Math.sin(abcAngle) * acDist);
    return cdDist <= minDist;
  };

  Link.prototype.intersectLink = function(link) {
    var s, s1_x, s1_y, s2_x, s2_y, t, x1, x2, x3, x4, y1, y2, y3, y4;
    x1 = this.star1.x;
    y1 = this.star1.y;
    x2 = this.star2.x;
    y2 = this.star2.y;
    x3 = link.star1.x;
    y3 = link.star1.y;
    x4 = link.star2.x;
    y4 = link.star2.y;
    s1_x = x2 - x1;
    s1_y = y2 - y1;
    s2_x = x4 - x3;
    s2_y = y4 - y3;
    s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);
    return s > 0 && s < 1 && t > 0 && t < 1;
  };

  return Link;

})(Element);

if (typeof Parallelio !== "undefined" && Parallelio !== null) {
  Parallelio.Star = Star;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = Star;
} else {
  if (this.Parallelio == null) {
    this.Parallelio = {};
  }
  this.Parallelio.Star = Star;
}
