(function(definition){var AttackAction=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);AttackAction.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=AttackAction;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.AttackAction=AttackAction;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.AttackAction=AttackAction;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : require('parallelio-pathfinder');
var PathWalk = dependencies.hasOwnProperty("PathWalk") ? dependencies.PathWalk : require('../PathWalk');
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
      this.pathFinder.calcul();
      return this.pathFinder.solution != null;
    }

    execute() {
      if (this.actor.walk != null) {
        this.actor.walk.end();
      }
      if (this.bestUsableWeapon != null) {
        return this.bestUsableWeapon.useOn(this.target);
      } else {
        this.actor.walk = new PathWalk(this.actor, this.pathFinder);
        this.actor.walk.on('endReached', () => {
          if (this.isReady) {
            return this.start();
          }
        });
        return this.actor.walk.start();
      }
    }

  };

  AttackAction.properties({
    pathFinder: {
      calcul: function() {
        return new PathFinder(this.actor.tile.container, this.actor.tile, this.target, {
          validTile: (tile) => {
            if (typeof this.actor.canGoOnTile === "function") {
              return this.actor.canGoOnTile(tile);
            } else {
              return tile.walkable;
            }
          },
          arrived: (tile) => {
            return this.canUseWeaponAt(tile);
          }
        });
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