(function(definition){var Obstacle=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Obstacle.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Obstacle;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Obstacle=Obstacle;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Obstacle=Obstacle;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var Obstacle;
Obstacle = (function() {
  class Obstacle extends Tiled {
    updateWalkables(old) {
      var ref, ref1;
      if (old != null) {
        if ((ref = old.walkableMembers) != null) {
          ref.removeRef('walkable', this);
        }
      }
      if (this.tile) {
        return (ref1 = this.tile.walkableMembers) != null ? ref1.setValueRef(false, 'walkable', this) : void 0;
      }
    }

  };

  Obstacle.properties({
    tile: {
      change: function(old, overrided) {
        overrided(old);
        return this.updateWalkables(old);
      }
    }
  });

  return Obstacle;

}).call(this);

return(Obstacle);});