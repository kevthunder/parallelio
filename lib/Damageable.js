(function(definition){Damageable=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);Damageable.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Damageable;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.Damageable=Damageable;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Damageable=Damageable;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Damageable, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Damageable = (function(superClass) {
  extend(Damageable, superClass);

  function Damageable() {
    return Damageable.__super__.constructor.apply(this, arguments);
  }

  Damageable.properties({
    damageable: {
      "default": true
    },
    maxHealth: {
      "default": 1000
    },
    health: {
      "default": 1000,
      change: function() {
        if (this.health === 0 && typeof this.destroy === 'function') {
          return this.destroy();
        }
      }
    }
  });

  Damageable.prototype.damage = function(val) {
    return this.health = Math.max(0, this.health - val);
  };

  return Damageable;

})(Element);

return(Damageable);});