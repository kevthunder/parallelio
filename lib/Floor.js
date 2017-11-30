(function(definition){var Floor=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Floor.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Floor;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Floor=Floor;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Floor=Floor;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tile = dependencies.hasOwnProperty("Tile") ? dependencies.Tile : require('parallelio-tiles').Tile;
var Floor, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Floor = (function(superClass) {
  extend(Floor, superClass);

  function Floor() {
    return Floor.__super__.constructor.apply(this, arguments);
  }

  Floor.properties({
    walkable: {
      composed: true
    },
    transparent: {
      composed: true
    }
  });

  return Floor;

})(Tile);

return(Floor);});