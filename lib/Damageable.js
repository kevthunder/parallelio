(function(definition){var Damageable=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Damageable.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Damageable;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Damageable=Damageable;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Damageable=Damageable;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Damageable;
Damageable = (function() {
  class Damageable extends Element {
    damage(val) {
      return this.health = Math.max(0, this.health - val);
    }

    whenNoHealth() {}

  };

  Damageable.properties({
    damageable: {
      default: true
    },
    maxHealth: {
      default: 1000
    },
    health: {
      default: 1000,
      change: function() {
        if (this.health === 0) {
          return this.whenNoHealth();
        }
      }
    }
  });

  return Damageable;

}).call(this);

return(Damageable);});