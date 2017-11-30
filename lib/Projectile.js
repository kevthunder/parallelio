(function(definition){var Projectile=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Projectile.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Projectile;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Projectile=Projectile;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Projectile=Projectile;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : require('./Timing');
var Projectile, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Projectile = (function(superClass) {
  extend(Projectile, superClass);

  function Projectile(options) {
    this.setProperties(options);
    this.init();
  }

  Projectile.prototype.init = function() {};

  Projectile.properties({
    origin: {
      "default": null
    },
    target: {
      "default": null
    },
    power: {
      "default": 10
    },
    blastRange: {
      "default": 1
    },
    propagationType: {
      "default": null
    },
    speed: {
      "default": 10
    },
    pathLength: {
      calcul: function() {
        var dist;
        if ((this.originTile != null) && (this.targetTile != null)) {
          dist = this.originTile.dist(this.targetTile);
          if (dist) {
            return dist.length;
          }
        }
        return 100;
      }
    },
    originTile: {
      calcul: function(invalidator) {
        var origin;
        origin = invalidator.prop('origin');
        if (origin != null) {
          return origin.tile || origin;
        }
      }
    },
    targetTile: {
      calcul: function(invalidator) {
        var target;
        target = invalidator.prop('target');
        if (target != null) {
          return target.tile || target;
        }
      }
    },
    container: {
      calcul: function(invalidate) {
        var originTile, targetTile;
        originTile = invalidate.prop('originTile');
        targetTile = invalidate.prop('targetTile');
        if (originTile.container === targetTile.container) {
          return originTile.container;
        } else if (invalidate.prop('prcPath') > 0.5) {
          return targetTile.container;
        } else {
          return originTile.container;
        }
      }
    },
    x: {
      calcul: function(invalidate) {
        var startPos;
        startPos = invalidate.prop('startPos');
        return (invalidate.prop('targetPos').x - startPos.x) * invalidate.prop('prcPath') + startPos.x;
      }
    },
    y: {
      calcul: function(invalidate) {
        var startPos;
        startPos = invalidate.prop('startPos');
        return (invalidate.prop('targetPos').y - startPos.y) * invalidate.prop('prcPath') + startPos.y;
      }
    },
    startPos: {
      calcul: function(invalidate) {
        var container, dist, offset, originTile;
        originTile = invalidate.prop('originTile');
        container = invalidate.prop('container');
        offset = this.startOffset;
        if (originTile.container !== container) {
          dist = container.dist(originTile.container);
          offset.x += dist.x;
          offset.y += dist.y;
        }
        return {
          x: originTile.x + offset.x,
          y: originTile.y + offset.y
        };
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    targetPos: {
      calcul: function(invalidate) {
        var container, dist, offset, targetTile;
        targetTile = invalidate.prop('targetTile');
        container = invalidate.prop('container');
        offset = this.targetOffset;
        if (targetTile.container !== container) {
          dist = container.dist(targetTile.container);
          offset.x += dist.x;
          offset.y += dist.y;
        }
        return {
          x: targetTile.x + offset.x,
          y: targetTile.y + offset.y
        };
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    startOffset: {
      "default": {
        x: 0.5,
        y: 0.5
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    targetOffset: {
      "default": {
        x: 0.5,
        y: 0.5
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    prcPath: {
      get: function() {
        return this.pathTimeout.getPrc();
      }
    },
    timing: {
      calcul: function() {
        return new Timing();
      }
    },
    moving: {
      "default": false
    }
  });

  Projectile.prototype.launch = function() {
    this.moving = true;
    return this.pathTimeout = this.timing.setTimeout((function(_this) {
      return function() {
        _this.deliverPayload();
        return _this.moving = false;
      };
    })(this), this.pathLength / this.speed * 1000);
  };

  Projectile.prototype.deliverPayload = function() {
    var payload;
    payload = new this.propagationType({
      tile: this.target.tile || this.target,
      power: this.power,
      range: this.blastRange
    });
    payload.apply();
    this.payloadDelivered();
    return payload;
  };

  Projectile.prototype.payloadDelivered = function() {
    return this.destroy();
  };

  Projectile.prototype.destroy = function() {};

  return Projectile;

})(Element);

return(Projectile);});