(function() {
  var Element, Parallelio, PathFinder, Spark, Tile, TileContainer,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  if (typeof Parallelio === "undefined" || Parallelio === null) {
    Parallelio = {};
  }

  if (typeof Spark === "undefined" || Spark === null) {
    Spark = {};
  }

  Element = (function() {
    function Element() {}

    Element.elementKeywords = ['extended', 'included'];

    Element.prototype.tap = function(name) {
      var args;
      args = Array.prototype.slice.call(arguments);
      if (typeof name === 'function') {
        name.apply(this, args.slice(1));
      } else {
        this[name].apply(this, args.slice(1));
      }
      return this;
    };

    Element.extend = function(obj) {
      var key, ref1, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref1 = obj.extended) != null) {
        ref1.apply(this);
      }
      return this;
    };

    Element.include = function(obj) {
      var key, ref1, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref1 = obj.included) != null) {
        ref1.apply(this);
      }
      return this;
    };

    Element.property = function(prop, desc) {
      var maj;
      maj = prop.charAt(0).toUpperCase() + prop.slice(1);
      if (desc["default"] != null) {
        this.prototype['_' + prop] = desc["default"];
      } else {
        this.prototype['_' + prop] = null;
      }
      if (!((desc.get != null) && desc.get === false)) {
        if (desc.get != null) {
          this.prototype['get' + maj] = desc.get;
        } else {
          if (desc.init != null) {
            this.prototype['init' + maj] = desc.init;
          }
          this.prototype['get' + maj] = function() {
            if (typeof this['init' + maj] === 'function' && (this['_' + prop] == null)) {
              this['_' + prop] = this['init' + maj]();
            }
            return this['_' + prop];
          };
        }
        desc.get = function() {
          return this['get' + maj]();
        };
      }
      if (!((desc.set != null) && desc.set === false)) {
        if (desc.set != null) {
          this.prototype['set' + maj] = desc.set;
        } else {
          if (desc.change != null) {
            this.prototype['change' + maj] = desc.change;
          }
          this.prototype['set' + maj] = function(val) {
            var old;
            if (this['_' + prop] !== val) {
              old = this['_' + prop];
              this['_' + prop] = val;
              if (typeof this['change' + maj] === 'function') {
                this['change' + maj](old);
              }
              if (typeof this.emitEvent === 'function') {
                this.emitEvent('changed' + maj, [old]);
              }
            }
            return this;
          };
        }
        desc.set = function(val) {
          return this['set' + maj](val);
        };
      }
      return Object.defineProperty(this.prototype, prop, desc);
    };

    Element.properties = function(properties) {
      var desc, prop, results;
      results = [];
      for (prop in properties) {
        desc = properties[prop];
        results.push(this.property(prop, desc));
      }
      return results;
    };

    return Element;

  })();

  if (Spark != null) {
    Spark.Element = Element;
  }

  PathFinder = (function(superClass) {
    extend(PathFinder, superClass);

    function PathFinder(tilesContainer, from1, to1, options) {
      this.tilesContainer = tilesContainer;
      this.from = from1;
      this.to = to1;
      if (options == null) {
        options = {};
      }
      this.reset();
      if (options.validTile != null) {
        this.validTileCallback = options.validTile;
      }
    }

    PathFinder.properties({
      validTileCallback: {}
    });

    PathFinder.prototype.reset = function() {
      this.queue = [];
      this.paths = {};
      this.solution = null;
      return this.started = false;
    };

    PathFinder.prototype.calcul = function() {
      while (!this.solution && (!this.started || this.queue.length)) {
        this.step();
      }
      return this.getPath();
    };

    PathFinder.prototype.step = function() {
      var next;
      if (this.queue.length) {
        next = this.queue.pop();
        this.addNextSteps(next);
        return true;
      } else if (!this.started) {
        this.started = true;
        this.addNextSteps();
        return true;
      }
    };

    PathFinder.prototype.getPath = function() {
      var res, step;
      if (this.solution) {
        res = [this.solution];
        step = this.solution;
        while (step.prev != null) {
          res.unshift(step.prev);
          step = step.prev;
        }
        return res;
      }
    };

    PathFinder.prototype.getPosAtTime = function(time) {
      var prc, step;
      if (this.solution) {
        if (time >= this.solution.getTotalLength()) {
          return this.solution.posToTileOffset(this.solution.getExit().x, this.solution.getExit().y);
        } else {
          step = this.solution;
          while (step.getStartLength() > time && (step.prev != null)) {
            step = step.prev;
          }
          prc = (time - step.getStartLength()) / step.getLength();
          return step.posToTileOffset(step.getEntry().x + (step.getExit().x - step.getEntry().x) * prc, step.getEntry().y + (step.getExit().y - step.getEntry().y) * prc);
        }
      }
    };

    PathFinder.prototype.tileIsValid = function(tile) {
      if (this.validTileCallback != null) {
        return this.validTileCallback(tile);
      } else {
        return !tile.emulated || (tile.tile !== 0 && tile.tile !== false);
      }
    };

    PathFinder.prototype.getTile = function(x, y) {
      var ref1;
      if (this.tilesContainer.getTile != null) {
        return this.tilesContainer.getTile(x, y);
      } else if (((ref1 = this.tilesContainer[y]) != null ? ref1[x] : void 0) != null) {
        return {
          x: x,
          y: y,
          tile: this.tilesContainer[y][x],
          emulated: true
        };
      }
    };

    PathFinder.prototype.getConnectedToTile = function(tile) {
      var connected, t;
      if (tile.getConnected != null) {
        return tile.getConnected();
      } else {
        connected = [];
        if (t = this.getTile(tile.x + 1, tile.y)) {
          connected.push(t);
        }
        if (t = this.getTile(tile.x - 1, tile.y)) {
          connected.push(t);
        }
        if (t = this.getTile(tile.x, tile.y + 1)) {
          connected.push(t);
        }
        if (t = this.getTile(tile.x, tile.y - 1)) {
          connected.push(t);
        }
        return connected;
      }
    };

    PathFinder.prototype.addNextSteps = function(step) {
      var i, len, next, ref1, results, tile;
      if (step == null) {
        step = null;
      }
      tile = step != null ? step.nextTile : this.from;
      ref1 = this.getConnectedToTile(tile);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        next = ref1[i];
        if (this.tileIsValid(next)) {
          results.push(this.addStep(new PathFinder.Step(this, (step != null ? step : null), tile, next)));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    PathFinder.prototype.tileEqual = function(tileA, tileB) {
      return tileA === tileB || ((tileA.emulated || tileB.emulated) && tileA.x === tileB.x && tileA.y === tileB.y);
    };

    PathFinder.prototype.addStep = function(step) {
      if (this.paths[step.getExit().x] == null) {
        this.paths[step.getExit().x] = {};
      }
      if (!((this.paths[step.getExit().x][step.getExit().y] != null) && this.paths[step.getExit().x][step.getExit().y].getTotalLength() <= step.getTotalLength())) {
        if (this.paths[step.getExit().x][step.getExit().y] != null) {
          this.removeStep(this.paths[step.getExit().x][step.getExit().y]);
        }
        this.paths[step.getExit().x][step.getExit().y] = step;
        this.queue.splice(this.getStepRank(step), 0, step);
        if (this.tileEqual(step.nextTile, this.to) && !((this.solution != null) && this.solution.prev.getTotalLength() <= step.getTotalLength())) {
          return this.solution = new PathFinder.Step(this, step, step.nextTile, null);
        }
      }
    };

    PathFinder.prototype.removeStep = function(step) {
      var index;
      index = this.queue.indexOf(step);
      if (index > -1) {
        return this.queue.splice(index, 1);
      }
    };

    PathFinder.prototype.best = function() {
      return this.queue[this.queue.length - 1];
    };

    PathFinder.prototype.getStepRank = function(step) {
      if (this.queue.length === 0) {
        return 0;
      } else {
        return this._getStepRank(step.getEfficiency(), 0, this.queue.length - 1);
      }
    };

    PathFinder.prototype._getStepRank = function(efficiency, min, max) {
      var ref, refPos;
      refPos = Math.floor((max - min) / 2) + min;
      ref = this.queue[refPos].getEfficiency();
      if (ref === efficiency) {
        return refPos;
      } else if (ref > efficiency) {
        if (refPos === min) {
          return min;
        } else {
          return this._getStepRank(efficiency, min, refPos - 1);
        }
      } else {
        if (refPos === max) {
          return max + 1;
        } else {
          return this._getStepRank(efficiency, refPos + 1, max);
        }
      }
    };

    return PathFinder;

  })(Element);

  PathFinder.Step = (function() {
    function Step(pathFinder, prev, tile1, nextTile) {
      this.pathFinder = pathFinder;
      this.prev = prev;
      this.tile = tile1;
      this.nextTile = nextTile;
    }

    Step.prototype.posToTileOffset = function(x, y) {
      var tile;
      tile = Math.floor(x) === this.tile.x && Math.floor(y) === this.tile.y ? this.tile : Math.floor(x) === this.nextTile.x && Math.floor(y) === this.nextTile.y ? this.nextTile : (this.prev != null) && Math.floor(x) === this.prev.tile.x && Math.floor(y) === this.prev.tile.y ? this.prev.tile : console.log('Math.floor(' + x + ') == ' + this.tile.x, 'Math.floor(' + y + ') == ' + this.tile.y, this);
      return {
        x: x,
        y: y,
        tile: tile,
        offsetX: x - tile.x,
        offsetY: y - tile.y
      };
    };

    Step.prototype.getExit = function() {
      if (this.exit == null) {
        if (this.nextTile != null) {
          this.exit = {
            x: (this.tile.x + this.nextTile.x + 1) / 2,
            y: (this.tile.y + this.nextTile.y + 1) / 2
          };
        } else {
          this.exit = {
            x: this.tile.x + 0.5,
            y: this.tile.y + 0.5
          };
        }
      }
      return this.exit;
    };

    Step.prototype.getEntry = function() {
      if (this.entry == null) {
        if (this.prev != null) {
          this.entry = {
            x: (this.tile.x + this.prev.tile.x + 1) / 2,
            y: (this.tile.y + this.prev.tile.y + 1) / 2
          };
        } else {
          this.entry = {
            x: this.tile.x + 0.5,
            y: this.tile.y + 0.5
          };
        }
      }
      return this.entry;
    };

    Step.prototype.getLength = function() {
      if (this.length == null) {
        this.length = (this.nextTile == null) || (this.prev == null) ? 0.5 : this.prev.tile.x === this.nextTile.x || this.prev.tile.y === this.nextTile.y ? 1 : Math.sqrt(0.5);
      }
      return this.length;
    };

    Step.prototype.getStartLength = function() {
      if (this.startLength == null) {
        this.startLength = this.prev != null ? this.prev.getTotalLength() : 0;
      }
      return this.startLength;
    };

    Step.prototype.getTotalLength = function() {
      if (this.totalLength == null) {
        this.totalLength = this.getStartLength() + this.getLength();
      }
      return this.totalLength;
    };

    Step.prototype.getEfficiency = function() {
      if (this.efficiency == null) {
        this.efficiency = -this.getRemaining() * 1.1 - this.getTotalLength();
      }
      return this.efficiency;
    };

    Step.prototype.getRemaining = function() {
      var from, to, x, y;
      if (this.remaining == null) {
        from = this.getExit();
        to = {
          x: this.pathFinder.to.x + 0.5,
          y: this.pathFinder.to.y + 0.5
        };
        x = to.x - from.x;
        y = to.y - from.y;
        this.remaining = Math.sqrt(x * x + y * y);
      }
      return this.remaining;
    };

    return Step;

  })();

  if (Parallelio != null) {
    Parallelio.PathFinder = PathFinder;
  }

  Tile = (function(superClass) {
    extend(Tile, superClass);

    function Tile(x1, y1) {
      this.x = x1;
      this.y = y1;
      this.init();
    }

    Tile.prototype.init = function() {
      return this.children = [];
    };

    Tile.prototype.getRelativeTile = function(x, y) {
      return this.container.getTile(this.x + x, this.y + y);
    };

    Tile.prototype.addChild = function(child) {
      var index;
      index = this.children.indexOf(child);
      if (index === -1) {
        this.children.push(child);
      }
      child.tile = this;
      return child;
    };

    Tile.prototype.removeChild = function(child) {
      var index;
      index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      if (child.tile === this) {
        return child.tile = null;
      }
    };

    return Tile;

  })(Element);

  if (Parallelio != null) {
    Parallelio.Tile = Tile;
  }

  TileContainer = (function(superClass) {
    extend(TileContainer, superClass);

    function TileContainer() {
      this.init();
    }

    TileContainer.prototype.init = function() {
      this.coords = {};
      return this.tiles = [];
    };

    TileContainer.prototype.addTile = function(tile) {
      this.tiles.push(tile);
      if (this.coords[tile.x] == null) {
        this.coords[tile.x] = {};
      }
      this.coords[tile.x][tile.y] = tile;
      return tile.container = this;
    };

    TileContainer.prototype.getTile = function(x, y) {
      var ref1;
      if (((ref1 = this.coords[x]) != null ? ref1[y] : void 0) != null) {
        return this.coords[x][y];
      }
    };

    TileContainer.prototype.loadMatrix = function(matrix) {
      var options, results, row, tile, x, y;
      results = [];
      for (y in matrix) {
        row = matrix[y];
        results.push((function() {
          var results1;
          results1 = [];
          for (x in row) {
            tile = row[x];
            options = {
              x: parseInt(x),
              y: parseInt(y)
            };
            if (typeof tile === "function") {
              results1.push(this.addTile(tile(options)));
            } else {
              tile.x = options.x;
              tile.y = options.y;
              results1.push(this.addTile(tile));
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    TileContainer.prototype.allTiles = function() {
      return this.tiles.slice();
    };

    TileContainer.prototype.clearAll = function() {
      var i, len, ref1, tile;
      ref1 = this.tiles;
      for (i = 0, len = ref1.length; i < len; i++) {
        tile = ref1[i];
        tile.container = null;
      }
      this.coords = {};
      return this.tiles = [];
    };

    return TileContainer;

  })(Element);

  if (Parallelio != null) {
    Parallelio.TileContainer = TileContainer;
  }

  Parallelio.Element = Spark.Element;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Parallelio;
  } else {
    this.Parallelio = Parallelio;
  }

}).call(this);
