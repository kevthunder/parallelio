var Character, Damageable, Tiled, WalkAction;

Tiled = require('parallelio-tiles').Tiled;

Damageable = require('./Damageable');

WalkAction = require('./actions/WalkAction');

module.exports = Character = (function() {
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
      return (tile != null ? tile.walkable : void 0) !== false;
    }

    walkTo(tile) {
      var action;
      action = new WalkAction({
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
      change: function(val, old) {
        if (this.game) {
          return this.setDefaults();
        }
      }
    },
    offsetX: {
      composed: true,
      default: 0.5
    },
    offsetY: {
      composed: true,
      default: 0.5
    },
    tile: {
      composed: true
    },
    defaultAction: {
      calcul: function() {
        return new WalkAction({
          actor: this
        });
      }
    },
    providedActions: {
      collection: true,
      calcul: function(invalidator) {
        return invalidator.propPath("tile.providedActions") || [];
      }
    }
  });

  return Character;

}).call(this);

//# sourceMappingURL=maps/Character.js.map
