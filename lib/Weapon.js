(function(definition){Weapon=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);Weapon.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Weapon;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.Weapon=Weapon;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Weapon=Weapon;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var Weapon, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Weapon = (function(superClass) {
  extend(Weapon, superClass);

  function Weapon(options) {
    this.setProperties(options);
  }

  Weapon.properties({
    rechargeTime: {
      "default": 1000
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
    projectileSpeed: {
      "default": 10
    },
    target: {
      "default": null,
      change: function() {
        if (this.target && this.enabled && this.charged) {
          return this.fire();
        }
      }
    },
    charged: {
      "default": true
    },
    enabled: {
      "default": true
    }
  });

  Weapon.prototype.fire = function() {
    var projectile;
    projectile = new Projectile({
      origin: this,
      target: this.target,
      power: this.power,
      blastRange: this.blastRange,
      propagationType: this.propagationType,
      speed: this.projectileSpeed
    });
    this.charged = false;
    this.recharge();
    return projectile;
  };

  Weapon.prototype.recharge = function() {
    return this.chargeTimeout = setTimeout((function(_this) {
      return function() {
        return recharged();
      };
    })(this), rechargeTime);
  };

  Weapon.prototype.recharged = function() {
    this.charged = true;
    if (this.target && this.enabled) {
      return this.fire();
    }
  };

  return Weapon;

})(Tiled);

return(Weapon);});