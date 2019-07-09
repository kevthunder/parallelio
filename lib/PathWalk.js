(function(definition){var PathWalk=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);PathWalk.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PathWalk;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.PathWalk=PathWalk;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.PathWalk=PathWalk;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : require('parallelio-timing');
var EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : require('spark-starter').EventEmitter;
var PathWalk;
PathWalk = (function() {
  class PathWalk extends Element {
    constructor(walker, path, options) {
      super();
      this.walker = walker;
      this.path = path;
      this.setProperties(options);
    }

    start() {
      if (!this.path.solution) {
        this.path.calcul();
      }
      if (this.path.solution) {
        this.pathTimeout = this.timing.setTimeout(() => {
          return this.finish();
        }, this.totalTime);
        return this.pathTimeout.updater.addCallback(this.callback('update'));
      }
    }

    stop() {
      return this.pathTimeout.pause();
    }

    update() {
      var pos;
      pos = this.path.getPosAtPrc(this.pathTimeout.getPrc());
      this.walker.tile = pos.tile;
      this.walker.offsetX = pos.offsetX;
      return this.walker.offsetY = pos.offsetY;
    }

    finish() {
      this.update();
      this.trigger('finished');
      return this.end();
    }

    interrupt() {
      this.update();
      this.trigger('interrupted');
      return this.end();
    }

    end() {
      this.trigger('end');
      return this.destroy();
    }

    destroy() {
      if (this.walker.walk === this) {
        this.walker.walk = null;
      }
      this.pathTimeout.destroy();
      this.destroyProperties();
      return this.removeAllListeners();
    }

  };

  PathWalk.include(EventEmitter.prototype);

  PathWalk.properties({
    speed: {
      default: 5
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
    },
    totalTime: {
      calcul: function() {
        return this.pathLength / this.speed * 1000;
      }
    }
  });

  return PathWalk;

}).call(this);

return(PathWalk);});