(function(definition){var AutomaticDoor=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);AutomaticDoor.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=AutomaticDoor;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.AutomaticDoor=AutomaticDoor;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.AutomaticDoor=AutomaticDoor;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : require('./Door');
var Character = dependencies.hasOwnProperty("Character") ? dependencies.Character : require('./Character');
var AutomaticDoor, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
AutomaticDoor = (function(superClass) {
  extend(AutomaticDoor, superClass);

  function AutomaticDoor() {
    return AutomaticDoor.__super__.constructor.apply(this, arguments);
  }

  AutomaticDoor.properties({
    open: {
      calcul: function(invalidate) {
        return !invalidate.prop('locked') && this.isActivatorPresent(invalidate);
      }
    },
    locked: {
      "default": false
    },
    unlocked: {
      calcul: function(invalidate) {
        return !invalidate.prop('locked');
      }
    }
  });

  AutomaticDoor.prototype.updateTileMembers = function(old) {
    var ref, ref1, ref2, ref3;
    if (old != null) {
      if ((ref = old.walkableMembers) != null) {
        ref.removeRef('unlocked', this);
      }
      if ((ref1 = old.transparentMembers) != null) {
        ref1.removeRef('open', this);
      }
    }
    if (this.tile) {
      if ((ref2 = this.tile.walkableMembers) != null) {
        ref2.addPropertyRef('unlocked', this);
      }
      return (ref3 = this.tile.transparentMembers) != null ? ref3.addPropertyRef('open', this) : void 0;
    }
  };

  AutomaticDoor.prototype.init = function() {
    AutomaticDoor.__super__.init.call(this);
    return this.open;
  };

  AutomaticDoor.prototype.isActivatorPresent = function(invalidate) {
    return this.getReactiveTiles().some((function(_this) {
      return function(tile) {
        var children;
        children = invalidate ? invalidate.prop('children', tile) : tile.children;
        return children.some(function(child) {
          return _this.canBeActivatedBy(child);
        });
      };
    })(this));
  };

  AutomaticDoor.prototype.canBeActivatedBy = function(elem) {
    return elem instanceof Character;
  };

  AutomaticDoor.prototype.getReactiveTiles = function() {
    if (this.direction === Door.directions.horizontal) {
      return [this.tile, this.tile.getRelativeTile(0, 1), this.tile.getRelativeTile(0, -1)].filter(function(t) {
        return t != null;
      });
    } else {
      return [this.tile, this.tile.getRelativeTile(1, 0), this.tile.getRelativeTile(-1, 0)].filter(function(t) {
        return t != null;
      });
    }
  };

  return AutomaticDoor;

})(Door);

return(AutomaticDoor);});