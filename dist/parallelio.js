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
  start (location) {
    if (this.valid) {
      this.moving = true
      this.subject.xMembers.addPropertyRef('position.offsetX', this)
      this.subject.yMembers.addPropertyRef('position.offsetY', this)
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

},{"parallelio-timing":15,"spark-starter":99}],25:[function(require,module,exports){
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
  providedActions: {
    collection: true,
    calcul: function (invalidator) {
      return invalidator.propPath('tile.actionProvider.actions') || []
    }
  }
})

module.exports = Character

},{"./Damageable":30,"./actions/WalkAction":62,"parallelio-tiles":14}],27:[function(require,module,exports){
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

},{"./Door":31,"./VisionCalculator":53,"./actions/AttackMoveAction":57,"./actions/WalkAction":62,"parallelio-tiles":14,"spark-starter":99}],28:[function(require,module,exports){
const Element = require('spark-starter').Element
const View = require('./View')
const Ship = require('./Ship')

class Confrontation extends Element {
  start () {
    this.game.mainView = this.view
    this.subject.container = this.view
    this.opponent.container = this.view
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
  }
})

module.exports = Confrontation

},{"./Ship":47,"./View":52,"spark-starter":99}],29:[function(require,module,exports){
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

},{"./LineOfSight":37,"parallelio-tiles":14,"spark-starter":99}],30:[function(require,module,exports){
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

},{"spark-starter":99}],31:[function(require,module,exports){
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

},{"spark-starter":99}],33:[function(require,module,exports){
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
      subject: this.subject
    })
    return encounter.start()
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

},{"./Confrontation":28,"spark-starter":99}],34:[function(require,module,exports){
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

},{"./Player":42,"./View":52,"parallelio-timing":15,"spark-starter":99}],36:[function(require,module,exports){
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

},{"spark-starter":99}],37:[function(require,module,exports){
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

},{"spark-starter":99}],39:[function(require,module,exports){
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

},{"events":65,"parallelio-timing":15,"spark-starter":99}],41:[function(require,module,exports){
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

},{"./LineOfSight":37,"parallelio-timing":15,"spark-starter":99}],42:[function(require,module,exports){
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
    var action, ref
    action = this.selectedAction || ((ref = this.selected) != null ? ref.defaultAction : null)
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
      var ref
      if (old != null ? old.propertiesManager.getProperty('selected') : null) {
        old.selected = false
      }
      if ((ref = this.selected) != null ? ref.propertiesManager.getProperty('selected') : null) {
        this.selected.selected = this
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
      if (selected) {
        res.push(selected)
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

},{"spark-starter":99}],43:[function(require,module,exports){
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

},{"parallelio-timing":15,"spark-starter":99}],44:[function(require,module,exports){
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

},{"spark-starter":99}],45:[function(require,module,exports){
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

},{"./Ressource":44,"spark-starter":99}],46:[function(require,module,exports){
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

},{"./Door":31,"parallelio-tiles":14,"spark-starter":99}],47:[function(require,module,exports){
const Element = require('spark-starter').Element
const Travel = require('./Travel')
const TravelAction = require('./actions/TravelAction')

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
  providedActions: {
    collection: true,
    calcul: function (invalidator) {
      return new TravelAction({
        actor: this
      })
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

},{"./Travel":51,"./actions/TravelAction":61,"spark-starter":99}],48:[function(require,module,exports){
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

},{"./Damageable":30,"./Projectile":43,"parallelio-tiles":14,"parallelio-timing":15}],49:[function(require,module,exports){
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

},{"./Map":38,"./StarSystem":50,"parallelio-strings":6,"spark-starter":99}],50:[function(require,module,exports){
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

},{"spark-starter":99}],51:[function(require,module,exports){
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
        return console.log('stop moving')
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

},{"parallelio-timing":15,"spark-starter":99}],52:[function(require,module,exports){
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

},{"parallelio-grids":4,"spark-starter":99}],53:[function(require,module,exports){
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

},{"./LineOfSight":37,"parallelio-tiles":14}],54:[function(require,module,exports){
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

},{"events":65,"spark-starter":99}],55:[function(require,module,exports){
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

},{"spark-starter":99}],56:[function(require,module,exports){
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

},{"./TargetAction":59,"./WalkAction":62,"spark-starter":99}],57:[function(require,module,exports){
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

},{"../LineOfSight":37,"./AttackAction":56,"./TargetAction":59,"./WalkAction":62,"parallelio-pathfinder":5,"spark-starter":99}],58:[function(require,module,exports){
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

},{"./ActionProvider":55}],59:[function(require,module,exports){
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

},{"./Action":54}],60:[function(require,module,exports){
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
      return tile.actionProvider.actionsMember.addProperty(this.actionsProperty)
    },
    itemRemoved: function (tile) {
      return tile.actionProvider.actionsMember.removeProperty(this.actionsProperty)
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

},{"./ActionProvider":55}],61:[function(require,module,exports){
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

},{"../Travel":51,"./TargetAction":59}],62:[function(require,module,exports){
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

},{"./getters/CalculatedGetter":79,"./getters/CompositeGetter":80,"./getters/InvalidatedGetter":81,"./getters/ManualGetter":82,"./getters/SimpleGetter":83,"./setters/BaseValueSetter":85,"./setters/CollectionSetter":86,"./setters/ManualSetter":87,"./setters/SimpleSetter":88,"events":65}],78:[function(require,module,exports){

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
    if (a.toArray != null) {
      a = a.toArray()
    }
    if (a.concat == null) {
      a = [a]
    }
    if (b.toArray != null) {
      b = b.toArray()
    }
    if (b.concat == null) {
      b = [b]
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkLmpzIiwiLi4vcGFyYWxsZWxpby1ncmlkcy9saWIvR3JpZENlbGwuanMiLCIuLi9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkUm93LmpzIiwiLi4vcGFyYWxsZWxpby1ncmlkcy9saWIvZ3JpZHMuanMiLCIuLi9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvZGlzdC9wYXRoZmluZGVyLmpzIiwiLi4vcGFyYWxsZWxpby1zdHJpbmdzL3N0cmluZ3MuanMiLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9ncmVla0FscGhhYmV0Lmpzb24iLCIuLi9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9zdGFyTmFtZXMuanNvbiIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL0RpcmVjdGlvbi5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGUuanMiLCIuLi9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlQ29udGFpbmVyLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZVJlZmVyZW5jZS5qcyIsIi4uL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVkLmpzIiwiLi4vcGFyYWxsZWxpby10aWxlcy9saWIvdGlsZXMuanMiLCIuLi9wYXJhbGxlbGlvLXRpbWluZy9ub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aW1pbmcvZGlzdC90aW1pbmcuanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvQ29ubmVjdGVkLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1NpZ25hbC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9TaWduYWxPcGVyYXRpb24uanMiLCIuLi9wYXJhbGxlbGlvLXdpcmluZy9saWIvU2lnbmFsU291cmNlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL1N3aXRjaC5qcyIsIi4uL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9XaXJlLmpzIiwiLi4vcGFyYWxsZWxpby13aXJpbmcvbGliL3dpcmluZy5qcyIsImxpYi9BaXJsb2NrLmpzIiwibGliL0FwcHJvYWNoLmpzIiwibGliL0F1dG9tYXRpY0Rvb3IuanMiLCJsaWIvQ2hhcmFjdGVyLmpzIiwibGliL0NoYXJhY3RlckFJLmpzIiwibGliL0NvbmZyb250YXRpb24uanMiLCJsaWIvRGFtYWdlUHJvcGFnYXRpb24uanMiLCJsaWIvRGFtYWdlYWJsZS5qcyIsImxpYi9Eb29yLmpzIiwibGliL0VsZW1lbnQuanMiLCJsaWIvRW5jb250ZXJNYW5hZ2VyLmpzIiwibGliL0Zsb29yLmpzIiwibGliL0dhbWUuanMiLCJsaWIvSW52ZW50b3J5LmpzIiwibGliL0xpbmVPZlNpZ2h0LmpzIiwibGliL01hcC5qcyIsImxpYi9PYnN0YWNsZS5qcyIsImxpYi9QYXRoV2Fsay5qcyIsImxpYi9QZXJzb25hbFdlYXBvbi5qcyIsImxpYi9QbGF5ZXIuanMiLCJsaWIvUHJvamVjdGlsZS5qcyIsImxpYi9SZXNzb3VyY2UuanMiLCJsaWIvUmVzc291cmNlVHlwZS5qcyIsImxpYi9Sb29tR2VuZXJhdG9yLmpzIiwibGliL1NoaXAuanMiLCJsaWIvU2hpcFdlYXBvbi5qcyIsImxpYi9TdGFyTWFwR2VuZXJhdG9yLmpzIiwibGliL1N0YXJTeXN0ZW0uanMiLCJsaWIvVHJhdmVsLmpzIiwibGliL1ZpZXcuanMiLCJsaWIvVmlzaW9uQ2FsY3VsYXRvci5qcyIsImxpYi9hY3Rpb25zL0FjdGlvbi5qcyIsImxpYi9hY3Rpb25zL0FjdGlvblByb3ZpZGVyLmpzIiwibGliL2FjdGlvbnMvQXR0YWNrQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1NpbXBsZUFjdGlvblByb3ZpZGVyLmpzIiwibGliL2FjdGlvbnMvVGFyZ2V0QWN0aW9uLmpzIiwibGliL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL1RyYXZlbEFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1dhbGtBY3Rpb24uanMiLCJsaWIvbGlicy5qcyIsImxpYi9wYXJhbGxlbGlvLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCIuLi9zcGFyay1iaW5kaW5nL2luZGV4LmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvQmluZGVyLmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvRXZlbnRCaW5kLmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvUmVmZXJlbmNlLmpzIiwiLi4vc3BhcmstY29sbGVjdGlvbi9pbmRleC5qcyIsIi4uL3NwYXJrLWNvbGxlY3Rpb24vc3JjL0NvbGxlY3Rpb24uanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL2luZGV4LmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvSW52YWxpZGF0b3IuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9Qcm9wZXJ0aWVzTWFuYWdlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL1Byb3BlcnR5LmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9CYXNlR2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9DYWxjdWxhdGVkR2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0ludmFsaWRhdGVkR2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9NYW51YWxHZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL1NpbXBsZUdldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvQmFzZVNldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvQmFzZVZhbHVlU2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9Db2xsZWN0aW9uU2V0dGVyLmpzIiwiLi4vc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9NYW51YWxTZXR0ZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL1NpbXBsZVNldHRlci5qcyIsIi4uL3NwYXJrLXByb3BlcnRpZXMvc3JjL3dhdGNoZXJzL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIuanMiLCIuLi9zcGFyay1wcm9wZXJ0aWVzL3NyYy93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9FbGVtZW50LmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Mb2FkZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9NaXhhYmxlLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvT3ZlcnJpZGVyLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvVXBkYXRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL2xpYnMuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9zcGFyay1zdGFydGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIEVsZW1lbnQsIEdyaWQsIEdyaWRDZWxsLCBHcmlkUm93O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkdyaWRDZWxsID0gcmVxdWlyZSgnLi9HcmlkQ2VsbCcpO1xuXG5HcmlkUm93ID0gcmVxdWlyZSgnLi9HcmlkUm93Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIHZhciByb3csIHNwb3Q7XG4gICAgICBpZiAoIWNlbGwpIHtcbiAgICAgICAgY2VsbCA9IG5ldyBHcmlkQ2VsbCgpO1xuICAgICAgfVxuICAgICAgc3BvdCA9IHRoaXMuZ2V0RnJlZVNwb3QoKTtcbiAgICAgIHJvdyA9IHRoaXMucm93cy5nZXQoc3BvdC5yb3cpO1xuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcm93ID0gdGhpcy5hZGRSb3coKTtcbiAgICAgIH1cbiAgICAgIHJvdy5hZGRDZWxsKGNlbGwpO1xuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuXG4gICAgYWRkUm93KHJvdyA9IG51bGwpIHtcbiAgICAgIGlmICghcm93KSB7XG4gICAgICAgIHJvdyA9IG5ldyBHcmlkUm93KCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJvd3MucHVzaChyb3cpO1xuICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBnZXRGcmVlU3BvdCgpIHtcbiAgICAgIHZhciBzcG90O1xuICAgICAgc3BvdCA9IG51bGw7XG4gICAgICB0aGlzLnJvd3Muc29tZSgocm93KSA9PiB7XG4gICAgICAgIGlmIChyb3cuY2VsbHMubGVuZ3RoIDwgdGhpcy5tYXhDb2x1bW5zKSB7XG4gICAgICAgICAgcmV0dXJuIHNwb3QgPSB7XG4gICAgICAgICAgICByb3c6IHJvdy5yb3dQb3NpdGlvbixcbiAgICAgICAgICAgIGNvbHVtbjogcm93LmNlbGxzLmxlbmd0aFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFzcG90KSB7XG4gICAgICAgIGlmICh0aGlzLm1heENvbHVtbnMgPiB0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogdGhpcy5yb3dzLmxlbmd0aCxcbiAgICAgICAgICAgIGNvbHVtbjogMFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogMCxcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5tYXhDb2x1bW5zICsgMVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzcG90O1xuICAgIH1cblxuICB9O1xuXG4gIEdyaWQucHJvcGVydGllcyh7XG4gICAgcm93czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICAgIGl0ZW1BZGRlZDogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiByb3cuZ3JpZCA9IHRoaXM7XG4gICAgICB9LFxuICAgICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICBpZiAocm93LmdyaWQgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gcm93LmdyaWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtYXhDb2x1bW5zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByb3dzO1xuICAgICAgICByb3dzID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnJvd3NQcm9wZXJ0eSk7XG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZShmdW5jdGlvbihtYXgsIHJvdykge1xuICAgICAgICAgIHJldHVybiBNYXRoLm1heChtYXgsIGludmFsaWRhdG9yLnByb3Aocm93LmNlbGxzUHJvcGVydHkpLmxlbmd0aCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWQ7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgRWxlbWVudCwgR3JpZENlbGw7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkQ2VsbCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZENlbGwgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG4gIEdyaWRDZWxsLnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdncmlkLnJvdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcm93OiB7fSxcbiAgICBjb2x1bW5Qb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgcm93O1xuICAgICAgICByb3cgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMucm93UHJvcGVydHkpO1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3Aocm93LmNlbGxzUHJvcGVydHkpLmluZGV4T2YodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHdpZHRoOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiAxIC8gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3Jvdy5jZWxscycpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxlZnQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AodGhpcy53aWR0aFByb3BlcnR5KSAqIGludmFsaWRhdG9yLnByb3AodGhpcy5jb2x1bW5Qb3NpdGlvblByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMud2lkdGhQcm9wZXJ0eSkgKiAoaW52YWxpZGF0b3IucHJvcCh0aGlzLmNvbHVtblBvc2l0aW9uUHJvcGVydHkpICsgMSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdyb3cuaGVpZ2h0Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3A6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdyb3cudG9wJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBib3R0b206IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKCdyb3cuYm90dG9tJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZENlbGw7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgRWxlbWVudCwgR3JpZENlbGwsIEdyaWRSb3c7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuR3JpZENlbGwgPSByZXF1aXJlKCcuL0dyaWRDZWxsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZFJvdyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZFJvdyBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIGlmICghY2VsbCkge1xuICAgICAgICBjZWxsID0gbmV3IEdyaWRDZWxsKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG5cbiAgfTtcblxuICBHcmlkUm93LnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHt9LFxuICAgIGNlbGxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihjZWxsKSB7XG4gICAgICAgIHJldHVybiBjZWxsLnJvdyA9IHRoaXM7XG4gICAgICB9LFxuICAgICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgaWYgKGNlbGwucm93ID09PSB0aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGNlbGwucm93ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcm93UG9zaXRpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIGdyaWQ7XG4gICAgICAgIGdyaWQgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMuZ3JpZFByb3BlcnR5KTtcbiAgICAgICAgaWYgKGdyaWQpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChncmlkLnJvd3NQcm9wZXJ0eSkuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiAxIC8gaW52YWxpZGF0b3IucHJvcFBhdGgoJ2dyaWQucm93cycpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvcDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLmhlaWdodFByb3BlcnR5KSAqIGludmFsaWRhdG9yLnByb3AodGhpcy5yb3dQb3NpdGlvblByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLmhlaWdodFByb3BlcnR5KSAqIChpbnZhbGlkYXRvci5wcm9wKHRoaXMucm93UG9zaXRpb25Qcm9wZXJ0eSkgKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkUm93O1xuXG59KS5jYWxsKHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiR3JpZFwiOiByZXF1aXJlKFwiLi9HcmlkXCIpLFxuICBcIkdyaWRDZWxsXCI6IHJlcXVpcmUoXCIuL0dyaWRDZWxsXCIpLFxuICBcIkdyaWRSb3dcIjogcmVxdWlyZShcIi4vR3JpZFJvd1wiKSxcbn0iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFBhdGhGaW5kZXI9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1BhdGhGaW5kZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1QYXRoRmluZGVyO31lbHNle2lmKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIiYmUGFyYWxsZWxpbyE9PW51bGwpe1BhcmFsbGVsaW8uUGF0aEZpbmRlcj1QYXRoRmluZGVyO31lbHNle2lmKHRoaXMuUGFyYWxsZWxpbz09bnVsbCl7dGhpcy5QYXJhbGxlbGlvPXt9O310aGlzLlBhcmFsbGVsaW8uUGF0aEZpbmRlcj1QYXRoRmluZGVyO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFBhdGhGaW5kZXI7XG5QYXRoRmluZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQYXRoRmluZGVyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IodGlsZXNDb250YWluZXIsIGZyb20xLCB0bzEsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMudGlsZXNDb250YWluZXIgPSB0aWxlc0NvbnRhaW5lcjtcbiAgICAgIHRoaXMuZnJvbSA9IGZyb20xO1xuICAgICAgdGhpcy50byA9IHRvMTtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgIGlmIChvcHRpb25zLnZhbGlkVGlsZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sgPSBvcHRpb25zLnZhbGlkVGlsZTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmFycml2ZWQgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFycml2ZWRDYWxsYmFjayA9IG9wdGlvbnMuYXJyaXZlZDtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmVmZmljaWVuY3kgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmVmZmljaWVuY3lDYWxsYmFjayA9IG9wdGlvbnMuZWZmaWNpZW5jeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgIHRoaXMucGF0aHMgPSB7fTtcbiAgICAgIHRoaXMuc29sdXRpb24gPSBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNhbGN1bCgpIHtcbiAgICAgIHdoaWxlICghdGhpcy5zb2x1dGlvbiAmJiAoIXRoaXMuc3RhcnRlZCB8fCB0aGlzLnF1ZXVlLmxlbmd0aCkpIHtcbiAgICAgICAgdGhpcy5zdGVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgc3RlcCgpIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgIG5leHQgPSB0aGlzLnF1ZXVlLnBvcCgpO1xuICAgICAgICB0aGlzLmFkZE5leHRTdGVwcyhuZXh0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgICBpZiAodGhpcy50byA9PT0gZmFsc2UgfHwgdGhpcy50aWxlSXNWYWxpZCh0aGlzLnRvKSkge1xuICAgICAgICB0aGlzLmFkZE5leHRTdGVwcygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQYXRoKCkge1xuICAgICAgdmFyIHJlcywgc3RlcDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHJlcyA9IFt0aGlzLnNvbHV0aW9uXTtcbiAgICAgICAgc3RlcCA9IHRoaXMuc29sdXRpb247XG4gICAgICAgIHdoaWxlIChzdGVwLnByZXYgIT0gbnVsbCkge1xuICAgICAgICAgIHJlcy51bnNoaWZ0KHN0ZXAucHJldik7XG4gICAgICAgICAgc3RlcCA9IHN0ZXAucHJldjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc0F0UHJjKHByYykge1xuICAgICAgaWYgKGlzTmFOKHByYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UG9zQXRUaW1lKHRoaXMuc29sdXRpb24uZ2V0VG90YWxMZW5ndGgoKSAqIHByYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UG9zQXRUaW1lKHRpbWUpIHtcbiAgICAgIHZhciBwcmMsIHN0ZXA7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICBpZiAodGltZSA+PSB0aGlzLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zb2x1dGlvbi5wb3NUb1RpbGVPZmZzZXQodGhpcy5zb2x1dGlvbi5nZXRFeGl0KCkueCwgdGhpcy5zb2x1dGlvbi5nZXRFeGl0KCkueSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RlcCA9IHRoaXMuc29sdXRpb247XG4gICAgICAgICAgd2hpbGUgKHN0ZXAuZ2V0U3RhcnRMZW5ndGgoKSA+IHRpbWUgJiYgKHN0ZXAucHJldiAhPSBudWxsKSkge1xuICAgICAgICAgICAgc3RlcCA9IHN0ZXAucHJldjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJjID0gKHRpbWUgLSBzdGVwLmdldFN0YXJ0TGVuZ3RoKCkpIC8gc3RlcC5nZXRMZW5ndGgoKTtcbiAgICAgICAgICByZXR1cm4gc3RlcC5wb3NUb1RpbGVPZmZzZXQoc3RlcC5nZXRFbnRyeSgpLnggKyAoc3RlcC5nZXRFeGl0KCkueCAtIHN0ZXAuZ2V0RW50cnkoKS54KSAqIHByYywgc3RlcC5nZXRFbnRyeSgpLnkgKyAoc3RlcC5nZXRFeGl0KCkueSAtIHN0ZXAuZ2V0RW50cnkoKS55KSAqIHByYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTb2x1dGlvblRpbGVMaXN0KCkge1xuICAgICAgdmFyIHN0ZXAsIHRpbGVsaXN0O1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgc3RlcCA9IHRoaXMuc29sdXRpb247XG4gICAgICAgIHRpbGVsaXN0ID0gW3N0ZXAudGlsZV07XG4gICAgICAgIHdoaWxlIChzdGVwLnByZXYgIT0gbnVsbCkge1xuICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgICAgdGlsZWxpc3QudW5zaGlmdChzdGVwLnRpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlbGlzdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aWxlSXNWYWxpZCh0aWxlKSB7XG4gICAgICBpZiAodGhpcy52YWxpZFRpbGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkVGlsZUNhbGxiYWNrKHRpbGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwpICYmICghdGlsZS5lbXVsYXRlZCB8fCAodGlsZS50aWxlICE9PSAwICYmIHRpbGUudGlsZSAhPT0gZmFsc2UpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUaWxlKHgsIHkpIHtcbiAgICAgIHZhciByZWYxO1xuICAgICAgaWYgKHRoaXMudGlsZXNDb250YWluZXIuZ2V0VGlsZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzQ29udGFpbmVyLmdldFRpbGUoeCwgeSk7XG4gICAgICB9IGVsc2UgaWYgKCgocmVmMSA9IHRoaXMudGlsZXNDb250YWluZXJbeV0pICE9IG51bGwgPyByZWYxW3hdIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogeCxcbiAgICAgICAgICB5OiB5LFxuICAgICAgICAgIHRpbGU6IHRoaXMudGlsZXNDb250YWluZXJbeV1beF0sXG4gICAgICAgICAgZW11bGF0ZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRDb25uZWN0ZWRUb1RpbGUodGlsZSkge1xuICAgICAgdmFyIGNvbm5lY3RlZCwgdDtcbiAgICAgIGlmICh0aWxlLmdldENvbm5lY3RlZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aWxlLmdldENvbm5lY3RlZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29ubmVjdGVkID0gW107XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCArIDEsIHRpbGUueSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLnggLSAxLCB0aWxlLnkpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54LCB0aWxlLnkgKyAxKSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCwgdGlsZS55IC0gMSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29ubmVjdGVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZE5leHRTdGVwcyhzdGVwID0gbnVsbCkge1xuICAgICAgdmFyIGksIGxlbiwgbmV4dCwgcmVmMSwgcmVzdWx0cywgdGlsZTtcbiAgICAgIHRpbGUgPSBzdGVwICE9IG51bGwgPyBzdGVwLm5leHRUaWxlIDogdGhpcy5mcm9tO1xuICAgICAgcmVmMSA9IHRoaXMuZ2V0Q29ubmVjdGVkVG9UaWxlKHRpbGUpO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmMS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBuZXh0ID0gcmVmMVtpXTtcbiAgICAgICAgaWYgKHRoaXMudGlsZUlzVmFsaWQobmV4dCkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hZGRTdGVwKG5ldyBQYXRoRmluZGVyLlN0ZXAodGhpcywgKHN0ZXAgIT0gbnVsbCA/IHN0ZXAgOiBudWxsKSwgdGlsZSwgbmV4dCkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgdGlsZUVxdWFsKHRpbGVBLCB0aWxlQikge1xuICAgICAgcmV0dXJuIHRpbGVBID09PSB0aWxlQiB8fCAoKHRpbGVBLmVtdWxhdGVkIHx8IHRpbGVCLmVtdWxhdGVkKSAmJiB0aWxlQS54ID09PSB0aWxlQi54ICYmIHRpbGVBLnkgPT09IHRpbGVCLnkpO1xuICAgIH1cblxuICAgIGFycml2ZWRBdERlc3RpbmF0aW9uKHN0ZXApIHtcbiAgICAgIGlmICh0aGlzLmFycml2ZWRDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFycml2ZWRDYWxsYmFjayhzdGVwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVFcXVhbChzdGVwLnRpbGUsIHRoaXMudG8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZFN0ZXAoc3RlcCkge1xuICAgICAgdmFyIHNvbHV0aW9uQ2FuZGlkYXRlO1xuICAgICAgaWYgKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdID0ge307XG4gICAgICB9XG4gICAgICBpZiAoISgodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSAhPSBudWxsKSAmJiB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldLmdldFRvdGFsTGVuZ3RoKCkgPD0gc3RlcC5nZXRUb3RhbExlbmd0aCgpKSkge1xuICAgICAgICBpZiAodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVTdGVwKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gPSBzdGVwO1xuICAgICAgICB0aGlzLnF1ZXVlLnNwbGljZSh0aGlzLmdldFN0ZXBSYW5rKHN0ZXApLCAwLCBzdGVwKTtcbiAgICAgICAgc29sdXRpb25DYW5kaWRhdGUgPSBuZXcgUGF0aEZpbmRlci5TdGVwKHRoaXMsIHN0ZXAsIHN0ZXAubmV4dFRpbGUsIG51bGwpO1xuICAgICAgICBpZiAodGhpcy5hcnJpdmVkQXREZXN0aW5hdGlvbihzb2x1dGlvbkNhbmRpZGF0ZSkgJiYgISgodGhpcy5zb2x1dGlvbiAhPSBudWxsKSAmJiB0aGlzLnNvbHV0aW9uLnByZXYuZ2V0VG90YWxMZW5ndGgoKSA8PSBzdGVwLmdldFRvdGFsTGVuZ3RoKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc29sdXRpb24gPSBzb2x1dGlvbkNhbmRpZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZVN0ZXAoc3RlcCkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaW5kZXggPSB0aGlzLnF1ZXVlLmluZGV4T2Yoc3RlcCk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGJlc3QoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZVt0aGlzLnF1ZXVlLmxlbmd0aCAtIDFdO1xuICAgIH1cblxuICAgIGdldFN0ZXBSYW5rKHN0ZXApIHtcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhzdGVwLmdldEVmZmljaWVuY3koKSwgMCwgdGhpcy5xdWV1ZS5sZW5ndGggLSAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0U3RlcFJhbmsoZWZmaWNpZW5jeSwgbWluLCBtYXgpIHtcbiAgICAgIHZhciByZWYsIHJlZlBvcztcbiAgICAgIHJlZlBvcyA9IE1hdGguZmxvb3IoKG1heCAtIG1pbikgLyAyKSArIG1pbjtcbiAgICAgIHJlZiA9IHRoaXMucXVldWVbcmVmUG9zXS5nZXRFZmZpY2llbmN5KCk7XG4gICAgICBpZiAocmVmID09PSBlZmZpY2llbmN5KSB7XG4gICAgICAgIHJldHVybiByZWZQb3M7XG4gICAgICB9IGVsc2UgaWYgKHJlZiA+IGVmZmljaWVuY3kpIHtcbiAgICAgICAgaWYgKHJlZlBvcyA9PT0gbWluKSB7XG4gICAgICAgICAgcmV0dXJuIG1pbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoZWZmaWNpZW5jeSwgbWluLCByZWZQb3MgLSAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlZlBvcyA9PT0gbWF4KSB7XG4gICAgICAgICAgcmV0dXJuIG1heCArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIHJlZlBvcyArIDEsIG1heCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBQYXRoRmluZGVyLnByb3BlcnRpZXMoe1xuICAgIHZhbGlkVGlsZUNhbGxiYWNrOiB7fVxuICB9KTtcblxuICByZXR1cm4gUGF0aEZpbmRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuUGF0aEZpbmRlci5TdGVwID0gY2xhc3MgU3RlcCB7XG4gIGNvbnN0cnVjdG9yKHBhdGhGaW5kZXIsIHByZXYsIHRpbGUxLCBuZXh0VGlsZSkge1xuICAgIHRoaXMucGF0aEZpbmRlciA9IHBhdGhGaW5kZXI7XG4gICAgdGhpcy5wcmV2ID0gcHJldjtcbiAgICB0aGlzLnRpbGUgPSB0aWxlMTtcbiAgICB0aGlzLm5leHRUaWxlID0gbmV4dFRpbGU7XG4gIH1cblxuICBwb3NUb1RpbGVPZmZzZXQoeCwgeSkge1xuICAgIHZhciB0aWxlO1xuICAgIHRpbGUgPSBNYXRoLmZsb29yKHgpID09PSB0aGlzLnRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLnRpbGUueSA/IHRoaXMudGlsZSA6ICh0aGlzLm5leHRUaWxlICE9IG51bGwpICYmIE1hdGguZmxvb3IoeCkgPT09IHRoaXMubmV4dFRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLm5leHRUaWxlLnkgPyB0aGlzLm5leHRUaWxlIDogKHRoaXMucHJldiAhPSBudWxsKSAmJiBNYXRoLmZsb29yKHgpID09PSB0aGlzLnByZXYudGlsZS54ICYmIE1hdGguZmxvb3IoeSkgPT09IHRoaXMucHJldi50aWxlLnkgPyB0aGlzLnByZXYudGlsZSA6IGNvbnNvbGUubG9nKCdNYXRoLmZsb29yKCcgKyB4ICsgJykgPT0gJyArIHRoaXMudGlsZS54LCAnTWF0aC5mbG9vcignICsgeSArICcpID09ICcgKyB0aGlzLnRpbGUueSwgdGhpcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgdGlsZTogdGlsZSxcbiAgICAgIG9mZnNldFg6IHggLSB0aWxlLngsXG4gICAgICBvZmZzZXRZOiB5IC0gdGlsZS55XG4gICAgfTtcbiAgfVxuXG4gIGdldEV4aXQoKSB7XG4gICAgaWYgKHRoaXMuZXhpdCA9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5uZXh0VGlsZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuZXhpdCA9IHtcbiAgICAgICAgICB4OiAodGhpcy50aWxlLnggKyB0aGlzLm5leHRUaWxlLnggKyAxKSAvIDIsXG4gICAgICAgICAgeTogKHRoaXMudGlsZS55ICsgdGhpcy5uZXh0VGlsZS55ICsgMSkgLyAyXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmV4aXQgPSB7XG4gICAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUsXG4gICAgICAgICAgeTogdGhpcy50aWxlLnkgKyAwLjVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhpdDtcbiAgfVxuXG4gIGdldEVudHJ5KCkge1xuICAgIGlmICh0aGlzLmVudHJ5ID09IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLnByZXYgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmVudHJ5ID0ge1xuICAgICAgICAgIHg6ICh0aGlzLnRpbGUueCArIHRoaXMucHJldi50aWxlLnggKyAxKSAvIDIsXG4gICAgICAgICAgeTogKHRoaXMudGlsZS55ICsgdGhpcy5wcmV2LnRpbGUueSArIDEpIC8gMlxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbnRyeSA9IHtcbiAgICAgICAgICB4OiB0aGlzLnRpbGUueCArIDAuNSxcbiAgICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbnRyeTtcbiAgfVxuXG4gIGdldExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPT0gbnVsbCkge1xuICAgICAgdGhpcy5sZW5ndGggPSAodGhpcy5uZXh0VGlsZSA9PSBudWxsKSB8fCAodGhpcy5wcmV2ID09IG51bGwpID8gMC41IDogdGhpcy5wcmV2LnRpbGUueCA9PT0gdGhpcy5uZXh0VGlsZS54IHx8IHRoaXMucHJldi50aWxlLnkgPT09IHRoaXMubmV4dFRpbGUueSA/IDEgOiBNYXRoLnNxcnQoMC41KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xuICB9XG5cbiAgZ2V0U3RhcnRMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMuc3RhcnRMZW5ndGggPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGFydExlbmd0aCA9IHRoaXMucHJldiAhPSBudWxsID8gdGhpcy5wcmV2LmdldFRvdGFsTGVuZ3RoKCkgOiAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGFydExlbmd0aDtcbiAgfVxuXG4gIGdldFRvdGFsTGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLnRvdGFsTGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMudG90YWxMZW5ndGggPSB0aGlzLmdldFN0YXJ0TGVuZ3RoKCkgKyB0aGlzLmdldExlbmd0aCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b3RhbExlbmd0aDtcbiAgfVxuXG4gIGdldEVmZmljaWVuY3koKSB7XG4gICAgaWYgKHRoaXMuZWZmaWNpZW5jeSA9PSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucGF0aEZpbmRlci5lZmZpY2llbmN5Q2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLmVmZmljaWVuY3kgPSB0aGlzLnBhdGhGaW5kZXIuZWZmaWNpZW5jeUNhbGxiYWNrKHRoaXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5ID0gLXRoaXMuZ2V0UmVtYWluaW5nKCkgKiAxLjEgLSB0aGlzLmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVmZmljaWVuY3k7XG4gIH1cblxuICBnZXRSZW1haW5pbmcoKSB7XG4gICAgdmFyIGZyb20sIHRvLCB4LCB5O1xuICAgIGlmICh0aGlzLnJlbWFpbmluZyA9PSBudWxsKSB7XG4gICAgICBmcm9tID0gdGhpcy5nZXRFeGl0KCk7XG4gICAgICB0byA9IHtcbiAgICAgICAgeDogdGhpcy5wYXRoRmluZGVyLnRvLnggKyAwLjUsXG4gICAgICAgIHk6IHRoaXMucGF0aEZpbmRlci50by55ICsgMC41XG4gICAgICB9O1xuICAgICAgeCA9IHRvLnggLSBmcm9tLng7XG4gICAgICB5ID0gdG8ueSAtIGZyb20ueTtcbiAgICAgIHRoaXMucmVtYWluaW5nID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW1haW5pbmc7XG4gIH1cblxufTtcblxucmV0dXJuKFBhdGhGaW5kZXIpO30pOyIsImlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgIGdyZWVrQWxwaGFiZXQ6IHJlcXVpcmUoJy4vc3RyaW5ncy9ncmVla0FscGhhYmV0JyksXG4gICAgICBzdGFyTmFtZXM6IHJlcXVpcmUoJy4vc3RyaW5ncy9zdGFyTmFtZXMnKVxuICB9O1xufSIsIm1vZHVsZS5leHBvcnRzPVtcblwiYWxwaGFcIiwgICBcImJldGFcIiwgICAgXCJnYW1tYVwiLCAgIFwiZGVsdGFcIixcblwiZXBzaWxvblwiLCBcInpldGFcIiwgICAgXCJldGFcIiwgICAgIFwidGhldGFcIixcblwiaW90YVwiLCAgICBcImthcHBhXCIsICAgXCJsYW1iZGFcIiwgIFwibXVcIixcblwibnVcIiwgICAgICBcInhpXCIsICAgICAgXCJvbWljcm9uXCIsIFwicGlcIixcdFxuXCJyaG9cIiwgICAgIFwic2lnbWFcIiwgICBcInRhdVwiLCAgICAgXCJ1cHNpbG9uXCIsXG5cInBoaVwiLCAgICAgXCJjaGlcIiwgICAgIFwicHNpXCIsICAgICBcIm9tZWdhXCJcbl0iLCJtb2R1bGUuZXhwb3J0cz1bXG5cIkFjaGVybmFyXCIsICAgICBcIk1haWFcIiwgICAgICAgIFwiQXRsYXNcIiwgICAgICAgIFwiU2FsbVwiLCAgICAgICBcIkFsbmlsYW1cIiwgICAgICBcIk5la2thclwiLCAgICAgIFwiRWxuYXRoXCIsICAgICAgIFwiVGh1YmFuXCIsXG5cIkFjaGlyZFwiLCAgICAgICBcIk1hcmZpa1wiLCAgICAgIFwiQXV2YVwiLCAgICAgICAgIFwiU2FyZ2FzXCIsICAgICBcIkFsbml0YWtcIiwgICAgICBcIk5paGFsXCIsICAgICAgIFwiRW5pZlwiLCAgICAgICAgIFwiVG9yY3VsYXJpc1wiLFxuXCJBY3J1eFwiLCAgICAgICAgXCJNYXJrYWJcIiwgICAgICBcIkF2aW9yXCIsICAgICAgICBcIlNhcmluXCIsICAgICAgXCJBbHBoYXJkXCIsICAgICAgXCJOdW5raVwiLCAgICAgICBcIkV0YW1pblwiLCAgICAgICBcIlR1cmFpc1wiLFxuXCJBY3ViZW5zXCIsICAgICAgXCJNYXRhclwiLCAgICAgICBcIkF6ZWxmYWZhZ2VcIiwgICBcIlNjZXB0cnVtXCIsICAgXCJBbHBoZWtrYVwiLCAgICAgXCJOdXNha2FuXCIsICAgICBcIkZvbWFsaGF1dFwiLCAgICBcIlR5bFwiLFxuXCJBZGFyYVwiLCAgICAgICAgXCJNZWJzdXRhXCIsICAgICBcIkF6aGFcIiwgICAgICAgICBcIlNjaGVhdFwiLCAgICAgXCJBbHBoZXJhdHpcIiwgICAgXCJQZWFjb2NrXCIsICAgICBcIkZvcm5hY2lzXCIsICAgICBcIlVudWthbGhhaVwiLFxuXCJBZGhhZmVyYVwiLCAgICAgXCJNZWdyZXpcIiwgICAgICBcIkF6bWlkaXNrZVwiLCAgICBcIlNlZ2luXCIsICAgICAgXCJBbHJhaVwiLCAgICAgICAgXCJQaGFkXCIsICAgICAgICBcIkZ1cnVkXCIsICAgICAgICBcIlZlZ2FcIixcblwiQWRoaWxcIiwgICAgICAgIFwiTWVpc3NhXCIsICAgICAgXCJCYWhhbVwiLCAgICAgICAgXCJTZWdpbnVzXCIsICAgIFwiQWxyaXNoYVwiLCAgICAgIFwiUGhhZXRcIiwgICAgICAgXCJHYWNydXhcIiwgICAgICAgXCJWaW5kZW1pYXRyaXhcIixcblwiQWdlbmFcIiwgICAgICAgIFwiTWVrYnVkYVwiLCAgICAgXCJCZWNydXhcIiwgICAgICAgXCJTaGFtXCIsICAgICAgIFwiQWxzYWZpXCIsICAgICAgIFwiUGhlcmthZFwiLCAgICAgXCJHaWFuZmFyXCIsICAgICAgXCJXYXNhdFwiLFxuXCJBbGFkZmFyXCIsICAgICAgXCJNZW5rYWxpbmFuXCIsICBcIkJlaWRcIiwgICAgICAgICBcIlNoYXJhdGFuXCIsICAgXCJBbHNjaWF1a2F0XCIsICAgXCJQbGVpb25lXCIsICAgICBcIkdvbWVpc2FcIiwgICAgICBcIldlemVuXCIsXG5cIkFsYXRoZmFyXCIsICAgICBcIk1lbmthclwiLCAgICAgIFwiQmVsbGF0cml4XCIsICAgIFwiU2hhdWxhXCIsICAgICBcIkFsc2hhaW5cIiwgICAgICBcIlBvbGFyaXNcIiwgICAgIFwiR3JhZmZpYXNcIiwgICAgIFwiV2V6blwiLFxuXCJBbGJhbGRhaFwiLCAgICAgXCJNZW5rZW50XCIsICAgICBcIkJldGVsZ2V1c2VcIiwgICBcIlNoZWRpclwiLCAgICAgXCJBbHNoYXRcIiwgICAgICAgXCJQb2xsdXhcIiwgICAgICBcIkdyYWZpYXNcIiwgICAgICBcIlllZFwiLFxuXCJBbGJhbGlcIiwgICAgICAgXCJNZW5raWJcIiwgICAgICBcIkJvdGVpblwiLCAgICAgICBcIlNoZWxpYWtcIiwgICAgXCJBbHN1aGFpbFwiLCAgICAgXCJQb3JyaW1hXCIsICAgICBcIkdydW1pdW1cIiwgICAgICBcIllpbGR1blwiLFxuXCJBbGJpcmVvXCIsICAgICAgXCJNZXJha1wiLCAgICAgICBcIkJyYWNoaXVtXCIsICAgICBcIlNpcml1c1wiLCAgICAgXCJBbHRhaXJcIiwgICAgICAgXCJQcmFlY2lwdWFcIiwgICBcIkhhZGFyXCIsICAgICAgICBcIlphbmlhaFwiLFxuXCJBbGNoaWJhXCIsICAgICAgXCJNZXJnYVwiLCAgICAgICBcIkNhbm9wdXNcIiwgICAgICBcIlNpdHVsYVwiLCAgICAgXCJBbHRhcmZcIiwgICAgICAgXCJQcm9jeW9uXCIsICAgICBcIkhhZWRpXCIsICAgICAgICBcIlphdXJha1wiLFxuXCJBbGNvclwiLCAgICAgICAgXCJNZXJvcGVcIiwgICAgICBcIkNhcGVsbGFcIiwgICAgICBcIlNrYXRcIiwgICAgICAgXCJBbHRlcmZcIiwgICAgICAgXCJQcm9wdXNcIiwgICAgICBcIkhhbWFsXCIsICAgICAgICBcIlphdmlqYWhcIixcblwiQWxjeW9uZVwiLCAgICAgIFwiTWVzYXJ0aGltXCIsICAgXCJDYXBoXCIsICAgICAgICAgXCJTcGljYVwiLCAgICAgIFwiQWx1ZHJhXCIsICAgICAgIFwiUmFuYVwiLCAgICAgICAgXCJIYXNzYWxlaFwiLCAgICAgXCJaaWJhbFwiLFxuXCJBbGRlcmFtaW5cIiwgICAgXCJNZXRhbGxhaFwiLCAgICBcIkNhc3RvclwiLCAgICAgICBcIlN0ZXJvcGVcIiwgICAgXCJBbHVsYVwiLCAgICAgICAgXCJSYXNcIiwgICAgICAgICBcIkhlemVcIiwgICAgICAgICBcIlpvc21hXCIsXG5cIkFsZGhpYmFoXCIsICAgICBcIk1pYXBsYWNpZHVzXCIsIFwiQ2ViYWxyYWlcIiwgICAgIFwiU3VhbG9jaW5cIiwgICBcIkFseWFcIiwgICAgICAgICBcIlJhc2FsZ2V0aGlcIiwgIFwiSG9lZHVzXCIsICAgICAgIFwiQXF1YXJpdXNcIixcblwiQWxmaXJrXCIsICAgICAgIFwiTWlua2FyXCIsICAgICAgXCJDZWxhZW5vXCIsICAgICAgXCJTdWJyYVwiLCAgICAgIFwiQWx6aXJyXCIsICAgICAgIFwiUmFzYWxoYWd1ZVwiLCAgXCJIb21hbVwiLCAgICAgICAgXCJBcmllc1wiLFxuXCJBbGdlbmliXCIsICAgICAgXCJNaW50YWthXCIsICAgICBcIkNoYXJhXCIsICAgICAgICBcIlN1aGFpbFwiLCAgICAgXCJBbmNoYVwiLCAgICAgICAgXCJSYXN0YWJhblwiLCAgICBcIkh5YWR1bVwiLCAgICAgICBcIkNlcGhldXNcIixcblwiQWxnaWViYVwiLCAgICAgIFwiTWlyYVwiLCAgICAgICAgXCJDaG9ydFwiLCAgICAgICAgXCJTdWxhZmF0XCIsICAgIFwiQW5nZXRlbmFyXCIsICAgIFwiUmVndWx1c1wiLCAgICAgXCJJemFyXCIsICAgICAgICAgXCJDZXR1c1wiLFxuXCJBbGdvbFwiLCAgICAgICAgXCJNaXJhY2hcIiwgICAgICBcIkN1cnNhXCIsICAgICAgICBcIlN5cm1hXCIsICAgICAgXCJBbmthYVwiLCAgICAgICAgXCJSaWdlbFwiLCAgICAgICBcIkphYmJhaFwiLCAgICAgICBcIkNvbHVtYmFcIixcblwiQWxnb3JhYlwiLCAgICAgIFwiTWlyYW1cIiwgICAgICAgXCJEYWJpaFwiLCAgICAgICAgXCJUYWJpdFwiLCAgICAgIFwiQW5zZXJcIiwgICAgICAgIFwiUm90YW5ldlwiLCAgICAgXCJLYWphbVwiLCAgICAgICAgXCJDb21hXCIsXG5cIkFsaGVuYVwiLCAgICAgICBcIk1pcnBoYWtcIiwgICAgIFwiRGVuZWJcIiwgICAgICAgIFwiVGFsaXRoYVwiLCAgICBcIkFudGFyZXNcIiwgICAgICBcIlJ1Y2hiYVwiLCAgICAgIFwiS2F1c1wiLCAgICAgICAgIFwiQ29yb25hXCIsXG5cIkFsaW90aFwiLCAgICAgICBcIk1pemFyXCIsICAgICAgIFwiRGVuZWJvbGFcIiwgICAgIFwiVGFuaWFcIiwgICAgICBcIkFyY3R1cnVzXCIsICAgICBcIlJ1Y2hiYWhcIiwgICAgIFwiS2VpZFwiLCAgICAgICAgIFwiQ3J1eFwiLFxuXCJBbGthaWRcIiwgICAgICAgXCJNdWZyaWRcIiwgICAgICBcIkRoZW5lYlwiLCAgICAgICBcIlRhcmF6ZWRcIiwgICAgXCJBcmthYlwiLCAgICAgICAgXCJSdWtiYXRcIiwgICAgICBcIktpdGFscGhhXCIsICAgICBcIkRyYWNvXCIsXG5cIkFsa2FsdXJvcHNcIiwgICBcIk11bGlwaGVuXCIsICAgIFwiRGlhZGVtXCIsICAgICAgIFwiVGF5Z2V0YVwiLCAgICBcIkFybmViXCIsICAgICAgICBcIlNhYmlrXCIsICAgICAgIFwiS29jYWJcIiwgICAgICAgIFwiR3J1c1wiLFxuXCJBbGtlc1wiLCAgICAgICAgXCJNdXJ6aW1cIiwgICAgICBcIkRpcGhkYVwiLCAgICAgICBcIlRlZ21lblwiLCAgICAgXCJBcnJha2lzXCIsICAgICAgXCJTYWRhbGFjaGJpYVwiLCBcIktvcm5lcGhvcm9zXCIsICBcIkh5ZHJhXCIsXG5cIkFsa3VyaGFoXCIsICAgICBcIk11c2NpZGFcIiwgICAgIFwiRHNjaHViYmFcIiwgICAgIFwiVGVqYXRcIiwgICAgICBcIkFzY2VsbGFcIiwgICAgICBcIlNhZGFsbWVsaWtcIiwgIFwiS3JhelwiLCAgICAgICAgIFwiTGFjZXJ0YVwiLFxuXCJBbG1hYWtcIiwgICAgICAgXCJOYW9zXCIsICAgICAgICBcIkRzaWJhblwiLCAgICAgICBcIlRlcmViZWxsdW1cIiwgXCJBc2VsbHVzXCIsICAgICAgXCJTYWRhbHN1dWRcIiwgICBcIkt1bWFcIiwgICAgICAgICBcIk1lbnNhXCIsXG5cIkFsbmFpclwiLCAgICAgICBcIk5hc2hcIiwgICAgICAgIFwiRHViaGVcIiwgICAgICAgIFwiVGhhYml0XCIsICAgICBcIkFzdGVyb3BlXCIsICAgICBcIlNhZHJcIiwgICAgICAgIFwiTGVzYXRoXCIsICAgICAgIFwiTWFhc3ltXCIsXG5cIkFsbmF0aFwiLCAgICAgICBcIk5hc2hpcmFcIiwgICAgIFwiRWxlY3RyYVwiLCAgICAgIFwiVGhlZW1pbVwiLCAgICBcIkF0aWtcIiwgICAgICAgICBcIlNhaXBoXCIsICAgICAgIFwiUGhvZW5peFwiLCAgICAgIFwiTm9ybWFcIlxuXSIsInZhciBEaXJlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0aW9uID0gY2xhc3MgRGlyZWN0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZSwgeCwgeSwgaW52ZXJzZU5hbWUpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmludmVyc2VOYW1lID0gaW52ZXJzZU5hbWU7XG4gIH1cblxuICBnZXRJbnZlcnNlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yW3RoaXMuaW52ZXJzZU5hbWVdO1xuICB9XG5cbn07XG5cbkRpcmVjdGlvbi51cCA9IG5ldyBEaXJlY3Rpb24oJ3VwJywgMCwgLTEsICdkb3duJyk7XG5cbkRpcmVjdGlvbi5kb3duID0gbmV3IERpcmVjdGlvbignZG93bicsIDAsIDEsICd1cCcpO1xuXG5EaXJlY3Rpb24ubGVmdCA9IG5ldyBEaXJlY3Rpb24oJ2xlZnQnLCAtMSwgMCwgJ3JpZ2h0Jyk7XG5cbkRpcmVjdGlvbi5yaWdodCA9IG5ldyBEaXJlY3Rpb24oJ3JpZ2h0JywgMSwgMCwgJ2xlZnQnKTtcblxuRGlyZWN0aW9uLmFkamFjZW50cyA9IFtEaXJlY3Rpb24udXAsIERpcmVjdGlvbi5kb3duLCBEaXJlY3Rpb24ubGVmdCwgRGlyZWN0aW9uLnJpZ2h0XTtcblxuRGlyZWN0aW9uLnRvcExlZnQgPSBuZXcgRGlyZWN0aW9uKCd0b3BMZWZ0JywgLTEsIC0xLCAnYm90dG9tUmlnaHQnKTtcblxuRGlyZWN0aW9uLnRvcFJpZ2h0ID0gbmV3IERpcmVjdGlvbigndG9wUmlnaHQnLCAxLCAtMSwgJ2JvdHRvbUxlZnQnKTtcblxuRGlyZWN0aW9uLmJvdHRvbVJpZ2h0ID0gbmV3IERpcmVjdGlvbignYm90dG9tUmlnaHQnLCAxLCAxLCAndG9wTGVmdCcpO1xuXG5EaXJlY3Rpb24uYm90dG9tTGVmdCA9IG5ldyBEaXJlY3Rpb24oJ2JvdHRvbUxlZnQnLCAtMSwgMSwgJ3RvcFJpZ2h0Jyk7XG5cbkRpcmVjdGlvbi5jb3JuZXJzID0gW0RpcmVjdGlvbi50b3BMZWZ0LCBEaXJlY3Rpb24udG9wUmlnaHQsIERpcmVjdGlvbi5ib3R0b21SaWdodCwgRGlyZWN0aW9uLmJvdHRvbUxlZnRdO1xuXG5EaXJlY3Rpb24uYWxsID0gW0RpcmVjdGlvbi51cCwgRGlyZWN0aW9uLmRvd24sIERpcmVjdGlvbi5sZWZ0LCBEaXJlY3Rpb24ucmlnaHQsIERpcmVjdGlvbi50b3BMZWZ0LCBEaXJlY3Rpb24udG9wUmlnaHQsIERpcmVjdGlvbi5ib3R0b21SaWdodCwgRGlyZWN0aW9uLmJvdHRvbUxlZnRdO1xuIiwidmFyIERpcmVjdGlvbiwgRWxlbWVudCwgVGlsZTtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCcuL0RpcmVjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih4MSwgeTEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnggPSB4MTtcbiAgICAgIHRoaXMueSA9IHkxO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHZhciBjb250YWluZXI7XG4gICAgICByZXR1cm4gY29udGFpbmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRSZWxhdGl2ZVRpbGUoeCwgeSkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmdldFRpbGUodGhpcy54ICsgeCwgdGhpcy55ICsgeSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmluZERpcmVjdGlvbk9mKHRpbGUpIHtcbiAgICAgIGlmICh0aWxlLnRpbGUpIHtcbiAgICAgICAgdGlsZSA9IHRpbGUudGlsZTtcbiAgICAgIH1cbiAgICAgIGlmICgodGlsZS54ICE9IG51bGwpICYmICh0aWxlLnkgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZmluZCgoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBkLnggPT09IHRpbGUueCAtIHRoaXMueCAmJiBkLnkgPT09IHRpbGUueSAtIHRoaXMueTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQoY2hpbGQsIGNoZWNrUmVmID0gdHJ1ZSkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgICAgaWYgKGNoZWNrUmVmKSB7XG4gICAgICAgIGNoaWxkLnRpbGUgPSB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkKGNoaWxkLCBjaGVja1JlZiA9IHRydWUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGVja1JlZiAmJiBjaGlsZC50aWxlID09PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiBjaGlsZC50aWxlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkaXN0KHRpbGUpIHtcbiAgICAgIHZhciBjdG5EaXN0LCByZWYsIHgsIHk7XG4gICAgICBpZiAoKHRpbGUgIT0gbnVsbCA/IHRpbGUuZ2V0RmluYWxUaWxlIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCgodGlsZSAhPSBudWxsID8gdGlsZS54IDogdm9pZCAwKSAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpICYmICh0aGlzLnggIT0gbnVsbCkgJiYgKHRoaXMueSAhPSBudWxsKSAmJiAodGhpcy5jb250YWluZXIgPT09IHRpbGUuY29udGFpbmVyIHx8IChjdG5EaXN0ID0gKHJlZiA9IHRoaXMuY29udGFpbmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kaXN0ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGlzdCh0aWxlLmNvbnRhaW5lcikgOiB2b2lkIDAgOiB2b2lkIDApKSkge1xuICAgICAgICB4ID0gdGlsZS54IC0gdGhpcy54O1xuICAgICAgICB5ID0gdGlsZS55IC0gdGhpcy55O1xuICAgICAgICBpZiAoY3RuRGlzdCkge1xuICAgICAgICAgIHggKz0gY3RuRGlzdC54O1xuICAgICAgICAgIHkgKz0gY3RuRGlzdC55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogeCxcbiAgICAgICAgICB5OiB5LFxuICAgICAgICAgIGxlbmd0aDogTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRGaW5hbFRpbGUoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlLnByb3BlcnRpZXMoe1xuICAgIGNoaWxkcmVuOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBjb250YWluZXI6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lciAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRqYWNlbnRUaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aWxlLmFkamFjZW50VGlsZXNQcm9wZXJ0eS5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGFkamFjZW50VGlsZXM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIGlmIChpbnZhbGlkYXRpb24ucHJvcCh0aGlzLmNvbnRhaW5lclByb3BlcnR5KSkge1xuICAgICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWRqYWNlbnRzLm1hcCgoZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpdmVUaWxlKGQueCwgZC55KTtcbiAgICAgICAgICB9KS5maWx0ZXIoKHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBFbGVtZW50LCBUaWxlQ29udGFpbmVyLCBUaWxlUmVmZXJlbmNlO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCcuL1RpbGVSZWZlcmVuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlQ29udGFpbmVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlQ29udGFpbmVyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpIHtcbiAgICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgdGlsZS55IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgYm91bmRhcmllcy50b3AgPSB0aWxlLnk7XG4gICAgICB9XG4gICAgICBpZiAoKGJvdW5kYXJpZXMubGVmdCA9PSBudWxsKSB8fCB0aWxlLnggPCBib3VuZGFyaWVzLmxlZnQpIHtcbiAgICAgICAgYm91bmRhcmllcy5sZWZ0ID0gdGlsZS54O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB0aWxlLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHRpbGUueTtcbiAgICAgIH1cbiAgICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCB0aWxlLnggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzLnJpZ2h0ID0gdGlsZS54O1xuICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLmNvb3JkcyA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXMudGlsZXMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGRUaWxlKHRpbGUpIHtcbiAgICAgIGlmICghdGhpcy50aWxlcy5pbmNsdWRlcyh0aWxlKSkge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIGlmICh0aGlzLmNvb3Jkc1t0aWxlLnhdID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNvb3Jkc1t0aWxlLnhdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldID0gdGlsZTtcbiAgICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYm91bmRhcmllc1Byb3BlcnR5LmdldHRlci5jYWxjdWxhdGVkKSB7XG4gICAgICAgICAgdGhpcy5fYWRkVG9Cb25kYXJpZXModGlsZSwgdGhpcy5ib3VuZGFyaWVzUHJvcGVydHkudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZW1vdmVUaWxlKHRpbGUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy50aWxlcy5pbmRleE9mKHRpbGUpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBkZWxldGUgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldO1xuICAgICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ib3VuZGFyaWVzUHJvcGVydHkuZ2V0dGVyLmNhbGN1bGF0ZWQpIHtcbiAgICAgICAgICBpZiAodGhpcy5ib3VuZGFyaWVzLnRvcCA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5ib3R0b20gPT09IHRpbGUueSB8fCB0aGlzLmJvdW5kYXJpZXMubGVmdCA9PT0gdGlsZS54IHx8IHRoaXMuYm91bmRhcmllcy5yaWdodCA9PT0gdGlsZS54KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib3VuZGFyaWVzUHJvcGVydHkuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZVRpbGVBdCh4LCB5KSB7XG4gICAgICB2YXIgdGlsZTtcbiAgICAgIGlmICh0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZVRpbGUodGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCgocmVmID0gdGhpcy5jb29yZHNbeF0pICE9IG51bGwgPyByZWZbeV0gOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29vcmRzW3hdW3ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRNYXRyaXgobWF0cml4KSB7XG4gICAgICB2YXIgb3B0aW9ucywgcm93LCB0aWxlLCB4LCB5O1xuICAgICAgZm9yICh5IGluIG1hdHJpeCkge1xuICAgICAgICByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgIGZvciAoeCBpbiByb3cpIHtcbiAgICAgICAgICB0aWxlID0gcm93W3hdO1xuICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB4OiBwYXJzZUludCh4KSxcbiAgICAgICAgICAgIHk6IHBhcnNlSW50KHkpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhpcy5hZGRUaWxlKHRpbGUob3B0aW9ucykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWxlLnggPSBvcHRpb25zLng7XG4gICAgICAgICAgICB0aWxlLnkgPSBvcHRpb25zLnk7XG4gICAgICAgICAgICB0aGlzLmFkZFRpbGUodGlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpblJhbmdlKHRpbGUsIHJhbmdlKSB7XG4gICAgICB2YXIgZm91bmQsIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgdGlsZXMsIHgsIHk7XG4gICAgICB0aWxlcyA9IFtdO1xuICAgICAgcmFuZ2UtLTtcbiAgICAgIGZvciAoeCA9IGkgPSByZWYgPSB0aWxlLnggLSByYW5nZSwgcmVmMSA9IHRpbGUueCArIHJhbmdlOyAocmVmIDw9IHJlZjEgPyBpIDw9IHJlZjEgOiBpID49IHJlZjEpOyB4ID0gcmVmIDw9IHJlZjEgPyArK2kgOiAtLWkpIHtcbiAgICAgICAgZm9yICh5ID0gaiA9IHJlZjIgPSB0aWxlLnkgLSByYW5nZSwgcmVmMyA9IHRpbGUueSArIHJhbmdlOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeSA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICAgIGlmIChNYXRoLnNxcnQoKHggLSB0aWxlLngpICogKHggLSB0aWxlLngpICsgKHkgLSB0aWxlLnkpICogKHkgLSB0aWxlLnkpKSA8PSByYW5nZSAmJiAoKGZvdW5kID0gdGhpcy5nZXRUaWxlKHgsIHkpKSAhPSBudWxsKSkge1xuICAgICAgICAgICAgdGlsZXMucHVzaChmb3VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgYWxsVGlsZXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy50aWxlcy5zbGljZSgpO1xuICAgIH1cblxuICAgIGNsZWFyQWxsKCkge1xuICAgICAgdmFyIGksIGxlbiwgcmVmLCB0aWxlO1xuICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgcmVmID0gdGhpcy50aWxlcztcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdGlsZSA9IHJlZltpXTtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY29vcmRzID0ge307XG4gICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9zZXN0KG9yaWdpblRpbGUsIGZpbHRlcikge1xuICAgICAgdmFyIGNhbmRpZGF0ZXMsIGdldFNjb3JlO1xuICAgICAgZ2V0U2NvcmUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5zY29yZSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5zY29yZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLnNjb3JlID0gY2FuZGlkYXRlLmdldEZpbmFsVGlsZSgpLmRpc3Qob3JpZ2luVGlsZSkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2FuZGlkYXRlcyA9IHRoaXMudGlsZXMuZmlsdGVyKGZpbHRlcikubWFwKCh0KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZVJlZmVyZW5jZSh0KTtcbiAgICAgIH0pO1xuICAgICAgY2FuZGlkYXRlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRTY29yZShhKSAtIGdldFNjb3JlKGIpO1xuICAgICAgfSk7XG4gICAgICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzWzBdLnRpbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5KCkge1xuICAgICAgdmFyIG91dDtcbiAgICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICBvdXQuY29vcmRzID0gdGhpcy5jb29yZHM7XG4gICAgICBvdXQudGlsZXMgPSB0aGlzLnRpbGVzO1xuICAgICAgb3V0Lm93bmVyID0gZmFsc2U7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIG1lcmdlKGN0biwgbWVyZ2VGbiwgYXNPd25lciA9IGZhbHNlKSB7XG4gICAgICB2YXIgb3V0LCB0bXA7XG4gICAgICBvdXQgPSBuZXcgVGlsZUNvbnRhaW5lcigpO1xuICAgICAgb3V0Lm93bmVyID0gYXNPd25lcjtcbiAgICAgIHRtcCA9IGN0bi5jb3B5KCk7XG4gICAgICB0aGlzLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUEpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGUsIHRpbGVCO1xuICAgICAgICB0aWxlQiA9IHRtcC5nZXRUaWxlKHRpbGVBLngsIHRpbGVBLnkpO1xuICAgICAgICBpZiAodGlsZUIpIHtcbiAgICAgICAgICB0bXAucmVtb3ZlVGlsZSh0aWxlQik7XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4odGlsZUEsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdG1wLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUIpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGU7XG4gICAgICAgIG1lcmdlZFRpbGUgPSBtZXJnZUZuKG51bGwsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlQ29udGFpbmVyLnByb3BlcnRpZXMoe1xuICAgIG93bmVyOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBib3VuZGFyaWVzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYm91bmRhcmllcztcbiAgICAgICAgYm91bmRhcmllcyA9IHtcbiAgICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgICAgbGVmdDogbnVsbCxcbiAgICAgICAgICBib3R0b206IG51bGwsXG4gICAgICAgICAgcmlnaHQ6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZUNvbnRhaW5lcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBUaWxlUmVmZXJlbmNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVSZWZlcmVuY2UgPSBjbGFzcyBUaWxlUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IodGlsZSkge1xuICAgIHRoaXMudGlsZSA9IHRpbGU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgeDoge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaW5hbFRpbGUoKS54O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeToge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGaW5hbFRpbGUoKS55O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRGaW5hbFRpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgfVxuXG59O1xuIiwidmFyIEVsZW1lbnQsIFRpbGVkO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZWQgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgcHV0T25SYW5kb21UaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgZm91bmQ7XG4gICAgICBmb3VuZCA9IHRoaXMuZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKTtcbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlID0gZm91bmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgY2FuZGlkYXRlLCBwb3MsIHJlbWFpbmluZztcbiAgICAgIHJlbWFpbmluZyA9IHRpbGVzLnNsaWNlKCk7XG4gICAgICB3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcG9zID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcmVtYWluaW5nLmxlbmd0aCk7XG4gICAgICAgIGNhbmRpZGF0ZSA9IHJlbWFpbmluZy5zcGxpY2UocG9zLCAxKVswXTtcbiAgICAgICAgaWYgKHRoaXMuY2FuR29PblRpbGUoY2FuZGlkYXRlKSkge1xuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNhbkdvT25UaWxlKHRpbGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldEZpbmFsVGlsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZWQucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbih2YWwsIG9sZCkge1xuICAgICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgICBvbGQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRpbGUuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIG9mZnNldFk6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkRpcmVjdGlvblwiOiByZXF1aXJlKFwiLi9EaXJlY3Rpb25cIiksXG4gIFwiVGlsZVwiOiByZXF1aXJlKFwiLi9UaWxlXCIpLFxuICBcIlRpbGVDb250YWluZXJcIjogcmVxdWlyZShcIi4vVGlsZUNvbnRhaW5lclwiKSxcbiAgXCJUaWxlUmVmZXJlbmNlXCI6IHJlcXVpcmUoXCIuL1RpbGVSZWZlcmVuY2VcIiksXG4gIFwiVGlsZWRcIjogcmVxdWlyZShcIi4vVGlsZWRcIiksXG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaW1pbmc9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbWluZy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbWluZzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaW1pbmc9VGltaW5nO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFRpbWluZztcblRpbWluZyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGltaW5nIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgdG9nZ2xlKHZhbCkge1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdmFsID0gIXRoaXMucnVubmluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJ1bm5pbmcgPSB2YWw7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZSkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yLlRpbWVyKHtcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICB0aW1pbmc6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEludGVydmFsKGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIoe1xuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgIHJlcGVhdDogdHJ1ZSxcbiAgICAgICAgdGltaW5nOiB0aGlzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaW1pbmcucHJvcGVydGllcyh7XG4gICAgcnVubmluZzoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFRpbWluZztcblxufSkuY2FsbCh0aGlzKTtcblxuVGltaW5nLlRpbWVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaW1lciBleHRlbmRzIEVsZW1lbnQge1xuICAgIHRvZ2dsZSh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHZhbCA9ICF0aGlzLnBhdXNlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBhdXNlZCA9IHZhbDtcbiAgICB9XG5cbiAgICBpbW1lZGlhdGVJbnZhbGlkYXRpb24oKSB7XG4gICAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuaW52YWxpZGF0ZSh7XG4gICAgICAgICAgcHJldmVudEltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW46IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2dnbGUodHJ1ZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuY29uc3RydWN0b3Iubm93KCk7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQgPSBzZXRJbnRlcnZhbCh0aGlzLnRpY2suYmluZCh0aGlzKSwgdGhpcy5yZW1haW5pbmdUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlkID0gc2V0VGltZW91dCh0aGlzLnRpY2suYmluZCh0aGlzKSwgdGhpcy5yZW1haW5pbmdUaW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wKCkge1xuICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gKHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSk7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgcmV0dXJuIGNsZWFySW50ZXJ2YWwodGhpcy5pZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBub3coKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdyAhPT0gbnVsbCA/IChyZWYgPSB3aW5kb3cucGVyZm9ybWFuY2UpICE9IG51bGwgPyByZWYubm93IDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsID8gcHJvY2Vzcy51cHRpbWUgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MudXB0aW1lKCkgKiAxMDAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgIHRoaXMucmVwZXRpdGlvbiArPSAxO1xuICAgICAgaWYgKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5vdygpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbWFpbmluZ1RpbWUgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICB9O1xuXG4gIFRpbWVyLnByb3BlcnRpZXMoe1xuICAgIHRpbWU6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIHBhdXNlZDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJ1bm5pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRvci5wcm9wKHRoaXMucGF1c2VkUHJvcGVydHkpICYmIGludmFsaWRhdG9yLnByb3BQYXRoKCd0aW1pbmcucnVubmluZycpICE9PSBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKHZhbCwgb2xkKSB7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICB9IGVsc2UgaWYgKG9sZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBlbGFwc2VkVGltZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IucHJvcCh0aGlzLnJ1bm5pbmdQcm9wZXJ0eSkpIHtcbiAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1tZWRpYXRlSW52YWxpZGF0aW9uKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSArIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50aW1lIC0gdGhpcy5yZW1haW5pbmdUaW1lO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIHRoaXMucmVtYWluaW5nVGltZSA9IHRoaXMudGltZSAtIHZhbDtcbiAgICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdUaW1lIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRpY2soKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gdmFsO1xuICAgICAgICAgIHJldHVybiB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuaW52YWxpZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AodGhpcy5lbGFwc2VkVGltZVByb3BlcnR5KSAvIHRoaXMudGltZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMudGltZSAqIHZhbDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbWFpbmluZ1RpbWU6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcGVhdDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJlcGV0aXRpb246IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIGNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGltZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihUaW1pbmcpO30pOyIsInZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBDb25uZWN0ZWQsIEVsZW1lbnQsIFNpZ25hbE9wZXJhdGlvbjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5TaWduYWxPcGVyYXRpb24gPSByZXF1aXJlKCcuL1NpZ25hbE9wZXJhdGlvbicpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdGVkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb25uZWN0ZWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRhcmdldC5hZGRTaWduYWwgPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9XG5cbiAgICBhY2NlcHRTaWduYWwoc2lnbmFsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBvbkFkZENvbm5lY3Rpb24oY29ubikge31cblxuICAgIG9uUmVtb3ZlQ29ubmVjdGlvbihjb25uKSB7fVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCkge31cblxuICAgIG9uQWRkU2lnbmFsKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZW1vdmVTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlcGxhY2VTaWduYWwob2xkU2lnbmFsLCBuZXdTaWduYWwsIG9wKSB7fVxuXG4gICAgY29udGFpbnNTaWduYWwoc2lnbmFsLCBjaGVja0xhc3QgPSBmYWxzZSwgY2hlY2tPcmlnaW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZmluZChmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLm1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0LCBjaGVja09yaWdpbik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIGF1dG9TdGFydDtcbiAgICAgIGlmICghKG9wICE9IG51bGwgPyBvcC5maW5kTGltaXRlcih0aGlzKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgIG9wID0gbmV3IFNpZ25hbE9wZXJhdGlvbigpO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgc2ltaWxhcjtcbiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSAmJiB0aGlzLmFjY2VwdFNpZ25hbChzaWduYWwpKSB7XG4gICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnB1c2goc2lnbmFsKTtcbiAgICAgICAgICAgIHRoaXMub25BZGRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICBpZiAoIXNpbWlsYXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhdXRvU3RhcnQpIHtcbiAgICAgICAgICBvcC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc2lnbmFsO1xuICAgIH1cblxuICAgIHJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgYXV0b1N0YXJ0O1xuICAgICAgaWYgKCEob3AgIT0gbnVsbCA/IG9wLmZpbmRMaW1pdGVyKHRoaXMpIDogdm9pZCAwKSkge1xuICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgb3AgPSBuZXcgU2lnbmFsT3BlcmF0aW9uO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgZXhpc3Rpbmc7XG4gICAgICAgICAgaWYgKChleGlzdGluZyA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSkgJiYgdGhpcy5hY2NlcHRTaWduYWwoc2lnbmFsKSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnNwbGljZSh0aGlzLnNpZ25hbHMuaW5kZXhPZihleGlzdGluZyksIDEpO1xuICAgICAgICAgICAgdGhpcy5vblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKTtcbiAgICAgICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgICAgIHZhciBzaW1pbGFyO1xuICAgICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgICBpZiAoc2ltaWxhcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVwbGFjZVNpZ25hbChzaWduYWwsIHNpbWlsYXIsIG9wKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vblJlbW92ZVNpZ25hbFR5cGUoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RlcEJ5U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wLnN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoYXV0b1N0YXJ0KSB7XG4gICAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCkge1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ID09PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiBzaWduYWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2lnbmFsLndpdGhMYXN0KHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRm9yd2FyZFdhdGNoZXIoKSB7XG4gICAgICBpZiAoIXRoaXMuZm9yd2FyZFdhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5mb3J3YXJkV2F0Y2hlciA9IG5ldyBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBzY29wZTogdGhpcyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ291dHB1dHMnLFxuICAgICAgICAgIG9uQWRkZWQ6IGZ1bmN0aW9uKG91dHB1dCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZFNpZ25hbFRvKHNpZ25hbCwgb3V0cHV0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgb25SZW1vdmVkOiBmdW5jdGlvbihvdXRwdXQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRlZFNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3BGb3J3YXJkZWRTaWduYWxUbyhzaWduYWwsIG91dHB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkV2F0Y2hlci5iaW5kKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yd2FyZFNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5hZGQoc2lnbmFsKTtcbiAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0ZvcndhcmRXYXRjaGVyKCk7XG4gICAgfVxuXG4gICAgZm9yd2FyZEFsbFNpZ25hbHNUbyhjb25uLCBvcCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgdmFyIG5leHQ7XG4gICAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0b3BGb3J3YXJkZWRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICB0aGlzLmZvcndhcmRlZFNpZ25hbHMucmVtb3ZlKHNpZ25hbCk7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24oY29ubikge1xuICAgICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgICByZXR1cm4gY29ubi5yZW1vdmVTaWduYWwobmV4dCwgb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdG9wQWxsRm9yd2FyZGVkU2lnbmFsVG8oY29ubiwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgIHJldHVybiBjb25uLnJlbW92ZVNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3J3YXJkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wRm9yd2FyZGVkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4ucmVtb3ZlU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDb25uZWN0ZWQucHJvcGVydGllcyh7XG4gICAgc2lnbmFsczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgaW5wdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBvdXRwdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBmb3J3YXJkZWRTaWduYWxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ29ubmVjdGVkO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEVsZW1lbnQsIFNpZ25hbDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCA9IGNsYXNzIFNpZ25hbCBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihvcmlnaW4sIHR5cGUgPSAnc2lnbmFsJywgZXhjbHVzaXZlID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5leGNsdXNpdmUgPSBleGNsdXNpdmU7XG4gICAgdGhpcy5sYXN0ID0gdGhpcy5vcmlnaW47XG4gIH1cblxuICB3aXRoTGFzdChsYXN0KSB7XG4gICAgdmFyIHNpZ25hbDtcbiAgICBzaWduYWwgPSBuZXcgdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3IodGhpcy5vcmlnaW4sIHRoaXMudHlwZSwgdGhpcy5leGNsdXNpdmUpO1xuICAgIHNpZ25hbC5sYXN0ID0gbGFzdDtcbiAgICByZXR1cm4gc2lnbmFsO1xuICB9XG5cbiAgY29weSgpIHtcbiAgICB2YXIgc2lnbmFsO1xuICAgIHNpZ25hbCA9IG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3Rvcih0aGlzLm9yaWdpbiwgdGhpcy50eXBlLCB0aGlzLmV4Y2x1c2l2ZSk7XG4gICAgc2lnbmFsLmxhc3QgPSB0aGlzLmxhc3Q7XG4gICAgcmV0dXJuIHNpZ25hbDtcbiAgfVxuXG4gIG1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0ID0gZmFsc2UsIGNoZWNrT3JpZ2luID0gdGhpcy5leGNsdXNpdmUpIHtcbiAgICByZXR1cm4gKCFjaGVja0xhc3QgfHwgc2lnbmFsLmxhc3QgPT09IHRoaXMubGFzdCkgJiYgKGNoZWNrT3JpZ2luIHx8IHNpZ25hbC5vcmlnaW4gPT09IHRoaXMub3JpZ2luKSAmJiBzaWduYWwudHlwZSA9PT0gdGhpcy50eXBlO1xuICB9XG5cbn07XG4iLCJ2YXIgRWxlbWVudCwgU2lnbmFsT3BlcmF0aW9uO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsT3BlcmF0aW9uID0gY2xhc3MgU2lnbmFsT3BlcmF0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMubGltaXRlcnMgPSBbXTtcbiAgfVxuXG4gIGFkZE9wZXJhdGlvbihmdW5jdCwgcHJpb3JpdHkgPSAxKSB7XG4gICAgaWYgKHByaW9yaXR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS51bnNoaWZ0KGZ1bmN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUucHVzaChmdW5jdCk7XG4gICAgfVxuICB9XG5cbiAgYWRkTGltaXRlcihjb25uZWN0ZWQpIHtcbiAgICBpZiAoIXRoaXMuZmluZExpbWl0ZXIoY29ubmVjdGVkKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGltaXRlcnMucHVzaChjb25uZWN0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRMaW1pdGVyKGNvbm5lY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmxpbWl0ZXJzLmluZGV4T2YoY29ubmVjdGVkKSA+IC0xO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHJlc3VsdHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuc3RlcCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBzdGVwKCkge1xuICAgIHZhciBmdW5jdDtcbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRvbmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVuY3QgPSB0aGlzLnF1ZXVlLnNoaWZ0KGZ1bmN0KTtcbiAgICAgIHJldHVybiBmdW5jdCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBkb25lKCkge31cblxufTtcbiIsInZhciBDb25uZWN0ZWQsIFNpZ25hbCwgU2lnbmFsT3BlcmF0aW9uLCBTaWduYWxTb3VyY2U7XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cblNpZ25hbCA9IHJlcXVpcmUoJy4vU2lnbmFsJyk7XG5cblNpZ25hbE9wZXJhdGlvbiA9IHJlcXVpcmUoJy4vU2lnbmFsT3BlcmF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsU291cmNlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTaWduYWxTb3VyY2UgZXh0ZW5kcyBDb25uZWN0ZWQge307XG5cbiAgU2lnbmFsU291cmNlLnByb3BlcnRpZXMoe1xuICAgIGFjdGl2YXRlZDoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wO1xuICAgICAgICBvcCA9IG5ldyBTaWduYWxPcGVyYXRpb24oKTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGVkKSB7XG4gICAgICAgICAgdGhpcy5mb3J3YXJkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdG9wRm9yd2FyZGVkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzaWduYWw6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2lnbmFsKHRoaXMsICdwb3dlcicsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNpZ25hbFNvdXJjZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBDb25uZWN0ZWQsIFN3aXRjaDtcblxuQ29ubmVjdGVkID0gcmVxdWlyZSgnLi9Db25uZWN0ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l0Y2ggPSBjbGFzcyBTd2l0Y2ggZXh0ZW5kcyBDb25uZWN0ZWQge307XG4iLCJ2YXIgQ29ubmVjdGVkLCBEaXJlY3Rpb24sIFRpbGVkLCBXaXJlLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2lyZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2lyZSBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3Rvcih3aXJlVHlwZSA9ICdyZWQnKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy53aXJlVHlwZSA9IHdpcmVUeXBlO1xuICAgIH1cblxuICAgIGZpbmREaXJlY3Rpb25zVG8oY29ubikge1xuICAgICAgdmFyIGRpcmVjdGlvbnM7XG4gICAgICBkaXJlY3Rpb25zID0gY29ubi50aWxlcyAhPSBudWxsID8gY29ubi50aWxlcy5tYXAoKHRpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZS5maW5kRGlyZWN0aW9uT2YodGlsZSk7XG4gICAgICB9KSA6IFt0aGlzLnRpbGUuZmluZERpcmVjdGlvbk9mKGNvbm4pXTtcbiAgICAgIHJldHVybiBkaXJlY3Rpb25zLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICE9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gQ29ubmVjdGVkLnByb3RvdHlwZS5jYW5Db25uZWN0VG8uY2FsbCh0aGlzLCB0YXJnZXQpICYmICgodGFyZ2V0LndpcmVUeXBlID09IG51bGwpIHx8IHRhcmdldC53aXJlVHlwZSA9PT0gdGhpcy53aXJlVHlwZSk7XG4gICAgfVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLmZvcndhcmRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgfVxuXG4gIH07XG5cbiAgV2lyZS5leHRlbmQoQ29ubmVjdGVkKTtcblxuICBXaXJlLnByb3BlcnRpZXMoe1xuICAgIG91dHB1dHM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHZhciBwYXJlbnQ7XG4gICAgICAgIHBhcmVudCA9IGludmFsaWRhdGlvbi5wcm9wKHRoaXMudGlsZVByb3BlcnR5KTtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRpb24ucHJvcChwYXJlbnQuYWRqYWNlbnRUaWxlc1Byb3BlcnR5KS5yZWR1Y2UoKHJlcywgdGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoaW52YWxpZGF0aW9uLnByb3AodGlsZS5jaGlsZHJlblByb3BlcnR5KS5maWx0ZXIoKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbkNvbm5lY3RUbyhjaGlsZCk7XG4gICAgICAgICAgICB9KS50b0FycmF5KCkpO1xuICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbm5lY3RlZERpcmVjdGlvbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRpb24ucHJvcCh0aGlzLm91dHB1dHNQcm9wZXJ0eSkucmVkdWNlKChvdXQsIGNvbm4pID0+IHtcbiAgICAgICAgICB0aGlzLmZpbmREaXJlY3Rpb25zVG8oY29ubikuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKG91dCwgZCkgPCAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvdXQucHVzaChkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9LCBbXSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV2lyZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkNvbm5lY3RlZFwiOiByZXF1aXJlKFwiLi9Db25uZWN0ZWRcIiksXG4gIFwiU2lnbmFsXCI6IHJlcXVpcmUoXCIuL1NpZ25hbFwiKSxcbiAgXCJTaWduYWxPcGVyYXRpb25cIjogcmVxdWlyZShcIi4vU2lnbmFsT3BlcmF0aW9uXCIpLFxuICBcIlNpZ25hbFNvdXJjZVwiOiByZXF1aXJlKFwiLi9TaWduYWxTb3VyY2VcIiksXG4gIFwiU3dpdGNoXCI6IHJlcXVpcmUoXCIuL1N3aXRjaFwiKSxcbiAgXCJXaXJlXCI6IHJlcXVpcmUoXCIuL1dpcmVcIiksXG59IiwiY29uc3QgVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlXG5cbmNsYXNzIEFpcmxvY2sgZXh0ZW5kcyBUaWxlIHtcbiAgYXR0YWNoVG8gKGFpcmxvY2spIHtcbiAgICB0aGlzLmF0dGFjaGVkVG8gPSBhaXJsb2NrXG4gIH1cbn07XG5cbkFpcmxvY2sucHJvcGVydGllcyh7XG4gIGRpcmVjdGlvbjoge30sXG4gIGF0dGFjaGVkVG86IHt9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFpcmxvY2tcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKVxuXG5jbGFzcyBBcHByb2FjaCBleHRlbmRzIEVsZW1lbnQge1xuICBzdGFydCAobG9jYXRpb24pIHtcbiAgICBpZiAodGhpcy52YWxpZCkge1xuICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlXG4gICAgICB0aGlzLnN1YmplY3QueE1lbWJlcnMuYWRkUHJvcGVydHlSZWYoJ3Bvc2l0aW9uLm9mZnNldFgnLCB0aGlzKVxuICAgICAgdGhpcy5zdWJqZWN0LnlNZW1iZXJzLmFkZFByb3BlcnR5UmVmKCdwb3NpdGlvbi5vZmZzZXRZJywgdGhpcylcbiAgICAgIHRoaXMudGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kb25lKClcbiAgICAgIH0sIHRoaXMuZHVyYXRpb24pXG4gICAgfVxuICB9XG5cbiAgZG9uZSAoKSB7XG4gICAgdGhpcy5zdWJqZWN0LnhNZW1iZXJzLnJlbW92ZVJlZih7XG4gICAgICBuYW1lOiAncG9zaXRpb24ub2Zmc2V0WCcsXG4gICAgICBvYmo6IHRoaXNcbiAgICB9KVxuICAgIHRoaXMuc3ViamVjdC55TWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFknLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLnN1YmplY3QueCA9IHRoaXMudGFyZ2V0UG9zLnhcbiAgICB0aGlzLnN1YmplY3QueSA9IHRoaXMudGFyZ2V0UG9zLnhcbiAgICB0aGlzLnN1YmplY3RBaXJsb2NrLmF0dGFjaFRvKHRoaXMudGFyZ2V0QWlybG9jaylcbiAgICB0aGlzLm1vdmluZyA9IGZhbHNlXG4gICAgdGhpcy5jb21wbGV0ZSA9IHRydWVcbiAgfVxufTtcblxuQXBwcm9hY2gucHJvcGVydGllcyh7XG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKVxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbERpc3Q6IHtcbiAgICBkZWZhdWx0OiA1MDBcbiAgfSxcbiAgcm5nOiB7XG4gICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgfSxcbiAgYW5nbGU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJuZyAqIE1hdGguUEkgKiAyXG4gICAgfVxuICB9LFxuICBzdGFydGluZ1Bvczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy5zdGFydGluZ1Bvcy54ICsgdGhpcy5pbml0aWFsRGlzdCAqIE1hdGguY29zKHRoaXMuYW5nbGUpLFxuICAgICAgICB5OiB0aGlzLnN0YXJ0aW5nUG9zLnkgKyB0aGlzLmluaXRpYWxEaXN0ICogTWF0aC5zaW4odGhpcy5hbmdsZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHRhcmdldFBvczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy50YXJnZXRBaXJsb2NrLnggLSB0aGlzLnN1YmplY3RBaXJsb2NrLngsXG4gICAgICAgIHk6IHRoaXMudGFyZ2V0QWlybG9jay55IC0gdGhpcy5zdWJqZWN0QWlybG9jay55XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzdWJqZWN0OiB7fSxcbiAgdGFyZ2V0OiB7fSxcbiAgc3ViamVjdEFpcmxvY2s6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhaXJsb2Nrc1xuICAgICAgYWlybG9ja3MgPSB0aGlzLnN1YmplY3QuYWlybG9ja3Muc2xpY2UoKVxuICAgICAgYWlybG9ja3Muc29ydCgoYSwgYikgPT4ge1xuICAgICAgICB2YXIgdmFsQSwgdmFsQlxuICAgICAgICB2YWxBID0gTWF0aC5hYnMoYS5kaXJlY3Rpb24ueCAtIE1hdGguY29zKHRoaXMuYW5nbGUpKSArIE1hdGguYWJzKGEuZGlyZWN0aW9uLnkgLSBNYXRoLnNpbih0aGlzLmFuZ2xlKSlcbiAgICAgICAgdmFsQiA9IE1hdGguYWJzKGIuZGlyZWN0aW9uLnggLSBNYXRoLmNvcyh0aGlzLmFuZ2xlKSkgKyBNYXRoLmFicyhiLmRpcmVjdGlvbi55IC0gTWF0aC5zaW4odGhpcy5hbmdsZSkpXG4gICAgICAgIHJldHVybiB2YWxBIC0gdmFsQlxuICAgICAgfSlcbiAgICAgIHJldHVybiBhaXJsb2Nrc1swXVxuICAgIH1cbiAgfSxcbiAgdGFyZ2V0QWlybG9jazoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFpcmxvY2tzLmZpbmQoKHRhcmdldCkgPT4ge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmRpcmVjdGlvbi5nZXRJbnZlcnNlKCkgPT09IHRoaXMuc3ViamVjdEFpcmxvY2suZGlyZWN0aW9uXG4gICAgICB9KVxuICAgIH1cbiAgfSxcbiAgbW92aW5nOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgY29tcGxldGU6IHtcbiAgICBkZWZhdWx0OiBmYWxzZVxuICB9LFxuICBjdXJyZW50UG9zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHZhciBlbmQsIHByYywgc3RhcnRcbiAgICAgIHN0YXJ0ID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnN0YXJ0aW5nUG9zUHJvcGVydHkpXG4gICAgICBlbmQgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMudGFyZ2V0UG9zUHJvcGVydHkpXG4gICAgICBwcmMgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgndGltZW91dC5wcmMnKSB8fCAwXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiAoZW5kLnggLSBzdGFydC54KSAqIHByYyArIHN0YXJ0LngsXG4gICAgICAgIHk6IChlbmQueSAtIHN0YXJ0LnkpICogcHJjICsgc3RhcnQueVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZHVyYXRpb246IHtcbiAgICBkZWZhdWx0OiAxMDAwMFxuICB9LFxuICB0aW1lb3V0OiB7fVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBcHByb2FjaFxuIiwiY29uc3QgRG9vciA9IHJlcXVpcmUoJy4vRG9vcicpXG5jb25zdCBDaGFyYWN0ZXIgPSByZXF1aXJlKCcuL0NoYXJhY3RlcicpXG5cbmNsYXNzIEF1dG9tYXRpY0Rvb3IgZXh0ZW5kcyBEb29yIHtcbiAgdXBkYXRlVGlsZU1lbWJlcnMgKG9sZCkge1xuICAgIHZhciByZWYsIHJlZjEsIHJlZjIsIHJlZjNcbiAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgIGlmICgocmVmID0gb2xkLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYucmVtb3ZlUHJvcGVydHkodGhpcy51bmxvY2tlZFByb3BlcnR5KVxuICAgICAgfVxuICAgICAgaWYgKChyZWYxID0gb2xkLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYxLnJlbW92ZVByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICBpZiAoKHJlZjIgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgIHJlZjIuYWRkUHJvcGVydHkodGhpcy51bmxvY2tlZFByb3BlcnR5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIChyZWYzID0gdGhpcy50aWxlLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCA/IHJlZjMuYWRkUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpIDogbnVsbFxuICAgIH1cbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIHN1cGVyLmluaXQoKVxuICAgIHJldHVybiB0aGlzLm9wZW5cbiAgfVxuXG4gIGlzQWN0aXZhdG9yUHJlc2VudCAoaW52YWxpZGF0ZSkge1xuICAgIHJldHVybiB0aGlzLmdldFJlYWN0aXZlVGlsZXMoaW52YWxpZGF0ZSkuc29tZSgodGlsZSkgPT4ge1xuICAgICAgdmFyIGNoaWxkcmVuXG4gICAgICBjaGlsZHJlbiA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AodGlsZS5jaGlsZHJlblByb3BlcnR5KSA6IHRpbGUuY2hpbGRyZW5cbiAgICAgIHJldHVybiBjaGlsZHJlbi5zb21lKChjaGlsZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW5CZUFjdGl2YXRlZEJ5KGNoaWxkKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY2FuQmVBY3RpdmF0ZWRCeSAoZWxlbSkge1xuICAgIHJldHVybiBlbGVtIGluc3RhbmNlb2YgQ2hhcmFjdGVyXG4gIH1cblxuICBnZXRSZWFjdGl2ZVRpbGVzIChpbnZhbGlkYXRlKSB7XG4gICAgdmFyIGRpcmVjdGlvbiwgdGlsZVxuICAgIHRpbGUgPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKHRoaXMudGlsZVByb3BlcnR5KSA6IHRoaXMudGlsZVxuICAgIGlmICghdGlsZSkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICAgIGRpcmVjdGlvbiA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AodGhpcy5kaXJlY3Rpb25Qcm9wZXJ0eSkgOiB0aGlzLmRpcmVjdGlvblxuICAgIGlmIChkaXJlY3Rpb24gPT09IERvb3IuZGlyZWN0aW9ucy5ob3Jpem9udGFsKSB7XG4gICAgICByZXR1cm4gW3RpbGUsIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKDAsIDEpLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgwLCAtMSldLmZpbHRlcihmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdCAhPSBudWxsXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3RpbGUsIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKDEsIDApLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgtMSwgMCldLmZpbHRlcihmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdCAhPSBudWxsXG4gICAgICB9KVxuICAgIH1cbiAgfVxufTtcblxuQXV0b21hdGljRG9vci5wcm9wZXJ0aWVzKHtcbiAgb3Blbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdGUpIHtcbiAgICAgIHJldHVybiAhaW52YWxpZGF0ZS5wcm9wKHRoaXMubG9ja2VkUHJvcGVydHkpICYmIHRoaXMuaXNBY3RpdmF0b3JQcmVzZW50KGludmFsaWRhdGUpXG4gICAgfVxuICB9LFxuICBsb2NrZWQ6IHtcbiAgICBkZWZhdWx0OiBmYWxzZVxuICB9LFxuICB1bmxvY2tlZDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdGUpIHtcbiAgICAgIHJldHVybiAhaW52YWxpZGF0ZS5wcm9wKHRoaXMubG9ja2VkUHJvcGVydHkpXG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9tYXRpY0Rvb3JcbiIsImNvbnN0IFRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkXG5jb25zdCBEYW1hZ2VhYmxlID0gcmVxdWlyZSgnLi9EYW1hZ2VhYmxlJylcbmNvbnN0IFdhbGtBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvV2Fsa0FjdGlvbicpXG5cbmNsYXNzIENoYXJhY3RlciBleHRlbmRzIFRpbGVkIHtcbiAgY29uc3RydWN0b3IgKG5hbWUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICB9XG5cbiAgc2V0RGVmYXVsdHMgKCkge1xuICAgIGlmICghdGhpcy50aWxlICYmICh0aGlzLmdhbWUubWFpblRpbGVDb250YWluZXIgIT0gbnVsbCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnB1dE9uUmFuZG9tVGlsZSh0aGlzLmdhbWUubWFpblRpbGVDb250YWluZXIudGlsZXMpXG4gICAgfVxuICB9XG5cbiAgY2FuR29PblRpbGUgKHRpbGUpIHtcbiAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCA/IHRpbGUud2Fsa2FibGUgOiBudWxsKSAhPT0gZmFsc2VcbiAgfVxuXG4gIHdhbGtUbyAodGlsZSkge1xuICAgIHZhciBhY3Rpb25cbiAgICBhY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICBhY3RvcjogdGhpcyxcbiAgICAgIHRhcmdldDogdGlsZVxuICAgIH0pXG4gICAgYWN0aW9uLmV4ZWN1dGUoKVxuICAgIHJldHVybiBhY3Rpb25cbiAgfVxuXG4gIGlzU2VsZWN0YWJsZUJ5IChwbGF5ZXIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59O1xuXG5DaGFyYWN0ZXIuZXh0ZW5kKERhbWFnZWFibGUpXG5cbkNoYXJhY3Rlci5wcm9wZXJ0aWVzKHtcbiAgZ2FtZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkKSB7XG4gICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldERlZmF1bHRzKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG9mZnNldFg6IHtcbiAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICBkZWZhdWx0OiAwLjVcbiAgfSxcbiAgb2Zmc2V0WToge1xuICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgIGRlZmF1bHQ6IDAuNVxuICB9LFxuICB0aWxlOiB7XG4gICAgY29tcG9zZWQ6IHRydWVcbiAgfSxcbiAgZGVmYXVsdEFjdGlvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgYWN0b3I6IHRoaXNcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RpbGUuYWN0aW9uUHJvdmlkZXIuYWN0aW9ucycpIHx8IFtdXG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlclxuIiwiY29uc3QgVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyXG5jb25zdCBWaXNpb25DYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9WaXNpb25DYWxjdWxhdG9yJylcbmNvbnN0IERvb3IgPSByZXF1aXJlKCcuL0Rvb3InKVxuY29uc3QgV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9XYWxrQWN0aW9uJylcbmNvbnN0IEF0dGFja01vdmVBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbicpXG5jb25zdCBQcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykud2F0Y2hlcnMuUHJvcGVydHlXYXRjaGVyXG5cbmNsYXNzIENoYXJhY3RlckFJIHtcbiAgY29uc3RydWN0b3IgKGNoYXJhY3Rlcikge1xuICAgIHRoaXMuY2hhcmFjdGVyID0gY2hhcmFjdGVyXG4gICAgdGhpcy5uZXh0QWN0aW9uQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0QWN0aW9uKClcbiAgICB9XG4gICAgdGhpcy52aXNpb25NZW1vcnkgPSBuZXcgVGlsZUNvbnRhaW5lcigpXG4gICAgdGhpcy50aWxlV2F0Y2hlciA9IG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVmlzaW9uTWVtb3J5KClcbiAgICAgIH0sXG4gICAgICBwcm9wZXJ0eTogdGhpcy5jaGFyYWN0ZXIucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ3RpbGUnKVxuICAgIH0pXG4gIH1cblxuICBzdGFydCAoKSB7XG4gICAgdGhpcy50aWxlV2F0Y2hlci5iaW5kKClcbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aW9uKClcbiAgfVxuXG4gIG5leHRBY3Rpb24gKCkge1xuICAgIHRoaXMudXBkYXRlVmlzaW9uTWVtb3J5KClcbiAgICBjb25zdCBlbmVteSA9IHRoaXMuZ2V0Q2xvc2VzdEVuZW15KClcbiAgICBpZiAoZW5lbXkpIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dGFja01vdmVUbyhlbmVteSkub24oJ2VuZCcsIHRoaXMubmV4dEFjdGlvbkNhbGxiYWNrKVxuICAgIH1cbiAgICBjb25zdCB1bmV4cGxvcmVkID0gdGhpcy5nZXRDbG9zZXN0VW5leHBsb3JlZCgpXG4gICAgaWYgKHVuZXhwbG9yZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGtUbyh1bmV4cGxvcmVkKS5vbignZW5kJywgdGhpcy5uZXh0QWN0aW9uQ2FsbGJhY2spXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzZXRWaXNpb25NZW1vcnkoKVxuICAgICAgcmV0dXJuIHRoaXMud2Fsa1RvKHRoaXMuZ2V0Q2xvc2VzdFVuZXhwbG9yZWQoKSkub24oJ2VuZCcsIHRoaXMubmV4dEFjdGlvbkNhbGxiYWNrKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZpc2lvbk1lbW9yeSAoKSB7XG4gICAgdmFyIGNhbGN1bGF0b3JcbiAgICBjYWxjdWxhdG9yID0gbmV3IFZpc2lvbkNhbGN1bGF0b3IodGhpcy5jaGFyYWN0ZXIudGlsZSlcbiAgICBjYWxjdWxhdG9yLmNhbGN1bCgpXG4gICAgdGhpcy52aXNpb25NZW1vcnkgPSBjYWxjdWxhdG9yLnRvQ29udGFpbmVyKCkubWVyZ2UodGhpcy52aXNpb25NZW1vcnksIChhLCBiKSA9PiB7XG4gICAgICBpZiAoYSAhPSBudWxsKSB7XG4gICAgICAgIGEgPSB0aGlzLmFuYWx5emVUaWxlKGEpXG4gICAgICB9XG4gICAgICBpZiAoKGEgIT0gbnVsbCkgJiYgKGIgIT0gbnVsbCkpIHtcbiAgICAgICAgYS52aXNpYmlsaXR5ID0gTWF0aC5tYXgoYS52aXNpYmlsaXR5LCBiLnZpc2liaWxpdHkpXG4gICAgICAgIHJldHVybiBhXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYSB8fCBiXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFuYWx5emVUaWxlICh0aWxlKSB7XG4gICAgdmFyIHJlZlxuICAgIHRpbGUuZW5uZW15U3BvdHRlZCA9IChyZWYgPSB0aWxlLmdldEZpbmFsVGlsZSgpLmNoaWxkcmVuKSAhPSBudWxsID8gcmVmLmZpbmQoKGMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmlzRW5uZW15KGMpXG4gICAgfSkgOiBudWxsXG4gICAgdGlsZS5leHBsb3JhYmxlID0gdGhpcy5pc0V4cGxvcmFibGUodGlsZSlcbiAgICByZXR1cm4gdGlsZVxuICB9XG5cbiAgaXNFbm5lbXkgKGVsZW0pIHtcbiAgICB2YXIgcmVmXG4gICAgcmV0dXJuIChyZWYgPSB0aGlzLmNoYXJhY3Rlci5vd25lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuaXNFbmVteSA9PT0gJ2Z1bmN0aW9uJyA/IHJlZi5pc0VuZW15KGVsZW0pIDogbnVsbCA6IG51bGxcbiAgfVxuXG4gIGdldENsb3Nlc3RFbmVteSAoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaW9uTWVtb3J5LmNsb3Nlc3QodGhpcy5jaGFyYWN0ZXIudGlsZSwgKHQpID0+IHtcbiAgICAgIHJldHVybiB0LmVubmVteVNwb3R0ZWRcbiAgICB9KVxuICB9XG5cbiAgZ2V0Q2xvc2VzdFVuZXhwbG9yZWQgKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2lvbk1lbW9yeS5jbG9zZXN0KHRoaXMuY2hhcmFjdGVyLnRpbGUsICh0KSA9PiB7XG4gICAgICByZXR1cm4gdC52aXNpYmlsaXR5IDwgMSAmJiB0LmV4cGxvcmFibGVcbiAgICB9KVxuICB9XG5cbiAgaXNFeHBsb3JhYmxlICh0aWxlKSB7XG4gICAgdmFyIHJlZlxuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpXG4gICAgcmV0dXJuIHRpbGUud2Fsa2FibGUgfHwgKChyZWYgPSB0aWxlLmNoaWxkcmVuKSAhPSBudWxsID8gcmVmLmZpbmQoKGMpID0+IHtcbiAgICAgIHJldHVybiBjIGluc3RhbmNlb2YgRG9vclxuICAgIH0pIDogbnVsbClcbiAgfVxuXG4gIGF0dGFja01vdmVUbyAodGlsZSkge1xuICAgIHZhciBhY3Rpb25cbiAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKVxuICAgIGFjdGlvbiA9IG5ldyBBdHRhY2tNb3ZlQWN0aW9uKHtcbiAgICAgIGFjdG9yOiB0aGlzLmNoYXJhY3RlcixcbiAgICAgIHRhcmdldDogdGlsZVxuICAgIH0pXG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5leGVjdXRlKClcbiAgICAgIHJldHVybiBhY3Rpb25cbiAgICB9XG4gIH1cblxuICB3YWxrVG8gKHRpbGUpIHtcbiAgICB2YXIgYWN0aW9uXG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKClcbiAgICBhY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICBhY3RvcjogdGhpcy5jaGFyYWN0ZXIsXG4gICAgICB0YXJnZXQ6IHRpbGVcbiAgICB9KVxuICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICBhY3Rpb24uZXhlY3V0ZSgpXG4gICAgICByZXR1cm4gYWN0aW9uXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcmFjdGVyQUlcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgVmlldyA9IHJlcXVpcmUoJy4vVmlldycpXG5jb25zdCBTaGlwID0gcmVxdWlyZSgnLi9TaGlwJylcblxuY2xhc3MgQ29uZnJvbnRhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICBzdGFydCAoKSB7XG4gICAgdGhpcy5nYW1lLm1haW5WaWV3ID0gdGhpcy52aWV3XG4gICAgdGhpcy5zdWJqZWN0LmNvbnRhaW5lciA9IHRoaXMudmlld1xuICAgIHRoaXMub3Bwb25lbnQuY29udGFpbmVyID0gdGhpcy52aWV3XG4gIH1cbn07XG5cbkNvbmZyb250YXRpb24ucHJvcGVydGllcyh7XG4gIGdhbWU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHN1YmplY3Q6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHZpZXc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVmlldygpXG4gICAgfVxuICB9LFxuICBvcHBvbmVudDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBTaGlwKClcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZnJvbnRhdGlvblxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBMaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKVxuY29uc3QgRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvblxuXG5jbGFzcyBEYW1hZ2VQcm9wYWdhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICBnZXRUaWxlQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlLmNvbnRhaW5lclxuICB9XG5cbiAgYXBwbHkgKCkge1xuICAgIHRoaXMuZ2V0RGFtYWdlZCgpLmZvckVhY2goKGRhbWFnZSkgPT4ge1xuICAgICAgZGFtYWdlLnRhcmdldC5kYW1hZ2UoZGFtYWdlLmRhbWFnZSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0SW5pdGlhbFRpbGVzICgpIHtcbiAgICB2YXIgY3RuXG4gICAgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKClcbiAgICByZXR1cm4gY3RuLmluUmFuZ2UodGhpcy50aWxlLCB0aGlzLnJhbmdlKVxuICB9XG5cbiAgZ2V0SW5pdGlhbERhbWFnZXMgKCkge1xuICAgIGNvbnN0IHRpbGVzID0gdGhpcy5nZXRJbml0aWFsVGlsZXMoKVxuICAgIHJldHVybiB0aWxlcy5yZWR1Y2UoKGRhbWFnZXMsIHRpbGUpID0+IHtcbiAgICAgIGlmICh0aWxlLmRhbWFnZWFibGUpIHtcbiAgICAgICAgY29uc3QgZG1nID0gdGhpcy5pbml0aWFsRGFtYWdlKHRpbGUsIHRpbGVzLmxlbmd0aClcbiAgICAgICAgaWYgKGRtZykge1xuICAgICAgICAgIGRhbWFnZXMucHVzaChkbWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkYW1hZ2VzXG4gICAgfSwgW10pXG4gIH1cblxuICBnZXREYW1hZ2VkICgpIHtcbiAgICB2YXIgYWRkZWRcbiAgICBpZiAodGhpcy5fZGFtYWdlZCA9PSBudWxsKSB7XG4gICAgICBhZGRlZCA9IG51bGxcbiAgICAgIGRvIHtcbiAgICAgICAgYWRkZWQgPSB0aGlzLnN0ZXAoYWRkZWQpXG4gICAgICB9IHdoaWxlIChhZGRlZClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2RhbWFnZWRcbiAgfVxuXG4gIHN0ZXAgKGFkZGVkKSB7XG4gICAgaWYgKGFkZGVkICE9IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLmV4dGVuZGVkRGFtYWdlICE9IG51bGwpIHtcbiAgICAgICAgYWRkZWQgPSB0aGlzLmV4dGVuZChhZGRlZClcbiAgICAgICAgdGhpcy5fZGFtYWdlZCA9IGFkZGVkLmNvbmNhdCh0aGlzLl9kYW1hZ2VkKVxuICAgICAgICByZXR1cm4gYWRkZWQubGVuZ3RoID4gMCAmJiBhZGRlZFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYW1hZ2VkID0gdGhpcy5nZXRJbml0aWFsRGFtYWdlcygpXG4gICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZFxuICAgIH1cbiAgfVxuXG4gIGluRGFtYWdlZCAodGFyZ2V0LCBkYW1hZ2VkKSB7XG4gICAgY29uc3QgcG9zID0gZGFtYWdlZC5maW5kSW5kZXgoKGRhbWFnZSkgPT4gZGFtYWdlLnRhcmdldCA9PT0gdGFyZ2V0KVxuICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHBvc1xuICB9XG5cbiAgZXh0ZW5kIChkYW1hZ2VkKSB7XG4gICAgY29uc3QgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKClcbiAgICByZXR1cm4gZGFtYWdlZC5yZWR1Y2UoKGFkZGVkLCBkYW1hZ2UpID0+IHtcbiAgICAgIGlmIChkYW1hZ2UudGFyZ2V0LnggPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYWRkZWRcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxvY2FsID0gRGlyZWN0aW9uLmFkamFjZW50cy5yZWR1Y2UoKGxvY2FsLCBkaXIpID0+IHtcbiAgICAgICAgY29uc3QgdGlsZSA9IGN0bi5nZXRUaWxlKGRhbWFnZS50YXJnZXQueCArIGRpci54LCBkYW1hZ2UudGFyZ2V0LnkgKyBkaXIueSlcbiAgICAgICAgaWYgKCh0aWxlICE9IG51bGwpICYmIHRpbGUuZGFtYWdlYWJsZSAmJiB0aGlzLmluRGFtYWdlZCh0aWxlLCB0aGlzLl9kYW1hZ2VkKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBsb2NhbC5wdXNoKHRpbGUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2FsXG4gICAgICB9LCBbXSlcbiAgICAgIHJldHVybiBsb2NhbC5yZWR1Y2UoKGFkZGVkLCB0YXJnZXQpID0+IHtcbiAgICAgICAgY29uc3QgZG1nID0gdGhpcy5leHRlbmRlZERhbWFnZSh0YXJnZXQsIGRhbWFnZSwgbG9jYWwubGVuZ3RoKVxuICAgICAgICBpZiAoZG1nKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLmluRGFtYWdlZCh0YXJnZXQsIGFkZGVkKVxuICAgICAgICAgIGlmIChleGlzdGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFkZGVkLnB1c2goZG1nKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRlZFtleGlzdGluZ10gPSB0aGlzLm1lcmdlRGFtYWdlKGFkZGVkW2V4aXN0aW5nXSwgZG1nKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWRkZWRcbiAgICAgIH0sIGFkZGVkKVxuICAgIH0sIFtdKVxuICB9XG5cbiAgbWVyZ2VEYW1hZ2UgKGQxLCBkMikge1xuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IGQxLnRhcmdldCxcbiAgICAgIHBvd2VyOiBkMS5wb3dlciArIGQyLnBvd2VyLFxuICAgICAgZGFtYWdlOiBkMS5kYW1hZ2UgKyBkMi5kYW1hZ2VcbiAgICB9XG4gIH1cblxuICBtb2RpZnlEYW1hZ2UgKHRhcmdldCwgcG93ZXIpIHtcbiAgICBpZiAodHlwZW9mIHRhcmdldC5tb2RpZnlEYW1hZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHRhcmdldC5tb2RpZnlEYW1hZ2UocG93ZXIsIHRoaXMudHlwZSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHBvd2VyKVxuICAgIH1cbiAgfVxufTtcblxuRGFtYWdlUHJvcGFnYXRpb24ucHJvcGVydGllcyh7XG4gIHRpbGU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgcmFuZ2U6IHtcbiAgICBkZWZhdWx0OiAxXG4gIH0sXG4gIHR5cGU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH1cbn0pXG5cbkRhbWFnZVByb3BhZ2F0aW9uLk5vcm1hbCA9IGNsYXNzIE5vcm1hbCBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgaW5pdGlhbERhbWFnZSAodGFyZ2V0LCBuYikge1xuICAgIHZhciBkbWdcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHRoaXMucG93ZXIpXG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuRGFtYWdlUHJvcGFnYXRpb24uVGhlcm1pYyA9IGNsYXNzIFRoZXJtaWMgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gIGV4dGVuZGVkRGFtYWdlICh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXJcbiAgICBwb3dlciA9IChsYXN0LmRhbWFnZSAtIDEpIC8gMiAvIG5iICogTWF0aC5taW4oMSwgbGFzdC50YXJnZXQuaGVhbHRoIC8gbGFzdC50YXJnZXQubWF4SGVhbHRoICogNSlcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKVxuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxEYW1hZ2UgKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlclxuICAgIHBvd2VyID0gdGhpcy5wb3dlciAvIG5iXG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcilcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuRGFtYWdlUHJvcGFnYXRpb24uS2luZXRpYyA9IGNsYXNzIEtpbmV0aWMgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gIGV4dGVuZGVkRGFtYWdlICh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXJcbiAgICBwb3dlciA9IChsYXN0LnBvd2VyIC0gbGFzdC5kYW1hZ2UpICogTWF0aC5taW4oMSwgbGFzdC50YXJnZXQuaGVhbHRoIC8gbGFzdC50YXJnZXQubWF4SGVhbHRoICogMikgLSAxXG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcilcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpbml0aWFsRGFtYWdlICh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZ1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgdGhpcy5wb3dlcilcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1vZGlmeURhbWFnZSAodGFyZ2V0LCBwb3dlcikge1xuICAgIGlmICh0eXBlb2YgdGFyZ2V0Lm1vZGlmeURhbWFnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGFyZ2V0Lm1vZGlmeURhbWFnZShwb3dlciwgdGhpcy50eXBlKSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIgKiAwLjI1KVxuICAgIH1cbiAgfVxuXG4gIG1lcmdlRGFtYWdlIChkMSwgZDIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICBwb3dlcjogTWF0aC5mbG9vcigoZDEucG93ZXIgKyBkMi5wb3dlcikgLyAyKSxcbiAgICAgIGRhbWFnZTogTWF0aC5mbG9vcigoZDEuZGFtYWdlICsgZDIuZGFtYWdlKSAvIDIpXG4gICAgfVxuICB9XG59XG5cbkRhbWFnZVByb3BhZ2F0aW9uLkV4cGxvc2l2ZSA9IChmdW5jdGlvbiAoKSB7XG4gIGNsYXNzIEV4cGxvc2l2ZSBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgICBnZXREYW1hZ2VkICgpIHtcbiAgICAgIHZhciBhbmdsZSwgaW5zaWRlLCBzaGFyZFBvd2VyLCB0YXJnZXRcbiAgICAgIHRoaXMuX2RhbWFnZWQgPSBbXVxuICAgICAgY29uc3Qgc2hhcmRzID0gTWF0aC5wb3codGhpcy5yYW5nZSArIDEsIDIpXG4gICAgICBzaGFyZFBvd2VyID0gdGhpcy5wb3dlciAvIHNoYXJkc1xuICAgICAgaW5zaWRlID0gdGhpcy50aWxlLmhlYWx0aCA8PSB0aGlzLm1vZGlmeURhbWFnZSh0aGlzLnRpbGUsIHNoYXJkUG93ZXIpXG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHNoYXJkUG93ZXIgKj0gNFxuICAgICAgfVxuICAgICAgdGhpcy5fZGFtYWdlZCA9IEFycmF5KC4uLkFycmF5KHNoYXJkcyArIDEpKS5yZWR1Y2UoKGRhbWFnZWQpID0+IHtcbiAgICAgICAgYW5nbGUgPSB0aGlzLnJuZygpICogTWF0aC5QSSAqIDJcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUaWxlSGl0QnlTaGFyZChpbnNpZGUsIGFuZ2xlKVxuICAgICAgICBpZiAodGFyZ2V0ICE9IG51bGwpIHtcbiAgICAgICAgICBkYW1hZ2VkLnB1c2goe1xuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICBwb3dlcjogc2hhcmRQb3dlcixcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBzaGFyZFBvd2VyKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhbWFnZWRcbiAgICAgIH0sIFtdKVxuICAgICAgcmV0dXJuIHRoaXMuX2RhbWFnZWRcbiAgICB9XG5cbiAgICBnZXRUaWxlSGl0QnlTaGFyZCAoaW5zaWRlLCBhbmdsZSkge1xuICAgICAgdmFyIGN0biwgZGlzdCwgdGFyZ2V0LCB2ZXJ0ZXhcbiAgICAgIGN0biA9IHRoaXMuZ2V0VGlsZUNvbnRhaW5lcigpXG4gICAgICBkaXN0ID0gdGhpcy5yYW5nZSAqIHRoaXMucm5nKClcbiAgICAgIHRhcmdldCA9IHtcbiAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUgKyBkaXN0ICogTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNSArIGRpc3QgKiBNYXRoLnNpbihhbmdsZSlcbiAgICAgIH1cbiAgICAgIGlmIChpbnNpZGUpIHtcbiAgICAgICAgdmVydGV4ID0gbmV3IExpbmVPZlNpZ2h0KGN0biwgdGhpcy50aWxlLnggKyAwLjUsIHRoaXMudGlsZS55ICsgMC41LCB0YXJnZXQueCwgdGFyZ2V0LnkpXG4gICAgICAgIHZlcnRleC50cmF2ZXJzYWJsZUNhbGxiYWNrID0gKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gIWluc2lkZSB8fCAoKHRpbGUgIT0gbnVsbCkgJiYgdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUpKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZXJ0ZXguZ2V0RW5kUG9pbnQoKS50aWxlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY3RuLmdldFRpbGUoTWF0aC5mbG9vcih0YXJnZXQueCksIE1hdGguZmxvb3IodGFyZ2V0LnkpKVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBFeHBsb3NpdmUucHJvcGVydGllcyh7XG4gICAgcm5nOiB7XG4gICAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICAgIH0sXG4gICAgdHJhdmVyc2FibGVDYWxsYmFjazoge1xuICAgICAgZGVmYXVsdDogZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgcmV0dXJuICEodHlwZW9mIHRpbGUuZ2V0U29saWQgPT09ICdmdW5jdGlvbicgJiYgdGlsZS5nZXRTb2xpZCgpKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gRXhwbG9zaXZlXG59LmNhbGwodGhpcykpXG5cbm1vZHVsZS5leHBvcnRzID0gRGFtYWdlUHJvcGFnYXRpb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBEYW1hZ2VhYmxlIGV4dGVuZHMgRWxlbWVudCB7XG4gIGRhbWFnZSAodmFsKSB7XG4gICAgdGhpcy5oZWFsdGggPSBNYXRoLm1heCgwLCB0aGlzLmhlYWx0aCAtIHZhbClcbiAgfVxuXG4gIHdoZW5Ob0hlYWx0aCAoKSB7fVxufTtcblxuRGFtYWdlYWJsZS5wcm9wZXJ0aWVzKHtcbiAgZGFtYWdlYWJsZToge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgbWF4SGVhbHRoOiB7XG4gICAgZGVmYXVsdDogMTAwMFxuICB9LFxuICBoZWFsdGg6IHtcbiAgICBkZWZhdWx0OiAxMDAwLFxuICAgIGNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2hlbk5vSGVhbHRoKClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gRGFtYWdlYWJsZVxuIiwiY29uc3QgVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWRcblxuY29uc3QgZGlyZWN0aW9ucyA9IHtcbiAgaG9yaXpvbnRhbDogJ2hvcml6b250YWwnLFxuICB2ZXJ0aWNhbDogJ3ZlcnRpY2FsJ1xufVxuXG5jbGFzcyBEb29yIGV4dGVuZHMgVGlsZWQge1xuICB1cGRhdGVUaWxlTWVtYmVycyAob2xkKSB7XG4gICAgdmFyIHJlZiwgcmVmMSwgcmVmMiwgcmVmM1xuICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgaWYgKChyZWYgPSBvbGQud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgIHJlZi5yZW1vdmVQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSlcbiAgICAgIH1cbiAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgcmVmMS5yZW1vdmVQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgaWYgKChyZWYyID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYyLmFkZFByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIChyZWYzID0gdGhpcy50aWxlLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCA/IHJlZjMuYWRkUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpIDogbnVsbFxuICAgIH1cbiAgfVxufTtcblxuRG9vci5wcm9wZXJ0aWVzKHtcbiAgdGlsZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkKSB7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVUaWxlTWVtYmVycyhvbGQpXG4gICAgfVxuICB9LFxuICBvcGVuOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgZGlyZWN0aW9uOiB7XG4gICAgZGVmYXVsdDogZGlyZWN0aW9ucy5ob3Jpem9udGFsXG4gIH1cbn0pXG5cbkRvb3IuZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPSBEb29yXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS53YXRjaGVycy5Qcm9wZXJ0eVdhdGNoZXJcbmNvbnN0IENvbmZyb250YXRpb24gPSByZXF1aXJlKCcuL0NvbmZyb250YXRpb24nKVxuXG5jbGFzcyBFbmNvdW50ZXJNYW5hZ2VyIGV4dGVuZHMgRWxlbWVudCB7XG4gIGluaXQgKCkge1xuICAgIHJldHVybiB0aGlzLmxvY2F0aW9uV2F0Y2hlci5iaW5kKClcbiAgfVxuXG4gIHRlc3RFbmNvdW50ZXIgKCkge1xuICAgIGlmICh0aGlzLnJuZygpIDw9IHRoaXMuYmFzZVByb2JhYmlsaXR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydEVuY291bnRlcigpXG4gICAgfVxuICB9XG5cbiAgc3RhcnRFbmNvdW50ZXIgKCkge1xuICAgIHZhciBlbmNvdW50ZXJcbiAgICBlbmNvdW50ZXIgPSBuZXcgQ29uZnJvbnRhdGlvbih7XG4gICAgICBzdWJqZWN0OiB0aGlzLnN1YmplY3RcbiAgICB9KVxuICAgIHJldHVybiBlbmNvdW50ZXIuc3RhcnQoKVxuICB9XG59O1xuXG5FbmNvdW50ZXJNYW5hZ2VyLnByb3BlcnRpZXMoe1xuICBzdWJqZWN0OiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBiYXNlUHJvYmFiaWxpdHk6IHtcbiAgICBkZWZhdWx0OiAwLjJcbiAgfSxcbiAgbG9jYXRpb25XYXRjaGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGVzdEVuY291bnRlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnN1YmplY3QucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ2xvY2F0aW9uJylcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuICBybmc6IHtcbiAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuY291bnRlck1hbmFnZXJcbiIsImNvbnN0IFRpbGUgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVxuXG5jbGFzcyBGbG9vciBleHRlbmRzIFRpbGUge307XG5cbkZsb29yLnByb3BlcnRpZXMoe1xuICB3YWxrYWJsZToge1xuICAgIGNvbXBvc2VkOiB0cnVlXG4gIH0sXG4gIHRyYW5zcGFyZW50OiB7XG4gICAgY29tcG9zZWQ6IHRydWVcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5jb25zdCBWaWV3ID0gcmVxdWlyZSgnLi9WaWV3JylcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJylcblxuY2xhc3MgR2FtZSBleHRlbmRzIEVsZW1lbnQge1xuICBzdGFydCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBsYXllclxuICB9XG5cbiAgYWRkIChlbGVtKSB7XG4gICAgZWxlbS5nYW1lID0gdGhpc1xuICAgIHJldHVybiBlbGVtXG4gIH1cbn07XG5cbkdhbWUucHJvcGVydGllcyh7XG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKVxuICAgIH1cbiAgfSxcbiAgbWFpblZpZXc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnZpZXdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlld3MuZ2V0KDApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBWaWV3Q2xhc3MgPSB0aGlzLmRlZmF1bHRWaWV3Q2xhc3NcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG5ldyBWaWV3Q2xhc3MoKSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXdzOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZVxuICB9LFxuICBjdXJyZW50UGxheWVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5wbGF5ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVycy5nZXQoMClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IFBsYXllckNsYXNzID0gdGhpcy5kZWZhdWx0UGxheWVyQ2xhc3NcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG5ldyBQbGF5ZXJDbGFzcygpKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcGxheWVyczoge1xuICAgIGNvbGxlY3Rpb246IHRydWVcbiAgfVxufSlcblxuR2FtZS5wcm90b3R5cGUuZGVmYXVsdFZpZXdDbGFzcyA9IFZpZXdcblxuR2FtZS5wcm90b3R5cGUuZGVmYXVsdFBsYXllckNsYXNzID0gUGxheWVyXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVxuIiwiY29uc3QgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5Db2xsZWN0aW9uXG5cbmNsYXNzIEludmVudG9yeSBleHRlbmRzIENvbGxlY3Rpb24ge1xuICBnZXRCeVR5cGUgKHR5cGUpIHtcbiAgICB2YXIgcmVzXG4gICAgcmVzID0gdGhpcy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgIHJldHVybiByLnR5cGUgPT09IHR5cGVcbiAgICB9KVxuICAgIGlmIChyZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmVzWzBdXG4gICAgfVxuICB9XG5cbiAgYWRkQnlUeXBlICh0eXBlLCBxdGUsIHBhcnRpYWwgPSBmYWxzZSkge1xuICAgIHZhciByZXNzb3VyY2VcbiAgICByZXNzb3VyY2UgPSB0aGlzLmdldEJ5VHlwZSh0eXBlKVxuICAgIGlmICghcmVzc291cmNlKSB7XG4gICAgICByZXNzb3VyY2UgPSB0aGlzLmluaXRSZXNzb3VyY2UodHlwZSlcbiAgICB9XG4gICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgIHJlc3NvdXJjZS5wYXJ0aWFsQ2hhbmdlKHJlc3NvdXJjZS5xdGUgKyBxdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3NvdXJjZS5xdGUgKz0gcXRlXG4gICAgfVxuICB9XG5cbiAgaW5pdFJlc3NvdXJjZSAodHlwZSwgb3B0KSB7XG4gICAgcmV0dXJuIHR5cGUuaW5pdFJlc3NvdXJjZShvcHQpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZlbnRvcnlcbiIsImNsYXNzIExpbmVPZlNpZ2h0IHtcbiAgY29uc3RydWN0b3IgKHRpbGVzLCB4MSA9IDAsIHkxID0gMCwgeDIgPSAwLCB5MiA9IDApIHtcbiAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB0aGlzLngxID0geDFcbiAgICB0aGlzLnkxID0geTFcbiAgICB0aGlzLngyID0geDJcbiAgICB0aGlzLnkyID0geTJcbiAgfVxuXG4gIHNldFgxICh2YWwpIHtcbiAgICB0aGlzLngxID0gdmFsXG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpXG4gIH1cblxuICBzZXRZMSAodmFsKSB7XG4gICAgdGhpcy55MSA9IHZhbFxuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKVxuICB9XG5cbiAgc2V0WDIgKHZhbCkge1xuICAgIHRoaXMueDIgPSB2YWxcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKClcbiAgfVxuXG4gIHNldFkyICh2YWwpIHtcbiAgICB0aGlzLnkyID0gdmFsXG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpXG4gIH1cblxuICBpbnZhbGlkYWRlICgpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0gbnVsbFxuICAgIHRoaXMuc3VjY2VzcyA9IG51bGxcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICB9XG5cbiAgdGVzdFRpbGUgKHRpbGUsIGVudHJ5WCwgZW50cnlZKSB7XG4gICAgaWYgKHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUsIGVudHJ5WCwgZW50cnlZKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCkgJiYgKHR5cGVvZiB0aWxlLmdldFRyYW5zcGFyZW50ID09PSAnZnVuY3Rpb24nID8gdGlsZS5nZXRUcmFuc3BhcmVudCgpIDogdGlsZS50cmFuc3BhcmVudCAhPSBudWxsID8gdGlsZS50cmFuc3BhcmVudCA6IHRydWUpXG4gICAgfVxuICB9XG5cbiAgdGVzdFRpbGVBdCAoeCwgeSwgZW50cnlYLCBlbnRyeVkpIHtcbiAgICByZXR1cm4gdGhpcy50ZXN0VGlsZSh0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih4KSwgTWF0aC5mbG9vcih5KSksIGVudHJ5WCwgZW50cnlZKVxuICB9XG5cbiAgcmV2ZXJzZVRyYWNpbmcgKCkge1xuICAgIHZhciB0bXBYLCB0bXBZXG4gICAgdG1wWCA9IHRoaXMueDFcbiAgICB0bXBZID0gdGhpcy55MVxuICAgIHRoaXMueDEgPSB0aGlzLngyXG4gICAgdGhpcy55MSA9IHRoaXMueTJcbiAgICB0aGlzLngyID0gdG1wWFxuICAgIHRoaXMueTIgPSB0bXBZXG4gICAgdGhpcy5yZXZlcnNlZCA9ICF0aGlzLnJldmVyc2VkXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHZhciBuZXh0WCwgbmV4dFksIHBvc2l0aXZlWCwgcG9zaXRpdmVZLCByYXRpbywgdGlsZVgsIHRpbGVZLCB0b3RhbCwgeCwgeVxuICAgIHJhdGlvID0gKHRoaXMueDIgLSB0aGlzLngxKSAvICh0aGlzLnkyIC0gdGhpcy55MSlcbiAgICB0b3RhbCA9IE1hdGguYWJzKHRoaXMueDIgLSB0aGlzLngxKSArIE1hdGguYWJzKHRoaXMueTIgLSB0aGlzLnkxKVxuICAgIHBvc2l0aXZlWCA9ICh0aGlzLngyIC0gdGhpcy54MSkgPj0gMFxuICAgIHBvc2l0aXZlWSA9ICh0aGlzLnkyIC0gdGhpcy55MSkgPj0gMFxuICAgIHRpbGVYID0geCA9IHRoaXMueDFcbiAgICB0aWxlWSA9IHkgPSB0aGlzLnkxXG4gICAgaWYgKHRoaXMucmV2ZXJzZWQpIHtcbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDFcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICB9XG4gICAgd2hpbGUgKHRvdGFsID4gTWF0aC5hYnMoeCAtIHRoaXMueDEpICsgTWF0aC5hYnMoeSAtIHRoaXMueTEpICYmIHRoaXMudGVzdFRpbGVBdCh0aWxlWCwgdGlsZVksIHgsIHkpKSB7XG4gICAgICBuZXh0WCA9IHBvc2l0aXZlWCA/IE1hdGguZmxvb3IoeCkgKyAxIDogTWF0aC5jZWlsKHgpIC0gMVxuICAgICAgbmV4dFkgPSBwb3NpdGl2ZVkgPyBNYXRoLmZsb29yKHkpICsgMSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICAgIGlmICh0aGlzLngyIC0gdGhpcy54MSA9PT0gMCkge1xuICAgICAgICB5ID0gbmV4dFlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy55MiAtIHRoaXMueTEgPT09IDApIHtcbiAgICAgICAgeCA9IG5leHRYXG4gICAgICB9IGVsc2UgaWYgKE1hdGguYWJzKChuZXh0WCAtIHgpIC8gKHRoaXMueDIgLSB0aGlzLngxKSkgPCBNYXRoLmFicygobmV4dFkgLSB5KSAvICh0aGlzLnkyIC0gdGhpcy55MSkpKSB7XG4gICAgICAgIHggPSBuZXh0WFxuICAgICAgICB5ID0gKG5leHRYIC0gdGhpcy54MSkgLyByYXRpbyArIHRoaXMueTFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHggPSAobmV4dFkgLSB0aGlzLnkxKSAqIHJhdGlvICsgdGhpcy54MVxuICAgICAgICB5ID0gbmV4dFlcbiAgICAgIH1cbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDFcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICB9XG4gICAgaWYgKHRvdGFsIDw9IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSkge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogdGhpcy54MixcbiAgICAgICAgeTogdGhpcy55MixcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGhpcy54MiksIE1hdGguZmxvb3IodGhpcy55MikpXG4gICAgICB9XG4gICAgICB0aGlzLnN1Y2Nlc3MgPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRpbGVYKSwgTWF0aC5mbG9vcih0aWxlWSkpXG4gICAgICB9XG4gICAgICB0aGlzLnN1Y2Nlc3MgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGZvcmNlU3VjY2VzcyAoKSB7XG4gICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgIHg6IHRoaXMueDIsXG4gICAgICB5OiB0aGlzLnkyLFxuICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGhpcy54MiksIE1hdGguZmxvb3IodGhpcy55MikpXG4gICAgfVxuICAgIHRoaXMuc3VjY2VzcyA9IHRydWVcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGdldFN1Y2Nlc3MgKCkge1xuICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bCgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3NcbiAgfVxuXG4gIGdldEVuZFBvaW50ICgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5jYWxjdWwoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmRQb2ludFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZU9mU2lnaHRcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBNYXAgZXh0ZW5kcyBFbGVtZW50IHtcbiAgX2FkZFRvQm9uZGFyaWVzIChsb2NhdGlvbiwgYm91bmRhcmllcykge1xuICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgbG9jYXRpb24ueSA8IGJvdW5kYXJpZXMudG9wKSB7XG4gICAgICBib3VuZGFyaWVzLnRvcCA9IGxvY2F0aW9uLnlcbiAgICB9XG4gICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgbG9jYXRpb24ueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgYm91bmRhcmllcy5sZWZ0ID0gbG9jYXRpb24ueFxuICAgIH1cbiAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IGxvY2F0aW9uLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgYm91bmRhcmllcy5ib3R0b20gPSBsb2NhdGlvbi55XG4gICAgfVxuICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCBsb2NhdGlvbi54ID4gYm91bmRhcmllcy5yaWdodCkge1xuICAgICAgYm91bmRhcmllcy5yaWdodCA9IGxvY2F0aW9uLnhcbiAgICB9XG4gIH1cbn07XG5cbk1hcC5wcm9wZXJ0aWVzKHtcbiAgbG9jYXRpb25zOiB7XG4gICAgY29sbGVjdGlvbjoge1xuICAgICAgY2xvc2VzdDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdmFyIG1pbiwgbWluRGlzdFxuICAgICAgICBtaW4gPSBudWxsXG4gICAgICAgIG1pbkRpc3QgPSBudWxsXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgICAgICB2YXIgZGlzdFxuICAgICAgICAgIGRpc3QgPSBsb2NhdGlvbi5kaXN0KHgsIHkpXG4gICAgICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgICAgIG1pbiA9IGxvY2F0aW9uXG4gICAgICAgICAgICBtaW5EaXN0ID0gZGlzdFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIG1pblxuICAgICAgfSxcbiAgICAgIGNsb3Nlc3RzOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB2YXIgZGlzdHNcbiAgICAgICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlzdDogbG9jYXRpb24uZGlzdCh4LCB5KSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgZGlzdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3RcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weShkaXN0cy5tYXAoZnVuY3Rpb24gKGRpc3QpIHtcbiAgICAgICAgICByZXR1cm4gZGlzdC5sb2NhdGlvblxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJvdW5kYXJpZXM6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBib3VuZGFyaWVzXG4gICAgICBib3VuZGFyaWVzID0ge1xuICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgIGxlZnQ6IG51bGwsXG4gICAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgICAgcmlnaHQ6IG51bGxcbiAgICAgIH1cbiAgICAgIHRoaXMubG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRUb0JvbmRhcmllcyhsb2NhdGlvbiwgYm91bmRhcmllcylcbiAgICAgIH0pXG4gICAgICByZXR1cm4gYm91bmRhcmllc1xuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBcbiIsImNvbnN0IFRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkXG5cbmNsYXNzIE9ic3RhY2xlIGV4dGVuZHMgVGlsZWQge1xuICB1cGRhdGVXYWxrYWJsZXMgKG9sZCkge1xuICAgIHZhciByZWYsIHJlZjFcbiAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgIGlmICgocmVmID0gb2xkLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYucmVtb3ZlUmVmKHtcbiAgICAgICAgICBuYW1lOiAnd2Fsa2FibGUnLFxuICAgICAgICAgIG9iajogdGhpc1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICByZXR1cm4gKHJlZjEgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsID8gcmVmMS5zZXRWYWx1ZVJlZihmYWxzZSwgJ3dhbGthYmxlJywgdGhpcykgOiBudWxsXG4gICAgfVxuICB9XG59O1xuXG5PYnN0YWNsZS5wcm9wZXJ0aWVzKHtcbiAgdGlsZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkLCBvdmVycmlkZWQpIHtcbiAgICAgIG92ZXJyaWRlZChvbGQpXG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVXYWxrYWJsZXMob2xkKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBPYnN0YWNsZVxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jbGFzcyBQYXRoV2FsayBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAod2Fsa2VyLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucylcbiAgICB0aGlzLndhbGtlciA9IHdhbGtlclxuICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgfVxuXG4gIHN0YXJ0ICgpIHtcbiAgICBpZiAoIXRoaXMucGF0aC5zb2x1dGlvbikge1xuICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpXG4gICAgfVxuICAgIGlmICh0aGlzLnBhdGguc29sdXRpb24pIHtcbiAgICAgIHRoaXMucGF0aFRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKClcbiAgICAgIH0sIHRoaXMudG90YWxUaW1lKVxuICAgICAgdGhpcy53YWxrZXIudGlsZU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi50aWxlJywgdGhpcylcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFhNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpXG4gICAgICByZXR1cm4gdGhpcy53YWxrZXIub2Zmc2V0WU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi5vZmZzZXRZJywgdGhpcylcbiAgICB9XG4gIH1cblxuICBzdG9wICgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoVGltZW91dC5wYXVzZSgpXG4gIH1cblxuICBmaW5pc2ggKCkge1xuICAgIHRoaXMud2Fsa2VyLnRpbGUgPSB0aGlzLnBvc2l0aW9uLnRpbGVcbiAgICB0aGlzLndhbGtlci5vZmZzZXRYID0gdGhpcy5wb3NpdGlvbi5vZmZzZXRYXG4gICAgdGhpcy53YWxrZXIub2Zmc2V0WSA9IHRoaXMucG9zaXRpb24ub2Zmc2V0WVxuICAgIHRoaXMuZW1pdCgnZmluaXNoZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBpbnRlcnJ1cHQgKCkge1xuICAgIHRoaXMuZW1pdCgnaW50ZXJydXB0ZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBlbmQgKCkge1xuICAgIHRoaXMuZW1pdCgnZW5kJylcbiAgICByZXR1cm4gdGhpcy5kZXN0cm95KClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLndhbGtlci53YWxrID09PSB0aGlzKSB7XG4gICAgICB0aGlzLndhbGtlci53YWxrID0gbnVsbFxuICAgIH1cbiAgICB0aGlzLndhbGtlci50aWxlTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLnRpbGUnLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLndhbGtlci5vZmZzZXRYTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFgnLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLndhbGtlci5vZmZzZXRZTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFknLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLnBhdGhUaW1lb3V0LmRlc3Ryb3koKVxuICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKClcbiAgfVxufTtcblxuUGF0aFdhbGsuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKVxuXG5QYXRoV2Fsay5wcm9wZXJ0aWVzKHtcbiAgc3BlZWQ6IHtcbiAgICBkZWZhdWx0OiA1XG4gIH0sXG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlZlxuICAgICAgaWYgKChyZWYgPSB0aGlzLndhbGtlci5nYW1lKSAhPSBudWxsID8gcmVmLnRpbWluZyA6IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2VyLmdhbWUudGltaW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwYXRoTGVuZ3RoOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKClcbiAgICB9XG4gIH0sXG4gIHRvdGFsVGltZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aExlbmd0aCAvIHRoaXMuc3BlZWQgKiAxMDAwXG4gICAgfVxuICB9LFxuICBwb3NpdGlvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoLmdldFBvc0F0UHJjKGludmFsaWRhdG9yLnByb3BQYXRoKCdwYXRoVGltZW91dC5wcmMnKSB8fCAwKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoV2Fsa1xuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBMaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKVxuY29uc3QgVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKVxuXG5jbGFzcyBQZXJzb25hbFdlYXBvbiBleHRlbmRzIEVsZW1lbnQge1xuICBjYW5CZVVzZWQgKCkge1xuICAgIHJldHVybiB0aGlzLmNoYXJnZWRcbiAgfVxuXG4gIGNhblVzZU9uICh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5jYW5Vc2VGcm9tKHRoaXMudXNlci50aWxlLCB0YXJnZXQpXG4gIH1cblxuICBjYW5Vc2VGcm9tICh0aWxlLCB0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5yYW5nZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5SYW5nZSh0aWxlLCB0YXJnZXQpICYmIHRoaXMuaGFzTGluZU9mU2lnaHQodGlsZSwgdGFyZ2V0KVxuICAgIH1cbiAgfVxuXG4gIGluUmFuZ2UgKHRpbGUsIHRhcmdldCkge1xuICAgIHZhciByZWYsIHRhcmdldFRpbGVcbiAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0XG4gICAgcmV0dXJuICgocmVmID0gdGlsZS5kaXN0KHRhcmdldFRpbGUpKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IG51bGwpIDw9IHRoaXMucmFuZ2VcbiAgfVxuXG4gIGluTWVsZWVSYW5nZSAodGlsZSwgdGFyZ2V0KSB7XG4gICAgdmFyIHRhcmdldFRpbGVcbiAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0XG4gICAgcmV0dXJuIE1hdGguYWJzKHRhcmdldFRpbGUueCAtIHRpbGUueCkgKyBNYXRoLmFicyh0YXJnZXRUaWxlLnkgLSB0aWxlLnkpID09PSAxXG4gIH1cblxuICBoYXNMaW5lT2ZTaWdodCAodGlsZSwgdGFyZ2V0KSB7XG4gICAgdmFyIGxvcywgdGFyZ2V0VGlsZVxuICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXRcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGFyZ2V0VGlsZS5jb250YWluZXIsIHRpbGUueCArIDAuNSwgdGlsZS55ICsgMC41LCB0YXJnZXRUaWxlLnggKyAwLjUsIHRhcmdldFRpbGUueSArIDAuNSlcbiAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICByZXR1cm4gdGlsZS53YWxrYWJsZVxuICAgIH1cbiAgICByZXR1cm4gbG9zLmdldFN1Y2Nlc3MoKVxuICB9XG5cbiAgdXNlT24gKHRhcmdldCkge1xuICAgIGlmICh0aGlzLmNhbkJlVXNlZCgpKSB7XG4gICAgICB0YXJnZXQuZGFtYWdlKHRoaXMucG93ZXIpXG4gICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZVxuICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2UoKVxuICAgIH1cbiAgfVxuXG4gIHJlY2hhcmdlICgpIHtcbiAgICB0aGlzLmNoYXJnaW5nID0gdHJ1ZVxuICAgIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5jaGFyZ2luZyA9IGZhbHNlXG4gICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZWQoKVxuICAgIH0sIHRoaXMucmVjaGFyZ2VUaW1lKVxuICB9XG5cbiAgcmVjaGFyZ2VkICgpIHtcbiAgICB0aGlzLmNoYXJnZWQgPSB0cnVlXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5jaGFyZ2VUaW1lb3V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VUaW1lb3V0LmRlc3Ryb3koKVxuICAgIH1cbiAgfVxufTtcblxuUGVyc29uYWxXZWFwb24ucHJvcGVydGllcyh7XG4gIHJlY2hhcmdlVGltZToge1xuICAgIGRlZmF1bHQ6IDEwMDBcbiAgfSxcbiAgY2hhcmdlZDoge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgY2hhcmdpbmc6IHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgZHBzOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMucG93ZXJQcm9wZXJ0eSkgLyBpbnZhbGlkYXRvci5wcm9wKHRoaXMucmVjaGFyZ2VUaW1lUHJvcGVydHkpICogMTAwMFxuICAgIH1cbiAgfSxcbiAgcmFuZ2U6IHtcbiAgICBkZWZhdWx0OiAxMFxuICB9LFxuICB1c2VyOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uYWxXZWFwb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgc2V0RGVmYXVsdHMgKCkge1xuICAgIHZhciBmaXJzdFxuICAgIGZpcnN0ID0gdGhpcy5nYW1lLnBsYXllcnMubGVuZ3RoID09PSAwXG4gICAgdGhpcy5nYW1lLnBsYXllcnMuYWRkKHRoaXMpXG4gICAgaWYgKGZpcnN0ICYmICF0aGlzLmNvbnRyb2xsZXIgJiYgdGhpcy5nYW1lLmRlZmF1bHRQbGF5ZXJDb250cm9sbGVyQ2xhc3MpIHtcbiAgICAgIGNvbnN0IFBsYXllckNvbnRyb2xsZXJDbGFzcyA9IHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzXG4gICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgUGxheWVyQ29udHJvbGxlckNsYXNzKClcbiAgICB9XG4gIH1cblxuICBjYW5UYXJnZXRBY3Rpb25PbiAoZWxlbSkge1xuICAgIHZhciBhY3Rpb24sIHJlZlxuICAgIGFjdGlvbiA9IHRoaXMuc2VsZWN0ZWRBY3Rpb24gfHwgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLmRlZmF1bHRBY3Rpb24gOiBudWxsKVxuICAgIHJldHVybiAoYWN0aW9uICE9IG51bGwpICYmIHR5cGVvZiBhY3Rpb24uY2FuVGFyZ2V0ID09PSAnZnVuY3Rpb24nICYmIGFjdGlvbi5jYW5UYXJnZXQoZWxlbSlcbiAgfVxuXG4gIGd1ZXNzQWN0aW9uVGFyZ2V0IChhY3Rpb24pIHtcbiAgICB2YXIgc2VsZWN0ZWRcbiAgICBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWRcbiAgICBpZiAodHlwZW9mIGFjdGlvbi5jYW5UYXJnZXQgPT09ICdmdW5jdGlvbicgJiYgKGFjdGlvbi50YXJnZXQgPT0gbnVsbCkgJiYgYWN0aW9uLmFjdG9yICE9PSBzZWxlY3RlZCAmJiBhY3Rpb24uY2FuVGFyZ2V0KHNlbGVjdGVkKSkge1xuICAgICAgcmV0dXJuIGFjdGlvbi53aXRoVGFyZ2V0KHNlbGVjdGVkKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYWN0aW9uXG4gICAgfVxuICB9XG5cbiAgY2FuU2VsZWN0IChlbGVtKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlbGVtLmlzU2VsZWN0YWJsZUJ5ID09PSAnZnVuY3Rpb24nICYmIGVsZW0uaXNTZWxlY3RhYmxlQnkodGhpcylcbiAgfVxuXG4gIGNhbkZvY3VzT24gKGVsZW0pIHtcbiAgICBpZiAodHlwZW9mIGVsZW0uSXNGb2N1c2FibGVCeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGVsZW0uSXNGb2N1c2FibGVCeSh0aGlzKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0uSXNTZWxlY3RhYmxlQnkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBlbGVtLklzU2VsZWN0YWJsZUJ5KHRoaXMpXG4gICAgfVxuICB9XG5cbiAgc2VsZWN0QWN0aW9uIChhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgYWN0aW9uLnN0YXJ0KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZWxlY3RlZEFjdGlvbiA9IGFjdGlvblxuICAgIH1cbiAgfVxuXG4gIHNldEFjdGlvblRhcmdldCAoZWxlbSkge1xuICAgIHZhciBhY3Rpb24sIHJlZlxuICAgIGFjdGlvbiA9IHRoaXMuc2VsZWN0ZWRBY3Rpb24gfHwgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLmRlZmF1bHRBY3Rpb24gOiBudWxsKVxuICAgIGFjdGlvbiA9IGFjdGlvbi53aXRoVGFyZ2V0KGVsZW0pXG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5zdGFydCgpXG4gICAgICB0aGlzLnNlbGVjdGVkQWN0aW9uID0gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGVkQWN0aW9uID0gYWN0aW9uXG4gICAgfVxuICB9XG59O1xuXG5QbGF5ZXIucHJvcGVydGllcyh7XG4gIG5hbWU6IHtcbiAgICBkZWZhdWx0OiAnUGxheWVyJ1xuICB9LFxuICBmb2N1c2VkOiB7fSxcbiAgc2VsZWN0ZWQ6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgdmFyIHJlZlxuICAgICAgaWYgKG9sZCAhPSBudWxsID8gb2xkLnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KCdzZWxlY3RlZCcpIDogbnVsbCkge1xuICAgICAgICBvbGQuc2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KCdzZWxlY3RlZCcpIDogbnVsbCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkLnNlbGVjdGVkID0gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZ2xvYmFsQWN0aW9uUHJvdmlkZXJzOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZVxuICB9LFxuICBhY3Rpb25Qcm92aWRlcnM6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgdmFyIHJlcywgc2VsZWN0ZWRcbiAgICAgIHJlcyA9IGludmFsaWRhdG9yLnByb3AodGhpcy5nbG9iYWxBY3Rpb25Qcm92aWRlcnNQcm9wZXJ0eSkudG9BcnJheSgpXG4gICAgICBzZWxlY3RlZCA9IGludmFsaWRhdG9yLnByb3AodGhpcy5zZWxlY3RlZFByb3BlcnR5KVxuICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgIHJlcy5wdXNoKHNlbGVjdGVkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfSxcbiAgYXZhaWxhYmxlQWN0aW9uczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCh0aGlzLmFjdGlvblByb3ZpZGVyc1Byb3BlcnR5KS5yZWR1Y2UoKHJlcywgcHJvdmlkZXIpID0+IHtcbiAgICAgICAgdmFyIGFjdGlvbnMsIHNlbGVjdGVkXG4gICAgICAgIGFjdGlvbnMgPSBpbnZhbGlkYXRvci5wcm9wKHByb3ZpZGVyLmFjdGlvbnNQcm9wZXJ0eSkudG9BcnJheSgpXG4gICAgICAgIHNlbGVjdGVkID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnNlbGVjdGVkUHJvcGVydHkpXG4gICAgICAgIGlmIChzZWxlY3RlZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWN0aW9ucyA9IGFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmd1ZXNzQWN0aW9uVGFyZ2V0KGFjdGlvbilcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25zKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoYWN0aW9ucylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzXG4gICAgICAgIH1cbiAgICAgIH0sIFtdKVxuICAgIH1cbiAgfSxcbiAgc2VsZWN0ZWRBY3Rpb246IHt9LFxuICBjb250cm9sbGVyOiB7XG4gICAgY2hhbmdlOiBmdW5jdGlvbiAodmFsLCBvbGQpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRyb2xsZXIpIHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnBsYXllciA9IHRoaXNcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGdhbWU6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXREZWZhdWx0cygpXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5cbmNsYXNzIFByb2plY3RpbGUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zKVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBpbml0ICgpIHt9XG5cbiAgbGF1bmNoICgpIHtcbiAgICB0aGlzLm1vdmluZyA9IHRydWVcbiAgICB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmRlbGl2ZXJQYXlsb2FkKClcbiAgICAgIHRoaXMubW92aW5nID0gZmFsc2VcbiAgICB9LCB0aGlzLnBhdGhMZW5ndGggLyB0aGlzLnNwZWVkICogMTAwMClcbiAgfVxuXG4gIGRlbGl2ZXJQYXlsb2FkICgpIHtcbiAgICBjb25zdCBQcm9wYWdhdGlvblR5cGUgPSB0aGlzLnByb3BhZ2F0aW9uVHlwZVxuICAgIGNvbnN0IHBheWxvYWQgPSBuZXcgUHJvcGFnYXRpb25UeXBlKHtcbiAgICAgIHRpbGU6IHRoaXMudGFyZ2V0LnRpbGUgfHwgdGhpcy50YXJnZXQsXG4gICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgIHJhbmdlOiB0aGlzLmJsYXN0UmFuZ2VcbiAgICB9KVxuICAgIHBheWxvYWQuYXBwbHkoKVxuICAgIHRoaXMucGF5bG9hZERlbGl2ZXJlZCgpXG4gICAgcmV0dXJuIHBheWxvYWRcbiAgfVxuXG4gIHBheWxvYWREZWxpdmVyZWQgKCkge1xuICAgIHJldHVybiB0aGlzLmRlc3Ryb3koKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpXG4gIH1cbn07XG5cblByb2plY3RpbGUucHJvcGVydGllcyh7XG4gIG9yaWdpbjoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgdGFyZ2V0OiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBwb3dlcjoge1xuICAgIGRlZmF1bHQ6IDEwXG4gIH0sXG4gIGJsYXN0UmFuZ2U6IHtcbiAgICBkZWZhdWx0OiAxXG4gIH0sXG4gIHByb3BhZ2F0aW9uVHlwZToge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgc3BlZWQ6IHtcbiAgICBkZWZhdWx0OiAxMFxuICB9LFxuICBwYXRoTGVuZ3RoOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZGlzdFxuICAgICAgaWYgKCh0aGlzLm9yaWdpblRpbGUgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0VGlsZSAhPSBudWxsKSkge1xuICAgICAgICBkaXN0ID0gdGhpcy5vcmlnaW5UaWxlLmRpc3QodGhpcy50YXJnZXRUaWxlKVxuICAgICAgICBpZiAoZGlzdCkge1xuICAgICAgICAgIHJldHVybiBkaXN0Lmxlbmd0aFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gMTAwXG4gICAgfVxuICB9LFxuICBvcmlnaW5UaWxlOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHZhciBvcmlnaW5cbiAgICAgIG9yaWdpbiA9IGludmFsaWRhdG9yLnByb3AodGhpcy5vcmlnaW5Qcm9wZXJ0eSlcbiAgICAgIGlmIChvcmlnaW4gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gb3JpZ2luLnRpbGUgfHwgb3JpZ2luXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB0YXJnZXRUaWxlOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHZhciB0YXJnZXRcbiAgICAgIHRhcmdldCA9IGludmFsaWRhdG9yLnByb3AodGhpcy50YXJnZXRQcm9wZXJ0eSlcbiAgICAgIGlmICh0YXJnZXQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBjb250YWluZXI6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgb3JpZ2luVGlsZSwgdGFyZ2V0VGlsZVxuICAgICAgb3JpZ2luVGlsZSA9IGludmFsaWRhdGUucHJvcCh0aGlzLm9yaWdpblRpbGVQcm9wZXJ0eSlcbiAgICAgIHRhcmdldFRpbGUgPSBpbnZhbGlkYXRlLnByb3AodGhpcy50YXJnZXRUaWxlUHJvcGVydHkpXG4gICAgICBpZiAob3JpZ2luVGlsZS5jb250YWluZXIgPT09IHRhcmdldFRpbGUuY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5UaWxlLmNvbnRhaW5lclxuICAgICAgfSBlbHNlIGlmIChpbnZhbGlkYXRlLnByb3AodGhpcy5wcmNQYXRoUHJvcGVydHkpID4gMC41KSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRUaWxlLmNvbnRhaW5lclxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpblRpbGUuY29udGFpbmVyXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB4OiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0ZSkge1xuICAgICAgdmFyIHN0YXJ0UG9zXG4gICAgICBzdGFydFBvcyA9IGludmFsaWRhdGUucHJvcCh0aGlzLnN0YXJ0UG9zUHJvcGVydHkpXG4gICAgICByZXR1cm4gKGludmFsaWRhdGUucHJvcCh0aGlzLnRhcmdldFBvc1Byb3BlcnR5KS54IC0gc3RhcnRQb3MueCkgKiBpbnZhbGlkYXRlLnByb3AodGhpcy5wcmNQYXRoUHJvcGVydHkpICsgc3RhcnRQb3MueFxuICAgIH1cbiAgfSxcbiAgeToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdGUpIHtcbiAgICAgIHZhciBzdGFydFBvc1xuICAgICAgc3RhcnRQb3MgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5zdGFydFBvc1Byb3BlcnR5KVxuICAgICAgcmV0dXJuIChpbnZhbGlkYXRlLnByb3AodGhpcy50YXJnZXRQb3NQcm9wZXJ0eSkueSAtIHN0YXJ0UG9zLnkpICogaW52YWxpZGF0ZS5wcm9wKHRoaXMucHJjUGF0aFByb3BlcnR5KSArIHN0YXJ0UG9zLnlcbiAgICB9XG4gIH0sXG4gIHN0YXJ0UG9zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0ZSkge1xuICAgICAgdmFyIGNvbnRhaW5lciwgZGlzdCwgb2Zmc2V0LCBvcmlnaW5UaWxlXG4gICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMub3JpZ2luVGlsZVByb3BlcnR5KVxuICAgICAgY29udGFpbmVyID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMuY29udGFpbmVyUHJvcGVydHkpXG4gICAgICBvZmZzZXQgPSB0aGlzLnN0YXJ0T2Zmc2V0XG4gICAgICBpZiAob3JpZ2luVGlsZS5jb250YWluZXIgIT09IGNvbnRhaW5lcikge1xuICAgICAgICBkaXN0ID0gY29udGFpbmVyLmRpc3Qob3JpZ2luVGlsZS5jb250YWluZXIpXG4gICAgICAgIG9mZnNldC54ICs9IGRpc3QueFxuICAgICAgICBvZmZzZXQueSArPSBkaXN0LnlcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IG9yaWdpblRpbGUueCArIG9mZnNldC54LFxuICAgICAgICB5OiBvcmlnaW5UaWxlLnkgKyBvZmZzZXQueVxuICAgICAgfVxuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfSxcbiAgdGFyZ2V0UG9zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0ZSkge1xuICAgICAgdmFyIGNvbnRhaW5lciwgZGlzdCwgb2Zmc2V0LCB0YXJnZXRUaWxlXG4gICAgICB0YXJnZXRUaWxlID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMudGFyZ2V0VGlsZVByb3BlcnR5KVxuICAgICAgY29udGFpbmVyID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMuY29udGFpbmVyUHJvcGVydHkpXG4gICAgICBvZmZzZXQgPSB0aGlzLnRhcmdldE9mZnNldFxuICAgICAgaWYgKHRhcmdldFRpbGUuY29udGFpbmVyICE9PSBjb250YWluZXIpIHtcbiAgICAgICAgZGlzdCA9IGNvbnRhaW5lci5kaXN0KHRhcmdldFRpbGUuY29udGFpbmVyKVxuICAgICAgICBvZmZzZXQueCArPSBkaXN0LnhcbiAgICAgICAgb2Zmc2V0LnkgKz0gZGlzdC55XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0YXJnZXRUaWxlLnggKyBvZmZzZXQueCxcbiAgICAgICAgeTogdGFyZ2V0VGlsZS55ICsgb2Zmc2V0LnlcbiAgICAgIH1cbiAgICB9LFxuICAgIG91dHB1dDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbClcbiAgICB9XG4gIH0sXG4gIHN0YXJ0T2Zmc2V0OiB7XG4gICAgZGVmYXVsdDoge1xuICAgICAgeDogMC41LFxuICAgICAgeTogMC41XG4gICAgfSxcbiAgICBvdXRwdXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpXG4gICAgfVxuICB9LFxuICB0YXJnZXRPZmZzZXQ6IHtcbiAgICBkZWZhdWx0OiB7XG4gICAgICB4OiAwLjUsXG4gICAgICB5OiAwLjVcbiAgICB9LFxuICAgIG91dHB1dDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbClcbiAgICB9XG4gIH0sXG4gIHByY1BhdGg6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZWZcbiAgICAgIHJldHVybiAoKHJlZiA9IHRoaXMucGF0aFRpbWVvdXQpICE9IG51bGwgPyByZWYucHJjIDogbnVsbCkgfHwgMFxuICAgIH1cbiAgfSxcbiAgdGltaW5nOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgfVxuICB9LFxuICBtb3Zpbmc6IHtcbiAgICBkZWZhdWx0OiBmYWxzZVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RpbGVcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBSZXNzb3VyY2UgZXh0ZW5kcyBFbGVtZW50IHtcbiAgcGFydGlhbENoYW5nZSAocXRlKSB7XG4gICAgdmFyIGFjY2VwdGFibGVcbiAgICBhY2NlcHRhYmxlID0gTWF0aC5tYXgodGhpcy5taW5RdGUsIE1hdGgubWluKHRoaXMubWF4UXRlLCBxdGUpKVxuICAgIHRoaXMucXRlID0gYWNjZXB0YWJsZVxuICAgIHJldHVybiBxdGUgLSBhY2NlcHRhYmxlXG4gIH1cbn07XG5cblJlc3NvdXJjZS5wcm9wZXJ0aWVzKHtcbiAgdHlwZToge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgcXRlOiB7XG4gICAgZGVmYXVsdDogMCxcbiAgICBpbmdlc3Q6IGZ1bmN0aW9uIChxdGUpIHtcbiAgICAgIGlmICh0aGlzLm1heFF0ZSAhPT0gbnVsbCAmJiBxdGUgPiB0aGlzLm1heFF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgaGF2ZSBtb3JlIHRoYW4gJyArIHRoaXMubWF4UXRlICsgJyBvZiAnICsgdGhpcy50eXBlLm5hbWUpXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5taW5RdGUgIT09IG51bGwgJiYgcXRlIDwgdGhpcy5taW5RdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW50IGhhdmUgbGVzcyB0aGFuICcgKyB0aGlzLm1pblF0ZSArICcgb2YgJyArIHRoaXMudHlwZS5uYW1lKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHF0ZVxuICAgIH1cbiAgfSxcbiAgbWF4UXRlOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBtaW5RdGU6IHtcbiAgICBkZWZhdWx0OiAwXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUmVzc291cmNlXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFJlc3NvdXJjZSA9IHJlcXVpcmUoJy4vUmVzc291cmNlJylcblxuY2xhc3MgUmVzc291cmNlVHlwZSBleHRlbmRzIEVsZW1lbnQge1xuICBpbml0UmVzc291cmNlIChvcHQpIHtcbiAgICBpZiAodHlwZW9mIG9wdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdCA9IHtcbiAgICAgICAgcXRlOiBvcHRcbiAgICAgIH1cbiAgICB9XG4gICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0T3B0aW9ucywgb3B0KVxuICAgIGNvbnN0IFJlc3NvdXJjZUNsYXNzID0gdGhpcy5yZXNzb3VyY2VDbGFzc1xuICAgIHJldHVybiBuZXcgUmVzc291cmNlQ2xhc3Mob3B0KVxuICB9XG59O1xuXG5SZXNzb3VyY2VUeXBlLnByb3BlcnRpZXMoe1xuICBuYW1lOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICByZXNzb3VyY2VDbGFzczoge1xuICAgIGRlZmF1bHQ6IFJlc3NvdXJjZVxuICB9LFxuICBkZWZhdWx0T3B0aW9uczoge1xuICAgIGRlZmF1bHQ6IHt9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUmVzc291cmNlVHlwZVxuIiwidmFyIGluZGV4T2YgPSBbXS5pbmRleE9mXG5jb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lclxuY29uc3QgVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlXG5jb25zdCBEaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uXG5jb25zdCBEb29yID0gcmVxdWlyZSgnLi9Eb29yJylcblxuY2xhc3MgUm9vbUdlbmVyYXRvciBleHRlbmRzIEVsZW1lbnQge1xuICBpbml0VGlsZXMgKCkge1xuICAgIHRoaXMuZmluYWxUaWxlcyA9IG51bGxcbiAgICB0aGlzLnJvb21zID0gW11cbiAgICB0aGlzLmZyZWUgPSB0aGlzLnRpbGVDb250YWluZXIuYWxsVGlsZXMoKS5maWx0ZXIoKHRpbGUpID0+IHtcbiAgICAgIHZhciBkaXJlY3Rpb24sIGssIGxlbiwgbmV4dCwgcmVmXG4gICAgICByZWYgPSBEaXJlY3Rpb24uYWxsXG4gICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgZGlyZWN0aW9uID0gcmVmW2tdXG4gICAgICAgIG5leHQgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh0aWxlLnggKyBkaXJlY3Rpb24ueCwgdGlsZS55ICsgZGlyZWN0aW9uLnkpXG4gICAgICAgIGlmIChuZXh0ID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICB0aGlzLmluaXRUaWxlcygpXG4gICAgd2hpbGUgKHRoaXMuc3RlcCgpIHx8IHRoaXMubmV3Um9vbSgpKSB7fVxuICAgIHRoaXMuY3JlYXRlRG9vcnMoKVxuICAgIHRoaXMubWFrZUZpbmFsVGlsZXMoKVxuICB9XG5cbiAgZmxvb3JGYWN0b3J5IChvcHQpIHtcbiAgICByZXR1cm4gbmV3IFRpbGUob3B0LngsIG9wdC55KVxuICB9XG5cbiAgZG9vckZhY3RvcnkgKG9wdCkge1xuICAgIHJldHVybiB0aGlzLmZsb29yRmFjdG9yeShvcHQpXG4gIH1cblxuICBtYWtlRmluYWxUaWxlcyAoKSB7XG4gICAgdGhpcy5maW5hbFRpbGVzID0gdGhpcy50aWxlQ29udGFpbmVyLmFsbFRpbGVzKCkubWFwKCh0aWxlKSA9PiB7XG4gICAgICB2YXIgb3B0XG4gICAgICBpZiAodGlsZS5mYWN0b3J5ICE9IG51bGwpIHtcbiAgICAgICAgb3B0ID0ge1xuICAgICAgICAgIHg6IHRpbGUueCxcbiAgICAgICAgICB5OiB0aWxlLnlcbiAgICAgICAgfVxuICAgICAgICBpZiAodGlsZS5mYWN0b3J5T3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbihvcHQsIHRpbGUuZmFjdG9yeU9wdGlvbnMpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGUuZmFjdG9yeShvcHQpXG4gICAgICB9XG4gICAgfSkuZmlsdGVyKCh0aWxlKSA9PiB7XG4gICAgICByZXR1cm4gdGlsZSAhPSBudWxsXG4gICAgfSlcbiAgfVxuXG4gIGdldFRpbGVzICgpIHtcbiAgICBpZiAodGhpcy5maW5hbFRpbGVzID09IG51bGwpIHtcbiAgICAgIHRoaXMuY2FsY3VsKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluYWxUaWxlc1xuICB9XG5cbiAgbmV3Um9vbSAoKSB7XG4gICAgaWYgKHRoaXMuZnJlZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMudm9sdW1lID0gTWF0aC5mbG9vcih0aGlzLnJuZygpICogKHRoaXMubWF4Vm9sdW1lIC0gdGhpcy5taW5Wb2x1bWUpKSArIHRoaXMubWluVm9sdW1lXG4gICAgICB0aGlzLnJvb20gPSBuZXcgUm9vbUdlbmVyYXRvci5Sb29tKClcbiAgICAgIHJldHVybiB0aGlzLnJvb21cbiAgICB9XG4gIH1cblxuICByYW5kb21EaXJlY3Rpb25zICgpIHtcbiAgICB2YXIgaSwgaiwgbywgeFxuICAgIG8gPSBEaXJlY3Rpb24uYWRqYWNlbnRzLnNsaWNlKClcbiAgICBqID0gbnVsbFxuICAgIHggPSBudWxsXG4gICAgaSA9IG8ubGVuZ3RoXG4gICAgd2hpbGUgKGkpIHtcbiAgICAgIGogPSBNYXRoLmZsb29yKHRoaXMucm5nKCkgKiBpKVxuICAgICAgeCA9IG9bLS1pXVxuICAgICAgb1tpXSA9IG9bal1cbiAgICAgIG9bal0gPSB4XG4gICAgfVxuICAgIHJldHVybiBvXG4gIH1cblxuICBzdGVwICgpIHtcbiAgICB2YXIgc3VjY2VzcywgdHJpZXNcbiAgICBpZiAodGhpcy5yb29tKSB7XG4gICAgICBpZiAodGhpcy5mcmVlLmxlbmd0aCAmJiB0aGlzLnJvb20udGlsZXMubGVuZ3RoIDwgdGhpcy52b2x1bWUgLSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb20udGlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdHJpZXMgPSB0aGlzLnJhbmRvbURpcmVjdGlvbnMoKVxuICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZVxuICAgICAgICAgIHdoaWxlICh0cmllcy5sZW5ndGggJiYgIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmV4cGFuZCh0aGlzLnJvb20sIHRyaWVzLnBvcCgpLCB0aGlzLnZvbHVtZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLnJvb21Eb25lKClcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZSh0aGlzLnJhbmRvbUZyZWVUaWxlKCksIHRoaXMucm9vbSlcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb21Eb25lKClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcm9vbURvbmUgKCkge1xuICAgIHRoaXMucm9vbXMucHVzaCh0aGlzLnJvb20pXG4gICAgdGhpcy5hbGxvY2F0ZVdhbGxzKHRoaXMucm9vbSlcbiAgICB0aGlzLnJvb20gPSBudWxsXG4gIH1cblxuICBleHBhbmQgKHJvb20sIGRpcmVjdGlvbiwgbWF4ID0gMCkge1xuICAgIHZhciBrLCBsZW4sIG5leHQsIHJlZiwgc2Vjb25kLCBzdWNjZXNzLCB0aWxlXG4gICAgc3VjY2VzcyA9IGZhbHNlXG4gICAgcmVmID0gcm9vbS50aWxlc1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgdGlsZSA9IHJlZltrXVxuICAgICAgaWYgKG1heCA9PT0gMCB8fCByb29tLnRpbGVzLmxlbmd0aCA8IG1heCkge1xuICAgICAgICBuZXh0ID0gdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbilcbiAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZShuZXh0LCByb29tKVxuICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKChzZWNvbmQgPSB0aGlzLnRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uLCAyKSkgJiYgIXRoaXMudGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24sIDMpKSB7XG4gICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUoc2Vjb25kLCByb29tKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWNjZXNzXG4gIH1cblxuICBhbGxvY2F0ZVdhbGxzIChyb29tKSB7XG4gICAgdmFyIGRpcmVjdGlvbiwgaywgbGVuLCBuZXh0LCBuZXh0Um9vbSwgb3RoZXJTaWRlLCByZWYsIHJlc3VsdHMsIHRpbGVcbiAgICByZWYgPSByb29tLnRpbGVzXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICB0aWxlID0gcmVmW2tdXG4gICAgICByZXN1bHRzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbCwgbGVuMSwgcmVmMSwgcmVzdWx0czFcbiAgICAgICAgcmVmMSA9IERpcmVjdGlvbi5hbGxcbiAgICAgICAgcmVzdWx0czEgPSBbXVxuICAgICAgICBmb3IgKGwgPSAwLCBsZW4xID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4xOyBsKyspIHtcbiAgICAgICAgICBkaXJlY3Rpb24gPSByZWYxW2xdXG4gICAgICAgICAgbmV4dCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSlcbiAgICAgICAgICBpZiAoKG5leHQgIT0gbnVsbCkgJiYgbmV4dC5yb29tICE9PSByb29tKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKERpcmVjdGlvbi5jb3JuZXJzLCBkaXJlY3Rpb24pIDwgMCkge1xuICAgICAgICAgICAgICBvdGhlclNpZGUgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh0aWxlLnggKyBkaXJlY3Rpb24ueCAqIDIsIHRpbGUueSArIGRpcmVjdGlvbi55ICogMilcbiAgICAgICAgICAgICAgbmV4dFJvb20gPSAob3RoZXJTaWRlICE9IG51bGwgPyBvdGhlclNpZGUucm9vbSA6IG51bGwpICE9IG51bGwgPyBvdGhlclNpZGUucm9vbSA6IG51bGxcbiAgICAgICAgICAgICAgcm9vbS5hZGRXYWxsKG5leHQsIG5leHRSb29tKVxuICAgICAgICAgICAgICBpZiAobmV4dFJvb20gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5leHRSb29tLmFkZFdhbGwobmV4dCwgcm9vbSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMud2FsbEZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgbmV4dC5mYWN0b3J5ID0gKG9wdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndhbGxGYWN0b3J5KG9wdClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBuZXh0LmZhY3RvcnkuYmFzZSA9IHRoaXMud2FsbEZhY3RvcnlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdHMxLnB1c2godGhpcy5hbGxvY2F0ZVRpbGUobmV4dCkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMxLnB1c2gobnVsbClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHMxXG4gICAgICB9LmNhbGwodGhpcykpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cblxuICBjcmVhdGVEb29ycyAoKSB7XG4gICAgdmFyIGFkamFjZW50LCBkb29yLCBrLCBsZW4sIHJlZiwgcmVzdWx0cywgcm9vbSwgd2FsbHNcbiAgICByZWYgPSB0aGlzLnJvb21zXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICByb29tID0gcmVmW2tdXG4gICAgICByZXN1bHRzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbCwgbGVuMSwgcmVmMSwgcmVzdWx0czFcbiAgICAgICAgcmVmMSA9IHJvb20ud2FsbHNCeVJvb21zKClcbiAgICAgICAgcmVzdWx0czEgPSBbXVxuICAgICAgICBmb3IgKGwgPSAwLCBsZW4xID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4xOyBsKyspIHtcbiAgICAgICAgICB3YWxscyA9IHJlZjFbbF1cbiAgICAgICAgICBpZiAoKHdhbGxzLnJvb20gIT0gbnVsbCkgJiYgcm9vbS5kb29yc0ZvclJvb20od2FsbHMucm9vbSkgPCAxKSB7XG4gICAgICAgICAgICBkb29yID0gd2FsbHMudGlsZXNbTWF0aC5mbG9vcih0aGlzLnJuZygpICogd2FsbHMudGlsZXMubGVuZ3RoKV1cbiAgICAgICAgICAgIGRvb3IuZmFjdG9yeSA9IChvcHQpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9vckZhY3Rvcnkob3B0KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9vci5mYWN0b3J5LmJhc2UgPSB0aGlzLmRvb3JGYWN0b3J5XG4gICAgICAgICAgICBhZGphY2VudCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKGRvb3IueCArIDEsIGRvb3IueSlcbiAgICAgICAgICAgIGRvb3IuZmFjdG9yeU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgIGRpcmVjdGlvbjogYWRqYWNlbnQuZmFjdG9yeSAmJiBhZGphY2VudC5mYWN0b3J5LmJhc2UgPT09IHRoaXMuZmxvb3JGYWN0b3J5ID8gRG9vci5kaXJlY3Rpb25zLnZlcnRpY2FsIDogRG9vci5kaXJlY3Rpb25zLmhvcml6b250YWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJvb20uYWRkRG9vcihkb29yLCB3YWxscy5yb29tKVxuICAgICAgICAgICAgcmVzdWx0czEucHVzaCh3YWxscy5yb29tLmFkZERvb3IoZG9vciwgcm9vbSkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMxLnB1c2gobnVsbClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHMxXG4gICAgICB9LmNhbGwodGhpcykpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cblxuICBhbGxvY2F0ZVRpbGUgKHRpbGUsIHJvb20gPSBudWxsKSB7XG4gICAgdmFyIGluZGV4XG4gICAgaWYgKHJvb20gIT0gbnVsbCkge1xuICAgICAgcm9vbS5hZGRUaWxlKHRpbGUpXG4gICAgICB0aWxlLmZhY3RvcnkgPSAob3B0KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb29yRmFjdG9yeShvcHQpXG4gICAgICB9XG4gICAgICB0aWxlLmZhY3RvcnkuYmFzZSA9IHRoaXMuZmxvb3JGYWN0b3J5XG4gICAgfVxuICAgIGluZGV4ID0gdGhpcy5mcmVlLmluZGV4T2YodGlsZSlcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuZnJlZS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuICB9XG5cbiAgdGlsZU9mZnNldElzRnJlZSAodGlsZSwgZGlyZWN0aW9uLCBtdWx0aXBseSA9IDEpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlSXNGcmVlKHRpbGUueCArIGRpcmVjdGlvbi54ICogbXVsdGlwbHksIHRpbGUueSArIGRpcmVjdGlvbi55ICogbXVsdGlwbHkpXG4gIH1cblxuICB0aWxlSXNGcmVlICh4LCB5KSB7XG4gICAgdmFyIHRpbGVcbiAgICB0aWxlID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUoeCwgeSlcbiAgICBpZiAoKHRpbGUgIT0gbnVsbCkgJiYgaW5kZXhPZi5jYWxsKHRoaXMuZnJlZSwgdGlsZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIHRpbGVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmFuZG9tRnJlZVRpbGUgKCkge1xuICAgIHJldHVybiB0aGlzLmZyZWVbTWF0aC5mbG9vcih0aGlzLnJuZygpICogdGhpcy5mcmVlLmxlbmd0aCldXG4gIH1cbn07XG5cblJvb21HZW5lcmF0b3IucHJvcGVydGllcyh7XG4gIHJuZzoge1xuICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gIH0sXG4gIG1heFZvbHVtZToge1xuICAgIGRlZmF1bHQ6IDI1XG4gIH0sXG4gIG1pblZvbHVtZToge1xuICAgIGRlZmF1bHQ6IDUwXG4gIH0sXG4gIHdpZHRoOiB7XG4gICAgZGVmYXVsdDogMzBcbiAgfSxcbiAgaGVpZ2h0OiB7XG4gICAgZGVmYXVsdDogMTVcbiAgfSxcbiAgdGlsZUNvbnRhaW5lcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgdGlsZXMgPSBuZXcgVGlsZUNvbnRhaW5lcigpXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICB0aWxlcy5hZGRUaWxlKG5ldyBUaWxlKHgsIHkpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGlsZXNcbiAgICB9XG4gIH1cbn0pXG5cblJvb21HZW5lcmF0b3IuUm9vbSA9IGNsYXNzIFJvb20ge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy50aWxlcyA9IFtdXG4gICAgdGhpcy53YWxscyA9IFtdXG4gICAgdGhpcy5kb29ycyA9IFtdXG4gIH1cblxuICBhZGRUaWxlICh0aWxlKSB7XG4gICAgdGhpcy50aWxlcy5wdXNoKHRpbGUpXG4gICAgdGlsZS5yb29tID0gdGhpc1xuICB9XG5cbiAgY29udGFpbnNXYWxsICh0aWxlKSB7XG4gICAgdmFyIGssIGxlbiwgcmVmLCB3YWxsXG4gICAgcmVmID0gdGhpcy53YWxsc1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgd2FsbCA9IHJlZltrXVxuICAgICAgaWYgKHdhbGwudGlsZSA9PT0gdGlsZSkge1xuICAgICAgICByZXR1cm4gd2FsbFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGFkZFdhbGwgKHRpbGUsIG5leHRSb29tKSB7XG4gICAgdmFyIGV4aXN0aW5nXG4gICAgZXhpc3RpbmcgPSB0aGlzLmNvbnRhaW5zV2FsbCh0aWxlKVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcubmV4dFJvb20gPSBuZXh0Um9vbVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndhbGxzLnB1c2goe1xuICAgICAgICB0aWxlOiB0aWxlLFxuICAgICAgICBuZXh0Um9vbTogbmV4dFJvb21cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgd2FsbHNCeVJvb21zICgpIHtcbiAgICB2YXIgaywgbGVuLCBwb3MsIHJlZiwgcmVzLCByb29tcywgd2FsbFxuICAgIHJvb21zID0gW11cbiAgICByZXMgPSBbXVxuICAgIHJlZiA9IHRoaXMud2FsbHNcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHdhbGwgPSByZWZba11cbiAgICAgIHBvcyA9IHJvb21zLmluZGV4T2Yod2FsbC5uZXh0Um9vbSlcbiAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgIHBvcyA9IHJvb21zLmxlbmd0aFxuICAgICAgICByb29tcy5wdXNoKHdhbGwubmV4dFJvb20pXG4gICAgICAgIHJlcy5wdXNoKHtcbiAgICAgICAgICByb29tOiB3YWxsLm5leHRSb29tLFxuICAgICAgICAgIHRpbGVzOiBbXVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgcmVzW3Bvc10udGlsZXMucHVzaCh3YWxsLnRpbGUpXG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGFkZERvb3IgKHRpbGUsIG5leHRSb29tKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9vcnMucHVzaCh7XG4gICAgICB0aWxlOiB0aWxlLFxuICAgICAgbmV4dFJvb206IG5leHRSb29tXG4gICAgfSlcbiAgfVxuXG4gIGRvb3JzRm9yUm9vbSAocm9vbSkge1xuICAgIHJldHVybiB0aGlzLmRvb3JzXG4gICAgICAuZmlsdGVyKChkb29yKSA9PiBkb29yLm5leHRSb29tID09PSByb29tKVxuICAgICAgLm1hcCgoZG9vcikgPT4gZG9vci50aWxlKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vbUdlbmVyYXRvclxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUcmF2ZWwgPSByZXF1aXJlKCcuL1RyYXZlbCcpXG5jb25zdCBUcmF2ZWxBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvVHJhdmVsQWN0aW9uJylcblxuY2xhc3MgU2hpcCBleHRlbmRzIEVsZW1lbnQge1xuICB0cmF2ZWxUbyAobG9jYXRpb24pIHtcbiAgICB2YXIgdHJhdmVsXG4gICAgdHJhdmVsID0gbmV3IFRyYXZlbCh7XG4gICAgICB0cmF2ZWxsZXI6IHRoaXMsXG4gICAgICBzdGFydExvY2F0aW9uOiB0aGlzLmxvY2F0aW9uLFxuICAgICAgdGFyZ2V0TG9jYXRpb246IGxvY2F0aW9uXG4gICAgfSlcbiAgICBpZiAodHJhdmVsLnZhbGlkKSB7XG4gICAgICB0cmF2ZWwuc3RhcnQoKVxuICAgICAgdGhpcy50cmF2ZWwgPSB0cmF2ZWxcbiAgICB9XG4gIH1cbn07XG5cblNoaXAucHJvcGVydGllcyh7XG4gIGxvY2F0aW9uOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICB0cmF2ZWw6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHByb3ZpZGVkQWN0aW9uczoge1xuICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiBuZXcgVHJhdmVsQWN0aW9uKHtcbiAgICAgICAgYWN0b3I6IHRoaXNcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuICBzcGFjZUNvb2RpbmF0ZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICBpZiAoaW52YWxpZGF0b3IucHJvcCh0aGlzLnRyYXZlbFByb3BlcnR5KSkge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RyYXZlbC5zcGFjZUNvb2RpbmF0ZScpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IGludmFsaWRhdG9yLnByb3BQYXRoKCdsb2NhdGlvbi54JyksXG4gICAgICAgICAgeTogaW52YWxpZGF0b3IucHJvcFBhdGgoJ2xvY2F0aW9uLnknKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXBcbiIsImNvbnN0IFRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkXG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5jb25zdCBEYW1hZ2VhYmxlID0gcmVxdWlyZSgnLi9EYW1hZ2VhYmxlJylcbmNvbnN0IFByb2plY3RpbGUgPSByZXF1aXJlKCcuL1Byb2plY3RpbGUnKVxuXG5jbGFzcyBTaGlwV2VhcG9uIGV4dGVuZHMgVGlsZWQge1xuICBmaXJlICgpIHtcbiAgICB2YXIgcHJvamVjdGlsZVxuICAgIGlmICh0aGlzLmNhbkZpcmUpIHtcbiAgICAgIGNvbnN0IFByb2plY3RpbGVDbGFzcyA9IHRoaXMucHJvamVjdGlsZUNsYXNzXG4gICAgICBwcm9qZWN0aWxlID0gbmV3IFByb2plY3RpbGVDbGFzcyh7XG4gICAgICAgIG9yaWdpbjogdGhpcyxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgIGJsYXN0UmFuZ2U6IHRoaXMuYmxhc3RSYW5nZSxcbiAgICAgICAgcHJvcGFnYXRpb25UeXBlOiB0aGlzLnByb3BhZ2F0aW9uVHlwZSxcbiAgICAgICAgc3BlZWQ6IHRoaXMucHJvamVjdGlsZVNwZWVkLFxuICAgICAgICB0aW1pbmc6IHRoaXMudGltaW5nXG4gICAgICB9KVxuICAgICAgcHJvamVjdGlsZS5sYXVuY2goKVxuICAgICAgdGhpcy5jaGFyZ2VkID0gZmFsc2VcbiAgICAgIHRoaXMucmVjaGFyZ2UoKVxuICAgICAgcmV0dXJuIHByb2plY3RpbGVcbiAgICB9XG4gIH1cblxuICByZWNoYXJnZSAoKSB7XG4gICAgdGhpcy5jaGFyZ2luZyA9IHRydWVcbiAgICB0aGlzLmNoYXJnZVRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuY2hhcmdpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2VkKClcbiAgICB9LCB0aGlzLnJlY2hhcmdlVGltZSlcbiAgfVxuXG4gIHJlY2hhcmdlZCAoKSB7XG4gICAgdGhpcy5jaGFyZ2VkID0gdHJ1ZVxuICAgIGlmICh0aGlzLmF1dG9GaXJlKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJlKClcbiAgICB9XG4gIH1cbn07XG5cblNoaXBXZWFwb24uZXh0ZW5kKERhbWFnZWFibGUpXG5cblNoaXBXZWFwb24ucHJvcGVydGllcyh7XG4gIHJlY2hhcmdlVGltZToge1xuICAgIGRlZmF1bHQ6IDEwMDBcbiAgfSxcbiAgcG93ZXI6IHtcbiAgICBkZWZhdWx0OiAxMFxuICB9LFxuICBibGFzdFJhbmdlOiB7XG4gICAgZGVmYXVsdDogMVxuICB9LFxuICBwcm9wYWdhdGlvblR5cGU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHByb2plY3RpbGVTcGVlZDoge1xuICAgIGRlZmF1bHQ6IDEwXG4gIH0sXG4gIHRhcmdldDoge1xuICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgY2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hdXRvRmlyZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5maXJlKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGNoYXJnZWQ6IHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG4gIGNoYXJnaW5nOiB7XG4gICAgZGVmYXVsdDogdHJ1ZVxuICB9LFxuICBlbmFibGVkOiB7XG4gICAgZGVmYXVsdDogdHJ1ZVxuICB9LFxuICBhdXRvRmlyZToge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgY3JpdGljYWxIZWFsdGg6IHtcbiAgICBkZWZhdWx0OiAwLjNcbiAgfSxcbiAgY2FuRmlyZToge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0ICYmIHRoaXMuZW5hYmxlZCAmJiB0aGlzLmNoYXJnZWQgJiYgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCA+PSB0aGlzLmNyaXRpY2FsSGVhbHRoXG4gICAgfVxuICB9LFxuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH0sXG4gIHByb2plY3RpbGVDbGFzczoge1xuICAgIGRlZmF1bHQ6IFByb2plY3RpbGVcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwV2VhcG9uXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IE1hcCA9IHJlcXVpcmUoJy4vTWFwJylcbmNvbnN0IFN0YXJTeXN0ZW0gPSByZXF1aXJlKCcuL1N0YXJTeXN0ZW0nKVxuY29uc3Qgc3Rhck5hbWVzID0gcmVxdWlyZSgncGFyYWxsZWxpby1zdHJpbmdzJykuc3Rhck5hbWVzXG5cbmNsYXNzIFN0YXJNYXBHZW5lcmF0b3IgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHQgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZk9wdCwgb3B0aW9ucylcbiAgfVxuXG4gIGdlbmVyYXRlICgpIHtcbiAgICBjb25zdCBNYXBDbGFzcyA9IHRoaXMub3B0Lm1hcENsYXNzXG4gICAgdGhpcy5tYXAgPSBuZXcgTWFwQ2xhc3MoKVxuICAgIHRoaXMuc3RhcnMgPSB0aGlzLm1hcC5sb2NhdGlvbnMuY29weSgpXG4gICAgdGhpcy5saW5rcyA9IFtdXG4gICAgdGhpcy5jcmVhdGVTdGFycyh0aGlzLm9wdC5uYlN0YXJzKVxuICAgIHRoaXMubWFrZUxpbmtzKClcbiAgICByZXR1cm4gdGhpcy5tYXBcbiAgfVxuXG4gIGNyZWF0ZVN0YXJzIChuYikge1xuICAgIHJldHVybiBBcnJheS5mcm9tKEFycmF5KG5iKSwgKCkgPT4gdGhpcy5jcmVhdGVTdGFyKCkpXG4gIH1cblxuICBjcmVhdGVTdGFyIChvcHQgPSB7fSkge1xuICAgIHZhciBuYW1lLCBwb3MsIHN0YXJcbiAgICBpZiAoIShvcHQueCAmJiBvcHQueSkpIHtcbiAgICAgIHBvcyA9IHRoaXMucmFuZG9tU3RhclBvcygpXG4gICAgICBpZiAocG9zICE9IG51bGwpIHtcbiAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0LCB7XG4gICAgICAgICAgeDogcG9zLngsXG4gICAgICAgICAgeTogcG9zLnlcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghb3B0Lm5hbWUpIHtcbiAgICAgIG5hbWUgPSB0aGlzLnJhbmRvbVN0YXJOYW1lKClcbiAgICAgIGlmIChuYW1lICE9IG51bGwpIHtcbiAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0LCB7XG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgU3RhckNsYXNzID0gdGhpcy5vcHQuc3RhckNsYXNzXG4gICAgc3RhciA9IG5ldyBTdGFyQ2xhc3Mob3B0KVxuICAgIHRoaXMubWFwLmxvY2F0aW9ucy5wdXNoKHN0YXIpXG4gICAgdGhpcy5zdGFycy5wdXNoKHN0YXIpXG4gICAgcmV0dXJuIHN0YXJcbiAgfVxuXG4gIHJhbmRvbVN0YXJQb3MgKCkge1xuICAgIHZhciBqLCBwb3NcbiAgICBqID0gMFxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBwb3MgPSB7XG4gICAgICAgIHg6IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiAodGhpcy5vcHQubWF4WCAtIHRoaXMub3B0Lm1pblgpICsgdGhpcy5vcHQubWluWCksXG4gICAgICAgIHk6IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiAodGhpcy5vcHQubWF4WSAtIHRoaXMub3B0Lm1pblkpICsgdGhpcy5vcHQubWluWSlcbiAgICAgIH1cbiAgICAgIGlmICghKGogPCAxMCAmJiB0aGlzLnN0YXJzLmZpbmQoKHN0YXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHN0YXIuZGlzdChwb3MueCwgcG9zLnkpIDw9IHRoaXMub3B0Lm1pblN0YXJEaXN0XG4gICAgICB9KSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGorK1xuICAgIH1cbiAgICBpZiAoIShqID49IDEwKSkge1xuICAgICAgcmV0dXJuIHBvc1xuICAgIH1cbiAgfVxuXG4gIHJhbmRvbVN0YXJOYW1lICgpIHtcbiAgICB2YXIgbmFtZSwgcG9zLCByZWZcbiAgICBpZiAoKHJlZiA9IHRoaXMub3B0LnN0YXJOYW1lcykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiBudWxsKSB7XG4gICAgICBwb3MgPSBNYXRoLmZsb29yKHRoaXMub3B0LnJuZygpICogdGhpcy5vcHQuc3Rhck5hbWVzLmxlbmd0aClcbiAgICAgIG5hbWUgPSB0aGlzLm9wdC5zdGFyTmFtZXNbcG9zXVxuICAgICAgdGhpcy5vcHQuc3Rhck5hbWVzLnNwbGljZShwb3MsIDEpXG4gICAgICByZXR1cm4gbmFtZVxuICAgIH1cbiAgfVxuXG4gIG1ha2VMaW5rcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnMuZm9yRWFjaCgoc3RhcikgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMubWFrZUxpbmtzRnJvbShzdGFyKVxuICAgIH0pXG4gIH1cblxuICBtYWtlTGlua3NGcm9tIChzdGFyKSB7XG4gICAgdmFyIGNsb3NlLCBjbG9zZXN0cywgbGluaywgbmVlZGVkLCByZXN1bHRzLCB0cmllc1xuICAgIHRyaWVzID0gdGhpcy5vcHQubGlua1RyaWVzXG4gICAgbmVlZGVkID0gdGhpcy5vcHQubGlua3NCeVN0YXJzIC0gc3Rhci5saW5rcy5jb3VudCgpXG4gICAgaWYgKG5lZWRlZCA+IDApIHtcbiAgICAgIGNsb3Nlc3RzID0gdGhpcy5zdGFycy5maWx0ZXIoKHN0YXIyKSA9PiB7XG4gICAgICAgIHJldHVybiBzdGFyMiAhPT0gc3RhciAmJiAhc3Rhci5saW5rcy5maW5kU3RhcihzdGFyMilcbiAgICAgIH0pLmNsb3Nlc3RzKHN0YXIueCwgc3Rhci55KVxuICAgICAgaWYgKGNsb3Nlc3RzLmNvdW50KCkgPiAwKSB7XG4gICAgICAgIHJlc3VsdHMgPSBbXVxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNsb3NlID0gY2xvc2VzdHMuc2hpZnQoKVxuICAgICAgICAgIGxpbmsgPSB0aGlzLmNyZWF0ZUxpbmsoc3RhciwgY2xvc2UpXG4gICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVMaW5rKGxpbmspKSB7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLnB1c2gobGluaylcbiAgICAgICAgICAgIHN0YXIuYWRkTGluayhsaW5rKVxuICAgICAgICAgICAgbmVlZGVkIC09IDFcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJpZXMgLT0gMVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIShuZWVkZWQgPiAwICYmIHRyaWVzID4gMCAmJiBjbG9zZXN0cy5jb3VudCgpID4gMCkpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChudWxsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUxpbmsgKHN0YXIxLCBzdGFyMikge1xuICAgIGNvbnN0IExpbmtDbGFzcyA9IHRoaXMub3B0LmxpbmtDbGFzc1xuICAgIHJldHVybiBuZXcgTGlua0NsYXNzKHN0YXIxLCBzdGFyMilcbiAgfVxuXG4gIHZhbGlkYXRlTGluayAobGluaykge1xuICAgIHJldHVybiAhdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICByZXR1cm4gc3RhciAhPT0gbGluay5zdGFyMSAmJiBzdGFyICE9PSBsaW5rLnN0YXIyICYmIGxpbmsuY2xvc2VUb1BvaW50KHN0YXIueCwgc3Rhci55LCB0aGlzLm9wdC5taW5MaW5rRGlzdClcbiAgICB9KSAmJiAhdGhpcy5saW5rcy5maW5kKChsaW5rMikgPT4ge1xuICAgICAgcmV0dXJuIGxpbmsyLmludGVyc2VjdExpbmsobGluaylcbiAgICB9KVxuICB9XG59O1xuXG5TdGFyTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5kZWZPcHQgPSB7XG4gIG5iU3RhcnM6IDIwLFxuICBtaW5YOiAwLFxuICBtYXhYOiA1MDAsXG4gIG1pblk6IDAsXG4gIG1heFk6IDUwMCxcbiAgbWluU3RhckRpc3Q6IDIwLFxuICBtaW5MaW5rRGlzdDogMjAsXG4gIGxpbmtzQnlTdGFyczogMyxcbiAgbGlua1RyaWVzOiAzLFxuICBtYXBDbGFzczogTWFwLFxuICBzdGFyQ2xhc3M6IFN0YXJTeXN0ZW0sXG4gIGxpbmtDbGFzczogU3RhclN5c3RlbS5MaW5rLFxuICBybmc6IE1hdGgucmFuZG9tLFxuICBzdGFyTmFtZXM6IHN0YXJOYW1lc1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJNYXBHZW5lcmF0b3JcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBTdGFyU3lzdGVtIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yIChkYXRhKSB7XG4gICAgc3VwZXIoZGF0YSlcbiAgICB0aGlzLmluaXQoKVxuICB9XG5cbiAgaW5pdCAoKSB7fVxuXG4gIGxpbmtUbyAoc3Rhcikge1xuICAgIGlmICghdGhpcy5saW5rcy5maW5kU3RhcihzdGFyKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTGluayhuZXcgdGhpcy5jb25zdHJ1Y3Rvci5MaW5rKHRoaXMsIHN0YXIpKVxuICAgIH1cbiAgfVxuXG4gIGFkZExpbmsgKGxpbmspIHtcbiAgICB0aGlzLmxpbmtzLmFkZChsaW5rKVxuICAgIGxpbmsub3RoZXJTdGFyKHRoaXMpLmxpbmtzLmFkZChsaW5rKVxuICAgIHJldHVybiBsaW5rXG4gIH1cblxuICBkaXN0ICh4LCB5KSB7XG4gICAgdmFyIHhEaXN0LCB5RGlzdFxuICAgIHhEaXN0ID0gdGhpcy54IC0geFxuICAgIHlEaXN0ID0gdGhpcy55IC0geVxuICAgIHJldHVybiBNYXRoLnNxcnQoKHhEaXN0ICogeERpc3QpICsgKHlEaXN0ICogeURpc3QpKVxuICB9XG5cbiAgaXNTZWxlY3RhYmxlQnkgKHBsYXllcikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbn07XG5cblN0YXJTeXN0ZW0ucHJvcGVydGllcyh7XG4gIHg6IHt9LFxuICB5OiB7fSxcbiAgbmFtZToge30sXG4gIGxpbmtzOiB7XG4gICAgY29sbGVjdGlvbjoge1xuICAgICAgZmluZFN0YXI6IGZ1bmN0aW9uIChzdGFyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmQoZnVuY3Rpb24gKGxpbmspIHtcbiAgICAgICAgICByZXR1cm4gbGluay5zdGFyMiA9PT0gc3RhciB8fCBsaW5rLnN0YXIxID09PSBzdGFyXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5TdGFyU3lzdGVtLmNvbGxlbmN0aW9uRm4gPSB7XG4gIGNsb3Nlc3Q6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgdmFyIG1pbiwgbWluRGlzdFxuICAgIG1pbiA9IG51bGxcbiAgICBtaW5EaXN0ID0gbnVsbFxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoc3Rhcikge1xuICAgICAgdmFyIGRpc3RcbiAgICAgIGRpc3QgPSBzdGFyLmRpc3QoeCwgeSlcbiAgICAgIGlmICgobWluID09IG51bGwpIHx8IG1pbkRpc3QgPiBkaXN0KSB7XG4gICAgICAgIG1pbiA9IHN0YXJcbiAgICAgICAgbWluRGlzdCA9IGRpc3RcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBtaW5cbiAgfSxcbiAgY2xvc2VzdHM6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgdmFyIGRpc3RzXG4gICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbiAoc3Rhcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzdDogc3Rhci5kaXN0KHgsIHkpLFxuICAgICAgICBzdGFyOiBzdGFyXG4gICAgICB9XG4gICAgfSlcbiAgICBkaXN0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS5kaXN0IC0gYi5kaXN0XG4gICAgfSlcbiAgICByZXR1cm4gdGhpcy5jb3B5KGRpc3RzLm1hcChmdW5jdGlvbiAoZGlzdCkge1xuICAgICAgcmV0dXJuIGRpc3Quc3RhclxuICAgIH0pKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhclN5c3RlbVxuXG5TdGFyU3lzdGVtLkxpbmsgPSBjbGFzcyBMaW5rIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yIChzdGFyMSwgc3RhcjIpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zdGFyMSA9IHN0YXIxXG4gICAgdGhpcy5zdGFyMiA9IHN0YXIyXG4gIH1cblxuICByZW1vdmUgKCkge1xuICAgIHRoaXMuc3RhcjEubGlua3MucmVtb3ZlKHRoaXMpXG4gICAgcmV0dXJuIHRoaXMuc3RhcjIubGlua3MucmVtb3ZlKHRoaXMpXG4gIH1cblxuICBvdGhlclN0YXIgKHN0YXIpIHtcbiAgICBpZiAoc3RhciA9PT0gdGhpcy5zdGFyMSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcjJcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcjFcbiAgICB9XG4gIH1cblxuICBnZXRMZW5ndGggKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXIxLmRpc3QodGhpcy5zdGFyMi54LCB0aGlzLnN0YXIyLnkpXG4gIH1cblxuICBpbkJvdW5kYXJ5Qm94ICh4LCB5LCBwYWRkaW5nID0gMCkge1xuICAgIHZhciB4MSwgeDIsIHkxLCB5MlxuICAgIHgxID0gTWF0aC5taW4odGhpcy5zdGFyMS54LCB0aGlzLnN0YXIyLngpIC0gcGFkZGluZ1xuICAgIHkxID0gTWF0aC5taW4odGhpcy5zdGFyMS55LCB0aGlzLnN0YXIyLnkpIC0gcGFkZGluZ1xuICAgIHgyID0gTWF0aC5tYXgodGhpcy5zdGFyMS54LCB0aGlzLnN0YXIyLngpICsgcGFkZGluZ1xuICAgIHkyID0gTWF0aC5tYXgodGhpcy5zdGFyMS55LCB0aGlzLnN0YXIyLnkpICsgcGFkZGluZ1xuICAgIHJldHVybiB4ID49IHgxICYmIHggPD0geDIgJiYgeSA+PSB5MSAmJiB5IDw9IHkyXG4gIH1cblxuICBjbG9zZVRvUG9pbnQgKHgsIHksIG1pbkRpc3QpIHtcbiAgICB2YXIgYSwgYWJjQW5nbGUsIGFieEFuZ2xlLCBhY0Rpc3QsIGFjeEFuZ2xlLCBiLCBjLCBjZERpc3QsIHhBYkRpc3QsIHhBY0Rpc3QsIHlBYkRpc3QsIHlBY0Rpc3RcbiAgICBpZiAoIXRoaXMuaW5Cb3VuZGFyeUJveCh4LCB5LCBtaW5EaXN0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGEgPSB0aGlzLnN0YXIxXG4gICAgYiA9IHRoaXMuc3RhcjJcbiAgICBjID0ge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHlcbiAgICB9XG4gICAgeEFiRGlzdCA9IGIueCAtIGEueFxuICAgIHlBYkRpc3QgPSBiLnkgLSBhLnlcbiAgICBhYnhBbmdsZSA9IE1hdGguYXRhbih5QWJEaXN0IC8geEFiRGlzdClcbiAgICB4QWNEaXN0ID0gYy54IC0gYS54XG4gICAgeUFjRGlzdCA9IGMueSAtIGEueVxuICAgIGFjRGlzdCA9IE1hdGguc3FydCgoeEFjRGlzdCAqIHhBY0Rpc3QpICsgKHlBY0Rpc3QgKiB5QWNEaXN0KSlcbiAgICBhY3hBbmdsZSA9IE1hdGguYXRhbih5QWNEaXN0IC8geEFjRGlzdClcbiAgICBhYmNBbmdsZSA9IGFieEFuZ2xlIC0gYWN4QW5nbGVcbiAgICBjZERpc3QgPSBNYXRoLmFicyhNYXRoLnNpbihhYmNBbmdsZSkgKiBhY0Rpc3QpXG4gICAgcmV0dXJuIGNkRGlzdCA8PSBtaW5EaXN0XG4gIH1cblxuICBpbnRlcnNlY3RMaW5rIChsaW5rKSB7XG4gICAgdmFyIHMsIHMxeCwgczF5LCBzMngsIHMyeSwgdCwgeDEsIHgyLCB4MywgeDQsIHkxLCB5MiwgeTMsIHk0XG4gICAgeDEgPSB0aGlzLnN0YXIxLnhcbiAgICB5MSA9IHRoaXMuc3RhcjEueVxuICAgIHgyID0gdGhpcy5zdGFyMi54XG4gICAgeTIgPSB0aGlzLnN0YXIyLnlcbiAgICB4MyA9IGxpbmsuc3RhcjEueFxuICAgIHkzID0gbGluay5zdGFyMS55XG4gICAgeDQgPSBsaW5rLnN0YXIyLnhcbiAgICB5NCA9IGxpbmsuc3RhcjIueVxuICAgIHMxeCA9IHgyIC0geDFcbiAgICBzMXkgPSB5MiAtIHkxXG4gICAgczJ4ID0geDQgLSB4M1xuICAgIHMyeSA9IHk0IC0geTNcbiAgICBzID0gKC1zMXkgKiAoeDEgLSB4MykgKyBzMXggKiAoeTEgLSB5MykpIC8gKC1zMnggKiBzMXkgKyBzMXggKiBzMnkpXG4gICAgdCA9IChzMnggKiAoeTEgLSB5MykgLSBzMnkgKiAoeDEgLSB4MykpIC8gKC1zMnggKiBzMXkgKyBzMXggKiBzMnkpXG4gICAgcmV0dXJuIHMgPiAwICYmIHMgPCAxICYmIHQgPiAwICYmIHQgPCAxXG4gIH1cbn1cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKVxuXG5jbGFzcyBUcmF2ZWwgZXh0ZW5kcyBFbGVtZW50IHtcbiAgc3RhcnQgKGxvY2F0aW9uKSB7XG4gICAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICAgIHRoaXMubW92aW5nID0gdHJ1ZVxuICAgICAgdGhpcy50cmF2ZWxsZXIudHJhdmVsID0gdGhpc1xuICAgICAgdGhpcy5wYXRoVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnRyYXZlbGxlci5sb2NhdGlvbiA9IHRoaXMudGFyZ2V0TG9jYXRpb25cbiAgICAgICAgdGhpcy50cmF2ZWxsZXIudHJhdmVsID0gbnVsbFxuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlXG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZygnc3RvcCBtb3ZpbmcnKVxuICAgICAgfSwgdGhpcy5kdXJhdGlvbilcbiAgICB9XG4gIH1cbn07XG5cblRyYXZlbC5wcm9wZXJ0aWVzKHtcbiAgdHJhdmVsbGVyOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBzdGFydExvY2F0aW9uOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICB0YXJnZXRMb2NhdGlvbjoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgY3VycmVudFNlY3Rpb246IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0TG9jYXRpb24ubGlua3MuZmluZFN0YXIodGhpcy50YXJnZXRMb2NhdGlvbilcbiAgICB9XG4gIH0sXG4gIGR1cmF0aW9uOiB7XG4gICAgZGVmYXVsdDogMTAwMFxuICB9LFxuICBtb3Zpbmc6IHtcbiAgICBkZWZhdWx0OiBmYWxzZVxuICB9LFxuICB2YWxpZDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlZiwgcmVmMVxuICAgICAgaWYgKHRoaXMudGFyZ2V0TG9jYXRpb24gPT09IHRoaXMuc3RhcnRMb2NhdGlvbikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmICgoKChyZWYgPSB0aGlzLnRhcmdldExvY2F0aW9uKSAhPSBudWxsID8gcmVmLmxpbmtzIDogbnVsbCkgIT0gbnVsbCkgJiYgKCgocmVmMSA9IHRoaXMuc3RhcnRMb2NhdGlvbikgIT0gbnVsbCA/IHJlZjEubGlua3MgOiBudWxsKSAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2VjdGlvbiAhPSBudWxsXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH0sXG4gIHNwYWNlQ29vZGluYXRlOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHZhciBlbmRYLCBlbmRZLCBwcmMsIHN0YXJ0WCwgc3RhcnRZXG4gICAgICBzdGFydFggPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgnc3RhcnRMb2NhdGlvbi54JylcbiAgICAgIHN0YXJ0WSA9IGludmFsaWRhdG9yLnByb3BQYXRoKCdzdGFydExvY2F0aW9uLnknKVxuICAgICAgZW5kWCA9IGludmFsaWRhdG9yLnByb3BQYXRoKCd0YXJnZXRMb2NhdGlvbi54JylcbiAgICAgIGVuZFkgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgndGFyZ2V0TG9jYXRpb24ueScpXG4gICAgICBwcmMgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgncGF0aFRpbWVvdXQucHJjJylcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IChzdGFydFggLSBlbmRYKSAqIHByYyArIGVuZFgsXG4gICAgICAgIHk6IChzdGFydFkgLSBlbmRZKSAqIHByYyArIGVuZFlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhdmVsXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IEdyaWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLWdyaWRzJykuR3JpZFxuXG5jbGFzcyBWaWV3IGV4dGVuZHMgRWxlbWVudCB7XG4gIHNldERlZmF1bHRzICgpIHtcbiAgICB2YXIgcmVmXG4gICAgaWYgKCF0aGlzLmJvdW5kcykge1xuICAgICAgdGhpcy5ncmlkID0gdGhpcy5ncmlkIHx8ICgocmVmID0gdGhpcy5nYW1lLm1haW5WaWV3UHJvcGVydHkudmFsdWUpICE9IG51bGwgPyByZWYuZ3JpZCA6IG51bGwpIHx8IG5ldyBHcmlkKClcbiAgICAgIHRoaXMuYm91bmRzID0gdGhpcy5ncmlkLmFkZENlbGwoKVxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuZ2FtZSA9IG51bGxcbiAgfVxufTtcblxuVmlldy5wcm9wZXJ0aWVzKHtcbiAgZ2FtZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkKSB7XG4gICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZS52aWV3cy5hZGQodGhpcylcbiAgICAgICAgdGhpcy5zZXREZWZhdWx0cygpXG4gICAgICB9XG4gICAgICBpZiAob2xkKSB7XG4gICAgICAgIHJldHVybiBvbGQudmlld3MucmVtb3ZlKHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB4OiB7XG4gICAgZGVmYXVsdDogMFxuICB9LFxuICB5OiB7XG4gICAgZGVmYXVsdDogMFxuICB9LFxuICBncmlkOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBib3VuZHM6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld1xuIiwiY29uc3QgTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL0xpbmVPZlNpZ2h0JylcbmNvbnN0IERpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb25cbmNvbnN0IFRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lclxuY29uc3QgVGlsZVJlZmVyZW5jZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlUmVmZXJlbmNlXG5cbmNsYXNzIFZpc2lvbkNhbGN1bGF0b3Ige1xuICBjb25zdHJ1Y3RvciAob3JpZ2luVGlsZSwgb2Zmc2V0ID0ge1xuICAgIHg6IDAuNSxcbiAgICB5OiAwLjVcbiAgfSkge1xuICAgIHRoaXMub3JpZ2luVGlsZSA9IG9yaWdpblRpbGVcbiAgICB0aGlzLm9mZnNldCA9IG9mZnNldFxuICAgIHRoaXMucHRzID0ge31cbiAgICB0aGlzLnZpc2liaWxpdHkgPSB7fVxuICAgIHRoaXMuc3RhY2sgPSBbXVxuICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHRoaXMuaW5pdCgpXG4gICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoKSB7XG4gICAgICB0aGlzLnN0ZXAoKVxuICAgIH1cbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB2YXIgZmlyc3RCYXRjaCwgaW5pdGlhbFB0c1xuICAgIHRoaXMucHRzID0ge31cbiAgICB0aGlzLnZpc2liaWxpdHkgPSB7fVxuICAgIGluaXRpYWxQdHMgPSBbeyB4OiAwLCB5OiAwIH0sIHsgeDogMSwgeTogMCB9LCB7IHg6IDAsIHk6IDEgfSwgeyB4OiAxLCB5OiAxIH1dXG4gICAgaW5pdGlhbFB0cy5mb3JFYWNoKChwdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0UHQodGhpcy5vcmlnaW5UaWxlLnggKyBwdC54LCB0aGlzLm9yaWdpblRpbGUueSArIHB0LnksIHRydWUpXG4gICAgfSlcbiAgICBmaXJzdEJhdGNoID0gW1xuICAgICAgeyB4OiAtMSwgeTogLTEgfSwgeyB4OiAtMSwgeTogMCB9LCB7IHg6IC0xLCB5OiAxIH0sIHsgeDogLTEsIHk6IDIgfSxcbiAgICAgIHsgeDogMiwgeTogLTEgfSwgeyB4OiAyLCB5OiAwIH0sIHsgeDogMiwgeTogMSB9LCB7IHg6IDIsIHk6IDIgfSxcbiAgICAgIHsgeDogMCwgeTogLTEgfSwgeyB4OiAxLCB5OiAtMSB9LFxuICAgICAgeyB4OiAwLCB5OiAyIH0sIHsgeDogMSwgeTogMiB9XG4gICAgXVxuICAgIHRoaXMuc3RhY2sgPSBmaXJzdEJhdGNoLm1hcCgocHQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCxcbiAgICAgICAgeTogdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHNldFB0ICh4LCB5LCB2YWwpIHtcbiAgICB2YXIgYWRqYW5jZW50XG4gICAgdGhpcy5wdHNbeCArICc6JyArIHldID0gdmFsXG4gICAgYWRqYW5jZW50ID0gW1xuICAgICAge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAtMVxuICAgICAgfVxuICAgIF1cbiAgICByZXR1cm4gYWRqYW5jZW50LmZvckVhY2goKHB0KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRWaXNpYmlsaXR5KHggKyBwdC54LCB5ICsgcHQueSwgdmFsID8gMSAvIGFkamFuY2VudC5sZW5ndGggOiAwKVxuICAgIH0pXG4gIH1cblxuICBnZXRQdCAoeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnB0c1t4ICsgJzonICsgeV1cbiAgfVxuXG4gIGFkZFZpc2liaWxpdHkgKHgsIHksIHZhbCkge1xuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5W3hdID0ge31cbiAgICB9XG4gICAgaWYgKHRoaXMudmlzaWJpbGl0eVt4XVt5XSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlbeF1beV0gKz0gdmFsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eVt4XVt5XSA9IHZhbFxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0VmlzaWJpbGl0eSAoeCwgeSkge1xuICAgIGlmICgodGhpcy52aXNpYmlsaXR5W3hdID09IG51bGwpIHx8ICh0aGlzLnZpc2liaWxpdHlbeF1beV0gPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybiAwXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV1cbiAgICB9XG4gIH1cblxuICBjYW5Qcm9jZXNzICh4LCB5KSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YWNrLnNvbWUoKHB0KSA9PiB7XG4gICAgICByZXR1cm4gcHQueCA9PT0geCAmJiBwdC55ID09PSB5XG4gICAgfSkgJiYgKHRoaXMuZ2V0UHQoeCwgeSkgPT0gbnVsbClcbiAgfVxuXG4gIHN0ZXAgKCkge1xuICAgIHZhciBsb3MsIHB0XG4gICAgcHQgPSB0aGlzLnN0YWNrLnNoaWZ0KClcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lciwgdGhpcy5vcmlnaW5UaWxlLnggKyB0aGlzLm9mZnNldC54LCB0aGlzLm9yaWdpblRpbGUueSArIHRoaXMub2Zmc2V0LnksIHB0LngsIHB0LnkpXG4gICAgbG9zLnJldmVyc2VUcmFjaW5nKClcbiAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9ICh0aWxlLCBlbnRyeVgsIGVudHJ5WSkgPT4ge1xuICAgICAgaWYgKHRpbGUgIT0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5nZXRWaXNpYmlsaXR5KHRpbGUueCwgdGlsZS55KSA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiBsb3MuZm9yY2VTdWNjZXNzKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGlsZS50cmFuc3BhcmVudFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0UHQocHQueCwgcHQueSwgbG9zLmdldFN1Y2Nlc3MoKSlcbiAgICBpZiAobG9zLmdldFN1Y2Nlc3MoKSkge1xuICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZm9yRWFjaCgoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIHZhciBuZXh0UHRcbiAgICAgICAgbmV4dFB0ID0ge1xuICAgICAgICAgIHg6IHB0LnggKyBkaXJlY3Rpb24ueCxcbiAgICAgICAgICB5OiBwdC55ICsgZGlyZWN0aW9uLnlcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jYW5Qcm9jZXNzKG5leHRQdC54LCBuZXh0UHQueSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdGFjay5wdXNoKG5leHRQdClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBnZXRCb3VuZHMgKCkge1xuICAgIHZhciBib3VuZGFyaWVzLCBjb2wsIHJlZiwgeCwgeVxuICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICB0b3A6IG51bGwsXG4gICAgICBsZWZ0OiBudWxsLFxuICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgcmlnaHQ6IG51bGxcbiAgICB9XG4gICAgcmVmID0gdGhpcy52aXNpYmlsaXR5XG4gICAgZm9yICh4IGluIHJlZikge1xuICAgICAgY29sID0gcmVmW3hdXG4gICAgICBmb3IgKHkgaW4gY29sKSB7XG4gICAgICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgeSA8IGJvdW5kYXJpZXMudG9wKSB7XG4gICAgICAgICAgYm91bmRhcmllcy50b3AgPSB5XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgeCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMubGVmdCA9IHhcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IHkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgICAgIGJvdW5kYXJpZXMuYm90dG9tID0geVxuICAgICAgICB9XG4gICAgICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCB4ID4gYm91bmRhcmllcy5yaWdodCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMucmlnaHQgPSB4XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kYXJpZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7VGlsZUNvbnRhaW5lcn1cbiAgICovXG4gIHRvQ29udGFpbmVyICgpIHtcbiAgICB2YXIgY29sLCByZWYsIHRpbGUsIHZhbCwgeCwgeVxuICAgIGNvbnN0IHJlcyA9IG5ldyBUaWxlQ29udGFpbmVyKClcbiAgICByZXMub3duZXIgPSBmYWxzZVxuICAgIHJlZiA9IHRoaXMudmlzaWJpbGl0eVxuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XVxuICAgICAgZm9yICh5IGluIGNvbCkge1xuICAgICAgICB2YWwgPSBjb2xbeV1cbiAgICAgICAgdGlsZSA9IHRoaXMub3JpZ2luVGlsZS5jb250YWluZXIuZ2V0VGlsZSh4LCB5KVxuICAgICAgICBpZiAodmFsICE9PSAwICYmICh0aWxlICE9IG51bGwpKSB7XG4gICAgICAgICAgdGlsZSA9IG5ldyBUaWxlUmVmZXJlbmNlKHRpbGUpXG4gICAgICAgICAgdGlsZS52aXNpYmlsaXR5ID0gdmFsXG4gICAgICAgICAgcmVzLmFkZFRpbGUodGlsZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICB0b01hcCAoKSB7XG4gICAgdmFyIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgcmVzLCB4LCB5XG4gICAgcmVzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBtYXA6IFtdXG4gICAgfSwgdGhpcy5nZXRCb3VuZHMoKSlcbiAgICBmb3IgKHkgPSBpID0gcmVmID0gcmVzLnRvcCwgcmVmMSA9IHJlcy5ib3R0b20gLSAxOyAocmVmIDw9IHJlZjEgPyBpIDw9IHJlZjEgOiBpID49IHJlZjEpOyB5ID0gcmVmIDw9IHJlZjEgPyArK2kgOiAtLWkpIHtcbiAgICAgIHJlcy5tYXBbeSAtIHJlcy50b3BdID0gW11cbiAgICAgIGZvciAoeCA9IGogPSByZWYyID0gcmVzLmxlZnQsIHJlZjMgPSByZXMucmlnaHQgLSAxOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeCA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICByZXMubWFwW3kgLSByZXMudG9wXVt4IC0gcmVzLmxlZnRdID0gdGhpcy5nZXRWaXNpYmlsaXR5KHgsIHkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpc2lvbkNhbGN1bGF0b3JcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY2xhc3MgQWN0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gIHdpdGhBY3RvciAoYWN0b3IpIHtcbiAgICBpZiAodGhpcy5hY3RvciAhPT0gYWN0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHtcbiAgICAgICAgYWN0b3I6IGFjdG9yXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfVxuXG4gIGNvcHlXaXRoIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe1xuICAgICAgYmFzZTogdGhpcy5iYXNlT3JUaGlzKClcbiAgICB9LCB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCksIG9wdGlvbnMpKVxuICB9XG5cbiAgYmFzZU9yVGhpcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFzZSB8fCB0aGlzXG4gIH1cblxuICBzdGFydCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0ZSgpXG4gIH1cblxuICB2YWxpZEFjdG9yICgpIHtcbiAgICByZXR1cm4gdGhpcy5hY3RvciAhPSBudWxsXG4gIH1cblxuICBpc1JlYWR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy52YWxpZEFjdG9yKClcbiAgfVxuXG4gIGZpbmlzaCAoKSB7XG4gICAgdGhpcy5lbWl0KCdmaW5pc2hlZCcpXG4gICAgcmV0dXJuIHRoaXMuZW5kKClcbiAgfVxuXG4gIGludGVycnVwdCAoKSB7XG4gICAgdGhpcy5lbWl0KCdpbnRlcnJ1cHRlZCcpXG4gICAgcmV0dXJuIHRoaXMuZW5kKClcbiAgfVxuXG4gIGVuZCAoKSB7XG4gICAgdGhpcy5lbWl0KCdlbmQnKVxuICAgIHJldHVybiB0aGlzLmRlc3Ryb3koKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpXG4gIH1cbn07XG5cbkFjdGlvbi5pbmNsdWRlKEV2ZW50RW1pdHRlci5wcm90b3R5cGUpXG5cbkFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgYWN0b3I6IHt9LFxuICBiYXNlOiB7fVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBBY3Rpb25Qcm92aWRlciBleHRlbmRzIEVsZW1lbnQge307XG5cbkFjdGlvblByb3ZpZGVyLnByb3BlcnRpZXMoe1xuICBhY3Rpb25zOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICBjb21wb3NlZDogdHJ1ZVxuICB9LFxuICBvd25lcjoge31cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uUHJvdmlkZXJcbiIsImNvbnN0IFdhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKVxuY29uc3QgVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKVxuY29uc3QgRXZlbnRCaW5kID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50QmluZFxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlclxuXG5jbGFzcyBBdHRhY2tBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICB2YWxpZFRhcmdldCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0SXNBdHRhY2thYmxlKCkgJiYgKHRoaXMuY2FuVXNlV2VhcG9uKCkgfHwgdGhpcy5jYW5XYWxrVG9UYXJnZXQoKSlcbiAgfVxuXG4gIHRhcmdldElzQXR0YWNrYWJsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmRhbWFnZWFibGUgJiYgdGhpcy50YXJnZXQuaGVhbHRoID49IDBcbiAgfVxuXG4gIGNhbk1lbGVlICgpIHtcbiAgICByZXR1cm4gTWF0aC5hYnModGhpcy50YXJnZXQudGlsZS54IC0gdGhpcy5hY3Rvci50aWxlLngpICsgTWF0aC5hYnModGhpcy50YXJnZXQudGlsZS55IC0gdGhpcy5hY3Rvci50aWxlLnkpID09PSAxXG4gIH1cblxuICBjYW5Vc2VXZWFwb24gKCkge1xuICAgIHJldHVybiB0aGlzLmJlc3RVc2FibGVXZWFwb24gIT0gbnVsbFxuICB9XG5cbiAgY2FuVXNlV2VhcG9uQXQgKHRpbGUpIHtcbiAgICB2YXIgcmVmXG4gICAgcmV0dXJuICgocmVmID0gdGhpcy5hY3Rvci53ZWFwb25zKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IG51bGwpICYmIHRoaXMuYWN0b3Iud2VhcG9ucy5maW5kKCh3ZWFwb24pID0+IHtcbiAgICAgIHJldHVybiB3ZWFwb24uY2FuVXNlRnJvbSh0aWxlLCB0aGlzLnRhcmdldClcbiAgICB9KVxuICB9XG5cbiAgY2FuV2Fsa1RvVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy53YWxrQWN0aW9uLmlzUmVhZHkoKVxuICB9XG5cbiAgdXNlV2VhcG9uICgpIHtcbiAgICB0aGlzLmJlc3RVc2FibGVXZWFwb24udXNlT24odGhpcy50YXJnZXQpXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoKClcbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICh0aGlzLmFjdG9yLndhbGsgIT0gbnVsbCkge1xuICAgICAgdGhpcy5hY3Rvci53YWxrLmludGVycnVwdCgpXG4gICAgfVxuICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24gIT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuYmVzdFVzYWJsZVdlYXBvbi5jaGFyZ2VkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVzZVdlYXBvbigpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25DaGFyZ2VXYXRjaGVyLmJpbmQoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndhbGtBY3Rpb24ub24oJ2ZpbmlzaGVkJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmludGVycnVwdEJpbmRlci51bmJpbmQoKVxuICAgICAgICB0aGlzLndhbGtBY3Rpb24uZGVzdHJveSgpXG4gICAgICAgIHRoaXMud2Fsa0FjdGlvblByb3BlcnR5LmludmFsaWRhdGUoKVxuICAgICAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLmludGVycnVwdEJpbmRlci5iaW5kVG8odGhpcy53YWxrQWN0aW9uKVxuICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5leGVjdXRlKClcbiAgICB9XG4gIH1cbn07XG5cbkF0dGFja0FjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgd2Fsa0FjdGlvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHdhbGtBY3Rpb25cbiAgICAgIHdhbGtBY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzLmFjdG9yLFxuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XG4gICAgICB9KVxuICAgICAgd2Fsa0FjdGlvbi5wYXRoRmluZGVyLmFycml2ZWRDYWxsYmFjayA9IChzdGVwKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhblVzZVdlYXBvbkF0KHN0ZXAudGlsZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB3YWxrQWN0aW9uXG4gICAgfVxuICB9LFxuICBiZXN0VXNhYmxlV2VhcG9uOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHZhciByZWYsIHVzYWJsZVdlYXBvbnNcbiAgICAgIGludmFsaWRhdG9yLnByb3BQYXRoKCdhY3Rvci50aWxlJylcbiAgICAgIGlmICgocmVmID0gdGhpcy5hY3Rvci53ZWFwb25zKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IG51bGwpIHtcbiAgICAgICAgdXNhYmxlV2VhcG9ucyA9IHRoaXMuYWN0b3Iud2VhcG9ucy5maWx0ZXIoKHdlYXBvbikgPT4ge1xuICAgICAgICAgIHJldHVybiB3ZWFwb24uY2FuVXNlT24odGhpcy50YXJnZXQpXG4gICAgICAgIH0pXG4gICAgICAgIHVzYWJsZVdlYXBvbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgIHJldHVybiBiLmRwcyAtIGEuZHBzXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB1c2FibGVXZWFwb25zWzBdXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgaW50ZXJydXB0QmluZGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IEV2ZW50QmluZCgnaW50ZXJydXB0ZWQnLCBudWxsLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpXG4gICAgICB9KVxuICAgIH0sXG4gICAgZGVzdHJveTogdHJ1ZVxuICB9LFxuICB3ZWFwb25DaGFyZ2VXYXRjaGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuYmVzdFVzYWJsZVdlYXBvbi5jaGFyZ2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VXZWFwb24oKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydHk6IHRoaXMuYmVzdFVzYWJsZVdlYXBvbi5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eSgnY2hhcmdlZCcpXG4gICAgICB9KVxuICAgIH0sXG4gICAgZGVzdHJveTogdHJ1ZVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFja0FjdGlvblxuIiwiY29uc3QgV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vV2Fsa0FjdGlvbicpXG5jb25zdCBBdHRhY2tBY3Rpb24gPSByZXF1aXJlKCcuL0F0dGFja0FjdGlvbicpXG5jb25zdCBUYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpXG5jb25zdCBQYXRoRmluZGVyID0gcmVxdWlyZSgncGFyYWxsZWxpby1wYXRoZmluZGVyJylcbmNvbnN0IExpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi4vTGluZU9mU2lnaHQnKVxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlclxuY29uc3QgRXZlbnRCaW5kID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50QmluZFxuXG5jbGFzcyBBdHRhY2tNb3ZlQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgaXNFbmVteSAoZWxlbSkge1xuICAgIHZhciByZWZcbiAgICByZXR1cm4gKHJlZiA9IHRoaXMuYWN0b3Iub3duZXIpICE9IG51bGwgPyB0eXBlb2YgcmVmLmlzRW5lbXkgPT09ICdmdW5jdGlvbicgPyByZWYuaXNFbmVteShlbGVtKSA6IG51bGwgOiBudWxsXG4gIH1cblxuICB2YWxpZFRhcmdldCAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi52YWxpZFRhcmdldCgpXG4gIH1cblxuICB0ZXN0RW5lbXlTcG90dGVkICgpIHtcbiAgICB0aGlzLmVuZW15U3BvdHRlZFByb3BlcnR5LmludmFsaWRhdGUoKVxuICAgIGlmICh0aGlzLmVuZW15U3BvdHRlZCkge1xuICAgICAgdGhpcy5hdHRhY2tBY3Rpb24gPSBuZXcgQXR0YWNrQWN0aW9uKHtcbiAgICAgICAgYWN0b3I6IHRoaXMuYWN0b3IsXG4gICAgICAgIHRhcmdldDogdGhpcy5lbmVteVNwb3R0ZWRcbiAgICAgIH0pXG4gICAgICB0aGlzLmF0dGFja0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLmF0dGFja0FjdGlvbilcbiAgICAgIHRoaXMud2Fsa0FjdGlvbi5pbnRlcnJ1cHQoKVxuICAgICAgdGhpcy53YWxrQWN0aW9uUHJvcGVydHkuaW52YWxpZGF0ZSgpXG4gICAgICByZXR1cm4gdGhpcy5hdHRhY2tBY3Rpb24uZXhlY3V0ZSgpXG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgaWYgKCF0aGlzLnRlc3RFbmVteVNwb3R0ZWQoKSkge1xuICAgICAgdGhpcy53YWxrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQoKVxuICAgICAgfSlcbiAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLndhbGtBY3Rpb24pXG4gICAgICB0aGlzLnRpbGVXYXRjaGVyLmJpbmQoKVxuICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5leGVjdXRlKClcbiAgICB9XG4gIH1cbn07XG5cbkF0dGFja01vdmVBY3Rpb24ucHJvcGVydGllcyh7XG4gIHdhbGtBY3Rpb246IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB3YWxrQWN0aW9uXG4gICAgICB3YWxrQWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxuICAgICAgfSlcbiAgICAgIHJldHVybiB3YWxrQWN0aW9uXG4gICAgfVxuICB9LFxuICBlbmVteVNwb3R0ZWQ6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZWZcbiAgICAgIHRoaXMucGF0aCA9IG5ldyBQYXRoRmluZGVyKHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZSwgZmFsc2UsIHtcbiAgICAgICAgdmFsaWRUaWxlOiAodGlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aWxlLnRyYW5zcGFyZW50ICYmIChuZXcgTGluZU9mU2lnaHQodGhpcy5hY3Rvci50aWxlLmNvbnRhaW5lciwgdGhpcy5hY3Rvci50aWxlLngsIHRoaXMuYWN0b3IudGlsZS55LCB0aWxlLngsIHRpbGUueSkpLmdldFN1Y2Nlc3MoKVxuICAgICAgICB9LFxuICAgICAgICBhcnJpdmVkOiAoc3RlcCkgPT4ge1xuICAgICAgICAgIHN0ZXAuZW5lbXkgPSBzdGVwLnRpbGUuY2hpbGRyZW4uZmluZCgoYykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNFbmVteShjKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIHN0ZXAuZW5lbXlcbiAgICAgICAgfSxcbiAgICAgICAgZWZmaWNpZW5jeTogKHRpbGUpID0+IHt9XG4gICAgICB9KVxuICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpXG4gICAgICByZXR1cm4gKHJlZiA9IHRoaXMucGF0aC5zb2x1dGlvbikgIT0gbnVsbCA/IHJlZi5lbmVteSA6IG51bGxcbiAgICB9XG4gIH0sXG4gIHRpbGVXYXRjaGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudGVzdEVuZW15U3BvdHRlZCgpXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLmFjdG9yLnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KCd0aWxlJylcbiAgICAgIH0pXG4gICAgfSxcbiAgICBkZXN0cm95OiB0cnVlXG4gIH0sXG4gIGludGVycnVwdEJpbmRlcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBFdmVudEJpbmQoJ2ludGVycnVwdGVkJywgbnVsbCwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGRlc3Ryb3k6IHRydWVcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2tNb3ZlQWN0aW9uXG4iLCJjb25zdCBBY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vQWN0aW9uUHJvdmlkZXInKVxuXG5jbGFzcyBTaW1wbGVBY3Rpb25Qcm92aWRlciBleHRlbmRzIEFjdGlvblByb3ZpZGVyIHt9O1xuXG5TaW1wbGVBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgYWN0aW9uczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFjdGlvbnNcbiAgICAgIGFjdGlvbnMgPSB0aGlzLmFjdGlvbk9wdGlvbnMgfHwgdGhpcy5jb25zdHJ1Y3Rvci5hY3Rpb25zIHx8IFtdXG4gICAgICBpZiAodHlwZW9mIGFjdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGFjdGlvbnMgPSBPYmplY3Qua2V5cyhhY3Rpb25zKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJldHVybiBhY3Rpb25zW2tleV1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY3Rpb25zLm1hcCgoYWN0aW9uKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uLndpdGhUYXJnZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gYWN0aW9uLndpdGhUYXJnZXQodGhpcylcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYWN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3QgQWN0aW9uQ2xhc3MgPSBhY3Rpb25cbiAgICAgICAgICByZXR1cm4gbmV3IEFjdGlvbkNsYXNzKHtcbiAgICAgICAgICAgIHRhcmdldDogdGhpc1xuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGFjdGlvblxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVBY3Rpb25Qcm92aWRlclxuIiwiY29uc3QgQWN0aW9uID0gcmVxdWlyZSgnLi9BY3Rpb24nKVxuXG5jbGFzcyBUYXJnZXRBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICB3aXRoVGFyZ2V0ICh0YXJnZXQpIHtcbiAgICBpZiAodGhpcy50YXJnZXQgIT09IHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29weVdpdGgoe1xuICAgICAgICB0YXJnZXQ6IHRhcmdldFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH1cblxuICBjYW5UYXJnZXQgKHRhcmdldCkge1xuICAgIHZhciBpbnN0YW5jZVxuICAgIGluc3RhbmNlID0gdGhpcy53aXRoVGFyZ2V0KHRhcmdldClcbiAgICBpZiAoaW5zdGFuY2UudmFsaWRUYXJnZXQoKSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlXG4gICAgfVxuICB9XG5cbiAgdmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldCAhPSBudWxsXG4gIH1cblxuICBpc1JlYWR5ICgpIHtcbiAgICByZXR1cm4gc3VwZXIuaXNSZWFkeSgpICYmIHRoaXMudmFsaWRUYXJnZXQoKVxuICB9XG59O1xuXG5UYXJnZXRBY3Rpb24ucHJvcGVydGllcyh7XG4gIHRhcmdldDoge31cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gVGFyZ2V0QWN0aW9uXG4iLCJjb25zdCBBY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vQWN0aW9uUHJvdmlkZXInKVxuXG5jbGFzcyBUaWxlZEFjdGlvblByb3ZpZGVyIGV4dGVuZHMgQWN0aW9uUHJvdmlkZXIge1xuICB2YWxpZEFjdGlvblRpbGUgKHRpbGUpIHtcbiAgICByZXR1cm4gdGlsZSAhPSBudWxsXG4gIH1cblxuICBwcmVwYXJlQWN0aW9uVGlsZSAodGlsZSkge1xuICAgIGlmICghdGlsZS5hY3Rpb25Qcm92aWRlcikge1xuICAgICAgdGlsZS5hY3Rpb25Qcm92aWRlciA9IG5ldyBBY3Rpb25Qcm92aWRlcih7XG4gICAgICAgIG93bmVyOiB0aWxlXG4gICAgICB9KVxuICAgIH1cbiAgfVxufTtcblxuVGlsZWRBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgb3JpZ2luVGlsZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcFBhdGgoJ293bmVyLnRpbGUnKVxuICAgIH1cbiAgfSxcbiAgYWN0aW9uVGlsZXM6IHtcbiAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgbXlUaWxlXG4gICAgICBteVRpbGUgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMub3JpZ2luVGlsZVByb3BlcnR5KVxuICAgICAgaWYgKG15VGlsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25UaWxlc0Nvb3JkLm1hcCgoY29vcmQpID0+IHtcbiAgICAgICAgICByZXR1cm4gbXlUaWxlLmdldFJlbGF0aXZlVGlsZShjb29yZC54LCBjb29yZC55KVxuICAgICAgICB9KS5maWx0ZXIoKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZEFjdGlvblRpbGUodGlsZSlcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuICAgIH0sXG4gICAgaXRlbUFkZGVkOiBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgdGhpcy5wcmVwYXJlQWN0aW9uVGlsZSh0aWxlKVxuICAgICAgcmV0dXJuIHRpbGUuYWN0aW9uUHJvdmlkZXIuYWN0aW9uc01lbWJlci5hZGRQcm9wZXJ0eSh0aGlzLmFjdGlvbnNQcm9wZXJ0eSlcbiAgICB9LFxuICAgIGl0ZW1SZW1vdmVkOiBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgcmV0dXJuIHRpbGUuYWN0aW9uUHJvdmlkZXIuYWN0aW9uc01lbWJlci5yZW1vdmVQcm9wZXJ0eSh0aGlzLmFjdGlvbnNQcm9wZXJ0eSlcbiAgICB9XG4gIH1cbn0pXG5cblRpbGVkQWN0aW9uUHJvdmlkZXIucHJvdG90eXBlLmFjdGlvblRpbGVzQ29vcmQgPSBbXG4gIHtcbiAgICB4OiAwLFxuICAgIHk6IC0xXG4gIH0sXG4gIHtcbiAgICB4OiAtMSxcbiAgICB5OiAwXG4gIH0sXG4gIHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfSxcbiAge1xuICAgIHg6ICsxLFxuICAgIHk6IDBcbiAgfSxcbiAge1xuICAgIHg6IDAsXG4gICAgeTogKzFcbiAgfVxuXVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVkQWN0aW9uUHJvdmlkZXJcbiIsImNvbnN0IFRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJylcbmNvbnN0IFRyYXZlbCA9IHJlcXVpcmUoJy4uL1RyYXZlbCcpXG5cbmNsYXNzIFRyYXZlbEFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gIHZhbGlkVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy50cmF2ZWwudmFsaWRcbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHJldHVybiB0aGlzLnRyYXZlbC5zdGFydCgpXG4gIH1cbn07XG5cblRyYXZlbEFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgdHJhdmVsOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFRyYXZlbCh7XG4gICAgICAgIHRyYXZlbGxlcjogdGhpcy5hY3RvcixcbiAgICAgICAgc3RhcnRMb2NhdGlvbjogdGhpcy5hY3Rvci5sb2NhdGlvbixcbiAgICAgICAgdGFyZ2V0TG9jYXRpb246IHRoaXMudGFyZ2V0XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBUcmF2ZWxBY3Rpb25cbiIsImNvbnN0IFBhdGhGaW5kZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKVxuY29uc3QgUGF0aFdhbGsgPSByZXF1aXJlKCcuLi9QYXRoV2FsaycpXG5jb25zdCBUYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpXG5cbmNsYXNzIFdhbGtBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICBleGVjdXRlICgpIHtcbiAgICBpZiAodGhpcy5hY3Rvci53YWxrICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYWN0b3Iud2Fsay5pbnRlcnJ1cHQoKVxuICAgIH1cbiAgICB0aGlzLndhbGsgPSB0aGlzLmFjdG9yLndhbGsgPSBuZXcgUGF0aFdhbGsodGhpcy5hY3RvciwgdGhpcy5wYXRoRmluZGVyKVxuICAgIHRoaXMuYWN0b3Iud2Fsay5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2goKVxuICAgIH0pXG4gICAgdGhpcy5hY3Rvci53YWxrLm9uKCdpbnRlcnJ1cHRlZCcsICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpXG4gICAgfSlcbiAgICByZXR1cm4gdGhpcy5hY3Rvci53YWxrLnN0YXJ0KClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKVxuICAgIGlmICh0aGlzLndhbGspIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGsuZGVzdHJveSgpXG4gICAgfVxuICB9XG5cbiAgdmFsaWRUYXJnZXQgKCkge1xuICAgIHRoaXMucGF0aEZpbmRlci5jYWxjdWwoKVxuICAgIHJldHVybiB0aGlzLnBhdGhGaW5kZXIuc29sdXRpb24gIT0gbnVsbFxuICB9XG59O1xuXG5XYWxrQWN0aW9uLnByb3BlcnRpZXMoe1xuICBwYXRoRmluZGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFBhdGhGaW5kZXIodGhpcy5hY3Rvci50aWxlLmNvbnRhaW5lciwgdGhpcy5hY3Rvci50aWxlLCB0aGlzLnRhcmdldCwge1xuICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFjdG9yLmNhbkdvT25UaWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rvci5jYW5Hb09uVGlsZSh0aWxlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZS53YWxrYWJsZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa0FjdGlvblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQWlybG9ja1wiOiByZXF1aXJlKFwiLi9BaXJsb2NrXCIpLFxuICBcIkFwcHJvYWNoXCI6IHJlcXVpcmUoXCIuL0FwcHJvYWNoXCIpLFxuICBcIkF1dG9tYXRpY0Rvb3JcIjogcmVxdWlyZShcIi4vQXV0b21hdGljRG9vclwiKSxcbiAgXCJDaGFyYWN0ZXJcIjogcmVxdWlyZShcIi4vQ2hhcmFjdGVyXCIpLFxuICBcIkNoYXJhY3RlckFJXCI6IHJlcXVpcmUoXCIuL0NoYXJhY3RlckFJXCIpLFxuICBcIkNvbmZyb250YXRpb25cIjogcmVxdWlyZShcIi4vQ29uZnJvbnRhdGlvblwiKSxcbiAgXCJEYW1hZ2VQcm9wYWdhdGlvblwiOiByZXF1aXJlKFwiLi9EYW1hZ2VQcm9wYWdhdGlvblwiKSxcbiAgXCJEYW1hZ2VhYmxlXCI6IHJlcXVpcmUoXCIuL0RhbWFnZWFibGVcIiksXG4gIFwiRG9vclwiOiByZXF1aXJlKFwiLi9Eb29yXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJFbmNvbnRlck1hbmFnZXJcIjogcmVxdWlyZShcIi4vRW5jb250ZXJNYW5hZ2VyXCIpLFxuICBcIkZsb29yXCI6IHJlcXVpcmUoXCIuL0Zsb29yXCIpLFxuICBcIkdhbWVcIjogcmVxdWlyZShcIi4vR2FtZVwiKSxcbiAgXCJJbnZlbnRvcnlcIjogcmVxdWlyZShcIi4vSW52ZW50b3J5XCIpLFxuICBcIkxpbmVPZlNpZ2h0XCI6IHJlcXVpcmUoXCIuL0xpbmVPZlNpZ2h0XCIpLFxuICBcIk1hcFwiOiByZXF1aXJlKFwiLi9NYXBcIiksXG4gIFwiT2JzdGFjbGVcIjogcmVxdWlyZShcIi4vT2JzdGFjbGVcIiksXG4gIFwiUGF0aFdhbGtcIjogcmVxdWlyZShcIi4vUGF0aFdhbGtcIiksXG4gIFwiUGVyc29uYWxXZWFwb25cIjogcmVxdWlyZShcIi4vUGVyc29uYWxXZWFwb25cIiksXG4gIFwiUGxheWVyXCI6IHJlcXVpcmUoXCIuL1BsYXllclwiKSxcbiAgXCJQcm9qZWN0aWxlXCI6IHJlcXVpcmUoXCIuL1Byb2plY3RpbGVcIiksXG4gIFwiUmVzc291cmNlXCI6IHJlcXVpcmUoXCIuL1Jlc3NvdXJjZVwiKSxcbiAgXCJSZXNzb3VyY2VUeXBlXCI6IHJlcXVpcmUoXCIuL1Jlc3NvdXJjZVR5cGVcIiksXG4gIFwiUm9vbUdlbmVyYXRvclwiOiByZXF1aXJlKFwiLi9Sb29tR2VuZXJhdG9yXCIpLFxuICBcIlNoaXBcIjogcmVxdWlyZShcIi4vU2hpcFwiKSxcbiAgXCJTaGlwV2VhcG9uXCI6IHJlcXVpcmUoXCIuL1NoaXBXZWFwb25cIiksXG4gIFwiU3Rhck1hcEdlbmVyYXRvclwiOiByZXF1aXJlKFwiLi9TdGFyTWFwR2VuZXJhdG9yXCIpLFxuICBcIlN0YXJTeXN0ZW1cIjogcmVxdWlyZShcIi4vU3RhclN5c3RlbVwiKSxcbiAgXCJUcmF2ZWxcIjogcmVxdWlyZShcIi4vVHJhdmVsXCIpLFxuICBcIlZpZXdcIjogcmVxdWlyZShcIi4vVmlld1wiKSxcbiAgXCJWaXNpb25DYWxjdWxhdG9yXCI6IHJlcXVpcmUoXCIuL1Zpc2lvbkNhbGN1bGF0b3JcIiksXG4gIFwiYWN0aW9uc1wiOiB7XG4gICAgXCJBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BY3Rpb25cIiksXG4gICAgXCJBY3Rpb25Qcm92aWRlclwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0FjdGlvblByb3ZpZGVyXCIpLFxuICAgIFwiQXR0YWNrQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQXR0YWNrQWN0aW9uXCIpLFxuICAgIFwiQXR0YWNrTW92ZUFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb25cIiksXG4gICAgXCJTaW1wbGVBY3Rpb25Qcm92aWRlclwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL1NpbXBsZUFjdGlvblByb3ZpZGVyXCIpLFxuICAgIFwiVGFyZ2V0QWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVGFyZ2V0QWN0aW9uXCIpLFxuICAgIFwiVGlsZWRBY3Rpb25Qcm92aWRlclwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJUcmF2ZWxBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UcmF2ZWxBY3Rpb25cIiksXG4gICAgXCJXYWxrQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvV2Fsa0FjdGlvblwiKSxcbiAgfSxcbn0iLCJjb25zdCBsaWJzID0gcmVxdWlyZSgnLi9saWJzJylcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKHt9LCBsaWJzLCB7XG4gIGdyaWRzOiByZXF1aXJlKCdwYXJhbGxlbGlvLWdyaWRzJyksXG4gIFBhdGhGaW5kZXI6IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpLFxuICBzdHJpbmdzOiByZXF1aXJlKCdwYXJhbGxlbGlvLXN0cmluZ3MnKSxcbiAgdGlsZXM6IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKSxcbiAgVGltaW5nOiByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpLFxuICB3aXJpbmc6IHJlcXVpcmUoJ3BhcmFsbGVsaW8td2lyaW5nJyksXG4gIFNwYXJrOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJylcbn0pXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgb2JqZWN0Q3JlYXRlUG9seWZpbGxcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1BvbHlmaWxsXG52YXIgYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uQmluZFBvbHlmaWxsXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbnZhciBoYXNEZWZpbmVQcm9wZXJ0eTtcbnRyeSB7XG4gIHZhciBvID0ge307XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCAneCcsIHsgdmFsdWU6IDAgfSk7XG4gIGhhc0RlZmluZVByb3BlcnR5ID0gby54ID09PSAwO1xufSBjYXRjaCAoZXJyKSB7IGhhc0RlZmluZVByb3BlcnR5ID0gZmFsc2UgfVxuaWYgKGhhc0RlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGlucHV0IGlzIGEgcG9zaXRpdmUgbnVtYmVyICh3aG9zZSB2YWx1ZSBpcyB6ZXJvIG9yXG4gICAgICAvLyBncmVhdGVyIGFuZCBub3QgYSBOYU4pLlxuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgYXJnICE9PSBhcmcpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZGVmYXVsdE1heExpc3RlbmVyc1wiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcIm5cIiBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gJGdldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbi8vIFRoZXNlIHN0YW5kYWxvbmUgZW1pdCogZnVuY3Rpb25zIGFyZSB1c2VkIHRvIG9wdGltaXplIGNhbGxpbmcgb2YgZXZlbnRcbi8vIGhhbmRsZXJzIGZvciBmYXN0IGNhc2VzIGJlY2F1c2UgZW1pdCgpIGl0c2VsZiBvZnRlbiBoYXMgYSB2YXJpYWJsZSBudW1iZXIgb2Zcbi8vIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGJlY2F1c2Ugb2YgdGhhdC4gVGhlc2UgZnVuY3Rpb25zIGFsd2F5cyBoYXZlXG4vLyB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCB0aHVzIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQsIHNvIHRoZSBjb2RlXG4vLyBpbnNpZGUgdGhlbSBjYW4gZXhlY3V0ZSBmYXN0ZXIuXG5mdW5jdGlvbiBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJncykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgZXZlbnRzO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PSBudWxsKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgY2FzZSAxOlxuICAgICAgZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmICghZXZlbnRzKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgbSA9ICRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICAgIGlmIChtICYmIG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnIFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0LicpO1xuICAgICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignJXM6ICVzJywgdy5uYW1lLCB3Lm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0pO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzJdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpXG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IGJpbmQuY2FsbChvbmNlV3JhcHBlciwgc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmICghbGlzdClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoIWV2bGlzdGVuZXIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/IHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbi8vIEFib3V0IDEuNXggZmFzdGVyIHRoYW4gdGhlIHR3by1hcmcgdmVyc2lvbiBvZiBBcnJheSNzcGxpY2UoKS5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKHZhciBpID0gaW5kZXgsIGsgPSBpICsgMSwgbiA9IGxpc3QubGVuZ3RoOyBrIDwgbjsgaSArPSAxLCBrICs9IDEpXG4gICAgbGlzdFtpXSA9IGxpc3Rba107XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0Q3JlYXRlUG9seWZpbGwocHJvdG8pIHtcbiAgdmFyIEYgPSBmdW5jdGlvbigpIHt9O1xuICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICByZXR1cm4gbmV3IEY7XG59XG5mdW5jdGlvbiBvYmplY3RLZXlzUG9seWZpbGwob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHtcbiAgICBrZXlzLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIGs7XG59XG5mdW5jdGlvbiBmdW5jdGlvbkJpbmRQb2x5ZmlsbChjb250ZXh0KSB7XG4gIHZhciBmbiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIG5leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy9icm93c2VyLmpzJykubmV4dFRpY2s7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaW1tZWRpYXRlSWRzID0ge307XG52YXIgbmV4dEltbWVkaWF0ZUlkID0gMDtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHsgdGltZW91dC5jbG9zZSgpOyB9O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIFRoYXQncyBub3QgaG93IG5vZGUuanMgaW1wbGVtZW50cyBpdCBidXQgdGhlIGV4cG9zZWQgYXBpIGlzIHRoZSBzYW1lLlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBmdW5jdGlvbihmbikge1xuICB2YXIgaWQgPSBuZXh0SW1tZWRpYXRlSWQrKztcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGZhbHNlIDogc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGltbWVkaWF0ZUlkc1tpZF0gPSB0cnVlO1xuXG4gIG5leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKSB7XG4gICAgaWYgKGltbWVkaWF0ZUlkc1tpZF0pIHtcbiAgICAgIC8vIGZuLmNhbGwoKSBpcyBmYXN0ZXIgc28gd2Ugb3B0aW1pemUgZm9yIHRoZSBjb21tb24gdXNlLWNhc2VcbiAgICAgIC8vIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vY2FsbC1hcHBseS1zZWd1XG4gICAgICBpZiAoYXJncykge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBQcmV2ZW50IGlkcyBmcm9tIGxlYWtpbmdcbiAgICAgIGV4cG9ydHMuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IHR5cGVvZiBjbGVhckltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xlYXJJbW1lZGlhdGUgOiBmdW5jdGlvbihpZCkge1xuICBkZWxldGUgaW1tZWRpYXRlSWRzW2lkXTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIEJpbmRlcjogcmVxdWlyZSgnLi9zcmMvQmluZGVyJyksXG4gIEV2ZW50QmluZDogcmVxdWlyZSgnLi9zcmMvRXZlbnRCaW5kJyksXG4gIFJlZmVyZW5jZTogcmVxdWlyZSgnLi9zcmMvUmVmZXJlbmNlJylcbn1cbiIsImNsYXNzIEJpbmRlciB7XG4gIHRvZ2dsZUJpbmQgKHZhbCA9ICF0aGlzLmJpbmRlZCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLmJpbmQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy51bmJpbmQoKVxuICAgIH1cbiAgfVxuXG4gIGJpbmQgKCkge1xuICAgIGlmICghdGhpcy5iaW5kZWQgJiYgdGhpcy5jYW5CaW5kKCkpIHtcbiAgICAgIHRoaXMuZG9CaW5kKClcbiAgICB9XG4gICAgdGhpcy5iaW5kZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNhbkJpbmQgKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBkb0JpbmQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIHVuYmluZCAoKSB7XG4gICAgaWYgKHRoaXMuYmluZGVkICYmIHRoaXMuY2FuQmluZCgpKSB7XG4gICAgICB0aGlzLmRvVW5iaW5kKClcbiAgICB9XG4gICAgdGhpcy5iaW5kZWQgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkb1VuYmluZCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy51bmJpbmQoKVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJpbmRlclxuIiwiXG5jb25zdCBCaW5kZXIgPSByZXF1aXJlKCcuL0JpbmRlcicpXG5jb25zdCBSZWZlcmVuY2UgPSByZXF1aXJlKCcuL1JlZmVyZW5jZScpXG5cbmNsYXNzIEV2ZW50QmluZCBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yIChldmVudDEsIHRhcmdldDEsIGNhbGxiYWNrKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuZXZlbnQgPSBldmVudDFcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDFcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2tcbiAgfVxuXG4gIGNhbkJpbmQgKCkge1xuICAgIHJldHVybiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbClcbiAgfVxuXG4gIGJpbmRUbyAodGFyZ2V0KSB7XG4gICAgdGhpcy51bmJpbmQoKVxuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgcmV0dXJuIHRoaXMuYmluZCgpXG4gIH1cblxuICBkb0JpbmQgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vbih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJylcbiAgICB9XG4gIH1cblxuICBkb1VuYmluZCAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5vZmYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vZmYodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byByZW1vdmUgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpXG4gICAgfVxuICB9XG5cbiAgZXF1YWxzIChldmVudEJpbmQpIHtcbiAgICByZXR1cm4gZXZlbnRCaW5kICE9IG51bGwgJiZcbiAgICAgIGV2ZW50QmluZC5jb25zdHJ1Y3RvciA9PT0gdGhpcy5jb25zdHJ1Y3RvciAmJlxuICAgICAgZXZlbnRCaW5kLmV2ZW50ID09PSB0aGlzLmV2ZW50ICYmXG4gICAgICBSZWZlcmVuY2UuY29tcGFyZVZhbChldmVudEJpbmQudGFyZ2V0LCB0aGlzLnRhcmdldCkgJiZcbiAgICAgIFJlZmVyZW5jZS5jb21wYXJlVmFsKGV2ZW50QmluZC5jYWxsYmFjaywgdGhpcy5jYWxsYmFjaylcbiAgfVxuXG4gIHN0YXRpYyBjaGVja0VtaXR0ZXIgKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xuICAgIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSBpZiAoZmF0YWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRCaW5kXG4iLCJjbGFzcyBSZWZlcmVuY2Uge1xuICBjb25zdHJ1Y3RvciAoZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IGRhdGFcbiAgfVxuXG4gIGVxdWFscyAocmVmKSB7XG4gICAgcmV0dXJuIHJlZiAhPSBudWxsICYmIHJlZi5jb25zdHJ1Y3RvciA9PT0gdGhpcy5jb25zdHJ1Y3RvciAmJiB0aGlzLmNvbXBhcmVEYXRhKHJlZi5kYXRhKVxuICB9XG5cbiAgY29tcGFyZURhdGEgKGRhdGEpIHtcbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIFJlZmVyZW5jZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKGRhdGEpXG4gICAgfVxuICAgIGlmICh0aGlzLmRhdGEgPT09IGRhdGEpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmICh0aGlzLmRhdGEgPT0gbnVsbCB8fCBkYXRhID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5kYXRhKS5sZW5ndGggPT09IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCAmJiBPYmplY3Qua2V5cyhkYXRhKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiBSZWZlcmVuY2UuY29tcGFyZVZhbCh0aGlzLmRhdGFba2V5XSwgZGF0YVtrZXldKVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIFJlZmVyZW5jZS5jb21wYXJlVmFsKHRoaXMuZGF0YSwgZGF0YSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IHZhbDFcbiAgICogQHBhcmFtIHsqfSB2YWwyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzdGF0aWMgY29tcGFyZVZhbCAodmFsMSwgdmFsMikge1xuICAgIGlmICh2YWwxID09PSB2YWwyKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAodmFsMSA9PSBudWxsIHx8IHZhbDIgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsMS5lcXVhbHMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB2YWwxLmVxdWFscyh2YWwyKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbDIuZXF1YWxzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdmFsMi5lcXVhbHModmFsMSlcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsMSkgJiYgQXJyYXkuaXNBcnJheSh2YWwyKSkge1xuICAgICAgcmV0dXJuIHZhbDEubGVuZ3RoID09PSB2YWwyLmxlbmd0aCAmJiB2YWwxLmV2ZXJ5KCh2YWwsIGkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVZhbCh2YWwsIHZhbDJbaV0pXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyBpZiAodHlwZW9mIHZhbDEgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWwyID09PSAnb2JqZWN0Jykge1xuICAgIC8vICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbDEpLmxlbmd0aCA9PT0gT2JqZWN0LmtleXModmFsMikubGVuZ3RoICYmIE9iamVjdC5rZXlzKHZhbDEpLmV2ZXJ5KChrZXkpID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVZhbCh2YWwxW2tleV0sIHZhbDJba2V5XSlcbiAgICAvLyAgIH0pXG4gICAgLy8gfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgc3RhdGljIG1ha2VSZWZlcnJlZCAob2JqLCBkYXRhKSB7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIG9iai5yZWYgPSBkYXRhXG4gICAgfSBlbHNlIHtcbiAgICAgIG9iai5yZWYgPSBuZXcgUmVmZXJlbmNlKGRhdGEpXG4gICAgfVxuICAgIG9iai5lcXVhbHMgPSBmdW5jdGlvbiAob2JqMikge1xuICAgICAgcmV0dXJuIG9iajIgIT0gbnVsbCAmJiB0aGlzLnJlZi5lcXVhbHMob2JqMi5yZWYpXG4gICAgfVxuICAgIHJldHVybiBvYmpcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWZlcmVuY2VcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9zcmMvQ29sbGVjdGlvbicpXG4iLCIvKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmNsYXNzIENvbGxlY3Rpb24ge1xuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD58VH0gW2Fycl1cbiAgICovXG4gIGNvbnN0cnVjdG9yIChhcnIpIHtcbiAgICBpZiAoYXJyICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJyLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnIudG9BcnJheSgpXG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICB0aGlzLl9hcnJheSA9IGFyclxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBbYXJyXVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hcnJheSA9IFtdXG4gICAgfVxuICB9XG5cbiAgY2hhbmdlZCAoKSB7fVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPFQ+fEFycmF5LjxUPn0gb2xkXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gb3JkZXJlZFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFQsVCk6IGJvb2xlYW59IGNvbXBhcmVGdW5jdGlvblxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgY2hlY2tDaGFuZ2VzIChvbGQsIG9yZGVyZWQgPSB0cnVlLCBjb21wYXJlRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgaWYgKGNvbXBhcmVGdW5jdGlvbiA9PSBudWxsKSB7XG4gICAgICBjb21wYXJlRnVuY3Rpb24gPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYSA9PT0gYlxuICAgICAgfVxuICAgIH1cbiAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgIG9sZCA9IHRoaXMuY29weShvbGQuc2xpY2UoKSlcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkID0gW11cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKSAhPT0gb2xkLmxlbmd0aCB8fCAob3JkZXJlZCA/IHRoaXMuc29tZShmdW5jdGlvbiAodmFsLCBpKSB7XG4gICAgICByZXR1cm4gIWNvbXBhcmVGdW5jdGlvbihvbGQuZ2V0KGkpLCB2YWwpXG4gICAgfSkgOiB0aGlzLnNvbWUoZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiAhb2xkLnBsdWNrKGZ1bmN0aW9uIChiKSB7XG4gICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oYSwgYilcbiAgICAgIH0pXG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlcbiAgICogQHJldHVybiB7VH1cbiAgICovXG4gIGdldCAoaSkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtpXVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBnZXRSYW5kb20gKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLl9hcnJheS5sZW5ndGgpXVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXG4gICAqIEBwYXJhbSB7VH0gdmFsXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBzZXQgKGksIHZhbCkge1xuICAgIHZhciBvbGRcbiAgICBpZiAodGhpcy5fYXJyYXlbaV0gIT09IHZhbCkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIHRoaXMuX2FycmF5W2ldID0gdmFsXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdmFsXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtUfSB2YWxcbiAgICovXG4gIGFkZCAodmFsKSB7XG4gICAgaWYgKCF0aGlzLl9hcnJheS5pbmNsdWRlcyh2YWwpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKHZhbClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1R9IHZhbFxuICAgKi9cbiAgcmVtb3ZlICh2YWwpIHtcbiAgICB2YXIgaW5kZXgsIG9sZFxuICAgIGluZGV4ID0gdGhpcy5fYXJyYXkuaW5kZXhPZih2YWwpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbihUKTogYm9vbGVhbn0gZm5cbiAgICogQHJldHVybiB7VH1cbiAgICovXG4gIHBsdWNrIChmbikge1xuICAgIHZhciBmb3VuZCwgaW5kZXgsIG9sZFxuICAgIGluZGV4ID0gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZuKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKVxuICAgICAgZm91bmQgPSB0aGlzLl9hcnJheVtpbmRleF1cbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgICByZXR1cm4gZm91bmRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtBcnJheS48Q29sbGVjdGlvbi48VD4+fEFycmF5LjxBcnJheS48VD4+fEFycmF5LjxUPn0gYXJyXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPFQ+fVxuICAgKi9cbiAgY29uY2F0ICguLi5hcnIpIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXMuX2FycmF5LmNvbmNhdCguLi5hcnIubWFwKChhKSA9PiBhLnRvQXJyYXkgPT0gbnVsbCA/IGEgOiBhLnRvQXJyYXkoKSkpKVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIHRvQXJyYXkgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgY291bnQgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5sZW5ndGhcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgSXRlbVR5cGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHRvQXBwZW5kXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48SXRlbVR5cGU+fEFycmF5LjxJdGVtVHlwZT58SXRlbVR5cGV9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPEl0ZW1UeXBlPn1cbiAgICovXG4gIHN0YXRpYyBuZXdTdWJDbGFzcyAodG9BcHBlbmQsIGFycikge1xuICAgIHZhciBTdWJDbGFzc1xuICAgIGlmICh0eXBlb2YgdG9BcHBlbmQgPT09ICdvYmplY3QnKSB7XG4gICAgICBTdWJDbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpcyB7fVxuICAgICAgT2JqZWN0LmFzc2lnbihTdWJDbGFzcy5wcm90b3R5cGUsIHRvQXBwZW5kKVxuICAgICAgcmV0dXJuIG5ldyBTdWJDbGFzcyhhcnIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyhhcnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPFQ+fVxuICAgKi9cbiAgY29weSAoYXJyKSB7XG4gICAgdmFyIGNvbGxcbiAgICBpZiAoYXJyID09IG51bGwpIHtcbiAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpXG4gICAgfVxuICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpXG4gICAgcmV0dXJuIGNvbGxcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IGFyclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZXF1YWxzIChhcnIpIHtcbiAgICByZXR1cm4gKHRoaXMuY291bnQoKSA9PT0gKHR5cGVvZiBhcnIuY291bnQgPT09ICdmdW5jdGlvbicgPyBhcnIuY291bnQoKSA6IGFyci5sZW5ndGgpKSAmJiB0aGlzLmV2ZXJ5KGZ1bmN0aW9uICh2YWwsIGkpIHtcbiAgICAgIHJldHVybiBhcnJbaV0gPT09IHZhbFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICBnZXRBZGRlZEZyb20gKGFycikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiAhYXJyLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPFQ+fEFycmF5LjxUPn0gYXJyXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIGdldFJlbW92ZWRGcm9tIChhcnIpIHtcbiAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuICF0aGlzLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxufTtcblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXVxuXG5Db2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zID0gWydmaWx0ZXInLCAnc2xpY2UnXVxuXG5Db2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXVxuXG5Db2xsZWN0aW9uLnJlYWRGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZnVuY3QpIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24gKC4uLmFyZykge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKVxuICB9XG59KVxuXG5Db2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGZ1bmN0KSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uICguLi5hcmcpIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpKVxuICB9XG59KVxuXG5Db2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGZ1bmN0KSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uICguLi5hcmcpIHtcbiAgICB2YXIgb2xkLCByZXNcbiAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKVxuICAgIHJlcyA9IHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpXG4gICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICByZXR1cm4gcmVzXG4gIH1cbn0pXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb2xsZWN0aW9uLnByb3RvdHlwZSwgJ2xlbmd0aCcsIHtcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKVxuICB9XG59KVxuXG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sICE9PSBudWxsID8gU3ltYm9sLml0ZXJhdG9yIDogMCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtTeW1ib2wuaXRlcmF0b3JdKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBJbnZhbGlkYXRvcjogcmVxdWlyZSgnLi9zcmMvSW52YWxpZGF0b3InKSxcbiAgUHJvcGVydGllc01hbmFnZXI6IHJlcXVpcmUoJy4vc3JjL1Byb3BlcnRpZXNNYW5hZ2VyJyksXG4gIFByb3BlcnR5OiByZXF1aXJlKCcuL3NyYy9Qcm9wZXJ0eScpLFxuICBnZXR0ZXJzOiB7XG4gICAgQmFzZUdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9CYXNlR2V0dGVyJyksXG4gICAgQ2FsY3VsYXRlZEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9DYWxjdWxhdGVkR2V0dGVyJyksXG4gICAgQ29tcG9zaXRlR2V0dGVyOiByZXF1aXJlKCcuL3NyYy9nZXR0ZXJzL0NvbXBvc2l0ZUdldHRlcicpLFxuICAgIEludmFsaWRhdGVkR2V0dGVyOiByZXF1aXJlKCcuL3NyYy9nZXR0ZXJzL0ludmFsaWRhdGVkR2V0dGVyJyksXG4gICAgTWFudWFsR2V0dGVyOiByZXF1aXJlKCcuL3NyYy9nZXR0ZXJzL01hbnVhbEdldHRlcicpLFxuICAgIFNpbXBsZUdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9TaW1wbGVHZXR0ZXInKVxuICB9LFxuICBzZXR0ZXJzOiB7XG4gICAgQmFzZVNldHRlcjogcmVxdWlyZSgnLi9zcmMvc2V0dGVycy9CYXNlU2V0dGVyJyksXG4gICAgQmFzZVZhbHVlU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL0Jhc2VWYWx1ZVNldHRlcicpLFxuICAgIENvbGxlY3Rpb25TZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvQ29sbGVjdGlvblNldHRlcicpLFxuICAgIE1hbnVhbFNldHRlcjogcmVxdWlyZSgnLi9zcmMvc2V0dGVycy9NYW51YWxTZXR0ZXInKSxcbiAgICBTaW1wbGVTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvU2ltcGxlU2V0dGVyJylcbiAgfSxcbiAgd2F0Y2hlcnM6IHtcbiAgICBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyOiByZXF1aXJlKCcuL3NyYy93YXRjaGVycy9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyJyksXG4gICAgUHJvcGVydHlXYXRjaGVyOiByZXF1aXJlKCcuL3NyYy93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXInKVxuICB9XG59XG4iLCJjb25zdCBCaW5kZXIgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuQmluZGVyXG5jb25zdCBFdmVudEJpbmQgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuRXZlbnRCaW5kXG5cbmNvbnN0IHBsdWNrID0gZnVuY3Rpb24gKGFyciwgZm4pIHtcbiAgdmFyIGZvdW5kLCBpbmRleFxuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pXG4gIGlmIChpbmRleCA+IC0xKSB7XG4gICAgZm91bmQgPSBhcnJbaW5kZXhdXG4gICAgYXJyLnNwbGljZShpbmRleCwgMSlcbiAgICByZXR1cm4gZm91bmRcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmNsYXNzIEludmFsaWRhdG9yIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IgKGludmFsaWRhdGVkLCBzY29wZSA9IG51bGwpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pbnZhbGlkYXRlZCA9IGludmFsaWRhdGVkXG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXVxuICAgIHRoaXMucmVjeWNsZWQgPSBbXVxuICAgIHRoaXMudW5rbm93bnMgPSBbXVxuICAgIHRoaXMuc3RyaWN0ID0gdGhpcy5jb25zdHJ1Y3Rvci5zdHJpY3RcbiAgICB0aGlzLmludmFsaWQgPSBmYWxzZVxuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKClcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzXG4gICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2sgPSAob2xkLCBjb250ZXh0KSA9PiB7XG4gICAgICB0aGlzLmludmFsaWRhdGUoY29udGV4dClcbiAgICB9XG4gICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2sub3duZXIgPSB0aGlzXG4gIH1cblxuICBpbnZhbGlkYXRlIChjb250ZXh0KSB7XG4gICAgdmFyIGZ1bmN0TmFtZVxuICAgIHRoaXMuaW52YWxpZCA9IHRydWVcbiAgICBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQoY29udGV4dClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrKGNvbnRleHQpXG4gICAgfSBlbHNlIGlmICgodGhpcy5pbnZhbGlkYXRlZCAhPSBudWxsKSAmJiB0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZC5pbnZhbGlkYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmludmFsaWRhdGVkLmludmFsaWRhdGUoY29udGV4dClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludmFsaWRhdGVkID09PSAnc3RyaW5nJykge1xuICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5pbnZhbGlkYXRlZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuaW52YWxpZGF0ZWQuc2xpY2UoMSlcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zY29wZVtmdW5jdE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc2NvcGVbZnVuY3ROYW1lXShjb250ZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zY29wZVt0aGlzLmludmFsaWRhdGVkXSA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKGNvbnRleHQpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRlZCAhPSBudWxsICYmIHR5cGVvZiB0aGlzLmludmFsaWRhdGVkLnVua25vd24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLnVua25vd24oY29udGV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShjb250ZXh0KVxuICAgIH1cbiAgfVxuXG4gIGFkZEV2ZW50QmluZCAoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5hZGRCaW5kZXIobmV3IEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykpXG4gIH1cblxuICBhZGRCaW5kZXIgKGJpbmRlcikge1xuICAgIGlmIChiaW5kZXIuY2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgYmluZGVyLmNhbGxiYWNrID0gdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2tcbiAgICB9XG4gICAgaWYgKCF0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5zb21lKGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcilcbiAgICB9KSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2gocGx1Y2sodGhpcy5yZWN5Y2xlZCwgZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpXG4gICAgICB9KSB8fCBiaW5kZXIpXG4gICAgfVxuICB9XG5cbiAgZ2V0VW5rbm93bkNhbGxiYWNrIChwcm9wKSB7XG4gICAgdmFyIGNhbGxiYWNrXG4gICAgY2FsbGJhY2sgPSAoY29udGV4dCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldCgpXG4gICAgICB9LCBwcm9wLCBjb250ZXh0KVxuICAgIH1cbiAgICBjYWxsYmFjay5wcm9wID0gcHJvcFxuICAgIGNhbGxiYWNrLm93bmVyID0gdGhpc1xuICAgIHJldHVybiBjYWxsYmFja1xuICB9XG5cbiAgYWRkVW5rbm93biAoZm4sIHByb3AsIGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuZmluZFVua25vd24ocHJvcCkpIHtcbiAgICAgIGZuLnByb3AgPSBwcm9wXG4gICAgICBmbi5vd25lciA9IHRoaXNcbiAgICAgIHRoaXMudW5rbm93bnMucHVzaChmbilcbiAgICAgIHJldHVybiB0aGlzLnVua25vd24oY29udGV4dClcbiAgICB9XG4gIH1cblxuICBmaW5kVW5rbm93biAocHJvcCkge1xuICAgIGlmIChwcm9wICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnVua25vd25zLmZpbmQoZnVuY3Rpb24gKHVua25vd24pIHtcbiAgICAgICAgcmV0dXJuIHVua25vd24ucHJvcCA9PT0gcHJvcFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBldmVudCAoZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICBpZiAodGhpcy5jaGVja0VtaXR0ZXIodGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQpXG4gICAgfVxuICB9XG5cbiAgdmFsdWUgKHZhbCwgZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpXG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSB7UHJvcGVydHk8VD59IHByb3BcbiAgICogQHJldHVybiB7VH1cbiAgICovXG4gIHByb3AgKHByb3ApIHtcbiAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50QmluZCgnaW52YWxpZGF0ZWQnLCBwcm9wLmV2ZW50cywgdGhpcy5nZXRVbmtub3duQ2FsbGJhY2socHJvcCkpXG4gICAgICB0aGlzLmFkZEV2ZW50QmluZCgndXBkYXRlZCcsIHByb3AuZXZlbnRzLCB0aGlzLmNoYW5nZWRDYWxsYmFjaylcbiAgICAgIHJldHVybiBwcm9wLmdldCgpXG4gICAgfVxuICB9XG5cbiAgcHJvcEJ5TmFtZSAocHJvcCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgIGlmICh0YXJnZXQucHJvcGVydGllc01hbmFnZXIgIT0gbnVsbCkge1xuICAgICAgY29uc3QgcHJvcGVydHkgPSB0YXJnZXQucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkocHJvcClcbiAgICAgIGlmIChwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wKHByb3BlcnR5KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGFyZ2V0W3Byb3AgKyAnUHJvcGVydHknXSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wKHRhcmdldFtwcm9wICsgJ1Byb3BlcnR5J10pXG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRbcHJvcF1cbiAgfVxuXG4gIHByb3BQYXRoIChwYXRoLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgdmFyIHByb3AsIHZhbFxuICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJylcbiAgICB2YWwgPSB0YXJnZXRcbiAgICB3aGlsZSAoKHZhbCAhPSBudWxsKSAmJiBwYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgIHByb3AgPSBwYXRoLnNoaWZ0KClcbiAgICAgIHZhbCA9IHRoaXMucHJvcEJ5TmFtZShwcm9wLCB2YWwpXG4gICAgfVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIGZ1bmN0IChmdW5jdCkge1xuICAgIHZhciBpbnZhbGlkYXRvciwgcmVzXG4gICAgaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bigoKSA9PiB7XG4gICAgICAgIHZhciByZXMyXG4gICAgICAgIHJlczIgPSBmdW5jdChpbnZhbGlkYXRvcilcbiAgICAgICAgaWYgKHJlcyAhPT0gcmVzMikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKVxuICAgICAgICB9XG4gICAgICB9LCBpbnZhbGlkYXRvcilcbiAgICB9KVxuICAgIHJlcyA9IGZ1bmN0KGludmFsaWRhdG9yKVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2goaW52YWxpZGF0b3IpXG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgdmFsaWRhdGVVbmtub3ducyAoKSB7XG4gICAgdGhpcy51bmtub3ducy5zbGljZSgpLmZvckVhY2goZnVuY3Rpb24gKHVua25vd24pIHtcbiAgICAgIHVua25vd24oKVxuICAgIH0pXG4gICAgdGhpcy51bmtub3ducyA9IFtdXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5sZW5ndGggPT09IDBcbiAgfVxuXG4gIGJpbmQgKCkge1xuICAgIHRoaXMuaW52YWxpZCA9IGZhbHNlXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICBldmVudEJpbmQuYmluZCgpXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcmVjeWNsZSAoZm4pIHtcbiAgICB2YXIgZG9uZSwgcmVzXG4gICAgdGhpcy5yZWN5Y2xlZCA9IHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXVxuICAgIGRvbmUgPSB0aGlzLmVuZFJlY3ljbGUuYmluZCh0aGlzKVxuICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChmbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIHJldHVybiBmbih0aGlzLCBkb25lKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gZm4odGhpcylcbiAgICAgICAgZG9uZSgpXG4gICAgICAgIHJldHVybiByZXNcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRvbmVcbiAgICB9XG4gIH1cblxuICBlbmRSZWN5Y2xlICgpIHtcbiAgICB0aGlzLnJlY3ljbGVkLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgcmV0dXJuIGV2ZW50QmluZC51bmJpbmQoKVxuICAgIH0pXG4gICAgdGhpcy5yZWN5Y2xlZCA9IFtdXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNoZWNrRW1pdHRlciAoZW1pdHRlcikge1xuICAgIHJldHVybiBFdmVudEJpbmQuY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIHRoaXMuc3RyaWN0KVxuICB9XG5cbiAgY2hlY2tQcm9wSW5zdGFuY2UgKHByb3ApIHtcbiAgICByZXR1cm4gdHlwZW9mIHByb3AuZ2V0ID09PSAnZnVuY3Rpb24nICYmIHRoaXMuY2hlY2tFbWl0dGVyKHByb3AuZXZlbnRzKVxuICB9XG5cbiAgdW5iaW5kICgpIHtcbiAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgIGV2ZW50QmluZC51bmJpbmQoKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufTtcblxuSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdG9yXG4iLCJjb25zdCBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHknKVxuXG5jbGFzcyBQcm9wZXJ0aWVzTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yIChwcm9wZXJ0aWVzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheS48UHJvcGVydHk+fVxuICAgICAqL1xuICAgIHRoaXMucHJvcGVydGllcyA9IFtdXG4gICAgdGhpcy5nbG9iYWxPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IGluaXRXYXRjaGVyczogZmFsc2UgfSwgb3B0aW9ucylcbiAgICB0aGlzLnByb3BlcnRpZXNPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcGVydGllcylcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IHByb3BlcnRpZXNcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zXG4gICAqIEByZXR1cm4ge1Byb3BlcnRpZXNNYW5hZ2VyfVxuICAgKi9cbiAgY29weVdpdGggKHByb3BlcnRpZXMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMubWVyZ2VQcm9wZXJ0aWVzT3B0aW9ucyh0aGlzLnByb3BlcnRpZXNPcHRpb25zLCBwcm9wZXJ0aWVzKSwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nbG9iYWxPcHRpb25zLCBvcHRpb25zKSlcbiAgfVxuXG4gIHdpdGhQcm9wZXJ0eSAocHJvcCwgb3B0aW9ucykge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fVxuICAgIHByb3BlcnRpZXNbcHJvcF0gPSBvcHRpb25zXG4gICAgcmV0dXJuIHRoaXMuY29weVdpdGgocHJvcGVydGllcylcbiAgfVxuXG4gIHVzZVNjb3BlIChzY29wZSkge1xuICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHt9LCB7IHNjb3BlOiBzY29wZSB9KVxuICB9XG5cbiAgbWVyZ2VQcm9wZXJ0aWVzT3B0aW9ucyAoLi4uYXJnKSB7XG4gICAgcmV0dXJuIGFyZy5yZWR1Y2UoKHJlcywgb3B0KSA9PiB7XG4gICAgICBPYmplY3Qua2V5cyhvcHQpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgcmVzW25hbWVdID0gdGhpcy5tZXJnZVByb3BlcnR5T3B0aW9ucyhyZXNbbmFtZV0gfHwge30sIG9wdFtuYW1lXSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzXG4gICAgfSwge30pXG4gIH1cblxuICBtZXJnZVByb3BlcnR5T3B0aW9ucyAoLi4uYXJnKSB7XG4gICAgY29uc3Qgbm90TWVyZ2FibGUgPSBbJ2RlZmF1bHQnLCAnc2NvcGUnXVxuICAgIHJldHVybiBhcmcucmVkdWNlKChyZXMsIG9wdCkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMob3B0KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzW25hbWVdID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvcHRbbmFtZV0gPT09ICdmdW5jdGlvbicgJiYgIW5vdE1lcmdhYmxlLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICAgICAgcmVzW25hbWVdID0gdGhpcy5tZXJnZUNhbGxiYWNrKHJlc1tuYW1lXSwgb3B0W25hbWVdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc1tuYW1lXSA9IG9wdFtuYW1lXVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0sIHt9KVxuICB9XG5cbiAgbWVyZ2VDYWxsYmFjayAob2xkRnVuY3QsIG5ld0Z1bmN0KSB7XG4gICAgY29uc3QgZm4gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgICByZXR1cm4gbmV3RnVuY3QuY2FsbCh0aGlzLCAuLi5hcmcsIG9sZEZ1bmN0LmJpbmQodGhpcykpXG4gICAgfVxuICAgIGZuLmNvbXBvbmVudHMgPSAob2xkRnVuY3QuY29tcG9uZW50cyB8fCBbb2xkRnVuY3RdKS5jb25jYXQoKG9sZEZ1bmN0Lm5ld0Z1bmN0IHx8IFtuZXdGdW5jdF0pKVxuICAgIGZuLm5iUGFyYW1zID0gbmV3RnVuY3QubmJQYXJhbXMgfHwgbmV3RnVuY3QubGVuZ3RoXG4gICAgcmV0dXJuIGZuXG4gIH1cblxuICBpbml0UHJvcGVydGllcyAoKSB7XG4gICAgdGhpcy5hZGRQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllc09wdGlvbnMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycyAoKSB7XG4gICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHByb3AuY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzKCkpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGluaXRXYXRjaGVycyAoKSB7XG4gICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHByb3AuaW5pdFdhdGNoZXJzKCkpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGluaXRTY29wZSAoKSB7XG4gICAgdGhpcy5pbml0UHJvcGVydGllcygpXG4gICAgdGhpcy5jcmVhdGVTY29wZUdldHRlclNldHRlcnMoKVxuICAgIHRoaXMuaW5pdFdhdGNoZXJzKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eTxUPn1cbiAgICovXG4gIGFkZFByb3BlcnR5IChuYW1lLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcHJvcCA9IG5ldyBQcm9wZXJ0eShPYmplY3QuYXNzaWduKHsgbmFtZTogbmFtZSB9LCB0aGlzLmdsb2JhbE9wdGlvbnMsIG9wdGlvbnMpKVxuICAgIHRoaXMucHJvcGVydGllcy5wdXNoKHByb3ApXG4gICAgcmV0dXJuIHByb3BcbiAgfVxuXG4gIGFkZFByb3BlcnRpZXMgKG9wdGlvbnMpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKChuYW1lKSA9PiB0aGlzLmFkZFByb3BlcnR5KG5hbWUsIG9wdGlvbnNbbmFtZV0pKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybnMge1Byb3BlcnR5fVxuICAgKi9cbiAgZ2V0UHJvcGVydHkgKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLmZpbmQoKHByb3ApID0+IHByb3Aub3B0aW9ucy5uYW1lID09PSBuYW1lKVxuICB9XG5cbiAgc2V0UHJvcGVydGllc0RhdGEgKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKCgob3B0aW9ucy53aGl0ZWxpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy53aGl0ZWxpc3QuaW5kZXhPZihrZXkpICE9PSAtMSkgJiYgKChvcHRpb25zLmJsYWNrbGlzdCA9PSBudWxsKSB8fCBvcHRpb25zLmJsYWNrbGlzdC5pbmRleE9mKGtleSkgPT09IC0xKSkge1xuICAgICAgICBjb25zdCBwcm9wID0gdGhpcy5nZXRQcm9wZXJ0eShrZXkpXG4gICAgICAgIGlmIChwcm9wKSB7XG4gICAgICAgICAgcHJvcC5zZXQoZGF0YVtrZXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0TWFudWFsRGF0YVByb3BlcnRpZXMgKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXMucmVkdWNlKChyZXMsIHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wLmdldHRlci5jYWxjdWxhdGVkICYmIHByb3AubWFudWFsKSB7XG4gICAgICAgIHJlc1twcm9wLm9wdGlvbnMubmFtZV0gPSBwcm9wLmdldCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfSwge30pXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLnByb3BlcnRpZXMuZm9yRWFjaCgocHJvcCkgPT4gcHJvcC5kZXN0cm95KCkpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0aWVzTWFuYWdlclxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG5cbmNvbnN0IFNpbXBsZUdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9TaW1wbGVHZXR0ZXInKVxuY29uc3QgQ2FsY3VsYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9DYWxjdWxhdGVkR2V0dGVyJylcbmNvbnN0IEludmFsaWRhdGVkR2V0dGVyID0gcmVxdWlyZSgnLi9nZXR0ZXJzL0ludmFsaWRhdGVkR2V0dGVyJylcbmNvbnN0IE1hbnVhbEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9NYW51YWxHZXR0ZXInKVxuY29uc3QgQ29tcG9zaXRlR2V0dGVyID0gcmVxdWlyZSgnLi9nZXR0ZXJzL0NvbXBvc2l0ZUdldHRlcicpXG5cbmNvbnN0IE1hbnVhbFNldHRlciA9IHJlcXVpcmUoJy4vc2V0dGVycy9NYW51YWxTZXR0ZXInKVxuY29uc3QgU2ltcGxlU2V0dGVyID0gcmVxdWlyZSgnLi9zZXR0ZXJzL1NpbXBsZVNldHRlcicpXG5jb25zdCBCYXNlVmFsdWVTZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvQmFzZVZhbHVlU2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb25TZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvQ29sbGVjdGlvblNldHRlcicpXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuY2xhc3MgUHJvcGVydHkge1xuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gUHJvcGVydHlPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7VH0gW2RlZmF1bHRdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oaW1wb3J0KFwiLi9JbnZhbGlkYXRvclwiKSk6IFR9IFtjYWxjdWxdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oKTogVH0gW2dldF1cbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihUKX0gW3NldF1cbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihULFQpfGltcG9ydChcIi4vUHJvcGVydHlXYXRjaGVyXCIpPFQ+fSBbY2hhbmdlXVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW58c3RyaW5nfGZ1bmN0aW9uKFQsVCk6VH0gW2NvbXBvc2VkXVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW58T2JqZWN0fSBbY29sbGVjdGlvbl1cbiAgICogQHByb3BlcnR5IHsqfSBbc2NvcGVdXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlPcHRpb25zfSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgUHJvcGVydHkuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtFdmVudEVtaXR0ZXJ9XG4gICAgICovXG4gICAgdGhpcy5ldmVudHMgPSBuZXcgdGhpcy5vcHRpb25zLkV2ZW50RW1pdHRlckNsYXNzKClcbiAgICB0aGlzLm1ha2VTZXR0ZXIoKVxuICAgIHRoaXMubWFrZUdldHRlcigpXG4gICAgdGhpcy5zZXR0ZXIuaW5pdCgpXG4gICAgdGhpcy5nZXR0ZXIuaW5pdCgpXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pbml0V2F0Y2hlcnMpIHtcbiAgICAgIHRoaXMuaW5pdFdhdGNoZXJzKClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldFF1YWxpZmllZE5hbWUgKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMubmFtZSkge1xuICAgICAgbGV0IG5hbWUgPSB0aGlzLm9wdGlvbnMubmFtZVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zY29wZSAmJiB0aGlzLm9wdGlvbnMuc2NvcGUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgbmFtZSA9IHRoaXMub3B0aW9ucy5zY29wZS5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsgbmFtZVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5hbWVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvU3RyaW5nICgpIHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5nZXRRdWFsaWZpZWROYW1lKClcbiAgICBpZiAobmFtZSkge1xuICAgICAgcmV0dXJuIGBbUHJvcGVydHkgJHtuYW1lfV1gXG4gICAgfVxuICAgIHJldHVybiAnW1Byb3BlcnR5XSdcbiAgfVxuXG4gIGluaXRXYXRjaGVycyAoKSB7XG4gICAgdGhpcy5zZXR0ZXIubG9hZEludGVybmFsV2F0Y2hlcigpXG4gIH1cblxuICBtYWtlR2V0dGVyICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuZ2V0dGVyID0gbmV3IE1hbnVhbEdldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvbXBvc2VkICE9IG51bGwgJiYgdGhpcy5vcHRpb25zLmNvbXBvc2VkICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5nZXR0ZXIgPSBuZXcgQ29tcG9zaXRlR2V0dGVyKHRoaXMpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKCh0aGlzLm9wdGlvbnMuY2FsY3VsLm5iUGFyYW1zIHx8IHRoaXMub3B0aW9ucy5jYWxjdWwubGVuZ3RoKSA9PT0gMCkge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBDYWxjdWxhdGVkR2V0dGVyKHRoaXMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBJbnZhbGlkYXRlZEdldHRlcih0aGlzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldHRlciA9IG5ldyBTaW1wbGVHZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICBtYWtlU2V0dGVyICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IE1hbnVhbFNldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvbGxlY3Rpb24gIT0gbnVsbCAmJiB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbiAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IENvbGxlY3Rpb25TZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsICYmIHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IEJhc2VWYWx1ZVNldHRlcih0aGlzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldHRlciA9IG5ldyBTaW1wbGVTZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eTxUPn1cbiAgICovXG4gIGNvcHlXaXRoIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1R9XG4gICAqL1xuICBnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLmdldHRlci5nZXQoKVxuICB9XG5cbiAgaW52YWxpZGF0ZSAoY29udGV4dCkge1xuICAgIHRoaXMuZ2V0dGVyLmludmFsaWRhdGUoY29udGV4dClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdW5rbm93biAoY29udGV4dCkge1xuICAgIHRoaXMuZ2V0dGVyLnVua25vd24oY29udGV4dClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0ICh2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5zZXR0ZXIuc2V0KHZhbClcbiAgfVxuXG4gIGNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycyAoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zY29wZSkge1xuICAgICAgY29uc3QgcHJvcCA9IHRoaXNcbiAgICAgIGxldCBvcHQgPSB7fVxuICAgICAgb3B0W3RoaXMub3B0aW9ucy5uYW1lICsgJ1Byb3BlcnR5J10gPSB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9wdCA9IHRoaXMuZ2V0dGVyLmdldFNjb3BlR2V0dGVyU2V0dGVycyhvcHQpXG4gICAgICBvcHQgPSB0aGlzLnNldHRlci5nZXRTY29wZUdldHRlclNldHRlcnMob3B0KVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcy5vcHRpb25zLnNjb3BlLCBvcHQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlc3Ryb3kgPT09IHRydWUgJiYgdGhpcy52YWx1ZSAhPSBudWxsICYmIHRoaXMudmFsdWUuZGVzdHJveSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnZhbHVlLmRlc3Ryb3koKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxPcHRpb25GdW5jdCgnZGVzdHJveScsIHRoaXMudmFsdWUpXG4gICAgfVxuICAgIHRoaXMuZ2V0dGVyLmRlc3Ryb3koKVxuICAgIHRoaXMudmFsdWUgPSBudWxsXG4gIH1cblxuICBjYWxsT3B0aW9uRnVuY3QgKGZ1bmN0LCAuLi5hcmdzKSB7XG4gICAgaWYgKHR5cGVvZiBmdW5jdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGZ1bmN0ID0gdGhpcy5vcHRpb25zW2Z1bmN0XVxuICAgIH1cbiAgICByZXR1cm4gZnVuY3QuYXBwbHkodGhpcy5vcHRpb25zLnNjb3BlIHx8IHRoaXMsIGFyZ3MpXG4gIH1cbn1cblxuUHJvcGVydHkuZGVmYXVsdE9wdGlvbnMgPSB7XG4gIEV2ZW50RW1pdHRlckNsYXNzOiBFdmVudEVtaXR0ZXIsXG4gIGluaXRXYXRjaGVyczogdHJ1ZVxufVxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0eVxuIiwiXG5jbGFzcyBCYXNlR2V0dGVyIHtcbiAgY29uc3RydWN0b3IgKHByb3ApIHtcbiAgICB0aGlzLnByb3AgPSBwcm9wXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICAgIHRoaXMuaW5pdGlhdGVkID0gZmFsc2VcbiAgICB0aGlzLmludmFsaWRhdGVkID0gZmFsc2VcbiAgfVxuXG4gIGdldCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKVxuICB9XG5cbiAgb3V0cHV0ICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLm91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ291dHB1dCcsIHRoaXMucHJvcC52YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICAgIH1cbiAgfVxuXG4gIHJldmFsaWRhdGVkICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgdGhpcy5pbml0aWF0ZWQgPSB0cnVlXG4gICAgdGhpcy5pbnZhbGlkYXRlZCA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuaW52YWxpZGF0ZWQpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQgPSB0cnVlXG4gICAgICB0aGlzLmludmFsaWRhdGVOb3RpY2UoY29udGV4dClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGludmFsaWRhdGUgKGNvbnRleHQpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICAgIGlmICghdGhpcy5pbnZhbGlkYXRlZCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IHRydWVcbiAgICAgIHRoaXMuaW52YWxpZGF0ZU5vdGljZShjb250ZXh0KVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaW52YWxpZGF0ZU5vdGljZSAoY29udGV4dCkge1xuICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IHsgb3JpZ2luOiB0aGlzLnByb3AgfVxuICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgnaW52YWxpZGF0ZWQnLCBjb250ZXh0KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfSBvcHRcbiAgICogQHJldHVybiB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfVxuICAgKi9cbiAgZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzIChvcHQpIHtcbiAgICBjb25zdCBwcm9wID0gdGhpcy5wcm9wXG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdID0gb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdIHx8IHt9XG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBwcm9wLmdldCgpXG4gICAgfVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5lbnVtZXJhYmxlID0gdHJ1ZVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5jb25maWd1cmFibGUgPSB0cnVlXG4gICAgcmV0dXJuIG9wdFxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlR2V0dGVyXG4iLCJcbmNvbnN0IEJhc2VHZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VHZXR0ZXInKVxuXG5jbGFzcyBDYWxjdWxhdGVkR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIGNvbnN0IG9sZCA9IHRoaXMucHJvcC52YWx1ZVxuICAgICAgY29uc3QgaW5pdGlhdGVkID0gdGhpcy5pbml0aWF0ZWRcbiAgICAgIHRoaXMuY2FsY3VsKClcbiAgICAgIGlmICghaW5pdGlhdGVkKSB7XG4gICAgICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgndXBkYXRlZCcsIG9sZClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wLnNldHRlci5jaGVja0NoYW5nZXModGhpcy5wcm9wLnZhbHVlLCBvbGQpKSB7XG4gICAgICAgIHRoaXMucHJvcC5zZXR0ZXIuY2hhbmdlZChvbGQpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzLm91dHB1dCgpXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHRoaXMucHJvcC5zZXR0ZXIuc2V0UmF3VmFsdWUodGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnY2FsY3VsJykpXG4gICAgdGhpcy5wcm9wLm1hbnVhbCA9IGZhbHNlXG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsY3VsYXRlZEdldHRlclxuIiwiY29uc3QgSW52YWxpZGF0ZWRHZXR0ZXIgPSByZXF1aXJlKCcuL0ludmFsaWRhdGVkR2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb24gPSByZXF1aXJlKCdzcGFyay1jb2xsZWN0aW9uJylcbmNvbnN0IEludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKVxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLlJlZmVyZW5jZVxuXG5jbGFzcyBDb21wb3NpdGVHZXR0ZXIgZXh0ZW5kcyBJbnZhbGlkYXRlZEdldHRlciB7XG4gIGluaXQgKCkge1xuICAgIHN1cGVyLmluaXQoKVxuICAgIGlmICh0aGlzLnByb3Aub3B0aW9ucy5kZWZhdWx0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZVZhbHVlID0gdGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKG51bGwpXG4gICAgICB0aGlzLmJhc2VWYWx1ZSA9IG51bGxcbiAgICB9XG4gICAgdGhpcy5tZW1iZXJzID0gbmV3IENvbXBvc2l0ZUdldHRlci5NZW1iZXJzKHRoaXMucHJvcC5vcHRpb25zLm1lbWJlcnMpXG4gICAgaWYgKHRoaXMucHJvcC5vcHRpb25zLmNhbGN1bCAhPSBudWxsKSB7XG4gICAgICB0aGlzLm1lbWJlcnMudW5zaGlmdCgocHJldiwgaW52YWxpZGF0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcC5vcHRpb25zLmNhbGN1bC5iaW5kKHRoaXMucHJvcC5vcHRpb25zLnNjb3BlKShpbnZhbGlkYXRvcilcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMubWVtYmVycy5jaGFuZ2VkID0gKG9sZCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHRoaXMucHJvcC5tZW1iZXJzID0gdGhpcy5tZW1iZXJzXG4gICAgdGhpcy5qb2luID0gdGhpcy5ndWVzc0pvaW5GdW5jdGlvbigpXG4gIH1cblxuICBndWVzc0pvaW5GdW5jdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5jb21wb3NlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWQgPT09ICdzdHJpbmcnICYmIENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zW3RoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkXSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnNbdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWRdXG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3Aub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwgJiYgdGhpcy5wcm9wLm9wdGlvbnMuY29sbGVjdGlvbiAhPT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9ucy5jb25jYXRcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMub3JcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9ucy5hbmRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zLmxhc3RcbiAgICB9XG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIGlmICh0aGlzLm1lbWJlcnMubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLnByb3AsIHRoaXMucHJvcC5vcHRpb25zLnNjb3BlKVxuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMubWVtYmVycy5yZWR1Y2UoKHByZXYsIG1lbWJlcikgPT4ge1xuICAgICAgICAgIHZhciB2YWxcbiAgICAgICAgICB2YWwgPSB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nID8gbWVtYmVyKHByZXYsIHRoaXMuaW52YWxpZGF0b3IpIDogbWVtYmVyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuam9pbihwcmV2LCB2YWwpXG4gICAgICAgIH0sIHRoaXMuYmFzZVZhbHVlKSlcbiAgICAgICAgZG9uZSgpXG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbnVsbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludmFsaWRhdG9yLmJpbmQoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMuYmFzZVZhbHVlKVxuICAgIH1cbiAgICB0aGlzLnJldmFsaWRhdGVkKClcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9IG9wdFxuICAgKiBAcmV0dXJuIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9XG4gICAqL1xuICBnZXRTY29wZUdldHRlclNldHRlcnMgKG9wdCkge1xuICAgIG9wdCA9IHN1cGVyLmdldFNjb3BlR2V0dGVyU2V0dGVycyhvcHQpXG4gICAgY29uc3QgbWVtYmVycyA9IHRoaXMubWVtYmVyc1xuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lICsgJ01lbWJlcnMnXSA9IHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbWVtYmVyc1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0XG4gIH1cbn1cblxuQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMgPSB7XG4gIGFuZDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiXG4gIH0sXG4gIG9yOiBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhIHx8IGJcbiAgfSxcbiAgbGFzdDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYlxuICB9LFxuICBzdW06IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEgKyBiXG4gIH0sXG4gIGNvbmNhdDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYS50b0FycmF5ICE9IG51bGwpIHtcbiAgICAgIGEgPSBhLnRvQXJyYXkoKVxuICAgIH1cbiAgICBpZiAoYS5jb25jYXQgPT0gbnVsbCkge1xuICAgICAgYSA9IFthXVxuICAgIH1cbiAgICBpZiAoYi50b0FycmF5ICE9IG51bGwpIHtcbiAgICAgIGIgPSBiLnRvQXJyYXkoKVxuICAgIH1cbiAgICBpZiAoYi5jb25jYXQgPT0gbnVsbCkge1xuICAgICAgYiA9IFtiXVxuICAgIH1cbiAgICByZXR1cm4gYS5jb25jYXQoYilcbiAgfVxufVxuXG5Db21wb3NpdGVHZXR0ZXIuTWVtYmVycyA9IGNsYXNzIE1lbWJlcnMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgYWRkUHJvcGVydHkgKHByb3ApIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobnVsbCwgcHJvcCkgPT09IC0xKSB7XG4gICAgICB0aGlzLnB1c2goUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmdW5jdGlvbiAocHJldiwgaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AocHJvcClcbiAgICAgIH0sIHtcbiAgICAgICAgcHJvcDogcHJvcFxuICAgICAgfSkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZGRQcm9wZXJ0eVBhdGggKG5hbWUsIG9iaikge1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopID09PSAtMSkge1xuICAgICAgdGhpcy5wdXNoKFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wUGF0aChuYW1lLCBvYmopXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9KSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJlbW92ZVByb3BlcnR5IChwcm9wKSB7XG4gICAgdGhpcy5yZW1vdmVSZWYoeyBwcm9wOiBwcm9wIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZFZhbHVlUmVmICh2YWwsIGRhdGEpIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgoZGF0YSkgPT09IC0xKSB7XG4gICAgICBjb25zdCBmbiA9IFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0sIGRhdGEpXG4gICAgICBmbi52YWwgPSB2YWxcbiAgICAgIHRoaXMucHVzaChmbilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFZhbHVlUmVmICh2YWwsIGRhdGEpIHtcbiAgICBjb25zdCBpID0gdGhpcy5maW5kUmVmSW5kZXgoZGF0YSlcbiAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuYWRkVmFsdWVSZWYodmFsLCBkYXRhKVxuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkudmFsICE9PSB2YWwpIHtcbiAgICAgIGNvbnN0IGZuID0gUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmdW5jdGlvbiAocHJldiwgaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgfSwgZGF0YSlcbiAgICAgIGZuLnZhbCA9IHZhbFxuICAgICAgdGhpcy5zZXQoaSwgZm4pXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBnZXRWYWx1ZVJlZiAoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihkYXRhKS52YWxcbiAgfVxuXG4gIGFkZEZ1bmN0aW9uUmVmIChmbiwgZGF0YSkge1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChkYXRhKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmbiwgZGF0YSlcbiAgICAgIHRoaXMucHVzaChmbilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZpbmRCeVJlZiAoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLmZpbmRSZWZJbmRleChkYXRhKV1cbiAgfVxuXG4gIGZpbmRSZWZJbmRleCAoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maW5kSW5kZXgoZnVuY3Rpb24gKG1lbWJlcikge1xuICAgICAgcmV0dXJuIChtZW1iZXIucmVmICE9IG51bGwpICYmIG1lbWJlci5yZWYuY29tcGFyZURhdGEoZGF0YSlcbiAgICB9KVxuICB9XG5cbiAgcmVtb3ZlUmVmIChkYXRhKSB7XG4gICAgdmFyIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuZmluZFJlZkluZGV4KGRhdGEpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb3NpdGVHZXR0ZXJcbiIsImNvbnN0IEludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKVxuY29uc3QgQ2FsY3VsYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZEdldHRlcicpXG5cbmNsYXNzIEludmFsaWRhdGVkR2V0dGVyIGV4dGVuZHMgQ2FsY3VsYXRlZEdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpXG4gICAgfVxuICAgIHJldHVybiBzdXBlci5nZXQoKVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcy5wcm9wLCB0aGlzLnByb3Aub3B0aW9ucy5zY29wZSlcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdjYWxjdWwnLCBpbnZhbGlkYXRvcikpXG4gICAgICB0aGlzLnByb3AubWFudWFsID0gZmFsc2VcbiAgICAgIGRvbmUoKVxuICAgICAgaWYgKGludmFsaWRhdG9yLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbnVsbFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW52YWxpZGF0b3IuYmluZCgpXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLnJldmFsaWRhdGVkKClcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQoKVxuICB9XG5cbiAgaW52YWxpZGF0ZSAoY29udGV4dCkge1xuICAgIHN1cGVyLmludmFsaWRhdGUoY29udGV4dClcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCAmJiB0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWRHZXR0ZXJcbiIsImNvbnN0IEJhc2VHZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VHZXR0ZXInKVxuXG5jbGFzcyBNYW51YWxHZXR0ZXIgZXh0ZW5kcyBCYXNlR2V0dGVyIHtcbiAgZ2V0ICgpIHtcbiAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ2dldCcpKVxuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWVcbiAgICB0aGlzLmluaXRpYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFudWFsR2V0dGVyXG4iLCJjb25zdCBCYXNlR2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlR2V0dGVyJylcblxuY2xhc3MgU2ltcGxlR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZVxuICAgIGlmICghdGhpcy5pbml0aWF0ZWQpIHtcbiAgICAgIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZVxuICAgICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCd1cGRhdGVkJylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZUdldHRlclxuIiwiXG5jb25zdCBQcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXInKVxuXG5jbGFzcyBCYXNlU2V0dGVyIHtcbiAgY29uc3RydWN0b3IgKHByb3ApIHtcbiAgICB0aGlzLnByb3AgPSBwcm9wXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB0aGlzLnNldERlZmF1bHRWYWx1ZSgpXG4gIH1cblxuICBzZXREZWZhdWx0VmFsdWUgKCkge1xuICAgIHRoaXMuc2V0UmF3VmFsdWUodGhpcy5pbmdlc3QodGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdCkpXG4gIH1cblxuICBsb2FkSW50ZXJuYWxXYXRjaGVyICgpIHtcbiAgICBjb25zdCBjaGFuZ2VPcHQgPSB0aGlzLnByb3Aub3B0aW9ucy5jaGFuZ2VcbiAgICBpZiAodHlwZW9mIGNoYW5nZU9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy53YXRjaGVyID0gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3AsXG4gICAgICAgIGNhbGxiYWNrOiBjaGFuZ2VPcHQsXG4gICAgICAgIHNjb3BlOiB0aGlzLnByb3Aub3B0aW9ucy5zY29wZSxcbiAgICAgICAgYXV0b0JpbmQ6IHRydWVcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChjaGFuZ2VPcHQgIT0gbnVsbCAmJiB0eXBlb2YgY2hhbmdlT3B0LmNvcHlXaXRoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLndhdGNoZXIgPSBjaGFuZ2VPcHQuY29weVdpdGgoe1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wLFxuICAgICAgICBzY29wZTogdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUsXG4gICAgICAgIGF1dG9CaW5kOiB0cnVlXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy53YXRjaGVyXG4gIH1cblxuICBzZXQgKHZhbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIHNldFJhd1ZhbHVlICh2YWwpIHtcbiAgICB0aGlzLnByb3AudmFsdWUgPSB2YWxcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cblxuICBpbmdlc3QgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuaW5nZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YWwgPSB0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdpbmdlc3QnLCB2YWwpXG4gICAgfVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIGNoZWNrQ2hhbmdlcyAodmFsLCBvbGQpIHtcbiAgICByZXR1cm4gdmFsICE9PSBvbGRcbiAgfVxuXG4gIGNoYW5nZWQgKG9sZCkge1xuICAgIGNvbnN0IGNvbnRleHQgPSB7IG9yaWdpbjogdGhpcy5wcm9wIH1cbiAgICB0aGlzLnByb3AuZXZlbnRzLmVtaXQoJ3VwZGF0ZWQnLCBvbGQsIGNvbnRleHQpXG4gICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCdjaGFuZ2VkJywgb2xkLCBjb250ZXh0KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9IG9wdFxuICAgKiBAcmV0dXJuIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9XG4gICAqL1xuICBnZXRTY29wZUdldHRlclNldHRlcnMgKG9wdCkge1xuICAgIGNvbnN0IHByb3AgPSB0aGlzLnByb3BcbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0gPSBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0gfHwge31cbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0uc2V0ID0gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIHByb3Auc2V0KHZhbClcbiAgICB9XG4gICAgcmV0dXJuIG9wdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVNldHRlclxuIiwiY29uc3QgQmFzZVNldHRlciA9IHJlcXVpcmUoJy4vQmFzZVNldHRlcicpXG5cbmNsYXNzIEJhc2VWYWx1ZVNldHRlciBleHRlbmRzIEJhc2VTZXR0ZXIge1xuICBzZXQgKHZhbCkge1xuICAgIHZhbCA9IHRoaXMuaW5nZXN0KHZhbClcbiAgICBpZiAodGhpcy5wcm9wLmdldHRlci5iYXNlVmFsdWUgIT09IHZhbCkge1xuICAgICAgdGhpcy5wcm9wLmdldHRlci5iYXNlVmFsdWUgPSB2YWxcbiAgICAgIHRoaXMucHJvcC5pbnZhbGlkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VWYWx1ZVNldHRlclxuIiwiY29uc3QgU2ltcGxlU2V0dGVyID0gcmVxdWlyZSgnLi9TaW1wbGVTZXR0ZXInKVxuY29uc3QgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ3NwYXJrLWNvbGxlY3Rpb24nKVxuY29uc3QgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4uL3dhdGNoZXJzL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXInKVxuXG5jbGFzcyBDb2xsZWN0aW9uU2V0dGVyIGV4dGVuZHMgU2ltcGxlU2V0dGVyIHtcbiAgaW5pdCAoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAgQ29sbGVjdGlvblNldHRlci5kZWZhdWx0T3B0aW9ucyxcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5jb2xsZWN0aW9uID09PSAnb2JqZWN0JyA/IHRoaXMucHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gOiB7fVxuICAgIClcbiAgICBzdXBlci5pbml0KClcbiAgfVxuXG4gIGxvYWRJbnRlcm5hbFdhdGNoZXIgKCkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5pdGVtQWRkZWQgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgcmV0dXJuIG5ldyBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgcHJvcGVydHk6IHRoaXMucHJvcCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMucHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgb25BZGRlZDogdGhpcy5wcm9wLm9wdGlvbnMuaXRlbUFkZGVkLFxuICAgICAgICBvblJlbW92ZWQ6IHRoaXMucHJvcC5vcHRpb25zLml0ZW1SZW1vdmVkLFxuICAgICAgICBzY29wZTogdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUsXG4gICAgICAgIGF1dG9CaW5kOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5sb2FkSW50ZXJuYWxXYXRjaGVyKClcbiAgICB9XG4gIH1cblxuICBzZXRSYXdWYWx1ZSAodmFsKSB7XG4gICAgdGhpcy5wcm9wLnZhbHVlID0gdGhpcy5tYWtlQ29sbGVjdGlvbih2YWwpXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG5cbiAgbWFrZUNvbGxlY3Rpb24gKHZhbCkge1xuICAgIHZhbCA9IHRoaXMudmFsVG9BcnJheSh2YWwpXG4gICAgY29uc3QgcHJvcCA9IHRoaXMucHJvcFxuICAgIGNvbnN0IGNvbCA9IENvbGxlY3Rpb24ubmV3U3ViQ2xhc3ModGhpcy5vcHRpb25zLCB2YWwpXG4gICAgY29sLmNoYW5nZWQgPSBmdW5jdGlvbiAob2xkKSB7XG4gICAgICBwcm9wLnNldHRlci5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIGNvbFxuICB9XG5cbiAgdmFsVG9BcnJheSAodmFsKSB7XG4gICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbC50b0FycmF5KClcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5zbGljZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbdmFsXVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrQ2hhbmdlcyAodmFsLCBvbGQpIHtcbiAgICB2YXIgY29tcGFyZUZ1bmN0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY29tcGFyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcGFyZUZ1bmN0aW9uID0gdGhpcy5vcHRpb25zLmNvbXBhcmVcbiAgICB9XG4gICAgcmV0dXJuIChuZXcgQ29sbGVjdGlvbih2YWwpKS5jaGVja0NoYW5nZXMob2xkLCB0aGlzLm9wdGlvbnMub3JkZXJlZCwgY29tcGFyZUZ1bmN0aW9uKVxuICB9XG59XG5cbkNvbGxlY3Rpb25TZXR0ZXIuZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGNvbXBhcmU6IGZhbHNlLFxuICBvcmRlcmVkOiB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblNldHRlclxuIiwiY29uc3QgQmFzZVNldHRlciA9IHJlcXVpcmUoJy4vQmFzZVNldHRlcicpXG5cbmNsYXNzIE1hbnVhbFNldHRlciBleHRlbmRzIEJhc2VTZXR0ZXIge1xuICBzZXQgKHZhbCkge1xuICAgIHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ3NldCcsIHZhbClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnVhbFNldHRlclxuIiwiY29uc3QgQmFzZVNldHRlciA9IHJlcXVpcmUoJy4vQmFzZVNldHRlcicpXG5cbmNsYXNzIFNpbXBsZVNldHRlciBleHRlbmRzIEJhc2VTZXR0ZXIge1xuICBzZXQgKHZhbCkge1xuICAgIHZhciBvbGRcbiAgICB2YWwgPSB0aGlzLmluZ2VzdCh2YWwpXG4gICAgdGhpcy5wcm9wLmdldHRlci5yZXZhbGlkYXRlZCgpXG4gICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHZhbCwgdGhpcy5wcm9wLnZhbHVlKSkge1xuICAgICAgb2xkID0gdGhpcy5wcm9wLnZhbHVlXG4gICAgICB0aGlzLnNldFJhd1ZhbHVlKHZhbClcbiAgICAgIHRoaXMucHJvcC5tYW51YWwgPSB0cnVlXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlU2V0dGVyXG4iLCJcbmNvbnN0IFByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4vUHJvcGVydHlXYXRjaGVyJylcblxuY2xhc3MgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciBleHRlbmRzIFByb3BlcnR5V2F0Y2hlciB7XG4gIGxvYWRPcHRpb25zIChvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucylcbiAgICB0aGlzLm9uQWRkZWQgPSBvcHRpb25zLm9uQWRkZWRcbiAgICB0aGlzLm9uUmVtb3ZlZCA9IG9wdGlvbnMub25SZW1vdmVkXG4gIH1cblxuICBoYW5kbGVDaGFuZ2UgKHZhbHVlLCBvbGQpIHtcbiAgICBvbGQgPSB2YWx1ZS5jb3B5KG9sZCB8fCBbXSlcbiAgICBpZiAodHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCB2YWx1ZSwgb2xkKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25BZGRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFsdWUuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICBpZiAoIW9sZC5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uQWRkZWQuY2FsbCh0aGlzLnNjb3BlLCBpdGVtKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb2xkLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZC5jYWxsKHRoaXMuc2NvcGUsIGl0ZW0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlclxuIiwiXG5jb25zdCBCaW5kZXIgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuQmluZGVyXG5jb25zdCBSZWZlcmVuY2UgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuUmVmZXJlbmNlXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuY2xhc3MgUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgQmluZGVyIHtcbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFByb3BlcnR5V2F0Y2hlck9wdGlvbnNcbiAgICogQHByb3BlcnR5IHtpbXBvcnQoXCIuL1Byb3BlcnR5XCIpPFQ+fHN0cmluZ30gcHJvcGVydHlcbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihULFQpfSBjYWxsYmFja1xuICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IFthdXRvQmluZF1cbiAgICogQHByb3BlcnR5IHsqfSBbc2NvcGVdXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlXYXRjaGVyT3B0aW9uc30gb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKGNvbnRleHQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZhbGlkQ29udGV4dChjb250ZXh0KSkge1xuICAgICAgICB0aGlzLmludmFsaWRhdGUoKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrID0gKG9sZCwgY29udGV4dCkgPT4ge1xuICAgICAgaWYgKHRoaXMudmFsaWRDb250ZXh0KGNvbnRleHQpKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKG9sZClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKHRoaXMub3B0aW9ucylcbiAgICB9XG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGxvYWRPcHRpb25zIChvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGVcbiAgICB0aGlzLnByb3BlcnR5ID0gb3B0aW9ucy5wcm9wZXJ0eVxuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrXG4gICAgdGhpcy5hdXRvQmluZCA9IG9wdGlvbnMuYXV0b0JpbmRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgY29weVdpdGggKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKSlcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIGlmICh0aGlzLmF1dG9CaW5kKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0JpbmQoKVxuICAgIH1cbiAgfVxuXG4gIGdldFByb3BlcnR5ICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQcm9wQnlOYW1lKHRoaXMucHJvcGVydHkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb3BlcnR5XG4gIH1cblxuICBnZXRQcm9wQnlOYW1lIChwcm9wLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KHByb3ApXG4gICAgfSBlbHNlIGlmICh0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgdGhlIHByb3BlcnR5ICR7cHJvcH1gKVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrQmluZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlQmluZCh0aGlzLnNob3VsZEJpbmQoKSlcbiAgfVxuXG4gIHNob3VsZEJpbmQgKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpICE9IG51bGxcbiAgfVxuXG4gIGRvQmluZCAoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMub24oJ2ludmFsaWRhdGVkJywgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMub24oJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKVxuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMub2ZmKCdpbnZhbGlkYXRlZCcsIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9mZigndXBkYXRlZCcsIHRoaXMudXBkYXRlQ2FsbGJhY2spXG4gIH1cblxuICBlcXVhbHMgKHdhdGNoZXIpIHtcbiAgICByZXR1cm4gd2F0Y2hlci5jb25zdHJ1Y3RvciA9PT0gdGhpcy5jb25zdHJ1Y3RvciAmJlxuICAgICAgd2F0Y2hlciAhPSBudWxsICYmXG4gICAgICB3YXRjaGVyLmV2ZW50ID09PSB0aGlzLmV2ZW50ICYmXG4gICAgICB3YXRjaGVyLmdldFByb3BlcnR5KCkgPT09IHRoaXMuZ2V0UHJvcGVydHkoKSAmJlxuICAgICAgUmVmZXJlbmNlLmNvbXBhcmVWYWwod2F0Y2hlci5jYWxsYmFjaywgdGhpcy5jYWxsYmFjaylcbiAgfVxuXG4gIHZhbGlkQ29udGV4dCAoY29udGV4dCkge1xuICAgIHJldHVybiBjb250ZXh0ID09IG51bGwgfHwgIWNvbnRleHQucHJldmVudEltbWVkaWF0ZVxuICB9XG5cbiAgaW52YWxpZGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5nZXQoKVxuICB9XG5cbiAgdXBkYXRlIChvbGQpIHtcbiAgICB2YXIgdmFsdWVcbiAgICB2YWx1ZSA9IHRoaXMuZ2V0UHJvcGVydHkoKS5nZXQoKVxuICAgIHJldHVybiB0aGlzLmhhbmRsZUNoYW5nZSh2YWx1ZSwgb2xkKVxuICB9XG5cbiAgaGFuZGxlQ2hhbmdlICh2YWx1ZSwgb2xkKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCB2YWx1ZSwgb2xkKVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5V2F0Y2hlclxuIiwidmFyIEVsZW1lbnQsIE1peGFibGUsIFByb3BlcnRpZXNNYW5hZ2VyO1xuXG5Qcm9wZXJ0aWVzTWFuYWdlciA9IHJlcXVpcmUoJ3NwYXJrLXByb3BlcnRpZXMnKS5Qcm9wZXJ0aWVzTWFuYWdlcjtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEVsZW1lbnQgZXh0ZW5kcyBNaXhhYmxlIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbml0UHJvcGVydGllc01hbmFnZXIoZGF0YSk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuaW5pdFdhdGNoZXJzKCk7XG4gICAgfVxuXG4gICAgaW5pdFByb3BlcnRpZXNNYW5hZ2VyKGRhdGEpIHtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLnVzZVNjb3BlKHRoaXMpO1xuICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5pbml0UHJvcGVydGllcygpO1xuICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5jcmVhdGVTY29wZUdldHRlclNldHRlcnMoKTtcbiAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLnNldFByb3BlcnRpZXNEYXRhKGRhdGEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRhcChuYW1lKSB7XG4gICAgICB2YXIgYXJncztcbiAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG5hbWUuYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2FsbGJhY2sobmFtZSkge1xuICAgICAgaWYgKHRoaXMuX2NhbGxiYWNrcyA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdLm93bmVyID0gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9jYWxsYmFja3NbbmFtZV07XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICByZXR1cm4gWydwcm9wZXJ0aWVzTWFuYWdlciddO1xuICAgIH1cblxuICAgIGV4dGVuZGVkKHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlcikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyID0gdGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyLmNvcHlXaXRoKHRoaXMucHJvcGVydGllc01hbmFnZXIucHJvcGVydGllc09wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciA9IHRoaXMucHJvcGVydGllc01hbmFnZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnR5KHByb3AsIGRlc2MpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3RvdHlwZS5wcm9wZXJ0aWVzTWFuYWdlciA9IHRoaXMucHJvdG90eXBlLnByb3BlcnRpZXNNYW5hZ2VyLndpdGhQcm9wZXJ0eShwcm9wLCBkZXNjKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3RvdHlwZS5wcm9wZXJ0aWVzTWFuYWdlci5jb3B5V2l0aChwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgfTtcblxuICBFbGVtZW50LnByb3RvdHlwZS5wcm9wZXJ0aWVzTWFuYWdlciA9IG5ldyBQcm9wZXJ0aWVzTWFuYWdlcigpO1xuXG4gIHJldHVybiBFbGVtZW50O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0VsZW1lbnQuanMubWFwXG4iLCJ2YXIgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLCBJbnZhbGlkYXRvciwgUHJvcGVydHlXYXRjaGVyO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJykud2F0Y2hlcnMuUHJvcGVydHlXYXRjaGVyO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJ3NwYXJrLXByb3BlcnRpZXMnKS5JbnZhbGlkYXRvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIgPSBjbGFzcyBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlID0gb3B0aW9ucy5hY3RpdmU7XG4gIH1cblxuICBzaG91bGRCaW5kKCkge1xuICAgIHZhciBhY3RpdmU7XG4gICAgaWYgKHRoaXMuYWN0aXZlICE9IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLnNjb3BlKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvci5jYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0JpbmQoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgpO1xuICAgICAgYWN0aXZlID0gdGhpcy5hY3RpdmUodGhpcy5pbnZhbGlkYXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IuYmluZCgpO1xuICAgICAgcmV0dXJuIGFjdGl2ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIEludmFsaWRhdGVkLCBJbnZhbGlkYXRvcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJykuSW52YWxpZGF0b3I7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWQgPSBjbGFzcyBJbnZhbGlkYXRlZCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAoISgob3B0aW9ucyAhPSBudWxsID8gb3B0aW9ucy5pbml0QnlMb2FkZXIgOiB2b2lkIDApICYmIChvcHRpb25zLmxvYWRlciAhPSBudWxsKSkpIHtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cbiAgfVxuXG4gIGxvYWRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLnNjb3BlID0gb3B0aW9ucy5zY29wZTtcbiAgICBpZiAob3B0aW9ucy5sb2FkZXJBc1Njb3BlICYmIChvcHRpb25zLmxvYWRlciAhPSBudWxsKSkge1xuICAgICAgdGhpcy5zY29wZSA9IG9wdGlvbnMubG9hZGVyO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdW5rbm93bigpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci52YWxpZGF0ZVVua25vd25zKCk7XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yID09IG51bGwpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgpO1xuICAgIHRoaXMuaGFuZGxlVXBkYXRlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgIHRoaXMuaW52YWxpZGF0b3IuZW5kUmVjeWNsZSgpO1xuICAgIHRoaXMuaW52YWxpZGF0b3IuYmluZCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaGFuZGxlVXBkYXRlKGludmFsaWRhdG9yKSB7XG4gICAgaWYgKHRoaXMuc2NvcGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCBpbnZhbGlkYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGludmFsaWRhdG9yKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZC5qcy5tYXBcbiIsInZhciBMb2FkZXIsIE92ZXJyaWRlcjtcblxuT3ZlcnJpZGVyID0gcmVxdWlyZSgnLi9PdmVycmlkZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIExvYWRlciBleHRlbmRzIE92ZXJyaWRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbml0UHJlbG9hZGVkKCk7XG4gICAgfVxuXG4gICAgaW5pdFByZWxvYWRlZCgpIHtcbiAgICAgIHZhciBkZWZMaXN0O1xuICAgICAgZGVmTGlzdCA9IHRoaXMucHJlbG9hZGVkO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSBbXTtcbiAgICAgIHJldHVybiB0aGlzLmxvYWQoZGVmTGlzdCk7XG4gICAgfVxuXG4gICAgbG9hZChkZWZMaXN0KSB7XG4gICAgICB2YXIgbG9hZGVkLCB0b0xvYWQ7XG4gICAgICB0b0xvYWQgPSBbXTtcbiAgICAgIGxvYWRlZCA9IGRlZkxpc3QubWFwKChkZWYpID0+IHtcbiAgICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgICBpZiAoZGVmLmluc3RhbmNlID09IG51bGwpIHtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGxvYWRlcjogdGhpc1xuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaW5zdGFuY2UgPSBMb2FkZXIubG9hZChkZWYpO1xuICAgICAgICAgIGRlZiA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlXG4gICAgICAgICAgfSwgZGVmKTtcbiAgICAgICAgICBpZiAoZGVmLmluaXRCeUxvYWRlciAmJiAoaW5zdGFuY2UuaW5pdCAhPSBudWxsKSkge1xuICAgICAgICAgICAgdG9Mb2FkLnB1c2goaW5zdGFuY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByZWxvYWRlZCA9IHRoaXMucHJlbG9hZGVkLmNvbmNhdChsb2FkZWQpO1xuICAgICAgcmV0dXJuIHRvTG9hZC5mb3JFYWNoKGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5pbml0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVsb2FkKGRlZikge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGRlZikpIHtcbiAgICAgICAgZGVmID0gW2RlZl07XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wcmVsb2FkZWQgPSAodGhpcy5wcmVsb2FkZWQgfHwgW10pLmNvbmNhdChkZWYpO1xuICAgIH1cblxuICAgIGRlc3Ryb3lMb2FkZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcmVsb2FkZWQuZm9yRWFjaChmdW5jdGlvbihkZWYpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgcmV0dXJuIChyZWYgPSBkZWYuaW5zdGFuY2UpICE9IG51bGwgPyB0eXBlb2YgcmVmLmRlc3Ryb3kgPT09IFwiZnVuY3Rpb25cIiA/IHJlZi5kZXN0cm95KCkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICByZXR1cm4gc3VwZXIuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KFsncHJlbG9hZGVkJ10pO1xuICAgIH1cblxuICAgIGV4dGVuZGVkKHRhcmdldCkge1xuICAgICAgc3VwZXIuZXh0ZW5kZWQodGFyZ2V0KTtcbiAgICAgIGlmICh0aGlzLnByZWxvYWRlZCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnByZWxvYWRlZCA9ICh0YXJnZXQucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQodGhpcy5wcmVsb2FkZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkTWFueShkZWYpIHtcbiAgICAgIHJldHVybiBkZWYubWFwKChkKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWQoZCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZChkZWYpIHtcbiAgICAgIGlmICh0eXBlb2YgZGVmLnR5cGUuY29weVdpdGggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gZGVmLnR5cGUuY29weVdpdGgoZGVmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgZGVmLnR5cGUoZGVmKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcHJlbG9hZChkZWYpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3RvdHlwZS5wcmVsb2FkKGRlZik7XG4gICAgfVxuXG4gIH07XG5cbiAgTG9hZGVyLnByb3RvdHlwZS5wcmVsb2FkZWQgPSBbXTtcblxuICBMb2FkZXIub3ZlcnJpZGVzKHtcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaW5pdC53aXRob3V0TG9hZGVyKCk7XG4gICAgICByZXR1cm4gdGhpcy5pbml0UHJlbG9hZGVkKCk7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGVzdHJveS53aXRob3V0TG9hZGVyKCk7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95TG9hZGVkKCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gTG9hZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0xvYWRlci5qcy5tYXBcbiIsInZhciBNaXhhYmxlLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBNaXhhYmxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBNaXhhYmxlIHtcbiAgICBzdGF0aWMgZXh0ZW5kKG9iaikge1xuICAgICAgdGhpcy5FeHRlbnNpb24ubWFrZShvYmosIHRoaXMpO1xuICAgICAgaWYgKG9iai5wcm90b3R5cGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5FeHRlbnNpb24ubWFrZShvYmoucHJvdG90eXBlLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGluY2x1ZGUob2JqKSB7XG4gICAgICByZXR1cm4gdGhpcy5FeHRlbnNpb24ubWFrZShvYmosIHRoaXMucHJvdG90eXBlKTtcbiAgICB9XG5cbiAgfTtcblxuICBNaXhhYmxlLkV4dGVuc2lvbiA9IHtcbiAgICBtYWtlT25jZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoISgocmVmID0gdGFyZ2V0LmV4dGVuc2lvbnMpICE9IG51bGwgPyByZWYuaW5jbHVkZXMoc291cmNlKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZShzb3VyY2UsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIGksIGxlbiwgb3JpZ2luYWxGaW5hbFByb3BlcnRpZXMsIHByb3AsIHJlZjtcbiAgICAgIHJlZiA9IHRoaXMuZ2V0RXh0ZW5zaW9uUHJvcGVydGllcyhzb3VyY2UsIHRhcmdldCk7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcHJvcCA9IHJlZltpXTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lLCBwcm9wKTtcbiAgICAgIH1cbiAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICYmIHRhcmdldC5nZXRGaW5hbFByb3BlcnRpZXMpIHtcbiAgICAgICAgb3JpZ2luYWxGaW5hbFByb3BlcnRpZXMgPSB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzO1xuICAgICAgICB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMoKS5jb25jYXQob3JpZ2luYWxGaW5hbFByb3BlcnRpZXMuY2FsbCh0aGlzKSk7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzID0gc291cmNlLmdldEZpbmFsUHJvcGVydGllcyB8fCB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzO1xuICAgICAgfVxuICAgICAgdGFyZ2V0LmV4dGVuc2lvbnMgPSAodGFyZ2V0LmV4dGVuc2lvbnMgfHwgW10pLmNvbmNhdChbc291cmNlXSk7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZS5leHRlbmRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gc291cmNlLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhbHdheXNGaW5hbDogWydleHRlbmRlZCcsICdleHRlbnNpb25zJywgJ19fc3VwZXJfXycsICdjb25zdHJ1Y3RvcicsICdnZXRGaW5hbFByb3BlcnRpZXMnXSxcbiAgICBnZXRFeHRlbnNpb25Qcm9wZXJ0aWVzOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIGFsd2F5c0ZpbmFsLCBwcm9wcywgdGFyZ2V0Q2hhaW47XG4gICAgICBhbHdheXNGaW5hbCA9IHRoaXMuYWx3YXlzRmluYWw7XG4gICAgICB0YXJnZXRDaGFpbiA9IHRoaXMuZ2V0UHJvdG90eXBlQ2hhaW4odGFyZ2V0KTtcbiAgICAgIHByb3BzID0gW107XG4gICAgICB0aGlzLmdldFByb3RvdHlwZUNoYWluKHNvdXJjZSkuZXZlcnkoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciBleGNsdWRlO1xuICAgICAgICBpZiAoIXRhcmdldENoYWluLmluY2x1ZGVzKG9iaikpIHtcbiAgICAgICAgICBleGNsdWRlID0gYWx3YXlzRmluYWw7XG4gICAgICAgICAgaWYgKHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBleGNsdWRlID0gZXhjbHVkZS5jb25jYXQoW1wibGVuZ3RoXCIsIFwicHJvdG90eXBlXCIsIFwibmFtZVwiXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb3BzID0gcHJvcHMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGFyZ2V0Lmhhc093blByb3BlcnR5KGtleSkgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wiICYmIGluZGV4T2YuY2FsbChleGNsdWRlLCBrZXkpIDwgMCAmJiAhcHJvcHMuZmluZChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IGtleTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHZhciBwcm9wO1xuICAgICAgICAgICAgcHJvcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpO1xuICAgICAgICAgICAgcHJvcC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHByb3A7XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwcm9wcztcbiAgICB9LFxuICAgIGdldFByb3RvdHlwZUNoYWluOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBiYXNlUHJvdG90eXBlLCBjaGFpbjtcbiAgICAgIGNoYWluID0gW107XG4gICAgICBiYXNlUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdCk7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjaGFpbi5wdXNoKG9iaik7XG4gICAgICAgIGlmICghKChvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgJiYgb2JqICE9PSBPYmplY3QgJiYgb2JqICE9PSBiYXNlUHJvdG90eXBlKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhaW47XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBNaXhhYmxlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL01peGFibGUuanMubWFwXG4iLCIvLyB0b2RvIDogXG4vLyAgc2ltcGxpZmllZCBmb3JtIDogQHdpdGhvdXROYW1lIG1ldGhvZFxudmFyIE92ZXJyaWRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBPdmVycmlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE92ZXJyaWRlciB7XG4gICAgc3RhdGljIG92ZXJyaWRlcyhvdmVycmlkZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLk92ZXJyaWRlLmFwcGx5TWFueSh0aGlzLnByb3RvdHlwZSwgdGhpcy5uYW1lLCBvdmVycmlkZXMpO1xuICAgIH1cblxuICAgIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gWydfb3ZlcnJpZGVzJ10uY29uY2F0KE9iamVjdC5rZXlzKHRoaXMuX292ZXJyaWRlcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4dGVuZGVkKHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuT3ZlcnJpZGUuYXBwbHlNYW55KHRhcmdldCwgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCB0aGlzLl9vdmVycmlkZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IgPT09IE92ZXJyaWRlcikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmV4dGVuZGVkID0gdGhpcy5leHRlbmRlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBPdmVycmlkZXIuT3ZlcnJpZGUgPSB7XG4gICAgbWFrZU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcbiAgICAgIHZhciBmbiwga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBmbiA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICByZXN1bHRzLnB1c2gob3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgZm4pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgYXBwbHlNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBvdmVycmlkZSA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICBpZiAodHlwZW9mIG92ZXJyaWRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBvdmVycmlkZSA9IHRoaXMubWFrZSh0YXJnZXQsIG5hbWVzcGFjZSwga2V5LCBvdmVycmlkZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYXBwbHkodGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBmbk5hbWUsIGZuKSB7XG4gICAgICB2YXIgb3ZlcnJpZGU7XG4gICAgICBvdmVycmlkZSA9IHtcbiAgICAgICAgZm46IHtcbiAgICAgICAgICBjdXJyZW50OiBmblxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiBmbk5hbWVcbiAgICAgIH07XG4gICAgICBvdmVycmlkZS5mblsnd2l0aCcgKyBuYW1lc3BhY2VdID0gZm47XG4gICAgICByZXR1cm4gb3ZlcnJpZGU7XG4gICAgfSxcbiAgICBlbXB0eUZuOiBmdW5jdGlvbigpIHt9LFxuICAgIGFwcGx5OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGUpIHtcbiAgICAgIHZhciBmbk5hbWUsIG92ZXJyaWRlcywgcmVmLCByZWYxLCB3aXRob3V0O1xuICAgICAgZm5OYW1lID0gb3ZlcnJpZGUubmFtZTtcbiAgICAgIG92ZXJyaWRlcyA9IHRhcmdldC5fb3ZlcnJpZGVzICE9IG51bGwgPyBPYmplY3QuYXNzaWduKHt9LCB0YXJnZXQuX292ZXJyaWRlcykgOiB7fTtcbiAgICAgIHdpdGhvdXQgPSAoKHJlZiA9IHRhcmdldC5fb3ZlcnJpZGVzKSAhPSBudWxsID8gKHJlZjEgPSByZWZbZm5OYW1lXSkgIT0gbnVsbCA/IHJlZjEuZm4uY3VycmVudCA6IHZvaWQgMCA6IHZvaWQgMCkgfHwgdGFyZ2V0W2ZuTmFtZV07XG4gICAgICBvdmVycmlkZSA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlKTtcbiAgICAgIGlmIChvdmVycmlkZXNbZm5OYW1lXSAhPSBudWxsKSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGVzW2ZuTmFtZV0uZm4sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGUuZm4pO1xuICAgICAgfVxuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGhvdXQnICsgbmFtZXNwYWNlXSA9IHdpdGhvdXQgfHwgdGhpcy5lbXB0eUZuO1xuICAgICAgaWYgKHdpdGhvdXQgPT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5taXNzaW5nV2l0aG91dCA9ICd3aXRob3V0JyArIG5hbWVzcGFjZTtcbiAgICAgIH0gZWxzZSBpZiAob3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQpIHtcbiAgICAgICAgb3ZlcnJpZGUuZm5bb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXRdID0gd2l0aG91dDtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGZuTmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGZpbmFsRm4sIGZuLCBrZXksIHJlZjI7XG4gICAgICAgICAgZmluYWxGbiA9IG92ZXJyaWRlLmZuLmN1cnJlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgICByZWYyID0gb3ZlcnJpZGUuZm47XG4gICAgICAgICAgZm9yIChrZXkgaW4gcmVmMikge1xuICAgICAgICAgICAgZm4gPSByZWYyW2tleV07XG4gICAgICAgICAgICBmaW5hbEZuW2tleV0gPSBmbi5iaW5kKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBmbk5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGZpbmFsRm5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmluYWxGbjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvdmVycmlkZXNbZm5OYW1lXSA9IG92ZXJyaWRlO1xuICAgICAgcmV0dXJuIHRhcmdldC5fb3ZlcnJpZGVzID0gb3ZlcnJpZGVzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gT3ZlcnJpZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL092ZXJyaWRlci5qcy5tYXBcbiIsInZhciBCaW5kZXIsIFVwZGF0ZXI7XG5cbkJpbmRlciA9IHJlcXVpcmUoJ3NwYXJrLWJpbmRpbmcnKS5CaW5kZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gVXBkYXRlciA9IGNsYXNzIFVwZGF0ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdmFyIHJlZjtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIHRoaXMubmV4dCA9IFtdO1xuICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuY2FsbGJhY2sgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYWRkQ2FsbGJhY2sob3B0aW9ucy5jYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICgob3B0aW9ucyAhPSBudWxsID8gKHJlZiA9IG9wdGlvbnMuY2FsbGJhY2tzKSAhPSBudWxsID8gcmVmLmZvckVhY2ggOiB2b2lkIDAgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuY2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICB2YXIgY2FsbGJhY2s7XG4gICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG4gICAgdGhpcy5uZXh0ID0gdGhpcy5jYWxsYmFja3Muc2xpY2UoKTtcbiAgICB3aGlsZSAodGhpcy5jYWxsYmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrcy5zaGlmdCgpO1xuICAgICAgdGhpcy5ydW5DYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5uZXh0O1xuICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJ1bkNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH1cblxuICBhZGRDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudXBkYXRpbmcgJiYgIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgbmV4dFRpY2soY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgaWYgKCF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5leHQucHVzaChjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IHRoaXMuY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGluZGV4ID0gdGhpcy5uZXh0LmluZGV4T2YoY2FsbGJhY2spO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBnZXRCaW5kZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBVcGRhdGVyLkJpbmRlcih0aGlzKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICByZXR1cm4gdGhpcy5uZXh0ID0gW107XG4gIH1cblxufTtcblxuVXBkYXRlci5CaW5kZXIgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBjbGFzcyBCaW5kZXIgZXh0ZW5kcyBzdXBlckNsYXNzIHtcbiAgICBjb25zdHJ1Y3Rvcih0YXJnZXQsIGNhbGxiYWNrMSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrMTtcbiAgICB9XG5cbiAgICBnZXRSZWYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBkb0JpbmQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkQ2FsbGJhY2sodGhpcy5jYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZG9VbmJpbmQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlQ2FsbGJhY2sodGhpcy5jYWxsYmFjayk7XG4gICAgfVxuXG4gIH07XG5cbiAgcmV0dXJuIEJpbmRlcjtcblxufSkuY2FsbCh0aGlzLCBCaW5kZXIpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1VwZGF0ZXIuanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJFbGVtZW50XCI6IHJlcXVpcmUoXCIuL0VsZW1lbnRcIiksXG4gIFwiTG9hZGVyXCI6IHJlcXVpcmUoXCIuL0xvYWRlclwiKSxcbiAgXCJNaXhhYmxlXCI6IHJlcXVpcmUoXCIuL01peGFibGVcIiksXG4gIFwiT3ZlcnJpZGVyXCI6IHJlcXVpcmUoXCIuL092ZXJyaWRlclwiKSxcbiAgXCJVcGRhdGVyXCI6IHJlcXVpcmUoXCIuL1VwZGF0ZXJcIiksXG4gIFwiSW52YWxpZGF0ZWRcIjoge1xuICAgIFwiQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiKSxcbiAgICBcIkludmFsaWRhdGVkXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0ludmFsaWRhdGVkXCIpLFxuICB9LFxufSIsInZhciBsaWJzO1xuXG5saWJzID0gcmVxdWlyZSgnLi9saWJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7XG4gICdDb2xsZWN0aW9uJzogcmVxdWlyZSgnc3BhcmstY29sbGVjdGlvbicpXG59LCBsaWJzLCByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJyksIHJlcXVpcmUoJ3NwYXJrLWJpbmRpbmcnKSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvc3Bhcmstc3RhcnRlci5qcy5tYXBcbiJdfQ==
