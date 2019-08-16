(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Parallelio = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"spark-starter":88}],2:[function(require,module,exports){
if (typeof module !== "undefined" && module !== null) {
  module.exports = {
      greekAlphabet: require('./strings/greekAlphabet'),
      starNames: require('./strings/starNames')
  };
}
},{"./strings/greekAlphabet":3,"./strings/starNames":4}],3:[function(require,module,exports){
module.exports=[
"alpha",   "beta",    "gamma",   "delta",
"epsilon", "zeta",    "eta",     "theta",
"iota",    "kappa",   "lambda",  "mu",
"nu",      "xi",      "omicron", "pi",	
"rho",     "sigma",   "tau",     "upsilon",
"phi",     "chi",     "psi",     "omega"
]
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./Direction":5,"spark-starter":88}],7:[function(require,module,exports){
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

},{"./TileReference":8,"spark-starter":88}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"spark-starter":88}],10:[function(require,module,exports){
module.exports = {
  "Direction": require("./Direction"),
  "Tile": require("./Tile"),
  "TileContainer": require("./TileContainer"),
  "TileReference": require("./TileReference"),
  "Tiled": require("./Tiled"),
}
},{"./Direction":5,"./Tile":6,"./TileContainer":7,"./TileReference":8,"./Tiled":9}],11:[function(require,module,exports){
(function (process,setImmediate){
(function(definition){var Timing=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Timing.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Timing;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Timing=Timing;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Timing=Timing;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Timing;
Timing = (function() {
  class Timing extends Element {
    toggle(val) {
      if (typeof val === "undefined") {
        val = !this.running;
      }
      return this.running = val;
    }

    setTimeout(callback, time) {
      return new this.constructor.Timer({
        time: time,
        callback: callback,
        timing: this
      });
    }

    setInterval(callback, time) {
      return new this.constructor.Timer({
        time: time,
        callback: callback,
        repeat: true,
        timing: this
      });
    }

    pause() {
      return this.toggle(false);
    }

    unpause() {
      return this.toggle(true);
    }

  };

  Timing.properties({
    running: {
      default: true
    }
  });

  return Timing;

}).call(this);

Timing.Timer = (function() {
  class Timer extends Element {
    init() {
      return this.remainingTime = this.time;
    }

    toggle(val) {
      if (typeof val === "undefined") {
        val = !this.paused;
      }
      return this.paused = val;
    }

    pause() {
      return this.toggle(true);
    }

    unpause() {
      return this.toggle(false);
    }

    start() {
      this.startTime = this.constructor.now();
      if (this.repeat) {
        return this.id = setInterval(this.tick.bind(this), this.remainingTime);
      } else {
        return this.id = setTimeout(this.tick.bind(this), this.remainingTime);
      }
    }

    stop() {
      this.remainingTime = this.time - (this.constructor.now() - this.startTime);
      if (this.repeat) {
        return clearInterval(this.id);
      } else {
        return clearTimeout(this.id);
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

    tick() {
      this.repetition += 1;
      if (this.callback != null) {
        this.callback();
      }
      if (this.repeat) {
        this.startTime = this.constructor.now();
        return this.remainingTime = this.time;
      } else {
        this.running = false;
        return this.remainingTime = 0;
      }
    }

    destroy() {
      if (this.repeat) {
        clearInterval(this.id);
      } else {
        clearTimeout(this.id);
      }
      this.running = false;
      return this.destroyProperties();
    }

  };

  Timer.properties({
    time: {
      default: 1000
    },
    paused: {
      default: false
    },
    running: {
      calcul: function(invalidator) {
        return !invalidator.prop('paused') && invalidator.propPath('timing.running') !== false;
      },
      change: function(old) {
        if (this.running) {
          return this.start();
        } else if (old) {
          return this.stop();
        }
      }
    },
    timing: {
      default: null
    },
    elapsedTime: {
      calcul: function(invalidator) {
        if (invalidator.prop('running')) {
          setImmediate(() => {
            return this.invalidateElapsedTime();
          });
          return this.constructor.now() - this.startTime + this.time - this.remainingTime;
        } else {
          return this.time - this.remainingTime;
        }
      },
      set: function(val) {
        if (this.running) {
          this.stop();
          this.remainingTime = this.time - val;
          if (this.remainingTime <= 0) {
            return this.tick();
          } else {
            return this.start();
          }
        } else {
          this.remainingTime = this.time - val;
          return this.invalidateElapsedTime();
        }
      }
    },
    prc: {
      calcul: function(invalidator) {
        return invalidator.prop('elapsedTime') / this.time;
      },
      set: function(val) {
        return this.setElapsedTime(this.time * val);
      }
    },
    repeat: {
      default: false
    },
    repetition: {
      default: 0
    },
    callback: {
      default: null
    }
  });

  return Timer;

}).call(this);

return(Timing);});
}).call(this,require('_process'),require("timers").setImmediate)

},{"_process":63,"spark-starter":88,"timers":64}],12:[function(require,module,exports){
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

},{"./SignalOperation":14,"spark-starter":88}],13:[function(require,module,exports){
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

},{"spark-starter":88}],14:[function(require,module,exports){
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

},{"spark-starter":88}],15:[function(require,module,exports){
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

},{"./Connected":12,"./Signal":13,"./SignalOperation":14}],16:[function(require,module,exports){
var Connected, Switch;

Connected = require('./Connected');

module.exports = Switch = class Switch extends Connected {};

},{"./Connected":12}],17:[function(require,module,exports){
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

},{"./Connected":12,"parallelio-tiles":10}],18:[function(require,module,exports){
module.exports = {
  "Connected": require("./Connected"),
  "Signal": require("./Signal"),
  "SignalOperation": require("./SignalOperation"),
  "SignalSource": require("./SignalSource"),
  "Switch": require("./Switch"),
  "Wire": require("./Wire"),
}
},{"./Connected":12,"./Signal":13,"./SignalOperation":14,"./SignalSource":15,"./Switch":16,"./Wire":17}],19:[function(require,module,exports){
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



},{"./Character":20,"./Door":25}],20:[function(require,module,exports){
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
      composed: true,
      default: 0.5
    },
    offsetY: {
      composed: true,
      default: 0.5
    },
    tile: {
      composed: true
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



},{"./Damageable":24,"./actions/WalkAction":56,"parallelio-tiles":10}],21:[function(require,module,exports){
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



},{"./Door":25,"./VisionCalculator":47,"./actions/AttackMoveAction":51,"./actions/WalkAction":56,"parallelio-tiles":10,"spark-starter":88}],22:[function(require,module,exports){
var Confrontation, Element, Ship, View;

Element = require('spark-starter').Element;

View = require('./View');

Ship = require('./Ship');

module.exports = Confrontation = (function() {
  class Confrontation extends Element {
    start() {
      game.mainView = this.view;
      subject.container = this.view;
      return opponent.container = this.view;
    }

  };

  Confrontation.properties({
    game: {
      default: null
    },
    subject: {
      default: null
    },
    view: {
      calcul: function() {
        return new View();
      }
    },
    opponent: {
      calcul: function() {
        return new Ship();
      }
    }
  });

  return Confrontation;

}).call(this);



},{"./Ship":41,"./View":46,"spark-starter":88}],23:[function(require,module,exports){
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



},{"./LineOfSight":31,"parallelio-tiles":10,"spark-starter":88}],24:[function(require,module,exports){
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



},{"spark-starter":88}],25:[function(require,module,exports){
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



},{"parallelio-tiles":10}],26:[function(require,module,exports){
module.exports = require('spark-starter').Element;



},{"spark-starter":88}],27:[function(require,module,exports){
var Confrontation, Element, EncounterManager, PropertyWatcher;

Element = require('spark-starter').Element;

PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher;

Confrontation = require('./Confrontation');

module.exports = EncounterManager = (function() {
  class EncounterManager extends Element {
    init() {
      return this.locationWatcher.bind();
    }

    testEncounter() {
      if (Math.random() <= this.baseProbability) {
        return this.startEncounter();
      }
    }

    startEncounter() {
      var encounter;
      encounter = new Confrontation({
        subject: this.subject
      });
      return encounter.start();
    }

  };

  EncounterManager.properties({
    subject: {
      default: null
    },
    baseProbability: {
      default: 0.2
    },
    locationWatcher: {
      calcul: function() {
        return new PropertyWatcher({
          callback: () => {
            return this.testEncounter();
          },
          property: this.subject.getPropertyInstance('location')
        });
      }
    }
  });

  return EncounterManager;

}).call(this);



},{"./Confrontation":22,"spark-starter":88}],28:[function(require,module,exports){
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



},{"parallelio-tiles":10}],29:[function(require,module,exports){
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



},{"./Player":36,"./View":46,"parallelio-timing":11,"spark-starter":88}],30:[function(require,module,exports){
var Collection, Inventory;

Collection = require('spark-starter').Collection;

module.exports = Inventory = class Inventory extends Collection {
  getByType(type) {
    var res;
    res = this.filter(function(r) {
      return r.type === type;
    });
    if (res.length) {
      return res[0];
    }
  }

  addByType(type, qte, partial = false) {
    var ressource;
    ressource = this.getByType(type);
    if (!ressource) {
      ressource = this.initRessource(type);
    }
    if (partial) {
      return ressource.partialChange(ressource.qte + qte);
    } else {
      return ressource.qte += qte;
    }
  }

  initRessource(type, opt) {
    return type.initRessource(opt);
  }

};



},{"spark-starter":88}],31:[function(require,module,exports){
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



},{}],32:[function(require,module,exports){
var Element, Map;

Element = require('spark-starter').Element;

module.exports = Map = (function() {
  class Map extends Element {
    _addToBondaries(location, boundaries) {
      if ((boundaries.top == null) || location.y < boundaries.top) {
        boundaries.top = location.y;
      }
      if ((boundaries.left == null) || location.x < boundaries.left) {
        boundaries.left = location.x;
      }
      if ((boundaries.bottom == null) || location.y > boundaries.bottom) {
        boundaries.bottom = location.y;
      }
      if ((boundaries.right == null) || location.x > boundaries.right) {
        return boundaries.right = location.x;
      }
    }

  };

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
        this.locations.forEach((location) => {
          return this._addToBondaries(location, boundaries);
        });
        return boundaries;
      },
      output: function(val) {
        return Object.assign({}, val);
      }
    }
  });

  return Map;

}).call(this);



},{"spark-starter":88}],33:[function(require,module,exports){
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



},{"parallelio-tiles":10}],34:[function(require,module,exports){
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
        this.walker.tileMembers.addPropertyRef('position.tile', this);
        this.walker.offsetXMembers.addPropertyRef('position.offsetX', this);
        return this.walker.offsetYMembers.addPropertyRef('position.offsetY', this);
      }
    }

    stop() {
      return this.pathTimeout.pause();
    }

    finish() {
      this.walker.tile = this.position.tile;
      this.walker.offsetX = this.position.offsetX;
      this.walker.offsetY = this.position.offsetY;
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
      if (this.walker.walk === this) {
        this.walker.walk = null;
      }
      this.walker.tileMembers.removeRef('position.tile', this);
      this.walker.offsetXMembers.removeRef('position.offsetX', this);
      this.walker.offsetYMembers.removeRef('position.offsetY', this);
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
    },
    position: {
      calcul: function(invalidator) {
        return this.path.getPosAtPrc(invalidator.propPath('pathTimeout.prc'));
      }
    }
  });

  return PathWalk;

}).call(this);



},{"parallelio-timing":11,"spark-starter":88}],35:[function(require,module,exports){
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



},{"./LineOfSight":31,"parallelio-timing":11,"spark-starter":88}],36:[function(require,module,exports){
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

    selectAction(action) {
      if (action.isReady()) {
        return action.start();
      } else {
        return this.selectedAction = action;
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
    globalActionProviders: {
      collection: true
    },
    actionProviders: {
      calcul: function(invalidator) {
        var res, selected;
        res = invalidator.prop('globalActionProviders').toArray();
        selected = invalidator.prop('selected');
        if (selected) {
          res.push(selected);
        }
        return res;
      }
    },
    availableActions: {
      calcul: function(invalidator) {
        return invalidator.prop("actionProviders").reduce((res, provider) => {
          var actions;
          actions = invalidator.prop("availableActions", provider);
          if (actions) {
            return res.concat(actions.toArray());
          } else {
            return res;
          }
        }, []);
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



},{"spark-starter":88}],37:[function(require,module,exports){
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



},{"parallelio-timing":11,"spark-starter":88}],38:[function(require,module,exports){
var Element, Ressource;

Element = require('spark-starter').Element;

module.exports = Ressource = (function() {
  class Ressource extends Element {
    partialChange(qte) {
      var acceptable;
      acceptable = Math.max(this.minQte, Math.min(this.maxQte, qte));
      this.qte = acceptable;
      return qte - acceptable;
    }

  };

  Ressource.properties({
    type: {
      default: null
    },
    qte: {
      default: 0,
      ingest: function(qte) {
        if (this.maxQte !== null && qte > this.maxQte) {
          throw new Error('Cant have more than ' + this.maxQte + ' of ' + this.type.name);
        }
        if (this.minQte !== null && qte < this.minQte) {
          throw new Error('Cant have less than ' + this.minQte + ' of ' + this.type.name);
        }
        return qte;
      }
    },
    maxQte: {
      default: null
    },
    minQte: {
      default: 0
    }
  });

  return Ressource;

}).call(this);



},{"spark-starter":88}],39:[function(require,module,exports){
var Element, Ressource, RessourceType;

Element = require('spark-starter').Element;

Ressource = require('./Ressource');

module.exports = RessourceType = (function() {
  class RessourceType extends Element {
    initRessource(opt) {
      if (typeof opt !== "object") {
        opt = {
          qte: opt
        };
      }
      opt = Object.assign({}, this.defaultOptions, opt);
      return new this.ressourceClass(opt);
    }

  };

  RessourceType.properties({
    name: {
      default: null
    },
    ressourceClass: {
      default: Ressource
    },
    defaultOptions: {
      default: {}
    }
  });

  return RessourceType;

}).call(this);



},{"./Ressource":38,"spark-starter":88}],40:[function(require,module,exports){
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



},{"./Door":25,"parallelio-tiles":10,"spark-starter":88}],41:[function(require,module,exports){
var Element, Ship, Travel, TravelAction;

Element = require('spark-starter').Element;

Travel = require('./Travel');

TravelAction = require('./actions/TravelAction');

module.exports = Ship = (function() {
  class Ship extends Element {
    travelTo(location) {
      var travel;
      travel = new Travel({
        traveller: this,
        startLocation: this.location,
        targetLocation: location
      });
      if (travel.valid) {
        travel.start();
        return this.travel = travel;
      }
    }

  };

  Ship.properties({
    location: {
      default: null
    },
    travel: {
      default: null
    },
    availableActions: {
      collection: true,
      calcul: function(invalidator) {
        return new TravelAction({
          actor: this
        });
      }
    },
    spaceCoodinate: {
      calcul: function(invalidator) {
        var endX, endY, prc, startX, startY;
        if (invalidator.prop('travel')) {
          startX = invalidator.propPath('travel.startLocation.x');
          startY = invalidator.propPath('travel.startLocation.y');
          endX = invalidator.propPath('travel.targetLocation.x');
          endY = invalidator.propPath('travel.targetLocation.y');
          prc = invalidator.propPath('travel.pathTimeout.prc');
          return {
            x: (startX - endX) * prc + endX,
            y: (startY - endY) * prc + endY
          };
        } else {
          return {
            x: invalidator.propPath('location.x'),
            y: invalidator.propPath('location.y')
          };
        }
      }
    }
  });

  return Ship;

}).call(this);



},{"./Travel":45,"./actions/TravelAction":55,"spark-starter":88}],42:[function(require,module,exports){
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
        projectile = new this.projectileClass({
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
    },
    projectileClass: {
      default: Projectile
    }
  });

  return ShipWeapon;

}).call(this);



},{"./Damageable":24,"./Projectile":37,"parallelio-tiles":10,"parallelio-timing":11}],43:[function(require,module,exports){
var Element, Map, StarMapGenerator, StarSystem, starNames;

Element = require('spark-starter').Element;

Map = require('./Map');

StarSystem = require('./StarSystem');

starNames = require('parallelio-strings').starNames;

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

    createStar(opt = {}) {
      var name, pos, star;
      if (!(opt.x && opt.y)) {
        pos = this.randomStarPos();
        if (pos != null) {
          opt = Object.assign({}, opt, {
            x: pos.x,
            y: pos.y
          });
        } else {
          return null;
        }
      }
      if (!opt.name) {
        name = this.randomStarName();
        if (name != null) {
          opt = Object.assign({}, opt, {
            name: name
          });
        } else {
          return null;
        }
      }
      star = new this.opt.starClass(opt);
      this.map.locations.push(star);
      this.stars.push(star);
      return star;
    }

    randomStarPos() {
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
        return pos;
      }
    }

    randomStarName() {
      var name, pos, ref;
      if ((ref = this.opt.starNames) != null ? ref.length : void 0) {
        pos = Math.floor(this.opt.rng() * this.opt.starNames.length);
        name = this.opt.starNames[pos];
        this.opt.starNames.splice(pos, 1);
        return name;
      }
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
    minStarDist: 20,
    minLinkDist: 20,
    linksByStars: 3,
    linkTries: 3,
    mapClass: Map,
    starClass: StarSystem,
    linkClass: StarSystem.Link,
    rng: Math.random,
    starNames: starNames
  };

  return StarMapGenerator;

}).call(this);



},{"./Map":32,"./StarSystem":44,"parallelio-strings":2,"spark-starter":88}],44:[function(require,module,exports){
var Element, StarSystem;

Element = require('spark-starter').Element;

module.exports = StarSystem = (function() {
  class StarSystem extends Element {
    constructor(data) {
      super(data);
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

    isSelectableBy(player) {
      return true;
    }

  };

  StarSystem.properties({
    x: {},
    y: {},
    name: {},
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

  StarSystem.collenctionFn = {
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

  return StarSystem;

}).call(this);

StarSystem.Link = class Link extends Element {
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



},{"spark-starter":88}],45:[function(require,module,exports){
var Element, Timing, Travel;

Element = require('spark-starter').Element;

Timing = require('parallelio-timing');

module.exports = Travel = (function() {
  class Travel extends Element {
    start(location) {
      if (this.valid) {
        this.moving = true;
        this.traveller.travel = this;
        return this.pathTimeout = this.timing.setTimeout(() => {
          this.traveller.location = this.targetLocation;
          this.traveller.travel = null;
          this.moving = false;
          return console.log('stop moving');
        }, this.duration);
      }
    }

  };

  Travel.properties({
    traveller: {
      default: null
    },
    startLocation: {
      default: null
    },
    targetLocation: {
      default: null
    },
    currentSection: {
      calcul: function() {
        return this.startLocation.links.findStar(this.targetLocation);
      }
    },
    duration: {
      default: 1000
    },
    moving: {
      default: false
    },
    valid: {
      calcul: function() {
        var ref, ref1;
        if (this.targetLocation === this.startLocation) {
          return false;
        }
        if ((((ref = this.targetLocation) != null ? ref.links : void 0) != null) && (((ref1 = this.startLocation) != null ? ref1.links : void 0) != null)) {
          return this.currentSection != null;
        }
      }
    },
    timing: {
      calcul: function() {
        return new Timing();
      }
    }
  });

  return Travel;

}).call(this);



},{"parallelio-timing":11,"spark-starter":88}],46:[function(require,module,exports){
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



},{"parallelio-grids":62,"spark-starter":88}],47:[function(require,module,exports){
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



},{"./LineOfSight":31,"parallelio-tiles":10}],48:[function(require,module,exports){
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



},{"spark-starter":88}],49:[function(require,module,exports){
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



},{"spark-starter":88}],50:[function(require,module,exports){
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
          this.walkAction.destroy();
          this.invalidateWalkAction();
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



},{"./TargetAction":53,"./WalkAction":56,"spark-starter":88}],51:[function(require,module,exports){
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



},{"../LineOfSight":31,"./AttackAction":50,"./TargetAction":53,"./WalkAction":56,"parallelio-pathfinder":1,"spark-starter":88}],52:[function(require,module,exports){
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



},{"./ActionProvider":49}],53:[function(require,module,exports){
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



},{"./Action":48}],54:[function(require,module,exports){
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



},{"./ActionProvider":49,"spark-starter":88}],55:[function(require,module,exports){
var TargetAction, Travel, TravelAction;

TargetAction = require('./TargetAction');

Travel = require('../Travel');

module.exports = TravelAction = (function() {
  class TravelAction extends TargetAction {
    validTarget() {
      return this.travel.valid;
    }

    execute() {
      return this.travel.start();
    }

  };

  TravelAction.properties({
    travel: {
      calcul: function() {
        return new Travel({
          traveller: this.actor,
          startLocation: this.actor.location,
          targetLocation: this.target
        });
      }
    }
  });

  return TravelAction;

}).call(this);



},{"../Travel":45,"./TargetAction":53}],56:[function(require,module,exports){
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



},{"../PathWalk":34,"./TargetAction":53,"parallelio-pathfinder":1}],57:[function(require,module,exports){
module.exports = {
  "AutomaticDoor": require("./AutomaticDoor"),
  "Character": require("./Character"),
  "CharacterAI": require("./CharacterAI"),
  "Confrontation": require("./Confrontation"),
  "DamagePropagation": require("./DamagePropagation"),
  "Damageable": require("./Damageable"),
  "Door": require("./Door"),
  "Element": require("./Element"),
  "EnconterManager": require("./EnconterManager"),
  "Floor": require("./Floor"),
  "Game": require("./Game"),
  "Inventory": require("./Inventory"),
  "LineOfSight": require("./LineOfSight"),
  "Map": require("./Map"),
  "Obstacle": require("./Obstacle"),
  "PathWalk": require("./PathWalk"),
  "PersonalWeapon": require("./PersonalWeapon"),
  "Player": require("./Player"),
  "Projectile": require("./Projectile"),
  "Ressource": require("./Ressource"),
  "RessourceType": require("./RessourceType"),
  "RoomGenerator": require("./RoomGenerator"),
  "Ship": require("./Ship"),
  "ShipWeapon": require("./ShipWeapon"),
  "StarMapGenerator": require("./StarMapGenerator"),
  "StarSystem": require("./StarSystem"),
  "Travel": require("./Travel"),
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
    "TravelAction": require("./actions/TravelAction"),
    "WalkAction": require("./actions/WalkAction"),
  },
}
},{"./AutomaticDoor":19,"./Character":20,"./CharacterAI":21,"./Confrontation":22,"./DamagePropagation":23,"./Damageable":24,"./Door":25,"./Element":26,"./EnconterManager":27,"./Floor":28,"./Game":29,"./Inventory":30,"./LineOfSight":31,"./Map":32,"./Obstacle":33,"./PathWalk":34,"./PersonalWeapon":35,"./Player":36,"./Projectile":37,"./Ressource":38,"./RessourceType":39,"./RoomGenerator":40,"./Ship":41,"./ShipWeapon":42,"./StarMapGenerator":43,"./StarSystem":44,"./Travel":45,"./View":46,"./VisionCalculator":47,"./actions/Action":48,"./actions/ActionProvider":49,"./actions/AttackAction":50,"./actions/AttackMoveAction":51,"./actions/SimpleActionProvider":52,"./actions/TargetAction":53,"./actions/TiledActionProvider":54,"./actions/TravelAction":55,"./actions/WalkAction":56}],58:[function(require,module,exports){
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



},{"./libs":57,"parallelio-grids":62,"parallelio-pathfinder":1,"parallelio-strings":2,"parallelio-tiles":10,"parallelio-timing":11,"parallelio-wiring":18,"spark-starter":88}],59:[function(require,module,exports){
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
},{"./GridCell":60,"./GridRow":61,"spark-starter":88}],60:[function(require,module,exports){
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
},{"spark-starter":88}],61:[function(require,module,exports){
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
},{"./GridCell":60,"spark-starter":88}],62:[function(require,module,exports){
if(module){
  module.exports = {
    Grid: require('./Grid.js'),
    GridCell: require('./GridCell.js'),
    GridRow: require('./GridRow.js')
  };
}
},{"./Grid.js":59,"./GridCell.js":60,"./GridRow.js":61}],63:[function(require,module,exports){
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

},{}],64:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":63,"timers":64}],65:[function(require,module,exports){
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



},{"./Referred":86}],66:[function(require,module,exports){
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



},{}],67:[function(require,module,exports){
var Element, Mixable, Property;

Property = require('./Property');

Mixable = require('./Mixable');

module.exports = Element = class Element extends Mixable {
  constructor(data) {
    super();
    if (typeof data === "object" && (this.setProperties != null)) {
      this.setProperties(data);
    }
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



},{"./Mixable":76,"./Property":78}],68:[function(require,module,exports){
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



},{"./Binder":65}],69:[function(require,module,exports){
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



},{}],70:[function(require,module,exports){
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



},{"../Invalidator":74,"./PropertyWatcher":73}],71:[function(require,module,exports){
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



},{"./PropertyWatcher":73}],72:[function(require,module,exports){
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



},{"../Invalidator":74}],73:[function(require,module,exports){
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



},{"../Binder":65}],74:[function(require,module,exports){
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



},{"./Binder":65,"./EventBind":68}],75:[function(require,module,exports){
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



},{"./Overrider":77}],76:[function(require,module,exports){
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



},{}],77:[function(require,module,exports){
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



},{}],78:[function(require,module,exports){
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



},{"./Mixable":76,"./PropertyOwner":79,"./PropertyTypes/BasicProperty":80,"./PropertyTypes/CalculatedProperty":81,"./PropertyTypes/CollectionProperty":82,"./PropertyTypes/ComposedProperty":83,"./PropertyTypes/DynamicProperty":84,"./PropertyTypes/InvalidatedProperty":85}],79:[function(require,module,exports){
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



},{}],80:[function(require,module,exports){
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



},{"../EventEmitter":69,"../Invalidated/PropertyWatcher":73,"../Loader":75,"../Mixable":76,"../Referred":86}],81:[function(require,module,exports){
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
      if (typeof prop.options.calcul === 'function' && (prop.options.composed == null)) {
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



},{"../Invalidator":74,"../Overrider":77,"./DynamicProperty":84}],82:[function(require,module,exports){
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



},{"../Collection":66,"../Invalidated/CollectionPropertyWatcher":71,"../Referred":86,"./DynamicProperty":84}],83:[function(require,module,exports){
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
        this.default = this.value = null;
      }
      this.members = new ComposedProperty.Members(this.property.options.members);
      if (this.property.options.calcul != null) {
        this.members.unshift((prev, invalidator) => {
          return this.property.options.calcul.bind(this.obj)(invalidator);
        });
      }
      this.members.changed = (old) => {
        return this.invalidate();
      };
      return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : typeof this.property.options.composed === 'string' && (ComposedProperty.joinFunctions[this.property.options.composed] != null) ? ComposedProperty.joinFunctions[this.property.options.composed] : this.property.options.default === false ? ComposedProperty.joinFunctions.or : this.property.options.default === true ? ComposedProperty.joinFunctions.and : ComposedProperty.joinFunctions.last;
    }

    calcul() {
      if (this.members.length) {
        if (!this.invalidator) {
          this.invalidator = new Invalidator(this, this.obj);
        }
        this.invalidator.recycle((invalidator, done) => {
          this.value = this.members.reduce((prev, member) => {
            var val;
            val = typeof member === 'function' ? member(prev, this.invalidator) : member;
            return this.join(prev, val);
          }, this.default);
          done();
          if (invalidator.isEmpty()) {
            return this.invalidator = null;
          } else {
            return invalidator.bind();
          }
        });
      } else {
        this.value = this.default;
      }
      this.revalidated();
      return this.value;
    }

    set(val) {
      val = this.ingest(val);
      if (this.default !== val) {
        this.default = val;
        return this.invalidate();
      }
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
    },
    last: function(a, b) {
      return b;
    },
    sum: function(a, b) {
      return a + b;
    }
  };

  return ComposedProperty;

}).call(this);

ComposedProperty.Members = class Members extends Collection {
  addPropertyRef(name, obj) {
    var fn;
    if (this.findRefIndex(name, obj) === -1) {
      fn = function(prev, invalidator) {
        return invalidator.propPath(name, obj);
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
      fn = function(prev, invalidator) {
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
      fn = function(prev, invalidator) {
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



},{"../Collection":66,"../Invalidator":74,"./CalculatedProperty":81}],84:[function(require,module,exports){
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



},{"../Invalidator":74,"./BasicProperty":80}],85:[function(require,module,exports){
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
      if (typeof prop.options.calcul === 'function' && prop.options.calcul.length > 0 && (prop.options.composed == null)) {
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



},{"../Invalidator":74,"./CalculatedProperty":81}],86:[function(require,module,exports){
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



},{}],87:[function(require,module,exports){
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



},{"./Binder":65}],88:[function(require,module,exports){
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
},{"./Binder":65,"./Collection":66,"./Element":67,"./EventBind":68,"./EventEmitter":69,"./Invalidated/ActivablePropertyWatcher":70,"./Invalidated/CollectionPropertyWatcher":71,"./Invalidated/Invalidated":72,"./Invalidated/PropertyWatcher":73,"./Invalidator":74,"./Loader":75,"./Mixable":76,"./Overrider":77,"./Property":78,"./PropertyOwner":79,"./PropertyTypes/BasicProperty":80,"./PropertyTypes/CalculatedProperty":81,"./PropertyTypes/CollectionProperty":82,"./PropertyTypes/ComposedProperty":83,"./PropertyTypes/DynamicProperty":84,"./PropertyTypes/InvalidatedProperty":85,"./Referred":86,"./Updater":87}]},{},[58])(58)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvZGlzdC9wYXRoZmluZGVyLmpzIiwiLi4vcGFyYWxsZWxpby1zdHJpbmdzL3N0cmluZ3MuanMiLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9ncmVla0FscGhhYmV0Lmpzb24iLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9zdGFyTmFtZXMuanNvbiIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL0RpcmVjdGlvbi5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGUuanMiLCIuLi9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlQ29udGFpbmVyLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZVJlZmVyZW5jZS5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVkLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvdGlsZXMuanMiLCIuLi9wYXJhbGxlbGlvLXRpbWluZy9ub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aW1pbmcvZGlzdC90aW1pbmcuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvQ29ubmVjdGVkLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1NpZ25hbC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9TaWduYWxPcGVyYXRpb24uanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvU2lnbmFsU291cmNlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1N3aXRjaC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9XaXJlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL3dpcmluZy5qcyIsImxpYi9BdXRvbWF0aWNEb29yLmpzIiwibGliL0NoYXJhY3Rlci5qcyIsImxpYi9DaGFyYWN0ZXJBSS5qcyIsImxpYi9Db25mcm9udGF0aW9uLmpzIiwibGliL0RhbWFnZVByb3BhZ2F0aW9uLmpzIiwibGliL0RhbWFnZWFibGUuanMiLCJsaWIvRG9vci5qcyIsImxpYi9FbGVtZW50LmpzIiwibGliL0VuY29udGVyTWFuYWdlci5qcyIsImxpYi9GbG9vci5qcyIsImxpYi9HYW1lLmpzIiwibGliL0ludmVudG9yeS5qcyIsImxpYi9MaW5lT2ZTaWdodC5qcyIsImxpYi9NYXAuanMiLCJsaWIvT2JzdGFjbGUuanMiLCJsaWIvUGF0aFdhbGsuanMiLCJsaWIvUGVyc29uYWxXZWFwb24uanMiLCJsaWIvUGxheWVyLmpzIiwibGliL1Byb2plY3RpbGUuanMiLCJsaWIvUmVzc291cmNlLmpzIiwibGliL1Jlc3NvdXJjZVR5cGUuanMiLCJsaWIvUm9vbUdlbmVyYXRvci5qcyIsImxpYi9TaGlwLmpzIiwibGliL1NoaXBXZWFwb24uanMiLCJsaWIvU3Rhck1hcEdlbmVyYXRvci5qcyIsImxpYi9TdGFyU3lzdGVtLmpzIiwibGliL1RyYXZlbC5qcyIsImxpYi9WaWV3LmpzIiwibGliL1Zpc2lvbkNhbGN1bGF0b3IuanMiLCJsaWIvYWN0aW9ucy9BY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9BY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL0F0dGFja0FjdGlvbi5qcyIsImxpYi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL1RhcmdldEFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9UcmF2ZWxBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9XYWxrQWN0aW9uLmpzIiwibGliL2xpYnMuanMiLCJsaWIvcGFyYWxsZWxpby5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL0dyaWRDZWxsLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL0dyaWRSb3cuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9saWIvZ3JpZHMuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9CaW5kZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Db2xsZWN0aW9uLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvRWxlbWVudC5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50QmluZC5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50RW1pdHRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZC5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdG9yLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvTG9hZGVyLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvTWl4YWJsZS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL092ZXJyaWRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5LmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlPd25lci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1JlZmVycmVkLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvVXBkYXRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL3NwYXJrLXN0YXJ0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBQYXRoRmluZGVyPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtQYXRoRmluZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9UGF0aEZpbmRlcjt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBQYXRoRmluZGVyO1xuUGF0aEZpbmRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGF0aEZpbmRlciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzQ29udGFpbmVyLCBmcm9tMSwgdG8xLCBvcHRpb25zID0ge30pIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRpbGVzQ29udGFpbmVyID0gdGlsZXNDb250YWluZXI7XG4gICAgICB0aGlzLmZyb20gPSBmcm9tMTtcbiAgICAgIHRoaXMudG8gPSB0bzE7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICBpZiAob3B0aW9ucy52YWxpZFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnZhbGlkVGlsZUNhbGxiYWNrID0gb3B0aW9ucy52YWxpZFRpbGU7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5hcnJpdmVkICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hcnJpdmVkQ2FsbGJhY2sgPSBvcHRpb25zLmFycml2ZWQ7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5lZmZpY2llbmN5ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5Q2FsbGJhY2sgPSBvcHRpb25zLmVmZmljaWVuY3k7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICB0aGlzLnBhdGhzID0ge307XG4gICAgICB0aGlzLnNvbHV0aW9uID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICB3aGlsZSAoIXRoaXMuc29sdXRpb24gJiYgKCF0aGlzLnN0YXJ0ZWQgfHwgdGhpcy5xdWV1ZS5sZW5ndGgpKSB7XG4gICAgICAgIHRoaXMuc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0aCgpO1xuICAgIH1cblxuICAgIHN0ZXAoKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wb3AoKTtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMobmV4dCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMudG8gPT09IGZhbHNlIHx8IHRoaXMudGlsZUlzVmFsaWQodGhpcy50bykpIHtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UGF0aCgpIHtcbiAgICAgIHZhciByZXMsIHN0ZXA7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICByZXMgPSBbdGhpcy5zb2x1dGlvbl07XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICByZXMudW5zaGlmdChzdGVwLnByZXYpO1xuICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb3NBdFByYyhwcmMpIHtcbiAgICAgIGlmIChpc05hTihwcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFBvc0F0VGltZSh0aGlzLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKCkgKiBwcmMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc0F0VGltZSh0aW1lKSB7XG4gICAgICB2YXIgcHJjLCBzdGVwO1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgaWYgKHRpbWUgPj0gdGhpcy5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc29sdXRpb24ucG9zVG9UaWxlT2Zmc2V0KHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLngsIHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICAgIHdoaWxlIChzdGVwLmdldFN0YXJ0TGVuZ3RoKCkgPiB0aW1lICYmIChzdGVwLnByZXYgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByYyA9ICh0aW1lIC0gc3RlcC5nZXRTdGFydExlbmd0aCgpKSAvIHN0ZXAuZ2V0TGVuZ3RoKCk7XG4gICAgICAgICAgcmV0dXJuIHN0ZXAucG9zVG9UaWxlT2Zmc2V0KHN0ZXAuZ2V0RW50cnkoKS54ICsgKHN0ZXAuZ2V0RXhpdCgpLnggLSBzdGVwLmdldEVudHJ5KCkueCkgKiBwcmMsIHN0ZXAuZ2V0RW50cnkoKS55ICsgKHN0ZXAuZ2V0RXhpdCgpLnkgLSBzdGVwLmdldEVudHJ5KCkueSkgKiBwcmMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U29sdXRpb25UaWxlTGlzdCgpIHtcbiAgICAgIHZhciBzdGVwLCB0aWxlbGlzdDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB0aWxlbGlzdCA9IFtzdGVwLnRpbGVdO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICAgIHRpbGVsaXN0LnVuc2hpZnQoc3RlcC50aWxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZWxpc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGlsZUlzVmFsaWQodGlsZSkge1xuICAgICAgaWYgKHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZFRpbGVDYWxsYmFjayh0aWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodGlsZSAhPSBudWxsKSAmJiAoIXRpbGUuZW11bGF0ZWQgfHwgKHRpbGUudGlsZSAhPT0gMCAmJiB0aWxlLnRpbGUgIT09IGZhbHNlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmMTtcbiAgICAgIGlmICh0aGlzLnRpbGVzQ29udGFpbmVyLmdldFRpbGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc0NvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgfSBlbHNlIGlmICgoKHJlZjEgPSB0aGlzLnRpbGVzQ29udGFpbmVyW3ldKSAhPSBudWxsID8gcmVmMVt4XSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgeTogeSxcbiAgICAgICAgICB0aWxlOiB0aGlzLnRpbGVzQ29udGFpbmVyW3ldW3hdLFxuICAgICAgICAgIGVtdWxhdGVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0Q29ubmVjdGVkVG9UaWxlKHRpbGUpIHtcbiAgICAgIHZhciBjb25uZWN0ZWQsIHQ7XG4gICAgICBpZiAodGlsZS5nZXRDb25uZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGlsZS5nZXRDb25uZWN0ZWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbm5lY3RlZCA9IFtdO1xuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLnggKyAxLCB0aWxlLnkpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54IC0gMSwgdGlsZS55KSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCwgdGlsZS55ICsgMSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLngsIHRpbGUueSAtIDEpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbm5lY3RlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGROZXh0U3RlcHMoc3RlcCA9IG51bGwpIHtcbiAgICAgIHZhciBpLCBsZW4sIG5leHQsIHJlZjEsIHJlc3VsdHMsIHRpbGU7XG4gICAgICB0aWxlID0gc3RlcCAhPSBudWxsID8gc3RlcC5uZXh0VGlsZSA6IHRoaXMuZnJvbTtcbiAgICAgIHJlZjEgPSB0aGlzLmdldENvbm5lY3RlZFRvVGlsZSh0aWxlKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZjEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgbmV4dCA9IHJlZjFbaV07XG4gICAgICAgIGlmICh0aGlzLnRpbGVJc1ZhbGlkKG5leHQpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYWRkU3RlcChuZXcgUGF0aEZpbmRlci5TdGVwKHRoaXMsIChzdGVwICE9IG51bGwgPyBzdGVwIDogbnVsbCksIHRpbGUsIG5leHQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIHRpbGVFcXVhbCh0aWxlQSwgdGlsZUIpIHtcbiAgICAgIHJldHVybiB0aWxlQSA9PT0gdGlsZUIgfHwgKCh0aWxlQS5lbXVsYXRlZCB8fCB0aWxlQi5lbXVsYXRlZCkgJiYgdGlsZUEueCA9PT0gdGlsZUIueCAmJiB0aWxlQS55ID09PSB0aWxlQi55KTtcbiAgICB9XG5cbiAgICBhcnJpdmVkQXREZXN0aW5hdGlvbihzdGVwKSB7XG4gICAgICBpZiAodGhpcy5hcnJpdmVkQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcnJpdmVkQ2FsbGJhY2soc3RlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlRXF1YWwoc3RlcC50aWxlLCB0aGlzLnRvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBzb2x1dGlvbkNhbmRpZGF0ZTtcbiAgICAgIGlmICh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XSA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKCEoKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkgJiYgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XS5nZXRUb3RhbExlbmd0aCgpIDw9IHN0ZXAuZ2V0VG90YWxMZW5ndGgoKSkpIHtcbiAgICAgICAgaWYgKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlU3RlcCh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldID0gc3RlcDtcbiAgICAgICAgdGhpcy5xdWV1ZS5zcGxpY2UodGhpcy5nZXRTdGVwUmFuayhzdGVwKSwgMCwgc3RlcCk7XG4gICAgICAgIHNvbHV0aW9uQ2FuZGlkYXRlID0gbmV3IFBhdGhGaW5kZXIuU3RlcCh0aGlzLCBzdGVwLCBzdGVwLm5leHRUaWxlLCBudWxsKTtcbiAgICAgICAgaWYgKHRoaXMuYXJyaXZlZEF0RGVzdGluYXRpb24oc29sdXRpb25DYW5kaWRhdGUpICYmICEoKHRoaXMuc29sdXRpb24gIT0gbnVsbCkgJiYgdGhpcy5zb2x1dGlvbi5wcmV2LmdldFRvdGFsTGVuZ3RoKCkgPD0gc3RlcC5nZXRUb3RhbExlbmd0aCgpKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNvbHV0aW9uID0gc29sdXRpb25DYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5xdWV1ZS5pbmRleE9mKHN0ZXApO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBiZXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5xdWV1ZS5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBnZXRTdGVwUmFuayhzdGVwKSB7XG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoc3RlcC5nZXRFZmZpY2llbmN5KCksIDAsIHRoaXMucXVldWUubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgbWF4KSB7XG4gICAgICB2YXIgcmVmLCByZWZQb3M7XG4gICAgICByZWZQb3MgPSBNYXRoLmZsb29yKChtYXggLSBtaW4pIC8gMikgKyBtaW47XG4gICAgICByZWYgPSB0aGlzLnF1ZXVlW3JlZlBvc10uZ2V0RWZmaWNpZW5jeSgpO1xuICAgICAgaWYgKHJlZiA9PT0gZWZmaWNpZW5jeSkge1xuICAgICAgICByZXR1cm4gcmVmUG9zO1xuICAgICAgfSBlbHNlIGlmIChyZWYgPiBlZmZpY2llbmN5KSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1pbikge1xuICAgICAgICAgIHJldHVybiBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgcmVmUG9zIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1heCkge1xuICAgICAgICAgIHJldHVybiBtYXggKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCByZWZQb3MgKyAxLCBtYXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aEZpbmRlci5wcm9wZXJ0aWVzKHtcbiAgICB2YWxpZFRpbGVDYWxsYmFjazoge31cbiAgfSk7XG5cbiAgcmV0dXJuIFBhdGhGaW5kZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cblBhdGhGaW5kZXIuU3RlcCA9IGNsYXNzIFN0ZXAge1xuICBjb25zdHJ1Y3RvcihwYXRoRmluZGVyLCBwcmV2LCB0aWxlMSwgbmV4dFRpbGUpIHtcbiAgICB0aGlzLnBhdGhGaW5kZXIgPSBwYXRoRmluZGVyO1xuICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgdGhpcy50aWxlID0gdGlsZTE7XG4gICAgdGhpcy5uZXh0VGlsZSA9IG5leHRUaWxlO1xuICB9XG5cbiAgcG9zVG9UaWxlT2Zmc2V0KHgsIHkpIHtcbiAgICB2YXIgdGlsZTtcbiAgICB0aWxlID0gTWF0aC5mbG9vcih4KSA9PT0gdGhpcy50aWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy50aWxlLnkgPyB0aGlzLnRpbGUgOiAodGhpcy5uZXh0VGlsZSAhPSBudWxsKSAmJiBNYXRoLmZsb29yKHgpID09PSB0aGlzLm5leHRUaWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy5uZXh0VGlsZS55ID8gdGhpcy5uZXh0VGlsZSA6ICh0aGlzLnByZXYgIT0gbnVsbCkgJiYgTWF0aC5mbG9vcih4KSA9PT0gdGhpcy5wcmV2LnRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLnByZXYudGlsZS55ID8gdGhpcy5wcmV2LnRpbGUgOiBjb25zb2xlLmxvZygnTWF0aC5mbG9vcignICsgeCArICcpID09ICcgKyB0aGlzLnRpbGUueCwgJ01hdGguZmxvb3IoJyArIHkgKyAnKSA9PSAnICsgdGhpcy50aWxlLnksIHRoaXMpO1xuICAgIHJldHVybiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICBvZmZzZXRYOiB4IC0gdGlsZS54LFxuICAgICAgb2Zmc2V0WTogeSAtIHRpbGUueVxuICAgIH07XG4gIH1cblxuICBnZXRFeGl0KCkge1xuICAgIGlmICh0aGlzLmV4aXQgPT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMubmV4dFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmV4aXQgPSB7XG4gICAgICAgICAgeDogKHRoaXMudGlsZS54ICsgdGhpcy5uZXh0VGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMubmV4dFRpbGUueSArIDEpIC8gMlxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5leGl0ID0ge1xuICAgICAgICAgIHg6IHRoaXMudGlsZS54ICsgMC41LFxuICAgICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4aXQ7XG4gIH1cblxuICBnZXRFbnRyeSgpIHtcbiAgICBpZiAodGhpcy5lbnRyeSA9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lbnRyeSA9IHtcbiAgICAgICAgICB4OiAodGhpcy50aWxlLnggKyB0aGlzLnByZXYudGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMucHJldi50aWxlLnkgKyAxKSAvIDJcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZW50cnkgPSB7XG4gICAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUsXG4gICAgICAgICAgeTogdGhpcy50aWxlLnkgKyAwLjVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW50cnk7XG4gIH1cblxuICBnZXRMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gKHRoaXMubmV4dFRpbGUgPT0gbnVsbCkgfHwgKHRoaXMucHJldiA9PSBudWxsKSA/IDAuNSA6IHRoaXMucHJldi50aWxlLnggPT09IHRoaXMubmV4dFRpbGUueCB8fCB0aGlzLnByZXYudGlsZS55ID09PSB0aGlzLm5leHRUaWxlLnkgPyAxIDogTWF0aC5zcXJ0KDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxlbmd0aDtcbiAgfVxuXG4gIGdldFN0YXJ0TGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLnN0YXJ0TGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhcnRMZW5ndGggPSB0aGlzLnByZXYgIT0gbnVsbCA/IHRoaXMucHJldi5nZXRUb3RhbExlbmd0aCgpIDogMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRMZW5ndGg7XG4gIH1cblxuICBnZXRUb3RhbExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy50b3RhbExlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnRvdGFsTGVuZ3RoID0gdGhpcy5nZXRTdGFydExlbmd0aCgpICsgdGhpcy5nZXRMZW5ndGgoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG90YWxMZW5ndGg7XG4gIH1cblxuICBnZXRFZmZpY2llbmN5KCkge1xuICAgIGlmICh0aGlzLmVmZmljaWVuY3kgPT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhdGhGaW5kZXIuZWZmaWNpZW5jeUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5ID0gdGhpcy5wYXRoRmluZGVyLmVmZmljaWVuY3lDYWxsYmFjayh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeSA9IC10aGlzLmdldFJlbWFpbmluZygpICogMS4xIC0gdGhpcy5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lZmZpY2llbmN5O1xuICB9XG5cbiAgZ2V0UmVtYWluaW5nKCkge1xuICAgIHZhciBmcm9tLCB0bywgeCwgeTtcbiAgICBpZiAodGhpcy5yZW1haW5pbmcgPT0gbnVsbCkge1xuICAgICAgZnJvbSA9IHRoaXMuZ2V0RXhpdCgpO1xuICAgICAgdG8gPSB7XG4gICAgICAgIHg6IHRoaXMucGF0aEZpbmRlci50by54ICsgMC41LFxuICAgICAgICB5OiB0aGlzLnBhdGhGaW5kZXIudG8ueSArIDAuNVxuICAgICAgfTtcbiAgICAgIHggPSB0by54IC0gZnJvbS54O1xuICAgICAgeSA9IHRvLnkgLSBmcm9tLnk7XG4gICAgICB0aGlzLnJlbWFpbmluZyA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVtYWluaW5nO1xuICB9XG5cbn07XG5cbnJldHVybihQYXRoRmluZGVyKTt9KTsiLCJpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICBncmVla0FscGhhYmV0OiByZXF1aXJlKCcuL3N0cmluZ3MvZ3JlZWtBbHBoYWJldCcpLFxuICAgICAgc3Rhck5hbWVzOiByZXF1aXJlKCcuL3N0cmluZ3Mvc3Rhck5hbWVzJylcbiAgfTtcbn0iLCJtb2R1bGUuZXhwb3J0cz1bXG5cImFscGhhXCIsICAgXCJiZXRhXCIsICAgIFwiZ2FtbWFcIiwgICBcImRlbHRhXCIsXG5cImVwc2lsb25cIiwgXCJ6ZXRhXCIsICAgIFwiZXRhXCIsICAgICBcInRoZXRhXCIsXG5cImlvdGFcIiwgICAgXCJrYXBwYVwiLCAgIFwibGFtYmRhXCIsICBcIm11XCIsXG5cIm51XCIsICAgICAgXCJ4aVwiLCAgICAgIFwib21pY3JvblwiLCBcInBpXCIsXHRcblwicmhvXCIsICAgICBcInNpZ21hXCIsICAgXCJ0YXVcIiwgICAgIFwidXBzaWxvblwiLFxuXCJwaGlcIiwgICAgIFwiY2hpXCIsICAgICBcInBzaVwiLCAgICAgXCJvbWVnYVwiXG5dIiwibW9kdWxlLmV4cG9ydHM9W1xuXCJBY2hlcm5hclwiLCAgICAgXCJNYWlhXCIsICAgICAgICBcIkF0bGFzXCIsICAgICAgICBcIlNhbG1cIiwgICAgICAgXCJBbG5pbGFtXCIsICAgICAgXCJOZWtrYXJcIiwgICAgICBcIkVsbmF0aFwiLCAgICAgICBcIlRodWJhblwiLFxuXCJBY2hpcmRcIiwgICAgICAgXCJNYXJmaWtcIiwgICAgICBcIkF1dmFcIiwgICAgICAgICBcIlNhcmdhc1wiLCAgICAgXCJBbG5pdGFrXCIsICAgICAgXCJOaWhhbFwiLCAgICAgICBcIkVuaWZcIiwgICAgICAgICBcIlRvcmN1bGFyaXNcIixcblwiQWNydXhcIiwgICAgICAgIFwiTWFya2FiXCIsICAgICAgXCJBdmlvclwiLCAgICAgICAgXCJTYXJpblwiLCAgICAgIFwiQWxwaGFyZFwiLCAgICAgIFwiTnVua2lcIiwgICAgICAgXCJFdGFtaW5cIiwgICAgICAgXCJUdXJhaXNcIixcblwiQWN1YmVuc1wiLCAgICAgIFwiTWF0YXJcIiwgICAgICAgXCJBemVsZmFmYWdlXCIsICAgXCJTY2VwdHJ1bVwiLCAgIFwiQWxwaGVra2FcIiwgICAgIFwiTnVzYWthblwiLCAgICAgXCJGb21hbGhhdXRcIiwgICAgXCJUeWxcIixcblwiQWRhcmFcIiwgICAgICAgIFwiTWVic3V0YVwiLCAgICAgXCJBemhhXCIsICAgICAgICAgXCJTY2hlYXRcIiwgICAgIFwiQWxwaGVyYXR6XCIsICAgIFwiUGVhY29ja1wiLCAgICAgXCJGb3JuYWNpc1wiLCAgICAgXCJVbnVrYWxoYWlcIixcblwiQWRoYWZlcmFcIiwgICAgIFwiTWVncmV6XCIsICAgICAgXCJBem1pZGlza2VcIiwgICAgXCJTZWdpblwiLCAgICAgIFwiQWxyYWlcIiwgICAgICAgIFwiUGhhZFwiLCAgICAgICAgXCJGdXJ1ZFwiLCAgICAgICAgXCJWZWdhXCIsXG5cIkFkaGlsXCIsICAgICAgICBcIk1laXNzYVwiLCAgICAgIFwiQmFoYW1cIiwgICAgICAgIFwiU2VnaW51c1wiLCAgICBcIkFscmlzaGFcIiwgICAgICBcIlBoYWV0XCIsICAgICAgIFwiR2FjcnV4XCIsICAgICAgIFwiVmluZGVtaWF0cml4XCIsXG5cIkFnZW5hXCIsICAgICAgICBcIk1la2J1ZGFcIiwgICAgIFwiQmVjcnV4XCIsICAgICAgIFwiU2hhbVwiLCAgICAgICBcIkFsc2FmaVwiLCAgICAgICBcIlBoZXJrYWRcIiwgICAgIFwiR2lhbmZhclwiLCAgICAgIFwiV2FzYXRcIixcblwiQWxhZGZhclwiLCAgICAgIFwiTWVua2FsaW5hblwiLCAgXCJCZWlkXCIsICAgICAgICAgXCJTaGFyYXRhblwiLCAgIFwiQWxzY2lhdWthdFwiLCAgIFwiUGxlaW9uZVwiLCAgICAgXCJHb21laXNhXCIsICAgICAgXCJXZXplblwiLFxuXCJBbGF0aGZhclwiLCAgICAgXCJNZW5rYXJcIiwgICAgICBcIkJlbGxhdHJpeFwiLCAgICBcIlNoYXVsYVwiLCAgICAgXCJBbHNoYWluXCIsICAgICAgXCJQb2xhcmlzXCIsICAgICBcIkdyYWZmaWFzXCIsICAgICBcIldlem5cIixcblwiQWxiYWxkYWhcIiwgICAgIFwiTWVua2VudFwiLCAgICAgXCJCZXRlbGdldXNlXCIsICAgXCJTaGVkaXJcIiwgICAgIFwiQWxzaGF0XCIsICAgICAgIFwiUG9sbHV4XCIsICAgICAgXCJHcmFmaWFzXCIsICAgICAgXCJZZWRcIixcblwiQWxiYWxpXCIsICAgICAgIFwiTWVua2liXCIsICAgICAgXCJCb3RlaW5cIiwgICAgICAgXCJTaGVsaWFrXCIsICAgIFwiQWxzdWhhaWxcIiwgICAgIFwiUG9ycmltYVwiLCAgICAgXCJHcnVtaXVtXCIsICAgICAgXCJZaWxkdW5cIixcblwiQWxiaXJlb1wiLCAgICAgIFwiTWVyYWtcIiwgICAgICAgXCJCcmFjaGl1bVwiLCAgICAgXCJTaXJpdXNcIiwgICAgIFwiQWx0YWlyXCIsICAgICAgIFwiUHJhZWNpcHVhXCIsICAgXCJIYWRhclwiLCAgICAgICAgXCJaYW5pYWhcIixcblwiQWxjaGliYVwiLCAgICAgIFwiTWVyZ2FcIiwgICAgICAgXCJDYW5vcHVzXCIsICAgICAgXCJTaXR1bGFcIiwgICAgIFwiQWx0YXJmXCIsICAgICAgIFwiUHJvY3lvblwiLCAgICAgXCJIYWVkaVwiLCAgICAgICAgXCJaYXVyYWtcIixcblwiQWxjb3JcIiwgICAgICAgIFwiTWVyb3BlXCIsICAgICAgXCJDYXBlbGxhXCIsICAgICAgXCJTa2F0XCIsICAgICAgIFwiQWx0ZXJmXCIsICAgICAgIFwiUHJvcHVzXCIsICAgICAgXCJIYW1hbFwiLCAgICAgICAgXCJaYXZpamFoXCIsXG5cIkFsY3lvbmVcIiwgICAgICBcIk1lc2FydGhpbVwiLCAgIFwiQ2FwaFwiLCAgICAgICAgIFwiU3BpY2FcIiwgICAgICBcIkFsdWRyYVwiLCAgICAgICBcIlJhbmFcIiwgICAgICAgIFwiSGFzc2FsZWhcIiwgICAgIFwiWmliYWxcIixcblwiQWxkZXJhbWluXCIsICAgIFwiTWV0YWxsYWhcIiwgICAgXCJDYXN0b3JcIiwgICAgICAgXCJTdGVyb3BlXCIsICAgIFwiQWx1bGFcIiwgICAgICAgIFwiUmFzXCIsICAgICAgICAgXCJIZXplXCIsICAgICAgICAgXCJab3NtYVwiLFxuXCJBbGRoaWJhaFwiLCAgICAgXCJNaWFwbGFjaWR1c1wiLCBcIkNlYmFscmFpXCIsICAgICBcIlN1YWxvY2luXCIsICAgXCJBbHlhXCIsICAgICAgICAgXCJSYXNhbGdldGhpXCIsICBcIkhvZWR1c1wiLCAgICAgICBcIkFxdWFyaXVzXCIsXG5cIkFsZmlya1wiLCAgICAgICBcIk1pbmthclwiLCAgICAgIFwiQ2VsYWVub1wiLCAgICAgIFwiU3VicmFcIiwgICAgICBcIkFsemlyclwiLCAgICAgICBcIlJhc2FsaGFndWVcIiwgIFwiSG9tYW1cIiwgICAgICAgIFwiQXJpZXNcIixcblwiQWxnZW5pYlwiLCAgICAgIFwiTWludGFrYVwiLCAgICAgXCJDaGFyYVwiLCAgICAgICAgXCJTdWhhaWxcIiwgICAgIFwiQW5jaGFcIiwgICAgICAgIFwiUmFzdGFiYW5cIiwgICAgXCJIeWFkdW1cIiwgICAgICAgXCJDZXBoZXVzXCIsXG5cIkFsZ2llYmFcIiwgICAgICBcIk1pcmFcIiwgICAgICAgIFwiQ2hvcnRcIiwgICAgICAgIFwiU3VsYWZhdFwiLCAgICBcIkFuZ2V0ZW5hclwiLCAgICBcIlJlZ3VsdXNcIiwgICAgIFwiSXphclwiLCAgICAgICAgIFwiQ2V0dXNcIixcblwiQWxnb2xcIiwgICAgICAgIFwiTWlyYWNoXCIsICAgICAgXCJDdXJzYVwiLCAgICAgICAgXCJTeXJtYVwiLCAgICAgIFwiQW5rYWFcIiwgICAgICAgIFwiUmlnZWxcIiwgICAgICAgXCJKYWJiYWhcIiwgICAgICAgXCJDb2x1bWJhXCIsXG5cIkFsZ29yYWJcIiwgICAgICBcIk1pcmFtXCIsICAgICAgIFwiRGFiaWhcIiwgICAgICAgIFwiVGFiaXRcIiwgICAgICBcIkFuc2VyXCIsICAgICAgICBcIlJvdGFuZXZcIiwgICAgIFwiS2FqYW1cIiwgICAgICAgIFwiQ29tYVwiLFxuXCJBbGhlbmFcIiwgICAgICAgXCJNaXJwaGFrXCIsICAgICBcIkRlbmViXCIsICAgICAgICBcIlRhbGl0aGFcIiwgICAgXCJBbnRhcmVzXCIsICAgICAgXCJSdWNoYmFcIiwgICAgICBcIkthdXNcIiwgICAgICAgICBcIkNvcm9uYVwiLFxuXCJBbGlvdGhcIiwgICAgICAgXCJNaXphclwiLCAgICAgICBcIkRlbmVib2xhXCIsICAgICBcIlRhbmlhXCIsICAgICAgXCJBcmN0dXJ1c1wiLCAgICAgXCJSdWNoYmFoXCIsICAgICBcIktlaWRcIiwgICAgICAgICBcIkNydXhcIixcblwiQWxrYWlkXCIsICAgICAgIFwiTXVmcmlkXCIsICAgICAgXCJEaGVuZWJcIiwgICAgICAgXCJUYXJhemVkXCIsICAgIFwiQXJrYWJcIiwgICAgICAgIFwiUnVrYmF0XCIsICAgICAgXCJLaXRhbHBoYVwiLCAgICAgXCJEcmFjb1wiLFxuXCJBbGthbHVyb3BzXCIsICAgXCJNdWxpcGhlblwiLCAgICBcIkRpYWRlbVwiLCAgICAgICBcIlRheWdldGFcIiwgICAgXCJBcm5lYlwiLCAgICAgICAgXCJTYWJpa1wiLCAgICAgICBcIktvY2FiXCIsICAgICAgICBcIkdydXNcIixcblwiQWxrZXNcIiwgICAgICAgIFwiTXVyemltXCIsICAgICAgXCJEaXBoZGFcIiwgICAgICAgXCJUZWdtZW5cIiwgICAgIFwiQXJyYWtpc1wiLCAgICAgIFwiU2FkYWxhY2hiaWFcIiwgXCJLb3JuZXBob3Jvc1wiLCAgXCJIeWRyYVwiLFxuXCJBbGt1cmhhaFwiLCAgICAgXCJNdXNjaWRhXCIsICAgICBcIkRzY2h1YmJhXCIsICAgICBcIlRlamF0XCIsICAgICAgXCJBc2NlbGxhXCIsICAgICAgXCJTYWRhbG1lbGlrXCIsICBcIktyYXpcIiwgICAgICAgICBcIkxhY2VydGFcIixcblwiQWxtYWFrXCIsICAgICAgIFwiTmFvc1wiLCAgICAgICAgXCJEc2liYW5cIiwgICAgICAgXCJUZXJlYmVsbHVtXCIsIFwiQXNlbGx1c1wiLCAgICAgIFwiU2FkYWxzdXVkXCIsICAgXCJLdW1hXCIsICAgICAgICAgXCJNZW5zYVwiLFxuXCJBbG5haXJcIiwgICAgICAgXCJOYXNoXCIsICAgICAgICBcIkR1YmhlXCIsICAgICAgICBcIlRoYWJpdFwiLCAgICAgXCJBc3Rlcm9wZVwiLCAgICAgXCJTYWRyXCIsICAgICAgICBcIkxlc2F0aFwiLCAgICAgICBcIk1hYXN5bVwiLFxuXCJBbG5hdGhcIiwgICAgICAgXCJOYXNoaXJhXCIsICAgICBcIkVsZWN0cmFcIiwgICAgICBcIlRoZWVtaW1cIiwgICAgXCJBdGlrXCIsICAgICAgICAgXCJTYWlwaFwiLCAgICAgICBcIlBob2VuaXhcIiwgICAgICBcIk5vcm1hXCJcbl0iLCJ2YXIgRGlyZWN0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpcmVjdGlvbiA9IGNsYXNzIERpcmVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHgsIHksIGludmVyc2VOYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy5pbnZlcnNlTmFtZSA9IGludmVyc2VOYW1lO1xuICB9XG5cbiAgZ2V0SW52ZXJzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvclt0aGlzLmludmVyc2VOYW1lXTtcbiAgfVxuXG59O1xuXG5EaXJlY3Rpb24udXAgPSBuZXcgRGlyZWN0aW9uKCd1cCcsIDAsIC0xLCAnZG93bicpO1xuXG5EaXJlY3Rpb24uZG93biA9IG5ldyBEaXJlY3Rpb24oJ2Rvd24nLCAwLCAxLCAndXAnKTtcblxuRGlyZWN0aW9uLmxlZnQgPSBuZXcgRGlyZWN0aW9uKCdsZWZ0JywgLTEsIDAsICdyaWdodCcpO1xuXG5EaXJlY3Rpb24ucmlnaHQgPSBuZXcgRGlyZWN0aW9uKCdyaWdodCcsIDEsIDAsICdsZWZ0Jyk7XG5cbkRpcmVjdGlvbi5hZGphY2VudHMgPSBbRGlyZWN0aW9uLnVwLCBEaXJlY3Rpb24uZG93biwgRGlyZWN0aW9uLmxlZnQsIERpcmVjdGlvbi5yaWdodF07XG5cbkRpcmVjdGlvbi50b3BMZWZ0ID0gbmV3IERpcmVjdGlvbigndG9wTGVmdCcsIC0xLCAtMSwgJ2JvdHRvbVJpZ2h0Jyk7XG5cbkRpcmVjdGlvbi50b3BSaWdodCA9IG5ldyBEaXJlY3Rpb24oJ3RvcFJpZ2h0JywgMSwgLTEsICdib3R0b21MZWZ0Jyk7XG5cbkRpcmVjdGlvbi5ib3R0b21SaWdodCA9IG5ldyBEaXJlY3Rpb24oJ2JvdHRvbVJpZ2h0JywgMSwgMSwgJ3RvcExlZnQnKTtcblxuRGlyZWN0aW9uLmJvdHRvbUxlZnQgPSBuZXcgRGlyZWN0aW9uKCdib3R0b21MZWZ0JywgLTEsIDEsICd0b3BSaWdodCcpO1xuXG5EaXJlY3Rpb24uY29ybmVycyA9IFtEaXJlY3Rpb24udG9wTGVmdCwgRGlyZWN0aW9uLnRvcFJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tUmlnaHQsIERpcmVjdGlvbi5ib3R0b21MZWZ0XTtcblxuRGlyZWN0aW9uLmFsbCA9IFtEaXJlY3Rpb24udXAsIERpcmVjdGlvbi5kb3duLCBEaXJlY3Rpb24ubGVmdCwgRGlyZWN0aW9uLnJpZ2h0LCBEaXJlY3Rpb24udG9wTGVmdCwgRGlyZWN0aW9uLnRvcFJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tUmlnaHQsIERpcmVjdGlvbi5ib3R0b21MZWZ0XTtcbiIsInZhciBEaXJlY3Rpb24sIEVsZW1lbnQsIFRpbGU7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgnLi9EaXJlY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoeDEsIHkxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy54ID0geDE7XG4gICAgICB0aGlzLnkgPSB5MTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0UmVsYXRpdmVUaWxlKHgsIHkpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5lciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5nZXRUaWxlKHRoaXMueCArIHgsIHRoaXMueSArIHkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpbmREaXJlY3Rpb25PZih0aWxlKSB7XG4gICAgICBpZiAodGlsZS50aWxlKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlLnRpbGU7XG4gICAgICB9XG4gICAgICBpZiAoKHRpbGUueCAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWxsLmZpbmQoKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gZC54ID09PSB0aWxlLnggLSB0aGlzLnggJiYgZC55ID09PSB0aWxlLnkgLSB0aGlzLnk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZENoaWxkKGNoaWxkLCBjaGVja1JlZiA9IHRydWUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGVja1JlZikge1xuICAgICAgICBjaGlsZC50aWxlID0gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZChjaGlsZCwgY2hlY2tSZWYgPSB0cnVlKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY2hlY2tSZWYgJiYgY2hpbGQudGlsZSA9PT0gdGhpcykge1xuICAgICAgICByZXR1cm4gY2hpbGQudGlsZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGlzdCh0aWxlKSB7XG4gICAgICB2YXIgY3RuRGlzdCwgcmVmLCB4LCB5O1xuICAgICAgaWYgKCh0aWxlICE9IG51bGwgPyB0aWxlLmdldEZpbmFsVGlsZSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICAgIH1cbiAgICAgIGlmICgoKHRpbGUgIT0gbnVsbCA/IHRpbGUueCA6IHZvaWQgMCkgIT0gbnVsbCkgJiYgKHRpbGUueSAhPSBudWxsKSAmJiAodGhpcy54ICE9IG51bGwpICYmICh0aGlzLnkgIT0gbnVsbCkgJiYgKHRoaXMuY29udGFpbmVyID09PSB0aWxlLmNvbnRhaW5lciB8fCAoY3RuRGlzdCA9IChyZWYgPSB0aGlzLmNvbnRhaW5lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuZGlzdCA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmRpc3QodGlsZS5jb250YWluZXIpIDogdm9pZCAwIDogdm9pZCAwKSkpIHtcbiAgICAgICAgeCA9IHRpbGUueCAtIHRoaXMueDtcbiAgICAgICAgeSA9IHRpbGUueSAtIHRoaXMueTtcbiAgICAgICAgaWYgKGN0bkRpc3QpIHtcbiAgICAgICAgICB4ICs9IGN0bkRpc3QueDtcbiAgICAgICAgICB5ICs9IGN0bkRpc3QueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgeTogeSxcbiAgICAgICAgICBsZW5ndGg6IE1hdGguc3FydCh4ICogeCArIHkgKiB5KVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RmluYWxUaWxlKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZS5wcm9wZXJ0aWVzKHtcbiAgICBjaGlsZHJlbjoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5jb250YWluZXIgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkamFjZW50VGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZS5pbnZhbGlkYXRlQWRqYWNlbnRUaWxlcygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGphY2VudFRpbGVzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGlvbikge1xuICAgICAgICBpZiAoaW52YWxpZGF0aW9uLnByb3AoJ2NvbnRhaW5lcicpKSB7XG4gICAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5hZGphY2VudHMubWFwKChkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGl2ZVRpbGUoZC54LCBkLnkpO1xuICAgICAgICAgIH0pLmZpbHRlcigodCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHQgIT0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEVsZW1lbnQsIFRpbGVDb250YWluZXIsIFRpbGVSZWZlcmVuY2U7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGlsZVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vVGlsZVJlZmVyZW5jZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVDb250YWluZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVDb250YWluZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBfYWRkVG9Cb25kYXJpZXModGlsZSwgYm91bmRhcmllcykge1xuICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB0aWxlLnkgPCBib3VuZGFyaWVzLnRvcCkge1xuICAgICAgICBib3VuZGFyaWVzLnRvcCA9IHRpbGUueTtcbiAgICAgIH1cbiAgICAgIGlmICgoYm91bmRhcmllcy5sZWZ0ID09IG51bGwpIHx8IHRpbGUueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICBib3VuZGFyaWVzLmxlZnQgPSB0aWxlLng7XG4gICAgICB9XG4gICAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IHRpbGUueSA+IGJvdW5kYXJpZXMuYm90dG9tKSB7XG4gICAgICAgIGJvdW5kYXJpZXMuYm90dG9tID0gdGlsZS55O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHRpbGUueCA+IGJvdW5kYXJpZXMucmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJpZXMucmlnaHQgPSB0aWxlLng7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHRoaXMuY29vcmRzID0ge307XG4gICAgICByZXR1cm4gdGhpcy50aWxlcyA9IFtdO1xuICAgIH1cblxuICAgIGFkZFRpbGUodGlsZSkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICghdGhpcy50aWxlcy5pbmNsdWRlcyh0aWxlKSkge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIGlmICh0aGlzLmNvb3Jkc1t0aWxlLnhdID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNvb3Jkc1t0aWxlLnhdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldID0gdGlsZTtcbiAgICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYgPSB0aGlzLl9ib3VuZGFyaWVzKSAhPSBudWxsID8gcmVmLmNhbGN1bGF0ZWQgOiB2b2lkIDApIHtcbiAgICAgICAgICB0aGlzLl9hZGRUb0JvbmRhcmllcyh0aWxlLCB0aGlzLl9ib3VuZGFyaWVzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVtb3ZlVGlsZSh0aWxlKSB7XG4gICAgICB2YXIgaW5kZXgsIHJlZjtcbiAgICAgIGluZGV4ID0gdGhpcy50aWxlcy5pbmRleE9mKHRpbGUpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBkZWxldGUgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldO1xuICAgICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuX2JvdW5kYXJpZXMpICE9IG51bGwgPyByZWYuY2FsY3VsYXRlZCA6IHZvaWQgMCkge1xuICAgICAgICAgIGlmICh0aGlzLmJvdW5kYXJpZXMudG9wID09PSB0aWxlLnkgfHwgdGhpcy5ib3VuZGFyaWVzLmJvdHRvbSA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5sZWZ0ID09PSB0aWxlLnggfHwgdGhpcy5ib3VuZGFyaWVzLnJpZ2h0ID09PSB0aWxlLngpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVCb3VuZGFyaWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlVGlsZUF0KHgsIHkpIHtcbiAgICAgIHZhciB0aWxlO1xuICAgICAgaWYgKHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlVGlsZSh0aWxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUaWxlKHgsIHkpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoKChyZWYgPSB0aGlzLmNvb3Jkc1t4XSkgIT0gbnVsbCA/IHJlZlt5XSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb29yZHNbeF1beV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9hZE1hdHJpeChtYXRyaXgpIHtcbiAgICAgIHZhciBvcHRpb25zLCByb3csIHRpbGUsIHgsIHk7XG4gICAgICBmb3IgKHkgaW4gbWF0cml4KSB7XG4gICAgICAgIHJvdyA9IG1hdHJpeFt5XTtcbiAgICAgICAgZm9yICh4IGluIHJvdykge1xuICAgICAgICAgIHRpbGUgPSByb3dbeF07XG4gICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHg6IHBhcnNlSW50KHgpLFxuICAgICAgICAgICAgeTogcGFyc2VJbnQoeSlcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0eXBlb2YgdGlsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFRpbGUodGlsZShvcHRpb25zKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbGUueCA9IG9wdGlvbnMueDtcbiAgICAgICAgICAgIHRpbGUueSA9IG9wdGlvbnMueTtcbiAgICAgICAgICAgIHRoaXMuYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGluUmFuZ2UodGlsZSwgcmFuZ2UpIHtcbiAgICAgIHZhciBmb3VuZCwgaSwgaiwgcmVmLCByZWYxLCByZWYyLCByZWYzLCB0aWxlcywgeCwgeTtcbiAgICAgIHRpbGVzID0gW107XG4gICAgICByYW5nZS0tO1xuICAgICAgZm9yICh4ID0gaSA9IHJlZiA9IHRpbGUueCAtIHJhbmdlLCByZWYxID0gdGlsZS54ICsgcmFuZ2U7IChyZWYgPD0gcmVmMSA/IGkgPD0gcmVmMSA6IGkgPj0gcmVmMSk7IHggPSByZWYgPD0gcmVmMSA/ICsraSA6IC0taSkge1xuICAgICAgICBmb3IgKHkgPSBqID0gcmVmMiA9IHRpbGUueSAtIHJhbmdlLCByZWYzID0gdGlsZS55ICsgcmFuZ2U7IChyZWYyIDw9IHJlZjMgPyBqIDw9IHJlZjMgOiBqID49IHJlZjMpOyB5ID0gcmVmMiA8PSByZWYzID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgaWYgKE1hdGguc3FydCgoeCAtIHRpbGUueCkgKiAoeCAtIHRpbGUueCkgKyAoeSAtIHRpbGUueSkgKiAoeSAtIHRpbGUueSkpIDw9IHJhbmdlICYmICgoZm91bmQgPSB0aGlzLmdldFRpbGUoeCwgeSkpICE9IG51bGwpKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICBhbGxUaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNsaWNlKCk7XG4gICAgfVxuXG4gICAgY2xlYXJBbGwoKSB7XG4gICAgICB2YXIgaSwgbGVuLCByZWYsIHRpbGU7XG4gICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICByZWYgPSB0aGlzLnRpbGVzO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aWxlID0gcmVmW2ldO1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jb29yZHMgPSB7fTtcbiAgICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb3Nlc3Qob3JpZ2luVGlsZSwgZmlsdGVyKSB7XG4gICAgICB2YXIgY2FuZGlkYXRlcywgZ2V0U2NvcmU7XG4gICAgICBnZXRTY29yZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICAgICAgICBpZiAoY2FuZGlkYXRlLnNjb3JlICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLnNjb3JlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGUuc2NvcmUgPSBjYW5kaWRhdGUuZ2V0RmluYWxUaWxlKCkuZGlzdChvcmlnaW5UaWxlKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjYW5kaWRhdGVzID0gdGhpcy50aWxlcy5maWx0ZXIoZmlsdGVyKS5tYXAoKHQpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlUmVmZXJlbmNlKHQpO1xuICAgICAgfSk7XG4gICAgICBjYW5kaWRhdGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldFNjb3JlKGEpIC0gZ2V0U2NvcmUoYik7XG4gICAgICB9KTtcbiAgICAgIGlmIChjYW5kaWRhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZXNbMF0udGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvcHkoKSB7XG4gICAgICB2YXIgb3V0O1xuICAgICAgb3V0ID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICAgIG91dC5jb29yZHMgPSB0aGlzLmNvb3JkcztcbiAgICAgIG91dC50aWxlcyA9IHRoaXMudGlsZXM7XG4gICAgICBvdXQub3duZXIgPSBmYWxzZTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgbWVyZ2UoY3RuLCBtZXJnZUZuLCBhc093bmVyID0gZmFsc2UpIHtcbiAgICAgIHZhciBvdXQsIHRtcDtcbiAgICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICBvdXQub3duZXIgPSBhc093bmVyO1xuICAgICAgdG1wID0gY3RuLmNvcHkoKTtcbiAgICAgIHRoaXMudGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlQSkge1xuICAgICAgICB2YXIgbWVyZ2VkVGlsZSwgdGlsZUI7XG4gICAgICAgIHRpbGVCID0gdG1wLmdldFRpbGUodGlsZUEueCwgdGlsZUEueSk7XG4gICAgICAgIGlmICh0aWxlQikge1xuICAgICAgICAgIHRtcC5yZW1vdmVUaWxlKHRpbGVCKTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRUaWxlID0gbWVyZ2VGbih0aWxlQSwgdGlsZUIpO1xuICAgICAgICBpZiAobWVyZ2VkVGlsZSkge1xuICAgICAgICAgIHJldHVybiBvdXQuYWRkVGlsZShtZXJnZWRUaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0bXAudGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlQikge1xuICAgICAgICB2YXIgbWVyZ2VkVGlsZTtcbiAgICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4obnVsbCwgdGlsZUIpO1xuICAgICAgICBpZiAobWVyZ2VkVGlsZSkge1xuICAgICAgICAgIHJldHVybiBvdXQuYWRkVGlsZShtZXJnZWRUaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICB9O1xuXG4gIFRpbGVDb250YWluZXIucHJvcGVydGllcyh7XG4gICAgb3duZXI6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGJvdW5kYXJpZXM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBib3VuZGFyaWVzO1xuICAgICAgICBib3VuZGFyaWVzID0ge1xuICAgICAgICAgIHRvcDogbnVsbCxcbiAgICAgICAgICBsZWZ0OiBudWxsLFxuICAgICAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgICAgICByaWdodDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkVG9Cb25kYXJpZXModGlsZSwgYm91bmRhcmllcyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRhcmllcztcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlQ29udGFpbmVyO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIFRpbGVSZWZlcmVuY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZVJlZmVyZW5jZSA9IGNsYXNzIFRpbGVSZWZlcmVuY2Uge1xuICBjb25zdHJ1Y3Rvcih0aWxlKSB7XG4gICAgdGhpcy50aWxlID0gdGlsZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICB4OiB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbmFsVGlsZSgpLng7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB5OiB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbmFsVGlsZSgpLnk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEZpbmFsVGlsZSgpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlLmdldEZpbmFsVGlsZSgpO1xuICB9XG5cbn07XG4iLCJ2YXIgRWxlbWVudCwgVGlsZWQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGlsZWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBwdXRPblJhbmRvbVRpbGUodGlsZXMpIHtcbiAgICAgIHZhciBmb3VuZDtcbiAgICAgIGZvdW5kID0gdGhpcy5nZXRSYW5kb21WYWxpZFRpbGUodGlsZXMpO1xuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGUgPSBmb3VuZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRSYW5kb21WYWxpZFRpbGUodGlsZXMpIHtcbiAgICAgIHZhciBjYW5kaWRhdGUsIHBvcywgcmVtYWluaW5nO1xuICAgICAgcmVtYWluaW5nID0gdGlsZXMuc2xpY2UoKTtcbiAgICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByZW1haW5pbmcubGVuZ3RoKTtcbiAgICAgICAgY2FuZGlkYXRlID0gcmVtYWluaW5nLnNwbGljZShwb3MsIDEpWzBdO1xuICAgICAgICBpZiAodGhpcy5jYW5Hb09uVGlsZShjYW5kaWRhdGUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY2FuR29PblRpbGUodGlsZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxUaWxlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlZC5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgICBvbGQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRpbGUuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIG9mZnNldFk6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkRpcmVjdGlvblwiOiByZXF1aXJlKFwiLi9EaXJlY3Rpb25cIiksXG4gIFwiVGlsZVwiOiByZXF1aXJlKFwiLi9UaWxlXCIpLFxuICBcIlRpbGVDb250YWluZXJcIjogcmVxdWlyZShcIi4vVGlsZUNvbnRhaW5lclwiKSxcbiAgXCJUaWxlUmVmZXJlbmNlXCI6IHJlcXVpcmUoXCIuL1RpbGVSZWZlcmVuY2VcIiksXG4gIFwiVGlsZWRcIjogcmVxdWlyZShcIi4vVGlsZWRcIiksXG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaW1pbmc9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbWluZy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbWluZzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaW1pbmc9VGltaW5nO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFRpbWluZztcblRpbWluZyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGltaW5nIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgdG9nZ2xlKHZhbCkge1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdmFsID0gIXRoaXMucnVubmluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJ1bm5pbmcgPSB2YWw7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZSkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yLlRpbWVyKHtcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICB0aW1pbmc6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEludGVydmFsKGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIoe1xuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgIHJlcGVhdDogdHJ1ZSxcbiAgICAgICAgdGltaW5nOiB0aGlzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaW1pbmcucHJvcGVydGllcyh7XG4gICAgcnVubmluZzoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFRpbWluZztcblxufSkuY2FsbCh0aGlzKTtcblxuVGltaW5nLlRpbWVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaW1lciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGluaXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIHRvZ2dsZSh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHZhbCA9ICF0aGlzLnBhdXNlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBhdXNlZCA9IHZhbDtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbiAgICB9XG5cbiAgICB1bnBhdXNlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5ub3coKTtcbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pZCA9IHNldEludGVydmFsKHRoaXMudGljay5iaW5kKHRoaXMpLCB0aGlzLnJlbWFpbmluZ1RpbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQgPSBzZXRUaW1lb3V0KHRoaXMudGljay5iaW5kKHRoaXMpLCB0aGlzLnJlbWFpbmluZ1RpbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0b3AoKSB7XG4gICAgICB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWUgLSAodGhpcy5jb25zdHJ1Y3Rvci5ub3coKSAtIHRoaXMuc3RhcnRUaW1lKTtcbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICByZXR1cm4gY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIG5vdygpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93ICE9PSBudWxsID8gKHJlZiA9IHdpbmRvdy5wZXJmb3JtYW5jZSkgIT0gbnVsbCA/IHJlZi5ub3cgOiB2b2lkIDAgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIH0gZWxzZSBpZiAoKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MgIT09IG51bGwgPyBwcm9jZXNzLnVwdGltZSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy51cHRpbWUoKSAqIDEwMDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgdGhpcy5yZXBldGl0aW9uICs9IDE7XG4gICAgICBpZiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuY29uc3RydWN0b3Iubm93KCk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtYWluaW5nVGltZSA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95UHJvcGVydGllcygpO1xuICAgIH1cblxuICB9O1xuXG4gIFRpbWVyLnByb3BlcnRpZXMoe1xuICAgIHRpbWU6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIHBhdXNlZDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJ1bm5pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRvci5wcm9wKCdwYXVzZWQnKSAmJiBpbnZhbGlkYXRvci5wcm9wUGF0aCgndGltaW5nLnJ1bm5pbmcnKSAhPT0gZmFsc2U7XG4gICAgICB9LFxuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAob2xkKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIGVsYXBzZWRUaW1lOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5wcm9wKCdydW5uaW5nJykpIHtcbiAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZUVsYXBzZWRUaW1lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSArIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50aW1lIC0gdGhpcy5yZW1haW5pbmdUaW1lO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIHRoaXMucmVtYWluaW5nVGltZSA9IHRoaXMudGltZSAtIHZhbDtcbiAgICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdUaW1lIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRpY2soKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gdmFsO1xuICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVFbGFwc2VkVGltZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2VsYXBzZWRUaW1lJykgLyB0aGlzLnRpbWU7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0RWxhcHNlZFRpbWUodGhpcy50aW1lICogdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcGVhdDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJlcGV0aXRpb246IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIGNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGltZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihUaW1pbmcpO30pOyIsInZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBDb25uZWN0ZWQsIEVsZW1lbnQsIFNpZ25hbE9wZXJhdGlvbjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5TaWduYWxPcGVyYXRpb24gPSByZXF1aXJlKCcuL1NpZ25hbE9wZXJhdGlvbicpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkludmFsaWRhdGVkLkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdGVkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb25uZWN0ZWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRhcmdldC5hZGRTaWduYWwgPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9XG5cbiAgICBhY2NlcHRTaWduYWwoc2lnbmFsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBvbkFkZENvbm5lY3Rpb24oY29ubikge31cblxuICAgIG9uUmVtb3ZlQ29ubmVjdGlvbihjb25uKSB7fVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCkge31cblxuICAgIG9uQWRkU2lnbmFsKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZW1vdmVTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlcGxhY2VTaWduYWwob2xkU2lnbmFsLCBuZXdTaWduYWwsIG9wKSB7fVxuXG4gICAgY29udGFpbnNTaWduYWwoc2lnbmFsLCBjaGVja0xhc3QgPSBmYWxzZSwgY2hlY2tPcmlnaW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZmluZChmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLm1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0LCBjaGVja09yaWdpbik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIGF1dG9TdGFydDtcbiAgICAgIGlmICghKG9wICE9IG51bGwgPyBvcC5maW5kTGltaXRlcih0aGlzKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgIG9wID0gbmV3IFNpZ25hbE9wZXJhdGlvbigpO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgc2ltaWxhcjtcbiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSAmJiB0aGlzLmFjY2VwdFNpZ25hbChzaWduYWwpKSB7XG4gICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnB1c2goc2lnbmFsKTtcbiAgICAgICAgICAgIHRoaXMub25BZGRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICBpZiAoIXNpbWlsYXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhdXRvU3RhcnQpIHtcbiAgICAgICAgICBvcC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc2lnbmFsO1xuICAgIH1cblxuICAgIHJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgYXV0b1N0YXJ0O1xuICAgICAgaWYgKCEob3AgIT0gbnVsbCA/IG9wLmZpbmRMaW1pdGVyKHRoaXMpIDogdm9pZCAwKSkge1xuICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgb3AgPSBuZXcgU2lnbmFsT3BlcmF0aW9uO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgZXhpc3Rpbmc7XG4gICAgICAgICAgaWYgKChleGlzdGluZyA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSkgJiYgdGhpcy5hY2NlcHRTaWduYWwoc2lnbmFsKSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnNwbGljZSh0aGlzLnNpZ25hbHMuaW5kZXhPZihleGlzdGluZyksIDEpO1xuICAgICAgICAgICAgdGhpcy5vblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKTtcbiAgICAgICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgICAgIHZhciBzaW1pbGFyO1xuICAgICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgICBpZiAoc2ltaWxhcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVwbGFjZVNpZ25hbChzaWduYWwsIHNpbWlsYXIsIG9wKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vblJlbW92ZVNpZ25hbFR5cGUoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RlcEJ5U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wLnN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoYXV0b1N0YXJ0KSB7XG4gICAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCkge1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ID09PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiBzaWduYWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2lnbmFsLndpdGhMYXN0KHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRm9yd2FyZFdhdGNoZXIoKSB7XG4gICAgICBpZiAoIXRoaXMuZm9yd2FyZFdhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5mb3J3YXJkV2F0Y2hlciA9IG5ldyBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBzY29wZTogdGhpcyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ291dHB1dHMnLFxuICAgICAgICAgIG9uQWRkZWQ6IGZ1bmN0aW9uKG91dHB1dCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZFNpZ25hbFRvKHNpZ25hbCwgb3V0cHV0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgb25SZW1vdmVkOiBmdW5jdGlvbihvdXRwdXQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRlZFNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3BGb3J3YXJkZWRTaWduYWxUbyhzaWduYWwsIG91dHB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkV2F0Y2hlci5iaW5kKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yd2FyZFNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5hZGQoc2lnbmFsKTtcbiAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0ZvcndhcmRXYXRjaGVyKCk7XG4gICAgfVxuXG4gICAgZm9yd2FyZEFsbFNpZ25hbHNUbyhjb25uLCBvcCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgdmFyIG5leHQ7XG4gICAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0b3BGb3J3YXJkZWRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICB0aGlzLmZvcndhcmRlZFNpZ25hbHMucmVtb3ZlKHNpZ25hbCk7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24oY29ubikge1xuICAgICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgICByZXR1cm4gY29ubi5yZW1vdmVTaWduYWwobmV4dCwgb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdG9wQWxsRm9yd2FyZGVkU2lnbmFsVG8oY29ubiwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgIHJldHVybiBjb25uLnJlbW92ZVNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3J3YXJkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wRm9yd2FyZGVkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4ucmVtb3ZlU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDb25uZWN0ZWQucHJvcGVydGllcyh7XG4gICAgc2lnbmFsczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgaW5wdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBvdXRwdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBmb3J3YXJkZWRTaWduYWxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ29ubmVjdGVkO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEVsZW1lbnQsIFNpZ25hbDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCA9IGNsYXNzIFNpZ25hbCBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihvcmlnaW4sIHR5cGUgPSAnc2lnbmFsJywgZXhjbHVzaXZlID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5leGNsdXNpdmUgPSBleGNsdXNpdmU7XG4gICAgdGhpcy5sYXN0ID0gdGhpcy5vcmlnaW47XG4gIH1cblxuICB3aXRoTGFzdChsYXN0KSB7XG4gICAgdmFyIHNpZ25hbDtcbiAgICBzaWduYWwgPSBuZXcgdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3IodGhpcy5vcmlnaW4sIHRoaXMudHlwZSwgdGhpcy5leGNsdXNpdmUpO1xuICAgIHNpZ25hbC5sYXN0ID0gbGFzdDtcbiAgICByZXR1cm4gc2lnbmFsO1xuICB9XG5cbiAgY29weSgpIHtcbiAgICB2YXIgc2lnbmFsO1xuICAgIHNpZ25hbCA9IG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3Rvcih0aGlzLm9yaWdpbiwgdGhpcy50eXBlLCB0aGlzLmV4Y2x1c2l2ZSk7XG4gICAgc2lnbmFsLmxhc3QgPSB0aGlzLmxhc3Q7XG4gICAgcmV0dXJuIHNpZ25hbDtcbiAgfVxuXG4gIG1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0ID0gZmFsc2UsIGNoZWNrT3JpZ2luID0gdGhpcy5leGNsdXNpdmUpIHtcbiAgICByZXR1cm4gKCFjaGVja0xhc3QgfHwgc2lnbmFsLmxhc3QgPT09IHRoaXMubGFzdCkgJiYgKGNoZWNrT3JpZ2luIHx8IHNpZ25hbC5vcmlnaW4gPT09IHRoaXMub3JpZ2luKSAmJiBzaWduYWwudHlwZSA9PT0gdGhpcy50eXBlO1xuICB9XG5cbn07XG4iLCJ2YXIgRWxlbWVudCwgU2lnbmFsT3BlcmF0aW9uO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsT3BlcmF0aW9uID0gY2xhc3MgU2lnbmFsT3BlcmF0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMubGltaXRlcnMgPSBbXTtcbiAgfVxuXG4gIGFkZE9wZXJhdGlvbihmdW5jdCwgcHJpb3JpdHkgPSAxKSB7XG4gICAgaWYgKHByaW9yaXR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS51bnNoaWZ0KGZ1bmN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUucHVzaChmdW5jdCk7XG4gICAgfVxuICB9XG5cbiAgYWRkTGltaXRlcihjb25uZWN0ZWQpIHtcbiAgICBpZiAoIXRoaXMuZmluZExpbWl0ZXIoY29ubmVjdGVkKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGltaXRlcnMucHVzaChjb25uZWN0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRMaW1pdGVyKGNvbm5lY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmxpbWl0ZXJzLmluZGV4T2YoY29ubmVjdGVkKSA+IC0xO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHJlc3VsdHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuc3RlcCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBzdGVwKCkge1xuICAgIHZhciBmdW5jdDtcbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRvbmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVuY3QgPSB0aGlzLnF1ZXVlLnNoaWZ0KGZ1bmN0KTtcbiAgICAgIHJldHVybiBmdW5jdCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBkb25lKCkge31cblxufTtcbiIsInZhciBDb25uZWN0ZWQsIFNpZ25hbCwgU2lnbmFsT3BlcmF0aW9uLCBTaWduYWxTb3VyY2U7XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cblNpZ25hbCA9IHJlcXVpcmUoJy4vU2lnbmFsJyk7XG5cblNpZ25hbE9wZXJhdGlvbiA9IHJlcXVpcmUoJy4vU2lnbmFsT3BlcmF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsU291cmNlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTaWduYWxTb3VyY2UgZXh0ZW5kcyBDb25uZWN0ZWQge307XG5cbiAgU2lnbmFsU291cmNlLnByb3BlcnRpZXMoe1xuICAgIGFjdGl2YXRlZDoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wO1xuICAgICAgICBvcCA9IG5ldyBTaWduYWxPcGVyYXRpb24oKTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGVkKSB7XG4gICAgICAgICAgdGhpcy5mb3J3YXJkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdG9wRm9yd2FyZGVkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzaWduYWw6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2lnbmFsKHRoaXMsICdwb3dlcicsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNpZ25hbFNvdXJjZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBDb25uZWN0ZWQsIFN3aXRjaDtcblxuQ29ubmVjdGVkID0gcmVxdWlyZSgnLi9Db25uZWN0ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l0Y2ggPSBjbGFzcyBTd2l0Y2ggZXh0ZW5kcyBDb25uZWN0ZWQge307XG4iLCJ2YXIgQ29ubmVjdGVkLCBEaXJlY3Rpb24sIFRpbGVkLCBXaXJlLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2lyZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2lyZSBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3Rvcih3aXJlVHlwZSA9ICdyZWQnKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy53aXJlVHlwZSA9IHdpcmVUeXBlO1xuICAgIH1cblxuICAgIGZpbmREaXJlY3Rpb25zVG8oY29ubikge1xuICAgICAgdmFyIGRpcmVjdGlvbnM7XG4gICAgICBkaXJlY3Rpb25zID0gY29ubi50aWxlcyAhPSBudWxsID8gY29ubi50aWxlcy5tYXAoKHRpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZS5maW5kRGlyZWN0aW9uT2YodGlsZSk7XG4gICAgICB9KSA6IFt0aGlzLnRpbGUuZmluZERpcmVjdGlvbk9mKGNvbm4pXTtcbiAgICAgIHJldHVybiBkaXJlY3Rpb25zLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICE9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gQ29ubmVjdGVkLnByb3RvdHlwZS5jYW5Db25uZWN0VG8uY2FsbCh0aGlzLCB0YXJnZXQpICYmICgodGFyZ2V0LndpcmVUeXBlID09IG51bGwpIHx8IHRhcmdldC53aXJlVHlwZSA9PT0gdGhpcy53aXJlVHlwZSk7XG4gICAgfVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLmZvcndhcmRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgfVxuXG4gIH07XG5cbiAgV2lyZS5leHRlbmQoQ29ubmVjdGVkKTtcblxuICBXaXJlLnByb3BlcnRpZXMoe1xuICAgIG91dHB1dHM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHZhciBwYXJlbnQ7XG4gICAgICAgIHBhcmVudCA9IGludmFsaWRhdGlvbi5wcm9wKCd0aWxlJyk7XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0aW9uLnByb3AoJ2FkamFjZW50VGlsZXMnLCBwYXJlbnQpLnJlZHVjZSgocmVzLCB0aWxlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmNvbmNhdChpbnZhbGlkYXRpb24ucHJvcCgnY2hpbGRyZW4nLCB0aWxlKS5maWx0ZXIoKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbkNvbm5lY3RUbyhjaGlsZCk7XG4gICAgICAgICAgICB9KS50b0FycmF5KCkpO1xuICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbm5lY3RlZERpcmVjdGlvbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRpb24ucHJvcCgnb3V0cHV0cycpLnJlZHVjZSgob3V0LCBjb25uKSA9PiB7XG4gICAgICAgICAgdGhpcy5maW5kRGlyZWN0aW9uc1RvKGNvbm4pLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgaWYgKGluZGV4T2YuY2FsbChvdXQsIGQpIDwgMCkge1xuICAgICAgICAgICAgICByZXR1cm4gb3V0LnB1c2goZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfSwgW10pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFdpcmU7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJDb25uZWN0ZWRcIjogcmVxdWlyZShcIi4vQ29ubmVjdGVkXCIpLFxuICBcIlNpZ25hbFwiOiByZXF1aXJlKFwiLi9TaWduYWxcIiksXG4gIFwiU2lnbmFsT3BlcmF0aW9uXCI6IHJlcXVpcmUoXCIuL1NpZ25hbE9wZXJhdGlvblwiKSxcbiAgXCJTaWduYWxTb3VyY2VcIjogcmVxdWlyZShcIi4vU2lnbmFsU291cmNlXCIpLFxuICBcIlN3aXRjaFwiOiByZXF1aXJlKFwiLi9Td2l0Y2hcIiksXG4gIFwiV2lyZVwiOiByZXF1aXJlKFwiLi9XaXJlXCIpLFxufSIsInZhciBBdXRvbWF0aWNEb29yLCBDaGFyYWN0ZXIsIERvb3I7XG5cbkRvb3IgPSByZXF1aXJlKCcuL0Rvb3InKTtcblxuQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9DaGFyYWN0ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvbWF0aWNEb29yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBBdXRvbWF0aWNEb29yIGV4dGVuZHMgRG9vciB7XG4gICAgdXBkYXRlVGlsZU1lbWJlcnMob2xkKSB7XG4gICAgICB2YXIgcmVmLCByZWYxLCByZWYyLCByZWYzO1xuICAgICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICAgIGlmICgocmVmID0gb2xkLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZi5yZW1vdmVSZWYoJ3VubG9ja2VkJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYxID0gb2xkLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZjEucmVtb3ZlUmVmKCdvcGVuJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnRpbGUpIHtcbiAgICAgICAgaWYgKChyZWYyID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZjIuYWRkUHJvcGVydHlSZWYoJ3VubG9ja2VkJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChyZWYzID0gdGhpcy50aWxlLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCA/IHJlZjMuYWRkUHJvcGVydHlSZWYoJ29wZW4nLCB0aGlzKSA6IHZvaWQgMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgc3VwZXIuaW5pdCgpO1xuICAgICAgcmV0dXJuIHRoaXMub3BlbjtcbiAgICB9XG5cbiAgICBpc0FjdGl2YXRvclByZXNlbnQoaW52YWxpZGF0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVhY3RpdmVUaWxlcyhpbnZhbGlkYXRlKS5zb21lKCh0aWxlKSA9PiB7XG4gICAgICAgIHZhciBjaGlsZHJlbjtcbiAgICAgICAgY2hpbGRyZW4gPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKCdjaGlsZHJlbicsIHRpbGUpIDogdGlsZS5jaGlsZHJlbjtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuLnNvbWUoKGNoaWxkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2FuQmVBY3RpdmF0ZWRCeShjaGlsZCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FuQmVBY3RpdmF0ZWRCeShlbGVtKSB7XG4gICAgICByZXR1cm4gZWxlbSBpbnN0YW5jZW9mIENoYXJhY3RlcjtcbiAgICB9XG5cbiAgICBnZXRSZWFjdGl2ZVRpbGVzKGludmFsaWRhdGUpIHtcbiAgICAgIHZhciBkaXJlY3Rpb24sIHRpbGU7XG4gICAgICB0aWxlID0gaW52YWxpZGF0ZSA/IGludmFsaWRhdGUucHJvcCgndGlsZScpIDogdGhpcy50aWxlO1xuICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIGRpcmVjdGlvbiA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AoJ2RpcmVjdGlvbicpIDogdGhpcy5kaXJlY3Rpb247XG4gICAgICBpZiAoZGlyZWN0aW9uID09PSBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbCkge1xuICAgICAgICByZXR1cm4gW3RpbGUsIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKDAsIDEpLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgwLCAtMSldLmZpbHRlcihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgcmV0dXJuIHQgIT0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW3RpbGUsIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKDEsIDApLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgtMSwgMCldLmZpbHRlcihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgcmV0dXJuIHQgIT0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQXV0b21hdGljRG9vci5wcm9wZXJ0aWVzKHtcbiAgICBvcGVuOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRlLnByb3AoJ2xvY2tlZCcpICYmIHRoaXMuaXNBY3RpdmF0b3JQcmVzZW50KGludmFsaWRhdGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbG9ja2VkOiB7XG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgdW5sb2NrZWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0ZSkge1xuICAgICAgICByZXR1cm4gIWludmFsaWRhdGUucHJvcCgnbG9ja2VkJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXV0b21hdGljRG9vcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9BdXRvbWF0aWNEb29yLmpzLm1hcFxuIiwidmFyIENoYXJhY3RlciwgRGFtYWdlYWJsZSwgVGlsZWQsIFdhbGtBY3Rpb247XG5cblRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkO1xuXG5EYW1hZ2VhYmxlID0gcmVxdWlyZSgnLi9EYW1hZ2VhYmxlJyk7XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvV2Fsa0FjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ2hhcmFjdGVyIGV4dGVuZHMgVGlsZWQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIHNldERlZmF1bHRzKCkge1xuICAgICAgaWYgKCF0aGlzLnRpbGUgJiYgKHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lciAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXRPblJhbmRvbVRpbGUodGhpcy5nYW1lLm1haW5UaWxlQ29udGFpbmVyLnRpbGVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5Hb09uVGlsZSh0aWxlKSB7XG4gICAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCA/IHRpbGUud2Fsa2FibGUgOiB2b2lkIDApICE9PSBmYWxzZTtcbiAgICB9XG5cbiAgICB3YWxrVG8odGlsZSkge1xuICAgICAgdmFyIGFjdGlvbjtcbiAgICAgIGFjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgYWN0b3I6IHRoaXMsXG4gICAgICAgIHRhcmdldDogdGlsZVxuICAgICAgfSk7XG4gICAgICBhY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgcmV0dXJuIGFjdGlvbjtcbiAgICB9XG5cbiAgICBpc1NlbGVjdGFibGVCeShwbGF5ZXIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICB9O1xuXG4gIENoYXJhY3Rlci5leHRlbmQoRGFtYWdlYWJsZSk7XG5cbiAgQ2hhcmFjdGVyLnByb3BlcnRpZXMoe1xuICAgIGdhbWU6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24ob2xkKSB7XG4gICAgICAgIGlmICh0aGlzLmdhbWUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZXREZWZhdWx0cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBvZmZzZXRYOiB7XG4gICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgIGRlZmF1bHQ6IDAuNVxuICAgIH0sXG4gICAgb2Zmc2V0WToge1xuICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICBkZWZhdWx0OiAwLjVcbiAgICB9LFxuICAgIHRpbGU6IHtcbiAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0QWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgICAgIGFjdG9yOiB0aGlzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgYXZhaWxhYmxlQWN0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHRpbGU7XG4gICAgICAgIHRpbGUgPSBpbnZhbGlkYXRvci5wcm9wKFwidGlsZVwiKTtcbiAgICAgICAgaWYgKHRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChcInByb3ZpZGVkQWN0aW9uc1wiLCB0aWxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBDaGFyYWN0ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQ2hhcmFjdGVyLmpzLm1hcFxuIiwidmFyIEF0dGFja01vdmVBY3Rpb24sIENoYXJhY3RlckFJLCBEb29yLCBQcm9wZXJ0eVdhdGNoZXIsIFRpbGVDb250YWluZXIsIFZpc2lvbkNhbGN1bGF0b3IsIFdhbGtBY3Rpb247XG5cblRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lcjtcblxuVmlzaW9uQ2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vVmlzaW9uQ2FsY3VsYXRvcicpO1xuXG5Eb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvV2Fsa0FjdGlvbicpO1xuXG5BdHRhY2tNb3ZlQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24nKTtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkludmFsaWRhdGVkLlByb3BlcnR5V2F0Y2hlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXJBSSA9IGNsYXNzIENoYXJhY3RlckFJIHtcbiAgY29uc3RydWN0b3IoY2hhcmFjdGVyKSB7XG4gICAgdGhpcy5jaGFyYWN0ZXIgPSBjaGFyYWN0ZXI7XG4gICAgdGhpcy5uZXh0QWN0aW9uQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0QWN0aW9uKCk7XG4gICAgfTtcbiAgICB0aGlzLnZpc2lvbk1lbW9yeSA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgdGhpcy50aWxlV2F0Y2hlciA9IG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVmlzaW9uTWVtb3J5KCk7XG4gICAgICB9LFxuICAgICAgcHJvcGVydHk6IHRoaXMuY2hhcmFjdGVyLmdldFByb3BlcnR5SW5zdGFuY2UoJ3RpbGUnKVxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy50aWxlV2F0Y2hlci5iaW5kKCk7XG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGlvbigpO1xuICB9XG5cbiAgbmV4dEFjdGlvbigpIHtcbiAgICB2YXIgZW5uZW15LCB1bmV4cGxvcmVkO1xuICAgIHRoaXMudXBkYXRlVmlzaW9uTWVtb3J5KCk7XG4gICAgaWYgKGVubmVteSA9IHRoaXMuZ2V0Q2xvc2VzdEVuZW15KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dGFja01vdmVUbyhlbm5lbXkpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodW5leHBsb3JlZCA9IHRoaXMuZ2V0Q2xvc2VzdFVuZXhwbG9yZWQoKSkge1xuICAgICAgcmV0dXJuIHRoaXMud2Fsa1RvKHVuZXhwbG9yZWQpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc2V0VmlzaW9uTWVtb3J5KCk7XG4gICAgICByZXR1cm4gdGhpcy53YWxrVG8odGhpcy5nZXRDbG9zZXN0VW5leHBsb3JlZCgpKS5vbignZW5kJywgbmV4dEFjdGlvbkNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaXNpb25NZW1vcnkoKSB7XG4gICAgdmFyIGNhbGN1bGF0b3I7XG4gICAgY2FsY3VsYXRvciA9IG5ldyBWaXNpb25DYWxjdWxhdG9yKHRoaXMuY2hhcmFjdGVyLnRpbGUpO1xuICAgIGNhbGN1bGF0b3IuY2FsY3VsKCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaW9uTWVtb3J5ID0gY2FsY3VsYXRvci50b0NvbnRhaW5lcigpLm1lcmdlKHRoaXMudmlzaW9uTWVtb3J5LCAoYSwgYikgPT4ge1xuICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICBhID0gdGhpcy5hbmFseXplVGlsZShhKTtcbiAgICAgIH1cbiAgICAgIGlmICgoYSAhPSBudWxsKSAmJiAoYiAhPSBudWxsKSkge1xuICAgICAgICBhLnZpc2liaWxpdHkgPSBNYXRoLm1heChhLnZpc2liaWxpdHksIGIudmlzaWJpbGl0eSk7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGEgfHwgYjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFuYWx5emVUaWxlKHRpbGUpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRpbGUuZW5uZW15U3BvdHRlZCA9IChyZWYgPSB0aWxlLmdldEZpbmFsVGlsZSgpLmNoaWxkcmVuKSAhPSBudWxsID8gcmVmLmZpbmQoKGMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmlzRW5uZW15KGMpO1xuICAgIH0pIDogdm9pZCAwO1xuICAgIHRpbGUuZXhwbG9yYWJsZSA9IHRoaXMuaXNFeHBsb3JhYmxlKHRpbGUpO1xuICAgIHJldHVybiB0aWxlO1xuICB9XG5cbiAgaXNFbm5lbXkoZWxlbSkge1xuICAgIHZhciByZWY7XG4gICAgcmV0dXJuIChyZWYgPSB0aGlzLmNoYXJhY3Rlci5vd25lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuaXNFbmVteSA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmlzRW5lbXkoZWxlbSkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gIH1cblxuICBnZXRDbG9zZXN0RW5lbXkoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaW9uTWVtb3J5LmNsb3Nlc3QodGhpcy5jaGFyYWN0ZXIudGlsZSwgKHQpID0+IHtcbiAgICAgIHJldHVybiB0LmVubmVteVNwb3R0ZWQ7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDbG9zZXN0VW5leHBsb3JlZCgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkuY2xvc2VzdCh0aGlzLmNoYXJhY3Rlci50aWxlLCAodCkgPT4ge1xuICAgICAgcmV0dXJuIHQudmlzaWJpbGl0eSA8IDEgJiYgdC5leHBsb3JhYmxlO1xuICAgIH0pO1xuICB9XG5cbiAgaXNFeHBsb3JhYmxlKHRpbGUpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgIHJldHVybiB0aWxlLndhbGthYmxlIHx8ICgocmVmID0gdGlsZS5jaGlsZHJlbikgIT0gbnVsbCA/IHJlZi5maW5kKChjKSA9PiB7XG4gICAgICByZXR1cm4gYyBpbnN0YW5jZW9mIERvb3I7XG4gICAgfSkgOiB2b2lkIDApO1xuICB9XG5cbiAgYXR0YWNrTW92ZVRvKHRpbGUpIHtcbiAgICB2YXIgYWN0aW9uO1xuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgIGFjdGlvbiA9IG5ldyBBdHRhY2tNb3ZlQWN0aW9uKHtcbiAgICAgIGFjdG9yOiB0aGlzLmNoYXJhY3RlcixcbiAgICAgIHRhcmdldDogdGlsZVxuICAgIH0pO1xuICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICBhY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgcmV0dXJuIGFjdGlvbjtcbiAgICB9XG4gIH1cblxuICB3YWxrVG8odGlsZSkge1xuICAgIHZhciBhY3Rpb247XG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgYWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgYWN0b3I6IHRoaXMuY2hhcmFjdGVyLFxuICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgfSk7XG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5leGVjdXRlKCk7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0NoYXJhY3RlckFJLmpzLm1hcFxuIiwidmFyIENvbmZyb250YXRpb24sIEVsZW1lbnQsIFNoaXAsIFZpZXc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVmlldyA9IHJlcXVpcmUoJy4vVmlldycpO1xuXG5TaGlwID0gcmVxdWlyZSgnLi9TaGlwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZnJvbnRhdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29uZnJvbnRhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICAgIHN0YXJ0KCkge1xuICAgICAgZ2FtZS5tYWluVmlldyA9IHRoaXMudmlldztcbiAgICAgIHN1YmplY3QuY29udGFpbmVyID0gdGhpcy52aWV3O1xuICAgICAgcmV0dXJuIG9wcG9uZW50LmNvbnRhaW5lciA9IHRoaXMudmlldztcbiAgICB9XG5cbiAgfTtcblxuICBDb25mcm9udGF0aW9uLnByb3BlcnRpZXMoe1xuICAgIGdhbWU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHN1YmplY3Q6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHZpZXc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmlldygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3Bwb25lbnQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2hpcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENvbmZyb250YXRpb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQ29uZnJvbnRhdGlvbi5qcy5tYXBcbiIsInZhciBEYW1hZ2VQcm9wYWdhdGlvbiwgRGlyZWN0aW9uLCBFbGVtZW50LCBMaW5lT2ZTaWdodDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5MaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKTtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBEYW1hZ2VQcm9wYWdhdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRGFtYWdlUHJvcGFnYXRpb24gZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGdldFRpbGVDb250YWluZXIoKSB7XG4gICAgICByZXR1cm4gdGhpcy50aWxlLmNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBhcHBseSgpIHtcbiAgICAgIHZhciBkYW1hZ2UsIGksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgcmVmID0gdGhpcy5nZXREYW1hZ2VkKCk7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGFtYWdlID0gcmVmW2ldO1xuICAgICAgICByZXN1bHRzLnB1c2goZGFtYWdlLnRhcmdldC5kYW1hZ2UoZGFtYWdlLmRhbWFnZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgZ2V0SW5pdGlhbFRpbGVzKCkge1xuICAgICAgdmFyIGN0bjtcbiAgICAgIGN0biA9IHRoaXMuZ2V0VGlsZUNvbnRhaW5lcigpO1xuICAgICAgcmV0dXJuIGN0bi5pblJhbmdlKHRoaXMudGlsZSwgdGhpcy5yYW5nZSk7XG4gICAgfVxuXG4gICAgZ2V0SW5pdGlhbERhbWFnZXMoKSB7XG4gICAgICB2YXIgZGFtYWdlcywgZG1nLCBpLCBsZW4sIHRpbGUsIHRpbGVzO1xuICAgICAgZGFtYWdlcyA9IFtdO1xuICAgICAgdGlsZXMgPSB0aGlzLmdldEluaXRpYWxUaWxlcygpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gdGlsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdGlsZSA9IHRpbGVzW2ldO1xuICAgICAgICBpZiAodGlsZS5kYW1hZ2VhYmxlICYmIChkbWcgPSB0aGlzLmluaXRpYWxEYW1hZ2UodGlsZSwgdGlsZXMubGVuZ3RoKSkpIHtcbiAgICAgICAgICBkYW1hZ2VzLnB1c2goZG1nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGRhbWFnZXM7XG4gICAgfVxuXG4gICAgZ2V0RGFtYWdlZCgpIHtcbiAgICAgIHZhciBhZGRlZDtcbiAgICAgIGlmICh0aGlzLl9kYW1hZ2VkID09IG51bGwpIHtcbiAgICAgICAgYWRkZWQgPSBudWxsO1xuICAgICAgICB3aGlsZSAoYWRkZWQgPSB0aGlzLnN0ZXAoYWRkZWQpKSB7XG4gICAgICAgICAgdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2RhbWFnZWQ7XG4gICAgfVxuXG4gICAgc3RlcChhZGRlZCkge1xuICAgICAgaWYgKGFkZGVkICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuZXh0ZW5kZWREYW1hZ2UgIT0gbnVsbCkge1xuICAgICAgICAgIGFkZGVkID0gdGhpcy5leHRlbmQoYWRkZWQpO1xuICAgICAgICAgIHRoaXMuX2RhbWFnZWQgPSBhZGRlZC5jb25jYXQodGhpcy5fZGFtYWdlZCk7XG4gICAgICAgICAgcmV0dXJuIGFkZGVkLmxlbmd0aCA+IDAgJiYgYWRkZWQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYW1hZ2VkID0gdGhpcy5nZXRJbml0aWFsRGFtYWdlcygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluRGFtYWdlZCh0YXJnZXQsIGRhbWFnZWQpIHtcbiAgICAgIHZhciBkYW1hZ2UsIGksIGluZGV4LCBsZW47XG4gICAgICBmb3IgKGluZGV4ID0gaSA9IDAsIGxlbiA9IGRhbWFnZWQubGVuZ3RoOyBpIDwgbGVuOyBpbmRleCA9ICsraSkge1xuICAgICAgICBkYW1hZ2UgPSBkYW1hZ2VkW2luZGV4XTtcbiAgICAgICAgaWYgKGRhbWFnZS50YXJnZXQgPT09IHRhcmdldCkge1xuICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGV4dGVuZChkYW1hZ2VkKSB7XG4gICAgICB2YXIgYWRkZWQsIGN0biwgZGFtYWdlLCBkaXIsIGRtZywgZXhpc3RpbmcsIGksIGosIGssIGxlbiwgbGVuMSwgbGVuMiwgbG9jYWwsIHJlZiwgdGFyZ2V0LCB0aWxlO1xuICAgICAgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKCk7XG4gICAgICBhZGRlZCA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZGFtYWdlZC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkYW1hZ2UgPSBkYW1hZ2VkW2ldO1xuICAgICAgICBsb2NhbCA9IFtdO1xuICAgICAgICBpZiAoZGFtYWdlLnRhcmdldC54ICE9IG51bGwpIHtcbiAgICAgICAgICByZWYgPSBEaXJlY3Rpb24uYWRqYWNlbnRzO1xuICAgICAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgICAgICBkaXIgPSByZWZbal07XG4gICAgICAgICAgICB0aWxlID0gY3RuLmdldFRpbGUoZGFtYWdlLnRhcmdldC54ICsgZGlyLngsIGRhbWFnZS50YXJnZXQueSArIGRpci55KTtcbiAgICAgICAgICAgIGlmICgodGlsZSAhPSBudWxsKSAmJiB0aWxlLmRhbWFnZWFibGUgJiYgdGhpcy5pbkRhbWFnZWQodGlsZSwgdGhpcy5fZGFtYWdlZCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGxvY2FsLnB1c2godGlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoayA9IDAsIGxlbjIgPSBsb2NhbC5sZW5ndGg7IGsgPCBsZW4yOyBrKyspIHtcbiAgICAgICAgICB0YXJnZXQgPSBsb2NhbFtrXTtcbiAgICAgICAgICBpZiAoZG1nID0gdGhpcy5leHRlbmRlZERhbWFnZSh0YXJnZXQsIGRhbWFnZSwgbG9jYWwubGVuZ3RoKSkge1xuICAgICAgICAgICAgaWYgKChleGlzdGluZyA9IHRoaXMuaW5EYW1hZ2VkKHRhcmdldCwgYWRkZWQpKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgYWRkZWQucHVzaChkbWcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYWRkZWRbZXhpc3RpbmddID0gdGhpcy5tZXJnZURhbWFnZShhZGRlZFtleGlzdGluZ10sIGRtZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYWRkZWQ7XG4gICAgfVxuXG4gICAgbWVyZ2VEYW1hZ2UoZDEsIGQyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IGQxLnRhcmdldCxcbiAgICAgICAgcG93ZXI6IGQxLnBvd2VyICsgZDIucG93ZXIsXG4gICAgICAgIGRhbWFnZTogZDEuZGFtYWdlICsgZDIuZGFtYWdlXG4gICAgICB9O1xuICAgIH1cblxuICAgIG1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKSB7XG4gICAgICBpZiAodHlwZW9mIHRhcmdldC5tb2RpZnlEYW1hZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGFyZ2V0Lm1vZGlmeURhbWFnZShwb3dlciwgdGhpcy50eXBlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihwb3dlcik7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgRGFtYWdlUHJvcGFnYXRpb24ucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcG93ZXI6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICByYW5nZToge1xuICAgICAgZGVmYXVsdDogMVxuICAgIH0sXG4gICAgdHlwZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIERhbWFnZVByb3BhZ2F0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5EYW1hZ2VQcm9wYWdhdGlvbi5Ob3JtYWwgPSBjbGFzcyBOb3JtYWwgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gIGluaXRpYWxEYW1hZ2UodGFyZ2V0LCBuYikge1xuICAgIHZhciBkbWc7XG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCB0aGlzLnBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxufTtcblxuRGFtYWdlUHJvcGFnYXRpb24uVGhlcm1pYyA9IGNsYXNzIFRoZXJtaWMgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gIGV4dGVuZGVkRGFtYWdlKHRhcmdldCwgbGFzdCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlcjtcbiAgICBwb3dlciA9IChsYXN0LmRhbWFnZSAtIDEpIC8gMiAvIG5iICogTWF0aC5taW4oMSwgbGFzdC50YXJnZXQuaGVhbHRoIC8gbGFzdC50YXJnZXQubWF4SGVhbHRoICogNSk7XG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcik7XG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogcG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxEYW1hZ2UodGFyZ2V0LCBuYikge1xuICAgIHZhciBkbWcsIHBvd2VyO1xuICAgIHBvd2VyID0gdGhpcy5wb3dlciAvIG5iO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxufTtcblxuRGFtYWdlUHJvcGFnYXRpb24uS2luZXRpYyA9IGNsYXNzIEtpbmV0aWMgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gIGV4dGVuZGVkRGFtYWdlKHRhcmdldCwgbGFzdCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlcjtcbiAgICBwb3dlciA9IChsYXN0LnBvd2VyIC0gbGFzdC5kYW1hZ2UpICogTWF0aC5taW4oMSwgbGFzdC50YXJnZXQuaGVhbHRoIC8gbGFzdC50YXJnZXQubWF4SGVhbHRoICogMikgLSAxO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsRGFtYWdlKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgdGhpcy5wb3dlcik7XG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgbW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpIHtcbiAgICBpZiAodHlwZW9mIHRhcmdldC5tb2RpZnlEYW1hZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHRhcmdldC5tb2RpZnlEYW1hZ2UocG93ZXIsIHRoaXMudHlwZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwb3dlciAqIDAuMjUpO1xuICAgIH1cbiAgfVxuXG4gIG1lcmdlRGFtYWdlKGQxLCBkMikge1xuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IGQxLnRhcmdldCxcbiAgICAgIHBvd2VyOiBNYXRoLmZsb29yKChkMS5wb3dlciArIGQyLnBvd2VyKSAvIDIpLFxuICAgICAgZGFtYWdlOiBNYXRoLmZsb29yKChkMS5kYW1hZ2UgKyBkMi5kYW1hZ2UpIC8gMilcbiAgICB9O1xuICB9XG5cbn07XG5cbkRhbWFnZVByb3BhZ2F0aW9uLkV4cGxvc2l2ZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRXhwbG9zaXZlIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICAgIGdldERhbWFnZWQoKSB7XG4gICAgICB2YXIgYW5nbGUsIGksIGluc2lkZSwgcmVmLCBzaGFyZCwgc2hhcmRQb3dlciwgc2hhcmRzLCB0YXJnZXQ7XG4gICAgICB0aGlzLl9kYW1hZ2VkID0gW107XG4gICAgICBzaGFyZHMgPSBNYXRoLnBvdyh0aGlzLnJhbmdlICsgMSwgMik7XG4gICAgICBzaGFyZFBvd2VyID0gdGhpcy5wb3dlciAvIHNoYXJkcztcbiAgICAgIGluc2lkZSA9IHRoaXMudGlsZS5oZWFsdGggPD0gdGhpcy5tb2RpZnlEYW1hZ2UodGhpcy50aWxlLCBzaGFyZFBvd2VyKTtcbiAgICAgIGlmIChpbnNpZGUpIHtcbiAgICAgICAgc2hhcmRQb3dlciAqPSA0O1xuICAgICAgfVxuICAgICAgZm9yIChzaGFyZCA9IGkgPSAwLCByZWYgPSBzaGFyZHM7ICgwIDw9IHJlZiA/IGkgPD0gcmVmIDogaSA+PSByZWYpOyBzaGFyZCA9IDAgPD0gcmVmID8gKytpIDogLS1pKSB7XG4gICAgICAgIGFuZ2xlID0gdGhpcy5ybmcoKSAqIE1hdGguUEkgKiAyO1xuICAgICAgICB0YXJnZXQgPSB0aGlzLmdldFRpbGVIaXRCeVNoYXJkKGluc2lkZSwgYW5nbGUpO1xuICAgICAgICBpZiAodGFyZ2V0ICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9kYW1hZ2VkLnB1c2goe1xuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICBwb3dlcjogc2hhcmRQb3dlcixcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBzaGFyZFBvd2VyKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZDtcbiAgICB9XG5cbiAgICBnZXRUaWxlSGl0QnlTaGFyZChpbnNpZGUsIGFuZ2xlKSB7XG4gICAgICB2YXIgY3RuLCBkaXN0LCB0YXJnZXQsIHZlcnRleDtcbiAgICAgIGN0biA9IHRoaXMuZ2V0VGlsZUNvbnRhaW5lcigpO1xuICAgICAgZGlzdCA9IHRoaXMucmFuZ2UgKiB0aGlzLnJuZygpO1xuICAgICAgdGFyZ2V0ID0ge1xuICAgICAgICB4OiB0aGlzLnRpbGUueCArIDAuNSArIGRpc3QgKiBNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41ICsgZGlzdCAqIE1hdGguc2luKGFuZ2xlKVxuICAgICAgfTtcbiAgICAgIGlmIChpbnNpZGUpIHtcbiAgICAgICAgdmVydGV4ID0gbmV3IExpbmVPZlNpZ2h0KGN0biwgdGhpcy50aWxlLnggKyAwLjUsIHRoaXMudGlsZS55ICsgMC41LCB0YXJnZXQueCwgdGFyZ2V0LnkpO1xuICAgICAgICB2ZXJ0ZXgudHJhdmVyc2FibGVDYWxsYmFjayA9ICh0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICFpbnNpZGUgfHwgKCh0aWxlICE9IG51bGwpICYmIHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayh0aWxlKSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB2ZXJ0ZXguZ2V0RW5kUG9pbnQoKS50aWxlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGN0bi5nZXRUaWxlKE1hdGguZmxvb3IodGFyZ2V0LngpLCBNYXRoLmZsb29yKHRhcmdldC55KSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgRXhwbG9zaXZlLnByb3BlcnRpZXMoe1xuICAgIHJuZzoge1xuICAgICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgICB9LFxuICAgIHRyYXZlcnNhYmxlQ2FsbGJhY2s6IHtcbiAgICAgIGRlZmF1bHQ6IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgcmV0dXJuICEodHlwZW9mIHRpbGUuZ2V0U29saWQgPT09ICdmdW5jdGlvbicgJiYgdGlsZS5nZXRTb2xpZCgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBFeHBsb3NpdmU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRGFtYWdlUHJvcGFnYXRpb24uanMubWFwXG4iLCJ2YXIgRGFtYWdlYWJsZSwgRWxlbWVudDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhbWFnZWFibGUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIERhbWFnZWFibGUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBkYW1hZ2UodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5oZWFsdGggPSBNYXRoLm1heCgwLCB0aGlzLmhlYWx0aCAtIHZhbCk7XG4gICAgfVxuXG4gICAgd2hlbk5vSGVhbHRoKCkge31cblxuICB9O1xuXG4gIERhbWFnZWFibGUucHJvcGVydGllcyh7XG4gICAgZGFtYWdlYWJsZToge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgbWF4SGVhbHRoOiB7XG4gICAgICBkZWZhdWx0OiAxMDAwXG4gICAgfSxcbiAgICBoZWFsdGg6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDAsXG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5oZWFsdGggPD0gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLndoZW5Ob0hlYWx0aCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRGFtYWdlYWJsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9EYW1hZ2VhYmxlLmpzLm1hcFxuIiwidmFyIERvb3IsIFRpbGVkO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxubW9kdWxlLmV4cG9ydHMgPSBEb29yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBEb29yIGV4dGVuZHMgVGlsZWQge1xuICAgIGNvbnN0cnVjdG9yKGRpcmVjdGlvbiA9IERvb3IuZGlyZWN0aW9ucy5ob3Jpem9udGFsKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgfVxuXG4gICAgdXBkYXRlVGlsZU1lbWJlcnMob2xkKSB7XG4gICAgICB2YXIgcmVmLCByZWYxLCByZWYyLCByZWYzO1xuICAgICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICAgIGlmICgocmVmID0gb2xkLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZi5yZW1vdmVSZWYoJ29wZW4nLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZjEgPSBvbGQudHJhbnNwYXJlbnRNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmMS5yZW1vdmVSZWYoJ29wZW4nLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICBpZiAoKHJlZjIgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmMi5hZGRQcm9wZXJ0eVJlZignb3BlbicsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAocmVmMyA9IHRoaXMudGlsZS50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwgPyByZWYzLmFkZFByb3BlcnR5UmVmKCdvcGVuJywgdGhpcykgOiB2b2lkIDA7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgRG9vci5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVUaWxlTWVtYmVycyhvbGQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3Blbjoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIGRpcmVjdGlvbjoge31cbiAgfSk7XG5cbiAgRG9vci5kaXJlY3Rpb25zID0ge1xuICAgIGhvcml6b250YWw6ICdob3Jpem9udGFsJyxcbiAgICB2ZXJ0aWNhbDogJ3ZlcnRpY2FsJ1xuICB9O1xuXG4gIHJldHVybiBEb29yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0Rvb3IuanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0VsZW1lbnQuanMubWFwXG4iLCJ2YXIgQ29uZnJvbnRhdGlvbiwgRWxlbWVudCwgRW5jb3VudGVyTWFuYWdlciwgUHJvcGVydHlXYXRjaGVyO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5JbnZhbGlkYXRlZC5Qcm9wZXJ0eVdhdGNoZXI7XG5cbkNvbmZyb250YXRpb24gPSByZXF1aXJlKCcuL0NvbmZyb250YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmNvdW50ZXJNYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFbmNvdW50ZXJNYW5hZ2VyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgaW5pdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0aW9uV2F0Y2hlci5iaW5kKCk7XG4gICAgfVxuXG4gICAgdGVzdEVuY291bnRlcigpIHtcbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDw9IHRoaXMuYmFzZVByb2JhYmlsaXR5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0RW5jb3VudGVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnRFbmNvdW50ZXIoKSB7XG4gICAgICB2YXIgZW5jb3VudGVyO1xuICAgICAgZW5jb3VudGVyID0gbmV3IENvbmZyb250YXRpb24oe1xuICAgICAgICBzdWJqZWN0OiB0aGlzLnN1YmplY3RcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVuY291bnRlci5zdGFydCgpO1xuICAgIH1cblxuICB9O1xuXG4gIEVuY291bnRlck1hbmFnZXIucHJvcGVydGllcyh7XG4gICAgc3ViamVjdDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgYmFzZVByb2JhYmlsaXR5OiB7XG4gICAgICBkZWZhdWx0OiAwLjJcbiAgICB9LFxuICAgIGxvY2F0aW9uV2F0Y2hlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZXN0RW5jb3VudGVyKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5zdWJqZWN0LmdldFByb3BlcnR5SW5zdGFuY2UoJ2xvY2F0aW9uJylcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRW5jb3VudGVyTWFuYWdlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbmNvbnRlck1hbmFnZXIuanMubWFwXG4iLCJ2YXIgRmxvb3IsIFRpbGU7XG5cblRpbGUgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRmxvb3IgZXh0ZW5kcyBUaWxlIHt9O1xuXG4gIEZsb29yLnByb3BlcnRpZXMoe1xuICAgIHdhbGthYmxlOiB7XG4gICAgICBjb21wb3NlZDogdHJ1ZVxuICAgIH0sXG4gICAgdHJhbnNwYXJlbnQ6IHtcbiAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRmxvb3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRmxvb3IuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgR2FtZSwgUGxheWVyLCBUaW1pbmcsIFZpZXc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxuVmlldyA9IHJlcXVpcmUoJy4vVmlldycpO1xuXG5QbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEdhbWUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBzdGFydCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQbGF5ZXI7XG4gICAgfVxuXG4gICAgYWRkKGVsZW0pIHtcbiAgICAgIGVsZW0uZ2FtZSA9IHRoaXM7XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICB9XG5cbiAgfTtcblxuICBHYW1lLnByb3BlcnRpZXMoe1xuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1haW5WaWV3OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy52aWV3cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlld3MuZ2V0KDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkZChuZXcgdGhpcy5kZWZhdWx0Vmlld0NsYXNzKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB2aWV3czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgY3VycmVudFBsYXllcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGxheWVycy5nZXQoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG5ldyB0aGlzLmRlZmF1bHRQbGF5ZXJDbGFzcygpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcGxheWVyczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgR2FtZS5wcm90b3R5cGUuZGVmYXVsdFZpZXdDbGFzcyA9IFZpZXc7XG5cbiAgR2FtZS5wcm90b3R5cGUuZGVmYXVsdFBsYXllckNsYXNzID0gUGxheWVyO1xuXG4gIHJldHVybiBHYW1lO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0dhbWUuanMubWFwXG4iLCJ2YXIgQ29sbGVjdGlvbiwgSW52ZW50b3J5O1xuXG5Db2xsZWN0aW9uID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkNvbGxlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gSW52ZW50b3J5ID0gY2xhc3MgSW52ZW50b3J5IGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGdldEJ5VHlwZSh0eXBlKSB7XG4gICAgdmFyIHJlcztcbiAgICByZXMgPSB0aGlzLmZpbHRlcihmdW5jdGlvbihyKSB7XG4gICAgICByZXR1cm4gci50eXBlID09PSB0eXBlO1xuICAgIH0pO1xuICAgIGlmIChyZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmVzWzBdO1xuICAgIH1cbiAgfVxuXG4gIGFkZEJ5VHlwZSh0eXBlLCBxdGUsIHBhcnRpYWwgPSBmYWxzZSkge1xuICAgIHZhciByZXNzb3VyY2U7XG4gICAgcmVzc291cmNlID0gdGhpcy5nZXRCeVR5cGUodHlwZSk7XG4gICAgaWYgKCFyZXNzb3VyY2UpIHtcbiAgICAgIHJlc3NvdXJjZSA9IHRoaXMuaW5pdFJlc3NvdXJjZSh0eXBlKTtcbiAgICB9XG4gICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgIHJldHVybiByZXNzb3VyY2UucGFydGlhbENoYW5nZShyZXNzb3VyY2UucXRlICsgcXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3NvdXJjZS5xdGUgKz0gcXRlO1xuICAgIH1cbiAgfVxuXG4gIGluaXRSZXNzb3VyY2UodHlwZSwgb3B0KSB7XG4gICAgcmV0dXJuIHR5cGUuaW5pdFJlc3NvdXJjZShvcHQpO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvSW52ZW50b3J5LmpzLm1hcFxuIiwidmFyIExpbmVPZlNpZ2h0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVPZlNpZ2h0ID0gY2xhc3MgTGluZU9mU2lnaHQge1xuICBjb25zdHJ1Y3Rvcih0aWxlcywgeDEgPSAwLCB5MSA9IDAsIHgyID0gMCwgeTIgPSAwKSB7XG4gICAgdGhpcy50aWxlcyA9IHRpbGVzO1xuICAgIHRoaXMueDEgPSB4MTtcbiAgICB0aGlzLnkxID0geTE7XG4gICAgdGhpcy54MiA9IHgyO1xuICAgIHRoaXMueTIgPSB5MjtcbiAgfVxuXG4gIHNldFgxKHZhbCkge1xuICAgIHRoaXMueDEgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgc2V0WTEodmFsKSB7XG4gICAgdGhpcy55MSA9IHZhbDtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKCk7XG4gIH1cblxuICBzZXRYMih2YWwpIHtcbiAgICB0aGlzLngyID0gdmFsO1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKTtcbiAgfVxuXG4gIHNldFkyKHZhbCkge1xuICAgIHRoaXMueTIgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgaW52YWxpZGFkZSgpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0gbnVsbDtcbiAgICB0aGlzLnN1Y2Nlc3MgPSBudWxsO1xuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHRlc3RUaWxlKHRpbGUsIGVudHJ5WCwgZW50cnlZKSB7XG4gICAgaWYgKHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUsIGVudHJ5WCwgZW50cnlZKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwpICYmICh0eXBlb2YgdGlsZS5nZXRUcmFuc3BhcmVudCA9PT0gJ2Z1bmN0aW9uJyA/IHRpbGUuZ2V0VHJhbnNwYXJlbnQoKSA6IHR5cGVvZiB0aWxlLnRyYW5zcGFyZW50ICE9PSB2b2lkIDAgPyB0aWxlLnRyYW5zcGFyZW50IDogdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgdGVzdFRpbGVBdCh4LCB5LCBlbnRyeVgsIGVudHJ5WSkge1xuICAgIHJldHVybiB0aGlzLnRlc3RUaWxlKHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHgpLCBNYXRoLmZsb29yKHkpKSwgZW50cnlYLCBlbnRyeVkpO1xuICB9XG5cbiAgcmV2ZXJzZVRyYWNpbmcoKSB7XG4gICAgdmFyIHRtcFgsIHRtcFk7XG4gICAgdG1wWCA9IHRoaXMueDE7XG4gICAgdG1wWSA9IHRoaXMueTE7XG4gICAgdGhpcy54MSA9IHRoaXMueDI7XG4gICAgdGhpcy55MSA9IHRoaXMueTI7XG4gICAgdGhpcy54MiA9IHRtcFg7XG4gICAgdGhpcy55MiA9IHRtcFk7XG4gICAgcmV0dXJuIHRoaXMucmV2ZXJzZWQgPSAhdGhpcy5yZXZlcnNlZDtcbiAgfVxuXG4gIGNhbGN1bCgpIHtcbiAgICB2YXIgbmV4dFgsIG5leHRZLCBwb3NpdGl2ZVgsIHBvc2l0aXZlWSwgcmF0aW8sIHRpbGVYLCB0aWxlWSwgdG90YWwsIHgsIHk7XG4gICAgcmF0aW8gPSAodGhpcy54MiAtIHRoaXMueDEpIC8gKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICB0b3RhbCA9IE1hdGguYWJzKHRoaXMueDIgLSB0aGlzLngxKSArIE1hdGguYWJzKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICBwb3NpdGl2ZVggPSAodGhpcy54MiAtIHRoaXMueDEpID49IDA7XG4gICAgcG9zaXRpdmVZID0gKHRoaXMueTIgLSB0aGlzLnkxKSA+PSAwO1xuICAgIHRpbGVYID0geCA9IHRoaXMueDE7XG4gICAgdGlsZVkgPSB5ID0gdGhpcy55MTtcbiAgICBpZiAodGhpcy5yZXZlcnNlZCkge1xuICAgICAgdGlsZVggPSBwb3NpdGl2ZVggPyB4IDogTWF0aC5jZWlsKHgpIC0gMTtcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDE7XG4gICAgfVxuICAgIHdoaWxlICh0b3RhbCA+IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSAmJiB0aGlzLnRlc3RUaWxlQXQodGlsZVgsIHRpbGVZLCB4LCB5KSkge1xuICAgICAgbmV4dFggPSBwb3NpdGl2ZVggPyBNYXRoLmZsb29yKHgpICsgMSA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICBuZXh0WSA9IHBvc2l0aXZlWSA/IE1hdGguZmxvb3IoeSkgKyAxIDogTWF0aC5jZWlsKHkpIC0gMTtcbiAgICAgIGlmICh0aGlzLngyIC0gdGhpcy54MSA9PT0gMCkge1xuICAgICAgICB5ID0gbmV4dFk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMueTIgLSB0aGlzLnkxID09PSAwKSB7XG4gICAgICAgIHggPSBuZXh0WDtcbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoKG5leHRYIC0geCkgLyAodGhpcy54MiAtIHRoaXMueDEpKSA8IE1hdGguYWJzKChuZXh0WSAtIHkpIC8gKHRoaXMueTIgLSB0aGlzLnkxKSkpIHtcbiAgICAgICAgeCA9IG5leHRYO1xuICAgICAgICB5ID0gKG5leHRYIC0gdGhpcy54MSkgLyByYXRpbyArIHRoaXMueTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4ID0gKG5leHRZIC0gdGhpcy55MSkgKiByYXRpbyArIHRoaXMueDE7XG4gICAgICAgIHkgPSBuZXh0WTtcbiAgICAgIH1cbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICB0aWxlWSA9IHBvc2l0aXZlWSA/IHkgOiBNYXRoLmNlaWwoeSkgLSAxO1xuICAgIH1cbiAgICBpZiAodG90YWwgPD0gTWF0aC5hYnMoeCAtIHRoaXMueDEpICsgTWF0aC5hYnMoeSAtIHRoaXMueTEpKSB7XG4gICAgICB0aGlzLmVuZFBvaW50ID0ge1xuICAgICAgICB4OiB0aGlzLngyLFxuICAgICAgICB5OiB0aGlzLnkyLFxuICAgICAgICB0aWxlOiB0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih0aGlzLngyKSwgTWF0aC5mbG9vcih0aGlzLnkyKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGlsZVgpLCBNYXRoLmZsb29yKHRpbGVZKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yY2VTdWNjZXNzKCkge1xuICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICB4OiB0aGlzLngyLFxuICAgICAgeTogdGhpcy55MixcbiAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRoaXMueDIpLCBNYXRoLmZsb29yKHRoaXMueTIpKVxuICAgIH07XG4gICAgdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGdldFN1Y2Nlc3MoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3M7XG4gIH1cblxuICBnZXRFbmRQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5jYWxjdWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5kUG9pbnQ7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9MaW5lT2ZTaWdodC5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBNYXA7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXAgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE1hcCBleHRlbmRzIEVsZW1lbnQge1xuICAgIF9hZGRUb0JvbmRhcmllcyhsb2NhdGlvbiwgYm91bmRhcmllcykge1xuICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCBsb2NhdGlvbi55IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgYm91bmRhcmllcy50b3AgPSBsb2NhdGlvbi55O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgbG9jYXRpb24ueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICBib3VuZGFyaWVzLmxlZnQgPSBsb2NhdGlvbi54O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCBsb2NhdGlvbi55ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgYm91bmRhcmllcy5ib3R0b20gPSBsb2NhdGlvbi55O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IGxvY2F0aW9uLnggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzLnJpZ2h0ID0gbG9jYXRpb24ueDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBNYXAucHJvcGVydGllcyh7XG4gICAgbG9jYXRpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB7XG4gICAgICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICB2YXIgbWluLCBtaW5EaXN0O1xuICAgICAgICAgIG1pbiA9IG51bGw7XG4gICAgICAgICAgbWluRGlzdCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZGlzdDtcbiAgICAgICAgICAgIGRpc3QgPSBsb2NhdGlvbi5kaXN0KHgsIHkpO1xuICAgICAgICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgICAgICAgbWluID0gbG9jYXRpb247XG4gICAgICAgICAgICAgIHJldHVybiBtaW5EaXN0ID0gZGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gbWluO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZXN0czogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgIHZhciBkaXN0cztcbiAgICAgICAgICBkaXN0cyA9IHRoaXMubWFwKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBkaXN0OiBsb2NhdGlvbi5kaXN0KHgsIHkpLFxuICAgICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZGlzdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5kaXN0IC0gYi5kaXN0O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvcHkoZGlzdHMubWFwKGZ1bmN0aW9uKGRpc3QpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXN0LmxvY2F0aW9uO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYm91bmRhcmllczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJvdW5kYXJpZXM7XG4gICAgICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICAgICAgdG9wOiBudWxsLFxuICAgICAgICAgIGxlZnQ6IG51bGwsXG4gICAgICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgICAgIHJpZ2h0OiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZFRvQm9uZGFyaWVzKGxvY2F0aW9uLCBib3VuZGFyaWVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzO1xuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIE1hcDtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NYXAuanMubWFwXG4iLCJ2YXIgT2JzdGFjbGUsIFRpbGVkO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxubW9kdWxlLmV4cG9ydHMgPSBPYnN0YWNsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgT2JzdGFjbGUgZXh0ZW5kcyBUaWxlZCB7XG4gICAgdXBkYXRlV2Fsa2FibGVzKG9sZCkge1xuICAgICAgdmFyIHJlZiwgcmVmMTtcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYucmVtb3ZlUmVmKCd3YWxrYWJsZScsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICAgIHJldHVybiAocmVmMSA9IHRoaXMudGlsZS53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwgPyByZWYxLnNldFZhbHVlUmVmKGZhbHNlLCAnd2Fsa2FibGUnLCB0aGlzKSA6IHZvaWQgMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBPYnN0YWNsZS5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCwgb3ZlcnJpZGVkKSB7XG4gICAgICAgIG92ZXJyaWRlZChvbGQpO1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVXYWxrYWJsZXMob2xkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBPYnN0YWNsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PYnN0YWNsZS5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBFdmVudEVtaXR0ZXIsIFBhdGhXYWxrLCBUaW1pbmc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoV2FsayA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGF0aFdhbGsgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih3YWxrZXIsIHBhdGgsIG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLndhbGtlciA9IHdhbGtlcjtcbiAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICBpZiAoIXRoaXMucGF0aC5zb2x1dGlvbikge1xuICAgICAgICB0aGlzLnBhdGguY2FsY3VsKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wYXRoLnNvbHV0aW9uKSB7XG4gICAgICAgIHRoaXMucGF0aFRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maW5pc2goKTtcbiAgICAgICAgfSwgdGhpcy50b3RhbFRpbWUpO1xuICAgICAgICB0aGlzLndhbGtlci50aWxlTWVtYmVycy5hZGRQcm9wZXJ0eVJlZigncG9zaXRpb24udGlsZScsIHRoaXMpO1xuICAgICAgICB0aGlzLndhbGtlci5vZmZzZXRYTWVtYmVycy5hZGRQcm9wZXJ0eVJlZigncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrZXIub2Zmc2V0WU1lbWJlcnMuYWRkUHJvcGVydHlSZWYoJ3Bvc2l0aW9uLm9mZnNldFknLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wKCkge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aFRpbWVvdXQucGF1c2UoKTtcbiAgICB9XG5cbiAgICBmaW5pc2goKSB7XG4gICAgICB0aGlzLndhbGtlci50aWxlID0gdGhpcy5wb3NpdGlvbi50aWxlO1xuICAgICAgdGhpcy53YWxrZXIub2Zmc2V0WCA9IHRoaXMucG9zaXRpb24ub2Zmc2V0WDtcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFkgPSB0aGlzLnBvc2l0aW9uLm9mZnNldFk7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2ZpbmlzaGVkJyk7XG4gICAgICByZXR1cm4gdGhpcy5lbmQoKTtcbiAgICB9XG5cbiAgICBpbnRlcnJ1cHQoKSB7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2ludGVycnVwdGVkJyk7XG4gICAgICByZXR1cm4gdGhpcy5lbmQoKTtcbiAgICB9XG5cbiAgICBlbmQoKSB7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2VuZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy53YWxrZXIud2FsayA9PT0gdGhpcykge1xuICAgICAgICB0aGlzLndhbGtlci53YWxrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMud2Fsa2VyLnRpbGVNZW1iZXJzLnJlbW92ZVJlZigncG9zaXRpb24udGlsZScsIHRoaXMpO1xuICAgICAgdGhpcy53YWxrZXIub2Zmc2V0WE1lbWJlcnMucmVtb3ZlUmVmKCdwb3NpdGlvbi5vZmZzZXRYJywgdGhpcyk7XG4gICAgICB0aGlzLndhbGtlci5vZmZzZXRZTWVtYmVycy5yZW1vdmVSZWYoJ3Bvc2l0aW9uLm9mZnNldFknLCB0aGlzKTtcbiAgICAgIHRoaXMucGF0aFRpbWVvdXQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5kZXN0cm95UHJvcGVydGllcygpO1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aFdhbGsuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBQYXRoV2Fsay5wcm9wZXJ0aWVzKHtcbiAgICBzcGVlZDoge1xuICAgICAgZGVmYXVsdDogNVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcGF0aExlbmd0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aC5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG90YWxUaW1lOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoTGVuZ3RoIC8gdGhpcy5zcGVlZCAqIDEwMDA7XG4gICAgICB9XG4gICAgfSxcbiAgICBwb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoLmdldFBvc0F0UHJjKGludmFsaWRhdG9yLnByb3BQYXRoKCdwYXRoVGltZW91dC5wcmMnKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUGF0aFdhbGs7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUGF0aFdhbGsuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTGluZU9mU2lnaHQsIFBlcnNvbmFsV2VhcG9uLCBUaW1pbmc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL0xpbmVPZlNpZ2h0Jyk7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uYWxXZWFwb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBlcnNvbmFsV2VhcG9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBjYW5CZVVzZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VkO1xuICAgIH1cblxuICAgIGNhblVzZU9uKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FuVXNlRnJvbSh0aGlzLnVzZXIudGlsZSwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBjYW5Vc2VGcm9tKHRpbGUsIHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMucmFuZ2UgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pblJhbmdlKHRpbGUsIHRhcmdldCkgJiYgdGhpcy5oYXNMaW5lT2ZTaWdodCh0aWxlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluUmFuZ2UodGlsZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmLCB0YXJnZXRUaWxlO1xuICAgICAgdGFyZ2V0VGlsZSA9IHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgIHJldHVybiAoKHJlZiA9IHRpbGUuZGlzdCh0YXJnZXRUaWxlKSkgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApIDw9IHRoaXMucmFuZ2U7XG4gICAgfVxuXG4gICAgaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIHRhcmdldFRpbGU7XG4gICAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0O1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHRhcmdldFRpbGUueCAtIHRpbGUueCkgKyBNYXRoLmFicyh0YXJnZXRUaWxlLnkgLSB0aWxlLnkpID09PSAxO1xuICAgIH1cblxuICAgIGhhc0xpbmVPZlNpZ2h0KHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIGxvcywgdGFyZ2V0VGlsZTtcbiAgICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXQ7XG4gICAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGFyZ2V0VGlsZS5jb250YWluZXIsIHRpbGUueCArIDAuNSwgdGlsZS55ICsgMC41LCB0YXJnZXRUaWxlLnggKyAwLjUsIHRhcmdldFRpbGUueSArIDAuNSk7XG4gICAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHRpbGUud2Fsa2FibGU7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGxvcy5nZXRTdWNjZXNzKCk7XG4gICAgfVxuXG4gICAgdXNlT24odGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5jYW5CZVVzZWQoKSkge1xuICAgICAgICB0YXJnZXQuZGFtYWdlKHRoaXMucG93ZXIpO1xuICAgICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWNoYXJnZSgpIHtcbiAgICAgIHRoaXMuY2hhcmdpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJnaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlZCgpO1xuICAgICAgfSwgdGhpcy5yZWNoYXJnZVRpbWUpO1xuICAgIH1cblxuICAgIHJlY2hhcmdlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJnZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy5jaGFyZ2VUaW1lb3V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJnZVRpbWVvdXQuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFBlcnNvbmFsV2VhcG9uLnByb3BlcnRpZXMoe1xuICAgIHJlY2hhcmdlVGltZToge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgY2hhcmdlZDoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY2hhcmdpbmc6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgZHBzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdwb3dlcicpIC8gaW52YWxpZGF0b3IucHJvcCgncmVjaGFyZ2VUaW1lJykgKiAxMDAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICB1c2VyOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUGVyc29uYWxXZWFwb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUGVyc29uYWxXZWFwb24uanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgRXZlbnRFbWl0dGVyLCBQbGF5ZXI7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBsYXllciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgZmlyc3Q7XG4gICAgICBmaXJzdCA9IHRoaXMuZ2FtZS5wbGF5ZXJzLmxlbmd0aCA9PT0gMDtcbiAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJzLmFkZCh0aGlzKTtcbiAgICAgIGlmIChmaXJzdCAmJiAhdGhpcy5jb250cm9sbGVyICYmIHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgdGhpcy5nYW1lLmRlZmF1bHRQbGF5ZXJDb250cm9sbGVyQ2xhc3MoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5UYXJnZXRBY3Rpb25PbihlbGVtKSB7XG4gICAgICB2YXIgYWN0aW9uLCByZWY7XG4gICAgICBhY3Rpb24gPSB0aGlzLnNlbGVjdGVkQWN0aW9uIHx8ICgocmVmID0gdGhpcy5zZWxlY3RlZCkgIT0gbnVsbCA/IHJlZi5kZWZhdWx0QWN0aW9uIDogdm9pZCAwKTtcbiAgICAgIHJldHVybiAoYWN0aW9uICE9IG51bGwpICYmIHR5cGVvZiBhY3Rpb24uY2FuVGFyZ2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgYWN0aW9uLmNhblRhcmdldChlbGVtKTtcbiAgICB9XG5cbiAgICBjYW5TZWxlY3QoZWxlbSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBlbGVtLmlzU2VsZWN0YWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIgJiYgZWxlbS5pc1NlbGVjdGFibGVCeSh0aGlzKTtcbiAgICB9XG5cbiAgICBjYW5Gb2N1c09uKGVsZW0pIHtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5Jc0ZvY3VzYWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uSXNGb2N1c2FibGVCeSh0aGlzKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0uSXNTZWxlY3RhYmxlQnkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gZWxlbS5Jc1NlbGVjdGFibGVCeSh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3RBY3Rpb24oYWN0aW9uKSB7XG4gICAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgICByZXR1cm4gYWN0aW9uLnN0YXJ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRBY3Rpb25UYXJnZXQoZWxlbSkge1xuICAgICAgdmFyIGFjdGlvbiwgcmVmO1xuICAgICAgYWN0aW9uID0gdGhpcy5zZWxlY3RlZEFjdGlvbiB8fCAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYuZGVmYXVsdEFjdGlvbiA6IHZvaWQgMCk7XG4gICAgICBhY3Rpb24gPSBhY3Rpb24ud2l0aFRhcmdldChlbGVtKTtcbiAgICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICAgIGFjdGlvbi5zdGFydCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFjdGlvbiA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBQbGF5ZXIuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBQbGF5ZXIucHJvcGVydGllcyh7XG4gICAgbmFtZToge1xuICAgICAgZGVmYXVsdDogJ1BsYXllcidcbiAgICB9LFxuICAgIGZvY3VzZWQ6IHt9LFxuICAgIHNlbGVjdGVkOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICBpZiAob2xkICE9IG51bGwgPyBvbGQuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICBvbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGdsb2JhbEFjdGlvblByb3ZpZGVyczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgYWN0aW9uUHJvdmlkZXJzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByZXMsIHNlbGVjdGVkO1xuICAgICAgICByZXMgPSBpbnZhbGlkYXRvci5wcm9wKCdnbG9iYWxBY3Rpb25Qcm92aWRlcnMnKS50b0FycmF5KCk7XG4gICAgICAgIHNlbGVjdGVkID0gaW52YWxpZGF0b3IucHJvcCgnc2VsZWN0ZWQnKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgcmVzLnB1c2goc2VsZWN0ZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgfSxcbiAgICBhdmFpbGFibGVBY3Rpb25zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKFwiYWN0aW9uUHJvdmlkZXJzXCIpLnJlZHVjZSgocmVzLCBwcm92aWRlcikgPT4ge1xuICAgICAgICAgIHZhciBhY3Rpb25zO1xuICAgICAgICAgIGFjdGlvbnMgPSBpbnZhbGlkYXRvci5wcm9wKFwiYXZhaWxhYmxlQWN0aW9uc1wiLCBwcm92aWRlcik7XG4gICAgICAgICAgaWYgKGFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuY29uY2F0KGFjdGlvbnMudG9BcnJheSgpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNlbGVjdGVkQWN0aW9uOiB7fSxcbiAgICBjb250cm9sbGVyOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sbGVyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29udHJvbGxlci5wbGF5ZXIgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBnYW1lOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGVmYXVsdHMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFBsYXllcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9QbGF5ZXIuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgUHJvamVjdGlsZSwgVGltaW5nO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdGlsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUHJvamVjdGlsZSBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIGxhdW5jaCgpIHtcbiAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVsaXZlclBheWxvYWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICB9LCB0aGlzLnBhdGhMZW5ndGggLyB0aGlzLnNwZWVkICogMTAwMCk7XG4gICAgfVxuXG4gICAgZGVsaXZlclBheWxvYWQoKSB7XG4gICAgICB2YXIgcGF5bG9hZDtcbiAgICAgIHBheWxvYWQgPSBuZXcgdGhpcy5wcm9wYWdhdGlvblR5cGUoe1xuICAgICAgICB0aWxlOiB0aGlzLnRhcmdldC50aWxlIHx8IHRoaXMudGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgcmFuZ2U6IHRoaXMuYmxhc3RSYW5nZVxuICAgICAgfSk7XG4gICAgICBwYXlsb2FkLmFwcGx5KCk7XG4gICAgICB0aGlzLnBheWxvYWREZWxpdmVyZWQoKTtcbiAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH1cblxuICAgIHBheWxvYWREZWxpdmVyZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgUHJvamVjdGlsZS5wcm9wZXJ0aWVzKHtcbiAgICBvcmlnaW46IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcG93ZXI6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICBibGFzdFJhbmdlOiB7XG4gICAgICBkZWZhdWx0OiAxXG4gICAgfSxcbiAgICBwcm9wYWdhdGlvblR5cGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHNwZWVkOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgcGF0aExlbmd0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpc3Q7XG4gICAgICAgIGlmICgodGhpcy5vcmlnaW5UaWxlICE9IG51bGwpICYmICh0aGlzLnRhcmdldFRpbGUgIT0gbnVsbCkpIHtcbiAgICAgICAgICBkaXN0ID0gdGhpcy5vcmlnaW5UaWxlLmRpc3QodGhpcy50YXJnZXRUaWxlKTtcbiAgICAgICAgICBpZiAoZGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc3QubGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3JpZ2luVGlsZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgb3JpZ2luO1xuICAgICAgICBvcmlnaW4gPSBpbnZhbGlkYXRvci5wcm9wKCdvcmlnaW4nKTtcbiAgICAgICAgaWYgKG9yaWdpbiAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbi50aWxlIHx8IG9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGFyZ2V0VGlsZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgdGFyZ2V0O1xuICAgICAgICB0YXJnZXQgPSBpbnZhbGlkYXRvci5wcm9wKCd0YXJnZXQnKTtcbiAgICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIG9yaWdpblRpbGUsIHRhcmdldFRpbGU7XG4gICAgICAgIG9yaWdpblRpbGUgPSBpbnZhbGlkYXRlLnByb3AoJ29yaWdpblRpbGUnKTtcbiAgICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCgndGFyZ2V0VGlsZScpO1xuICAgICAgICBpZiAob3JpZ2luVGlsZS5jb250YWluZXIgPT09IHRhcmdldFRpbGUuY29udGFpbmVyKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpblRpbGUuY29udGFpbmVyO1xuICAgICAgICB9IGVsc2UgaWYgKGludmFsaWRhdGUucHJvcCgncHJjUGF0aCcpID4gMC41KSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFRpbGUuY29udGFpbmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5UaWxlLmNvbnRhaW5lcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBzdGFydFBvcztcbiAgICAgICAgc3RhcnRQb3MgPSBpbnZhbGlkYXRlLnByb3AoJ3N0YXJ0UG9zJyk7XG4gICAgICAgIHJldHVybiAoaW52YWxpZGF0ZS5wcm9wKCd0YXJnZXRQb3MnKS54IC0gc3RhcnRQb3MueCkgKiBpbnZhbGlkYXRlLnByb3AoJ3ByY1BhdGgnKSArIHN0YXJ0UG9zLng7XG4gICAgICB9XG4gICAgfSxcbiAgICB5OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIHN0YXJ0UG9zO1xuICAgICAgICBzdGFydFBvcyA9IGludmFsaWRhdGUucHJvcCgnc3RhcnRQb3MnKTtcbiAgICAgICAgcmV0dXJuIChpbnZhbGlkYXRlLnByb3AoJ3RhcmdldFBvcycpLnkgLSBzdGFydFBvcy55KSAqIGludmFsaWRhdGUucHJvcCgncHJjUGF0aCcpICsgc3RhcnRQb3MueTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0UG9zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciwgZGlzdCwgb2Zmc2V0LCBvcmlnaW5UaWxlO1xuICAgICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKCdvcmlnaW5UaWxlJyk7XG4gICAgICAgIGNvbnRhaW5lciA9IGludmFsaWRhdGUucHJvcCgnY29udGFpbmVyJyk7XG4gICAgICAgIG9mZnNldCA9IHRoaXMuc3RhcnRPZmZzZXQ7XG4gICAgICAgIGlmIChvcmlnaW5UaWxlLmNvbnRhaW5lciAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgZGlzdCA9IGNvbnRhaW5lci5kaXN0KG9yaWdpblRpbGUuY29udGFpbmVyKTtcbiAgICAgICAgICBvZmZzZXQueCArPSBkaXN0Lng7XG4gICAgICAgICAgb2Zmc2V0LnkgKz0gZGlzdC55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogb3JpZ2luVGlsZS54ICsgb2Zmc2V0LngsXG4gICAgICAgICAgeTogb3JpZ2luVGlsZS55ICsgb2Zmc2V0LnlcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldFBvczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBjb250YWluZXIsIGRpc3QsIG9mZnNldCwgdGFyZ2V0VGlsZTtcbiAgICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCgndGFyZ2V0VGlsZScpO1xuICAgICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AoJ2NvbnRhaW5lcicpO1xuICAgICAgICBvZmZzZXQgPSB0aGlzLnRhcmdldE9mZnNldDtcbiAgICAgICAgaWYgKHRhcmdldFRpbGUuY29udGFpbmVyICE9PSBjb250YWluZXIpIHtcbiAgICAgICAgICBkaXN0ID0gY29udGFpbmVyLmRpc3QodGFyZ2V0VGlsZS5jb250YWluZXIpO1xuICAgICAgICAgIG9mZnNldC54ICs9IGRpc3QueDtcbiAgICAgICAgICBvZmZzZXQueSArPSBkaXN0Lnk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiB0YXJnZXRUaWxlLnggKyBvZmZzZXQueCxcbiAgICAgICAgICB5OiB0YXJnZXRUaWxlLnkgKyBvZmZzZXQueVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRPZmZzZXQ6IHtcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgeDogMC41LFxuICAgICAgICB5OiAwLjVcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldE9mZnNldDoge1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB4OiAwLjUsXG4gICAgICAgIHk6IDAuNVxuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcHJjUGF0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgcmV0dXJuICgocmVmID0gdGhpcy5wYXRoVGltZW91dCkgIT0gbnVsbCA/IHJlZi5nZXRQcmMoKSA6IHZvaWQgMCkgfHwgMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmluZzoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBQcm9qZWN0aWxlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb2plY3RpbGUuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgUmVzc291cmNlO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzc291cmNlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSZXNzb3VyY2UgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBwYXJ0aWFsQ2hhbmdlKHF0ZSkge1xuICAgICAgdmFyIGFjY2VwdGFibGU7XG4gICAgICBhY2NlcHRhYmxlID0gTWF0aC5tYXgodGhpcy5taW5RdGUsIE1hdGgubWluKHRoaXMubWF4UXRlLCBxdGUpKTtcbiAgICAgIHRoaXMucXRlID0gYWNjZXB0YWJsZTtcbiAgICAgIHJldHVybiBxdGUgLSBhY2NlcHRhYmxlO1xuICAgIH1cblxuICB9O1xuXG4gIFJlc3NvdXJjZS5wcm9wZXJ0aWVzKHtcbiAgICB0eXBlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBxdGU6IHtcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICBpbmdlc3Q6IGZ1bmN0aW9uKHF0ZSkge1xuICAgICAgICBpZiAodGhpcy5tYXhRdGUgIT09IG51bGwgJiYgcXRlID4gdGhpcy5tYXhRdGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgaGF2ZSBtb3JlIHRoYW4gJyArIHRoaXMubWF4UXRlICsgJyBvZiAnICsgdGhpcy50eXBlLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm1pblF0ZSAhPT0gbnVsbCAmJiBxdGUgPCB0aGlzLm1pblF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudCBoYXZlIGxlc3MgdGhhbiAnICsgdGhpcy5taW5RdGUgKyAnIG9mICcgKyB0aGlzLnR5cGUubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF0ZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1heFF0ZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgbWluUXRlOiB7XG4gICAgICBkZWZhdWx0OiAwXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUmVzc291cmNlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Jlc3NvdXJjZS5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBSZXNzb3VyY2UsIFJlc3NvdXJjZVR5cGU7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuUmVzc291cmNlID0gcmVxdWlyZSgnLi9SZXNzb3VyY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNzb3VyY2VUeXBlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSZXNzb3VyY2VUeXBlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgaW5pdFJlc3NvdXJjZShvcHQpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdCA9IHtcbiAgICAgICAgICBxdGU6IG9wdFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0T3B0aW9ucywgb3B0KTtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5yZXNzb3VyY2VDbGFzcyhvcHQpO1xuICAgIH1cblxuICB9O1xuXG4gIFJlc3NvdXJjZVR5cGUucHJvcGVydGllcyh7XG4gICAgbmFtZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcmVzc291cmNlQ2xhc3M6IHtcbiAgICAgIGRlZmF1bHQ6IFJlc3NvdXJjZVxuICAgIH0sXG4gICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgIGRlZmF1bHQ6IHt9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUmVzc291cmNlVHlwZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9SZXNzb3VyY2VUeXBlLmpzLm1hcFxuIiwidmFyIERpcmVjdGlvbiwgRG9vciwgRWxlbWVudCwgUm9vbUdlbmVyYXRvciwgVGlsZSwgVGlsZUNvbnRhaW5lcixcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyO1xuXG5UaWxlID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGU7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbkRvb3IgPSByZXF1aXJlKCcuL0Rvb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb29tR2VuZXJhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSb29tR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBpbml0VGlsZXMoKSB7XG4gICAgICB0aGlzLmZpbmFsVGlsZXMgPSBudWxsO1xuICAgICAgdGhpcy5yb29tcyA9IFtdO1xuICAgICAgcmV0dXJuIHRoaXMuZnJlZSA9IHRoaXMudGlsZUNvbnRhaW5lci5hbGxUaWxlcygpLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICB2YXIgZGlyZWN0aW9uLCBrLCBsZW4sIG5leHQsIHJlZjtcbiAgICAgICAgcmVmID0gRGlyZWN0aW9uLmFsbDtcbiAgICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgICAgZGlyZWN0aW9uID0gcmVmW2tdO1xuICAgICAgICAgIG5leHQgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh0aWxlLnggKyBkaXJlY3Rpb24ueCwgdGlsZS55ICsgZGlyZWN0aW9uLnkpO1xuICAgICAgICAgIGlmIChuZXh0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICB2YXIgaTtcbiAgICAgIHRoaXMuaW5pdFRpbGVzKCk7XG4gICAgICBpID0gMDtcbiAgICAgIHdoaWxlICh0aGlzLnN0ZXAoKSB8fCB0aGlzLm5ld1Jvb20oKSkge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgICB0aGlzLmNyZWF0ZURvb3JzKCk7XG4gICAgICB0aGlzLnJvb21zO1xuICAgICAgcmV0dXJuIHRoaXMubWFrZUZpbmFsVGlsZXMoKTtcbiAgICB9XG5cbiAgICBtYWtlRmluYWxUaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmFsVGlsZXMgPSB0aGlzLnRpbGVDb250YWluZXIuYWxsVGlsZXMoKS5tYXAoKHRpbGUpID0+IHtcbiAgICAgICAgdmFyIG9wdDtcbiAgICAgICAgaWYgKHRpbGUuZmFjdG9yeSAhPSBudWxsKSB7XG4gICAgICAgICAgb3B0ID0ge1xuICAgICAgICAgICAgeDogdGlsZS54LFxuICAgICAgICAgICAgeTogdGlsZS55XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodGlsZS5mYWN0b3J5T3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKG9wdCwgdGlsZS5mYWN0b3J5T3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aWxlLmZhY3Rvcnkob3B0KTtcbiAgICAgICAgfVxuICAgICAgfSkuZmlsdGVyKCh0aWxlKSA9PiB7XG4gICAgICAgIHJldHVybiB0aWxlICE9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRUaWxlcygpIHtcbiAgICAgIGlmICh0aGlzLmZpbmFsVGlsZXMgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNhbGN1bCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluYWxUaWxlcztcbiAgICB9XG5cbiAgICBuZXdSb29tKCkge1xuICAgICAgaWYgKHRoaXMuZnJlZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy52b2x1bWUgPSBNYXRoLmZsb29yKHRoaXMucm5nKCkgKiAodGhpcy5tYXhWb2x1bWUgLSB0aGlzLm1pblZvbHVtZSkpICsgdGhpcy5taW5Wb2x1bWU7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb20gPSBuZXcgUm9vbUdlbmVyYXRvci5Sb29tKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmFuZG9tRGlyZWN0aW9ucygpIHtcbiAgICAgIHZhciBpLCBqLCBvLCB4O1xuICAgICAgbyA9IERpcmVjdGlvbi5hZGphY2VudHMuc2xpY2UoKTtcbiAgICAgIGogPSB2b2lkIDA7XG4gICAgICB4ID0gdm9pZCAwO1xuICAgICAgaSA9IG8ubGVuZ3RoO1xuICAgICAgd2hpbGUgKGkpIHtcbiAgICAgICAgaiA9IE1hdGguZmxvb3IodGhpcy5ybmcoKSAqIGkpO1xuICAgICAgICB4ID0gb1stLWldO1xuICAgICAgICBvW2ldID0gb1tqXTtcbiAgICAgICAgb1tqXSA9IHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gbztcbiAgICB9XG5cbiAgICBzdGVwKCkge1xuICAgICAgdmFyIHN1Y2Nlc3MsIHRyaWVzO1xuICAgICAgaWYgKHRoaXMucm9vbSkge1xuICAgICAgICBpZiAodGhpcy5mcmVlLmxlbmd0aCAmJiB0aGlzLnJvb20udGlsZXMubGVuZ3RoIDwgdGhpcy52b2x1bWUgLSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMucm9vbS50aWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRyaWVzID0gdGhpcy5yYW5kb21EaXJlY3Rpb25zKCk7XG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICB3aGlsZSAodHJpZXMubGVuZ3RoICYmICFzdWNjZXNzKSB7XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmV4cGFuZCh0aGlzLnJvb20sIHRyaWVzLnBvcCgpLCB0aGlzLnZvbHVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgdGhpcy5yb29tRG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKHRoaXMucmFuZG9tRnJlZVRpbGUoKSwgdGhpcy5yb29tKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJvb21Eb25lKCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcm9vbURvbmUoKSB7XG4gICAgICB0aGlzLnJvb21zLnB1c2godGhpcy5yb29tKTtcbiAgICAgIHRoaXMuYWxsb2NhdGVXYWxscyh0aGlzLnJvb20pO1xuICAgICAgcmV0dXJuIHRoaXMucm9vbSA9IG51bGw7XG4gICAgfVxuXG4gICAgZXhwYW5kKHJvb20sIGRpcmVjdGlvbiwgbWF4ID0gMCkge1xuICAgICAgdmFyIGssIGxlbiwgbmV4dCwgcmVmLCBzZWNvbmQsIHN1Y2Nlc3MsIHRpbGU7XG4gICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICByZWYgPSByb29tLnRpbGVzO1xuICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgIHRpbGUgPSByZWZba107XG4gICAgICAgIGlmIChtYXggPT09IDAgfHwgcm9vbS50aWxlcy5sZW5ndGggPCBtYXgpIHtcbiAgICAgICAgICBpZiAobmV4dCA9IHRoaXMudGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZShuZXh0LCByb29tKTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoKHNlY29uZCA9IHRoaXMudGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24sIDIpKSAmJiAhdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgMykpIHtcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKHNlY29uZCwgcm9vbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VjY2VzcztcbiAgICB9XG5cbiAgICBhbGxvY2F0ZVdhbGxzKHJvb20pIHtcbiAgICAgIHZhciBkaXJlY3Rpb24sIGssIGxlbiwgbmV4dCwgbmV4dFJvb20sIG90aGVyU2lkZSwgcmVmLCByZXN1bHRzLCB0aWxlO1xuICAgICAgcmVmID0gcm9vbS50aWxlcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICB0aWxlID0gcmVmW2tdO1xuICAgICAgICByZXN1bHRzLnB1c2goKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICByZWYxID0gRGlyZWN0aW9uLmFsbDtcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gcmVmMVtsXTtcbiAgICAgICAgICAgIG5leHQgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh0aWxlLnggKyBkaXJlY3Rpb24ueCwgdGlsZS55ICsgZGlyZWN0aW9uLnkpO1xuICAgICAgICAgICAgaWYgKChuZXh0ICE9IG51bGwpICYmIG5leHQucm9vbSAhPT0gcm9vbSkge1xuICAgICAgICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKERpcmVjdGlvbi5jb3JuZXJzLCBkaXJlY3Rpb24pIDwgMCkge1xuICAgICAgICAgICAgICAgIG90aGVyU2lkZSA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54ICogMiwgdGlsZS55ICsgZGlyZWN0aW9uLnkgKiAyKTtcbiAgICAgICAgICAgICAgICBuZXh0Um9vbSA9IChvdGhlclNpZGUgIT0gbnVsbCA/IG90aGVyU2lkZS5yb29tIDogdm9pZCAwKSAhPSBudWxsID8gb3RoZXJTaWRlLnJvb20gOiBudWxsO1xuICAgICAgICAgICAgICAgIHJvb20uYWRkV2FsbChuZXh0LCBuZXh0Um9vbSk7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRSb29tICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIG5leHRSb29tLmFkZFdhbGwobmV4dCwgcm9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG5leHQuZmFjdG9yeSA9IHRoaXMud2FsbEZhY3Rvcnk7XG4gICAgICAgICAgICAgIHJlc3VsdHMxLnB1c2godGhpcy5hbGxvY2F0ZVRpbGUobmV4dCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0czEucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pLmNhbGwodGhpcykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgY3JlYXRlRG9vcnMoKSB7XG4gICAgICB2YXIgZG9vciwgaywgbGVuLCByZWYsIHJlc3VsdHMsIHJvb20sIHdhbGxzO1xuICAgICAgcmVmID0gdGhpcy5yb29tcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICByb29tID0gcmVmW2tdO1xuICAgICAgICByZXN1bHRzLnB1c2goKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICByZWYxID0gcm9vbS53YWxsc0J5Um9vbXMoKTtcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgICAgd2FsbHMgPSByZWYxW2xdO1xuICAgICAgICAgICAgaWYgKCh3YWxscy5yb29tICE9IG51bGwpICYmIHJvb20uZG9vcnNGb3JSb29tKHdhbGxzLnJvb20pIDwgMSkge1xuICAgICAgICAgICAgICBkb29yID0gd2FsbHMudGlsZXNbTWF0aC5mbG9vcih0aGlzLnJuZygpICogd2FsbHMudGlsZXMubGVuZ3RoKV07XG4gICAgICAgICAgICAgIGRvb3IuZmFjdG9yeSA9IHRoaXMuZG9vckZhY3Rvcnk7XG4gICAgICAgICAgICAgIGRvb3IuZmFjdG9yeU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZShkb29yLnggKyAxLCBkb29yLnkpLmZhY3RvcnkgPT09IHRoaXMuZmxvb3JGYWN0b3J5ID8gRG9vci5kaXJlY3Rpb25zLnZlcnRpY2FsIDogRG9vci5kaXJlY3Rpb25zLmhvcml6b250YWxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcm9vbS5hZGREb29yKGRvb3IsIHdhbGxzLnJvb20pO1xuICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHdhbGxzLnJvb20uYWRkRG9vcihkb29yLCByb29tKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzMTtcbiAgICAgICAgfSkuY2FsbCh0aGlzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBhbGxvY2F0ZVRpbGUodGlsZSwgcm9vbSA9IG51bGwpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGlmIChyb29tICE9IG51bGwpIHtcbiAgICAgICAgcm9vbS5hZGRUaWxlKHRpbGUpO1xuICAgICAgICB0aWxlLmZhY3RvcnkgPSB0aGlzLmZsb29yRmFjdG9yeTtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gdGhpcy5mcmVlLmluZGV4T2YodGlsZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5mcmVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24sIG11bHRpcGx5ID0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZUlzRnJlZSh0aWxlLnggKyBkaXJlY3Rpb24ueCAqIG11bHRpcGx5LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSAqIG11bHRpcGx5KTtcbiAgICB9XG5cbiAgICB0aWxlSXNGcmVlKHgsIHkpIHtcbiAgICAgIHZhciB0aWxlO1xuICAgICAgdGlsZSA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgaWYgKCh0aWxlICE9IG51bGwpICYmIGluZGV4T2YuY2FsbCh0aGlzLmZyZWUsIHRpbGUpID49IDApIHtcbiAgICAgICAgcmV0dXJuIHRpbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmFuZG9tRnJlZVRpbGUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5mcmVlW01hdGguZmxvb3IodGhpcy5ybmcoKSAqIHRoaXMuZnJlZS5sZW5ndGgpXTtcbiAgICB9XG5cbiAgfTtcblxuICBSb29tR2VuZXJhdG9yLnByb3BlcnRpZXMoe1xuICAgIHJuZzoge1xuICAgICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgICB9LFxuICAgIG1heFZvbHVtZToge1xuICAgICAgZGVmYXVsdDogMjVcbiAgICB9LFxuICAgIG1pblZvbHVtZToge1xuICAgICAgZGVmYXVsdDogNTBcbiAgICB9LFxuICAgIHdpZHRoOiB7XG4gICAgICBkZWZhdWx0OiAzMFxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBkZWZhdWx0OiAxNVxuICAgIH0sXG4gICAgdGlsZUNvbnRhaW5lcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGssIGwsIHJlZiwgcmVmMSwgdGlsZXMsIHgsIHk7XG4gICAgICAgIHRpbGVzID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICAgICAgZm9yICh4ID0gayA9IDAsIHJlZiA9IHRoaXMud2lkdGg7ICgwIDw9IHJlZiA/IGsgPD0gcmVmIDogayA+PSByZWYpOyB4ID0gMCA8PSByZWYgPyArK2sgOiAtLWspIHtcbiAgICAgICAgICBmb3IgKHkgPSBsID0gMCwgcmVmMSA9IHRoaXMuaGVpZ2h0OyAoMCA8PSByZWYxID8gbCA8PSByZWYxIDogbCA+PSByZWYxKTsgeSA9IDAgPD0gcmVmMSA/ICsrbCA6IC0tbCkge1xuICAgICAgICAgICAgdGlsZXMuYWRkVGlsZShuZXcgVGlsZSh4LCB5KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICAgIH1cbiAgICB9LFxuICAgIGZsb29yRmFjdG9yeToge1xuICAgICAgZGVmYXVsdDogZnVuY3Rpb24ob3B0KSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShvcHQueCwgb3B0LnkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgd2FsbEZhY3Rvcnk6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIGRvb3JGYWN0b3J5OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbG9vckZhY3Rvcnk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUm9vbUdlbmVyYXRvcjtcblxufSkuY2FsbCh0aGlzKTtcblxuUm9vbUdlbmVyYXRvci5Sb29tID0gY2xhc3MgUm9vbSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICB0aGlzLndhbGxzID0gW107XG4gICAgdGhpcy5kb29ycyA9IFtdO1xuICB9XG5cbiAgYWRkVGlsZSh0aWxlKSB7XG4gICAgdGhpcy50aWxlcy5wdXNoKHRpbGUpO1xuICAgIHJldHVybiB0aWxlLnJvb20gPSB0aGlzO1xuICB9XG5cbiAgY29udGFpbnNXYWxsKHRpbGUpIHtcbiAgICB2YXIgaywgbGVuLCByZWYsIHdhbGw7XG4gICAgcmVmID0gdGhpcy53YWxscztcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHdhbGwgPSByZWZba107XG4gICAgICBpZiAod2FsbC50aWxlID09PSB0aWxlKSB7XG4gICAgICAgIHJldHVybiB3YWxsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBhZGRXYWxsKHRpbGUsIG5leHRSb29tKSB7XG4gICAgdmFyIGV4aXN0aW5nO1xuICAgIGV4aXN0aW5nID0gdGhpcy5jb250YWluc1dhbGwodGlsZSk7XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmcubmV4dFJvb20gPSBuZXh0Um9vbTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMud2FsbHMucHVzaCh7XG4gICAgICAgIHRpbGU6IHRpbGUsXG4gICAgICAgIG5leHRSb29tOiBuZXh0Um9vbVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgd2FsbHNCeVJvb21zKCkge1xuICAgIHZhciBrLCBsZW4sIHBvcywgcmVmLCByZXMsIHJvb21zLCB3YWxsO1xuICAgIHJvb21zID0gW107XG4gICAgcmVzID0gW107XG4gICAgcmVmID0gdGhpcy53YWxscztcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHdhbGwgPSByZWZba107XG4gICAgICBwb3MgPSByb29tcy5pbmRleE9mKHdhbGwubmV4dFJvb20pO1xuICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgcG9zID0gcm9vbXMubGVuZ3RoO1xuICAgICAgICByb29tcy5wdXNoKHdhbGwubmV4dFJvb20pO1xuICAgICAgICByZXMucHVzaCh7XG4gICAgICAgICAgcm9vbTogd2FsbC5uZXh0Um9vbSxcbiAgICAgICAgICB0aWxlczogW11cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXNbcG9zXS50aWxlcy5wdXNoKHdhbGwudGlsZSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBhZGREb29yKHRpbGUsIG5leHRSb29tKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9vcnMucHVzaCh7XG4gICAgICB0aWxlOiB0aWxlLFxuICAgICAgbmV4dFJvb206IG5leHRSb29tXG4gICAgfSk7XG4gIH1cblxuICBkb29yc0ZvclJvb20ocm9vbSkge1xuICAgIHZhciBkb29yLCBrLCBsZW4sIHJlZiwgcmVzO1xuICAgIHJlcyA9IFtdO1xuICAgIHJlZiA9IHRoaXMuZG9vcnM7XG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBkb29yID0gcmVmW2tdO1xuICAgICAgaWYgKGRvb3IubmV4dFJvb20gPT09IHJvb20pIHtcbiAgICAgICAgcmVzLnB1c2goZG9vci50aWxlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Jvb21HZW5lcmF0b3IuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgU2hpcCwgVHJhdmVsLCBUcmF2ZWxBY3Rpb247XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVHJhdmVsID0gcmVxdWlyZSgnLi9UcmF2ZWwnKTtcblxuVHJhdmVsQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL1RyYXZlbEFjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXAgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFNoaXAgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICB0cmF2ZWxUbyhsb2NhdGlvbikge1xuICAgICAgdmFyIHRyYXZlbDtcbiAgICAgIHRyYXZlbCA9IG5ldyBUcmF2ZWwoe1xuICAgICAgICB0cmF2ZWxsZXI6IHRoaXMsXG4gICAgICAgIHN0YXJ0TG9jYXRpb246IHRoaXMubG9jYXRpb24sXG4gICAgICAgIHRhcmdldExvY2F0aW9uOiBsb2NhdGlvblxuICAgICAgfSk7XG4gICAgICBpZiAodHJhdmVsLnZhbGlkKSB7XG4gICAgICAgIHRyYXZlbC5zdGFydCgpO1xuICAgICAgICByZXR1cm4gdGhpcy50cmF2ZWwgPSB0cmF2ZWw7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgU2hpcC5wcm9wZXJ0aWVzKHtcbiAgICBsb2NhdGlvbjoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgdHJhdmVsOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBhdmFpbGFibGVBY3Rpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gbmV3IFRyYXZlbEFjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzcGFjZUNvb2RpbmF0ZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgZW5kWCwgZW5kWSwgcHJjLCBzdGFydFgsIHN0YXJ0WTtcbiAgICAgICAgaWYgKGludmFsaWRhdG9yLnByb3AoJ3RyYXZlbCcpKSB7XG4gICAgICAgICAgc3RhcnRYID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RyYXZlbC5zdGFydExvY2F0aW9uLngnKTtcbiAgICAgICAgICBzdGFydFkgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgndHJhdmVsLnN0YXJ0TG9jYXRpb24ueScpO1xuICAgICAgICAgIGVuZFggPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgndHJhdmVsLnRhcmdldExvY2F0aW9uLngnKTtcbiAgICAgICAgICBlbmRZID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RyYXZlbC50YXJnZXRMb2NhdGlvbi55Jyk7XG4gICAgICAgICAgcHJjID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RyYXZlbC5wYXRoVGltZW91dC5wcmMnKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogKHN0YXJ0WCAtIGVuZFgpICogcHJjICsgZW5kWCxcbiAgICAgICAgICAgIHk6IChzdGFydFkgLSBlbmRZKSAqIHByYyArIGVuZFlcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBpbnZhbGlkYXRvci5wcm9wUGF0aCgnbG9jYXRpb24ueCcpLFxuICAgICAgICAgICAgeTogaW52YWxpZGF0b3IucHJvcFBhdGgoJ2xvY2F0aW9uLnknKVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaGlwO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1NoaXAuanMubWFwXG4iLCJ2YXIgRGFtYWdlYWJsZSwgUHJvamVjdGlsZSwgU2hpcFdlYXBvbiwgVGlsZWQsIFRpbWluZztcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbkRhbWFnZWFibGUgPSByZXF1aXJlKCcuL0RhbWFnZWFibGUnKTtcblxuUHJvamVjdGlsZSA9IHJlcXVpcmUoJy4vUHJvamVjdGlsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXBXZWFwb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFNoaXBXZWFwb24gZXh0ZW5kcyBUaWxlZCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgdmFyIHByb2plY3RpbGU7XG4gICAgICBpZiAodGhpcy5jYW5GaXJlKSB7XG4gICAgICAgIHByb2plY3RpbGUgPSBuZXcgdGhpcy5wcm9qZWN0aWxlQ2xhc3Moe1xuICAgICAgICAgIG9yaWdpbjogdGhpcyxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICAgIGJsYXN0UmFuZ2U6IHRoaXMuYmxhc3RSYW5nZSxcbiAgICAgICAgICBwcm9wYWdhdGlvblR5cGU6IHRoaXMucHJvcGFnYXRpb25UeXBlLFxuICAgICAgICAgIHNwZWVkOiB0aGlzLnByb2plY3RpbGVTcGVlZCxcbiAgICAgICAgICB0aW1pbmc6IHRoaXMudGltaW5nXG4gICAgICAgIH0pO1xuICAgICAgICBwcm9qZWN0aWxlLmxhdW5jaCgpO1xuICAgICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZWNoYXJnZSgpO1xuICAgICAgICByZXR1cm4gcHJvamVjdGlsZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWNoYXJnZSgpIHtcbiAgICAgIHRoaXMuY2hhcmdpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJnaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlZCgpO1xuICAgICAgfSwgdGhpcy5yZWNoYXJnZVRpbWUpO1xuICAgIH1cblxuICAgIHJlY2hhcmdlZCgpIHtcbiAgICAgIHRoaXMuY2hhcmdlZCA9IHRydWU7XG4gICAgICBpZiAodGhpcy5hdXRvRmlyZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5maXJlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgU2hpcFdlYXBvbi5leHRlbmQoRGFtYWdlYWJsZSk7XG5cbiAgU2hpcFdlYXBvbi5wcm9wZXJ0aWVzKHtcbiAgICByZWNoYXJnZVRpbWU6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgYmxhc3RSYW5nZToge1xuICAgICAgZGVmYXVsdDogMVxuICAgIH0sXG4gICAgcHJvcGFnYXRpb25UeXBlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBwcm9qZWN0aWxlU3BlZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICB0YXJnZXQ6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5hdXRvRmlyZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZpcmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY2hhcmdlZDoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY2hhcmdpbmc6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGVuYWJsZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGF1dG9GaXJlOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBjcml0aWNhbEhlYWx0aDoge1xuICAgICAgZGVmYXVsdDogMC4zXG4gICAgfSxcbiAgICBjYW5GaXJlOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQgJiYgdGhpcy5lbmFibGVkICYmIHRoaXMuY2hhcmdlZCAmJiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoID49IHRoaXMuY3JpdGljYWxIZWFsdGg7XG4gICAgICB9XG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm9qZWN0aWxlQ2xhc3M6IHtcbiAgICAgIGRlZmF1bHQ6IFByb2plY3RpbGVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaGlwV2VhcG9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1NoaXBXZWFwb24uanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTWFwLCBTdGFyTWFwR2VuZXJhdG9yLCBTdGFyU3lzdGVtLCBzdGFyTmFtZXM7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTWFwID0gcmVxdWlyZSgnLi9NYXAnKTtcblxuU3RhclN5c3RlbSA9IHJlcXVpcmUoJy4vU3RhclN5c3RlbScpO1xuXG5zdGFyTmFtZXMgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXN0cmluZ3MnKS5zdGFyTmFtZXM7XG5cbm1vZHVsZS5leHBvcnRzID0gU3Rhck1hcEdlbmVyYXRvciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU3Rhck1hcEdlbmVyYXRvciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLm9wdCA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmT3B0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgIHRoaXMubWFwID0gbmV3IHRoaXMub3B0Lm1hcENsYXNzKCk7XG4gICAgICB0aGlzLnN0YXJzID0gdGhpcy5tYXAubG9jYXRpb25zLmNvcHkoKTtcbiAgICAgIHRoaXMubGlua3MgPSBbXTtcbiAgICAgIHRoaXMuY3JlYXRlU3RhcnModGhpcy5vcHQubmJTdGFycyk7XG4gICAgICB0aGlzLm1ha2VMaW5rcygpO1xuICAgICAgcmV0dXJuIHRoaXMubWFwO1xuICAgIH1cblxuICAgIGNyZWF0ZVN0YXJzKG5iKSB7XG4gICAgICB2YXIgaSwgaywgcmVmLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gayA9IDAsIHJlZiA9IG5iOyAoMCA8PSByZWYgPyBrIDwgcmVmIDogayA+IHJlZik7IGkgPSAwIDw9IHJlZiA/ICsrayA6IC0taykge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5jcmVhdGVTdGFyKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgY3JlYXRlU3RhcihvcHQgPSB7fSkge1xuICAgICAgdmFyIG5hbWUsIHBvcywgc3RhcjtcbiAgICAgIGlmICghKG9wdC54ICYmIG9wdC55KSkge1xuICAgICAgICBwb3MgPSB0aGlzLnJhbmRvbVN0YXJQb3MoKTtcbiAgICAgICAgaWYgKHBvcyAhPSBudWxsKSB7XG4gICAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0LCB7XG4gICAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICAgIHk6IHBvcy55XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghb3B0Lm5hbWUpIHtcbiAgICAgICAgbmFtZSA9IHRoaXMucmFuZG9tU3Rhck5hbWUoKTtcbiAgICAgICAgaWYgKG5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe30sIG9wdCwge1xuICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGFyID0gbmV3IHRoaXMub3B0LnN0YXJDbGFzcyhvcHQpO1xuICAgICAgdGhpcy5tYXAubG9jYXRpb25zLnB1c2goc3Rhcik7XG4gICAgICB0aGlzLnN0YXJzLnB1c2goc3Rhcik7XG4gICAgICByZXR1cm4gc3RhcjtcbiAgICB9XG5cbiAgICByYW5kb21TdGFyUG9zKCkge1xuICAgICAgdmFyIGosIHBvcztcbiAgICAgIGogPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgcG9zID0ge1xuICAgICAgICAgIHg6IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiAodGhpcy5vcHQubWF4WCAtIHRoaXMub3B0Lm1pblgpICsgdGhpcy5vcHQubWluWCksXG4gICAgICAgICAgeTogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhZIC0gdGhpcy5vcHQubWluWSkgKyB0aGlzLm9wdC5taW5ZKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIShqIDwgMTAgJiYgdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHN0YXIuZGlzdChwb3MueCwgcG9zLnkpIDw9IHRoaXMub3B0Lm1pblN0YXJEaXN0O1xuICAgICAgICB9KSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgICBpZiAoIShqID49IDEwKSkge1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJhbmRvbVN0YXJOYW1lKCkge1xuICAgICAgdmFyIG5hbWUsIHBvcywgcmVmO1xuICAgICAgaWYgKChyZWYgPSB0aGlzLm9wdC5zdGFyTmFtZXMpICE9IG51bGwgPyByZWYubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgIHBvcyA9IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiB0aGlzLm9wdC5zdGFyTmFtZXMubGVuZ3RoKTtcbiAgICAgICAgbmFtZSA9IHRoaXMub3B0LnN0YXJOYW1lc1twb3NdO1xuICAgICAgICB0aGlzLm9wdC5zdGFyTmFtZXMuc3BsaWNlKHBvcywgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VMaW5rcygpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJzLmZvckVhY2goKHN0YXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZUxpbmtzRnJvbShzdGFyKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VMaW5rc0Zyb20oc3Rhcikge1xuICAgICAgdmFyIGNsb3NlLCBjbG9zZXN0cywgbGluaywgbmVlZGVkLCByZXN1bHRzLCB0cmllcztcbiAgICAgIHRyaWVzID0gdGhpcy5vcHQubGlua1RyaWVzO1xuICAgICAgbmVlZGVkID0gdGhpcy5vcHQubGlua3NCeVN0YXJzIC0gc3Rhci5saW5rcy5jb3VudCgpO1xuICAgICAgaWYgKG5lZWRlZCA+IDApIHtcbiAgICAgICAgY2xvc2VzdHMgPSB0aGlzLnN0YXJzLmZpbHRlcigoc3RhcjIpID0+IHtcbiAgICAgICAgICByZXR1cm4gc3RhcjIgIT09IHN0YXIgJiYgIXN0YXIubGlua3MuZmluZFN0YXIoc3RhcjIpO1xuICAgICAgICB9KS5jbG9zZXN0cyhzdGFyLngsIHN0YXIueSk7XG4gICAgICAgIGlmIChjbG9zZXN0cy5jb3VudCgpID4gMCkge1xuICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY2xvc2UgPSBjbG9zZXN0cy5zaGlmdCgpO1xuICAgICAgICAgICAgbGluayA9IHRoaXMuY3JlYXRlTGluayhzdGFyLCBjbG9zZSk7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZUxpbmsobGluaykpIHtcbiAgICAgICAgICAgICAgdGhpcy5saW5rcy5wdXNoKGxpbmspO1xuICAgICAgICAgICAgICBzdGFyLmFkZExpbmsobGluayk7XG4gICAgICAgICAgICAgIG5lZWRlZCAtPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdHJpZXMgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghKG5lZWRlZCA+IDAgJiYgdHJpZXMgPiAwICYmIGNsb3Nlc3RzLmNvdW50KCkgPiAwKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUxpbmsoc3RhcjEsIHN0YXIyKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMub3B0LmxpbmtDbGFzcyhzdGFyMSwgc3RhcjIpO1xuICAgIH1cblxuICAgIHZhbGlkYXRlTGluayhsaW5rKSB7XG4gICAgICByZXR1cm4gIXRoaXMuc3RhcnMuZmluZCgoc3RhcikgPT4ge1xuICAgICAgICByZXR1cm4gc3RhciAhPT0gbGluay5zdGFyMSAmJiBzdGFyICE9PSBsaW5rLnN0YXIyICYmIGxpbmsuY2xvc2VUb1BvaW50KHN0YXIueCwgc3Rhci55LCB0aGlzLm9wdC5taW5MaW5rRGlzdCk7XG4gICAgICB9KSAmJiAhdGhpcy5saW5rcy5maW5kKChsaW5rMikgPT4ge1xuICAgICAgICByZXR1cm4gbGluazIuaW50ZXJzZWN0TGluayhsaW5rKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIFN0YXJNYXBHZW5lcmF0b3IucHJvdG90eXBlLmRlZk9wdCA9IHtcbiAgICBuYlN0YXJzOiAyMCxcbiAgICBtaW5YOiAwLFxuICAgIG1heFg6IDUwMCxcbiAgICBtaW5ZOiAwLFxuICAgIG1heFk6IDUwMCxcbiAgICBtaW5TdGFyRGlzdDogMjAsXG4gICAgbWluTGlua0Rpc3Q6IDIwLFxuICAgIGxpbmtzQnlTdGFyczogMyxcbiAgICBsaW5rVHJpZXM6IDMsXG4gICAgbWFwQ2xhc3M6IE1hcCxcbiAgICBzdGFyQ2xhc3M6IFN0YXJTeXN0ZW0sXG4gICAgbGlua0NsYXNzOiBTdGFyU3lzdGVtLkxpbmssXG4gICAgcm5nOiBNYXRoLnJhbmRvbSxcbiAgICBzdGFyTmFtZXM6IHN0YXJOYW1lc1xuICB9O1xuXG4gIHJldHVybiBTdGFyTWFwR2VuZXJhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1N0YXJNYXBHZW5lcmF0b3IuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgU3RhclN5c3RlbTtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJTeXN0ZW0gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFN0YXJTeXN0ZW0gZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICBzdXBlcihkYXRhKTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7fVxuXG4gICAgbGlua1RvKHN0YXIpIHtcbiAgICAgIGlmICghdGhpcy5saW5rcy5maW5kU3RhcihzdGFyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRMaW5rKG5ldyB0aGlzLmNvbnN0cnVjdG9yLkxpbmsodGhpcywgc3RhcikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZExpbmsobGluaykge1xuICAgICAgdGhpcy5saW5rcy5hZGQobGluayk7XG4gICAgICBsaW5rLm90aGVyU3Rhcih0aGlzKS5saW5rcy5hZGQobGluayk7XG4gICAgICByZXR1cm4gbGluaztcbiAgICB9XG5cbiAgICBkaXN0KHgsIHkpIHtcbiAgICAgIHZhciB4RGlzdCwgeURpc3Q7XG4gICAgICB4RGlzdCA9IHRoaXMueCAtIHg7XG4gICAgICB5RGlzdCA9IHRoaXMueSAtIHk7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KCh4RGlzdCAqIHhEaXN0KSArICh5RGlzdCAqIHlEaXN0KSk7XG4gICAgfVxuXG4gICAgaXNTZWxlY3RhYmxlQnkocGxheWVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgfTtcblxuICBTdGFyU3lzdGVtLnByb3BlcnRpZXMoe1xuICAgIHg6IHt9LFxuICAgIHk6IHt9LFxuICAgIG5hbWU6IHt9LFxuICAgIGxpbmtzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB7XG4gICAgICAgIGZpbmRTdGFyOiBmdW5jdGlvbihzdGFyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluZChmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgICByZXR1cm4gbGluay5zdGFyMiA9PT0gc3RhciB8fCBsaW5rLnN0YXIxID09PSBzdGFyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBTdGFyU3lzdGVtLmNvbGxlbmN0aW9uRm4gPSB7XG4gICAgY2xvc2VzdDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIG1pbiwgbWluRGlzdDtcbiAgICAgIG1pbiA9IG51bGw7XG4gICAgICBtaW5EaXN0ID0gbnVsbDtcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihzdGFyKSB7XG4gICAgICAgIHZhciBkaXN0O1xuICAgICAgICBkaXN0ID0gc3Rhci5kaXN0KHgsIHkpO1xuICAgICAgICBpZiAoKG1pbiA9PSBudWxsKSB8fCBtaW5EaXN0ID4gZGlzdCkge1xuICAgICAgICAgIG1pbiA9IHN0YXI7XG4gICAgICAgICAgcmV0dXJuIG1pbkRpc3QgPSBkaXN0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtaW47XG4gICAgfSxcbiAgICBjbG9zZXN0czogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIGRpc3RzO1xuICAgICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbihzdGFyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZGlzdDogc3Rhci5kaXN0KHgsIHkpLFxuICAgICAgICAgIHN0YXI6IHN0YXJcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgZGlzdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3Q7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLmNvcHkoZGlzdHMubWFwKGZ1bmN0aW9uKGRpc3QpIHtcbiAgICAgICAgcmV0dXJuIGRpc3Quc3RhcjtcbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YXJTeXN0ZW07XG5cbn0pLmNhbGwodGhpcyk7XG5cblN0YXJTeXN0ZW0uTGluayA9IGNsYXNzIExpbmsgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3Ioc3RhcjEsIHN0YXIyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXIxID0gc3RhcjE7XG4gICAgdGhpcy5zdGFyMiA9IHN0YXIyO1xuICB9XG5cbiAgcmVtb3ZlKCkge1xuICAgIHRoaXMuc3RhcjEubGlua3MucmVtb3ZlKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnN0YXIyLmxpbmtzLnJlbW92ZSh0aGlzKTtcbiAgfVxuXG4gIG90aGVyU3RhcihzdGFyKSB7XG4gICAgaWYgKHN0YXIgPT09IHRoaXMuc3RhcjEpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXIyO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFyMTtcbiAgICB9XG4gIH1cblxuICBnZXRMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcjEuZGlzdCh0aGlzLnN0YXIyLngsIHRoaXMuc3RhcjIueSk7XG4gIH1cblxuICBpbkJvdW5kYXJ5Qm94KHgsIHksIHBhZGRpbmcgPSAwKSB7XG4gICAgdmFyIHgxLCB4MiwgeTEsIHkyO1xuICAgIHgxID0gTWF0aC5taW4odGhpcy5zdGFyMS54LCB0aGlzLnN0YXIyLngpIC0gcGFkZGluZztcbiAgICB5MSA9IE1hdGgubWluKHRoaXMuc3RhcjEueSwgdGhpcy5zdGFyMi55KSAtIHBhZGRpbmc7XG4gICAgeDIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgKyBwYWRkaW5nO1xuICAgIHkyID0gTWF0aC5tYXgodGhpcy5zdGFyMS55LCB0aGlzLnN0YXIyLnkpICsgcGFkZGluZztcbiAgICByZXR1cm4geCA+PSB4MSAmJiB4IDw9IHgyICYmIHkgPj0geTEgJiYgeSA8PSB5MjtcbiAgfVxuXG4gIGNsb3NlVG9Qb2ludCh4LCB5LCBtaW5EaXN0KSB7XG4gICAgdmFyIGEsIGFiRGlzdCwgYWJjQW5nbGUsIGFieEFuZ2xlLCBhY0Rpc3QsIGFjeEFuZ2xlLCBiLCBjLCBjZERpc3QsIHhBYkRpc3QsIHhBY0Rpc3QsIHlBYkRpc3QsIHlBY0Rpc3Q7XG4gICAgaWYgKCF0aGlzLmluQm91bmRhcnlCb3goeCwgeSwgbWluRGlzdCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHRoaXMuc3RhcjE7XG4gICAgYiA9IHRoaXMuc3RhcjI7XG4gICAgYyA9IHtcbiAgICAgIFwieFwiOiB4LFxuICAgICAgXCJ5XCI6IHlcbiAgICB9O1xuICAgIHhBYkRpc3QgPSBiLnggLSBhLng7XG4gICAgeUFiRGlzdCA9IGIueSAtIGEueTtcbiAgICBhYkRpc3QgPSBNYXRoLnNxcnQoKHhBYkRpc3QgKiB4QWJEaXN0KSArICh5QWJEaXN0ICogeUFiRGlzdCkpO1xuICAgIGFieEFuZ2xlID0gTWF0aC5hdGFuKHlBYkRpc3QgLyB4QWJEaXN0KTtcbiAgICB4QWNEaXN0ID0gYy54IC0gYS54O1xuICAgIHlBY0Rpc3QgPSBjLnkgLSBhLnk7XG4gICAgYWNEaXN0ID0gTWF0aC5zcXJ0KCh4QWNEaXN0ICogeEFjRGlzdCkgKyAoeUFjRGlzdCAqIHlBY0Rpc3QpKTtcbiAgICBhY3hBbmdsZSA9IE1hdGguYXRhbih5QWNEaXN0IC8geEFjRGlzdCk7XG4gICAgYWJjQW5nbGUgPSBhYnhBbmdsZSAtIGFjeEFuZ2xlO1xuICAgIGNkRGlzdCA9IE1hdGguYWJzKE1hdGguc2luKGFiY0FuZ2xlKSAqIGFjRGlzdCk7XG4gICAgcmV0dXJuIGNkRGlzdCA8PSBtaW5EaXN0O1xuICB9XG5cbiAgaW50ZXJzZWN0TGluayhsaW5rKSB7XG4gICAgdmFyIHMsIHMxX3gsIHMxX3ksIHMyX3gsIHMyX3ksIHQsIHgxLCB4MiwgeDMsIHg0LCB5MSwgeTIsIHkzLCB5NDtcbiAgICB4MSA9IHRoaXMuc3RhcjEueDtcbiAgICB5MSA9IHRoaXMuc3RhcjEueTtcbiAgICB4MiA9IHRoaXMuc3RhcjIueDtcbiAgICB5MiA9IHRoaXMuc3RhcjIueTtcbiAgICB4MyA9IGxpbmsuc3RhcjEueDtcbiAgICB5MyA9IGxpbmsuc3RhcjEueTtcbiAgICB4NCA9IGxpbmsuc3RhcjIueDtcbiAgICB5NCA9IGxpbmsuc3RhcjIueTtcbiAgICBzMV94ID0geDIgLSB4MTtcbiAgICBzMV95ID0geTIgLSB5MTtcbiAgICBzMl94ID0geDQgLSB4MztcbiAgICBzMl95ID0geTQgLSB5MztcbiAgICBzID0gKC1zMV95ICogKHgxIC0geDMpICsgczFfeCAqICh5MSAtIHkzKSkgLyAoLXMyX3ggKiBzMV95ICsgczFfeCAqIHMyX3kpO1xuICAgIHQgPSAoczJfeCAqICh5MSAtIHkzKSAtIHMyX3kgKiAoeDEgLSB4MykpIC8gKC1zMl94ICogczFfeSArIHMxX3ggKiBzMl95KTtcbiAgICByZXR1cm4gcyA+IDAgJiYgcyA8IDEgJiYgdCA+IDAgJiYgdCA8IDE7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9TdGFyU3lzdGVtLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIFRpbWluZywgVHJhdmVsO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhdmVsID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUcmF2ZWwgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBzdGFydChsb2NhdGlvbikge1xuICAgICAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSB0aGlzO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudHJhdmVsbGVyLmxvY2F0aW9uID0gdGhpcy50YXJnZXRMb2NhdGlvbjtcbiAgICAgICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSBudWxsO1xuICAgICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKCdzdG9wIG1vdmluZycpO1xuICAgICAgICB9LCB0aGlzLmR1cmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBUcmF2ZWwucHJvcGVydGllcyh7XG4gICAgdHJhdmVsbGVyOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBzdGFydExvY2F0aW9uOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICB0YXJnZXRMb2NhdGlvbjoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgY3VycmVudFNlY3Rpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0TG9jYXRpb24ubGlua3MuZmluZFN0YXIodGhpcy50YXJnZXRMb2NhdGlvbik7XG4gICAgICB9XG4gICAgfSxcbiAgICBkdXJhdGlvbjoge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgbW92aW5nOiB7XG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgdmFsaWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWYsIHJlZjE7XG4gICAgICAgIGlmICh0aGlzLnRhcmdldExvY2F0aW9uID09PSB0aGlzLnN0YXJ0TG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCgoKHJlZiA9IHRoaXMudGFyZ2V0TG9jYXRpb24pICE9IG51bGwgPyByZWYubGlua3MgOiB2b2lkIDApICE9IG51bGwpICYmICgoKHJlZjEgPSB0aGlzLnN0YXJ0TG9jYXRpb24pICE9IG51bGwgPyByZWYxLmxpbmtzIDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uICE9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUcmF2ZWw7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVHJhdmVsLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIEdyaWQsIFZpZXc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuR3JpZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tZ3JpZHMnKS5HcmlkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXcgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFZpZXcgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBzZXREZWZhdWx0cygpIHtcbiAgICAgIHZhciByZWYsIHJlZjE7XG4gICAgICBpZiAoIXRoaXMuYm91bmRzKSB7XG4gICAgICAgIHRoaXMuZ3JpZCA9IHRoaXMuZ3JpZCB8fCAoKHJlZiA9IHRoaXMuZ2FtZS5fbWFpblZpZXcpICE9IG51bGwgPyAocmVmMSA9IHJlZi52YWx1ZSkgIT0gbnVsbCA/IHJlZjEuZ3JpZCA6IHZvaWQgMCA6IHZvaWQgMCkgfHwgbmV3IEdyaWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm91bmRzID0gdGhpcy5ncmlkLmFkZENlbGwoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2FtZSA9IG51bGw7XG4gICAgfVxuXG4gIH07XG5cbiAgVmlldy5wcm9wZXJ0aWVzKHtcbiAgICBnYW1lOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgICAgdGhpcy5nYW1lLnZpZXdzLmFkZCh0aGlzKTtcbiAgICAgICAgICB0aGlzLnNldERlZmF1bHRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9sZCkge1xuICAgICAgICAgIHJldHVybiBvbGQudmlld3MucmVtb3ZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB4OiB7XG4gICAgICBkZWZhdWx0OiAwXG4gICAgfSxcbiAgICB5OiB7XG4gICAgICBkZWZhdWx0OiAwXG4gICAgfSxcbiAgICBncmlkOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBib3VuZHM6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1ZpZXcuanMubWFwXG4iLCJ2YXIgRGlyZWN0aW9uLCBMaW5lT2ZTaWdodCwgVGlsZUNvbnRhaW5lciwgVGlsZVJlZmVyZW5jZSwgVmlzaW9uQ2FsY3VsYXRvcjtcblxuTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL0xpbmVPZlNpZ2h0Jyk7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cblRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lcjtcblxuVGlsZVJlZmVyZW5jZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlUmVmZXJlbmNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpc2lvbkNhbGN1bGF0b3IgPSBjbGFzcyBWaXNpb25DYWxjdWxhdG9yIHtcbiAgY29uc3RydWN0b3Iob3JpZ2luVGlsZSwgb2Zmc2V0ID0ge1xuICAgICAgeDogMC41LFxuICAgICAgeTogMC41XG4gICAgfSkge1xuICAgIHRoaXMub3JpZ2luVGlsZSA9IG9yaWdpblRpbGU7XG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgdGhpcy5wdHMgPSB7fTtcbiAgICB0aGlzLnZpc2liaWxpdHkgPSB7fTtcbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gIH1cblxuICBjYWxjdWwoKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoKSB7XG4gICAgICB0aGlzLnN0ZXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHZhciBmaXJzdEJhdGNoLCBpbml0aWFsUHRzO1xuICAgIHRoaXMucHRzID0ge307XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge307XG4gICAgaW5pdGlhbFB0cyA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMSxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMSxcbiAgICAgICAgeTogMVxuICAgICAgfVxuICAgIF07XG4gICAgaW5pdGlhbFB0cy5mb3JFYWNoKChwdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0UHQodGhpcy5vcmlnaW5UaWxlLnggKyBwdC54LCB0aGlzLm9yaWdpblRpbGUueSArIHB0LnksIHRydWUpO1xuICAgIH0pO1xuICAgIGZpcnN0QmF0Y2ggPSBbXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAtMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAxXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogMlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMixcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDIsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDIsXG4gICAgICAgIHk6IDFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDIsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAxLFxuICAgICAgICB5OiAtMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMSxcbiAgICAgICAgeTogMlxuICAgICAgfVxuICAgIF07XG4gICAgcmV0dXJuIHRoaXMuc3RhY2sgPSBmaXJzdEJhdGNoLm1hcCgocHQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCxcbiAgICAgICAgeTogdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2V0UHQoeCwgeSwgdmFsKSB7XG4gICAgdmFyIGFkamFuY2VudDtcbiAgICB0aGlzLnB0c1t4ICsgJzonICsgeV0gPSB2YWw7XG4gICAgYWRqYW5jZW50ID0gW1xuICAgICAge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAtMVxuICAgICAgfVxuICAgIF07XG4gICAgcmV0dXJuIGFkamFuY2VudC5mb3JFYWNoKChwdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmlzaWJpbGl0eSh4ICsgcHQueCwgeSArIHB0LnksIHZhbCA/IDEgLyBhZGphbmNlbnQubGVuZ3RoIDogMCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRQdCh4LCB5KSB7XG4gICAgcmV0dXJuIHRoaXMucHRzW3ggKyAnOicgKyB5XTtcbiAgfVxuXG4gIGFkZFZpc2liaWxpdHkoeCwgeSwgdmFsKSB7XG4gICAgaWYgKHRoaXMudmlzaWJpbGl0eVt4XSA9PSBudWxsKSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlbeF0gPSB7fTtcbiAgICB9XG4gICAgaWYgKHRoaXMudmlzaWJpbGl0eVt4XVt5XSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpYmlsaXR5W3hdW3ldICs9IHZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVt4XVt5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBnZXRWaXNpYmlsaXR5KHgsIHkpIHtcbiAgICBpZiAoKHRoaXMudmlzaWJpbGl0eVt4XSA9PSBudWxsKSB8fCAodGhpcy52aXNpYmlsaXR5W3hdW3ldID09IG51bGwpKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVt4XVt5XTtcbiAgICB9XG4gIH1cblxuICBjYW5Qcm9jZXNzKHgsIHkpIHtcbiAgICByZXR1cm4gIXRoaXMuc3RhY2suc29tZSgocHQpID0+IHtcbiAgICAgIHJldHVybiBwdC54ID09PSB4ICYmIHB0LnkgPT09IHk7XG4gICAgfSkgJiYgKHRoaXMuZ2V0UHQoeCwgeSkgPT0gbnVsbCk7XG4gIH1cblxuICBzdGVwKCkge1xuICAgIHZhciBsb3MsIHB0O1xuICAgIHB0ID0gdGhpcy5zdGFjay5zaGlmdCgpO1xuICAgIGxvcyA9IG5ldyBMaW5lT2ZTaWdodCh0aGlzLm9yaWdpblRpbGUuY29udGFpbmVyLCB0aGlzLm9yaWdpblRpbGUueCArIHRoaXMub2Zmc2V0LngsIHRoaXMub3JpZ2luVGlsZS55ICsgdGhpcy5vZmZzZXQueSwgcHQueCwgcHQueSk7XG4gICAgbG9zLnJldmVyc2VUcmFjaW5nKCk7XG4gICAgbG9zLnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSAodGlsZSwgZW50cnlYLCBlbnRyeVkpID0+IHtcbiAgICAgIGlmICh0aWxlICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0VmlzaWJpbGl0eSh0aWxlLngsIHRpbGUueSkgPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gbG9zLmZvcmNlU3VjY2VzcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aWxlLnRyYW5zcGFyZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnNldFB0KHB0LngsIHB0LnksIGxvcy5nZXRTdWNjZXNzKCkpO1xuICAgIGlmIChsb3MuZ2V0U3VjY2VzcygpKSB7XG4gICAgICByZXR1cm4gRGlyZWN0aW9uLmFsbC5mb3JFYWNoKChkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgdmFyIG5leHRQdDtcbiAgICAgICAgbmV4dFB0ID0ge1xuICAgICAgICAgIHg6IHB0LnggKyBkaXJlY3Rpb24ueCxcbiAgICAgICAgICB5OiBwdC55ICsgZGlyZWN0aW9uLnlcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuY2FuUHJvY2VzcyhuZXh0UHQueCwgbmV4dFB0LnkpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2sucHVzaChuZXh0UHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXRCb3VuZHMoKSB7XG4gICAgdmFyIGJvdW5kYXJpZXMsIGNvbCwgcmVmLCB2YWwsIHgsIHk7XG4gICAgYm91bmRhcmllcyA9IHtcbiAgICAgIHRvcDogbnVsbCxcbiAgICAgIGxlZnQ6IG51bGwsXG4gICAgICBib3R0b206IG51bGwsXG4gICAgICByaWdodDogbnVsbFxuICAgIH07XG4gICAgcmVmID0gdGhpcy52aXNpYmlsaXR5O1xuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XTtcbiAgICAgIGZvciAoeSBpbiBjb2wpIHtcbiAgICAgICAgdmFsID0gY29sW3ldO1xuICAgICAgICBpZiAoKGJvdW5kYXJpZXMudG9wID09IG51bGwpIHx8IHkgPCBib3VuZGFyaWVzLnRvcCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMudG9wID0geTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGJvdW5kYXJpZXMubGVmdCA9PSBudWxsKSB8fCB4IDwgYm91bmRhcmllcy5sZWZ0KSB7XG4gICAgICAgICAgYm91bmRhcmllcy5sZWZ0ID0geDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IHkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgICAgIGJvdW5kYXJpZXMuYm90dG9tID0geTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGJvdW5kYXJpZXMucmlnaHQgPT0gbnVsbCkgfHwgeCA+IGJvdW5kYXJpZXMucmlnaHQpIHtcbiAgICAgICAgICBib3VuZGFyaWVzLnJpZ2h0ID0geDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm91bmRhcmllcztcbiAgfVxuXG4gIHRvQ29udGFpbmVyKCkge1xuICAgIHZhciBjb2wsIHJlZiwgcmVzLCB0aWxlLCB2YWwsIHgsIHk7XG4gICAgcmVzID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICByZXMub3duZXIgPSBmYWxzZTtcbiAgICByZWYgPSB0aGlzLnZpc2liaWxpdHk7XG4gICAgZm9yICh4IGluIHJlZikge1xuICAgICAgY29sID0gcmVmW3hdO1xuICAgICAgZm9yICh5IGluIGNvbCkge1xuICAgICAgICB2YWwgPSBjb2xbeV07XG4gICAgICAgIHRpbGUgPSB0aGlzLm9yaWdpblRpbGUuY29udGFpbmVyLmdldFRpbGUoeCwgeSk7XG4gICAgICAgIGlmICh2YWwgIT09IDAgJiYgKHRpbGUgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aWxlID0gbmV3IFRpbGVSZWZlcmVuY2UodGlsZSk7XG4gICAgICAgICAgdGlsZS52aXNpYmlsaXR5ID0gdmFsO1xuICAgICAgICAgIHJlcy5hZGRUaWxlKHRpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICB0b01hcCgpIHtcbiAgICB2YXIgaSwgaiwgcmVmLCByZWYxLCByZWYyLCByZWYzLCByZXMsIHgsIHk7XG4gICAgcmVzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBtYXA6IFtdXG4gICAgfSwgdGhpcy5nZXRCb3VuZHMoKSk7XG4gICAgZm9yICh5ID0gaSA9IHJlZiA9IHJlcy50b3AsIHJlZjEgPSByZXMuYm90dG9tIC0gMTsgKHJlZiA8PSByZWYxID8gaSA8PSByZWYxIDogaSA+PSByZWYxKTsgeSA9IHJlZiA8PSByZWYxID8gKytpIDogLS1pKSB7XG4gICAgICByZXMubWFwW3kgLSByZXMudG9wXSA9IFtdO1xuICAgICAgZm9yICh4ID0gaiA9IHJlZjIgPSByZXMubGVmdCwgcmVmMyA9IHJlcy5yaWdodCAtIDE7IChyZWYyIDw9IHJlZjMgPyBqIDw9IHJlZjMgOiBqID49IHJlZjMpOyB4ID0gcmVmMiA8PSByZWYzID8gKytqIDogLS1qKSB7XG4gICAgICAgIHJlcy5tYXBbeSAtIHJlcy50b3BdW3ggLSByZXMubGVmdF0gPSB0aGlzLmdldFZpc2liaWxpdHkoeCwgeSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9WaXNpb25DYWxjdWxhdG9yLmpzLm1hcFxuIiwidmFyIEFjdGlvbiwgRWxlbWVudCwgRXZlbnRFbWl0dGVyO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBBY3Rpb24gZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHdpdGhBY3RvcihhY3Rvcikge1xuICAgICAgaWYgKHRoaXMuYWN0b3IgIT09IGFjdG9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHtcbiAgICAgICAgICBhY3RvcjogYWN0b3JcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5V2l0aChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGJhc2U6IHRoaXNcbiAgICAgIH0sIHRoaXMuZ2V0TWFudWFsRGF0YVByb3BlcnRpZXMoKSwgb3B0aW9ucykpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZSgpO1xuICAgIH1cblxuICAgIHZhbGlkQWN0b3IoKSB7XG4gICAgICByZXR1cm4gdGhpcy5hY3RvciAhPSBudWxsO1xuICAgIH1cblxuICAgIGlzUmVhZHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWxpZEFjdG9yKCk7XG4gICAgfVxuXG4gICAgZmluaXNoKCkge1xuICAgICAgdGhpcy50cmlnZ2VyKCdmaW5pc2hlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5kKCk7XG4gICAgfVxuXG4gICAgaW50ZXJydXB0KCkge1xuICAgICAgdGhpcy50cmlnZ2VyKCdpbnRlcnJ1cHRlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5kKCk7XG4gICAgfVxuXG4gICAgZW5kKCkge1xuICAgICAgdGhpcy50cmlnZ2VyKCdlbmQnKTtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgfTtcblxuICBBY3Rpb24uaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgYWN0b3I6IHt9XG4gIH0pO1xuXG4gIHJldHVybiBBY3Rpb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9BY3Rpb24uanMubWFwXG4iLCJ2YXIgQWN0aW9uUHJvdmlkZXIsIEVsZW1lbnQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpb25Qcm92aWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG4gIEFjdGlvblByb3ZpZGVyLnByb3BlcnRpZXMoe1xuICAgIHByb3ZpZGVkQWN0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEFjdGlvblByb3ZpZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXIuanMubWFwXG4iLCJ2YXIgQXR0YWNrQWN0aW9uLCBFdmVudEJpbmQsIFByb3BlcnR5V2F0Y2hlciwgVGFyZ2V0QWN0aW9uLCBXYWxrQWN0aW9uO1xuXG5XYWxrQWN0aW9uID0gcmVxdWlyZSgnLi9XYWxrQWN0aW9uJyk7XG5cblRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJyk7XG5cbkV2ZW50QmluZCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEJpbmQ7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5JbnZhbGlkYXRlZC5Qcm9wZXJ0eVdhdGNoZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNrQWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBBdHRhY2tBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICAgIHZhbGlkVGFyZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0SXNBdHRhY2thYmxlKCkgJiYgKHRoaXMuY2FuVXNlV2VhcG9uKCkgfHwgdGhpcy5jYW5XYWxrVG9UYXJnZXQoKSk7XG4gICAgfVxuXG4gICAgdGFyZ2V0SXNBdHRhY2thYmxlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmRhbWFnZWFibGUgJiYgdGhpcy50YXJnZXQuaGVhbHRoID49IDA7XG4gICAgfVxuXG4gICAgY2FuTWVsZWUoKSB7XG4gICAgICByZXR1cm4gTWF0aC5hYnModGhpcy50YXJnZXQudGlsZS54IC0gdGhpcy5hY3Rvci50aWxlLngpICsgTWF0aC5hYnModGhpcy50YXJnZXQudGlsZS55IC0gdGhpcy5hY3Rvci50aWxlLnkpID09PSAxO1xuICAgIH1cblxuICAgIGNhblVzZVdlYXBvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmJlc3RVc2FibGVXZWFwb24gIT0gbnVsbDtcbiAgICB9XG5cbiAgICBjYW5Vc2VXZWFwb25BdCh0aWxlKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgcmV0dXJuICgocmVmID0gdGhpcy5hY3Rvci53ZWFwb25zKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IHZvaWQgMCkgJiYgdGhpcy5hY3Rvci53ZWFwb25zLmZpbmQoKHdlYXBvbikgPT4ge1xuICAgICAgICByZXR1cm4gd2VhcG9uLmNhblVzZUZyb20odGlsZSwgdGhpcy50YXJnZXQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FuV2Fsa1RvVGFyZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5pc1JlYWR5KCk7XG4gICAgfVxuXG4gICAgdXNlV2VhcG9uKCkge1xuICAgICAgdGhpcy5iZXN0VXNhYmxlV2VhcG9uLnVzZU9uKHRoaXMudGFyZ2V0KTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaCgpO1xuICAgIH1cblxuICAgIGV4ZWN1dGUoKSB7XG4gICAgICBpZiAodGhpcy5hY3Rvci53YWxrICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hY3Rvci53YWxrLmludGVycnVwdCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYmVzdFVzYWJsZVdlYXBvbiAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24uY2hhcmdlZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnVzZVdlYXBvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLndlYXBvbkNoYXJnZVdhdGNoZXIuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhbGtBY3Rpb24ub24oJ2ZpbmlzaGVkJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLnVuYmluZCgpO1xuICAgICAgICAgIHRoaXMud2Fsa0FjdGlvbi5kZXN0cm95KCk7XG4gICAgICAgICAgdGhpcy5pbnZhbGlkYXRlV2Fsa0FjdGlvbigpO1xuICAgICAgICAgIGlmICh0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmludGVycnVwdEJpbmRlci5iaW5kVG8odGhpcy53YWxrQWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5leGVjdXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQXR0YWNrQWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIHdhbGtBY3Rpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB3YWxrQWN0aW9uO1xuICAgICAgICB3YWxrQWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgICAgIGFjdG9yOiB0aGlzLmFjdG9yLFxuICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxuICAgICAgICB9KTtcbiAgICAgICAgd2Fsa0FjdGlvbi5wYXRoRmluZGVyLmFycml2ZWRDYWxsYmFjayA9IChzdGVwKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2FuVXNlV2VhcG9uQXQoc3RlcC50aWxlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHdhbGtBY3Rpb247XG4gICAgICB9XG4gICAgfSxcbiAgICBiZXN0VXNhYmxlV2VhcG9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByZWYsIHVzYWJsZVdlYXBvbnM7XG4gICAgICAgIGludmFsaWRhdG9yLnByb3BQYXRoKCdhY3Rvci50aWxlJyk7XG4gICAgICAgIGlmICgocmVmID0gdGhpcy5hY3Rvci53ZWFwb25zKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IHZvaWQgMCkge1xuICAgICAgICAgIHVzYWJsZVdlYXBvbnMgPSB0aGlzLmFjdG9yLndlYXBvbnMuZmlsdGVyKCh3ZWFwb24pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB3ZWFwb24uY2FuVXNlT24odGhpcy50YXJnZXQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHVzYWJsZVdlYXBvbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGIuZHBzIC0gYS5kcHM7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHVzYWJsZVdlYXBvbnNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGludGVycnVwdEJpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEJpbmQoJ2ludGVycnVwdGVkJywgbnVsbCwgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiB0cnVlXG4gICAgfSxcbiAgICB3ZWFwb25DaGFyZ2VXYXRjaGVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24uY2hhcmdlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy51c2VXZWFwb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb3BlcnR5OiB0aGlzLmJlc3RVc2FibGVXZWFwb24uZ2V0UHJvcGVydHlJbnN0YW5jZSgnY2hhcmdlZCcpXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBdHRhY2tBY3Rpb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9BdHRhY2tBY3Rpb24uanMubWFwXG4iLCJ2YXIgQXR0YWNrQWN0aW9uLCBBdHRhY2tNb3ZlQWN0aW9uLCBFdmVudEJpbmQsIExpbmVPZlNpZ2h0LCBQYXRoRmluZGVyLCBQcm9wZXJ0eVdhdGNoZXIsIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vV2Fsa0FjdGlvbicpO1xuXG5BdHRhY2tBY3Rpb24gPSByZXF1aXJlKCcuL0F0dGFja0FjdGlvbicpO1xuXG5UYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpO1xuXG5QYXRoRmluZGVyID0gcmVxdWlyZSgncGFyYWxsZWxpby1wYXRoZmluZGVyJyk7XG5cbkxpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi4vTGluZU9mU2lnaHQnKTtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkludmFsaWRhdGVkLlByb3BlcnR5V2F0Y2hlcjtcblxuRXZlbnRCaW5kID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50QmluZDtcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2tNb3ZlQWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBBdHRhY2tNb3ZlQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgICBpc0VuZW15KGVsZW0pIHtcbiAgICAgIHZhciByZWY7XG4gICAgICByZXR1cm4gKHJlZiA9IHRoaXMuYWN0b3Iub3duZXIpICE9IG51bGwgPyB0eXBlb2YgcmVmLmlzRW5lbXkgPT09IFwiZnVuY3Rpb25cIiA/IHJlZi5pc0VuZW15KGVsZW0pIDogdm9pZCAwIDogdm9pZCAwO1xuICAgIH1cblxuICAgIHZhbGlkVGFyZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi52YWxpZFRhcmdldCgpO1xuICAgIH1cblxuICAgIHRlc3RFbmVteVNwb3R0ZWQoKSB7XG4gICAgICB0aGlzLmludmFsaWRhdGVFbmVteVNwb3R0ZWQoKTtcbiAgICAgIGlmICh0aGlzLmVuZW15U3BvdHRlZCkge1xuICAgICAgICB0aGlzLmF0dGFja0FjdGlvbiA9IG5ldyBBdHRhY2tBY3Rpb24oe1xuICAgICAgICAgIGFjdG9yOiB0aGlzLmFjdG9yLFxuICAgICAgICAgIHRhcmdldDogdGhpcy5lbmVteVNwb3R0ZWRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXR0YWNrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIuYmluZFRvKHRoaXMuYXR0YWNrQWN0aW9uKTtcbiAgICAgICAgdGhpcy53YWxrQWN0aW9uLmludGVycnVwdCgpO1xuICAgICAgICB0aGlzLmludmFsaWRhdGVXYWxrQWN0aW9uKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGFja0FjdGlvbi5leGVjdXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXhlY3V0ZSgpIHtcbiAgICAgIGlmICghdGhpcy50ZXN0RW5lbXlTcG90dGVkKCkpIHtcbiAgICAgICAgdGhpcy53YWxrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIuYmluZFRvKHRoaXMud2Fsa0FjdGlvbik7XG4gICAgICAgIHRoaXMudGlsZVdhdGNoZXIuYmluZCgpO1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrQWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBBdHRhY2tNb3ZlQWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIHdhbGtBY3Rpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB3YWxrQWN0aW9uO1xuICAgICAgICB3YWxrQWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgICAgIGFjdG9yOiB0aGlzLmFjdG9yLFxuICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHdhbGtBY3Rpb247XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmVteVNwb3R0ZWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHRoaXMucGF0aCA9IG5ldyBQYXRoRmluZGVyKHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZSwgZmFsc2UsIHtcbiAgICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZS50cmFuc3BhcmVudCAmJiAobmV3IExpbmVPZlNpZ2h0KHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZS54LCB0aGlzLmFjdG9yLnRpbGUueSwgdGlsZS54LCB0aWxlLnkpKS5nZXRTdWNjZXNzKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcnJpdmVkOiAoc3RlcCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAuZW5lbXkgPSBzdGVwLnRpbGUuY2hpbGRyZW4uZmluZCgoYykgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc0VuZW15KGMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlZmZpY2llbmN5OiAodGlsZSkgPT4ge31cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGF0aC5jYWxjdWwoKTtcbiAgICAgICAgcmV0dXJuIChyZWYgPSB0aGlzLnBhdGguc29sdXRpb24pICE9IG51bGwgPyByZWYuZW5lbXkgOiB2b2lkIDA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0aWxlV2F0Y2hlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZXN0RW5lbXlTcG90dGVkKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5hY3Rvci5nZXRQcm9wZXJ0eUluc3RhbmNlKCd0aWxlJylcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogdHJ1ZVxuICAgIH0sXG4gICAgaW50ZXJydXB0QmluZGVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IEV2ZW50QmluZCgnaW50ZXJydXB0ZWQnLCBudWxsLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBdHRhY2tNb3ZlQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbi5qcy5tYXBcbiIsInZhciBBY3Rpb25Qcm92aWRlciwgU2ltcGxlQWN0aW9uUHJvdmlkZXI7XG5cbkFjdGlvblByb3ZpZGVyID0gcmVxdWlyZSgnLi9BY3Rpb25Qcm92aWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZUFjdGlvblByb3ZpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTaW1wbGVBY3Rpb25Qcm92aWRlciBleHRlbmRzIEFjdGlvblByb3ZpZGVyIHt9O1xuXG4gIFNpbXBsZUFjdGlvblByb3ZpZGVyLnByb3BlcnRpZXMoe1xuICAgIHByb3ZpZGVkQWN0aW9uczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFjdGlvbnM7XG4gICAgICAgIGFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwgdGhpcy5jb25zdHJ1Y3Rvci5hY3Rpb25zO1xuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbnMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBhY3Rpb25zID0gT2JqZWN0LmtleXMoYWN0aW9ucykubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbnNba2V5XTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWN0aW9ucy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgYWN0aW9uKHtcbiAgICAgICAgICAgIHRhcmdldDogdGhpc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaW1wbGVBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1NpbXBsZUFjdGlvblByb3ZpZGVyLmpzLm1hcFxuIiwidmFyIEFjdGlvbiwgVGFyZ2V0QWN0aW9uO1xuXG5BY3Rpb24gPSByZXF1aXJlKCcuL0FjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhcmdldEFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGFyZ2V0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICB3aXRoVGFyZ2V0KHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0ICE9PSB0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weVdpdGgoe1xuICAgICAgICAgIHRhcmdldDogdGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FuVGFyZ2V0KHRhcmdldCkge1xuICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgaW5zdGFuY2UgPSB0aGlzLndpdGhUYXJnZXQodGFyZ2V0KTtcbiAgICAgIGlmIChpbnN0YW5jZS52YWxpZFRhcmdldCgpKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldCAhPSBudWxsO1xuICAgIH1cblxuICAgIGlzUmVhZHkoKSB7XG4gICAgICByZXR1cm4gc3VwZXIuaXNSZWFkeSgpICYmIHRoaXMudmFsaWRUYXJnZXQoKTtcbiAgICB9XG5cbiAgfTtcblxuICBUYXJnZXRBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgdGFyZ2V0OiB7fVxuICB9KTtcblxuICByZXR1cm4gVGFyZ2V0QWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvVGFyZ2V0QWN0aW9uLmpzLm1hcFxuIiwidmFyIEFjdGlvblByb3ZpZGVyLCBNaXhhYmxlLCBUaWxlZEFjdGlvblByb3ZpZGVyO1xuXG5BY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vQWN0aW9uUHJvdmlkZXInKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5NaXhhYmxlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVkQWN0aW9uUHJvdmlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVkQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBY3Rpb25Qcm92aWRlciB7XG4gICAgdmFsaWRBY3Rpb25UaWxlKHRpbGUpIHtcbiAgICAgIHJldHVybiB0aWxlICE9IG51bGw7XG4gICAgfVxuXG4gICAgcHJlcGFyZUFjdGlvblRpbGUodGlsZSkge1xuICAgICAgaWYgKCF0aWxlLmdldFByb3BlcnR5SW5zdGFuY2UoJ3Byb3ZpZGVkQWN0aW9ucycpKSB7XG4gICAgICAgIHJldHVybiBNaXhhYmxlLkV4dGVuc2lvbi5tYWtlKEFjdGlvblByb3ZpZGVyLnByb3RvdHlwZSwgdGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZWRBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCwgb3ZlcnJpZGVkKSB7XG4gICAgICAgIG92ZXJyaWRlZChvbGQpO1xuICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkZWRBY3Rpb25zO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWN0aW9uVGlsZXM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciBteVRpbGU7XG4gICAgICAgIG15VGlsZSA9IGludmFsaWRhdG9yLnByb3AoJ3RpbGUnKTtcbiAgICAgICAgaWYgKG15VGlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFjdGlvblRpbGVzQ29vcmQubWFwKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG15VGlsZS5nZXRSZWxhdGl2ZVRpbGUoY29vcmQueCwgY29vcmQueSk7XG4gICAgICAgICAgfSkuZmlsdGVyKCh0aWxlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZEFjdGlvblRpbGUodGlsZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBmb3J3YXJkZWRBY3Rpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB7XG4gICAgICAgIGNvbXBhcmU6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYS5hY3Rpb24gPT09IGIuYWN0aW9uICYmIGEubG9jYXRpb24gPT09IGIubG9jYXRpb247XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciBhY3Rpb25UaWxlcywgYWN0aW9ucztcbiAgICAgICAgYWN0aW9uVGlsZXMgPSBpbnZhbGlkYXRvci5wcm9wKCdhY3Rpb25UaWxlcycpO1xuICAgICAgICBhY3Rpb25zID0gaW52YWxpZGF0b3IucHJvcCgncHJvdmlkZWRBY3Rpb25zJyk7XG4gICAgICAgIHJldHVybiBhY3Rpb25UaWxlcy5yZWR1Y2UoKHJlcywgdGlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiByZXMuY29uY2F0KGFjdGlvbnMubWFwKGZ1bmN0aW9uKGFjdCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgYWN0aW9uOiBhY3QsXG4gICAgICAgICAgICAgIGxvY2F0aW9uOiB0aWxlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSwgW10pO1xuICAgICAgfSxcbiAgICAgIGl0ZW1BZGRlZDogZnVuY3Rpb24oZm9yd2FyZGVkKSB7XG4gICAgICAgIHRoaXMucHJlcGFyZUFjdGlvblRpbGUoZm9yd2FyZGVkLmxvY2F0aW9uKTtcbiAgICAgICAgcmV0dXJuIGZvcndhcmRlZC5sb2NhdGlvbi5wcm92aWRlZEFjdGlvbnMuYWRkKGZvcndhcmRlZC5hY3Rpb24pO1xuICAgICAgfSxcbiAgICAgIGl0ZW1SZW1vdmVkOiBmdW5jdGlvbihmb3J3YXJkZWQpIHtcbiAgICAgICAgcmV0dXJuIGZvcndhcmRlZC5sb2NhdGlvbi5wcm92aWRlZEFjdGlvbnMucmVtb3ZlKGZvcndhcmRlZC5hY3Rpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgVGlsZWRBY3Rpb25Qcm92aWRlci5wcm90b3R5cGUuYWN0aW9uVGlsZXNDb29yZCA9IFtcbiAgICB7XG4gICAgICB4OiAwLFxuICAgICAgeTogLTFcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6IC0xLFxuICAgICAgeTogMFxuICAgIH0sXG4gICAge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6ICsxLFxuICAgICAgeTogMFxuICAgIH0sXG4gICAge1xuICAgICAgeDogMCxcbiAgICAgIHk6ICsxXG4gICAgfVxuICBdO1xuXG4gIHJldHVybiBUaWxlZEFjdGlvblByb3ZpZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlci5qcy5tYXBcbiIsInZhciBUYXJnZXRBY3Rpb24sIFRyYXZlbCwgVHJhdmVsQWN0aW9uO1xuXG5UYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpO1xuXG5UcmF2ZWwgPSByZXF1aXJlKCcuLi9UcmF2ZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmF2ZWxBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRyYXZlbEFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgdmFsaWRUYXJnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZWwudmFsaWQ7XG4gICAgfVxuXG4gICAgZXhlY3V0ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYXZlbC5zdGFydCgpO1xuICAgIH1cblxuICB9O1xuXG4gIFRyYXZlbEFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB0cmF2ZWw6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHJhdmVsKHtcbiAgICAgICAgICB0cmF2ZWxsZXI6IHRoaXMuYWN0b3IsXG4gICAgICAgICAgc3RhcnRMb2NhdGlvbjogdGhpcy5hY3Rvci5sb2NhdGlvbixcbiAgICAgICAgICB0YXJnZXRMb2NhdGlvbjogdGhpcy50YXJnZXRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVHJhdmVsQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvVHJhdmVsQWN0aW9uLmpzLm1hcFxuIiwidmFyIFBhdGhGaW5kZXIsIFBhdGhXYWxrLCBUYXJnZXRBY3Rpb24sIFdhbGtBY3Rpb247XG5cblBhdGhGaW5kZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKTtcblxuUGF0aFdhbGsgPSByZXF1aXJlKCcuLi9QYXRoV2FsaycpO1xuXG5UYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdhbGtBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFdhbGtBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICAgIGV4ZWN1dGUoKSB7XG4gICAgICBpZiAodGhpcy5hY3Rvci53YWxrICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hY3Rvci53YWxrLmludGVycnVwdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy53YWxrID0gdGhpcy5hY3Rvci53YWxrID0gbmV3IFBhdGhXYWxrKHRoaXMuYWN0b3IsIHRoaXMucGF0aEZpbmRlcik7XG4gICAgICB0aGlzLmFjdG9yLndhbGsub24oJ2ZpbmlzaGVkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5maW5pc2goKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5hY3Rvci53YWxrLm9uKCdpbnRlcnJ1cHRlZCcsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLmFjdG9yLndhbGsuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgc3VwZXIuZGVzdHJveSgpO1xuICAgICAgaWYgKHRoaXMud2Fsaykge1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHRoaXMucGF0aEZpbmRlci5jYWxjdWwoKTtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhGaW5kZXIuc29sdXRpb24gIT0gbnVsbDtcbiAgICB9XG5cbiAgfTtcblxuICBXYWxrQWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIHBhdGhGaW5kZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUGF0aEZpbmRlcih0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUsIHRoaXMudGFyZ2V0LCB7XG4gICAgICAgICAgdmFsaWRUaWxlOiAodGlsZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFjdG9yLmNhbkdvT25UaWxlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0b3IuY2FuR29PblRpbGUodGlsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gdGlsZS53YWxrYWJsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFdhbGtBY3Rpb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9XYWxrQWN0aW9uLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQXV0b21hdGljRG9vclwiOiByZXF1aXJlKFwiLi9BdXRvbWF0aWNEb29yXCIpLFxuICBcIkNoYXJhY3RlclwiOiByZXF1aXJlKFwiLi9DaGFyYWN0ZXJcIiksXG4gIFwiQ2hhcmFjdGVyQUlcIjogcmVxdWlyZShcIi4vQ2hhcmFjdGVyQUlcIiksXG4gIFwiQ29uZnJvbnRhdGlvblwiOiByZXF1aXJlKFwiLi9Db25mcm9udGF0aW9uXCIpLFxuICBcIkRhbWFnZVByb3BhZ2F0aW9uXCI6IHJlcXVpcmUoXCIuL0RhbWFnZVByb3BhZ2F0aW9uXCIpLFxuICBcIkRhbWFnZWFibGVcIjogcmVxdWlyZShcIi4vRGFtYWdlYWJsZVwiKSxcbiAgXCJEb29yXCI6IHJlcXVpcmUoXCIuL0Rvb3JcIiksXG4gIFwiRWxlbWVudFwiOiByZXF1aXJlKFwiLi9FbGVtZW50XCIpLFxuICBcIkVuY29udGVyTWFuYWdlclwiOiByZXF1aXJlKFwiLi9FbmNvbnRlck1hbmFnZXJcIiksXG4gIFwiRmxvb3JcIjogcmVxdWlyZShcIi4vRmxvb3JcIiksXG4gIFwiR2FtZVwiOiByZXF1aXJlKFwiLi9HYW1lXCIpLFxuICBcIkludmVudG9yeVwiOiByZXF1aXJlKFwiLi9JbnZlbnRvcnlcIiksXG4gIFwiTGluZU9mU2lnaHRcIjogcmVxdWlyZShcIi4vTGluZU9mU2lnaHRcIiksXG4gIFwiTWFwXCI6IHJlcXVpcmUoXCIuL01hcFwiKSxcbiAgXCJPYnN0YWNsZVwiOiByZXF1aXJlKFwiLi9PYnN0YWNsZVwiKSxcbiAgXCJQYXRoV2Fsa1wiOiByZXF1aXJlKFwiLi9QYXRoV2Fsa1wiKSxcbiAgXCJQZXJzb25hbFdlYXBvblwiOiByZXF1aXJlKFwiLi9QZXJzb25hbFdlYXBvblwiKSxcbiAgXCJQbGF5ZXJcIjogcmVxdWlyZShcIi4vUGxheWVyXCIpLFxuICBcIlByb2plY3RpbGVcIjogcmVxdWlyZShcIi4vUHJvamVjdGlsZVwiKSxcbiAgXCJSZXNzb3VyY2VcIjogcmVxdWlyZShcIi4vUmVzc291cmNlXCIpLFxuICBcIlJlc3NvdXJjZVR5cGVcIjogcmVxdWlyZShcIi4vUmVzc291cmNlVHlwZVwiKSxcbiAgXCJSb29tR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1Jvb21HZW5lcmF0b3JcIiksXG4gIFwiU2hpcFwiOiByZXF1aXJlKFwiLi9TaGlwXCIpLFxuICBcIlNoaXBXZWFwb25cIjogcmVxdWlyZShcIi4vU2hpcFdlYXBvblwiKSxcbiAgXCJTdGFyTWFwR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1N0YXJNYXBHZW5lcmF0b3JcIiksXG4gIFwiU3RhclN5c3RlbVwiOiByZXF1aXJlKFwiLi9TdGFyU3lzdGVtXCIpLFxuICBcIlRyYXZlbFwiOiByZXF1aXJlKFwiLi9UcmF2ZWxcIiksXG4gIFwiVmlld1wiOiByZXF1aXJlKFwiLi9WaWV3XCIpLFxuICBcIlZpc2lvbkNhbGN1bGF0b3JcIjogcmVxdWlyZShcIi4vVmlzaW9uQ2FsY3VsYXRvclwiKSxcbiAgXCJhY3Rpb25zXCI6IHtcbiAgICBcIkFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0FjdGlvblwiKSxcbiAgICBcIkFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJBdHRhY2tBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BdHRhY2tBY3Rpb25cIiksXG4gICAgXCJBdHRhY2tNb3ZlQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvblwiKSxcbiAgICBcIlNpbXBsZUFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJUYXJnZXRBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UYXJnZXRBY3Rpb25cIiksXG4gICAgXCJUaWxlZEFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIlRyYXZlbEFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL1RyYXZlbEFjdGlvblwiKSxcbiAgICBcIldhbGtBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9XYWxrQWN0aW9uXCIpLFxuICB9LFxufSIsInZhciBsaWJzO1xuXG5saWJzID0gcmVxdWlyZSgnLi9saWJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgbGlicywge1xuICBncmlkczogcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLFxuICBQYXRoRmluZGVyOiByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKSxcbiAgc3RyaW5nczogcmVxdWlyZSgncGFyYWxsZWxpby1zdHJpbmdzJyksXG4gIHRpbGVzOiByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJyksXG4gIFRpbWluZzogcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKSxcbiAgd2lyaW5nOiByZXF1aXJlKCdwYXJhbGxlbGlvLXdpcmluZycpLFxuICBTcGFyazogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9wYXJhbGxlbGlvLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBHcmlkPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtHcmlkLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9R3JpZDt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkdyaWQ9R3JpZDt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLkdyaWQ9R3JpZDt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBFdmVudEVtaXR0ZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFdmVudEVtaXR0ZXJcIikgPyBkZXBlbmRlbmNpZXMuRXZlbnRFbWl0dGVyIDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcbnZhciBHcmlkQ2VsbCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkdyaWRDZWxsXCIpID8gZGVwZW5kZW5jaWVzLkdyaWRDZWxsIDogcmVxdWlyZSgnLi9HcmlkQ2VsbCcpO1xudmFyIEdyaWRSb3cgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJHcmlkUm93XCIpID8gZGVwZW5kZW5jaWVzLkdyaWRSb3cgOiByZXF1aXJlKCcuL0dyaWRSb3cnKTtcbnZhciBHcmlkO1xuR3JpZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIHZhciByb3csIHNwb3Q7XG4gICAgICBpZiAoIWNlbGwpIHtcbiAgICAgICAgY2VsbCA9IG5ldyBHcmlkQ2VsbCgpO1xuICAgICAgfVxuICAgICAgc3BvdCA9IHRoaXMuZ2V0RnJlZVNwb3QoKTtcbiAgICAgIHJvdyA9IHRoaXMucm93cy5nZXQoc3BvdC5yb3cpO1xuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcm93ID0gdGhpcy5hZGRSb3coKTtcbiAgICAgIH1cbiAgICAgIHJvdy5hZGRDZWxsKGNlbGwpO1xuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuXG4gICAgYWRkUm93KHJvdyA9IG51bGwpIHtcbiAgICAgIGlmICghcm93KSB7XG4gICAgICAgIHJvdyA9IG5ldyBHcmlkUm93KCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJvd3MucHVzaChyb3cpO1xuICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBnZXRGcmVlU3BvdCgpIHtcbiAgICAgIHZhciBzcG90O1xuICAgICAgc3BvdCA9IG51bGw7XG4gICAgICB0aGlzLnJvd3Muc29tZSgocm93KSA9PiB7XG4gICAgICAgIGlmIChyb3cuY2VsbHMubGVuZ3RoIDwgdGhpcy5tYXhDb2x1bW5zKSB7XG4gICAgICAgICAgcmV0dXJuIHNwb3QgPSB7XG4gICAgICAgICAgICByb3c6IHJvdy5yb3dQb3NpdGlvbixcbiAgICAgICAgICAgIGNvbHVtbjogcm93LmNlbGxzLmxlbmd0aFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFzcG90KSB7XG4gICAgICAgIGlmICh0aGlzLm1heENvbHVtbnMgPiB0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogdGhpcy5yb3dzLmxlbmd0aCxcbiAgICAgICAgICAgIGNvbHVtbjogMFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogMCxcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5tYXhDb2x1bW5zICsgMVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzcG90O1xuICAgIH1cblxuICB9O1xuXG4gIEdyaWQuZXh0ZW5kKEV2ZW50RW1pdHRlcik7XG5cbiAgR3JpZC5wcm9wZXJ0aWVzKHtcbiAgICByb3dzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIHJvdy5ncmlkID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIGlmIChyb3cuZ3JpZCA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiByb3cuZ3JpZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1heENvbHVtbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHJvd3M7XG4gICAgICAgIHJvd3MgPSBpbnZhbGlkYXRvci5wcm9wKCdyb3dzJyk7XG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZShmdW5jdGlvbihtYXgsIHJvdykge1xuICAgICAgICAgIHJldHVybiBNYXRoLm1heChtYXgsIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgcm93KS5sZW5ndGgpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oR3JpZCk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBHcmlkQ2VsbD1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7R3JpZENlbGwuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1HcmlkQ2VsbDt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkdyaWRDZWxsPUdyaWRDZWxsO31lbHNle2lmKHRoaXMuUGFyYWxsZWxpbz09bnVsbCl7dGhpcy5QYXJhbGxlbGlvPXt9O310aGlzLlBhcmFsbGVsaW8uR3JpZENlbGw9R3JpZENlbGw7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgRXZlbnRFbWl0dGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRFbWl0dGVyXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50RW1pdHRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG52YXIgR3JpZENlbGw7XG5HcmlkQ2VsbCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZENlbGwgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG4gIEdyaWRDZWxsLmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIEdyaWRDZWxsLnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2dyaWQnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByb3c6IHt9LFxuICAgIGNvbHVtblBvc2l0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByb3c7XG4gICAgICAgIHJvdyA9IGludmFsaWRhdG9yLnByb3AoJ3JvdycpO1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgcm93KS5pbmRleE9mKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB3aWR0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gMSAvIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxlZnQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3dpZHRoJykgKiBpbnZhbGlkYXRvci5wcm9wKCdjb2x1bW5Qb3NpdGlvbicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3dpZHRoJykgKiAoaW52YWxpZGF0b3IucHJvcCgnY29sdW1uUG9zaXRpb24nKSArIDEpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdoZWlnaHQnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3A6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3RvcCcsIGludmFsaWRhdG9yLnByb3AoJ3JvdycpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnYm90dG9tJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWRDZWxsO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oR3JpZENlbGwpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgR3JpZFJvdz1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7R3JpZFJvdy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUdyaWRSb3c7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5HcmlkUm93PUdyaWRSb3c7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5HcmlkUm93PUdyaWRSb3c7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgRXZlbnRFbWl0dGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRFbWl0dGVyXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50RW1pdHRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG52YXIgR3JpZENlbGwgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJHcmlkQ2VsbFwiKSA/IGRlcGVuZGVuY2llcy5HcmlkQ2VsbCA6IHJlcXVpcmUoJy4vR3JpZENlbGwnKTtcbnZhciBHcmlkUm93O1xuR3JpZFJvdyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZFJvdyBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIGlmICghY2VsbCkge1xuICAgICAgICBjZWxsID0gbmV3IEdyaWRDZWxsKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG5cbiAgfTtcblxuICBHcmlkUm93LmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIEdyaWRSb3cucHJvcGVydGllcyh7XG4gICAgZ3JpZDoge30sXG4gICAgY2VsbHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgcmV0dXJuIGNlbGwucm93ID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24oY2VsbCkge1xuICAgICAgICBpZiAoY2VsbC5yb3cgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gY2VsbC5yb3cgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByb3dQb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgZ3JpZDtcbiAgICAgICAgZ3JpZCA9IGludmFsaWRhdG9yLnByb3AoJ2dyaWQnKTtcbiAgICAgICAgaWYgKGdyaWQpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgncm93cycsIGdyaWQpLmluZGV4T2YodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gMSAvIGludmFsaWRhdG9yLnByb3AoJ3Jvd3MnLCBpbnZhbGlkYXRvci5wcm9wKCdncmlkJykpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvcDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnaGVpZ2h0JykgKiBpbnZhbGlkYXRvci5wcm9wKCdyb3dQb3NpdGlvbicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYm90dG9tOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdoZWlnaHQnKSAqIChpbnZhbGlkYXRvci5wcm9wKCdyb3dQb3NpdGlvbicpICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZFJvdztcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKEdyaWRSb3cpO30pOyIsImlmKG1vZHVsZSl7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEdyaWQ6IHJlcXVpcmUoJy4vR3JpZC5qcycpLFxuICAgIEdyaWRDZWxsOiByZXF1aXJlKCcuL0dyaWRDZWxsLmpzJyksXG4gICAgR3JpZFJvdzogcmVxdWlyZSgnLi9HcmlkUm93LmpzJylcbiAgfTtcbn0iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIG5leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy9icm93c2VyLmpzJykubmV4dFRpY2s7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaW1tZWRpYXRlSWRzID0ge307XG52YXIgbmV4dEltbWVkaWF0ZUlkID0gMDtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHsgdGltZW91dC5jbG9zZSgpOyB9O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIFRoYXQncyBub3QgaG93IG5vZGUuanMgaW1wbGVtZW50cyBpdCBidXQgdGhlIGV4cG9zZWQgYXBpIGlzIHRoZSBzYW1lLlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBmdW5jdGlvbihmbikge1xuICB2YXIgaWQgPSBuZXh0SW1tZWRpYXRlSWQrKztcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGZhbHNlIDogc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGltbWVkaWF0ZUlkc1tpZF0gPSB0cnVlO1xuXG4gIG5leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKSB7XG4gICAgaWYgKGltbWVkaWF0ZUlkc1tpZF0pIHtcbiAgICAgIC8vIGZuLmNhbGwoKSBpcyBmYXN0ZXIgc28gd2Ugb3B0aW1pemUgZm9yIHRoZSBjb21tb24gdXNlLWNhc2VcbiAgICAgIC8vIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vY2FsbC1hcHBseS1zZWd1XG4gICAgICBpZiAoYXJncykge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBQcmV2ZW50IGlkcyBmcm9tIGxlYWtpbmdcbiAgICAgIGV4cG9ydHMuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IHR5cGVvZiBjbGVhckltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xlYXJJbW1lZGlhdGUgOiBmdW5jdGlvbihpZCkge1xuICBkZWxldGUgaW1tZWRpYXRlSWRzW2lkXTtcbn07IiwidmFyIEJpbmRlciwgUmVmZXJyZWQ7XG5cblJlZmVycmVkID0gcmVxdWlyZSgnLi9SZWZlcnJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJpbmRlciA9IGNsYXNzIEJpbmRlciBleHRlbmRzIFJlZmVycmVkIHtcbiAgdG9nZ2xlQmluZCh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnVuYmluZCgpO1xuICAgIH1cbiAgfVxuXG4gIGJpbmQoKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb0JpbmQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGNhbkJpbmQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmNhbGxiYWNrICE9IG51bGwpICYmICh0aGlzLnRhcmdldCAhPSBudWxsKTtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGRvVW5iaW5kKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBlcXVhbHMoYmluZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQoYmluZGVyKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgcmV0dXJuIHRoaXMudW5iaW5kKCk7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9CaW5kZXIuanMubWFwXG4iLCJ2YXIgQ29sbGVjdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb2xsZWN0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihhcnIpIHtcbiAgICAgIGlmIChhcnIgIT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnIudG9BcnJheSgpO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hhbmdlZCgpIHt9XG5cbiAgICBjaGVja0NoYW5nZXMob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgaWYgKGNvbXBhcmVGdW5jdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2xkID0gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jb3VudCgpICE9PSBvbGQubGVuZ3RoIHx8IChvcmRlcmVkID8gdGhpcy5zb21lKGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgICAgICByZXR1cm4gIWNvbXBhcmVGdW5jdGlvbihvbGQuZ2V0KGkpLCB2YWwpO1xuICAgICAgfSkgOiB0aGlzLnNvbWUoZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbihiKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVGdW5jdGlvbihhLCBiKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgZ2V0KGkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheVtpXTtcbiAgICB9XG5cbiAgICBnZXRSYW5kb20oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV07XG4gICAgfVxuXG4gICAgc2V0KGksIHZhbCkge1xuICAgICAgdmFyIG9sZDtcbiAgICAgIGlmICh0aGlzLl9hcnJheVtpXSAhPT0gdmFsKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbDtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIGFkZCh2YWwpIHtcbiAgICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKHZhbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlKHZhbCkge1xuICAgICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwbHVjayhmbikge1xuICAgICAgdmFyIGZvdW5kLCBpbmRleCwgb2xkO1xuICAgICAgaW5kZXggPSB0aGlzLl9hcnJheS5maW5kSW5kZXgoZm4pO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdO1xuICAgICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdG9BcnJheSgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xuICAgIH1cblxuICAgIGNvdW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBzdGF0aWMgbmV3U3ViQ2xhc3MoZm4sIGFycikge1xuICAgICAgdmFyIFN1YkNsYXNzO1xuICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgU3ViQ2xhc3MgPSBjbGFzcyBleHRlbmRzIHRoaXMge307XG4gICAgICAgIE9iamVjdC5hc3NpZ24oU3ViQ2xhc3MucHJvdG90eXBlLCBmbik7XG4gICAgICAgIHJldHVybiBuZXcgU3ViQ2xhc3MoYXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhhcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvcHkoYXJyKSB7XG4gICAgICB2YXIgY29sbDtcbiAgICAgIGlmIChhcnIgPT0gbnVsbCkge1xuICAgICAgICBhcnIgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIH1cbiAgICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpO1xuICAgICAgcmV0dXJuIGNvbGw7XG4gICAgfVxuXG4gICAgZXF1YWxzKGFycikge1xuICAgICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuIGFycltpXSA9PT0gdmFsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0QWRkZWRGcm9tKGFycikge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiAhYXJyLmluY2x1ZGVzKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UmVtb3ZlZEZyb20oYXJyKSB7XG4gICAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuaW5jbHVkZXMoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBDb2xsZWN0aW9uLnJlYWRGdW5jdGlvbnMgPSBbJ2V2ZXJ5JywgJ2ZpbmQnLCAnZmluZEluZGV4JywgJ2ZvckVhY2gnLCAnaW5jbHVkZXMnLCAnaW5kZXhPZicsICdqb2luJywgJ2xhc3RJbmRleE9mJywgJ21hcCcsICdyZWR1Y2UnLCAncmVkdWNlUmlnaHQnLCAnc29tZScsICd0b1N0cmluZyddO1xuXG4gIENvbGxlY3Rpb24ucmVhZExpc3RGdW5jdGlvbnMgPSBbJ2NvbmNhdCcsICdmaWx0ZXInLCAnc2xpY2UnXTtcblxuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXTtcblxuICBDb2xsZWN0aW9uLnJlYWRGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbihmdW5jdCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKTtcbiAgICB9O1xuICB9KTtcblxuICBDb2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpKTtcbiAgICB9O1xuICB9KTtcblxuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICB2YXIgb2xkLCByZXM7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHJlcyA9IHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuXG4gIHJldHVybiBDb2xsZWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKTtcbiAgfVxufSk7XG5cbmlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IHZvaWQgMCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Db2xsZWN0aW9uLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIE1peGFibGUsIFByb3BlcnR5O1xuXG5Qcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHknKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQgPSBjbGFzcyBFbGVtZW50IGV4dGVuZHMgTWl4YWJsZSB7XG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiAodGhpcy5zZXRQcm9wZXJ0aWVzICE9IG51bGwpKSB7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMoZGF0YSk7XG4gICAgfVxuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgdGFwKG5hbWUpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG5hbWUuYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2FsbGJhY2sobmFtZSkge1xuICAgIGlmICh0aGlzLl9jYWxsYmFja3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLl9jYWxsYmFja3NbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdLm93bmVyID0gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tuYW1lXTtcbiAgfVxuXG4gIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gWydfcHJvcGVydGllcyddLmNvbmNhdCh0aGlzLl9wcm9wZXJ0aWVzLm1hcChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHJldHVybiBwcm9wLm5hbWU7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICB2YXIgaSwgbGVuLCBvcHRpb25zLCBwcm9wZXJ0eSwgcmVmLCByZXN1bHRzO1xuICAgIGlmICh0aGlzLl9wcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgIHJlZiA9IHRoaXMuX3Byb3BlcnRpZXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcHJvcGVydHkgPSByZWZbaV07XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0eS5vcHRpb25zKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKChuZXcgUHJvcGVydHkocHJvcGVydHkubmFtZSwgb3B0aW9ucykpLmJpbmQodGFyZ2V0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgcHJvcGVydHkocHJvcCwgZGVzYykge1xuICAgIHJldHVybiAobmV3IFByb3BlcnR5KHByb3AsIGRlc2MpKS5iaW5kKHRoaXMucHJvdG90eXBlKTtcbiAgfVxuXG4gIHN0YXRpYyBwcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICB2YXIgZGVzYywgcHJvcCwgcmVzdWx0cztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChwcm9wIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGRlc2MgPSBwcm9wZXJ0aWVzW3Byb3BdO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucHJvcGVydHkocHJvcCwgZGVzYykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0VsZW1lbnQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBFdmVudEJpbmQ7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4vQmluZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRCaW5kID0gY2xhc3MgRXZlbnRCaW5kIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50MTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDE7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9XG5cbiAgZ2V0UmVmKCkge1xuICAgIHJldHVybiB7XG4gICAgICBldmVudDogdGhpcy5ldmVudCxcbiAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgIH07XG4gIH1cblxuICBiaW5kVG8odGFyZ2V0KSB7XG4gICAgdGhpcy51bmJpbmQoKTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzKGV2ZW50QmluZCkge1xuICAgIHJldHVybiBzdXBlci5lcXVhbHMoZXZlbnRCaW5kKSAmJiBldmVudEJpbmQuZXZlbnQgPT09IHRoaXMuZXZlbnQ7XG4gIH1cblxuICBtYXRjaChldmVudCwgdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50ID09PSB0aGlzLmV2ZW50ICYmIHRhcmdldCA9PT0gdGhpcy50YXJnZXQ7XG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xuICAgIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEJpbmQuanMubWFwXG4iLCJ2YXIgRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRXZlbnRFbWl0dGVyIHtcbiAgICBnZXRBbGxFdmVudHMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgfVxuXG4gICAgZ2V0TGlzdGVuZXJzKGUpIHtcbiAgICAgIHZhciBldmVudHM7XG4gICAgICBldmVudHMgPSB0aGlzLmdldEFsbEV2ZW50cygpO1xuICAgICAgcmV0dXJuIGV2ZW50c1tlXSB8fCAoZXZlbnRzW2VdID0gW10pO1xuICAgIH1cblxuICAgIGhhc0xpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRMaXN0ZW5lcnMoZSkuaW5jbHVkZXMobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIGFkZExpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzTGlzdGVuZXIoZSwgbGlzdGVuZXIpKSB7XG4gICAgICAgIHRoaXMuZ2V0TGlzdGVuZXJzKGUpLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKSB7fVxuXG4gICAgcmVtb3ZlTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBpbmRleCwgbGlzdGVuZXJzO1xuICAgICAgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnMoZSk7XG4gICAgICBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyUmVtb3ZlZChlLCBsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGlzdGVuZXJSZW1vdmVkKGUsIGxpc3RlbmVyKSB7fVxuXG4gICAgZW1pdEV2ZW50KGUsIC4uLmFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKS5zbGljZSgpO1xuICAgICAgcmV0dXJuIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lciguLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUFsbExpc3RlbmVycygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICB9XG5cbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5cbiAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEVtaXR0ZXIuanMubWFwXG4iLCJ2YXIgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLCBJbnZhbGlkYXRvciwgUHJvcGVydHlXYXRjaGVyO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5V2F0Y2hlcicpO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgUHJvcGVydHlXYXRjaGVyIHtcbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZSA9IG9wdGlvbnMuYWN0aXZlO1xuICB9XG5cbiAgc2hvdWxkQmluZCgpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGlmICh0aGlzLmFjdGl2ZSAhPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IuY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICAgIGFjdGl2ZSA9IHRoaXMuYWN0aXZlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcy5tYXBcbiIsInZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBQcm9wZXJ0eVdhdGNoZXI7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4vUHJvcGVydHlXYXRjaGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5vbkFkZGVkID0gb3B0aW9ucy5vbkFkZGVkO1xuICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZCA9IG9wdGlvbnMub25SZW1vdmVkO1xuICB9XG5cbiAgaGFuZGxlQ2hhbmdlKHZhbHVlLCBvbGQpIHtcbiAgICBvbGQgPSB2YWx1ZS5jb3B5KG9sZCB8fCBbXSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgb2xkKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCFvbGQuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vbkFkZGVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb2xkLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZC5jYWxsKHRoaXMuc2NvcGUsIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9JbnZhbGlkYXRlZC9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIEludmFsaWRhdGVkLCBJbnZhbGlkYXRvcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkID0gY2xhc3MgSW52YWxpZGF0ZWQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKCEoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuaW5pdEJ5TG9hZGVyIDogdm9pZCAwKSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVua25vd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMuc2NvcGUpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICB0aGlzLmhhbmRsZVVwZGF0ZSh0aGlzLmludmFsaWRhdG9yKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGhhbmRsZVVwZGF0ZShpbnZhbGlkYXRvcikge1xuICAgIGlmICh0aGlzLnNjb3BlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgaW52YWxpZGF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhpbnZhbGlkYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBQcm9wZXJ0eVdhdGNoZXI7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4uL0JpbmRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIFByb3BlcnR5V2F0Y2hlciBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMxKSB7XG4gICAgdmFyIHJlZjtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMxO1xuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH07XG4gICAgdGhpcy51cGRhdGVDYWxsYmFjayA9IChvbGQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZShvbGQpO1xuICAgIH07XG4gICAgaWYgKHRoaXMub3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgfVxuICAgIGlmICghKCgocmVmID0gdGhpcy5vcHRpb25zKSAhPSBudWxsID8gcmVmLmluaXRCeUxvYWRlciA6IHZvaWQgMCkgJiYgKHRoaXMub3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgdGhpcy5wcm9wZXJ0eSA9IG9wdGlvbnMucHJvcGVydHk7XG4gICAgdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgcmV0dXJuIHRoaXMuYXV0b0JpbmQgPSBvcHRpb25zLmF1dG9CaW5kO1xuICB9XG5cbiAgY29weVdpdGgob3B0KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3RvcihPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdCkpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5hdXRvQmluZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvcGVydHkoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gdGhpcy5zY29wZS5nZXRQcm9wZXJ0eUluc3RhbmNlKHRoaXMucHJvcGVydHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eTtcbiAgfVxuXG4gIGNoZWNrQmluZCgpIHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGVCaW5kKHRoaXMuc2hvdWxkQmluZCgpKTtcbiAgfVxuXG4gIHNob3VsZEJpbmQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjYW5CaW5kKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkgIT0gbnVsbDtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5vbignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5vbigndXBkYXRlZCcsIHRoaXMudXBkYXRlQ2FsbGJhY2spO1xuICB9XG5cbiAgZG9VbmJpbmQoKSB7XG4gICAgdGhpcy5nZXRQcm9wZXJ0eSgpLm9mZignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5vZmYoJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldFJlZigpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3BlcnR5LFxuICAgICAgICB0YXJnZXQ6IHRoaXMuc2NvcGUsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wZXJ0eS5wcm9wZXJ0eS5uYW1lLFxuICAgICAgICB0YXJnZXQ6IHRoaXMucHJvcGVydHkub2JqLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KCk7XG4gIH1cblxuICB1cGRhdGUob2xkKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIHZhbHVlID0gdGhpcy5nZXRQcm9wZXJ0eSgpLmdldCgpO1xuICAgIHJldHVybiB0aGlzLmhhbmRsZUNoYW5nZSh2YWx1ZSwgb2xkKTtcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZSh2YWx1ZSwgb2xkKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCBvbGQpO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIEJpbmRlciwgRXZlbnRCaW5kLCBJbnZhbGlkYXRvciwgcGx1Y2s7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4vQmluZGVyJyk7XG5cbkV2ZW50QmluZCA9IHJlcXVpcmUoJy4vRXZlbnRCaW5kJyk7XG5cbnBsdWNrID0gZnVuY3Rpb24oYXJyLCBmbikge1xuICB2YXIgZm91bmQsIGluZGV4O1xuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XTtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0b3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEludmFsaWRhdG9yIGV4dGVuZHMgQmluZGVyIHtcbiAgICBjb25zdHJ1Y3RvcihpbnZhbGlkYXRlZCwgc2NvcGUgPSBudWxsKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IGludmFsaWRhdGVkO1xuICAgICAgdGhpcy5zY29wZSA9IHNjb3BlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXTtcbiAgICAgIHRoaXMucmVjeWNsZWQgPSBbXTtcbiAgICAgIHRoaXMudW5rbm93bnMgPSBbXTtcbiAgICAgIHRoaXMuc3RyaWN0ID0gdGhpcy5jb25zdHJ1Y3Rvci5zdHJpY3Q7XG4gICAgICB0aGlzLmludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzO1xuICAgIH1cblxuICAgIGludmFsaWRhdGUoKSB7XG4gICAgICB2YXIgZnVuY3ROYW1lO1xuICAgICAgdGhpcy5pbnZhbGlkID0gdHJ1ZTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH0gZWxzZSBpZiAoKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQuaW52YWxpZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLmludmFsaWRhdGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5pbnZhbGlkYXRlZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuaW52YWxpZGF0ZWQuc2xpY2UoMSk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5zY29wZVtmdW5jdE5hbWVdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zY29wZVtmdW5jdE5hbWVdKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGVbdGhpcy5pbnZhbGlkYXRlZF0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdW5rbm93bigpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAodHlwZW9mICgocmVmID0gdGhpcy5pbnZhbGlkYXRlZCkgIT0gbnVsbCA/IHJlZi51bmtub3duIDogdm9pZCAwKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLnVua25vd24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEJpbmRlcihuZXcgRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSk7XG4gICAgfVxuXG4gICAgYWRkQmluZGVyKGJpbmRlcikge1xuICAgICAgaWYgKGJpbmRlci5jYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICAgIGJpbmRlci5jYWxsYmFjayA9IHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5zb21lKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2gocGx1Y2sodGhpcy5yZWN5Y2xlZCwgZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKTtcbiAgICAgICAgfSkgfHwgYmluZGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRVbmtub3duQ2FsbGJhY2socHJvcCkge1xuICAgICAgdmFyIGNhbGxiYWNrO1xuICAgICAgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0KCk7XG4gICAgICAgIH0sIHByb3ApO1xuICAgICAgfTtcbiAgICAgIGNhbGxiYWNrLnJlZiA9IHtcbiAgICAgICAgcHJvcDogcHJvcFxuICAgICAgfTtcbiAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBhZGRVbmtub3duKGZuLCBwcm9wKSB7XG4gICAgICBpZiAoIXRoaXMuZmluZFVua25vd24ocHJvcCkpIHtcbiAgICAgICAgZm4ucmVmID0ge1xuICAgICAgICAgIFwicHJvcFwiOiBwcm9wXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudW5rbm93bnMucHVzaChmbik7XG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd24oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kVW5rbm93bihwcm9wKSB7XG4gICAgICBpZiAoKHByb3AgIT0gbnVsbCkgfHwgKHR5cGVvZiB0YXJnZXQgIT09IFwidW5kZWZpbmVkXCIgJiYgdGFyZ2V0ICE9PSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmtub3ducy5maW5kKGZ1bmN0aW9uKHVua25vd24pIHtcbiAgICAgICAgICByZXR1cm4gdW5rbm93bi5yZWYucHJvcCA9PT0gcHJvcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXZlbnQoZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIGlmICh0aGlzLmNoZWNrRW1pdHRlcih0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZSh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wKHByb3AsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBwcm9wSW5zdGFuY2U7XG4gICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICgodGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UgIT0gbnVsbCkgJiYgKHByb3BJbnN0YW5jZSA9IHRhcmdldC5nZXRQcm9wZXJ0eUluc3RhbmNlKHByb3ApKSkge1xuICAgICAgICAgIHByb3AgPSBwcm9wSW5zdGFuY2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5jaGVja1Byb3BJbnN0YW5jZShwcm9wKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IG11c3QgYmUgYSBQcm9wZXJ0eUluc3RhbmNlIG9yIGEgc3RyaW5nJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFkZEV2ZW50QmluZCgnaW52YWxpZGF0ZWQnLCBwcm9wLCB0aGlzLmdldFVua25vd25DYWxsYmFjayhwcm9wKSk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZShwcm9wLmdldCgpLCAndXBkYXRlZCcsIHByb3ApO1xuICAgIH1cblxuICAgIHByb3BQYXRoKHBhdGgsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBwcm9wLCB2YWw7XG4gICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgdmFsID0gdGFyZ2V0O1xuICAgICAgd2hpbGUgKCh2YWwgIT0gbnVsbCkgJiYgcGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByb3AgPSBwYXRoLnNoaWZ0KCk7XG4gICAgICAgIHZhbCA9IHRoaXMucHJvcChwcm9wLCB2YWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wSW5pdGlhdGVkKHByb3AsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBpbml0aWF0ZWQ7XG4gICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnICYmICh0YXJnZXQuZ2V0UHJvcGVydHlJbnN0YW5jZSAhPSBudWxsKSkge1xuICAgICAgICBwcm9wID0gdGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UocHJvcCk7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLmNoZWNrUHJvcEluc3RhbmNlKHByb3ApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbXVzdCBiZSBhIFByb3BlcnR5SW5zdGFuY2Ugb3IgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIGluaXRpYXRlZCA9IHByb3AuaW5pdGlhdGVkO1xuICAgICAgaWYgKCFpbml0aWF0ZWQpIHtcbiAgICAgICAgdGhpcy5ldmVudCgndXBkYXRlZCcsIHByb3ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluaXRpYXRlZDtcbiAgICB9XG5cbiAgICBmdW5jdChmdW5jdCkge1xuICAgICAgdmFyIGludmFsaWRhdG9yLCByZXM7XG4gICAgICBpbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oKCkgPT4ge1xuICAgICAgICAgIHZhciByZXMyO1xuICAgICAgICAgIHJlczIgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICAgICAgaWYgKHJlcyAhPT0gcmVzMikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgaW52YWxpZGF0b3IpO1xuICAgICAgfSk7XG4gICAgICByZXMgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5wdXNoKGludmFsaWRhdG9yKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVVbmtub3ducygpIHtcbiAgICAgIHZhciB1bmtub3ducztcbiAgICAgIHVua25vd25zID0gdGhpcy51bmtub3ducztcbiAgICAgIHRoaXMudW5rbm93bnMgPSBbXTtcbiAgICAgIHJldHVybiB1bmtub3ducy5mb3JFYWNoKGZ1bmN0aW9uKHVua25vd24pIHtcbiAgICAgICAgcmV0dXJuIHVua25vd24oKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlzRW1wdHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICB0aGlzLmludmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmJpbmQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlY3ljbGUoY2FsbGJhY2spIHtcbiAgICAgIHZhciBkb25lLCByZXM7XG4gICAgICB0aGlzLnJlY3ljbGVkID0gdGhpcy5pbnZhbGlkYXRpb25FdmVudHM7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cyA9IFtdO1xuICAgICAgZG9uZSA9IHRoaXMuZW5kUmVjeWNsZS5iaW5kKHRoaXMpO1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHRoaXMsIGRvbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcyA9IGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbmRSZWN5Y2xlKCkge1xuICAgICAgdGhpcy5yZWN5Y2xlZC5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZWN5Y2xlZCA9IFtdO1xuICAgIH1cblxuICAgIGNoZWNrRW1pdHRlcihlbWl0dGVyKSB7XG4gICAgICByZXR1cm4gRXZlbnRCaW5kLmNoZWNrRW1pdHRlcihlbWl0dGVyLCB0aGlzLnN0cmljdCk7XG4gICAgfVxuXG4gICAgY2hlY2tQcm9wSW5zdGFuY2UocHJvcCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBwcm9wLmdldCA9PT0gXCJmdW5jdGlvblwiICYmIHRoaXMuY2hlY2tFbWl0dGVyKHByb3ApO1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZTtcblxuICByZXR1cm4gSW52YWxpZGF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvSW52YWxpZGF0b3IuanMubWFwXG4iLCJ2YXIgTG9hZGVyLCBPdmVycmlkZXI7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBMb2FkZXIgZXh0ZW5kcyBPdmVycmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH1cblxuICAgIGluaXRQcmVsb2FkZWQoKSB7XG4gICAgICB2YXIgZGVmTGlzdDtcbiAgICAgIGRlZkxpc3QgPSB0aGlzLnByZWxvYWRlZDtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gW107XG4gICAgICByZXR1cm4gdGhpcy5sb2FkKGRlZkxpc3QpO1xuICAgIH1cblxuICAgIGxvYWQoZGVmTGlzdCkge1xuICAgICAgdmFyIGxvYWRlZCwgdG9Mb2FkO1xuICAgICAgdG9Mb2FkID0gW107XG4gICAgICBsb2FkZWQgPSBkZWZMaXN0Lm1hcCgoZGVmKSA9PiB7XG4gICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgaWYgKGRlZi5pbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBsb2FkZXI6IHRoaXNcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGluc3RhbmNlID0gTG9hZGVyLmxvYWQoZGVmKTtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaWYgKGRlZi5pbml0QnlMb2FkZXIgJiYgKGluc3RhbmNlLmluaXQgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHRvTG9hZC5wdXNoKGluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSB0aGlzLnByZWxvYWRlZC5jb25jYXQobG9hZGVkKTtcbiAgICAgIHJldHVybiB0b0xvYWQuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlbG9hZChkZWYpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkZWYpKSB7XG4gICAgICAgIGRlZiA9IFtkZWZdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkID0gKHRoaXMucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQoZGVmKTtcbiAgICB9XG5cbiAgICBkZXN0cm95TG9hZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkLmZvckVhY2goZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHJldHVybiAocmVmID0gZGVmLmluc3RhbmNlKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGVzdHJveSgpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldEZpbmFsUHJvcGVydGllcygpLmNvbmNhdChbJ3ByZWxvYWRlZCddKTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIHN1cGVyLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICBpZiAodGhpcy5wcmVsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkZWQgPSAodGFyZ2V0LnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KHRoaXMucHJlbG9hZGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZE1hbnkoZGVmKSB7XG4gICAgICByZXR1cm4gZGVmLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkKGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWQoZGVmKSB7XG4gICAgICBpZiAodHlwZW9mIGRlZi50eXBlLmNvcHlXaXRoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGRlZi50eXBlLmNvcHlXaXRoKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IGRlZi50eXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHByZWxvYWQoZGVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJlbG9hZChkZWYpO1xuICAgIH1cblxuICB9O1xuXG4gIExvYWRlci5wcm90b3R5cGUucHJlbG9hZGVkID0gW107XG5cbiAgTG9hZGVyLm92ZXJyaWRlcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmluaXQud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveUxvYWRlZCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIExvYWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Mb2FkZXIuanMubWFwXG4iLCJ2YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuXG4gIH07XG5cbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZU9uY2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKHNvdXJjZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uoc291cmNlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLCBwcm9wLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmdldEV4dGVuc2lvblByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3AgPSByZWZbaV07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgcHJvcCk7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAmJiB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzID0gdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLmNhbGwodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgfHwgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InLCAnZ2V0RmluYWxQcm9wZXJ0aWVzJ10sXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBhbHdheXNGaW5hbCwgcHJvcHMsIHRhcmdldENoYWluO1xuICAgICAgYWx3YXlzRmluYWwgPSB0aGlzLmFsd2F5c0ZpbmFsO1xuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XG4gICAgICBwcm9wcyA9IFtdO1xuICAgICAgdGhpcy5nZXRQcm90b3R5cGVDaGFpbihzb3VyY2UpLmV2ZXJ5KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgZXhjbHVkZTtcbiAgICAgICAgaWYgKCF0YXJnZXRDaGFpbi5pbmNsdWRlcyhvYmopKSB7XG4gICAgICAgICAgZXhjbHVkZSA9IGFsd2F5c0ZpbmFsO1xuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KFtcImxlbmd0aFwiLCBcInByb3RvdHlwZVwiLCBcIm5hbWVcIl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIiAmJiBpbmRleE9mLmNhbGwoZXhjbHVkZSwga2V5KSA8IDAgJiYgIXByb3BzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBrZXk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgIHByb3AubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSxcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgYmFzZVByb3RvdHlwZSwgY2hhaW47XG4gICAgICBjaGFpbiA9IFtdO1xuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hhaW4ucHVzaChvYmopO1xuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTWl4YWJsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NaXhhYmxlLmpzLm1hcFxuIiwiLy8gdG9kbyA6IFxuLy8gIHNpbXBsaWZpZWQgZm9ybSA6IEB3aXRob3V0TmFtZSBtZXRob2RcbnZhciBPdmVycmlkZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAodGhpcy5fb3ZlcnJpZGVzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFsnX292ZXJyaWRlcyddLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLl9vdmVycmlkZXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT3ZlcnJpZGVyLk92ZXJyaWRlID0ge1xuICAgIG1ha2VNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIgZm4sIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgZm4gPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIGZuKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIGFwcGx5TWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgb3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgb3ZlcnJpZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFwcGx5KHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgZm5OYW1lLCBmbikge1xuICAgICAgdmFyIG92ZXJyaWRlO1xuICAgICAgb3ZlcnJpZGUgPSB7XG4gICAgICAgIGZuOiB7XG4gICAgICAgICAgY3VycmVudDogZm5cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogZm5OYW1lXG4gICAgICB9O1xuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGgnICsgbmFtZXNwYWNlXSA9IGZuO1xuICAgICAgcmV0dXJuIG92ZXJyaWRlO1xuICAgIH0sXG4gICAgZW1wdHlGbjogZnVuY3Rpb24oKSB7fSxcbiAgICBhcHBseTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSB7XG4gICAgICB2YXIgZm5OYW1lLCBvdmVycmlkZXMsIHJlZiwgcmVmMSwgd2l0aG91dDtcbiAgICAgIGZuTmFtZSA9IG92ZXJyaWRlLm5hbWU7XG4gICAgICBvdmVycmlkZXMgPSB0YXJnZXQuX292ZXJyaWRlcyAhPSBudWxsID8gT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0Ll9vdmVycmlkZXMpIDoge307XG4gICAgICB3aXRob3V0ID0gKChyZWYgPSB0YXJnZXQuX292ZXJyaWRlcykgIT0gbnVsbCA/IChyZWYxID0gcmVmW2ZuTmFtZV0pICE9IG51bGwgPyByZWYxLmZuLmN1cnJlbnQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IHRhcmdldFtmbk5hbWVdO1xuICAgICAgb3ZlcnJpZGUgPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZSk7XG4gICAgICBpZiAob3ZlcnJpZGVzW2ZuTmFtZV0gIT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlc1tmbk5hbWVdLmZuLCBvdmVycmlkZS5mbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH1cbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRob3V0JyArIG5hbWVzcGFjZV0gPSB3aXRob3V0IHx8IHRoaXMuZW1wdHlGbjtcbiAgICAgIGlmICh3aXRob3V0ID09IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQgPSAnd2l0aG91dCcgKyBuYW1lc3BhY2U7XG4gICAgICB9IGVsc2UgaWYgKG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0KSB7XG4gICAgICAgIG92ZXJyaWRlLmZuW292ZXJyaWRlLm1pc3NpbmdXaXRob3V0XSA9IHdpdGhvdXQ7XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBmbk5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaW5hbEZuLCBmbiwga2V5LCByZWYyO1xuICAgICAgICAgIGZpbmFsRm4gPSBvdmVycmlkZS5mbi5jdXJyZW50LmJpbmQodGhpcyk7XG4gICAgICAgICAgcmVmMiA9IG92ZXJyaWRlLmZuO1xuICAgICAgICAgIGZvciAoa2V5IGluIHJlZjIpIHtcbiAgICAgICAgICAgIGZuID0gcmVmMltrZXldO1xuICAgICAgICAgICAgZmluYWxGbltrZXldID0gZm4uYmluZCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZm5OYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiBmaW5hbEZuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZpbmFsRm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3ZlcnJpZGVzW2ZuTmFtZV0gPSBvdmVycmlkZTtcbiAgICAgIHJldHVybiB0YXJnZXQuX292ZXJyaWRlcyA9IG92ZXJyaWRlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE92ZXJyaWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCJ2YXIgQmFzaWNQcm9wZXJ0eSwgQ2FsY3VsYXRlZFByb3BlcnR5LCBDb2xsZWN0aW9uUHJvcGVydHksIENvbXBvc2VkUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eSwgTWl4YWJsZSwgUHJvcGVydHksIFByb3BlcnR5T3duZXI7XG5cbkJhc2ljUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eScpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5Jyk7XG5cbkNvbXBvc2VkUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29tcG9zZWRQcm9wZXJ0eScpO1xuXG5EeW5hbWljUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5Jyk7XG5cbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHknKTtcblxuSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5Jyk7XG5cblByb3BlcnR5T3duZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5T3duZXInKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQcm9wZXJ0eSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBiaW5kKHRhcmdldCkge1xuICAgICAgdmFyIHBhcmVudCwgcHJvcDtcbiAgICAgIHByb3AgPSB0aGlzO1xuICAgICAgaWYgKCEodHlwZW9mIHRhcmdldC5nZXRQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyAmJiB0YXJnZXQuZ2V0UHJvcGVydHkodGhpcy5uYW1lKSA9PT0gdGhpcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQuZ2V0UHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgKChwYXJlbnQgPSB0YXJnZXQuZ2V0UHJvcGVydHkodGhpcy5uYW1lKSkgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLm92ZXJyaWRlKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRJbnN0YW5jZVR5cGUoKS5iaW5kKHRhcmdldCwgcHJvcCk7XG4gICAgICAgIHRhcmdldC5fcHJvcGVydGllcyA9ICh0YXJnZXQuX3Byb3BlcnRpZXMgfHwgW10pLmNvbmNhdChbcHJvcF0pO1xuICAgICAgICBpZiAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICB0YXJnZXQuX3Byb3BlcnRpZXMgPSB0YXJnZXQuX3Byb3BlcnRpZXMuZmlsdGVyKGZ1bmN0aW9uKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhpc3RpbmcgIT09IHBhcmVudDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1ha2VPd25lcih0YXJnZXQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3A7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUocGFyZW50KSB7XG4gICAgICB2YXIga2V5LCByZWYsIHJlc3VsdHMsIHZhbHVlO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMucGFyZW50ID0gcGFyZW50Lm9wdGlvbnM7XG4gICAgICAgIHJlZiA9IHBhcmVudC5vcHRpb25zO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgICAgIHZhbHVlID0gcmVmW2tleV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnNba2V5XSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm9wdGlvbnNba2V5XS5vdmVycmlkZWQgPSB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5vcHRpb25zW2tleV0gPSB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtYWtlT3duZXIodGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKFByb3BlcnR5T3duZXIucHJvdG90eXBlKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgcmV0dXJuIE1peGFibGUuRXh0ZW5zaW9uLm1ha2UoUHJvcGVydHlPd25lci5wcm90b3R5cGUsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2VWYXJOYW1lKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pbnN0YW5jZVZhck5hbWUgfHwgJ18nICsgdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIGlzSW5zdGFudGlhdGVkKG9iaikge1xuICAgICAgcmV0dXJuIG9ialt0aGlzLmdldEluc3RhbmNlVmFyTmFtZSgpXSAhPSBudWxsO1xuICAgIH1cblxuICAgIGdldEluc3RhbmNlKG9iaikge1xuICAgICAgdmFyIFR5cGUsIHZhck5hbWU7XG4gICAgICB2YXJOYW1lID0gdGhpcy5nZXRJbnN0YW5jZVZhck5hbWUoKTtcbiAgICAgIGlmICghdGhpcy5pc0luc3RhbnRpYXRlZChvYmopKSB7XG4gICAgICAgIFR5cGUgPSB0aGlzLmdldEluc3RhbmNlVHlwZSgpO1xuICAgICAgICBvYmpbdmFyTmFtZV0gPSBuZXcgVHlwZSh0aGlzLCBvYmopO1xuICAgICAgICBvYmpbdmFyTmFtZV0uaW5pdCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialt2YXJOYW1lXTtcbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZVR5cGUoKSB7XG4gICAgICBpZiAoIXRoaXMuaW5zdGFuY2VUeXBlKSB7XG4gICAgICAgIHRoaXMuY29tcG9zZXJzLmZvckVhY2goKGNvbXBvc2VyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBvc2VyLmNvbXBvc2UodGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VUeXBlO1xuICAgIH1cblxuICB9O1xuXG4gIFByb3BlcnR5LnByb3RvdHlwZS5jb21wb3NlcnMgPSBbQ29tcG9zZWRQcm9wZXJ0eSwgQ29sbGVjdGlvblByb3BlcnR5LCBEeW5hbWljUHJvcGVydHksIEJhc2ljUHJvcGVydHksIENhbGN1bGF0ZWRQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eV07XG5cbiAgcmV0dXJuIFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb3BlcnR5LmpzLm1hcFxuIiwidmFyIFByb3BlcnR5T3duZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlPd25lciA9IGNsYXNzIFByb3BlcnR5T3duZXIge1xuICBnZXRQcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMgJiYgdGhpcy5fcHJvcGVydGllcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cblxuICBnZXRQcm9wZXJ0eUluc3RhbmNlKG5hbWUpIHtcbiAgICB2YXIgcmVzO1xuICAgIHJlcyA9IHRoaXMuZ2V0UHJvcGVydHkobmFtZSk7XG4gICAgaWYgKHJlcykge1xuICAgICAgcmV0dXJuIHJlcy5nZXRJbnN0YW5jZSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnNsaWNlKCk7XG4gIH1cblxuICBnZXRQcm9wZXJ0eUluc3RhbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0SW5zdGFudGlhdGVkUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5maWx0ZXIoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmlzSW5zdGFudGlhdGVkKHRoaXMpO1xuICAgIH0pLm1hcCgocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRNYW51YWxEYXRhUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5yZWR1Y2UoKHJlcywgcHJvcCkgPT4ge1xuICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgaWYgKHByb3AuaXNJbnN0YW50aWF0ZWQodGhpcykpIHtcbiAgICAgICAgaW5zdGFuY2UgPSBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgICAgICBpZiAoaW5zdGFuY2UuY2FsY3VsYXRlZCAmJiBpbnN0YW5jZS5tYW51YWwpIHtcbiAgICAgICAgICByZXNbcHJvcC5uYW1lXSA9IGluc3RhbmNlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sIHt9KTtcbiAgfVxuXG4gIHNldFByb3BlcnRpZXMoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdmFyIGtleSwgcHJvcCwgdmFsO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHlJbnN0YW5jZShrZXkpO1xuICAgICAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICAgICAgcHJvcC5zZXQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlc3Ryb3lQcm9wZXJ0aWVzKCkge1xuICAgIHRoaXMuZ2V0SW5zdGFudGlhdGVkUHJvcGVydGllcygpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgICB0aGlzLl9wcm9wZXJ0aWVzID0gW107XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsaXN0ZW5lckFkZGVkKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wLmdldEluc3RhbmNlVHlwZSgpLnByb3RvdHlwZS5jaGFuZ2VFdmVudE5hbWUgPT09IGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5saXN0ZW5lckFkZGVkID0gdGhpcy5saXN0ZW5lckFkZGVkO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHlPd25lci5qcy5tYXBcbiIsInZhciBCYXNpY1Byb3BlcnR5LCBFdmVudEVtaXR0ZXIsIExvYWRlciwgTWl4YWJsZSwgUHJvcGVydHlXYXRjaGVyLCBSZWZlcnJlZDtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4uL01peGFibGUnKTtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi4vRXZlbnRFbWl0dGVyJyk7XG5cbkxvYWRlciA9IHJlcXVpcmUoJy4uL0xvYWRlcicpO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRlZC9Qcm9wZXJ0eVdhdGNoZXInKTtcblxuUmVmZXJyZWQgPSByZXF1aXJlKCcuLi9SZWZlcnJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEJhc2ljUHJvcGVydHkgZXh0ZW5kcyBNaXhhYmxlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eSwgb2JqKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgICAgdGhpcy5vYmogPSBvYmo7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHZhciBwcmVsb2FkO1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5nZXN0KHRoaXMuZGVmYXVsdCk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW5pdGlhdGVkID0gZmFsc2U7XG4gICAgICBwcmVsb2FkID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRQcmVsb2FkKHRoaXMub2JqLCB0aGlzLnByb3BlcnR5LCB0aGlzKTtcbiAgICAgIGlmIChwcmVsb2FkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIExvYWRlci5sb2FkTWFueShwcmVsb2FkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCF0aGlzLmluaXRpYXRlZCkge1xuICAgICAgICB0aGlzLmluaXRpYXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQoKTtcbiAgICB9XG5cbiAgICBzZXQodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRBbmRDaGVja0NoYW5nZXModmFsKTtcbiAgICB9XG5cbiAgICBjYWxsYmFja1NldCh2YWwpIHtcbiAgICAgIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwic2V0XCIsIHZhbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRBbmRDaGVja0NoYW5nZXModmFsKSB7XG4gICAgICB2YXIgb2xkO1xuICAgICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKTtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh2YWwsIHRoaXMudmFsdWUpKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gICAgICAgIHRoaXMubWFudWFsID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjaGVja0NoYW5nZXModmFsLCBvbGQpIHtcbiAgICAgIHJldHVybiB2YWwgIT09IG9sZDtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVzdHJveSA9PT0gdHJ1ZSAmJiAoKChyZWYgPSB0aGlzLnZhbHVlKSAhPSBudWxsID8gcmVmLmRlc3Ryb3kgOiB2b2lkIDApICE9IG51bGwpKSB7XG4gICAgICAgIHRoaXMudmFsdWUuZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLmNhbGxPcHRpb25GdW5jdCgnZGVzdHJveScsIHRoaXMudmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWUgPSBudWxsO1xuICAgIH1cblxuICAgIGNhbGxPcHRpb25GdW5jdChmdW5jdCwgLi4uYXJncykge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZnVuY3QgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnNbZnVuY3RdO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBmdW5jdC5vdmVycmlkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYXJncy5wdXNoKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0Lm92ZXJyaWRlZCwgLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0LmFwcGx5KHRoaXMub2JqLCBhcmdzKTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlZCgpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWF0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGluZ2VzdCh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3V0cHV0KCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZWQob2xkKSB7XG4gICAgICB0aGlzLmVtaXRFdmVudCgndXBkYXRlZCcsIG9sZCk7XG4gICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlZCcsIG9sZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5pbnN0YW5jZVR5cGUgPT0gbnVsbCkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLnNldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuc2V0ID0gdGhpcy5wcm90b3R5cGUuY2FsbGJhY2tTZXQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmRlZmF1bHQgPSBwcm9wLm9wdGlvbnMuZGVmYXVsdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcbiAgICAgIHZhciBtYWosIG9wdCwgcHJlbG9hZDtcbiAgICAgIG1haiA9IHByb3AubmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3AubmFtZS5zbGljZSgxKTtcbiAgICAgIG9wdCA9IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5zZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIG9wdC5zZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5zZXQodmFsKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgb3B0KTtcbiAgICAgIHRhcmdldFsnZ2V0JyArIG1hal0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9O1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5zZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIHRhcmdldFsnc2V0JyArIG1hal0gPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICBwcm9wLmdldEluc3RhbmNlKHRoaXMpLnNldCh2YWwpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgdGFyZ2V0WydpbnZhbGlkYXRlJyArIG1hal0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5pbnZhbGlkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICAgIHByZWxvYWQgPSB0aGlzLmdldFByZWxvYWQodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGlmIChwcmVsb2FkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgTWl4YWJsZS5FeHRlbnNpb24ubWFrZU9uY2UoTG9hZGVyLnByb3RvdHlwZSwgdGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkKHByZWxvYWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRQcmVsb2FkKHRhcmdldCwgcHJvcCwgaW5zdGFuY2UpIHtcbiAgICAgIHZhciBwcmVsb2FkLCByZWYsIHJlZjEsIHRvTG9hZDtcbiAgICAgIHByZWxvYWQgPSBbXTtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNoYW5nZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRvTG9hZCA9IHtcbiAgICAgICAgICB0eXBlOiBQcm9wZXJ0eVdhdGNoZXIsXG4gICAgICAgICAgbG9hZGVyQXNTY29wZTogdHJ1ZSxcbiAgICAgICAgICBwcm9wZXJ0eTogaW5zdGFuY2UgfHwgcHJvcC5uYW1lLFxuICAgICAgICAgIGluaXRCeUxvYWRlcjogdHJ1ZSxcbiAgICAgICAgICBhdXRvQmluZDogdHJ1ZSxcbiAgICAgICAgICBjYWxsYmFjazogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICByZWY6IHtcbiAgICAgICAgICAgIHByb3A6IHByb3AubmFtZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBwcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICAgICAgY29udGV4dDogJ2NoYW5nZSdcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mICgocmVmID0gcHJvcC5vcHRpb25zLmNoYW5nZSkgIT0gbnVsbCA/IHJlZi5jb3B5V2l0aCA6IHZvaWQgMCkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0b0xvYWQgPSB7XG4gICAgICAgICAgdHlwZTogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICBsb2FkZXJBc1Njb3BlOiB0cnVlLFxuICAgICAgICAgIHByb3BlcnR5OiBpbnN0YW5jZSB8fCBwcm9wLm5hbWUsXG4gICAgICAgICAgaW5pdEJ5TG9hZGVyOiB0cnVlLFxuICAgICAgICAgIGF1dG9CaW5kOiB0cnVlLFxuICAgICAgICAgIHJlZjoge1xuICAgICAgICAgICAgcHJvcDogcHJvcC5uYW1lLFxuICAgICAgICAgICAgdHlwZTogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjaGFuZ2UnXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCh0b0xvYWQgIT0gbnVsbCkgJiYgISgocmVmMSA9IHRhcmdldC5wcmVsb2FkZWQpICE9IG51bGwgPyByZWYxLmZpbmQoZnVuY3Rpb24obG9hZGVkKSB7XG4gICAgICAgIHJldHVybiBSZWZlcnJlZC5jb21wYXJlUmVmKHRvTG9hZC5yZWYsIGxvYWRlZC5yZWYpICYmICFpbnN0YW5jZSB8fCAobG9hZGVkLmluc3RhbmNlICE9IG51bGwpO1xuICAgICAgfSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHByZWxvYWQucHVzaCh0b0xvYWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZWxvYWQ7XG4gICAgfVxuXG4gIH07XG5cbiAgQmFzaWNQcm9wZXJ0eS5leHRlbmQoRXZlbnRFbWl0dGVyKTtcblxuICByZXR1cm4gQmFzaWNQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHkuanMubWFwXG4iLCJ2YXIgQ2FsY3VsYXRlZFByb3BlcnR5LCBEeW5hbWljUHJvcGVydHksIEludmFsaWRhdG9yLCBPdmVycmlkZXI7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxuRHluYW1pY1Byb3BlcnR5ID0gcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcblxuT3ZlcnJpZGVyID0gcmVxdWlyZSgnLi4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsY3VsYXRlZFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDYWxjdWxhdGVkUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xuICAgIGNhbGN1bCgpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdCh0aGlzLmNhbGN1bEZ1bmN0KTtcbiAgICAgIHRoaXMubWFudWFsID0gZmFsc2U7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicgJiYgKHByb3Aub3B0aW9ucy5jb21wb3NlZCA9PSBudWxsKSkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2FsY3VsRnVuY3QgPSBwcm9wLm9wdGlvbnMuY2FsY3VsO1xuICAgICAgICBpZiAoIShwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChDYWxjdWxhdGVkUHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQ2FsY3VsYXRlZFByb3BlcnR5LmV4dGVuZChPdmVycmlkZXIpO1xuXG4gIENhbGN1bGF0ZWRQcm9wZXJ0eS5vdmVycmlkZXMoe1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5pdGlhdGVkLCBvbGQ7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICAgIGluaXRpYXRlZCA9IHRoaXMuaW5pdGlhdGVkO1xuICAgICAgICB0aGlzLmNhbGN1bCgpO1xuICAgICAgICBpZiAodGhpcy5jaGVja0NoYW5nZXModGhpcy52YWx1ZSwgb2xkKSkge1xuICAgICAgICAgIGlmIChpbml0aWF0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVtaXRFdmVudCgndXBkYXRlZCcsIG9sZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFpbml0aWF0ZWQpIHtcbiAgICAgICAgICB0aGlzLmVtaXRFdmVudCgndXBkYXRlZCcsIG9sZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm91dHB1dCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENhbGN1bGF0ZWRQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eS5qcy5tYXBcbiIsInZhciBDb2xsZWN0aW9uLCBDb2xsZWN0aW9uUHJvcGVydHksIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIsIER5bmFtaWNQcm9wZXJ0eSwgUmVmZXJyZWQ7XG5cbkR5bmFtaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XG5cbkNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9Db2xsZWN0aW9uJyk7XG5cblJlZmVycmVkID0gcmVxdWlyZSgnLi4vUmVmZXJyZWQnKTtcblxuQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdGVkL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbGxlY3Rpb25Qcm9wZXJ0eSBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7XG4gICAgaW5nZXN0KHZhbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaW5nZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbCA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaW5nZXN0XCIsIHZhbCk7XG4gICAgICB9XG4gICAgICBpZiAodmFsID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHZhbC50b0FycmF5KCk7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICByZXR1cm4gdmFsLnNsaWNlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW3ZhbF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tDaGFuZ2VkSXRlbXModmFsLCBvbGQpIHtcbiAgICAgIHZhciBjb21wYXJlRnVuY3Rpb247XG4gICAgICBpZiAodHlwZW9mIHRoaXMuY29sbGVjdGlvbk9wdGlvbnMuY29tcGFyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb21wYXJlRnVuY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLmNvbXBhcmU7XG4gICAgICB9XG4gICAgICByZXR1cm4gKG5ldyBDb2xsZWN0aW9uKHZhbCkpLmNoZWNrQ2hhbmdlcyhvbGQsIHRoaXMuY29sbGVjdGlvbk9wdGlvbnMub3JkZXJlZCwgY29tcGFyZUZ1bmN0aW9uKTtcbiAgICB9XG5cbiAgICBvdXRwdXQoKSB7XG4gICAgICB2YXIgY29sLCBwcm9wLCB2YWx1ZTtcbiAgICAgIHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLm91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwib3V0cHV0XCIsIHRoaXMudmFsdWUpO1xuICAgICAgfVxuICAgICAgcHJvcCA9IHRoaXM7XG4gICAgICBjb2wgPSBDb2xsZWN0aW9uLm5ld1N1YkNsYXNzKHRoaXMuY29sbGVjdGlvbk9wdGlvbnMsIHZhbHVlKTtcbiAgICAgIGNvbC5jaGFuZ2VkID0gZnVuY3Rpb24ob2xkKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmNoYW5nZWQob2xkKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gY29sO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBDb2xsZWN0aW9uUHJvcGVydHkge307XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jb2xsZWN0aW9uT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdENvbGxlY3Rpb25PcHRpb25zLCB0eXBlb2YgcHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gPT09ICdvYmplY3QnID8gcHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gOiB7fSk7XG4gICAgICAgIGlmIChwcm9wLm9wdGlvbnMuY29sbGVjdGlvbi5jb21wYXJlICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNoZWNrQ2hhbmdlcyA9IHRoaXMucHJvdG90eXBlLmNoZWNrQ2hhbmdlZEl0ZW1zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFByZWxvYWQodGFyZ2V0LCBwcm9wLCBpbnN0YW5jZSkge1xuICAgICAgdmFyIHByZWxvYWQsIHJlZiwgcmVmMTtcbiAgICAgIHByZWxvYWQgPSBbXTtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNoYW5nZSA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiBwcm9wLm9wdGlvbnMuaXRlbUFkZGVkID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBwcm9wLm9wdGlvbnMuaXRlbVJlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmVmID0ge1xuICAgICAgICAgIHByb3A6IHByb3AubmFtZSxcbiAgICAgICAgICBjb250ZXh0OiAnY2hhbmdlJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAoISgocmVmMSA9IHRhcmdldC5wcmVsb2FkZWQpICE9IG51bGwgPyByZWYxLmZpbmQoZnVuY3Rpb24obG9hZGVkKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZmVycmVkLmNvbXBhcmVSZWYocmVmLCBsb2FkZWQucmVmKSAmJiAobG9hZGVkLmluc3RhbmNlICE9IG51bGwpO1xuICAgICAgICB9KSA6IHZvaWQgMCkpIHtcbiAgICAgICAgICBwcmVsb2FkLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcixcbiAgICAgICAgICAgIGxvYWRlckFzU2NvcGU6IHRydWUsXG4gICAgICAgICAgICBzY29wZTogdGFyZ2V0LFxuICAgICAgICAgICAgcHJvcGVydHk6IGluc3RhbmNlIHx8IHByb3AubmFtZSxcbiAgICAgICAgICAgIGluaXRCeUxvYWRlcjogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9CaW5kOiB0cnVlLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgICBvbkFkZGVkOiBwcm9wLm9wdGlvbnMuaXRlbUFkZGVkLFxuICAgICAgICAgICAgb25SZW1vdmVkOiBwcm9wLm9wdGlvbnMuaXRlbVJlbW92ZWQsXG4gICAgICAgICAgICByZWY6IHJlZlxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJlbG9hZDtcbiAgICB9XG5cbiAgfTtcblxuICBDb2xsZWN0aW9uUHJvcGVydHkuZGVmYXVsdENvbGxlY3Rpb25PcHRpb25zID0ge1xuICAgIGNvbXBhcmU6IGZhbHNlLFxuICAgIG9yZGVyZWQ6IHRydWVcbiAgfTtcblxuICByZXR1cm4gQ29sbGVjdGlvblByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzLm1hcFxuIiwidmFyIENhbGN1bGF0ZWRQcm9wZXJ0eSwgQ29sbGVjdGlvbiwgQ29tcG9zZWRQcm9wZXJ0eSwgSW52YWxpZGF0b3I7XG5cbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxuQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL0NvbGxlY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb3NlZFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb21wb3NlZFByb3BlcnR5IGV4dGVuZHMgQ2FsY3VsYXRlZFByb3BlcnR5IHtcbiAgICBpbml0KCkge1xuICAgICAgdGhpcy5pbml0Q29tcG9zZWQoKTtcbiAgICAgIHJldHVybiBzdXBlci5pbml0KCk7XG4gICAgfVxuXG4gICAgaW5pdENvbXBvc2VkKCkge1xuICAgICAgaWYgKHRoaXMucHJvcGVydHkub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnZGVmYXVsdCcpKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdCA9IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLm1lbWJlcnMgPSBuZXcgQ29tcG9zZWRQcm9wZXJ0eS5NZW1iZXJzKHRoaXMucHJvcGVydHkub3B0aW9ucy5tZW1iZXJzKTtcbiAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMuY2FsY3VsICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5tZW1iZXJzLnVuc2hpZnQoKHByZXYsIGludmFsaWRhdG9yKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydHkub3B0aW9ucy5jYWxjdWwuYmluZCh0aGlzLm9iaikoaW52YWxpZGF0b3IpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVtYmVycy5jaGFuZ2VkID0gKG9sZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuam9pbiA9IHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuY29tcG9zZWQgPT09ICdmdW5jdGlvbicgPyB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuY29tcG9zZWQgOiB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkID09PSAnc3RyaW5nJyAmJiAoQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zW3RoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZF0gIT0gbnVsbCkgPyBDb21wb3NlZFByb3BlcnR5LmpvaW5GdW5jdGlvbnNbdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkXSA6IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSA/IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5vciA6IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0ID09PSB0cnVlID8gQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zLmFuZCA6IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5sYXN0O1xuICAgIH1cblxuICAgIGNhbGN1bCgpIHtcbiAgICAgIGlmICh0aGlzLm1lbWJlcnMubGVuZ3RoKSB7XG4gICAgICAgIGlmICghdGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5vYmopO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5tZW1iZXJzLnJlZHVjZSgocHJldiwgbWVtYmVyKSA9PiB7XG4gICAgICAgICAgICB2YXIgdmFsO1xuICAgICAgICAgICAgdmFsID0gdHlwZW9mIG1lbWJlciA9PT0gJ2Z1bmN0aW9uJyA/IG1lbWJlcihwcmV2LCB0aGlzLmludmFsaWRhdG9yKSA6IG1lbWJlcjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4ocHJldiwgdmFsKTtcbiAgICAgICAgICB9LCB0aGlzLmRlZmF1bHQpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmRlZmF1bHQ7XG4gICAgICB9XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBzZXQodmFsKSB7XG4gICAgICB2YWwgPSB0aGlzLmluZ2VzdCh2YWwpO1xuICAgICAgaWYgKHRoaXMuZGVmYXVsdCAhPT0gdmFsKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdCA9IHZhbDtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMuY29tcG9zZWQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIENvbXBvc2VkUHJvcGVydHkge307XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGJpbmQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICBDYWxjdWxhdGVkUHJvcGVydHkuYmluZCh0YXJnZXQsIHByb3ApO1xuICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSArICdNZW1iZXJzJywge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykubWVtYmVycztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zID0ge1xuICAgIGFuZDogZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEgJiYgYjtcbiAgICB9LFxuICAgIG9yOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSB8fCBiO1xuICAgIH0sXG4gICAgbGFzdDogZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGI7XG4gICAgfSxcbiAgICBzdW06IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhICsgYjtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvbXBvc2VkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbkNvbXBvc2VkUHJvcGVydHkuTWVtYmVycyA9IGNsYXNzIE1lbWJlcnMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgYWRkUHJvcGVydHlSZWYobmFtZSwgb2JqKSB7XG4gICAgdmFyIGZuO1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopID09PSAtMSkge1xuICAgICAgZm4gPSBmdW5jdGlvbihwcmV2LCBpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgobmFtZSwgb2JqKTtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopIHtcbiAgICB2YXIgZm47XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbiA9IGZ1bmN0aW9uKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9O1xuICAgICAgZm4ucmVmID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgdmFsOiB2YWxcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBzZXRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbiwgaSwgcmVmO1xuICAgIGkgPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpID09PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkucmVmLnZhbCAhPT0gdmFsKSB7XG4gICAgICByZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIGZuID0gZnVuY3Rpb24ocHJldiwgaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSByZWY7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoaSwgZm4pO1xuICAgIH1cbiAgfVxuXG4gIGdldFZhbHVlUmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihuYW1lLCBvYmopLnJlZi52YWw7XG4gIH1cblxuICBhZGRGdW5jdGlvblJlZihmbiwgbmFtZSwgb2JqKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgZmluZEJ5UmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopXTtcbiAgfVxuXG4gIGZpbmRSZWZJbmRleChuYW1lLCBvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgcmV0dXJuIChtZW1iZXIucmVmICE9IG51bGwpICYmIG1lbWJlci5yZWYub2JqID09PSBvYmogJiYgbWVtYmVyLnJlZi5uYW1lID09PSBuYW1lO1xuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlUmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBpbmRleCwgb2xkO1xuICAgIGluZGV4ID0gdGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzLm1hcFxuIiwidmFyIEJhc2ljUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgSW52YWxpZGF0b3I7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxuQmFzaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vQmFzaWNQcm9wZXJ0eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IER5bmFtaWNQcm9wZXJ0eSA9IGNsYXNzIER5bmFtaWNQcm9wZXJ0eSBleHRlbmRzIEJhc2ljUHJvcGVydHkge1xuICBjYWxsYmFja0dldCgpIHtcbiAgICB2YXIgcmVzO1xuICAgIHJlcyA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiZ2V0XCIpO1xuICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfaW52YWxpZGF0ZU5vdGljZSgpIHtcbiAgICB0aGlzLmVtaXRFdmVudCgnaW52YWxpZGF0ZWQnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChwcm9wLmluc3RhbmNlVHlwZSA9PSBudWxsKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge307XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5nZXQgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja0dldDtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcy5tYXBcbiIsInZhciBDYWxjdWxhdGVkUHJvcGVydHksIEludmFsaWRhdGVkUHJvcGVydHksIEludmFsaWRhdG9yO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgSW52YWxpZGF0ZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgdW5rbm93bigpIHtcbiAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDAgJiYgKHByb3Aub3B0aW9ucy5jb21wb3NlZCA9PSBudWxsKSkge1xuICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKEludmFsaWRhdGVkUHJvcGVydHkpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEludmFsaWRhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5vYmopO1xuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5jYWxjdWxGdW5jdCwgaW52YWxpZGF0b3IpO1xuICAgICAgICB0aGlzLm1hbnVhbCA9IGZhbHNlO1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kZXN0cm95LndpdGhvdXRJbnZhbGlkYXRlZFByb3BlcnR5KCk7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaW52YWxpZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5jYWxjdWxhdGVkIHx8IHRoaXMuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZU5vdGljZSgpO1xuICAgICAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCAmJiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEludmFsaWRhdGVkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5LmpzLm1hcFxuIiwidmFyIFJlZmVycmVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZmVycmVkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSZWZlcnJlZCB7XG4gICAgY29tcGFyZVJlZmVyZWQocmVmZXJlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuY29tcGFyZVJlZmVyZWQocmVmZXJlZCwgdGhpcyk7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge31cblxuICAgIHN0YXRpYyBjb21wYXJlUmVmZXJlZChvYmoxLCBvYmoyKSB7XG4gICAgICByZXR1cm4gb2JqMSA9PT0gb2JqMiB8fCAoKG9iajEgIT0gbnVsbCkgJiYgKG9iajIgIT0gbnVsbCkgJiYgb2JqMS5jb25zdHJ1Y3RvciA9PT0gb2JqMi5jb25zdHJ1Y3RvciAmJiB0aGlzLmNvbXBhcmVSZWYob2JqMS5yZWYsIG9iajIucmVmKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBhcmVSZWYocmVmMSwgcmVmMikge1xuICAgICAgcmV0dXJuIChyZWYxICE9IG51bGwpICYmIChyZWYyICE9IG51bGwpICYmIChyZWYxID09PSByZWYyIHx8IChBcnJheS5pc0FycmF5KHJlZjEpICYmIEFycmF5LmlzQXJyYXkocmVmMSkgJiYgcmVmMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFbaV0sIHJlZjJbaV0pO1xuICAgICAgfSkpIHx8ICh0eXBlb2YgcmVmMSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVmMiA9PT0gXCJvYmplY3RcIiAmJiBPYmplY3Qua2V5cyhyZWYxKS5qb2luKCkgPT09IE9iamVjdC5rZXlzKHJlZjIpLmpvaW4oKSAmJiBPYmplY3Qua2V5cyhyZWYxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFba2V5XSwgcmVmMltrZXldKTtcbiAgICAgIH0pKSk7XG4gICAgfVxuXG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlZmVycmVkLnByb3RvdHlwZSwgJ3JlZicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVmKCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUmVmZXJyZWQ7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUmVmZXJyZWQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBVcGRhdGVyO1xuXG5CaW5kZXIgPSByZXF1aXJlKCcuL0JpbmRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciByZWY7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmNhbGxiYWNrIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZENhbGxiYWNrKG9wdGlvbnMuY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IChyZWYgPSBvcHRpb25zLmNhbGxiYWNrcykgIT0gbnVsbCA/IHJlZi5mb3JFYWNoIDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIHRoaXMucnVuQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBydW5DYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVwZGF0aW5nICYmICF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIG5leHRUaWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgIGlmICghdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubmV4dC5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMubmV4dCA9IFtdO1xuICB9XG5cbn07XG5cblVwZGF0ZXIuQmluZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgY2xhc3MgQmluZGVyIGV4dGVuZHMgc3VwZXJDbGFzcyB7XG4gICAgY29uc3RydWN0b3IodGFyZ2V0LCBjYWxsYmFjazEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjazE7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZG9CaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZENhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUNhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBCaW5kZXI7XG5cbn0pLmNhbGwodGhpcywgQmluZGVyKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9VcGRhdGVyLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQmluZGVyXCI6IHJlcXVpcmUoXCIuL0JpbmRlclwiKSxcbiAgXCJDb2xsZWN0aW9uXCI6IHJlcXVpcmUoXCIuL0NvbGxlY3Rpb25cIiksXG4gIFwiRWxlbWVudFwiOiByZXF1aXJlKFwiLi9FbGVtZW50XCIpLFxuICBcIkV2ZW50QmluZFwiOiByZXF1aXJlKFwiLi9FdmVudEJpbmRcIiksXG4gIFwiRXZlbnRFbWl0dGVyXCI6IHJlcXVpcmUoXCIuL0V2ZW50RW1pdHRlclwiKSxcbiAgXCJJbnZhbGlkYXRvclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRvclwiKSxcbiAgXCJMb2FkZXJcIjogcmVxdWlyZShcIi4vTG9hZGVyXCIpLFxuICBcIk1peGFibGVcIjogcmVxdWlyZShcIi4vTWl4YWJsZVwiKSxcbiAgXCJPdmVycmlkZXJcIjogcmVxdWlyZShcIi4vT3ZlcnJpZGVyXCIpLFxuICBcIlByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5XCIpLFxuICBcIlByb3BlcnR5T3duZXJcIjogcmVxdWlyZShcIi4vUHJvcGVydHlPd25lclwiKSxcbiAgXCJSZWZlcnJlZFwiOiByZXF1aXJlKFwiLi9SZWZlcnJlZFwiKSxcbiAgXCJVcGRhdGVyXCI6IHJlcXVpcmUoXCIuL1VwZGF0ZXJcIiksXG4gIFwiSW52YWxpZGF0ZWRcIjoge1xuICAgIFwiQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiKSxcbiAgICBcIkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXJcIjogcmVxdWlyZShcIi4vSW52YWxpZGF0ZWQvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlclwiKSxcbiAgICBcIkludmFsaWRhdGVkXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0ludmFsaWRhdGVkXCIpLFxuICAgIFwiUHJvcGVydHlXYXRjaGVyXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlclwiKSxcbiAgfSxcbiAgXCJQcm9wZXJ0eVR5cGVzXCI6IHtcbiAgICBcIkJhc2ljUHJvcGVydHlcIjogcmVxdWlyZShcIi4vUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5XCIpLFxuICAgIFwiQ2FsY3VsYXRlZFByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5XCIpLFxuICAgIFwiQ29sbGVjdGlvblByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5XCIpLFxuICAgIFwiQ29tcG9zZWRQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHlcIiksXG4gICAgXCJEeW5hbWljUHJvcGVydHlcIjogcmVxdWlyZShcIi4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHlcIiksXG4gICAgXCJJbnZhbGlkYXRlZFByb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eVwiKSxcbiAgfSxcbn0iXX0=
