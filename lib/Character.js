(function(definition){var Character=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Character.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Character;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Character=Character;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Character=Character;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : require('parallelio-pathfinder');
var PathWalk = dependencies.hasOwnProperty("PathWalk") ? dependencies.PathWalk : require('./PathWalk');
var Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : require('./Damageable');
var Character, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Character = (function(superClass) {
  extend(Character, superClass);

  Character.extend(Damageable);

  function Character(name) {
    this.name = name;
    Character.__super__.constructor.call(this);
  }

  Character.prototype.walkTo = function(tile) {
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
  };

  return Character;

})(Tiled);

return(Character);});