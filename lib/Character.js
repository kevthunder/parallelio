(function(definition){var Character=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Character.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Character;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Character=Character;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Character=Character;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : require('parallelio-pathfinder');
var PathWalk = dependencies.hasOwnProperty("PathWalk") ? dependencies.PathWalk : require('./PathWalk');
var Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : require('./Damageable');
var Character;
Character = (function() {
  class Character extends Tiled {
    constructor(name) {
      super();
      this.name = name;
    }

    setDefaults() {
      var candidates;
      if (!this.tile && (this.game.mainTileContainer != null)) {
        candidates = this.game.mainTileContainer.tiles.filter(function(tile) {
          return tile.walkable !== false;
        });
        return this.tile = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    walkTo(tile) {
      var path;
      if (this.walk != null) {
        this.walk.end();
      }
      path = new PathFinder(this.tile.container, this.tile, tile, {
        validTile: function(tile) {
          return tile.walkable;
        }
      });
      this.walk = new PathWalk(this, path);
      return this.walk.start();
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
    }
  });

  return Character;

}).call(this);

return(Character);});