(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Parallelio = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CollectionPropertyWatcher, Connected, Element, SignalOperation;

Element = require('spark-starter').Element;

SignalOperation = require('./SignalOperation');

CollectionPropertyWatcher = require('spark-starter').Invalidated.CollectionPropertyWatcher;

module.exports = Connected = (function() {
  class Connected extends Element {
    canConnectTo(target) {
      return typeof target.addSignal === "function";
    }

    acceptSignal(signal) {
      return true;
    }

    onAddConnection(conn) {}

    onRemoveConnection(conn) {}

    onNewSignalType(signal) {}

    onAddSignal(signal, op) {}

    onRemoveSignal(signal, op) {}

    onRemoveSignalType(signal, op) {}

    onReplaceSignal(oldSignal, newSignal, op) {}

    containsSignal(signal, checkLast = false, checkOrigin) {
      return this.signals.find(function(c) {
        return c.match(signal, checkLast, checkOrigin);
      });
    }

    addSignal(signal, op) {
      var autoStart;
      if (!(op != null ? op.findLimiter(this) : void 0)) {
        if (!op) {
          op = new SignalOperation();
          autoStart = true;
        }
        op.addOperation(() => {
          var similar;
          if (!this.containsSignal(signal, true) && this.acceptSignal(signal)) {
            similar = this.containsSignal(signal);
            this.signals.push(signal);
            this.onAddSignal(signal, op);
            if (!similar) {
              return this.onNewSignalType(signal, op);
            }
          }
        });
        if (autoStart) {
          op.start();
        }
      }
      return signal;
    }

    removeSignal(signal, op) {
      var autoStart;
      if (!(op != null ? op.findLimiter(this) : void 0)) {
        if (!op) {
          op = new SignalOperation;
          autoStart = true;
        }
        op.addOperation(() => {
          var existing;
          if ((existing = this.containsSignal(signal, true)) && this.acceptSignal(signal)) {
            this.signals.splice(this.signals.indexOf(existing), 1);
            this.onRemoveSignal(signal, op);
            op.addOperation(() => {
              var similar;
              similar = this.containsSignal(signal);
              if (similar) {
                return this.onReplaceSignal(signal, similar, op);
              } else {
                return this.onRemoveSignalType(signal, op);
              }
            }, 0);
          }
          if (stepByStep) {
            return op.step();
          }
        });
        if (autoStart) {
          return op.start();
        }
      }
    }

    prepForwardedSignal(signal) {
      if (signal.last === this) {
        return signal;
      } else {
        return signal.withLast(this);
      }
    }

    checkForwardWatcher() {
      if (!this.forwardWatcher) {
        this.forwardWatcher = new CollectionPropertyWatcher({
          scope: this,
          property: 'outputs',
          onAdded: function(output, i) {
            return this.forwardedSignals.forEach((signal) => {
              return this.forwardSignalTo(signal, output);
            });
          },
          onRemoved: function(output, i) {
            return this.forwardedSignals.forEach((signal) => {
              return this.stopForwardedSignalTo(signal, output);
            });
          }
        });
        return this.forwardWatcher.bind();
      }
    }

    forwardSignal(signal, op) {
      var next;
      this.forwardedSignals.add(signal);
      next = this.prepForwardedSignal(signal);
      this.outputs.forEach(function(conn) {
        if (signal.last !== conn) {
          return conn.addSignal(next, op);
        }
      });
      return this.checkForwardWatcher();
    }

    forwardAllSignalsTo(conn, op) {
      return this.signals.forEach((signal) => {
        var next;
        next = this.prepForwardedSignal(signal);
        return conn.addSignal(next, op);
      });
    }

    stopForwardedSignal(signal, op) {
      var next;
      this.forwardedSignals.remove(signal);
      next = this.prepForwardedSignal(signal);
      return this.outputs.forEach(function(conn) {
        if (signal.last !== conn) {
          return conn.removeSignal(next, op);
        }
      });
    }

    stopAllForwardedSignalTo(conn, op) {
      return this.signals.forEach((signal) => {
        var next;
        next = this.prepForwardedSignal(signal);
        return conn.removeSignal(next, op);
      });
    }

    forwardSignalTo(signal, conn, op) {
      var next;
      next = this.prepForwardedSignal(signal);
      if (signal.last !== conn) {
        return conn.addSignal(next, op);
      }
    }

    stopForwardedSignalTo(signal, conn, op) {
      var next;
      next = this.prepForwardedSignal(signal);
      if (signal.last !== conn) {
        return conn.removeSignal(next, op);
      }
    }

  };

  Connected.properties({
    signals: {
      collection: true
    },
    inputs: {
      collection: true
    },
    outputs: {
      collection: true
    },
    forwardedSignals: {
      collection: true
    }
  });

  return Connected;

}).call(this);

},{"./SignalOperation":3,"spark-starter":37}],2:[function(require,module,exports){
var Element, Signal;

Element = require('spark-starter').Element;

module.exports = Signal = class Signal extends Element {
  constructor(origin, type = 'signal', exclusive = false) {
    super();
    this.origin = origin;
    this.type = type;
    this.exclusive = exclusive;
    this.last = this.origin;
  }

  withLast(last) {
    var signal;
    signal = new this.__proto__.constructor(this.origin, this.type, this.exclusive);
    signal.last = last;
    return signal;
  }

  copy() {
    var signal;
    signal = new this.__proto__.constructor(this.origin, this.type, this.exclusive);
    signal.last = this.last;
    return signal;
  }

  match(signal, checkLast = false, checkOrigin = this.exclusive) {
    return (!checkLast || signal.last === this.last) && (checkOrigin || signal.origin === this.origin) && signal.type === this.type;
  }

};

},{"spark-starter":37}],3:[function(require,module,exports){
var Element, SignalOperation;

Element = require('spark-starter').Element;

module.exports = SignalOperation = class SignalOperation extends Element {
  constructor() {
    super();
    this.queue = [];
    this.limiters = [];
  }

  addOperation(funct, priority = 1) {
    if (priority) {
      return this.queue.unshift(funct);
    } else {
      return this.queue.push(funct);
    }
  }

  addLimiter(connected) {
    if (!this.findLimiter(connected)) {
      return this.limiters.push(connected);
    }
  }

  findLimiter(connected) {
    return this.limiters.indexOf(connected) > -1;
  }

  start() {
    var results;
    results = [];
    while (this.queue.length) {
      results.push(this.step());
    }
    return results;
  }

  step() {
    var funct;
    if (this.queue.length === 0) {
      return this.done();
    } else {
      funct = this.queue.shift(funct);
      return funct(this);
    }
  }

  done() {}

};

},{"spark-starter":37}],4:[function(require,module,exports){
var Connected, Signal, SignalOperation, SignalSource;

Connected = require('./Connected');

Signal = require('./Signal');

SignalOperation = require('./SignalOperation');

module.exports = SignalSource = (function() {
  class SignalSource extends Connected {};

  SignalSource.properties({
    activated: {
      change: function() {
        var op;
        op = new SignalOperation();
        if (this.activated) {
          this.forwardSignal(this.signal, op);
        } else {
          this.stopForwardedSignal(this.signal, op);
        }
        return op.start();
      }
    },
    signal: {
      calcul: function() {
        return new Signal(this, 'power', true);
      }
    }
  });

  return SignalSource;

}).call(this);

},{"./Connected":1,"./Signal":2,"./SignalOperation":3}],5:[function(require,module,exports){
var Connected, Switch;

Connected = require('./Connected');

module.exports = Switch = class Switch extends Connected {};

},{"./Connected":1}],6:[function(require,module,exports){
var Connected, Direction, Tiled, Wire,
  indexOf = [].indexOf;

Tiled = require('parallelio-tiles').Tiled;

Direction = require('parallelio-tiles').Direction;

Connected = require('./Connected');

module.exports = Wire = (function() {
  class Wire extends Tiled {
    constructor(wireType = 'red') {
      super();
      this.wireType = wireType;
    }

    findDirectionsTo(conn) {
      var directions;
      directions = conn.tiles != null ? conn.tiles.map((tile) => {
        return this.tile.findDirectionOf(tile);
      }) : [this.tile.findDirectionOf(conn)];
      return directions.filter(function(d) {
        return d != null;
      });
    }

    canConnectTo(target) {
      return Connected.prototype.canConnectTo.call(this, target) && ((target.wireType == null) || target.wireType === this.wireType);
    }

    onNewSignalType(signal, op) {
      return this.forwardSignal(signal, op);
    }

  };

  Wire.extend(Connected);

  Wire.properties({
    outputs: {
      calcul: function(invalidation) {
        var parent;
        parent = invalidation.prop('tile');
        if (parent) {
          return invalidation.prop('adjacentTiles', parent).reduce((res, tile) => {
            return res.concat(invalidation.prop('children', tile).filter((child) => {
              return this.canConnectTo(child);
            }).toArray());
          }, []);
        } else {
          return [];
        }
      }
    },
    connectedDirections: {
      calcul: function(invalidation) {
        return invalidation.prop('outputs').reduce((out, conn) => {
          this.findDirectionsTo(conn).forEach(function(d) {
            if (indexOf.call(out, d) < 0) {
              return out.push(d);
            }
          });
          return out;
        }, []);
      }
    }
  });

  return Wire;

}).call(this);

},{"./Connected":1,"parallelio-tiles":13}],7:[function(require,module,exports){
module.exports = {
  "Connected": require("./Connected"),
  "Signal": require("./Signal"),
  "SignalOperation": require("./SignalOperation"),
  "SignalSource": require("./SignalSource"),
  "Switch": require("./Switch"),
  "Wire": require("./Wire"),
}
},{"./Connected":1,"./Signal":2,"./SignalOperation":3,"./SignalSource":4,"./Switch":5,"./Wire":6}],8:[function(require,module,exports){
var Direction;

module.exports = Direction = class Direction {
  constructor(name, x, y, inverseName) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.inverseName = inverseName;
  }

  getInverse() {
    return this.constructor[this.inverseName];
  }

};

Direction.up = new Direction('up', 0, -1, 'down');

Direction.down = new Direction('down', 0, 1, 'up');

Direction.left = new Direction('left', -1, 0, 'right');

Direction.right = new Direction('right', 1, 0, 'left');

Direction.adjacents = [Direction.up, Direction.down, Direction.left, Direction.right];

Direction.topLeft = new Direction('topLeft', -1, -1, 'bottomRight');

Direction.topRight = new Direction('topRight', 1, -1, 'bottomLeft');

Direction.bottomRight = new Direction('bottomRight', 1, 1, 'topLeft');

Direction.bottomLeft = new Direction('bottomLeft', -1, 1, 'topRight');

Direction.corners = [Direction.topLeft, Direction.topRight, Direction.bottomRight, Direction.bottomLeft];

Direction.all = [Direction.up, Direction.down, Direction.left, Direction.right, Direction.topLeft, Direction.topRight, Direction.bottomRight, Direction.bottomLeft];

},{}],9:[function(require,module,exports){
var Direction, Element, Tile;

Element = require('spark-starter').Element;

Direction = require('./Direction');

module.exports = Tile = (function() {
  class Tile extends Element {
    constructor(x1, y1) {
      super();
      this.x = x1;
      this.y = y1;
      this.init();
    }

    init() {
      var container;
      return container = null;
    }

    getRelativeTile(x, y) {
      if (this.container != null) {
        return this.container.getTile(this.x + x, this.y + y);
      }
    }

    findDirectionOf(tile) {
      if (tile.tile) {
        tile = tile.tile;
      }
      if ((tile.x != null) && (tile.y != null)) {
        return Direction.all.find((d) => {
          return d.x === tile.x - this.x && d.y === tile.y - this.y;
        });
      }
    }

    addChild(child, checkRef = true) {
      var index;
      index = this.children.indexOf(child);
      if (index === -1) {
        this.children.push(child);
      }
      if (checkRef) {
        child.tile = this;
      }
      return child;
    }

    removeChild(child, checkRef = true) {
      var index;
      index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      if (checkRef && child.tile === this) {
        return child.tile = null;
      }
    }

    dist(tile) {
      var ctnDist, ref, x, y;
      if ((tile != null ? tile.getFinalTile : void 0) != null) {
        tile = tile.getFinalTile();
      }
      if (((tile != null ? tile.x : void 0) != null) && (tile.y != null) && (this.x != null) && (this.y != null) && (this.container === tile.container || (ctnDist = (ref = this.container) != null ? typeof ref.dist === "function" ? ref.dist(tile.container) : void 0 : void 0))) {
        x = tile.x - this.x;
        y = tile.y - this.y;
        if (ctnDist) {
          x += ctnDist.x;
          y += ctnDist.y;
        }
        return {
          x: x,
          y: y,
          length: Math.sqrt(x * x + y * y)
        };
      } else {
        return null;
      }
    }

    getFinalTile() {
      return this;
    }

  };

  Tile.properties({
    children: {
      collection: true
    },
    container: {
      change: function() {
        if (this.container != null) {
          return this.adjacentTiles.forEach(function(tile) {
            return tile.invalidateAdjacentTiles();
          });
        }
      }
    },
    adjacentTiles: {
      calcul: function(invalidation) {
        if (invalidation.prop('container')) {
          return Direction.adjacents.map((d) => {
            return this.getRelativeTile(d.x, d.y);
          }).filter((t) => {
            return t != null;
          });
        }
      },
      collection: true
    }
  });

  return Tile;

}).call(this);

},{"./Direction":8,"spark-starter":37}],10:[function(require,module,exports){
var Element, TileContainer, TileReference;

Element = require('spark-starter').Element;

TileReference = require('./TileReference');

module.exports = TileContainer = (function() {
  class TileContainer extends Element {
    constructor() {
      super();
      this.init();
    }

    _addToBondaries(tile, boundaries) {
      if ((boundaries.top == null) || tile.y < boundaries.top) {
        boundaries.top = tile.y;
      }
      if ((boundaries.left == null) || tile.x < boundaries.left) {
        boundaries.left = tile.x;
      }
      if ((boundaries.bottom == null) || tile.y > boundaries.bottom) {
        boundaries.bottom = tile.y;
      }
      if ((boundaries.right == null) || tile.x > boundaries.right) {
        return boundaries.right = tile.x;
      }
    }

    init() {
      this.coords = {};
      return this.tiles = [];
    }

    addTile(tile) {
      var ref;
      if (!this.tiles.includes(tile)) {
        this.tiles.push(tile);
        if (this.coords[tile.x] == null) {
          this.coords[tile.x] = {};
        }
        this.coords[tile.x][tile.y] = tile;
        if (this.owner) {
          tile.container = this;
        }
        if ((ref = this._boundaries) != null ? ref.calculated : void 0) {
          this._addToBondaries(tile, this._boundaries.value);
        }
      }
      return this;
    }

    removeTile(tile) {
      var index, ref;
      index = this.tiles.indexOf(tile);
      if (index > -1) {
        this.tiles.splice(index, 1);
        delete this.coords[tile.x][tile.y];
        if (this.owner) {
          tile.container = null;
        }
        if ((ref = this._boundaries) != null ? ref.calculated : void 0) {
          if (this.boundaries.top === tile.y || this.boundaries.bottom === tile.y || this.boundaries.left === tile.x || this.boundaries.right === tile.x) {
            return this.invalidateBoundaries();
          }
        }
      }
    }

    removeTileAt(x, y) {
      var tile;
      if (tile = this.getTile(x, y)) {
        return this.removeTile(tile);
      }
    }

    getTile(x, y) {
      var ref;
      if (((ref = this.coords[x]) != null ? ref[y] : void 0) != null) {
        return this.coords[x][y];
      }
    }

    loadMatrix(matrix) {
      var options, row, tile, x, y;
      for (y in matrix) {
        row = matrix[y];
        for (x in row) {
          tile = row[x];
          options = {
            x: parseInt(x),
            y: parseInt(y)
          };
          if (typeof tile === "function") {
            this.addTile(tile(options));
          } else {
            tile.x = options.x;
            tile.y = options.y;
            this.addTile(tile);
          }
        }
      }
      return this;
    }

    inRange(tile, range) {
      var found, i, j, ref, ref1, ref2, ref3, tiles, x, y;
      tiles = [];
      range--;
      for (x = i = ref = tile.x - range, ref1 = tile.x + range; (ref <= ref1 ? i <= ref1 : i >= ref1); x = ref <= ref1 ? ++i : --i) {
        for (y = j = ref2 = tile.y - range, ref3 = tile.y + range; (ref2 <= ref3 ? j <= ref3 : j >= ref3); y = ref2 <= ref3 ? ++j : --j) {
          if (Math.sqrt((x - tile.x) * (x - tile.x) + (y - tile.y) * (y - tile.y)) <= range && ((found = this.getTile(x, y)) != null)) {
            tiles.push(found);
          }
        }
      }
      return tiles;
    }

    allTiles() {
      return this.tiles.slice();
    }

    clearAll() {
      var i, len, ref, tile;
      if (this.owner) {
        ref = this.tiles;
        for (i = 0, len = ref.length; i < len; i++) {
          tile = ref[i];
          tile.container = null;
        }
      }
      this.coords = {};
      this.tiles = [];
      return this;
    }

    closest(originTile, filter) {
      var candidates, getScore;
      getScore = function(candidate) {
        if (candidate.score != null) {
          return candidate.score;
        } else {
          return candidate.score = candidate.getFinalTile().dist(originTile).length;
        }
      };
      candidates = this.tiles.filter(filter).map((t) => {
        return new TileReference(t);
      });
      candidates.sort((a, b) => {
        return getScore(a) - getScore(b);
      });
      if (candidates.length > 0) {
        return candidates[0].tile;
      } else {
        return null;
      }
    }

    copy() {
      var out;
      out = new TileContainer();
      out.coords = this.coords;
      out.tiles = this.tiles;
      out.owner = false;
      return out;
    }

    merge(ctn, mergeFn, asOwner = false) {
      var out, tmp;
      out = new TileContainer();
      out.owner = asOwner;
      tmp = ctn.copy();
      this.tiles.forEach(function(tileA) {
        var mergedTile, tileB;
        tileB = tmp.getTile(tileA.x, tileA.y);
        if (tileB) {
          tmp.removeTile(tileB);
        }
        mergedTile = mergeFn(tileA, tileB);
        if (mergedTile) {
          return out.addTile(mergedTile);
        }
      });
      tmp.tiles.forEach(function(tileB) {
        var mergedTile;
        mergedTile = mergeFn(null, tileB);
        if (mergedTile) {
          return out.addTile(mergedTile);
        }
      });
      return out;
    }

  };

  TileContainer.properties({
    owner: {
      default: true
    },
    boundaries: {
      calcul: function() {
        var boundaries;
        boundaries = {
          top: null,
          left: null,
          bottom: null,
          right: null
        };
        this.tiles.forEach((tile) => {
          return this._addToBondaries(tile, boundaries);
        });
        return boundaries;
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    }
  });

  return TileContainer;

}).call(this);

},{"./TileReference":11,"spark-starter":37}],11:[function(require,module,exports){
var TileReference;

module.exports = TileReference = class TileReference {
  constructor(tile) {
    this.tile = tile;
    Object.defineProperties(this, {
      x: {
        get: () => {
          return this.getFinalTile().x;
        }
      },
      y: {
        get: () => {
          return this.getFinalTile().y;
        }
      }
    });
  }

  getFinalTile() {
    return this.tile.getFinalTile();
  }

};

},{}],12:[function(require,module,exports){
var Element, Tiled;

Element = require('spark-starter').Element;

module.exports = Tiled = (function() {
  class Tiled extends Element {
    putOnRandomTile(tiles) {
      var found;
      found = this.getRandomValidTile(tiles);
      if (found) {
        return this.tile = found;
      }
    }

    getRandomValidTile(tiles) {
      var candidate, pos, remaining;
      remaining = tiles.slice();
      while (remaining.length > 0) {
        pos = Math.floor(Math.random() * remaining.length);
        candidate = remaining.splice(pos, 1)[0];
        if (this.canGoOnTile(candidate)) {
          return candidate;
        }
      }
      return null;
    }

    canGoOnTile(tile) {
      return true;
    }

    getFinalTile() {
      return this.tile.getFinalTile();
    }

  };

  Tiled.properties({
    tile: {
      change: function(old) {
        if (old != null) {
          old.removeChild(this);
        }
        if (this.tile) {
          return this.tile.addChild(this);
        }
      }
    },
    offsetX: {
      default: 0
    },
    offsetY: {
      default: 0
    }
  });

  return Tiled;

}).call(this);

},{"spark-starter":37}],13:[function(require,module,exports){
module.exports = {
  "Direction": require("./Direction"),
  "Tile": require("./Tile"),
  "TileContainer": require("./TileContainer"),
  "TileReference": require("./TileReference"),
  "Tiled": require("./Tiled"),
}
},{"./Direction":8,"./Tile":9,"./TileContainer":10,"./TileReference":11,"./Tiled":12}],14:[function(require,module,exports){
var Binder, Referred;

Referred = require('./Referred');

module.exports = Binder = class Binder extends Referred {
  toggleBind(val = !this.binded) {
    if (val) {
      return this.bind();
    } else {
      return this.unbind();
    }
  }

  bind() {
    if (!this.binded && this.canBind()) {
      this.doBind();
    }
    return this.binded = true;
  }

  canBind() {
    return (this.callback != null) && (this.target != null);
  }

  doBind() {
    throw new Error('Not implemented');
  }

  unbind() {
    if (this.binded && this.canBind()) {
      this.doUnbind();
    }
    return this.binded = false;
  }

  doUnbind() {
    throw new Error('Not implemented');
  }

  equals(binder) {
    return this.compareRefered(binder);
  }

  destroy() {
    return this.unbind();
  }

};



},{"./Referred":35}],15:[function(require,module,exports){
var Collection;

module.exports = Collection = (function() {
  class Collection {
    constructor(arr) {
      if (arr != null) {
        if (typeof arr.toArray === 'function') {
          this._array = arr.toArray();
        } else if (Array.isArray(arr)) {
          this._array = arr;
        } else {
          this._array = [arr];
        }
      } else {
        this._array = [];
      }
    }

    changed() {}

    checkChanges(old, ordered = true, compareFunction = null) {
      if (compareFunction == null) {
        compareFunction = function(a, b) {
          return a === b;
        };
      }
      if (old != null) {
        old = this.copy(old.slice());
      } else {
        old = [];
      }
      return this.count() !== old.length || (ordered ? this.some(function(val, i) {
        return !compareFunction(old.get(i), val);
      }) : this.some(function(a) {
        return !old.pluck(function(b) {
          return compareFunction(a, b);
        });
      }));
    }

    get(i) {
      return this._array[i];
    }

    getRandom() {
      return this._array[Math.floor(Math.random() * this._array.length)];
    }

    set(i, val) {
      var old;
      if (this._array[i] !== val) {
        old = this.toArray();
        this._array[i] = val;
        this.changed(old);
      }
      return val;
    }

    add(val) {
      if (!this._array.includes(val)) {
        return this.push(val);
      }
    }

    remove(val) {
      var index, old;
      index = this._array.indexOf(val);
      if (index !== -1) {
        old = this.toArray();
        this._array.splice(index, 1);
        return this.changed(old);
      }
    }

    pluck(fn) {
      var found, index, old;
      index = this._array.findIndex(fn);
      if (index > -1) {
        old = this.toArray();
        found = this._array[index];
        this._array.splice(index, 1);
        this.changed(old);
        return found;
      } else {
        return null;
      }
    }

    toArray() {
      return this._array.slice();
    }

    count() {
      return this._array.length;
    }

    static newSubClass(fn, arr) {
      var SubClass;
      if (typeof fn === 'object') {
        SubClass = class extends this {};
        Object.assign(SubClass.prototype, fn);
        return new SubClass(arr);
      } else {
        return new this(arr);
      }
    }

    copy(arr) {
      var coll;
      if (arr == null) {
        arr = this.toArray();
      }
      coll = new this.constructor(arr);
      return coll;
    }

    equals(arr) {
      return (this.count() === (typeof arr.count === 'function' ? arr.count() : arr.length)) && this.every(function(val, i) {
        return arr[i] === val;
      });
    }

    getAddedFrom(arr) {
      return this._array.filter(function(item) {
        return !arr.includes(item);
      });
    }

    getRemovedFrom(arr) {
      return arr.filter((item) => {
        return !this.includes(item);
      });
    }

  };

  Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString'];

  Collection.readListFunctions = ['concat', 'filter', 'slice'];

  Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

  Collection.readFunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function(...arg) {
      return this._array[funct](...arg);
    };
  });

  Collection.readListFunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function(...arg) {
      return this.copy(this._array[funct](...arg));
    };
  });

  Collection.writefunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function(...arg) {
      var old, res;
      old = this.toArray();
      res = this._array[funct](...arg);
      this.changed(old);
      return res;
    };
  });

  return Collection;

}).call(this);

Object.defineProperty(Collection.prototype, 'length', {
  get: function() {
    return this.count();
  }
});

if (typeof Symbol !== "undefined" && Symbol !== null ? Symbol.iterator : void 0) {
  Collection.prototype[Symbol.iterator] = function() {
    return this._array[Symbol.iterator]();
  };
}



},{}],16:[function(require,module,exports){
var Element, Mixable, Property;

Property = require('./Property');

Mixable = require('./Mixable');

module.exports = Element = class Element extends Mixable {
  constructor() {
    super();
    this.init();
  }

  init() {}

  tap(name) {
    var args;
    args = Array.prototype.slice.call(arguments);
    if (typeof name === 'function') {
      name.apply(this, args.slice(1));
    } else {
      this[name].apply(this, args.slice(1));
    }
    return this;
  }

  callback(name) {
    if (this._callbacks == null) {
      this._callbacks = {};
    }
    if (this._callbacks[name] == null) {
      this._callbacks[name] = (...args) => {
        this[name].apply(this, args);
        return null;
      };
      this._callbacks[name].owner = this;
    }
    return this._callbacks[name];
  }

  getFinalProperties() {
    if (this._properties != null) {
      return ['_properties'].concat(this._properties.map(function(prop) {
        return prop.name;
      }));
    } else {
      return [];
    }
  }

  extended(target) {
    var i, len, options, property, ref, results;
    if (this._properties != null) {
      ref = this._properties;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        property = ref[i];
        options = Object.assign({}, property.options);
        results.push((new Property(property.name, options)).bind(target));
      }
      return results;
    }
  }

  static property(prop, desc) {
    return (new Property(prop, desc)).bind(this.prototype);
  }

  static properties(properties) {
    var desc, prop, results;
    results = [];
    for (prop in properties) {
      desc = properties[prop];
      results.push(this.property(prop, desc));
    }
    return results;
  }

};



},{"./Mixable":25,"./Property":27}],17:[function(require,module,exports){
var Binder, EventBind;

Binder = require('./Binder');

module.exports = EventBind = class EventBind extends Binder {
  constructor(event1, target1, callback) {
    super();
    this.event = event1;
    this.target = target1;
    this.callback = callback;
  }

  getRef() {
    return {
      event: this.event,
      target: this.target,
      callback: this.callback
    };
  }

  bindTo(target) {
    this.unbind();
    this.target = target;
    return this.bind();
  }

  doBind() {
    if (typeof this.target.addEventListener === 'function') {
      return this.target.addEventListener(this.event, this.callback);
    } else if (typeof this.target.addListener === 'function') {
      return this.target.addListener(this.event, this.callback);
    } else if (typeof this.target.on === 'function') {
      return this.target.on(this.event, this.callback);
    } else {
      throw new Error('No function to add event listeners was found');
    }
  }

  doUnbind() {
    if (typeof this.target.removeEventListener === 'function') {
      return this.target.removeEventListener(this.event, this.callback);
    } else if (typeof this.target.removeListener === 'function') {
      return this.target.removeListener(this.event, this.callback);
    } else if (typeof this.target.off === 'function') {
      return this.target.off(this.event, this.callback);
    } else {
      throw new Error('No function to remove event listeners was found');
    }
  }

  equals(eventBind) {
    return super.equals(eventBind) && eventBind.event === this.event;
  }

  match(event, target) {
    return event === this.event && target === this.target;
  }

  static checkEmitter(emitter, fatal = true) {
    if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
      return true;
    } else if (fatal) {
      throw new Error('No function to add event listeners was found');
    } else {
      return false;
    }
  }

};



},{"./Binder":14}],18:[function(require,module,exports){
var EventEmitter;

module.exports = EventEmitter = (function() {
  class EventEmitter {
    getAllEvents() {
      return this._events || (this._events = {});
    }

    getListeners(e) {
      var events;
      events = this.getAllEvents();
      return events[e] || (events[e] = []);
    }

    hasListener(e, listener) {
      return this.getListeners(e).includes(listener);
    }

    addListener(e, listener) {
      if (!this.hasListener(e, listener)) {
        this.getListeners(e).push(listener);
        return this.listenerAdded(e, listener);
      }
    }

    listenerAdded(e, listener) {}

    removeListener(e, listener) {
      var index, listeners;
      listeners = this.getListeners(e);
      index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        return this.listenerRemoved(e, listener);
      }
    }

    listenerRemoved(e, listener) {}

    emitEvent(e, ...args) {
      var listeners;
      listeners = this.getListeners(e).slice();
      return listeners.forEach(function(listener) {
        return listener(...args);
      });
    }

    removeAllListeners() {
      return this._events = {};
    }

  };

  EventEmitter.prototype.emit = EventEmitter.prototype.emitEvent;

  EventEmitter.prototype.trigger = EventEmitter.prototype.emitEvent;

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

  return EventEmitter;

}).call(this);



},{}],19:[function(require,module,exports){
var ActivablePropertyWatcher, Invalidator, PropertyWatcher;

PropertyWatcher = require('./PropertyWatcher');

Invalidator = require('../Invalidator');

module.exports = ActivablePropertyWatcher = class ActivablePropertyWatcher extends PropertyWatcher {
  loadOptions(options) {
    super.loadOptions(options);
    return this.active = options.active;
  }

  shouldBind() {
    var active;
    if (this.active != null) {
      if (this.invalidator == null) {
        this.invalidator = new Invalidator(this, this.scope);
        this.invalidator.callback = () => {
          return this.checkBind();
        };
      }
      this.invalidator.recycle();
      active = this.active(this.invalidator);
      this.invalidator.endRecycle();
      this.invalidator.bind();
      return active;
    } else {
      return true;
    }
  }

};



},{"../Invalidator":23,"./PropertyWatcher":22}],20:[function(require,module,exports){
var CollectionPropertyWatcher, PropertyWatcher;

PropertyWatcher = require('./PropertyWatcher');

module.exports = CollectionPropertyWatcher = class CollectionPropertyWatcher extends PropertyWatcher {
  loadOptions(options) {
    super.loadOptions(options);
    this.onAdded = options.onAdded;
    return this.onRemoved = options.onRemoved;
  }

  handleChange(value, old) {
    old = value.copy(old || []);
    if (typeof this.callback === 'function') {
      this.callback.call(this.scope, old);
    }
    if (typeof this.onAdded === 'function') {
      value.forEach((item, i) => {
        if (!old.includes(item)) {
          return this.onAdded.call(this.scope, item);
        }
      });
    }
    if (typeof this.onRemoved === 'function') {
      return old.forEach((item, i) => {
        if (!value.includes(item)) {
          return this.onRemoved.call(this.scope, item);
        }
      });
    }
  }

};



},{"./PropertyWatcher":22}],21:[function(require,module,exports){
var Invalidated, Invalidator;

Invalidator = require('../Invalidator');

module.exports = Invalidated = class Invalidated {
  constructor(options) {
    if (options != null) {
      this.loadOptions(options);
    }
    if (!((options != null ? options.initByLoader : void 0) && (options.loader != null))) {
      this.init();
    }
  }

  loadOptions(options) {
    this.scope = options.scope;
    if (options.loaderAsScope && (options.loader != null)) {
      this.scope = options.loader;
    }
    return this.callback = options.callback;
  }

  init() {
    return this.update();
  }

  unknown() {
    return this.invalidator.validateUnknowns();
  }

  invalidate() {
    return this.update();
  }

  update() {
    if (this.invalidator == null) {
      this.invalidator = new Invalidator(this, this.scope);
    }
    this.invalidator.recycle();
    this.handleUpdate(this.invalidator);
    this.invalidator.endRecycle();
    this.invalidator.bind();
    return this;
  }

  handleUpdate(invalidator) {
    if (this.scope != null) {
      return this.callback.call(this.scope, invalidator);
    } else {
      return this.callback(invalidator);
    }
  }

  destroy() {
    if (this.invalidator) {
      return this.invalidator.unbind();
    }
  }

};



},{"../Invalidator":23}],22:[function(require,module,exports){
var Binder, PropertyWatcher;

Binder = require('../Binder');

module.exports = PropertyWatcher = class PropertyWatcher extends Binder {
  constructor(options1) {
    var ref;
    super();
    this.options = options1;
    this.invalidateCallback = () => {
      return this.invalidate();
    };
    this.updateCallback = (old) => {
      return this.update(old);
    };
    if (this.options != null) {
      this.loadOptions(this.options);
    }
    if (!(((ref = this.options) != null ? ref.initByLoader : void 0) && (this.options.loader != null))) {
      this.init();
    }
  }

  loadOptions(options) {
    this.scope = options.scope;
    if (options.loaderAsScope && (options.loader != null)) {
      this.scope = options.loader;
    }
    this.property = options.property;
    this.callback = options.callback;
    return this.autoBind = options.autoBind;
  }

  copyWith(opt) {
    return new this.__proto__.constructor(Object.assign({}, this.options, opt));
  }

  init() {
    if (this.autoBind) {
      return this.checkBind();
    }
  }

  getProperty() {
    if (typeof this.property === "string") {
      this.property = this.scope.getPropertyInstance(this.property);
    }
    return this.property;
  }

  checkBind() {
    return this.toggleBind(this.shouldBind());
  }

  shouldBind() {
    return true;
  }

  canBind() {
    return this.getProperty() != null;
  }

  doBind() {
    this.update();
    this.getProperty().on('invalidated', this.invalidateCallback);
    return this.getProperty().on('updated', this.updateCallback);
  }

  doUnbind() {
    this.getProperty().off('invalidated', this.invalidateCallback);
    return this.getProperty().off('updated', this.updateCallback);
  }

  getRef() {
    if (typeof this.property === "string") {
      return {
        property: this.property,
        target: this.scope,
        callback: this.callback
      };
    } else {
      return {
        property: this.property.property.name,
        target: this.property.obj,
        callback: this.callback
      };
    }
  }

  invalidate() {
    return this.getProperty().get();
  }

  update(old) {
    var value;
    value = this.getProperty().get();
    return this.handleChange(value, old);
  }

  handleChange(value, old) {
    return this.callback.call(this.scope, old);
  }

};



},{"../Binder":14}],23:[function(require,module,exports){
var Binder, EventBind, Invalidator, pluck;

Binder = require('./Binder');

EventBind = require('./EventBind');

pluck = function(arr, fn) {
  var found, index;
  index = arr.findIndex(fn);
  if (index > -1) {
    found = arr[index];
    arr.splice(index, 1);
    return found;
  } else {
    return null;
  }
};

module.exports = Invalidator = (function() {
  class Invalidator extends Binder {
    constructor(invalidated, scope = null) {
      super();
      this.invalidated = invalidated;
      this.scope = scope;
      this.invalidationEvents = [];
      this.recycled = [];
      this.unknowns = [];
      this.strict = this.constructor.strict;
      this.invalid = false;
      this.invalidateCallback = () => {
        this.invalidate();
        return null;
      };
      this.invalidateCallback.owner = this;
    }

    invalidate() {
      var functName;
      this.invalid = true;
      if (typeof this.invalidated === "function") {
        return this.invalidated();
      } else if (typeof this.callback === "function") {
        return this.callback();
      } else if ((this.invalidated != null) && typeof this.invalidated.invalidate === "function") {
        return this.invalidated.invalidate();
      } else if (typeof this.invalidated === "string") {
        functName = 'invalidate' + this.invalidated.charAt(0).toUpperCase() + this.invalidated.slice(1);
        if (typeof this.scope[functName] === "function") {
          return this.scope[functName]();
        } else {
          return this.scope[this.invalidated] = null;
        }
      }
    }

    unknown() {
      var ref;
      if (typeof ((ref = this.invalidated) != null ? ref.unknown : void 0) === "function") {
        return this.invalidated.unknown();
      } else {
        return this.invalidate();
      }
    }

    addEventBind(event, target, callback) {
      return this.addBinder(new EventBind(event, target, callback));
    }

    addBinder(binder) {
      if (binder.callback == null) {
        binder.callback = this.invalidateCallback;
      }
      if (!this.invalidationEvents.some(function(eventBind) {
        return eventBind.equals(binder);
      })) {
        return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
          return eventBind.equals(binder);
        }) || binder);
      }
    }

    getUnknownCallback(prop) {
      var callback;
      callback = () => {
        return this.addUnknown(function() {
          return prop.get();
        }, prop);
      };
      callback.ref = {
        prop: prop
      };
      return callback;
    }

    addUnknown(fn, prop) {
      if (!this.findUnknown(prop)) {
        fn.ref = {
          "prop": prop
        };
        this.unknowns.push(fn);
        return this.unknown();
      }
    }

    findUnknown(prop) {
      if ((prop != null) || (typeof target !== "undefined" && target !== null)) {
        return this.unknowns.find(function(unknown) {
          return unknown.ref.prop === prop;
        });
      }
    }

    event(event, target = this.scope) {
      if (this.checkEmitter(target)) {
        return this.addEventBind(event, target);
      }
    }

    value(val, event, target = this.scope) {
      this.event(event, target);
      return val;
    }

    prop(prop, target = this.scope) {
      var propInstance;
      if (typeof prop === 'string') {
        if ((target.getPropertyInstance != null) && (propInstance = target.getPropertyInstance(prop))) {
          prop = propInstance;
        } else {
          return target[prop];
        }
      } else if (!this.checkPropInstance(prop)) {
        throw new Error('Property must be a PropertyInstance or a string');
      }
      this.addEventBind('invalidated', prop, this.getUnknownCallback(prop));
      return this.value(prop.get(), 'updated', prop);
    }

    propPath(path, target = this.scope) {
      var prop, val;
      path = path.split('.');
      val = target;
      while ((val != null) && path.length > 0) {
        prop = path.shift();
        val = this.prop(prop, val);
      }
      return val;
    }

    propInitiated(prop, target = this.scope) {
      var initiated;
      if (typeof prop === 'string' && (target.getPropertyInstance != null)) {
        prop = target.getPropertyInstance(prop);
      } else if (!this.checkPropInstance(prop)) {
        throw new Error('Property must be a PropertyInstance or a string');
      }
      initiated = prop.initiated;
      if (!initiated) {
        this.event('updated', prop);
      }
      return initiated;
    }

    funct(funct) {
      var invalidator, res;
      invalidator = new Invalidator(() => {
        return this.addUnknown(() => {
          var res2;
          res2 = funct(invalidator);
          if (res !== res2) {
            return this.invalidate();
          }
        }, invalidator);
      });
      res = funct(invalidator);
      this.invalidationEvents.push(invalidator);
      return res;
    }

    validateUnknowns() {
      var unknowns;
      unknowns = this.unknowns;
      this.unknowns = [];
      return unknowns.forEach(function(unknown) {
        return unknown();
      });
    }

    isEmpty() {
      return this.invalidationEvents.length === 0;
    }

    bind() {
      this.invalid = false;
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.bind();
      });
    }

    recycle(callback) {
      var done, res;
      this.recycled = this.invalidationEvents;
      this.invalidationEvents = [];
      done = this.endRecycle.bind(this);
      if (typeof callback === "function") {
        if (callback.length > 1) {
          return callback(this, done);
        } else {
          res = callback(this);
          done();
          return res;
        }
      } else {
        return done;
      }
    }

    endRecycle() {
      this.recycled.forEach(function(eventBind) {
        return eventBind.unbind();
      });
      return this.recycled = [];
    }

    checkEmitter(emitter) {
      return EventBind.checkEmitter(emitter, this.strict);
    }

    checkPropInstance(prop) {
      return typeof prop.get === "function" && this.checkEmitter(prop);
    }

    unbind() {
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.unbind();
      });
    }

  };

  Invalidator.strict = true;

  return Invalidator;

}).call(this);



},{"./Binder":14,"./EventBind":17}],24:[function(require,module,exports){
var Loader, Overrider;

Overrider = require('./Overrider');

module.exports = Loader = (function() {
  class Loader extends Overrider {
    constructor() {
      super();
      this.initPreloaded();
    }

    initPreloaded() {
      var defList;
      defList = this.preloaded;
      this.preloaded = [];
      return this.load(defList);
    }

    load(defList) {
      var loaded, toLoad;
      toLoad = [];
      loaded = defList.map((def) => {
        var instance;
        if (def.instance == null) {
          def = Object.assign({
            loader: this
          }, def);
          instance = Loader.load(def);
          def = Object.assign({
            instance: instance
          }, def);
          if (def.initByLoader && (instance.init != null)) {
            toLoad.push(instance);
          }
        }
        return def;
      });
      this.preloaded = this.preloaded.concat(loaded);
      return toLoad.forEach(function(instance) {
        return instance.init();
      });
    }

    preload(def) {
      if (!Array.isArray(def)) {
        def = [def];
      }
      return this.preloaded = (this.preloaded || []).concat(def);
    }

    destroyLoaded() {
      return this.preloaded.forEach(function(def) {
        var ref;
        return (ref = def.instance) != null ? typeof ref.destroy === "function" ? ref.destroy() : void 0 : void 0;
      });
    }

    getFinalProperties() {
      return super.getFinalProperties().concat(['preloaded']);
    }

    extended(target) {
      super.extended(target);
      if (this.preloaded) {
        return target.preloaded = (target.preloaded || []).concat(this.preloaded);
      }
    }

    static loadMany(def) {
      return def.map((d) => {
        return this.load(d);
      });
    }

    static load(def) {
      if (typeof def.type.copyWith === "function") {
        return def.type.copyWith(def);
      } else {
        return new def.type(def);
      }
    }

    static preload(def) {
      return this.prototype.preload(def);
    }

  };

  Loader.prototype.preloaded = [];

  Loader.overrides({
    init: function() {
      this.init.withoutLoader();
      return this.initPreloaded();
    },
    destroy: function() {
      this.destroy.withoutLoader();
      return this.destroyLoaded();
    }
  });

  return Loader;

}).call(this);



},{"./Overrider":26}],25:[function(require,module,exports){
var Mixable,
  indexOf = [].indexOf;

module.exports = Mixable = (function() {
  class Mixable {
    static extend(obj) {
      this.Extension.make(obj, this);
      if (obj.prototype != null) {
        return this.Extension.make(obj.prototype, this.prototype);
      }
    }

    static include(obj) {
      return this.Extension.make(obj, this.prototype);
    }

  };

  Mixable.Extension = {
    makeOnce: function(source, target) {
      var ref;
      if (!((ref = target.extensions) != null ? ref.includes(source) : void 0)) {
        return this.make(source, target);
      }
    },
    make: function(source, target) {
      var i, len, originalFinalProperties, prop, ref;
      ref = this.getExtensionProperties(source, target);
      for (i = 0, len = ref.length; i < len; i++) {
        prop = ref[i];
        Object.defineProperty(target, prop.name, prop);
      }
      if (source.getFinalProperties && target.getFinalProperties) {
        originalFinalProperties = target.getFinalProperties;
        target.getFinalProperties = function() {
          return source.getFinalProperties().concat(originalFinalProperties.call(this));
        };
      } else {
        target.getFinalProperties = source.getFinalProperties || target.getFinalProperties;
      }
      target.extensions = (target.extensions || []).concat([source]);
      if (typeof source.extended === 'function') {
        return source.extended(target);
      }
    },
    alwaysFinal: ['extended', 'extensions', '__super__', 'constructor', 'getFinalProperties'],
    getExtensionProperties: function(source, target) {
      var alwaysFinal, props, targetChain;
      alwaysFinal = this.alwaysFinal;
      targetChain = this.getPrototypeChain(target);
      props = [];
      this.getPrototypeChain(source).every(function(obj) {
        var exclude;
        if (!targetChain.includes(obj)) {
          exclude = alwaysFinal;
          if (source.getFinalProperties != null) {
            exclude = exclude.concat(source.getFinalProperties());
          }
          if (typeof obj === 'function') {
            exclude = exclude.concat(["length", "prototype", "name"]);
          }
          props = props.concat(Object.getOwnPropertyNames(obj).filter((key) => {
            return !target.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && !props.find(function(prop) {
              return prop.name === key;
            });
          }).map(function(key) {
            var prop;
            prop = Object.getOwnPropertyDescriptor(obj, key);
            prop.name = key;
            return prop;
          }));
          return true;
        }
      });
      return props;
    },
    getPrototypeChain: function(obj) {
      var basePrototype, chain;
      chain = [];
      basePrototype = Object.getPrototypeOf(Object);
      while (true) {
        chain.push(obj);
        if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== basePrototype)) {
          break;
        }
      }
      return chain;
    }
  };

  return Mixable;

}).call(this);



},{}],26:[function(require,module,exports){
// todo : 
//  simplified form : @withoutName method
var Overrider;

module.exports = Overrider = (function() {
  class Overrider {
    static overrides(overrides) {
      return this.Override.applyMany(this.prototype, this.name, overrides);
    }

    getFinalProperties() {
      if (this._overrides != null) {
        return ['_overrides'].concat(Object.keys(this._overrides));
      } else {
        return [];
      }
    }

    extended(target) {
      if (this._overrides != null) {
        this.constructor.Override.applyMany(target, this.constructor.name, this._overrides);
      }
      if (this.constructor === Overrider) {
        return target.extended = this.extended;
      }
    }

  };

  Overrider.Override = {
    makeMany: function(target, namespace, overrides) {
      var fn, key, override, results;
      results = [];
      for (key in overrides) {
        fn = overrides[key];
        results.push(override = this.make(target, namespace, key, fn));
      }
      return results;
    },
    applyMany: function(target, namespace, overrides) {
      var key, override, results;
      results = [];
      for (key in overrides) {
        override = overrides[key];
        if (typeof override === "function") {
          override = this.make(target, namespace, key, override);
        }
        results.push(this.apply(target, namespace, override));
      }
      return results;
    },
    make: function(target, namespace, fnName, fn) {
      var override;
      override = {
        fn: {
          current: fn
        },
        name: fnName
      };
      override.fn['with' + namespace] = fn;
      return override;
    },
    emptyFn: function() {},
    apply: function(target, namespace, override) {
      var fnName, overrides, ref, ref1, without;
      fnName = override.name;
      overrides = target._overrides != null ? Object.assign({}, target._overrides) : {};
      without = ((ref = target._overrides) != null ? (ref1 = ref[fnName]) != null ? ref1.fn.current : void 0 : void 0) || target[fnName];
      override = Object.assign({}, override);
      if (overrides[fnName] != null) {
        override.fn = Object.assign({}, overrides[fnName].fn, override.fn);
      } else {
        override.fn = Object.assign({}, override.fn);
      }
      override.fn['without' + namespace] = without || this.emptyFn;
      if (without == null) {
        override.missingWithout = 'without' + namespace;
      } else if (override.missingWithout) {
        override.fn[override.missingWithout] = without;
      }
      Object.defineProperty(target, fnName, {
        configurable: true,
        get: function() {
          var finalFn, fn, key, ref2;
          finalFn = override.fn.current.bind(this);
          ref2 = override.fn;
          for (key in ref2) {
            fn = ref2[key];
            finalFn[key] = fn.bind(this);
          }
          if (this.constructor.prototype !== this) {
            Object.defineProperty(this, fnName, {
              value: finalFn
            });
          }
          return finalFn;
        }
      });
      overrides[fnName] = override;
      return target._overrides = overrides;
    }
  };

  return Overrider;

}).call(this);



},{}],27:[function(require,module,exports){
var BasicProperty, CalculatedProperty, CollectionProperty, ComposedProperty, DynamicProperty, InvalidatedProperty, Mixable, Property, PropertyOwner;

BasicProperty = require('./PropertyTypes/BasicProperty');

CollectionProperty = require('./PropertyTypes/CollectionProperty');

ComposedProperty = require('./PropertyTypes/ComposedProperty');

DynamicProperty = require('./PropertyTypes/DynamicProperty');

CalculatedProperty = require('./PropertyTypes/CalculatedProperty');

InvalidatedProperty = require('./PropertyTypes/InvalidatedProperty');

PropertyOwner = require('./PropertyOwner');

Mixable = require('./Mixable');

module.exports = Property = (function() {
  class Property {
    constructor(name, options = {}) {
      this.name = name;
      this.options = options;
    }

    bind(target) {
      var parent, prop;
      prop = this;
      if (!(typeof target.getProperty === 'function' && target.getProperty(this.name) === this)) {
        if (typeof target.getProperty === 'function' && ((parent = target.getProperty(this.name)) != null)) {
          this.override(parent);
        }
        this.getInstanceType().bind(target, prop);
        target._properties = (target._properties || []).concat([prop]);
        if (parent != null) {
          target._properties = target._properties.filter(function(existing) {
            return existing !== parent;
          });
        }
        this.makeOwner(target);
      }
      return prop;
    }

    override(parent) {
      var key, ref, results, value;
      if (this.options.parent == null) {
        this.options.parent = parent.options;
        ref = parent.options;
        results = [];
        for (key in ref) {
          value = ref[key];
          if (typeof this.options[key] === 'function' && typeof value === 'function') {
            results.push(this.options[key].overrided = value);
          } else if (typeof this.options[key] === 'undefined') {
            results.push(this.options[key] = value);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    }

    makeOwner(target) {
      var ref;
      if (!((ref = target.extensions) != null ? ref.includes(PropertyOwner.prototype) : void 0)) {
        return Mixable.Extension.make(PropertyOwner.prototype, target);
      }
    }

    getInstanceVarName() {
      return this.options.instanceVarName || '_' + this.name;
    }

    isInstantiated(obj) {
      return obj[this.getInstanceVarName()] != null;
    }

    getInstance(obj) {
      var Type, varName;
      varName = this.getInstanceVarName();
      if (!this.isInstantiated(obj)) {
        Type = this.getInstanceType();
        obj[varName] = new Type(this, obj);
        obj[varName].init();
      }
      return obj[varName];
    }

    getInstanceType() {
      if (!this.instanceType) {
        this.composers.forEach((composer) => {
          return composer.compose(this);
        });
      }
      return this.instanceType;
    }

  };

  Property.prototype.composers = [ComposedProperty, CollectionProperty, DynamicProperty, BasicProperty, CalculatedProperty, InvalidatedProperty];

  return Property;

}).call(this);



},{"./Mixable":25,"./PropertyOwner":28,"./PropertyTypes/BasicProperty":29,"./PropertyTypes/CalculatedProperty":30,"./PropertyTypes/CollectionProperty":31,"./PropertyTypes/ComposedProperty":32,"./PropertyTypes/DynamicProperty":33,"./PropertyTypes/InvalidatedProperty":34}],28:[function(require,module,exports){
var PropertyOwner;

module.exports = PropertyOwner = class PropertyOwner {
  getProperty(name) {
    return this._properties && this._properties.find(function(prop) {
      return prop.name === name;
    });
  }

  getPropertyInstance(name) {
    var res;
    res = this.getProperty(name);
    if (res) {
      return res.getInstance(this);
    }
  }

  getProperties() {
    return this._properties.slice();
  }

  getPropertyInstances() {
    return this._properties.map((prop) => {
      return prop.getInstance(this);
    });
  }

  getInstantiatedProperties() {
    return this._properties.filter((prop) => {
      return prop.isInstantiated(this);
    }).map((prop) => {
      return prop.getInstance(this);
    });
  }

  getManualDataProperties() {
    return this._properties.reduce((res, prop) => {
      var instance;
      if (prop.isInstantiated(this)) {
        instance = prop.getInstance(this);
        if (instance.calculated && instance.manual) {
          res[prop.name] = instance.value;
        }
      }
      return res;
    }, {});
  }

  setProperties(data, options = {}) {
    var key, prop, val;
    for (key in data) {
      val = data[key];
      if (((options.whitelist == null) || options.whitelist.indexOf(key) !== -1) && ((options.blacklist == null) || options.blacklist.indexOf(key) === -1)) {
        prop = this.getPropertyInstance(key);
        if (prop != null) {
          prop.set(val);
        }
      }
    }
    return this;
  }

  destroyProperties() {
    this.getInstantiatedProperties().forEach((prop) => {
      return prop.destroy();
    });
    this._properties = [];
    return true;
  }

  listenerAdded(event, listener) {
    return this._properties.forEach((prop) => {
      if (prop.getInstanceType().prototype.changeEventName === event) {
        return prop.getInstance(this).get();
      }
    });
  }

  extended(target) {
    return target.listenerAdded = this.listenerAdded;
  }

};



},{}],29:[function(require,module,exports){
var BasicProperty, EventEmitter, Loader, Mixable, PropertyWatcher, Referred;

Mixable = require('../Mixable');

EventEmitter = require('../EventEmitter');

Loader = require('../Loader');

PropertyWatcher = require('../Invalidated/PropertyWatcher');

Referred = require('../Referred');

module.exports = BasicProperty = (function() {
  class BasicProperty extends Mixable {
    constructor(property, obj) {
      super();
      this.property = property;
      this.obj = obj;
    }

    init() {
      var preload;
      this.value = this.ingest(this.default);
      this.calculated = false;
      this.initiated = false;
      preload = this.constructor.getPreload(this.obj, this.property, this);
      if (preload.length > 0) {
        return Loader.loadMany(preload);
      }
    }

    get() {
      this.calculated = true;
      if (!this.initiated) {
        this.initiated = true;
        this.emitEvent('updated');
      }
      return this.output();
    }

    set(val) {
      return this.setAndCheckChanges(val);
    }

    callbackSet(val) {
      this.callOptionFunct("set", val);
      return this;
    }

    setAndCheckChanges(val) {
      var old;
      val = this.ingest(val);
      this.revalidated();
      if (this.checkChanges(val, this.value)) {
        old = this.value;
        this.value = val;
        this.manual = true;
        this.changed(old);
      }
      return this;
    }

    checkChanges(val, old) {
      return val !== old;
    }

    destroy() {
      var ref;
      if (this.property.options.destroy === true && (((ref = this.value) != null ? ref.destroy : void 0) != null)) {
        this.value.destroy();
      }
      if (typeof this.property.options.destroy === 'function') {
        this.callOptionFunct('destroy', this.value);
      }
      return this.value = null;
    }

    callOptionFunct(funct, ...args) {
      if (typeof funct === 'string') {
        funct = this.property.options[funct];
      }
      if (typeof funct.overrided === 'function') {
        args.push((...args) => {
          return this.callOptionFunct(funct.overrided, ...args);
        });
      }
      return funct.apply(this.obj, args);
    }

    revalidated() {
      this.calculated = true;
      return this.initiated = true;
    }

    ingest(val) {
      if (typeof this.property.options.ingest === 'function') {
        return val = this.callOptionFunct("ingest", val);
      } else {
        return val;
      }
    }

    output() {
      if (typeof this.property.options.output === 'function') {
        return this.callOptionFunct("output", this.value);
      } else {
        return this.value;
      }
    }

    changed(old) {
      this.emitEvent('updated', old);
      this.emitEvent('changed', old);
      return this;
    }

    static compose(prop) {
      if (prop.instanceType == null) {
        prop.instanceType = class extends BasicProperty {};
      }
      if (typeof prop.options.set === 'function') {
        prop.instanceType.prototype.set = this.prototype.callbackSet;
      } else {
        prop.instanceType.prototype.set = this.prototype.setAndCheckChanges;
      }
      return prop.instanceType.prototype.default = prop.options.default;
    }

    static bind(target, prop) {
      var maj, opt, preload;
      maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
      opt = {
        configurable: true,
        get: function() {
          return prop.getInstance(this).get();
        }
      };
      if (prop.options.set !== false) {
        opt.set = function(val) {
          return prop.getInstance(this).set(val);
        };
      }
      Object.defineProperty(target, prop.name, opt);
      target['get' + maj] = function() {
        return prop.getInstance(this).get();
      };
      if (prop.options.set !== false) {
        target['set' + maj] = function(val) {
          prop.getInstance(this).set(val);
          return this;
        };
      }
      target['invalidate' + maj] = function() {
        prop.getInstance(this).invalidate();
        return this;
      };
      preload = this.getPreload(target, prop);
      if (preload.length > 0) {
        Mixable.Extension.makeOnce(Loader.prototype, target);
        return target.preload(preload);
      }
    }

    static getPreload(target, prop, instance) {
      var preload, ref, ref1, toLoad;
      preload = [];
      if (typeof prop.options.change === "function") {
        toLoad = {
          type: PropertyWatcher,
          loaderAsScope: true,
          property: instance || prop.name,
          initByLoader: true,
          autoBind: true,
          callback: prop.options.change,
          ref: {
            prop: prop.name,
            callback: prop.options.change,
            context: 'change'
          }
        };
      }
      if (typeof ((ref = prop.options.change) != null ? ref.copyWith : void 0) === "function") {
        toLoad = {
          type: prop.options.change,
          loaderAsScope: true,
          property: instance || prop.name,
          initByLoader: true,
          autoBind: true,
          ref: {
            prop: prop.name,
            type: prop.options.change,
            context: 'change'
          }
        };
      }
      if ((toLoad != null) && !((ref1 = target.preloaded) != null ? ref1.find(function(loaded) {
        return Referred.compareRef(toLoad.ref, loaded.ref) && !instance || (loaded.instance != null);
      }) : void 0)) {
        preload.push(toLoad);
      }
      return preload;
    }

  };

  BasicProperty.extend(EventEmitter);

  return BasicProperty;

}).call(this);



},{"../EventEmitter":18,"../Invalidated/PropertyWatcher":22,"../Loader":24,"../Mixable":25,"../Referred":35}],30:[function(require,module,exports){
var CalculatedProperty, DynamicProperty, Invalidator, Overrider;

Invalidator = require('../Invalidator');

DynamicProperty = require('./DynamicProperty');

Overrider = require('../Overrider');

module.exports = CalculatedProperty = (function() {
  class CalculatedProperty extends DynamicProperty {
    calcul() {
      this.value = this.callOptionFunct(this.calculFunct);
      this.manual = false;
      this.revalidated();
      return this.value;
    }

    static compose(prop) {
      if (typeof prop.options.calcul === 'function') {
        prop.instanceType.prototype.calculFunct = prop.options.calcul;
        if (!(prop.options.calcul.length > 0)) {
          return prop.instanceType.extend(CalculatedProperty);
        }
      }
    }

  };

  CalculatedProperty.extend(Overrider);

  CalculatedProperty.overrides({
    get: function() {
      var initiated, old;
      if (this.invalidator) {
        this.invalidator.validateUnknowns();
      }
      if (!this.calculated) {
        old = this.value;
        initiated = this.initiated;
        this.calcul();
        if (this.checkChanges(this.value, old)) {
          if (initiated) {
            this.changed(old);
          } else {
            this.emitEvent('updated', old);
          }
        } else if (!initiated) {
          this.emitEvent('updated', old);
        }
      }
      return this.output();
    }
  });

  return CalculatedProperty;

}).call(this);



},{"../Invalidator":23,"../Overrider":26,"./DynamicProperty":33}],31:[function(require,module,exports){
var Collection, CollectionProperty, CollectionPropertyWatcher, DynamicProperty, Referred;

DynamicProperty = require('./DynamicProperty');

Collection = require('../Collection');

Referred = require('../Referred');

CollectionPropertyWatcher = require('../Invalidated/CollectionPropertyWatcher');

module.exports = CollectionProperty = (function() {
  class CollectionProperty extends DynamicProperty {
    ingest(val) {
      if (typeof this.property.options.ingest === 'function') {
        val = this.callOptionFunct("ingest", val);
      }
      if (val == null) {
        return [];
      } else if (typeof val.toArray === 'function') {
        return val.toArray();
      } else if (Array.isArray(val)) {
        return val.slice();
      } else {
        return [val];
      }
    }

    checkChangedItems(val, old) {
      var compareFunction;
      if (typeof this.collectionOptions.compare === 'function') {
        compareFunction = this.collectionOptions.compare;
      }
      return (new Collection(val)).checkChanges(old, this.collectionOptions.ordered, compareFunction);
    }

    output() {
      var col, prop, value;
      value = this.value;
      if (typeof this.property.options.output === 'function') {
        value = this.callOptionFunct("output", this.value);
      }
      prop = this;
      col = Collection.newSubClass(this.collectionOptions, value);
      col.changed = function(old) {
        return prop.changed(old);
      };
      return col;
    }

    static compose(prop) {
      if (prop.options.collection != null) {
        prop.instanceType = class extends CollectionProperty {};
        prop.instanceType.prototype.collectionOptions = Object.assign({}, this.defaultCollectionOptions, typeof prop.options.collection === 'object' ? prop.options.collection : {});
        if (prop.options.collection.compare != null) {
          return prop.instanceType.prototype.checkChanges = this.prototype.checkChangedItems;
        }
      }
    }

    static getPreload(target, prop, instance) {
      var preload, ref, ref1;
      preload = [];
      if (typeof prop.options.change === "function" || typeof prop.options.itemAdded === 'function' || typeof prop.options.itemRemoved === 'function') {
        ref = {
          prop: prop.name,
          context: 'change'
        };
        if (!((ref1 = target.preloaded) != null ? ref1.find(function(loaded) {
          return Referred.compareRef(ref, loaded.ref) && (loaded.instance != null);
        }) : void 0)) {
          preload.push({
            type: CollectionPropertyWatcher,
            loaderAsScope: true,
            scope: target,
            property: instance || prop.name,
            initByLoader: true,
            autoBind: true,
            callback: prop.options.change,
            onAdded: prop.options.itemAdded,
            onRemoved: prop.options.itemRemoved,
            ref: ref
          });
        }
      }
      return preload;
    }

  };

  CollectionProperty.defaultCollectionOptions = {
    compare: false,
    ordered: true
  };

  return CollectionProperty;

}).call(this);



},{"../Collection":15,"../Invalidated/CollectionPropertyWatcher":20,"../Referred":35,"./DynamicProperty":33}],32:[function(require,module,exports){
var CalculatedProperty, Collection, ComposedProperty, Invalidator;

CalculatedProperty = require('./CalculatedProperty');

Invalidator = require('../Invalidator');

Collection = require('../Collection');

module.exports = ComposedProperty = (function() {
  class ComposedProperty extends CalculatedProperty {
    init() {
      this.initComposed();
      return super.init();
    }

    initComposed() {
      if (this.property.options.hasOwnProperty('default')) {
        this.default = this.property.options.default;
      } else {
        this.default = this.value = true;
      }
      this.members = new ComposedProperty.Members(this.property.options.members);
      this.members.changed = (old) => {
        return this.invalidate();
      };
      return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options.default === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
    }

    calcul() {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this, this.obj);
      }
      this.invalidator.recycle((invalidator, done) => {
        this.value = this.members.reduce((prev, member) => {
          var val;
          val = typeof member === 'function' ? member(this.invalidator) : member;
          return this.join(prev, val);
        }, this.default);
        done();
        if (invalidator.isEmpty()) {
          return this.invalidator = null;
        } else {
          return invalidator.bind();
        }
      });
      this.revalidated();
      return this.value;
    }

    static compose(prop) {
      if (prop.options.composed != null) {
        return prop.instanceType = class extends ComposedProperty {};
      }
    }

    static bind(target, prop) {
      CalculatedProperty.bind(target, prop);
      return Object.defineProperty(target, prop.name + 'Members', {
        configurable: true,
        get: function() {
          return prop.getInstance(this).members;
        }
      });
    }

  };

  ComposedProperty.joinFunctions = {
    and: function(a, b) {
      return a && b;
    },
    or: function(a, b) {
      return a || b;
    }
  };

  return ComposedProperty;

}).call(this);

ComposedProperty.Members = class Members extends Collection {
  addPropertyRef(name, obj) {
    var fn;
    if (this.findRefIndex(name, obj) === -1) {
      fn = function(invalidator) {
        return invalidator.prop(name, obj);
      };
      fn.ref = {
        name: name,
        obj: obj
      };
      return this.push(fn);
    }
  }

  addValueRef(val, name, obj) {
    var fn;
    if (this.findRefIndex(name, obj) === -1) {
      fn = function(invalidator) {
        return val;
      };
      fn.ref = {
        name: name,
        obj: obj,
        val: val
      };
      return this.push(fn);
    }
  }

  setValueRef(val, name, obj) {
    var fn, i, ref;
    i = this.findRefIndex(name, obj);
    if (i === -1) {
      return this.addValueRef(val, name, obj);
    } else if (this.get(i).ref.val !== val) {
      ref = {
        name: name,
        obj: obj,
        val: val
      };
      fn = function(invalidator) {
        return val;
      };
      fn.ref = ref;
      return this.set(i, fn);
    }
  }

  getValueRef(name, obj) {
    return this.findByRef(name, obj).ref.val;
  }

  addFunctionRef(fn, name, obj) {
    if (this.findRefIndex(name, obj) === -1) {
      fn.ref = {
        name: name,
        obj: obj
      };
      return this.push(fn);
    }
  }

  findByRef(name, obj) {
    return this._array[this.findRefIndex(name, obj)];
  }

  findRefIndex(name, obj) {
    return this._array.findIndex(function(member) {
      return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
    });
  }

  removeRef(name, obj) {
    var index, old;
    index = this.findRefIndex(name, obj);
    if (index !== -1) {
      old = this.toArray();
      this._array.splice(index, 1);
      return this.changed(old);
    }
  }

};



},{"../Collection":15,"../Invalidator":23,"./CalculatedProperty":30}],33:[function(require,module,exports){
var BasicProperty, DynamicProperty, Invalidator;

Invalidator = require('../Invalidator');

BasicProperty = require('./BasicProperty');

module.exports = DynamicProperty = class DynamicProperty extends BasicProperty {
  callbackGet() {
    var res;
    res = this.callOptionFunct("get");
    this.revalidated();
    return res;
  }

  invalidate() {
    if (this.calculated) {
      this.calculated = false;
      this._invalidateNotice();
    }
    return this;
  }

  _invalidateNotice() {
    this.emitEvent('invalidated');
    return true;
  }

  static compose(prop) {
    if (typeof prop.options.get === 'function' || typeof prop.options.calcul === 'function') {
      if (prop.instanceType == null) {
        prop.instanceType = class extends DynamicProperty {};
      }
    }
    if (typeof prop.options.get === 'function') {
      return prop.instanceType.prototype.get = this.prototype.callbackGet;
    }
  }

};



},{"../Invalidator":23,"./BasicProperty":29}],34:[function(require,module,exports){
var CalculatedProperty, InvalidatedProperty, Invalidator;

Invalidator = require('../Invalidator');

CalculatedProperty = require('./CalculatedProperty');

module.exports = InvalidatedProperty = (function() {
  class InvalidatedProperty extends CalculatedProperty {
    unknown() {
      if (this.calculated || this.active === false) {
        this._invalidateNotice();
      }
      return this;
    }

    static compose(prop) {
      if (typeof prop.options.calcul === 'function' && prop.options.calcul.length > 0) {
        return prop.instanceType.extend(InvalidatedProperty);
      }
    }

  };

  InvalidatedProperty.overrides({
    calcul: function() {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this, this.obj);
      }
      this.invalidator.recycle((invalidator, done) => {
        this.value = this.callOptionFunct(this.calculFunct, invalidator);
        this.manual = false;
        done();
        if (invalidator.isEmpty()) {
          return this.invalidator = null;
        } else {
          return invalidator.bind();
        }
      });
      this.revalidated();
      return this.value;
    },
    destroy: function() {
      this.destroy.withoutInvalidatedProperty();
      if (this.invalidator != null) {
        return this.invalidator.unbind();
      }
    },
    invalidate: function() {
      if (this.calculated || this.active === false) {
        this.calculated = false;
        this._invalidateNotice();
        if (!this.calculated && (this.invalidator != null)) {
          this.invalidator.unbind();
        }
      }
      return this;
    }
  });

  return InvalidatedProperty;

}).call(this);



},{"../Invalidator":23,"./CalculatedProperty":30}],35:[function(require,module,exports){
var Referred;

module.exports = Referred = (function() {
  class Referred {
    compareRefered(refered) {
      return this.constructor.compareRefered(refered, this);
    }

    getRef() {}

    static compareRefered(obj1, obj2) {
      return obj1 === obj2 || ((obj1 != null) && (obj2 != null) && obj1.constructor === obj2.constructor && this.compareRef(obj1.ref, obj2.ref));
    }

    static compareRef(ref1, ref2) {
      return (ref1 != null) && (ref2 != null) && (ref1 === ref2 || (Array.isArray(ref1) && Array.isArray(ref1) && ref1.every((val, i) => {
        return this.compareRefered(ref1[i], ref2[i]);
      })) || (typeof ref1 === "object" && typeof ref2 === "object" && Object.keys(ref1).join() === Object.keys(ref2).join() && Object.keys(ref1).every((key) => {
        return this.compareRefered(ref1[key], ref2[key]);
      })));
    }

  };

  Object.defineProperty(Referred.prototype, 'ref', {
    get: function() {
      return this.getRef();
    }
  });

  return Referred;

}).call(this);



},{}],36:[function(require,module,exports){
var Binder, Updater;

Binder = require('./Binder');

module.exports = Updater = class Updater {
  constructor(options) {
    var ref;
    this.callbacks = [];
    this.next = [];
    this.updating = false;
    if ((options != null ? options.callback : void 0) != null) {
      this.addCallback(options.callback);
    }
    if ((options != null ? (ref = options.callbacks) != null ? ref.forEach : void 0 : void 0) != null) {
      options.callbacks.forEach((callback) => {
        return this.addCallback(callback);
      });
    }
  }

  update() {
    var callback;
    this.updating = true;
    this.next = this.callbacks.slice();
    while (this.callbacks.length > 0) {
      callback = this.callbacks.shift();
      this.runCallback(callback);
    }
    this.callbacks = this.next;
    this.updating = false;
    return this;
  }

  runCallback(callback) {
    return callback();
  }

  addCallback(callback) {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
    if (this.updating && !this.next.includes(callback)) {
      return this.next.push(callback);
    }
  }

  nextTick(callback) {
    if (this.updating) {
      if (!this.next.includes(callback)) {
        return this.next.push(callback);
      }
    } else {
      return this.addCallback(callback);
    }
  }

  removeCallback(callback) {
    var index;
    index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
    index = this.next.indexOf(callback);
    if (index !== -1) {
      return this.next.splice(index, 1);
    }
  }

  getBinder() {
    return new Updater.Binder(this);
  }

  destroy() {
    this.callbacks = [];
    return this.next = [];
  }

};

Updater.Binder = (function(superClass) {
  class Binder extends superClass {
    constructor(target, callback1) {
      super();
      this.target = target;
      this.callback = callback1;
    }

    getRef() {
      return {
        target: this.target,
        callback: this.callback
      };
    }

    doBind() {
      return this.target.addCallback(this.callback);
    }

    doUnbind() {
      return this.target.removeCallback(this.callback);
    }

  };

  return Binder;

}).call(this, Binder);



},{"./Binder":14}],37:[function(require,module,exports){
module.exports = {
  "Binder": require("./Binder"),
  "Collection": require("./Collection"),
  "Element": require("./Element"),
  "EventBind": require("./EventBind"),
  "EventEmitter": require("./EventEmitter"),
  "Invalidator": require("./Invalidator"),
  "Loader": require("./Loader"),
  "Mixable": require("./Mixable"),
  "Overrider": require("./Overrider"),
  "Property": require("./Property"),
  "PropertyOwner": require("./PropertyOwner"),
  "Referred": require("./Referred"),
  "Updater": require("./Updater"),
  "Invalidated": {
    "ActivablePropertyWatcher": require("./Invalidated/ActivablePropertyWatcher"),
    "CollectionPropertyWatcher": require("./Invalidated/CollectionPropertyWatcher"),
    "Invalidated": require("./Invalidated/Invalidated"),
    "PropertyWatcher": require("./Invalidated/PropertyWatcher"),
  },
  "PropertyTypes": {
    "BasicProperty": require("./PropertyTypes/BasicProperty"),
    "CalculatedProperty": require("./PropertyTypes/CalculatedProperty"),
    "CollectionProperty": require("./PropertyTypes/CollectionProperty"),
    "ComposedProperty": require("./PropertyTypes/ComposedProperty"),
    "DynamicProperty": require("./PropertyTypes/DynamicProperty"),
    "InvalidatedProperty": require("./PropertyTypes/InvalidatedProperty"),
  },
}
},{"./Binder":14,"./Collection":15,"./Element":16,"./EventBind":17,"./EventEmitter":18,"./Invalidated/ActivablePropertyWatcher":19,"./Invalidated/CollectionPropertyWatcher":20,"./Invalidated/Invalidated":21,"./Invalidated/PropertyWatcher":22,"./Invalidator":23,"./Loader":24,"./Mixable":25,"./Overrider":26,"./Property":27,"./PropertyOwner":28,"./PropertyTypes/BasicProperty":29,"./PropertyTypes/CalculatedProperty":30,"./PropertyTypes/CollectionProperty":31,"./PropertyTypes/ComposedProperty":32,"./PropertyTypes/DynamicProperty":33,"./PropertyTypes/InvalidatedProperty":34,"./Referred":35,"./Updater":36}],38:[function(require,module,exports){
var AutomaticDoor, Character, Door;

Door = require('./Door');

Character = require('./Character');

module.exports = AutomaticDoor = (function() {
  class AutomaticDoor extends Door {
    updateTileMembers(old) {
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
    }

    init() {
      super.init();
      return this.open;
    }

    isActivatorPresent(invalidate) {
      return this.getReactiveTiles(invalidate).some((tile) => {
        var children;
        children = invalidate ? invalidate.prop('children', tile) : tile.children;
        return children.some((child) => {
          return this.canBeActivatedBy(child);
        });
      });
    }

    canBeActivatedBy(elem) {
      return elem instanceof Character;
    }

    getReactiveTiles(invalidate) {
      var direction, tile;
      tile = invalidate ? invalidate.prop('tile') : this.tile;
      if (!tile) {
        return [];
      }
      direction = invalidate ? invalidate.prop('direction') : this.direction;
      if (direction === Door.directions.horizontal) {
        return [tile, tile.getRelativeTile(0, 1), tile.getRelativeTile(0, -1)].filter(function(t) {
          return t != null;
        });
      } else {
        return [tile, tile.getRelativeTile(1, 0), tile.getRelativeTile(-1, 0)].filter(function(t) {
          return t != null;
        });
      }
    }

  };

  AutomaticDoor.properties({
    open: {
      calcul: function(invalidate) {
        return !invalidate.prop('locked') && this.isActivatorPresent(invalidate);
      }
    },
    locked: {
      default: false
    },
    unlocked: {
      calcul: function(invalidate) {
        return !invalidate.prop('locked');
      }
    }
  });

  return AutomaticDoor;

}).call(this);



},{"./Character":39,"./Door":43}],39:[function(require,module,exports){
var Character, Damageable, Tiled, WalkAction;

Tiled = require('parallelio-tiles').Tiled;

Damageable = require('./Damageable');

WalkAction = require('./actions/WalkAction');

module.exports = Character = (function() {
  class Character extends Tiled {
    constructor(name) {
      super();
      this.name = name;
    }

    setDefaults() {
      if (!this.tile && (this.game.mainTileContainer != null)) {
        return this.putOnRandomTile(this.game.mainTileContainer.tiles);
      }
    }

    canGoOnTile(tile) {
      return (tile != null ? tile.walkable : void 0) !== false;
    }

    walkTo(tile) {
      var action;
      action = new WalkAction({
        actor: this,
        target: tile
      });
      action.execute();
      return action;
    }

    isSelectableBy(player) {
      return true;
    }

  };

  Character.extend(Damageable);

  Character.properties({
    game: {
      change: function(old) {
        if (this.game) {
          return this.setDefaults();
        }
      }
    },
    offsetX: {
      default: 0.5
    },
    offsetY: {
      default: 0.5
    },
    defaultAction: {
      calcul: function() {
        return new WalkAction({
          actor: this
        });
      }
    },
    availableActions: {
      collection: true,
      calcul: function(invalidator) {
        var tile;
        tile = invalidator.prop("tile");
        if (tile) {
          return invalidator.prop("providedActions", tile);
        } else {
          return [];
        }
      }
    }
  });

  return Character;

}).call(this);



},{"./Damageable":42,"./actions/WalkAction":67,"parallelio-tiles":123}],40:[function(require,module,exports){
var AttackMoveAction, CharacterAI, Door, PropertyWatcher, TileContainer, VisionCalculator, WalkAction;

TileContainer = require('parallelio-tiles').TileContainer;

VisionCalculator = require('./VisionCalculator');

Door = require('./Door');

WalkAction = require('./actions/WalkAction');

AttackMoveAction = require('./actions/AttackMoveAction');

PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher;

module.exports = CharacterAI = class CharacterAI {
  constructor(character) {
    this.character = character;
    this.nextActionCallback = () => {
      return this.nextAction();
    };
    this.visionMemory = new TileContainer();
    this.tileWatcher = new PropertyWatcher({
      callback: () => {
        return this.updateVisionMemory();
      },
      property: this.character.getPropertyInstance('tile')
    });
  }

  start() {
    this.tileWatcher.bind();
    return this.nextAction();
  }

  nextAction() {
    var ennemy, unexplored;
    this.updateVisionMemory();
    if (ennemy = this.getClosestEnemy()) {
      return this.attackMoveTo(ennemy).on('end', nextActionCallback);
    } else if (unexplored = this.getClosestUnexplored()) {
      return this.walkTo(unexplored).on('end', nextActionCallback);
    } else {
      this.resetVisionMemory();
      return this.walkTo(this.getClosestUnexplored()).on('end', nextActionCallback);
    }
  }

  updateVisionMemory() {
    var calculator;
    calculator = new VisionCalculator(this.character.tile);
    calculator.calcul();
    return this.visionMemory = calculator.toContainer().merge(this.visionMemory, (a, b) => {
      if (a != null) {
        a = this.analyzeTile(a);
      }
      if ((a != null) && (b != null)) {
        a.visibility = Math.max(a.visibility, b.visibility);
        return a;
      } else {
        return a || b;
      }
    });
  }

  analyzeTile(tile) {
    var ref;
    tile.ennemySpotted = (ref = tile.getFinalTile().children) != null ? ref.find((c) => {
      return this.isEnnemy(c);
    }) : void 0;
    tile.explorable = this.isExplorable(tile);
    return tile;
  }

  isEnnemy(elem) {
    var ref;
    return (ref = this.character.owner) != null ? typeof ref.isEnemy === "function" ? ref.isEnemy(elem) : void 0 : void 0;
  }

  getClosestEnemy() {
    return this.visionMemory.closest(this.character.tile, (t) => {
      return t.ennemySpotted;
    });
  }

  getClosestUnexplored() {
    return this.visionMemory.closest(this.character.tile, (t) => {
      return t.visibility < 1 && t.explorable;
    });
  }

  isExplorable(tile) {
    var ref;
    tile = tile.getFinalTile();
    return tile.walkable || ((ref = tile.children) != null ? ref.find((c) => {
      return c instanceof Door;
    }) : void 0);
  }

  attackMoveTo(tile) {
    var action;
    tile = tile.getFinalTile();
    action = new AttackMoveAction({
      actor: this.character,
      target: tile
    });
    if (action.isReady()) {
      action.execute();
      return action;
    }
  }

  walkTo(tile) {
    var action;
    tile = tile.getFinalTile();
    action = new WalkAction({
      actor: this.character,
      target: tile
    });
    if (action.isReady()) {
      action.execute();
      return action;
    }
  }

};



},{"./Door":43,"./VisionCalculator":59,"./actions/AttackMoveAction":63,"./actions/WalkAction":67,"parallelio-tiles":123,"spark-starter":169}],41:[function(require,module,exports){
var DamagePropagation, Direction, Element, LineOfSight;

Element = require('spark-starter').Element;

LineOfSight = require('./LineOfSight');

Direction = require('parallelio-tiles').Direction;

module.exports = DamagePropagation = (function() {
  class DamagePropagation extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    getTileContainer() {
      return this.tile.container;
    }

    apply() {
      var damage, i, len, ref, results;
      ref = this.getDamaged();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        damage = ref[i];
        results.push(damage.target.damage(damage.damage));
      }
      return results;
    }

    getInitialTiles() {
      var ctn;
      ctn = this.getTileContainer();
      return ctn.inRange(this.tile, this.range);
    }

    getInitialDamages() {
      var damages, dmg, i, len, tile, tiles;
      damages = [];
      tiles = this.getInitialTiles();
      for (i = 0, len = tiles.length; i < len; i++) {
        tile = tiles[i];
        if (tile.damageable && (dmg = this.initialDamage(tile, tiles.length))) {
          damages.push(dmg);
        }
      }
      return damages;
    }

    getDamaged() {
      var added;
      if (this._damaged == null) {
        added = null;
        while (added = this.step(added)) {
          true;
        }
      }
      return this._damaged;
    }

    step(added) {
      if (added != null) {
        if (this.extendedDamage != null) {
          added = this.extend(added);
          this._damaged = added.concat(this._damaged);
          return added.length > 0 && added;
        }
      } else {
        return this._damaged = this.getInitialDamages();
      }
    }

    inDamaged(target, damaged) {
      var damage, i, index, len;
      for (index = i = 0, len = damaged.length; i < len; index = ++i) {
        damage = damaged[index];
        if (damage.target === target) {
          return index;
        }
      }
      return false;
    }

    extend(damaged) {
      var added, ctn, damage, dir, dmg, existing, i, j, k, len, len1, len2, local, ref, target, tile;
      ctn = this.getTileContainer();
      added = [];
      for (i = 0, len = damaged.length; i < len; i++) {
        damage = damaged[i];
        local = [];
        if (damage.target.x != null) {
          ref = Direction.adjacents;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            dir = ref[j];
            tile = ctn.getTile(damage.target.x + dir.x, damage.target.y + dir.y);
            if ((tile != null) && tile.damageable && this.inDamaged(tile, this._damaged) === false) {
              local.push(tile);
            }
          }
        }
        for (k = 0, len2 = local.length; k < len2; k++) {
          target = local[k];
          if (dmg = this.extendedDamage(target, damage, local.length)) {
            if ((existing = this.inDamaged(target, added)) === false) {
              added.push(dmg);
            } else {
              added[existing] = this.mergeDamage(added[existing], dmg);
            }
          }
        }
      }
      return added;
    }

    mergeDamage(d1, d2) {
      return {
        target: d1.target,
        power: d1.power + d2.power,
        damage: d1.damage + d2.damage
      };
    }

    modifyDamage(target, power) {
      if (typeof target.modifyDamage === 'function') {
        return Math.floor(target.modifyDamage(power, this.type));
      } else {
        return Math.floor(power);
      }
    }

  };

  DamagePropagation.properties({
    tile: {
      default: null
    },
    power: {
      default: 10
    },
    range: {
      default: 1
    },
    type: {
      default: null
    }
  });

  return DamagePropagation;

}).call(this);

DamagePropagation.Normal = class Normal extends DamagePropagation {
  initialDamage(target, nb) {
    var dmg;
    dmg = this.modifyDamage(target, this.power);
    if (dmg > 0) {
      return {
        target: target,
        power: this.power,
        damage: dmg
      };
    }
  }

};

DamagePropagation.Thermic = class Thermic extends DamagePropagation {
  extendedDamage(target, last, nb) {
    var dmg, power;
    power = (last.damage - 1) / 2 / nb * Math.min(1, last.target.health / last.target.maxHealth * 5);
    dmg = this.modifyDamage(target, power);
    if (dmg > 0) {
      return {
        target: target,
        power: power,
        damage: dmg
      };
    }
  }

  initialDamage(target, nb) {
    var dmg, power;
    power = this.power / nb;
    dmg = this.modifyDamage(target, power);
    if (dmg > 0) {
      return {
        target: target,
        power: power,
        damage: dmg
      };
    }
  }

};

DamagePropagation.Kinetic = class Kinetic extends DamagePropagation {
  extendedDamage(target, last, nb) {
    var dmg, power;
    power = (last.power - last.damage) * Math.min(1, last.target.health / last.target.maxHealth * 2) - 1;
    dmg = this.modifyDamage(target, power);
    if (dmg > 0) {
      return {
        target: target,
        power: power,
        damage: dmg
      };
    }
  }

  initialDamage(target, nb) {
    var dmg;
    dmg = this.modifyDamage(target, this.power);
    if (dmg > 0) {
      return {
        target: target,
        power: this.power,
        damage: dmg
      };
    }
  }

  modifyDamage(target, power) {
    if (typeof target.modifyDamage === 'function') {
      return Math.floor(target.modifyDamage(power, this.type));
    } else {
      return Math.floor(power * 0.25);
    }
  }

  mergeDamage(d1, d2) {
    return {
      target: d1.target,
      power: Math.floor((d1.power + d2.power) / 2),
      damage: Math.floor((d1.damage + d2.damage) / 2)
    };
  }

};

DamagePropagation.Explosive = (function() {
  class Explosive extends DamagePropagation {
    getDamaged() {
      var angle, i, inside, ref, shard, shardPower, shards, target;
      this._damaged = [];
      shards = Math.pow(this.range + 1, 2);
      shardPower = this.power / shards;
      inside = this.tile.health <= this.modifyDamage(this.tile, shardPower);
      if (inside) {
        shardPower *= 4;
      }
      for (shard = i = 0, ref = shards; (0 <= ref ? i <= ref : i >= ref); shard = 0 <= ref ? ++i : --i) {
        angle = this.rng() * Math.PI * 2;
        target = this.getTileHitByShard(inside, angle);
        if (target != null) {
          this._damaged.push({
            target: target,
            power: shardPower,
            damage: this.modifyDamage(target, shardPower)
          });
        }
      }
      return this._damaged;
    }

    getTileHitByShard(inside, angle) {
      var ctn, dist, target, vertex;
      ctn = this.getTileContainer();
      dist = this.range * this.rng();
      target = {
        x: this.tile.x + 0.5 + dist * Math.cos(angle),
        y: this.tile.y + 0.5 + dist * Math.sin(angle)
      };
      if (inside) {
        vertex = new LineOfSight(ctn, this.tile.x + 0.5, this.tile.y + 0.5, target.x, target.y);
        vertex.traversableCallback = (tile) => {
          return !inside || ((tile != null) && this.traversableCallback(tile));
        };
        return vertex.getEndPoint().tile;
      } else {
        return ctn.getTile(Math.floor(target.x), Math.floor(target.y));
      }
    }

  };

  Explosive.properties({
    rng: {
      default: Math.random
    },
    traversableCallback: {
      default: function(tile) {
        return !(typeof tile.getSolid === 'function' && tile.getSolid());
      }
    }
  });

  return Explosive;

}).call(this);



},{"./LineOfSight":47,"parallelio-tiles":123,"spark-starter":169}],42:[function(require,module,exports){
var Damageable, Element;

Element = require('spark-starter').Element;

module.exports = Damageable = (function() {
  class Damageable extends Element {
    damage(val) {
      return this.health = Math.max(0, this.health - val);
    }

    whenNoHealth() {}

  };

  Damageable.properties({
    damageable: {
      default: true
    },
    maxHealth: {
      default: 1000
    },
    health: {
      default: 1000,
      change: function() {
        if (this.health <= 0) {
          return this.whenNoHealth();
        }
      }
    }
  });

  return Damageable;

}).call(this);



},{"spark-starter":169}],43:[function(require,module,exports){
var Door, Tiled;

Tiled = require('parallelio-tiles').Tiled;

module.exports = Door = (function() {
  class Door extends Tiled {
    constructor(direction = Door.directions.horizontal) {
      super();
      this.direction = direction;
    }

    updateTileMembers(old) {
      var ref, ref1, ref2, ref3;
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

  };

  Door.properties({
    tile: {
      change: function(old) {
        return this.updateTileMembers(old);
      }
    },
    open: {
      default: false
    },
    direction: {}
  });

  Door.directions = {
    horizontal: 'horizontal',
    vertical: 'vertical'
  };

  return Door;

}).call(this);



},{"parallelio-tiles":123}],44:[function(require,module,exports){
module.exports = require('spark-starter').Element;



},{"spark-starter":169}],45:[function(require,module,exports){
var Floor, Tile;

Tile = require('parallelio-tiles').Tile;

module.exports = Floor = (function() {
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



},{"parallelio-tiles":123}],46:[function(require,module,exports){
var Element, Game, Player, Timing, View;

Element = require('spark-starter').Element;

Timing = require('parallelio-timing');

View = require('./View');

Player = require('./Player');

module.exports = Game = (function() {
  class Game extends Element {
    start() {
      return this.currentPlayer;
    }

    add(elem) {
      elem.game = this;
      return elem;
    }

  };

  Game.properties({
    timing: {
      calcul: function() {
        return new Timing();
      }
    },
    mainView: {
      calcul: function() {
        if (this.views.length > 0) {
          return this.views.get(0);
        } else {
          return this.add(new this.defaultViewClass());
        }
      }
    },
    views: {
      collection: true
    },
    currentPlayer: {
      calcul: function() {
        if (this.players.length > 0) {
          return this.players.get(0);
        } else {
          return this.add(new this.defaultPlayerClass());
        }
      }
    },
    players: {
      collection: true
    }
  });

  Game.prototype.defaultViewClass = View;

  Game.prototype.defaultPlayerClass = Player;

  return Game;

}).call(this);



},{"./Player":52,"./View":58,"parallelio-timing":124,"spark-starter":169}],47:[function(require,module,exports){
var LineOfSight;

module.exports = LineOfSight = class LineOfSight {
  constructor(tiles, x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
    this.tiles = tiles;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  setX1(val) {
    this.x1 = val;
    return this.invalidade();
  }

  setY1(val) {
    this.y1 = val;
    return this.invalidade();
  }

  setX2(val) {
    this.x2 = val;
    return this.invalidade();
  }

  setY2(val) {
    this.y2 = val;
    return this.invalidade();
  }

  invalidade() {
    this.endPoint = null;
    this.success = null;
    return this.calculated = false;
  }

  testTile(tile, entryX, entryY) {
    if (this.traversableCallback != null) {
      return this.traversableCallback(tile, entryX, entryY);
    } else {
      return (tile != null) && (typeof tile.getTransparent === 'function' ? tile.getTransparent() : typeof tile.transparent !== void 0 ? tile.transparent : true);
    }
  }

  testTileAt(x, y, entryX, entryY) {
    return this.testTile(this.tiles.getTile(Math.floor(x), Math.floor(y)), entryX, entryY);
  }

  reverseTracing() {
    var tmpX, tmpY;
    tmpX = this.x1;
    tmpY = this.y1;
    this.x1 = this.x2;
    this.y1 = this.y2;
    this.x2 = tmpX;
    this.y2 = tmpY;
    return this.reversed = !this.reversed;
  }

  calcul() {
    var nextX, nextY, positiveX, positiveY, ratio, tileX, tileY, total, x, y;
    ratio = (this.x2 - this.x1) / (this.y2 - this.y1);
    total = Math.abs(this.x2 - this.x1) + Math.abs(this.y2 - this.y1);
    positiveX = (this.x2 - this.x1) >= 0;
    positiveY = (this.y2 - this.y1) >= 0;
    tileX = x = this.x1;
    tileY = y = this.y1;
    if (this.reversed) {
      tileX = positiveX ? x : Math.ceil(x) - 1;
      tileY = positiveY ? y : Math.ceil(y) - 1;
    }
    while (total > Math.abs(x - this.x1) + Math.abs(y - this.y1) && this.testTileAt(tileX, tileY, x, y)) {
      nextX = positiveX ? Math.floor(x) + 1 : Math.ceil(x) - 1;
      nextY = positiveY ? Math.floor(y) + 1 : Math.ceil(y) - 1;
      if (this.x2 - this.x1 === 0) {
        y = nextY;
      } else if (this.y2 - this.y1 === 0) {
        x = nextX;
      } else if (Math.abs((nextX - x) / (this.x2 - this.x1)) < Math.abs((nextY - y) / (this.y2 - this.y1))) {
        x = nextX;
        y = (nextX - this.x1) / ratio + this.y1;
      } else {
        x = (nextY - this.y1) * ratio + this.x1;
        y = nextY;
      }
      tileX = positiveX ? x : Math.ceil(x) - 1;
      tileY = positiveY ? y : Math.ceil(y) - 1;
    }
    if (total <= Math.abs(x - this.x1) + Math.abs(y - this.y1)) {
      this.endPoint = {
        x: this.x2,
        y: this.y2,
        tile: this.tiles.getTile(Math.floor(this.x2), Math.floor(this.y2))
      };
      return this.success = true;
    } else {
      this.endPoint = {
        x: x,
        y: y,
        tile: this.tiles.getTile(Math.floor(tileX), Math.floor(tileY))
      };
      return this.success = false;
    }
  }

  forceSuccess() {
    this.endPoint = {
      x: this.x2,
      y: this.y2,
      tile: this.tiles.getTile(Math.floor(this.x2), Math.floor(this.y2))
    };
    this.success = true;
    return this.calculated = true;
  }

  getSuccess() {
    if (!this.calculated) {
      this.calcul();
    }
    return this.success;
  }

  getEndPoint() {
    if (!this.calculated) {
      this.calcul();
    }
    return this.endPoint;
  }

};



},{}],48:[function(require,module,exports){
var Element, Map;

Element = require('spark-starter').Element;

module.exports = Map = (function() {
  class Map extends Element {};

  Map.properties({
    locations: {
      collection: {
        closest: function(x, y) {
          var min, minDist;
          min = null;
          minDist = null;
          this.forEach(function(location) {
            var dist;
            dist = location.dist(x, y);
            if ((min == null) || minDist > dist) {
              min = location;
              return minDist = dist;
            }
          });
          return min;
        },
        closests: function(x, y) {
          var dists;
          dists = this.map(function(location) {
            return {
              dist: location.dist(x, y),
              location: location
            };
          });
          dists.sort(function(a, b) {
            return a.dist - b.dist;
          });
          return this.copy(dists.map(function(dist) {
            return dist.location;
          }));
        }
      }
    }
  });

  return Map;

}).call(this);



},{"spark-starter":169}],49:[function(require,module,exports){
var Obstacle, Tiled;

Tiled = require('parallelio-tiles').Tiled;

module.exports = Obstacle = (function() {
  class Obstacle extends Tiled {
    updateWalkables(old) {
      var ref, ref1;
      if (old != null) {
        if ((ref = old.walkableMembers) != null) {
          ref.removeRef('walkable', this);
        }
      }
      if (this.tile) {
        return (ref1 = this.tile.walkableMembers) != null ? ref1.setValueRef(false, 'walkable', this) : void 0;
      }
    }

  };

  Obstacle.properties({
    tile: {
      change: function(old, overrided) {
        overrided(old);
        return this.updateWalkables(old);
      }
    }
  });

  return Obstacle;

}).call(this);



},{"parallelio-tiles":123}],50:[function(require,module,exports){
var Element, EventEmitter, PathWalk, Timing;

Element = require('spark-starter').Element;

Timing = require('parallelio-timing');

EventEmitter = require('spark-starter').EventEmitter;

module.exports = PathWalk = (function() {
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



},{"parallelio-timing":124,"spark-starter":169}],51:[function(require,module,exports){
var Element, LineOfSight, PersonalWeapon, Timing;

Element = require('spark-starter').Element;

LineOfSight = require('./LineOfSight');

Timing = require('parallelio-timing');

module.exports = PersonalWeapon = (function() {
  class PersonalWeapon extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    canBeUsed() {
      return this.charged;
    }

    canUseOn(target) {
      return this.canUseFrom(this.user.tile, target);
    }

    canUseFrom(tile, target) {
      if (this.range === 1) {
        return this.inMeleeRange(tile, target);
      } else {
        return this.inRange(tile, target) && this.hasLineOfSight(tile, target);
      }
    }

    inRange(tile, target) {
      var ref, targetTile;
      targetTile = target.tile || target;
      return ((ref = tile.dist(targetTile)) != null ? ref.length : void 0) <= this.range;
    }

    inMeleeRange(tile, target) {
      var targetTile;
      targetTile = target.tile || target;
      return Math.abs(targetTile.x - tile.x) + Math.abs(targetTile.y - tile.y) === 1;
    }

    hasLineOfSight(tile, target) {
      var los, targetTile;
      targetTile = target.tile || target;
      los = new LineOfSight(targetTile.container, tile.x + 0.5, tile.y + 0.5, targetTile.x + 0.5, targetTile.y + 0.5);
      los.traversableCallback = function(tile) {
        return tile.walkable;
      };
      return los.getSuccess();
    }

    useOn(target) {
      if (this.canBeUsed()) {
        target.damage(this.power);
        this.charged = false;
        return this.recharge();
      }
    }

    recharge() {
      this.charging = true;
      return this.chargeTimeout = this.timing.setTimeout(() => {
        this.charging = false;
        return this.recharged();
      }, this.rechargeTime);
    }

    recharged() {
      return this.charged = true;
    }

    destroy() {
      if (this.chargeTimeout) {
        return this.chargeTimeout.destroy();
      }
    }

  };

  PersonalWeapon.properties({
    rechargeTime: {
      default: 1000
    },
    charged: {
      default: true
    },
    charging: {
      default: true
    },
    power: {
      default: 10
    },
    dps: {
      calcul: function(invalidator) {
        return invalidator.prop('power') / invalidator.prop('rechargeTime') * 1000;
      }
    },
    range: {
      default: 10
    },
    user: {
      default: null
    },
    timing: {
      calcul: function() {
        return new Timing();
      }
    }
  });

  return PersonalWeapon;

}).call(this);



},{"./LineOfSight":47,"parallelio-timing":124,"spark-starter":169}],52:[function(require,module,exports){
var Element, EventEmitter, Player;

Element = require('spark-starter').Element;

EventEmitter = require('spark-starter').EventEmitter;

module.exports = Player = (function() {
  class Player extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    setDefaults() {
      var first;
      first = this.game.players.length === 0;
      this.game.players.add(this);
      if (first && !this.controller && this.game.defaultPlayerControllerClass) {
        return this.controller = new this.game.defaultPlayerControllerClass();
      }
    }

    canTargetActionOn(elem) {
      var action, ref;
      action = this.selectedAction || ((ref = this.selected) != null ? ref.defaultAction : void 0);
      return (action != null) && typeof action.canTarget === "function" && action.canTarget(elem);
    }

    canSelect(elem) {
      return typeof elem.isSelectableBy === "function" && elem.isSelectableBy(this);
    }

    canFocusOn(elem) {
      if (typeof elem.IsFocusableBy === "function") {
        return elem.IsFocusableBy(this);
      } else if (typeof elem.IsSelectableBy === "function") {
        return elem.IsSelectableBy(this);
      }
    }

    setActionTarget(elem) {
      var action, ref;
      action = this.selectedAction || ((ref = this.selected) != null ? ref.defaultAction : void 0);
      action = action.withTarget(elem);
      if (action.isReady()) {
        action.start();
        return this.selectedAction = null;
      } else {
        return this.selectedAction = action;
      }
    }

  };

  Player.include(EventEmitter.prototype);

  Player.properties({
    name: {
      default: 'Player'
    },
    focused: {},
    selected: {
      change: function(old) {
        var ref;
        if (old != null ? old.getProperty('selected') : void 0) {
          old.selected = false;
        }
        if ((ref = this.selected) != null ? ref.getProperty('selected') : void 0) {
          return this.selected.selected = this;
        }
      }
    },
    selectedAction: {},
    controller: {
      change: function(old) {
        if (this.controller) {
          return this.controller.player = this;
        }
      }
    },
    game: {
      change: function(old) {
        if (this.game) {
          return this.setDefaults();
        }
      }
    }
  });

  return Player;

}).call(this);



},{"spark-starter":169}],53:[function(require,module,exports){
var Element, Projectile, Timing;

Element = require('spark-starter').Element;

Timing = require('parallelio-timing');

module.exports = Projectile = (function() {
  class Projectile extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
      this.init();
    }

    init() {}

    launch() {
      this.moving = true;
      return this.pathTimeout = this.timing.setTimeout(() => {
        this.deliverPayload();
        return this.moving = false;
      }, this.pathLength / this.speed * 1000);
    }

    deliverPayload() {
      var payload;
      payload = new this.propagationType({
        tile: this.target.tile || this.target,
        power: this.power,
        range: this.blastRange
      });
      payload.apply();
      this.payloadDelivered();
      return payload;
    }

    payloadDelivered() {
      return this.destroy();
    }

    destroy() {
      return this.destroyProperties();
    }

  };

  Projectile.properties({
    origin: {
      default: null
    },
    target: {
      default: null
    },
    power: {
      default: 10
    },
    blastRange: {
      default: 1
    },
    propagationType: {
      default: null
    },
    speed: {
      default: 10
    },
    pathLength: {
      calcul: function() {
        var dist;
        if ((this.originTile != null) && (this.targetTile != null)) {
          dist = this.originTile.dist(this.targetTile);
          if (dist) {
            return dist.length;
          }
        }
        return 100;
      }
    },
    originTile: {
      calcul: function(invalidator) {
        var origin;
        origin = invalidator.prop('origin');
        if (origin != null) {
          return origin.tile || origin;
        }
      }
    },
    targetTile: {
      calcul: function(invalidator) {
        var target;
        target = invalidator.prop('target');
        if (target != null) {
          return target.tile || target;
        }
      }
    },
    container: {
      calcul: function(invalidate) {
        var originTile, targetTile;
        originTile = invalidate.prop('originTile');
        targetTile = invalidate.prop('targetTile');
        if (originTile.container === targetTile.container) {
          return originTile.container;
        } else if (invalidate.prop('prcPath') > 0.5) {
          return targetTile.container;
        } else {
          return originTile.container;
        }
      }
    },
    x: {
      calcul: function(invalidate) {
        var startPos;
        startPos = invalidate.prop('startPos');
        return (invalidate.prop('targetPos').x - startPos.x) * invalidate.prop('prcPath') + startPos.x;
      }
    },
    y: {
      calcul: function(invalidate) {
        var startPos;
        startPos = invalidate.prop('startPos');
        return (invalidate.prop('targetPos').y - startPos.y) * invalidate.prop('prcPath') + startPos.y;
      }
    },
    startPos: {
      calcul: function(invalidate) {
        var container, dist, offset, originTile;
        originTile = invalidate.prop('originTile');
        container = invalidate.prop('container');
        offset = this.startOffset;
        if (originTile.container !== container) {
          dist = container.dist(originTile.container);
          offset.x += dist.x;
          offset.y += dist.y;
        }
        return {
          x: originTile.x + offset.x,
          y: originTile.y + offset.y
        };
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    targetPos: {
      calcul: function(invalidate) {
        var container, dist, offset, targetTile;
        targetTile = invalidate.prop('targetTile');
        container = invalidate.prop('container');
        offset = this.targetOffset;
        if (targetTile.container !== container) {
          dist = container.dist(targetTile.container);
          offset.x += dist.x;
          offset.y += dist.y;
        }
        return {
          x: targetTile.x + offset.x,
          y: targetTile.y + offset.y
        };
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    startOffset: {
      default: {
        x: 0.5,
        y: 0.5
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    targetOffset: {
      default: {
        x: 0.5,
        y: 0.5
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    },
    prcPath: {
      calcul: function() {
        var ref;
        return ((ref = this.pathTimeout) != null ? ref.getPrc() : void 0) || 0;
      }
    },
    timing: {
      calcul: function() {
        return new Timing();
      }
    },
    moving: {
      default: false
    }
  });

  return Projectile;

}).call(this);



},{"parallelio-timing":124,"spark-starter":169}],54:[function(require,module,exports){
var Direction, Door, Element, RoomGenerator, Tile, TileContainer,
  indexOf = [].indexOf;

Element = require('spark-starter').Element;

TileContainer = require('parallelio-tiles').TileContainer;

Tile = require('parallelio-tiles').Tile;

Direction = require('parallelio-tiles').Direction;

Door = require('./Door');

module.exports = RoomGenerator = (function() {
  class RoomGenerator extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    initTiles() {
      this.finalTiles = null;
      this.rooms = [];
      return this.free = this.tileContainer.allTiles().filter((tile) => {
        var direction, k, len, next, ref;
        ref = Direction.all;
        for (k = 0, len = ref.length; k < len; k++) {
          direction = ref[k];
          next = this.tileContainer.getTile(tile.x + direction.x, tile.y + direction.y);
          if (next == null) {
            return false;
          }
        }
        return true;
      });
    }

    calcul() {
      var i;
      this.initTiles();
      i = 0;
      while (this.step() || this.newRoom()) {
        i++;
      }
      this.createDoors();
      this.rooms;
      return this.makeFinalTiles();
    }

    makeFinalTiles() {
      return this.finalTiles = this.tileContainer.allTiles().map((tile) => {
        var opt;
        if (tile.factory != null) {
          opt = {
            x: tile.x,
            y: tile.y
          };
          if (tile.factoryOptions != null) {
            opt = Object.assign(opt, tile.factoryOptions);
          }
          return tile.factory(opt);
        }
      }).filter((tile) => {
        return tile != null;
      });
    }

    getTiles() {
      if (this.finalTiles == null) {
        this.calcul();
      }
      return this.finalTiles;
    }

    newRoom() {
      if (this.free.length) {
        this.volume = Math.floor(this.rng() * (this.maxVolume - this.minVolume)) + this.minVolume;
        return this.room = new RoomGenerator.Room();
      }
    }

    randomDirections() {
      var i, j, o, x;
      o = Direction.adjacents.slice();
      j = void 0;
      x = void 0;
      i = o.length;
      while (i) {
        j = Math.floor(this.rng() * i);
        x = o[--i];
        o[i] = o[j];
        o[j] = x;
      }
      return o;
    }

    step() {
      var success, tries;
      if (this.room) {
        if (this.free.length && this.room.tiles.length < this.volume - 1) {
          if (this.room.tiles.length) {
            tries = this.randomDirections();
            success = false;
            while (tries.length && !success) {
              success = this.expand(this.room, tries.pop(), this.volume);
            }
            if (!success) {
              this.roomDone();
            }
            return success;
          } else {
            this.allocateTile(this.randomFreeTile(), this.room);
            return true;
          }
        } else {
          this.roomDone();
          return false;
        }
      }
    }

    roomDone() {
      this.rooms.push(this.room);
      this.allocateWalls(this.room);
      return this.room = null;
    }

    expand(room, direction, max = 0) {
      var k, len, next, ref, second, success, tile;
      success = false;
      ref = room.tiles;
      for (k = 0, len = ref.length; k < len; k++) {
        tile = ref[k];
        if (max === 0 || room.tiles.length < max) {
          if (next = this.tileOffsetIsFree(tile, direction)) {
            this.allocateTile(next, room);
            success = true;
          }
          if ((second = this.tileOffsetIsFree(tile, direction, 2)) && !this.tileOffsetIsFree(tile, direction, 3)) {
            this.allocateTile(second, room);
          }
        }
      }
      return success;
    }

    allocateWalls(room) {
      var direction, k, len, next, nextRoom, otherSide, ref, results, tile;
      ref = room.tiles;
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        tile = ref[k];
        results.push((function() {
          var l, len1, ref1, results1;
          ref1 = Direction.all;
          results1 = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            direction = ref1[l];
            next = this.tileContainer.getTile(tile.x + direction.x, tile.y + direction.y);
            if ((next != null) && next.room !== room) {
              if (indexOf.call(Direction.corners, direction) < 0) {
                otherSide = this.tileContainer.getTile(tile.x + direction.x * 2, tile.y + direction.y * 2);
                nextRoom = (otherSide != null ? otherSide.room : void 0) != null ? otherSide.room : null;
                room.addWall(next, nextRoom);
                if (nextRoom != null) {
                  nextRoom.addWall(next, room);
                }
              }
              next.factory = this.wallFactory;
              results1.push(this.allocateTile(next));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    }

    createDoors() {
      var door, k, len, ref, results, room, walls;
      ref = this.rooms;
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        room = ref[k];
        results.push((function() {
          var l, len1, ref1, results1;
          ref1 = room.wallsByRooms();
          results1 = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            walls = ref1[l];
            if ((walls.room != null) && room.doorsForRoom(walls.room) < 1) {
              door = walls.tiles[Math.floor(this.rng() * walls.tiles.length)];
              door.factory = this.doorFactory;
              door.factoryOptions = {
                direction: this.tileContainer.getTile(door.x + 1, door.y).factory === this.floorFactory ? Door.directions.vertical : Door.directions.horizontal
              };
              room.addDoor(door, walls.room);
              results1.push(walls.room.addDoor(door, room));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    }

    allocateTile(tile, room = null) {
      var index;
      if (room != null) {
        room.addTile(tile);
        tile.factory = this.floorFactory;
      }
      index = this.free.indexOf(tile);
      if (index > -1) {
        return this.free.splice(index, 1);
      }
    }

    tileOffsetIsFree(tile, direction, multiply = 1) {
      return this.tileIsFree(tile.x + direction.x * multiply, tile.y + direction.y * multiply);
    }

    tileIsFree(x, y) {
      var tile;
      tile = this.tileContainer.getTile(x, y);
      if ((tile != null) && indexOf.call(this.free, tile) >= 0) {
        return tile;
      } else {
        return false;
      }
    }

    randomFreeTile() {
      return this.free[Math.floor(this.rng() * this.free.length)];
    }

  };

  RoomGenerator.properties({
    rng: {
      default: Math.random
    },
    maxVolume: {
      default: 25
    },
    minVolume: {
      default: 50
    },
    width: {
      default: 30
    },
    height: {
      default: 15
    },
    tileContainer: {
      calcul: function() {
        var k, l, ref, ref1, tiles, x, y;
        tiles = new TileContainer();
        for (x = k = 0, ref = this.width; (0 <= ref ? k <= ref : k >= ref); x = 0 <= ref ? ++k : --k) {
          for (y = l = 0, ref1 = this.height; (0 <= ref1 ? l <= ref1 : l >= ref1); y = 0 <= ref1 ? ++l : --l) {
            tiles.addTile(new Tile(x, y));
          }
        }
        return tiles;
      }
    },
    floorFactory: {
      default: function(opt) {
        return new Tile(opt.x, opt.y);
      }
    },
    wallFactory: {
      default: null
    },
    doorFactory: {
      calcul: function() {
        return this.floorFactory;
      }
    }
  });

  return RoomGenerator;

}).call(this);

RoomGenerator.Room = class Room {
  constructor() {
    this.tiles = [];
    this.walls = [];
    this.doors = [];
  }

  addTile(tile) {
    this.tiles.push(tile);
    return tile.room = this;
  }

  containsWall(tile) {
    var k, len, ref, wall;
    ref = this.walls;
    for (k = 0, len = ref.length; k < len; k++) {
      wall = ref[k];
      if (wall.tile === tile) {
        return wall;
      }
    }
    return false;
  }

  addWall(tile, nextRoom) {
    var existing;
    existing = this.containsWall(tile);
    if (existing) {
      return existing.nextRoom = nextRoom;
    } else {
      return this.walls.push({
        tile: tile,
        nextRoom: nextRoom
      });
    }
  }

  wallsByRooms() {
    var k, len, pos, ref, res, rooms, wall;
    rooms = [];
    res = [];
    ref = this.walls;
    for (k = 0, len = ref.length; k < len; k++) {
      wall = ref[k];
      pos = rooms.indexOf(wall.nextRoom);
      if (pos === -1) {
        pos = rooms.length;
        rooms.push(wall.nextRoom);
        res.push({
          room: wall.nextRoom,
          tiles: []
        });
      }
      res[pos].tiles.push(wall.tile);
    }
    return res;
  }

  addDoor(tile, nextRoom) {
    return this.doors.push({
      tile: tile,
      nextRoom: nextRoom
    });
  }

  doorsForRoom(room) {
    var door, k, len, ref, res;
    res = [];
    ref = this.doors;
    for (k = 0, len = ref.length; k < len; k++) {
      door = ref[k];
      if (door.nextRoom === room) {
        res.push(door.tile);
      }
    }
    return res;
  }

};



},{"./Door":43,"parallelio-tiles":123,"spark-starter":169}],55:[function(require,module,exports){
var Damageable, Projectile, ShipWeapon, Tiled, Timing;

Tiled = require('parallelio-tiles').Tiled;

Timing = require('parallelio-timing');

Damageable = require('./Damageable');

Projectile = require('./Projectile');

module.exports = ShipWeapon = (function() {
  class ShipWeapon extends Tiled {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    fire() {
      var projectile;
      if (this.canFire) {
        projectile = new Projectile({
          origin: this,
          target: this.target,
          power: this.power,
          blastRange: this.blastRange,
          propagationType: this.propagationType,
          speed: this.projectileSpeed,
          timing: this.timing
        });
        projectile.launch();
        this.charged = false;
        this.recharge();
        return projectile;
      }
    }

    recharge() {
      this.charging = true;
      return this.chargeTimeout = this.timing.setTimeout(() => {
        this.charging = false;
        return this.recharged();
      }, this.rechargeTime);
    }

    recharged() {
      this.charged = true;
      if (this.autoFire) {
        return this.fire();
      }
    }

  };

  ShipWeapon.extend(Damageable);

  ShipWeapon.properties({
    rechargeTime: {
      default: 1000
    },
    power: {
      default: 10
    },
    blastRange: {
      default: 1
    },
    propagationType: {
      default: null
    },
    projectileSpeed: {
      default: 10
    },
    target: {
      default: null,
      change: function() {
        if (this.autoFire) {
          return this.fire();
        }
      }
    },
    charged: {
      default: true
    },
    charging: {
      default: true
    },
    enabled: {
      default: true
    },
    autoFire: {
      default: true
    },
    criticalHealth: {
      default: 0.3
    },
    canFire: {
      get: function() {
        return this.target && this.enabled && this.charged && this.health / this.maxHealth >= this.criticalHealth;
      }
    },
    timing: {
      calcul: function() {
        return new Timing();
      }
    }
  });

  return ShipWeapon;

}).call(this);



},{"./Damageable":42,"./Projectile":53,"parallelio-tiles":123,"parallelio-timing":124}],56:[function(require,module,exports){
var Element, Star;

Element = require('spark-starter').Element;

module.exports = Star = (function() {
  class Star extends Element {
    constructor(x5, y5) {
      super();
      this.x = x5;
      this.y = y5;
      this.init();
    }

    init() {}

    linkTo(star) {
      if (!this.links.findStar(star)) {
        return this.addLink(new this.constructor.Link(this, star));
      }
    }

    addLink(link) {
      this.links.add(link);
      link.otherStar(this).links.add(link);
      return link;
    }

    dist(x, y) {
      var xDist, yDist;
      xDist = this.x - x;
      yDist = this.y - y;
      return Math.sqrt((xDist * xDist) + (yDist * yDist));
    }

  };

  Star.properties({
    x: {},
    y: {},
    links: {
      collection: {
        findStar: function(star) {
          return this.find(function(link) {
            return link.star2 === star || link.star1 === star;
          });
        }
      }
    }
  });

  Star.collenctionFn = {
    closest: function(x, y) {
      var min, minDist;
      min = null;
      minDist = null;
      this.forEach(function(star) {
        var dist;
        dist = star.dist(x, y);
        if ((min == null) || minDist > dist) {
          min = star;
          return minDist = dist;
        }
      });
      return min;
    },
    closests: function(x, y) {
      var dists;
      dists = this.map(function(star) {
        return {
          dist: star.dist(x, y),
          star: star
        };
      });
      dists.sort(function(a, b) {
        return a.dist - b.dist;
      });
      return this.copy(dists.map(function(dist) {
        return dist.star;
      }));
    }
  };

  return Star;

}).call(this);

Star.Link = class Link extends Element {
  constructor(star1, star2) {
    super();
    this.star1 = star1;
    this.star2 = star2;
  }

  remove() {
    this.star1.links.remove(this);
    return this.star2.links.remove(this);
  }

  otherStar(star) {
    if (star === this.star1) {
      return this.star2;
    } else {
      return this.star1;
    }
  }

  getLength() {
    return this.star1.dist(this.star2.x, this.star2.y);
  }

  inBoundaryBox(x, y, padding = 0) {
    var x1, x2, y1, y2;
    x1 = Math.min(this.star1.x, this.star2.x) - padding;
    y1 = Math.min(this.star1.y, this.star2.y) - padding;
    x2 = Math.max(this.star1.x, this.star2.x) + padding;
    y2 = Math.max(this.star1.y, this.star2.y) + padding;
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

  closeToPoint(x, y, minDist) {
    var a, abDist, abcAngle, abxAngle, acDist, acxAngle, b, c, cdDist, xAbDist, xAcDist, yAbDist, yAcDist;
    if (!this.inBoundaryBox(x, y, minDist)) {
      return false;
    }
    a = this.star1;
    b = this.star2;
    c = {
      "x": x,
      "y": y
    };
    xAbDist = b.x - a.x;
    yAbDist = b.y - a.y;
    abDist = Math.sqrt((xAbDist * xAbDist) + (yAbDist * yAbDist));
    abxAngle = Math.atan(yAbDist / xAbDist);
    xAcDist = c.x - a.x;
    yAcDist = c.y - a.y;
    acDist = Math.sqrt((xAcDist * xAcDist) + (yAcDist * yAcDist));
    acxAngle = Math.atan(yAcDist / xAcDist);
    abcAngle = abxAngle - acxAngle;
    cdDist = Math.abs(Math.sin(abcAngle) * acDist);
    return cdDist <= minDist;
  }

  intersectLink(link) {
    var s, s1_x, s1_y, s2_x, s2_y, t, x1, x2, x3, x4, y1, y2, y3, y4;
    x1 = this.star1.x;
    y1 = this.star1.y;
    x2 = this.star2.x;
    y2 = this.star2.y;
    x3 = link.star1.x;
    y3 = link.star1.y;
    x4 = link.star2.x;
    y4 = link.star2.y;
    s1_x = x2 - x1;
    s1_y = y2 - y1;
    s2_x = x4 - x3;
    s2_y = y4 - y3;
    s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);
    return s > 0 && s < 1 && t > 0 && t < 1;
  }

};



},{"spark-starter":169}],57:[function(require,module,exports){
var Element, Map, Star, StarMapGenerator;

Element = require('spark-starter').Element;

Map = require('./Map');

Star = require('./Star');

module.exports = StarMapGenerator = (function() {
  class StarMapGenerator extends Element {
    constructor(options) {
      super();
      this.opt = Object.assign({}, this.defOpt, options);
    }

    generate() {
      this.map = new this.opt.mapClass();
      this.stars = this.map.locations.copy();
      this.links = [];
      this.createStars(this.opt.nbStars);
      this.makeLinks();
      return this.map;
    }

    createStars(nb) {
      var i, k, ref, results;
      results = [];
      for (i = k = 0, ref = nb; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        results.push(this.createStar());
      }
      return results;
    }

    createStar() {
      var j, pos;
      j = 0;
      while (true) {
        pos = {
          x: Math.floor(this.opt.rng() * (this.opt.maxX - this.opt.minX) + this.opt.minX),
          y: Math.floor(this.opt.rng() * (this.opt.maxY - this.opt.minY) + this.opt.minY)
        };
        if (!(j < 10 && this.stars.find((star) => {
          return star.dist(pos.x, pos.y) <= this.opt.minStarDist;
        }))) {
          break;
        }
        j++;
      }
      if (!(j >= 10)) {
        return this.createStarAtPos(pos.x, pos.y);
      }
    }

    createStarAtPos(x, y) {
      var star;
      star = new this.opt.starClass(x, y);
      this.map.locations.push(star);
      this.stars.push(star);
      return star;
    }

    makeLinks() {
      return this.stars.forEach((star) => {
        return this.makeLinksFrom(star);
      });
    }

    makeLinksFrom(star) {
      var close, closests, link, needed, results, tries;
      tries = this.opt.linkTries;
      needed = this.opt.linksByStars - star.links.count();
      if (needed > 0) {
        closests = this.stars.filter((star2) => {
          return star2 !== star && !star.links.findStar(star2);
        }).closests(star.x, star.y);
        if (closests.count() > 0) {
          results = [];
          while (true) {
            close = closests.shift();
            link = this.createLink(star, close);
            if (this.validateLink(link)) {
              this.links.push(link);
              star.addLink(link);
              needed -= 1;
            } else {
              tries -= 1;
            }
            if (!(needed > 0 && tries > 0 && closests.count() > 0)) {
              break;
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      }
    }

    createLink(star1, star2) {
      return new this.opt.linkClass(star1, star2);
    }

    validateLink(link) {
      return !this.stars.find((star) => {
        return star !== link.star1 && star !== link.star2 && link.closeToPoint(star.x, star.y, this.opt.minLinkDist);
      }) && !this.links.find((link2) => {
        return link2.intersectLink(link);
      });
    }

  };

  StarMapGenerator.prototype.defOpt = {
    nbStars: 20,
    minX: 0,
    maxX: 500,
    minY: 0,
    maxY: 500,
    minStarDist: 10,
    minLinkDist: 10,
    linksByStars: 3,
    linkTries: 3,
    mapClass: Map,
    starClass: Star,
    linkClass: Star.Link,
    rng: Math.random
  };

  return StarMapGenerator;

}).call(this);



},{"./Map":48,"./Star":56,"spark-starter":169}],58:[function(require,module,exports){
var Element, Grid, View;

Element = require('spark-starter').Element;

Grid = require('parallelio-grids').Grid;

module.exports = View = (function() {
  class View extends Element {
    setDefaults() {
      var ref, ref1;
      if (!this.bounds) {
        this.grid = this.grid || ((ref = this.game._mainView) != null ? (ref1 = ref.value) != null ? ref1.grid : void 0 : void 0) || new Grid();
        return this.bounds = this.grid.addCell();
      }
    }

    destroy() {
      return this.game = null;
    }

  };

  View.properties({
    game: {
      change: function(old) {
        if (this.game) {
          this.game.views.add(this);
          this.setDefaults();
        }
        if (old) {
          return old.views.remove(this);
        }
      }
    },
    x: {
      default: 0
    },
    y: {
      default: 0
    },
    grid: {
      default: null
    },
    bounds: {
      default: null
    }
  });

  return View;

}).call(this);



},{"parallelio-grids":73,"spark-starter":169}],59:[function(require,module,exports){
var Direction, LineOfSight, TileContainer, TileReference, VisionCalculator;

LineOfSight = require('./LineOfSight');

Direction = require('parallelio-tiles').Direction;

TileContainer = require('parallelio-tiles').TileContainer;

TileReference = require('parallelio-tiles').TileReference;

module.exports = VisionCalculator = class VisionCalculator {
  constructor(originTile, offset = {
      x: 0.5,
      y: 0.5
    }) {
    this.originTile = originTile;
    this.offset = offset;
    this.pts = {};
    this.visibility = {};
    this.stack = [];
    this.calculated = false;
  }

  calcul() {
    this.init();
    while (this.stack.length) {
      this.step();
    }
    return this.calculated = true;
  }

  init() {
    var firstBatch, initialPts;
    this.pts = {};
    this.visibility = {};
    initialPts = [
      {
        x: 0,
        y: 0
      },
      {
        x: 1,
        y: 0
      },
      {
        x: 0,
        y: 1
      },
      {
        x: 1,
        y: 1
      }
    ];
    initialPts.forEach((pt) => {
      return this.setPt(this.originTile.x + pt.x, this.originTile.y + pt.y, true);
    });
    firstBatch = [
      {
        x: -1,
        y: -1
      },
      {
        x: -1,
        y: 0
      },
      {
        x: -1,
        y: 1
      },
      {
        x: -1,
        y: 2
      },
      {
        x: 2,
        y: -1
      },
      {
        x: 2,
        y: 0
      },
      {
        x: 2,
        y: 1
      },
      {
        x: 2,
        y: 2
      },
      {
        x: 0,
        y: -1
      },
      {
        x: 1,
        y: -1
      },
      {
        x: 0,
        y: 2
      },
      {
        x: 1,
        y: 2
      }
    ];
    return this.stack = firstBatch.map((pt) => {
      return {
        x: this.originTile.x + pt.x,
        y: this.originTile.y + pt.y
      };
    });
  }

  setPt(x, y, val) {
    var adjancent;
    this.pts[x + ':' + y] = val;
    adjancent = [
      {
        x: 0,
        y: 0
      },
      {
        x: -1,
        y: 0
      },
      {
        x: 0,
        y: -1
      },
      {
        x: -1,
        y: -1
      }
    ];
    return adjancent.forEach((pt) => {
      return this.addVisibility(x + pt.x, y + pt.y, val ? 1 / adjancent.length : 0);
    });
  }

  getPt(x, y) {
    return this.pts[x + ':' + y];
  }

  addVisibility(x, y, val) {
    if (this.visibility[x] == null) {
      this.visibility[x] = {};
    }
    if (this.visibility[x][y] != null) {
      return this.visibility[x][y] += val;
    } else {
      return this.visibility[x][y] = val;
    }
  }

  getVisibility(x, y) {
    if ((this.visibility[x] == null) || (this.visibility[x][y] == null)) {
      return 0;
    } else {
      return this.visibility[x][y];
    }
  }

  canProcess(x, y) {
    return !this.stack.some((pt) => {
      return pt.x === x && pt.y === y;
    }) && (this.getPt(x, y) == null);
  }

  step() {
    var los, pt;
    pt = this.stack.shift();
    los = new LineOfSight(this.originTile.container, this.originTile.x + this.offset.x, this.originTile.y + this.offset.y, pt.x, pt.y);
    los.reverseTracing();
    los.traversableCallback = (tile, entryX, entryY) => {
      if (tile != null) {
        if (this.getVisibility(tile.x, tile.y) === 1) {
          return los.forceSuccess();
        } else {
          return tile.transparent;
        }
      }
    };
    this.setPt(pt.x, pt.y, los.getSuccess());
    if (los.getSuccess()) {
      return Direction.all.forEach((direction) => {
        var nextPt;
        nextPt = {
          x: pt.x + direction.x,
          y: pt.y + direction.y
        };
        if (this.canProcess(nextPt.x, nextPt.y)) {
          return this.stack.push(nextPt);
        }
      });
    }
  }

  getBounds() {
    var boundaries, col, ref, val, x, y;
    boundaries = {
      top: null,
      left: null,
      bottom: null,
      right: null
    };
    ref = this.visibility;
    for (x in ref) {
      col = ref[x];
      for (y in col) {
        val = col[y];
        if ((boundaries.top == null) || y < boundaries.top) {
          boundaries.top = y;
        }
        if ((boundaries.left == null) || x < boundaries.left) {
          boundaries.left = x;
        }
        if ((boundaries.bottom == null) || y > boundaries.bottom) {
          boundaries.bottom = y;
        }
        if ((boundaries.right == null) || x > boundaries.right) {
          boundaries.right = x;
        }
      }
    }
    return boundaries;
  }

  toContainer() {
    var col, ref, res, tile, val, x, y;
    res = new TileContainer();
    res.owner = false;
    ref = this.visibility;
    for (x in ref) {
      col = ref[x];
      for (y in col) {
        val = col[y];
        tile = this.originTile.container.getTile(x, y);
        if (val !== 0 && (tile != null)) {
          tile = new TileReference(tile);
          tile.visibility = val;
          res.addTile(tile);
        }
      }
    }
    return res;
  }

  toMap() {
    var i, j, ref, ref1, ref2, ref3, res, x, y;
    res = Object.assign({
      map: []
    }, this.getBounds());
    for (y = i = ref = res.top, ref1 = res.bottom - 1; (ref <= ref1 ? i <= ref1 : i >= ref1); y = ref <= ref1 ? ++i : --i) {
      res.map[y - res.top] = [];
      for (x = j = ref2 = res.left, ref3 = res.right - 1; (ref2 <= ref3 ? j <= ref3 : j >= ref3); x = ref2 <= ref3 ? ++j : --j) {
        res.map[y - res.top][x - res.left] = this.getVisibility(x, y);
      }
    }
    return res;
  }

};



},{"./LineOfSight":47,"parallelio-tiles":123}],60:[function(require,module,exports){
var Action, Element, EventEmitter;

Element = require('spark-starter').Element;

EventEmitter = require('spark-starter').EventEmitter;

module.exports = Action = (function() {
  class Action extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    withActor(actor) {
      if (this.actor !== actor) {
        return this.copyWith({
          actor: actor
        });
      } else {
        return this;
      }
    }

    copyWith(options) {
      return new this.constructor(Object.assign({
        base: this
      }, this.getManualDataProperties(), options));
    }

    start() {
      return this.execute();
    }

    validActor() {
      return this.actor != null;
    }

    isReady() {
      return this.validActor();
    }

    finish() {
      this.trigger('finished');
      return this.end();
    }

    interrupt() {
      this.trigger('interrupted');
      return this.end();
    }

    end() {
      this.trigger('end');
      return this.destroy();
    }

    destroy() {
      return this.destroyProperties();
    }

  };

  Action.include(EventEmitter.prototype);

  Action.properties({
    actor: {}
  });

  return Action;

}).call(this);



},{"spark-starter":169}],61:[function(require,module,exports){
var ActionProvider, Element;

Element = require('spark-starter').Element;

module.exports = ActionProvider = (function() {
  class ActionProvider extends Element {};

  ActionProvider.properties({
    providedActions: {
      collection: true
    }
  });

  return ActionProvider;

}).call(this);



},{"spark-starter":169}],62:[function(require,module,exports){
var AttackAction, EventBind, PropertyWatcher, TargetAction, WalkAction;

WalkAction = require('./WalkAction');

TargetAction = require('./TargetAction');

EventBind = require('spark-starter').EventBind;

PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher;

module.exports = AttackAction = (function() {
  class AttackAction extends TargetAction {
    validTarget() {
      return this.targetIsAttackable() && (this.canUseWeapon() || this.canWalkToTarget());
    }

    targetIsAttackable() {
      return this.target.damageable && this.target.health >= 0;
    }

    canMelee() {
      return Math.abs(this.target.tile.x - this.actor.tile.x) + Math.abs(this.target.tile.y - this.actor.tile.y) === 1;
    }

    canUseWeapon() {
      return this.bestUsableWeapon != null;
    }

    canUseWeaponAt(tile) {
      var ref;
      return ((ref = this.actor.weapons) != null ? ref.length : void 0) && this.actor.weapons.find((weapon) => {
        return weapon.canUseFrom(tile, this.target);
      });
    }

    canWalkToTarget() {
      return this.walkAction.isReady();
    }

    useWeapon() {
      this.bestUsableWeapon.useOn(this.target);
      return this.finish();
    }

    execute() {
      if (this.actor.walk != null) {
        this.actor.walk.interrupt();
      }
      if (this.bestUsableWeapon != null) {
        if (this.bestUsableWeapon.charged) {
          return this.useWeapon();
        } else {
          return this.weaponChargeWatcher.bind();
        }
      } else {
        this.walkAction.on('finished', () => {
          this.interruptBinder.unbind();
          if (this.isReady()) {
            return this.start();
          }
        });
        this.interruptBinder.bindTo(this.walkAction);
        return this.walkAction.execute();
      }
    }

  };

  AttackAction.properties({
    walkAction: {
      calcul: function() {
        var walkAction;
        walkAction = new WalkAction({
          actor: this.actor,
          target: this.target,
          parent: this.parent
        });
        walkAction.pathFinder.arrivedCallback = (step) => {
          return this.canUseWeaponAt(step.tile);
        };
        return walkAction;
      }
    },
    bestUsableWeapon: {
      calcul: function(invalidator) {
        var ref, usableWeapons;
        invalidator.propPath('actor.tile');
        if ((ref = this.actor.weapons) != null ? ref.length : void 0) {
          usableWeapons = this.actor.weapons.filter((weapon) => {
            return weapon.canUseOn(this.target);
          });
          usableWeapons.sort((a, b) => {
            return b.dps - a.dps;
          });
          return usableWeapons[0];
        } else {
          return null;
        }
      }
    },
    interruptBinder: {
      calcul: function() {
        return new EventBind('interrupted', null, () => {
          return this.interrupt();
        });
      },
      destroy: true
    },
    weaponChargeWatcher: {
      calcul: function() {
        return new PropertyWatcher({
          callback: () => {
            if (this.bestUsableWeapon.charged) {
              return this.useWeapon();
            }
          },
          property: this.bestUsableWeapon.getPropertyInstance('charged')
        });
      },
      destroy: true
    }
  });

  return AttackAction;

}).call(this);



},{"./TargetAction":65,"./WalkAction":67,"spark-starter":169}],63:[function(require,module,exports){
var AttackAction, AttackMoveAction, EventBind, LineOfSight, PathFinder, PropertyWatcher, TargetAction, WalkAction;

WalkAction = require('./WalkAction');

AttackAction = require('./AttackAction');

TargetAction = require('./TargetAction');

PathFinder = require('parallelio-pathfinder');

LineOfSight = require('../LineOfSight');

PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher;

EventBind = require('spark-starter').EventBind;

module.exports = AttackMoveAction = (function() {
  class AttackMoveAction extends TargetAction {
    isEnemy(elem) {
      var ref;
      return (ref = this.actor.owner) != null ? typeof ref.isEnemy === "function" ? ref.isEnemy(elem) : void 0 : void 0;
    }

    validTarget() {
      return this.walkAction.validTarget();
    }

    testEnemySpotted() {
      this.invalidateEnemySpotted();
      if (this.enemySpotted) {
        this.attackAction = new AttackAction({
          actor: this.actor,
          target: this.enemySpotted
        });
        this.attackAction.on('finished', () => {
          if (this.isReady()) {
            return this.start();
          }
        });
        this.interruptBinder.bindTo(this.attackAction);
        this.walkAction.interrupt();
        this.invalidateWalkAction();
        return this.attackAction.execute();
      }
    }

    execute() {
      if (!this.testEnemySpotted()) {
        this.walkAction.on('finished', () => {
          return this.finished();
        });
        this.interruptBinder.bindTo(this.walkAction);
        this.tileWatcher.bind();
        return this.walkAction.execute();
      }
    }

  };

  AttackMoveAction.properties({
    walkAction: {
      calcul: function() {
        var walkAction;
        walkAction = new WalkAction({
          actor: this.actor,
          target: this.target,
          parent: this.parent
        });
        return walkAction;
      }
    },
    enemySpotted: {
      calcul: function() {
        var ref;
        this.path = new PathFinder(this.actor.tile.container, this.actor.tile, false, {
          validTile: (tile) => {
            return tile.transparent && (new LineOfSight(this.actor.tile.container, this.actor.tile.x, this.actor.tile.y, tile.x, tile.y)).getSuccess();
          },
          arrived: (step) => {
            return step.enemy = step.tile.children.find((c) => {
              return this.isEnemy(c);
            });
          },
          efficiency: (tile) => {}
        });
        this.path.calcul();
        return (ref = this.path.solution) != null ? ref.enemy : void 0;
      }
    },
    tileWatcher: {
      calcul: function() {
        return new PropertyWatcher({
          callback: () => {
            return this.testEnemySpotted();
          },
          property: this.actor.getPropertyInstance('tile')
        });
      },
      destroy: true
    },
    interruptBinder: {
      calcul: function() {
        return new EventBind('interrupted', null, () => {
          return this.interrupt();
        });
      },
      destroy: true
    }
  });

  return AttackMoveAction;

}).call(this);



},{"../LineOfSight":47,"./AttackAction":62,"./TargetAction":65,"./WalkAction":67,"parallelio-pathfinder":94,"spark-starter":169}],64:[function(require,module,exports){
var ActionProvider, SimpleActionProvider;

ActionProvider = require('./ActionProvider');

module.exports = SimpleActionProvider = (function() {
  class SimpleActionProvider extends ActionProvider {};

  SimpleActionProvider.properties({
    providedActions: {
      calcul: function() {
        var actions;
        actions = this.actions || this.constructor.actions;
        if (typeof actions === "object") {
          actions = Object.keys(actions).map(function(key) {
            return actions[key];
          });
        }
        return actions.map((action) => {
          return new action({
            target: this
          });
        });
      }
    }
  });

  return SimpleActionProvider;

}).call(this);



},{"./ActionProvider":61}],65:[function(require,module,exports){
var Action, TargetAction;

Action = require('./Action');

module.exports = TargetAction = (function() {
  class TargetAction extends Action {
    withTarget(target) {
      if (this.target !== target) {
        return this.copyWith({
          target: target
        });
      } else {
        return this;
      }
    }

    canTarget(target) {
      var instance;
      instance = this.withTarget(target);
      if (instance.validTarget()) {
        return instance;
      }
    }

    validTarget() {
      return this.target != null;
    }

    isReady() {
      return super.isReady() && this.validTarget();
    }

  };

  TargetAction.properties({
    target: {}
  });

  return TargetAction;

}).call(this);



},{"./Action":60}],66:[function(require,module,exports){
var ActionProvider, Mixable, TiledActionProvider;

ActionProvider = require('./ActionProvider');

Mixable = require('spark-starter').Mixable;

module.exports = TiledActionProvider = (function() {
  class TiledActionProvider extends ActionProvider {
    validActionTile(tile) {
      return tile != null;
    }

    prepareActionTile(tile) {
      if (!tile.getPropertyInstance('providedActions')) {
        return Mixable.Extension.make(ActionProvider.prototype, tile);
      }
    }

  };

  TiledActionProvider.properties({
    tile: {
      change: function(old, overrided) {
        overrided(old);
        return this.forwardedActions;
      }
    },
    actionTiles: {
      collection: true,
      calcul: function(invalidator) {
        var myTile;
        myTile = invalidator.prop('tile');
        if (myTile) {
          return this.actionTilesCoord.map((coord) => {
            return myTile.getRelativeTile(coord.x, coord.y);
          }).filter((tile) => {
            return this.validActionTile(tile);
          });
        } else {
          return [];
        }
      }
    },
    forwardedActions: {
      collection: {
        compare: function(a, b) {
          return a.action === b.action && a.location === b.location;
        }
      },
      calcul: function(invalidator) {
        var actionTiles, actions;
        actionTiles = invalidator.prop('actionTiles');
        actions = invalidator.prop('providedActions');
        return actionTiles.reduce((res, tile) => {
          return res.concat(actions.map(function(act) {
            return {
              action: act,
              location: tile
            };
          }));
        }, []);
      },
      itemAdded: function(forwarded) {
        this.prepareActionTile(forwarded.location);
        return forwarded.location.providedActions.add(forwarded.action);
      },
      itemRemoved: function(forwarded) {
        return forwarded.location.providedActions.remove(forwarded.action);
      }
    }
  });

  TiledActionProvider.prototype.actionTilesCoord = [
    {
      x: 0,
      y: -1
    },
    {
      x: -1,
      y: 0
    },
    {
      x: 0,
      y: 0
    },
    {
      x: +1,
      y: 0
    },
    {
      x: 0,
      y: +1
    }
  ];

  return TiledActionProvider;

}).call(this);



},{"./ActionProvider":61,"spark-starter":169}],67:[function(require,module,exports){
var PathFinder, PathWalk, TargetAction, WalkAction;

PathFinder = require('parallelio-pathfinder');

PathWalk = require('../PathWalk');

TargetAction = require('./TargetAction');

module.exports = WalkAction = (function() {
  class WalkAction extends TargetAction {
    execute() {
      if (this.actor.walk != null) {
        this.actor.walk.interrupt();
      }
      this.walk = this.actor.walk = new PathWalk(this.actor, this.pathFinder);
      this.actor.walk.on('finished', () => {
        return this.finish();
      });
      this.actor.walk.on('interrupted', () => {
        return this.interrupt();
      });
      return this.actor.walk.start();
    }

    destroy() {
      super.destroy();
      if (this.walk) {
        return this.walk.destroy();
      }
    }

    validTarget() {
      this.pathFinder.calcul();
      return this.pathFinder.solution != null;
    }

  };

  WalkAction.properties({
    pathFinder: {
      calcul: function() {
        return new PathFinder(this.actor.tile.container, this.actor.tile, this.target, {
          validTile: (tile) => {
            if (typeof this.actor.canGoOnTile === "function") {
              return this.actor.canGoOnTile(tile);
            } else {
              return tile.walkable;
            }
          }
        });
      }
    }
  });

  return WalkAction;

}).call(this);



},{"../PathWalk":50,"./TargetAction":65,"parallelio-pathfinder":94}],68:[function(require,module,exports){
module.exports = {
  "AutomaticDoor": require("./AutomaticDoor"),
  "Character": require("./Character"),
  "CharacterAI": require("./CharacterAI"),
  "DamagePropagation": require("./DamagePropagation"),
  "Damageable": require("./Damageable"),
  "Door": require("./Door"),
  "Element": require("./Element"),
  "Floor": require("./Floor"),
  "Game": require("./Game"),
  "LineOfSight": require("./LineOfSight"),
  "Map": require("./Map"),
  "Obstacle": require("./Obstacle"),
  "PathWalk": require("./PathWalk"),
  "PersonalWeapon": require("./PersonalWeapon"),
  "Player": require("./Player"),
  "Projectile": require("./Projectile"),
  "RoomGenerator": require("./RoomGenerator"),
  "ShipWeapon": require("./ShipWeapon"),
  "Star": require("./Star"),
  "StarMapGenerator": require("./StarMapGenerator"),
  "View": require("./View"),
  "VisionCalculator": require("./VisionCalculator"),
  "actions": {
    "Action": require("./actions/Action"),
    "ActionProvider": require("./actions/ActionProvider"),
    "AttackAction": require("./actions/AttackAction"),
    "AttackMoveAction": require("./actions/AttackMoveAction"),
    "SimpleActionProvider": require("./actions/SimpleActionProvider"),
    "TargetAction": require("./actions/TargetAction"),
    "TiledActionProvider": require("./actions/TiledActionProvider"),
    "WalkAction": require("./actions/WalkAction"),
  },
}
},{"./AutomaticDoor":38,"./Character":39,"./CharacterAI":40,"./DamagePropagation":41,"./Damageable":42,"./Door":43,"./Element":44,"./Floor":45,"./Game":46,"./LineOfSight":47,"./Map":48,"./Obstacle":49,"./PathWalk":50,"./PersonalWeapon":51,"./Player":52,"./Projectile":53,"./RoomGenerator":54,"./ShipWeapon":55,"./Star":56,"./StarMapGenerator":57,"./View":58,"./VisionCalculator":59,"./actions/Action":60,"./actions/ActionProvider":61,"./actions/AttackAction":62,"./actions/AttackMoveAction":63,"./actions/SimpleActionProvider":64,"./actions/TargetAction":65,"./actions/TiledActionProvider":66,"./actions/WalkAction":67}],69:[function(require,module,exports){
var libs;

libs = require('./libs');

module.exports = Object.assign({}, libs, {
  grids: require('parallelio-grids'),
  PathFinder: require('parallelio-pathfinder'),
  strings: require('parallelio-strings'),
  tiles: require('parallelio-tiles'),
  Timing: require('parallelio-timing'),
  wiring: require('parallelio-wiring'),
  Spark: require('spark-starter')
});



},{"./libs":68,"parallelio-grids":73,"parallelio-pathfinder":94,"parallelio-strings":115,"parallelio-tiles":123,"parallelio-timing":124,"parallelio-wiring":7,"spark-starter":169}],70:[function(require,module,exports){
(function(definition){var Grid=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Grid.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Grid;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Grid=Grid;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Grid=Grid;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : require('spark-starter').EventEmitter;
var GridCell = dependencies.hasOwnProperty("GridCell") ? dependencies.GridCell : require('./GridCell');
var GridRow = dependencies.hasOwnProperty("GridRow") ? dependencies.GridRow : require('./GridRow');
var Grid;
Grid = (function() {
  class Grid extends Element {
    addCell(cell = null) {
      var row, spot;
      if (!cell) {
        cell = new GridCell();
      }
      spot = this.getFreeSpot();
      row = this.rows.get(spot.row);
      if (!row) {
        row = this.addRow();
      }
      row.addCell(cell);
      return cell;
    }

    addRow(row = null) {
      if (!row) {
        row = new GridRow();
      }
      this.rows.push(row);
      return row;
    }

    getFreeSpot() {
      var spot;
      spot = null;
      this.rows.some((row) => {
        if (row.cells.length < this.maxColumns) {
          return spot = {
            row: row.rowPosition,
            column: row.cells.length
          };
        }
      });
      if (!spot) {
        if (this.maxColumns > this.rows.length) {
          spot = {
            row: this.rows.length,
            column: 0
          };
        } else {
          spot = {
            row: 0,
            column: this.maxColumns + 1
          };
        }
      }
      return spot;
    }

  };

  Grid.extend(EventEmitter);

  Grid.properties({
    rows: {
      collection: true,
      itemAdded: function(row) {
        return row.grid = this;
      },
      itemRemoved: function(row) {
        if (row.grid === this) {
          return row.grid = null;
        }
      }
    },
    maxColumns: {
      calcul: function(invalidator) {
        var rows;
        rows = invalidator.prop('rows');
        return rows.reduce(function(max, row) {
          return Math.max(max, invalidator.prop('cells', row).length);
        }, 0);
      }
    }
  });

  return Grid;

}).call(this);

return(Grid);});
},{"./GridCell":71,"./GridRow":72,"spark-starter":93}],71:[function(require,module,exports){
(function(definition){var GridCell=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);GridCell.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=GridCell;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.GridCell=GridCell;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.GridCell=GridCell;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : require('spark-starter').EventEmitter;
var GridCell;
GridCell = (function() {
  class GridCell extends Element {};

  GridCell.extend(EventEmitter);

  GridCell.properties({
    grid: {
      calcul: function(invalidator) {
        return invalidator.prop('grid', invalidator.prop('row'));
      }
    },
    row: {},
    columnPosition: {
      calcul: function(invalidator) {
        var row;
        row = invalidator.prop('row');
        if (row) {
          return invalidator.prop('cells', row).indexOf(this);
        }
      }
    },
    width: {
      calcul: function(invalidator) {
        return 1 / invalidator.prop('cells', invalidator.prop('row')).length;
      }
    },
    left: {
      calcul: function(invalidator) {
        return invalidator.prop('width') * invalidator.prop('columnPosition');
      }
    },
    right: {
      calcul: function(invalidator) {
        return invalidator.prop('width') * (invalidator.prop('columnPosition') + 1);
      }
    },
    height: {
      calcul: function(invalidator) {
        return invalidator.prop('height', invalidator.prop('row'));
      }
    },
    top: {
      calcul: function(invalidator) {
        return invalidator.prop('top', invalidator.prop('row'));
      }
    },
    bottom: {
      calcul: function(invalidator) {
        return invalidator.prop('bottom', invalidator.prop('row'));
      }
    }
  });

  return GridCell;

}).call(this);

return(GridCell);});
},{"spark-starter":93}],72:[function(require,module,exports){
(function(definition){var GridRow=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);GridRow.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=GridRow;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.GridRow=GridRow;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.GridRow=GridRow;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : require('spark-starter').EventEmitter;
var GridCell = dependencies.hasOwnProperty("GridCell") ? dependencies.GridCell : require('./GridCell');
var GridRow;
GridRow = (function() {
  class GridRow extends Element {
    addCell(cell = null) {
      if (!cell) {
        cell = new GridCell();
      }
      this.cells.push(cell);
      return cell;
    }

  };

  GridRow.extend(EventEmitter);

  GridRow.properties({
    grid: {},
    cells: {
      collection: true,
      itemAdded: function(cell) {
        return cell.row = this;
      },
      itemRemoved: function(cell) {
        if (cell.row === this) {
          return cell.row = null;
        }
      }
    },
    rowPosition: {
      calcul: function(invalidator) {
        var grid;
        grid = invalidator.prop('grid');
        if (grid) {
          return invalidator.prop('rows', grid).indexOf(this);
        }
      }
    },
    height: {
      calcul: function(invalidator) {
        return 1 / invalidator.prop('rows', invalidator.prop('grid')).length;
      }
    },
    top: {
      calcul: function(invalidator) {
        return invalidator.prop('height') * invalidator.prop('rowPosition');
      }
    },
    bottom: {
      calcul: function(invalidator) {
        return invalidator.prop('height') * (invalidator.prop('rowPosition') + 1);
      }
    }
  });

  return GridRow;

}).call(this);

return(GridRow);});
},{"./GridCell":71,"spark-starter":93}],73:[function(require,module,exports){
if(module){
  module.exports = {
    Grid: require('./Grid.js'),
    GridCell: require('./GridCell.js'),
    GridRow: require('./GridRow.js')
  };
}
},{"./Grid.js":70,"./GridCell.js":71,"./GridRow.js":72}],74:[function(require,module,exports){
(function(definition){var Binder=definition(typeof Spark!=="undefined"?Spark:this.Spark);Binder.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Binder;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Binder=Binder;}else{if(this.Spark==null){this.Spark={};}this.Spark.Binder=Binder;}}})(function(){
var Binder;
Binder = (function() {
  class Binder {
    bind() {
      if (!this.binded && (this.callback != null) && (this.target != null)) {
        this.doBind();
      }
      return this.binded = true;
    }
    doBind() {
      throw new Error('Not implemented');
    }
    unbind() {
      if (this.binded && (this.callback != null) && (this.target != null)) {
        this.doUnbind();
      }
      return this.binded = false;
    }
    doUnbind() {
      throw new Error('Not implemented');
    }
    equals(binder) {
      return this.constructor.compareRefered(binder, this);
    }
    getRef() {}
    static compareRefered(obj1, obj2) {
      return obj1 === obj2 || ((obj1 != null) && (obj2 != null) && obj1.constructor === obj2.constructor && this.compareRef(obj1.ref, obj2.ref));
    }
    static compareRef(ref1, ref2) {
      return (ref1 != null) && (ref2 != null) && (ref1 === ref2 || (Array.isArray(ref1) && Array.isArray(ref1) && ref1.every((val, i) => {
        return this.compareRefered(ref1[i], ref2[i]);
      })) || (typeof ref1 === "object" && typeof ref2 === "object" && Object.keys(ref1).join() === Object.keys(ref2).join() && Object.keys(ref1).every((key) => {
        return this.compareRefered(ref1[key], ref2[key]);
      })));
    }
  };
  Object.defineProperty(Binder.prototype, 'ref', {
    get: function() {
      return this.getRef();
    }
  });
  return Binder;
}).call(this);
return(Binder);});


},{}],75:[function(require,module,exports){
(function(definition){var Collection=definition(typeof Spark!=="undefined"?Spark:this.Spark);Collection.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Collection;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Collection=Collection;}else{if(this.Spark==null){this.Spark={};}this.Spark.Collection=Collection;}}})(function(){
var Collection;
Collection = (function() {
  class Collection {
    constructor(arr) {
      if (arr != null) {
        if (typeof arr.toArray === 'function') {
          this._array = arr.toArray();
        } else if (Array.isArray(arr)) {
          this._array = arr;
        } else {
          this._array = [arr];
        }
      } else {
        this._array = [];
      }
    }
    changed() {}
    checkChanges(old, ordered = true, compareFunction = null) {
      if (compareFunction == null) {
        compareFunction = function(a, b) {
          return a === b;
        };
      }
      old = this.copy(old.slice());
      return this.count() !== old.length || (ordered ? this.some(function(val, i) {
        return !compareFunction(old.get(i), val);
      }) : this.some(function(a) {
        return !old.pluck(function(b) {
          return compareFunction(a, b);
        });
      }));
    }
    get(i) {
      return this._array[i];
    }
    set(i, val) {
      var old;
      if (this._array[i] !== val) {
        old = this.toArray();
        this._array[i] = val;
        this.changed(old);
      }
      return val;
    }
    add(val) {
      if (!this._array.includes(val)) {
        return this.push(val);
      }
    }
    remove(val) {
      var index, old;
      index = this._array.indexOf(val);
      if (index !== -1) {
        old = this.toArray();
        this._array.splice(index, 1);
        return this.changed(old);
      }
    }
    pluck(fn) {
      var found, index, old;
      index = this._array.findIndex(fn);
      if (index > -1) {
        old = this.toArray();
        found = this._array[index];
        this._array.splice(index, 1);
        this.changed(old);
        return found;
      } else {
        return null;
      }
    }
    toArray() {
      return this._array.slice();
    }
    count() {
      return this._array.length;
    }
    static newSubClass(fn, arr) {
      var SubClass;
      if (typeof fn === 'object') {
        SubClass = class extends this {};
        Object.assign(SubClass.prototype, fn);
        return new SubClass(arr);
      } else {
        return new this(arr);
      }
    }
    copy(arr) {
      var coll;
      if (arr == null) {
        arr = this.toArray();
      }
      coll = new this.constructor(arr);
      return coll;
    }
    equals(arr) {
      return (this.count() === (typeof arr.count === 'function' ? arr.count() : arr.length)) && this.every(function(val, i) {
        return arr[i] === val;
      });
    }
    getAddedFrom(arr) {
      return this._array.filter(function(item) {
        return !arr.includes(item);
      });
    }
    getRemovedFrom(arr) {
      return arr.filter((item) => {
        return !this.includes(item);
      });
    }
  };
  Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString'];
  Collection.readListFunctions = ['concat', 'filter', 'slice'];
  Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];
  Collection.readFunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function(...arg) {
      return this._array[funct](...arg);
    };
  });
  Collection.readListFunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function(...arg) {
      return this.copy(this._array[funct](...arg));
    };
  });
  Collection.writefunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function(...arg) {
      var old, res;
      old = this.toArray();
      res = this._array[funct](...arg);
      this.changed(old);
      return res;
    };
  });
  return Collection;
}).call(this);
Object.defineProperty(Collection.prototype, 'length', {
  get: function() {
    return this.count();
  }
});
if (typeof Symbol !== "undefined" && Symbol !== null ? Symbol.iterator : void 0) {
  Collection.prototype[Symbol.iterator] = function() {
    return this._array[Symbol.iterator]();
  };
}
return(Collection);});


},{}],76:[function(require,module,exports){
(function(definition){var Element=definition(typeof Spark!=="undefined"?Spark:this.Spark);Element.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Element;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Element=Element;}else{if(this.Spark==null){this.Spark={};}this.Spark.Element=Element;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : require('./Property');
var Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : require('./Mixable');
var Element;
Element = class Element extends Mixable {
  tap(name) {
    var args;
    args = Array.prototype.slice.call(arguments);
    if (typeof name === 'function') {
      name.apply(this, args.slice(1));
    } else {
      this[name].apply(this, args.slice(1));
    }
    return this;
  }

  callback(name) {
    if (this._callbacks == null) {
      this._callbacks = {};
    }
    if (this._callbacks[name] == null) {
      this._callbacks[name] = (...args) => {
        this[name].apply(this, args);
        return null;
      };
      this._callbacks[name].owner = this;
    }
    return this._callbacks[name];
  }

  getFinalProperties() {
    if (this._properties != null) {
      return ['_properties'].concat(this._properties.map(function(prop) {
        return prop.name;
      }));
    } else {
      return [];
    }
  }

  extended(target) {
    var i, len, options, property, ref, results;
    if (this._properties != null) {
      ref = this._properties;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        property = ref[i];
        options = Object.assign({}, property.options);
        results.push((new Property(property.name, options)).bind(target));
      }
      return results;
    }
  }

  static property(prop, desc) {
    return (new Property(prop, desc)).bind(this.prototype);
  }

  static properties(properties) {
    var desc, prop, results;
    results = [];
    for (prop in properties) {
      desc = properties[prop];
      results.push(this.property(prop, desc));
    }
    return results;
  }

};

return(Element);});


},{"./Mixable":80,"./Property":82}],77:[function(require,module,exports){
(function(definition){var EventBind=definition(typeof Spark!=="undefined"?Spark:this.Spark);EventBind.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=EventBind;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.EventBind=EventBind;}else{if(this.Spark==null){this.Spark={};}this.Spark.EventBind=EventBind;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('./Binder');
var EventBind;
EventBind = class EventBind extends Binder {
  constructor(event1, target1, callback) {
    super();
    this.event = event1;
    this.target = target1;
    this.callback = callback;
  }

  getRef() {
    return {
      event: this.event,
      target: this.target,
      callback: this.callback
    };
  }

  doBind() {
    if (typeof this.target.addEventListener === 'function') {
      return this.target.addEventListener(this.event, this.callback);
    } else if (typeof this.target.addListener === 'function') {
      return this.target.addListener(this.event, this.callback);
    } else if (typeof this.target.on === 'function') {
      return this.target.on(this.event, this.callback);
    } else {
      throw new Error('No function to add event listeners was found');
    }
  }

  doUnbind() {
    if (typeof this.target.removeEventListener === 'function') {
      return this.target.removeEventListener(this.event, this.callback);
    } else if (typeof this.target.removeListener === 'function') {
      return this.target.removeListener(this.event, this.callback);
    } else if (typeof this.target.off === 'function') {
      return this.target.off(this.event, this.callback);
    } else {
      throw new Error('No function to remove event listeners was found');
    }
  }

  equals(eventBind) {
    return super.equals(eventBind) && eventBind.event === this.event;
  }

  match(event, target) {
    return event === this.event && target === this.target;
  }

  static checkEmitter(emitter, fatal = true) {
    if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
      return true;
    } else if (fatal) {
      throw new Error('No function to add event listeners was found');
    } else {
      return false;
    }
  }

};

return(EventBind);});


},{"./Binder":74}],78:[function(require,module,exports){
(function(definition){var EventEmitter=definition(typeof Spark!=="undefined"?Spark:this.Spark);EventEmitter.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=EventEmitter;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.EventEmitter=EventEmitter;}else{if(this.Spark==null){this.Spark={};}this.Spark.EventEmitter=EventEmitter;}}})(function(){
var EventEmitter;
EventEmitter = (function() {
  class EventEmitter {
    getAllEvents() {
      return this._events || (this._events = {});
    }
    getListeners(e) {
      var events;
      events = this.getAllEvents();
      return events[e] || (events[e] = []);
    }
    hasListener(e, listener) {
      return this.getListeners(e).includes(listener);
    }
    addListener(e, listener) {
      if (!this.hasListener(e, listener)) {
        this.getListeners(e).push(listener);
        return this.listenerAdded(e, listener);
      }
    }
    listenerAdded(e, listener) {}
    removeListener(e, listener) {
      var index, listeners;
      listeners = this.getListeners(e);
      index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        return this.listenerRemoved(e, listener);
      }
    }
    listenerRemoved(e, listener) {}
    emitEvent(e, ...args) {
      var listeners;
      listeners = this.getListeners(e).slice();
      return listeners.forEach(function(listener) {
        return listener(...args);
      });
    }
  };
  EventEmitter.prototype.emit = EventEmitter.prototype.emitEvent;
  EventEmitter.prototype.trigger = EventEmitter.prototype.emitEvent;
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  return EventEmitter;
}).call(this);
return(EventEmitter);});


},{}],79:[function(require,module,exports){
(function(definition){var Invalidator=definition(typeof Spark!=="undefined"?Spark:this.Spark);Invalidator.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Invalidator;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Invalidator=Invalidator;}else{if(this.Spark==null){this.Spark={};}this.Spark.Invalidator=Invalidator;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('./Binder');
var EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : require('./EventBind');
var Invalidator, pluck;
pluck = function(arr, fn) {
  var found, index;
  index = arr.findIndex(fn);
  if (index > -1) {
    found = arr[index];
    arr.splice(index, 1);
    return found;
  } else {
    return null;
  }
};

Invalidator = (function() {
  class Invalidator extends Binder {
    constructor(property, obj = null) {
      super();
      this.property = property;
      this.obj = obj;
      this.invalidationEvents = [];
      this.recycled = [];
      this.unknowns = [];
      this.strict = this.constructor.strict;
      this.invalidated = false;
      this.invalidateCallback = () => {
        this.invalidate();
        return null;
      };
      this.invalidateCallback.owner = this;
    }

    invalidate() {
      var functName;
      this.invalidated = true;
      if (typeof this.property === "function") {
        return this.property();
      } else if (typeof this.callback === "function") {
        return this.callback();
      } else if ((this.property != null) && typeof this.property.invalidate === "function") {
        return this.property.invalidate();
      } else if (typeof this.property === "string") {
        functName = 'invalidate' + this.property.charAt(0).toUpperCase() + this.property.slice(1);
        if (typeof this.obj[functName] === "function") {
          return this.obj[functName]();
        } else {
          return this.obj[this.property] = null;
        }
      }
    }

    unknown() {
      if (typeof this.property.unknown === "function") {
        return this.property.unknown();
      } else {
        return this.invalidate();
      }
    }

    addEventBind(event, target, callback) {
      return this.addBinder(new EventBind(event, target, callback));
    }

    addBinder(binder) {
      if (binder.callback == null) {
        binder.callback = this.invalidateCallback;
      }
      if (!this.invalidationEvents.some(function(eventBind) {
        return eventBind.equals(binder);
      })) {
        return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
          return eventBind.equals(binder);
        }) || binder);
      }
    }

    getUnknownCallback(prop, target) {
      var callback;
      callback = () => {
        return this.addUnknown(function() {
          return target[prop];
        }, prop, target);
      };
      callback.ref = {
        prop: prop,
        target: target
      };
      return callback;
    }

    addUnknown(fn, prop, target) {
      if (!this.findUnknown(prop, target)) {
        fn.ref = {
          "prop": prop,
          "target": target
        };
        this.unknowns.push(fn);
        return this.unknown();
      }
    }

    findUnknown(prop, target) {
      if ((prop != null) || (target != null)) {
        return this.unknowns.find(function(unknown) {
          return unknown.ref.prop === prop && unknown.ref.target === target;
        });
      }
    }

    event(event, target = this.obj) {
      if (this.checkEmitter(target)) {
        return this.addEventBind(event, target);
      }
    }

    value(val, event, target = this.obj) {
      this.event(event, target);
      return val;
    }

    prop(prop, target = this.obj) {
      if (typeof prop !== 'string') {
        throw new Error('Property name must be a string');
      }
      if (this.checkEmitter(target)) {
        this.addEventBind(prop + 'Invalidated', target, this.getUnknownCallback(prop, target));
        return this.value(target[prop], prop + 'Updated', target);
      } else {
        return target[prop];
      }
    }

    propInitiated(prop, target = this.obj) {
      var initiated;
      initiated = target.getPropertyInstance(prop).initiated;
      if (!initiated && this.checkEmitter(target)) {
        this.event(prop + 'Updated', target);
      }
      return initiated;
    }

    funct(funct) {
      var invalidator, res;
      invalidator = new Invalidator(() => {
        return this.addUnknown(() => {
          var res2;
          res2 = funct(invalidator);
          if (res !== res2) {
            return this.invalidate();
          }
        }, invalidator);
      });
      res = funct(invalidator);
      this.invalidationEvents.push(invalidator);
      return res;
    }

    validateUnknowns(prop, target = this.obj) {
      var unknowns;
      unknowns = this.unknowns;
      this.unknowns = [];
      return unknowns.forEach(function(unknown) {
        return unknown();
      });
    }

    isEmpty() {
      return this.invalidationEvents.length === 0;
    }

    bind() {
      this.invalidated = false;
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.bind();
      });
    }

    recycle(callback) {
      var done, res;
      this.recycled = this.invalidationEvents;
      this.invalidationEvents = [];
      done = () => {
        this.recycled.forEach(function(eventBind) {
          return eventBind.unbind();
        });
        return this.recycled = [];
      };
      if (typeof callback === "function") {
        if (callback.length > 1) {
          return callback(this, done);
        } else {
          res = callback(this);
          done();
          return res;
        }
      } else {
        return done;
      }
    }

    checkEmitter(emitter) {
      return EventBind.checkEmitter(emitter, this.strict);
    }

    unbind() {
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.unbind();
      });
    }

  };

  Invalidator.strict = true;

  return Invalidator;

}).call(this);

return(Invalidator);});


},{"./Binder":74,"./EventBind":77}],80:[function(require,module,exports){
(function(definition){var Mixable=definition(typeof Spark!=="undefined"?Spark:this.Spark);Mixable.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Mixable;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Mixable=Mixable;}else{if(this.Spark==null){this.Spark={};}this.Spark.Mixable=Mixable;}}})(function(){
var Mixable,
  indexOf = [].indexOf;
Mixable = (function() {
  class Mixable {
    static extend(obj) {
      this.Extension.make(obj, this);
      if (obj.prototype != null) {
        return this.Extension.make(obj.prototype, this.prototype);
      }
    }
    static include(obj) {
      return this.Extension.make(obj, this.prototype);
    }
  };
  Mixable.Extension = {
    make: function(source, target) {
      var i, len, prop, ref;
      ref = this.getExtensionProperties(source, target);
      for (i = 0, len = ref.length; i < len; i++) {
        prop = ref[i];
        Object.defineProperty(target, prop.name, prop);
      }
      target.extensions = (target.extensions || []).concat([source]);
      if (typeof source.extended === 'function') {
        return source.extended(target);
      }
    },
    alwaysFinal: ['extended', 'extensions', '__super__', 'constructor'],
    getExtensionProperties: function(source, target) {
      var alwaysFinal, props, targetChain;
      alwaysFinal = this.alwaysFinal;
      targetChain = this.getPrototypeChain(target);
      props = [];
      this.getPrototypeChain(source).every(function(obj) {
        var exclude;
        if (!targetChain.includes(obj)) {
          exclude = alwaysFinal;
          if (source.getFinalProperties != null) {
            exclude = exclude.concat(source.getFinalProperties());
          }
          if (typeof obj === 'function') {
            exclude = exclude.concat(["length", "prototype", "name"]);
          }
          props = props.concat(Object.getOwnPropertyNames(obj).filter((key) => {
            return !target.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && !props.find(function(prop) {
              return prop.name === key;
            });
          }).map(function(key) {
            var prop;
            prop = Object.getOwnPropertyDescriptor(obj, key);
            prop.name = key;
            return prop;
          }));
          return true;
        }
      });
      return props;
    },
    getPrototypeChain: function(obj) {
      var basePrototype, chain;
      chain = [];
      basePrototype = Object.getPrototypeOf(Object);
      while (true) {
        chain.push(obj);
        if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== basePrototype)) {
          break;
        }
      }
      return chain;
    }
  };
  return Mixable;
}).call(this);
return(Mixable);});


},{}],81:[function(require,module,exports){
(function(definition){var Overrider=definition(typeof Spark!=="undefined"?Spark:this.Spark);Overrider.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Overrider;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Overrider=Overrider;}else{if(this.Spark==null){this.Spark={};}this.Spark.Overrider=Overrider;}}})(function(){
var Overrider;
Overrider = (function() {
  class Overrider {
    static overrides(overrides) {
      return this.Override.applyMany(this.prototype, this.name, overrides);
    }
    getFinalProperties() {
      if (this._overrides != null) {
        return ['_overrides'].concat(Object.keys(this._overrides));
      } else {
        return [];
      }
    }
    extended(target) {
      if (this._overrides != null) {
        this.constructor.Override.applyMany(target, this.constructor.name, this._overrides);
      }
      if (this.constructor === Overrider) {
        return target.extended = this.extended;
      }
    }
  };
  Overrider.Override = {
    makeMany: function(target, namespace, overrides) {
      var fn, key, override, results;
      results = [];
      for (key in overrides) {
        fn = overrides[key];
        results.push(override = this.make(target, namespace, key, fn));
      }
      return results;
    },
    applyMany: function(target, namespace, overrides) {
      var key, override, results;
      results = [];
      for (key in overrides) {
        override = overrides[key];
        if (typeof override === "function") {
          override = this.make(target, namespace, key, override);
        }
        results.push(this.apply(target, namespace, override));
      }
      return results;
    },
    make: function(target, namespace, fnName, fn) {
      var override;
      override = {
        fn: {
          current: fn
        },
        name: fnName
      };
      override.fn['with' + namespace] = fn;
      return override;
    },
    emptyFn: function() {},
    apply: function(target, namespace, override) {
      var fnName, overrides, ref, ref1, without;
      fnName = override.name;
      overrides = target._overrides != null ? Object.assign({}, target._overrides) : {};
      without = ((ref = target._overrides) != null ? (ref1 = ref[fnName]) != null ? ref1.fn.current : void 0 : void 0) || target[fnName];
      override = Object.assign({}, override);
      if (overrides[fnName] != null) {
        override.fn = Object.assign({}, overrides[fnName].fn, override.fn);
      } else {
        override.fn = Object.assign({}, override.fn);
      }
      override.fn['without' + namespace] = without || this.emptyFn;
      if (without == null) {
        override.missingWithout = 'without' + namespace;
      } else if (override.missingWithout) {
        override.fn[override.missingWithout] = without;
      }
      Object.defineProperty(target, fnName, {
        configurable: true,
        get: function() {
          var finalFn, fn, key, ref2;
          finalFn = override.fn.current.bind(this);
          ref2 = override.fn;
          for (key in ref2) {
            fn = ref2[key];
            finalFn[key] = fn.bind(this);
          }
          if (this.constructor.prototype !== this) {
            Object.defineProperty(this, fnName, {
              value: finalFn
            });
          }
          return finalFn;
        }
      });
      overrides[fnName] = override;
      return target._overrides = overrides;
    }
  };
  return Overrider;
}).call(this);
return(Overrider);});


},{}],82:[function(require,module,exports){
(function(definition){var Property=definition(typeof Spark!=="undefined"?Spark:this.Spark);Property.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Property;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Property=Property;}else{if(this.Spark==null){this.Spark={};}this.Spark.Property=Property;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : require('./PropertyTypes/BasicProperty');
var CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : require('./PropertyTypes/CollectionProperty');
var ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : require('./PropertyTypes/ComposedProperty');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./PropertyTypes/DynamicProperty');
var CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : require('./PropertyTypes/CalculatedProperty');
var InvalidatedProperty = dependencies.hasOwnProperty("InvalidatedProperty") ? dependencies.InvalidatedProperty : require('./PropertyTypes/InvalidatedProperty');
var ActivableProperty = dependencies.hasOwnProperty("ActivableProperty") ? dependencies.ActivableProperty : require('./PropertyTypes/ActivableProperty');
var UpdatedProperty = dependencies.hasOwnProperty("UpdatedProperty") ? dependencies.UpdatedProperty : require('./PropertyTypes/UpdatedProperty');
var PropertyOwner = dependencies.hasOwnProperty("PropertyOwner") ? dependencies.PropertyOwner : require('./PropertyOwner');
var Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : require('./Mixable');
var Property;
Property = (function() {
  class Property {
    constructor(name, options = {}) {
      this.name = name;
      this.options = options;
    }

    bind(target) {
      var parent, prop;
      prop = this;
      if (!(typeof target.getProperty === 'function' && target.getProperty(this.name) === this)) {
        if (typeof target.getProperty === 'function' && ((parent = target.getProperty(this.name)) != null)) {
          this.override(parent);
        }
        this.getInstanceType().bind(target, prop);
        target._properties = (target._properties || []).concat([prop]);
        if (parent != null) {
          target._properties = target._properties.filter(function(existing) {
            return existing !== parent;
          });
        }
        this.makeOwner(target);
      }
      return prop;
    }

    override(parent) {
      var key, ref, results, value;
      if (this.options.parent == null) {
        this.options.parent = parent.options;
        ref = parent.options;
        results = [];
        for (key in ref) {
          value = ref[key];
          if (typeof this.options[key] === 'function' && typeof value === 'function') {
            results.push(this.options[key].overrided = value);
          } else if (typeof this.options[key] === 'undefined') {
            results.push(this.options[key] = value);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    }

    makeOwner(target) {
      var ref;
      if (!((ref = target.extensions) != null ? ref.includes(PropertyOwner.prototype) : void 0)) {
        return Mixable.Extension.make(PropertyOwner.prototype, target);
      }
    }

    getInstanceVarName() {
      return this.options.instanceVarName || '_' + this.name;
    }

    isInstantiated(obj) {
      return obj[this.getInstanceVarName()] != null;
    }

    getInstance(obj) {
      var Type, varName;
      varName = this.getInstanceVarName();
      if (!this.isInstantiated(obj)) {
        Type = this.getInstanceType();
        obj[varName] = new Type(this, obj);
      }
      return obj[varName];
    }

    getInstanceType() {
      if (!this.instanceType) {
        this.composers.forEach((composer) => {
          return composer.compose(this);
        });
      }
      return this.instanceType;
    }

  };

  Property.prototype.composers = [ComposedProperty, CollectionProperty, DynamicProperty, BasicProperty, UpdatedProperty, CalculatedProperty, InvalidatedProperty, ActivableProperty];

  return Property;

}).call(this);

return(Property);});


},{"./Mixable":80,"./PropertyOwner":83,"./PropertyTypes/ActivableProperty":84,"./PropertyTypes/BasicProperty":85,"./PropertyTypes/CalculatedProperty":86,"./PropertyTypes/CollectionProperty":87,"./PropertyTypes/ComposedProperty":88,"./PropertyTypes/DynamicProperty":89,"./PropertyTypes/InvalidatedProperty":90,"./PropertyTypes/UpdatedProperty":91}],83:[function(require,module,exports){
(function(definition){var PropertyOwner=definition(typeof Spark!=="undefined"?Spark:this.Spark);PropertyOwner.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PropertyOwner;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.PropertyOwner=PropertyOwner;}else{if(this.Spark==null){this.Spark={};}this.Spark.PropertyOwner=PropertyOwner;}}})(function(){
var PropertyOwner;
PropertyOwner = class PropertyOwner {
  getProperty(name) {
    return this._properties && this._properties.find(function(prop) {
      return prop.name === name;
    });
  }
  getPropertyInstance(name) {
    var res;
    res = this.getProperty(name);
    if (res) {
      return res.getInstance(this);
    }
  }
  getProperties() {
    return this._properties.slice();
  }
  getPropertyInstances() {
    return this._properties.map((prop) => {
      return prop.getInstance(this);
    });
  }
  getInstantiatedProperties() {
    return this._properties.filter((prop) => {
      return prop.isInstantiated(this);
    }).map((prop) => {
      return prop.getInstance(this);
    });
  }
  getManualDataProperties() {
    return this._properties.reduce((res, prop) => {
      var instance;
      if (prop.isInstantiated(this)) {
        instance = prop.getInstance(this);
        if (instance.calculated && instance.manual) {
          res[prop.name] = instance.value;
        }
      }
      return res;
    }, {});
  }
  setProperties(data, options = {}) {
    var key, prop, val;
    for (key in data) {
      val = data[key];
      if (((options.whitelist == null) || options.whitelist.indexOf(key) !== -1) && ((options.blacklist == null) || options.blacklist.indexOf(key) === -1)) {
        prop = this.getPropertyInstance(key);
        if (prop != null) {
          prop.set(val);
        }
      }
    }
    return this;
  }
  destroyProperties() {
    this.getInstantiatedProperties().forEach((prop) => {
      return prop.destroy();
    });
    this._properties = [];
    return true;
  }
  listenerAdded(event, listener) {
    return this._properties.forEach((prop) => {
      if (prop.getInstanceType().prototype.changeEventName === event) {
        return prop.getInstance(this).get();
      }
    });
  }
  extended(target) {
    return target.listenerAdded = this.listenerAdded;
  }
};
return(PropertyOwner);});


},{}],84:[function(require,module,exports){
(function(definition){var ActivableProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);ActivableProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ActivableProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ActivableProperty=ActivableProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.ActivableProperty=ActivableProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : require('./BasicProperty');
var Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : require('../Overrider');
var ActivableProperty;
ActivableProperty = (function() {
  class ActivableProperty extends BasicProperty {
    isActive() {
      return true;
    }

    manualActive() {
      return this.active;
    }

    callbackActive() {
      var invalidator;
      invalidator = this.activeInvalidator || new Invalidator(this, this.obj);
      invalidator.recycle((invalidator, done) => {
        this.active = this.callOptionFunct(this.activeFunct, invalidator);
        done();
        if (this.active || invalidator.isEmpty()) {
          invalidator.unbind();
          return this.activeInvalidator = null;
        } else {
          this.invalidator = invalidator;
          this.activeInvalidator = invalidator;
          return invalidator.bind();
        }
      });
      return this.active;
    }

    static compose(prop) {
      if (typeof prop.options.active !== "undefined") {
        prop.instanceType.extend(ActivableProperty);
        if (typeof prop.options.active === "boolean") {
          prop.instanceType.prototype.active = prop.options.active;
          return prop.instanceType.prototype.isActive = this.prototype.manualActive;
        } else if (typeof prop.options.active === 'function') {
          prop.instanceType.prototype.activeFunct = prop.options.active;
          return prop.instanceType.prototype.isActive = this.prototype.callbackActive;
        }
      }
    }

  };

  ActivableProperty.extend(Overrider);

  ActivableProperty.overrides({
    get: function() {
      var out;
      if (this.isActive()) {
        out = this.get.withoutActivableProperty();
        if (this.pendingChanges) {
          this.changed(this.pendingOld);
        }
        return out;
      } else {
        this.initiated = true;
        return void 0;
      }
    },
    changed: function(old) {
      if (this.isActive()) {
        this.pendingChanges = false;
        this.pendingOld = void 0;
        this.changed.withoutActivableProperty(old);
      } else {
        this.pendingChanges = true;
        if (typeof this.pendingOld === 'undefined') {
          this.pendingOld = old;
        }
      }
      return this;
    }
  });

  return ActivableProperty;

}).call(this);

return(ActivableProperty);});


},{"../Invalidator":79,"../Overrider":81,"./BasicProperty":85}],85:[function(require,module,exports){
(function(definition){var BasicProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);BasicProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=BasicProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.BasicProperty=BasicProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.BasicProperty=BasicProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : require('../Mixable');
var BasicProperty;
BasicProperty = class BasicProperty extends Mixable {
  constructor(property, obj) {
    super();
    this.property = property;
    this.obj = obj;
    this.init();
  }

  init() {
    this.value = this.ingest(this.default);
    return this.calculated = false;
  }

  get() {
    this.calculated = true;
    return this.output();
  }

  set(val) {
    return this.setAndCheckChanges(val);
  }

  callbackSet(val) {
    this.callOptionFunct("set", val);
    return this;
  }

  setAndCheckChanges(val) {
    var old;
    val = this.ingest(val);
    this.revalidated();
    if (this.checkChanges(val, this.value)) {
      old = this.value;
      this.value = val;
      this.manual = true;
      this.changed(old);
    }
    return this;
  }

  checkChanges(val, old) {
    return val !== old;
  }

  destroy() {}

  callOptionFunct(funct, ...args) {
    if (typeof funct === 'string') {
      funct = this.property.options[funct];
    }
    if (typeof funct.overrided === 'function') {
      args.push((...args) => {
        return this.callOptionFunct(funct.overrided, ...args);
      });
    }
    return funct.apply(this.obj, args);
  }

  revalidated() {
    this.calculated = true;
    return this.initiated = true;
  }

  ingest(val) {
    if (typeof this.property.options.ingest === 'function') {
      return val = this.callOptionFunct("ingest", val);
    } else {
      return val;
    }
  }

  output() {
    if (typeof this.property.options.output === 'function') {
      return this.callOptionFunct("output", this.value);
    } else {
      return this.value;
    }
  }

  changed(old) {
    this.callChangedFunctions(old);
    if (typeof this.obj.emitEvent === 'function') {
      this.obj.emitEvent(this.updateEventName, [old]);
      this.obj.emitEvent(this.changeEventName, [old]);
    }
    return this;
  }

  callChangedFunctions(old) {
    if (typeof this.property.options.change === 'function') {
      return this.callOptionFunct("change", old);
    }
  }

  hasChangedFunctions() {
    return typeof this.property.options.change === 'function';
  }

  hasChangedEvents() {
    return typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.changeEventName).length > 0;
  }

  static compose(prop) {
    if (prop.instanceType == null) {
      prop.instanceType = class extends BasicProperty {};
    }
    if (typeof prop.options.set === 'function') {
      prop.instanceType.prototype.set = this.prototype.callbackSet;
    } else {
      prop.instanceType.prototype.set = this.prototype.setAndCheckChanges;
    }
    prop.instanceType.prototype.default = prop.options.default;
    prop.instanceType.prototype.initiated = typeof prop.options.default !== 'undefined';
    return this.setEventNames(prop);
  }

  static setEventNames(prop) {
    prop.instanceType.prototype.changeEventName = prop.options.changeEventName || prop.name + 'Changed';
    prop.instanceType.prototype.updateEventName = prop.options.updateEventName || prop.name + 'Updated';
    return prop.instanceType.prototype.invalidateEventName = prop.options.invalidateEventName || prop.name + 'Invalidated';
  }

  static bind(target, prop) {
    var maj, opt;
    maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
    opt = {
      configurable: true,
      get: function() {
        return prop.getInstance(this).get();
      }
    };
    if (prop.options.set !== false) {
      opt.set = function(val) {
        return prop.getInstance(this).set(val);
      };
    }
    Object.defineProperty(target, prop.name, opt);
    target['get' + maj] = function() {
      return prop.getInstance(this).get();
    };
    if (prop.options.set !== false) {
      target['set' + maj] = function(val) {
        prop.getInstance(this).set(val);
        return this;
      };
    }
    return target['invalidate' + maj] = function() {
      prop.getInstance(this).invalidate();
      return this;
    };
  }

};

return(BasicProperty);});


},{"../Mixable":80}],86:[function(require,module,exports){
(function(definition){var CalculatedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);CalculatedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CalculatedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CalculatedProperty=CalculatedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.CalculatedProperty=CalculatedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : require('../Overrider');
var CalculatedProperty;
CalculatedProperty = (function() {
  class CalculatedProperty extends DynamicProperty {
    calcul() {
      this.value = this.callOptionFunct(this.calculFunct);
      this.manual = false;
      this.revalidated();
      return this.value;
    }

    static compose(prop) {
      if (typeof prop.options.calcul === 'function') {
        prop.instanceType.prototype.calculFunct = prop.options.calcul;
        if (!(prop.options.calcul.length > 0)) {
          return prop.instanceType.extend(CalculatedProperty);
        }
      }
    }

  };

  CalculatedProperty.extend(Overrider);

  CalculatedProperty.overrides({
    get: function() {
      var initiated, old;
      if (this.invalidator) {
        this.invalidator.validateUnknowns();
      }
      if (!this.calculated) {
        old = this.value;
        initiated = this.initiated;
        this.calcul();
        if (this.checkChanges(this.value, old)) {
          if (initiated) {
            this.changed(old);
          } else if (typeof this.obj.emitEvent === 'function') {
            this.obj.emitEvent(this.updateEventName, [old]);
          }
        }
      }
      return this.output();
    }
  });

  return CalculatedProperty;

}).call(this);

return(CalculatedProperty);});


},{"../Invalidator":79,"../Overrider":81,"./DynamicProperty":89}],87:[function(require,module,exports){
(function(definition){var CollectionProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);CollectionProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CollectionProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CollectionProperty=CollectionProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.CollectionProperty=CollectionProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : require('../Collection');
var CollectionProperty;
CollectionProperty = (function() {
  class CollectionProperty extends DynamicProperty {
    ingest(val) {
      if (typeof this.property.options.ingest === 'function') {
        val = this.callOptionFunct("ingest", val);
      }
      if (val == null) {
        return [];
      } else if (typeof val.toArray === 'function') {
        return val.toArray();
      } else if (Array.isArray(val)) {
        return val.slice();
      } else {
        return [val];
      }
    }

    checkChangedItems(val, old) {
      var compareFunction;
      if (typeof this.collectionOptions.compare === 'function') {
        compareFunction = this.collectionOptions.compare;
      }
      return (new Collection(val)).checkChanges(old, this.collectionOptions.ordered, compareFunction);
    }

    output() {
      var col, prop, value;
      value = this.value;
      if (typeof this.property.options.output === 'function') {
        value = this.callOptionFunct("output", this.value);
      }
      prop = this;
      col = Collection.newSubClass(this.collectionOptions, value);
      col.changed = function(old) {
        return prop.changed(old);
      };
      return col;
    }

    callChangedFunctions(old) {
      if (typeof this.property.options.itemAdded === 'function') {
        this.value.forEach((item, i) => {
          if (!old.includes(item)) {
            return this.callOptionFunct("itemAdded", item, i);
          }
        });
      }
      if (typeof this.property.options.itemRemoved === 'function') {
        old.forEach((item, i) => {
          if (!this.value.includes(item)) {
            return this.callOptionFunct("itemRemoved", item, i);
          }
        });
      }
      return super.callChangedFunctions(old);
    }

    hasChangedFunctions() {
      return super.hasChangedFunctions() || typeof this.property.options.itemAdded === 'function' || typeof this.property.options.itemRemoved === 'function';
    }

    static compose(prop) {
      if (prop.options.collection != null) {
        prop.instanceType = class extends CollectionProperty {};
        prop.instanceType.prototype.collectionOptions = Object.assign({}, this.defaultCollectionOptions, typeof prop.options.collection === 'object' ? prop.options.collection : {});
        if (prop.options.collection.compare != null) {
          return prop.instanceType.prototype.checkChanges = this.prototype.checkChangedItems;
        }
      }
    }

  };

  CollectionProperty.defaultCollectionOptions = {
    compare: false,
    ordered: true
  };

  return CollectionProperty;

}).call(this);

return(CollectionProperty);});


},{"../Collection":75,"./DynamicProperty":89}],88:[function(require,module,exports){
(function(definition){var ComposedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);ComposedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ComposedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ComposedProperty=ComposedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.ComposedProperty=ComposedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : require('./CalculatedProperty');
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : require('../Collection');
var ComposedProperty;
ComposedProperty = (function() {
  class ComposedProperty extends CalculatedProperty {
    init() {
      super.init();
      return this.initComposed();
    }

    initComposed() {
      if (this.property.options.hasOwnProperty('default')) {
        this.default = this.property.options.default;
      } else {
        this.default = this.value = true;
      }
      this.members = new ComposedProperty.Members(this.property.options.members);
      this.members.changed = (old) => {
        return this.invalidate();
      };
      return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options.default === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
    }

    calcul() {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this, this.obj);
      }
      this.invalidator.recycle((invalidator, done) => {
        this.value = this.members.reduce((prev, member) => {
          var val;
          val = typeof member === 'function' ? member(this.invalidator) : member;
          return this.join(prev, val);
        }, this.default);
        done();
        if (invalidator.isEmpty()) {
          return this.invalidator = null;
        } else {
          return invalidator.bind();
        }
      });
      this.revalidated();
      return this.value;
    }

    static compose(prop) {
      if (prop.options.composed != null) {
        return prop.instanceType = class extends ComposedProperty {};
      }
    }

    static bind(target, prop) {
      CalculatedProperty.bind(target, prop);
      return Object.defineProperty(target, prop.name + 'Members', {
        configurable: true,
        get: function() {
          return prop.getInstance(this).members;
        }
      });
    }

  };

  ComposedProperty.joinFunctions = {
    and: function(a, b) {
      return a && b;
    },
    or: function(a, b) {
      return a || b;
    }
  };

  return ComposedProperty;

}).call(this);

ComposedProperty.Members = class Members extends Collection {
  addPropertyRef(name, obj) {
    var fn;
    if (this.findRefIndex(name, obj) === -1) {
      fn = function(invalidator) {
        return invalidator.prop(name, obj);
      };
      fn.ref = {
        name: name,
        obj: obj
      };
      return this.push(fn);
    }
  }

  addValueRef(val, name, obj) {
    var fn;
    if (this.findRefIndex(name, obj) === -1) {
      fn = function(invalidator) {
        return val;
      };
      fn.ref = {
        name: name,
        obj: obj,
        val: val
      };
      return this.push(fn);
    }
  }

  setValueRef(val, name, obj) {
    var fn, i, ref;
    i = this.findRefIndex(name, obj);
    if (i === -1) {
      return this.addValueRef(val, name, obj);
    } else if (this.get(i).ref.val !== val) {
      ref = {
        name: name,
        obj: obj,
        val: val
      };
      fn = function(invalidator) {
        return val;
      };
      fn.ref = ref;
      return this.set(i, fn);
    }
  }

  getValueRef(name, obj) {
    return this.findByRef(name, obj).ref.val;
  }

  addFunctionRef(fn, name, obj) {
    if (this.findRefIndex(name, obj) === -1) {
      fn.ref = {
        name: name,
        obj: obj
      };
      return this.push(fn);
    }
  }

  findByRef(name, obj) {
    return this._array[this.findRefIndex(name, obj)];
  }

  findRefIndex(name, obj) {
    return this._array.findIndex(function(member) {
      return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
    });
  }

  removeRef(name, obj) {
    var index, old;
    index = this.findRefIndex(name, obj);
    if (index !== -1) {
      old = this.toArray();
      this._array.splice(index, 1);
      return this.changed(old);
    }
  }

};

return(ComposedProperty);});


},{"../Collection":75,"../Invalidator":79,"./CalculatedProperty":86}],89:[function(require,module,exports){
(function(definition){var DynamicProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);DynamicProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=DynamicProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.DynamicProperty=DynamicProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.DynamicProperty=DynamicProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : require('./BasicProperty');
var DynamicProperty;
DynamicProperty = class DynamicProperty extends BasicProperty {
  callbackGet() {
    var res;
    res = this.callOptionFunct("get");
    this.revalidated();
    return res;
  }

  invalidate() {
    if (this.calculated || this.active === false) {
      this.calculated = false;
      this._invalidateNotice();
    }
    return this;
  }

  _invalidateNotice() {
    if (this.isImmediate()) {
      this.get();
      return false;
    } else {
      if (typeof this.obj.emitEvent === 'function') {
        this.obj.emitEvent(this.invalidateEventName);
      }
      return true;
    }
  }

  isImmediate() {
    return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : this.hasChangedEvents() || this.hasChangedFunctions()));
  }

  static compose(prop) {
    if (typeof prop.options.get === 'function' || typeof prop.options.calcul === 'function' || typeof prop.options.active === 'function') {
      if (prop.instanceType == null) {
        prop.instanceType = class extends DynamicProperty {};
      }
    }
    if (typeof prop.options.get === 'function') {
      return prop.instanceType.prototype.get = this.prototype.callbackGet;
    }
  }

};

return(DynamicProperty);});


},{"../Invalidator":79,"./BasicProperty":85}],90:[function(require,module,exports){
(function(definition){var InvalidatedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);InvalidatedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=InvalidatedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.InvalidatedProperty=InvalidatedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.InvalidatedProperty=InvalidatedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : require('./CalculatedProperty');
var InvalidatedProperty;
InvalidatedProperty = (function() {
  class InvalidatedProperty extends CalculatedProperty {
    unknown() {
      if (this.calculated || this.active === false) {
        this._invalidateNotice();
      }
      return this;
    }

    static compose(prop) {
      if (typeof prop.options.calcul === 'function' && prop.options.calcul.length > 0) {
        return prop.instanceType.extend(InvalidatedProperty);
      }
    }

  };

  InvalidatedProperty.overrides({
    calcul: function() {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this, this.obj);
      }
      this.invalidator.recycle((invalidator, done) => {
        this.value = this.callOptionFunct(this.calculFunct, invalidator);
        this.manual = false;
        done();
        if (invalidator.isEmpty()) {
          return this.invalidator = null;
        } else {
          return invalidator.bind();
        }
      });
      this.revalidated();
      return this.value;
    },
    destroy: function() {
      this.destroy.withoutInvalidatedProperty();
      if (this.invalidator != null) {
        return this.invalidator.unbind();
      }
    },
    invalidate: function() {
      if (this.calculated || this.active === false) {
        this.calculated = false;
        if (this._invalidateNotice() && !this.calculated && (this.invalidator != null)) {
          this.invalidator.unbind();
        }
      }
      return this;
    }
  });

  return InvalidatedProperty;

}).call(this);

return(InvalidatedProperty);});


},{"../Invalidator":79,"./CalculatedProperty":86}],91:[function(require,module,exports){
(function(definition){var UpdatedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);UpdatedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=UpdatedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.UpdatedProperty=UpdatedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.UpdatedProperty=UpdatedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : require('../Overrider');
var UpdatedProperty;
UpdatedProperty = (function() {
  class UpdatedProperty extends DynamicProperty {
    initRevalidate() {
      this.revalidateCallback = () => {
        this.updating = true;
        this.get();
        this.getUpdater().unbind();
        if (this.pendingChanges) {
          this.changed(this.pendingOld);
        }
        return this.updating = false;
      };
      return this.revalidateCallback.owner = this;
    }

    getUpdater() {
      if (typeof this.updater === 'undefined') {
        if (this.property.options.updater != null) {
          this.updater = this.property.options.updater;
          if (typeof this.updater.getBinder === 'function') {
            this.updater = this.updater.getBinder();
          }
          if (typeof this.updater.bind !== 'function' || typeof this.updater.unbind !== 'function') {
            this.updater = null;
          } else {
            this.updater.callback = this.revalidateCallback;
          }
        } else {
          this.updater = null;
        }
      }
      return this.updater;
    }

    static compose(prop) {
      if (prop.options.updater != null) {
        return prop.instanceType.extend(UpdatedProperty);
      }
    }

  };

  UpdatedProperty.extend(Overrider);

  UpdatedProperty.overrides({
    init: function() {
      this.init.withoutUpdatedProperty();
      return this.initRevalidate();
    },
    _invalidateNotice: function() {
      var res;
      res = this._invalidateNotice.withoutUpdatedProperty();
      if (res) {
        this.getUpdater().bind();
      }
      return res;
    },
    isImmediate: function() {
      return false;
    },
    changed: function(old) {
      if (this.updating) {
        this.pendingChanges = false;
        this.pendingOld = void 0;
        this.changed.withoutUpdatedProperty(old);
      } else {
        this.pendingChanges = true;
        if (typeof this.pendingOld === 'undefined') {
          this.pendingOld = old;
        }
        this.getUpdater().bind();
      }
      return this;
    }
  });

  return UpdatedProperty;

}).call(this);

return(UpdatedProperty);});


},{"../Invalidator":79,"../Overrider":81,"./DynamicProperty":89}],92:[function(require,module,exports){
(function(definition){var Updater=definition(typeof Spark!=="undefined"?Spark:this.Spark);Updater.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Updater;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Updater=Updater;}else{if(this.Spark==null){this.Spark={};}this.Spark.Updater=Updater;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('./Binder');
var Updater;
Updater = class Updater {
  constructor() {
    this.callbacks = [];
    this.next = [];
    this.updating = false;
  }

  update() {
    var callback;
    this.updating = true;
    this.next = this.callbacks.slice();
    while (this.callbacks.length > 0) {
      callback = this.callbacks.shift();
      callback();
    }
    this.callbacks = this.next;
    this.updating = false;
    return this;
  }

  addCallback(callback) {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
    if (this.updating && !this.next.includes(callback)) {
      return this.next.push(callback);
    }
  }

  nextTick(callback) {
    if (this.updating) {
      if (!this.next.includes(callback)) {
        return this.next.push(callback);
      }
    } else {
      return this.addCallback(callback);
    }
  }

  removeCallback(callback) {
    var index;
    index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
    index = this.next.indexOf(callback);
    if (index !== -1) {
      return this.next.splice(index, 1);
    }
  }

  getBinder() {
    return new Updater.Binder(this);
  }

  destroy() {
    this.callbacks = [];
    return this.next = [];
  }

};

Updater.Binder = (function(superClass) {
  class Binder extends superClass {
    constructor(target, callback1) {
      super();
      this.target = target;
      this.callback = callback1;
    }

    getRef() {
      return {
        target: this.target,
        callback: this.callback
      };
    }

    doBind() {
      return this.target.addCallback(this.callback);
    }

    doUnbind() {
      return this.target.removeCallback(this.callback);
    }

  };

  return Binder;

}).call(this, Binder);

return(Updater);});


},{"./Binder":74}],93:[function(require,module,exports){
if(module){
  module.exports = {
    Binder: require('./Binder.js'),
    Collection: require('./Collection.js'),
    Element: require('./Element.js'),
    EventBind: require('./EventBind.js'),
    EventEmitter: require('./EventEmitter.js'),
    Invalidator: require('./Invalidator.js'),
    Mixable: require('./Mixable.js'),
    Overrider: require('./Overrider.js'),
    Property: require('./Property.js'),
    PropertyOwner: require('./PropertyOwner.js'),
    Updater: require('./Updater.js'),
    ActivableProperty: require('./PropertyTypes/ActivableProperty.js'),
    BasicProperty: require('./PropertyTypes/BasicProperty.js'),
    CalculatedProperty: require('./PropertyTypes/CalculatedProperty.js'),
    CollectionProperty: require('./PropertyTypes/CollectionProperty.js'),
    ComposedProperty: require('./PropertyTypes/ComposedProperty.js'),
    DynamicProperty: require('./PropertyTypes/DynamicProperty.js'),
    InvalidatedProperty: require('./PropertyTypes/InvalidatedProperty.js'),
    UpdatedProperty: require('./PropertyTypes/UpdatedProperty.js')
  };
}
},{"./Binder.js":74,"./Collection.js":75,"./Element.js":76,"./EventBind.js":77,"./EventEmitter.js":78,"./Invalidator.js":79,"./Mixable.js":80,"./Overrider.js":81,"./Property.js":82,"./PropertyOwner.js":83,"./PropertyTypes/ActivableProperty.js":84,"./PropertyTypes/BasicProperty.js":85,"./PropertyTypes/CalculatedProperty.js":86,"./PropertyTypes/CollectionProperty.js":87,"./PropertyTypes/ComposedProperty.js":88,"./PropertyTypes/DynamicProperty.js":89,"./PropertyTypes/InvalidatedProperty.js":90,"./PropertyTypes/UpdatedProperty.js":91,"./Updater.js":92}],94:[function(require,module,exports){
(function(definition){var PathFinder=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);PathFinder.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PathFinder;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.PathFinder=PathFinder;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.PathFinder=PathFinder;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var PathFinder;
PathFinder = (function() {
  class PathFinder extends Element {
    constructor(tilesContainer, from1, to1, options = {}) {
      super();
      this.tilesContainer = tilesContainer;
      this.from = from1;
      this.to = to1;
      this.reset();
      if (options.validTile != null) {
        this.validTileCallback = options.validTile;
      }
      if (options.arrived != null) {
        this.arrivedCallback = options.arrived;
      }
      if (options.efficiency != null) {
        this.efficiencyCallback = options.efficiency;
      }
    }

    reset() {
      this.queue = [];
      this.paths = {};
      this.solution = null;
      return this.started = false;
    }

    calcul() {
      while (!this.solution && (!this.started || this.queue.length)) {
        this.step();
      }
      return this.getPath();
    }

    step() {
      var next;
      if (this.queue.length) {
        next = this.queue.pop();
        this.addNextSteps(next);
        return true;
      } else if (!this.started) {
        return this.start();
      }
    }

    start() {
      this.started = true;
      if (this.to === false || this.tileIsValid(this.to)) {
        this.addNextSteps();
        return true;
      }
    }

    getPath() {
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
    }

    getPosAtPrc(prc) {
      if (isNaN(prc)) {
        throw new Error('Invalid number');
      }
      if (this.solution) {
        return this.getPosAtTime(this.solution.getTotalLength() * prc);
      }
    }

    getPosAtTime(time) {
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
    }

    getSolutionTileList() {
      var step, tilelist;
      if (this.solution) {
        step = this.solution;
        tilelist = [step.tile];
        while (step.prev != null) {
          step = step.prev;
          tilelist.unshift(step.tile);
        }
        return tilelist;
      }
    }

    tileIsValid(tile) {
      if (this.validTileCallback != null) {
        return this.validTileCallback(tile);
      } else {
        return (tile != null) && (!tile.emulated || (tile.tile !== 0 && tile.tile !== false));
      }
    }

    getTile(x, y) {
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
    }

    getConnectedToTile(tile) {
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
    }

    addNextSteps(step = null) {
      var i, len, next, ref1, results, tile;
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
    }

    tileEqual(tileA, tileB) {
      return tileA === tileB || ((tileA.emulated || tileB.emulated) && tileA.x === tileB.x && tileA.y === tileB.y);
    }

    arrivedAtDestination(step) {
      if (this.arrivedCallback != null) {
        return this.arrivedCallback(step);
      } else {
        return this.tileEqual(step.tile, this.to);
      }
    }

    addStep(step) {
      var solutionCandidate;
      if (this.paths[step.getExit().x] == null) {
        this.paths[step.getExit().x] = {};
      }
      if (!((this.paths[step.getExit().x][step.getExit().y] != null) && this.paths[step.getExit().x][step.getExit().y].getTotalLength() <= step.getTotalLength())) {
        if (this.paths[step.getExit().x][step.getExit().y] != null) {
          this.removeStep(this.paths[step.getExit().x][step.getExit().y]);
        }
        this.paths[step.getExit().x][step.getExit().y] = step;
        this.queue.splice(this.getStepRank(step), 0, step);
        solutionCandidate = new PathFinder.Step(this, step, step.nextTile, null);
        if (this.arrivedAtDestination(solutionCandidate) && !((this.solution != null) && this.solution.prev.getTotalLength() <= step.getTotalLength())) {
          return this.solution = solutionCandidate;
        }
      }
    }

    removeStep(step) {
      var index;
      index = this.queue.indexOf(step);
      if (index > -1) {
        return this.queue.splice(index, 1);
      }
    }

    best() {
      return this.queue[this.queue.length - 1];
    }

    getStepRank(step) {
      if (this.queue.length === 0) {
        return 0;
      } else {
        return this._getStepRank(step.getEfficiency(), 0, this.queue.length - 1);
      }
    }

    _getStepRank(efficiency, min, max) {
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
    }

  };

  PathFinder.properties({
    validTileCallback: {}
  });

  return PathFinder;

}).call(this);

PathFinder.Step = class Step {
  constructor(pathFinder, prev, tile1, nextTile) {
    this.pathFinder = pathFinder;
    this.prev = prev;
    this.tile = tile1;
    this.nextTile = nextTile;
  }

  posToTileOffset(x, y) {
    var tile;
    tile = Math.floor(x) === this.tile.x && Math.floor(y) === this.tile.y ? this.tile : (this.nextTile != null) && Math.floor(x) === this.nextTile.x && Math.floor(y) === this.nextTile.y ? this.nextTile : (this.prev != null) && Math.floor(x) === this.prev.tile.x && Math.floor(y) === this.prev.tile.y ? this.prev.tile : console.log('Math.floor(' + x + ') == ' + this.tile.x, 'Math.floor(' + y + ') == ' + this.tile.y, this);
    return {
      x: x,
      y: y,
      tile: tile,
      offsetX: x - tile.x,
      offsetY: y - tile.y
    };
  }

  getExit() {
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
  }

  getEntry() {
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
  }

  getLength() {
    if (this.length == null) {
      this.length = (this.nextTile == null) || (this.prev == null) ? 0.5 : this.prev.tile.x === this.nextTile.x || this.prev.tile.y === this.nextTile.y ? 1 : Math.sqrt(0.5);
    }
    return this.length;
  }

  getStartLength() {
    if (this.startLength == null) {
      this.startLength = this.prev != null ? this.prev.getTotalLength() : 0;
    }
    return this.startLength;
  }

  getTotalLength() {
    if (this.totalLength == null) {
      this.totalLength = this.getStartLength() + this.getLength();
    }
    return this.totalLength;
  }

  getEfficiency() {
    if (this.efficiency == null) {
      if (typeof this.pathFinder.efficiencyCallback === "function") {
        this.efficiency = this.pathFinder.efficiencyCallback(this);
      } else {
        this.efficiency = -this.getRemaining() * 1.1 - this.getTotalLength();
      }
    }
    return this.efficiency;
  }

  getRemaining() {
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
  }

};

return(PathFinder);});
},{"spark-starter":114}],95:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"dup":74}],96:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"dup":75}],97:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"./Mixable":101,"./Property":103,"dup":76}],98:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"./Binder":95,"dup":77}],99:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"dup":78}],100:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"./Binder":95,"./EventBind":98,"dup":79}],101:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"dup":80}],102:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"dup":81}],103:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./Mixable":101,"./PropertyOwner":104,"./PropertyTypes/ActivableProperty":105,"./PropertyTypes/BasicProperty":106,"./PropertyTypes/CalculatedProperty":107,"./PropertyTypes/CollectionProperty":108,"./PropertyTypes/ComposedProperty":109,"./PropertyTypes/DynamicProperty":110,"./PropertyTypes/InvalidatedProperty":111,"./PropertyTypes/UpdatedProperty":112,"dup":82}],104:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"dup":83}],105:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"../Invalidator":100,"../Overrider":102,"./BasicProperty":106,"dup":84}],106:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"../Mixable":101,"dup":85}],107:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"../Invalidator":100,"../Overrider":102,"./DynamicProperty":110,"dup":86}],108:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"../Collection":96,"./DynamicProperty":110,"dup":87}],109:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"../Collection":96,"../Invalidator":100,"./CalculatedProperty":107,"dup":88}],110:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"../Invalidator":100,"./BasicProperty":106,"dup":89}],111:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"../Invalidator":100,"./CalculatedProperty":107,"dup":90}],112:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"../Invalidator":100,"../Overrider":102,"./DynamicProperty":110,"dup":91}],113:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"./Binder":95,"dup":92}],114:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./Binder.js":95,"./Collection.js":96,"./Element.js":97,"./EventBind.js":98,"./EventEmitter.js":99,"./Invalidator.js":100,"./Mixable.js":101,"./Overrider.js":102,"./Property.js":103,"./PropertyOwner.js":104,"./PropertyTypes/ActivableProperty.js":105,"./PropertyTypes/BasicProperty.js":106,"./PropertyTypes/CalculatedProperty.js":107,"./PropertyTypes/CollectionProperty.js":108,"./PropertyTypes/ComposedProperty.js":109,"./PropertyTypes/DynamicProperty.js":110,"./PropertyTypes/InvalidatedProperty.js":111,"./PropertyTypes/UpdatedProperty.js":112,"./Updater.js":113,"dup":93}],115:[function(require,module,exports){
if (typeof module !== "undefined" && module !== null) {
  module.exports = {
      greekAlphabet: require('./strings/greekAlphabet'),
      starNames: require('./strings/starNames')
  };
}
},{"./strings/greekAlphabet":116,"./strings/starNames":117}],116:[function(require,module,exports){
module.exports=[
"alpha",   "beta",    "gamma",   "delta",
"epsilon", "zeta",    "eta",     "theta",
"iota",    "kappa",   "lambda",  "mu",
"nu",      "xi",      "omicron", "pi",	
"rho",     "sigma",   "tau",     "upsilon",
"phi",     "chi",     "psi",     "omega"
]
},{}],117:[function(require,module,exports){
module.exports=[
"Achernar",     "Maia",        "Atlas",        "Salm",       "Alnilam",      "Nekkar",      "Elnath",       "Thuban",
"Achird",       "Marfik",      "Auva",         "Sargas",     "Alnitak",      "Nihal",       "Enif",         "Torcularis",
"Acrux",        "Markab",      "Avior",        "Sarin",      "Alphard",      "Nunki",       "Etamin",       "Turais",
"Acubens",      "Matar",       "Azelfafage",   "Sceptrum",   "Alphekka",     "Nusakan",     "Fomalhaut",    "Tyl",
"Adara",        "Mebsuta",     "Azha",         "Scheat",     "Alpheratz",    "Peacock",     "Fornacis",     "Unukalhai",
"Adhafera",     "Megrez",      "Azmidiske",    "Segin",      "Alrai",        "Phad",        "Furud",        "Vega",
"Adhil",        "Meissa",      "Baham",        "Seginus",    "Alrisha",      "Phaet",       "Gacrux",       "Vindemiatrix",
"Agena",        "Mekbuda",     "Becrux",       "Sham",       "Alsafi",       "Pherkad",     "Gianfar",      "Wasat",
"Aladfar",      "Menkalinan",  "Beid",         "Sharatan",   "Alsciaukat",   "Pleione",     "Gomeisa",      "Wezen",
"Alathfar",     "Menkar",      "Bellatrix",    "Shaula",     "Alshain",      "Polaris",     "Graffias",     "Wezn",
"Albaldah",     "Menkent",     "Betelgeuse",   "Shedir",     "Alshat",       "Pollux",      "Grafias",      "Yed",
"Albali",       "Menkib",      "Botein",       "Sheliak",    "Alsuhail",     "Porrima",     "Grumium",      "Yildun",
"Albireo",      "Merak",       "Brachium",     "Sirius",     "Altair",       "Praecipua",   "Hadar",        "Zaniah",
"Alchiba",      "Merga",       "Canopus",      "Situla",     "Altarf",       "Procyon",     "Haedi",        "Zaurak",
"Alcor",        "Merope",      "Capella",      "Skat",       "Alterf",       "Propus",      "Hamal",        "Zavijah",
"Alcyone",      "Mesarthim",   "Caph",         "Spica",      "Aludra",       "Rana",        "Hassaleh",     "Zibal",
"Alderamin",    "Metallah",    "Castor",       "Sterope",    "Alula",        "Ras",         "Heze",         "Zosma",
"Aldhibah",     "Miaplacidus", "Cebalrai",     "Sualocin",   "Alya",         "Rasalgethi",  "Hoedus",       "Aquarius",
"Alfirk",       "Minkar",      "Celaeno",      "Subra",      "Alzirr",       "Rasalhague",  "Homam",        "Aries",
"Algenib",      "Mintaka",     "Chara",        "Suhail",     "Ancha",        "Rastaban",    "Hyadum",       "Cepheus",
"Algieba",      "Mira",        "Chort",        "Sulafat",    "Angetenar",    "Regulus",     "Izar",         "Cetus",
"Algol",        "Mirach",      "Cursa",        "Syrma",      "Ankaa",        "Rigel",       "Jabbah",       "Columba",
"Algorab",      "Miram",       "Dabih",        "Tabit",      "Anser",        "Rotanev",     "Kajam",        "Coma",
"Alhena",       "Mirphak",     "Deneb",        "Talitha",    "Antares",      "Ruchba",      "Kaus",         "Corona",
"Alioth",       "Mizar",       "Denebola",     "Tania",      "Arcturus",     "Ruchbah",     "Keid",         "Crux",
"Alkaid",       "Mufrid",      "Dheneb",       "Tarazed",    "Arkab",        "Rukbat",      "Kitalpha",     "Draco",
"Alkalurops",   "Muliphen",    "Diadem",       "Taygeta",    "Arneb",        "Sabik",       "Kocab",        "Grus",
"Alkes",        "Murzim",      "Diphda",       "Tegmen",     "Arrakis",      "Sadalachbia", "Kornephoros",  "Hydra",
"Alkurhah",     "Muscida",     "Dschubba",     "Tejat",      "Ascella",      "Sadalmelik",  "Kraz",         "Lacerta",
"Almaak",       "Naos",        "Dsiban",       "Terebellum", "Asellus",      "Sadalsuud",   "Kuma",         "Mensa",
"Alnair",       "Nash",        "Dubhe",        "Thabit",     "Asterope",     "Sadr",        "Lesath",       "Maasym",
"Alnath",       "Nashira",     "Electra",      "Theemim",    "Atik",         "Saiph",       "Phoenix",      "Norma"
]
},{}],118:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],119:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"./Direction":118,"dup":9,"spark-starter":169}],120:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"./TileReference":121,"dup":10,"spark-starter":169}],121:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],122:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12,"spark-starter":169}],123:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"./Direction":118,"./Tile":119,"./TileContainer":120,"./TileReference":121,"./Tiled":122,"dup":13}],124:[function(require,module,exports){
(function (process){
(function(definition){var Timing=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Timing.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Timing;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Timing=Timing;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Timing=Timing;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var BaseUpdater = dependencies.hasOwnProperty("BaseUpdater") ? dependencies.BaseUpdater : require('spark-starter').Updater;
var Timing;
Timing = class Timing {
  constructor(running = true) {
    this.running = running;
    this.children = [];
  }

  addChild(child) {
    var index;
    index = this.children.indexOf(child);
    if (this.updater) {
      child.updater.dispatcher = this.updater;
    }
    if (index === -1) {
      this.children.push(child);
    }
    child.parent = this;
    return this;
  }

  removeChild(child) {
    var index;
    index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    if (child.parent === this) {
      child.parent = null;
    }
    return this;
  }

  toggle(val) {
    if (typeof val === "undefined") {
      val = !this.running;
    }
    this.running = val;
    return this.children.forEach(function(child) {
      return child.toggle(val);
    });
  }

  setTimeout(callback, time) {
    var timer;
    timer = new this.constructor.Timer(time, callback, this.running);
    this.addChild(timer);
    return timer;
  }

  setInterval(callback, time) {
    var timer;
    timer = new this.constructor.Timer(time, callback, this.running, true);
    this.addChild(timer);
    return timer;
  }

  pause() {
    return this.toggle(false);
  }

  unpause() {
    return this.toggle(true);
  }

};

Timing.Timer = class Timer {
  constructor(time1, callback, running = true, repeat = false) {
    this.time = time1;
    this.running = running;
    this.repeat = repeat;
    this.remainingTime = this.time;
    this.updater = new Timing.Updater(this);
    this.dispatcher = new BaseUpdater();
    if (callback) {
      this.dispatcher.addCallback(callback);
    }
    if (this.running) {
      this._start();
    }
  }

  static now() {
    var ref;
    if ((typeof window !== "undefined" && window !== null ? (ref = window.performance) != null ? ref.now : void 0 : void 0) != null) {
      return window.performance.now();
    } else if ((typeof process !== "undefined" && process !== null ? process.uptime : void 0) != null) {
      return process.uptime() * 1000;
    } else {
      return Date.now();
    }
  }

  toggle(val) {
    if (typeof val === "undefined") {
      val = !this.running;
    }
    if (val) {
      return this._start();
    } else {
      return this._stop();
    }
  }

  pause() {
    return this.toggle(false);
  }

  unpause() {
    return this.toggle(true);
  }

  getElapsedTime() {
    if (this.running) {
      return this.constructor.now() - this.startTime + this.time - this.remainingTime;
    } else {
      return this.time - this.remainingTime;
    }
  }

  setElapsedTime(val) {
    this._stop();
    this.remainingTime = this.time - val;
    return this._start();
  }

  getPrc() {
    return this.getElapsedTime() / this.time;
  }

  setPrc(val) {
    return this.setElapsedTime(this.time * val);
  }

  _start() {
    this.running = true;
    this.updater.forwardCallbacks();
    this.startTime = this.constructor.now();
    if (this.repeat && !this.interupted) {
      return this.id = setInterval(this.tick.bind(this), this.remainingTime);
    } else {
      return this.id = setTimeout(this.tick.bind(this), this.remainingTime);
    }
  }

  _stop() {
    var wasInterupted;
    wasInterupted = this.interupted;
    this.running = false;
    this.updater.unforwardCallbacks();
    this.remainingTime = this.time - (this.constructor.now() - this.startTime);
    this.interupted = this.remainingTime !== this.time;
    if (this.repeat && !wasInterupted) {
      return clearInterval(this.id);
    } else {
      return clearTimeout(this.id);
    }
  }

  tick() {
    var wasInterupted;
    wasInterupted = this.interupted;
    this.interupted = false;
    if (this.repeat) {
      this.remainingTime = this.time;
    } else {
      this.remainingTime = 0;
    }
    this.dispatcher.update();
    if (this.repeat) {
      if (wasInterupted) {
        return this._start();
      } else {
        return this.startTime = this.constructor.now();
      }
    } else {
      return this.destroy();
    }
  }

  destroy() {
    if (this.repeat) {
      clearInterval(this.id);
    } else {
      clearTimeout(this.id);
    }
    this.updater.destroy();
    this.dispatcher.destroy();
    this.running = false;
    if (this.parent) {
      return this.parent.removeChild(this);
    }
  }

};

Timing.Updater = class Updater {
  constructor(parent) {
    this.parent = parent;
    this.dispatcher = new BaseUpdater();
    this.callbacks = [];
  }

  addCallback(callback) {
    var ref;
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
    if (((ref = this.parent) != null ? ref.running : void 0) && this.dispatcher) {
      return this.dispatcher.addCallback(callback);
    }
  }

  removeCallback(callback) {
    var index;
    index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
    if (this.dispatcher) {
      return this.dispatcher.removeCallback(callback);
    }
  }

  getBinder() {
    if (this.dispatcher) {
      return new BaseUpdater.Binder(this);
    }
  }

  forwardCallbacks() {
    if (this.dispatcher) {
      return this.callbacks.forEach((callback) => {
        return this.dispatcher.addCallback(callback);
      });
    }
  }

  unforwardCallbacks() {
    if (this.dispatcher) {
      return this.callbacks.forEach((callback) => {
        return this.dispatcher.removeCallback(callback);
      });
    }
  }

  destroy() {
    this.unforwardCallbacks();
    this.callbacks = [];
    return this.parent = null;
  }

};

return(Timing);});
}).call(this,require('_process'))

},{"_process":145,"spark-starter":144}],125:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"dup":74}],126:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"dup":75}],127:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"./Mixable":131,"./Property":133,"dup":76}],128:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"./Binder":125,"dup":77}],129:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"dup":78}],130:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"./Binder":125,"./EventBind":128,"dup":79}],131:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"dup":80}],132:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"dup":81}],133:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./Mixable":131,"./PropertyOwner":134,"./PropertyTypes/ActivableProperty":135,"./PropertyTypes/BasicProperty":136,"./PropertyTypes/CalculatedProperty":137,"./PropertyTypes/CollectionProperty":138,"./PropertyTypes/ComposedProperty":139,"./PropertyTypes/DynamicProperty":140,"./PropertyTypes/InvalidatedProperty":141,"./PropertyTypes/UpdatedProperty":142,"dup":82}],134:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"dup":83}],135:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"../Invalidator":130,"../Overrider":132,"./BasicProperty":136,"dup":84}],136:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"../Mixable":131,"dup":85}],137:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"../Invalidator":130,"../Overrider":132,"./DynamicProperty":140,"dup":86}],138:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"../Collection":126,"./DynamicProperty":140,"dup":87}],139:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"../Collection":126,"../Invalidator":130,"./CalculatedProperty":137,"dup":88}],140:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"../Invalidator":130,"./BasicProperty":136,"dup":89}],141:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"../Invalidator":130,"./CalculatedProperty":137,"dup":90}],142:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"../Invalidator":130,"../Overrider":132,"./DynamicProperty":140,"dup":91}],143:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"./Binder":125,"dup":92}],144:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./Binder.js":125,"./Collection.js":126,"./Element.js":127,"./EventBind.js":128,"./EventEmitter.js":129,"./Invalidator.js":130,"./Mixable.js":131,"./Overrider.js":132,"./Property.js":133,"./PropertyOwner.js":134,"./PropertyTypes/ActivableProperty.js":135,"./PropertyTypes/BasicProperty.js":136,"./PropertyTypes/CalculatedProperty.js":137,"./PropertyTypes/CollectionProperty.js":138,"./PropertyTypes/ComposedProperty.js":139,"./PropertyTypes/DynamicProperty.js":140,"./PropertyTypes/InvalidatedProperty.js":141,"./PropertyTypes/UpdatedProperty.js":142,"./Updater.js":143,"dup":93}],145:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],146:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"./Referred":167,"dup":14}],147:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],148:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"./Mixable":157,"./Property":159,"dup":16}],149:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"./Binder":146,"dup":17}],150:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"dup":18}],151:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"../Invalidator":155,"./PropertyWatcher":154,"dup":19}],152:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"./PropertyWatcher":154,"dup":20}],153:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"../Invalidator":155,"dup":21}],154:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"../Binder":146,"dup":22}],155:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"./Binder":146,"./EventBind":149,"dup":23}],156:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"./Overrider":158,"dup":24}],157:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"dup":25}],158:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"dup":26}],159:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"./Mixable":157,"./PropertyOwner":160,"./PropertyTypes/BasicProperty":161,"./PropertyTypes/CalculatedProperty":162,"./PropertyTypes/CollectionProperty":163,"./PropertyTypes/ComposedProperty":164,"./PropertyTypes/DynamicProperty":165,"./PropertyTypes/InvalidatedProperty":166,"dup":27}],160:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28}],161:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"../EventEmitter":150,"../Invalidated/PropertyWatcher":154,"../Loader":156,"../Mixable":157,"../Referred":167,"dup":29}],162:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"../Invalidator":155,"../Overrider":158,"./DynamicProperty":165,"dup":30}],163:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"../Collection":147,"../Invalidated/CollectionPropertyWatcher":152,"../Referred":167,"./DynamicProperty":165,"dup":31}],164:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"../Collection":147,"../Invalidator":155,"./CalculatedProperty":162,"dup":32}],165:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"../Invalidator":155,"./BasicProperty":161,"dup":33}],166:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"../Invalidator":155,"./CalculatedProperty":162,"dup":34}],167:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"dup":35}],168:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"./Binder":146,"dup":36}],169:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"./Binder":146,"./Collection":147,"./Element":148,"./EventBind":149,"./EventEmitter":150,"./Invalidated/ActivablePropertyWatcher":151,"./Invalidated/CollectionPropertyWatcher":152,"./Invalidated/Invalidated":153,"./Invalidated/PropertyWatcher":154,"./Invalidator":155,"./Loader":156,"./Mixable":157,"./Overrider":158,"./Property":159,"./PropertyOwner":160,"./PropertyTypes/BasicProperty":161,"./PropertyTypes/CalculatedProperty":162,"./PropertyTypes/CollectionProperty":163,"./PropertyTypes/ComposedProperty":164,"./PropertyTypes/DynamicProperty":165,"./PropertyTypes/InvalidatedProperty":166,"./Referred":167,"./Updater":168,"dup":37}]},{},[69])(69)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvQ29ubmVjdGVkLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1NpZ25hbC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9TaWduYWxPcGVyYXRpb24uanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvU2lnbmFsU291cmNlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1N3aXRjaC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9XaXJlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL3dpcmluZy5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL2xpYi9EaXJlY3Rpb24uanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZS5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlQ29udGFpbmVyLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVSZWZlcmVuY2UuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZWQuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvdGlsZXMuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvQmluZGVyLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0NvbGxlY3Rpb24uanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRWxlbWVudC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9FdmVudEJpbmQuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRXZlbnRFbWl0dGVyLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0ludmFsaWRhdGVkLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRvci5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Mb2FkZXIuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvTWl4YWJsZS5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9PdmVycmlkZXIuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHkuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlPd25lci5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHkuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHkuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5LmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9SZWZlcnJlZC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9VcGRhdGVyLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL3NwYXJrLXN0YXJ0ZXIuanMiLCJsaWIvQXV0b21hdGljRG9vci5qcyIsImxpYi9DaGFyYWN0ZXIuanMiLCJsaWIvQ2hhcmFjdGVyQUkuanMiLCJsaWIvRGFtYWdlUHJvcGFnYXRpb24uanMiLCJsaWIvRGFtYWdlYWJsZS5qcyIsImxpYi9Eb29yLmpzIiwibGliL0VsZW1lbnQuanMiLCJsaWIvRmxvb3IuanMiLCJsaWIvR2FtZS5qcyIsImxpYi9MaW5lT2ZTaWdodC5qcyIsImxpYi9NYXAuanMiLCJsaWIvT2JzdGFjbGUuanMiLCJsaWIvUGF0aFdhbGsuanMiLCJsaWIvUGVyc29uYWxXZWFwb24uanMiLCJsaWIvUGxheWVyLmpzIiwibGliL1Byb2plY3RpbGUuanMiLCJsaWIvUm9vbUdlbmVyYXRvci5qcyIsImxpYi9TaGlwV2VhcG9uLmpzIiwibGliL1N0YXIuanMiLCJsaWIvU3Rhck1hcEdlbmVyYXRvci5qcyIsImxpYi9WaWV3LmpzIiwibGliL1Zpc2lvbkNhbGN1bGF0b3IuanMiLCJsaWIvYWN0aW9ucy9BY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9BY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL0F0dGFja0FjdGlvbi5qcyIsImxpYi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL1RhcmdldEFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9XYWxrQWN0aW9uLmpzIiwibGliL2xpYnMuanMiLCJsaWIvcGFyYWxsZWxpby5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL0dyaWRDZWxsLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL0dyaWRSb3cuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9saWIvZ3JpZHMuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvQmluZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0NvbGxlY3Rpb24uanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRWxlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9FdmVudEJpbmQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRXZlbnRFbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL01peGFibGUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvT3ZlcnJpZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5T3duZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9BY3RpdmFibGVQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9VcGRhdGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL3NwYXJrLXN0YXJ0ZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1wYXRoZmluZGVyL2Rpc3QvcGF0aGZpbmRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9ncmVla0FscGhhYmV0Lmpzb24iLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1zdHJpbmdzL3N0cmluZ3Mvc3Rhck5hbWVzLmpzb24iLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aW1pbmcvZGlzdC90aW1pbmcuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciwgQ29ubmVjdGVkLCBFbGVtZW50LCBTaWduYWxPcGVyYXRpb247XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuU2lnbmFsT3BlcmF0aW9uID0gcmVxdWlyZSgnLi9TaWduYWxPcGVyYXRpb24nKTtcblxuQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5JbnZhbGlkYXRlZC5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RlZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29ubmVjdGVkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY2FuQ29ubmVjdFRvKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB0YXJnZXQuYWRkU2lnbmFsID09PSBcImZ1bmN0aW9uXCI7XG4gICAgfVxuXG4gICAgYWNjZXB0U2lnbmFsKHNpZ25hbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgb25BZGRDb25uZWN0aW9uKGNvbm4pIHt9XG5cbiAgICBvblJlbW92ZUNvbm5lY3Rpb24oY29ubikge31cblxuICAgIG9uTmV3U2lnbmFsVHlwZShzaWduYWwpIHt9XG5cbiAgICBvbkFkZFNpZ25hbChzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZW1vdmVTaWduYWwoc2lnbmFsLCBvcCkge31cblxuICAgIG9uUmVtb3ZlU2lnbmFsVHlwZShzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZXBsYWNlU2lnbmFsKG9sZFNpZ25hbCwgbmV3U2lnbmFsLCBvcCkge31cblxuICAgIGNvbnRhaW5zU2lnbmFsKHNpZ25hbCwgY2hlY2tMYXN0ID0gZmFsc2UsIGNoZWNrT3JpZ2luKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzLmZpbmQoZnVuY3Rpb24oYykge1xuICAgICAgICByZXR1cm4gYy5tYXRjaChzaWduYWwsIGNoZWNrTGFzdCwgY2hlY2tPcmlnaW4pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkU2lnbmFsKHNpZ25hbCwgb3ApIHtcbiAgICAgIHZhciBhdXRvU3RhcnQ7XG4gICAgICBpZiAoIShvcCAhPSBudWxsID8gb3AuZmluZExpbWl0ZXIodGhpcykgOiB2b2lkIDApKSB7XG4gICAgICAgIGlmICghb3ApIHtcbiAgICAgICAgICBvcCA9IG5ldyBTaWduYWxPcGVyYXRpb24oKTtcbiAgICAgICAgICBhdXRvU3RhcnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgdmFyIHNpbWlsYXI7XG4gICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zU2lnbmFsKHNpZ25hbCwgdHJ1ZSkgJiYgdGhpcy5hY2NlcHRTaWduYWwoc2lnbmFsKSkge1xuICAgICAgICAgICAgc2ltaWxhciA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy5wdXNoKHNpZ25hbCk7XG4gICAgICAgICAgICB0aGlzLm9uQWRkU2lnbmFsKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgaWYgKCFzaW1pbGFyKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uTmV3U2lnbmFsVHlwZShzaWduYWwsIG9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoYXV0b1N0YXJ0KSB7XG4gICAgICAgICAgb3Auc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNpZ25hbDtcbiAgICB9XG5cbiAgICByZW1vdmVTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIGF1dG9TdGFydDtcbiAgICAgIGlmICghKG9wICE9IG51bGwgPyBvcC5maW5kTGltaXRlcih0aGlzKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgIG9wID0gbmV3IFNpZ25hbE9wZXJhdGlvbjtcbiAgICAgICAgICBhdXRvU3RhcnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgdmFyIGV4aXN0aW5nO1xuICAgICAgICAgIGlmICgoZXhpc3RpbmcgPSB0aGlzLmNvbnRhaW5zU2lnbmFsKHNpZ25hbCwgdHJ1ZSkpICYmIHRoaXMuYWNjZXB0U2lnbmFsKHNpZ25hbCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy5zcGxpY2UodGhpcy5zaWduYWxzLmluZGV4T2YoZXhpc3RpbmcpLCAxKTtcbiAgICAgICAgICAgIHRoaXMub25SZW1vdmVTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICBvcC5hZGRPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICAgICAgICB2YXIgc2ltaWxhcjtcbiAgICAgICAgICAgICAgc2ltaWxhciA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgICAgICAgaWYgKHNpbWlsYXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vblJlcGxhY2VTaWduYWwoc2lnbmFsLCBzaW1pbGFyLCBvcCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25SZW1vdmVTaWduYWxUeXBlKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0ZXBCeVN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybiBvcC5zdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGF1dG9TdGFydCkge1xuICAgICAgICAgIHJldHVybiBvcC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpIHtcbiAgICAgIGlmIChzaWduYWwubGFzdCA9PT0gdGhpcykge1xuICAgICAgICByZXR1cm4gc2lnbmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNpZ25hbC53aXRoTGFzdCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0ZvcndhcmRXYXRjaGVyKCkge1xuICAgICAgaWYgKCF0aGlzLmZvcndhcmRXYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZm9yd2FyZFdhdGNoZXIgPSBuZXcgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgICAgc2NvcGU6IHRoaXMsXG4gICAgICAgICAgcHJvcGVydHk6ICdvdXRwdXRzJyxcbiAgICAgICAgICBvbkFkZGVkOiBmdW5jdGlvbihvdXRwdXQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRlZFNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRTaWduYWxUbyhzaWduYWwsIG91dHB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uUmVtb3ZlZDogZnVuY3Rpb24ob3V0cHV0LCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkZWRTaWduYWxzLmZvckVhY2goKHNpZ25hbCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9wRm9yd2FyZGVkU2lnbmFsVG8oc2lnbmFsLCBvdXRwdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZFdhdGNoZXIuYmluZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcndhcmRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICB0aGlzLmZvcndhcmRlZFNpZ25hbHMuYWRkKHNpZ25hbCk7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICB0aGlzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIGlmIChzaWduYWwubGFzdCAhPT0gY29ubikge1xuICAgICAgICAgIHJldHVybiBjb25uLmFkZFNpZ25hbChuZXh0LCBvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tGb3J3YXJkV2F0Y2hlcigpO1xuICAgIH1cblxuICAgIGZvcndhcmRBbGxTaWduYWxzVG8oY29ubiwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgIHJldHVybiBjb25uLmFkZFNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdG9wRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCwgb3ApIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgdGhpcy5mb3J3YXJkZWRTaWduYWxzLnJlbW92ZShzaWduYWwpO1xuICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbm4ucmVtb3ZlU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RvcEFsbEZvcndhcmRlZFNpZ25hbFRvKGNvbm4sIG9wKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzLmZvckVhY2goKHNpZ25hbCkgPT4ge1xuICAgICAgICB2YXIgbmV4dDtcbiAgICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgICByZXR1cm4gY29ubi5yZW1vdmVTaWduYWwobmV4dCwgb3ApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZm9yd2FyZFNpZ25hbFRvKHNpZ25hbCwgY29ubiwgb3ApIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgIHJldHVybiBjb25uLmFkZFNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RvcEZvcndhcmRlZFNpZ25hbFRvKHNpZ25hbCwgY29ubiwgb3ApIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgIHJldHVybiBjb25uLnJlbW92ZVNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQ29ubmVjdGVkLnByb3BlcnRpZXMoe1xuICAgIHNpZ25hbHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9LFxuICAgIGlucHV0czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgb3V0cHV0czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgZm9yd2FyZGVkU2lnbmFsczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENvbm5lY3RlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBFbGVtZW50LCBTaWduYWw7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwgPSBjbGFzcyBTaWduYWwgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3Iob3JpZ2luLCB0eXBlID0gJ3NpZ25hbCcsIGV4Y2x1c2l2ZSA9IGZhbHNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9yaWdpbiA9IG9yaWdpbjtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZXhjbHVzaXZlID0gZXhjbHVzaXZlO1xuICAgIHRoaXMubGFzdCA9IHRoaXMub3JpZ2luO1xuICB9XG5cbiAgd2l0aExhc3QobGFzdCkge1xuICAgIHZhciBzaWduYWw7XG4gICAgc2lnbmFsID0gbmV3IHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yKHRoaXMub3JpZ2luLCB0aGlzLnR5cGUsIHRoaXMuZXhjbHVzaXZlKTtcbiAgICBzaWduYWwubGFzdCA9IGxhc3Q7XG4gICAgcmV0dXJuIHNpZ25hbDtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgdmFyIHNpZ25hbDtcbiAgICBzaWduYWwgPSBuZXcgdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3IodGhpcy5vcmlnaW4sIHRoaXMudHlwZSwgdGhpcy5leGNsdXNpdmUpO1xuICAgIHNpZ25hbC5sYXN0ID0gdGhpcy5sYXN0O1xuICAgIHJldHVybiBzaWduYWw7XG4gIH1cblxuICBtYXRjaChzaWduYWwsIGNoZWNrTGFzdCA9IGZhbHNlLCBjaGVja09yaWdpbiA9IHRoaXMuZXhjbHVzaXZlKSB7XG4gICAgcmV0dXJuICghY2hlY2tMYXN0IHx8IHNpZ25hbC5sYXN0ID09PSB0aGlzLmxhc3QpICYmIChjaGVja09yaWdpbiB8fCBzaWduYWwub3JpZ2luID09PSB0aGlzLm9yaWdpbikgJiYgc2lnbmFsLnR5cGUgPT09IHRoaXMudHlwZTtcbiAgfVxuXG59O1xuIiwidmFyIEVsZW1lbnQsIFNpZ25hbE9wZXJhdGlvbjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbE9wZXJhdGlvbiA9IGNsYXNzIFNpZ25hbE9wZXJhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB0aGlzLmxpbWl0ZXJzID0gW107XG4gIH1cblxuICBhZGRPcGVyYXRpb24oZnVuY3QsIHByaW9yaXR5ID0gMSkge1xuICAgIGlmIChwcmlvcml0eSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUudW5zaGlmdChmdW5jdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnB1c2goZnVuY3QpO1xuICAgIH1cbiAgfVxuXG4gIGFkZExpbWl0ZXIoY29ubmVjdGVkKSB7XG4gICAgaWYgKCF0aGlzLmZpbmRMaW1pdGVyKGNvbm5lY3RlZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmxpbWl0ZXJzLnB1c2goY29ubmVjdGVkKTtcbiAgICB9XG4gIH1cblxuICBmaW5kTGltaXRlcihjb25uZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy5saW1pdGVycy5pbmRleE9mKGNvbm5lY3RlZCkgPiAtMTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHZhciByZXN1bHRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnN0ZXAoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgc3RlcCgpIHtcbiAgICB2YXIgZnVuY3Q7XG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5kb25lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bmN0ID0gdGhpcy5xdWV1ZS5zaGlmdChmdW5jdCk7XG4gICAgICByZXR1cm4gZnVuY3QodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgZG9uZSgpIHt9XG5cbn07XG4iLCJ2YXIgQ29ubmVjdGVkLCBTaWduYWwsIFNpZ25hbE9wZXJhdGlvbiwgU2lnbmFsU291cmNlO1xuXG5Db25uZWN0ZWQgPSByZXF1aXJlKCcuL0Nvbm5lY3RlZCcpO1xuXG5TaWduYWwgPSByZXF1aXJlKCcuL1NpZ25hbCcpO1xuXG5TaWduYWxPcGVyYXRpb24gPSByZXF1aXJlKCcuL1NpZ25hbE9wZXJhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbFNvdXJjZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2lnbmFsU291cmNlIGV4dGVuZHMgQ29ubmVjdGVkIHt9O1xuXG4gIFNpZ25hbFNvdXJjZS5wcm9wZXJ0aWVzKHtcbiAgICBhY3RpdmF0ZWQ6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcDtcbiAgICAgICAgb3AgPSBuZXcgU2lnbmFsT3BlcmF0aW9uKCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgICAgIHRoaXMuZm9yd2FyZFNpZ25hbCh0aGlzLnNpZ25hbCwgb3ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc3RvcEZvcndhcmRlZFNpZ25hbCh0aGlzLnNpZ25hbCwgb3ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcC5zdGFydCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2lnbmFsOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFNpZ25hbCh0aGlzLCAncG93ZXInLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaWduYWxTb3VyY2U7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgQ29ubmVjdGVkLCBTd2l0Y2g7XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3dpdGNoID0gY2xhc3MgU3dpdGNoIGV4dGVuZHMgQ29ubmVjdGVkIHt9O1xuIiwidmFyIENvbm5lY3RlZCwgRGlyZWN0aW9uLCBUaWxlZCwgV2lyZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cblRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkO1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uO1xuXG5Db25uZWN0ZWQgPSByZXF1aXJlKCcuL0Nvbm5lY3RlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdpcmUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFdpcmUgZXh0ZW5kcyBUaWxlZCB7XG4gICAgY29uc3RydWN0b3Iod2lyZVR5cGUgPSAncmVkJykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMud2lyZVR5cGUgPSB3aXJlVHlwZTtcbiAgICB9XG5cbiAgICBmaW5kRGlyZWN0aW9uc1RvKGNvbm4pIHtcbiAgICAgIHZhciBkaXJlY3Rpb25zO1xuICAgICAgZGlyZWN0aW9ucyA9IGNvbm4udGlsZXMgIT0gbnVsbCA/IGNvbm4udGlsZXMubWFwKCh0aWxlKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGUuZmluZERpcmVjdGlvbk9mKHRpbGUpO1xuICAgICAgfSkgOiBbdGhpcy50aWxlLmZpbmREaXJlY3Rpb25PZihjb25uKV07XG4gICAgICByZXR1cm4gZGlyZWN0aW9ucy5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAhPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FuQ29ubmVjdFRvKHRhcmdldCkge1xuICAgICAgcmV0dXJuIENvbm5lY3RlZC5wcm90b3R5cGUuY2FuQ29ubmVjdFRvLmNhbGwodGhpcywgdGFyZ2V0KSAmJiAoKHRhcmdldC53aXJlVHlwZSA9PSBudWxsKSB8fCB0YXJnZXQud2lyZVR5cGUgPT09IHRoaXMud2lyZVR5cGUpO1xuICAgIH1cblxuICAgIG9uTmV3U2lnbmFsVHlwZShzaWduYWwsIG9wKSB7XG4gICAgICByZXR1cm4gdGhpcy5mb3J3YXJkU2lnbmFsKHNpZ25hbCwgb3ApO1xuICAgIH1cblxuICB9O1xuXG4gIFdpcmUuZXh0ZW5kKENvbm5lY3RlZCk7XG5cbiAgV2lyZS5wcm9wZXJ0aWVzKHtcbiAgICBvdXRwdXRzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGlvbikge1xuICAgICAgICB2YXIgcGFyZW50O1xuICAgICAgICBwYXJlbnQgPSBpbnZhbGlkYXRpb24ucHJvcCgndGlsZScpO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdGlvbi5wcm9wKCdhZGphY2VudFRpbGVzJywgcGFyZW50KS5yZWR1Y2UoKHJlcywgdGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoaW52YWxpZGF0aW9uLnByb3AoJ2NoaWxkcmVuJywgdGlsZSkuZmlsdGVyKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYW5Db25uZWN0VG8oY2hpbGQpO1xuICAgICAgICAgICAgfSkudG9BcnJheSgpKTtcbiAgICAgICAgICB9LCBbXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBjb25uZWN0ZWREaXJlY3Rpb25zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGlvbikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0aW9uLnByb3AoJ291dHB1dHMnKS5yZWR1Y2UoKG91dCwgY29ubikgPT4ge1xuICAgICAgICAgIHRoaXMuZmluZERpcmVjdGlvbnNUbyhjb25uKS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwob3V0LCBkKSA8IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG91dC5wdXNoKGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXaXJlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQ29ubmVjdGVkXCI6IHJlcXVpcmUoXCIuL0Nvbm5lY3RlZFwiKSxcbiAgXCJTaWduYWxcIjogcmVxdWlyZShcIi4vU2lnbmFsXCIpLFxuICBcIlNpZ25hbE9wZXJhdGlvblwiOiByZXF1aXJlKFwiLi9TaWduYWxPcGVyYXRpb25cIiksXG4gIFwiU2lnbmFsU291cmNlXCI6IHJlcXVpcmUoXCIuL1NpZ25hbFNvdXJjZVwiKSxcbiAgXCJTd2l0Y2hcIjogcmVxdWlyZShcIi4vU3dpdGNoXCIpLFxuICBcIldpcmVcIjogcmVxdWlyZShcIi4vV2lyZVwiKSxcbn0iLCJ2YXIgRGlyZWN0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpcmVjdGlvbiA9IGNsYXNzIERpcmVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHgsIHksIGludmVyc2VOYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy5pbnZlcnNlTmFtZSA9IGludmVyc2VOYW1lO1xuICB9XG5cbiAgZ2V0SW52ZXJzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvclt0aGlzLmludmVyc2VOYW1lXTtcbiAgfVxuXG59O1xuXG5EaXJlY3Rpb24udXAgPSBuZXcgRGlyZWN0aW9uKCd1cCcsIDAsIC0xLCAnZG93bicpO1xuXG5EaXJlY3Rpb24uZG93biA9IG5ldyBEaXJlY3Rpb24oJ2Rvd24nLCAwLCAxLCAndXAnKTtcblxuRGlyZWN0aW9uLmxlZnQgPSBuZXcgRGlyZWN0aW9uKCdsZWZ0JywgLTEsIDAsICdyaWdodCcpO1xuXG5EaXJlY3Rpb24ucmlnaHQgPSBuZXcgRGlyZWN0aW9uKCdyaWdodCcsIDEsIDAsICdsZWZ0Jyk7XG5cbkRpcmVjdGlvbi5hZGphY2VudHMgPSBbRGlyZWN0aW9uLnVwLCBEaXJlY3Rpb24uZG93biwgRGlyZWN0aW9uLmxlZnQsIERpcmVjdGlvbi5yaWdodF07XG5cbkRpcmVjdGlvbi50b3BMZWZ0ID0gbmV3IERpcmVjdGlvbigndG9wTGVmdCcsIC0xLCAtMSwgJ2JvdHRvbVJpZ2h0Jyk7XG5cbkRpcmVjdGlvbi50b3BSaWdodCA9IG5ldyBEaXJlY3Rpb24oJ3RvcFJpZ2h0JywgMSwgLTEsICdib3R0b21MZWZ0Jyk7XG5cbkRpcmVjdGlvbi5ib3R0b21SaWdodCA9IG5ldyBEaXJlY3Rpb24oJ2JvdHRvbVJpZ2h0JywgMSwgMSwgJ3RvcExlZnQnKTtcblxuRGlyZWN0aW9uLmJvdHRvbUxlZnQgPSBuZXcgRGlyZWN0aW9uKCdib3R0b21MZWZ0JywgLTEsIDEsICd0b3BSaWdodCcpO1xuXG5EaXJlY3Rpb24uY29ybmVycyA9IFtEaXJlY3Rpb24udG9wTGVmdCwgRGlyZWN0aW9uLnRvcFJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tUmlnaHQsIERpcmVjdGlvbi5ib3R0b21MZWZ0XTtcblxuRGlyZWN0aW9uLmFsbCA9IFtEaXJlY3Rpb24udXAsIERpcmVjdGlvbi5kb3duLCBEaXJlY3Rpb24ubGVmdCwgRGlyZWN0aW9uLnJpZ2h0LCBEaXJlY3Rpb24udG9wTGVmdCwgRGlyZWN0aW9uLnRvcFJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tUmlnaHQsIERpcmVjdGlvbi5ib3R0b21MZWZ0XTtcbiIsInZhciBEaXJlY3Rpb24sIEVsZW1lbnQsIFRpbGU7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgnLi9EaXJlY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoeDEsIHkxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy54ID0geDE7XG4gICAgICB0aGlzLnkgPSB5MTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0UmVsYXRpdmVUaWxlKHgsIHkpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5lciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5nZXRUaWxlKHRoaXMueCArIHgsIHRoaXMueSArIHkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpbmREaXJlY3Rpb25PZih0aWxlKSB7XG4gICAgICBpZiAodGlsZS50aWxlKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlLnRpbGU7XG4gICAgICB9XG4gICAgICBpZiAoKHRpbGUueCAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWxsLmZpbmQoKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gZC54ID09PSB0aWxlLnggLSB0aGlzLnggJiYgZC55ID09PSB0aWxlLnkgLSB0aGlzLnk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZENoaWxkKGNoaWxkLCBjaGVja1JlZiA9IHRydWUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGVja1JlZikge1xuICAgICAgICBjaGlsZC50aWxlID0gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZChjaGlsZCwgY2hlY2tSZWYgPSB0cnVlKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY2hlY2tSZWYgJiYgY2hpbGQudGlsZSA9PT0gdGhpcykge1xuICAgICAgICByZXR1cm4gY2hpbGQudGlsZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGlzdCh0aWxlKSB7XG4gICAgICB2YXIgY3RuRGlzdCwgcmVmLCB4LCB5O1xuICAgICAgaWYgKCh0aWxlICE9IG51bGwgPyB0aWxlLmdldEZpbmFsVGlsZSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICAgIH1cbiAgICAgIGlmICgoKHRpbGUgIT0gbnVsbCA/IHRpbGUueCA6IHZvaWQgMCkgIT0gbnVsbCkgJiYgKHRpbGUueSAhPSBudWxsKSAmJiAodGhpcy54ICE9IG51bGwpICYmICh0aGlzLnkgIT0gbnVsbCkgJiYgKHRoaXMuY29udGFpbmVyID09PSB0aWxlLmNvbnRhaW5lciB8fCAoY3RuRGlzdCA9IChyZWYgPSB0aGlzLmNvbnRhaW5lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuZGlzdCA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmRpc3QodGlsZS5jb250YWluZXIpIDogdm9pZCAwIDogdm9pZCAwKSkpIHtcbiAgICAgICAgeCA9IHRpbGUueCAtIHRoaXMueDtcbiAgICAgICAgeSA9IHRpbGUueSAtIHRoaXMueTtcbiAgICAgICAgaWYgKGN0bkRpc3QpIHtcbiAgICAgICAgICB4ICs9IGN0bkRpc3QueDtcbiAgICAgICAgICB5ICs9IGN0bkRpc3QueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgeTogeSxcbiAgICAgICAgICBsZW5ndGg6IE1hdGguc3FydCh4ICogeCArIHkgKiB5KVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RmluYWxUaWxlKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZS5wcm9wZXJ0aWVzKHtcbiAgICBjaGlsZHJlbjoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5jb250YWluZXIgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkamFjZW50VGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZS5pbnZhbGlkYXRlQWRqYWNlbnRUaWxlcygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGphY2VudFRpbGVzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGlvbikge1xuICAgICAgICBpZiAoaW52YWxpZGF0aW9uLnByb3AoJ2NvbnRhaW5lcicpKSB7XG4gICAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5hZGphY2VudHMubWFwKChkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGl2ZVRpbGUoZC54LCBkLnkpO1xuICAgICAgICAgIH0pLmZpbHRlcigodCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHQgIT0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEVsZW1lbnQsIFRpbGVDb250YWluZXIsIFRpbGVSZWZlcmVuY2U7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGlsZVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vVGlsZVJlZmVyZW5jZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVDb250YWluZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVDb250YWluZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBfYWRkVG9Cb25kYXJpZXModGlsZSwgYm91bmRhcmllcykge1xuICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB0aWxlLnkgPCBib3VuZGFyaWVzLnRvcCkge1xuICAgICAgICBib3VuZGFyaWVzLnRvcCA9IHRpbGUueTtcbiAgICAgIH1cbiAgICAgIGlmICgoYm91bmRhcmllcy5sZWZ0ID09IG51bGwpIHx8IHRpbGUueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICBib3VuZGFyaWVzLmxlZnQgPSB0aWxlLng7XG4gICAgICB9XG4gICAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IHRpbGUueSA+IGJvdW5kYXJpZXMuYm90dG9tKSB7XG4gICAgICAgIGJvdW5kYXJpZXMuYm90dG9tID0gdGlsZS55O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHRpbGUueCA+IGJvdW5kYXJpZXMucmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJpZXMucmlnaHQgPSB0aWxlLng7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHRoaXMuY29vcmRzID0ge307XG4gICAgICByZXR1cm4gdGhpcy50aWxlcyA9IFtdO1xuICAgIH1cblxuICAgIGFkZFRpbGUodGlsZSkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICghdGhpcy50aWxlcy5pbmNsdWRlcyh0aWxlKSkge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIGlmICh0aGlzLmNvb3Jkc1t0aWxlLnhdID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNvb3Jkc1t0aWxlLnhdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldID0gdGlsZTtcbiAgICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYgPSB0aGlzLl9ib3VuZGFyaWVzKSAhPSBudWxsID8gcmVmLmNhbGN1bGF0ZWQgOiB2b2lkIDApIHtcbiAgICAgICAgICB0aGlzLl9hZGRUb0JvbmRhcmllcyh0aWxlLCB0aGlzLl9ib3VuZGFyaWVzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVtb3ZlVGlsZSh0aWxlKSB7XG4gICAgICB2YXIgaW5kZXgsIHJlZjtcbiAgICAgIGluZGV4ID0gdGhpcy50aWxlcy5pbmRleE9mKHRpbGUpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBkZWxldGUgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldO1xuICAgICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuX2JvdW5kYXJpZXMpICE9IG51bGwgPyByZWYuY2FsY3VsYXRlZCA6IHZvaWQgMCkge1xuICAgICAgICAgIGlmICh0aGlzLmJvdW5kYXJpZXMudG9wID09PSB0aWxlLnkgfHwgdGhpcy5ib3VuZGFyaWVzLmJvdHRvbSA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5sZWZ0ID09PSB0aWxlLnggfHwgdGhpcy5ib3VuZGFyaWVzLnJpZ2h0ID09PSB0aWxlLngpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVCb3VuZGFyaWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlVGlsZUF0KHgsIHkpIHtcbiAgICAgIHZhciB0aWxlO1xuICAgICAgaWYgKHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlVGlsZSh0aWxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUaWxlKHgsIHkpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoKChyZWYgPSB0aGlzLmNvb3Jkc1t4XSkgIT0gbnVsbCA/IHJlZlt5XSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb29yZHNbeF1beV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9hZE1hdHJpeChtYXRyaXgpIHtcbiAgICAgIHZhciBvcHRpb25zLCByb3csIHRpbGUsIHgsIHk7XG4gICAgICBmb3IgKHkgaW4gbWF0cml4KSB7XG4gICAgICAgIHJvdyA9IG1hdHJpeFt5XTtcbiAgICAgICAgZm9yICh4IGluIHJvdykge1xuICAgICAgICAgIHRpbGUgPSByb3dbeF07XG4gICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHg6IHBhcnNlSW50KHgpLFxuICAgICAgICAgICAgeTogcGFyc2VJbnQoeSlcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0eXBlb2YgdGlsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFRpbGUodGlsZShvcHRpb25zKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbGUueCA9IG9wdGlvbnMueDtcbiAgICAgICAgICAgIHRpbGUueSA9IG9wdGlvbnMueTtcbiAgICAgICAgICAgIHRoaXMuYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGluUmFuZ2UodGlsZSwgcmFuZ2UpIHtcbiAgICAgIHZhciBmb3VuZCwgaSwgaiwgcmVmLCByZWYxLCByZWYyLCByZWYzLCB0aWxlcywgeCwgeTtcbiAgICAgIHRpbGVzID0gW107XG4gICAgICByYW5nZS0tO1xuICAgICAgZm9yICh4ID0gaSA9IHJlZiA9IHRpbGUueCAtIHJhbmdlLCByZWYxID0gdGlsZS54ICsgcmFuZ2U7IChyZWYgPD0gcmVmMSA/IGkgPD0gcmVmMSA6IGkgPj0gcmVmMSk7IHggPSByZWYgPD0gcmVmMSA/ICsraSA6IC0taSkge1xuICAgICAgICBmb3IgKHkgPSBqID0gcmVmMiA9IHRpbGUueSAtIHJhbmdlLCByZWYzID0gdGlsZS55ICsgcmFuZ2U7IChyZWYyIDw9IHJlZjMgPyBqIDw9IHJlZjMgOiBqID49IHJlZjMpOyB5ID0gcmVmMiA8PSByZWYzID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgaWYgKE1hdGguc3FydCgoeCAtIHRpbGUueCkgKiAoeCAtIHRpbGUueCkgKyAoeSAtIHRpbGUueSkgKiAoeSAtIHRpbGUueSkpIDw9IHJhbmdlICYmICgoZm91bmQgPSB0aGlzLmdldFRpbGUoeCwgeSkpICE9IG51bGwpKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICBhbGxUaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNsaWNlKCk7XG4gICAgfVxuXG4gICAgY2xlYXJBbGwoKSB7XG4gICAgICB2YXIgaSwgbGVuLCByZWYsIHRpbGU7XG4gICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICByZWYgPSB0aGlzLnRpbGVzO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aWxlID0gcmVmW2ldO1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jb29yZHMgPSB7fTtcbiAgICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb3Nlc3Qob3JpZ2luVGlsZSwgZmlsdGVyKSB7XG4gICAgICB2YXIgY2FuZGlkYXRlcywgZ2V0U2NvcmU7XG4gICAgICBnZXRTY29yZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICAgICAgICBpZiAoY2FuZGlkYXRlLnNjb3JlICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLnNjb3JlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGUuc2NvcmUgPSBjYW5kaWRhdGUuZ2V0RmluYWxUaWxlKCkuZGlzdChvcmlnaW5UaWxlKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjYW5kaWRhdGVzID0gdGhpcy50aWxlcy5maWx0ZXIoZmlsdGVyKS5tYXAoKHQpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlUmVmZXJlbmNlKHQpO1xuICAgICAgfSk7XG4gICAgICBjYW5kaWRhdGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldFNjb3JlKGEpIC0gZ2V0U2NvcmUoYik7XG4gICAgICB9KTtcbiAgICAgIGlmIChjYW5kaWRhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZXNbMF0udGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvcHkoKSB7XG4gICAgICB2YXIgb3V0O1xuICAgICAgb3V0ID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICAgIG91dC5jb29yZHMgPSB0aGlzLmNvb3JkcztcbiAgICAgIG91dC50aWxlcyA9IHRoaXMudGlsZXM7XG4gICAgICBvdXQub3duZXIgPSBmYWxzZTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgbWVyZ2UoY3RuLCBtZXJnZUZuLCBhc093bmVyID0gZmFsc2UpIHtcbiAgICAgIHZhciBvdXQsIHRtcDtcbiAgICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICBvdXQub3duZXIgPSBhc093bmVyO1xuICAgICAgdG1wID0gY3RuLmNvcHkoKTtcbiAgICAgIHRoaXMudGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlQSkge1xuICAgICAgICB2YXIgbWVyZ2VkVGlsZSwgdGlsZUI7XG4gICAgICAgIHRpbGVCID0gdG1wLmdldFRpbGUodGlsZUEueCwgdGlsZUEueSk7XG4gICAgICAgIGlmICh0aWxlQikge1xuICAgICAgICAgIHRtcC5yZW1vdmVUaWxlKHRpbGVCKTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRUaWxlID0gbWVyZ2VGbih0aWxlQSwgdGlsZUIpO1xuICAgICAgICBpZiAobWVyZ2VkVGlsZSkge1xuICAgICAgICAgIHJldHVybiBvdXQuYWRkVGlsZShtZXJnZWRUaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0bXAudGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlQikge1xuICAgICAgICB2YXIgbWVyZ2VkVGlsZTtcbiAgICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4obnVsbCwgdGlsZUIpO1xuICAgICAgICBpZiAobWVyZ2VkVGlsZSkge1xuICAgICAgICAgIHJldHVybiBvdXQuYWRkVGlsZShtZXJnZWRUaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICB9O1xuXG4gIFRpbGVDb250YWluZXIucHJvcGVydGllcyh7XG4gICAgb3duZXI6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGJvdW5kYXJpZXM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBib3VuZGFyaWVzO1xuICAgICAgICBib3VuZGFyaWVzID0ge1xuICAgICAgICAgIHRvcDogbnVsbCxcbiAgICAgICAgICBsZWZ0OiBudWxsLFxuICAgICAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgICAgICByaWdodDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkVG9Cb25kYXJpZXModGlsZSwgYm91bmRhcmllcyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRhcmllcztcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlQ29udGFpbmVyO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIFRpbGVSZWZlcmVuY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZVJlZmVyZW5jZSA9IGNsYXNzIFRpbGVSZWZlcmVuY2Uge1xuICBjb25zdHJ1Y3Rvcih0aWxlKSB7XG4gICAgdGhpcy50aWxlID0gdGlsZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICB4OiB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbmFsVGlsZSgpLng7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB5OiB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbmFsVGlsZSgpLnk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEZpbmFsVGlsZSgpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlLmdldEZpbmFsVGlsZSgpO1xuICB9XG5cbn07XG4iLCJ2YXIgRWxlbWVudCwgVGlsZWQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGlsZWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBwdXRPblJhbmRvbVRpbGUodGlsZXMpIHtcbiAgICAgIHZhciBmb3VuZDtcbiAgICAgIGZvdW5kID0gdGhpcy5nZXRSYW5kb21WYWxpZFRpbGUodGlsZXMpO1xuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGUgPSBmb3VuZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRSYW5kb21WYWxpZFRpbGUodGlsZXMpIHtcbiAgICAgIHZhciBjYW5kaWRhdGUsIHBvcywgcmVtYWluaW5nO1xuICAgICAgcmVtYWluaW5nID0gdGlsZXMuc2xpY2UoKTtcbiAgICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByZW1haW5pbmcubGVuZ3RoKTtcbiAgICAgICAgY2FuZGlkYXRlID0gcmVtYWluaW5nLnNwbGljZShwb3MsIDEpWzBdO1xuICAgICAgICBpZiAodGhpcy5jYW5Hb09uVGlsZShjYW5kaWRhdGUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY2FuR29PblRpbGUodGlsZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxUaWxlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlZC5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgICBvbGQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRpbGUuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIG9mZnNldFk6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkRpcmVjdGlvblwiOiByZXF1aXJlKFwiLi9EaXJlY3Rpb25cIiksXG4gIFwiVGlsZVwiOiByZXF1aXJlKFwiLi9UaWxlXCIpLFxuICBcIlRpbGVDb250YWluZXJcIjogcmVxdWlyZShcIi4vVGlsZUNvbnRhaW5lclwiKSxcbiAgXCJUaWxlUmVmZXJlbmNlXCI6IHJlcXVpcmUoXCIuL1RpbGVSZWZlcmVuY2VcIiksXG4gIFwiVGlsZWRcIjogcmVxdWlyZShcIi4vVGlsZWRcIiksXG59IiwidmFyIEJpbmRlciwgUmVmZXJyZWQ7XG5cblJlZmVycmVkID0gcmVxdWlyZSgnLi9SZWZlcnJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJpbmRlciA9IGNsYXNzIEJpbmRlciBleHRlbmRzIFJlZmVycmVkIHtcbiAgdG9nZ2xlQmluZCh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnVuYmluZCgpO1xuICAgIH1cbiAgfVxuXG4gIGJpbmQoKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb0JpbmQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGNhbkJpbmQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmNhbGxiYWNrICE9IG51bGwpICYmICh0aGlzLnRhcmdldCAhPSBudWxsKTtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGRvVW5iaW5kKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBlcXVhbHMoYmluZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQoYmluZGVyKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgcmV0dXJuIHRoaXMudW5iaW5kKCk7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9CaW5kZXIuanMubWFwXG4iLCJ2YXIgQ29sbGVjdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb2xsZWN0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihhcnIpIHtcbiAgICAgIGlmIChhcnIgIT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnIudG9BcnJheSgpO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hhbmdlZCgpIHt9XG5cbiAgICBjaGVja0NoYW5nZXMob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgaWYgKGNvbXBhcmVGdW5jdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2xkID0gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jb3VudCgpICE9PSBvbGQubGVuZ3RoIHx8IChvcmRlcmVkID8gdGhpcy5zb21lKGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgICAgICByZXR1cm4gIWNvbXBhcmVGdW5jdGlvbihvbGQuZ2V0KGkpLCB2YWwpO1xuICAgICAgfSkgOiB0aGlzLnNvbWUoZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbihiKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVGdW5jdGlvbihhLCBiKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgZ2V0KGkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheVtpXTtcbiAgICB9XG5cbiAgICBnZXRSYW5kb20oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV07XG4gICAgfVxuXG4gICAgc2V0KGksIHZhbCkge1xuICAgICAgdmFyIG9sZDtcbiAgICAgIGlmICh0aGlzLl9hcnJheVtpXSAhPT0gdmFsKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbDtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIGFkZCh2YWwpIHtcbiAgICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKHZhbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlKHZhbCkge1xuICAgICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwbHVjayhmbikge1xuICAgICAgdmFyIGZvdW5kLCBpbmRleCwgb2xkO1xuICAgICAgaW5kZXggPSB0aGlzLl9hcnJheS5maW5kSW5kZXgoZm4pO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdO1xuICAgICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdG9BcnJheSgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xuICAgIH1cblxuICAgIGNvdW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBzdGF0aWMgbmV3U3ViQ2xhc3MoZm4sIGFycikge1xuICAgICAgdmFyIFN1YkNsYXNzO1xuICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgU3ViQ2xhc3MgPSBjbGFzcyBleHRlbmRzIHRoaXMge307XG4gICAgICAgIE9iamVjdC5hc3NpZ24oU3ViQ2xhc3MucHJvdG90eXBlLCBmbik7XG4gICAgICAgIHJldHVybiBuZXcgU3ViQ2xhc3MoYXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhhcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvcHkoYXJyKSB7XG4gICAgICB2YXIgY29sbDtcbiAgICAgIGlmIChhcnIgPT0gbnVsbCkge1xuICAgICAgICBhcnIgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIH1cbiAgICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpO1xuICAgICAgcmV0dXJuIGNvbGw7XG4gICAgfVxuXG4gICAgZXF1YWxzKGFycikge1xuICAgICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuIGFycltpXSA9PT0gdmFsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0QWRkZWRGcm9tKGFycikge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiAhYXJyLmluY2x1ZGVzKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UmVtb3ZlZEZyb20oYXJyKSB7XG4gICAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuaW5jbHVkZXMoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBDb2xsZWN0aW9uLnJlYWRGdW5jdGlvbnMgPSBbJ2V2ZXJ5JywgJ2ZpbmQnLCAnZmluZEluZGV4JywgJ2ZvckVhY2gnLCAnaW5jbHVkZXMnLCAnaW5kZXhPZicsICdqb2luJywgJ2xhc3RJbmRleE9mJywgJ21hcCcsICdyZWR1Y2UnLCAncmVkdWNlUmlnaHQnLCAnc29tZScsICd0b1N0cmluZyddO1xuXG4gIENvbGxlY3Rpb24ucmVhZExpc3RGdW5jdGlvbnMgPSBbJ2NvbmNhdCcsICdmaWx0ZXInLCAnc2xpY2UnXTtcblxuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXTtcblxuICBDb2xsZWN0aW9uLnJlYWRGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbihmdW5jdCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKTtcbiAgICB9O1xuICB9KTtcblxuICBDb2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpKTtcbiAgICB9O1xuICB9KTtcblxuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICB2YXIgb2xkLCByZXM7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHJlcyA9IHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuXG4gIHJldHVybiBDb2xsZWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKTtcbiAgfVxufSk7XG5cbmlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IHZvaWQgMCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Db2xsZWN0aW9uLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIE1peGFibGUsIFByb3BlcnR5O1xuXG5Qcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHknKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQgPSBjbGFzcyBFbGVtZW50IGV4dGVuZHMgTWl4YWJsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBpbml0KCkge31cblxuICB0YXAobmFtZSkge1xuICAgIHZhciBhcmdzO1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbmFtZS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjYWxsYmFjayhuYW1lKSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH07XG4gICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0ub3duZXIgPSB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW25hbWVdO1xuICB9XG5cbiAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgIGlmICh0aGlzLl9wcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBbJ19wcm9wZXJ0aWVzJ10uY29uY2F0KHRoaXMuX3Byb3BlcnRpZXMubWFwKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgcmV0dXJuIHByb3AubmFtZTtcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIGV4dGVuZGVkKHRhcmdldCkge1xuICAgIHZhciBpLCBsZW4sIG9wdGlvbnMsIHByb3BlcnR5LCByZWYsIHJlc3VsdHM7XG4gICAgaWYgKHRoaXMuX3Byb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgcmVmID0gdGhpcy5fcHJvcGVydGllcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBwcm9wZXJ0eSA9IHJlZltpXTtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnR5Lm9wdGlvbnMpO1xuICAgICAgICByZXN1bHRzLnB1c2goKG5ldyBQcm9wZXJ0eShwcm9wZXJ0eS5uYW1lLCBvcHRpb25zKSkuYmluZCh0YXJnZXQpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBwcm9wZXJ0eShwcm9wLCBkZXNjKSB7XG4gICAgcmV0dXJuIChuZXcgUHJvcGVydHkocHJvcCwgZGVzYykpLmJpbmQodGhpcy5wcm90b3R5cGUpO1xuICB9XG5cbiAgc3RhdGljIHByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIHZhciBkZXNjLCBwcm9wLCByZXN1bHRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKHByb3AgaW4gcHJvcGVydGllcykge1xuICAgICAgZGVzYyA9IHByb3BlcnRpZXNbcHJvcF07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5wcm9wZXJ0eShwcm9wLCBkZXNjKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRWxlbWVudC5qcy5tYXBcbiIsInZhciBCaW5kZXIsIEV2ZW50QmluZDtcblxuQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEJpbmQgPSBjbGFzcyBFdmVudEJpbmQgZXh0ZW5kcyBCaW5kZXIge1xuICBjb25zdHJ1Y3RvcihldmVudDEsIHRhcmdldDEsIGNhbGxiYWNrKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnQxO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0MTtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gIH1cblxuICBnZXRSZWYoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGV2ZW50OiB0aGlzLmV2ZW50LFxuICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgfTtcbiAgfVxuXG4gIGJpbmRUbyh0YXJnZXQpIHtcbiAgICB0aGlzLnVuYmluZCgpO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHJldHVybiB0aGlzLmJpbmQoKTtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vbih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byBhZGQgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpO1xuICAgIH1cbiAgfVxuXG4gIGRvVW5iaW5kKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5vZmYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vZmYodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9XG4gIH1cblxuICBlcXVhbHMoZXZlbnRCaW5kKSB7XG4gICAgcmV0dXJuIHN1cGVyLmVxdWFscyhldmVudEJpbmQpICYmIGV2ZW50QmluZC5ldmVudCA9PT0gdGhpcy5ldmVudDtcbiAgfVxuXG4gIG1hdGNoKGV2ZW50LCB0YXJnZXQpIHtcbiAgICByZXR1cm4gZXZlbnQgPT09IHRoaXMuZXZlbnQgJiYgdGFyZ2V0ID09PSB0aGlzLnRhcmdldDtcbiAgfVxuXG4gIHN0YXRpYyBjaGVja0VtaXR0ZXIoZW1pdHRlciwgZmF0YWwgPSB0cnVlKSB7XG4gICAgaWYgKHR5cGVvZiBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGVtaXR0ZXIuYWRkTGlzdGVuZXIgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoZmF0YWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0V2ZW50QmluZC5qcy5tYXBcbiIsInZhciBFdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFdmVudEVtaXR0ZXIge1xuICAgIGdldEFsbEV2ZW50cygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICB9XG5cbiAgICBnZXRMaXN0ZW5lcnMoZSkge1xuICAgICAgdmFyIGV2ZW50cztcbiAgICAgIGV2ZW50cyA9IHRoaXMuZ2V0QWxsRXZlbnRzKCk7XG4gICAgICByZXR1cm4gZXZlbnRzW2VdIHx8IChldmVudHNbZV0gPSBbXSk7XG4gICAgfVxuXG4gICAgaGFzTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldExpc3RlbmVycyhlKS5pbmNsdWRlcyhsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICghdGhpcy5oYXNMaXN0ZW5lcihlLCBsaXN0ZW5lcikpIHtcbiAgICAgICAgdGhpcy5nZXRMaXN0ZW5lcnMoZSkucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyQWRkZWQoZSwgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpc3RlbmVyQWRkZWQoZSwgbGlzdGVuZXIpIHt9XG5cbiAgICByZW1vdmVMaXN0ZW5lcihlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGluZGV4LCBsaXN0ZW5lcnM7XG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKTtcbiAgICAgIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJSZW1vdmVkKGUsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaXN0ZW5lclJlbW92ZWQoZSwgbGlzdGVuZXIpIHt9XG5cbiAgICBlbWl0RXZlbnQoZSwgLi4uYXJncykge1xuICAgICAgdmFyIGxpc3RlbmVycztcbiAgICAgIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXJzKGUpLnNsaWNlKCk7XG4gICAgICByZXR1cm4gbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyKC4uLmFyZ3MpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQWxsTGlzdGVuZXJzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIH1cblxuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEV2ZW50O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUudHJpZ2dlciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEV2ZW50O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcblxuICByZXR1cm4gRXZlbnRFbWl0dGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0V2ZW50RW1pdHRlci5qcy5tYXBcbiIsInZhciBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIsIEludmFsaWRhdG9yLCBQcm9wZXJ0eVdhdGNoZXI7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4vUHJvcGVydHlXYXRjaGVyJyk7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIgPSBjbGFzcyBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlID0gb3B0aW9ucy5hY3RpdmU7XG4gIH1cblxuICBzaG91bGRCaW5kKCkge1xuICAgIHZhciBhY3RpdmU7XG4gICAgaWYgKHRoaXMuYWN0aXZlICE9IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLnNjb3BlKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvci5jYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0JpbmQoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgpO1xuICAgICAgYWN0aXZlID0gdGhpcy5hY3RpdmUodGhpcy5pbnZhbGlkYXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IuYmluZCgpO1xuICAgICAgcmV0dXJuIGFjdGl2ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIsIFByb3BlcnR5V2F0Y2hlcjtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnLi9Qcm9wZXJ0eVdhdGNoZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciBleHRlbmRzIFByb3BlcnR5V2F0Y2hlciB7XG4gIGxvYWRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBzdXBlci5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLm9uQWRkZWQgPSBvcHRpb25zLm9uQWRkZWQ7XG4gICAgcmV0dXJuIHRoaXMub25SZW1vdmVkID0gb3B0aW9ucy5vblJlbW92ZWQ7XG4gIH1cblxuICBoYW5kbGVDaGFuZ2UodmFsdWUsIG9sZCkge1xuICAgIG9sZCA9IHZhbHVlLmNvcHkob2xkIHx8IFtdKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCBvbGQpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25BZGRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFsdWUuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICBpZiAoIW9sZC5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uQWRkZWQuY2FsbCh0aGlzLnNjb3BlLCBpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vblJlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBvbGQuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICBpZiAoIXZhbHVlLmluY2x1ZGVzKGl0ZW0pKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub25SZW1vdmVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIuanMubWFwXG4iLCJ2YXIgSW52YWxpZGF0ZWQsIEludmFsaWRhdG9yO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWQgPSBjbGFzcyBJbnZhbGlkYXRlZCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAoISgob3B0aW9ucyAhPSBudWxsID8gb3B0aW9ucy5pbml0QnlMb2FkZXIgOiB2b2lkIDApICYmIChvcHRpb25zLmxvYWRlciAhPSBudWxsKSkpIHtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cbiAgfVxuXG4gIGxvYWRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLnNjb3BlID0gb3B0aW9ucy5zY29wZTtcbiAgICBpZiAob3B0aW9ucy5sb2FkZXJBc1Njb3BlICYmIChvcHRpb25zLmxvYWRlciAhPSBudWxsKSkge1xuICAgICAgdGhpcy5zY29wZSA9IG9wdGlvbnMubG9hZGVyO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdW5rbm93bigpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci52YWxpZGF0ZVVua25vd25zKCk7XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yID09IG51bGwpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgpO1xuICAgIHRoaXMuaGFuZGxlVXBkYXRlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgIHRoaXMuaW52YWxpZGF0b3IuZW5kUmVjeWNsZSgpO1xuICAgIHRoaXMuaW52YWxpZGF0b3IuYmluZCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaGFuZGxlVXBkYXRlKGludmFsaWRhdG9yKSB7XG4gICAgaWYgKHRoaXMuc2NvcGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCBpbnZhbGlkYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGludmFsaWRhdG9yKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZC5qcy5tYXBcbiIsInZhciBCaW5kZXIsIFByb3BlcnR5V2F0Y2hlcjtcblxuQmluZGVyID0gcmVxdWlyZSgnLi4vQmluZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9uczEpIHtcbiAgICB2YXIgcmVmO1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uczE7XG4gICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfTtcbiAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrID0gKG9sZCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlKG9sZCk7XG4gICAgfTtcbiAgICBpZiAodGhpcy5vcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMubG9hZE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKCEoKChyZWYgPSB0aGlzLm9wdGlvbnMpICE9IG51bGwgPyByZWYuaW5pdEJ5TG9hZGVyIDogdm9pZCAwKSAmJiAodGhpcy5vcHRpb25zLmxvYWRlciAhPSBudWxsKSkpIHtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cbiAgfVxuXG4gIGxvYWRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLnNjb3BlID0gb3B0aW9ucy5zY29wZTtcbiAgICBpZiAob3B0aW9ucy5sb2FkZXJBc1Njb3BlICYmIChvcHRpb25zLmxvYWRlciAhPSBudWxsKSkge1xuICAgICAgdGhpcy5zY29wZSA9IG9wdGlvbnMubG9hZGVyO1xuICAgIH1cbiAgICB0aGlzLnByb3BlcnR5ID0gb3B0aW9ucy5wcm9wZXJ0eTtcbiAgICB0aGlzLmNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgICByZXR1cm4gdGhpcy5hdXRvQmluZCA9IG9wdGlvbnMuYXV0b0JpbmQ7XG4gIH1cblxuICBjb3B5V2l0aChvcHQpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0KSk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIGlmICh0aGlzLmF1dG9CaW5kKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0JpbmQoKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0eSgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRoaXMucHJvcGVydHkgPSB0aGlzLnNjb3BlLmdldFByb3BlcnR5SW5zdGFuY2UodGhpcy5wcm9wZXJ0eSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb3BlcnR5O1xuICB9XG5cbiAgY2hlY2tCaW5kKCkge1xuICAgIHJldHVybiB0aGlzLnRvZ2dsZUJpbmQodGhpcy5zaG91bGRCaW5kKCkpO1xuICB9XG5cbiAgc2hvdWxkQmluZCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNhbkJpbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKSAhPSBudWxsO1xuICB9XG5cbiAgZG9CaW5kKCkge1xuICAgIHRoaXMudXBkYXRlKCk7XG4gICAgdGhpcy5nZXRQcm9wZXJ0eSgpLm9uKCdpbnZhbGlkYXRlZCcsIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpLm9uKCd1cGRhdGVkJywgdGhpcy51cGRhdGVDYWxsYmFjayk7XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICB0aGlzLmdldFByb3BlcnR5KCkub2ZmKCdpbnZhbGlkYXRlZCcsIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpLm9mZigndXBkYXRlZCcsIHRoaXMudXBkYXRlQ2FsbGJhY2spO1xuICB9XG5cbiAgZ2V0UmVmKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvcGVydHk6IHRoaXMucHJvcGVydHksXG4gICAgICAgIHRhcmdldDogdGhpcy5zY29wZSxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3BlcnR5LnByb3BlcnR5Lm5hbWUsXG4gICAgICAgIHRhcmdldDogdGhpcy5wcm9wZXJ0eS5vYmosXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGludmFsaWRhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5nZXQoKTtcbiAgfVxuXG4gIHVwZGF0ZShvbGQpIHtcbiAgICB2YXIgdmFsdWU7XG4gICAgdmFsdWUgPSB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KCk7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlQ2hhbmdlKHZhbHVlLCBvbGQpO1xuICB9XG5cbiAgaGFuZGxlQ2hhbmdlKHZhbHVlLCBvbGQpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuc2NvcGUsIG9sZCk7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9JbnZhbGlkYXRlZC9Qcm9wZXJ0eVdhdGNoZXIuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBFdmVudEJpbmQsIEludmFsaWRhdG9yLCBwbHVjaztcblxuQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKTtcblxuRXZlbnRCaW5kID0gcmVxdWlyZSgnLi9FdmVudEJpbmQnKTtcblxucGx1Y2sgPSBmdW5jdGlvbihhcnIsIGZuKSB7XG4gIHZhciBmb3VuZCwgaW5kZXg7XG4gIGluZGV4ID0gYXJyLmZpbmRJbmRleChmbik7XG4gIGlmIChpbmRleCA+IC0xKSB7XG4gICAgZm91bmQgPSBhcnJbaW5kZXhdO1xuICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiBmb3VuZDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnZhbGlkYXRvciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgSW52YWxpZGF0b3IgZXh0ZW5kcyBCaW5kZXIge1xuICAgIGNvbnN0cnVjdG9yKGludmFsaWRhdGVkLCBzY29wZSA9IG51bGwpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmludmFsaWRhdGVkID0gaW52YWxpZGF0ZWQ7XG4gICAgICB0aGlzLnNjb3BlID0gc2NvcGU7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cyA9IFtdO1xuICAgICAgdGhpcy5yZWN5Y2xlZCA9IFtdO1xuICAgICAgdGhpcy51bmtub3ducyA9IFtdO1xuICAgICAgdGhpcy5zdHJpY3QgPSB0aGlzLmNvbnN0cnVjdG9yLnN0cmljdDtcbiAgICAgIHRoaXMuaW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH07XG4gICAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjay5vd25lciA9IHRoaXM7XG4gICAgfVxuXG4gICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgIHZhciBmdW5jdE5hbWU7XG4gICAgICB0aGlzLmludmFsaWQgPSB0cnVlO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmludmFsaWRhdGVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZWQoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsYmFjaygpO1xuICAgICAgfSBlbHNlIGlmICgodGhpcy5pbnZhbGlkYXRlZCAhPSBudWxsKSAmJiB0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZC5pbnZhbGlkYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZWQuaW52YWxpZGF0ZSgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBmdW5jdE5hbWUgPSAnaW52YWxpZGF0ZScgKyB0aGlzLmludmFsaWRhdGVkLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5pbnZhbGlkYXRlZC5zbGljZSgxKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnNjb3BlW2Z1bmN0TmFtZV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNjb3BlW2Z1bmN0TmFtZV0oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zY29wZVt0aGlzLmludmFsaWRhdGVkXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB1bmtub3duKCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICh0eXBlb2YgKChyZWYgPSB0aGlzLmludmFsaWRhdGVkKSAhPSBudWxsID8gcmVmLnVua25vd24gOiB2b2lkIDApID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZWQudW5rbm93bigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQmluZGVyKG5ldyBFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spKTtcbiAgICB9XG5cbiAgICBhZGRCaW5kZXIoYmluZGVyKSB7XG4gICAgICBpZiAoYmluZGVyLmNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgICAgYmluZGVyLmNhbGxiYWNrID0gdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2s7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnNvbWUoZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcik7XG4gICAgICB9KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChwbHVjayh0aGlzLnJlY3ljbGVkLCBmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xuICAgICAgICB9KSB8fCBiaW5kZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFVua25vd25DYWxsYmFjayhwcm9wKSB7XG4gICAgICB2YXIgY2FsbGJhY2s7XG4gICAgICBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXQoKTtcbiAgICAgICAgfSwgcHJvcCk7XG4gICAgICB9O1xuICAgICAgY2FsbGJhY2sucmVmID0ge1xuICAgICAgICBwcm9wOiBwcm9wXG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNhbGxiYWNrO1xuICAgIH1cblxuICAgIGFkZFVua25vd24oZm4sIHByb3ApIHtcbiAgICAgIGlmICghdGhpcy5maW5kVW5rbm93bihwcm9wKSkge1xuICAgICAgICBmbi5yZWYgPSB7XG4gICAgICAgICAgXCJwcm9wXCI6IHByb3BcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy51bmtub3ducy5wdXNoKGZuKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5rbm93bigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRVbmtub3duKHByb3ApIHtcbiAgICAgIGlmICgocHJvcCAhPSBudWxsKSB8fCAodHlwZW9mIHRhcmdldCAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0YXJnZXQgIT09IG51bGwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd25zLmZpbmQoZnVuY3Rpb24odW5rbm93bikge1xuICAgICAgICAgIHJldHVybiB1bmtub3duLnJlZi5wcm9wID09PSBwcm9wO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBldmVudChldmVudCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbHVlKHZhbCwgZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHRoaXMuZXZlbnQoZXZlbnQsIHRhcmdldCk7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIHByb3AocHJvcCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgICAgdmFyIHByb3BJbnN0YW5jZTtcbiAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCh0YXJnZXQuZ2V0UHJvcGVydHlJbnN0YW5jZSAhPSBudWxsKSAmJiAocHJvcEluc3RhbmNlID0gdGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UocHJvcCkpKSB7XG4gICAgICAgICAgcHJvcCA9IHByb3BJbnN0YW5jZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLmNoZWNrUHJvcEluc3RhbmNlKHByb3ApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbXVzdCBiZSBhIFByb3BlcnR5SW5zdGFuY2Ugb3IgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkRXZlbnRCaW5kKCdpbnZhbGlkYXRlZCcsIHByb3AsIHRoaXMuZ2V0VW5rbm93bkNhbGxiYWNrKHByb3ApKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlKHByb3AuZ2V0KCksICd1cGRhdGVkJywgcHJvcCk7XG4gICAgfVxuXG4gICAgcHJvcFBhdGgocGF0aCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgICAgdmFyIHByb3AsIHZhbDtcbiAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgICB2YWwgPSB0YXJnZXQ7XG4gICAgICB3aGlsZSAoKHZhbCAhPSBudWxsKSAmJiBwYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcHJvcCA9IHBhdGguc2hpZnQoKTtcbiAgICAgICAgdmFsID0gdGhpcy5wcm9wKHByb3AsIHZhbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIHByb3BJbml0aWF0ZWQocHJvcCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgICAgdmFyIGluaXRpYXRlZDtcbiAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgKHRhcmdldC5nZXRQcm9wZXJ0eUluc3RhbmNlICE9IG51bGwpKSB7XG4gICAgICAgIHByb3AgPSB0YXJnZXQuZ2V0UHJvcGVydHlJbnN0YW5jZShwcm9wKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuY2hlY2tQcm9wSW5zdGFuY2UocHJvcCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eSBtdXN0IGJlIGEgUHJvcGVydHlJbnN0YW5jZSBvciBhIHN0cmluZycpO1xuICAgICAgfVxuICAgICAgaW5pdGlhdGVkID0gcHJvcC5pbml0aWF0ZWQ7XG4gICAgICBpZiAoIWluaXRpYXRlZCkge1xuICAgICAgICB0aGlzLmV2ZW50KCd1cGRhdGVkJywgcHJvcCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5pdGlhdGVkO1xuICAgIH1cblxuICAgIGZ1bmN0KGZ1bmN0KSB7XG4gICAgICB2YXIgaW52YWxpZGF0b3IsIHJlcztcbiAgICAgIGludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bigoKSA9PiB7XG4gICAgICAgICAgdmFyIHJlczI7XG4gICAgICAgICAgcmVzMiA9IGZ1bmN0KGludmFsaWRhdG9yKTtcbiAgICAgICAgICBpZiAocmVzICE9PSByZXMyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBpbnZhbGlkYXRvcik7XG4gICAgICB9KTtcbiAgICAgIHJlcyA9IGZ1bmN0KGludmFsaWRhdG9yKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2goaW52YWxpZGF0b3IpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICB2YWxpZGF0ZVVua25vd25zKCkge1xuICAgICAgdmFyIHVua25vd25zO1xuICAgICAgdW5rbm93bnMgPSB0aGlzLnVua25vd25zO1xuICAgICAgdGhpcy51bmtub3ducyA9IFtdO1xuICAgICAgcmV0dXJuIHVua25vd25zLmZvckVhY2goZnVuY3Rpb24odW5rbm93bikge1xuICAgICAgICByZXR1cm4gdW5rbm93bigpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaXNFbXB0eSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgIHRoaXMuaW52YWxpZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVjeWNsZShjYWxsYmFjaykge1xuICAgICAgdmFyIGRvbmUsIHJlcztcbiAgICAgIHRoaXMucmVjeWNsZWQgPSB0aGlzLmludmFsaWRhdGlvbkV2ZW50cztcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW107XG4gICAgICBkb25lID0gdGhpcy5lbmRSZWN5Y2xlLmJpbmQodGhpcyk7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodGhpcywgZG9uZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzID0gY2FsbGJhY2sodGhpcyk7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkb25lO1xuICAgICAgfVxuICAgIH1cblxuICAgIGVuZFJlY3ljbGUoKSB7XG4gICAgICB0aGlzLnJlY3ljbGVkLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQudW5iaW5kKCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLnJlY3ljbGVkID0gW107XG4gICAgfVxuXG4gICAgY2hlY2tFbWl0dGVyKGVtaXR0ZXIpIHtcbiAgICAgIHJldHVybiBFdmVudEJpbmQuY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIHRoaXMuc3RyaWN0KTtcbiAgICB9XG5cbiAgICBjaGVja1Byb3BJbnN0YW5jZShwcm9wKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHByb3AuZ2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgdGhpcy5jaGVja0VtaXR0ZXIocHJvcCk7XG4gICAgfVxuXG4gICAgdW5iaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQudW5iaW5kKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBJbnZhbGlkYXRvci5zdHJpY3QgPSB0cnVlO1xuXG4gIHJldHVybiBJbnZhbGlkYXRvcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9JbnZhbGlkYXRvci5qcy5tYXBcbiIsInZhciBMb2FkZXIsIE92ZXJyaWRlcjtcblxuT3ZlcnJpZGVyID0gcmVxdWlyZSgnLi9PdmVycmlkZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIExvYWRlciBleHRlbmRzIE92ZXJyaWRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbml0UHJlbG9hZGVkKCk7XG4gICAgfVxuXG4gICAgaW5pdFByZWxvYWRlZCgpIHtcbiAgICAgIHZhciBkZWZMaXN0O1xuICAgICAgZGVmTGlzdCA9IHRoaXMucHJlbG9hZGVkO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSBbXTtcbiAgICAgIHJldHVybiB0aGlzLmxvYWQoZGVmTGlzdCk7XG4gICAgfVxuXG4gICAgbG9hZChkZWZMaXN0KSB7XG4gICAgICB2YXIgbG9hZGVkLCB0b0xvYWQ7XG4gICAgICB0b0xvYWQgPSBbXTtcbiAgICAgIGxvYWRlZCA9IGRlZkxpc3QubWFwKChkZWYpID0+IHtcbiAgICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgICBpZiAoZGVmLmluc3RhbmNlID09IG51bGwpIHtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGxvYWRlcjogdGhpc1xuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaW5zdGFuY2UgPSBMb2FkZXIubG9hZChkZWYpO1xuICAgICAgICAgIGRlZiA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlXG4gICAgICAgICAgfSwgZGVmKTtcbiAgICAgICAgICBpZiAoZGVmLmluaXRCeUxvYWRlciAmJiAoaW5zdGFuY2UuaW5pdCAhPSBudWxsKSkge1xuICAgICAgICAgICAgdG9Mb2FkLnB1c2goaW5zdGFuY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByZWxvYWRlZCA9IHRoaXMucHJlbG9hZGVkLmNvbmNhdChsb2FkZWQpO1xuICAgICAgcmV0dXJuIHRvTG9hZC5mb3JFYWNoKGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5pbml0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVsb2FkKGRlZikge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGRlZikpIHtcbiAgICAgICAgZGVmID0gW2RlZl07XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wcmVsb2FkZWQgPSAodGhpcy5wcmVsb2FkZWQgfHwgW10pLmNvbmNhdChkZWYpO1xuICAgIH1cblxuICAgIGRlc3Ryb3lMb2FkZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcmVsb2FkZWQuZm9yRWFjaChmdW5jdGlvbihkZWYpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgcmV0dXJuIChyZWYgPSBkZWYuaW5zdGFuY2UpICE9IG51bGwgPyB0eXBlb2YgcmVmLmRlc3Ryb3kgPT09IFwiZnVuY3Rpb25cIiA/IHJlZi5kZXN0cm95KCkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICByZXR1cm4gc3VwZXIuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KFsncHJlbG9hZGVkJ10pO1xuICAgIH1cblxuICAgIGV4dGVuZGVkKHRhcmdldCkge1xuICAgICAgc3VwZXIuZXh0ZW5kZWQodGFyZ2V0KTtcbiAgICAgIGlmICh0aGlzLnByZWxvYWRlZCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnByZWxvYWRlZCA9ICh0YXJnZXQucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQodGhpcy5wcmVsb2FkZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkTWFueShkZWYpIHtcbiAgICAgIHJldHVybiBkZWYubWFwKChkKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWQoZCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZChkZWYpIHtcbiAgICAgIGlmICh0eXBlb2YgZGVmLnR5cGUuY29weVdpdGggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gZGVmLnR5cGUuY29weVdpdGgoZGVmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgZGVmLnR5cGUoZGVmKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcHJlbG9hZChkZWYpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3RvdHlwZS5wcmVsb2FkKGRlZik7XG4gICAgfVxuXG4gIH07XG5cbiAgTG9hZGVyLnByb3RvdHlwZS5wcmVsb2FkZWQgPSBbXTtcblxuICBMb2FkZXIub3ZlcnJpZGVzKHtcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaW5pdC53aXRob3V0TG9hZGVyKCk7XG4gICAgICByZXR1cm4gdGhpcy5pbml0UHJlbG9hZGVkKCk7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGVzdHJveS53aXRob3V0TG9hZGVyKCk7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95TG9hZGVkKCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gTG9hZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0xvYWRlci5qcy5tYXBcbiIsInZhciBNaXhhYmxlLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBNaXhhYmxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBNaXhhYmxlIHtcbiAgICBzdGF0aWMgZXh0ZW5kKG9iaikge1xuICAgICAgdGhpcy5FeHRlbnNpb24ubWFrZShvYmosIHRoaXMpO1xuICAgICAgaWYgKG9iai5wcm90b3R5cGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5FeHRlbnNpb24ubWFrZShvYmoucHJvdG90eXBlLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGluY2x1ZGUob2JqKSB7XG4gICAgICByZXR1cm4gdGhpcy5FeHRlbnNpb24ubWFrZShvYmosIHRoaXMucHJvdG90eXBlKTtcbiAgICB9XG5cbiAgfTtcblxuICBNaXhhYmxlLkV4dGVuc2lvbiA9IHtcbiAgICBtYWtlT25jZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoISgocmVmID0gdGFyZ2V0LmV4dGVuc2lvbnMpICE9IG51bGwgPyByZWYuaW5jbHVkZXMoc291cmNlKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZShzb3VyY2UsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIGksIGxlbiwgb3JpZ2luYWxGaW5hbFByb3BlcnRpZXMsIHByb3AsIHJlZjtcbiAgICAgIHJlZiA9IHRoaXMuZ2V0RXh0ZW5zaW9uUHJvcGVydGllcyhzb3VyY2UsIHRhcmdldCk7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcHJvcCA9IHJlZltpXTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lLCBwcm9wKTtcbiAgICAgIH1cbiAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICYmIHRhcmdldC5nZXRGaW5hbFByb3BlcnRpZXMpIHtcbiAgICAgICAgb3JpZ2luYWxGaW5hbFByb3BlcnRpZXMgPSB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzO1xuICAgICAgICB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMoKS5jb25jYXQob3JpZ2luYWxGaW5hbFByb3BlcnRpZXMuY2FsbCh0aGlzKSk7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzID0gc291cmNlLmdldEZpbmFsUHJvcGVydGllcyB8fCB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzO1xuICAgICAgfVxuICAgICAgdGFyZ2V0LmV4dGVuc2lvbnMgPSAodGFyZ2V0LmV4dGVuc2lvbnMgfHwgW10pLmNvbmNhdChbc291cmNlXSk7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZS5leHRlbmRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gc291cmNlLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhbHdheXNGaW5hbDogWydleHRlbmRlZCcsICdleHRlbnNpb25zJywgJ19fc3VwZXJfXycsICdjb25zdHJ1Y3RvcicsICdnZXRGaW5hbFByb3BlcnRpZXMnXSxcbiAgICBnZXRFeHRlbnNpb25Qcm9wZXJ0aWVzOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIGFsd2F5c0ZpbmFsLCBwcm9wcywgdGFyZ2V0Q2hhaW47XG4gICAgICBhbHdheXNGaW5hbCA9IHRoaXMuYWx3YXlzRmluYWw7XG4gICAgICB0YXJnZXRDaGFpbiA9IHRoaXMuZ2V0UHJvdG90eXBlQ2hhaW4odGFyZ2V0KTtcbiAgICAgIHByb3BzID0gW107XG4gICAgICB0aGlzLmdldFByb3RvdHlwZUNoYWluKHNvdXJjZSkuZXZlcnkoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciBleGNsdWRlO1xuICAgICAgICBpZiAoIXRhcmdldENoYWluLmluY2x1ZGVzKG9iaikpIHtcbiAgICAgICAgICBleGNsdWRlID0gYWx3YXlzRmluYWw7XG4gICAgICAgICAgaWYgKHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBleGNsdWRlID0gZXhjbHVkZS5jb25jYXQoW1wibGVuZ3RoXCIsIFwicHJvdG90eXBlXCIsIFwibmFtZVwiXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb3BzID0gcHJvcHMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGFyZ2V0Lmhhc093blByb3BlcnR5KGtleSkgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wiICYmIGluZGV4T2YuY2FsbChleGNsdWRlLCBrZXkpIDwgMCAmJiAhcHJvcHMuZmluZChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IGtleTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHZhciBwcm9wO1xuICAgICAgICAgICAgcHJvcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpO1xuICAgICAgICAgICAgcHJvcC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHByb3A7XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwcm9wcztcbiAgICB9LFxuICAgIGdldFByb3RvdHlwZUNoYWluOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBiYXNlUHJvdG90eXBlLCBjaGFpbjtcbiAgICAgIGNoYWluID0gW107XG4gICAgICBiYXNlUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdCk7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjaGFpbi5wdXNoKG9iaik7XG4gICAgICAgIGlmICghKChvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgJiYgb2JqICE9PSBPYmplY3QgJiYgb2JqICE9PSBiYXNlUHJvdG90eXBlKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhaW47XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBNaXhhYmxlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL01peGFibGUuanMubWFwXG4iLCIvLyB0b2RvIDogXG4vLyAgc2ltcGxpZmllZCBmb3JtIDogQHdpdGhvdXROYW1lIG1ldGhvZFxudmFyIE92ZXJyaWRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBPdmVycmlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE92ZXJyaWRlciB7XG4gICAgc3RhdGljIG92ZXJyaWRlcyhvdmVycmlkZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLk92ZXJyaWRlLmFwcGx5TWFueSh0aGlzLnByb3RvdHlwZSwgdGhpcy5uYW1lLCBvdmVycmlkZXMpO1xuICAgIH1cblxuICAgIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gWydfb3ZlcnJpZGVzJ10uY29uY2F0KE9iamVjdC5rZXlzKHRoaXMuX292ZXJyaWRlcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4dGVuZGVkKHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuT3ZlcnJpZGUuYXBwbHlNYW55KHRhcmdldCwgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCB0aGlzLl9vdmVycmlkZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IgPT09IE92ZXJyaWRlcikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmV4dGVuZGVkID0gdGhpcy5leHRlbmRlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBPdmVycmlkZXIuT3ZlcnJpZGUgPSB7XG4gICAgbWFrZU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcbiAgICAgIHZhciBmbiwga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBmbiA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICByZXN1bHRzLnB1c2gob3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgZm4pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgYXBwbHlNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBvdmVycmlkZSA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICBpZiAodHlwZW9mIG92ZXJyaWRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBvdmVycmlkZSA9IHRoaXMubWFrZSh0YXJnZXQsIG5hbWVzcGFjZSwga2V5LCBvdmVycmlkZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYXBwbHkodGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBmbk5hbWUsIGZuKSB7XG4gICAgICB2YXIgb3ZlcnJpZGU7XG4gICAgICBvdmVycmlkZSA9IHtcbiAgICAgICAgZm46IHtcbiAgICAgICAgICBjdXJyZW50OiBmblxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiBmbk5hbWVcbiAgICAgIH07XG4gICAgICBvdmVycmlkZS5mblsnd2l0aCcgKyBuYW1lc3BhY2VdID0gZm47XG4gICAgICByZXR1cm4gb3ZlcnJpZGU7XG4gICAgfSxcbiAgICBlbXB0eUZuOiBmdW5jdGlvbigpIHt9LFxuICAgIGFwcGx5OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGUpIHtcbiAgICAgIHZhciBmbk5hbWUsIG92ZXJyaWRlcywgcmVmLCByZWYxLCB3aXRob3V0O1xuICAgICAgZm5OYW1lID0gb3ZlcnJpZGUubmFtZTtcbiAgICAgIG92ZXJyaWRlcyA9IHRhcmdldC5fb3ZlcnJpZGVzICE9IG51bGwgPyBPYmplY3QuYXNzaWduKHt9LCB0YXJnZXQuX292ZXJyaWRlcykgOiB7fTtcbiAgICAgIHdpdGhvdXQgPSAoKHJlZiA9IHRhcmdldC5fb3ZlcnJpZGVzKSAhPSBudWxsID8gKHJlZjEgPSByZWZbZm5OYW1lXSkgIT0gbnVsbCA/IHJlZjEuZm4uY3VycmVudCA6IHZvaWQgMCA6IHZvaWQgMCkgfHwgdGFyZ2V0W2ZuTmFtZV07XG4gICAgICBvdmVycmlkZSA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlKTtcbiAgICAgIGlmIChvdmVycmlkZXNbZm5OYW1lXSAhPSBudWxsKSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGVzW2ZuTmFtZV0uZm4sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGUuZm4pO1xuICAgICAgfVxuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGhvdXQnICsgbmFtZXNwYWNlXSA9IHdpdGhvdXQgfHwgdGhpcy5lbXB0eUZuO1xuICAgICAgaWYgKHdpdGhvdXQgPT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5taXNzaW5nV2l0aG91dCA9ICd3aXRob3V0JyArIG5hbWVzcGFjZTtcbiAgICAgIH0gZWxzZSBpZiAob3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQpIHtcbiAgICAgICAgb3ZlcnJpZGUuZm5bb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXRdID0gd2l0aG91dDtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGZuTmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGZpbmFsRm4sIGZuLCBrZXksIHJlZjI7XG4gICAgICAgICAgZmluYWxGbiA9IG92ZXJyaWRlLmZuLmN1cnJlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgICByZWYyID0gb3ZlcnJpZGUuZm47XG4gICAgICAgICAgZm9yIChrZXkgaW4gcmVmMikge1xuICAgICAgICAgICAgZm4gPSByZWYyW2tleV07XG4gICAgICAgICAgICBmaW5hbEZuW2tleV0gPSBmbi5iaW5kKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBmbk5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGZpbmFsRm5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmluYWxGbjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvdmVycmlkZXNbZm5OYW1lXSA9IG92ZXJyaWRlO1xuICAgICAgcmV0dXJuIHRhcmdldC5fb3ZlcnJpZGVzID0gb3ZlcnJpZGVzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gT3ZlcnJpZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL092ZXJyaWRlci5qcy5tYXBcbiIsInZhciBCYXNpY1Byb3BlcnR5LCBDYWxjdWxhdGVkUHJvcGVydHksIENvbGxlY3Rpb25Qcm9wZXJ0eSwgQ29tcG9zZWRQcm9wZXJ0eSwgRHluYW1pY1Byb3BlcnR5LCBJbnZhbGlkYXRlZFByb3BlcnR5LCBNaXhhYmxlLCBQcm9wZXJ0eSwgUHJvcGVydHlPd25lcjtcblxuQmFzaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5Jyk7XG5cbkNvbGxlY3Rpb25Qcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHknKTtcblxuQ29tcG9zZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5Jyk7XG5cbkR5bmFtaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHknKTtcblxuQ2FsY3VsYXRlZFByb3BlcnR5ID0gcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xuXG5JbnZhbGlkYXRlZFByb3BlcnR5ID0gcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHknKTtcblxuUHJvcGVydHlPd25lciA9IHJlcXVpcmUoJy4vUHJvcGVydHlPd25lcicpO1xuXG5NaXhhYmxlID0gcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFByb3BlcnR5IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIGJpbmQodGFyZ2V0KSB7XG4gICAgICB2YXIgcGFyZW50LCBwcm9wO1xuICAgICAgcHJvcCA9IHRoaXM7XG4gICAgICBpZiAoISh0eXBlb2YgdGFyZ2V0LmdldFByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmIHRhcmdldC5nZXRQcm9wZXJ0eSh0aGlzLm5hbWUpID09PSB0aGlzKSkge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldC5nZXRQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyAmJiAoKHBhcmVudCA9IHRhcmdldC5nZXRQcm9wZXJ0eSh0aGlzLm5hbWUpKSAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMub3ZlcnJpZGUocGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdldEluc3RhbmNlVHlwZSgpLmJpbmQodGFyZ2V0LCBwcm9wKTtcbiAgICAgICAgdGFyZ2V0Ll9wcm9wZXJ0aWVzID0gKHRhcmdldC5fcHJvcGVydGllcyB8fCBbXSkuY29uY2F0KFtwcm9wXSk7XG4gICAgICAgIGlmIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgIHRhcmdldC5fcHJvcGVydGllcyA9IHRhcmdldC5fcHJvcGVydGllcy5maWx0ZXIoZnVuY3Rpb24oZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBleGlzdGluZyAhPT0gcGFyZW50O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFrZU93bmVyKHRhcmdldCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcDtcbiAgICB9XG5cbiAgICBvdmVycmlkZShwYXJlbnQpIHtcbiAgICAgIHZhciBrZXksIHJlZiwgcmVzdWx0cywgdmFsdWU7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBhcmVudCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5wYXJlbnQgPSBwYXJlbnQub3B0aW9ucztcbiAgICAgICAgcmVmID0gcGFyZW50Lm9wdGlvbnM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChrZXkgaW4gcmVmKSB7XG4gICAgICAgICAgdmFsdWUgPSByZWZba2V5XTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9uc1trZXldID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMub3B0aW9uc1trZXldLm92ZXJyaWRlZCA9IHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnNba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm9wdGlvbnNba2V5XSA9IHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VPd25lcih0YXJnZXQpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoISgocmVmID0gdGFyZ2V0LmV4dGVuc2lvbnMpICE9IG51bGwgPyByZWYuaW5jbHVkZXMoUHJvcGVydHlPd25lci5wcm90b3R5cGUpIDogdm9pZCAwKSkge1xuICAgICAgICByZXR1cm4gTWl4YWJsZS5FeHRlbnNpb24ubWFrZShQcm9wZXJ0eU93bmVyLnByb3RvdHlwZSwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZVZhck5hbWUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmluc3RhbmNlVmFyTmFtZSB8fCAnXycgKyB0aGlzLm5hbWU7XG4gICAgfVxuXG4gICAgaXNJbnN0YW50aWF0ZWQob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW3RoaXMuZ2V0SW5zdGFuY2VWYXJOYW1lKCldICE9IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2Uob2JqKSB7XG4gICAgICB2YXIgVHlwZSwgdmFyTmFtZTtcbiAgICAgIHZhck5hbWUgPSB0aGlzLmdldEluc3RhbmNlVmFyTmFtZSgpO1xuICAgICAgaWYgKCF0aGlzLmlzSW5zdGFudGlhdGVkKG9iaikpIHtcbiAgICAgICAgVHlwZSA9IHRoaXMuZ2V0SW5zdGFuY2VUeXBlKCk7XG4gICAgICAgIG9ialt2YXJOYW1lXSA9IG5ldyBUeXBlKHRoaXMsIG9iaik7XG4gICAgICAgIG9ialt2YXJOYW1lXS5pbml0KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqW3Zhck5hbWVdO1xuICAgIH1cblxuICAgIGdldEluc3RhbmNlVHlwZSgpIHtcbiAgICAgIGlmICghdGhpcy5pbnN0YW5jZVR5cGUpIHtcbiAgICAgICAgdGhpcy5jb21wb3NlcnMuZm9yRWFjaCgoY29tcG9zZXIpID0+IHtcbiAgICAgICAgICByZXR1cm4gY29tcG9zZXIuY29tcG9zZSh0aGlzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZVR5cGU7XG4gICAgfVxuXG4gIH07XG5cbiAgUHJvcGVydHkucHJvdG90eXBlLmNvbXBvc2VycyA9IFtDb21wb3NlZFByb3BlcnR5LCBDb2xsZWN0aW9uUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgQmFzaWNQcm9wZXJ0eSwgQ2FsY3VsYXRlZFByb3BlcnR5LCBJbnZhbGlkYXRlZFByb3BlcnR5XTtcblxuICByZXR1cm4gUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHkuanMubWFwXG4iLCJ2YXIgUHJvcGVydHlPd25lcjtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0eU93bmVyID0gY2xhc3MgUHJvcGVydHlPd25lciB7XG4gIGdldFByb3BlcnR5KG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcyAmJiB0aGlzLl9wcm9wZXJ0aWVzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgcmV0dXJuIHByb3AubmFtZSA9PT0gbmFtZTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFByb3BlcnR5SW5zdGFuY2UobmFtZSkge1xuICAgIHZhciByZXM7XG4gICAgcmVzID0gdGhpcy5nZXRQcm9wZXJ0eShuYW1lKTtcbiAgICBpZiAocmVzKSB7XG4gICAgICByZXR1cm4gcmVzLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuc2xpY2UoKTtcbiAgfVxuXG4gIGdldFByb3BlcnR5SW5zdGFuY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLm1hcCgocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRJbnN0YW50aWF0ZWRQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLmZpbHRlcigocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuaXNJbnN0YW50aWF0ZWQodGhpcyk7XG4gICAgfSkubWFwKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnJlZHVjZSgocmVzLCBwcm9wKSA9PiB7XG4gICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICBpZiAocHJvcC5pc0luc3RhbnRpYXRlZCh0aGlzKSkge1xuICAgICAgICBpbnN0YW5jZSA9IHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5jYWxjdWxhdGVkICYmIGluc3RhbmNlLm1hbnVhbCkge1xuICAgICAgICAgIHJlc1twcm9wLm5hbWVdID0gaW5zdGFuY2UudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSwge30pO1xuICB9XG5cbiAgc2V0UHJvcGVydGllcyhkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICB2YXIga2V5LCBwcm9wLCB2YWw7XG4gICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgdmFsID0gZGF0YVtrZXldO1xuICAgICAgaWYgKCgob3B0aW9ucy53aGl0ZWxpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy53aGl0ZWxpc3QuaW5kZXhPZihrZXkpICE9PSAtMSkgJiYgKChvcHRpb25zLmJsYWNrbGlzdCA9PSBudWxsKSB8fCBvcHRpb25zLmJsYWNrbGlzdC5pbmRleE9mKGtleSkgPT09IC0xKSkge1xuICAgICAgICBwcm9wID0gdGhpcy5nZXRQcm9wZXJ0eUluc3RhbmNlKGtleSk7XG4gICAgICAgIGlmIChwcm9wICE9IG51bGwpIHtcbiAgICAgICAgICBwcm9wLnNldCh2YWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGVzdHJveVByb3BlcnRpZXMoKSB7XG4gICAgdGhpcy5nZXRJbnN0YW50aWF0ZWRQcm9wZXJ0aWVzKCkuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuZGVzdHJveSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3Byb3BlcnRpZXMgPSBbXTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGxpc3RlbmVyQWRkZWQoZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgaWYgKHByb3AuZ2V0SW5zdGFuY2VUeXBlKCkucHJvdG90eXBlLmNoYW5nZUV2ZW50TmFtZSA9PT0gZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGFyZ2V0Lmxpc3RlbmVyQWRkZWQgPSB0aGlzLmxpc3RlbmVyQWRkZWQ7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Qcm9wZXJ0eU93bmVyLmpzLm1hcFxuIiwidmFyIEJhc2ljUHJvcGVydHksIEV2ZW50RW1pdHRlciwgTG9hZGVyLCBNaXhhYmxlLCBQcm9wZXJ0eVdhdGNoZXIsIFJlZmVycmVkO1xuXG5NaXhhYmxlID0gcmVxdWlyZSgnLi4vTWl4YWJsZScpO1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCcuLi9FdmVudEVtaXR0ZXInKTtcblxuTG9hZGVyID0gcmVxdWlyZSgnLi4vTG9hZGVyJyk7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlcicpO1xuXG5SZWZlcnJlZCA9IHJlcXVpcmUoJy4uL1JlZmVycmVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQmFzaWNQcm9wZXJ0eSBleHRlbmRzIE1peGFibGUge1xuICAgIGNvbnN0cnVjdG9yKHByb3BlcnR5LCBvYmopIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgICB0aGlzLm9iaiA9IG9iajtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgdmFyIHByZWxvYWQ7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5pbmdlc3QodGhpcy5kZWZhdWx0KTtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pbml0aWF0ZWQgPSBmYWxzZTtcbiAgICAgIHByZWxvYWQgPSB0aGlzLmNvbnN0cnVjdG9yLmdldFByZWxvYWQodGhpcy5vYmosIHRoaXMucHJvcGVydHksIHRoaXMpO1xuICAgICAgaWYgKHByZWxvYWQubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gTG9hZGVyLmxvYWRNYW55KHByZWxvYWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gICAgICBpZiAoIXRoaXMuaW5pdGlhdGVkKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3VwZGF0ZWQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm91dHB1dCgpO1xuICAgIH1cblxuICAgIHNldCh2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldEFuZENoZWNrQ2hhbmdlcyh2YWwpO1xuICAgIH1cblxuICAgIGNhbGxiYWNrU2V0KHZhbCkge1xuICAgICAgdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJzZXRcIiwgdmFsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldEFuZENoZWNrQ2hhbmdlcyh2YWwpIHtcbiAgICAgIHZhciBvbGQ7XG4gICAgICB2YWwgPSB0aGlzLmluZ2VzdCh2YWwpO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHZhbCwgdGhpcy52YWx1ZSkpIHtcbiAgICAgICAgb2xkID0gdGhpcy52YWx1ZTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbDtcbiAgICAgICAgdGhpcy5tYW51YWwgPSB0cnVlO1xuICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNoZWNrQ2hhbmdlcyh2YWwsIG9sZCkge1xuICAgICAgcmV0dXJuIHZhbCAhPT0gb2xkO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKHRoaXMucHJvcGVydHkub3B0aW9ucy5kZXN0cm95ID09PSB0cnVlICYmICgoKHJlZiA9IHRoaXMudmFsdWUpICE9IG51bGwgPyByZWYuZGVzdHJveSA6IHZvaWQgMCkgIT0gbnVsbCkpIHtcbiAgICAgICAgdGhpcy52YWx1ZS5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KCdkZXN0cm95JywgdGhpcy52YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgfVxuXG4gICAgY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0LCAuLi5hcmdzKSB7XG4gICAgICBpZiAodHlwZW9mIGZ1bmN0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBmdW5jdCA9IHRoaXMucHJvcGVydHkub3B0aW9uc1tmdW5jdF07XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGZ1bmN0Lm92ZXJyaWRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhcmdzLnB1c2goKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsT3B0aW9uRnVuY3QoZnVuY3Qub3ZlcnJpZGVkLCAuLi5hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3QuYXBwbHkodGhpcy5vYmosIGFyZ3MpO1xuICAgIH1cblxuICAgIHJldmFsaWRhdGVkKCkge1xuICAgICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYXRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaW5nZXN0KHZhbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaW5nZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB2YWwgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcImluZ2VzdFwiLCB2YWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvdXRwdXQoKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwib3V0cHV0XCIsIHRoaXMudmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hhbmdlZChvbGQpIHtcbiAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJywgb2xkKTtcbiAgICAgIHRoaXMuZW1pdEV2ZW50KCdjaGFuZ2VkJywgb2xkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmIChwcm9wLmluc3RhbmNlVHlwZSA9PSBudWxsKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBCYXNpY1Byb3BlcnR5IHt9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuc2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5zZXQgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja1NldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5zZXQgPSB0aGlzLnByb3RvdHlwZS5zZXRBbmRDaGVja0NoYW5nZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmRlZmF1bHQgPSBwcm9wLm9wdGlvbnMuZGVmYXVsdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcbiAgICAgIHZhciBtYWosIG9wdCwgcHJlbG9hZDtcbiAgICAgIG1haiA9IHByb3AubmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3AubmFtZS5zbGljZSgxKTtcbiAgICAgIG9wdCA9IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5zZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIG9wdC5zZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5zZXQodmFsKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgb3B0KTtcbiAgICAgIHRhcmdldFsnZ2V0JyArIG1hal0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9O1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5zZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIHRhcmdldFsnc2V0JyArIG1hal0gPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICBwcm9wLmdldEluc3RhbmNlKHRoaXMpLnNldCh2YWwpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgdGFyZ2V0WydpbnZhbGlkYXRlJyArIG1hal0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5pbnZhbGlkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIHByZWxvYWQgPSB0aGlzLmdldFByZWxvYWQodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGlmIChwcmVsb2FkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgTWl4YWJsZS5FeHRlbnNpb24ubWFrZU9uY2UoTG9hZGVyLnByb3RvdHlwZSwgdGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkKHByZWxvYWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRQcmVsb2FkKHRhcmdldCwgcHJvcCwgaW5zdGFuY2UpIHtcbiAgICAgIHZhciBwcmVsb2FkLCByZWYsIHJlZjEsIHRvTG9hZDtcbiAgICAgIHByZWxvYWQgPSBbXTtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNoYW5nZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRvTG9hZCA9IHtcbiAgICAgICAgICB0eXBlOiBQcm9wZXJ0eVdhdGNoZXIsXG4gICAgICAgICAgbG9hZGVyQXNTY29wZTogdHJ1ZSxcbiAgICAgICAgICBwcm9wZXJ0eTogaW5zdGFuY2UgfHwgcHJvcC5uYW1lLFxuICAgICAgICAgIGluaXRCeUxvYWRlcjogdHJ1ZSxcbiAgICAgICAgICBhdXRvQmluZDogdHJ1ZSxcbiAgICAgICAgICBjYWxsYmFjazogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICByZWY6IHtcbiAgICAgICAgICAgIHByb3A6IHByb3AubmFtZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBwcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICAgICAgY29udGV4dDogJ2NoYW5nZSdcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mICgocmVmID0gcHJvcC5vcHRpb25zLmNoYW5nZSkgIT0gbnVsbCA/IHJlZi5jb3B5V2l0aCA6IHZvaWQgMCkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0b0xvYWQgPSB7XG4gICAgICAgICAgdHlwZTogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICBsb2FkZXJBc1Njb3BlOiB0cnVlLFxuICAgICAgICAgIHByb3BlcnR5OiBpbnN0YW5jZSB8fCBwcm9wLm5hbWUsXG4gICAgICAgICAgaW5pdEJ5TG9hZGVyOiB0cnVlLFxuICAgICAgICAgIGF1dG9CaW5kOiB0cnVlLFxuICAgICAgICAgIHJlZjoge1xuICAgICAgICAgICAgcHJvcDogcHJvcC5uYW1lLFxuICAgICAgICAgICAgdHlwZTogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjaGFuZ2UnXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCh0b0xvYWQgIT0gbnVsbCkgJiYgISgocmVmMSA9IHRhcmdldC5wcmVsb2FkZWQpICE9IG51bGwgPyByZWYxLmZpbmQoZnVuY3Rpb24obG9hZGVkKSB7XG4gICAgICAgIHJldHVybiBSZWZlcnJlZC5jb21wYXJlUmVmKHRvTG9hZC5yZWYsIGxvYWRlZC5yZWYpICYmICFpbnN0YW5jZSB8fCAobG9hZGVkLmluc3RhbmNlICE9IG51bGwpO1xuICAgICAgfSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHByZWxvYWQucHVzaCh0b0xvYWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZWxvYWQ7XG4gICAgfVxuXG4gIH07XG5cbiAgQmFzaWNQcm9wZXJ0eS5leHRlbmQoRXZlbnRFbWl0dGVyKTtcblxuICByZXR1cm4gQmFzaWNQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHkuanMubWFwXG4iLCJ2YXIgQ2FsY3VsYXRlZFByb3BlcnR5LCBEeW5hbWljUHJvcGVydHksIEludmFsaWRhdG9yLCBPdmVycmlkZXI7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxuRHluYW1pY1Byb3BlcnR5ID0gcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcblxuT3ZlcnJpZGVyID0gcmVxdWlyZSgnLi4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsY3VsYXRlZFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDYWxjdWxhdGVkUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xuICAgIGNhbGN1bCgpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdCh0aGlzLmNhbGN1bEZ1bmN0KTtcbiAgICAgIHRoaXMubWFudWFsID0gZmFsc2U7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNhbGN1bEZ1bmN0ID0gcHJvcC5vcHRpb25zLmNhbGN1bDtcbiAgICAgICAgaWYgKCEocHJvcC5vcHRpb25zLmNhbGN1bC5sZW5ndGggPiAwKSkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5leHRlbmQoQ2FsY3VsYXRlZFByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIENhbGN1bGF0ZWRQcm9wZXJ0eS5leHRlbmQoT3ZlcnJpZGVyKTtcblxuICBDYWxjdWxhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGluaXRpYXRlZCwgb2xkO1xuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvci52YWxpZGF0ZVVua25vd25zKCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgICBvbGQgPSB0aGlzLnZhbHVlO1xuICAgICAgICBpbml0aWF0ZWQgPSB0aGlzLmluaXRpYXRlZDtcbiAgICAgICAgdGhpcy5jYWxjdWwoKTtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHRoaXMudmFsdWUsIG9sZCkpIHtcbiAgICAgICAgICBpZiAoaW5pdGlhdGVkKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3VwZGF0ZWQnLCBvbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaW5pdGlhdGVkKSB7XG4gICAgICAgICAgdGhpcy5lbWl0RXZlbnQoJ3VwZGF0ZWQnLCBvbGQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBDYWxjdWxhdGVkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHkuanMubWFwXG4iLCJ2YXIgQ29sbGVjdGlvbiwgQ29sbGVjdGlvblByb3BlcnR5LCBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBEeW5hbWljUHJvcGVydHksIFJlZmVycmVkO1xuXG5EeW5hbWljUHJvcGVydHkgPSByZXF1aXJlKCcuL0R5bmFtaWNQcm9wZXJ0eScpO1xuXG5Db2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vQ29sbGVjdGlvbicpO1xuXG5SZWZlcnJlZCA9IHJlcXVpcmUoJy4uL1JlZmVycmVkJyk7XG5cbkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRlZC9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb2xsZWN0aW9uUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xuICAgIGluZ2VzdCh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWwgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcImluZ2VzdFwiLCB2YWwpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbC50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB2YWwudG9BcnJheSgpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFt2YWxdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrQ2hhbmdlZEl0ZW1zKHZhbCwgb2xkKSB7XG4gICAgICB2YXIgY29tcGFyZUZ1bmN0aW9uO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLmNvbXBhcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29tcGFyZUZ1bmN0aW9uID0gdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChuZXcgQ29sbGVjdGlvbih2YWwpKS5jaGVja0NoYW5nZXMob2xkLCB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLm9yZGVyZWQsIGNvbXBhcmVGdW5jdGlvbik7XG4gICAgfVxuXG4gICAgb3V0cHV0KCkge1xuICAgICAgdmFyIGNvbCwgcHJvcCwgdmFsdWU7XG4gICAgICB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByb3AgPSB0aGlzO1xuICAgICAgY29sID0gQ29sbGVjdGlvbi5uZXdTdWJDbGFzcyh0aGlzLmNvbGxlY3Rpb25PcHRpb25zLCB2YWx1ZSk7XG4gICAgICBjb2wuY2hhbmdlZCA9IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICByZXR1cm4gcHJvcC5jaGFuZ2VkKG9sZCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNvbDtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQ29sbGVjdGlvblByb3BlcnR5IHt9O1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY29sbGVjdGlvbk9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRDb2xsZWN0aW9uT3B0aW9ucywgdHlwZW9mIHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uID09PSAnb2JqZWN0JyA/IHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uIDoge30pO1xuICAgICAgICBpZiAocHJvcC5vcHRpb25zLmNvbGxlY3Rpb24uY29tcGFyZSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jaGVja0NoYW5nZXMgPSB0aGlzLnByb3RvdHlwZS5jaGVja0NoYW5nZWRJdGVtcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRQcmVsb2FkKHRhcmdldCwgcHJvcCwgaW5zdGFuY2UpIHtcbiAgICAgIHZhciBwcmVsb2FkLCByZWYsIHJlZjE7XG4gICAgICBwcmVsb2FkID0gW107XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jaGFuZ2UgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLml0ZW1BZGRlZCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLml0ZW1SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlZiA9IHtcbiAgICAgICAgICBwcm9wOiBwcm9wLm5hbWUsXG4gICAgICAgICAgY29udGV4dDogJ2NoYW5nZSdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCEoKHJlZjEgPSB0YXJnZXQucHJlbG9hZGVkKSAhPSBudWxsID8gcmVmMS5maW5kKGZ1bmN0aW9uKGxvYWRlZCkge1xuICAgICAgICAgIHJldHVybiBSZWZlcnJlZC5jb21wYXJlUmVmKHJlZiwgbG9hZGVkLnJlZikgJiYgKGxvYWRlZC5pbnN0YW5jZSAhPSBudWxsKTtcbiAgICAgICAgfSkgOiB2b2lkIDApKSB7XG4gICAgICAgICAgcHJlbG9hZC5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIsXG4gICAgICAgICAgICBsb2FkZXJBc1Njb3BlOiB0cnVlLFxuICAgICAgICAgICAgc2NvcGU6IHRhcmdldCxcbiAgICAgICAgICAgIHByb3BlcnR5OiBpbnN0YW5jZSB8fCBwcm9wLm5hbWUsXG4gICAgICAgICAgICBpbml0QnlMb2FkZXI6IHRydWUsXG4gICAgICAgICAgICBhdXRvQmluZDogdHJ1ZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBwcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICAgICAgb25BZGRlZDogcHJvcC5vcHRpb25zLml0ZW1BZGRlZCxcbiAgICAgICAgICAgIG9uUmVtb3ZlZDogcHJvcC5vcHRpb25zLml0ZW1SZW1vdmVkLFxuICAgICAgICAgICAgcmVmOiByZWZcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByZWxvYWQ7XG4gICAgfVxuXG4gIH07XG5cbiAgQ29sbGVjdGlvblByb3BlcnR5LmRlZmF1bHRDb2xsZWN0aW9uT3B0aW9ucyA9IHtcbiAgICBjb21wYXJlOiBmYWxzZSxcbiAgICBvcmRlcmVkOiB0cnVlXG4gIH07XG5cbiAgcmV0dXJuIENvbGxlY3Rpb25Qcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0NvbGxlY3Rpb25Qcm9wZXJ0eS5qcy5tYXBcbiIsInZhciBDYWxjdWxhdGVkUHJvcGVydHksIENvbGxlY3Rpb24sIENvbXBvc2VkUHJvcGVydHksIEludmFsaWRhdG9yO1xuXG5DYWxjdWxhdGVkUHJvcGVydHkgPSByZXF1aXJlKCcuL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbkNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9Db2xsZWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9zZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29tcG9zZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgaW5pdCgpIHtcbiAgICAgIHRoaXMuaW5pdENvbXBvc2VkKCk7XG4gICAgICByZXR1cm4gc3VwZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXRDb21wb3NlZCgpIHtcbiAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2RlZmF1bHQnKSkge1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVmYXVsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdCA9IHRoaXMudmFsdWUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5tZW1iZXJzID0gbmV3IENvbXBvc2VkUHJvcGVydHkuTWVtYmVycyh0aGlzLnByb3BlcnR5Lm9wdGlvbnMubWVtYmVycyk7XG4gICAgICB0aGlzLm1lbWJlcnMuY2hhbmdlZCA9IChvbGQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLmpvaW4gPSB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkID09PSAnZnVuY3Rpb24nID8gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkIDogdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlZmF1bHQgPT09IGZhbHNlID8gQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zLm9yIDogQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zLmFuZDtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLm9iaik7XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm1lbWJlcnMucmVkdWNlKChwcmV2LCBtZW1iZXIpID0+IHtcbiAgICAgICAgICB2YXIgdmFsO1xuICAgICAgICAgIHZhbCA9IHR5cGVvZiBtZW1iZXIgPT09ICdmdW5jdGlvbicgPyBtZW1iZXIodGhpcy5pbnZhbGlkYXRvcikgOiBtZW1iZXI7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuam9pbihwcmV2LCB2YWwpO1xuICAgICAgICB9LCB0aGlzLmRlZmF1bHQpO1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5vcHRpb25zLmNvbXBvc2VkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBDb21wb3NlZFByb3BlcnR5IHt9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBiaW5kKHRhcmdldCwgcHJvcCkge1xuICAgICAgQ2FsY3VsYXRlZFByb3BlcnR5LmJpbmQodGFyZ2V0LCBwcm9wKTtcbiAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUgKyAnTWVtYmVycycsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLm1lbWJlcnM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucyA9IHtcbiAgICBhbmQ6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhICYmIGI7XG4gICAgfSxcbiAgICBvcjogZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEgfHwgYjtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvbXBvc2VkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbkNvbXBvc2VkUHJvcGVydHkuTWVtYmVycyA9IGNsYXNzIE1lbWJlcnMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgYWRkUHJvcGVydHlSZWYobmFtZSwgb2JqKSB7XG4gICAgdmFyIGZuO1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopID09PSAtMSkge1xuICAgICAgZm4gPSBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChuYW1lLCBvYmopO1xuICAgICAgfTtcbiAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmpcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBhZGRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbjtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLnB1c2goZm4pO1xuICAgIH1cbiAgfVxuXG4gIHNldFZhbHVlUmVmKHZhbCwgbmFtZSwgb2JqKSB7XG4gICAgdmFyIGZuLCBpLCByZWY7XG4gICAgaSA9IHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaik7XG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldChpKS5yZWYudmFsICE9PSB2YWwpIHtcbiAgICAgIHJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmosXG4gICAgICAgIHZhbDogdmFsXG4gICAgICB9O1xuICAgICAgZm4gPSBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfTtcbiAgICAgIGZuLnJlZiA9IHJlZjtcbiAgICAgIHJldHVybiB0aGlzLnNldChpLCBmbik7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmFsdWVSZWYobmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEJ5UmVmKG5hbWUsIG9iaikucmVmLnZhbDtcbiAgfVxuXG4gIGFkZEZ1bmN0aW9uUmVmKGZuLCBuYW1lLCBvYmopIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmpcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBmaW5kQnlSZWYobmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W3RoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaildO1xuICB9XG5cbiAgZmluZFJlZkluZGV4KG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maW5kSW5kZXgoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICByZXR1cm4gKG1lbWJlci5yZWYgIT0gbnVsbCkgJiYgbWVtYmVyLnJlZi5vYmogPT09IG9iaiAmJiBtZW1iZXIucmVmLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVSZWYobmFtZSwgb2JqKSB7XG4gICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgaW5kZXggPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMubWFwXG4iLCJ2YXIgQmFzaWNQcm9wZXJ0eSwgRHluYW1pY1Byb3BlcnR5LCBJbnZhbGlkYXRvcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xuXG5CYXNpY1Byb3BlcnR5ID0gcmVxdWlyZSgnLi9CYXNpY1Byb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRHluYW1pY1Byb3BlcnR5ID0gY2xhc3MgRHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7XG4gIGNhbGxiYWNrR2V0KCkge1xuICAgIHZhciByZXM7XG4gICAgcmVzID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJnZXRcIik7XG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW52YWxpZGF0ZU5vdGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9pbnZhbGlkYXRlTm90aWNlKCkge1xuICAgIHRoaXMuZW1pdEV2ZW50KCdpbnZhbGlkYXRlZCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmdldCA9IHRoaXMucHJvdG90eXBlLmNhbGxiYWNrR2V0O1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5LmpzLm1hcFxuIiwidmFyIENhbGN1bGF0ZWRQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eSwgSW52YWxpZGF0b3I7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxuQ2FsY3VsYXRlZFByb3BlcnR5ID0gcmVxdWlyZSgnLi9DYWxjdWxhdGVkUHJvcGVydHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnZhbGlkYXRlZFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBJbnZhbGlkYXRlZFByb3BlcnR5IGV4dGVuZHMgQ2FsY3VsYXRlZFByb3BlcnR5IHtcbiAgICB1bmtub3duKCkge1xuICAgICAgaWYgKHRoaXMuY2FsY3VsYXRlZCB8fCB0aGlzLmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZU5vdGljZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuY2FsY3VsID09PSAnZnVuY3Rpb24nICYmIHByb3Aub3B0aW9ucy5jYWxjdWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKEludmFsaWRhdGVkUHJvcGVydHkpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEludmFsaWRhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5vYmopO1xuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5jYWxjdWxGdW5jdCwgaW52YWxpZGF0b3IpO1xuICAgICAgICB0aGlzLm1hbnVhbCA9IGZhbHNlO1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kZXN0cm95LndpdGhvdXRJbnZhbGlkYXRlZFByb3BlcnR5KCk7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaW52YWxpZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5jYWxjdWxhdGVkIHx8IHRoaXMuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZU5vdGljZSgpO1xuICAgICAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCAmJiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEludmFsaWRhdGVkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5LmpzLm1hcFxuIiwidmFyIFJlZmVycmVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZmVycmVkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSZWZlcnJlZCB7XG4gICAgY29tcGFyZVJlZmVyZWQocmVmZXJlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuY29tcGFyZVJlZmVyZWQocmVmZXJlZCwgdGhpcyk7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge31cblxuICAgIHN0YXRpYyBjb21wYXJlUmVmZXJlZChvYmoxLCBvYmoyKSB7XG4gICAgICByZXR1cm4gb2JqMSA9PT0gb2JqMiB8fCAoKG9iajEgIT0gbnVsbCkgJiYgKG9iajIgIT0gbnVsbCkgJiYgb2JqMS5jb25zdHJ1Y3RvciA9PT0gb2JqMi5jb25zdHJ1Y3RvciAmJiB0aGlzLmNvbXBhcmVSZWYob2JqMS5yZWYsIG9iajIucmVmKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBhcmVSZWYocmVmMSwgcmVmMikge1xuICAgICAgcmV0dXJuIChyZWYxICE9IG51bGwpICYmIChyZWYyICE9IG51bGwpICYmIChyZWYxID09PSByZWYyIHx8IChBcnJheS5pc0FycmF5KHJlZjEpICYmIEFycmF5LmlzQXJyYXkocmVmMSkgJiYgcmVmMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFbaV0sIHJlZjJbaV0pO1xuICAgICAgfSkpIHx8ICh0eXBlb2YgcmVmMSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVmMiA9PT0gXCJvYmplY3RcIiAmJiBPYmplY3Qua2V5cyhyZWYxKS5qb2luKCkgPT09IE9iamVjdC5rZXlzKHJlZjIpLmpvaW4oKSAmJiBPYmplY3Qua2V5cyhyZWYxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFba2V5XSwgcmVmMltrZXldKTtcbiAgICAgIH0pKSk7XG4gICAgfVxuXG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZmVycmVkLnByb3RvdHlwZSwgJ3JlZicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVmKCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUmVmZXJyZWQ7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUmVmZXJyZWQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBVcGRhdGVyO1xuXG5CaW5kZXIgPSByZXF1aXJlKCcuL0JpbmRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciByZWY7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmNhbGxiYWNrIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZENhbGxiYWNrKG9wdGlvbnMuY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IChyZWYgPSBvcHRpb25zLmNhbGxiYWNrcykgIT0gbnVsbCA/IHJlZi5mb3JFYWNoIDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIHRoaXMucnVuQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBydW5DYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVwZGF0aW5nICYmICF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIG5leHRUaWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgIGlmICghdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubmV4dC5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMubmV4dCA9IFtdO1xuICB9XG5cbn07XG5cblVwZGF0ZXIuQmluZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgY2xhc3MgQmluZGVyIGV4dGVuZHMgc3VwZXJDbGFzcyB7XG4gICAgY29uc3RydWN0b3IodGFyZ2V0LCBjYWxsYmFjazEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjazE7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZG9CaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZENhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUNhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBCaW5kZXI7XG5cbn0pLmNhbGwodGhpcywgQmluZGVyKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9VcGRhdGVyLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQmluZGVyXCI6IHJlcXVpcmUoXCIuL0JpbmRlclwiKSxcbiAgXCJDb2xsZWN0aW9uXCI6IHJlcXVpcmUoXCIuL0NvbGxlY3Rpb25cIiksXG4gIFwiRWxlbWVudFwiOiByZXF1aXJlKFwiLi9FbGVtZW50XCIpLFxuICBcIkV2ZW50QmluZFwiOiByZXF1aXJlKFwiLi9FdmVudEJpbmRcIiksXG4gIFwiRXZlbnRFbWl0dGVyXCI6IHJlcXVpcmUoXCIuL0V2ZW50RW1pdHRlclwiKSxcbiAgXCJJbnZhbGlkYXRvclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRvclwiKSxcbiAgXCJMb2FkZXJcIjogcmVxdWlyZShcIi4vTG9hZGVyXCIpLFxuICBcIk1peGFibGVcIjogcmVxdWlyZShcIi4vTWl4YWJsZVwiKSxcbiAgXCJPdmVycmlkZXJcIjogcmVxdWlyZShcIi4vT3ZlcnJpZGVyXCIpLFxuICBcIlByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5XCIpLFxuICBcIlByb3BlcnR5T3duZXJcIjogcmVxdWlyZShcIi4vUHJvcGVydHlPd25lclwiKSxcbiAgXCJSZWZlcnJlZFwiOiByZXF1aXJlKFwiLi9SZWZlcnJlZFwiKSxcbiAgXCJVcGRhdGVyXCI6IHJlcXVpcmUoXCIuL1VwZGF0ZXJcIiksXG4gIFwiSW52YWxpZGF0ZWRcIjoge1xuICAgIFwiQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiKSxcbiAgICBcIkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXJcIjogcmVxdWlyZShcIi4vSW52YWxpZGF0ZWQvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlclwiKSxcbiAgICBcIkludmFsaWRhdGVkXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0ludmFsaWRhdGVkXCIpLFxuICAgIFwiUHJvcGVydHlXYXRjaGVyXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlclwiKSxcbiAgfSxcbiAgXCJQcm9wZXJ0eVR5cGVzXCI6IHtcbiAgICBcIkJhc2ljUHJvcGVydHlcIjogcmVxdWlyZShcIi4vUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5XCIpLFxuICAgIFwiQ2FsY3VsYXRlZFByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5XCIpLFxuICAgIFwiQ29sbGVjdGlvblByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5XCIpLFxuICAgIFwiQ29tcG9zZWRQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHlcIiksXG4gICAgXCJEeW5hbWljUHJvcGVydHlcIjogcmVxdWlyZShcIi4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHlcIiksXG4gICAgXCJJbnZhbGlkYXRlZFByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eVwiKSxcbiAgfSxcbn0iLCJ2YXIgQXV0b21hdGljRG9vciwgQ2hhcmFjdGVyLCBEb29yO1xuXG5Eb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XG5cbkNoYXJhY3RlciA9IHJlcXVpcmUoJy4vQ2hhcmFjdGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0b21hdGljRG9vciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXV0b21hdGljRG9vciBleHRlbmRzIERvb3Ige1xuICAgIHVwZGF0ZVRpbGVNZW1iZXJzKG9sZCkge1xuICAgICAgdmFyIHJlZiwgcmVmMSwgcmVmMiwgcmVmMztcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYucmVtb3ZlUmVmKCd1bmxvY2tlZCcsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYxLnJlbW92ZVJlZignb3BlbicsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICAgIGlmICgocmVmMiA9IHRoaXMudGlsZS53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYyLmFkZFByb3BlcnR5UmVmKCd1bmxvY2tlZCcsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAocmVmMyA9IHRoaXMudGlsZS50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwgPyByZWYzLmFkZFByb3BlcnR5UmVmKCdvcGVuJywgdGhpcykgOiB2b2lkIDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHN1cGVyLmluaXQoKTtcbiAgICAgIHJldHVybiB0aGlzLm9wZW47XG4gICAgfVxuXG4gICAgaXNBY3RpdmF0b3JQcmVzZW50KGludmFsaWRhdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlYWN0aXZlVGlsZXMoaW52YWxpZGF0ZSkuc29tZSgodGlsZSkgPT4ge1xuICAgICAgICB2YXIgY2hpbGRyZW47XG4gICAgICAgIGNoaWxkcmVuID0gaW52YWxpZGF0ZSA/IGludmFsaWRhdGUucHJvcCgnY2hpbGRyZW4nLCB0aWxlKSA6IHRpbGUuY2hpbGRyZW47XG4gICAgICAgIHJldHVybiBjaGlsZHJlbi5zb21lKChjaGlsZCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNhbkJlQWN0aXZhdGVkQnkoY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbkJlQWN0aXZhdGVkQnkoZWxlbSkge1xuICAgICAgcmV0dXJuIGVsZW0gaW5zdGFuY2VvZiBDaGFyYWN0ZXI7XG4gICAgfVxuXG4gICAgZ2V0UmVhY3RpdmVUaWxlcyhpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgZGlyZWN0aW9uLCB0aWxlO1xuICAgICAgdGlsZSA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AoJ3RpbGUnKSA6IHRoaXMudGlsZTtcbiAgICAgIGlmICghdGlsZSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICBkaXJlY3Rpb24gPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKCdkaXJlY3Rpb24nKSA6IHRoaXMuZGlyZWN0aW9uO1xuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gRG9vci5kaXJlY3Rpb25zLmhvcml6b250YWwpIHtcbiAgICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgwLCAxKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMCwgLTEpXS5maWx0ZXIoZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgxLCAwKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoLTEsIDApXS5maWx0ZXIoZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEF1dG9tYXRpY0Rvb3IucHJvcGVydGllcyh7XG4gICAgb3Blbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHJldHVybiAhaW52YWxpZGF0ZS5wcm9wKCdsb2NrZWQnKSAmJiB0aGlzLmlzQWN0aXZhdG9yUHJlc2VudChpbnZhbGlkYXRlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxvY2tlZDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHVubG9ja2VkOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRlLnByb3AoJ2xvY2tlZCcpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEF1dG9tYXRpY0Rvb3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQXV0b21hdGljRG9vci5qcy5tYXBcbiIsInZhciBDaGFyYWN0ZXIsIERhbWFnZWFibGUsIFRpbGVkLCBXYWxrQWN0aW9uO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxuRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpO1xuXG5XYWxrQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL1dhbGtBY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENoYXJhY3RlciBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICBzZXREZWZhdWx0cygpIHtcbiAgICAgIGlmICghdGhpcy50aWxlICYmICh0aGlzLmdhbWUubWFpblRpbGVDb250YWluZXIgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHV0T25SYW5kb21UaWxlKHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lci50aWxlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FuR29PblRpbGUodGlsZSkge1xuICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwgPyB0aWxlLndhbGthYmxlIDogdm9pZCAwKSAhPT0gZmFsc2U7XG4gICAgfVxuXG4gICAgd2Fsa1RvKHRpbGUpIHtcbiAgICAgIHZhciBhY3Rpb247XG4gICAgICBhY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzLFxuICAgICAgICB0YXJnZXQ6IHRpbGVcbiAgICAgIH0pO1xuICAgICAgYWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgIHJldHVybiBhY3Rpb247XG4gICAgfVxuXG4gICAgaXNTZWxlY3RhYmxlQnkocGxheWVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgfTtcblxuICBDaGFyYWN0ZXIuZXh0ZW5kKERhbWFnZWFibGUpO1xuXG4gIENoYXJhY3Rlci5wcm9wZXJ0aWVzKHtcbiAgICBnYW1lOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGVmYXVsdHMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgb2Zmc2V0WDoge1xuICAgICAgZGVmYXVsdDogMC41XG4gICAgfSxcbiAgICBvZmZzZXRZOiB7XG4gICAgICBkZWZhdWx0OiAwLjVcbiAgICB9LFxuICAgIGRlZmF1bHRBY3Rpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhdmFpbGFibGVBY3Rpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgdGlsZTtcbiAgICAgICAgdGlsZSA9IGludmFsaWRhdG9yLnByb3AoXCJ0aWxlXCIpO1xuICAgICAgICBpZiAodGlsZSkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKFwicHJvdmlkZWRBY3Rpb25zXCIsIHRpbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENoYXJhY3RlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9DaGFyYWN0ZXIuanMubWFwXG4iLCJ2YXIgQXR0YWNrTW92ZUFjdGlvbiwgQ2hhcmFjdGVyQUksIERvb3IsIFByb3BlcnR5V2F0Y2hlciwgVGlsZUNvbnRhaW5lciwgVmlzaW9uQ2FsY3VsYXRvciwgV2Fsa0FjdGlvbjtcblxuVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyO1xuXG5WaXNpb25DYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9WaXNpb25DYWxjdWxhdG9yJyk7XG5cbkRvb3IgPSByZXF1aXJlKCcuL0Rvb3InKTtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9XYWxrQWN0aW9uJyk7XG5cbkF0dGFja01vdmVBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbicpO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuSW52YWxpZGF0ZWQuUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlckFJID0gY2xhc3MgQ2hhcmFjdGVyQUkge1xuICBjb25zdHJ1Y3RvcihjaGFyYWN0ZXIpIHtcbiAgICB0aGlzLmNoYXJhY3RlciA9IGNoYXJhY3RlcjtcbiAgICB0aGlzLm5leHRBY3Rpb25DYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLm5leHRBY3Rpb24oKTtcbiAgICB9O1xuICAgIHRoaXMudmlzaW9uTWVtb3J5ID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICB0aGlzLnRpbGVXYXRjaGVyID0gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVWaXNpb25NZW1vcnkoKTtcbiAgICAgIH0sXG4gICAgICBwcm9wZXJ0eTogdGhpcy5jaGFyYWN0ZXIuZ2V0UHJvcGVydHlJbnN0YW5jZSgndGlsZScpXG4gICAgfSk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLnRpbGVXYXRjaGVyLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aW9uKCk7XG4gIH1cblxuICBuZXh0QWN0aW9uKCkge1xuICAgIHZhciBlbm5lbXksIHVuZXhwbG9yZWQ7XG4gICAgdGhpcy51cGRhdGVWaXNpb25NZW1vcnkoKTtcbiAgICBpZiAoZW5uZW15ID0gdGhpcy5nZXRDbG9zZXN0RW5lbXkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYXR0YWNrTW92ZVRvKGVubmVteSkub24oJ2VuZCcsIG5leHRBY3Rpb25DYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh1bmV4cGxvcmVkID0gdGhpcy5nZXRDbG9zZXN0VW5leHBsb3JlZCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrVG8odW5leHBsb3JlZCkub24oJ2VuZCcsIG5leHRBY3Rpb25DYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzZXRWaXNpb25NZW1vcnkoKTtcbiAgICAgIHJldHVybiB0aGlzLndhbGtUbyh0aGlzLmdldENsb3Nlc3RVbmV4cGxvcmVkKCkpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZpc2lvbk1lbW9yeSgpIHtcbiAgICB2YXIgY2FsY3VsYXRvcjtcbiAgICBjYWxjdWxhdG9yID0gbmV3IFZpc2lvbkNhbGN1bGF0b3IodGhpcy5jaGFyYWN0ZXIudGlsZSk7XG4gICAgY2FsY3VsYXRvci5jYWxjdWwoKTtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkgPSBjYWxjdWxhdG9yLnRvQ29udGFpbmVyKCkubWVyZ2UodGhpcy52aXNpb25NZW1vcnksIChhLCBiKSA9PiB7XG4gICAgICBpZiAoYSAhPSBudWxsKSB7XG4gICAgICAgIGEgPSB0aGlzLmFuYWx5emVUaWxlKGEpO1xuICAgICAgfVxuICAgICAgaWYgKChhICE9IG51bGwpICYmIChiICE9IG51bGwpKSB7XG4gICAgICAgIGEudmlzaWJpbGl0eSA9IE1hdGgubWF4KGEudmlzaWJpbGl0eSwgYi52aXNpYmlsaXR5KTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYSB8fCBiO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYW5hbHl6ZVRpbGUodGlsZSkge1xuICAgIHZhciByZWY7XG4gICAgdGlsZS5lbm5lbXlTcG90dGVkID0gKHJlZiA9IHRpbGUuZ2V0RmluYWxUaWxlKCkuY2hpbGRyZW4pICE9IG51bGwgPyByZWYuZmluZCgoYykgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaXNFbm5lbXkoYyk7XG4gICAgfSkgOiB2b2lkIDA7XG4gICAgdGlsZS5leHBsb3JhYmxlID0gdGhpcy5pc0V4cGxvcmFibGUodGlsZSk7XG4gICAgcmV0dXJuIHRpbGU7XG4gIH1cblxuICBpc0VubmVteShlbGVtKSB7XG4gICAgdmFyIHJlZjtcbiAgICByZXR1cm4gKHJlZiA9IHRoaXMuY2hhcmFjdGVyLm93bmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5pc0VuZW15ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuaXNFbmVteShlbGVtKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgfVxuXG4gIGdldENsb3Nlc3RFbmVteSgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkuY2xvc2VzdCh0aGlzLmNoYXJhY3Rlci50aWxlLCAodCkgPT4ge1xuICAgICAgcmV0dXJuIHQuZW5uZW15U3BvdHRlZDtcbiAgICB9KTtcbiAgfVxuXG4gIGdldENsb3Nlc3RVbmV4cGxvcmVkKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2lvbk1lbW9yeS5jbG9zZXN0KHRoaXMuY2hhcmFjdGVyLnRpbGUsICh0KSA9PiB7XG4gICAgICByZXR1cm4gdC52aXNpYmlsaXR5IDwgMSAmJiB0LmV4cGxvcmFibGU7XG4gICAgfSk7XG4gIH1cblxuICBpc0V4cGxvcmFibGUodGlsZSkge1xuICAgIHZhciByZWY7XG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgcmV0dXJuIHRpbGUud2Fsa2FibGUgfHwgKChyZWYgPSB0aWxlLmNoaWxkcmVuKSAhPSBudWxsID8gcmVmLmZpbmQoKGMpID0+IHtcbiAgICAgIHJldHVybiBjIGluc3RhbmNlb2YgRG9vcjtcbiAgICB9KSA6IHZvaWQgMCk7XG4gIH1cblxuICBhdHRhY2tNb3ZlVG8odGlsZSkge1xuICAgIHZhciBhY3Rpb247XG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgYWN0aW9uID0gbmV3IEF0dGFja01vdmVBY3Rpb24oe1xuICAgICAgYWN0b3I6IHRoaXMuY2hhcmFjdGVyLFxuICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgfSk7XG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5leGVjdXRlKCk7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH1cbiAgfVxuXG4gIHdhbGtUbyh0aWxlKSB7XG4gICAgdmFyIGFjdGlvbjtcbiAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICBhY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICBhY3RvcjogdGhpcy5jaGFyYWN0ZXIsXG4gICAgICB0YXJnZXQ6IHRpbGVcbiAgICB9KTtcbiAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgYWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgIHJldHVybiBhY3Rpb247XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQ2hhcmFjdGVyQUkuanMubWFwXG4iLCJ2YXIgRGFtYWdlUHJvcGFnYXRpb24sIERpcmVjdGlvbiwgRWxlbWVudCwgTGluZU9mU2lnaHQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL0xpbmVPZlNpZ2h0Jyk7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gRGFtYWdlUHJvcGFnYXRpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIERhbWFnZVByb3BhZ2F0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZXRUaWxlQ29udGFpbmVyKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZS5jb250YWluZXI7XG4gICAgfVxuXG4gICAgYXBwbHkoKSB7XG4gICAgICB2YXIgZGFtYWdlLCBpLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuZ2V0RGFtYWdlZCgpO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRhbWFnZSA9IHJlZltpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGRhbWFnZS50YXJnZXQuZGFtYWdlKGRhbWFnZS5kYW1hZ2UpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGdldEluaXRpYWxUaWxlcygpIHtcbiAgICAgIHZhciBjdG47XG4gICAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKTtcbiAgICAgIHJldHVybiBjdG4uaW5SYW5nZSh0aGlzLnRpbGUsIHRoaXMucmFuZ2UpO1xuICAgIH1cblxuICAgIGdldEluaXRpYWxEYW1hZ2VzKCkge1xuICAgICAgdmFyIGRhbWFnZXMsIGRtZywgaSwgbGVuLCB0aWxlLCB0aWxlcztcbiAgICAgIGRhbWFnZXMgPSBbXTtcbiAgICAgIHRpbGVzID0gdGhpcy5nZXRJbml0aWFsVGlsZXMoKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHRpbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlc1tpXTtcbiAgICAgICAgaWYgKHRpbGUuZGFtYWdlYWJsZSAmJiAoZG1nID0gdGhpcy5pbml0aWFsRGFtYWdlKHRpbGUsIHRpbGVzLmxlbmd0aCkpKSB7XG4gICAgICAgICAgZGFtYWdlcy5wdXNoKGRtZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkYW1hZ2VzO1xuICAgIH1cblxuICAgIGdldERhbWFnZWQoKSB7XG4gICAgICB2YXIgYWRkZWQ7XG4gICAgICBpZiAodGhpcy5fZGFtYWdlZCA9PSBudWxsKSB7XG4gICAgICAgIGFkZGVkID0gbnVsbDtcbiAgICAgICAgd2hpbGUgKGFkZGVkID0gdGhpcy5zdGVwKGFkZGVkKSkge1xuICAgICAgICAgIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9kYW1hZ2VkO1xuICAgIH1cblxuICAgIHN0ZXAoYWRkZWQpIHtcbiAgICAgIGlmIChhZGRlZCAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmV4dGVuZGVkRGFtYWdlICE9IG51bGwpIHtcbiAgICAgICAgICBhZGRlZCA9IHRoaXMuZXh0ZW5kKGFkZGVkKTtcbiAgICAgICAgICB0aGlzLl9kYW1hZ2VkID0gYWRkZWQuY29uY2F0KHRoaXMuX2RhbWFnZWQpO1xuICAgICAgICAgIHJldHVybiBhZGRlZC5sZW5ndGggPiAwICYmIGFkZGVkO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZCA9IHRoaXMuZ2V0SW5pdGlhbERhbWFnZXMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbkRhbWFnZWQodGFyZ2V0LCBkYW1hZ2VkKSB7XG4gICAgICB2YXIgZGFtYWdlLCBpLCBpbmRleCwgbGVuO1xuICAgICAgZm9yIChpbmRleCA9IGkgPSAwLCBsZW4gPSBkYW1hZ2VkLmxlbmd0aDsgaSA8IGxlbjsgaW5kZXggPSArK2kpIHtcbiAgICAgICAgZGFtYWdlID0gZGFtYWdlZFtpbmRleF07XG4gICAgICAgIGlmIChkYW1hZ2UudGFyZ2V0ID09PSB0YXJnZXQpIHtcbiAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBleHRlbmQoZGFtYWdlZCkge1xuICAgICAgdmFyIGFkZGVkLCBjdG4sIGRhbWFnZSwgZGlyLCBkbWcsIGV4aXN0aW5nLCBpLCBqLCBrLCBsZW4sIGxlbjEsIGxlbjIsIGxvY2FsLCByZWYsIHRhcmdldCwgdGlsZTtcbiAgICAgIGN0biA9IHRoaXMuZ2V0VGlsZUNvbnRhaW5lcigpO1xuICAgICAgYWRkZWQgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGRhbWFnZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGFtYWdlID0gZGFtYWdlZFtpXTtcbiAgICAgICAgbG9jYWwgPSBbXTtcbiAgICAgICAgaWYgKGRhbWFnZS50YXJnZXQueCAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmID0gRGlyZWN0aW9uLmFkamFjZW50cztcbiAgICAgICAgICBmb3IgKGogPSAwLCBsZW4xID0gcmVmLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICAgICAgZGlyID0gcmVmW2pdO1xuICAgICAgICAgICAgdGlsZSA9IGN0bi5nZXRUaWxlKGRhbWFnZS50YXJnZXQueCArIGRpci54LCBkYW1hZ2UudGFyZ2V0LnkgKyBkaXIueSk7XG4gICAgICAgICAgICBpZiAoKHRpbGUgIT0gbnVsbCkgJiYgdGlsZS5kYW1hZ2VhYmxlICYmIHRoaXMuaW5EYW1hZ2VkKHRpbGUsIHRoaXMuX2RhbWFnZWQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICBsb2NhbC5wdXNoKHRpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGsgPSAwLCBsZW4yID0gbG9jYWwubGVuZ3RoOyBrIDwgbGVuMjsgaysrKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gbG9jYWxba107XG4gICAgICAgICAgaWYgKGRtZyA9IHRoaXMuZXh0ZW5kZWREYW1hZ2UodGFyZ2V0LCBkYW1hZ2UsIGxvY2FsLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIGlmICgoZXhpc3RpbmcgPSB0aGlzLmluRGFtYWdlZCh0YXJnZXQsIGFkZGVkKSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGFkZGVkLnB1c2goZG1nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFkZGVkW2V4aXN0aW5nXSA9IHRoaXMubWVyZ2VEYW1hZ2UoYWRkZWRbZXhpc3RpbmddLCBkbWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFkZGVkO1xuICAgIH1cblxuICAgIG1lcmdlRGFtYWdlKGQxLCBkMikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICAgIHBvd2VyOiBkMS5wb3dlciArIGQyLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGQxLmRhbWFnZSArIGQyLmRhbWFnZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcikge1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXQubW9kaWZ5RGFtYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRhcmdldC5tb2RpZnlEYW1hZ2UocG93ZXIsIHRoaXMudHlwZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIERhbWFnZVByb3BhZ2F0aW9uLnByb3BlcnRpZXMoe1xuICAgIHRpbGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgcmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICB9LFxuICAgIHR5cGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBEYW1hZ2VQcm9wYWdhdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuRGFtYWdlUHJvcGFnYXRpb24uTm9ybWFsID0gY2xhc3MgTm9ybWFsIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBpbml0aWFsRGFtYWdlKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgdGhpcy5wb3dlcik7XG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbn07XG5cbkRhbWFnZVByb3BhZ2F0aW9uLlRoZXJtaWMgPSBjbGFzcyBUaGVybWljIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBleHRlbmRlZERhbWFnZSh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXI7XG4gICAgcG93ZXIgPSAobGFzdC5kYW1hZ2UgLSAxKSAvIDIgLyBuYiAqIE1hdGgubWluKDEsIGxhc3QudGFyZ2V0LmhlYWx0aCAvIGxhc3QudGFyZ2V0Lm1heEhlYWx0aCAqIDUpO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsRGFtYWdlKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlcjtcbiAgICBwb3dlciA9IHRoaXMucG93ZXIgLyBuYjtcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbn07XG5cbkRhbWFnZVByb3BhZ2F0aW9uLktpbmV0aWMgPSBjbGFzcyBLaW5ldGljIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBleHRlbmRlZERhbWFnZSh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXI7XG4gICAgcG93ZXIgPSAobGFzdC5wb3dlciAtIGxhc3QuZGFtYWdlKSAqIE1hdGgubWluKDEsIGxhc3QudGFyZ2V0LmhlYWx0aCAvIGxhc3QudGFyZ2V0Lm1heEhlYWx0aCAqIDIpIC0gMTtcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW5pdGlhbERhbWFnZSh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZztcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHRoaXMucG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIG1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKSB7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQubW9kaWZ5RGFtYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih0YXJnZXQubW9kaWZ5RGFtYWdlKHBvd2VyLCB0aGlzLnR5cGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIgKiAwLjI1KTtcbiAgICB9XG4gIH1cblxuICBtZXJnZURhbWFnZShkMSwgZDIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICBwb3dlcjogTWF0aC5mbG9vcigoZDEucG93ZXIgKyBkMi5wb3dlcikgLyAyKSxcbiAgICAgIGRhbWFnZTogTWF0aC5mbG9vcigoZDEuZGFtYWdlICsgZDIuZGFtYWdlKSAvIDIpXG4gICAgfTtcbiAgfVxuXG59O1xuXG5EYW1hZ2VQcm9wYWdhdGlvbi5FeHBsb3NpdmUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEV4cGxvc2l2ZSBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgICBnZXREYW1hZ2VkKCkge1xuICAgICAgdmFyIGFuZ2xlLCBpLCBpbnNpZGUsIHJlZiwgc2hhcmQsIHNoYXJkUG93ZXIsIHNoYXJkcywgdGFyZ2V0O1xuICAgICAgdGhpcy5fZGFtYWdlZCA9IFtdO1xuICAgICAgc2hhcmRzID0gTWF0aC5wb3codGhpcy5yYW5nZSArIDEsIDIpO1xuICAgICAgc2hhcmRQb3dlciA9IHRoaXMucG93ZXIgLyBzaGFyZHM7XG4gICAgICBpbnNpZGUgPSB0aGlzLnRpbGUuaGVhbHRoIDw9IHRoaXMubW9kaWZ5RGFtYWdlKHRoaXMudGlsZSwgc2hhcmRQb3dlcik7XG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHNoYXJkUG93ZXIgKj0gNDtcbiAgICAgIH1cbiAgICAgIGZvciAoc2hhcmQgPSBpID0gMCwgcmVmID0gc2hhcmRzOyAoMCA8PSByZWYgPyBpIDw9IHJlZiA6IGkgPj0gcmVmKTsgc2hhcmQgPSAwIDw9IHJlZiA/ICsraSA6IC0taSkge1xuICAgICAgICBhbmdsZSA9IHRoaXMucm5nKCkgKiBNYXRoLlBJICogMjtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUaWxlSGl0QnlTaGFyZChpbnNpZGUsIGFuZ2xlKTtcbiAgICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZGFtYWdlZC5wdXNoKHtcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgcG93ZXI6IHNoYXJkUG93ZXIsXG4gICAgICAgICAgICBkYW1hZ2U6IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgc2hhcmRQb3dlcilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2RhbWFnZWQ7XG4gICAgfVxuXG4gICAgZ2V0VGlsZUhpdEJ5U2hhcmQoaW5zaWRlLCBhbmdsZSkge1xuICAgICAgdmFyIGN0biwgZGlzdCwgdGFyZ2V0LCB2ZXJ0ZXg7XG4gICAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKTtcbiAgICAgIGRpc3QgPSB0aGlzLnJhbmdlICogdGhpcy5ybmcoKTtcbiAgICAgIHRhcmdldCA9IHtcbiAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUgKyBkaXN0ICogTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNSArIGRpc3QgKiBNYXRoLnNpbihhbmdsZSlcbiAgICAgIH07XG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHZlcnRleCA9IG5ldyBMaW5lT2ZTaWdodChjdG4sIHRoaXMudGlsZS54ICsgMC41LCB0aGlzLnRpbGUueSArIDAuNSwgdGFyZ2V0LngsIHRhcmdldC55KTtcbiAgICAgICAgdmVydGV4LnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSAodGlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiAhaW5zaWRlIHx8ICgodGlsZSAhPSBudWxsKSAmJiB0aGlzLnRyYXZlcnNhYmxlQ2FsbGJhY2sodGlsZSkpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdmVydGV4LmdldEVuZFBvaW50KCkudGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjdG4uZ2V0VGlsZShNYXRoLmZsb29yKHRhcmdldC54KSwgTWF0aC5mbG9vcih0YXJnZXQueSkpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEV4cGxvc2l2ZS5wcm9wZXJ0aWVzKHtcbiAgICBybmc6IHtcbiAgICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gICAgfSxcbiAgICB0cmF2ZXJzYWJsZUNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgIHJldHVybiAhKHR5cGVvZiB0aWxlLmdldFNvbGlkID09PSAnZnVuY3Rpb24nICYmIHRpbGUuZ2V0U29saWQoKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRXhwbG9zaXZlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0RhbWFnZVByb3BhZ2F0aW9uLmpzLm1hcFxuIiwidmFyIERhbWFnZWFibGUsIEVsZW1lbnQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBEYW1hZ2VhYmxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBEYW1hZ2VhYmxlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgZGFtYWdlKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuaGVhbHRoID0gTWF0aC5tYXgoMCwgdGhpcy5oZWFsdGggLSB2YWwpO1xuICAgIH1cblxuICAgIHdoZW5Ob0hlYWx0aCgpIHt9XG5cbiAgfTtcblxuICBEYW1hZ2VhYmxlLnByb3BlcnRpZXMoe1xuICAgIGRhbWFnZWFibGU6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIG1heEhlYWx0aDoge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgaGVhbHRoOiB7XG4gICAgICBkZWZhdWx0OiAxMDAwLFxuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53aGVuTm9IZWFsdGgoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIERhbWFnZWFibGU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRGFtYWdlYWJsZS5qcy5tYXBcbiIsInZhciBEb29yLCBUaWxlZDtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gRG9vciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRG9vciBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihkaXJlY3Rpb24gPSBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIH1cblxuICAgIHVwZGF0ZVRpbGVNZW1iZXJzKG9sZCkge1xuICAgICAgdmFyIHJlZiwgcmVmMSwgcmVmMiwgcmVmMztcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYucmVtb3ZlUmVmKCdvcGVuJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYxID0gb2xkLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZjEucmVtb3ZlUmVmKCdvcGVuJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnRpbGUpIHtcbiAgICAgICAgaWYgKChyZWYyID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZjIuYWRkUHJvcGVydHlSZWYoJ29wZW4nLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHJlZjMgPSB0aGlzLnRpbGUudHJhbnNwYXJlbnRNZW1iZXJzKSAhPSBudWxsID8gcmVmMy5hZGRQcm9wZXJ0eVJlZignb3BlbicsIHRoaXMpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIERvb3IucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVGlsZU1lbWJlcnMob2xkKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9wZW46IHtcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBkaXJlY3Rpb246IHt9XG4gIH0pO1xuXG4gIERvb3IuZGlyZWN0aW9ucyA9IHtcbiAgICBob3Jpem9udGFsOiAnaG9yaXpvbnRhbCcsXG4gICAgdmVydGljYWw6ICd2ZXJ0aWNhbCdcbiAgfTtcblxuICByZXR1cm4gRG9vcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Eb29yLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbGVtZW50LmpzLm1hcFxuIiwidmFyIEZsb29yLCBUaWxlO1xuXG5UaWxlID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGU7XG5cbm1vZHVsZS5leHBvcnRzID0gRmxvb3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEZsb29yIGV4dGVuZHMgVGlsZSB7fTtcblxuICBGbG9vci5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrYWJsZToge1xuICAgICAgY29tcG9zZWQ6IHRydWVcbiAgICB9LFxuICAgIHRyYW5zcGFyZW50OiB7XG4gICAgICBjb21wb3NlZDogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEZsb29yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0Zsb29yLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIEdhbWUsIFBsYXllciwgVGltaW5nLCBWaWV3O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cblZpZXcgPSByZXF1aXJlKCcuL1ZpZXcnKTtcblxuUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHYW1lIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgc3RhcnQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50UGxheWVyO1xuICAgIH1cblxuICAgIGFkZChlbGVtKSB7XG4gICAgICBlbGVtLmdhbWUgPSB0aGlzO1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgfVxuXG4gIH07XG5cbiAgR2FtZS5wcm9wZXJ0aWVzKHtcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtYWluVmlldzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudmlld3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdzLmdldCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGQobmV3IHRoaXMuZGVmYXVsdFZpZXdDbGFzcygpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdmlld3M6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9LFxuICAgIGN1cnJlbnRQbGF5ZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnBsYXllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBsYXllcnMuZ2V0KDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkZChuZXcgdGhpcy5kZWZhdWx0UGxheWVyQ2xhc3MoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBsYXllcnM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIEdhbWUucHJvdG90eXBlLmRlZmF1bHRWaWV3Q2xhc3MgPSBWaWV3O1xuXG4gIEdhbWUucHJvdG90eXBlLmRlZmF1bHRQbGF5ZXJDbGFzcyA9IFBsYXllcjtcblxuICByZXR1cm4gR2FtZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9HYW1lLmpzLm1hcFxuIiwidmFyIExpbmVPZlNpZ2h0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVPZlNpZ2h0ID0gY2xhc3MgTGluZU9mU2lnaHQge1xuICBjb25zdHJ1Y3Rvcih0aWxlcywgeDEgPSAwLCB5MSA9IDAsIHgyID0gMCwgeTIgPSAwKSB7XG4gICAgdGhpcy50aWxlcyA9IHRpbGVzO1xuICAgIHRoaXMueDEgPSB4MTtcbiAgICB0aGlzLnkxID0geTE7XG4gICAgdGhpcy54MiA9IHgyO1xuICAgIHRoaXMueTIgPSB5MjtcbiAgfVxuXG4gIHNldFgxKHZhbCkge1xuICAgIHRoaXMueDEgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgc2V0WTEodmFsKSB7XG4gICAgdGhpcy55MSA9IHZhbDtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKCk7XG4gIH1cblxuICBzZXRYMih2YWwpIHtcbiAgICB0aGlzLngyID0gdmFsO1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKTtcbiAgfVxuXG4gIHNldFkyKHZhbCkge1xuICAgIHRoaXMueTIgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgaW52YWxpZGFkZSgpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0gbnVsbDtcbiAgICB0aGlzLnN1Y2Nlc3MgPSBudWxsO1xuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHRlc3RUaWxlKHRpbGUsIGVudHJ5WCwgZW50cnlZKSB7XG4gICAgaWYgKHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUsIGVudHJ5WCwgZW50cnlZKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwpICYmICh0eXBlb2YgdGlsZS5nZXRUcmFuc3BhcmVudCA9PT0gJ2Z1bmN0aW9uJyA/IHRpbGUuZ2V0VHJhbnNwYXJlbnQoKSA6IHR5cGVvZiB0aWxlLnRyYW5zcGFyZW50ICE9PSB2b2lkIDAgPyB0aWxlLnRyYW5zcGFyZW50IDogdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgdGVzdFRpbGVBdCh4LCB5LCBlbnRyeVgsIGVudHJ5WSkge1xuICAgIHJldHVybiB0aGlzLnRlc3RUaWxlKHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHgpLCBNYXRoLmZsb29yKHkpKSwgZW50cnlYLCBlbnRyeVkpO1xuICB9XG5cbiAgcmV2ZXJzZVRyYWNpbmcoKSB7XG4gICAgdmFyIHRtcFgsIHRtcFk7XG4gICAgdG1wWCA9IHRoaXMueDE7XG4gICAgdG1wWSA9IHRoaXMueTE7XG4gICAgdGhpcy54MSA9IHRoaXMueDI7XG4gICAgdGhpcy55MSA9IHRoaXMueTI7XG4gICAgdGhpcy54MiA9IHRtcFg7XG4gICAgdGhpcy55MiA9IHRtcFk7XG4gICAgcmV0dXJuIHRoaXMucmV2ZXJzZWQgPSAhdGhpcy5yZXZlcnNlZDtcbiAgfVxuXG4gIGNhbGN1bCgpIHtcbiAgICB2YXIgbmV4dFgsIG5leHRZLCBwb3NpdGl2ZVgsIHBvc2l0aXZlWSwgcmF0aW8sIHRpbGVYLCB0aWxlWSwgdG90YWwsIHgsIHk7XG4gICAgcmF0aW8gPSAodGhpcy54MiAtIHRoaXMueDEpIC8gKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICB0b3RhbCA9IE1hdGguYWJzKHRoaXMueDIgLSB0aGlzLngxKSArIE1hdGguYWJzKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICBwb3NpdGl2ZVggPSAodGhpcy54MiAtIHRoaXMueDEpID49IDA7XG4gICAgcG9zaXRpdmVZID0gKHRoaXMueTIgLSB0aGlzLnkxKSA+PSAwO1xuICAgIHRpbGVYID0geCA9IHRoaXMueDE7XG4gICAgdGlsZVkgPSB5ID0gdGhpcy55MTtcbiAgICBpZiAodGhpcy5yZXZlcnNlZCkge1xuICAgICAgdGlsZVggPSBwb3NpdGl2ZVggPyB4IDogTWF0aC5jZWlsKHgpIC0gMTtcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDE7XG4gICAgfVxuICAgIHdoaWxlICh0b3RhbCA+IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSAmJiB0aGlzLnRlc3RUaWxlQXQodGlsZVgsIHRpbGVZLCB4LCB5KSkge1xuICAgICAgbmV4dFggPSBwb3NpdGl2ZVggPyBNYXRoLmZsb29yKHgpICsgMSA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICBuZXh0WSA9IHBvc2l0aXZlWSA/IE1hdGguZmxvb3IoeSkgKyAxIDogTWF0aC5jZWlsKHkpIC0gMTtcbiAgICAgIGlmICh0aGlzLngyIC0gdGhpcy54MSA9PT0gMCkge1xuICAgICAgICB5ID0gbmV4dFk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMueTIgLSB0aGlzLnkxID09PSAwKSB7XG4gICAgICAgIHggPSBuZXh0WDtcbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoKG5leHRYIC0geCkgLyAodGhpcy54MiAtIHRoaXMueDEpKSA8IE1hdGguYWJzKChuZXh0WSAtIHkpIC8gKHRoaXMueTIgLSB0aGlzLnkxKSkpIHtcbiAgICAgICAgeCA9IG5leHRYO1xuICAgICAgICB5ID0gKG5leHRYIC0gdGhpcy54MSkgLyByYXRpbyArIHRoaXMueTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4ID0gKG5leHRZIC0gdGhpcy55MSkgKiByYXRpbyArIHRoaXMueDE7XG4gICAgICAgIHkgPSBuZXh0WTtcbiAgICAgIH1cbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICB0aWxlWSA9IHBvc2l0aXZlWSA/IHkgOiBNYXRoLmNlaWwoeSkgLSAxO1xuICAgIH1cbiAgICBpZiAodG90YWwgPD0gTWF0aC5hYnMoeCAtIHRoaXMueDEpICsgTWF0aC5hYnMoeSAtIHRoaXMueTEpKSB7XG4gICAgICB0aGlzLmVuZFBvaW50ID0ge1xuICAgICAgICB4OiB0aGlzLngyLFxuICAgICAgICB5OiB0aGlzLnkyLFxuICAgICAgICB0aWxlOiB0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih0aGlzLngyKSwgTWF0aC5mbG9vcih0aGlzLnkyKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGlsZVgpLCBNYXRoLmZsb29yKHRpbGVZKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yY2VTdWNjZXNzKCkge1xuICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICB4OiB0aGlzLngyLFxuICAgICAgeTogdGhpcy55MixcbiAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRoaXMueDIpLCBNYXRoLmZsb29yKHRoaXMueTIpKVxuICAgIH07XG4gICAgdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGdldFN1Y2Nlc3MoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3M7XG4gIH1cblxuICBnZXRFbmRQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5jYWxjdWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5kUG9pbnQ7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9MaW5lT2ZTaWdodC5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBNYXA7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXAgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE1hcCBleHRlbmRzIEVsZW1lbnQge307XG5cbiAgTWFwLnByb3BlcnRpZXMoe1xuICAgIGxvY2F0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjoge1xuICAgICAgICBjbG9zZXN0OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgdmFyIG1pbiwgbWluRGlzdDtcbiAgICAgICAgICBtaW4gPSBudWxsO1xuICAgICAgICAgIG1pbkRpc3QgPSBudWxsO1xuICAgICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgICAgICAgICAgdmFyIGRpc3Q7XG4gICAgICAgICAgICBkaXN0ID0gbG9jYXRpb24uZGlzdCh4LCB5KTtcbiAgICAgICAgICAgIGlmICgobWluID09IG51bGwpIHx8IG1pbkRpc3QgPiBkaXN0KSB7XG4gICAgICAgICAgICAgIG1pbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICByZXR1cm4gbWluRGlzdCA9IGRpc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG1pbjtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2VzdHM6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICB2YXIgZGlzdHM7XG4gICAgICAgICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZGlzdDogbG9jYXRpb24uZGlzdCh4LCB5KSxcbiAgICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRpc3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdCAtIGIuZGlzdDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5KGRpc3RzLm1hcChmdW5jdGlvbihkaXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzdC5sb2NhdGlvbjtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBNYXA7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvTWFwLmpzLm1hcFxuIiwidmFyIE9ic3RhY2xlLCBUaWxlZDtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JzdGFjbGUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE9ic3RhY2xlIGV4dGVuZHMgVGlsZWQge1xuICAgIHVwZGF0ZVdhbGthYmxlcyhvbGQpIHtcbiAgICAgIHZhciByZWYsIHJlZjE7XG4gICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgaWYgKChyZWYgPSBvbGQud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmLnJlbW92ZVJlZignd2Fsa2FibGUnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICByZXR1cm4gKHJlZjEgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsID8gcmVmMS5zZXRWYWx1ZVJlZihmYWxzZSwgJ3dhbGthYmxlJywgdGhpcykgOiB2b2lkIDA7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT2JzdGFjbGUucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQsIG92ZXJyaWRlZCkge1xuICAgICAgICBvdmVycmlkZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlV2Fsa2FibGVzKG9sZCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gT2JzdGFjbGU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvT2JzdGFjbGUuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgRXZlbnRFbWl0dGVyLCBQYXRoV2FsaywgVGltaW5nO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUGF0aFdhbGsgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBhdGhXYWxrIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iod2Fsa2VyLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy53YWxrZXIgPSB3YWxrZXI7XG4gICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgaWYgKCF0aGlzLnBhdGguc29sdXRpb24pIHtcbiAgICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGF0aC5zb2x1dGlvbikge1xuICAgICAgICB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKCk7XG4gICAgICAgIH0sIHRoaXMudG90YWxUaW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aFRpbWVvdXQudXBkYXRlci5hZGRDYWxsYmFjayh0aGlzLmNhbGxiYWNrKCd1cGRhdGUnKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0LnBhdXNlKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgdmFyIHBvcztcbiAgICAgIHBvcyA9IHRoaXMucGF0aC5nZXRQb3NBdFByYyh0aGlzLnBhdGhUaW1lb3V0LmdldFByYygpKTtcbiAgICAgIHRoaXMud2Fsa2VyLnRpbGUgPSBwb3MudGlsZTtcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFggPSBwb3Mub2Zmc2V0WDtcbiAgICAgIHJldHVybiB0aGlzLndhbGtlci5vZmZzZXRZID0gcG9zLm9mZnNldFk7XG4gICAgfVxuXG4gICAgZmluaXNoKCkge1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIHRoaXMudHJpZ2dlcignZmluaXNoZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGludGVycnVwdCgpIHtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2ludGVycnVwdGVkJyk7XG4gICAgICByZXR1cm4gdGhpcy5lbmQoKTtcbiAgICB9XG5cbiAgICBlbmQoKSB7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2VuZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy53YWxrZXIud2FsayA9PT0gdGhpcykge1xuICAgICAgICB0aGlzLndhbGtlci53YWxrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMucGF0aFRpbWVvdXQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5kZXN0cm95UHJvcGVydGllcygpO1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aFdhbGsuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBQYXRoV2Fsay5wcm9wZXJ0aWVzKHtcbiAgICBzcGVlZDoge1xuICAgICAgZGVmYXVsdDogNVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcGF0aExlbmd0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aC5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG90YWxUaW1lOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoTGVuZ3RoIC8gdGhpcy5zcGVlZCAqIDEwMDA7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUGF0aFdhbGs7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUGF0aFdhbGsuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTGluZU9mU2lnaHQsIFBlcnNvbmFsV2VhcG9uLCBUaW1pbmc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL0xpbmVPZlNpZ2h0Jyk7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uYWxXZWFwb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBlcnNvbmFsV2VhcG9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBjYW5CZVVzZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VkO1xuICAgIH1cblxuICAgIGNhblVzZU9uKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FuVXNlRnJvbSh0aGlzLnVzZXIudGlsZSwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBjYW5Vc2VGcm9tKHRpbGUsIHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMucmFuZ2UgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pblJhbmdlKHRpbGUsIHRhcmdldCkgJiYgdGhpcy5oYXNMaW5lT2ZTaWdodCh0aWxlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluUmFuZ2UodGlsZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmLCB0YXJnZXRUaWxlO1xuICAgICAgdGFyZ2V0VGlsZSA9IHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgIHJldHVybiAoKHJlZiA9IHRpbGUuZGlzdCh0YXJnZXRUaWxlKSkgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApIDw9IHRoaXMucmFuZ2U7XG4gICAgfVxuXG4gICAgaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIHRhcmdldFRpbGU7XG4gICAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0O1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHRhcmdldFRpbGUueCAtIHRpbGUueCkgKyBNYXRoLmFicyh0YXJnZXRUaWxlLnkgLSB0aWxlLnkpID09PSAxO1xuICAgIH1cblxuICAgIGhhc0xpbmVPZlNpZ2h0KHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIGxvcywgdGFyZ2V0VGlsZTtcbiAgICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXQ7XG4gICAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGFyZ2V0VGlsZS5jb250YWluZXIsIHRpbGUueCArIDAuNSwgdGlsZS55ICsgMC41LCB0YXJnZXRUaWxlLnggKyAwLjUsIHRhcmdldFRpbGUueSArIDAuNSk7XG4gICAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHRpbGUud2Fsa2FibGU7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGxvcy5nZXRTdWNjZXNzKCk7XG4gICAgfVxuXG4gICAgdXNlT24odGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5jYW5CZVVzZWQoKSkge1xuICAgICAgICB0YXJnZXQuZGFtYWdlKHRoaXMucG93ZXIpO1xuICAgICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWNoYXJnZSgpIHtcbiAgICAgIHRoaXMuY2hhcmdpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJnaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlZCgpO1xuICAgICAgfSwgdGhpcy5yZWNoYXJnZVRpbWUpO1xuICAgIH1cblxuICAgIHJlY2hhcmdlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJnZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy5jaGFyZ2VUaW1lb3V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJnZVRpbWVvdXQuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFBlcnNvbmFsV2VhcG9uLnByb3BlcnRpZXMoe1xuICAgIHJlY2hhcmdlVGltZToge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgY2hhcmdlZDoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY2hhcmdpbmc6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgZHBzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdwb3dlcicpIC8gaW52YWxpZGF0b3IucHJvcCgncmVjaGFyZ2VUaW1lJykgKiAxMDAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICB1c2VyOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUGVyc29uYWxXZWFwb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUGVyc29uYWxXZWFwb24uanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgRXZlbnRFbWl0dGVyLCBQbGF5ZXI7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBsYXllciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgZmlyc3Q7XG4gICAgICBmaXJzdCA9IHRoaXMuZ2FtZS5wbGF5ZXJzLmxlbmd0aCA9PT0gMDtcbiAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJzLmFkZCh0aGlzKTtcbiAgICAgIGlmIChmaXJzdCAmJiAhdGhpcy5jb250cm9sbGVyICYmIHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgdGhpcy5nYW1lLmRlZmF1bHRQbGF5ZXJDb250cm9sbGVyQ2xhc3MoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5UYXJnZXRBY3Rpb25PbihlbGVtKSB7XG4gICAgICB2YXIgYWN0aW9uLCByZWY7XG4gICAgICBhY3Rpb24gPSB0aGlzLnNlbGVjdGVkQWN0aW9uIHx8ICgocmVmID0gdGhpcy5zZWxlY3RlZCkgIT0gbnVsbCA/IHJlZi5kZWZhdWx0QWN0aW9uIDogdm9pZCAwKTtcbiAgICAgIHJldHVybiAoYWN0aW9uICE9IG51bGwpICYmIHR5cGVvZiBhY3Rpb24uY2FuVGFyZ2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgYWN0aW9uLmNhblRhcmdldChlbGVtKTtcbiAgICB9XG5cbiAgICBjYW5TZWxlY3QoZWxlbSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBlbGVtLmlzU2VsZWN0YWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIgJiYgZWxlbS5pc1NlbGVjdGFibGVCeSh0aGlzKTtcbiAgICB9XG5cbiAgICBjYW5Gb2N1c09uKGVsZW0pIHtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5Jc0ZvY3VzYWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uSXNGb2N1c2FibGVCeSh0aGlzKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0uSXNTZWxlY3RhYmxlQnkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gZWxlbS5Jc1NlbGVjdGFibGVCeSh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRBY3Rpb25UYXJnZXQoZWxlbSkge1xuICAgICAgdmFyIGFjdGlvbiwgcmVmO1xuICAgICAgYWN0aW9uID0gdGhpcy5zZWxlY3RlZEFjdGlvbiB8fCAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYuZGVmYXVsdEFjdGlvbiA6IHZvaWQgMCk7XG4gICAgICBhY3Rpb24gPSBhY3Rpb24ud2l0aFRhcmdldChlbGVtKTtcbiAgICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICAgIGFjdGlvbi5zdGFydCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFjdGlvbiA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBQbGF5ZXIuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBQbGF5ZXIucHJvcGVydGllcyh7XG4gICAgbmFtZToge1xuICAgICAgZGVmYXVsdDogJ1BsYXllcidcbiAgICB9LFxuICAgIGZvY3VzZWQ6IHt9LFxuICAgIHNlbGVjdGVkOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICBpZiAob2xkICE9IG51bGwgPyBvbGQuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICBvbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNlbGVjdGVkQWN0aW9uOiB7fSxcbiAgICBjb250cm9sbGVyOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sbGVyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29udHJvbGxlci5wbGF5ZXIgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBnYW1lOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGVmYXVsdHMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFBsYXllcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9QbGF5ZXIuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgUHJvamVjdGlsZSwgVGltaW5nO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdGlsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUHJvamVjdGlsZSBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIGxhdW5jaCgpIHtcbiAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVsaXZlclBheWxvYWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICB9LCB0aGlzLnBhdGhMZW5ndGggLyB0aGlzLnNwZWVkICogMTAwMCk7XG4gICAgfVxuXG4gICAgZGVsaXZlclBheWxvYWQoKSB7XG4gICAgICB2YXIgcGF5bG9hZDtcbiAgICAgIHBheWxvYWQgPSBuZXcgdGhpcy5wcm9wYWdhdGlvblR5cGUoe1xuICAgICAgICB0aWxlOiB0aGlzLnRhcmdldC50aWxlIHx8IHRoaXMudGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgcmFuZ2U6IHRoaXMuYmxhc3RSYW5nZVxuICAgICAgfSk7XG4gICAgICBwYXlsb2FkLmFwcGx5KCk7XG4gICAgICB0aGlzLnBheWxvYWREZWxpdmVyZWQoKTtcbiAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH1cblxuICAgIHBheWxvYWREZWxpdmVyZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgUHJvamVjdGlsZS5wcm9wZXJ0aWVzKHtcbiAgICBvcmlnaW46IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcG93ZXI6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICBibGFzdFJhbmdlOiB7XG4gICAgICBkZWZhdWx0OiAxXG4gICAgfSxcbiAgICBwcm9wYWdhdGlvblR5cGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHNwZWVkOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgcGF0aExlbmd0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpc3Q7XG4gICAgICAgIGlmICgodGhpcy5vcmlnaW5UaWxlICE9IG51bGwpICYmICh0aGlzLnRhcmdldFRpbGUgIT0gbnVsbCkpIHtcbiAgICAgICAgICBkaXN0ID0gdGhpcy5vcmlnaW5UaWxlLmRpc3QodGhpcy50YXJnZXRUaWxlKTtcbiAgICAgICAgICBpZiAoZGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc3QubGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3JpZ2luVGlsZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgb3JpZ2luO1xuICAgICAgICBvcmlnaW4gPSBpbnZhbGlkYXRvci5wcm9wKCdvcmlnaW4nKTtcbiAgICAgICAgaWYgKG9yaWdpbiAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbi50aWxlIHx8IG9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGFyZ2V0VGlsZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgdGFyZ2V0O1xuICAgICAgICB0YXJnZXQgPSBpbnZhbGlkYXRvci5wcm9wKCd0YXJnZXQnKTtcbiAgICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIG9yaWdpblRpbGUsIHRhcmdldFRpbGU7XG4gICAgICAgIG9yaWdpblRpbGUgPSBpbnZhbGlkYXRlLnByb3AoJ29yaWdpblRpbGUnKTtcbiAgICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCgndGFyZ2V0VGlsZScpO1xuICAgICAgICBpZiAob3JpZ2luVGlsZS5jb250YWluZXIgPT09IHRhcmdldFRpbGUuY29udGFpbmVyKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpblRpbGUuY29udGFpbmVyO1xuICAgICAgICB9IGVsc2UgaWYgKGludmFsaWRhdGUucHJvcCgncHJjUGF0aCcpID4gMC41KSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFRpbGUuY29udGFpbmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5UaWxlLmNvbnRhaW5lcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBzdGFydFBvcztcbiAgICAgICAgc3RhcnRQb3MgPSBpbnZhbGlkYXRlLnByb3AoJ3N0YXJ0UG9zJyk7XG4gICAgICAgIHJldHVybiAoaW52YWxpZGF0ZS5wcm9wKCd0YXJnZXRQb3MnKS54IC0gc3RhcnRQb3MueCkgKiBpbnZhbGlkYXRlLnByb3AoJ3ByY1BhdGgnKSArIHN0YXJ0UG9zLng7XG4gICAgICB9XG4gICAgfSxcbiAgICB5OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIHN0YXJ0UG9zO1xuICAgICAgICBzdGFydFBvcyA9IGludmFsaWRhdGUucHJvcCgnc3RhcnRQb3MnKTtcbiAgICAgICAgcmV0dXJuIChpbnZhbGlkYXRlLnByb3AoJ3RhcmdldFBvcycpLnkgLSBzdGFydFBvcy55KSAqIGludmFsaWRhdGUucHJvcCgncHJjUGF0aCcpICsgc3RhcnRQb3MueTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0UG9zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciwgZGlzdCwgb2Zmc2V0LCBvcmlnaW5UaWxlO1xuICAgICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKCdvcmlnaW5UaWxlJyk7XG4gICAgICAgIGNvbnRhaW5lciA9IGludmFsaWRhdGUucHJvcCgnY29udGFpbmVyJyk7XG4gICAgICAgIG9mZnNldCA9IHRoaXMuc3RhcnRPZmZzZXQ7XG4gICAgICAgIGlmIChvcmlnaW5UaWxlLmNvbnRhaW5lciAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgZGlzdCA9IGNvbnRhaW5lci5kaXN0KG9yaWdpblRpbGUuY29udGFpbmVyKTtcbiAgICAgICAgICBvZmZzZXQueCArPSBkaXN0Lng7XG4gICAgICAgICAgb2Zmc2V0LnkgKz0gZGlzdC55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogb3JpZ2luVGlsZS54ICsgb2Zmc2V0LngsXG4gICAgICAgICAgeTogb3JpZ2luVGlsZS55ICsgb2Zmc2V0LnlcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldFBvczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBjb250YWluZXIsIGRpc3QsIG9mZnNldCwgdGFyZ2V0VGlsZTtcbiAgICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCgndGFyZ2V0VGlsZScpO1xuICAgICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AoJ2NvbnRhaW5lcicpO1xuICAgICAgICBvZmZzZXQgPSB0aGlzLnRhcmdldE9mZnNldDtcbiAgICAgICAgaWYgKHRhcmdldFRpbGUuY29udGFpbmVyICE9PSBjb250YWluZXIpIHtcbiAgICAgICAgICBkaXN0ID0gY29udGFpbmVyLmRpc3QodGFyZ2V0VGlsZS5jb250YWluZXIpO1xuICAgICAgICAgIG9mZnNldC54ICs9IGRpc3QueDtcbiAgICAgICAgICBvZmZzZXQueSArPSBkaXN0Lnk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiB0YXJnZXRUaWxlLnggKyBvZmZzZXQueCxcbiAgICAgICAgICB5OiB0YXJnZXRUaWxlLnkgKyBvZmZzZXQueVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRPZmZzZXQ6IHtcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgeDogMC41LFxuICAgICAgICB5OiAwLjVcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldE9mZnNldDoge1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB4OiAwLjUsXG4gICAgICAgIHk6IDAuNVxuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcHJjUGF0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgcmV0dXJuICgocmVmID0gdGhpcy5wYXRoVGltZW91dCkgIT0gbnVsbCA/IHJlZi5nZXRQcmMoKSA6IHZvaWQgMCkgfHwgMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmluZzoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBQcm9qZWN0aWxlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb2plY3RpbGUuanMubWFwXG4iLCJ2YXIgRGlyZWN0aW9uLCBEb29yLCBFbGVtZW50LCBSb29tR2VuZXJhdG9yLCBUaWxlLCBUaWxlQ29udGFpbmVyLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5UaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXI7XG5cblRpbGUgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZTtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvbjtcblxuRG9vciA9IHJlcXVpcmUoJy4vRG9vcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb21HZW5lcmF0b3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFJvb21HZW5lcmF0b3IgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGluaXRUaWxlcygpIHtcbiAgICAgIHRoaXMuZmluYWxUaWxlcyA9IG51bGw7XG4gICAgICB0aGlzLnJvb21zID0gW107XG4gICAgICByZXR1cm4gdGhpcy5mcmVlID0gdGhpcy50aWxlQ29udGFpbmVyLmFsbFRpbGVzKCkuZmlsdGVyKCh0aWxlKSA9PiB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24sIGssIGxlbiwgbmV4dCwgcmVmO1xuICAgICAgICByZWYgPSBEaXJlY3Rpb24uYWxsO1xuICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICBkaXJlY3Rpb24gPSByZWZba107XG4gICAgICAgICAgbmV4dCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSk7XG4gICAgICAgICAgaWYgKG5leHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbGN1bCgpIHtcbiAgICAgIHZhciBpO1xuICAgICAgdGhpcy5pbml0VGlsZXMoKTtcbiAgICAgIGkgPSAwO1xuICAgICAgd2hpbGUgKHRoaXMuc3RlcCgpIHx8IHRoaXMubmV3Um9vbSgpKSB7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JlYXRlRG9vcnMoKTtcbiAgICAgIHRoaXMucm9vbXM7XG4gICAgICByZXR1cm4gdGhpcy5tYWtlRmluYWxUaWxlcygpO1xuICAgIH1cblxuICAgIG1ha2VGaW5hbFRpbGVzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmluYWxUaWxlcyA9IHRoaXMudGlsZUNvbnRhaW5lci5hbGxUaWxlcygpLm1hcCgodGlsZSkgPT4ge1xuICAgICAgICB2YXIgb3B0O1xuICAgICAgICBpZiAodGlsZS5mYWN0b3J5ICE9IG51bGwpIHtcbiAgICAgICAgICBvcHQgPSB7XG4gICAgICAgICAgICB4OiB0aWxlLngsXG4gICAgICAgICAgICB5OiB0aWxlLnlcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0aWxlLmZhY3RvcnlPcHRpb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24ob3B0LCB0aWxlLmZhY3RvcnlPcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRpbGUuZmFjdG9yeShvcHQpO1xuICAgICAgICB9XG4gICAgICB9KS5maWx0ZXIoKHRpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHRpbGUgIT0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFRpbGVzKCkge1xuICAgICAgaWYgKHRoaXMuZmluYWxUaWxlcyA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5maW5hbFRpbGVzO1xuICAgIH1cblxuICAgIG5ld1Jvb20oKSB7XG4gICAgICBpZiAodGhpcy5mcmVlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnZvbHVtZSA9IE1hdGguZmxvb3IodGhpcy5ybmcoKSAqICh0aGlzLm1heFZvbHVtZSAtIHRoaXMubWluVm9sdW1lKSkgKyB0aGlzLm1pblZvbHVtZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vbSA9IG5ldyBSb29tR2VuZXJhdG9yLlJvb20oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByYW5kb21EaXJlY3Rpb25zKCkge1xuICAgICAgdmFyIGksIGosIG8sIHg7XG4gICAgICBvID0gRGlyZWN0aW9uLmFkamFjZW50cy5zbGljZSgpO1xuICAgICAgaiA9IHZvaWQgMDtcbiAgICAgIHggPSB2b2lkIDA7XG4gICAgICBpID0gby5sZW5ndGg7XG4gICAgICB3aGlsZSAoaSkge1xuICAgICAgICBqID0gTWF0aC5mbG9vcih0aGlzLnJuZygpICogaSk7XG4gICAgICAgIHggPSBvWy0taV07XG4gICAgICAgIG9baV0gPSBvW2pdO1xuICAgICAgICBvW2pdID0geDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvO1xuICAgIH1cblxuICAgIHN0ZXAoKSB7XG4gICAgICB2YXIgc3VjY2VzcywgdHJpZXM7XG4gICAgICBpZiAodGhpcy5yb29tKSB7XG4gICAgICAgIGlmICh0aGlzLmZyZWUubGVuZ3RoICYmIHRoaXMucm9vbS50aWxlcy5sZW5ndGggPCB0aGlzLnZvbHVtZSAtIDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5yb29tLnRpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdHJpZXMgPSB0aGlzLnJhbmRvbURpcmVjdGlvbnMoKTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHdoaWxlICh0cmllcy5sZW5ndGggJiYgIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuZXhwYW5kKHRoaXMucm9vbSwgdHJpZXMucG9wKCksIHRoaXMudm9sdW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgICB0aGlzLnJvb21Eb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUodGhpcy5yYW5kb21GcmVlVGlsZSgpLCB0aGlzLnJvb20pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucm9vbURvbmUoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByb29tRG9uZSgpIHtcbiAgICAgIHRoaXMucm9vbXMucHVzaCh0aGlzLnJvb20pO1xuICAgICAgdGhpcy5hbGxvY2F0ZVdhbGxzKHRoaXMucm9vbSk7XG4gICAgICByZXR1cm4gdGhpcy5yb29tID0gbnVsbDtcbiAgICB9XG5cbiAgICBleHBhbmQocm9vbSwgZGlyZWN0aW9uLCBtYXggPSAwKSB7XG4gICAgICB2YXIgaywgbGVuLCBuZXh0LCByZWYsIHNlY29uZCwgc3VjY2VzcywgdGlsZTtcbiAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgIHJlZiA9IHJvb20udGlsZXM7XG4gICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgdGlsZSA9IHJlZltrXTtcbiAgICAgICAgaWYgKG1heCA9PT0gMCB8fCByb29tLnRpbGVzLmxlbmd0aCA8IG1heCkge1xuICAgICAgICAgIGlmIChuZXh0ID0gdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbikpIHtcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKG5leHQsIHJvb20pO1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoc2Vjb25kID0gdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgMikpICYmICF0aGlzLnRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uLCAzKSkge1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUoc2Vjb25kLCByb29tKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgIH1cblxuICAgIGFsbG9jYXRlV2FsbHMocm9vbSkge1xuICAgICAgdmFyIGRpcmVjdGlvbiwgaywgbGVuLCBuZXh0LCBuZXh0Um9vbSwgb3RoZXJTaWRlLCByZWYsIHJlc3VsdHMsIHRpbGU7XG4gICAgICByZWYgPSByb29tLnRpbGVzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgIHRpbGUgPSByZWZba107XG4gICAgICAgIHJlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGwsIGxlbjEsIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlZjEgPSBEaXJlY3Rpb24uYWxsO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChsID0gMCwgbGVuMSA9IHJlZjEubGVuZ3RoOyBsIDwgbGVuMTsgbCsrKSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSByZWYxW2xdO1xuICAgICAgICAgICAgbmV4dCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSk7XG4gICAgICAgICAgICBpZiAoKG5leHQgIT0gbnVsbCkgJiYgbmV4dC5yb29tICE9PSByb29tKSB7XG4gICAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwoRGlyZWN0aW9uLmNvcm5lcnMsIGRpcmVjdGlvbikgPCAwKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJTaWRlID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUodGlsZS54ICsgZGlyZWN0aW9uLnggKiAyLCB0aWxlLnkgKyBkaXJlY3Rpb24ueSAqIDIpO1xuICAgICAgICAgICAgICAgIG5leHRSb29tID0gKG90aGVyU2lkZSAhPSBudWxsID8gb3RoZXJTaWRlLnJvb20gOiB2b2lkIDApICE9IG51bGwgPyBvdGhlclNpZGUucm9vbSA6IG51bGw7XG4gICAgICAgICAgICAgICAgcm9vbS5hZGRXYWxsKG5leHQsIG5leHRSb29tKTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dFJvb20gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgbmV4dFJvb20uYWRkV2FsbChuZXh0LCByb29tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbmV4dC5mYWN0b3J5ID0gdGhpcy53YWxsRmFjdG9yeTtcbiAgICAgICAgICAgICAgcmVzdWx0czEucHVzaCh0aGlzLmFsbG9jYXRlVGlsZShuZXh0KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzMTtcbiAgICAgICAgfSkuY2FsbCh0aGlzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBjcmVhdGVEb29ycygpIHtcbiAgICAgIHZhciBkb29yLCBrLCBsZW4sIHJlZiwgcmVzdWx0cywgcm9vbSwgd2FsbHM7XG4gICAgICByZWYgPSB0aGlzLnJvb21zO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgIHJvb20gPSByZWZba107XG4gICAgICAgIHJlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGwsIGxlbjEsIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlZjEgPSByb29tLndhbGxzQnlSb29tcygpO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChsID0gMCwgbGVuMSA9IHJlZjEubGVuZ3RoOyBsIDwgbGVuMTsgbCsrKSB7XG4gICAgICAgICAgICB3YWxscyA9IHJlZjFbbF07XG4gICAgICAgICAgICBpZiAoKHdhbGxzLnJvb20gIT0gbnVsbCkgJiYgcm9vbS5kb29yc0ZvclJvb20od2FsbHMucm9vbSkgPCAxKSB7XG4gICAgICAgICAgICAgIGRvb3IgPSB3YWxscy50aWxlc1tNYXRoLmZsb29yKHRoaXMucm5nKCkgKiB3YWxscy50aWxlcy5sZW5ndGgpXTtcbiAgICAgICAgICAgICAgZG9vci5mYWN0b3J5ID0gdGhpcy5kb29yRmFjdG9yeTtcbiAgICAgICAgICAgICAgZG9vci5mYWN0b3J5T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKGRvb3IueCArIDEsIGRvb3IueSkuZmFjdG9yeSA9PT0gdGhpcy5mbG9vckZhY3RvcnkgPyBEb29yLmRpcmVjdGlvbnMudmVydGljYWwgOiBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByb29tLmFkZERvb3IoZG9vciwgd2FsbHMucm9vbSk7XG4gICAgICAgICAgICAgIHJlc3VsdHMxLnB1c2god2FsbHMucm9vbS5hZGREb29yKGRvb3IsIHJvb20pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMxLnB1c2godm9pZCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KS5jYWxsKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFsbG9jYXRlVGlsZSh0aWxlLCByb29tID0gbnVsbCkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaWYgKHJvb20gIT0gbnVsbCkge1xuICAgICAgICByb29tLmFkZFRpbGUodGlsZSk7XG4gICAgICAgIHRpbGUuZmFjdG9yeSA9IHRoaXMuZmxvb3JGYWN0b3J5O1xuICAgICAgfVxuICAgICAgaW5kZXggPSB0aGlzLmZyZWUuaW5kZXhPZih0aWxlKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZyZWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgbXVsdGlwbHkgPSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy50aWxlSXNGcmVlKHRpbGUueCArIGRpcmVjdGlvbi54ICogbXVsdGlwbHksIHRpbGUueSArIGRpcmVjdGlvbi55ICogbXVsdGlwbHkpO1xuICAgIH1cblxuICAgIHRpbGVJc0ZyZWUoeCwgeSkge1xuICAgICAgdmFyIHRpbGU7XG4gICAgICB0aWxlID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUoeCwgeSk7XG4gICAgICBpZiAoKHRpbGUgIT0gbnVsbCkgJiYgaW5kZXhPZi5jYWxsKHRoaXMuZnJlZSwgdGlsZSkgPj0gMCkge1xuICAgICAgICByZXR1cm4gdGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByYW5kb21GcmVlVGlsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmZyZWVbTWF0aC5mbG9vcih0aGlzLnJuZygpICogdGhpcy5mcmVlLmxlbmd0aCldO1xuICAgIH1cblxuICB9O1xuXG4gIFJvb21HZW5lcmF0b3IucHJvcGVydGllcyh7XG4gICAgcm5nOiB7XG4gICAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICAgIH0sXG4gICAgbWF4Vm9sdW1lOiB7XG4gICAgICBkZWZhdWx0OiAyNVxuICAgIH0sXG4gICAgbWluVm9sdW1lOiB7XG4gICAgICBkZWZhdWx0OiA1MFxuICAgIH0sXG4gICAgd2lkdGg6IHtcbiAgICAgIGRlZmF1bHQ6IDMwXG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGRlZmF1bHQ6IDE1XG4gICAgfSxcbiAgICB0aWxlQ29udGFpbmVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaywgbCwgcmVmLCByZWYxLCB0aWxlcywgeCwgeTtcbiAgICAgICAgdGlsZXMgPSBuZXcgVGlsZUNvbnRhaW5lcigpO1xuICAgICAgICBmb3IgKHggPSBrID0gMCwgcmVmID0gdGhpcy53aWR0aDsgKDAgPD0gcmVmID8gayA8PSByZWYgOiBrID49IHJlZik7IHggPSAwIDw9IHJlZiA/ICsrayA6IC0taykge1xuICAgICAgICAgIGZvciAoeSA9IGwgPSAwLCByZWYxID0gdGhpcy5oZWlnaHQ7ICgwIDw9IHJlZjEgPyBsIDw9IHJlZjEgOiBsID49IHJlZjEpOyB5ID0gMCA8PSByZWYxID8gKytsIDogLS1sKSB7XG4gICAgICAgICAgICB0aWxlcy5hZGRUaWxlKG5ldyBUaWxlKHgsIHkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmxvb3JGYWN0b3J5OiB7XG4gICAgICBkZWZhdWx0OiBmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG9wdC54LCBvcHQueSk7XG4gICAgICB9XG4gICAgfSxcbiAgICB3YWxsRmFjdG9yeToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgZG9vckZhY3Rvcnk6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb29yRmFjdG9yeTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBSb29tR2VuZXJhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5Sb29tR2VuZXJhdG9yLlJvb20gPSBjbGFzcyBSb29tIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50aWxlcyA9IFtdO1xuICAgIHRoaXMud2FsbHMgPSBbXTtcbiAgICB0aGlzLmRvb3JzID0gW107XG4gIH1cblxuICBhZGRUaWxlKHRpbGUpIHtcbiAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgcmV0dXJuIHRpbGUucm9vbSA9IHRoaXM7XG4gIH1cblxuICBjb250YWluc1dhbGwodGlsZSkge1xuICAgIHZhciBrLCBsZW4sIHJlZiwgd2FsbDtcbiAgICByZWYgPSB0aGlzLndhbGxzO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgd2FsbCA9IHJlZltrXTtcbiAgICAgIGlmICh3YWxsLnRpbGUgPT09IHRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHdhbGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFkZFdhbGwodGlsZSwgbmV4dFJvb20pIHtcbiAgICB2YXIgZXhpc3Rpbmc7XG4gICAgZXhpc3RpbmcgPSB0aGlzLmNvbnRhaW5zV2FsbCh0aWxlKTtcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIHJldHVybiBleGlzdGluZy5uZXh0Um9vbSA9IG5leHRSb29tO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxscy5wdXNoKHtcbiAgICAgICAgdGlsZTogdGlsZSxcbiAgICAgICAgbmV4dFJvb206IG5leHRSb29tXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB3YWxsc0J5Um9vbXMoKSB7XG4gICAgdmFyIGssIGxlbiwgcG9zLCByZWYsIHJlcywgcm9vbXMsIHdhbGw7XG4gICAgcm9vbXMgPSBbXTtcbiAgICByZXMgPSBbXTtcbiAgICByZWYgPSB0aGlzLndhbGxzO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgd2FsbCA9IHJlZltrXTtcbiAgICAgIHBvcyA9IHJvb21zLmluZGV4T2Yod2FsbC5uZXh0Um9vbSk7XG4gICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICBwb3MgPSByb29tcy5sZW5ndGg7XG4gICAgICAgIHJvb21zLnB1c2god2FsbC5uZXh0Um9vbSk7XG4gICAgICAgIHJlcy5wdXNoKHtcbiAgICAgICAgICByb29tOiB3YWxsLm5leHRSb29tLFxuICAgICAgICAgIHRpbGVzOiBbXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJlc1twb3NdLnRpbGVzLnB1c2god2FsbC50aWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGFkZERvb3IodGlsZSwgbmV4dFJvb20pIHtcbiAgICByZXR1cm4gdGhpcy5kb29ycy5wdXNoKHtcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICBuZXh0Um9vbTogbmV4dFJvb21cbiAgICB9KTtcbiAgfVxuXG4gIGRvb3JzRm9yUm9vbShyb29tKSB7XG4gICAgdmFyIGRvb3IsIGssIGxlbiwgcmVmLCByZXM7XG4gICAgcmVzID0gW107XG4gICAgcmVmID0gdGhpcy5kb29ycztcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIGRvb3IgPSByZWZba107XG4gICAgICBpZiAoZG9vci5uZXh0Um9vbSA9PT0gcm9vbSkge1xuICAgICAgICByZXMucHVzaChkb29yLnRpbGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUm9vbUdlbmVyYXRvci5qcy5tYXBcbiIsInZhciBEYW1hZ2VhYmxlLCBQcm9qZWN0aWxlLCBTaGlwV2VhcG9uLCBUaWxlZCwgVGltaW5nO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxuRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpO1xuXG5Qcm9qZWN0aWxlID0gcmVxdWlyZSgnLi9Qcm9qZWN0aWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFdlYXBvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2hpcFdlYXBvbiBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICB2YXIgcHJvamVjdGlsZTtcbiAgICAgIGlmICh0aGlzLmNhbkZpcmUpIHtcbiAgICAgICAgcHJvamVjdGlsZSA9IG5ldyBQcm9qZWN0aWxlKHtcbiAgICAgICAgICBvcmlnaW46IHRoaXMsXG4gICAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgICBibGFzdFJhbmdlOiB0aGlzLmJsYXN0UmFuZ2UsXG4gICAgICAgICAgcHJvcGFnYXRpb25UeXBlOiB0aGlzLnByb3BhZ2F0aW9uVHlwZSxcbiAgICAgICAgICBzcGVlZDogdGhpcy5wcm9qZWN0aWxlU3BlZWQsXG4gICAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvamVjdGlsZS5sYXVuY2goKTtcbiAgICAgICAgdGhpcy5jaGFyZ2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVjaGFyZ2UoKTtcbiAgICAgICAgcmV0dXJuIHByb2plY3RpbGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVjaGFyZ2UoKSB7XG4gICAgICB0aGlzLmNoYXJnaW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJnZVRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jaGFyZ2luZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZWQoKTtcbiAgICAgIH0sIHRoaXMucmVjaGFyZ2VUaW1lKTtcbiAgICB9XG5cbiAgICByZWNoYXJnZWQoKSB7XG4gICAgICB0aGlzLmNoYXJnZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMuYXV0b0ZpcmUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFNoaXBXZWFwb24uZXh0ZW5kKERhbWFnZWFibGUpO1xuXG4gIFNoaXBXZWFwb24ucHJvcGVydGllcyh7XG4gICAgcmVjaGFyZ2VUaW1lOiB7XG4gICAgICBkZWZhdWx0OiAxMDAwXG4gICAgfSxcbiAgICBwb3dlcjoge1xuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIGJsYXN0UmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICB9LFxuICAgIHByb3BhZ2F0aW9uVHlwZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcHJvamVjdGlsZVNwZWVkOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgdGFyZ2V0OiB7XG4gICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0ZpcmUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maXJlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNoYXJnZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGNoYXJnaW5nOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBlbmFibGVkOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBhdXRvRmlyZToge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY3JpdGljYWxIZWFsdGg6IHtcbiAgICAgIGRlZmF1bHQ6IDAuM1xuICAgIH0sXG4gICAgY2FuRmlyZToge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0ICYmIHRoaXMuZW5hYmxlZCAmJiB0aGlzLmNoYXJnZWQgJiYgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCA+PSB0aGlzLmNyaXRpY2FsSGVhbHRoO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNoaXBXZWFwb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvU2hpcFdlYXBvbi5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBTdGFyO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU3RhciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHg1LCB5NSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMueCA9IHg1O1xuICAgICAgdGhpcy55ID0geTU7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIGxpbmtUbyhzdGFyKSB7XG4gICAgICBpZiAoIXRoaXMubGlua3MuZmluZFN0YXIoc3RhcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkTGluayhuZXcgdGhpcy5jb25zdHJ1Y3Rvci5MaW5rKHRoaXMsIHN0YXIpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMaW5rKGxpbmspIHtcbiAgICAgIHRoaXMubGlua3MuYWRkKGxpbmspO1xuICAgICAgbGluay5vdGhlclN0YXIodGhpcykubGlua3MuYWRkKGxpbmspO1xuICAgICAgcmV0dXJuIGxpbms7XG4gICAgfVxuXG4gICAgZGlzdCh4LCB5KSB7XG4gICAgICB2YXIgeERpc3QsIHlEaXN0O1xuICAgICAgeERpc3QgPSB0aGlzLnggLSB4O1xuICAgICAgeURpc3QgPSB0aGlzLnkgLSB5O1xuICAgICAgcmV0dXJuIE1hdGguc3FydCgoeERpc3QgKiB4RGlzdCkgKyAoeURpc3QgKiB5RGlzdCkpO1xuICAgIH1cblxuICB9O1xuXG4gIFN0YXIucHJvcGVydGllcyh7XG4gICAgeDoge30sXG4gICAgeToge30sXG4gICAgbGlua3M6IHtcbiAgICAgIGNvbGxlY3Rpb246IHtcbiAgICAgICAgZmluZFN0YXI6IGZ1bmN0aW9uKHN0YXIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maW5kKGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgICAgIHJldHVybiBsaW5rLnN0YXIyID09PSBzdGFyIHx8IGxpbmsuc3RhcjEgPT09IHN0YXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIFN0YXIuY29sbGVuY3Rpb25GbiA9IHtcbiAgICBjbG9zZXN0OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB2YXIgbWluLCBtaW5EaXN0O1xuICAgICAgbWluID0gbnVsbDtcbiAgICAgIG1pbkRpc3QgPSBudWxsO1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXIpIHtcbiAgICAgICAgdmFyIGRpc3Q7XG4gICAgICAgIGRpc3QgPSBzdGFyLmRpc3QoeCwgeSk7XG4gICAgICAgIGlmICgobWluID09IG51bGwpIHx8IG1pbkRpc3QgPiBkaXN0KSB7XG4gICAgICAgICAgbWluID0gc3RhcjtcbiAgICAgICAgICByZXR1cm4gbWluRGlzdCA9IGRpc3Q7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1pbjtcbiAgICB9LFxuICAgIGNsb3Nlc3RzOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB2YXIgZGlzdHM7XG4gICAgICBkaXN0cyA9IHRoaXMubWFwKGZ1bmN0aW9uKHN0YXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkaXN0OiBzdGFyLmRpc3QoeCwgeSksXG4gICAgICAgICAgc3Rhcjogc3RhclxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBkaXN0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuZGlzdCAtIGIuZGlzdDtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuY29weShkaXN0cy5tYXAoZnVuY3Rpb24oZGlzdCkge1xuICAgICAgICByZXR1cm4gZGlzdC5zdGFyO1xuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhcjtcblxufSkuY2FsbCh0aGlzKTtcblxuU3Rhci5MaW5rID0gY2xhc3MgTGluayBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihzdGFyMSwgc3RhcjIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhcjEgPSBzdGFyMTtcbiAgICB0aGlzLnN0YXIyID0gc3RhcjI7XG4gIH1cblxuICByZW1vdmUoKSB7XG4gICAgdGhpcy5zdGFyMS5saW5rcy5yZW1vdmUodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMuc3RhcjIubGlua3MucmVtb3ZlKHRoaXMpO1xuICB9XG5cbiAgb3RoZXJTdGFyKHN0YXIpIHtcbiAgICBpZiAoc3RhciA9PT0gdGhpcy5zdGFyMSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcjI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXIxO1xuICAgIH1cbiAgfVxuXG4gIGdldExlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFyMS5kaXN0KHRoaXMuc3RhcjIueCwgdGhpcy5zdGFyMi55KTtcbiAgfVxuXG4gIGluQm91bmRhcnlCb3goeCwgeSwgcGFkZGluZyA9IDApIHtcbiAgICB2YXIgeDEsIHgyLCB5MSwgeTI7XG4gICAgeDEgPSBNYXRoLm1pbih0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgLSBwYWRkaW5nO1xuICAgIHkxID0gTWF0aC5taW4odGhpcy5zdGFyMS55LCB0aGlzLnN0YXIyLnkpIC0gcGFkZGluZztcbiAgICB4MiA9IE1hdGgubWF4KHRoaXMuc3RhcjEueCwgdGhpcy5zdGFyMi54KSArIHBhZGRpbmc7XG4gICAgeTIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLnksIHRoaXMuc3RhcjIueSkgKyBwYWRkaW5nO1xuICAgIHJldHVybiB4ID49IHgxICYmIHggPD0geDIgJiYgeSA+PSB5MSAmJiB5IDw9IHkyO1xuICB9XG5cbiAgY2xvc2VUb1BvaW50KHgsIHksIG1pbkRpc3QpIHtcbiAgICB2YXIgYSwgYWJEaXN0LCBhYmNBbmdsZSwgYWJ4QW5nbGUsIGFjRGlzdCwgYWN4QW5nbGUsIGIsIGMsIGNkRGlzdCwgeEFiRGlzdCwgeEFjRGlzdCwgeUFiRGlzdCwgeUFjRGlzdDtcbiAgICBpZiAoIXRoaXMuaW5Cb3VuZGFyeUJveCh4LCB5LCBtaW5EaXN0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gdGhpcy5zdGFyMTtcbiAgICBiID0gdGhpcy5zdGFyMjtcbiAgICBjID0ge1xuICAgICAgXCJ4XCI6IHgsXG4gICAgICBcInlcIjogeVxuICAgIH07XG4gICAgeEFiRGlzdCA9IGIueCAtIGEueDtcbiAgICB5QWJEaXN0ID0gYi55IC0gYS55O1xuICAgIGFiRGlzdCA9IE1hdGguc3FydCgoeEFiRGlzdCAqIHhBYkRpc3QpICsgKHlBYkRpc3QgKiB5QWJEaXN0KSk7XG4gICAgYWJ4QW5nbGUgPSBNYXRoLmF0YW4oeUFiRGlzdCAvIHhBYkRpc3QpO1xuICAgIHhBY0Rpc3QgPSBjLnggLSBhLng7XG4gICAgeUFjRGlzdCA9IGMueSAtIGEueTtcbiAgICBhY0Rpc3QgPSBNYXRoLnNxcnQoKHhBY0Rpc3QgKiB4QWNEaXN0KSArICh5QWNEaXN0ICogeUFjRGlzdCkpO1xuICAgIGFjeEFuZ2xlID0gTWF0aC5hdGFuKHlBY0Rpc3QgLyB4QWNEaXN0KTtcbiAgICBhYmNBbmdsZSA9IGFieEFuZ2xlIC0gYWN4QW5nbGU7XG4gICAgY2REaXN0ID0gTWF0aC5hYnMoTWF0aC5zaW4oYWJjQW5nbGUpICogYWNEaXN0KTtcbiAgICByZXR1cm4gY2REaXN0IDw9IG1pbkRpc3Q7XG4gIH1cblxuICBpbnRlcnNlY3RMaW5rKGxpbmspIHtcbiAgICB2YXIgcywgczFfeCwgczFfeSwgczJfeCwgczJfeSwgdCwgeDEsIHgyLCB4MywgeDQsIHkxLCB5MiwgeTMsIHk0O1xuICAgIHgxID0gdGhpcy5zdGFyMS54O1xuICAgIHkxID0gdGhpcy5zdGFyMS55O1xuICAgIHgyID0gdGhpcy5zdGFyMi54O1xuICAgIHkyID0gdGhpcy5zdGFyMi55O1xuICAgIHgzID0gbGluay5zdGFyMS54O1xuICAgIHkzID0gbGluay5zdGFyMS55O1xuICAgIHg0ID0gbGluay5zdGFyMi54O1xuICAgIHk0ID0gbGluay5zdGFyMi55O1xuICAgIHMxX3ggPSB4MiAtIHgxO1xuICAgIHMxX3kgPSB5MiAtIHkxO1xuICAgIHMyX3ggPSB4NCAtIHgzO1xuICAgIHMyX3kgPSB5NCAtIHkzO1xuICAgIHMgPSAoLXMxX3kgKiAoeDEgLSB4MykgKyBzMV94ICogKHkxIC0geTMpKSAvICgtczJfeCAqIHMxX3kgKyBzMV94ICogczJfeSk7XG4gICAgdCA9IChzMl94ICogKHkxIC0geTMpIC0gczJfeSAqICh4MSAtIHgzKSkgLyAoLXMyX3ggKiBzMV95ICsgczFfeCAqIHMyX3kpO1xuICAgIHJldHVybiBzID4gMCAmJiBzIDwgMSAmJiB0ID4gMCAmJiB0IDwgMTtcbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1N0YXIuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTWFwLCBTdGFyLCBTdGFyTWFwR2VuZXJhdG9yO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbk1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5cblN0YXIgPSByZXF1aXJlKCcuL1N0YXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyTWFwR2VuZXJhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTdGFyTWFwR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMub3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZPcHQsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGdlbmVyYXRlKCkge1xuICAgICAgdGhpcy5tYXAgPSBuZXcgdGhpcy5vcHQubWFwQ2xhc3MoKTtcbiAgICAgIHRoaXMuc3RhcnMgPSB0aGlzLm1hcC5sb2NhdGlvbnMuY29weSgpO1xuICAgICAgdGhpcy5saW5rcyA9IFtdO1xuICAgICAgdGhpcy5jcmVhdGVTdGFycyh0aGlzLm9wdC5uYlN0YXJzKTtcbiAgICAgIHRoaXMubWFrZUxpbmtzKCk7XG4gICAgICByZXR1cm4gdGhpcy5tYXA7XG4gICAgfVxuXG4gICAgY3JlYXRlU3RhcnMobmIpIHtcbiAgICAgIHZhciBpLCBrLCByZWYsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBrID0gMCwgcmVmID0gbmI7ICgwIDw9IHJlZiA/IGsgPCByZWYgOiBrID4gcmVmKTsgaSA9IDAgPD0gcmVmID8gKytrIDogLS1rKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmNyZWF0ZVN0YXIoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBjcmVhdGVTdGFyKCkge1xuICAgICAgdmFyIGosIHBvcztcbiAgICAgIGogPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgcG9zID0ge1xuICAgICAgICAgIHg6IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiAodGhpcy5vcHQubWF4WCAtIHRoaXMub3B0Lm1pblgpICsgdGhpcy5vcHQubWluWCksXG4gICAgICAgICAgeTogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhZIC0gdGhpcy5vcHQubWluWSkgKyB0aGlzLm9wdC5taW5ZKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIShqIDwgMTAgJiYgdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHN0YXIuZGlzdChwb3MueCwgcG9zLnkpIDw9IHRoaXMub3B0Lm1pblN0YXJEaXN0O1xuICAgICAgICB9KSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgICBpZiAoIShqID49IDEwKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVTdGFyQXRQb3MocG9zLngsIHBvcy55KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVTdGFyQXRQb3MoeCwgeSkge1xuICAgICAgdmFyIHN0YXI7XG4gICAgICBzdGFyID0gbmV3IHRoaXMub3B0LnN0YXJDbGFzcyh4LCB5KTtcbiAgICAgIHRoaXMubWFwLmxvY2F0aW9ucy5wdXNoKHN0YXIpO1xuICAgICAgdGhpcy5zdGFycy5wdXNoKHN0YXIpO1xuICAgICAgcmV0dXJuIHN0YXI7XG4gICAgfVxuXG4gICAgbWFrZUxpbmtzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcnMuZm9yRWFjaCgoc3RhcikgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5tYWtlTGlua3NGcm9tKHN0YXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUxpbmtzRnJvbShzdGFyKSB7XG4gICAgICB2YXIgY2xvc2UsIGNsb3Nlc3RzLCBsaW5rLCBuZWVkZWQsIHJlc3VsdHMsIHRyaWVzO1xuICAgICAgdHJpZXMgPSB0aGlzLm9wdC5saW5rVHJpZXM7XG4gICAgICBuZWVkZWQgPSB0aGlzLm9wdC5saW5rc0J5U3RhcnMgLSBzdGFyLmxpbmtzLmNvdW50KCk7XG4gICAgICBpZiAobmVlZGVkID4gMCkge1xuICAgICAgICBjbG9zZXN0cyA9IHRoaXMuc3RhcnMuZmlsdGVyKChzdGFyMikgPT4ge1xuICAgICAgICAgIHJldHVybiBzdGFyMiAhPT0gc3RhciAmJiAhc3Rhci5saW5rcy5maW5kU3RhcihzdGFyMik7XG4gICAgICAgIH0pLmNsb3Nlc3RzKHN0YXIueCwgc3Rhci55KTtcbiAgICAgICAgaWYgKGNsb3Nlc3RzLmNvdW50KCkgPiAwKSB7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjbG9zZSA9IGNsb3Nlc3RzLnNoaWZ0KCk7XG4gICAgICAgICAgICBsaW5rID0gdGhpcy5jcmVhdGVMaW5rKHN0YXIsIGNsb3NlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlTGluayhsaW5rKSkge1xuICAgICAgICAgICAgICB0aGlzLmxpbmtzLnB1c2gobGluayk7XG4gICAgICAgICAgICAgIHN0YXIuYWRkTGluayhsaW5rKTtcbiAgICAgICAgICAgICAgbmVlZGVkIC09IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0cmllcyAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEobmVlZGVkID4gMCAmJiB0cmllcyA+IDAgJiYgY2xvc2VzdHMuY291bnQoKSA+IDApKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlTGluayhzdGFyMSwgc3RhcjIpIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5vcHQubGlua0NsYXNzKHN0YXIxLCBzdGFyMik7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVMaW5rKGxpbmspIHtcbiAgICAgIHJldHVybiAhdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICAgIHJldHVybiBzdGFyICE9PSBsaW5rLnN0YXIxICYmIHN0YXIgIT09IGxpbmsuc3RhcjIgJiYgbGluay5jbG9zZVRvUG9pbnQoc3Rhci54LCBzdGFyLnksIHRoaXMub3B0Lm1pbkxpbmtEaXN0KTtcbiAgICAgIH0pICYmICF0aGlzLmxpbmtzLmZpbmQoKGxpbmsyKSA9PiB7XG4gICAgICAgIHJldHVybiBsaW5rMi5pbnRlcnNlY3RMaW5rKGxpbmspO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgU3Rhck1hcEdlbmVyYXRvci5wcm90b3R5cGUuZGVmT3B0ID0ge1xuICAgIG5iU3RhcnM6IDIwLFxuICAgIG1pblg6IDAsXG4gICAgbWF4WDogNTAwLFxuICAgIG1pblk6IDAsXG4gICAgbWF4WTogNTAwLFxuICAgIG1pblN0YXJEaXN0OiAxMCxcbiAgICBtaW5MaW5rRGlzdDogMTAsXG4gICAgbGlua3NCeVN0YXJzOiAzLFxuICAgIGxpbmtUcmllczogMyxcbiAgICBtYXBDbGFzczogTWFwLFxuICAgIHN0YXJDbGFzczogU3RhcixcbiAgICBsaW5rQ2xhc3M6IFN0YXIuTGluayxcbiAgICBybmc6IE1hdGgucmFuZG9tXG4gIH07XG5cbiAgcmV0dXJuIFN0YXJNYXBHZW5lcmF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvU3Rhck1hcEdlbmVyYXRvci5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBHcmlkLCBWaWV3O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkdyaWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLWdyaWRzJykuR3JpZDtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBWaWV3IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgcmVmLCByZWYxO1xuICAgICAgaWYgKCF0aGlzLmJvdW5kcykge1xuICAgICAgICB0aGlzLmdyaWQgPSB0aGlzLmdyaWQgfHwgKChyZWYgPSB0aGlzLmdhbWUuX21haW5WaWV3KSAhPSBudWxsID8gKHJlZjEgPSByZWYudmFsdWUpICE9IG51bGwgPyByZWYxLmdyaWQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IG5ldyBHcmlkKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmJvdW5kcyA9IHRoaXMuZ3JpZC5hZGRDZWxsKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdhbWUgPSBudWxsO1xuICAgIH1cblxuICB9O1xuXG4gIFZpZXcucHJvcGVydGllcyh7XG4gICAgZ2FtZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICAgIHRoaXMuZ2FtZS52aWV3cy5hZGQodGhpcyk7XG4gICAgICAgICAgdGhpcy5zZXREZWZhdWx0cygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICByZXR1cm4gb2xkLnZpZXdzLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgeToge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgYm91bmRzOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVmlldztcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9WaWV3LmpzLm1hcFxuIiwidmFyIERpcmVjdGlvbiwgTGluZU9mU2lnaHQsIFRpbGVDb250YWluZXIsIFRpbGVSZWZlcmVuY2UsIFZpc2lvbkNhbGN1bGF0b3I7XG5cbkxpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpO1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uO1xuXG5UaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXI7XG5cblRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVJlZmVyZW5jZTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaXNpb25DYWxjdWxhdG9yID0gY2xhc3MgVmlzaW9uQ2FsY3VsYXRvciB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpblRpbGUsIG9mZnNldCA9IHtcbiAgICAgIHg6IDAuNSxcbiAgICAgIHk6IDAuNVxuICAgIH0pIHtcbiAgICB0aGlzLm9yaWdpblRpbGUgPSBvcmlnaW5UaWxlO1xuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHRoaXMucHRzID0ge307XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge307XG4gICAgdGhpcy5zdGFjayA9IFtdO1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgY2FsY3VsKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB2YXIgZmlyc3RCYXRjaCwgaW5pdGlhbFB0cztcbiAgICB0aGlzLnB0cyA9IHt9O1xuICAgIHRoaXMudmlzaWJpbGl0eSA9IHt9O1xuICAgIGluaXRpYWxQdHMgPSBbXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDFcbiAgICAgIH1cbiAgICBdO1xuICAgIGluaXRpYWxQdHMuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnNldFB0KHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55LCB0cnVlKTtcbiAgICB9KTtcbiAgICBmaXJzdEJhdGNoID0gW1xuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDIsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAxXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAyXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAtMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDJcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiB0aGlzLnN0YWNrID0gZmlyc3RCYXRjaC5tYXAoKHB0KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLm9yaWdpblRpbGUueCArIHB0LngsXG4gICAgICAgIHk6IHRoaXMub3JpZ2luVGlsZS55ICsgcHQueVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFB0KHgsIHksIHZhbCkge1xuICAgIHZhciBhZGphbmNlbnQ7XG4gICAgdGhpcy5wdHNbeCArICc6JyArIHldID0gdmFsO1xuICAgIGFkamFuY2VudCA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiBhZGphbmNlbnQuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFZpc2liaWxpdHkoeCArIHB0LngsIHkgKyBwdC55LCB2YWwgPyAxIC8gYWRqYW5jZW50Lmxlbmd0aCA6IDApO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UHQoeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnB0c1t4ICsgJzonICsgeV07XG4gIH1cblxuICBhZGRWaXNpYmlsaXR5KHgsIHksIHZhbCkge1xuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5W3hdID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF1beV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVt4XVt5XSArPSB2YWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmlzaWJpbGl0eSh4LCB5KSB7XG4gICAgaWYgKCh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkgfHwgKHRoaXMudmlzaWJpbGl0eVt4XVt5XSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV07XG4gICAgfVxuICB9XG5cbiAgY2FuUHJvY2Vzcyh4LCB5KSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YWNrLnNvbWUoKHB0KSA9PiB7XG4gICAgICByZXR1cm4gcHQueCA9PT0geCAmJiBwdC55ID09PSB5O1xuICAgIH0pICYmICh0aGlzLmdldFB0KHgsIHkpID09IG51bGwpO1xuICB9XG5cbiAgc3RlcCgpIHtcbiAgICB2YXIgbG9zLCBwdDtcbiAgICBwdCA9IHRoaXMuc3RhY2suc2hpZnQoKTtcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lciwgdGhpcy5vcmlnaW5UaWxlLnggKyB0aGlzLm9mZnNldC54LCB0aGlzLm9yaWdpblRpbGUueSArIHRoaXMub2Zmc2V0LnksIHB0LngsIHB0LnkpO1xuICAgIGxvcy5yZXZlcnNlVHJhY2luZygpO1xuICAgIGxvcy50cmF2ZXJzYWJsZUNhbGxiYWNrID0gKHRpbGUsIGVudHJ5WCwgZW50cnlZKSA9PiB7XG4gICAgICBpZiAodGlsZSAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmdldFZpc2liaWxpdHkodGlsZS54LCB0aWxlLnkpID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGxvcy5mb3JjZVN1Y2Nlc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGlsZS50cmFuc3BhcmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5zZXRQdChwdC54LCBwdC55LCBsb3MuZ2V0U3VjY2VzcygpKTtcbiAgICBpZiAobG9zLmdldFN1Y2Nlc3MoKSkge1xuICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZm9yRWFjaCgoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIHZhciBuZXh0UHQ7XG4gICAgICAgIG5leHRQdCA9IHtcbiAgICAgICAgICB4OiBwdC54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgeTogcHQueSArIGRpcmVjdGlvbi55XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmNhblByb2Nlc3MobmV4dFB0LngsIG5leHRQdC55KSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YWNrLnB1c2gobmV4dFB0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Qm91bmRzKCkge1xuICAgIHZhciBib3VuZGFyaWVzLCBjb2wsIHJlZiwgdmFsLCB4LCB5O1xuICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICB0b3A6IG51bGwsXG4gICAgICBsZWZ0OiBudWxsLFxuICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgcmlnaHQ6IG51bGxcbiAgICB9O1xuICAgIHJlZiA9IHRoaXMudmlzaWJpbGl0eTtcbiAgICBmb3IgKHggaW4gcmVmKSB7XG4gICAgICBjb2wgPSByZWZbeF07XG4gICAgICBmb3IgKHkgaW4gY29sKSB7XG4gICAgICAgIHZhbCA9IGNvbFt5XTtcbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB5IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgICBib3VuZGFyaWVzLnRvcCA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgeCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMubGVmdCA9IHg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB5ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgICAgYm91bmRhcmllcy5yaWdodCA9IHg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gIH1cblxuICB0b0NvbnRhaW5lcigpIHtcbiAgICB2YXIgY29sLCByZWYsIHJlcywgdGlsZSwgdmFsLCB4LCB5O1xuICAgIHJlcyA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgcmVzLm93bmVyID0gZmFsc2U7XG4gICAgcmVmID0gdGhpcy52aXNpYmlsaXR5O1xuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XTtcbiAgICAgIGZvciAoeSBpbiBjb2wpIHtcbiAgICAgICAgdmFsID0gY29sW3ldO1xuICAgICAgICB0aWxlID0gdGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgICBpZiAodmFsICE9PSAwICYmICh0aWxlICE9IG51bGwpKSB7XG4gICAgICAgICAgdGlsZSA9IG5ldyBUaWxlUmVmZXJlbmNlKHRpbGUpO1xuICAgICAgICAgIHRpbGUudmlzaWJpbGl0eSA9IHZhbDtcbiAgICAgICAgICByZXMuYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgdG9NYXAoKSB7XG4gICAgdmFyIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgcmVzLCB4LCB5O1xuICAgIHJlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbWFwOiBbXVxuICAgIH0sIHRoaXMuZ2V0Qm91bmRzKCkpO1xuICAgIGZvciAoeSA9IGkgPSByZWYgPSByZXMudG9wLCByZWYxID0gcmVzLmJvdHRvbSAtIDE7IChyZWYgPD0gcmVmMSA/IGkgPD0gcmVmMSA6IGkgPj0gcmVmMSk7IHkgPSByZWYgPD0gcmVmMSA/ICsraSA6IC0taSkge1xuICAgICAgcmVzLm1hcFt5IC0gcmVzLnRvcF0gPSBbXTtcbiAgICAgIGZvciAoeCA9IGogPSByZWYyID0gcmVzLmxlZnQsIHJlZjMgPSByZXMucmlnaHQgLSAxOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeCA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICByZXMubWFwW3kgLSByZXMudG9wXVt4IC0gcmVzLmxlZnRdID0gdGhpcy5nZXRWaXNpYmlsaXR5KHgsIHkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVmlzaW9uQ2FsY3VsYXRvci5qcy5tYXBcbiIsInZhciBBY3Rpb24sIEVsZW1lbnQsIEV2ZW50RW1pdHRlcjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQWN0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICB3aXRoQWN0b3IoYWN0b3IpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yICE9PSBhY3Rvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7XG4gICAgICAgICAgYWN0b3I6IGFjdG9yXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29weVdpdGgob3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBiYXNlOiB0aGlzXG4gICAgICB9LCB0aGlzLmdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCksIG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGUoKTtcbiAgICB9XG5cbiAgICB2YWxpZEFjdG9yKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0b3IgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBpc1JlYWR5KCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3RvcigpO1xuICAgIH1cblxuICAgIGZpbmlzaCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignZmluaXNoZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGludGVycnVwdCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignaW50ZXJydXB0ZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGVuZCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignZW5kJyk7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgQWN0aW9uLmluY2x1ZGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5cbiAgQWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIGFjdG9yOiB7fVxuICB9KTtcblxuICByZXR1cm4gQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQWN0aW9uLmpzLm1hcFxuIiwidmFyIEFjdGlvblByb3ZpZGVyLCBFbGVtZW50O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uUHJvdmlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFjdGlvblByb3ZpZGVyIGV4dGVuZHMgRWxlbWVudCB7fTtcblxuICBBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0FjdGlvblByb3ZpZGVyLmpzLm1hcFxuIiwidmFyIEF0dGFja0FjdGlvbiwgRXZlbnRCaW5kLCBQcm9wZXJ0eVdhdGNoZXIsIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vV2Fsa0FjdGlvbicpO1xuXG5UYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpO1xuXG5FdmVudEJpbmQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRCaW5kO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuSW52YWxpZGF0ZWQuUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFja0FjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXR0YWNrQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldElzQXR0YWNrYWJsZSgpICYmICh0aGlzLmNhblVzZVdlYXBvbigpIHx8IHRoaXMuY2FuV2Fsa1RvVGFyZ2V0KCkpO1xuICAgIH1cblxuICAgIHRhcmdldElzQXR0YWNrYWJsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5kYW1hZ2VhYmxlICYmIHRoaXMudGFyZ2V0LmhlYWx0aCA+PSAwO1xuICAgIH1cblxuICAgIGNhbk1lbGVlKCkge1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueCAtIHRoaXMuYWN0b3IudGlsZS54KSArIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueSAtIHRoaXMuYWN0b3IudGlsZS55KSA9PT0gMTtcbiAgICB9XG5cbiAgICBjYW5Vc2VXZWFwb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5iZXN0VXNhYmxlV2VhcG9uICE9IG51bGw7XG4gICAgfVxuXG4gICAgY2FuVXNlV2VhcG9uQXQodGlsZSkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIHJldHVybiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApICYmIHRoaXMuYWN0b3Iud2VhcG9ucy5maW5kKCh3ZWFwb24pID0+IHtcbiAgICAgICAgcmV0dXJuIHdlYXBvbi5jYW5Vc2VGcm9tKHRpbGUsIHRoaXMudGFyZ2V0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbldhbGtUb1RhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uaXNSZWFkeSgpO1xuICAgIH1cblxuICAgIHVzZVdlYXBvbigpIHtcbiAgICAgIHRoaXMuYmVzdFVzYWJsZVdlYXBvbi51c2VPbih0aGlzLnRhcmdldCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2goKTtcbiAgICB9XG5cbiAgICBleGVjdXRlKCkge1xuICAgICAgaWYgKHRoaXMuYWN0b3Iud2FsayAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYWN0b3Iud2Fsay5pbnRlcnJ1cHQoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24gIT0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uLmNoYXJnZWQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy51c2VXZWFwb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25DaGFyZ2VXYXRjaGVyLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YWxrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmludGVycnVwdEJpbmRlci51bmJpbmQoKTtcbiAgICAgICAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIuYmluZFRvKHRoaXMud2Fsa0FjdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEF0dGFja0FjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrQWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2Fsa0FjdGlvbjtcbiAgICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHdhbGtBY3Rpb24ucGF0aEZpbmRlci5hcnJpdmVkQ2FsbGJhY2sgPSAoc3RlcCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNhblVzZVdlYXBvbkF0KHN0ZXAudGlsZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB3YWxrQWN0aW9uO1xuICAgICAgfVxuICAgIH0sXG4gICAgYmVzdFVzYWJsZVdlYXBvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgcmVmLCB1c2FibGVXZWFwb25zO1xuICAgICAgICBpbnZhbGlkYXRvci5wcm9wUGF0aCgnYWN0b3IudGlsZScpO1xuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApIHtcbiAgICAgICAgICB1c2FibGVXZWFwb25zID0gdGhpcy5hY3Rvci53ZWFwb25zLmZpbHRlcigod2VhcG9uKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gd2VhcG9uLmNhblVzZU9uKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB1c2FibGVXZWFwb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBiLmRwcyAtIGEuZHBzO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB1c2FibGVXZWFwb25zWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnRlcnJ1cHRCaW5kZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXZlbnRCaW5kKCdpbnRlcnJ1cHRlZCcsIG51bGwsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogdHJ1ZVxuICAgIH0sXG4gICAgd2VhcG9uQ2hhcmdlV2F0Y2hlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uLmNoYXJnZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlV2VhcG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5iZXN0VXNhYmxlV2VhcG9uLmdldFByb3BlcnR5SW5zdGFuY2UoJ2NoYXJnZWQnKVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXR0YWNrQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQXR0YWNrQWN0aW9uLmpzLm1hcFxuIiwidmFyIEF0dGFja0FjdGlvbiwgQXR0YWNrTW92ZUFjdGlvbiwgRXZlbnRCaW5kLCBMaW5lT2ZTaWdodCwgUGF0aEZpbmRlciwgUHJvcGVydHlXYXRjaGVyLCBUYXJnZXRBY3Rpb24sIFdhbGtBY3Rpb247XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKTtcblxuQXR0YWNrQWN0aW9uID0gcmVxdWlyZSgnLi9BdHRhY2tBY3Rpb24nKTtcblxuVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKTtcblxuUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpO1xuXG5MaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4uL0xpbmVPZlNpZ2h0Jyk7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5JbnZhbGlkYXRlZC5Qcm9wZXJ0eVdhdGNoZXI7XG5cbkV2ZW50QmluZCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEJpbmQ7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNrTW92ZUFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXR0YWNrTW92ZUFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgaXNFbmVteShlbGVtKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgcmV0dXJuIChyZWYgPSB0aGlzLmFjdG9yLm93bmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5pc0VuZW15ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuaXNFbmVteShlbGVtKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgICB9XG5cbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24udmFsaWRUYXJnZXQoKTtcbiAgICB9XG5cbiAgICB0ZXN0RW5lbXlTcG90dGVkKCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlRW5lbXlTcG90dGVkKCk7XG4gICAgICBpZiAodGhpcy5lbmVteVNwb3R0ZWQpIHtcbiAgICAgICAgdGhpcy5hdHRhY2tBY3Rpb24gPSBuZXcgQXR0YWNrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMuZW5lbXlTcG90dGVkXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF0dGFja0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLmF0dGFja0FjdGlvbik7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5pbnRlcnJ1cHQoKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlV2Fsa0FjdGlvbigpO1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2tBY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4ZWN1dGUoKSB7XG4gICAgICBpZiAoIXRoaXMudGVzdEVuZW15U3BvdHRlZCgpKSB7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLndhbGtBY3Rpb24pO1xuICAgICAgICB0aGlzLnRpbGVXYXRjaGVyLmJpbmQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5leGVjdXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQXR0YWNrTW92ZUFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrQWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2Fsa0FjdGlvbjtcbiAgICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB3YWxrQWN0aW9uO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5lbXlTcG90dGVkOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICB0aGlzLnBhdGggPSBuZXcgUGF0aEZpbmRlcih0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUsIGZhbHNlLCB7XG4gICAgICAgICAgdmFsaWRUaWxlOiAodGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRpbGUudHJhbnNwYXJlbnQgJiYgKG5ldyBMaW5lT2ZTaWdodCh0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUueCwgdGhpcy5hY3Rvci50aWxlLnksIHRpbGUueCwgdGlsZS55KSkuZ2V0U3VjY2VzcygpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYXJyaXZlZDogKHN0ZXApID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwLmVuZW15ID0gc3RlcC50aWxlLmNoaWxkcmVuLmZpbmQoKGMpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNFbmVteShjKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZWZmaWNpZW5jeTogKHRpbGUpID0+IHt9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBhdGguY2FsY3VsKCk7XG4gICAgICAgIHJldHVybiAocmVmID0gdGhpcy5wYXRoLnNvbHV0aW9uKSAhPSBudWxsID8gcmVmLmVuZW15IDogdm9pZCAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGlsZVdhdGNoZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGVzdEVuZW15U3BvdHRlZCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuYWN0b3IuZ2V0UHJvcGVydHlJbnN0YW5jZSgndGlsZScpXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IHRydWVcbiAgICB9LFxuICAgIGludGVycnVwdEJpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEJpbmQoJ2ludGVycnVwdGVkJywgbnVsbCwgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXR0YWNrTW92ZUFjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24uanMubWFwXG4iLCJ2YXIgQWN0aW9uUHJvdmlkZXIsIFNpbXBsZUFjdGlvblByb3ZpZGVyO1xuXG5BY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vQWN0aW9uUHJvdmlkZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVBY3Rpb25Qcm92aWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2ltcGxlQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBY3Rpb25Qcm92aWRlciB7fTtcblxuICBTaW1wbGVBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY3Rpb25zO1xuICAgICAgICBhY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHRoaXMuY29uc3RydWN0b3IuYWN0aW9ucztcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb25zID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgYWN0aW9ucyA9IE9iamVjdC5rZXlzKGFjdGlvbnMpLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb25zW2tleV07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IGFjdGlvbih7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gU2ltcGxlQWN0aW9uUHJvdmlkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlci5qcy5tYXBcbiIsInZhciBBY3Rpb24sIFRhcmdldEFjdGlvbjtcblxuQWN0aW9uID0gcmVxdWlyZSgnLi9BY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXJnZXRBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRhcmdldEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgd2l0aFRhcmdldCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLnRhcmdldCAhPT0gdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHtcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNhblRhcmdldCh0YXJnZXQpIHtcbiAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgIGluc3RhbmNlID0gdGhpcy53aXRoVGFyZ2V0KHRhcmdldCk7XG4gICAgICBpZiAoaW5zdGFuY2UudmFsaWRUYXJnZXQoKSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsaWRUYXJnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBpc1JlYWR5KCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmlzUmVhZHkoKSAmJiB0aGlzLnZhbGlkVGFyZ2V0KCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGFyZ2V0QWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIHRhcmdldDoge31cbiAgfSk7XG5cbiAgcmV0dXJuIFRhcmdldEFjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1RhcmdldEFjdGlvbi5qcy5tYXBcbiIsInZhciBBY3Rpb25Qcm92aWRlciwgTWl4YWJsZSwgVGlsZWRBY3Rpb25Qcm92aWRlcjtcblxuQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL0FjdGlvblByb3ZpZGVyJyk7XG5cbk1peGFibGUgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuTWl4YWJsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZEFjdGlvblByb3ZpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlZEFjdGlvblByb3ZpZGVyIGV4dGVuZHMgQWN0aW9uUHJvdmlkZXIge1xuICAgIHZhbGlkQWN0aW9uVGlsZSh0aWxlKSB7XG4gICAgICByZXR1cm4gdGlsZSAhPSBudWxsO1xuICAgIH1cblxuICAgIHByZXBhcmVBY3Rpb25UaWxlKHRpbGUpIHtcbiAgICAgIGlmICghdGlsZS5nZXRQcm9wZXJ0eUluc3RhbmNlKCdwcm92aWRlZEFjdGlvbnMnKSkge1xuICAgICAgICByZXR1cm4gTWl4YWJsZS5FeHRlbnNpb24ubWFrZShBY3Rpb25Qcm92aWRlci5wcm90b3R5cGUsIHRpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFRpbGVkQWN0aW9uUHJvdmlkZXIucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQsIG92ZXJyaWRlZCkge1xuICAgICAgICBvdmVycmlkZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkQWN0aW9ucztcbiAgICAgIH1cbiAgICB9LFxuICAgIGFjdGlvblRpbGVzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgbXlUaWxlO1xuICAgICAgICBteVRpbGUgPSBpbnZhbGlkYXRvci5wcm9wKCd0aWxlJyk7XG4gICAgICAgIGlmIChteVRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25UaWxlc0Nvb3JkLm1hcCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBteVRpbGUuZ2V0UmVsYXRpdmVUaWxlKGNvb3JkLngsIGNvb3JkLnkpO1xuICAgICAgICAgIH0pLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3Rpb25UaWxlKHRpbGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZm9yd2FyZGVkQWN0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjoge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEuYWN0aW9uID09PSBiLmFjdGlvbiAmJiBhLmxvY2F0aW9uID09PSBiLmxvY2F0aW9uO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgYWN0aW9uVGlsZXMsIGFjdGlvbnM7XG4gICAgICAgIGFjdGlvblRpbGVzID0gaW52YWxpZGF0b3IucHJvcCgnYWN0aW9uVGlsZXMnKTtcbiAgICAgICAgYWN0aW9ucyA9IGludmFsaWRhdG9yLnByb3AoJ3Byb3ZpZGVkQWN0aW9ucycpO1xuICAgICAgICByZXR1cm4gYWN0aW9uVGlsZXMucmVkdWNlKChyZXMsIHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzLmNvbmNhdChhY3Rpb25zLm1hcChmdW5jdGlvbihhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGFjdGlvbjogYWN0LFxuICAgICAgICAgICAgICBsb2NhdGlvbjogdGlsZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH0sXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKGZvcndhcmRlZCkge1xuICAgICAgICB0aGlzLnByZXBhcmVBY3Rpb25UaWxlKGZvcndhcmRlZC5sb2NhdGlvbik7XG4gICAgICAgIHJldHVybiBmb3J3YXJkZWQubG9jYXRpb24ucHJvdmlkZWRBY3Rpb25zLmFkZChmb3J3YXJkZWQuYWN0aW9uKTtcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24oZm9yd2FyZGVkKSB7XG4gICAgICAgIHJldHVybiBmb3J3YXJkZWQubG9jYXRpb24ucHJvdmlkZWRBY3Rpb25zLnJlbW92ZShmb3J3YXJkZWQuYWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIFRpbGVkQWN0aW9uUHJvdmlkZXIucHJvdG90eXBlLmFjdGlvblRpbGVzQ29vcmQgPSBbXG4gICAge1xuICAgICAgeDogMCxcbiAgICAgIHk6IC0xXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiAtMSxcbiAgICAgIHk6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiArMSxcbiAgICAgIHk6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiArMVxuICAgIH1cbiAgXTtcblxuICByZXR1cm4gVGlsZWRBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXIuanMubWFwXG4iLCJ2YXIgUGF0aEZpbmRlciwgUGF0aFdhbGssIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpO1xuXG5QYXRoV2FsayA9IHJlcXVpcmUoJy4uL1BhdGhXYWxrJyk7XG5cblRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa0FjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2Fsa0FjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgZXhlY3V0ZSgpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yLndhbGsgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFjdG9yLndhbGsuaW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLndhbGsgPSB0aGlzLmFjdG9yLndhbGsgPSBuZXcgUGF0aFdhbGsodGhpcy5hY3RvciwgdGhpcy5wYXRoRmluZGVyKTtcbiAgICAgIHRoaXMuYWN0b3Iud2Fsay5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmFjdG9yLndhbGsub24oJ2ludGVycnVwdGVkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuYWN0b3Iud2Fsay5zdGFydCgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgICBpZiAodGhpcy53YWxrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGsuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbGlkVGFyZ2V0KCkge1xuICAgICAgdGhpcy5wYXRoRmluZGVyLmNhbGN1bCgpO1xuICAgICAgcmV0dXJuIHRoaXMucGF0aEZpbmRlci5zb2x1dGlvbiAhPSBudWxsO1xuICAgIH1cblxuICB9O1xuXG4gIFdhbGtBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgcGF0aEZpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoRmluZGVyKHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZSwgdGhpcy50YXJnZXQsIHtcbiAgICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuYWN0b3IuY2FuR29PblRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rvci5jYW5Hb09uVGlsZSh0aWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aWxlLndhbGthYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV2Fsa0FjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1dhbGtBY3Rpb24uanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJBdXRvbWF0aWNEb29yXCI6IHJlcXVpcmUoXCIuL0F1dG9tYXRpY0Rvb3JcIiksXG4gIFwiQ2hhcmFjdGVyXCI6IHJlcXVpcmUoXCIuL0NoYXJhY3RlclwiKSxcbiAgXCJDaGFyYWN0ZXJBSVwiOiByZXF1aXJlKFwiLi9DaGFyYWN0ZXJBSVwiKSxcbiAgXCJEYW1hZ2VQcm9wYWdhdGlvblwiOiByZXF1aXJlKFwiLi9EYW1hZ2VQcm9wYWdhdGlvblwiKSxcbiAgXCJEYW1hZ2VhYmxlXCI6IHJlcXVpcmUoXCIuL0RhbWFnZWFibGVcIiksXG4gIFwiRG9vclwiOiByZXF1aXJlKFwiLi9Eb29yXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJGbG9vclwiOiByZXF1aXJlKFwiLi9GbG9vclwiKSxcbiAgXCJHYW1lXCI6IHJlcXVpcmUoXCIuL0dhbWVcIiksXG4gIFwiTGluZU9mU2lnaHRcIjogcmVxdWlyZShcIi4vTGluZU9mU2lnaHRcIiksXG4gIFwiTWFwXCI6IHJlcXVpcmUoXCIuL01hcFwiKSxcbiAgXCJPYnN0YWNsZVwiOiByZXF1aXJlKFwiLi9PYnN0YWNsZVwiKSxcbiAgXCJQYXRoV2Fsa1wiOiByZXF1aXJlKFwiLi9QYXRoV2Fsa1wiKSxcbiAgXCJQZXJzb25hbFdlYXBvblwiOiByZXF1aXJlKFwiLi9QZXJzb25hbFdlYXBvblwiKSxcbiAgXCJQbGF5ZXJcIjogcmVxdWlyZShcIi4vUGxheWVyXCIpLFxuICBcIlByb2plY3RpbGVcIjogcmVxdWlyZShcIi4vUHJvamVjdGlsZVwiKSxcbiAgXCJSb29tR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1Jvb21HZW5lcmF0b3JcIiksXG4gIFwiU2hpcFdlYXBvblwiOiByZXF1aXJlKFwiLi9TaGlwV2VhcG9uXCIpLFxuICBcIlN0YXJcIjogcmVxdWlyZShcIi4vU3RhclwiKSxcbiAgXCJTdGFyTWFwR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1N0YXJNYXBHZW5lcmF0b3JcIiksXG4gIFwiVmlld1wiOiByZXF1aXJlKFwiLi9WaWV3XCIpLFxuICBcIlZpc2lvbkNhbGN1bGF0b3JcIjogcmVxdWlyZShcIi4vVmlzaW9uQ2FsY3VsYXRvclwiKSxcbiAgXCJhY3Rpb25zXCI6IHtcbiAgICBcIkFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0FjdGlvblwiKSxcbiAgICBcIkFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJBdHRhY2tBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BdHRhY2tBY3Rpb25cIiksXG4gICAgXCJBdHRhY2tNb3ZlQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvblwiKSxcbiAgICBcIlNpbXBsZUFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJUYXJnZXRBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UYXJnZXRBY3Rpb25cIiksXG4gICAgXCJUaWxlZEFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIldhbGtBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9XYWxrQWN0aW9uXCIpLFxuICB9LFxufSIsInZhciBsaWJzO1xuXG5saWJzID0gcmVxdWlyZSgnLi9saWJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgbGlicywge1xuICBncmlkczogcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLFxuICBQYXRoRmluZGVyOiByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKSxcbiAgc3RyaW5nczogcmVxdWlyZSgncGFyYWxsZWxpby1zdHJpbmdzJyksXG4gIHRpbGVzOiByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJyksXG4gIFRpbWluZzogcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKSxcbiAgd2lyaW5nOiByZXF1aXJlKCdwYXJhbGxlbGlvLXdpcmluZycpLFxuICBTcGFyazogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9wYXJhbGxlbGlvLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBHcmlkPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtHcmlkLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9R3JpZDt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkdyaWQ9R3JpZDt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLkdyaWQ9R3JpZDt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBFdmVudEVtaXR0ZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFdmVudEVtaXR0ZXJcIikgPyBkZXBlbmRlbmNpZXMuRXZlbnRFbWl0dGVyIDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcbnZhciBHcmlkQ2VsbCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkdyaWRDZWxsXCIpID8gZGVwZW5kZW5jaWVzLkdyaWRDZWxsIDogcmVxdWlyZSgnLi9HcmlkQ2VsbCcpO1xudmFyIEdyaWRSb3cgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJHcmlkUm93XCIpID8gZGVwZW5kZW5jaWVzLkdyaWRSb3cgOiByZXF1aXJlKCcuL0dyaWRSb3cnKTtcbnZhciBHcmlkO1xuR3JpZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIHZhciByb3csIHNwb3Q7XG4gICAgICBpZiAoIWNlbGwpIHtcbiAgICAgICAgY2VsbCA9IG5ldyBHcmlkQ2VsbCgpO1xuICAgICAgfVxuICAgICAgc3BvdCA9IHRoaXMuZ2V0RnJlZVNwb3QoKTtcbiAgICAgIHJvdyA9IHRoaXMucm93cy5nZXQoc3BvdC5yb3cpO1xuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcm93ID0gdGhpcy5hZGRSb3coKTtcbiAgICAgIH1cbiAgICAgIHJvdy5hZGRDZWxsKGNlbGwpO1xuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuXG4gICAgYWRkUm93KHJvdyA9IG51bGwpIHtcbiAgICAgIGlmICghcm93KSB7XG4gICAgICAgIHJvdyA9IG5ldyBHcmlkUm93KCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJvd3MucHVzaChyb3cpO1xuICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBnZXRGcmVlU3BvdCgpIHtcbiAgICAgIHZhciBzcG90O1xuICAgICAgc3BvdCA9IG51bGw7XG4gICAgICB0aGlzLnJvd3Muc29tZSgocm93KSA9PiB7XG4gICAgICAgIGlmIChyb3cuY2VsbHMubGVuZ3RoIDwgdGhpcy5tYXhDb2x1bW5zKSB7XG4gICAgICAgICAgcmV0dXJuIHNwb3QgPSB7XG4gICAgICAgICAgICByb3c6IHJvdy5yb3dQb3NpdGlvbixcbiAgICAgICAgICAgIGNvbHVtbjogcm93LmNlbGxzLmxlbmd0aFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFzcG90KSB7XG4gICAgICAgIGlmICh0aGlzLm1heENvbHVtbnMgPiB0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogdGhpcy5yb3dzLmxlbmd0aCxcbiAgICAgICAgICAgIGNvbHVtbjogMFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogMCxcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5tYXhDb2x1bW5zICsgMVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzcG90O1xuICAgIH1cblxuICB9O1xuXG4gIEdyaWQuZXh0ZW5kKEV2ZW50RW1pdHRlcik7XG5cbiAgR3JpZC5wcm9wZXJ0aWVzKHtcbiAgICByb3dzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIHJvdy5ncmlkID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIGlmIChyb3cuZ3JpZCA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiByb3cuZ3JpZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1heENvbHVtbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHJvd3M7XG4gICAgICAgIHJvd3MgPSBpbnZhbGlkYXRvci5wcm9wKCdyb3dzJyk7XG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZShmdW5jdGlvbihtYXgsIHJvdykge1xuICAgICAgICAgIHJldHVybiBNYXRoLm1heChtYXgsIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgcm93KS5sZW5ndGgpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oR3JpZCk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBHcmlkQ2VsbD1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7R3JpZENlbGwuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1HcmlkQ2VsbDt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkdyaWRDZWxsPUdyaWRDZWxsO31lbHNle2lmKHRoaXMuUGFyYWxsZWxpbz09bnVsbCl7dGhpcy5QYXJhbGxlbGlvPXt9O310aGlzLlBhcmFsbGVsaW8uR3JpZENlbGw9R3JpZENlbGw7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgRXZlbnRFbWl0dGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRFbWl0dGVyXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50RW1pdHRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG52YXIgR3JpZENlbGw7XG5HcmlkQ2VsbCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZENlbGwgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG4gIEdyaWRDZWxsLmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIEdyaWRDZWxsLnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2dyaWQnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByb3c6IHt9LFxuICAgIGNvbHVtblBvc2l0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByb3c7XG4gICAgICAgIHJvdyA9IGludmFsaWRhdG9yLnByb3AoJ3JvdycpO1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgcm93KS5pbmRleE9mKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB3aWR0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gMSAvIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxlZnQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3dpZHRoJykgKiBpbnZhbGlkYXRvci5wcm9wKCdjb2x1bW5Qb3NpdGlvbicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3dpZHRoJykgKiAoaW52YWxpZGF0b3IucHJvcCgnY29sdW1uUG9zaXRpb24nKSArIDEpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdoZWlnaHQnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3A6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3RvcCcsIGludmFsaWRhdG9yLnByb3AoJ3JvdycpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnYm90dG9tJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWRDZWxsO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oR3JpZENlbGwpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgR3JpZFJvdz1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7R3JpZFJvdy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUdyaWRSb3c7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5HcmlkUm93PUdyaWRSb3c7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5HcmlkUm93PUdyaWRSb3c7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgRXZlbnRFbWl0dGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRFbWl0dGVyXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50RW1pdHRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG52YXIgR3JpZENlbGwgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJHcmlkQ2VsbFwiKSA/IGRlcGVuZGVuY2llcy5HcmlkQ2VsbCA6IHJlcXVpcmUoJy4vR3JpZENlbGwnKTtcbnZhciBHcmlkUm93O1xuR3JpZFJvdyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZFJvdyBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIGlmICghY2VsbCkge1xuICAgICAgICBjZWxsID0gbmV3IEdyaWRDZWxsKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG5cbiAgfTtcblxuICBHcmlkUm93LmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIEdyaWRSb3cucHJvcGVydGllcyh7XG4gICAgZ3JpZDoge30sXG4gICAgY2VsbHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgcmV0dXJuIGNlbGwucm93ID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24oY2VsbCkge1xuICAgICAgICBpZiAoY2VsbC5yb3cgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gY2VsbC5yb3cgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByb3dQb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgZ3JpZDtcbiAgICAgICAgZ3JpZCA9IGludmFsaWRhdG9yLnByb3AoJ2dyaWQnKTtcbiAgICAgICAgaWYgKGdyaWQpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgncm93cycsIGdyaWQpLmluZGV4T2YodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gMSAvIGludmFsaWRhdG9yLnByb3AoJ3Jvd3MnLCBpbnZhbGlkYXRvci5wcm9wKCdncmlkJykpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvcDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnaGVpZ2h0JykgKiBpbnZhbGlkYXRvci5wcm9wKCdyb3dQb3NpdGlvbicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYm90dG9tOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdoZWlnaHQnKSAqIChpbnZhbGlkYXRvci5wcm9wKCdyb3dQb3NpdGlvbicpICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZFJvdztcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKEdyaWRSb3cpO30pOyIsImlmKG1vZHVsZSl7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEdyaWQ6IHJlcXVpcmUoJy4vR3JpZC5qcycpLFxuICAgIEdyaWRDZWxsOiByZXF1aXJlKCcuL0dyaWRDZWxsLmpzJyksXG4gICAgR3JpZFJvdzogcmVxdWlyZSgnLi9HcmlkUm93LmpzJylcbiAgfTtcbn0iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEJpbmRlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QmluZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9QmluZGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQmluZGVyPUJpbmRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkJpbmRlcj1CaW5kZXI7fX19KShmdW5jdGlvbigpe1xudmFyIEJpbmRlcjtcbkJpbmRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQmluZGVyIHtcbiAgICBiaW5kKCkge1xuICAgICAgaWYgKCF0aGlzLmJpbmRlZCAmJiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgICAgdGhpcy5kb0JpbmQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmJpbmRlZCA9IHRydWU7XG4gICAgfVxuICAgIGRvQmluZCgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuICAgIHVuYmluZCgpIHtcbiAgICAgIGlmICh0aGlzLmJpbmRlZCAmJiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgICAgdGhpcy5kb1VuYmluZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG4gICAgZXF1YWxzKGJpbmRlcikge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuY29tcGFyZVJlZmVyZWQoYmluZGVyLCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0UmVmKCkge31cbiAgICBzdGF0aWMgY29tcGFyZVJlZmVyZWQob2JqMSwgb2JqMikge1xuICAgICAgcmV0dXJuIG9iajEgPT09IG9iajIgfHwgKChvYmoxICE9IG51bGwpICYmIChvYmoyICE9IG51bGwpICYmIG9iajEuY29uc3RydWN0b3IgPT09IG9iajIuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlUmVmKG9iajEucmVmLCBvYmoyLnJlZikpO1xuICAgIH1cbiAgICBzdGF0aWMgY29tcGFyZVJlZihyZWYxLCByZWYyKSB7XG4gICAgICByZXR1cm4gKHJlZjEgIT0gbnVsbCkgJiYgKHJlZjIgIT0gbnVsbCkgJiYgKHJlZjEgPT09IHJlZjIgfHwgKEFycmF5LmlzQXJyYXkocmVmMSkgJiYgQXJyYXkuaXNBcnJheShyZWYxKSAmJiByZWYxLmV2ZXJ5KCh2YWwsIGkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQocmVmMVtpXSwgcmVmMltpXSk7XG4gICAgICB9KSkgfHwgKHR5cGVvZiByZWYxID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWYyID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5rZXlzKHJlZjEpLmpvaW4oKSA9PT0gT2JqZWN0LmtleXMocmVmMikuam9pbigpICYmIE9iamVjdC5rZXlzKHJlZjEpLmV2ZXJ5KChrZXkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQocmVmMVtrZXldLCByZWYyW2tleV0pO1xuICAgICAgfSkpKTtcbiAgICB9XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCaW5kZXIucHJvdG90eXBlLCAncmVmJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZWYoKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gQmluZGVyO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihCaW5kZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9CaW5kZXIuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENvbGxlY3Rpb249ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0NvbGxlY3Rpb24uZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Db2xsZWN0aW9uO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ29sbGVjdGlvbj1Db2xsZWN0aW9uO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ29sbGVjdGlvbj1Db2xsZWN0aW9uO319fSkoZnVuY3Rpb24oKXtcbnZhciBDb2xsZWN0aW9uO1xuQ29sbGVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29sbGVjdGlvbiB7XG4gICAgY29uc3RydWN0b3IoYXJyKSB7XG4gICAgICBpZiAoYXJyICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcnIudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKTtcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IFthcnJdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hcnJheSA9IFtdO1xuICAgICAgfVxuICAgIH1cbiAgICBjaGFuZ2VkKCkge31cbiAgICBjaGVja0NoYW5nZXMob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgaWYgKGNvbXBhcmVGdW5jdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIG9sZCA9IHRoaXMuY29weShvbGQuc2xpY2UoKSk7XG4gICAgICByZXR1cm4gdGhpcy5jb3VudCgpICE9PSBvbGQubGVuZ3RoIHx8IChvcmRlcmVkID8gdGhpcy5zb21lKGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgICAgICByZXR1cm4gIWNvbXBhcmVGdW5jdGlvbihvbGQuZ2V0KGkpLCB2YWwpO1xuICAgICAgfSkgOiB0aGlzLnNvbWUoZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbihiKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVGdW5jdGlvbihhLCBiKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSk7XG4gICAgfVxuICAgIGdldChpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV07XG4gICAgfVxuICAgIHNldChpLCB2YWwpIHtcbiAgICAgIHZhciBvbGQ7XG4gICAgICBpZiAodGhpcy5fYXJyYXlbaV0gIT09IHZhbCkge1xuICAgICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgICAgdGhpcy5fYXJyYXlbaV0gPSB2YWw7XG4gICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgYWRkKHZhbCkge1xuICAgICAgaWYgKCF0aGlzLl9hcnJheS5pbmNsdWRlcyh2YWwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2godmFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlKHZhbCkge1xuICAgICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcGx1Y2soZm4pIHtcbiAgICAgIHZhciBmb3VuZCwgaW5kZXgsIG9sZDtcbiAgICAgIGluZGV4ID0gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZuKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICBmb3VuZCA9IHRoaXMuX2FycmF5W2luZGV4XTtcbiAgICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB0b0FycmF5KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5LnNsaWNlKCk7XG4gICAgfVxuICAgIGNvdW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aDtcbiAgICB9XG4gICAgc3RhdGljIG5ld1N1YkNsYXNzKGZuLCBhcnIpIHtcbiAgICAgIHZhciBTdWJDbGFzcztcbiAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIFN1YkNsYXNzID0gY2xhc3MgZXh0ZW5kcyB0aGlzIHt9O1xuICAgICAgICBPYmplY3QuYXNzaWduKFN1YkNsYXNzLnByb3RvdHlwZSwgZm4pO1xuICAgICAgICByZXR1cm4gbmV3IFN1YkNsYXNzKGFycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29weShhcnIpIHtcbiAgICAgIHZhciBjb2xsO1xuICAgICAgaWYgKGFyciA9PSBudWxsKSB7XG4gICAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgfVxuICAgICAgY29sbCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGFycik7XG4gICAgICByZXR1cm4gY29sbDtcbiAgICB9XG4gICAgZXF1YWxzKGFycikge1xuICAgICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuIGFycltpXSA9PT0gdmFsO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGdldEFkZGVkRnJvbShhcnIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gIWFyci5pbmNsdWRlcyhpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRSZW1vdmVkRnJvbShhcnIpIHtcbiAgICAgIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pbmNsdWRlcyhpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXTtcbiAgQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucyA9IFsnY29uY2F0JywgJ2ZpbHRlcicsICdzbGljZSddO1xuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXTtcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZyk7XG4gICAgfTtcbiAgfSk7XG4gIENvbGxlY3Rpb24ucmVhZExpc3RGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbihmdW5jdCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvcHkodGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZykpO1xuICAgIH07XG4gIH0pO1xuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICB2YXIgb2xkLCByZXM7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHJlcyA9IHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gQ29sbGVjdGlvbjtcbn0pLmNhbGwodGhpcyk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKTtcbiAgfVxufSk7XG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBTeW1ib2wgIT09IG51bGwgPyBTeW1ib2wuaXRlcmF0b3IgOiB2b2lkIDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH07XG59XG5yZXR1cm4oQ29sbGVjdGlvbik7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0NvbGxlY3Rpb24uanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEVsZW1lbnQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0VsZW1lbnQuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1FbGVtZW50O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRWxlbWVudD1FbGVtZW50O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuRWxlbWVudD1FbGVtZW50O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5Qcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHknKTtcbnZhciBNaXhhYmxlID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiTWl4YWJsZVwiKSA/IGRlcGVuZGVuY2llcy5NaXhhYmxlIDogcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG52YXIgRWxlbWVudDtcbkVsZW1lbnQgPSBjbGFzcyBFbGVtZW50IGV4dGVuZHMgTWl4YWJsZSB7XG4gIHRhcChuYW1lKSB7XG4gICAgdmFyIGFyZ3M7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBuYW1lLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNhbGxiYWNrKG5hbWUpIHtcbiAgICBpZiAodGhpcy5fY2FsbGJhY2tzID09IG51bGwpIHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIH1cbiAgICBpZiAodGhpcy5fY2FsbGJhY2tzW25hbWVdID09IG51bGwpIHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXS5vd25lciA9IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jYWxsYmFja3NbbmFtZV07XG4gIH1cblxuICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgaWYgKHRoaXMuX3Byb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFsnX3Byb3BlcnRpZXMnXS5jb25jYXQodGhpcy5fcHJvcGVydGllcy5tYXAoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICByZXR1cm4gcHJvcC5uYW1lO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgdmFyIGksIGxlbiwgb3B0aW9ucywgcHJvcGVydHksIHJlZiwgcmVzdWx0cztcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICByZWYgPSB0aGlzLl9wcm9wZXJ0aWVzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3BlcnR5ID0gcmVmW2ldO1xuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcGVydHkub3B0aW9ucyk7XG4gICAgICAgIHJlc3VsdHMucHVzaCgobmV3IFByb3BlcnR5KHByb3BlcnR5Lm5hbWUsIG9wdGlvbnMpKS5iaW5kKHRhcmdldCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHByb3BlcnR5KHByb3AsIGRlc2MpIHtcbiAgICByZXR1cm4gKG5ldyBQcm9wZXJ0eShwcm9wLCBkZXNjKSkuYmluZCh0aGlzLnByb3RvdHlwZSk7XG4gIH1cblxuICBzdGF0aWMgcHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGRlc2MsIHByb3AsIHJlc3VsdHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAocHJvcCBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBkZXNjID0gcHJvcGVydGllc1twcm9wXTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnByb3BlcnR5KHByb3AsIGRlc2MpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxufTtcblxucmV0dXJuKEVsZW1lbnQpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbGVtZW50LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBFdmVudEJpbmQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0V2ZW50QmluZC5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUV2ZW50QmluZDt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkV2ZW50QmluZD1FdmVudEJpbmQ7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5FdmVudEJpbmQ9RXZlbnRCaW5kO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmluZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmluZGVyXCIpID8gZGVwZW5kZW5jaWVzLkJpbmRlciA6IHJlcXVpcmUoJy4vQmluZGVyJyk7XG52YXIgRXZlbnRCaW5kO1xuRXZlbnRCaW5kID0gY2xhc3MgRXZlbnRCaW5kIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50MTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDE7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9XG5cbiAgZ2V0UmVmKCkge1xuICAgIHJldHVybiB7XG4gICAgICBldmVudDogdGhpcy5ldmVudCxcbiAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgIH07XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzKGV2ZW50QmluZCkge1xuICAgIHJldHVybiBzdXBlci5lcXVhbHMoZXZlbnRCaW5kKSAmJiBldmVudEJpbmQuZXZlbnQgPT09IHRoaXMuZXZlbnQ7XG4gIH1cblxuICBtYXRjaChldmVudCwgdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50ID09PSB0aGlzLmV2ZW50ICYmIHRhcmdldCA9PT0gdGhpcy50YXJnZXQ7XG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xuICAgIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxufTtcblxucmV0dXJuKEV2ZW50QmluZCk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0V2ZW50QmluZC5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgRXZlbnRFbWl0dGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtFdmVudEVtaXR0ZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1FdmVudEVtaXR0ZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5FdmVudEVtaXR0ZXI9RXZlbnRFbWl0dGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuRXZlbnRFbWl0dGVyPUV2ZW50RW1pdHRlcjt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFdmVudEVtaXR0ZXIge1xuICAgIGdldEFsbEV2ZW50cygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICB9XG4gICAgZ2V0TGlzdGVuZXJzKGUpIHtcbiAgICAgIHZhciBldmVudHM7XG4gICAgICBldmVudHMgPSB0aGlzLmdldEFsbEV2ZW50cygpO1xuICAgICAgcmV0dXJuIGV2ZW50c1tlXSB8fCAoZXZlbnRzW2VdID0gW10pO1xuICAgIH1cbiAgICBoYXNMaXN0ZW5lcihlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGlzdGVuZXJzKGUpLmluY2x1ZGVzKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgYWRkTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICghdGhpcy5oYXNMaXN0ZW5lcihlLCBsaXN0ZW5lcikpIHtcbiAgICAgICAgdGhpcy5nZXRMaXN0ZW5lcnMoZSkucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyQWRkZWQoZSwgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBsaXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKSB7fVxuICAgIHJlbW92ZUxpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgaW5kZXgsIGxpc3RlbmVycztcbiAgICAgIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXJzKGUpO1xuICAgICAgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lclJlbW92ZWQoZSwgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBsaXN0ZW5lclJlbW92ZWQoZSwgbGlzdGVuZXIpIHt9XG4gICAgZW1pdEV2ZW50KGUsIC4uLmFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKS5zbGljZSgpO1xuICAgICAgcmV0dXJuIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lciguLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0RXZlbnQ7XG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUudHJpZ2dlciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEV2ZW50O1xuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuICByZXR1cm4gRXZlbnRFbWl0dGVyO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihFdmVudEVtaXR0ZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEVtaXR0ZXIuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEludmFsaWRhdG9yPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtJbnZhbGlkYXRvci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUludmFsaWRhdG9yO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuSW52YWxpZGF0b3I9SW52YWxpZGF0b3I7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5JbnZhbGlkYXRvcj1JbnZhbGlkYXRvcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJpbmRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJpbmRlclwiKSA/IGRlcGVuZGVuY2llcy5CaW5kZXIgOiByZXF1aXJlKCcuL0JpbmRlcicpO1xudmFyIEV2ZW50QmluZCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkV2ZW50QmluZFwiKSA/IGRlcGVuZGVuY2llcy5FdmVudEJpbmQgOiByZXF1aXJlKCcuL0V2ZW50QmluZCcpO1xudmFyIEludmFsaWRhdG9yLCBwbHVjaztcbnBsdWNrID0gZnVuY3Rpb24oYXJyLCBmbikge1xuICB2YXIgZm91bmQsIGluZGV4O1xuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XTtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbkludmFsaWRhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBJbnZhbGlkYXRvciBleHRlbmRzIEJpbmRlciB7XG4gICAgY29uc3RydWN0b3IocHJvcGVydHksIG9iaiA9IG51bGwpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgICB0aGlzLm9iaiA9IG9iajtcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW107XG4gICAgICB0aGlzLnJlY3ljbGVkID0gW107XG4gICAgICB0aGlzLnVua25vd25zID0gW107XG4gICAgICB0aGlzLnN0cmljdCA9IHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0O1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH07XG4gICAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjay5vd25lciA9IHRoaXM7XG4gICAgfVxuXG4gICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgIHZhciBmdW5jdE5hbWU7XG4gICAgICB0aGlzLmludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnR5KCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH0gZWxzZSBpZiAoKHRoaXMucHJvcGVydHkgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMucHJvcGVydHkuaW52YWxpZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnR5LmludmFsaWRhdGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5wcm9wZXJ0eS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMucHJvcGVydHkuc2xpY2UoMSk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vYmpbZnVuY3ROYW1lXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub2JqW2Z1bmN0TmFtZV0oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vYmpbdGhpcy5wcm9wZXJ0eV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdW5rbm93bigpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS51bmtub3duID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydHkudW5rbm93bigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQmluZGVyKG5ldyBFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spKTtcbiAgICB9XG5cbiAgICBhZGRCaW5kZXIoYmluZGVyKSB7XG4gICAgICBpZiAoYmluZGVyLmNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgICAgYmluZGVyLmNhbGxiYWNrID0gdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2s7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnNvbWUoZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcik7XG4gICAgICB9KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChwbHVjayh0aGlzLnJlY3ljbGVkLCBmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xuICAgICAgICB9KSB8fCBiaW5kZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFVua25vd25DYWxsYmFjayhwcm9wLCB0YXJnZXQpIHtcbiAgICAgIHZhciBjYWxsYmFjaztcbiAgICAgIGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRVbmtub3duKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIH0sIHByb3AsIHRhcmdldCk7XG4gICAgICB9O1xuICAgICAgY2FsbGJhY2sucmVmID0ge1xuICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICB0YXJnZXQ6IHRhcmdldFxuICAgICAgfTtcbiAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBhZGRVbmtub3duKGZuLCBwcm9wLCB0YXJnZXQpIHtcbiAgICAgIGlmICghdGhpcy5maW5kVW5rbm93bihwcm9wLCB0YXJnZXQpKSB7XG4gICAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgICBcInByb3BcIjogcHJvcCxcbiAgICAgICAgICBcInRhcmdldFwiOiB0YXJnZXRcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy51bmtub3ducy5wdXNoKGZuKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5rbm93bigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRVbmtub3duKHByb3AsIHRhcmdldCkge1xuICAgICAgaWYgKChwcm9wICE9IG51bGwpIHx8ICh0YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5rbm93bnMuZmluZChmdW5jdGlvbih1bmtub3duKSB7XG4gICAgICAgICAgcmV0dXJuIHVua25vd24ucmVmLnByb3AgPT09IHByb3AgJiYgdW5rbm93bi5yZWYudGFyZ2V0ID09PSB0YXJnZXQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV2ZW50KGV2ZW50LCB0YXJnZXQgPSB0aGlzLm9iaikge1xuICAgICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbHVlKHZhbCwgZXZlbnQsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wKHByb3AsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3AgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbmFtZSBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jaGVja0VtaXR0ZXIodGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmFkZEV2ZW50QmluZChwcm9wICsgJ0ludmFsaWRhdGVkJywgdGFyZ2V0LCB0aGlzLmdldFVua25vd25DYWxsYmFjayhwcm9wLCB0YXJnZXQpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUodGFyZ2V0W3Byb3BdLCBwcm9wICsgJ1VwZGF0ZWQnLCB0YXJnZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9wSW5pdGlhdGVkKHByb3AsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICB2YXIgaW5pdGlhdGVkO1xuICAgICAgaW5pdGlhdGVkID0gdGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UocHJvcCkuaW5pdGlhdGVkO1xuICAgICAgaWYgKCFpbml0aWF0ZWQgJiYgdGhpcy5jaGVja0VtaXR0ZXIodGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmV2ZW50KHByb3AgKyAnVXBkYXRlZCcsIHRhcmdldCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5pdGlhdGVkO1xuICAgIH1cblxuICAgIGZ1bmN0KGZ1bmN0KSB7XG4gICAgICB2YXIgaW52YWxpZGF0b3IsIHJlcztcbiAgICAgIGludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bigoKSA9PiB7XG4gICAgICAgICAgdmFyIHJlczI7XG4gICAgICAgICAgcmVzMiA9IGZ1bmN0KGludmFsaWRhdG9yKTtcbiAgICAgICAgICBpZiAocmVzICE9PSByZXMyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBpbnZhbGlkYXRvcik7XG4gICAgICB9KTtcbiAgICAgIHJlcyA9IGZ1bmN0KGludmFsaWRhdG9yKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2goaW52YWxpZGF0b3IpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICB2YWxpZGF0ZVVua25vd25zKHByb3AsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICB2YXIgdW5rbm93bnM7XG4gICAgICB1bmtub3ducyA9IHRoaXMudW5rbm93bnM7XG4gICAgICB0aGlzLnVua25vd25zID0gW107XG4gICAgICByZXR1cm4gdW5rbm93bnMuZm9yRWFjaChmdW5jdGlvbih1bmtub3duKSB7XG4gICAgICAgIHJldHVybiB1bmtub3duKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpc0VtcHR5KCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVjeWNsZShjYWxsYmFjaykge1xuICAgICAgdmFyIGRvbmUsIHJlcztcbiAgICAgIHRoaXMucmVjeWNsZWQgPSB0aGlzLmludmFsaWRhdGlvbkV2ZW50cztcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW107XG4gICAgICBkb25lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnJlY3ljbGVkLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50QmluZC51bmJpbmQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY3ljbGVkID0gW107XG4gICAgICB9O1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHRoaXMsIGRvbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcyA9IGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0VtaXR0ZXIoZW1pdHRlcikge1xuICAgICAgcmV0dXJuIEV2ZW50QmluZC5jaGVja0VtaXR0ZXIoZW1pdHRlciwgdGhpcy5zdHJpY3QpO1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZTtcblxuICByZXR1cm4gSW52YWxpZGF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihJbnZhbGlkYXRvcik7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0ludmFsaWRhdG9yLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBNaXhhYmxlPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtNaXhhYmxlLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9TWl4YWJsZTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLk1peGFibGU9TWl4YWJsZTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLk1peGFibGU9TWl4YWJsZTt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5NaXhhYmxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBNaXhhYmxlIHtcbiAgICBzdGF0aWMgZXh0ZW5kKG9iaikge1xuICAgICAgdGhpcy5FeHRlbnNpb24ubWFrZShvYmosIHRoaXMpO1xuICAgICAgaWYgKG9iai5wcm90b3R5cGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5FeHRlbnNpb24ubWFrZShvYmoucHJvdG90eXBlLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuICB9O1xuICBNaXhhYmxlLkV4dGVuc2lvbiA9IHtcbiAgICBtYWtlOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIGksIGxlbiwgcHJvcCwgcmVmO1xuICAgICAgcmVmID0gdGhpcy5nZXRFeHRlbnNpb25Qcm9wZXJ0aWVzKHNvdXJjZSwgdGFyZ2V0KTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBwcm9wID0gcmVmW2ldO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIHByb3ApO1xuICAgICAgfVxuICAgICAgdGFyZ2V0LmV4dGVuc2lvbnMgPSAodGFyZ2V0LmV4dGVuc2lvbnMgfHwgW10pLmNvbmNhdChbc291cmNlXSk7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZS5leHRlbmRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gc291cmNlLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhbHdheXNGaW5hbDogWydleHRlbmRlZCcsICdleHRlbnNpb25zJywgJ19fc3VwZXJfXycsICdjb25zdHJ1Y3RvciddLFxuICAgIGdldEV4dGVuc2lvblByb3BlcnRpZXM6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgYWx3YXlzRmluYWwsIHByb3BzLCB0YXJnZXRDaGFpbjtcbiAgICAgIGFsd2F5c0ZpbmFsID0gdGhpcy5hbHdheXNGaW5hbDtcbiAgICAgIHRhcmdldENoYWluID0gdGhpcy5nZXRQcm90b3R5cGVDaGFpbih0YXJnZXQpO1xuICAgICAgcHJvcHMgPSBbXTtcbiAgICAgIHRoaXMuZ2V0UHJvdG90eXBlQ2hhaW4oc291cmNlKS5ldmVyeShmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIGV4Y2x1ZGU7XG4gICAgICAgIGlmICghdGFyZ2V0Q2hhaW4uaW5jbHVkZXMob2JqKSkge1xuICAgICAgICAgIGV4Y2x1ZGUgPSBhbHdheXNGaW5hbDtcbiAgICAgICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBleGNsdWRlID0gZXhjbHVkZS5jb25jYXQoc291cmNlLmdldEZpbmFsUHJvcGVydGllcygpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChbXCJsZW5ndGhcIiwgXCJwcm90b3R5cGVcIiwgXCJuYW1lXCJdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvcHMgPSBwcm9wcy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICF0YXJnZXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCIgJiYgaW5kZXhPZi5jYWxsKGV4Y2x1ZGUsIGtleSkgPCAwICYmICFwcm9wcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3AubmFtZSA9PT0ga2V5O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgdmFyIHByb3A7XG4gICAgICAgICAgICBwcm9wID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSk7XG4gICAgICAgICAgICBwcm9wLm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0sXG4gICAgZ2V0UHJvdG90eXBlQ2hhaW46IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGJhc2VQcm90b3R5cGUsIGNoYWluO1xuICAgICAgY2hhaW4gPSBbXTtcbiAgICAgIGJhc2VQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0KTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGNoYWluLnB1c2gob2JqKTtcbiAgICAgICAgaWYgKCEoKG9iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSAmJiBvYmogIT09IE9iamVjdCAmJiBvYmogIT09IGJhc2VQcm90b3R5cGUpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFpbjtcbiAgICB9XG4gIH07XG4gIHJldHVybiBNaXhhYmxlO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihNaXhhYmxlKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvTWl4YWJsZS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgT3ZlcnJpZGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtPdmVycmlkZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1PdmVycmlkZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5PdmVycmlkZXI9T3ZlcnJpZGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuT3ZlcnJpZGVyPU92ZXJyaWRlcjt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgT3ZlcnJpZGVyO1xuT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbJ19vdmVycmlkZXMnXS5jb25jYXQoT2JqZWN0LmtleXModGhpcy5fb3ZlcnJpZGVzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgfVxuICAgIGV4dGVuZGVkKHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuT3ZlcnJpZGUuYXBwbHlNYW55KHRhcmdldCwgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCB0aGlzLl9vdmVycmlkZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IgPT09IE92ZXJyaWRlcikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmV4dGVuZGVkID0gdGhpcy5leHRlbmRlZDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIE92ZXJyaWRlci5PdmVycmlkZSA9IHtcbiAgICBtYWtlTWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGZuLCBrZXksIG92ZXJyaWRlLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XG4gICAgICAgIGZuID0gb3ZlcnJpZGVzW2tleV07XG4gICAgICAgIHJlc3VsdHMucHVzaChvdmVycmlkZSA9IHRoaXMubWFrZSh0YXJnZXQsIG5hbWVzcGFjZSwga2V5LCBmbikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBhcHBseU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcbiAgICAgIHZhciBrZXksIG92ZXJyaWRlLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XG4gICAgICAgIG92ZXJyaWRlID0gb3ZlcnJpZGVzW2tleV07XG4gICAgICAgIGlmICh0eXBlb2Ygb3ZlcnJpZGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIG92ZXJyaWRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hcHBseSh0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIGZuTmFtZSwgZm4pIHtcbiAgICAgIHZhciBvdmVycmlkZTtcbiAgICAgIG92ZXJyaWRlID0ge1xuICAgICAgICBmbjoge1xuICAgICAgICAgIGN1cnJlbnQ6IGZuXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6IGZuTmFtZVxuICAgICAgfTtcbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRoJyArIG5hbWVzcGFjZV0gPSBmbjtcbiAgICAgIHJldHVybiBvdmVycmlkZTtcbiAgICB9LFxuICAgIGVtcHR5Rm46IGZ1bmN0aW9uKCkge30sXG4gICAgYXBwbHk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkge1xuICAgICAgdmFyIGZuTmFtZSwgb3ZlcnJpZGVzLCByZWYsIHJlZjEsIHdpdGhvdXQ7XG4gICAgICBmbk5hbWUgPSBvdmVycmlkZS5uYW1lO1xuICAgICAgb3ZlcnJpZGVzID0gdGFyZ2V0Ll9vdmVycmlkZXMgIT0gbnVsbCA/IE9iamVjdC5hc3NpZ24oe30sIHRhcmdldC5fb3ZlcnJpZGVzKSA6IHt9O1xuICAgICAgd2l0aG91dCA9ICgocmVmID0gdGFyZ2V0Ll9vdmVycmlkZXMpICE9IG51bGwgPyAocmVmMSA9IHJlZltmbk5hbWVdKSAhPSBudWxsID8gcmVmMS5mbi5jdXJyZW50IDogdm9pZCAwIDogdm9pZCAwKSB8fCB0YXJnZXRbZm5OYW1lXTtcbiAgICAgIG92ZXJyaWRlID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGUpO1xuICAgICAgaWYgKG92ZXJyaWRlc1tmbk5hbWVdICE9IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUuZm4gPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZXNbZm5OYW1lXS5mbiwgb3ZlcnJpZGUuZm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3ZlcnJpZGUuZm4gPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZS5mbik7XG4gICAgICB9XG4gICAgICBvdmVycmlkZS5mblsnd2l0aG91dCcgKyBuYW1lc3BhY2VdID0gd2l0aG91dCB8fCB0aGlzLmVtcHR5Rm47XG4gICAgICBpZiAod2l0aG91dCA9PSBudWxsKSB7XG4gICAgICAgIG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0ID0gJ3dpdGhvdXQnICsgbmFtZXNwYWNlO1xuICAgICAgfSBlbHNlIGlmIChvdmVycmlkZS5taXNzaW5nV2l0aG91dCkge1xuICAgICAgICBvdmVycmlkZS5mbltvdmVycmlkZS5taXNzaW5nV2l0aG91dF0gPSB3aXRob3V0O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZm5OYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZmluYWxGbiwgZm4sIGtleSwgcmVmMjtcbiAgICAgICAgICBmaW5hbEZuID0gb3ZlcnJpZGUuZm4uY3VycmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAgIHJlZjIgPSBvdmVycmlkZS5mbjtcbiAgICAgICAgICBmb3IgKGtleSBpbiByZWYyKSB7XG4gICAgICAgICAgICBmbiA9IHJlZjJba2V5XTtcbiAgICAgICAgICAgIGZpbmFsRm5ba2V5XSA9IGZuLmJpbmQodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAhPT0gdGhpcykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGZuTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZTogZmluYWxGblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmaW5hbEZuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG92ZXJyaWRlc1tmbk5hbWVdID0gb3ZlcnJpZGU7XG4gICAgICByZXR1cm4gdGFyZ2V0Ll9vdmVycmlkZXMgPSBvdmVycmlkZXM7XG4gICAgfVxuICB9O1xuICByZXR1cm4gT3ZlcnJpZGVyO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihPdmVycmlkZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuUHJvcGVydHk9UHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5Qcm9wZXJ0eT1Qcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJhc2ljUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJCYXNpY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkJhc2ljUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eScpO1xudmFyIENvbGxlY3Rpb25Qcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbGxlY3Rpb25Qcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5Jyk7XG52YXIgQ29tcG9zZWRQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbXBvc2VkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ29tcG9zZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5Jyk7XG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHknKTtcbnZhciBDYWxjdWxhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDYWxjdWxhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ2FsY3VsYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xudmFyIEludmFsaWRhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdGVkUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eScpO1xudmFyIEFjdGl2YWJsZVByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQWN0aXZhYmxlUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQWN0aXZhYmxlUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQWN0aXZhYmxlUHJvcGVydHknKTtcbnZhciBVcGRhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJVcGRhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuVXBkYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eScpO1xudmFyIFByb3BlcnR5T3duZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJQcm9wZXJ0eU93bmVyXCIpID8gZGVwZW5kZW5jaWVzLlByb3BlcnR5T3duZXIgOiByZXF1aXJlKCcuL1Byb3BlcnR5T3duZXInKTtcbnZhciBNaXhhYmxlID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiTWl4YWJsZVwiKSA/IGRlcGVuZGVuY2llcy5NaXhhYmxlIDogcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG52YXIgUHJvcGVydHk7XG5Qcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUHJvcGVydHkge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgYmluZCh0YXJnZXQpIHtcbiAgICAgIHZhciBwYXJlbnQsIHByb3A7XG4gICAgICBwcm9wID0gdGhpcztcbiAgICAgIGlmICghKHR5cGVvZiB0YXJnZXQuZ2V0UHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgdGFyZ2V0LmdldFByb3BlcnR5KHRoaXMubmFtZSkgPT09IHRoaXMpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0LmdldFByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmICgocGFyZW50ID0gdGFyZ2V0LmdldFByb3BlcnR5KHRoaXMubmFtZSkpICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5vdmVycmlkZShwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0SW5zdGFuY2VUeXBlKCkuYmluZCh0YXJnZXQsIHByb3ApO1xuICAgICAgICB0YXJnZXQuX3Byb3BlcnRpZXMgPSAodGFyZ2V0Ll9wcm9wZXJ0aWVzIHx8IFtdKS5jb25jYXQoW3Byb3BdKTtcbiAgICAgICAgaWYgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgdGFyZ2V0Ll9wcm9wZXJ0aWVzID0gdGFyZ2V0Ll9wcm9wZXJ0aWVzLmZpbHRlcihmdW5jdGlvbihleGlzdGluZykge1xuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nICE9PSBwYXJlbnQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYWtlT3duZXIodGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH1cblxuICAgIG92ZXJyaWRlKHBhcmVudCkge1xuICAgICAgdmFyIGtleSwgcmVmLCByZXN1bHRzLCB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50ID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLnBhcmVudCA9IHBhcmVudC5vcHRpb25zO1xuICAgICAgICByZWYgPSBwYXJlbnQub3B0aW9ucztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGtleSBpbiByZWYpIHtcbiAgICAgICAgICB2YWx1ZSA9IHJlZltrZXldO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zW2tleV0gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5vcHRpb25zW2tleV0ub3ZlcnJpZGVkID0gdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9uc1trZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMub3B0aW9uc1trZXldID0gdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFrZU93bmVyKHRhcmdldCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICghKChyZWYgPSB0YXJnZXQuZXh0ZW5zaW9ucykgIT0gbnVsbCA/IHJlZi5pbmNsdWRlcyhQcm9wZXJ0eU93bmVyLnByb3RvdHlwZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiBNaXhhYmxlLkV4dGVuc2lvbi5tYWtlKFByb3BlcnR5T3duZXIucHJvdG90eXBlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldEluc3RhbmNlVmFyTmFtZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaW5zdGFuY2VWYXJOYW1lIHx8ICdfJyArIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICBpc0luc3RhbnRpYXRlZChvYmopIHtcbiAgICAgIHJldHVybiBvYmpbdGhpcy5nZXRJbnN0YW5jZVZhck5hbWUoKV0gIT0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZShvYmopIHtcbiAgICAgIHZhciBUeXBlLCB2YXJOYW1lO1xuICAgICAgdmFyTmFtZSA9IHRoaXMuZ2V0SW5zdGFuY2VWYXJOYW1lKCk7XG4gICAgICBpZiAoIXRoaXMuaXNJbnN0YW50aWF0ZWQob2JqKSkge1xuICAgICAgICBUeXBlID0gdGhpcy5nZXRJbnN0YW5jZVR5cGUoKTtcbiAgICAgICAgb2JqW3Zhck5hbWVdID0gbmV3IFR5cGUodGhpcywgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbdmFyTmFtZV07XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2VUeXBlKCkge1xuICAgICAgaWYgKCF0aGlzLmluc3RhbmNlVHlwZSkge1xuICAgICAgICB0aGlzLmNvbXBvc2Vycy5mb3JFYWNoKChjb21wb3NlcikgPT4ge1xuICAgICAgICAgIHJldHVybiBjb21wb3Nlci5jb21wb3NlKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlVHlwZTtcbiAgICB9XG5cbiAgfTtcblxuICBQcm9wZXJ0eS5wcm90b3R5cGUuY29tcG9zZXJzID0gW0NvbXBvc2VkUHJvcGVydHksIENvbGxlY3Rpb25Qcm9wZXJ0eSwgRHluYW1pY1Byb3BlcnR5LCBCYXNpY1Byb3BlcnR5LCBVcGRhdGVkUHJvcGVydHksIENhbGN1bGF0ZWRQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eSwgQWN0aXZhYmxlUHJvcGVydHldO1xuXG4gIHJldHVybiBQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFByb3BlcnR5T3duZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1Byb3BlcnR5T3duZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Qcm9wZXJ0eU93bmVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuUHJvcGVydHlPd25lcj1Qcm9wZXJ0eU93bmVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuUHJvcGVydHlPd25lcj1Qcm9wZXJ0eU93bmVyO319fSkoZnVuY3Rpb24oKXtcbnZhciBQcm9wZXJ0eU93bmVyO1xuUHJvcGVydHlPd25lciA9IGNsYXNzIFByb3BlcnR5T3duZXIge1xuICBnZXRQcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMgJiYgdGhpcy5fcHJvcGVydGllcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cbiAgZ2V0UHJvcGVydHlJbnN0YW5jZShuYW1lKSB7XG4gICAgdmFyIHJlcztcbiAgICByZXMgPSB0aGlzLmdldFByb3BlcnR5KG5hbWUpO1xuICAgIGlmIChyZXMpIHtcbiAgICAgIHJldHVybiByZXMuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfVxuICB9XG4gIGdldFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuc2xpY2UoKTtcbiAgfVxuICBnZXRQcm9wZXJ0eUluc3RhbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG4gIGdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuZmlsdGVyKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5pc0luc3RhbnRpYXRlZCh0aGlzKTtcbiAgICB9KS5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG4gIGdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnJlZHVjZSgocmVzLCBwcm9wKSA9PiB7XG4gICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICBpZiAocHJvcC5pc0luc3RhbnRpYXRlZCh0aGlzKSkge1xuICAgICAgICBpbnN0YW5jZSA9IHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5jYWxjdWxhdGVkICYmIGluc3RhbmNlLm1hbnVhbCkge1xuICAgICAgICAgIHJlc1twcm9wLm5hbWVdID0gaW5zdGFuY2UudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSwge30pO1xuICB9XG4gIHNldFByb3BlcnRpZXMoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdmFyIGtleSwgcHJvcCwgdmFsO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHlJbnN0YW5jZShrZXkpO1xuICAgICAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICAgICAgcHJvcC5zZXQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBkZXN0cm95UHJvcGVydGllcygpIHtcbiAgICB0aGlzLmdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5kZXN0cm95KCk7XG4gICAgfSk7XG4gICAgdGhpcy5fcHJvcGVydGllcyA9IFtdO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGxpc3RlbmVyQWRkZWQoZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgaWYgKHByb3AuZ2V0SW5zdGFuY2VUeXBlKCkucHJvdG90eXBlLmNoYW5nZUV2ZW50TmFtZSA9PT0gZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5saXN0ZW5lckFkZGVkID0gdGhpcy5saXN0ZW5lckFkZGVkO1xuICB9XG59O1xucmV0dXJuKFByb3BlcnR5T3duZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Qcm9wZXJ0eU93bmVyLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBBY3RpdmFibGVQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QWN0aXZhYmxlUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1BY3RpdmFibGVQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkFjdGl2YWJsZVByb3BlcnR5PUFjdGl2YWJsZVByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQWN0aXZhYmxlUHJvcGVydHk9QWN0aXZhYmxlUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9CYXNpY1Byb3BlcnR5Jyk7XG52YXIgT3ZlcnJpZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiT3ZlcnJpZGVyXCIpID8gZGVwZW5kZW5jaWVzLk92ZXJyaWRlciA6IHJlcXVpcmUoJy4uL092ZXJyaWRlcicpO1xudmFyIEFjdGl2YWJsZVByb3BlcnR5O1xuQWN0aXZhYmxlUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFjdGl2YWJsZVByb3BlcnR5IGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7XG4gICAgaXNBY3RpdmUoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBtYW51YWxBY3RpdmUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5hY3RpdmU7XG4gICAgfVxuXG4gICAgY2FsbGJhY2tBY3RpdmUoKSB7XG4gICAgICB2YXIgaW52YWxpZGF0b3I7XG4gICAgICBpbnZhbGlkYXRvciA9IHRoaXMuYWN0aXZlSW52YWxpZGF0b3IgfHwgbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcbiAgICAgIGludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5hY3RpdmVGdW5jdCwgaW52YWxpZGF0b3IpO1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSB8fCBpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICBpbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IGludmFsaWRhdG9yO1xuICAgICAgICAgIHRoaXMuYWN0aXZlSW52YWxpZGF0b3IgPSBpbnZhbGlkYXRvcjtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5hY3RpdmUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKEFjdGl2YWJsZVByb3BlcnR5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuYWN0aXZlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5hY3RpdmUgPSBwcm9wLm9wdGlvbnMuYWN0aXZlO1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaXNBY3RpdmUgPSB0aGlzLnByb3RvdHlwZS5tYW51YWxBY3RpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5hY3RpdmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuYWN0aXZlRnVuY3QgPSBwcm9wLm9wdGlvbnMuYWN0aXZlO1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaXNBY3RpdmUgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja0FjdGl2ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEFjdGl2YWJsZVByb3BlcnR5LmV4dGVuZChPdmVycmlkZXIpO1xuXG4gIEFjdGl2YWJsZVByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvdXQ7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICAgIG91dCA9IHRoaXMuZ2V0LndpdGhvdXRBY3RpdmFibGVQcm9wZXJ0eSgpO1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nQ2hhbmdlcykge1xuICAgICAgICAgIHRoaXMuY2hhbmdlZCh0aGlzLnBlbmRpbmdPbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluaXRpYXRlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgfSxcbiAgICBjaGFuZ2VkOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSB2b2lkIDA7XG4gICAgICAgIHRoaXMuY2hhbmdlZC53aXRob3V0QWN0aXZhYmxlUHJvcGVydHkob2xkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSB0cnVlO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGVuZGluZ09sZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEFjdGl2YWJsZVByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oQWN0aXZhYmxlUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0FjdGl2YWJsZVByb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBCYXNpY1Byb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtCYXNpY1Byb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9QmFzaWNQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkJhc2ljUHJvcGVydHk9QmFzaWNQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkJhc2ljUHJvcGVydHk9QmFzaWNQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIE1peGFibGUgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJNaXhhYmxlXCIpID8gZGVwZW5kZW5jaWVzLk1peGFibGUgOiByZXF1aXJlKCcuLi9NaXhhYmxlJyk7XG52YXIgQmFzaWNQcm9wZXJ0eTtcbkJhc2ljUHJvcGVydHkgPSBjbGFzcyBCYXNpY1Byb3BlcnR5IGV4dGVuZHMgTWl4YWJsZSB7XG4gIGNvbnN0cnVjdG9yKHByb3BlcnR5LCBvYmopIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiAgICB0aGlzLm9iaiA9IG9iajtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5nZXN0KHRoaXMuZGVmYXVsdCk7XG4gICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gIH1cblxuICBzZXQodmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0QW5kQ2hlY2tDaGFuZ2VzKHZhbCk7XG4gIH1cblxuICBjYWxsYmFja1NldCh2YWwpIHtcbiAgICB0aGlzLmNhbGxPcHRpb25GdW5jdChcInNldFwiLCB2YWwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0QW5kQ2hlY2tDaGFuZ2VzKHZhbCkge1xuICAgIHZhciBvbGQ7XG4gICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKTtcbiAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHZhbCwgdGhpcy52YWx1ZSkpIHtcbiAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsO1xuICAgICAgdGhpcy5tYW51YWwgPSB0cnVlO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2hlY2tDaGFuZ2VzKHZhbCwgb2xkKSB7XG4gICAgcmV0dXJuIHZhbCAhPT0gb2xkO1xuICB9XG5cbiAgZGVzdHJveSgpIHt9XG5cbiAgY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0LCAuLi5hcmdzKSB7XG4gICAgaWYgKHR5cGVvZiBmdW5jdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGZ1bmN0ID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zW2Z1bmN0XTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBmdW5jdC5vdmVycmlkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFyZ3MucHVzaCgoLi4uYXJncykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsT3B0aW9uRnVuY3QoZnVuY3Qub3ZlcnJpZGVkLCAuLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3QuYXBwbHkodGhpcy5vYmosIGFyZ3MpO1xuICB9XG5cbiAgcmV2YWxpZGF0ZWQoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5pbml0aWF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaW5nZXN0KHZhbCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbCA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaW5nZXN0XCIsIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9XG5cbiAgb3V0cHV0KCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLm91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwib3V0cHV0XCIsIHRoaXMudmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VkKG9sZCkge1xuICAgIHRoaXMuY2FsbENoYW5nZWRGdW5jdGlvbnMob2xkKTtcbiAgICBpZiAodHlwZW9mIHRoaXMub2JqLmVtaXRFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMudXBkYXRlRXZlbnROYW1lLCBbb2xkXSk7XG4gICAgICB0aGlzLm9iai5lbWl0RXZlbnQodGhpcy5jaGFuZ2VFdmVudE5hbWUsIFtvbGRdKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcImNoYW5nZVwiLCBvbGQpO1xuICAgIH1cbiAgfVxuXG4gIGhhc0NoYW5nZWRGdW5jdGlvbnMoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgaGFzQ2hhbmdlZEV2ZW50cygpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMub2JqLmdldExpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLm9iai5nZXRMaXN0ZW5lcnModGhpcy5jaGFuZ2VFdmVudE5hbWUpLmxlbmd0aCA+IDA7XG4gIH1cblxuICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcbiAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBCYXNpY1Byb3BlcnR5IHt9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5zZXQgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja1NldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLnNldCA9IHRoaXMucHJvdG90eXBlLnNldEFuZENoZWNrQ2hhbmdlcztcbiAgICB9XG4gICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmRlZmF1bHQgPSBwcm9wLm9wdGlvbnMuZGVmYXVsdDtcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaW5pdGlhdGVkID0gdHlwZW9mIHByb3Aub3B0aW9ucy5kZWZhdWx0ICE9PSAndW5kZWZpbmVkJztcbiAgICByZXR1cm4gdGhpcy5zZXRFdmVudE5hbWVzKHByb3ApO1xuICB9XG5cbiAgc3RhdGljIHNldEV2ZW50TmFtZXMocHJvcCkge1xuICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jaGFuZ2VFdmVudE5hbWUgPSBwcm9wLm9wdGlvbnMuY2hhbmdlRXZlbnROYW1lIHx8IHByb3AubmFtZSArICdDaGFuZ2VkJztcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUudXBkYXRlRXZlbnROYW1lID0gcHJvcC5vcHRpb25zLnVwZGF0ZUV2ZW50TmFtZSB8fCBwcm9wLm5hbWUgKyAnVXBkYXRlZCc7XG4gICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5pbnZhbGlkYXRlRXZlbnROYW1lID0gcHJvcC5vcHRpb25zLmludmFsaWRhdGVFdmVudE5hbWUgfHwgcHJvcC5uYW1lICsgJ0ludmFsaWRhdGVkJztcbiAgfVxuXG4gIHN0YXRpYyBiaW5kKHRhcmdldCwgcHJvcCkge1xuICAgIHZhciBtYWosIG9wdDtcbiAgICBtYWogPSBwcm9wLm5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLm5hbWUuc2xpY2UoMSk7XG4gICAgb3B0ID0ge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAocHJvcC5vcHRpb25zLnNldCAhPT0gZmFsc2UpIHtcbiAgICAgIG9wdC5zZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuc2V0KHZhbCk7XG4gICAgICB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIG9wdCk7XG4gICAgdGFyZ2V0WydnZXQnICsgbWFqXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgfTtcbiAgICBpZiAocHJvcC5vcHRpb25zLnNldCAhPT0gZmFsc2UpIHtcbiAgICAgIHRhcmdldFsnc2V0JyArIG1hal0gPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5zZXQodmFsKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0WydpbnZhbGlkYXRlJyArIG1hal0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuaW52YWxpZGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfVxuXG59O1xuXG5yZXR1cm4oQmFzaWNQcm9wZXJ0eSk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQ2FsY3VsYXRlZFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDYWxjdWxhdGVkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1DYWxjdWxhdGVkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5DYWxjdWxhdGVkUHJvcGVydHk9Q2FsY3VsYXRlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ2FsY3VsYXRlZFByb3BlcnR5PUNhbGN1bGF0ZWRQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xudmFyIER5bmFtaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkR5bmFtaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5EeW5hbWljUHJvcGVydHkgOiByZXF1aXJlKCcuL0R5bmFtaWNQcm9wZXJ0eScpO1xudmFyIE92ZXJyaWRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk92ZXJyaWRlclwiKSA/IGRlcGVuZGVuY2llcy5PdmVycmlkZXIgOiByZXF1aXJlKCcuLi9PdmVycmlkZXInKTtcbnZhciBDYWxjdWxhdGVkUHJvcGVydHk7XG5DYWxjdWxhdGVkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENhbGN1bGF0ZWRQcm9wZXJ0eSBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7XG4gICAgY2FsY3VsKCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuY2FsY3VsRnVuY3QpO1xuICAgICAgdGhpcy5tYW51YWwgPSBmYWxzZTtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2FsY3VsRnVuY3QgPSBwcm9wLm9wdGlvbnMuY2FsY3VsO1xuICAgICAgICBpZiAoIShwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChDYWxjdWxhdGVkUHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQ2FsY3VsYXRlZFByb3BlcnR5LmV4dGVuZChPdmVycmlkZXIpO1xuXG4gIENhbGN1bGF0ZWRQcm9wZXJ0eS5vdmVycmlkZXMoe1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5pdGlhdGVkLCBvbGQ7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICAgIGluaXRpYXRlZCA9IHRoaXMuaW5pdGlhdGVkO1xuICAgICAgICB0aGlzLmNhbGN1bCgpO1xuICAgICAgICBpZiAodGhpcy5jaGVja0NoYW5nZXModGhpcy52YWx1ZSwgb2xkKSkge1xuICAgICAgICAgIGlmIChpbml0aWF0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub2JqLmVtaXRFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMudXBkYXRlRXZlbnROYW1lLCBbb2xkXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBDYWxjdWxhdGVkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihDYWxjdWxhdGVkUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQ29sbGVjdGlvblByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb2xsZWN0aW9uUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Db2xsZWN0aW9uUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Db2xsZWN0aW9uUHJvcGVydHk9Q29sbGVjdGlvblByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ29sbGVjdGlvblByb3BlcnR5PUNvbGxlY3Rpb25Qcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIER5bmFtaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkR5bmFtaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5EeW5hbWljUHJvcGVydHkgOiByZXF1aXJlKCcuL0R5bmFtaWNQcm9wZXJ0eScpO1xudmFyIENvbGxlY3Rpb24gPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDb2xsZWN0aW9uXCIpID8gZGVwZW5kZW5jaWVzLkNvbGxlY3Rpb24gOiByZXF1aXJlKCcuLi9Db2xsZWN0aW9uJyk7XG52YXIgQ29sbGVjdGlvblByb3BlcnR5O1xuQ29sbGVjdGlvblByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb2xsZWN0aW9uUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xuICAgIGluZ2VzdCh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWwgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcImluZ2VzdFwiLCB2YWwpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbC50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB2YWwudG9BcnJheSgpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFt2YWxdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrQ2hhbmdlZEl0ZW1zKHZhbCwgb2xkKSB7XG4gICAgICB2YXIgY29tcGFyZUZ1bmN0aW9uO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLmNvbXBhcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29tcGFyZUZ1bmN0aW9uID0gdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChuZXcgQ29sbGVjdGlvbih2YWwpKS5jaGVja0NoYW5nZXMob2xkLCB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLm9yZGVyZWQsIGNvbXBhcmVGdW5jdGlvbik7XG4gICAgfVxuXG4gICAgb3V0cHV0KCkge1xuICAgICAgdmFyIGNvbCwgcHJvcCwgdmFsdWU7XG4gICAgICB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByb3AgPSB0aGlzO1xuICAgICAgY29sID0gQ29sbGVjdGlvbi5uZXdTdWJDbGFzcyh0aGlzLmNvbGxlY3Rpb25PcHRpb25zLCB2YWx1ZSk7XG4gICAgICBjb2wuY2hhbmdlZCA9IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICByZXR1cm4gcHJvcC5jaGFuZ2VkKG9sZCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNvbDtcbiAgICB9XG5cbiAgICBjYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLml0ZW1BZGRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgICBpZiAoIW9sZC5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaXRlbUFkZGVkXCIsIGl0ZW0sIGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pdGVtUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvbGQuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy52YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaXRlbVJlbW92ZWRcIiwgaXRlbSwgaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdXBlci5jYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpO1xuICAgIH1cblxuICAgIGhhc0NoYW5nZWRGdW5jdGlvbnMoKSB7XG4gICAgICByZXR1cm4gc3VwZXIuaGFzQ2hhbmdlZEZ1bmN0aW9ucygpIHx8IHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaXRlbUFkZGVkID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaXRlbVJlbW92ZWQgPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIENvbGxlY3Rpb25Qcm9wZXJ0eSB7fTtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNvbGxlY3Rpb25PcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0Q29sbGVjdGlvbk9wdGlvbnMsIHR5cGVvZiBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ29iamVjdCcgPyBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA6IHt9KTtcbiAgICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uLmNvbXBhcmUgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2hlY2tDaGFuZ2VzID0gdGhpcy5wcm90b3R5cGUuY2hlY2tDaGFuZ2VkSXRlbXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDb2xsZWN0aW9uUHJvcGVydHkuZGVmYXVsdENvbGxlY3Rpb25PcHRpb25zID0ge1xuICAgIGNvbXBhcmU6IGZhbHNlLFxuICAgIG9yZGVyZWQ6IHRydWVcbiAgfTtcblxuICByZXR1cm4gQ29sbGVjdGlvblByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oQ29sbGVjdGlvblByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENvbXBvc2VkUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0NvbXBvc2VkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Db21wb3NlZFByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ29tcG9zZWRQcm9wZXJ0eT1Db21wb3NlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ29tcG9zZWRQcm9wZXJ0eT1Db21wb3NlZFByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQ2FsY3VsYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ2FsY3VsYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkNhbGN1bGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgQ29sbGVjdGlvbiA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbGxlY3Rpb25cIikgPyBkZXBlbmRlbmNpZXMuQ29sbGVjdGlvbiA6IHJlcXVpcmUoJy4uL0NvbGxlY3Rpb24nKTtcbnZhciBDb21wb3NlZFByb3BlcnR5O1xuQ29tcG9zZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29tcG9zZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgaW5pdCgpIHtcbiAgICAgIHN1cGVyLmluaXQoKTtcbiAgICAgIHJldHVybiB0aGlzLmluaXRDb21wb3NlZCgpO1xuICAgIH1cblxuICAgIGluaXRDb21wb3NlZCgpIHtcbiAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2RlZmF1bHQnKSkge1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVmYXVsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdCA9IHRoaXMudmFsdWUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5tZW1iZXJzID0gbmV3IENvbXBvc2VkUHJvcGVydHkuTWVtYmVycyh0aGlzLnByb3BlcnR5Lm9wdGlvbnMubWVtYmVycyk7XG4gICAgICB0aGlzLm1lbWJlcnMuY2hhbmdlZCA9IChvbGQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLmpvaW4gPSB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkID09PSAnZnVuY3Rpb24nID8gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkIDogdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlZmF1bHQgPT09IGZhbHNlID8gQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zLm9yIDogQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zLmFuZDtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLm9iaik7XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm1lbWJlcnMucmVkdWNlKChwcmV2LCBtZW1iZXIpID0+IHtcbiAgICAgICAgICB2YXIgdmFsO1xuICAgICAgICAgIHZhbCA9IHR5cGVvZiBtZW1iZXIgPT09ICdmdW5jdGlvbicgPyBtZW1iZXIodGhpcy5pbnZhbGlkYXRvcikgOiBtZW1iZXI7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuam9pbihwcmV2LCB2YWwpO1xuICAgICAgICB9LCB0aGlzLmRlZmF1bHQpO1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5vcHRpb25zLmNvbXBvc2VkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBDb21wb3NlZFByb3BlcnR5IHt9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBiaW5kKHRhcmdldCwgcHJvcCkge1xuICAgICAgQ2FsY3VsYXRlZFByb3BlcnR5LmJpbmQodGFyZ2V0LCBwcm9wKTtcbiAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUgKyAnTWVtYmVycycsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLm1lbWJlcnM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucyA9IHtcbiAgICBhbmQ6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhICYmIGI7XG4gICAgfSxcbiAgICBvcjogZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEgfHwgYjtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvbXBvc2VkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbkNvbXBvc2VkUHJvcGVydHkuTWVtYmVycyA9IGNsYXNzIE1lbWJlcnMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgYWRkUHJvcGVydHlSZWYobmFtZSwgb2JqKSB7XG4gICAgdmFyIGZuO1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopID09PSAtMSkge1xuICAgICAgZm4gPSBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChuYW1lLCBvYmopO1xuICAgICAgfTtcbiAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmpcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBhZGRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbjtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLnB1c2goZm4pO1xuICAgIH1cbiAgfVxuXG4gIHNldFZhbHVlUmVmKHZhbCwgbmFtZSwgb2JqKSB7XG4gICAgdmFyIGZuLCBpLCByZWY7XG4gICAgaSA9IHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaik7XG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldChpKS5yZWYudmFsICE9PSB2YWwpIHtcbiAgICAgIHJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmosXG4gICAgICAgIHZhbDogdmFsXG4gICAgICB9O1xuICAgICAgZm4gPSBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfTtcbiAgICAgIGZuLnJlZiA9IHJlZjtcbiAgICAgIHJldHVybiB0aGlzLnNldChpLCBmbik7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmFsdWVSZWYobmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEJ5UmVmKG5hbWUsIG9iaikucmVmLnZhbDtcbiAgfVxuXG4gIGFkZEZ1bmN0aW9uUmVmKGZuLCBuYW1lLCBvYmopIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmpcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBmaW5kQnlSZWYobmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W3RoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaildO1xuICB9XG5cbiAgZmluZFJlZkluZGV4KG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maW5kSW5kZXgoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICByZXR1cm4gKG1lbWJlci5yZWYgIT0gbnVsbCkgJiYgbWVtYmVyLnJlZi5vYmogPT09IG9iaiAmJiBtZW1iZXIucmVmLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVSZWYobmFtZSwgb2JqKSB7XG4gICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgaW5kZXggPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICB9XG4gIH1cblxufTtcblxucmV0dXJuKENvbXBvc2VkUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIER5bmFtaWNQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7RHluYW1pY1Byb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RHluYW1pY1Byb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRHluYW1pY1Byb3BlcnR5PUR5bmFtaWNQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkR5bmFtaWNQcm9wZXJ0eT1EeW5hbWljUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9CYXNpY1Byb3BlcnR5Jyk7XG52YXIgRHluYW1pY1Byb3BlcnR5O1xuRHluYW1pY1Byb3BlcnR5ID0gY2xhc3MgRHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7XG4gIGNhbGxiYWNrR2V0KCkge1xuICAgIHZhciByZXM7XG4gICAgcmVzID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJnZXRcIik7XG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfaW52YWxpZGF0ZU5vdGljZSgpIHtcbiAgICBpZiAodGhpcy5pc0ltbWVkaWF0ZSgpKSB7XG4gICAgICB0aGlzLmdldCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub2JqLmVtaXRFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLm9iai5lbWl0RXZlbnQodGhpcy5pbnZhbGlkYXRlRXZlbnROYW1lKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlzSW1tZWRpYXRlKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaW1tZWRpYXRlICE9PSBmYWxzZSAmJiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmltbWVkaWF0ZSA9PT0gdHJ1ZSB8fCAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgPyB0aGlzLmNhbGxPcHRpb25GdW5jdChcImltbWVkaWF0ZVwiKSA6IHRoaXMuaGFzQ2hhbmdlZEV2ZW50cygpIHx8IHRoaXMuaGFzQ2hhbmdlZEZ1bmN0aW9ucygpKSk7XG4gIH1cblxuICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBwcm9wLm9wdGlvbnMuY2FsY3VsID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBwcm9wLm9wdGlvbnMuYWN0aXZlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAocHJvcC5pbnN0YW5jZVR5cGUgPT0gbnVsbCkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHt9O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuZ2V0ID0gdGhpcy5wcm90b3R5cGUuY2FsbGJhY2tHZXQ7XG4gICAgfVxuICB9XG5cbn07XG5cbnJldHVybihEeW5hbWljUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgSW52YWxpZGF0ZWRQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7SW52YWxpZGF0ZWRQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUludmFsaWRhdGVkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5JbnZhbGlkYXRlZFByb3BlcnR5PUludmFsaWRhdGVkUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5JbnZhbGlkYXRlZFByb3BlcnR5PUludmFsaWRhdGVkUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBDYWxjdWxhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDYWxjdWxhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ2FsY3VsYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9DYWxjdWxhdGVkUHJvcGVydHknKTtcbnZhciBJbnZhbGlkYXRlZFByb3BlcnR5O1xuSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgSW52YWxpZGF0ZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgdW5rbm93bigpIHtcbiAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChJbnZhbGlkYXRlZFByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBJbnZhbGlkYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuY2FsY3VsRnVuY3QsIGludmFsaWRhdG9yKTtcbiAgICAgICAgdGhpcy5tYW51YWwgPSBmYWxzZTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGVzdHJveS53aXRob3V0SW52YWxpZGF0ZWRQcm9wZXJ0eSgpO1xuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGludmFsaWRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuY2FsY3VsYXRlZCB8fCB0aGlzLmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCkgJiYgIXRoaXMuY2FsY3VsYXRlZCAmJiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEludmFsaWRhdGVkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihJbnZhbGlkYXRlZFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBVcGRhdGVkUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1VwZGF0ZWRQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVVwZGF0ZWRQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLlVwZGF0ZWRQcm9wZXJ0eT1VcGRhdGVkUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5VcGRhdGVkUHJvcGVydHk9VXBkYXRlZFByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XG52YXIgT3ZlcnJpZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiT3ZlcnJpZGVyXCIpID8gZGVwZW5kZW5jaWVzLk92ZXJyaWRlciA6IHJlcXVpcmUoJy4uL092ZXJyaWRlcicpO1xudmFyIFVwZGF0ZWRQcm9wZXJ0eTtcblVwZGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVXBkYXRlZFByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBpbml0UmV2YWxpZGF0ZSgpIHtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5nZXQoKTtcbiAgICAgICAgdGhpcy5nZXRVcGRhdGVyKCkudW5iaW5kKCk7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VkKHRoaXMucGVuZGluZ09sZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5yZXZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzO1xuICAgIH1cblxuICAgIGdldFVwZGF0ZXIoKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMudXBkYXRlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcGVydHkub3B0aW9ucy51cGRhdGVyICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZXIgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnMudXBkYXRlcjtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMudXBkYXRlci5nZXRCaW5kZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlciA9IHRoaXMudXBkYXRlci5nZXRCaW5kZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZXIuYmluZCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdGhpcy51cGRhdGVyLnVuYmluZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVyID0gbnVsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVyLmNhbGxiYWNrID0gdGhpcy5yZXZhbGlkYXRlQ2FsbGJhY2s7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudXBkYXRlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZXI7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy51cGRhdGVyICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChVcGRhdGVkUHJvcGVydHkpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFVwZGF0ZWRQcm9wZXJ0eS5leHRlbmQoT3ZlcnJpZGVyKTtcblxuICBVcGRhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaW5pdC53aXRob3V0VXBkYXRlZFByb3BlcnR5KCk7XG4gICAgICByZXR1cm4gdGhpcy5pbml0UmV2YWxpZGF0ZSgpO1xuICAgIH0sXG4gICAgX2ludmFsaWRhdGVOb3RpY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlcztcbiAgICAgIHJlcyA9IHRoaXMuX2ludmFsaWRhdGVOb3RpY2Uud2l0aG91dFVwZGF0ZWRQcm9wZXJ0eSgpO1xuICAgICAgaWYgKHJlcykge1xuICAgICAgICB0aGlzLmdldFVwZGF0ZXIoKS5iaW5kKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgaXNJbW1lZGlhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgY2hhbmdlZDogZnVuY3Rpb24ob2xkKSB7XG4gICAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGVuZGluZ09sZCA9IHZvaWQgMDtcbiAgICAgICAgdGhpcy5jaGFuZ2VkLndpdGhvdXRVcGRhdGVkUHJvcGVydHkob2xkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSB0cnVlO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGVuZGluZ09sZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRVcGRhdGVyKCkuYmluZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVXBkYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oVXBkYXRlZFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9VcGRhdGVkUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFVwZGF0ZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1VwZGF0ZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1VcGRhdGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuVXBkYXRlcj1VcGRhdGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuVXBkYXRlcj1VcGRhdGVyO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmluZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmluZGVyXCIpID8gZGVwZW5kZW5jaWVzLkJpbmRlciA6IHJlcXVpcmUoJy4vQmluZGVyJyk7XG52YXIgVXBkYXRlcjtcblVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5uZXh0O1xuICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcy5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAodGhpcy51cGRhdGluZyAmJiAhdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBuZXh0VGljayhjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICBpZiAoIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gdGhpcy5jYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLm5leHQuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGdldEJpbmRlcigpIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZXIuQmluZGVyKHRoaXMpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIHJldHVybiB0aGlzLm5leHQgPSBbXTtcbiAgfVxuXG59O1xuXG5VcGRhdGVyLkJpbmRlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGNsYXNzIEJpbmRlciBleHRlbmRzIHN1cGVyQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHRhcmdldCwgY2FsbGJhY2sxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sxO1xuICAgIH1cblxuICAgIGdldFJlZigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRvQmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBkb1VuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gQmluZGVyO1xuXG59KS5jYWxsKHRoaXMsIEJpbmRlcik7XG5cbnJldHVybihVcGRhdGVyKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVXBkYXRlci5qcy5tYXBcbiIsImlmKG1vZHVsZSl7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEJpbmRlcjogcmVxdWlyZSgnLi9CaW5kZXIuanMnKSxcbiAgICBDb2xsZWN0aW9uOiByZXF1aXJlKCcuL0NvbGxlY3Rpb24uanMnKSxcbiAgICBFbGVtZW50OiByZXF1aXJlKCcuL0VsZW1lbnQuanMnKSxcbiAgICBFdmVudEJpbmQ6IHJlcXVpcmUoJy4vRXZlbnRCaW5kLmpzJyksXG4gICAgRXZlbnRFbWl0dGVyOiByZXF1aXJlKCcuL0V2ZW50RW1pdHRlci5qcycpLFxuICAgIEludmFsaWRhdG9yOiByZXF1aXJlKCcuL0ludmFsaWRhdG9yLmpzJyksXG4gICAgTWl4YWJsZTogcmVxdWlyZSgnLi9NaXhhYmxlLmpzJyksXG4gICAgT3ZlcnJpZGVyOiByZXF1aXJlKCcuL092ZXJyaWRlci5qcycpLFxuICAgIFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5LmpzJyksXG4gICAgUHJvcGVydHlPd25lcjogcmVxdWlyZSgnLi9Qcm9wZXJ0eU93bmVyLmpzJyksXG4gICAgVXBkYXRlcjogcmVxdWlyZSgnLi9VcGRhdGVyLmpzJyksXG4gICAgQWN0aXZhYmxlUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9BY3RpdmFibGVQcm9wZXJ0eS5qcycpLFxuICAgIEJhc2ljUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzJyksXG4gICAgQ2FsY3VsYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzJyksXG4gICAgQ29sbGVjdGlvblByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzJyksXG4gICAgQ29tcG9zZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMnKSxcbiAgICBEeW5hbWljUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHkuanMnKSxcbiAgICBJbnZhbGlkYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcycpLFxuICAgIFVwZGF0ZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eS5qcycpXG4gIH07XG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBQYXRoRmluZGVyPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtQYXRoRmluZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9UGF0aEZpbmRlcjt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBQYXRoRmluZGVyO1xuUGF0aEZpbmRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGF0aEZpbmRlciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzQ29udGFpbmVyLCBmcm9tMSwgdG8xLCBvcHRpb25zID0ge30pIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRpbGVzQ29udGFpbmVyID0gdGlsZXNDb250YWluZXI7XG4gICAgICB0aGlzLmZyb20gPSBmcm9tMTtcbiAgICAgIHRoaXMudG8gPSB0bzE7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICBpZiAob3B0aW9ucy52YWxpZFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnZhbGlkVGlsZUNhbGxiYWNrID0gb3B0aW9ucy52YWxpZFRpbGU7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5hcnJpdmVkICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hcnJpdmVkQ2FsbGJhY2sgPSBvcHRpb25zLmFycml2ZWQ7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5lZmZpY2llbmN5ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5Q2FsbGJhY2sgPSBvcHRpb25zLmVmZmljaWVuY3k7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICB0aGlzLnBhdGhzID0ge307XG4gICAgICB0aGlzLnNvbHV0aW9uID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICB3aGlsZSAoIXRoaXMuc29sdXRpb24gJiYgKCF0aGlzLnN0YXJ0ZWQgfHwgdGhpcy5xdWV1ZS5sZW5ndGgpKSB7XG4gICAgICAgIHRoaXMuc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0aCgpO1xuICAgIH1cblxuICAgIHN0ZXAoKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wb3AoKTtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMobmV4dCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMudG8gPT09IGZhbHNlIHx8IHRoaXMudGlsZUlzVmFsaWQodGhpcy50bykpIHtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UGF0aCgpIHtcbiAgICAgIHZhciByZXMsIHN0ZXA7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICByZXMgPSBbdGhpcy5zb2x1dGlvbl07XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICByZXMudW5zaGlmdChzdGVwLnByZXYpO1xuICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb3NBdFByYyhwcmMpIHtcbiAgICAgIGlmIChpc05hTihwcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFBvc0F0VGltZSh0aGlzLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKCkgKiBwcmMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc0F0VGltZSh0aW1lKSB7XG4gICAgICB2YXIgcHJjLCBzdGVwO1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgaWYgKHRpbWUgPj0gdGhpcy5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc29sdXRpb24ucG9zVG9UaWxlT2Zmc2V0KHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLngsIHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICAgIHdoaWxlIChzdGVwLmdldFN0YXJ0TGVuZ3RoKCkgPiB0aW1lICYmIChzdGVwLnByZXYgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByYyA9ICh0aW1lIC0gc3RlcC5nZXRTdGFydExlbmd0aCgpKSAvIHN0ZXAuZ2V0TGVuZ3RoKCk7XG4gICAgICAgICAgcmV0dXJuIHN0ZXAucG9zVG9UaWxlT2Zmc2V0KHN0ZXAuZ2V0RW50cnkoKS54ICsgKHN0ZXAuZ2V0RXhpdCgpLnggLSBzdGVwLmdldEVudHJ5KCkueCkgKiBwcmMsIHN0ZXAuZ2V0RW50cnkoKS55ICsgKHN0ZXAuZ2V0RXhpdCgpLnkgLSBzdGVwLmdldEVudHJ5KCkueSkgKiBwcmMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U29sdXRpb25UaWxlTGlzdCgpIHtcbiAgICAgIHZhciBzdGVwLCB0aWxlbGlzdDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB0aWxlbGlzdCA9IFtzdGVwLnRpbGVdO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICAgIHRpbGVsaXN0LnVuc2hpZnQoc3RlcC50aWxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZWxpc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGlsZUlzVmFsaWQodGlsZSkge1xuICAgICAgaWYgKHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZFRpbGVDYWxsYmFjayh0aWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodGlsZSAhPSBudWxsKSAmJiAoIXRpbGUuZW11bGF0ZWQgfHwgKHRpbGUudGlsZSAhPT0gMCAmJiB0aWxlLnRpbGUgIT09IGZhbHNlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmMTtcbiAgICAgIGlmICh0aGlzLnRpbGVzQ29udGFpbmVyLmdldFRpbGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc0NvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgfSBlbHNlIGlmICgoKHJlZjEgPSB0aGlzLnRpbGVzQ29udGFpbmVyW3ldKSAhPSBudWxsID8gcmVmMVt4XSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgeTogeSxcbiAgICAgICAgICB0aWxlOiB0aGlzLnRpbGVzQ29udGFpbmVyW3ldW3hdLFxuICAgICAgICAgIGVtdWxhdGVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0Q29ubmVjdGVkVG9UaWxlKHRpbGUpIHtcbiAgICAgIHZhciBjb25uZWN0ZWQsIHQ7XG4gICAgICBpZiAodGlsZS5nZXRDb25uZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGlsZS5nZXRDb25uZWN0ZWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbm5lY3RlZCA9IFtdO1xuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLnggKyAxLCB0aWxlLnkpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54IC0gMSwgdGlsZS55KSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCwgdGlsZS55ICsgMSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLngsIHRpbGUueSAtIDEpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbm5lY3RlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGROZXh0U3RlcHMoc3RlcCA9IG51bGwpIHtcbiAgICAgIHZhciBpLCBsZW4sIG5leHQsIHJlZjEsIHJlc3VsdHMsIHRpbGU7XG4gICAgICB0aWxlID0gc3RlcCAhPSBudWxsID8gc3RlcC5uZXh0VGlsZSA6IHRoaXMuZnJvbTtcbiAgICAgIHJlZjEgPSB0aGlzLmdldENvbm5lY3RlZFRvVGlsZSh0aWxlKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZjEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgbmV4dCA9IHJlZjFbaV07XG4gICAgICAgIGlmICh0aGlzLnRpbGVJc1ZhbGlkKG5leHQpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYWRkU3RlcChuZXcgUGF0aEZpbmRlci5TdGVwKHRoaXMsIChzdGVwICE9IG51bGwgPyBzdGVwIDogbnVsbCksIHRpbGUsIG5leHQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIHRpbGVFcXVhbCh0aWxlQSwgdGlsZUIpIHtcbiAgICAgIHJldHVybiB0aWxlQSA9PT0gdGlsZUIgfHwgKCh0aWxlQS5lbXVsYXRlZCB8fCB0aWxlQi5lbXVsYXRlZCkgJiYgdGlsZUEueCA9PT0gdGlsZUIueCAmJiB0aWxlQS55ID09PSB0aWxlQi55KTtcbiAgICB9XG5cbiAgICBhcnJpdmVkQXREZXN0aW5hdGlvbihzdGVwKSB7XG4gICAgICBpZiAodGhpcy5hcnJpdmVkQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcnJpdmVkQ2FsbGJhY2soc3RlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlRXF1YWwoc3RlcC50aWxlLCB0aGlzLnRvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBzb2x1dGlvbkNhbmRpZGF0ZTtcbiAgICAgIGlmICh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XSA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKCEoKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkgJiYgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XS5nZXRUb3RhbExlbmd0aCgpIDw9IHN0ZXAuZ2V0VG90YWxMZW5ndGgoKSkpIHtcbiAgICAgICAgaWYgKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlU3RlcCh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldID0gc3RlcDtcbiAgICAgICAgdGhpcy5xdWV1ZS5zcGxpY2UodGhpcy5nZXRTdGVwUmFuayhzdGVwKSwgMCwgc3RlcCk7XG4gICAgICAgIHNvbHV0aW9uQ2FuZGlkYXRlID0gbmV3IFBhdGhGaW5kZXIuU3RlcCh0aGlzLCBzdGVwLCBzdGVwLm5leHRUaWxlLCBudWxsKTtcbiAgICAgICAgaWYgKHRoaXMuYXJyaXZlZEF0RGVzdGluYXRpb24oc29sdXRpb25DYW5kaWRhdGUpICYmICEoKHRoaXMuc29sdXRpb24gIT0gbnVsbCkgJiYgdGhpcy5zb2x1dGlvbi5wcmV2LmdldFRvdGFsTGVuZ3RoKCkgPD0gc3RlcC5nZXRUb3RhbExlbmd0aCgpKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNvbHV0aW9uID0gc29sdXRpb25DYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5xdWV1ZS5pbmRleE9mKHN0ZXApO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBiZXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5xdWV1ZS5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBnZXRTdGVwUmFuayhzdGVwKSB7XG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoc3RlcC5nZXRFZmZpY2llbmN5KCksIDAsIHRoaXMucXVldWUubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgbWF4KSB7XG4gICAgICB2YXIgcmVmLCByZWZQb3M7XG4gICAgICByZWZQb3MgPSBNYXRoLmZsb29yKChtYXggLSBtaW4pIC8gMikgKyBtaW47XG4gICAgICByZWYgPSB0aGlzLnF1ZXVlW3JlZlBvc10uZ2V0RWZmaWNpZW5jeSgpO1xuICAgICAgaWYgKHJlZiA9PT0gZWZmaWNpZW5jeSkge1xuICAgICAgICByZXR1cm4gcmVmUG9zO1xuICAgICAgfSBlbHNlIGlmIChyZWYgPiBlZmZpY2llbmN5KSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1pbikge1xuICAgICAgICAgIHJldHVybiBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgcmVmUG9zIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1heCkge1xuICAgICAgICAgIHJldHVybiBtYXggKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCByZWZQb3MgKyAxLCBtYXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aEZpbmRlci5wcm9wZXJ0aWVzKHtcbiAgICB2YWxpZFRpbGVDYWxsYmFjazoge31cbiAgfSk7XG5cbiAgcmV0dXJuIFBhdGhGaW5kZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cblBhdGhGaW5kZXIuU3RlcCA9IGNsYXNzIFN0ZXAge1xuICBjb25zdHJ1Y3RvcihwYXRoRmluZGVyLCBwcmV2LCB0aWxlMSwgbmV4dFRpbGUpIHtcbiAgICB0aGlzLnBhdGhGaW5kZXIgPSBwYXRoRmluZGVyO1xuICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgdGhpcy50aWxlID0gdGlsZTE7XG4gICAgdGhpcy5uZXh0VGlsZSA9IG5leHRUaWxlO1xuICB9XG5cbiAgcG9zVG9UaWxlT2Zmc2V0KHgsIHkpIHtcbiAgICB2YXIgdGlsZTtcbiAgICB0aWxlID0gTWF0aC5mbG9vcih4KSA9PT0gdGhpcy50aWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy50aWxlLnkgPyB0aGlzLnRpbGUgOiAodGhpcy5uZXh0VGlsZSAhPSBudWxsKSAmJiBNYXRoLmZsb29yKHgpID09PSB0aGlzLm5leHRUaWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy5uZXh0VGlsZS55ID8gdGhpcy5uZXh0VGlsZSA6ICh0aGlzLnByZXYgIT0gbnVsbCkgJiYgTWF0aC5mbG9vcih4KSA9PT0gdGhpcy5wcmV2LnRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLnByZXYudGlsZS55ID8gdGhpcy5wcmV2LnRpbGUgOiBjb25zb2xlLmxvZygnTWF0aC5mbG9vcignICsgeCArICcpID09ICcgKyB0aGlzLnRpbGUueCwgJ01hdGguZmxvb3IoJyArIHkgKyAnKSA9PSAnICsgdGhpcy50aWxlLnksIHRoaXMpO1xuICAgIHJldHVybiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICBvZmZzZXRYOiB4IC0gdGlsZS54LFxuICAgICAgb2Zmc2V0WTogeSAtIHRpbGUueVxuICAgIH07XG4gIH1cblxuICBnZXRFeGl0KCkge1xuICAgIGlmICh0aGlzLmV4aXQgPT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMubmV4dFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmV4aXQgPSB7XG4gICAgICAgICAgeDogKHRoaXMudGlsZS54ICsgdGhpcy5uZXh0VGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMubmV4dFRpbGUueSArIDEpIC8gMlxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5leGl0ID0ge1xuICAgICAgICAgIHg6IHRoaXMudGlsZS54ICsgMC41LFxuICAgICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4aXQ7XG4gIH1cblxuICBnZXRFbnRyeSgpIHtcbiAgICBpZiAodGhpcy5lbnRyeSA9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lbnRyeSA9IHtcbiAgICAgICAgICB4OiAodGhpcy50aWxlLnggKyB0aGlzLnByZXYudGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMucHJldi50aWxlLnkgKyAxKSAvIDJcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZW50cnkgPSB7XG4gICAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUsXG4gICAgICAgICAgeTogdGhpcy50aWxlLnkgKyAwLjVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW50cnk7XG4gIH1cblxuICBnZXRMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gKHRoaXMubmV4dFRpbGUgPT0gbnVsbCkgfHwgKHRoaXMucHJldiA9PSBudWxsKSA/IDAuNSA6IHRoaXMucHJldi50aWxlLnggPT09IHRoaXMubmV4dFRpbGUueCB8fCB0aGlzLnByZXYudGlsZS55ID09PSB0aGlzLm5leHRUaWxlLnkgPyAxIDogTWF0aC5zcXJ0KDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxlbmd0aDtcbiAgfVxuXG4gIGdldFN0YXJ0TGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLnN0YXJ0TGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhcnRMZW5ndGggPSB0aGlzLnByZXYgIT0gbnVsbCA/IHRoaXMucHJldi5nZXRUb3RhbExlbmd0aCgpIDogMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRMZW5ndGg7XG4gIH1cblxuICBnZXRUb3RhbExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy50b3RhbExlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnRvdGFsTGVuZ3RoID0gdGhpcy5nZXRTdGFydExlbmd0aCgpICsgdGhpcy5nZXRMZW5ndGgoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG90YWxMZW5ndGg7XG4gIH1cblxuICBnZXRFZmZpY2llbmN5KCkge1xuICAgIGlmICh0aGlzLmVmZmljaWVuY3kgPT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhdGhGaW5kZXIuZWZmaWNpZW5jeUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5ID0gdGhpcy5wYXRoRmluZGVyLmVmZmljaWVuY3lDYWxsYmFjayh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeSA9IC10aGlzLmdldFJlbWFpbmluZygpICogMS4xIC0gdGhpcy5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lZmZpY2llbmN5O1xuICB9XG5cbiAgZ2V0UmVtYWluaW5nKCkge1xuICAgIHZhciBmcm9tLCB0bywgeCwgeTtcbiAgICBpZiAodGhpcy5yZW1haW5pbmcgPT0gbnVsbCkge1xuICAgICAgZnJvbSA9IHRoaXMuZ2V0RXhpdCgpO1xuICAgICAgdG8gPSB7XG4gICAgICAgIHg6IHRoaXMucGF0aEZpbmRlci50by54ICsgMC41LFxuICAgICAgICB5OiB0aGlzLnBhdGhGaW5kZXIudG8ueSArIDAuNVxuICAgICAgfTtcbiAgICAgIHggPSB0by54IC0gZnJvbS54O1xuICAgICAgeSA9IHRvLnkgLSBmcm9tLnk7XG4gICAgICB0aGlzLnJlbWFpbmluZyA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVtYWluaW5nO1xuICB9XG5cbn07XG5cbnJldHVybihQYXRoRmluZGVyKTt9KTsiLCJpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICBncmVla0FscGhhYmV0OiByZXF1aXJlKCcuL3N0cmluZ3MvZ3JlZWtBbHBoYWJldCcpLFxuICAgICAgc3Rhck5hbWVzOiByZXF1aXJlKCcuL3N0cmluZ3Mvc3Rhck5hbWVzJylcbiAgfTtcbn0iLCJtb2R1bGUuZXhwb3J0cz1bXG5cImFscGhhXCIsICAgXCJiZXRhXCIsICAgIFwiZ2FtbWFcIiwgICBcImRlbHRhXCIsXG5cImVwc2lsb25cIiwgXCJ6ZXRhXCIsICAgIFwiZXRhXCIsICAgICBcInRoZXRhXCIsXG5cImlvdGFcIiwgICAgXCJrYXBwYVwiLCAgIFwibGFtYmRhXCIsICBcIm11XCIsXG5cIm51XCIsICAgICAgXCJ4aVwiLCAgICAgIFwib21pY3JvblwiLCBcInBpXCIsXHRcblwicmhvXCIsICAgICBcInNpZ21hXCIsICAgXCJ0YXVcIiwgICAgIFwidXBzaWxvblwiLFxuXCJwaGlcIiwgICAgIFwiY2hpXCIsICAgICBcInBzaVwiLCAgICAgXCJvbWVnYVwiXG5dIiwibW9kdWxlLmV4cG9ydHM9W1xuXCJBY2hlcm5hclwiLCAgICAgXCJNYWlhXCIsICAgICAgICBcIkF0bGFzXCIsICAgICAgICBcIlNhbG1cIiwgICAgICAgXCJBbG5pbGFtXCIsICAgICAgXCJOZWtrYXJcIiwgICAgICBcIkVsbmF0aFwiLCAgICAgICBcIlRodWJhblwiLFxuXCJBY2hpcmRcIiwgICAgICAgXCJNYXJmaWtcIiwgICAgICBcIkF1dmFcIiwgICAgICAgICBcIlNhcmdhc1wiLCAgICAgXCJBbG5pdGFrXCIsICAgICAgXCJOaWhhbFwiLCAgICAgICBcIkVuaWZcIiwgICAgICAgICBcIlRvcmN1bGFyaXNcIixcblwiQWNydXhcIiwgICAgICAgIFwiTWFya2FiXCIsICAgICAgXCJBdmlvclwiLCAgICAgICAgXCJTYXJpblwiLCAgICAgIFwiQWxwaGFyZFwiLCAgICAgIFwiTnVua2lcIiwgICAgICAgXCJFdGFtaW5cIiwgICAgICAgXCJUdXJhaXNcIixcblwiQWN1YmVuc1wiLCAgICAgIFwiTWF0YXJcIiwgICAgICAgXCJBemVsZmFmYWdlXCIsICAgXCJTY2VwdHJ1bVwiLCAgIFwiQWxwaGVra2FcIiwgICAgIFwiTnVzYWthblwiLCAgICAgXCJGb21hbGhhdXRcIiwgICAgXCJUeWxcIixcblwiQWRhcmFcIiwgICAgICAgIFwiTWVic3V0YVwiLCAgICAgXCJBemhhXCIsICAgICAgICAgXCJTY2hlYXRcIiwgICAgIFwiQWxwaGVyYXR6XCIsICAgIFwiUGVhY29ja1wiLCAgICAgXCJGb3JuYWNpc1wiLCAgICAgXCJVbnVrYWxoYWlcIixcblwiQWRoYWZlcmFcIiwgICAgIFwiTWVncmV6XCIsICAgICAgXCJBem1pZGlza2VcIiwgICAgXCJTZWdpblwiLCAgICAgIFwiQWxyYWlcIiwgICAgICAgIFwiUGhhZFwiLCAgICAgICAgXCJGdXJ1ZFwiLCAgICAgICAgXCJWZWdhXCIsXG5cIkFkaGlsXCIsICAgICAgICBcIk1laXNzYVwiLCAgICAgIFwiQmFoYW1cIiwgICAgICAgIFwiU2VnaW51c1wiLCAgICBcIkFscmlzaGFcIiwgICAgICBcIlBoYWV0XCIsICAgICAgIFwiR2FjcnV4XCIsICAgICAgIFwiVmluZGVtaWF0cml4XCIsXG5cIkFnZW5hXCIsICAgICAgICBcIk1la2J1ZGFcIiwgICAgIFwiQmVjcnV4XCIsICAgICAgIFwiU2hhbVwiLCAgICAgICBcIkFsc2FmaVwiLCAgICAgICBcIlBoZXJrYWRcIiwgICAgIFwiR2lhbmZhclwiLCAgICAgIFwiV2FzYXRcIixcblwiQWxhZGZhclwiLCAgICAgIFwiTWVua2FsaW5hblwiLCAgXCJCZWlkXCIsICAgICAgICAgXCJTaGFyYXRhblwiLCAgIFwiQWxzY2lhdWthdFwiLCAgIFwiUGxlaW9uZVwiLCAgICAgXCJHb21laXNhXCIsICAgICAgXCJXZXplblwiLFxuXCJBbGF0aGZhclwiLCAgICAgXCJNZW5rYXJcIiwgICAgICBcIkJlbGxhdHJpeFwiLCAgICBcIlNoYXVsYVwiLCAgICAgXCJBbHNoYWluXCIsICAgICAgXCJQb2xhcmlzXCIsICAgICBcIkdyYWZmaWFzXCIsICAgICBcIldlem5cIixcblwiQWxiYWxkYWhcIiwgICAgIFwiTWVua2VudFwiLCAgICAgXCJCZXRlbGdldXNlXCIsICAgXCJTaGVkaXJcIiwgICAgIFwiQWxzaGF0XCIsICAgICAgIFwiUG9sbHV4XCIsICAgICAgXCJHcmFmaWFzXCIsICAgICAgXCJZZWRcIixcblwiQWxiYWxpXCIsICAgICAgIFwiTWVua2liXCIsICAgICAgXCJCb3RlaW5cIiwgICAgICAgXCJTaGVsaWFrXCIsICAgIFwiQWxzdWhhaWxcIiwgICAgIFwiUG9ycmltYVwiLCAgICAgXCJHcnVtaXVtXCIsICAgICAgXCJZaWxkdW5cIixcblwiQWxiaXJlb1wiLCAgICAgIFwiTWVyYWtcIiwgICAgICAgXCJCcmFjaGl1bVwiLCAgICAgXCJTaXJpdXNcIiwgICAgIFwiQWx0YWlyXCIsICAgICAgIFwiUHJhZWNpcHVhXCIsICAgXCJIYWRhclwiLCAgICAgICAgXCJaYW5pYWhcIixcblwiQWxjaGliYVwiLCAgICAgIFwiTWVyZ2FcIiwgICAgICAgXCJDYW5vcHVzXCIsICAgICAgXCJTaXR1bGFcIiwgICAgIFwiQWx0YXJmXCIsICAgICAgIFwiUHJvY3lvblwiLCAgICAgXCJIYWVkaVwiLCAgICAgICAgXCJaYXVyYWtcIixcblwiQWxjb3JcIiwgICAgICAgIFwiTWVyb3BlXCIsICAgICAgXCJDYXBlbGxhXCIsICAgICAgXCJTa2F0XCIsICAgICAgIFwiQWx0ZXJmXCIsICAgICAgIFwiUHJvcHVzXCIsICAgICAgXCJIYW1hbFwiLCAgICAgICAgXCJaYXZpamFoXCIsXG5cIkFsY3lvbmVcIiwgICAgICBcIk1lc2FydGhpbVwiLCAgIFwiQ2FwaFwiLCAgICAgICAgIFwiU3BpY2FcIiwgICAgICBcIkFsdWRyYVwiLCAgICAgICBcIlJhbmFcIiwgICAgICAgIFwiSGFzc2FsZWhcIiwgICAgIFwiWmliYWxcIixcblwiQWxkZXJhbWluXCIsICAgIFwiTWV0YWxsYWhcIiwgICAgXCJDYXN0b3JcIiwgICAgICAgXCJTdGVyb3BlXCIsICAgIFwiQWx1bGFcIiwgICAgICAgIFwiUmFzXCIsICAgICAgICAgXCJIZXplXCIsICAgICAgICAgXCJab3NtYVwiLFxuXCJBbGRoaWJhaFwiLCAgICAgXCJNaWFwbGFjaWR1c1wiLCBcIkNlYmFscmFpXCIsICAgICBcIlN1YWxvY2luXCIsICAgXCJBbHlhXCIsICAgICAgICAgXCJSYXNhbGdldGhpXCIsICBcIkhvZWR1c1wiLCAgICAgICBcIkFxdWFyaXVzXCIsXG5cIkFsZmlya1wiLCAgICAgICBcIk1pbmthclwiLCAgICAgIFwiQ2VsYWVub1wiLCAgICAgIFwiU3VicmFcIiwgICAgICBcIkFsemlyclwiLCAgICAgICBcIlJhc2FsaGFndWVcIiwgIFwiSG9tYW1cIiwgICAgICAgIFwiQXJpZXNcIixcblwiQWxnZW5pYlwiLCAgICAgIFwiTWludGFrYVwiLCAgICAgXCJDaGFyYVwiLCAgICAgICAgXCJTdWhhaWxcIiwgICAgIFwiQW5jaGFcIiwgICAgICAgIFwiUmFzdGFiYW5cIiwgICAgXCJIeWFkdW1cIiwgICAgICAgXCJDZXBoZXVzXCIsXG5cIkFsZ2llYmFcIiwgICAgICBcIk1pcmFcIiwgICAgICAgIFwiQ2hvcnRcIiwgICAgICAgIFwiU3VsYWZhdFwiLCAgICBcIkFuZ2V0ZW5hclwiLCAgICBcIlJlZ3VsdXNcIiwgICAgIFwiSXphclwiLCAgICAgICAgIFwiQ2V0dXNcIixcblwiQWxnb2xcIiwgICAgICAgIFwiTWlyYWNoXCIsICAgICAgXCJDdXJzYVwiLCAgICAgICAgXCJTeXJtYVwiLCAgICAgIFwiQW5rYWFcIiwgICAgICAgIFwiUmlnZWxcIiwgICAgICAgXCJKYWJiYWhcIiwgICAgICAgXCJDb2x1bWJhXCIsXG5cIkFsZ29yYWJcIiwgICAgICBcIk1pcmFtXCIsICAgICAgIFwiRGFiaWhcIiwgICAgICAgIFwiVGFiaXRcIiwgICAgICBcIkFuc2VyXCIsICAgICAgICBcIlJvdGFuZXZcIiwgICAgIFwiS2FqYW1cIiwgICAgICAgIFwiQ29tYVwiLFxuXCJBbGhlbmFcIiwgICAgICAgXCJNaXJwaGFrXCIsICAgICBcIkRlbmViXCIsICAgICAgICBcIlRhbGl0aGFcIiwgICAgXCJBbnRhcmVzXCIsICAgICAgXCJSdWNoYmFcIiwgICAgICBcIkthdXNcIiwgICAgICAgICBcIkNvcm9uYVwiLFxuXCJBbGlvdGhcIiwgICAgICAgXCJNaXphclwiLCAgICAgICBcIkRlbmVib2xhXCIsICAgICBcIlRhbmlhXCIsICAgICAgXCJBcmN0dXJ1c1wiLCAgICAgXCJSdWNoYmFoXCIsICAgICBcIktlaWRcIiwgICAgICAgICBcIkNydXhcIixcblwiQWxrYWlkXCIsICAgICAgIFwiTXVmcmlkXCIsICAgICAgXCJEaGVuZWJcIiwgICAgICAgXCJUYXJhemVkXCIsICAgIFwiQXJrYWJcIiwgICAgICAgIFwiUnVrYmF0XCIsICAgICAgXCJLaXRhbHBoYVwiLCAgICAgXCJEcmFjb1wiLFxuXCJBbGthbHVyb3BzXCIsICAgXCJNdWxpcGhlblwiLCAgICBcIkRpYWRlbVwiLCAgICAgICBcIlRheWdldGFcIiwgICAgXCJBcm5lYlwiLCAgICAgICAgXCJTYWJpa1wiLCAgICAgICBcIktvY2FiXCIsICAgICAgICBcIkdydXNcIixcblwiQWxrZXNcIiwgICAgICAgIFwiTXVyemltXCIsICAgICAgXCJEaXBoZGFcIiwgICAgICAgXCJUZWdtZW5cIiwgICAgIFwiQXJyYWtpc1wiLCAgICAgIFwiU2FkYWxhY2hiaWFcIiwgXCJLb3JuZXBob3Jvc1wiLCAgXCJIeWRyYVwiLFxuXCJBbGt1cmhhaFwiLCAgICAgXCJNdXNjaWRhXCIsICAgICBcIkRzY2h1YmJhXCIsICAgICBcIlRlamF0XCIsICAgICAgXCJBc2NlbGxhXCIsICAgICAgXCJTYWRhbG1lbGlrXCIsICBcIktyYXpcIiwgICAgICAgICBcIkxhY2VydGFcIixcblwiQWxtYWFrXCIsICAgICAgIFwiTmFvc1wiLCAgICAgICAgXCJEc2liYW5cIiwgICAgICAgXCJUZXJlYmVsbHVtXCIsIFwiQXNlbGx1c1wiLCAgICAgIFwiU2FkYWxzdXVkXCIsICAgXCJLdW1hXCIsICAgICAgICAgXCJNZW5zYVwiLFxuXCJBbG5haXJcIiwgICAgICAgXCJOYXNoXCIsICAgICAgICBcIkR1YmhlXCIsICAgICAgICBcIlRoYWJpdFwiLCAgICAgXCJBc3Rlcm9wZVwiLCAgICAgXCJTYWRyXCIsICAgICAgICBcIkxlc2F0aFwiLCAgICAgICBcIk1hYXN5bVwiLFxuXCJBbG5hdGhcIiwgICAgICAgXCJOYXNoaXJhXCIsICAgICBcIkVsZWN0cmFcIiwgICAgICBcIlRoZWVtaW1cIiwgICAgXCJBdGlrXCIsICAgICAgICAgXCJTYWlwaFwiLCAgICAgICBcIlBob2VuaXhcIiwgICAgICBcIk5vcm1hXCJcbl0iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFRpbWluZz1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7VGltaW5nLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9VGltaW5nO31lbHNle2lmKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIiYmUGFyYWxsZWxpbyE9PW51bGwpe1BhcmFsbGVsaW8uVGltaW5nPVRpbWluZzt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBCYXNlVXBkYXRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJhc2VVcGRhdGVyXCIpID8gZGVwZW5kZW5jaWVzLkJhc2VVcGRhdGVyIDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLlVwZGF0ZXI7XG52YXIgVGltaW5nO1xuVGltaW5nID0gY2xhc3MgVGltaW5nIHtcbiAgY29uc3RydWN0b3IocnVubmluZyA9IHRydWUpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSBydW5uaW5nO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgfVxuXG4gIGFkZENoaWxkKGNoaWxkKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcbiAgICBpZiAodGhpcy51cGRhdGVyKSB7XG4gICAgICBjaGlsZC51cGRhdGVyLmRpc3BhdGNoZXIgPSB0aGlzLnVwZGF0ZXI7XG4gICAgfVxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgfVxuICAgIGNoaWxkLnBhcmVudCA9IHRoaXM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmVDaGlsZChjaGlsZCkge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgaWYgKGNoaWxkLnBhcmVudCA9PT0gdGhpcykge1xuICAgICAgY2hpbGQucGFyZW50ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0b2dnbGUodmFsKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHZhbCA9ICF0aGlzLnJ1bm5pbmc7XG4gICAgfVxuICAgIHRoaXMucnVubmluZyA9IHZhbDtcbiAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICByZXR1cm4gY2hpbGQudG9nZ2xlKHZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBzZXRUaW1lb3V0KGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgdmFyIHRpbWVyO1xuICAgIHRpbWVyID0gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIodGltZSwgY2FsbGJhY2ssIHRoaXMucnVubmluZyk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aW1lcik7XG4gICAgcmV0dXJuIHRpbWVyO1xuICB9XG5cbiAgc2V0SW50ZXJ2YWwoY2FsbGJhY2ssIHRpbWUpIHtcbiAgICB2YXIgdGltZXI7XG4gICAgdGltZXIgPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvci5UaW1lcih0aW1lLCBjYWxsYmFjaywgdGhpcy5ydW5uaW5nLCB0cnVlKTtcbiAgICB0aGlzLmFkZENoaWxkKHRpbWVyKTtcbiAgICByZXR1cm4gdGltZXI7XG4gIH1cblxuICBwYXVzZSgpIHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGUoZmFsc2UpO1xuICB9XG5cbiAgdW5wYXVzZSgpIHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGUodHJ1ZSk7XG4gIH1cblxufTtcblxuVGltaW5nLlRpbWVyID0gY2xhc3MgVGltZXIge1xuICBjb25zdHJ1Y3Rvcih0aW1lMSwgY2FsbGJhY2ssIHJ1bm5pbmcgPSB0cnVlLCByZXBlYXQgPSBmYWxzZSkge1xuICAgIHRoaXMudGltZSA9IHRpbWUxO1xuICAgIHRoaXMucnVubmluZyA9IHJ1bm5pbmc7XG4gICAgdGhpcy5yZXBlYXQgPSByZXBlYXQ7XG4gICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lO1xuICAgIHRoaXMudXBkYXRlciA9IG5ldyBUaW1pbmcuVXBkYXRlcih0aGlzKTtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgQmFzZVVwZGF0ZXIoKTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hlci5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuX3N0YXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5vdygpIHtcbiAgICB2YXIgcmVmO1xuICAgIGlmICgodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cgIT09IG51bGwgPyAocmVmID0gd2luZG93LnBlcmZvcm1hbmNlKSAhPSBudWxsID8gcmVmLm5vdyA6IHZvaWQgMCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsID8gcHJvY2Vzcy51cHRpbWUgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzLnVwdGltZSgpICogMTAwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIERhdGUubm93KCk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB2YWwgPSAhdGhpcy5ydW5uaW5nO1xuICAgIH1cbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhcnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0b3AoKTtcbiAgICB9XG4gIH1cblxuICBwYXVzZSgpIHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGUoZmFsc2UpO1xuICB9XG5cbiAgdW5wYXVzZSgpIHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGUodHJ1ZSk7XG4gIH1cblxuICBnZXRFbGFwc2VkVGltZSgpIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5ub3coKSAtIHRoaXMuc3RhcnRUaW1lICsgdGhpcy50aW1lIC0gdGhpcy5yZW1haW5pbmdUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50aW1lIC0gdGhpcy5yZW1haW5pbmdUaW1lO1xuICAgIH1cbiAgfVxuXG4gIHNldEVsYXBzZWRUaW1lKHZhbCkge1xuICAgIHRoaXMuX3N0b3AoKTtcbiAgICB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWUgLSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0KCk7XG4gIH1cblxuICBnZXRQcmMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxhcHNlZFRpbWUoKSAvIHRoaXMudGltZTtcbiAgfVxuXG4gIHNldFByYyh2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRFbGFwc2VkVGltZSh0aGlzLnRpbWUgKiB2YWwpO1xuICB9XG5cbiAgX3N0YXJ0KCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy51cGRhdGVyLmZvcndhcmRDYWxsYmFja3MoKTtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuY29uc3RydWN0b3Iubm93KCk7XG4gICAgaWYgKHRoaXMucmVwZWF0ICYmICF0aGlzLmludGVydXB0ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmlkID0gc2V0SW50ZXJ2YWwodGhpcy50aWNrLmJpbmQodGhpcyksIHRoaXMucmVtYWluaW5nVGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmlkID0gc2V0VGltZW91dCh0aGlzLnRpY2suYmluZCh0aGlzKSwgdGhpcy5yZW1haW5pbmdUaW1lKTtcbiAgICB9XG4gIH1cblxuICBfc3RvcCgpIHtcbiAgICB2YXIgd2FzSW50ZXJ1cHRlZDtcbiAgICB3YXNJbnRlcnVwdGVkID0gdGhpcy5pbnRlcnVwdGVkO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlci51bmZvcndhcmRDYWxsYmFja3MoKTtcbiAgICB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWUgLSAodGhpcy5jb25zdHJ1Y3Rvci5ub3coKSAtIHRoaXMuc3RhcnRUaW1lKTtcbiAgICB0aGlzLmludGVydXB0ZWQgPSB0aGlzLnJlbWFpbmluZ1RpbWUgIT09IHRoaXMudGltZTtcbiAgICBpZiAodGhpcy5yZXBlYXQgJiYgIXdhc0ludGVydXB0ZWQpIHtcbiAgICAgIHJldHVybiBjbGVhckludGVydmFsKHRoaXMuaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgIH1cbiAgfVxuXG4gIHRpY2soKSB7XG4gICAgdmFyIHdhc0ludGVydXB0ZWQ7XG4gICAgd2FzSW50ZXJ1cHRlZCA9IHRoaXMuaW50ZXJ1cHRlZDtcbiAgICB0aGlzLmludGVydXB0ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgIHRoaXMucmVtYWluaW5nVGltZSA9IHRoaXMudGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gMDtcbiAgICB9XG4gICAgdGhpcy5kaXNwYXRjaGVyLnVwZGF0ZSgpO1xuICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgaWYgKHdhc0ludGVydXB0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydFRpbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5vdygpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLmRpc3BhdGNoZXIuZGVzdHJveSgpO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cbiAgfVxuXG59O1xuXG5UaW1pbmcuVXBkYXRlciA9IGNsYXNzIFVwZGF0ZXIge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQpIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgQmFzZVVwZGF0ZXIoKTtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgcmVmO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgaWYgKCgocmVmID0gdGhpcy5wYXJlbnQpICE9IG51bGwgPyByZWYucnVubmluZyA6IHZvaWQgMCkgJiYgdGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLmFkZENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IHRoaXMuY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmRpc3BhdGNoZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoZXIucmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIGdldEJpbmRlcigpIHtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICByZXR1cm4gbmV3IEJhc2VVcGRhdGVyLkJpbmRlcih0aGlzKTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkQ2FsbGJhY2tzKCkge1xuICAgIGlmICh0aGlzLmRpc3BhdGNoZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLmFkZENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHVuZm9yd2FyZENhbGxiYWNrcygpIHtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5yZW1vdmVDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMudW5mb3J3YXJkQ2FsbGJhY2tzKCk7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQgPSBudWxsO1xuICB9XG5cbn07XG5cbnJldHVybihUaW1pbmcpO30pOyIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iXX0=
