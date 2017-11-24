(function(definition){Projectile=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);Projectile.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Projectile;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.Projectile=Projectile;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Projectile=Projectile;}}})(function(dependencies){if(dependencies==null){dependencies={};}
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
        var dist, originTile, targetTile;
        if ((this.origin != null) && (this.target != null)) {
          originTile = this.origin.tile || this.origin;
          targetTile = this.target.tile || this.target;
          dist = originTile.dist(targetTile);
          if (dist) {
            return dist.length;
          }
        }
        return 100;
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