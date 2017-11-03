var Floor, Tile, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Tile = ((ref = this.Parallelio) != null ? ref.Tile : void 0) || require('parallelio-tiles').Tile;

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

if (typeof Parallelio !== "undefined" && Parallelio !== null) {
  Parallelio.Tile.Floor = Floor;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = Floor;
} else {
  if (this.Parallelio == null) {
    this.Parallelio = {};
  }
  this.Parallelio.Tile.Floor = Floor;
}
