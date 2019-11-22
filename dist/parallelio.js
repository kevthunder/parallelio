(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Parallelio = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Element, Grid, GridCell, GridRow;

Element = require('spark-starter').Element;

GridCell = require('./GridCell');

GridRow = require('./GridRow');

module.exports = Grid = (function() {
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
        rows = invalidator.prop(this.rowsProperty);
        return rows.reduce(function(max, row) {
          return Math.max(max, invalidator.prop(row.cellsProperty).length);
        }, 0);
      }
    }
  });

  return Grid;

}).call(this);

},{"./GridCell":2,"./GridRow":3,"spark-starter":100}],2:[function(require,module,exports){
var Element, GridCell;

Element = require('spark-starter').Element;

module.exports = GridCell = (function() {
  class GridCell extends Element {};

  GridCell.properties({
    grid: {
      calcul: function(invalidator) {
        return invalidator.propPath('grid.row');
      }
    },
    row: {},
    columnPosition: {
      calcul: function(invalidator) {
        var row;
        row = invalidator.prop(this.rowProperty);
        if (row) {
          return invalidator.prop(row.cellsProperty).indexOf(this);
        }
      }
    },
    width: {
      calcul: function(invalidator) {
        return 1 / invalidator.propPath('row.cells').length;
      }
    },
    left: {
      calcul: function(invalidator) {
        return invalidator.prop(this.widthProperty) * invalidator.prop(this.columnPositionProperty);
      }
    },
    right: {
      calcul: function(invalidator) {
        return invalidator.prop(this.widthProperty) * (invalidator.prop(this.columnPositionProperty) + 1);
      }
    },
    height: {
      calcul: function(invalidator) {
        return invalidator.propPath('row.height');
      }
    },
    top: {
      calcul: function(invalidator) {
        return invalidator.propPath('row.top');
      }
    },
    bottom: {
      calcul: function(invalidator) {
        return invalidator.propPath('row.bottom');
      }
    }
  });

  return GridCell;

}).call(this);

},{"spark-starter":100}],3:[function(require,module,exports){
var Element, GridCell, GridRow;

Element = require('spark-starter').Element;

GridCell = require('./GridCell');

module.exports = GridRow = (function() {
  class GridRow extends Element {
    addCell(cell = null) {
      if (!cell) {
        cell = new GridCell();
      }
      this.cells.push(cell);
      return cell;
    }

  };

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
        grid = invalidator.prop(this.gridProperty);
        if (grid) {
          return invalidator.prop(grid.rowsProperty).indexOf(this);
        }
      }
    },
    height: {
      calcul: function(invalidator) {
        return 1 / invalidator.propPath('grid.rows').length;
      }
    },
    top: {
      calcul: function(invalidator) {
        return invalidator.prop(this.heightProperty) * invalidator.prop(this.rowPositionProperty);
      }
    },
    bottom: {
      calcul: function(invalidator) {
        return invalidator.prop(this.heightProperty) * (invalidator.prop(this.rowPositionProperty) + 1);
      }
    }
  });

  return GridRow;

}).call(this);

},{"./GridCell":2,"spark-starter":100}],4:[function(require,module,exports){
module.exports = {
  "Grid": require("./Grid"),
  "GridCell": require("./GridCell"),
  "GridRow": require("./GridRow"),
}
},{"./Grid":1,"./GridCell":2,"./GridRow":3}],5:[function(require,module,exports){
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
},{"spark-starter":100}],6:[function(require,module,exports){
if (typeof module !== "undefined" && module !== null) {
  module.exports = {
      greekAlphabet: require('./strings/greekAlphabet'),
      starNames: require('./strings/starNames')
  };
}
},{"./strings/greekAlphabet":7,"./strings/starNames":8}],7:[function(require,module,exports){
module.exports=[
"alpha",   "beta",    "gamma",   "delta",
"epsilon", "zeta",    "eta",     "theta",
"iota",    "kappa",   "lambda",  "mu",
"nu",      "xi",      "omicron", "pi",	
"rho",     "sigma",   "tau",     "upsilon",
"phi",     "chi",     "psi",     "omega"
]
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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
      if (x === 0 && y === 0) {
        return this;
      }
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
            return tile.adjacentTilesProperty.invalidate();
          });
        }
      }
    },
    adjacentTiles: {
      calcul: function(invalidation) {
        if (invalidation.prop(this.containerProperty)) {
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

},{"./Direction":9,"spark-starter":100}],11:[function(require,module,exports){
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
      if (!this.tiles.includes(tile)) {
        this.tiles.push(tile);
        if (this.coords[tile.x] == null) {
          this.coords[tile.x] = {};
        }
        this.coords[tile.x][tile.y] = tile;
        if (this.owner) {
          tile.container = this;
        }
        if (this.boundariesProperty.getter.calculated) {
          this._addToBondaries(tile, this.boundariesProperty.value);
        }
      }
      return this;
    }

    removeTile(tile) {
      var index;
      index = this.tiles.indexOf(tile);
      if (index > -1) {
        this.tiles.splice(index, 1);
        delete this.coords[tile.x][tile.y];
        if (this.owner) {
          tile.container = null;
        }
        if (this.boundariesProperty.getter.calculated) {
          if (this.boundaries.top === tile.y || this.boundaries.bottom === tile.y || this.boundaries.left === tile.x || this.boundaries.right === tile.x) {
            return this.boundariesProperty.invalidate();
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

},{"./TileReference":12,"spark-starter":100}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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
      change: function(val, old) {
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

},{"spark-starter":100}],14:[function(require,module,exports){
module.exports = {
  "Direction": require("./Direction"),
  "Tile": require("./Tile"),
  "TileContainer": require("./TileContainer"),
  "TileReference": require("./TileReference"),
  "Tiled": require("./Tiled"),
}
},{"./Direction":9,"./Tile":10,"./TileContainer":11,"./TileReference":12,"./Tiled":13}],15:[function(require,module,exports){
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
    toggle(val) {
      if (typeof val === "undefined") {
        val = !this.paused;
      }
      return this.paused = val;
    }

    immediateInvalidation() {
      if (this.running) {
        return this.elapsedTimeProperty.invalidate({
          preventImmediate: true,
          origin: this
        });
      }
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
      return this.propertiesManager.destroy();
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
        return !invalidator.prop(this.pausedProperty) && invalidator.propPath('timing.running') !== false;
      },
      change: function(val, old) {
        if (val) {
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
        if (invalidator.prop(this.runningProperty)) {
          setImmediate(() => {
            return this.immediateInvalidation();
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
          return this.elapsedTimeProperty.invalidate();
        }
      }
    },
    prc: {
      calcul: function(invalidator) {
        return invalidator.prop(this.elapsedTimeProperty) / this.time;
      },
      set: function(val) {
        return this.elapsedTime = this.time * val;
      }
    },
    remainingTime: {
      calcul: function(invalidator) {
        return this.time;
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

},{"_process":67,"spark-starter":100,"timers":68}],16:[function(require,module,exports){
var CollectionPropertyWatcher, Connected, Element, SignalOperation;

Element = require('spark-starter').Element;

SignalOperation = require('./SignalOperation');

CollectionPropertyWatcher = require('spark-starter').watchers.CollectionPropertyWatcher;

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

},{"./SignalOperation":18,"spark-starter":100}],17:[function(require,module,exports){
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

},{"spark-starter":100}],18:[function(require,module,exports){
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

},{"spark-starter":100}],19:[function(require,module,exports){
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

},{"./Connected":16,"./Signal":17,"./SignalOperation":18}],20:[function(require,module,exports){
var Connected, Switch;

Connected = require('./Connected');

module.exports = Switch = class Switch extends Connected {};

},{"./Connected":16}],21:[function(require,module,exports){
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
        parent = invalidation.prop(this.tileProperty);
        if (parent) {
          return invalidation.prop(parent.adjacentTilesProperty).reduce((res, tile) => {
            return res.concat(invalidation.prop(tile.childrenProperty).filter((child) => {
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
        return invalidation.prop(this.outputsProperty).reduce((out, conn) => {
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

},{"./Connected":16,"parallelio-tiles":14}],22:[function(require,module,exports){
module.exports = {
  "Connected": require("./Connected"),
  "Signal": require("./Signal"),
  "SignalOperation": require("./SignalOperation"),
  "SignalSource": require("./SignalSource"),
  "Switch": require("./Switch"),
  "Wire": require("./Wire"),
}
},{"./Connected":16,"./Signal":17,"./SignalOperation":18,"./SignalSource":19,"./Switch":20,"./Wire":21}],23:[function(require,module,exports){
const Tile = require('parallelio-tiles').Tile

class Airlock extends Tile {
  attachTo (airlock) {
    this.attachedTo = airlock
  }
};

Airlock.properties({
  direction: {},
  attachedTo: {}
})

module.exports = Airlock

},{"parallelio-tiles":14}],24:[function(require,module,exports){
const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')

class Approach extends Element {
  start () {
    if (this.valid) {
      this.moving = true
      this.subject.xMembers.addPropertyPath('position.offsetX', this)
      this.subject.yMembers.addPropertyPath('position.offsetY', this)
      this.timeout = this.timing.setTimeout(() => {
        return this.done()
      }, this.duration)
    }
  }

  done () {
    this.subject.xMembers.removeRef({
      name: 'position.offsetX',
      obj: this
    })
    this.subject.yMembers.removeRef({
      name: 'position.offsetY',
      obj: this
    })
    this.subject.x = this.targetPos.x
    this.subject.y = this.targetPos.x
    this.subjectAirlock.attachTo(this.targetAirlock)
    this.moving = false
    this.complete = true
  }
};

Approach.properties({
  timing: {
    calcul: function () {
      return new Timing()
    }
  },
  initialDist: {
    default: 500
  },
  rng: {
    default: Math.random
  },
  angle: {
    calcul: function () {
      return this.rng * Math.PI * 2
    }
  },
  startingPos: {
    calcul: function () {
      return {
        x: this.startingPos.x + this.initialDist * Math.cos(this.angle),
        y: this.startingPos.y + this.initialDist * Math.sin(this.angle)
      }
    }
  },
  targetPos: {
    calcul: function () {
      return {
        x: this.targetAirlock.x - this.subjectAirlock.x,
        y: this.targetAirlock.y - this.subjectAirlock.y
      }
    }
  },
  subject: {},
  target: {},
  valid: {
    calcul: function () {
      return this.subject != null &&
        this.target != null &&
        this.subject.airlocks.length > 0 &&
        this.target.airlocks.length > 0
    }
  },
  subjectAirlock: {
    calcul: function () {
      var airlocks
      airlocks = this.subject.airlocks.slice()
      airlocks.sort((a, b) => {
        var valA, valB
        valA = Math.abs(a.direction.x - Math.cos(this.angle)) + Math.abs(a.direction.y - Math.sin(this.angle))
        valB = Math.abs(b.direction.x - Math.cos(this.angle)) + Math.abs(b.direction.y - Math.sin(this.angle))
        return valA - valB
      })
      return airlocks[0]
    }
  },
  targetAirlock: {
    calcul: function () {
      return this.target.airlocks.find((target) => {
        return target.direction.getInverse() === this.subjectAirlock.direction
      })
    }
  },
  moving: {
    default: false
  },
  complete: {
    default: false
  },
  currentPos: {
    calcul: function (invalidator) {
      var end, prc, start
      start = invalidator.prop(this.startingPosProperty)
      end = invalidator.prop(this.targetPosProperty)
      prc = invalidator.propPath('timeout.prc') || 0
      return {
        x: (end.x - start.x) * prc + start.x,
        y: (end.y - start.y) * prc + start.y
      }
    }
  },
  duration: {
    default: 10000
  },
  timeout: {}
})

module.exports = Approach

},{"parallelio-timing":15,"spark-starter":100}],25:[function(require,module,exports){
const Door = require('./Door')
const Character = require('./Character')

class AutomaticDoor extends Door {
  updateTileMembers (old) {
    var ref, ref1, ref2, ref3
    if (old != null) {
      if ((ref = old.walkableMembers) != null) {
        ref.removeProperty(this.unlockedProperty)
      }
      if ((ref1 = old.transparentMembers) != null) {
        ref1.removeProperty(this.openProperty)
      }
    }
    if (this.tile) {
      if ((ref2 = this.tile.walkableMembers) != null) {
        ref2.addProperty(this.unlockedProperty)
      }
      return (ref3 = this.tile.transparentMembers) != null ? ref3.addProperty(this.openProperty) : null
    }
  }

  init () {
    super.init()
    return this.open
  }

  isActivatorPresent (invalidate) {
    return this.getReactiveTiles(invalidate).some((tile) => {
      var children
      children = invalidate ? invalidate.prop(tile.childrenProperty) : tile.children
      return children.some((child) => {
        return this.canBeActivatedBy(child)
      })
    })
  }

  canBeActivatedBy (elem) {
    return elem instanceof Character
  }

  getReactiveTiles (invalidate) {
    var direction, tile
    tile = invalidate ? invalidate.prop(this.tileProperty) : this.tile
    if (!tile) {
      return []
    }
    direction = invalidate ? invalidate.prop(this.directionProperty) : this.direction
    if (direction === Door.directions.horizontal) {
      return [tile, tile.getRelativeTile(0, 1), tile.getRelativeTile(0, -1)].filter(function (t) {
        return t != null
      })
    } else {
      return [tile, tile.getRelativeTile(1, 0), tile.getRelativeTile(-1, 0)].filter(function (t) {
        return t != null
      })
    }
  }
};

AutomaticDoor.properties({
  open: {
    calcul: function (invalidate) {
      return !invalidate.prop(this.lockedProperty) && this.isActivatorPresent(invalidate)
    }
  },
  locked: {
    default: false
  },
  unlocked: {
    calcul: function (invalidate) {
      return !invalidate.prop(this.lockedProperty)
    }
  }
})

module.exports = AutomaticDoor

},{"./Character":26,"./Door":31}],26:[function(require,module,exports){
const Tiled = require('parallelio-tiles').Tiled
const Damageable = require('./Damageable')
const WalkAction = require('./actions/WalkAction')
const ActionProvider = require('./actions/ActionProvider')

class Character extends Tiled {
  constructor (name) {
    super()
    this.name = name
  }

  setDefaults () {
    if (!this.tile && (this.game.mainTileContainer != null)) {
      return this.putOnRandomTile(this.game.mainTileContainer.tiles)
    }
  }

  canGoOnTile (tile) {
    return (tile != null ? tile.walkable : null) !== false
  }

  walkTo (tile) {
    var action
    action = new WalkAction({
      actor: this,
      target: tile
    })
    action.execute()
    return action
  }

  isSelectableBy (player) {
    return true
  }
};

Character.extend(Damageable)

Character.properties({
  game: {
    change: function (val, old) {
      if (this.game) {
        return this.setDefaults()
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
    calcul: function () {
      return new WalkAction({
        actor: this
      })
    }
  },
  actionProvider: {
    calcul: function (invalidator) {
      const provider = new ActionProvider({
        owner: this
      })
      provider.actionsMembers.addPropertyPath('owner.tile.actionProvider.actions')
      return provider
    }
  }
})

module.exports = Character

},{"./Damageable":30,"./actions/ActionProvider":56,"./actions/WalkAction":63,"parallelio-tiles":14}],27:[function(require,module,exports){
const TileContainer = require('parallelio-tiles').TileContainer
const VisionCalculator = require('./VisionCalculator')
const Door = require('./Door')
const WalkAction = require('./actions/WalkAction')
const AttackMoveAction = require('./actions/AttackMoveAction')
const PropertyWatcher = require('spark-starter').watchers.PropertyWatcher

class CharacterAI {
  constructor (character) {
    this.character = character
    this.nextActionCallback = () => {
      return this.nextAction()
    }
    this.visionMemory = new TileContainer()
    this.tileWatcher = new PropertyWatcher({
      callback: () => {
        return this.updateVisionMemory()
      },
      property: this.character.propertiesManager.getProperty('tile')
    })
  }

  start () {
    this.tileWatcher.bind()
    return this.nextAction()
  }

  nextAction () {
    this.updateVisionMemory()
    const enemy = this.getClosestEnemy()
    if (enemy) {
      return this.attackMoveTo(enemy).on('end', this.nextActionCallback)
    }
    const unexplored = this.getClosestUnexplored()
    if (unexplored) {
      return this.walkTo(unexplored).on('end', this.nextActionCallback)
    } else {
      this.resetVisionMemory()
      return this.walkTo(this.getClosestUnexplored()).on('end', this.nextActionCallback)
    }
  }

  updateVisionMemory () {
    var calculator
    calculator = new VisionCalculator(this.character.tile)
    calculator.calcul()
    this.visionMemory = calculator.toContainer().merge(this.visionMemory, (a, b) => {
      if (a != null) {
        a = this.analyzeTile(a)
      }
      if ((a != null) && (b != null)) {
        a.visibility = Math.max(a.visibility, b.visibility)
        return a
      } else {
        return a || b
      }
    })
  }

  analyzeTile (tile) {
    var ref
    tile.ennemySpotted = (ref = tile.getFinalTile().children) != null ? ref.find((c) => {
      return this.isEnnemy(c)
    }) : null
    tile.explorable = this.isExplorable(tile)
    return tile
  }

  isEnnemy (elem) {
    var ref
    return (ref = this.character.owner) != null ? typeof ref.isEnemy === 'function' ? ref.isEnemy(elem) : null : null
  }

  getClosestEnemy () {
    return this.visionMemory.closest(this.character.tile, (t) => {
      return t.ennemySpotted
    })
  }

  getClosestUnexplored () {
    return this.visionMemory.closest(this.character.tile, (t) => {
      return t.visibility < 1 && t.explorable
    })
  }

  isExplorable (tile) {
    var ref
    tile = tile.getFinalTile()
    return tile.walkable || ((ref = tile.children) != null ? ref.find((c) => {
      return c instanceof Door
    }) : null)
  }

  attackMoveTo (tile) {
    var action
    tile = tile.getFinalTile()
    action = new AttackMoveAction({
      actor: this.character,
      target: tile
    })
    if (action.isReady()) {
      action.execute()
      return action
    }
  }

  walkTo (tile) {
    var action
    tile = tile.getFinalTile()
    action = new WalkAction({
      actor: this.character,
      target: tile
    })
    if (action.isReady()) {
      action.execute()
      return action
    }
  }
}

module.exports = CharacterAI

},{"./Door":31,"./VisionCalculator":54,"./actions/AttackMoveAction":58,"./actions/WalkAction":63,"parallelio-tiles":14,"spark-starter":100}],28:[function(require,module,exports){
const Element = require('spark-starter').Element
const View = require('./View')
const Ship = require('./Ship')
const Approach = require('./Approach')

class Confrontation extends Element {
  start () {
    this.subject.encounter = this
    this.game.mainView = this.view
    this.game.add(this.subject.interrior)
    this.subject.interrior.container = this.view
    this.game.add(this.opponent.interrior)
    this.opponent.interrior.container = this.view
    this.approach.start()
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
    calcul: function () {
      return new View()
    }
  },
  opponent: {
    calcul: function () {
      return new Ship()
    }
  },
  approach: {
    calcul: function () {
      return new Approach({
        subject: this.opponent.interrior,
        target: this.subject.interrior
      })
    }
  }
})

module.exports = Confrontation

},{"./Approach":24,"./Ship":47,"./View":53,"spark-starter":100}],29:[function(require,module,exports){
const Element = require('spark-starter').Element
const LineOfSight = require('./LineOfSight')
const Direction = require('parallelio-tiles').Direction

class DamagePropagation extends Element {
  getTileContainer () {
    return this.tile.container
  }

  apply () {
    this.getDamaged().forEach((damage) => {
      damage.target.damage(damage.damage)
    })
  }

  getInitialTiles () {
    var ctn
    ctn = this.getTileContainer()
    return ctn.inRange(this.tile, this.range)
  }

  getInitialDamages () {
    const tiles = this.getInitialTiles()
    return tiles.reduce((damages, tile) => {
      if (tile.damageable) {
        const dmg = this.initialDamage(tile, tiles.length)
        if (dmg) {
          damages.push(dmg)
        }
      }
      return damages
    }, [])
  }

  getDamaged () {
    var added
    if (this._damaged == null) {
      added = null
      do {
        added = this.step(added)
      } while (added)
    }
    return this._damaged
  }

  step (added) {
    if (added != null) {
      if (this.extendedDamage != null) {
        added = this.extend(added)
        this._damaged = added.concat(this._damaged)
        return added.length > 0 && added
      }
    } else {
      this._damaged = this.getInitialDamages()
      return this._damaged
    }
  }

  inDamaged (target, damaged) {
    const pos = damaged.findIndex((damage) => damage.target === target)
    if (pos === -1) {
      return false
    }
    return pos
  }

  extend (damaged) {
    const ctn = this.getTileContainer()
    return damaged.reduce((added, damage) => {
      if (damage.target.x == null) {
        return added
      }
      const local = Direction.adjacents.reduce((local, dir) => {
        const tile = ctn.getTile(damage.target.x + dir.x, damage.target.y + dir.y)
        if ((tile != null) && tile.damageable && this.inDamaged(tile, this._damaged) === false) {
          local.push(tile)
        }
        return local
      }, [])
      return local.reduce((added, target) => {
        const dmg = this.extendedDamage(target, damage, local.length)
        if (dmg) {
          const existing = this.inDamaged(target, added)
          if (existing === false) {
            added.push(dmg)
          } else {
            added[existing] = this.mergeDamage(added[existing], dmg)
          }
        }
        return added
      }, added)
    }, [])
  }

  mergeDamage (d1, d2) {
    return {
      target: d1.target,
      power: d1.power + d2.power,
      damage: d1.damage + d2.damage
    }
  }

  modifyDamage (target, power) {
    if (typeof target.modifyDamage === 'function') {
      return Math.floor(target.modifyDamage(power, this.type))
    } else {
      return Math.floor(power)
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
})

DamagePropagation.Normal = class Normal extends DamagePropagation {
  initialDamage (target, nb) {
    var dmg
    dmg = this.modifyDamage(target, this.power)
    if (dmg > 0) {
      return {
        target: target,
        power: this.power,
        damage: dmg
      }
    }
  }
}

DamagePropagation.Thermic = class Thermic extends DamagePropagation {
  extendedDamage (target, last, nb) {
    var dmg, power
    power = (last.damage - 1) / 2 / nb * Math.min(1, last.target.health / last.target.maxHealth * 5)
    dmg = this.modifyDamage(target, power)
    if (dmg > 0) {
      return {
        target: target,
        power: power,
        damage: dmg
      }
    }
  }

  initialDamage (target, nb) {
    var dmg, power
    power = this.power / nb
    dmg = this.modifyDamage(target, power)
    if (dmg > 0) {
      return {
        target: target,
        power: power,
        damage: dmg
      }
    }
  }
}

DamagePropagation.Kinetic = class Kinetic extends DamagePropagation {
  extendedDamage (target, last, nb) {
    var dmg, power
    power = (last.power - last.damage) * Math.min(1, last.target.health / last.target.maxHealth * 2) - 1
    dmg = this.modifyDamage(target, power)
    if (dmg > 0) {
      return {
        target: target,
        power: power,
        damage: dmg
      }
    }
  }

  initialDamage (target, nb) {
    var dmg
    dmg = this.modifyDamage(target, this.power)
    if (dmg > 0) {
      return {
        target: target,
        power: this.power,
        damage: dmg
      }
    }
  }

  modifyDamage (target, power) {
    if (typeof target.modifyDamage === 'function') {
      return Math.floor(target.modifyDamage(power, this.type))
    } else {
      return Math.floor(power * 0.25)
    }
  }

  mergeDamage (d1, d2) {
    return {
      target: d1.target,
      power: Math.floor((d1.power + d2.power) / 2),
      damage: Math.floor((d1.damage + d2.damage) / 2)
    }
  }
}

DamagePropagation.Explosive = (function () {
  class Explosive extends DamagePropagation {
    getDamaged () {
      var angle, inside, shardPower, target
      this._damaged = []
      const shards = Math.pow(this.range + 1, 2)
      shardPower = this.power / shards
      inside = this.tile.health <= this.modifyDamage(this.tile, shardPower)
      if (inside) {
        shardPower *= 4
      }
      this._damaged = Array(...Array(shards + 1)).reduce((damaged) => {
        angle = this.rng() * Math.PI * 2
        target = this.getTileHitByShard(inside, angle)
        if (target != null) {
          damaged.push({
            target: target,
            power: shardPower,
            damage: this.modifyDamage(target, shardPower)
          })
        }
        return damaged
      }, [])
      return this._damaged
    }

    getTileHitByShard (inside, angle) {
      var ctn, dist, target, vertex
      ctn = this.getTileContainer()
      dist = this.range * this.rng()
      target = {
        x: this.tile.x + 0.5 + dist * Math.cos(angle),
        y: this.tile.y + 0.5 + dist * Math.sin(angle)
      }
      if (inside) {
        vertex = new LineOfSight(ctn, this.tile.x + 0.5, this.tile.y + 0.5, target.x, target.y)
        vertex.traversableCallback = (tile) => {
          return !inside || ((tile != null) && this.traversableCallback(tile))
        }
        return vertex.getEndPoint().tile
      } else {
        return ctn.getTile(Math.floor(target.x), Math.floor(target.y))
      }
    }
  };

  Explosive.properties({
    rng: {
      default: Math.random
    },
    traversableCallback: {
      default: function (tile) {
        return !(typeof tile.getSolid === 'function' && tile.getSolid())
      }
    }
  })

  return Explosive
}.call(this))

module.exports = DamagePropagation

},{"./LineOfSight":37,"parallelio-tiles":14,"spark-starter":100}],30:[function(require,module,exports){
const Element = require('spark-starter').Element

class Damageable extends Element {
  damage (val) {
    this.health = Math.max(0, this.health - val)
  }

  whenNoHealth () {}
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
    change: function () {
      if (this.health <= 0) {
        return this.whenNoHealth()
      }
    }
  }
})

module.exports = Damageable

},{"spark-starter":100}],31:[function(require,module,exports){
const Tiled = require('parallelio-tiles').Tiled

const directions = {
  horizontal: 'horizontal',
  vertical: 'vertical'
}

class Door extends Tiled {
  updateTileMembers (old) {
    var ref, ref1, ref2, ref3
    if (old != null) {
      if ((ref = old.walkableMembers) != null) {
        ref.removeProperty(this.openProperty)
      }
      if ((ref1 = old.transparentMembers) != null) {
        ref1.removeProperty(this.openProperty)
      }
    }
    if (this.tile) {
      if ((ref2 = this.tile.walkableMembers) != null) {
        ref2.addProperty(this.openProperty)
      }
      return (ref3 = this.tile.transparentMembers) != null ? ref3.addProperty(this.openProperty) : null
    }
  }
};

Door.properties({
  tile: {
    change: function (val, old) {
      return this.updateTileMembers(old)
    }
  },
  open: {
    default: false
  },
  direction: {
    default: directions.horizontal
  }
})

Door.directions = directions

module.exports = Door

},{"parallelio-tiles":14}],32:[function(require,module,exports){
module.exports = require('spark-starter').Element

},{"spark-starter":100}],33:[function(require,module,exports){
const Element = require('spark-starter').Element
const PropertyWatcher = require('spark-starter').watchers.PropertyWatcher
const Confrontation = require('./Confrontation')

class EncounterManager extends Element {
  init () {
    return this.locationWatcher.bind()
  }

  testEncounter () {
    if (this.rng() <= this.baseProbability) {
      return this.startEncounter()
    }
  }

  startEncounter () {
    var encounter
    encounter = new Confrontation({
      subject: this.subject,
      game: this.game
    })
    return encounter.start()
  }
};

EncounterManager.properties({
  subject: {
    default: null
  },
  game: {
    default: null
  },
  baseProbability: {
    default: 0.2
  },
  locationWatcher: {
    calcul: function () {
      return new PropertyWatcher({
        callback: () => {
          return this.testEncounter()
        },
        property: this.subject.propertiesManager.getProperty('location')
      })
    }
  },
  rng: {
    default: Math.random
  }
})

module.exports = EncounterManager

},{"./Confrontation":28,"spark-starter":100}],34:[function(require,module,exports){
const Tile = require('parallelio-tiles').Tile

class Floor extends Tile {};

Floor.properties({
  walkable: {
    composed: true
  },
  transparent: {
    composed: true
  }
})

module.exports = Floor

},{"parallelio-tiles":14}],35:[function(require,module,exports){
const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')
const View = require('./View')
const Player = require('./Player')

class Game extends Element {
  start () {
    return this.currentPlayer
  }

  add (elem) {
    elem.game = this
    return elem
  }
};

Game.properties({
  timing: {
    calcul: function () {
      return new Timing()
    }
  },
  mainView: {
    calcul: function () {
      if (this.views.length > 0) {
        return this.views.get(0)
      } else {
        const ViewClass = this.defaultViewClass
        return this.add(new ViewClass())
      }
    }
  },
  views: {
    collection: true
  },
  currentPlayer: {
    calcul: function () {
      if (this.players.length > 0) {
        return this.players.get(0)
      } else {
        const PlayerClass = this.defaultPlayerClass
        return this.add(new PlayerClass())
      }
    }
  },
  players: {
    collection: true
  }
})

Game.prototype.defaultViewClass = View

Game.prototype.defaultPlayerClass = Player

module.exports = Game

},{"./Player":42,"./View":53,"parallelio-timing":15,"spark-starter":100}],36:[function(require,module,exports){
const Collection = require('spark-starter').Collection

class Inventory extends Collection {
  getByType (type) {
    var res
    res = this.filter(function (r) {
      return r.type === type
    })
    if (res.length) {
      return res[0]
    }
  }

  addByType (type, qte, partial = false) {
    var ressource
    ressource = this.getByType(type)
    if (!ressource) {
      ressource = this.initRessource(type)
    }
    if (partial) {
      ressource.partialChange(ressource.qte + qte)
    } else {
      ressource.qte += qte
    }
  }

  initRessource (type, opt) {
    return type.initRessource(opt)
  }
}

module.exports = Inventory

},{"spark-starter":100}],37:[function(require,module,exports){
class LineOfSight {
  constructor (tiles, x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
    this.tiles = tiles
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }

  setX1 (val) {
    this.x1 = val
    return this.invalidade()
  }

  setY1 (val) {
    this.y1 = val
    return this.invalidade()
  }

  setX2 (val) {
    this.x2 = val
    return this.invalidade()
  }

  setY2 (val) {
    this.y2 = val
    return this.invalidade()
  }

  invalidade () {
    this.endPoint = null
    this.success = null
    this.calculated = false
  }

  testTile (tile, entryX, entryY) {
    if (this.traversableCallback != null) {
      return this.traversableCallback(tile, entryX, entryY)
    } else {
      return (tile != null) && (typeof tile.getTransparent === 'function' ? tile.getTransparent() : tile.transparent != null ? tile.transparent : true)
    }
  }

  testTileAt (x, y, entryX, entryY) {
    return this.testTile(this.tiles.getTile(Math.floor(x), Math.floor(y)), entryX, entryY)
  }

  reverseTracing () {
    var tmpX, tmpY
    tmpX = this.x1
    tmpY = this.y1
    this.x1 = this.x2
    this.y1 = this.y2
    this.x2 = tmpX
    this.y2 = tmpY
    this.reversed = !this.reversed
  }

  calcul () {
    var nextX, nextY, positiveX, positiveY, ratio, tileX, tileY, total, x, y
    ratio = (this.x2 - this.x1) / (this.y2 - this.y1)
    total = Math.abs(this.x2 - this.x1) + Math.abs(this.y2 - this.y1)
    positiveX = (this.x2 - this.x1) >= 0
    positiveY = (this.y2 - this.y1) >= 0
    tileX = x = this.x1
    tileY = y = this.y1
    if (this.reversed) {
      tileX = positiveX ? x : Math.ceil(x) - 1
      tileY = positiveY ? y : Math.ceil(y) - 1
    }
    while (total > Math.abs(x - this.x1) + Math.abs(y - this.y1) && this.testTileAt(tileX, tileY, x, y)) {
      nextX = positiveX ? Math.floor(x) + 1 : Math.ceil(x) - 1
      nextY = positiveY ? Math.floor(y) + 1 : Math.ceil(y) - 1
      if (this.x2 - this.x1 === 0) {
        y = nextY
      } else if (this.y2 - this.y1 === 0) {
        x = nextX
      } else if (Math.abs((nextX - x) / (this.x2 - this.x1)) < Math.abs((nextY - y) / (this.y2 - this.y1))) {
        x = nextX
        y = (nextX - this.x1) / ratio + this.y1
      } else {
        x = (nextY - this.y1) * ratio + this.x1
        y = nextY
      }
      tileX = positiveX ? x : Math.ceil(x) - 1
      tileY = positiveY ? y : Math.ceil(y) - 1
    }
    if (total <= Math.abs(x - this.x1) + Math.abs(y - this.y1)) {
      this.endPoint = {
        x: this.x2,
        y: this.y2,
        tile: this.tiles.getTile(Math.floor(this.x2), Math.floor(this.y2))
      }
      this.success = true
    } else {
      this.endPoint = {
        x: x,
        y: y,
        tile: this.tiles.getTile(Math.floor(tileX), Math.floor(tileY))
      }
      this.success = false
    }
  }

  forceSuccess () {
    this.endPoint = {
      x: this.x2,
      y: this.y2,
      tile: this.tiles.getTile(Math.floor(this.x2), Math.floor(this.y2))
    }
    this.success = true
    this.calculated = true
    return true
  }

  getSuccess () {
    if (!this.calculated) {
      this.calcul()
    }
    return this.success
  }

  getEndPoint () {
    if (!this.calculated) {
      this.calcul()
    }
    return this.endPoint
  }
}

module.exports = LineOfSight

},{}],38:[function(require,module,exports){
const Element = require('spark-starter').Element

class Map extends Element {
  _addToBondaries (location, boundaries) {
    if ((boundaries.top == null) || location.y < boundaries.top) {
      boundaries.top = location.y
    }
    if ((boundaries.left == null) || location.x < boundaries.left) {
      boundaries.left = location.x
    }
    if ((boundaries.bottom == null) || location.y > boundaries.bottom) {
      boundaries.bottom = location.y
    }
    if ((boundaries.right == null) || location.x > boundaries.right) {
      boundaries.right = location.x
    }
  }
};

Map.properties({
  locations: {
    collection: {
      closest: function (x, y) {
        var min, minDist
        min = null
        minDist = null
        this.forEach(function (location) {
          var dist
          dist = location.dist(x, y)
          if ((min == null) || minDist > dist) {
            min = location
            minDist = dist
          }
        })
        return min
      },
      closests: function (x, y) {
        var dists
        dists = this.map(function (location) {
          return {
            dist: location.dist(x, y),
            location: location
          }
        })
        dists.sort(function (a, b) {
          return a.dist - b.dist
        })
        return this.copy(dists.map(function (dist) {
          return dist.location
        }))
      }
    }
  },
  boundaries: {
    calcul: function () {
      var boundaries
      boundaries = {
        top: null,
        left: null,
        bottom: null,
        right: null
      }
      this.locations.forEach((location) => {
        return this._addToBondaries(location, boundaries)
      })
      return boundaries
    },
    output: function (val) {
      return Object.assign({}, val)
    }
  }
})

module.exports = Map

},{"spark-starter":100}],39:[function(require,module,exports){
const Tiled = require('parallelio-tiles').Tiled

class Obstacle extends Tiled {
  updateWalkables (old) {
    var ref, ref1
    if (old != null) {
      if ((ref = old.walkableMembers) != null) {
        ref.removeRef({
          name: 'walkable',
          obj: this
        })
      }
    }
    if (this.tile) {
      return (ref1 = this.tile.walkableMembers) != null ? ref1.setValueRef(false, 'walkable', this) : null
    }
  }
};

Obstacle.properties({
  tile: {
    change: function (val, old, overrided) {
      overrided(old)
      return this.updateWalkables(old)
    }
  }
})

module.exports = Obstacle

},{"parallelio-tiles":14}],40:[function(require,module,exports){
const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')
const EventEmitter = require('events')

class PathWalk extends Element {
  constructor (walker, path, options) {
    super(options)
    this.walker = walker
    this.path = path
  }

  start () {
    if (!this.path.solution) {
      this.path.calcul()
    }
    if (this.path.solution) {
      this.pathTimeout = this.timing.setTimeout(() => {
        return this.finish()
      }, this.totalTime)
      this.walker.tileMembers.addPropertyPath('position.tile', this)
      this.walker.offsetXMembers.addPropertyPath('position.offsetX', this)
      return this.walker.offsetYMembers.addPropertyPath('position.offsetY', this)
    }
  }

  stop () {
    return this.pathTimeout.pause()
  }

  finish () {
    this.walker.tile = this.position.tile
    this.walker.offsetX = this.position.offsetX
    this.walker.offsetY = this.position.offsetY
    this.emit('finished')
    return this.end()
  }

  interrupt () {
    this.emit('interrupted')
    return this.end()
  }

  end () {
    this.emit('end')
    return this.destroy()
  }

  destroy () {
    if (this.walker.walk === this) {
      this.walker.walk = null
    }
    this.walker.tileMembers.removeRef({
      name: 'position.tile',
      obj: this
    })
    this.walker.offsetXMembers.removeRef({
      name: 'position.offsetX',
      obj: this
    })
    this.walker.offsetYMembers.removeRef({
      name: 'position.offsetY',
      obj: this
    })
    this.pathTimeout.destroy()
    this.propertiesManager.destroy()
    return this.removeAllListeners()
  }
};

PathWalk.include(EventEmitter.prototype)

PathWalk.properties({
  speed: {
    default: 5
  },
  timing: {
    calcul: function () {
      var ref
      if ((ref = this.walker.game) != null ? ref.timing : null) {
        return this.walker.game.timing
      } else {
        return new Timing()
      }
    }
  },
  pathLength: {
    calcul: function () {
      return this.path.solution.getTotalLength()
    }
  },
  totalTime: {
    calcul: function () {
      return this.pathLength / this.speed * 1000
    }
  },
  position: {
    calcul: function (invalidator) {
      return this.path.getPosAtPrc(invalidator.propPath('pathTimeout.prc') || 0)
    }
  }
})

module.exports = PathWalk

},{"events":66,"parallelio-timing":15,"spark-starter":100}],41:[function(require,module,exports){
const Element = require('spark-starter').Element
const LineOfSight = require('./LineOfSight')
const Timing = require('parallelio-timing')

class PersonalWeapon extends Element {
  canBeUsed () {
    return this.charged
  }

  canUseOn (target) {
    return this.canUseFrom(this.user.tile, target)
  }

  canUseFrom (tile, target) {
    if (this.range === 1) {
      return this.inMeleeRange(tile, target)
    } else {
      return this.inRange(tile, target) && this.hasLineOfSight(tile, target)
    }
  }

  inRange (tile, target) {
    var ref, targetTile
    targetTile = target.tile || target
    return ((ref = tile.dist(targetTile)) != null ? ref.length : null) <= this.range
  }

  inMeleeRange (tile, target) {
    var targetTile
    targetTile = target.tile || target
    return Math.abs(targetTile.x - tile.x) + Math.abs(targetTile.y - tile.y) === 1
  }

  hasLineOfSight (tile, target) {
    var los, targetTile
    targetTile = target.tile || target
    los = new LineOfSight(targetTile.container, tile.x + 0.5, tile.y + 0.5, targetTile.x + 0.5, targetTile.y + 0.5)
    los.traversableCallback = function (tile) {
      return tile.walkable
    }
    return los.getSuccess()
  }

  useOn (target) {
    if (this.canBeUsed()) {
      target.damage(this.power)
      this.charged = false
      return this.recharge()
    }
  }

  recharge () {
    this.charging = true
    this.chargeTimeout = this.timing.setTimeout(() => {
      this.charging = false
      return this.recharged()
    }, this.rechargeTime)
  }

  recharged () {
    this.charged = true
  }

  destroy () {
    if (this.chargeTimeout) {
      return this.chargeTimeout.destroy()
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
    calcul: function (invalidator) {
      return invalidator.prop(this.powerProperty) / invalidator.prop(this.rechargeTimeProperty) * 1000
    }
  },
  range: {
    default: 10
  },
  user: {
    default: null
  },
  timing: {
    calcul: function () {
      return new Timing()
    }
  }
})

module.exports = PersonalWeapon

},{"./LineOfSight":37,"parallelio-timing":15,"spark-starter":100}],42:[function(require,module,exports){
const Element = require('spark-starter').Element

class Player extends Element {
  setDefaults () {
    var first
    first = this.game.players.length === 0
    this.game.players.add(this)
    if (first && !this.controller && this.game.defaultPlayerControllerClass) {
      const PlayerControllerClass = this.game.defaultPlayerControllerClass
      this.controller = new PlayerControllerClass()
    }
  }

  canTargetActionOn (elem) {
    var action, ref
    action = this.selectedAction || ((ref = this.selected) != null ? ref.defaultAction : null)
    return (action != null) && typeof action.canTarget === 'function' && action.canTarget(elem)
  }

  guessActionTarget (action) {
    var selected
    selected = this.selected
    if (typeof action.canTarget === 'function' && (action.target == null) && action.actor !== selected && action.canTarget(selected)) {
      return action.withTarget(selected)
    } else {
      return action
    }
  }

  canSelect (elem) {
    return typeof elem.isSelectableBy === 'function' && elem.isSelectableBy(this)
  }

  canFocusOn (elem) {
    if (typeof elem.IsFocusableBy === 'function') {
      return elem.IsFocusableBy(this)
    } else if (typeof elem.IsSelectableBy === 'function') {
      return elem.IsSelectableBy(this)
    }
  }

  selectAction (action) {
    if (action.isReady()) {
      action.start()
    } else {
      this.selectedAction = action
    }
  }

  setActionTarget (elem) {
    var action
    action = this.selectedAction || (this.selected != null ? this.selected.defaultAction : null)
    action = action.withTarget(elem)
    if (action.isReady()) {
      action.start()
      this.selectedAction = null
    } else {
      this.selectedAction = action
    }
  }
};

Player.properties({
  name: {
    default: 'Player'
  },
  focused: {},
  selected: {
    change: function (val, old) {
      if (old != null && old.propertiesManager != null && old.propertiesManager.getProperty('selected')) {
        old.selected = false
      }
      if (val != null && val.propertiesManager != null && val.propertiesManager.getProperty('selected')) {
        val.selected = this
      }
    }
  },
  globalActionProviders: {
    collection: true
  },
  actionProviders: {
    calcul: function (invalidator) {
      var res, selected
      res = invalidator.prop(this.globalActionProvidersProperty).toArray()
      selected = invalidator.prop(this.selectedProperty)
      if (selected && selected.actionProvider) {
        res.push(selected.actionProvider)
      }
      return res
    }
  },
  availableActions: {
    calcul: function (invalidator) {
      return invalidator.prop(this.actionProvidersProperty).reduce((res, provider) => {
        var actions, selected
        actions = invalidator.prop(provider.actionsProperty).toArray()
        selected = invalidator.prop(this.selectedProperty)
        if (selected != null) {
          actions = actions.map((action) => {
            return this.guessActionTarget(action)
          })
        }
        if (actions) {
          return res.concat(actions)
        } else {
          return res
        }
      }, [])
    }
  },
  selectedAction: {},
  controller: {
    change: function (val, old) {
      if (this.controller) {
        this.controller.player = this
      }
    }
  },
  game: {
    change: function (val, old) {
      if (this.game) {
        return this.setDefaults()
      }
    }
  }
})

module.exports = Player

},{"spark-starter":100}],43:[function(require,module,exports){
const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')

class Projectile extends Element {
  constructor (options) {
    super(options)
    this.init()
  }

  init () {}

  launch () {
    this.moving = true
    this.pathTimeout = this.timing.setTimeout(() => {
      this.deliverPayload()
      this.moving = false
    }, this.pathLength / this.speed * 1000)
  }

  deliverPayload () {
    const PropagationType = this.propagationType
    const payload = new PropagationType({
      tile: this.target.tile || this.target,
      power: this.power,
      range: this.blastRange
    })
    payload.apply()
    this.payloadDelivered()
    return payload
  }

  payloadDelivered () {
    return this.destroy()
  }

  destroy () {
    return this.propertiesManager.destroy()
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
    calcul: function () {
      var dist
      if ((this.originTile != null) && (this.targetTile != null)) {
        dist = this.originTile.dist(this.targetTile)
        if (dist) {
          return dist.length
        }
      }
      return 100
    }
  },
  originTile: {
    calcul: function (invalidator) {
      var origin
      origin = invalidator.prop(this.originProperty)
      if (origin != null) {
        return origin.tile || origin
      }
    }
  },
  targetTile: {
    calcul: function (invalidator) {
      var target
      target = invalidator.prop(this.targetProperty)
      if (target != null) {
        return target.tile || target
      }
    }
  },
  container: {
    calcul: function (invalidate) {
      var originTile, targetTile
      originTile = invalidate.prop(this.originTileProperty)
      targetTile = invalidate.prop(this.targetTileProperty)
      if (originTile.container === targetTile.container) {
        return originTile.container
      } else if (invalidate.prop(this.prcPathProperty) > 0.5) {
        return targetTile.container
      } else {
        return originTile.container
      }
    }
  },
  x: {
    calcul: function (invalidate) {
      var startPos
      startPos = invalidate.prop(this.startPosProperty)
      return (invalidate.prop(this.targetPosProperty).x - startPos.x) * invalidate.prop(this.prcPathProperty) + startPos.x
    }
  },
  y: {
    calcul: function (invalidate) {
      var startPos
      startPos = invalidate.prop(this.startPosProperty)
      return (invalidate.prop(this.targetPosProperty).y - startPos.y) * invalidate.prop(this.prcPathProperty) + startPos.y
    }
  },
  startPos: {
    calcul: function (invalidate) {
      var container, dist, offset, originTile
      originTile = invalidate.prop(this.originTileProperty)
      container = invalidate.prop(this.containerProperty)
      offset = this.startOffset
      if (originTile.container !== container) {
        dist = container.dist(originTile.container)
        offset.x += dist.x
        offset.y += dist.y
      }
      return {
        x: originTile.x + offset.x,
        y: originTile.y + offset.y
      }
    },
    output: function (val) {
      return Object.assign({}, val)
    }
  },
  targetPos: {
    calcul: function (invalidate) {
      var container, dist, offset, targetTile
      targetTile = invalidate.prop(this.targetTileProperty)
      container = invalidate.prop(this.containerProperty)
      offset = this.targetOffset
      if (targetTile.container !== container) {
        dist = container.dist(targetTile.container)
        offset.x += dist.x
        offset.y += dist.y
      }
      return {
        x: targetTile.x + offset.x,
        y: targetTile.y + offset.y
      }
    },
    output: function (val) {
      return Object.assign({}, val)
    }
  },
  startOffset: {
    default: {
      x: 0.5,
      y: 0.5
    },
    output: function (val) {
      return Object.assign({}, val)
    }
  },
  targetOffset: {
    default: {
      x: 0.5,
      y: 0.5
    },
    output: function (val) {
      return Object.assign({}, val)
    }
  },
  prcPath: {
    calcul: function () {
      var ref
      return ((ref = this.pathTimeout) != null ? ref.prc : null) || 0
    }
  },
  timing: {
    calcul: function () {
      return new Timing()
    }
  },
  moving: {
    default: false
  }
})

module.exports = Projectile

},{"parallelio-timing":15,"spark-starter":100}],44:[function(require,module,exports){
const Element = require('spark-starter').Element

class Ressource extends Element {
  partialChange (qte) {
    var acceptable
    acceptable = Math.max(this.minQte, Math.min(this.maxQte, qte))
    this.qte = acceptable
    return qte - acceptable
  }
};

Ressource.properties({
  type: {
    default: null
  },
  qte: {
    default: 0,
    ingest: function (qte) {
      if (this.maxQte !== null && qte > this.maxQte) {
        throw new Error('Cant have more than ' + this.maxQte + ' of ' + this.type.name)
      }
      if (this.minQte !== null && qte < this.minQte) {
        throw new Error('Cant have less than ' + this.minQte + ' of ' + this.type.name)
      }
      return qte
    }
  },
  maxQte: {
    default: null
  },
  minQte: {
    default: 0
  }
})

module.exports = Ressource

},{"spark-starter":100}],45:[function(require,module,exports){
const Element = require('spark-starter').Element
const Ressource = require('./Ressource')

class RessourceType extends Element {
  initRessource (opt) {
    if (typeof opt !== 'object') {
      opt = {
        qte: opt
      }
    }
    opt = Object.assign({}, this.defaultOptions, opt)
    const RessourceClass = this.ressourceClass
    return new RessourceClass(opt)
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
})

module.exports = RessourceType

},{"./Ressource":44,"spark-starter":100}],46:[function(require,module,exports){
var indexOf = [].indexOf
const Element = require('spark-starter').Element
const TileContainer = require('parallelio-tiles').TileContainer
const Tile = require('parallelio-tiles').Tile
const Direction = require('parallelio-tiles').Direction
const Door = require('./Door')

class RoomGenerator extends Element {
  initTiles () {
    this.finalTiles = null
    this.rooms = []
    this.free = this.tileContainer.allTiles().filter((tile) => {
      var direction, k, len, next, ref
      ref = Direction.all
      for (k = 0, len = ref.length; k < len; k++) {
        direction = ref[k]
        next = this.tileContainer.getTile(tile.x + direction.x, tile.y + direction.y)
        if (next == null) {
          return false
        }
      }
      return true
    })
  }

  calcul () {
    this.initTiles()
    while (this.step() || this.newRoom()) {}
    this.createDoors()
    this.makeFinalTiles()
  }

  floorFactory (opt) {
    return new Tile(opt.x, opt.y)
  }

  doorFactory (opt) {
    return this.floorFactory(opt)
  }

  makeFinalTiles () {
    this.finalTiles = this.tileContainer.allTiles().map((tile) => {
      var opt
      if (tile.factory != null) {
        opt = {
          x: tile.x,
          y: tile.y
        }
        if (tile.factoryOptions != null) {
          opt = Object.assign(opt, tile.factoryOptions)
        }
        return tile.factory(opt)
      }
    }).filter((tile) => {
      return tile != null
    })
  }

  getTiles () {
    if (this.finalTiles == null) {
      this.calcul()
    }
    return this.finalTiles
  }

  newRoom () {
    if (this.free.length) {
      this.volume = Math.floor(this.rng() * (this.maxVolume - this.minVolume)) + this.minVolume
      this.room = new RoomGenerator.Room()
      return this.room
    }
  }

  randomDirections () {
    var i, j, o, x
    o = Direction.adjacents.slice()
    j = null
    x = null
    i = o.length
    while (i) {
      j = Math.floor(this.rng() * i)
      x = o[--i]
      o[i] = o[j]
      o[j] = x
    }
    return o
  }

  step () {
    var success, tries
    if (this.room) {
      if (this.free.length && this.room.tiles.length < this.volume - 1) {
        if (this.room.tiles.length) {
          tries = this.randomDirections()
          success = false
          while (tries.length && !success) {
            success = this.expand(this.room, tries.pop(), this.volume)
          }
          if (!success) {
            this.roomDone()
          }
          return success
        } else {
          this.allocateTile(this.randomFreeTile(), this.room)
          return true
        }
      } else {
        this.roomDone()
        return false
      }
    }
  }

  roomDone () {
    this.rooms.push(this.room)
    this.allocateWalls(this.room)
    this.room = null
  }

  expand (room, direction, max = 0) {
    var k, len, next, ref, second, success, tile
    success = false
    ref = room.tiles
    for (k = 0, len = ref.length; k < len; k++) {
      tile = ref[k]
      if (max === 0 || room.tiles.length < max) {
        next = this.tileOffsetIsFree(tile, direction)
        if (next) {
          this.allocateTile(next, room)
          success = true
        }
        if ((second = this.tileOffsetIsFree(tile, direction, 2)) && !this.tileOffsetIsFree(tile, direction, 3)) {
          this.allocateTile(second, room)
        }
      }
    }
    return success
  }

  allocateWalls (room) {
    var direction, k, len, next, nextRoom, otherSide, ref, results, tile
    ref = room.tiles
    results = []
    for (k = 0, len = ref.length; k < len; k++) {
      tile = ref[k]
      results.push(function () {
        var l, len1, ref1, results1
        ref1 = Direction.all
        results1 = []
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          direction = ref1[l]
          next = this.tileContainer.getTile(tile.x + direction.x, tile.y + direction.y)
          if ((next != null) && next.room !== room) {
            if (indexOf.call(Direction.corners, direction) < 0) {
              otherSide = this.tileContainer.getTile(tile.x + direction.x * 2, tile.y + direction.y * 2)
              nextRoom = (otherSide != null ? otherSide.room : null) != null ? otherSide.room : null
              room.addWall(next, nextRoom)
              if (nextRoom != null) {
                nextRoom.addWall(next, room)
              }
            }
            if (this.wallFactory) {
              next.factory = (opt) => {
                return this.wallFactory(opt)
              }
              next.factory.base = this.wallFactory
            }
            results1.push(this.allocateTile(next))
          } else {
            results1.push(null)
          }
        }
        return results1
      }.call(this))
    }
    return results
  }

  createDoors () {
    var adjacent, door, k, len, ref, results, room, walls
    ref = this.rooms
    results = []
    for (k = 0, len = ref.length; k < len; k++) {
      room = ref[k]
      results.push(function () {
        var l, len1, ref1, results1
        ref1 = room.wallsByRooms()
        results1 = []
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          walls = ref1[l]
          if ((walls.room != null) && room.doorsForRoom(walls.room) < 1) {
            door = walls.tiles[Math.floor(this.rng() * walls.tiles.length)]
            door.factory = (opt) => {
              return this.doorFactory(opt)
            }
            door.factory.base = this.doorFactory
            adjacent = this.tileContainer.getTile(door.x + 1, door.y)
            door.factoryOptions = {
              direction: adjacent.factory && adjacent.factory.base === this.floorFactory ? Door.directions.vertical : Door.directions.horizontal
            }
            room.addDoor(door, walls.room)
            results1.push(walls.room.addDoor(door, room))
          } else {
            results1.push(null)
          }
        }
        return results1
      }.call(this))
    }
    return results
  }

  allocateTile (tile, room = null) {
    var index
    if (room != null) {
      room.addTile(tile)
      tile.factory = (opt) => {
        return this.floorFactory(opt)
      }
      tile.factory.base = this.floorFactory
    }
    index = this.free.indexOf(tile)
    if (index > -1) {
      return this.free.splice(index, 1)
    }
  }

  tileOffsetIsFree (tile, direction, multiply = 1) {
    return this.tileIsFree(tile.x + direction.x * multiply, tile.y + direction.y * multiply)
  }

  tileIsFree (x, y) {
    var tile
    tile = this.tileContainer.getTile(x, y)
    if ((tile != null) && indexOf.call(this.free, tile) >= 0) {
      return tile
    } else {
      return false
    }
  }

  randomFreeTile () {
    return this.free[Math.floor(this.rng() * this.free.length)]
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
    calcul: function () {
      const tiles = new TileContainer()
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          tiles.addTile(new Tile(x, y))
        }
      }
      return tiles
    }
  }
})

RoomGenerator.Room = class Room {
  constructor () {
    this.tiles = []
    this.walls = []
    this.doors = []
  }

  addTile (tile) {
    this.tiles.push(tile)
    tile.room = this
  }

  containsWall (tile) {
    var k, len, ref, wall
    ref = this.walls
    for (k = 0, len = ref.length; k < len; k++) {
      wall = ref[k]
      if (wall.tile === tile) {
        return wall
      }
    }
    return false
  }

  addWall (tile, nextRoom) {
    var existing
    existing = this.containsWall(tile)
    if (existing) {
      existing.nextRoom = nextRoom
    } else {
      this.walls.push({
        tile: tile,
        nextRoom: nextRoom
      })
    }
  }

  wallsByRooms () {
    var k, len, pos, ref, res, rooms, wall
    rooms = []
    res = []
    ref = this.walls
    for (k = 0, len = ref.length; k < len; k++) {
      wall = ref[k]
      pos = rooms.indexOf(wall.nextRoom)
      if (pos === -1) {
        pos = rooms.length
        rooms.push(wall.nextRoom)
        res.push({
          room: wall.nextRoom,
          tiles: []
        })
      }
      res[pos].tiles.push(wall.tile)
    }
    return res
  }

  addDoor (tile, nextRoom) {
    return this.doors.push({
      tile: tile,
      nextRoom: nextRoom
    })
  }

  doorsForRoom (room) {
    return this.doors
      .filter((door) => door.nextRoom === room)
      .map((door) => door.tile)
  }
}

module.exports = RoomGenerator

},{"./Door":31,"parallelio-tiles":14,"spark-starter":100}],47:[function(require,module,exports){
const Element = require('spark-starter').Element
const Travel = require('./Travel')
const TravelAction = require('./actions/TravelAction')
const ActionProvider = require('./actions/ActionProvider')
const ShipInterior = require('./ShipInterior')

class Ship extends Element {
  travelTo (location) {
    var travel
    travel = new Travel({
      traveller: this,
      startLocation: this.location,
      targetLocation: location
    })
    if (travel.valid) {
      travel.start()
      this.travel = travel
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
  interrior: {
    calcul: function () {
      return new ShipInterior({ ship: this })
    }
  },
  actionProvider: {
    calcul: function () {
      const provider = new ActionProvider({
        owner: this
      })
      provider.actionsMembers.add(new TravelAction({
        actor: this
      }))
      return provider
    }
  },
  spaceCoodinate: {
    calcul: function (invalidator) {
      if (invalidator.prop(this.travelProperty)) {
        return invalidator.propPath('travel.spaceCoodinate')
      } else {
        return {
          x: invalidator.propPath('location.x'),
          y: invalidator.propPath('location.y')
        }
      }
    }
  }
})

module.exports = Ship

},{"./ShipInterior":48,"./Travel":52,"./actions/ActionProvider":56,"./actions/TravelAction":62,"spark-starter":100}],48:[function(require,module,exports){
const Tile = require('parallelio-tiles').Tile
const TileContainer = require('parallelio-tiles').TileContainer
const DefaultGenerator = require('./RoomGenerator')
const Floor = require('./Floor')
const Door = require('./AutomaticDoor')

class ShipInterior extends TileContainer {
  setDefaults () {
    if (!(this.tiles.length > 0)) {
      this.generate()
    }
    if (this.game.mainTileContainer == null) {
      this.game.mainTileContainer = this
    }
  }

  generate (generator) {
    generator = generator || (new ShipInterior.Generator()).tap(function () {})
    generator.getTiles().forEach((tile) => {
      this.addTile(tile)
    })
  }
}

ShipInterior.properties({
  container: {},
  ship: {},
  game: {
    change: function (val, old) {
      if (val) {
        return this.setDefaults()
      }
    }
  },
  airlocks: {
    collection: true,
    calcul: function () {
      this.allTiles().filter((t) => typeof t.attachTo === 'function')
    }
  }
})

ShipInterior.Generator = class Generator extends DefaultGenerator {
  wallFactory (opt) {
    return (new Tile(opt.x, opt.y)).tap(function () {
      this.walkable = false
    })
  }

  floorFactory (opt) {
    return new Floor(opt.x, opt.y)
  }

  doorFactory (opt) {
    return (new Floor(opt.x, opt.y)).tap(function () {
      this.addChild(new Door({
        direction: opt.direction
      }))
    })
  }
}

module.exports = ShipInterior

},{"./AutomaticDoor":25,"./Floor":34,"./RoomGenerator":46,"parallelio-tiles":14}],49:[function(require,module,exports){
const Tiled = require('parallelio-tiles').Tiled
const Timing = require('parallelio-timing')
const Damageable = require('./Damageable')
const Projectile = require('./Projectile')

class ShipWeapon extends Tiled {
  fire () {
    var projectile
    if (this.canFire) {
      const ProjectileClass = this.projectileClass
      projectile = new ProjectileClass({
        origin: this,
        target: this.target,
        power: this.power,
        blastRange: this.blastRange,
        propagationType: this.propagationType,
        speed: this.projectileSpeed,
        timing: this.timing
      })
      projectile.launch()
      this.charged = false
      this.recharge()
      return projectile
    }
  }

  recharge () {
    this.charging = true
    this.chargeTimeout = this.timing.setTimeout(() => {
      this.charging = false
      return this.recharged()
    }, this.rechargeTime)
  }

  recharged () {
    this.charged = true
    if (this.autoFire) {
      return this.fire()
    }
  }
};

ShipWeapon.extend(Damageable)

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
    change: function () {
      if (this.autoFire) {
        return this.fire()
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
    get: function () {
      return this.target && this.enabled && this.charged && this.health / this.maxHealth >= this.criticalHealth
    }
  },
  timing: {
    calcul: function () {
      return new Timing()
    }
  },
  projectileClass: {
    default: Projectile
  }
})

module.exports = ShipWeapon

},{"./Damageable":30,"./Projectile":43,"parallelio-tiles":14,"parallelio-timing":15}],50:[function(require,module,exports){
const Element = require('spark-starter').Element
const Map = require('./Map')
const StarSystem = require('./StarSystem')
const starNames = require('parallelio-strings').starNames

class StarMapGenerator extends Element {
  constructor (options) {
    super()
    this.opt = Object.assign({}, this.defOpt, options)
  }

  generate () {
    const MapClass = this.opt.mapClass
    this.map = new MapClass()
    this.stars = this.map.locations.copy()
    this.links = []
    this.createStars(this.opt.nbStars)
    this.makeLinks()
    return this.map
  }

  createStars (nb) {
    return Array.from(Array(nb), () => this.createStar())
  }

  createStar (opt = {}) {
    var name, pos, star
    if (!(opt.x && opt.y)) {
      pos = this.randomStarPos()
      if (pos != null) {
        opt = Object.assign({}, opt, {
          x: pos.x,
          y: pos.y
        })
      } else {
        return null
      }
    }
    if (!opt.name) {
      name = this.randomStarName()
      if (name != null) {
        opt = Object.assign({}, opt, {
          name: name
        })
      } else {
        return null
      }
    }
    const StarClass = this.opt.starClass
    star = new StarClass(opt)
    this.map.locations.push(star)
    this.stars.push(star)
    return star
  }

  randomStarPos () {
    var j, pos
    j = 0
    while (true) {
      pos = {
        x: Math.floor(this.opt.rng() * (this.opt.maxX - this.opt.minX) + this.opt.minX),
        y: Math.floor(this.opt.rng() * (this.opt.maxY - this.opt.minY) + this.opt.minY)
      }
      if (!(j < 10 && this.stars.find((star) => {
        return star.dist(pos.x, pos.y) <= this.opt.minStarDist
      }))) {
        break
      }
      j++
    }
    if (!(j >= 10)) {
      return pos
    }
  }

  randomStarName () {
    var name, pos, ref
    if ((ref = this.opt.starNames) != null ? ref.length : null) {
      pos = Math.floor(this.opt.rng() * this.opt.starNames.length)
      name = this.opt.starNames[pos]
      this.opt.starNames.splice(pos, 1)
      return name
    }
  }

  makeLinks () {
    return this.stars.forEach((star) => {
      return this.makeLinksFrom(star)
    })
  }

  makeLinksFrom (star) {
    var close, closests, link, needed, results, tries
    tries = this.opt.linkTries
    needed = this.opt.linksByStars - star.links.count()
    if (needed > 0) {
      closests = this.stars.filter((star2) => {
        return star2 !== star && !star.links.findStar(star2)
      }).closests(star.x, star.y)
      if (closests.count() > 0) {
        results = []
        while (true) {
          close = closests.shift()
          link = this.createLink(star, close)
          if (this.validateLink(link)) {
            this.links.push(link)
            star.addLink(link)
            needed -= 1
          } else {
            tries -= 1
          }
          if (!(needed > 0 && tries > 0 && closests.count() > 0)) {
            break
          } else {
            results.push(null)
          }
        }
        return results
      }
    }
  }

  createLink (star1, star2) {
    const LinkClass = this.opt.linkClass
    return new LinkClass(star1, star2)
  }

  validateLink (link) {
    return !this.stars.find((star) => {
      return star !== link.star1 && star !== link.star2 && link.closeToPoint(star.x, star.y, this.opt.minLinkDist)
    }) && !this.links.find((link2) => {
      return link2.intersectLink(link)
    })
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
}

module.exports = StarMapGenerator

},{"./Map":38,"./StarSystem":51,"parallelio-strings":6,"spark-starter":100}],51:[function(require,module,exports){
const Element = require('spark-starter').Element

class StarSystem extends Element {
  constructor (data) {
    super(data)
    this.init()
  }

  init () {}

  linkTo (star) {
    if (!this.links.findStar(star)) {
      return this.addLink(new this.constructor.Link(this, star))
    }
  }

  addLink (link) {
    this.links.add(link)
    link.otherStar(this).links.add(link)
    return link
  }

  dist (x, y) {
    var xDist, yDist
    xDist = this.x - x
    yDist = this.y - y
    return Math.sqrt((xDist * xDist) + (yDist * yDist))
  }

  isSelectableBy (player) {
    return true
  }
};

StarSystem.properties({
  x: {},
  y: {},
  name: {},
  links: {
    collection: {
      findStar: function (star) {
        return this.find(function (link) {
          return link.star2 === star || link.star1 === star
        })
      }
    }
  }
})

StarSystem.collenctionFn = {
  closest: function (x, y) {
    var min, minDist
    min = null
    minDist = null
    this.forEach(function (star) {
      var dist
      dist = star.dist(x, y)
      if ((min == null) || minDist > dist) {
        min = star
        minDist = dist
      }
    })
    return min
  },
  closests: function (x, y) {
    var dists
    dists = this.map(function (star) {
      return {
        dist: star.dist(x, y),
        star: star
      }
    })
    dists.sort(function (a, b) {
      return a.dist - b.dist
    })
    return this.copy(dists.map(function (dist) {
      return dist.star
    }))
  }
}

module.exports = StarSystem

StarSystem.Link = class Link extends Element {
  constructor (star1, star2) {
    super()
    this.star1 = star1
    this.star2 = star2
  }

  remove () {
    this.star1.links.remove(this)
    return this.star2.links.remove(this)
  }

  otherStar (star) {
    if (star === this.star1) {
      return this.star2
    } else {
      return this.star1
    }
  }

  getLength () {
    return this.star1.dist(this.star2.x, this.star2.y)
  }

  inBoundaryBox (x, y, padding = 0) {
    var x1, x2, y1, y2
    x1 = Math.min(this.star1.x, this.star2.x) - padding
    y1 = Math.min(this.star1.y, this.star2.y) - padding
    x2 = Math.max(this.star1.x, this.star2.x) + padding
    y2 = Math.max(this.star1.y, this.star2.y) + padding
    return x >= x1 && x <= x2 && y >= y1 && y <= y2
  }

  closeToPoint (x, y, minDist) {
    var a, abcAngle, abxAngle, acDist, acxAngle, b, c, cdDist, xAbDist, xAcDist, yAbDist, yAcDist
    if (!this.inBoundaryBox(x, y, minDist)) {
      return false
    }
    a = this.star1
    b = this.star2
    c = {
      x: x,
      y: y
    }
    xAbDist = b.x - a.x
    yAbDist = b.y - a.y
    abxAngle = Math.atan(yAbDist / xAbDist)
    xAcDist = c.x - a.x
    yAcDist = c.y - a.y
    acDist = Math.sqrt((xAcDist * xAcDist) + (yAcDist * yAcDist))
    acxAngle = Math.atan(yAcDist / xAcDist)
    abcAngle = abxAngle - acxAngle
    cdDist = Math.abs(Math.sin(abcAngle) * acDist)
    return cdDist <= minDist
  }

  intersectLink (link) {
    var s, s1x, s1y, s2x, s2y, t, x1, x2, x3, x4, y1, y2, y3, y4
    x1 = this.star1.x
    y1 = this.star1.y
    x2 = this.star2.x
    y2 = this.star2.y
    x3 = link.star1.x
    y3 = link.star1.y
    x4 = link.star2.x
    y4 = link.star2.y
    s1x = x2 - x1
    s1y = y2 - y1
    s2x = x4 - x3
    s2y = y4 - y3
    s = (-s1y * (x1 - x3) + s1x * (y1 - y3)) / (-s2x * s1y + s1x * s2y)
    t = (s2x * (y1 - y3) - s2y * (x1 - x3)) / (-s2x * s1y + s1x * s2y)
    return s > 0 && s < 1 && t > 0 && t < 1
  }
}

},{"spark-starter":100}],52:[function(require,module,exports){
const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')

class Travel extends Element {
  start (location) {
    if (this.valid) {
      this.moving = true
      this.traveller.travel = this
      this.pathTimeout = this.timing.setTimeout(() => {
        this.traveller.location = this.targetLocation
        this.traveller.travel = null
        this.moving = false
      }, this.duration)
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
    calcul: function () {
      return this.startLocation.links.findStar(this.targetLocation)
    }
  },
  duration: {
    default: 1000
  },
  moving: {
    default: false
  },
  valid: {
    calcul: function () {
      var ref, ref1
      if (this.targetLocation === this.startLocation) {
        return false
      }
      if ((((ref = this.targetLocation) != null ? ref.links : null) != null) && (((ref1 = this.startLocation) != null ? ref1.links : null) != null)) {
        return this.currentSection != null
      }
    }
  },
  timing: {
    calcul: function () {
      return new Timing()
    }
  },
  spaceCoodinate: {
    calcul: function (invalidator) {
      var endX, endY, prc, startX, startY
      startX = invalidator.propPath('startLocation.x')
      startY = invalidator.propPath('startLocation.y')
      endX = invalidator.propPath('targetLocation.x')
      endY = invalidator.propPath('targetLocation.y')
      prc = invalidator.propPath('pathTimeout.prc')
      return {
        x: (startX - endX) * prc + endX,
        y: (startY - endY) * prc + endY
      }
    }
  }
})

module.exports = Travel

},{"parallelio-timing":15,"spark-starter":100}],53:[function(require,module,exports){
const Element = require('spark-starter').Element
const Grid = require('parallelio-grids').Grid

class View extends Element {
  setDefaults () {
    var ref
    if (!this.bounds) {
      this.grid = this.grid || ((ref = this.game.mainViewProperty.value) != null ? ref.grid : null) || new Grid()
      this.bounds = this.grid.addCell()
    }
  }

  destroy () {
    this.game = null
  }
};

View.properties({
  game: {
    change: function (val, old) {
      if (this.game) {
        this.game.views.add(this)
        this.setDefaults()
      }
      if (old) {
        return old.views.remove(this)
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
})

module.exports = View

},{"parallelio-grids":4,"spark-starter":100}],54:[function(require,module,exports){
const LineOfSight = require('./LineOfSight')
const Direction = require('parallelio-tiles').Direction
const TileContainer = require('parallelio-tiles').TileContainer
const TileReference = require('parallelio-tiles').TileReference

class VisionCalculator {
  constructor (originTile, offset = {
    x: 0.5,
    y: 0.5
  }) {
    this.originTile = originTile
    this.offset = offset
    this.pts = {}
    this.visibility = {}
    this.stack = []
    this.calculated = false
  }

  calcul () {
    this.init()
    while (this.stack.length) {
      this.step()
    }
    this.calculated = true
  }

  init () {
    var firstBatch, initialPts
    this.pts = {}
    this.visibility = {}
    initialPts = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    initialPts.forEach((pt) => {
      return this.setPt(this.originTile.x + pt.x, this.originTile.y + pt.y, true)
    })
    firstBatch = [
      { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: -1, y: 2 },
      { x: 2, y: -1 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },
      { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: 0, y: 2 }, { x: 1, y: 2 }
    ]
    this.stack = firstBatch.map((pt) => {
      return {
        x: this.originTile.x + pt.x,
        y: this.originTile.y + pt.y
      }
    })
  }

  setPt (x, y, val) {
    var adjancent
    this.pts[x + ':' + y] = val
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
    ]
    return adjancent.forEach((pt) => {
      return this.addVisibility(x + pt.x, y + pt.y, val ? 1 / adjancent.length : 0)
    })
  }

  getPt (x, y) {
    return this.pts[x + ':' + y]
  }

  addVisibility (x, y, val) {
    if (this.visibility[x] == null) {
      this.visibility[x] = {}
    }
    if (this.visibility[x][y] != null) {
      this.visibility[x][y] += val
    } else {
      this.visibility[x][y] = val
    }
    return this
  }

  getVisibility (x, y) {
    if ((this.visibility[x] == null) || (this.visibility[x][y] == null)) {
      return 0
    } else {
      return this.visibility[x][y]
    }
  }

  canProcess (x, y) {
    return !this.stack.some((pt) => {
      return pt.x === x && pt.y === y
    }) && (this.getPt(x, y) == null)
  }

  step () {
    var los, pt
    pt = this.stack.shift()
    los = new LineOfSight(this.originTile.container, this.originTile.x + this.offset.x, this.originTile.y + this.offset.y, pt.x, pt.y)
    los.reverseTracing()
    los.traversableCallback = (tile, entryX, entryY) => {
      if (tile != null) {
        if (this.getVisibility(tile.x, tile.y) === 1) {
          return los.forceSuccess()
        } else {
          return tile.transparent
        }
      }
    }
    this.setPt(pt.x, pt.y, los.getSuccess())
    if (los.getSuccess()) {
      return Direction.all.forEach((direction) => {
        var nextPt
        nextPt = {
          x: pt.x + direction.x,
          y: pt.y + direction.y
        }
        if (this.canProcess(nextPt.x, nextPt.y)) {
          return this.stack.push(nextPt)
        }
      })
    }
  }

  getBounds () {
    var boundaries, col, ref, x, y
    boundaries = {
      top: null,
      left: null,
      bottom: null,
      right: null
    }
    ref = this.visibility
    for (x in ref) {
      col = ref[x]
      for (y in col) {
        if ((boundaries.top == null) || y < boundaries.top) {
          boundaries.top = y
        }
        if ((boundaries.left == null) || x < boundaries.left) {
          boundaries.left = x
        }
        if ((boundaries.bottom == null) || y > boundaries.bottom) {
          boundaries.bottom = y
        }
        if ((boundaries.right == null) || x > boundaries.right) {
          boundaries.right = x
        }
      }
    }
    return boundaries
  }

  /**
   * @returns {TileContainer}
   */
  toContainer () {
    var col, ref, tile, val, x, y
    const res = new TileContainer()
    res.owner = false
    ref = this.visibility
    for (x in ref) {
      col = ref[x]
      for (y in col) {
        val = col[y]
        tile = this.originTile.container.getTile(x, y)
        if (val !== 0 && (tile != null)) {
          tile = new TileReference(tile)
          tile.visibility = val
          res.addTile(tile)
        }
      }
    }
    return res
  }

  toMap () {
    var i, j, ref, ref1, ref2, ref3, res, x, y
    res = Object.assign({
      map: []
    }, this.getBounds())
    for (y = i = ref = res.top, ref1 = res.bottom - 1; (ref <= ref1 ? i <= ref1 : i >= ref1); y = ref <= ref1 ? ++i : --i) {
      res.map[y - res.top] = []
      for (x = j = ref2 = res.left, ref3 = res.right - 1; (ref2 <= ref3 ? j <= ref3 : j >= ref3); x = ref2 <= ref3 ? ++j : --j) {
        res.map[y - res.top][x - res.left] = this.getVisibility(x, y)
      }
    }
    return res
  }
}

module.exports = VisionCalculator

},{"./LineOfSight":37,"parallelio-tiles":14}],55:[function(require,module,exports){
const Element = require('spark-starter').Element
const EventEmitter = require('events')

class Action extends Element {
  withActor (actor) {
    if (this.actor !== actor) {
      return this.copyWith({
        actor: actor
      })
    } else {
      return this
    }
  }

  copyWith (options) {
    return new this.constructor(Object.assign({
      base: this.baseOrThis()
    }, this.propertiesManager.getManualDataProperties(), options))
  }

  baseOrThis () {
    return this.base || this
  }

  start () {
    return this.execute()
  }

  validActor () {
    return this.actor != null
  }

  isReady () {
    return this.validActor()
  }

  finish () {
    this.emit('finished')
    return this.end()
  }

  interrupt () {
    this.emit('interrupted')
    return this.end()
  }

  end () {
    this.emit('end')
    return this.destroy()
  }

  destroy () {
    return this.propertiesManager.destroy()
  }
};

Action.include(EventEmitter.prototype)

Action.properties({
  actor: {},
  base: {}
})

module.exports = Action

},{"events":66,"spark-starter":100}],56:[function(require,module,exports){
const Element = require('spark-starter').Element

class ActionProvider extends Element {};

ActionProvider.properties({
  actions: {
    collection: true,
    composed: true
  },
  owner: {}
})

module.exports = ActionProvider

},{"spark-starter":100}],57:[function(require,module,exports){
const WalkAction = require('./WalkAction')
const TargetAction = require('./TargetAction')
const EventBind = require('spark-starter').EventBind
const PropertyWatcher = require('spark-starter').watchers.PropertyWatcher

class AttackAction extends TargetAction {
  validTarget () {
    return this.targetIsAttackable() && (this.canUseWeapon() || this.canWalkToTarget())
  }

  targetIsAttackable () {
    return this.target.damageable && this.target.health >= 0
  }

  canMelee () {
    return Math.abs(this.target.tile.x - this.actor.tile.x) + Math.abs(this.target.tile.y - this.actor.tile.y) === 1
  }

  canUseWeapon () {
    return this.bestUsableWeapon != null
  }

  canUseWeaponAt (tile) {
    var ref
    return ((ref = this.actor.weapons) != null ? ref.length : null) && this.actor.weapons.find((weapon) => {
      return weapon.canUseFrom(tile, this.target)
    })
  }

  canWalkToTarget () {
    return this.walkAction.isReady()
  }

  useWeapon () {
    this.bestUsableWeapon.useOn(this.target)
    return this.finish()
  }

  execute () {
    if (this.actor.walk != null) {
      this.actor.walk.interrupt()
    }
    if (this.bestUsableWeapon != null) {
      if (this.bestUsableWeapon.charged) {
        return this.useWeapon()
      } else {
        return this.weaponChargeWatcher.bind()
      }
    } else {
      this.walkAction.on('finished', () => {
        this.interruptBinder.unbind()
        this.walkAction.destroy()
        this.walkActionProperty.invalidate()
        if (this.isReady()) {
          return this.start()
        }
      })
      this.interruptBinder.bindTo(this.walkAction)
      return this.walkAction.execute()
    }
  }
};

AttackAction.properties({
  walkAction: {
    calcul: function () {
      var walkAction
      walkAction = new WalkAction({
        actor: this.actor,
        target: this.target,
        parent: this.parent
      })
      walkAction.pathFinder.arrivedCallback = (step) => {
        return this.canUseWeaponAt(step.tile)
      }
      return walkAction
    }
  },
  bestUsableWeapon: {
    calcul: function (invalidator) {
      var ref, usableWeapons
      invalidator.propPath('actor.tile')
      if ((ref = this.actor.weapons) != null ? ref.length : null) {
        usableWeapons = this.actor.weapons.filter((weapon) => {
          return weapon.canUseOn(this.target)
        })
        usableWeapons.sort((a, b) => {
          return b.dps - a.dps
        })
        return usableWeapons[0]
      } else {
        return null
      }
    }
  },
  interruptBinder: {
    calcul: function () {
      return new EventBind('interrupted', null, () => {
        return this.interrupt()
      })
    },
    destroy: true
  },
  weaponChargeWatcher: {
    calcul: function () {
      return new PropertyWatcher({
        callback: () => {
          if (this.bestUsableWeapon.charged) {
            return this.useWeapon()
          }
        },
        property: this.bestUsableWeapon.propertiesManager.getProperty('charged')
      })
    },
    destroy: true
  }
})

module.exports = AttackAction

},{"./TargetAction":60,"./WalkAction":63,"spark-starter":100}],58:[function(require,module,exports){
const WalkAction = require('./WalkAction')
const AttackAction = require('./AttackAction')
const TargetAction = require('./TargetAction')
const PathFinder = require('parallelio-pathfinder')
const LineOfSight = require('../LineOfSight')
const PropertyWatcher = require('spark-starter').watchers.PropertyWatcher
const EventBind = require('spark-starter').EventBind

class AttackMoveAction extends TargetAction {
  isEnemy (elem) {
    var ref
    return (ref = this.actor.owner) != null ? typeof ref.isEnemy === 'function' ? ref.isEnemy(elem) : null : null
  }

  validTarget () {
    return this.walkAction.validTarget()
  }

  testEnemySpotted () {
    this.enemySpottedProperty.invalidate()
    if (this.enemySpotted) {
      this.attackAction = new AttackAction({
        actor: this.actor,
        target: this.enemySpotted
      })
      this.attackAction.on('finished', () => {
        if (this.isReady()) {
          return this.start()
        }
      })
      this.interruptBinder.bindTo(this.attackAction)
      this.walkAction.interrupt()
      this.walkActionProperty.invalidate()
      return this.attackAction.execute()
    }
  }

  execute () {
    if (!this.testEnemySpotted()) {
      this.walkAction.on('finished', () => {
        return this.finished()
      })
      this.interruptBinder.bindTo(this.walkAction)
      this.tileWatcher.bind()
      return this.walkAction.execute()
    }
  }
};

AttackMoveAction.properties({
  walkAction: {
    calcul: function () {
      var walkAction
      walkAction = new WalkAction({
        actor: this.actor,
        target: this.target,
        parent: this.parent
      })
      return walkAction
    }
  },
  enemySpotted: {
    calcul: function () {
      var ref
      this.path = new PathFinder(this.actor.tile.container, this.actor.tile, false, {
        validTile: (tile) => {
          return tile.transparent && (new LineOfSight(this.actor.tile.container, this.actor.tile.x, this.actor.tile.y, tile.x, tile.y)).getSuccess()
        },
        arrived: (step) => {
          step.enemy = step.tile.children.find((c) => {
            return this.isEnemy(c)
          })
          return step.enemy
        },
        efficiency: (tile) => {}
      })
      this.path.calcul()
      return (ref = this.path.solution) != null ? ref.enemy : null
    }
  },
  tileWatcher: {
    calcul: function () {
      return new PropertyWatcher({
        callback: () => {
          return this.testEnemySpotted()
        },
        property: this.actor.propertiesManager.getProperty('tile')
      })
    },
    destroy: true
  },
  interruptBinder: {
    calcul: function () {
      return new EventBind('interrupted', null, () => {
        return this.interrupt()
      })
    },
    destroy: true
  }
})

module.exports = AttackMoveAction

},{"../LineOfSight":37,"./AttackAction":57,"./TargetAction":60,"./WalkAction":63,"parallelio-pathfinder":5,"spark-starter":100}],59:[function(require,module,exports){
const ActionProvider = require('./ActionProvider')

class SimpleActionProvider extends ActionProvider {};

SimpleActionProvider.properties({
  actions: {
    calcul: function () {
      var actions
      actions = this.actionOptions || this.constructor.actions || []
      if (typeof actions === 'object') {
        actions = Object.keys(actions).map(function (key) {
          return actions[key]
        })
      }
      return actions.map((action) => {
        if (typeof action.withTarget === 'function') {
          return action.withTarget(this)
        } else if (typeof action === 'function') {
          const ActionClass = action
          return new ActionClass({
            target: this
          })
        } else {
          return action
        }
      })
    }
  }
})

module.exports = SimpleActionProvider

},{"./ActionProvider":56}],60:[function(require,module,exports){
const Action = require('./Action')

class TargetAction extends Action {
  withTarget (target) {
    if (this.target !== target) {
      return this.copyWith({
        target: target
      })
    } else {
      return this
    }
  }

  canTarget (target) {
    var instance
    instance = this.withTarget(target)
    if (instance.validTarget()) {
      return instance
    }
  }

  validTarget () {
    return this.target != null
  }

  isReady () {
    return super.isReady() && this.validTarget()
  }
};

TargetAction.properties({
  target: {}
})

module.exports = TargetAction

},{"./Action":55}],61:[function(require,module,exports){
const ActionProvider = require('./ActionProvider')

class TiledActionProvider extends ActionProvider {
  validActionTile (tile) {
    return tile != null
  }

  prepareActionTile (tile) {
    if (!tile.actionProvider) {
      tile.actionProvider = new ActionProvider({
        owner: tile
      })
    }
  }
};

TiledActionProvider.properties({
  originTile: {
    calcul: function (invalidator) {
      return invalidator.propPath('owner.tile')
    }
  },
  actionTiles: {
    collection: true,
    calcul: function (invalidator) {
      var myTile
      myTile = invalidator.prop(this.originTileProperty)
      if (myTile) {
        return this.actionTilesCoord.map((coord) => {
          return myTile.getRelativeTile(coord.x, coord.y)
        }).filter((tile) => {
          return this.validActionTile(tile)
        })
      } else {
        return []
      }
    },
    itemAdded: function (tile) {
      this.prepareActionTile(tile)
      return tile.actionProvider.actionsMembers.addProperty(this.actionsProperty)
    },
    itemRemoved: function (tile) {
      return tile.actionProvider.actionsMembers.removeProperty(this.actionsProperty)
    }
  }
})

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
]

module.exports = TiledActionProvider

},{"./ActionProvider":56}],62:[function(require,module,exports){
const TargetAction = require('./TargetAction')
const Travel = require('../Travel')

class TravelAction extends TargetAction {
  validTarget () {
    return this.travel.valid
  }

  execute () {
    return this.travel.start()
  }
};

TravelAction.properties({
  travel: {
    calcul: function () {
      return new Travel({
        traveller: this.actor,
        startLocation: this.actor.location,
        targetLocation: this.target
      })
    }
  }
})

module.exports = TravelAction

},{"../Travel":52,"./TargetAction":60}],63:[function(require,module,exports){
const PathFinder = require('parallelio-pathfinder')
const PathWalk = require('../PathWalk')
const TargetAction = require('./TargetAction')

class WalkAction extends TargetAction {
  execute () {
    if (this.actor.walk != null) {
      this.actor.walk.interrupt()
    }
    this.walk = this.actor.walk = new PathWalk(this.actor, this.pathFinder)
    this.actor.walk.on('finished', () => {
      return this.finish()
    })
    this.actor.walk.on('interrupted', () => {
      return this.interrupt()
    })
    return this.actor.walk.start()
  }

  destroy () {
    super.destroy()
    if (this.walk) {
      return this.walk.destroy()
    }
  }

  validTarget () {
    this.pathFinder.calcul()
    return this.pathFinder.solution != null
  }
};

WalkAction.properties({
  pathFinder: {
    calcul: function () {
      return new PathFinder(this.actor.tile.container, this.actor.tile, this.target, {
        validTile: (tile) => {
          if (typeof this.actor.canGoOnTile === 'function') {
            return this.actor.canGoOnTile(tile)
          } else {
            return tile.walkable
          }
        }
      })
    }
  }
})

module.exports = WalkAction

},{"../PathWalk":40,"./TargetAction":60,"parallelio-pathfinder":5}],64:[function(require,module,exports){
module.exports = {
  "Airlock": require("./Airlock"),
  "Approach": require("./Approach"),
  "AutomaticDoor": require("./AutomaticDoor"),
  "Character": require("./Character"),
  "CharacterAI": require("./CharacterAI"),
  "Confrontation": require("./Confrontation"),
  "DamagePropagation": require("./DamagePropagation"),
  "Damageable": require("./Damageable"),
  "Door": require("./Door"),
  "Element": require("./Element"),
  "EncounterManager": require("./EncounterManager"),
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
  "ShipInterior": require("./ShipInterior"),
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
},{"./Airlock":23,"./Approach":24,"./AutomaticDoor":25,"./Character":26,"./CharacterAI":27,"./Confrontation":28,"./DamagePropagation":29,"./Damageable":30,"./Door":31,"./Element":32,"./EncounterManager":33,"./Floor":34,"./Game":35,"./Inventory":36,"./LineOfSight":37,"./Map":38,"./Obstacle":39,"./PathWalk":40,"./PersonalWeapon":41,"./Player":42,"./Projectile":43,"./Ressource":44,"./RessourceType":45,"./RoomGenerator":46,"./Ship":47,"./ShipInterior":48,"./ShipWeapon":49,"./StarMapGenerator":50,"./StarSystem":51,"./Travel":52,"./View":53,"./VisionCalculator":54,"./actions/Action":55,"./actions/ActionProvider":56,"./actions/AttackAction":57,"./actions/AttackMoveAction":58,"./actions/SimpleActionProvider":59,"./actions/TargetAction":60,"./actions/TiledActionProvider":61,"./actions/TravelAction":62,"./actions/WalkAction":63}],65:[function(require,module,exports){
const libs = require('./libs')

module.exports = Object.assign({}, libs, {
  grids: require('parallelio-grids'),
  PathFinder: require('parallelio-pathfinder'),
  strings: require('parallelio-strings'),
  tiles: require('parallelio-tiles'),
  Timing: require('parallelio-timing'),
  wiring: require('parallelio-wiring'),
  Spark: require('spark-starter')
})

},{"./libs":64,"parallelio-grids":4,"parallelio-pathfinder":5,"parallelio-strings":6,"parallelio-tiles":14,"parallelio-timing":15,"parallelio-wiring":22,"spark-starter":100}],66:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],67:[function(require,module,exports){
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

},{}],68:[function(require,module,exports){
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

},{"process/browser.js":67,"timers":68}],69:[function(require,module,exports){
module.exports = {
  Binder: require('./src/Binder'),
  EventBind: require('./src/EventBind'),
  Reference: require('./src/Reference')
}

},{"./src/Binder":70,"./src/EventBind":71,"./src/Reference":72}],70:[function(require,module,exports){
class Binder {
  toggleBind (val = !this.binded) {
    if (val) {
      return this.bind()
    } else {
      return this.unbind()
    }
  }

  bind () {
    if (!this.binded && this.canBind()) {
      this.doBind()
    }
    this.binded = true
    return this
  }

  canBind () {
    return true
  }

  doBind () {
    throw new Error('Not implemented')
  }

  unbind () {
    if (this.binded && this.canBind()) {
      this.doUnbind()
    }
    this.binded = false
    return this
  }

  doUnbind () {
    throw new Error('Not implemented')
  }

  destroy () {
    this.unbind()
  }
};

module.exports = Binder

},{}],71:[function(require,module,exports){

const Binder = require('./Binder')
const Reference = require('./Reference')

class EventBind extends Binder {
  constructor (event1, target1, callback) {
    super()
    this.event = event1
    this.target = target1
    this.callback = callback
  }

  canBind () {
    return (this.callback != null) && (this.target != null)
  }

  bindTo (target) {
    this.unbind()
    this.target = target
    return this.bind()
  }

  doBind () {
    if (typeof this.target.addEventListener === 'function') {
      return this.target.addEventListener(this.event, this.callback)
    } else if (typeof this.target.addListener === 'function') {
      return this.target.addListener(this.event, this.callback)
    } else if (typeof this.target.on === 'function') {
      return this.target.on(this.event, this.callback)
    } else {
      throw new Error('No function to add event listeners was found')
    }
  }

  doUnbind () {
    if (typeof this.target.removeEventListener === 'function') {
      return this.target.removeEventListener(this.event, this.callback)
    } else if (typeof this.target.removeListener === 'function') {
      return this.target.removeListener(this.event, this.callback)
    } else if (typeof this.target.off === 'function') {
      return this.target.off(this.event, this.callback)
    } else {
      throw new Error('No function to remove event listeners was found')
    }
  }

  equals (eventBind) {
    return eventBind != null &&
      eventBind.constructor === this.constructor &&
      eventBind.event === this.event &&
      Reference.compareVal(eventBind.target, this.target) &&
      Reference.compareVal(eventBind.callback, this.callback)
  }

  static checkEmitter (emitter, fatal = true) {
    if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
      return true
    } else if (fatal) {
      throw new Error('No function to add event listeners was found')
    } else {
      return false
    }
  }
}
module.exports = EventBind

},{"./Binder":70,"./Reference":72}],72:[function(require,module,exports){
class Reference {
  constructor (data) {
    this.data = data
  }

  equals (ref) {
    return ref != null && ref.constructor === this.constructor && this.compareData(ref.data)
  }

  compareData (data) {
    if (data instanceof Reference) {
      return this.equals(data)
    }
    if (this.data === data) {
      return true
    }
    if (this.data == null || data == null) {
      return false
    }
    if (typeof this.data === 'object' && typeof data === 'object') {
      return Object.keys(this.data).length === Object.keys(data).length && Object.keys(data).every((key) => {
        return Reference.compareVal(this.data[key], data[key])
      })
    }
    return Reference.compareVal(this.data, data)
  }

  /**
   * @param {*} val1
   * @param {*} val2
   * @return {boolean}
   */
  static compareVal (val1, val2) {
    if (val1 === val2) {
      return true
    }
    if (val1 == null || val2 == null) {
      return false
    }
    if (typeof val1.equals === 'function') {
      return val1.equals(val2)
    }
    if (typeof val2.equals === 'function') {
      return val2.equals(val1)
    }
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return val1.length === val2.length && val1.every((val, i) => {
        return this.compareVal(val, val2[i])
      })
    }
    // if (typeof val1 === 'object' && typeof val2 === 'object') {
    //   return Object.keys(val1).length === Object.keys(val2).length && Object.keys(val1).every((key) => {
    //     return this.compareVal(val1[key], val2[key])
    //   })
    // }
    return false
  }

  static makeReferred (obj, data) {
    if (data instanceof Reference) {
      obj.ref = data
    } else {
      obj.ref = new Reference(data)
    }
    obj.equals = function (obj2) {
      return obj2 != null && this.ref.equals(obj2.ref)
    }
    return obj
  }
};

module.exports = Reference

},{}],73:[function(require,module,exports){
module.exports = require('./src/Collection')

},{"./src/Collection":74}],74:[function(require,module,exports){
/**
 * @template T
 */
class Collection {
  /**
   * @param {Collection.<T>|Array.<T>|T} [arr]
   */
  constructor (arr) {
    if (arr != null) {
      if (typeof arr.toArray === 'function') {
        this._array = arr.toArray()
      } else if (Array.isArray(arr)) {
        this._array = arr
      } else {
        this._array = [arr]
      }
    } else {
      this._array = []
    }
  }

  changed () {}

  /**
   * @param {Collection.<T>|Array.<T>} old
   * @param {boolean} ordered
   * @param {function(T,T): boolean} compareFunction
   * @return {boolean}
   */
  checkChanges (old, ordered = true, compareFunction = null) {
    if (compareFunction == null) {
      compareFunction = function (a, b) {
        return a === b
      }
    }
    if (old != null) {
      old = this.copy(old.slice())
    } else {
      old = []
    }
    return this.count() !== old.length || (ordered ? this.some(function (val, i) {
      return !compareFunction(old.get(i), val)
    }) : this.some(function (a) {
      return !old.pluck(function (b) {
        return compareFunction(a, b)
      })
    }))
  }

  /**
   * @param {number} i
   * @return {T}
   */
  get (i) {
    return this._array[i]
  }

  /**
   * @return {T}
   */
  getRandom () {
    return this._array[Math.floor(Math.random() * this._array.length)]
  }

  /**
   * @param {number} i
   * @param {T} val
   * @return {T}
   */
  set (i, val) {
    var old
    if (this._array[i] !== val) {
      old = this.toArray()
      this._array[i] = val
      this.changed(old)
    }
    return val
  }

  /**
   * @param {T} val
   */
  add (val) {
    if (!this._array.includes(val)) {
      return this.push(val)
    }
    return this
  }

  /**
   * @param {T} val
   */
  remove (val) {
    var index, old
    index = this._array.indexOf(val)
    if (index !== -1) {
      old = this.toArray()
      this._array.splice(index, 1)
      this.changed(old)
    }
    return this
  }

  /**
   * @param {function(T): boolean} fn
   * @return {T}
   */
  pluck (fn) {
    var found, index, old
    index = this._array.findIndex(fn)
    if (index > -1) {
      old = this.toArray()
      found = this._array[index]
      this._array.splice(index, 1)
      this.changed(old)
      return found
    } else {
      return null
    }
  }

  /**
   * @param {Array.<Collection.<T>>|Array.<Array.<T>>|Array.<T>} arr
   * @return {Collection.<T>}
   */
  concat (...arr) {
    return this.copy(this._array.concat(...arr.map((a) => a.toArray == null ? a : a.toArray())))
  }

  /**
   * @return {Array.<T>}
   */
  toArray () {
    return this._array.slice()
  }

  /**
   * @return {number}
   */
  count () {
    return this._array.length
  }

  /**
   * @template ItemType
   * @param {Object} toAppend
   * @param {Collection.<ItemType>|Array.<ItemType>|ItemType} [arr]
   * @return {Collection.<ItemType>}
   */
  static newSubClass (toAppend, arr) {
    var SubClass
    if (typeof toAppend === 'object') {
      SubClass = class extends this {}
      Object.assign(SubClass.prototype, toAppend)
      return new SubClass(arr)
    } else {
      return new this(arr)
    }
  }

  /**
   * @param {Collection.<T>|Array.<T>|T} [arr]
   * @return {Collection.<T>}
   */
  copy (arr) {
    var coll
    if (arr == null) {
      arr = this.toArray()
    }
    coll = new this.constructor(arr)
    return coll
  }

  /**
   * @param {*} arr
   * @return {boolean}
   */
  equals (arr) {
    return (this.count() === (typeof arr.count === 'function' ? arr.count() : arr.length)) && this.every(function (val, i) {
      return arr[i] === val
    })
  }

  /**
   * @param {Collection.<T>|Array.<T>} arr
   * @return {Array.<T>}
   */
  getAddedFrom (arr) {
    return this._array.filter(function (item) {
      return !arr.includes(item)
    })
  }

  /**
   * @param {Collection.<T>|Array.<T>} arr
   * @return {Array.<T>}
   */
  getRemovedFrom (arr) {
    return arr.filter((item) => {
      return !this.includes(item)
    })
  }
};

Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString']

Collection.readListFunctions = ['filter', 'slice']

Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']

Collection.readFunctions.forEach(function (funct) {
  Collection.prototype[funct] = function (...arg) {
    return this._array[funct](...arg)
  }
})

Collection.readListFunctions.forEach(function (funct) {
  Collection.prototype[funct] = function (...arg) {
    return this.copy(this._array[funct](...arg))
  }
})

Collection.writefunctions.forEach(function (funct) {
  Collection.prototype[funct] = function (...arg) {
    var old, res
    old = this.toArray()
    res = this._array[funct](...arg)
    this.changed(old)
    return res
  }
})

Object.defineProperty(Collection.prototype, 'length', {
  get: function () {
    return this.count()
  }
})

if (typeof Symbol !== 'undefined' && Symbol !== null ? Symbol.iterator : 0) {
  Collection.prototype[Symbol.iterator] = function () {
    return this._array[Symbol.iterator]()
  }
}

module.exports = Collection

},{}],75:[function(require,module,exports){
module.exports = {
  Invalidator: require('./src/Invalidator'),
  PropertiesManager: require('./src/PropertiesManager'),
  Property: require('./src/Property'),
  getters: {
    BaseGetter: require('./src/getters/BaseGetter'),
    CalculatedGetter: require('./src/getters/CalculatedGetter'),
    CompositeGetter: require('./src/getters/CompositeGetter'),
    InvalidatedGetter: require('./src/getters/InvalidatedGetter'),
    ManualGetter: require('./src/getters/ManualGetter'),
    SimpleGetter: require('./src/getters/SimpleGetter')
  },
  setters: {
    BaseSetter: require('./src/setters/BaseSetter'),
    BaseValueSetter: require('./src/setters/BaseValueSetter'),
    CollectionSetter: require('./src/setters/CollectionSetter'),
    ManualSetter: require('./src/setters/ManualSetter'),
    SimpleSetter: require('./src/setters/SimpleSetter')
  },
  watchers: {
    CollectionPropertyWatcher: require('./src/watchers/CollectionPropertyWatcher'),
    PropertyWatcher: require('./src/watchers/PropertyWatcher')
  }
}

},{"./src/Invalidator":76,"./src/PropertiesManager":77,"./src/Property":78,"./src/getters/BaseGetter":79,"./src/getters/CalculatedGetter":80,"./src/getters/CompositeGetter":81,"./src/getters/InvalidatedGetter":82,"./src/getters/ManualGetter":83,"./src/getters/SimpleGetter":84,"./src/setters/BaseSetter":85,"./src/setters/BaseValueSetter":86,"./src/setters/CollectionSetter":87,"./src/setters/ManualSetter":88,"./src/setters/SimpleSetter":89,"./src/watchers/CollectionPropertyWatcher":90,"./src/watchers/PropertyWatcher":91}],76:[function(require,module,exports){
const Binder = require('spark-binding').Binder
const EventBind = require('spark-binding').EventBind

const pluck = function (arr, fn) {
  var found, index
  index = arr.findIndex(fn)
  if (index > -1) {
    found = arr[index]
    arr.splice(index, 1)
    return found
  } else {
    return null
  }
}

class Invalidator extends Binder {
  constructor (invalidated, scope = null) {
    super()
    this.invalidated = invalidated
    this.scope = scope
    this.invalidationEvents = []
    this.recycled = []
    this.unknowns = []
    this.strict = this.constructor.strict
    this.invalid = false
    this.invalidateCallback = () => {
      this.invalidate()
    }
    this.invalidateCallback.owner = this
    this.changedCallback = (old, context) => {
      this.invalidate(context)
    }
    this.changedCallback.owner = this
  }

  invalidate (context) {
    var functName
    this.invalid = true
    if (typeof this.invalidated === 'function') {
      this.invalidated(context)
    } else if (typeof this.callback === 'function') {
      this.callback(context)
    } else if ((this.invalidated != null) && typeof this.invalidated.invalidate === 'function') {
      this.invalidated.invalidate(context)
    } else if (typeof this.invalidated === 'string') {
      functName = 'invalidate' + this.invalidated.charAt(0).toUpperCase() + this.invalidated.slice(1)
      if (typeof this.scope[functName] === 'function') {
        this.scope[functName](context)
      } else {
        this.scope[this.invalidated] = null
      }
    }
    return this
  }

  unknown (context) {
    if (this.invalidated != null && typeof this.invalidated.unknown === 'function') {
      return this.invalidated.unknown(context)
    } else {
      return this.invalidate(context)
    }
  }

  addEventBind (event, target, callback) {
    return this.addBinder(new EventBind(event, target, callback))
  }

  addBinder (binder) {
    if (binder.callback == null) {
      binder.callback = this.invalidateCallback
    }
    if (!this.invalidationEvents.some(function (eventBind) {
      return eventBind.equals(binder)
    })) {
      return this.invalidationEvents.push(pluck(this.recycled, function (eventBind) {
        return eventBind.equals(binder)
      }) || binder)
    }
  }

  getUnknownCallback (prop) {
    var callback
    callback = (context) => {
      return this.addUnknown(function () {
        return prop.get()
      }, prop, context)
    }
    callback.prop = prop
    callback.owner = this
    return callback
  }

  addUnknown (fn, prop, context) {
    if (!this.findUnknown(prop)) {
      fn.prop = prop
      fn.owner = this
      this.unknowns.push(fn)
      return this.unknown(context)
    }
  }

  findUnknown (prop) {
    if (prop != null) {
      return this.unknowns.find(function (unknown) {
        return unknown.prop === prop
      })
    }
  }

  event (event, target = this.scope) {
    if (this.checkEmitter(target)) {
      return this.addEventBind(event, target)
    }
  }

  value (val, event, target = this.scope) {
    this.event(event, target)
    return val
  }

  /**
   * @template T
   * @param {Property<T>} prop
   * @return {T}
   */
  prop (prop) {
    if (prop != null) {
      this.addEventBind('invalidated', prop.events, this.getUnknownCallback(prop))
      this.addEventBind('updated', prop.events, this.changedCallback)
      return prop.get()
    }
  }

  propByName (prop, target = this.scope) {
    if (target.propertiesManager != null) {
      const property = target.propertiesManager.getProperty(prop)
      if (property) {
        return this.prop(property)
      }
    }
    if (target[prop + 'Property'] != null) {
      return this.prop(target[prop + 'Property'])
    }
    return target[prop]
  }

  propPath (path, target = this.scope) {
    var prop, val
    path = path.split('.')
    val = target
    while ((val != null) && path.length > 0) {
      prop = path.shift()
      val = this.propByName(prop, val)
    }
    return val
  }

  funct (funct) {
    var invalidator, res
    invalidator = new Invalidator(() => {
      return this.addUnknown(() => {
        var res2
        res2 = funct(invalidator)
        if (res !== res2) {
          return this.invalidate()
        }
      }, invalidator)
    })
    res = funct(invalidator)
    this.invalidationEvents.push(invalidator)
    return res
  }

  validateUnknowns () {
    this.unknowns.slice().forEach(function (unknown) {
      unknown()
    })
    this.unknowns = []
    return this
  }

  isEmpty () {
    return this.invalidationEvents.length === 0
  }

  bind () {
    this.invalid = false
    this.invalidationEvents.forEach(function (eventBind) {
      eventBind.bind()
    })
    return this
  }

  recycle (fn) {
    var done, res
    this.recycled = this.invalidationEvents
    this.invalidationEvents = []
    done = this.endRecycle.bind(this)
    if (typeof fn === 'function') {
      if (fn.length > 1) {
        return fn(this, done)
      } else {
        res = fn(this)
        done()
        return res
      }
    } else {
      return done
    }
  }

  endRecycle () {
    this.recycled.forEach(function (eventBind) {
      return eventBind.unbind()
    })
    this.recycled = []
    return this
  }

  checkEmitter (emitter) {
    return EventBind.checkEmitter(emitter, this.strict)
  }

  checkPropInstance (prop) {
    return typeof prop.get === 'function' && this.checkEmitter(prop.events)
  }

  unbind () {
    this.invalidationEvents.forEach(function (eventBind) {
      eventBind.unbind()
    })
    return this
  }
};

Invalidator.strict = true

module.exports = Invalidator

},{"spark-binding":69}],77:[function(require,module,exports){
const Property = require('./Property')

class PropertiesManager {
  constructor (properties = {}, options = {}) {
    /**
     * @type {Array.<Property>}
     */
    this.properties = []
    this.globalOptions = Object.assign({ initWatchers: false }, options)
    this.propertiesOptions = Object.assign({}, properties)
  }

  /**
   * @param {*} properties
   * @param {*} options
   * @return {PropertiesManager}
   */
  copyWith (properties = {}, options = {}) {
    return new this.constructor(this.mergePropertiesOptions(this.propertiesOptions, properties), Object.assign({}, this.globalOptions, options))
  }

  withProperty (prop, options) {
    const properties = {}
    properties[prop] = options
    return this.copyWith(properties)
  }

  useScope (scope) {
    return this.copyWith({}, { scope: scope })
  }

  mergePropertiesOptions (...arg) {
    return arg.reduce((res, opt) => {
      Object.keys(opt).forEach((name) => {
        res[name] = this.mergePropertyOptions(res[name] || {}, opt[name])
      })
      return res
    }, {})
  }

  mergePropertyOptions (...arg) {
    const notMergable = ['default', 'scope']
    return arg.reduce((res, opt) => {
      Object.keys(opt).forEach((name) => {
        if (typeof res[name] === 'function' && typeof opt[name] === 'function' && !notMergable.includes(name)) {
          res[name] = this.mergeCallback(res[name], opt[name])
        } else {
          res[name] = opt[name]
        }
      })
      return res
    }, {})
  }

  mergeCallback (oldFunct, newFunct) {
    const fn = function (...arg) {
      return newFunct.call(this, ...arg, oldFunct.bind(this))
    }
    fn.components = (oldFunct.components || [oldFunct]).concat((oldFunct.newFunct || [newFunct]))
    fn.nbParams = newFunct.nbParams || newFunct.length
    return fn
  }

  initProperties () {
    this.addProperties(this.propertiesOptions)
    return this
  }

  createScopeGetterSetters () {
    this.properties.forEach((prop) => prop.createScopeGetterSetters())
    return this
  }

  initWatchers () {
    this.properties.forEach((prop) => prop.initWatchers())
    return this
  }

  initScope () {
    this.initProperties()
    this.createScopeGetterSetters()
    this.initWatchers()
    return this
  }

  /**
   * @template T
   * @param {string} name
   * @param {Object} options
   * @returns {Property<T>}
   */
  addProperty (name, options) {
    const prop = new Property(Object.assign({ name: name }, this.globalOptions, options))
    this.properties.push(prop)
    return prop
  }

  addProperties (options) {
    Object.keys(options).forEach((name) => this.addProperty(name, options[name]))
    return this
  }

  /**
   * @param {string} name
   * @returns {Property}
   */
  getProperty (name) {
    return this.properties.find((prop) => prop.options.name === name)
  }

  setPropertiesData (data, options = {}) {
    Object.keys(data).forEach((key) => {
      if (((options.whitelist == null) || options.whitelist.indexOf(key) !== -1) && ((options.blacklist == null) || options.blacklist.indexOf(key) === -1)) {
        const prop = this.getProperty(key)
        if (prop) {
          prop.set(data[key])
        }
      }
    })
    return this
  }

  getManualDataProperties () {
    return this.properties.reduce((res, prop) => {
      if (prop.getter.calculated && prop.manual) {
        res[prop.options.name] = prop.get()
      }
      return res
    }, {})
  }

  destroy () {
    this.properties.forEach((prop) => prop.destroy())
  }
}

module.exports = PropertiesManager

},{"./Property":78}],78:[function(require,module,exports){
const EventEmitter = require('events').EventEmitter

const SimpleGetter = require('./getters/SimpleGetter')
const CalculatedGetter = require('./getters/CalculatedGetter')
const InvalidatedGetter = require('./getters/InvalidatedGetter')
const ManualGetter = require('./getters/ManualGetter')
const CompositeGetter = require('./getters/CompositeGetter')

const ManualSetter = require('./setters/ManualSetter')
const SimpleSetter = require('./setters/SimpleSetter')
const BaseValueSetter = require('./setters/BaseValueSetter')
const CollectionSetter = require('./setters/CollectionSetter')

/**
 * @template T
 */
class Property {
  /**
   * @typedef {Object} PropertyOptions
   * @property {T} [default]
   * @property {function(import("./Invalidator")): T} [calcul]
   * @property {function(): T} [get]
   * @property {function(T)} [set]
   * @property {function(T,T)|import("./PropertyWatcher")<T>} [change]
   * @property {boolean|string|function(T,T):T} [composed]
   * @property {boolean|Object} [collection]
   * @property {*} [scope]
   *
   * @param {PropertyOptions} options
   */
  constructor (options = {}) {
    this.options = Object.assign({}, Property.defaultOptions, options)
    this.init()
  }

  init () {
    /**
     * @type {EventEmitter}
     */
    this.events = new this.options.EventEmitterClass()
    this.makeSetter()
    this.makeGetter()
    this.setter.init()
    this.getter.init()
    if (this.options.initWatchers) {
      this.initWatchers()
    }
  }

  /**
   * @returns {string}
   */
  getQualifiedName () {
    if (this.options.name) {
      let name = this.options.name
      if (this.options.scope && this.options.scope.constructor) {
        name = this.options.scope.constructor.name + '.' + name
      }
      return name
    }
  }

  /**
   * @returns {string}
   */
  toString () {
    const name = this.getQualifiedName()
    if (name) {
      return `[Property ${name}]`
    }
    return '[Property]'
  }

  initWatchers () {
    this.setter.loadInternalWatcher()
  }

  makeGetter () {
    if (typeof this.options.get === 'function') {
      this.getter = new ManualGetter(this)
    } else if (this.options.composed != null && this.options.composed !== false) {
      this.getter = new CompositeGetter(this)
    } else if (typeof this.options.calcul === 'function') {
      if ((this.options.calcul.nbParams || this.options.calcul.length) === 0) {
        this.getter = new CalculatedGetter(this)
      } else {
        this.getter = new InvalidatedGetter(this)
      }
    } else {
      this.getter = new SimpleGetter(this)
    }
  }

  makeSetter () {
    if (typeof this.options.set === 'function') {
      this.setter = new ManualSetter(this)
    } else if (this.options.collection != null && this.options.collection !== false) {
      this.setter = new CollectionSetter(this)
    } else if (this.options.composed != null && this.options.composed !== false) {
      this.setter = new BaseValueSetter(this)
    } else {
      this.setter = new SimpleSetter(this)
    }
  }

  /**
   * @param {*} options
   * @returns {Property<T>}
   */
  copyWith (options) {
    return new this.constructor(Object.assign({}, this.options, options))
  }

  /**
   * @returns {T}
   */
  get () {
    return this.getter.get()
  }

  invalidate (context) {
    this.getter.invalidate(context)
    return this
  }

  unknown (context) {
    this.getter.unknown(context)
    return this
  }

  set (val) {
    return this.setter.set(val)
  }

  createScopeGetterSetters () {
    if (this.options.scope) {
      const prop = this
      let opt = {}
      opt[this.options.name + 'Property'] = {
        get: function () {
          return prop
        }
      }
      opt = this.getter.getScopeGetterSetters(opt)
      opt = this.setter.getScopeGetterSetters(opt)
      Object.defineProperties(this.options.scope, opt)
    }
    return this
  }

  destroy () {
    if (this.options.destroy === true && this.value != null && this.value.destroy != null) {
      this.value.destroy()
    }
    if (typeof this.options.destroy === 'function') {
      this.callOptionFunct('destroy', this.value)
    }
    this.getter.destroy()
    this.value = null
  }

  callOptionFunct (funct, ...args) {
    if (typeof funct === 'string') {
      funct = this.options[funct]
    }
    return funct.apply(this.options.scope || this, args)
  }
}

Property.defaultOptions = {
  EventEmitterClass: EventEmitter,
  initWatchers: true
}
module.exports = Property

},{"./getters/CalculatedGetter":80,"./getters/CompositeGetter":81,"./getters/InvalidatedGetter":82,"./getters/ManualGetter":83,"./getters/SimpleGetter":84,"./setters/BaseValueSetter":86,"./setters/CollectionSetter":87,"./setters/ManualSetter":88,"./setters/SimpleSetter":89,"events":66}],79:[function(require,module,exports){

class BaseGetter {
  constructor (prop) {
    this.prop = prop
  }

  init () {
    this.calculated = false
    this.initiated = false
    this.invalidated = false
  }

  get () {
    throw new Error('Not implemented')
  }

  output () {
    if (typeof this.prop.options.output === 'function') {
      return this.prop.callOptionFunct('output', this.prop.value)
    } else {
      return this.prop.value
    }
  }

  revalidated () {
    this.calculated = true
    this.initiated = true
    this.invalidated = false
    return this
  }

  unknown (context) {
    if (!this.invalidated) {
      this.invalidated = true
      this.invalidateNotice(context)
    }
    return this
  }

  invalidate (context) {
    this.calculated = false
    if (!this.invalidated) {
      this.invalidated = true
      this.invalidateNotice(context)
    }
    return this
  }

  invalidateNotice (context) {
    context = context || { origin: this.prop }
    this.prop.events.emit('invalidated', context)
  }

  /**
   * @param {PropertyDescriptorMap} opt
   * @return {PropertyDescriptorMap}
   */
  getScopeGetterSetters (opt) {
    const prop = this.prop
    opt[this.prop.options.name] = opt[this.prop.options.name] || {}
    opt[this.prop.options.name].get = function () {
      return prop.get()
    }
    opt[this.prop.options.name].enumerable = true
    opt[this.prop.options.name].configurable = true
    return opt
  }

  destroy () {
  }
}

module.exports = BaseGetter

},{}],80:[function(require,module,exports){

const BaseGetter = require('./BaseGetter')

class CalculatedGetter extends BaseGetter {
  get () {
    if (!this.calculated) {
      const old = this.prop.value
      const initiated = this.initiated
      this.calcul()
      if (!initiated) {
        this.prop.events.emit('updated', old)
      } else if (this.prop.setter.checkChanges(this.prop.value, old)) {
        this.prop.setter.changed(old)
      }
    }
    this.invalidated = false
    return this.output()
  }

  calcul () {
    this.prop.setter.setRawValue(this.prop.callOptionFunct('calcul'))
    this.prop.manual = false
    this.revalidated()
    return this.prop.value
  }
}

module.exports = CalculatedGetter

},{"./BaseGetter":79}],81:[function(require,module,exports){
const InvalidatedGetter = require('./InvalidatedGetter')
const Collection = require('spark-collection')
const Invalidator = require('../Invalidator')
const Reference = require('spark-binding').Reference

class CompositeGetter extends InvalidatedGetter {
  init () {
    super.init()
    if (this.prop.options.default != null) {
      this.baseValue = this.prop.options.default
    } else {
      this.prop.setter.setRawValue(null)
      this.baseValue = null
    }
    this.members = new CompositeGetter.Members(this.prop.options.members)
    if (this.prop.options.calcul != null) {
      this.members.unshift((prev, invalidator) => {
        return this.prop.options.calcul.bind(this.prop.options.scope)(invalidator)
      })
    }
    this.members.changed = (old) => {
      return this.invalidate()
    }
    this.prop.members = this.members
    this.join = this.guessJoinFunction()
  }

  guessJoinFunction () {
    if (typeof this.prop.options.composed === 'function') {
      return this.prop.options.composed
    } else if (typeof this.prop.options.composed === 'string' && CompositeGetter.joinFunctions[this.prop.options.composed] != null) {
      return CompositeGetter.joinFunctions[this.prop.options.composed]
    } else if (this.prop.options.collection != null && this.prop.options.collection !== false) {
      return CompositeGetter.joinFunctions.concat
    } else if (this.prop.options.default === false) {
      return CompositeGetter.joinFunctions.or
    } else if (this.prop.options.default === true) {
      return CompositeGetter.joinFunctions.and
    } else {
      return CompositeGetter.joinFunctions.last
    }
  }

  calcul () {
    if (this.members.length) {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this.prop, this.prop.options.scope)
      }
      this.invalidator.recycle((invalidator, done) => {
        this.prop.setter.setRawValue(this.members.reduce((prev, member) => {
          var val
          val = typeof member === 'function' ? member(prev, this.invalidator) : member
          return this.join(prev, val)
        }, this.baseValue))
        done()
        if (invalidator.isEmpty()) {
          this.invalidator = null
        } else {
          invalidator.bind()
        }
      })
    } else {
      this.prop.setter.setRawValue(this.baseValue)
    }
    this.revalidated()
    return this.prop.value
  }

  /**
   * @param {PropertyDescriptorMap} opt
   * @return {PropertyDescriptorMap}
   */
  getScopeGetterSetters (opt) {
    opt = super.getScopeGetterSetters(opt)
    const members = this.members
    opt[this.prop.options.name + 'Members'] = {
      get: function () {
        return members
      }
    }
    return opt
  }
}

CompositeGetter.joinFunctions = {
  and: function (a, b) {
    return a && b
  },
  or: function (a, b) {
    return a || b
  },
  last: function (a, b) {
    return b
  },
  sum: function (a, b) {
    return a + b
  },
  concat: function (a, b) {
    if (a == null) {
      a = []
    } else {
      if (a.toArray != null) {
        a = a.toArray()
      }
      if (a.concat == null) {
        a = [a]
      }
    }
    if (b == null) {
      b = []
    } else {
      if (b.toArray != null) {
        b = b.toArray()
      }
      if (b.concat == null) {
        b = [b]
      }
    }
    return a.concat(b)
  }
}

CompositeGetter.Members = class Members extends Collection {
  addProperty (prop) {
    if (this.findRefIndex(null, prop) === -1) {
      this.push(Reference.makeReferred(function (prev, invalidator) {
        return invalidator.prop(prop)
      }, {
        prop: prop
      }))
    }
    return this
  }

  addPropertyPath (name, obj) {
    if (this.findRefIndex(name, obj) === -1) {
      this.push(Reference.makeReferred(function (prev, invalidator) {
        return invalidator.propPath(name, obj)
      }, {
        name: name,
        obj: obj
      }))
    }
    return this
  }

  removeProperty (prop) {
    this.removeRef({ prop: prop })
    return this
  }

  addValueRef (val, data) {
    if (this.findRefIndex(data) === -1) {
      const fn = Reference.makeReferred(function (prev, invalidator) {
        return val
      }, data)
      fn.val = val
      this.push(fn)
    }
    return this
  }

  setValueRef (val, data) {
    const i = this.findRefIndex(data)
    if (i === -1) {
      this.addValueRef(val, data)
    } else if (this.get(i).val !== val) {
      const fn = Reference.makeReferred(function (prev, invalidator) {
        return val
      }, data)
      fn.val = val
      this.set(i, fn)
    }
    return this
  }

  getValueRef (data) {
    return this.findByRef(data).val
  }

  addFunctionRef (fn, data) {
    if (this.findRefIndex(data) === -1) {
      fn = Reference.makeReferred(fn, data)
      this.push(fn)
    }
    return this
  }

  findByRef (data) {
    return this._array[this.findRefIndex(data)]
  }

  findRefIndex (data) {
    return this._array.findIndex(function (member) {
      return (member.ref != null) && member.ref.compareData(data)
    })
  }

  removeRef (data) {
    var index, old
    index = this.findRefIndex(data)
    if (index !== -1) {
      old = this.toArray()
      this._array.splice(index, 1)
      this.changed(old)
    }
    return this
  }
}

module.exports = CompositeGetter

},{"../Invalidator":76,"./InvalidatedGetter":82,"spark-binding":69,"spark-collection":73}],82:[function(require,module,exports){
const Invalidator = require('../Invalidator')
const CalculatedGetter = require('./CalculatedGetter')

class InvalidatedGetter extends CalculatedGetter {
  get () {
    if (this.invalidator) {
      this.invalidator.validateUnknowns()
    }
    return super.get()
  }

  calcul () {
    if (!this.invalidator) {
      this.invalidator = new Invalidator(this.prop, this.prop.options.scope)
    }
    this.invalidator.recycle((invalidator, done) => {
      this.prop.setter.setRawValue(this.prop.callOptionFunct('calcul', invalidator))
      this.prop.manual = false
      done()
      if (invalidator.isEmpty()) {
        this.invalidator = null
      } else {
        invalidator.bind()
      }
    })
    this.revalidated()
    return this.output()
  }

  invalidate (context) {
    super.invalidate(context)
    if (!this.calculated && this.invalidator != null) {
      this.invalidator.unbind()
    }
    return this
  }

  destroy () {
    if (this.invalidator != null) {
      return this.invalidator.unbind()
    }
  }
}

module.exports = InvalidatedGetter

},{"../Invalidator":76,"./CalculatedGetter":80}],83:[function(require,module,exports){
const BaseGetter = require('./BaseGetter')

class ManualGetter extends BaseGetter {
  get () {
    this.prop.setter.setRawValue(this.prop.callOptionFunct('get'))
    this.calculated = true
    this.initiated = true
    return this.output()
  }
}

module.exports = ManualGetter

},{"./BaseGetter":79}],84:[function(require,module,exports){
const BaseGetter = require('./BaseGetter')

class SimpleGetter extends BaseGetter {
  get () {
    this.calculated = true
    if (!this.initiated) {
      this.initiated = true
      this.prop.events.emit('updated')
    }
    return this.output()
  }
}

module.exports = SimpleGetter

},{"./BaseGetter":79}],85:[function(require,module,exports){

const PropertyWatcher = require('../watchers/PropertyWatcher')

class BaseSetter {
  constructor (prop) {
    this.prop = prop
  }

  init () {
    this.setDefaultValue()
  }

  setDefaultValue () {
    this.setRawValue(this.ingest(this.prop.options.default))
  }

  loadInternalWatcher () {
    const changeOpt = this.prop.options.change
    if (typeof changeOpt === 'function') {
      this.watcher = new PropertyWatcher({
        property: this.prop,
        callback: changeOpt,
        scope: this.prop.options.scope,
        autoBind: true
      })
    } else if (changeOpt != null && typeof changeOpt.copyWith === 'function') {
      this.watcher = changeOpt.copyWith({
        property: this.prop,
        scope: this.prop.options.scope,
        autoBind: true
      })
    }
    return this.watcher
  }

  set (val) {
    throw new Error('Not implemented')
  }

  setRawValue (val) {
    this.prop.value = val
    return this.prop.value
  }

  ingest (val) {
    if (typeof this.prop.options.ingest === 'function') {
      val = this.prop.callOptionFunct('ingest', val)
    }
    return val
  }

  checkChanges (val, old) {
    return val !== old
  }

  changed (old) {
    const context = { origin: this.prop }
    this.prop.events.emit('updated', old, context)
    this.prop.events.emit('changed', old, context)
    return this
  }

  /**
   * @param {PropertyDescriptorMap} opt
   * @return {PropertyDescriptorMap}
   */
  getScopeGetterSetters (opt) {
    const prop = this.prop
    opt[this.prop.options.name] = opt[this.prop.options.name] || {}
    opt[this.prop.options.name].set = function (val) {
      return prop.set(val)
    }
    return opt
  }
}

module.exports = BaseSetter

},{"../watchers/PropertyWatcher":91}],86:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class BaseValueSetter extends BaseSetter {
  set (val) {
    val = this.ingest(val)
    if (this.prop.getter.baseValue !== val) {
      this.prop.getter.baseValue = val
      this.prop.invalidate()
    }
    return this
  }
}

module.exports = BaseValueSetter

},{"./BaseSetter":85}],87:[function(require,module,exports){
const SimpleSetter = require('./SimpleSetter')
const Collection = require('spark-collection')
const CollectionPropertyWatcher = require('../watchers/CollectionPropertyWatcher')

class CollectionSetter extends SimpleSetter {
  init () {
    this.options = Object.assign(
      {},
      CollectionSetter.defaultOptions,
      typeof this.prop.options.collection === 'object' ? this.prop.options.collection : {}
    )
    super.init()
  }

  loadInternalWatcher () {
    if (
      typeof this.prop.options.change === 'function' ||
      typeof this.prop.options.itemAdded === 'function' ||
      typeof this.prop.options.itemRemoved === 'function'
    ) {
      return new CollectionPropertyWatcher({
        property: this.prop,
        callback: this.prop.options.change,
        onAdded: this.prop.options.itemAdded,
        onRemoved: this.prop.options.itemRemoved,
        scope: this.prop.options.scope,
        autoBind: true
      })
    } else {
      super.loadInternalWatcher()
    }
  }

  setRawValue (val) {
    this.prop.value = this.makeCollection(val)
    return this.prop.value
  }

  makeCollection (val) {
    val = this.valToArray(val)
    const prop = this.prop
    const col = Collection.newSubClass(this.options, val)
    col.changed = function (old) {
      prop.setter.changed(old)
    }
    return col
  }

  valToArray (val) {
    if (val == null) {
      return []
    } else if (typeof val.toArray === 'function') {
      return val.toArray()
    } else if (Array.isArray(val)) {
      return val.slice()
    } else {
      return [val]
    }
  }

  checkChanges (val, old) {
    var compareFunction
    if (typeof this.options.compare === 'function') {
      compareFunction = this.options.compare
    }
    return (new Collection(val)).checkChanges(old, this.options.ordered, compareFunction)
  }
}

CollectionSetter.defaultOptions = {
  compare: false,
  ordered: true
}

module.exports = CollectionSetter

},{"../watchers/CollectionPropertyWatcher":90,"./SimpleSetter":89,"spark-collection":73}],88:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class ManualSetter extends BaseSetter {
  set (val) {
    this.prop.callOptionFunct('set', val)
  }
}

module.exports = ManualSetter

},{"./BaseSetter":85}],89:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class SimpleSetter extends BaseSetter {
  set (val) {
    var old
    val = this.ingest(val)
    this.prop.getter.revalidated()
    if (this.checkChanges(val, this.prop.value)) {
      old = this.prop.value
      this.setRawValue(val)
      this.prop.manual = true
      this.changed(old)
    }
    return this
  }
}

module.exports = SimpleSetter

},{"./BaseSetter":85}],90:[function(require,module,exports){

const PropertyWatcher = require('./PropertyWatcher')

class CollectionPropertyWatcher extends PropertyWatcher {
  loadOptions (options) {
    super.loadOptions(options)
    this.onAdded = options.onAdded
    this.onRemoved = options.onRemoved
  }

  handleChange (value, old) {
    old = value.copy(old || [])
    if (typeof this.callback === 'function') {
      this.callback.call(this.scope, value, old)
    }
    if (typeof this.onAdded === 'function') {
      value.forEach((item, i) => {
        if (!old.includes(item)) {
          return this.onAdded.call(this.scope, item)
        }
      })
    }
    if (typeof this.onRemoved === 'function') {
      return old.forEach((item, i) => {
        if (!value.includes(item)) {
          return this.onRemoved.call(this.scope, item)
        }
      })
    }
  }
}

module.exports = CollectionPropertyWatcher

},{"./PropertyWatcher":91}],91:[function(require,module,exports){

const Binder = require('spark-binding').Binder
const Reference = require('spark-binding').Reference

/**
 * @template T
 */
class PropertyWatcher extends Binder {
  /**
   * @typedef {Object} PropertyWatcherOptions
   * @property {import("./Property")<T>|string} property
   * @property {function(T,T)} callback
   * @property {boolean} [autoBind]
   * @property {*} [scope]
   *
   * @param {PropertyWatcherOptions} options
   */
  constructor (options) {
    super()
    this.options = options
    this.invalidateCallback = (context) => {
      if (this.validContext(context)) {
        this.invalidate()
      }
    }
    this.updateCallback = (old, context) => {
      if (this.validContext(context)) {
        this.update(old)
      }
    }
    if (this.options != null) {
      this.loadOptions(this.options)
    }
    this.init()
  }

  loadOptions (options) {
    this.scope = options.scope
    this.property = options.property
    this.callback = options.callback
    this.autoBind = options.autoBind
    return this
  }

  copyWith (options) {
    return new this.constructor(Object.assign({}, this.options, options))
  }

  init () {
    if (this.autoBind) {
      return this.checkBind()
    }
  }

  getProperty () {
    if (typeof this.property === 'string') {
      return this.getPropByName(this.property)
    }
    return this.property
  }

  getPropByName (prop, target = this.scope) {
    if (target.propertiesManager != null) {
      return target.propertiesManager.getProperty(prop)
    } else if (target[prop + 'Property'] != null) {
      return target[prop + 'Property']
    } else {
      throw new Error(`Could not find the property ${prop}`)
    }
  }

  checkBind () {
    return this.toggleBind(this.shouldBind())
  }

  shouldBind () {
    return true
  }

  canBind () {
    return this.getProperty() != null
  }

  doBind () {
    this.update()
    this.getProperty().events.on('invalidated', this.invalidateCallback)
    return this.getProperty().events.on('updated', this.updateCallback)
  }

  doUnbind () {
    this.getProperty().events.off('invalidated', this.invalidateCallback)
    return this.getProperty().events.off('updated', this.updateCallback)
  }

  equals (watcher) {
    return watcher.constructor === this.constructor &&
      watcher != null &&
      watcher.event === this.event &&
      watcher.getProperty() === this.getProperty() &&
      Reference.compareVal(watcher.callback, this.callback)
  }

  validContext (context) {
    return context == null || !context.preventImmediate
  }

  invalidate () {
    return this.getProperty().get()
  }

  update (old) {
    var value
    value = this.getProperty().get()
    return this.handleChange(value, old)
  }

  handleChange (value, old) {
    return this.callback.call(this.scope, value, old)
  }
};

module.exports = PropertyWatcher

},{"spark-binding":69}],92:[function(require,module,exports){
var Element, Mixable, PropertiesManager;

PropertiesManager = require('spark-properties').PropertiesManager;

Mixable = require('./Mixable');

module.exports = Element = (function() {
  class Element extends Mixable {
    constructor(data) {
      super();
      this.initPropertiesManager(data);
      this.init();
      this.propertiesManager.initWatchers();
    }

    initPropertiesManager(data) {
      this.propertiesManager = this.propertiesManager.useScope(this);
      this.propertiesManager.initProperties();
      this.propertiesManager.createScopeGetterSetters();
      if (typeof data === "object") {
        this.propertiesManager.setPropertiesData(data);
      }
      return this;
    }

    init() {
      return this;
    }

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

    destroy() {
      return this.propertiesManager.destroy();
    }

    getFinalProperties() {
      return ['propertiesManager'];
    }

    extended(target) {
      if (target.propertiesManager) {
        return target.propertiesManager = target.propertiesManager.copyWith(this.propertiesManager.propertiesOptions);
      } else {
        return target.propertiesManager = this.propertiesManager;
      }
    }

    static property(prop, desc) {
      return this.prototype.propertiesManager = this.prototype.propertiesManager.withProperty(prop, desc);
    }

    static properties(properties) {
      return this.prototype.propertiesManager = this.prototype.propertiesManager.copyWith(properties);
    }

  };

  Element.prototype.propertiesManager = new PropertiesManager();

  return Element;

}).call(this);



},{"./Mixable":96,"spark-properties":75}],93:[function(require,module,exports){
var ActivablePropertyWatcher, Invalidator, PropertyWatcher;

PropertyWatcher = require('spark-properties').watchers.PropertyWatcher;

Invalidator = require('spark-properties').Invalidator;

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



},{"spark-properties":75}],94:[function(require,module,exports){
var Invalidated, Invalidator;

Invalidator = require('spark-properties').Invalidator;

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



},{"spark-properties":75}],95:[function(require,module,exports){
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



},{"./Overrider":97}],96:[function(require,module,exports){
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



},{}],97:[function(require,module,exports){
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



},{}],98:[function(require,module,exports){
var Binder, Updater;

Binder = require('spark-binding').Binder;

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



},{"spark-binding":69}],99:[function(require,module,exports){
module.exports = {
  "Element": require("./Element"),
  "Loader": require("./Loader"),
  "Mixable": require("./Mixable"),
  "Overrider": require("./Overrider"),
  "Updater": require("./Updater"),
  "Invalidated": {
    "ActivablePropertyWatcher": require("./Invalidated/ActivablePropertyWatcher"),
    "Invalidated": require("./Invalidated/Invalidated"),
  },
}
},{"./Element":92,"./Invalidated/ActivablePropertyWatcher":93,"./Invalidated/Invalidated":94,"./Loader":95,"./Mixable":96,"./Overrider":97,"./Updater":98}],100:[function(require,module,exports){
var libs;

libs = require('./libs');

module.exports = Object.assign({
  'Collection': require('spark-collection')
}, libs, require('spark-properties'), require('spark-binding'));



},{"./libs":99,"spark-binding":69,"spark-collection":73,"spark-properties":75}]},{},[65])(65)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkLmpzIiwiLi4vcGFyYWxsZWxpby1ncmlkcy9saWIvR3JpZENlbGwuanMiLCIuLi9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkUm93LmpzIiwiLi4vcGFyYWxsZWxpby1ncmlkcy9saWIvZ3JpZHMuanMiLCIuLi9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvZGlzdC9wYXRoZmluZGVyLmpzIiwiLi4vcGFyYWxsZWxpby1zdHJpbmdzL3N0cmluZ3MuanMiLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9ncmVla0FscGhhYmV0Lmpzb24iLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9zdGFyTmFtZXMuanNvbiIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL0RpcmVjdGlvbi5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGUuanMiLCIuLi9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlQ29udGFpbmVyLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZVJlZmVyZW5jZS5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVkLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvdGlsZXMuanMiLCIuLi9wYXJhbGxlbGlvLXRpbWluZy9ub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aW1pbmcvZGlzdC90aW1pbmcuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvQ29ubmVjdGVkLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1NpZ25hbC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9TaWduYWxPcGVyYXRpb24uanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvU2lnbmFsU291cmNlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1N3aXRjaC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9XaXJlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL3dpcmluZy5qcyIsImxpYi9BaXJsb2NrLmpzIiwibGliL0FwcHJvYWNoLmpzIiwibGliL0F1dG9tYXRpY0Rvb3IuanMiLCJsaWIvQ2hhcmFjdGVyLmpzIiwibGliL0NoYXJhY3RlckFJLmpzIiwibGliL0NvbmZyb250YXRpb24uanMiLCJsaWIvRGFtYWdlUHJvcGFnYXRpb24uanMiLCJsaWIvRGFtYWdlYWJsZS5qcyIsImxpYi9Eb29yLmpzIiwibGliL0VsZW1lbnQuanMiLCJsaWIvRW5jb3VudGVyTWFuYWdlci5qcyIsImxpYi9GbG9vci5qcyIsImxpYi9HYW1lLmpzIiwibGliL0ludmVudG9yeS5qcyIsImxpYi9MaW5lT2ZTaWdodC5qcyIsImxpYi9NYXAuanMiLCJsaWIvT2JzdGFjbGUuanMiLCJsaWIvUGF0aFdhbGsuanMiLCJsaWIvUGVyc29uYWxXZWFwb24uanMiLCJsaWIvUGxheWVyLmpzIiwibGliL1Byb2plY3RpbGUuanMiLCJsaWIvUmVzc291cmNlLmpzIiwibGliL1Jlc3NvdXJjZVR5cGUuanMiLCJsaWIvUm9vbUdlbmVyYXRvci5qcyIsImxpYi9TaGlwLmpzIiwibGliL1NoaXBJbnRlcmlvci5qcyIsImxpYi9TaGlwV2VhcG9uLmpzIiwibGliL1N0YXJNYXBHZW5lcmF0b3IuanMiLCJsaWIvU3RhclN5c3RlbS5qcyIsImxpYi9UcmF2ZWwuanMiLCJsaWIvVmlldy5qcyIsImxpYi9WaXNpb25DYWxjdWxhdG9yLmpzIiwibGliL2FjdGlvbnMvQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9BdHRhY2tBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9BdHRhY2tNb3ZlQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9UYXJnZXRBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9UaWxlZEFjdGlvblByb3ZpZGVyLmpzIiwibGliL2FjdGlvbnMvVHJhdmVsQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvV2Fsa0FjdGlvbi5qcyIsImxpYi9saWJzLmpzIiwibGliL3BhcmFsbGVsaW8uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsIi4uL3NwYXJrLWJpbmRpbmcvaW5kZXguanMiLCIuLi9zcGFyay1iaW5kaW5nL3NyYy9CaW5kZXIuanMiLCIuLi9zcGFyay1iaW5kaW5nL3NyYy9FdmVudEJpbmQuanMiLCIuLi9zcGFyay1iaW5kaW5nL3NyYy9SZWZlcmVuY2UuanMiLCIuLi9zcGFyay1jb2xsZWN0aW9uL2luZGV4LmpzIiwiLi4vc3BhcmstY29sbGVjdGlvbi9zcmMvQ29sbGVjdGlvbi5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvaW5kZXguanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9JbnZhbGlkYXRvci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL1Byb3BlcnRpZXNNYW5hZ2VyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvUHJvcGVydHkuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0Jhc2VHZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0NhbGN1bGF0ZWRHZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0NvbXBvc2l0ZUdldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL2dldHRlcnMvSW52YWxpZGF0ZWRHZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL01hbnVhbEdldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL2dldHRlcnMvU2ltcGxlR2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9CYXNlU2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9CYXNlVmFsdWVTZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL0NvbGxlY3Rpb25TZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL01hbnVhbFNldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvU2ltcGxlU2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvd2F0Y2hlcnMvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3dhdGNoZXJzL1Byb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0VsZW1lbnQuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZC5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0xvYWRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL01peGFibGUuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9PdmVycmlkZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9VcGRhdGVyLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvbGlicy5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL3NwYXJrLXN0YXJ0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgRWxlbWVudCwgR3JpZCwgR3JpZENlbGwsIEdyaWRSb3c7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuR3JpZENlbGwgPSByZXF1aXJlKCcuL0dyaWRDZWxsJyk7XG5cbkdyaWRSb3cgPSByZXF1aXJlKCcuL0dyaWRSb3cnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHcmlkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgYWRkQ2VsbChjZWxsID0gbnVsbCkge1xuICAgICAgdmFyIHJvdywgc3BvdDtcbiAgICAgIGlmICghY2VsbCkge1xuICAgICAgICBjZWxsID0gbmV3IEdyaWRDZWxsKCk7XG4gICAgICB9XG4gICAgICBzcG90ID0gdGhpcy5nZXRGcmVlU3BvdCgpO1xuICAgICAgcm93ID0gdGhpcy5yb3dzLmdldChzcG90LnJvdyk7XG4gICAgICBpZiAoIXJvdykge1xuICAgICAgICByb3cgPSB0aGlzLmFkZFJvdygpO1xuICAgICAgfVxuICAgICAgcm93LmFkZENlbGwoY2VsbCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG5cbiAgICBhZGRSb3cocm93ID0gbnVsbCkge1xuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcm93ID0gbmV3IEdyaWRSb3coKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucm93cy5wdXNoKHJvdyk7XG4gICAgICByZXR1cm4gcm93O1xuICAgIH1cblxuICAgIGdldEZyZWVTcG90KCkge1xuICAgICAgdmFyIHNwb3Q7XG4gICAgICBzcG90ID0gbnVsbDtcbiAgICAgIHRoaXMucm93cy5zb21lKChyb3cpID0+IHtcbiAgICAgICAgaWYgKHJvdy5jZWxscy5sZW5ndGggPCB0aGlzLm1heENvbHVtbnMpIHtcbiAgICAgICAgICByZXR1cm4gc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogcm93LnJvd1Bvc2l0aW9uLFxuICAgICAgICAgICAgY29sdW1uOiByb3cuY2VsbHMubGVuZ3RoXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIXNwb3QpIHtcbiAgICAgICAgaWYgKHRoaXMubWF4Q29sdW1ucyA+IHRoaXMucm93cy5sZW5ndGgpIHtcbiAgICAgICAgICBzcG90ID0ge1xuICAgICAgICAgICAgcm93OiB0aGlzLnJvd3MubGVuZ3RoLFxuICAgICAgICAgICAgY29sdW1uOiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcG90ID0ge1xuICAgICAgICAgICAgcm93OiAwLFxuICAgICAgICAgICAgY29sdW1uOiB0aGlzLm1heENvbHVtbnMgKyAxXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNwb3Q7XG4gICAgfVxuXG4gIH07XG5cbiAgR3JpZC5wcm9wZXJ0aWVzKHtcbiAgICByb3dzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIHJvdy5ncmlkID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIGlmIChyb3cuZ3JpZCA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiByb3cuZ3JpZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1heENvbHVtbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHJvd3M7XG4gICAgICAgIHJvd3MgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMucm93c1Byb3BlcnR5KTtcbiAgICAgICAgcmV0dXJuIHJvd3MucmVkdWNlKGZ1bmN0aW9uKG1heCwgcm93KSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGgubWF4KG1heCwgaW52YWxpZGF0b3IucHJvcChyb3cuY2VsbHNQcm9wZXJ0eSkubGVuZ3RoKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBFbGVtZW50LCBHcmlkQ2VsbDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdyaWRDZWxsID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHcmlkQ2VsbCBleHRlbmRzIEVsZW1lbnQge307XG5cbiAgR3JpZENlbGwucHJvcGVydGllcyh7XG4gICAgZ3JpZDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgoJ2dyaWQucm93Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICByb3c6IHt9LFxuICAgIGNvbHVtblBvc2l0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByb3c7XG4gICAgICAgIHJvdyA9IGludmFsaWRhdG9yLnByb3AodGhpcy5yb3dQcm9wZXJ0eSk7XG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChyb3cuY2VsbHNQcm9wZXJ0eSkuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgd2lkdGg6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIDEgLyBpbnZhbGlkYXRvci5wcm9wUGF0aCgncm93LmNlbGxzJykubGVuZ3RoO1xuICAgICAgfVxuICAgIH0sXG4gICAgbGVmdDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLndpZHRoUHJvcGVydHkpICogaW52YWxpZGF0b3IucHJvcCh0aGlzLmNvbHVtblBvc2l0aW9uUHJvcGVydHkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AodGhpcy53aWR0aFByb3BlcnR5KSAqIChpbnZhbGlkYXRvci5wcm9wKHRoaXMuY29sdW1uUG9zaXRpb25Qcm9wZXJ0eSkgKyAxKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3Jvdy5oZWlnaHQnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvcDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3Jvdy50b3AnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3Jvdy5ib3R0b20nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkQ2VsbDtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBFbGVtZW50LCBHcmlkQ2VsbCwgR3JpZFJvdztcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5HcmlkQ2VsbCA9IHJlcXVpcmUoJy4vR3JpZENlbGwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkUm93ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHcmlkUm93IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgYWRkQ2VsbChjZWxsID0gbnVsbCkge1xuICAgICAgaWYgKCFjZWxsKSB7XG4gICAgICAgIGNlbGwgPSBuZXcgR3JpZENlbGwoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2VsbHMucHVzaChjZWxsKTtcbiAgICAgIHJldHVybiBjZWxsO1xuICAgIH1cblxuICB9O1xuXG4gIEdyaWRSb3cucHJvcGVydGllcyh7XG4gICAgZ3JpZDoge30sXG4gICAgY2VsbHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgcmV0dXJuIGNlbGwucm93ID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24oY2VsbCkge1xuICAgICAgICBpZiAoY2VsbC5yb3cgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gY2VsbC5yb3cgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByb3dQb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgZ3JpZDtcbiAgICAgICAgZ3JpZCA9IGludmFsaWRhdG9yLnByb3AodGhpcy5ncmlkUHJvcGVydHkpO1xuICAgICAgICBpZiAoZ3JpZCkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKGdyaWQucm93c1Byb3BlcnR5KS5pbmRleE9mKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIDEgLyBpbnZhbGlkYXRvci5wcm9wUGF0aCgnZ3JpZC5yb3dzJykubGVuZ3RoO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG9wOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMuaGVpZ2h0UHJvcGVydHkpICogaW52YWxpZGF0b3IucHJvcCh0aGlzLnJvd1Bvc2l0aW9uUHJvcGVydHkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYm90dG9tOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMuaGVpZ2h0UHJvcGVydHkpICogKGludmFsaWRhdG9yLnByb3AodGhpcy5yb3dQb3NpdGlvblByb3BlcnR5KSArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWRSb3c7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJHcmlkXCI6IHJlcXVpcmUoXCIuL0dyaWRcIiksXG4gIFwiR3JpZENlbGxcIjogcmVxdWlyZShcIi4vR3JpZENlbGxcIiksXG4gIFwiR3JpZFJvd1wiOiByZXF1aXJlKFwiLi9HcmlkUm93XCIpLFxufSIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgUGF0aEZpbmRlcj1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7UGF0aEZpbmRlci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVBhdGhGaW5kZXI7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5QYXRoRmluZGVyPVBhdGhGaW5kZXI7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5QYXRoRmluZGVyPVBhdGhGaW5kZXI7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgUGF0aEZpbmRlcjtcblBhdGhGaW5kZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBhdGhGaW5kZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0NvbnRhaW5lciwgZnJvbTEsIHRvMSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy50aWxlc0NvbnRhaW5lciA9IHRpbGVzQ29udGFpbmVyO1xuICAgICAgdGhpcy5mcm9tID0gZnJvbTE7XG4gICAgICB0aGlzLnRvID0gdG8xO1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgaWYgKG9wdGlvbnMudmFsaWRUaWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy52YWxpZFRpbGVDYWxsYmFjayA9IG9wdGlvbnMudmFsaWRUaWxlO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuYXJyaXZlZCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYXJyaXZlZENhbGxiYWNrID0gb3B0aW9ucy5hcnJpdmVkO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuZWZmaWNpZW5jeSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeUNhbGxiYWNrID0gb3B0aW9ucy5lZmZpY2llbmN5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0KCkge1xuICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgdGhpcy5wYXRocyA9IHt9O1xuICAgICAgdGhpcy5zb2x1dGlvbiA9IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY2FsY3VsKCkge1xuICAgICAgd2hpbGUgKCF0aGlzLnNvbHV0aW9uICYmICghdGhpcy5zdGFydGVkIHx8IHRoaXMucXVldWUubGVuZ3RoKSkge1xuICAgICAgICB0aGlzLnN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICBzdGVwKCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMucXVldWUucG9wKCk7XG4gICAgICAgIHRoaXMuYWRkTmV4dFN0ZXBzKG5leHQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGlzLnRvID09PSBmYWxzZSB8fCB0aGlzLnRpbGVJc1ZhbGlkKHRoaXMudG8pKSB7XG4gICAgICAgIHRoaXMuYWRkTmV4dFN0ZXBzKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBhdGgoKSB7XG4gICAgICB2YXIgcmVzLCBzdGVwO1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgcmVzID0gW3RoaXMuc29sdXRpb25dO1xuICAgICAgICBzdGVwID0gdGhpcy5zb2x1dGlvbjtcbiAgICAgICAgd2hpbGUgKHN0ZXAucHJldiAhPSBudWxsKSB7XG4gICAgICAgICAgcmVzLnVuc2hpZnQoc3RlcC5wcmV2KTtcbiAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UG9zQXRQcmMocHJjKSB7XG4gICAgICBpZiAoaXNOYU4ocHJjKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQb3NBdFRpbWUodGhpcy5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpICogcHJjKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb3NBdFRpbWUodGltZSkge1xuICAgICAgdmFyIHByYywgc3RlcDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIGlmICh0aW1lID49IHRoaXMuc29sdXRpb24uZ2V0VG90YWxMZW5ndGgoKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNvbHV0aW9uLnBvc1RvVGlsZU9mZnNldCh0aGlzLnNvbHV0aW9uLmdldEV4aXQoKS54LCB0aGlzLnNvbHV0aW9uLmdldEV4aXQoKS55KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGVwID0gdGhpcy5zb2x1dGlvbjtcbiAgICAgICAgICB3aGlsZSAoc3RlcC5nZXRTdGFydExlbmd0aCgpID4gdGltZSAmJiAoc3RlcC5wcmV2ICE9IG51bGwpKSB7XG4gICAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmMgPSAodGltZSAtIHN0ZXAuZ2V0U3RhcnRMZW5ndGgoKSkgLyBzdGVwLmdldExlbmd0aCgpO1xuICAgICAgICAgIHJldHVybiBzdGVwLnBvc1RvVGlsZU9mZnNldChzdGVwLmdldEVudHJ5KCkueCArIChzdGVwLmdldEV4aXQoKS54IC0gc3RlcC5nZXRFbnRyeSgpLngpICogcHJjLCBzdGVwLmdldEVudHJ5KCkueSArIChzdGVwLmdldEV4aXQoKS55IC0gc3RlcC5nZXRFbnRyeSgpLnkpICogcHJjKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGdldFNvbHV0aW9uVGlsZUxpc3QoKSB7XG4gICAgICB2YXIgc3RlcCwgdGlsZWxpc3Q7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICBzdGVwID0gdGhpcy5zb2x1dGlvbjtcbiAgICAgICAgdGlsZWxpc3QgPSBbc3RlcC50aWxlXTtcbiAgICAgICAgd2hpbGUgKHN0ZXAucHJldiAhPSBudWxsKSB7XG4gICAgICAgICAgc3RlcCA9IHN0ZXAucHJldjtcbiAgICAgICAgICB0aWxlbGlzdC51bnNoaWZ0KHN0ZXAudGlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGVsaXN0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRpbGVJc1ZhbGlkKHRpbGUpIHtcbiAgICAgIGlmICh0aGlzLnZhbGlkVGlsZUNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sodGlsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCkgJiYgKCF0aWxlLmVtdWxhdGVkIHx8ICh0aWxlLnRpbGUgIT09IDAgJiYgdGlsZS50aWxlICE9PSBmYWxzZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFRpbGUoeCwgeSkge1xuICAgICAgdmFyIHJlZjE7XG4gICAgICBpZiAodGhpcy50aWxlc0NvbnRhaW5lci5nZXRUaWxlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNDb250YWluZXIuZ2V0VGlsZSh4LCB5KTtcbiAgICAgIH0gZWxzZSBpZiAoKChyZWYxID0gdGhpcy50aWxlc0NvbnRhaW5lclt5XSkgIT0gbnVsbCA/IHJlZjFbeF0gOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiB4LFxuICAgICAgICAgIHk6IHksXG4gICAgICAgICAgdGlsZTogdGhpcy50aWxlc0NvbnRhaW5lclt5XVt4XSxcbiAgICAgICAgICBlbXVsYXRlZDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldENvbm5lY3RlZFRvVGlsZSh0aWxlKSB7XG4gICAgICB2YXIgY29ubmVjdGVkLCB0O1xuICAgICAgaWYgKHRpbGUuZ2V0Q29ubmVjdGVkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRpbGUuZ2V0Q29ubmVjdGVkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25uZWN0ZWQgPSBbXTtcbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54ICsgMSwgdGlsZS55KSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCAtIDEsIHRpbGUueSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLngsIHRpbGUueSArIDEpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54LCB0aWxlLnkgLSAxKSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25uZWN0ZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkTmV4dFN0ZXBzKHN0ZXAgPSBudWxsKSB7XG4gICAgICB2YXIgaSwgbGVuLCBuZXh0LCByZWYxLCByZXN1bHRzLCB0aWxlO1xuICAgICAgdGlsZSA9IHN0ZXAgIT0gbnVsbCA/IHN0ZXAubmV4dFRpbGUgOiB0aGlzLmZyb207XG4gICAgICByZWYxID0gdGhpcy5nZXRDb25uZWN0ZWRUb1RpbGUodGlsZSk7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYxLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIG5leHQgPSByZWYxW2ldO1xuICAgICAgICBpZiAodGhpcy50aWxlSXNWYWxpZChuZXh0KSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFkZFN0ZXAobmV3IFBhdGhGaW5kZXIuU3RlcCh0aGlzLCAoc3RlcCAhPSBudWxsID8gc3RlcCA6IG51bGwpLCB0aWxlLCBuZXh0KSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICB0aWxlRXF1YWwodGlsZUEsIHRpbGVCKSB7XG4gICAgICByZXR1cm4gdGlsZUEgPT09IHRpbGVCIHx8ICgodGlsZUEuZW11bGF0ZWQgfHwgdGlsZUIuZW11bGF0ZWQpICYmIHRpbGVBLnggPT09IHRpbGVCLnggJiYgdGlsZUEueSA9PT0gdGlsZUIueSk7XG4gICAgfVxuXG4gICAgYXJyaXZlZEF0RGVzdGluYXRpb24oc3RlcCkge1xuICAgICAgaWYgKHRoaXMuYXJyaXZlZENhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyaXZlZENhbGxiYWNrKHN0ZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZUVxdWFsKHN0ZXAudGlsZSwgdGhpcy50byk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkU3RlcChzdGVwKSB7XG4gICAgICB2YXIgc29sdXRpb25DYW5kaWRhdGU7XG4gICAgICBpZiAodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICghKCh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldICE9IG51bGwpICYmIHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0uZ2V0VG90YWxMZW5ndGgoKSA8PSBzdGVwLmdldFRvdGFsTGVuZ3RoKCkpKSB7XG4gICAgICAgIGlmICh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZVN0ZXAodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSA9IHN0ZXA7XG4gICAgICAgIHRoaXMucXVldWUuc3BsaWNlKHRoaXMuZ2V0U3RlcFJhbmsoc3RlcCksIDAsIHN0ZXApO1xuICAgICAgICBzb2x1dGlvbkNhbmRpZGF0ZSA9IG5ldyBQYXRoRmluZGVyLlN0ZXAodGhpcywgc3RlcCwgc3RlcC5uZXh0VGlsZSwgbnVsbCk7XG4gICAgICAgIGlmICh0aGlzLmFycml2ZWRBdERlc3RpbmF0aW9uKHNvbHV0aW9uQ2FuZGlkYXRlKSAmJiAhKCh0aGlzLnNvbHV0aW9uICE9IG51bGwpICYmIHRoaXMuc29sdXRpb24ucHJldi5nZXRUb3RhbExlbmd0aCgpIDw9IHN0ZXAuZ2V0VG90YWxMZW5ndGgoKSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zb2x1dGlvbiA9IHNvbHV0aW9uQ2FuZGlkYXRlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlU3RlcChzdGVwKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpbmRleCA9IHRoaXMucXVldWUuaW5kZXhPZihzdGVwKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYmVzdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlW3RoaXMucXVldWUubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgZ2V0U3RlcFJhbmsoc3RlcCkge1xuICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKHN0ZXAuZ2V0RWZmaWNpZW5jeSgpLCAwLCB0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCBtaW4sIG1heCkge1xuICAgICAgdmFyIHJlZiwgcmVmUG9zO1xuICAgICAgcmVmUG9zID0gTWF0aC5mbG9vcigobWF4IC0gbWluKSAvIDIpICsgbWluO1xuICAgICAgcmVmID0gdGhpcy5xdWV1ZVtyZWZQb3NdLmdldEVmZmljaWVuY3koKTtcbiAgICAgIGlmIChyZWYgPT09IGVmZmljaWVuY3kpIHtcbiAgICAgICAgcmV0dXJuIHJlZlBvcztcbiAgICAgIH0gZWxzZSBpZiAocmVmID4gZWZmaWNpZW5jeSkge1xuICAgICAgICBpZiAocmVmUG9zID09PSBtaW4pIHtcbiAgICAgICAgICByZXR1cm4gbWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCBtaW4sIHJlZlBvcyAtIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVmUG9zID09PSBtYXgpIHtcbiAgICAgICAgICByZXR1cm4gbWF4ICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoZWZmaWNpZW5jeSwgcmVmUG9zICsgMSwgbWF4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFBhdGhGaW5kZXIucHJvcGVydGllcyh7XG4gICAgdmFsaWRUaWxlQ2FsbGJhY2s6IHt9XG4gIH0pO1xuXG4gIHJldHVybiBQYXRoRmluZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5QYXRoRmluZGVyLlN0ZXAgPSBjbGFzcyBTdGVwIHtcbiAgY29uc3RydWN0b3IocGF0aEZpbmRlciwgcHJldiwgdGlsZTEsIG5leHRUaWxlKSB7XG4gICAgdGhpcy5wYXRoRmluZGVyID0gcGF0aEZpbmRlcjtcbiAgICB0aGlzLnByZXYgPSBwcmV2O1xuICAgIHRoaXMudGlsZSA9IHRpbGUxO1xuICAgIHRoaXMubmV4dFRpbGUgPSBuZXh0VGlsZTtcbiAgfVxuXG4gIHBvc1RvVGlsZU9mZnNldCh4LCB5KSB7XG4gICAgdmFyIHRpbGU7XG4gICAgdGlsZSA9IE1hdGguZmxvb3IoeCkgPT09IHRoaXMudGlsZS54ICYmIE1hdGguZmxvb3IoeSkgPT09IHRoaXMudGlsZS55ID8gdGhpcy50aWxlIDogKHRoaXMubmV4dFRpbGUgIT0gbnVsbCkgJiYgTWF0aC5mbG9vcih4KSA9PT0gdGhpcy5uZXh0VGlsZS54ICYmIE1hdGguZmxvb3IoeSkgPT09IHRoaXMubmV4dFRpbGUueSA/IHRoaXMubmV4dFRpbGUgOiAodGhpcy5wcmV2ICE9IG51bGwpICYmIE1hdGguZmxvb3IoeCkgPT09IHRoaXMucHJldi50aWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy5wcmV2LnRpbGUueSA/IHRoaXMucHJldi50aWxlIDogY29uc29sZS5sb2coJ01hdGguZmxvb3IoJyArIHggKyAnKSA9PSAnICsgdGhpcy50aWxlLngsICdNYXRoLmZsb29yKCcgKyB5ICsgJykgPT0gJyArIHRoaXMudGlsZS55LCB0aGlzKTtcbiAgICByZXR1cm4ge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICB0aWxlOiB0aWxlLFxuICAgICAgb2Zmc2V0WDogeCAtIHRpbGUueCxcbiAgICAgIG9mZnNldFk6IHkgLSB0aWxlLnlcbiAgICB9O1xuICB9XG5cbiAgZ2V0RXhpdCgpIHtcbiAgICBpZiAodGhpcy5leGl0ID09IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLm5leHRUaWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5leGl0ID0ge1xuICAgICAgICAgIHg6ICh0aGlzLnRpbGUueCArIHRoaXMubmV4dFRpbGUueCArIDEpIC8gMixcbiAgICAgICAgICB5OiAodGhpcy50aWxlLnkgKyB0aGlzLm5leHRUaWxlLnkgKyAxKSAvIDJcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZXhpdCA9IHtcbiAgICAgICAgICB4OiB0aGlzLnRpbGUueCArIDAuNSxcbiAgICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGl0O1xuICB9XG5cbiAgZ2V0RW50cnkoKSB7XG4gICAgaWYgKHRoaXMuZW50cnkgPT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMucHJldiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuZW50cnkgPSB7XG4gICAgICAgICAgeDogKHRoaXMudGlsZS54ICsgdGhpcy5wcmV2LnRpbGUueCArIDEpIC8gMixcbiAgICAgICAgICB5OiAodGhpcy50aWxlLnkgKyB0aGlzLnByZXYudGlsZS55ICsgMSkgLyAyXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVudHJ5ID0ge1xuICAgICAgICAgIHg6IHRoaXMudGlsZS54ICsgMC41LFxuICAgICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVudHJ5O1xuICB9XG5cbiAgZ2V0TGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9ICh0aGlzLm5leHRUaWxlID09IG51bGwpIHx8ICh0aGlzLnByZXYgPT0gbnVsbCkgPyAwLjUgOiB0aGlzLnByZXYudGlsZS54ID09PSB0aGlzLm5leHRUaWxlLnggfHwgdGhpcy5wcmV2LnRpbGUueSA9PT0gdGhpcy5uZXh0VGlsZS55ID8gMSA6IE1hdGguc3FydCgwLjUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sZW5ndGg7XG4gIH1cblxuICBnZXRTdGFydExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy5zdGFydExlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXJ0TGVuZ3RoID0gdGhpcy5wcmV2ICE9IG51bGwgPyB0aGlzLnByZXYuZ2V0VG90YWxMZW5ndGgoKSA6IDA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXJ0TGVuZ3RoO1xuICB9XG5cbiAgZ2V0VG90YWxMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMudG90YWxMZW5ndGggPT0gbnVsbCkge1xuICAgICAgdGhpcy50b3RhbExlbmd0aCA9IHRoaXMuZ2V0U3RhcnRMZW5ndGgoKSArIHRoaXMuZ2V0TGVuZ3RoKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRvdGFsTGVuZ3RoO1xuICB9XG5cbiAgZ2V0RWZmaWNpZW5jeSgpIHtcbiAgICBpZiAodGhpcy5lZmZpY2llbmN5ID09IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXRoRmluZGVyLmVmZmljaWVuY3lDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeSA9IHRoaXMucGF0aEZpbmRlci5lZmZpY2llbmN5Q2FsbGJhY2sodGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVmZmljaWVuY3kgPSAtdGhpcy5nZXRSZW1haW5pbmcoKSAqIDEuMSAtIHRoaXMuZ2V0VG90YWxMZW5ndGgoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWZmaWNpZW5jeTtcbiAgfVxuXG4gIGdldFJlbWFpbmluZygpIHtcbiAgICB2YXIgZnJvbSwgdG8sIHgsIHk7XG4gICAgaWYgKHRoaXMucmVtYWluaW5nID09IG51bGwpIHtcbiAgICAgIGZyb20gPSB0aGlzLmdldEV4aXQoKTtcbiAgICAgIHRvID0ge1xuICAgICAgICB4OiB0aGlzLnBhdGhGaW5kZXIudG8ueCArIDAuNSxcbiAgICAgICAgeTogdGhpcy5wYXRoRmluZGVyLnRvLnkgKyAwLjVcbiAgICAgIH07XG4gICAgICB4ID0gdG8ueCAtIGZyb20ueDtcbiAgICAgIHkgPSB0by55IC0gZnJvbS55O1xuICAgICAgdGhpcy5yZW1haW5pbmcgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbWFpbmluZztcbiAgfVxuXG59O1xuXG5yZXR1cm4oUGF0aEZpbmRlcik7fSk7IiwiaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSB7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgZ3JlZWtBbHBoYWJldDogcmVxdWlyZSgnLi9zdHJpbmdzL2dyZWVrQWxwaGFiZXQnKSxcbiAgICAgIHN0YXJOYW1lczogcmVxdWlyZSgnLi9zdHJpbmdzL3N0YXJOYW1lcycpXG4gIH07XG59IiwibW9kdWxlLmV4cG9ydHM9W1xuXCJhbHBoYVwiLCAgIFwiYmV0YVwiLCAgICBcImdhbW1hXCIsICAgXCJkZWx0YVwiLFxuXCJlcHNpbG9uXCIsIFwiemV0YVwiLCAgICBcImV0YVwiLCAgICAgXCJ0aGV0YVwiLFxuXCJpb3RhXCIsICAgIFwia2FwcGFcIiwgICBcImxhbWJkYVwiLCAgXCJtdVwiLFxuXCJudVwiLCAgICAgIFwieGlcIiwgICAgICBcIm9taWNyb25cIiwgXCJwaVwiLFx0XG5cInJob1wiLCAgICAgXCJzaWdtYVwiLCAgIFwidGF1XCIsICAgICBcInVwc2lsb25cIixcblwicGhpXCIsICAgICBcImNoaVwiLCAgICAgXCJwc2lcIiwgICAgIFwib21lZ2FcIlxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblwiQWNoZXJuYXJcIiwgICAgIFwiTWFpYVwiLCAgICAgICAgXCJBdGxhc1wiLCAgICAgICAgXCJTYWxtXCIsICAgICAgIFwiQWxuaWxhbVwiLCAgICAgIFwiTmVra2FyXCIsICAgICAgXCJFbG5hdGhcIiwgICAgICAgXCJUaHViYW5cIixcblwiQWNoaXJkXCIsICAgICAgIFwiTWFyZmlrXCIsICAgICAgXCJBdXZhXCIsICAgICAgICAgXCJTYXJnYXNcIiwgICAgIFwiQWxuaXRha1wiLCAgICAgIFwiTmloYWxcIiwgICAgICAgXCJFbmlmXCIsICAgICAgICAgXCJUb3JjdWxhcmlzXCIsXG5cIkFjcnV4XCIsICAgICAgICBcIk1hcmthYlwiLCAgICAgIFwiQXZpb3JcIiwgICAgICAgIFwiU2FyaW5cIiwgICAgICBcIkFscGhhcmRcIiwgICAgICBcIk51bmtpXCIsICAgICAgIFwiRXRhbWluXCIsICAgICAgIFwiVHVyYWlzXCIsXG5cIkFjdWJlbnNcIiwgICAgICBcIk1hdGFyXCIsICAgICAgIFwiQXplbGZhZmFnZVwiLCAgIFwiU2NlcHRydW1cIiwgICBcIkFscGhla2thXCIsICAgICBcIk51c2FrYW5cIiwgICAgIFwiRm9tYWxoYXV0XCIsICAgIFwiVHlsXCIsXG5cIkFkYXJhXCIsICAgICAgICBcIk1lYnN1dGFcIiwgICAgIFwiQXpoYVwiLCAgICAgICAgIFwiU2NoZWF0XCIsICAgICBcIkFscGhlcmF0elwiLCAgICBcIlBlYWNvY2tcIiwgICAgIFwiRm9ybmFjaXNcIiwgICAgIFwiVW51a2FsaGFpXCIsXG5cIkFkaGFmZXJhXCIsICAgICBcIk1lZ3JlelwiLCAgICAgIFwiQXptaWRpc2tlXCIsICAgIFwiU2VnaW5cIiwgICAgICBcIkFscmFpXCIsICAgICAgICBcIlBoYWRcIiwgICAgICAgIFwiRnVydWRcIiwgICAgICAgIFwiVmVnYVwiLFxuXCJBZGhpbFwiLCAgICAgICAgXCJNZWlzc2FcIiwgICAgICBcIkJhaGFtXCIsICAgICAgICBcIlNlZ2ludXNcIiwgICAgXCJBbHJpc2hhXCIsICAgICAgXCJQaGFldFwiLCAgICAgICBcIkdhY3J1eFwiLCAgICAgICBcIlZpbmRlbWlhdHJpeFwiLFxuXCJBZ2VuYVwiLCAgICAgICAgXCJNZWtidWRhXCIsICAgICBcIkJlY3J1eFwiLCAgICAgICBcIlNoYW1cIiwgICAgICAgXCJBbHNhZmlcIiwgICAgICAgXCJQaGVya2FkXCIsICAgICBcIkdpYW5mYXJcIiwgICAgICBcIldhc2F0XCIsXG5cIkFsYWRmYXJcIiwgICAgICBcIk1lbmthbGluYW5cIiwgIFwiQmVpZFwiLCAgICAgICAgIFwiU2hhcmF0YW5cIiwgICBcIkFsc2NpYXVrYXRcIiwgICBcIlBsZWlvbmVcIiwgICAgIFwiR29tZWlzYVwiLCAgICAgIFwiV2V6ZW5cIixcblwiQWxhdGhmYXJcIiwgICAgIFwiTWVua2FyXCIsICAgICAgXCJCZWxsYXRyaXhcIiwgICAgXCJTaGF1bGFcIiwgICAgIFwiQWxzaGFpblwiLCAgICAgIFwiUG9sYXJpc1wiLCAgICAgXCJHcmFmZmlhc1wiLCAgICAgXCJXZXpuXCIsXG5cIkFsYmFsZGFoXCIsICAgICBcIk1lbmtlbnRcIiwgICAgIFwiQmV0ZWxnZXVzZVwiLCAgIFwiU2hlZGlyXCIsICAgICBcIkFsc2hhdFwiLCAgICAgICBcIlBvbGx1eFwiLCAgICAgIFwiR3JhZmlhc1wiLCAgICAgIFwiWWVkXCIsXG5cIkFsYmFsaVwiLCAgICAgICBcIk1lbmtpYlwiLCAgICAgIFwiQm90ZWluXCIsICAgICAgIFwiU2hlbGlha1wiLCAgICBcIkFsc3VoYWlsXCIsICAgICBcIlBvcnJpbWFcIiwgICAgIFwiR3J1bWl1bVwiLCAgICAgIFwiWWlsZHVuXCIsXG5cIkFsYmlyZW9cIiwgICAgICBcIk1lcmFrXCIsICAgICAgIFwiQnJhY2hpdW1cIiwgICAgIFwiU2lyaXVzXCIsICAgICBcIkFsdGFpclwiLCAgICAgICBcIlByYWVjaXB1YVwiLCAgIFwiSGFkYXJcIiwgICAgICAgIFwiWmFuaWFoXCIsXG5cIkFsY2hpYmFcIiwgICAgICBcIk1lcmdhXCIsICAgICAgIFwiQ2Fub3B1c1wiLCAgICAgIFwiU2l0dWxhXCIsICAgICBcIkFsdGFyZlwiLCAgICAgICBcIlByb2N5b25cIiwgICAgIFwiSGFlZGlcIiwgICAgICAgIFwiWmF1cmFrXCIsXG5cIkFsY29yXCIsICAgICAgICBcIk1lcm9wZVwiLCAgICAgIFwiQ2FwZWxsYVwiLCAgICAgIFwiU2thdFwiLCAgICAgICBcIkFsdGVyZlwiLCAgICAgICBcIlByb3B1c1wiLCAgICAgIFwiSGFtYWxcIiwgICAgICAgIFwiWmF2aWphaFwiLFxuXCJBbGN5b25lXCIsICAgICAgXCJNZXNhcnRoaW1cIiwgICBcIkNhcGhcIiwgICAgICAgICBcIlNwaWNhXCIsICAgICAgXCJBbHVkcmFcIiwgICAgICAgXCJSYW5hXCIsICAgICAgICBcIkhhc3NhbGVoXCIsICAgICBcIlppYmFsXCIsXG5cIkFsZGVyYW1pblwiLCAgICBcIk1ldGFsbGFoXCIsICAgIFwiQ2FzdG9yXCIsICAgICAgIFwiU3Rlcm9wZVwiLCAgICBcIkFsdWxhXCIsICAgICAgICBcIlJhc1wiLCAgICAgICAgIFwiSGV6ZVwiLCAgICAgICAgIFwiWm9zbWFcIixcblwiQWxkaGliYWhcIiwgICAgIFwiTWlhcGxhY2lkdXNcIiwgXCJDZWJhbHJhaVwiLCAgICAgXCJTdWFsb2NpblwiLCAgIFwiQWx5YVwiLCAgICAgICAgIFwiUmFzYWxnZXRoaVwiLCAgXCJIb2VkdXNcIiwgICAgICAgXCJBcXVhcml1c1wiLFxuXCJBbGZpcmtcIiwgICAgICAgXCJNaW5rYXJcIiwgICAgICBcIkNlbGFlbm9cIiwgICAgICBcIlN1YnJhXCIsICAgICAgXCJBbHppcnJcIiwgICAgICAgXCJSYXNhbGhhZ3VlXCIsICBcIkhvbWFtXCIsICAgICAgICBcIkFyaWVzXCIsXG5cIkFsZ2VuaWJcIiwgICAgICBcIk1pbnRha2FcIiwgICAgIFwiQ2hhcmFcIiwgICAgICAgIFwiU3VoYWlsXCIsICAgICBcIkFuY2hhXCIsICAgICAgICBcIlJhc3RhYmFuXCIsICAgIFwiSHlhZHVtXCIsICAgICAgIFwiQ2VwaGV1c1wiLFxuXCJBbGdpZWJhXCIsICAgICAgXCJNaXJhXCIsICAgICAgICBcIkNob3J0XCIsICAgICAgICBcIlN1bGFmYXRcIiwgICAgXCJBbmdldGVuYXJcIiwgICAgXCJSZWd1bHVzXCIsICAgICBcIkl6YXJcIiwgICAgICAgICBcIkNldHVzXCIsXG5cIkFsZ29sXCIsICAgICAgICBcIk1pcmFjaFwiLCAgICAgIFwiQ3Vyc2FcIiwgICAgICAgIFwiU3lybWFcIiwgICAgICBcIkFua2FhXCIsICAgICAgICBcIlJpZ2VsXCIsICAgICAgIFwiSmFiYmFoXCIsICAgICAgIFwiQ29sdW1iYVwiLFxuXCJBbGdvcmFiXCIsICAgICAgXCJNaXJhbVwiLCAgICAgICBcIkRhYmloXCIsICAgICAgICBcIlRhYml0XCIsICAgICAgXCJBbnNlclwiLCAgICAgICAgXCJSb3RhbmV2XCIsICAgICBcIkthamFtXCIsICAgICAgICBcIkNvbWFcIixcblwiQWxoZW5hXCIsICAgICAgIFwiTWlycGhha1wiLCAgICAgXCJEZW5lYlwiLCAgICAgICAgXCJUYWxpdGhhXCIsICAgIFwiQW50YXJlc1wiLCAgICAgIFwiUnVjaGJhXCIsICAgICAgXCJLYXVzXCIsICAgICAgICAgXCJDb3JvbmFcIixcblwiQWxpb3RoXCIsICAgICAgIFwiTWl6YXJcIiwgICAgICAgXCJEZW5lYm9sYVwiLCAgICAgXCJUYW5pYVwiLCAgICAgIFwiQXJjdHVydXNcIiwgICAgIFwiUnVjaGJhaFwiLCAgICAgXCJLZWlkXCIsICAgICAgICAgXCJDcnV4XCIsXG5cIkFsa2FpZFwiLCAgICAgICBcIk11ZnJpZFwiLCAgICAgIFwiRGhlbmViXCIsICAgICAgIFwiVGFyYXplZFwiLCAgICBcIkFya2FiXCIsICAgICAgICBcIlJ1a2JhdFwiLCAgICAgIFwiS2l0YWxwaGFcIiwgICAgIFwiRHJhY29cIixcblwiQWxrYWx1cm9wc1wiLCAgIFwiTXVsaXBoZW5cIiwgICAgXCJEaWFkZW1cIiwgICAgICAgXCJUYXlnZXRhXCIsICAgIFwiQXJuZWJcIiwgICAgICAgIFwiU2FiaWtcIiwgICAgICAgXCJLb2NhYlwiLCAgICAgICAgXCJHcnVzXCIsXG5cIkFsa2VzXCIsICAgICAgICBcIk11cnppbVwiLCAgICAgIFwiRGlwaGRhXCIsICAgICAgIFwiVGVnbWVuXCIsICAgICBcIkFycmFraXNcIiwgICAgICBcIlNhZGFsYWNoYmlhXCIsIFwiS29ybmVwaG9yb3NcIiwgIFwiSHlkcmFcIixcblwiQWxrdXJoYWhcIiwgICAgIFwiTXVzY2lkYVwiLCAgICAgXCJEc2NodWJiYVwiLCAgICAgXCJUZWphdFwiLCAgICAgIFwiQXNjZWxsYVwiLCAgICAgIFwiU2FkYWxtZWxpa1wiLCAgXCJLcmF6XCIsICAgICAgICAgXCJMYWNlcnRhXCIsXG5cIkFsbWFha1wiLCAgICAgICBcIk5hb3NcIiwgICAgICAgIFwiRHNpYmFuXCIsICAgICAgIFwiVGVyZWJlbGx1bVwiLCBcIkFzZWxsdXNcIiwgICAgICBcIlNhZGFsc3V1ZFwiLCAgIFwiS3VtYVwiLCAgICAgICAgIFwiTWVuc2FcIixcblwiQWxuYWlyXCIsICAgICAgIFwiTmFzaFwiLCAgICAgICAgXCJEdWJoZVwiLCAgICAgICAgXCJUaGFiaXRcIiwgICAgIFwiQXN0ZXJvcGVcIiwgICAgIFwiU2FkclwiLCAgICAgICAgXCJMZXNhdGhcIiwgICAgICAgXCJNYWFzeW1cIixcblwiQWxuYXRoXCIsICAgICAgIFwiTmFzaGlyYVwiLCAgICAgXCJFbGVjdHJhXCIsICAgICAgXCJUaGVlbWltXCIsICAgIFwiQXRpa1wiLCAgICAgICAgIFwiU2FpcGhcIiwgICAgICAgXCJQaG9lbml4XCIsICAgICAgXCJOb3JtYVwiXG5dIiwidmFyIERpcmVjdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBEaXJlY3Rpb24gPSBjbGFzcyBEaXJlY3Rpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lLCB4LCB5LCBpbnZlcnNlTmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuaW52ZXJzZU5hbWUgPSBpbnZlcnNlTmFtZTtcbiAgfVxuXG4gIGdldEludmVyc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3JbdGhpcy5pbnZlcnNlTmFtZV07XG4gIH1cblxufTtcblxuRGlyZWN0aW9uLnVwID0gbmV3IERpcmVjdGlvbigndXAnLCAwLCAtMSwgJ2Rvd24nKTtcblxuRGlyZWN0aW9uLmRvd24gPSBuZXcgRGlyZWN0aW9uKCdkb3duJywgMCwgMSwgJ3VwJyk7XG5cbkRpcmVjdGlvbi5sZWZ0ID0gbmV3IERpcmVjdGlvbignbGVmdCcsIC0xLCAwLCAncmlnaHQnKTtcblxuRGlyZWN0aW9uLnJpZ2h0ID0gbmV3IERpcmVjdGlvbigncmlnaHQnLCAxLCAwLCAnbGVmdCcpO1xuXG5EaXJlY3Rpb24uYWRqYWNlbnRzID0gW0RpcmVjdGlvbi51cCwgRGlyZWN0aW9uLmRvd24sIERpcmVjdGlvbi5sZWZ0LCBEaXJlY3Rpb24ucmlnaHRdO1xuXG5EaXJlY3Rpb24udG9wTGVmdCA9IG5ldyBEaXJlY3Rpb24oJ3RvcExlZnQnLCAtMSwgLTEsICdib3R0b21SaWdodCcpO1xuXG5EaXJlY3Rpb24udG9wUmlnaHQgPSBuZXcgRGlyZWN0aW9uKCd0b3BSaWdodCcsIDEsIC0xLCAnYm90dG9tTGVmdCcpO1xuXG5EaXJlY3Rpb24uYm90dG9tUmlnaHQgPSBuZXcgRGlyZWN0aW9uKCdib3R0b21SaWdodCcsIDEsIDEsICd0b3BMZWZ0Jyk7XG5cbkRpcmVjdGlvbi5ib3R0b21MZWZ0ID0gbmV3IERpcmVjdGlvbignYm90dG9tTGVmdCcsIC0xLCAxLCAndG9wUmlnaHQnKTtcblxuRGlyZWN0aW9uLmNvcm5lcnMgPSBbRGlyZWN0aW9uLnRvcExlZnQsIERpcmVjdGlvbi50b3BSaWdodCwgRGlyZWN0aW9uLmJvdHRvbVJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tTGVmdF07XG5cbkRpcmVjdGlvbi5hbGwgPSBbRGlyZWN0aW9uLnVwLCBEaXJlY3Rpb24uZG93biwgRGlyZWN0aW9uLmxlZnQsIERpcmVjdGlvbi5yaWdodCwgRGlyZWN0aW9uLnRvcExlZnQsIERpcmVjdGlvbi50b3BSaWdodCwgRGlyZWN0aW9uLmJvdHRvbVJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tTGVmdF07XG4iLCJ2YXIgRGlyZWN0aW9uLCBFbGVtZW50LCBUaWxlO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJy4vRGlyZWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGlsZSBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHgxLCB5MSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMueCA9IHgxO1xuICAgICAgdGhpcy55ID0geTE7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgdmFyIGNvbnRhaW5lcjtcbiAgICAgIHJldHVybiBjb250YWluZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGdldFJlbGF0aXZlVGlsZSh4LCB5KSB7XG4gICAgICBpZiAoeCA9PT0gMCAmJiB5ID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmdldFRpbGUodGhpcy54ICsgeCwgdGhpcy55ICsgeSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmluZERpcmVjdGlvbk9mKHRpbGUpIHtcbiAgICAgIGlmICh0aWxlLnRpbGUpIHtcbiAgICAgICAgdGlsZSA9IHRpbGUudGlsZTtcbiAgICAgIH1cbiAgICAgIGlmICgodGlsZS54ICE9IG51bGwpICYmICh0aWxlLnkgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZmluZCgoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBkLnggPT09IHRpbGUueCAtIHRoaXMueCAmJiBkLnkgPT09IHRpbGUueSAtIHRoaXMueTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQoY2hpbGQsIGNoZWNrUmVmID0gdHJ1ZSkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgICAgaWYgKGNoZWNrUmVmKSB7XG4gICAgICAgIGNoaWxkLnRpbGUgPSB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkKGNoaWxkLCBjaGVja1JlZiA9IHRydWUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGVja1JlZiAmJiBjaGlsZC50aWxlID09PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiBjaGlsZC50aWxlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkaXN0KHRpbGUpIHtcbiAgICAgIHZhciBjdG5EaXN0LCByZWYsIHgsIHk7XG4gICAgICBpZiAoKHRpbGUgIT0gbnVsbCA/IHRpbGUuZ2V0RmluYWxUaWxlIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCgodGlsZSAhPSBudWxsID8gdGlsZS54IDogdm9pZCAwKSAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpICYmICh0aGlzLnggIT0gbnVsbCkgJiYgKHRoaXMueSAhPSBudWxsKSAmJiAodGhpcy5jb250YWluZXIgPT09IHRpbGUuY29udGFpbmVyIHx8IChjdG5EaXN0ID0gKHJlZiA9IHRoaXMuY29udGFpbmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kaXN0ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGlzdCh0aWxlLmNvbnRhaW5lcikgOiB2b2lkIDAgOiB2b2lkIDApKSkge1xuICAgICAgICB4ID0gdGlsZS54IC0gdGhpcy54O1xuICAgICAgICB5ID0gdGlsZS55IC0gdGhpcy55O1xuICAgICAgICBpZiAoY3RuRGlzdCkge1xuICAgICAgICAgIHggKz0gY3RuRGlzdC54O1xuICAgICAgICAgIHkgKz0gY3RuRGlzdC55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogeCxcbiAgICAgICAgICB5OiB5LFxuICAgICAgICAgIGxlbmd0aDogTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRGaW5hbFRpbGUoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlLnByb3BlcnRpZXMoe1xuICAgIGNoaWxkcmVuOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBjb250YWluZXI6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lciAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRqYWNlbnRUaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aWxlLmFkamFjZW50VGlsZXNQcm9wZXJ0eS5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGFkamFjZW50VGlsZXM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIGlmIChpbnZhbGlkYXRpb24ucHJvcCh0aGlzLmNvbnRhaW5lclByb3BlcnR5KSkge1xuICAgICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWRqYWNlbnRzLm1hcCgoZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpdmVUaWxlKGQueCwgZC55KTtcbiAgICAgICAgICB9KS5maWx0ZXIoKHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBFbGVtZW50LCBUaWxlQ29udGFpbmVyLCBUaWxlUmVmZXJlbmNlO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCcuL1RpbGVSZWZlcmVuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlQ29udGFpbmVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlQ29udGFpbmVyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpIHtcbiAgICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgdGlsZS55IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgYm91bmRhcmllcy50b3AgPSB0aWxlLnk7XG4gICAgICB9XG4gICAgICBpZiAoKGJvdW5kYXJpZXMubGVmdCA9PSBudWxsKSB8fCB0aWxlLnggPCBib3VuZGFyaWVzLmxlZnQpIHtcbiAgICAgICAgYm91bmRhcmllcy5sZWZ0ID0gdGlsZS54O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB0aWxlLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHRpbGUueTtcbiAgICAgIH1cbiAgICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCB0aWxlLnggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzLnJpZ2h0ID0gdGlsZS54O1xuICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLmNvb3JkcyA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXMudGlsZXMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGRUaWxlKHRpbGUpIHtcbiAgICAgIGlmICghdGhpcy50aWxlcy5pbmNsdWRlcyh0aWxlKSkge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIGlmICh0aGlzLmNvb3Jkc1t0aWxlLnhdID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNvb3Jkc1t0aWxlLnhdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldID0gdGlsZTtcbiAgICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYm91bmRhcmllc1Byb3BlcnR5LmdldHRlci5jYWxjdWxhdGVkKSB7XG4gICAgICAgICAgdGhpcy5fYWRkVG9Cb25kYXJpZXModGlsZSwgdGhpcy5ib3VuZGFyaWVzUHJvcGVydHkudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZW1vdmVUaWxlKHRpbGUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy50aWxlcy5pbmRleE9mKHRpbGUpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBkZWxldGUgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldO1xuICAgICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ib3VuZGFyaWVzUHJvcGVydHkuZ2V0dGVyLmNhbGN1bGF0ZWQpIHtcbiAgICAgICAgICBpZiAodGhpcy5ib3VuZGFyaWVzLnRvcCA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5ib3R0b20gPT09IHRpbGUueSB8fCB0aGlzLmJvdW5kYXJpZXMubGVmdCA9PT0gdGlsZS54IHx8IHRoaXMuYm91bmRhcmllcy5yaWdodCA9PT0gdGlsZS54KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib3VuZGFyaWVzUHJvcGVydHkuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZVRpbGVBdCh4LCB5KSB7XG4gICAgICB2YXIgdGlsZTtcbiAgICAgIGlmICh0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZVRpbGUodGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCgocmVmID0gdGhpcy5jb29yZHNbeF0pICE9IG51bGwgPyByZWZbeV0gOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29vcmRzW3hdW3ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRNYXRyaXgobWF0cml4KSB7XG4gICAgICB2YXIgb3B0aW9ucywgcm93LCB0aWxlLCB4LCB5O1xuICAgICAgZm9yICh5IGluIG1hdHJpeCkge1xuICAgICAgICByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgIGZvciAoeCBpbiByb3cpIHtcbiAgICAgICAgICB0aWxlID0gcm93W3hdO1xuICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB4OiBwYXJzZUludCh4KSxcbiAgICAgICAgICAgIHk6IHBhcnNlSW50KHkpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhpcy5hZGRUaWxlKHRpbGUob3B0aW9ucykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWxlLnggPSBvcHRpb25zLng7XG4gICAgICAgICAgICB0aWxlLnkgPSBvcHRpb25zLnk7XG4gICAgICAgICAgICB0aGlzLmFkZFRpbGUodGlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpblJhbmdlKHRpbGUsIHJhbmdlKSB7XG4gICAgICB2YXIgZm91bmQsIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgdGlsZXMsIHgsIHk7XG4gICAgICB0aWxlcyA9IFtdO1xuICAgICAgcmFuZ2UtLTtcbiAgICAgIGZvciAoeCA9IGkgPSByZWYgPSB0aWxlLnggLSByYW5nZSwgcmVmMSA9IHRpbGUueCArIHJhbmdlOyAocmVmIDw9IHJlZjEgPyBpIDw9IHJlZjEgOiBpID49IHJlZjEpOyB4ID0gcmVmIDw9IHJlZjEgPyArK2kgOiAtLWkpIHtcbiAgICAgICAgZm9yICh5ID0gaiA9IHJlZjIgPSB0aWxlLnkgLSByYW5nZSwgcmVmMyA9IHRpbGUueSArIHJhbmdlOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeSA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICAgIGlmIChNYXRoLnNxcnQoKHggLSB0aWxlLngpICogKHggLSB0aWxlLngpICsgKHkgLSB0aWxlLnkpICogKHkgLSB0aWxlLnkpKSA8PSByYW5nZSAmJiAoKGZvdW5kID0gdGhpcy5nZXRUaWxlKHgsIHkpKSAhPSBudWxsKSkge1xuICAgICAgICAgICAgdGlsZXMucHVzaChmb3VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgYWxsVGlsZXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy50aWxlcy5zbGljZSgpO1xuICAgIH1cblxuICAgIGNsZWFyQWxsKCkge1xuICAgICAgdmFyIGksIGxlbiwgcmVmLCB0aWxlO1xuICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgcmVmID0gdGhpcy50aWxlcztcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdGlsZSA9IHJlZltpXTtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY29vcmRzID0ge307XG4gICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9zZXN0KG9yaWdpblRpbGUsIGZpbHRlcikge1xuICAgICAgdmFyIGNhbmRpZGF0ZXMsIGdldFNjb3JlO1xuICAgICAgZ2V0U2NvcmUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5zY29yZSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5zY29yZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLnNjb3JlID0gY2FuZGlkYXRlLmdldEZpbmFsVGlsZSgpLmRpc3Qob3JpZ2luVGlsZSkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2FuZGlkYXRlcyA9IHRoaXMudGlsZXMuZmlsdGVyKGZpbHRlcikubWFwKCh0KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZVJlZmVyZW5jZSh0KTtcbiAgICAgIH0pO1xuICAgICAgY2FuZGlkYXRlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRTY29yZShhKSAtIGdldFNjb3JlKGIpO1xuICAgICAgfSk7XG4gICAgICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzWzBdLnRpbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5KCkge1xuICAgICAgdmFyIG91dDtcbiAgICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICBvdXQuY29vcmRzID0gdGhpcy5jb29yZHM7XG4gICAgICBvdXQudGlsZXMgPSB0aGlzLnRpbGVzO1xuICAgICAgb3V0Lm93bmVyID0gZmFsc2U7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIG1lcmdlKGN0biwgbWVyZ2VGbiwgYXNPd25lciA9IGZhbHNlKSB7XG4gICAgICB2YXIgb3V0LCB0bXA7XG4gICAgICBvdXQgPSBuZXcgVGlsZUNvbnRhaW5lcigpO1xuICAgICAgb3V0Lm93bmVyID0gYXNPd25lcjtcbiAgICAgIHRtcCA9IGN0bi5jb3B5KCk7XG4gICAgICB0aGlzLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUEpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGUsIHRpbGVCO1xuICAgICAgICB0aWxlQiA9IHRtcC5nZXRUaWxlKHRpbGVBLngsIHRpbGVBLnkpO1xuICAgICAgICBpZiAodGlsZUIpIHtcbiAgICAgICAgICB0bXAucmVtb3ZlVGlsZSh0aWxlQik7XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4odGlsZUEsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdG1wLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUIpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGU7XG4gICAgICAgIG1lcmdlZFRpbGUgPSBtZXJnZUZuKG51bGwsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlQ29udGFpbmVyLnByb3BlcnRpZXMoe1xuICAgIG93bmVyOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBib3VuZGFyaWVzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYm91bmRhcmllcztcbiAgICAgICAgYm91bmRhcmllcyA9IHtcbiAgICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgICAgbGVmdDogbnVsbCxcbiAgICAgICAgICBib3R0b206IG51bGwsXG4gICAgICAgICAgcmlnaHQ6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZUNvbnRhaW5lcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBUaWxlUmVmZXJlbmNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVSZWZlcmVuY2UgPSBjbGFzcyBUaWxlUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IodGlsZSkge1xuICAgIHRoaXMudGlsZSA9IHRpbGU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgeDoge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaW5hbFRpbGUoKS54O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeToge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaW5hbFRpbGUoKS55O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRGaW5hbFRpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgfVxuXG59O1xuIiwidmFyIEVsZW1lbnQsIFRpbGVkO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZWQgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgcHV0T25SYW5kb21UaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgZm91bmQ7XG4gICAgICBmb3VuZCA9IHRoaXMuZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKTtcbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlID0gZm91bmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgY2FuZGlkYXRlLCBwb3MsIHJlbWFpbmluZztcbiAgICAgIHJlbWFpbmluZyA9IHRpbGVzLnNsaWNlKCk7XG4gICAgICB3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcG9zID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcmVtYWluaW5nLmxlbmd0aCk7XG4gICAgICAgIGNhbmRpZGF0ZSA9IHJlbWFpbmluZy5zcGxpY2UocG9zLCAxKVswXTtcbiAgICAgICAgaWYgKHRoaXMuY2FuR29PblRpbGUoY2FuZGlkYXRlKSkge1xuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNhbkdvT25UaWxlKHRpbGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldEZpbmFsVGlsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZWQucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbih2YWwsIG9sZCkge1xuICAgICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgICBvbGQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRpbGUuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIG9mZnNldFk6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkRpcmVjdGlvblwiOiByZXF1aXJlKFwiLi9EaXJlY3Rpb25cIiksXG4gIFwiVGlsZVwiOiByZXF1aXJlKFwiLi9UaWxlXCIpLFxuICBcIlRpbGVDb250YWluZXJcIjogcmVxdWlyZShcIi4vVGlsZUNvbnRhaW5lclwiKSxcbiAgXCJUaWxlUmVmZXJlbmNlXCI6IHJlcXVpcmUoXCIuL1RpbGVSZWZlcmVuY2VcIiksXG4gIFwiVGlsZWRcIjogcmVxdWlyZShcIi4vVGlsZWRcIiksXG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaW1pbmc9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbWluZy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbWluZzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaW1pbmc9VGltaW5nO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFRpbWluZztcblRpbWluZyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGltaW5nIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgdG9nZ2xlKHZhbCkge1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdmFsID0gIXRoaXMucnVubmluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJ1bm5pbmcgPSB2YWw7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZSkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yLlRpbWVyKHtcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICB0aW1pbmc6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEludGVydmFsKGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIoe1xuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgIHJlcGVhdDogdHJ1ZSxcbiAgICAgICAgdGltaW5nOiB0aGlzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaW1pbmcucHJvcGVydGllcyh7XG4gICAgcnVubmluZzoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFRpbWluZztcblxufSkuY2FsbCh0aGlzKTtcblxuVGltaW5nLlRpbWVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaW1lciBleHRlbmRzIEVsZW1lbnQge1xuICAgIHRvZ2dsZSh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHZhbCA9ICF0aGlzLnBhdXNlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBhdXNlZCA9IHZhbDtcbiAgICB9XG5cbiAgICBpbW1lZGlhdGVJbnZhbGlkYXRpb24oKSB7XG4gICAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuaW52YWxpZGF0ZSh7XG4gICAgICAgICAgcHJldmVudEltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW46IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2dnbGUodHJ1ZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuY29uc3RydWN0b3Iubm93KCk7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQgPSBzZXRJbnRlcnZhbCh0aGlzLnRpY2suYmluZCh0aGlzKSwgdGhpcy5yZW1haW5pbmdUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlkID0gc2V0VGltZW91dCh0aGlzLnRpY2suYmluZCh0aGlzKSwgdGhpcy5yZW1haW5pbmdUaW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wKCkge1xuICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gKHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSk7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgcmV0dXJuIGNsZWFySW50ZXJ2YWwodGhpcy5pZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBub3coKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdyAhPT0gbnVsbCA/IChyZWYgPSB3aW5kb3cucGVyZm9ybWFuY2UpICE9IG51bGwgPyByZWYubm93IDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsID8gcHJvY2Vzcy51cHRpbWUgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MudXB0aW1lKCkgKiAxMDAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgIHRoaXMucmVwZXRpdGlvbiArPSAxO1xuICAgICAgaWYgKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5vdygpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbWFpbmluZ1RpbWUgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICB9O1xuXG4gIFRpbWVyLnByb3BlcnRpZXMoe1xuICAgIHRpbWU6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIHBhdXNlZDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJ1bm5pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRvci5wcm9wKHRoaXMucGF1c2VkUHJvcGVydHkpICYmIGludmFsaWRhdG9yLnByb3BQYXRoKCd0aW1pbmcucnVubmluZycpICE9PSBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKHZhbCwgb2xkKSB7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICB9IGVsc2UgaWYgKG9sZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBlbGFwc2VkVGltZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IucHJvcCh0aGlzLnJ1bm5pbmdQcm9wZXJ0eSkpIHtcbiAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1tZWRpYXRlSW52YWxpZGF0aW9uKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSArIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50aW1lIC0gdGhpcy5yZW1haW5pbmdUaW1lO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIHRoaXMucmVtYWluaW5nVGltZSA9IHRoaXMudGltZSAtIHZhbDtcbiAgICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdUaW1lIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRpY2soKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gdmFsO1xuICAgICAgICAgIHJldHVybiB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuaW52YWxpZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AodGhpcy5lbGFwc2VkVGltZVByb3BlcnR5KSAvIHRoaXMudGltZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMudGltZSAqIHZhbDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbWFpbmluZ1RpbWU6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcGVhdDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJlcGV0aXRpb246IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIGNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGltZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihUaW1pbmcpO30pOyIsInZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBDb25uZWN0ZWQsIEVsZW1lbnQsIFNpZ25hbE9wZXJhdGlvbjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5TaWduYWxPcGVyYXRpb24gPSByZXF1aXJlKCcuL1NpZ25hbE9wZXJhdGlvbicpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdGVkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb25uZWN0ZWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRhcmdldC5hZGRTaWduYWwgPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9XG5cbiAgICBhY2NlcHRTaWduYWwoc2lnbmFsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBvbkFkZENvbm5lY3Rpb24oY29ubikge31cblxuICAgIG9uUmVtb3ZlQ29ubmVjdGlvbihjb25uKSB7fVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCkge31cblxuICAgIG9uQWRkU2lnbmFsKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZW1vdmVTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlcGxhY2VTaWduYWwob2xkU2lnbmFsLCBuZXdTaWduYWwsIG9wKSB7fVxuXG4gICAgY29udGFpbnNTaWduYWwoc2lnbmFsLCBjaGVja0xhc3QgPSBmYWxzZSwgY2hlY2tPcmlnaW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZmluZChmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLm1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0LCBjaGVja09yaWdpbik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIGF1dG9TdGFydDtcbiAgICAgIGlmICghKG9wICE9IG51bGwgPyBvcC5maW5kTGltaXRlcih0aGlzKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgIG9wID0gbmV3IFNpZ25hbE9wZXJhdGlvbigpO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgc2ltaWxhcjtcbiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSAmJiB0aGlzLmFjY2VwdFNpZ25hbChzaWduYWwpKSB7XG4gICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnB1c2goc2lnbmFsKTtcbiAgICAgICAgICAgIHRoaXMub25BZGRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICBpZiAoIXNpbWlsYXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhdXRvU3RhcnQpIHtcbiAgICAgICAgICBvcC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc2lnbmFsO1xuICAgIH1cblxuICAgIHJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgYXV0b1N0YXJ0O1xuICAgICAgaWYgKCEob3AgIT0gbnVsbCA/IG9wLmZpbmRMaW1pdGVyKHRoaXMpIDogdm9pZCAwKSkge1xuICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgb3AgPSBuZXcgU2lnbmFsT3BlcmF0aW9uO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgZXhpc3Rpbmc7XG4gICAgICAgICAgaWYgKChleGlzdGluZyA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSkgJiYgdGhpcy5hY2NlcHRTaWduYWwoc2lnbmFsKSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnNwbGljZSh0aGlzLnNpZ25hbHMuaW5kZXhPZihleGlzdGluZyksIDEpO1xuICAgICAgICAgICAgdGhpcy5vblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKTtcbiAgICAgICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgICAgIHZhciBzaW1pbGFyO1xuICAgICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgICBpZiAoc2ltaWxhcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVwbGFjZVNpZ25hbChzaWduYWwsIHNpbWlsYXIsIG9wKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vblJlbW92ZVNpZ25hbFR5cGUoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RlcEJ5U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wLnN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoYXV0b1N0YXJ0KSB7XG4gICAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCkge1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ID09PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiBzaWduYWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2lnbmFsLndpdGhMYXN0KHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRm9yd2FyZFdhdGNoZXIoKSB7XG4gICAgICBpZiAoIXRoaXMuZm9yd2FyZFdhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5mb3J3YXJkV2F0Y2hlciA9IG5ldyBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBzY29wZTogdGhpcyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ291dHB1dHMnLFxuICAgICAgICAgIG9uQWRkZWQ6IGZ1bmN0aW9uKG91dHB1dCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZFNpZ25hbFRvKHNpZ25hbCwgb3V0cHV0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgb25SZW1vdmVkOiBmdW5jdGlvbihvdXRwdXQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRlZFNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3BGb3J3YXJkZWRTaWduYWxUbyhzaWduYWwsIG91dHB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkV2F0Y2hlci5iaW5kKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yd2FyZFNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5hZGQoc2lnbmFsKTtcbiAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0ZvcndhcmRXYXRjaGVyKCk7XG4gICAgfVxuXG4gICAgZm9yd2FyZEFsbFNpZ25hbHNUbyhjb25uLCBvcCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgdmFyIG5leHQ7XG4gICAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0b3BGb3J3YXJkZWRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICB0aGlzLmZvcndhcmRlZFNpZ25hbHMucmVtb3ZlKHNpZ25hbCk7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24oY29ubikge1xuICAgICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgICByZXR1cm4gY29ubi5yZW1vdmVTaWduYWwobmV4dCwgb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdG9wQWxsRm9yd2FyZGVkU2lnbmFsVG8oY29ubiwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgIHJldHVybiBjb25uLnJlbW92ZVNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3J3YXJkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wRm9yd2FyZGVkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4ucmVtb3ZlU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDb25uZWN0ZWQucHJvcGVydGllcyh7XG4gICAgc2lnbmFsczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgaW5wdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBvdXRwdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBmb3J3YXJkZWRTaWduYWxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ29ubmVjdGVkO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEVsZW1lbnQsIFNpZ25hbDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCA9IGNsYXNzIFNpZ25hbCBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihvcmlnaW4sIHR5cGUgPSAnc2lnbmFsJywgZXhjbHVzaXZlID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5leGNsdXNpdmUgPSBleGNsdXNpdmU7XG4gICAgdGhpcy5sYXN0ID0gdGhpcy5vcmlnaW47XG4gIH1cblxuICB3aXRoTGFzdChsYXN0KSB7XG4gICAgdmFyIHNpZ25hbDtcbiAgICBzaWduYWwgPSBuZXcgdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3IodGhpcy5vcmlnaW4sIHRoaXMudHlwZSwgdGhpcy5leGNsdXNpdmUpO1xuICAgIHNpZ25hbC5sYXN0ID0gbGFzdDtcbiAgICByZXR1cm4gc2lnbmFsO1xuICB9XG5cbiAgY29weSgpIHtcbiAgICB2YXIgc2lnbmFsO1xuICAgIHNpZ25hbCA9IG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3Rvcih0aGlzLm9yaWdpbiwgdGhpcy50eXBlLCB0aGlzLmV4Y2x1c2l2ZSk7XG4gICAgc2lnbmFsLmxhc3QgPSB0aGlzLmxhc3Q7XG4gICAgcmV0dXJuIHNpZ25hbDtcbiAgfVxuXG4gIG1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0ID0gZmFsc2UsIGNoZWNrT3JpZ2luID0gdGhpcy5leGNsdXNpdmUpIHtcbiAgICByZXR1cm4gKCFjaGVja0xhc3QgfHwgc2lnbmFsLmxhc3QgPT09IHRoaXMubGFzdCkgJiYgKGNoZWNrT3JpZ2luIHx8IHNpZ25hbC5vcmlnaW4gPT09IHRoaXMub3JpZ2luKSAmJiBzaWduYWwudHlwZSA9PT0gdGhpcy50eXBlO1xuICB9XG5cbn07XG4iLCJ2YXIgRWxlbWVudCwgU2lnbmFsT3BlcmF0aW9uO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsT3BlcmF0aW9uID0gY2xhc3MgU2lnbmFsT3BlcmF0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMubGltaXRlcnMgPSBbXTtcbiAgfVxuXG4gIGFkZE9wZXJhdGlvbihmdW5jdCwgcHJpb3JpdHkgPSAxKSB7XG4gICAgaWYgKHByaW9yaXR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS51bnNoaWZ0KGZ1bmN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUucHVzaChmdW5jdCk7XG4gICAgfVxuICB9XG5cbiAgYWRkTGltaXRlcihjb25uZWN0ZWQpIHtcbiAgICBpZiAoIXRoaXMuZmluZExpbWl0ZXIoY29ubmVjdGVkKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGltaXRlcnMucHVzaChjb25uZWN0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRMaW1pdGVyKGNvbm5lY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmxpbWl0ZXJzLmluZGV4T2YoY29ubmVjdGVkKSA+IC0xO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHJlc3VsdHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuc3RlcCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBzdGVwKCkge1xuICAgIHZhciBmdW5jdDtcbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRvbmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVuY3QgPSB0aGlzLnF1ZXVlLnNoaWZ0KGZ1bmN0KTtcbiAgICAgIHJldHVybiBmdW5jdCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBkb25lKCkge31cblxufTtcbiIsInZhciBDb25uZWN0ZWQsIFNpZ25hbCwgU2lnbmFsT3BlcmF0aW9uLCBTaWduYWxTb3VyY2U7XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cblNpZ25hbCA9IHJlcXVpcmUoJy4vU2lnbmFsJyk7XG5cblNpZ25hbE9wZXJhdGlvbiA9IHJlcXVpcmUoJy4vU2lnbmFsT3BlcmF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsU291cmNlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTaWduYWxTb3VyY2UgZXh0ZW5kcyBDb25uZWN0ZWQge307XG5cbiAgU2lnbmFsU291cmNlLnByb3BlcnRpZXMoe1xuICAgIGFjdGl2YXRlZDoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wO1xuICAgICAgICBvcCA9IG5ldyBTaWduYWxPcGVyYXRpb24oKTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGVkKSB7XG4gICAgICAgICAgdGhpcy5mb3J3YXJkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdG9wRm9yd2FyZGVkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzaWduYWw6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2lnbmFsKHRoaXMsICdwb3dlcicsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNpZ25hbFNvdXJjZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBDb25uZWN0ZWQsIFN3aXRjaDtcblxuQ29ubmVjdGVkID0gcmVxdWlyZSgnLi9Db25uZWN0ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l0Y2ggPSBjbGFzcyBTd2l0Y2ggZXh0ZW5kcyBDb25uZWN0ZWQge307XG4iLCJ2YXIgQ29ubmVjdGVkLCBEaXJlY3Rpb24sIFRpbGVkLCBXaXJlLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2lyZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2lyZSBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3Rvcih3aXJlVHlwZSA9ICdyZWQnKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy53aXJlVHlwZSA9IHdpcmVUeXBlO1xuICAgIH1cblxuICAgIGZpbmREaXJlY3Rpb25zVG8oY29ubikge1xuICAgICAgdmFyIGRpcmVjdGlvbnM7XG4gICAgICBkaXJlY3Rpb25zID0gY29ubi50aWxlcyAhPSBudWxsID8gY29ubi50aWxlcy5tYXAoKHRpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZS5maW5kRGlyZWN0aW9uT2YodGlsZSk7XG4gICAgICB9KSA6IFt0aGlzLnRpbGUuZmluZERpcmVjdGlvbk9mKGNvbm4pXTtcbiAgICAgIHJldHVybiBkaXJlY3Rpb25zLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICE9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gQ29ubmVjdGVkLnByb3RvdHlwZS5jYW5Db25uZWN0VG8uY2FsbCh0aGlzLCB0YXJnZXQpICYmICgodGFyZ2V0LndpcmVUeXBlID09IG51bGwpIHx8IHRhcmdldC53aXJlVHlwZSA9PT0gdGhpcy53aXJlVHlwZSk7XG4gICAgfVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLmZvcndhcmRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgfVxuXG4gIH07XG5cbiAgV2lyZS5leHRlbmQoQ29ubmVjdGVkKTtcblxuICBXaXJlLnByb3BlcnRpZXMoe1xuICAgIG91dHB1dHM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHZhciBwYXJlbnQ7XG4gICAgICAgIHBhcmVudCA9IGludmFsaWRhdGlvbi5wcm9wKHRoaXMudGlsZVByb3BlcnR5KTtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRpb24ucHJvcChwYXJlbnQuYWRqYWNlbnRUaWxlc1Byb3BlcnR5KS5yZWR1Y2UoKHJlcywgdGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoaW52YWxpZGF0aW9uLnByb3AodGlsZS5jaGlsZHJlblByb3BlcnR5KS5maWx0ZXIoKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbkNvbm5lY3RUbyhjaGlsZCk7XG4gICAgICAgICAgICB9KS50b0FycmF5KCkpO1xuICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbm5lY3RlZERpcmVjdGlvbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRpb24ucHJvcCh0aGlzLm91dHB1dHNQcm9wZXJ0eSkucmVkdWNlKChvdXQsIGNvbm4pID0+IHtcbiAgICAgICAgICB0aGlzLmZpbmREaXJlY3Rpb25zVG8oY29ubikuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKG91dCwgZCkgPCAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvdXQucHVzaChkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9LCBbXSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV2lyZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkNvbm5lY3RlZFwiOiByZXF1aXJlKFwiLi9Db25uZWN0ZWRcIiksXG4gIFwiU2lnbmFsXCI6IHJlcXVpcmUoXCIuL1NpZ25hbFwiKSxcbiAgXCJTaWduYWxPcGVyYXRpb25cIjogcmVxdWlyZShcIi4vU2lnbmFsT3BlcmF0aW9uXCIpLFxuICBcIlNpZ25hbFNvdXJjZVwiOiByZXF1aXJlKFwiLi9TaWduYWxTb3VyY2VcIiksXG4gIFwiU3dpdGNoXCI6IHJlcXVpcmUoXCIuL1N3aXRjaFwiKSxcbiAgXCJXaXJlXCI6IHJlcXVpcmUoXCIuL1dpcmVcIiksXG59IiwiY29uc3QgVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlXG5cbmNsYXNzIEFpcmxvY2sgZXh0ZW5kcyBUaWxlIHtcbiAgYXR0YWNoVG8gKGFpcmxvY2spIHtcbiAgICB0aGlzLmF0dGFjaGVkVG8gPSBhaXJsb2NrXG4gIH1cbn07XG5cbkFpcmxvY2sucHJvcGVydGllcyh7XG4gIGRpcmVjdGlvbjoge30sXG4gIGF0dGFjaGVkVG86IHt9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFpcmxvY2tcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKVxuXG5jbGFzcyBBcHByb2FjaCBleHRlbmRzIEVsZW1lbnQge1xuICBzdGFydCAoKSB7XG4gICAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICAgIHRoaXMubW92aW5nID0gdHJ1ZVxuICAgICAgdGhpcy5zdWJqZWN0LnhNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpXG4gICAgICB0aGlzLnN1YmplY3QueU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi5vZmZzZXRZJywgdGhpcylcbiAgICAgIHRoaXMudGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kb25lKClcbiAgICAgIH0sIHRoaXMuZHVyYXRpb24pXG4gICAgfVxuICB9XG5cbiAgZG9uZSAoKSB7XG4gICAgdGhpcy5zdWJqZWN0LnhNZW1iZXJzLnJlbW92ZVJlZih7XG4gICAgICBuYW1lOiAncG9zaXRpb24ub2Zmc2V0WCcsXG4gICAgICBvYmo6IHRoaXNcbiAgICB9KVxuICAgIHRoaXMuc3ViamVjdC55TWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFknLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLnN1YmplY3QueCA9IHRoaXMudGFyZ2V0UG9zLnhcbiAgICB0aGlzLnN1YmplY3QueSA9IHRoaXMudGFyZ2V0UG9zLnhcbiAgICB0aGlzLnN1YmplY3RBaXJsb2NrLmF0dGFjaFRvKHRoaXMudGFyZ2V0QWlybG9jaylcbiAgICB0aGlzLm1vdmluZyA9IGZhbHNlXG4gICAgdGhpcy5jb21wbGV0ZSA9IHRydWVcbiAgfVxufTtcblxuQXBwcm9hY2gucHJvcGVydGllcyh7XG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKVxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbERpc3Q6IHtcbiAgICBkZWZhdWx0OiA1MDBcbiAgfSxcbiAgcm5nOiB7XG4gICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgfSxcbiAgYW5nbGU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJuZyAqIE1hdGguUEkgKiAyXG4gICAgfVxuICB9LFxuICBzdGFydGluZ1Bvczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy5zdGFydGluZ1Bvcy54ICsgdGhpcy5pbml0aWFsRGlzdCAqIE1hdGguY29zKHRoaXMuYW5nbGUpLFxuICAgICAgICB5OiB0aGlzLnN0YXJ0aW5nUG9zLnkgKyB0aGlzLmluaXRpYWxEaXN0ICogTWF0aC5zaW4odGhpcy5hbmdsZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHRhcmdldFBvczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy50YXJnZXRBaXJsb2NrLnggLSB0aGlzLnN1YmplY3RBaXJsb2NrLngsXG4gICAgICAgIHk6IHRoaXMudGFyZ2V0QWlybG9jay55IC0gdGhpcy5zdWJqZWN0QWlybG9jay55XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzdWJqZWN0OiB7fSxcbiAgdGFyZ2V0OiB7fSxcbiAgdmFsaWQ6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YmplY3QgIT0gbnVsbCAmJlxuICAgICAgICB0aGlzLnRhcmdldCAhPSBudWxsICYmXG4gICAgICAgIHRoaXMuc3ViamVjdC5haXJsb2Nrcy5sZW5ndGggPiAwICYmXG4gICAgICAgIHRoaXMudGFyZ2V0LmFpcmxvY2tzLmxlbmd0aCA+IDBcbiAgICB9XG4gIH0sXG4gIHN1YmplY3RBaXJsb2NrOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYWlybG9ja3NcbiAgICAgIGFpcmxvY2tzID0gdGhpcy5zdWJqZWN0LmFpcmxvY2tzLnNsaWNlKClcbiAgICAgIGFpcmxvY2tzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgdmFyIHZhbEEsIHZhbEJcbiAgICAgICAgdmFsQSA9IE1hdGguYWJzKGEuZGlyZWN0aW9uLnggLSBNYXRoLmNvcyh0aGlzLmFuZ2xlKSkgKyBNYXRoLmFicyhhLmRpcmVjdGlvbi55IC0gTWF0aC5zaW4odGhpcy5hbmdsZSkpXG4gICAgICAgIHZhbEIgPSBNYXRoLmFicyhiLmRpcmVjdGlvbi54IC0gTWF0aC5jb3ModGhpcy5hbmdsZSkpICsgTWF0aC5hYnMoYi5kaXJlY3Rpb24ueSAtIE1hdGguc2luKHRoaXMuYW5nbGUpKVxuICAgICAgICByZXR1cm4gdmFsQSAtIHZhbEJcbiAgICAgIH0pXG4gICAgICByZXR1cm4gYWlybG9ja3NbMF1cbiAgICB9XG4gIH0sXG4gIHRhcmdldEFpcmxvY2s6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5haXJsb2Nrcy5maW5kKCh0YXJnZXQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5kaXJlY3Rpb24uZ2V0SW52ZXJzZSgpID09PSB0aGlzLnN1YmplY3RBaXJsb2NrLmRpcmVjdGlvblxuICAgICAgfSlcbiAgICB9XG4gIH0sXG4gIG1vdmluZzoge1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gIH0sXG4gIGNvbXBsZXRlOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgY3VycmVudFBvczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgZW5kLCBwcmMsIHN0YXJ0XG4gICAgICBzdGFydCA9IGludmFsaWRhdG9yLnByb3AodGhpcy5zdGFydGluZ1Bvc1Byb3BlcnR5KVxuICAgICAgZW5kID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnRhcmdldFBvc1Byb3BlcnR5KVxuICAgICAgcHJjID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RpbWVvdXQucHJjJykgfHwgMFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogKGVuZC54IC0gc3RhcnQueCkgKiBwcmMgKyBzdGFydC54LFxuICAgICAgICB5OiAoZW5kLnkgLSBzdGFydC55KSAqIHByYyArIHN0YXJ0LnlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGR1cmF0aW9uOiB7XG4gICAgZGVmYXVsdDogMTAwMDBcbiAgfSxcbiAgdGltZW91dDoge31cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwcm9hY2hcbiIsImNvbnN0IERvb3IgPSByZXF1aXJlKCcuL0Rvb3InKVxuY29uc3QgQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9DaGFyYWN0ZXInKVxuXG5jbGFzcyBBdXRvbWF0aWNEb29yIGV4dGVuZHMgRG9vciB7XG4gIHVwZGF0ZVRpbGVNZW1iZXJzIChvbGQpIHtcbiAgICB2YXIgcmVmLCByZWYxLCByZWYyLCByZWYzXG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgcmVmLnJlbW92ZVByb3BlcnR5KHRoaXMudW5sb2NrZWRQcm9wZXJ0eSlcbiAgICAgIH1cbiAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgcmVmMS5yZW1vdmVQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgaWYgKChyZWYyID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYyLmFkZFByb3BlcnR5KHRoaXMudW5sb2NrZWRQcm9wZXJ0eSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAocmVmMyA9IHRoaXMudGlsZS50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwgPyByZWYzLmFkZFByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KSA6IG51bGxcbiAgICB9XG4gIH1cblxuICBpbml0ICgpIHtcbiAgICBzdXBlci5pbml0KClcbiAgICByZXR1cm4gdGhpcy5vcGVuXG4gIH1cblxuICBpc0FjdGl2YXRvclByZXNlbnQgKGludmFsaWRhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZWFjdGl2ZVRpbGVzKGludmFsaWRhdGUpLnNvbWUoKHRpbGUpID0+IHtcbiAgICAgIHZhciBjaGlsZHJlblxuICAgICAgY2hpbGRyZW4gPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKHRpbGUuY2hpbGRyZW5Qcm9wZXJ0eSkgOiB0aWxlLmNoaWxkcmVuXG4gICAgICByZXR1cm4gY2hpbGRyZW4uc29tZSgoY2hpbGQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FuQmVBY3RpdmF0ZWRCeShjaGlsZClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGNhbkJlQWN0aXZhdGVkQnkgKGVsZW0pIHtcbiAgICByZXR1cm4gZWxlbSBpbnN0YW5jZW9mIENoYXJhY3RlclxuICB9XG5cbiAgZ2V0UmVhY3RpdmVUaWxlcyAoaW52YWxpZGF0ZSkge1xuICAgIHZhciBkaXJlY3Rpb24sIHRpbGVcbiAgICB0aWxlID0gaW52YWxpZGF0ZSA/IGludmFsaWRhdGUucHJvcCh0aGlzLnRpbGVQcm9wZXJ0eSkgOiB0aGlzLnRpbGVcbiAgICBpZiAoIXRpbGUpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICBkaXJlY3Rpb24gPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKHRoaXMuZGlyZWN0aW9uUHJvcGVydHkpIDogdGhpcy5kaXJlY3Rpb25cbiAgICBpZiAoZGlyZWN0aW9uID09PSBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbCkge1xuICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgwLCAxKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMCwgLTEpXS5maWx0ZXIoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgIT0gbnVsbFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgxLCAwKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoLTEsIDApXS5maWx0ZXIoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgIT0gbnVsbFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn07XG5cbkF1dG9tYXRpY0Rvb3IucHJvcGVydGllcyh7XG4gIG9wZW46IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICByZXR1cm4gIWludmFsaWRhdGUucHJvcCh0aGlzLmxvY2tlZFByb3BlcnR5KSAmJiB0aGlzLmlzQWN0aXZhdG9yUHJlc2VudChpbnZhbGlkYXRlKVxuICAgIH1cbiAgfSxcbiAgbG9ja2VkOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgdW5sb2NrZWQ6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICByZXR1cm4gIWludmFsaWRhdGUucHJvcCh0aGlzLmxvY2tlZFByb3BlcnR5KVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvbWF0aWNEb29yXG4iLCJjb25zdCBUaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZFxuY29uc3QgRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpXG5jb25zdCBXYWxrQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL1dhbGtBY3Rpb24nKVxuY29uc3QgQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXInKVxuXG5jbGFzcyBDaGFyYWN0ZXIgZXh0ZW5kcyBUaWxlZCB7XG4gIGNvbnN0cnVjdG9yIChuYW1lKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgfVxuXG4gIHNldERlZmF1bHRzICgpIHtcbiAgICBpZiAoIXRoaXMudGlsZSAmJiAodGhpcy5nYW1lLm1haW5UaWxlQ29udGFpbmVyICE9IG51bGwpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wdXRPblJhbmRvbVRpbGUodGhpcy5nYW1lLm1haW5UaWxlQ29udGFpbmVyLnRpbGVzKVxuICAgIH1cbiAgfVxuXG4gIGNhbkdvT25UaWxlICh0aWxlKSB7XG4gICAgcmV0dXJuICh0aWxlICE9IG51bGwgPyB0aWxlLndhbGthYmxlIDogbnVsbCkgIT09IGZhbHNlXG4gIH1cblxuICB3YWxrVG8gKHRpbGUpIHtcbiAgICB2YXIgYWN0aW9uXG4gICAgYWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgYWN0b3I6IHRoaXMsXG4gICAgICB0YXJnZXQ6IHRpbGVcbiAgICB9KVxuICAgIGFjdGlvbi5leGVjdXRlKClcbiAgICByZXR1cm4gYWN0aW9uXG4gIH1cblxuICBpc1NlbGVjdGFibGVCeSAocGxheWVyKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufTtcblxuQ2hhcmFjdGVyLmV4dGVuZChEYW1hZ2VhYmxlKVxuXG5DaGFyYWN0ZXIucHJvcGVydGllcyh7XG4gIGdhbWU6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXREZWZhdWx0cygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBvZmZzZXRYOiB7XG4gICAgY29tcG9zZWQ6IHRydWUsXG4gICAgZGVmYXVsdDogMC41XG4gIH0sXG4gIG9mZnNldFk6IHtcbiAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICBkZWZhdWx0OiAwLjVcbiAgfSxcbiAgdGlsZToge1xuICAgIGNvbXBvc2VkOiB0cnVlXG4gIH0sXG4gIGRlZmF1bHRBY3Rpb246IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzXG4gICAgICB9KVxuICAgIH1cbiAgfSxcbiAgYWN0aW9uUHJvdmlkZXI6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgQWN0aW9uUHJvdmlkZXIoe1xuICAgICAgICBvd25lcjogdGhpc1xuICAgICAgfSlcbiAgICAgIHByb3ZpZGVyLmFjdGlvbnNNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgnb3duZXIudGlsZS5hY3Rpb25Qcm92aWRlci5hY3Rpb25zJylcbiAgICAgIHJldHVybiBwcm92aWRlclxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXJcbiIsImNvbnN0IFRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lclxuY29uc3QgVmlzaW9uQ2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vVmlzaW9uQ2FsY3VsYXRvcicpXG5jb25zdCBEb29yID0gcmVxdWlyZSgnLi9Eb29yJylcbmNvbnN0IFdhbGtBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvV2Fsa0FjdGlvbicpXG5jb25zdCBBdHRhY2tNb3ZlQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24nKVxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlclxuXG5jbGFzcyBDaGFyYWN0ZXJBSSB7XG4gIGNvbnN0cnVjdG9yIChjaGFyYWN0ZXIpIHtcbiAgICB0aGlzLmNoYXJhY3RlciA9IGNoYXJhY3RlclxuICAgIHRoaXMubmV4dEFjdGlvbkNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dEFjdGlvbigpXG4gICAgfVxuICAgIHRoaXMudmlzaW9uTWVtb3J5ID0gbmV3IFRpbGVDb250YWluZXIoKVxuICAgIHRoaXMudGlsZVdhdGNoZXIgPSBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpc2lvbk1lbW9yeSgpXG4gICAgICB9LFxuICAgICAgcHJvcGVydHk6IHRoaXMuY2hhcmFjdGVyLnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KCd0aWxlJylcbiAgICB9KVxuICB9XG5cbiAgc3RhcnQgKCkge1xuICAgIHRoaXMudGlsZVdhdGNoZXIuYmluZCgpXG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGlvbigpXG4gIH1cblxuICBuZXh0QWN0aW9uICgpIHtcbiAgICB0aGlzLnVwZGF0ZVZpc2lvbk1lbW9yeSgpXG4gICAgY29uc3QgZW5lbXkgPSB0aGlzLmdldENsb3Nlc3RFbmVteSgpXG4gICAgaWYgKGVuZW15KSB7XG4gICAgICByZXR1cm4gdGhpcy5hdHRhY2tNb3ZlVG8oZW5lbXkpLm9uKCdlbmQnLCB0aGlzLm5leHRBY3Rpb25DYWxsYmFjaylcbiAgICB9XG4gICAgY29uc3QgdW5leHBsb3JlZCA9IHRoaXMuZ2V0Q2xvc2VzdFVuZXhwbG9yZWQoKVxuICAgIGlmICh1bmV4cGxvcmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrVG8odW5leHBsb3JlZCkub24oJ2VuZCcsIHRoaXMubmV4dEFjdGlvbkNhbGxiYWNrKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc2V0VmlzaW9uTWVtb3J5KClcbiAgICAgIHJldHVybiB0aGlzLndhbGtUbyh0aGlzLmdldENsb3Nlc3RVbmV4cGxvcmVkKCkpLm9uKCdlbmQnLCB0aGlzLm5leHRBY3Rpb25DYWxsYmFjaylcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaXNpb25NZW1vcnkgKCkge1xuICAgIHZhciBjYWxjdWxhdG9yXG4gICAgY2FsY3VsYXRvciA9IG5ldyBWaXNpb25DYWxjdWxhdG9yKHRoaXMuY2hhcmFjdGVyLnRpbGUpXG4gICAgY2FsY3VsYXRvci5jYWxjdWwoKVxuICAgIHRoaXMudmlzaW9uTWVtb3J5ID0gY2FsY3VsYXRvci50b0NvbnRhaW5lcigpLm1lcmdlKHRoaXMudmlzaW9uTWVtb3J5LCAoYSwgYikgPT4ge1xuICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICBhID0gdGhpcy5hbmFseXplVGlsZShhKVxuICAgICAgfVxuICAgICAgaWYgKChhICE9IG51bGwpICYmIChiICE9IG51bGwpKSB7XG4gICAgICAgIGEudmlzaWJpbGl0eSA9IE1hdGgubWF4KGEudmlzaWJpbGl0eSwgYi52aXNpYmlsaXR5KVxuICAgICAgICByZXR1cm4gYVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGEgfHwgYlxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhbmFseXplVGlsZSAodGlsZSkge1xuICAgIHZhciByZWZcbiAgICB0aWxlLmVubmVteVNwb3R0ZWQgPSAocmVmID0gdGlsZS5nZXRGaW5hbFRpbGUoKS5jaGlsZHJlbikgIT0gbnVsbCA/IHJlZi5maW5kKChjKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5pc0VubmVteShjKVxuICAgIH0pIDogbnVsbFxuICAgIHRpbGUuZXhwbG9yYWJsZSA9IHRoaXMuaXNFeHBsb3JhYmxlKHRpbGUpXG4gICAgcmV0dXJuIHRpbGVcbiAgfVxuXG4gIGlzRW5uZW15IChlbGVtKSB7XG4gICAgdmFyIHJlZlxuICAgIHJldHVybiAocmVmID0gdGhpcy5jaGFyYWN0ZXIub3duZXIpICE9IG51bGwgPyB0eXBlb2YgcmVmLmlzRW5lbXkgPT09ICdmdW5jdGlvbicgPyByZWYuaXNFbmVteShlbGVtKSA6IG51bGwgOiBudWxsXG4gIH1cblxuICBnZXRDbG9zZXN0RW5lbXkgKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2lvbk1lbW9yeS5jbG9zZXN0KHRoaXMuY2hhcmFjdGVyLnRpbGUsICh0KSA9PiB7XG4gICAgICByZXR1cm4gdC5lbm5lbXlTcG90dGVkXG4gICAgfSlcbiAgfVxuXG4gIGdldENsb3Nlc3RVbmV4cGxvcmVkICgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkuY2xvc2VzdCh0aGlzLmNoYXJhY3Rlci50aWxlLCAodCkgPT4ge1xuICAgICAgcmV0dXJuIHQudmlzaWJpbGl0eSA8IDEgJiYgdC5leHBsb3JhYmxlXG4gICAgfSlcbiAgfVxuXG4gIGlzRXhwbG9yYWJsZSAodGlsZSkge1xuICAgIHZhciByZWZcbiAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKVxuICAgIHJldHVybiB0aWxlLndhbGthYmxlIHx8ICgocmVmID0gdGlsZS5jaGlsZHJlbikgIT0gbnVsbCA/IHJlZi5maW5kKChjKSA9PiB7XG4gICAgICByZXR1cm4gYyBpbnN0YW5jZW9mIERvb3JcbiAgICB9KSA6IG51bGwpXG4gIH1cblxuICBhdHRhY2tNb3ZlVG8gKHRpbGUpIHtcbiAgICB2YXIgYWN0aW9uXG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKClcbiAgICBhY3Rpb24gPSBuZXcgQXR0YWNrTW92ZUFjdGlvbih7XG4gICAgICBhY3RvcjogdGhpcy5jaGFyYWN0ZXIsXG4gICAgICB0YXJnZXQ6IHRpbGVcbiAgICB9KVxuICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICBhY3Rpb24uZXhlY3V0ZSgpXG4gICAgICByZXR1cm4gYWN0aW9uXG4gICAgfVxuICB9XG5cbiAgd2Fsa1RvICh0aWxlKSB7XG4gICAgdmFyIGFjdGlvblxuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpXG4gICAgYWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgYWN0b3I6IHRoaXMuY2hhcmFjdGVyLFxuICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgfSlcbiAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgYWN0aW9uLmV4ZWN1dGUoKVxuICAgICAgcmV0dXJuIGFjdGlvblxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlckFJXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFZpZXcgPSByZXF1aXJlKCcuL1ZpZXcnKVxuY29uc3QgU2hpcCA9IHJlcXVpcmUoJy4vU2hpcCcpXG5jb25zdCBBcHByb2FjaCA9IHJlcXVpcmUoJy4vQXBwcm9hY2gnKVxuXG5jbGFzcyBDb25mcm9udGF0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gIHN0YXJ0ICgpIHtcbiAgICB0aGlzLnN1YmplY3QuZW5jb3VudGVyID0gdGhpc1xuICAgIHRoaXMuZ2FtZS5tYWluVmlldyA9IHRoaXMudmlld1xuICAgIHRoaXMuZ2FtZS5hZGQodGhpcy5zdWJqZWN0LmludGVycmlvcilcbiAgICB0aGlzLnN1YmplY3QuaW50ZXJyaW9yLmNvbnRhaW5lciA9IHRoaXMudmlld1xuICAgIHRoaXMuZ2FtZS5hZGQodGhpcy5vcHBvbmVudC5pbnRlcnJpb3IpXG4gICAgdGhpcy5vcHBvbmVudC5pbnRlcnJpb3IuY29udGFpbmVyID0gdGhpcy52aWV3XG4gICAgdGhpcy5hcHByb2FjaC5zdGFydCgpXG4gIH1cbn07XG5cbkNvbmZyb250YXRpb24ucHJvcGVydGllcyh7XG4gIGdhbWU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHN1YmplY3Q6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHZpZXc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVmlldygpXG4gICAgfVxuICB9LFxuICBvcHBvbmVudDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBTaGlwKClcbiAgICB9XG4gIH0sXG4gIGFwcHJvYWNoOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IEFwcHJvYWNoKHtcbiAgICAgICAgc3ViamVjdDogdGhpcy5vcHBvbmVudC5pbnRlcnJpb3IsXG4gICAgICAgIHRhcmdldDogdGhpcy5zdWJqZWN0LmludGVycmlvclxuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZnJvbnRhdGlvblxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBMaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKVxuY29uc3QgRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvblxuXG5jbGFzcyBEYW1hZ2VQcm9wYWdhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICBnZXRUaWxlQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlLmNvbnRhaW5lclxuICB9XG5cbiAgYXBwbHkgKCkge1xuICAgIHRoaXMuZ2V0RGFtYWdlZCgpLmZvckVhY2goKGRhbWFnZSkgPT4ge1xuICAgICAgZGFtYWdlLnRhcmdldC5kYW1hZ2UoZGFtYWdlLmRhbWFnZSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0SW5pdGlhbFRpbGVzICgpIHtcbiAgICB2YXIgY3RuXG4gICAgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKClcbiAgICByZXR1cm4gY3RuLmluUmFuZ2UodGhpcy50aWxlLCB0aGlzLnJhbmdlKVxuICB9XG5cbiAgZ2V0SW5pdGlhbERhbWFnZXMgKCkge1xuICAgIGNvbnN0IHRpbGVzID0gdGhpcy5nZXRJbml0aWFsVGlsZXMoKVxuICAgIHJldHVybiB0aWxlcy5yZWR1Y2UoKGRhbWFnZXMsIHRpbGUpID0+IHtcbiAgICAgIGlmICh0aWxlLmRhbWFnZWFibGUpIHtcbiAgICAgICAgY29uc3QgZG1nID0gdGhpcy5pbml0aWFsRGFtYWdlKHRpbGUsIHRpbGVzLmxlbmd0aClcbiAgICAgICAgaWYgKGRtZykge1xuICAgICAgICAgIGRhbWFnZXMucHVzaChkbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkYW1hZ2VzXG4gICAgfSwgW10pXG4gIH1cblxuICBnZXREYW1hZ2VkICgpIHtcbiAgICB2YXIgYWRkZWRcbiAgICBpZiAodGhpcy5fZGFtYWdlZCA9PSBudWxsKSB7XG4gICAgICBhZGRlZCA9IG51bGxcbiAgICAgIGRvIHtcbiAgICAgICAgYWRkZWQgPSB0aGlzLnN0ZXAoYWRkZWQpXG4gICAgICB9IHdoaWxlIChhZGRlZClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2RhbWFnZWRcbiAgfVxuXG4gIHN0ZXAgKGFkZGVkKSB7XG4gICAgaWYgKGFkZGVkICE9IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLmV4dGVuZGVkRGFtYWdlICE9IG51bGwpIHtcbiAgICAgICAgYWRkZWQgPSB0aGlzLmV4dGVuZChhZGRlZClcbiAgICAgICAgdGhpcy5fZGFtYWdlZCA9IGFkZGVkLmNvbmNhdCh0aGlzLl9kYW1hZ2VkKVxuICAgICAgICByZXR1cm4gYWRkZWQubGVuZ3RoID4gMCAmJiBhZGRlZFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYW1hZ2VkID0gdGhpcy5nZXRJbml0aWFsRGFtYWdlcygpXG4gICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZFxuICAgIH1cbiAgfVxuXG4gIGluRGFtYWdlZCAodGFyZ2V0LCBkYW1hZ2VkKSB7XG4gICAgY29uc3QgcG9zID0gZGFtYWdlZC5maW5kSW5kZXgoKGRhbWFnZSkgPT4gZGFtYWdlLnRhcmdldCA9PT0gdGFyZ2V0KVxuICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHBvc1xuICB9XG5cbiAgZXh0ZW5kIChkYW1hZ2VkKSB7XG4gICAgY29uc3QgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKClcbiAgICByZXR1cm4gZGFtYWdlZC5yZWR1Y2UoKGFkZGVkLCBkYW1hZ2UpID0+IHtcbiAgICAgIGlmIChkYW1hZ2UudGFyZ2V0LnggPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYWRkZWRcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxvY2FsID0gRGlyZWN0aW9uLmFkamFjZW50cy5yZWR1Y2UoKGxvY2FsLCBkaXIpID0+IHtcbiAgICAgICAgY29uc3QgdGlsZSA9IGN0bi5nZXRUaWxlKGRhbWFnZS50YXJnZXQueCArIGRpci54LCBkYW1hZ2UudGFyZ2V0LnkgKyBkaXIueSlcbiAgICAgICAgaWYgKCh0aWxlICE9IG51bGwpICYmIHRpbGUuZGFtYWdlYWJsZSAmJiB0aGlzLmluRGFtYWdlZCh0aWxlLCB0aGlzLl9kYW1hZ2VkKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBsb2NhbC5wdXNoKHRpbGUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2FsXG4gICAgICB9LCBbXSlcbiAgICAgIHJldHVybiBsb2NhbC5yZWR1Y2UoKGFkZGVkLCB0YXJnZXQpID0+IHtcbiAgICAgICAgY29uc3QgZG1nID0gdGhpcy5leHRlbmRlZERhbWFnZSh0YXJnZXQsIGRhbWFnZSwgbG9jYWwubGVuZ3RoKVxuICAgICAgICBpZiAoZG1nKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLmluRGFtYWdlZCh0YXJnZXQsIGFkZGVkKVxuICAgICAgICAgIGlmIChleGlzdGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFkZGVkLnB1c2goZG1nKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRlZFtleGlzdGluZ10gPSB0aGlzLm1lcmdlRGFtYWdlKGFkZGVkW2V4aXN0aW5nXSwgZG1nKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWRkZWRcbiAgICAgIH0sIGFkZGVkKVxuICAgIH0sIFtdKVxuICB9XG5cbiAgbWVyZ2VEYW1hZ2UgKGQxLCBkMikge1xuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IGQxLnRhcmdldCxcbiAgICAgIHBvd2VyOiBkMS5wb3dlciArIGQyLnBvd2VyLFxuICAgICAgZGFtYWdlOiBkMS5kYW1hZ2UgKyBkMi5kYW1hZ2VcbiAgICB9XG4gIH1cblxuICBtb2RpZnlEYW1hZ2UgKHRhcmdldCwgcG93ZXIpIHtcbiAgICBpZiAodHlwZW9mIHRhcmdldC5tb2RpZnlEYW1hZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHRhcmdldC5tb2RpZnlEYW1hZ2UocG93ZXIsIHRoaXMudHlwZSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHBvd2VyKVxuICAgIH1cbiAgfVxufTtcblxuRGFtYWdlUHJvcGFnYXRpb24ucHJvcGVydGllcyh7XG4gIHRpbGU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgcmFuZ2U6IHtcbiAgICBkZWZhdWx0OiAxXG4gIH0sXG4gIHR5cGU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH1cbn0pXG5cbkRhbWFnZVByb3BhZ2F0aW9uLk5vcm1hbCA9IGNsYXNzIE5vcm1hbCBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgaW5pdGlhbERhbWFnZSAodGFyZ2V0LCBuYikge1xuICAgIHZhciBkbWdcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHRoaXMucG93ZXIpXG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuRGFtYWdlUHJvcGFnYXRpb24uVGhlcm1pYyA9IGNsYXNzIFRoZXJtaWMgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gIGV4dGVuZGVkRGFtYWdlICh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXJcbiAgICBwb3dlciA9IChsYXN0LmRhbWFnZSAtIDEpIC8gMiAvIG5iICogTWF0aC5taW4oMSwgbGFzdC50YXJnZXQuaGVhbHRoIC8gbGFzdC50YXJnZXQubWF4SGVhbHRoICogNSlcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKVxuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxEYW1hZ2UgKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlclxuICAgIHBvd2VyID0gdGhpcy5wb3dlciAvIG5iXG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcilcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuRGFtYWdlUHJvcGFnYXRpb24uS2luZXRpYyA9IGNsYXNzIEtpbmV0aWMgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gIGV4dGVuZGVkRGFtYWdlICh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXJcbiAgICBwb3dlciA9IChsYXN0LnBvd2VyIC0gbGFzdC5kYW1hZ2UpICogTWF0aC5taW4oMSwgbGFzdC50YXJnZXQuaGVhbHRoIC8gbGFzdC50YXJnZXQubWF4SGVhbHRoICogMikgLSAxXG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcilcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpbml0aWFsRGFtYWdlICh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZ1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgdGhpcy5wb3dlcilcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1vZGlmeURhbWFnZSAodGFyZ2V0LCBwb3dlcikge1xuICAgIGlmICh0eXBlb2YgdGFyZ2V0Lm1vZGlmeURhbWFnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGFyZ2V0Lm1vZGlmeURhbWFnZShwb3dlciwgdGhpcy50eXBlKSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIgKiAwLjI1KVxuICAgIH1cbiAgfVxuXG4gIG1lcmdlRGFtYWdlIChkMSwgZDIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICBwb3dlcjogTWF0aC5mbG9vcigoZDEucG93ZXIgKyBkMi5wb3dlcikgLyAyKSxcbiAgICAgIGRhbWFnZTogTWF0aC5mbG9vcigoZDEuZGFtYWdlICsgZDIuZGFtYWdlKSAvIDIpXG4gICAgfVxuICB9XG59XG5cbkRhbWFnZVByb3BhZ2F0aW9uLkV4cGxvc2l2ZSA9IChmdW5jdGlvbiAoKSB7XG4gIGNsYXNzIEV4cGxvc2l2ZSBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgICBnZXREYW1hZ2VkICgpIHtcbiAgICAgIHZhciBhbmdsZSwgaW5zaWRlLCBzaGFyZFBvd2VyLCB0YXJnZXRcbiAgICAgIHRoaXMuX2RhbWFnZWQgPSBbXVxuICAgICAgY29uc3Qgc2hhcmRzID0gTWF0aC5wb3codGhpcy5yYW5nZSArIDEsIDIpXG4gICAgICBzaGFyZFBvd2VyID0gdGhpcy5wb3dlciAvIHNoYXJkc1xuICAgICAgaW5zaWRlID0gdGhpcy50aWxlLmhlYWx0aCA8PSB0aGlzLm1vZGlmeURhbWFnZSh0aGlzLnRpbGUsIHNoYXJkUG93ZXIpXG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHNoYXJkUG93ZXIgKj0gNFxuICAgICAgfVxuICAgICAgdGhpcy5fZGFtYWdlZCA9IEFycmF5KC4uLkFycmF5KHNoYXJkcyArIDEpKS5yZWR1Y2UoKGRhbWFnZWQpID0+IHtcbiAgICAgICAgYW5nbGUgPSB0aGlzLnJuZygpICogTWF0aC5QSSAqIDJcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUaWxlSGl0QnlTaGFyZChpbnNpZGUsIGFuZ2xlKVxuICAgICAgICBpZiAodGFyZ2V0ICE9IG51bGwpIHtcbiAgICAgICAgICBkYW1hZ2VkLnB1c2goe1xuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICBwb3dlcjogc2hhcmRQb3dlcixcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBzaGFyZFBvd2VyKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhbWFnZWRcbiAgICAgIH0sIFtdKVxuICAgICAgcmV0dXJuIHRoaXMuX2RhbWFnZWRcbiAgICB9XG5cbiAgICBnZXRUaWxlSGl0QnlTaGFyZCAoaW5zaWRlLCBhbmdsZSkge1xuICAgICAgdmFyIGN0biwgZGlzdCwgdGFyZ2V0LCB2ZXJ0ZXhcbiAgICAgIGN0biA9IHRoaXMuZ2V0VGlsZUNvbnRhaW5lcigpXG4gICAgICBkaXN0ID0gdGhpcy5yYW5nZSAqIHRoaXMucm5nKClcbiAgICAgIHRhcmdldCA9IHtcbiAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUgKyBkaXN0ICogTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNSArIGRpc3QgKiBNYXRoLnNpbihhbmdsZSlcbiAgICAgIH1cbiAgICAgIGlmIChpbnNpZGUpIHtcbiAgICAgICAgdmVydGV4ID0gbmV3IExpbmVPZlNpZ2h0KGN0biwgdGhpcy50aWxlLnggKyAwLjUsIHRoaXMudGlsZS55ICsgMC41LCB0YXJnZXQueCwgdGFyZ2V0LnkpXG4gICAgICAgIHZlcnRleC50cmF2ZXJzYWJsZUNhbGxiYWNrID0gKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gIWluc2lkZSB8fCAoKHRpbGUgIT0gbnVsbCkgJiYgdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUpKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZXJ0ZXguZ2V0RW5kUG9pbnQoKS50aWxlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY3RuLmdldFRpbGUoTWF0aC5mbG9vcih0YXJnZXQueCksIE1hdGguZmxvb3IodGFyZ2V0LnkpKVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBFeHBsb3NpdmUucHJvcGVydGllcyh7XG4gICAgcm5nOiB7XG4gICAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICAgIH0sXG4gICAgdHJhdmVyc2FibGVDYWxsYmFjazoge1xuICAgICAgZGVmYXVsdDogZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgcmV0dXJuICEodHlwZW9mIHRpbGUuZ2V0U29saWQgPT09ICdmdW5jdGlvbicgJiYgdGlsZS5nZXRTb2xpZCgpKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gRXhwbG9zaXZlXG59LmNhbGwodGhpcykpXG5cbm1vZHVsZS5leHBvcnRzID0gRGFtYWdlUHJvcGFnYXRpb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBEYW1hZ2VhYmxlIGV4dGVuZHMgRWxlbWVudCB7XG4gIGRhbWFnZSAodmFsKSB7XG4gICAgdGhpcy5oZWFsdGggPSBNYXRoLm1heCgwLCB0aGlzLmhlYWx0aCAtIHZhbClcbiAgfVxuXG4gIHdoZW5Ob0hlYWx0aCAoKSB7fVxufTtcblxuRGFtYWdlYWJsZS5wcm9wZXJ0aWVzKHtcbiAgZGFtYWdlYWJsZToge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgbWF4SGVhbHRoOiB7XG4gICAgZGVmYXVsdDogMTAwMFxuICB9LFxuICBoZWFsdGg6IHtcbiAgICBkZWZhdWx0OiAxMDAwLFxuICAgIGNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2hlbk5vSGVhbHRoKClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gRGFtYWdlYWJsZVxuIiwiY29uc3QgVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWRcblxuY29uc3QgZGlyZWN0aW9ucyA9IHtcbiAgaG9yaXpvbnRhbDogJ2hvcml6b250YWwnLFxuICB2ZXJ0aWNhbDogJ3ZlcnRpY2FsJ1xufVxuXG5jbGFzcyBEb29yIGV4dGVuZHMgVGlsZWQge1xuICB1cGRhdGVUaWxlTWVtYmVycyAob2xkKSB7XG4gICAgdmFyIHJlZiwgcmVmMSwgcmVmMiwgcmVmM1xuICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgaWYgKChyZWYgPSBvbGQud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgIHJlZi5yZW1vdmVQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSlcbiAgICAgIH1cbiAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgcmVmMS5yZW1vdmVQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgaWYgKChyZWYyID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYyLmFkZFByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIChyZWYzID0gdGhpcy50aWxlLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCA/IHJlZjMuYWRkUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpIDogbnVsbFxuICAgIH1cbiAgfVxufTtcblxuRG9vci5wcm9wZXJ0aWVzKHtcbiAgdGlsZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkKSB7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVUaWxlTWVtYmVycyhvbGQpXG4gICAgfVxuICB9LFxuICBvcGVuOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgZGlyZWN0aW9uOiB7XG4gICAgZGVmYXVsdDogZGlyZWN0aW9ucy5ob3Jpem9udGFsXG4gIH1cbn0pXG5cbkRvb3IuZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPSBEb29yXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS53YXRjaGVycy5Qcm9wZXJ0eVdhdGNoZXJcbmNvbnN0IENvbmZyb250YXRpb24gPSByZXF1aXJlKCcuL0NvbmZyb250YXRpb24nKVxuXG5jbGFzcyBFbmNvdW50ZXJNYW5hZ2VyIGV4dGVuZHMgRWxlbWVudCB7XG4gIGluaXQgKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uV2F0Y2hlci5iaW5kKClcbiAgfVxuXG4gIHRlc3RFbmNvdW50ZXIgKCkge1xuICAgIGlmICh0aGlzLnJuZygpIDw9IHRoaXMuYmFzZVByb2JhYmlsaXR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydEVuY291bnRlcigpXG4gICAgfVxuICB9XG5cbiAgc3RhcnRFbmNvdW50ZXIgKCkge1xuICAgIHZhciBlbmNvdW50ZXJcbiAgICBlbmNvdW50ZXIgPSBuZXcgQ29uZnJvbnRhdGlvbih7XG4gICAgICBzdWJqZWN0OiB0aGlzLnN1YmplY3QsXG4gICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICB9KVxuICAgIHJldHVybiBlbmNvdW50ZXIuc3RhcnQoKVxuICB9XG59O1xuXG5FbmNvdW50ZXJNYW5hZ2VyLnByb3BlcnRpZXMoe1xuICBzdWJqZWN0OiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBnYW1lOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBiYXNlUHJvYmFiaWxpdHk6IHtcbiAgICBkZWZhdWx0OiAwLjJcbiAgfSxcbiAgbG9jYXRpb25XYXRjaGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGVzdEVuY291bnRlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnN1YmplY3QucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ2xvY2F0aW9uJylcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuICBybmc6IHtcbiAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuY291bnRlck1hbmFnZXJcbiIsImNvbnN0IFRpbGUgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVxuXG5jbGFzcyBGbG9vciBleHRlbmRzIFRpbGUge307XG5cbkZsb29yLnByb3BlcnRpZXMoe1xuICB3YWxrYWJsZToge1xuICAgIGNvbXBvc2VkOiB0cnVlXG4gIH0sXG4gIHRyYW5zcGFyZW50OiB7XG4gICAgY29tcG9zZWQ6IHRydWVcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5jb25zdCBWaWV3ID0gcmVxdWlyZSgnLi9WaWV3JylcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJylcblxuY2xhc3MgR2FtZSBleHRlbmRzIEVsZW1lbnQge1xuICBzdGFydCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBsYXllclxuICB9XG5cbiAgYWRkIChlbGVtKSB7XG4gICAgZWxlbS5nYW1lID0gdGhpc1xuICAgIHJldHVybiBlbGVtXG4gIH1cbn07XG5cbkdhbWUucHJvcGVydGllcyh7XG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKVxuICAgIH1cbiAgfSxcbiAgbWFpblZpZXc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnZpZXdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlld3MuZ2V0KDApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBWaWV3Q2xhc3MgPSB0aGlzLmRlZmF1bHRWaWV3Q2xhc3NcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG5ldyBWaWV3Q2xhc3MoKSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXdzOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZVxuICB9LFxuICBjdXJyZW50UGxheWVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5wbGF5ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVycy5nZXQoMClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IFBsYXllckNsYXNzID0gdGhpcy5kZWZhdWx0UGxheWVyQ2xhc3NcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG5ldyBQbGF5ZXJDbGFzcygpKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcGxheWVyczoge1xuICAgIGNvbGxlY3Rpb246IHRydWVcbiAgfVxufSlcblxuR2FtZS5wcm90b3R5cGUuZGVmYXVsdFZpZXdDbGFzcyA9IFZpZXdcblxuR2FtZS5wcm90b3R5cGUuZGVmYXVsdFBsYXllckNsYXNzID0gUGxheWVyXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVxuIiwiY29uc3QgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5Db2xsZWN0aW9uXG5cbmNsYXNzIEludmVudG9yeSBleHRlbmRzIENvbGxlY3Rpb24ge1xuICBnZXRCeVR5cGUgKHR5cGUpIHtcbiAgICB2YXIgcmVzXG4gICAgcmVzID0gdGhpcy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgIHJldHVybiByLnR5cGUgPT09IHR5cGVcbiAgICB9KVxuICAgIGlmIChyZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmVzWzBdXG4gICAgfVxuICB9XG5cbiAgYWRkQnlUeXBlICh0eXBlLCBxdGUsIHBhcnRpYWwgPSBmYWxzZSkge1xuICAgIHZhciByZXNzb3VyY2VcbiAgICByZXNzb3VyY2UgPSB0aGlzLmdldEJ5VHlwZSh0eXBlKVxuICAgIGlmICghcmVzc291cmNlKSB7XG4gICAgICByZXNzb3VyY2UgPSB0aGlzLmluaXRSZXNzb3VyY2UodHlwZSlcbiAgICB9XG4gICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgIHJlc3NvdXJjZS5wYXJ0aWFsQ2hhbmdlKHJlc3NvdXJjZS5xdGUgKyBxdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3NvdXJjZS5xdGUgKz0gcXRlXG4gICAgfVxuICB9XG5cbiAgaW5pdFJlc3NvdXJjZSAodHlwZSwgb3B0KSB7XG4gICAgcmV0dXJuIHR5cGUuaW5pdFJlc3NvdXJjZShvcHQpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZlbnRvcnlcbiIsImNsYXNzIExpbmVPZlNpZ2h0IHtcbiAgY29uc3RydWN0b3IgKHRpbGVzLCB4MSA9IDAsIHkxID0gMCwgeDIgPSAwLCB5MiA9IDApIHtcbiAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB0aGlzLngxID0geDFcbiAgICB0aGlzLnkxID0geTFcbiAgICB0aGlzLngyID0geDJcbiAgICB0aGlzLnkyID0geTJcbiAgfVxuXG4gIHNldFgxICh2YWwpIHtcbiAgICB0aGlzLngxID0gdmFsXG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpXG4gIH1cblxuICBzZXRZMSAodmFsKSB7XG4gICAgdGhpcy55MSA9IHZhbFxuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKVxuICB9XG5cbiAgc2V0WDIgKHZhbCkge1xuICAgIHRoaXMueDIgPSB2YWxcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKClcbiAgfVxuXG4gIHNldFkyICh2YWwpIHtcbiAgICB0aGlzLnkyID0gdmFsXG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpXG4gIH1cblxuICBpbnZhbGlkYWRlICgpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0gbnVsbFxuICAgIHRoaXMuc3VjY2VzcyA9IG51bGxcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICB9XG5cbiAgdGVzdFRpbGUgKHRpbGUsIGVudHJ5WCwgZW50cnlZKSB7XG4gICAgaWYgKHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUsIGVudHJ5WCwgZW50cnlZKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCkgJiYgKHR5cGVvZiB0aWxlLmdldFRyYW5zcGFyZW50ID09PSAnZnVuY3Rpb24nID8gdGlsZS5nZXRUcmFuc3BhcmVudCgpIDogdGlsZS50cmFuc3BhcmVudCAhPSBudWxsID8gdGlsZS50cmFuc3BhcmVudCA6IHRydWUpXG4gICAgfVxuICB9XG5cbiAgdGVzdFRpbGVBdCAoeCwgeSwgZW50cnlYLCBlbnRyeVkpIHtcbiAgICByZXR1cm4gdGhpcy50ZXN0VGlsZSh0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih4KSwgTWF0aC5mbG9vcih5KSksIGVudHJ5WCwgZW50cnlZKVxuICB9XG5cbiAgcmV2ZXJzZVRyYWNpbmcgKCkge1xuICAgIHZhciB0bXBYLCB0bXBZXG4gICAgdG1wWCA9IHRoaXMueDFcbiAgICB0bXBZID0gdGhpcy55MVxuICAgIHRoaXMueDEgPSB0aGlzLngyXG4gICAgdGhpcy55MSA9IHRoaXMueTJcbiAgICB0aGlzLngyID0gdG1wWFxuICAgIHRoaXMueTIgPSB0bXBZXG4gICAgdGhpcy5yZXZlcnNlZCA9ICF0aGlzLnJldmVyc2VkXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHZhciBuZXh0WCwgbmV4dFksIHBvc2l0aXZlWCwgcG9zaXRpdmVZLCByYXRpbywgdGlsZVgsIHRpbGVZLCB0b3RhbCwgeCwgeVxuICAgIHJhdGlvID0gKHRoaXMueDIgLSB0aGlzLngxKSAvICh0aGlzLnkyIC0gdGhpcy55MSlcbiAgICB0b3RhbCA9IE1hdGguYWJzKHRoaXMueDIgLSB0aGlzLngxKSArIE1hdGguYWJzKHRoaXMueTIgLSB0aGlzLnkxKVxuICAgIHBvc2l0aXZlWCA9ICh0aGlzLngyIC0gdGhpcy54MSkgPj0gMFxuICAgIHBvc2l0aXZlWSA9ICh0aGlzLnkyIC0gdGhpcy55MSkgPj0gMFxuICAgIHRpbGVYID0geCA9IHRoaXMueDFcbiAgICB0aWxlWSA9IHkgPSB0aGlzLnkxXG4gICAgaWYgKHRoaXMucmV2ZXJzZWQpIHtcbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDFcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICB9XG4gICAgd2hpbGUgKHRvdGFsID4gTWF0aC5hYnMoeCAtIHRoaXMueDEpICsgTWF0aC5hYnMoeSAtIHRoaXMueTEpICYmIHRoaXMudGVzdFRpbGVBdCh0aWxlWCwgdGlsZVksIHgsIHkpKSB7XG4gICAgICBuZXh0WCA9IHBvc2l0aXZlWCA/IE1hdGguZmxvb3IoeCkgKyAxIDogTWF0aC5jZWlsKHgpIC0gMVxuICAgICAgbmV4dFkgPSBwb3NpdGl2ZVkgPyBNYXRoLmZsb29yKHkpICsgMSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICAgIGlmICh0aGlzLngyIC0gdGhpcy54MSA9PT0gMCkge1xuICAgICAgICB5ID0gbmV4dFlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy55MiAtIHRoaXMueTEgPT09IDApIHtcbiAgICAgICAgeCA9IG5leHRYXG4gICAgICB9IGVsc2UgaWYgKE1hdGguYWJzKChuZXh0WCAtIHgpIC8gKHRoaXMueDIgLSB0aGlzLngxKSkgPCBNYXRoLmFicygobmV4dFkgLSB5KSAvICh0aGlzLnkyIC0gdGhpcy55MSkpKSB7XG4gICAgICAgIHggPSBuZXh0WFxuICAgICAgICB5ID0gKG5leHRYIC0gdGhpcy54MSkgLyByYXRpbyArIHRoaXMueTFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHggPSAobmV4dFkgLSB0aGlzLnkxKSAqIHJhdGlvICsgdGhpcy54MVxuICAgICAgICB5ID0gbmV4dFlcbiAgICAgIH1cbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDFcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICB9XG4gICAgaWYgKHRvdGFsIDw9IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSkge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogdGhpcy54MixcbiAgICAgICAgeTogdGhpcy55MixcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGhpcy54MiksIE1hdGguZmxvb3IodGhpcy55MikpXG4gICAgICB9XG4gICAgICB0aGlzLnN1Y2Nlc3MgPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRpbGVYKSwgTWF0aC5mbG9vcih0aWxlWSkpXG4gICAgICB9XG4gICAgICB0aGlzLnN1Y2Nlc3MgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGZvcmNlU3VjY2VzcyAoKSB7XG4gICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgIHg6IHRoaXMueDIsXG4gICAgICB5OiB0aGlzLnkyLFxuICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGhpcy54MiksIE1hdGguZmxvb3IodGhpcy55MikpXG4gICAgfVxuICAgIHRoaXMuc3VjY2VzcyA9IHRydWVcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGdldFN1Y2Nlc3MgKCkge1xuICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bCgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3NcbiAgfVxuXG4gIGdldEVuZFBvaW50ICgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5jYWxjdWwoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmRQb2ludFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZU9mU2lnaHRcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBNYXAgZXh0ZW5kcyBFbGVtZW50IHtcbiAgX2FkZFRvQm9uZGFyaWVzIChsb2NhdGlvbiwgYm91bmRhcmllcykge1xuICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgbG9jYXRpb24ueSA8IGJvdW5kYXJpZXMudG9wKSB7XG4gICAgICBib3VuZGFyaWVzLnRvcCA9IGxvY2F0aW9uLnlcbiAgICB9XG4gICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgbG9jYXRpb24ueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgYm91bmRhcmllcy5sZWZ0ID0gbG9jYXRpb24ueFxuICAgIH1cbiAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IGxvY2F0aW9uLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgYm91bmRhcmllcy5ib3R0b20gPSBsb2NhdGlvbi55XG4gICAgfVxuICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCBsb2NhdGlvbi54ID4gYm91bmRhcmllcy5yaWdodCkge1xuICAgICAgYm91bmRhcmllcy5yaWdodCA9IGxvY2F0aW9uLnhcbiAgICB9XG4gIH1cbn07XG5cbk1hcC5wcm9wZXJ0aWVzKHtcbiAgbG9jYXRpb25zOiB7XG4gICAgY29sbGVjdGlvbjoge1xuICAgICAgY2xvc2VzdDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdmFyIG1pbiwgbWluRGlzdFxuICAgICAgICBtaW4gPSBudWxsXG4gICAgICAgIG1pbkRpc3QgPSBudWxsXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgICAgICB2YXIgZGlzdFxuICAgICAgICAgIGRpc3QgPSBsb2NhdGlvbi5kaXN0KHgsIHkpXG4gICAgICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgICAgIG1pbiA9IGxvY2F0aW9uXG4gICAgICAgICAgICBtaW5EaXN0ID0gZGlzdFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIG1pblxuICAgICAgfSxcbiAgICAgIGNsb3Nlc3RzOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB2YXIgZGlzdHNcbiAgICAgICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlzdDogbG9jYXRpb24uZGlzdCh4LCB5KSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgZGlzdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3RcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weShkaXN0cy5tYXAoZnVuY3Rpb24gKGRpc3QpIHtcbiAgICAgICAgICByZXR1cm4gZGlzdC5sb2NhdGlvblxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJvdW5kYXJpZXM6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBib3VuZGFyaWVzXG4gICAgICBib3VuZGFyaWVzID0ge1xuICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgIGxlZnQ6IG51bGwsXG4gICAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgICAgcmlnaHQ6IG51bGxcbiAgICAgIH1cbiAgICAgIHRoaXMubG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRUb0JvbmRhcmllcyhsb2NhdGlvbiwgYm91bmRhcmllcylcbiAgICAgIH0pXG4gICAgICByZXR1cm4gYm91bmRhcmllc1xuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBcbiIsImNvbnN0IFRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkXG5cbmNsYXNzIE9ic3RhY2xlIGV4dGVuZHMgVGlsZWQge1xuICB1cGRhdGVXYWxrYWJsZXMgKG9sZCkge1xuICAgIHZhciByZWYsIHJlZjFcbiAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgIGlmICgocmVmID0gb2xkLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYucmVtb3ZlUmVmKHtcbiAgICAgICAgICBuYW1lOiAnd2Fsa2FibGUnLFxuICAgICAgICAgIG9iajogdGhpc1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICByZXR1cm4gKHJlZjEgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsID8gcmVmMS5zZXRWYWx1ZVJlZihmYWxzZSwgJ3dhbGthYmxlJywgdGhpcykgOiBudWxsXG4gICAgfVxuICB9XG59O1xuXG5PYnN0YWNsZS5wcm9wZXJ0aWVzKHtcbiAgdGlsZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkLCBvdmVycmlkZWQpIHtcbiAgICAgIG92ZXJyaWRlZChvbGQpXG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVXYWxrYWJsZXMob2xkKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBPYnN0YWNsZVxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jbGFzcyBQYXRoV2FsayBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAod2Fsa2VyLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucylcbiAgICB0aGlzLndhbGtlciA9IHdhbGtlclxuICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgfVxuXG4gIHN0YXJ0ICgpIHtcbiAgICBpZiAoIXRoaXMucGF0aC5zb2x1dGlvbikge1xuICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpXG4gICAgfVxuICAgIGlmICh0aGlzLnBhdGguc29sdXRpb24pIHtcbiAgICAgIHRoaXMucGF0aFRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKClcbiAgICAgIH0sIHRoaXMudG90YWxUaW1lKVxuICAgICAgdGhpcy53YWxrZXIudGlsZU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi50aWxlJywgdGhpcylcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFhNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpXG4gICAgICByZXR1cm4gdGhpcy53YWxrZXIub2Zmc2V0WU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi5vZmZzZXRZJywgdGhpcylcbiAgICB9XG4gIH1cblxuICBzdG9wICgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoVGltZW91dC5wYXVzZSgpXG4gIH1cblxuICBmaW5pc2ggKCkge1xuICAgIHRoaXMud2Fsa2VyLnRpbGUgPSB0aGlzLnBvc2l0aW9uLnRpbGVcbiAgICB0aGlzLndhbGtlci5vZmZzZXRYID0gdGhpcy5wb3NpdGlvbi5vZmZzZXRYXG4gICAgdGhpcy53YWxrZXIub2Zmc2V0WSA9IHRoaXMucG9zaXRpb24ub2Zmc2V0WVxuICAgIHRoaXMuZW1pdCgnZmluaXNoZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBpbnRlcnJ1cHQgKCkge1xuICAgIHRoaXMuZW1pdCgnaW50ZXJydXB0ZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBlbmQgKCkge1xuICAgIHRoaXMuZW1pdCgnZW5kJylcbiAgICByZXR1cm4gdGhpcy5kZXN0cm95KClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLndhbGtlci53YWxrID09PSB0aGlzKSB7XG4gICAgICB0aGlzLndhbGtlci53YWxrID0gbnVsbFxuICAgIH1cbiAgICB0aGlzLndhbGtlci50aWxlTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLnRpbGUnLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLndhbGtlci5vZmZzZXRYTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFgnLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLndhbGtlci5vZmZzZXRZTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFknLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLnBhdGhUaW1lb3V0LmRlc3Ryb3koKVxuICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKClcbiAgfVxufTtcblxuUGF0aFdhbGsuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKVxuXG5QYXRoV2Fsay5wcm9wZXJ0aWVzKHtcbiAgc3BlZWQ6IHtcbiAgICBkZWZhdWx0OiA1XG4gIH0sXG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlZlxuICAgICAgaWYgKChyZWYgPSB0aGlzLndhbGtlci5nYW1lKSAhPSBudWxsID8gcmVmLnRpbWluZyA6IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2VyLmdhbWUudGltaW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwYXRoTGVuZ3RoOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKClcbiAgICB9XG4gIH0sXG4gIHRvdGFsVGltZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aExlbmd0aCAvIHRoaXMuc3BlZWQgKiAxMDAwXG4gICAgfVxuICB9LFxuICBwb3NpdGlvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoLmdldFBvc0F0UHJjKGludmFsaWRhdG9yLnByb3BQYXRoKCdwYXRoVGltZW91dC5wcmMnKSB8fCAwKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoV2Fsa1xuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBMaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKVxuY29uc3QgVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKVxuXG5jbGFzcyBQZXJzb25hbFdlYXBvbiBleHRlbmRzIEVsZW1lbnQge1xuICBjYW5CZVVzZWQgKCkge1xuICAgIHJldHVybiB0aGlzLmNoYXJnZWRcbiAgfVxuXG4gIGNhblVzZU9uICh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5jYW5Vc2VGcm9tKHRoaXMudXNlci50aWxlLCB0YXJnZXQpXG4gIH1cblxuICBjYW5Vc2VGcm9tICh0aWxlLCB0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5yYW5nZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5SYW5nZSh0aWxlLCB0YXJnZXQpICYmIHRoaXMuaGFzTGluZU9mU2lnaHQodGlsZSwgdGFyZ2V0KVxuICAgIH1cbiAgfVxuXG4gIGluUmFuZ2UgKHRpbGUsIHRhcmdldCkge1xuICAgIHZhciByZWYsIHRhcmdldFRpbGVcbiAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0XG4gICAgcmV0dXJuICgocmVmID0gdGlsZS5kaXN0KHRhcmdldFRpbGUpKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IG51bGwpIDw9IHRoaXMucmFuZ2VcbiAgfVxuXG4gIGluTWVsZWVSYW5nZSAodGlsZSwgdGFyZ2V0KSB7XG4gICAgdmFyIHRhcmdldFRpbGVcbiAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0XG4gICAgcmV0dXJuIE1hdGguYWJzKHRhcmdldFRpbGUueCAtIHRpbGUueCkgKyBNYXRoLmFicyh0YXJnZXRUaWxlLnkgLSB0aWxlLnkpID09PSAxXG4gIH1cblxuICBoYXNMaW5lT2ZTaWdodCAodGlsZSwgdGFyZ2V0KSB7XG4gICAgdmFyIGxvcywgdGFyZ2V0VGlsZVxuICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXRcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGFyZ2V0VGlsZS5jb250YWluZXIsIHRpbGUueCArIDAuNSwgdGlsZS55ICsgMC41LCB0YXJnZXRUaWxlLnggKyAwLjUsIHRhcmdldFRpbGUueSArIDAuNSlcbiAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICByZXR1cm4gdGlsZS53YWxrYWJsZVxuICAgIH1cbiAgICByZXR1cm4gbG9zLmdldFN1Y2Nlc3MoKVxuICB9XG5cbiAgdXNlT24gKHRhcmdldCkge1xuICAgIGlmICh0aGlzLmNhbkJlVXNlZCgpKSB7XG4gICAgICB0YXJnZXQuZGFtYWdlKHRoaXMucG93ZXIpXG4gICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZVxuICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2UoKVxuICAgIH1cbiAgfVxuXG4gIHJlY2hhcmdlICgpIHtcbiAgICB0aGlzLmNoYXJnaW5nID0gdHJ1ZVxuICAgIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5jaGFyZ2luZyA9IGZhbHNlXG4gICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZWQoKVxuICAgIH0sIHRoaXMucmVjaGFyZ2VUaW1lKVxuICB9XG5cbiAgcmVjaGFyZ2VkICgpIHtcbiAgICB0aGlzLmNoYXJnZWQgPSB0cnVlXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5jaGFyZ2VUaW1lb3V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VUaW1lb3V0LmRlc3Ryb3koKVxuICAgIH1cbiAgfVxufTtcblxuUGVyc29uYWxXZWFwb24ucHJvcGVydGllcyh7XG4gIHJlY2hhcmdlVGltZToge1xuICAgIGRlZmF1bHQ6IDEwMDBcbiAgfSxcbiAgY2hhcmdlZDoge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgY2hhcmdpbmc6IHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgZHBzOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMucG93ZXJQcm9wZXJ0eSkgLyBpbnZhbGlkYXRvci5wcm9wKHRoaXMucmVjaGFyZ2VUaW1lUHJvcGVydHkpICogMTAwMFxuICAgIH1cbiAgfSxcbiAgcmFuZ2U6IHtcbiAgICBkZWZhdWx0OiAxMFxuICB9LFxuICB1c2VyOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uYWxXZWFwb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgc2V0RGVmYXVsdHMgKCkge1xuICAgIHZhciBmaXJzdFxuICAgIGZpcnN0ID0gdGhpcy5nYW1lLnBsYXllcnMubGVuZ3RoID09PSAwXG4gICAgdGhpcy5nYW1lLnBsYXllcnMuYWRkKHRoaXMpXG4gICAgaWYgKGZpcnN0ICYmICF0aGlzLmNvbnRyb2xsZXIgJiYgdGhpcy5nYW1lLmRlZmF1bHRQbGF5ZXJDb250cm9sbGVyQ2xhc3MpIHtcbiAgICAgIGNvbnN0IFBsYXllckNvbnRyb2xsZXJDbGFzcyA9IHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzXG4gICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgUGxheWVyQ29udHJvbGxlckNsYXNzKClcbiAgICB9XG4gIH1cblxuICBjYW5UYXJnZXRBY3Rpb25PbiAoZWxlbSkge1xuICAgIHZhciBhY3Rpb24sIHJlZlxuICAgIGFjdGlvbiA9IHRoaXMuc2VsZWN0ZWRBY3Rpb24gfHwgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLmRlZmF1bHRBY3Rpb24gOiBudWxsKVxuICAgIHJldHVybiAoYWN0aW9uICE9IG51bGwpICYmIHR5cGVvZiBhY3Rpb24uY2FuVGFyZ2V0ID09PSAnZnVuY3Rpb24nICYmIGFjdGlvbi5jYW5UYXJnZXQoZWxlbSlcbiAgfVxuXG4gIGd1ZXNzQWN0aW9uVGFyZ2V0IChhY3Rpb24pIHtcbiAgICB2YXIgc2VsZWN0ZWRcbiAgICBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWRcbiAgICBpZiAodHlwZW9mIGFjdGlvbi5jYW5UYXJnZXQgPT09ICdmdW5jdGlvbicgJiYgKGFjdGlvbi50YXJnZXQgPT0gbnVsbCkgJiYgYWN0aW9uLmFjdG9yICE9PSBzZWxlY3RlZCAmJiBhY3Rpb24uY2FuVGFyZ2V0KHNlbGVjdGVkKSkge1xuICAgICAgcmV0dXJuIGFjdGlvbi53aXRoVGFyZ2V0KHNlbGVjdGVkKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYWN0aW9uXG4gICAgfVxuICB9XG5cbiAgY2FuU2VsZWN0IChlbGVtKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlbGVtLmlzU2VsZWN0YWJsZUJ5ID09PSAnZnVuY3Rpb24nICYmIGVsZW0uaXNTZWxlY3RhYmxlQnkodGhpcylcbiAgfVxuXG4gIGNhbkZvY3VzT24gKGVsZW0pIHtcbiAgICBpZiAodHlwZW9mIGVsZW0uSXNGb2N1c2FibGVCeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGVsZW0uSXNGb2N1c2FibGVCeSh0aGlzKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0uSXNTZWxlY3RhYmxlQnkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBlbGVtLklzU2VsZWN0YWJsZUJ5KHRoaXMpXG4gICAgfVxuICB9XG5cbiAgc2VsZWN0QWN0aW9uIChhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgYWN0aW9uLnN0YXJ0KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZWxlY3RlZEFjdGlvbiA9IGFjdGlvblxuICAgIH1cbiAgfVxuXG4gIHNldEFjdGlvblRhcmdldCAoZWxlbSkge1xuICAgIHZhciBhY3Rpb25cbiAgICBhY3Rpb24gPSB0aGlzLnNlbGVjdGVkQWN0aW9uIHx8ICh0aGlzLnNlbGVjdGVkICE9IG51bGwgPyB0aGlzLnNlbGVjdGVkLmRlZmF1bHRBY3Rpb24gOiBudWxsKVxuICAgIGFjdGlvbiA9IGFjdGlvbi53aXRoVGFyZ2V0KGVsZW0pXG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5zdGFydCgpXG4gICAgICB0aGlzLnNlbGVjdGVkQWN0aW9uID0gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGVkQWN0aW9uID0gYWN0aW9uXG4gICAgfVxuICB9XG59O1xuXG5QbGF5ZXIucHJvcGVydGllcyh7XG4gIG5hbWU6IHtcbiAgICBkZWZhdWx0OiAnUGxheWVyJ1xuICB9LFxuICBmb2N1c2VkOiB7fSxcbiAgc2VsZWN0ZWQ6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKG9sZCAhPSBudWxsICYmIG9sZC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsICYmIG9sZC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eSgnc2VsZWN0ZWQnKSkge1xuICAgICAgICBvbGQuc2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKHZhbCAhPSBudWxsICYmIHZhbC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsICYmIHZhbC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eSgnc2VsZWN0ZWQnKSkge1xuICAgICAgICB2YWwuc2VsZWN0ZWQgPSB0aGlzXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBnbG9iYWxBY3Rpb25Qcm92aWRlcnM6IHtcbiAgICBjb2xsZWN0aW9uOiB0cnVlXG4gIH0sXG4gIGFjdGlvblByb3ZpZGVyczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgcmVzLCBzZWxlY3RlZFxuICAgICAgcmVzID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLmdsb2JhbEFjdGlvblByb3ZpZGVyc1Byb3BlcnR5KS50b0FycmF5KClcbiAgICAgIHNlbGVjdGVkID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnNlbGVjdGVkUHJvcGVydHkpXG4gICAgICBpZiAoc2VsZWN0ZWQgJiYgc2VsZWN0ZWQuYWN0aW9uUHJvdmlkZXIpIHtcbiAgICAgICAgcmVzLnB1c2goc2VsZWN0ZWQuYWN0aW9uUHJvdmlkZXIpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9LFxuICBhdmFpbGFibGVBY3Rpb25zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMuYWN0aW9uUHJvdmlkZXJzUHJvcGVydHkpLnJlZHVjZSgocmVzLCBwcm92aWRlcikgPT4ge1xuICAgICAgICB2YXIgYWN0aW9ucywgc2VsZWN0ZWRcbiAgICAgICAgYWN0aW9ucyA9IGludmFsaWRhdG9yLnByb3AocHJvdmlkZXIuYWN0aW9uc1Byb3BlcnR5KS50b0FycmF5KClcbiAgICAgICAgc2VsZWN0ZWQgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMuc2VsZWN0ZWRQcm9wZXJ0eSlcbiAgICAgICAgaWYgKHNlbGVjdGVkICE9IG51bGwpIHtcbiAgICAgICAgICBhY3Rpb25zID0gYWN0aW9ucy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ3Vlc3NBY3Rpb25UYXJnZXQoYWN0aW9uKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLmNvbmNhdChhY3Rpb25zKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXNcbiAgICAgICAgfVxuICAgICAgfSwgW10pXG4gICAgfVxuICB9LFxuICBzZWxlY3RlZEFjdGlvbjoge30sXG4gIGNvbnRyb2xsZXI6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIucGxheWVyID0gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZ2FtZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkKSB7XG4gICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldERlZmF1bHRzKClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJylcblxuY2xhc3MgUHJvamVjdGlsZSBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpXG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGluaXQgKCkge31cblxuICBsYXVuY2ggKCkge1xuICAgIHRoaXMubW92aW5nID0gdHJ1ZVxuICAgIHRoaXMucGF0aFRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuZGVsaXZlclBheWxvYWQoKVxuICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZVxuICAgIH0sIHRoaXMucGF0aExlbmd0aCAvIHRoaXMuc3BlZWQgKiAxMDAwKVxuICB9XG5cbiAgZGVsaXZlclBheWxvYWQgKCkge1xuICAgIGNvbnN0IFByb3BhZ2F0aW9uVHlwZSA9IHRoaXMucHJvcGFnYXRpb25UeXBlXG4gICAgY29uc3QgcGF5bG9hZCA9IG5ldyBQcm9wYWdhdGlvblR5cGUoe1xuICAgICAgdGlsZTogdGhpcy50YXJnZXQudGlsZSB8fCB0aGlzLnRhcmdldCxcbiAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgcmFuZ2U6IHRoaXMuYmxhc3RSYW5nZVxuICAgIH0pXG4gICAgcGF5bG9hZC5hcHBseSgpXG4gICAgdGhpcy5wYXlsb2FkRGVsaXZlcmVkKClcbiAgICByZXR1cm4gcGF5bG9hZFxuICB9XG5cbiAgcGF5bG9hZERlbGl2ZXJlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5kZXN0cm95KClcbiAgfVxufTtcblxuUHJvamVjdGlsZS5wcm9wZXJ0aWVzKHtcbiAgb3JpZ2luOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICB0YXJnZXQ6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgYmxhc3RSYW5nZToge1xuICAgIGRlZmF1bHQ6IDFcbiAgfSxcbiAgcHJvcGFnYXRpb25UeXBlOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBzcGVlZDoge1xuICAgIGRlZmF1bHQ6IDEwXG4gIH0sXG4gIHBhdGhMZW5ndGg6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkaXN0XG4gICAgICBpZiAoKHRoaXMub3JpZ2luVGlsZSAhPSBudWxsKSAmJiAodGhpcy50YXJnZXRUaWxlICE9IG51bGwpKSB7XG4gICAgICAgIGRpc3QgPSB0aGlzLm9yaWdpblRpbGUuZGlzdCh0aGlzLnRhcmdldFRpbGUpXG4gICAgICAgIGlmIChkaXN0KSB7XG4gICAgICAgICAgcmV0dXJuIGRpc3QubGVuZ3RoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAxMDBcbiAgICB9XG4gIH0sXG4gIG9yaWdpblRpbGU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgdmFyIG9yaWdpblxuICAgICAgb3JpZ2luID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLm9yaWdpblByb3BlcnR5KVxuICAgICAgaWYgKG9yaWdpbiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW4udGlsZSB8fCBvcmlnaW5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHRhcmdldFRpbGU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgdmFyIHRhcmdldFxuICAgICAgdGFyZ2V0ID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnRhcmdldFByb3BlcnR5KVxuICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQudGlsZSB8fCB0YXJnZXRcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGNvbnRhaW5lcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdGUpIHtcbiAgICAgIHZhciBvcmlnaW5UaWxlLCB0YXJnZXRUaWxlXG4gICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMub3JpZ2luVGlsZVByb3BlcnR5KVxuICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCh0aGlzLnRhcmdldFRpbGVQcm9wZXJ0eSlcbiAgICAgIGlmIChvcmlnaW5UaWxlLmNvbnRhaW5lciA9PT0gdGFyZ2V0VGlsZS5jb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpblRpbGUuY29udGFpbmVyXG4gICAgICB9IGVsc2UgaWYgKGludmFsaWRhdGUucHJvcCh0aGlzLnByY1BhdGhQcm9wZXJ0eSkgPiAwLjUpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFRpbGUuY29udGFpbmVyXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb3JpZ2luVGlsZS5jb250YWluZXJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHg6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgc3RhcnRQb3NcbiAgICAgIHN0YXJ0UG9zID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMuc3RhcnRQb3NQcm9wZXJ0eSlcbiAgICAgIHJldHVybiAoaW52YWxpZGF0ZS5wcm9wKHRoaXMudGFyZ2V0UG9zUHJvcGVydHkpLnggLSBzdGFydFBvcy54KSAqIGludmFsaWRhdGUucHJvcCh0aGlzLnByY1BhdGhQcm9wZXJ0eSkgKyBzdGFydFBvcy54XG4gICAgfVxuICB9LFxuICB5OiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0ZSkge1xuICAgICAgdmFyIHN0YXJ0UG9zXG4gICAgICBzdGFydFBvcyA9IGludmFsaWRhdGUucHJvcCh0aGlzLnN0YXJ0UG9zUHJvcGVydHkpXG4gICAgICByZXR1cm4gKGludmFsaWRhdGUucHJvcCh0aGlzLnRhcmdldFBvc1Byb3BlcnR5KS55IC0gc3RhcnRQb3MueSkgKiBpbnZhbGlkYXRlLnByb3AodGhpcy5wcmNQYXRoUHJvcGVydHkpICsgc3RhcnRQb3MueVxuICAgIH1cbiAgfSxcbiAgc3RhcnRQb3M6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgY29udGFpbmVyLCBkaXN0LCBvZmZzZXQsIG9yaWdpblRpbGVcbiAgICAgIG9yaWdpblRpbGUgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5vcmlnaW5UaWxlUHJvcGVydHkpXG4gICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5jb250YWluZXJQcm9wZXJ0eSlcbiAgICAgIG9mZnNldCA9IHRoaXMuc3RhcnRPZmZzZXRcbiAgICAgIGlmIChvcmlnaW5UaWxlLmNvbnRhaW5lciAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgIGRpc3QgPSBjb250YWluZXIuZGlzdChvcmlnaW5UaWxlLmNvbnRhaW5lcilcbiAgICAgICAgb2Zmc2V0LnggKz0gZGlzdC54XG4gICAgICAgIG9mZnNldC55ICs9IGRpc3QueVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogb3JpZ2luVGlsZS54ICsgb2Zmc2V0LngsXG4gICAgICAgIHk6IG9yaWdpblRpbGUueSArIG9mZnNldC55XG4gICAgICB9XG4gICAgfSxcbiAgICBvdXRwdXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpXG4gICAgfVxuICB9LFxuICB0YXJnZXRQb3M6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgY29udGFpbmVyLCBkaXN0LCBvZmZzZXQsIHRhcmdldFRpbGVcbiAgICAgIHRhcmdldFRpbGUgPSBpbnZhbGlkYXRlLnByb3AodGhpcy50YXJnZXRUaWxlUHJvcGVydHkpXG4gICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5jb250YWluZXJQcm9wZXJ0eSlcbiAgICAgIG9mZnNldCA9IHRoaXMudGFyZ2V0T2Zmc2V0XG4gICAgICBpZiAodGFyZ2V0VGlsZS5jb250YWluZXIgIT09IGNvbnRhaW5lcikge1xuICAgICAgICBkaXN0ID0gY29udGFpbmVyLmRpc3QodGFyZ2V0VGlsZS5jb250YWluZXIpXG4gICAgICAgIG9mZnNldC54ICs9IGRpc3QueFxuICAgICAgICBvZmZzZXQueSArPSBkaXN0LnlcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRhcmdldFRpbGUueCArIG9mZnNldC54LFxuICAgICAgICB5OiB0YXJnZXRUaWxlLnkgKyBvZmZzZXQueVxuICAgICAgfVxuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfSxcbiAgc3RhcnRPZmZzZXQ6IHtcbiAgICBkZWZhdWx0OiB7XG4gICAgICB4OiAwLjUsXG4gICAgICB5OiAwLjVcbiAgICB9LFxuICAgIG91dHB1dDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbClcbiAgICB9XG4gIH0sXG4gIHRhcmdldE9mZnNldDoge1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHg6IDAuNSxcbiAgICAgIHk6IDAuNVxuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfSxcbiAgcHJjUGF0aDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlZlxuICAgICAgcmV0dXJuICgocmVmID0gdGhpcy5wYXRoVGltZW91dCkgIT0gbnVsbCA/IHJlZi5wcmMgOiBudWxsKSB8fCAwXG4gICAgfVxuICB9LFxuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH0sXG4gIG1vdmluZzoge1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdGlsZVxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5cbmNsYXNzIFJlc3NvdXJjZSBleHRlbmRzIEVsZW1lbnQge1xuICBwYXJ0aWFsQ2hhbmdlIChxdGUpIHtcbiAgICB2YXIgYWNjZXB0YWJsZVxuICAgIGFjY2VwdGFibGUgPSBNYXRoLm1heCh0aGlzLm1pblF0ZSwgTWF0aC5taW4odGhpcy5tYXhRdGUsIHF0ZSkpXG4gICAgdGhpcy5xdGUgPSBhY2NlcHRhYmxlXG4gICAgcmV0dXJuIHF0ZSAtIGFjY2VwdGFibGVcbiAgfVxufTtcblxuUmVzc291cmNlLnByb3BlcnRpZXMoe1xuICB0eXBlOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBxdGU6IHtcbiAgICBkZWZhdWx0OiAwLFxuICAgIGluZ2VzdDogZnVuY3Rpb24gKHF0ZSkge1xuICAgICAgaWYgKHRoaXMubWF4UXRlICE9PSBudWxsICYmIHF0ZSA+IHRoaXMubWF4UXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudCBoYXZlIG1vcmUgdGhhbiAnICsgdGhpcy5tYXhRdGUgKyAnIG9mICcgKyB0aGlzLnR5cGUubmFtZSlcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm1pblF0ZSAhPT0gbnVsbCAmJiBxdGUgPCB0aGlzLm1pblF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgaGF2ZSBsZXNzIHRoYW4gJyArIHRoaXMubWluUXRlICsgJyBvZiAnICsgdGhpcy50eXBlLm5hbWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gcXRlXG4gICAgfVxuICB9LFxuICBtYXhRdGU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIG1pblF0ZToge1xuICAgIGRlZmF1bHQ6IDBcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNzb3VyY2VcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgUmVzc291cmNlID0gcmVxdWlyZSgnLi9SZXNzb3VyY2UnKVxuXG5jbGFzcyBSZXNzb3VyY2VUeXBlIGV4dGVuZHMgRWxlbWVudCB7XG4gIGluaXRSZXNzb3VyY2UgKG9wdCkge1xuICAgIGlmICh0eXBlb2Ygb3B0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgb3B0ID0ge1xuICAgICAgICBxdGU6IG9wdFxuICAgICAgfVxuICAgIH1cbiAgICBvcHQgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHQpXG4gICAgY29uc3QgUmVzc291cmNlQ2xhc3MgPSB0aGlzLnJlc3NvdXJjZUNsYXNzXG4gICAgcmV0dXJuIG5ldyBSZXNzb3VyY2VDbGFzcyhvcHQpXG4gIH1cbn07XG5cblJlc3NvdXJjZVR5cGUucHJvcGVydGllcyh7XG4gIG5hbWU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHJlc3NvdXJjZUNsYXNzOiB7XG4gICAgZGVmYXVsdDogUmVzc291cmNlXG4gIH0sXG4gIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgZGVmYXVsdDoge31cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNzb3VyY2VUeXBlXG4iLCJ2YXIgaW5kZXhPZiA9IFtdLmluZGV4T2ZcbmNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyXG5jb25zdCBUaWxlID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVcbmNvbnN0IERpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb25cbmNvbnN0IERvb3IgPSByZXF1aXJlKCcuL0Rvb3InKVxuXG5jbGFzcyBSb29tR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gIGluaXRUaWxlcyAoKSB7XG4gICAgdGhpcy5maW5hbFRpbGVzID0gbnVsbFxuICAgIHRoaXMucm9vbXMgPSBbXVxuICAgIHRoaXMuZnJlZSA9IHRoaXMudGlsZUNvbnRhaW5lci5hbGxUaWxlcygpLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgdmFyIGRpcmVjdGlvbiwgaywgbGVuLCBuZXh0LCByZWZcbiAgICAgIHJlZiA9IERpcmVjdGlvbi5hbGxcbiAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICBkaXJlY3Rpb24gPSByZWZba11cbiAgICAgICAgbmV4dCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSlcbiAgICAgICAgaWYgKG5leHQgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHRoaXMuaW5pdFRpbGVzKClcbiAgICB3aGlsZSAodGhpcy5zdGVwKCkgfHwgdGhpcy5uZXdSb29tKCkpIHt9XG4gICAgdGhpcy5jcmVhdGVEb29ycygpXG4gICAgdGhpcy5tYWtlRmluYWxUaWxlcygpXG4gIH1cblxuICBmbG9vckZhY3RvcnkgKG9wdCkge1xuICAgIHJldHVybiBuZXcgVGlsZShvcHQueCwgb3B0LnkpXG4gIH1cblxuICBkb29yRmFjdG9yeSAob3B0KSB7XG4gICAgcmV0dXJuIHRoaXMuZmxvb3JGYWN0b3J5KG9wdClcbiAgfVxuXG4gIG1ha2VGaW5hbFRpbGVzICgpIHtcbiAgICB0aGlzLmZpbmFsVGlsZXMgPSB0aGlzLnRpbGVDb250YWluZXIuYWxsVGlsZXMoKS5tYXAoKHRpbGUpID0+IHtcbiAgICAgIHZhciBvcHRcbiAgICAgIGlmICh0aWxlLmZhY3RvcnkgIT0gbnVsbCkge1xuICAgICAgICBvcHQgPSB7XG4gICAgICAgICAgeDogdGlsZS54LFxuICAgICAgICAgIHk6IHRpbGUueVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aWxlLmZhY3RvcnlPcHRpb25zICE9IG51bGwpIHtcbiAgICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKG9wdCwgdGlsZS5mYWN0b3J5T3B0aW9ucylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZS5mYWN0b3J5KG9wdClcbiAgICAgIH1cbiAgICB9KS5maWx0ZXIoKHRpbGUpID0+IHtcbiAgICAgIHJldHVybiB0aWxlICE9IG51bGxcbiAgICB9KVxuICB9XG5cbiAgZ2V0VGlsZXMgKCkge1xuICAgIGlmICh0aGlzLmZpbmFsVGlsZXMgPT0gbnVsbCkge1xuICAgICAgdGhpcy5jYWxjdWwoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5hbFRpbGVzXG4gIH1cblxuICBuZXdSb29tICgpIHtcbiAgICBpZiAodGhpcy5mcmVlLmxlbmd0aCkge1xuICAgICAgdGhpcy52b2x1bWUgPSBNYXRoLmZsb29yKHRoaXMucm5nKCkgKiAodGhpcy5tYXhWb2x1bWUgLSB0aGlzLm1pblZvbHVtZSkpICsgdGhpcy5taW5Wb2x1bWVcbiAgICAgIHRoaXMucm9vbSA9IG5ldyBSb29tR2VuZXJhdG9yLlJvb20oKVxuICAgICAgcmV0dXJuIHRoaXMucm9vbVxuICAgIH1cbiAgfVxuXG4gIHJhbmRvbURpcmVjdGlvbnMgKCkge1xuICAgIHZhciBpLCBqLCBvLCB4XG4gICAgbyA9IERpcmVjdGlvbi5hZGphY2VudHMuc2xpY2UoKVxuICAgIGogPSBudWxsXG4gICAgeCA9IG51bGxcbiAgICBpID0gby5sZW5ndGhcbiAgICB3aGlsZSAoaSkge1xuICAgICAgaiA9IE1hdGguZmxvb3IodGhpcy5ybmcoKSAqIGkpXG4gICAgICB4ID0gb1stLWldXG4gICAgICBvW2ldID0gb1tqXVxuICAgICAgb1tqXSA9IHhcbiAgICB9XG4gICAgcmV0dXJuIG9cbiAgfVxuXG4gIHN0ZXAgKCkge1xuICAgIHZhciBzdWNjZXNzLCB0cmllc1xuICAgIGlmICh0aGlzLnJvb20pIHtcbiAgICAgIGlmICh0aGlzLmZyZWUubGVuZ3RoICYmIHRoaXMucm9vbS50aWxlcy5sZW5ndGggPCB0aGlzLnZvbHVtZSAtIDEpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vbS50aWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB0cmllcyA9IHRoaXMucmFuZG9tRGlyZWN0aW9ucygpXG4gICAgICAgICAgc3VjY2VzcyA9IGZhbHNlXG4gICAgICAgICAgd2hpbGUgKHRyaWVzLmxlbmd0aCAmJiAhc3VjY2Vzcykge1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuZXhwYW5kKHRoaXMucm9vbSwgdHJpZXMucG9wKCksIHRoaXMudm9sdW1lKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMucm9vbURvbmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc3VjY2Vzc1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKHRoaXMucmFuZG9tRnJlZVRpbGUoKSwgdGhpcy5yb29tKVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm9vbURvbmUoKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByb29tRG9uZSAoKSB7XG4gICAgdGhpcy5yb29tcy5wdXNoKHRoaXMucm9vbSlcbiAgICB0aGlzLmFsbG9jYXRlV2FsbHModGhpcy5yb29tKVxuICAgIHRoaXMucm9vbSA9IG51bGxcbiAgfVxuXG4gIGV4cGFuZCAocm9vbSwgZGlyZWN0aW9uLCBtYXggPSAwKSB7XG4gICAgdmFyIGssIGxlbiwgbmV4dCwgcmVmLCBzZWNvbmQsIHN1Y2Nlc3MsIHRpbGVcbiAgICBzdWNjZXNzID0gZmFsc2VcbiAgICByZWYgPSByb29tLnRpbGVzXG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICB0aWxlID0gcmVmW2tdXG4gICAgICBpZiAobWF4ID09PSAwIHx8IHJvb20udGlsZXMubGVuZ3RoIDwgbWF4KSB7XG4gICAgICAgIG5leHQgPSB0aGlzLnRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uKVxuICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKG5leHQsIHJvb20pXG4gICAgICAgICAgc3VjY2VzcyA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHNlY29uZCA9IHRoaXMudGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24sIDIpKSAmJiAhdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgMykpIHtcbiAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZShzZWNvbmQsIHJvb20pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3NcbiAgfVxuXG4gIGFsbG9jYXRlV2FsbHMgKHJvb20pIHtcbiAgICB2YXIgZGlyZWN0aW9uLCBrLCBsZW4sIG5leHQsIG5leHRSb29tLCBvdGhlclNpZGUsIHJlZiwgcmVzdWx0cywgdGlsZVxuICAgIHJlZiA9IHJvb20udGlsZXNcbiAgICByZXN1bHRzID0gW11cbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHRpbGUgPSByZWZba11cbiAgICAgIHJlc3VsdHMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMVxuICAgICAgICByZWYxID0gRGlyZWN0aW9uLmFsbFxuICAgICAgICByZXN1bHRzMSA9IFtdXG4gICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgIGRpcmVjdGlvbiA9IHJlZjFbbF1cbiAgICAgICAgICBuZXh0ID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUodGlsZS54ICsgZGlyZWN0aW9uLngsIHRpbGUueSArIGRpcmVjdGlvbi55KVxuICAgICAgICAgIGlmICgobmV4dCAhPSBudWxsKSAmJiBuZXh0LnJvb20gIT09IHJvb20pIHtcbiAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwoRGlyZWN0aW9uLmNvcm5lcnMsIGRpcmVjdGlvbikgPCAwKSB7XG4gICAgICAgICAgICAgIG90aGVyU2lkZSA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54ICogMiwgdGlsZS55ICsgZGlyZWN0aW9uLnkgKiAyKVxuICAgICAgICAgICAgICBuZXh0Um9vbSA9IChvdGhlclNpZGUgIT0gbnVsbCA/IG90aGVyU2lkZS5yb29tIDogbnVsbCkgIT0gbnVsbCA/IG90aGVyU2lkZS5yb29tIDogbnVsbFxuICAgICAgICAgICAgICByb29tLmFkZFdhbGwobmV4dCwgbmV4dFJvb20pXG4gICAgICAgICAgICAgIGlmIChuZXh0Um9vbSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV4dFJvb20uYWRkV2FsbChuZXh0LCByb29tKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy53YWxsRmFjdG9yeSkge1xuICAgICAgICAgICAgICBuZXh0LmZhY3RvcnkgPSAob3B0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2FsbEZhY3Rvcnkob3B0KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG5leHQuZmFjdG9yeS5iYXNlID0gdGhpcy53YWxsRmFjdG9yeVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0czEucHVzaCh0aGlzLmFsbG9jYXRlVGlsZShuZXh0KSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChudWxsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0czFcbiAgICAgIH0uY2FsbCh0aGlzKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuXG4gIGNyZWF0ZURvb3JzICgpIHtcbiAgICB2YXIgYWRqYWNlbnQsIGRvb3IsIGssIGxlbiwgcmVmLCByZXN1bHRzLCByb29tLCB3YWxsc1xuICAgIHJlZiA9IHRoaXMucm9vbXNcbiAgICByZXN1bHRzID0gW11cbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHJvb20gPSByZWZba11cbiAgICAgIHJlc3VsdHMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMVxuICAgICAgICByZWYxID0gcm9vbS53YWxsc0J5Um9vbXMoKVxuICAgICAgICByZXN1bHRzMSA9IFtdXG4gICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgIHdhbGxzID0gcmVmMVtsXVxuICAgICAgICAgIGlmICgod2FsbHMucm9vbSAhPSBudWxsKSAmJiByb29tLmRvb3JzRm9yUm9vbSh3YWxscy5yb29tKSA8IDEpIHtcbiAgICAgICAgICAgIGRvb3IgPSB3YWxscy50aWxlc1tNYXRoLmZsb29yKHRoaXMucm5nKCkgKiB3YWxscy50aWxlcy5sZW5ndGgpXVxuICAgICAgICAgICAgZG9vci5mYWN0b3J5ID0gKG9wdCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kb29yRmFjdG9yeShvcHQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb29yLmZhY3RvcnkuYmFzZSA9IHRoaXMuZG9vckZhY3RvcnlcbiAgICAgICAgICAgIGFkamFjZW50ID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUoZG9vci54ICsgMSwgZG9vci55KVxuICAgICAgICAgICAgZG9vci5mYWN0b3J5T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgZGlyZWN0aW9uOiBhZGphY2VudC5mYWN0b3J5ICYmIGFkamFjZW50LmZhY3RvcnkuYmFzZSA9PT0gdGhpcy5mbG9vckZhY3RvcnkgPyBEb29yLmRpcmVjdGlvbnMudmVydGljYWwgOiBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcm9vbS5hZGREb29yKGRvb3IsIHdhbGxzLnJvb20pXG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKHdhbGxzLnJvb20uYWRkRG9vcihkb29yLCByb29tKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChudWxsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0czFcbiAgICAgIH0uY2FsbCh0aGlzKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuXG4gIGFsbG9jYXRlVGlsZSAodGlsZSwgcm9vbSA9IG51bGwpIHtcbiAgICB2YXIgaW5kZXhcbiAgICBpZiAocm9vbSAhPSBudWxsKSB7XG4gICAgICByb29tLmFkZFRpbGUodGlsZSlcbiAgICAgIHRpbGUuZmFjdG9yeSA9IChvcHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvb3JGYWN0b3J5KG9wdClcbiAgICAgIH1cbiAgICAgIHRpbGUuZmFjdG9yeS5iYXNlID0gdGhpcy5mbG9vckZhY3RvcnlcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLmZyZWUuaW5kZXhPZih0aWxlKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5mcmVlLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICB0aWxlT2Zmc2V0SXNGcmVlICh0aWxlLCBkaXJlY3Rpb24sIG11bHRpcGx5ID0gMSkge1xuICAgIHJldHVybiB0aGlzLnRpbGVJc0ZyZWUodGlsZS54ICsgZGlyZWN0aW9uLnggKiBtdWx0aXBseSwgdGlsZS55ICsgZGlyZWN0aW9uLnkgKiBtdWx0aXBseSlcbiAgfVxuXG4gIHRpbGVJc0ZyZWUgKHgsIHkpIHtcbiAgICB2YXIgdGlsZVxuICAgIHRpbGUgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh4LCB5KVxuICAgIGlmICgodGlsZSAhPSBudWxsKSAmJiBpbmRleE9mLmNhbGwodGhpcy5mcmVlLCB0aWxlKSA+PSAwKSB7XG4gICAgICByZXR1cm4gdGlsZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICByYW5kb21GcmVlVGlsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJlZVtNYXRoLmZsb29yKHRoaXMucm5nKCkgKiB0aGlzLmZyZWUubGVuZ3RoKV1cbiAgfVxufTtcblxuUm9vbUdlbmVyYXRvci5wcm9wZXJ0aWVzKHtcbiAgcm5nOiB7XG4gICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgfSxcbiAgbWF4Vm9sdW1lOiB7XG4gICAgZGVmYXVsdDogMjVcbiAgfSxcbiAgbWluVm9sdW1lOiB7XG4gICAgZGVmYXVsdDogNTBcbiAgfSxcbiAgd2lkdGg6IHtcbiAgICBkZWZhdWx0OiAzMFxuICB9LFxuICBoZWlnaHQ6IHtcbiAgICBkZWZhdWx0OiAxNVxuICB9LFxuICB0aWxlQ29udGFpbmVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCB0aWxlcyA9IG5ldyBUaWxlQ29udGFpbmVyKClcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgIHRpbGVzLmFkZFRpbGUobmV3IFRpbGUoeCwgeSkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aWxlc1xuICAgIH1cbiAgfVxufSlcblxuUm9vbUdlbmVyYXRvci5Sb29tID0gY2xhc3MgUm9vbSB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLnRpbGVzID0gW11cbiAgICB0aGlzLndhbGxzID0gW11cbiAgICB0aGlzLmRvb3JzID0gW11cbiAgfVxuXG4gIGFkZFRpbGUgKHRpbGUpIHtcbiAgICB0aGlzLnRpbGVzLnB1c2godGlsZSlcbiAgICB0aWxlLnJvb20gPSB0aGlzXG4gIH1cblxuICBjb250YWluc1dhbGwgKHRpbGUpIHtcbiAgICB2YXIgaywgbGVuLCByZWYsIHdhbGxcbiAgICByZWYgPSB0aGlzLndhbGxzXG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICB3YWxsID0gcmVmW2tdXG4gICAgICBpZiAod2FsbC50aWxlID09PSB0aWxlKSB7XG4gICAgICAgIHJldHVybiB3YWxsXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgYWRkV2FsbCAodGlsZSwgbmV4dFJvb20pIHtcbiAgICB2YXIgZXhpc3RpbmdcbiAgICBleGlzdGluZyA9IHRoaXMuY29udGFpbnNXYWxsKHRpbGUpXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBleGlzdGluZy5uZXh0Um9vbSA9IG5leHRSb29tXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMud2FsbHMucHVzaCh7XG4gICAgICAgIHRpbGU6IHRpbGUsXG4gICAgICAgIG5leHRSb29tOiBuZXh0Um9vbVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICB3YWxsc0J5Um9vbXMgKCkge1xuICAgIHZhciBrLCBsZW4sIHBvcywgcmVmLCByZXMsIHJvb21zLCB3YWxsXG4gICAgcm9vbXMgPSBbXVxuICAgIHJlcyA9IFtdXG4gICAgcmVmID0gdGhpcy53YWxsc1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgd2FsbCA9IHJlZltrXVxuICAgICAgcG9zID0gcm9vbXMuaW5kZXhPZih3YWxsLm5leHRSb29tKVxuICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgcG9zID0gcm9vbXMubGVuZ3RoXG4gICAgICAgIHJvb21zLnB1c2god2FsbC5uZXh0Um9vbSlcbiAgICAgICAgcmVzLnB1c2goe1xuICAgICAgICAgIHJvb206IHdhbGwubmV4dFJvb20sXG4gICAgICAgICAgdGlsZXM6IFtdXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXNbcG9zXS50aWxlcy5wdXNoKHdhbGwudGlsZSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgYWRkRG9vciAodGlsZSwgbmV4dFJvb20pIHtcbiAgICByZXR1cm4gdGhpcy5kb29ycy5wdXNoKHtcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICBuZXh0Um9vbTogbmV4dFJvb21cbiAgICB9KVxuICB9XG5cbiAgZG9vcnNGb3JSb29tIChyb29tKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9vcnNcbiAgICAgIC5maWx0ZXIoKGRvb3IpID0+IGRvb3IubmV4dFJvb20gPT09IHJvb20pXG4gICAgICAubWFwKChkb29yKSA9PiBkb29yLnRpbGUpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSb29tR2VuZXJhdG9yXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFRyYXZlbCA9IHJlcXVpcmUoJy4vVHJhdmVsJylcbmNvbnN0IFRyYXZlbEFjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9UcmF2ZWxBY3Rpb24nKVxuY29uc3QgQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXInKVxuY29uc3QgU2hpcEludGVyaW9yID0gcmVxdWlyZSgnLi9TaGlwSW50ZXJpb3InKVxuXG5jbGFzcyBTaGlwIGV4dGVuZHMgRWxlbWVudCB7XG4gIHRyYXZlbFRvIChsb2NhdGlvbikge1xuICAgIHZhciB0cmF2ZWxcbiAgICB0cmF2ZWwgPSBuZXcgVHJhdmVsKHtcbiAgICAgIHRyYXZlbGxlcjogdGhpcyxcbiAgICAgIHN0YXJ0TG9jYXRpb246IHRoaXMubG9jYXRpb24sXG4gICAgICB0YXJnZXRMb2NhdGlvbjogbG9jYXRpb25cbiAgICB9KVxuICAgIGlmICh0cmF2ZWwudmFsaWQpIHtcbiAgICAgIHRyYXZlbC5zdGFydCgpXG4gICAgICB0aGlzLnRyYXZlbCA9IHRyYXZlbFxuICAgIH1cbiAgfVxufTtcblxuU2hpcC5wcm9wZXJ0aWVzKHtcbiAgbG9jYXRpb246IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHRyYXZlbDoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgaW50ZXJyaW9yOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFNoaXBJbnRlcmlvcih7IHNoaXA6IHRoaXMgfSlcbiAgICB9XG4gIH0sXG4gIGFjdGlvblByb3ZpZGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBwcm92aWRlciA9IG5ldyBBY3Rpb25Qcm92aWRlcih7XG4gICAgICAgIG93bmVyOiB0aGlzXG4gICAgICB9KVxuICAgICAgcHJvdmlkZXIuYWN0aW9uc01lbWJlcnMuYWRkKG5ldyBUcmF2ZWxBY3Rpb24oe1xuICAgICAgICBhY3RvcjogdGhpc1xuICAgICAgfSkpXG4gICAgICByZXR1cm4gcHJvdmlkZXJcbiAgICB9XG4gIH0sXG4gIHNwYWNlQ29vZGluYXRlOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIGlmIChpbnZhbGlkYXRvci5wcm9wKHRoaXMudHJhdmVsUHJvcGVydHkpKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wUGF0aCgndHJhdmVsLnNwYWNlQ29vZGluYXRlJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogaW52YWxpZGF0b3IucHJvcFBhdGgoJ2xvY2F0aW9uLngnKSxcbiAgICAgICAgICB5OiBpbnZhbGlkYXRvci5wcm9wUGF0aCgnbG9jYXRpb24ueScpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFxuIiwiY29uc3QgVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlXG5jb25zdCBUaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXJcbmNvbnN0IERlZmF1bHRHZW5lcmF0b3IgPSByZXF1aXJlKCcuL1Jvb21HZW5lcmF0b3InKVxuY29uc3QgRmxvb3IgPSByZXF1aXJlKCcuL0Zsb29yJylcbmNvbnN0IERvb3IgPSByZXF1aXJlKCcuL0F1dG9tYXRpY0Rvb3InKVxuXG5jbGFzcyBTaGlwSW50ZXJpb3IgZXh0ZW5kcyBUaWxlQ29udGFpbmVyIHtcbiAgc2V0RGVmYXVsdHMgKCkge1xuICAgIGlmICghKHRoaXMudGlsZXMubGVuZ3RoID4gMCkpIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGUoKVxuICAgIH1cbiAgICBpZiAodGhpcy5nYW1lLm1haW5UaWxlQ29udGFpbmVyID09IG51bGwpIHtcbiAgICAgIHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lciA9IHRoaXNcbiAgICB9XG4gIH1cblxuICBnZW5lcmF0ZSAoZ2VuZXJhdG9yKSB7XG4gICAgZ2VuZXJhdG9yID0gZ2VuZXJhdG9yIHx8IChuZXcgU2hpcEludGVyaW9yLkdlbmVyYXRvcigpKS50YXAoZnVuY3Rpb24gKCkge30pXG4gICAgZ2VuZXJhdG9yLmdldFRpbGVzKCkuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgdGhpcy5hZGRUaWxlKHRpbGUpXG4gICAgfSlcbiAgfVxufVxuXG5TaGlwSW50ZXJpb3IucHJvcGVydGllcyh7XG4gIGNvbnRhaW5lcjoge30sXG4gIHNoaXA6IHt9LFxuICBnYW1lOiB7XG4gICAgY2hhbmdlOiBmdW5jdGlvbiAodmFsLCBvbGQpIHtcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGVmYXVsdHMoKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYWlybG9ja3M6IHtcbiAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hbGxUaWxlcygpLmZpbHRlcigodCkgPT4gdHlwZW9mIHQuYXR0YWNoVG8gPT09ICdmdW5jdGlvbicpXG4gICAgfVxuICB9XG59KVxuXG5TaGlwSW50ZXJpb3IuR2VuZXJhdG9yID0gY2xhc3MgR2VuZXJhdG9yIGV4dGVuZHMgRGVmYXVsdEdlbmVyYXRvciB7XG4gIHdhbGxGYWN0b3J5IChvcHQpIHtcbiAgICByZXR1cm4gKG5ldyBUaWxlKG9wdC54LCBvcHQueSkpLnRhcChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLndhbGthYmxlID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgZmxvb3JGYWN0b3J5IChvcHQpIHtcbiAgICByZXR1cm4gbmV3IEZsb29yKG9wdC54LCBvcHQueSlcbiAgfVxuXG4gIGRvb3JGYWN0b3J5IChvcHQpIHtcbiAgICByZXR1cm4gKG5ldyBGbG9vcihvcHQueCwgb3B0LnkpKS50YXAoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGRDaGlsZChuZXcgRG9vcih7XG4gICAgICAgIGRpcmVjdGlvbjogb3B0LmRpcmVjdGlvblxuICAgICAgfSkpXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXBJbnRlcmlvclxuIiwiY29uc3QgVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWRcbmNvbnN0IFRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJylcbmNvbnN0IERhbWFnZWFibGUgPSByZXF1aXJlKCcuL0RhbWFnZWFibGUnKVxuY29uc3QgUHJvamVjdGlsZSA9IHJlcXVpcmUoJy4vUHJvamVjdGlsZScpXG5cbmNsYXNzIFNoaXBXZWFwb24gZXh0ZW5kcyBUaWxlZCB7XG4gIGZpcmUgKCkge1xuICAgIHZhciBwcm9qZWN0aWxlXG4gICAgaWYgKHRoaXMuY2FuRmlyZSkge1xuICAgICAgY29uc3QgUHJvamVjdGlsZUNsYXNzID0gdGhpcy5wcm9qZWN0aWxlQ2xhc3NcbiAgICAgIHByb2plY3RpbGUgPSBuZXcgUHJvamVjdGlsZUNsYXNzKHtcbiAgICAgICAgb3JpZ2luOiB0aGlzLFxuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgYmxhc3RSYW5nZTogdGhpcy5ibGFzdFJhbmdlLFxuICAgICAgICBwcm9wYWdhdGlvblR5cGU6IHRoaXMucHJvcGFnYXRpb25UeXBlLFxuICAgICAgICBzcGVlZDogdGhpcy5wcm9qZWN0aWxlU3BlZWQsXG4gICAgICAgIHRpbWluZzogdGhpcy50aW1pbmdcbiAgICAgIH0pXG4gICAgICBwcm9qZWN0aWxlLmxhdW5jaCgpXG4gICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZVxuICAgICAgdGhpcy5yZWNoYXJnZSgpXG4gICAgICByZXR1cm4gcHJvamVjdGlsZVxuICAgIH1cbiAgfVxuXG4gIHJlY2hhcmdlICgpIHtcbiAgICB0aGlzLmNoYXJnaW5nID0gdHJ1ZVxuICAgIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5jaGFyZ2luZyA9IGZhbHNlXG4gICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZWQoKVxuICAgIH0sIHRoaXMucmVjaGFyZ2VUaW1lKVxuICB9XG5cbiAgcmVjaGFyZ2VkICgpIHtcbiAgICB0aGlzLmNoYXJnZWQgPSB0cnVlXG4gICAgaWYgKHRoaXMuYXV0b0ZpcmUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpcmUoKVxuICAgIH1cbiAgfVxufTtcblxuU2hpcFdlYXBvbi5leHRlbmQoRGFtYWdlYWJsZSlcblxuU2hpcFdlYXBvbi5wcm9wZXJ0aWVzKHtcbiAgcmVjaGFyZ2VUaW1lOiB7XG4gICAgZGVmYXVsdDogMTAwMFxuICB9LFxuICBwb3dlcjoge1xuICAgIGRlZmF1bHQ6IDEwXG4gIH0sXG4gIGJsYXN0UmFuZ2U6IHtcbiAgICBkZWZhdWx0OiAxXG4gIH0sXG4gIHByb3BhZ2F0aW9uVHlwZToge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgcHJvamVjdGlsZVNwZWVkOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgdGFyZ2V0OiB7XG4gICAgZGVmYXVsdDogbnVsbCxcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmF1dG9GaXJlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpcmUoKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY2hhcmdlZDoge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgY2hhcmdpbmc6IHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG4gIGVuYWJsZWQ6IHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG4gIGF1dG9GaXJlOiB7XG4gICAgZGVmYXVsdDogdHJ1ZVxuICB9LFxuICBjcml0aWNhbEhlYWx0aDoge1xuICAgIGRlZmF1bHQ6IDAuM1xuICB9LFxuICBjYW5GaXJlOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQgJiYgdGhpcy5lbmFibGVkICYmIHRoaXMuY2hhcmdlZCAmJiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoID49IHRoaXMuY3JpdGljYWxIZWFsdGhcbiAgICB9XG4gIH0sXG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKVxuICAgIH1cbiAgfSxcbiAgcHJvamVjdGlsZUNsYXNzOiB7XG4gICAgZGVmYXVsdDogUHJvamVjdGlsZVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXBXZWFwb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgTWFwID0gcmVxdWlyZSgnLi9NYXAnKVxuY29uc3QgU3RhclN5c3RlbSA9IHJlcXVpcmUoJy4vU3RhclN5c3RlbScpXG5jb25zdCBzdGFyTmFtZXMgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXN0cmluZ3MnKS5zdGFyTmFtZXNcblxuY2xhc3MgU3Rhck1hcEdlbmVyYXRvciBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm9wdCA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmT3B0LCBvcHRpb25zKVxuICB9XG5cbiAgZ2VuZXJhdGUgKCkge1xuICAgIGNvbnN0IE1hcENsYXNzID0gdGhpcy5vcHQubWFwQ2xhc3NcbiAgICB0aGlzLm1hcCA9IG5ldyBNYXBDbGFzcygpXG4gICAgdGhpcy5zdGFycyA9IHRoaXMubWFwLmxvY2F0aW9ucy5jb3B5KClcbiAgICB0aGlzLmxpbmtzID0gW11cbiAgICB0aGlzLmNyZWF0ZVN0YXJzKHRoaXMub3B0Lm5iU3RhcnMpXG4gICAgdGhpcy5tYWtlTGlua3MoKVxuICAgIHJldHVybiB0aGlzLm1hcFxuICB9XG5cbiAgY3JlYXRlU3RhcnMgKG5iKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oQXJyYXkobmIpLCAoKSA9PiB0aGlzLmNyZWF0ZVN0YXIoKSlcbiAgfVxuXG4gIGNyZWF0ZVN0YXIgKG9wdCA9IHt9KSB7XG4gICAgdmFyIG5hbWUsIHBvcywgc3RhclxuICAgIGlmICghKG9wdC54ICYmIG9wdC55KSkge1xuICAgICAgcG9zID0gdGhpcy5yYW5kb21TdGFyUG9zKClcbiAgICAgIGlmIChwb3MgIT0gbnVsbCkge1xuICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKHt9LCBvcHQsIHtcbiAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICB5OiBwb3MueVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvcHQubmFtZSkge1xuICAgICAgbmFtZSA9IHRoaXMucmFuZG9tU3Rhck5hbWUoKVxuICAgICAgaWYgKG5hbWUgIT0gbnVsbCkge1xuICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKHt9LCBvcHQsIHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBTdGFyQ2xhc3MgPSB0aGlzLm9wdC5zdGFyQ2xhc3NcbiAgICBzdGFyID0gbmV3IFN0YXJDbGFzcyhvcHQpXG4gICAgdGhpcy5tYXAubG9jYXRpb25zLnB1c2goc3RhcilcbiAgICB0aGlzLnN0YXJzLnB1c2goc3RhcilcbiAgICByZXR1cm4gc3RhclxuICB9XG5cbiAgcmFuZG9tU3RhclBvcyAoKSB7XG4gICAgdmFyIGosIHBvc1xuICAgIGogPSAwXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHBvcyA9IHtcbiAgICAgICAgeDogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhYIC0gdGhpcy5vcHQubWluWCkgKyB0aGlzLm9wdC5taW5YKSxcbiAgICAgICAgeTogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhZIC0gdGhpcy5vcHQubWluWSkgKyB0aGlzLm9wdC5taW5ZKVxuICAgICAgfVxuICAgICAgaWYgKCEoaiA8IDEwICYmIHRoaXMuc3RhcnMuZmluZCgoc3RhcikgPT4ge1xuICAgICAgICByZXR1cm4gc3Rhci5kaXN0KHBvcy54LCBwb3MueSkgPD0gdGhpcy5vcHQubWluU3RhckRpc3RcbiAgICAgIH0pKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaisrXG4gICAgfVxuICAgIGlmICghKGogPj0gMTApKSB7XG4gICAgICByZXR1cm4gcG9zXG4gICAgfVxuICB9XG5cbiAgcmFuZG9tU3Rhck5hbWUgKCkge1xuICAgIHZhciBuYW1lLCBwb3MsIHJlZlxuICAgIGlmICgocmVmID0gdGhpcy5vcHQuc3Rhck5hbWVzKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IG51bGwpIHtcbiAgICAgIHBvcyA9IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiB0aGlzLm9wdC5zdGFyTmFtZXMubGVuZ3RoKVxuICAgICAgbmFtZSA9IHRoaXMub3B0LnN0YXJOYW1lc1twb3NdXG4gICAgICB0aGlzLm9wdC5zdGFyTmFtZXMuc3BsaWNlKHBvcywgMSlcbiAgICAgIHJldHVybiBuYW1lXG4gICAgfVxuICB9XG5cbiAgbWFrZUxpbmtzICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFycy5mb3JFYWNoKChzdGFyKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5tYWtlTGlua3NGcm9tKHN0YXIpXG4gICAgfSlcbiAgfVxuXG4gIG1ha2VMaW5rc0Zyb20gKHN0YXIpIHtcbiAgICB2YXIgY2xvc2UsIGNsb3Nlc3RzLCBsaW5rLCBuZWVkZWQsIHJlc3VsdHMsIHRyaWVzXG4gICAgdHJpZXMgPSB0aGlzLm9wdC5saW5rVHJpZXNcbiAgICBuZWVkZWQgPSB0aGlzLm9wdC5saW5rc0J5U3RhcnMgLSBzdGFyLmxpbmtzLmNvdW50KClcbiAgICBpZiAobmVlZGVkID4gMCkge1xuICAgICAgY2xvc2VzdHMgPSB0aGlzLnN0YXJzLmZpbHRlcigoc3RhcjIpID0+IHtcbiAgICAgICAgcmV0dXJuIHN0YXIyICE9PSBzdGFyICYmICFzdGFyLmxpbmtzLmZpbmRTdGFyKHN0YXIyKVxuICAgICAgfSkuY2xvc2VzdHMoc3Rhci54LCBzdGFyLnkpXG4gICAgICBpZiAoY2xvc2VzdHMuY291bnQoKSA+IDApIHtcbiAgICAgICAgcmVzdWx0cyA9IFtdXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY2xvc2UgPSBjbG9zZXN0cy5zaGlmdCgpXG4gICAgICAgICAgbGluayA9IHRoaXMuY3JlYXRlTGluayhzdGFyLCBjbG9zZSlcbiAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZUxpbmsobGluaykpIHtcbiAgICAgICAgICAgIHRoaXMubGlua3MucHVzaChsaW5rKVxuICAgICAgICAgICAgc3Rhci5hZGRMaW5rKGxpbmspXG4gICAgICAgICAgICBuZWVkZWQgLT0gMVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmllcyAtPSAxXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghKG5lZWRlZCA+IDAgJiYgdHJpZXMgPiAwICYmIGNsb3Nlc3RzLmNvdW50KCkgPiAwKSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG51bGwpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlTGluayAoc3RhcjEsIHN0YXIyKSB7XG4gICAgY29uc3QgTGlua0NsYXNzID0gdGhpcy5vcHQubGlua0NsYXNzXG4gICAgcmV0dXJuIG5ldyBMaW5rQ2xhc3Moc3RhcjEsIHN0YXIyKVxuICB9XG5cbiAgdmFsaWRhdGVMaW5rIChsaW5rKSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YXJzLmZpbmQoKHN0YXIpID0+IHtcbiAgICAgIHJldHVybiBzdGFyICE9PSBsaW5rLnN0YXIxICYmIHN0YXIgIT09IGxpbmsuc3RhcjIgJiYgbGluay5jbG9zZVRvUG9pbnQoc3Rhci54LCBzdGFyLnksIHRoaXMub3B0Lm1pbkxpbmtEaXN0KVxuICAgIH0pICYmICF0aGlzLmxpbmtzLmZpbmQoKGxpbmsyKSA9PiB7XG4gICAgICByZXR1cm4gbGluazIuaW50ZXJzZWN0TGluayhsaW5rKVxuICAgIH0pXG4gIH1cbn07XG5cblN0YXJNYXBHZW5lcmF0b3IucHJvdG90eXBlLmRlZk9wdCA9IHtcbiAgbmJTdGFyczogMjAsXG4gIG1pblg6IDAsXG4gIG1heFg6IDUwMCxcbiAgbWluWTogMCxcbiAgbWF4WTogNTAwLFxuICBtaW5TdGFyRGlzdDogMjAsXG4gIG1pbkxpbmtEaXN0OiAyMCxcbiAgbGlua3NCeVN0YXJzOiAzLFxuICBsaW5rVHJpZXM6IDMsXG4gIG1hcENsYXNzOiBNYXAsXG4gIHN0YXJDbGFzczogU3RhclN5c3RlbSxcbiAgbGlua0NsYXNzOiBTdGFyU3lzdGVtLkxpbmssXG4gIHJuZzogTWF0aC5yYW5kb20sXG4gIHN0YXJOYW1lczogc3Rhck5hbWVzXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3Rhck1hcEdlbmVyYXRvclxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5cbmNsYXNzIFN0YXJTeXN0ZW0gZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IgKGRhdGEpIHtcbiAgICBzdXBlcihkYXRhKVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBpbml0ICgpIHt9XG5cbiAgbGlua1RvIChzdGFyKSB7XG4gICAgaWYgKCF0aGlzLmxpbmtzLmZpbmRTdGFyKHN0YXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRMaW5rKG5ldyB0aGlzLmNvbnN0cnVjdG9yLkxpbmsodGhpcywgc3RhcikpXG4gICAgfVxuICB9XG5cbiAgYWRkTGluayAobGluaykge1xuICAgIHRoaXMubGlua3MuYWRkKGxpbmspXG4gICAgbGluay5vdGhlclN0YXIodGhpcykubGlua3MuYWRkKGxpbmspXG4gICAgcmV0dXJuIGxpbmtcbiAgfVxuXG4gIGRpc3QgKHgsIHkpIHtcbiAgICB2YXIgeERpc3QsIHlEaXN0XG4gICAgeERpc3QgPSB0aGlzLnggLSB4XG4gICAgeURpc3QgPSB0aGlzLnkgLSB5XG4gICAgcmV0dXJuIE1hdGguc3FydCgoeERpc3QgKiB4RGlzdCkgKyAoeURpc3QgKiB5RGlzdCkpXG4gIH1cblxuICBpc1NlbGVjdGFibGVCeSAocGxheWVyKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufTtcblxuU3RhclN5c3RlbS5wcm9wZXJ0aWVzKHtcbiAgeDoge30sXG4gIHk6IHt9LFxuICBuYW1lOiB7fSxcbiAgbGlua3M6IHtcbiAgICBjb2xsZWN0aW9uOiB7XG4gICAgICBmaW5kU3RhcjogZnVuY3Rpb24gKHN0YXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZChmdW5jdGlvbiAobGluaykge1xuICAgICAgICAgIHJldHVybiBsaW5rLnN0YXIyID09PSBzdGFyIHx8IGxpbmsuc3RhcjEgPT09IHN0YXJcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cblN0YXJTeXN0ZW0uY29sbGVuY3Rpb25GbiA9IHtcbiAgY2xvc2VzdDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB2YXIgbWluLCBtaW5EaXN0XG4gICAgbWluID0gbnVsbFxuICAgIG1pbkRpc3QgPSBudWxsXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGFyKSB7XG4gICAgICB2YXIgZGlzdFxuICAgICAgZGlzdCA9IHN0YXIuZGlzdCh4LCB5KVxuICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgbWluID0gc3RhclxuICAgICAgICBtaW5EaXN0ID0gZGlzdFxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG1pblxuICB9LFxuICBjbG9zZXN0czogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB2YXIgZGlzdHNcbiAgICBkaXN0cyA9IHRoaXMubWFwKGZ1bmN0aW9uIChzdGFyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXN0OiBzdGFyLmRpc3QoeCwgeSksXG4gICAgICAgIHN0YXI6IHN0YXJcbiAgICAgIH1cbiAgICB9KVxuICAgIGRpc3RzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3RcbiAgICB9KVxuICAgIHJldHVybiB0aGlzLmNvcHkoZGlzdHMubWFwKGZ1bmN0aW9uIChkaXN0KSB7XG4gICAgICByZXR1cm4gZGlzdC5zdGFyXG4gICAgfSkpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyU3lzdGVtXG5cblN0YXJTeXN0ZW0uTGluayA9IGNsYXNzIExpbmsgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IgKHN0YXIxLCBzdGFyMikge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnN0YXIxID0gc3RhcjFcbiAgICB0aGlzLnN0YXIyID0gc3RhcjJcbiAgfVxuXG4gIHJlbW92ZSAoKSB7XG4gICAgdGhpcy5zdGFyMS5saW5rcy5yZW1vdmUodGhpcylcbiAgICByZXR1cm4gdGhpcy5zdGFyMi5saW5rcy5yZW1vdmUodGhpcylcbiAgfVxuXG4gIG90aGVyU3RhciAoc3Rhcikge1xuICAgIGlmIChzdGFyID09PSB0aGlzLnN0YXIxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFyMlxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFyMVxuICAgIH1cbiAgfVxuXG4gIGdldExlbmd0aCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcjEuZGlzdCh0aGlzLnN0YXIyLngsIHRoaXMuc3RhcjIueSlcbiAgfVxuXG4gIGluQm91bmRhcnlCb3ggKHgsIHksIHBhZGRpbmcgPSAwKSB7XG4gICAgdmFyIHgxLCB4MiwgeTEsIHkyXG4gICAgeDEgPSBNYXRoLm1pbih0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgLSBwYWRkaW5nXG4gICAgeTEgPSBNYXRoLm1pbih0aGlzLnN0YXIxLnksIHRoaXMuc3RhcjIueSkgLSBwYWRkaW5nXG4gICAgeDIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgKyBwYWRkaW5nXG4gICAgeTIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLnksIHRoaXMuc3RhcjIueSkgKyBwYWRkaW5nXG4gICAgcmV0dXJuIHggPj0geDEgJiYgeCA8PSB4MiAmJiB5ID49IHkxICYmIHkgPD0geTJcbiAgfVxuXG4gIGNsb3NlVG9Qb2ludCAoeCwgeSwgbWluRGlzdCkge1xuICAgIHZhciBhLCBhYmNBbmdsZSwgYWJ4QW5nbGUsIGFjRGlzdCwgYWN4QW5nbGUsIGIsIGMsIGNkRGlzdCwgeEFiRGlzdCwgeEFjRGlzdCwgeUFiRGlzdCwgeUFjRGlzdFxuICAgIGlmICghdGhpcy5pbkJvdW5kYXJ5Qm94KHgsIHksIG1pbkRpc3QpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgYSA9IHRoaXMuc3RhcjFcbiAgICBiID0gdGhpcy5zdGFyMlxuICAgIGMgPSB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeVxuICAgIH1cbiAgICB4QWJEaXN0ID0gYi54IC0gYS54XG4gICAgeUFiRGlzdCA9IGIueSAtIGEueVxuICAgIGFieEFuZ2xlID0gTWF0aC5hdGFuKHlBYkRpc3QgLyB4QWJEaXN0KVxuICAgIHhBY0Rpc3QgPSBjLnggLSBhLnhcbiAgICB5QWNEaXN0ID0gYy55IC0gYS55XG4gICAgYWNEaXN0ID0gTWF0aC5zcXJ0KCh4QWNEaXN0ICogeEFjRGlzdCkgKyAoeUFjRGlzdCAqIHlBY0Rpc3QpKVxuICAgIGFjeEFuZ2xlID0gTWF0aC5hdGFuKHlBY0Rpc3QgLyB4QWNEaXN0KVxuICAgIGFiY0FuZ2xlID0gYWJ4QW5nbGUgLSBhY3hBbmdsZVxuICAgIGNkRGlzdCA9IE1hdGguYWJzKE1hdGguc2luKGFiY0FuZ2xlKSAqIGFjRGlzdClcbiAgICByZXR1cm4gY2REaXN0IDw9IG1pbkRpc3RcbiAgfVxuXG4gIGludGVyc2VjdExpbmsgKGxpbmspIHtcbiAgICB2YXIgcywgczF4LCBzMXksIHMyeCwgczJ5LCB0LCB4MSwgeDIsIHgzLCB4NCwgeTEsIHkyLCB5MywgeTRcbiAgICB4MSA9IHRoaXMuc3RhcjEueFxuICAgIHkxID0gdGhpcy5zdGFyMS55XG4gICAgeDIgPSB0aGlzLnN0YXIyLnhcbiAgICB5MiA9IHRoaXMuc3RhcjIueVxuICAgIHgzID0gbGluay5zdGFyMS54XG4gICAgeTMgPSBsaW5rLnN0YXIxLnlcbiAgICB4NCA9IGxpbmsuc3RhcjIueFxuICAgIHk0ID0gbGluay5zdGFyMi55XG4gICAgczF4ID0geDIgLSB4MVxuICAgIHMxeSA9IHkyIC0geTFcbiAgICBzMnggPSB4NCAtIHgzXG4gICAgczJ5ID0geTQgLSB5M1xuICAgIHMgPSAoLXMxeSAqICh4MSAtIHgzKSArIHMxeCAqICh5MSAtIHkzKSkgLyAoLXMyeCAqIHMxeSArIHMxeCAqIHMyeSlcbiAgICB0ID0gKHMyeCAqICh5MSAtIHkzKSAtIHMyeSAqICh4MSAtIHgzKSkgLyAoLXMyeCAqIHMxeSArIHMxeCAqIHMyeSlcbiAgICByZXR1cm4gcyA+IDAgJiYgcyA8IDEgJiYgdCA+IDAgJiYgdCA8IDFcbiAgfVxufVxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5cbmNsYXNzIFRyYXZlbCBleHRlbmRzIEVsZW1lbnQge1xuICBzdGFydCAobG9jYXRpb24pIHtcbiAgICBpZiAodGhpcy52YWxpZCkge1xuICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlXG4gICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSB0aGlzXG4gICAgICB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudHJhdmVsbGVyLmxvY2F0aW9uID0gdGhpcy50YXJnZXRMb2NhdGlvblxuICAgICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSBudWxsXG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2VcbiAgICAgIH0sIHRoaXMuZHVyYXRpb24pXG4gICAgfVxuICB9XG59O1xuXG5UcmF2ZWwucHJvcGVydGllcyh7XG4gIHRyYXZlbGxlcjoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgc3RhcnRMb2NhdGlvbjoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgdGFyZ2V0TG9jYXRpb246IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIGN1cnJlbnRTZWN0aW9uOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydExvY2F0aW9uLmxpbmtzLmZpbmRTdGFyKHRoaXMudGFyZ2V0TG9jYXRpb24pXG4gICAgfVxuICB9LFxuICBkdXJhdGlvbjoge1xuICAgIGRlZmF1bHQ6IDEwMDBcbiAgfSxcbiAgbW92aW5nOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgdmFsaWQ6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZWYsIHJlZjFcbiAgICAgIGlmICh0aGlzLnRhcmdldExvY2F0aW9uID09PSB0aGlzLnN0YXJ0TG9jYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAoKCgocmVmID0gdGhpcy50YXJnZXRMb2NhdGlvbikgIT0gbnVsbCA/IHJlZi5saW5rcyA6IG51bGwpICE9IG51bGwpICYmICgoKHJlZjEgPSB0aGlzLnN0YXJ0TG9jYXRpb24pICE9IG51bGwgPyByZWYxLmxpbmtzIDogbnVsbCkgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb24gIT0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdGltaW5nOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgfVxuICB9LFxuICBzcGFjZUNvb2RpbmF0ZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgZW5kWCwgZW5kWSwgcHJjLCBzdGFydFgsIHN0YXJ0WVxuICAgICAgc3RhcnRYID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3N0YXJ0TG9jYXRpb24ueCcpXG4gICAgICBzdGFydFkgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgnc3RhcnRMb2NhdGlvbi55JylcbiAgICAgIGVuZFggPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgndGFyZ2V0TG9jYXRpb24ueCcpXG4gICAgICBlbmRZID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RhcmdldExvY2F0aW9uLnknKVxuICAgICAgcHJjID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3BhdGhUaW1lb3V0LnByYycpXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiAoc3RhcnRYIC0gZW5kWCkgKiBwcmMgKyBlbmRYLFxuICAgICAgICB5OiAoc3RhcnRZIC0gZW5kWSkgKiBwcmMgKyBlbmRZXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYXZlbFxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBHcmlkID0gcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLkdyaWRcblxuY2xhc3MgVmlldyBleHRlbmRzIEVsZW1lbnQge1xuICBzZXREZWZhdWx0cyAoKSB7XG4gICAgdmFyIHJlZlxuICAgIGlmICghdGhpcy5ib3VuZHMpIHtcbiAgICAgIHRoaXMuZ3JpZCA9IHRoaXMuZ3JpZCB8fCAoKHJlZiA9IHRoaXMuZ2FtZS5tYWluVmlld1Byb3BlcnR5LnZhbHVlKSAhPSBudWxsID8gcmVmLmdyaWQgOiBudWxsKSB8fCBuZXcgR3JpZCgpXG4gICAgICB0aGlzLmJvdW5kcyA9IHRoaXMuZ3JpZC5hZGRDZWxsKClcbiAgICB9XG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmdhbWUgPSBudWxsXG4gIH1cbn07XG5cblZpZXcucHJvcGVydGllcyh7XG4gIGdhbWU6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICB0aGlzLmdhbWUudmlld3MuYWRkKHRoaXMpXG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdHMoKVxuICAgICAgfVxuICAgICAgaWYgKG9sZCkge1xuICAgICAgICByZXR1cm4gb2xkLnZpZXdzLnJlbW92ZSh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgeDoge1xuICAgIGRlZmF1bHQ6IDBcbiAgfSxcbiAgeToge1xuICAgIGRlZmF1bHQ6IDBcbiAgfSxcbiAgZ3JpZDoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgYm91bmRzOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdcbiIsImNvbnN0IExpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpXG5jb25zdCBEaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uXG5jb25zdCBUaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXJcbmNvbnN0IFRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVJlZmVyZW5jZVxuXG5jbGFzcyBWaXNpb25DYWxjdWxhdG9yIHtcbiAgY29uc3RydWN0b3IgKG9yaWdpblRpbGUsIG9mZnNldCA9IHtcbiAgICB4OiAwLjUsXG4gICAgeTogMC41XG4gIH0pIHtcbiAgICB0aGlzLm9yaWdpblRpbGUgPSBvcmlnaW5UaWxlXG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXRcbiAgICB0aGlzLnB0cyA9IHt9XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge31cbiAgICB0aGlzLnN0YWNrID0gW11cbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICB0aGlzLmluaXQoKVxuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdGVwKClcbiAgICB9XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZVxuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgdmFyIGZpcnN0QmF0Y2gsIGluaXRpYWxQdHNcbiAgICB0aGlzLnB0cyA9IHt9XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge31cbiAgICBpbml0aWFsUHRzID0gW3sgeDogMCwgeTogMCB9LCB7IHg6IDEsIHk6IDAgfSwgeyB4OiAwLCB5OiAxIH0sIHsgeDogMSwgeTogMSB9XVxuICAgIGluaXRpYWxQdHMuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnNldFB0KHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55LCB0cnVlKVxuICAgIH0pXG4gICAgZmlyc3RCYXRjaCA9IFtcbiAgICAgIHsgeDogLTEsIHk6IC0xIH0sIHsgeDogLTEsIHk6IDAgfSwgeyB4OiAtMSwgeTogMSB9LCB7IHg6IC0xLCB5OiAyIH0sXG4gICAgICB7IHg6IDIsIHk6IC0xIH0sIHsgeDogMiwgeTogMCB9LCB7IHg6IDIsIHk6IDEgfSwgeyB4OiAyLCB5OiAyIH0sXG4gICAgICB7IHg6IDAsIHk6IC0xIH0sIHsgeDogMSwgeTogLTEgfSxcbiAgICAgIHsgeDogMCwgeTogMiB9LCB7IHg6IDEsIHk6IDIgfVxuICAgIF1cbiAgICB0aGlzLnN0YWNrID0gZmlyc3RCYXRjaC5tYXAoKHB0KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLm9yaWdpblRpbGUueCArIHB0LngsXG4gICAgICAgIHk6IHRoaXMub3JpZ2luVGlsZS55ICsgcHQueVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBzZXRQdCAoeCwgeSwgdmFsKSB7XG4gICAgdmFyIGFkamFuY2VudFxuICAgIHRoaXMucHRzW3ggKyAnOicgKyB5XSA9IHZhbFxuICAgIGFkamFuY2VudCA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH1cbiAgICBdXG4gICAgcmV0dXJuIGFkamFuY2VudC5mb3JFYWNoKChwdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmlzaWJpbGl0eSh4ICsgcHQueCwgeSArIHB0LnksIHZhbCA/IDEgLyBhZGphbmNlbnQubGVuZ3RoIDogMClcbiAgICB9KVxuICB9XG5cbiAgZ2V0UHQgKHgsIHkpIHtcbiAgICByZXR1cm4gdGhpcy5wdHNbeCArICc6JyArIHldXG4gIH1cblxuICBhZGRWaXNpYmlsaXR5ICh4LCB5LCB2YWwpIHtcbiAgICBpZiAodGhpcy52aXNpYmlsaXR5W3hdID09IG51bGwpIHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eVt4XSA9IHt9XG4gICAgfVxuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF1beV0gIT0gbnVsbCkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5W3hdW3ldICs9IHZhbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlbeF1beV0gPSB2YWxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldFZpc2liaWxpdHkgKHgsIHkpIHtcbiAgICBpZiAoKHRoaXMudmlzaWJpbGl0eVt4XSA9PSBudWxsKSB8fCAodGhpcy52aXNpYmlsaXR5W3hdW3ldID09IG51bGwpKSB7XG4gICAgICByZXR1cm4gMFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpYmlsaXR5W3hdW3ldXG4gICAgfVxuICB9XG5cbiAgY2FuUHJvY2VzcyAoeCwgeSkge1xuICAgIHJldHVybiAhdGhpcy5zdGFjay5zb21lKChwdCkgPT4ge1xuICAgICAgcmV0dXJuIHB0LnggPT09IHggJiYgcHQueSA9PT0geVxuICAgIH0pICYmICh0aGlzLmdldFB0KHgsIHkpID09IG51bGwpXG4gIH1cblxuICBzdGVwICgpIHtcbiAgICB2YXIgbG9zLCBwdFxuICAgIHB0ID0gdGhpcy5zdGFjay5zaGlmdCgpXG4gICAgbG9zID0gbmV3IExpbmVPZlNpZ2h0KHRoaXMub3JpZ2luVGlsZS5jb250YWluZXIsIHRoaXMub3JpZ2luVGlsZS54ICsgdGhpcy5vZmZzZXQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyB0aGlzLm9mZnNldC55LCBwdC54LCBwdC55KVxuICAgIGxvcy5yZXZlcnNlVHJhY2luZygpXG4gICAgbG9zLnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSAodGlsZSwgZW50cnlYLCBlbnRyeVkpID0+IHtcbiAgICAgIGlmICh0aWxlICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0VmlzaWJpbGl0eSh0aWxlLngsIHRpbGUueSkgPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gbG9zLmZvcmNlU3VjY2VzcygpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRpbGUudHJhbnNwYXJlbnRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFB0KHB0LngsIHB0LnksIGxvcy5nZXRTdWNjZXNzKCkpXG4gICAgaWYgKGxvcy5nZXRTdWNjZXNzKCkpIHtcbiAgICAgIHJldHVybiBEaXJlY3Rpb24uYWxsLmZvckVhY2goKGRpcmVjdGlvbikgPT4ge1xuICAgICAgICB2YXIgbmV4dFB0XG4gICAgICAgIG5leHRQdCA9IHtcbiAgICAgICAgICB4OiBwdC54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgeTogcHQueSArIGRpcmVjdGlvbi55XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2FuUHJvY2VzcyhuZXh0UHQueCwgbmV4dFB0LnkpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2sucHVzaChuZXh0UHQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Qm91bmRzICgpIHtcbiAgICB2YXIgYm91bmRhcmllcywgY29sLCByZWYsIHgsIHlcbiAgICBib3VuZGFyaWVzID0ge1xuICAgICAgdG9wOiBudWxsLFxuICAgICAgbGVmdDogbnVsbCxcbiAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgIHJpZ2h0OiBudWxsXG4gICAgfVxuICAgIHJlZiA9IHRoaXMudmlzaWJpbGl0eVxuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XVxuICAgICAgZm9yICh5IGluIGNvbCkge1xuICAgICAgICBpZiAoKGJvdW5kYXJpZXMudG9wID09IG51bGwpIHx8IHkgPCBib3VuZGFyaWVzLnRvcCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMudG9wID0geVxuICAgICAgICB9XG4gICAgICAgIGlmICgoYm91bmRhcmllcy5sZWZ0ID09IG51bGwpIHx8IHggPCBib3VuZGFyaWVzLmxlZnQpIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmxlZnQgPSB4XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB5ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHlcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGJvdW5kYXJpZXMucmlnaHQgPT0gbnVsbCkgfHwgeCA+IGJvdW5kYXJpZXMucmlnaHQpIHtcbiAgICAgICAgICBib3VuZGFyaWVzLnJpZ2h0ID0geFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBib3VuZGFyaWVzXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1RpbGVDb250YWluZXJ9XG4gICAqL1xuICB0b0NvbnRhaW5lciAoKSB7XG4gICAgdmFyIGNvbCwgcmVmLCB0aWxlLCB2YWwsIHgsIHlcbiAgICBjb25zdCByZXMgPSBuZXcgVGlsZUNvbnRhaW5lcigpXG4gICAgcmVzLm93bmVyID0gZmFsc2VcbiAgICByZWYgPSB0aGlzLnZpc2liaWxpdHlcbiAgICBmb3IgKHggaW4gcmVmKSB7XG4gICAgICBjb2wgPSByZWZbeF1cbiAgICAgIGZvciAoeSBpbiBjb2wpIHtcbiAgICAgICAgdmFsID0gY29sW3ldXG4gICAgICAgIHRpbGUgPSB0aGlzLm9yaWdpblRpbGUuY29udGFpbmVyLmdldFRpbGUoeCwgeSlcbiAgICAgICAgaWYgKHZhbCAhPT0gMCAmJiAodGlsZSAhPSBudWxsKSkge1xuICAgICAgICAgIHRpbGUgPSBuZXcgVGlsZVJlZmVyZW5jZSh0aWxlKVxuICAgICAgICAgIHRpbGUudmlzaWJpbGl0eSA9IHZhbFxuICAgICAgICAgIHJlcy5hZGRUaWxlKHRpbGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgdG9NYXAgKCkge1xuICAgIHZhciBpLCBqLCByZWYsIHJlZjEsIHJlZjIsIHJlZjMsIHJlcywgeCwgeVxuICAgIHJlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbWFwOiBbXVxuICAgIH0sIHRoaXMuZ2V0Qm91bmRzKCkpXG4gICAgZm9yICh5ID0gaSA9IHJlZiA9IHJlcy50b3AsIHJlZjEgPSByZXMuYm90dG9tIC0gMTsgKHJlZiA8PSByZWYxID8gaSA8PSByZWYxIDogaSA+PSByZWYxKTsgeSA9IHJlZiA8PSByZWYxID8gKytpIDogLS1pKSB7XG4gICAgICByZXMubWFwW3kgLSByZXMudG9wXSA9IFtdXG4gICAgICBmb3IgKHggPSBqID0gcmVmMiA9IHJlcy5sZWZ0LCByZWYzID0gcmVzLnJpZ2h0IC0gMTsgKHJlZjIgPD0gcmVmMyA/IGogPD0gcmVmMyA6IGogPj0gcmVmMyk7IHggPSByZWYyIDw9IHJlZjMgPyArK2ogOiAtLWopIHtcbiAgICAgICAgcmVzLm1hcFt5IC0gcmVzLnRvcF1beCAtIHJlcy5sZWZ0XSA9IHRoaXMuZ2V0VmlzaWJpbGl0eSh4LCB5KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBWaXNpb25DYWxjdWxhdG9yXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNsYXNzIEFjdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICB3aXRoQWN0b3IgKGFjdG9yKSB7XG4gICAgaWYgKHRoaXMuYWN0b3IgIT09IGFjdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7XG4gICAgICAgIGFjdG9yOiBhY3RvclxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH1cblxuICBjb3B5V2l0aCAob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihPYmplY3QuYXNzaWduKHtcbiAgICAgIGJhc2U6IHRoaXMuYmFzZU9yVGhpcygpXG4gICAgfSwgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5nZXRNYW51YWxEYXRhUHJvcGVydGllcygpLCBvcHRpb25zKSlcbiAgfVxuXG4gIGJhc2VPclRoaXMgKCkge1xuICAgIHJldHVybiB0aGlzLmJhc2UgfHwgdGhpc1xuICB9XG5cbiAgc3RhcnQgKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dGUoKVxuICB9XG5cbiAgdmFsaWRBY3RvciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0b3IgIT0gbnVsbFxuICB9XG5cbiAgaXNSZWFkeSAoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsaWRBY3RvcigpXG4gIH1cblxuICBmaW5pc2ggKCkge1xuICAgIHRoaXMuZW1pdCgnZmluaXNoZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBpbnRlcnJ1cHQgKCkge1xuICAgIHRoaXMuZW1pdCgnaW50ZXJydXB0ZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBlbmQgKCkge1xuICAgIHRoaXMuZW1pdCgnZW5kJylcbiAgICByZXR1cm4gdGhpcy5kZXN0cm95KClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmRlc3Ryb3koKVxuICB9XG59O1xuXG5BY3Rpb24uaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKVxuXG5BY3Rpb24ucHJvcGVydGllcyh7XG4gIGFjdG9yOiB7fSxcbiAgYmFzZToge31cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcblxuY2xhc3MgQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG5BY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgYWN0aW9uczoge1xuICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgY29tcG9zZWQ6IHRydWVcbiAgfSxcbiAgb3duZXI6IHt9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGlvblByb3ZpZGVyXG4iLCJjb25zdCBXYWxrQWN0aW9uID0gcmVxdWlyZSgnLi9XYWxrQWN0aW9uJylcbmNvbnN0IFRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJylcbmNvbnN0IEV2ZW50QmluZCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEJpbmRcbmNvbnN0IFByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS53YXRjaGVycy5Qcm9wZXJ0eVdhdGNoZXJcblxuY2xhc3MgQXR0YWNrQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgdmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldElzQXR0YWNrYWJsZSgpICYmICh0aGlzLmNhblVzZVdlYXBvbigpIHx8IHRoaXMuY2FuV2Fsa1RvVGFyZ2V0KCkpXG4gIH1cblxuICB0YXJnZXRJc0F0dGFja2FibGUgKCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldC5kYW1hZ2VhYmxlICYmIHRoaXMudGFyZ2V0LmhlYWx0aCA+PSAwXG4gIH1cblxuICBjYW5NZWxlZSAoKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueCAtIHRoaXMuYWN0b3IudGlsZS54KSArIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueSAtIHRoaXMuYWN0b3IudGlsZS55KSA9PT0gMVxuICB9XG5cbiAgY2FuVXNlV2VhcG9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5iZXN0VXNhYmxlV2VhcG9uICE9IG51bGxcbiAgfVxuXG4gIGNhblVzZVdlYXBvbkF0ICh0aWxlKSB7XG4gICAgdmFyIHJlZlxuICAgIHJldHVybiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiBudWxsKSAmJiB0aGlzLmFjdG9yLndlYXBvbnMuZmluZCgod2VhcG9uKSA9PiB7XG4gICAgICByZXR1cm4gd2VhcG9uLmNhblVzZUZyb20odGlsZSwgdGhpcy50YXJnZXQpXG4gICAgfSlcbiAgfVxuXG4gIGNhbldhbGtUb1RhcmdldCAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5pc1JlYWR5KClcbiAgfVxuXG4gIHVzZVdlYXBvbiAoKSB7XG4gICAgdGhpcy5iZXN0VXNhYmxlV2VhcG9uLnVzZU9uKHRoaXMudGFyZ2V0KVxuICAgIHJldHVybiB0aGlzLmZpbmlzaCgpXG4gIH1cblxuICBleGVjdXRlICgpIHtcbiAgICBpZiAodGhpcy5hY3Rvci53YWxrICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYWN0b3Iud2Fsay5pbnRlcnJ1cHQoKVxuICAgIH1cbiAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uICE9IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24uY2hhcmdlZCkge1xuICAgICAgICByZXR1cm4gdGhpcy51c2VXZWFwb24oKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2VhcG9uQ2hhcmdlV2F0Y2hlci5iaW5kKClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53YWxrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIudW5iaW5kKClcbiAgICAgICAgdGhpcy53YWxrQWN0aW9uLmRlc3Ryb3koKVxuICAgICAgICB0aGlzLndhbGtBY3Rpb25Qcm9wZXJ0eS5pbnZhbGlkYXRlKClcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIuYmluZFRvKHRoaXMud2Fsa0FjdGlvbilcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uZXhlY3V0ZSgpXG4gICAgfVxuICB9XG59O1xuXG5BdHRhY2tBY3Rpb24ucHJvcGVydGllcyh7XG4gIHdhbGtBY3Rpb246IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB3YWxrQWN0aW9uXG4gICAgICB3YWxrQWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxuICAgICAgfSlcbiAgICAgIHdhbGtBY3Rpb24ucGF0aEZpbmRlci5hcnJpdmVkQ2FsbGJhY2sgPSAoc3RlcCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW5Vc2VXZWFwb25BdChzdGVwLnRpbGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gd2Fsa0FjdGlvblxuICAgIH1cbiAgfSxcbiAgYmVzdFVzYWJsZVdlYXBvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgcmVmLCB1c2FibGVXZWFwb25zXG4gICAgICBpbnZhbGlkYXRvci5wcm9wUGF0aCgnYWN0b3IudGlsZScpXG4gICAgICBpZiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiBudWxsKSB7XG4gICAgICAgIHVzYWJsZVdlYXBvbnMgPSB0aGlzLmFjdG9yLndlYXBvbnMuZmlsdGVyKCh3ZWFwb24pID0+IHtcbiAgICAgICAgICByZXR1cm4gd2VhcG9uLmNhblVzZU9uKHRoaXMudGFyZ2V0KVxuICAgICAgICB9KVxuICAgICAgICB1c2FibGVXZWFwb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICByZXR1cm4gYi5kcHMgLSBhLmRwc1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gdXNhYmxlV2VhcG9uc1swXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGludGVycnVwdEJpbmRlcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBFdmVudEJpbmQoJ2ludGVycnVwdGVkJywgbnVsbCwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGRlc3Ryb3k6IHRydWVcbiAgfSxcbiAgd2VhcG9uQ2hhcmdlV2F0Y2hlcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24uY2hhcmdlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlV2VhcG9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLmJlc3RVc2FibGVXZWFwb24ucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ2NoYXJnZWQnKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGRlc3Ryb3k6IHRydWVcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2tBY3Rpb25cbiIsImNvbnN0IFdhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKVxuY29uc3QgQXR0YWNrQWN0aW9uID0gcmVxdWlyZSgnLi9BdHRhY2tBY3Rpb24nKVxuY29uc3QgVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKVxuY29uc3QgUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpXG5jb25zdCBMaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4uL0xpbmVPZlNpZ2h0JylcbmNvbnN0IFByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS53YXRjaGVycy5Qcm9wZXJ0eVdhdGNoZXJcbmNvbnN0IEV2ZW50QmluZCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEJpbmRcblxuY2xhc3MgQXR0YWNrTW92ZUFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gIGlzRW5lbXkgKGVsZW0pIHtcbiAgICB2YXIgcmVmXG4gICAgcmV0dXJuIChyZWYgPSB0aGlzLmFjdG9yLm93bmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5pc0VuZW15ID09PSAnZnVuY3Rpb24nID8gcmVmLmlzRW5lbXkoZWxlbSkgOiBudWxsIDogbnVsbFxuICB9XG5cbiAgdmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24udmFsaWRUYXJnZXQoKVxuICB9XG5cbiAgdGVzdEVuZW15U3BvdHRlZCAoKSB7XG4gICAgdGhpcy5lbmVteVNwb3R0ZWRQcm9wZXJ0eS5pbnZhbGlkYXRlKClcbiAgICBpZiAodGhpcy5lbmVteVNwb3R0ZWQpIHtcbiAgICAgIHRoaXMuYXR0YWNrQWN0aW9uID0gbmV3IEF0dGFja0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzLmFjdG9yLFxuICAgICAgICB0YXJnZXQ6IHRoaXMuZW5lbXlTcG90dGVkXG4gICAgICB9KVxuICAgICAgdGhpcy5hdHRhY2tBY3Rpb24ub24oJ2ZpbmlzaGVkJywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLmludGVycnVwdEJpbmRlci5iaW5kVG8odGhpcy5hdHRhY2tBY3Rpb24pXG4gICAgICB0aGlzLndhbGtBY3Rpb24uaW50ZXJydXB0KClcbiAgICAgIHRoaXMud2Fsa0FjdGlvblByb3BlcnR5LmludmFsaWRhdGUoKVxuICAgICAgcmV0dXJuIHRoaXMuYXR0YWNrQWN0aW9uLmV4ZWN1dGUoKVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICghdGhpcy50ZXN0RW5lbXlTcG90dGVkKCkpIHtcbiAgICAgIHRoaXMud2Fsa0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaGVkKClcbiAgICAgIH0pXG4gICAgICB0aGlzLmludGVycnVwdEJpbmRlci5iaW5kVG8odGhpcy53YWxrQWN0aW9uKVxuICAgICAgdGhpcy50aWxlV2F0Y2hlci5iaW5kKClcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uZXhlY3V0ZSgpXG4gICAgfVxuICB9XG59O1xuXG5BdHRhY2tNb3ZlQWN0aW9uLnByb3BlcnRpZXMoe1xuICB3YWxrQWN0aW9uOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgd2Fsa0FjdGlvblxuICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgYWN0b3I6IHRoaXMuYWN0b3IsXG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgIH0pXG4gICAgICByZXR1cm4gd2Fsa0FjdGlvblxuICAgIH1cbiAgfSxcbiAgZW5lbXlTcG90dGVkOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcmVmXG4gICAgICB0aGlzLnBhdGggPSBuZXcgUGF0aEZpbmRlcih0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUsIGZhbHNlLCB7XG4gICAgICAgIHZhbGlkVGlsZTogKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGlsZS50cmFuc3BhcmVudCAmJiAobmV3IExpbmVPZlNpZ2h0KHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZS54LCB0aGlzLmFjdG9yLnRpbGUueSwgdGlsZS54LCB0aWxlLnkpKS5nZXRTdWNjZXNzKClcbiAgICAgICAgfSxcbiAgICAgICAgYXJyaXZlZDogKHN0ZXApID0+IHtcbiAgICAgICAgICBzdGVwLmVuZW15ID0gc3RlcC50aWxlLmNoaWxkcmVuLmZpbmQoKGMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlzRW5lbXkoYylcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBzdGVwLmVuZW15XG4gICAgICAgIH0sXG4gICAgICAgIGVmZmljaWVuY3k6ICh0aWxlKSA9PiB7fVxuICAgICAgfSlcbiAgICAgIHRoaXMucGF0aC5jYWxjdWwoKVxuICAgICAgcmV0dXJuIChyZWYgPSB0aGlzLnBhdGguc29sdXRpb24pICE9IG51bGwgPyByZWYuZW5lbXkgOiBudWxsXG4gICAgfVxuICB9LFxuICB0aWxlV2F0Y2hlcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRlc3RFbmVteVNwb3R0ZWQoKVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0eTogdGhpcy5hY3Rvci5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eSgndGlsZScpXG4gICAgICB9KVxuICAgIH0sXG4gICAgZGVzdHJveTogdHJ1ZVxuICB9LFxuICBpbnRlcnJ1cHRCaW5kZXI6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgRXZlbnRCaW5kKCdpbnRlcnJ1cHRlZCcsIG51bGwsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJydXB0KClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBkZXN0cm95OiB0cnVlXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNrTW92ZUFjdGlvblxuIiwiY29uc3QgQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL0FjdGlvblByb3ZpZGVyJylcblxuY2xhc3MgU2ltcGxlQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBY3Rpb25Qcm92aWRlciB7fTtcblxuU2ltcGxlQWN0aW9uUHJvdmlkZXIucHJvcGVydGllcyh7XG4gIGFjdGlvbnM6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhY3Rpb25zXG4gICAgICBhY3Rpb25zID0gdGhpcy5hY3Rpb25PcHRpb25zIHx8IHRoaXMuY29uc3RydWN0b3IuYWN0aW9ucyB8fCBbXVxuICAgICAgaWYgKHR5cGVvZiBhY3Rpb25zID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhY3Rpb25zID0gT2JqZWN0LmtleXMoYWN0aW9ucykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICByZXR1cm4gYWN0aW9uc1trZXldXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gYWN0aW9ucy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbi53aXRoVGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcmV0dXJuIGFjdGlvbi53aXRoVGFyZ2V0KHRoaXMpXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFjdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IEFjdGlvbkNsYXNzID0gYWN0aW9uXG4gICAgICAgICAgcmV0dXJuIG5ldyBBY3Rpb25DbGFzcyh7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXNcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBhY3Rpb25cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlQWN0aW9uUHJvdmlkZXJcbiIsImNvbnN0IEFjdGlvbiA9IHJlcXVpcmUoJy4vQWN0aW9uJylcblxuY2xhc3MgVGFyZ2V0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgd2l0aFRhcmdldCAodGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0ICE9PSB0YXJnZXQpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXRcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9XG5cbiAgY2FuVGFyZ2V0ICh0YXJnZXQpIHtcbiAgICB2YXIgaW5zdGFuY2VcbiAgICBpbnN0YW5jZSA9IHRoaXMud2l0aFRhcmdldCh0YXJnZXQpXG4gICAgaWYgKGluc3RhbmNlLnZhbGlkVGFyZ2V0KCkpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZVxuICAgIH1cbiAgfVxuXG4gIHZhbGlkVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy50YXJnZXQgIT0gbnVsbFxuICB9XG5cbiAgaXNSZWFkeSAoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmlzUmVhZHkoKSAmJiB0aGlzLnZhbGlkVGFyZ2V0KClcbiAgfVxufTtcblxuVGFyZ2V0QWN0aW9uLnByb3BlcnRpZXMoe1xuICB0YXJnZXQ6IHt9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRhcmdldEFjdGlvblxuIiwiY29uc3QgQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL0FjdGlvblByb3ZpZGVyJylcblxuY2xhc3MgVGlsZWRBY3Rpb25Qcm92aWRlciBleHRlbmRzIEFjdGlvblByb3ZpZGVyIHtcbiAgdmFsaWRBY3Rpb25UaWxlICh0aWxlKSB7XG4gICAgcmV0dXJuIHRpbGUgIT0gbnVsbFxuICB9XG5cbiAgcHJlcGFyZUFjdGlvblRpbGUgKHRpbGUpIHtcbiAgICBpZiAoIXRpbGUuYWN0aW9uUHJvdmlkZXIpIHtcbiAgICAgIHRpbGUuYWN0aW9uUHJvdmlkZXIgPSBuZXcgQWN0aW9uUHJvdmlkZXIoe1xuICAgICAgICBvd25lcjogdGlsZVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn07XG5cblRpbGVkQWN0aW9uUHJvdmlkZXIucHJvcGVydGllcyh7XG4gIG9yaWdpblRpbGU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdvd25lci50aWxlJylcbiAgICB9XG4gIH0sXG4gIGFjdGlvblRpbGVzOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgdmFyIG15VGlsZVxuICAgICAgbXlUaWxlID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLm9yaWdpblRpbGVQcm9wZXJ0eSlcbiAgICAgIGlmIChteVRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9uVGlsZXNDb29yZC5tYXAoKGNvb3JkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG15VGlsZS5nZXRSZWxhdGl2ZVRpbGUoY29vcmQueCwgY29vcmQueSlcbiAgICAgICAgfSkuZmlsdGVyKCh0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3Rpb25UaWxlKHRpbGUpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cbiAgICB9LFxuICAgIGl0ZW1BZGRlZDogZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgIHRoaXMucHJlcGFyZUFjdGlvblRpbGUodGlsZSlcbiAgICAgIHJldHVybiB0aWxlLmFjdGlvblByb3ZpZGVyLmFjdGlvbnNNZW1iZXJzLmFkZFByb3BlcnR5KHRoaXMuYWN0aW9uc1Byb3BlcnR5KVxuICAgIH0sXG4gICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICByZXR1cm4gdGlsZS5hY3Rpb25Qcm92aWRlci5hY3Rpb25zTWVtYmVycy5yZW1vdmVQcm9wZXJ0eSh0aGlzLmFjdGlvbnNQcm9wZXJ0eSlcbiAgICB9XG4gIH1cbn0pXG5cblRpbGVkQWN0aW9uUHJvdmlkZXIucHJvdG90eXBlLmFjdGlvblRpbGVzQ29vcmQgPSBbXG4gIHtcbiAgICB4OiAwLFxuICAgIHk6IC0xXG4gIH0sXG4gIHtcbiAgICB4OiAtMSxcbiAgICB5OiAwXG4gIH0sXG4gIHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfSxcbiAge1xuICAgIHg6ICsxLFxuICAgIHk6IDBcbiAgfSxcbiAge1xuICAgIHg6IDAsXG4gICAgeTogKzFcbiAgfVxuXVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVkQWN0aW9uUHJvdmlkZXJcbiIsImNvbnN0IFRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJylcbmNvbnN0IFRyYXZlbCA9IHJlcXVpcmUoJy4uL1RyYXZlbCcpXG5cbmNsYXNzIFRyYXZlbEFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gIHZhbGlkVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy50cmF2ZWwudmFsaWRcbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHJldHVybiB0aGlzLnRyYXZlbC5zdGFydCgpXG4gIH1cbn07XG5cblRyYXZlbEFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgdHJhdmVsOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFRyYXZlbCh7XG4gICAgICAgIHRyYXZlbGxlcjogdGhpcy5hY3RvcixcbiAgICAgICAgc3RhcnRMb2NhdGlvbjogdGhpcy5hY3Rvci5sb2NhdGlvbixcbiAgICAgICAgdGFyZ2V0TG9jYXRpb246IHRoaXMudGFyZ2V0XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBUcmF2ZWxBY3Rpb25cbiIsImNvbnN0IFBhdGhGaW5kZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKVxuY29uc3QgUGF0aFdhbGsgPSByZXF1aXJlKCcuLi9QYXRoV2FsaycpXG5jb25zdCBUYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpXG5cbmNsYXNzIFdhbGtBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICBleGVjdXRlICgpIHtcbiAgICBpZiAodGhpcy5hY3Rvci53YWxrICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYWN0b3Iud2Fsay5pbnRlcnJ1cHQoKVxuICAgIH1cbiAgICB0aGlzLndhbGsgPSB0aGlzLmFjdG9yLndhbGsgPSBuZXcgUGF0aFdhbGsodGhpcy5hY3RvciwgdGhpcy5wYXRoRmluZGVyKVxuICAgIHRoaXMuYWN0b3Iud2Fsay5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2goKVxuICAgIH0pXG4gICAgdGhpcy5hY3Rvci53YWxrLm9uKCdpbnRlcnJ1cHRlZCcsICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpXG4gICAgfSlcbiAgICByZXR1cm4gdGhpcy5hY3Rvci53YWxrLnN0YXJ0KClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKVxuICAgIGlmICh0aGlzLndhbGspIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGsuZGVzdHJveSgpXG4gICAgfVxuICB9XG5cbiAgdmFsaWRUYXJnZXQgKCkge1xuICAgIHRoaXMucGF0aEZpbmRlci5jYWxjdWwoKVxuICAgIHJldHVybiB0aGlzLnBhdGhGaW5kZXIuc29sdXRpb24gIT0gbnVsbFxuICB9XG59O1xuXG5XYWxrQWN0aW9uLnByb3BlcnRpZXMoe1xuICBwYXRoRmluZGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFBhdGhGaW5kZXIodGhpcy5hY3Rvci50aWxlLmNvbnRhaW5lciwgdGhpcy5hY3Rvci50aWxlLCB0aGlzLnRhcmdldCwge1xuICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFjdG9yLmNhbkdvT25UaWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rvci5jYW5Hb09uVGlsZSh0aWxlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZS53YWxrYWJsZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa0FjdGlvblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQWlybG9ja1wiOiByZXF1aXJlKFwiLi9BaXJsb2NrXCIpLFxuICBcIkFwcHJvYWNoXCI6IHJlcXVpcmUoXCIuL0FwcHJvYWNoXCIpLFxuICBcIkF1dG9tYXRpY0Rvb3JcIjogcmVxdWlyZShcIi4vQXV0b21hdGljRG9vclwiKSxcbiAgXCJDaGFyYWN0ZXJcIjogcmVxdWlyZShcIi4vQ2hhcmFjdGVyXCIpLFxuICBcIkNoYXJhY3RlckFJXCI6IHJlcXVpcmUoXCIuL0NoYXJhY3RlckFJXCIpLFxuICBcIkNvbmZyb250YXRpb25cIjogcmVxdWlyZShcIi4vQ29uZnJvbnRhdGlvblwiKSxcbiAgXCJEYW1hZ2VQcm9wYWdhdGlvblwiOiByZXF1aXJlKFwiLi9EYW1hZ2VQcm9wYWdhdGlvblwiKSxcbiAgXCJEYW1hZ2VhYmxlXCI6IHJlcXVpcmUoXCIuL0RhbWFnZWFibGVcIiksXG4gIFwiRG9vclwiOiByZXF1aXJlKFwiLi9Eb29yXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJFbmNvdW50ZXJNYW5hZ2VyXCI6IHJlcXVpcmUoXCIuL0VuY291bnRlck1hbmFnZXJcIiksXG4gIFwiRmxvb3JcIjogcmVxdWlyZShcIi4vRmxvb3JcIiksXG4gIFwiR2FtZVwiOiByZXF1aXJlKFwiLi9HYW1lXCIpLFxuICBcIkludmVudG9yeVwiOiByZXF1aXJlKFwiLi9JbnZlbnRvcnlcIiksXG4gIFwiTGluZU9mU2lnaHRcIjogcmVxdWlyZShcIi4vTGluZU9mU2lnaHRcIiksXG4gIFwiTWFwXCI6IHJlcXVpcmUoXCIuL01hcFwiKSxcbiAgXCJPYnN0YWNsZVwiOiByZXF1aXJlKFwiLi9PYnN0YWNsZVwiKSxcbiAgXCJQYXRoV2Fsa1wiOiByZXF1aXJlKFwiLi9QYXRoV2Fsa1wiKSxcbiAgXCJQZXJzb25hbFdlYXBvblwiOiByZXF1aXJlKFwiLi9QZXJzb25hbFdlYXBvblwiKSxcbiAgXCJQbGF5ZXJcIjogcmVxdWlyZShcIi4vUGxheWVyXCIpLFxuICBcIlByb2plY3RpbGVcIjogcmVxdWlyZShcIi4vUHJvamVjdGlsZVwiKSxcbiAgXCJSZXNzb3VyY2VcIjogcmVxdWlyZShcIi4vUmVzc291cmNlXCIpLFxuICBcIlJlc3NvdXJjZVR5cGVcIjogcmVxdWlyZShcIi4vUmVzc291cmNlVHlwZVwiKSxcbiAgXCJSb29tR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1Jvb21HZW5lcmF0b3JcIiksXG4gIFwiU2hpcFwiOiByZXF1aXJlKFwiLi9TaGlwXCIpLFxuICBcIlNoaXBJbnRlcmlvclwiOiByZXF1aXJlKFwiLi9TaGlwSW50ZXJpb3JcIiksXG4gIFwiU2hpcFdlYXBvblwiOiByZXF1aXJlKFwiLi9TaGlwV2VhcG9uXCIpLFxuICBcIlN0YXJNYXBHZW5lcmF0b3JcIjogcmVxdWlyZShcIi4vU3Rhck1hcEdlbmVyYXRvclwiKSxcbiAgXCJTdGFyU3lzdGVtXCI6IHJlcXVpcmUoXCIuL1N0YXJTeXN0ZW1cIiksXG4gIFwiVHJhdmVsXCI6IHJlcXVpcmUoXCIuL1RyYXZlbFwiKSxcbiAgXCJWaWV3XCI6IHJlcXVpcmUoXCIuL1ZpZXdcIiksXG4gIFwiVmlzaW9uQ2FsY3VsYXRvclwiOiByZXF1aXJlKFwiLi9WaXNpb25DYWxjdWxhdG9yXCIpLFxuICBcImFjdGlvbnNcIjoge1xuICAgIFwiQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQWN0aW9uXCIpLFxuICAgIFwiQWN0aW9uUHJvdmlkZXJcIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIkF0dGFja0FjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0F0dGFja0FjdGlvblwiKSxcbiAgICBcIkF0dGFja01vdmVBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BdHRhY2tNb3ZlQWN0aW9uXCIpLFxuICAgIFwiU2ltcGxlQWN0aW9uUHJvdmlkZXJcIjogcmVxdWlyZShcIi4vYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIlRhcmdldEFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL1RhcmdldEFjdGlvblwiKSxcbiAgICBcIlRpbGVkQWN0aW9uUHJvdmlkZXJcIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UaWxlZEFjdGlvblByb3ZpZGVyXCIpLFxuICAgIFwiVHJhdmVsQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVHJhdmVsQWN0aW9uXCIpLFxuICAgIFwiV2Fsa0FjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL1dhbGtBY3Rpb25cIiksXG4gIH0sXG59IiwiY29uc3QgbGlicyA9IHJlcXVpcmUoJy4vbGlicycpXG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgbGlicywge1xuICBncmlkczogcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLFxuICBQYXRoRmluZGVyOiByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKSxcbiAgc3RyaW5nczogcmVxdWlyZSgncGFyYWxsZWxpby1zdHJpbmdzJyksXG4gIHRpbGVzOiByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJyksXG4gIFRpbWluZzogcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKSxcbiAgd2lyaW5nOiByZXF1aXJlKCdwYXJhbGxlbGlvLXdpcmluZycpLFxuICBTcGFyazogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpXG59KVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IG9iamVjdENyZWF0ZVBvbHlmaWxsXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IG9iamVjdEtleXNQb2x5ZmlsbFxudmFyIGJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBmdW5jdGlvbkJpbmRQb2x5ZmlsbFxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19ldmVudHMnKSkge1xuICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG52YXIgaGFzRGVmaW5lUHJvcGVydHk7XG50cnkge1xuICB2YXIgbyA9IHt9O1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ3gnLCB7IHZhbHVlOiAwIH0pO1xuICBoYXNEZWZpbmVQcm9wZXJ0eSA9IG8ueCA9PT0gMDtcbn0gY2F0Y2ggKGVycikgeyBoYXNEZWZpbmVQcm9wZXJ0eSA9IGZhbHNlIH1cbmlmIChoYXNEZWZpbmVQcm9wZXJ0eSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBpcyBhIHBvc2l0aXZlIG51bWJlciAod2hvc2UgdmFsdWUgaXMgemVybyBvclxuICAgICAgLy8gZ3JlYXRlciBhbmQgbm90IGEgTmFOKS5cbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IGFyZyAhPT0gYXJnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICAgIH1cbiAgfSk7XG59IGVsc2Uge1xuICBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJuXCIgYXJndW1lbnQgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uICRnZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuICRnZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG4vLyBUaGVzZSBzdGFuZGFsb25lIGVtaXQqIGZ1bmN0aW9ucyBhcmUgdXNlZCB0byBvcHRpbWl6ZSBjYWxsaW5nIG9mIGV2ZW50XG4vLyBoYW5kbGVycyBmb3IgZmFzdCBjYXNlcyBiZWNhdXNlIGVtaXQoKSBpdHNlbGYgb2Z0ZW4gaGFzIGEgdmFyaWFibGUgbnVtYmVyIG9mXG4vLyBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBiZWNhdXNlIG9mIHRoYXQuIFRoZXNlIGZ1bmN0aW9ucyBhbHdheXMgaGF2ZVxuLy8gdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgdGh1cyBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLCBzbyB0aGUgY29kZVxuLy8gaW5zaWRlIHRoZW0gY2FuIGV4ZWN1dGUgZmFzdGVyLlxuZnVuY3Rpb24gZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgc2VsZikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZ3MpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGV2ZW50cztcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT0gbnVsbCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKVxuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKCFoYW5kbGVyKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgaXNGbiA9IHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nO1xuICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgIGNhc2UgMTpcbiAgICAgIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG4gICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgIGRlZmF1bHQ6XG4gICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoIWV2ZW50cykge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKCFleGlzdGluZykge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICBpZiAocHJlcGVuZCkge1xuICAgICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIG0gPSAkZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgICBpZiAobSAmJiBtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtKSB7XG4gICAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyBcIicgKyBTdHJpbmcodHlwZSkgKyAnXCIgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdC4nKTtcbiAgICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyVzOiAlcycsIHcubmFtZSwgdy5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdKTtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1syXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBiaW5kLmNhbGwob25jZVdyYXBwZXIsIHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAoIWxpc3QpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmICghZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqZWN0S2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmICghZXZlbnRzKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKCFldmxpc3RlbmVyKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgPyB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3Qub3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG4vLyBBYm91dCAxLjV4IGZhc3RlciB0aGFuIHRoZSB0d28tYXJnIHZlcnNpb24gb2YgQXJyYXkjc3BsaWNlKCkuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICh2YXIgaSA9IGluZGV4LCBrID0gaSArIDEsIG4gPSBsaXN0Lmxlbmd0aDsgayA8IG47IGkgKz0gMSwgayArPSAxKVxuICAgIGxpc3RbaV0gPSBsaXN0W2tdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENyZWF0ZVBvbHlmaWxsKHByb3RvKSB7XG4gIHZhciBGID0gZnVuY3Rpb24oKSB7fTtcbiAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgcmV0dXJuIG5ldyBGO1xufVxuZnVuY3Rpb24gb2JqZWN0S2V5c1BvbHlmaWxsKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrIGluIG9iaikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGspKSB7XG4gICAga2V5cy5wdXNoKGspO1xuICB9XG4gIHJldHVybiBrO1xufVxuZnVuY3Rpb24gZnVuY3Rpb25CaW5kUG9seWZpbGwoY29udGV4dCkge1xuICB2YXIgZm4gPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBuZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MvYnJvd3Nlci5qcycpLm5leHRUaWNrO1xudmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGltbWVkaWF0ZUlkcyA9IHt9O1xudmFyIG5leHRJbW1lZGlhdGVJZCA9IDA7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7IHRpbWVvdXQuY2xvc2UoKTsgfTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBUaGF0J3Mgbm90IGhvdyBub2RlLmpzIGltcGxlbWVudHMgaXQgYnV0IHRoZSBleHBvc2VkIGFwaSBpcyB0aGUgc2FtZS5cbmV4cG9ydHMuc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogZnVuY3Rpb24oZm4pIHtcbiAgdmFyIGlkID0gbmV4dEltbWVkaWF0ZUlkKys7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBmYWxzZSA6IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBpbW1lZGlhdGVJZHNbaWRdID0gdHJ1ZTtcblxuICBuZXh0VGljayhmdW5jdGlvbiBvbk5leHRUaWNrKCkge1xuICAgIGlmIChpbW1lZGlhdGVJZHNbaWRdKSB7XG4gICAgICAvLyBmbi5jYWxsKCkgaXMgZmFzdGVyIHNvIHdlIG9wdGltaXplIGZvciB0aGUgY29tbW9uIHVzZS1jYXNlXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2NhbGwtYXBwbHktc2VndVxuICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5jYWxsKG51bGwpO1xuICAgICAgfVxuICAgICAgLy8gUHJldmVudCBpZHMgZnJvbSBsZWFraW5nXG4gICAgICBleHBvcnRzLmNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSB0eXBlb2YgY2xlYXJJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IGNsZWFySW1tZWRpYXRlIDogZnVuY3Rpb24oaWQpIHtcbiAgZGVsZXRlIGltbWVkaWF0ZUlkc1tpZF07XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBCaW5kZXI6IHJlcXVpcmUoJy4vc3JjL0JpbmRlcicpLFxuICBFdmVudEJpbmQ6IHJlcXVpcmUoJy4vc3JjL0V2ZW50QmluZCcpLFxuICBSZWZlcmVuY2U6IHJlcXVpcmUoJy4vc3JjL1JlZmVyZW5jZScpXG59XG4iLCJjbGFzcyBCaW5kZXIge1xuICB0b2dnbGVCaW5kICh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudW5iaW5kKClcbiAgICB9XG4gIH1cblxuICBiaW5kICgpIHtcbiAgICBpZiAoIXRoaXMuYmluZGVkICYmIHRoaXMuY2FuQmluZCgpKSB7XG4gICAgICB0aGlzLmRvQmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpXG4gIH1cblxuICB1bmJpbmQgKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaW5kZXJcbiIsIlxuY29uc3QgQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKVxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnLi9SZWZlcmVuY2UnKVxuXG5jbGFzcyBFdmVudEJpbmQgZXh0ZW5kcyBCaW5kZXIge1xuICBjb25zdHJ1Y3RvciAoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnQxXG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQxXG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0ICE9IG51bGwpXG4gIH1cblxuICBiaW5kVG8gKHRhcmdldCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgIHJldHVybiB0aGlzLmJpbmQoKVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byBhZGQgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpXG4gICAgfVxuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKVxuICAgIH1cbiAgfVxuXG4gIGVxdWFscyAoZXZlbnRCaW5kKSB7XG4gICAgcmV0dXJuIGV2ZW50QmluZCAhPSBudWxsICYmXG4gICAgICBldmVudEJpbmQuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiZcbiAgICAgIGV2ZW50QmluZC5ldmVudCA9PT0gdGhpcy5ldmVudCAmJlxuICAgICAgUmVmZXJlbmNlLmNvbXBhcmVWYWwoZXZlbnRCaW5kLnRhcmdldCwgdGhpcy50YXJnZXQpICYmXG4gICAgICBSZWZlcmVuY2UuY29tcGFyZVZhbChldmVudEJpbmQuY2FsbGJhY2ssIHRoaXMuY2FsbGJhY2spXG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyIChlbWl0dGVyLCBmYXRhbCA9IHRydWUpIHtcbiAgICBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50QmluZFxuIiwiY2xhc3MgUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IgKGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gIH1cblxuICBlcXVhbHMgKHJlZikge1xuICAgIHJldHVybiByZWYgIT0gbnVsbCAmJiByZWYuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlRGF0YShyZWYuZGF0YSlcbiAgfVxuXG4gIGNvbXBhcmVEYXRhIChkYXRhKSB7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhkYXRhKVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09PSBkYXRhKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09IG51bGwgfHwgZGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkubGVuZ3RoID09PSBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggJiYgT2JqZWN0LmtleXMoZGF0YSkuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgICByZXR1cm4gUmVmZXJlbmNlLmNvbXBhcmVWYWwodGhpcy5kYXRhW2tleV0sIGRhdGFba2V5XSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBSZWZlcmVuY2UuY29tcGFyZVZhbCh0aGlzLmRhdGEsIGRhdGEpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSB2YWwxXG4gICAqIEBwYXJhbSB7Kn0gdmFsMlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIGNvbXBhcmVWYWwgKHZhbDEsIHZhbDIpIHtcbiAgICBpZiAodmFsMSA9PT0gdmFsMikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKHZhbDEgPT0gbnVsbCB8fCB2YWwyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbDEuZXF1YWxzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdmFsMS5lcXVhbHModmFsMilcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWwyLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbDIuZXF1YWxzKHZhbDEpXG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbDEpICYmIEFycmF5LmlzQXJyYXkodmFsMikpIHtcbiAgICAgIHJldHVybiB2YWwxLmxlbmd0aCA9PT0gdmFsMi5sZW5ndGggJiYgdmFsMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsLCB2YWwyW2ldKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gaWYgKHR5cGVvZiB2YWwxID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsMiA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwxKS5sZW5ndGggPT09IE9iamVjdC5rZXlzKHZhbDIpLmxlbmd0aCAmJiBPYmplY3Qua2V5cyh2YWwxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsMVtrZXldLCB2YWwyW2tleV0pXG4gICAgLy8gICB9KVxuICAgIC8vIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRpYyBtYWtlUmVmZXJyZWQgKG9iaiwgZGF0YSkge1xuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICBvYmoucmVmID0gZGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICBvYmoucmVmID0gbmV3IFJlZmVyZW5jZShkYXRhKVxuICAgIH1cbiAgICBvYmouZXF1YWxzID0gZnVuY3Rpb24gKG9iajIpIHtcbiAgICAgIHJldHVybiBvYmoyICE9IG51bGwgJiYgdGhpcy5yZWYuZXF1YWxzKG9iajIucmVmKVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVmZXJlbmNlXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL0NvbGxlY3Rpb24nKVxuIiwiLyoqXG4gKiBAdGVtcGxhdGUgVFxuICovXG5jbGFzcyBDb2xsZWN0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoYXJyKSB7XG4gICAgaWYgKGFyciAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXJyYXkgPSBbXVxuICAgIH1cbiAgfVxuXG4gIGNoYW5nZWQgKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IG9sZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9yZGVyZWRcbiAgICogQHBhcmFtIHtmdW5jdGlvbihULFQpOiBib29sZWFufSBjb21wYXJlRnVuY3Rpb25cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGNoZWNrQ2hhbmdlcyAob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgY29tcGFyZUZ1bmN0aW9uID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGJcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZCA9IFtdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50KCkgIT09IG9sZC5sZW5ndGggfHwgKG9yZGVyZWQgPyB0aGlzLnNvbWUoZnVuY3Rpb24gKHZhbCwgaSkge1xuICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKVxuICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbiAoYikge1xuICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGEsIGIpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBnZXQgKGkpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgZ2V0UmFuZG9tICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaVxuICAgKiBAcGFyYW0ge1R9IHZhbFxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgc2V0IChpLCB2YWwpIHtcbiAgICB2YXIgb2xkXG4gICAgaWYgKHRoaXMuX2FycmF5W2ldICE9PSB2YWwpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbFxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VH0gdmFsXG4gICAqL1xuICBhZGQgKHZhbCkge1xuICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHVzaCh2YWwpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtUfSB2YWxcbiAgICovXG4gIHJlbW92ZSAodmFsKSB7XG4gICAgdmFyIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oVCk6IGJvb2xlYW59IGZuXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwbHVjayAoZm4pIHtcbiAgICB2YXIgZm91bmQsIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmZpbmRJbmRleChmbilcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgICAgcmV0dXJuIGZvdW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7QXJyYXkuPENvbGxlY3Rpb24uPFQ+PnxBcnJheS48QXJyYXkuPFQ+PnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtDb2xsZWN0aW9uLjxUPn1cbiAgICovXG4gIGNvbmNhdCAoLi4uYXJyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheS5jb25jYXQoLi4uYXJyLm1hcCgoYSkgPT4gYS50b0FycmF5ID09IG51bGwgPyBhIDogYS50b0FycmF5KCkpKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICB0b0FycmF5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuc2xpY2UoKVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGNvdW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkubGVuZ3RoXG4gIH1cblxuICAvKipcbiAgICogQHRlbXBsYXRlIEl0ZW1UeXBlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0b0FwcGVuZFxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPEl0ZW1UeXBlPnxBcnJheS48SXRlbVR5cGU+fEl0ZW1UeXBlfSBbYXJyXVxuICAgKiBAcmV0dXJuIHtDb2xsZWN0aW9uLjxJdGVtVHlwZT59XG4gICAqL1xuICBzdGF0aWMgbmV3U3ViQ2xhc3MgKHRvQXBwZW5kLCBhcnIpIHtcbiAgICB2YXIgU3ViQ2xhc3NcbiAgICBpZiAodHlwZW9mIHRvQXBwZW5kID09PSAnb2JqZWN0Jykge1xuICAgICAgU3ViQ2xhc3MgPSBjbGFzcyBleHRlbmRzIHRoaXMge31cbiAgICAgIE9iamVjdC5hc3NpZ24oU3ViQ2xhc3MucHJvdG90eXBlLCB0b0FwcGVuZClcbiAgICAgIHJldHVybiBuZXcgU3ViQ2xhc3MoYXJyKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMoYXJyKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPFQ+fEFycmF5LjxUPnxUfSBbYXJyXVxuICAgKiBAcmV0dXJuIHtDb2xsZWN0aW9uLjxUPn1cbiAgICovXG4gIGNvcHkgKGFycikge1xuICAgIHZhciBjb2xsXG4gICAgaWYgKGFyciA9PSBudWxsKSB7XG4gICAgICBhcnIgPSB0aGlzLnRvQXJyYXkoKVxuICAgIH1cbiAgICBjb2xsID0gbmV3IHRoaXMuY29uc3RydWN0b3IoYXJyKVxuICAgIHJldHVybiBjb2xsXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBhcnJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGVxdWFscyAoYXJyKSB7XG4gICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbiAodmFsLCBpKSB7XG4gICAgICByZXR1cm4gYXJyW2ldID09PSB2YWxcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fSBhcnJcbiAgICogQHJldHVybiB7QXJyYXkuPFQ+fVxuICAgKi9cbiAgZ2V0QWRkZWRGcm9tIChhcnIpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gIWFyci5pbmNsdWRlcyhpdGVtKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICBnZXRSZW1vdmVkRnJvbSAoYXJyKSB7XG4gICAgcmV0dXJuIGFyci5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgIHJldHVybiAhdGhpcy5pbmNsdWRlcyhpdGVtKVxuICAgIH0pXG4gIH1cbn07XG5cbkNvbGxlY3Rpb24ucmVhZEZ1bmN0aW9ucyA9IFsnZXZlcnknLCAnZmluZCcsICdmaW5kSW5kZXgnLCAnZm9yRWFjaCcsICdpbmNsdWRlcycsICdpbmRleE9mJywgJ2pvaW4nLCAnbGFzdEluZGV4T2YnLCAnbWFwJywgJ3JlZHVjZScsICdyZWR1Y2VSaWdodCcsICdzb21lJywgJ3RvU3RyaW5nJ11cblxuQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucyA9IFsnZmlsdGVyJywgJ3NsaWNlJ11cblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J11cblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGZ1bmN0KSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uICguLi5hcmcpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZylcbiAgfVxufSlcblxuQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKSlcbiAgfVxufSlcblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgdmFyIG9sZCwgcmVzXG4gICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKVxuICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgcmV0dXJuIHJlc1xuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmNvdW50KClcbiAgfVxufSlcblxuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbU3ltYm9sLml0ZXJhdG9yXSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgSW52YWxpZGF0b3I6IHJlcXVpcmUoJy4vc3JjL0ludmFsaWRhdG9yJyksXG4gIFByb3BlcnRpZXNNYW5hZ2VyOiByZXF1aXJlKCcuL3NyYy9Qcm9wZXJ0aWVzTWFuYWdlcicpLFxuICBQcm9wZXJ0eTogcmVxdWlyZSgnLi9zcmMvUHJvcGVydHknKSxcbiAgZ2V0dGVyczoge1xuICAgIEJhc2VHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQmFzZUdldHRlcicpLFxuICAgIENhbGN1bGF0ZWRHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQ2FsY3VsYXRlZEdldHRlcicpLFxuICAgIENvbXBvc2l0ZUdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXInKSxcbiAgICBJbnZhbGlkYXRlZEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9JbnZhbGlkYXRlZEdldHRlcicpLFxuICAgIE1hbnVhbEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9NYW51YWxHZXR0ZXInKSxcbiAgICBTaW1wbGVHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvU2ltcGxlR2V0dGVyJylcbiAgfSxcbiAgc2V0dGVyczoge1xuICAgIEJhc2VTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvQmFzZVNldHRlcicpLFxuICAgIEJhc2VWYWx1ZVNldHRlcjogcmVxdWlyZSgnLi9zcmMvc2V0dGVycy9CYXNlVmFsdWVTZXR0ZXInKSxcbiAgICBDb2xsZWN0aW9uU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL0NvbGxlY3Rpb25TZXR0ZXInKSxcbiAgICBNYW51YWxTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvTWFudWFsU2V0dGVyJyksXG4gICAgU2ltcGxlU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL1NpbXBsZVNldHRlcicpXG4gIH0sXG4gIHdhdGNoZXJzOiB7XG4gICAgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcjogcmVxdWlyZSgnLi9zcmMvd2F0Y2hlcnMvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcicpLFxuICAgIFByb3BlcnR5V2F0Y2hlcjogcmVxdWlyZSgnLi9zcmMvd2F0Y2hlcnMvUHJvcGVydHlXYXRjaGVyJylcbiAgfVxufVxuIiwiY29uc3QgQmluZGVyID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkJpbmRlclxuY29uc3QgRXZlbnRCaW5kID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkV2ZW50QmluZFxuXG5jb25zdCBwbHVjayA9IGZ1bmN0aW9uIChhcnIsIGZuKSB7XG4gIHZhciBmb3VuZCwgaW5kZXhcbiAgaW5kZXggPSBhcnIuZmluZEluZGV4KGZuKVxuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XVxuICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpXG4gICAgcmV0dXJuIGZvdW5kXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkYXRvciBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yIChpbnZhbGlkYXRlZCwgc2NvcGUgPSBudWxsKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlZFxuICAgIHRoaXMuc2NvcGUgPSBzY29wZVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW11cbiAgICB0aGlzLnJlY3ljbGVkID0gW11cbiAgICB0aGlzLnVua25vd25zID0gW11cbiAgICB0aGlzLnN0cmljdCA9IHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0XG4gICAgdGhpcy5pbnZhbGlkID0gZmFsc2VcbiAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrLm93bmVyID0gdGhpc1xuICAgIHRoaXMuY2hhbmdlZENhbGxiYWNrID0gKG9sZCwgY29udGV4dCkgPT4ge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKGNvbnRleHQpXG4gICAgfVxuICAgIHRoaXMuY2hhbmdlZENhbGxiYWNrLm93bmVyID0gdGhpc1xuICB9XG5cbiAgaW52YWxpZGF0ZSAoY29udGV4dCkge1xuICAgIHZhciBmdW5jdE5hbWVcbiAgICB0aGlzLmludmFsaWQgPSB0cnVlXG4gICAgaWYgKHR5cGVvZiB0aGlzLmludmFsaWRhdGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmludmFsaWRhdGVkKGNvbnRleHQpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5jYWxsYmFjayhjb250ZXh0KVxuICAgIH0gZWxzZSBpZiAoKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQuaW52YWxpZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZC5pbnZhbGlkYXRlKGNvbnRleHQpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGZ1bmN0TmFtZSA9ICdpbnZhbGlkYXRlJyArIHRoaXMuaW52YWxpZGF0ZWQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmludmFsaWRhdGVkLnNsaWNlKDEpXG4gICAgICBpZiAodHlwZW9mIHRoaXMuc2NvcGVbZnVuY3ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNjb3BlW2Z1bmN0TmFtZV0oY29udGV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2NvcGVbdGhpcy5pbnZhbGlkYXRlZF0gPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB1bmtub3duIChjb250ZXh0KSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCAmJiB0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZC51bmtub3duID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlZC51bmtub3duKGNvbnRleHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoY29udGV4dClcbiAgICB9XG4gIH1cblxuICBhZGRFdmVudEJpbmQgKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkQmluZGVyKG5ldyBFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spKVxuICB9XG5cbiAgYWRkQmluZGVyIChiaW5kZXIpIHtcbiAgICBpZiAoYmluZGVyLmNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGJpbmRlci5jYWxsYmFjayA9IHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrXG4gICAgfVxuICAgIGlmICghdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuc29tZShmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpXG4gICAgfSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5wdXNoKHBsdWNrKHRoaXMucmVjeWNsZWQsIGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKVxuICAgICAgfSkgfHwgYmluZGVyKVxuICAgIH1cbiAgfVxuXG4gIGdldFVua25vd25DYWxsYmFjayAocHJvcCkge1xuICAgIHZhciBjYWxsYmFja1xuICAgIGNhbGxiYWNrID0gKGNvbnRleHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcHJvcC5nZXQoKVxuICAgICAgfSwgcHJvcCwgY29udGV4dClcbiAgICB9XG4gICAgY2FsbGJhY2sucHJvcCA9IHByb3BcbiAgICBjYWxsYmFjay5vd25lciA9IHRoaXNcbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfVxuXG4gIGFkZFVua25vd24gKGZuLCBwcm9wLCBjb250ZXh0KSB7XG4gICAgaWYgKCF0aGlzLmZpbmRVbmtub3duKHByb3ApKSB7XG4gICAgICBmbi5wcm9wID0gcHJvcFxuICAgICAgZm4ub3duZXIgPSB0aGlzXG4gICAgICB0aGlzLnVua25vd25zLnB1c2goZm4pXG4gICAgICByZXR1cm4gdGhpcy51bmtub3duKGNvbnRleHQpXG4gICAgfVxuICB9XG5cbiAgZmluZFVua25vd24gKHByb3ApIHtcbiAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy51bmtub3ducy5maW5kKGZ1bmN0aW9uICh1bmtub3duKSB7XG4gICAgICAgIHJldHVybiB1bmtub3duLnByb3AgPT09IHByb3BcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZXZlbnQgKGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0KVxuICAgIH1cbiAgfVxuXG4gIHZhbHVlICh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgdGhpcy5ldmVudChldmVudCwgdGFyZ2V0KVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcGFyYW0ge1Byb3BlcnR5PFQ+fSBwcm9wXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwcm9wIChwcm9wKSB7XG4gICAgaWYgKHByb3AgIT0gbnVsbCkge1xuICAgICAgdGhpcy5hZGRFdmVudEJpbmQoJ2ludmFsaWRhdGVkJywgcHJvcC5ldmVudHMsIHRoaXMuZ2V0VW5rbm93bkNhbGxiYWNrKHByb3ApKVxuICAgICAgdGhpcy5hZGRFdmVudEJpbmQoJ3VwZGF0ZWQnLCBwcm9wLmV2ZW50cywgdGhpcy5jaGFuZ2VkQ2FsbGJhY2spXG4gICAgICByZXR1cm4gcHJvcC5nZXQoKVxuICAgIH1cbiAgfVxuXG4gIHByb3BCeU5hbWUgKHByb3AsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICBpZiAodGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KHByb3ApXG4gICAgICBpZiAocHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcChwcm9wZXJ0eSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRhcmdldFtwcm9wICsgJ1Byb3BlcnR5J10gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcCh0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddKVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdXG4gIH1cblxuICBwcm9wUGF0aCAocGF0aCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgIHZhciBwcm9wLCB2YWxcbiAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpXG4gICAgdmFsID0gdGFyZ2V0XG4gICAgd2hpbGUgKCh2YWwgIT0gbnVsbCkgJiYgcGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICBwcm9wID0gcGF0aC5zaGlmdCgpXG4gICAgICB2YWwgPSB0aGlzLnByb3BCeU5hbWUocHJvcCwgdmFsKVxuICAgIH1cbiAgICByZXR1cm4gdmFsXG4gIH1cblxuICBmdW5jdCAoZnVuY3QpIHtcbiAgICB2YXIgaW52YWxpZGF0b3IsIHJlc1xuICAgIGludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKCgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oKCkgPT4ge1xuICAgICAgICB2YXIgcmVzMlxuICAgICAgICByZXMyID0gZnVuY3QoaW52YWxpZGF0b3IpXG4gICAgICAgIGlmIChyZXMgIT09IHJlczIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKClcbiAgICAgICAgfVxuICAgICAgfSwgaW52YWxpZGF0b3IpXG4gICAgfSlcbiAgICByZXMgPSBmdW5jdChpbnZhbGlkYXRvcilcbiAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5wdXNoKGludmFsaWRhdG9yKVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHZhbGlkYXRlVW5rbm93bnMgKCkge1xuICAgIHRoaXMudW5rbm93bnMuc2xpY2UoKS5mb3JFYWNoKGZ1bmN0aW9uICh1bmtub3duKSB7XG4gICAgICB1bmtub3duKClcbiAgICB9KVxuICAgIHRoaXMudW5rbm93bnMgPSBbXVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMubGVuZ3RoID09PSAwXG4gIH1cblxuICBiaW5kICgpIHtcbiAgICB0aGlzLmludmFsaWQgPSBmYWxzZVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgZXZlbnRCaW5kLmJpbmQoKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJlY3ljbGUgKGZuKSB7XG4gICAgdmFyIGRvbmUsIHJlc1xuICAgIHRoaXMucmVjeWNsZWQgPSB0aGlzLmludmFsaWRhdGlvbkV2ZW50c1xuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW11cbiAgICBkb25lID0gdGhpcy5lbmRSZWN5Y2xlLmJpbmQodGhpcylcbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZm4ubGVuZ3RoID4gMSkge1xuICAgICAgICByZXR1cm4gZm4odGhpcywgZG9uZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IGZuKHRoaXMpXG4gICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkb25lXG4gICAgfVxuICB9XG5cbiAgZW5kUmVjeWNsZSAoKSB7XG4gICAgdGhpcy5yZWN5Y2xlZC5mb3JFYWNoKGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgIHJldHVybiBldmVudEJpbmQudW5iaW5kKClcbiAgICB9KVxuICAgIHRoaXMucmVjeWNsZWQgPSBbXVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjaGVja0VtaXR0ZXIgKGVtaXR0ZXIpIHtcbiAgICByZXR1cm4gRXZlbnRCaW5kLmNoZWNrRW1pdHRlcihlbWl0dGVyLCB0aGlzLnN0cmljdClcbiAgfVxuXG4gIGNoZWNrUHJvcEluc3RhbmNlIChwcm9wKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBwcm9wLmdldCA9PT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLmNoZWNrRW1pdHRlcihwcm9wLmV2ZW50cylcbiAgfVxuXG4gIHVuYmluZCAoKSB7XG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICBldmVudEJpbmQudW5iaW5kKClcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn07XG5cbkludmFsaWRhdG9yLnN0cmljdCA9IHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBJbnZhbGlkYXRvclxuIiwiY29uc3QgUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5JylcblxuY2xhc3MgUHJvcGVydGllc01hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAocHJvcGVydGllcyA9IHt9LCBvcHRpb25zID0ge30pIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXkuPFByb3BlcnR5Pn1cbiAgICAgKi9cbiAgICB0aGlzLnByb3BlcnRpZXMgPSBbXVxuICAgIHRoaXMuZ2xvYmFsT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBpbml0V2F0Y2hlcnM6IGZhbHNlIH0sIG9wdGlvbnMpXG4gICAgdGhpcy5wcm9wZXJ0aWVzT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBwcm9wZXJ0aWVzXG4gICAqIEBwYXJhbSB7Kn0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtQcm9wZXJ0aWVzTWFuYWdlcn1cbiAgICovXG4gIGNvcHlXaXRoIChwcm9wZXJ0aWVzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLm1lcmdlUHJvcGVydGllc09wdGlvbnModGhpcy5wcm9wZXJ0aWVzT3B0aW9ucywgcHJvcGVydGllcyksIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2xvYmFsT3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICB3aXRoUHJvcGVydHkgKHByb3AsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0ge31cbiAgICBwcm9wZXJ0aWVzW3Byb3BdID0gb3B0aW9uc1xuICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHByb3BlcnRpZXMpXG4gIH1cblxuICB1c2VTY29wZSAoc2NvcGUpIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7fSwgeyBzY29wZTogc2NvcGUgfSlcbiAgfVxuXG4gIG1lcmdlUHJvcGVydGllc09wdGlvbnMgKC4uLmFyZykge1xuICAgIHJldHVybiBhcmcucmVkdWNlKChyZXMsIG9wdCkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMob3B0KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIHJlc1tuYW1lXSA9IHRoaXMubWVyZ2VQcm9wZXJ0eU9wdGlvbnMocmVzW25hbWVdIHx8IHt9LCBvcHRbbmFtZV0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0sIHt9KVxuICB9XG5cbiAgbWVyZ2VQcm9wZXJ0eU9wdGlvbnMgKC4uLmFyZykge1xuICAgIGNvbnN0IG5vdE1lcmdhYmxlID0gWydkZWZhdWx0JywgJ3Njb3BlJ11cbiAgICByZXR1cm4gYXJnLnJlZHVjZSgocmVzLCBvcHQpID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKG9wdCkuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHJlc1tuYW1lXSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb3B0W25hbWVdID09PSAnZnVuY3Rpb24nICYmICFub3RNZXJnYWJsZS5pbmNsdWRlcyhuYW1lKSkge1xuICAgICAgICAgIHJlc1tuYW1lXSA9IHRoaXMubWVyZ2VDYWxsYmFjayhyZXNbbmFtZV0sIG9wdFtuYW1lXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNbbmFtZV0gPSBvcHRbbmFtZV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiByZXNcbiAgICB9LCB7fSlcbiAgfVxuXG4gIG1lcmdlQ2FsbGJhY2sgKG9sZEZ1bmN0LCBuZXdGdW5jdCkge1xuICAgIGNvbnN0IGZuID0gZnVuY3Rpb24gKC4uLmFyZykge1xuICAgICAgcmV0dXJuIG5ld0Z1bmN0LmNhbGwodGhpcywgLi4uYXJnLCBvbGRGdW5jdC5iaW5kKHRoaXMpKVxuICAgIH1cbiAgICBmbi5jb21wb25lbnRzID0gKG9sZEZ1bmN0LmNvbXBvbmVudHMgfHwgW29sZEZ1bmN0XSkuY29uY2F0KChvbGRGdW5jdC5uZXdGdW5jdCB8fCBbbmV3RnVuY3RdKSlcbiAgICBmbi5uYlBhcmFtcyA9IG5ld0Z1bmN0Lm5iUGFyYW1zIHx8IG5ld0Z1bmN0Lmxlbmd0aFxuICAgIHJldHVybiBmblxuICB9XG5cbiAgaW5pdFByb3BlcnRpZXMgKCkge1xuICAgIHRoaXMuYWRkUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXNPcHRpb25zKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjcmVhdGVTY29wZUdldHRlclNldHRlcnMgKCkge1xuICAgIHRoaXMucHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiBwcm9wLmNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycygpKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbml0V2F0Y2hlcnMgKCkge1xuICAgIHRoaXMucHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiBwcm9wLmluaXRXYXRjaGVycygpKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbml0U2NvcGUgKCkge1xuICAgIHRoaXMuaW5pdFByb3BlcnRpZXMoKVxuICAgIHRoaXMuY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzKClcbiAgICB0aGlzLmluaXRXYXRjaGVycygpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7UHJvcGVydHk8VD59XG4gICAqL1xuICBhZGRQcm9wZXJ0eSAobmFtZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHByb3AgPSBuZXcgUHJvcGVydHkoT2JqZWN0LmFzc2lnbih7IG5hbWU6IG5hbWUgfSwgdGhpcy5nbG9iYWxPcHRpb25zLCBvcHRpb25zKSlcbiAgICB0aGlzLnByb3BlcnRpZXMucHVzaChwcm9wKVxuICAgIHJldHVybiBwcm9wXG4gIH1cblxuICBhZGRQcm9wZXJ0aWVzIChvcHRpb25zKSB7XG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaCgobmFtZSkgPT4gdGhpcy5hZGRQcm9wZXJ0eShuYW1lLCBvcHRpb25zW25hbWVdKSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eX1cbiAgICovXG4gIGdldFByb3BlcnR5IChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydGllcy5maW5kKChwcm9wKSA9PiBwcm9wLm9wdGlvbnMubmFtZSA9PT0gbmFtZSlcbiAgfVxuXG4gIHNldFByb3BlcnRpZXNEYXRhIChkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgY29uc3QgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHkoa2V5KVxuICAgICAgICBpZiAocHJvcCkge1xuICAgICAgICAgIHByb3Auc2V0KGRhdGFba2V5XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldE1hbnVhbERhdGFQcm9wZXJ0aWVzICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLnJlZHVjZSgocmVzLCBwcm9wKSA9PiB7XG4gICAgICBpZiAocHJvcC5nZXR0ZXIuY2FsY3VsYXRlZCAmJiBwcm9wLm1hbnVhbCkge1xuICAgICAgICByZXNbcHJvcC5vcHRpb25zLm5hbWVdID0gcHJvcC5nZXQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0sIHt9KVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHByb3AuZGVzdHJveSgpKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydGllc01hbmFnZXJcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuXG5jb25zdCBTaW1wbGVHZXR0ZXIgPSByZXF1aXJlKCcuL2dldHRlcnMvU2ltcGxlR2V0dGVyJylcbmNvbnN0IENhbGN1bGF0ZWRHZXR0ZXIgPSByZXF1aXJlKCcuL2dldHRlcnMvQ2FsY3VsYXRlZEdldHRlcicpXG5jb25zdCBJbnZhbGlkYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9JbnZhbGlkYXRlZEdldHRlcicpXG5jb25zdCBNYW51YWxHZXR0ZXIgPSByZXF1aXJlKCcuL2dldHRlcnMvTWFudWFsR2V0dGVyJylcbmNvbnN0IENvbXBvc2l0ZUdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXInKVxuXG5jb25zdCBNYW51YWxTZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvTWFudWFsU2V0dGVyJylcbmNvbnN0IFNpbXBsZVNldHRlciA9IHJlcXVpcmUoJy4vc2V0dGVycy9TaW1wbGVTZXR0ZXInKVxuY29uc3QgQmFzZVZhbHVlU2V0dGVyID0gcmVxdWlyZSgnLi9zZXR0ZXJzL0Jhc2VWYWx1ZVNldHRlcicpXG5jb25zdCBDb2xsZWN0aW9uU2V0dGVyID0gcmVxdWlyZSgnLi9zZXR0ZXJzL0NvbGxlY3Rpb25TZXR0ZXInKVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmNsYXNzIFByb3BlcnR5IHtcbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFByb3BlcnR5T3B0aW9uc1xuICAgKiBAcHJvcGVydHkge1R9IFtkZWZhdWx0XVxuICAgKiBAcHJvcGVydHkge2Z1bmN0aW9uKGltcG9ydChcIi4vSW52YWxpZGF0b3JcIikpOiBUfSBbY2FsY3VsXVxuICAgKiBAcHJvcGVydHkge2Z1bmN0aW9uKCk6IFR9IFtnZXRdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oVCl9IFtzZXRdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oVCxUKXxpbXBvcnQoXCIuL1Byb3BlcnR5V2F0Y2hlclwiKTxUPn0gW2NoYW5nZV1cbiAgICogQHByb3BlcnR5IHtib29sZWFufHN0cmluZ3xmdW5jdGlvbihULFQpOlR9IFtjb21wb3NlZF1cbiAgICogQHByb3BlcnR5IHtib29sZWFufE9iamVjdH0gW2NvbGxlY3Rpb25dXG4gICAqIEBwcm9wZXJ0eSB7Kn0gW3Njb3BlXVxuICAgKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5T3B0aW9uc30gb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IgKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFByb3BlcnR5LmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RXZlbnRFbWl0dGVyfVxuICAgICAqL1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IHRoaXMub3B0aW9ucy5FdmVudEVtaXR0ZXJDbGFzcygpXG4gICAgdGhpcy5tYWtlU2V0dGVyKClcbiAgICB0aGlzLm1ha2VHZXR0ZXIoKVxuICAgIHRoaXMuc2V0dGVyLmluaXQoKVxuICAgIHRoaXMuZ2V0dGVyLmluaXQoKVxuICAgIGlmICh0aGlzLm9wdGlvbnMuaW5pdFdhdGNoZXJzKSB7XG4gICAgICB0aGlzLmluaXRXYXRjaGVycygpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXRRdWFsaWZpZWROYW1lICgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLm5hbWUpIHtcbiAgICAgIGxldCBuYW1lID0gdGhpcy5vcHRpb25zLm5hbWVcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2NvcGUgJiYgdGhpcy5vcHRpb25zLnNjb3BlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgIG5hbWUgPSB0aGlzLm9wdGlvbnMuc2NvcGUuY29uc3RydWN0b3IubmFtZSArICcuJyArIG5hbWVcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYW1lXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZyAoKSB7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMuZ2V0UXVhbGlmaWVkTmFtZSgpXG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHJldHVybiBgW1Byb3BlcnR5ICR7bmFtZX1dYFxuICAgIH1cbiAgICByZXR1cm4gJ1tQcm9wZXJ0eV0nXG4gIH1cblxuICBpbml0V2F0Y2hlcnMgKCkge1xuICAgIHRoaXMuc2V0dGVyLmxvYWRJbnRlcm5hbFdhdGNoZXIoKVxuICB9XG5cbiAgbWFrZUdldHRlciAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmdldHRlciA9IG5ldyBNYW51YWxHZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsICYmIHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuZ2V0dGVyID0gbmV3IENvbXBvc2l0ZUdldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICgodGhpcy5vcHRpb25zLmNhbGN1bC5uYlBhcmFtcyB8fCB0aGlzLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCkgPT09IDApIHtcbiAgICAgICAgdGhpcy5nZXR0ZXIgPSBuZXcgQ2FsY3VsYXRlZEdldHRlcih0aGlzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5nZXR0ZXIgPSBuZXcgSW52YWxpZGF0ZWRHZXR0ZXIodGhpcylcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZXR0ZXIgPSBuZXcgU2ltcGxlR2V0dGVyKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgbWFrZVNldHRlciAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuc2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnNldHRlciA9IG5ldyBNYW51YWxTZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwgJiYgdGhpcy5vcHRpb25zLmNvbGxlY3Rpb24gIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnNldHRlciA9IG5ldyBDb2xsZWN0aW9uU2V0dGVyKHRoaXMpXG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuY29tcG9zZWQgIT0gbnVsbCAmJiB0aGlzLm9wdGlvbnMuY29tcG9zZWQgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnNldHRlciA9IG5ldyBCYXNlVmFsdWVTZXR0ZXIodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXR0ZXIgPSBuZXcgU2ltcGxlU2V0dGVyKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7UHJvcGVydHk8VD59XG4gICAqL1xuICBjb3B5V2l0aCAob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpKVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtUfVxuICAgKi9cbiAgZ2V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXR0ZXIuZ2V0KClcbiAgfVxuXG4gIGludmFsaWRhdGUgKGNvbnRleHQpIHtcbiAgICB0aGlzLmdldHRlci5pbnZhbGlkYXRlKGNvbnRleHQpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKGNvbnRleHQpIHtcbiAgICB0aGlzLmdldHRlci51bmtub3duKGNvbnRleHQpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldCAodmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGVyLnNldCh2YWwpXG4gIH1cblxuICBjcmVhdGVTY29wZUdldHRlclNldHRlcnMgKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc2NvcGUpIHtcbiAgICAgIGNvbnN0IHByb3AgPSB0aGlzXG4gICAgICBsZXQgb3B0ID0ge31cbiAgICAgIG9wdFt0aGlzLm9wdGlvbnMubmFtZSArICdQcm9wZXJ0eSddID0ge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvcHQgPSB0aGlzLmdldHRlci5nZXRTY29wZUdldHRlclNldHRlcnMob3B0KVxuICAgICAgb3B0ID0gdGhpcy5zZXR0ZXIuZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzKG9wdClcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMub3B0aW9ucy5zY29wZSwgb3B0KVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZXN0cm95ID09PSB0cnVlICYmIHRoaXMudmFsdWUgIT0gbnVsbCAmJiB0aGlzLnZhbHVlLmRlc3Ryb3kgIT0gbnVsbCkge1xuICAgICAgdGhpcy52YWx1ZS5kZXN0cm95KClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5jYWxsT3B0aW9uRnVuY3QoJ2Rlc3Ryb3knLCB0aGlzLnZhbHVlKVxuICAgIH1cbiAgICB0aGlzLmdldHRlci5kZXN0cm95KClcbiAgICB0aGlzLnZhbHVlID0gbnVsbFxuICB9XG5cbiAgY2FsbE9wdGlvbkZ1bmN0IChmdW5jdCwgLi4uYXJncykge1xuICAgIGlmICh0eXBlb2YgZnVuY3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICBmdW5jdCA9IHRoaXMub3B0aW9uc1tmdW5jdF1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0LmFwcGx5KHRoaXMub3B0aW9ucy5zY29wZSB8fCB0aGlzLCBhcmdzKVxuICB9XG59XG5cblByb3BlcnR5LmRlZmF1bHRPcHRpb25zID0ge1xuICBFdmVudEVtaXR0ZXJDbGFzczogRXZlbnRFbWl0dGVyLFxuICBpbml0V2F0Y2hlcnM6IHRydWVcbn1cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlcbiIsIlxuY2xhc3MgQmFzZUdldHRlciB7XG4gIGNvbnN0cnVjdG9yIChwcm9wKSB7XG4gICAgdGhpcy5wcm9wID0gcHJvcFxuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2VcbiAgICB0aGlzLmluaXRpYXRlZCA9IGZhbHNlXG4gICAgdGhpcy5pbnZhbGlkYXRlZCA9IGZhbHNlXG4gIH1cblxuICBnZXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIG91dHB1dCAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdvdXRwdXQnLCB0aGlzLnByb3AudmFsdWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3AudmFsdWVcbiAgICB9XG4gIH1cblxuICByZXZhbGlkYXRlZCAoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZVxuICAgIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZVxuICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB1bmtub3duIChjb250ZXh0KSB7XG4gICAgaWYgKCF0aGlzLmludmFsaWRhdGVkKSB7XG4gICAgICB0aGlzLmludmFsaWRhdGVkID0gdHJ1ZVxuICAgICAgdGhpcy5pbnZhbGlkYXRlTm90aWNlKGNvbnRleHQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbnZhbGlkYXRlIChjb250ZXh0KSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2VcbiAgICBpZiAoIXRoaXMuaW52YWxpZGF0ZWQpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQgPSB0cnVlXG4gICAgICB0aGlzLmludmFsaWRhdGVOb3RpY2UoY29udGV4dClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGludmFsaWRhdGVOb3RpY2UgKGNvbnRleHQpIHtcbiAgICBjb250ZXh0ID0gY29udGV4dCB8fCB7IG9yaWdpbjogdGhpcy5wcm9wIH1cbiAgICB0aGlzLnByb3AuZXZlbnRzLmVtaXQoJ2ludmFsaWRhdGVkJywgY29udGV4dClcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5RGVzY3JpcHRvck1hcH0gb3B0XG4gICAqIEByZXR1cm4ge1Byb3BlcnR5RGVzY3JpcHRvck1hcH1cbiAgICovXG4gIGdldFNjb3BlR2V0dGVyU2V0dGVycyAob3B0KSB7XG4gICAgY29uc3QgcHJvcCA9IHRoaXMucHJvcFxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXSA9IG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXSB8fCB7fVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcHJvcC5nZXQoKVxuICAgIH1cbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0uZW51bWVyYWJsZSA9IHRydWVcbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0uY29uZmlndXJhYmxlID0gdHJ1ZVxuICAgIHJldHVybiBvcHRcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUdldHRlclxuIiwiXG5jb25zdCBCYXNlR2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlR2V0dGVyJylcblxuY2xhc3MgQ2FsY3VsYXRlZEdldHRlciBleHRlbmRzIEJhc2VHZXR0ZXIge1xuICBnZXQgKCkge1xuICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICBjb25zdCBvbGQgPSB0aGlzLnByb3AudmFsdWVcbiAgICAgIGNvbnN0IGluaXRpYXRlZCA9IHRoaXMuaW5pdGlhdGVkXG4gICAgICB0aGlzLmNhbGN1bCgpXG4gICAgICBpZiAoIWluaXRpYXRlZCkge1xuICAgICAgICB0aGlzLnByb3AuZXZlbnRzLmVtaXQoJ3VwZGF0ZWQnLCBvbGQpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcC5zZXR0ZXIuY2hlY2tDaGFuZ2VzKHRoaXMucHJvcC52YWx1ZSwgb2xkKSkge1xuICAgICAgICB0aGlzLnByb3Auc2V0dGVyLmNoYW5nZWQob2xkKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQoKVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ2NhbGN1bCcpKVxuICAgIHRoaXMucHJvcC5tYW51YWwgPSBmYWxzZVxuICAgIHRoaXMucmV2YWxpZGF0ZWQoKVxuICAgIHJldHVybiB0aGlzLnByb3AudmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGN1bGF0ZWRHZXR0ZXJcbiIsImNvbnN0IEludmFsaWRhdGVkR2V0dGVyID0gcmVxdWlyZSgnLi9JbnZhbGlkYXRlZEdldHRlcicpXG5jb25zdCBDb2xsZWN0aW9uID0gcmVxdWlyZSgnc3BhcmstY29sbGVjdGlvbicpXG5jb25zdCBJbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJylcbmNvbnN0IFJlZmVyZW5jZSA9IHJlcXVpcmUoJ3NwYXJrLWJpbmRpbmcnKS5SZWZlcmVuY2VcblxuY2xhc3MgQ29tcG9zaXRlR2V0dGVyIGV4dGVuZHMgSW52YWxpZGF0ZWRHZXR0ZXIge1xuICBpbml0ICgpIHtcbiAgICBzdXBlci5pbml0KClcbiAgICBpZiAodGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmJhc2VWYWx1ZSA9IHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZShudWxsKVxuICAgICAgdGhpcy5iYXNlVmFsdWUgPSBudWxsXG4gICAgfVxuICAgIHRoaXMubWVtYmVycyA9IG5ldyBDb21wb3NpdGVHZXR0ZXIuTWVtYmVycyh0aGlzLnByb3Aub3B0aW9ucy5tZW1iZXJzKVxuICAgIGlmICh0aGlzLnByb3Aub3B0aW9ucy5jYWxjdWwgIT0gbnVsbCkge1xuICAgICAgdGhpcy5tZW1iZXJzLnVuc2hpZnQoKHByZXYsIGludmFsaWRhdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3Aub3B0aW9ucy5jYWxjdWwuYmluZCh0aGlzLnByb3Aub3B0aW9ucy5zY29wZSkoaW52YWxpZGF0b3IpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLm1lbWJlcnMuY2hhbmdlZCA9IChvbGQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKVxuICAgIH1cbiAgICB0aGlzLnByb3AubWVtYmVycyA9IHRoaXMubWVtYmVyc1xuICAgIHRoaXMuam9pbiA9IHRoaXMuZ3Vlc3NKb2luRnVuY3Rpb24oKVxuICB9XG5cbiAgZ3Vlc3NKb2luRnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3Aub3B0aW9ucy5jb21wb3NlZFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkID09PSAnc3RyaW5nJyAmJiBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9uc1t0aGlzLnByb3Aub3B0aW9ucy5jb21wb3NlZF0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zW3RoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkXVxuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wLm9wdGlvbnMuY29sbGVjdGlvbiAhPSBudWxsICYmIHRoaXMucHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gIT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMuY29uY2F0XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3Aub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zLm9yXG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3Aub3B0aW9ucy5kZWZhdWx0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMuYW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9ucy5sYXN0XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICBpZiAodGhpcy5tZW1iZXJzLmxlbmd0aCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcy5wcm9wLCB0aGlzLnByb3Aub3B0aW9ucy5zY29wZSlcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLm1lbWJlcnMucmVkdWNlKChwcmV2LCBtZW1iZXIpID0+IHtcbiAgICAgICAgICB2YXIgdmFsXG4gICAgICAgICAgdmFsID0gdHlwZW9mIG1lbWJlciA9PT0gJ2Z1bmN0aW9uJyA/IG1lbWJlcihwcmV2LCB0aGlzLmludmFsaWRhdG9yKSA6IG1lbWJlclxuICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4ocHJldiwgdmFsKVxuICAgICAgICB9LCB0aGlzLmJhc2VWYWx1ZSkpXG4gICAgICAgIGRvbmUoKVxuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG51bGxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnZhbGlkYXRvci5iaW5kKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLmJhc2VWYWx1ZSlcbiAgICB9XG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfSBvcHRcbiAgICogQHJldHVybiB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfVxuICAgKi9cbiAgZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzIChvcHQpIHtcbiAgICBvcHQgPSBzdXBlci5nZXRTY29wZUdldHRlclNldHRlcnMob3B0KVxuICAgIGNvbnN0IG1lbWJlcnMgPSB0aGlzLm1lbWJlcnNcbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZSArICdNZW1iZXJzJ10gPSB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG1lbWJlcnNcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9wdFxuICB9XG59XG5cbkNvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zID0ge1xuICBhbmQ6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYlxuICB9LFxuICBvcjogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYSB8fCBiXG4gIH0sXG4gIGxhc3Q6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGJcbiAgfSxcbiAgc3VtOiBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhICsgYlxuICB9LFxuICBjb25jYXQ6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEgPT0gbnVsbCkge1xuICAgICAgYSA9IFtdXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhLnRvQXJyYXkgIT0gbnVsbCkge1xuICAgICAgICBhID0gYS50b0FycmF5KClcbiAgICAgIH1cbiAgICAgIGlmIChhLmNvbmNhdCA9PSBudWxsKSB7XG4gICAgICAgIGEgPSBbYV1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGIgPT0gbnVsbCkge1xuICAgICAgYiA9IFtdXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChiLnRvQXJyYXkgIT0gbnVsbCkge1xuICAgICAgICBiID0gYi50b0FycmF5KClcbiAgICAgIH1cbiAgICAgIGlmIChiLmNvbmNhdCA9PSBudWxsKSB7XG4gICAgICAgIGIgPSBbYl1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGEuY29uY2F0KGIpXG4gIH1cbn1cblxuQ29tcG9zaXRlR2V0dGVyLk1lbWJlcnMgPSBjbGFzcyBNZW1iZXJzIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGFkZFByb3BlcnR5IChwcm9wKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG51bGwsIHByb3ApID09PSAtMSkge1xuICAgICAgdGhpcy5wdXNoKFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHByb3ApXG4gICAgICB9LCB7XG4gICAgICAgIHByb3A6IHByb3BcbiAgICAgIH0pKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYWRkUHJvcGVydHlQYXRoIChuYW1lLCBvYmopIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMucHVzaChSZWZlcmVuY2UubWFrZVJlZmVycmVkKGZ1bmN0aW9uIChwcmV2LCBpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgobmFtZSwgb2JqKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBvYmo6IG9ialxuICAgICAgfSkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICByZW1vdmVQcm9wZXJ0eSAocHJvcCkge1xuICAgIHRoaXMucmVtb3ZlUmVmKHsgcHJvcDogcHJvcCB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZGRWYWx1ZVJlZiAodmFsLCBkYXRhKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KGRhdGEpID09PSAtMSkge1xuICAgICAgY29uc3QgZm4gPSBSZWZlcmVuY2UubWFrZVJlZmVycmVkKGZ1bmN0aW9uIChwcmV2LCBpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdmFsXG4gICAgICB9LCBkYXRhKVxuICAgICAgZm4udmFsID0gdmFsXG4gICAgICB0aGlzLnB1c2goZm4pXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRWYWx1ZVJlZiAodmFsLCBkYXRhKSB7XG4gICAgY29uc3QgaSA9IHRoaXMuZmluZFJlZkluZGV4KGRhdGEpXG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICB0aGlzLmFkZFZhbHVlUmVmKHZhbCwgZGF0YSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0KGkpLnZhbCAhPT0gdmFsKSB7XG4gICAgICBjb25zdCBmbiA9IFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0sIGRhdGEpXG4gICAgICBmbi52YWwgPSB2YWxcbiAgICAgIHRoaXMuc2V0KGksIGZuKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0VmFsdWVSZWYgKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kQnlSZWYoZGF0YSkudmFsXG4gIH1cblxuICBhZGRGdW5jdGlvblJlZiAoZm4sIGRhdGEpIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgoZGF0YSkgPT09IC0xKSB7XG4gICAgICBmbiA9IFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZm4sIGRhdGEpXG4gICAgICB0aGlzLnB1c2goZm4pXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBmaW5kQnlSZWYgKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbdGhpcy5maW5kUmVmSW5kZXgoZGF0YSldXG4gIH1cblxuICBmaW5kUmVmSW5kZXggKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uIChtZW1iZXIpIHtcbiAgICAgIHJldHVybiAobWVtYmVyLnJlZiAhPSBudWxsKSAmJiBtZW1iZXIucmVmLmNvbXBhcmVEYXRhKGRhdGEpXG4gICAgfSlcbiAgfVxuXG4gIHJlbW92ZVJlZiAoZGF0YSkge1xuICAgIHZhciBpbmRleCwgb2xkXG4gICAgaW5kZXggPSB0aGlzLmZpbmRSZWZJbmRleChkYXRhKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9zaXRlR2V0dGVyXG4iLCJjb25zdCBJbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJylcbmNvbnN0IENhbGN1bGF0ZWRHZXR0ZXIgPSByZXF1aXJlKCcuL0NhbGN1bGF0ZWRHZXR0ZXInKVxuXG5jbGFzcyBJbnZhbGlkYXRlZEdldHRlciBleHRlbmRzIENhbGN1bGF0ZWRHZXR0ZXIge1xuICBnZXQgKCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZ2V0KClcbiAgfVxuXG4gIGNhbGN1bCAoKSB7XG4gICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMucHJvcCwgdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUpXG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgIHRoaXMucHJvcC5zZXR0ZXIuc2V0UmF3VmFsdWUodGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnY2FsY3VsJywgaW52YWxpZGF0b3IpKVxuICAgICAgdGhpcy5wcm9wLm1hbnVhbCA9IGZhbHNlXG4gICAgICBkb25lKClcbiAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG51bGxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGludmFsaWRhdG9yLmJpbmQoKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxuXG4gIGludmFsaWRhdGUgKGNvbnRleHQpIHtcbiAgICBzdXBlci5pbnZhbGlkYXRlKGNvbnRleHQpXG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQgJiYgdGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkR2V0dGVyXG4iLCJjb25zdCBCYXNlR2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlR2V0dGVyJylcblxuY2xhc3MgTWFudWFsR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdnZXQnKSlcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgdGhpcy5pbml0aWF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnVhbEdldHRlclxuIiwiY29uc3QgQmFzZUdldHRlciA9IHJlcXVpcmUoJy4vQmFzZUdldHRlcicpXG5cbmNsYXNzIFNpbXBsZUdldHRlciBleHRlbmRzIEJhc2VHZXR0ZXIge1xuICBnZXQgKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWVcbiAgICBpZiAoIXRoaXMuaW5pdGlhdGVkKSB7XG4gICAgICB0aGlzLmluaXRpYXRlZCA9IHRydWVcbiAgICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgndXBkYXRlZCcpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLm91dHB1dCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVHZXR0ZXJcbiIsIlxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnLi4vd2F0Y2hlcnMvUHJvcGVydHlXYXRjaGVyJylcblxuY2xhc3MgQmFzZVNldHRlciB7XG4gIGNvbnN0cnVjdG9yIChwcm9wKSB7XG4gICAgdGhpcy5wcm9wID0gcHJvcFxuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgdGhpcy5zZXREZWZhdWx0VmFsdWUoKVxuICB9XG5cbiAgc2V0RGVmYXVsdFZhbHVlICgpIHtcbiAgICB0aGlzLnNldFJhd1ZhbHVlKHRoaXMuaW5nZXN0KHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQpKVxuICB9XG5cbiAgbG9hZEludGVybmFsV2F0Y2hlciAoKSB7XG4gICAgY29uc3QgY2hhbmdlT3B0ID0gdGhpcy5wcm9wLm9wdGlvbnMuY2hhbmdlXG4gICAgaWYgKHR5cGVvZiBjaGFuZ2VPcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMud2F0Y2hlciA9IG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wLFxuICAgICAgICBjYWxsYmFjazogY2hhbmdlT3B0LFxuICAgICAgICBzY29wZTogdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUsXG4gICAgICAgIGF1dG9CaW5kOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAoY2hhbmdlT3B0ICE9IG51bGwgJiYgdHlwZW9mIGNoYW5nZU9wdC5jb3B5V2l0aCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy53YXRjaGVyID0gY2hhbmdlT3B0LmNvcHlXaXRoKHtcbiAgICAgICAgcHJvcGVydHk6IHRoaXMucHJvcCxcbiAgICAgICAgc2NvcGU6IHRoaXMucHJvcC5vcHRpb25zLnNjb3BlLFxuICAgICAgICBhdXRvQmluZDogdHJ1ZVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud2F0Y2hlclxuICB9XG5cbiAgc2V0ICh2YWwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpXG4gIH1cblxuICBzZXRSYXdWYWx1ZSAodmFsKSB7XG4gICAgdGhpcy5wcm9wLnZhbHVlID0gdmFsXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG5cbiAgaW5nZXN0ICh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFsID0gdGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnaW5nZXN0JywgdmFsKVxuICAgIH1cbiAgICByZXR1cm4gdmFsXG4gIH1cblxuICBjaGVja0NoYW5nZXMgKHZhbCwgb2xkKSB7XG4gICAgcmV0dXJuIHZhbCAhPT0gb2xkXG4gIH1cblxuICBjaGFuZ2VkIChvbGQpIHtcbiAgICBjb25zdCBjb250ZXh0ID0geyBvcmlnaW46IHRoaXMucHJvcCB9XG4gICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCd1cGRhdGVkJywgb2xkLCBjb250ZXh0KVxuICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgnY2hhbmdlZCcsIG9sZCwgY29udGV4dClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfSBvcHRcbiAgICogQHJldHVybiB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfVxuICAgKi9cbiAgZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzIChvcHQpIHtcbiAgICBjb25zdCBwcm9wID0gdGhpcy5wcm9wXG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdID0gb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdIHx8IHt9XG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdLnNldCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiBwcm9wLnNldCh2YWwpXG4gICAgfVxuICAgIHJldHVybiBvcHRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VTZXR0ZXJcbiIsImNvbnN0IEJhc2VTZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VTZXR0ZXInKVxuXG5jbGFzcyBCYXNlVmFsdWVTZXR0ZXIgZXh0ZW5kcyBCYXNlU2V0dGVyIHtcbiAgc2V0ICh2YWwpIHtcbiAgICB2YWwgPSB0aGlzLmluZ2VzdCh2YWwpXG4gICAgaWYgKHRoaXMucHJvcC5nZXR0ZXIuYmFzZVZhbHVlICE9PSB2YWwpIHtcbiAgICAgIHRoaXMucHJvcC5nZXR0ZXIuYmFzZVZhbHVlID0gdmFsXG4gICAgICB0aGlzLnByb3AuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlVmFsdWVTZXR0ZXJcbiIsImNvbnN0IFNpbXBsZVNldHRlciA9IHJlcXVpcmUoJy4vU2ltcGxlU2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb24gPSByZXF1aXJlKCdzcGFyay1jb2xsZWN0aW9uJylcbmNvbnN0IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi93YXRjaGVycy9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyJylcblxuY2xhc3MgQ29sbGVjdGlvblNldHRlciBleHRlbmRzIFNpbXBsZVNldHRlciB7XG4gIGluaXQgKCkge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIENvbGxlY3Rpb25TZXR0ZXIuZGVmYXVsdE9wdGlvbnMsXG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ29iamVjdCcgPyB0aGlzLnByb3Aub3B0aW9ucy5jb2xsZWN0aW9uIDoge31cbiAgICApXG4gICAgc3VwZXIuaW5pdCgpXG4gIH1cblxuICBsb2FkSW50ZXJuYWxXYXRjaGVyICgpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuaXRlbUFkZGVkID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuaXRlbVJlbW92ZWQgPT09ICdmdW5jdGlvbidcbiAgICApIHtcbiAgICAgIHJldHVybiBuZXcgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3AsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLnByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgIG9uQWRkZWQ6IHRoaXMucHJvcC5vcHRpb25zLml0ZW1BZGRlZCxcbiAgICAgICAgb25SZW1vdmVkOiB0aGlzLnByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCxcbiAgICAgICAgc2NvcGU6IHRoaXMucHJvcC5vcHRpb25zLnNjb3BlLFxuICAgICAgICBhdXRvQmluZDogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIubG9hZEludGVybmFsV2F0Y2hlcigpXG4gICAgfVxuICB9XG5cbiAgc2V0UmF3VmFsdWUgKHZhbCkge1xuICAgIHRoaXMucHJvcC52YWx1ZSA9IHRoaXMubWFrZUNvbGxlY3Rpb24odmFsKVxuICAgIHJldHVybiB0aGlzLnByb3AudmFsdWVcbiAgfVxuXG4gIG1ha2VDb2xsZWN0aW9uICh2YWwpIHtcbiAgICB2YWwgPSB0aGlzLnZhbFRvQXJyYXkodmFsKVxuICAgIGNvbnN0IHByb3AgPSB0aGlzLnByb3BcbiAgICBjb25zdCBjb2wgPSBDb2xsZWN0aW9uLm5ld1N1YkNsYXNzKHRoaXMub3B0aW9ucywgdmFsKVxuICAgIGNvbC5jaGFuZ2VkID0gZnVuY3Rpb24gKG9sZCkge1xuICAgICAgcHJvcC5zZXR0ZXIuY2hhbmdlZChvbGQpXG4gICAgfVxuICAgIHJldHVybiBjb2xcbiAgfVxuXG4gIHZhbFRvQXJyYXkgKHZhbCkge1xuICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB2YWwudG9BcnJheSgpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwuc2xpY2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3ZhbF1cbiAgICB9XG4gIH1cblxuICBjaGVja0NoYW5nZXMgKHZhbCwgb2xkKSB7XG4gICAgdmFyIGNvbXBhcmVGdW5jdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNvbXBhcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IHRoaXMub3B0aW9ucy5jb21wYXJlXG4gICAgfVxuICAgIHJldHVybiAobmV3IENvbGxlY3Rpb24odmFsKSkuY2hlY2tDaGFuZ2VzKG9sZCwgdGhpcy5vcHRpb25zLm9yZGVyZWQsIGNvbXBhcmVGdW5jdGlvbilcbiAgfVxufVxuXG5Db2xsZWN0aW9uU2V0dGVyLmRlZmF1bHRPcHRpb25zID0ge1xuICBjb21wYXJlOiBmYWxzZSxcbiAgb3JkZXJlZDogdHJ1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25TZXR0ZXJcbiIsImNvbnN0IEJhc2VTZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VTZXR0ZXInKVxuXG5jbGFzcyBNYW51YWxTZXR0ZXIgZXh0ZW5kcyBCYXNlU2V0dGVyIHtcbiAgc2V0ICh2YWwpIHtcbiAgICB0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdzZXQnLCB2YWwpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYW51YWxTZXR0ZXJcbiIsImNvbnN0IEJhc2VTZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VTZXR0ZXInKVxuXG5jbGFzcyBTaW1wbGVTZXR0ZXIgZXh0ZW5kcyBCYXNlU2V0dGVyIHtcbiAgc2V0ICh2YWwpIHtcbiAgICB2YXIgb2xkXG4gICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKVxuICAgIHRoaXMucHJvcC5nZXR0ZXIucmV2YWxpZGF0ZWQoKVxuICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh2YWwsIHRoaXMucHJvcC52YWx1ZSkpIHtcbiAgICAgIG9sZCA9IHRoaXMucHJvcC52YWx1ZVxuICAgICAgdGhpcy5zZXRSYXdWYWx1ZSh2YWwpXG4gICAgICB0aGlzLnByb3AubWFudWFsID0gdHJ1ZVxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZVNldHRlclxuIiwiXG5jb25zdCBQcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5V2F0Y2hlcicpXG5cbmNsYXNzIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyAob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpXG4gICAgdGhpcy5vbkFkZGVkID0gb3B0aW9ucy5vbkFkZGVkXG4gICAgdGhpcy5vblJlbW92ZWQgPSBvcHRpb25zLm9uUmVtb3ZlZFxuICB9XG5cbiAgaGFuZGxlQ2hhbmdlICh2YWx1ZSwgb2xkKSB7XG4gICAgb2xkID0gdmFsdWUuY29weShvbGQgfHwgW10pXG4gICAgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgdmFsdWUsIG9sZClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCFvbGQuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vbkFkZGVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG9sZC5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgIGlmICghdmFsdWUuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vblJlbW92ZWQuY2FsbCh0aGlzLnNjb3BlLCBpdGVtKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXJcbiIsIlxuY29uc3QgQmluZGVyID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkJpbmRlclxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLlJlZmVyZW5jZVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmNsYXNzIFByb3BlcnR5V2F0Y2hlciBleHRlbmRzIEJpbmRlciB7XG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBQcm9wZXJ0eVdhdGNoZXJPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7aW1wb3J0KFwiLi9Qcm9wZXJ0eVwiKTxUPnxzdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oVCxUKX0gY2FsbGJhY2tcbiAgICogQHByb3BlcnR5IHtib29sZWFufSBbYXV0b0JpbmRdXG4gICAqIEBwcm9wZXJ0eSB7Kn0gW3Njb3BlXVxuICAgKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5V2F0Y2hlck9wdGlvbnN9IG9wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjayA9IChjb250ZXh0KSA9PiB7XG4gICAgICBpZiAodGhpcy52YWxpZENvbnRleHQoY29udGV4dCkpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy51cGRhdGVDYWxsYmFjayA9IChvbGQsIGNvbnRleHQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZhbGlkQ29udGV4dChjb250ZXh0KSkge1xuICAgICAgICB0aGlzLnVwZGF0ZShvbGQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyh0aGlzLm9wdGlvbnMpXG4gICAgfVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBsb2FkT3B0aW9ucyAob3B0aW9ucykge1xuICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlXG4gICAgdGhpcy5wcm9wZXJ0eSA9IG9wdGlvbnMucHJvcGVydHlcbiAgICB0aGlzLmNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFja1xuICAgIHRoaXMuYXV0b0JpbmQgPSBvcHRpb25zLmF1dG9CaW5kXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNvcHlXaXRoIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICBpZiAodGhpcy5hdXRvQmluZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKClcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0eSAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvcEJ5TmFtZSh0aGlzLnByb3BlcnR5KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eVxuICB9XG5cbiAgZ2V0UHJvcEJ5TmFtZSAocHJvcCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgIGlmICh0YXJnZXQucHJvcGVydGllc01hbmFnZXIgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eShwcm9wKVxuICAgIH0gZWxzZSBpZiAodGFyZ2V0W3Byb3AgKyAnUHJvcGVydHknXSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0W3Byb3AgKyAnUHJvcGVydHknXVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIHRoZSBwcm9wZXJ0eSAke3Byb3B9YClcbiAgICB9XG4gIH1cblxuICBjaGVja0JpbmQgKCkge1xuICAgIHJldHVybiB0aGlzLnRvZ2dsZUJpbmQodGhpcy5zaG91bGRCaW5kKCkpXG4gIH1cblxuICBzaG91bGRCaW5kICgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgY2FuQmluZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKSAhPSBudWxsXG4gIH1cblxuICBkb0JpbmQgKCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9uKCdpbnZhbGlkYXRlZCcsIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9uKCd1cGRhdGVkJywgdGhpcy51cGRhdGVDYWxsYmFjaylcbiAgfVxuXG4gIGRvVW5iaW5kICgpIHtcbiAgICB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9mZignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjaylcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpLmV2ZW50cy5vZmYoJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKVxuICB9XG5cbiAgZXF1YWxzICh3YXRjaGVyKSB7XG4gICAgcmV0dXJuIHdhdGNoZXIuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiZcbiAgICAgIHdhdGNoZXIgIT0gbnVsbCAmJlxuICAgICAgd2F0Y2hlci5ldmVudCA9PT0gdGhpcy5ldmVudCAmJlxuICAgICAgd2F0Y2hlci5nZXRQcm9wZXJ0eSgpID09PSB0aGlzLmdldFByb3BlcnR5KCkgJiZcbiAgICAgIFJlZmVyZW5jZS5jb21wYXJlVmFsKHdhdGNoZXIuY2FsbGJhY2ssIHRoaXMuY2FsbGJhY2spXG4gIH1cblxuICB2YWxpZENvbnRleHQgKGNvbnRleHQpIHtcbiAgICByZXR1cm4gY29udGV4dCA9PSBudWxsIHx8ICFjb250ZXh0LnByZXZlbnRJbW1lZGlhdGVcbiAgfVxuXG4gIGludmFsaWRhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KClcbiAgfVxuXG4gIHVwZGF0ZSAob2xkKSB7XG4gICAgdmFyIHZhbHVlXG4gICAgdmFsdWUgPSB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVDaGFuZ2UodmFsdWUsIG9sZClcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZSAodmFsdWUsIG9sZCkge1xuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgdmFsdWUsIG9sZClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0eVdhdGNoZXJcbiIsInZhciBFbGVtZW50LCBNaXhhYmxlLCBQcm9wZXJ0aWVzTWFuYWdlcjtcblxuUHJvcGVydGllc01hbmFnZXIgPSByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJykuUHJvcGVydGllc01hbmFnZXI7XG5cbk1peGFibGUgPSByZXF1aXJlKCcuL01peGFibGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFbGVtZW50IGV4dGVuZHMgTWl4YWJsZSB7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByb3BlcnRpZXNNYW5hZ2VyKGRhdGEpO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgICB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmluaXRXYXRjaGVycygpO1xuICAgIH1cblxuICAgIGluaXRQcm9wZXJ0aWVzTWFuYWdlcihkYXRhKSB7XG4gICAgICB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyID0gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci51c2VTY29wZSh0aGlzKTtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuaW5pdFByb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzKCk7XG4gICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5zZXRQcm9wZXJ0aWVzRGF0YShkYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0YXAobmFtZSkge1xuICAgICAgdmFyIGFyZ3M7XG4gICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBuYW1lLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9jYWxsYmFja3MgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9jYWxsYmFja3NbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXS5vd25lciA9IHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW25hbWVdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIFsncHJvcGVydGllc01hbmFnZXInXTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQucHJvcGVydGllc01hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciA9IHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlci5jb3B5V2l0aCh0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLnByb3BlcnRpZXNPcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eShwcm9wLCBkZXNjKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3RvdHlwZS5wcm9wZXJ0aWVzTWFuYWdlci53aXRoUHJvcGVydHkocHJvcCwgZGVzYyk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLnByb3BlcnRpZXNNYW5hZ2VyID0gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIuY29weVdpdGgocHJvcGVydGllcyk7XG4gICAgfVxuXG4gIH07XG5cbiAgRWxlbWVudC5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIgPSBuZXcgUHJvcGVydGllc01hbmFnZXIoKTtcblxuICByZXR1cm4gRWxlbWVudDtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbGVtZW50LmpzLm1hcFxuIiwidmFyIEFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlciwgSW52YWxpZGF0b3IsIFByb3BlcnR5V2F0Y2hlcjtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJykuSW52YWxpZGF0b3I7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgUHJvcGVydHlXYXRjaGVyIHtcbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZSA9IG9wdGlvbnMuYWN0aXZlO1xuICB9XG5cbiAgc2hvdWxkQmluZCgpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGlmICh0aGlzLmFjdGl2ZSAhPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IuY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICAgIGFjdGl2ZSA9IHRoaXMuYWN0aXZlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcy5tYXBcbiIsInZhciBJbnZhbGlkYXRlZCwgSW52YWxpZGF0b3I7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLkludmFsaWRhdG9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkID0gY2xhc3MgSW52YWxpZGF0ZWQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKCEoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuaW5pdEJ5TG9hZGVyIDogdm9pZCAwKSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVua25vd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMuc2NvcGUpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICB0aGlzLmhhbmRsZVVwZGF0ZSh0aGlzLmludmFsaWRhdG9yKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGhhbmRsZVVwZGF0ZShpbnZhbGlkYXRvcikge1xuICAgIGlmICh0aGlzLnNjb3BlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgaW52YWxpZGF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhpbnZhbGlkYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMubWFwXG4iLCJ2YXIgTG9hZGVyLCBPdmVycmlkZXI7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBMb2FkZXIgZXh0ZW5kcyBPdmVycmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH1cblxuICAgIGluaXRQcmVsb2FkZWQoKSB7XG4gICAgICB2YXIgZGVmTGlzdDtcbiAgICAgIGRlZkxpc3QgPSB0aGlzLnByZWxvYWRlZDtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gW107XG4gICAgICByZXR1cm4gdGhpcy5sb2FkKGRlZkxpc3QpO1xuICAgIH1cblxuICAgIGxvYWQoZGVmTGlzdCkge1xuICAgICAgdmFyIGxvYWRlZCwgdG9Mb2FkO1xuICAgICAgdG9Mb2FkID0gW107XG4gICAgICBsb2FkZWQgPSBkZWZMaXN0Lm1hcCgoZGVmKSA9PiB7XG4gICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgaWYgKGRlZi5pbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBsb2FkZXI6IHRoaXNcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGluc3RhbmNlID0gTG9hZGVyLmxvYWQoZGVmKTtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaWYgKGRlZi5pbml0QnlMb2FkZXIgJiYgKGluc3RhbmNlLmluaXQgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHRvTG9hZC5wdXNoKGluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSB0aGlzLnByZWxvYWRlZC5jb25jYXQobG9hZGVkKTtcbiAgICAgIHJldHVybiB0b0xvYWQuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlbG9hZChkZWYpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkZWYpKSB7XG4gICAgICAgIGRlZiA9IFtkZWZdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkID0gKHRoaXMucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQoZGVmKTtcbiAgICB9XG5cbiAgICBkZXN0cm95TG9hZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkLmZvckVhY2goZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHJldHVybiAocmVmID0gZGVmLmluc3RhbmNlKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGVzdHJveSgpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldEZpbmFsUHJvcGVydGllcygpLmNvbmNhdChbJ3ByZWxvYWRlZCddKTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIHN1cGVyLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICBpZiAodGhpcy5wcmVsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkZWQgPSAodGFyZ2V0LnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KHRoaXMucHJlbG9hZGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZE1hbnkoZGVmKSB7XG4gICAgICByZXR1cm4gZGVmLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkKGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWQoZGVmKSB7XG4gICAgICBpZiAodHlwZW9mIGRlZi50eXBlLmNvcHlXaXRoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGRlZi50eXBlLmNvcHlXaXRoKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IGRlZi50eXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHByZWxvYWQoZGVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJlbG9hZChkZWYpO1xuICAgIH1cblxuICB9O1xuXG4gIExvYWRlci5wcm90b3R5cGUucHJlbG9hZGVkID0gW107XG5cbiAgTG9hZGVyLm92ZXJyaWRlcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmluaXQud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveUxvYWRlZCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIExvYWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Mb2FkZXIuanMubWFwXG4iLCJ2YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuXG4gIH07XG5cbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZU9uY2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKHNvdXJjZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uoc291cmNlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLCBwcm9wLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmdldEV4dGVuc2lvblByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3AgPSByZWZbaV07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgcHJvcCk7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAmJiB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzID0gdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLmNhbGwodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgfHwgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InLCAnZ2V0RmluYWxQcm9wZXJ0aWVzJ10sXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBhbHdheXNGaW5hbCwgcHJvcHMsIHRhcmdldENoYWluO1xuICAgICAgYWx3YXlzRmluYWwgPSB0aGlzLmFsd2F5c0ZpbmFsO1xuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XG4gICAgICBwcm9wcyA9IFtdO1xuICAgICAgdGhpcy5nZXRQcm90b3R5cGVDaGFpbihzb3VyY2UpLmV2ZXJ5KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgZXhjbHVkZTtcbiAgICAgICAgaWYgKCF0YXJnZXRDaGFpbi5pbmNsdWRlcyhvYmopKSB7XG4gICAgICAgICAgZXhjbHVkZSA9IGFsd2F5c0ZpbmFsO1xuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KFtcImxlbmd0aFwiLCBcInByb3RvdHlwZVwiLCBcIm5hbWVcIl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIiAmJiBpbmRleE9mLmNhbGwoZXhjbHVkZSwga2V5KSA8IDAgJiYgIXByb3BzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBrZXk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgIHByb3AubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSxcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgYmFzZVByb3RvdHlwZSwgY2hhaW47XG4gICAgICBjaGFpbiA9IFtdO1xuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hhaW4ucHVzaChvYmopO1xuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTWl4YWJsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NaXhhYmxlLmpzLm1hcFxuIiwiLy8gdG9kbyA6IFxuLy8gIHNpbXBsaWZpZWQgZm9ybSA6IEB3aXRob3V0TmFtZSBtZXRob2RcbnZhciBPdmVycmlkZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAodGhpcy5fb3ZlcnJpZGVzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFsnX292ZXJyaWRlcyddLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLl9vdmVycmlkZXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT3ZlcnJpZGVyLk92ZXJyaWRlID0ge1xuICAgIG1ha2VNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIgZm4sIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgZm4gPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIGZuKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIGFwcGx5TWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgb3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgb3ZlcnJpZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFwcGx5KHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgZm5OYW1lLCBmbikge1xuICAgICAgdmFyIG92ZXJyaWRlO1xuICAgICAgb3ZlcnJpZGUgPSB7XG4gICAgICAgIGZuOiB7XG4gICAgICAgICAgY3VycmVudDogZm5cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogZm5OYW1lXG4gICAgICB9O1xuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGgnICsgbmFtZXNwYWNlXSA9IGZuO1xuICAgICAgcmV0dXJuIG92ZXJyaWRlO1xuICAgIH0sXG4gICAgZW1wdHlGbjogZnVuY3Rpb24oKSB7fSxcbiAgICBhcHBseTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSB7XG4gICAgICB2YXIgZm5OYW1lLCBvdmVycmlkZXMsIHJlZiwgcmVmMSwgd2l0aG91dDtcbiAgICAgIGZuTmFtZSA9IG92ZXJyaWRlLm5hbWU7XG4gICAgICBvdmVycmlkZXMgPSB0YXJnZXQuX292ZXJyaWRlcyAhPSBudWxsID8gT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0Ll9vdmVycmlkZXMpIDoge307XG4gICAgICB3aXRob3V0ID0gKChyZWYgPSB0YXJnZXQuX292ZXJyaWRlcykgIT0gbnVsbCA/IChyZWYxID0gcmVmW2ZuTmFtZV0pICE9IG51bGwgPyByZWYxLmZuLmN1cnJlbnQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IHRhcmdldFtmbk5hbWVdO1xuICAgICAgb3ZlcnJpZGUgPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZSk7XG4gICAgICBpZiAob3ZlcnJpZGVzW2ZuTmFtZV0gIT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlc1tmbk5hbWVdLmZuLCBvdmVycmlkZS5mbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH1cbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRob3V0JyArIG5hbWVzcGFjZV0gPSB3aXRob3V0IHx8IHRoaXMuZW1wdHlGbjtcbiAgICAgIGlmICh3aXRob3V0ID09IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQgPSAnd2l0aG91dCcgKyBuYW1lc3BhY2U7XG4gICAgICB9IGVsc2UgaWYgKG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0KSB7XG4gICAgICAgIG92ZXJyaWRlLmZuW292ZXJyaWRlLm1pc3NpbmdXaXRob3V0XSA9IHdpdGhvdXQ7XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBmbk5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaW5hbEZuLCBmbiwga2V5LCByZWYyO1xuICAgICAgICAgIGZpbmFsRm4gPSBvdmVycmlkZS5mbi5jdXJyZW50LmJpbmQodGhpcyk7XG4gICAgICAgICAgcmVmMiA9IG92ZXJyaWRlLmZuO1xuICAgICAgICAgIGZvciAoa2V5IGluIHJlZjIpIHtcbiAgICAgICAgICAgIGZuID0gcmVmMltrZXldO1xuICAgICAgICAgICAgZmluYWxGbltrZXldID0gZm4uYmluZCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZm5OYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiBmaW5hbEZuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZpbmFsRm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3ZlcnJpZGVzW2ZuTmFtZV0gPSBvdmVycmlkZTtcbiAgICAgIHJldHVybiB0YXJnZXQuX292ZXJyaWRlcyA9IG92ZXJyaWRlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE92ZXJyaWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBVcGRhdGVyO1xuXG5CaW5kZXIgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuQmluZGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciByZWY7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmNhbGxiYWNrIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZENhbGxiYWNrKG9wdGlvbnMuY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IChyZWYgPSBvcHRpb25zLmNhbGxiYWNrcykgIT0gbnVsbCA/IHJlZi5mb3JFYWNoIDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIHRoaXMucnVuQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBydW5DYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVwZGF0aW5nICYmICF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIG5leHRUaWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgIGlmICghdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubmV4dC5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMubmV4dCA9IFtdO1xuICB9XG5cbn07XG5cblVwZGF0ZXIuQmluZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgY2xhc3MgQmluZGVyIGV4dGVuZHMgc3VwZXJDbGFzcyB7XG4gICAgY29uc3RydWN0b3IodGFyZ2V0LCBjYWxsYmFjazEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjazE7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZG9CaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZENhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUNhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBCaW5kZXI7XG5cbn0pLmNhbGwodGhpcywgQmluZGVyKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9VcGRhdGVyLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiRWxlbWVudFwiOiByZXF1aXJlKFwiLi9FbGVtZW50XCIpLFxuICBcIkxvYWRlclwiOiByZXF1aXJlKFwiLi9Mb2FkZXJcIiksXG4gIFwiTWl4YWJsZVwiOiByZXF1aXJlKFwiLi9NaXhhYmxlXCIpLFxuICBcIk92ZXJyaWRlclwiOiByZXF1aXJlKFwiLi9PdmVycmlkZXJcIiksXG4gIFwiVXBkYXRlclwiOiByZXF1aXJlKFwiLi9VcGRhdGVyXCIpLFxuICBcIkludmFsaWRhdGVkXCI6IHtcbiAgICBcIkFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXJcIiksXG4gICAgXCJJbnZhbGlkYXRlZFwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZFwiKSxcbiAgfSxcbn0iLCJ2YXIgbGlicztcblxubGlicyA9IHJlcXVpcmUoJy4vbGlicycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAnQ29sbGVjdGlvbic6IHJlcXVpcmUoJ3NwYXJrLWNvbGxlY3Rpb24nKVxufSwgbGlicywgcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLCByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL3NwYXJrLXN0YXJ0ZXIuanMubWFwXG4iXX0=
