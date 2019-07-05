(function(definition){var AttackAction=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);AttackAction.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=AttackAction;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.AttackAction=AttackAction;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.AttackAction=AttackAction;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : require('./WalkAction');
var TargetAction = dependencies.hasOwnProperty("TargetAction") ? dependencies.TargetAction : require('./TargetAction');
var AttackAction;
AttackAction = (function() {
  class AttackAction extends TargetAction {
    validTarget() {
      return this.targetIsAttackable() && (this.canUseWeapon() || this.canWalkToTarget());
    }

    targetIsAttackable() {
      return this.target.damageable && this.target.health >= 0;
    }

    canMelee() {
      return Math.abs(this.target.tile.x - this.actor.tile.x) + Math.abs(this.target.tile.y - this.actor.tile.y) === 1;
    }

    canUseWeapon() {
      return this.bestUsableWeapon != null;
    }

    canUseWeaponAt(tile) {
      var ref;
      return ((ref = this.actor.weapons) != null ? ref.length : void 0) && this.actor.weapons.find((weapon) => {
        return weapon.canUseFrom(tile, this.target);
      });
    }

    canWalkToTarget() {
      return this.walkAction.isReady();
    }

    execute() {
      if (this.actor.walk != null) {
        this.actor.walk.interrupt();
      }
      if (this.bestUsableWeapon != null) {
        this.bestUsableWeapon.useOn(this.target);
        return this.finish();
      } else {
        this.walkAction.on('finished', () => {
          if (this.isReady()) {
            return this.start();
          }
        });
        this.walkAction.on('interrupted', () => {
          return this.interrupt();
        });
        return this.walkAction.execute();
      }
    }

  };

  AttackAction.properties({
    walkAction: {
      calcul: function() {
        var walkAction;
        walkAction = new WalkAction({
          actor: this.actor,
          target: this.target,
          parent: this.parent
        });
        walkAction.pathFinder.arrivedCallback = (tile) => {
          return this.canUseWeaponAt(tile);
        };
        return walkAction;
      }
    },
    bestUsableWeapon: {
      calcul: function(invalidator) {
        var ref, usableWeapons;
        invalidator.propPath('actor.tile');
        if ((ref = this.actor.weapons) != null ? ref.length : void 0) {
          usableWeapons = this.actor.weapons.filter((weapon) => {
            return weapon.canUseOn(this.target);
          });
          usableWeapons.sort((a, b) => {
            return b.dps - a.dps;
          });
          return usableWeapons[0];
        } else {
          return null;
        }
      }
    }
  });

  return AttackAction;

}).call(this);

return(AttackAction);});