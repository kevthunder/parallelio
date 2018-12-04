(function(definition){var Character=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Character.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Character;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Character=Character;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Character=Character;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : require('parallelio-pathfinder');
var PathWalk = dependencies.hasOwnProperty("PathWalk") ? dependencies.PathWalk : require('./PathWalk');
var Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : require('./Damageable');
var TargetAction = dependencies.hasOwnProperty("TargetAction") ? dependencies.TargetAction : require('./actions/TargetAction');
var Character;
Character = (function() {
  class Character extends Tiled {
    constructor(name) {
      super();
      this.name = name;
    }

    setDefaults() {
      if (!this.tile && (this.game.mainTileContainer != null)) {
        return this.putOnRandomTile(this.game.mainTileContainer.tiles);
      }
    }

    canGoOnTile(tile) {
      return tile.walkable !== false;
    }

    walkTo(tile) {
      var action;
      action = new this.constructor.WalkAction({
        actor: this,
        target: tile
      });
      action.execute();
      return action;
    }

    isSelectableBy(player) {
      return true;
    }

  };

  Character.extend(Damageable);

  Character.properties({
    game: {
      change: function(old) {
        if (this.game) {
          return this.setDefaults();
        }
      }
    },
    offsetX: {
      default: 0.5
    },
    offsetY: {
      default: 0.5
    },
    defaultAction: {
      calcul: function() {
        return new this.constructor.WalkAction({
          actor: this
        });
      }
    }
  });

  return Character;

}).call(this);

Character.WalkAction = (function() {
  class WalkAction extends TargetAction {
    execute() {
      if (this.actor.walk != null) {
        this.actor.walk.end();
      }
      this.actor.walk = new PathWalk(this.actor, this.pathFinder, {
        timing: game.timing
      });
      return this.actor.walk.start();
    }

    validTarget() {
      //todo: this will be slow for invalid targets
      this.pathFinder.calcul();
      return this.pathFinder.solution != null;
    }

  };

  WalkAction.properties({
    pathFinder: {
      calcul: function() {
        return new PathFinder(this.actor.tile.container, this.actor.tile, this.target, {
          validTile: function(tile) {
            return tile.walkable;
          }
        });
      }
    }
  });

  return WalkAction;

}).call(this);

return(Character);});