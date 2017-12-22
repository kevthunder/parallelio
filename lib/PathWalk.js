(function(definition){var PathWalk=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);PathWalk.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PathWalk;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.PathWalk=PathWalk;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.PathWalk=PathWalk;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var PathWalk, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
PathWalk = (function(superClass) {
  extend(PathWalk, superClass);

  function PathWalk(walker, path1, options) {
    this.walker = walker;
    this.path = path1;
    this.setProperties(options);
    PathWalk.__super__.constructor.call(this);
  }

  PathWalk.properties({
    speed: {
      "default": 5
    },
    timing: {
      calcul: function() {
        return new Timing();
      }
    },
    pathLength: {
      calcul: function() {
        return this.path.solution.getTotalLength();
      }
    }
  });

  PathWalk.prototype.start = function() {
    if (!this.path.solution) {
      path.calcul();
    }
    if (this.path.solution) {
      this.pathTimeout = this.timing.setTimeout((function(_this) {
        return function() {
          return _this.end();
        };
      })(this), this.pathLength / this.speed * 1000);
      return this.pathTimeout.updater.addCallback(this.callback('update'));
    }
  };

  PathWalk.prototype.stop = function() {
    return this.pathTimeout.pause();
  };

  PathWalk.prototype.update = function() {
    var pos;
    pos = this.path.getPosAtPrc(this.pathTimeout.getPrc);
    this.walker.tile = pos.tile;
    this.walker.offsetX = pos.offsetX;
    return this.walker.offsetY = pos.offsetY;
  };

  PathWalk.prototype.end = function() {
    this.update();
    return this.destroy();
  };

  PathWalk.prototype.destroy = function() {
    this.pathTimeout.destroy();
    return this.destroyProperties();
  };

  return PathWalk;

})(Element);

return(PathWalk);});