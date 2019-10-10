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

},{"./GridCell":2,"./GridRow":3,"spark-starter":99}],2:[function(require,module,exports){
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

},{"spark-starter":99}],3:[function(require,module,exports){
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

},{"./GridCell":2,"spark-starter":99}],4:[function(require,module,exports){
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
},{"spark-starter":99}],6:[function(require,module,exports){
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

},{"./Direction":9,"spark-starter":99}],11:[function(require,module,exports){
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

},{"./TileReference":12,"spark-starter":99}],12:[function(require,module,exports){
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

},{"spark-starter":99}],14:[function(require,module,exports){
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
            return this.elapsedTimeProperty.invalidate();
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

},{"_process":66,"spark-starter":99,"timers":67}],16:[function(require,module,exports){
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

},{"./SignalOperation":18,"spark-starter":99}],17:[function(require,module,exports){
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

},{"spark-starter":99}],18:[function(require,module,exports){
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

},{"spark-starter":99}],19:[function(require,module,exports){
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
var Airlock, Tile;

Tile = require('parallelio-tiles').Tile;

module.exports = Airlock = (function() {
  class Airlock extends Tile {
    attachTo(airlock) {
      return this.attachedTo = airlock;
    }

  };

  Airlock.properties({
    direction: {},
    attachedTo: {}
  });

  return Airlock;

}).call(this);



},{"parallelio-tiles":14}],24:[function(require,module,exports){
var Approach, Element, Timing;

Element = require('spark-starter').Element;

Timing = require('parallelio-timing');

module.exports = Approach = (function() {
  class Approach extends Element {
    start(location) {
      if (this.valid) {
        this.moving = true;
        this.subject.xMembers.addPropertyRef('position.offsetX', this);
        this.subject.yMembers.addPropertyRef('position.offsetY', this);
        return this.timeout = this.timing.setTimeout(() => {
          return this.done();
        }, this.duration);
      }
    }

    done() {
      this.subject.xMembers.removeRef('position.offsetX', this);
      this.subject.yMembers.removeRef('position.offsetY', this);
      this.subject.x = this.targetPos.x;
      this.subject.y = this.targetPos.x;
      this.subjectAirlock.attachTo(targetAirlock);
      this.moving = false;
      return this.complete = true;
    }

  };

  Approach.properties({
    timing: {
      calcul: function() {
        return new Timing();
      }
    },
    initialDist: {
      default: 500
    },
    rng: {
      default: Math.random
    },
    angle: {
      calcul: function() {
        return this.rng * Math.PI * 2;
      }
    },
    startingPos: {
      calcul: function() {
        return {
          x: this.startingPos.x + this.initialDist * Math.cos(this.angle),
          y: this.startingPos.y + this.initialDist * Math.sin(this.angle)
        };
      }
    },
    targetPos: {
      calcul: function() {
        return {
          x: this.targetAirlock.x - this.subjectAirlock.x,
          y: this.targetAirlock.y - this.subjectAirlock.y
        };
      }
    },
    subject: {},
    target: {},
    subjectAirlock: {
      calcul: function() {
        var airlocks;
        airlocks = this.subject.airlocks.slice();
        airlocks.sort((a, b) => {
          var valA, valB;
          valA = Math.abs(a.direction.x - Math.cos(this.angle)) + Math.abs(a.direction.y - Math.sin(this.angle));
          valB = Math.abs(b.direction.x - Math.cos(this.angle)) + Math.abs(b.direction.y - Math.sin(this.angle));
          return valA - valB;
        });
        return airlocks[0];
      }
    },
    targetAirlock: {
      calcul: function() {
        return this.target.airlocks.find((target) => {
          return target.direction.getInverse() === this.subjectAirlock.direction;
        });
      }
    },
    moving: {
      default: false
    },
    complete: {
      default: false
    },
    currentPos: {
      calcul: function(invalidator) {
        var end, prc, start;
        start = invalidator.prop(this.startingPosProperty);
        end = invalidator.prop(this.targetPosProperty);
        prc = invalidator.propPath("timeout.prc") || 0;
        return {
          x: (end.x - start.x) * prc + start.x,
          y: (end.y - start.y) * prc + start.y
        };
      }
    },
    duration: {
      default: 10000
    },
    timeout: {}
  });

  return Approach;

}).call(this);



},{"parallelio-timing":15,"spark-starter":99}],25:[function(require,module,exports){
var AutomaticDoor, Character, Door;

Door = require('./Door');

Character = require('./Character');

module.exports = AutomaticDoor = (function() {
  class AutomaticDoor extends Door {
    updateTileMembers(old) {
      var ref, ref1, ref2, ref3;
      if (old != null) {
        if ((ref = old.walkableMembers) != null) {
          ref.removeProperty(this.unlockedProperty);
        }
        if ((ref1 = old.transparentMembers) != null) {
          ref1.removeProperty(this.openProperty);
        }
      }
      if (this.tile) {
        if ((ref2 = this.tile.walkableMembers) != null) {
          ref2.addProperty(this.unlockedProperty);
        }
        return (ref3 = this.tile.transparentMembers) != null ? ref3.addProperty(this.openProperty) : void 0;
      }
    }

    init() {
      super.init();
      return this.open;
    }

    isActivatorPresent(invalidate) {
      return this.getReactiveTiles(invalidate).some((tile) => {
        var children;
        children = invalidate ? invalidate.prop(tile.childrenProperty) : tile.children;
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
      tile = invalidate ? invalidate.prop(this.tileProperty) : this.tile;
      if (!tile) {
        return [];
      }
      direction = invalidate ? invalidate.prop(this.directionProperty) : this.direction;
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
        return !invalidate.prop(this.lockedProperty) && this.isActivatorPresent(invalidate);
      }
    },
    locked: {
      default: false
    },
    unlocked: {
      calcul: function(invalidate) {
        return !invalidate.prop(this.lockedProperty);
      }
    }
  });

  return AutomaticDoor;

}).call(this);



},{"./Character":26,"./Door":31}],26:[function(require,module,exports){
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
      change: function(val, old) {
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
    providedActions: {
      collection: true,
      calcul: function(invalidator) {
        return invalidator.propPath("tile.providedActions") || [];
      }
    }
  });

  return Character;

}).call(this);



},{"./Damageable":30,"./actions/WalkAction":62,"parallelio-tiles":14}],27:[function(require,module,exports){
var AttackMoveAction, CharacterAI, Door, PropertyWatcher, TileContainer, VisionCalculator, WalkAction;

TileContainer = require('parallelio-tiles').TileContainer;

VisionCalculator = require('./VisionCalculator');

Door = require('./Door');

WalkAction = require('./actions/WalkAction');

AttackMoveAction = require('./actions/AttackMoveAction');

PropertyWatcher = require('spark-starter').watchers.PropertyWatcher;

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
      property: this.character.propertiesManager.getProperty('tile')
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



},{"./Door":31,"./VisionCalculator":53,"./actions/AttackMoveAction":57,"./actions/WalkAction":62,"parallelio-tiles":14,"spark-starter":99}],28:[function(require,module,exports){
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



},{"./Ship":47,"./View":52,"spark-starter":99}],29:[function(require,module,exports){
var DamagePropagation, Direction, Element, LineOfSight;

Element = require('spark-starter').Element;

LineOfSight = require('./LineOfSight');

Direction = require('parallelio-tiles').Direction;

module.exports = DamagePropagation = (function() {
  class DamagePropagation extends Element {
    constructor(options) {
      super(options);
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



},{"./LineOfSight":37,"parallelio-tiles":14,"spark-starter":99}],30:[function(require,module,exports){
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



},{"spark-starter":99}],31:[function(require,module,exports){
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
          ref.removeProperty(this.openProperty);
        }
        if ((ref1 = old.transparentMembers) != null) {
          ref1.removeProperty(this.openProperty);
        }
      }
      if (this.tile) {
        if ((ref2 = this.tile.walkableMembers) != null) {
          ref2.addProperty(this.openProperty);
        }
        return (ref3 = this.tile.transparentMembers) != null ? ref3.addProperty(this.openProperty) : void 0;
      }
    }

  };

  Door.properties({
    tile: {
      change: function(val, old) {
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



},{"parallelio-tiles":14}],32:[function(require,module,exports){
module.exports = require('spark-starter').Element;



},{"spark-starter":99}],33:[function(require,module,exports){
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
      if (this.rng() <= this.baseProbability) {
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
    },
    rng: {
      default: Math.random
    }
  });

  return EncounterManager;

}).call(this);



},{"./Confrontation":28,"spark-starter":99}],34:[function(require,module,exports){
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



},{"parallelio-tiles":14}],35:[function(require,module,exports){
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



},{"./Player":42,"./View":52,"parallelio-timing":15,"spark-starter":99}],36:[function(require,module,exports){
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



},{"spark-starter":99}],37:[function(require,module,exports){
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



},{}],38:[function(require,module,exports){
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



},{"spark-starter":99}],39:[function(require,module,exports){
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
      change: function(val, old, overrided) {
        overrided(old);
        return this.updateWalkables(old);
      }
    }
  });

  return Obstacle;

}).call(this);



},{"parallelio-tiles":14}],40:[function(require,module,exports){
var Element, EventEmitter, PathWalk, Timing;

Element = require('spark-starter').Element;

Timing = require('parallelio-timing');

EventEmitter = require('events');

module.exports = PathWalk = (function() {
  class PathWalk extends Element {
    constructor(walker, path, options) {
      super(options);
      this.walker = walker;
      this.path = path;
    }

    start() {
      if (!this.path.solution) {
        this.path.calcul();
      }
      if (this.path.solution) {
        this.pathTimeout = this.timing.setTimeout(() => {
          return this.finish();
        }, this.totalTime);
        this.walker.tileMembers.addPropertyPath('position.tile', this);
        this.walker.offsetXMembers.addPropertyPath('position.offsetX', this);
        return this.walker.offsetYMembers.addPropertyPath('position.offsetY', this);
      }
    }

    stop() {
      return this.pathTimeout.pause();
    }

    finish() {
      this.walker.tile = this.position.tile;
      this.walker.offsetX = this.position.offsetX;
      this.walker.offsetY = this.position.offsetY;
      this.emit('finished');
      return this.end();
    }

    interrupt() {
      this.emit('interrupted');
      return this.end();
    }

    end() {
      this.emit('end');
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
      this.propertiesManager.destroy();
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
        return this.path.getPosAtPrc(invalidator.propPath('pathTimeout.prc') || 0);
      }
    }
  });

  return PathWalk;

}).call(this);



},{"events":65,"parallelio-timing":15,"spark-starter":99}],41:[function(require,module,exports){
var Element, LineOfSight, PersonalWeapon, Timing;

Element = require('spark-starter').Element;

LineOfSight = require('./LineOfSight');

Timing = require('parallelio-timing');

module.exports = PersonalWeapon = (function() {
  class PersonalWeapon extends Element {
    constructor(options) {
      super(options);
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
        return invalidator.prop(this.powerProperty) / invalidator.prop(this.rechargeTimeProperty) * 1000;
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



},{"./LineOfSight":37,"parallelio-timing":15,"spark-starter":99}],42:[function(require,module,exports){
var Element, Player;

Element = require('spark-starter').Element;

module.exports = Player = (function() {
  class Player extends Element {
    constructor(options) {
      super(options);
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

    guessActionTarget(action) {
      var selected;
      selected = this.selected;
      if (typeof action.canTarget === "function" && (action.target == null) && action.actor !== selected && action.canTarget(selected)) {
        return action.withTarget(selected);
      } else {
        return action;
      }
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

  Player.properties({
    name: {
      default: 'Player'
    },
    focused: {},
    selected: {
      change: function(val, old) {
        var ref;
        if (old != null ? old.propertiesManager.getProperty('selected') : void 0) {
          old.selected = false;
        }
        if ((ref = this.selected) != null ? ref.propertiesManager.getProperty('selected') : void 0) {
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
        res = invalidator.prop(this.globalActionProvidersProperty).toArray();
        selected = invalidator.prop(this.selectedProperty);
        if (selected) {
          res.push(selected);
        }
        return res;
      }
    },
    availableActions: {
      calcul: function(invalidator) {
        return invalidator.prop(this.actionProvidersProperty).reduce((res, provider) => {
          var actions, selected;
          actions = invalidator.prop(provider.providedActionsProperty).toArray();
          selected = invalidator.prop(this.selectedProperty);
          if (selected != null) {
            actions = actions.map((action) => {
              return this.guessActionTarget(action);
            });
          }
          if (actions) {
            return res.concat(actions);
          } else {
            return res;
          }
        }, []);
      }
    },
    selectedAction: {},
    controller: {
      change: function(val, old) {
        if (this.controller) {
          return this.controller.player = this;
        }
      }
    },
    game: {
      change: function(val, old) {
        if (this.game) {
          return this.setDefaults();
        }
      }
    }
  });

  return Player;

}).call(this);



},{"spark-starter":99}],43:[function(require,module,exports){
var Element, Projectile, Timing;

Element = require('spark-starter').Element;

Timing = require('parallelio-timing');

module.exports = Projectile = (function() {
  class Projectile extends Element {
    constructor(options) {
      super(options);
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
      return this.propertiesManager.destroy();
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
        origin = invalidator.prop(this.originProperty);
        if (origin != null) {
          return origin.tile || origin;
        }
      }
    },
    targetTile: {
      calcul: function(invalidator) {
        var target;
        target = invalidator.prop(this.targetProperty);
        if (target != null) {
          return target.tile || target;
        }
      }
    },
    container: {
      calcul: function(invalidate) {
        var originTile, targetTile;
        originTile = invalidate.prop(this.originTileProperty);
        targetTile = invalidate.prop(this.targetTileProperty);
        if (originTile.container === targetTile.container) {
          return originTile.container;
        } else if (invalidate.prop(this.prcPathProperty) > 0.5) {
          return targetTile.container;
        } else {
          return originTile.container;
        }
      }
    },
    x: {
      calcul: function(invalidate) {
        var startPos;
        startPos = invalidate.prop(this.startPosProperty);
        return (invalidate.prop(this.targetPosProperty).x - startPos.x) * invalidate.prop(this.prcPathProperty) + startPos.x;
      }
    },
    y: {
      calcul: function(invalidate) {
        var startPos;
        startPos = invalidate.prop(this.startPosProperty);
        return (invalidate.prop(this.targetPosProperty).y - startPos.y) * invalidate.prop(this.prcPathProperty) + startPos.y;
      }
    },
    startPos: {
      calcul: function(invalidate) {
        var container, dist, offset, originTile;
        originTile = invalidate.prop(this.originTileProperty);
        container = invalidate.prop(this.containerProperty);
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
        targetTile = invalidate.prop(this.targetTileProperty);
        container = invalidate.prop(this.containerProperty);
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
        return ((ref = this.pathTimeout) != null ? ref.prc : void 0) || 0;
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



},{"parallelio-timing":15,"spark-starter":99}],44:[function(require,module,exports){
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



},{"spark-starter":99}],45:[function(require,module,exports){
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



},{"./Ressource":44,"spark-starter":99}],46:[function(require,module,exports){
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
      super(options);
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



},{"./Door":31,"parallelio-tiles":14,"spark-starter":99}],47:[function(require,module,exports){
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
    providedActions: {
      collection: true,
      calcul: function(invalidator) {
        return new TravelAction({
          actor: this
        });
      }
    },
    spaceCoodinate: {
      calcul: function(invalidator) {
        if (invalidator.prop(this.travelProperty)) {
          return invalidator.propPath('travel.spaceCoodinate');
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



},{"./Travel":51,"./actions/TravelAction":61,"spark-starter":99}],48:[function(require,module,exports){
var Damageable, Projectile, ShipWeapon, Tiled, Timing;

Tiled = require('parallelio-tiles').Tiled;

Timing = require('parallelio-timing');

Damageable = require('./Damageable');

Projectile = require('./Projectile');

module.exports = ShipWeapon = (function() {
  class ShipWeapon extends Tiled {
    constructor(options) {
      super(options);
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



},{"./Damageable":30,"./Projectile":43,"parallelio-tiles":14,"parallelio-timing":15}],49:[function(require,module,exports){
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



},{"./Map":38,"./StarSystem":50,"parallelio-strings":6,"spark-starter":99}],50:[function(require,module,exports){
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



},{"spark-starter":99}],51:[function(require,module,exports){
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
    },
    spaceCoodinate: {
      calcul: function(invalidator) {
        var endX, endY, prc, startX, startY;
        startX = invalidator.propPath('startLocation.x');
        startY = invalidator.propPath('startLocation.y');
        endX = invalidator.propPath('targetLocation.x');
        endY = invalidator.propPath('targetLocation.y');
        prc = invalidator.propPath('pathTimeout.prc');
        return {
          x: (startX - endX) * prc + endX,
          y: (startY - endY) * prc + endY
        };
      }
    }
  });

  return Travel;

}).call(this);



},{"parallelio-timing":15,"spark-starter":99}],52:[function(require,module,exports){
var Element, Grid, View;

Element = require('spark-starter').Element;

Grid = require('parallelio-grids').Grid;

module.exports = View = (function() {
  class View extends Element {
    setDefaults() {
      var ref;
      if (!this.bounds) {
        this.grid = this.grid || ((ref = this.game.mainViewProperty.value) != null ? ref.grid : void 0) || new Grid();
        return this.bounds = this.grid.addCell();
      }
    }

    destroy() {
      return this.game = null;
    }

  };

  View.properties({
    game: {
      change: function(val, old) {
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



},{"parallelio-grids":4,"spark-starter":99}],53:[function(require,module,exports){
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



},{"./LineOfSight":37,"parallelio-tiles":14}],54:[function(require,module,exports){
var Action, Element, EventEmitter;

Element = require('spark-starter').Element;

EventEmitter = require('events');

module.exports = Action = (function() {
  class Action extends Element {
    constructor(options) {
      super(options);
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
        base: this.baseOrThis()
      }, this.propertiesManager.getManualDataProperties(), options));
    }

    baseOrThis() {
      return this.base || this;
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
      this.emit('finished');
      return this.end();
    }

    interrupt() {
      this.emit('interrupted');
      return this.end();
    }

    end() {
      this.emit('end');
      return this.destroy();
    }

    destroy() {
      return this.propertiesManager.destroy();
    }

  };

  Action.include(EventEmitter.prototype);

  Action.properties({
    actor: {},
    base: {}
  });

  return Action;

}).call(this);



},{"events":65,"spark-starter":99}],55:[function(require,module,exports){
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



},{"spark-starter":99}],56:[function(require,module,exports){
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
          this.walkActionProperty.invalidate();
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



},{"./TargetAction":59,"./WalkAction":62,"spark-starter":99}],57:[function(require,module,exports){
var AttackAction, AttackMoveAction, EventBind, LineOfSight, PathFinder, PropertyWatcher, TargetAction, WalkAction;

WalkAction = require('./WalkAction');

AttackAction = require('./AttackAction');

TargetAction = require('./TargetAction');

PathFinder = require('parallelio-pathfinder');

LineOfSight = require('../LineOfSight');

PropertyWatcher = require('spark-starter').watchers.PropertyWatcher;

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
      this.enemySpottedProperty.invalidate();
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
        this.walkActionProperty.invalidate();
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
          property: this.actor.propertiesManager.getProperty('tile')
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



},{"../LineOfSight":37,"./AttackAction":56,"./TargetAction":59,"./WalkAction":62,"parallelio-pathfinder":5,"spark-starter":99}],58:[function(require,module,exports){
var ActionProvider, SimpleActionProvider;

ActionProvider = require('./ActionProvider');

module.exports = SimpleActionProvider = (function() {
  class SimpleActionProvider extends ActionProvider {};

  SimpleActionProvider.properties({
    providedActions: {
      calcul: function() {
        var actions;
        actions = this.actions || this.constructor.actions || [];
        if (typeof actions === "object") {
          actions = Object.keys(actions).map(function(key) {
            return actions[key];
          });
        }
        return actions.map((action) => {
          if (typeof action.withTarget === "function") {
            return action.withTarget(this);
          } else if (typeof action === "function") {
            return new action({
              target: this
            });
          } else {
            return action;
          }
        });
      }
    }
  });

  return SimpleActionProvider;

}).call(this);



},{"./ActionProvider":55}],59:[function(require,module,exports){
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



},{"./Action":54}],60:[function(require,module,exports){
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
      change: function(val, old, overrided) {
        overrided(old);
        return this.forwardedActions;
      }
    },
    actionTiles: {
      collection: true,
      calcul: function(invalidator) {
        var myTile;
        myTile = invalidator.prop(this.tileProperty);
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
        actionTiles = invalidator.prop(this.actionTilesProperty);
        actions = invalidator.prop(this.providedActionsProperty);
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



},{"./ActionProvider":55,"spark-starter":99}],61:[function(require,module,exports){
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



},{"../Travel":51,"./TargetAction":59}],62:[function(require,module,exports){
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



},{"../PathWalk":40,"./TargetAction":59,"parallelio-pathfinder":5}],63:[function(require,module,exports){
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
},{"./Airlock":23,"./Approach":24,"./AutomaticDoor":25,"./Character":26,"./CharacterAI":27,"./Confrontation":28,"./DamagePropagation":29,"./Damageable":30,"./Door":31,"./Element":32,"./EnconterManager":33,"./Floor":34,"./Game":35,"./Inventory":36,"./LineOfSight":37,"./Map":38,"./Obstacle":39,"./PathWalk":40,"./PersonalWeapon":41,"./Player":42,"./Projectile":43,"./Ressource":44,"./RessourceType":45,"./RoomGenerator":46,"./Ship":47,"./ShipWeapon":48,"./StarMapGenerator":49,"./StarSystem":50,"./Travel":51,"./View":52,"./VisionCalculator":53,"./actions/Action":54,"./actions/ActionProvider":55,"./actions/AttackAction":56,"./actions/AttackMoveAction":57,"./actions/SimpleActionProvider":58,"./actions/TargetAction":59,"./actions/TiledActionProvider":60,"./actions/TravelAction":61,"./actions/WalkAction":62}],64:[function(require,module,exports){
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



},{"./libs":63,"parallelio-grids":4,"parallelio-pathfinder":5,"parallelio-strings":6,"parallelio-tiles":14,"parallelio-timing":15,"parallelio-wiring":22,"spark-starter":99}],65:[function(require,module,exports){
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

},{}],66:[function(require,module,exports){
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

},{}],67:[function(require,module,exports){
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

},{"process/browser.js":66,"timers":67}],68:[function(require,module,exports){
module.exports = {
  Binder: require('./src/Binder'),
  EventBind: require('./src/EventBind'),
  Reference: require('./src/Reference')
}

},{"./src/Binder":69,"./src/EventBind":70,"./src/Reference":71}],69:[function(require,module,exports){
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

},{}],70:[function(require,module,exports){

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

},{"./Binder":69,"./Reference":71}],71:[function(require,module,exports){
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

},{}],72:[function(require,module,exports){
module.exports = require('./src/Collection')

},{"./src/Collection":73}],73:[function(require,module,exports){
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

Collection.readListFunctions = ['concat', 'filter', 'slice']

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

},{}],74:[function(require,module,exports){
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
  watchers: {
    CollectionPropertyWatcher: require('./src/watchers/CollectionPropertyWatcher'),
    PropertyWatcher: require('./src/watchers/PropertyWatcher')
  },
  setters: {
    BaseSetter: require('./src/setters/BaseSetter'),
    BaseValueSetter: require('./src/setters/BaseValueSetter'),
    CollectionSetter: require('./src/setters/CollectionSetter'),
    ManualSetter: require('./src/setters/ManualSetter'),
    SimpleSetter: require('./src/setters/SimpleSetter')
  }
}

},{"./src/Invalidator":75,"./src/PropertiesManager":76,"./src/Property":77,"./src/getters/BaseGetter":78,"./src/getters/CalculatedGetter":79,"./src/getters/CompositeGetter":80,"./src/getters/InvalidatedGetter":81,"./src/getters/ManualGetter":82,"./src/getters/SimpleGetter":83,"./src/setters/BaseSetter":84,"./src/setters/BaseValueSetter":85,"./src/setters/CollectionSetter":86,"./src/setters/ManualSetter":87,"./src/setters/SimpleSetter":88,"./src/watchers/CollectionPropertyWatcher":89,"./src/watchers/PropertyWatcher":90}],75:[function(require,module,exports){
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
  }

  invalidate () {
    var functName
    this.invalid = true
    if (typeof this.invalidated === 'function') {
      this.invalidated()
    } else if (typeof this.callback === 'function') {
      this.callback()
    } else if ((this.invalidated != null) && typeof this.invalidated.invalidate === 'function') {
      this.invalidated.invalidate()
    } else if (typeof this.invalidated === 'string') {
      functName = 'invalidate' + this.invalidated.charAt(0).toUpperCase() + this.invalidated.slice(1)
      if (typeof this.scope[functName] === 'function') {
        this.scope[functName]()
      } else {
        this.scope[this.invalidated] = null
      }
    }
    return this
  }

  unknown () {
    if (this.invalidated != null && typeof this.invalidated.unknown === 'function') {
      return this.invalidated.unknown()
    } else {
      return this.invalidate()
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
    callback = () => {
      return this.addUnknown(function () {
        return prop.get()
      }, prop)
    }
    callback.prop = prop
    return callback
  }

  addUnknown (fn, prop) {
    if (!this.findUnknown(prop)) {
      fn.prop = prop
      this.unknowns.push(fn)
      return this.unknown()
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
      return this.value(prop.get(), 'updated', prop.events)
    }
  }

  propByName (prop, target = this.scope) {
    if (target.propertiesManager != null) {
      return this.prop(target.propertiesManager.getProperty(prop))
    } else if (target[prop + 'Property'] != null) {
      return this.prop(target[prop + 'Property'])
    } else {
      return target[prop]
    }
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
    var unknowns
    unknowns = this.unknowns
    this.unknowns = []
    return unknowns.forEach(function (unknown) {
      return unknown()
    })
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

},{"spark-binding":68}],76:[function(require,module,exports){
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
    return function (...arg) {
      return newFunct.call(this, ...arg, oldFunct.bind(this))
    }
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

  addProperty (name, options) {
    const prop = new Property(Object.assign({ name: name }, this.globalOptions, options))
    this.properties.push(prop)
    return this
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

},{"./Property":77}],77:[function(require,module,exports){
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

  initWatchers () {
    this.setter.loadInternalWatcher()
  }

  makeGetter () {
    if (typeof this.options.get === 'function') {
      this.getter = new ManualGetter(this)
    } else if (this.options.composed != null && this.options.composed !== false) {
      this.getter = new CompositeGetter(this)
    } else if (typeof this.options.calcul === 'function') {
      if (this.options.calcul.length === 0) {
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

  invalidate () {
    this.getter.invalidate()
    return this
  }

  unknown () {
    this.getter.unknown()
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

},{"./getters/CalculatedGetter":79,"./getters/CompositeGetter":80,"./getters/InvalidatedGetter":81,"./getters/ManualGetter":82,"./getters/SimpleGetter":83,"./setters/BaseValueSetter":85,"./setters/CollectionSetter":86,"./setters/ManualSetter":87,"./setters/SimpleSetter":88,"events":65}],78:[function(require,module,exports){

class BaseGetter {
  constructor (prop) {
    this.prop = prop
  }

  init () {
    this.calculated = false
    this.initiated = false
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
    return this
  }

  unknown () {
    if (this.calculated) {
      this.invalidateNotice()
    }
    return this
  }

  invalidate () {
    if (this.calculated) {
      this.calculated = false
      this.invalidateNotice()
    }
    return this
  }

  invalidateNotice () {
    this.prop.events.emit('invalidated')
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

},{}],79:[function(require,module,exports){

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

},{"./BaseGetter":78}],80:[function(require,module,exports){
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

    if (typeof this.prop.options.composed === 'function') {
      this.join = this.prop.options.composed
    } else if (typeof this.prop.options.composed === 'string' && CompositeGetter.joinFunctions[this.prop.options.composed] != null) {
      this.join = CompositeGetter.joinFunctions[this.prop.options.composed]
    } else if (this.prop.options.default === false) {
      this.join = CompositeGetter.joinFunctions.or
    } else if (this.prop.options.default === true) {
      this.join = CompositeGetter.joinFunctions.and
    } else {
      this.join = CompositeGetter.joinFunctions.last
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

},{"../Invalidator":75,"./InvalidatedGetter":81,"spark-binding":68,"spark-collection":72}],81:[function(require,module,exports){
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

  invalidate () {
    if (this.calculated) {
      this.calculated = false
      this.invalidateNotice()
      if (!this.calculated && this.invalidator != null) {
        this.invalidator.unbind()
      }
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

},{"../Invalidator":75,"./CalculatedGetter":79}],82:[function(require,module,exports){
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

},{"./BaseGetter":78}],83:[function(require,module,exports){
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

},{"./BaseGetter":78}],84:[function(require,module,exports){

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
      return new PropertyWatcher({
        property: this.prop,
        callback: changeOpt,
        scope: this.prop.options.scope,
        autoBind: true
      })
    } else if (changeOpt != null && typeof changeOpt.copyWith === 'function') {
      return changeOpt.copyWith({
        property: this.prop,
        autoBind: true
      })
    }
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
    this.prop.events.emit('updated', old)
    this.prop.events.emit('changed', old)
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

},{"../watchers/PropertyWatcher":90}],85:[function(require,module,exports){
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

},{"./BaseSetter":84}],86:[function(require,module,exports){
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

},{"../watchers/CollectionPropertyWatcher":89,"./SimpleSetter":88,"spark-collection":72}],87:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class ManualSetter extends BaseSetter {
  set (val) {
    this.prop.callOptionFunct('set', val)
  }
}

module.exports = ManualSetter

},{"./BaseSetter":84}],88:[function(require,module,exports){
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

},{"./BaseSetter":84}],89:[function(require,module,exports){

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

},{"./PropertyWatcher":90}],90:[function(require,module,exports){

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
    this.invalidateCallback = () => {
      return this.invalidate()
    }
    this.updateCallback = (old) => {
      return this.update(old)
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

},{"spark-binding":68}],91:[function(require,module,exports){
var Element, Mixable, PropertiesManager;

PropertiesManager = require('spark-properties').PropertiesManager;

Mixable = require('./Mixable');

module.exports = Element = (function() {
  class Element extends Mixable {
    constructor(data) {
      super();
      this.initPropertiesManager(data);
      this.init();
    }

    initPropertiesManager(data) {
      this.propertiesManager = this.propertiesManager.useScope(this);
      this.propertiesManager.initProperties();
      this.propertiesManager.createScopeGetterSetters();
      if (typeof data === "object") {
        this.propertiesManager.setPropertiesData(data);
      }
      this.propertiesManager.initWatchers();
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



},{"./Mixable":95,"spark-properties":74}],92:[function(require,module,exports){
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



},{"spark-properties":74}],93:[function(require,module,exports){
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



},{"spark-properties":74}],94:[function(require,module,exports){
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



},{"./Overrider":96}],95:[function(require,module,exports){
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



},{}],96:[function(require,module,exports){
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



},{}],97:[function(require,module,exports){
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



},{"spark-binding":68}],98:[function(require,module,exports){
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
},{"./Element":91,"./Invalidated/ActivablePropertyWatcher":92,"./Invalidated/Invalidated":93,"./Loader":94,"./Mixable":95,"./Overrider":96,"./Updater":97}],99:[function(require,module,exports){
var libs;

libs = require('./libs');

module.exports = Object.assign({
  'Collection': require('spark-collection')
}, libs, require('spark-properties'), require('spark-binding'));



},{"./libs":98,"spark-binding":68,"spark-collection":72,"spark-properties":74}]},{},[64])(64)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkLmpzIiwiLi4vcGFyYWxsZWxpby1ncmlkcy9saWIvR3JpZENlbGwuanMiLCIuLi9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkUm93LmpzIiwiLi4vcGFyYWxsZWxpby1ncmlkcy9saWIvZ3JpZHMuanMiLCIuLi9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvZGlzdC9wYXRoZmluZGVyLmpzIiwiLi4vcGFyYWxsZWxpby1zdHJpbmdzL3N0cmluZ3MuanMiLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9ncmVla0FscGhhYmV0Lmpzb24iLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9zdGFyTmFtZXMuanNvbiIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL0RpcmVjdGlvbi5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGUuanMiLCIuLi9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlQ29udGFpbmVyLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZVJlZmVyZW5jZS5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVkLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvdGlsZXMuanMiLCIuLi9wYXJhbGxlbGlvLXRpbWluZy9ub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aW1pbmcvZGlzdC90aW1pbmcuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvQ29ubmVjdGVkLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1NpZ25hbC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9TaWduYWxPcGVyYXRpb24uanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvU2lnbmFsU291cmNlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1N3aXRjaC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9XaXJlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL3dpcmluZy5qcyIsImxpYi9BaXJsb2NrLmpzIiwibGliL0FwcHJvYWNoLmpzIiwibGliL0F1dG9tYXRpY0Rvb3IuanMiLCJsaWIvQ2hhcmFjdGVyLmpzIiwibGliL0NoYXJhY3RlckFJLmpzIiwibGliL0NvbmZyb250YXRpb24uanMiLCJsaWIvRGFtYWdlUHJvcGFnYXRpb24uanMiLCJsaWIvRGFtYWdlYWJsZS5qcyIsImxpYi9Eb29yLmpzIiwibGliL0VsZW1lbnQuanMiLCJsaWIvRW5jb250ZXJNYW5hZ2VyLmpzIiwibGliL0Zsb29yLmpzIiwibGliL0dhbWUuanMiLCJsaWIvSW52ZW50b3J5LmpzIiwibGliL0xpbmVPZlNpZ2h0LmpzIiwibGliL01hcC5qcyIsImxpYi9PYnN0YWNsZS5qcyIsImxpYi9QYXRoV2Fsay5qcyIsImxpYi9QZXJzb25hbFdlYXBvbi5qcyIsImxpYi9QbGF5ZXIuanMiLCJsaWIvUHJvamVjdGlsZS5qcyIsImxpYi9SZXNzb3VyY2UuanMiLCJsaWIvUmVzc291cmNlVHlwZS5qcyIsImxpYi9Sb29tR2VuZXJhdG9yLmpzIiwibGliL1NoaXAuanMiLCJsaWIvU2hpcFdlYXBvbi5qcyIsImxpYi9TdGFyTWFwR2VuZXJhdG9yLmpzIiwibGliL1N0YXJTeXN0ZW0uanMiLCJsaWIvVHJhdmVsLmpzIiwibGliL1ZpZXcuanMiLCJsaWIvVmlzaW9uQ2FsY3VsYXRvci5qcyIsImxpYi9hY3Rpb25zL0FjdGlvbi5qcyIsImxpYi9hY3Rpb25zL0FjdGlvblByb3ZpZGVyLmpzIiwibGliL2FjdGlvbnMvQXR0YWNrQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1NpbXBsZUFjdGlvblByb3ZpZGVyLmpzIiwibGliL2FjdGlvbnMvVGFyZ2V0QWN0aW9uLmpzIiwibGliL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL1RyYXZlbEFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1dhbGtBY3Rpb24uanMiLCJsaWIvbGlicy5qcyIsImxpYi9wYXJhbGxlbGlvLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCIuLi9zcGFyay1iaW5kaW5nL2luZGV4LmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvQmluZGVyLmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvRXZlbnRCaW5kLmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvUmVmZXJlbmNlLmpzIiwiLi4vc3BhcmstY29sbGVjdGlvbi9pbmRleC5qcyIsIi4uL3NwYXJrLWNvbGxlY3Rpb24vc3JjL0NvbGxlY3Rpb24uanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL2luZGV4LmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvSW52YWxpZGF0b3IuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9Qcm9wZXJ0aWVzTWFuYWdlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL1Byb3BlcnR5LmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9CYXNlR2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9DYWxjdWxhdGVkR2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0ludmFsaWRhdGVkR2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9NYW51YWxHZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL1NpbXBsZUdldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvQmFzZVNldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvQmFzZVZhbHVlU2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9Db2xsZWN0aW9uU2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9NYW51YWxTZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL1NpbXBsZVNldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3dhdGNoZXJzL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9FbGVtZW50LmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Mb2FkZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9NaXhhYmxlLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvT3ZlcnJpZGVyLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvVXBkYXRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL2xpYnMuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9zcGFyay1zdGFydGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIEVsZW1lbnQsIEdyaWQsIEdyaWRDZWxsLCBHcmlkUm93O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkdyaWRDZWxsID0gcmVxdWlyZSgnLi9HcmlkQ2VsbCcpO1xuXG5HcmlkUm93ID0gcmVxdWlyZSgnLi9HcmlkUm93Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIHZhciByb3csIHNwb3Q7XG4gICAgICBpZiAoIWNlbGwpIHtcbiAgICAgICAgY2VsbCA9IG5ldyBHcmlkQ2VsbCgpO1xuICAgICAgfVxuICAgICAgc3BvdCA9IHRoaXMuZ2V0RnJlZVNwb3QoKTtcbiAgICAgIHJvdyA9IHRoaXMucm93cy5nZXQoc3BvdC5yb3cpO1xuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcm93ID0gdGhpcy5hZGRSb3coKTtcbiAgICAgIH1cbiAgICAgIHJvdy5hZGRDZWxsKGNlbGwpO1xuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuXG4gICAgYWRkUm93KHJvdyA9IG51bGwpIHtcbiAgICAgIGlmICghcm93KSB7XG4gICAgICAgIHJvdyA9IG5ldyBHcmlkUm93KCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJvd3MucHVzaChyb3cpO1xuICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBnZXRGcmVlU3BvdCgpIHtcbiAgICAgIHZhciBzcG90O1xuICAgICAgc3BvdCA9IG51bGw7XG4gICAgICB0aGlzLnJvd3Muc29tZSgocm93KSA9PiB7XG4gICAgICAgIGlmIChyb3cuY2VsbHMubGVuZ3RoIDwgdGhpcy5tYXhDb2x1bW5zKSB7XG4gICAgICAgICAgcmV0dXJuIHNwb3QgPSB7XG4gICAgICAgICAgICByb3c6IHJvdy5yb3dQb3NpdGlvbixcbiAgICAgICAgICAgIGNvbHVtbjogcm93LmNlbGxzLmxlbmd0aFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFzcG90KSB7XG4gICAgICAgIGlmICh0aGlzLm1heENvbHVtbnMgPiB0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogdGhpcy5yb3dzLmxlbmd0aCxcbiAgICAgICAgICAgIGNvbHVtbjogMFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogMCxcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5tYXhDb2x1bW5zICsgMVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzcG90O1xuICAgIH1cblxuICB9O1xuXG4gIEdyaWQucHJvcGVydGllcyh7XG4gICAgcm93czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICAgIGl0ZW1BZGRlZDogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiByb3cuZ3JpZCA9IHRoaXM7XG4gICAgICB9LFxuICAgICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICBpZiAocm93LmdyaWQgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gcm93LmdyaWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtYXhDb2x1bW5zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByb3dzO1xuICAgICAgICByb3dzID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnJvd3NQcm9wZXJ0eSk7XG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZShmdW5jdGlvbihtYXgsIHJvdykge1xuICAgICAgICAgIHJldHVybiBNYXRoLm1heChtYXgsIGludmFsaWRhdG9yLnByb3Aocm93LmNlbGxzUHJvcGVydHkpLmxlbmd0aCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWQ7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgRWxlbWVudCwgR3JpZENlbGw7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkQ2VsbCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZENlbGwgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG4gIEdyaWRDZWxsLnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdncmlkLnJvdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcm93OiB7fSxcbiAgICBjb2x1bW5Qb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgcm93O1xuICAgICAgICByb3cgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMucm93UHJvcGVydHkpO1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3Aocm93LmNlbGxzUHJvcGVydHkpLmluZGV4T2YodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHdpZHRoOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiAxIC8gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3Jvdy5jZWxscycpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxlZnQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AodGhpcy53aWR0aFByb3BlcnR5KSAqIGludmFsaWRhdG9yLnByb3AodGhpcy5jb2x1bW5Qb3NpdGlvblByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMud2lkdGhQcm9wZXJ0eSkgKiAoaW52YWxpZGF0b3IucHJvcCh0aGlzLmNvbHVtblBvc2l0aW9uUHJvcGVydHkpICsgMSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdyb3cuaGVpZ2h0Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3A6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdyb3cudG9wJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBib3R0b206IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdyb3cuYm90dG9tJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZENlbGw7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgRWxlbWVudCwgR3JpZENlbGwsIEdyaWRSb3c7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuR3JpZENlbGwgPSByZXF1aXJlKCcuL0dyaWRDZWxsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZFJvdyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZFJvdyBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIGlmICghY2VsbCkge1xuICAgICAgICBjZWxsID0gbmV3IEdyaWRDZWxsKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG5cbiAgfTtcblxuICBHcmlkUm93LnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHt9LFxuICAgIGNlbGxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihjZWxsKSB7XG4gICAgICAgIHJldHVybiBjZWxsLnJvdyA9IHRoaXM7XG4gICAgICB9LFxuICAgICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgaWYgKGNlbGwucm93ID09PSB0aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGNlbGwucm93ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcm93UG9zaXRpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIGdyaWQ7XG4gICAgICAgIGdyaWQgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMuZ3JpZFByb3BlcnR5KTtcbiAgICAgICAgaWYgKGdyaWQpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChncmlkLnJvd3NQcm9wZXJ0eSkuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiAxIC8gaW52YWxpZGF0b3IucHJvcFBhdGgoJ2dyaWQucm93cycpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvcDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLmhlaWdodFByb3BlcnR5KSAqIGludmFsaWRhdG9yLnByb3AodGhpcy5yb3dQb3NpdGlvblByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLmhlaWdodFByb3BlcnR5KSAqIChpbnZhbGlkYXRvci5wcm9wKHRoaXMucm93UG9zaXRpb25Qcm9wZXJ0eSkgKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkUm93O1xuXG59KS5jYWxsKHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiR3JpZFwiOiByZXF1aXJlKFwiLi9HcmlkXCIpLFxuICBcIkdyaWRDZWxsXCI6IHJlcXVpcmUoXCIuL0dyaWRDZWxsXCIpLFxuICBcIkdyaWRSb3dcIjogcmVxdWlyZShcIi4vR3JpZFJvd1wiKSxcbn0iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFBhdGhGaW5kZXI9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1BhdGhGaW5kZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1QYXRoRmluZGVyO31lbHNle2lmKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIiYmUGFyYWxsZWxpbyE9PW51bGwpe1BhcmFsbGVsaW8uUGF0aEZpbmRlcj1QYXRoRmluZGVyO31lbHNle2lmKHRoaXMuUGFyYWxsZWxpbz09bnVsbCl7dGhpcy5QYXJhbGxlbGlvPXt9O310aGlzLlBhcmFsbGVsaW8uUGF0aEZpbmRlcj1QYXRoRmluZGVyO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFBhdGhGaW5kZXI7XG5QYXRoRmluZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQYXRoRmluZGVyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IodGlsZXNDb250YWluZXIsIGZyb20xLCB0bzEsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMudGlsZXNDb250YWluZXIgPSB0aWxlc0NvbnRhaW5lcjtcbiAgICAgIHRoaXMuZnJvbSA9IGZyb20xO1xuICAgICAgdGhpcy50byA9IHRvMTtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgIGlmIChvcHRpb25zLnZhbGlkVGlsZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sgPSBvcHRpb25zLnZhbGlkVGlsZTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmFycml2ZWQgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFycml2ZWRDYWxsYmFjayA9IG9wdGlvbnMuYXJyaXZlZDtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmVmZmljaWVuY3kgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmVmZmljaWVuY3lDYWxsYmFjayA9IG9wdGlvbnMuZWZmaWNpZW5jeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgIHRoaXMucGF0aHMgPSB7fTtcbiAgICAgIHRoaXMuc29sdXRpb24gPSBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNhbGN1bCgpIHtcbiAgICAgIHdoaWxlICghdGhpcy5zb2x1dGlvbiAmJiAoIXRoaXMuc3RhcnRlZCB8fCB0aGlzLnF1ZXVlLmxlbmd0aCkpIHtcbiAgICAgICAgdGhpcy5zdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgc3RlcCgpIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgIG5leHQgPSB0aGlzLnF1ZXVlLnBvcCgpO1xuICAgICAgICB0aGlzLmFkZE5leHRTdGVwcyhuZXh0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgICBpZiAodGhpcy50byA9PT0gZmFsc2UgfHwgdGhpcy50aWxlSXNWYWxpZCh0aGlzLnRvKSkge1xuICAgICAgICB0aGlzLmFkZE5leHRTdGVwcygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQYXRoKCkge1xuICAgICAgdmFyIHJlcywgc3RlcDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHJlcyA9IFt0aGlzLnNvbHV0aW9uXTtcbiAgICAgICAgc3RlcCA9IHRoaXMuc29sdXRpb247XG4gICAgICAgIHdoaWxlIChzdGVwLnByZXYgIT0gbnVsbCkge1xuICAgICAgICAgIHJlcy51bnNoaWZ0KHN0ZXAucHJldik7XG4gICAgICAgICAgc3RlcCA9IHN0ZXAucHJldjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc0F0UHJjKHByYykge1xuICAgICAgaWYgKGlzTmFOKHByYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UG9zQXRUaW1lKHRoaXMuc29sdXRpb24uZ2V0VG90YWxMZW5ndGgoKSAqIHByYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UG9zQXRUaW1lKHRpbWUpIHtcbiAgICAgIHZhciBwcmMsIHN0ZXA7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICBpZiAodGltZSA+PSB0aGlzLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zb2x1dGlvbi5wb3NUb1RpbGVPZmZzZXQodGhpcy5zb2x1dGlvbi5nZXRFeGl0KCkueCwgdGhpcy5zb2x1dGlvbi5nZXRFeGl0KCkueSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RlcCA9IHRoaXMuc29sdXRpb247XG4gICAgICAgICAgd2hpbGUgKHN0ZXAuZ2V0U3RhcnRMZW5ndGgoKSA+IHRpbWUgJiYgKHN0ZXAucHJldiAhPSBudWxsKSkge1xuICAgICAgICAgICAgc3RlcCA9IHN0ZXAucHJldjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJjID0gKHRpbWUgLSBzdGVwLmdldFN0YXJ0TGVuZ3RoKCkpIC8gc3RlcC5nZXRMZW5ndGgoKTtcbiAgICAgICAgICByZXR1cm4gc3RlcC5wb3NUb1RpbGVPZmZzZXQoc3RlcC5nZXRFbnRyeSgpLnggKyAoc3RlcC5nZXRFeGl0KCkueCAtIHN0ZXAuZ2V0RW50cnkoKS54KSAqIHByYywgc3RlcC5nZXRFbnRyeSgpLnkgKyAoc3RlcC5nZXRFeGl0KCkueSAtIHN0ZXAuZ2V0RW50cnkoKS55KSAqIHByYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb2x1dGlvblRpbGVMaXN0KCkge1xuICAgICAgdmFyIHN0ZXAsIHRpbGVsaXN0O1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgc3RlcCA9IHRoaXMuc29sdXRpb247XG4gICAgICAgIHRpbGVsaXN0ID0gW3N0ZXAudGlsZV07XG4gICAgICAgIHdoaWxlIChzdGVwLnByZXYgIT0gbnVsbCkge1xuICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgICAgdGlsZWxpc3QudW5zaGlmdChzdGVwLnRpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlbGlzdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aWxlSXNWYWxpZCh0aWxlKSB7XG4gICAgICBpZiAodGhpcy52YWxpZFRpbGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkVGlsZUNhbGxiYWNrKHRpbGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwpICYmICghdGlsZS5lbXVsYXRlZCB8fCAodGlsZS50aWxlICE9PSAwICYmIHRpbGUudGlsZSAhPT0gZmFsc2UpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUaWxlKHgsIHkpIHtcbiAgICAgIHZhciByZWYxO1xuICAgICAgaWYgKHRoaXMudGlsZXNDb250YWluZXIuZ2V0VGlsZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzQ29udGFpbmVyLmdldFRpbGUoeCwgeSk7XG4gICAgICB9IGVsc2UgaWYgKCgocmVmMSA9IHRoaXMudGlsZXNDb250YWluZXJbeV0pICE9IG51bGwgPyByZWYxW3hdIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogeCxcbiAgICAgICAgICB5OiB5LFxuICAgICAgICAgIHRpbGU6IHRoaXMudGlsZXNDb250YWluZXJbeV1beF0sXG4gICAgICAgICAgZW11bGF0ZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRDb25uZWN0ZWRUb1RpbGUodGlsZSkge1xuICAgICAgdmFyIGNvbm5lY3RlZCwgdDtcbiAgICAgIGlmICh0aWxlLmdldENvbm5lY3RlZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aWxlLmdldENvbm5lY3RlZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29ubmVjdGVkID0gW107XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCArIDEsIHRpbGUueSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLnggLSAxLCB0aWxlLnkpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54LCB0aWxlLnkgKyAxKSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCwgdGlsZS55IC0gMSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29ubmVjdGVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZE5leHRTdGVwcyhzdGVwID0gbnVsbCkge1xuICAgICAgdmFyIGksIGxlbiwgbmV4dCwgcmVmMSwgcmVzdWx0cywgdGlsZTtcbiAgICAgIHRpbGUgPSBzdGVwICE9IG51bGwgPyBzdGVwLm5leHRUaWxlIDogdGhpcy5mcm9tO1xuICAgICAgcmVmMSA9IHRoaXMuZ2V0Q29ubmVjdGVkVG9UaWxlKHRpbGUpO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmMS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBuZXh0ID0gcmVmMVtpXTtcbiAgICAgICAgaWYgKHRoaXMudGlsZUlzVmFsaWQobmV4dCkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hZGRTdGVwKG5ldyBQYXRoRmluZGVyLlN0ZXAodGhpcywgKHN0ZXAgIT0gbnVsbCA/IHN0ZXAgOiBudWxsKSwgdGlsZSwgbmV4dCkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgdGlsZUVxdWFsKHRpbGVBLCB0aWxlQikge1xuICAgICAgcmV0dXJuIHRpbGVBID09PSB0aWxlQiB8fCAoKHRpbGVBLmVtdWxhdGVkIHx8IHRpbGVCLmVtdWxhdGVkKSAmJiB0aWxlQS54ID09PSB0aWxlQi54ICYmIHRpbGVBLnkgPT09IHRpbGVCLnkpO1xuICAgIH1cblxuICAgIGFycml2ZWRBdERlc3RpbmF0aW9uKHN0ZXApIHtcbiAgICAgIGlmICh0aGlzLmFycml2ZWRDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFycml2ZWRDYWxsYmFjayhzdGVwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVFcXVhbChzdGVwLnRpbGUsIHRoaXMudG8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZFN0ZXAoc3RlcCkge1xuICAgICAgdmFyIHNvbHV0aW9uQ2FuZGlkYXRlO1xuICAgICAgaWYgKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdID0ge307XG4gICAgICB9XG4gICAgICBpZiAoISgodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSAhPSBudWxsKSAmJiB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldLmdldFRvdGFsTGVuZ3RoKCkgPD0gc3RlcC5nZXRUb3RhbExlbmd0aCgpKSkge1xuICAgICAgICBpZiAodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVTdGVwKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gPSBzdGVwO1xuICAgICAgICB0aGlzLnF1ZXVlLnNwbGljZSh0aGlzLmdldFN0ZXBSYW5rKHN0ZXApLCAwLCBzdGVwKTtcbiAgICAgICAgc29sdXRpb25DYW5kaWRhdGUgPSBuZXcgUGF0aEZpbmRlci5TdGVwKHRoaXMsIHN0ZXAsIHN0ZXAubmV4dFRpbGUsIG51bGwpO1xuICAgICAgICBpZiAodGhpcy5hcnJpdmVkQXREZXN0aW5hdGlvbihzb2x1dGlvbkNhbmRpZGF0ZSkgJiYgISgodGhpcy5zb2x1dGlvbiAhPSBudWxsKSAmJiB0aGlzLnNvbHV0aW9uLnByZXYuZ2V0VG90YWxMZW5ndGgoKSA8PSBzdGVwLmdldFRvdGFsTGVuZ3RoKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc29sdXRpb24gPSBzb2x1dGlvbkNhbmRpZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZVN0ZXAoc3RlcCkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaW5kZXggPSB0aGlzLnF1ZXVlLmluZGV4T2Yoc3RlcCk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGJlc3QoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZVt0aGlzLnF1ZXVlLmxlbmd0aCAtIDFdO1xuICAgIH1cblxuICAgIGdldFN0ZXBSYW5rKHN0ZXApIHtcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhzdGVwLmdldEVmZmljaWVuY3koKSwgMCwgdGhpcy5xdWV1ZS5sZW5ndGggLSAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0U3RlcFJhbmsoZWZmaWNpZW5jeSwgbWluLCBtYXgpIHtcbiAgICAgIHZhciByZWYsIHJlZlBvcztcbiAgICAgIHJlZlBvcyA9IE1hdGguZmxvb3IoKG1heCAtIG1pbikgLyAyKSArIG1pbjtcbiAgICAgIHJlZiA9IHRoaXMucXVldWVbcmVmUG9zXS5nZXRFZmZpY2llbmN5KCk7XG4gICAgICBpZiAocmVmID09PSBlZmZpY2llbmN5KSB7XG4gICAgICAgIHJldHVybiByZWZQb3M7XG4gICAgICB9IGVsc2UgaWYgKHJlZiA+IGVmZmljaWVuY3kpIHtcbiAgICAgICAgaWYgKHJlZlBvcyA9PT0gbWluKSB7XG4gICAgICAgICAgcmV0dXJuIG1pbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoZWZmaWNpZW5jeSwgbWluLCByZWZQb3MgLSAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlZlBvcyA9PT0gbWF4KSB7XG4gICAgICAgICAgcmV0dXJuIG1heCArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIHJlZlBvcyArIDEsIG1heCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBQYXRoRmluZGVyLnByb3BlcnRpZXMoe1xuICAgIHZhbGlkVGlsZUNhbGxiYWNrOiB7fVxuICB9KTtcblxuICByZXR1cm4gUGF0aEZpbmRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuUGF0aEZpbmRlci5TdGVwID0gY2xhc3MgU3RlcCB7XG4gIGNvbnN0cnVjdG9yKHBhdGhGaW5kZXIsIHByZXYsIHRpbGUxLCBuZXh0VGlsZSkge1xuICAgIHRoaXMucGF0aEZpbmRlciA9IHBhdGhGaW5kZXI7XG4gICAgdGhpcy5wcmV2ID0gcHJldjtcbiAgICB0aGlzLnRpbGUgPSB0aWxlMTtcbiAgICB0aGlzLm5leHRUaWxlID0gbmV4dFRpbGU7XG4gIH1cblxuICBwb3NUb1RpbGVPZmZzZXQoeCwgeSkge1xuICAgIHZhciB0aWxlO1xuICAgIHRpbGUgPSBNYXRoLmZsb29yKHgpID09PSB0aGlzLnRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLnRpbGUueSA/IHRoaXMudGlsZSA6ICh0aGlzLm5leHRUaWxlICE9IG51bGwpICYmIE1hdGguZmxvb3IoeCkgPT09IHRoaXMubmV4dFRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLm5leHRUaWxlLnkgPyB0aGlzLm5leHRUaWxlIDogKHRoaXMucHJldiAhPSBudWxsKSAmJiBNYXRoLmZsb29yKHgpID09PSB0aGlzLnByZXYudGlsZS54ICYmIE1hdGguZmxvb3IoeSkgPT09IHRoaXMucHJldi50aWxlLnkgPyB0aGlzLnByZXYudGlsZSA6IGNvbnNvbGUubG9nKCdNYXRoLmZsb29yKCcgKyB4ICsgJykgPT0gJyArIHRoaXMudGlsZS54LCAnTWF0aC5mbG9vcignICsgeSArICcpID09ICcgKyB0aGlzLnRpbGUueSwgdGhpcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgdGlsZTogdGlsZSxcbiAgICAgIG9mZnNldFg6IHggLSB0aWxlLngsXG4gICAgICBvZmZzZXRZOiB5IC0gdGlsZS55XG4gICAgfTtcbiAgfVxuXG4gIGdldEV4aXQoKSB7XG4gICAgaWYgKHRoaXMuZXhpdCA9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5uZXh0VGlsZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuZXhpdCA9IHtcbiAgICAgICAgICB4OiAodGhpcy50aWxlLnggKyB0aGlzLm5leHRUaWxlLnggKyAxKSAvIDIsXG4gICAgICAgICAgeTogKHRoaXMudGlsZS55ICsgdGhpcy5uZXh0VGlsZS55ICsgMSkgLyAyXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmV4aXQgPSB7XG4gICAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUsXG4gICAgICAgICAgeTogdGhpcy50aWxlLnkgKyAwLjVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhpdDtcbiAgfVxuXG4gIGdldEVudHJ5KCkge1xuICAgIGlmICh0aGlzLmVudHJ5ID09IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLnByZXYgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmVudHJ5ID0ge1xuICAgICAgICAgIHg6ICh0aGlzLnRpbGUueCArIHRoaXMucHJldi50aWxlLnggKyAxKSAvIDIsXG4gICAgICAgICAgeTogKHRoaXMudGlsZS55ICsgdGhpcy5wcmV2LnRpbGUueSArIDEpIC8gMlxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbnRyeSA9IHtcbiAgICAgICAgICB4OiB0aGlzLnRpbGUueCArIDAuNSxcbiAgICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbnRyeTtcbiAgfVxuXG4gIGdldExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPT0gbnVsbCkge1xuICAgICAgdGhpcy5sZW5ndGggPSAodGhpcy5uZXh0VGlsZSA9PSBudWxsKSB8fCAodGhpcy5wcmV2ID09IG51bGwpID8gMC41IDogdGhpcy5wcmV2LnRpbGUueCA9PT0gdGhpcy5uZXh0VGlsZS54IHx8IHRoaXMucHJldi50aWxlLnkgPT09IHRoaXMubmV4dFRpbGUueSA/IDEgOiBNYXRoLnNxcnQoMC41KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xuICB9XG5cbiAgZ2V0U3RhcnRMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMuc3RhcnRMZW5ndGggPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGFydExlbmd0aCA9IHRoaXMucHJldiAhPSBudWxsID8gdGhpcy5wcmV2LmdldFRvdGFsTGVuZ3RoKCkgOiAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGFydExlbmd0aDtcbiAgfVxuXG4gIGdldFRvdGFsTGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLnRvdGFsTGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMudG90YWxMZW5ndGggPSB0aGlzLmdldFN0YXJ0TGVuZ3RoKCkgKyB0aGlzLmdldExlbmd0aCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b3RhbExlbmd0aDtcbiAgfVxuXG4gIGdldEVmZmljaWVuY3koKSB7XG4gICAgaWYgKHRoaXMuZWZmaWNpZW5jeSA9PSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucGF0aEZpbmRlci5lZmZpY2llbmN5Q2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLmVmZmljaWVuY3kgPSB0aGlzLnBhdGhGaW5kZXIuZWZmaWNpZW5jeUNhbGxiYWNrKHRoaXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5ID0gLXRoaXMuZ2V0UmVtYWluaW5nKCkgKiAxLjEgLSB0aGlzLmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVmZmljaWVuY3k7XG4gIH1cblxuICBnZXRSZW1haW5pbmcoKSB7XG4gICAgdmFyIGZyb20sIHRvLCB4LCB5O1xuICAgIGlmICh0aGlzLnJlbWFpbmluZyA9PSBudWxsKSB7XG4gICAgICBmcm9tID0gdGhpcy5nZXRFeGl0KCk7XG4gICAgICB0byA9IHtcbiAgICAgICAgeDogdGhpcy5wYXRoRmluZGVyLnRvLnggKyAwLjUsXG4gICAgICAgIHk6IHRoaXMucGF0aEZpbmRlci50by55ICsgMC41XG4gICAgICB9O1xuICAgICAgeCA9IHRvLnggLSBmcm9tLng7XG4gICAgICB5ID0gdG8ueSAtIGZyb20ueTtcbiAgICAgIHRoaXMucmVtYWluaW5nID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW1haW5pbmc7XG4gIH1cblxufTtcblxucmV0dXJuKFBhdGhGaW5kZXIpO30pOyIsImlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgIGdyZWVrQWxwaGFiZXQ6IHJlcXVpcmUoJy4vc3RyaW5ncy9ncmVla0FscGhhYmV0JyksXG4gICAgICBzdGFyTmFtZXM6IHJlcXVpcmUoJy4vc3RyaW5ncy9zdGFyTmFtZXMnKVxuICB9O1xufSIsIm1vZHVsZS5leHBvcnRzPVtcblwiYWxwaGFcIiwgICBcImJldGFcIiwgICAgXCJnYW1tYVwiLCAgIFwiZGVsdGFcIixcblwiZXBzaWxvblwiLCBcInpldGFcIiwgICAgXCJldGFcIiwgICAgIFwidGhldGFcIixcblwiaW90YVwiLCAgICBcImthcHBhXCIsICAgXCJsYW1iZGFcIiwgIFwibXVcIixcblwibnVcIiwgICAgICBcInhpXCIsICAgICAgXCJvbWljcm9uXCIsIFwicGlcIixcdFxuXCJyaG9cIiwgICAgIFwic2lnbWFcIiwgICBcInRhdVwiLCAgICAgXCJ1cHNpbG9uXCIsXG5cInBoaVwiLCAgICAgXCJjaGlcIiwgICAgIFwicHNpXCIsICAgICBcIm9tZWdhXCJcbl0iLCJtb2R1bGUuZXhwb3J0cz1bXG5cIkFjaGVybmFyXCIsICAgICBcIk1haWFcIiwgICAgICAgIFwiQXRsYXNcIiwgICAgICAgIFwiU2FsbVwiLCAgICAgICBcIkFsbmlsYW1cIiwgICAgICBcIk5la2thclwiLCAgICAgIFwiRWxuYXRoXCIsICAgICAgIFwiVGh1YmFuXCIsXG5cIkFjaGlyZFwiLCAgICAgICBcIk1hcmZpa1wiLCAgICAgIFwiQXV2YVwiLCAgICAgICAgIFwiU2FyZ2FzXCIsICAgICBcIkFsbml0YWtcIiwgICAgICBcIk5paGFsXCIsICAgICAgIFwiRW5pZlwiLCAgICAgICAgIFwiVG9yY3VsYXJpc1wiLFxuXCJBY3J1eFwiLCAgICAgICAgXCJNYXJrYWJcIiwgICAgICBcIkF2aW9yXCIsICAgICAgICBcIlNhcmluXCIsICAgICAgXCJBbHBoYXJkXCIsICAgICAgXCJOdW5raVwiLCAgICAgICBcIkV0YW1pblwiLCAgICAgICBcIlR1cmFpc1wiLFxuXCJBY3ViZW5zXCIsICAgICAgXCJNYXRhclwiLCAgICAgICBcIkF6ZWxmYWZhZ2VcIiwgICBcIlNjZXB0cnVtXCIsICAgXCJBbHBoZWtrYVwiLCAgICAgXCJOdXNha2FuXCIsICAgICBcIkZvbWFsaGF1dFwiLCAgICBcIlR5bFwiLFxuXCJBZGFyYVwiLCAgICAgICAgXCJNZWJzdXRhXCIsICAgICBcIkF6aGFcIiwgICAgICAgICBcIlNjaGVhdFwiLCAgICAgXCJBbHBoZXJhdHpcIiwgICAgXCJQZWFjb2NrXCIsICAgICBcIkZvcm5hY2lzXCIsICAgICBcIlVudWthbGhhaVwiLFxuXCJBZGhhZmVyYVwiLCAgICAgXCJNZWdyZXpcIiwgICAgICBcIkF6bWlkaXNrZVwiLCAgICBcIlNlZ2luXCIsICAgICAgXCJBbHJhaVwiLCAgICAgICAgXCJQaGFkXCIsICAgICAgICBcIkZ1cnVkXCIsICAgICAgICBcIlZlZ2FcIixcblwiQWRoaWxcIiwgICAgICAgIFwiTWVpc3NhXCIsICAgICAgXCJCYWhhbVwiLCAgICAgICAgXCJTZWdpbnVzXCIsICAgIFwiQWxyaXNoYVwiLCAgICAgIFwiUGhhZXRcIiwgICAgICAgXCJHYWNydXhcIiwgICAgICAgXCJWaW5kZW1pYXRyaXhcIixcblwiQWdlbmFcIiwgICAgICAgIFwiTWVrYnVkYVwiLCAgICAgXCJCZWNydXhcIiwgICAgICAgXCJTaGFtXCIsICAgICAgIFwiQWxzYWZpXCIsICAgICAgIFwiUGhlcmthZFwiLCAgICAgXCJHaWFuZmFyXCIsICAgICAgXCJXYXNhdFwiLFxuXCJBbGFkZmFyXCIsICAgICAgXCJNZW5rYWxpbmFuXCIsICBcIkJlaWRcIiwgICAgICAgICBcIlNoYXJhdGFuXCIsICAgXCJBbHNjaWF1a2F0XCIsICAgXCJQbGVpb25lXCIsICAgICBcIkdvbWVpc2FcIiwgICAgICBcIldlemVuXCIsXG5cIkFsYXRoZmFyXCIsICAgICBcIk1lbmthclwiLCAgICAgIFwiQmVsbGF0cml4XCIsICAgIFwiU2hhdWxhXCIsICAgICBcIkFsc2hhaW5cIiwgICAgICBcIlBvbGFyaXNcIiwgICAgIFwiR3JhZmZpYXNcIiwgICAgIFwiV2V6blwiLFxuXCJBbGJhbGRhaFwiLCAgICAgXCJNZW5rZW50XCIsICAgICBcIkJldGVsZ2V1c2VcIiwgICBcIlNoZWRpclwiLCAgICAgXCJBbHNoYXRcIiwgICAgICAgXCJQb2xsdXhcIiwgICAgICBcIkdyYWZpYXNcIiwgICAgICBcIlllZFwiLFxuXCJBbGJhbGlcIiwgICAgICAgXCJNZW5raWJcIiwgICAgICBcIkJvdGVpblwiLCAgICAgICBcIlNoZWxpYWtcIiwgICAgXCJBbHN1aGFpbFwiLCAgICAgXCJQb3JyaW1hXCIsICAgICBcIkdydW1pdW1cIiwgICAgICBcIllpbGR1blwiLFxuXCJBbGJpcmVvXCIsICAgICAgXCJNZXJha1wiLCAgICAgICBcIkJyYWNoaXVtXCIsICAgICBcIlNpcml1c1wiLCAgICAgXCJBbHRhaXJcIiwgICAgICAgXCJQcmFlY2lwdWFcIiwgICBcIkhhZGFyXCIsICAgICAgICBcIlphbmlhaFwiLFxuXCJBbGNoaWJhXCIsICAgICAgXCJNZXJnYVwiLCAgICAgICBcIkNhbm9wdXNcIiwgICAgICBcIlNpdHVsYVwiLCAgICAgXCJBbHRhcmZcIiwgICAgICAgXCJQcm9jeW9uXCIsICAgICBcIkhhZWRpXCIsICAgICAgICBcIlphdXJha1wiLFxuXCJBbGNvclwiLCAgICAgICAgXCJNZXJvcGVcIiwgICAgICBcIkNhcGVsbGFcIiwgICAgICBcIlNrYXRcIiwgICAgICAgXCJBbHRlcmZcIiwgICAgICAgXCJQcm9wdXNcIiwgICAgICBcIkhhbWFsXCIsICAgICAgICBcIlphdmlqYWhcIixcblwiQWxjeW9uZVwiLCAgICAgIFwiTWVzYXJ0aGltXCIsICAgXCJDYXBoXCIsICAgICAgICAgXCJTcGljYVwiLCAgICAgIFwiQWx1ZHJhXCIsICAgICAgIFwiUmFuYVwiLCAgICAgICAgXCJIYXNzYWxlaFwiLCAgICAgXCJaaWJhbFwiLFxuXCJBbGRlcmFtaW5cIiwgICAgXCJNZXRhbGxhaFwiLCAgICBcIkNhc3RvclwiLCAgICAgICBcIlN0ZXJvcGVcIiwgICAgXCJBbHVsYVwiLCAgICAgICAgXCJSYXNcIiwgICAgICAgICBcIkhlemVcIiwgICAgICAgICBcIlpvc21hXCIsXG5cIkFsZGhpYmFoXCIsICAgICBcIk1pYXBsYWNpZHVzXCIsIFwiQ2ViYWxyYWlcIiwgICAgIFwiU3VhbG9jaW5cIiwgICBcIkFseWFcIiwgICAgICAgICBcIlJhc2FsZ2V0aGlcIiwgIFwiSG9lZHVzXCIsICAgICAgIFwiQXF1YXJpdXNcIixcblwiQWxmaXJrXCIsICAgICAgIFwiTWlua2FyXCIsICAgICAgXCJDZWxhZW5vXCIsICAgICAgXCJTdWJyYVwiLCAgICAgIFwiQWx6aXJyXCIsICAgICAgIFwiUmFzYWxoYWd1ZVwiLCAgXCJIb21hbVwiLCAgICAgICAgXCJBcmllc1wiLFxuXCJBbGdlbmliXCIsICAgICAgXCJNaW50YWthXCIsICAgICBcIkNoYXJhXCIsICAgICAgICBcIlN1aGFpbFwiLCAgICAgXCJBbmNoYVwiLCAgICAgICAgXCJSYXN0YWJhblwiLCAgICBcIkh5YWR1bVwiLCAgICAgICBcIkNlcGhldXNcIixcblwiQWxnaWViYVwiLCAgICAgIFwiTWlyYVwiLCAgICAgICAgXCJDaG9ydFwiLCAgICAgICAgXCJTdWxhZmF0XCIsICAgIFwiQW5nZXRlbmFyXCIsICAgIFwiUmVndWx1c1wiLCAgICAgXCJJemFyXCIsICAgICAgICAgXCJDZXR1c1wiLFxuXCJBbGdvbFwiLCAgICAgICAgXCJNaXJhY2hcIiwgICAgICBcIkN1cnNhXCIsICAgICAgICBcIlN5cm1hXCIsICAgICAgXCJBbmthYVwiLCAgICAgICAgXCJSaWdlbFwiLCAgICAgICBcIkphYmJhaFwiLCAgICAgICBcIkNvbHVtYmFcIixcblwiQWxnb3JhYlwiLCAgICAgIFwiTWlyYW1cIiwgICAgICAgXCJEYWJpaFwiLCAgICAgICAgXCJUYWJpdFwiLCAgICAgIFwiQW5zZXJcIiwgICAgICAgIFwiUm90YW5ldlwiLCAgICAgXCJLYWphbVwiLCAgICAgICAgXCJDb21hXCIsXG5cIkFsaGVuYVwiLCAgICAgICBcIk1pcnBoYWtcIiwgICAgIFwiRGVuZWJcIiwgICAgICAgIFwiVGFsaXRoYVwiLCAgICBcIkFudGFyZXNcIiwgICAgICBcIlJ1Y2hiYVwiLCAgICAgIFwiS2F1c1wiLCAgICAgICAgIFwiQ29yb25hXCIsXG5cIkFsaW90aFwiLCAgICAgICBcIk1pemFyXCIsICAgICAgIFwiRGVuZWJvbGFcIiwgICAgIFwiVGFuaWFcIiwgICAgICBcIkFyY3R1cnVzXCIsICAgICBcIlJ1Y2hiYWhcIiwgICAgIFwiS2VpZFwiLCAgICAgICAgIFwiQ3J1eFwiLFxuXCJBbGthaWRcIiwgICAgICAgXCJNdWZyaWRcIiwgICAgICBcIkRoZW5lYlwiLCAgICAgICBcIlRhcmF6ZWRcIiwgICAgXCJBcmthYlwiLCAgICAgICAgXCJSdWtiYXRcIiwgICAgICBcIktpdGFscGhhXCIsICAgICBcIkRyYWNvXCIsXG5cIkFsa2FsdXJvcHNcIiwgICBcIk11bGlwaGVuXCIsICAgIFwiRGlhZGVtXCIsICAgICAgIFwiVGF5Z2V0YVwiLCAgICBcIkFybmViXCIsICAgICAgICBcIlNhYmlrXCIsICAgICAgIFwiS29jYWJcIiwgICAgICAgIFwiR3J1c1wiLFxuXCJBbGtlc1wiLCAgICAgICAgXCJNdXJ6aW1cIiwgICAgICBcIkRpcGhkYVwiLCAgICAgICBcIlRlZ21lblwiLCAgICAgXCJBcnJha2lzXCIsICAgICAgXCJTYWRhbGFjaGJpYVwiLCBcIktvcm5lcGhvcm9zXCIsICBcIkh5ZHJhXCIsXG5cIkFsa3VyaGFoXCIsICAgICBcIk11c2NpZGFcIiwgICAgIFwiRHNjaHViYmFcIiwgICAgIFwiVGVqYXRcIiwgICAgICBcIkFzY2VsbGFcIiwgICAgICBcIlNhZGFsbWVsaWtcIiwgIFwiS3JhelwiLCAgICAgICAgIFwiTGFjZXJ0YVwiLFxuXCJBbG1hYWtcIiwgICAgICAgXCJOYW9zXCIsICAgICAgICBcIkRzaWJhblwiLCAgICAgICBcIlRlcmViZWxsdW1cIiwgXCJBc2VsbHVzXCIsICAgICAgXCJTYWRhbHN1dWRcIiwgICBcIkt1bWFcIiwgICAgICAgICBcIk1lbnNhXCIsXG5cIkFsbmFpclwiLCAgICAgICBcIk5hc2hcIiwgICAgICAgIFwiRHViaGVcIiwgICAgICAgIFwiVGhhYml0XCIsICAgICBcIkFzdGVyb3BlXCIsICAgICBcIlNhZHJcIiwgICAgICAgIFwiTGVzYXRoXCIsICAgICAgIFwiTWFhc3ltXCIsXG5cIkFsbmF0aFwiLCAgICAgICBcIk5hc2hpcmFcIiwgICAgIFwiRWxlY3RyYVwiLCAgICAgIFwiVGhlZW1pbVwiLCAgICBcIkF0aWtcIiwgICAgICAgICBcIlNhaXBoXCIsICAgICAgIFwiUGhvZW5peFwiLCAgICAgIFwiTm9ybWFcIlxuXSIsInZhciBEaXJlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0aW9uID0gY2xhc3MgRGlyZWN0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZSwgeCwgeSwgaW52ZXJzZU5hbWUpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmludmVyc2VOYW1lID0gaW52ZXJzZU5hbWU7XG4gIH1cblxuICBnZXRJbnZlcnNlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yW3RoaXMuaW52ZXJzZU5hbWVdO1xuICB9XG5cbn07XG5cbkRpcmVjdGlvbi51cCA9IG5ldyBEaXJlY3Rpb24oJ3VwJywgMCwgLTEsICdkb3duJyk7XG5cbkRpcmVjdGlvbi5kb3duID0gbmV3IERpcmVjdGlvbignZG93bicsIDAsIDEsICd1cCcpO1xuXG5EaXJlY3Rpb24ubGVmdCA9IG5ldyBEaXJlY3Rpb24oJ2xlZnQnLCAtMSwgMCwgJ3JpZ2h0Jyk7XG5cbkRpcmVjdGlvbi5yaWdodCA9IG5ldyBEaXJlY3Rpb24oJ3JpZ2h0JywgMSwgMCwgJ2xlZnQnKTtcblxuRGlyZWN0aW9uLmFkamFjZW50cyA9IFtEaXJlY3Rpb24udXAsIERpcmVjdGlvbi5kb3duLCBEaXJlY3Rpb24ubGVmdCwgRGlyZWN0aW9uLnJpZ2h0XTtcblxuRGlyZWN0aW9uLnRvcExlZnQgPSBuZXcgRGlyZWN0aW9uKCd0b3BMZWZ0JywgLTEsIC0xLCAnYm90dG9tUmlnaHQnKTtcblxuRGlyZWN0aW9uLnRvcFJpZ2h0ID0gbmV3IERpcmVjdGlvbigndG9wUmlnaHQnLCAxLCAtMSwgJ2JvdHRvbUxlZnQnKTtcblxuRGlyZWN0aW9uLmJvdHRvbVJpZ2h0ID0gbmV3IERpcmVjdGlvbignYm90dG9tUmlnaHQnLCAxLCAxLCAndG9wTGVmdCcpO1xuXG5EaXJlY3Rpb24uYm90dG9tTGVmdCA9IG5ldyBEaXJlY3Rpb24oJ2JvdHRvbUxlZnQnLCAtMSwgMSwgJ3RvcFJpZ2h0Jyk7XG5cbkRpcmVjdGlvbi5jb3JuZXJzID0gW0RpcmVjdGlvbi50b3BMZWZ0LCBEaXJlY3Rpb24udG9wUmlnaHQsIERpcmVjdGlvbi5ib3R0b21SaWdodCwgRGlyZWN0aW9uLmJvdHRvbUxlZnRdO1xuXG5EaXJlY3Rpb24uYWxsID0gW0RpcmVjdGlvbi51cCwgRGlyZWN0aW9uLmRvd24sIERpcmVjdGlvbi5sZWZ0LCBEaXJlY3Rpb24ucmlnaHQsIERpcmVjdGlvbi50b3BMZWZ0LCBEaXJlY3Rpb24udG9wUmlnaHQsIERpcmVjdGlvbi5ib3R0b21SaWdodCwgRGlyZWN0aW9uLmJvdHRvbUxlZnRdO1xuIiwidmFyIERpcmVjdGlvbiwgRWxlbWVudCwgVGlsZTtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCcuL0RpcmVjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih4MSwgeTEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnggPSB4MTtcbiAgICAgIHRoaXMueSA9IHkxO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHZhciBjb250YWluZXI7XG4gICAgICByZXR1cm4gY29udGFpbmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRSZWxhdGl2ZVRpbGUoeCwgeSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmdldFRpbGUodGhpcy54ICsgeCwgdGhpcy55ICsgeSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmluZERpcmVjdGlvbk9mKHRpbGUpIHtcbiAgICAgIGlmICh0aWxlLnRpbGUpIHtcbiAgICAgICAgdGlsZSA9IHRpbGUudGlsZTtcbiAgICAgIH1cbiAgICAgIGlmICgodGlsZS54ICE9IG51bGwpICYmICh0aWxlLnkgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZmluZCgoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBkLnggPT09IHRpbGUueCAtIHRoaXMueCAmJiBkLnkgPT09IHRpbGUueSAtIHRoaXMueTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQoY2hpbGQsIGNoZWNrUmVmID0gdHJ1ZSkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgICAgaWYgKGNoZWNrUmVmKSB7XG4gICAgICAgIGNoaWxkLnRpbGUgPSB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkKGNoaWxkLCBjaGVja1JlZiA9IHRydWUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGVja1JlZiAmJiBjaGlsZC50aWxlID09PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiBjaGlsZC50aWxlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkaXN0KHRpbGUpIHtcbiAgICAgIHZhciBjdG5EaXN0LCByZWYsIHgsIHk7XG4gICAgICBpZiAoKHRpbGUgIT0gbnVsbCA/IHRpbGUuZ2V0RmluYWxUaWxlIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCgodGlsZSAhPSBudWxsID8gdGlsZS54IDogdm9pZCAwKSAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpICYmICh0aGlzLnggIT0gbnVsbCkgJiYgKHRoaXMueSAhPSBudWxsKSAmJiAodGhpcy5jb250YWluZXIgPT09IHRpbGUuY29udGFpbmVyIHx8IChjdG5EaXN0ID0gKHJlZiA9IHRoaXMuY29udGFpbmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kaXN0ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGlzdCh0aWxlLmNvbnRhaW5lcikgOiB2b2lkIDAgOiB2b2lkIDApKSkge1xuICAgICAgICB4ID0gdGlsZS54IC0gdGhpcy54O1xuICAgICAgICB5ID0gdGlsZS55IC0gdGhpcy55O1xuICAgICAgICBpZiAoY3RuRGlzdCkge1xuICAgICAgICAgIHggKz0gY3RuRGlzdC54O1xuICAgICAgICAgIHkgKz0gY3RuRGlzdC55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogeCxcbiAgICAgICAgICB5OiB5LFxuICAgICAgICAgIGxlbmd0aDogTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRGaW5hbFRpbGUoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlLnByb3BlcnRpZXMoe1xuICAgIGNoaWxkcmVuOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBjb250YWluZXI6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lciAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRqYWNlbnRUaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aWxlLmFkamFjZW50VGlsZXNQcm9wZXJ0eS5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGFkamFjZW50VGlsZXM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIGlmIChpbnZhbGlkYXRpb24ucHJvcCh0aGlzLmNvbnRhaW5lclByb3BlcnR5KSkge1xuICAgICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWRqYWNlbnRzLm1hcCgoZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpdmVUaWxlKGQueCwgZC55KTtcbiAgICAgICAgICB9KS5maWx0ZXIoKHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBFbGVtZW50LCBUaWxlQ29udGFpbmVyLCBUaWxlUmVmZXJlbmNlO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCcuL1RpbGVSZWZlcmVuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlQ29udGFpbmVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlQ29udGFpbmVyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpIHtcbiAgICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgdGlsZS55IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgYm91bmRhcmllcy50b3AgPSB0aWxlLnk7XG4gICAgICB9XG4gICAgICBpZiAoKGJvdW5kYXJpZXMubGVmdCA9PSBudWxsKSB8fCB0aWxlLnggPCBib3VuZGFyaWVzLmxlZnQpIHtcbiAgICAgICAgYm91bmRhcmllcy5sZWZ0ID0gdGlsZS54O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB0aWxlLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHRpbGUueTtcbiAgICAgIH1cbiAgICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCB0aWxlLnggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzLnJpZ2h0ID0gdGlsZS54O1xuICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLmNvb3JkcyA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXMudGlsZXMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGRUaWxlKHRpbGUpIHtcbiAgICAgIGlmICghdGhpcy50aWxlcy5pbmNsdWRlcyh0aWxlKSkge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIGlmICh0aGlzLmNvb3Jkc1t0aWxlLnhdID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNvb3Jkc1t0aWxlLnhdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldID0gdGlsZTtcbiAgICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYm91bmRhcmllc1Byb3BlcnR5LmdldHRlci5jYWxjdWxhdGVkKSB7XG4gICAgICAgICAgdGhpcy5fYWRkVG9Cb25kYXJpZXModGlsZSwgdGhpcy5ib3VuZGFyaWVzUHJvcGVydHkudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZW1vdmVUaWxlKHRpbGUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy50aWxlcy5pbmRleE9mKHRpbGUpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBkZWxldGUgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldO1xuICAgICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ib3VuZGFyaWVzUHJvcGVydHkuZ2V0dGVyLmNhbGN1bGF0ZWQpIHtcbiAgICAgICAgICBpZiAodGhpcy5ib3VuZGFyaWVzLnRvcCA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5ib3R0b20gPT09IHRpbGUueSB8fCB0aGlzLmJvdW5kYXJpZXMubGVmdCA9PT0gdGlsZS54IHx8IHRoaXMuYm91bmRhcmllcy5yaWdodCA9PT0gdGlsZS54KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib3VuZGFyaWVzUHJvcGVydHkuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZVRpbGVBdCh4LCB5KSB7XG4gICAgICB2YXIgdGlsZTtcbiAgICAgIGlmICh0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZVRpbGUodGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCgocmVmID0gdGhpcy5jb29yZHNbeF0pICE9IG51bGwgPyByZWZbeV0gOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29vcmRzW3hdW3ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRNYXRyaXgobWF0cml4KSB7XG4gICAgICB2YXIgb3B0aW9ucywgcm93LCB0aWxlLCB4LCB5O1xuICAgICAgZm9yICh5IGluIG1hdHJpeCkge1xuICAgICAgICByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgIGZvciAoeCBpbiByb3cpIHtcbiAgICAgICAgICB0aWxlID0gcm93W3hdO1xuICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB4OiBwYXJzZUludCh4KSxcbiAgICAgICAgICAgIHk6IHBhcnNlSW50KHkpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhpcy5hZGRUaWxlKHRpbGUob3B0aW9ucykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWxlLnggPSBvcHRpb25zLng7XG4gICAgICAgICAgICB0aWxlLnkgPSBvcHRpb25zLnk7XG4gICAgICAgICAgICB0aGlzLmFkZFRpbGUodGlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpblJhbmdlKHRpbGUsIHJhbmdlKSB7XG4gICAgICB2YXIgZm91bmQsIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgdGlsZXMsIHgsIHk7XG4gICAgICB0aWxlcyA9IFtdO1xuICAgICAgcmFuZ2UtLTtcbiAgICAgIGZvciAoeCA9IGkgPSByZWYgPSB0aWxlLnggLSByYW5nZSwgcmVmMSA9IHRpbGUueCArIHJhbmdlOyAocmVmIDw9IHJlZjEgPyBpIDw9IHJlZjEgOiBpID49IHJlZjEpOyB4ID0gcmVmIDw9IHJlZjEgPyArK2kgOiAtLWkpIHtcbiAgICAgICAgZm9yICh5ID0gaiA9IHJlZjIgPSB0aWxlLnkgLSByYW5nZSwgcmVmMyA9IHRpbGUueSArIHJhbmdlOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeSA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICAgIGlmIChNYXRoLnNxcnQoKHggLSB0aWxlLngpICogKHggLSB0aWxlLngpICsgKHkgLSB0aWxlLnkpICogKHkgLSB0aWxlLnkpKSA8PSByYW5nZSAmJiAoKGZvdW5kID0gdGhpcy5nZXRUaWxlKHgsIHkpKSAhPSBudWxsKSkge1xuICAgICAgICAgICAgdGlsZXMucHVzaChmb3VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgYWxsVGlsZXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy50aWxlcy5zbGljZSgpO1xuICAgIH1cblxuICAgIGNsZWFyQWxsKCkge1xuICAgICAgdmFyIGksIGxlbiwgcmVmLCB0aWxlO1xuICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgcmVmID0gdGhpcy50aWxlcztcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdGlsZSA9IHJlZltpXTtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY29vcmRzID0ge307XG4gICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9zZXN0KG9yaWdpblRpbGUsIGZpbHRlcikge1xuICAgICAgdmFyIGNhbmRpZGF0ZXMsIGdldFNjb3JlO1xuICAgICAgZ2V0U2NvcmUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5zY29yZSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5zY29yZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLnNjb3JlID0gY2FuZGlkYXRlLmdldEZpbmFsVGlsZSgpLmRpc3Qob3JpZ2luVGlsZSkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2FuZGlkYXRlcyA9IHRoaXMudGlsZXMuZmlsdGVyKGZpbHRlcikubWFwKCh0KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZVJlZmVyZW5jZSh0KTtcbiAgICAgIH0pO1xuICAgICAgY2FuZGlkYXRlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRTY29yZShhKSAtIGdldFNjb3JlKGIpO1xuICAgICAgfSk7XG4gICAgICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzWzBdLnRpbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5KCkge1xuICAgICAgdmFyIG91dDtcbiAgICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICBvdXQuY29vcmRzID0gdGhpcy5jb29yZHM7XG4gICAgICBvdXQudGlsZXMgPSB0aGlzLnRpbGVzO1xuICAgICAgb3V0Lm93bmVyID0gZmFsc2U7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIG1lcmdlKGN0biwgbWVyZ2VGbiwgYXNPd25lciA9IGZhbHNlKSB7XG4gICAgICB2YXIgb3V0LCB0bXA7XG4gICAgICBvdXQgPSBuZXcgVGlsZUNvbnRhaW5lcigpO1xuICAgICAgb3V0Lm93bmVyID0gYXNPd25lcjtcbiAgICAgIHRtcCA9IGN0bi5jb3B5KCk7XG4gICAgICB0aGlzLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUEpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGUsIHRpbGVCO1xuICAgICAgICB0aWxlQiA9IHRtcC5nZXRUaWxlKHRpbGVBLngsIHRpbGVBLnkpO1xuICAgICAgICBpZiAodGlsZUIpIHtcbiAgICAgICAgICB0bXAucmVtb3ZlVGlsZSh0aWxlQik7XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4odGlsZUEsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdG1wLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUIpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGU7XG4gICAgICAgIG1lcmdlZFRpbGUgPSBtZXJnZUZuKG51bGwsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlQ29udGFpbmVyLnByb3BlcnRpZXMoe1xuICAgIG93bmVyOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBib3VuZGFyaWVzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYm91bmRhcmllcztcbiAgICAgICAgYm91bmRhcmllcyA9IHtcbiAgICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgICAgbGVmdDogbnVsbCxcbiAgICAgICAgICBib3R0b206IG51bGwsXG4gICAgICAgICAgcmlnaHQ6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZUNvbnRhaW5lcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBUaWxlUmVmZXJlbmNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVSZWZlcmVuY2UgPSBjbGFzcyBUaWxlUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IodGlsZSkge1xuICAgIHRoaXMudGlsZSA9IHRpbGU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgeDoge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaW5hbFRpbGUoKS54O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeToge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaW5hbFRpbGUoKS55O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRGaW5hbFRpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgfVxuXG59O1xuIiwidmFyIEVsZW1lbnQsIFRpbGVkO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZWQgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgcHV0T25SYW5kb21UaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgZm91bmQ7XG4gICAgICBmb3VuZCA9IHRoaXMuZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKTtcbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlID0gZm91bmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgY2FuZGlkYXRlLCBwb3MsIHJlbWFpbmluZztcbiAgICAgIHJlbWFpbmluZyA9IHRpbGVzLnNsaWNlKCk7XG4gICAgICB3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcG9zID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcmVtYWluaW5nLmxlbmd0aCk7XG4gICAgICAgIGNhbmRpZGF0ZSA9IHJlbWFpbmluZy5zcGxpY2UocG9zLCAxKVswXTtcbiAgICAgICAgaWYgKHRoaXMuY2FuR29PblRpbGUoY2FuZGlkYXRlKSkge1xuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNhbkdvT25UaWxlKHRpbGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldEZpbmFsVGlsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZWQucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbih2YWwsIG9sZCkge1xuICAgICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgICBvbGQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRpbGUuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIG9mZnNldFk6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkRpcmVjdGlvblwiOiByZXF1aXJlKFwiLi9EaXJlY3Rpb25cIiksXG4gIFwiVGlsZVwiOiByZXF1aXJlKFwiLi9UaWxlXCIpLFxuICBcIlRpbGVDb250YWluZXJcIjogcmVxdWlyZShcIi4vVGlsZUNvbnRhaW5lclwiKSxcbiAgXCJUaWxlUmVmZXJlbmNlXCI6IHJlcXVpcmUoXCIuL1RpbGVSZWZlcmVuY2VcIiksXG4gIFwiVGlsZWRcIjogcmVxdWlyZShcIi4vVGlsZWRcIiksXG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaW1pbmc9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbWluZy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbWluZzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaW1pbmc9VGltaW5nO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFRpbWluZztcblRpbWluZyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGltaW5nIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgdG9nZ2xlKHZhbCkge1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdmFsID0gIXRoaXMucnVubmluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJ1bm5pbmcgPSB2YWw7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZSkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yLlRpbWVyKHtcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICB0aW1pbmc6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEludGVydmFsKGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIoe1xuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgIHJlcGVhdDogdHJ1ZSxcbiAgICAgICAgdGltaW5nOiB0aGlzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaW1pbmcucHJvcGVydGllcyh7XG4gICAgcnVubmluZzoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFRpbWluZztcblxufSkuY2FsbCh0aGlzKTtcblxuVGltaW5nLlRpbWVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaW1lciBleHRlbmRzIEVsZW1lbnQge1xuICAgIHRvZ2dsZSh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHZhbCA9ICF0aGlzLnBhdXNlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBhdXNlZCA9IHZhbDtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbiAgICB9XG5cbiAgICB1bnBhdXNlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5ub3coKTtcbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pZCA9IHNldEludGVydmFsKHRoaXMudGljay5iaW5kKHRoaXMpLCB0aGlzLnJlbWFpbmluZ1RpbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQgPSBzZXRUaW1lb3V0KHRoaXMudGljay5iaW5kKHRoaXMpLCB0aGlzLnJlbWFpbmluZ1RpbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0b3AoKSB7XG4gICAgICB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWUgLSAodGhpcy5jb25zdHJ1Y3Rvci5ub3coKSAtIHRoaXMuc3RhcnRUaW1lKTtcbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICByZXR1cm4gY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIG5vdygpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93ICE9PSBudWxsID8gKHJlZiA9IHdpbmRvdy5wZXJmb3JtYW5jZSkgIT0gbnVsbCA/IHJlZi5ub3cgOiB2b2lkIDAgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIH0gZWxzZSBpZiAoKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MgIT09IG51bGwgPyBwcm9jZXNzLnVwdGltZSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy51cHRpbWUoKSAqIDEwMDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgdGhpcy5yZXBldGl0aW9uICs9IDE7XG4gICAgICBpZiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuY29uc3RydWN0b3Iubm93KCk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtYWluaW5nVGltZSA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIGlmICh0aGlzLnJlcGVhdCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGltZXIucHJvcGVydGllcyh7XG4gICAgdGltZToge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgcGF1c2VkOiB7XG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgcnVubmluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gIWludmFsaWRhdG9yLnByb3AodGhpcy5wYXVzZWRQcm9wZXJ0eSkgJiYgaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RpbWluZy5ydW5uaW5nJykgIT09IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24odmFsLCBvbGQpIHtcbiAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAob2xkKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIGVsYXBzZWRUaW1lOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5wcm9wKHRoaXMucnVubmluZ1Byb3BlcnR5KSkge1xuICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LmludmFsaWRhdGUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5ub3coKSAtIHRoaXMuc3RhcnRUaW1lICsgdGhpcy50aW1lIC0gdGhpcy5yZW1haW5pbmdUaW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRpbWUgLSB0aGlzLnJlbWFpbmluZ1RpbWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gdmFsO1xuICAgICAgICAgIGlmICh0aGlzLnJlbWFpbmluZ1RpbWUgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGljaygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWUgLSB2YWw7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZWxhcHNlZFRpbWVQcm9wZXJ0eS5pbnZhbGlkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHByYzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkpIC8gdGhpcy50aW1lO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsYXBzZWRUaW1lID0gdGhpcy50aW1lICogdmFsO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVtYWluaW5nVGltZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVwZWF0OiB7XG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgcmVwZXRpdGlvbjoge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgY2FsbGJhY2s6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaW1lcjtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKFRpbWluZyk7fSk7IiwidmFyIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIsIENvbm5lY3RlZCwgRWxlbWVudCwgU2lnbmFsT3BlcmF0aW9uO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblNpZ25hbE9wZXJhdGlvbiA9IHJlcXVpcmUoJy4vU2lnbmFsT3BlcmF0aW9uJyk7XG5cbkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykud2F0Y2hlcnMuQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0ZWQgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbm5lY3RlZCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNhbkNvbm5lY3RUbyh0YXJnZXQpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdGFyZ2V0LmFkZFNpZ25hbCA9PT0gXCJmdW5jdGlvblwiO1xuICAgIH1cblxuICAgIGFjY2VwdFNpZ25hbChzaWduYWwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG9uQWRkQ29ubmVjdGlvbihjb25uKSB7fVxuXG4gICAgb25SZW1vdmVDb25uZWN0aW9uKGNvbm4pIHt9XG5cbiAgICBvbk5ld1NpZ25hbFR5cGUoc2lnbmFsKSB7fVxuXG4gICAgb25BZGRTaWduYWwoc2lnbmFsLCBvcCkge31cblxuICAgIG9uUmVtb3ZlU2lnbmFsKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlbW92ZVNpZ25hbFR5cGUoc2lnbmFsLCBvcCkge31cblxuICAgIG9uUmVwbGFjZVNpZ25hbChvbGRTaWduYWwsIG5ld1NpZ25hbCwgb3ApIHt9XG5cbiAgICBjb250YWluc1NpZ25hbChzaWduYWwsIGNoZWNrTGFzdCA9IGZhbHNlLCBjaGVja09yaWdpbikge1xuICAgICAgcmV0dXJuIHRoaXMuc2lnbmFscy5maW5kKGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgcmV0dXJuIGMubWF0Y2goc2lnbmFsLCBjaGVja0xhc3QsIGNoZWNrT3JpZ2luKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZFNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgYXV0b1N0YXJ0O1xuICAgICAgaWYgKCEob3AgIT0gbnVsbCA/IG9wLmZpbmRMaW1pdGVyKHRoaXMpIDogdm9pZCAwKSkge1xuICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgb3AgPSBuZXcgU2lnbmFsT3BlcmF0aW9uKCk7XG4gICAgICAgICAgYXV0b1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBvcC5hZGRPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICAgIHZhciBzaW1pbGFyO1xuICAgICAgICAgIGlmICghdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwsIHRydWUpICYmIHRoaXMuYWNjZXB0U2lnbmFsKHNpZ25hbCkpIHtcbiAgICAgICAgICAgIHNpbWlsYXIgPSB0aGlzLmNvbnRhaW5zU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbHMucHVzaChzaWduYWwpO1xuICAgICAgICAgICAgdGhpcy5vbkFkZFNpZ25hbChzaWduYWwsIG9wKTtcbiAgICAgICAgICAgIGlmICghc2ltaWxhcikge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbk5ld1NpZ25hbFR5cGUoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGF1dG9TdGFydCkge1xuICAgICAgICAgIG9wLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzaWduYWw7XG4gICAgfVxuXG4gICAgcmVtb3ZlU2lnbmFsKHNpZ25hbCwgb3ApIHtcbiAgICAgIHZhciBhdXRvU3RhcnQ7XG4gICAgICBpZiAoIShvcCAhPSBudWxsID8gb3AuZmluZExpbWl0ZXIodGhpcykgOiB2b2lkIDApKSB7XG4gICAgICAgIGlmICghb3ApIHtcbiAgICAgICAgICBvcCA9IG5ldyBTaWduYWxPcGVyYXRpb247XG4gICAgICAgICAgYXV0b1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBvcC5hZGRPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICAgIHZhciBleGlzdGluZztcbiAgICAgICAgICBpZiAoKGV4aXN0aW5nID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwsIHRydWUpKSAmJiB0aGlzLmFjY2VwdFNpZ25hbChzaWduYWwpKSB7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbHMuc3BsaWNlKHRoaXMuc2lnbmFscy5pbmRleE9mKGV4aXN0aW5nKSwgMSk7XG4gICAgICAgICAgICB0aGlzLm9uUmVtb3ZlU2lnbmFsKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICAgICAgdmFyIHNpbWlsYXI7XG4gICAgICAgICAgICAgIHNpbWlsYXIgPSB0aGlzLmNvbnRhaW5zU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgICAgICAgIGlmIChzaW1pbGFyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25SZXBsYWNlU2lnbmFsKHNpZ25hbCwgc2ltaWxhciwgb3ApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlU2lnbmFsVHlwZShzaWduYWwsIG9wKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGVwQnlTdGVwKSB7XG4gICAgICAgICAgICByZXR1cm4gb3Auc3RlcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhdXRvU3RhcnQpIHtcbiAgICAgICAgICByZXR1cm4gb3Auc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKSB7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgPT09IHRoaXMpIHtcbiAgICAgICAgcmV0dXJuIHNpZ25hbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzaWduYWwud2l0aExhc3QodGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tGb3J3YXJkV2F0Y2hlcigpIHtcbiAgICAgIGlmICghdGhpcy5mb3J3YXJkV2F0Y2hlcikge1xuICAgICAgICB0aGlzLmZvcndhcmRXYXRjaGVyID0gbmV3IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICAgIHNjb3BlOiB0aGlzLFxuICAgICAgICAgIHByb3BlcnR5OiAnb3V0cHV0cycsXG4gICAgICAgICAgb25BZGRlZDogZnVuY3Rpb24ob3V0cHV0LCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkZWRTaWduYWxzLmZvckVhY2goKHNpZ25hbCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkU2lnbmFsVG8oc2lnbmFsLCBvdXRwdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBvblJlbW92ZWQ6IGZ1bmN0aW9uKG91dHB1dCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcEZvcndhcmRlZFNpZ25hbFRvKHNpZ25hbCwgb3V0cHV0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRXYXRjaGVyLmJpbmQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3J3YXJkU2lnbmFsKHNpZ25hbCwgb3ApIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgdGhpcy5mb3J3YXJkZWRTaWduYWxzLmFkZChzaWduYWwpO1xuICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24oY29ubikge1xuICAgICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgICByZXR1cm4gY29ubi5hZGRTaWduYWwobmV4dCwgb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLmNoZWNrRm9yd2FyZFdhdGNoZXIoKTtcbiAgICB9XG5cbiAgICBmb3J3YXJkQWxsU2lnbmFsc1RvKGNvbm4sIG9wKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzLmZvckVhY2goKHNpZ25hbCkgPT4ge1xuICAgICAgICB2YXIgbmV4dDtcbiAgICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgICByZXR1cm4gY29ubi5hZGRTaWduYWwobmV4dCwgb3ApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RvcEZvcndhcmRlZFNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5yZW1vdmUoc2lnbmFsKTtcbiAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgIHJldHVybiB0aGlzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIGlmIChzaWduYWwubGFzdCAhPT0gY29ubikge1xuICAgICAgICAgIHJldHVybiBjb25uLnJlbW92ZVNpZ25hbChuZXh0LCBvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0b3BBbGxGb3J3YXJkZWRTaWduYWxUbyhjb25uLCBvcCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgdmFyIG5leHQ7XG4gICAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgcmV0dXJuIGNvbm4ucmVtb3ZlU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvcndhcmRTaWduYWxUbyhzaWduYWwsIGNvbm4sIG9wKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgIGlmIChzaWduYWwubGFzdCAhPT0gY29ubikge1xuICAgICAgICByZXR1cm4gY29ubi5hZGRTaWduYWwobmV4dCwgb3ApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0b3BGb3J3YXJkZWRTaWduYWxUbyhzaWduYWwsIGNvbm4sIG9wKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgIGlmIChzaWduYWwubGFzdCAhPT0gY29ubikge1xuICAgICAgICByZXR1cm4gY29ubi5yZW1vdmVTaWduYWwobmV4dCwgb3ApO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIENvbm5lY3RlZC5wcm9wZXJ0aWVzKHtcbiAgICBzaWduYWxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBpbnB1dHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9LFxuICAgIG91dHB1dHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9LFxuICAgIGZvcndhcmRlZFNpZ25hbHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBDb25uZWN0ZWQ7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgRWxlbWVudCwgU2lnbmFsO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsID0gY2xhc3MgU2lnbmFsIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpbiwgdHlwZSA9ICdzaWduYWwnLCBleGNsdXNpdmUgPSBmYWxzZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW47XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmV4Y2x1c2l2ZSA9IGV4Y2x1c2l2ZTtcbiAgICB0aGlzLmxhc3QgPSB0aGlzLm9yaWdpbjtcbiAgfVxuXG4gIHdpdGhMYXN0KGxhc3QpIHtcbiAgICB2YXIgc2lnbmFsO1xuICAgIHNpZ25hbCA9IG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3Rvcih0aGlzLm9yaWdpbiwgdGhpcy50eXBlLCB0aGlzLmV4Y2x1c2l2ZSk7XG4gICAgc2lnbmFsLmxhc3QgPSBsYXN0O1xuICAgIHJldHVybiBzaWduYWw7XG4gIH1cblxuICBjb3B5KCkge1xuICAgIHZhciBzaWduYWw7XG4gICAgc2lnbmFsID0gbmV3IHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yKHRoaXMub3JpZ2luLCB0aGlzLnR5cGUsIHRoaXMuZXhjbHVzaXZlKTtcbiAgICBzaWduYWwubGFzdCA9IHRoaXMubGFzdDtcbiAgICByZXR1cm4gc2lnbmFsO1xuICB9XG5cbiAgbWF0Y2goc2lnbmFsLCBjaGVja0xhc3QgPSBmYWxzZSwgY2hlY2tPcmlnaW4gPSB0aGlzLmV4Y2x1c2l2ZSkge1xuICAgIHJldHVybiAoIWNoZWNrTGFzdCB8fCBzaWduYWwubGFzdCA9PT0gdGhpcy5sYXN0KSAmJiAoY2hlY2tPcmlnaW4gfHwgc2lnbmFsLm9yaWdpbiA9PT0gdGhpcy5vcmlnaW4pICYmIHNpZ25hbC50eXBlID09PSB0aGlzLnR5cGU7XG4gIH1cblxufTtcbiIsInZhciBFbGVtZW50LCBTaWduYWxPcGVyYXRpb247XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWxPcGVyYXRpb24gPSBjbGFzcyBTaWduYWxPcGVyYXRpb24gZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgdGhpcy5saW1pdGVycyA9IFtdO1xuICB9XG5cbiAgYWRkT3BlcmF0aW9uKGZ1bmN0LCBwcmlvcml0eSA9IDEpIHtcbiAgICBpZiAocHJpb3JpdHkpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnVuc2hpZnQoZnVuY3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5wdXNoKGZ1bmN0KTtcbiAgICB9XG4gIH1cblxuICBhZGRMaW1pdGVyKGNvbm5lY3RlZCkge1xuICAgIGlmICghdGhpcy5maW5kTGltaXRlcihjb25uZWN0ZWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5saW1pdGVycy5wdXNoKGNvbm5lY3RlZCk7XG4gICAgfVxuICB9XG5cbiAgZmluZExpbWl0ZXIoY29ubmVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMubGltaXRlcnMuaW5kZXhPZihjb25uZWN0ZWQpID4gLTE7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgcmVzdWx0cztcbiAgICByZXN1bHRzID0gW107XG4gICAgd2hpbGUgKHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5zdGVwKCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIHN0ZXAoKSB7XG4gICAgdmFyIGZ1bmN0O1xuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZG9uZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmdW5jdCA9IHRoaXMucXVldWUuc2hpZnQoZnVuY3QpO1xuICAgICAgcmV0dXJuIGZ1bmN0KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGRvbmUoKSB7fVxuXG59O1xuIiwidmFyIENvbm5lY3RlZCwgU2lnbmFsLCBTaWduYWxPcGVyYXRpb24sIFNpZ25hbFNvdXJjZTtcblxuQ29ubmVjdGVkID0gcmVxdWlyZSgnLi9Db25uZWN0ZWQnKTtcblxuU2lnbmFsID0gcmVxdWlyZSgnLi9TaWduYWwnKTtcblxuU2lnbmFsT3BlcmF0aW9uID0gcmVxdWlyZSgnLi9TaWduYWxPcGVyYXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWxTb3VyY2UgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFNpZ25hbFNvdXJjZSBleHRlbmRzIENvbm5lY3RlZCB7fTtcblxuICBTaWduYWxTb3VyY2UucHJvcGVydGllcyh7XG4gICAgYWN0aXZhdGVkOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3A7XG4gICAgICAgIG9wID0gbmV3IFNpZ25hbE9wZXJhdGlvbigpO1xuICAgICAgICBpZiAodGhpcy5hY3RpdmF0ZWQpIHtcbiAgICAgICAgICB0aGlzLmZvcndhcmRTaWduYWwodGhpcy5zaWduYWwsIG9wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnN0b3BGb3J3YXJkZWRTaWduYWwodGhpcy5zaWduYWwsIG9wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3Auc3RhcnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNpZ25hbDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTaWduYWwodGhpcywgJ3Bvd2VyJywgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gU2lnbmFsU291cmNlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIENvbm5lY3RlZCwgU3dpdGNoO1xuXG5Db25uZWN0ZWQgPSByZXF1aXJlKCcuL0Nvbm5lY3RlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN3aXRjaCA9IGNsYXNzIFN3aXRjaCBleHRlbmRzIENvbm5lY3RlZCB7fTtcbiIsInZhciBDb25uZWN0ZWQsIERpcmVjdGlvbiwgVGlsZWQsIFdpcmUsXG4gIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvbjtcblxuQ29ubmVjdGVkID0gcmVxdWlyZSgnLi9Db25uZWN0ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBXaXJlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBXaXJlIGV4dGVuZHMgVGlsZWQge1xuICAgIGNvbnN0cnVjdG9yKHdpcmVUeXBlID0gJ3JlZCcpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLndpcmVUeXBlID0gd2lyZVR5cGU7XG4gICAgfVxuXG4gICAgZmluZERpcmVjdGlvbnNUbyhjb25uKSB7XG4gICAgICB2YXIgZGlyZWN0aW9ucztcbiAgICAgIGRpcmVjdGlvbnMgPSBjb25uLnRpbGVzICE9IG51bGwgPyBjb25uLnRpbGVzLm1hcCgodGlsZSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlLmZpbmREaXJlY3Rpb25PZih0aWxlKTtcbiAgICAgIH0pIDogW3RoaXMudGlsZS5maW5kRGlyZWN0aW9uT2YoY29ubildO1xuICAgICAgcmV0dXJuIGRpcmVjdGlvbnMuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgIT0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbkNvbm5lY3RUbyh0YXJnZXQpIHtcbiAgICAgIHJldHVybiBDb25uZWN0ZWQucHJvdG90eXBlLmNhbkNvbm5lY3RUby5jYWxsKHRoaXMsIHRhcmdldCkgJiYgKCh0YXJnZXQud2lyZVR5cGUgPT0gbnVsbCkgfHwgdGFyZ2V0LndpcmVUeXBlID09PSB0aGlzLndpcmVUeXBlKTtcbiAgICB9XG5cbiAgICBvbk5ld1NpZ25hbFR5cGUoc2lnbmFsLCBvcCkge1xuICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZFNpZ25hbChzaWduYWwsIG9wKTtcbiAgICB9XG5cbiAgfTtcblxuICBXaXJlLmV4dGVuZChDb25uZWN0ZWQpO1xuXG4gIFdpcmUucHJvcGVydGllcyh7XG4gICAgb3V0cHV0czoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRpb24pIHtcbiAgICAgICAgdmFyIHBhcmVudDtcbiAgICAgICAgcGFyZW50ID0gaW52YWxpZGF0aW9uLnByb3AodGhpcy50aWxlUHJvcGVydHkpO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdGlvbi5wcm9wKHBhcmVudC5hZGphY2VudFRpbGVzUHJvcGVydHkpLnJlZHVjZSgocmVzLCB0aWxlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmNvbmNhdChpbnZhbGlkYXRpb24ucHJvcCh0aWxlLmNoaWxkcmVuUHJvcGVydHkpLmZpbHRlcigoY2hpbGQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FuQ29ubmVjdFRvKGNoaWxkKTtcbiAgICAgICAgICAgIH0pLnRvQXJyYXkoKSk7XG4gICAgICAgICAgfSwgW10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY29ubmVjdGVkRGlyZWN0aW9uczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdGlvbi5wcm9wKHRoaXMub3V0cHV0c1Byb3BlcnR5KS5yZWR1Y2UoKG91dCwgY29ubikgPT4ge1xuICAgICAgICAgIHRoaXMuZmluZERpcmVjdGlvbnNUbyhjb25uKS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwob3V0LCBkKSA8IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG91dC5wdXNoKGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXaXJlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQ29ubmVjdGVkXCI6IHJlcXVpcmUoXCIuL0Nvbm5lY3RlZFwiKSxcbiAgXCJTaWduYWxcIjogcmVxdWlyZShcIi4vU2lnbmFsXCIpLFxuICBcIlNpZ25hbE9wZXJhdGlvblwiOiByZXF1aXJlKFwiLi9TaWduYWxPcGVyYXRpb25cIiksXG4gIFwiU2lnbmFsU291cmNlXCI6IHJlcXVpcmUoXCIuL1NpZ25hbFNvdXJjZVwiKSxcbiAgXCJTd2l0Y2hcIjogcmVxdWlyZShcIi4vU3dpdGNoXCIpLFxuICBcIldpcmVcIjogcmVxdWlyZShcIi4vV2lyZVwiKSxcbn0iLCJ2YXIgQWlybG9jaywgVGlsZTtcblxuVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFpcmxvY2sgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFpcmxvY2sgZXh0ZW5kcyBUaWxlIHtcbiAgICBhdHRhY2hUbyhhaXJsb2NrKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdHRhY2hlZFRvID0gYWlybG9jaztcbiAgICB9XG5cbiAgfTtcblxuICBBaXJsb2NrLnByb3BlcnRpZXMoe1xuICAgIGRpcmVjdGlvbjoge30sXG4gICAgYXR0YWNoZWRUbzoge31cbiAgfSk7XG5cbiAgcmV0dXJuIEFpcmxvY2s7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQWlybG9jay5qcy5tYXBcbiIsInZhciBBcHByb2FjaCwgRWxlbWVudCwgVGltaW5nO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwcm9hY2ggPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFwcHJvYWNoIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgc3RhcnQobG9jYXRpb24pIHtcbiAgICAgIGlmICh0aGlzLnZhbGlkKSB7XG4gICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdWJqZWN0LnhNZW1iZXJzLmFkZFByb3BlcnR5UmVmKCdwb3NpdGlvbi5vZmZzZXRYJywgdGhpcyk7XG4gICAgICAgIHRoaXMuc3ViamVjdC55TWVtYmVycy5hZGRQcm9wZXJ0eVJlZigncG9zaXRpb24ub2Zmc2V0WScsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcy50aW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZG9uZSgpO1xuICAgICAgICB9LCB0aGlzLmR1cmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkb25lKCkge1xuICAgICAgdGhpcy5zdWJqZWN0LnhNZW1iZXJzLnJlbW92ZVJlZigncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpO1xuICAgICAgdGhpcy5zdWJqZWN0LnlNZW1iZXJzLnJlbW92ZVJlZigncG9zaXRpb24ub2Zmc2V0WScsIHRoaXMpO1xuICAgICAgdGhpcy5zdWJqZWN0LnggPSB0aGlzLnRhcmdldFBvcy54O1xuICAgICAgdGhpcy5zdWJqZWN0LnkgPSB0aGlzLnRhcmdldFBvcy54O1xuICAgICAgdGhpcy5zdWJqZWN0QWlybG9jay5hdHRhY2hUbyh0YXJnZXRBaXJsb2NrKTtcbiAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuXG4gIH07XG5cbiAgQXBwcm9hY2gucHJvcGVydGllcyh7XG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaW5pdGlhbERpc3Q6IHtcbiAgICAgIGRlZmF1bHQ6IDUwMFxuICAgIH0sXG4gICAgcm5nOiB7XG4gICAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICAgIH0sXG4gICAgYW5nbGU6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJuZyAqIE1hdGguUEkgKiAyO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRpbmdQb3M6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogdGhpcy5zdGFydGluZ1Bvcy54ICsgdGhpcy5pbml0aWFsRGlzdCAqIE1hdGguY29zKHRoaXMuYW5nbGUpLFxuICAgICAgICAgIHk6IHRoaXMuc3RhcnRpbmdQb3MueSArIHRoaXMuaW5pdGlhbERpc3QgKiBNYXRoLnNpbih0aGlzLmFuZ2xlKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG4gICAgdGFyZ2V0UG9zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHRoaXMudGFyZ2V0QWlybG9jay54IC0gdGhpcy5zdWJqZWN0QWlybG9jay54LFxuICAgICAgICAgIHk6IHRoaXMudGFyZ2V0QWlybG9jay55IC0gdGhpcy5zdWJqZWN0QWlybG9jay55XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSxcbiAgICBzdWJqZWN0OiB7fSxcbiAgICB0YXJnZXQ6IHt9LFxuICAgIHN1YmplY3RBaXJsb2NrOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYWlybG9ja3M7XG4gICAgICAgIGFpcmxvY2tzID0gdGhpcy5zdWJqZWN0LmFpcmxvY2tzLnNsaWNlKCk7XG4gICAgICAgIGFpcmxvY2tzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICB2YXIgdmFsQSwgdmFsQjtcbiAgICAgICAgICB2YWxBID0gTWF0aC5hYnMoYS5kaXJlY3Rpb24ueCAtIE1hdGguY29zKHRoaXMuYW5nbGUpKSArIE1hdGguYWJzKGEuZGlyZWN0aW9uLnkgLSBNYXRoLnNpbih0aGlzLmFuZ2xlKSk7XG4gICAgICAgICAgdmFsQiA9IE1hdGguYWJzKGIuZGlyZWN0aW9uLnggLSBNYXRoLmNvcyh0aGlzLmFuZ2xlKSkgKyBNYXRoLmFicyhiLmRpcmVjdGlvbi55IC0gTWF0aC5zaW4odGhpcy5hbmdsZSkpO1xuICAgICAgICAgIHJldHVybiB2YWxBIC0gdmFsQjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhaXJsb2Nrc1swXTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldEFpcmxvY2s6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5haXJsb2Nrcy5maW5kKCh0YXJnZXQpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0LmRpcmVjdGlvbi5nZXRJbnZlcnNlKCkgPT09IHRoaXMuc3ViamVjdEFpcmxvY2suZGlyZWN0aW9uO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmluZzoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIGNvbXBsZXRlOiB7XG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgY3VycmVudFBvczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgZW5kLCBwcmMsIHN0YXJ0O1xuICAgICAgICBzdGFydCA9IGludmFsaWRhdG9yLnByb3AodGhpcy5zdGFydGluZ1Bvc1Byb3BlcnR5KTtcbiAgICAgICAgZW5kID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnRhcmdldFBvc1Byb3BlcnR5KTtcbiAgICAgICAgcHJjID0gaW52YWxpZGF0b3IucHJvcFBhdGgoXCJ0aW1lb3V0LnByY1wiKSB8fCAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IChlbmQueCAtIHN0YXJ0LngpICogcHJjICsgc3RhcnQueCxcbiAgICAgICAgICB5OiAoZW5kLnkgLSBzdGFydC55KSAqIHByYyArIHN0YXJ0LnlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGR1cmF0aW9uOiB7XG4gICAgICBkZWZhdWx0OiAxMDAwMFxuICAgIH0sXG4gICAgdGltZW91dDoge31cbiAgfSk7XG5cbiAgcmV0dXJuIEFwcHJvYWNoO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0FwcHJvYWNoLmpzLm1hcFxuIiwidmFyIEF1dG9tYXRpY0Rvb3IsIENoYXJhY3RlciwgRG9vcjtcblxuRG9vciA9IHJlcXVpcmUoJy4vRG9vcicpO1xuXG5DaGFyYWN0ZXIgPSByZXF1aXJlKCcuL0NoYXJhY3RlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9tYXRpY0Rvb3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEF1dG9tYXRpY0Rvb3IgZXh0ZW5kcyBEb29yIHtcbiAgICB1cGRhdGVUaWxlTWVtYmVycyhvbGQpIHtcbiAgICAgIHZhciByZWYsIHJlZjEsIHJlZjIsIHJlZjM7XG4gICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgaWYgKChyZWYgPSBvbGQud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmLnJlbW92ZVByb3BlcnR5KHRoaXMudW5sb2NrZWRQcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYxID0gb2xkLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZjEucmVtb3ZlUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICAgIGlmICgocmVmMiA9IHRoaXMudGlsZS53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYyLmFkZFByb3BlcnR5KHRoaXMudW5sb2NrZWRQcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChyZWYzID0gdGhpcy50aWxlLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCA/IHJlZjMuYWRkUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICBzdXBlci5pbml0KCk7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuO1xuICAgIH1cblxuICAgIGlzQWN0aXZhdG9yUHJlc2VudChpbnZhbGlkYXRlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZWFjdGl2ZVRpbGVzKGludmFsaWRhdGUpLnNvbWUoKHRpbGUpID0+IHtcbiAgICAgICAgdmFyIGNoaWxkcmVuO1xuICAgICAgICBjaGlsZHJlbiA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AodGlsZS5jaGlsZHJlblByb3BlcnR5KSA6IHRpbGUuY2hpbGRyZW47XG4gICAgICAgIHJldHVybiBjaGlsZHJlbi5zb21lKChjaGlsZCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNhbkJlQWN0aXZhdGVkQnkoY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbkJlQWN0aXZhdGVkQnkoZWxlbSkge1xuICAgICAgcmV0dXJuIGVsZW0gaW5zdGFuY2VvZiBDaGFyYWN0ZXI7XG4gICAgfVxuXG4gICAgZ2V0UmVhY3RpdmVUaWxlcyhpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgZGlyZWN0aW9uLCB0aWxlO1xuICAgICAgdGlsZSA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AodGhpcy50aWxlUHJvcGVydHkpIDogdGhpcy50aWxlO1xuICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIGRpcmVjdGlvbiA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AodGhpcy5kaXJlY3Rpb25Qcm9wZXJ0eSkgOiB0aGlzLmRpcmVjdGlvbjtcbiAgICAgIGlmIChkaXJlY3Rpb24gPT09IERvb3IuZGlyZWN0aW9ucy5ob3Jpem9udGFsKSB7XG4gICAgICAgIHJldHVybiBbdGlsZSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMCwgMSksIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKDAsIC0xKV0uZmlsdGVyKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdCAhPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbdGlsZSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMSwgMCksIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKC0xLCAwKV0uZmlsdGVyKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdCAhPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBBdXRvbWF0aWNEb29yLnByb3BlcnRpZXMoe1xuICAgIG9wZW46IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0ZSkge1xuICAgICAgICByZXR1cm4gIWludmFsaWRhdGUucHJvcCh0aGlzLmxvY2tlZFByb3BlcnR5KSAmJiB0aGlzLmlzQWN0aXZhdG9yUHJlc2VudChpbnZhbGlkYXRlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxvY2tlZDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHVubG9ja2VkOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRlLnByb3AodGhpcy5sb2NrZWRQcm9wZXJ0eSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXV0b21hdGljRG9vcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9BdXRvbWF0aWNEb29yLmpzLm1hcFxuIiwidmFyIENoYXJhY3RlciwgRGFtYWdlYWJsZSwgVGlsZWQsIFdhbGtBY3Rpb247XG5cblRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkO1xuXG5EYW1hZ2VhYmxlID0gcmVxdWlyZSgnLi9EYW1hZ2VhYmxlJyk7XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvV2Fsa0FjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ2hhcmFjdGVyIGV4dGVuZHMgVGlsZWQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIHNldERlZmF1bHRzKCkge1xuICAgICAgaWYgKCF0aGlzLnRpbGUgJiYgKHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lciAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXRPblJhbmRvbVRpbGUodGhpcy5nYW1lLm1haW5UaWxlQ29udGFpbmVyLnRpbGVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5Hb09uVGlsZSh0aWxlKSB7XG4gICAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCA/IHRpbGUud2Fsa2FibGUgOiB2b2lkIDApICE9PSBmYWxzZTtcbiAgICB9XG5cbiAgICB3YWxrVG8odGlsZSkge1xuICAgICAgdmFyIGFjdGlvbjtcbiAgICAgIGFjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgYWN0b3I6IHRoaXMsXG4gICAgICAgIHRhcmdldDogdGlsZVxuICAgICAgfSk7XG4gICAgICBhY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgcmV0dXJuIGFjdGlvbjtcbiAgICB9XG5cbiAgICBpc1NlbGVjdGFibGVCeShwbGF5ZXIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICB9O1xuXG4gIENoYXJhY3Rlci5leHRlbmQoRGFtYWdlYWJsZSk7XG5cbiAgQ2hhcmFjdGVyLnByb3BlcnRpZXMoe1xuICAgIGdhbWU6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24odmFsLCBvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNldERlZmF1bHRzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgZGVmYXVsdDogMC41XG4gICAgfSxcbiAgICBvZmZzZXRZOiB7XG4gICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgIGRlZmF1bHQ6IDAuNVxuICAgIH0sXG4gICAgdGlsZToge1xuICAgICAgY29tcG9zZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHRBY3Rpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wUGF0aChcInRpbGUucHJvdmlkZWRBY3Rpb25zXCIpIHx8IFtdO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENoYXJhY3RlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9DaGFyYWN0ZXIuanMubWFwXG4iLCJ2YXIgQXR0YWNrTW92ZUFjdGlvbiwgQ2hhcmFjdGVyQUksIERvb3IsIFByb3BlcnR5V2F0Y2hlciwgVGlsZUNvbnRhaW5lciwgVmlzaW9uQ2FsY3VsYXRvciwgV2Fsa0FjdGlvbjtcblxuVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyO1xuXG5WaXNpb25DYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9WaXNpb25DYWxjdWxhdG9yJyk7XG5cbkRvb3IgPSByZXF1aXJlKCcuL0Rvb3InKTtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9XYWxrQWN0aW9uJyk7XG5cbkF0dGFja01vdmVBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbicpO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykud2F0Y2hlcnMuUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlckFJID0gY2xhc3MgQ2hhcmFjdGVyQUkge1xuICBjb25zdHJ1Y3RvcihjaGFyYWN0ZXIpIHtcbiAgICB0aGlzLmNoYXJhY3RlciA9IGNoYXJhY3RlcjtcbiAgICB0aGlzLm5leHRBY3Rpb25DYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLm5leHRBY3Rpb24oKTtcbiAgICB9O1xuICAgIHRoaXMudmlzaW9uTWVtb3J5ID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICB0aGlzLnRpbGVXYXRjaGVyID0gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVWaXNpb25NZW1vcnkoKTtcbiAgICAgIH0sXG4gICAgICBwcm9wZXJ0eTogdGhpcy5jaGFyYWN0ZXIucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ3RpbGUnKVxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy50aWxlV2F0Y2hlci5iaW5kKCk7XG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGlvbigpO1xuICB9XG5cbiAgbmV4dEFjdGlvbigpIHtcbiAgICB2YXIgZW5uZW15LCB1bmV4cGxvcmVkO1xuICAgIHRoaXMudXBkYXRlVmlzaW9uTWVtb3J5KCk7XG4gICAgaWYgKGVubmVteSA9IHRoaXMuZ2V0Q2xvc2VzdEVuZW15KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dGFja01vdmVUbyhlbm5lbXkpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodW5leHBsb3JlZCA9IHRoaXMuZ2V0Q2xvc2VzdFVuZXhwbG9yZWQoKSkge1xuICAgICAgcmV0dXJuIHRoaXMud2Fsa1RvKHVuZXhwbG9yZWQpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc2V0VmlzaW9uTWVtb3J5KCk7XG4gICAgICByZXR1cm4gdGhpcy53YWxrVG8odGhpcy5nZXRDbG9zZXN0VW5leHBsb3JlZCgpKS5vbignZW5kJywgbmV4dEFjdGlvbkNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaXNpb25NZW1vcnkoKSB7XG4gICAgdmFyIGNhbGN1bGF0b3I7XG4gICAgY2FsY3VsYXRvciA9IG5ldyBWaXNpb25DYWxjdWxhdG9yKHRoaXMuY2hhcmFjdGVyLnRpbGUpO1xuICAgIGNhbGN1bGF0b3IuY2FsY3VsKCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaW9uTWVtb3J5ID0gY2FsY3VsYXRvci50b0NvbnRhaW5lcigpLm1lcmdlKHRoaXMudmlzaW9uTWVtb3J5LCAoYSwgYikgPT4ge1xuICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICBhID0gdGhpcy5hbmFseXplVGlsZShhKTtcbiAgICAgIH1cbiAgICAgIGlmICgoYSAhPSBudWxsKSAmJiAoYiAhPSBudWxsKSkge1xuICAgICAgICBhLnZpc2liaWxpdHkgPSBNYXRoLm1heChhLnZpc2liaWxpdHksIGIudmlzaWJpbGl0eSk7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGEgfHwgYjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFuYWx5emVUaWxlKHRpbGUpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRpbGUuZW5uZW15U3BvdHRlZCA9IChyZWYgPSB0aWxlLmdldEZpbmFsVGlsZSgpLmNoaWxkcmVuKSAhPSBudWxsID8gcmVmLmZpbmQoKGMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmlzRW5uZW15KGMpO1xuICAgIH0pIDogdm9pZCAwO1xuICAgIHRpbGUuZXhwbG9yYWJsZSA9IHRoaXMuaXNFeHBsb3JhYmxlKHRpbGUpO1xuICAgIHJldHVybiB0aWxlO1xuICB9XG5cbiAgaXNFbm5lbXkoZWxlbSkge1xuICAgIHZhciByZWY7XG4gICAgcmV0dXJuIChyZWYgPSB0aGlzLmNoYXJhY3Rlci5vd25lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuaXNFbmVteSA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmlzRW5lbXkoZWxlbSkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gIH1cblxuICBnZXRDbG9zZXN0RW5lbXkoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaW9uTWVtb3J5LmNsb3Nlc3QodGhpcy5jaGFyYWN0ZXIudGlsZSwgKHQpID0+IHtcbiAgICAgIHJldHVybiB0LmVubmVteVNwb3R0ZWQ7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDbG9zZXN0VW5leHBsb3JlZCgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkuY2xvc2VzdCh0aGlzLmNoYXJhY3Rlci50aWxlLCAodCkgPT4ge1xuICAgICAgcmV0dXJuIHQudmlzaWJpbGl0eSA8IDEgJiYgdC5leHBsb3JhYmxlO1xuICAgIH0pO1xuICB9XG5cbiAgaXNFeHBsb3JhYmxlKHRpbGUpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgIHJldHVybiB0aWxlLndhbGthYmxlIHx8ICgocmVmID0gdGlsZS5jaGlsZHJlbikgIT0gbnVsbCA/IHJlZi5maW5kKChjKSA9PiB7XG4gICAgICByZXR1cm4gYyBpbnN0YW5jZW9mIERvb3I7XG4gICAgfSkgOiB2b2lkIDApO1xuICB9XG5cbiAgYXR0YWNrTW92ZVRvKHRpbGUpIHtcbiAgICB2YXIgYWN0aW9uO1xuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgIGFjdGlvbiA9IG5ldyBBdHRhY2tNb3ZlQWN0aW9uKHtcbiAgICAgIGFjdG9yOiB0aGlzLmNoYXJhY3RlcixcbiAgICAgIHRhcmdldDogdGlsZVxuICAgIH0pO1xuICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICBhY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgcmV0dXJuIGFjdGlvbjtcbiAgICB9XG4gIH1cblxuICB3YWxrVG8odGlsZSkge1xuICAgIHZhciBhY3Rpb247XG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgYWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgYWN0b3I6IHRoaXMuY2hhcmFjdGVyLFxuICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgfSk7XG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5leGVjdXRlKCk7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0NoYXJhY3RlckFJLmpzLm1hcFxuIiwidmFyIENvbmZyb250YXRpb24sIEVsZW1lbnQsIFNoaXAsIFZpZXc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVmlldyA9IHJlcXVpcmUoJy4vVmlldycpO1xuXG5TaGlwID0gcmVxdWlyZSgnLi9TaGlwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZnJvbnRhdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29uZnJvbnRhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICAgIHN0YXJ0KCkge1xuICAgICAgZ2FtZS5tYWluVmlldyA9IHRoaXMudmlldztcbiAgICAgIHN1YmplY3QuY29udGFpbmVyID0gdGhpcy52aWV3O1xuICAgICAgcmV0dXJuIG9wcG9uZW50LmNvbnRhaW5lciA9IHRoaXMudmlldztcbiAgICB9XG5cbiAgfTtcblxuICBDb25mcm9udGF0aW9uLnByb3BlcnRpZXMoe1xuICAgIGdhbWU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHN1YmplY3Q6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHZpZXc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmlldygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3Bwb25lbnQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2hpcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENvbmZyb250YXRpb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQ29uZnJvbnRhdGlvbi5qcy5tYXBcbiIsInZhciBEYW1hZ2VQcm9wYWdhdGlvbiwgRGlyZWN0aW9uLCBFbGVtZW50LCBMaW5lT2ZTaWdodDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5MaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKTtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBEYW1hZ2VQcm9wYWdhdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRGFtYWdlUHJvcGFnYXRpb24gZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcihvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZXRUaWxlQ29udGFpbmVyKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZS5jb250YWluZXI7XG4gICAgfVxuXG4gICAgYXBwbHkoKSB7XG4gICAgICB2YXIgZGFtYWdlLCBpLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuZ2V0RGFtYWdlZCgpO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRhbWFnZSA9IHJlZltpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGRhbWFnZS50YXJnZXQuZGFtYWdlKGRhbWFnZS5kYW1hZ2UpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGdldEluaXRpYWxUaWxlcygpIHtcbiAgICAgIHZhciBjdG47XG4gICAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKTtcbiAgICAgIHJldHVybiBjdG4uaW5SYW5nZSh0aGlzLnRpbGUsIHRoaXMucmFuZ2UpO1xuICAgIH1cblxuICAgIGdldEluaXRpYWxEYW1hZ2VzKCkge1xuICAgICAgdmFyIGRhbWFnZXMsIGRtZywgaSwgbGVuLCB0aWxlLCB0aWxlcztcbiAgICAgIGRhbWFnZXMgPSBbXTtcbiAgICAgIHRpbGVzID0gdGhpcy5nZXRJbml0aWFsVGlsZXMoKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHRpbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlc1tpXTtcbiAgICAgICAgaWYgKHRpbGUuZGFtYWdlYWJsZSAmJiAoZG1nID0gdGhpcy5pbml0aWFsRGFtYWdlKHRpbGUsIHRpbGVzLmxlbmd0aCkpKSB7XG4gICAgICAgICAgZGFtYWdlcy5wdXNoKGRtZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkYW1hZ2VzO1xuICAgIH1cblxuICAgIGdldERhbWFnZWQoKSB7XG4gICAgICB2YXIgYWRkZWQ7XG4gICAgICBpZiAodGhpcy5fZGFtYWdlZCA9PSBudWxsKSB7XG4gICAgICAgIGFkZGVkID0gbnVsbDtcbiAgICAgICAgd2hpbGUgKGFkZGVkID0gdGhpcy5zdGVwKGFkZGVkKSkge1xuICAgICAgICAgIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9kYW1hZ2VkO1xuICAgIH1cblxuICAgIHN0ZXAoYWRkZWQpIHtcbiAgICAgIGlmIChhZGRlZCAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmV4dGVuZGVkRGFtYWdlICE9IG51bGwpIHtcbiAgICAgICAgICBhZGRlZCA9IHRoaXMuZXh0ZW5kKGFkZGVkKTtcbiAgICAgICAgICB0aGlzLl9kYW1hZ2VkID0gYWRkZWQuY29uY2F0KHRoaXMuX2RhbWFnZWQpO1xuICAgICAgICAgIHJldHVybiBhZGRlZC5sZW5ndGggPiAwICYmIGFkZGVkO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZCA9IHRoaXMuZ2V0SW5pdGlhbERhbWFnZXMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbkRhbWFnZWQodGFyZ2V0LCBkYW1hZ2VkKSB7XG4gICAgICB2YXIgZGFtYWdlLCBpLCBpbmRleCwgbGVuO1xuICAgICAgZm9yIChpbmRleCA9IGkgPSAwLCBsZW4gPSBkYW1hZ2VkLmxlbmd0aDsgaSA8IGxlbjsgaW5kZXggPSArK2kpIHtcbiAgICAgICAgZGFtYWdlID0gZGFtYWdlZFtpbmRleF07XG4gICAgICAgIGlmIChkYW1hZ2UudGFyZ2V0ID09PSB0YXJnZXQpIHtcbiAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBleHRlbmQoZGFtYWdlZCkge1xuICAgICAgdmFyIGFkZGVkLCBjdG4sIGRhbWFnZSwgZGlyLCBkbWcsIGV4aXN0aW5nLCBpLCBqLCBrLCBsZW4sIGxlbjEsIGxlbjIsIGxvY2FsLCByZWYsIHRhcmdldCwgdGlsZTtcbiAgICAgIGN0biA9IHRoaXMuZ2V0VGlsZUNvbnRhaW5lcigpO1xuICAgICAgYWRkZWQgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGRhbWFnZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGFtYWdlID0gZGFtYWdlZFtpXTtcbiAgICAgICAgbG9jYWwgPSBbXTtcbiAgICAgICAgaWYgKGRhbWFnZS50YXJnZXQueCAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmID0gRGlyZWN0aW9uLmFkamFjZW50cztcbiAgICAgICAgICBmb3IgKGogPSAwLCBsZW4xID0gcmVmLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICAgICAgZGlyID0gcmVmW2pdO1xuICAgICAgICAgICAgdGlsZSA9IGN0bi5nZXRUaWxlKGRhbWFnZS50YXJnZXQueCArIGRpci54LCBkYW1hZ2UudGFyZ2V0LnkgKyBkaXIueSk7XG4gICAgICAgICAgICBpZiAoKHRpbGUgIT0gbnVsbCkgJiYgdGlsZS5kYW1hZ2VhYmxlICYmIHRoaXMuaW5EYW1hZ2VkKHRpbGUsIHRoaXMuX2RhbWFnZWQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICBsb2NhbC5wdXNoKHRpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGsgPSAwLCBsZW4yID0gbG9jYWwubGVuZ3RoOyBrIDwgbGVuMjsgaysrKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gbG9jYWxba107XG4gICAgICAgICAgaWYgKGRtZyA9IHRoaXMuZXh0ZW5kZWREYW1hZ2UodGFyZ2V0LCBkYW1hZ2UsIGxvY2FsLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIGlmICgoZXhpc3RpbmcgPSB0aGlzLmluRGFtYWdlZCh0YXJnZXQsIGFkZGVkKSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGFkZGVkLnB1c2goZG1nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFkZGVkW2V4aXN0aW5nXSA9IHRoaXMubWVyZ2VEYW1hZ2UoYWRkZWRbZXhpc3RpbmddLCBkbWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFkZGVkO1xuICAgIH1cblxuICAgIG1lcmdlRGFtYWdlKGQxLCBkMikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICAgIHBvd2VyOiBkMS5wb3dlciArIGQyLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGQxLmRhbWFnZSArIGQyLmRhbWFnZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcikge1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXQubW9kaWZ5RGFtYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRhcmdldC5tb2RpZnlEYW1hZ2UocG93ZXIsIHRoaXMudHlwZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIERhbWFnZVByb3BhZ2F0aW9uLnByb3BlcnRpZXMoe1xuICAgIHRpbGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgcmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICB9LFxuICAgIHR5cGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBEYW1hZ2VQcm9wYWdhdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuRGFtYWdlUHJvcGFnYXRpb24uTm9ybWFsID0gY2xhc3MgTm9ybWFsIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBpbml0aWFsRGFtYWdlKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgdGhpcy5wb3dlcik7XG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbn07XG5cbkRhbWFnZVByb3BhZ2F0aW9uLlRoZXJtaWMgPSBjbGFzcyBUaGVybWljIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBleHRlbmRlZERhbWFnZSh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXI7XG4gICAgcG93ZXIgPSAobGFzdC5kYW1hZ2UgLSAxKSAvIDIgLyBuYiAqIE1hdGgubWluKDEsIGxhc3QudGFyZ2V0LmhlYWx0aCAvIGxhc3QudGFyZ2V0Lm1heEhlYWx0aCAqIDUpO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsRGFtYWdlKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlcjtcbiAgICBwb3dlciA9IHRoaXMucG93ZXIgLyBuYjtcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbn07XG5cbkRhbWFnZVByb3BhZ2F0aW9uLktpbmV0aWMgPSBjbGFzcyBLaW5ldGljIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBleHRlbmRlZERhbWFnZSh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXI7XG4gICAgcG93ZXIgPSAobGFzdC5wb3dlciAtIGxhc3QuZGFtYWdlKSAqIE1hdGgubWluKDEsIGxhc3QudGFyZ2V0LmhlYWx0aCAvIGxhc3QudGFyZ2V0Lm1heEhlYWx0aCAqIDIpIC0gMTtcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW5pdGlhbERhbWFnZSh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZztcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHRoaXMucG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIG1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKSB7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQubW9kaWZ5RGFtYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih0YXJnZXQubW9kaWZ5RGFtYWdlKHBvd2VyLCB0aGlzLnR5cGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIgKiAwLjI1KTtcbiAgICB9XG4gIH1cblxuICBtZXJnZURhbWFnZShkMSwgZDIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICBwb3dlcjogTWF0aC5mbG9vcigoZDEucG93ZXIgKyBkMi5wb3dlcikgLyAyKSxcbiAgICAgIGRhbWFnZTogTWF0aC5mbG9vcigoZDEuZGFtYWdlICsgZDIuZGFtYWdlKSAvIDIpXG4gICAgfTtcbiAgfVxuXG59O1xuXG5EYW1hZ2VQcm9wYWdhdGlvbi5FeHBsb3NpdmUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEV4cGxvc2l2ZSBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgICBnZXREYW1hZ2VkKCkge1xuICAgICAgdmFyIGFuZ2xlLCBpLCBpbnNpZGUsIHJlZiwgc2hhcmQsIHNoYXJkUG93ZXIsIHNoYXJkcywgdGFyZ2V0O1xuICAgICAgdGhpcy5fZGFtYWdlZCA9IFtdO1xuICAgICAgc2hhcmRzID0gTWF0aC5wb3codGhpcy5yYW5nZSArIDEsIDIpO1xuICAgICAgc2hhcmRQb3dlciA9IHRoaXMucG93ZXIgLyBzaGFyZHM7XG4gICAgICBpbnNpZGUgPSB0aGlzLnRpbGUuaGVhbHRoIDw9IHRoaXMubW9kaWZ5RGFtYWdlKHRoaXMudGlsZSwgc2hhcmRQb3dlcik7XG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHNoYXJkUG93ZXIgKj0gNDtcbiAgICAgIH1cbiAgICAgIGZvciAoc2hhcmQgPSBpID0gMCwgcmVmID0gc2hhcmRzOyAoMCA8PSByZWYgPyBpIDw9IHJlZiA6IGkgPj0gcmVmKTsgc2hhcmQgPSAwIDw9IHJlZiA/ICsraSA6IC0taSkge1xuICAgICAgICBhbmdsZSA9IHRoaXMucm5nKCkgKiBNYXRoLlBJICogMjtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUaWxlSGl0QnlTaGFyZChpbnNpZGUsIGFuZ2xlKTtcbiAgICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZGFtYWdlZC5wdXNoKHtcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgcG93ZXI6IHNoYXJkUG93ZXIsXG4gICAgICAgICAgICBkYW1hZ2U6IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgc2hhcmRQb3dlcilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2RhbWFnZWQ7XG4gICAgfVxuXG4gICAgZ2V0VGlsZUhpdEJ5U2hhcmQoaW5zaWRlLCBhbmdsZSkge1xuICAgICAgdmFyIGN0biwgZGlzdCwgdGFyZ2V0LCB2ZXJ0ZXg7XG4gICAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKTtcbiAgICAgIGRpc3QgPSB0aGlzLnJhbmdlICogdGhpcy5ybmcoKTtcbiAgICAgIHRhcmdldCA9IHtcbiAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUgKyBkaXN0ICogTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNSArIGRpc3QgKiBNYXRoLnNpbihhbmdsZSlcbiAgICAgIH07XG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHZlcnRleCA9IG5ldyBMaW5lT2ZTaWdodChjdG4sIHRoaXMudGlsZS54ICsgMC41LCB0aGlzLnRpbGUueSArIDAuNSwgdGFyZ2V0LngsIHRhcmdldC55KTtcbiAgICAgICAgdmVydGV4LnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSAodGlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiAhaW5zaWRlIHx8ICgodGlsZSAhPSBudWxsKSAmJiB0aGlzLnRyYXZlcnNhYmxlQ2FsbGJhY2sodGlsZSkpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdmVydGV4LmdldEVuZFBvaW50KCkudGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjdG4uZ2V0VGlsZShNYXRoLmZsb29yKHRhcmdldC54KSwgTWF0aC5mbG9vcih0YXJnZXQueSkpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEV4cGxvc2l2ZS5wcm9wZXJ0aWVzKHtcbiAgICBybmc6IHtcbiAgICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gICAgfSxcbiAgICB0cmF2ZXJzYWJsZUNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgIHJldHVybiAhKHR5cGVvZiB0aWxlLmdldFNvbGlkID09PSAnZnVuY3Rpb24nICYmIHRpbGUuZ2V0U29saWQoKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRXhwbG9zaXZlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0RhbWFnZVByb3BhZ2F0aW9uLmpzLm1hcFxuIiwidmFyIERhbWFnZWFibGUsIEVsZW1lbnQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBEYW1hZ2VhYmxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBEYW1hZ2VhYmxlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgZGFtYWdlKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuaGVhbHRoID0gTWF0aC5tYXgoMCwgdGhpcy5oZWFsdGggLSB2YWwpO1xuICAgIH1cblxuICAgIHdoZW5Ob0hlYWx0aCgpIHt9XG5cbiAgfTtcblxuICBEYW1hZ2VhYmxlLnByb3BlcnRpZXMoe1xuICAgIGRhbWFnZWFibGU6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIG1heEhlYWx0aDoge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgaGVhbHRoOiB7XG4gICAgICBkZWZhdWx0OiAxMDAwLFxuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53aGVuTm9IZWFsdGgoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIERhbWFnZWFibGU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRGFtYWdlYWJsZS5qcy5tYXBcbiIsInZhciBEb29yLCBUaWxlZDtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gRG9vciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRG9vciBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihkaXJlY3Rpb24gPSBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIH1cblxuICAgIHVwZGF0ZVRpbGVNZW1iZXJzKG9sZCkge1xuICAgICAgdmFyIHJlZiwgcmVmMSwgcmVmMiwgcmVmMztcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYucmVtb3ZlUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYxLnJlbW92ZVByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICBpZiAoKHJlZjIgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmMi5hZGRQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChyZWYzID0gdGhpcy50aWxlLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCA/IHJlZjMuYWRkUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIERvb3IucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbih2YWwsIG9sZCkge1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVUaWxlTWVtYmVycyhvbGQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3Blbjoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIGRpcmVjdGlvbjoge31cbiAgfSk7XG5cbiAgRG9vci5kaXJlY3Rpb25zID0ge1xuICAgIGhvcml6b250YWw6ICdob3Jpem9udGFsJyxcbiAgICB2ZXJ0aWNhbDogJ3ZlcnRpY2FsJ1xuICB9O1xuXG4gIHJldHVybiBEb29yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0Rvb3IuanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0VsZW1lbnQuanMubWFwXG4iLCJ2YXIgQ29uZnJvbnRhdGlvbiwgRWxlbWVudCwgRW5jb3VudGVyTWFuYWdlciwgUHJvcGVydHlXYXRjaGVyO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5JbnZhbGlkYXRlZC5Qcm9wZXJ0eVdhdGNoZXI7XG5cbkNvbmZyb250YXRpb24gPSByZXF1aXJlKCcuL0NvbmZyb250YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmNvdW50ZXJNYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFbmNvdW50ZXJNYW5hZ2VyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgaW5pdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0aW9uV2F0Y2hlci5iaW5kKCk7XG4gICAgfVxuXG4gICAgdGVzdEVuY291bnRlcigpIHtcbiAgICAgIGlmICh0aGlzLnJuZygpIDw9IHRoaXMuYmFzZVByb2JhYmlsaXR5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0RW5jb3VudGVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnRFbmNvdW50ZXIoKSB7XG4gICAgICB2YXIgZW5jb3VudGVyO1xuICAgICAgZW5jb3VudGVyID0gbmV3IENvbmZyb250YXRpb24oe1xuICAgICAgICBzdWJqZWN0OiB0aGlzLnN1YmplY3RcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVuY291bnRlci5zdGFydCgpO1xuICAgIH1cblxuICB9O1xuXG4gIEVuY291bnRlck1hbmFnZXIucHJvcGVydGllcyh7XG4gICAgc3ViamVjdDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgYmFzZVByb2JhYmlsaXR5OiB7XG4gICAgICBkZWZhdWx0OiAwLjJcbiAgICB9LFxuICAgIGxvY2F0aW9uV2F0Y2hlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZXN0RW5jb3VudGVyKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5zdWJqZWN0LmdldFByb3BlcnR5SW5zdGFuY2UoJ2xvY2F0aW9uJylcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBybmc6IHtcbiAgICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRW5jb3VudGVyTWFuYWdlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbmNvbnRlck1hbmFnZXIuanMubWFwXG4iLCJ2YXIgRmxvb3IsIFRpbGU7XG5cblRpbGUgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRmxvb3IgZXh0ZW5kcyBUaWxlIHt9O1xuXG4gIEZsb29yLnByb3BlcnRpZXMoe1xuICAgIHdhbGthYmxlOiB7XG4gICAgICBjb21wb3NlZDogdHJ1ZVxuICAgIH0sXG4gICAgdHJhbnNwYXJlbnQ6IHtcbiAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRmxvb3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRmxvb3IuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgR2FtZSwgUGxheWVyLCBUaW1pbmcsIFZpZXc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxuVmlldyA9IHJlcXVpcmUoJy4vVmlldycpO1xuXG5QbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEdhbWUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBzdGFydCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQbGF5ZXI7XG4gICAgfVxuXG4gICAgYWRkKGVsZW0pIHtcbiAgICAgIGVsZW0uZ2FtZSA9IHRoaXM7XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICB9XG5cbiAgfTtcblxuICBHYW1lLnByb3BlcnRpZXMoe1xuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1haW5WaWV3OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy52aWV3cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlld3MuZ2V0KDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkZChuZXcgdGhpcy5kZWZhdWx0Vmlld0NsYXNzKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB2aWV3czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgY3VycmVudFBsYXllcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGxheWVycy5nZXQoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG5ldyB0aGlzLmRlZmF1bHRQbGF5ZXJDbGFzcygpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcGxheWVyczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgR2FtZS5wcm90b3R5cGUuZGVmYXVsdFZpZXdDbGFzcyA9IFZpZXc7XG5cbiAgR2FtZS5wcm90b3R5cGUuZGVmYXVsdFBsYXllckNsYXNzID0gUGxheWVyO1xuXG4gIHJldHVybiBHYW1lO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0dhbWUuanMubWFwXG4iLCJ2YXIgQ29sbGVjdGlvbiwgSW52ZW50b3J5O1xuXG5Db2xsZWN0aW9uID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkNvbGxlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gSW52ZW50b3J5ID0gY2xhc3MgSW52ZW50b3J5IGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGdldEJ5VHlwZSh0eXBlKSB7XG4gICAgdmFyIHJlcztcbiAgICByZXMgPSB0aGlzLmZpbHRlcihmdW5jdGlvbihyKSB7XG4gICAgICByZXR1cm4gci50eXBlID09PSB0eXBlO1xuICAgIH0pO1xuICAgIGlmIChyZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmVzWzBdO1xuICAgIH1cbiAgfVxuXG4gIGFkZEJ5VHlwZSh0eXBlLCBxdGUsIHBhcnRpYWwgPSBmYWxzZSkge1xuICAgIHZhciByZXNzb3VyY2U7XG4gICAgcmVzc291cmNlID0gdGhpcy5nZXRCeVR5cGUodHlwZSk7XG4gICAgaWYgKCFyZXNzb3VyY2UpIHtcbiAgICAgIHJlc3NvdXJjZSA9IHRoaXMuaW5pdFJlc3NvdXJjZSh0eXBlKTtcbiAgICB9XG4gICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgIHJldHVybiByZXNzb3VyY2UucGFydGlhbENoYW5nZShyZXNzb3VyY2UucXRlICsgcXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3NvdXJjZS5xdGUgKz0gcXRlO1xuICAgIH1cbiAgfVxuXG4gIGluaXRSZXNzb3VyY2UodHlwZSwgb3B0KSB7XG4gICAgcmV0dXJuIHR5cGUuaW5pdFJlc3NvdXJjZShvcHQpO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvSW52ZW50b3J5LmpzLm1hcFxuIiwidmFyIExpbmVPZlNpZ2h0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVPZlNpZ2h0ID0gY2xhc3MgTGluZU9mU2lnaHQge1xuICBjb25zdHJ1Y3Rvcih0aWxlcywgeDEgPSAwLCB5MSA9IDAsIHgyID0gMCwgeTIgPSAwKSB7XG4gICAgdGhpcy50aWxlcyA9IHRpbGVzO1xuICAgIHRoaXMueDEgPSB4MTtcbiAgICB0aGlzLnkxID0geTE7XG4gICAgdGhpcy54MiA9IHgyO1xuICAgIHRoaXMueTIgPSB5MjtcbiAgfVxuXG4gIHNldFgxKHZhbCkge1xuICAgIHRoaXMueDEgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgc2V0WTEodmFsKSB7XG4gICAgdGhpcy55MSA9IHZhbDtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKCk7XG4gIH1cblxuICBzZXRYMih2YWwpIHtcbiAgICB0aGlzLngyID0gdmFsO1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKTtcbiAgfVxuXG4gIHNldFkyKHZhbCkge1xuICAgIHRoaXMueTIgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgaW52YWxpZGFkZSgpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0gbnVsbDtcbiAgICB0aGlzLnN1Y2Nlc3MgPSBudWxsO1xuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHRlc3RUaWxlKHRpbGUsIGVudHJ5WCwgZW50cnlZKSB7XG4gICAgaWYgKHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUsIGVudHJ5WCwgZW50cnlZKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwpICYmICh0eXBlb2YgdGlsZS5nZXRUcmFuc3BhcmVudCA9PT0gJ2Z1bmN0aW9uJyA/IHRpbGUuZ2V0VHJhbnNwYXJlbnQoKSA6IHR5cGVvZiB0aWxlLnRyYW5zcGFyZW50ICE9PSB2b2lkIDAgPyB0aWxlLnRyYW5zcGFyZW50IDogdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgdGVzdFRpbGVBdCh4LCB5LCBlbnRyeVgsIGVudHJ5WSkge1xuICAgIHJldHVybiB0aGlzLnRlc3RUaWxlKHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHgpLCBNYXRoLmZsb29yKHkpKSwgZW50cnlYLCBlbnRyeVkpO1xuICB9XG5cbiAgcmV2ZXJzZVRyYWNpbmcoKSB7XG4gICAgdmFyIHRtcFgsIHRtcFk7XG4gICAgdG1wWCA9IHRoaXMueDE7XG4gICAgdG1wWSA9IHRoaXMueTE7XG4gICAgdGhpcy54MSA9IHRoaXMueDI7XG4gICAgdGhpcy55MSA9IHRoaXMueTI7XG4gICAgdGhpcy54MiA9IHRtcFg7XG4gICAgdGhpcy55MiA9IHRtcFk7XG4gICAgcmV0dXJuIHRoaXMucmV2ZXJzZWQgPSAhdGhpcy5yZXZlcnNlZDtcbiAgfVxuXG4gIGNhbGN1bCgpIHtcbiAgICB2YXIgbmV4dFgsIG5leHRZLCBwb3NpdGl2ZVgsIHBvc2l0aXZlWSwgcmF0aW8sIHRpbGVYLCB0aWxlWSwgdG90YWwsIHgsIHk7XG4gICAgcmF0aW8gPSAodGhpcy54MiAtIHRoaXMueDEpIC8gKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICB0b3RhbCA9IE1hdGguYWJzKHRoaXMueDIgLSB0aGlzLngxKSArIE1hdGguYWJzKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICBwb3NpdGl2ZVggPSAodGhpcy54MiAtIHRoaXMueDEpID49IDA7XG4gICAgcG9zaXRpdmVZID0gKHRoaXMueTIgLSB0aGlzLnkxKSA+PSAwO1xuICAgIHRpbGVYID0geCA9IHRoaXMueDE7XG4gICAgdGlsZVkgPSB5ID0gdGhpcy55MTtcbiAgICBpZiAodGhpcy5yZXZlcnNlZCkge1xuICAgICAgdGlsZVggPSBwb3NpdGl2ZVggPyB4IDogTWF0aC5jZWlsKHgpIC0gMTtcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDE7XG4gICAgfVxuICAgIHdoaWxlICh0b3RhbCA+IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSAmJiB0aGlzLnRlc3RUaWxlQXQodGlsZVgsIHRpbGVZLCB4LCB5KSkge1xuICAgICAgbmV4dFggPSBwb3NpdGl2ZVggPyBNYXRoLmZsb29yKHgpICsgMSA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICBuZXh0WSA9IHBvc2l0aXZlWSA/IE1hdGguZmxvb3IoeSkgKyAxIDogTWF0aC5jZWlsKHkpIC0gMTtcbiAgICAgIGlmICh0aGlzLngyIC0gdGhpcy54MSA9PT0gMCkge1xuICAgICAgICB5ID0gbmV4dFk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMueTIgLSB0aGlzLnkxID09PSAwKSB7XG4gICAgICAgIHggPSBuZXh0WDtcbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoKG5leHRYIC0geCkgLyAodGhpcy54MiAtIHRoaXMueDEpKSA8IE1hdGguYWJzKChuZXh0WSAtIHkpIC8gKHRoaXMueTIgLSB0aGlzLnkxKSkpIHtcbiAgICAgICAgeCA9IG5leHRYO1xuICAgICAgICB5ID0gKG5leHRYIC0gdGhpcy54MSkgLyByYXRpbyArIHRoaXMueTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4ID0gKG5leHRZIC0gdGhpcy55MSkgKiByYXRpbyArIHRoaXMueDE7XG4gICAgICAgIHkgPSBuZXh0WTtcbiAgICAgIH1cbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICB0aWxlWSA9IHBvc2l0aXZlWSA/IHkgOiBNYXRoLmNlaWwoeSkgLSAxO1xuICAgIH1cbiAgICBpZiAodG90YWwgPD0gTWF0aC5hYnMoeCAtIHRoaXMueDEpICsgTWF0aC5hYnMoeSAtIHRoaXMueTEpKSB7XG4gICAgICB0aGlzLmVuZFBvaW50ID0ge1xuICAgICAgICB4OiB0aGlzLngyLFxuICAgICAgICB5OiB0aGlzLnkyLFxuICAgICAgICB0aWxlOiB0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih0aGlzLngyKSwgTWF0aC5mbG9vcih0aGlzLnkyKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGlsZVgpLCBNYXRoLmZsb29yKHRpbGVZKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yY2VTdWNjZXNzKCkge1xuICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICB4OiB0aGlzLngyLFxuICAgICAgeTogdGhpcy55MixcbiAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRoaXMueDIpLCBNYXRoLmZsb29yKHRoaXMueTIpKVxuICAgIH07XG4gICAgdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGdldFN1Y2Nlc3MoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3M7XG4gIH1cblxuICBnZXRFbmRQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5jYWxjdWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5kUG9pbnQ7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9MaW5lT2ZTaWdodC5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBNYXA7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXAgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE1hcCBleHRlbmRzIEVsZW1lbnQge1xuICAgIF9hZGRUb0JvbmRhcmllcyhsb2NhdGlvbiwgYm91bmRhcmllcykge1xuICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCBsb2NhdGlvbi55IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgYm91bmRhcmllcy50b3AgPSBsb2NhdGlvbi55O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgbG9jYXRpb24ueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICBib3VuZGFyaWVzLmxlZnQgPSBsb2NhdGlvbi54O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCBsb2NhdGlvbi55ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgYm91bmRhcmllcy5ib3R0b20gPSBsb2NhdGlvbi55O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IGxvY2F0aW9uLnggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzLnJpZ2h0ID0gbG9jYXRpb24ueDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBNYXAucHJvcGVydGllcyh7XG4gICAgbG9jYXRpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB7XG4gICAgICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICB2YXIgbWluLCBtaW5EaXN0O1xuICAgICAgICAgIG1pbiA9IG51bGw7XG4gICAgICAgICAgbWluRGlzdCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZGlzdDtcbiAgICAgICAgICAgIGRpc3QgPSBsb2NhdGlvbi5kaXN0KHgsIHkpO1xuICAgICAgICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgICAgICAgbWluID0gbG9jYXRpb247XG4gICAgICAgICAgICAgIHJldHVybiBtaW5EaXN0ID0gZGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gbWluO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZXN0czogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgIHZhciBkaXN0cztcbiAgICAgICAgICBkaXN0cyA9IHRoaXMubWFwKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBkaXN0OiBsb2NhdGlvbi5kaXN0KHgsIHkpLFxuICAgICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZGlzdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5kaXN0IC0gYi5kaXN0O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvcHkoZGlzdHMubWFwKGZ1bmN0aW9uKGRpc3QpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXN0LmxvY2F0aW9uO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYm91bmRhcmllczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJvdW5kYXJpZXM7XG4gICAgICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICAgICAgdG9wOiBudWxsLFxuICAgICAgICAgIGxlZnQ6IG51bGwsXG4gICAgICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgICAgIHJpZ2h0OiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZFRvQm9uZGFyaWVzKGxvY2F0aW9uLCBib3VuZGFyaWVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzO1xuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIE1hcDtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NYXAuanMubWFwXG4iLCJ2YXIgT2JzdGFjbGUsIFRpbGVkO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxubW9kdWxlLmV4cG9ydHMgPSBPYnN0YWNsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgT2JzdGFjbGUgZXh0ZW5kcyBUaWxlZCB7XG4gICAgdXBkYXRlV2Fsa2FibGVzKG9sZCkge1xuICAgICAgdmFyIHJlZiwgcmVmMTtcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYucmVtb3ZlUmVmKCd3YWxrYWJsZScsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICAgIHJldHVybiAocmVmMSA9IHRoaXMudGlsZS53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwgPyByZWYxLnNldFZhbHVlUmVmKGZhbHNlLCAnd2Fsa2FibGUnLCB0aGlzKSA6IHZvaWQgMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBPYnN0YWNsZS5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKHZhbCwgb2xkLCBvdmVycmlkZWQpIHtcbiAgICAgICAgb3ZlcnJpZGVkKG9sZCk7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVdhbGthYmxlcyhvbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIE9ic3RhY2xlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL09ic3RhY2xlLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIEV2ZW50RW1pdHRlciwgUGF0aFdhbGssIFRpbWluZztcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5UaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpO1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoV2FsayA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGF0aFdhbGsgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih3YWxrZXIsIHBhdGgsIG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgICAgdGhpcy53YWxrZXIgPSB3YWxrZXI7XG4gICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgaWYgKCF0aGlzLnBhdGguc29sdXRpb24pIHtcbiAgICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGF0aC5zb2x1dGlvbikge1xuICAgICAgICB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKCk7XG4gICAgICAgIH0sIHRoaXMudG90YWxUaW1lKTtcbiAgICAgICAgdGhpcy53YWxrZXIudGlsZU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi50aWxlJywgdGhpcyk7XG4gICAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFhNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrZXIub2Zmc2V0WU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi5vZmZzZXRZJywgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0LnBhdXNlKCk7XG4gICAgfVxuXG4gICAgZmluaXNoKCkge1xuICAgICAgdGhpcy53YWxrZXIudGlsZSA9IHRoaXMucG9zaXRpb24udGlsZTtcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFggPSB0aGlzLnBvc2l0aW9uLm9mZnNldFg7XG4gICAgICB0aGlzLndhbGtlci5vZmZzZXRZID0gdGhpcy5wb3NpdGlvbi5vZmZzZXRZO1xuICAgICAgdGhpcy5lbWl0KCdmaW5pc2hlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5kKCk7XG4gICAgfVxuXG4gICAgaW50ZXJydXB0KCkge1xuICAgICAgdGhpcy5lbWl0KCdpbnRlcnJ1cHRlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5kKCk7XG4gICAgfVxuXG4gICAgZW5kKCkge1xuICAgICAgdGhpcy5lbWl0KCdlbmQnKTtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgaWYgKHRoaXMud2Fsa2VyLndhbGsgPT09IHRoaXMpIHtcbiAgICAgICAgdGhpcy53YWxrZXIud2FsayA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLndhbGtlci50aWxlTWVtYmVycy5yZW1vdmVSZWYoJ3Bvc2l0aW9uLnRpbGUnLCB0aGlzKTtcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFhNZW1iZXJzLnJlbW92ZVJlZigncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpO1xuICAgICAgdGhpcy53YWxrZXIub2Zmc2V0WU1lbWJlcnMucmVtb3ZlUmVmKCdwb3NpdGlvbi5vZmZzZXRZJywgdGhpcyk7XG4gICAgICB0aGlzLnBhdGhUaW1lb3V0LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpO1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aFdhbGsuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBQYXRoV2Fsay5wcm9wZXJ0aWVzKHtcbiAgICBzcGVlZDoge1xuICAgICAgZGVmYXVsdDogNVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcGF0aExlbmd0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aC5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG90YWxUaW1lOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoTGVuZ3RoIC8gdGhpcy5zcGVlZCAqIDEwMDA7XG4gICAgICB9XG4gICAgfSxcbiAgICBwb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoLmdldFBvc0F0UHJjKGludmFsaWRhdG9yLnByb3BQYXRoKCdwYXRoVGltZW91dC5wcmMnKSB8fCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBQYXRoV2FsaztcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9QYXRoV2Fsay5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBMaW5lT2ZTaWdodCwgUGVyc29uYWxXZWFwb24sIFRpbWluZztcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5MaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKTtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQZXJzb25hbFdlYXBvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGVyc29uYWxXZWFwb24gZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcihvcHRpb25zKTtcbiAgICB9XG5cbiAgICBjYW5CZVVzZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VkO1xuICAgIH1cblxuICAgIGNhblVzZU9uKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FuVXNlRnJvbSh0aGlzLnVzZXIudGlsZSwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBjYW5Vc2VGcm9tKHRpbGUsIHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMucmFuZ2UgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pblJhbmdlKHRpbGUsIHRhcmdldCkgJiYgdGhpcy5oYXNMaW5lT2ZTaWdodCh0aWxlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluUmFuZ2UodGlsZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmLCB0YXJnZXRUaWxlO1xuICAgICAgdGFyZ2V0VGlsZSA9IHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgIHJldHVybiAoKHJlZiA9IHRpbGUuZGlzdCh0YXJnZXRUaWxlKSkgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApIDw9IHRoaXMucmFuZ2U7XG4gICAgfVxuXG4gICAgaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIHRhcmdldFRpbGU7XG4gICAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0O1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHRhcmdldFRpbGUueCAtIHRpbGUueCkgKyBNYXRoLmFicyh0YXJnZXRUaWxlLnkgLSB0aWxlLnkpID09PSAxO1xuICAgIH1cblxuICAgIGhhc0xpbmVPZlNpZ2h0KHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIGxvcywgdGFyZ2V0VGlsZTtcbiAgICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXQ7XG4gICAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGFyZ2V0VGlsZS5jb250YWluZXIsIHRpbGUueCArIDAuNSwgdGlsZS55ICsgMC41LCB0YXJnZXRUaWxlLnggKyAwLjUsIHRhcmdldFRpbGUueSArIDAuNSk7XG4gICAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHRpbGUud2Fsa2FibGU7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGxvcy5nZXRTdWNjZXNzKCk7XG4gICAgfVxuXG4gICAgdXNlT24odGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5jYW5CZVVzZWQoKSkge1xuICAgICAgICB0YXJnZXQuZGFtYWdlKHRoaXMucG93ZXIpO1xuICAgICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWNoYXJnZSgpIHtcbiAgICAgIHRoaXMuY2hhcmdpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJnaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlZCgpO1xuICAgICAgfSwgdGhpcy5yZWNoYXJnZVRpbWUpO1xuICAgIH1cblxuICAgIHJlY2hhcmdlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJnZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy5jaGFyZ2VUaW1lb3V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJnZVRpbWVvdXQuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFBlcnNvbmFsV2VhcG9uLnByb3BlcnRpZXMoe1xuICAgIHJlY2hhcmdlVGltZToge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgY2hhcmdlZDoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY2hhcmdpbmc6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgZHBzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMucG93ZXJQcm9wZXJ0eSkgLyBpbnZhbGlkYXRvci5wcm9wKHRoaXMucmVjaGFyZ2VUaW1lUHJvcGVydHkpICogMTAwMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJhbmdlOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgdXNlcjoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFBlcnNvbmFsV2VhcG9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1BlcnNvbmFsV2VhcG9uLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIFBsYXllcjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGxheWVyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgZmlyc3Q7XG4gICAgICBmaXJzdCA9IHRoaXMuZ2FtZS5wbGF5ZXJzLmxlbmd0aCA9PT0gMDtcbiAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJzLmFkZCh0aGlzKTtcbiAgICAgIGlmIChmaXJzdCAmJiAhdGhpcy5jb250cm9sbGVyICYmIHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgdGhpcy5nYW1lLmRlZmF1bHRQbGF5ZXJDb250cm9sbGVyQ2xhc3MoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5UYXJnZXRBY3Rpb25PbihlbGVtKSB7XG4gICAgICB2YXIgYWN0aW9uLCByZWY7XG4gICAgICBhY3Rpb24gPSB0aGlzLnNlbGVjdGVkQWN0aW9uIHx8ICgocmVmID0gdGhpcy5zZWxlY3RlZCkgIT0gbnVsbCA/IHJlZi5kZWZhdWx0QWN0aW9uIDogdm9pZCAwKTtcbiAgICAgIHJldHVybiAoYWN0aW9uICE9IG51bGwpICYmIHR5cGVvZiBhY3Rpb24uY2FuVGFyZ2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgYWN0aW9uLmNhblRhcmdldChlbGVtKTtcbiAgICB9XG5cbiAgICBndWVzc0FjdGlvblRhcmdldChhY3Rpb24pIHtcbiAgICAgIHZhciBzZWxlY3RlZDtcbiAgICAgIHNlbGVjdGVkID0gdGhpcy5zZWxlY3RlZDtcbiAgICAgIGlmICh0eXBlb2YgYWN0aW9uLmNhblRhcmdldCA9PT0gXCJmdW5jdGlvblwiICYmIChhY3Rpb24udGFyZ2V0ID09IG51bGwpICYmIGFjdGlvbi5hY3RvciAhPT0gc2VsZWN0ZWQgJiYgYWN0aW9uLmNhblRhcmdldChzZWxlY3RlZCkpIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbi53aXRoVGFyZ2V0KHNlbGVjdGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhY3Rpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FuU2VsZWN0KGVsZW0pIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZWxlbS5pc1NlbGVjdGFibGVCeSA9PT0gXCJmdW5jdGlvblwiICYmIGVsZW0uaXNTZWxlY3RhYmxlQnkodGhpcyk7XG4gICAgfVxuXG4gICAgY2FuRm9jdXNPbihlbGVtKSB7XG4gICAgICBpZiAodHlwZW9mIGVsZW0uSXNGb2N1c2FibGVCeSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtLklzRm9jdXNhYmxlQnkodGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtLklzU2VsZWN0YWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uSXNTZWxlY3RhYmxlQnkodGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0QWN0aW9uKGFjdGlvbikge1xuICAgICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbi5zdGFydCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRBY3Rpb24gPSBhY3Rpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2V0QWN0aW9uVGFyZ2V0KGVsZW0pIHtcbiAgICAgIHZhciBhY3Rpb24sIHJlZjtcbiAgICAgIGFjdGlvbiA9IHRoaXMuc2VsZWN0ZWRBY3Rpb24gfHwgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLmRlZmF1bHRBY3Rpb24gOiB2b2lkIDApO1xuICAgICAgYWN0aW9uID0gYWN0aW9uLndpdGhUYXJnZXQoZWxlbSk7XG4gICAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgICBhY3Rpb24uc3RhcnQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRBY3Rpb24gPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRBY3Rpb24gPSBhY3Rpb247XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgUGxheWVyLnByb3BlcnRpZXMoe1xuICAgIG5hbWU6IHtcbiAgICAgIGRlZmF1bHQ6ICdQbGF5ZXInXG4gICAgfSxcbiAgICBmb2N1c2VkOiB7fSxcbiAgICBzZWxlY3RlZDoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbih2YWwsIG9sZCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICBpZiAob2xkICE9IG51bGwgPyBvbGQucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICBvbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGdsb2JhbEFjdGlvblByb3ZpZGVyczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgYWN0aW9uUHJvdmlkZXJzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByZXMsIHNlbGVjdGVkO1xuICAgICAgICByZXMgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMuZ2xvYmFsQWN0aW9uUHJvdmlkZXJzUHJvcGVydHkpLnRvQXJyYXkoKTtcbiAgICAgICAgc2VsZWN0ZWQgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMuc2VsZWN0ZWRQcm9wZXJ0eSk7XG4gICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgIHJlcy5wdXNoKHNlbGVjdGVkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH0sXG4gICAgYXZhaWxhYmxlQWN0aW9uczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLmFjdGlvblByb3ZpZGVyc1Byb3BlcnR5KS5yZWR1Y2UoKHJlcywgcHJvdmlkZXIpID0+IHtcbiAgICAgICAgICB2YXIgYWN0aW9ucywgc2VsZWN0ZWQ7XG4gICAgICAgICAgYWN0aW9ucyA9IGludmFsaWRhdG9yLnByb3AocHJvdmlkZXIucHJvdmlkZWRBY3Rpb25zUHJvcGVydHkpLnRvQXJyYXkoKTtcbiAgICAgICAgICBzZWxlY3RlZCA9IGludmFsaWRhdG9yLnByb3AodGhpcy5zZWxlY3RlZFByb3BlcnR5KTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgYWN0aW9ucyA9IGFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ3Vlc3NBY3Rpb25UYXJnZXQoYWN0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYWN0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoYWN0aW9ucyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBbXSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZWxlY3RlZEFjdGlvbjoge30sXG4gICAgY29udHJvbGxlcjoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbih2YWwsIG9sZCkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sbGVyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29udHJvbGxlci5wbGF5ZXIgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBnYW1lOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKHZhbCwgb2xkKSB7XG4gICAgICAgIGlmICh0aGlzLmdhbWUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZXREZWZhdWx0cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUGxheWVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1BsYXllci5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBQcm9qZWN0aWxlLCBUaW1pbmc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0aWxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQcm9qZWN0aWxlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIGxhdW5jaCgpIHtcbiAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVsaXZlclBheWxvYWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICB9LCB0aGlzLnBhdGhMZW5ndGggLyB0aGlzLnNwZWVkICogMTAwMCk7XG4gICAgfVxuXG4gICAgZGVsaXZlclBheWxvYWQoKSB7XG4gICAgICB2YXIgcGF5bG9hZDtcbiAgICAgIHBheWxvYWQgPSBuZXcgdGhpcy5wcm9wYWdhdGlvblR5cGUoe1xuICAgICAgICB0aWxlOiB0aGlzLnRhcmdldC50aWxlIHx8IHRoaXMudGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgcmFuZ2U6IHRoaXMuYmxhc3RSYW5nZVxuICAgICAgfSk7XG4gICAgICBwYXlsb2FkLmFwcGx5KCk7XG4gICAgICB0aGlzLnBheWxvYWREZWxpdmVyZWQoKTtcbiAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH1cblxuICAgIHBheWxvYWREZWxpdmVyZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgfTtcblxuICBQcm9qZWN0aWxlLnByb3BlcnRpZXMoe1xuICAgIG9yaWdpbjoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgdGFyZ2V0OiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBwb3dlcjoge1xuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIGJsYXN0UmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICB9LFxuICAgIHByb3BhZ2F0aW9uVHlwZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgc3BlZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICBwYXRoTGVuZ3RoOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGlzdDtcbiAgICAgICAgaWYgKCh0aGlzLm9yaWdpblRpbGUgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0VGlsZSAhPSBudWxsKSkge1xuICAgICAgICAgIGRpc3QgPSB0aGlzLm9yaWdpblRpbGUuZGlzdCh0aGlzLnRhcmdldFRpbGUpO1xuICAgICAgICAgIGlmIChkaXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzdC5sZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxMDA7XG4gICAgICB9XG4gICAgfSxcbiAgICBvcmlnaW5UaWxlOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciBvcmlnaW47XG4gICAgICAgIG9yaWdpbiA9IGludmFsaWRhdG9yLnByb3AodGhpcy5vcmlnaW5Qcm9wZXJ0eSk7XG4gICAgICAgIGlmIChvcmlnaW4gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW4udGlsZSB8fCBvcmlnaW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldFRpbGU6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHRhcmdldDtcbiAgICAgICAgdGFyZ2V0ID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnRhcmdldFByb3BlcnR5KTtcbiAgICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIG9yaWdpblRpbGUsIHRhcmdldFRpbGU7XG4gICAgICAgIG9yaWdpblRpbGUgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5vcmlnaW5UaWxlUHJvcGVydHkpO1xuICAgICAgICB0YXJnZXRUaWxlID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMudGFyZ2V0VGlsZVByb3BlcnR5KTtcbiAgICAgICAgaWYgKG9yaWdpblRpbGUuY29udGFpbmVyID09PSB0YXJnZXRUaWxlLmNvbnRhaW5lcikge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5UaWxlLmNvbnRhaW5lcjtcbiAgICAgICAgfSBlbHNlIGlmIChpbnZhbGlkYXRlLnByb3AodGhpcy5wcmNQYXRoUHJvcGVydHkpID4gMC41KSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFRpbGUuY29udGFpbmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5UaWxlLmNvbnRhaW5lcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBzdGFydFBvcztcbiAgICAgICAgc3RhcnRQb3MgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5zdGFydFBvc1Byb3BlcnR5KTtcbiAgICAgICAgcmV0dXJuIChpbnZhbGlkYXRlLnByb3AodGhpcy50YXJnZXRQb3NQcm9wZXJ0eSkueCAtIHN0YXJ0UG9zLngpICogaW52YWxpZGF0ZS5wcm9wKHRoaXMucHJjUGF0aFByb3BlcnR5KSArIHN0YXJ0UG9zLng7XG4gICAgICB9XG4gICAgfSxcbiAgICB5OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIHN0YXJ0UG9zO1xuICAgICAgICBzdGFydFBvcyA9IGludmFsaWRhdGUucHJvcCh0aGlzLnN0YXJ0UG9zUHJvcGVydHkpO1xuICAgICAgICByZXR1cm4gKGludmFsaWRhdGUucHJvcCh0aGlzLnRhcmdldFBvc1Byb3BlcnR5KS55IC0gc3RhcnRQb3MueSkgKiBpbnZhbGlkYXRlLnByb3AodGhpcy5wcmNQYXRoUHJvcGVydHkpICsgc3RhcnRQb3MueTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0UG9zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciwgZGlzdCwgb2Zmc2V0LCBvcmlnaW5UaWxlO1xuICAgICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMub3JpZ2luVGlsZVByb3BlcnR5KTtcbiAgICAgICAgY29udGFpbmVyID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMuY29udGFpbmVyUHJvcGVydHkpO1xuICAgICAgICBvZmZzZXQgPSB0aGlzLnN0YXJ0T2Zmc2V0O1xuICAgICAgICBpZiAob3JpZ2luVGlsZS5jb250YWluZXIgIT09IGNvbnRhaW5lcikge1xuICAgICAgICAgIGRpc3QgPSBjb250YWluZXIuZGlzdChvcmlnaW5UaWxlLmNvbnRhaW5lcik7XG4gICAgICAgICAgb2Zmc2V0LnggKz0gZGlzdC54O1xuICAgICAgICAgIG9mZnNldC55ICs9IGRpc3QueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IG9yaWdpblRpbGUueCArIG9mZnNldC54LFxuICAgICAgICAgIHk6IG9yaWdpblRpbGUueSArIG9mZnNldC55XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0YXJnZXRQb3M6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0ZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyLCBkaXN0LCBvZmZzZXQsIHRhcmdldFRpbGU7XG4gICAgICAgIHRhcmdldFRpbGUgPSBpbnZhbGlkYXRlLnByb3AodGhpcy50YXJnZXRUaWxlUHJvcGVydHkpO1xuICAgICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5jb250YWluZXJQcm9wZXJ0eSk7XG4gICAgICAgIG9mZnNldCA9IHRoaXMudGFyZ2V0T2Zmc2V0O1xuICAgICAgICBpZiAodGFyZ2V0VGlsZS5jb250YWluZXIgIT09IGNvbnRhaW5lcikge1xuICAgICAgICAgIGRpc3QgPSBjb250YWluZXIuZGlzdCh0YXJnZXRUaWxlLmNvbnRhaW5lcik7XG4gICAgICAgICAgb2Zmc2V0LnggKz0gZGlzdC54O1xuICAgICAgICAgIG9mZnNldC55ICs9IGRpc3QueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHRhcmdldFRpbGUueCArIG9mZnNldC54LFxuICAgICAgICAgIHk6IHRhcmdldFRpbGUueSArIG9mZnNldC55XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydE9mZnNldDoge1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB4OiAwLjUsXG4gICAgICAgIHk6IDAuNVxuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGFyZ2V0T2Zmc2V0OiB7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHg6IDAuNSxcbiAgICAgICAgeTogMC41XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmNQYXRoOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICByZXR1cm4gKChyZWYgPSB0aGlzLnBhdGhUaW1lb3V0KSAhPSBudWxsID8gcmVmLnByYyA6IHZvaWQgMCkgfHwgMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmluZzoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBQcm9qZWN0aWxlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb2plY3RpbGUuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgUmVzc291cmNlO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzc291cmNlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSZXNzb3VyY2UgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBwYXJ0aWFsQ2hhbmdlKHF0ZSkge1xuICAgICAgdmFyIGFjY2VwdGFibGU7XG4gICAgICBhY2NlcHRhYmxlID0gTWF0aC5tYXgodGhpcy5taW5RdGUsIE1hdGgubWluKHRoaXMubWF4UXRlLCBxdGUpKTtcbiAgICAgIHRoaXMucXRlID0gYWNjZXB0YWJsZTtcbiAgICAgIHJldHVybiBxdGUgLSBhY2NlcHRhYmxlO1xuICAgIH1cblxuICB9O1xuXG4gIFJlc3NvdXJjZS5wcm9wZXJ0aWVzKHtcbiAgICB0eXBlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBxdGU6IHtcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICBpbmdlc3Q6IGZ1bmN0aW9uKHF0ZSkge1xuICAgICAgICBpZiAodGhpcy5tYXhRdGUgIT09IG51bGwgJiYgcXRlID4gdGhpcy5tYXhRdGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgaGF2ZSBtb3JlIHRoYW4gJyArIHRoaXMubWF4UXRlICsgJyBvZiAnICsgdGhpcy50eXBlLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm1pblF0ZSAhPT0gbnVsbCAmJiBxdGUgPCB0aGlzLm1pblF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudCBoYXZlIGxlc3MgdGhhbiAnICsgdGhpcy5taW5RdGUgKyAnIG9mICcgKyB0aGlzLnR5cGUubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF0ZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1heFF0ZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgbWluUXRlOiB7XG4gICAgICBkZWZhdWx0OiAwXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUmVzc291cmNlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Jlc3NvdXJjZS5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBSZXNzb3VyY2UsIFJlc3NvdXJjZVR5cGU7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuUmVzc291cmNlID0gcmVxdWlyZSgnLi9SZXNzb3VyY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNzb3VyY2VUeXBlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSZXNzb3VyY2VUeXBlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgaW5pdFJlc3NvdXJjZShvcHQpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdCA9IHtcbiAgICAgICAgICBxdGU6IG9wdFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0T3B0aW9ucywgb3B0KTtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5yZXNzb3VyY2VDbGFzcyhvcHQpO1xuICAgIH1cblxuICB9O1xuXG4gIFJlc3NvdXJjZVR5cGUucHJvcGVydGllcyh7XG4gICAgbmFtZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcmVzc291cmNlQ2xhc3M6IHtcbiAgICAgIGRlZmF1bHQ6IFJlc3NvdXJjZVxuICAgIH0sXG4gICAgZGVmYXVsdE9wdGlvbnM6IHtcbiAgICAgIGRlZmF1bHQ6IHt9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUmVzc291cmNlVHlwZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9SZXNzb3VyY2VUeXBlLmpzLm1hcFxuIiwidmFyIERpcmVjdGlvbiwgRG9vciwgRWxlbWVudCwgUm9vbUdlbmVyYXRvciwgVGlsZSwgVGlsZUNvbnRhaW5lcixcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyO1xuXG5UaWxlID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGU7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbkRvb3IgPSByZXF1aXJlKCcuL0Rvb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb29tR2VuZXJhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSb29tR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaW5pdFRpbGVzKCkge1xuICAgICAgdGhpcy5maW5hbFRpbGVzID0gbnVsbDtcbiAgICAgIHRoaXMucm9vbXMgPSBbXTtcbiAgICAgIHJldHVybiB0aGlzLmZyZWUgPSB0aGlzLnRpbGVDb250YWluZXIuYWxsVGlsZXMoKS5maWx0ZXIoKHRpbGUpID0+IHtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiwgaywgbGVuLCBuZXh0LCByZWY7XG4gICAgICAgIHJlZiA9IERpcmVjdGlvbi5hbGw7XG4gICAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgIGRpcmVjdGlvbiA9IHJlZltrXTtcbiAgICAgICAgICBuZXh0ID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUodGlsZS54ICsgZGlyZWN0aW9uLngsIHRpbGUueSArIGRpcmVjdGlvbi55KTtcbiAgICAgICAgICBpZiAobmV4dCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FsY3VsKCkge1xuICAgICAgdmFyIGk7XG4gICAgICB0aGlzLmluaXRUaWxlcygpO1xuICAgICAgaSA9IDA7XG4gICAgICB3aGlsZSAodGhpcy5zdGVwKCkgfHwgdGhpcy5uZXdSb29tKCkpIHtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgICAgdGhpcy5jcmVhdGVEb29ycygpO1xuICAgICAgdGhpcy5yb29tcztcbiAgICAgIHJldHVybiB0aGlzLm1ha2VGaW5hbFRpbGVzKCk7XG4gICAgfVxuXG4gICAgbWFrZUZpbmFsVGlsZXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5maW5hbFRpbGVzID0gdGhpcy50aWxlQ29udGFpbmVyLmFsbFRpbGVzKCkubWFwKCh0aWxlKSA9PiB7XG4gICAgICAgIHZhciBvcHQ7XG4gICAgICAgIGlmICh0aWxlLmZhY3RvcnkgIT0gbnVsbCkge1xuICAgICAgICAgIG9wdCA9IHtcbiAgICAgICAgICAgIHg6IHRpbGUueCxcbiAgICAgICAgICAgIHk6IHRpbGUueVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRpbGUuZmFjdG9yeU9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbihvcHQsIHRpbGUuZmFjdG9yeU9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGlsZS5mYWN0b3J5KG9wdCk7XG4gICAgICAgIH1cbiAgICAgIH0pLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICByZXR1cm4gdGlsZSAhPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VGlsZXMoKSB7XG4gICAgICBpZiAodGhpcy5maW5hbFRpbGVzID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5jYWxjdWwoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmFsVGlsZXM7XG4gICAgfVxuXG4gICAgbmV3Um9vbSgpIHtcbiAgICAgIGlmICh0aGlzLmZyZWUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMudm9sdW1lID0gTWF0aC5mbG9vcih0aGlzLnJuZygpICogKHRoaXMubWF4Vm9sdW1lIC0gdGhpcy5taW5Wb2x1bWUpKSArIHRoaXMubWluVm9sdW1lO1xuICAgICAgICByZXR1cm4gdGhpcy5yb29tID0gbmV3IFJvb21HZW5lcmF0b3IuUm9vbSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJhbmRvbURpcmVjdGlvbnMoKSB7XG4gICAgICB2YXIgaSwgaiwgbywgeDtcbiAgICAgIG8gPSBEaXJlY3Rpb24uYWRqYWNlbnRzLnNsaWNlKCk7XG4gICAgICBqID0gdm9pZCAwO1xuICAgICAgeCA9IHZvaWQgMDtcbiAgICAgIGkgPSBvLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpKSB7XG4gICAgICAgIGogPSBNYXRoLmZsb29yKHRoaXMucm5nKCkgKiBpKTtcbiAgICAgICAgeCA9IG9bLS1pXTtcbiAgICAgICAgb1tpXSA9IG9bal07XG4gICAgICAgIG9bal0gPSB4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG87XG4gICAgfVxuXG4gICAgc3RlcCgpIHtcbiAgICAgIHZhciBzdWNjZXNzLCB0cmllcztcbiAgICAgIGlmICh0aGlzLnJvb20pIHtcbiAgICAgICAgaWYgKHRoaXMuZnJlZS5sZW5ndGggJiYgdGhpcy5yb29tLnRpbGVzLmxlbmd0aCA8IHRoaXMudm9sdW1lIC0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLnJvb20udGlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0cmllcyA9IHRoaXMucmFuZG9tRGlyZWN0aW9ucygpO1xuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgd2hpbGUgKHRyaWVzLmxlbmd0aCAmJiAhc3VjY2Vzcykge1xuICAgICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5leHBhbmQodGhpcy5yb29tLCB0cmllcy5wb3AoKSwgdGhpcy52b2x1bWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICAgIHRoaXMucm9vbURvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZSh0aGlzLnJhbmRvbUZyZWVUaWxlKCksIHRoaXMucm9vbSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yb29tRG9uZSgpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJvb21Eb25lKCkge1xuICAgICAgdGhpcy5yb29tcy5wdXNoKHRoaXMucm9vbSk7XG4gICAgICB0aGlzLmFsbG9jYXRlV2FsbHModGhpcy5yb29tKTtcbiAgICAgIHJldHVybiB0aGlzLnJvb20gPSBudWxsO1xuICAgIH1cblxuICAgIGV4cGFuZChyb29tLCBkaXJlY3Rpb24sIG1heCA9IDApIHtcbiAgICAgIHZhciBrLCBsZW4sIG5leHQsIHJlZiwgc2Vjb25kLCBzdWNjZXNzLCB0aWxlO1xuICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgcmVmID0gcm9vbS50aWxlcztcbiAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICB0aWxlID0gcmVmW2tdO1xuICAgICAgICBpZiAobWF4ID09PSAwIHx8IHJvb20udGlsZXMubGVuZ3RoIDwgbWF4KSB7XG4gICAgICAgICAgaWYgKG5leHQgPSB0aGlzLnRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUobmV4dCwgcm9vbSk7XG4gICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKChzZWNvbmQgPSB0aGlzLnRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uLCAyKSkgJiYgIXRoaXMudGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24sIDMpKSB7XG4gICAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZShzZWNvbmQsIHJvb20pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN1Y2Nlc3M7XG4gICAgfVxuXG4gICAgYWxsb2NhdGVXYWxscyhyb29tKSB7XG4gICAgICB2YXIgZGlyZWN0aW9uLCBrLCBsZW4sIG5leHQsIG5leHRSb29tLCBvdGhlclNpZGUsIHJlZiwgcmVzdWx0cywgdGlsZTtcbiAgICAgIHJlZiA9IHJvb20udGlsZXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgdGlsZSA9IHJlZltrXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgbCwgbGVuMSwgcmVmMSwgcmVzdWx0czE7XG4gICAgICAgICAgcmVmMSA9IERpcmVjdGlvbi5hbGw7XG4gICAgICAgICAgcmVzdWx0czEgPSBbXTtcbiAgICAgICAgICBmb3IgKGwgPSAwLCBsZW4xID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4xOyBsKyspIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IHJlZjFbbF07XG4gICAgICAgICAgICBuZXh0ID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUodGlsZS54ICsgZGlyZWN0aW9uLngsIHRpbGUueSArIGRpcmVjdGlvbi55KTtcbiAgICAgICAgICAgIGlmICgobmV4dCAhPSBudWxsKSAmJiBuZXh0LnJvb20gIT09IHJvb20pIHtcbiAgICAgICAgICAgICAgaWYgKGluZGV4T2YuY2FsbChEaXJlY3Rpb24uY29ybmVycywgZGlyZWN0aW9uKSA8IDApIHtcbiAgICAgICAgICAgICAgICBvdGhlclNpZGUgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh0aWxlLnggKyBkaXJlY3Rpb24ueCAqIDIsIHRpbGUueSArIGRpcmVjdGlvbi55ICogMik7XG4gICAgICAgICAgICAgICAgbmV4dFJvb20gPSAob3RoZXJTaWRlICE9IG51bGwgPyBvdGhlclNpZGUucm9vbSA6IHZvaWQgMCkgIT0gbnVsbCA/IG90aGVyU2lkZS5yb29tIDogbnVsbDtcbiAgICAgICAgICAgICAgICByb29tLmFkZFdhbGwobmV4dCwgbmV4dFJvb20pO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0Um9vbSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBuZXh0Um9vbS5hZGRXYWxsKG5leHQsIHJvb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBuZXh0LmZhY3RvcnkgPSB0aGlzLndhbGxGYWN0b3J5O1xuICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHRoaXMuYWxsb2NhdGVUaWxlKG5leHQpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMxLnB1c2godm9pZCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KS5jYWxsKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGNyZWF0ZURvb3JzKCkge1xuICAgICAgdmFyIGRvb3IsIGssIGxlbiwgcmVmLCByZXN1bHRzLCByb29tLCB3YWxscztcbiAgICAgIHJlZiA9IHRoaXMucm9vbXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgcm9vbSA9IHJlZltrXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgbCwgbGVuMSwgcmVmMSwgcmVzdWx0czE7XG4gICAgICAgICAgcmVmMSA9IHJvb20ud2FsbHNCeVJvb21zKCk7XG4gICAgICAgICAgcmVzdWx0czEgPSBbXTtcbiAgICAgICAgICBmb3IgKGwgPSAwLCBsZW4xID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4xOyBsKyspIHtcbiAgICAgICAgICAgIHdhbGxzID0gcmVmMVtsXTtcbiAgICAgICAgICAgIGlmICgod2FsbHMucm9vbSAhPSBudWxsKSAmJiByb29tLmRvb3JzRm9yUm9vbSh3YWxscy5yb29tKSA8IDEpIHtcbiAgICAgICAgICAgICAgZG9vciA9IHdhbGxzLnRpbGVzW01hdGguZmxvb3IodGhpcy5ybmcoKSAqIHdhbGxzLnRpbGVzLmxlbmd0aCldO1xuICAgICAgICAgICAgICBkb29yLmZhY3RvcnkgPSB0aGlzLmRvb3JGYWN0b3J5O1xuICAgICAgICAgICAgICBkb29yLmZhY3RvcnlPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUoZG9vci54ICsgMSwgZG9vci55KS5mYWN0b3J5ID09PSB0aGlzLmZsb29yRmFjdG9yeSA/IERvb3IuZGlyZWN0aW9ucy52ZXJ0aWNhbCA6IERvb3IuZGlyZWN0aW9ucy5ob3Jpem9udGFsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJvb20uYWRkRG9vcihkb29yLCB3YWxscy5yb29tKTtcbiAgICAgICAgICAgICAgcmVzdWx0czEucHVzaCh3YWxscy5yb29tLmFkZERvb3IoZG9vciwgcm9vbSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0czEucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pLmNhbGwodGhpcykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgYWxsb2NhdGVUaWxlKHRpbGUsIHJvb20gPSBudWxsKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpZiAocm9vbSAhPSBudWxsKSB7XG4gICAgICAgIHJvb20uYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgdGlsZS5mYWN0b3J5ID0gdGhpcy5mbG9vckZhY3Rvcnk7XG4gICAgICB9XG4gICAgICBpbmRleCA9IHRoaXMuZnJlZS5pbmRleE9mKHRpbGUpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJlZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uLCBtdWx0aXBseSA9IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGVJc0ZyZWUodGlsZS54ICsgZGlyZWN0aW9uLnggKiBtdWx0aXBseSwgdGlsZS55ICsgZGlyZWN0aW9uLnkgKiBtdWx0aXBseSk7XG4gICAgfVxuXG4gICAgdGlsZUlzRnJlZSh4LCB5KSB7XG4gICAgICB2YXIgdGlsZTtcbiAgICAgIHRpbGUgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh4LCB5KTtcbiAgICAgIGlmICgodGlsZSAhPSBudWxsKSAmJiBpbmRleE9mLmNhbGwodGhpcy5mcmVlLCB0aWxlKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiB0aWxlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJhbmRvbUZyZWVUaWxlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZnJlZVtNYXRoLmZsb29yKHRoaXMucm5nKCkgKiB0aGlzLmZyZWUubGVuZ3RoKV07XG4gICAgfVxuXG4gIH07XG5cbiAgUm9vbUdlbmVyYXRvci5wcm9wZXJ0aWVzKHtcbiAgICBybmc6IHtcbiAgICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gICAgfSxcbiAgICBtYXhWb2x1bWU6IHtcbiAgICAgIGRlZmF1bHQ6IDI1XG4gICAgfSxcbiAgICBtaW5Wb2x1bWU6IHtcbiAgICAgIGRlZmF1bHQ6IDUwXG4gICAgfSxcbiAgICB3aWR0aDoge1xuICAgICAgZGVmYXVsdDogMzBcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgZGVmYXVsdDogMTVcbiAgICB9LFxuICAgIHRpbGVDb250YWluZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBrLCBsLCByZWYsIHJlZjEsIHRpbGVzLCB4LCB5O1xuICAgICAgICB0aWxlcyA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICAgIGZvciAoeCA9IGsgPSAwLCByZWYgPSB0aGlzLndpZHRoOyAoMCA8PSByZWYgPyBrIDw9IHJlZiA6IGsgPj0gcmVmKTsgeCA9IDAgPD0gcmVmID8gKytrIDogLS1rKSB7XG4gICAgICAgICAgZm9yICh5ID0gbCA9IDAsIHJlZjEgPSB0aGlzLmhlaWdodDsgKDAgPD0gcmVmMSA/IGwgPD0gcmVmMSA6IGwgPj0gcmVmMSk7IHkgPSAwIDw9IHJlZjEgPyArK2wgOiAtLWwpIHtcbiAgICAgICAgICAgIHRpbGVzLmFkZFRpbGUobmV3IFRpbGUoeCwgeSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgICB9XG4gICAgfSxcbiAgICBmbG9vckZhY3Rvcnk6IHtcbiAgICAgIGRlZmF1bHQ6IGZ1bmN0aW9uKG9wdCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUob3B0LngsIG9wdC55KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHdhbGxGYWN0b3J5OiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBkb29yRmFjdG9yeToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvb3JGYWN0b3J5O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFJvb21HZW5lcmF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cblJvb21HZW5lcmF0b3IuUm9vbSA9IGNsYXNzIFJvb20ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRpbGVzID0gW107XG4gICAgdGhpcy53YWxscyA9IFtdO1xuICAgIHRoaXMuZG9vcnMgPSBbXTtcbiAgfVxuXG4gIGFkZFRpbGUodGlsZSkge1xuICAgIHRoaXMudGlsZXMucHVzaCh0aWxlKTtcbiAgICByZXR1cm4gdGlsZS5yb29tID0gdGhpcztcbiAgfVxuXG4gIGNvbnRhaW5zV2FsbCh0aWxlKSB7XG4gICAgdmFyIGssIGxlbiwgcmVmLCB3YWxsO1xuICAgIHJlZiA9IHRoaXMud2FsbHM7XG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICB3YWxsID0gcmVmW2tdO1xuICAgICAgaWYgKHdhbGwudGlsZSA9PT0gdGlsZSkge1xuICAgICAgICByZXR1cm4gd2FsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYWRkV2FsbCh0aWxlLCBuZXh0Um9vbSkge1xuICAgIHZhciBleGlzdGluZztcbiAgICBleGlzdGluZyA9IHRoaXMuY29udGFpbnNXYWxsKHRpbGUpO1xuICAgIGlmIChleGlzdGluZykge1xuICAgICAgcmV0dXJuIGV4aXN0aW5nLm5leHRSb29tID0gbmV4dFJvb207XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGxzLnB1c2goe1xuICAgICAgICB0aWxlOiB0aWxlLFxuICAgICAgICBuZXh0Um9vbTogbmV4dFJvb21cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHdhbGxzQnlSb29tcygpIHtcbiAgICB2YXIgaywgbGVuLCBwb3MsIHJlZiwgcmVzLCByb29tcywgd2FsbDtcbiAgICByb29tcyA9IFtdO1xuICAgIHJlcyA9IFtdO1xuICAgIHJlZiA9IHRoaXMud2FsbHM7XG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICB3YWxsID0gcmVmW2tdO1xuICAgICAgcG9zID0gcm9vbXMuaW5kZXhPZih3YWxsLm5leHRSb29tKTtcbiAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgIHBvcyA9IHJvb21zLmxlbmd0aDtcbiAgICAgICAgcm9vbXMucHVzaCh3YWxsLm5leHRSb29tKTtcbiAgICAgICAgcmVzLnB1c2goe1xuICAgICAgICAgIHJvb206IHdhbGwubmV4dFJvb20sXG4gICAgICAgICAgdGlsZXM6IFtdXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmVzW3Bvc10udGlsZXMucHVzaCh3YWxsLnRpbGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgYWRkRG9vcih0aWxlLCBuZXh0Um9vbSkge1xuICAgIHJldHVybiB0aGlzLmRvb3JzLnB1c2goe1xuICAgICAgdGlsZTogdGlsZSxcbiAgICAgIG5leHRSb29tOiBuZXh0Um9vbVxuICAgIH0pO1xuICB9XG5cbiAgZG9vcnNGb3JSb29tKHJvb20pIHtcbiAgICB2YXIgZG9vciwgaywgbGVuLCByZWYsIHJlcztcbiAgICByZXMgPSBbXTtcbiAgICByZWYgPSB0aGlzLmRvb3JzO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgZG9vciA9IHJlZltrXTtcbiAgICAgIGlmIChkb29yLm5leHRSb29tID09PSByb29tKSB7XG4gICAgICAgIHJlcy5wdXNoKGRvb3IudGlsZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Sb29tR2VuZXJhdG9yLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIFNoaXAsIFRyYXZlbCwgVHJhdmVsQWN0aW9uO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRyYXZlbCA9IHJlcXVpcmUoJy4vVHJhdmVsJyk7XG5cblRyYXZlbEFjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9UcmF2ZWxBY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTaGlwIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgdHJhdmVsVG8obG9jYXRpb24pIHtcbiAgICAgIHZhciB0cmF2ZWw7XG4gICAgICB0cmF2ZWwgPSBuZXcgVHJhdmVsKHtcbiAgICAgICAgdHJhdmVsbGVyOiB0aGlzLFxuICAgICAgICBzdGFydExvY2F0aW9uOiB0aGlzLmxvY2F0aW9uLFxuICAgICAgICB0YXJnZXRMb2NhdGlvbjogbG9jYXRpb25cbiAgICAgIH0pO1xuICAgICAgaWYgKHRyYXZlbC52YWxpZCkge1xuICAgICAgICB0cmF2ZWwuc3RhcnQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhdmVsID0gdHJhdmVsO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFNoaXAucHJvcGVydGllcyh7XG4gICAgbG9jYXRpb246IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHRyYXZlbDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcHJvdmlkZWRBY3Rpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gbmV3IFRyYXZlbEFjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzcGFjZUNvb2RpbmF0ZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IucHJvcCh0aGlzLnRyYXZlbFByb3BlcnR5KSkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wUGF0aCgndHJhdmVsLnNwYWNlQ29vZGluYXRlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGludmFsaWRhdG9yLnByb3BQYXRoKCdsb2NhdGlvbi54JyksXG4gICAgICAgICAgICB5OiBpbnZhbGlkYXRvci5wcm9wUGF0aCgnbG9jYXRpb24ueScpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNoaXA7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvU2hpcC5qcy5tYXBcbiIsInZhciBEYW1hZ2VhYmxlLCBQcm9qZWN0aWxlLCBTaGlwV2VhcG9uLCBUaWxlZCwgVGltaW5nO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxuRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpO1xuXG5Qcm9qZWN0aWxlID0gcmVxdWlyZSgnLi9Qcm9qZWN0aWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFdlYXBvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2hpcFdlYXBvbiBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcihvcHRpb25zKTtcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgdmFyIHByb2plY3RpbGU7XG4gICAgICBpZiAodGhpcy5jYW5GaXJlKSB7XG4gICAgICAgIHByb2plY3RpbGUgPSBuZXcgdGhpcy5wcm9qZWN0aWxlQ2xhc3Moe1xuICAgICAgICAgIG9yaWdpbjogdGhpcyxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICAgIGJsYXN0UmFuZ2U6IHRoaXMuYmxhc3RSYW5nZSxcbiAgICAgICAgICBwcm9wYWdhdGlvblR5cGU6IHRoaXMucHJvcGFnYXRpb25UeXBlLFxuICAgICAgICAgIHNwZWVkOiB0aGlzLnByb2plY3RpbGVTcGVlZCxcbiAgICAgICAgICB0aW1pbmc6IHRoaXMudGltaW5nXG4gICAgICAgIH0pO1xuICAgICAgICBwcm9qZWN0aWxlLmxhdW5jaCgpO1xuICAgICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZWNoYXJnZSgpO1xuICAgICAgICByZXR1cm4gcHJvamVjdGlsZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWNoYXJnZSgpIHtcbiAgICAgIHRoaXMuY2hhcmdpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJnaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlZCgpO1xuICAgICAgfSwgdGhpcy5yZWNoYXJnZVRpbWUpO1xuICAgIH1cblxuICAgIHJlY2hhcmdlZCgpIHtcbiAgICAgIHRoaXMuY2hhcmdlZCA9IHRydWU7XG4gICAgICBpZiAodGhpcy5hdXRvRmlyZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5maXJlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgU2hpcFdlYXBvbi5leHRlbmQoRGFtYWdlYWJsZSk7XG5cbiAgU2hpcFdlYXBvbi5wcm9wZXJ0aWVzKHtcbiAgICByZWNoYXJnZVRpbWU6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgYmxhc3RSYW5nZToge1xuICAgICAgZGVmYXVsdDogMVxuICAgIH0sXG4gICAgcHJvcGFnYXRpb25UeXBlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBwcm9qZWN0aWxlU3BlZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICB0YXJnZXQ6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5hdXRvRmlyZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZpcmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY2hhcmdlZDoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY2hhcmdpbmc6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGVuYWJsZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGF1dG9GaXJlOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBjcml0aWNhbEhlYWx0aDoge1xuICAgICAgZGVmYXVsdDogMC4zXG4gICAgfSxcbiAgICBjYW5GaXJlOiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQgJiYgdGhpcy5lbmFibGVkICYmIHRoaXMuY2hhcmdlZCAmJiB0aGlzLmhlYWx0aCAvIHRoaXMubWF4SGVhbHRoID49IHRoaXMuY3JpdGljYWxIZWFsdGg7XG4gICAgICB9XG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm9qZWN0aWxlQ2xhc3M6IHtcbiAgICAgIGRlZmF1bHQ6IFByb2plY3RpbGVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaGlwV2VhcG9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1NoaXBXZWFwb24uanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTWFwLCBTdGFyTWFwR2VuZXJhdG9yLCBTdGFyU3lzdGVtLCBzdGFyTmFtZXM7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTWFwID0gcmVxdWlyZSgnLi9NYXAnKTtcblxuU3RhclN5c3RlbSA9IHJlcXVpcmUoJy4vU3RhclN5c3RlbScpO1xuXG5zdGFyTmFtZXMgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXN0cmluZ3MnKS5zdGFyTmFtZXM7XG5cbm1vZHVsZS5leHBvcnRzID0gU3Rhck1hcEdlbmVyYXRvciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU3Rhck1hcEdlbmVyYXRvciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLm9wdCA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmT3B0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgIHRoaXMubWFwID0gbmV3IHRoaXMub3B0Lm1hcENsYXNzKCk7XG4gICAgICB0aGlzLnN0YXJzID0gdGhpcy5tYXAubG9jYXRpb25zLmNvcHkoKTtcbiAgICAgIHRoaXMubGlua3MgPSBbXTtcbiAgICAgIHRoaXMuY3JlYXRlU3RhcnModGhpcy5vcHQubmJTdGFycyk7XG4gICAgICB0aGlzLm1ha2VMaW5rcygpO1xuICAgICAgcmV0dXJuIHRoaXMubWFwO1xuICAgIH1cblxuICAgIGNyZWF0ZVN0YXJzKG5iKSB7XG4gICAgICB2YXIgaSwgaywgcmVmLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gayA9IDAsIHJlZiA9IG5iOyAoMCA8PSByZWYgPyBrIDwgcmVmIDogayA+IHJlZik7IGkgPSAwIDw9IHJlZiA/ICsrayA6IC0taykge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5jcmVhdGVTdGFyKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgY3JlYXRlU3RhcihvcHQgPSB7fSkge1xuICAgICAgdmFyIG5hbWUsIHBvcywgc3RhcjtcbiAgICAgIGlmICghKG9wdC54ICYmIG9wdC55KSkge1xuICAgICAgICBwb3MgPSB0aGlzLnJhbmRvbVN0YXJQb3MoKTtcbiAgICAgICAgaWYgKHBvcyAhPSBudWxsKSB7XG4gICAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0LCB7XG4gICAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICAgIHk6IHBvcy55XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghb3B0Lm5hbWUpIHtcbiAgICAgICAgbmFtZSA9IHRoaXMucmFuZG9tU3Rhck5hbWUoKTtcbiAgICAgICAgaWYgKG5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe30sIG9wdCwge1xuICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGFyID0gbmV3IHRoaXMub3B0LnN0YXJDbGFzcyhvcHQpO1xuICAgICAgdGhpcy5tYXAubG9jYXRpb25zLnB1c2goc3Rhcik7XG4gICAgICB0aGlzLnN0YXJzLnB1c2goc3Rhcik7XG4gICAgICByZXR1cm4gc3RhcjtcbiAgICB9XG5cbiAgICByYW5kb21TdGFyUG9zKCkge1xuICAgICAgdmFyIGosIHBvcztcbiAgICAgIGogPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgcG9zID0ge1xuICAgICAgICAgIHg6IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiAodGhpcy5vcHQubWF4WCAtIHRoaXMub3B0Lm1pblgpICsgdGhpcy5vcHQubWluWCksXG4gICAgICAgICAgeTogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhZIC0gdGhpcy5vcHQubWluWSkgKyB0aGlzLm9wdC5taW5ZKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIShqIDwgMTAgJiYgdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHN0YXIuZGlzdChwb3MueCwgcG9zLnkpIDw9IHRoaXMub3B0Lm1pblN0YXJEaXN0O1xuICAgICAgICB9KSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgICBpZiAoIShqID49IDEwKSkge1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJhbmRvbVN0YXJOYW1lKCkge1xuICAgICAgdmFyIG5hbWUsIHBvcywgcmVmO1xuICAgICAgaWYgKChyZWYgPSB0aGlzLm9wdC5zdGFyTmFtZXMpICE9IG51bGwgPyByZWYubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgIHBvcyA9IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiB0aGlzLm9wdC5zdGFyTmFtZXMubGVuZ3RoKTtcbiAgICAgICAgbmFtZSA9IHRoaXMub3B0LnN0YXJOYW1lc1twb3NdO1xuICAgICAgICB0aGlzLm9wdC5zdGFyTmFtZXMuc3BsaWNlKHBvcywgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VMaW5rcygpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJzLmZvckVhY2goKHN0YXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZUxpbmtzRnJvbShzdGFyKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VMaW5rc0Zyb20oc3Rhcikge1xuICAgICAgdmFyIGNsb3NlLCBjbG9zZXN0cywgbGluaywgbmVlZGVkLCByZXN1bHRzLCB0cmllcztcbiAgICAgIHRyaWVzID0gdGhpcy5vcHQubGlua1RyaWVzO1xuICAgICAgbmVlZGVkID0gdGhpcy5vcHQubGlua3NCeVN0YXJzIC0gc3Rhci5saW5rcy5jb3VudCgpO1xuICAgICAgaWYgKG5lZWRlZCA+IDApIHtcbiAgICAgICAgY2xvc2VzdHMgPSB0aGlzLnN0YXJzLmZpbHRlcigoc3RhcjIpID0+IHtcbiAgICAgICAgICByZXR1cm4gc3RhcjIgIT09IHN0YXIgJiYgIXN0YXIubGlua3MuZmluZFN0YXIoc3RhcjIpO1xuICAgICAgICB9KS5jbG9zZXN0cyhzdGFyLngsIHN0YXIueSk7XG4gICAgICAgIGlmIChjbG9zZXN0cy5jb3VudCgpID4gMCkge1xuICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY2xvc2UgPSBjbG9zZXN0cy5zaGlmdCgpO1xuICAgICAgICAgICAgbGluayA9IHRoaXMuY3JlYXRlTGluayhzdGFyLCBjbG9zZSk7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZUxpbmsobGluaykpIHtcbiAgICAgICAgICAgICAgdGhpcy5saW5rcy5wdXNoKGxpbmspO1xuICAgICAgICAgICAgICBzdGFyLmFkZExpbmsobGluayk7XG4gICAgICAgICAgICAgIG5lZWRlZCAtPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdHJpZXMgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghKG5lZWRlZCA+IDAgJiYgdHJpZXMgPiAwICYmIGNsb3Nlc3RzLmNvdW50KCkgPiAwKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUxpbmsoc3RhcjEsIHN0YXIyKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMub3B0LmxpbmtDbGFzcyhzdGFyMSwgc3RhcjIpO1xuICAgIH1cblxuICAgIHZhbGlkYXRlTGluayhsaW5rKSB7XG4gICAgICByZXR1cm4gIXRoaXMuc3RhcnMuZmluZCgoc3RhcikgPT4ge1xuICAgICAgICByZXR1cm4gc3RhciAhPT0gbGluay5zdGFyMSAmJiBzdGFyICE9PSBsaW5rLnN0YXIyICYmIGxpbmsuY2xvc2VUb1BvaW50KHN0YXIueCwgc3Rhci55LCB0aGlzLm9wdC5taW5MaW5rRGlzdCk7XG4gICAgICB9KSAmJiAhdGhpcy5saW5rcy5maW5kKChsaW5rMikgPT4ge1xuICAgICAgICByZXR1cm4gbGluazIuaW50ZXJzZWN0TGluayhsaW5rKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIFN0YXJNYXBHZW5lcmF0b3IucHJvdG90eXBlLmRlZk9wdCA9IHtcbiAgICBuYlN0YXJzOiAyMCxcbiAgICBtaW5YOiAwLFxuICAgIG1heFg6IDUwMCxcbiAgICBtaW5ZOiAwLFxuICAgIG1heFk6IDUwMCxcbiAgICBtaW5TdGFyRGlzdDogMjAsXG4gICAgbWluTGlua0Rpc3Q6IDIwLFxuICAgIGxpbmtzQnlTdGFyczogMyxcbiAgICBsaW5rVHJpZXM6IDMsXG4gICAgbWFwQ2xhc3M6IE1hcCxcbiAgICBzdGFyQ2xhc3M6IFN0YXJTeXN0ZW0sXG4gICAgbGlua0NsYXNzOiBTdGFyU3lzdGVtLkxpbmssXG4gICAgcm5nOiBNYXRoLnJhbmRvbSxcbiAgICBzdGFyTmFtZXM6IHN0YXJOYW1lc1xuICB9O1xuXG4gIHJldHVybiBTdGFyTWFwR2VuZXJhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1N0YXJNYXBHZW5lcmF0b3IuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgU3RhclN5c3RlbTtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJTeXN0ZW0gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFN0YXJTeXN0ZW0gZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICBzdXBlcihkYXRhKTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7fVxuXG4gICAgbGlua1RvKHN0YXIpIHtcbiAgICAgIGlmICghdGhpcy5saW5rcy5maW5kU3RhcihzdGFyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRMaW5rKG5ldyB0aGlzLmNvbnN0cnVjdG9yLkxpbmsodGhpcywgc3RhcikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZExpbmsobGluaykge1xuICAgICAgdGhpcy5saW5rcy5hZGQobGluayk7XG4gICAgICBsaW5rLm90aGVyU3Rhcih0aGlzKS5saW5rcy5hZGQobGluayk7XG4gICAgICByZXR1cm4gbGluaztcbiAgICB9XG5cbiAgICBkaXN0KHgsIHkpIHtcbiAgICAgIHZhciB4RGlzdCwgeURpc3Q7XG4gICAgICB4RGlzdCA9IHRoaXMueCAtIHg7XG4gICAgICB5RGlzdCA9IHRoaXMueSAtIHk7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KCh4RGlzdCAqIHhEaXN0KSArICh5RGlzdCAqIHlEaXN0KSk7XG4gICAgfVxuXG4gICAgaXNTZWxlY3RhYmxlQnkocGxheWVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgfTtcblxuICBTdGFyU3lzdGVtLnByb3BlcnRpZXMoe1xuICAgIHg6IHt9LFxuICAgIHk6IHt9LFxuICAgIG5hbWU6IHt9LFxuICAgIGxpbmtzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB7XG4gICAgICAgIGZpbmRTdGFyOiBmdW5jdGlvbihzdGFyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluZChmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgICByZXR1cm4gbGluay5zdGFyMiA9PT0gc3RhciB8fCBsaW5rLnN0YXIxID09PSBzdGFyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBTdGFyU3lzdGVtLmNvbGxlbmN0aW9uRm4gPSB7XG4gICAgY2xvc2VzdDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIG1pbiwgbWluRGlzdDtcbiAgICAgIG1pbiA9IG51bGw7XG4gICAgICBtaW5EaXN0ID0gbnVsbDtcbiAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihzdGFyKSB7XG4gICAgICAgIHZhciBkaXN0O1xuICAgICAgICBkaXN0ID0gc3Rhci5kaXN0KHgsIHkpO1xuICAgICAgICBpZiAoKG1pbiA9PSBudWxsKSB8fCBtaW5EaXN0ID4gZGlzdCkge1xuICAgICAgICAgIG1pbiA9IHN0YXI7XG4gICAgICAgICAgcmV0dXJuIG1pbkRpc3QgPSBkaXN0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtaW47XG4gICAgfSxcbiAgICBjbG9zZXN0czogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIGRpc3RzO1xuICAgICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbihzdGFyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZGlzdDogc3Rhci5kaXN0KHgsIHkpLFxuICAgICAgICAgIHN0YXI6IHN0YXJcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgZGlzdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3Q7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLmNvcHkoZGlzdHMubWFwKGZ1bmN0aW9uKGRpc3QpIHtcbiAgICAgICAgcmV0dXJuIGRpc3Quc3RhcjtcbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YXJTeXN0ZW07XG5cbn0pLmNhbGwodGhpcyk7XG5cblN0YXJTeXN0ZW0uTGluayA9IGNsYXNzIExpbmsgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3Ioc3RhcjEsIHN0YXIyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXIxID0gc3RhcjE7XG4gICAgdGhpcy5zdGFyMiA9IHN0YXIyO1xuICB9XG5cbiAgcmVtb3ZlKCkge1xuICAgIHRoaXMuc3RhcjEubGlua3MucmVtb3ZlKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnN0YXIyLmxpbmtzLnJlbW92ZSh0aGlzKTtcbiAgfVxuXG4gIG90aGVyU3RhcihzdGFyKSB7XG4gICAgaWYgKHN0YXIgPT09IHRoaXMuc3RhcjEpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXIyO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFyMTtcbiAgICB9XG4gIH1cblxuICBnZXRMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcjEuZGlzdCh0aGlzLnN0YXIyLngsIHRoaXMuc3RhcjIueSk7XG4gIH1cblxuICBpbkJvdW5kYXJ5Qm94KHgsIHksIHBhZGRpbmcgPSAwKSB7XG4gICAgdmFyIHgxLCB4MiwgeTEsIHkyO1xuICAgIHgxID0gTWF0aC5taW4odGhpcy5zdGFyMS54LCB0aGlzLnN0YXIyLngpIC0gcGFkZGluZztcbiAgICB5MSA9IE1hdGgubWluKHRoaXMuc3RhcjEueSwgdGhpcy5zdGFyMi55KSAtIHBhZGRpbmc7XG4gICAgeDIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgKyBwYWRkaW5nO1xuICAgIHkyID0gTWF0aC5tYXgodGhpcy5zdGFyMS55LCB0aGlzLnN0YXIyLnkpICsgcGFkZGluZztcbiAgICByZXR1cm4geCA+PSB4MSAmJiB4IDw9IHgyICYmIHkgPj0geTEgJiYgeSA8PSB5MjtcbiAgfVxuXG4gIGNsb3NlVG9Qb2ludCh4LCB5LCBtaW5EaXN0KSB7XG4gICAgdmFyIGEsIGFiRGlzdCwgYWJjQW5nbGUsIGFieEFuZ2xlLCBhY0Rpc3QsIGFjeEFuZ2xlLCBiLCBjLCBjZERpc3QsIHhBYkRpc3QsIHhBY0Rpc3QsIHlBYkRpc3QsIHlBY0Rpc3Q7XG4gICAgaWYgKCF0aGlzLmluQm91bmRhcnlCb3goeCwgeSwgbWluRGlzdCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHRoaXMuc3RhcjE7XG4gICAgYiA9IHRoaXMuc3RhcjI7XG4gICAgYyA9IHtcbiAgICAgIFwieFwiOiB4LFxuICAgICAgXCJ5XCI6IHlcbiAgICB9O1xuICAgIHhBYkRpc3QgPSBiLnggLSBhLng7XG4gICAgeUFiRGlzdCA9IGIueSAtIGEueTtcbiAgICBhYkRpc3QgPSBNYXRoLnNxcnQoKHhBYkRpc3QgKiB4QWJEaXN0KSArICh5QWJEaXN0ICogeUFiRGlzdCkpO1xuICAgIGFieEFuZ2xlID0gTWF0aC5hdGFuKHlBYkRpc3QgLyB4QWJEaXN0KTtcbiAgICB4QWNEaXN0ID0gYy54IC0gYS54O1xuICAgIHlBY0Rpc3QgPSBjLnkgLSBhLnk7XG4gICAgYWNEaXN0ID0gTWF0aC5zcXJ0KCh4QWNEaXN0ICogeEFjRGlzdCkgKyAoeUFjRGlzdCAqIHlBY0Rpc3QpKTtcbiAgICBhY3hBbmdsZSA9IE1hdGguYXRhbih5QWNEaXN0IC8geEFjRGlzdCk7XG4gICAgYWJjQW5nbGUgPSBhYnhBbmdsZSAtIGFjeEFuZ2xlO1xuICAgIGNkRGlzdCA9IE1hdGguYWJzKE1hdGguc2luKGFiY0FuZ2xlKSAqIGFjRGlzdCk7XG4gICAgcmV0dXJuIGNkRGlzdCA8PSBtaW5EaXN0O1xuICB9XG5cbiAgaW50ZXJzZWN0TGluayhsaW5rKSB7XG4gICAgdmFyIHMsIHMxX3gsIHMxX3ksIHMyX3gsIHMyX3ksIHQsIHgxLCB4MiwgeDMsIHg0LCB5MSwgeTIsIHkzLCB5NDtcbiAgICB4MSA9IHRoaXMuc3RhcjEueDtcbiAgICB5MSA9IHRoaXMuc3RhcjEueTtcbiAgICB4MiA9IHRoaXMuc3RhcjIueDtcbiAgICB5MiA9IHRoaXMuc3RhcjIueTtcbiAgICB4MyA9IGxpbmsuc3RhcjEueDtcbiAgICB5MyA9IGxpbmsuc3RhcjEueTtcbiAgICB4NCA9IGxpbmsuc3RhcjIueDtcbiAgICB5NCA9IGxpbmsuc3RhcjIueTtcbiAgICBzMV94ID0geDIgLSB4MTtcbiAgICBzMV95ID0geTIgLSB5MTtcbiAgICBzMl94ID0geDQgLSB4MztcbiAgICBzMl95ID0geTQgLSB5MztcbiAgICBzID0gKC1zMV95ICogKHgxIC0geDMpICsgczFfeCAqICh5MSAtIHkzKSkgLyAoLXMyX3ggKiBzMV95ICsgczFfeCAqIHMyX3kpO1xuICAgIHQgPSAoczJfeCAqICh5MSAtIHkzKSAtIHMyX3kgKiAoeDEgLSB4MykpIC8gKC1zMl94ICogczFfeSArIHMxX3ggKiBzMl95KTtcbiAgICByZXR1cm4gcyA+IDAgJiYgcyA8IDEgJiYgdCA+IDAgJiYgdCA8IDE7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9TdGFyU3lzdGVtLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIFRpbWluZywgVHJhdmVsO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhdmVsID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUcmF2ZWwgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBzdGFydChsb2NhdGlvbikge1xuICAgICAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSB0aGlzO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudHJhdmVsbGVyLmxvY2F0aW9uID0gdGhpcy50YXJnZXRMb2NhdGlvbjtcbiAgICAgICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSBudWxsO1xuICAgICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKCdzdG9wIG1vdmluZycpO1xuICAgICAgICB9LCB0aGlzLmR1cmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBUcmF2ZWwucHJvcGVydGllcyh7XG4gICAgdHJhdmVsbGVyOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBzdGFydExvY2F0aW9uOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICB0YXJnZXRMb2NhdGlvbjoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgY3VycmVudFNlY3Rpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0TG9jYXRpb24ubGlua3MuZmluZFN0YXIodGhpcy50YXJnZXRMb2NhdGlvbik7XG4gICAgICB9XG4gICAgfSxcbiAgICBkdXJhdGlvbjoge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgbW92aW5nOiB7XG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgdmFsaWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWYsIHJlZjE7XG4gICAgICAgIGlmICh0aGlzLnRhcmdldExvY2F0aW9uID09PSB0aGlzLnN0YXJ0TG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCgoKHJlZiA9IHRoaXMudGFyZ2V0TG9jYXRpb24pICE9IG51bGwgPyByZWYubGlua3MgOiB2b2lkIDApICE9IG51bGwpICYmICgoKHJlZjEgPSB0aGlzLnN0YXJ0TG9jYXRpb24pICE9IG51bGwgPyByZWYxLmxpbmtzIDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZWN0aW9uICE9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNwYWNlQ29vZGluYXRlOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciBlbmRYLCBlbmRZLCBwcmMsIHN0YXJ0WCwgc3RhcnRZO1xuICAgICAgICBzdGFydFggPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgnc3RhcnRMb2NhdGlvbi54Jyk7XG4gICAgICAgIHN0YXJ0WSA9IGludmFsaWRhdG9yLnByb3BQYXRoKCdzdGFydExvY2F0aW9uLnknKTtcbiAgICAgICAgZW5kWCA9IGludmFsaWRhdG9yLnByb3BQYXRoKCd0YXJnZXRMb2NhdGlvbi54Jyk7XG4gICAgICAgIGVuZFkgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgndGFyZ2V0TG9jYXRpb24ueScpO1xuICAgICAgICBwcmMgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgncGF0aFRpbWVvdXQucHJjJyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogKHN0YXJ0WCAtIGVuZFgpICogcHJjICsgZW5kWCxcbiAgICAgICAgICB5OiAoc3RhcnRZIC0gZW5kWSkgKiBwcmMgKyBlbmRZXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVHJhdmVsO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1RyYXZlbC5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBHcmlkLCBWaWV3O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkdyaWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLWdyaWRzJykuR3JpZDtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBWaWV3IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCF0aGlzLmJvdW5kcykge1xuICAgICAgICB0aGlzLmdyaWQgPSB0aGlzLmdyaWQgfHwgKChyZWYgPSB0aGlzLmdhbWUubWFpblZpZXdQcm9wZXJ0eS52YWx1ZSkgIT0gbnVsbCA/IHJlZi5ncmlkIDogdm9pZCAwKSB8fCBuZXcgR3JpZCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5ib3VuZHMgPSB0aGlzLmdyaWQuYWRkQ2VsbCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICByZXR1cm4gdGhpcy5nYW1lID0gbnVsbDtcbiAgICB9XG5cbiAgfTtcblxuICBWaWV3LnByb3BlcnRpZXMoe1xuICAgIGdhbWU6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24odmFsLCBvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICAgIHRoaXMuZ2FtZS52aWV3cy5hZGQodGhpcyk7XG4gICAgICAgICAgdGhpcy5zZXREZWZhdWx0cygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICByZXR1cm4gb2xkLnZpZXdzLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgeToge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgYm91bmRzOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVmlldztcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9WaWV3LmpzLm1hcFxuIiwidmFyIERpcmVjdGlvbiwgTGluZU9mU2lnaHQsIFRpbGVDb250YWluZXIsIFRpbGVSZWZlcmVuY2UsIFZpc2lvbkNhbGN1bGF0b3I7XG5cbkxpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpO1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uO1xuXG5UaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXI7XG5cblRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVJlZmVyZW5jZTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaXNpb25DYWxjdWxhdG9yID0gY2xhc3MgVmlzaW9uQ2FsY3VsYXRvciB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpblRpbGUsIG9mZnNldCA9IHtcbiAgICAgIHg6IDAuNSxcbiAgICAgIHk6IDAuNVxuICAgIH0pIHtcbiAgICB0aGlzLm9yaWdpblRpbGUgPSBvcmlnaW5UaWxlO1xuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHRoaXMucHRzID0ge307XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge307XG4gICAgdGhpcy5zdGFjayA9IFtdO1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgY2FsY3VsKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB2YXIgZmlyc3RCYXRjaCwgaW5pdGlhbFB0cztcbiAgICB0aGlzLnB0cyA9IHt9O1xuICAgIHRoaXMudmlzaWJpbGl0eSA9IHt9O1xuICAgIGluaXRpYWxQdHMgPSBbXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDFcbiAgICAgIH1cbiAgICBdO1xuICAgIGluaXRpYWxQdHMuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnNldFB0KHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55LCB0cnVlKTtcbiAgICB9KTtcbiAgICBmaXJzdEJhdGNoID0gW1xuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDIsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAxXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAyXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAtMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDJcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiB0aGlzLnN0YWNrID0gZmlyc3RCYXRjaC5tYXAoKHB0KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLm9yaWdpblRpbGUueCArIHB0LngsXG4gICAgICAgIHk6IHRoaXMub3JpZ2luVGlsZS55ICsgcHQueVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFB0KHgsIHksIHZhbCkge1xuICAgIHZhciBhZGphbmNlbnQ7XG4gICAgdGhpcy5wdHNbeCArICc6JyArIHldID0gdmFsO1xuICAgIGFkamFuY2VudCA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiBhZGphbmNlbnQuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFZpc2liaWxpdHkoeCArIHB0LngsIHkgKyBwdC55LCB2YWwgPyAxIC8gYWRqYW5jZW50Lmxlbmd0aCA6IDApO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UHQoeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnB0c1t4ICsgJzonICsgeV07XG4gIH1cblxuICBhZGRWaXNpYmlsaXR5KHgsIHksIHZhbCkge1xuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5W3hdID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF1beV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVt4XVt5XSArPSB2YWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmlzaWJpbGl0eSh4LCB5KSB7XG4gICAgaWYgKCh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkgfHwgKHRoaXMudmlzaWJpbGl0eVt4XVt5XSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV07XG4gICAgfVxuICB9XG5cbiAgY2FuUHJvY2Vzcyh4LCB5KSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YWNrLnNvbWUoKHB0KSA9PiB7XG4gICAgICByZXR1cm4gcHQueCA9PT0geCAmJiBwdC55ID09PSB5O1xuICAgIH0pICYmICh0aGlzLmdldFB0KHgsIHkpID09IG51bGwpO1xuICB9XG5cbiAgc3RlcCgpIHtcbiAgICB2YXIgbG9zLCBwdDtcbiAgICBwdCA9IHRoaXMuc3RhY2suc2hpZnQoKTtcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lciwgdGhpcy5vcmlnaW5UaWxlLnggKyB0aGlzLm9mZnNldC54LCB0aGlzLm9yaWdpblRpbGUueSArIHRoaXMub2Zmc2V0LnksIHB0LngsIHB0LnkpO1xuICAgIGxvcy5yZXZlcnNlVHJhY2luZygpO1xuICAgIGxvcy50cmF2ZXJzYWJsZUNhbGxiYWNrID0gKHRpbGUsIGVudHJ5WCwgZW50cnlZKSA9PiB7XG4gICAgICBpZiAodGlsZSAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmdldFZpc2liaWxpdHkodGlsZS54LCB0aWxlLnkpID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGxvcy5mb3JjZVN1Y2Nlc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGlsZS50cmFuc3BhcmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5zZXRQdChwdC54LCBwdC55LCBsb3MuZ2V0U3VjY2VzcygpKTtcbiAgICBpZiAobG9zLmdldFN1Y2Nlc3MoKSkge1xuICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZm9yRWFjaCgoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIHZhciBuZXh0UHQ7XG4gICAgICAgIG5leHRQdCA9IHtcbiAgICAgICAgICB4OiBwdC54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgeTogcHQueSArIGRpcmVjdGlvbi55XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmNhblByb2Nlc3MobmV4dFB0LngsIG5leHRQdC55KSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YWNrLnB1c2gobmV4dFB0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Qm91bmRzKCkge1xuICAgIHZhciBib3VuZGFyaWVzLCBjb2wsIHJlZiwgdmFsLCB4LCB5O1xuICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICB0b3A6IG51bGwsXG4gICAgICBsZWZ0OiBudWxsLFxuICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgcmlnaHQ6IG51bGxcbiAgICB9O1xuICAgIHJlZiA9IHRoaXMudmlzaWJpbGl0eTtcbiAgICBmb3IgKHggaW4gcmVmKSB7XG4gICAgICBjb2wgPSByZWZbeF07XG4gICAgICBmb3IgKHkgaW4gY29sKSB7XG4gICAgICAgIHZhbCA9IGNvbFt5XTtcbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB5IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgICBib3VuZGFyaWVzLnRvcCA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgeCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMubGVmdCA9IHg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB5ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgICAgYm91bmRhcmllcy5yaWdodCA9IHg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gIH1cblxuICB0b0NvbnRhaW5lcigpIHtcbiAgICB2YXIgY29sLCByZWYsIHJlcywgdGlsZSwgdmFsLCB4LCB5O1xuICAgIHJlcyA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgcmVzLm93bmVyID0gZmFsc2U7XG4gICAgcmVmID0gdGhpcy52aXNpYmlsaXR5O1xuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XTtcbiAgICAgIGZvciAoeSBpbiBjb2wpIHtcbiAgICAgICAgdmFsID0gY29sW3ldO1xuICAgICAgICB0aWxlID0gdGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgICBpZiAodmFsICE9PSAwICYmICh0aWxlICE9IG51bGwpKSB7XG4gICAgICAgICAgdGlsZSA9IG5ldyBUaWxlUmVmZXJlbmNlKHRpbGUpO1xuICAgICAgICAgIHRpbGUudmlzaWJpbGl0eSA9IHZhbDtcbiAgICAgICAgICByZXMuYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgdG9NYXAoKSB7XG4gICAgdmFyIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgcmVzLCB4LCB5O1xuICAgIHJlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbWFwOiBbXVxuICAgIH0sIHRoaXMuZ2V0Qm91bmRzKCkpO1xuICAgIGZvciAoeSA9IGkgPSByZWYgPSByZXMudG9wLCByZWYxID0gcmVzLmJvdHRvbSAtIDE7IChyZWYgPD0gcmVmMSA/IGkgPD0gcmVmMSA6IGkgPj0gcmVmMSk7IHkgPSByZWYgPD0gcmVmMSA/ICsraSA6IC0taSkge1xuICAgICAgcmVzLm1hcFt5IC0gcmVzLnRvcF0gPSBbXTtcbiAgICAgIGZvciAoeCA9IGogPSByZWYyID0gcmVzLmxlZnQsIHJlZjMgPSByZXMucmlnaHQgLSAxOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeCA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICByZXMubWFwW3kgLSByZXMudG9wXVt4IC0gcmVzLmxlZnRdID0gdGhpcy5nZXRWaXNpYmlsaXR5KHgsIHkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVmlzaW9uQ2FsY3VsYXRvci5qcy5tYXBcbiIsInZhciBBY3Rpb24sIEVsZW1lbnQsIEV2ZW50RW1pdHRlcjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFjdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHdpdGhBY3RvcihhY3Rvcikge1xuICAgICAgaWYgKHRoaXMuYWN0b3IgIT09IGFjdG9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHtcbiAgICAgICAgICBhY3RvcjogYWN0b3JcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5V2l0aChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGJhc2U6IHRoaXMuYmFzZU9yVGhpcygpXG4gICAgICB9LCB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCksIG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBiYXNlT3JUaGlzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYmFzZSB8fCB0aGlzO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZSgpO1xuICAgIH1cblxuICAgIHZhbGlkQWN0b3IoKSB7XG4gICAgICByZXR1cm4gdGhpcy5hY3RvciAhPSBudWxsO1xuICAgIH1cblxuICAgIGlzUmVhZHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWxpZEFjdG9yKCk7XG4gICAgfVxuXG4gICAgZmluaXNoKCkge1xuICAgICAgdGhpcy5lbWl0KCdmaW5pc2hlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5kKCk7XG4gICAgfVxuXG4gICAgaW50ZXJydXB0KCkge1xuICAgICAgdGhpcy5lbWl0KCdpbnRlcnJ1cHRlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5kKCk7XG4gICAgfVxuXG4gICAgZW5kKCkge1xuICAgICAgdGhpcy5lbWl0KCdlbmQnKTtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICB9O1xuXG4gIEFjdGlvbi5pbmNsdWRlKEV2ZW50RW1pdHRlci5wcm90b3R5cGUpO1xuXG4gIEFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICBhY3Rvcjoge30sXG4gICAgYmFzZToge31cbiAgfSk7XG5cbiAgcmV0dXJuIEFjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0FjdGlvbi5qcy5tYXBcbiIsInZhciBBY3Rpb25Qcm92aWRlciwgRWxlbWVudDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGlvblByb3ZpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBBY3Rpb25Qcm92aWRlciBleHRlbmRzIEVsZW1lbnQge307XG5cbiAgQWN0aW9uUHJvdmlkZXIucHJvcGVydGllcyh7XG4gICAgcHJvdmlkZWRBY3Rpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQWN0aW9uUHJvdmlkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9BY3Rpb25Qcm92aWRlci5qcy5tYXBcbiIsInZhciBBdHRhY2tBY3Rpb24sIEV2ZW50QmluZCwgUHJvcGVydHlXYXRjaGVyLCBUYXJnZXRBY3Rpb24sIFdhbGtBY3Rpb247XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKTtcblxuVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKTtcblxuRXZlbnRCaW5kID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50QmluZDtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkludmFsaWRhdGVkLlByb3BlcnR5V2F0Y2hlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2tBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEF0dGFja0FjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgdmFsaWRUYXJnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXRJc0F0dGFja2FibGUoKSAmJiAodGhpcy5jYW5Vc2VXZWFwb24oKSB8fCB0aGlzLmNhbldhbGtUb1RhcmdldCgpKTtcbiAgICB9XG5cbiAgICB0YXJnZXRJc0F0dGFja2FibGUoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuZGFtYWdlYWJsZSAmJiB0aGlzLnRhcmdldC5oZWFsdGggPj0gMDtcbiAgICB9XG5cbiAgICBjYW5NZWxlZSgpIHtcbiAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnRhcmdldC50aWxlLnggLSB0aGlzLmFjdG9yLnRpbGUueCkgKyBNYXRoLmFicyh0aGlzLnRhcmdldC50aWxlLnkgLSB0aGlzLmFjdG9yLnRpbGUueSkgPT09IDE7XG4gICAgfVxuXG4gICAgY2FuVXNlV2VhcG9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYmVzdFVzYWJsZVdlYXBvbiAhPSBudWxsO1xuICAgIH1cblxuICAgIGNhblVzZVdlYXBvbkF0KHRpbGUpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICByZXR1cm4gKChyZWYgPSB0aGlzLmFjdG9yLndlYXBvbnMpICE9IG51bGwgPyByZWYubGVuZ3RoIDogdm9pZCAwKSAmJiB0aGlzLmFjdG9yLndlYXBvbnMuZmluZCgod2VhcG9uKSA9PiB7XG4gICAgICAgIHJldHVybiB3ZWFwb24uY2FuVXNlRnJvbSh0aWxlLCB0aGlzLnRhcmdldCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYW5XYWxrVG9UYXJnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrQWN0aW9uLmlzUmVhZHkoKTtcbiAgICB9XG5cbiAgICB1c2VXZWFwb24oKSB7XG4gICAgICB0aGlzLmJlc3RVc2FibGVXZWFwb24udXNlT24odGhpcy50YXJnZXQpO1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKCk7XG4gICAgfVxuXG4gICAgZXhlY3V0ZSgpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yLndhbGsgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFjdG9yLndhbGsuaW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuYmVzdFVzYWJsZVdlYXBvbi5jaGFyZ2VkKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudXNlV2VhcG9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMud2VhcG9uQ2hhcmdlV2F0Y2hlci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIudW5iaW5kKCk7XG4gICAgICAgICAgdGhpcy53YWxrQWN0aW9uLmRlc3Ryb3koKTtcbiAgICAgICAgICB0aGlzLndhbGtBY3Rpb25Qcm9wZXJ0eS5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLndhbGtBY3Rpb24pO1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrQWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBBdHRhY2tBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgd2Fsa0FjdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHdhbGtBY3Rpb247XG4gICAgICAgIHdhbGtBY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXMuYWN0b3IsXG4gICAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XG4gICAgICAgIH0pO1xuICAgICAgICB3YWxrQWN0aW9uLnBhdGhGaW5kZXIuYXJyaXZlZENhbGxiYWNrID0gKHN0ZXApID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jYW5Vc2VXZWFwb25BdChzdGVwLnRpbGUpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gd2Fsa0FjdGlvbjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJlc3RVc2FibGVXZWFwb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHJlZiwgdXNhYmxlV2VhcG9ucztcbiAgICAgICAgaW52YWxpZGF0b3IucHJvcFBhdGgoJ2FjdG9yLnRpbGUnKTtcbiAgICAgICAgaWYgKChyZWYgPSB0aGlzLmFjdG9yLndlYXBvbnMpICE9IG51bGwgPyByZWYubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgICAgdXNhYmxlV2VhcG9ucyA9IHRoaXMuYWN0b3Iud2VhcG9ucy5maWx0ZXIoKHdlYXBvbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHdlYXBvbi5jYW5Vc2VPbih0aGlzLnRhcmdldCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdXNhYmxlV2VhcG9ucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYi5kcHMgLSBhLmRwcztcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdXNhYmxlV2VhcG9uc1swXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgaW50ZXJydXB0QmluZGVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IEV2ZW50QmluZCgnaW50ZXJydXB0ZWQnLCBudWxsLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IHRydWVcbiAgICB9LFxuICAgIHdlYXBvbkNoYXJnZVdhdGNoZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmVzdFVzYWJsZVdlYXBvbi5jaGFyZ2VkKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZVdlYXBvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuYmVzdFVzYWJsZVdlYXBvbi5nZXRQcm9wZXJ0eUluc3RhbmNlKCdjaGFyZ2VkJylcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEF0dGFja0FjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0F0dGFja0FjdGlvbi5qcy5tYXBcbiIsInZhciBBdHRhY2tBY3Rpb24sIEF0dGFja01vdmVBY3Rpb24sIEV2ZW50QmluZCwgTGluZU9mU2lnaHQsIFBhdGhGaW5kZXIsIFByb3BlcnR5V2F0Y2hlciwgVGFyZ2V0QWN0aW9uLCBXYWxrQWN0aW9uO1xuXG5XYWxrQWN0aW9uID0gcmVxdWlyZSgnLi9XYWxrQWN0aW9uJyk7XG5cbkF0dGFja0FjdGlvbiA9IHJlcXVpcmUoJy4vQXR0YWNrQWN0aW9uJyk7XG5cblRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJyk7XG5cblBhdGhGaW5kZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKTtcblxuTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuLi9MaW5lT2ZTaWdodCcpO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykud2F0Y2hlcnMuUHJvcGVydHlXYXRjaGVyO1xuXG5FdmVudEJpbmQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRCaW5kO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFja01vdmVBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEF0dGFja01vdmVBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICAgIGlzRW5lbXkoZWxlbSkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIHJldHVybiAocmVmID0gdGhpcy5hY3Rvci5vd25lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuaXNFbmVteSA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmlzRW5lbXkoZWxlbSkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gICAgfVxuXG4gICAgdmFsaWRUYXJnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrQWN0aW9uLnZhbGlkVGFyZ2V0KCk7XG4gICAgfVxuXG4gICAgdGVzdEVuZW15U3BvdHRlZCgpIHtcbiAgICAgIHRoaXMuZW5lbXlTcG90dGVkUHJvcGVydHkuaW52YWxpZGF0ZSgpO1xuICAgICAgaWYgKHRoaXMuZW5lbXlTcG90dGVkKSB7XG4gICAgICAgIHRoaXMuYXR0YWNrQWN0aW9uID0gbmV3IEF0dGFja0FjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXMuYWN0b3IsXG4gICAgICAgICAgdGFyZ2V0OiB0aGlzLmVuZW15U3BvdHRlZFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdHRhY2tBY3Rpb24ub24oJ2ZpbmlzaGVkJywgKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmludGVycnVwdEJpbmRlci5iaW5kVG8odGhpcy5hdHRhY2tBY3Rpb24pO1xuICAgICAgICB0aGlzLndhbGtBY3Rpb24uaW50ZXJydXB0KCk7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvblByb3BlcnR5LmludmFsaWRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNrQWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleGVjdXRlKCkge1xuICAgICAgaWYgKCF0aGlzLnRlc3RFbmVteVNwb3R0ZWQoKSkge1xuICAgICAgICB0aGlzLndhbGtBY3Rpb24ub24oJ2ZpbmlzaGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZpbmlzaGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmludGVycnVwdEJpbmRlci5iaW5kVG8odGhpcy53YWxrQWN0aW9uKTtcbiAgICAgICAgdGhpcy50aWxlV2F0Y2hlci5iaW5kKCk7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEF0dGFja01vdmVBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgd2Fsa0FjdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHdhbGtBY3Rpb247XG4gICAgICAgIHdhbGtBY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXMuYWN0b3IsXG4gICAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gd2Fsa0FjdGlvbjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuZW15U3BvdHRlZDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgdGhpcy5wYXRoID0gbmV3IFBhdGhGaW5kZXIodGhpcy5hY3Rvci50aWxlLmNvbnRhaW5lciwgdGhpcy5hY3Rvci50aWxlLCBmYWxzZSwge1xuICAgICAgICAgIHZhbGlkVGlsZTogKHRpbGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aWxlLnRyYW5zcGFyZW50ICYmIChuZXcgTGluZU9mU2lnaHQodGhpcy5hY3Rvci50aWxlLmNvbnRhaW5lciwgdGhpcy5hY3Rvci50aWxlLngsIHRoaXMuYWN0b3IudGlsZS55LCB0aWxlLngsIHRpbGUueSkpLmdldFN1Y2Nlc3MoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFycml2ZWQ6IChzdGVwKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcC5lbmVteSA9IHN0ZXAudGlsZS5jaGlsZHJlbi5maW5kKChjKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzRW5lbXkoYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVmZmljaWVuY3k6ICh0aWxlKSA9PiB7fVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpO1xuICAgICAgICByZXR1cm4gKHJlZiA9IHRoaXMucGF0aC5zb2x1dGlvbikgIT0gbnVsbCA/IHJlZi5lbmVteSA6IHZvaWQgMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbGVXYXRjaGVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRlc3RFbmVteVNwb3R0ZWQoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByb3BlcnR5OiB0aGlzLmFjdG9yLnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KCd0aWxlJylcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogdHJ1ZVxuICAgIH0sXG4gICAgaW50ZXJydXB0QmluZGVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IEV2ZW50QmluZCgnaW50ZXJydXB0ZWQnLCBudWxsLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBdHRhY2tNb3ZlQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbi5qcy5tYXBcbiIsInZhciBBY3Rpb25Qcm92aWRlciwgU2ltcGxlQWN0aW9uUHJvdmlkZXI7XG5cbkFjdGlvblByb3ZpZGVyID0gcmVxdWlyZSgnLi9BY3Rpb25Qcm92aWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZUFjdGlvblByb3ZpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTaW1wbGVBY3Rpb25Qcm92aWRlciBleHRlbmRzIEFjdGlvblByb3ZpZGVyIHt9O1xuXG4gIFNpbXBsZUFjdGlvblByb3ZpZGVyLnByb3BlcnRpZXMoe1xuICAgIHByb3ZpZGVkQWN0aW9uczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFjdGlvbnM7XG4gICAgICAgIGFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwgdGhpcy5jb25zdHJ1Y3Rvci5hY3Rpb25zIHx8IFtdO1xuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbnMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBhY3Rpb25zID0gT2JqZWN0LmtleXMoYWN0aW9ucykubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbnNba2V5XTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWN0aW9ucy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgYWN0aW9uLndpdGhUYXJnZXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbi53aXRoVGFyZ2V0KHRoaXMpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGFjdGlvbih7XG4gICAgICAgICAgICAgIHRhcmdldDogdGhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb247XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaW1wbGVBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1NpbXBsZUFjdGlvblByb3ZpZGVyLmpzLm1hcFxuIiwidmFyIEFjdGlvbiwgVGFyZ2V0QWN0aW9uO1xuXG5BY3Rpb24gPSByZXF1aXJlKCcuL0FjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhcmdldEFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGFyZ2V0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICB3aXRoVGFyZ2V0KHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0ICE9PSB0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weVdpdGgoe1xuICAgICAgICAgIHRhcmdldDogdGFyZ2V0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FuVGFyZ2V0KHRhcmdldCkge1xuICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgaW5zdGFuY2UgPSB0aGlzLndpdGhUYXJnZXQodGFyZ2V0KTtcbiAgICAgIGlmIChpbnN0YW5jZS52YWxpZFRhcmdldCgpKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldCAhPSBudWxsO1xuICAgIH1cblxuICAgIGlzUmVhZHkoKSB7XG4gICAgICByZXR1cm4gc3VwZXIuaXNSZWFkeSgpICYmIHRoaXMudmFsaWRUYXJnZXQoKTtcbiAgICB9XG5cbiAgfTtcblxuICBUYXJnZXRBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgdGFyZ2V0OiB7fVxuICB9KTtcblxuICByZXR1cm4gVGFyZ2V0QWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvVGFyZ2V0QWN0aW9uLmpzLm1hcFxuIiwidmFyIEFjdGlvblByb3ZpZGVyLCBNaXhhYmxlLCBUaWxlZEFjdGlvblByb3ZpZGVyO1xuXG5BY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vQWN0aW9uUHJvdmlkZXInKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5NaXhhYmxlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVkQWN0aW9uUHJvdmlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVkQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBY3Rpb25Qcm92aWRlciB7XG4gICAgdmFsaWRBY3Rpb25UaWxlKHRpbGUpIHtcbiAgICAgIHJldHVybiB0aWxlICE9IG51bGw7XG4gICAgfVxuXG4gICAgcHJlcGFyZUFjdGlvblRpbGUodGlsZSkge1xuICAgICAgaWYgKCF0aWxlLmdldFByb3BlcnR5SW5zdGFuY2UoJ3Byb3ZpZGVkQWN0aW9ucycpKSB7XG4gICAgICAgIHJldHVybiBNaXhhYmxlLkV4dGVuc2lvbi5tYWtlKEFjdGlvblByb3ZpZGVyLnByb3RvdHlwZSwgdGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZWRBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKHZhbCwgb2xkLCBvdmVycmlkZWQpIHtcbiAgICAgICAgb3ZlcnJpZGVkKG9sZCk7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRlZEFjdGlvbnM7XG4gICAgICB9XG4gICAgfSxcbiAgICBhY3Rpb25UaWxlczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIG15VGlsZTtcbiAgICAgICAgbXlUaWxlID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnRpbGVQcm9wZXJ0eSk7XG4gICAgICAgIGlmIChteVRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25UaWxlc0Nvb3JkLm1hcCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBteVRpbGUuZ2V0UmVsYXRpdmVUaWxlKGNvb3JkLngsIGNvb3JkLnkpO1xuICAgICAgICAgIH0pLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3Rpb25UaWxlKHRpbGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZm9yd2FyZGVkQWN0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjoge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEuYWN0aW9uID09PSBiLmFjdGlvbiAmJiBhLmxvY2F0aW9uID09PSBiLmxvY2F0aW9uO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgYWN0aW9uVGlsZXMsIGFjdGlvbnM7XG4gICAgICAgIGFjdGlvblRpbGVzID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLmFjdGlvblRpbGVzUHJvcGVydHkpO1xuICAgICAgICBhY3Rpb25zID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnByb3ZpZGVkQWN0aW9uc1Byb3BlcnR5KTtcbiAgICAgICAgcmV0dXJuIGFjdGlvblRpbGVzLnJlZHVjZSgocmVzLCB0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoYWN0aW9ucy5tYXAoZnVuY3Rpb24oYWN0KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBhY3Rpb246IGFjdCxcbiAgICAgICAgICAgICAgbG9jYXRpb246IHRpbGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9LCBbXSk7XG4gICAgICB9LFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihmb3J3YXJkZWQpIHtcbiAgICAgICAgdGhpcy5wcmVwYXJlQWN0aW9uVGlsZShmb3J3YXJkZWQubG9jYXRpb24pO1xuICAgICAgICByZXR1cm4gZm9yd2FyZGVkLmxvY2F0aW9uLnByb3ZpZGVkQWN0aW9ucy5hZGQoZm9yd2FyZGVkLmFjdGlvbik7XG4gICAgICB9LFxuICAgICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uKGZvcndhcmRlZCkge1xuICAgICAgICByZXR1cm4gZm9yd2FyZGVkLmxvY2F0aW9uLnByb3ZpZGVkQWN0aW9ucy5yZW1vdmUoZm9yd2FyZGVkLmFjdGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBUaWxlZEFjdGlvblByb3ZpZGVyLnByb3RvdHlwZS5hY3Rpb25UaWxlc0Nvb3JkID0gW1xuICAgIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAtMVxuICAgIH0sXG4gICAge1xuICAgICAgeDogLTEsXG4gICAgICB5OiAwXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMFxuICAgIH0sXG4gICAge1xuICAgICAgeDogKzEsXG4gICAgICB5OiAwXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiAwLFxuICAgICAgeTogKzFcbiAgICB9XG4gIF07XG5cbiAgcmV0dXJuIFRpbGVkQWN0aW9uUHJvdmlkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9UaWxlZEFjdGlvblByb3ZpZGVyLmpzLm1hcFxuIiwidmFyIFRhcmdldEFjdGlvbiwgVHJhdmVsLCBUcmF2ZWxBY3Rpb247XG5cblRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJyk7XG5cblRyYXZlbCA9IHJlcXVpcmUoJy4uL1RyYXZlbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYXZlbEFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVHJhdmVsQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYXZlbC52YWxpZDtcbiAgICB9XG5cbiAgICBleGVjdXRlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhdmVsLnN0YXJ0KCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVHJhdmVsQWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIHRyYXZlbDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUcmF2ZWwoe1xuICAgICAgICAgIHRyYXZlbGxlcjogdGhpcy5hY3RvcixcbiAgICAgICAgICBzdGFydExvY2F0aW9uOiB0aGlzLmFjdG9yLmxvY2F0aW9uLFxuICAgICAgICAgIHRhcmdldExvY2F0aW9uOiB0aGlzLnRhcmdldFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUcmF2ZWxBY3Rpb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9UcmF2ZWxBY3Rpb24uanMubWFwXG4iLCJ2YXIgUGF0aEZpbmRlciwgUGF0aFdhbGssIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpO1xuXG5QYXRoV2FsayA9IHJlcXVpcmUoJy4uL1BhdGhXYWxrJyk7XG5cblRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa0FjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2Fsa0FjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgZXhlY3V0ZSgpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yLndhbGsgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFjdG9yLndhbGsuaW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLndhbGsgPSB0aGlzLmFjdG9yLndhbGsgPSBuZXcgUGF0aFdhbGsodGhpcy5hY3RvciwgdGhpcy5wYXRoRmluZGVyKTtcbiAgICAgIHRoaXMuYWN0b3Iud2Fsay5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmFjdG9yLndhbGsub24oJ2ludGVycnVwdGVkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuYWN0b3Iud2Fsay5zdGFydCgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgICBpZiAodGhpcy53YWxrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGsuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbGlkVGFyZ2V0KCkge1xuICAgICAgdGhpcy5wYXRoRmluZGVyLmNhbGN1bCgpO1xuICAgICAgcmV0dXJuIHRoaXMucGF0aEZpbmRlci5zb2x1dGlvbiAhPSBudWxsO1xuICAgIH1cblxuICB9O1xuXG4gIFdhbGtBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgcGF0aEZpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoRmluZGVyKHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZSwgdGhpcy50YXJnZXQsIHtcbiAgICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuYWN0b3IuY2FuR29PblRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rvci5jYW5Hb09uVGlsZSh0aWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aWxlLndhbGthYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV2Fsa0FjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1dhbGtBY3Rpb24uanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJBaXJsb2NrXCI6IHJlcXVpcmUoXCIuL0FpcmxvY2tcIiksXG4gIFwiQXBwcm9hY2hcIjogcmVxdWlyZShcIi4vQXBwcm9hY2hcIiksXG4gIFwiQXV0b21hdGljRG9vclwiOiByZXF1aXJlKFwiLi9BdXRvbWF0aWNEb29yXCIpLFxuICBcIkNoYXJhY3RlclwiOiByZXF1aXJlKFwiLi9DaGFyYWN0ZXJcIiksXG4gIFwiQ2hhcmFjdGVyQUlcIjogcmVxdWlyZShcIi4vQ2hhcmFjdGVyQUlcIiksXG4gIFwiQ29uZnJvbnRhdGlvblwiOiByZXF1aXJlKFwiLi9Db25mcm9udGF0aW9uXCIpLFxuICBcIkRhbWFnZVByb3BhZ2F0aW9uXCI6IHJlcXVpcmUoXCIuL0RhbWFnZVByb3BhZ2F0aW9uXCIpLFxuICBcIkRhbWFnZWFibGVcIjogcmVxdWlyZShcIi4vRGFtYWdlYWJsZVwiKSxcbiAgXCJEb29yXCI6IHJlcXVpcmUoXCIuL0Rvb3JcIiksXG4gIFwiRWxlbWVudFwiOiByZXF1aXJlKFwiLi9FbGVtZW50XCIpLFxuICBcIkVuY29udGVyTWFuYWdlclwiOiByZXF1aXJlKFwiLi9FbmNvbnRlck1hbmFnZXJcIiksXG4gIFwiRmxvb3JcIjogcmVxdWlyZShcIi4vRmxvb3JcIiksXG4gIFwiR2FtZVwiOiByZXF1aXJlKFwiLi9HYW1lXCIpLFxuICBcIkludmVudG9yeVwiOiByZXF1aXJlKFwiLi9JbnZlbnRvcnlcIiksXG4gIFwiTGluZU9mU2lnaHRcIjogcmVxdWlyZShcIi4vTGluZU9mU2lnaHRcIiksXG4gIFwiTWFwXCI6IHJlcXVpcmUoXCIuL01hcFwiKSxcbiAgXCJPYnN0YWNsZVwiOiByZXF1aXJlKFwiLi9PYnN0YWNsZVwiKSxcbiAgXCJQYXRoV2Fsa1wiOiByZXF1aXJlKFwiLi9QYXRoV2Fsa1wiKSxcbiAgXCJQZXJzb25hbFdlYXBvblwiOiByZXF1aXJlKFwiLi9QZXJzb25hbFdlYXBvblwiKSxcbiAgXCJQbGF5ZXJcIjogcmVxdWlyZShcIi4vUGxheWVyXCIpLFxuICBcIlByb2plY3RpbGVcIjogcmVxdWlyZShcIi4vUHJvamVjdGlsZVwiKSxcbiAgXCJSZXNzb3VyY2VcIjogcmVxdWlyZShcIi4vUmVzc291cmNlXCIpLFxuICBcIlJlc3NvdXJjZVR5cGVcIjogcmVxdWlyZShcIi4vUmVzc291cmNlVHlwZVwiKSxcbiAgXCJSb29tR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1Jvb21HZW5lcmF0b3JcIiksXG4gIFwiU2hpcFwiOiByZXF1aXJlKFwiLi9TaGlwXCIpLFxuICBcIlNoaXBXZWFwb25cIjogcmVxdWlyZShcIi4vU2hpcFdlYXBvblwiKSxcbiAgXCJTdGFyTWFwR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1N0YXJNYXBHZW5lcmF0b3JcIiksXG4gIFwiU3RhclN5c3RlbVwiOiByZXF1aXJlKFwiLi9TdGFyU3lzdGVtXCIpLFxuICBcIlRyYXZlbFwiOiByZXF1aXJlKFwiLi9UcmF2ZWxcIiksXG4gIFwiVmlld1wiOiByZXF1aXJlKFwiLi9WaWV3XCIpLFxuICBcIlZpc2lvbkNhbGN1bGF0b3JcIjogcmVxdWlyZShcIi4vVmlzaW9uQ2FsY3VsYXRvclwiKSxcbiAgXCJhY3Rpb25zXCI6IHtcbiAgICBcIkFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0FjdGlvblwiKSxcbiAgICBcIkFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJBdHRhY2tBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BdHRhY2tBY3Rpb25cIiksXG4gICAgXCJBdHRhY2tNb3ZlQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvblwiKSxcbiAgICBcIlNpbXBsZUFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJUYXJnZXRBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UYXJnZXRBY3Rpb25cIiksXG4gICAgXCJUaWxlZEFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIlRyYXZlbEFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL1RyYXZlbEFjdGlvblwiKSxcbiAgICBcIldhbGtBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9XYWxrQWN0aW9uXCIpLFxuICB9LFxufSIsInZhciBsaWJzO1xuXG5saWJzID0gcmVxdWlyZSgnLi9saWJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgbGlicywge1xuICBncmlkczogcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLFxuICBQYXRoRmluZGVyOiByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKSxcbiAgc3RyaW5nczogcmVxdWlyZSgncGFyYWxsZWxpby1zdHJpbmdzJyksXG4gIHRpbGVzOiByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJyksXG4gIFRpbWluZzogcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKSxcbiAgd2lyaW5nOiByZXF1aXJlKCdwYXJhbGxlbGlvLXdpcmluZycpLFxuICBTcGFyazogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9wYXJhbGxlbGlvLmpzLm1hcFxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IG9iamVjdENyZWF0ZVBvbHlmaWxsXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IG9iamVjdEtleXNQb2x5ZmlsbFxudmFyIGJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBmdW5jdGlvbkJpbmRQb2x5ZmlsbFxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19ldmVudHMnKSkge1xuICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG52YXIgaGFzRGVmaW5lUHJvcGVydHk7XG50cnkge1xuICB2YXIgbyA9IHt9O1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ3gnLCB7IHZhbHVlOiAwIH0pO1xuICBoYXNEZWZpbmVQcm9wZXJ0eSA9IG8ueCA9PT0gMDtcbn0gY2F0Y2ggKGVycikgeyBoYXNEZWZpbmVQcm9wZXJ0eSA9IGZhbHNlIH1cbmlmIChoYXNEZWZpbmVQcm9wZXJ0eSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBpcyBhIHBvc2l0aXZlIG51bWJlciAod2hvc2UgdmFsdWUgaXMgemVybyBvclxuICAgICAgLy8gZ3JlYXRlciBhbmQgbm90IGEgTmFOKS5cbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IGFyZyAhPT0gYXJnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICAgIH1cbiAgfSk7XG59IGVsc2Uge1xuICBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJuXCIgYXJndW1lbnQgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uICRnZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuICRnZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG4vLyBUaGVzZSBzdGFuZGFsb25lIGVtaXQqIGZ1bmN0aW9ucyBhcmUgdXNlZCB0byBvcHRpbWl6ZSBjYWxsaW5nIG9mIGV2ZW50XG4vLyBoYW5kbGVycyBmb3IgZmFzdCBjYXNlcyBiZWNhdXNlIGVtaXQoKSBpdHNlbGYgb2Z0ZW4gaGFzIGEgdmFyaWFibGUgbnVtYmVyIG9mXG4vLyBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBiZWNhdXNlIG9mIHRoYXQuIFRoZXNlIGZ1bmN0aW9ucyBhbHdheXMgaGF2ZVxuLy8gdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgdGh1cyBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLCBzbyB0aGUgY29kZVxuLy8gaW5zaWRlIHRoZW0gY2FuIGV4ZWN1dGUgZmFzdGVyLlxuZnVuY3Rpb24gZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgc2VsZikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZ3MpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGV2ZW50cztcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT0gbnVsbCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKVxuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKCFoYW5kbGVyKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgaXNGbiA9IHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nO1xuICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgIGNhc2UgMTpcbiAgICAgIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG4gICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgIGRlZmF1bHQ6XG4gICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoIWV2ZW50cykge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKCFleGlzdGluZykge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICBpZiAocHJlcGVuZCkge1xuICAgICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIG0gPSAkZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgICBpZiAobSAmJiBtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtKSB7XG4gICAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyBcIicgKyBTdHJpbmcodHlwZSkgKyAnXCIgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdC4nKTtcbiAgICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyVzOiAlcycsIHcubmFtZSwgdy5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdKTtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1syXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBiaW5kLmNhbGwob25jZVdyYXBwZXIsIHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAoIWxpc3QpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmICghZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqZWN0S2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmICghZXZlbnRzKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKCFldmxpc3RlbmVyKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgPyB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3Qub3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG4vLyBBYm91dCAxLjV4IGZhc3RlciB0aGFuIHRoZSB0d28tYXJnIHZlcnNpb24gb2YgQXJyYXkjc3BsaWNlKCkuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICh2YXIgaSA9IGluZGV4LCBrID0gaSArIDEsIG4gPSBsaXN0Lmxlbmd0aDsgayA8IG47IGkgKz0gMSwgayArPSAxKVxuICAgIGxpc3RbaV0gPSBsaXN0W2tdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENyZWF0ZVBvbHlmaWxsKHByb3RvKSB7XG4gIHZhciBGID0gZnVuY3Rpb24oKSB7fTtcbiAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgcmV0dXJuIG5ldyBGO1xufVxuZnVuY3Rpb24gb2JqZWN0S2V5c1BvbHlmaWxsKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrIGluIG9iaikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGspKSB7XG4gICAga2V5cy5wdXNoKGspO1xuICB9XG4gIHJldHVybiBrO1xufVxuZnVuY3Rpb24gZnVuY3Rpb25CaW5kUG9seWZpbGwoY29udGV4dCkge1xuICB2YXIgZm4gPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBuZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MvYnJvd3Nlci5qcycpLm5leHRUaWNrO1xudmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGltbWVkaWF0ZUlkcyA9IHt9O1xudmFyIG5leHRJbW1lZGlhdGVJZCA9IDA7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7IHRpbWVvdXQuY2xvc2UoKTsgfTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBUaGF0J3Mgbm90IGhvdyBub2RlLmpzIGltcGxlbWVudHMgaXQgYnV0IHRoZSBleHBvc2VkIGFwaSBpcyB0aGUgc2FtZS5cbmV4cG9ydHMuc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogZnVuY3Rpb24oZm4pIHtcbiAgdmFyIGlkID0gbmV4dEltbWVkaWF0ZUlkKys7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBmYWxzZSA6IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBpbW1lZGlhdGVJZHNbaWRdID0gdHJ1ZTtcblxuICBuZXh0VGljayhmdW5jdGlvbiBvbk5leHRUaWNrKCkge1xuICAgIGlmIChpbW1lZGlhdGVJZHNbaWRdKSB7XG4gICAgICAvLyBmbi5jYWxsKCkgaXMgZmFzdGVyIHNvIHdlIG9wdGltaXplIGZvciB0aGUgY29tbW9uIHVzZS1jYXNlXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2NhbGwtYXBwbHktc2VndVxuICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5jYWxsKG51bGwpO1xuICAgICAgfVxuICAgICAgLy8gUHJldmVudCBpZHMgZnJvbSBsZWFraW5nXG4gICAgICBleHBvcnRzLmNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSB0eXBlb2YgY2xlYXJJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IGNsZWFySW1tZWRpYXRlIDogZnVuY3Rpb24oaWQpIHtcbiAgZGVsZXRlIGltbWVkaWF0ZUlkc1tpZF07XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBCaW5kZXI6IHJlcXVpcmUoJy4vc3JjL0JpbmRlcicpLFxuICBFdmVudEJpbmQ6IHJlcXVpcmUoJy4vc3JjL0V2ZW50QmluZCcpLFxuICBSZWZlcmVuY2U6IHJlcXVpcmUoJy4vc3JjL1JlZmVyZW5jZScpXG59XG4iLCJjbGFzcyBCaW5kZXIge1xuICB0b2dnbGVCaW5kICh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudW5iaW5kKClcbiAgICB9XG4gIH1cblxuICBiaW5kICgpIHtcbiAgICBpZiAoIXRoaXMuYmluZGVkICYmIHRoaXMuY2FuQmluZCgpKSB7XG4gICAgICB0aGlzLmRvQmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpXG4gIH1cblxuICB1bmJpbmQgKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaW5kZXJcbiIsIlxuY29uc3QgQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKVxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnLi9SZWZlcmVuY2UnKVxuXG5jbGFzcyBFdmVudEJpbmQgZXh0ZW5kcyBCaW5kZXIge1xuICBjb25zdHJ1Y3RvciAoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnQxXG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQxXG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0ICE9IG51bGwpXG4gIH1cblxuICBiaW5kVG8gKHRhcmdldCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgIHJldHVybiB0aGlzLmJpbmQoKVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byBhZGQgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpXG4gICAgfVxuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKVxuICAgIH1cbiAgfVxuXG4gIGVxdWFscyAoZXZlbnRCaW5kKSB7XG4gICAgcmV0dXJuIGV2ZW50QmluZCAhPSBudWxsICYmXG4gICAgICBldmVudEJpbmQuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiZcbiAgICAgIGV2ZW50QmluZC5ldmVudCA9PT0gdGhpcy5ldmVudCAmJlxuICAgICAgUmVmZXJlbmNlLmNvbXBhcmVWYWwoZXZlbnRCaW5kLnRhcmdldCwgdGhpcy50YXJnZXQpICYmXG4gICAgICBSZWZlcmVuY2UuY29tcGFyZVZhbChldmVudEJpbmQuY2FsbGJhY2ssIHRoaXMuY2FsbGJhY2spXG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyIChlbWl0dGVyLCBmYXRhbCA9IHRydWUpIHtcbiAgICBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50QmluZFxuIiwiY2xhc3MgUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IgKGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gIH1cblxuICBlcXVhbHMgKHJlZikge1xuICAgIHJldHVybiByZWYgIT0gbnVsbCAmJiByZWYuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlRGF0YShyZWYuZGF0YSlcbiAgfVxuXG4gIGNvbXBhcmVEYXRhIChkYXRhKSB7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhkYXRhKVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09PSBkYXRhKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09IG51bGwgfHwgZGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkubGVuZ3RoID09PSBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggJiYgT2JqZWN0LmtleXMoZGF0YSkuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgICByZXR1cm4gUmVmZXJlbmNlLmNvbXBhcmVWYWwodGhpcy5kYXRhW2tleV0sIGRhdGFba2V5XSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBSZWZlcmVuY2UuY29tcGFyZVZhbCh0aGlzLmRhdGEsIGRhdGEpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSB2YWwxXG4gICAqIEBwYXJhbSB7Kn0gdmFsMlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIGNvbXBhcmVWYWwgKHZhbDEsIHZhbDIpIHtcbiAgICBpZiAodmFsMSA9PT0gdmFsMikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKHZhbDEgPT0gbnVsbCB8fCB2YWwyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbDEuZXF1YWxzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdmFsMS5lcXVhbHModmFsMilcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWwyLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbDIuZXF1YWxzKHZhbDEpXG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbDEpICYmIEFycmF5LmlzQXJyYXkodmFsMikpIHtcbiAgICAgIHJldHVybiB2YWwxLmxlbmd0aCA9PT0gdmFsMi5sZW5ndGggJiYgdmFsMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsLCB2YWwyW2ldKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gaWYgKHR5cGVvZiB2YWwxID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsMiA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwxKS5sZW5ndGggPT09IE9iamVjdC5rZXlzKHZhbDIpLmxlbmd0aCAmJiBPYmplY3Qua2V5cyh2YWwxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsMVtrZXldLCB2YWwyW2tleV0pXG4gICAgLy8gICB9KVxuICAgIC8vIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRpYyBtYWtlUmVmZXJyZWQgKG9iaiwgZGF0YSkge1xuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICBvYmoucmVmID0gZGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICBvYmoucmVmID0gbmV3IFJlZmVyZW5jZShkYXRhKVxuICAgIH1cbiAgICBvYmouZXF1YWxzID0gZnVuY3Rpb24gKG9iajIpIHtcbiAgICAgIHJldHVybiBvYmoyICE9IG51bGwgJiYgdGhpcy5yZWYuZXF1YWxzKG9iajIucmVmKVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVmZXJlbmNlXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL0NvbGxlY3Rpb24nKVxuIiwiLyoqXG4gKiBAdGVtcGxhdGUgVFxuICovXG5jbGFzcyBDb2xsZWN0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoYXJyKSB7XG4gICAgaWYgKGFyciAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXJyYXkgPSBbXVxuICAgIH1cbiAgfVxuXG4gIGNoYW5nZWQgKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IG9sZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9yZGVyZWRcbiAgICogQHBhcmFtIHtmdW5jdGlvbihULFQpOiBib29sZWFufSBjb21wYXJlRnVuY3Rpb25cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGNoZWNrQ2hhbmdlcyAob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgY29tcGFyZUZ1bmN0aW9uID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGJcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZCA9IFtdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50KCkgIT09IG9sZC5sZW5ndGggfHwgKG9yZGVyZWQgPyB0aGlzLnNvbWUoZnVuY3Rpb24gKHZhbCwgaSkge1xuICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKVxuICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbiAoYikge1xuICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGEsIGIpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBnZXQgKGkpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgZ2V0UmFuZG9tICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaVxuICAgKiBAcGFyYW0ge1R9IHZhbFxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgc2V0IChpLCB2YWwpIHtcbiAgICB2YXIgb2xkXG4gICAgaWYgKHRoaXMuX2FycmF5W2ldICE9PSB2YWwpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbFxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VH0gdmFsXG4gICAqL1xuICBhZGQgKHZhbCkge1xuICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHVzaCh2YWwpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtUfSB2YWxcbiAgICovXG4gIHJlbW92ZSAodmFsKSB7XG4gICAgdmFyIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oVCk6IGJvb2xlYW59IGZuXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwbHVjayAoZm4pIHtcbiAgICB2YXIgZm91bmQsIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmZpbmRJbmRleChmbilcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgICAgcmV0dXJuIGZvdW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIHRvQXJyYXkgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgY291bnQgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5sZW5ndGhcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgSXRlbVR5cGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHRvQXBwZW5kXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48SXRlbVR5cGU+fEFycmF5LjxJdGVtVHlwZT58SXRlbVR5cGV9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPEl0ZW1UeXBlPn1cbiAgICovXG4gIHN0YXRpYyBuZXdTdWJDbGFzcyAodG9BcHBlbmQsIGFycikge1xuICAgIHZhciBTdWJDbGFzc1xuICAgIGlmICh0eXBlb2YgdG9BcHBlbmQgPT09ICdvYmplY3QnKSB7XG4gICAgICBTdWJDbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpcyB7fVxuICAgICAgT2JqZWN0LmFzc2lnbihTdWJDbGFzcy5wcm90b3R5cGUsIHRvQXBwZW5kKVxuICAgICAgcmV0dXJuIG5ldyBTdWJDbGFzcyhhcnIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyhhcnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPFQ+fVxuICAgKi9cbiAgY29weSAoYXJyKSB7XG4gICAgdmFyIGNvbGxcbiAgICBpZiAoYXJyID09IG51bGwpIHtcbiAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpXG4gICAgfVxuICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpXG4gICAgcmV0dXJuIGNvbGxcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IGFyclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZXF1YWxzIChhcnIpIHtcbiAgICByZXR1cm4gKHRoaXMuY291bnQoKSA9PT0gKHR5cGVvZiBhcnIuY291bnQgPT09ICdmdW5jdGlvbicgPyBhcnIuY291bnQoKSA6IGFyci5sZW5ndGgpKSAmJiB0aGlzLmV2ZXJ5KGZ1bmN0aW9uICh2YWwsIGkpIHtcbiAgICAgIHJldHVybiBhcnJbaV0gPT09IHZhbFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICBnZXRBZGRlZEZyb20gKGFycikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiAhYXJyLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPFQ+fEFycmF5LjxUPn0gYXJyXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIGdldFJlbW92ZWRGcm9tIChhcnIpIHtcbiAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuICF0aGlzLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxufTtcblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXVxuXG5Db2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zID0gWydjb25jYXQnLCAnZmlsdGVyJywgJ3NsaWNlJ11cblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J11cblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGZ1bmN0KSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uICguLi5hcmcpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZylcbiAgfVxufSlcblxuQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKSlcbiAgfVxufSlcblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgdmFyIG9sZCwgcmVzXG4gICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKVxuICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgcmV0dXJuIHJlc1xuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmNvdW50KClcbiAgfVxufSlcblxuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbU3ltYm9sLml0ZXJhdG9yXSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgSW52YWxpZGF0b3I6IHJlcXVpcmUoJy4vc3JjL0ludmFsaWRhdG9yJyksXG4gIFByb3BlcnRpZXNNYW5hZ2VyOiByZXF1aXJlKCcuL3NyYy9Qcm9wZXJ0aWVzTWFuYWdlcicpLFxuICBQcm9wZXJ0eTogcmVxdWlyZSgnLi9zcmMvUHJvcGVydHknKSxcbiAgZ2V0dGVyczoge1xuICAgIEJhc2VHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQmFzZUdldHRlcicpLFxuICAgIENhbGN1bGF0ZWRHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQ2FsY3VsYXRlZEdldHRlcicpLFxuICAgIENvbXBvc2l0ZUdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXInKSxcbiAgICBJbnZhbGlkYXRlZEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9JbnZhbGlkYXRlZEdldHRlcicpLFxuICAgIE1hbnVhbEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9NYW51YWxHZXR0ZXInKSxcbiAgICBTaW1wbGVHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvU2ltcGxlR2V0dGVyJylcbiAgfSxcbiAgd2F0Y2hlcnM6IHtcbiAgICBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyOiByZXF1aXJlKCcuL3NyYy93YXRjaGVycy9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyJyksXG4gICAgUHJvcGVydHlXYXRjaGVyOiByZXF1aXJlKCcuL3NyYy93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXInKVxuICB9LFxuICBzZXR0ZXJzOiB7XG4gICAgQmFzZVNldHRlcjogcmVxdWlyZSgnLi9zcmMvc2V0dGVycy9CYXNlU2V0dGVyJyksXG4gICAgQmFzZVZhbHVlU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL0Jhc2VWYWx1ZVNldHRlcicpLFxuICAgIENvbGxlY3Rpb25TZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvQ29sbGVjdGlvblNldHRlcicpLFxuICAgIE1hbnVhbFNldHRlcjogcmVxdWlyZSgnLi9zcmMvc2V0dGVycy9NYW51YWxTZXR0ZXInKSxcbiAgICBTaW1wbGVTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvU2ltcGxlU2V0dGVyJylcbiAgfVxufVxuIiwiY29uc3QgQmluZGVyID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkJpbmRlclxuY29uc3QgRXZlbnRCaW5kID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkV2ZW50QmluZFxuXG5jb25zdCBwbHVjayA9IGZ1bmN0aW9uIChhcnIsIGZuKSB7XG4gIHZhciBmb3VuZCwgaW5kZXhcbiAgaW5kZXggPSBhcnIuZmluZEluZGV4KGZuKVxuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XVxuICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpXG4gICAgcmV0dXJuIGZvdW5kXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkYXRvciBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yIChpbnZhbGlkYXRlZCwgc2NvcGUgPSBudWxsKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlZFxuICAgIHRoaXMuc2NvcGUgPSBzY29wZVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW11cbiAgICB0aGlzLnJlY3ljbGVkID0gW11cbiAgICB0aGlzLnVua25vd25zID0gW11cbiAgICB0aGlzLnN0cmljdCA9IHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0XG4gICAgdGhpcy5pbnZhbGlkID0gZmFsc2VcbiAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrLm93bmVyID0gdGhpc1xuICB9XG5cbiAgaW52YWxpZGF0ZSAoKSB7XG4gICAgdmFyIGZ1bmN0TmFtZVxuICAgIHRoaXMuaW52YWxpZCA9IHRydWVcbiAgICBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQoKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2soKVxuICAgIH0gZWxzZSBpZiAoKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQuaW52YWxpZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZC5pbnZhbGlkYXRlKClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludmFsaWRhdGVkID09PSAnc3RyaW5nJykge1xuICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5pbnZhbGlkYXRlZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuaW52YWxpZGF0ZWQuc2xpY2UoMSlcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zY29wZVtmdW5jdE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc2NvcGVbZnVuY3ROYW1lXSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNjb3BlW3RoaXMuaW52YWxpZGF0ZWRdID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdW5rbm93biAoKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCAmJiB0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZC51bmtub3duID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlZC51bmtub3duKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgYWRkRXZlbnRCaW5kIChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmFkZEJpbmRlcihuZXcgRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSlcbiAgfVxuXG4gIGFkZEJpbmRlciAoYmluZGVyKSB7XG4gICAgaWYgKGJpbmRlci5jYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBiaW5kZXIuY2FsbGJhY2sgPSB0aGlzLmludmFsaWRhdGVDYWxsYmFja1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnNvbWUoZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKVxuICAgIH0pKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChwbHVjayh0aGlzLnJlY3ljbGVkLCBmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcilcbiAgICAgIH0pIHx8IGJpbmRlcilcbiAgICB9XG4gIH1cblxuICBnZXRVbmtub3duQ2FsbGJhY2sgKHByb3ApIHtcbiAgICB2YXIgY2FsbGJhY2tcbiAgICBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcHJvcC5nZXQoKVxuICAgICAgfSwgcHJvcClcbiAgICB9XG4gICAgY2FsbGJhY2sucHJvcCA9IHByb3BcbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfVxuXG4gIGFkZFVua25vd24gKGZuLCBwcm9wKSB7XG4gICAgaWYgKCF0aGlzLmZpbmRVbmtub3duKHByb3ApKSB7XG4gICAgICBmbi5wcm9wID0gcHJvcFxuICAgICAgdGhpcy51bmtub3ducy5wdXNoKGZuKVxuICAgICAgcmV0dXJuIHRoaXMudW5rbm93bigpXG4gICAgfVxuICB9XG5cbiAgZmluZFVua25vd24gKHByb3ApIHtcbiAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy51bmtub3ducy5maW5kKGZ1bmN0aW9uICh1bmtub3duKSB7XG4gICAgICAgIHJldHVybiB1bmtub3duLnByb3AgPT09IHByb3BcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZXZlbnQgKGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0KVxuICAgIH1cbiAgfVxuXG4gIHZhbHVlICh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgdGhpcy5ldmVudChldmVudCwgdGFyZ2V0KVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcGFyYW0ge1Byb3BlcnR5PFQ+fSBwcm9wXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwcm9wIChwcm9wKSB7XG4gICAgaWYgKHByb3AgIT0gbnVsbCkge1xuICAgICAgdGhpcy5hZGRFdmVudEJpbmQoJ2ludmFsaWRhdGVkJywgcHJvcC5ldmVudHMsIHRoaXMuZ2V0VW5rbm93bkNhbGxiYWNrKHByb3ApKVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWUocHJvcC5nZXQoKSwgJ3VwZGF0ZWQnLCBwcm9wLmV2ZW50cylcbiAgICB9XG4gIH1cblxuICBwcm9wQnlOYW1lIChwcm9wLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eShwcm9wKSlcbiAgICB9IGVsc2UgaWYgKHRhcmdldFtwcm9wICsgJ1Byb3BlcnR5J10gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcCh0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdXG4gICAgfVxuICB9XG5cbiAgcHJvcFBhdGggKHBhdGgsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICB2YXIgcHJvcCwgdmFsXG4gICAgcGF0aCA9IHBhdGguc3BsaXQoJy4nKVxuICAgIHZhbCA9IHRhcmdldFxuICAgIHdoaWxlICgodmFsICE9IG51bGwpICYmIHBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgcHJvcCA9IHBhdGguc2hpZnQoKVxuICAgICAgdmFsID0gdGhpcy5wcm9wQnlOYW1lKHByb3AsIHZhbClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgZnVuY3QgKGZ1bmN0KSB7XG4gICAgdmFyIGludmFsaWRhdG9yLCByZXNcbiAgICBpbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcigoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRVbmtub3duKCgpID0+IHtcbiAgICAgICAgdmFyIHJlczJcbiAgICAgICAgcmVzMiA9IGZ1bmN0KGludmFsaWRhdG9yKVxuICAgICAgICBpZiAocmVzICE9PSByZXMyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgICAgIH1cbiAgICAgIH0sIGludmFsaWRhdG9yKVxuICAgIH0pXG4gICAgcmVzID0gZnVuY3QoaW52YWxpZGF0b3IpXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChpbnZhbGlkYXRvcilcbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICB2YWxpZGF0ZVVua25vd25zICgpIHtcbiAgICB2YXIgdW5rbm93bnNcbiAgICB1bmtub3ducyA9IHRoaXMudW5rbm93bnNcbiAgICB0aGlzLnVua25vd25zID0gW11cbiAgICByZXR1cm4gdW5rbm93bnMuZm9yRWFjaChmdW5jdGlvbiAodW5rbm93bikge1xuICAgICAgcmV0dXJuIHVua25vd24oKVxuICAgIH0pXG4gIH1cblxuICBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMubGVuZ3RoID09PSAwXG4gIH1cblxuICBiaW5kICgpIHtcbiAgICB0aGlzLmludmFsaWQgPSBmYWxzZVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgZXZlbnRCaW5kLmJpbmQoKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJlY3ljbGUgKGZuKSB7XG4gICAgdmFyIGRvbmUsIHJlc1xuICAgIHRoaXMucmVjeWNsZWQgPSB0aGlzLmludmFsaWRhdGlvbkV2ZW50c1xuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW11cbiAgICBkb25lID0gdGhpcy5lbmRSZWN5Y2xlLmJpbmQodGhpcylcbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZm4ubGVuZ3RoID4gMSkge1xuICAgICAgICByZXR1cm4gZm4odGhpcywgZG9uZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IGZuKHRoaXMpXG4gICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkb25lXG4gICAgfVxuICB9XG5cbiAgZW5kUmVjeWNsZSAoKSB7XG4gICAgdGhpcy5yZWN5Y2xlZC5mb3JFYWNoKGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgIHJldHVybiBldmVudEJpbmQudW5iaW5kKClcbiAgICB9KVxuICAgIHRoaXMucmVjeWNsZWQgPSBbXVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjaGVja0VtaXR0ZXIgKGVtaXR0ZXIpIHtcbiAgICByZXR1cm4gRXZlbnRCaW5kLmNoZWNrRW1pdHRlcihlbWl0dGVyLCB0aGlzLnN0cmljdClcbiAgfVxuXG4gIGNoZWNrUHJvcEluc3RhbmNlIChwcm9wKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBwcm9wLmdldCA9PT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLmNoZWNrRW1pdHRlcihwcm9wLmV2ZW50cylcbiAgfVxuXG4gIHVuYmluZCAoKSB7XG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICBldmVudEJpbmQudW5iaW5kKClcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn07XG5cbkludmFsaWRhdG9yLnN0cmljdCA9IHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBJbnZhbGlkYXRvclxuIiwiY29uc3QgUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5JylcblxuY2xhc3MgUHJvcGVydGllc01hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAocHJvcGVydGllcyA9IHt9LCBvcHRpb25zID0ge30pIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXkuPFByb3BlcnR5Pn1cbiAgICAgKi9cbiAgICB0aGlzLnByb3BlcnRpZXMgPSBbXVxuICAgIHRoaXMuZ2xvYmFsT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBpbml0V2F0Y2hlcnM6IGZhbHNlIH0sIG9wdGlvbnMpXG4gICAgdGhpcy5wcm9wZXJ0aWVzT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBwcm9wZXJ0aWVzXG4gICAqIEBwYXJhbSB7Kn0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtQcm9wZXJ0aWVzTWFuYWdlcn1cbiAgICovXG4gIGNvcHlXaXRoIChwcm9wZXJ0aWVzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLm1lcmdlUHJvcGVydGllc09wdGlvbnModGhpcy5wcm9wZXJ0aWVzT3B0aW9ucywgcHJvcGVydGllcyksIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2xvYmFsT3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICB3aXRoUHJvcGVydHkgKHByb3AsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0ge31cbiAgICBwcm9wZXJ0aWVzW3Byb3BdID0gb3B0aW9uc1xuICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHByb3BlcnRpZXMpXG4gIH1cblxuICB1c2VTY29wZSAoc2NvcGUpIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7fSwgeyBzY29wZTogc2NvcGUgfSlcbiAgfVxuXG4gIG1lcmdlUHJvcGVydGllc09wdGlvbnMgKC4uLmFyZykge1xuICAgIHJldHVybiBhcmcucmVkdWNlKChyZXMsIG9wdCkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMob3B0KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIHJlc1tuYW1lXSA9IHRoaXMubWVyZ2VQcm9wZXJ0eU9wdGlvbnMocmVzW25hbWVdIHx8IHt9LCBvcHRbbmFtZV0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0sIHt9KVxuICB9XG5cbiAgbWVyZ2VQcm9wZXJ0eU9wdGlvbnMgKC4uLmFyZykge1xuICAgIGNvbnN0IG5vdE1lcmdhYmxlID0gWydkZWZhdWx0JywgJ3Njb3BlJ11cbiAgICByZXR1cm4gYXJnLnJlZHVjZSgocmVzLCBvcHQpID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKG9wdCkuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHJlc1tuYW1lXSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb3B0W25hbWVdID09PSAnZnVuY3Rpb24nICYmICFub3RNZXJnYWJsZS5pbmNsdWRlcyhuYW1lKSkge1xuICAgICAgICAgIHJlc1tuYW1lXSA9IHRoaXMubWVyZ2VDYWxsYmFjayhyZXNbbmFtZV0sIG9wdFtuYW1lXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNbbmFtZV0gPSBvcHRbbmFtZV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiByZXNcbiAgICB9LCB7fSlcbiAgfVxuXG4gIG1lcmdlQ2FsbGJhY2sgKG9sZEZ1bmN0LCBuZXdGdW5jdCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgICByZXR1cm4gbmV3RnVuY3QuY2FsbCh0aGlzLCAuLi5hcmcsIG9sZEZ1bmN0LmJpbmQodGhpcykpXG4gICAgfVxuICB9XG5cbiAgaW5pdFByb3BlcnRpZXMgKCkge1xuICAgIHRoaXMuYWRkUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXNPcHRpb25zKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjcmVhdGVTY29wZUdldHRlclNldHRlcnMgKCkge1xuICAgIHRoaXMucHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiBwcm9wLmNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycygpKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbml0V2F0Y2hlcnMgKCkge1xuICAgIHRoaXMucHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiBwcm9wLmluaXRXYXRjaGVycygpKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbml0U2NvcGUgKCkge1xuICAgIHRoaXMuaW5pdFByb3BlcnRpZXMoKVxuICAgIHRoaXMuY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzKClcbiAgICB0aGlzLmluaXRXYXRjaGVycygpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZFByb3BlcnR5IChuYW1lLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcHJvcCA9IG5ldyBQcm9wZXJ0eShPYmplY3QuYXNzaWduKHsgbmFtZTogbmFtZSB9LCB0aGlzLmdsb2JhbE9wdGlvbnMsIG9wdGlvbnMpKVxuICAgIHRoaXMucHJvcGVydGllcy5wdXNoKHByb3ApXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZFByb3BlcnRpZXMgKG9wdGlvbnMpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKChuYW1lKSA9PiB0aGlzLmFkZFByb3BlcnR5KG5hbWUsIG9wdGlvbnNbbmFtZV0pKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybnMge1Byb3BlcnR5fVxuICAgKi9cbiAgZ2V0UHJvcGVydHkgKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLmZpbmQoKHByb3ApID0+IHByb3Aub3B0aW9ucy5uYW1lID09PSBuYW1lKVxuICB9XG5cbiAgc2V0UHJvcGVydGllc0RhdGEgKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKCgob3B0aW9ucy53aGl0ZWxpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy53aGl0ZWxpc3QuaW5kZXhPZihrZXkpICE9PSAtMSkgJiYgKChvcHRpb25zLmJsYWNrbGlzdCA9PSBudWxsKSB8fCBvcHRpb25zLmJsYWNrbGlzdC5pbmRleE9mKGtleSkgPT09IC0xKSkge1xuICAgICAgICBjb25zdCBwcm9wID0gdGhpcy5nZXRQcm9wZXJ0eShrZXkpXG4gICAgICAgIGlmIChwcm9wKSB7XG4gICAgICAgICAgcHJvcC5zZXQoZGF0YVtrZXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0TWFudWFsRGF0YVByb3BlcnRpZXMgKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXMucmVkdWNlKChyZXMsIHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wLmdldHRlci5jYWxjdWxhdGVkICYmIHByb3AubWFudWFsKSB7XG4gICAgICAgIHJlc1twcm9wLm9wdGlvbnMubmFtZV0gPSBwcm9wLmdldCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfSwge30pXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLnByb3BlcnRpZXMuZm9yRWFjaCgocHJvcCkgPT4gcHJvcC5kZXN0cm95KCkpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0aWVzTWFuYWdlclxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG5cbmNvbnN0IFNpbXBsZUdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9TaW1wbGVHZXR0ZXInKVxuY29uc3QgQ2FsY3VsYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9DYWxjdWxhdGVkR2V0dGVyJylcbmNvbnN0IEludmFsaWRhdGVkR2V0dGVyID0gcmVxdWlyZSgnLi9nZXR0ZXJzL0ludmFsaWRhdGVkR2V0dGVyJylcbmNvbnN0IE1hbnVhbEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9NYW51YWxHZXR0ZXInKVxuY29uc3QgQ29tcG9zaXRlR2V0dGVyID0gcmVxdWlyZSgnLi9nZXR0ZXJzL0NvbXBvc2l0ZUdldHRlcicpXG5cbmNvbnN0IE1hbnVhbFNldHRlciA9IHJlcXVpcmUoJy4vc2V0dGVycy9NYW51YWxTZXR0ZXInKVxuY29uc3QgU2ltcGxlU2V0dGVyID0gcmVxdWlyZSgnLi9zZXR0ZXJzL1NpbXBsZVNldHRlcicpXG5jb25zdCBCYXNlVmFsdWVTZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvQmFzZVZhbHVlU2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb25TZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvQ29sbGVjdGlvblNldHRlcicpXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuY2xhc3MgUHJvcGVydHkge1xuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gUHJvcGVydHlPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7VH0gW2RlZmF1bHRdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oaW1wb3J0KFwiLi9JbnZhbGlkYXRvclwiKSk6IFR9IFtjYWxjdWxdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oKTogVH0gW2dldF1cbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihUKX0gW3NldF1cbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihULFQpfGltcG9ydChcIi4vUHJvcGVydHlXYXRjaGVyXCIpPFQ+fSBbY2hhbmdlXVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW58c3RyaW5nfGZ1bmN0aW9uKFQsVCk6VH0gW2NvbXBvc2VkXVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW58T2JqZWN0fSBbY29sbGVjdGlvbl1cbiAgICogQHByb3BlcnR5IHsqfSBbc2NvcGVdXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlPcHRpb25zfSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgUHJvcGVydHkuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtFdmVudEVtaXR0ZXJ9XG4gICAgICovXG4gICAgdGhpcy5ldmVudHMgPSBuZXcgdGhpcy5vcHRpb25zLkV2ZW50RW1pdHRlckNsYXNzKClcbiAgICB0aGlzLm1ha2VTZXR0ZXIoKVxuICAgIHRoaXMubWFrZUdldHRlcigpXG4gICAgdGhpcy5zZXR0ZXIuaW5pdCgpXG4gICAgdGhpcy5nZXR0ZXIuaW5pdCgpXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pbml0V2F0Y2hlcnMpIHtcbiAgICAgIHRoaXMuaW5pdFdhdGNoZXJzKClcbiAgICB9XG4gIH1cblxuICBpbml0V2F0Y2hlcnMgKCkge1xuICAgIHRoaXMuc2V0dGVyLmxvYWRJbnRlcm5hbFdhdGNoZXIoKVxuICB9XG5cbiAgbWFrZUdldHRlciAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmdldHRlciA9IG5ldyBNYW51YWxHZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsICYmIHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuZ2V0dGVyID0gbmV3IENvbXBvc2l0ZUdldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBDYWxjdWxhdGVkR2V0dGVyKHRoaXMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBJbnZhbGlkYXRlZEdldHRlcih0aGlzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldHRlciA9IG5ldyBTaW1wbGVHZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICBtYWtlU2V0dGVyICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IE1hbnVhbFNldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvbGxlY3Rpb24gIT0gbnVsbCAmJiB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbiAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IENvbGxlY3Rpb25TZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsICYmIHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IEJhc2VWYWx1ZVNldHRlcih0aGlzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldHRlciA9IG5ldyBTaW1wbGVTZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eTxUPn1cbiAgICovXG4gIGNvcHlXaXRoIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1R9XG4gICAqL1xuICBnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLmdldHRlci5nZXQoKVxuICB9XG5cbiAgaW52YWxpZGF0ZSAoKSB7XG4gICAgdGhpcy5nZXR0ZXIuaW52YWxpZGF0ZSgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKCkge1xuICAgIHRoaXMuZ2V0dGVyLnVua25vd24oKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXQgKHZhbCkge1xuICAgIHJldHVybiB0aGlzLnNldHRlci5zZXQodmFsKVxuICB9XG5cbiAgY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzICgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnNjb3BlKSB7XG4gICAgICBjb25zdCBwcm9wID0gdGhpc1xuICAgICAgbGV0IG9wdCA9IHt9XG4gICAgICBvcHRbdGhpcy5vcHRpb25zLm5hbWUgKyAnUHJvcGVydHknXSA9IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3BcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3B0ID0gdGhpcy5nZXR0ZXIuZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzKG9wdClcbiAgICAgIG9wdCA9IHRoaXMuc2V0dGVyLmdldFNjb3BlR2V0dGVyU2V0dGVycyhvcHQpXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLm9wdGlvbnMuc2NvcGUsIG9wdClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVzdHJveSA9PT0gdHJ1ZSAmJiB0aGlzLnZhbHVlICE9IG51bGwgJiYgdGhpcy52YWx1ZS5kZXN0cm95ICE9IG51bGwpIHtcbiAgICAgIHRoaXMudmFsdWUuZGVzdHJveSgpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmRlc3Ryb3kgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KCdkZXN0cm95JywgdGhpcy52YWx1ZSlcbiAgICB9XG4gICAgdGhpcy5nZXR0ZXIuZGVzdHJveSgpXG4gICAgdGhpcy52YWx1ZSA9IG51bGxcbiAgfVxuXG4gIGNhbGxPcHRpb25GdW5jdCAoZnVuY3QsIC4uLmFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIGZ1bmN0ID09PSAnc3RyaW5nJykge1xuICAgICAgZnVuY3QgPSB0aGlzLm9wdGlvbnNbZnVuY3RdXG4gICAgfVxuICAgIHJldHVybiBmdW5jdC5hcHBseSh0aGlzLm9wdGlvbnMuc2NvcGUgfHwgdGhpcywgYXJncylcbiAgfVxufVxuXG5Qcm9wZXJ0eS5kZWZhdWx0T3B0aW9ucyA9IHtcbiAgRXZlbnRFbWl0dGVyQ2xhc3M6IEV2ZW50RW1pdHRlcixcbiAgaW5pdFdhdGNoZXJzOiB0cnVlXG59XG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5XG4iLCJcbmNsYXNzIEJhc2VHZXR0ZXIge1xuICBjb25zdHJ1Y3RvciAocHJvcCkge1xuICAgIHRoaXMucHJvcCA9IHByb3BcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlXG4gICAgdGhpcy5pbml0aWF0ZWQgPSBmYWxzZVxuICB9XG5cbiAgZ2V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpXG4gIH1cblxuICBvdXRwdXQgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnb3V0cHV0JywgdGhpcy5wcm9wLnZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gICAgfVxuICB9XG5cbiAgcmV2YWxpZGF0ZWQgKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWVcbiAgICB0aGlzLmluaXRpYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdW5rbm93biAoKSB7XG4gICAgaWYgKHRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlTm90aWNlKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGludmFsaWRhdGUgKCkge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlXG4gICAgICB0aGlzLmludmFsaWRhdGVOb3RpY2UoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaW52YWxpZGF0ZU5vdGljZSAoKSB7XG4gICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCdpbnZhbGlkYXRlZCcpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9IG9wdFxuICAgKiBAcmV0dXJuIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9XG4gICAqL1xuICBnZXRTY29wZUdldHRlclNldHRlcnMgKG9wdCkge1xuICAgIGNvbnN0IHByb3AgPSB0aGlzLnByb3BcbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0gPSBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0gfHwge31cbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0uZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHByb3AuZ2V0KClcbiAgICB9XG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdLmVudW1lcmFibGUgPSB0cnVlXG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdLmNvbmZpZ3VyYWJsZSA9IHRydWVcbiAgICByZXR1cm4gb3B0XG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VHZXR0ZXJcbiIsIlxuY29uc3QgQmFzZUdldHRlciA9IHJlcXVpcmUoJy4vQmFzZUdldHRlcicpXG5cbmNsYXNzIENhbGN1bGF0ZWRHZXR0ZXIgZXh0ZW5kcyBCYXNlR2V0dGVyIHtcbiAgZ2V0ICgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgY29uc3Qgb2xkID0gdGhpcy5wcm9wLnZhbHVlXG4gICAgICBjb25zdCBpbml0aWF0ZWQgPSB0aGlzLmluaXRpYXRlZFxuICAgICAgdGhpcy5jYWxjdWwoKVxuICAgICAgaWYgKCFpbml0aWF0ZWQpIHtcbiAgICAgICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCd1cGRhdGVkJywgb2xkKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3Auc2V0dGVyLmNoZWNrQ2hhbmdlcyh0aGlzLnByb3AudmFsdWUsIG9sZCkpIHtcbiAgICAgICAgdGhpcy5wcm9wLnNldHRlci5jaGFuZ2VkKG9sZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxuXG4gIGNhbGN1bCAoKSB7XG4gICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdjYWxjdWwnKSlcbiAgICB0aGlzLnByb3AubWFudWFsID0gZmFsc2VcbiAgICB0aGlzLnJldmFsaWRhdGVkKClcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYWxjdWxhdGVkR2V0dGVyXG4iLCJjb25zdCBJbnZhbGlkYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vSW52YWxpZGF0ZWRHZXR0ZXInKVxuY29uc3QgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ3NwYXJrLWNvbGxlY3Rpb24nKVxuY29uc3QgSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpXG5jb25zdCBSZWZlcmVuY2UgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuUmVmZXJlbmNlXG5cbmNsYXNzIENvbXBvc2l0ZUdldHRlciBleHRlbmRzIEludmFsaWRhdGVkR2V0dGVyIHtcbiAgaW5pdCAoKSB7XG4gICAgc3VwZXIuaW5pdCgpXG4gICAgaWYgKHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5iYXNlVmFsdWUgPSB0aGlzLnByb3Aub3B0aW9ucy5kZWZhdWx0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcC5zZXR0ZXIuc2V0UmF3VmFsdWUobnVsbClcbiAgICAgIHRoaXMuYmFzZVZhbHVlID0gbnVsbFxuICAgIH1cbiAgICB0aGlzLm1lbWJlcnMgPSBuZXcgQ29tcG9zaXRlR2V0dGVyLk1lbWJlcnModGhpcy5wcm9wLm9wdGlvbnMubWVtYmVycylcbiAgICBpZiAodGhpcy5wcm9wLm9wdGlvbnMuY2FsY3VsICE9IG51bGwpIHtcbiAgICAgIHRoaXMubWVtYmVycy51bnNoaWZ0KChwcmV2LCBpbnZhbGlkYXRvcikgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wLm9wdGlvbnMuY2FsY3VsLmJpbmQodGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUpKGludmFsaWRhdG9yKVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5tZW1iZXJzLmNoYW5nZWQgPSAob2xkKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKClcbiAgICB9XG4gICAgdGhpcy5wcm9wLm1lbWJlcnMgPSB0aGlzLm1lbWJlcnNcblxuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuam9pbiA9IHRoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWQgPT09ICdzdHJpbmcnICYmIENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zW3RoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkXSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmpvaW4gPSBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9uc1t0aGlzLnByb3Aub3B0aW9ucy5jb21wb3NlZF1cbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmpvaW4gPSBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9ucy5vclxuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5qb2luID0gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMuYW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuam9pbiA9IENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zLmxhc3RcbiAgICB9XG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIGlmICh0aGlzLm1lbWJlcnMubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLnByb3AsIHRoaXMucHJvcC5vcHRpb25zLnNjb3BlKVxuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMubWVtYmVycy5yZWR1Y2UoKHByZXYsIG1lbWJlcikgPT4ge1xuICAgICAgICAgIHZhciB2YWxcbiAgICAgICAgICB2YWwgPSB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nID8gbWVtYmVyKHByZXYsIHRoaXMuaW52YWxpZGF0b3IpIDogbWVtYmVyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuam9pbihwcmV2LCB2YWwpXG4gICAgICAgIH0sIHRoaXMuYmFzZVZhbHVlKSlcbiAgICAgICAgZG9uZSgpXG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbnVsbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludmFsaWRhdG9yLmJpbmQoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMuYmFzZVZhbHVlKVxuICAgIH1cbiAgICB0aGlzLnJldmFsaWRhdGVkKClcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9IG9wdFxuICAgKiBAcmV0dXJuIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9XG4gICAqL1xuICBnZXRTY29wZUdldHRlclNldHRlcnMgKG9wdCkge1xuICAgIG9wdCA9IHN1cGVyLmdldFNjb3BlR2V0dGVyU2V0dGVycyhvcHQpXG4gICAgY29uc3QgbWVtYmVycyA9IHRoaXMubWVtYmVyc1xuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lICsgJ01lbWJlcnMnXSA9IHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbWVtYmVyc1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0XG4gIH1cbn1cblxuQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMgPSB7XG4gIGFuZDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiXG4gIH0sXG4gIG9yOiBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhIHx8IGJcbiAgfSxcbiAgbGFzdDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYlxuICB9LFxuICBzdW06IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEgKyBiXG4gIH1cbn1cblxuQ29tcG9zaXRlR2V0dGVyLk1lbWJlcnMgPSBjbGFzcyBNZW1iZXJzIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGFkZFByb3BlcnR5IChwcm9wKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG51bGwsIHByb3ApID09PSAtMSkge1xuICAgICAgdGhpcy5wdXNoKFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHByb3ApXG4gICAgICB9LCB7XG4gICAgICAgIHByb3A6IHByb3BcbiAgICAgIH0pKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYWRkUHJvcGVydHlQYXRoIChuYW1lLCBvYmopIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMucHVzaChSZWZlcmVuY2UubWFrZVJlZmVycmVkKGZ1bmN0aW9uIChwcmV2LCBpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgobmFtZSwgb2JqKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBvYmo6IG9ialxuICAgICAgfSkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICByZW1vdmVQcm9wZXJ0eSAocHJvcCkge1xuICAgIHRoaXMucmVtb3ZlUmVmKHsgcHJvcDogcHJvcCB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZGRWYWx1ZVJlZiAodmFsLCBkYXRhKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KGRhdGEpID09PSAtMSkge1xuICAgICAgY29uc3QgZm4gPSBSZWZlcmVuY2UubWFrZVJlZmVycmVkKGZ1bmN0aW9uIChwcmV2LCBpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdmFsXG4gICAgICB9LCBkYXRhKVxuICAgICAgZm4udmFsID0gdmFsXG4gICAgICB0aGlzLnB1c2goZm4pXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRWYWx1ZVJlZiAodmFsLCBkYXRhKSB7XG4gICAgY29uc3QgaSA9IHRoaXMuZmluZFJlZkluZGV4KGRhdGEpXG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICB0aGlzLmFkZFZhbHVlUmVmKHZhbCwgZGF0YSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0KGkpLnZhbCAhPT0gdmFsKSB7XG4gICAgICBjb25zdCBmbiA9IFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0sIGRhdGEpXG4gICAgICBmbi52YWwgPSB2YWxcbiAgICAgIHRoaXMuc2V0KGksIGZuKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0VmFsdWVSZWYgKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kQnlSZWYoZGF0YSkudmFsXG4gIH1cblxuICBhZGRGdW5jdGlvblJlZiAoZm4sIGRhdGEpIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgoZGF0YSkgPT09IC0xKSB7XG4gICAgICBmbiA9IFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZm4sIGRhdGEpXG4gICAgICB0aGlzLnB1c2goZm4pXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBmaW5kQnlSZWYgKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbdGhpcy5maW5kUmVmSW5kZXgoZGF0YSldXG4gIH1cblxuICBmaW5kUmVmSW5kZXggKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uIChtZW1iZXIpIHtcbiAgICAgIHJldHVybiAobWVtYmVyLnJlZiAhPSBudWxsKSAmJiBtZW1iZXIucmVmLmNvbXBhcmVEYXRhKGRhdGEpXG4gICAgfSlcbiAgfVxuXG4gIHJlbW92ZVJlZiAoZGF0YSkge1xuICAgIHZhciBpbmRleCwgb2xkXG4gICAgaW5kZXggPSB0aGlzLmZpbmRSZWZJbmRleChkYXRhKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9zaXRlR2V0dGVyXG4iLCJjb25zdCBJbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJylcbmNvbnN0IENhbGN1bGF0ZWRHZXR0ZXIgPSByZXF1aXJlKCcuL0NhbGN1bGF0ZWRHZXR0ZXInKVxuXG5jbGFzcyBJbnZhbGlkYXRlZEdldHRlciBleHRlbmRzIENhbGN1bGF0ZWRHZXR0ZXIge1xuICBnZXQgKCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZ2V0KClcbiAgfVxuXG4gIGNhbGN1bCAoKSB7XG4gICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMucHJvcCwgdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUpXG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgIHRoaXMucHJvcC5zZXR0ZXIuc2V0UmF3VmFsdWUodGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnY2FsY3VsJywgaW52YWxpZGF0b3IpKVxuICAgICAgdGhpcy5wcm9wLm1hbnVhbCA9IGZhbHNlXG4gICAgICBkb25lKClcbiAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG51bGxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGludmFsaWRhdG9yLmJpbmQoKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxuXG4gIGludmFsaWRhdGUgKCkge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlXG4gICAgICB0aGlzLmludmFsaWRhdGVOb3RpY2UoKVxuICAgICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQgJiYgdGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWRHZXR0ZXJcbiIsImNvbnN0IEJhc2VHZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VHZXR0ZXInKVxuXG5jbGFzcyBNYW51YWxHZXR0ZXIgZXh0ZW5kcyBCYXNlR2V0dGVyIHtcbiAgZ2V0ICgpIHtcbiAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ2dldCcpKVxuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWVcbiAgICB0aGlzLmluaXRpYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFudWFsR2V0dGVyXG4iLCJjb25zdCBCYXNlR2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlR2V0dGVyJylcblxuY2xhc3MgU2ltcGxlR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZVxuICAgIGlmICghdGhpcy5pbml0aWF0ZWQpIHtcbiAgICAgIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZVxuICAgICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCd1cGRhdGVkJylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZUdldHRlclxuIiwiXG5jb25zdCBQcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXInKVxuXG5jbGFzcyBCYXNlU2V0dGVyIHtcbiAgY29uc3RydWN0b3IgKHByb3ApIHtcbiAgICB0aGlzLnByb3AgPSBwcm9wXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB0aGlzLnNldERlZmF1bHRWYWx1ZSgpXG4gIH1cblxuICBzZXREZWZhdWx0VmFsdWUgKCkge1xuICAgIHRoaXMuc2V0UmF3VmFsdWUodGhpcy5pbmdlc3QodGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdCkpXG4gIH1cblxuICBsb2FkSW50ZXJuYWxXYXRjaGVyICgpIHtcbiAgICBjb25zdCBjaGFuZ2VPcHQgPSB0aGlzLnByb3Aub3B0aW9ucy5jaGFuZ2VcbiAgICBpZiAodHlwZW9mIGNoYW5nZU9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wLFxuICAgICAgICBjYWxsYmFjazogY2hhbmdlT3B0LFxuICAgICAgICBzY29wZTogdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUsXG4gICAgICAgIGF1dG9CaW5kOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAoY2hhbmdlT3B0ICE9IG51bGwgJiYgdHlwZW9mIGNoYW5nZU9wdC5jb3B5V2l0aCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGNoYW5nZU9wdC5jb3B5V2l0aCh7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3AsXG4gICAgICAgIGF1dG9CaW5kOiB0cnVlXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHNldCAodmFsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKVxuICB9XG5cbiAgc2V0UmF3VmFsdWUgKHZhbCkge1xuICAgIHRoaXMucHJvcC52YWx1ZSA9IHZhbFxuICAgIHJldHVybiB0aGlzLnByb3AudmFsdWVcbiAgfVxuXG4gIGluZ2VzdCAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5pbmdlc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhbCA9IHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ2luZ2VzdCcsIHZhbClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgY2hlY2tDaGFuZ2VzICh2YWwsIG9sZCkge1xuICAgIHJldHVybiB2YWwgIT09IG9sZFxuICB9XG5cbiAgY2hhbmdlZCAob2xkKSB7XG4gICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCd1cGRhdGVkJywgb2xkKVxuICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgnY2hhbmdlZCcsIG9sZClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfSBvcHRcbiAgICogQHJldHVybiB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfVxuICAgKi9cbiAgZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzIChvcHQpIHtcbiAgICBjb25zdCBwcm9wID0gdGhpcy5wcm9wXG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdID0gb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdIHx8IHt9XG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdLnNldCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiBwcm9wLnNldCh2YWwpXG4gICAgfVxuICAgIHJldHVybiBvcHRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VTZXR0ZXJcbiIsImNvbnN0IEJhc2VTZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VTZXR0ZXInKVxuXG5jbGFzcyBCYXNlVmFsdWVTZXR0ZXIgZXh0ZW5kcyBCYXNlU2V0dGVyIHtcbiAgc2V0ICh2YWwpIHtcbiAgICB2YWwgPSB0aGlzLmluZ2VzdCh2YWwpXG4gICAgaWYgKHRoaXMucHJvcC5nZXR0ZXIuYmFzZVZhbHVlICE9PSB2YWwpIHtcbiAgICAgIHRoaXMucHJvcC5nZXR0ZXIuYmFzZVZhbHVlID0gdmFsXG4gICAgICB0aGlzLnByb3AuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlVmFsdWVTZXR0ZXJcbiIsImNvbnN0IFNpbXBsZVNldHRlciA9IHJlcXVpcmUoJy4vU2ltcGxlU2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb24gPSByZXF1aXJlKCdzcGFyay1jb2xsZWN0aW9uJylcbmNvbnN0IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi93YXRjaGVycy9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyJylcblxuY2xhc3MgQ29sbGVjdGlvblNldHRlciBleHRlbmRzIFNpbXBsZVNldHRlciB7XG4gIGluaXQgKCkge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIENvbGxlY3Rpb25TZXR0ZXIuZGVmYXVsdE9wdGlvbnMsXG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ29iamVjdCcgPyB0aGlzLnByb3Aub3B0aW9ucy5jb2xsZWN0aW9uIDoge31cbiAgICApXG4gICAgc3VwZXIuaW5pdCgpXG4gIH1cblxuICBsb2FkSW50ZXJuYWxXYXRjaGVyICgpIHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuaXRlbUFkZGVkID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICB0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuaXRlbVJlbW92ZWQgPT09ICdmdW5jdGlvbidcbiAgICApIHtcbiAgICAgIHJldHVybiBuZXcgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3AsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLnByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgIG9uQWRkZWQ6IHRoaXMucHJvcC5vcHRpb25zLml0ZW1BZGRlZCxcbiAgICAgICAgb25SZW1vdmVkOiB0aGlzLnByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCxcbiAgICAgICAgc2NvcGU6IHRoaXMucHJvcC5vcHRpb25zLnNjb3BlLFxuICAgICAgICBhdXRvQmluZDogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIubG9hZEludGVybmFsV2F0Y2hlcigpXG4gICAgfVxuICB9XG5cbiAgc2V0UmF3VmFsdWUgKHZhbCkge1xuICAgIHRoaXMucHJvcC52YWx1ZSA9IHRoaXMubWFrZUNvbGxlY3Rpb24odmFsKVxuICAgIHJldHVybiB0aGlzLnByb3AudmFsdWVcbiAgfVxuXG4gIG1ha2VDb2xsZWN0aW9uICh2YWwpIHtcbiAgICB2YWwgPSB0aGlzLnZhbFRvQXJyYXkodmFsKVxuICAgIGNvbnN0IHByb3AgPSB0aGlzLnByb3BcbiAgICBjb25zdCBjb2wgPSBDb2xsZWN0aW9uLm5ld1N1YkNsYXNzKHRoaXMub3B0aW9ucywgdmFsKVxuICAgIGNvbC5jaGFuZ2VkID0gZnVuY3Rpb24gKG9sZCkge1xuICAgICAgcHJvcC5zZXR0ZXIuY2hhbmdlZChvbGQpXG4gICAgfVxuICAgIHJldHVybiBjb2xcbiAgfVxuXG4gIHZhbFRvQXJyYXkgKHZhbCkge1xuICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB2YWwudG9BcnJheSgpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwuc2xpY2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3ZhbF1cbiAgICB9XG4gIH1cblxuICBjaGVja0NoYW5nZXMgKHZhbCwgb2xkKSB7XG4gICAgdmFyIGNvbXBhcmVGdW5jdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNvbXBhcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IHRoaXMub3B0aW9ucy5jb21wYXJlXG4gICAgfVxuICAgIHJldHVybiAobmV3IENvbGxlY3Rpb24odmFsKSkuY2hlY2tDaGFuZ2VzKG9sZCwgdGhpcy5vcHRpb25zLm9yZGVyZWQsIGNvbXBhcmVGdW5jdGlvbilcbiAgfVxufVxuXG5Db2xsZWN0aW9uU2V0dGVyLmRlZmF1bHRPcHRpb25zID0ge1xuICBjb21wYXJlOiBmYWxzZSxcbiAgb3JkZXJlZDogdHJ1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25TZXR0ZXJcbiIsImNvbnN0IEJhc2VTZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VTZXR0ZXInKVxuXG5jbGFzcyBNYW51YWxTZXR0ZXIgZXh0ZW5kcyBCYXNlU2V0dGVyIHtcbiAgc2V0ICh2YWwpIHtcbiAgICB0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdzZXQnLCB2YWwpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYW51YWxTZXR0ZXJcbiIsImNvbnN0IEJhc2VTZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VTZXR0ZXInKVxuXG5jbGFzcyBTaW1wbGVTZXR0ZXIgZXh0ZW5kcyBCYXNlU2V0dGVyIHtcbiAgc2V0ICh2YWwpIHtcbiAgICB2YXIgb2xkXG4gICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKVxuICAgIHRoaXMucHJvcC5nZXR0ZXIucmV2YWxpZGF0ZWQoKVxuICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh2YWwsIHRoaXMucHJvcC52YWx1ZSkpIHtcbiAgICAgIG9sZCA9IHRoaXMucHJvcC52YWx1ZVxuICAgICAgdGhpcy5zZXRSYXdWYWx1ZSh2YWwpXG4gICAgICB0aGlzLnByb3AubWFudWFsID0gdHJ1ZVxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZVNldHRlclxuIiwiXG5jb25zdCBQcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5V2F0Y2hlcicpXG5cbmNsYXNzIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyAob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpXG4gICAgdGhpcy5vbkFkZGVkID0gb3B0aW9ucy5vbkFkZGVkXG4gICAgdGhpcy5vblJlbW92ZWQgPSBvcHRpb25zLm9uUmVtb3ZlZFxuICB9XG5cbiAgaGFuZGxlQ2hhbmdlICh2YWx1ZSwgb2xkKSB7XG4gICAgb2xkID0gdmFsdWUuY29weShvbGQgfHwgW10pXG4gICAgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgdmFsdWUsIG9sZClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCFvbGQuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vbkFkZGVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG9sZC5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgIGlmICghdmFsdWUuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vblJlbW92ZWQuY2FsbCh0aGlzLnNjb3BlLCBpdGVtKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXJcbiIsIlxuY29uc3QgQmluZGVyID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkJpbmRlclxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLlJlZmVyZW5jZVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmNsYXNzIFByb3BlcnR5V2F0Y2hlciBleHRlbmRzIEJpbmRlciB7XG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBQcm9wZXJ0eVdhdGNoZXJPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7aW1wb3J0KFwiLi9Qcm9wZXJ0eVwiKTxUPnxzdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oVCxUKX0gY2FsbGJhY2tcbiAgICogQHByb3BlcnR5IHtib29sZWFufSBbYXV0b0JpbmRdXG4gICAqIEBwcm9wZXJ0eSB7Kn0gW3Njb3BlXVxuICAgKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5V2F0Y2hlck9wdGlvbnN9IG9wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKVxuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrID0gKG9sZCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlKG9sZClcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKHRoaXMub3B0aW9ucylcbiAgICB9XG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGxvYWRPcHRpb25zIChvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGVcbiAgICB0aGlzLnByb3BlcnR5ID0gb3B0aW9ucy5wcm9wZXJ0eVxuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrXG4gICAgdGhpcy5hdXRvQmluZCA9IG9wdGlvbnMuYXV0b0JpbmRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgY29weVdpdGggKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKSlcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIGlmICh0aGlzLmF1dG9CaW5kKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0JpbmQoKVxuICAgIH1cbiAgfVxuXG4gIGdldFByb3BlcnR5ICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQcm9wQnlOYW1lKHRoaXMucHJvcGVydHkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb3BlcnR5XG4gIH1cblxuICBnZXRQcm9wQnlOYW1lIChwcm9wLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KHByb3ApXG4gICAgfSBlbHNlIGlmICh0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgdGhlIHByb3BlcnR5ICR7cHJvcH1gKVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrQmluZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlQmluZCh0aGlzLnNob3VsZEJpbmQoKSlcbiAgfVxuXG4gIHNob3VsZEJpbmQgKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpICE9IG51bGxcbiAgfVxuXG4gIGRvQmluZCAoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMub24oJ2ludmFsaWRhdGVkJywgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMub24oJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKVxuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMub2ZmKCdpbnZhbGlkYXRlZCcsIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9mZigndXBkYXRlZCcsIHRoaXMudXBkYXRlQ2FsbGJhY2spXG4gIH1cblxuICBlcXVhbHMgKHdhdGNoZXIpIHtcbiAgICByZXR1cm4gd2F0Y2hlci5jb25zdHJ1Y3RvciA9PT0gdGhpcy5jb25zdHJ1Y3RvciAmJlxuICAgICAgd2F0Y2hlciAhPSBudWxsICYmXG4gICAgICB3YXRjaGVyLmV2ZW50ID09PSB0aGlzLmV2ZW50ICYmXG4gICAgICB3YXRjaGVyLmdldFByb3BlcnR5KCkgPT09IHRoaXMuZ2V0UHJvcGVydHkoKSAmJlxuICAgICAgUmVmZXJlbmNlLmNvbXBhcmVWYWwod2F0Y2hlci5jYWxsYmFjaywgdGhpcy5jYWxsYmFjaylcbiAgfVxuXG4gIGludmFsaWRhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KClcbiAgfVxuXG4gIHVwZGF0ZSAob2xkKSB7XG4gICAgdmFyIHZhbHVlXG4gICAgdmFsdWUgPSB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVDaGFuZ2UodmFsdWUsIG9sZClcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZSAodmFsdWUsIG9sZCkge1xuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgdmFsdWUsIG9sZClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0eVdhdGNoZXJcbiIsInZhciBFbGVtZW50LCBNaXhhYmxlLCBQcm9wZXJ0aWVzTWFuYWdlcjtcblxuUHJvcGVydGllc01hbmFnZXIgPSByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJykuUHJvcGVydGllc01hbmFnZXI7XG5cbk1peGFibGUgPSByZXF1aXJlKCcuL01peGFibGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFbGVtZW50IGV4dGVuZHMgTWl4YWJsZSB7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByb3BlcnRpZXNNYW5hZ2VyKGRhdGEpO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgaW5pdFByb3BlcnRpZXNNYW5hZ2VyKGRhdGEpIHtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLnVzZVNjb3BlKHRoaXMpO1xuICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5pbml0UHJvcGVydGllcygpO1xuICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5jcmVhdGVTY29wZUdldHRlclNldHRlcnMoKTtcbiAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLnNldFByb3BlcnRpZXNEYXRhKGRhdGEpO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5pbml0V2F0Y2hlcnMoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0YXAobmFtZSkge1xuICAgICAgdmFyIGFyZ3M7XG4gICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBuYW1lLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9jYWxsYmFja3MgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9jYWxsYmFja3NbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXS5vd25lciA9IHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW25hbWVdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIFsncHJvcGVydGllc01hbmFnZXInXTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQucHJvcGVydGllc01hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciA9IHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlci5jb3B5V2l0aCh0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLnByb3BlcnRpZXNPcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eShwcm9wLCBkZXNjKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3RvdHlwZS5wcm9wZXJ0aWVzTWFuYWdlci53aXRoUHJvcGVydHkocHJvcCwgZGVzYyk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLnByb3BlcnRpZXNNYW5hZ2VyID0gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIuY29weVdpdGgocHJvcGVydGllcyk7XG4gICAgfVxuXG4gIH07XG5cbiAgRWxlbWVudC5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIgPSBuZXcgUHJvcGVydGllc01hbmFnZXIoKTtcblxuICByZXR1cm4gRWxlbWVudDtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbGVtZW50LmpzLm1hcFxuIiwidmFyIEFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlciwgSW52YWxpZGF0b3IsIFByb3BlcnR5V2F0Y2hlcjtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJykuSW52YWxpZGF0b3I7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgUHJvcGVydHlXYXRjaGVyIHtcbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZSA9IG9wdGlvbnMuYWN0aXZlO1xuICB9XG5cbiAgc2hvdWxkQmluZCgpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGlmICh0aGlzLmFjdGl2ZSAhPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IuY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICAgIGFjdGl2ZSA9IHRoaXMuYWN0aXZlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcy5tYXBcbiIsInZhciBJbnZhbGlkYXRlZCwgSW52YWxpZGF0b3I7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLkludmFsaWRhdG9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkID0gY2xhc3MgSW52YWxpZGF0ZWQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKCEoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuaW5pdEJ5TG9hZGVyIDogdm9pZCAwKSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVua25vd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMuc2NvcGUpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICB0aGlzLmhhbmRsZVVwZGF0ZSh0aGlzLmludmFsaWRhdG9yKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGhhbmRsZVVwZGF0ZShpbnZhbGlkYXRvcikge1xuICAgIGlmICh0aGlzLnNjb3BlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgaW52YWxpZGF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhpbnZhbGlkYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMubWFwXG4iLCJ2YXIgTG9hZGVyLCBPdmVycmlkZXI7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBMb2FkZXIgZXh0ZW5kcyBPdmVycmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH1cblxuICAgIGluaXRQcmVsb2FkZWQoKSB7XG4gICAgICB2YXIgZGVmTGlzdDtcbiAgICAgIGRlZkxpc3QgPSB0aGlzLnByZWxvYWRlZDtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gW107XG4gICAgICByZXR1cm4gdGhpcy5sb2FkKGRlZkxpc3QpO1xuICAgIH1cblxuICAgIGxvYWQoZGVmTGlzdCkge1xuICAgICAgdmFyIGxvYWRlZCwgdG9Mb2FkO1xuICAgICAgdG9Mb2FkID0gW107XG4gICAgICBsb2FkZWQgPSBkZWZMaXN0Lm1hcCgoZGVmKSA9PiB7XG4gICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgaWYgKGRlZi5pbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBsb2FkZXI6IHRoaXNcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGluc3RhbmNlID0gTG9hZGVyLmxvYWQoZGVmKTtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaWYgKGRlZi5pbml0QnlMb2FkZXIgJiYgKGluc3RhbmNlLmluaXQgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHRvTG9hZC5wdXNoKGluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSB0aGlzLnByZWxvYWRlZC5jb25jYXQobG9hZGVkKTtcbiAgICAgIHJldHVybiB0b0xvYWQuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlbG9hZChkZWYpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkZWYpKSB7XG4gICAgICAgIGRlZiA9IFtkZWZdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkID0gKHRoaXMucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQoZGVmKTtcbiAgICB9XG5cbiAgICBkZXN0cm95TG9hZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkLmZvckVhY2goZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHJldHVybiAocmVmID0gZGVmLmluc3RhbmNlKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGVzdHJveSgpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldEZpbmFsUHJvcGVydGllcygpLmNvbmNhdChbJ3ByZWxvYWRlZCddKTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIHN1cGVyLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICBpZiAodGhpcy5wcmVsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkZWQgPSAodGFyZ2V0LnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KHRoaXMucHJlbG9hZGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZE1hbnkoZGVmKSB7XG4gICAgICByZXR1cm4gZGVmLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkKGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWQoZGVmKSB7XG4gICAgICBpZiAodHlwZW9mIGRlZi50eXBlLmNvcHlXaXRoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGRlZi50eXBlLmNvcHlXaXRoKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IGRlZi50eXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHByZWxvYWQoZGVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJlbG9hZChkZWYpO1xuICAgIH1cblxuICB9O1xuXG4gIExvYWRlci5wcm90b3R5cGUucHJlbG9hZGVkID0gW107XG5cbiAgTG9hZGVyLm92ZXJyaWRlcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmluaXQud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveUxvYWRlZCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIExvYWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Mb2FkZXIuanMubWFwXG4iLCJ2YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuXG4gIH07XG5cbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZU9uY2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKHNvdXJjZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uoc291cmNlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLCBwcm9wLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmdldEV4dGVuc2lvblByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3AgPSByZWZbaV07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgcHJvcCk7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAmJiB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzID0gdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLmNhbGwodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgfHwgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InLCAnZ2V0RmluYWxQcm9wZXJ0aWVzJ10sXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBhbHdheXNGaW5hbCwgcHJvcHMsIHRhcmdldENoYWluO1xuICAgICAgYWx3YXlzRmluYWwgPSB0aGlzLmFsd2F5c0ZpbmFsO1xuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XG4gICAgICBwcm9wcyA9IFtdO1xuICAgICAgdGhpcy5nZXRQcm90b3R5cGVDaGFpbihzb3VyY2UpLmV2ZXJ5KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgZXhjbHVkZTtcbiAgICAgICAgaWYgKCF0YXJnZXRDaGFpbi5pbmNsdWRlcyhvYmopKSB7XG4gICAgICAgICAgZXhjbHVkZSA9IGFsd2F5c0ZpbmFsO1xuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KFtcImxlbmd0aFwiLCBcInByb3RvdHlwZVwiLCBcIm5hbWVcIl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIiAmJiBpbmRleE9mLmNhbGwoZXhjbHVkZSwga2V5KSA8IDAgJiYgIXByb3BzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBrZXk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgIHByb3AubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSxcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgYmFzZVByb3RvdHlwZSwgY2hhaW47XG4gICAgICBjaGFpbiA9IFtdO1xuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hhaW4ucHVzaChvYmopO1xuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTWl4YWJsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NaXhhYmxlLmpzLm1hcFxuIiwiLy8gdG9kbyA6IFxuLy8gIHNpbXBsaWZpZWQgZm9ybSA6IEB3aXRob3V0TmFtZSBtZXRob2RcbnZhciBPdmVycmlkZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAodGhpcy5fb3ZlcnJpZGVzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFsnX292ZXJyaWRlcyddLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLl9vdmVycmlkZXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT3ZlcnJpZGVyLk92ZXJyaWRlID0ge1xuICAgIG1ha2VNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIgZm4sIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgZm4gPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIGZuKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIGFwcGx5TWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgb3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgb3ZlcnJpZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFwcGx5KHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgZm5OYW1lLCBmbikge1xuICAgICAgdmFyIG92ZXJyaWRlO1xuICAgICAgb3ZlcnJpZGUgPSB7XG4gICAgICAgIGZuOiB7XG4gICAgICAgICAgY3VycmVudDogZm5cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogZm5OYW1lXG4gICAgICB9O1xuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGgnICsgbmFtZXNwYWNlXSA9IGZuO1xuICAgICAgcmV0dXJuIG92ZXJyaWRlO1xuICAgIH0sXG4gICAgZW1wdHlGbjogZnVuY3Rpb24oKSB7fSxcbiAgICBhcHBseTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSB7XG4gICAgICB2YXIgZm5OYW1lLCBvdmVycmlkZXMsIHJlZiwgcmVmMSwgd2l0aG91dDtcbiAgICAgIGZuTmFtZSA9IG92ZXJyaWRlLm5hbWU7XG4gICAgICBvdmVycmlkZXMgPSB0YXJnZXQuX292ZXJyaWRlcyAhPSBudWxsID8gT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0Ll9vdmVycmlkZXMpIDoge307XG4gICAgICB3aXRob3V0ID0gKChyZWYgPSB0YXJnZXQuX292ZXJyaWRlcykgIT0gbnVsbCA/IChyZWYxID0gcmVmW2ZuTmFtZV0pICE9IG51bGwgPyByZWYxLmZuLmN1cnJlbnQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IHRhcmdldFtmbk5hbWVdO1xuICAgICAgb3ZlcnJpZGUgPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZSk7XG4gICAgICBpZiAob3ZlcnJpZGVzW2ZuTmFtZV0gIT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlc1tmbk5hbWVdLmZuLCBvdmVycmlkZS5mbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH1cbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRob3V0JyArIG5hbWVzcGFjZV0gPSB3aXRob3V0IHx8IHRoaXMuZW1wdHlGbjtcbiAgICAgIGlmICh3aXRob3V0ID09IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQgPSAnd2l0aG91dCcgKyBuYW1lc3BhY2U7XG4gICAgICB9IGVsc2UgaWYgKG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0KSB7XG4gICAgICAgIG92ZXJyaWRlLmZuW292ZXJyaWRlLm1pc3NpbmdXaXRob3V0XSA9IHdpdGhvdXQ7XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBmbk5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaW5hbEZuLCBmbiwga2V5LCByZWYyO1xuICAgICAgICAgIGZpbmFsRm4gPSBvdmVycmlkZS5mbi5jdXJyZW50LmJpbmQodGhpcyk7XG4gICAgICAgICAgcmVmMiA9IG92ZXJyaWRlLmZuO1xuICAgICAgICAgIGZvciAoa2V5IGluIHJlZjIpIHtcbiAgICAgICAgICAgIGZuID0gcmVmMltrZXldO1xuICAgICAgICAgICAgZmluYWxGbltrZXldID0gZm4uYmluZCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZm5OYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiBmaW5hbEZuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZpbmFsRm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3ZlcnJpZGVzW2ZuTmFtZV0gPSBvdmVycmlkZTtcbiAgICAgIHJldHVybiB0YXJnZXQuX292ZXJyaWRlcyA9IG92ZXJyaWRlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE92ZXJyaWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBVcGRhdGVyO1xuXG5CaW5kZXIgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuQmluZGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciByZWY7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmNhbGxiYWNrIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZENhbGxiYWNrKG9wdGlvbnMuY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IChyZWYgPSBvcHRpb25zLmNhbGxiYWNrcykgIT0gbnVsbCA/IHJlZi5mb3JFYWNoIDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIHRoaXMucnVuQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBydW5DYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVwZGF0aW5nICYmICF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIG5leHRUaWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgIGlmICghdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubmV4dC5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMubmV4dCA9IFtdO1xuICB9XG5cbn07XG5cblVwZGF0ZXIuQmluZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgY2xhc3MgQmluZGVyIGV4dGVuZHMgc3VwZXJDbGFzcyB7XG4gICAgY29uc3RydWN0b3IodGFyZ2V0LCBjYWxsYmFjazEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjazE7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZG9CaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZENhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUNhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBCaW5kZXI7XG5cbn0pLmNhbGwodGhpcywgQmluZGVyKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9VcGRhdGVyLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiRWxlbWVudFwiOiByZXF1aXJlKFwiLi9FbGVtZW50XCIpLFxuICBcIkxvYWRlclwiOiByZXF1aXJlKFwiLi9Mb2FkZXJcIiksXG4gIFwiTWl4YWJsZVwiOiByZXF1aXJlKFwiLi9NaXhhYmxlXCIpLFxuICBcIk92ZXJyaWRlclwiOiByZXF1aXJlKFwiLi9PdmVycmlkZXJcIiksXG4gIFwiVXBkYXRlclwiOiByZXF1aXJlKFwiLi9VcGRhdGVyXCIpLFxuICBcIkludmFsaWRhdGVkXCI6IHtcbiAgICBcIkFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXJcIiksXG4gICAgXCJJbnZhbGlkYXRlZFwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZFwiKSxcbiAgfSxcbn0iLCJ2YXIgbGlicztcblxubGlicyA9IHJlcXVpcmUoJy4vbGlicycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAnQ29sbGVjdGlvbic6IHJlcXVpcmUoJ3NwYXJrLWNvbGxlY3Rpb24nKVxufSwgbGlicywgcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLCByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL3NwYXJrLXN0YXJ0ZXIuanMubWFwXG4iXX0=
