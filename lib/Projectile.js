(function(definition){Projectile=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);Projectile.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Projectile;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.Projectile=Projectile;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Projectile=Projectile;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Projectile, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Projectile = (function(superClass) {
  extend(Projectile, superClass);

  function Projectile(options) {
    this.setProperties(options);
  }

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
      "default": 100
    }
  });

  Projectile.prototype.deliverPayload = function() {
    var payload;
    payload = new this.propagationType({
      tile: this.target.tile || this.target,
      power: this.power,
      range: this.blastRange
    });
    payload.apply();
    this.destroy();
    return payload;
  };

  Projectile.prototype.destroy = function() {};

  return Projectile;

})(Element);

return(Projectile);});