(function(definition){var Weapon=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Weapon.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Weapon;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Weapon=Weapon;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Weapon=Weapon;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : require('parallelio-timing');
var Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : require('./Damageable');
var Projectile = dependencies.hasOwnProperty("Projectile") ? dependencies.Projectile : require('./Projectile');
var Weapon, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Weapon = (function(superClass) {
  extend(Weapon, superClass);

  Weapon.extend(Damageable);

  function Weapon(options) {
    this.setProperties(options);
    Weapon.__super__.constructor.call(this);
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
        if (this.autoFire) {
          return this.fire();
        }
      }
    },
    charged: {
      "default": true
    },
    charging: {
      "default": true
    },
    enabled: {
      "default": true
    },
    autoFire: {
      "default": true
    },
    criticalHealth: {
      "default": 0.3
    },
    canFire: {
      get: function() {
        return this.target && this.enabled && this.charged && this.health / this.maxHealth >= this.criticalHealth;
      }
    },
    timing: {
      calcul: function() {
        return new Timing();
      }
    }
  });

  Weapon.prototype.fire = function() {
    var projectile;
    if (this.canFire) {
      projectile = new Projectile({
        origin: this,
        target: this.target,
        power: this.power,
        blastRange: this.blastRange,
        propagationType: this.propagationType,
        speed: this.projectileSpeed,
        timing: this.timing
      });
      projectile.launch();
      this.charged = false;
      this.recharge();
      return projectile;
    }
  };

  Weapon.prototype.recharge = function() {
    this.charging = true;
    return this.chargeTimeout = this.timing.setTimeout((function(_this) {
      return function() {
        _this.charging = false;
        return _this.recharged();
      };
    })(this), this.rechargeTime);
  };

  Weapon.prototype.recharged = function() {
    this.charged = true;
    if (this.autoFire) {
      return this.fire();
    }
  };

  return Weapon;

})(Tiled);

return(Weapon);});