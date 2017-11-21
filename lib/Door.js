(function(definition){Door=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);Door.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Door;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.Door=Door;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Door=Door;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : require('parallelio-tiles').Tiled;
var Door, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
Door = (function(superClass) {
  extend(Door, superClass);

  function Door(direction) {
    this.direction = direction != null ? direction : Door.directions.horizontal;
    Door.__super__.constructor.call(this);
  }

  Door.properties({
    tile: {
      change: function(old, overrided) {
        var ref, ref1, ref2, ref3;
        overrided();
        if (old != null) {
          if ((ref = old.walkableMembers) != null) {
            ref.removeRef('open', this);
          }
          if ((ref1 = old.transparentMembers) != null) {
            ref1.removeRef('open', this);
          }
        }
        if (this.tile) {
          if ((ref2 = this.tile.walkableMembers) != null) {
            ref2.addPropertyRef('open', this);
          }
          return (ref3 = this.tile.transparentMembers) != null ? ref3.addPropertyRef('open', this) : void 0;
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

return(Door);});