var Door, Tiled, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Tiled = ((ref = this.Parallelio) != null ? ref.Tiled : void 0) || require('parallelio-tiles').Tiled;

Door = (function(superClass) {
  extend(Door, superClass);

  function Door(direction) {
    this.direction = direction != null ? direction : Door.directions.horizontal;
  }

  Door.properties({
    tile: {
      change: function(old, overrided) {
        var ref1, ref2, ref3, ref4;
        overrided();
        if (old != null) {
          if ((ref1 = old.walkableMembers) != null) {
            ref1.removePropertyRef('open', this);
          }
          if ((ref2 = old.transparentMembers) != null) {
            ref2.removePropertyRef('open', this);
          }
        }
        if (this.tile) {
          if ((ref3 = this.tile.walkableMembers) != null) {
            ref3.addPropertyRef('open', this);
          }
          return (ref4 = this.tile.transparentMembers) != null ? ref4.addPropertyRef('open', this) : void 0;
        }
      }
    },
    open: {
      "default": false
    },
    direction: {}
  });

  Door.directions = {
    horizontal: 'horizontal',
    vertical: 'vertical'
  };

  return Door;

})(Tiled);

if (typeof Parallelio !== "undefined" && Parallelio !== null) {
  Parallelio.Door = Door;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = Door;
} else {
  if (this.Parallelio == null) {
    this.Parallelio = {};
  }
  this.Parallelio.Door = Door;
}
