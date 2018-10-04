(function(definition){var Floor=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Floor.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Floor;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Floor=Floor;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Floor=Floor;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tile = dependencies.hasOwnProperty("Tile") ? dependencies.Tile : require('parallelio-tiles').Tile;
var Floor;
Floor = (function() {
  class Floor extends Tile {};

  Floor.properties({
    walkable: {
      composed: true
    },
    transparent: {
      composed: true
    }
  });

  return Floor;

}).call(this);

return(Floor);});