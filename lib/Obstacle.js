var Obstacle, Tiled;

Tiled = require('parallelio-tiles').Tiled;

module.exports = Obstacle = (function() {
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
      change: function(val, old, overrided) {
        overrided(old);
        return this.updateWalkables(old);
      }
    }
  });

  return Obstacle;

}).call(this);

//# sourceMappingURL=maps/Obstacle.js.map
