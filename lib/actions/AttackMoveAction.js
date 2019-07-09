(function(definition){var AttackMoveAction=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);AttackMoveAction.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=AttackMoveAction;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.AttackMoveAction=AttackMoveAction;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.AttackMoveAction=AttackMoveAction;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : require('./WalkAction');
var AttackAction = dependencies.hasOwnProperty("AttackAction") ? dependencies.AttackAction : require('./AttackAction');
var TargetAction = dependencies.hasOwnProperty("TargetAction") ? dependencies.TargetAction : require('./TargetAction');
var PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : require('parallelio-pathfinder');
var LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : require('../LineOfSight');
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('spark-starter').PropertyWatcher;
var EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : require('spark-starter').EventBind;
var AttackMoveAction;
AttackMoveAction = (function() {
  class AttackMoveAction extends TargetAction {
    isEnemy(elem) {
      var ref;
      return (ref = this.actor.owner) != null ? typeof ref.isEnemy === "function" ? ref.isEnemy(elem) : void 0 : void 0;
    }

    validTarget() {
      return this.walkAction.validTarget();
    }

    execute() {
      this.walkAction.on('finished', () => {
        return this.finished();
      });
      this.interruptBinder.bindTo(this.walkAction);
      this.tileWatcher.bind();
      return this.walkAction.execute();
    }

  };

  AttackMoveAction.properties({
    walkAction: {
      calcul: function() {
        var walkAction;
        walkAction = new WalkAction({
          actor: this.actor,
          target: this.target,
          parent: this.parent
        });
        return walkAction;
      }
    },
    enemySpotted: {
      calcul: function() {
        this.path = new PathFinder(this.actor.tile.container, this.actor.tile, false, {
          validTile: (tile) => {
            return tile.transparent && (new LineOfSight(this.actor.tile.container, this.actor.tile.x, this.actor.tile.y, tile.x, tile.y)).getSuccess();
          },
          arrived: (tile) => {
            return tile.children.find((c) => {
              return this.isEnemy(c);
            });
          },
          efficiency: (tile) => {}
        });
        this.path.calcul();
        return this.path.solution;
      }
    },
    tileWatcher: {
      calcul: function() {
        return new PropertyWatcher({
          callback: () => {
            this.invalidateEnemySpotted();
            if (this.enemySpotted) {
              this.attackAction = new AttackAction({
                actor: this.actor,
                target: this.enemySpotted
              });
              this.attackAction.on('finished', () => {
                if (this.isReady()) {
                  return this.start();
                }
              });
              this.interruptBinder.bindTo(this.attackAction);
              this.invalidateWalkAction();
              return this.walkAction.execute();
            }
          },
          property: this.actor.getPropertyInstance('tile')
        });
      },
      destroy: true
    },
    interruptBinder: {
      calcul: function() {
        return new EventBind('interrupted', null, () => {
          return this.interrupt();
        });
      },
      destroy: true
    }
  });

  return AttackMoveAction;

}).call(this);

return(AttackMoveAction);});