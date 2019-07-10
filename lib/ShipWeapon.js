(function(definition){var ShipWeapon=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);ShipWeapon.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ShipWeapon;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.ShipWeapon=ShipWeapon;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.ShipWeapon=ShipWeapon;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : require('parallelio-timing');
var Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : require('./Damageable');
var Projectile = dependencies.hasOwnProperty("Projectile") ? dependencies.Projectile : require('./Projectile');
var ShipWeapon;
ShipWeapon = (function() {
  class ShipWeapon extends Tiled {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    fire() {
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
    }

    recharge() {
      this.charging = true;
      return this.chargeTimeout = this.timing.setTimeout(() => {
        this.charging = false;
        return this.recharged();
      }, this.rechargeTime);
    }

    recharged() {
      this.charged = true;
      if (this.autoFire) {
        return this.fire();
      }
    }

  };

  ShipWeapon.extend(Damageable);

  ShipWeapon.properties({
    rechargeTime: {
      default: 1000
    },
    power: {
      default: 10
    },
    blastRange: {
      default: 1
    },
    propagationType: {
      default: null
    },
    projectileSpeed: {
      default: 10
    },
    target: {
      default: null,
      change: function() {
        if (this.autoFire) {
          return this.fire();
        }
      }
    },
    charged: {
      default: true
    },
    charging: {
      default: true
    },
    enabled: {
      default: true
    },
    autoFire: {
      default: true
    },
    criticalHealth: {
      default: 0.3
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

  return ShipWeapon;

}).call(this);

return(ShipWeapon);});