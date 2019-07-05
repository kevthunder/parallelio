(function(definition){var WalkAction=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);WalkAction.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=WalkAction;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.WalkAction=WalkAction;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.WalkAction=WalkAction;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : require('parallelio-pathfinder');
var PathWalk = dependencies.hasOwnProperty("PathWalk") ? dependencies.PathWalk : require('../PathWalk');
var TargetAction = dependencies.hasOwnProperty("TargetAction") ? dependencies.TargetAction : require('./TargetAction');
var WalkAction;
WalkAction = (function() {
  class WalkAction extends TargetAction {
    execute() {
      if (this.actor.walk != null) {
        this.actor.walk.interrupt();
      }
      this.actor.walk = new PathWalk(this.actor, this.pathFinder);
      this.actor.walk.on('finished', () => {
        return this.finish();
      });
      this.actor.walk.on('interrupted', () => {
        return this.interrupt();
      });
      return this.actor.walk.start();
    }

    validTarget() {
      this.pathFinder.calcul();
      return this.pathFinder.solution != null;
    }

  };

  WalkAction.properties({
    pathFinder: {
      calcul: function() {
        return new PathFinder(this.actor.tile.container, this.actor.tile, this.target, {
          validTile: (tile) => {
            if (typeof this.actor.canGoOnTile === "function") {
              return this.actor.canGoOnTile(tile);
            } else {
              return tile.walkable;
            }
          }
        });
      }
    }
  });

  return WalkAction;

}).call(this);

return(WalkAction);});