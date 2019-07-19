(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Parallelio = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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



},{"./Character":2,"./Door":6}],2:[function(require,module,exports){
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



},{"./Damageable":5,"./actions/WalkAction":30,"parallelio-tiles":82}],3:[function(require,module,exports){
var AttackMoveAction, CharacterAI, Door, PropertyWatcher, TileContainer, VisionCalculator, WalkAction;

TileContainer = require('parallelio-tiles').TileContainer;

VisionCalculator = require('./VisionCalculator');

Door = require('./Door');

WalkAction = require('./actions/WalkAction');

AttackMoveAction = require('./actions/AttackMoveAction');

PropertyWatcher = require('spark-starter').PropertyWatcher;

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



},{"./Door":6,"./VisionCalculator":22,"./actions/AttackMoveAction":26,"./actions/WalkAction":30,"parallelio-tiles":82,"spark-starter":153}],4:[function(require,module,exports){
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



},{"./LineOfSight":10,"parallelio-tiles":82,"spark-starter":153}],5:[function(require,module,exports){
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



},{"spark-starter":153}],6:[function(require,module,exports){
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



},{"parallelio-tiles":82}],7:[function(require,module,exports){
module.exports = require('spark-starter').Element;



},{"spark-starter":153}],8:[function(require,module,exports){
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



},{"parallelio-tiles":82}],9:[function(require,module,exports){
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



},{"./Player":15,"./View":21,"parallelio-timing":107,"spark-starter":153}],10:[function(require,module,exports){
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



},{}],11:[function(require,module,exports){
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



},{"spark-starter":153}],12:[function(require,module,exports){
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



},{"parallelio-tiles":82}],13:[function(require,module,exports){
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



},{"parallelio-timing":107,"spark-starter":153}],14:[function(require,module,exports){
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



},{"./LineOfSight":10,"parallelio-timing":107,"spark-starter":153}],15:[function(require,module,exports){
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



},{"spark-starter":153}],16:[function(require,module,exports){
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



},{"parallelio-timing":107,"spark-starter":153}],17:[function(require,module,exports){
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



},{"./Door":6,"parallelio-tiles":82,"spark-starter":153}],18:[function(require,module,exports){
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



},{"./Damageable":5,"./Projectile":16,"parallelio-tiles":82,"parallelio-timing":107}],19:[function(require,module,exports){
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



},{"spark-starter":153}],20:[function(require,module,exports){
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



},{"./Map":11,"./Star":19,"spark-starter":153}],21:[function(require,module,exports){
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



},{"parallelio-grids":35,"spark-starter":153}],22:[function(require,module,exports){
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



},{"./LineOfSight":10,"parallelio-tiles":82}],23:[function(require,module,exports){
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



},{"spark-starter":153}],24:[function(require,module,exports){
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



},{"spark-starter":153}],25:[function(require,module,exports){
var AttackAction, EventBind, PropertyWatcher, TargetAction, WalkAction;

WalkAction = require('./WalkAction');

TargetAction = require('./TargetAction');

EventBind = require('spark-starter').EventBind;

PropertyWatcher = require('spark-starter').PropertyWatcher;

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



},{"./TargetAction":28,"./WalkAction":30,"spark-starter":153}],26:[function(require,module,exports){
var AttackAction, AttackMoveAction, EventBind, LineOfSight, PathFinder, PropertyWatcher, TargetAction, WalkAction;

WalkAction = require('./WalkAction');

AttackAction = require('./AttackAction');

TargetAction = require('./TargetAction');

PathFinder = require('parallelio-pathfinder');

LineOfSight = require('../LineOfSight');

PropertyWatcher = require('spark-starter').PropertyWatcher;

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



},{"../LineOfSight":10,"./AttackAction":25,"./TargetAction":28,"./WalkAction":30,"parallelio-pathfinder":56,"spark-starter":153}],27:[function(require,module,exports){
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



},{"./ActionProvider":24}],28:[function(require,module,exports){
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



},{"./Action":23}],29:[function(require,module,exports){
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



},{"./ActionProvider":24,"spark-starter":153}],30:[function(require,module,exports){
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



},{"../PathWalk":13,"./TargetAction":28,"parallelio-pathfinder":56}],31:[function(require,module,exports){
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
},{"./AutomaticDoor":1,"./Character":2,"./CharacterAI":3,"./DamagePropagation":4,"./Damageable":5,"./Door":6,"./Element":7,"./Floor":8,"./Game":9,"./LineOfSight":10,"./Map":11,"./Obstacle":12,"./PathWalk":13,"./PersonalWeapon":14,"./Player":15,"./Projectile":16,"./RoomGenerator":17,"./ShipWeapon":18,"./Star":19,"./StarMapGenerator":20,"./View":21,"./VisionCalculator":22,"./actions/Action":23,"./actions/ActionProvider":24,"./actions/AttackAction":25,"./actions/AttackMoveAction":26,"./actions/SimpleActionProvider":27,"./actions/TargetAction":28,"./actions/TiledActionProvider":29,"./actions/WalkAction":30}],32:[function(require,module,exports){
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
},{"./GridCell":33,"./GridRow":34,"spark-starter":55}],33:[function(require,module,exports){
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
},{"spark-starter":55}],34:[function(require,module,exports){
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
},{"./GridCell":33,"spark-starter":55}],35:[function(require,module,exports){
if(module){
  module.exports = {
    Grid: require('./Grid.js'),
    GridCell: require('./GridCell.js'),
    GridRow: require('./GridRow.js')
  };
}
},{"./Grid.js":32,"./GridCell.js":33,"./GridRow.js":34}],36:[function(require,module,exports){
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


},{}],37:[function(require,module,exports){
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


},{}],38:[function(require,module,exports){
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


},{"./Mixable":42,"./Property":44}],39:[function(require,module,exports){
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


},{"./Binder":36}],40:[function(require,module,exports){
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


},{}],41:[function(require,module,exports){
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


},{"./Binder":36,"./EventBind":39}],42:[function(require,module,exports){
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


},{}],43:[function(require,module,exports){
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


},{}],44:[function(require,module,exports){
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


},{"./Mixable":42,"./PropertyOwner":45,"./PropertyTypes/ActivableProperty":46,"./PropertyTypes/BasicProperty":47,"./PropertyTypes/CalculatedProperty":48,"./PropertyTypes/CollectionProperty":49,"./PropertyTypes/ComposedProperty":50,"./PropertyTypes/DynamicProperty":51,"./PropertyTypes/InvalidatedProperty":52,"./PropertyTypes/UpdatedProperty":53}],45:[function(require,module,exports){
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


},{}],46:[function(require,module,exports){
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


},{"../Invalidator":41,"../Overrider":43,"./BasicProperty":47}],47:[function(require,module,exports){
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


},{"../Mixable":42}],48:[function(require,module,exports){
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


},{"../Invalidator":41,"../Overrider":43,"./DynamicProperty":51}],49:[function(require,module,exports){
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


},{"../Collection":37,"./DynamicProperty":51}],50:[function(require,module,exports){
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


},{"../Collection":37,"../Invalidator":41,"./CalculatedProperty":48}],51:[function(require,module,exports){
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


},{"../Invalidator":41,"./BasicProperty":47}],52:[function(require,module,exports){
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


},{"../Invalidator":41,"./CalculatedProperty":48}],53:[function(require,module,exports){
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


},{"../Invalidator":41,"../Overrider":43,"./DynamicProperty":51}],54:[function(require,module,exports){
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


},{"./Binder":36}],55:[function(require,module,exports){
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
},{"./Binder.js":36,"./Collection.js":37,"./Element.js":38,"./EventBind.js":39,"./EventEmitter.js":40,"./Invalidator.js":41,"./Mixable.js":42,"./Overrider.js":43,"./Property.js":44,"./PropertyOwner.js":45,"./PropertyTypes/ActivableProperty.js":46,"./PropertyTypes/BasicProperty.js":47,"./PropertyTypes/CalculatedProperty.js":48,"./PropertyTypes/CollectionProperty.js":49,"./PropertyTypes/ComposedProperty.js":50,"./PropertyTypes/DynamicProperty.js":51,"./PropertyTypes/InvalidatedProperty.js":52,"./PropertyTypes/UpdatedProperty.js":53,"./Updater.js":54}],56:[function(require,module,exports){
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
},{"spark-starter":76}],57:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"dup":36}],58:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"dup":37}],59:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"./Mixable":63,"./Property":65,"dup":38}],60:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"./Binder":57,"dup":39}],61:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"dup":40}],62:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"./Binder":57,"./EventBind":60,"dup":41}],63:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],64:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"dup":43}],65:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"./Mixable":63,"./PropertyOwner":66,"./PropertyTypes/ActivableProperty":67,"./PropertyTypes/BasicProperty":68,"./PropertyTypes/CalculatedProperty":69,"./PropertyTypes/CollectionProperty":70,"./PropertyTypes/ComposedProperty":71,"./PropertyTypes/DynamicProperty":72,"./PropertyTypes/InvalidatedProperty":73,"./PropertyTypes/UpdatedProperty":74,"dup":44}],66:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"dup":45}],67:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"../Invalidator":62,"../Overrider":64,"./BasicProperty":68,"dup":46}],68:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"../Mixable":63,"dup":47}],69:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"../Invalidator":62,"../Overrider":64,"./DynamicProperty":72,"dup":48}],70:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../Collection":58,"./DynamicProperty":72,"dup":49}],71:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"../Collection":58,"../Invalidator":62,"./CalculatedProperty":69,"dup":50}],72:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"../Invalidator":62,"./BasicProperty":68,"dup":51}],73:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"../Invalidator":62,"./CalculatedProperty":69,"dup":52}],74:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"../Invalidator":62,"../Overrider":64,"./DynamicProperty":72,"dup":53}],75:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"./Binder":57,"dup":54}],76:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"./Binder.js":57,"./Collection.js":58,"./Element.js":59,"./EventBind.js":60,"./EventEmitter.js":61,"./Invalidator.js":62,"./Mixable.js":63,"./Overrider.js":64,"./Property.js":65,"./PropertyOwner.js":66,"./PropertyTypes/ActivableProperty.js":67,"./PropertyTypes/BasicProperty.js":68,"./PropertyTypes/CalculatedProperty.js":69,"./PropertyTypes/CollectionProperty.js":70,"./PropertyTypes/ComposedProperty.js":71,"./PropertyTypes/DynamicProperty.js":72,"./PropertyTypes/InvalidatedProperty.js":73,"./PropertyTypes/UpdatedProperty.js":74,"./Updater.js":75,"dup":55}],77:[function(require,module,exports){
(function(definition){var Direction=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Direction.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Direction;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Direction=Direction;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Direction=Direction;}}})(function(){
var Direction;
Direction = class Direction {
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
return(Direction);});
},{}],78:[function(require,module,exports){
(function(definition){var Tile=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Tile.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Tile;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Tile=Tile;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Tile=Tile;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : require('./Direction');
var Tile;
Tile = (function() {
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

return(Tile);});
},{"./Direction":77,"spark-starter":106}],79:[function(require,module,exports){
(function(definition){var TileContainer=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);TileContainer.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=TileContainer;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.TileContainer=TileContainer;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.TileContainer=TileContainer;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var TileReference = dependencies.hasOwnProperty("TileReference") ? dependencies.TileReference : require('./TileReference');
var TileContainer;
TileContainer = (function() {
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

return(TileContainer);});
},{"./TileReference":80,"spark-starter":106}],80:[function(require,module,exports){
(function(definition){var TileReference=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);TileReference.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=TileReference;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.TileReference=TileReference;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.TileReference=TileReference;}}})(function(){
var TileReference;
TileReference = class TileReference {
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
return(TileReference);});
},{}],81:[function(require,module,exports){
(function(definition){var Tiled=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Tiled.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Tiled;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Tiled=Tiled;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Tiled=Tiled;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Tiled;
Tiled = (function() {
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

return(Tiled);});
},{"spark-starter":106}],82:[function(require,module,exports){
if(module){
  module.exports = {
    Direction: require('./Direction.js'),
    Tile: require('./Tile.js'),
    TileContainer: require('./TileContainer.js'),
    TileReference: require('./TileReference.js'),
    Tiled: require('./Tiled.js')
  };
}
},{"./Direction.js":77,"./Tile.js":78,"./TileContainer.js":79,"./TileReference.js":80,"./Tiled.js":81}],83:[function(require,module,exports){
(function(definition){var Binder=definition(typeof Spark!=="undefined"?Spark:this.Spark);Binder.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Binder;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Binder=Binder;}else{if(this.Spark==null){this.Spark={};}this.Spark.Binder=Binder;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : require('./Referred');
var Binder;
Binder = class Binder extends Referred {
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

return(Binder);});
},{"./Referred":104}],84:[function(require,module,exports){
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
return(Collection);});
},{}],85:[function(require,module,exports){
(function(definition){var Element=definition(typeof Spark!=="undefined"?Spark:this.Spark);Element.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Element;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Element=Element;}else{if(this.Spark==null){this.Spark={};}this.Spark.Element=Element;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : require('./Property');
var Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : require('./Mixable');
var Element;
Element = class Element extends Mixable {
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

return(Element);});
},{"./Mixable":94,"./Property":96}],86:[function(require,module,exports){
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

return(EventBind);});
},{"./Binder":83}],87:[function(require,module,exports){
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
return(EventEmitter);});
},{}],88:[function(require,module,exports){
(function(definition){var ActivablePropertyWatcher=definition(typeof Spark!=="undefined"?Spark:this.Spark);ActivablePropertyWatcher.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ActivablePropertyWatcher;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ActivablePropertyWatcher=ActivablePropertyWatcher;}else{if(this.Spark==null){this.Spark={};}this.Spark.ActivablePropertyWatcher=ActivablePropertyWatcher;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('./PropertyWatcher');
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var ActivablePropertyWatcher;
ActivablePropertyWatcher = class ActivablePropertyWatcher extends PropertyWatcher {
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

return(ActivablePropertyWatcher);});
},{"../Invalidator":92,"./PropertyWatcher":91}],89:[function(require,module,exports){
(function(definition){var CollectionPropertyWatcher=definition(typeof Spark!=="undefined"?Spark:this.Spark);CollectionPropertyWatcher.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CollectionPropertyWatcher;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CollectionPropertyWatcher=CollectionPropertyWatcher;}else{if(this.Spark==null){this.Spark={};}this.Spark.CollectionPropertyWatcher=CollectionPropertyWatcher;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('./PropertyWatcher');
var CollectionPropertyWatcher;
CollectionPropertyWatcher = class CollectionPropertyWatcher extends PropertyWatcher {
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

return(CollectionPropertyWatcher);});
},{"./PropertyWatcher":91}],90:[function(require,module,exports){
(function(definition){var Invalidated=definition(typeof Spark!=="undefined"?Spark:this.Spark);Invalidated.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Invalidated;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Invalidated=Invalidated;}else{if(this.Spark==null){this.Spark={};}this.Spark.Invalidated=Invalidated;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var Invalidated;
Invalidated = class Invalidated {
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

return(Invalidated);});
},{"../Invalidator":92}],91:[function(require,module,exports){
(function(definition){var PropertyWatcher=definition(typeof Spark!=="undefined"?Spark:this.Spark);PropertyWatcher.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PropertyWatcher;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.PropertyWatcher=PropertyWatcher;}else{if(this.Spark==null){this.Spark={};}this.Spark.PropertyWatcher=PropertyWatcher;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('../Binder');
var PropertyWatcher;
PropertyWatcher = class PropertyWatcher extends Binder {
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

return(PropertyWatcher);});
},{"../Binder":83}],92:[function(require,module,exports){
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

return(Invalidator);});
},{"./Binder":83,"./EventBind":86}],93:[function(require,module,exports){
(function(definition){var Loader=definition(typeof Spark!=="undefined"?Spark:this.Spark);Loader.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Loader;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Loader=Loader;}else{if(this.Spark==null){this.Spark={};}this.Spark.Loader=Loader;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : require('./Overrider');
var Loader;
Loader = (function() {
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

return(Loader);});
},{"./Overrider":95}],94:[function(require,module,exports){
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
return(Mixable);});
},{}],95:[function(require,module,exports){
(function(definition){var Overrider=definition(typeof Spark!=="undefined"?Spark:this.Spark);Overrider.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Overrider;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Overrider=Overrider;}else{if(this.Spark==null){this.Spark={};}this.Spark.Overrider=Overrider;}}})(function(){
// todo : 
//  simplified form : @withoutName method
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
},{}],96:[function(require,module,exports){
(function(definition){var Property=definition(typeof Spark!=="undefined"?Spark:this.Spark);Property.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Property;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Property=Property;}else{if(this.Spark==null){this.Spark={};}this.Spark.Property=Property;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : require('./PropertyTypes/BasicProperty');
var CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : require('./PropertyTypes/CollectionProperty');
var ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : require('./PropertyTypes/ComposedProperty');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./PropertyTypes/DynamicProperty');
var CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : require('./PropertyTypes/CalculatedProperty');
var InvalidatedProperty = dependencies.hasOwnProperty("InvalidatedProperty") ? dependencies.InvalidatedProperty : require('./PropertyTypes/InvalidatedProperty');
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

return(Property);});
},{"./Mixable":94,"./PropertyOwner":97,"./PropertyTypes/BasicProperty":98,"./PropertyTypes/CalculatedProperty":99,"./PropertyTypes/CollectionProperty":100,"./PropertyTypes/ComposedProperty":101,"./PropertyTypes/DynamicProperty":102,"./PropertyTypes/InvalidatedProperty":103}],97:[function(require,module,exports){
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
},{}],98:[function(require,module,exports){
(function(definition){var BasicProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);BasicProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=BasicProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.BasicProperty=BasicProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.BasicProperty=BasicProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : require('../Mixable');
var EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : require('../EventEmitter');
var Loader = dependencies.hasOwnProperty("Loader") ? dependencies.Loader : require('../Loader');
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('../Invalidated/PropertyWatcher');
var Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : require('../Referred');
var BasicProperty;
BasicProperty = (function() {
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

return(BasicProperty);});
},{"../EventEmitter":87,"../Invalidated/PropertyWatcher":91,"../Loader":93,"../Mixable":94,"../Referred":104}],99:[function(require,module,exports){
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

return(CalculatedProperty);});
},{"../Invalidator":92,"../Overrider":95,"./DynamicProperty":102}],100:[function(require,module,exports){
(function(definition){var CollectionProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);CollectionProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CollectionProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CollectionProperty=CollectionProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.CollectionProperty=CollectionProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : require('../Collection');
var Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : require('../Referred');
var CollectionPropertyWatcher = dependencies.hasOwnProperty("CollectionPropertyWatcher") ? dependencies.CollectionPropertyWatcher : require('../Invalidated/CollectionPropertyWatcher');
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

return(CollectionProperty);});
},{"../Collection":84,"../Invalidated/CollectionPropertyWatcher":89,"../Referred":104,"./DynamicProperty":102}],101:[function(require,module,exports){
(function(definition){var ComposedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);ComposedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ComposedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ComposedProperty=ComposedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.ComposedProperty=ComposedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : require('./CalculatedProperty');
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : require('../Collection');
var ComposedProperty;
ComposedProperty = (function() {
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

return(ComposedProperty);});
},{"../Collection":84,"../Invalidator":92,"./CalculatedProperty":99}],102:[function(require,module,exports){
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

return(DynamicProperty);});
},{"../Invalidator":92,"./BasicProperty":98}],103:[function(require,module,exports){
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

return(InvalidatedProperty);});
},{"../Invalidator":92,"./CalculatedProperty":99}],104:[function(require,module,exports){
(function(definition){var Referred=definition(typeof Spark!=="undefined"?Spark:this.Spark);Referred.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Referred;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Referred=Referred;}else{if(this.Spark==null){this.Spark={};}this.Spark.Referred=Referred;}}})(function(){
var Referred;
Referred = (function() {
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
return(Referred);});
},{}],105:[function(require,module,exports){
(function(definition){var Updater=definition(typeof Spark!=="undefined"?Spark:this.Spark);Updater.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Updater;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Updater=Updater;}else{if(this.Spark==null){this.Spark={};}this.Spark.Updater=Updater;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('./Binder');
var Updater;
Updater = class Updater {
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

return(Updater);});
},{"./Binder":83}],106:[function(require,module,exports){
if(module){
  module.exports = {
    Binder: require('./Binder.js'),
    Collection: require('./Collection.js'),
    Element: require('./Element.js'),
    EventBind: require('./EventBind.js'),
    EventEmitter: require('./EventEmitter.js'),
    Invalidator: require('./Invalidator.js'),
    Loader: require('./Loader.js'),
    Mixable: require('./Mixable.js'),
    Overrider: require('./Overrider.js'),
    Property: require('./Property.js'),
    PropertyOwner: require('./PropertyOwner.js'),
    Referred: require('./Referred.js'),
    Updater: require('./Updater.js'),
    ActivablePropertyWatcher: require('./Invalidated/ActivablePropertyWatcher.js'),
    CollectionPropertyWatcher: require('./Invalidated/CollectionPropertyWatcher.js'),
    Invalidated: require('./Invalidated/Invalidated.js'),
    PropertyWatcher: require('./Invalidated/PropertyWatcher.js'),
    BasicProperty: require('./PropertyTypes/BasicProperty.js'),
    CalculatedProperty: require('./PropertyTypes/CalculatedProperty.js'),
    CollectionProperty: require('./PropertyTypes/CollectionProperty.js'),
    ComposedProperty: require('./PropertyTypes/ComposedProperty.js'),
    DynamicProperty: require('./PropertyTypes/DynamicProperty.js'),
    InvalidatedProperty: require('./PropertyTypes/InvalidatedProperty.js')
  };
}
},{"./Binder.js":83,"./Collection.js":84,"./Element.js":85,"./EventBind.js":86,"./EventEmitter.js":87,"./Invalidated/ActivablePropertyWatcher.js":88,"./Invalidated/CollectionPropertyWatcher.js":89,"./Invalidated/Invalidated.js":90,"./Invalidated/PropertyWatcher.js":91,"./Invalidator.js":92,"./Loader.js":93,"./Mixable.js":94,"./Overrider.js":95,"./Property.js":96,"./PropertyOwner.js":97,"./PropertyTypes/BasicProperty.js":98,"./PropertyTypes/CalculatedProperty.js":99,"./PropertyTypes/CollectionProperty.js":100,"./PropertyTypes/ComposedProperty.js":101,"./PropertyTypes/DynamicProperty.js":102,"./PropertyTypes/InvalidatedProperty.js":103,"./Referred.js":104,"./Updater.js":105}],107:[function(require,module,exports){
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

},{"_process":128,"spark-starter":127}],108:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"dup":36}],109:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"dup":37}],110:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"./Mixable":114,"./Property":116,"dup":38}],111:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"./Binder":108,"dup":39}],112:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"dup":40}],113:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"./Binder":108,"./EventBind":111,"dup":41}],114:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],115:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"dup":43}],116:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"./Mixable":114,"./PropertyOwner":117,"./PropertyTypes/ActivableProperty":118,"./PropertyTypes/BasicProperty":119,"./PropertyTypes/CalculatedProperty":120,"./PropertyTypes/CollectionProperty":121,"./PropertyTypes/ComposedProperty":122,"./PropertyTypes/DynamicProperty":123,"./PropertyTypes/InvalidatedProperty":124,"./PropertyTypes/UpdatedProperty":125,"dup":44}],117:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"dup":45}],118:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"../Invalidator":113,"../Overrider":115,"./BasicProperty":119,"dup":46}],119:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"../Mixable":114,"dup":47}],120:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"../Invalidator":113,"../Overrider":115,"./DynamicProperty":123,"dup":48}],121:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../Collection":109,"./DynamicProperty":123,"dup":49}],122:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"../Collection":109,"../Invalidator":113,"./CalculatedProperty":120,"dup":50}],123:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"../Invalidator":113,"./BasicProperty":119,"dup":51}],124:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"../Invalidator":113,"./CalculatedProperty":120,"dup":52}],125:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"../Invalidator":113,"../Overrider":115,"./DynamicProperty":123,"dup":53}],126:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"./Binder":108,"dup":54}],127:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"./Binder.js":108,"./Collection.js":109,"./Element.js":110,"./EventBind.js":111,"./EventEmitter.js":112,"./Invalidator.js":113,"./Mixable.js":114,"./Overrider.js":115,"./Property.js":116,"./PropertyOwner.js":117,"./PropertyTypes/ActivableProperty.js":118,"./PropertyTypes/BasicProperty.js":119,"./PropertyTypes/CalculatedProperty.js":120,"./PropertyTypes/CollectionProperty.js":121,"./PropertyTypes/ComposedProperty.js":122,"./PropertyTypes/DynamicProperty.js":123,"./PropertyTypes/InvalidatedProperty.js":124,"./PropertyTypes/UpdatedProperty.js":125,"./Updater.js":126,"dup":55}],128:[function(require,module,exports){
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

},{}],129:[function(require,module,exports){
Parallelio.strings = {"greekAlphabet":["alpha","beta","gamma","delta","epsilon","zeta","eta","theta","iota","kappa","lambda","mu","nu","xi","omicron","pi","rho","sigma","tau","upsilon","phi","chi","psi","omega"],"starNames":["Achernar","Maia","Atlas","Salm","Alnilam","Nekkar","Elnath","Thuban","Achird","Marfik","Auva","Sargas","Alnitak","Nihal","Enif","Torcularis","Acrux","Markab","Avior","Sarin","Alphard","Nunki","Etamin","Turais","Acubens","Matar","Azelfafage","Sceptrum","Alphekka","Nusakan","Fomalhaut","Tyl","Adara","Mebsuta","Azha","Scheat","Alpheratz","Peacock","Fornacis","Unukalhai","Adhafera","Megrez","Azmidiske","Segin","Alrai","Phad","Furud","Vega","Adhil","Meissa","Baham","Seginus","Alrisha","Phaet","Gacrux","Vindemiatrix","Agena","Mekbuda","Becrux","Sham","Alsafi","Pherkad","Gianfar","Wasat","Aladfar","Menkalinan","Beid","Sharatan","Alsciaukat","Pleione","Gomeisa","Wezen","Alathfar","Menkar","Bellatrix","Shaula","Alshain","Polaris","Graffias","Wezn","Albaldah","Menkent","Betelgeuse","Shedir","Alshat","Pollux","Grafias","Yed","Albali","Menkib","Botein","Sheliak","Alsuhail","Porrima","Grumium","Yildun","Albireo","Merak","Brachium","Sirius","Altair","Praecipua","Hadar","Zaniah","Alchiba","Merga","Canopus","Situla","Altarf","Procyon","Haedi","Zaurak","Alcor","Merope","Capella","Skat","Alterf","Propus","Hamal","Zavijah","Alcyone","Mesarthim","Caph","Spica","Aludra","Rana","Hassaleh","Zibal","Alderamin","Metallah","Castor","Sterope","Alula","Ras","Heze","Zosma","Aldhibah","Miaplacidus","Cebalrai","Sualocin","Alya","Rasalgethi","Hoedus","Aquarius","Alfirk","Minkar","Celaeno","Subra","Alzirr","Rasalhague","Homam","Aries","Algenib","Mintaka","Chara","Suhail","Ancha","Rastaban","Hyadum","Cepheus","Algieba","Mira","Chort","Sulafat","Angetenar","Regulus","Izar","Cetus","Algol","Mirach","Cursa","Syrma","Ankaa","Rigel","Jabbah","Columba","Algorab","Miram","Dabih","Tabit","Anser","Rotanev","Kajam","Coma","Alhena","Mirphak","Deneb","Talitha","Antares","Ruchba","Kaus","Corona","Alioth","Mizar","Denebola","Tania","Arcturus","Ruchbah","Keid","Crux","Alkaid","Mufrid","Dheneb","Tarazed","Arkab","Rukbat","Kitalpha","Draco","Alkalurops","Muliphen","Diadem","Taygeta","Arneb","Sabik","Kocab","Grus","Alkes","Murzim","Diphda","Tegmen","Arrakis","Sadalachbia","Kornephoros","Hydra","Alkurhah","Muscida","Dschubba","Tejat","Ascella","Sadalmelik","Kraz","Lacerta","Almaak","Naos","Dsiban","Terebellum","Asellus","Sadalsuud","Kuma","Mensa","Alnair","Nash","Dubhe","Thabit","Asterope","Sadr","Lesath","Maasym","Alnath","Nashira","Electra","Theemim","Atik","Saiph","Phoenix","Norma"]}
},{}],130:[function(require,module,exports){
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



},{"./Referred":151}],131:[function(require,module,exports){
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



},{}],132:[function(require,module,exports){
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



},{"./Mixable":141,"./Property":143}],133:[function(require,module,exports){
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



},{"./Binder":130}],134:[function(require,module,exports){
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



},{}],135:[function(require,module,exports){
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



},{"../Invalidator":139,"./PropertyWatcher":138}],136:[function(require,module,exports){
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



},{"./PropertyWatcher":138}],137:[function(require,module,exports){
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



},{"../Invalidator":139}],138:[function(require,module,exports){
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



},{"../Binder":130}],139:[function(require,module,exports){
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



},{"./Binder":130,"./EventBind":133}],140:[function(require,module,exports){
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



},{"./Overrider":142}],141:[function(require,module,exports){
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



},{}],142:[function(require,module,exports){
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



},{}],143:[function(require,module,exports){
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



},{"./Mixable":141,"./PropertyOwner":144,"./PropertyTypes/BasicProperty":145,"./PropertyTypes/CalculatedProperty":146,"./PropertyTypes/CollectionProperty":147,"./PropertyTypes/ComposedProperty":148,"./PropertyTypes/DynamicProperty":149,"./PropertyTypes/InvalidatedProperty":150}],144:[function(require,module,exports){
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



},{}],145:[function(require,module,exports){
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



},{"../EventEmitter":134,"../Invalidated/PropertyWatcher":138,"../Loader":140,"../Mixable":141,"../Referred":151}],146:[function(require,module,exports){
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



},{"../Invalidator":139,"../Overrider":142,"./DynamicProperty":149}],147:[function(require,module,exports){
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



},{"../Collection":131,"../Invalidated/CollectionPropertyWatcher":136,"../Referred":151,"./DynamicProperty":149}],148:[function(require,module,exports){
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



},{"../Collection":131,"../Invalidator":139,"./CalculatedProperty":146}],149:[function(require,module,exports){
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



},{"../Invalidator":139,"./BasicProperty":145}],150:[function(require,module,exports){
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



},{"../Invalidator":139,"./CalculatedProperty":146}],151:[function(require,module,exports){
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



},{}],152:[function(require,module,exports){
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



},{"./Binder":130}],153:[function(require,module,exports){
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
},{"./Binder":130,"./Collection":131,"./Element":132,"./EventBind":133,"./EventEmitter":134,"./Invalidated/ActivablePropertyWatcher":135,"./Invalidated/CollectionPropertyWatcher":136,"./Invalidated/Invalidated":137,"./Invalidated/PropertyWatcher":138,"./Invalidator":139,"./Loader":140,"./Mixable":141,"./Overrider":142,"./Property":143,"./PropertyOwner":144,"./PropertyTypes/BasicProperty":145,"./PropertyTypes/CalculatedProperty":146,"./PropertyTypes/CollectionProperty":147,"./PropertyTypes/ComposedProperty":148,"./PropertyTypes/DynamicProperty":149,"./PropertyTypes/InvalidatedProperty":150,"./Referred":151,"./Updater":152}]},{},[31,129])(129)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQXV0b21hdGljRG9vci5qcyIsImxpYi9DaGFyYWN0ZXIuanMiLCJsaWIvQ2hhcmFjdGVyQUkuanMiLCJsaWIvRGFtYWdlUHJvcGFnYXRpb24uanMiLCJsaWIvRGFtYWdlYWJsZS5qcyIsImxpYi9Eb29yLmpzIiwibGliL0VsZW1lbnQuanMiLCJsaWIvRmxvb3IuanMiLCJsaWIvR2FtZS5qcyIsImxpYi9MaW5lT2ZTaWdodC5qcyIsImxpYi9NYXAuanMiLCJsaWIvT2JzdGFjbGUuanMiLCJsaWIvUGF0aFdhbGsuanMiLCJsaWIvUGVyc29uYWxXZWFwb24uanMiLCJsaWIvUGxheWVyLmpzIiwibGliL1Byb2plY3RpbGUuanMiLCJsaWIvUm9vbUdlbmVyYXRvci5qcyIsImxpYi9TaGlwV2VhcG9uLmpzIiwibGliL1N0YXIuanMiLCJsaWIvU3Rhck1hcEdlbmVyYXRvci5qcyIsImxpYi9WaWV3LmpzIiwibGliL1Zpc2lvbkNhbGN1bGF0b3IuanMiLCJsaWIvYWN0aW9ucy9BY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9BY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL0F0dGFja0FjdGlvbi5qcyIsImxpYi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL1RhcmdldEFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9XYWxrQWN0aW9uLmpzIiwibGliL3BhcmFsbGVsaW8uanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9saWIvR3JpZC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkQ2VsbC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkUm93LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL2dyaWRzLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0JpbmRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Db2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0VsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRXZlbnRCaW5kLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50RW1pdHRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9NaXhhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL092ZXJyaWRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eU93bmVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQWN0aXZhYmxlUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ29tcG9zZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9VcGRhdGVkUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvVXBkYXRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9zcGFyay1zdGFydGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tcGF0aGZpbmRlci9kaXN0L3BhdGhmaW5kZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvRGlyZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZUNvbnRhaW5lci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlUmVmZXJlbmNlLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL3RpbGVzLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0JpbmRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Db2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0VsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRXZlbnRCaW5kLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50RW1pdHRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9Qcm9wZXJ0eVdhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0b3IuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvTG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL01peGFibGUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvT3ZlcnJpZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5T3duZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ29tcG9zZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUmVmZXJyZWQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvVXBkYXRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9zcGFyay1zdGFydGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGltaW5nL2Rpc3QvdGltaW5nLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInRtcC9fc3RyaW5ncy5jb2ZmZWUiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9CaW5kZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Db2xsZWN0aW9uLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvRWxlbWVudC5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50QmluZC5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50RW1pdHRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZC5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdG9yLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvTG9hZGVyLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvTWl4YWJsZS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL092ZXJyaWRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5LmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlPd25lci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMiLCIuLi9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL1JlZmVycmVkLmpzIiwiLi4vc3Bhcmstc3RhcnRlci9saWIvVXBkYXRlci5qcyIsIi4uL3NwYXJrLXN0YXJ0ZXIvbGliL3NwYXJrLXN0YXJ0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgQXV0b21hdGljRG9vciwgQ2hhcmFjdGVyLCBEb29yO1xuXG5Eb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XG5cbkNoYXJhY3RlciA9IHJlcXVpcmUoJy4vQ2hhcmFjdGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0b21hdGljRG9vciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXV0b21hdGljRG9vciBleHRlbmRzIERvb3Ige1xuICAgIHVwZGF0ZVRpbGVNZW1iZXJzKG9sZCkge1xuICAgICAgdmFyIHJlZiwgcmVmMSwgcmVmMiwgcmVmMztcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYucmVtb3ZlUmVmKCd1bmxvY2tlZCcsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYxLnJlbW92ZVJlZignb3BlbicsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICAgIGlmICgocmVmMiA9IHRoaXMudGlsZS53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYyLmFkZFByb3BlcnR5UmVmKCd1bmxvY2tlZCcsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAocmVmMyA9IHRoaXMudGlsZS50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwgPyByZWYzLmFkZFByb3BlcnR5UmVmKCdvcGVuJywgdGhpcykgOiB2b2lkIDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHN1cGVyLmluaXQoKTtcbiAgICAgIHJldHVybiB0aGlzLm9wZW47XG4gICAgfVxuXG4gICAgaXNBY3RpdmF0b3JQcmVzZW50KGludmFsaWRhdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlYWN0aXZlVGlsZXMoaW52YWxpZGF0ZSkuc29tZSgodGlsZSkgPT4ge1xuICAgICAgICB2YXIgY2hpbGRyZW47XG4gICAgICAgIGNoaWxkcmVuID0gaW52YWxpZGF0ZSA/IGludmFsaWRhdGUucHJvcCgnY2hpbGRyZW4nLCB0aWxlKSA6IHRpbGUuY2hpbGRyZW47XG4gICAgICAgIHJldHVybiBjaGlsZHJlbi5zb21lKChjaGlsZCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNhbkJlQWN0aXZhdGVkQnkoY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbkJlQWN0aXZhdGVkQnkoZWxlbSkge1xuICAgICAgcmV0dXJuIGVsZW0gaW5zdGFuY2VvZiBDaGFyYWN0ZXI7XG4gICAgfVxuXG4gICAgZ2V0UmVhY3RpdmVUaWxlcyhpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgZGlyZWN0aW9uLCB0aWxlO1xuICAgICAgdGlsZSA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AoJ3RpbGUnKSA6IHRoaXMudGlsZTtcbiAgICAgIGlmICghdGlsZSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICBkaXJlY3Rpb24gPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKCdkaXJlY3Rpb24nKSA6IHRoaXMuZGlyZWN0aW9uO1xuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gRG9vci5kaXJlY3Rpb25zLmhvcml6b250YWwpIHtcbiAgICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgwLCAxKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMCwgLTEpXS5maWx0ZXIoZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgxLCAwKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoLTEsIDApXS5maWx0ZXIoZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEF1dG9tYXRpY0Rvb3IucHJvcGVydGllcyh7XG4gICAgb3Blbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHJldHVybiAhaW52YWxpZGF0ZS5wcm9wKCdsb2NrZWQnKSAmJiB0aGlzLmlzQWN0aXZhdG9yUHJlc2VudChpbnZhbGlkYXRlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxvY2tlZDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHVubG9ja2VkOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRlLnByb3AoJ2xvY2tlZCcpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEF1dG9tYXRpY0Rvb3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQXV0b21hdGljRG9vci5qcy5tYXBcbiIsInZhciBDaGFyYWN0ZXIsIERhbWFnZWFibGUsIFRpbGVkLCBXYWxrQWN0aW9uO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxuRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpO1xuXG5XYWxrQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL1dhbGtBY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENoYXJhY3RlciBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICBzZXREZWZhdWx0cygpIHtcbiAgICAgIGlmICghdGhpcy50aWxlICYmICh0aGlzLmdhbWUubWFpblRpbGVDb250YWluZXIgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHV0T25SYW5kb21UaWxlKHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lci50aWxlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FuR29PblRpbGUodGlsZSkge1xuICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwgPyB0aWxlLndhbGthYmxlIDogdm9pZCAwKSAhPT0gZmFsc2U7XG4gICAgfVxuXG4gICAgd2Fsa1RvKHRpbGUpIHtcbiAgICAgIHZhciBhY3Rpb247XG4gICAgICBhY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzLFxuICAgICAgICB0YXJnZXQ6IHRpbGVcbiAgICAgIH0pO1xuICAgICAgYWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgIHJldHVybiBhY3Rpb247XG4gICAgfVxuXG4gICAgaXNTZWxlY3RhYmxlQnkocGxheWVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgfTtcblxuICBDaGFyYWN0ZXIuZXh0ZW5kKERhbWFnZWFibGUpO1xuXG4gIENoYXJhY3Rlci5wcm9wZXJ0aWVzKHtcbiAgICBnYW1lOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGVmYXVsdHMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgb2Zmc2V0WDoge1xuICAgICAgZGVmYXVsdDogMC41XG4gICAgfSxcbiAgICBvZmZzZXRZOiB7XG4gICAgICBkZWZhdWx0OiAwLjVcbiAgICB9LFxuICAgIGRlZmF1bHRBY3Rpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgICAgYWN0b3I6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhdmFpbGFibGVBY3Rpb25zOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgdGlsZTtcbiAgICAgICAgdGlsZSA9IGludmFsaWRhdG9yLnByb3AoXCJ0aWxlXCIpO1xuICAgICAgICBpZiAodGlsZSkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKFwicHJvdmlkZWRBY3Rpb25zXCIsIHRpbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENoYXJhY3RlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9DaGFyYWN0ZXIuanMubWFwXG4iLCJ2YXIgQXR0YWNrTW92ZUFjdGlvbiwgQ2hhcmFjdGVyQUksIERvb3IsIFByb3BlcnR5V2F0Y2hlciwgVGlsZUNvbnRhaW5lciwgVmlzaW9uQ2FsY3VsYXRvciwgV2Fsa0FjdGlvbjtcblxuVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyO1xuXG5WaXNpb25DYWxjdWxhdG9yID0gcmVxdWlyZSgnLi9WaXNpb25DYWxjdWxhdG9yJyk7XG5cbkRvb3IgPSByZXF1aXJlKCcuL0Rvb3InKTtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9XYWxrQWN0aW9uJyk7XG5cbkF0dGFja01vdmVBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvbicpO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlckFJID0gY2xhc3MgQ2hhcmFjdGVyQUkge1xuICBjb25zdHJ1Y3RvcihjaGFyYWN0ZXIpIHtcbiAgICB0aGlzLmNoYXJhY3RlciA9IGNoYXJhY3RlcjtcbiAgICB0aGlzLm5leHRBY3Rpb25DYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLm5leHRBY3Rpb24oKTtcbiAgICB9O1xuICAgIHRoaXMudmlzaW9uTWVtb3J5ID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICB0aGlzLnRpbGVXYXRjaGVyID0gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVWaXNpb25NZW1vcnkoKTtcbiAgICAgIH0sXG4gICAgICBwcm9wZXJ0eTogdGhpcy5jaGFyYWN0ZXIuZ2V0UHJvcGVydHlJbnN0YW5jZSgndGlsZScpXG4gICAgfSk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLnRpbGVXYXRjaGVyLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aW9uKCk7XG4gIH1cblxuICBuZXh0QWN0aW9uKCkge1xuICAgIHZhciBlbm5lbXksIHVuZXhwbG9yZWQ7XG4gICAgdGhpcy51cGRhdGVWaXNpb25NZW1vcnkoKTtcbiAgICBpZiAoZW5uZW15ID0gdGhpcy5nZXRDbG9zZXN0RW5lbXkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYXR0YWNrTW92ZVRvKGVubmVteSkub24oJ2VuZCcsIG5leHRBY3Rpb25DYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh1bmV4cGxvcmVkID0gdGhpcy5nZXRDbG9zZXN0VW5leHBsb3JlZCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrVG8odW5leHBsb3JlZCkub24oJ2VuZCcsIG5leHRBY3Rpb25DYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzZXRWaXNpb25NZW1vcnkoKTtcbiAgICAgIHJldHVybiB0aGlzLndhbGtUbyh0aGlzLmdldENsb3Nlc3RVbmV4cGxvcmVkKCkpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZpc2lvbk1lbW9yeSgpIHtcbiAgICB2YXIgY2FsY3VsYXRvcjtcbiAgICBjYWxjdWxhdG9yID0gbmV3IFZpc2lvbkNhbGN1bGF0b3IodGhpcy5jaGFyYWN0ZXIudGlsZSk7XG4gICAgY2FsY3VsYXRvci5jYWxjdWwoKTtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkgPSBjYWxjdWxhdG9yLnRvQ29udGFpbmVyKCkubWVyZ2UodGhpcy52aXNpb25NZW1vcnksIChhLCBiKSA9PiB7XG4gICAgICBpZiAoYSAhPSBudWxsKSB7XG4gICAgICAgIGEgPSB0aGlzLmFuYWx5emVUaWxlKGEpO1xuICAgICAgfVxuICAgICAgaWYgKChhICE9IG51bGwpICYmIChiICE9IG51bGwpKSB7XG4gICAgICAgIGEudmlzaWJpbGl0eSA9IE1hdGgubWF4KGEudmlzaWJpbGl0eSwgYi52aXNpYmlsaXR5KTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYSB8fCBiO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYW5hbHl6ZVRpbGUodGlsZSkge1xuICAgIHZhciByZWY7XG4gICAgdGlsZS5lbm5lbXlTcG90dGVkID0gKHJlZiA9IHRpbGUuZ2V0RmluYWxUaWxlKCkuY2hpbGRyZW4pICE9IG51bGwgPyByZWYuZmluZCgoYykgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaXNFbm5lbXkoYyk7XG4gICAgfSkgOiB2b2lkIDA7XG4gICAgdGlsZS5leHBsb3JhYmxlID0gdGhpcy5pc0V4cGxvcmFibGUodGlsZSk7XG4gICAgcmV0dXJuIHRpbGU7XG4gIH1cblxuICBpc0VubmVteShlbGVtKSB7XG4gICAgdmFyIHJlZjtcbiAgICByZXR1cm4gKHJlZiA9IHRoaXMuY2hhcmFjdGVyLm93bmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5pc0VuZW15ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuaXNFbmVteShlbGVtKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgfVxuXG4gIGdldENsb3Nlc3RFbmVteSgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkuY2xvc2VzdCh0aGlzLmNoYXJhY3Rlci50aWxlLCAodCkgPT4ge1xuICAgICAgcmV0dXJuIHQuZW5uZW15U3BvdHRlZDtcbiAgICB9KTtcbiAgfVxuXG4gIGdldENsb3Nlc3RVbmV4cGxvcmVkKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2lvbk1lbW9yeS5jbG9zZXN0KHRoaXMuY2hhcmFjdGVyLnRpbGUsICh0KSA9PiB7XG4gICAgICByZXR1cm4gdC52aXNpYmlsaXR5IDwgMSAmJiB0LmV4cGxvcmFibGU7XG4gICAgfSk7XG4gIH1cblxuICBpc0V4cGxvcmFibGUodGlsZSkge1xuICAgIHZhciByZWY7XG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgcmV0dXJuIHRpbGUud2Fsa2FibGUgfHwgKChyZWYgPSB0aWxlLmNoaWxkcmVuKSAhPSBudWxsID8gcmVmLmZpbmQoKGMpID0+IHtcbiAgICAgIHJldHVybiBjIGluc3RhbmNlb2YgRG9vcjtcbiAgICB9KSA6IHZvaWQgMCk7XG4gIH1cblxuICBhdHRhY2tNb3ZlVG8odGlsZSkge1xuICAgIHZhciBhY3Rpb247XG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgYWN0aW9uID0gbmV3IEF0dGFja01vdmVBY3Rpb24oe1xuICAgICAgYWN0b3I6IHRoaXMuY2hhcmFjdGVyLFxuICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgfSk7XG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5leGVjdXRlKCk7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH1cbiAgfVxuXG4gIHdhbGtUbyh0aWxlKSB7XG4gICAgdmFyIGFjdGlvbjtcbiAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICBhY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICBhY3RvcjogdGhpcy5jaGFyYWN0ZXIsXG4gICAgICB0YXJnZXQ6IHRpbGVcbiAgICB9KTtcbiAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgYWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgIHJldHVybiBhY3Rpb247XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQ2hhcmFjdGVyQUkuanMubWFwXG4iLCJ2YXIgRGFtYWdlUHJvcGFnYXRpb24sIERpcmVjdGlvbiwgRWxlbWVudCwgTGluZU9mU2lnaHQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL0xpbmVPZlNpZ2h0Jyk7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gRGFtYWdlUHJvcGFnYXRpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIERhbWFnZVByb3BhZ2F0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZXRUaWxlQ29udGFpbmVyKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZS5jb250YWluZXI7XG4gICAgfVxuXG4gICAgYXBwbHkoKSB7XG4gICAgICB2YXIgZGFtYWdlLCBpLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuZ2V0RGFtYWdlZCgpO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRhbWFnZSA9IHJlZltpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGRhbWFnZS50YXJnZXQuZGFtYWdlKGRhbWFnZS5kYW1hZ2UpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGdldEluaXRpYWxUaWxlcygpIHtcbiAgICAgIHZhciBjdG47XG4gICAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKTtcbiAgICAgIHJldHVybiBjdG4uaW5SYW5nZSh0aGlzLnRpbGUsIHRoaXMucmFuZ2UpO1xuICAgIH1cblxuICAgIGdldEluaXRpYWxEYW1hZ2VzKCkge1xuICAgICAgdmFyIGRhbWFnZXMsIGRtZywgaSwgbGVuLCB0aWxlLCB0aWxlcztcbiAgICAgIGRhbWFnZXMgPSBbXTtcbiAgICAgIHRpbGVzID0gdGhpcy5nZXRJbml0aWFsVGlsZXMoKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHRpbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlc1tpXTtcbiAgICAgICAgaWYgKHRpbGUuZGFtYWdlYWJsZSAmJiAoZG1nID0gdGhpcy5pbml0aWFsRGFtYWdlKHRpbGUsIHRpbGVzLmxlbmd0aCkpKSB7XG4gICAgICAgICAgZGFtYWdlcy5wdXNoKGRtZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkYW1hZ2VzO1xuICAgIH1cblxuICAgIGdldERhbWFnZWQoKSB7XG4gICAgICB2YXIgYWRkZWQ7XG4gICAgICBpZiAodGhpcy5fZGFtYWdlZCA9PSBudWxsKSB7XG4gICAgICAgIGFkZGVkID0gbnVsbDtcbiAgICAgICAgd2hpbGUgKGFkZGVkID0gdGhpcy5zdGVwKGFkZGVkKSkge1xuICAgICAgICAgIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9kYW1hZ2VkO1xuICAgIH1cblxuICAgIHN0ZXAoYWRkZWQpIHtcbiAgICAgIGlmIChhZGRlZCAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmV4dGVuZGVkRGFtYWdlICE9IG51bGwpIHtcbiAgICAgICAgICBhZGRlZCA9IHRoaXMuZXh0ZW5kKGFkZGVkKTtcbiAgICAgICAgICB0aGlzLl9kYW1hZ2VkID0gYWRkZWQuY29uY2F0KHRoaXMuX2RhbWFnZWQpO1xuICAgICAgICAgIHJldHVybiBhZGRlZC5sZW5ndGggPiAwICYmIGFkZGVkO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZCA9IHRoaXMuZ2V0SW5pdGlhbERhbWFnZXMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbkRhbWFnZWQodGFyZ2V0LCBkYW1hZ2VkKSB7XG4gICAgICB2YXIgZGFtYWdlLCBpLCBpbmRleCwgbGVuO1xuICAgICAgZm9yIChpbmRleCA9IGkgPSAwLCBsZW4gPSBkYW1hZ2VkLmxlbmd0aDsgaSA8IGxlbjsgaW5kZXggPSArK2kpIHtcbiAgICAgICAgZGFtYWdlID0gZGFtYWdlZFtpbmRleF07XG4gICAgICAgIGlmIChkYW1hZ2UudGFyZ2V0ID09PSB0YXJnZXQpIHtcbiAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBleHRlbmQoZGFtYWdlZCkge1xuICAgICAgdmFyIGFkZGVkLCBjdG4sIGRhbWFnZSwgZGlyLCBkbWcsIGV4aXN0aW5nLCBpLCBqLCBrLCBsZW4sIGxlbjEsIGxlbjIsIGxvY2FsLCByZWYsIHRhcmdldCwgdGlsZTtcbiAgICAgIGN0biA9IHRoaXMuZ2V0VGlsZUNvbnRhaW5lcigpO1xuICAgICAgYWRkZWQgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGRhbWFnZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGFtYWdlID0gZGFtYWdlZFtpXTtcbiAgICAgICAgbG9jYWwgPSBbXTtcbiAgICAgICAgaWYgKGRhbWFnZS50YXJnZXQueCAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmID0gRGlyZWN0aW9uLmFkamFjZW50cztcbiAgICAgICAgICBmb3IgKGogPSAwLCBsZW4xID0gcmVmLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICAgICAgZGlyID0gcmVmW2pdO1xuICAgICAgICAgICAgdGlsZSA9IGN0bi5nZXRUaWxlKGRhbWFnZS50YXJnZXQueCArIGRpci54LCBkYW1hZ2UudGFyZ2V0LnkgKyBkaXIueSk7XG4gICAgICAgICAgICBpZiAoKHRpbGUgIT0gbnVsbCkgJiYgdGlsZS5kYW1hZ2VhYmxlICYmIHRoaXMuaW5EYW1hZ2VkKHRpbGUsIHRoaXMuX2RhbWFnZWQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICBsb2NhbC5wdXNoKHRpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGsgPSAwLCBsZW4yID0gbG9jYWwubGVuZ3RoOyBrIDwgbGVuMjsgaysrKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gbG9jYWxba107XG4gICAgICAgICAgaWYgKGRtZyA9IHRoaXMuZXh0ZW5kZWREYW1hZ2UodGFyZ2V0LCBkYW1hZ2UsIGxvY2FsLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIGlmICgoZXhpc3RpbmcgPSB0aGlzLmluRGFtYWdlZCh0YXJnZXQsIGFkZGVkKSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGFkZGVkLnB1c2goZG1nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFkZGVkW2V4aXN0aW5nXSA9IHRoaXMubWVyZ2VEYW1hZ2UoYWRkZWRbZXhpc3RpbmddLCBkbWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFkZGVkO1xuICAgIH1cblxuICAgIG1lcmdlRGFtYWdlKGQxLCBkMikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICAgIHBvd2VyOiBkMS5wb3dlciArIGQyLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGQxLmRhbWFnZSArIGQyLmRhbWFnZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcikge1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXQubW9kaWZ5RGFtYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRhcmdldC5tb2RpZnlEYW1hZ2UocG93ZXIsIHRoaXMudHlwZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIERhbWFnZVByb3BhZ2F0aW9uLnByb3BlcnRpZXMoe1xuICAgIHRpbGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgcmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICB9LFxuICAgIHR5cGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBEYW1hZ2VQcm9wYWdhdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuRGFtYWdlUHJvcGFnYXRpb24uTm9ybWFsID0gY2xhc3MgTm9ybWFsIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBpbml0aWFsRGFtYWdlKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgdGhpcy5wb3dlcik7XG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbn07XG5cbkRhbWFnZVByb3BhZ2F0aW9uLlRoZXJtaWMgPSBjbGFzcyBUaGVybWljIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBleHRlbmRlZERhbWFnZSh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXI7XG4gICAgcG93ZXIgPSAobGFzdC5kYW1hZ2UgLSAxKSAvIDIgLyBuYiAqIE1hdGgubWluKDEsIGxhc3QudGFyZ2V0LmhlYWx0aCAvIGxhc3QudGFyZ2V0Lm1heEhlYWx0aCAqIDUpO1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsRGFtYWdlKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlcjtcbiAgICBwb3dlciA9IHRoaXMucG93ZXIgLyBuYjtcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbn07XG5cbkRhbWFnZVByb3BhZ2F0aW9uLktpbmV0aWMgPSBjbGFzcyBLaW5ldGljIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBleHRlbmRlZERhbWFnZSh0YXJnZXQsIGxhc3QsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXI7XG4gICAgcG93ZXIgPSAobGFzdC5wb3dlciAtIGxhc3QuZGFtYWdlKSAqIE1hdGgubWluKDEsIGxhc3QudGFyZ2V0LmhlYWx0aCAvIGxhc3QudGFyZ2V0Lm1heEhlYWx0aCAqIDIpIC0gMTtcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW5pdGlhbERhbWFnZSh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZztcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHRoaXMucG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIG1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKSB7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQubW9kaWZ5RGFtYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih0YXJnZXQubW9kaWZ5RGFtYWdlKHBvd2VyLCB0aGlzLnR5cGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIgKiAwLjI1KTtcbiAgICB9XG4gIH1cblxuICBtZXJnZURhbWFnZShkMSwgZDIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiBkMS50YXJnZXQsXG4gICAgICBwb3dlcjogTWF0aC5mbG9vcigoZDEucG93ZXIgKyBkMi5wb3dlcikgLyAyKSxcbiAgICAgIGRhbWFnZTogTWF0aC5mbG9vcigoZDEuZGFtYWdlICsgZDIuZGFtYWdlKSAvIDIpXG4gICAgfTtcbiAgfVxuXG59O1xuXG5EYW1hZ2VQcm9wYWdhdGlvbi5FeHBsb3NpdmUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEV4cGxvc2l2ZSBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgICBnZXREYW1hZ2VkKCkge1xuICAgICAgdmFyIGFuZ2xlLCBpLCBpbnNpZGUsIHJlZiwgc2hhcmQsIHNoYXJkUG93ZXIsIHNoYXJkcywgdGFyZ2V0O1xuICAgICAgdGhpcy5fZGFtYWdlZCA9IFtdO1xuICAgICAgc2hhcmRzID0gTWF0aC5wb3codGhpcy5yYW5nZSArIDEsIDIpO1xuICAgICAgc2hhcmRQb3dlciA9IHRoaXMucG93ZXIgLyBzaGFyZHM7XG4gICAgICBpbnNpZGUgPSB0aGlzLnRpbGUuaGVhbHRoIDw9IHRoaXMubW9kaWZ5RGFtYWdlKHRoaXMudGlsZSwgc2hhcmRQb3dlcik7XG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHNoYXJkUG93ZXIgKj0gNDtcbiAgICAgIH1cbiAgICAgIGZvciAoc2hhcmQgPSBpID0gMCwgcmVmID0gc2hhcmRzOyAoMCA8PSByZWYgPyBpIDw9IHJlZiA6IGkgPj0gcmVmKTsgc2hhcmQgPSAwIDw9IHJlZiA/ICsraSA6IC0taSkge1xuICAgICAgICBhbmdsZSA9IHRoaXMucm5nKCkgKiBNYXRoLlBJICogMjtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUaWxlSGl0QnlTaGFyZChpbnNpZGUsIGFuZ2xlKTtcbiAgICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZGFtYWdlZC5wdXNoKHtcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgICAgcG93ZXI6IHNoYXJkUG93ZXIsXG4gICAgICAgICAgICBkYW1hZ2U6IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgc2hhcmRQb3dlcilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2RhbWFnZWQ7XG4gICAgfVxuXG4gICAgZ2V0VGlsZUhpdEJ5U2hhcmQoaW5zaWRlLCBhbmdsZSkge1xuICAgICAgdmFyIGN0biwgZGlzdCwgdGFyZ2V0LCB2ZXJ0ZXg7XG4gICAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKTtcbiAgICAgIGRpc3QgPSB0aGlzLnJhbmdlICogdGhpcy5ybmcoKTtcbiAgICAgIHRhcmdldCA9IHtcbiAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUgKyBkaXN0ICogTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNSArIGRpc3QgKiBNYXRoLnNpbihhbmdsZSlcbiAgICAgIH07XG4gICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgIHZlcnRleCA9IG5ldyBMaW5lT2ZTaWdodChjdG4sIHRoaXMudGlsZS54ICsgMC41LCB0aGlzLnRpbGUueSArIDAuNSwgdGFyZ2V0LngsIHRhcmdldC55KTtcbiAgICAgICAgdmVydGV4LnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSAodGlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiAhaW5zaWRlIHx8ICgodGlsZSAhPSBudWxsKSAmJiB0aGlzLnRyYXZlcnNhYmxlQ2FsbGJhY2sodGlsZSkpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdmVydGV4LmdldEVuZFBvaW50KCkudGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjdG4uZ2V0VGlsZShNYXRoLmZsb29yKHRhcmdldC54KSwgTWF0aC5mbG9vcih0YXJnZXQueSkpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEV4cGxvc2l2ZS5wcm9wZXJ0aWVzKHtcbiAgICBybmc6IHtcbiAgICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gICAgfSxcbiAgICB0cmF2ZXJzYWJsZUNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgIHJldHVybiAhKHR5cGVvZiB0aWxlLmdldFNvbGlkID09PSAnZnVuY3Rpb24nICYmIHRpbGUuZ2V0U29saWQoKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRXhwbG9zaXZlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0RhbWFnZVByb3BhZ2F0aW9uLmpzLm1hcFxuIiwidmFyIERhbWFnZWFibGUsIEVsZW1lbnQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBEYW1hZ2VhYmxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBEYW1hZ2VhYmxlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgZGFtYWdlKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuaGVhbHRoID0gTWF0aC5tYXgoMCwgdGhpcy5oZWFsdGggLSB2YWwpO1xuICAgIH1cblxuICAgIHdoZW5Ob0hlYWx0aCgpIHt9XG5cbiAgfTtcblxuICBEYW1hZ2VhYmxlLnByb3BlcnRpZXMoe1xuICAgIGRhbWFnZWFibGU6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIG1heEhlYWx0aDoge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgaGVhbHRoOiB7XG4gICAgICBkZWZhdWx0OiAxMDAwLFxuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53aGVuTm9IZWFsdGgoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIERhbWFnZWFibGU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRGFtYWdlYWJsZS5qcy5tYXBcbiIsInZhciBEb29yLCBUaWxlZDtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gRG9vciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRG9vciBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihkaXJlY3Rpb24gPSBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIH1cblxuICAgIHVwZGF0ZVRpbGVNZW1iZXJzKG9sZCkge1xuICAgICAgdmFyIHJlZiwgcmVmMSwgcmVmMiwgcmVmMztcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYucmVtb3ZlUmVmKCdvcGVuJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYxID0gb2xkLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZjEucmVtb3ZlUmVmKCdvcGVuJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnRpbGUpIHtcbiAgICAgICAgaWYgKChyZWYyID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZjIuYWRkUHJvcGVydHlSZWYoJ29wZW4nLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHJlZjMgPSB0aGlzLnRpbGUudHJhbnNwYXJlbnRNZW1iZXJzKSAhPSBudWxsID8gcmVmMy5hZGRQcm9wZXJ0eVJlZignb3BlbicsIHRoaXMpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIERvb3IucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVGlsZU1lbWJlcnMob2xkKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9wZW46IHtcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBkaXJlY3Rpb246IHt9XG4gIH0pO1xuXG4gIERvb3IuZGlyZWN0aW9ucyA9IHtcbiAgICBob3Jpem9udGFsOiAnaG9yaXpvbnRhbCcsXG4gICAgdmVydGljYWw6ICd2ZXJ0aWNhbCdcbiAgfTtcblxuICByZXR1cm4gRG9vcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Eb29yLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbGVtZW50LmpzLm1hcFxuIiwidmFyIEZsb29yLCBUaWxlO1xuXG5UaWxlID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGU7XG5cbm1vZHVsZS5leHBvcnRzID0gRmxvb3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEZsb29yIGV4dGVuZHMgVGlsZSB7fTtcblxuICBGbG9vci5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrYWJsZToge1xuICAgICAgY29tcG9zZWQ6IHRydWVcbiAgICB9LFxuICAgIHRyYW5zcGFyZW50OiB7XG4gICAgICBjb21wb3NlZDogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEZsb29yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0Zsb29yLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIEdhbWUsIFBsYXllciwgVGltaW5nLCBWaWV3O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cblZpZXcgPSByZXF1aXJlKCcuL1ZpZXcnKTtcblxuUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHYW1lIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgc3RhcnQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50UGxheWVyO1xuICAgIH1cblxuICAgIGFkZChlbGVtKSB7XG4gICAgICBlbGVtLmdhbWUgPSB0aGlzO1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgfVxuXG4gIH07XG5cbiAgR2FtZS5wcm9wZXJ0aWVzKHtcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtYWluVmlldzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudmlld3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdzLmdldCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGQobmV3IHRoaXMuZGVmYXVsdFZpZXdDbGFzcygpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdmlld3M6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9LFxuICAgIGN1cnJlbnRQbGF5ZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnBsYXllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBsYXllcnMuZ2V0KDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkZChuZXcgdGhpcy5kZWZhdWx0UGxheWVyQ2xhc3MoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBsYXllcnM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIEdhbWUucHJvdG90eXBlLmRlZmF1bHRWaWV3Q2xhc3MgPSBWaWV3O1xuXG4gIEdhbWUucHJvdG90eXBlLmRlZmF1bHRQbGF5ZXJDbGFzcyA9IFBsYXllcjtcblxuICByZXR1cm4gR2FtZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9HYW1lLmpzLm1hcFxuIiwidmFyIExpbmVPZlNpZ2h0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVPZlNpZ2h0ID0gY2xhc3MgTGluZU9mU2lnaHQge1xuICBjb25zdHJ1Y3Rvcih0aWxlcywgeDEgPSAwLCB5MSA9IDAsIHgyID0gMCwgeTIgPSAwKSB7XG4gICAgdGhpcy50aWxlcyA9IHRpbGVzO1xuICAgIHRoaXMueDEgPSB4MTtcbiAgICB0aGlzLnkxID0geTE7XG4gICAgdGhpcy54MiA9IHgyO1xuICAgIHRoaXMueTIgPSB5MjtcbiAgfVxuXG4gIHNldFgxKHZhbCkge1xuICAgIHRoaXMueDEgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgc2V0WTEodmFsKSB7XG4gICAgdGhpcy55MSA9IHZhbDtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKCk7XG4gIH1cblxuICBzZXRYMih2YWwpIHtcbiAgICB0aGlzLngyID0gdmFsO1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKTtcbiAgfVxuXG4gIHNldFkyKHZhbCkge1xuICAgIHRoaXMueTIgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgaW52YWxpZGFkZSgpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0gbnVsbDtcbiAgICB0aGlzLnN1Y2Nlc3MgPSBudWxsO1xuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHRlc3RUaWxlKHRpbGUsIGVudHJ5WCwgZW50cnlZKSB7XG4gICAgaWYgKHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUsIGVudHJ5WCwgZW50cnlZKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aWxlICE9IG51bGwpICYmICh0eXBlb2YgdGlsZS5nZXRUcmFuc3BhcmVudCA9PT0gJ2Z1bmN0aW9uJyA/IHRpbGUuZ2V0VHJhbnNwYXJlbnQoKSA6IHR5cGVvZiB0aWxlLnRyYW5zcGFyZW50ICE9PSB2b2lkIDAgPyB0aWxlLnRyYW5zcGFyZW50IDogdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgdGVzdFRpbGVBdCh4LCB5LCBlbnRyeVgsIGVudHJ5WSkge1xuICAgIHJldHVybiB0aGlzLnRlc3RUaWxlKHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHgpLCBNYXRoLmZsb29yKHkpKSwgZW50cnlYLCBlbnRyeVkpO1xuICB9XG5cbiAgcmV2ZXJzZVRyYWNpbmcoKSB7XG4gICAgdmFyIHRtcFgsIHRtcFk7XG4gICAgdG1wWCA9IHRoaXMueDE7XG4gICAgdG1wWSA9IHRoaXMueTE7XG4gICAgdGhpcy54MSA9IHRoaXMueDI7XG4gICAgdGhpcy55MSA9IHRoaXMueTI7XG4gICAgdGhpcy54MiA9IHRtcFg7XG4gICAgdGhpcy55MiA9IHRtcFk7XG4gICAgcmV0dXJuIHRoaXMucmV2ZXJzZWQgPSAhdGhpcy5yZXZlcnNlZDtcbiAgfVxuXG4gIGNhbGN1bCgpIHtcbiAgICB2YXIgbmV4dFgsIG5leHRZLCBwb3NpdGl2ZVgsIHBvc2l0aXZlWSwgcmF0aW8sIHRpbGVYLCB0aWxlWSwgdG90YWwsIHgsIHk7XG4gICAgcmF0aW8gPSAodGhpcy54MiAtIHRoaXMueDEpIC8gKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICB0b3RhbCA9IE1hdGguYWJzKHRoaXMueDIgLSB0aGlzLngxKSArIE1hdGguYWJzKHRoaXMueTIgLSB0aGlzLnkxKTtcbiAgICBwb3NpdGl2ZVggPSAodGhpcy54MiAtIHRoaXMueDEpID49IDA7XG4gICAgcG9zaXRpdmVZID0gKHRoaXMueTIgLSB0aGlzLnkxKSA+PSAwO1xuICAgIHRpbGVYID0geCA9IHRoaXMueDE7XG4gICAgdGlsZVkgPSB5ID0gdGhpcy55MTtcbiAgICBpZiAodGhpcy5yZXZlcnNlZCkge1xuICAgICAgdGlsZVggPSBwb3NpdGl2ZVggPyB4IDogTWF0aC5jZWlsKHgpIC0gMTtcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDE7XG4gICAgfVxuICAgIHdoaWxlICh0b3RhbCA+IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSAmJiB0aGlzLnRlc3RUaWxlQXQodGlsZVgsIHRpbGVZLCB4LCB5KSkge1xuICAgICAgbmV4dFggPSBwb3NpdGl2ZVggPyBNYXRoLmZsb29yKHgpICsgMSA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICBuZXh0WSA9IHBvc2l0aXZlWSA/IE1hdGguZmxvb3IoeSkgKyAxIDogTWF0aC5jZWlsKHkpIC0gMTtcbiAgICAgIGlmICh0aGlzLngyIC0gdGhpcy54MSA9PT0gMCkge1xuICAgICAgICB5ID0gbmV4dFk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMueTIgLSB0aGlzLnkxID09PSAwKSB7XG4gICAgICAgIHggPSBuZXh0WDtcbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoKG5leHRYIC0geCkgLyAodGhpcy54MiAtIHRoaXMueDEpKSA8IE1hdGguYWJzKChuZXh0WSAtIHkpIC8gKHRoaXMueTIgLSB0aGlzLnkxKSkpIHtcbiAgICAgICAgeCA9IG5leHRYO1xuICAgICAgICB5ID0gKG5leHRYIC0gdGhpcy54MSkgLyByYXRpbyArIHRoaXMueTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4ID0gKG5leHRZIC0gdGhpcy55MSkgKiByYXRpbyArIHRoaXMueDE7XG4gICAgICAgIHkgPSBuZXh0WTtcbiAgICAgIH1cbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICB0aWxlWSA9IHBvc2l0aXZlWSA/IHkgOiBNYXRoLmNlaWwoeSkgLSAxO1xuICAgIH1cbiAgICBpZiAodG90YWwgPD0gTWF0aC5hYnMoeCAtIHRoaXMueDEpICsgTWF0aC5hYnMoeSAtIHRoaXMueTEpKSB7XG4gICAgICB0aGlzLmVuZFBvaW50ID0ge1xuICAgICAgICB4OiB0aGlzLngyLFxuICAgICAgICB5OiB0aGlzLnkyLFxuICAgICAgICB0aWxlOiB0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih0aGlzLngyKSwgTWF0aC5mbG9vcih0aGlzLnkyKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGlsZVgpLCBNYXRoLmZsb29yKHRpbGVZKSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5zdWNjZXNzID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yY2VTdWNjZXNzKCkge1xuICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICB4OiB0aGlzLngyLFxuICAgICAgeTogdGhpcy55MixcbiAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRoaXMueDIpLCBNYXRoLmZsb29yKHRoaXMueTIpKVxuICAgIH07XG4gICAgdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGdldFN1Y2Nlc3MoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3M7XG4gIH1cblxuICBnZXRFbmRQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5jYWxjdWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5kUG9pbnQ7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9MaW5lT2ZTaWdodC5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBNYXA7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXAgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE1hcCBleHRlbmRzIEVsZW1lbnQge307XG5cbiAgTWFwLnByb3BlcnRpZXMoe1xuICAgIGxvY2F0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjoge1xuICAgICAgICBjbG9zZXN0OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgdmFyIG1pbiwgbWluRGlzdDtcbiAgICAgICAgICBtaW4gPSBudWxsO1xuICAgICAgICAgIG1pbkRpc3QgPSBudWxsO1xuICAgICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgICAgICAgICAgdmFyIGRpc3Q7XG4gICAgICAgICAgICBkaXN0ID0gbG9jYXRpb24uZGlzdCh4LCB5KTtcbiAgICAgICAgICAgIGlmICgobWluID09IG51bGwpIHx8IG1pbkRpc3QgPiBkaXN0KSB7XG4gICAgICAgICAgICAgIG1pbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICByZXR1cm4gbWluRGlzdCA9IGRpc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG1pbjtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2VzdHM6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICB2YXIgZGlzdHM7XG4gICAgICAgICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZGlzdDogbG9jYXRpb24uZGlzdCh4LCB5KSxcbiAgICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRpc3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdCAtIGIuZGlzdDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5KGRpc3RzLm1hcChmdW5jdGlvbihkaXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlzdC5sb2NhdGlvbjtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBNYXA7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvTWFwLmpzLm1hcFxuIiwidmFyIE9ic3RhY2xlLCBUaWxlZDtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JzdGFjbGUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE9ic3RhY2xlIGV4dGVuZHMgVGlsZWQge1xuICAgIHVwZGF0ZVdhbGthYmxlcyhvbGQpIHtcbiAgICAgIHZhciByZWYsIHJlZjE7XG4gICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgaWYgKChyZWYgPSBvbGQud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmLnJlbW92ZVJlZignd2Fsa2FibGUnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICByZXR1cm4gKHJlZjEgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsID8gcmVmMS5zZXRWYWx1ZVJlZihmYWxzZSwgJ3dhbGthYmxlJywgdGhpcykgOiB2b2lkIDA7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT2JzdGFjbGUucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQsIG92ZXJyaWRlZCkge1xuICAgICAgICBvdmVycmlkZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlV2Fsa2FibGVzKG9sZCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gT2JzdGFjbGU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvT2JzdGFjbGUuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgRXZlbnRFbWl0dGVyLCBQYXRoV2FsaywgVGltaW5nO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUGF0aFdhbGsgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBhdGhXYWxrIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iod2Fsa2VyLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy53YWxrZXIgPSB3YWxrZXI7XG4gICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgaWYgKCF0aGlzLnBhdGguc29sdXRpb24pIHtcbiAgICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGF0aC5zb2x1dGlvbikge1xuICAgICAgICB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKCk7XG4gICAgICAgIH0sIHRoaXMudG90YWxUaW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aFRpbWVvdXQudXBkYXRlci5hZGRDYWxsYmFjayh0aGlzLmNhbGxiYWNrKCd1cGRhdGUnKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0LnBhdXNlKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgdmFyIHBvcztcbiAgICAgIHBvcyA9IHRoaXMucGF0aC5nZXRQb3NBdFByYyh0aGlzLnBhdGhUaW1lb3V0LmdldFByYygpKTtcbiAgICAgIHRoaXMud2Fsa2VyLnRpbGUgPSBwb3MudGlsZTtcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFggPSBwb3Mub2Zmc2V0WDtcbiAgICAgIHJldHVybiB0aGlzLndhbGtlci5vZmZzZXRZID0gcG9zLm9mZnNldFk7XG4gICAgfVxuXG4gICAgZmluaXNoKCkge1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIHRoaXMudHJpZ2dlcignZmluaXNoZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGludGVycnVwdCgpIHtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2ludGVycnVwdGVkJyk7XG4gICAgICByZXR1cm4gdGhpcy5lbmQoKTtcbiAgICB9XG5cbiAgICBlbmQoKSB7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2VuZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy53YWxrZXIud2FsayA9PT0gdGhpcykge1xuICAgICAgICB0aGlzLndhbGtlci53YWxrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMucGF0aFRpbWVvdXQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5kZXN0cm95UHJvcGVydGllcygpO1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aFdhbGsuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBQYXRoV2Fsay5wcm9wZXJ0aWVzKHtcbiAgICBzcGVlZDoge1xuICAgICAgZGVmYXVsdDogNVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcGF0aExlbmd0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aC5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG90YWxUaW1lOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoTGVuZ3RoIC8gdGhpcy5zcGVlZCAqIDEwMDA7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUGF0aFdhbGs7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUGF0aFdhbGsuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTGluZU9mU2lnaHQsIFBlcnNvbmFsV2VhcG9uLCBUaW1pbmc7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTGluZU9mU2lnaHQgPSByZXF1aXJlKCcuL0xpbmVPZlNpZ2h0Jyk7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uYWxXZWFwb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBlcnNvbmFsV2VhcG9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBjYW5CZVVzZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VkO1xuICAgIH1cblxuICAgIGNhblVzZU9uKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FuVXNlRnJvbSh0aGlzLnVzZXIudGlsZSwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBjYW5Vc2VGcm9tKHRpbGUsIHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMucmFuZ2UgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pblJhbmdlKHRpbGUsIHRhcmdldCkgJiYgdGhpcy5oYXNMaW5lT2ZTaWdodCh0aWxlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluUmFuZ2UodGlsZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmLCB0YXJnZXRUaWxlO1xuICAgICAgdGFyZ2V0VGlsZSA9IHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgIHJldHVybiAoKHJlZiA9IHRpbGUuZGlzdCh0YXJnZXRUaWxlKSkgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApIDw9IHRoaXMucmFuZ2U7XG4gICAgfVxuXG4gICAgaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIHRhcmdldFRpbGU7XG4gICAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0O1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHRhcmdldFRpbGUueCAtIHRpbGUueCkgKyBNYXRoLmFicyh0YXJnZXRUaWxlLnkgLSB0aWxlLnkpID09PSAxO1xuICAgIH1cblxuICAgIGhhc0xpbmVPZlNpZ2h0KHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIGxvcywgdGFyZ2V0VGlsZTtcbiAgICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXQ7XG4gICAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGFyZ2V0VGlsZS5jb250YWluZXIsIHRpbGUueCArIDAuNSwgdGlsZS55ICsgMC41LCB0YXJnZXRUaWxlLnggKyAwLjUsIHRhcmdldFRpbGUueSArIDAuNSk7XG4gICAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHRpbGUud2Fsa2FibGU7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGxvcy5nZXRTdWNjZXNzKCk7XG4gICAgfVxuXG4gICAgdXNlT24odGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5jYW5CZVVzZWQoKSkge1xuICAgICAgICB0YXJnZXQuZGFtYWdlKHRoaXMucG93ZXIpO1xuICAgICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWNoYXJnZSgpIHtcbiAgICAgIHRoaXMuY2hhcmdpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJnaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlZCgpO1xuICAgICAgfSwgdGhpcy5yZWNoYXJnZVRpbWUpO1xuICAgIH1cblxuICAgIHJlY2hhcmdlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJnZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy5jaGFyZ2VUaW1lb3V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJnZVRpbWVvdXQuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFBlcnNvbmFsV2VhcG9uLnByb3BlcnRpZXMoe1xuICAgIHJlY2hhcmdlVGltZToge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgY2hhcmdlZDoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY2hhcmdpbmc6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgZHBzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdwb3dlcicpIC8gaW52YWxpZGF0b3IucHJvcCgncmVjaGFyZ2VUaW1lJykgKiAxMDAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICB1c2VyOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUGVyc29uYWxXZWFwb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUGVyc29uYWxXZWFwb24uanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgRXZlbnRFbWl0dGVyLCBQbGF5ZXI7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBsYXllciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgZmlyc3Q7XG4gICAgICBmaXJzdCA9IHRoaXMuZ2FtZS5wbGF5ZXJzLmxlbmd0aCA9PT0gMDtcbiAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJzLmFkZCh0aGlzKTtcbiAgICAgIGlmIChmaXJzdCAmJiAhdGhpcy5jb250cm9sbGVyICYmIHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgdGhpcy5nYW1lLmRlZmF1bHRQbGF5ZXJDb250cm9sbGVyQ2xhc3MoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5UYXJnZXRBY3Rpb25PbihlbGVtKSB7XG4gICAgICB2YXIgYWN0aW9uLCByZWY7XG4gICAgICBhY3Rpb24gPSB0aGlzLnNlbGVjdGVkQWN0aW9uIHx8ICgocmVmID0gdGhpcy5zZWxlY3RlZCkgIT0gbnVsbCA/IHJlZi5kZWZhdWx0QWN0aW9uIDogdm9pZCAwKTtcbiAgICAgIHJldHVybiAoYWN0aW9uICE9IG51bGwpICYmIHR5cGVvZiBhY3Rpb24uY2FuVGFyZ2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgYWN0aW9uLmNhblRhcmdldChlbGVtKTtcbiAgICB9XG5cbiAgICBjYW5TZWxlY3QoZWxlbSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBlbGVtLmlzU2VsZWN0YWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIgJiYgZWxlbS5pc1NlbGVjdGFibGVCeSh0aGlzKTtcbiAgICB9XG5cbiAgICBjYW5Gb2N1c09uKGVsZW0pIHtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5Jc0ZvY3VzYWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uSXNGb2N1c2FibGVCeSh0aGlzKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0uSXNTZWxlY3RhYmxlQnkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gZWxlbS5Jc1NlbGVjdGFibGVCeSh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRBY3Rpb25UYXJnZXQoZWxlbSkge1xuICAgICAgdmFyIGFjdGlvbiwgcmVmO1xuICAgICAgYWN0aW9uID0gdGhpcy5zZWxlY3RlZEFjdGlvbiB8fCAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYuZGVmYXVsdEFjdGlvbiA6IHZvaWQgMCk7XG4gICAgICBhY3Rpb24gPSBhY3Rpb24ud2l0aFRhcmdldChlbGVtKTtcbiAgICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICAgIGFjdGlvbi5zdGFydCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFjdGlvbiA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBQbGF5ZXIuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuICBQbGF5ZXIucHJvcGVydGllcyh7XG4gICAgbmFtZToge1xuICAgICAgZGVmYXVsdDogJ1BsYXllcidcbiAgICB9LFxuICAgIGZvY3VzZWQ6IHt9LFxuICAgIHNlbGVjdGVkOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICBpZiAob2xkICE9IG51bGwgPyBvbGQuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICBvbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJykgOiB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNlbGVjdGVkQWN0aW9uOiB7fSxcbiAgICBjb250cm9sbGVyOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sbGVyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29udHJvbGxlci5wbGF5ZXIgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBnYW1lOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGVmYXVsdHMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFBsYXllcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9QbGF5ZXIuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgUHJvamVjdGlsZSwgVGltaW5nO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdGlsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUHJvamVjdGlsZSBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIGxhdW5jaCgpIHtcbiAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVsaXZlclBheWxvYWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICB9LCB0aGlzLnBhdGhMZW5ndGggLyB0aGlzLnNwZWVkICogMTAwMCk7XG4gICAgfVxuXG4gICAgZGVsaXZlclBheWxvYWQoKSB7XG4gICAgICB2YXIgcGF5bG9hZDtcbiAgICAgIHBheWxvYWQgPSBuZXcgdGhpcy5wcm9wYWdhdGlvblR5cGUoe1xuICAgICAgICB0aWxlOiB0aGlzLnRhcmdldC50aWxlIHx8IHRoaXMudGFyZ2V0LFxuICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgcmFuZ2U6IHRoaXMuYmxhc3RSYW5nZVxuICAgICAgfSk7XG4gICAgICBwYXlsb2FkLmFwcGx5KCk7XG4gICAgICB0aGlzLnBheWxvYWREZWxpdmVyZWQoKTtcbiAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH1cblxuICAgIHBheWxvYWREZWxpdmVyZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgUHJvamVjdGlsZS5wcm9wZXJ0aWVzKHtcbiAgICBvcmlnaW46IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcG93ZXI6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICBibGFzdFJhbmdlOiB7XG4gICAgICBkZWZhdWx0OiAxXG4gICAgfSxcbiAgICBwcm9wYWdhdGlvblR5cGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHNwZWVkOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgcGF0aExlbmd0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpc3Q7XG4gICAgICAgIGlmICgodGhpcy5vcmlnaW5UaWxlICE9IG51bGwpICYmICh0aGlzLnRhcmdldFRpbGUgIT0gbnVsbCkpIHtcbiAgICAgICAgICBkaXN0ID0gdGhpcy5vcmlnaW5UaWxlLmRpc3QodGhpcy50YXJnZXRUaWxlKTtcbiAgICAgICAgICBpZiAoZGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc3QubGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3JpZ2luVGlsZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgb3JpZ2luO1xuICAgICAgICBvcmlnaW4gPSBpbnZhbGlkYXRvci5wcm9wKCdvcmlnaW4nKTtcbiAgICAgICAgaWYgKG9yaWdpbiAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbi50aWxlIHx8IG9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGFyZ2V0VGlsZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgdGFyZ2V0O1xuICAgICAgICB0YXJnZXQgPSBpbnZhbGlkYXRvci5wcm9wKCd0YXJnZXQnKTtcbiAgICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIG9yaWdpblRpbGUsIHRhcmdldFRpbGU7XG4gICAgICAgIG9yaWdpblRpbGUgPSBpbnZhbGlkYXRlLnByb3AoJ29yaWdpblRpbGUnKTtcbiAgICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCgndGFyZ2V0VGlsZScpO1xuICAgICAgICBpZiAob3JpZ2luVGlsZS5jb250YWluZXIgPT09IHRhcmdldFRpbGUuY29udGFpbmVyKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpblRpbGUuY29udGFpbmVyO1xuICAgICAgICB9IGVsc2UgaWYgKGludmFsaWRhdGUucHJvcCgncHJjUGF0aCcpID4gMC41KSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFRpbGUuY29udGFpbmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5UaWxlLmNvbnRhaW5lcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBzdGFydFBvcztcbiAgICAgICAgc3RhcnRQb3MgPSBpbnZhbGlkYXRlLnByb3AoJ3N0YXJ0UG9zJyk7XG4gICAgICAgIHJldHVybiAoaW52YWxpZGF0ZS5wcm9wKCd0YXJnZXRQb3MnKS54IC0gc3RhcnRQb3MueCkgKiBpbnZhbGlkYXRlLnByb3AoJ3ByY1BhdGgnKSArIHN0YXJ0UG9zLng7XG4gICAgICB9XG4gICAgfSxcbiAgICB5OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIHN0YXJ0UG9zO1xuICAgICAgICBzdGFydFBvcyA9IGludmFsaWRhdGUucHJvcCgnc3RhcnRQb3MnKTtcbiAgICAgICAgcmV0dXJuIChpbnZhbGlkYXRlLnByb3AoJ3RhcmdldFBvcycpLnkgLSBzdGFydFBvcy55KSAqIGludmFsaWRhdGUucHJvcCgncHJjUGF0aCcpICsgc3RhcnRQb3MueTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0UG9zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGUpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciwgZGlzdCwgb2Zmc2V0LCBvcmlnaW5UaWxlO1xuICAgICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKCdvcmlnaW5UaWxlJyk7XG4gICAgICAgIGNvbnRhaW5lciA9IGludmFsaWRhdGUucHJvcCgnY29udGFpbmVyJyk7XG4gICAgICAgIG9mZnNldCA9IHRoaXMuc3RhcnRPZmZzZXQ7XG4gICAgICAgIGlmIChvcmlnaW5UaWxlLmNvbnRhaW5lciAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgZGlzdCA9IGNvbnRhaW5lci5kaXN0KG9yaWdpblRpbGUuY29udGFpbmVyKTtcbiAgICAgICAgICBvZmZzZXQueCArPSBkaXN0Lng7XG4gICAgICAgICAgb2Zmc2V0LnkgKz0gZGlzdC55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogb3JpZ2luVGlsZS54ICsgb2Zmc2V0LngsXG4gICAgICAgICAgeTogb3JpZ2luVGlsZS55ICsgb2Zmc2V0LnlcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldFBvczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBjb250YWluZXIsIGRpc3QsIG9mZnNldCwgdGFyZ2V0VGlsZTtcbiAgICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCgndGFyZ2V0VGlsZScpO1xuICAgICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AoJ2NvbnRhaW5lcicpO1xuICAgICAgICBvZmZzZXQgPSB0aGlzLnRhcmdldE9mZnNldDtcbiAgICAgICAgaWYgKHRhcmdldFRpbGUuY29udGFpbmVyICE9PSBjb250YWluZXIpIHtcbiAgICAgICAgICBkaXN0ID0gY29udGFpbmVyLmRpc3QodGFyZ2V0VGlsZS5jb250YWluZXIpO1xuICAgICAgICAgIG9mZnNldC54ICs9IGRpc3QueDtcbiAgICAgICAgICBvZmZzZXQueSArPSBkaXN0Lnk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiB0YXJnZXRUaWxlLnggKyBvZmZzZXQueCxcbiAgICAgICAgICB5OiB0YXJnZXRUaWxlLnkgKyBvZmZzZXQueVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRPZmZzZXQ6IHtcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgeDogMC41LFxuICAgICAgICB5OiAwLjVcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldE9mZnNldDoge1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB4OiAwLjUsXG4gICAgICAgIHk6IDAuNVxuICAgICAgfSxcbiAgICAgIG91dHB1dDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcHJjUGF0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgcmV0dXJuICgocmVmID0gdGhpcy5wYXRoVGltZW91dCkgIT0gbnVsbCA/IHJlZi5nZXRQcmMoKSA6IHZvaWQgMCkgfHwgMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmluZzoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBQcm9qZWN0aWxlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb2plY3RpbGUuanMubWFwXG4iLCJ2YXIgRGlyZWN0aW9uLCBEb29yLCBFbGVtZW50LCBSb29tR2VuZXJhdG9yLCBUaWxlLCBUaWxlQ29udGFpbmVyLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5UaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXI7XG5cblRpbGUgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZTtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvbjtcblxuRG9vciA9IHJlcXVpcmUoJy4vRG9vcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb21HZW5lcmF0b3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFJvb21HZW5lcmF0b3IgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGluaXRUaWxlcygpIHtcbiAgICAgIHRoaXMuZmluYWxUaWxlcyA9IG51bGw7XG4gICAgICB0aGlzLnJvb21zID0gW107XG4gICAgICByZXR1cm4gdGhpcy5mcmVlID0gdGhpcy50aWxlQ29udGFpbmVyLmFsbFRpbGVzKCkuZmlsdGVyKCh0aWxlKSA9PiB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24sIGssIGxlbiwgbmV4dCwgcmVmO1xuICAgICAgICByZWYgPSBEaXJlY3Rpb24uYWxsO1xuICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICBkaXJlY3Rpb24gPSByZWZba107XG4gICAgICAgICAgbmV4dCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSk7XG4gICAgICAgICAgaWYgKG5leHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbGN1bCgpIHtcbiAgICAgIHZhciBpO1xuICAgICAgdGhpcy5pbml0VGlsZXMoKTtcbiAgICAgIGkgPSAwO1xuICAgICAgd2hpbGUgKHRoaXMuc3RlcCgpIHx8IHRoaXMubmV3Um9vbSgpKSB7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JlYXRlRG9vcnMoKTtcbiAgICAgIHRoaXMucm9vbXM7XG4gICAgICByZXR1cm4gdGhpcy5tYWtlRmluYWxUaWxlcygpO1xuICAgIH1cblxuICAgIG1ha2VGaW5hbFRpbGVzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmluYWxUaWxlcyA9IHRoaXMudGlsZUNvbnRhaW5lci5hbGxUaWxlcygpLm1hcCgodGlsZSkgPT4ge1xuICAgICAgICB2YXIgb3B0O1xuICAgICAgICBpZiAodGlsZS5mYWN0b3J5ICE9IG51bGwpIHtcbiAgICAgICAgICBvcHQgPSB7XG4gICAgICAgICAgICB4OiB0aWxlLngsXG4gICAgICAgICAgICB5OiB0aWxlLnlcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0aWxlLmZhY3RvcnlPcHRpb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24ob3B0LCB0aWxlLmZhY3RvcnlPcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRpbGUuZmFjdG9yeShvcHQpO1xuICAgICAgICB9XG4gICAgICB9KS5maWx0ZXIoKHRpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHRpbGUgIT0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFRpbGVzKCkge1xuICAgICAgaWYgKHRoaXMuZmluYWxUaWxlcyA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5maW5hbFRpbGVzO1xuICAgIH1cblxuICAgIG5ld1Jvb20oKSB7XG4gICAgICBpZiAodGhpcy5mcmVlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnZvbHVtZSA9IE1hdGguZmxvb3IodGhpcy5ybmcoKSAqICh0aGlzLm1heFZvbHVtZSAtIHRoaXMubWluVm9sdW1lKSkgKyB0aGlzLm1pblZvbHVtZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vbSA9IG5ldyBSb29tR2VuZXJhdG9yLlJvb20oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByYW5kb21EaXJlY3Rpb25zKCkge1xuICAgICAgdmFyIGksIGosIG8sIHg7XG4gICAgICBvID0gRGlyZWN0aW9uLmFkamFjZW50cy5zbGljZSgpO1xuICAgICAgaiA9IHZvaWQgMDtcbiAgICAgIHggPSB2b2lkIDA7XG4gICAgICBpID0gby5sZW5ndGg7XG4gICAgICB3aGlsZSAoaSkge1xuICAgICAgICBqID0gTWF0aC5mbG9vcih0aGlzLnJuZygpICogaSk7XG4gICAgICAgIHggPSBvWy0taV07XG4gICAgICAgIG9baV0gPSBvW2pdO1xuICAgICAgICBvW2pdID0geDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvO1xuICAgIH1cblxuICAgIHN0ZXAoKSB7XG4gICAgICB2YXIgc3VjY2VzcywgdHJpZXM7XG4gICAgICBpZiAodGhpcy5yb29tKSB7XG4gICAgICAgIGlmICh0aGlzLmZyZWUubGVuZ3RoICYmIHRoaXMucm9vbS50aWxlcy5sZW5ndGggPCB0aGlzLnZvbHVtZSAtIDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5yb29tLnRpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdHJpZXMgPSB0aGlzLnJhbmRvbURpcmVjdGlvbnMoKTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHdoaWxlICh0cmllcy5sZW5ndGggJiYgIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuZXhwYW5kKHRoaXMucm9vbSwgdHJpZXMucG9wKCksIHRoaXMudm9sdW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgICB0aGlzLnJvb21Eb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUodGhpcy5yYW5kb21GcmVlVGlsZSgpLCB0aGlzLnJvb20pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucm9vbURvbmUoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByb29tRG9uZSgpIHtcbiAgICAgIHRoaXMucm9vbXMucHVzaCh0aGlzLnJvb20pO1xuICAgICAgdGhpcy5hbGxvY2F0ZVdhbGxzKHRoaXMucm9vbSk7XG4gICAgICByZXR1cm4gdGhpcy5yb29tID0gbnVsbDtcbiAgICB9XG5cbiAgICBleHBhbmQocm9vbSwgZGlyZWN0aW9uLCBtYXggPSAwKSB7XG4gICAgICB2YXIgaywgbGVuLCBuZXh0LCByZWYsIHNlY29uZCwgc3VjY2VzcywgdGlsZTtcbiAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgIHJlZiA9IHJvb20udGlsZXM7XG4gICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgdGlsZSA9IHJlZltrXTtcbiAgICAgICAgaWYgKG1heCA9PT0gMCB8fCByb29tLnRpbGVzLmxlbmd0aCA8IG1heCkge1xuICAgICAgICAgIGlmIChuZXh0ID0gdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbikpIHtcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKG5leHQsIHJvb20pO1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoc2Vjb25kID0gdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgMikpICYmICF0aGlzLnRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uLCAzKSkge1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUoc2Vjb25kLCByb29tKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgIH1cblxuICAgIGFsbG9jYXRlV2FsbHMocm9vbSkge1xuICAgICAgdmFyIGRpcmVjdGlvbiwgaywgbGVuLCBuZXh0LCBuZXh0Um9vbSwgb3RoZXJTaWRlLCByZWYsIHJlc3VsdHMsIHRpbGU7XG4gICAgICByZWYgPSByb29tLnRpbGVzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgIHRpbGUgPSByZWZba107XG4gICAgICAgIHJlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGwsIGxlbjEsIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlZjEgPSBEaXJlY3Rpb24uYWxsO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChsID0gMCwgbGVuMSA9IHJlZjEubGVuZ3RoOyBsIDwgbGVuMTsgbCsrKSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSByZWYxW2xdO1xuICAgICAgICAgICAgbmV4dCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSk7XG4gICAgICAgICAgICBpZiAoKG5leHQgIT0gbnVsbCkgJiYgbmV4dC5yb29tICE9PSByb29tKSB7XG4gICAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwoRGlyZWN0aW9uLmNvcm5lcnMsIGRpcmVjdGlvbikgPCAwKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJTaWRlID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUodGlsZS54ICsgZGlyZWN0aW9uLnggKiAyLCB0aWxlLnkgKyBkaXJlY3Rpb24ueSAqIDIpO1xuICAgICAgICAgICAgICAgIG5leHRSb29tID0gKG90aGVyU2lkZSAhPSBudWxsID8gb3RoZXJTaWRlLnJvb20gOiB2b2lkIDApICE9IG51bGwgPyBvdGhlclNpZGUucm9vbSA6IG51bGw7XG4gICAgICAgICAgICAgICAgcm9vbS5hZGRXYWxsKG5leHQsIG5leHRSb29tKTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dFJvb20gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgbmV4dFJvb20uYWRkV2FsbChuZXh0LCByb29tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbmV4dC5mYWN0b3J5ID0gdGhpcy53YWxsRmFjdG9yeTtcbiAgICAgICAgICAgICAgcmVzdWx0czEucHVzaCh0aGlzLmFsbG9jYXRlVGlsZShuZXh0KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzMTtcbiAgICAgICAgfSkuY2FsbCh0aGlzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBjcmVhdGVEb29ycygpIHtcbiAgICAgIHZhciBkb29yLCBrLCBsZW4sIHJlZiwgcmVzdWx0cywgcm9vbSwgd2FsbHM7XG4gICAgICByZWYgPSB0aGlzLnJvb21zO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgIHJvb20gPSByZWZba107XG4gICAgICAgIHJlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGwsIGxlbjEsIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlZjEgPSByb29tLndhbGxzQnlSb29tcygpO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChsID0gMCwgbGVuMSA9IHJlZjEubGVuZ3RoOyBsIDwgbGVuMTsgbCsrKSB7XG4gICAgICAgICAgICB3YWxscyA9IHJlZjFbbF07XG4gICAgICAgICAgICBpZiAoKHdhbGxzLnJvb20gIT0gbnVsbCkgJiYgcm9vbS5kb29yc0ZvclJvb20od2FsbHMucm9vbSkgPCAxKSB7XG4gICAgICAgICAgICAgIGRvb3IgPSB3YWxscy50aWxlc1tNYXRoLmZsb29yKHRoaXMucm5nKCkgKiB3YWxscy50aWxlcy5sZW5ndGgpXTtcbiAgICAgICAgICAgICAgZG9vci5mYWN0b3J5ID0gdGhpcy5kb29yRmFjdG9yeTtcbiAgICAgICAgICAgICAgZG9vci5mYWN0b3J5T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKGRvb3IueCArIDEsIGRvb3IueSkuZmFjdG9yeSA9PT0gdGhpcy5mbG9vckZhY3RvcnkgPyBEb29yLmRpcmVjdGlvbnMudmVydGljYWwgOiBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByb29tLmFkZERvb3IoZG9vciwgd2FsbHMucm9vbSk7XG4gICAgICAgICAgICAgIHJlc3VsdHMxLnB1c2god2FsbHMucm9vbS5hZGREb29yKGRvb3IsIHJvb20pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMxLnB1c2godm9pZCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KS5jYWxsKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFsbG9jYXRlVGlsZSh0aWxlLCByb29tID0gbnVsbCkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaWYgKHJvb20gIT0gbnVsbCkge1xuICAgICAgICByb29tLmFkZFRpbGUodGlsZSk7XG4gICAgICAgIHRpbGUuZmFjdG9yeSA9IHRoaXMuZmxvb3JGYWN0b3J5O1xuICAgICAgfVxuICAgICAgaW5kZXggPSB0aGlzLmZyZWUuaW5kZXhPZih0aWxlKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZyZWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgbXVsdGlwbHkgPSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy50aWxlSXNGcmVlKHRpbGUueCArIGRpcmVjdGlvbi54ICogbXVsdGlwbHksIHRpbGUueSArIGRpcmVjdGlvbi55ICogbXVsdGlwbHkpO1xuICAgIH1cblxuICAgIHRpbGVJc0ZyZWUoeCwgeSkge1xuICAgICAgdmFyIHRpbGU7XG4gICAgICB0aWxlID0gdGhpcy50aWxlQ29udGFpbmVyLmdldFRpbGUoeCwgeSk7XG4gICAgICBpZiAoKHRpbGUgIT0gbnVsbCkgJiYgaW5kZXhPZi5jYWxsKHRoaXMuZnJlZSwgdGlsZSkgPj0gMCkge1xuICAgICAgICByZXR1cm4gdGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByYW5kb21GcmVlVGlsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmZyZWVbTWF0aC5mbG9vcih0aGlzLnJuZygpICogdGhpcy5mcmVlLmxlbmd0aCldO1xuICAgIH1cblxuICB9O1xuXG4gIFJvb21HZW5lcmF0b3IucHJvcGVydGllcyh7XG4gICAgcm5nOiB7XG4gICAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICAgIH0sXG4gICAgbWF4Vm9sdW1lOiB7XG4gICAgICBkZWZhdWx0OiAyNVxuICAgIH0sXG4gICAgbWluVm9sdW1lOiB7XG4gICAgICBkZWZhdWx0OiA1MFxuICAgIH0sXG4gICAgd2lkdGg6IHtcbiAgICAgIGRlZmF1bHQ6IDMwXG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGRlZmF1bHQ6IDE1XG4gICAgfSxcbiAgICB0aWxlQ29udGFpbmVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaywgbCwgcmVmLCByZWYxLCB0aWxlcywgeCwgeTtcbiAgICAgICAgdGlsZXMgPSBuZXcgVGlsZUNvbnRhaW5lcigpO1xuICAgICAgICBmb3IgKHggPSBrID0gMCwgcmVmID0gdGhpcy53aWR0aDsgKDAgPD0gcmVmID8gayA8PSByZWYgOiBrID49IHJlZik7IHggPSAwIDw9IHJlZiA/ICsrayA6IC0taykge1xuICAgICAgICAgIGZvciAoeSA9IGwgPSAwLCByZWYxID0gdGhpcy5oZWlnaHQ7ICgwIDw9IHJlZjEgPyBsIDw9IHJlZjEgOiBsID49IHJlZjEpOyB5ID0gMCA8PSByZWYxID8gKytsIDogLS1sKSB7XG4gICAgICAgICAgICB0aWxlcy5hZGRUaWxlKG5ldyBUaWxlKHgsIHkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmxvb3JGYWN0b3J5OiB7XG4gICAgICBkZWZhdWx0OiBmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG9wdC54LCBvcHQueSk7XG4gICAgICB9XG4gICAgfSxcbiAgICB3YWxsRmFjdG9yeToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgZG9vckZhY3Rvcnk6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb29yRmFjdG9yeTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBSb29tR2VuZXJhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5Sb29tR2VuZXJhdG9yLlJvb20gPSBjbGFzcyBSb29tIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50aWxlcyA9IFtdO1xuICAgIHRoaXMud2FsbHMgPSBbXTtcbiAgICB0aGlzLmRvb3JzID0gW107XG4gIH1cblxuICBhZGRUaWxlKHRpbGUpIHtcbiAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgcmV0dXJuIHRpbGUucm9vbSA9IHRoaXM7XG4gIH1cblxuICBjb250YWluc1dhbGwodGlsZSkge1xuICAgIHZhciBrLCBsZW4sIHJlZiwgd2FsbDtcbiAgICByZWYgPSB0aGlzLndhbGxzO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgd2FsbCA9IHJlZltrXTtcbiAgICAgIGlmICh3YWxsLnRpbGUgPT09IHRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHdhbGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFkZFdhbGwodGlsZSwgbmV4dFJvb20pIHtcbiAgICB2YXIgZXhpc3Rpbmc7XG4gICAgZXhpc3RpbmcgPSB0aGlzLmNvbnRhaW5zV2FsbCh0aWxlKTtcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIHJldHVybiBleGlzdGluZy5uZXh0Um9vbSA9IG5leHRSb29tO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxscy5wdXNoKHtcbiAgICAgICAgdGlsZTogdGlsZSxcbiAgICAgICAgbmV4dFJvb206IG5leHRSb29tXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB3YWxsc0J5Um9vbXMoKSB7XG4gICAgdmFyIGssIGxlbiwgcG9zLCByZWYsIHJlcywgcm9vbXMsIHdhbGw7XG4gICAgcm9vbXMgPSBbXTtcbiAgICByZXMgPSBbXTtcbiAgICByZWYgPSB0aGlzLndhbGxzO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgd2FsbCA9IHJlZltrXTtcbiAgICAgIHBvcyA9IHJvb21zLmluZGV4T2Yod2FsbC5uZXh0Um9vbSk7XG4gICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICBwb3MgPSByb29tcy5sZW5ndGg7XG4gICAgICAgIHJvb21zLnB1c2god2FsbC5uZXh0Um9vbSk7XG4gICAgICAgIHJlcy5wdXNoKHtcbiAgICAgICAgICByb29tOiB3YWxsLm5leHRSb29tLFxuICAgICAgICAgIHRpbGVzOiBbXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJlc1twb3NdLnRpbGVzLnB1c2god2FsbC50aWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGFkZERvb3IodGlsZSwgbmV4dFJvb20pIHtcbiAgICByZXR1cm4gdGhpcy5kb29ycy5wdXNoKHtcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICBuZXh0Um9vbTogbmV4dFJvb21cbiAgICB9KTtcbiAgfVxuXG4gIGRvb3JzRm9yUm9vbShyb29tKSB7XG4gICAgdmFyIGRvb3IsIGssIGxlbiwgcmVmLCByZXM7XG4gICAgcmVzID0gW107XG4gICAgcmVmID0gdGhpcy5kb29ycztcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIGRvb3IgPSByZWZba107XG4gICAgICBpZiAoZG9vci5uZXh0Um9vbSA9PT0gcm9vbSkge1xuICAgICAgICByZXMucHVzaChkb29yLnRpbGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUm9vbUdlbmVyYXRvci5qcy5tYXBcbiIsInZhciBEYW1hZ2VhYmxlLCBQcm9qZWN0aWxlLCBTaGlwV2VhcG9uLCBUaWxlZCwgVGltaW5nO1xuXG5UaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZDtcblxuVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKTtcblxuRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpO1xuXG5Qcm9qZWN0aWxlID0gcmVxdWlyZSgnLi9Qcm9qZWN0aWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFdlYXBvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2hpcFdlYXBvbiBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICB2YXIgcHJvamVjdGlsZTtcbiAgICAgIGlmICh0aGlzLmNhbkZpcmUpIHtcbiAgICAgICAgcHJvamVjdGlsZSA9IG5ldyBQcm9qZWN0aWxlKHtcbiAgICAgICAgICBvcmlnaW46IHRoaXMsXG4gICAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgICBwb3dlcjogdGhpcy5wb3dlcixcbiAgICAgICAgICBibGFzdFJhbmdlOiB0aGlzLmJsYXN0UmFuZ2UsXG4gICAgICAgICAgcHJvcGFnYXRpb25UeXBlOiB0aGlzLnByb3BhZ2F0aW9uVHlwZSxcbiAgICAgICAgICBzcGVlZDogdGhpcy5wcm9qZWN0aWxlU3BlZWQsXG4gICAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvamVjdGlsZS5sYXVuY2goKTtcbiAgICAgICAgdGhpcy5jaGFyZ2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVjaGFyZ2UoKTtcbiAgICAgICAgcmV0dXJuIHByb2plY3RpbGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVjaGFyZ2UoKSB7XG4gICAgICB0aGlzLmNoYXJnaW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJnZVRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jaGFyZ2luZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZWQoKTtcbiAgICAgIH0sIHRoaXMucmVjaGFyZ2VUaW1lKTtcbiAgICB9XG5cbiAgICByZWNoYXJnZWQoKSB7XG4gICAgICB0aGlzLmNoYXJnZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMuYXV0b0ZpcmUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFNoaXBXZWFwb24uZXh0ZW5kKERhbWFnZWFibGUpO1xuXG4gIFNoaXBXZWFwb24ucHJvcGVydGllcyh7XG4gICAgcmVjaGFyZ2VUaW1lOiB7XG4gICAgICBkZWZhdWx0OiAxMDAwXG4gICAgfSxcbiAgICBwb3dlcjoge1xuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIGJsYXN0UmFuZ2U6IHtcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICB9LFxuICAgIHByb3BhZ2F0aW9uVHlwZToge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgcHJvamVjdGlsZVNwZWVkOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgdGFyZ2V0OiB7XG4gICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0ZpcmUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maXJlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNoYXJnZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGNoYXJnaW5nOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBlbmFibGVkOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBhdXRvRmlyZToge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgY3JpdGljYWxIZWFsdGg6IHtcbiAgICAgIGRlZmF1bHQ6IDAuM1xuICAgIH0sXG4gICAgY2FuRmlyZToge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0ICYmIHRoaXMuZW5hYmxlZCAmJiB0aGlzLmNoYXJnZWQgJiYgdGhpcy5oZWFsdGggLyB0aGlzLm1heEhlYWx0aCA+PSB0aGlzLmNyaXRpY2FsSGVhbHRoO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNoaXBXZWFwb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvU2hpcFdlYXBvbi5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBTdGFyO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU3RhciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHg1LCB5NSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMueCA9IHg1O1xuICAgICAgdGhpcy55ID0geTU7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge31cblxuICAgIGxpbmtUbyhzdGFyKSB7XG4gICAgICBpZiAoIXRoaXMubGlua3MuZmluZFN0YXIoc3RhcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkTGluayhuZXcgdGhpcy5jb25zdHJ1Y3Rvci5MaW5rKHRoaXMsIHN0YXIpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMaW5rKGxpbmspIHtcbiAgICAgIHRoaXMubGlua3MuYWRkKGxpbmspO1xuICAgICAgbGluay5vdGhlclN0YXIodGhpcykubGlua3MuYWRkKGxpbmspO1xuICAgICAgcmV0dXJuIGxpbms7XG4gICAgfVxuXG4gICAgZGlzdCh4LCB5KSB7XG4gICAgICB2YXIgeERpc3QsIHlEaXN0O1xuICAgICAgeERpc3QgPSB0aGlzLnggLSB4O1xuICAgICAgeURpc3QgPSB0aGlzLnkgLSB5O1xuICAgICAgcmV0dXJuIE1hdGguc3FydCgoeERpc3QgKiB4RGlzdCkgKyAoeURpc3QgKiB5RGlzdCkpO1xuICAgIH1cblxuICB9O1xuXG4gIFN0YXIucHJvcGVydGllcyh7XG4gICAgeDoge30sXG4gICAgeToge30sXG4gICAgbGlua3M6IHtcbiAgICAgIGNvbGxlY3Rpb246IHtcbiAgICAgICAgZmluZFN0YXI6IGZ1bmN0aW9uKHN0YXIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maW5kKGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgICAgIHJldHVybiBsaW5rLnN0YXIyID09PSBzdGFyIHx8IGxpbmsuc3RhcjEgPT09IHN0YXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIFN0YXIuY29sbGVuY3Rpb25GbiA9IHtcbiAgICBjbG9zZXN0OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB2YXIgbWluLCBtaW5EaXN0O1xuICAgICAgbWluID0gbnVsbDtcbiAgICAgIG1pbkRpc3QgPSBudWxsO1xuICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXIpIHtcbiAgICAgICAgdmFyIGRpc3Q7XG4gICAgICAgIGRpc3QgPSBzdGFyLmRpc3QoeCwgeSk7XG4gICAgICAgIGlmICgobWluID09IG51bGwpIHx8IG1pbkRpc3QgPiBkaXN0KSB7XG4gICAgICAgICAgbWluID0gc3RhcjtcbiAgICAgICAgICByZXR1cm4gbWluRGlzdCA9IGRpc3Q7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1pbjtcbiAgICB9LFxuICAgIGNsb3Nlc3RzOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB2YXIgZGlzdHM7XG4gICAgICBkaXN0cyA9IHRoaXMubWFwKGZ1bmN0aW9uKHN0YXIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkaXN0OiBzdGFyLmRpc3QoeCwgeSksXG4gICAgICAgICAgc3Rhcjogc3RhclxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBkaXN0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuZGlzdCAtIGIuZGlzdDtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuY29weShkaXN0cy5tYXAoZnVuY3Rpb24oZGlzdCkge1xuICAgICAgICByZXR1cm4gZGlzdC5zdGFyO1xuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhcjtcblxufSkuY2FsbCh0aGlzKTtcblxuU3Rhci5MaW5rID0gY2xhc3MgTGluayBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihzdGFyMSwgc3RhcjIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhcjEgPSBzdGFyMTtcbiAgICB0aGlzLnN0YXIyID0gc3RhcjI7XG4gIH1cblxuICByZW1vdmUoKSB7XG4gICAgdGhpcy5zdGFyMS5saW5rcy5yZW1vdmUodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMuc3RhcjIubGlua3MucmVtb3ZlKHRoaXMpO1xuICB9XG5cbiAgb3RoZXJTdGFyKHN0YXIpIHtcbiAgICBpZiAoc3RhciA9PT0gdGhpcy5zdGFyMSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcjI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXIxO1xuICAgIH1cbiAgfVxuXG4gIGdldExlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFyMS5kaXN0KHRoaXMuc3RhcjIueCwgdGhpcy5zdGFyMi55KTtcbiAgfVxuXG4gIGluQm91bmRhcnlCb3goeCwgeSwgcGFkZGluZyA9IDApIHtcbiAgICB2YXIgeDEsIHgyLCB5MSwgeTI7XG4gICAgeDEgPSBNYXRoLm1pbih0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgLSBwYWRkaW5nO1xuICAgIHkxID0gTWF0aC5taW4odGhpcy5zdGFyMS55LCB0aGlzLnN0YXIyLnkpIC0gcGFkZGluZztcbiAgICB4MiA9IE1hdGgubWF4KHRoaXMuc3RhcjEueCwgdGhpcy5zdGFyMi54KSArIHBhZGRpbmc7XG4gICAgeTIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLnksIHRoaXMuc3RhcjIueSkgKyBwYWRkaW5nO1xuICAgIHJldHVybiB4ID49IHgxICYmIHggPD0geDIgJiYgeSA+PSB5MSAmJiB5IDw9IHkyO1xuICB9XG5cbiAgY2xvc2VUb1BvaW50KHgsIHksIG1pbkRpc3QpIHtcbiAgICB2YXIgYSwgYWJEaXN0LCBhYmNBbmdsZSwgYWJ4QW5nbGUsIGFjRGlzdCwgYWN4QW5nbGUsIGIsIGMsIGNkRGlzdCwgeEFiRGlzdCwgeEFjRGlzdCwgeUFiRGlzdCwgeUFjRGlzdDtcbiAgICBpZiAoIXRoaXMuaW5Cb3VuZGFyeUJveCh4LCB5LCBtaW5EaXN0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gdGhpcy5zdGFyMTtcbiAgICBiID0gdGhpcy5zdGFyMjtcbiAgICBjID0ge1xuICAgICAgXCJ4XCI6IHgsXG4gICAgICBcInlcIjogeVxuICAgIH07XG4gICAgeEFiRGlzdCA9IGIueCAtIGEueDtcbiAgICB5QWJEaXN0ID0gYi55IC0gYS55O1xuICAgIGFiRGlzdCA9IE1hdGguc3FydCgoeEFiRGlzdCAqIHhBYkRpc3QpICsgKHlBYkRpc3QgKiB5QWJEaXN0KSk7XG4gICAgYWJ4QW5nbGUgPSBNYXRoLmF0YW4oeUFiRGlzdCAvIHhBYkRpc3QpO1xuICAgIHhBY0Rpc3QgPSBjLnggLSBhLng7XG4gICAgeUFjRGlzdCA9IGMueSAtIGEueTtcbiAgICBhY0Rpc3QgPSBNYXRoLnNxcnQoKHhBY0Rpc3QgKiB4QWNEaXN0KSArICh5QWNEaXN0ICogeUFjRGlzdCkpO1xuICAgIGFjeEFuZ2xlID0gTWF0aC5hdGFuKHlBY0Rpc3QgLyB4QWNEaXN0KTtcbiAgICBhYmNBbmdsZSA9IGFieEFuZ2xlIC0gYWN4QW5nbGU7XG4gICAgY2REaXN0ID0gTWF0aC5hYnMoTWF0aC5zaW4oYWJjQW5nbGUpICogYWNEaXN0KTtcbiAgICByZXR1cm4gY2REaXN0IDw9IG1pbkRpc3Q7XG4gIH1cblxuICBpbnRlcnNlY3RMaW5rKGxpbmspIHtcbiAgICB2YXIgcywgczFfeCwgczFfeSwgczJfeCwgczJfeSwgdCwgeDEsIHgyLCB4MywgeDQsIHkxLCB5MiwgeTMsIHk0O1xuICAgIHgxID0gdGhpcy5zdGFyMS54O1xuICAgIHkxID0gdGhpcy5zdGFyMS55O1xuICAgIHgyID0gdGhpcy5zdGFyMi54O1xuICAgIHkyID0gdGhpcy5zdGFyMi55O1xuICAgIHgzID0gbGluay5zdGFyMS54O1xuICAgIHkzID0gbGluay5zdGFyMS55O1xuICAgIHg0ID0gbGluay5zdGFyMi54O1xuICAgIHk0ID0gbGluay5zdGFyMi55O1xuICAgIHMxX3ggPSB4MiAtIHgxO1xuICAgIHMxX3kgPSB5MiAtIHkxO1xuICAgIHMyX3ggPSB4NCAtIHgzO1xuICAgIHMyX3kgPSB5NCAtIHkzO1xuICAgIHMgPSAoLXMxX3kgKiAoeDEgLSB4MykgKyBzMV94ICogKHkxIC0geTMpKSAvICgtczJfeCAqIHMxX3kgKyBzMV94ICogczJfeSk7XG4gICAgdCA9IChzMl94ICogKHkxIC0geTMpIC0gczJfeSAqICh4MSAtIHgzKSkgLyAoLXMyX3ggKiBzMV95ICsgczFfeCAqIHMyX3kpO1xuICAgIHJldHVybiBzID4gMCAmJiBzIDwgMSAmJiB0ID4gMCAmJiB0IDwgMTtcbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1N0YXIuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTWFwLCBTdGFyLCBTdGFyTWFwR2VuZXJhdG9yO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbk1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5cblN0YXIgPSByZXF1aXJlKCcuL1N0YXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyTWFwR2VuZXJhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTdGFyTWFwR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMub3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZPcHQsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGdlbmVyYXRlKCkge1xuICAgICAgdGhpcy5tYXAgPSBuZXcgdGhpcy5vcHQubWFwQ2xhc3MoKTtcbiAgICAgIHRoaXMuc3RhcnMgPSB0aGlzLm1hcC5sb2NhdGlvbnMuY29weSgpO1xuICAgICAgdGhpcy5saW5rcyA9IFtdO1xuICAgICAgdGhpcy5jcmVhdGVTdGFycyh0aGlzLm9wdC5uYlN0YXJzKTtcbiAgICAgIHRoaXMubWFrZUxpbmtzKCk7XG4gICAgICByZXR1cm4gdGhpcy5tYXA7XG4gICAgfVxuXG4gICAgY3JlYXRlU3RhcnMobmIpIHtcbiAgICAgIHZhciBpLCBrLCByZWYsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBrID0gMCwgcmVmID0gbmI7ICgwIDw9IHJlZiA/IGsgPCByZWYgOiBrID4gcmVmKTsgaSA9IDAgPD0gcmVmID8gKytrIDogLS1rKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmNyZWF0ZVN0YXIoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBjcmVhdGVTdGFyKCkge1xuICAgICAgdmFyIGosIHBvcztcbiAgICAgIGogPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgcG9zID0ge1xuICAgICAgICAgIHg6IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiAodGhpcy5vcHQubWF4WCAtIHRoaXMub3B0Lm1pblgpICsgdGhpcy5vcHQubWluWCksXG4gICAgICAgICAgeTogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhZIC0gdGhpcy5vcHQubWluWSkgKyB0aGlzLm9wdC5taW5ZKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIShqIDwgMTAgJiYgdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHN0YXIuZGlzdChwb3MueCwgcG9zLnkpIDw9IHRoaXMub3B0Lm1pblN0YXJEaXN0O1xuICAgICAgICB9KSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgICBpZiAoIShqID49IDEwKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVTdGFyQXRQb3MocG9zLngsIHBvcy55KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVTdGFyQXRQb3MoeCwgeSkge1xuICAgICAgdmFyIHN0YXI7XG4gICAgICBzdGFyID0gbmV3IHRoaXMub3B0LnN0YXJDbGFzcyh4LCB5KTtcbiAgICAgIHRoaXMubWFwLmxvY2F0aW9ucy5wdXNoKHN0YXIpO1xuICAgICAgdGhpcy5zdGFycy5wdXNoKHN0YXIpO1xuICAgICAgcmV0dXJuIHN0YXI7XG4gICAgfVxuXG4gICAgbWFrZUxpbmtzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcnMuZm9yRWFjaCgoc3RhcikgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5tYWtlTGlua3NGcm9tKHN0YXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWFrZUxpbmtzRnJvbShzdGFyKSB7XG4gICAgICB2YXIgY2xvc2UsIGNsb3Nlc3RzLCBsaW5rLCBuZWVkZWQsIHJlc3VsdHMsIHRyaWVzO1xuICAgICAgdHJpZXMgPSB0aGlzLm9wdC5saW5rVHJpZXM7XG4gICAgICBuZWVkZWQgPSB0aGlzLm9wdC5saW5rc0J5U3RhcnMgLSBzdGFyLmxpbmtzLmNvdW50KCk7XG4gICAgICBpZiAobmVlZGVkID4gMCkge1xuICAgICAgICBjbG9zZXN0cyA9IHRoaXMuc3RhcnMuZmlsdGVyKChzdGFyMikgPT4ge1xuICAgICAgICAgIHJldHVybiBzdGFyMiAhPT0gc3RhciAmJiAhc3Rhci5saW5rcy5maW5kU3RhcihzdGFyMik7XG4gICAgICAgIH0pLmNsb3Nlc3RzKHN0YXIueCwgc3Rhci55KTtcbiAgICAgICAgaWYgKGNsb3Nlc3RzLmNvdW50KCkgPiAwKSB7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjbG9zZSA9IGNsb3Nlc3RzLnNoaWZ0KCk7XG4gICAgICAgICAgICBsaW5rID0gdGhpcy5jcmVhdGVMaW5rKHN0YXIsIGNsb3NlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlTGluayhsaW5rKSkge1xuICAgICAgICAgICAgICB0aGlzLmxpbmtzLnB1c2gobGluayk7XG4gICAgICAgICAgICAgIHN0YXIuYWRkTGluayhsaW5rKTtcbiAgICAgICAgICAgICAgbmVlZGVkIC09IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0cmllcyAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEobmVlZGVkID4gMCAmJiB0cmllcyA+IDAgJiYgY2xvc2VzdHMuY291bnQoKSA+IDApKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlTGluayhzdGFyMSwgc3RhcjIpIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5vcHQubGlua0NsYXNzKHN0YXIxLCBzdGFyMik7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVMaW5rKGxpbmspIHtcbiAgICAgIHJldHVybiAhdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICAgIHJldHVybiBzdGFyICE9PSBsaW5rLnN0YXIxICYmIHN0YXIgIT09IGxpbmsuc3RhcjIgJiYgbGluay5jbG9zZVRvUG9pbnQoc3Rhci54LCBzdGFyLnksIHRoaXMub3B0Lm1pbkxpbmtEaXN0KTtcbiAgICAgIH0pICYmICF0aGlzLmxpbmtzLmZpbmQoKGxpbmsyKSA9PiB7XG4gICAgICAgIHJldHVybiBsaW5rMi5pbnRlcnNlY3RMaW5rKGxpbmspO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgU3Rhck1hcEdlbmVyYXRvci5wcm90b3R5cGUuZGVmT3B0ID0ge1xuICAgIG5iU3RhcnM6IDIwLFxuICAgIG1pblg6IDAsXG4gICAgbWF4WDogNTAwLFxuICAgIG1pblk6IDAsXG4gICAgbWF4WTogNTAwLFxuICAgIG1pblN0YXJEaXN0OiAxMCxcbiAgICBtaW5MaW5rRGlzdDogMTAsXG4gICAgbGlua3NCeVN0YXJzOiAzLFxuICAgIGxpbmtUcmllczogMyxcbiAgICBtYXBDbGFzczogTWFwLFxuICAgIHN0YXJDbGFzczogU3RhcixcbiAgICBsaW5rQ2xhc3M6IFN0YXIuTGluayxcbiAgICBybmc6IE1hdGgucmFuZG9tXG4gIH07XG5cbiAgcmV0dXJuIFN0YXJNYXBHZW5lcmF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvU3Rhck1hcEdlbmVyYXRvci5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBHcmlkLCBWaWV3O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkdyaWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLWdyaWRzJykuR3JpZDtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBWaWV3IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgcmVmLCByZWYxO1xuICAgICAgaWYgKCF0aGlzLmJvdW5kcykge1xuICAgICAgICB0aGlzLmdyaWQgPSB0aGlzLmdyaWQgfHwgKChyZWYgPSB0aGlzLmdhbWUuX21haW5WaWV3KSAhPSBudWxsID8gKHJlZjEgPSByZWYudmFsdWUpICE9IG51bGwgPyByZWYxLmdyaWQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IG5ldyBHcmlkKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmJvdW5kcyA9IHRoaXMuZ3JpZC5hZGRDZWxsKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdhbWUgPSBudWxsO1xuICAgIH1cblxuICB9O1xuXG4gIFZpZXcucHJvcGVydGllcyh7XG4gICAgZ2FtZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICAgIHRoaXMuZ2FtZS52aWV3cy5hZGQodGhpcyk7XG4gICAgICAgICAgdGhpcy5zZXREZWZhdWx0cygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICByZXR1cm4gb2xkLnZpZXdzLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgeToge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgYm91bmRzOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVmlldztcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9WaWV3LmpzLm1hcFxuIiwidmFyIERpcmVjdGlvbiwgTGluZU9mU2lnaHQsIFRpbGVDb250YWluZXIsIFRpbGVSZWZlcmVuY2UsIFZpc2lvbkNhbGN1bGF0b3I7XG5cbkxpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpO1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uO1xuXG5UaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXI7XG5cblRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVJlZmVyZW5jZTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaXNpb25DYWxjdWxhdG9yID0gY2xhc3MgVmlzaW9uQ2FsY3VsYXRvciB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpblRpbGUsIG9mZnNldCA9IHtcbiAgICAgIHg6IDAuNSxcbiAgICAgIHk6IDAuNVxuICAgIH0pIHtcbiAgICB0aGlzLm9yaWdpblRpbGUgPSBvcmlnaW5UaWxlO1xuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHRoaXMucHRzID0ge307XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge307XG4gICAgdGhpcy5zdGFjayA9IFtdO1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgY2FsY3VsKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB2YXIgZmlyc3RCYXRjaCwgaW5pdGlhbFB0cztcbiAgICB0aGlzLnB0cyA9IHt9O1xuICAgIHRoaXMudmlzaWJpbGl0eSA9IHt9O1xuICAgIGluaXRpYWxQdHMgPSBbXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDFcbiAgICAgIH1cbiAgICBdO1xuICAgIGluaXRpYWxQdHMuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnNldFB0KHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55LCB0cnVlKTtcbiAgICB9KTtcbiAgICBmaXJzdEJhdGNoID0gW1xuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDIsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAxXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAyXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAtMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDJcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiB0aGlzLnN0YWNrID0gZmlyc3RCYXRjaC5tYXAoKHB0KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLm9yaWdpblRpbGUueCArIHB0LngsXG4gICAgICAgIHk6IHRoaXMub3JpZ2luVGlsZS55ICsgcHQueVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFB0KHgsIHksIHZhbCkge1xuICAgIHZhciBhZGphbmNlbnQ7XG4gICAgdGhpcy5wdHNbeCArICc6JyArIHldID0gdmFsO1xuICAgIGFkamFuY2VudCA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiBhZGphbmNlbnQuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFZpc2liaWxpdHkoeCArIHB0LngsIHkgKyBwdC55LCB2YWwgPyAxIC8gYWRqYW5jZW50Lmxlbmd0aCA6IDApO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UHQoeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnB0c1t4ICsgJzonICsgeV07XG4gIH1cblxuICBhZGRWaXNpYmlsaXR5KHgsIHksIHZhbCkge1xuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5W3hdID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF1beV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVt4XVt5XSArPSB2YWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmlzaWJpbGl0eSh4LCB5KSB7XG4gICAgaWYgKCh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkgfHwgKHRoaXMudmlzaWJpbGl0eVt4XVt5XSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV07XG4gICAgfVxuICB9XG5cbiAgY2FuUHJvY2Vzcyh4LCB5KSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YWNrLnNvbWUoKHB0KSA9PiB7XG4gICAgICByZXR1cm4gcHQueCA9PT0geCAmJiBwdC55ID09PSB5O1xuICAgIH0pICYmICh0aGlzLmdldFB0KHgsIHkpID09IG51bGwpO1xuICB9XG5cbiAgc3RlcCgpIHtcbiAgICB2YXIgbG9zLCBwdDtcbiAgICBwdCA9IHRoaXMuc3RhY2suc2hpZnQoKTtcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lciwgdGhpcy5vcmlnaW5UaWxlLnggKyB0aGlzLm9mZnNldC54LCB0aGlzLm9yaWdpblRpbGUueSArIHRoaXMub2Zmc2V0LnksIHB0LngsIHB0LnkpO1xuICAgIGxvcy5yZXZlcnNlVHJhY2luZygpO1xuICAgIGxvcy50cmF2ZXJzYWJsZUNhbGxiYWNrID0gKHRpbGUsIGVudHJ5WCwgZW50cnlZKSA9PiB7XG4gICAgICBpZiAodGlsZSAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmdldFZpc2liaWxpdHkodGlsZS54LCB0aWxlLnkpID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGxvcy5mb3JjZVN1Y2Nlc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGlsZS50cmFuc3BhcmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5zZXRQdChwdC54LCBwdC55LCBsb3MuZ2V0U3VjY2VzcygpKTtcbiAgICBpZiAobG9zLmdldFN1Y2Nlc3MoKSkge1xuICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZm9yRWFjaCgoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIHZhciBuZXh0UHQ7XG4gICAgICAgIG5leHRQdCA9IHtcbiAgICAgICAgICB4OiBwdC54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgeTogcHQueSArIGRpcmVjdGlvbi55XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmNhblByb2Nlc3MobmV4dFB0LngsIG5leHRQdC55KSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YWNrLnB1c2gobmV4dFB0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Qm91bmRzKCkge1xuICAgIHZhciBib3VuZGFyaWVzLCBjb2wsIHJlZiwgdmFsLCB4LCB5O1xuICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICB0b3A6IG51bGwsXG4gICAgICBsZWZ0OiBudWxsLFxuICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgcmlnaHQ6IG51bGxcbiAgICB9O1xuICAgIHJlZiA9IHRoaXMudmlzaWJpbGl0eTtcbiAgICBmb3IgKHggaW4gcmVmKSB7XG4gICAgICBjb2wgPSByZWZbeF07XG4gICAgICBmb3IgKHkgaW4gY29sKSB7XG4gICAgICAgIHZhbCA9IGNvbFt5XTtcbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB5IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgICBib3VuZGFyaWVzLnRvcCA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgeCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMubGVmdCA9IHg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB5ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgICAgYm91bmRhcmllcy5yaWdodCA9IHg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gIH1cblxuICB0b0NvbnRhaW5lcigpIHtcbiAgICB2YXIgY29sLCByZWYsIHJlcywgdGlsZSwgdmFsLCB4LCB5O1xuICAgIHJlcyA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgcmVzLm93bmVyID0gZmFsc2U7XG4gICAgcmVmID0gdGhpcy52aXNpYmlsaXR5O1xuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XTtcbiAgICAgIGZvciAoeSBpbiBjb2wpIHtcbiAgICAgICAgdmFsID0gY29sW3ldO1xuICAgICAgICB0aWxlID0gdGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgICBpZiAodmFsICE9PSAwICYmICh0aWxlICE9IG51bGwpKSB7XG4gICAgICAgICAgdGlsZSA9IG5ldyBUaWxlUmVmZXJlbmNlKHRpbGUpO1xuICAgICAgICAgIHRpbGUudmlzaWJpbGl0eSA9IHZhbDtcbiAgICAgICAgICByZXMuYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgdG9NYXAoKSB7XG4gICAgdmFyIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgcmVzLCB4LCB5O1xuICAgIHJlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbWFwOiBbXVxuICAgIH0sIHRoaXMuZ2V0Qm91bmRzKCkpO1xuICAgIGZvciAoeSA9IGkgPSByZWYgPSByZXMudG9wLCByZWYxID0gcmVzLmJvdHRvbSAtIDE7IChyZWYgPD0gcmVmMSA/IGkgPD0gcmVmMSA6IGkgPj0gcmVmMSk7IHkgPSByZWYgPD0gcmVmMSA/ICsraSA6IC0taSkge1xuICAgICAgcmVzLm1hcFt5IC0gcmVzLnRvcF0gPSBbXTtcbiAgICAgIGZvciAoeCA9IGogPSByZWYyID0gcmVzLmxlZnQsIHJlZjMgPSByZXMucmlnaHQgLSAxOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeCA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICByZXMubWFwW3kgLSByZXMudG9wXVt4IC0gcmVzLmxlZnRdID0gdGhpcy5nZXRWaXNpYmlsaXR5KHgsIHkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVmlzaW9uQ2FsY3VsYXRvci5qcy5tYXBcbiIsInZhciBBY3Rpb24sIEVsZW1lbnQsIEV2ZW50RW1pdHRlcjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQWN0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICB3aXRoQWN0b3IoYWN0b3IpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yICE9PSBhY3Rvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7XG4gICAgICAgICAgYWN0b3I6IGFjdG9yXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29weVdpdGgob3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBiYXNlOiB0aGlzXG4gICAgICB9LCB0aGlzLmdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCksIG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGUoKTtcbiAgICB9XG5cbiAgICB2YWxpZEFjdG9yKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0b3IgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBpc1JlYWR5KCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3RvcigpO1xuICAgIH1cblxuICAgIGZpbmlzaCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignZmluaXNoZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGludGVycnVwdCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignaW50ZXJydXB0ZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGVuZCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignZW5kJyk7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgQWN0aW9uLmluY2x1ZGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5cbiAgQWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIGFjdG9yOiB7fVxuICB9KTtcblxuICByZXR1cm4gQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQWN0aW9uLmpzLm1hcFxuIiwidmFyIEFjdGlvblByb3ZpZGVyLCBFbGVtZW50O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uUHJvdmlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFjdGlvblByb3ZpZGVyIGV4dGVuZHMgRWxlbWVudCB7fTtcblxuICBBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0FjdGlvblByb3ZpZGVyLmpzLm1hcFxuIiwidmFyIEF0dGFja0FjdGlvbiwgRXZlbnRCaW5kLCBQcm9wZXJ0eVdhdGNoZXIsIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vV2Fsa0FjdGlvbicpO1xuXG5UYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpO1xuXG5FdmVudEJpbmQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRCaW5kO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFja0FjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXR0YWNrQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldElzQXR0YWNrYWJsZSgpICYmICh0aGlzLmNhblVzZVdlYXBvbigpIHx8IHRoaXMuY2FuV2Fsa1RvVGFyZ2V0KCkpO1xuICAgIH1cblxuICAgIHRhcmdldElzQXR0YWNrYWJsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5kYW1hZ2VhYmxlICYmIHRoaXMudGFyZ2V0LmhlYWx0aCA+PSAwO1xuICAgIH1cblxuICAgIGNhbk1lbGVlKCkge1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueCAtIHRoaXMuYWN0b3IudGlsZS54KSArIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueSAtIHRoaXMuYWN0b3IudGlsZS55KSA9PT0gMTtcbiAgICB9XG5cbiAgICBjYW5Vc2VXZWFwb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5iZXN0VXNhYmxlV2VhcG9uICE9IG51bGw7XG4gICAgfVxuXG4gICAgY2FuVXNlV2VhcG9uQXQodGlsZSkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIHJldHVybiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApICYmIHRoaXMuYWN0b3Iud2VhcG9ucy5maW5kKCh3ZWFwb24pID0+IHtcbiAgICAgICAgcmV0dXJuIHdlYXBvbi5jYW5Vc2VGcm9tKHRpbGUsIHRoaXMudGFyZ2V0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbldhbGtUb1RhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uaXNSZWFkeSgpO1xuICAgIH1cblxuICAgIHVzZVdlYXBvbigpIHtcbiAgICAgIHRoaXMuYmVzdFVzYWJsZVdlYXBvbi51c2VPbih0aGlzLnRhcmdldCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2goKTtcbiAgICB9XG5cbiAgICBleGVjdXRlKCkge1xuICAgICAgaWYgKHRoaXMuYWN0b3Iud2FsayAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYWN0b3Iud2Fsay5pbnRlcnJ1cHQoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24gIT0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uLmNoYXJnZWQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy51c2VXZWFwb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25DaGFyZ2VXYXRjaGVyLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YWxrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmludGVycnVwdEJpbmRlci51bmJpbmQoKTtcbiAgICAgICAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIuYmluZFRvKHRoaXMud2Fsa0FjdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEF0dGFja0FjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrQWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2Fsa0FjdGlvbjtcbiAgICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHdhbGtBY3Rpb24ucGF0aEZpbmRlci5hcnJpdmVkQ2FsbGJhY2sgPSAoc3RlcCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNhblVzZVdlYXBvbkF0KHN0ZXAudGlsZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB3YWxrQWN0aW9uO1xuICAgICAgfVxuICAgIH0sXG4gICAgYmVzdFVzYWJsZVdlYXBvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgcmVmLCB1c2FibGVXZWFwb25zO1xuICAgICAgICBpbnZhbGlkYXRvci5wcm9wUGF0aCgnYWN0b3IudGlsZScpO1xuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApIHtcbiAgICAgICAgICB1c2FibGVXZWFwb25zID0gdGhpcy5hY3Rvci53ZWFwb25zLmZpbHRlcigod2VhcG9uKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gd2VhcG9uLmNhblVzZU9uKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB1c2FibGVXZWFwb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBiLmRwcyAtIGEuZHBzO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB1c2FibGVXZWFwb25zWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnRlcnJ1cHRCaW5kZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXZlbnRCaW5kKCdpbnRlcnJ1cHRlZCcsIG51bGwsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogdHJ1ZVxuICAgIH0sXG4gICAgd2VhcG9uQ2hhcmdlV2F0Y2hlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uLmNoYXJnZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlV2VhcG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5iZXN0VXNhYmxlV2VhcG9uLmdldFByb3BlcnR5SW5zdGFuY2UoJ2NoYXJnZWQnKVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXR0YWNrQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQXR0YWNrQWN0aW9uLmpzLm1hcFxuIiwidmFyIEF0dGFja0FjdGlvbiwgQXR0YWNrTW92ZUFjdGlvbiwgRXZlbnRCaW5kLCBMaW5lT2ZTaWdodCwgUGF0aEZpbmRlciwgUHJvcGVydHlXYXRjaGVyLCBUYXJnZXRBY3Rpb24sIFdhbGtBY3Rpb247XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKTtcblxuQXR0YWNrQWN0aW9uID0gcmVxdWlyZSgnLi9BdHRhY2tBY3Rpb24nKTtcblxuVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKTtcblxuUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpO1xuXG5MaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4uL0xpbmVPZlNpZ2h0Jyk7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5Qcm9wZXJ0eVdhdGNoZXI7XG5cbkV2ZW50QmluZCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEJpbmQ7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNrTW92ZUFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXR0YWNrTW92ZUFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgaXNFbmVteShlbGVtKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgcmV0dXJuIChyZWYgPSB0aGlzLmFjdG9yLm93bmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5pc0VuZW15ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuaXNFbmVteShlbGVtKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgICB9XG5cbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24udmFsaWRUYXJnZXQoKTtcbiAgICB9XG5cbiAgICB0ZXN0RW5lbXlTcG90dGVkKCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlRW5lbXlTcG90dGVkKCk7XG4gICAgICBpZiAodGhpcy5lbmVteVNwb3R0ZWQpIHtcbiAgICAgICAgdGhpcy5hdHRhY2tBY3Rpb24gPSBuZXcgQXR0YWNrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMuZW5lbXlTcG90dGVkXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF0dGFja0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLmF0dGFja0FjdGlvbik7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5pbnRlcnJ1cHQoKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlV2Fsa0FjdGlvbigpO1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2tBY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4ZWN1dGUoKSB7XG4gICAgICBpZiAoIXRoaXMudGVzdEVuZW15U3BvdHRlZCgpKSB7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLndhbGtBY3Rpb24pO1xuICAgICAgICB0aGlzLnRpbGVXYXRjaGVyLmJpbmQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5leGVjdXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQXR0YWNrTW92ZUFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrQWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2Fsa0FjdGlvbjtcbiAgICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB3YWxrQWN0aW9uO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5lbXlTcG90dGVkOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICB0aGlzLnBhdGggPSBuZXcgUGF0aEZpbmRlcih0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUsIGZhbHNlLCB7XG4gICAgICAgICAgdmFsaWRUaWxlOiAodGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRpbGUudHJhbnNwYXJlbnQgJiYgKG5ldyBMaW5lT2ZTaWdodCh0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUueCwgdGhpcy5hY3Rvci50aWxlLnksIHRpbGUueCwgdGlsZS55KSkuZ2V0U3VjY2VzcygpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYXJyaXZlZDogKHN0ZXApID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwLmVuZW15ID0gc3RlcC50aWxlLmNoaWxkcmVuLmZpbmQoKGMpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNFbmVteShjKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZWZmaWNpZW5jeTogKHRpbGUpID0+IHt9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBhdGguY2FsY3VsKCk7XG4gICAgICAgIHJldHVybiAocmVmID0gdGhpcy5wYXRoLnNvbHV0aW9uKSAhPSBudWxsID8gcmVmLmVuZW15IDogdm9pZCAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGlsZVdhdGNoZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGVzdEVuZW15U3BvdHRlZCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuYWN0b3IuZ2V0UHJvcGVydHlJbnN0YW5jZSgndGlsZScpXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IHRydWVcbiAgICB9LFxuICAgIGludGVycnVwdEJpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEJpbmQoJ2ludGVycnVwdGVkJywgbnVsbCwgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXR0YWNrTW92ZUFjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24uanMubWFwXG4iLCJ2YXIgQWN0aW9uUHJvdmlkZXIsIFNpbXBsZUFjdGlvblByb3ZpZGVyO1xuXG5BY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vQWN0aW9uUHJvdmlkZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVBY3Rpb25Qcm92aWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2ltcGxlQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBY3Rpb25Qcm92aWRlciB7fTtcblxuICBTaW1wbGVBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY3Rpb25zO1xuICAgICAgICBhY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHRoaXMuY29uc3RydWN0b3IuYWN0aW9ucztcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb25zID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgYWN0aW9ucyA9IE9iamVjdC5rZXlzKGFjdGlvbnMpLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb25zW2tleV07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IGFjdGlvbih7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gU2ltcGxlQWN0aW9uUHJvdmlkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlci5qcy5tYXBcbiIsInZhciBBY3Rpb24sIFRhcmdldEFjdGlvbjtcblxuQWN0aW9uID0gcmVxdWlyZSgnLi9BY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXJnZXRBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRhcmdldEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgd2l0aFRhcmdldCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLnRhcmdldCAhPT0gdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHtcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNhblRhcmdldCh0YXJnZXQpIHtcbiAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgIGluc3RhbmNlID0gdGhpcy53aXRoVGFyZ2V0KHRhcmdldCk7XG4gICAgICBpZiAoaW5zdGFuY2UudmFsaWRUYXJnZXQoKSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsaWRUYXJnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBpc1JlYWR5KCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmlzUmVhZHkoKSAmJiB0aGlzLnZhbGlkVGFyZ2V0KCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGFyZ2V0QWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIHRhcmdldDoge31cbiAgfSk7XG5cbiAgcmV0dXJuIFRhcmdldEFjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1RhcmdldEFjdGlvbi5qcy5tYXBcbiIsInZhciBBY3Rpb25Qcm92aWRlciwgTWl4YWJsZSwgVGlsZWRBY3Rpb25Qcm92aWRlcjtcblxuQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL0FjdGlvblByb3ZpZGVyJyk7XG5cbk1peGFibGUgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuTWl4YWJsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZEFjdGlvblByb3ZpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlZEFjdGlvblByb3ZpZGVyIGV4dGVuZHMgQWN0aW9uUHJvdmlkZXIge1xuICAgIHZhbGlkQWN0aW9uVGlsZSh0aWxlKSB7XG4gICAgICByZXR1cm4gdGlsZSAhPSBudWxsO1xuICAgIH1cblxuICAgIHByZXBhcmVBY3Rpb25UaWxlKHRpbGUpIHtcbiAgICAgIGlmICghdGlsZS5nZXRQcm9wZXJ0eUluc3RhbmNlKCdwcm92aWRlZEFjdGlvbnMnKSkge1xuICAgICAgICByZXR1cm4gTWl4YWJsZS5FeHRlbnNpb24ubWFrZShBY3Rpb25Qcm92aWRlci5wcm90b3R5cGUsIHRpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFRpbGVkQWN0aW9uUHJvdmlkZXIucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQsIG92ZXJyaWRlZCkge1xuICAgICAgICBvdmVycmlkZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkQWN0aW9ucztcbiAgICAgIH1cbiAgICB9LFxuICAgIGFjdGlvblRpbGVzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgbXlUaWxlO1xuICAgICAgICBteVRpbGUgPSBpbnZhbGlkYXRvci5wcm9wKCd0aWxlJyk7XG4gICAgICAgIGlmIChteVRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25UaWxlc0Nvb3JkLm1hcCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBteVRpbGUuZ2V0UmVsYXRpdmVUaWxlKGNvb3JkLngsIGNvb3JkLnkpO1xuICAgICAgICAgIH0pLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3Rpb25UaWxlKHRpbGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZm9yd2FyZGVkQWN0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjoge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEuYWN0aW9uID09PSBiLmFjdGlvbiAmJiBhLmxvY2F0aW9uID09PSBiLmxvY2F0aW9uO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgYWN0aW9uVGlsZXMsIGFjdGlvbnM7XG4gICAgICAgIGFjdGlvblRpbGVzID0gaW52YWxpZGF0b3IucHJvcCgnYWN0aW9uVGlsZXMnKTtcbiAgICAgICAgYWN0aW9ucyA9IGludmFsaWRhdG9yLnByb3AoJ3Byb3ZpZGVkQWN0aW9ucycpO1xuICAgICAgICByZXR1cm4gYWN0aW9uVGlsZXMucmVkdWNlKChyZXMsIHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzLmNvbmNhdChhY3Rpb25zLm1hcChmdW5jdGlvbihhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGFjdGlvbjogYWN0LFxuICAgICAgICAgICAgICBsb2NhdGlvbjogdGlsZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH0sXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKGZvcndhcmRlZCkge1xuICAgICAgICB0aGlzLnByZXBhcmVBY3Rpb25UaWxlKGZvcndhcmRlZC5sb2NhdGlvbik7XG4gICAgICAgIHJldHVybiBmb3J3YXJkZWQubG9jYXRpb24ucHJvdmlkZWRBY3Rpb25zLmFkZChmb3J3YXJkZWQuYWN0aW9uKTtcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24oZm9yd2FyZGVkKSB7XG4gICAgICAgIHJldHVybiBmb3J3YXJkZWQubG9jYXRpb24ucHJvdmlkZWRBY3Rpb25zLnJlbW92ZShmb3J3YXJkZWQuYWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIFRpbGVkQWN0aW9uUHJvdmlkZXIucHJvdG90eXBlLmFjdGlvblRpbGVzQ29vcmQgPSBbXG4gICAge1xuICAgICAgeDogMCxcbiAgICAgIHk6IC0xXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiAtMSxcbiAgICAgIHk6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiArMSxcbiAgICAgIHk6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiArMVxuICAgIH1cbiAgXTtcblxuICByZXR1cm4gVGlsZWRBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXIuanMubWFwXG4iLCJ2YXIgUGF0aEZpbmRlciwgUGF0aFdhbGssIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpO1xuXG5QYXRoV2FsayA9IHJlcXVpcmUoJy4uL1BhdGhXYWxrJyk7XG5cblRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa0FjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2Fsa0FjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgZXhlY3V0ZSgpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yLndhbGsgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFjdG9yLndhbGsuaW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLndhbGsgPSB0aGlzLmFjdG9yLndhbGsgPSBuZXcgUGF0aFdhbGsodGhpcy5hY3RvciwgdGhpcy5wYXRoRmluZGVyKTtcbiAgICAgIHRoaXMuYWN0b3Iud2Fsay5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmFjdG9yLndhbGsub24oJ2ludGVycnVwdGVkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuYWN0b3Iud2Fsay5zdGFydCgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgICBpZiAodGhpcy53YWxrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGsuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbGlkVGFyZ2V0KCkge1xuICAgICAgdGhpcy5wYXRoRmluZGVyLmNhbGN1bCgpO1xuICAgICAgcmV0dXJuIHRoaXMucGF0aEZpbmRlci5zb2x1dGlvbiAhPSBudWxsO1xuICAgIH1cblxuICB9O1xuXG4gIFdhbGtBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgcGF0aEZpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoRmluZGVyKHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZSwgdGhpcy50YXJnZXQsIHtcbiAgICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuYWN0b3IuY2FuR29PblRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rvci5jYW5Hb09uVGlsZSh0aWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aWxlLndhbGthYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV2Fsa0FjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1dhbGtBY3Rpb24uanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJBdXRvbWF0aWNEb29yXCI6IHJlcXVpcmUoXCIuL0F1dG9tYXRpY0Rvb3JcIiksXG4gIFwiQ2hhcmFjdGVyXCI6IHJlcXVpcmUoXCIuL0NoYXJhY3RlclwiKSxcbiAgXCJDaGFyYWN0ZXJBSVwiOiByZXF1aXJlKFwiLi9DaGFyYWN0ZXJBSVwiKSxcbiAgXCJEYW1hZ2VQcm9wYWdhdGlvblwiOiByZXF1aXJlKFwiLi9EYW1hZ2VQcm9wYWdhdGlvblwiKSxcbiAgXCJEYW1hZ2VhYmxlXCI6IHJlcXVpcmUoXCIuL0RhbWFnZWFibGVcIiksXG4gIFwiRG9vclwiOiByZXF1aXJlKFwiLi9Eb29yXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJGbG9vclwiOiByZXF1aXJlKFwiLi9GbG9vclwiKSxcbiAgXCJHYW1lXCI6IHJlcXVpcmUoXCIuL0dhbWVcIiksXG4gIFwiTGluZU9mU2lnaHRcIjogcmVxdWlyZShcIi4vTGluZU9mU2lnaHRcIiksXG4gIFwiTWFwXCI6IHJlcXVpcmUoXCIuL01hcFwiKSxcbiAgXCJPYnN0YWNsZVwiOiByZXF1aXJlKFwiLi9PYnN0YWNsZVwiKSxcbiAgXCJQYXRoV2Fsa1wiOiByZXF1aXJlKFwiLi9QYXRoV2Fsa1wiKSxcbiAgXCJQZXJzb25hbFdlYXBvblwiOiByZXF1aXJlKFwiLi9QZXJzb25hbFdlYXBvblwiKSxcbiAgXCJQbGF5ZXJcIjogcmVxdWlyZShcIi4vUGxheWVyXCIpLFxuICBcIlByb2plY3RpbGVcIjogcmVxdWlyZShcIi4vUHJvamVjdGlsZVwiKSxcbiAgXCJSb29tR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1Jvb21HZW5lcmF0b3JcIiksXG4gIFwiU2hpcFdlYXBvblwiOiByZXF1aXJlKFwiLi9TaGlwV2VhcG9uXCIpLFxuICBcIlN0YXJcIjogcmVxdWlyZShcIi4vU3RhclwiKSxcbiAgXCJTdGFyTWFwR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1N0YXJNYXBHZW5lcmF0b3JcIiksXG4gIFwiVmlld1wiOiByZXF1aXJlKFwiLi9WaWV3XCIpLFxuICBcIlZpc2lvbkNhbGN1bGF0b3JcIjogcmVxdWlyZShcIi4vVmlzaW9uQ2FsY3VsYXRvclwiKSxcbiAgXCJhY3Rpb25zXCI6IHtcbiAgICBcIkFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0FjdGlvblwiKSxcbiAgICBcIkFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJBdHRhY2tBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BdHRhY2tBY3Rpb25cIiksXG4gICAgXCJBdHRhY2tNb3ZlQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvblwiKSxcbiAgICBcIlNpbXBsZUFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJUYXJnZXRBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UYXJnZXRBY3Rpb25cIiksXG4gICAgXCJUaWxlZEFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIldhbGtBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9XYWxrQWN0aW9uXCIpLFxuICB9LFxufSIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgR3JpZD1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7R3JpZC5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUdyaWQ7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5HcmlkPUdyaWQ7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5HcmlkPUdyaWQ7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgRXZlbnRFbWl0dGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRFbWl0dGVyXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50RW1pdHRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG52YXIgR3JpZENlbGwgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJHcmlkQ2VsbFwiKSA/IGRlcGVuZGVuY2llcy5HcmlkQ2VsbCA6IHJlcXVpcmUoJy4vR3JpZENlbGwnKTtcbnZhciBHcmlkUm93ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiR3JpZFJvd1wiKSA/IGRlcGVuZGVuY2llcy5HcmlkUm93IDogcmVxdWlyZSgnLi9HcmlkUm93Jyk7XG52YXIgR3JpZDtcbkdyaWQgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEdyaWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBhZGRDZWxsKGNlbGwgPSBudWxsKSB7XG4gICAgICB2YXIgcm93LCBzcG90O1xuICAgICAgaWYgKCFjZWxsKSB7XG4gICAgICAgIGNlbGwgPSBuZXcgR3JpZENlbGwoKTtcbiAgICAgIH1cbiAgICAgIHNwb3QgPSB0aGlzLmdldEZyZWVTcG90KCk7XG4gICAgICByb3cgPSB0aGlzLnJvd3MuZ2V0KHNwb3Qucm93KTtcbiAgICAgIGlmICghcm93KSB7XG4gICAgICAgIHJvdyA9IHRoaXMuYWRkUm93KCk7XG4gICAgICB9XG4gICAgICByb3cuYWRkQ2VsbChjZWxsKTtcbiAgICAgIHJldHVybiBjZWxsO1xuICAgIH1cblxuICAgIGFkZFJvdyhyb3cgPSBudWxsKSB7XG4gICAgICBpZiAoIXJvdykge1xuICAgICAgICByb3cgPSBuZXcgR3JpZFJvdygpO1xuICAgICAgfVxuICAgICAgdGhpcy5yb3dzLnB1c2gocm93KTtcbiAgICAgIHJldHVybiByb3c7XG4gICAgfVxuXG4gICAgZ2V0RnJlZVNwb3QoKSB7XG4gICAgICB2YXIgc3BvdDtcbiAgICAgIHNwb3QgPSBudWxsO1xuICAgICAgdGhpcy5yb3dzLnNvbWUoKHJvdykgPT4ge1xuICAgICAgICBpZiAocm93LmNlbGxzLmxlbmd0aCA8IHRoaXMubWF4Q29sdW1ucykge1xuICAgICAgICAgIHJldHVybiBzcG90ID0ge1xuICAgICAgICAgICAgcm93OiByb3cucm93UG9zaXRpb24sXG4gICAgICAgICAgICBjb2x1bW46IHJvdy5jZWxscy5sZW5ndGhcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICghc3BvdCkge1xuICAgICAgICBpZiAodGhpcy5tYXhDb2x1bW5zID4gdGhpcy5yb3dzLmxlbmd0aCkge1xuICAgICAgICAgIHNwb3QgPSB7XG4gICAgICAgICAgICByb3c6IHRoaXMucm93cy5sZW5ndGgsXG4gICAgICAgICAgICBjb2x1bW46IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNwb3QgPSB7XG4gICAgICAgICAgICByb3c6IDAsXG4gICAgICAgICAgICBjb2x1bW46IHRoaXMubWF4Q29sdW1ucyArIDFcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3BvdDtcbiAgICB9XG5cbiAgfTtcblxuICBHcmlkLmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIEdyaWQucHJvcGVydGllcyh7XG4gICAgcm93czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICAgIGl0ZW1BZGRlZDogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiByb3cuZ3JpZCA9IHRoaXM7XG4gICAgICB9LFxuICAgICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICBpZiAocm93LmdyaWQgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gcm93LmdyaWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtYXhDb2x1bW5zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByb3dzO1xuICAgICAgICByb3dzID0gaW52YWxpZGF0b3IucHJvcCgncm93cycpO1xuICAgICAgICByZXR1cm4gcm93cy5yZWR1Y2UoZnVuY3Rpb24obWF4LCByb3cpIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5tYXgobWF4LCBpbnZhbGlkYXRvci5wcm9wKCdjZWxscycsIHJvdykubGVuZ3RoKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZDtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKEdyaWQpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgR3JpZENlbGw9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO0dyaWRDZWxsLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9R3JpZENlbGw7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5HcmlkQ2VsbD1HcmlkQ2VsbDt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLkdyaWRDZWxsPUdyaWRDZWxsO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIEV2ZW50RW1pdHRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkV2ZW50RW1pdHRlclwiKSA/IGRlcGVuZGVuY2llcy5FdmVudEVtaXR0ZXIgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRFbWl0dGVyO1xudmFyIEdyaWRDZWxsO1xuR3JpZENlbGwgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEdyaWRDZWxsIGV4dGVuZHMgRWxlbWVudCB7fTtcblxuICBHcmlkQ2VsbC5leHRlbmQoRXZlbnRFbWl0dGVyKTtcblxuICBHcmlkQ2VsbC5wcm9wZXJ0aWVzKHtcbiAgICBncmlkOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdncmlkJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcm93OiB7fSxcbiAgICBjb2x1bW5Qb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgcm93O1xuICAgICAgICByb3cgPSBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKTtcbiAgICAgICAgaWYgKHJvdykge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdjZWxscycsIHJvdykuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgd2lkdGg6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIDEgLyBpbnZhbGlkYXRvci5wcm9wKCdjZWxscycsIGludmFsaWRhdG9yLnByb3AoJ3JvdycpKS5sZW5ndGg7XG4gICAgICB9XG4gICAgfSxcbiAgICBsZWZ0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCd3aWR0aCcpICogaW52YWxpZGF0b3IucHJvcCgnY29sdW1uUG9zaXRpb24nKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCd3aWR0aCcpICogKGludmFsaWRhdG9yLnByb3AoJ2NvbHVtblBvc2l0aW9uJykgKyAxKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnaGVpZ2h0JywgaW52YWxpZGF0b3IucHJvcCgncm93JykpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG9wOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCd0b3AnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBib3R0b206IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2JvdHRvbScsIGludmFsaWRhdG9yLnByb3AoJ3JvdycpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkQ2VsbDtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKEdyaWRDZWxsKTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEdyaWRSb3c9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO0dyaWRSb3cuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1HcmlkUm93O31lbHNle2lmKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIiYmUGFyYWxsZWxpbyE9PW51bGwpe1BhcmFsbGVsaW8uR3JpZFJvdz1HcmlkUm93O31lbHNle2lmKHRoaXMuUGFyYWxsZWxpbz09bnVsbCl7dGhpcy5QYXJhbGxlbGlvPXt9O310aGlzLlBhcmFsbGVsaW8uR3JpZFJvdz1HcmlkUm93O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIEV2ZW50RW1pdHRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkV2ZW50RW1pdHRlclwiKSA/IGRlcGVuZGVuY2llcy5FdmVudEVtaXR0ZXIgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRFbWl0dGVyO1xudmFyIEdyaWRDZWxsID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiR3JpZENlbGxcIikgPyBkZXBlbmRlbmNpZXMuR3JpZENlbGwgOiByZXF1aXJlKCcuL0dyaWRDZWxsJyk7XG52YXIgR3JpZFJvdztcbkdyaWRSb3cgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEdyaWRSb3cgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBhZGRDZWxsKGNlbGwgPSBudWxsKSB7XG4gICAgICBpZiAoIWNlbGwpIHtcbiAgICAgICAgY2VsbCA9IG5ldyBHcmlkQ2VsbCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jZWxscy5wdXNoKGNlbGwpO1xuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuXG4gIH07XG5cbiAgR3JpZFJvdy5leHRlbmQoRXZlbnRFbWl0dGVyKTtcblxuICBHcmlkUm93LnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHt9LFxuICAgIGNlbGxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihjZWxsKSB7XG4gICAgICAgIHJldHVybiBjZWxsLnJvdyA9IHRoaXM7XG4gICAgICB9LFxuICAgICAgaXRlbVJlbW92ZWQ6IGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgaWYgKGNlbGwucm93ID09PSB0aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGNlbGwucm93ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcm93UG9zaXRpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIGdyaWQ7XG4gICAgICAgIGdyaWQgPSBpbnZhbGlkYXRvci5wcm9wKCdncmlkJyk7XG4gICAgICAgIGlmIChncmlkKSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3Jvd3MnLCBncmlkKS5pbmRleE9mKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIDEgLyBpbnZhbGlkYXRvci5wcm9wKCdyb3dzJywgaW52YWxpZGF0b3IucHJvcCgnZ3JpZCcpKS5sZW5ndGg7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3A6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2hlaWdodCcpICogaW52YWxpZGF0b3IucHJvcCgncm93UG9zaXRpb24nKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnaGVpZ2h0JykgKiAoaW52YWxpZGF0b3IucHJvcCgncm93UG9zaXRpb24nKSArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWRSb3c7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihHcmlkUm93KTt9KTsiLCJpZihtb2R1bGUpe1xuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBHcmlkOiByZXF1aXJlKCcuL0dyaWQuanMnKSxcbiAgICBHcmlkQ2VsbDogcmVxdWlyZSgnLi9HcmlkQ2VsbC5qcycpLFxuICAgIEdyaWRSb3c6IHJlcXVpcmUoJy4vR3JpZFJvdy5qcycpXG4gIH07XG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBCaW5kZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0JpbmRlci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUJpbmRlcjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkJpbmRlcj1CaW5kZXI7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5CaW5kZXI9QmluZGVyO319fSkoZnVuY3Rpb24oKXtcbnZhciBCaW5kZXI7XG5CaW5kZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEJpbmRlciB7XG4gICAgYmluZCgpIHtcbiAgICAgIGlmICghdGhpcy5iaW5kZWQgJiYgKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0ICE9IG51bGwpKSB7XG4gICAgICAgIHRoaXMuZG9CaW5kKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5iaW5kZWQgPSB0cnVlO1xuICAgIH1cbiAgICBkb0JpbmQoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cbiAgICB1bmJpbmQoKSB7XG4gICAgICBpZiAodGhpcy5iaW5kZWQgJiYgKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0ICE9IG51bGwpKSB7XG4gICAgICAgIHRoaXMuZG9VbmJpbmQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmJpbmRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBkb1VuYmluZCgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuICAgIGVxdWFscyhiaW5kZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmNvbXBhcmVSZWZlcmVkKGJpbmRlciwgdGhpcyk7XG4gICAgfVxuICAgIGdldFJlZigpIHt9XG4gICAgc3RhdGljIGNvbXBhcmVSZWZlcmVkKG9iajEsIG9iajIpIHtcbiAgICAgIHJldHVybiBvYmoxID09PSBvYmoyIHx8ICgob2JqMSAhPSBudWxsKSAmJiAob2JqMiAhPSBudWxsKSAmJiBvYmoxLmNvbnN0cnVjdG9yID09PSBvYmoyLmNvbnN0cnVjdG9yICYmIHRoaXMuY29tcGFyZVJlZihvYmoxLnJlZiwgb2JqMi5yZWYpKTtcbiAgICB9XG4gICAgc3RhdGljIGNvbXBhcmVSZWYocmVmMSwgcmVmMikge1xuICAgICAgcmV0dXJuIChyZWYxICE9IG51bGwpICYmIChyZWYyICE9IG51bGwpICYmIChyZWYxID09PSByZWYyIHx8IChBcnJheS5pc0FycmF5KHJlZjEpICYmIEFycmF5LmlzQXJyYXkocmVmMSkgJiYgcmVmMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFbaV0sIHJlZjJbaV0pO1xuICAgICAgfSkpIHx8ICh0eXBlb2YgcmVmMSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVmMiA9PT0gXCJvYmplY3RcIiAmJiBPYmplY3Qua2V5cyhyZWYxKS5qb2luKCkgPT09IE9iamVjdC5rZXlzKHJlZjIpLmpvaW4oKSAmJiBPYmplY3Qua2V5cyhyZWYxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFba2V5XSwgcmVmMltrZXldKTtcbiAgICAgIH0pKSk7XG4gICAgfVxuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQmluZGVyLnByb3RvdHlwZSwgJ3JlZicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVmKCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIEJpbmRlcjtcbn0pLmNhbGwodGhpcyk7XG5yZXR1cm4oQmluZGVyKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQmluZGVyLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBDb2xsZWN0aW9uPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb2xsZWN0aW9uLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q29sbGVjdGlvbjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkNvbGxlY3Rpb249Q29sbGVjdGlvbjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNvbGxlY3Rpb249Q29sbGVjdGlvbjt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgQ29sbGVjdGlvbjtcbkNvbGxlY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbGxlY3Rpb24ge1xuICAgIGNvbnN0cnVjdG9yKGFycikge1xuICAgICAgaWYgKGFyciAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJyLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IGFyci50b0FycmF5KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBbYXJyXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBbXTtcbiAgICAgIH1cbiAgICB9XG4gICAgY2hhbmdlZCgpIHt9XG4gICAgY2hlY2tDaGFuZ2VzKG9sZCwgb3JkZXJlZCA9IHRydWUsIGNvbXBhcmVGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgICBjb21wYXJlRnVuY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpO1xuICAgICAgcmV0dXJuIHRoaXMuY291bnQoKSAhPT0gb2xkLmxlbmd0aCB8fCAob3JkZXJlZCA/IHRoaXMuc29tZShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKTtcbiAgICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuICFvbGQucGx1Y2soZnVuY3Rpb24oYikge1xuICAgICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oYSwgYik7XG4gICAgICAgIH0pO1xuICAgICAgfSkpO1xuICAgIH1cbiAgICBnZXQoaSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5W2ldO1xuICAgIH1cbiAgICBzZXQoaSwgdmFsKSB7XG4gICAgICB2YXIgb2xkO1xuICAgICAgaWYgKHRoaXMuX2FycmF5W2ldICE9PSB2YWwpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuX2FycmF5W2ldID0gdmFsO1xuICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIGFkZCh2YWwpIHtcbiAgICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKHZhbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlbW92ZSh2YWwpIHtcbiAgICAgIHZhciBpbmRleCwgb2xkO1xuICAgICAgaW5kZXggPSB0aGlzLl9hcnJheS5pbmRleE9mKHZhbCk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHBsdWNrKGZuKSB7XG4gICAgICB2YXIgZm91bmQsIGluZGV4LCBvbGQ7XG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmZpbmRJbmRleChmbik7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgICAgZm91bmQgPSB0aGlzLl9hcnJheVtpbmRleF07XG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgdG9BcnJheSgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xuICAgIH1cbiAgICBjb3VudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5sZW5ndGg7XG4gICAgfVxuICAgIHN0YXRpYyBuZXdTdWJDbGFzcyhmbiwgYXJyKSB7XG4gICAgICB2YXIgU3ViQ2xhc3M7XG4gICAgICBpZiAodHlwZW9mIGZuID09PSAnb2JqZWN0Jykge1xuICAgICAgICBTdWJDbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpcyB7fTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihTdWJDbGFzcy5wcm90b3R5cGUsIGZuKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWJDbGFzcyhhcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGFycik7XG4gICAgICB9XG4gICAgfVxuICAgIGNvcHkoYXJyKSB7XG4gICAgICB2YXIgY29sbDtcbiAgICAgIGlmIChhcnIgPT0gbnVsbCkge1xuICAgICAgICBhcnIgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIH1cbiAgICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpO1xuICAgICAgcmV0dXJuIGNvbGw7XG4gICAgfVxuICAgIGVxdWFscyhhcnIpIHtcbiAgICAgIHJldHVybiAodGhpcy5jb3VudCgpID09PSAodHlwZW9mIGFyci5jb3VudCA9PT0gJ2Z1bmN0aW9uJyA/IGFyci5jb3VudCgpIDogYXJyLmxlbmd0aCkpICYmIHRoaXMuZXZlcnkoZnVuY3Rpb24odmFsLCBpKSB7XG4gICAgICAgIHJldHVybiBhcnJbaV0gPT09IHZhbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRBZGRlZEZyb20oYXJyKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuICFhcnIuaW5jbHVkZXMoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZ2V0UmVtb3ZlZEZyb20oYXJyKSB7XG4gICAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuaW5jbHVkZXMoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIENvbGxlY3Rpb24ucmVhZEZ1bmN0aW9ucyA9IFsnZXZlcnknLCAnZmluZCcsICdmaW5kSW5kZXgnLCAnZm9yRWFjaCcsICdpbmNsdWRlcycsICdpbmRleE9mJywgJ2pvaW4nLCAnbGFzdEluZGV4T2YnLCAnbWFwJywgJ3JlZHVjZScsICdyZWR1Y2VSaWdodCcsICdzb21lJywgJ3RvU3RyaW5nJ107XG4gIENvbGxlY3Rpb24ucmVhZExpc3RGdW5jdGlvbnMgPSBbJ2NvbmNhdCcsICdmaWx0ZXInLCAnc2xpY2UnXTtcbiAgQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J107XG4gIENvbGxlY3Rpb24ucmVhZEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmN0KSB7XG4gICAgcmV0dXJuIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uKC4uLmFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xuICAgIH07XG4gIH0pO1xuICBDb2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpKTtcbiAgICB9O1xuICB9KTtcbiAgQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmN0KSB7XG4gICAgcmV0dXJuIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uKC4uLmFyZykge1xuICAgICAgdmFyIG9sZCwgcmVzO1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKTtcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIENvbGxlY3Rpb247XG59KS5jYWxsKHRoaXMpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbGxlY3Rpb24ucHJvdG90eXBlLCAnbGVuZ3RoJywge1xuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmNvdW50KCk7XG4gIH1cbn0pO1xuaWYgKHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgU3ltYm9sICE9PSBudWxsID8gU3ltYm9sLml0ZXJhdG9yIDogdm9pZCAwKSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICB9O1xufVxucmV0dXJuKENvbGxlY3Rpb24pO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Db2xsZWN0aW9uLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBFbGVtZW50PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtFbGVtZW50LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RWxlbWVudDt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkVsZW1lbnQ9RWxlbWVudDt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkVsZW1lbnQ9RWxlbWVudDt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5Jyk7XG52YXIgTWl4YWJsZSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk1peGFibGVcIikgPyBkZXBlbmRlbmNpZXMuTWl4YWJsZSA6IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xudmFyIEVsZW1lbnQ7XG5FbGVtZW50ID0gY2xhc3MgRWxlbWVudCBleHRlbmRzIE1peGFibGUge1xuICB0YXAobmFtZSkge1xuICAgIHZhciBhcmdzO1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbmFtZS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjYWxsYmFjayhuYW1lKSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH07XG4gICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0ub3duZXIgPSB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW25hbWVdO1xuICB9XG5cbiAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgIGlmICh0aGlzLl9wcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBbJ19wcm9wZXJ0aWVzJ10uY29uY2F0KHRoaXMuX3Byb3BlcnRpZXMubWFwKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgcmV0dXJuIHByb3AubmFtZTtcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIGV4dGVuZGVkKHRhcmdldCkge1xuICAgIHZhciBpLCBsZW4sIG9wdGlvbnMsIHByb3BlcnR5LCByZWYsIHJlc3VsdHM7XG4gICAgaWYgKHRoaXMuX3Byb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgcmVmID0gdGhpcy5fcHJvcGVydGllcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBwcm9wZXJ0eSA9IHJlZltpXTtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnR5Lm9wdGlvbnMpO1xuICAgICAgICByZXN1bHRzLnB1c2goKG5ldyBQcm9wZXJ0eShwcm9wZXJ0eS5uYW1lLCBvcHRpb25zKSkuYmluZCh0YXJnZXQpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBwcm9wZXJ0eShwcm9wLCBkZXNjKSB7XG4gICAgcmV0dXJuIChuZXcgUHJvcGVydHkocHJvcCwgZGVzYykpLmJpbmQodGhpcy5wcm90b3R5cGUpO1xuICB9XG5cbiAgc3RhdGljIHByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIHZhciBkZXNjLCBwcm9wLCByZXN1bHRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKHByb3AgaW4gcHJvcGVydGllcykge1xuICAgICAgZGVzYyA9IHByb3BlcnRpZXNbcHJvcF07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5wcm9wZXJ0eShwcm9wLCBkZXNjKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbn07XG5cbnJldHVybihFbGVtZW50KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRWxlbWVudC5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgRXZlbnRCaW5kPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtFdmVudEJpbmQuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1FdmVudEJpbmQ7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5FdmVudEJpbmQ9RXZlbnRCaW5kO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuRXZlbnRCaW5kPUV2ZW50QmluZDt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJpbmRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJpbmRlclwiKSA/IGRlcGVuZGVuY2llcy5CaW5kZXIgOiByZXF1aXJlKCcuL0JpbmRlcicpO1xudmFyIEV2ZW50QmluZDtcbkV2ZW50QmluZCA9IGNsYXNzIEV2ZW50QmluZCBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yKGV2ZW50MSwgdGFyZ2V0MSwgY2FsbGJhY2spIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZXZlbnQgPSBldmVudDE7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQxO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgfVxuXG4gIGdldFJlZigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXZlbnQ6IHRoaXMuZXZlbnQsXG4gICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICB9O1xuICB9XG5cbiAgZG9CaW5kKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0Lm9uKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfVxuICB9XG5cbiAgZG9VbmJpbmQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9mZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0Lm9mZih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byByZW1vdmUgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpO1xuICAgIH1cbiAgfVxuXG4gIGVxdWFscyhldmVudEJpbmQpIHtcbiAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGV2ZW50QmluZCkgJiYgZXZlbnRCaW5kLmV2ZW50ID09PSB0aGlzLmV2ZW50O1xuICB9XG5cbiAgbWF0Y2goZXZlbnQsIHRhcmdldCkge1xuICAgIHJldHVybiBldmVudCA9PT0gdGhpcy5ldmVudCAmJiB0YXJnZXQgPT09IHRoaXMudGFyZ2V0O1xuICB9XG5cbiAgc3RhdGljIGNoZWNrRW1pdHRlcihlbWl0dGVyLCBmYXRhbCA9IHRydWUpIHtcbiAgICBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChmYXRhbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byBhZGQgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbn07XG5cbnJldHVybihFdmVudEJpbmQpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEJpbmQuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEV2ZW50RW1pdHRlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7RXZlbnRFbWl0dGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RXZlbnRFbWl0dGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRXZlbnRFbWl0dGVyPUV2ZW50RW1pdHRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkV2ZW50RW1pdHRlcj1FdmVudEVtaXR0ZXI7fX19KShmdW5jdGlvbigpe1xudmFyIEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRXZlbnRFbWl0dGVyIHtcbiAgICBnZXRBbGxFdmVudHMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgfVxuICAgIGdldExpc3RlbmVycyhlKSB7XG4gICAgICB2YXIgZXZlbnRzO1xuICAgICAgZXZlbnRzID0gdGhpcy5nZXRBbGxFdmVudHMoKTtcbiAgICAgIHJldHVybiBldmVudHNbZV0gfHwgKGV2ZW50c1tlXSA9IFtdKTtcbiAgICB9XG4gICAgaGFzTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldExpc3RlbmVycyhlKS5pbmNsdWRlcyhsaXN0ZW5lcik7XG4gICAgfVxuICAgIGFkZExpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzTGlzdGVuZXIoZSwgbGlzdGVuZXIpKSB7XG4gICAgICAgIHRoaXMuZ2V0TGlzdGVuZXJzKGUpLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGlzdGVuZXJBZGRlZChlLCBsaXN0ZW5lcikge31cbiAgICByZW1vdmVMaXN0ZW5lcihlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGluZGV4LCBsaXN0ZW5lcnM7XG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKTtcbiAgICAgIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJSZW1vdmVkKGUsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGlzdGVuZXJSZW1vdmVkKGUsIGxpc3RlbmVyKSB7fVxuICAgIGVtaXRFdmVudChlLCAuLi5hcmdzKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzO1xuICAgICAgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnMoZSkuc2xpY2UoKTtcbiAgICAgIHJldHVybiBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gbGlzdGVuZXIoLi4uYXJncyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEV2ZW50O1xuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbiAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbn0pLmNhbGwodGhpcyk7XG5yZXR1cm4oRXZlbnRFbWl0dGVyKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRXZlbnRFbWl0dGVyLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBJbnZhbGlkYXRvcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7SW52YWxpZGF0b3IuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1JbnZhbGlkYXRvcjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkludmFsaWRhdG9yPUludmFsaWRhdG9yO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuSW52YWxpZGF0b3I9SW52YWxpZGF0b3I7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBCaW5kZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJCaW5kZXJcIikgPyBkZXBlbmRlbmNpZXMuQmluZGVyIDogcmVxdWlyZSgnLi9CaW5kZXInKTtcbnZhciBFdmVudEJpbmQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFdmVudEJpbmRcIikgPyBkZXBlbmRlbmNpZXMuRXZlbnRCaW5kIDogcmVxdWlyZSgnLi9FdmVudEJpbmQnKTtcbnZhciBJbnZhbGlkYXRvciwgcGx1Y2s7XG5wbHVjayA9IGZ1bmN0aW9uKGFyciwgZm4pIHtcbiAgdmFyIGZvdW5kLCBpbmRleDtcbiAgaW5kZXggPSBhcnIuZmluZEluZGV4KGZuKTtcbiAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICBmb3VuZCA9IGFycltpbmRleF07XG4gICAgYXJyLnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIGZvdW5kO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5JbnZhbGlkYXRvciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgSW52YWxpZGF0b3IgZXh0ZW5kcyBCaW5kZXIge1xuICAgIGNvbnN0cnVjdG9yKHByb3BlcnR5LCBvYmogPSBudWxsKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgICAgdGhpcy5vYmogPSBvYmo7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cyA9IFtdO1xuICAgICAgdGhpcy5yZWN5Y2xlZCA9IFtdO1xuICAgICAgdGhpcy51bmtub3ducyA9IFtdO1xuICAgICAgdGhpcy5zdHJpY3QgPSB0aGlzLmNvbnN0cnVjdG9yLnN0cmljdDtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzO1xuICAgIH1cblxuICAgIGludmFsaWRhdGUoKSB7XG4gICAgICB2YXIgZnVuY3ROYW1lO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eSgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKCk7XG4gICAgICB9IGVsc2UgaWYgKCh0aGlzLnByb3BlcnR5ICE9IG51bGwpICYmIHR5cGVvZiB0aGlzLnByb3BlcnR5LmludmFsaWRhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eS5pbnZhbGlkYXRlKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGZ1bmN0TmFtZSA9ICdpbnZhbGlkYXRlJyArIHRoaXMucHJvcGVydHkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnByb3BlcnR5LnNsaWNlKDEpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMub2JqW2Z1bmN0TmFtZV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9ialtmdW5jdE5hbWVdKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub2JqW3RoaXMucHJvcGVydHldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHVua25vd24oKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkudW5rbm93biA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnR5LnVua25vd24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEJpbmRlcihuZXcgRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSk7XG4gICAgfVxuXG4gICAgYWRkQmluZGVyKGJpbmRlcikge1xuICAgICAgaWYgKGJpbmRlci5jYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICAgIGJpbmRlci5jYWxsYmFjayA9IHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5zb21lKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2gocGx1Y2sodGhpcy5yZWN5Y2xlZCwgZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKTtcbiAgICAgICAgfSkgfHwgYmluZGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRVbmtub3duQ2FsbGJhY2socHJvcCwgdGFyZ2V0KSB7XG4gICAgICB2YXIgY2FsbGJhY2s7XG4gICAgICBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICB9LCBwcm9wLCB0YXJnZXQpO1xuICAgICAgfTtcbiAgICAgIGNhbGxiYWNrLnJlZiA9IHtcbiAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXRcbiAgICAgIH07XG4gICAgICByZXR1cm4gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgYWRkVW5rbm93bihmbiwgcHJvcCwgdGFyZ2V0KSB7XG4gICAgICBpZiAoIXRoaXMuZmluZFVua25vd24ocHJvcCwgdGFyZ2V0KSkge1xuICAgICAgICBmbi5yZWYgPSB7XG4gICAgICAgICAgXCJwcm9wXCI6IHByb3AsXG4gICAgICAgICAgXCJ0YXJnZXRcIjogdGFyZ2V0XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudW5rbm93bnMucHVzaChmbik7XG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd24oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kVW5rbm93bihwcm9wLCB0YXJnZXQpIHtcbiAgICAgIGlmICgocHJvcCAhPSBudWxsKSB8fCAodGFyZ2V0ICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd25zLmZpbmQoZnVuY3Rpb24odW5rbm93bikge1xuICAgICAgICAgIHJldHVybiB1bmtub3duLnJlZi5wcm9wID09PSBwcm9wICYmIHVua25vd24ucmVmLnRhcmdldCA9PT0gdGFyZ2V0O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBldmVudChldmVudCwgdGFyZ2V0ID0gdGhpcy5vYmopIHtcbiAgICAgIGlmICh0aGlzLmNoZWNrRW1pdHRlcih0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZSh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLm9iaikge1xuICAgICAgdGhpcy5ldmVudChldmVudCwgdGFyZ2V0KTtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgcHJvcChwcm9wLCB0YXJnZXQgPSB0aGlzLm9iaikge1xuICAgICAgaWYgKHR5cGVvZiBwcm9wICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IG5hbWUgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5hZGRFdmVudEJpbmQocHJvcCArICdJbnZhbGlkYXRlZCcsIHRhcmdldCwgdGhpcy5nZXRVbmtub3duQ2FsbGJhY2socHJvcCwgdGFyZ2V0KSk7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlKHRhcmdldFtwcm9wXSwgcHJvcCArICdVcGRhdGVkJywgdGFyZ2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJvcEluaXRpYXRlZChwcm9wLCB0YXJnZXQgPSB0aGlzLm9iaikge1xuICAgICAgdmFyIGluaXRpYXRlZDtcbiAgICAgIGluaXRpYXRlZCA9IHRhcmdldC5nZXRQcm9wZXJ0eUluc3RhbmNlKHByb3ApLmluaXRpYXRlZDtcbiAgICAgIGlmICghaW5pdGlhdGVkICYmIHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5ldmVudChwcm9wICsgJ1VwZGF0ZWQnLCB0YXJnZXQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluaXRpYXRlZDtcbiAgICB9XG5cbiAgICBmdW5jdChmdW5jdCkge1xuICAgICAgdmFyIGludmFsaWRhdG9yLCByZXM7XG4gICAgICBpbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oKCkgPT4ge1xuICAgICAgICAgIHZhciByZXMyO1xuICAgICAgICAgIHJlczIgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICAgICAgaWYgKHJlcyAhPT0gcmVzMikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgaW52YWxpZGF0b3IpO1xuICAgICAgfSk7XG4gICAgICByZXMgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5wdXNoKGludmFsaWRhdG9yKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVVbmtub3ducyhwcm9wLCB0YXJnZXQgPSB0aGlzLm9iaikge1xuICAgICAgdmFyIHVua25vd25zO1xuICAgICAgdW5rbm93bnMgPSB0aGlzLnVua25vd25zO1xuICAgICAgdGhpcy51bmtub3ducyA9IFtdO1xuICAgICAgcmV0dXJuIHVua25vd25zLmZvckVhY2goZnVuY3Rpb24odW5rbm93bikge1xuICAgICAgICByZXR1cm4gdW5rbm93bigpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaXNFbXB0eSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmJpbmQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlY3ljbGUoY2FsbGJhY2spIHtcbiAgICAgIHZhciBkb25lLCByZXM7XG4gICAgICB0aGlzLnJlY3ljbGVkID0gdGhpcy5pbnZhbGlkYXRpb25FdmVudHM7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cyA9IFtdO1xuICAgICAgZG9uZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5yZWN5Y2xlZC5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICAgIHJldHVybiBldmVudEJpbmQudW5iaW5kKCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5yZWN5Y2xlZCA9IFtdO1xuICAgICAgfTtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoY2FsbGJhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0aGlzLCBkb25lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMgPSBjYWxsYmFjayh0aGlzKTtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRvbmU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tFbWl0dGVyKGVtaXR0ZXIpIHtcbiAgICAgIHJldHVybiBFdmVudEJpbmQuY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIHRoaXMuc3RyaWN0KTtcbiAgICB9XG5cbiAgICB1bmJpbmQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50QmluZC51bmJpbmQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIEludmFsaWRhdG9yLnN0cmljdCA9IHRydWU7XG5cbiAgcmV0dXJuIEludmFsaWRhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oSW52YWxpZGF0b3IpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9JbnZhbGlkYXRvci5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgTWl4YWJsZT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7TWl4YWJsZS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPU1peGFibGU7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5NaXhhYmxlPU1peGFibGU7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5NaXhhYmxlPU1peGFibGU7fX19KShmdW5jdGlvbigpe1xudmFyIE1peGFibGUsXG4gIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaW5jbHVkZShvYmopIHtcbiAgICAgIHJldHVybiB0aGlzLkV4dGVuc2lvbi5tYWtlKG9iaiwgdGhpcy5wcm90b3R5cGUpO1xuICAgIH1cbiAgfTtcbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIHByb3AsIHJlZjtcbiAgICAgIHJlZiA9IHRoaXMuZ2V0RXh0ZW5zaW9uUHJvcGVydGllcyhzb3VyY2UsIHRhcmdldCk7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcHJvcCA9IHJlZltpXTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lLCBwcm9wKTtcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InXSxcbiAgICBnZXRFeHRlbnNpb25Qcm9wZXJ0aWVzOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIGFsd2F5c0ZpbmFsLCBwcm9wcywgdGFyZ2V0Q2hhaW47XG4gICAgICBhbHdheXNGaW5hbCA9IHRoaXMuYWx3YXlzRmluYWw7XG4gICAgICB0YXJnZXRDaGFpbiA9IHRoaXMuZ2V0UHJvdG90eXBlQ2hhaW4odGFyZ2V0KTtcbiAgICAgIHByb3BzID0gW107XG4gICAgICB0aGlzLmdldFByb3RvdHlwZUNoYWluKHNvdXJjZSkuZXZlcnkoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciBleGNsdWRlO1xuICAgICAgICBpZiAoIXRhcmdldENoYWluLmluY2x1ZGVzKG9iaikpIHtcbiAgICAgICAgICBleGNsdWRlID0gYWx3YXlzRmluYWw7XG4gICAgICAgICAgaWYgKHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBleGNsdWRlID0gZXhjbHVkZS5jb25jYXQoW1wibGVuZ3RoXCIsIFwicHJvdG90eXBlXCIsIFwibmFtZVwiXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb3BzID0gcHJvcHMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGFyZ2V0Lmhhc093blByb3BlcnR5KGtleSkgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wiICYmIGluZGV4T2YuY2FsbChleGNsdWRlLCBrZXkpIDwgMCAmJiAhcHJvcHMuZmluZChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IGtleTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHZhciBwcm9wO1xuICAgICAgICAgICAgcHJvcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpO1xuICAgICAgICAgICAgcHJvcC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHByb3A7XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwcm9wcztcbiAgICB9LFxuICAgIGdldFByb3RvdHlwZUNoYWluOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBiYXNlUHJvdG90eXBlLCBjaGFpbjtcbiAgICAgIGNoYWluID0gW107XG4gICAgICBiYXNlUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdCk7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjaGFpbi5wdXNoKG9iaik7XG4gICAgICAgIGlmICghKChvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgJiYgb2JqICE9PSBPYmplY3QgJiYgb2JqICE9PSBiYXNlUHJvdG90eXBlKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhaW47XG4gICAgfVxuICB9O1xuICByZXR1cm4gTWl4YWJsZTtcbn0pLmNhbGwodGhpcyk7XG5yZXR1cm4oTWl4YWJsZSk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL01peGFibGUuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIE92ZXJyaWRlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7T3ZlcnJpZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9T3ZlcnJpZGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuT3ZlcnJpZGVyPU92ZXJyaWRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLk92ZXJyaWRlcj1PdmVycmlkZXI7fX19KShmdW5jdGlvbigpe1xudmFyIE92ZXJyaWRlcjtcbk92ZXJyaWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgT3ZlcnJpZGVyIHtcbiAgICBzdGF0aWMgb3ZlcnJpZGVzKG92ZXJyaWRlcykge1xuICAgICAgcmV0dXJuIHRoaXMuT3ZlcnJpZGUuYXBwbHlNYW55KHRoaXMucHJvdG90eXBlLCB0aGlzLm5hbWUsIG92ZXJyaWRlcyk7XG4gICAgfVxuICAgIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gWydfb3ZlcnJpZGVzJ10uY29uY2F0KE9iamVjdC5rZXlzKHRoaXMuX292ZXJyaWRlcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgIH1cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBPdmVycmlkZXIuT3ZlcnJpZGUgPSB7XG4gICAgbWFrZU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcbiAgICAgIHZhciBmbiwga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBmbiA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICByZXN1bHRzLnB1c2gob3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgZm4pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgYXBwbHlNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBvdmVycmlkZSA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICBpZiAodHlwZW9mIG92ZXJyaWRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBvdmVycmlkZSA9IHRoaXMubWFrZSh0YXJnZXQsIG5hbWVzcGFjZSwga2V5LCBvdmVycmlkZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYXBwbHkodGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBmbk5hbWUsIGZuKSB7XG4gICAgICB2YXIgb3ZlcnJpZGU7XG4gICAgICBvdmVycmlkZSA9IHtcbiAgICAgICAgZm46IHtcbiAgICAgICAgICBjdXJyZW50OiBmblxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiBmbk5hbWVcbiAgICAgIH07XG4gICAgICBvdmVycmlkZS5mblsnd2l0aCcgKyBuYW1lc3BhY2VdID0gZm47XG4gICAgICByZXR1cm4gb3ZlcnJpZGU7XG4gICAgfSxcbiAgICBlbXB0eUZuOiBmdW5jdGlvbigpIHt9LFxuICAgIGFwcGx5OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGUpIHtcbiAgICAgIHZhciBmbk5hbWUsIG92ZXJyaWRlcywgcmVmLCByZWYxLCB3aXRob3V0O1xuICAgICAgZm5OYW1lID0gb3ZlcnJpZGUubmFtZTtcbiAgICAgIG92ZXJyaWRlcyA9IHRhcmdldC5fb3ZlcnJpZGVzICE9IG51bGwgPyBPYmplY3QuYXNzaWduKHt9LCB0YXJnZXQuX292ZXJyaWRlcykgOiB7fTtcbiAgICAgIHdpdGhvdXQgPSAoKHJlZiA9IHRhcmdldC5fb3ZlcnJpZGVzKSAhPSBudWxsID8gKHJlZjEgPSByZWZbZm5OYW1lXSkgIT0gbnVsbCA/IHJlZjEuZm4uY3VycmVudCA6IHZvaWQgMCA6IHZvaWQgMCkgfHwgdGFyZ2V0W2ZuTmFtZV07XG4gICAgICBvdmVycmlkZSA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlKTtcbiAgICAgIGlmIChvdmVycmlkZXNbZm5OYW1lXSAhPSBudWxsKSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGVzW2ZuTmFtZV0uZm4sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGUuZm4pO1xuICAgICAgfVxuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGhvdXQnICsgbmFtZXNwYWNlXSA9IHdpdGhvdXQgfHwgdGhpcy5lbXB0eUZuO1xuICAgICAgaWYgKHdpdGhvdXQgPT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5taXNzaW5nV2l0aG91dCA9ICd3aXRob3V0JyArIG5hbWVzcGFjZTtcbiAgICAgIH0gZWxzZSBpZiAob3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQpIHtcbiAgICAgICAgb3ZlcnJpZGUuZm5bb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXRdID0gd2l0aG91dDtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGZuTmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGZpbmFsRm4sIGZuLCBrZXksIHJlZjI7XG4gICAgICAgICAgZmluYWxGbiA9IG92ZXJyaWRlLmZuLmN1cnJlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgICByZWYyID0gb3ZlcnJpZGUuZm47XG4gICAgICAgICAgZm9yIChrZXkgaW4gcmVmMikge1xuICAgICAgICAgICAgZm4gPSByZWYyW2tleV07XG4gICAgICAgICAgICBmaW5hbEZuW2tleV0gPSBmbi5iaW5kKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBmbk5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGZpbmFsRm5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmluYWxGbjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvdmVycmlkZXNbZm5OYW1lXSA9IG92ZXJyaWRlO1xuICAgICAgcmV0dXJuIHRhcmdldC5fb3ZlcnJpZGVzID0gb3ZlcnJpZGVzO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIE92ZXJyaWRlcjtcbn0pLmNhbGwodGhpcyk7XG5yZXR1cm4oT3ZlcnJpZGVyKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvT3ZlcnJpZGVyLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7UHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Qcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLlByb3BlcnR5PVByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuUHJvcGVydHk9UHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHknKTtcbnZhciBDb2xsZWN0aW9uUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDb2xsZWN0aW9uUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ29sbGVjdGlvblByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NvbGxlY3Rpb25Qcm9wZXJ0eScpO1xudmFyIENvbXBvc2VkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDb21wb3NlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkNvbXBvc2VkUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29tcG9zZWRQcm9wZXJ0eScpO1xudmFyIER5bmFtaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkR5bmFtaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5EeW5hbWljUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5Jyk7XG52YXIgQ2FsY3VsYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ2FsY3VsYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkNhbGN1bGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHknKTtcbnZhciBJbnZhbGlkYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0ZWRQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHknKTtcbnZhciBBY3RpdmFibGVQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkFjdGl2YWJsZVByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkFjdGl2YWJsZVByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0FjdGl2YWJsZVByb3BlcnR5Jyk7XG52YXIgVXBkYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiVXBkYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLlVwZGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9VcGRhdGVkUHJvcGVydHknKTtcbnZhciBQcm9wZXJ0eU93bmVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiUHJvcGVydHlPd25lclwiKSA/IGRlcGVuZGVuY2llcy5Qcm9wZXJ0eU93bmVyIDogcmVxdWlyZSgnLi9Qcm9wZXJ0eU93bmVyJyk7XG52YXIgTWl4YWJsZSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk1peGFibGVcIikgPyBkZXBlbmRlbmNpZXMuTWl4YWJsZSA6IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xudmFyIFByb3BlcnR5O1xuUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFByb3BlcnR5IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIGJpbmQodGFyZ2V0KSB7XG4gICAgICB2YXIgcGFyZW50LCBwcm9wO1xuICAgICAgcHJvcCA9IHRoaXM7XG4gICAgICBpZiAoISh0eXBlb2YgdGFyZ2V0LmdldFByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmIHRhcmdldC5nZXRQcm9wZXJ0eSh0aGlzLm5hbWUpID09PSB0aGlzKSkge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldC5nZXRQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyAmJiAoKHBhcmVudCA9IHRhcmdldC5nZXRQcm9wZXJ0eSh0aGlzLm5hbWUpKSAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMub3ZlcnJpZGUocGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdldEluc3RhbmNlVHlwZSgpLmJpbmQodGFyZ2V0LCBwcm9wKTtcbiAgICAgICAgdGFyZ2V0Ll9wcm9wZXJ0aWVzID0gKHRhcmdldC5fcHJvcGVydGllcyB8fCBbXSkuY29uY2F0KFtwcm9wXSk7XG4gICAgICAgIGlmIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgIHRhcmdldC5fcHJvcGVydGllcyA9IHRhcmdldC5fcHJvcGVydGllcy5maWx0ZXIoZnVuY3Rpb24oZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBleGlzdGluZyAhPT0gcGFyZW50O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFrZU93bmVyKHRhcmdldCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcDtcbiAgICB9XG5cbiAgICBvdmVycmlkZShwYXJlbnQpIHtcbiAgICAgIHZhciBrZXksIHJlZiwgcmVzdWx0cywgdmFsdWU7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBhcmVudCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5wYXJlbnQgPSBwYXJlbnQub3B0aW9ucztcbiAgICAgICAgcmVmID0gcGFyZW50Lm9wdGlvbnM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChrZXkgaW4gcmVmKSB7XG4gICAgICAgICAgdmFsdWUgPSByZWZba2V5XTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9uc1trZXldID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMub3B0aW9uc1trZXldLm92ZXJyaWRlZCA9IHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnNba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm9wdGlvbnNba2V5XSA9IHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VPd25lcih0YXJnZXQpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoISgocmVmID0gdGFyZ2V0LmV4dGVuc2lvbnMpICE9IG51bGwgPyByZWYuaW5jbHVkZXMoUHJvcGVydHlPd25lci5wcm90b3R5cGUpIDogdm9pZCAwKSkge1xuICAgICAgICByZXR1cm4gTWl4YWJsZS5FeHRlbnNpb24ubWFrZShQcm9wZXJ0eU93bmVyLnByb3RvdHlwZSwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZVZhck5hbWUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmluc3RhbmNlVmFyTmFtZSB8fCAnXycgKyB0aGlzLm5hbWU7XG4gICAgfVxuXG4gICAgaXNJbnN0YW50aWF0ZWQob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW3RoaXMuZ2V0SW5zdGFuY2VWYXJOYW1lKCldICE9IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2Uob2JqKSB7XG4gICAgICB2YXIgVHlwZSwgdmFyTmFtZTtcbiAgICAgIHZhck5hbWUgPSB0aGlzLmdldEluc3RhbmNlVmFyTmFtZSgpO1xuICAgICAgaWYgKCF0aGlzLmlzSW5zdGFudGlhdGVkKG9iaikpIHtcbiAgICAgICAgVHlwZSA9IHRoaXMuZ2V0SW5zdGFuY2VUeXBlKCk7XG4gICAgICAgIG9ialt2YXJOYW1lXSA9IG5ldyBUeXBlKHRoaXMsIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqW3Zhck5hbWVdO1xuICAgIH1cblxuICAgIGdldEluc3RhbmNlVHlwZSgpIHtcbiAgICAgIGlmICghdGhpcy5pbnN0YW5jZVR5cGUpIHtcbiAgICAgICAgdGhpcy5jb21wb3NlcnMuZm9yRWFjaCgoY29tcG9zZXIpID0+IHtcbiAgICAgICAgICByZXR1cm4gY29tcG9zZXIuY29tcG9zZSh0aGlzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZVR5cGU7XG4gICAgfVxuXG4gIH07XG5cbiAgUHJvcGVydHkucHJvdG90eXBlLmNvbXBvc2VycyA9IFtDb21wb3NlZFByb3BlcnR5LCBDb2xsZWN0aW9uUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgQmFzaWNQcm9wZXJ0eSwgVXBkYXRlZFByb3BlcnR5LCBDYWxjdWxhdGVkUHJvcGVydHksIEludmFsaWRhdGVkUHJvcGVydHksIEFjdGl2YWJsZVByb3BlcnR5XTtcblxuICByZXR1cm4gUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihQcm9wZXJ0eSk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBQcm9wZXJ0eU93bmVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtQcm9wZXJ0eU93bmVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9UHJvcGVydHlPd25lcjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLlByb3BlcnR5T3duZXI9UHJvcGVydHlPd25lcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLlByb3BlcnR5T3duZXI9UHJvcGVydHlPd25lcjt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgUHJvcGVydHlPd25lcjtcblByb3BlcnR5T3duZXIgPSBjbGFzcyBQcm9wZXJ0eU93bmVyIHtcbiAgZ2V0UHJvcGVydHkobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzICYmIHRoaXMuX3Byb3BlcnRpZXMuZmluZChmdW5jdGlvbihwcm9wKSB7XG4gICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBuYW1lO1xuICAgIH0pO1xuICB9XG4gIGdldFByb3BlcnR5SW5zdGFuY2UobmFtZSkge1xuICAgIHZhciByZXM7XG4gICAgcmVzID0gdGhpcy5nZXRQcm9wZXJ0eShuYW1lKTtcbiAgICBpZiAocmVzKSB7XG4gICAgICByZXR1cm4gcmVzLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH1cbiAgfVxuICBnZXRQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnNsaWNlKCk7XG4gIH1cbiAgZ2V0UHJvcGVydHlJbnN0YW5jZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMubWFwKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKTtcbiAgICB9KTtcbiAgfVxuICBnZXRJbnN0YW50aWF0ZWRQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLmZpbHRlcigocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuaXNJbnN0YW50aWF0ZWQodGhpcyk7XG4gICAgfSkubWFwKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKTtcbiAgICB9KTtcbiAgfVxuICBnZXRNYW51YWxEYXRhUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5yZWR1Y2UoKHJlcywgcHJvcCkgPT4ge1xuICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgaWYgKHByb3AuaXNJbnN0YW50aWF0ZWQodGhpcykpIHtcbiAgICAgICAgaW5zdGFuY2UgPSBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgICAgICBpZiAoaW5zdGFuY2UuY2FsY3VsYXRlZCAmJiBpbnN0YW5jZS5tYW51YWwpIHtcbiAgICAgICAgICByZXNbcHJvcC5uYW1lXSA9IGluc3RhbmNlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sIHt9KTtcbiAgfVxuICBzZXRQcm9wZXJ0aWVzKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIHZhciBrZXksIHByb3AsIHZhbDtcbiAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICB2YWwgPSBkYXRhW2tleV07XG4gICAgICBpZiAoKChvcHRpb25zLndoaXRlbGlzdCA9PSBudWxsKSB8fCBvcHRpb25zLndoaXRlbGlzdC5pbmRleE9mKGtleSkgIT09IC0xKSAmJiAoKG9wdGlvbnMuYmxhY2tsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMuYmxhY2tsaXN0LmluZGV4T2Yoa2V5KSA9PT0gLTEpKSB7XG4gICAgICAgIHByb3AgPSB0aGlzLmdldFByb3BlcnR5SW5zdGFuY2Uoa2V5KTtcbiAgICAgICAgaWYgKHByb3AgIT0gbnVsbCkge1xuICAgICAgICAgIHByb3Auc2V0KHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgZGVzdHJveVByb3BlcnRpZXMoKSB7XG4gICAgdGhpcy5nZXRJbnN0YW50aWF0ZWRQcm9wZXJ0aWVzKCkuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuZGVzdHJveSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3Byb3BlcnRpZXMgPSBbXTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBsaXN0ZW5lckFkZGVkKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wLmdldEluc3RhbmNlVHlwZSgpLnByb3RvdHlwZS5jaGFuZ2VFdmVudE5hbWUgPT09IGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGV4dGVuZGVkKHRhcmdldCkge1xuICAgIHJldHVybiB0YXJnZXQubGlzdGVuZXJBZGRlZCA9IHRoaXMubGlzdGVuZXJBZGRlZDtcbiAgfVxufTtcbnJldHVybihQcm9wZXJ0eU93bmVyKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHlPd25lci5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQWN0aXZhYmxlUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0FjdGl2YWJsZVByb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9QWN0aXZhYmxlUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5BY3RpdmFibGVQcm9wZXJ0eT1BY3RpdmFibGVQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkFjdGl2YWJsZVByb3BlcnR5PUFjdGl2YWJsZVByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgQmFzaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJhc2ljUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQmFzaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQmFzaWNQcm9wZXJ0eScpO1xudmFyIE92ZXJyaWRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk92ZXJyaWRlclwiKSA/IGRlcGVuZGVuY2llcy5PdmVycmlkZXIgOiByZXF1aXJlKCcuLi9PdmVycmlkZXInKTtcbnZhciBBY3RpdmFibGVQcm9wZXJ0eTtcbkFjdGl2YWJsZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBBY3RpdmFibGVQcm9wZXJ0eSBleHRlbmRzIEJhc2ljUHJvcGVydHkge1xuICAgIGlzQWN0aXZlKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgbWFudWFsQWN0aXZlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICAgIH1cblxuICAgIGNhbGxiYWNrQWN0aXZlKCkge1xuICAgICAgdmFyIGludmFsaWRhdG9yO1xuICAgICAgaW52YWxpZGF0b3IgPSB0aGlzLmFjdGl2ZUludmFsaWRhdG9yIHx8IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLm9iaik7XG4gICAgICBpbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuYWN0aXZlRnVuY3QsIGludmFsaWRhdG9yKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAodGhpcy5hY3RpdmUgfHwgaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlSW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBpbnZhbGlkYXRvcjtcbiAgICAgICAgICB0aGlzLmFjdGl2ZUludmFsaWRhdG9yID0gaW52YWxpZGF0b3I7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5hY3RpdmU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuYWN0aXZlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChBY3RpdmFibGVQcm9wZXJ0eSk7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmFjdGl2ZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuYWN0aXZlID0gcHJvcC5vcHRpb25zLmFjdGl2ZTtcbiAgICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmlzQWN0aXZlID0gdGhpcy5wcm90b3R5cGUubWFudWFsQWN0aXZlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuYWN0aXZlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmFjdGl2ZUZ1bmN0ID0gcHJvcC5vcHRpb25zLmFjdGl2ZTtcbiAgICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmlzQWN0aXZlID0gdGhpcy5wcm90b3R5cGUuY2FsbGJhY2tBY3RpdmU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBBY3RpdmFibGVQcm9wZXJ0eS5leHRlbmQoT3ZlcnJpZGVyKTtcblxuICBBY3RpdmFibGVQcm9wZXJ0eS5vdmVycmlkZXMoe1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb3V0O1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUoKSkge1xuICAgICAgICBvdXQgPSB0aGlzLmdldC53aXRob3V0QWN0aXZhYmxlUHJvcGVydHkoKTtcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZWQodGhpcy5wZW5kaW5nT2xkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbml0aWF0ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2hhbmdlZDogZnVuY3Rpb24ob2xkKSB7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wZW5kaW5nT2xkID0gdm9pZCAwO1xuICAgICAgICB0aGlzLmNoYW5nZWQud2l0aG91dEFjdGl2YWJsZVByb3BlcnR5KG9sZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBlbmRpbmdPbGQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nT2xkID0gb2xkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBY3RpdmFibGVQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKEFjdGl2YWJsZVByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9BY3RpdmFibGVQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQmFzaWNQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QmFzaWNQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUJhc2ljUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5CYXNpY1Byb3BlcnR5PUJhc2ljUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5CYXNpY1Byb3BlcnR5PUJhc2ljUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBNaXhhYmxlID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiTWl4YWJsZVwiKSA/IGRlcGVuZGVuY2llcy5NaXhhYmxlIDogcmVxdWlyZSgnLi4vTWl4YWJsZScpO1xudmFyIEJhc2ljUHJvcGVydHk7XG5CYXNpY1Byb3BlcnR5ID0gY2xhc3MgQmFzaWNQcm9wZXJ0eSBleHRlbmRzIE1peGFibGUge1xuICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eSwgb2JqKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgdGhpcy5vYmogPSBvYmo7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluZ2VzdCh0aGlzLmRlZmF1bHQpO1xuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGdldCgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLm91dHB1dCgpO1xuICB9XG5cbiAgc2V0KHZhbCkge1xuICAgIHJldHVybiB0aGlzLnNldEFuZENoZWNrQ2hhbmdlcyh2YWwpO1xuICB9XG5cbiAgY2FsbGJhY2tTZXQodmFsKSB7XG4gICAgdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJzZXRcIiwgdmFsKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEFuZENoZWNrQ2hhbmdlcyh2YWwpIHtcbiAgICB2YXIgb2xkO1xuICAgIHZhbCA9IHRoaXMuaW5nZXN0KHZhbCk7XG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh2YWwsIHRoaXMudmFsdWUpKSB7XG4gICAgICBvbGQgPSB0aGlzLnZhbHVlO1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbDtcbiAgICAgIHRoaXMubWFudWFsID0gdHJ1ZTtcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNoZWNrQ2hhbmdlcyh2YWwsIG9sZCkge1xuICAgIHJldHVybiB2YWwgIT09IG9sZDtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7fVxuXG4gIGNhbGxPcHRpb25GdW5jdChmdW5jdCwgLi4uYXJncykge1xuICAgIGlmICh0eXBlb2YgZnVuY3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICBmdW5jdCA9IHRoaXMucHJvcGVydHkub3B0aW9uc1tmdW5jdF07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZnVuY3Qub3ZlcnJpZGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhcmdzLnB1c2goKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0Lm92ZXJyaWRlZCwgLi4uYXJncyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0LmFwcGx5KHRoaXMub2JqLCBhcmdzKTtcbiAgfVxuXG4gIHJldmFsaWRhdGVkKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGluZ2VzdCh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbmdlc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB2YWwgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcImluZ2VzdFwiLCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgfVxuXG4gIG91dHB1dCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9XG5cbiAgY2hhbmdlZChvbGQpIHtcbiAgICB0aGlzLmNhbGxDaGFuZ2VkRnVuY3Rpb25zKG9sZCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9iai5lbWl0RXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMub2JqLmVtaXRFdmVudCh0aGlzLnVwZGF0ZUV2ZW50TmFtZSwgW29sZF0pO1xuICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMuY2hhbmdlRXZlbnROYW1lLCBbb2xkXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2FsbENoYW5nZWRGdW5jdGlvbnMob2xkKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJjaGFuZ2VcIiwgb2xkKTtcbiAgICB9XG4gIH1cblxuICBoYXNDaGFuZ2VkRnVuY3Rpb25zKCkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIGhhc0NoYW5nZWRFdmVudHMoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLm9iai5nZXRMaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicgJiYgdGhpcy5vYmouZ2V0TGlzdGVuZXJzKHRoaXMuY2hhbmdlRXZlbnROYW1lKS5sZW5ndGggPiAwO1xuICB9XG5cbiAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgIGlmIChwcm9wLmluc3RhbmNlVHlwZSA9PSBudWxsKSB7XG4gICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7fTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuc2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuc2V0ID0gdGhpcy5wcm90b3R5cGUuY2FsbGJhY2tTZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5zZXQgPSB0aGlzLnByb3RvdHlwZS5zZXRBbmRDaGVja0NoYW5nZXM7XG4gICAgfVxuICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5kZWZhdWx0ID0gcHJvcC5vcHRpb25zLmRlZmF1bHQ7XG4gICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmluaXRpYXRlZCA9IHR5cGVvZiBwcm9wLm9wdGlvbnMuZGVmYXVsdCAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgcmV0dXJuIHRoaXMuc2V0RXZlbnROYW1lcyhwcm9wKTtcbiAgfVxuXG4gIHN0YXRpYyBzZXRFdmVudE5hbWVzKHByb3ApIHtcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2hhbmdlRXZlbnROYW1lID0gcHJvcC5vcHRpb25zLmNoYW5nZUV2ZW50TmFtZSB8fCBwcm9wLm5hbWUgKyAnQ2hhbmdlZCc7XG4gICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLnVwZGF0ZUV2ZW50TmFtZSA9IHByb3Aub3B0aW9ucy51cGRhdGVFdmVudE5hbWUgfHwgcHJvcC5uYW1lICsgJ1VwZGF0ZWQnO1xuICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaW52YWxpZGF0ZUV2ZW50TmFtZSA9IHByb3Aub3B0aW9ucy5pbnZhbGlkYXRlRXZlbnROYW1lIHx8IHByb3AubmFtZSArICdJbnZhbGlkYXRlZCc7XG4gIH1cblxuICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcbiAgICB2YXIgbWFqLCBvcHQ7XG4gICAgbWFqID0gcHJvcC5uYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5uYW1lLnNsaWNlKDEpO1xuICAgIG9wdCA9IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHByb3Aub3B0aW9ucy5zZXQgIT09IGZhbHNlKSB7XG4gICAgICBvcHQuc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLnNldCh2YWwpO1xuICAgICAgfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lLCBvcHQpO1xuICAgIHRhcmdldFsnZ2V0JyArIG1hal0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgIH07XG4gICAgaWYgKHByb3Aub3B0aW9ucy5zZXQgIT09IGZhbHNlKSB7XG4gICAgICB0YXJnZXRbJ3NldCcgKyBtYWpdID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuc2V0KHZhbCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFsnaW52YWxpZGF0ZScgKyBtYWpdID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmludmFsaWRhdGUoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cblxufTtcblxucmV0dXJuKEJhc2ljUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENhbGN1bGF0ZWRQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7Q2FsY3VsYXRlZFByb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q2FsY3VsYXRlZFByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ2FsY3VsYXRlZFByb3BlcnR5PUNhbGN1bGF0ZWRQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNhbGN1bGF0ZWRQcm9wZXJ0eT1DYWxjdWxhdGVkUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBEeW5hbWljUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJEeW5hbWljUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuRHluYW1pY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcbnZhciBPdmVycmlkZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJPdmVycmlkZXJcIikgPyBkZXBlbmRlbmNpZXMuT3ZlcnJpZGVyIDogcmVxdWlyZSgnLi4vT3ZlcnJpZGVyJyk7XG52YXIgQ2FsY3VsYXRlZFByb3BlcnR5O1xuQ2FsY3VsYXRlZFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDYWxjdWxhdGVkUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xuICAgIGNhbGN1bCgpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdCh0aGlzLmNhbGN1bEZ1bmN0KTtcbiAgICAgIHRoaXMubWFudWFsID0gZmFsc2U7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNhbGN1bEZ1bmN0ID0gcHJvcC5vcHRpb25zLmNhbGN1bDtcbiAgICAgICAgaWYgKCEocHJvcC5vcHRpb25zLmNhbGN1bC5sZW5ndGggPiAwKSkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5leHRlbmQoQ2FsY3VsYXRlZFByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIENhbGN1bGF0ZWRQcm9wZXJ0eS5leHRlbmQoT3ZlcnJpZGVyKTtcblxuICBDYWxjdWxhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGluaXRpYXRlZCwgb2xkO1xuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvci52YWxpZGF0ZVVua25vd25zKCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgICBvbGQgPSB0aGlzLnZhbHVlO1xuICAgICAgICBpbml0aWF0ZWQgPSB0aGlzLmluaXRpYXRlZDtcbiAgICAgICAgdGhpcy5jYWxjdWwoKTtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHRoaXMudmFsdWUsIG9sZCkpIHtcbiAgICAgICAgICBpZiAoaW5pdGlhdGVkKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm9iai5lbWl0RXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMub2JqLmVtaXRFdmVudCh0aGlzLnVwZGF0ZUV2ZW50TmFtZSwgW29sZF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ2FsY3VsYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oQ2FsY3VsYXRlZFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENvbGxlY3Rpb25Qcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7Q29sbGVjdGlvblByb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q29sbGVjdGlvblByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ29sbGVjdGlvblByb3BlcnR5PUNvbGxlY3Rpb25Qcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNvbGxlY3Rpb25Qcm9wZXJ0eT1Db2xsZWN0aW9uUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBEeW5hbWljUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJEeW5hbWljUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuRHluYW1pY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcbnZhciBDb2xsZWN0aW9uID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ29sbGVjdGlvblwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uIDogcmVxdWlyZSgnLi4vQ29sbGVjdGlvbicpO1xudmFyIENvbGxlY3Rpb25Qcm9wZXJ0eTtcbkNvbGxlY3Rpb25Qcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29sbGVjdGlvblByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBpbmdlc3QodmFsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbmdlc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdmFsLnRvQXJyYXkoKTtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHJldHVybiB2YWwuc2xpY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbdmFsXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0NoYW5nZWRJdGVtcyh2YWwsIG9sZCkge1xuICAgICAgdmFyIGNvbXBhcmVGdW5jdGlvbjtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IHRoaXMuY29sbGVjdGlvbk9wdGlvbnMuY29tcGFyZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAobmV3IENvbGxlY3Rpb24odmFsKSkuY2hlY2tDaGFuZ2VzKG9sZCwgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5vcmRlcmVkLCBjb21wYXJlRnVuY3Rpb24pO1xuICAgIH1cblxuICAgIG91dHB1dCgpIHtcbiAgICAgIHZhciBjb2wsIHByb3AsIHZhbHVlO1xuICAgICAgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJvdXRwdXRcIiwgdGhpcy52YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcm9wID0gdGhpcztcbiAgICAgIGNvbCA9IENvbGxlY3Rpb24ubmV3U3ViQ2xhc3ModGhpcy5jb2xsZWN0aW9uT3B0aW9ucywgdmFsdWUpO1xuICAgICAgY29sLmNoYW5nZWQgPSBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuY2hhbmdlZChvbGQpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBjb2w7XG4gICAgfVxuXG4gICAgY2FsbENoYW5nZWRGdW5jdGlvbnMob2xkKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pdGVtQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy52YWx1ZS5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgaWYgKCFvbGQuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcIml0ZW1BZGRlZFwiLCBpdGVtLCBpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaXRlbVJlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb2xkLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMudmFsdWUuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcIml0ZW1SZW1vdmVkXCIsIGl0ZW0sIGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VwZXIuY2FsbENoYW5nZWRGdW5jdGlvbnMob2xkKTtcbiAgICB9XG5cbiAgICBoYXNDaGFuZ2VkRnVuY3Rpb25zKCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmhhc0NoYW5nZWRGdW5jdGlvbnMoKSB8fCB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLml0ZW1BZGRlZCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLml0ZW1SZW1vdmVkID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBDb2xsZWN0aW9uUHJvcGVydHkge307XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jb2xsZWN0aW9uT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdENvbGxlY3Rpb25PcHRpb25zLCB0eXBlb2YgcHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gPT09ICdvYmplY3QnID8gcHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gOiB7fSk7XG4gICAgICAgIGlmIChwcm9wLm9wdGlvbnMuY29sbGVjdGlvbi5jb21wYXJlICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNoZWNrQ2hhbmdlcyA9IHRoaXMucHJvdG90eXBlLmNoZWNrQ2hhbmdlZEl0ZW1zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQ29sbGVjdGlvblByb3BlcnR5LmRlZmF1bHRDb2xsZWN0aW9uT3B0aW9ucyA9IHtcbiAgICBjb21wYXJlOiBmYWxzZSxcbiAgICBvcmRlcmVkOiB0cnVlXG4gIH07XG5cbiAgcmV0dXJuIENvbGxlY3Rpb25Qcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKENvbGxlY3Rpb25Qcm9wZXJ0eSk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBDb21wb3NlZFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb21wb3NlZFByb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q29tcG9zZWRQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkNvbXBvc2VkUHJvcGVydHk9Q29tcG9zZWRQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNvbXBvc2VkUHJvcGVydHk9Q29tcG9zZWRQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIENhbGN1bGF0ZWRQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNhbGN1bGF0ZWRQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5DYWxjdWxhdGVkUHJvcGVydHkgOiByZXF1aXJlKCcuL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xudmFyIENvbGxlY3Rpb24gPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDb2xsZWN0aW9uXCIpID8gZGVwZW5kZW5jaWVzLkNvbGxlY3Rpb24gOiByZXF1aXJlKCcuLi9Db2xsZWN0aW9uJyk7XG52YXIgQ29tcG9zZWRQcm9wZXJ0eTtcbkNvbXBvc2VkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbXBvc2VkUHJvcGVydHkgZXh0ZW5kcyBDYWxjdWxhdGVkUHJvcGVydHkge1xuICAgIGluaXQoKSB7XG4gICAgICBzdXBlci5pbml0KCk7XG4gICAgICByZXR1cm4gdGhpcy5pbml0Q29tcG9zZWQoKTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9zZWQoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmhhc093blByb3BlcnR5KCdkZWZhdWx0JykpIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlZmF1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnZhbHVlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVtYmVycyA9IG5ldyBDb21wb3NlZFByb3BlcnR5Lk1lbWJlcnModGhpcy5wcm9wZXJ0eS5vcHRpb25zLm1lbWJlcnMpO1xuICAgICAgdGhpcy5tZW1iZXJzLmNoYW5nZWQgPSAob2xkKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5qb2luID0gdHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA6IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSA/IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5vciA6IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5hbmQ7XG4gICAgfVxuXG4gICAgY2FsY3VsKCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5vYmopO1xuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5tZW1iZXJzLnJlZHVjZSgocHJldiwgbWVtYmVyKSA9PiB7XG4gICAgICAgICAgdmFyIHZhbDtcbiAgICAgICAgICB2YWwgPSB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nID8gbWVtYmVyKHRoaXMuaW52YWxpZGF0b3IpIDogbWVtYmVyO1xuICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4ocHJldiwgdmFsKTtcbiAgICAgICAgfSwgdGhpcy5kZWZhdWx0KTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQ29tcG9zZWRQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcbiAgICAgIENhbGN1bGF0ZWRQcm9wZXJ0eS5iaW5kKHRhcmdldCwgcHJvcCk7XG4gICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lICsgJ01lbWJlcnMnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5tZW1iZXJzO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBDb21wb3NlZFByb3BlcnR5LmpvaW5GdW5jdGlvbnMgPSB7XG4gICAgYW5kOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAmJiBiO1xuICAgIH0sXG4gICAgb3I6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIHx8IGI7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb21wb3NlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5Db21wb3NlZFByb3BlcnR5Lk1lbWJlcnMgPSBjbGFzcyBNZW1iZXJzIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGFkZFByb3BlcnR5UmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBmbjtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AobmFtZSwgb2JqKTtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopIHtcbiAgICB2YXIgZm47XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbiA9IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9O1xuICAgICAgZm4ucmVmID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgdmFsOiB2YWxcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBzZXRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbiwgaSwgcmVmO1xuICAgIGkgPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpID09PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkucmVmLnZhbCAhPT0gdmFsKSB7XG4gICAgICByZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSByZWY7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoaSwgZm4pO1xuICAgIH1cbiAgfVxuXG4gIGdldFZhbHVlUmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihuYW1lLCBvYmopLnJlZi52YWw7XG4gIH1cblxuICBhZGRGdW5jdGlvblJlZihmbiwgbmFtZSwgb2JqKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgZmluZEJ5UmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopXTtcbiAgfVxuXG4gIGZpbmRSZWZJbmRleChuYW1lLCBvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgcmV0dXJuIChtZW1iZXIucmVmICE9IG51bGwpICYmIG1lbWJlci5yZWYub2JqID09PSBvYmogJiYgbWVtYmVyLnJlZi5uYW1lID09PSBuYW1lO1xuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlUmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBpbmRleCwgb2xkO1xuICAgIGluZGV4ID0gdGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgfVxuICB9XG5cbn07XG5cbnJldHVybihDb21wb3NlZFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBEeW5hbWljUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0R5bmFtaWNQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUR5bmFtaWNQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkR5bmFtaWNQcm9wZXJ0eT1EeW5hbWljUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5EeW5hbWljUHJvcGVydHk9RHluYW1pY1Byb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgQmFzaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJhc2ljUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQmFzaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQmFzaWNQcm9wZXJ0eScpO1xudmFyIER5bmFtaWNQcm9wZXJ0eTtcbkR5bmFtaWNQcm9wZXJ0eSA9IGNsYXNzIER5bmFtaWNQcm9wZXJ0eSBleHRlbmRzIEJhc2ljUHJvcGVydHkge1xuICBjYWxsYmFja0dldCgpIHtcbiAgICB2YXIgcmVzO1xuICAgIHJlcyA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiZ2V0XCIpO1xuICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5jYWxjdWxhdGVkIHx8IHRoaXMuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2ludmFsaWRhdGVOb3RpY2UoKSB7XG4gICAgaWYgKHRoaXMuaXNJbW1lZGlhdGUoKSkge1xuICAgICAgdGhpcy5nZXQoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9iai5lbWl0RXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMuaW52YWxpZGF0ZUV2ZW50TmFtZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpc0ltbWVkaWF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmltbWVkaWF0ZSAhPT0gZmFsc2UgJiYgKHRoaXMucHJvcGVydHkub3B0aW9ucy5pbW1lZGlhdGUgPT09IHRydWUgfHwgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaW1tZWRpYXRlID09PSAnZnVuY3Rpb24nID8gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbW1lZGlhdGVcIikgOiB0aGlzLmhhc0NoYW5nZWRFdmVudHMoKSB8fCB0aGlzLmhhc0NoYW5nZWRGdW5jdGlvbnMoKSkpO1xuICB9XG5cbiAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLmFjdGl2ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmdldCA9IHRoaXMucHJvdG90eXBlLmNhbGxiYWNrR2V0O1xuICAgIH1cbiAgfVxuXG59O1xuXG5yZXR1cm4oRHluYW1pY1Byb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEludmFsaWRhdGVkUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0ludmFsaWRhdGVkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1JbnZhbGlkYXRlZFByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuSW52YWxpZGF0ZWRQcm9wZXJ0eT1JbnZhbGlkYXRlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuSW52YWxpZGF0ZWRQcm9wZXJ0eT1JbnZhbGlkYXRlZFByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgQ2FsY3VsYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ2FsY3VsYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkNhbGN1bGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG52YXIgSW52YWxpZGF0ZWRQcm9wZXJ0eTtcbkludmFsaWRhdGVkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEludmFsaWRhdGVkUHJvcGVydHkgZXh0ZW5kcyBDYWxjdWxhdGVkUHJvcGVydHkge1xuICAgIHVua25vd24oKSB7XG4gICAgICBpZiAodGhpcy5jYWxjdWxhdGVkIHx8IHRoaXMuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicgJiYgcHJvcC5vcHRpb25zLmNhbGN1bC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5leHRlbmQoSW52YWxpZGF0ZWRQcm9wZXJ0eSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgSW52YWxpZGF0ZWRQcm9wZXJ0eS5vdmVycmlkZXMoe1xuICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLm9iaik7XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdCh0aGlzLmNhbGN1bEZ1bmN0LCBpbnZhbGlkYXRvcik7XG4gICAgICAgIHRoaXMubWFudWFsID0gZmFsc2U7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgICAgaWYgKGludmFsaWRhdG9yLmlzRW1wdHkoKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dEludmFsaWRhdGVkUHJvcGVydHkoKTtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnZhbGlkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5faW52YWxpZGF0ZU5vdGljZSgpICYmICF0aGlzLmNhbGN1bGF0ZWQgJiYgKHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBJbnZhbGlkYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oSW52YWxpZGF0ZWRQcm9wZXJ0eSk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgVXBkYXRlZFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtVcGRhdGVkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1VcGRhdGVkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5VcGRhdGVkUHJvcGVydHk9VXBkYXRlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuVXBkYXRlZFByb3BlcnR5PVVwZGF0ZWRQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xudmFyIER5bmFtaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkR5bmFtaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5EeW5hbWljUHJvcGVydHkgOiByZXF1aXJlKCcuL0R5bmFtaWNQcm9wZXJ0eScpO1xudmFyIE92ZXJyaWRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk92ZXJyaWRlclwiKSA/IGRlcGVuZGVuY2llcy5PdmVycmlkZXIgOiByZXF1aXJlKCcuLi9PdmVycmlkZXInKTtcbnZhciBVcGRhdGVkUHJvcGVydHk7XG5VcGRhdGVkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFVwZGF0ZWRQcm9wZXJ0eSBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7XG4gICAgaW5pdFJldmFsaWRhdGUoKSB7XG4gICAgICB0aGlzLnJldmFsaWRhdGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZ2V0KCk7XG4gICAgICAgIHRoaXMuZ2V0VXBkYXRlcigpLnVuYmluZCgpO1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nQ2hhbmdlcykge1xuICAgICAgICAgIHRoaXMuY2hhbmdlZCh0aGlzLnBlbmRpbmdPbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucmV2YWxpZGF0ZUNhbGxiYWNrLm93bmVyID0gdGhpcztcbiAgICB9XG5cbiAgICBnZXRVcGRhdGVyKCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMudXBkYXRlciAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVyID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLnVwZGF0ZXI7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZXIuZ2V0QmluZGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZXIgPSB0aGlzLnVwZGF0ZXIuZ2V0QmluZGVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy51cGRhdGVyLmJpbmQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHRoaXMudXBkYXRlci51bmJpbmQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlciA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlci5jYWxsYmFjayA9IHRoaXMucmV2YWxpZGF0ZUNhbGxiYWNrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVyO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMudXBkYXRlciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5leHRlbmQoVXBkYXRlZFByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBVcGRhdGVkUHJvcGVydHkuZXh0ZW5kKE92ZXJyaWRlcik7XG5cbiAgVXBkYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmluaXQud2l0aG91dFVwZGF0ZWRQcm9wZXJ0eSgpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFJldmFsaWRhdGUoKTtcbiAgICB9LFxuICAgIF9pbnZhbGlkYXRlTm90aWNlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXM7XG4gICAgICByZXMgPSB0aGlzLl9pbnZhbGlkYXRlTm90aWNlLndpdGhvdXRVcGRhdGVkUHJvcGVydHkoKTtcbiAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgdGhpcy5nZXRVcGRhdGVyKCkuYmluZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuICAgIGlzSW1tZWRpYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGNoYW5nZWQ6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSB2b2lkIDA7XG4gICAgICAgIHRoaXMuY2hhbmdlZC53aXRob3V0VXBkYXRlZFByb3BlcnR5KG9sZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBlbmRpbmdPbGQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nT2xkID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0VXBkYXRlcigpLmJpbmQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFVwZGF0ZWRQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKFVwZGF0ZWRQcm9wZXJ0eSk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvVXBkYXRlZFByb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBVcGRhdGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtVcGRhdGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9VXBkYXRlcjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLlVwZGF0ZXI9VXBkYXRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLlVwZGF0ZXI9VXBkYXRlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJpbmRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJpbmRlclwiKSA/IGRlcGVuZGVuY2llcy5CaW5kZXIgOiByZXF1aXJlKCcuL0JpbmRlcicpO1xudmFyIFVwZGF0ZXI7XG5VcGRhdGVyID0gY2xhc3MgVXBkYXRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5uZXh0ID0gW107XG4gICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHZhciBjYWxsYmFjaztcbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLm5leHQgPSB0aGlzLmNhbGxiYWNrcy5zbGljZSgpO1xuICAgIHdoaWxlICh0aGlzLmNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tzLnNoaWZ0KCk7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudXBkYXRpbmcgJiYgIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgbmV4dFRpY2soY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgaWYgKCF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5leHQucHVzaChjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IHRoaXMuY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGluZGV4ID0gdGhpcy5uZXh0LmluZGV4T2YoY2FsbGJhY2spO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBnZXRCaW5kZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBVcGRhdGVyLkJpbmRlcih0aGlzKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICByZXR1cm4gdGhpcy5uZXh0ID0gW107XG4gIH1cblxufTtcblxuVXBkYXRlci5CaW5kZXIgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBjbGFzcyBCaW5kZXIgZXh0ZW5kcyBzdXBlckNsYXNzIHtcbiAgICBjb25zdHJ1Y3Rvcih0YXJnZXQsIGNhbGxiYWNrMSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrMTtcbiAgICB9XG5cbiAgICBnZXRSZWYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBkb0JpbmQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkQ2FsbGJhY2sodGhpcy5jYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZG9VbmJpbmQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlQ2FsbGJhY2sodGhpcy5jYWxsYmFjayk7XG4gICAgfVxuXG4gIH07XG5cbiAgcmV0dXJuIEJpbmRlcjtcblxufSkuY2FsbCh0aGlzLCBCaW5kZXIpO1xuXG5yZXR1cm4oVXBkYXRlcik7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1VwZGF0ZXIuanMubWFwXG4iLCJpZihtb2R1bGUpe1xuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBCaW5kZXI6IHJlcXVpcmUoJy4vQmluZGVyLmpzJyksXG4gICAgQ29sbGVjdGlvbjogcmVxdWlyZSgnLi9Db2xsZWN0aW9uLmpzJyksXG4gICAgRWxlbWVudDogcmVxdWlyZSgnLi9FbGVtZW50LmpzJyksXG4gICAgRXZlbnRCaW5kOiByZXF1aXJlKCcuL0V2ZW50QmluZC5qcycpLFxuICAgIEV2ZW50RW1pdHRlcjogcmVxdWlyZSgnLi9FdmVudEVtaXR0ZXIuanMnKSxcbiAgICBJbnZhbGlkYXRvcjogcmVxdWlyZSgnLi9JbnZhbGlkYXRvci5qcycpLFxuICAgIE1peGFibGU6IHJlcXVpcmUoJy4vTWl4YWJsZS5qcycpLFxuICAgIE92ZXJyaWRlcjogcmVxdWlyZSgnLi9PdmVycmlkZXIuanMnKSxcbiAgICBQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eS5qcycpLFxuICAgIFByb3BlcnR5T3duZXI6IHJlcXVpcmUoJy4vUHJvcGVydHlPd25lci5qcycpLFxuICAgIFVwZGF0ZXI6IHJlcXVpcmUoJy4vVXBkYXRlci5qcycpLFxuICAgIEFjdGl2YWJsZVByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQWN0aXZhYmxlUHJvcGVydHkuanMnKSxcbiAgICBCYXNpY1Byb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eS5qcycpLFxuICAgIENhbGN1bGF0ZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eS5qcycpLFxuICAgIENvbGxlY3Rpb25Qcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NvbGxlY3Rpb25Qcm9wZXJ0eS5qcycpLFxuICAgIENvbXBvc2VkUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzJyksXG4gICAgRHluYW1pY1Byb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5LmpzJyksXG4gICAgSW52YWxpZGF0ZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHkuanMnKSxcbiAgICBVcGRhdGVkUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9VcGRhdGVkUHJvcGVydHkuanMnKVxuICB9O1xufSIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgUGF0aEZpbmRlcj1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7UGF0aEZpbmRlci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVBhdGhGaW5kZXI7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5QYXRoRmluZGVyPVBhdGhGaW5kZXI7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5QYXRoRmluZGVyPVBhdGhGaW5kZXI7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgUGF0aEZpbmRlcjtcblBhdGhGaW5kZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFBhdGhGaW5kZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0NvbnRhaW5lciwgZnJvbTEsIHRvMSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy50aWxlc0NvbnRhaW5lciA9IHRpbGVzQ29udGFpbmVyO1xuICAgICAgdGhpcy5mcm9tID0gZnJvbTE7XG4gICAgICB0aGlzLnRvID0gdG8xO1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgaWYgKG9wdGlvbnMudmFsaWRUaWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy52YWxpZFRpbGVDYWxsYmFjayA9IG9wdGlvbnMudmFsaWRUaWxlO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuYXJyaXZlZCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYXJyaXZlZENhbGxiYWNrID0gb3B0aW9ucy5hcnJpdmVkO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuZWZmaWNpZW5jeSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeUNhbGxiYWNrID0gb3B0aW9ucy5lZmZpY2llbmN5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0KCkge1xuICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgdGhpcy5wYXRocyA9IHt9O1xuICAgICAgdGhpcy5zb2x1dGlvbiA9IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY2FsY3VsKCkge1xuICAgICAgd2hpbGUgKCF0aGlzLnNvbHV0aW9uICYmICghdGhpcy5zdGFydGVkIHx8IHRoaXMucXVldWUubGVuZ3RoKSkge1xuICAgICAgICB0aGlzLnN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmdldFBhdGgoKTtcbiAgICB9XG5cbiAgICBzdGVwKCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMucXVldWUucG9wKCk7XG4gICAgICAgIHRoaXMuYWRkTmV4dFN0ZXBzKG5leHQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGlzLnRvID09PSBmYWxzZSB8fCB0aGlzLnRpbGVJc1ZhbGlkKHRoaXMudG8pKSB7XG4gICAgICAgIHRoaXMuYWRkTmV4dFN0ZXBzKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBhdGgoKSB7XG4gICAgICB2YXIgcmVzLCBzdGVwO1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgcmVzID0gW3RoaXMuc29sdXRpb25dO1xuICAgICAgICBzdGVwID0gdGhpcy5zb2x1dGlvbjtcbiAgICAgICAgd2hpbGUgKHN0ZXAucHJldiAhPSBudWxsKSB7XG4gICAgICAgICAgcmVzLnVuc2hpZnQoc3RlcC5wcmV2KTtcbiAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UG9zQXRQcmMocHJjKSB7XG4gICAgICBpZiAoaXNOYU4ocHJjKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQb3NBdFRpbWUodGhpcy5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpICogcHJjKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb3NBdFRpbWUodGltZSkge1xuICAgICAgdmFyIHByYywgc3RlcDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIGlmICh0aW1lID49IHRoaXMuc29sdXRpb24uZ2V0VG90YWxMZW5ndGgoKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNvbHV0aW9uLnBvc1RvVGlsZU9mZnNldCh0aGlzLnNvbHV0aW9uLmdldEV4aXQoKS54LCB0aGlzLnNvbHV0aW9uLmdldEV4aXQoKS55KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGVwID0gdGhpcy5zb2x1dGlvbjtcbiAgICAgICAgICB3aGlsZSAoc3RlcC5nZXRTdGFydExlbmd0aCgpID4gdGltZSAmJiAoc3RlcC5wcmV2ICE9IG51bGwpKSB7XG4gICAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmMgPSAodGltZSAtIHN0ZXAuZ2V0U3RhcnRMZW5ndGgoKSkgLyBzdGVwLmdldExlbmd0aCgpO1xuICAgICAgICAgIHJldHVybiBzdGVwLnBvc1RvVGlsZU9mZnNldChzdGVwLmdldEVudHJ5KCkueCArIChzdGVwLmdldEV4aXQoKS54IC0gc3RlcC5nZXRFbnRyeSgpLngpICogcHJjLCBzdGVwLmdldEVudHJ5KCkueSArIChzdGVwLmdldEV4aXQoKS55IC0gc3RlcC5nZXRFbnRyeSgpLnkpICogcHJjKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGdldFNvbHV0aW9uVGlsZUxpc3QoKSB7XG4gICAgICB2YXIgc3RlcCwgdGlsZWxpc3Q7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICBzdGVwID0gdGhpcy5zb2x1dGlvbjtcbiAgICAgICAgdGlsZWxpc3QgPSBbc3RlcC50aWxlXTtcbiAgICAgICAgd2hpbGUgKHN0ZXAucHJldiAhPSBudWxsKSB7XG4gICAgICAgICAgc3RlcCA9IHN0ZXAucHJldjtcbiAgICAgICAgICB0aWxlbGlzdC51bnNoaWZ0KHN0ZXAudGlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGVsaXN0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRpbGVJc1ZhbGlkKHRpbGUpIHtcbiAgICAgIGlmICh0aGlzLnZhbGlkVGlsZUNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sodGlsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCkgJiYgKCF0aWxlLmVtdWxhdGVkIHx8ICh0aWxlLnRpbGUgIT09IDAgJiYgdGlsZS50aWxlICE9PSBmYWxzZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFRpbGUoeCwgeSkge1xuICAgICAgdmFyIHJlZjE7XG4gICAgICBpZiAodGhpcy50aWxlc0NvbnRhaW5lci5nZXRUaWxlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNDb250YWluZXIuZ2V0VGlsZSh4LCB5KTtcbiAgICAgIH0gZWxzZSBpZiAoKChyZWYxID0gdGhpcy50aWxlc0NvbnRhaW5lclt5XSkgIT0gbnVsbCA/IHJlZjFbeF0gOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiB4LFxuICAgICAgICAgIHk6IHksXG4gICAgICAgICAgdGlsZTogdGhpcy50aWxlc0NvbnRhaW5lclt5XVt4XSxcbiAgICAgICAgICBlbXVsYXRlZDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldENvbm5lY3RlZFRvVGlsZSh0aWxlKSB7XG4gICAgICB2YXIgY29ubmVjdGVkLCB0O1xuICAgICAgaWYgKHRpbGUuZ2V0Q29ubmVjdGVkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRpbGUuZ2V0Q29ubmVjdGVkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25uZWN0ZWQgPSBbXTtcbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54ICsgMSwgdGlsZS55KSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCAtIDEsIHRpbGUueSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLngsIHRpbGUueSArIDEpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54LCB0aWxlLnkgLSAxKSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25uZWN0ZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkTmV4dFN0ZXBzKHN0ZXAgPSBudWxsKSB7XG4gICAgICB2YXIgaSwgbGVuLCBuZXh0LCByZWYxLCByZXN1bHRzLCB0aWxlO1xuICAgICAgdGlsZSA9IHN0ZXAgIT0gbnVsbCA/IHN0ZXAubmV4dFRpbGUgOiB0aGlzLmZyb207XG4gICAgICByZWYxID0gdGhpcy5nZXRDb25uZWN0ZWRUb1RpbGUodGlsZSk7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYxLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIG5leHQgPSByZWYxW2ldO1xuICAgICAgICBpZiAodGhpcy50aWxlSXNWYWxpZChuZXh0KSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFkZFN0ZXAobmV3IFBhdGhGaW5kZXIuU3RlcCh0aGlzLCAoc3RlcCAhPSBudWxsID8gc3RlcCA6IG51bGwpLCB0aWxlLCBuZXh0KSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICB0aWxlRXF1YWwodGlsZUEsIHRpbGVCKSB7XG4gICAgICByZXR1cm4gdGlsZUEgPT09IHRpbGVCIHx8ICgodGlsZUEuZW11bGF0ZWQgfHwgdGlsZUIuZW11bGF0ZWQpICYmIHRpbGVBLnggPT09IHRpbGVCLnggJiYgdGlsZUEueSA9PT0gdGlsZUIueSk7XG4gICAgfVxuXG4gICAgYXJyaXZlZEF0RGVzdGluYXRpb24oc3RlcCkge1xuICAgICAgaWYgKHRoaXMuYXJyaXZlZENhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyaXZlZENhbGxiYWNrKHN0ZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZUVxdWFsKHN0ZXAudGlsZSwgdGhpcy50byk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkU3RlcChzdGVwKSB7XG4gICAgICB2YXIgc29sdXRpb25DYW5kaWRhdGU7XG4gICAgICBpZiAodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICghKCh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldICE9IG51bGwpICYmIHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0uZ2V0VG90YWxMZW5ndGgoKSA8PSBzdGVwLmdldFRvdGFsTGVuZ3RoKCkpKSB7XG4gICAgICAgIGlmICh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZVN0ZXAodGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XSA9IHN0ZXA7XG4gICAgICAgIHRoaXMucXVldWUuc3BsaWNlKHRoaXMuZ2V0U3RlcFJhbmsoc3RlcCksIDAsIHN0ZXApO1xuICAgICAgICBzb2x1dGlvbkNhbmRpZGF0ZSA9IG5ldyBQYXRoRmluZGVyLlN0ZXAodGhpcywgc3RlcCwgc3RlcC5uZXh0VGlsZSwgbnVsbCk7XG4gICAgICAgIGlmICh0aGlzLmFycml2ZWRBdERlc3RpbmF0aW9uKHNvbHV0aW9uQ2FuZGlkYXRlKSAmJiAhKCh0aGlzLnNvbHV0aW9uICE9IG51bGwpICYmIHRoaXMuc29sdXRpb24ucHJldi5nZXRUb3RhbExlbmd0aCgpIDw9IHN0ZXAuZ2V0VG90YWxMZW5ndGgoKSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zb2x1dGlvbiA9IHNvbHV0aW9uQ2FuZGlkYXRlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlU3RlcChzdGVwKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpbmRleCA9IHRoaXMucXVldWUuaW5kZXhPZihzdGVwKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYmVzdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlW3RoaXMucXVldWUubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgZ2V0U3RlcFJhbmsoc3RlcCkge1xuICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKHN0ZXAuZ2V0RWZmaWNpZW5jeSgpLCAwLCB0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCBtaW4sIG1heCkge1xuICAgICAgdmFyIHJlZiwgcmVmUG9zO1xuICAgICAgcmVmUG9zID0gTWF0aC5mbG9vcigobWF4IC0gbWluKSAvIDIpICsgbWluO1xuICAgICAgcmVmID0gdGhpcy5xdWV1ZVtyZWZQb3NdLmdldEVmZmljaWVuY3koKTtcbiAgICAgIGlmIChyZWYgPT09IGVmZmljaWVuY3kpIHtcbiAgICAgICAgcmV0dXJuIHJlZlBvcztcbiAgICAgIH0gZWxzZSBpZiAocmVmID4gZWZmaWNpZW5jeSkge1xuICAgICAgICBpZiAocmVmUG9zID09PSBtaW4pIHtcbiAgICAgICAgICByZXR1cm4gbWluO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCBtaW4sIHJlZlBvcyAtIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVmUG9zID09PSBtYXgpIHtcbiAgICAgICAgICByZXR1cm4gbWF4ICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoZWZmaWNpZW5jeSwgcmVmUG9zICsgMSwgbWF4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFBhdGhGaW5kZXIucHJvcGVydGllcyh7XG4gICAgdmFsaWRUaWxlQ2FsbGJhY2s6IHt9XG4gIH0pO1xuXG4gIHJldHVybiBQYXRoRmluZGVyO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5QYXRoRmluZGVyLlN0ZXAgPSBjbGFzcyBTdGVwIHtcbiAgY29uc3RydWN0b3IocGF0aEZpbmRlciwgcHJldiwgdGlsZTEsIG5leHRUaWxlKSB7XG4gICAgdGhpcy5wYXRoRmluZGVyID0gcGF0aEZpbmRlcjtcbiAgICB0aGlzLnByZXYgPSBwcmV2O1xuICAgIHRoaXMudGlsZSA9IHRpbGUxO1xuICAgIHRoaXMubmV4dFRpbGUgPSBuZXh0VGlsZTtcbiAgfVxuXG4gIHBvc1RvVGlsZU9mZnNldCh4LCB5KSB7XG4gICAgdmFyIHRpbGU7XG4gICAgdGlsZSA9IE1hdGguZmxvb3IoeCkgPT09IHRoaXMudGlsZS54ICYmIE1hdGguZmxvb3IoeSkgPT09IHRoaXMudGlsZS55ID8gdGhpcy50aWxlIDogKHRoaXMubmV4dFRpbGUgIT0gbnVsbCkgJiYgTWF0aC5mbG9vcih4KSA9PT0gdGhpcy5uZXh0VGlsZS54ICYmIE1hdGguZmxvb3IoeSkgPT09IHRoaXMubmV4dFRpbGUueSA/IHRoaXMubmV4dFRpbGUgOiAodGhpcy5wcmV2ICE9IG51bGwpICYmIE1hdGguZmxvb3IoeCkgPT09IHRoaXMucHJldi50aWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy5wcmV2LnRpbGUueSA/IHRoaXMucHJldi50aWxlIDogY29uc29sZS5sb2coJ01hdGguZmxvb3IoJyArIHggKyAnKSA9PSAnICsgdGhpcy50aWxlLngsICdNYXRoLmZsb29yKCcgKyB5ICsgJykgPT0gJyArIHRoaXMudGlsZS55LCB0aGlzKTtcbiAgICByZXR1cm4ge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICB0aWxlOiB0aWxlLFxuICAgICAgb2Zmc2V0WDogeCAtIHRpbGUueCxcbiAgICAgIG9mZnNldFk6IHkgLSB0aWxlLnlcbiAgICB9O1xuICB9XG5cbiAgZ2V0RXhpdCgpIHtcbiAgICBpZiAodGhpcy5leGl0ID09IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLm5leHRUaWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5leGl0ID0ge1xuICAgICAgICAgIHg6ICh0aGlzLnRpbGUueCArIHRoaXMubmV4dFRpbGUueCArIDEpIC8gMixcbiAgICAgICAgICB5OiAodGhpcy50aWxlLnkgKyB0aGlzLm5leHRUaWxlLnkgKyAxKSAvIDJcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZXhpdCA9IHtcbiAgICAgICAgICB4OiB0aGlzLnRpbGUueCArIDAuNSxcbiAgICAgICAgICB5OiB0aGlzLnRpbGUueSArIDAuNVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGl0O1xuICB9XG5cbiAgZ2V0RW50cnkoKSB7XG4gICAgaWYgKHRoaXMuZW50cnkgPT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMucHJldiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuZW50cnkgPSB7XG4gICAgICAgICAgeDogKHRoaXMudGlsZS54ICsgdGhpcy5wcmV2LnRpbGUueCArIDEpIC8gMixcbiAgICAgICAgICB5OiAodGhpcy50aWxlLnkgKyB0aGlzLnByZXYudGlsZS55ICsgMSkgLyAyXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVudHJ5ID0ge1xuICAgICAgICAgIHg6IHRoaXMudGlsZS54ICsgMC41LFxuICAgICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVudHJ5O1xuICB9XG5cbiAgZ2V0TGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9ICh0aGlzLm5leHRUaWxlID09IG51bGwpIHx8ICh0aGlzLnByZXYgPT0gbnVsbCkgPyAwLjUgOiB0aGlzLnByZXYudGlsZS54ID09PSB0aGlzLm5leHRUaWxlLnggfHwgdGhpcy5wcmV2LnRpbGUueSA9PT0gdGhpcy5uZXh0VGlsZS55ID8gMSA6IE1hdGguc3FydCgwLjUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5sZW5ndGg7XG4gIH1cblxuICBnZXRTdGFydExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy5zdGFydExlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXJ0TGVuZ3RoID0gdGhpcy5wcmV2ICE9IG51bGwgPyB0aGlzLnByZXYuZ2V0VG90YWxMZW5ndGgoKSA6IDA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXJ0TGVuZ3RoO1xuICB9XG5cbiAgZ2V0VG90YWxMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMudG90YWxMZW5ndGggPT0gbnVsbCkge1xuICAgICAgdGhpcy50b3RhbExlbmd0aCA9IHRoaXMuZ2V0U3RhcnRMZW5ndGgoKSArIHRoaXMuZ2V0TGVuZ3RoKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRvdGFsTGVuZ3RoO1xuICB9XG5cbiAgZ2V0RWZmaWNpZW5jeSgpIHtcbiAgICBpZiAodGhpcy5lZmZpY2llbmN5ID09IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXRoRmluZGVyLmVmZmljaWVuY3lDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeSA9IHRoaXMucGF0aEZpbmRlci5lZmZpY2llbmN5Q2FsbGJhY2sodGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVmZmljaWVuY3kgPSAtdGhpcy5nZXRSZW1haW5pbmcoKSAqIDEuMSAtIHRoaXMuZ2V0VG90YWxMZW5ndGgoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWZmaWNpZW5jeTtcbiAgfVxuXG4gIGdldFJlbWFpbmluZygpIHtcbiAgICB2YXIgZnJvbSwgdG8sIHgsIHk7XG4gICAgaWYgKHRoaXMucmVtYWluaW5nID09IG51bGwpIHtcbiAgICAgIGZyb20gPSB0aGlzLmdldEV4aXQoKTtcbiAgICAgIHRvID0ge1xuICAgICAgICB4OiB0aGlzLnBhdGhGaW5kZXIudG8ueCArIDAuNSxcbiAgICAgICAgeTogdGhpcy5wYXRoRmluZGVyLnRvLnkgKyAwLjVcbiAgICAgIH07XG4gICAgICB4ID0gdG8ueCAtIGZyb20ueDtcbiAgICAgIHkgPSB0by55IC0gZnJvbS55O1xuICAgICAgdGhpcy5yZW1haW5pbmcgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbWFpbmluZztcbiAgfVxuXG59O1xuXG5yZXR1cm4oUGF0aEZpbmRlcik7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBEaXJlY3Rpb249ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO0RpcmVjdGlvbi5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPURpcmVjdGlvbjt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkRpcmVjdGlvbj1EaXJlY3Rpb247fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5EaXJlY3Rpb249RGlyZWN0aW9uO319fSkoZnVuY3Rpb24oKXtcbnZhciBEaXJlY3Rpb247XG5EaXJlY3Rpb24gPSBjbGFzcyBEaXJlY3Rpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lLCB4LCB5LCBpbnZlcnNlTmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuaW52ZXJzZU5hbWUgPSBpbnZlcnNlTmFtZTtcbiAgfVxuICBnZXRJbnZlcnNlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yW3RoaXMuaW52ZXJzZU5hbWVdO1xuICB9XG59O1xuRGlyZWN0aW9uLnVwID0gbmV3IERpcmVjdGlvbigndXAnLCAwLCAtMSwgJ2Rvd24nKTtcbkRpcmVjdGlvbi5kb3duID0gbmV3IERpcmVjdGlvbignZG93bicsIDAsIDEsICd1cCcpO1xuRGlyZWN0aW9uLmxlZnQgPSBuZXcgRGlyZWN0aW9uKCdsZWZ0JywgLTEsIDAsICdyaWdodCcpO1xuRGlyZWN0aW9uLnJpZ2h0ID0gbmV3IERpcmVjdGlvbigncmlnaHQnLCAxLCAwLCAnbGVmdCcpO1xuRGlyZWN0aW9uLmFkamFjZW50cyA9IFtEaXJlY3Rpb24udXAsIERpcmVjdGlvbi5kb3duLCBEaXJlY3Rpb24ubGVmdCwgRGlyZWN0aW9uLnJpZ2h0XTtcbkRpcmVjdGlvbi50b3BMZWZ0ID0gbmV3IERpcmVjdGlvbigndG9wTGVmdCcsIC0xLCAtMSwgJ2JvdHRvbVJpZ2h0Jyk7XG5EaXJlY3Rpb24udG9wUmlnaHQgPSBuZXcgRGlyZWN0aW9uKCd0b3BSaWdodCcsIDEsIC0xLCAnYm90dG9tTGVmdCcpO1xuRGlyZWN0aW9uLmJvdHRvbVJpZ2h0ID0gbmV3IERpcmVjdGlvbignYm90dG9tUmlnaHQnLCAxLCAxLCAndG9wTGVmdCcpO1xuRGlyZWN0aW9uLmJvdHRvbUxlZnQgPSBuZXcgRGlyZWN0aW9uKCdib3R0b21MZWZ0JywgLTEsIDEsICd0b3BSaWdodCcpO1xuRGlyZWN0aW9uLmNvcm5lcnMgPSBbRGlyZWN0aW9uLnRvcExlZnQsIERpcmVjdGlvbi50b3BSaWdodCwgRGlyZWN0aW9uLmJvdHRvbVJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tTGVmdF07XG5EaXJlY3Rpb24uYWxsID0gW0RpcmVjdGlvbi51cCwgRGlyZWN0aW9uLmRvd24sIERpcmVjdGlvbi5sZWZ0LCBEaXJlY3Rpb24ucmlnaHQsIERpcmVjdGlvbi50b3BMZWZ0LCBEaXJlY3Rpb24udG9wUmlnaHQsIERpcmVjdGlvbi5ib3R0b21SaWdodCwgRGlyZWN0aW9uLmJvdHRvbUxlZnRdO1xucmV0dXJuKERpcmVjdGlvbik7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaWxlPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtUaWxlLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9VGlsZTt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbGU9VGlsZTt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLlRpbGU9VGlsZTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBEaXJlY3Rpb24gPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJEaXJlY3Rpb25cIikgPyBkZXBlbmRlbmNpZXMuRGlyZWN0aW9uIDogcmVxdWlyZSgnLi9EaXJlY3Rpb24nKTtcbnZhciBUaWxlO1xuVGlsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGlsZSBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHgxLCB5MSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMueCA9IHgxO1xuICAgICAgdGhpcy55ID0geTE7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgdmFyIGNvbnRhaW5lcjtcbiAgICAgIHJldHVybiBjb250YWluZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGdldFJlbGF0aXZlVGlsZSh4LCB5KSB7XG4gICAgICBpZiAodGhpcy5jb250YWluZXIgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXIuZ2V0VGlsZSh0aGlzLnggKyB4LCB0aGlzLnkgKyB5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kRGlyZWN0aW9uT2YodGlsZSkge1xuICAgICAgaWYgKHRpbGUudGlsZSkge1xuICAgICAgICB0aWxlID0gdGlsZS50aWxlO1xuICAgICAgfVxuICAgICAgaWYgKCh0aWxlLnggIT0gbnVsbCkgJiYgKHRpbGUueSAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gRGlyZWN0aW9uLmFsbC5maW5kKChkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGQueCA9PT0gdGlsZS54IC0gdGhpcy54ICYmIGQueSA9PT0gdGlsZS55IC0gdGhpcy55O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRDaGlsZChjaGlsZCwgY2hlY2tSZWYgPSB0cnVlKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgICBpZiAoY2hlY2tSZWYpIHtcbiAgICAgICAgY2hpbGQudGlsZSA9IHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2hpbGQoY2hpbGQsIGNoZWNrUmVmID0gdHJ1ZSkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGNoZWNrUmVmICYmIGNoaWxkLnRpbGUgPT09IHRoaXMpIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkLnRpbGUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRpc3QodGlsZSkge1xuICAgICAgdmFyIGN0bkRpc3QsIHJlZiwgeCwgeTtcbiAgICAgIGlmICgodGlsZSAhPSBudWxsID8gdGlsZS5nZXRGaW5hbFRpbGUgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgICB9XG4gICAgICBpZiAoKCh0aWxlICE9IG51bGwgPyB0aWxlLnggOiB2b2lkIDApICE9IG51bGwpICYmICh0aWxlLnkgIT0gbnVsbCkgJiYgKHRoaXMueCAhPSBudWxsKSAmJiAodGhpcy55ICE9IG51bGwpICYmICh0aGlzLmNvbnRhaW5lciA9PT0gdGlsZS5jb250YWluZXIgfHwgKGN0bkRpc3QgPSAocmVmID0gdGhpcy5jb250YWluZXIpICE9IG51bGwgPyB0eXBlb2YgcmVmLmRpc3QgPT09IFwiZnVuY3Rpb25cIiA/IHJlZi5kaXN0KHRpbGUuY29udGFpbmVyKSA6IHZvaWQgMCA6IHZvaWQgMCkpKSB7XG4gICAgICAgIHggPSB0aWxlLnggLSB0aGlzLng7XG4gICAgICAgIHkgPSB0aWxlLnkgLSB0aGlzLnk7XG4gICAgICAgIGlmIChjdG5EaXN0KSB7XG4gICAgICAgICAgeCArPSBjdG5EaXN0Lng7XG4gICAgICAgICAgeSArPSBjdG5EaXN0Lnk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiB4LFxuICAgICAgICAgIHk6IHksXG4gICAgICAgICAgbGVuZ3RoOiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldEZpbmFsVGlsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICB9O1xuXG4gIFRpbGUucHJvcGVydGllcyh7XG4gICAgY2hpbGRyZW46IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9LFxuICAgIGNvbnRhaW5lcjoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGphY2VudFRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRpbGUuaW52YWxpZGF0ZUFkamFjZW50VGlsZXMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYWRqYWNlbnRUaWxlczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRpb24pIHtcbiAgICAgICAgaWYgKGludmFsaWRhdGlvbi5wcm9wKCdjb250YWluZXInKSkge1xuICAgICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWRqYWNlbnRzLm1hcCgoZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpdmVUaWxlKGQueCwgZC55KTtcbiAgICAgICAgICB9KS5maWx0ZXIoKHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0ICE9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKFRpbGUpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgVGlsZUNvbnRhaW5lcj1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7VGlsZUNvbnRhaW5lci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbGVDb250YWluZXI7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5UaWxlQ29udGFpbmVyPVRpbGVDb250YWluZXI7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaWxlQ29udGFpbmVyPVRpbGVDb250YWluZXI7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgVGlsZVJlZmVyZW5jZSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIlRpbGVSZWZlcmVuY2VcIikgPyBkZXBlbmRlbmNpZXMuVGlsZVJlZmVyZW5jZSA6IHJlcXVpcmUoJy4vVGlsZVJlZmVyZW5jZScpO1xudmFyIFRpbGVDb250YWluZXI7XG5UaWxlQ29udGFpbmVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlQ29udGFpbmVyIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpIHtcbiAgICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgdGlsZS55IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgYm91bmRhcmllcy50b3AgPSB0aWxlLnk7XG4gICAgICB9XG4gICAgICBpZiAoKGJvdW5kYXJpZXMubGVmdCA9PSBudWxsKSB8fCB0aWxlLnggPCBib3VuZGFyaWVzLmxlZnQpIHtcbiAgICAgICAgYm91bmRhcmllcy5sZWZ0ID0gdGlsZS54O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB0aWxlLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHRpbGUueTtcbiAgICAgIH1cbiAgICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCB0aWxlLnggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBib3VuZGFyaWVzLnJpZ2h0ID0gdGlsZS54O1xuICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLmNvb3JkcyA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXMudGlsZXMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGRUaWxlKHRpbGUpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoIXRoaXMudGlsZXMuaW5jbHVkZXModGlsZSkpIHtcbiAgICAgICAgdGhpcy50aWxlcy5wdXNoKHRpbGUpO1xuICAgICAgICBpZiAodGhpcy5jb29yZHNbdGlsZS54XSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29vcmRzW3RpbGUueF1bdGlsZS55XSA9IHRpbGU7XG4gICAgICAgIGlmICh0aGlzLm93bmVyKSB7XG4gICAgICAgICAgdGlsZS5jb250YWluZXIgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVmID0gdGhpcy5fYm91bmRhcmllcykgIT0gbnVsbCA/IHJlZi5jYWxjdWxhdGVkIDogdm9pZCAwKSB7XG4gICAgICAgICAgdGhpcy5fYWRkVG9Cb25kYXJpZXModGlsZSwgdGhpcy5fYm91bmRhcmllcy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlbW92ZVRpbGUodGlsZSkge1xuICAgICAgdmFyIGluZGV4LCByZWY7XG4gICAgICBpbmRleCA9IHRoaXMudGlsZXMuaW5kZXhPZih0aWxlKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMudGlsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuY29vcmRzW3RpbGUueF1bdGlsZS55XTtcbiAgICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYgPSB0aGlzLl9ib3VuZGFyaWVzKSAhPSBudWxsID8gcmVmLmNhbGN1bGF0ZWQgOiB2b2lkIDApIHtcbiAgICAgICAgICBpZiAodGhpcy5ib3VuZGFyaWVzLnRvcCA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5ib3R0b20gPT09IHRpbGUueSB8fCB0aGlzLmJvdW5kYXJpZXMubGVmdCA9PT0gdGlsZS54IHx8IHRoaXMuYm91bmRhcmllcy5yaWdodCA9PT0gdGlsZS54KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlQm91bmRhcmllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZVRpbGVBdCh4LCB5KSB7XG4gICAgICB2YXIgdGlsZTtcbiAgICAgIGlmICh0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZVRpbGUodGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCgocmVmID0gdGhpcy5jb29yZHNbeF0pICE9IG51bGwgPyByZWZbeV0gOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29vcmRzW3hdW3ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRNYXRyaXgobWF0cml4KSB7XG4gICAgICB2YXIgb3B0aW9ucywgcm93LCB0aWxlLCB4LCB5O1xuICAgICAgZm9yICh5IGluIG1hdHJpeCkge1xuICAgICAgICByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgIGZvciAoeCBpbiByb3cpIHtcbiAgICAgICAgICB0aWxlID0gcm93W3hdO1xuICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB4OiBwYXJzZUludCh4KSxcbiAgICAgICAgICAgIHk6IHBhcnNlSW50KHkpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhpcy5hZGRUaWxlKHRpbGUob3B0aW9ucykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aWxlLnggPSBvcHRpb25zLng7XG4gICAgICAgICAgICB0aWxlLnkgPSBvcHRpb25zLnk7XG4gICAgICAgICAgICB0aGlzLmFkZFRpbGUodGlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpblJhbmdlKHRpbGUsIHJhbmdlKSB7XG4gICAgICB2YXIgZm91bmQsIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgdGlsZXMsIHgsIHk7XG4gICAgICB0aWxlcyA9IFtdO1xuICAgICAgcmFuZ2UtLTtcbiAgICAgIGZvciAoeCA9IGkgPSByZWYgPSB0aWxlLnggLSByYW5nZSwgcmVmMSA9IHRpbGUueCArIHJhbmdlOyAocmVmIDw9IHJlZjEgPyBpIDw9IHJlZjEgOiBpID49IHJlZjEpOyB4ID0gcmVmIDw9IHJlZjEgPyArK2kgOiAtLWkpIHtcbiAgICAgICAgZm9yICh5ID0gaiA9IHJlZjIgPSB0aWxlLnkgLSByYW5nZSwgcmVmMyA9IHRpbGUueSArIHJhbmdlOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeSA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICAgIGlmIChNYXRoLnNxcnQoKHggLSB0aWxlLngpICogKHggLSB0aWxlLngpICsgKHkgLSB0aWxlLnkpICogKHkgLSB0aWxlLnkpKSA8PSByYW5nZSAmJiAoKGZvdW5kID0gdGhpcy5nZXRUaWxlKHgsIHkpKSAhPSBudWxsKSkge1xuICAgICAgICAgICAgdGlsZXMucHVzaChmb3VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgYWxsVGlsZXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy50aWxlcy5zbGljZSgpO1xuICAgIH1cblxuICAgIGNsZWFyQWxsKCkge1xuICAgICAgdmFyIGksIGxlbiwgcmVmLCB0aWxlO1xuICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgcmVmID0gdGhpcy50aWxlcztcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdGlsZSA9IHJlZltpXTtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY29vcmRzID0ge307XG4gICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9zZXN0KG9yaWdpblRpbGUsIGZpbHRlcikge1xuICAgICAgdmFyIGNhbmRpZGF0ZXMsIGdldFNjb3JlO1xuICAgICAgZ2V0U2NvcmUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5zY29yZSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5zY29yZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLnNjb3JlID0gY2FuZGlkYXRlLmdldEZpbmFsVGlsZSgpLmRpc3Qob3JpZ2luVGlsZSkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2FuZGlkYXRlcyA9IHRoaXMudGlsZXMuZmlsdGVyKGZpbHRlcikubWFwKCh0KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZVJlZmVyZW5jZSh0KTtcbiAgICAgIH0pO1xuICAgICAgY2FuZGlkYXRlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRTY29yZShhKSAtIGdldFNjb3JlKGIpO1xuICAgICAgfSk7XG4gICAgICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzWzBdLnRpbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5KCkge1xuICAgICAgdmFyIG91dDtcbiAgICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICBvdXQuY29vcmRzID0gdGhpcy5jb29yZHM7XG4gICAgICBvdXQudGlsZXMgPSB0aGlzLnRpbGVzO1xuICAgICAgb3V0Lm93bmVyID0gZmFsc2U7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIG1lcmdlKGN0biwgbWVyZ2VGbiwgYXNPd25lciA9IGZhbHNlKSB7XG4gICAgICB2YXIgb3V0LCB0bXA7XG4gICAgICBvdXQgPSBuZXcgVGlsZUNvbnRhaW5lcigpO1xuICAgICAgb3V0Lm93bmVyID0gYXNPd25lcjtcbiAgICAgIHRtcCA9IGN0bi5jb3B5KCk7XG4gICAgICB0aGlzLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUEpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGUsIHRpbGVCO1xuICAgICAgICB0aWxlQiA9IHRtcC5nZXRUaWxlKHRpbGVBLngsIHRpbGVBLnkpO1xuICAgICAgICBpZiAodGlsZUIpIHtcbiAgICAgICAgICB0bXAucmVtb3ZlVGlsZSh0aWxlQik7XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4odGlsZUEsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdG1wLnRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZUIpIHtcbiAgICAgICAgdmFyIG1lcmdlZFRpbGU7XG4gICAgICAgIG1lcmdlZFRpbGUgPSBtZXJnZUZuKG51bGwsIHRpbGVCKTtcbiAgICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gb3V0LmFkZFRpbGUobWVyZ2VkVGlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlQ29udGFpbmVyLnByb3BlcnRpZXMoe1xuICAgIG93bmVyOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBib3VuZGFyaWVzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYm91bmRhcmllcztcbiAgICAgICAgYm91bmRhcmllcyA9IHtcbiAgICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgICAgbGVmdDogbnVsbCxcbiAgICAgICAgICBib3R0b206IG51bGwsXG4gICAgICAgICAgcmlnaHQ6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZFRvQm9uZGFyaWVzKHRpbGUsIGJvdW5kYXJpZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZUNvbnRhaW5lcjtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKFRpbGVDb250YWluZXIpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgVGlsZVJlZmVyZW5jZT1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7VGlsZVJlZmVyZW5jZS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbGVSZWZlcmVuY2U7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5UaWxlUmVmZXJlbmNlPVRpbGVSZWZlcmVuY2U7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaWxlUmVmZXJlbmNlPVRpbGVSZWZlcmVuY2U7fX19KShmdW5jdGlvbigpe1xudmFyIFRpbGVSZWZlcmVuY2U7XG5UaWxlUmVmZXJlbmNlID0gY2xhc3MgVGlsZVJlZmVyZW5jZSB7XG4gIGNvbnN0cnVjdG9yKHRpbGUpIHtcbiAgICB0aGlzLnRpbGUgPSB0aWxlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIHg6IHtcbiAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmluYWxUaWxlKCkueDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHk6IHtcbiAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmluYWxUaWxlKCkueTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGdldEZpbmFsVGlsZSgpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlLmdldEZpbmFsVGlsZSgpO1xuICB9XG59O1xucmV0dXJuKFRpbGVSZWZlcmVuY2UpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgVGlsZWQ9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbGVkLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9VGlsZWQ7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5UaWxlZD1UaWxlZDt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLlRpbGVkPVRpbGVkO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFRpbGVkO1xuVGlsZWQgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgcHV0T25SYW5kb21UaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgZm91bmQ7XG4gICAgICBmb3VuZCA9IHRoaXMuZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKTtcbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlID0gZm91bmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UmFuZG9tVmFsaWRUaWxlKHRpbGVzKSB7XG4gICAgICB2YXIgY2FuZGlkYXRlLCBwb3MsIHJlbWFpbmluZztcbiAgICAgIHJlbWFpbmluZyA9IHRpbGVzLnNsaWNlKCk7XG4gICAgICB3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcG9zID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcmVtYWluaW5nLmxlbmd0aCk7XG4gICAgICAgIGNhbmRpZGF0ZSA9IHJlbWFpbmluZy5zcGxpY2UocG9zLCAxKVswXTtcbiAgICAgICAgaWYgKHRoaXMuY2FuR29PblRpbGUoY2FuZGlkYXRlKSkge1xuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNhbkdvT25UaWxlKHRpbGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldEZpbmFsVGlsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZWQucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICAgICAgb2xkLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50aWxlLmFkZENoaWxkKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBvZmZzZXRYOiB7XG4gICAgICBkZWZhdWx0OiAwXG4gICAgfSxcbiAgICBvZmZzZXRZOiB7XG4gICAgICBkZWZhdWx0OiAwXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGlsZWQ7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihUaWxlZCk7fSk7IiwiaWYobW9kdWxlKXtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgRGlyZWN0aW9uOiByZXF1aXJlKCcuL0RpcmVjdGlvbi5qcycpLFxuICAgIFRpbGU6IHJlcXVpcmUoJy4vVGlsZS5qcycpLFxuICAgIFRpbGVDb250YWluZXI6IHJlcXVpcmUoJy4vVGlsZUNvbnRhaW5lci5qcycpLFxuICAgIFRpbGVSZWZlcmVuY2U6IHJlcXVpcmUoJy4vVGlsZVJlZmVyZW5jZS5qcycpLFxuICAgIFRpbGVkOiByZXF1aXJlKCcuL1RpbGVkLmpzJylcbiAgfTtcbn0iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEJpbmRlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QmluZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9QmluZGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQmluZGVyPUJpbmRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkJpbmRlcj1CaW5kZXI7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBSZWZlcnJlZCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIlJlZmVycmVkXCIpID8gZGVwZW5kZW5jaWVzLlJlZmVycmVkIDogcmVxdWlyZSgnLi9SZWZlcnJlZCcpO1xudmFyIEJpbmRlcjtcbkJpbmRlciA9IGNsYXNzIEJpbmRlciBleHRlbmRzIFJlZmVycmVkIHtcbiAgdG9nZ2xlQmluZCh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnVuYmluZCgpO1xuICAgIH1cbiAgfVxuXG4gIGJpbmQoKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb0JpbmQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGNhbkJpbmQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmNhbGxiYWNrICE9IG51bGwpICYmICh0aGlzLnRhcmdldCAhPSBudWxsKTtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGRvVW5iaW5kKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBlcXVhbHMoYmluZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQoYmluZGVyKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgcmV0dXJuIHRoaXMudW5iaW5kKCk7XG4gIH1cblxufTtcblxucmV0dXJuKEJpbmRlcik7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBDb2xsZWN0aW9uPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb2xsZWN0aW9uLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q29sbGVjdGlvbjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkNvbGxlY3Rpb249Q29sbGVjdGlvbjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNvbGxlY3Rpb249Q29sbGVjdGlvbjt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgQ29sbGVjdGlvbjtcbkNvbGxlY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbGxlY3Rpb24ge1xuICAgIGNvbnN0cnVjdG9yKGFycikge1xuICAgICAgaWYgKGFyciAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJyLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IGFyci50b0FycmF5KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBbYXJyXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBbXTtcbiAgICAgIH1cbiAgICB9XG4gICAgY2hhbmdlZCgpIHt9XG4gICAgY2hlY2tDaGFuZ2VzKG9sZCwgb3JkZXJlZCA9IHRydWUsIGNvbXBhcmVGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgICBjb21wYXJlRnVuY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgb2xkID0gdGhpcy5jb3B5KG9sZC5zbGljZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9sZCA9IFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY291bnQoKSAhPT0gb2xkLmxlbmd0aCB8fCAob3JkZXJlZCA/IHRoaXMuc29tZShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKTtcbiAgICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuICFvbGQucGx1Y2soZnVuY3Rpb24oYikge1xuICAgICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oYSwgYik7XG4gICAgICAgIH0pO1xuICAgICAgfSkpO1xuICAgIH1cbiAgICBnZXQoaSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5W2ldO1xuICAgIH1cbiAgICBnZXRSYW5kb20oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV07XG4gICAgfVxuICAgIHNldChpLCB2YWwpIHtcbiAgICAgIHZhciBvbGQ7XG4gICAgICBpZiAodGhpcy5fYXJyYXlbaV0gIT09IHZhbCkge1xuICAgICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgICAgdGhpcy5fYXJyYXlbaV0gPSB2YWw7XG4gICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgYWRkKHZhbCkge1xuICAgICAgaWYgKCF0aGlzLl9hcnJheS5pbmNsdWRlcyh2YWwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2godmFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlKHZhbCkge1xuICAgICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcGx1Y2soZm4pIHtcbiAgICAgIHZhciBmb3VuZCwgaW5kZXgsIG9sZDtcbiAgICAgIGluZGV4ID0gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZuKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICBmb3VuZCA9IHRoaXMuX2FycmF5W2luZGV4XTtcbiAgICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB0b0FycmF5KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5LnNsaWNlKCk7XG4gICAgfVxuICAgIGNvdW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aDtcbiAgICB9XG4gICAgc3RhdGljIG5ld1N1YkNsYXNzKGZuLCBhcnIpIHtcbiAgICAgIHZhciBTdWJDbGFzcztcbiAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIFN1YkNsYXNzID0gY2xhc3MgZXh0ZW5kcyB0aGlzIHt9O1xuICAgICAgICBPYmplY3QuYXNzaWduKFN1YkNsYXNzLnByb3RvdHlwZSwgZm4pO1xuICAgICAgICByZXR1cm4gbmV3IFN1YkNsYXNzKGFycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29weShhcnIpIHtcbiAgICAgIHZhciBjb2xsO1xuICAgICAgaWYgKGFyciA9PSBudWxsKSB7XG4gICAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgfVxuICAgICAgY29sbCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGFycik7XG4gICAgICByZXR1cm4gY29sbDtcbiAgICB9XG4gICAgZXF1YWxzKGFycikge1xuICAgICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuIGFycltpXSA9PT0gdmFsO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGdldEFkZGVkRnJvbShhcnIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gIWFyci5pbmNsdWRlcyhpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRSZW1vdmVkRnJvbShhcnIpIHtcbiAgICAgIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pbmNsdWRlcyhpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXTtcbiAgQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucyA9IFsnY29uY2F0JywgJ2ZpbHRlcicsICdzbGljZSddO1xuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXTtcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZyk7XG4gICAgfTtcbiAgfSk7XG4gIENvbGxlY3Rpb24ucmVhZExpc3RGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbihmdW5jdCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvcHkodGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZykpO1xuICAgIH07XG4gIH0pO1xuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICB2YXIgb2xkLCByZXM7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHJlcyA9IHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gQ29sbGVjdGlvbjtcbn0pLmNhbGwodGhpcyk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKTtcbiAgfVxufSk7XG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBTeW1ib2wgIT09IG51bGwgPyBTeW1ib2wuaXRlcmF0b3IgOiB2b2lkIDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH07XG59XG5yZXR1cm4oQ29sbGVjdGlvbik7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBFbGVtZW50PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtFbGVtZW50LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RWxlbWVudDt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkVsZW1lbnQ9RWxlbWVudDt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkVsZW1lbnQ9RWxlbWVudDt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5Jyk7XG52YXIgTWl4YWJsZSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk1peGFibGVcIikgPyBkZXBlbmRlbmNpZXMuTWl4YWJsZSA6IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xudmFyIEVsZW1lbnQ7XG5FbGVtZW50ID0gY2xhc3MgRWxlbWVudCBleHRlbmRzIE1peGFibGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgdGFwKG5hbWUpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG5hbWUuYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2FsbGJhY2sobmFtZSkge1xuICAgIGlmICh0aGlzLl9jYWxsYmFja3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLl9jYWxsYmFja3NbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdLm93bmVyID0gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tuYW1lXTtcbiAgfVxuXG4gIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gWydfcHJvcGVydGllcyddLmNvbmNhdCh0aGlzLl9wcm9wZXJ0aWVzLm1hcChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHJldHVybiBwcm9wLm5hbWU7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICB2YXIgaSwgbGVuLCBvcHRpb25zLCBwcm9wZXJ0eSwgcmVmLCByZXN1bHRzO1xuICAgIGlmICh0aGlzLl9wcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgIHJlZiA9IHRoaXMuX3Byb3BlcnRpZXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcHJvcGVydHkgPSByZWZbaV07XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0eS5vcHRpb25zKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKChuZXcgUHJvcGVydHkocHJvcGVydHkubmFtZSwgb3B0aW9ucykpLmJpbmQodGFyZ2V0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgcHJvcGVydHkocHJvcCwgZGVzYykge1xuICAgIHJldHVybiAobmV3IFByb3BlcnR5KHByb3AsIGRlc2MpKS5iaW5kKHRoaXMucHJvdG90eXBlKTtcbiAgfVxuXG4gIHN0YXRpYyBwcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICB2YXIgZGVzYywgcHJvcCwgcmVzdWx0cztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChwcm9wIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGRlc2MgPSBwcm9wZXJ0aWVzW3Byb3BdO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucHJvcGVydHkocHJvcCwgZGVzYykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG59O1xuXG5yZXR1cm4oRWxlbWVudCk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBFdmVudEJpbmQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0V2ZW50QmluZC5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUV2ZW50QmluZDt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkV2ZW50QmluZD1FdmVudEJpbmQ7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5FdmVudEJpbmQ9RXZlbnRCaW5kO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmluZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmluZGVyXCIpID8gZGVwZW5kZW5jaWVzLkJpbmRlciA6IHJlcXVpcmUoJy4vQmluZGVyJyk7XG52YXIgRXZlbnRCaW5kO1xuRXZlbnRCaW5kID0gY2xhc3MgRXZlbnRCaW5kIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50MTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDE7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9XG5cbiAgZ2V0UmVmKCkge1xuICAgIHJldHVybiB7XG4gICAgICBldmVudDogdGhpcy5ldmVudCxcbiAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgIH07XG4gIH1cblxuICBiaW5kVG8odGFyZ2V0KSB7XG4gICAgdGhpcy51bmJpbmQoKTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzKGV2ZW50QmluZCkge1xuICAgIHJldHVybiBzdXBlci5lcXVhbHMoZXZlbnRCaW5kKSAmJiBldmVudEJpbmQuZXZlbnQgPT09IHRoaXMuZXZlbnQ7XG4gIH1cblxuICBtYXRjaChldmVudCwgdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50ID09PSB0aGlzLmV2ZW50ICYmIHRhcmdldCA9PT0gdGhpcy50YXJnZXQ7XG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xuICAgIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxufTtcblxucmV0dXJuKEV2ZW50QmluZCk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBFdmVudEVtaXR0ZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0V2ZW50RW1pdHRlci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUV2ZW50RW1pdHRlcjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkV2ZW50RW1pdHRlcj1FdmVudEVtaXR0ZXI7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5FdmVudEVtaXR0ZXI9RXZlbnRFbWl0dGVyO319fSkoZnVuY3Rpb24oKXtcbnZhciBFdmVudEVtaXR0ZXI7XG5FdmVudEVtaXR0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEV2ZW50RW1pdHRlciB7XG4gICAgZ2V0QWxsRXZlbnRzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50cyB8fCAodGhpcy5fZXZlbnRzID0ge30pO1xuICAgIH1cbiAgICBnZXRMaXN0ZW5lcnMoZSkge1xuICAgICAgdmFyIGV2ZW50cztcbiAgICAgIGV2ZW50cyA9IHRoaXMuZ2V0QWxsRXZlbnRzKCk7XG4gICAgICByZXR1cm4gZXZlbnRzW2VdIHx8IChldmVudHNbZV0gPSBbXSk7XG4gICAgfVxuICAgIGhhc0xpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRMaXN0ZW5lcnMoZSkuaW5jbHVkZXMobGlzdGVuZXIpO1xuICAgIH1cbiAgICBhZGRMaXN0ZW5lcihlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKCF0aGlzLmhhc0xpc3RlbmVyKGUsIGxpc3RlbmVyKSkge1xuICAgICAgICB0aGlzLmdldExpc3RlbmVycyhlKS5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJBZGRlZChlLCBsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICAgIGxpc3RlbmVyQWRkZWQoZSwgbGlzdGVuZXIpIHt9XG4gICAgcmVtb3ZlTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBpbmRleCwgbGlzdGVuZXJzO1xuICAgICAgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnMoZSk7XG4gICAgICBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyUmVtb3ZlZChlLCBsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICAgIGxpc3RlbmVyUmVtb3ZlZChlLCBsaXN0ZW5lcikge31cbiAgICBlbWl0RXZlbnQoZSwgLi4uYXJncykge1xuICAgICAgdmFyIGxpc3RlbmVycztcbiAgICAgIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXJzKGUpLnNsaWNlKCk7XG4gICAgICByZXR1cm4gbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyKC4uLmFyZ3MpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJlbW92ZUFsbExpc3RlbmVycygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICB9XG4gIH07XG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEV2ZW50O1xuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbiAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbn0pLmNhbGwodGhpcyk7XG5yZXR1cm4oRXZlbnRFbWl0dGVyKTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9QWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyPUFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlcj1BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXI7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBQcm9wZXJ0eVdhdGNoZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJQcm9wZXJ0eVdhdGNoZXJcIikgPyBkZXBlbmRlbmNpZXMuUHJvcGVydHlXYXRjaGVyIDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVdhdGNoZXInKTtcbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXI7XG5BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIgPSBjbGFzcyBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlID0gb3B0aW9ucy5hY3RpdmU7XG4gIH1cblxuICBzaG91bGRCaW5kKCkge1xuICAgIHZhciBhY3RpdmU7XG4gICAgaWYgKHRoaXMuYWN0aXZlICE9IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLnNjb3BlKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvci5jYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0JpbmQoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgpO1xuICAgICAgYWN0aXZlID0gdGhpcy5hY3RpdmUodGhpcy5pbnZhbGlkYXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IuYmluZCgpO1xuICAgICAgcmV0dXJuIGFjdGl2ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbn07XG5cbnJldHVybihBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7Q29sbGVjdGlvblByb3BlcnR5V2F0Y2hlci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyPUNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyPUNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBQcm9wZXJ0eVdhdGNoZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJQcm9wZXJ0eVdhdGNoZXJcIikgPyBkZXBlbmRlbmNpZXMuUHJvcGVydHlXYXRjaGVyIDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVdhdGNoZXInKTtcbnZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyO1xuQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5vbkFkZGVkID0gb3B0aW9ucy5vbkFkZGVkO1xuICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZCA9IG9wdGlvbnMub25SZW1vdmVkO1xuICB9XG5cbiAgaGFuZGxlQ2hhbmdlKHZhbHVlLCBvbGQpIHtcbiAgICBvbGQgPSB2YWx1ZS5jb3B5KG9sZCB8fCBbXSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgb2xkKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCFvbGQuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vbkFkZGVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb2xkLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZC5jYWxsKHRoaXMuc2NvcGUsIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxufTtcblxucmV0dXJuKENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgSW52YWxpZGF0ZWQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0ludmFsaWRhdGVkLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9SW52YWxpZGF0ZWQ7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5JbnZhbGlkYXRlZD1JbnZhbGlkYXRlZDt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkludmFsaWRhdGVkPUludmFsaWRhdGVkO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgSW52YWxpZGF0ZWQ7XG5JbnZhbGlkYXRlZCA9IGNsYXNzIEludmFsaWRhdGVkIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuICAgIGlmICghKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmluaXRCeUxvYWRlciA6IHZvaWQgMCkgJiYgKG9wdGlvbnMubG9hZGVyICE9IG51bGwpKSkge1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICB9XG5cbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xuICAgIGlmIChvcHRpb25zLmxvYWRlckFzU2NvcGUgJiYgKG9wdGlvbnMubG9hZGVyICE9IG51bGwpKSB7XG4gICAgICB0aGlzLnNjb3BlID0gb3B0aW9ucy5sb2FkZXI7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICB1bmtub3duKCkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKTtcbiAgfVxuXG4gIGludmFsaWRhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0b3IgPT0gbnVsbCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLnNjb3BlKTtcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKCk7XG4gICAgdGhpcy5oYW5kbGVVcGRhdGUodGhpcy5pbnZhbGlkYXRvcik7XG4gICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgdGhpcy5pbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBoYW5kbGVVcGRhdGUoaW52YWxpZGF0b3IpIHtcbiAgICBpZiAodGhpcy5zY29wZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuc2NvcGUsIGludmFsaWRhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soaW52YWxpZGF0b3IpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpO1xuICAgIH1cbiAgfVxuXG59O1xuXG5yZXR1cm4oSW52YWxpZGF0ZWQpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgUHJvcGVydHlXYXRjaGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtQcm9wZXJ0eVdhdGNoZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Qcm9wZXJ0eVdhdGNoZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Qcm9wZXJ0eVdhdGNoZXI9UHJvcGVydHlXYXRjaGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuUHJvcGVydHlXYXRjaGVyPVByb3BlcnR5V2F0Y2hlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJpbmRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJpbmRlclwiKSA/IGRlcGVuZGVuY2llcy5CaW5kZXIgOiByZXF1aXJlKCcuLi9CaW5kZXInKTtcbnZhciBQcm9wZXJ0eVdhdGNoZXI7XG5Qcm9wZXJ0eVdhdGNoZXIgPSBjbGFzcyBQcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBCaW5kZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zMSkge1xuICAgIHZhciByZWY7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zMTtcbiAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICB9O1xuICAgIHRoaXMudXBkYXRlQ2FsbGJhY2sgPSAob2xkKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGUob2xkKTtcbiAgICB9O1xuICAgIGlmICh0aGlzLm9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAoISgoKHJlZiA9IHRoaXMub3B0aW9ucykgIT0gbnVsbCA/IHJlZi5pbml0QnlMb2FkZXIgOiB2b2lkIDApICYmICh0aGlzLm9wdGlvbnMubG9hZGVyICE9IG51bGwpKSkge1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICB9XG5cbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xuICAgIGlmIChvcHRpb25zLmxvYWRlckFzU2NvcGUgJiYgKG9wdGlvbnMubG9hZGVyICE9IG51bGwpKSB7XG4gICAgICB0aGlzLnNjb3BlID0gb3B0aW9ucy5sb2FkZXI7XG4gICAgfVxuICAgIHRoaXMucHJvcGVydHkgPSBvcHRpb25zLnByb3BlcnR5O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgIHJldHVybiB0aGlzLmF1dG9CaW5kID0gb3B0aW9ucy5hdXRvQmluZDtcbiAgfVxuXG4gIGNvcHlXaXRoKG9wdCkge1xuICAgIHJldHVybiBuZXcgdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3IoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHQpKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgaWYgKHRoaXMuYXV0b0JpbmQpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoZWNrQmluZCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3BlcnR5KCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5wcm9wZXJ0eSA9IHRoaXMuc2NvcGUuZ2V0UHJvcGVydHlJbnN0YW5jZSh0aGlzLnByb3BlcnR5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydHk7XG4gIH1cblxuICBjaGVja0JpbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlQmluZCh0aGlzLnNob3VsZEJpbmQoKSk7XG4gIH1cblxuICBzaG91bGRCaW5kKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY2FuQmluZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpICE9IG51bGw7XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgICB0aGlzLmdldFByb3BlcnR5KCkub24oJ2ludmFsaWRhdGVkJywgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkub24oJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKTtcbiAgfVxuXG4gIGRvVW5iaW5kKCkge1xuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5vZmYoJ2ludmFsaWRhdGVkJywgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkub2ZmKCd1cGRhdGVkJywgdGhpcy51cGRhdGVDYWxsYmFjayk7XG4gIH1cblxuICBnZXRSZWYoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wZXJ0eSxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnNjb3BlLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvcGVydHk6IHRoaXMucHJvcGVydHkucHJvcGVydHkubmFtZSxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnByb3BlcnR5Lm9iaixcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpLmdldCgpO1xuICB9XG5cbiAgdXBkYXRlKG9sZCkge1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YWx1ZSA9IHRoaXMuZ2V0UHJvcGVydHkoKS5nZXQoKTtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVDaGFuZ2UodmFsdWUsIG9sZCk7XG4gIH1cblxuICBoYW5kbGVDaGFuZ2UodmFsdWUsIG9sZCkge1xuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgb2xkKTtcbiAgfVxuXG59O1xuXG5yZXR1cm4oUHJvcGVydHlXYXRjaGVyKTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEludmFsaWRhdG9yPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtJbnZhbGlkYXRvci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUludmFsaWRhdG9yO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuSW52YWxpZGF0b3I9SW52YWxpZGF0b3I7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5JbnZhbGlkYXRvcj1JbnZhbGlkYXRvcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJpbmRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJpbmRlclwiKSA/IGRlcGVuZGVuY2llcy5CaW5kZXIgOiByZXF1aXJlKCcuL0JpbmRlcicpO1xudmFyIEV2ZW50QmluZCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkV2ZW50QmluZFwiKSA/IGRlcGVuZGVuY2llcy5FdmVudEJpbmQgOiByZXF1aXJlKCcuL0V2ZW50QmluZCcpO1xudmFyIEludmFsaWRhdG9yLCBwbHVjaztcbnBsdWNrID0gZnVuY3Rpb24oYXJyLCBmbikge1xuICB2YXIgZm91bmQsIGluZGV4O1xuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XTtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbkludmFsaWRhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBJbnZhbGlkYXRvciBleHRlbmRzIEJpbmRlciB7XG4gICAgY29uc3RydWN0b3IoaW52YWxpZGF0ZWQsIHNjb3BlID0gbnVsbCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlZDtcbiAgICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW107XG4gICAgICB0aGlzLnJlY3ljbGVkID0gW107XG4gICAgICB0aGlzLnVua25vd25zID0gW107XG4gICAgICB0aGlzLnN0cmljdCA9IHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0O1xuICAgICAgdGhpcy5pbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrLm93bmVyID0gdGhpcztcbiAgICB9XG5cbiAgICBpbnZhbGlkYXRlKCkge1xuICAgICAgdmFyIGZ1bmN0TmFtZTtcbiAgICAgIHRoaXMuaW52YWxpZCA9IHRydWU7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlZCgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKCk7XG4gICAgICB9IGVsc2UgaWYgKCh0aGlzLmludmFsaWRhdGVkICE9IG51bGwpICYmIHR5cGVvZiB0aGlzLmludmFsaWRhdGVkLmludmFsaWRhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlZC5pbnZhbGlkYXRlKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludmFsaWRhdGVkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGZ1bmN0TmFtZSA9ICdpbnZhbGlkYXRlJyArIHRoaXMuaW52YWxpZGF0ZWQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmludmFsaWRhdGVkLnNsaWNlKDEpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuc2NvcGVbZnVuY3ROYW1lXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGVbZnVuY3ROYW1lXSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNjb3BlW3RoaXMuaW52YWxpZGF0ZWRdID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHVua25vd24oKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKHR5cGVvZiAoKHJlZiA9IHRoaXMuaW52YWxpZGF0ZWQpICE9IG51bGwgPyByZWYudW5rbm93biA6IHZvaWQgMCkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlZC51bmtub3duKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWRkRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRCaW5kZXIobmV3IEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykpO1xuICAgIH1cblxuICAgIGFkZEJpbmRlcihiaW5kZXIpIHtcbiAgICAgIGlmIChiaW5kZXIuY2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgICBiaW5kZXIuY2FsbGJhY2sgPSB0aGlzLmludmFsaWRhdGVDYWxsYmFjaztcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuc29tZShmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKTtcbiAgICAgIH0pKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5wdXNoKHBsdWNrKHRoaXMucmVjeWNsZWQsIGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcik7XG4gICAgICAgIH0pIHx8IGJpbmRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VW5rbm93bkNhbGxiYWNrKHByb3ApIHtcbiAgICAgIHZhciBjYWxsYmFjaztcbiAgICAgIGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRVbmtub3duKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmdldCgpO1xuICAgICAgICB9LCBwcm9wKTtcbiAgICAgIH07XG4gICAgICBjYWxsYmFjay5yZWYgPSB7XG4gICAgICAgIHByb3A6IHByb3BcbiAgICAgIH07XG4gICAgICByZXR1cm4gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgYWRkVW5rbm93bihmbiwgcHJvcCkge1xuICAgICAgaWYgKCF0aGlzLmZpbmRVbmtub3duKHByb3ApKSB7XG4gICAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgICBcInByb3BcIjogcHJvcFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnVua25vd25zLnB1c2goZm4pO1xuICAgICAgICByZXR1cm4gdGhpcy51bmtub3duKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmluZFVua25vd24ocHJvcCkge1xuICAgICAgaWYgKChwcm9wICE9IG51bGwpIHx8ICh0eXBlb2YgdGFyZ2V0ICE9PSBcInVuZGVmaW5lZFwiICYmIHRhcmdldCAhPT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5rbm93bnMuZmluZChmdW5jdGlvbih1bmtub3duKSB7XG4gICAgICAgICAgcmV0dXJuIHVua25vd24ucmVmLnByb3AgPT09IHByb3A7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV2ZW50KGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgICBpZiAodGhpcy5jaGVja0VtaXR0ZXIodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRFdmVudEJpbmQoZXZlbnQsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsdWUodmFsLCBldmVudCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgICAgdGhpcy5ldmVudChldmVudCwgdGFyZ2V0KTtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgcHJvcChwcm9wLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgICB2YXIgcHJvcEluc3RhbmNlO1xuICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoKHRhcmdldC5nZXRQcm9wZXJ0eUluc3RhbmNlICE9IG51bGwpICYmIChwcm9wSW5zdGFuY2UgPSB0YXJnZXQuZ2V0UHJvcGVydHlJbnN0YW5jZShwcm9wKSkpIHtcbiAgICAgICAgICBwcm9wID0gcHJvcEluc3RhbmNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuY2hlY2tQcm9wSW5zdGFuY2UocHJvcCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eSBtdXN0IGJlIGEgUHJvcGVydHlJbnN0YW5jZSBvciBhIHN0cmluZycpO1xuICAgICAgfVxuICAgICAgdGhpcy5hZGRFdmVudEJpbmQoJ2ludmFsaWRhdGVkJywgcHJvcCwgdGhpcy5nZXRVbmtub3duQ2FsbGJhY2socHJvcCkpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUocHJvcC5nZXQoKSwgJ3VwZGF0ZWQnLCBwcm9wKTtcbiAgICB9XG5cbiAgICBwcm9wUGF0aChwYXRoLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgICB2YXIgcHJvcCwgdmFsO1xuICAgICAgcGF0aCA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICAgIHZhbCA9IHRhcmdldDtcbiAgICAgIHdoaWxlICgodmFsICE9IG51bGwpICYmIHBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICBwcm9wID0gcGF0aC5zaGlmdCgpO1xuICAgICAgICB2YWwgPSB0aGlzLnByb3AocHJvcCwgdmFsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgcHJvcEluaXRpYXRlZChwcm9wLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgICB2YXIgaW5pdGlhdGVkO1xuICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJyAmJiAodGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UgIT0gbnVsbCkpIHtcbiAgICAgICAgcHJvcCA9IHRhcmdldC5nZXRQcm9wZXJ0eUluc3RhbmNlKHByb3ApO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5jaGVja1Byb3BJbnN0YW5jZShwcm9wKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IG11c3QgYmUgYSBQcm9wZXJ0eUluc3RhbmNlIG9yIGEgc3RyaW5nJyk7XG4gICAgICB9XG4gICAgICBpbml0aWF0ZWQgPSBwcm9wLmluaXRpYXRlZDtcbiAgICAgIGlmICghaW5pdGlhdGVkKSB7XG4gICAgICAgIHRoaXMuZXZlbnQoJ3VwZGF0ZWQnLCBwcm9wKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbml0aWF0ZWQ7XG4gICAgfVxuXG4gICAgZnVuY3QoZnVuY3QpIHtcbiAgICAgIHZhciBpbnZhbGlkYXRvciwgcmVzO1xuICAgICAgaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRVbmtub3duKCgpID0+IHtcbiAgICAgICAgICB2YXIgcmVzMjtcbiAgICAgICAgICByZXMyID0gZnVuY3QoaW52YWxpZGF0b3IpO1xuICAgICAgICAgIGlmIChyZXMgIT09IHJlczIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGludmFsaWRhdG9yKTtcbiAgICAgIH0pO1xuICAgICAgcmVzID0gZnVuY3QoaW52YWxpZGF0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChpbnZhbGlkYXRvcik7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIHZhbGlkYXRlVW5rbm93bnMoKSB7XG4gICAgICB2YXIgdW5rbm93bnM7XG4gICAgICB1bmtub3ducyA9IHRoaXMudW5rbm93bnM7XG4gICAgICB0aGlzLnVua25vd25zID0gW107XG4gICAgICByZXR1cm4gdW5rbm93bnMuZm9yRWFjaChmdW5jdGlvbih1bmtub3duKSB7XG4gICAgICAgIHJldHVybiB1bmtub3duKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpc0VtcHR5KCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgdGhpcy5pbnZhbGlkID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50QmluZC5iaW5kKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZWN5Y2xlKGNhbGxiYWNrKSB7XG4gICAgICB2YXIgZG9uZSwgcmVzO1xuICAgICAgdGhpcy5yZWN5Y2xlZCA9IHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzO1xuICAgICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXTtcbiAgICAgIGRvbmUgPSB0aGlzLmVuZFJlY3ljbGUuYmluZCh0aGlzKTtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoY2FsbGJhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0aGlzLCBkb25lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMgPSBjYWxsYmFjayh0aGlzKTtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRvbmU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZW5kUmVjeWNsZSgpIHtcbiAgICAgIHRoaXMucmVjeWNsZWQuZm9yRWFjaChmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50QmluZC51bmJpbmQoKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucmVjeWNsZWQgPSBbXTtcbiAgICB9XG5cbiAgICBjaGVja0VtaXR0ZXIoZW1pdHRlcikge1xuICAgICAgcmV0dXJuIEV2ZW50QmluZC5jaGVja0VtaXR0ZXIoZW1pdHRlciwgdGhpcy5zdHJpY3QpO1xuICAgIH1cblxuICAgIGNoZWNrUHJvcEluc3RhbmNlKHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YgcHJvcC5nZXQgPT09IFwiZnVuY3Rpb25cIiAmJiB0aGlzLmNoZWNrRW1pdHRlcihwcm9wKTtcbiAgICB9XG5cbiAgICB1bmJpbmQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50QmluZC51bmJpbmQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIEludmFsaWRhdG9yLnN0cmljdCA9IHRydWU7XG5cbiAgcmV0dXJuIEludmFsaWRhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oSW52YWxpZGF0b3IpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgTG9hZGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtMb2FkZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Mb2FkZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Mb2FkZXI9TG9hZGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuTG9hZGVyPUxvYWRlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIE92ZXJyaWRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk92ZXJyaWRlclwiKSA/IGRlcGVuZGVuY2llcy5PdmVycmlkZXIgOiByZXF1aXJlKCcuL092ZXJyaWRlcicpO1xudmFyIExvYWRlcjtcbkxvYWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTG9hZGVyIGV4dGVuZHMgT3ZlcnJpZGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmluaXRQcmVsb2FkZWQoKTtcbiAgICB9XG5cbiAgICBpbml0UHJlbG9hZGVkKCkge1xuICAgICAgdmFyIGRlZkxpc3Q7XG4gICAgICBkZWZMaXN0ID0gdGhpcy5wcmVsb2FkZWQ7XG4gICAgICB0aGlzLnByZWxvYWRlZCA9IFtdO1xuICAgICAgcmV0dXJuIHRoaXMubG9hZChkZWZMaXN0KTtcbiAgICB9XG5cbiAgICBsb2FkKGRlZkxpc3QpIHtcbiAgICAgIHZhciBsb2FkZWQsIHRvTG9hZDtcbiAgICAgIHRvTG9hZCA9IFtdO1xuICAgICAgbG9hZGVkID0gZGVmTGlzdC5tYXAoKGRlZikgPT4ge1xuICAgICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICAgIGlmIChkZWYuaW5zdGFuY2UgPT0gbnVsbCkge1xuICAgICAgICAgIGRlZiA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgbG9hZGVyOiB0aGlzXG4gICAgICAgICAgfSwgZGVmKTtcbiAgICAgICAgICBpbnN0YW5jZSA9IExvYWRlci5sb2FkKGRlZik7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGlmIChkZWYuaW5pdEJ5TG9hZGVyICYmIChpbnN0YW5jZS5pbml0ICE9IG51bGwpKSB7XG4gICAgICAgICAgICB0b0xvYWQucHVzaChpbnN0YW5jZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWY7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gdGhpcy5wcmVsb2FkZWQuY29uY2F0KGxvYWRlZCk7XG4gICAgICByZXR1cm4gdG9Mb2FkLmZvckVhY2goZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmluaXQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZWxvYWQoZGVmKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGVmKSkge1xuICAgICAgICBkZWYgPSBbZGVmXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnByZWxvYWRlZCA9ICh0aGlzLnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KGRlZik7XG4gICAgfVxuXG4gICAgZGVzdHJveUxvYWRlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnByZWxvYWRlZC5mb3JFYWNoKGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICByZXR1cm4gKHJlZiA9IGRlZi5pbnN0YW5jZSkgIT0gbnVsbCA/IHR5cGVvZiByZWYuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmRlc3Ryb3koKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICAgIHJldHVybiBzdXBlci5nZXRGaW5hbFByb3BlcnRpZXMoKS5jb25jYXQoWydwcmVsb2FkZWQnXSk7XG4gICAgfVxuXG4gICAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgICBzdXBlci5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgaWYgKHRoaXMucHJlbG9hZGVkKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJlbG9hZGVkID0gKHRhcmdldC5wcmVsb2FkZWQgfHwgW10pLmNvbmNhdCh0aGlzLnByZWxvYWRlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWRNYW55KGRlZikge1xuICAgICAgcmV0dXJuIGRlZi5tYXAoKGQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZChkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkKGRlZikge1xuICAgICAgaWYgKHR5cGVvZiBkZWYudHlwZS5jb3B5V2l0aCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBkZWYudHlwZS5jb3B5V2l0aChkZWYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBkZWYudHlwZShkZWYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBwcmVsb2FkKGRlZikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLnByZWxvYWQoZGVmKTtcbiAgICB9XG5cbiAgfTtcblxuICBMb2FkZXIucHJvdG90eXBlLnByZWxvYWRlZCA9IFtdO1xuXG4gIExvYWRlci5vdmVycmlkZXMoe1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5pbml0LndpdGhvdXRMb2FkZXIoKTtcbiAgICAgIHJldHVybiB0aGlzLmluaXRQcmVsb2FkZWQoKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kZXN0cm95LndpdGhvdXRMb2FkZXIoKTtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lMb2FkZWQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBMb2FkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihMb2FkZXIpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgTWl4YWJsZT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7TWl4YWJsZS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPU1peGFibGU7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5NaXhhYmxlPU1peGFibGU7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5NaXhhYmxlPU1peGFibGU7fX19KShmdW5jdGlvbigpe1xudmFyIE1peGFibGUsXG4gIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaW5jbHVkZShvYmopIHtcbiAgICAgIHJldHVybiB0aGlzLkV4dGVuc2lvbi5tYWtlKG9iaiwgdGhpcy5wcm90b3R5cGUpO1xuICAgIH1cbiAgfTtcbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZU9uY2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKHNvdXJjZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uoc291cmNlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLCBwcm9wLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmdldEV4dGVuc2lvblByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3AgPSByZWZbaV07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgcHJvcCk7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAmJiB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzID0gdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLmNhbGwodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgfHwgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InLCAnZ2V0RmluYWxQcm9wZXJ0aWVzJ10sXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBhbHdheXNGaW5hbCwgcHJvcHMsIHRhcmdldENoYWluO1xuICAgICAgYWx3YXlzRmluYWwgPSB0aGlzLmFsd2F5c0ZpbmFsO1xuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XG4gICAgICBwcm9wcyA9IFtdO1xuICAgICAgdGhpcy5nZXRQcm90b3R5cGVDaGFpbihzb3VyY2UpLmV2ZXJ5KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgZXhjbHVkZTtcbiAgICAgICAgaWYgKCF0YXJnZXRDaGFpbi5pbmNsdWRlcyhvYmopKSB7XG4gICAgICAgICAgZXhjbHVkZSA9IGFsd2F5c0ZpbmFsO1xuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KFtcImxlbmd0aFwiLCBcInByb3RvdHlwZVwiLCBcIm5hbWVcIl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIiAmJiBpbmRleE9mLmNhbGwoZXhjbHVkZSwga2V5KSA8IDAgJiYgIXByb3BzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBrZXk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgIHByb3AubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSxcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgYmFzZVByb3RvdHlwZSwgY2hhaW47XG4gICAgICBjaGFpbiA9IFtdO1xuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hhaW4ucHVzaChvYmopO1xuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIE1peGFibGU7XG59KS5jYWxsKHRoaXMpO1xucmV0dXJuKE1peGFibGUpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgT3ZlcnJpZGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtPdmVycmlkZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1PdmVycmlkZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5PdmVycmlkZXI9T3ZlcnJpZGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuT3ZlcnJpZGVyPU92ZXJyaWRlcjt9fX0pKGZ1bmN0aW9uKCl7XG4vLyB0b2RvIDogXG4vLyAgc2ltcGxpZmllZCBmb3JtIDogQHdpdGhvdXROYW1lIG1ldGhvZFxudmFyIE92ZXJyaWRlcjtcbk92ZXJyaWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgT3ZlcnJpZGVyIHtcbiAgICBzdGF0aWMgb3ZlcnJpZGVzKG92ZXJyaWRlcykge1xuICAgICAgcmV0dXJuIHRoaXMuT3ZlcnJpZGUuYXBwbHlNYW55KHRoaXMucHJvdG90eXBlLCB0aGlzLm5hbWUsIG92ZXJyaWRlcyk7XG4gICAgfVxuICAgIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gWydfb3ZlcnJpZGVzJ10uY29uY2F0KE9iamVjdC5rZXlzKHRoaXMuX292ZXJyaWRlcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgIH1cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBPdmVycmlkZXIuT3ZlcnJpZGUgPSB7XG4gICAgbWFrZU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcbiAgICAgIHZhciBmbiwga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBmbiA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICByZXN1bHRzLnB1c2gob3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgZm4pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgYXBwbHlNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIga2V5LCBvdmVycmlkZSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIG92ZXJyaWRlcykge1xuICAgICAgICBvdmVycmlkZSA9IG92ZXJyaWRlc1trZXldO1xuICAgICAgICBpZiAodHlwZW9mIG92ZXJyaWRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBvdmVycmlkZSA9IHRoaXMubWFrZSh0YXJnZXQsIG5hbWVzcGFjZSwga2V5LCBvdmVycmlkZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYXBwbHkodGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBmbk5hbWUsIGZuKSB7XG4gICAgICB2YXIgb3ZlcnJpZGU7XG4gICAgICBvdmVycmlkZSA9IHtcbiAgICAgICAgZm46IHtcbiAgICAgICAgICBjdXJyZW50OiBmblxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiBmbk5hbWVcbiAgICAgIH07XG4gICAgICBvdmVycmlkZS5mblsnd2l0aCcgKyBuYW1lc3BhY2VdID0gZm47XG4gICAgICByZXR1cm4gb3ZlcnJpZGU7XG4gICAgfSxcbiAgICBlbXB0eUZuOiBmdW5jdGlvbigpIHt9LFxuICAgIGFwcGx5OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGUpIHtcbiAgICAgIHZhciBmbk5hbWUsIG92ZXJyaWRlcywgcmVmLCByZWYxLCB3aXRob3V0O1xuICAgICAgZm5OYW1lID0gb3ZlcnJpZGUubmFtZTtcbiAgICAgIG92ZXJyaWRlcyA9IHRhcmdldC5fb3ZlcnJpZGVzICE9IG51bGwgPyBPYmplY3QuYXNzaWduKHt9LCB0YXJnZXQuX292ZXJyaWRlcykgOiB7fTtcbiAgICAgIHdpdGhvdXQgPSAoKHJlZiA9IHRhcmdldC5fb3ZlcnJpZGVzKSAhPSBudWxsID8gKHJlZjEgPSByZWZbZm5OYW1lXSkgIT0gbnVsbCA/IHJlZjEuZm4uY3VycmVudCA6IHZvaWQgMCA6IHZvaWQgMCkgfHwgdGFyZ2V0W2ZuTmFtZV07XG4gICAgICBvdmVycmlkZSA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlKTtcbiAgICAgIGlmIChvdmVycmlkZXNbZm5OYW1lXSAhPSBudWxsKSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGVzW2ZuTmFtZV0uZm4sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG92ZXJyaWRlLmZuID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGUuZm4pO1xuICAgICAgfVxuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGhvdXQnICsgbmFtZXNwYWNlXSA9IHdpdGhvdXQgfHwgdGhpcy5lbXB0eUZuO1xuICAgICAgaWYgKHdpdGhvdXQgPT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5taXNzaW5nV2l0aG91dCA9ICd3aXRob3V0JyArIG5hbWVzcGFjZTtcbiAgICAgIH0gZWxzZSBpZiAob3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQpIHtcbiAgICAgICAgb3ZlcnJpZGUuZm5bb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXRdID0gd2l0aG91dDtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGZuTmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGZpbmFsRm4sIGZuLCBrZXksIHJlZjI7XG4gICAgICAgICAgZmluYWxGbiA9IG92ZXJyaWRlLmZuLmN1cnJlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgICByZWYyID0gb3ZlcnJpZGUuZm47XG4gICAgICAgICAgZm9yIChrZXkgaW4gcmVmMikge1xuICAgICAgICAgICAgZm4gPSByZWYyW2tleV07XG4gICAgICAgICAgICBmaW5hbEZuW2tleV0gPSBmbi5iaW5kKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBmbk5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWU6IGZpbmFsRm5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmluYWxGbjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvdmVycmlkZXNbZm5OYW1lXSA9IG92ZXJyaWRlO1xuICAgICAgcmV0dXJuIHRhcmdldC5fb3ZlcnJpZGVzID0gb3ZlcnJpZGVzO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIE92ZXJyaWRlcjtcbn0pLmNhbGwodGhpcyk7XG5yZXR1cm4oT3ZlcnJpZGVyKTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuUHJvcGVydHk9UHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5Qcm9wZXJ0eT1Qcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJhc2ljUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJCYXNpY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkJhc2ljUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eScpO1xudmFyIENvbGxlY3Rpb25Qcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbGxlY3Rpb25Qcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5Jyk7XG52YXIgQ29tcG9zZWRQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbXBvc2VkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ29tcG9zZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5Jyk7XG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHknKTtcbnZhciBDYWxjdWxhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDYWxjdWxhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ2FsY3VsYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xudmFyIEludmFsaWRhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdGVkUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eScpO1xudmFyIFByb3BlcnR5T3duZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJQcm9wZXJ0eU93bmVyXCIpID8gZGVwZW5kZW5jaWVzLlByb3BlcnR5T3duZXIgOiByZXF1aXJlKCcuL1Byb3BlcnR5T3duZXInKTtcbnZhciBNaXhhYmxlID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiTWl4YWJsZVwiKSA/IGRlcGVuZGVuY2llcy5NaXhhYmxlIDogcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG52YXIgUHJvcGVydHk7XG5Qcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUHJvcGVydHkge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgYmluZCh0YXJnZXQpIHtcbiAgICAgIHZhciBwYXJlbnQsIHByb3A7XG4gICAgICBwcm9wID0gdGhpcztcbiAgICAgIGlmICghKHR5cGVvZiB0YXJnZXQuZ2V0UHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgdGFyZ2V0LmdldFByb3BlcnR5KHRoaXMubmFtZSkgPT09IHRoaXMpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0LmdldFByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmICgocGFyZW50ID0gdGFyZ2V0LmdldFByb3BlcnR5KHRoaXMubmFtZSkpICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5vdmVycmlkZShwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0SW5zdGFuY2VUeXBlKCkuYmluZCh0YXJnZXQsIHByb3ApO1xuICAgICAgICB0YXJnZXQuX3Byb3BlcnRpZXMgPSAodGFyZ2V0Ll9wcm9wZXJ0aWVzIHx8IFtdKS5jb25jYXQoW3Byb3BdKTtcbiAgICAgICAgaWYgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgdGFyZ2V0Ll9wcm9wZXJ0aWVzID0gdGFyZ2V0Ll9wcm9wZXJ0aWVzLmZpbHRlcihmdW5jdGlvbihleGlzdGluZykge1xuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nICE9PSBwYXJlbnQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYWtlT3duZXIodGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH1cblxuICAgIG92ZXJyaWRlKHBhcmVudCkge1xuICAgICAgdmFyIGtleSwgcmVmLCByZXN1bHRzLCB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50ID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLnBhcmVudCA9IHBhcmVudC5vcHRpb25zO1xuICAgICAgICByZWYgPSBwYXJlbnQub3B0aW9ucztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGtleSBpbiByZWYpIHtcbiAgICAgICAgICB2YWx1ZSA9IHJlZltrZXldO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zW2tleV0gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5vcHRpb25zW2tleV0ub3ZlcnJpZGVkID0gdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9uc1trZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMub3B0aW9uc1trZXldID0gdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFrZU93bmVyKHRhcmdldCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICghKChyZWYgPSB0YXJnZXQuZXh0ZW5zaW9ucykgIT0gbnVsbCA/IHJlZi5pbmNsdWRlcyhQcm9wZXJ0eU93bmVyLnByb3RvdHlwZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiBNaXhhYmxlLkV4dGVuc2lvbi5tYWtlKFByb3BlcnR5T3duZXIucHJvdG90eXBlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldEluc3RhbmNlVmFyTmFtZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaW5zdGFuY2VWYXJOYW1lIHx8ICdfJyArIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICBpc0luc3RhbnRpYXRlZChvYmopIHtcbiAgICAgIHJldHVybiBvYmpbdGhpcy5nZXRJbnN0YW5jZVZhck5hbWUoKV0gIT0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZShvYmopIHtcbiAgICAgIHZhciBUeXBlLCB2YXJOYW1lO1xuICAgICAgdmFyTmFtZSA9IHRoaXMuZ2V0SW5zdGFuY2VWYXJOYW1lKCk7XG4gICAgICBpZiAoIXRoaXMuaXNJbnN0YW50aWF0ZWQob2JqKSkge1xuICAgICAgICBUeXBlID0gdGhpcy5nZXRJbnN0YW5jZVR5cGUoKTtcbiAgICAgICAgb2JqW3Zhck5hbWVdID0gbmV3IFR5cGUodGhpcywgb2JqKTtcbiAgICAgICAgb2JqW3Zhck5hbWVdLmluaXQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbdmFyTmFtZV07XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2VUeXBlKCkge1xuICAgICAgaWYgKCF0aGlzLmluc3RhbmNlVHlwZSkge1xuICAgICAgICB0aGlzLmNvbXBvc2Vycy5mb3JFYWNoKChjb21wb3NlcikgPT4ge1xuICAgICAgICAgIHJldHVybiBjb21wb3Nlci5jb21wb3NlKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlVHlwZTtcbiAgICB9XG5cbiAgfTtcblxuICBQcm9wZXJ0eS5wcm90b3R5cGUuY29tcG9zZXJzID0gW0NvbXBvc2VkUHJvcGVydHksIENvbGxlY3Rpb25Qcm9wZXJ0eSwgRHluYW1pY1Byb3BlcnR5LCBCYXNpY1Byb3BlcnR5LCBDYWxjdWxhdGVkUHJvcGVydHksIEludmFsaWRhdGVkUHJvcGVydHldO1xuXG4gIHJldHVybiBQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKFByb3BlcnR5KTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFByb3BlcnR5T3duZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1Byb3BlcnR5T3duZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Qcm9wZXJ0eU93bmVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuUHJvcGVydHlPd25lcj1Qcm9wZXJ0eU93bmVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuUHJvcGVydHlPd25lcj1Qcm9wZXJ0eU93bmVyO319fSkoZnVuY3Rpb24oKXtcbnZhciBQcm9wZXJ0eU93bmVyO1xuUHJvcGVydHlPd25lciA9IGNsYXNzIFByb3BlcnR5T3duZXIge1xuICBnZXRQcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMgJiYgdGhpcy5fcHJvcGVydGllcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cbiAgZ2V0UHJvcGVydHlJbnN0YW5jZShuYW1lKSB7XG4gICAgdmFyIHJlcztcbiAgICByZXMgPSB0aGlzLmdldFByb3BlcnR5KG5hbWUpO1xuICAgIGlmIChyZXMpIHtcbiAgICAgIHJldHVybiByZXMuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfVxuICB9XG4gIGdldFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuc2xpY2UoKTtcbiAgfVxuICBnZXRQcm9wZXJ0eUluc3RhbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG4gIGdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuZmlsdGVyKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5pc0luc3RhbnRpYXRlZCh0aGlzKTtcbiAgICB9KS5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG4gIGdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnJlZHVjZSgocmVzLCBwcm9wKSA9PiB7XG4gICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICBpZiAocHJvcC5pc0luc3RhbnRpYXRlZCh0aGlzKSkge1xuICAgICAgICBpbnN0YW5jZSA9IHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5jYWxjdWxhdGVkICYmIGluc3RhbmNlLm1hbnVhbCkge1xuICAgICAgICAgIHJlc1twcm9wLm5hbWVdID0gaW5zdGFuY2UudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSwge30pO1xuICB9XG4gIHNldFByb3BlcnRpZXMoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdmFyIGtleSwgcHJvcCwgdmFsO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHlJbnN0YW5jZShrZXkpO1xuICAgICAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICAgICAgcHJvcC5zZXQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBkZXN0cm95UHJvcGVydGllcygpIHtcbiAgICB0aGlzLmdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5kZXN0cm95KCk7XG4gICAgfSk7XG4gICAgdGhpcy5fcHJvcGVydGllcyA9IFtdO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGxpc3RlbmVyQWRkZWQoZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgaWYgKHByb3AuZ2V0SW5zdGFuY2VUeXBlKCkucHJvdG90eXBlLmNoYW5nZUV2ZW50TmFtZSA9PT0gZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5saXN0ZW5lckFkZGVkID0gdGhpcy5saXN0ZW5lckFkZGVkO1xuICB9XG59O1xucmV0dXJuKFByb3BlcnR5T3duZXIpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQmFzaWNQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QmFzaWNQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUJhc2ljUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5CYXNpY1Byb3BlcnR5PUJhc2ljUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5CYXNpY1Byb3BlcnR5PUJhc2ljUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBNaXhhYmxlID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiTWl4YWJsZVwiKSA/IGRlcGVuZGVuY2llcy5NaXhhYmxlIDogcmVxdWlyZSgnLi4vTWl4YWJsZScpO1xudmFyIEV2ZW50RW1pdHRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkV2ZW50RW1pdHRlclwiKSA/IGRlcGVuZGVuY2llcy5FdmVudEVtaXR0ZXIgOiByZXF1aXJlKCcuLi9FdmVudEVtaXR0ZXInKTtcbnZhciBMb2FkZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJMb2FkZXJcIikgPyBkZXBlbmRlbmNpZXMuTG9hZGVyIDogcmVxdWlyZSgnLi4vTG9hZGVyJyk7XG52YXIgUHJvcGVydHlXYXRjaGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiUHJvcGVydHlXYXRjaGVyXCIpID8gZGVwZW5kZW5jaWVzLlByb3BlcnR5V2F0Y2hlciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlcicpO1xudmFyIFJlZmVycmVkID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiUmVmZXJyZWRcIikgPyBkZXBlbmRlbmNpZXMuUmVmZXJyZWQgOiByZXF1aXJlKCcuLi9SZWZlcnJlZCcpO1xudmFyIEJhc2ljUHJvcGVydHk7XG5CYXNpY1Byb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBCYXNpY1Byb3BlcnR5IGV4dGVuZHMgTWl4YWJsZSB7XG4gICAgY29uc3RydWN0b3IocHJvcGVydHksIG9iaikge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiAgICAgIHRoaXMub2JqID0gb2JqO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB2YXIgcHJlbG9hZDtcbiAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmluZ2VzdCh0aGlzLmRlZmF1bHQpO1xuICAgICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmluaXRpYXRlZCA9IGZhbHNlO1xuICAgICAgcHJlbG9hZCA9IHRoaXMuY29uc3RydWN0b3IuZ2V0UHJlbG9hZCh0aGlzLm9iaiwgdGhpcy5wcm9wZXJ0eSwgdGhpcyk7XG4gICAgICBpZiAocHJlbG9hZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBMb2FkZXIubG9hZE1hbnkocHJlbG9hZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghdGhpcy5pbml0aWF0ZWQpIHtcbiAgICAgICAgdGhpcy5pbml0aWF0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVtaXRFdmVudCgndXBkYXRlZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gICAgfVxuXG4gICAgc2V0KHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0QW5kQ2hlY2tDaGFuZ2VzKHZhbCk7XG4gICAgfVxuXG4gICAgY2FsbGJhY2tTZXQodmFsKSB7XG4gICAgICB0aGlzLmNhbGxPcHRpb25GdW5jdChcInNldFwiLCB2YWwpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0QW5kQ2hlY2tDaGFuZ2VzKHZhbCkge1xuICAgICAgdmFyIG9sZDtcbiAgICAgIHZhbCA9IHRoaXMuaW5nZXN0KHZhbCk7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICBpZiAodGhpcy5jaGVja0NoYW5nZXModmFsLCB0aGlzLnZhbHVlKSkge1xuICAgICAgICBvbGQgPSB0aGlzLnZhbHVlO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsO1xuICAgICAgICB0aGlzLm1hbnVhbCA9IHRydWU7XG4gICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2hlY2tDaGFuZ2VzKHZhbCwgb2xkKSB7XG4gICAgICByZXR1cm4gdmFsICE9PSBvbGQ7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlc3Ryb3kgPT09IHRydWUgJiYgKCgocmVmID0gdGhpcy52YWx1ZSkgIT0gbnVsbCA/IHJlZi5kZXN0cm95IDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICB0aGlzLnZhbHVlLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlc3Ryb3kgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5jYWxsT3B0aW9uRnVuY3QoJ2Rlc3Ryb3knLCB0aGlzLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsT3B0aW9uRnVuY3QoZnVuY3QsIC4uLmFyZ3MpIHtcbiAgICAgIGlmICh0eXBlb2YgZnVuY3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGZ1bmN0ID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zW2Z1bmN0XTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZnVuY3Qub3ZlcnJpZGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGFyZ3MucHVzaCgoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChmdW5jdC5vdmVycmlkZWQsIC4uLmFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdC5hcHBseSh0aGlzLm9iaiwgYXJncyk7XG4gICAgfVxuXG4gICAgcmV2YWxpZGF0ZWQoKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbmdlc3QodmFsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbmdlc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHZhbCA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaW5nZXN0XCIsIHZhbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG91dHB1dCgpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLm91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJvdXRwdXRcIiwgdGhpcy52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGFuZ2VkKG9sZCkge1xuICAgICAgdGhpcy5lbWl0RXZlbnQoJ3VwZGF0ZWQnLCBvbGQpO1xuICAgICAgdGhpcy5lbWl0RXZlbnQoJ2NoYW5nZWQnLCBvbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIEJhc2ljUHJvcGVydHkge307XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLnNldCA9IHRoaXMucHJvdG90eXBlLmNhbGxiYWNrU2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLnNldCA9IHRoaXMucHJvdG90eXBlLnNldEFuZENoZWNrQ2hhbmdlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuZGVmYXVsdCA9IHByb3Aub3B0aW9ucy5kZWZhdWx0O1xuICAgIH1cblxuICAgIHN0YXRpYyBiaW5kKHRhcmdldCwgcHJvcCkge1xuICAgICAgdmFyIG1haiwgb3B0LCBwcmVsb2FkO1xuICAgICAgbWFqID0gcHJvcC5uYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5uYW1lLnNsaWNlKDEpO1xuICAgICAgb3B0ID0ge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAocHJvcC5vcHRpb25zLnNldCAhPT0gZmFsc2UpIHtcbiAgICAgICAgb3B0LnNldCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLnNldCh2YWwpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lLCBvcHQpO1xuICAgICAgdGFyZ2V0WydnZXQnICsgbWFqXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5nZXQoKTtcbiAgICAgIH07XG4gICAgICBpZiAocHJvcC5vcHRpb25zLnNldCAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGFyZ2V0WydzZXQnICsgbWFqXSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuc2V0KHZhbCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0YXJnZXRbJ2ludmFsaWRhdGUnICsgbWFqXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmludmFsaWRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgcHJlbG9hZCA9IHRoaXMuZ2V0UHJlbG9hZCh0YXJnZXQsIHByb3ApO1xuICAgICAgaWYgKHByZWxvYWQubGVuZ3RoID4gMCkge1xuICAgICAgICBNaXhhYmxlLkV4dGVuc2lvbi5tYWtlT25jZShMb2FkZXIucHJvdG90eXBlLCB0YXJnZXQpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnByZWxvYWQocHJlbG9hZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFByZWxvYWQodGFyZ2V0LCBwcm9wLCBpbnN0YW5jZSkge1xuICAgICAgdmFyIHByZWxvYWQsIHJlZiwgcmVmMSwgdG9Mb2FkO1xuICAgICAgcHJlbG9hZCA9IFtdO1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuY2hhbmdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdG9Mb2FkID0ge1xuICAgICAgICAgIHR5cGU6IFByb3BlcnR5V2F0Y2hlcixcbiAgICAgICAgICBsb2FkZXJBc1Njb3BlOiB0cnVlLFxuICAgICAgICAgIHByb3BlcnR5OiBpbnN0YW5jZSB8fCBwcm9wLm5hbWUsXG4gICAgICAgICAgaW5pdEJ5TG9hZGVyOiB0cnVlLFxuICAgICAgICAgIGF1dG9CaW5kOiB0cnVlLFxuICAgICAgICAgIGNhbGxiYWNrOiBwcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICAgIHJlZjoge1xuICAgICAgICAgICAgcHJvcDogcHJvcC5uYW1lLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgICBjb250ZXh0OiAnY2hhbmdlJ1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgKChyZWYgPSBwcm9wLm9wdGlvbnMuY2hhbmdlKSAhPSBudWxsID8gcmVmLmNvcHlXaXRoIDogdm9pZCAwKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRvTG9hZCA9IHtcbiAgICAgICAgICB0eXBlOiBwcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICAgIGxvYWRlckFzU2NvcGU6IHRydWUsXG4gICAgICAgICAgcHJvcGVydHk6IGluc3RhbmNlIHx8IHByb3AubmFtZSxcbiAgICAgICAgICBpbml0QnlMb2FkZXI6IHRydWUsXG4gICAgICAgICAgYXV0b0JpbmQ6IHRydWUsXG4gICAgICAgICAgcmVmOiB7XG4gICAgICAgICAgICBwcm9wOiBwcm9wLm5hbWUsXG4gICAgICAgICAgICB0eXBlOiBwcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICAgICAgY29udGV4dDogJ2NoYW5nZSdcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoKHRvTG9hZCAhPSBudWxsKSAmJiAhKChyZWYxID0gdGFyZ2V0LnByZWxvYWRlZCkgIT0gbnVsbCA/IHJlZjEuZmluZChmdW5jdGlvbihsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIFJlZmVycmVkLmNvbXBhcmVSZWYodG9Mb2FkLnJlZiwgbG9hZGVkLnJlZikgJiYgIWluc3RhbmNlIHx8IChsb2FkZWQuaW5zdGFuY2UgIT0gbnVsbCk7XG4gICAgICB9KSA6IHZvaWQgMCkpIHtcbiAgICAgICAgcHJlbG9hZC5wdXNoKHRvTG9hZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJlbG9hZDtcbiAgICB9XG5cbiAgfTtcblxuICBCYXNpY1Byb3BlcnR5LmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIHJldHVybiBCYXNpY1Byb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oQmFzaWNQcm9wZXJ0eSk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBDYWxjdWxhdGVkUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0NhbGN1bGF0ZWRQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUNhbGN1bGF0ZWRQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkNhbGN1bGF0ZWRQcm9wZXJ0eT1DYWxjdWxhdGVkUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5DYWxjdWxhdGVkUHJvcGVydHk9Q2FsY3VsYXRlZFByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XG52YXIgT3ZlcnJpZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiT3ZlcnJpZGVyXCIpID8gZGVwZW5kZW5jaWVzLk92ZXJyaWRlciA6IHJlcXVpcmUoJy4uL092ZXJyaWRlcicpO1xudmFyIENhbGN1bGF0ZWRQcm9wZXJ0eTtcbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ2FsY3VsYXRlZFByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBjYWxjdWwoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5jYWxjdWxGdW5jdCk7XG4gICAgICB0aGlzLm1hbnVhbCA9IGZhbHNlO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuY2FsY3VsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jYWxjdWxGdW5jdCA9IHByb3Aub3B0aW9ucy5jYWxjdWw7XG4gICAgICAgIGlmICghKHByb3Aub3B0aW9ucy5jYWxjdWwubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKENhbGN1bGF0ZWRQcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDYWxjdWxhdGVkUHJvcGVydHkuZXh0ZW5kKE92ZXJyaWRlcik7XG5cbiAgQ2FsY3VsYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbml0aWF0ZWQsIG9sZDtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgICAgb2xkID0gdGhpcy52YWx1ZTtcbiAgICAgICAgaW5pdGlhdGVkID0gdGhpcy5pbml0aWF0ZWQ7XG4gICAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh0aGlzLnZhbHVlLCBvbGQpKSB7XG4gICAgICAgICAgaWYgKGluaXRpYXRlZCkge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJywgb2xkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWluaXRpYXRlZCkge1xuICAgICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJywgb2xkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ2FsY3VsYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oQ2FsY3VsYXRlZFByb3BlcnR5KTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENvbGxlY3Rpb25Qcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7Q29sbGVjdGlvblByb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q29sbGVjdGlvblByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ29sbGVjdGlvblByb3BlcnR5PUNvbGxlY3Rpb25Qcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNvbGxlY3Rpb25Qcm9wZXJ0eT1Db2xsZWN0aW9uUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBEeW5hbWljUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJEeW5hbWljUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuRHluYW1pY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcbnZhciBDb2xsZWN0aW9uID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ29sbGVjdGlvblwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uIDogcmVxdWlyZSgnLi4vQ29sbGVjdGlvbicpO1xudmFyIFJlZmVycmVkID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiUmVmZXJyZWRcIikgPyBkZXBlbmRlbmNpZXMuUmVmZXJyZWQgOiByZXF1aXJlKCcuLi9SZWZlcnJlZCcpO1xudmFyIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyXCIpID8gZGVwZW5kZW5jaWVzLkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRlZC9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyJyk7XG52YXIgQ29sbGVjdGlvblByb3BlcnR5O1xuQ29sbGVjdGlvblByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb2xsZWN0aW9uUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xuICAgIGluZ2VzdCh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWwgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcImluZ2VzdFwiLCB2YWwpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbC50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB2YWwudG9BcnJheSgpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFt2YWxdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrQ2hhbmdlZEl0ZW1zKHZhbCwgb2xkKSB7XG4gICAgICB2YXIgY29tcGFyZUZ1bmN0aW9uO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLmNvbXBhcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29tcGFyZUZ1bmN0aW9uID0gdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChuZXcgQ29sbGVjdGlvbih2YWwpKS5jaGVja0NoYW5nZXMob2xkLCB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLm9yZGVyZWQsIGNvbXBhcmVGdW5jdGlvbik7XG4gICAgfVxuXG4gICAgb3V0cHV0KCkge1xuICAgICAgdmFyIGNvbCwgcHJvcCwgdmFsdWU7XG4gICAgICB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByb3AgPSB0aGlzO1xuICAgICAgY29sID0gQ29sbGVjdGlvbi5uZXdTdWJDbGFzcyh0aGlzLmNvbGxlY3Rpb25PcHRpb25zLCB2YWx1ZSk7XG4gICAgICBjb2wuY2hhbmdlZCA9IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICByZXR1cm4gcHJvcC5jaGFuZ2VkKG9sZCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNvbDtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQ29sbGVjdGlvblByb3BlcnR5IHt9O1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY29sbGVjdGlvbk9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRDb2xsZWN0aW9uT3B0aW9ucywgdHlwZW9mIHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uID09PSAnb2JqZWN0JyA/IHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uIDoge30pO1xuICAgICAgICBpZiAocHJvcC5vcHRpb25zLmNvbGxlY3Rpb24uY29tcGFyZSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jaGVja0NoYW5nZXMgPSB0aGlzLnByb3RvdHlwZS5jaGVja0NoYW5nZWRJdGVtcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRQcmVsb2FkKHRhcmdldCwgcHJvcCwgaW5zdGFuY2UpIHtcbiAgICAgIHZhciBwcmVsb2FkLCByZWYsIHJlZjE7XG4gICAgICBwcmVsb2FkID0gW107XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jaGFuZ2UgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLml0ZW1BZGRlZCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLml0ZW1SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlZiA9IHtcbiAgICAgICAgICBwcm9wOiBwcm9wLm5hbWUsXG4gICAgICAgICAgY29udGV4dDogJ2NoYW5nZSdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCEoKHJlZjEgPSB0YXJnZXQucHJlbG9hZGVkKSAhPSBudWxsID8gcmVmMS5maW5kKGZ1bmN0aW9uKGxvYWRlZCkge1xuICAgICAgICAgIHJldHVybiBSZWZlcnJlZC5jb21wYXJlUmVmKHJlZiwgbG9hZGVkLnJlZikgJiYgKGxvYWRlZC5pbnN0YW5jZSAhPSBudWxsKTtcbiAgICAgICAgfSkgOiB2b2lkIDApKSB7XG4gICAgICAgICAgcHJlbG9hZC5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIsXG4gICAgICAgICAgICBsb2FkZXJBc1Njb3BlOiB0cnVlLFxuICAgICAgICAgICAgc2NvcGU6IHRhcmdldCxcbiAgICAgICAgICAgIHByb3BlcnR5OiBpbnN0YW5jZSB8fCBwcm9wLm5hbWUsXG4gICAgICAgICAgICBpbml0QnlMb2FkZXI6IHRydWUsXG4gICAgICAgICAgICBhdXRvQmluZDogdHJ1ZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBwcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICAgICAgb25BZGRlZDogcHJvcC5vcHRpb25zLml0ZW1BZGRlZCxcbiAgICAgICAgICAgIG9uUmVtb3ZlZDogcHJvcC5vcHRpb25zLml0ZW1SZW1vdmVkLFxuICAgICAgICAgICAgcmVmOiByZWZcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByZWxvYWQ7XG4gICAgfVxuXG4gIH07XG5cbiAgQ29sbGVjdGlvblByb3BlcnR5LmRlZmF1bHRDb2xsZWN0aW9uT3B0aW9ucyA9IHtcbiAgICBjb21wYXJlOiBmYWxzZSxcbiAgICBvcmRlcmVkOiB0cnVlXG4gIH07XG5cbiAgcmV0dXJuIENvbGxlY3Rpb25Qcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKENvbGxlY3Rpb25Qcm9wZXJ0eSk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBDb21wb3NlZFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb21wb3NlZFByb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q29tcG9zZWRQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkNvbXBvc2VkUHJvcGVydHk9Q29tcG9zZWRQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNvbXBvc2VkUHJvcGVydHk9Q29tcG9zZWRQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIENhbGN1bGF0ZWRQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNhbGN1bGF0ZWRQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5DYWxjdWxhdGVkUHJvcGVydHkgOiByZXF1aXJlKCcuL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xudmFyIENvbGxlY3Rpb24gPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDb2xsZWN0aW9uXCIpID8gZGVwZW5kZW5jaWVzLkNvbGxlY3Rpb24gOiByZXF1aXJlKCcuLi9Db2xsZWN0aW9uJyk7XG52YXIgQ29tcG9zZWRQcm9wZXJ0eTtcbkNvbXBvc2VkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbXBvc2VkUHJvcGVydHkgZXh0ZW5kcyBDYWxjdWxhdGVkUHJvcGVydHkge1xuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLmluaXRDb21wb3NlZCgpO1xuICAgICAgcmV0dXJuIHN1cGVyLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9zZWQoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmhhc093blByb3BlcnR5KCdkZWZhdWx0JykpIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlZmF1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnZhbHVlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVtYmVycyA9IG5ldyBDb21wb3NlZFByb3BlcnR5Lk1lbWJlcnModGhpcy5wcm9wZXJ0eS5vcHRpb25zLm1lbWJlcnMpO1xuICAgICAgdGhpcy5tZW1iZXJzLmNoYW5nZWQgPSAob2xkKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5qb2luID0gdHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA6IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSA/IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5vciA6IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5hbmQ7XG4gICAgfVxuXG4gICAgY2FsY3VsKCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5vYmopO1xuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5tZW1iZXJzLnJlZHVjZSgocHJldiwgbWVtYmVyKSA9PiB7XG4gICAgICAgICAgdmFyIHZhbDtcbiAgICAgICAgICB2YWwgPSB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nID8gbWVtYmVyKHRoaXMuaW52YWxpZGF0b3IpIDogbWVtYmVyO1xuICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4ocHJldiwgdmFsKTtcbiAgICAgICAgfSwgdGhpcy5kZWZhdWx0KTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQ29tcG9zZWRQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcbiAgICAgIENhbGN1bGF0ZWRQcm9wZXJ0eS5iaW5kKHRhcmdldCwgcHJvcCk7XG4gICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lICsgJ01lbWJlcnMnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5tZW1iZXJzO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBDb21wb3NlZFByb3BlcnR5LmpvaW5GdW5jdGlvbnMgPSB7XG4gICAgYW5kOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAmJiBiO1xuICAgIH0sXG4gICAgb3I6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIHx8IGI7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb21wb3NlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5Db21wb3NlZFByb3BlcnR5Lk1lbWJlcnMgPSBjbGFzcyBNZW1iZXJzIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGFkZFByb3BlcnR5UmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBmbjtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AobmFtZSwgb2JqKTtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopIHtcbiAgICB2YXIgZm47XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbiA9IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9O1xuICAgICAgZm4ucmVmID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgdmFsOiB2YWxcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBzZXRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbiwgaSwgcmVmO1xuICAgIGkgPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpID09PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkucmVmLnZhbCAhPT0gdmFsKSB7XG4gICAgICByZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSByZWY7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoaSwgZm4pO1xuICAgIH1cbiAgfVxuXG4gIGdldFZhbHVlUmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihuYW1lLCBvYmopLnJlZi52YWw7XG4gIH1cblxuICBhZGRGdW5jdGlvblJlZihmbiwgbmFtZSwgb2JqKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgZmluZEJ5UmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopXTtcbiAgfVxuXG4gIGZpbmRSZWZJbmRleChuYW1lLCBvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgcmV0dXJuIChtZW1iZXIucmVmICE9IG51bGwpICYmIG1lbWJlci5yZWYub2JqID09PSBvYmogJiYgbWVtYmVyLnJlZi5uYW1lID09PSBuYW1lO1xuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlUmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBpbmRleCwgb2xkO1xuICAgIGluZGV4ID0gdGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgfVxuICB9XG5cbn07XG5cbnJldHVybihDb21wb3NlZFByb3BlcnR5KTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIER5bmFtaWNQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7RHluYW1pY1Byb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RHluYW1pY1Byb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRHluYW1pY1Byb3BlcnR5PUR5bmFtaWNQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkR5bmFtaWNQcm9wZXJ0eT1EeW5hbWljUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9CYXNpY1Byb3BlcnR5Jyk7XG52YXIgRHluYW1pY1Byb3BlcnR5O1xuRHluYW1pY1Byb3BlcnR5ID0gY2xhc3MgRHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7XG4gIGNhbGxiYWNrR2V0KCkge1xuICAgIHZhciByZXM7XG4gICAgcmVzID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJnZXRcIik7XG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW52YWxpZGF0ZU5vdGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9pbnZhbGlkYXRlTm90aWNlKCkge1xuICAgIHRoaXMuZW1pdEV2ZW50KCdpbnZhbGlkYXRlZCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmdldCA9IHRoaXMucHJvdG90eXBlLmNhbGxiYWNrR2V0O1xuICAgIH1cbiAgfVxuXG59O1xuXG5yZXR1cm4oRHluYW1pY1Byb3BlcnR5KTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEludmFsaWRhdGVkUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0ludmFsaWRhdGVkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1JbnZhbGlkYXRlZFByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuSW52YWxpZGF0ZWRQcm9wZXJ0eT1JbnZhbGlkYXRlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuSW52YWxpZGF0ZWRQcm9wZXJ0eT1JbnZhbGlkYXRlZFByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgQ2FsY3VsYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ2FsY3VsYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkNhbGN1bGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG52YXIgSW52YWxpZGF0ZWRQcm9wZXJ0eTtcbkludmFsaWRhdGVkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEludmFsaWRhdGVkUHJvcGVydHkgZXh0ZW5kcyBDYWxjdWxhdGVkUHJvcGVydHkge1xuICAgIHVua25vd24oKSB7XG4gICAgICBpZiAodGhpcy5jYWxjdWxhdGVkIHx8IHRoaXMuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicgJiYgcHJvcC5vcHRpb25zLmNhbGN1bC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5leHRlbmQoSW52YWxpZGF0ZWRQcm9wZXJ0eSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgSW52YWxpZGF0ZWRQcm9wZXJ0eS5vdmVycmlkZXMoe1xuICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLm9iaik7XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdCh0aGlzLmNhbGN1bEZ1bmN0LCBpbnZhbGlkYXRvcik7XG4gICAgICAgIHRoaXMubWFudWFsID0gZmFsc2U7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgICAgaWYgKGludmFsaWRhdG9yLmlzRW1wdHkoKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dEludmFsaWRhdGVkUHJvcGVydHkoKTtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnZhbGlkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCk7XG4gICAgICAgIGlmICghdGhpcy5jYWxjdWxhdGVkICYmICh0aGlzLmludmFsaWRhdG9yICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gSW52YWxpZGF0ZWRQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKEludmFsaWRhdGVkUHJvcGVydHkpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgUmVmZXJyZWQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1JlZmVycmVkLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9UmVmZXJyZWQ7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5SZWZlcnJlZD1SZWZlcnJlZDt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLlJlZmVycmVkPVJlZmVycmVkO319fSkoZnVuY3Rpb24oKXtcbnZhciBSZWZlcnJlZDtcblJlZmVycmVkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSZWZlcnJlZCB7XG4gICAgY29tcGFyZVJlZmVyZWQocmVmZXJlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuY29tcGFyZVJlZmVyZWQocmVmZXJlZCwgdGhpcyk7XG4gICAgfVxuICAgIGdldFJlZigpIHt9XG4gICAgc3RhdGljIGNvbXBhcmVSZWZlcmVkKG9iajEsIG9iajIpIHtcbiAgICAgIHJldHVybiBvYmoxID09PSBvYmoyIHx8ICgob2JqMSAhPSBudWxsKSAmJiAob2JqMiAhPSBudWxsKSAmJiBvYmoxLmNvbnN0cnVjdG9yID09PSBvYmoyLmNvbnN0cnVjdG9yICYmIHRoaXMuY29tcGFyZVJlZihvYmoxLnJlZiwgb2JqMi5yZWYpKTtcbiAgICB9XG4gICAgc3RhdGljIGNvbXBhcmVSZWYocmVmMSwgcmVmMikge1xuICAgICAgcmV0dXJuIChyZWYxICE9IG51bGwpICYmIChyZWYyICE9IG51bGwpICYmIChyZWYxID09PSByZWYyIHx8IChBcnJheS5pc0FycmF5KHJlZjEpICYmIEFycmF5LmlzQXJyYXkocmVmMSkgJiYgcmVmMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFbaV0sIHJlZjJbaV0pO1xuICAgICAgfSkpIHx8ICh0eXBlb2YgcmVmMSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVmMiA9PT0gXCJvYmplY3RcIiAmJiBPYmplY3Qua2V5cyhyZWYxKS5qb2luKCkgPT09IE9iamVjdC5rZXlzKHJlZjIpLmpvaW4oKSAmJiBPYmplY3Qua2V5cyhyZWYxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFba2V5XSwgcmVmMltrZXldKTtcbiAgICAgIH0pKSk7XG4gICAgfVxuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVmZXJyZWQucHJvdG90eXBlLCAncmVmJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZWYoKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gUmVmZXJyZWQ7XG59KS5jYWxsKHRoaXMpO1xucmV0dXJuKFJlZmVycmVkKTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFVwZGF0ZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1VwZGF0ZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1VcGRhdGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuVXBkYXRlcj1VcGRhdGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuVXBkYXRlcj1VcGRhdGVyO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmluZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmluZGVyXCIpID8gZGVwZW5kZW5jaWVzLkJpbmRlciA6IHJlcXVpcmUoJy4vQmluZGVyJyk7XG52YXIgVXBkYXRlcjtcblVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciByZWY7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmNhbGxiYWNrIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZENhbGxiYWNrKG9wdGlvbnMuY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IChyZWYgPSBvcHRpb25zLmNhbGxiYWNrcykgIT0gbnVsbCA/IHJlZi5mb3JFYWNoIDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIHRoaXMucnVuQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBydW5DYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVwZGF0aW5nICYmICF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIG5leHRUaWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgIGlmICghdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubmV4dC5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMubmV4dCA9IFtdO1xuICB9XG5cbn07XG5cblVwZGF0ZXIuQmluZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgY2xhc3MgQmluZGVyIGV4dGVuZHMgc3VwZXJDbGFzcyB7XG4gICAgY29uc3RydWN0b3IodGFyZ2V0LCBjYWxsYmFjazEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjazE7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZG9CaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZENhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUNhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBCaW5kZXI7XG5cbn0pLmNhbGwodGhpcywgQmluZGVyKTtcblxucmV0dXJuKFVwZGF0ZXIpO30pOyIsImlmKG1vZHVsZSl7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEJpbmRlcjogcmVxdWlyZSgnLi9CaW5kZXIuanMnKSxcbiAgICBDb2xsZWN0aW9uOiByZXF1aXJlKCcuL0NvbGxlY3Rpb24uanMnKSxcbiAgICBFbGVtZW50OiByZXF1aXJlKCcuL0VsZW1lbnQuanMnKSxcbiAgICBFdmVudEJpbmQ6IHJlcXVpcmUoJy4vRXZlbnRCaW5kLmpzJyksXG4gICAgRXZlbnRFbWl0dGVyOiByZXF1aXJlKCcuL0V2ZW50RW1pdHRlci5qcycpLFxuICAgIEludmFsaWRhdG9yOiByZXF1aXJlKCcuL0ludmFsaWRhdG9yLmpzJyksXG4gICAgTG9hZGVyOiByZXF1aXJlKCcuL0xvYWRlci5qcycpLFxuICAgIE1peGFibGU6IHJlcXVpcmUoJy4vTWl4YWJsZS5qcycpLFxuICAgIE92ZXJyaWRlcjogcmVxdWlyZSgnLi9PdmVycmlkZXIuanMnKSxcbiAgICBQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eS5qcycpLFxuICAgIFByb3BlcnR5T3duZXI6IHJlcXVpcmUoJy4vUHJvcGVydHlPd25lci5qcycpLFxuICAgIFJlZmVycmVkOiByZXF1aXJlKCcuL1JlZmVycmVkLmpzJyksXG4gICAgVXBkYXRlcjogcmVxdWlyZSgnLi9VcGRhdGVyLmpzJyksXG4gICAgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyOiByZXF1aXJlKCcuL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcycpLFxuICAgIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI6IHJlcXVpcmUoJy4vSW52YWxpZGF0ZWQvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlci5qcycpLFxuICAgIEludmFsaWRhdGVkOiByZXF1aXJlKCcuL0ludmFsaWRhdGVkL0ludmFsaWRhdGVkLmpzJyksXG4gICAgUHJvcGVydHlXYXRjaGVyOiByZXF1aXJlKCcuL0ludmFsaWRhdGVkL1Byb3BlcnR5V2F0Y2hlci5qcycpLFxuICAgIEJhc2ljUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzJyksXG4gICAgQ2FsY3VsYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzJyksXG4gICAgQ29sbGVjdGlvblByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzJyksXG4gICAgQ29tcG9zZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMnKSxcbiAgICBEeW5hbWljUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHkuanMnKSxcbiAgICBJbnZhbGlkYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcycpXG4gIH07XG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaW1pbmc9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbWluZy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbWluZzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaW1pbmc9VGltaW5nO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmFzZVVwZGF0ZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJCYXNlVXBkYXRlclwiKSA/IGRlcGVuZGVuY2llcy5CYXNlVXBkYXRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5VcGRhdGVyO1xudmFyIFRpbWluZztcblRpbWluZyA9IGNsYXNzIFRpbWluZyB7XG4gIGNvbnN0cnVjdG9yKHJ1bm5pbmcgPSB0cnVlKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gcnVubmluZztcbiAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gIH1cblxuICBhZGRDaGlsZChjaGlsZCkge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XG4gICAgaWYgKHRoaXMudXBkYXRlcikge1xuICAgICAgY2hpbGQudXBkYXRlci5kaXNwYXRjaGVyID0gdGhpcy51cGRhdGVyO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIH1cbiAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQ2hpbGQoY2hpbGQpIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGlmIChjaGlsZC5wYXJlbnQgPT09IHRoaXMpIHtcbiAgICAgIGNoaWxkLnBhcmVudCA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdG9nZ2xlKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB2YWwgPSAhdGhpcy5ydW5uaW5nO1xuICAgIH1cbiAgICB0aGlzLnJ1bm5pbmcgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgcmV0dXJuIGNoaWxkLnRvZ2dsZSh2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZSkge1xuICAgIHZhciB0aW1lcjtcbiAgICB0aW1lciA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yLlRpbWVyKHRpbWUsIGNhbGxiYWNrLCB0aGlzLnJ1bm5pbmcpO1xuICAgIHRoaXMuYWRkQ2hpbGQodGltZXIpO1xuICAgIHJldHVybiB0aW1lcjtcbiAgfVxuXG4gIHNldEludGVydmFsKGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgdmFyIHRpbWVyO1xuICAgIHRpbWVyID0gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIodGltZSwgY2FsbGJhY2ssIHRoaXMucnVubmluZywgdHJ1ZSk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aW1lcik7XG4gICAgcmV0dXJuIHRpbWVyO1xuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKGZhbHNlKTtcbiAgfVxuXG4gIHVucGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKHRydWUpO1xuICB9XG5cbn07XG5cblRpbWluZy5UaW1lciA9IGNsYXNzIFRpbWVyIHtcbiAgY29uc3RydWN0b3IodGltZTEsIGNhbGxiYWNrLCBydW5uaW5nID0gdHJ1ZSwgcmVwZWF0ID0gZmFsc2UpIHtcbiAgICB0aGlzLnRpbWUgPSB0aW1lMTtcbiAgICB0aGlzLnJ1bm5pbmcgPSBydW5uaW5nO1xuICAgIHRoaXMucmVwZWF0ID0gcmVwZWF0O1xuICAgIHRoaXMucmVtYWluaW5nVGltZSA9IHRoaXMudGltZTtcbiAgICB0aGlzLnVwZGF0ZXIgPSBuZXcgVGltaW5nLlVwZGF0ZXIodGhpcyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IEJhc2VVcGRhdGVyKCk7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoZXIuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICB0aGlzLl9zdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBub3coKSB7XG4gICAgdmFyIHJlZjtcbiAgICBpZiAoKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93ICE9PSBudWxsID8gKHJlZiA9IHdpbmRvdy5wZXJmb3JtYW5jZSkgIT0gbnVsbCA/IHJlZi5ub3cgOiB2b2lkIDAgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCA/IHByb2Nlc3MudXB0aW1lIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcHJvY2Vzcy51cHRpbWUoKSAqIDEwMDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZSh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdmFsID0gIXRoaXMucnVubmluZztcbiAgICB9XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdG9wKCk7XG4gICAgfVxuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKGZhbHNlKTtcbiAgfVxuXG4gIHVucGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKHRydWUpO1xuICB9XG5cbiAgZ2V0RWxhcHNlZFRpbWUoKSB7XG4gICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSArIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICB9XG4gIH1cblxuICBzZXRFbGFwc2VkVGltZSh2YWwpIHtcbiAgICB0aGlzLl9zdG9wKCk7XG4gICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gdmFsO1xuICAgIHJldHVybiB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgZ2V0UHJjKCkge1xuICAgIHJldHVybiB0aGlzLmdldEVsYXBzZWRUaW1lKCkgLyB0aGlzLnRpbWU7XG4gIH1cblxuICBzZXRQcmModmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0RWxhcHNlZFRpbWUodGhpcy50aW1lICogdmFsKTtcbiAgfVxuXG4gIF9zdGFydCgpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMudXBkYXRlci5mb3J3YXJkQ2FsbGJhY2tzKCk7XG4gICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5vdygpO1xuICAgIGlmICh0aGlzLnJlcGVhdCAmJiAhdGhpcy5pbnRlcnVwdGVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5pZCA9IHNldEludGVydmFsKHRoaXMudGljay5iaW5kKHRoaXMpLCB0aGlzLnJlbWFpbmluZ1RpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy50aWNrLmJpbmQodGhpcyksIHRoaXMucmVtYWluaW5nVGltZSk7XG4gICAgfVxuICB9XG5cbiAgX3N0b3AoKSB7XG4gICAgdmFyIHdhc0ludGVydXB0ZWQ7XG4gICAgd2FzSW50ZXJ1cHRlZCA9IHRoaXMuaW50ZXJ1cHRlZDtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLnVwZGF0ZXIudW5mb3J3YXJkQ2FsbGJhY2tzKCk7XG4gICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gKHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSk7XG4gICAgdGhpcy5pbnRlcnVwdGVkID0gdGhpcy5yZW1haW5pbmdUaW1lICE9PSB0aGlzLnRpbWU7XG4gICAgaWYgKHRoaXMucmVwZWF0ICYmICF3YXNJbnRlcnVwdGVkKSB7XG4gICAgICByZXR1cm4gY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICB9XG4gIH1cblxuICB0aWNrKCkge1xuICAgIHZhciB3YXNJbnRlcnVwdGVkO1xuICAgIHdhc0ludGVydXB0ZWQgPSB0aGlzLmludGVydXB0ZWQ7XG4gICAgdGhpcy5pbnRlcnVwdGVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMucmVwZWF0KSB7XG4gICAgICB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtYWluaW5nVGltZSA9IDA7XG4gICAgfVxuICAgIHRoaXMuZGlzcGF0Y2hlci51cGRhdGUoKTtcbiAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgIGlmICh3YXNJbnRlcnVwdGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGFydCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5ub3coKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMucmVwZWF0KSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlci5kZXN0cm95KCk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gIH1cblxufTtcblxuVGltaW5nLlVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3IocGFyZW50KSB7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IEJhc2VVcGRhdGVyKCk7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgfVxuXG4gIGFkZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlZjtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICgoKHJlZiA9IHRoaXMucGFyZW50KSAhPSBudWxsID8gcmVmLnJ1bm5pbmcgOiB2b2lkIDApICYmIHRoaXMuZGlzcGF0Y2hlcikge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpZiAodGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLnJlbW92ZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBnZXRCaW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlcikge1xuICAgICAgcmV0dXJuIG5ldyBCYXNlVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZENhbGxiYWNrcygpIHtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1bmZvcndhcmRDYWxsYmFja3MoKSB7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlcikge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoZXIucmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnVuZm9yd2FyZENhbGxiYWNrcygpO1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgfVxuXG59O1xuXG5yZXR1cm4oVGltaW5nKTt9KTsiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiUGFyYWxsZWxpby5zdHJpbmdzID0ge1wiZ3JlZWtBbHBoYWJldFwiOltcImFscGhhXCIsXCJiZXRhXCIsXCJnYW1tYVwiLFwiZGVsdGFcIixcImVwc2lsb25cIixcInpldGFcIixcImV0YVwiLFwidGhldGFcIixcImlvdGFcIixcImthcHBhXCIsXCJsYW1iZGFcIixcIm11XCIsXCJudVwiLFwieGlcIixcIm9taWNyb25cIixcInBpXCIsXCJyaG9cIixcInNpZ21hXCIsXCJ0YXVcIixcInVwc2lsb25cIixcInBoaVwiLFwiY2hpXCIsXCJwc2lcIixcIm9tZWdhXCJdLFwic3Rhck5hbWVzXCI6W1wiQWNoZXJuYXJcIixcIk1haWFcIixcIkF0bGFzXCIsXCJTYWxtXCIsXCJBbG5pbGFtXCIsXCJOZWtrYXJcIixcIkVsbmF0aFwiLFwiVGh1YmFuXCIsXCJBY2hpcmRcIixcIk1hcmZpa1wiLFwiQXV2YVwiLFwiU2FyZ2FzXCIsXCJBbG5pdGFrXCIsXCJOaWhhbFwiLFwiRW5pZlwiLFwiVG9yY3VsYXJpc1wiLFwiQWNydXhcIixcIk1hcmthYlwiLFwiQXZpb3JcIixcIlNhcmluXCIsXCJBbHBoYXJkXCIsXCJOdW5raVwiLFwiRXRhbWluXCIsXCJUdXJhaXNcIixcIkFjdWJlbnNcIixcIk1hdGFyXCIsXCJBemVsZmFmYWdlXCIsXCJTY2VwdHJ1bVwiLFwiQWxwaGVra2FcIixcIk51c2FrYW5cIixcIkZvbWFsaGF1dFwiLFwiVHlsXCIsXCJBZGFyYVwiLFwiTWVic3V0YVwiLFwiQXpoYVwiLFwiU2NoZWF0XCIsXCJBbHBoZXJhdHpcIixcIlBlYWNvY2tcIixcIkZvcm5hY2lzXCIsXCJVbnVrYWxoYWlcIixcIkFkaGFmZXJhXCIsXCJNZWdyZXpcIixcIkF6bWlkaXNrZVwiLFwiU2VnaW5cIixcIkFscmFpXCIsXCJQaGFkXCIsXCJGdXJ1ZFwiLFwiVmVnYVwiLFwiQWRoaWxcIixcIk1laXNzYVwiLFwiQmFoYW1cIixcIlNlZ2ludXNcIixcIkFscmlzaGFcIixcIlBoYWV0XCIsXCJHYWNydXhcIixcIlZpbmRlbWlhdHJpeFwiLFwiQWdlbmFcIixcIk1la2J1ZGFcIixcIkJlY3J1eFwiLFwiU2hhbVwiLFwiQWxzYWZpXCIsXCJQaGVya2FkXCIsXCJHaWFuZmFyXCIsXCJXYXNhdFwiLFwiQWxhZGZhclwiLFwiTWVua2FsaW5hblwiLFwiQmVpZFwiLFwiU2hhcmF0YW5cIixcIkFsc2NpYXVrYXRcIixcIlBsZWlvbmVcIixcIkdvbWVpc2FcIixcIldlemVuXCIsXCJBbGF0aGZhclwiLFwiTWVua2FyXCIsXCJCZWxsYXRyaXhcIixcIlNoYXVsYVwiLFwiQWxzaGFpblwiLFwiUG9sYXJpc1wiLFwiR3JhZmZpYXNcIixcIldlem5cIixcIkFsYmFsZGFoXCIsXCJNZW5rZW50XCIsXCJCZXRlbGdldXNlXCIsXCJTaGVkaXJcIixcIkFsc2hhdFwiLFwiUG9sbHV4XCIsXCJHcmFmaWFzXCIsXCJZZWRcIixcIkFsYmFsaVwiLFwiTWVua2liXCIsXCJCb3RlaW5cIixcIlNoZWxpYWtcIixcIkFsc3VoYWlsXCIsXCJQb3JyaW1hXCIsXCJHcnVtaXVtXCIsXCJZaWxkdW5cIixcIkFsYmlyZW9cIixcIk1lcmFrXCIsXCJCcmFjaGl1bVwiLFwiU2lyaXVzXCIsXCJBbHRhaXJcIixcIlByYWVjaXB1YVwiLFwiSGFkYXJcIixcIlphbmlhaFwiLFwiQWxjaGliYVwiLFwiTWVyZ2FcIixcIkNhbm9wdXNcIixcIlNpdHVsYVwiLFwiQWx0YXJmXCIsXCJQcm9jeW9uXCIsXCJIYWVkaVwiLFwiWmF1cmFrXCIsXCJBbGNvclwiLFwiTWVyb3BlXCIsXCJDYXBlbGxhXCIsXCJTa2F0XCIsXCJBbHRlcmZcIixcIlByb3B1c1wiLFwiSGFtYWxcIixcIlphdmlqYWhcIixcIkFsY3lvbmVcIixcIk1lc2FydGhpbVwiLFwiQ2FwaFwiLFwiU3BpY2FcIixcIkFsdWRyYVwiLFwiUmFuYVwiLFwiSGFzc2FsZWhcIixcIlppYmFsXCIsXCJBbGRlcmFtaW5cIixcIk1ldGFsbGFoXCIsXCJDYXN0b3JcIixcIlN0ZXJvcGVcIixcIkFsdWxhXCIsXCJSYXNcIixcIkhlemVcIixcIlpvc21hXCIsXCJBbGRoaWJhaFwiLFwiTWlhcGxhY2lkdXNcIixcIkNlYmFscmFpXCIsXCJTdWFsb2NpblwiLFwiQWx5YVwiLFwiUmFzYWxnZXRoaVwiLFwiSG9lZHVzXCIsXCJBcXVhcml1c1wiLFwiQWxmaXJrXCIsXCJNaW5rYXJcIixcIkNlbGFlbm9cIixcIlN1YnJhXCIsXCJBbHppcnJcIixcIlJhc2FsaGFndWVcIixcIkhvbWFtXCIsXCJBcmllc1wiLFwiQWxnZW5pYlwiLFwiTWludGFrYVwiLFwiQ2hhcmFcIixcIlN1aGFpbFwiLFwiQW5jaGFcIixcIlJhc3RhYmFuXCIsXCJIeWFkdW1cIixcIkNlcGhldXNcIixcIkFsZ2llYmFcIixcIk1pcmFcIixcIkNob3J0XCIsXCJTdWxhZmF0XCIsXCJBbmdldGVuYXJcIixcIlJlZ3VsdXNcIixcIkl6YXJcIixcIkNldHVzXCIsXCJBbGdvbFwiLFwiTWlyYWNoXCIsXCJDdXJzYVwiLFwiU3lybWFcIixcIkFua2FhXCIsXCJSaWdlbFwiLFwiSmFiYmFoXCIsXCJDb2x1bWJhXCIsXCJBbGdvcmFiXCIsXCJNaXJhbVwiLFwiRGFiaWhcIixcIlRhYml0XCIsXCJBbnNlclwiLFwiUm90YW5ldlwiLFwiS2FqYW1cIixcIkNvbWFcIixcIkFsaGVuYVwiLFwiTWlycGhha1wiLFwiRGVuZWJcIixcIlRhbGl0aGFcIixcIkFudGFyZXNcIixcIlJ1Y2hiYVwiLFwiS2F1c1wiLFwiQ29yb25hXCIsXCJBbGlvdGhcIixcIk1pemFyXCIsXCJEZW5lYm9sYVwiLFwiVGFuaWFcIixcIkFyY3R1cnVzXCIsXCJSdWNoYmFoXCIsXCJLZWlkXCIsXCJDcnV4XCIsXCJBbGthaWRcIixcIk11ZnJpZFwiLFwiRGhlbmViXCIsXCJUYXJhemVkXCIsXCJBcmthYlwiLFwiUnVrYmF0XCIsXCJLaXRhbHBoYVwiLFwiRHJhY29cIixcIkFsa2FsdXJvcHNcIixcIk11bGlwaGVuXCIsXCJEaWFkZW1cIixcIlRheWdldGFcIixcIkFybmViXCIsXCJTYWJpa1wiLFwiS29jYWJcIixcIkdydXNcIixcIkFsa2VzXCIsXCJNdXJ6aW1cIixcIkRpcGhkYVwiLFwiVGVnbWVuXCIsXCJBcnJha2lzXCIsXCJTYWRhbGFjaGJpYVwiLFwiS29ybmVwaG9yb3NcIixcIkh5ZHJhXCIsXCJBbGt1cmhhaFwiLFwiTXVzY2lkYVwiLFwiRHNjaHViYmFcIixcIlRlamF0XCIsXCJBc2NlbGxhXCIsXCJTYWRhbG1lbGlrXCIsXCJLcmF6XCIsXCJMYWNlcnRhXCIsXCJBbG1hYWtcIixcIk5hb3NcIixcIkRzaWJhblwiLFwiVGVyZWJlbGx1bVwiLFwiQXNlbGx1c1wiLFwiU2FkYWxzdXVkXCIsXCJLdW1hXCIsXCJNZW5zYVwiLFwiQWxuYWlyXCIsXCJOYXNoXCIsXCJEdWJoZVwiLFwiVGhhYml0XCIsXCJBc3Rlcm9wZVwiLFwiU2FkclwiLFwiTGVzYXRoXCIsXCJNYWFzeW1cIixcIkFsbmF0aFwiLFwiTmFzaGlyYVwiLFwiRWxlY3RyYVwiLFwiVGhlZW1pbVwiLFwiQXRpa1wiLFwiU2FpcGhcIixcIlBob2VuaXhcIixcIk5vcm1hXCJdfSIsInZhciBCaW5kZXIsIFJlZmVycmVkO1xuXG5SZWZlcnJlZCA9IHJlcXVpcmUoJy4vUmVmZXJyZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaW5kZXIgPSBjbGFzcyBCaW5kZXIgZXh0ZW5kcyBSZWZlcnJlZCB7XG4gIHRvZ2dsZUJpbmQodmFsID0gIXRoaXMuYmluZGVkKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuYmluZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy51bmJpbmQoKTtcbiAgICB9XG4gIH1cblxuICBiaW5kKCkge1xuICAgIGlmICghdGhpcy5iaW5kZWQgJiYgdGhpcy5jYW5CaW5kKCkpIHtcbiAgICAgIHRoaXMuZG9CaW5kKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJpbmRlZCA9IHRydWU7XG4gIH1cblxuICBjYW5CaW5kKCkge1xuICAgIHJldHVybiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbCk7XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHVuYmluZCgpIHtcbiAgICBpZiAodGhpcy5iaW5kZWQgJiYgdGhpcy5jYW5CaW5kKCkpIHtcbiAgICAgIHRoaXMuZG9VbmJpbmQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZXF1YWxzKGJpbmRlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKGJpbmRlcik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHJldHVybiB0aGlzLnVuYmluZCgpO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQmluZGVyLmpzLm1hcFxuIiwidmFyIENvbGxlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29sbGVjdGlvbiB7XG4gICAgY29uc3RydWN0b3IoYXJyKSB7XG4gICAgICBpZiAoYXJyICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcnIudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKTtcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IFthcnJdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hcnJheSA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZWQoKSB7fVxuXG4gICAgY2hlY2tDaGFuZ2VzKG9sZCwgb3JkZXJlZCA9IHRydWUsIGNvbXBhcmVGdW5jdGlvbiA9IG51bGwpIHtcbiAgICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgICBjb21wYXJlRnVuY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgb2xkID0gdGhpcy5jb3B5KG9sZC5zbGljZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9sZCA9IFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY291bnQoKSAhPT0gb2xkLmxlbmd0aCB8fCAob3JkZXJlZCA/IHRoaXMuc29tZShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKTtcbiAgICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuICFvbGQucGx1Y2soZnVuY3Rpb24oYikge1xuICAgICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oYSwgYik7XG4gICAgICAgIH0pO1xuICAgICAgfSkpO1xuICAgIH1cblxuICAgIGdldChpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV07XG4gICAgfVxuXG4gICAgZ2V0UmFuZG9tKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuX2FycmF5Lmxlbmd0aCldO1xuICAgIH1cblxuICAgIHNldChpLCB2YWwpIHtcbiAgICAgIHZhciBvbGQ7XG4gICAgICBpZiAodGhpcy5fYXJyYXlbaV0gIT09IHZhbCkge1xuICAgICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgICAgdGhpcy5fYXJyYXlbaV0gPSB2YWw7XG4gICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBhZGQodmFsKSB7XG4gICAgICBpZiAoIXRoaXMuX2FycmF5LmluY2x1ZGVzKHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaCh2YWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZSh2YWwpIHtcbiAgICAgIHZhciBpbmRleCwgb2xkO1xuICAgICAgaW5kZXggPSB0aGlzLl9hcnJheS5pbmRleE9mKHZhbCk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGx1Y2soZm4pIHtcbiAgICAgIHZhciBmb3VuZCwgaW5kZXgsIG9sZDtcbiAgICAgIGluZGV4ID0gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZuKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICBmb3VuZCA9IHRoaXMuX2FycmF5W2luZGV4XTtcbiAgICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRvQXJyYXkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXkuc2xpY2UoKTtcbiAgICB9XG5cbiAgICBjb3VudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5sZW5ndGg7XG4gICAgfVxuXG4gICAgc3RhdGljIG5ld1N1YkNsYXNzKGZuLCBhcnIpIHtcbiAgICAgIHZhciBTdWJDbGFzcztcbiAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIFN1YkNsYXNzID0gY2xhc3MgZXh0ZW5kcyB0aGlzIHt9O1xuICAgICAgICBPYmplY3QuYXNzaWduKFN1YkNsYXNzLnByb3RvdHlwZSwgZm4pO1xuICAgICAgICByZXR1cm4gbmV3IFN1YkNsYXNzKGFycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5KGFycikge1xuICAgICAgdmFyIGNvbGw7XG4gICAgICBpZiAoYXJyID09IG51bGwpIHtcbiAgICAgICAgYXJyID0gdGhpcy50b0FycmF5KCk7XG4gICAgICB9XG4gICAgICBjb2xsID0gbmV3IHRoaXMuY29uc3RydWN0b3IoYXJyKTtcbiAgICAgIHJldHVybiBjb2xsO1xuICAgIH1cblxuICAgIGVxdWFscyhhcnIpIHtcbiAgICAgIHJldHVybiAodGhpcy5jb3VudCgpID09PSAodHlwZW9mIGFyci5jb3VudCA9PT0gJ2Z1bmN0aW9uJyA/IGFyci5jb3VudCgpIDogYXJyLmxlbmd0aCkpICYmIHRoaXMuZXZlcnkoZnVuY3Rpb24odmFsLCBpKSB7XG4gICAgICAgIHJldHVybiBhcnJbaV0gPT09IHZhbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEFkZGVkRnJvbShhcnIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gIWFyci5pbmNsdWRlcyhpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFJlbW92ZWRGcm9tKGFycikge1xuICAgICAgcmV0dXJuIGFyci5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmluY2x1ZGVzKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXTtcblxuICBDb2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zID0gWydjb25jYXQnLCAnZmlsdGVyJywgJ3NsaWNlJ107XG5cbiAgQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J107XG5cbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZyk7XG4gICAgfTtcbiAgfSk7XG5cbiAgQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmN0KSB7XG4gICAgcmV0dXJuIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uKC4uLmFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmN0KSB7XG4gICAgcmV0dXJuIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uKC4uLmFyZykge1xuICAgICAgdmFyIG9sZCwgcmVzO1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKTtcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICB9KTtcblxuICByZXR1cm4gQ29sbGVjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbGxlY3Rpb24ucHJvdG90eXBlLCAnbGVuZ3RoJywge1xuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmNvdW50KCk7XG4gIH1cbn0pO1xuXG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBTeW1ib2wgIT09IG51bGwgPyBTeW1ib2wuaXRlcmF0b3IgOiB2b2lkIDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH07XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQ29sbGVjdGlvbi5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBNaXhhYmxlLCBQcm9wZXJ0eTtcblxuUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5Jyk7XG5cbk1peGFibGUgPSByZXF1aXJlKCcuL01peGFibGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50ID0gY2xhc3MgRWxlbWVudCBleHRlbmRzIE1peGFibGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgdGFwKG5hbWUpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG5hbWUuYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2FsbGJhY2sobmFtZSkge1xuICAgIGlmICh0aGlzLl9jYWxsYmFja3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLl9jYWxsYmFja3NbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdLm93bmVyID0gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tuYW1lXTtcbiAgfVxuXG4gIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gWydfcHJvcGVydGllcyddLmNvbmNhdCh0aGlzLl9wcm9wZXJ0aWVzLm1hcChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHJldHVybiBwcm9wLm5hbWU7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICB2YXIgaSwgbGVuLCBvcHRpb25zLCBwcm9wZXJ0eSwgcmVmLCByZXN1bHRzO1xuICAgIGlmICh0aGlzLl9wcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgIHJlZiA9IHRoaXMuX3Byb3BlcnRpZXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcHJvcGVydHkgPSByZWZbaV07XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0eS5vcHRpb25zKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKChuZXcgUHJvcGVydHkocHJvcGVydHkubmFtZSwgb3B0aW9ucykpLmJpbmQodGFyZ2V0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgcHJvcGVydHkocHJvcCwgZGVzYykge1xuICAgIHJldHVybiAobmV3IFByb3BlcnR5KHByb3AsIGRlc2MpKS5iaW5kKHRoaXMucHJvdG90eXBlKTtcbiAgfVxuXG4gIHN0YXRpYyBwcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICB2YXIgZGVzYywgcHJvcCwgcmVzdWx0cztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChwcm9wIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGRlc2MgPSBwcm9wZXJ0aWVzW3Byb3BdO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucHJvcGVydHkocHJvcCwgZGVzYykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0VsZW1lbnQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBFdmVudEJpbmQ7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4vQmluZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRCaW5kID0gY2xhc3MgRXZlbnRCaW5kIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50MTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDE7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9XG5cbiAgZ2V0UmVmKCkge1xuICAgIHJldHVybiB7XG4gICAgICBldmVudDogdGhpcy5ldmVudCxcbiAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgIH07XG4gIH1cblxuICBiaW5kVG8odGFyZ2V0KSB7XG4gICAgdGhpcy51bmJpbmQoKTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzKGV2ZW50QmluZCkge1xuICAgIHJldHVybiBzdXBlci5lcXVhbHMoZXZlbnRCaW5kKSAmJiBldmVudEJpbmQuZXZlbnQgPT09IHRoaXMuZXZlbnQ7XG4gIH1cblxuICBtYXRjaChldmVudCwgdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50ID09PSB0aGlzLmV2ZW50ICYmIHRhcmdldCA9PT0gdGhpcy50YXJnZXQ7XG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xuICAgIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEJpbmQuanMubWFwXG4iLCJ2YXIgRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRXZlbnRFbWl0dGVyIHtcbiAgICBnZXRBbGxFdmVudHMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgfVxuXG4gICAgZ2V0TGlzdGVuZXJzKGUpIHtcbiAgICAgIHZhciBldmVudHM7XG4gICAgICBldmVudHMgPSB0aGlzLmdldEFsbEV2ZW50cygpO1xuICAgICAgcmV0dXJuIGV2ZW50c1tlXSB8fCAoZXZlbnRzW2VdID0gW10pO1xuICAgIH1cblxuICAgIGhhc0xpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRMaXN0ZW5lcnMoZSkuaW5jbHVkZXMobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIGFkZExpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzTGlzdGVuZXIoZSwgbGlzdGVuZXIpKSB7XG4gICAgICAgIHRoaXMuZ2V0TGlzdGVuZXJzKGUpLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKSB7fVxuXG4gICAgcmVtb3ZlTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBpbmRleCwgbGlzdGVuZXJzO1xuICAgICAgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnMoZSk7XG4gICAgICBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyUmVtb3ZlZChlLCBsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGlzdGVuZXJSZW1vdmVkKGUsIGxpc3RlbmVyKSB7fVxuXG4gICAgZW1pdEV2ZW50KGUsIC4uLmFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKS5zbGljZSgpO1xuICAgICAgcmV0dXJuIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lciguLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUFsbExpc3RlbmVycygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICB9XG5cbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5cbiAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEVtaXR0ZXIuanMubWFwXG4iLCJ2YXIgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLCBJbnZhbGlkYXRvciwgUHJvcGVydHlXYXRjaGVyO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5V2F0Y2hlcicpO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgUHJvcGVydHlXYXRjaGVyIHtcbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZSA9IG9wdGlvbnMuYWN0aXZlO1xuICB9XG5cbiAgc2hvdWxkQmluZCgpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGlmICh0aGlzLmFjdGl2ZSAhPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IuY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICAgIGFjdGl2ZSA9IHRoaXMuYWN0aXZlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcy5tYXBcbiIsInZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBQcm9wZXJ0eVdhdGNoZXI7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4vUHJvcGVydHlXYXRjaGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5vbkFkZGVkID0gb3B0aW9ucy5vbkFkZGVkO1xuICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZCA9IG9wdGlvbnMub25SZW1vdmVkO1xuICB9XG5cbiAgaGFuZGxlQ2hhbmdlKHZhbHVlLCBvbGQpIHtcbiAgICBvbGQgPSB2YWx1ZS5jb3B5KG9sZCB8fCBbXSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgb2xkKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCFvbGQuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vbkFkZGVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb2xkLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZC5jYWxsKHRoaXMuc2NvcGUsIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9JbnZhbGlkYXRlZC9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIEludmFsaWRhdGVkLCBJbnZhbGlkYXRvcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkID0gY2xhc3MgSW52YWxpZGF0ZWQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKCEoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuaW5pdEJ5TG9hZGVyIDogdm9pZCAwKSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVua25vd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMuc2NvcGUpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICB0aGlzLmhhbmRsZVVwZGF0ZSh0aGlzLmludmFsaWRhdG9yKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGhhbmRsZVVwZGF0ZShpbnZhbGlkYXRvcikge1xuICAgIGlmICh0aGlzLnNjb3BlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgaW52YWxpZGF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhpbnZhbGlkYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBQcm9wZXJ0eVdhdGNoZXI7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4uL0JpbmRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIFByb3BlcnR5V2F0Y2hlciBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMxKSB7XG4gICAgdmFyIHJlZjtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMxO1xuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH07XG4gICAgdGhpcy51cGRhdGVDYWxsYmFjayA9IChvbGQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZShvbGQpO1xuICAgIH07XG4gICAgaWYgKHRoaXMub3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgfVxuICAgIGlmICghKCgocmVmID0gdGhpcy5vcHRpb25zKSAhPSBudWxsID8gcmVmLmluaXRCeUxvYWRlciA6IHZvaWQgMCkgJiYgKHRoaXMub3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgdGhpcy5wcm9wZXJ0eSA9IG9wdGlvbnMucHJvcGVydHk7XG4gICAgdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgcmV0dXJuIHRoaXMuYXV0b0JpbmQgPSBvcHRpb25zLmF1dG9CaW5kO1xuICB9XG5cbiAgY29weVdpdGgob3B0KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3RvcihPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdCkpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5hdXRvQmluZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvcGVydHkoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gdGhpcy5zY29wZS5nZXRQcm9wZXJ0eUluc3RhbmNlKHRoaXMucHJvcGVydHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eTtcbiAgfVxuXG4gIGNoZWNrQmluZCgpIHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGVCaW5kKHRoaXMuc2hvdWxkQmluZCgpKTtcbiAgfVxuXG4gIHNob3VsZEJpbmQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjYW5CaW5kKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkgIT0gbnVsbDtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5vbignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5vbigndXBkYXRlZCcsIHRoaXMudXBkYXRlQ2FsbGJhY2spO1xuICB9XG5cbiAgZG9VbmJpbmQoKSB7XG4gICAgdGhpcy5nZXRQcm9wZXJ0eSgpLm9mZignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5vZmYoJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldFJlZigpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3BlcnR5LFxuICAgICAgICB0YXJnZXQ6IHRoaXMuc2NvcGUsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wZXJ0eS5wcm9wZXJ0eS5uYW1lLFxuICAgICAgICB0YXJnZXQ6IHRoaXMucHJvcGVydHkub2JqLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KCk7XG4gIH1cblxuICB1cGRhdGUob2xkKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIHZhbHVlID0gdGhpcy5nZXRQcm9wZXJ0eSgpLmdldCgpO1xuICAgIHJldHVybiB0aGlzLmhhbmRsZUNoYW5nZSh2YWx1ZSwgb2xkKTtcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZSh2YWx1ZSwgb2xkKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCBvbGQpO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIEJpbmRlciwgRXZlbnRCaW5kLCBJbnZhbGlkYXRvciwgcGx1Y2s7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4vQmluZGVyJyk7XG5cbkV2ZW50QmluZCA9IHJlcXVpcmUoJy4vRXZlbnRCaW5kJyk7XG5cbnBsdWNrID0gZnVuY3Rpb24oYXJyLCBmbikge1xuICB2YXIgZm91bmQsIGluZGV4O1xuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XTtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0b3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEludmFsaWRhdG9yIGV4dGVuZHMgQmluZGVyIHtcbiAgICBjb25zdHJ1Y3RvcihpbnZhbGlkYXRlZCwgc2NvcGUgPSBudWxsKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IGludmFsaWRhdGVkO1xuICAgICAgdGhpcy5zY29wZSA9IHNjb3BlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXTtcbiAgICAgIHRoaXMucmVjeWNsZWQgPSBbXTtcbiAgICAgIHRoaXMudW5rbm93bnMgPSBbXTtcbiAgICAgIHRoaXMuc3RyaWN0ID0gdGhpcy5jb25zdHJ1Y3Rvci5zdHJpY3Q7XG4gICAgICB0aGlzLmludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzO1xuICAgIH1cblxuICAgIGludmFsaWRhdGUoKSB7XG4gICAgICB2YXIgZnVuY3ROYW1lO1xuICAgICAgdGhpcy5pbnZhbGlkID0gdHJ1ZTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH0gZWxzZSBpZiAoKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQuaW52YWxpZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLmludmFsaWRhdGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5pbnZhbGlkYXRlZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuaW52YWxpZGF0ZWQuc2xpY2UoMSk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5zY29wZVtmdW5jdE5hbWVdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zY29wZVtmdW5jdE5hbWVdKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGVbdGhpcy5pbnZhbGlkYXRlZF0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdW5rbm93bigpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAodHlwZW9mICgocmVmID0gdGhpcy5pbnZhbGlkYXRlZCkgIT0gbnVsbCA/IHJlZi51bmtub3duIDogdm9pZCAwKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLnVua25vd24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEJpbmRlcihuZXcgRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSk7XG4gICAgfVxuXG4gICAgYWRkQmluZGVyKGJpbmRlcikge1xuICAgICAgaWYgKGJpbmRlci5jYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICAgIGJpbmRlci5jYWxsYmFjayA9IHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5zb21lKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2gocGx1Y2sodGhpcy5yZWN5Y2xlZCwgZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKTtcbiAgICAgICAgfSkgfHwgYmluZGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRVbmtub3duQ2FsbGJhY2socHJvcCkge1xuICAgICAgdmFyIGNhbGxiYWNrO1xuICAgICAgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0KCk7XG4gICAgICAgIH0sIHByb3ApO1xuICAgICAgfTtcbiAgICAgIGNhbGxiYWNrLnJlZiA9IHtcbiAgICAgICAgcHJvcDogcHJvcFxuICAgICAgfTtcbiAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBhZGRVbmtub3duKGZuLCBwcm9wKSB7XG4gICAgICBpZiAoIXRoaXMuZmluZFVua25vd24ocHJvcCkpIHtcbiAgICAgICAgZm4ucmVmID0ge1xuICAgICAgICAgIFwicHJvcFwiOiBwcm9wXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudW5rbm93bnMucHVzaChmbik7XG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd24oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kVW5rbm93bihwcm9wKSB7XG4gICAgICBpZiAoKHByb3AgIT0gbnVsbCkgfHwgKHR5cGVvZiB0YXJnZXQgIT09IFwidW5kZWZpbmVkXCIgJiYgdGFyZ2V0ICE9PSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmtub3ducy5maW5kKGZ1bmN0aW9uKHVua25vd24pIHtcbiAgICAgICAgICByZXR1cm4gdW5rbm93bi5yZWYucHJvcCA9PT0gcHJvcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXZlbnQoZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIGlmICh0aGlzLmNoZWNrRW1pdHRlcih0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZSh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wKHByb3AsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBwcm9wSW5zdGFuY2U7XG4gICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICgodGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UgIT0gbnVsbCkgJiYgKHByb3BJbnN0YW5jZSA9IHRhcmdldC5nZXRQcm9wZXJ0eUluc3RhbmNlKHByb3ApKSkge1xuICAgICAgICAgIHByb3AgPSBwcm9wSW5zdGFuY2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5jaGVja1Byb3BJbnN0YW5jZShwcm9wKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IG11c3QgYmUgYSBQcm9wZXJ0eUluc3RhbmNlIG9yIGEgc3RyaW5nJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFkZEV2ZW50QmluZCgnaW52YWxpZGF0ZWQnLCBwcm9wLCB0aGlzLmdldFVua25vd25DYWxsYmFjayhwcm9wKSk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZShwcm9wLmdldCgpLCAndXBkYXRlZCcsIHByb3ApO1xuICAgIH1cblxuICAgIHByb3BQYXRoKHBhdGgsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBwcm9wLCB2YWw7XG4gICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgdmFsID0gdGFyZ2V0O1xuICAgICAgd2hpbGUgKCh2YWwgIT0gbnVsbCkgJiYgcGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByb3AgPSBwYXRoLnNoaWZ0KCk7XG4gICAgICAgIHZhbCA9IHRoaXMucHJvcChwcm9wLCB2YWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wSW5pdGlhdGVkKHByb3AsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBpbml0aWF0ZWQ7XG4gICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnICYmICh0YXJnZXQuZ2V0UHJvcGVydHlJbnN0YW5jZSAhPSBudWxsKSkge1xuICAgICAgICBwcm9wID0gdGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UocHJvcCk7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLmNoZWNrUHJvcEluc3RhbmNlKHByb3ApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbXVzdCBiZSBhIFByb3BlcnR5SW5zdGFuY2Ugb3IgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIGluaXRpYXRlZCA9IHByb3AuaW5pdGlhdGVkO1xuICAgICAgaWYgKCFpbml0aWF0ZWQpIHtcbiAgICAgICAgdGhpcy5ldmVudCgndXBkYXRlZCcsIHByb3ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluaXRpYXRlZDtcbiAgICB9XG5cbiAgICBmdW5jdChmdW5jdCkge1xuICAgICAgdmFyIGludmFsaWRhdG9yLCByZXM7XG4gICAgICBpbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oKCkgPT4ge1xuICAgICAgICAgIHZhciByZXMyO1xuICAgICAgICAgIHJlczIgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICAgICAgaWYgKHJlcyAhPT0gcmVzMikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgaW52YWxpZGF0b3IpO1xuICAgICAgfSk7XG4gICAgICByZXMgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5wdXNoKGludmFsaWRhdG9yKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVVbmtub3ducygpIHtcbiAgICAgIHZhciB1bmtub3ducztcbiAgICAgIHVua25vd25zID0gdGhpcy51bmtub3ducztcbiAgICAgIHRoaXMudW5rbm93bnMgPSBbXTtcbiAgICAgIHJldHVybiB1bmtub3ducy5mb3JFYWNoKGZ1bmN0aW9uKHVua25vd24pIHtcbiAgICAgICAgcmV0dXJuIHVua25vd24oKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlzRW1wdHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICB0aGlzLmludmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmJpbmQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlY3ljbGUoY2FsbGJhY2spIHtcbiAgICAgIHZhciBkb25lLCByZXM7XG4gICAgICB0aGlzLnJlY3ljbGVkID0gdGhpcy5pbnZhbGlkYXRpb25FdmVudHM7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cyA9IFtdO1xuICAgICAgZG9uZSA9IHRoaXMuZW5kUmVjeWNsZS5iaW5kKHRoaXMpO1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHRoaXMsIGRvbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcyA9IGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbmRSZWN5Y2xlKCkge1xuICAgICAgdGhpcy5yZWN5Y2xlZC5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZWN5Y2xlZCA9IFtdO1xuICAgIH1cblxuICAgIGNoZWNrRW1pdHRlcihlbWl0dGVyKSB7XG4gICAgICByZXR1cm4gRXZlbnRCaW5kLmNoZWNrRW1pdHRlcihlbWl0dGVyLCB0aGlzLnN0cmljdCk7XG4gICAgfVxuXG4gICAgY2hlY2tQcm9wSW5zdGFuY2UocHJvcCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBwcm9wLmdldCA9PT0gXCJmdW5jdGlvblwiICYmIHRoaXMuY2hlY2tFbWl0dGVyKHByb3ApO1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZTtcblxuICByZXR1cm4gSW52YWxpZGF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvSW52YWxpZGF0b3IuanMubWFwXG4iLCJ2YXIgTG9hZGVyLCBPdmVycmlkZXI7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBMb2FkZXIgZXh0ZW5kcyBPdmVycmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH1cblxuICAgIGluaXRQcmVsb2FkZWQoKSB7XG4gICAgICB2YXIgZGVmTGlzdDtcbiAgICAgIGRlZkxpc3QgPSB0aGlzLnByZWxvYWRlZDtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gW107XG4gICAgICByZXR1cm4gdGhpcy5sb2FkKGRlZkxpc3QpO1xuICAgIH1cblxuICAgIGxvYWQoZGVmTGlzdCkge1xuICAgICAgdmFyIGxvYWRlZCwgdG9Mb2FkO1xuICAgICAgdG9Mb2FkID0gW107XG4gICAgICBsb2FkZWQgPSBkZWZMaXN0Lm1hcCgoZGVmKSA9PiB7XG4gICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgaWYgKGRlZi5pbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBsb2FkZXI6IHRoaXNcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGluc3RhbmNlID0gTG9hZGVyLmxvYWQoZGVmKTtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaWYgKGRlZi5pbml0QnlMb2FkZXIgJiYgKGluc3RhbmNlLmluaXQgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHRvTG9hZC5wdXNoKGluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSB0aGlzLnByZWxvYWRlZC5jb25jYXQobG9hZGVkKTtcbiAgICAgIHJldHVybiB0b0xvYWQuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlbG9hZChkZWYpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkZWYpKSB7XG4gICAgICAgIGRlZiA9IFtkZWZdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkID0gKHRoaXMucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQoZGVmKTtcbiAgICB9XG5cbiAgICBkZXN0cm95TG9hZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkLmZvckVhY2goZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHJldHVybiAocmVmID0gZGVmLmluc3RhbmNlKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGVzdHJveSgpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldEZpbmFsUHJvcGVydGllcygpLmNvbmNhdChbJ3ByZWxvYWRlZCddKTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIHN1cGVyLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICBpZiAodGhpcy5wcmVsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkZWQgPSAodGFyZ2V0LnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KHRoaXMucHJlbG9hZGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZE1hbnkoZGVmKSB7XG4gICAgICByZXR1cm4gZGVmLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkKGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWQoZGVmKSB7XG4gICAgICBpZiAodHlwZW9mIGRlZi50eXBlLmNvcHlXaXRoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGRlZi50eXBlLmNvcHlXaXRoKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IGRlZi50eXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHByZWxvYWQoZGVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJlbG9hZChkZWYpO1xuICAgIH1cblxuICB9O1xuXG4gIExvYWRlci5wcm90b3R5cGUucHJlbG9hZGVkID0gW107XG5cbiAgTG9hZGVyLm92ZXJyaWRlcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmluaXQud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveUxvYWRlZCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIExvYWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Mb2FkZXIuanMubWFwXG4iLCJ2YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuXG4gIH07XG5cbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZU9uY2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKHNvdXJjZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uoc291cmNlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLCBwcm9wLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmdldEV4dGVuc2lvblByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3AgPSByZWZbaV07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgcHJvcCk7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAmJiB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzID0gdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLmNhbGwodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgfHwgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InLCAnZ2V0RmluYWxQcm9wZXJ0aWVzJ10sXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBhbHdheXNGaW5hbCwgcHJvcHMsIHRhcmdldENoYWluO1xuICAgICAgYWx3YXlzRmluYWwgPSB0aGlzLmFsd2F5c0ZpbmFsO1xuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XG4gICAgICBwcm9wcyA9IFtdO1xuICAgICAgdGhpcy5nZXRQcm90b3R5cGVDaGFpbihzb3VyY2UpLmV2ZXJ5KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgZXhjbHVkZTtcbiAgICAgICAgaWYgKCF0YXJnZXRDaGFpbi5pbmNsdWRlcyhvYmopKSB7XG4gICAgICAgICAgZXhjbHVkZSA9IGFsd2F5c0ZpbmFsO1xuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KFtcImxlbmd0aFwiLCBcInByb3RvdHlwZVwiLCBcIm5hbWVcIl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIiAmJiBpbmRleE9mLmNhbGwoZXhjbHVkZSwga2V5KSA8IDAgJiYgIXByb3BzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBrZXk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgIHByb3AubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSxcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgYmFzZVByb3RvdHlwZSwgY2hhaW47XG4gICAgICBjaGFpbiA9IFtdO1xuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hhaW4ucHVzaChvYmopO1xuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTWl4YWJsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NaXhhYmxlLmpzLm1hcFxuIiwiLy8gdG9kbyA6IFxuLy8gIHNpbXBsaWZpZWQgZm9ybSA6IEB3aXRob3V0TmFtZSBtZXRob2RcbnZhciBPdmVycmlkZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAodGhpcy5fb3ZlcnJpZGVzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFsnX292ZXJyaWRlcyddLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLl9vdmVycmlkZXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT3ZlcnJpZGVyLk92ZXJyaWRlID0ge1xuICAgIG1ha2VNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIgZm4sIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgZm4gPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIGZuKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIGFwcGx5TWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgb3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgb3ZlcnJpZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFwcGx5KHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgZm5OYW1lLCBmbikge1xuICAgICAgdmFyIG92ZXJyaWRlO1xuICAgICAgb3ZlcnJpZGUgPSB7XG4gICAgICAgIGZuOiB7XG4gICAgICAgICAgY3VycmVudDogZm5cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogZm5OYW1lXG4gICAgICB9O1xuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGgnICsgbmFtZXNwYWNlXSA9IGZuO1xuICAgICAgcmV0dXJuIG92ZXJyaWRlO1xuICAgIH0sXG4gICAgZW1wdHlGbjogZnVuY3Rpb24oKSB7fSxcbiAgICBhcHBseTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSB7XG4gICAgICB2YXIgZm5OYW1lLCBvdmVycmlkZXMsIHJlZiwgcmVmMSwgd2l0aG91dDtcbiAgICAgIGZuTmFtZSA9IG92ZXJyaWRlLm5hbWU7XG4gICAgICBvdmVycmlkZXMgPSB0YXJnZXQuX292ZXJyaWRlcyAhPSBudWxsID8gT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0Ll9vdmVycmlkZXMpIDoge307XG4gICAgICB3aXRob3V0ID0gKChyZWYgPSB0YXJnZXQuX292ZXJyaWRlcykgIT0gbnVsbCA/IChyZWYxID0gcmVmW2ZuTmFtZV0pICE9IG51bGwgPyByZWYxLmZuLmN1cnJlbnQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IHRhcmdldFtmbk5hbWVdO1xuICAgICAgb3ZlcnJpZGUgPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZSk7XG4gICAgICBpZiAob3ZlcnJpZGVzW2ZuTmFtZV0gIT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlc1tmbk5hbWVdLmZuLCBvdmVycmlkZS5mbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH1cbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRob3V0JyArIG5hbWVzcGFjZV0gPSB3aXRob3V0IHx8IHRoaXMuZW1wdHlGbjtcbiAgICAgIGlmICh3aXRob3V0ID09IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQgPSAnd2l0aG91dCcgKyBuYW1lc3BhY2U7XG4gICAgICB9IGVsc2UgaWYgKG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0KSB7XG4gICAgICAgIG92ZXJyaWRlLmZuW292ZXJyaWRlLm1pc3NpbmdXaXRob3V0XSA9IHdpdGhvdXQ7XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBmbk5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaW5hbEZuLCBmbiwga2V5LCByZWYyO1xuICAgICAgICAgIGZpbmFsRm4gPSBvdmVycmlkZS5mbi5jdXJyZW50LmJpbmQodGhpcyk7XG4gICAgICAgICAgcmVmMiA9IG92ZXJyaWRlLmZuO1xuICAgICAgICAgIGZvciAoa2V5IGluIHJlZjIpIHtcbiAgICAgICAgICAgIGZuID0gcmVmMltrZXldO1xuICAgICAgICAgICAgZmluYWxGbltrZXldID0gZm4uYmluZCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZm5OYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiBmaW5hbEZuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZpbmFsRm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3ZlcnJpZGVzW2ZuTmFtZV0gPSBvdmVycmlkZTtcbiAgICAgIHJldHVybiB0YXJnZXQuX292ZXJyaWRlcyA9IG92ZXJyaWRlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE92ZXJyaWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCJ2YXIgQmFzaWNQcm9wZXJ0eSwgQ2FsY3VsYXRlZFByb3BlcnR5LCBDb2xsZWN0aW9uUHJvcGVydHksIENvbXBvc2VkUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eSwgTWl4YWJsZSwgUHJvcGVydHksIFByb3BlcnR5T3duZXI7XG5cbkJhc2ljUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eScpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5Jyk7XG5cbkNvbXBvc2VkUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29tcG9zZWRQcm9wZXJ0eScpO1xuXG5EeW5hbWljUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5Jyk7XG5cbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHknKTtcblxuSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5Jyk7XG5cblByb3BlcnR5T3duZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5T3duZXInKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQcm9wZXJ0eSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBiaW5kKHRhcmdldCkge1xuICAgICAgdmFyIHBhcmVudCwgcHJvcDtcbiAgICAgIHByb3AgPSB0aGlzO1xuICAgICAgaWYgKCEodHlwZW9mIHRhcmdldC5nZXRQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyAmJiB0YXJnZXQuZ2V0UHJvcGVydHkodGhpcy5uYW1lKSA9PT0gdGhpcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQuZ2V0UHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgKChwYXJlbnQgPSB0YXJnZXQuZ2V0UHJvcGVydHkodGhpcy5uYW1lKSkgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLm92ZXJyaWRlKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRJbnN0YW5jZVR5cGUoKS5iaW5kKHRhcmdldCwgcHJvcCk7XG4gICAgICAgIHRhcmdldC5fcHJvcGVydGllcyA9ICh0YXJnZXQuX3Byb3BlcnRpZXMgfHwgW10pLmNvbmNhdChbcHJvcF0pO1xuICAgICAgICBpZiAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICB0YXJnZXQuX3Byb3BlcnRpZXMgPSB0YXJnZXQuX3Byb3BlcnRpZXMuZmlsdGVyKGZ1bmN0aW9uKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhpc3RpbmcgIT09IHBhcmVudDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1ha2VPd25lcih0YXJnZXQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3A7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUocGFyZW50KSB7XG4gICAgICB2YXIga2V5LCByZWYsIHJlc3VsdHMsIHZhbHVlO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMucGFyZW50ID0gcGFyZW50Lm9wdGlvbnM7XG4gICAgICAgIHJlZiA9IHBhcmVudC5vcHRpb25zO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgICAgIHZhbHVlID0gcmVmW2tleV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnNba2V5XSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm9wdGlvbnNba2V5XS5vdmVycmlkZWQgPSB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5vcHRpb25zW2tleV0gPSB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtYWtlT3duZXIodGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKFByb3BlcnR5T3duZXIucHJvdG90eXBlKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgcmV0dXJuIE1peGFibGUuRXh0ZW5zaW9uLm1ha2UoUHJvcGVydHlPd25lci5wcm90b3R5cGUsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2VWYXJOYW1lKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pbnN0YW5jZVZhck5hbWUgfHwgJ18nICsgdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIGlzSW5zdGFudGlhdGVkKG9iaikge1xuICAgICAgcmV0dXJuIG9ialt0aGlzLmdldEluc3RhbmNlVmFyTmFtZSgpXSAhPSBudWxsO1xuICAgIH1cblxuICAgIGdldEluc3RhbmNlKG9iaikge1xuICAgICAgdmFyIFR5cGUsIHZhck5hbWU7XG4gICAgICB2YXJOYW1lID0gdGhpcy5nZXRJbnN0YW5jZVZhck5hbWUoKTtcbiAgICAgIGlmICghdGhpcy5pc0luc3RhbnRpYXRlZChvYmopKSB7XG4gICAgICAgIFR5cGUgPSB0aGlzLmdldEluc3RhbmNlVHlwZSgpO1xuICAgICAgICBvYmpbdmFyTmFtZV0gPSBuZXcgVHlwZSh0aGlzLCBvYmopO1xuICAgICAgICBvYmpbdmFyTmFtZV0uaW5pdCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialt2YXJOYW1lXTtcbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZVR5cGUoKSB7XG4gICAgICBpZiAoIXRoaXMuaW5zdGFuY2VUeXBlKSB7XG4gICAgICAgIHRoaXMuY29tcG9zZXJzLmZvckVhY2goKGNvbXBvc2VyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBvc2VyLmNvbXBvc2UodGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VUeXBlO1xuICAgIH1cblxuICB9O1xuXG4gIFByb3BlcnR5LnByb3RvdHlwZS5jb21wb3NlcnMgPSBbQ29tcG9zZWRQcm9wZXJ0eSwgQ29sbGVjdGlvblByb3BlcnR5LCBEeW5hbWljUHJvcGVydHksIEJhc2ljUHJvcGVydHksIENhbGN1bGF0ZWRQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eV07XG5cbiAgcmV0dXJuIFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb3BlcnR5LmpzLm1hcFxuIiwidmFyIFByb3BlcnR5T3duZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlPd25lciA9IGNsYXNzIFByb3BlcnR5T3duZXIge1xuICBnZXRQcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMgJiYgdGhpcy5fcHJvcGVydGllcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cblxuICBnZXRQcm9wZXJ0eUluc3RhbmNlKG5hbWUpIHtcbiAgICB2YXIgcmVzO1xuICAgIHJlcyA9IHRoaXMuZ2V0UHJvcGVydHkobmFtZSk7XG4gICAgaWYgKHJlcykge1xuICAgICAgcmV0dXJuIHJlcy5nZXRJbnN0YW5jZSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnNsaWNlKCk7XG4gIH1cblxuICBnZXRQcm9wZXJ0eUluc3RhbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0SW5zdGFudGlhdGVkUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5maWx0ZXIoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmlzSW5zdGFudGlhdGVkKHRoaXMpO1xuICAgIH0pLm1hcCgocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRNYW51YWxEYXRhUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5yZWR1Y2UoKHJlcywgcHJvcCkgPT4ge1xuICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgaWYgKHByb3AuaXNJbnN0YW50aWF0ZWQodGhpcykpIHtcbiAgICAgICAgaW5zdGFuY2UgPSBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgICAgICBpZiAoaW5zdGFuY2UuY2FsY3VsYXRlZCAmJiBpbnN0YW5jZS5tYW51YWwpIHtcbiAgICAgICAgICByZXNbcHJvcC5uYW1lXSA9IGluc3RhbmNlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sIHt9KTtcbiAgfVxuXG4gIHNldFByb3BlcnRpZXMoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdmFyIGtleSwgcHJvcCwgdmFsO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHlJbnN0YW5jZShrZXkpO1xuICAgICAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICAgICAgcHJvcC5zZXQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlc3Ryb3lQcm9wZXJ0aWVzKCkge1xuICAgIHRoaXMuZ2V0SW5zdGFudGlhdGVkUHJvcGVydGllcygpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgICB0aGlzLl9wcm9wZXJ0aWVzID0gW107XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsaXN0ZW5lckFkZGVkKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wLmdldEluc3RhbmNlVHlwZSgpLnByb3RvdHlwZS5jaGFuZ2VFdmVudE5hbWUgPT09IGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5saXN0ZW5lckFkZGVkID0gdGhpcy5saXN0ZW5lckFkZGVkO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHlPd25lci5qcy5tYXBcbiIsInZhciBCYXNpY1Byb3BlcnR5LCBFdmVudEVtaXR0ZXIsIExvYWRlciwgTWl4YWJsZSwgUHJvcGVydHlXYXRjaGVyLCBSZWZlcnJlZDtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4uL01peGFibGUnKTtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi4vRXZlbnRFbWl0dGVyJyk7XG5cbkxvYWRlciA9IHJlcXVpcmUoJy4uL0xvYWRlcicpO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRlZC9Qcm9wZXJ0eVdhdGNoZXInKTtcblxuUmVmZXJyZWQgPSByZXF1aXJlKCcuLi9SZWZlcnJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEJhc2ljUHJvcGVydHkgZXh0ZW5kcyBNaXhhYmxlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eSwgb2JqKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgICAgdGhpcy5vYmogPSBvYmo7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHZhciBwcmVsb2FkO1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5nZXN0KHRoaXMuZGVmYXVsdCk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW5pdGlhdGVkID0gZmFsc2U7XG4gICAgICBwcmVsb2FkID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRQcmVsb2FkKHRoaXMub2JqLCB0aGlzLnByb3BlcnR5LCB0aGlzKTtcbiAgICAgIGlmIChwcmVsb2FkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIExvYWRlci5sb2FkTWFueShwcmVsb2FkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCF0aGlzLmluaXRpYXRlZCkge1xuICAgICAgICB0aGlzLmluaXRpYXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQoKTtcbiAgICB9XG5cbiAgICBzZXQodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRBbmRDaGVja0NoYW5nZXModmFsKTtcbiAgICB9XG5cbiAgICBjYWxsYmFja1NldCh2YWwpIHtcbiAgICAgIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwic2V0XCIsIHZhbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRBbmRDaGVja0NoYW5nZXModmFsKSB7XG4gICAgICB2YXIgb2xkO1xuICAgICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKTtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh2YWwsIHRoaXMudmFsdWUpKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gICAgICAgIHRoaXMubWFudWFsID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjaGVja0NoYW5nZXModmFsLCBvbGQpIHtcbiAgICAgIHJldHVybiB2YWwgIT09IG9sZDtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVzdHJveSA9PT0gdHJ1ZSAmJiAoKChyZWYgPSB0aGlzLnZhbHVlKSAhPSBudWxsID8gcmVmLmRlc3Ryb3kgOiB2b2lkIDApICE9IG51bGwpKSB7XG4gICAgICAgIHRoaXMudmFsdWUuZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLmNhbGxPcHRpb25GdW5jdCgnZGVzdHJveScsIHRoaXMudmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWUgPSBudWxsO1xuICAgIH1cblxuICAgIGNhbGxPcHRpb25GdW5jdChmdW5jdCwgLi4uYXJncykge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZnVuY3QgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnNbZnVuY3RdO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBmdW5jdC5vdmVycmlkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYXJncy5wdXNoKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0Lm92ZXJyaWRlZCwgLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0LmFwcGx5KHRoaXMub2JqLCBhcmdzKTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlZCgpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWF0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGluZ2VzdCh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3V0cHV0KCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZWQob2xkKSB7XG4gICAgICB0aGlzLmVtaXRFdmVudCgndXBkYXRlZCcsIG9sZCk7XG4gICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlZCcsIG9sZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5pbnN0YW5jZVR5cGUgPT0gbnVsbCkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLnNldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuc2V0ID0gdGhpcy5wcm90b3R5cGUuY2FsbGJhY2tTZXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuc2V0ID0gdGhpcy5wcm90b3R5cGUuc2V0QW5kQ2hlY2tDaGFuZ2VzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5kZWZhdWx0ID0gcHJvcC5vcHRpb25zLmRlZmF1bHQ7XG4gICAgfVxuXG4gICAgc3RhdGljIGJpbmQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICB2YXIgbWFqLCBvcHQsIHByZWxvYWQ7XG4gICAgICBtYWogPSBwcm9wLm5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLm5hbWUuc2xpY2UoMSk7XG4gICAgICBvcHQgPSB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5nZXQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMuc2V0ICE9PSBmYWxzZSkge1xuICAgICAgICBvcHQuc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuc2V0KHZhbCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIG9wdCk7XG4gICAgICB0YXJnZXRbJ2dldCcgKyBtYWpdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgfTtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMuc2V0ICE9PSBmYWxzZSkge1xuICAgICAgICB0YXJnZXRbJ3NldCcgKyBtYWpdID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5zZXQodmFsKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRhcmdldFsnaW52YWxpZGF0ZScgKyBtYWpdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuaW52YWxpZGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICBwcmVsb2FkID0gdGhpcy5nZXRQcmVsb2FkKHRhcmdldCwgcHJvcCk7XG4gICAgICBpZiAocHJlbG9hZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIE1peGFibGUuRXh0ZW5zaW9uLm1ha2VPbmNlKExvYWRlci5wcm90b3R5cGUsIHRhcmdldCk7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJlbG9hZChwcmVsb2FkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UHJlbG9hZCh0YXJnZXQsIHByb3AsIGluc3RhbmNlKSB7XG4gICAgICB2YXIgcHJlbG9hZCwgcmVmLCByZWYxLCB0b0xvYWQ7XG4gICAgICBwcmVsb2FkID0gW107XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jaGFuZ2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0b0xvYWQgPSB7XG4gICAgICAgICAgdHlwZTogUHJvcGVydHlXYXRjaGVyLFxuICAgICAgICAgIGxvYWRlckFzU2NvcGU6IHRydWUsXG4gICAgICAgICAgcHJvcGVydHk6IGluc3RhbmNlIHx8IHByb3AubmFtZSxcbiAgICAgICAgICBpbml0QnlMb2FkZXI6IHRydWUsXG4gICAgICAgICAgYXV0b0JpbmQ6IHRydWUsXG4gICAgICAgICAgY2FsbGJhY2s6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgcmVmOiB7XG4gICAgICAgICAgICBwcm9wOiBwcm9wLm5hbWUsXG4gICAgICAgICAgICBjYWxsYmFjazogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjaGFuZ2UnXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiAoKHJlZiA9IHByb3Aub3B0aW9ucy5jaGFuZ2UpICE9IG51bGwgPyByZWYuY29weVdpdGggOiB2b2lkIDApID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdG9Mb2FkID0ge1xuICAgICAgICAgIHR5cGU6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgbG9hZGVyQXNTY29wZTogdHJ1ZSxcbiAgICAgICAgICBwcm9wZXJ0eTogaW5zdGFuY2UgfHwgcHJvcC5uYW1lLFxuICAgICAgICAgIGluaXRCeUxvYWRlcjogdHJ1ZSxcbiAgICAgICAgICBhdXRvQmluZDogdHJ1ZSxcbiAgICAgICAgICByZWY6IHtcbiAgICAgICAgICAgIHByb3A6IHByb3AubmFtZSxcbiAgICAgICAgICAgIHR5cGU6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgICBjb250ZXh0OiAnY2hhbmdlJ1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICgodG9Mb2FkICE9IG51bGwpICYmICEoKHJlZjEgPSB0YXJnZXQucHJlbG9hZGVkKSAhPSBudWxsID8gcmVmMS5maW5kKGZ1bmN0aW9uKGxvYWRlZCkge1xuICAgICAgICByZXR1cm4gUmVmZXJyZWQuY29tcGFyZVJlZih0b0xvYWQucmVmLCBsb2FkZWQucmVmKSAmJiAhaW5zdGFuY2UgfHwgKGxvYWRlZC5pbnN0YW5jZSAhPSBudWxsKTtcbiAgICAgIH0pIDogdm9pZCAwKSkge1xuICAgICAgICBwcmVsb2FkLnB1c2godG9Mb2FkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmVsb2FkO1xuICAgIH1cblxuICB9O1xuXG4gIEJhc2ljUHJvcGVydHkuZXh0ZW5kKEV2ZW50RW1pdHRlcik7XG5cbiAgcmV0dXJuIEJhc2ljUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzLm1hcFxuIiwidmFyIENhbGN1bGF0ZWRQcm9wZXJ0eSwgRHluYW1pY1Byb3BlcnR5LCBJbnZhbGlkYXRvciwgT3ZlcnJpZGVyO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbkR5bmFtaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4uL092ZXJyaWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGN1bGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ2FsY3VsYXRlZFByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBjYWxjdWwoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5jYWxjdWxGdW5jdCk7XG4gICAgICB0aGlzLm1hbnVhbCA9IGZhbHNlO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuY2FsY3VsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jYWxjdWxGdW5jdCA9IHByb3Aub3B0aW9ucy5jYWxjdWw7XG4gICAgICAgIGlmICghKHByb3Aub3B0aW9ucy5jYWxjdWwubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKENhbGN1bGF0ZWRQcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDYWxjdWxhdGVkUHJvcGVydHkuZXh0ZW5kKE92ZXJyaWRlcik7XG5cbiAgQ2FsY3VsYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbml0aWF0ZWQsIG9sZDtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgICAgb2xkID0gdGhpcy52YWx1ZTtcbiAgICAgICAgaW5pdGlhdGVkID0gdGhpcy5pbml0aWF0ZWQ7XG4gICAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh0aGlzLnZhbHVlLCBvbGQpKSB7XG4gICAgICAgICAgaWYgKGluaXRpYXRlZCkge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJywgb2xkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWluaXRpYXRlZCkge1xuICAgICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJywgb2xkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ2FsY3VsYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzLm1hcFxuIiwidmFyIENvbGxlY3Rpb24sIENvbGxlY3Rpb25Qcm9wZXJ0eSwgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciwgRHluYW1pY1Byb3BlcnR5LCBSZWZlcnJlZDtcblxuRHluYW1pY1Byb3BlcnR5ID0gcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcblxuQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL0NvbGxlY3Rpb24nKTtcblxuUmVmZXJyZWQgPSByZXF1aXJlKCcuLi9SZWZlcnJlZCcpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0ZWQvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25Qcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29sbGVjdGlvblByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBpbmdlc3QodmFsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbmdlc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdmFsLnRvQXJyYXkoKTtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHJldHVybiB2YWwuc2xpY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbdmFsXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0NoYW5nZWRJdGVtcyh2YWwsIG9sZCkge1xuICAgICAgdmFyIGNvbXBhcmVGdW5jdGlvbjtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IHRoaXMuY29sbGVjdGlvbk9wdGlvbnMuY29tcGFyZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAobmV3IENvbGxlY3Rpb24odmFsKSkuY2hlY2tDaGFuZ2VzKG9sZCwgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5vcmRlcmVkLCBjb21wYXJlRnVuY3Rpb24pO1xuICAgIH1cblxuICAgIG91dHB1dCgpIHtcbiAgICAgIHZhciBjb2wsIHByb3AsIHZhbHVlO1xuICAgICAgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJvdXRwdXRcIiwgdGhpcy52YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcm9wID0gdGhpcztcbiAgICAgIGNvbCA9IENvbGxlY3Rpb24ubmV3U3ViQ2xhc3ModGhpcy5jb2xsZWN0aW9uT3B0aW9ucywgdmFsdWUpO1xuICAgICAgY29sLmNoYW5nZWQgPSBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuY2hhbmdlZChvbGQpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBjb2w7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIENvbGxlY3Rpb25Qcm9wZXJ0eSB7fTtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNvbGxlY3Rpb25PcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0Q29sbGVjdGlvbk9wdGlvbnMsIHR5cGVvZiBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ29iamVjdCcgPyBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA6IHt9KTtcbiAgICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uLmNvbXBhcmUgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2hlY2tDaGFuZ2VzID0gdGhpcy5wcm90b3R5cGUuY2hlY2tDaGFuZ2VkSXRlbXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UHJlbG9hZCh0YXJnZXQsIHByb3AsIGluc3RhbmNlKSB7XG4gICAgICB2YXIgcHJlbG9hZCwgcmVmLCByZWYxO1xuICAgICAgcHJlbG9hZCA9IFtdO1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuY2hhbmdlID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5pdGVtQWRkZWQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZWYgPSB7XG4gICAgICAgICAgcHJvcDogcHJvcC5uYW1lLFxuICAgICAgICAgIGNvbnRleHQ6ICdjaGFuZ2UnXG4gICAgICAgIH07XG4gICAgICAgIGlmICghKChyZWYxID0gdGFyZ2V0LnByZWxvYWRlZCkgIT0gbnVsbCA/IHJlZjEuZmluZChmdW5jdGlvbihsb2FkZWQpIHtcbiAgICAgICAgICByZXR1cm4gUmVmZXJyZWQuY29tcGFyZVJlZihyZWYsIGxvYWRlZC5yZWYpICYmIChsb2FkZWQuaW5zdGFuY2UgIT0gbnVsbCk7XG4gICAgICAgIH0pIDogdm9pZCAwKSkge1xuICAgICAgICAgIHByZWxvYWQucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLFxuICAgICAgICAgICAgbG9hZGVyQXNTY29wZTogdHJ1ZSxcbiAgICAgICAgICAgIHNjb3BlOiB0YXJnZXQsXG4gICAgICAgICAgICBwcm9wZXJ0eTogaW5zdGFuY2UgfHwgcHJvcC5uYW1lLFxuICAgICAgICAgICAgaW5pdEJ5TG9hZGVyOiB0cnVlLFxuICAgICAgICAgICAgYXV0b0JpbmQ6IHRydWUsXG4gICAgICAgICAgICBjYWxsYmFjazogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICAgIG9uQWRkZWQ6IHByb3Aub3B0aW9ucy5pdGVtQWRkZWQsXG4gICAgICAgICAgICBvblJlbW92ZWQ6IHByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCxcbiAgICAgICAgICAgIHJlZjogcmVmXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmVsb2FkO1xuICAgIH1cblxuICB9O1xuXG4gIENvbGxlY3Rpb25Qcm9wZXJ0eS5kZWZhdWx0Q29sbGVjdGlvbk9wdGlvbnMgPSB7XG4gICAgY29tcGFyZTogZmFsc2UsXG4gICAgb3JkZXJlZDogdHJ1ZVxuICB9O1xuXG4gIHJldHVybiBDb2xsZWN0aW9uUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMubWFwXG4iLCJ2YXIgQ2FsY3VsYXRlZFByb3BlcnR5LCBDb2xsZWN0aW9uLCBDb21wb3NlZFByb3BlcnR5LCBJbnZhbGlkYXRvcjtcblxuQ2FsY3VsYXRlZFByb3BlcnR5ID0gcmVxdWlyZSgnLi9DYWxjdWxhdGVkUHJvcGVydHknKTtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xuXG5Db2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vQ29sbGVjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvc2VkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbXBvc2VkUHJvcGVydHkgZXh0ZW5kcyBDYWxjdWxhdGVkUHJvcGVydHkge1xuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLmluaXRDb21wb3NlZCgpO1xuICAgICAgcmV0dXJuIHN1cGVyLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9zZWQoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmhhc093blByb3BlcnR5KCdkZWZhdWx0JykpIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlZmF1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnZhbHVlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVtYmVycyA9IG5ldyBDb21wb3NlZFByb3BlcnR5Lk1lbWJlcnModGhpcy5wcm9wZXJ0eS5vcHRpb25zLm1lbWJlcnMpO1xuICAgICAgdGhpcy5tZW1iZXJzLmNoYW5nZWQgPSAob2xkKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5qb2luID0gdHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA6IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSA/IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5vciA6IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5hbmQ7XG4gICAgfVxuXG4gICAgY2FsY3VsKCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5vYmopO1xuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5tZW1iZXJzLnJlZHVjZSgocHJldiwgbWVtYmVyKSA9PiB7XG4gICAgICAgICAgdmFyIHZhbDtcbiAgICAgICAgICB2YWwgPSB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nID8gbWVtYmVyKHRoaXMuaW52YWxpZGF0b3IpIDogbWVtYmVyO1xuICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4ocHJldiwgdmFsKTtcbiAgICAgICAgfSwgdGhpcy5kZWZhdWx0KTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQ29tcG9zZWRQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcbiAgICAgIENhbGN1bGF0ZWRQcm9wZXJ0eS5iaW5kKHRhcmdldCwgcHJvcCk7XG4gICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lICsgJ01lbWJlcnMnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5tZW1iZXJzO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBDb21wb3NlZFByb3BlcnR5LmpvaW5GdW5jdGlvbnMgPSB7XG4gICAgYW5kOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAmJiBiO1xuICAgIH0sXG4gICAgb3I6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIHx8IGI7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb21wb3NlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5Db21wb3NlZFByb3BlcnR5Lk1lbWJlcnMgPSBjbGFzcyBNZW1iZXJzIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGFkZFByb3BlcnR5UmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBmbjtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AobmFtZSwgb2JqKTtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopIHtcbiAgICB2YXIgZm47XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbiA9IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9O1xuICAgICAgZm4ucmVmID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgdmFsOiB2YWxcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBzZXRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbiwgaSwgcmVmO1xuICAgIGkgPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpID09PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkucmVmLnZhbCAhPT0gdmFsKSB7XG4gICAgICByZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSByZWY7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoaSwgZm4pO1xuICAgIH1cbiAgfVxuXG4gIGdldFZhbHVlUmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihuYW1lLCBvYmopLnJlZi52YWw7XG4gIH1cblxuICBhZGRGdW5jdGlvblJlZihmbiwgbmFtZSwgb2JqKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgZmluZEJ5UmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopXTtcbiAgfVxuXG4gIGZpbmRSZWZJbmRleChuYW1lLCBvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgcmV0dXJuIChtZW1iZXIucmVmICE9IG51bGwpICYmIG1lbWJlci5yZWYub2JqID09PSBvYmogJiYgbWVtYmVyLnJlZi5uYW1lID09PSBuYW1lO1xuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlUmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBpbmRleCwgb2xkO1xuICAgIGluZGV4ID0gdGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzLm1hcFxuIiwidmFyIEJhc2ljUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgSW52YWxpZGF0b3I7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxuQmFzaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vQmFzaWNQcm9wZXJ0eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IER5bmFtaWNQcm9wZXJ0eSA9IGNsYXNzIER5bmFtaWNQcm9wZXJ0eSBleHRlbmRzIEJhc2ljUHJvcGVydHkge1xuICBjYWxsYmFja0dldCgpIHtcbiAgICB2YXIgcmVzO1xuICAgIHJlcyA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiZ2V0XCIpO1xuICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfaW52YWxpZGF0ZU5vdGljZSgpIHtcbiAgICB0aGlzLmVtaXRFdmVudCgnaW52YWxpZGF0ZWQnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChwcm9wLmluc3RhbmNlVHlwZSA9PSBudWxsKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge307XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5nZXQgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja0dldDtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcy5tYXBcbiIsInZhciBDYWxjdWxhdGVkUHJvcGVydHksIEludmFsaWRhdGVkUHJvcGVydHksIEludmFsaWRhdG9yO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgSW52YWxpZGF0ZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgdW5rbm93bigpIHtcbiAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChJbnZhbGlkYXRlZFByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBJbnZhbGlkYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuY2FsY3VsRnVuY3QsIGludmFsaWRhdG9yKTtcbiAgICAgICAgdGhpcy5tYW51YWwgPSBmYWxzZTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGVzdHJveS53aXRob3V0SW52YWxpZGF0ZWRQcm9wZXJ0eSgpO1xuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGludmFsaWRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuY2FsY3VsYXRlZCB8fCB0aGlzLmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICAgICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQgJiYgKHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBJbnZhbGlkYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcy5tYXBcbiIsInZhciBSZWZlcnJlZDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWZlcnJlZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUmVmZXJyZWQge1xuICAgIGNvbXBhcmVSZWZlcmVkKHJlZmVyZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmNvbXBhcmVSZWZlcmVkKHJlZmVyZWQsIHRoaXMpO1xuICAgIH1cblxuICAgIGdldFJlZigpIHt9XG5cbiAgICBzdGF0aWMgY29tcGFyZVJlZmVyZWQob2JqMSwgb2JqMikge1xuICAgICAgcmV0dXJuIG9iajEgPT09IG9iajIgfHwgKChvYmoxICE9IG51bGwpICYmIChvYmoyICE9IG51bGwpICYmIG9iajEuY29uc3RydWN0b3IgPT09IG9iajIuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlUmVmKG9iajEucmVmLCBvYmoyLnJlZikpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wYXJlUmVmKHJlZjEsIHJlZjIpIHtcbiAgICAgIHJldHVybiAocmVmMSAhPSBudWxsKSAmJiAocmVmMiAhPSBudWxsKSAmJiAocmVmMSA9PT0gcmVmMiB8fCAoQXJyYXkuaXNBcnJheShyZWYxKSAmJiBBcnJheS5pc0FycmF5KHJlZjEpICYmIHJlZjEuZXZlcnkoKHZhbCwgaSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlUmVmZXJlZChyZWYxW2ldLCByZWYyW2ldKTtcbiAgICAgIH0pKSB8fCAodHlwZW9mIHJlZjEgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlZjIgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmtleXMocmVmMSkuam9pbigpID09PSBPYmplY3Qua2V5cyhyZWYyKS5qb2luKCkgJiYgT2JqZWN0LmtleXMocmVmMSkuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlUmVmZXJlZChyZWYxW2tleV0sIHJlZjJba2V5XSk7XG4gICAgICB9KSkpO1xuICAgIH1cblxuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWZlcnJlZC5wcm90b3R5cGUsICdyZWYnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlZigpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFJlZmVycmVkO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1JlZmVycmVkLmpzLm1hcFxuIiwidmFyIEJpbmRlciwgVXBkYXRlcjtcblxuQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBVcGRhdGVyID0gY2xhc3MgVXBkYXRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5uZXh0ID0gW107XG4gICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICAgIGlmICgob3B0aW9ucyAhPSBudWxsID8gb3B0aW9ucy5jYWxsYmFjayA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5hZGRDYWxsYmFjayhvcHRpb25zLmNhbGxiYWNrKTtcbiAgICB9XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyAocmVmID0gb3B0aW9ucy5jYWxsYmFja3MpICE9IG51bGwgPyByZWYuZm9yRWFjaCA6IHZvaWQgMCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHZhciBjYWxsYmFjaztcbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLm5leHQgPSB0aGlzLmNhbGxiYWNrcy5zbGljZSgpO1xuICAgIHdoaWxlICh0aGlzLmNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tzLnNoaWZ0KCk7XG4gICAgICB0aGlzLnJ1bkNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgdGhpcy5jYWxsYmFja3MgPSB0aGlzLm5leHQ7XG4gICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcnVuQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfVxuXG4gIGFkZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcy5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAodGhpcy51cGRhdGluZyAmJiAhdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBuZXh0VGljayhjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICBpZiAoIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gdGhpcy5jYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLm5leHQuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGdldEJpbmRlcigpIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZXIuQmluZGVyKHRoaXMpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIHJldHVybiB0aGlzLm5leHQgPSBbXTtcbiAgfVxuXG59O1xuXG5VcGRhdGVyLkJpbmRlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGNsYXNzIEJpbmRlciBleHRlbmRzIHN1cGVyQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHRhcmdldCwgY2FsbGJhY2sxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sxO1xuICAgIH1cblxuICAgIGdldFJlZigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRvQmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBkb1VuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gQmluZGVyO1xuXG59KS5jYWxsKHRoaXMsIEJpbmRlcik7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVXBkYXRlci5qcy5tYXBcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkJpbmRlclwiOiByZXF1aXJlKFwiLi9CaW5kZXJcIiksXG4gIFwiQ29sbGVjdGlvblwiOiByZXF1aXJlKFwiLi9Db2xsZWN0aW9uXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJFdmVudEJpbmRcIjogcmVxdWlyZShcIi4vRXZlbnRCaW5kXCIpLFxuICBcIkV2ZW50RW1pdHRlclwiOiByZXF1aXJlKFwiLi9FdmVudEVtaXR0ZXJcIiksXG4gIFwiSW52YWxpZGF0b3JcIjogcmVxdWlyZShcIi4vSW52YWxpZGF0b3JcIiksXG4gIFwiTG9hZGVyXCI6IHJlcXVpcmUoXCIuL0xvYWRlclwiKSxcbiAgXCJNaXhhYmxlXCI6IHJlcXVpcmUoXCIuL01peGFibGVcIiksXG4gIFwiT3ZlcnJpZGVyXCI6IHJlcXVpcmUoXCIuL092ZXJyaWRlclwiKSxcbiAgXCJQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVwiKSxcbiAgXCJQcm9wZXJ0eU93bmVyXCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5T3duZXJcIiksXG4gIFwiUmVmZXJyZWRcIjogcmVxdWlyZShcIi4vUmVmZXJyZWRcIiksXG4gIFwiVXBkYXRlclwiOiByZXF1aXJlKFwiLi9VcGRhdGVyXCIpLFxuICBcIkludmFsaWRhdGVkXCI6IHtcbiAgICBcIkFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXJcIiksXG4gICAgXCJDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXJcIiksXG4gICAgXCJJbnZhbGlkYXRlZFwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZFwiKSxcbiAgICBcIlByb3BlcnR5V2F0Y2hlclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9Qcm9wZXJ0eVdhdGNoZXJcIiksXG4gIH0sXG4gIFwiUHJvcGVydHlUeXBlc1wiOiB7XG4gICAgXCJCYXNpY1Byb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eVwiKSxcbiAgICBcIkNhbGN1bGF0ZWRQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eVwiKSxcbiAgICBcIkNvbGxlY3Rpb25Qcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0NvbGxlY3Rpb25Qcm9wZXJ0eVwiKSxcbiAgICBcIkNvbXBvc2VkUHJvcGVydHlcIjogcmVxdWlyZShcIi4vUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5XCIpLFxuICAgIFwiRHluYW1pY1Byb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5XCIpLFxuICAgIFwiSW52YWxpZGF0ZWRQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHlcIiksXG4gIH0sXG59Il19
