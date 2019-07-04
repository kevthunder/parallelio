(function(definition){var PersonalWeapon=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);PersonalWeapon.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PersonalWeapon;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.PersonalWeapon=PersonalWeapon;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.PersonalWeapon=PersonalWeapon;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : require('./LineOfSight');
var PersonalWeapon;
PersonalWeapon = (function() {
  class PersonalWeapon extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    canUseOn(target) {
      return this.canUseFrom(this.user.tile, target);
    }

    canUseFrom(tile, target) {
      if (this.range === 1) {
        return this.inMeleeRange(tile, target);
      } else {
        return this.inRange(tile, target) && this.hasLineOfSight(tile, target);
      }
    }

    inRange(tile, target) {
      var ref;
      return ((ref = tile.dist(target.tile)) != null ? ref.length : void 0) <= this.range;
    }

    inMeleeRange(tile, target) {
      return Math.abs(this.target.tile.x - this.actor.tile.x) + Math.abs(this.target.tile.y - this.actor.tile.y) === 1;
    }

    hasLineOfSight(tile, target) {
      var los;
      los = new LineOfSight(target.tile.container, tile.x + 0.5, tile.y + 0.5, target.tile.x + 0.5, target.tile.y + 0.5);
      los.traversableCallback = function(tile) {
        return tile.walkable;
      };
      return los.getSuccess();
    }

    useOn(target) {
      return target.damage(this.power);
    }

  };

  PersonalWeapon.properties({
    rechargeTime: {
      default: 1000
    },
    power: {
      default: 10
    },
    dps: {
      calcul: function(invalidator) {
        return invalidator.prop('power') / invalidator.prop('rechargeTime') * 1000;
      }
    },
    range: {
      default: 10
    },
    user: {
      default: null
    }
  });

  return PersonalWeapon;

}).call(this);

return(PersonalWeapon);});