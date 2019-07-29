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



},{"./Damageable":5,"./actions/WalkAction":30,"parallelio-tiles":86}],3:[function(require,module,exports){
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



},{"./Door":6,"./VisionCalculator":22,"./actions/AttackMoveAction":26,"./actions/WalkAction":30,"parallelio-tiles":86,"spark-starter":139}],4:[function(require,module,exports){
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



},{"./LineOfSight":10,"parallelio-tiles":86,"spark-starter":139}],5:[function(require,module,exports){
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



},{"spark-starter":139}],6:[function(require,module,exports){
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



},{"parallelio-tiles":86}],7:[function(require,module,exports){
module.exports = require('spark-starter').Element;



},{"spark-starter":139}],8:[function(require,module,exports){
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



},{"parallelio-tiles":86}],9:[function(require,module,exports){
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



},{"./Player":15,"./View":21,"parallelio-timing":87,"spark-starter":139}],10:[function(require,module,exports){
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



},{"spark-starter":139}],12:[function(require,module,exports){
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



},{"parallelio-tiles":86}],13:[function(require,module,exports){
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



},{"parallelio-timing":87,"spark-starter":139}],14:[function(require,module,exports){
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



},{"./LineOfSight":10,"parallelio-timing":87,"spark-starter":139}],15:[function(require,module,exports){
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



},{"spark-starter":139}],16:[function(require,module,exports){
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



},{"parallelio-timing":87,"spark-starter":139}],17:[function(require,module,exports){
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



},{"./Door":6,"parallelio-tiles":86,"spark-starter":139}],18:[function(require,module,exports){
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



},{"./Damageable":5,"./Projectile":16,"parallelio-tiles":86,"parallelio-timing":87}],19:[function(require,module,exports){
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
    minStarDist: 10,
    minLinkDist: 10,
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



},{"./Map":11,"./StarSystem":20,"parallelio-strings":78,"spark-starter":139}],20:[function(require,module,exports){
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



},{"spark-starter":139}],21:[function(require,module,exports){
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



},{"parallelio-grids":36,"spark-starter":139}],22:[function(require,module,exports){
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



},{"./LineOfSight":10,"parallelio-tiles":86}],23:[function(require,module,exports){
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



},{"spark-starter":139}],24:[function(require,module,exports){
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



},{"spark-starter":139}],25:[function(require,module,exports){
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



},{"./TargetAction":28,"./WalkAction":30,"spark-starter":139}],26:[function(require,module,exports){
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



},{"../LineOfSight":10,"./AttackAction":25,"./TargetAction":28,"./WalkAction":30,"parallelio-pathfinder":57,"spark-starter":139}],27:[function(require,module,exports){
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



},{"./ActionProvider":24,"spark-starter":139}],30:[function(require,module,exports){
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



},{"../PathWalk":13,"./TargetAction":28,"parallelio-pathfinder":57}],31:[function(require,module,exports){
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
  "StarMapGenerator": require("./StarMapGenerator"),
  "StarSystem": require("./StarSystem"),
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
},{"./AutomaticDoor":1,"./Character":2,"./CharacterAI":3,"./DamagePropagation":4,"./Damageable":5,"./Door":6,"./Element":7,"./Floor":8,"./Game":9,"./LineOfSight":10,"./Map":11,"./Obstacle":12,"./PathWalk":13,"./PersonalWeapon":14,"./Player":15,"./Projectile":16,"./RoomGenerator":17,"./ShipWeapon":18,"./StarMapGenerator":19,"./StarSystem":20,"./View":21,"./VisionCalculator":22,"./actions/Action":23,"./actions/ActionProvider":24,"./actions/AttackAction":25,"./actions/AttackMoveAction":26,"./actions/SimpleActionProvider":27,"./actions/TargetAction":28,"./actions/TiledActionProvider":29,"./actions/WalkAction":30}],32:[function(require,module,exports){
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



},{"./libs":31,"parallelio-grids":36,"parallelio-pathfinder":57,"parallelio-strings":78,"parallelio-tiles":86,"parallelio-timing":87,"parallelio-wiring":114,"spark-starter":139}],33:[function(require,module,exports){
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
},{"./GridCell":34,"./GridRow":35,"spark-starter":56}],34:[function(require,module,exports){
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
},{"spark-starter":56}],35:[function(require,module,exports){
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
},{"./GridCell":34,"spark-starter":56}],36:[function(require,module,exports){
if(module){
  module.exports = {
    Grid: require('./Grid.js'),
    GridCell: require('./GridCell.js'),
    GridRow: require('./GridRow.js')
  };
}
},{"./Grid.js":33,"./GridCell.js":34,"./GridRow.js":35}],37:[function(require,module,exports){
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


},{}],38:[function(require,module,exports){
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


},{}],39:[function(require,module,exports){
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


},{"./Mixable":43,"./Property":45}],40:[function(require,module,exports){
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


},{"./Binder":37}],41:[function(require,module,exports){
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


},{}],42:[function(require,module,exports){
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


},{"./Binder":37,"./EventBind":40}],43:[function(require,module,exports){
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


},{}],44:[function(require,module,exports){
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


},{}],45:[function(require,module,exports){
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


},{"./Mixable":43,"./PropertyOwner":46,"./PropertyTypes/ActivableProperty":47,"./PropertyTypes/BasicProperty":48,"./PropertyTypes/CalculatedProperty":49,"./PropertyTypes/CollectionProperty":50,"./PropertyTypes/ComposedProperty":51,"./PropertyTypes/DynamicProperty":52,"./PropertyTypes/InvalidatedProperty":53,"./PropertyTypes/UpdatedProperty":54}],46:[function(require,module,exports){
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


},{}],47:[function(require,module,exports){
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


},{"../Invalidator":42,"../Overrider":44,"./BasicProperty":48}],48:[function(require,module,exports){
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


},{"../Mixable":43}],49:[function(require,module,exports){
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


},{"../Invalidator":42,"../Overrider":44,"./DynamicProperty":52}],50:[function(require,module,exports){
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


},{"../Collection":38,"./DynamicProperty":52}],51:[function(require,module,exports){
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


},{"../Collection":38,"../Invalidator":42,"./CalculatedProperty":49}],52:[function(require,module,exports){
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


},{"../Invalidator":42,"./BasicProperty":48}],53:[function(require,module,exports){
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


},{"../Invalidator":42,"./CalculatedProperty":49}],54:[function(require,module,exports){
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


},{"../Invalidator":42,"../Overrider":44,"./DynamicProperty":52}],55:[function(require,module,exports){
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


},{"./Binder":37}],56:[function(require,module,exports){
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
},{"./Binder.js":37,"./Collection.js":38,"./Element.js":39,"./EventBind.js":40,"./EventEmitter.js":41,"./Invalidator.js":42,"./Mixable.js":43,"./Overrider.js":44,"./Property.js":45,"./PropertyOwner.js":46,"./PropertyTypes/ActivableProperty.js":47,"./PropertyTypes/BasicProperty.js":48,"./PropertyTypes/CalculatedProperty.js":49,"./PropertyTypes/CollectionProperty.js":50,"./PropertyTypes/ComposedProperty.js":51,"./PropertyTypes/DynamicProperty.js":52,"./PropertyTypes/InvalidatedProperty.js":53,"./PropertyTypes/UpdatedProperty.js":54,"./Updater.js":55}],57:[function(require,module,exports){
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
},{"spark-starter":77}],58:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"dup":37}],59:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"dup":38}],60:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"./Mixable":64,"./Property":66,"dup":39}],61:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"./Binder":58,"dup":40}],62:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"dup":41}],63:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"./Binder":58,"./EventBind":61,"dup":42}],64:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"dup":43}],65:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"dup":44}],66:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"./Mixable":64,"./PropertyOwner":67,"./PropertyTypes/ActivableProperty":68,"./PropertyTypes/BasicProperty":69,"./PropertyTypes/CalculatedProperty":70,"./PropertyTypes/CollectionProperty":71,"./PropertyTypes/ComposedProperty":72,"./PropertyTypes/DynamicProperty":73,"./PropertyTypes/InvalidatedProperty":74,"./PropertyTypes/UpdatedProperty":75,"dup":45}],67:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"dup":46}],68:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"../Invalidator":63,"../Overrider":65,"./BasicProperty":69,"dup":47}],69:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"../Mixable":64,"dup":48}],70:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../Invalidator":63,"../Overrider":65,"./DynamicProperty":73,"dup":49}],71:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"../Collection":59,"./DynamicProperty":73,"dup":50}],72:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"../Collection":59,"../Invalidator":63,"./CalculatedProperty":70,"dup":51}],73:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"../Invalidator":63,"./BasicProperty":69,"dup":52}],74:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"../Invalidator":63,"./CalculatedProperty":70,"dup":53}],75:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"../Invalidator":63,"../Overrider":65,"./DynamicProperty":73,"dup":54}],76:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"./Binder":58,"dup":55}],77:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"./Binder.js":58,"./Collection.js":59,"./Element.js":60,"./EventBind.js":61,"./EventEmitter.js":62,"./Invalidator.js":63,"./Mixable.js":64,"./Overrider.js":65,"./Property.js":66,"./PropertyOwner.js":67,"./PropertyTypes/ActivableProperty.js":68,"./PropertyTypes/BasicProperty.js":69,"./PropertyTypes/CalculatedProperty.js":70,"./PropertyTypes/CollectionProperty.js":71,"./PropertyTypes/ComposedProperty.js":72,"./PropertyTypes/DynamicProperty.js":73,"./PropertyTypes/InvalidatedProperty.js":74,"./PropertyTypes/UpdatedProperty.js":75,"./Updater.js":76,"dup":56}],78:[function(require,module,exports){
if (typeof module !== "undefined" && module !== null) {
  module.exports = {
      greekAlphabet: require('./strings/greekAlphabet'),
      starNames: require('./strings/starNames')
  };
}
},{"./strings/greekAlphabet":79,"./strings/starNames":80}],79:[function(require,module,exports){
module.exports=[
"alpha",   "beta",    "gamma",   "delta",
"epsilon", "zeta",    "eta",     "theta",
"iota",    "kappa",   "lambda",  "mu",
"nu",      "xi",      "omicron", "pi",	
"rho",     "sigma",   "tau",     "upsilon",
"phi",     "chi",     "psi",     "omega"
]
},{}],80:[function(require,module,exports){
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
},{}],81:[function(require,module,exports){
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

},{}],82:[function(require,module,exports){
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

},{"./Direction":81,"spark-starter":139}],83:[function(require,module,exports){
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

},{"./TileReference":84,"spark-starter":139}],84:[function(require,module,exports){
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

},{}],85:[function(require,module,exports){
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

},{"spark-starter":139}],86:[function(require,module,exports){
module.exports = {
  "Direction": require("./Direction"),
  "Tile": require("./Tile"),
  "TileContainer": require("./TileContainer"),
  "TileReference": require("./TileReference"),
  "Tiled": require("./Tiled"),
}
},{"./Direction":81,"./Tile":82,"./TileContainer":83,"./TileReference":84,"./Tiled":85}],87:[function(require,module,exports){
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

},{"_process":115,"spark-starter":107}],88:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"dup":37}],89:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"dup":38}],90:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"./Mixable":94,"./Property":96,"dup":39}],91:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"./Binder":88,"dup":40}],92:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"dup":41}],93:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"./Binder":88,"./EventBind":91,"dup":42}],94:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"dup":43}],95:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"dup":44}],96:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"./Mixable":94,"./PropertyOwner":97,"./PropertyTypes/ActivableProperty":98,"./PropertyTypes/BasicProperty":99,"./PropertyTypes/CalculatedProperty":100,"./PropertyTypes/CollectionProperty":101,"./PropertyTypes/ComposedProperty":102,"./PropertyTypes/DynamicProperty":103,"./PropertyTypes/InvalidatedProperty":104,"./PropertyTypes/UpdatedProperty":105,"dup":45}],97:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"dup":46}],98:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"../Invalidator":93,"../Overrider":95,"./BasicProperty":99,"dup":47}],99:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"../Mixable":94,"dup":48}],100:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../Invalidator":93,"../Overrider":95,"./DynamicProperty":103,"dup":49}],101:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"../Collection":89,"./DynamicProperty":103,"dup":50}],102:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"../Collection":89,"../Invalidator":93,"./CalculatedProperty":100,"dup":51}],103:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"../Invalidator":93,"./BasicProperty":99,"dup":52}],104:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"../Invalidator":93,"./CalculatedProperty":100,"dup":53}],105:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"../Invalidator":93,"../Overrider":95,"./DynamicProperty":103,"dup":54}],106:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"./Binder":88,"dup":55}],107:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"./Binder.js":88,"./Collection.js":89,"./Element.js":90,"./EventBind.js":91,"./EventEmitter.js":92,"./Invalidator.js":93,"./Mixable.js":94,"./Overrider.js":95,"./Property.js":96,"./PropertyOwner.js":97,"./PropertyTypes/ActivableProperty.js":98,"./PropertyTypes/BasicProperty.js":99,"./PropertyTypes/CalculatedProperty.js":100,"./PropertyTypes/CollectionProperty.js":101,"./PropertyTypes/ComposedProperty.js":102,"./PropertyTypes/DynamicProperty.js":103,"./PropertyTypes/InvalidatedProperty.js":104,"./PropertyTypes/UpdatedProperty.js":105,"./Updater.js":106,"dup":56}],108:[function(require,module,exports){
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

},{"./SignalOperation":110,"spark-starter":139}],109:[function(require,module,exports){
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

},{"spark-starter":139}],110:[function(require,module,exports){
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

},{"spark-starter":139}],111:[function(require,module,exports){
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

},{"./Connected":108,"./Signal":109,"./SignalOperation":110}],112:[function(require,module,exports){
var Connected, Switch;

Connected = require('./Connected');

module.exports = Switch = class Switch extends Connected {};

},{"./Connected":108}],113:[function(require,module,exports){
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

},{"./Connected":108,"parallelio-tiles":86}],114:[function(require,module,exports){
module.exports = {
  "Connected": require("./Connected"),
  "Signal": require("./Signal"),
  "SignalOperation": require("./SignalOperation"),
  "SignalSource": require("./SignalSource"),
  "Switch": require("./Switch"),
  "Wire": require("./Wire"),
}
},{"./Connected":108,"./Signal":109,"./SignalOperation":110,"./SignalSource":111,"./Switch":112,"./Wire":113}],115:[function(require,module,exports){
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

},{}],116:[function(require,module,exports){
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



},{"./Referred":137}],117:[function(require,module,exports){
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



},{}],118:[function(require,module,exports){
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



},{"./Mixable":127,"./Property":129}],119:[function(require,module,exports){
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



},{"./Binder":116}],120:[function(require,module,exports){
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



},{}],121:[function(require,module,exports){
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



},{"../Invalidator":125,"./PropertyWatcher":124}],122:[function(require,module,exports){
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



},{"./PropertyWatcher":124}],123:[function(require,module,exports){
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



},{"../Invalidator":125}],124:[function(require,module,exports){
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



},{"../Binder":116}],125:[function(require,module,exports){
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



},{"./Binder":116,"./EventBind":119}],126:[function(require,module,exports){
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



},{"./Overrider":128}],127:[function(require,module,exports){
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



},{}],128:[function(require,module,exports){
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



},{}],129:[function(require,module,exports){
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



},{"./Mixable":127,"./PropertyOwner":130,"./PropertyTypes/BasicProperty":131,"./PropertyTypes/CalculatedProperty":132,"./PropertyTypes/CollectionProperty":133,"./PropertyTypes/ComposedProperty":134,"./PropertyTypes/DynamicProperty":135,"./PropertyTypes/InvalidatedProperty":136}],130:[function(require,module,exports){
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



},{}],131:[function(require,module,exports){
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



},{"../EventEmitter":120,"../Invalidated/PropertyWatcher":124,"../Loader":126,"../Mixable":127,"../Referred":137}],132:[function(require,module,exports){
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



},{"../Invalidator":125,"../Overrider":128,"./DynamicProperty":135}],133:[function(require,module,exports){
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



},{"../Collection":117,"../Invalidated/CollectionPropertyWatcher":122,"../Referred":137,"./DynamicProperty":135}],134:[function(require,module,exports){
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



},{"../Collection":117,"../Invalidator":125,"./CalculatedProperty":132}],135:[function(require,module,exports){
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



},{"../Invalidator":125,"./BasicProperty":131}],136:[function(require,module,exports){
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



},{"../Invalidator":125,"./CalculatedProperty":132}],137:[function(require,module,exports){
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



},{}],138:[function(require,module,exports){
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



},{"./Binder":116}],139:[function(require,module,exports){
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
},{"./Binder":116,"./Collection":117,"./Element":118,"./EventBind":119,"./EventEmitter":120,"./Invalidated/ActivablePropertyWatcher":121,"./Invalidated/CollectionPropertyWatcher":122,"./Invalidated/Invalidated":123,"./Invalidated/PropertyWatcher":124,"./Invalidator":125,"./Loader":126,"./Mixable":127,"./Overrider":128,"./Property":129,"./PropertyOwner":130,"./PropertyTypes/BasicProperty":131,"./PropertyTypes/CalculatedProperty":132,"./PropertyTypes/CollectionProperty":133,"./PropertyTypes/ComposedProperty":134,"./PropertyTypes/DynamicProperty":135,"./PropertyTypes/InvalidatedProperty":136,"./Referred":137,"./Updater":138}]},{},[32])(32)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQXV0b21hdGljRG9vci5qcyIsImxpYi9DaGFyYWN0ZXIuanMiLCJsaWIvQ2hhcmFjdGVyQUkuanMiLCJsaWIvRGFtYWdlUHJvcGFnYXRpb24uanMiLCJsaWIvRGFtYWdlYWJsZS5qcyIsImxpYi9Eb29yLmpzIiwibGliL0VsZW1lbnQuanMiLCJsaWIvRmxvb3IuanMiLCJsaWIvR2FtZS5qcyIsImxpYi9MaW5lT2ZTaWdodC5qcyIsImxpYi9NYXAuanMiLCJsaWIvT2JzdGFjbGUuanMiLCJsaWIvUGF0aFdhbGsuanMiLCJsaWIvUGVyc29uYWxXZWFwb24uanMiLCJsaWIvUGxheWVyLmpzIiwibGliL1Byb2plY3RpbGUuanMiLCJsaWIvUm9vbUdlbmVyYXRvci5qcyIsImxpYi9TaGlwV2VhcG9uLmpzIiwibGliL1N0YXJNYXBHZW5lcmF0b3IuanMiLCJsaWIvU3RhclN5c3RlbS5qcyIsImxpYi9WaWV3LmpzIiwibGliL1Zpc2lvbkNhbGN1bGF0b3IuanMiLCJsaWIvYWN0aW9ucy9BY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9BY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL0F0dGFja0FjdGlvbi5qcyIsImxpYi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlci5qcyIsImxpYi9hY3Rpb25zL1RhcmdldEFjdGlvbi5qcyIsImxpYi9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9XYWxrQWN0aW9uLmpzIiwibGliL2xpYnMuanMiLCJsaWIvcGFyYWxsZWxpby5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL2xpYi9HcmlkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL0dyaWRDZWxsLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL0dyaWRSb3cuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9saWIvZ3JpZHMuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvQmluZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0NvbGxlY3Rpb24uanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRWxlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9FdmVudEJpbmQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRXZlbnRFbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL01peGFibGUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvT3ZlcnJpZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5T3duZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9BY3RpdmFibGVQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9VcGRhdGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL3NwYXJrLXN0YXJ0ZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1wYXRoZmluZGVyL2Rpc3QvcGF0aGZpbmRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9ncmVla0FscGhhYmV0Lmpzb24iLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1zdHJpbmdzL3N0cmluZ3Mvc3Rhck5hbWVzLmpzb24iLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvRGlyZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZUNvbnRhaW5lci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlUmVmZXJlbmNlLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL3RpbGVzLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGltaW5nL2Rpc3QvdGltaW5nLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9Db25uZWN0ZWQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby13aXJpbmcvbGliL1NpZ25hbC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXdpcmluZy9saWIvU2lnbmFsT3BlcmF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9TaWduYWxTb3VyY2UuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby13aXJpbmcvbGliL1N3aXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXdpcmluZy9saWIvV2lyZS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXdpcmluZy9saWIvd2lyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9CaW5kZXIuanMiLCJub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvQ29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9FbGVtZW50LmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50QmluZC5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9FdmVudEVtaXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMiLCJub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0ZWQvUHJvcGVydHlXYXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0xvYWRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9NaXhhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL092ZXJyaWRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eU93bmVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NvbGxlY3Rpb25Qcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1JlZmVycmVkLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1VwZGF0ZXIuanMiLCJub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvc3Bhcmstc3RhcnRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIEF1dG9tYXRpY0Rvb3IsIENoYXJhY3RlciwgRG9vcjtcblxuRG9vciA9IHJlcXVpcmUoJy4vRG9vcicpO1xuXG5DaGFyYWN0ZXIgPSByZXF1aXJlKCcuL0NoYXJhY3RlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9tYXRpY0Rvb3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEF1dG9tYXRpY0Rvb3IgZXh0ZW5kcyBEb29yIHtcbiAgICB1cGRhdGVUaWxlTWVtYmVycyhvbGQpIHtcbiAgICAgIHZhciByZWYsIHJlZjEsIHJlZjIsIHJlZjM7XG4gICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgaWYgKChyZWYgPSBvbGQud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmLnJlbW92ZVJlZigndW5sb2NrZWQnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZjEgPSBvbGQudHJhbnNwYXJlbnRNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmMS5yZW1vdmVSZWYoJ29wZW4nLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICBpZiAoKHJlZjIgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmMi5hZGRQcm9wZXJ0eVJlZigndW5sb2NrZWQnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHJlZjMgPSB0aGlzLnRpbGUudHJhbnNwYXJlbnRNZW1iZXJzKSAhPSBudWxsID8gcmVmMy5hZGRQcm9wZXJ0eVJlZignb3BlbicsIHRoaXMpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICBzdXBlci5pbml0KCk7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuO1xuICAgIH1cblxuICAgIGlzQWN0aXZhdG9yUHJlc2VudChpbnZhbGlkYXRlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZWFjdGl2ZVRpbGVzKGludmFsaWRhdGUpLnNvbWUoKHRpbGUpID0+IHtcbiAgICAgICAgdmFyIGNoaWxkcmVuO1xuICAgICAgICBjaGlsZHJlbiA9IGludmFsaWRhdGUgPyBpbnZhbGlkYXRlLnByb3AoJ2NoaWxkcmVuJywgdGlsZSkgOiB0aWxlLmNoaWxkcmVuO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4uc29tZSgoY2hpbGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jYW5CZUFjdGl2YXRlZEJ5KGNoaWxkKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYW5CZUFjdGl2YXRlZEJ5KGVsZW0pIHtcbiAgICAgIHJldHVybiBlbGVtIGluc3RhbmNlb2YgQ2hhcmFjdGVyO1xuICAgIH1cblxuICAgIGdldFJlYWN0aXZlVGlsZXMoaW52YWxpZGF0ZSkge1xuICAgICAgdmFyIGRpcmVjdGlvbiwgdGlsZTtcbiAgICAgIHRpbGUgPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKCd0aWxlJykgOiB0aGlzLnRpbGU7XG4gICAgICBpZiAoIXRpbGUpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgZGlyZWN0aW9uID0gaW52YWxpZGF0ZSA/IGludmFsaWRhdGUucHJvcCgnZGlyZWN0aW9uJykgOiB0aGlzLmRpcmVjdGlvbjtcbiAgICAgIGlmIChkaXJlY3Rpb24gPT09IERvb3IuZGlyZWN0aW9ucy5ob3Jpem9udGFsKSB7XG4gICAgICAgIHJldHVybiBbdGlsZSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMCwgMSksIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKDAsIC0xKV0uZmlsdGVyKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdCAhPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbdGlsZSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMSwgMCksIHRpbGUuZ2V0UmVsYXRpdmVUaWxlKC0xLCAwKV0uZmlsdGVyKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdCAhPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBBdXRvbWF0aWNEb29yLnByb3BlcnRpZXMoe1xuICAgIG9wZW46IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0ZSkge1xuICAgICAgICByZXR1cm4gIWludmFsaWRhdGUucHJvcCgnbG9ja2VkJykgJiYgdGhpcy5pc0FjdGl2YXRvclByZXNlbnQoaW52YWxpZGF0ZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBsb2NrZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICB1bmxvY2tlZDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHJldHVybiAhaW52YWxpZGF0ZS5wcm9wKCdsb2NrZWQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBdXRvbWF0aWNEb29yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0F1dG9tYXRpY0Rvb3IuanMubWFwXG4iLCJ2YXIgQ2hhcmFjdGVyLCBEYW1hZ2VhYmxlLCBUaWxlZCwgV2Fsa0FjdGlvbjtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbkRhbWFnZWFibGUgPSByZXF1aXJlKCcuL0RhbWFnZWFibGUnKTtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9XYWxrQWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcmFjdGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDaGFyYWN0ZXIgZXh0ZW5kcyBUaWxlZCB7XG4gICAgY29uc3RydWN0b3IobmFtZSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICBpZiAoIXRoaXMudGlsZSAmJiAodGhpcy5nYW1lLm1haW5UaWxlQ29udGFpbmVyICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1dE9uUmFuZG9tVGlsZSh0aGlzLmdhbWUubWFpblRpbGVDb250YWluZXIudGlsZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNhbkdvT25UaWxlKHRpbGUpIHtcbiAgICAgIHJldHVybiAodGlsZSAhPSBudWxsID8gdGlsZS53YWxrYWJsZSA6IHZvaWQgMCkgIT09IGZhbHNlO1xuICAgIH1cblxuICAgIHdhbGtUbyh0aWxlKSB7XG4gICAgICB2YXIgYWN0aW9uO1xuICAgICAgYWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgICBhY3RvcjogdGhpcyxcbiAgICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgICB9KTtcbiAgICAgIGFjdGlvbi5leGVjdXRlKCk7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH1cblxuICAgIGlzU2VsZWN0YWJsZUJ5KHBsYXllcikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIH07XG5cbiAgQ2hhcmFjdGVyLmV4dGVuZChEYW1hZ2VhYmxlKTtcblxuICBDaGFyYWN0ZXIucHJvcGVydGllcyh7XG4gICAgZ2FtZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNldERlZmF1bHRzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGRlZmF1bHQ6IDAuNVxuICAgIH0sXG4gICAgb2Zmc2V0WToge1xuICAgICAgZGVmYXVsdDogMC41XG4gICAgfSxcbiAgICBkZWZhdWx0QWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgICAgIGFjdG9yOiB0aGlzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgYXZhaWxhYmxlQWN0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHRpbGU7XG4gICAgICAgIHRpbGUgPSBpbnZhbGlkYXRvci5wcm9wKFwidGlsZVwiKTtcbiAgICAgICAgaWYgKHRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChcInByb3ZpZGVkQWN0aW9uc1wiLCB0aWxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBDaGFyYWN0ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvQ2hhcmFjdGVyLmpzLm1hcFxuIiwidmFyIEF0dGFja01vdmVBY3Rpb24sIENoYXJhY3RlckFJLCBEb29yLCBQcm9wZXJ0eVdhdGNoZXIsIFRpbGVDb250YWluZXIsIFZpc2lvbkNhbGN1bGF0b3IsIFdhbGtBY3Rpb247XG5cblRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lcjtcblxuVmlzaW9uQ2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vVmlzaW9uQ2FsY3VsYXRvcicpO1xuXG5Eb29yID0gcmVxdWlyZSgnLi9Eb29yJyk7XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvV2Fsa0FjdGlvbicpO1xuXG5BdHRhY2tNb3ZlQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24nKTtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkludmFsaWRhdGVkLlByb3BlcnR5V2F0Y2hlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXJBSSA9IGNsYXNzIENoYXJhY3RlckFJIHtcbiAgY29uc3RydWN0b3IoY2hhcmFjdGVyKSB7XG4gICAgdGhpcy5jaGFyYWN0ZXIgPSBjaGFyYWN0ZXI7XG4gICAgdGhpcy5uZXh0QWN0aW9uQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0QWN0aW9uKCk7XG4gICAgfTtcbiAgICB0aGlzLnZpc2lvbk1lbW9yeSA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgdGhpcy50aWxlV2F0Y2hlciA9IG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVmlzaW9uTWVtb3J5KCk7XG4gICAgICB9LFxuICAgICAgcHJvcGVydHk6IHRoaXMuY2hhcmFjdGVyLmdldFByb3BlcnR5SW5zdGFuY2UoJ3RpbGUnKVxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy50aWxlV2F0Y2hlci5iaW5kKCk7XG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGlvbigpO1xuICB9XG5cbiAgbmV4dEFjdGlvbigpIHtcbiAgICB2YXIgZW5uZW15LCB1bmV4cGxvcmVkO1xuICAgIHRoaXMudXBkYXRlVmlzaW9uTWVtb3J5KCk7XG4gICAgaWYgKGVubmVteSA9IHRoaXMuZ2V0Q2xvc2VzdEVuZW15KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dGFja01vdmVUbyhlbm5lbXkpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodW5leHBsb3JlZCA9IHRoaXMuZ2V0Q2xvc2VzdFVuZXhwbG9yZWQoKSkge1xuICAgICAgcmV0dXJuIHRoaXMud2Fsa1RvKHVuZXhwbG9yZWQpLm9uKCdlbmQnLCBuZXh0QWN0aW9uQ2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc2V0VmlzaW9uTWVtb3J5KCk7XG4gICAgICByZXR1cm4gdGhpcy53YWxrVG8odGhpcy5nZXRDbG9zZXN0VW5leHBsb3JlZCgpKS5vbignZW5kJywgbmV4dEFjdGlvbkNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaXNpb25NZW1vcnkoKSB7XG4gICAgdmFyIGNhbGN1bGF0b3I7XG4gICAgY2FsY3VsYXRvciA9IG5ldyBWaXNpb25DYWxjdWxhdG9yKHRoaXMuY2hhcmFjdGVyLnRpbGUpO1xuICAgIGNhbGN1bGF0b3IuY2FsY3VsKCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaW9uTWVtb3J5ID0gY2FsY3VsYXRvci50b0NvbnRhaW5lcigpLm1lcmdlKHRoaXMudmlzaW9uTWVtb3J5LCAoYSwgYikgPT4ge1xuICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICBhID0gdGhpcy5hbmFseXplVGlsZShhKTtcbiAgICAgIH1cbiAgICAgIGlmICgoYSAhPSBudWxsKSAmJiAoYiAhPSBudWxsKSkge1xuICAgICAgICBhLnZpc2liaWxpdHkgPSBNYXRoLm1heChhLnZpc2liaWxpdHksIGIudmlzaWJpbGl0eSk7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGEgfHwgYjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFuYWx5emVUaWxlKHRpbGUpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRpbGUuZW5uZW15U3BvdHRlZCA9IChyZWYgPSB0aWxlLmdldEZpbmFsVGlsZSgpLmNoaWxkcmVuKSAhPSBudWxsID8gcmVmLmZpbmQoKGMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmlzRW5uZW15KGMpO1xuICAgIH0pIDogdm9pZCAwO1xuICAgIHRpbGUuZXhwbG9yYWJsZSA9IHRoaXMuaXNFeHBsb3JhYmxlKHRpbGUpO1xuICAgIHJldHVybiB0aWxlO1xuICB9XG5cbiAgaXNFbm5lbXkoZWxlbSkge1xuICAgIHZhciByZWY7XG4gICAgcmV0dXJuIChyZWYgPSB0aGlzLmNoYXJhY3Rlci5vd25lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuaXNFbmVteSA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmlzRW5lbXkoZWxlbSkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gIH1cblxuICBnZXRDbG9zZXN0RW5lbXkoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaW9uTWVtb3J5LmNsb3Nlc3QodGhpcy5jaGFyYWN0ZXIudGlsZSwgKHQpID0+IHtcbiAgICAgIHJldHVybiB0LmVubmVteVNwb3R0ZWQ7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDbG9zZXN0VW5leHBsb3JlZCgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkuY2xvc2VzdCh0aGlzLmNoYXJhY3Rlci50aWxlLCAodCkgPT4ge1xuICAgICAgcmV0dXJuIHQudmlzaWJpbGl0eSA8IDEgJiYgdC5leHBsb3JhYmxlO1xuICAgIH0pO1xuICB9XG5cbiAgaXNFeHBsb3JhYmxlKHRpbGUpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgIHJldHVybiB0aWxlLndhbGthYmxlIHx8ICgocmVmID0gdGlsZS5jaGlsZHJlbikgIT0gbnVsbCA/IHJlZi5maW5kKChjKSA9PiB7XG4gICAgICByZXR1cm4gYyBpbnN0YW5jZW9mIERvb3I7XG4gICAgfSkgOiB2b2lkIDApO1xuICB9XG5cbiAgYXR0YWNrTW92ZVRvKHRpbGUpIHtcbiAgICB2YXIgYWN0aW9uO1xuICAgIHRpbGUgPSB0aWxlLmdldEZpbmFsVGlsZSgpO1xuICAgIGFjdGlvbiA9IG5ldyBBdHRhY2tNb3ZlQWN0aW9uKHtcbiAgICAgIGFjdG9yOiB0aGlzLmNoYXJhY3RlcixcbiAgICAgIHRhcmdldDogdGlsZVxuICAgIH0pO1xuICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICBhY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgcmV0dXJuIGFjdGlvbjtcbiAgICB9XG4gIH1cblxuICB3YWxrVG8odGlsZSkge1xuICAgIHZhciBhY3Rpb247XG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKCk7XG4gICAgYWN0aW9uID0gbmV3IFdhbGtBY3Rpb24oe1xuICAgICAgYWN0b3I6IHRoaXMuY2hhcmFjdGVyLFxuICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgfSk7XG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5leGVjdXRlKCk7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0NoYXJhY3RlckFJLmpzLm1hcFxuIiwidmFyIERhbWFnZVByb3BhZ2F0aW9uLCBEaXJlY3Rpb24sIEVsZW1lbnQsIExpbmVPZlNpZ2h0O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkxpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpO1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhbWFnZVByb3BhZ2F0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBEYW1hZ2VQcm9wYWdhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZ2V0VGlsZUNvbnRhaW5lcigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGUuY29udGFpbmVyO1xuICAgIH1cblxuICAgIGFwcGx5KCkge1xuICAgICAgdmFyIGRhbWFnZSwgaSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSB0aGlzLmdldERhbWFnZWQoKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkYW1hZ2UgPSByZWZbaV07XG4gICAgICAgIHJlc3VsdHMucHVzaChkYW1hZ2UudGFyZ2V0LmRhbWFnZShkYW1hZ2UuZGFtYWdlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBnZXRJbml0aWFsVGlsZXMoKSB7XG4gICAgICB2YXIgY3RuO1xuICAgICAgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKCk7XG4gICAgICByZXR1cm4gY3RuLmluUmFuZ2UodGhpcy50aWxlLCB0aGlzLnJhbmdlKTtcbiAgICB9XG5cbiAgICBnZXRJbml0aWFsRGFtYWdlcygpIHtcbiAgICAgIHZhciBkYW1hZ2VzLCBkbWcsIGksIGxlbiwgdGlsZSwgdGlsZXM7XG4gICAgICBkYW1hZ2VzID0gW107XG4gICAgICB0aWxlcyA9IHRoaXMuZ2V0SW5pdGlhbFRpbGVzKCk7XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSB0aWxlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB0aWxlID0gdGlsZXNbaV07XG4gICAgICAgIGlmICh0aWxlLmRhbWFnZWFibGUgJiYgKGRtZyA9IHRoaXMuaW5pdGlhbERhbWFnZSh0aWxlLCB0aWxlcy5sZW5ndGgpKSkge1xuICAgICAgICAgIGRhbWFnZXMucHVzaChkbWcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZGFtYWdlcztcbiAgICB9XG5cbiAgICBnZXREYW1hZ2VkKCkge1xuICAgICAgdmFyIGFkZGVkO1xuICAgICAgaWYgKHRoaXMuX2RhbWFnZWQgPT0gbnVsbCkge1xuICAgICAgICBhZGRlZCA9IG51bGw7XG4gICAgICAgIHdoaWxlIChhZGRlZCA9IHRoaXMuc3RlcChhZGRlZCkpIHtcbiAgICAgICAgICB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZDtcbiAgICB9XG5cbiAgICBzdGVwKGFkZGVkKSB7XG4gICAgICBpZiAoYWRkZWQgIT0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5leHRlbmRlZERhbWFnZSAhPSBudWxsKSB7XG4gICAgICAgICAgYWRkZWQgPSB0aGlzLmV4dGVuZChhZGRlZCk7XG4gICAgICAgICAgdGhpcy5fZGFtYWdlZCA9IGFkZGVkLmNvbmNhdCh0aGlzLl9kYW1hZ2VkKTtcbiAgICAgICAgICByZXR1cm4gYWRkZWQubGVuZ3RoID4gMCAmJiBhZGRlZDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhbWFnZWQgPSB0aGlzLmdldEluaXRpYWxEYW1hZ2VzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5EYW1hZ2VkKHRhcmdldCwgZGFtYWdlZCkge1xuICAgICAgdmFyIGRhbWFnZSwgaSwgaW5kZXgsIGxlbjtcbiAgICAgIGZvciAoaW5kZXggPSBpID0gMCwgbGVuID0gZGFtYWdlZC5sZW5ndGg7IGkgPCBsZW47IGluZGV4ID0gKytpKSB7XG4gICAgICAgIGRhbWFnZSA9IGRhbWFnZWRbaW5kZXhdO1xuICAgICAgICBpZiAoZGFtYWdlLnRhcmdldCA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZXh0ZW5kKGRhbWFnZWQpIHtcbiAgICAgIHZhciBhZGRlZCwgY3RuLCBkYW1hZ2UsIGRpciwgZG1nLCBleGlzdGluZywgaSwgaiwgaywgbGVuLCBsZW4xLCBsZW4yLCBsb2NhbCwgcmVmLCB0YXJnZXQsIHRpbGU7XG4gICAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKTtcbiAgICAgIGFkZGVkID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBkYW1hZ2VkLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRhbWFnZSA9IGRhbWFnZWRbaV07XG4gICAgICAgIGxvY2FsID0gW107XG4gICAgICAgIGlmIChkYW1hZ2UudGFyZ2V0LnggIT0gbnVsbCkge1xuICAgICAgICAgIHJlZiA9IERpcmVjdGlvbi5hZGphY2VudHM7XG4gICAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgICAgIGRpciA9IHJlZltqXTtcbiAgICAgICAgICAgIHRpbGUgPSBjdG4uZ2V0VGlsZShkYW1hZ2UudGFyZ2V0LnggKyBkaXIueCwgZGFtYWdlLnRhcmdldC55ICsgZGlyLnkpO1xuICAgICAgICAgICAgaWYgKCh0aWxlICE9IG51bGwpICYmIHRpbGUuZGFtYWdlYWJsZSAmJiB0aGlzLmluRGFtYWdlZCh0aWxlLCB0aGlzLl9kYW1hZ2VkKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgbG9jYWwucHVzaCh0aWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChrID0gMCwgbGVuMiA9IGxvY2FsLmxlbmd0aDsgayA8IGxlbjI7IGsrKykge1xuICAgICAgICAgIHRhcmdldCA9IGxvY2FsW2tdO1xuICAgICAgICAgIGlmIChkbWcgPSB0aGlzLmV4dGVuZGVkRGFtYWdlKHRhcmdldCwgZGFtYWdlLCBsb2NhbC5sZW5ndGgpKSB7XG4gICAgICAgICAgICBpZiAoKGV4aXN0aW5nID0gdGhpcy5pbkRhbWFnZWQodGFyZ2V0LCBhZGRlZCkpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICBhZGRlZC5wdXNoKGRtZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhZGRlZFtleGlzdGluZ10gPSB0aGlzLm1lcmdlRGFtYWdlKGFkZGVkW2V4aXN0aW5nXSwgZG1nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhZGRlZDtcbiAgICB9XG5cbiAgICBtZXJnZURhbWFnZShkMSwgZDIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogZDEudGFyZ2V0LFxuICAgICAgICBwb3dlcjogZDEucG93ZXIgKyBkMi5wb3dlcixcbiAgICAgICAgZGFtYWdlOiBkMS5kYW1hZ2UgKyBkMi5kYW1hZ2VcbiAgICAgIH07XG4gICAgfVxuXG4gICAgbW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgdGFyZ2V0Lm1vZGlmeURhbWFnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih0YXJnZXQubW9kaWZ5RGFtYWdlKHBvd2VyLCB0aGlzLnR5cGUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHBvd2VyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBEYW1hZ2VQcm9wYWdhdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBwb3dlcjoge1xuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIHJhbmdlOiB7XG4gICAgICBkZWZhdWx0OiAxXG4gICAgfSxcbiAgICB0eXBlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRGFtYWdlUHJvcGFnYXRpb247XG5cbn0pLmNhbGwodGhpcyk7XG5cbkRhbWFnZVByb3BhZ2F0aW9uLk5vcm1hbCA9IGNsYXNzIE5vcm1hbCBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgaW5pdGlhbERhbWFnZSh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZztcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHRoaXMucG93ZXIpO1xuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG59O1xuXG5EYW1hZ2VQcm9wYWdhdGlvbi5UaGVybWljID0gY2xhc3MgVGhlcm1pYyBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgZXh0ZW5kZWREYW1hZ2UodGFyZ2V0LCBsYXN0LCBuYikge1xuICAgIHZhciBkbWcsIHBvd2VyO1xuICAgIHBvd2VyID0gKGxhc3QuZGFtYWdlIC0gMSkgLyAyIC8gbmIgKiBNYXRoLm1pbigxLCBsYXN0LnRhcmdldC5oZWFsdGggLyBsYXN0LnRhcmdldC5tYXhIZWFsdGggKiA1KTtcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiBwb3dlcixcbiAgICAgICAgZGFtYWdlOiBkbWdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW5pdGlhbERhbWFnZSh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZywgcG93ZXI7XG4gICAgcG93ZXIgPSB0aGlzLnBvd2VyIC8gbmI7XG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcik7XG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogcG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG59O1xuXG5EYW1hZ2VQcm9wYWdhdGlvbi5LaW5ldGljID0gY2xhc3MgS2luZXRpYyBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgZXh0ZW5kZWREYW1hZ2UodGFyZ2V0LCBsYXN0LCBuYikge1xuICAgIHZhciBkbWcsIHBvd2VyO1xuICAgIHBvd2VyID0gKGxhc3QucG93ZXIgLSBsYXN0LmRhbWFnZSkgKiBNYXRoLm1pbigxLCBsYXN0LnRhcmdldC5oZWFsdGggLyBsYXN0LnRhcmdldC5tYXhIZWFsdGggKiAyKSAtIDE7XG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcik7XG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogcG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxEYW1hZ2UodGFyZ2V0LCBuYikge1xuICAgIHZhciBkbWc7XG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCB0aGlzLnBvd2VyKTtcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBtb2RpZnlEYW1hZ2UodGFyZ2V0LCBwb3dlcikge1xuICAgIGlmICh0eXBlb2YgdGFyZ2V0Lm1vZGlmeURhbWFnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGFyZ2V0Lm1vZGlmeURhbWFnZShwb3dlciwgdGhpcy50eXBlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHBvd2VyICogMC4yNSk7XG4gICAgfVxuICB9XG5cbiAgbWVyZ2VEYW1hZ2UoZDEsIGQyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhcmdldDogZDEudGFyZ2V0LFxuICAgICAgcG93ZXI6IE1hdGguZmxvb3IoKGQxLnBvd2VyICsgZDIucG93ZXIpIC8gMiksXG4gICAgICBkYW1hZ2U6IE1hdGguZmxvb3IoKGQxLmRhbWFnZSArIGQyLmRhbWFnZSkgLyAyKVxuICAgIH07XG4gIH1cblxufTtcblxuRGFtYWdlUHJvcGFnYXRpb24uRXhwbG9zaXZlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFeHBsb3NpdmUgZXh0ZW5kcyBEYW1hZ2VQcm9wYWdhdGlvbiB7XG4gICAgZ2V0RGFtYWdlZCgpIHtcbiAgICAgIHZhciBhbmdsZSwgaSwgaW5zaWRlLCByZWYsIHNoYXJkLCBzaGFyZFBvd2VyLCBzaGFyZHMsIHRhcmdldDtcbiAgICAgIHRoaXMuX2RhbWFnZWQgPSBbXTtcbiAgICAgIHNoYXJkcyA9IE1hdGgucG93KHRoaXMucmFuZ2UgKyAxLCAyKTtcbiAgICAgIHNoYXJkUG93ZXIgPSB0aGlzLnBvd2VyIC8gc2hhcmRzO1xuICAgICAgaW5zaWRlID0gdGhpcy50aWxlLmhlYWx0aCA8PSB0aGlzLm1vZGlmeURhbWFnZSh0aGlzLnRpbGUsIHNoYXJkUG93ZXIpO1xuICAgICAgaWYgKGluc2lkZSkge1xuICAgICAgICBzaGFyZFBvd2VyICo9IDQ7XG4gICAgICB9XG4gICAgICBmb3IgKHNoYXJkID0gaSA9IDAsIHJlZiA9IHNoYXJkczsgKDAgPD0gcmVmID8gaSA8PSByZWYgOiBpID49IHJlZik7IHNoYXJkID0gMCA8PSByZWYgPyArK2kgOiAtLWkpIHtcbiAgICAgICAgYW5nbGUgPSB0aGlzLnJuZygpICogTWF0aC5QSSAqIDI7XG4gICAgICAgIHRhcmdldCA9IHRoaXMuZ2V0VGlsZUhpdEJ5U2hhcmQoaW5zaWRlLCBhbmdsZSk7XG4gICAgICAgIGlmICh0YXJnZXQgIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2RhbWFnZWQucHVzaCh7XG4gICAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgIHBvd2VyOiBzaGFyZFBvd2VyLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHNoYXJkUG93ZXIpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9kYW1hZ2VkO1xuICAgIH1cblxuICAgIGdldFRpbGVIaXRCeVNoYXJkKGluc2lkZSwgYW5nbGUpIHtcbiAgICAgIHZhciBjdG4sIGRpc3QsIHRhcmdldCwgdmVydGV4O1xuICAgICAgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKCk7XG4gICAgICBkaXN0ID0gdGhpcy5yYW5nZSAqIHRoaXMucm5nKCk7XG4gICAgICB0YXJnZXQgPSB7XG4gICAgICAgIHg6IHRoaXMudGlsZS54ICsgMC41ICsgZGlzdCAqIE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgeTogdGhpcy50aWxlLnkgKyAwLjUgKyBkaXN0ICogTWF0aC5zaW4oYW5nbGUpXG4gICAgICB9O1xuICAgICAgaWYgKGluc2lkZSkge1xuICAgICAgICB2ZXJ0ZXggPSBuZXcgTGluZU9mU2lnaHQoY3RuLCB0aGlzLnRpbGUueCArIDAuNSwgdGhpcy50aWxlLnkgKyAwLjUsIHRhcmdldC54LCB0YXJnZXQueSk7XG4gICAgICAgIHZlcnRleC50cmF2ZXJzYWJsZUNhbGxiYWNrID0gKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gIWluc2lkZSB8fCAoKHRpbGUgIT0gbnVsbCkgJiYgdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUpKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHZlcnRleC5nZXRFbmRQb2ludCgpLnRpbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY3RuLmdldFRpbGUoTWF0aC5mbG9vcih0YXJnZXQueCksIE1hdGguZmxvb3IodGFyZ2V0LnkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBFeHBsb3NpdmUucHJvcGVydGllcyh7XG4gICAgcm5nOiB7XG4gICAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICAgIH0sXG4gICAgdHJhdmVyc2FibGVDYWxsYmFjazoge1xuICAgICAgZGVmYXVsdDogZnVuY3Rpb24odGlsZSkge1xuICAgICAgICByZXR1cm4gISh0eXBlb2YgdGlsZS5nZXRTb2xpZCA9PT0gJ2Z1bmN0aW9uJyAmJiB0aWxlLmdldFNvbGlkKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEV4cGxvc2l2ZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9EYW1hZ2VQcm9wYWdhdGlvbi5qcy5tYXBcbiIsInZhciBEYW1hZ2VhYmxlLCBFbGVtZW50O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gRGFtYWdlYWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRGFtYWdlYWJsZSBleHRlbmRzIEVsZW1lbnQge1xuICAgIGRhbWFnZSh2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLmhlYWx0aCA9IE1hdGgubWF4KDAsIHRoaXMuaGVhbHRoIC0gdmFsKTtcbiAgICB9XG5cbiAgICB3aGVuTm9IZWFsdGgoKSB7fVxuXG4gIH07XG5cbiAgRGFtYWdlYWJsZS5wcm9wZXJ0aWVzKHtcbiAgICBkYW1hZ2VhYmxlOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBtYXhIZWFsdGg6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIGhlYWx0aDoge1xuICAgICAgZGVmYXVsdDogMTAwMCxcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMud2hlbk5vSGVhbHRoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBEYW1hZ2VhYmxlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0RhbWFnZWFibGUuanMubWFwXG4iLCJ2YXIgRG9vciwgVGlsZWQ7XG5cblRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERvb3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIERvb3IgZXh0ZW5kcyBUaWxlZCB7XG4gICAgY29uc3RydWN0b3IoZGlyZWN0aW9uID0gRG9vci5kaXJlY3Rpb25zLmhvcml6b250YWwpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVUaWxlTWVtYmVycyhvbGQpIHtcbiAgICAgIHZhciByZWYsIHJlZjEsIHJlZjIsIHJlZjM7XG4gICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgaWYgKChyZWYgPSBvbGQud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmVmLnJlbW92ZVJlZignb3BlbicsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYxLnJlbW92ZVJlZignb3BlbicsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICAgIGlmICgocmVmMiA9IHRoaXMudGlsZS53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYyLmFkZFByb3BlcnR5UmVmKCdvcGVuJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChyZWYzID0gdGhpcy50aWxlLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCA/IHJlZjMuYWRkUHJvcGVydHlSZWYoJ29wZW4nLCB0aGlzKSA6IHZvaWQgMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBEb29yLnByb3BlcnRpZXMoe1xuICAgIHRpbGU6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24ob2xkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVRpbGVNZW1iZXJzKG9sZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBvcGVuOiB7XG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGlyZWN0aW9uOiB7fVxuICB9KTtcblxuICBEb29yLmRpcmVjdGlvbnMgPSB7XG4gICAgaG9yaXpvbnRhbDogJ2hvcml6b250YWwnLFxuICAgIHZlcnRpY2FsOiAndmVydGljYWwnXG4gIH07XG5cbiAgcmV0dXJuIERvb3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRG9vci5qcy5tYXBcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRWxlbWVudC5qcy5tYXBcbiIsInZhciBGbG9vciwgVGlsZTtcblxuVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb29yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBGbG9vciBleHRlbmRzIFRpbGUge307XG5cbiAgRmxvb3IucHJvcGVydGllcyh7XG4gICAgd2Fsa2FibGU6IHtcbiAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgfSxcbiAgICB0cmFuc3BhcmVudDoge1xuICAgICAgY29tcG9zZWQ6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBGbG9vcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9GbG9vci5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBHYW1lLCBQbGF5ZXIsIFRpbWluZywgVmlldztcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5UaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpO1xuXG5WaWV3ID0gcmVxdWlyZSgnLi9WaWV3Jyk7XG5cblBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR2FtZSBleHRlbmRzIEVsZW1lbnQge1xuICAgIHN0YXJ0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBsYXllcjtcbiAgICB9XG5cbiAgICBhZGQoZWxlbSkge1xuICAgICAgZWxlbS5nYW1lID0gdGhpcztcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIH1cblxuICB9O1xuXG4gIEdhbWUucHJvcGVydGllcyh7XG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFpblZpZXc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnZpZXdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aWV3cy5nZXQoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG5ldyB0aGlzLmRlZmF1bHRWaWV3Q2xhc3MoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHZpZXdzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBjdXJyZW50UGxheWVyOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5wbGF5ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJzLmdldCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGQobmV3IHRoaXMuZGVmYXVsdFBsYXllckNsYXNzKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwbGF5ZXJzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICBHYW1lLnByb3RvdHlwZS5kZWZhdWx0Vmlld0NsYXNzID0gVmlldztcblxuICBHYW1lLnByb3RvdHlwZS5kZWZhdWx0UGxheWVyQ2xhc3MgPSBQbGF5ZXI7XG5cbiAgcmV0dXJuIEdhbWU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvR2FtZS5qcy5tYXBcbiIsInZhciBMaW5lT2ZTaWdodDtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lT2ZTaWdodCA9IGNsYXNzIExpbmVPZlNpZ2h0IHtcbiAgY29uc3RydWN0b3IodGlsZXMsIHgxID0gMCwgeTEgPSAwLCB4MiA9IDAsIHkyID0gMCkge1xuICAgIHRoaXMudGlsZXMgPSB0aWxlcztcbiAgICB0aGlzLngxID0geDE7XG4gICAgdGhpcy55MSA9IHkxO1xuICAgIHRoaXMueDIgPSB4MjtcbiAgICB0aGlzLnkyID0geTI7XG4gIH1cblxuICBzZXRYMSh2YWwpIHtcbiAgICB0aGlzLngxID0gdmFsO1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKTtcbiAgfVxuXG4gIHNldFkxKHZhbCkge1xuICAgIHRoaXMueTEgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpO1xuICB9XG5cbiAgc2V0WDIodmFsKSB7XG4gICAgdGhpcy54MiA9IHZhbDtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKCk7XG4gIH1cblxuICBzZXRZMih2YWwpIHtcbiAgICB0aGlzLnkyID0gdmFsO1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKTtcbiAgfVxuXG4gIGludmFsaWRhZGUoKSB7XG4gICAgdGhpcy5lbmRQb2ludCA9IG51bGw7XG4gICAgdGhpcy5zdWNjZXNzID0gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gIH1cblxuICB0ZXN0VGlsZSh0aWxlLCBlbnRyeVgsIGVudHJ5WSkge1xuICAgIGlmICh0aGlzLnRyYXZlcnNhYmxlQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayh0aWxlLCBlbnRyeVgsIGVudHJ5WSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodGlsZSAhPSBudWxsKSAmJiAodHlwZW9mIHRpbGUuZ2V0VHJhbnNwYXJlbnQgPT09ICdmdW5jdGlvbicgPyB0aWxlLmdldFRyYW5zcGFyZW50KCkgOiB0eXBlb2YgdGlsZS50cmFuc3BhcmVudCAhPT0gdm9pZCAwID8gdGlsZS50cmFuc3BhcmVudCA6IHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHRlc3RUaWxlQXQoeCwgeSwgZW50cnlYLCBlbnRyeVkpIHtcbiAgICByZXR1cm4gdGhpcy50ZXN0VGlsZSh0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih4KSwgTWF0aC5mbG9vcih5KSksIGVudHJ5WCwgZW50cnlZKTtcbiAgfVxuXG4gIHJldmVyc2VUcmFjaW5nKCkge1xuICAgIHZhciB0bXBYLCB0bXBZO1xuICAgIHRtcFggPSB0aGlzLngxO1xuICAgIHRtcFkgPSB0aGlzLnkxO1xuICAgIHRoaXMueDEgPSB0aGlzLngyO1xuICAgIHRoaXMueTEgPSB0aGlzLnkyO1xuICAgIHRoaXMueDIgPSB0bXBYO1xuICAgIHRoaXMueTIgPSB0bXBZO1xuICAgIHJldHVybiB0aGlzLnJldmVyc2VkID0gIXRoaXMucmV2ZXJzZWQ7XG4gIH1cblxuICBjYWxjdWwoKSB7XG4gICAgdmFyIG5leHRYLCBuZXh0WSwgcG9zaXRpdmVYLCBwb3NpdGl2ZVksIHJhdGlvLCB0aWxlWCwgdGlsZVksIHRvdGFsLCB4LCB5O1xuICAgIHJhdGlvID0gKHRoaXMueDIgLSB0aGlzLngxKSAvICh0aGlzLnkyIC0gdGhpcy55MSk7XG4gICAgdG90YWwgPSBNYXRoLmFicyh0aGlzLngyIC0gdGhpcy54MSkgKyBNYXRoLmFicyh0aGlzLnkyIC0gdGhpcy55MSk7XG4gICAgcG9zaXRpdmVYID0gKHRoaXMueDIgLSB0aGlzLngxKSA+PSAwO1xuICAgIHBvc2l0aXZlWSA9ICh0aGlzLnkyIC0gdGhpcy55MSkgPj0gMDtcbiAgICB0aWxlWCA9IHggPSB0aGlzLngxO1xuICAgIHRpbGVZID0geSA9IHRoaXMueTE7XG4gICAgaWYgKHRoaXMucmV2ZXJzZWQpIHtcbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDE7XG4gICAgICB0aWxlWSA9IHBvc2l0aXZlWSA/IHkgOiBNYXRoLmNlaWwoeSkgLSAxO1xuICAgIH1cbiAgICB3aGlsZSAodG90YWwgPiBNYXRoLmFicyh4IC0gdGhpcy54MSkgKyBNYXRoLmFicyh5IC0gdGhpcy55MSkgJiYgdGhpcy50ZXN0VGlsZUF0KHRpbGVYLCB0aWxlWSwgeCwgeSkpIHtcbiAgICAgIG5leHRYID0gcG9zaXRpdmVYID8gTWF0aC5mbG9vcih4KSArIDEgOiBNYXRoLmNlaWwoeCkgLSAxO1xuICAgICAgbmV4dFkgPSBwb3NpdGl2ZVkgPyBNYXRoLmZsb29yKHkpICsgMSA6IE1hdGguY2VpbCh5KSAtIDE7XG4gICAgICBpZiAodGhpcy54MiAtIHRoaXMueDEgPT09IDApIHtcbiAgICAgICAgeSA9IG5leHRZO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnkyIC0gdGhpcy55MSA9PT0gMCkge1xuICAgICAgICB4ID0gbmV4dFg7XG4gICAgICB9IGVsc2UgaWYgKE1hdGguYWJzKChuZXh0WCAtIHgpIC8gKHRoaXMueDIgLSB0aGlzLngxKSkgPCBNYXRoLmFicygobmV4dFkgLSB5KSAvICh0aGlzLnkyIC0gdGhpcy55MSkpKSB7XG4gICAgICAgIHggPSBuZXh0WDtcbiAgICAgICAgeSA9IChuZXh0WCAtIHRoaXMueDEpIC8gcmF0aW8gKyB0aGlzLnkxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeCA9IChuZXh0WSAtIHRoaXMueTEpICogcmF0aW8gKyB0aGlzLngxO1xuICAgICAgICB5ID0gbmV4dFk7XG4gICAgICB9XG4gICAgICB0aWxlWCA9IHBvc2l0aXZlWCA/IHggOiBNYXRoLmNlaWwoeCkgLSAxO1xuICAgICAgdGlsZVkgPSBwb3NpdGl2ZVkgPyB5IDogTWF0aC5jZWlsKHkpIC0gMTtcbiAgICB9XG4gICAgaWYgKHRvdGFsIDw9IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSkge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogdGhpcy54MixcbiAgICAgICAgeTogdGhpcy55MixcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGhpcy54MiksIE1hdGguZmxvb3IodGhpcy55MikpXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuc3VjY2VzcyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRpbGVYKSwgTWF0aC5mbG9vcih0aWxlWSkpXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuc3VjY2VzcyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlU3VjY2VzcygpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0ge1xuICAgICAgeDogdGhpcy54MixcbiAgICAgIHk6IHRoaXMueTIsXG4gICAgICB0aWxlOiB0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih0aGlzLngyKSwgTWF0aC5mbG9vcih0aGlzLnkyKSlcbiAgICB9O1xuICAgIHRoaXMuc3VjY2VzcyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gIH1cblxuICBnZXRTdWNjZXNzKCkge1xuICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdWNjZXNzO1xuICB9XG5cbiAgZ2V0RW5kUG9pbnQoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZFBvaW50O1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvTGluZU9mU2lnaHQuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTWFwO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBNYXAgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG4gIE1hcC5wcm9wZXJ0aWVzKHtcbiAgICBsb2NhdGlvbnM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHtcbiAgICAgICAgY2xvc2VzdDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgIHZhciBtaW4sIG1pbkRpc3Q7XG4gICAgICAgICAgbWluID0gbnVsbDtcbiAgICAgICAgICBtaW5EaXN0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBkaXN0O1xuICAgICAgICAgICAgZGlzdCA9IGxvY2F0aW9uLmRpc3QoeCwgeSk7XG4gICAgICAgICAgICBpZiAoKG1pbiA9PSBudWxsKSB8fCBtaW5EaXN0ID4gZGlzdCkge1xuICAgICAgICAgICAgICBtaW4gPSBsb2NhdGlvbjtcbiAgICAgICAgICAgICAgcmV0dXJuIG1pbkRpc3QgPSBkaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBtaW47XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3Nlc3RzOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgdmFyIGRpc3RzO1xuICAgICAgICAgIGRpc3RzID0gdGhpcy5tYXAoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGRpc3Q6IGxvY2F0aW9uLmRpc3QoeCwgeSksXG4gICAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBkaXN0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3Q7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29weShkaXN0cy5tYXAoZnVuY3Rpb24oZGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpc3QubG9jYXRpb247XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gTWFwO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL01hcC5qcy5tYXBcbiIsInZhciBPYnN0YWNsZSwgVGlsZWQ7XG5cblRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9ic3RhY2xlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPYnN0YWNsZSBleHRlbmRzIFRpbGVkIHtcbiAgICB1cGRhdGVXYWxrYWJsZXMob2xkKSB7XG4gICAgICB2YXIgcmVmLCByZWYxO1xuICAgICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICAgIGlmICgocmVmID0gb2xkLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZi5yZW1vdmVSZWYoJ3dhbGthYmxlJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnRpbGUpIHtcbiAgICAgICAgcmV0dXJuIChyZWYxID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCA/IHJlZjEuc2V0VmFsdWVSZWYoZmFsc2UsICd3YWxrYWJsZScsIHRoaXMpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIE9ic3RhY2xlLnByb3BlcnRpZXMoe1xuICAgIHRpbGU6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24ob2xkLCBvdmVycmlkZWQpIHtcbiAgICAgICAgb3ZlcnJpZGVkKG9sZCk7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVdhbGthYmxlcyhvbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIE9ic3RhY2xlO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL09ic3RhY2xlLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIEV2ZW50RW1pdHRlciwgUGF0aFdhbGssIFRpbWluZztcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5UaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpO1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhXYWxrID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQYXRoV2FsayBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHdhbGtlciwgcGF0aCwgb3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMud2Fsa2VyID0gd2Fsa2VyO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIGlmICghdGhpcy5wYXRoLnNvbHV0aW9uKSB7XG4gICAgICAgIHRoaXMucGF0aC5jYWxjdWwoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBhdGguc29sdXRpb24pIHtcbiAgICAgICAgdGhpcy5wYXRoVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZpbmlzaCgpO1xuICAgICAgICB9LCB0aGlzLnRvdGFsVGltZSk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGhUaW1lb3V0LnVwZGF0ZXIuYWRkQ2FsbGJhY2sodGhpcy5jYWxsYmFjaygndXBkYXRlJykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0b3AoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoVGltZW91dC5wYXVzZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBwb3M7XG4gICAgICBwb3MgPSB0aGlzLnBhdGguZ2V0UG9zQXRQcmModGhpcy5wYXRoVGltZW91dC5nZXRQcmMoKSk7XG4gICAgICB0aGlzLndhbGtlci50aWxlID0gcG9zLnRpbGU7XG4gICAgICB0aGlzLndhbGtlci5vZmZzZXRYID0gcG9zLm9mZnNldFg7XG4gICAgICByZXR1cm4gdGhpcy53YWxrZXIub2Zmc2V0WSA9IHBvcy5vZmZzZXRZO1xuICAgIH1cblxuICAgIGZpbmlzaCgpIHtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2ZpbmlzaGVkJyk7XG4gICAgICByZXR1cm4gdGhpcy5lbmQoKTtcbiAgICB9XG5cbiAgICBpbnRlcnJ1cHQoKSB7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgdGhpcy50cmlnZ2VyKCdpbnRlcnJ1cHRlZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5kKCk7XG4gICAgfVxuXG4gICAgZW5kKCkge1xuICAgICAgdGhpcy50cmlnZ2VyKCdlbmQnKTtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgaWYgKHRoaXMud2Fsa2VyLndhbGsgPT09IHRoaXMpIHtcbiAgICAgICAgdGhpcy53YWxrZXIud2FsayA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhdGhUaW1lb3V0LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuZGVzdHJveVByb3BlcnRpZXMoKTtcbiAgICAgIHJldHVybiB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIH1cblxuICB9O1xuXG4gIFBhdGhXYWxrLmluY2x1ZGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5cbiAgUGF0aFdhbGsucHJvcGVydGllcyh7XG4gICAgc3BlZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IDVcbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHBhdGhMZW5ndGg6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGguc29sdXRpb24uZ2V0VG90YWxMZW5ndGgoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvdGFsVGltZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aExlbmd0aCAvIHRoaXMuc3BlZWQgKiAxMDAwO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFBhdGhXYWxrO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1BhdGhXYWxrLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIExpbmVPZlNpZ2h0LCBQZXJzb25hbFdlYXBvbiwgVGltaW5nO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkxpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpO1xuXG5UaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcnNvbmFsV2VhcG9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQZXJzb25hbFdlYXBvbiBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY2FuQmVVc2VkKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlZDtcbiAgICB9XG5cbiAgICBjYW5Vc2VPbih0YXJnZXQpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhblVzZUZyb20odGhpcy51c2VyLnRpbGUsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgY2FuVXNlRnJvbSh0aWxlLCB0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLnJhbmdlID09PSAxKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluTWVsZWVSYW5nZSh0aWxlLCB0YXJnZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5SYW5nZSh0aWxlLCB0YXJnZXQpICYmIHRoaXMuaGFzTGluZU9mU2lnaHQodGlsZSwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpblJhbmdlKHRpbGUsIHRhcmdldCkge1xuICAgICAgdmFyIHJlZiwgdGFyZ2V0VGlsZTtcbiAgICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXQ7XG4gICAgICByZXR1cm4gKChyZWYgPSB0aWxlLmRpc3QodGFyZ2V0VGlsZSkpICE9IG51bGwgPyByZWYubGVuZ3RoIDogdm9pZCAwKSA8PSB0aGlzLnJhbmdlO1xuICAgIH1cblxuICAgIGluTWVsZWVSYW5nZSh0aWxlLCB0YXJnZXQpIHtcbiAgICAgIHZhciB0YXJnZXRUaWxlO1xuICAgICAgdGFyZ2V0VGlsZSA9IHRhcmdldC50aWxlIHx8IHRhcmdldDtcbiAgICAgIHJldHVybiBNYXRoLmFicyh0YXJnZXRUaWxlLnggLSB0aWxlLngpICsgTWF0aC5hYnModGFyZ2V0VGlsZS55IC0gdGlsZS55KSA9PT0gMTtcbiAgICB9XG5cbiAgICBoYXNMaW5lT2ZTaWdodCh0aWxlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBsb3MsIHRhcmdldFRpbGU7XG4gICAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0O1xuICAgICAgbG9zID0gbmV3IExpbmVPZlNpZ2h0KHRhcmdldFRpbGUuY29udGFpbmVyLCB0aWxlLnggKyAwLjUsIHRpbGUueSArIDAuNSwgdGFyZ2V0VGlsZS54ICsgMC41LCB0YXJnZXRUaWxlLnkgKyAwLjUpO1xuICAgICAgbG9zLnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgIHJldHVybiB0aWxlLndhbGthYmxlO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBsb3MuZ2V0U3VjY2VzcygpO1xuICAgIH1cblxuICAgIHVzZU9uKHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuY2FuQmVVc2VkKCkpIHtcbiAgICAgICAgdGFyZ2V0LmRhbWFnZSh0aGlzLnBvd2VyKTtcbiAgICAgICAgdGhpcy5jaGFyZ2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVjaGFyZ2UoKSB7XG4gICAgICB0aGlzLmNoYXJnaW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLmNoYXJnZVRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jaGFyZ2luZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZWQoKTtcbiAgICAgIH0sIHRoaXMucmVjaGFyZ2VUaW1lKTtcbiAgICB9XG5cbiAgICByZWNoYXJnZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgaWYgKHRoaXMuY2hhcmdlVGltZW91dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFyZ2VUaW1lb3V0LmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBQZXJzb25hbFdlYXBvbi5wcm9wZXJ0aWVzKHtcbiAgICByZWNoYXJnZVRpbWU6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIGNoYXJnZWQ6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGNoYXJnaW5nOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBwb3dlcjoge1xuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIGRwczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgncG93ZXInKSAvIGludmFsaWRhdG9yLnByb3AoJ3JlY2hhcmdlVGltZScpICogMTAwMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJhbmdlOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgdXNlcjoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFBlcnNvbmFsV2VhcG9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1BlcnNvbmFsV2VhcG9uLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIEV2ZW50RW1pdHRlciwgUGxheWVyO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQbGF5ZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHNldERlZmF1bHRzKCkge1xuICAgICAgdmFyIGZpcnN0O1xuICAgICAgZmlyc3QgPSB0aGlzLmdhbWUucGxheWVycy5sZW5ndGggPT09IDA7XG4gICAgICB0aGlzLmdhbWUucGxheWVycy5hZGQodGhpcyk7XG4gICAgICBpZiAoZmlyc3QgJiYgIXRoaXMuY29udHJvbGxlciAmJiB0aGlzLmdhbWUuZGVmYXVsdFBsYXllckNvbnRyb2xsZXJDbGFzcykge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250cm9sbGVyID0gbmV3IHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FuVGFyZ2V0QWN0aW9uT24oZWxlbSkge1xuICAgICAgdmFyIGFjdGlvbiwgcmVmO1xuICAgICAgYWN0aW9uID0gdGhpcy5zZWxlY3RlZEFjdGlvbiB8fCAoKHJlZiA9IHRoaXMuc2VsZWN0ZWQpICE9IG51bGwgPyByZWYuZGVmYXVsdEFjdGlvbiA6IHZvaWQgMCk7XG4gICAgICByZXR1cm4gKGFjdGlvbiAhPSBudWxsKSAmJiB0eXBlb2YgYWN0aW9uLmNhblRhcmdldCA9PT0gXCJmdW5jdGlvblwiICYmIGFjdGlvbi5jYW5UYXJnZXQoZWxlbSk7XG4gICAgfVxuXG4gICAgY2FuU2VsZWN0KGVsZW0pIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZWxlbS5pc1NlbGVjdGFibGVCeSA9PT0gXCJmdW5jdGlvblwiICYmIGVsZW0uaXNTZWxlY3RhYmxlQnkodGhpcyk7XG4gICAgfVxuXG4gICAgY2FuRm9jdXNPbihlbGVtKSB7XG4gICAgICBpZiAodHlwZW9mIGVsZW0uSXNGb2N1c2FibGVCeSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtLklzRm9jdXNhYmxlQnkodGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtLklzU2VsZWN0YWJsZUJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uSXNTZWxlY3RhYmxlQnkodGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2V0QWN0aW9uVGFyZ2V0KGVsZW0pIHtcbiAgICAgIHZhciBhY3Rpb24sIHJlZjtcbiAgICAgIGFjdGlvbiA9IHRoaXMuc2VsZWN0ZWRBY3Rpb24gfHwgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLmRlZmF1bHRBY3Rpb24gOiB2b2lkIDApO1xuICAgICAgYWN0aW9uID0gYWN0aW9uLndpdGhUYXJnZXQoZWxlbSk7XG4gICAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgICBhY3Rpb24uc3RhcnQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRBY3Rpb24gPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRBY3Rpb24gPSBhY3Rpb247XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgUGxheWVyLmluY2x1ZGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5cbiAgUGxheWVyLnByb3BlcnRpZXMoe1xuICAgIG5hbWU6IHtcbiAgICAgIGRlZmF1bHQ6ICdQbGF5ZXInXG4gICAgfSxcbiAgICBmb2N1c2VkOiB7fSxcbiAgICBzZWxlY3RlZDoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgaWYgKG9sZCAhPSBudWxsID8gb2xkLmdldFByb3BlcnR5KCdzZWxlY3RlZCcpIDogdm9pZCAwKSB7XG4gICAgICAgICAgb2xkLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLmdldFByb3BlcnR5KCdzZWxlY3RlZCcpIDogdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWQuc2VsZWN0ZWQgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzZWxlY3RlZEFjdGlvbjoge30sXG4gICAgY29udHJvbGxlcjoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXIucGxheWVyID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2FtZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNldERlZmF1bHRzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBQbGF5ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUGxheWVyLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIFByb2plY3RpbGUsIFRpbWluZztcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5UaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RpbGUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFByb2plY3RpbGUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKG9wdGlvbnMpO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHt9XG5cbiAgICBsYXVuY2goKSB7XG4gICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmRlbGl2ZXJQYXlsb2FkKCk7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgICAgfSwgdGhpcy5wYXRoTGVuZ3RoIC8gdGhpcy5zcGVlZCAqIDEwMDApO1xuICAgIH1cblxuICAgIGRlbGl2ZXJQYXlsb2FkKCkge1xuICAgICAgdmFyIHBheWxvYWQ7XG4gICAgICBwYXlsb2FkID0gbmV3IHRoaXMucHJvcGFnYXRpb25UeXBlKHtcbiAgICAgICAgdGlsZTogdGhpcy50YXJnZXQudGlsZSB8fCB0aGlzLnRhcmdldCxcbiAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgIHJhbmdlOiB0aGlzLmJsYXN0UmFuZ2VcbiAgICAgIH0pO1xuICAgICAgcGF5bG9hZC5hcHBseSgpO1xuICAgICAgdGhpcy5wYXlsb2FkRGVsaXZlcmVkKCk7XG4gICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9XG5cbiAgICBwYXlsb2FkRGVsaXZlcmVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95UHJvcGVydGllcygpO1xuICAgIH1cblxuICB9O1xuXG4gIFByb2plY3RpbGUucHJvcGVydGllcyh7XG4gICAgb3JpZ2luOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICB0YXJnZXQ6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHBvd2VyOiB7XG4gICAgICBkZWZhdWx0OiAxMFxuICAgIH0sXG4gICAgYmxhc3RSYW5nZToge1xuICAgICAgZGVmYXVsdDogMVxuICAgIH0sXG4gICAgcHJvcGFnYXRpb25UeXBlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBzcGVlZDoge1xuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIHBhdGhMZW5ndGg6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXN0O1xuICAgICAgICBpZiAoKHRoaXMub3JpZ2luVGlsZSAhPSBudWxsKSAmJiAodGhpcy50YXJnZXRUaWxlICE9IG51bGwpKSB7XG4gICAgICAgICAgZGlzdCA9IHRoaXMub3JpZ2luVGlsZS5kaXN0KHRoaXMudGFyZ2V0VGlsZSk7XG4gICAgICAgICAgaWYgKGRpc3QpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXN0Lmxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9yaWdpblRpbGU6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIG9yaWdpbjtcbiAgICAgICAgb3JpZ2luID0gaW52YWxpZGF0b3IucHJvcCgnb3JpZ2luJyk7XG4gICAgICAgIGlmIChvcmlnaW4gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW4udGlsZSB8fCBvcmlnaW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRhcmdldFRpbGU6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHRhcmdldDtcbiAgICAgICAgdGFyZ2V0ID0gaW52YWxpZGF0b3IucHJvcCgndGFyZ2V0Jyk7XG4gICAgICAgIGlmICh0YXJnZXQgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB0YXJnZXQudGlsZSB8fCB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRhaW5lcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBvcmlnaW5UaWxlLCB0YXJnZXRUaWxlO1xuICAgICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKCdvcmlnaW5UaWxlJyk7XG4gICAgICAgIHRhcmdldFRpbGUgPSBpbnZhbGlkYXRlLnByb3AoJ3RhcmdldFRpbGUnKTtcbiAgICAgICAgaWYgKG9yaWdpblRpbGUuY29udGFpbmVyID09PSB0YXJnZXRUaWxlLmNvbnRhaW5lcikge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5UaWxlLmNvbnRhaW5lcjtcbiAgICAgICAgfSBlbHNlIGlmIChpbnZhbGlkYXRlLnByb3AoJ3ByY1BhdGgnKSA+IDAuNSkge1xuICAgICAgICAgIHJldHVybiB0YXJnZXRUaWxlLmNvbnRhaW5lcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luVGlsZS5jb250YWluZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHg6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0ZSkge1xuICAgICAgICB2YXIgc3RhcnRQb3M7XG4gICAgICAgIHN0YXJ0UG9zID0gaW52YWxpZGF0ZS5wcm9wKCdzdGFydFBvcycpO1xuICAgICAgICByZXR1cm4gKGludmFsaWRhdGUucHJvcCgndGFyZ2V0UG9zJykueCAtIHN0YXJ0UG9zLngpICogaW52YWxpZGF0ZS5wcm9wKCdwcmNQYXRoJykgKyBzdGFydFBvcy54O1xuICAgICAgfVxuICAgIH0sXG4gICAgeToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBzdGFydFBvcztcbiAgICAgICAgc3RhcnRQb3MgPSBpbnZhbGlkYXRlLnByb3AoJ3N0YXJ0UG9zJyk7XG4gICAgICAgIHJldHVybiAoaW52YWxpZGF0ZS5wcm9wKCd0YXJnZXRQb3MnKS55IC0gc3RhcnRQb3MueSkgKiBpbnZhbGlkYXRlLnByb3AoJ3ByY1BhdGgnKSArIHN0YXJ0UG9zLnk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydFBvczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRlKSB7XG4gICAgICAgIHZhciBjb250YWluZXIsIGRpc3QsIG9mZnNldCwgb3JpZ2luVGlsZTtcbiAgICAgICAgb3JpZ2luVGlsZSA9IGludmFsaWRhdGUucHJvcCgnb3JpZ2luVGlsZScpO1xuICAgICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AoJ2NvbnRhaW5lcicpO1xuICAgICAgICBvZmZzZXQgPSB0aGlzLnN0YXJ0T2Zmc2V0O1xuICAgICAgICBpZiAob3JpZ2luVGlsZS5jb250YWluZXIgIT09IGNvbnRhaW5lcikge1xuICAgICAgICAgIGRpc3QgPSBjb250YWluZXIuZGlzdChvcmlnaW5UaWxlLmNvbnRhaW5lcik7XG4gICAgICAgICAgb2Zmc2V0LnggKz0gZGlzdC54O1xuICAgICAgICAgIG9mZnNldC55ICs9IGRpc3QueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IG9yaWdpblRpbGUueCArIG9mZnNldC54LFxuICAgICAgICAgIHk6IG9yaWdpblRpbGUueSArIG9mZnNldC55XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0YXJnZXRQb3M6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0ZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyLCBkaXN0LCBvZmZzZXQsIHRhcmdldFRpbGU7XG4gICAgICAgIHRhcmdldFRpbGUgPSBpbnZhbGlkYXRlLnByb3AoJ3RhcmdldFRpbGUnKTtcbiAgICAgICAgY29udGFpbmVyID0gaW52YWxpZGF0ZS5wcm9wKCdjb250YWluZXInKTtcbiAgICAgICAgb2Zmc2V0ID0gdGhpcy50YXJnZXRPZmZzZXQ7XG4gICAgICAgIGlmICh0YXJnZXRUaWxlLmNvbnRhaW5lciAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgICAgZGlzdCA9IGNvbnRhaW5lci5kaXN0KHRhcmdldFRpbGUuY29udGFpbmVyKTtcbiAgICAgICAgICBvZmZzZXQueCArPSBkaXN0Lng7XG4gICAgICAgICAgb2Zmc2V0LnkgKz0gZGlzdC55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogdGFyZ2V0VGlsZS54ICsgb2Zmc2V0LngsXG4gICAgICAgICAgeTogdGFyZ2V0VGlsZS55ICsgb2Zmc2V0LnlcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0T2Zmc2V0OiB7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHg6IDAuNSxcbiAgICAgICAgeTogMC41XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0YXJnZXRPZmZzZXQ6IHtcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgeDogMC41LFxuICAgICAgICB5OiAwLjVcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHByY1BhdGg6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHJldHVybiAoKHJlZiA9IHRoaXMucGF0aFRpbWVvdXQpICE9IG51bGwgPyByZWYuZ2V0UHJjKCkgOiB2b2lkIDApIHx8IDA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0aW1pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltaW5nKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3Zpbmc6IHtcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUHJvamVjdGlsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Qcm9qZWN0aWxlLmpzLm1hcFxuIiwidmFyIERpcmVjdGlvbiwgRG9vciwgRWxlbWVudCwgUm9vbUdlbmVyYXRvciwgVGlsZSwgVGlsZUNvbnRhaW5lcixcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyO1xuXG5UaWxlID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGU7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbkRvb3IgPSByZXF1aXJlKCcuL0Rvb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb29tR2VuZXJhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBSb29tR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBpbml0VGlsZXMoKSB7XG4gICAgICB0aGlzLmZpbmFsVGlsZXMgPSBudWxsO1xuICAgICAgdGhpcy5yb29tcyA9IFtdO1xuICAgICAgcmV0dXJuIHRoaXMuZnJlZSA9IHRoaXMudGlsZUNvbnRhaW5lci5hbGxUaWxlcygpLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICB2YXIgZGlyZWN0aW9uLCBrLCBsZW4sIG5leHQsIHJlZjtcbiAgICAgICAgcmVmID0gRGlyZWN0aW9uLmFsbDtcbiAgICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgICAgZGlyZWN0aW9uID0gcmVmW2tdO1xuICAgICAgICAgIG5leHQgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh0aWxlLnggKyBkaXJlY3Rpb24ueCwgdGlsZS55ICsgZGlyZWN0aW9uLnkpO1xuICAgICAgICAgIGlmIChuZXh0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICB2YXIgaTtcbiAgICAgIHRoaXMuaW5pdFRpbGVzKCk7XG4gICAgICBpID0gMDtcbiAgICAgIHdoaWxlICh0aGlzLnN0ZXAoKSB8fCB0aGlzLm5ld1Jvb20oKSkge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgICB0aGlzLmNyZWF0ZURvb3JzKCk7XG4gICAgICB0aGlzLnJvb21zO1xuICAgICAgcmV0dXJuIHRoaXMubWFrZUZpbmFsVGlsZXMoKTtcbiAgICB9XG5cbiAgICBtYWtlRmluYWxUaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmFsVGlsZXMgPSB0aGlzLnRpbGVDb250YWluZXIuYWxsVGlsZXMoKS5tYXAoKHRpbGUpID0+IHtcbiAgICAgICAgdmFyIG9wdDtcbiAgICAgICAgaWYgKHRpbGUuZmFjdG9yeSAhPSBudWxsKSB7XG4gICAgICAgICAgb3B0ID0ge1xuICAgICAgICAgICAgeDogdGlsZS54LFxuICAgICAgICAgICAgeTogdGlsZS55XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodGlsZS5mYWN0b3J5T3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKG9wdCwgdGlsZS5mYWN0b3J5T3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aWxlLmZhY3Rvcnkob3B0KTtcbiAgICAgICAgfVxuICAgICAgfSkuZmlsdGVyKCh0aWxlKSA9PiB7XG4gICAgICAgIHJldHVybiB0aWxlICE9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRUaWxlcygpIHtcbiAgICAgIGlmICh0aGlzLmZpbmFsVGlsZXMgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNhbGN1bCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluYWxUaWxlcztcbiAgICB9XG5cbiAgICBuZXdSb29tKCkge1xuICAgICAgaWYgKHRoaXMuZnJlZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy52b2x1bWUgPSBNYXRoLmZsb29yKHRoaXMucm5nKCkgKiAodGhpcy5tYXhWb2x1bWUgLSB0aGlzLm1pblZvbHVtZSkpICsgdGhpcy5taW5Wb2x1bWU7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb20gPSBuZXcgUm9vbUdlbmVyYXRvci5Sb29tKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmFuZG9tRGlyZWN0aW9ucygpIHtcbiAgICAgIHZhciBpLCBqLCBvLCB4O1xuICAgICAgbyA9IERpcmVjdGlvbi5hZGphY2VudHMuc2xpY2UoKTtcbiAgICAgIGogPSB2b2lkIDA7XG4gICAgICB4ID0gdm9pZCAwO1xuICAgICAgaSA9IG8ubGVuZ3RoO1xuICAgICAgd2hpbGUgKGkpIHtcbiAgICAgICAgaiA9IE1hdGguZmxvb3IodGhpcy5ybmcoKSAqIGkpO1xuICAgICAgICB4ID0gb1stLWldO1xuICAgICAgICBvW2ldID0gb1tqXTtcbiAgICAgICAgb1tqXSA9IHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gbztcbiAgICB9XG5cbiAgICBzdGVwKCkge1xuICAgICAgdmFyIHN1Y2Nlc3MsIHRyaWVzO1xuICAgICAgaWYgKHRoaXMucm9vbSkge1xuICAgICAgICBpZiAodGhpcy5mcmVlLmxlbmd0aCAmJiB0aGlzLnJvb20udGlsZXMubGVuZ3RoIDwgdGhpcy52b2x1bWUgLSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMucm9vbS50aWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRyaWVzID0gdGhpcy5yYW5kb21EaXJlY3Rpb25zKCk7XG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICB3aGlsZSAodHJpZXMubGVuZ3RoICYmICFzdWNjZXNzKSB7XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmV4cGFuZCh0aGlzLnJvb20sIHRyaWVzLnBvcCgpLCB0aGlzLnZvbHVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgdGhpcy5yb29tRG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKHRoaXMucmFuZG9tRnJlZVRpbGUoKSwgdGhpcy5yb29tKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJvb21Eb25lKCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcm9vbURvbmUoKSB7XG4gICAgICB0aGlzLnJvb21zLnB1c2godGhpcy5yb29tKTtcbiAgICAgIHRoaXMuYWxsb2NhdGVXYWxscyh0aGlzLnJvb20pO1xuICAgICAgcmV0dXJuIHRoaXMucm9vbSA9IG51bGw7XG4gICAgfVxuXG4gICAgZXhwYW5kKHJvb20sIGRpcmVjdGlvbiwgbWF4ID0gMCkge1xuICAgICAgdmFyIGssIGxlbiwgbmV4dCwgcmVmLCBzZWNvbmQsIHN1Y2Nlc3MsIHRpbGU7XG4gICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICByZWYgPSByb29tLnRpbGVzO1xuICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgIHRpbGUgPSByZWZba107XG4gICAgICAgIGlmIChtYXggPT09IDAgfHwgcm9vbS50aWxlcy5sZW5ndGggPCBtYXgpIHtcbiAgICAgICAgICBpZiAobmV4dCA9IHRoaXMudGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZShuZXh0LCByb29tKTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoKHNlY29uZCA9IHRoaXMudGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24sIDIpKSAmJiAhdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgMykpIHtcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVUaWxlKHNlY29uZCwgcm9vbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VjY2VzcztcbiAgICB9XG5cbiAgICBhbGxvY2F0ZVdhbGxzKHJvb20pIHtcbiAgICAgIHZhciBkaXJlY3Rpb24sIGssIGxlbiwgbmV4dCwgbmV4dFJvb20sIG90aGVyU2lkZSwgcmVmLCByZXN1bHRzLCB0aWxlO1xuICAgICAgcmVmID0gcm9vbS50aWxlcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICB0aWxlID0gcmVmW2tdO1xuICAgICAgICByZXN1bHRzLnB1c2goKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICByZWYxID0gRGlyZWN0aW9uLmFsbDtcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gcmVmMVtsXTtcbiAgICAgICAgICAgIG5leHQgPSB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZSh0aWxlLnggKyBkaXJlY3Rpb24ueCwgdGlsZS55ICsgZGlyZWN0aW9uLnkpO1xuICAgICAgICAgICAgaWYgKChuZXh0ICE9IG51bGwpICYmIG5leHQucm9vbSAhPT0gcm9vbSkge1xuICAgICAgICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKERpcmVjdGlvbi5jb3JuZXJzLCBkaXJlY3Rpb24pIDwgMCkge1xuICAgICAgICAgICAgICAgIG90aGVyU2lkZSA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54ICogMiwgdGlsZS55ICsgZGlyZWN0aW9uLnkgKiAyKTtcbiAgICAgICAgICAgICAgICBuZXh0Um9vbSA9IChvdGhlclNpZGUgIT0gbnVsbCA/IG90aGVyU2lkZS5yb29tIDogdm9pZCAwKSAhPSBudWxsID8gb3RoZXJTaWRlLnJvb20gOiBudWxsO1xuICAgICAgICAgICAgICAgIHJvb20uYWRkV2FsbChuZXh0LCBuZXh0Um9vbSk7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRSb29tICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIG5leHRSb29tLmFkZFdhbGwobmV4dCwgcm9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG5leHQuZmFjdG9yeSA9IHRoaXMud2FsbEZhY3Rvcnk7XG4gICAgICAgICAgICAgIHJlc3VsdHMxLnB1c2godGhpcy5hbGxvY2F0ZVRpbGUobmV4dCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0czEucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pLmNhbGwodGhpcykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgY3JlYXRlRG9vcnMoKSB7XG4gICAgICB2YXIgZG9vciwgaywgbGVuLCByZWYsIHJlc3VsdHMsIHJvb20sIHdhbGxzO1xuICAgICAgcmVmID0gdGhpcy5yb29tcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICByb29tID0gcmVmW2tdO1xuICAgICAgICByZXN1bHRzLnB1c2goKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICByZWYxID0gcm9vbS53YWxsc0J5Um9vbXMoKTtcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgICAgd2FsbHMgPSByZWYxW2xdO1xuICAgICAgICAgICAgaWYgKCh3YWxscy5yb29tICE9IG51bGwpICYmIHJvb20uZG9vcnNGb3JSb29tKHdhbGxzLnJvb20pIDwgMSkge1xuICAgICAgICAgICAgICBkb29yID0gd2FsbHMudGlsZXNbTWF0aC5mbG9vcih0aGlzLnJuZygpICogd2FsbHMudGlsZXMubGVuZ3RoKV07XG4gICAgICAgICAgICAgIGRvb3IuZmFjdG9yeSA9IHRoaXMuZG9vckZhY3Rvcnk7XG4gICAgICAgICAgICAgIGRvb3IuZmFjdG9yeU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLnRpbGVDb250YWluZXIuZ2V0VGlsZShkb29yLnggKyAxLCBkb29yLnkpLmZhY3RvcnkgPT09IHRoaXMuZmxvb3JGYWN0b3J5ID8gRG9vci5kaXJlY3Rpb25zLnZlcnRpY2FsIDogRG9vci5kaXJlY3Rpb25zLmhvcml6b250YWxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcm9vbS5hZGREb29yKGRvb3IsIHdhbGxzLnJvb20pO1xuICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHdhbGxzLnJvb20uYWRkRG9vcihkb29yLCByb29tKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzMTtcbiAgICAgICAgfSkuY2FsbCh0aGlzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBhbGxvY2F0ZVRpbGUodGlsZSwgcm9vbSA9IG51bGwpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGlmIChyb29tICE9IG51bGwpIHtcbiAgICAgICAgcm9vbS5hZGRUaWxlKHRpbGUpO1xuICAgICAgICB0aWxlLmZhY3RvcnkgPSB0aGlzLmZsb29yRmFjdG9yeTtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gdGhpcy5mcmVlLmluZGV4T2YodGlsZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5mcmVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGlsZU9mZnNldElzRnJlZSh0aWxlLCBkaXJlY3Rpb24sIG11bHRpcGx5ID0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZUlzRnJlZSh0aWxlLnggKyBkaXJlY3Rpb24ueCAqIG11bHRpcGx5LCB0aWxlLnkgKyBkaXJlY3Rpb24ueSAqIG11bHRpcGx5KTtcbiAgICB9XG5cbiAgICB0aWxlSXNGcmVlKHgsIHkpIHtcbiAgICAgIHZhciB0aWxlO1xuICAgICAgdGlsZSA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgaWYgKCh0aWxlICE9IG51bGwpICYmIGluZGV4T2YuY2FsbCh0aGlzLmZyZWUsIHRpbGUpID49IDApIHtcbiAgICAgICAgcmV0dXJuIHRpbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmFuZG9tRnJlZVRpbGUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5mcmVlW01hdGguZmxvb3IodGhpcy5ybmcoKSAqIHRoaXMuZnJlZS5sZW5ndGgpXTtcbiAgICB9XG5cbiAgfTtcblxuICBSb29tR2VuZXJhdG9yLnByb3BlcnRpZXMoe1xuICAgIHJuZzoge1xuICAgICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgICB9LFxuICAgIG1heFZvbHVtZToge1xuICAgICAgZGVmYXVsdDogMjVcbiAgICB9LFxuICAgIG1pblZvbHVtZToge1xuICAgICAgZGVmYXVsdDogNTBcbiAgICB9LFxuICAgIHdpZHRoOiB7XG4gICAgICBkZWZhdWx0OiAzMFxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBkZWZhdWx0OiAxNVxuICAgIH0sXG4gICAgdGlsZUNvbnRhaW5lcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGssIGwsIHJlZiwgcmVmMSwgdGlsZXMsIHgsIHk7XG4gICAgICAgIHRpbGVzID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICAgICAgZm9yICh4ID0gayA9IDAsIHJlZiA9IHRoaXMud2lkdGg7ICgwIDw9IHJlZiA/IGsgPD0gcmVmIDogayA+PSByZWYpOyB4ID0gMCA8PSByZWYgPyArK2sgOiAtLWspIHtcbiAgICAgICAgICBmb3IgKHkgPSBsID0gMCwgcmVmMSA9IHRoaXMuaGVpZ2h0OyAoMCA8PSByZWYxID8gbCA8PSByZWYxIDogbCA+PSByZWYxKTsgeSA9IDAgPD0gcmVmMSA/ICsrbCA6IC0tbCkge1xuICAgICAgICAgICAgdGlsZXMuYWRkVGlsZShuZXcgVGlsZSh4LCB5KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICAgIH1cbiAgICB9LFxuICAgIGZsb29yRmFjdG9yeToge1xuICAgICAgZGVmYXVsdDogZnVuY3Rpb24ob3B0KSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShvcHQueCwgb3B0LnkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgd2FsbEZhY3Rvcnk6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIGRvb3JGYWN0b3J5OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbG9vckZhY3Rvcnk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gUm9vbUdlbmVyYXRvcjtcblxufSkuY2FsbCh0aGlzKTtcblxuUm9vbUdlbmVyYXRvci5Sb29tID0gY2xhc3MgUm9vbSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICB0aGlzLndhbGxzID0gW107XG4gICAgdGhpcy5kb29ycyA9IFtdO1xuICB9XG5cbiAgYWRkVGlsZSh0aWxlKSB7XG4gICAgdGhpcy50aWxlcy5wdXNoKHRpbGUpO1xuICAgIHJldHVybiB0aWxlLnJvb20gPSB0aGlzO1xuICB9XG5cbiAgY29udGFpbnNXYWxsKHRpbGUpIHtcbiAgICB2YXIgaywgbGVuLCByZWYsIHdhbGw7XG4gICAgcmVmID0gdGhpcy53YWxscztcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHdhbGwgPSByZWZba107XG4gICAgICBpZiAod2FsbC50aWxlID09PSB0aWxlKSB7XG4gICAgICAgIHJldHVybiB3YWxsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBhZGRXYWxsKHRpbGUsIG5leHRSb29tKSB7XG4gICAgdmFyIGV4aXN0aW5nO1xuICAgIGV4aXN0aW5nID0gdGhpcy5jb250YWluc1dhbGwodGlsZSk7XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmcubmV4dFJvb20gPSBuZXh0Um9vbTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMud2FsbHMucHVzaCh7XG4gICAgICAgIHRpbGU6IHRpbGUsXG4gICAgICAgIG5leHRSb29tOiBuZXh0Um9vbVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgd2FsbHNCeVJvb21zKCkge1xuICAgIHZhciBrLCBsZW4sIHBvcywgcmVmLCByZXMsIHJvb21zLCB3YWxsO1xuICAgIHJvb21zID0gW107XG4gICAgcmVzID0gW107XG4gICAgcmVmID0gdGhpcy53YWxscztcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHdhbGwgPSByZWZba107XG4gICAgICBwb3MgPSByb29tcy5pbmRleE9mKHdhbGwubmV4dFJvb20pO1xuICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgcG9zID0gcm9vbXMubGVuZ3RoO1xuICAgICAgICByb29tcy5wdXNoKHdhbGwubmV4dFJvb20pO1xuICAgICAgICByZXMucHVzaCh7XG4gICAgICAgICAgcm9vbTogd2FsbC5uZXh0Um9vbSxcbiAgICAgICAgICB0aWxlczogW11cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXNbcG9zXS50aWxlcy5wdXNoKHdhbGwudGlsZSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBhZGREb29yKHRpbGUsIG5leHRSb29tKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9vcnMucHVzaCh7XG4gICAgICB0aWxlOiB0aWxlLFxuICAgICAgbmV4dFJvb206IG5leHRSb29tXG4gICAgfSk7XG4gIH1cblxuICBkb29yc0ZvclJvb20ocm9vbSkge1xuICAgIHZhciBkb29yLCBrLCBsZW4sIHJlZiwgcmVzO1xuICAgIHJlcyA9IFtdO1xuICAgIHJlZiA9IHRoaXMuZG9vcnM7XG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBkb29yID0gcmVmW2tdO1xuICAgICAgaWYgKGRvb3IubmV4dFJvb20gPT09IHJvb20pIHtcbiAgICAgICAgcmVzLnB1c2goZG9vci50aWxlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Jvb21HZW5lcmF0b3IuanMubWFwXG4iLCJ2YXIgRGFtYWdlYWJsZSwgUHJvamVjdGlsZSwgU2hpcFdlYXBvbiwgVGlsZWQsIFRpbWluZztcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cblRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJyk7XG5cbkRhbWFnZWFibGUgPSByZXF1aXJlKCcuL0RhbWFnZWFibGUnKTtcblxuUHJvamVjdGlsZSA9IHJlcXVpcmUoJy4vUHJvamVjdGlsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXBXZWFwb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFNoaXBXZWFwb24gZXh0ZW5kcyBUaWxlZCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgdmFyIHByb2plY3RpbGU7XG4gICAgICBpZiAodGhpcy5jYW5GaXJlKSB7XG4gICAgICAgIHByb2plY3RpbGUgPSBuZXcgUHJvamVjdGlsZSh7XG4gICAgICAgICAgb3JpZ2luOiB0aGlzLFxuICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgICAgYmxhc3RSYW5nZTogdGhpcy5ibGFzdFJhbmdlLFxuICAgICAgICAgIHByb3BhZ2F0aW9uVHlwZTogdGhpcy5wcm9wYWdhdGlvblR5cGUsXG4gICAgICAgICAgc3BlZWQ6IHRoaXMucHJvamVjdGlsZVNwZWVkLFxuICAgICAgICAgIHRpbWluZzogdGhpcy50aW1pbmdcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2plY3RpbGUubGF1bmNoKCk7XG4gICAgICAgIHRoaXMuY2hhcmdlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlY2hhcmdlKCk7XG4gICAgICAgIHJldHVybiBwcm9qZWN0aWxlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlY2hhcmdlKCkge1xuICAgICAgdGhpcy5jaGFyZ2luZyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhcmdpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2VkKCk7XG4gICAgICB9LCB0aGlzLnJlY2hhcmdlVGltZSk7XG4gICAgfVxuXG4gICAgcmVjaGFyZ2VkKCkge1xuICAgICAgdGhpcy5jaGFyZ2VkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGlzLmF1dG9GaXJlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpcmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBTaGlwV2VhcG9uLmV4dGVuZChEYW1hZ2VhYmxlKTtcblxuICBTaGlwV2VhcG9uLnByb3BlcnRpZXMoe1xuICAgIHJlY2hhcmdlVGltZToge1xuICAgICAgZGVmYXVsdDogMTAwMFxuICAgIH0sXG4gICAgcG93ZXI6IHtcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICBibGFzdFJhbmdlOiB7XG4gICAgICBkZWZhdWx0OiAxXG4gICAgfSxcbiAgICBwcm9wYWdhdGlvblR5cGU6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICB9LFxuICAgIHByb2plY3RpbGVTcGVlZDoge1xuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmF1dG9GaXJlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmlyZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBjaGFyZ2VkOiB7XG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBjaGFyZ2luZzoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgZW5hYmxlZDoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgYXV0b0ZpcmU6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGNyaXRpY2FsSGVhbHRoOiB7XG4gICAgICBkZWZhdWx0OiAwLjNcbiAgICB9LFxuICAgIGNhbkZpcmU6IHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcmdldCAmJiB0aGlzLmVuYWJsZWQgJiYgdGhpcy5jaGFyZ2VkICYmIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGggPj0gdGhpcy5jcml0aWNhbEhlYWx0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRpbWluZzoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1pbmcoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaGlwV2VhcG9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1NoaXBXZWFwb24uanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgTWFwLCBTdGFyTWFwR2VuZXJhdG9yLCBTdGFyU3lzdGVtLCBzdGFyTmFtZXM7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuTWFwID0gcmVxdWlyZSgnLi9NYXAnKTtcblxuU3RhclN5c3RlbSA9IHJlcXVpcmUoJy4vU3RhclN5c3RlbScpO1xuXG5zdGFyTmFtZXMgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXN0cmluZ3MnKS5zdGFyTmFtZXM7XG5cbm1vZHVsZS5leHBvcnRzID0gU3Rhck1hcEdlbmVyYXRvciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU3Rhck1hcEdlbmVyYXRvciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLm9wdCA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmT3B0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgIHRoaXMubWFwID0gbmV3IHRoaXMub3B0Lm1hcENsYXNzKCk7XG4gICAgICB0aGlzLnN0YXJzID0gdGhpcy5tYXAubG9jYXRpb25zLmNvcHkoKTtcbiAgICAgIHRoaXMubGlua3MgPSBbXTtcbiAgICAgIHRoaXMuY3JlYXRlU3RhcnModGhpcy5vcHQubmJTdGFycyk7XG4gICAgICB0aGlzLm1ha2VMaW5rcygpO1xuICAgICAgcmV0dXJuIHRoaXMubWFwO1xuICAgIH1cblxuICAgIGNyZWF0ZVN0YXJzKG5iKSB7XG4gICAgICB2YXIgaSwgaywgcmVmLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gayA9IDAsIHJlZiA9IG5iOyAoMCA8PSByZWYgPyBrIDwgcmVmIDogayA+IHJlZik7IGkgPSAwIDw9IHJlZiA/ICsrayA6IC0taykge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5jcmVhdGVTdGFyKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgY3JlYXRlU3RhcihvcHQgPSB7fSkge1xuICAgICAgdmFyIG5hbWUsIHBvcywgc3RhcjtcbiAgICAgIGlmICghKG9wdC54ICYmIG9wdC55KSkge1xuICAgICAgICBwb3MgPSB0aGlzLnJhbmRvbVN0YXJQb3MoKTtcbiAgICAgICAgaWYgKHBvcyAhPSBudWxsKSB7XG4gICAgICAgICAgb3B0ID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0LCB7XG4gICAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICAgIHk6IHBvcy55XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghb3B0Lm5hbWUpIHtcbiAgICAgICAgbmFtZSA9IHRoaXMucmFuZG9tU3Rhck5hbWUoKTtcbiAgICAgICAgaWYgKG5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24oe30sIG9wdCwge1xuICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGFyID0gbmV3IHRoaXMub3B0LnN0YXJDbGFzcyhvcHQpO1xuICAgICAgdGhpcy5tYXAubG9jYXRpb25zLnB1c2goc3Rhcik7XG4gICAgICB0aGlzLnN0YXJzLnB1c2goc3Rhcik7XG4gICAgICByZXR1cm4gc3RhcjtcbiAgICB9XG5cbiAgICByYW5kb21TdGFyUG9zKCkge1xuICAgICAgdmFyIGosIHBvcztcbiAgICAgIGogPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgcG9zID0ge1xuICAgICAgICAgIHg6IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiAodGhpcy5vcHQubWF4WCAtIHRoaXMub3B0Lm1pblgpICsgdGhpcy5vcHQubWluWCksXG4gICAgICAgICAgeTogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhZIC0gdGhpcy5vcHQubWluWSkgKyB0aGlzLm9wdC5taW5ZKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIShqIDwgMTAgJiYgdGhpcy5zdGFycy5maW5kKChzdGFyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHN0YXIuZGlzdChwb3MueCwgcG9zLnkpIDw9IHRoaXMub3B0Lm1pblN0YXJEaXN0O1xuICAgICAgICB9KSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgICBpZiAoIShqID49IDEwKSkge1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJhbmRvbVN0YXJOYW1lKCkge1xuICAgICAgdmFyIG5hbWUsIHBvcywgcmVmO1xuICAgICAgaWYgKChyZWYgPSB0aGlzLm9wdC5zdGFyTmFtZXMpICE9IG51bGwgPyByZWYubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICAgIHBvcyA9IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiB0aGlzLm9wdC5zdGFyTmFtZXMubGVuZ3RoKTtcbiAgICAgICAgbmFtZSA9IHRoaXMub3B0LnN0YXJOYW1lc1twb3NdO1xuICAgICAgICB0aGlzLm9wdC5zdGFyTmFtZXMuc3BsaWNlKHBvcywgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VMaW5rcygpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJzLmZvckVhY2goKHN0YXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZUxpbmtzRnJvbShzdGFyKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG1ha2VMaW5rc0Zyb20oc3Rhcikge1xuICAgICAgdmFyIGNsb3NlLCBjbG9zZXN0cywgbGluaywgbmVlZGVkLCByZXN1bHRzLCB0cmllcztcbiAgICAgIHRyaWVzID0gdGhpcy5vcHQubGlua1RyaWVzO1xuICAgICAgbmVlZGVkID0gdGhpcy5vcHQubGlua3NCeVN0YXJzIC0gc3Rhci5saW5rcy5jb3VudCgpO1xuICAgICAgaWYgKG5lZWRlZCA+IDApIHtcbiAgICAgICAgY2xvc2VzdHMgPSB0aGlzLnN0YXJzLmZpbHRlcigoc3RhcjIpID0+IHtcbiAgICAgICAgICByZXR1cm4gc3RhcjIgIT09IHN0YXIgJiYgIXN0YXIubGlua3MuZmluZFN0YXIoc3RhcjIpO1xuICAgICAgICB9KS5jbG9zZXN0cyhzdGFyLngsIHN0YXIueSk7XG4gICAgICAgIGlmIChjbG9zZXN0cy5jb3VudCgpID4gMCkge1xuICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY2xvc2UgPSBjbG9zZXN0cy5zaGlmdCgpO1xuICAgICAgICAgICAgbGluayA9IHRoaXMuY3JlYXRlTGluayhzdGFyLCBjbG9zZSk7XG4gICAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZUxpbmsobGluaykpIHtcbiAgICAgICAgICAgICAgdGhpcy5saW5rcy5wdXNoKGxpbmspO1xuICAgICAgICAgICAgICBzdGFyLmFkZExpbmsobGluayk7XG4gICAgICAgICAgICAgIG5lZWRlZCAtPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdHJpZXMgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghKG5lZWRlZCA+IDAgJiYgdHJpZXMgPiAwICYmIGNsb3Nlc3RzLmNvdW50KCkgPiAwKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUxpbmsoc3RhcjEsIHN0YXIyKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMub3B0LmxpbmtDbGFzcyhzdGFyMSwgc3RhcjIpO1xuICAgIH1cblxuICAgIHZhbGlkYXRlTGluayhsaW5rKSB7XG4gICAgICByZXR1cm4gIXRoaXMuc3RhcnMuZmluZCgoc3RhcikgPT4ge1xuICAgICAgICByZXR1cm4gc3RhciAhPT0gbGluay5zdGFyMSAmJiBzdGFyICE9PSBsaW5rLnN0YXIyICYmIGxpbmsuY2xvc2VUb1BvaW50KHN0YXIueCwgc3Rhci55LCB0aGlzLm9wdC5taW5MaW5rRGlzdCk7XG4gICAgICB9KSAmJiAhdGhpcy5saW5rcy5maW5kKChsaW5rMikgPT4ge1xuICAgICAgICByZXR1cm4gbGluazIuaW50ZXJzZWN0TGluayhsaW5rKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIFN0YXJNYXBHZW5lcmF0b3IucHJvdG90eXBlLmRlZk9wdCA9IHtcbiAgICBuYlN0YXJzOiAyMCxcbiAgICBtaW5YOiAwLFxuICAgIG1heFg6IDUwMCxcbiAgICBtaW5ZOiAwLFxuICAgIG1heFk6IDUwMCxcbiAgICBtaW5TdGFyRGlzdDogMTAsXG4gICAgbWluTGlua0Rpc3Q6IDEwLFxuICAgIGxpbmtzQnlTdGFyczogMyxcbiAgICBsaW5rVHJpZXM6IDMsXG4gICAgbWFwQ2xhc3M6IE1hcCxcbiAgICBzdGFyQ2xhc3M6IFN0YXJTeXN0ZW0sXG4gICAgbGlua0NsYXNzOiBTdGFyU3lzdGVtLkxpbmssXG4gICAgcm5nOiBNYXRoLnJhbmRvbSxcbiAgICBzdGFyTmFtZXM6IHN0YXJOYW1lc1xuICB9O1xuXG4gIHJldHVybiBTdGFyTWFwR2VuZXJhdG9yO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1N0YXJNYXBHZW5lcmF0b3IuanMubWFwXG4iLCJ2YXIgRWxlbWVudCwgU3RhclN5c3RlbTtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJTeXN0ZW0gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFN0YXJTeXN0ZW0gZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICBzdXBlcihkYXRhKTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7fVxuXG4gICAgbGlua1RvKHN0YXIpIHtcbiAgICAgIGlmICghdGhpcy5saW5rcy5maW5kU3RhcihzdGFyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRMaW5rKG5ldyB0aGlzLmNvbnN0cnVjdG9yLkxpbmsodGhpcywgc3RhcikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZExpbmsobGluaykge1xuICAgICAgdGhpcy5saW5rcy5hZGQobGluayk7XG4gICAgICBsaW5rLm90aGVyU3Rhcih0aGlzKS5saW5rcy5hZGQobGluayk7XG4gICAgICByZXR1cm4gbGluaztcbiAgICB9XG5cbiAgICBkaXN0KHgsIHkpIHtcbiAgICAgIHZhciB4RGlzdCwgeURpc3Q7XG4gICAgICB4RGlzdCA9IHRoaXMueCAtIHg7XG4gICAgICB5RGlzdCA9IHRoaXMueSAtIHk7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KCh4RGlzdCAqIHhEaXN0KSArICh5RGlzdCAqIHlEaXN0KSk7XG4gICAgfVxuXG4gIH07XG5cbiAgU3RhclN5c3RlbS5wcm9wZXJ0aWVzKHtcbiAgICB4OiB7fSxcbiAgICB5OiB7fSxcbiAgICBuYW1lOiB7fSxcbiAgICBsaW5rczoge1xuICAgICAgY29sbGVjdGlvbjoge1xuICAgICAgICBmaW5kU3RhcjogZnVuY3Rpb24oc3Rhcikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZpbmQoZnVuY3Rpb24obGluaykge1xuICAgICAgICAgICAgcmV0dXJuIGxpbmsuc3RhcjIgPT09IHN0YXIgfHwgbGluay5zdGFyMSA9PT0gc3RhcjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgU3RhclN5c3RlbS5jb2xsZW5jdGlvbkZuID0ge1xuICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciBtaW4sIG1pbkRpc3Q7XG4gICAgICBtaW4gPSBudWxsO1xuICAgICAgbWluRGlzdCA9IG51bGw7XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oc3Rhcikge1xuICAgICAgICB2YXIgZGlzdDtcbiAgICAgICAgZGlzdCA9IHN0YXIuZGlzdCh4LCB5KTtcbiAgICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgICBtaW4gPSBzdGFyO1xuICAgICAgICAgIHJldHVybiBtaW5EaXN0ID0gZGlzdDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbWluO1xuICAgIH0sXG4gICAgY2xvc2VzdHM6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciBkaXN0cztcbiAgICAgIGRpc3RzID0gdGhpcy5tYXAoZnVuY3Rpb24oc3Rhcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRpc3Q6IHN0YXIuZGlzdCh4LCB5KSxcbiAgICAgICAgICBzdGFyOiBzdGFyXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGRpc3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYS5kaXN0IC0gYi5kaXN0O1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5KGRpc3RzLm1hcChmdW5jdGlvbihkaXN0KSB7XG4gICAgICAgIHJldHVybiBkaXN0LnN0YXI7XG4gICAgICB9KSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTdGFyU3lzdGVtO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5TdGFyU3lzdGVtLkxpbmsgPSBjbGFzcyBMaW5rIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKHN0YXIxLCBzdGFyMikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGFyMSA9IHN0YXIxO1xuICAgIHRoaXMuc3RhcjIgPSBzdGFyMjtcbiAgfVxuXG4gIHJlbW92ZSgpIHtcbiAgICB0aGlzLnN0YXIxLmxpbmtzLnJlbW92ZSh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5zdGFyMi5saW5rcy5yZW1vdmUodGhpcyk7XG4gIH1cblxuICBvdGhlclN0YXIoc3Rhcikge1xuICAgIGlmIChzdGFyID09PSB0aGlzLnN0YXIxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFyMjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcjE7XG4gICAgfVxuICB9XG5cbiAgZ2V0TGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXIxLmRpc3QodGhpcy5zdGFyMi54LCB0aGlzLnN0YXIyLnkpO1xuICB9XG5cbiAgaW5Cb3VuZGFyeUJveCh4LCB5LCBwYWRkaW5nID0gMCkge1xuICAgIHZhciB4MSwgeDIsIHkxLCB5MjtcbiAgICB4MSA9IE1hdGgubWluKHRoaXMuc3RhcjEueCwgdGhpcy5zdGFyMi54KSAtIHBhZGRpbmc7XG4gICAgeTEgPSBNYXRoLm1pbih0aGlzLnN0YXIxLnksIHRoaXMuc3RhcjIueSkgLSBwYWRkaW5nO1xuICAgIHgyID0gTWF0aC5tYXgodGhpcy5zdGFyMS54LCB0aGlzLnN0YXIyLngpICsgcGFkZGluZztcbiAgICB5MiA9IE1hdGgubWF4KHRoaXMuc3RhcjEueSwgdGhpcy5zdGFyMi55KSArIHBhZGRpbmc7XG4gICAgcmV0dXJuIHggPj0geDEgJiYgeCA8PSB4MiAmJiB5ID49IHkxICYmIHkgPD0geTI7XG4gIH1cblxuICBjbG9zZVRvUG9pbnQoeCwgeSwgbWluRGlzdCkge1xuICAgIHZhciBhLCBhYkRpc3QsIGFiY0FuZ2xlLCBhYnhBbmdsZSwgYWNEaXN0LCBhY3hBbmdsZSwgYiwgYywgY2REaXN0LCB4QWJEaXN0LCB4QWNEaXN0LCB5QWJEaXN0LCB5QWNEaXN0O1xuICAgIGlmICghdGhpcy5pbkJvdW5kYXJ5Qm94KHgsIHksIG1pbkRpc3QpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGEgPSB0aGlzLnN0YXIxO1xuICAgIGIgPSB0aGlzLnN0YXIyO1xuICAgIGMgPSB7XG4gICAgICBcInhcIjogeCxcbiAgICAgIFwieVwiOiB5XG4gICAgfTtcbiAgICB4QWJEaXN0ID0gYi54IC0gYS54O1xuICAgIHlBYkRpc3QgPSBiLnkgLSBhLnk7XG4gICAgYWJEaXN0ID0gTWF0aC5zcXJ0KCh4QWJEaXN0ICogeEFiRGlzdCkgKyAoeUFiRGlzdCAqIHlBYkRpc3QpKTtcbiAgICBhYnhBbmdsZSA9IE1hdGguYXRhbih5QWJEaXN0IC8geEFiRGlzdCk7XG4gICAgeEFjRGlzdCA9IGMueCAtIGEueDtcbiAgICB5QWNEaXN0ID0gYy55IC0gYS55O1xuICAgIGFjRGlzdCA9IE1hdGguc3FydCgoeEFjRGlzdCAqIHhBY0Rpc3QpICsgKHlBY0Rpc3QgKiB5QWNEaXN0KSk7XG4gICAgYWN4QW5nbGUgPSBNYXRoLmF0YW4oeUFjRGlzdCAvIHhBY0Rpc3QpO1xuICAgIGFiY0FuZ2xlID0gYWJ4QW5nbGUgLSBhY3hBbmdsZTtcbiAgICBjZERpc3QgPSBNYXRoLmFicyhNYXRoLnNpbihhYmNBbmdsZSkgKiBhY0Rpc3QpO1xuICAgIHJldHVybiBjZERpc3QgPD0gbWluRGlzdDtcbiAgfVxuXG4gIGludGVyc2VjdExpbmsobGluaykge1xuICAgIHZhciBzLCBzMV94LCBzMV95LCBzMl94LCBzMl95LCB0LCB4MSwgeDIsIHgzLCB4NCwgeTEsIHkyLCB5MywgeTQ7XG4gICAgeDEgPSB0aGlzLnN0YXIxLng7XG4gICAgeTEgPSB0aGlzLnN0YXIxLnk7XG4gICAgeDIgPSB0aGlzLnN0YXIyLng7XG4gICAgeTIgPSB0aGlzLnN0YXIyLnk7XG4gICAgeDMgPSBsaW5rLnN0YXIxLng7XG4gICAgeTMgPSBsaW5rLnN0YXIxLnk7XG4gICAgeDQgPSBsaW5rLnN0YXIyLng7XG4gICAgeTQgPSBsaW5rLnN0YXIyLnk7XG4gICAgczFfeCA9IHgyIC0geDE7XG4gICAgczFfeSA9IHkyIC0geTE7XG4gICAgczJfeCA9IHg0IC0geDM7XG4gICAgczJfeSA9IHk0IC0geTM7XG4gICAgcyA9ICgtczFfeSAqICh4MSAtIHgzKSArIHMxX3ggKiAoeTEgLSB5MykpIC8gKC1zMl94ICogczFfeSArIHMxX3ggKiBzMl95KTtcbiAgICB0ID0gKHMyX3ggKiAoeTEgLSB5MykgLSBzMl95ICogKHgxIC0geDMpKSAvICgtczJfeCAqIHMxX3kgKyBzMV94ICogczJfeSk7XG4gICAgcmV0dXJuIHMgPiAwICYmIHMgPCAxICYmIHQgPiAwICYmIHQgPCAxO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvU3RhclN5c3RlbS5qcy5tYXBcbiIsInZhciBFbGVtZW50LCBHcmlkLCBWaWV3O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbkdyaWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLWdyaWRzJykuR3JpZDtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBWaWV3IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgc2V0RGVmYXVsdHMoKSB7XG4gICAgICB2YXIgcmVmLCByZWYxO1xuICAgICAgaWYgKCF0aGlzLmJvdW5kcykge1xuICAgICAgICB0aGlzLmdyaWQgPSB0aGlzLmdyaWQgfHwgKChyZWYgPSB0aGlzLmdhbWUuX21haW5WaWV3KSAhPSBudWxsID8gKHJlZjEgPSByZWYudmFsdWUpICE9IG51bGwgPyByZWYxLmdyaWQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IG5ldyBHcmlkKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmJvdW5kcyA9IHRoaXMuZ3JpZC5hZGRDZWxsKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdhbWUgPSBudWxsO1xuICAgIH1cblxuICB9O1xuXG4gIFZpZXcucHJvcGVydGllcyh7XG4gICAgZ2FtZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICAgIHRoaXMuZ2FtZS52aWV3cy5hZGQodGhpcyk7XG4gICAgICAgICAgdGhpcy5zZXREZWZhdWx0cygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvbGQpIHtcbiAgICAgICAgICByZXR1cm4gb2xkLnZpZXdzLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgeDoge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgeToge1xuICAgICAgZGVmYXVsdDogMFxuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH0sXG4gICAgYm91bmRzOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVmlldztcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9WaWV3LmpzLm1hcFxuIiwidmFyIERpcmVjdGlvbiwgTGluZU9mU2lnaHQsIFRpbGVDb250YWluZXIsIFRpbGVSZWZlcmVuY2UsIFZpc2lvbkNhbGN1bGF0b3I7XG5cbkxpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpO1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uO1xuXG5UaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXI7XG5cblRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVJlZmVyZW5jZTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaXNpb25DYWxjdWxhdG9yID0gY2xhc3MgVmlzaW9uQ2FsY3VsYXRvciB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpblRpbGUsIG9mZnNldCA9IHtcbiAgICAgIHg6IDAuNSxcbiAgICAgIHk6IDAuNVxuICAgIH0pIHtcbiAgICB0aGlzLm9yaWdpblRpbGUgPSBvcmlnaW5UaWxlO1xuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgIHRoaXMucHRzID0ge307XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge307XG4gICAgdGhpcy5zdGFjayA9IFtdO1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgY2FsY3VsKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB2YXIgZmlyc3RCYXRjaCwgaW5pdGlhbFB0cztcbiAgICB0aGlzLnB0cyA9IHt9O1xuICAgIHRoaXMudmlzaWJpbGl0eSA9IHt9O1xuICAgIGluaXRpYWxQdHMgPSBbXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDFcbiAgICAgIH1cbiAgICBdO1xuICAgIGluaXRpYWxQdHMuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnNldFB0KHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55LCB0cnVlKTtcbiAgICB9KTtcbiAgICBmaXJzdEJhdGNoID0gW1xuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IC0xLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDIsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAxXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAyLFxuICAgICAgICB5OiAyXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAtMVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDJcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiB0aGlzLnN0YWNrID0gZmlyc3RCYXRjaC5tYXAoKHB0KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLm9yaWdpblRpbGUueCArIHB0LngsXG4gICAgICAgIHk6IHRoaXMub3JpZ2luVGlsZS55ICsgcHQueVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFB0KHgsIHksIHZhbCkge1xuICAgIHZhciBhZGphbmNlbnQ7XG4gICAgdGhpcy5wdHNbeCArICc6JyArIHldID0gdmFsO1xuICAgIGFkamFuY2VudCA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiBhZGphbmNlbnQuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFZpc2liaWxpdHkoeCArIHB0LngsIHkgKyBwdC55LCB2YWwgPyAxIC8gYWRqYW5jZW50Lmxlbmd0aCA6IDApO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0UHQoeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnB0c1t4ICsgJzonICsgeV07XG4gIH1cblxuICBhZGRWaXNpYmlsaXR5KHgsIHksIHZhbCkge1xuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5W3hdID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF1beV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVt4XVt5XSArPSB2YWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmlzaWJpbGl0eSh4LCB5KSB7XG4gICAgaWYgKCh0aGlzLnZpc2liaWxpdHlbeF0gPT0gbnVsbCkgfHwgKHRoaXMudmlzaWJpbGl0eVt4XVt5XSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlbeF1beV07XG4gICAgfVxuICB9XG5cbiAgY2FuUHJvY2Vzcyh4LCB5KSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YWNrLnNvbWUoKHB0KSA9PiB7XG4gICAgICByZXR1cm4gcHQueCA9PT0geCAmJiBwdC55ID09PSB5O1xuICAgIH0pICYmICh0aGlzLmdldFB0KHgsIHkpID09IG51bGwpO1xuICB9XG5cbiAgc3RlcCgpIHtcbiAgICB2YXIgbG9zLCBwdDtcbiAgICBwdCA9IHRoaXMuc3RhY2suc2hpZnQoKTtcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lciwgdGhpcy5vcmlnaW5UaWxlLnggKyB0aGlzLm9mZnNldC54LCB0aGlzLm9yaWdpblRpbGUueSArIHRoaXMub2Zmc2V0LnksIHB0LngsIHB0LnkpO1xuICAgIGxvcy5yZXZlcnNlVHJhY2luZygpO1xuICAgIGxvcy50cmF2ZXJzYWJsZUNhbGxiYWNrID0gKHRpbGUsIGVudHJ5WCwgZW50cnlZKSA9PiB7XG4gICAgICBpZiAodGlsZSAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmdldFZpc2liaWxpdHkodGlsZS54LCB0aWxlLnkpID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGxvcy5mb3JjZVN1Y2Nlc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGlsZS50cmFuc3BhcmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5zZXRQdChwdC54LCBwdC55LCBsb3MuZ2V0U3VjY2VzcygpKTtcbiAgICBpZiAobG9zLmdldFN1Y2Nlc3MoKSkge1xuICAgICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZm9yRWFjaCgoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIHZhciBuZXh0UHQ7XG4gICAgICAgIG5leHRQdCA9IHtcbiAgICAgICAgICB4OiBwdC54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgeTogcHQueSArIGRpcmVjdGlvbi55XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmNhblByb2Nlc3MobmV4dFB0LngsIG5leHRQdC55KSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YWNrLnB1c2gobmV4dFB0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Qm91bmRzKCkge1xuICAgIHZhciBib3VuZGFyaWVzLCBjb2wsIHJlZiwgdmFsLCB4LCB5O1xuICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICB0b3A6IG51bGwsXG4gICAgICBsZWZ0OiBudWxsLFxuICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgcmlnaHQ6IG51bGxcbiAgICB9O1xuICAgIHJlZiA9IHRoaXMudmlzaWJpbGl0eTtcbiAgICBmb3IgKHggaW4gcmVmKSB7XG4gICAgICBjb2wgPSByZWZbeF07XG4gICAgICBmb3IgKHkgaW4gY29sKSB7XG4gICAgICAgIHZhbCA9IGNvbFt5XTtcbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB5IDwgYm91bmRhcmllcy50b3ApIHtcbiAgICAgICAgICBib3VuZGFyaWVzLnRvcCA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgeCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMubGVmdCA9IHg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB5ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHggPiBib3VuZGFyaWVzLnJpZ2h0KSB7XG4gICAgICAgICAgYm91bmRhcmllcy5yaWdodCA9IHg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gIH1cblxuICB0b0NvbnRhaW5lcigpIHtcbiAgICB2YXIgY29sLCByZWYsIHJlcywgdGlsZSwgdmFsLCB4LCB5O1xuICAgIHJlcyA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgcmVzLm93bmVyID0gZmFsc2U7XG4gICAgcmVmID0gdGhpcy52aXNpYmlsaXR5O1xuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XTtcbiAgICAgIGZvciAoeSBpbiBjb2wpIHtcbiAgICAgICAgdmFsID0gY29sW3ldO1xuICAgICAgICB0aWxlID0gdGhpcy5vcmlnaW5UaWxlLmNvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgICBpZiAodmFsICE9PSAwICYmICh0aWxlICE9IG51bGwpKSB7XG4gICAgICAgICAgdGlsZSA9IG5ldyBUaWxlUmVmZXJlbmNlKHRpbGUpO1xuICAgICAgICAgIHRpbGUudmlzaWJpbGl0eSA9IHZhbDtcbiAgICAgICAgICByZXMuYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgdG9NYXAoKSB7XG4gICAgdmFyIGksIGosIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgcmVzLCB4LCB5O1xuICAgIHJlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbWFwOiBbXVxuICAgIH0sIHRoaXMuZ2V0Qm91bmRzKCkpO1xuICAgIGZvciAoeSA9IGkgPSByZWYgPSByZXMudG9wLCByZWYxID0gcmVzLmJvdHRvbSAtIDE7IChyZWYgPD0gcmVmMSA/IGkgPD0gcmVmMSA6IGkgPj0gcmVmMSk7IHkgPSByZWYgPD0gcmVmMSA/ICsraSA6IC0taSkge1xuICAgICAgcmVzLm1hcFt5IC0gcmVzLnRvcF0gPSBbXTtcbiAgICAgIGZvciAoeCA9IGogPSByZWYyID0gcmVzLmxlZnQsIHJlZjMgPSByZXMucmlnaHQgLSAxOyAocmVmMiA8PSByZWYzID8gaiA8PSByZWYzIDogaiA+PSByZWYzKTsgeCA9IHJlZjIgPD0gcmVmMyA/ICsraiA6IC0taikge1xuICAgICAgICByZXMubWFwW3kgLSByZXMudG9wXVt4IC0gcmVzLmxlZnRdID0gdGhpcy5nZXRWaXNpYmlsaXR5KHgsIHkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVmlzaW9uQ2FsY3VsYXRvci5qcy5tYXBcbiIsInZhciBBY3Rpb24sIEVsZW1lbnQsIEV2ZW50RW1pdHRlcjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQWN0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuc2V0UHJvcGVydGllcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICB3aXRoQWN0b3IoYWN0b3IpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yICE9PSBhY3Rvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7XG4gICAgICAgICAgYWN0b3I6IGFjdG9yXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29weVdpdGgob3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBiYXNlOiB0aGlzXG4gICAgICB9LCB0aGlzLmdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCksIG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGUoKTtcbiAgICB9XG5cbiAgICB2YWxpZEFjdG9yKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0b3IgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBpc1JlYWR5KCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3RvcigpO1xuICAgIH1cblxuICAgIGZpbmlzaCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignZmluaXNoZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGludGVycnVwdCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignaW50ZXJydXB0ZWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZCgpO1xuICAgIH1cblxuICAgIGVuZCgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignZW5kJyk7XG4gICAgICByZXR1cm4gdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gIH07XG5cbiAgQWN0aW9uLmluY2x1ZGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5cbiAgQWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIGFjdG9yOiB7fVxuICB9KTtcblxuICByZXR1cm4gQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQWN0aW9uLmpzLm1hcFxuIiwidmFyIEFjdGlvblByb3ZpZGVyLCBFbGVtZW50O1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uUHJvdmlkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFjdGlvblByb3ZpZGVyIGV4dGVuZHMgRWxlbWVudCB7fTtcblxuICBBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0FjdGlvblByb3ZpZGVyLmpzLm1hcFxuIiwidmFyIEF0dGFja0FjdGlvbiwgRXZlbnRCaW5kLCBQcm9wZXJ0eVdhdGNoZXIsIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuV2Fsa0FjdGlvbiA9IHJlcXVpcmUoJy4vV2Fsa0FjdGlvbicpO1xuXG5UYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpO1xuXG5FdmVudEJpbmQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRCaW5kO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuSW52YWxpZGF0ZWQuUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFja0FjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXR0YWNrQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldElzQXR0YWNrYWJsZSgpICYmICh0aGlzLmNhblVzZVdlYXBvbigpIHx8IHRoaXMuY2FuV2Fsa1RvVGFyZ2V0KCkpO1xuICAgIH1cblxuICAgIHRhcmdldElzQXR0YWNrYWJsZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5kYW1hZ2VhYmxlICYmIHRoaXMudGFyZ2V0LmhlYWx0aCA+PSAwO1xuICAgIH1cblxuICAgIGNhbk1lbGVlKCkge1xuICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueCAtIHRoaXMuYWN0b3IudGlsZS54KSArIE1hdGguYWJzKHRoaXMudGFyZ2V0LnRpbGUueSAtIHRoaXMuYWN0b3IudGlsZS55KSA9PT0gMTtcbiAgICB9XG5cbiAgICBjYW5Vc2VXZWFwb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5iZXN0VXNhYmxlV2VhcG9uICE9IG51bGw7XG4gICAgfVxuXG4gICAgY2FuVXNlV2VhcG9uQXQodGlsZSkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIHJldHVybiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApICYmIHRoaXMuYWN0b3Iud2VhcG9ucy5maW5kKCh3ZWFwb24pID0+IHtcbiAgICAgICAgcmV0dXJuIHdlYXBvbi5jYW5Vc2VGcm9tKHRpbGUsIHRoaXMudGFyZ2V0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNhbldhbGtUb1RhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uaXNSZWFkeSgpO1xuICAgIH1cblxuICAgIHVzZVdlYXBvbigpIHtcbiAgICAgIHRoaXMuYmVzdFVzYWJsZVdlYXBvbi51c2VPbih0aGlzLnRhcmdldCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2goKTtcbiAgICB9XG5cbiAgICBleGVjdXRlKCkge1xuICAgICAgaWYgKHRoaXMuYWN0b3Iud2FsayAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYWN0b3Iud2Fsay5pbnRlcnJ1cHQoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24gIT0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uLmNoYXJnZWQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy51c2VXZWFwb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy53ZWFwb25DaGFyZ2VXYXRjaGVyLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YWxrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmludGVycnVwdEJpbmRlci51bmJpbmQoKTtcbiAgICAgICAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIuYmluZFRvKHRoaXMud2Fsa0FjdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEF0dGFja0FjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrQWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2Fsa0FjdGlvbjtcbiAgICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHdhbGtBY3Rpb24ucGF0aEZpbmRlci5hcnJpdmVkQ2FsbGJhY2sgPSAoc3RlcCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNhblVzZVdlYXBvbkF0KHN0ZXAudGlsZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB3YWxrQWN0aW9uO1xuICAgICAgfVxuICAgIH0sXG4gICAgYmVzdFVzYWJsZVdlYXBvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgcmVmLCB1c2FibGVXZWFwb25zO1xuICAgICAgICBpbnZhbGlkYXRvci5wcm9wUGF0aCgnYWN0b3IudGlsZScpO1xuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiB2b2lkIDApIHtcbiAgICAgICAgICB1c2FibGVXZWFwb25zID0gdGhpcy5hY3Rvci53ZWFwb25zLmZpbHRlcigod2VhcG9uKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gd2VhcG9uLmNhblVzZU9uKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB1c2FibGVXZWFwb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBiLmRwcyAtIGEuZHBzO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB1c2FibGVXZWFwb25zWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnRlcnJ1cHRCaW5kZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXZlbnRCaW5kKCdpbnRlcnJ1cHRlZCcsIG51bGwsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZGVzdHJveTogdHJ1ZVxuICAgIH0sXG4gICAgd2VhcG9uQ2hhcmdlV2F0Y2hlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uLmNoYXJnZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlV2VhcG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5iZXN0VXNhYmxlV2VhcG9uLmdldFByb3BlcnR5SW5zdGFuY2UoJ2NoYXJnZWQnKVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXR0YWNrQWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL2FjdGlvbnMvQXR0YWNrQWN0aW9uLmpzLm1hcFxuIiwidmFyIEF0dGFja0FjdGlvbiwgQXR0YWNrTW92ZUFjdGlvbiwgRXZlbnRCaW5kLCBMaW5lT2ZTaWdodCwgUGF0aEZpbmRlciwgUHJvcGVydHlXYXRjaGVyLCBUYXJnZXRBY3Rpb24sIFdhbGtBY3Rpb247XG5cbldhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKTtcblxuQXR0YWNrQWN0aW9uID0gcmVxdWlyZSgnLi9BdHRhY2tBY3Rpb24nKTtcblxuVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKTtcblxuUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpO1xuXG5MaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4uL0xpbmVPZlNpZ2h0Jyk7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5JbnZhbGlkYXRlZC5Qcm9wZXJ0eVdhdGNoZXI7XG5cbkV2ZW50QmluZCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEJpbmQ7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNrTW92ZUFjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQXR0YWNrTW92ZUFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgaXNFbmVteShlbGVtKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgcmV0dXJuIChyZWYgPSB0aGlzLmFjdG9yLm93bmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5pc0VuZW15ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuaXNFbmVteShlbGVtKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgICB9XG5cbiAgICB2YWxpZFRhcmdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24udmFsaWRUYXJnZXQoKTtcbiAgICB9XG5cbiAgICB0ZXN0RW5lbXlTcG90dGVkKCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlRW5lbXlTcG90dGVkKCk7XG4gICAgICBpZiAodGhpcy5lbmVteVNwb3R0ZWQpIHtcbiAgICAgICAgdGhpcy5hdHRhY2tBY3Rpb24gPSBuZXcgQXR0YWNrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMuZW5lbXlTcG90dGVkXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF0dGFja0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLmF0dGFja0FjdGlvbik7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5pbnRlcnJ1cHQoKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlV2Fsa0FjdGlvbigpO1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2tBY3Rpb24uZXhlY3V0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4ZWN1dGUoKSB7XG4gICAgICBpZiAoIXRoaXMudGVzdEVuZW15U3BvdHRlZCgpKSB7XG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLndhbGtBY3Rpb24pO1xuICAgICAgICB0aGlzLnRpbGVXYXRjaGVyLmJpbmQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa0FjdGlvbi5leGVjdXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQXR0YWNrTW92ZUFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgICB3YWxrQWN0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2Fsa0FjdGlvbjtcbiAgICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgICBhY3RvcjogdGhpcy5hY3RvcixcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB3YWxrQWN0aW9uO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5lbXlTcG90dGVkOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICB0aGlzLnBhdGggPSBuZXcgUGF0aEZpbmRlcih0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUsIGZhbHNlLCB7XG4gICAgICAgICAgdmFsaWRUaWxlOiAodGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRpbGUudHJhbnNwYXJlbnQgJiYgKG5ldyBMaW5lT2ZTaWdodCh0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUueCwgdGhpcy5hY3Rvci50aWxlLnksIHRpbGUueCwgdGlsZS55KSkuZ2V0U3VjY2VzcygpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYXJyaXZlZDogKHN0ZXApID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwLmVuZW15ID0gc3RlcC50aWxlLmNoaWxkcmVuLmZpbmQoKGMpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNFbmVteShjKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZWZmaWNpZW5jeTogKHRpbGUpID0+IHt9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBhdGguY2FsY3VsKCk7XG4gICAgICAgIHJldHVybiAocmVmID0gdGhpcy5wYXRoLnNvbHV0aW9uKSAhPSBudWxsID8gcmVmLmVuZW15IDogdm9pZCAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGlsZVdhdGNoZXI6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGVzdEVuZW15U3BvdHRlZCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuYWN0b3IuZ2V0UHJvcGVydHlJbnN0YW5jZSgndGlsZScpXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6IHRydWVcbiAgICB9LFxuICAgIGludGVycnVwdEJpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEJpbmQoJ2ludGVycnVwdGVkJywgbnVsbCwgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQXR0YWNrTW92ZUFjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24uanMubWFwXG4iLCJ2YXIgQWN0aW9uUHJvdmlkZXIsIFNpbXBsZUFjdGlvblByb3ZpZGVyO1xuXG5BY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUoJy4vQWN0aW9uUHJvdmlkZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVBY3Rpb25Qcm92aWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2ltcGxlQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBY3Rpb25Qcm92aWRlciB7fTtcblxuICBTaW1wbGVBY3Rpb25Qcm92aWRlci5wcm9wZXJ0aWVzKHtcbiAgICBwcm92aWRlZEFjdGlvbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY3Rpb25zO1xuICAgICAgICBhY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHRoaXMuY29uc3RydWN0b3IuYWN0aW9ucztcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb25zID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgYWN0aW9ucyA9IE9iamVjdC5rZXlzKGFjdGlvbnMpLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb25zW2tleV07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IGFjdGlvbih7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gU2ltcGxlQWN0aW9uUHJvdmlkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvYWN0aW9ucy9TaW1wbGVBY3Rpb25Qcm92aWRlci5qcy5tYXBcbiIsInZhciBBY3Rpb24sIFRhcmdldEFjdGlvbjtcblxuQWN0aW9uID0gcmVxdWlyZSgnLi9BY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXJnZXRBY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRhcmdldEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgd2l0aFRhcmdldCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLnRhcmdldCAhPT0gdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHtcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNhblRhcmdldCh0YXJnZXQpIHtcbiAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgIGluc3RhbmNlID0gdGhpcy53aXRoVGFyZ2V0KHRhcmdldCk7XG4gICAgICBpZiAoaW5zdGFuY2UudmFsaWRUYXJnZXQoKSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsaWRUYXJnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBpc1JlYWR5KCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmlzUmVhZHkoKSAmJiB0aGlzLnZhbGlkVGFyZ2V0KCk7XG4gICAgfVxuXG4gIH07XG5cbiAgVGFyZ2V0QWN0aW9uLnByb3BlcnRpZXMoe1xuICAgIHRhcmdldDoge31cbiAgfSk7XG5cbiAgcmV0dXJuIFRhcmdldEFjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1RhcmdldEFjdGlvbi5qcy5tYXBcbiIsInZhciBBY3Rpb25Qcm92aWRlciwgTWl4YWJsZSwgVGlsZWRBY3Rpb25Qcm92aWRlcjtcblxuQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL0FjdGlvblByb3ZpZGVyJyk7XG5cbk1peGFibGUgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuTWl4YWJsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZEFjdGlvblByb3ZpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlZEFjdGlvblByb3ZpZGVyIGV4dGVuZHMgQWN0aW9uUHJvdmlkZXIge1xuICAgIHZhbGlkQWN0aW9uVGlsZSh0aWxlKSB7XG4gICAgICByZXR1cm4gdGlsZSAhPSBudWxsO1xuICAgIH1cblxuICAgIHByZXBhcmVBY3Rpb25UaWxlKHRpbGUpIHtcbiAgICAgIGlmICghdGlsZS5nZXRQcm9wZXJ0eUluc3RhbmNlKCdwcm92aWRlZEFjdGlvbnMnKSkge1xuICAgICAgICByZXR1cm4gTWl4YWJsZS5FeHRlbnNpb24ubWFrZShBY3Rpb25Qcm92aWRlci5wcm90b3R5cGUsIHRpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFRpbGVkQWN0aW9uUHJvdmlkZXIucHJvcGVydGllcyh7XG4gICAgdGlsZToge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbihvbGQsIG92ZXJyaWRlZCkge1xuICAgICAgICBvdmVycmlkZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkQWN0aW9ucztcbiAgICAgIH1cbiAgICB9LFxuICAgIGFjdGlvblRpbGVzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgbXlUaWxlO1xuICAgICAgICBteVRpbGUgPSBpbnZhbGlkYXRvci5wcm9wKCd0aWxlJyk7XG4gICAgICAgIGlmIChteVRpbGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25UaWxlc0Nvb3JkLm1hcCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBteVRpbGUuZ2V0UmVsYXRpdmVUaWxlKGNvb3JkLngsIGNvb3JkLnkpO1xuICAgICAgICAgIH0pLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRBY3Rpb25UaWxlKHRpbGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZm9yd2FyZGVkQWN0aW9uczoge1xuICAgICAgY29sbGVjdGlvbjoge1xuICAgICAgICBjb21wYXJlOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEuYWN0aW9uID09PSBiLmFjdGlvbiAmJiBhLmxvY2F0aW9uID09PSBiLmxvY2F0aW9uO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgYWN0aW9uVGlsZXMsIGFjdGlvbnM7XG4gICAgICAgIGFjdGlvblRpbGVzID0gaW52YWxpZGF0b3IucHJvcCgnYWN0aW9uVGlsZXMnKTtcbiAgICAgICAgYWN0aW9ucyA9IGludmFsaWRhdG9yLnByb3AoJ3Byb3ZpZGVkQWN0aW9ucycpO1xuICAgICAgICByZXR1cm4gYWN0aW9uVGlsZXMucmVkdWNlKChyZXMsIHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzLmNvbmNhdChhY3Rpb25zLm1hcChmdW5jdGlvbihhY3QpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGFjdGlvbjogYWN0LFxuICAgICAgICAgICAgICBsb2NhdGlvbjogdGlsZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH0sXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKGZvcndhcmRlZCkge1xuICAgICAgICB0aGlzLnByZXBhcmVBY3Rpb25UaWxlKGZvcndhcmRlZC5sb2NhdGlvbik7XG4gICAgICAgIHJldHVybiBmb3J3YXJkZWQubG9jYXRpb24ucHJvdmlkZWRBY3Rpb25zLmFkZChmb3J3YXJkZWQuYWN0aW9uKTtcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24oZm9yd2FyZGVkKSB7XG4gICAgICAgIHJldHVybiBmb3J3YXJkZWQubG9jYXRpb24ucHJvdmlkZWRBY3Rpb25zLnJlbW92ZShmb3J3YXJkZWQuYWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIFRpbGVkQWN0aW9uUHJvdmlkZXIucHJvdG90eXBlLmFjdGlvblRpbGVzQ29vcmQgPSBbXG4gICAge1xuICAgICAgeDogMCxcbiAgICAgIHk6IC0xXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiAtMSxcbiAgICAgIHk6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfSxcbiAgICB7XG4gICAgICB4OiArMSxcbiAgICAgIHk6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiArMVxuICAgIH1cbiAgXTtcblxuICByZXR1cm4gVGlsZWRBY3Rpb25Qcm92aWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1RpbGVkQWN0aW9uUHJvdmlkZXIuanMubWFwXG4iLCJ2YXIgUGF0aEZpbmRlciwgUGF0aFdhbGssIFRhcmdldEFjdGlvbiwgV2Fsa0FjdGlvbjtcblxuUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpO1xuXG5QYXRoV2FsayA9IHJlcXVpcmUoJy4uL1BhdGhXYWxrJyk7XG5cblRhcmdldEFjdGlvbiA9IHJlcXVpcmUoJy4vVGFyZ2V0QWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa0FjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2Fsa0FjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gICAgZXhlY3V0ZSgpIHtcbiAgICAgIGlmICh0aGlzLmFjdG9yLndhbGsgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFjdG9yLndhbGsuaW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLndhbGsgPSB0aGlzLmFjdG9yLndhbGsgPSBuZXcgUGF0aFdhbGsodGhpcy5hY3RvciwgdGhpcy5wYXRoRmluZGVyKTtcbiAgICAgIHRoaXMuYWN0b3Iud2Fsay5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmFjdG9yLndhbGsub24oJ2ludGVycnVwdGVkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuYWN0b3Iud2Fsay5zdGFydCgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgICBpZiAodGhpcy53YWxrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGsuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbGlkVGFyZ2V0KCkge1xuICAgICAgdGhpcy5wYXRoRmluZGVyLmNhbGN1bCgpO1xuICAgICAgcmV0dXJuIHRoaXMucGF0aEZpbmRlci5zb2x1dGlvbiAhPSBudWxsO1xuICAgIH1cblxuICB9O1xuXG4gIFdhbGtBY3Rpb24ucHJvcGVydGllcyh7XG4gICAgcGF0aEZpbmRlcjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoRmluZGVyKHRoaXMuYWN0b3IudGlsZS5jb250YWluZXIsIHRoaXMuYWN0b3IudGlsZSwgdGhpcy50YXJnZXQsIHtcbiAgICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuYWN0b3IuY2FuR29PblRpbGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rvci5jYW5Hb09uVGlsZSh0aWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aWxlLndhbGthYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV2Fsa0FjdGlvbjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9hY3Rpb25zL1dhbGtBY3Rpb24uanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJBdXRvbWF0aWNEb29yXCI6IHJlcXVpcmUoXCIuL0F1dG9tYXRpY0Rvb3JcIiksXG4gIFwiQ2hhcmFjdGVyXCI6IHJlcXVpcmUoXCIuL0NoYXJhY3RlclwiKSxcbiAgXCJDaGFyYWN0ZXJBSVwiOiByZXF1aXJlKFwiLi9DaGFyYWN0ZXJBSVwiKSxcbiAgXCJEYW1hZ2VQcm9wYWdhdGlvblwiOiByZXF1aXJlKFwiLi9EYW1hZ2VQcm9wYWdhdGlvblwiKSxcbiAgXCJEYW1hZ2VhYmxlXCI6IHJlcXVpcmUoXCIuL0RhbWFnZWFibGVcIiksXG4gIFwiRG9vclwiOiByZXF1aXJlKFwiLi9Eb29yXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJGbG9vclwiOiByZXF1aXJlKFwiLi9GbG9vclwiKSxcbiAgXCJHYW1lXCI6IHJlcXVpcmUoXCIuL0dhbWVcIiksXG4gIFwiTGluZU9mU2lnaHRcIjogcmVxdWlyZShcIi4vTGluZU9mU2lnaHRcIiksXG4gIFwiTWFwXCI6IHJlcXVpcmUoXCIuL01hcFwiKSxcbiAgXCJPYnN0YWNsZVwiOiByZXF1aXJlKFwiLi9PYnN0YWNsZVwiKSxcbiAgXCJQYXRoV2Fsa1wiOiByZXF1aXJlKFwiLi9QYXRoV2Fsa1wiKSxcbiAgXCJQZXJzb25hbFdlYXBvblwiOiByZXF1aXJlKFwiLi9QZXJzb25hbFdlYXBvblwiKSxcbiAgXCJQbGF5ZXJcIjogcmVxdWlyZShcIi4vUGxheWVyXCIpLFxuICBcIlByb2plY3RpbGVcIjogcmVxdWlyZShcIi4vUHJvamVjdGlsZVwiKSxcbiAgXCJSb29tR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL1Jvb21HZW5lcmF0b3JcIiksXG4gIFwiU2hpcFdlYXBvblwiOiByZXF1aXJlKFwiLi9TaGlwV2VhcG9uXCIpLFxuICBcIlN0YXJNYXBHZW5lcmF0b3JcIjogcmVxdWlyZShcIi4vU3Rhck1hcEdlbmVyYXRvclwiKSxcbiAgXCJTdGFyU3lzdGVtXCI6IHJlcXVpcmUoXCIuL1N0YXJTeXN0ZW1cIiksXG4gIFwiVmlld1wiOiByZXF1aXJlKFwiLi9WaWV3XCIpLFxuICBcIlZpc2lvbkNhbGN1bGF0b3JcIjogcmVxdWlyZShcIi4vVmlzaW9uQ2FsY3VsYXRvclwiKSxcbiAgXCJhY3Rpb25zXCI6IHtcbiAgICBcIkFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0FjdGlvblwiKSxcbiAgICBcIkFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJBdHRhY2tBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BdHRhY2tBY3Rpb25cIiksXG4gICAgXCJBdHRhY2tNb3ZlQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvblwiKSxcbiAgICBcIlNpbXBsZUFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJUYXJnZXRBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UYXJnZXRBY3Rpb25cIiksXG4gICAgXCJUaWxlZEFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIldhbGtBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9XYWxrQWN0aW9uXCIpLFxuICB9LFxufSIsInZhciBsaWJzO1xuXG5saWJzID0gcmVxdWlyZSgnLi9saWJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgbGlicywge1xuICBncmlkczogcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLFxuICBQYXRoRmluZGVyOiByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKSxcbiAgc3RyaW5nczogcmVxdWlyZSgncGFyYWxsZWxpby1zdHJpbmdzJyksXG4gIHRpbGVzOiByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJyksXG4gIFRpbWluZzogcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKSxcbiAgd2lyaW5nOiByZXF1aXJlKCdwYXJhbGxlbGlvLXdpcmluZycpLFxuICBTcGFyazogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9wYXJhbGxlbGlvLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBHcmlkPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtHcmlkLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9R3JpZDt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkdyaWQ9R3JpZDt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLkdyaWQ9R3JpZDt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBFdmVudEVtaXR0ZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFdmVudEVtaXR0ZXJcIikgPyBkZXBlbmRlbmNpZXMuRXZlbnRFbWl0dGVyIDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcbnZhciBHcmlkQ2VsbCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkdyaWRDZWxsXCIpID8gZGVwZW5kZW5jaWVzLkdyaWRDZWxsIDogcmVxdWlyZSgnLi9HcmlkQ2VsbCcpO1xudmFyIEdyaWRSb3cgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJHcmlkUm93XCIpID8gZGVwZW5kZW5jaWVzLkdyaWRSb3cgOiByZXF1aXJlKCcuL0dyaWRSb3cnKTtcbnZhciBHcmlkO1xuR3JpZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIHZhciByb3csIHNwb3Q7XG4gICAgICBpZiAoIWNlbGwpIHtcbiAgICAgICAgY2VsbCA9IG5ldyBHcmlkQ2VsbCgpO1xuICAgICAgfVxuICAgICAgc3BvdCA9IHRoaXMuZ2V0RnJlZVNwb3QoKTtcbiAgICAgIHJvdyA9IHRoaXMucm93cy5nZXQoc3BvdC5yb3cpO1xuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcm93ID0gdGhpcy5hZGRSb3coKTtcbiAgICAgIH1cbiAgICAgIHJvdy5hZGRDZWxsKGNlbGwpO1xuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuXG4gICAgYWRkUm93KHJvdyA9IG51bGwpIHtcbiAgICAgIGlmICghcm93KSB7XG4gICAgICAgIHJvdyA9IG5ldyBHcmlkUm93KCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJvd3MucHVzaChyb3cpO1xuICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBnZXRGcmVlU3BvdCgpIHtcbiAgICAgIHZhciBzcG90O1xuICAgICAgc3BvdCA9IG51bGw7XG4gICAgICB0aGlzLnJvd3Muc29tZSgocm93KSA9PiB7XG4gICAgICAgIGlmIChyb3cuY2VsbHMubGVuZ3RoIDwgdGhpcy5tYXhDb2x1bW5zKSB7XG4gICAgICAgICAgcmV0dXJuIHNwb3QgPSB7XG4gICAgICAgICAgICByb3c6IHJvdy5yb3dQb3NpdGlvbixcbiAgICAgICAgICAgIGNvbHVtbjogcm93LmNlbGxzLmxlbmd0aFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFzcG90KSB7XG4gICAgICAgIGlmICh0aGlzLm1heENvbHVtbnMgPiB0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogdGhpcy5yb3dzLmxlbmd0aCxcbiAgICAgICAgICAgIGNvbHVtbjogMFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogMCxcbiAgICAgICAgICAgIGNvbHVtbjogdGhpcy5tYXhDb2x1bW5zICsgMVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzcG90O1xuICAgIH1cblxuICB9O1xuXG4gIEdyaWQuZXh0ZW5kKEV2ZW50RW1pdHRlcik7XG5cbiAgR3JpZC5wcm9wZXJ0aWVzKHtcbiAgICByb3dzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlLFxuICAgICAgaXRlbUFkZGVkOiBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIHJvdy5ncmlkID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIGlmIChyb3cuZ3JpZCA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiByb3cuZ3JpZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1heENvbHVtbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHJvd3M7XG4gICAgICAgIHJvd3MgPSBpbnZhbGlkYXRvci5wcm9wKCdyb3dzJyk7XG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZShmdW5jdGlvbihtYXgsIHJvdykge1xuICAgICAgICAgIHJldHVybiBNYXRoLm1heChtYXgsIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgcm93KS5sZW5ndGgpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oR3JpZCk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBHcmlkQ2VsbD1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7R3JpZENlbGwuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1HcmlkQ2VsbDt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkdyaWRDZWxsPUdyaWRDZWxsO31lbHNle2lmKHRoaXMuUGFyYWxsZWxpbz09bnVsbCl7dGhpcy5QYXJhbGxlbGlvPXt9O310aGlzLlBhcmFsbGVsaW8uR3JpZENlbGw9R3JpZENlbGw7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgRXZlbnRFbWl0dGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRFbWl0dGVyXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50RW1pdHRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG52YXIgR3JpZENlbGw7XG5HcmlkQ2VsbCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZENlbGwgZXh0ZW5kcyBFbGVtZW50IHt9O1xuXG4gIEdyaWRDZWxsLmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIEdyaWRDZWxsLnByb3BlcnRpZXMoe1xuICAgIGdyaWQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2dyaWQnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByb3c6IHt9LFxuICAgIGNvbHVtblBvc2l0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciByb3c7XG4gICAgICAgIHJvdyA9IGludmFsaWRhdG9yLnByb3AoJ3JvdycpO1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgcm93KS5pbmRleE9mKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB3aWR0aDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gMSAvIGludmFsaWRhdG9yLnByb3AoJ2NlbGxzJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxlZnQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3dpZHRoJykgKiBpbnZhbGlkYXRvci5wcm9wKCdjb2x1bW5Qb3NpdGlvbicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3dpZHRoJykgKiAoaW52YWxpZGF0b3IucHJvcCgnY29sdW1uUG9zaXRpb24nKSArIDEpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdoZWlnaHQnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3A6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ3RvcCcsIGludmFsaWRhdG9yLnByb3AoJ3JvdycpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdHRvbToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnYm90dG9tJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWRDZWxsO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oR3JpZENlbGwpO30pOyIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgR3JpZFJvdz1kZWZpbml0aW9uKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIj9QYXJhbGxlbGlvOnRoaXMuUGFyYWxsZWxpbyk7R3JpZFJvdy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUdyaWRSb3c7fWVsc2V7aWYodHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiJiZQYXJhbGxlbGlvIT09bnVsbCl7UGFyYWxsZWxpby5HcmlkUm93PUdyaWRSb3c7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5HcmlkUm93PUdyaWRSb3c7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBFbGVtZW50ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRWxlbWVudFwiKSA/IGRlcGVuZGVuY2llcy5FbGVtZW50IDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG52YXIgRXZlbnRFbWl0dGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRFbWl0dGVyXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50RW1pdHRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEVtaXR0ZXI7XG52YXIgR3JpZENlbGwgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJHcmlkQ2VsbFwiKSA/IGRlcGVuZGVuY2llcy5HcmlkQ2VsbCA6IHJlcXVpcmUoJy4vR3JpZENlbGwnKTtcbnZhciBHcmlkUm93O1xuR3JpZFJvdyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgR3JpZFJvdyBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFkZENlbGwoY2VsbCA9IG51bGwpIHtcbiAgICAgIGlmICghY2VsbCkge1xuICAgICAgICBjZWxsID0gbmV3IEdyaWRDZWxsKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG5cbiAgfTtcblxuICBHcmlkUm93LmV4dGVuZChFdmVudEVtaXR0ZXIpO1xuXG4gIEdyaWRSb3cucHJvcGVydGllcyh7XG4gICAgZ3JpZDoge30sXG4gICAgY2VsbHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKGNlbGwpIHtcbiAgICAgICAgcmV0dXJuIGNlbGwucm93ID0gdGhpcztcbiAgICAgIH0sXG4gICAgICBpdGVtUmVtb3ZlZDogZnVuY3Rpb24oY2VsbCkge1xuICAgICAgICBpZiAoY2VsbC5yb3cgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gY2VsbC5yb3cgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByb3dQb3NpdGlvbjoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgZ3JpZDtcbiAgICAgICAgZ3JpZCA9IGludmFsaWRhdG9yLnByb3AoJ2dyaWQnKTtcbiAgICAgICAgaWYgKGdyaWQpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgncm93cycsIGdyaWQpLmluZGV4T2YodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gMSAvIGludmFsaWRhdG9yLnByb3AoJ3Jvd3MnLCBpbnZhbGlkYXRvci5wcm9wKCdncmlkJykpLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvcDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnaGVpZ2h0JykgKiBpbnZhbGlkYXRvci5wcm9wKCdyb3dQb3NpdGlvbicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYm90dG9tOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdoZWlnaHQnKSAqIChpbnZhbGlkYXRvci5wcm9wKCdyb3dQb3NpdGlvbicpICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZFJvdztcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKEdyaWRSb3cpO30pOyIsImlmKG1vZHVsZSl7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEdyaWQ6IHJlcXVpcmUoJy4vR3JpZC5qcycpLFxuICAgIEdyaWRDZWxsOiByZXF1aXJlKCcuL0dyaWRDZWxsLmpzJyksXG4gICAgR3JpZFJvdzogcmVxdWlyZSgnLi9HcmlkUm93LmpzJylcbiAgfTtcbn0iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEJpbmRlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QmluZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9QmluZGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQmluZGVyPUJpbmRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkJpbmRlcj1CaW5kZXI7fX19KShmdW5jdGlvbigpe1xudmFyIEJpbmRlcjtcbkJpbmRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQmluZGVyIHtcbiAgICBiaW5kKCkge1xuICAgICAgaWYgKCF0aGlzLmJpbmRlZCAmJiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgICAgdGhpcy5kb0JpbmQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmJpbmRlZCA9IHRydWU7XG4gICAgfVxuICAgIGRvQmluZCgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuICAgIHVuYmluZCgpIHtcbiAgICAgIGlmICh0aGlzLmJpbmRlZCAmJiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgICAgdGhpcy5kb1VuYmluZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYmluZGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG4gICAgZXF1YWxzKGJpbmRlcikge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuY29tcGFyZVJlZmVyZWQoYmluZGVyLCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0UmVmKCkge31cbiAgICBzdGF0aWMgY29tcGFyZVJlZmVyZWQob2JqMSwgb2JqMikge1xuICAgICAgcmV0dXJuIG9iajEgPT09IG9iajIgfHwgKChvYmoxICE9IG51bGwpICYmIChvYmoyICE9IG51bGwpICYmIG9iajEuY29uc3RydWN0b3IgPT09IG9iajIuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlUmVmKG9iajEucmVmLCBvYmoyLnJlZikpO1xuICAgIH1cbiAgICBzdGF0aWMgY29tcGFyZVJlZihyZWYxLCByZWYyKSB7XG4gICAgICByZXR1cm4gKHJlZjEgIT0gbnVsbCkgJiYgKHJlZjIgIT0gbnVsbCkgJiYgKHJlZjEgPT09IHJlZjIgfHwgKEFycmF5LmlzQXJyYXkocmVmMSkgJiYgQXJyYXkuaXNBcnJheShyZWYxKSAmJiByZWYxLmV2ZXJ5KCh2YWwsIGkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQocmVmMVtpXSwgcmVmMltpXSk7XG4gICAgICB9KSkgfHwgKHR5cGVvZiByZWYxID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWYyID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5rZXlzKHJlZjEpLmpvaW4oKSA9PT0gT2JqZWN0LmtleXMocmVmMikuam9pbigpICYmIE9iamVjdC5rZXlzKHJlZjEpLmV2ZXJ5KChrZXkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQocmVmMVtrZXldLCByZWYyW2tleV0pO1xuICAgICAgfSkpKTtcbiAgICB9XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCaW5kZXIucHJvdG90eXBlLCAncmVmJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZWYoKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gQmluZGVyO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihCaW5kZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9CaW5kZXIuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENvbGxlY3Rpb249ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0NvbGxlY3Rpb24uZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Db2xsZWN0aW9uO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ29sbGVjdGlvbj1Db2xsZWN0aW9uO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ29sbGVjdGlvbj1Db2xsZWN0aW9uO319fSkoZnVuY3Rpb24oKXtcbnZhciBDb2xsZWN0aW9uO1xuQ29sbGVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29sbGVjdGlvbiB7XG4gICAgY29uc3RydWN0b3IoYXJyKSB7XG4gICAgICBpZiAoYXJyICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcnIudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKTtcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IGFycjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hcnJheSA9IFthcnJdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hcnJheSA9IFtdO1xuICAgICAgfVxuICAgIH1cbiAgICBjaGFuZ2VkKCkge31cbiAgICBjaGVja0NoYW5nZXMob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgaWYgKGNvbXBhcmVGdW5jdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIG9sZCA9IHRoaXMuY29weShvbGQuc2xpY2UoKSk7XG4gICAgICByZXR1cm4gdGhpcy5jb3VudCgpICE9PSBvbGQubGVuZ3RoIHx8IChvcmRlcmVkID8gdGhpcy5zb21lKGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgICAgICByZXR1cm4gIWNvbXBhcmVGdW5jdGlvbihvbGQuZ2V0KGkpLCB2YWwpO1xuICAgICAgfSkgOiB0aGlzLnNvbWUoZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbihiKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVGdW5jdGlvbihhLCBiKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSk7XG4gICAgfVxuICAgIGdldChpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV07XG4gICAgfVxuICAgIHNldChpLCB2YWwpIHtcbiAgICAgIHZhciBvbGQ7XG4gICAgICBpZiAodGhpcy5fYXJyYXlbaV0gIT09IHZhbCkge1xuICAgICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgICAgdGhpcy5fYXJyYXlbaV0gPSB2YWw7XG4gICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgYWRkKHZhbCkge1xuICAgICAgaWYgKCF0aGlzLl9hcnJheS5pbmNsdWRlcyh2YWwpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2godmFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlKHZhbCkge1xuICAgICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcGx1Y2soZm4pIHtcbiAgICAgIHZhciBmb3VuZCwgaW5kZXgsIG9sZDtcbiAgICAgIGluZGV4ID0gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZuKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICBmb3VuZCA9IHRoaXMuX2FycmF5W2luZGV4XTtcbiAgICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB0b0FycmF5KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5LnNsaWNlKCk7XG4gICAgfVxuICAgIGNvdW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aDtcbiAgICB9XG4gICAgc3RhdGljIG5ld1N1YkNsYXNzKGZuLCBhcnIpIHtcbiAgICAgIHZhciBTdWJDbGFzcztcbiAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIFN1YkNsYXNzID0gY2xhc3MgZXh0ZW5kcyB0aGlzIHt9O1xuICAgICAgICBPYmplY3QuYXNzaWduKFN1YkNsYXNzLnByb3RvdHlwZSwgZm4pO1xuICAgICAgICByZXR1cm4gbmV3IFN1YkNsYXNzKGFycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29weShhcnIpIHtcbiAgICAgIHZhciBjb2xsO1xuICAgICAgaWYgKGFyciA9PSBudWxsKSB7XG4gICAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgfVxuICAgICAgY29sbCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGFycik7XG4gICAgICByZXR1cm4gY29sbDtcbiAgICB9XG4gICAgZXF1YWxzKGFycikge1xuICAgICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuIGFycltpXSA9PT0gdmFsO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGdldEFkZGVkRnJvbShhcnIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gIWFyci5pbmNsdWRlcyhpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRSZW1vdmVkRnJvbShhcnIpIHtcbiAgICAgIHJldHVybiBhcnIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pbmNsdWRlcyhpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXTtcbiAgQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucyA9IFsnY29uY2F0JywgJ2ZpbHRlcicsICdzbGljZSddO1xuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXTtcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZyk7XG4gICAgfTtcbiAgfSk7XG4gIENvbGxlY3Rpb24ucmVhZExpc3RGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbihmdW5jdCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvcHkodGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZykpO1xuICAgIH07XG4gIH0pO1xuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICB2YXIgb2xkLCByZXM7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHJlcyA9IHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gQ29sbGVjdGlvbjtcbn0pLmNhbGwodGhpcyk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKTtcbiAgfVxufSk7XG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBTeW1ib2wgIT09IG51bGwgPyBTeW1ib2wuaXRlcmF0b3IgOiB2b2lkIDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH07XG59XG5yZXR1cm4oQ29sbGVjdGlvbik7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0NvbGxlY3Rpb24uanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEVsZW1lbnQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0VsZW1lbnQuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1FbGVtZW50O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRWxlbWVudD1FbGVtZW50O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuRWxlbWVudD1FbGVtZW50O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5Qcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHknKTtcbnZhciBNaXhhYmxlID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiTWl4YWJsZVwiKSA/IGRlcGVuZGVuY2llcy5NaXhhYmxlIDogcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG52YXIgRWxlbWVudDtcbkVsZW1lbnQgPSBjbGFzcyBFbGVtZW50IGV4dGVuZHMgTWl4YWJsZSB7XG4gIHRhcChuYW1lKSB7XG4gICAgdmFyIGFyZ3M7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBuYW1lLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNhbGxiYWNrKG5hbWUpIHtcbiAgICBpZiAodGhpcy5fY2FsbGJhY2tzID09IG51bGwpIHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIH1cbiAgICBpZiAodGhpcy5fY2FsbGJhY2tzW25hbWVdID09IG51bGwpIHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXS5vd25lciA9IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jYWxsYmFja3NbbmFtZV07XG4gIH1cblxuICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgaWYgKHRoaXMuX3Byb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFsnX3Byb3BlcnRpZXMnXS5jb25jYXQodGhpcy5fcHJvcGVydGllcy5tYXAoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICByZXR1cm4gcHJvcC5uYW1lO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgdmFyIGksIGxlbiwgb3B0aW9ucywgcHJvcGVydHksIHJlZiwgcmVzdWx0cztcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICByZWYgPSB0aGlzLl9wcm9wZXJ0aWVzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3BlcnR5ID0gcmVmW2ldO1xuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcGVydHkub3B0aW9ucyk7XG4gICAgICAgIHJlc3VsdHMucHVzaCgobmV3IFByb3BlcnR5KHByb3BlcnR5Lm5hbWUsIG9wdGlvbnMpKS5iaW5kKHRhcmdldCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHByb3BlcnR5KHByb3AsIGRlc2MpIHtcbiAgICByZXR1cm4gKG5ldyBQcm9wZXJ0eShwcm9wLCBkZXNjKSkuYmluZCh0aGlzLnByb3RvdHlwZSk7XG4gIH1cblxuICBzdGF0aWMgcHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGRlc2MsIHByb3AsIHJlc3VsdHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAocHJvcCBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBkZXNjID0gcHJvcGVydGllc1twcm9wXTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnByb3BlcnR5KHByb3AsIGRlc2MpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxufTtcblxucmV0dXJuKEVsZW1lbnQpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbGVtZW50LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBFdmVudEJpbmQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0V2ZW50QmluZC5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUV2ZW50QmluZDt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkV2ZW50QmluZD1FdmVudEJpbmQ7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5FdmVudEJpbmQ9RXZlbnRCaW5kO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmluZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmluZGVyXCIpID8gZGVwZW5kZW5jaWVzLkJpbmRlciA6IHJlcXVpcmUoJy4vQmluZGVyJyk7XG52YXIgRXZlbnRCaW5kO1xuRXZlbnRCaW5kID0gY2xhc3MgRXZlbnRCaW5kIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50MTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDE7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9XG5cbiAgZ2V0UmVmKCkge1xuICAgIHJldHVybiB7XG4gICAgICBldmVudDogdGhpcy5ldmVudCxcbiAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgIH07XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzKGV2ZW50QmluZCkge1xuICAgIHJldHVybiBzdXBlci5lcXVhbHMoZXZlbnRCaW5kKSAmJiBldmVudEJpbmQuZXZlbnQgPT09IHRoaXMuZXZlbnQ7XG4gIH1cblxuICBtYXRjaChldmVudCwgdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50ID09PSB0aGlzLmV2ZW50ICYmIHRhcmdldCA9PT0gdGhpcy50YXJnZXQ7XG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xuICAgIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxufTtcblxucmV0dXJuKEV2ZW50QmluZCk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0V2ZW50QmluZC5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgRXZlbnRFbWl0dGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtFdmVudEVtaXR0ZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1FdmVudEVtaXR0ZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5FdmVudEVtaXR0ZXI9RXZlbnRFbWl0dGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuRXZlbnRFbWl0dGVyPUV2ZW50RW1pdHRlcjt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBFdmVudEVtaXR0ZXIge1xuICAgIGdldEFsbEV2ZW50cygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICB9XG4gICAgZ2V0TGlzdGVuZXJzKGUpIHtcbiAgICAgIHZhciBldmVudHM7XG4gICAgICBldmVudHMgPSB0aGlzLmdldEFsbEV2ZW50cygpO1xuICAgICAgcmV0dXJuIGV2ZW50c1tlXSB8fCAoZXZlbnRzW2VdID0gW10pO1xuICAgIH1cbiAgICBoYXNMaXN0ZW5lcihlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGlzdGVuZXJzKGUpLmluY2x1ZGVzKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgYWRkTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICghdGhpcy5oYXNMaXN0ZW5lcihlLCBsaXN0ZW5lcikpIHtcbiAgICAgICAgdGhpcy5nZXRMaXN0ZW5lcnMoZSkucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyQWRkZWQoZSwgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBsaXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKSB7fVxuICAgIHJlbW92ZUxpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgaW5kZXgsIGxpc3RlbmVycztcbiAgICAgIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXJzKGUpO1xuICAgICAgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lclJlbW92ZWQoZSwgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBsaXN0ZW5lclJlbW92ZWQoZSwgbGlzdGVuZXIpIHt9XG4gICAgZW1pdEV2ZW50KGUsIC4uLmFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKS5zbGljZSgpO1xuICAgICAgcmV0dXJuIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lciguLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0RXZlbnQ7XG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUudHJpZ2dlciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEV2ZW50O1xuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuICByZXR1cm4gRXZlbnRFbWl0dGVyO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihFdmVudEVtaXR0ZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEVtaXR0ZXIuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEludmFsaWRhdG9yPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtJbnZhbGlkYXRvci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUludmFsaWRhdG9yO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuSW52YWxpZGF0b3I9SW52YWxpZGF0b3I7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5JbnZhbGlkYXRvcj1JbnZhbGlkYXRvcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJpbmRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJpbmRlclwiKSA/IGRlcGVuZGVuY2llcy5CaW5kZXIgOiByZXF1aXJlKCcuL0JpbmRlcicpO1xudmFyIEV2ZW50QmluZCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkV2ZW50QmluZFwiKSA/IGRlcGVuZGVuY2llcy5FdmVudEJpbmQgOiByZXF1aXJlKCcuL0V2ZW50QmluZCcpO1xudmFyIEludmFsaWRhdG9yLCBwbHVjaztcbnBsdWNrID0gZnVuY3Rpb24oYXJyLCBmbikge1xuICB2YXIgZm91bmQsIGluZGV4O1xuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XTtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbkludmFsaWRhdG9yID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBJbnZhbGlkYXRvciBleHRlbmRzIEJpbmRlciB7XG4gICAgY29uc3RydWN0b3IocHJvcGVydHksIG9iaiA9IG51bGwpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgICB0aGlzLm9iaiA9IG9iajtcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW107XG4gICAgICB0aGlzLnJlY3ljbGVkID0gW107XG4gICAgICB0aGlzLnVua25vd25zID0gW107XG4gICAgICB0aGlzLnN0cmljdCA9IHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0O1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH07XG4gICAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjay5vd25lciA9IHRoaXM7XG4gICAgfVxuXG4gICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgIHZhciBmdW5jdE5hbWU7XG4gICAgICB0aGlzLmludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnR5KCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH0gZWxzZSBpZiAoKHRoaXMucHJvcGVydHkgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMucHJvcGVydHkuaW52YWxpZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnR5LmludmFsaWRhdGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5wcm9wZXJ0eS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMucHJvcGVydHkuc2xpY2UoMSk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vYmpbZnVuY3ROYW1lXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub2JqW2Z1bmN0TmFtZV0oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vYmpbdGhpcy5wcm9wZXJ0eV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdW5rbm93bigpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS51bmtub3duID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydHkudW5rbm93bigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQmluZGVyKG5ldyBFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spKTtcbiAgICB9XG5cbiAgICBhZGRCaW5kZXIoYmluZGVyKSB7XG4gICAgICBpZiAoYmluZGVyLmNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgICAgYmluZGVyLmNhbGxiYWNrID0gdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2s7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnNvbWUoZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcik7XG4gICAgICB9KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChwbHVjayh0aGlzLnJlY3ljbGVkLCBmdW5jdGlvbihldmVudEJpbmQpIHtcbiAgICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xuICAgICAgICB9KSB8fCBiaW5kZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFVua25vd25DYWxsYmFjayhwcm9wLCB0YXJnZXQpIHtcbiAgICAgIHZhciBjYWxsYmFjaztcbiAgICAgIGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRVbmtub3duKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIH0sIHByb3AsIHRhcmdldCk7XG4gICAgICB9O1xuICAgICAgY2FsbGJhY2sucmVmID0ge1xuICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICB0YXJnZXQ6IHRhcmdldFxuICAgICAgfTtcbiAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBhZGRVbmtub3duKGZuLCBwcm9wLCB0YXJnZXQpIHtcbiAgICAgIGlmICghdGhpcy5maW5kVW5rbm93bihwcm9wLCB0YXJnZXQpKSB7XG4gICAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgICBcInByb3BcIjogcHJvcCxcbiAgICAgICAgICBcInRhcmdldFwiOiB0YXJnZXRcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy51bmtub3ducy5wdXNoKGZuKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5rbm93bigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRVbmtub3duKHByb3AsIHRhcmdldCkge1xuICAgICAgaWYgKChwcm9wICE9IG51bGwpIHx8ICh0YXJnZXQgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5rbm93bnMuZmluZChmdW5jdGlvbih1bmtub3duKSB7XG4gICAgICAgICAgcmV0dXJuIHVua25vd24ucmVmLnByb3AgPT09IHByb3AgJiYgdW5rbm93bi5yZWYudGFyZ2V0ID09PSB0YXJnZXQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV2ZW50KGV2ZW50LCB0YXJnZXQgPSB0aGlzLm9iaikge1xuICAgICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbHVlKHZhbCwgZXZlbnQsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wKHByb3AsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3AgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbmFtZSBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jaGVja0VtaXR0ZXIodGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmFkZEV2ZW50QmluZChwcm9wICsgJ0ludmFsaWRhdGVkJywgdGFyZ2V0LCB0aGlzLmdldFVua25vd25DYWxsYmFjayhwcm9wLCB0YXJnZXQpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUodGFyZ2V0W3Byb3BdLCBwcm9wICsgJ1VwZGF0ZWQnLCB0YXJnZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9wSW5pdGlhdGVkKHByb3AsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICB2YXIgaW5pdGlhdGVkO1xuICAgICAgaW5pdGlhdGVkID0gdGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UocHJvcCkuaW5pdGlhdGVkO1xuICAgICAgaWYgKCFpbml0aWF0ZWQgJiYgdGhpcy5jaGVja0VtaXR0ZXIodGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmV2ZW50KHByb3AgKyAnVXBkYXRlZCcsIHRhcmdldCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5pdGlhdGVkO1xuICAgIH1cblxuICAgIGZ1bmN0KGZ1bmN0KSB7XG4gICAgICB2YXIgaW52YWxpZGF0b3IsIHJlcztcbiAgICAgIGludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bigoKSA9PiB7XG4gICAgICAgICAgdmFyIHJlczI7XG4gICAgICAgICAgcmVzMiA9IGZ1bmN0KGludmFsaWRhdG9yKTtcbiAgICAgICAgICBpZiAocmVzICE9PSByZXMyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBpbnZhbGlkYXRvcik7XG4gICAgICB9KTtcbiAgICAgIHJlcyA9IGZ1bmN0KGludmFsaWRhdG9yKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2goaW52YWxpZGF0b3IpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICB2YWxpZGF0ZVVua25vd25zKHByb3AsIHRhcmdldCA9IHRoaXMub2JqKSB7XG4gICAgICB2YXIgdW5rbm93bnM7XG4gICAgICB1bmtub3ducyA9IHRoaXMudW5rbm93bnM7XG4gICAgICB0aGlzLnVua25vd25zID0gW107XG4gICAgICByZXR1cm4gdW5rbm93bnMuZm9yRWFjaChmdW5jdGlvbih1bmtub3duKSB7XG4gICAgICAgIHJldHVybiB1bmtub3duKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpc0VtcHR5KCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVjeWNsZShjYWxsYmFjaykge1xuICAgICAgdmFyIGRvbmUsIHJlcztcbiAgICAgIHRoaXMucmVjeWNsZWQgPSB0aGlzLmludmFsaWRhdGlvbkV2ZW50cztcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW107XG4gICAgICBkb25lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnJlY3ljbGVkLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50QmluZC51bmJpbmQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY3ljbGVkID0gW107XG4gICAgICB9O1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHRoaXMsIGRvbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcyA9IGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0VtaXR0ZXIoZW1pdHRlcikge1xuICAgICAgcmV0dXJuIEV2ZW50QmluZC5jaGVja0VtaXR0ZXIoZW1pdHRlciwgdGhpcy5zdHJpY3QpO1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZTtcblxuICByZXR1cm4gSW52YWxpZGF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihJbnZhbGlkYXRvcik7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0ludmFsaWRhdG9yLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBNaXhhYmxlPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtNaXhhYmxlLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9TWl4YWJsZTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLk1peGFibGU9TWl4YWJsZTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLk1peGFibGU9TWl4YWJsZTt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5NaXhhYmxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBNaXhhYmxlIHtcbiAgICBzdGF0aWMgZXh0ZW5kKG9iaikge1xuICAgICAgdGhpcy5FeHRlbnNpb24ubWFrZShvYmosIHRoaXMpO1xuICAgICAgaWYgKG9iai5wcm90b3R5cGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5FeHRlbnNpb24ubWFrZShvYmoucHJvdG90eXBlLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuICB9O1xuICBNaXhhYmxlLkV4dGVuc2lvbiA9IHtcbiAgICBtYWtlOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIGksIGxlbiwgcHJvcCwgcmVmO1xuICAgICAgcmVmID0gdGhpcy5nZXRFeHRlbnNpb25Qcm9wZXJ0aWVzKHNvdXJjZSwgdGFyZ2V0KTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBwcm9wID0gcmVmW2ldO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIHByb3ApO1xuICAgICAgfVxuICAgICAgdGFyZ2V0LmV4dGVuc2lvbnMgPSAodGFyZ2V0LmV4dGVuc2lvbnMgfHwgW10pLmNvbmNhdChbc291cmNlXSk7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZS5leHRlbmRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gc291cmNlLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhbHdheXNGaW5hbDogWydleHRlbmRlZCcsICdleHRlbnNpb25zJywgJ19fc3VwZXJfXycsICdjb25zdHJ1Y3RvciddLFxuICAgIGdldEV4dGVuc2lvblByb3BlcnRpZXM6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgYWx3YXlzRmluYWwsIHByb3BzLCB0YXJnZXRDaGFpbjtcbiAgICAgIGFsd2F5c0ZpbmFsID0gdGhpcy5hbHdheXNGaW5hbDtcbiAgICAgIHRhcmdldENoYWluID0gdGhpcy5nZXRQcm90b3R5cGVDaGFpbih0YXJnZXQpO1xuICAgICAgcHJvcHMgPSBbXTtcbiAgICAgIHRoaXMuZ2V0UHJvdG90eXBlQ2hhaW4oc291cmNlKS5ldmVyeShmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIGV4Y2x1ZGU7XG4gICAgICAgIGlmICghdGFyZ2V0Q2hhaW4uaW5jbHVkZXMob2JqKSkge1xuICAgICAgICAgIGV4Y2x1ZGUgPSBhbHdheXNGaW5hbDtcbiAgICAgICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBleGNsdWRlID0gZXhjbHVkZS5jb25jYXQoc291cmNlLmdldEZpbmFsUHJvcGVydGllcygpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChbXCJsZW5ndGhcIiwgXCJwcm90b3R5cGVcIiwgXCJuYW1lXCJdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvcHMgPSBwcm9wcy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICF0YXJnZXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCIgJiYgaW5kZXhPZi5jYWxsKGV4Y2x1ZGUsIGtleSkgPCAwICYmICFwcm9wcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3AubmFtZSA9PT0ga2V5O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgdmFyIHByb3A7XG4gICAgICAgICAgICBwcm9wID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSk7XG4gICAgICAgICAgICBwcm9wLm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0sXG4gICAgZ2V0UHJvdG90eXBlQ2hhaW46IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGJhc2VQcm90b3R5cGUsIGNoYWluO1xuICAgICAgY2hhaW4gPSBbXTtcbiAgICAgIGJhc2VQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0KTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGNoYWluLnB1c2gob2JqKTtcbiAgICAgICAgaWYgKCEoKG9iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSAmJiBvYmogIT09IE9iamVjdCAmJiBvYmogIT09IGJhc2VQcm90b3R5cGUpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFpbjtcbiAgICB9XG4gIH07XG4gIHJldHVybiBNaXhhYmxlO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihNaXhhYmxlKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvTWl4YWJsZS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgT3ZlcnJpZGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtPdmVycmlkZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1PdmVycmlkZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5PdmVycmlkZXI9T3ZlcnJpZGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuT3ZlcnJpZGVyPU92ZXJyaWRlcjt9fX0pKGZ1bmN0aW9uKCl7XG52YXIgT3ZlcnJpZGVyO1xuT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbJ19vdmVycmlkZXMnXS5jb25jYXQoT2JqZWN0LmtleXModGhpcy5fb3ZlcnJpZGVzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgfVxuICAgIGV4dGVuZGVkKHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuT3ZlcnJpZGUuYXBwbHlNYW55KHRhcmdldCwgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCB0aGlzLl9vdmVycmlkZXMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IgPT09IE92ZXJyaWRlcikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmV4dGVuZGVkID0gdGhpcy5leHRlbmRlZDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIE92ZXJyaWRlci5PdmVycmlkZSA9IHtcbiAgICBtYWtlTWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGZuLCBrZXksIG92ZXJyaWRlLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XG4gICAgICAgIGZuID0gb3ZlcnJpZGVzW2tleV07XG4gICAgICAgIHJlc3VsdHMucHVzaChvdmVycmlkZSA9IHRoaXMubWFrZSh0YXJnZXQsIG5hbWVzcGFjZSwga2V5LCBmbikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBhcHBseU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcbiAgICAgIHZhciBrZXksIG92ZXJyaWRlLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XG4gICAgICAgIG92ZXJyaWRlID0gb3ZlcnJpZGVzW2tleV07XG4gICAgICAgIGlmICh0eXBlb2Ygb3ZlcnJpZGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIG92ZXJyaWRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hcHBseSh0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIGZuTmFtZSwgZm4pIHtcbiAgICAgIHZhciBvdmVycmlkZTtcbiAgICAgIG92ZXJyaWRlID0ge1xuICAgICAgICBmbjoge1xuICAgICAgICAgIGN1cnJlbnQ6IGZuXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6IGZuTmFtZVxuICAgICAgfTtcbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRoJyArIG5hbWVzcGFjZV0gPSBmbjtcbiAgICAgIHJldHVybiBvdmVycmlkZTtcbiAgICB9LFxuICAgIGVtcHR5Rm46IGZ1bmN0aW9uKCkge30sXG4gICAgYXBwbHk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkge1xuICAgICAgdmFyIGZuTmFtZSwgb3ZlcnJpZGVzLCByZWYsIHJlZjEsIHdpdGhvdXQ7XG4gICAgICBmbk5hbWUgPSBvdmVycmlkZS5uYW1lO1xuICAgICAgb3ZlcnJpZGVzID0gdGFyZ2V0Ll9vdmVycmlkZXMgIT0gbnVsbCA/IE9iamVjdC5hc3NpZ24oe30sIHRhcmdldC5fb3ZlcnJpZGVzKSA6IHt9O1xuICAgICAgd2l0aG91dCA9ICgocmVmID0gdGFyZ2V0Ll9vdmVycmlkZXMpICE9IG51bGwgPyAocmVmMSA9IHJlZltmbk5hbWVdKSAhPSBudWxsID8gcmVmMS5mbi5jdXJyZW50IDogdm9pZCAwIDogdm9pZCAwKSB8fCB0YXJnZXRbZm5OYW1lXTtcbiAgICAgIG92ZXJyaWRlID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGUpO1xuICAgICAgaWYgKG92ZXJyaWRlc1tmbk5hbWVdICE9IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUuZm4gPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZXNbZm5OYW1lXS5mbiwgb3ZlcnJpZGUuZm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3ZlcnJpZGUuZm4gPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZS5mbik7XG4gICAgICB9XG4gICAgICBvdmVycmlkZS5mblsnd2l0aG91dCcgKyBuYW1lc3BhY2VdID0gd2l0aG91dCB8fCB0aGlzLmVtcHR5Rm47XG4gICAgICBpZiAod2l0aG91dCA9PSBudWxsKSB7XG4gICAgICAgIG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0ID0gJ3dpdGhvdXQnICsgbmFtZXNwYWNlO1xuICAgICAgfSBlbHNlIGlmIChvdmVycmlkZS5taXNzaW5nV2l0aG91dCkge1xuICAgICAgICBvdmVycmlkZS5mbltvdmVycmlkZS5taXNzaW5nV2l0aG91dF0gPSB3aXRob3V0O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZm5OYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZmluYWxGbiwgZm4sIGtleSwgcmVmMjtcbiAgICAgICAgICBmaW5hbEZuID0gb3ZlcnJpZGUuZm4uY3VycmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAgIHJlZjIgPSBvdmVycmlkZS5mbjtcbiAgICAgICAgICBmb3IgKGtleSBpbiByZWYyKSB7XG4gICAgICAgICAgICBmbiA9IHJlZjJba2V5XTtcbiAgICAgICAgICAgIGZpbmFsRm5ba2V5XSA9IGZuLmJpbmQodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAhPT0gdGhpcykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGZuTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZTogZmluYWxGblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmaW5hbEZuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG92ZXJyaWRlc1tmbk5hbWVdID0gb3ZlcnJpZGU7XG4gICAgICByZXR1cm4gdGFyZ2V0Ll9vdmVycmlkZXMgPSBvdmVycmlkZXM7XG4gICAgfVxuICB9O1xuICByZXR1cm4gT3ZlcnJpZGVyO1xufSkuY2FsbCh0aGlzKTtcbnJldHVybihPdmVycmlkZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuUHJvcGVydHk9UHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5Qcm9wZXJ0eT1Qcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEJhc2ljUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJCYXNpY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkJhc2ljUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eScpO1xudmFyIENvbGxlY3Rpb25Qcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbGxlY3Rpb25Qcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5Jyk7XG52YXIgQ29tcG9zZWRQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbXBvc2VkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ29tcG9zZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5Jyk7XG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHknKTtcbnZhciBDYWxjdWxhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDYWxjdWxhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ2FsY3VsYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xudmFyIEludmFsaWRhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdGVkUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eScpO1xudmFyIEFjdGl2YWJsZVByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQWN0aXZhYmxlUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQWN0aXZhYmxlUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQWN0aXZhYmxlUHJvcGVydHknKTtcbnZhciBVcGRhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJVcGRhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuVXBkYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eScpO1xudmFyIFByb3BlcnR5T3duZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJQcm9wZXJ0eU93bmVyXCIpID8gZGVwZW5kZW5jaWVzLlByb3BlcnR5T3duZXIgOiByZXF1aXJlKCcuL1Byb3BlcnR5T3duZXInKTtcbnZhciBNaXhhYmxlID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiTWl4YWJsZVwiKSA/IGRlcGVuZGVuY2llcy5NaXhhYmxlIDogcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG52YXIgUHJvcGVydHk7XG5Qcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUHJvcGVydHkge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgYmluZCh0YXJnZXQpIHtcbiAgICAgIHZhciBwYXJlbnQsIHByb3A7XG4gICAgICBwcm9wID0gdGhpcztcbiAgICAgIGlmICghKHR5cGVvZiB0YXJnZXQuZ2V0UHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgdGFyZ2V0LmdldFByb3BlcnR5KHRoaXMubmFtZSkgPT09IHRoaXMpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0LmdldFByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmICgocGFyZW50ID0gdGFyZ2V0LmdldFByb3BlcnR5KHRoaXMubmFtZSkpICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5vdmVycmlkZShwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0SW5zdGFuY2VUeXBlKCkuYmluZCh0YXJnZXQsIHByb3ApO1xuICAgICAgICB0YXJnZXQuX3Byb3BlcnRpZXMgPSAodGFyZ2V0Ll9wcm9wZXJ0aWVzIHx8IFtdKS5jb25jYXQoW3Byb3BdKTtcbiAgICAgICAgaWYgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgdGFyZ2V0Ll9wcm9wZXJ0aWVzID0gdGFyZ2V0Ll9wcm9wZXJ0aWVzLmZpbHRlcihmdW5jdGlvbihleGlzdGluZykge1xuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nICE9PSBwYXJlbnQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYWtlT3duZXIodGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH1cblxuICAgIG92ZXJyaWRlKHBhcmVudCkge1xuICAgICAgdmFyIGtleSwgcmVmLCByZXN1bHRzLCB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50ID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLnBhcmVudCA9IHBhcmVudC5vcHRpb25zO1xuICAgICAgICByZWYgPSBwYXJlbnQub3B0aW9ucztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGtleSBpbiByZWYpIHtcbiAgICAgICAgICB2YWx1ZSA9IHJlZltrZXldO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zW2tleV0gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5vcHRpb25zW2tleV0ub3ZlcnJpZGVkID0gdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9uc1trZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMub3B0aW9uc1trZXldID0gdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFrZU93bmVyKHRhcmdldCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICghKChyZWYgPSB0YXJnZXQuZXh0ZW5zaW9ucykgIT0gbnVsbCA/IHJlZi5pbmNsdWRlcyhQcm9wZXJ0eU93bmVyLnByb3RvdHlwZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiBNaXhhYmxlLkV4dGVuc2lvbi5tYWtlKFByb3BlcnR5T3duZXIucHJvdG90eXBlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldEluc3RhbmNlVmFyTmFtZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaW5zdGFuY2VWYXJOYW1lIHx8ICdfJyArIHRoaXMubmFtZTtcbiAgICB9XG5cbiAgICBpc0luc3RhbnRpYXRlZChvYmopIHtcbiAgICAgIHJldHVybiBvYmpbdGhpcy5nZXRJbnN0YW5jZVZhck5hbWUoKV0gIT0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZShvYmopIHtcbiAgICAgIHZhciBUeXBlLCB2YXJOYW1lO1xuICAgICAgdmFyTmFtZSA9IHRoaXMuZ2V0SW5zdGFuY2VWYXJOYW1lKCk7XG4gICAgICBpZiAoIXRoaXMuaXNJbnN0YW50aWF0ZWQob2JqKSkge1xuICAgICAgICBUeXBlID0gdGhpcy5nZXRJbnN0YW5jZVR5cGUoKTtcbiAgICAgICAgb2JqW3Zhck5hbWVdID0gbmV3IFR5cGUodGhpcywgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbdmFyTmFtZV07XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2VUeXBlKCkge1xuICAgICAgaWYgKCF0aGlzLmluc3RhbmNlVHlwZSkge1xuICAgICAgICB0aGlzLmNvbXBvc2Vycy5mb3JFYWNoKChjb21wb3NlcikgPT4ge1xuICAgICAgICAgIHJldHVybiBjb21wb3Nlci5jb21wb3NlKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlVHlwZTtcbiAgICB9XG5cbiAgfTtcblxuICBQcm9wZXJ0eS5wcm90b3R5cGUuY29tcG9zZXJzID0gW0NvbXBvc2VkUHJvcGVydHksIENvbGxlY3Rpb25Qcm9wZXJ0eSwgRHluYW1pY1Byb3BlcnR5LCBCYXNpY1Byb3BlcnR5LCBVcGRhdGVkUHJvcGVydHksIENhbGN1bGF0ZWRQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eSwgQWN0aXZhYmxlUHJvcGVydHldO1xuXG4gIHJldHVybiBQcm9wZXJ0eTtcblxufSkuY2FsbCh0aGlzKTtcblxucmV0dXJuKFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFByb3BlcnR5T3duZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1Byb3BlcnR5T3duZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Qcm9wZXJ0eU93bmVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuUHJvcGVydHlPd25lcj1Qcm9wZXJ0eU93bmVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuUHJvcGVydHlPd25lcj1Qcm9wZXJ0eU93bmVyO319fSkoZnVuY3Rpb24oKXtcbnZhciBQcm9wZXJ0eU93bmVyO1xuUHJvcGVydHlPd25lciA9IGNsYXNzIFByb3BlcnR5T3duZXIge1xuICBnZXRQcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMgJiYgdGhpcy5fcHJvcGVydGllcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cbiAgZ2V0UHJvcGVydHlJbnN0YW5jZShuYW1lKSB7XG4gICAgdmFyIHJlcztcbiAgICByZXMgPSB0aGlzLmdldFByb3BlcnR5KG5hbWUpO1xuICAgIGlmIChyZXMpIHtcbiAgICAgIHJldHVybiByZXMuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfVxuICB9XG4gIGdldFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuc2xpY2UoKTtcbiAgfVxuICBnZXRQcm9wZXJ0eUluc3RhbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG4gIGdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuZmlsdGVyKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5pc0luc3RhbnRpYXRlZCh0aGlzKTtcbiAgICB9KS5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG4gIGdldE1hbnVhbERhdGFQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnJlZHVjZSgocmVzLCBwcm9wKSA9PiB7XG4gICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICBpZiAocHJvcC5pc0luc3RhbnRpYXRlZCh0aGlzKSkge1xuICAgICAgICBpbnN0YW5jZSA9IHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5jYWxjdWxhdGVkICYmIGluc3RhbmNlLm1hbnVhbCkge1xuICAgICAgICAgIHJlc1twcm9wLm5hbWVdID0gaW5zdGFuY2UudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSwge30pO1xuICB9XG4gIHNldFByb3BlcnRpZXMoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdmFyIGtleSwgcHJvcCwgdmFsO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHlJbnN0YW5jZShrZXkpO1xuICAgICAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICAgICAgcHJvcC5zZXQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBkZXN0cm95UHJvcGVydGllcygpIHtcbiAgICB0aGlzLmdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICByZXR1cm4gcHJvcC5kZXN0cm95KCk7XG4gICAgfSk7XG4gICAgdGhpcy5fcHJvcGVydGllcyA9IFtdO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGxpc3RlbmVyQWRkZWQoZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgaWYgKHByb3AuZ2V0SW5zdGFuY2VUeXBlKCkucHJvdG90eXBlLmNoYW5nZUV2ZW50TmFtZSA9PT0gZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5saXN0ZW5lckFkZGVkID0gdGhpcy5saXN0ZW5lckFkZGVkO1xuICB9XG59O1xucmV0dXJuKFByb3BlcnR5T3duZXIpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Qcm9wZXJ0eU93bmVyLmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBBY3RpdmFibGVQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QWN0aXZhYmxlUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1BY3RpdmFibGVQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkFjdGl2YWJsZVByb3BlcnR5PUFjdGl2YWJsZVByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQWN0aXZhYmxlUHJvcGVydHk9QWN0aXZhYmxlUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9CYXNpY1Byb3BlcnR5Jyk7XG52YXIgT3ZlcnJpZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiT3ZlcnJpZGVyXCIpID8gZGVwZW5kZW5jaWVzLk92ZXJyaWRlciA6IHJlcXVpcmUoJy4uL092ZXJyaWRlcicpO1xudmFyIEFjdGl2YWJsZVByb3BlcnR5O1xuQWN0aXZhYmxlUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEFjdGl2YWJsZVByb3BlcnR5IGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7XG4gICAgaXNBY3RpdmUoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBtYW51YWxBY3RpdmUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5hY3RpdmU7XG4gICAgfVxuXG4gICAgY2FsbGJhY2tBY3RpdmUoKSB7XG4gICAgICB2YXIgaW52YWxpZGF0b3I7XG4gICAgICBpbnZhbGlkYXRvciA9IHRoaXMuYWN0aXZlSW52YWxpZGF0b3IgfHwgbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcbiAgICAgIGludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5hY3RpdmVGdW5jdCwgaW52YWxpZGF0b3IpO1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSB8fCBpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICBpbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IGludmFsaWRhdG9yO1xuICAgICAgICAgIHRoaXMuYWN0aXZlSW52YWxpZGF0b3IgPSBpbnZhbGlkYXRvcjtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5hY3RpdmUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKEFjdGl2YWJsZVByb3BlcnR5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuYWN0aXZlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5hY3RpdmUgPSBwcm9wLm9wdGlvbnMuYWN0aXZlO1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaXNBY3RpdmUgPSB0aGlzLnByb3RvdHlwZS5tYW51YWxBY3RpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5hY3RpdmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuYWN0aXZlRnVuY3QgPSBwcm9wLm9wdGlvbnMuYWN0aXZlO1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaXNBY3RpdmUgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja0FjdGl2ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIEFjdGl2YWJsZVByb3BlcnR5LmV4dGVuZChPdmVycmlkZXIpO1xuXG4gIEFjdGl2YWJsZVByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvdXQ7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSgpKSB7XG4gICAgICAgIG91dCA9IHRoaXMuZ2V0LndpdGhvdXRBY3RpdmFibGVQcm9wZXJ0eSgpO1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nQ2hhbmdlcykge1xuICAgICAgICAgIHRoaXMuY2hhbmdlZCh0aGlzLnBlbmRpbmdPbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluaXRpYXRlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgfSxcbiAgICBjaGFuZ2VkOiBmdW5jdGlvbihvbGQpIHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSB2b2lkIDA7XG4gICAgICAgIHRoaXMuY2hhbmdlZC53aXRob3V0QWN0aXZhYmxlUHJvcGVydHkob2xkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSB0cnVlO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGVuZGluZ09sZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEFjdGl2YWJsZVByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oQWN0aXZhYmxlUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0FjdGl2YWJsZVByb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBCYXNpY1Byb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtCYXNpY1Byb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9QmFzaWNQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkJhc2ljUHJvcGVydHk9QmFzaWNQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkJhc2ljUHJvcGVydHk9QmFzaWNQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIE1peGFibGUgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJNaXhhYmxlXCIpID8gZGVwZW5kZW5jaWVzLk1peGFibGUgOiByZXF1aXJlKCcuLi9NaXhhYmxlJyk7XG52YXIgQmFzaWNQcm9wZXJ0eTtcbkJhc2ljUHJvcGVydHkgPSBjbGFzcyBCYXNpY1Byb3BlcnR5IGV4dGVuZHMgTWl4YWJsZSB7XG4gIGNvbnN0cnVjdG9yKHByb3BlcnR5LCBvYmopIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiAgICB0aGlzLm9iaiA9IG9iajtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5nZXN0KHRoaXMuZGVmYXVsdCk7XG4gICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gIH1cblxuICBzZXQodmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0QW5kQ2hlY2tDaGFuZ2VzKHZhbCk7XG4gIH1cblxuICBjYWxsYmFja1NldCh2YWwpIHtcbiAgICB0aGlzLmNhbGxPcHRpb25GdW5jdChcInNldFwiLCB2YWwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0QW5kQ2hlY2tDaGFuZ2VzKHZhbCkge1xuICAgIHZhciBvbGQ7XG4gICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKTtcbiAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHZhbCwgdGhpcy52YWx1ZSkpIHtcbiAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsO1xuICAgICAgdGhpcy5tYW51YWwgPSB0cnVlO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2hlY2tDaGFuZ2VzKHZhbCwgb2xkKSB7XG4gICAgcmV0dXJuIHZhbCAhPT0gb2xkO1xuICB9XG5cbiAgZGVzdHJveSgpIHt9XG5cbiAgY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0LCAuLi5hcmdzKSB7XG4gICAgaWYgKHR5cGVvZiBmdW5jdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGZ1bmN0ID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zW2Z1bmN0XTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBmdW5jdC5vdmVycmlkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFyZ3MucHVzaCgoLi4uYXJncykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsT3B0aW9uRnVuY3QoZnVuY3Qub3ZlcnJpZGVkLCAuLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3QuYXBwbHkodGhpcy5vYmosIGFyZ3MpO1xuICB9XG5cbiAgcmV2YWxpZGF0ZWQoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5pbml0aWF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaW5nZXN0KHZhbCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbCA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaW5nZXN0XCIsIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9XG5cbiAgb3V0cHV0KCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLm91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwib3V0cHV0XCIsIHRoaXMudmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VkKG9sZCkge1xuICAgIHRoaXMuY2FsbENoYW5nZWRGdW5jdGlvbnMob2xkKTtcbiAgICBpZiAodHlwZW9mIHRoaXMub2JqLmVtaXRFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMudXBkYXRlRXZlbnROYW1lLCBbb2xkXSk7XG4gICAgICB0aGlzLm9iai5lbWl0RXZlbnQodGhpcy5jaGFuZ2VFdmVudE5hbWUsIFtvbGRdKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcImNoYW5nZVwiLCBvbGQpO1xuICAgIH1cbiAgfVxuXG4gIGhhc0NoYW5nZWRGdW5jdGlvbnMoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgaGFzQ2hhbmdlZEV2ZW50cygpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMub2JqLmdldExpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLm9iai5nZXRMaXN0ZW5lcnModGhpcy5jaGFuZ2VFdmVudE5hbWUpLmxlbmd0aCA+IDA7XG4gIH1cblxuICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcbiAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBCYXNpY1Byb3BlcnR5IHt9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5zZXQgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja1NldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLnNldCA9IHRoaXMucHJvdG90eXBlLnNldEFuZENoZWNrQ2hhbmdlcztcbiAgICB9XG4gICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmRlZmF1bHQgPSBwcm9wLm9wdGlvbnMuZGVmYXVsdDtcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaW5pdGlhdGVkID0gdHlwZW9mIHByb3Aub3B0aW9ucy5kZWZhdWx0ICE9PSAndW5kZWZpbmVkJztcbiAgICByZXR1cm4gdGhpcy5zZXRFdmVudE5hbWVzKHByb3ApO1xuICB9XG5cbiAgc3RhdGljIHNldEV2ZW50TmFtZXMocHJvcCkge1xuICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jaGFuZ2VFdmVudE5hbWUgPSBwcm9wLm9wdGlvbnMuY2hhbmdlRXZlbnROYW1lIHx8IHByb3AubmFtZSArICdDaGFuZ2VkJztcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUudXBkYXRlRXZlbnROYW1lID0gcHJvcC5vcHRpb25zLnVwZGF0ZUV2ZW50TmFtZSB8fCBwcm9wLm5hbWUgKyAnVXBkYXRlZCc7XG4gICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5pbnZhbGlkYXRlRXZlbnROYW1lID0gcHJvcC5vcHRpb25zLmludmFsaWRhdGVFdmVudE5hbWUgfHwgcHJvcC5uYW1lICsgJ0ludmFsaWRhdGVkJztcbiAgfVxuXG4gIHN0YXRpYyBiaW5kKHRhcmdldCwgcHJvcCkge1xuICAgIHZhciBtYWosIG9wdDtcbiAgICBtYWogPSBwcm9wLm5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLm5hbWUuc2xpY2UoMSk7XG4gICAgb3B0ID0ge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAocHJvcC5vcHRpb25zLnNldCAhPT0gZmFsc2UpIHtcbiAgICAgIG9wdC5zZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuc2V0KHZhbCk7XG4gICAgICB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIG9wdCk7XG4gICAgdGFyZ2V0WydnZXQnICsgbWFqXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XG4gICAgfTtcbiAgICBpZiAocHJvcC5vcHRpb25zLnNldCAhPT0gZmFsc2UpIHtcbiAgICAgIHRhcmdldFsnc2V0JyArIG1hal0gPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5zZXQodmFsKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0WydpbnZhbGlkYXRlJyArIG1hal0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuaW52YWxpZGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfVxuXG59O1xuXG5yZXR1cm4oQmFzaWNQcm9wZXJ0eSk7fSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQ2FsY3VsYXRlZFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDYWxjdWxhdGVkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1DYWxjdWxhdGVkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5DYWxjdWxhdGVkUHJvcGVydHk9Q2FsY3VsYXRlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ2FsY3VsYXRlZFByb3BlcnR5PUNhbGN1bGF0ZWRQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xudmFyIER5bmFtaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkR5bmFtaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5EeW5hbWljUHJvcGVydHkgOiByZXF1aXJlKCcuL0R5bmFtaWNQcm9wZXJ0eScpO1xudmFyIE92ZXJyaWRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk92ZXJyaWRlclwiKSA/IGRlcGVuZGVuY2llcy5PdmVycmlkZXIgOiByZXF1aXJlKCcuLi9PdmVycmlkZXInKTtcbnZhciBDYWxjdWxhdGVkUHJvcGVydHk7XG5DYWxjdWxhdGVkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENhbGN1bGF0ZWRQcm9wZXJ0eSBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7XG4gICAgY2FsY3VsKCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuY2FsY3VsRnVuY3QpO1xuICAgICAgdGhpcy5tYW51YWwgPSBmYWxzZTtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2FsY3VsRnVuY3QgPSBwcm9wLm9wdGlvbnMuY2FsY3VsO1xuICAgICAgICBpZiAoIShwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChDYWxjdWxhdGVkUHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQ2FsY3VsYXRlZFByb3BlcnR5LmV4dGVuZChPdmVycmlkZXIpO1xuXG4gIENhbGN1bGF0ZWRQcm9wZXJ0eS5vdmVycmlkZXMoe1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5pdGlhdGVkLCBvbGQ7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICAgIGluaXRpYXRlZCA9IHRoaXMuaW5pdGlhdGVkO1xuICAgICAgICB0aGlzLmNhbGN1bCgpO1xuICAgICAgICBpZiAodGhpcy5jaGVja0NoYW5nZXModGhpcy52YWx1ZSwgb2xkKSkge1xuICAgICAgICAgIGlmIChpbml0aWF0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub2JqLmVtaXRFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMudXBkYXRlRXZlbnROYW1lLCBbb2xkXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBDYWxjdWxhdGVkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihDYWxjdWxhdGVkUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQ29sbGVjdGlvblByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb2xsZWN0aW9uUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Db2xsZWN0aW9uUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Db2xsZWN0aW9uUHJvcGVydHk9Q29sbGVjdGlvblByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ29sbGVjdGlvblByb3BlcnR5PUNvbGxlY3Rpb25Qcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIER5bmFtaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkR5bmFtaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5EeW5hbWljUHJvcGVydHkgOiByZXF1aXJlKCcuL0R5bmFtaWNQcm9wZXJ0eScpO1xudmFyIENvbGxlY3Rpb24gPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDb2xsZWN0aW9uXCIpID8gZGVwZW5kZW5jaWVzLkNvbGxlY3Rpb24gOiByZXF1aXJlKCcuLi9Db2xsZWN0aW9uJyk7XG52YXIgQ29sbGVjdGlvblByb3BlcnR5O1xuQ29sbGVjdGlvblByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb2xsZWN0aW9uUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xuICAgIGluZ2VzdCh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWwgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcImluZ2VzdFwiLCB2YWwpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbC50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB2YWwudG9BcnJheSgpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFt2YWxdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrQ2hhbmdlZEl0ZW1zKHZhbCwgb2xkKSB7XG4gICAgICB2YXIgY29tcGFyZUZ1bmN0aW9uO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLmNvbXBhcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29tcGFyZUZ1bmN0aW9uID0gdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChuZXcgQ29sbGVjdGlvbih2YWwpKS5jaGVja0NoYW5nZXMob2xkLCB0aGlzLmNvbGxlY3Rpb25PcHRpb25zLm9yZGVyZWQsIGNvbXBhcmVGdW5jdGlvbik7XG4gICAgfVxuXG4gICAgb3V0cHV0KCkge1xuICAgICAgdmFyIGNvbCwgcHJvcCwgdmFsdWU7XG4gICAgICB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByb3AgPSB0aGlzO1xuICAgICAgY29sID0gQ29sbGVjdGlvbi5uZXdTdWJDbGFzcyh0aGlzLmNvbGxlY3Rpb25PcHRpb25zLCB2YWx1ZSk7XG4gICAgICBjb2wuY2hhbmdlZCA9IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICByZXR1cm4gcHJvcC5jaGFuZ2VkKG9sZCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNvbDtcbiAgICB9XG5cbiAgICBjYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLml0ZW1BZGRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgICBpZiAoIW9sZC5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaXRlbUFkZGVkXCIsIGl0ZW0sIGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pdGVtUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvbGQuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy52YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaXRlbVJlbW92ZWRcIiwgaXRlbSwgaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdXBlci5jYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpO1xuICAgIH1cblxuICAgIGhhc0NoYW5nZWRGdW5jdGlvbnMoKSB7XG4gICAgICByZXR1cm4gc3VwZXIuaGFzQ2hhbmdlZEZ1bmN0aW9ucygpIHx8IHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaXRlbUFkZGVkID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaXRlbVJlbW92ZWQgPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIENvbGxlY3Rpb25Qcm9wZXJ0eSB7fTtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNvbGxlY3Rpb25PcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0Q29sbGVjdGlvbk9wdGlvbnMsIHR5cGVvZiBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ29iamVjdCcgPyBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA6IHt9KTtcbiAgICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uLmNvbXBhcmUgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2hlY2tDaGFuZ2VzID0gdGhpcy5wcm90b3R5cGUuY2hlY2tDaGFuZ2VkSXRlbXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDb2xsZWN0aW9uUHJvcGVydHkuZGVmYXVsdENvbGxlY3Rpb25PcHRpb25zID0ge1xuICAgIGNvbXBhcmU6IGZhbHNlLFxuICAgIG9yZGVyZWQ6IHRydWVcbiAgfTtcblxuICByZXR1cm4gQ29sbGVjdGlvblByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oQ29sbGVjdGlvblByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENvbXBvc2VkUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0NvbXBvc2VkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Db21wb3NlZFByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ29tcG9zZWRQcm9wZXJ0eT1Db21wb3NlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ29tcG9zZWRQcm9wZXJ0eT1Db21wb3NlZFByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQ2FsY3VsYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ2FsY3VsYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkNhbGN1bGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgQ29sbGVjdGlvbiA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbGxlY3Rpb25cIikgPyBkZXBlbmRlbmNpZXMuQ29sbGVjdGlvbiA6IHJlcXVpcmUoJy4uL0NvbGxlY3Rpb24nKTtcbnZhciBDb21wb3NlZFByb3BlcnR5O1xuQ29tcG9zZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29tcG9zZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgaW5pdCgpIHtcbiAgICAgIHN1cGVyLmluaXQoKTtcbiAgICAgIHJldHVybiB0aGlzLmluaXRDb21wb3NlZCgpO1xuICAgIH1cblxuICAgIGluaXRDb21wb3NlZCgpIHtcbiAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2RlZmF1bHQnKSkge1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVmYXVsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdCA9IHRoaXMudmFsdWUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5tZW1iZXJzID0gbmV3IENvbXBvc2VkUHJvcGVydHkuTWVtYmVycyh0aGlzLnByb3BlcnR5Lm9wdGlvbnMubWVtYmVycyk7XG4gICAgICB0aGlzLm1lbWJlcnMuY2hhbmdlZCA9IChvbGQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLmpvaW4gPSB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkID09PSAnZnVuY3Rpb24nID8gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNvbXBvc2VkIDogdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlZmF1bHQgPT09IGZhbHNlID8gQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zLm9yIDogQ29tcG9zZWRQcm9wZXJ0eS5qb2luRnVuY3Rpb25zLmFuZDtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLm9iaik7XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm1lbWJlcnMucmVkdWNlKChwcmV2LCBtZW1iZXIpID0+IHtcbiAgICAgICAgICB2YXIgdmFsO1xuICAgICAgICAgIHZhbCA9IHR5cGVvZiBtZW1iZXIgPT09ICdmdW5jdGlvbicgPyBtZW1iZXIodGhpcy5pbnZhbGlkYXRvcikgOiBtZW1iZXI7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuam9pbihwcmV2LCB2YWwpO1xuICAgICAgICB9LCB0aGlzLmRlZmF1bHQpO1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvciA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLnJldmFsaWRhdGVkKCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5vcHRpb25zLmNvbXBvc2VkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBDb21wb3NlZFByb3BlcnR5IHt9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBiaW5kKHRhcmdldCwgcHJvcCkge1xuICAgICAgQ2FsY3VsYXRlZFByb3BlcnR5LmJpbmQodGFyZ2V0LCBwcm9wKTtcbiAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUgKyAnTWVtYmVycycsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLm1lbWJlcnM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucyA9IHtcbiAgICBhbmQ6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhICYmIGI7XG4gICAgfSxcbiAgICBvcjogZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEgfHwgYjtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvbXBvc2VkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbkNvbXBvc2VkUHJvcGVydHkuTWVtYmVycyA9IGNsYXNzIE1lbWJlcnMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgYWRkUHJvcGVydHlSZWYobmFtZSwgb2JqKSB7XG4gICAgdmFyIGZuO1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopID09PSAtMSkge1xuICAgICAgZm4gPSBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChuYW1lLCBvYmopO1xuICAgICAgfTtcbiAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmpcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBhZGRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbjtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLnB1c2goZm4pO1xuICAgIH1cbiAgfVxuXG4gIHNldFZhbHVlUmVmKHZhbCwgbmFtZSwgb2JqKSB7XG4gICAgdmFyIGZuLCBpLCByZWY7XG4gICAgaSA9IHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaik7XG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmdldChpKS5yZWYudmFsICE9PSB2YWwpIHtcbiAgICAgIHJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmosXG4gICAgICAgIHZhbDogdmFsXG4gICAgICB9O1xuICAgICAgZm4gPSBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfTtcbiAgICAgIGZuLnJlZiA9IHJlZjtcbiAgICAgIHJldHVybiB0aGlzLnNldChpLCBmbik7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmFsdWVSZWYobmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEJ5UmVmKG5hbWUsIG9iaikucmVmLnZhbDtcbiAgfVxuXG4gIGFkZEZ1bmN0aW9uUmVmKGZuLCBuYW1lLCBvYmopIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuLnJlZiA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmpcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBmaW5kQnlSZWYobmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W3RoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaildO1xuICB9XG5cbiAgZmluZFJlZkluZGV4KG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maW5kSW5kZXgoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICByZXR1cm4gKG1lbWJlci5yZWYgIT0gbnVsbCkgJiYgbWVtYmVyLnJlZi5vYmogPT09IG9iaiAmJiBtZW1iZXIucmVmLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVSZWYobmFtZSwgb2JqKSB7XG4gICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgaW5kZXggPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICB9XG4gIH1cblxufTtcblxucmV0dXJuKENvbXBvc2VkUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIER5bmFtaWNQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7RHluYW1pY1Byb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RHluYW1pY1Byb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRHluYW1pY1Byb3BlcnR5PUR5bmFtaWNQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkR5bmFtaWNQcm9wZXJ0eT1EeW5hbWljUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9CYXNpY1Byb3BlcnR5Jyk7XG52YXIgRHluYW1pY1Byb3BlcnR5O1xuRHluYW1pY1Byb3BlcnR5ID0gY2xhc3MgRHluYW1pY1Byb3BlcnR5IGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7XG4gIGNhbGxiYWNrR2V0KCkge1xuICAgIHZhciByZXM7XG4gICAgcmVzID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJnZXRcIik7XG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfaW52YWxpZGF0ZU5vdGljZSgpIHtcbiAgICBpZiAodGhpcy5pc0ltbWVkaWF0ZSgpKSB7XG4gICAgICB0aGlzLmdldCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub2JqLmVtaXRFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLm9iai5lbWl0RXZlbnQodGhpcy5pbnZhbGlkYXRlRXZlbnROYW1lKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlzSW1tZWRpYXRlKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaW1tZWRpYXRlICE9PSBmYWxzZSAmJiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmltbWVkaWF0ZSA9PT0gdHJ1ZSB8fCAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgPyB0aGlzLmNhbGxPcHRpb25GdW5jdChcImltbWVkaWF0ZVwiKSA6IHRoaXMuaGFzQ2hhbmdlZEV2ZW50cygpIHx8IHRoaXMuaGFzQ2hhbmdlZEZ1bmN0aW9ucygpKSk7XG4gIH1cblxuICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBwcm9wLm9wdGlvbnMuY2FsY3VsID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBwcm9wLm9wdGlvbnMuYWN0aXZlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAocHJvcC5pbnN0YW5jZVR5cGUgPT0gbnVsbCkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHt9O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuZ2V0ID0gdGhpcy5wcm90b3R5cGUuY2FsbGJhY2tHZXQ7XG4gICAgfVxuICB9XG5cbn07XG5cbnJldHVybihEeW5hbWljUHJvcGVydHkpO30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcy5tYXBcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgSW52YWxpZGF0ZWRQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7SW52YWxpZGF0ZWRQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUludmFsaWRhdGVkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5JbnZhbGlkYXRlZFByb3BlcnR5PUludmFsaWRhdGVkUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5JbnZhbGlkYXRlZFByb3BlcnR5PUludmFsaWRhdGVkUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cbnZhciBJbnZhbGlkYXRvciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdG9yXCIpID8gZGVwZW5kZW5jaWVzLkludmFsaWRhdG9yIDogcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcbnZhciBDYWxjdWxhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDYWxjdWxhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ2FsY3VsYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9DYWxjdWxhdGVkUHJvcGVydHknKTtcbnZhciBJbnZhbGlkYXRlZFByb3BlcnR5O1xuSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgSW52YWxpZGF0ZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgdW5rbm93bigpIHtcbiAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChJbnZhbGlkYXRlZFByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBJbnZhbGlkYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuY2FsY3VsRnVuY3QsIGludmFsaWRhdG9yKTtcbiAgICAgICAgdGhpcy5tYW51YWwgPSBmYWxzZTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGVzdHJveS53aXRob3V0SW52YWxpZGF0ZWRQcm9wZXJ0eSgpO1xuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGludmFsaWRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuY2FsY3VsYXRlZCB8fCB0aGlzLmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCkgJiYgIXRoaXMuY2FsY3VsYXRlZCAmJiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEludmFsaWRhdGVkUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihJbnZhbGlkYXRlZFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5LmpzLm1hcFxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBVcGRhdGVkUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1VwZGF0ZWRQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVVwZGF0ZWRQcm9wZXJ0eTt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLlVwZGF0ZWRQcm9wZXJ0eT1VcGRhdGVkUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5VcGRhdGVkUHJvcGVydHk9VXBkYXRlZFByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XG52YXIgT3ZlcnJpZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiT3ZlcnJpZGVyXCIpID8gZGVwZW5kZW5jaWVzLk92ZXJyaWRlciA6IHJlcXVpcmUoJy4uL092ZXJyaWRlcicpO1xudmFyIFVwZGF0ZWRQcm9wZXJ0eTtcblVwZGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVXBkYXRlZFByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBpbml0UmV2YWxpZGF0ZSgpIHtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5nZXQoKTtcbiAgICAgICAgdGhpcy5nZXRVcGRhdGVyKCkudW5iaW5kKCk7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VkKHRoaXMucGVuZGluZ09sZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5yZXZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzO1xuICAgIH1cblxuICAgIGdldFVwZGF0ZXIoKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMudXBkYXRlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcGVydHkub3B0aW9ucy51cGRhdGVyICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZXIgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnMudXBkYXRlcjtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMudXBkYXRlci5nZXRCaW5kZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlciA9IHRoaXMudXBkYXRlci5nZXRCaW5kZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZXIuYmluZCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdGhpcy51cGRhdGVyLnVuYmluZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVyID0gbnVsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVyLmNhbGxiYWNrID0gdGhpcy5yZXZhbGlkYXRlQ2FsbGJhY2s7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudXBkYXRlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZXI7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy51cGRhdGVyICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChVcGRhdGVkUHJvcGVydHkpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIFVwZGF0ZWRQcm9wZXJ0eS5leHRlbmQoT3ZlcnJpZGVyKTtcblxuICBVcGRhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaW5pdC53aXRob3V0VXBkYXRlZFByb3BlcnR5KCk7XG4gICAgICByZXR1cm4gdGhpcy5pbml0UmV2YWxpZGF0ZSgpO1xuICAgIH0sXG4gICAgX2ludmFsaWRhdGVOb3RpY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlcztcbiAgICAgIHJlcyA9IHRoaXMuX2ludmFsaWRhdGVOb3RpY2Uud2l0aG91dFVwZGF0ZWRQcm9wZXJ0eSgpO1xuICAgICAgaWYgKHJlcykge1xuICAgICAgICB0aGlzLmdldFVwZGF0ZXIoKS5iaW5kKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgaXNJbW1lZGlhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgY2hhbmdlZDogZnVuY3Rpb24ob2xkKSB7XG4gICAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGVuZGluZ09sZCA9IHZvaWQgMDtcbiAgICAgICAgdGhpcy5jaGFuZ2VkLndpdGhvdXRVcGRhdGVkUHJvcGVydHkob2xkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSB0cnVlO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGVuZGluZ09sZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRVcGRhdGVyKCkuYmluZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVXBkYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oVXBkYXRlZFByb3BlcnR5KTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9VcGRhdGVkUHJvcGVydHkuanMubWFwXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIFVwZGF0ZXI9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1VwZGF0ZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1VcGRhdGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuVXBkYXRlcj1VcGRhdGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuVXBkYXRlcj1VcGRhdGVyO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmluZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmluZGVyXCIpID8gZGVwZW5kZW5jaWVzLkJpbmRlciA6IHJlcXVpcmUoJy4vQmluZGVyJyk7XG52YXIgVXBkYXRlcjtcblVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5uZXh0O1xuICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcy5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAodGhpcy51cGRhdGluZyAmJiAhdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBuZXh0VGljayhjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICBpZiAoIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gdGhpcy5jYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLm5leHQuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGdldEJpbmRlcigpIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZXIuQmluZGVyKHRoaXMpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIHJldHVybiB0aGlzLm5leHQgPSBbXTtcbiAgfVxuXG59O1xuXG5VcGRhdGVyLkJpbmRlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGNsYXNzIEJpbmRlciBleHRlbmRzIHN1cGVyQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHRhcmdldCwgY2FsbGJhY2sxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sxO1xuICAgIH1cblxuICAgIGdldFJlZigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRvQmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBkb1VuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gQmluZGVyO1xuXG59KS5jYWxsKHRoaXMsIEJpbmRlcik7XG5cbnJldHVybihVcGRhdGVyKTt9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVXBkYXRlci5qcy5tYXBcbiIsImlmKG1vZHVsZSl7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEJpbmRlcjogcmVxdWlyZSgnLi9CaW5kZXIuanMnKSxcbiAgICBDb2xsZWN0aW9uOiByZXF1aXJlKCcuL0NvbGxlY3Rpb24uanMnKSxcbiAgICBFbGVtZW50OiByZXF1aXJlKCcuL0VsZW1lbnQuanMnKSxcbiAgICBFdmVudEJpbmQ6IHJlcXVpcmUoJy4vRXZlbnRCaW5kLmpzJyksXG4gICAgRXZlbnRFbWl0dGVyOiByZXF1aXJlKCcuL0V2ZW50RW1pdHRlci5qcycpLFxuICAgIEludmFsaWRhdG9yOiByZXF1aXJlKCcuL0ludmFsaWRhdG9yLmpzJyksXG4gICAgTWl4YWJsZTogcmVxdWlyZSgnLi9NaXhhYmxlLmpzJyksXG4gICAgT3ZlcnJpZGVyOiByZXF1aXJlKCcuL092ZXJyaWRlci5qcycpLFxuICAgIFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5LmpzJyksXG4gICAgUHJvcGVydHlPd25lcjogcmVxdWlyZSgnLi9Qcm9wZXJ0eU93bmVyLmpzJyksXG4gICAgVXBkYXRlcjogcmVxdWlyZSgnLi9VcGRhdGVyLmpzJyksXG4gICAgQWN0aXZhYmxlUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9BY3RpdmFibGVQcm9wZXJ0eS5qcycpLFxuICAgIEJhc2ljUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzJyksXG4gICAgQ2FsY3VsYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzJyksXG4gICAgQ29sbGVjdGlvblByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzJyksXG4gICAgQ29tcG9zZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMnKSxcbiAgICBEeW5hbWljUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHkuanMnKSxcbiAgICBJbnZhbGlkYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcycpLFxuICAgIFVwZGF0ZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eS5qcycpXG4gIH07XG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBQYXRoRmluZGVyPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtQYXRoRmluZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9UGF0aEZpbmRlcjt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBQYXRoRmluZGVyO1xuUGF0aEZpbmRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGF0aEZpbmRlciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzQ29udGFpbmVyLCBmcm9tMSwgdG8xLCBvcHRpb25zID0ge30pIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRpbGVzQ29udGFpbmVyID0gdGlsZXNDb250YWluZXI7XG4gICAgICB0aGlzLmZyb20gPSBmcm9tMTtcbiAgICAgIHRoaXMudG8gPSB0bzE7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICBpZiAob3B0aW9ucy52YWxpZFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnZhbGlkVGlsZUNhbGxiYWNrID0gb3B0aW9ucy52YWxpZFRpbGU7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5hcnJpdmVkICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hcnJpdmVkQ2FsbGJhY2sgPSBvcHRpb25zLmFycml2ZWQ7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5lZmZpY2llbmN5ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5Q2FsbGJhY2sgPSBvcHRpb25zLmVmZmljaWVuY3k7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICB0aGlzLnBhdGhzID0ge307XG4gICAgICB0aGlzLnNvbHV0aW9uID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICB3aGlsZSAoIXRoaXMuc29sdXRpb24gJiYgKCF0aGlzLnN0YXJ0ZWQgfHwgdGhpcy5xdWV1ZS5sZW5ndGgpKSB7XG4gICAgICAgIHRoaXMuc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0aCgpO1xuICAgIH1cblxuICAgIHN0ZXAoKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wb3AoKTtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMobmV4dCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMudG8gPT09IGZhbHNlIHx8IHRoaXMudGlsZUlzVmFsaWQodGhpcy50bykpIHtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UGF0aCgpIHtcbiAgICAgIHZhciByZXMsIHN0ZXA7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICByZXMgPSBbdGhpcy5zb2x1dGlvbl07XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICByZXMudW5zaGlmdChzdGVwLnByZXYpO1xuICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb3NBdFByYyhwcmMpIHtcbiAgICAgIGlmIChpc05hTihwcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFBvc0F0VGltZSh0aGlzLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKCkgKiBwcmMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc0F0VGltZSh0aW1lKSB7XG4gICAgICB2YXIgcHJjLCBzdGVwO1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgaWYgKHRpbWUgPj0gdGhpcy5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc29sdXRpb24ucG9zVG9UaWxlT2Zmc2V0KHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLngsIHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICAgIHdoaWxlIChzdGVwLmdldFN0YXJ0TGVuZ3RoKCkgPiB0aW1lICYmIChzdGVwLnByZXYgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByYyA9ICh0aW1lIC0gc3RlcC5nZXRTdGFydExlbmd0aCgpKSAvIHN0ZXAuZ2V0TGVuZ3RoKCk7XG4gICAgICAgICAgcmV0dXJuIHN0ZXAucG9zVG9UaWxlT2Zmc2V0KHN0ZXAuZ2V0RW50cnkoKS54ICsgKHN0ZXAuZ2V0RXhpdCgpLnggLSBzdGVwLmdldEVudHJ5KCkueCkgKiBwcmMsIHN0ZXAuZ2V0RW50cnkoKS55ICsgKHN0ZXAuZ2V0RXhpdCgpLnkgLSBzdGVwLmdldEVudHJ5KCkueSkgKiBwcmMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U29sdXRpb25UaWxlTGlzdCgpIHtcbiAgICAgIHZhciBzdGVwLCB0aWxlbGlzdDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB0aWxlbGlzdCA9IFtzdGVwLnRpbGVdO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICAgIHRpbGVsaXN0LnVuc2hpZnQoc3RlcC50aWxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZWxpc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGlsZUlzVmFsaWQodGlsZSkge1xuICAgICAgaWYgKHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZFRpbGVDYWxsYmFjayh0aWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodGlsZSAhPSBudWxsKSAmJiAoIXRpbGUuZW11bGF0ZWQgfHwgKHRpbGUudGlsZSAhPT0gMCAmJiB0aWxlLnRpbGUgIT09IGZhbHNlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmMTtcbiAgICAgIGlmICh0aGlzLnRpbGVzQ29udGFpbmVyLmdldFRpbGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc0NvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgfSBlbHNlIGlmICgoKHJlZjEgPSB0aGlzLnRpbGVzQ29udGFpbmVyW3ldKSAhPSBudWxsID8gcmVmMVt4XSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgeTogeSxcbiAgICAgICAgICB0aWxlOiB0aGlzLnRpbGVzQ29udGFpbmVyW3ldW3hdLFxuICAgICAgICAgIGVtdWxhdGVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0Q29ubmVjdGVkVG9UaWxlKHRpbGUpIHtcbiAgICAgIHZhciBjb25uZWN0ZWQsIHQ7XG4gICAgICBpZiAodGlsZS5nZXRDb25uZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGlsZS5nZXRDb25uZWN0ZWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbm5lY3RlZCA9IFtdO1xuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLnggKyAxLCB0aWxlLnkpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54IC0gMSwgdGlsZS55KSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCwgdGlsZS55ICsgMSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLngsIHRpbGUueSAtIDEpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbm5lY3RlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGROZXh0U3RlcHMoc3RlcCA9IG51bGwpIHtcbiAgICAgIHZhciBpLCBsZW4sIG5leHQsIHJlZjEsIHJlc3VsdHMsIHRpbGU7XG4gICAgICB0aWxlID0gc3RlcCAhPSBudWxsID8gc3RlcC5uZXh0VGlsZSA6IHRoaXMuZnJvbTtcbiAgICAgIHJlZjEgPSB0aGlzLmdldENvbm5lY3RlZFRvVGlsZSh0aWxlKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZjEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgbmV4dCA9IHJlZjFbaV07XG4gICAgICAgIGlmICh0aGlzLnRpbGVJc1ZhbGlkKG5leHQpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYWRkU3RlcChuZXcgUGF0aEZpbmRlci5TdGVwKHRoaXMsIChzdGVwICE9IG51bGwgPyBzdGVwIDogbnVsbCksIHRpbGUsIG5leHQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIHRpbGVFcXVhbCh0aWxlQSwgdGlsZUIpIHtcbiAgICAgIHJldHVybiB0aWxlQSA9PT0gdGlsZUIgfHwgKCh0aWxlQS5lbXVsYXRlZCB8fCB0aWxlQi5lbXVsYXRlZCkgJiYgdGlsZUEueCA9PT0gdGlsZUIueCAmJiB0aWxlQS55ID09PSB0aWxlQi55KTtcbiAgICB9XG5cbiAgICBhcnJpdmVkQXREZXN0aW5hdGlvbihzdGVwKSB7XG4gICAgICBpZiAodGhpcy5hcnJpdmVkQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcnJpdmVkQ2FsbGJhY2soc3RlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlRXF1YWwoc3RlcC50aWxlLCB0aGlzLnRvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBzb2x1dGlvbkNhbmRpZGF0ZTtcbiAgICAgIGlmICh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XSA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKCEoKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkgJiYgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XS5nZXRUb3RhbExlbmd0aCgpIDw9IHN0ZXAuZ2V0VG90YWxMZW5ndGgoKSkpIHtcbiAgICAgICAgaWYgKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlU3RlcCh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldID0gc3RlcDtcbiAgICAgICAgdGhpcy5xdWV1ZS5zcGxpY2UodGhpcy5nZXRTdGVwUmFuayhzdGVwKSwgMCwgc3RlcCk7XG4gICAgICAgIHNvbHV0aW9uQ2FuZGlkYXRlID0gbmV3IFBhdGhGaW5kZXIuU3RlcCh0aGlzLCBzdGVwLCBzdGVwLm5leHRUaWxlLCBudWxsKTtcbiAgICAgICAgaWYgKHRoaXMuYXJyaXZlZEF0RGVzdGluYXRpb24oc29sdXRpb25DYW5kaWRhdGUpICYmICEoKHRoaXMuc29sdXRpb24gIT0gbnVsbCkgJiYgdGhpcy5zb2x1dGlvbi5wcmV2LmdldFRvdGFsTGVuZ3RoKCkgPD0gc3RlcC5nZXRUb3RhbExlbmd0aCgpKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNvbHV0aW9uID0gc29sdXRpb25DYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5xdWV1ZS5pbmRleE9mKHN0ZXApO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBiZXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5xdWV1ZS5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBnZXRTdGVwUmFuayhzdGVwKSB7XG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoc3RlcC5nZXRFZmZpY2llbmN5KCksIDAsIHRoaXMucXVldWUubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgbWF4KSB7XG4gICAgICB2YXIgcmVmLCByZWZQb3M7XG4gICAgICByZWZQb3MgPSBNYXRoLmZsb29yKChtYXggLSBtaW4pIC8gMikgKyBtaW47XG4gICAgICByZWYgPSB0aGlzLnF1ZXVlW3JlZlBvc10uZ2V0RWZmaWNpZW5jeSgpO1xuICAgICAgaWYgKHJlZiA9PT0gZWZmaWNpZW5jeSkge1xuICAgICAgICByZXR1cm4gcmVmUG9zO1xuICAgICAgfSBlbHNlIGlmIChyZWYgPiBlZmZpY2llbmN5KSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1pbikge1xuICAgICAgICAgIHJldHVybiBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgcmVmUG9zIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1heCkge1xuICAgICAgICAgIHJldHVybiBtYXggKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCByZWZQb3MgKyAxLCBtYXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aEZpbmRlci5wcm9wZXJ0aWVzKHtcbiAgICB2YWxpZFRpbGVDYWxsYmFjazoge31cbiAgfSk7XG5cbiAgcmV0dXJuIFBhdGhGaW5kZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cblBhdGhGaW5kZXIuU3RlcCA9IGNsYXNzIFN0ZXAge1xuICBjb25zdHJ1Y3RvcihwYXRoRmluZGVyLCBwcmV2LCB0aWxlMSwgbmV4dFRpbGUpIHtcbiAgICB0aGlzLnBhdGhGaW5kZXIgPSBwYXRoRmluZGVyO1xuICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgdGhpcy50aWxlID0gdGlsZTE7XG4gICAgdGhpcy5uZXh0VGlsZSA9IG5leHRUaWxlO1xuICB9XG5cbiAgcG9zVG9UaWxlT2Zmc2V0KHgsIHkpIHtcbiAgICB2YXIgdGlsZTtcbiAgICB0aWxlID0gTWF0aC5mbG9vcih4KSA9PT0gdGhpcy50aWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy50aWxlLnkgPyB0aGlzLnRpbGUgOiAodGhpcy5uZXh0VGlsZSAhPSBudWxsKSAmJiBNYXRoLmZsb29yKHgpID09PSB0aGlzLm5leHRUaWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy5uZXh0VGlsZS55ID8gdGhpcy5uZXh0VGlsZSA6ICh0aGlzLnByZXYgIT0gbnVsbCkgJiYgTWF0aC5mbG9vcih4KSA9PT0gdGhpcy5wcmV2LnRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLnByZXYudGlsZS55ID8gdGhpcy5wcmV2LnRpbGUgOiBjb25zb2xlLmxvZygnTWF0aC5mbG9vcignICsgeCArICcpID09ICcgKyB0aGlzLnRpbGUueCwgJ01hdGguZmxvb3IoJyArIHkgKyAnKSA9PSAnICsgdGhpcy50aWxlLnksIHRoaXMpO1xuICAgIHJldHVybiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICBvZmZzZXRYOiB4IC0gdGlsZS54LFxuICAgICAgb2Zmc2V0WTogeSAtIHRpbGUueVxuICAgIH07XG4gIH1cblxuICBnZXRFeGl0KCkge1xuICAgIGlmICh0aGlzLmV4aXQgPT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMubmV4dFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmV4aXQgPSB7XG4gICAgICAgICAgeDogKHRoaXMudGlsZS54ICsgdGhpcy5uZXh0VGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMubmV4dFRpbGUueSArIDEpIC8gMlxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5leGl0ID0ge1xuICAgICAgICAgIHg6IHRoaXMudGlsZS54ICsgMC41LFxuICAgICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4aXQ7XG4gIH1cblxuICBnZXRFbnRyeSgpIHtcbiAgICBpZiAodGhpcy5lbnRyeSA9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lbnRyeSA9IHtcbiAgICAgICAgICB4OiAodGhpcy50aWxlLnggKyB0aGlzLnByZXYudGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMucHJldi50aWxlLnkgKyAxKSAvIDJcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZW50cnkgPSB7XG4gICAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUsXG4gICAgICAgICAgeTogdGhpcy50aWxlLnkgKyAwLjVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW50cnk7XG4gIH1cblxuICBnZXRMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gKHRoaXMubmV4dFRpbGUgPT0gbnVsbCkgfHwgKHRoaXMucHJldiA9PSBudWxsKSA/IDAuNSA6IHRoaXMucHJldi50aWxlLnggPT09IHRoaXMubmV4dFRpbGUueCB8fCB0aGlzLnByZXYudGlsZS55ID09PSB0aGlzLm5leHRUaWxlLnkgPyAxIDogTWF0aC5zcXJ0KDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxlbmd0aDtcbiAgfVxuXG4gIGdldFN0YXJ0TGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLnN0YXJ0TGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhcnRMZW5ndGggPSB0aGlzLnByZXYgIT0gbnVsbCA/IHRoaXMucHJldi5nZXRUb3RhbExlbmd0aCgpIDogMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRMZW5ndGg7XG4gIH1cblxuICBnZXRUb3RhbExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy50b3RhbExlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnRvdGFsTGVuZ3RoID0gdGhpcy5nZXRTdGFydExlbmd0aCgpICsgdGhpcy5nZXRMZW5ndGgoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG90YWxMZW5ndGg7XG4gIH1cblxuICBnZXRFZmZpY2llbmN5KCkge1xuICAgIGlmICh0aGlzLmVmZmljaWVuY3kgPT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhdGhGaW5kZXIuZWZmaWNpZW5jeUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5ID0gdGhpcy5wYXRoRmluZGVyLmVmZmljaWVuY3lDYWxsYmFjayh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeSA9IC10aGlzLmdldFJlbWFpbmluZygpICogMS4xIC0gdGhpcy5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lZmZpY2llbmN5O1xuICB9XG5cbiAgZ2V0UmVtYWluaW5nKCkge1xuICAgIHZhciBmcm9tLCB0bywgeCwgeTtcbiAgICBpZiAodGhpcy5yZW1haW5pbmcgPT0gbnVsbCkge1xuICAgICAgZnJvbSA9IHRoaXMuZ2V0RXhpdCgpO1xuICAgICAgdG8gPSB7XG4gICAgICAgIHg6IHRoaXMucGF0aEZpbmRlci50by54ICsgMC41LFxuICAgICAgICB5OiB0aGlzLnBhdGhGaW5kZXIudG8ueSArIDAuNVxuICAgICAgfTtcbiAgICAgIHggPSB0by54IC0gZnJvbS54O1xuICAgICAgeSA9IHRvLnkgLSBmcm9tLnk7XG4gICAgICB0aGlzLnJlbWFpbmluZyA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVtYWluaW5nO1xuICB9XG5cbn07XG5cbnJldHVybihQYXRoRmluZGVyKTt9KTsiLCJpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICBncmVla0FscGhhYmV0OiByZXF1aXJlKCcuL3N0cmluZ3MvZ3JlZWtBbHBoYWJldCcpLFxuICAgICAgc3Rhck5hbWVzOiByZXF1aXJlKCcuL3N0cmluZ3Mvc3Rhck5hbWVzJylcbiAgfTtcbn0iLCJtb2R1bGUuZXhwb3J0cz1bXG5cImFscGhhXCIsICAgXCJiZXRhXCIsICAgIFwiZ2FtbWFcIiwgICBcImRlbHRhXCIsXG5cImVwc2lsb25cIiwgXCJ6ZXRhXCIsICAgIFwiZXRhXCIsICAgICBcInRoZXRhXCIsXG5cImlvdGFcIiwgICAgXCJrYXBwYVwiLCAgIFwibGFtYmRhXCIsICBcIm11XCIsXG5cIm51XCIsICAgICAgXCJ4aVwiLCAgICAgIFwib21pY3JvblwiLCBcInBpXCIsXHRcblwicmhvXCIsICAgICBcInNpZ21hXCIsICAgXCJ0YXVcIiwgICAgIFwidXBzaWxvblwiLFxuXCJwaGlcIiwgICAgIFwiY2hpXCIsICAgICBcInBzaVwiLCAgICAgXCJvbWVnYVwiXG5dIiwibW9kdWxlLmV4cG9ydHM9W1xuXCJBY2hlcm5hclwiLCAgICAgXCJNYWlhXCIsICAgICAgICBcIkF0bGFzXCIsICAgICAgICBcIlNhbG1cIiwgICAgICAgXCJBbG5pbGFtXCIsICAgICAgXCJOZWtrYXJcIiwgICAgICBcIkVsbmF0aFwiLCAgICAgICBcIlRodWJhblwiLFxuXCJBY2hpcmRcIiwgICAgICAgXCJNYXJmaWtcIiwgICAgICBcIkF1dmFcIiwgICAgICAgICBcIlNhcmdhc1wiLCAgICAgXCJBbG5pdGFrXCIsICAgICAgXCJOaWhhbFwiLCAgICAgICBcIkVuaWZcIiwgICAgICAgICBcIlRvcmN1bGFyaXNcIixcblwiQWNydXhcIiwgICAgICAgIFwiTWFya2FiXCIsICAgICAgXCJBdmlvclwiLCAgICAgICAgXCJTYXJpblwiLCAgICAgIFwiQWxwaGFyZFwiLCAgICAgIFwiTnVua2lcIiwgICAgICAgXCJFdGFtaW5cIiwgICAgICAgXCJUdXJhaXNcIixcblwiQWN1YmVuc1wiLCAgICAgIFwiTWF0YXJcIiwgICAgICAgXCJBemVsZmFmYWdlXCIsICAgXCJTY2VwdHJ1bVwiLCAgIFwiQWxwaGVra2FcIiwgICAgIFwiTnVzYWthblwiLCAgICAgXCJGb21hbGhhdXRcIiwgICAgXCJUeWxcIixcblwiQWRhcmFcIiwgICAgICAgIFwiTWVic3V0YVwiLCAgICAgXCJBemhhXCIsICAgICAgICAgXCJTY2hlYXRcIiwgICAgIFwiQWxwaGVyYXR6XCIsICAgIFwiUGVhY29ja1wiLCAgICAgXCJGb3JuYWNpc1wiLCAgICAgXCJVbnVrYWxoYWlcIixcblwiQWRoYWZlcmFcIiwgICAgIFwiTWVncmV6XCIsICAgICAgXCJBem1pZGlza2VcIiwgICAgXCJTZWdpblwiLCAgICAgIFwiQWxyYWlcIiwgICAgICAgIFwiUGhhZFwiLCAgICAgICAgXCJGdXJ1ZFwiLCAgICAgICAgXCJWZWdhXCIsXG5cIkFkaGlsXCIsICAgICAgICBcIk1laXNzYVwiLCAgICAgIFwiQmFoYW1cIiwgICAgICAgIFwiU2VnaW51c1wiLCAgICBcIkFscmlzaGFcIiwgICAgICBcIlBoYWV0XCIsICAgICAgIFwiR2FjcnV4XCIsICAgICAgIFwiVmluZGVtaWF0cml4XCIsXG5cIkFnZW5hXCIsICAgICAgICBcIk1la2J1ZGFcIiwgICAgIFwiQmVjcnV4XCIsICAgICAgIFwiU2hhbVwiLCAgICAgICBcIkFsc2FmaVwiLCAgICAgICBcIlBoZXJrYWRcIiwgICAgIFwiR2lhbmZhclwiLCAgICAgIFwiV2FzYXRcIixcblwiQWxhZGZhclwiLCAgICAgIFwiTWVua2FsaW5hblwiLCAgXCJCZWlkXCIsICAgICAgICAgXCJTaGFyYXRhblwiLCAgIFwiQWxzY2lhdWthdFwiLCAgIFwiUGxlaW9uZVwiLCAgICAgXCJHb21laXNhXCIsICAgICAgXCJXZXplblwiLFxuXCJBbGF0aGZhclwiLCAgICAgXCJNZW5rYXJcIiwgICAgICBcIkJlbGxhdHJpeFwiLCAgICBcIlNoYXVsYVwiLCAgICAgXCJBbHNoYWluXCIsICAgICAgXCJQb2xhcmlzXCIsICAgICBcIkdyYWZmaWFzXCIsICAgICBcIldlem5cIixcblwiQWxiYWxkYWhcIiwgICAgIFwiTWVua2VudFwiLCAgICAgXCJCZXRlbGdldXNlXCIsICAgXCJTaGVkaXJcIiwgICAgIFwiQWxzaGF0XCIsICAgICAgIFwiUG9sbHV4XCIsICAgICAgXCJHcmFmaWFzXCIsICAgICAgXCJZZWRcIixcblwiQWxiYWxpXCIsICAgICAgIFwiTWVua2liXCIsICAgICAgXCJCb3RlaW5cIiwgICAgICAgXCJTaGVsaWFrXCIsICAgIFwiQWxzdWhhaWxcIiwgICAgIFwiUG9ycmltYVwiLCAgICAgXCJHcnVtaXVtXCIsICAgICAgXCJZaWxkdW5cIixcblwiQWxiaXJlb1wiLCAgICAgIFwiTWVyYWtcIiwgICAgICAgXCJCcmFjaGl1bVwiLCAgICAgXCJTaXJpdXNcIiwgICAgIFwiQWx0YWlyXCIsICAgICAgIFwiUHJhZWNpcHVhXCIsICAgXCJIYWRhclwiLCAgICAgICAgXCJaYW5pYWhcIixcblwiQWxjaGliYVwiLCAgICAgIFwiTWVyZ2FcIiwgICAgICAgXCJDYW5vcHVzXCIsICAgICAgXCJTaXR1bGFcIiwgICAgIFwiQWx0YXJmXCIsICAgICAgIFwiUHJvY3lvblwiLCAgICAgXCJIYWVkaVwiLCAgICAgICAgXCJaYXVyYWtcIixcblwiQWxjb3JcIiwgICAgICAgIFwiTWVyb3BlXCIsICAgICAgXCJDYXBlbGxhXCIsICAgICAgXCJTa2F0XCIsICAgICAgIFwiQWx0ZXJmXCIsICAgICAgIFwiUHJvcHVzXCIsICAgICAgXCJIYW1hbFwiLCAgICAgICAgXCJaYXZpamFoXCIsXG5cIkFsY3lvbmVcIiwgICAgICBcIk1lc2FydGhpbVwiLCAgIFwiQ2FwaFwiLCAgICAgICAgIFwiU3BpY2FcIiwgICAgICBcIkFsdWRyYVwiLCAgICAgICBcIlJhbmFcIiwgICAgICAgIFwiSGFzc2FsZWhcIiwgICAgIFwiWmliYWxcIixcblwiQWxkZXJhbWluXCIsICAgIFwiTWV0YWxsYWhcIiwgICAgXCJDYXN0b3JcIiwgICAgICAgXCJTdGVyb3BlXCIsICAgIFwiQWx1bGFcIiwgICAgICAgIFwiUmFzXCIsICAgICAgICAgXCJIZXplXCIsICAgICAgICAgXCJab3NtYVwiLFxuXCJBbGRoaWJhaFwiLCAgICAgXCJNaWFwbGFjaWR1c1wiLCBcIkNlYmFscmFpXCIsICAgICBcIlN1YWxvY2luXCIsICAgXCJBbHlhXCIsICAgICAgICAgXCJSYXNhbGdldGhpXCIsICBcIkhvZWR1c1wiLCAgICAgICBcIkFxdWFyaXVzXCIsXG5cIkFsZmlya1wiLCAgICAgICBcIk1pbmthclwiLCAgICAgIFwiQ2VsYWVub1wiLCAgICAgIFwiU3VicmFcIiwgICAgICBcIkFsemlyclwiLCAgICAgICBcIlJhc2FsaGFndWVcIiwgIFwiSG9tYW1cIiwgICAgICAgIFwiQXJpZXNcIixcblwiQWxnZW5pYlwiLCAgICAgIFwiTWludGFrYVwiLCAgICAgXCJDaGFyYVwiLCAgICAgICAgXCJTdWhhaWxcIiwgICAgIFwiQW5jaGFcIiwgICAgICAgIFwiUmFzdGFiYW5cIiwgICAgXCJIeWFkdW1cIiwgICAgICAgXCJDZXBoZXVzXCIsXG5cIkFsZ2llYmFcIiwgICAgICBcIk1pcmFcIiwgICAgICAgIFwiQ2hvcnRcIiwgICAgICAgIFwiU3VsYWZhdFwiLCAgICBcIkFuZ2V0ZW5hclwiLCAgICBcIlJlZ3VsdXNcIiwgICAgIFwiSXphclwiLCAgICAgICAgIFwiQ2V0dXNcIixcblwiQWxnb2xcIiwgICAgICAgIFwiTWlyYWNoXCIsICAgICAgXCJDdXJzYVwiLCAgICAgICAgXCJTeXJtYVwiLCAgICAgIFwiQW5rYWFcIiwgICAgICAgIFwiUmlnZWxcIiwgICAgICAgXCJKYWJiYWhcIiwgICAgICAgXCJDb2x1bWJhXCIsXG5cIkFsZ29yYWJcIiwgICAgICBcIk1pcmFtXCIsICAgICAgIFwiRGFiaWhcIiwgICAgICAgIFwiVGFiaXRcIiwgICAgICBcIkFuc2VyXCIsICAgICAgICBcIlJvdGFuZXZcIiwgICAgIFwiS2FqYW1cIiwgICAgICAgIFwiQ29tYVwiLFxuXCJBbGhlbmFcIiwgICAgICAgXCJNaXJwaGFrXCIsICAgICBcIkRlbmViXCIsICAgICAgICBcIlRhbGl0aGFcIiwgICAgXCJBbnRhcmVzXCIsICAgICAgXCJSdWNoYmFcIiwgICAgICBcIkthdXNcIiwgICAgICAgICBcIkNvcm9uYVwiLFxuXCJBbGlvdGhcIiwgICAgICAgXCJNaXphclwiLCAgICAgICBcIkRlbmVib2xhXCIsICAgICBcIlRhbmlhXCIsICAgICAgXCJBcmN0dXJ1c1wiLCAgICAgXCJSdWNoYmFoXCIsICAgICBcIktlaWRcIiwgICAgICAgICBcIkNydXhcIixcblwiQWxrYWlkXCIsICAgICAgIFwiTXVmcmlkXCIsICAgICAgXCJEaGVuZWJcIiwgICAgICAgXCJUYXJhemVkXCIsICAgIFwiQXJrYWJcIiwgICAgICAgIFwiUnVrYmF0XCIsICAgICAgXCJLaXRhbHBoYVwiLCAgICAgXCJEcmFjb1wiLFxuXCJBbGthbHVyb3BzXCIsICAgXCJNdWxpcGhlblwiLCAgICBcIkRpYWRlbVwiLCAgICAgICBcIlRheWdldGFcIiwgICAgXCJBcm5lYlwiLCAgICAgICAgXCJTYWJpa1wiLCAgICAgICBcIktvY2FiXCIsICAgICAgICBcIkdydXNcIixcblwiQWxrZXNcIiwgICAgICAgIFwiTXVyemltXCIsICAgICAgXCJEaXBoZGFcIiwgICAgICAgXCJUZWdtZW5cIiwgICAgIFwiQXJyYWtpc1wiLCAgICAgIFwiU2FkYWxhY2hiaWFcIiwgXCJLb3JuZXBob3Jvc1wiLCAgXCJIeWRyYVwiLFxuXCJBbGt1cmhhaFwiLCAgICAgXCJNdXNjaWRhXCIsICAgICBcIkRzY2h1YmJhXCIsICAgICBcIlRlamF0XCIsICAgICAgXCJBc2NlbGxhXCIsICAgICAgXCJTYWRhbG1lbGlrXCIsICBcIktyYXpcIiwgICAgICAgICBcIkxhY2VydGFcIixcblwiQWxtYWFrXCIsICAgICAgIFwiTmFvc1wiLCAgICAgICAgXCJEc2liYW5cIiwgICAgICAgXCJUZXJlYmVsbHVtXCIsIFwiQXNlbGx1c1wiLCAgICAgIFwiU2FkYWxzdXVkXCIsICAgXCJLdW1hXCIsICAgICAgICAgXCJNZW5zYVwiLFxuXCJBbG5haXJcIiwgICAgICAgXCJOYXNoXCIsICAgICAgICBcIkR1YmhlXCIsICAgICAgICBcIlRoYWJpdFwiLCAgICAgXCJBc3Rlcm9wZVwiLCAgICAgXCJTYWRyXCIsICAgICAgICBcIkxlc2F0aFwiLCAgICAgICBcIk1hYXN5bVwiLFxuXCJBbG5hdGhcIiwgICAgICAgXCJOYXNoaXJhXCIsICAgICBcIkVsZWN0cmFcIiwgICAgICBcIlRoZWVtaW1cIiwgICAgXCJBdGlrXCIsICAgICAgICAgXCJTYWlwaFwiLCAgICAgICBcIlBob2VuaXhcIiwgICAgICBcIk5vcm1hXCJcbl0iLCJ2YXIgRGlyZWN0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpcmVjdGlvbiA9IGNsYXNzIERpcmVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHgsIHksIGludmVyc2VOYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy5pbnZlcnNlTmFtZSA9IGludmVyc2VOYW1lO1xuICB9XG5cbiAgZ2V0SW52ZXJzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvclt0aGlzLmludmVyc2VOYW1lXTtcbiAgfVxuXG59O1xuXG5EaXJlY3Rpb24udXAgPSBuZXcgRGlyZWN0aW9uKCd1cCcsIDAsIC0xLCAnZG93bicpO1xuXG5EaXJlY3Rpb24uZG93biA9IG5ldyBEaXJlY3Rpb24oJ2Rvd24nLCAwLCAxLCAndXAnKTtcblxuRGlyZWN0aW9uLmxlZnQgPSBuZXcgRGlyZWN0aW9uKCdsZWZ0JywgLTEsIDAsICdyaWdodCcpO1xuXG5EaXJlY3Rpb24ucmlnaHQgPSBuZXcgRGlyZWN0aW9uKCdyaWdodCcsIDEsIDAsICdsZWZ0Jyk7XG5cbkRpcmVjdGlvbi5hZGphY2VudHMgPSBbRGlyZWN0aW9uLnVwLCBEaXJlY3Rpb24uZG93biwgRGlyZWN0aW9uLmxlZnQsIERpcmVjdGlvbi5yaWdodF07XG5cbkRpcmVjdGlvbi50b3BMZWZ0ID0gbmV3IERpcmVjdGlvbigndG9wTGVmdCcsIC0xLCAtMSwgJ2JvdHRvbVJpZ2h0Jyk7XG5cbkRpcmVjdGlvbi50b3BSaWdodCA9IG5ldyBEaXJlY3Rpb24oJ3RvcFJpZ2h0JywgMSwgLTEsICdib3R0b21MZWZ0Jyk7XG5cbkRpcmVjdGlvbi5ib3R0b21SaWdodCA9IG5ldyBEaXJlY3Rpb24oJ2JvdHRvbVJpZ2h0JywgMSwgMSwgJ3RvcExlZnQnKTtcblxuRGlyZWN0aW9uLmJvdHRvbUxlZnQgPSBuZXcgRGlyZWN0aW9uKCdib3R0b21MZWZ0JywgLTEsIDEsICd0b3BSaWdodCcpO1xuXG5EaXJlY3Rpb24uY29ybmVycyA9IFtEaXJlY3Rpb24udG9wTGVmdCwgRGlyZWN0aW9uLnRvcFJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tUmlnaHQsIERpcmVjdGlvbi5ib3R0b21MZWZ0XTtcblxuRGlyZWN0aW9uLmFsbCA9IFtEaXJlY3Rpb24udXAsIERpcmVjdGlvbi5kb3duLCBEaXJlY3Rpb24ubGVmdCwgRGlyZWN0aW9uLnJpZ2h0LCBEaXJlY3Rpb24udG9wTGVmdCwgRGlyZWN0aW9uLnRvcFJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tUmlnaHQsIERpcmVjdGlvbi5ib3R0b21MZWZ0XTtcbiIsInZhciBEaXJlY3Rpb24sIEVsZW1lbnQsIFRpbGU7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuRGlyZWN0aW9uID0gcmVxdWlyZSgnLi9EaXJlY3Rpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaWxlIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoeDEsIHkxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy54ID0geDE7XG4gICAgICB0aGlzLnkgPSB5MTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0UmVsYXRpdmVUaWxlKHgsIHkpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRhaW5lciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5nZXRUaWxlKHRoaXMueCArIHgsIHRoaXMueSArIHkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpbmREaXJlY3Rpb25PZih0aWxlKSB7XG4gICAgICBpZiAodGlsZS50aWxlKSB7XG4gICAgICAgIHRpbGUgPSB0aWxlLnRpbGU7XG4gICAgICB9XG4gICAgICBpZiAoKHRpbGUueCAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWxsLmZpbmQoKGQpID0+IHtcbiAgICAgICAgICByZXR1cm4gZC54ID09PSB0aWxlLnggLSB0aGlzLnggJiYgZC55ID09PSB0aWxlLnkgLSB0aGlzLnk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFkZENoaWxkKGNoaWxkLCBjaGVja1JlZiA9IHRydWUpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGVja1JlZikge1xuICAgICAgICBjaGlsZC50aWxlID0gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZChjaGlsZCwgY2hlY2tSZWYgPSB0cnVlKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoY2hlY2tSZWYgJiYgY2hpbGQudGlsZSA9PT0gdGhpcykge1xuICAgICAgICByZXR1cm4gY2hpbGQudGlsZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGlzdCh0aWxlKSB7XG4gICAgICB2YXIgY3RuRGlzdCwgcmVmLCB4LCB5O1xuICAgICAgaWYgKCh0aWxlICE9IG51bGwgPyB0aWxlLmdldEZpbmFsVGlsZSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICAgIH1cbiAgICAgIGlmICgoKHRpbGUgIT0gbnVsbCA/IHRpbGUueCA6IHZvaWQgMCkgIT0gbnVsbCkgJiYgKHRpbGUueSAhPSBudWxsKSAmJiAodGhpcy54ICE9IG51bGwpICYmICh0aGlzLnkgIT0gbnVsbCkgJiYgKHRoaXMuY29udGFpbmVyID09PSB0aWxlLmNvbnRhaW5lciB8fCAoY3RuRGlzdCA9IChyZWYgPSB0aGlzLmNvbnRhaW5lcikgIT0gbnVsbCA/IHR5cGVvZiByZWYuZGlzdCA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmRpc3QodGlsZS5jb250YWluZXIpIDogdm9pZCAwIDogdm9pZCAwKSkpIHtcbiAgICAgICAgeCA9IHRpbGUueCAtIHRoaXMueDtcbiAgICAgICAgeSA9IHRpbGUueSAtIHRoaXMueTtcbiAgICAgICAgaWYgKGN0bkRpc3QpIHtcbiAgICAgICAgICB4ICs9IGN0bkRpc3QueDtcbiAgICAgICAgICB5ICs9IGN0bkRpc3QueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgeTogeSxcbiAgICAgICAgICBsZW5ndGg6IE1hdGguc3FydCh4ICogeCArIHkgKiB5KVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RmluYWxUaWxlKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH07XG5cbiAgVGlsZS5wcm9wZXJ0aWVzKHtcbiAgICBjaGlsZHJlbjoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgY29udGFpbmVyOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5jb250YWluZXIgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkamFjZW50VGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZS5pbnZhbGlkYXRlQWRqYWNlbnRUaWxlcygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGphY2VudFRpbGVzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGlvbikge1xuICAgICAgICBpZiAoaW52YWxpZGF0aW9uLnByb3AoJ2NvbnRhaW5lcicpKSB7XG4gICAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5hZGphY2VudHMubWFwKChkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGl2ZVRpbGUoZC54LCBkLnkpO1xuICAgICAgICAgIH0pLmZpbHRlcigodCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHQgIT0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEVsZW1lbnQsIFRpbGVDb250YWluZXIsIFRpbGVSZWZlcmVuY2U7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuVGlsZVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vVGlsZVJlZmVyZW5jZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVDb250YWluZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFRpbGVDb250YWluZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBfYWRkVG9Cb25kYXJpZXModGlsZSwgYm91bmRhcmllcykge1xuICAgICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB0aWxlLnkgPCBib3VuZGFyaWVzLnRvcCkge1xuICAgICAgICBib3VuZGFyaWVzLnRvcCA9IHRpbGUueTtcbiAgICAgIH1cbiAgICAgIGlmICgoYm91bmRhcmllcy5sZWZ0ID09IG51bGwpIHx8IHRpbGUueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgICBib3VuZGFyaWVzLmxlZnQgPSB0aWxlLng7XG4gICAgICB9XG4gICAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IHRpbGUueSA+IGJvdW5kYXJpZXMuYm90dG9tKSB7XG4gICAgICAgIGJvdW5kYXJpZXMuYm90dG9tID0gdGlsZS55O1xuICAgICAgfVxuICAgICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHRpbGUueCA+IGJvdW5kYXJpZXMucmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGJvdW5kYXJpZXMucmlnaHQgPSB0aWxlLng7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHRoaXMuY29vcmRzID0ge307XG4gICAgICByZXR1cm4gdGhpcy50aWxlcyA9IFtdO1xuICAgIH1cblxuICAgIGFkZFRpbGUodGlsZSkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICghdGhpcy50aWxlcy5pbmNsdWRlcyh0aWxlKSkge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIGlmICh0aGlzLmNvb3Jkc1t0aWxlLnhdID09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmNvb3Jkc1t0aWxlLnhdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldID0gdGlsZTtcbiAgICAgICAgaWYgKHRoaXMub3duZXIpIHtcbiAgICAgICAgICB0aWxlLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZWYgPSB0aGlzLl9ib3VuZGFyaWVzKSAhPSBudWxsID8gcmVmLmNhbGN1bGF0ZWQgOiB2b2lkIDApIHtcbiAgICAgICAgICB0aGlzLl9hZGRUb0JvbmRhcmllcyh0aWxlLCB0aGlzLl9ib3VuZGFyaWVzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVtb3ZlVGlsZSh0aWxlKSB7XG4gICAgICB2YXIgaW5kZXgsIHJlZjtcbiAgICAgIGluZGV4ID0gdGhpcy50aWxlcy5pbmRleE9mKHRpbGUpO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBkZWxldGUgdGhpcy5jb29yZHNbdGlsZS54XVt0aWxlLnldO1xuICAgICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlZiA9IHRoaXMuX2JvdW5kYXJpZXMpICE9IG51bGwgPyByZWYuY2FsY3VsYXRlZCA6IHZvaWQgMCkge1xuICAgICAgICAgIGlmICh0aGlzLmJvdW5kYXJpZXMudG9wID09PSB0aWxlLnkgfHwgdGhpcy5ib3VuZGFyaWVzLmJvdHRvbSA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5sZWZ0ID09PSB0aWxlLnggfHwgdGhpcy5ib3VuZGFyaWVzLnJpZ2h0ID09PSB0aWxlLngpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVCb3VuZGFyaWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlVGlsZUF0KHgsIHkpIHtcbiAgICAgIHZhciB0aWxlO1xuICAgICAgaWYgKHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlVGlsZSh0aWxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUaWxlKHgsIHkpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoKChyZWYgPSB0aGlzLmNvb3Jkc1t4XSkgIT0gbnVsbCA/IHJlZlt5XSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb29yZHNbeF1beV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9hZE1hdHJpeChtYXRyaXgpIHtcbiAgICAgIHZhciBvcHRpb25zLCByb3csIHRpbGUsIHgsIHk7XG4gICAgICBmb3IgKHkgaW4gbWF0cml4KSB7XG4gICAgICAgIHJvdyA9IG1hdHJpeFt5XTtcbiAgICAgICAgZm9yICh4IGluIHJvdykge1xuICAgICAgICAgIHRpbGUgPSByb3dbeF07XG4gICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHg6IHBhcnNlSW50KHgpLFxuICAgICAgICAgICAgeTogcGFyc2VJbnQoeSlcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0eXBlb2YgdGlsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFRpbGUodGlsZShvcHRpb25zKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbGUueCA9IG9wdGlvbnMueDtcbiAgICAgICAgICAgIHRpbGUueSA9IG9wdGlvbnMueTtcbiAgICAgICAgICAgIHRoaXMuYWRkVGlsZSh0aWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGluUmFuZ2UodGlsZSwgcmFuZ2UpIHtcbiAgICAgIHZhciBmb3VuZCwgaSwgaiwgcmVmLCByZWYxLCByZWYyLCByZWYzLCB0aWxlcywgeCwgeTtcbiAgICAgIHRpbGVzID0gW107XG4gICAgICByYW5nZS0tO1xuICAgICAgZm9yICh4ID0gaSA9IHJlZiA9IHRpbGUueCAtIHJhbmdlLCByZWYxID0gdGlsZS54ICsgcmFuZ2U7IChyZWYgPD0gcmVmMSA/IGkgPD0gcmVmMSA6IGkgPj0gcmVmMSk7IHggPSByZWYgPD0gcmVmMSA/ICsraSA6IC0taSkge1xuICAgICAgICBmb3IgKHkgPSBqID0gcmVmMiA9IHRpbGUueSAtIHJhbmdlLCByZWYzID0gdGlsZS55ICsgcmFuZ2U7IChyZWYyIDw9IHJlZjMgPyBqIDw9IHJlZjMgOiBqID49IHJlZjMpOyB5ID0gcmVmMiA8PSByZWYzID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgaWYgKE1hdGguc3FydCgoeCAtIHRpbGUueCkgKiAoeCAtIHRpbGUueCkgKyAoeSAtIHRpbGUueSkgKiAoeSAtIHRpbGUueSkpIDw9IHJhbmdlICYmICgoZm91bmQgPSB0aGlzLmdldFRpbGUoeCwgeSkpICE9IG51bGwpKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKGZvdW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICBhbGxUaWxlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNsaWNlKCk7XG4gICAgfVxuXG4gICAgY2xlYXJBbGwoKSB7XG4gICAgICB2YXIgaSwgbGVuLCByZWYsIHRpbGU7XG4gICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICByZWYgPSB0aGlzLnRpbGVzO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aWxlID0gcmVmW2ldO1xuICAgICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jb29yZHMgPSB7fTtcbiAgICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb3Nlc3Qob3JpZ2luVGlsZSwgZmlsdGVyKSB7XG4gICAgICB2YXIgY2FuZGlkYXRlcywgZ2V0U2NvcmU7XG4gICAgICBnZXRTY29yZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICAgICAgICBpZiAoY2FuZGlkYXRlLnNjb3JlICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLnNjb3JlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjYW5kaWRhdGUuc2NvcmUgPSBjYW5kaWRhdGUuZ2V0RmluYWxUaWxlKCkuZGlzdChvcmlnaW5UaWxlKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjYW5kaWRhdGVzID0gdGhpcy50aWxlcy5maWx0ZXIoZmlsdGVyKS5tYXAoKHQpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlUmVmZXJlbmNlKHQpO1xuICAgICAgfSk7XG4gICAgICBjYW5kaWRhdGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldFNjb3JlKGEpIC0gZ2V0U2NvcmUoYik7XG4gICAgICB9KTtcbiAgICAgIGlmIChjYW5kaWRhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZXNbMF0udGlsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvcHkoKSB7XG4gICAgICB2YXIgb3V0O1xuICAgICAgb3V0ID0gbmV3IFRpbGVDb250YWluZXIoKTtcbiAgICAgIG91dC5jb29yZHMgPSB0aGlzLmNvb3JkcztcbiAgICAgIG91dC50aWxlcyA9IHRoaXMudGlsZXM7XG4gICAgICBvdXQub3duZXIgPSBmYWxzZTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgbWVyZ2UoY3RuLCBtZXJnZUZuLCBhc093bmVyID0gZmFsc2UpIHtcbiAgICAgIHZhciBvdXQsIHRtcDtcbiAgICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKCk7XG4gICAgICBvdXQub3duZXIgPSBhc093bmVyO1xuICAgICAgdG1wID0gY3RuLmNvcHkoKTtcbiAgICAgIHRoaXMudGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlQSkge1xuICAgICAgICB2YXIgbWVyZ2VkVGlsZSwgdGlsZUI7XG4gICAgICAgIHRpbGVCID0gdG1wLmdldFRpbGUodGlsZUEueCwgdGlsZUEueSk7XG4gICAgICAgIGlmICh0aWxlQikge1xuICAgICAgICAgIHRtcC5yZW1vdmVUaWxlKHRpbGVCKTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRUaWxlID0gbWVyZ2VGbih0aWxlQSwgdGlsZUIpO1xuICAgICAgICBpZiAobWVyZ2VkVGlsZSkge1xuICAgICAgICAgIHJldHVybiBvdXQuYWRkVGlsZShtZXJnZWRUaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0bXAudGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlQikge1xuICAgICAgICB2YXIgbWVyZ2VkVGlsZTtcbiAgICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4obnVsbCwgdGlsZUIpO1xuICAgICAgICBpZiAobWVyZ2VkVGlsZSkge1xuICAgICAgICAgIHJldHVybiBvdXQuYWRkVGlsZShtZXJnZWRUaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICB9O1xuXG4gIFRpbGVDb250YWluZXIucHJvcGVydGllcyh7XG4gICAgb3duZXI6IHtcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGJvdW5kYXJpZXM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBib3VuZGFyaWVzO1xuICAgICAgICBib3VuZGFyaWVzID0ge1xuICAgICAgICAgIHRvcDogbnVsbCxcbiAgICAgICAgICBsZWZ0OiBudWxsLFxuICAgICAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgICAgICByaWdodDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkVG9Cb25kYXJpZXModGlsZSwgYm91bmRhcmllcyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm91bmRhcmllcztcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlQ29udGFpbmVyO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIFRpbGVSZWZlcmVuY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZVJlZmVyZW5jZSA9IGNsYXNzIFRpbGVSZWZlcmVuY2Uge1xuICBjb25zdHJ1Y3Rvcih0aWxlKSB7XG4gICAgdGhpcy50aWxlID0gdGlsZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICB4OiB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbmFsVGlsZSgpLng7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB5OiB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbmFsVGlsZSgpLnk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEZpbmFsVGlsZSgpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlLmdldEZpbmFsVGlsZSgpO1xuICB9XG5cbn07XG4iLCJ2YXIgRWxlbWVudCwgVGlsZWQ7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGlsZWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBwdXRPblJhbmRvbVRpbGUodGlsZXMpIHtcbiAgICAgIHZhciBmb3VuZDtcbiAgICAgIGZvdW5kID0gdGhpcy5nZXRSYW5kb21WYWxpZFRpbGUodGlsZXMpO1xuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGUgPSBmb3VuZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRSYW5kb21WYWxpZFRpbGUodGlsZXMpIHtcbiAgICAgIHZhciBjYW5kaWRhdGUsIHBvcywgcmVtYWluaW5nO1xuICAgICAgcmVtYWluaW5nID0gdGlsZXMuc2xpY2UoKTtcbiAgICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByZW1haW5pbmcubGVuZ3RoKTtcbiAgICAgICAgY2FuZGlkYXRlID0gcmVtYWluaW5nLnNwbGljZShwb3MsIDEpWzBdO1xuICAgICAgICBpZiAodGhpcy5jYW5Hb09uVGlsZShjYW5kaWRhdGUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY2FuR29PblRpbGUodGlsZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxUaWxlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGlsZS5nZXRGaW5hbFRpbGUoKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaWxlZC5wcm9wZXJ0aWVzKHtcbiAgICB0aWxlOiB7XG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKG9sZCkge1xuICAgICAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgICAgICBvbGQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRpbGUuYWRkQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZnNldFg6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIG9mZnNldFk6IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBUaWxlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkRpcmVjdGlvblwiOiByZXF1aXJlKFwiLi9EaXJlY3Rpb25cIiksXG4gIFwiVGlsZVwiOiByZXF1aXJlKFwiLi9UaWxlXCIpLFxuICBcIlRpbGVDb250YWluZXJcIjogcmVxdWlyZShcIi4vVGlsZUNvbnRhaW5lclwiKSxcbiAgXCJUaWxlUmVmZXJlbmNlXCI6IHJlcXVpcmUoXCIuL1RpbGVSZWZlcmVuY2VcIiksXG4gIFwiVGlsZWRcIjogcmVxdWlyZShcIi4vVGlsZWRcIiksXG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaW1pbmc9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbWluZy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbWluZzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaW1pbmc9VGltaW5nO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgQmFzZVVwZGF0ZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJCYXNlVXBkYXRlclwiKSA/IGRlcGVuZGVuY2llcy5CYXNlVXBkYXRlciA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5VcGRhdGVyO1xudmFyIFRpbWluZztcblRpbWluZyA9IGNsYXNzIFRpbWluZyB7XG4gIGNvbnN0cnVjdG9yKHJ1bm5pbmcgPSB0cnVlKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gcnVubmluZztcbiAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gIH1cblxuICBhZGRDaGlsZChjaGlsZCkge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCk7XG4gICAgaWYgKHRoaXMudXBkYXRlcikge1xuICAgICAgY2hpbGQudXBkYXRlci5kaXNwYXRjaGVyID0gdGhpcy51cGRhdGVyO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIH1cbiAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQ2hpbGQoY2hpbGQpIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGlmIChjaGlsZC5wYXJlbnQgPT09IHRoaXMpIHtcbiAgICAgIGNoaWxkLnBhcmVudCA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdG9nZ2xlKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB2YWwgPSAhdGhpcy5ydW5uaW5nO1xuICAgIH1cbiAgICB0aGlzLnJ1bm5pbmcgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgcmV0dXJuIGNoaWxkLnRvZ2dsZSh2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZSkge1xuICAgIHZhciB0aW1lcjtcbiAgICB0aW1lciA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yLlRpbWVyKHRpbWUsIGNhbGxiYWNrLCB0aGlzLnJ1bm5pbmcpO1xuICAgIHRoaXMuYWRkQ2hpbGQodGltZXIpO1xuICAgIHJldHVybiB0aW1lcjtcbiAgfVxuXG4gIHNldEludGVydmFsKGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgdmFyIHRpbWVyO1xuICAgIHRpbWVyID0gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIodGltZSwgY2FsbGJhY2ssIHRoaXMucnVubmluZywgdHJ1ZSk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aW1lcik7XG4gICAgcmV0dXJuIHRpbWVyO1xuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKGZhbHNlKTtcbiAgfVxuXG4gIHVucGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKHRydWUpO1xuICB9XG5cbn07XG5cblRpbWluZy5UaW1lciA9IGNsYXNzIFRpbWVyIHtcbiAgY29uc3RydWN0b3IodGltZTEsIGNhbGxiYWNrLCBydW5uaW5nID0gdHJ1ZSwgcmVwZWF0ID0gZmFsc2UpIHtcbiAgICB0aGlzLnRpbWUgPSB0aW1lMTtcbiAgICB0aGlzLnJ1bm5pbmcgPSBydW5uaW5nO1xuICAgIHRoaXMucmVwZWF0ID0gcmVwZWF0O1xuICAgIHRoaXMucmVtYWluaW5nVGltZSA9IHRoaXMudGltZTtcbiAgICB0aGlzLnVwZGF0ZXIgPSBuZXcgVGltaW5nLlVwZGF0ZXIodGhpcyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IEJhc2VVcGRhdGVyKCk7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoZXIuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICB0aGlzLl9zdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBub3coKSB7XG4gICAgdmFyIHJlZjtcbiAgICBpZiAoKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93ICE9PSBudWxsID8gKHJlZiA9IHdpbmRvdy5wZXJmb3JtYW5jZSkgIT0gbnVsbCA/IHJlZi5ub3cgOiB2b2lkIDAgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCA/IHByb2Nlc3MudXB0aW1lIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcHJvY2Vzcy51cHRpbWUoKSAqIDEwMDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZSh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdmFsID0gIXRoaXMucnVubmluZztcbiAgICB9XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdG9wKCk7XG4gICAgfVxuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKGZhbHNlKTtcbiAgfVxuXG4gIHVucGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlKHRydWUpO1xuICB9XG5cbiAgZ2V0RWxhcHNlZFRpbWUoKSB7XG4gICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSArIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICB9XG4gIH1cblxuICBzZXRFbGFwc2VkVGltZSh2YWwpIHtcbiAgICB0aGlzLl9zdG9wKCk7XG4gICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gdmFsO1xuICAgIHJldHVybiB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgZ2V0UHJjKCkge1xuICAgIHJldHVybiB0aGlzLmdldEVsYXBzZWRUaW1lKCkgLyB0aGlzLnRpbWU7XG4gIH1cblxuICBzZXRQcmModmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0RWxhcHNlZFRpbWUodGhpcy50aW1lICogdmFsKTtcbiAgfVxuXG4gIF9zdGFydCgpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMudXBkYXRlci5mb3J3YXJkQ2FsbGJhY2tzKCk7XG4gICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5vdygpO1xuICAgIGlmICh0aGlzLnJlcGVhdCAmJiAhdGhpcy5pbnRlcnVwdGVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5pZCA9IHNldEludGVydmFsKHRoaXMudGljay5iaW5kKHRoaXMpLCB0aGlzLnJlbWFpbmluZ1RpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy50aWNrLmJpbmQodGhpcyksIHRoaXMucmVtYWluaW5nVGltZSk7XG4gICAgfVxuICB9XG5cbiAgX3N0b3AoKSB7XG4gICAgdmFyIHdhc0ludGVydXB0ZWQ7XG4gICAgd2FzSW50ZXJ1cHRlZCA9IHRoaXMuaW50ZXJ1cHRlZDtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLnVwZGF0ZXIudW5mb3J3YXJkQ2FsbGJhY2tzKCk7XG4gICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gKHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSk7XG4gICAgdGhpcy5pbnRlcnVwdGVkID0gdGhpcy5yZW1haW5pbmdUaW1lICE9PSB0aGlzLnRpbWU7XG4gICAgaWYgKHRoaXMucmVwZWF0ICYmICF3YXNJbnRlcnVwdGVkKSB7XG4gICAgICByZXR1cm4gY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICB9XG4gIH1cblxuICB0aWNrKCkge1xuICAgIHZhciB3YXNJbnRlcnVwdGVkO1xuICAgIHdhc0ludGVydXB0ZWQgPSB0aGlzLmludGVydXB0ZWQ7XG4gICAgdGhpcy5pbnRlcnVwdGVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMucmVwZWF0KSB7XG4gICAgICB0aGlzLnJlbWFpbmluZ1RpbWUgPSB0aGlzLnRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtYWluaW5nVGltZSA9IDA7XG4gICAgfVxuICAgIHRoaXMuZGlzcGF0Y2hlci51cGRhdGUoKTtcbiAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgIGlmICh3YXNJbnRlcnVwdGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGFydCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5ub3coKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMucmVwZWF0KSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlci5kZXN0cm95KCk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gIH1cblxufTtcblxuVGltaW5nLlVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3IocGFyZW50KSB7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IEJhc2VVcGRhdGVyKCk7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgfVxuXG4gIGFkZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlZjtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICgoKHJlZiA9IHRoaXMucGFyZW50KSAhPSBudWxsID8gcmVmLnJ1bm5pbmcgOiB2b2lkIDApICYmIHRoaXMuZGlzcGF0Y2hlcikge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpZiAodGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLnJlbW92ZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBnZXRCaW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlcikge1xuICAgICAgcmV0dXJuIG5ldyBCYXNlVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZENhbGxiYWNrcygpIHtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1bmZvcndhcmRDYWxsYmFja3MoKSB7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlcikge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoZXIucmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnVuZm9yd2FyZENhbGxiYWNrcygpO1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgfVxuXG59O1xuXG5yZXR1cm4oVGltaW5nKTt9KTsiLCJ2YXIgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciwgQ29ubmVjdGVkLCBFbGVtZW50LCBTaWduYWxPcGVyYXRpb247XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxuU2lnbmFsT3BlcmF0aW9uID0gcmVxdWlyZSgnLi9TaWduYWxPcGVyYXRpb24nKTtcblxuQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5JbnZhbGlkYXRlZC5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RlZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29ubmVjdGVkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY2FuQ29ubmVjdFRvKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB0YXJnZXQuYWRkU2lnbmFsID09PSBcImZ1bmN0aW9uXCI7XG4gICAgfVxuXG4gICAgYWNjZXB0U2lnbmFsKHNpZ25hbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgb25BZGRDb25uZWN0aW9uKGNvbm4pIHt9XG5cbiAgICBvblJlbW92ZUNvbm5lY3Rpb24oY29ubikge31cblxuICAgIG9uTmV3U2lnbmFsVHlwZShzaWduYWwpIHt9XG5cbiAgICBvbkFkZFNpZ25hbChzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZW1vdmVTaWduYWwoc2lnbmFsLCBvcCkge31cblxuICAgIG9uUmVtb3ZlU2lnbmFsVHlwZShzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZXBsYWNlU2lnbmFsKG9sZFNpZ25hbCwgbmV3U2lnbmFsLCBvcCkge31cblxuICAgIGNvbnRhaW5zU2lnbmFsKHNpZ25hbCwgY2hlY2tMYXN0ID0gZmFsc2UsIGNoZWNrT3JpZ2luKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzLmZpbmQoZnVuY3Rpb24oYykge1xuICAgICAgICByZXR1cm4gYy5tYXRjaChzaWduYWwsIGNoZWNrTGFzdCwgY2hlY2tPcmlnaW4pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkU2lnbmFsKHNpZ25hbCwgb3ApIHtcbiAgICAgIHZhciBhdXRvU3RhcnQ7XG4gICAgICBpZiAoIShvcCAhPSBudWxsID8gb3AuZmluZExpbWl0ZXIodGhpcykgOiB2b2lkIDApKSB7XG4gICAgICAgIGlmICghb3ApIHtcbiAgICAgICAgICBvcCA9IG5ldyBTaWduYWxPcGVyYXRpb24oKTtcbiAgICAgICAgICBhdXRvU3RhcnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgdmFyIHNpbWlsYXI7XG4gICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zU2lnbmFsKHNpZ25hbCwgdHJ1ZSkgJiYgdGhpcy5hY2NlcHRTaWduYWwoc2lnbmFsKSkge1xuICAgICAgICAgICAgc2ltaWxhciA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy5wdXNoKHNpZ25hbCk7XG4gICAgICAgICAgICB0aGlzLm9uQWRkU2lnbmFsKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgaWYgKCFzaW1pbGFyKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uTmV3U2lnbmFsVHlwZShzaWduYWwsIG9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoYXV0b1N0YXJ0KSB7XG4gICAgICAgICAgb3Auc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNpZ25hbDtcbiAgICB9XG5cbiAgICByZW1vdmVTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIGF1dG9TdGFydDtcbiAgICAgIGlmICghKG9wICE9IG51bGwgPyBvcC5maW5kTGltaXRlcih0aGlzKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgIG9wID0gbmV3IFNpZ25hbE9wZXJhdGlvbjtcbiAgICAgICAgICBhdXRvU3RhcnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgdmFyIGV4aXN0aW5nO1xuICAgICAgICAgIGlmICgoZXhpc3RpbmcgPSB0aGlzLmNvbnRhaW5zU2lnbmFsKHNpZ25hbCwgdHJ1ZSkpICYmIHRoaXMuYWNjZXB0U2lnbmFsKHNpZ25hbCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy5zcGxpY2UodGhpcy5zaWduYWxzLmluZGV4T2YoZXhpc3RpbmcpLCAxKTtcbiAgICAgICAgICAgIHRoaXMub25SZW1vdmVTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICBvcC5hZGRPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICAgICAgICB2YXIgc2ltaWxhcjtcbiAgICAgICAgICAgICAgc2ltaWxhciA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgICAgICAgaWYgKHNpbWlsYXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vblJlcGxhY2VTaWduYWwoc2lnbmFsLCBzaW1pbGFyLCBvcCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25SZW1vdmVTaWduYWxUeXBlKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0ZXBCeVN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybiBvcC5zdGVwKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGF1dG9TdGFydCkge1xuICAgICAgICAgIHJldHVybiBvcC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpIHtcbiAgICAgIGlmIChzaWduYWwubGFzdCA9PT0gdGhpcykge1xuICAgICAgICByZXR1cm4gc2lnbmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNpZ25hbC53aXRoTGFzdCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0ZvcndhcmRXYXRjaGVyKCkge1xuICAgICAgaWYgKCF0aGlzLmZvcndhcmRXYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZm9yd2FyZFdhdGNoZXIgPSBuZXcgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgICAgc2NvcGU6IHRoaXMsXG4gICAgICAgICAgcHJvcGVydHk6ICdvdXRwdXRzJyxcbiAgICAgICAgICBvbkFkZGVkOiBmdW5jdGlvbihvdXRwdXQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRlZFNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRTaWduYWxUbyhzaWduYWwsIG91dHB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uUmVtb3ZlZDogZnVuY3Rpb24ob3V0cHV0LCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkZWRTaWduYWxzLmZvckVhY2goKHNpZ25hbCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9wRm9yd2FyZGVkU2lnbmFsVG8oc2lnbmFsLCBvdXRwdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZFdhdGNoZXIuYmluZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcndhcmRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICB0aGlzLmZvcndhcmRlZFNpZ25hbHMuYWRkKHNpZ25hbCk7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICB0aGlzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihjb25uKSB7XG4gICAgICAgIGlmIChzaWduYWwubGFzdCAhPT0gY29ubikge1xuICAgICAgICAgIHJldHVybiBjb25uLmFkZFNpZ25hbChuZXh0LCBvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tGb3J3YXJkV2F0Y2hlcigpO1xuICAgIH1cblxuICAgIGZvcndhcmRBbGxTaWduYWxzVG8oY29ubiwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgIHJldHVybiBjb25uLmFkZFNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdG9wRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCwgb3ApIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgdGhpcy5mb3J3YXJkZWRTaWduYWxzLnJlbW92ZShzaWduYWwpO1xuICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbm4ucmVtb3ZlU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RvcEFsbEZvcndhcmRlZFNpZ25hbFRvKGNvbm4sIG9wKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWduYWxzLmZvckVhY2goKHNpZ25hbCkgPT4ge1xuICAgICAgICB2YXIgbmV4dDtcbiAgICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgICByZXR1cm4gY29ubi5yZW1vdmVTaWduYWwobmV4dCwgb3ApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZm9yd2FyZFNpZ25hbFRvKHNpZ25hbCwgY29ubiwgb3ApIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgIHJldHVybiBjb25uLmFkZFNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RvcEZvcndhcmRlZFNpZ25hbFRvKHNpZ25hbCwgY29ubiwgb3ApIHtcbiAgICAgIHZhciBuZXh0O1xuICAgICAgbmV4dCA9IHRoaXMucHJlcEZvcndhcmRlZFNpZ25hbChzaWduYWwpO1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgIHJldHVybiBjb25uLnJlbW92ZVNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgQ29ubmVjdGVkLnByb3BlcnRpZXMoe1xuICAgIHNpZ25hbHM6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWVcbiAgICB9LFxuICAgIGlucHV0czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgb3V0cHV0czoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgZm9yd2FyZGVkU2lnbmFsczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIENvbm5lY3RlZDtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBFbGVtZW50LCBTaWduYWw7XG5cbkVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwgPSBjbGFzcyBTaWduYWwgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3Iob3JpZ2luLCB0eXBlID0gJ3NpZ25hbCcsIGV4Y2x1c2l2ZSA9IGZhbHNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9yaWdpbiA9IG9yaWdpbjtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZXhjbHVzaXZlID0gZXhjbHVzaXZlO1xuICAgIHRoaXMubGFzdCA9IHRoaXMub3JpZ2luO1xuICB9XG5cbiAgd2l0aExhc3QobGFzdCkge1xuICAgIHZhciBzaWduYWw7XG4gICAgc2lnbmFsID0gbmV3IHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yKHRoaXMub3JpZ2luLCB0aGlzLnR5cGUsIHRoaXMuZXhjbHVzaXZlKTtcbiAgICBzaWduYWwubGFzdCA9IGxhc3Q7XG4gICAgcmV0dXJuIHNpZ25hbDtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgdmFyIHNpZ25hbDtcbiAgICBzaWduYWwgPSBuZXcgdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3IodGhpcy5vcmlnaW4sIHRoaXMudHlwZSwgdGhpcy5leGNsdXNpdmUpO1xuICAgIHNpZ25hbC5sYXN0ID0gdGhpcy5sYXN0O1xuICAgIHJldHVybiBzaWduYWw7XG4gIH1cblxuICBtYXRjaChzaWduYWwsIGNoZWNrTGFzdCA9IGZhbHNlLCBjaGVja09yaWdpbiA9IHRoaXMuZXhjbHVzaXZlKSB7XG4gICAgcmV0dXJuICghY2hlY2tMYXN0IHx8IHNpZ25hbC5sYXN0ID09PSB0aGlzLmxhc3QpICYmIChjaGVja09yaWdpbiB8fCBzaWduYWwub3JpZ2luID09PSB0aGlzLm9yaWdpbikgJiYgc2lnbmFsLnR5cGUgPT09IHRoaXMudHlwZTtcbiAgfVxuXG59O1xuIiwidmFyIEVsZW1lbnQsIFNpZ25hbE9wZXJhdGlvbjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbE9wZXJhdGlvbiA9IGNsYXNzIFNpZ25hbE9wZXJhdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB0aGlzLmxpbWl0ZXJzID0gW107XG4gIH1cblxuICBhZGRPcGVyYXRpb24oZnVuY3QsIHByaW9yaXR5ID0gMSkge1xuICAgIGlmIChwcmlvcml0eSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUudW5zaGlmdChmdW5jdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnB1c2goZnVuY3QpO1xuICAgIH1cbiAgfVxuXG4gIGFkZExpbWl0ZXIoY29ubmVjdGVkKSB7XG4gICAgaWYgKCF0aGlzLmZpbmRMaW1pdGVyKGNvbm5lY3RlZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmxpbWl0ZXJzLnB1c2goY29ubmVjdGVkKTtcbiAgICB9XG4gIH1cblxuICBmaW5kTGltaXRlcihjb25uZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy5saW1pdGVycy5pbmRleE9mKGNvbm5lY3RlZCkgPiAtMTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHZhciByZXN1bHRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnN0ZXAoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgc3RlcCgpIHtcbiAgICB2YXIgZnVuY3Q7XG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5kb25lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bmN0ID0gdGhpcy5xdWV1ZS5zaGlmdChmdW5jdCk7XG4gICAgICByZXR1cm4gZnVuY3QodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgZG9uZSgpIHt9XG5cbn07XG4iLCJ2YXIgQ29ubmVjdGVkLCBTaWduYWwsIFNpZ25hbE9wZXJhdGlvbiwgU2lnbmFsU291cmNlO1xuXG5Db25uZWN0ZWQgPSByZXF1aXJlKCcuL0Nvbm5lY3RlZCcpO1xuXG5TaWduYWwgPSByZXF1aXJlKCcuL1NpZ25hbCcpO1xuXG5TaWduYWxPcGVyYXRpb24gPSByZXF1aXJlKCcuL1NpZ25hbE9wZXJhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbFNvdXJjZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgU2lnbmFsU291cmNlIGV4dGVuZHMgQ29ubmVjdGVkIHt9O1xuXG4gIFNpZ25hbFNvdXJjZS5wcm9wZXJ0aWVzKHtcbiAgICBhY3RpdmF0ZWQ6IHtcbiAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcDtcbiAgICAgICAgb3AgPSBuZXcgU2lnbmFsT3BlcmF0aW9uKCk7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgICAgIHRoaXMuZm9yd2FyZFNpZ25hbCh0aGlzLnNpZ25hbCwgb3ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc3RvcEZvcndhcmRlZFNpZ25hbCh0aGlzLnNpZ25hbCwgb3ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcC5zdGFydCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2lnbmFsOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFNpZ25hbCh0aGlzLCAncG93ZXInLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBTaWduYWxTb3VyY2U7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgQ29ubmVjdGVkLCBTd2l0Y2g7XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3dpdGNoID0gY2xhc3MgU3dpdGNoIGV4dGVuZHMgQ29ubmVjdGVkIHt9O1xuIiwidmFyIENvbm5lY3RlZCwgRGlyZWN0aW9uLCBUaWxlZCwgV2lyZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cblRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkO1xuXG5EaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uO1xuXG5Db25uZWN0ZWQgPSByZXF1aXJlKCcuL0Nvbm5lY3RlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdpcmUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIFdpcmUgZXh0ZW5kcyBUaWxlZCB7XG4gICAgY29uc3RydWN0b3Iod2lyZVR5cGUgPSAncmVkJykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMud2lyZVR5cGUgPSB3aXJlVHlwZTtcbiAgICB9XG5cbiAgICBmaW5kRGlyZWN0aW9uc1RvKGNvbm4pIHtcbiAgICAgIHZhciBkaXJlY3Rpb25zO1xuICAgICAgZGlyZWN0aW9ucyA9IGNvbm4udGlsZXMgIT0gbnVsbCA/IGNvbm4udGlsZXMubWFwKCh0aWxlKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGUuZmluZERpcmVjdGlvbk9mKHRpbGUpO1xuICAgICAgfSkgOiBbdGhpcy50aWxlLmZpbmREaXJlY3Rpb25PZihjb25uKV07XG4gICAgICByZXR1cm4gZGlyZWN0aW9ucy5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAhPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2FuQ29ubmVjdFRvKHRhcmdldCkge1xuICAgICAgcmV0dXJuIENvbm5lY3RlZC5wcm90b3R5cGUuY2FuQ29ubmVjdFRvLmNhbGwodGhpcywgdGFyZ2V0KSAmJiAoKHRhcmdldC53aXJlVHlwZSA9PSBudWxsKSB8fCB0YXJnZXQud2lyZVR5cGUgPT09IHRoaXMud2lyZVR5cGUpO1xuICAgIH1cblxuICAgIG9uTmV3U2lnbmFsVHlwZShzaWduYWwsIG9wKSB7XG4gICAgICByZXR1cm4gdGhpcy5mb3J3YXJkU2lnbmFsKHNpZ25hbCwgb3ApO1xuICAgIH1cblxuICB9O1xuXG4gIFdpcmUuZXh0ZW5kKENvbm5lY3RlZCk7XG5cbiAgV2lyZS5wcm9wZXJ0aWVzKHtcbiAgICBvdXRwdXRzOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGlvbikge1xuICAgICAgICB2YXIgcGFyZW50O1xuICAgICAgICBwYXJlbnQgPSBpbnZhbGlkYXRpb24ucHJvcCgndGlsZScpO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGludmFsaWRhdGlvbi5wcm9wKCdhZGphY2VudFRpbGVzJywgcGFyZW50KS5yZWR1Y2UoKHJlcywgdGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoaW52YWxpZGF0aW9uLnByb3AoJ2NoaWxkcmVuJywgdGlsZSkuZmlsdGVyKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYW5Db25uZWN0VG8oY2hpbGQpO1xuICAgICAgICAgICAgfSkudG9BcnJheSgpKTtcbiAgICAgICAgICB9LCBbXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBjb25uZWN0ZWREaXJlY3Rpb25zOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdGlvbikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0aW9uLnByb3AoJ291dHB1dHMnKS5yZWR1Y2UoKG91dCwgY29ubikgPT4ge1xuICAgICAgICAgIHRoaXMuZmluZERpcmVjdGlvbnNUbyhjb25uKS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwob3V0LCBkKSA8IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG91dC5wdXNoKGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXaXJlO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQ29ubmVjdGVkXCI6IHJlcXVpcmUoXCIuL0Nvbm5lY3RlZFwiKSxcbiAgXCJTaWduYWxcIjogcmVxdWlyZShcIi4vU2lnbmFsXCIpLFxuICBcIlNpZ25hbE9wZXJhdGlvblwiOiByZXF1aXJlKFwiLi9TaWduYWxPcGVyYXRpb25cIiksXG4gIFwiU2lnbmFsU291cmNlXCI6IHJlcXVpcmUoXCIuL1NpZ25hbFNvdXJjZVwiKSxcbiAgXCJTd2l0Y2hcIjogcmVxdWlyZShcIi4vU3dpdGNoXCIpLFxuICBcIldpcmVcIjogcmVxdWlyZShcIi4vV2lyZVwiKSxcbn0iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIEJpbmRlciwgUmVmZXJyZWQ7XG5cblJlZmVycmVkID0gcmVxdWlyZSgnLi9SZWZlcnJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJpbmRlciA9IGNsYXNzIEJpbmRlciBleHRlbmRzIFJlZmVycmVkIHtcbiAgdG9nZ2xlQmluZCh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnVuYmluZCgpO1xuICAgIH1cbiAgfVxuXG4gIGJpbmQoKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb0JpbmQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmluZGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGNhbkJpbmQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmNhbGxiYWNrICE9IG51bGwpICYmICh0aGlzLnRhcmdldCAhPSBudWxsKTtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iaW5kZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGRvVW5iaW5kKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBlcXVhbHMoYmluZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZVJlZmVyZWQoYmluZGVyKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgcmV0dXJuIHRoaXMudW5iaW5kKCk7XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9CaW5kZXIuanMubWFwXG4iLCJ2YXIgQ29sbGVjdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb2xsZWN0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihhcnIpIHtcbiAgICAgIGlmIChhcnIgIT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnIudG9BcnJheSgpO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hhbmdlZCgpIHt9XG5cbiAgICBjaGVja0NoYW5nZXMob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgICAgaWYgKGNvbXBhcmVGdW5jdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2xkID0gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jb3VudCgpICE9PSBvbGQubGVuZ3RoIHx8IChvcmRlcmVkID8gdGhpcy5zb21lKGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgICAgICByZXR1cm4gIWNvbXBhcmVGdW5jdGlvbihvbGQuZ2V0KGkpLCB2YWwpO1xuICAgICAgfSkgOiB0aGlzLnNvbWUoZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbihiKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVGdW5jdGlvbihhLCBiKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgZ2V0KGkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheVtpXTtcbiAgICB9XG5cbiAgICBnZXRSYW5kb20oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV07XG4gICAgfVxuXG4gICAgc2V0KGksIHZhbCkge1xuICAgICAgdmFyIG9sZDtcbiAgICAgIGlmICh0aGlzLl9hcnJheVtpXSAhPT0gdmFsKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbDtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIGFkZCh2YWwpIHtcbiAgICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKHZhbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlKHZhbCkge1xuICAgICAgdmFyIGluZGV4LCBvbGQ7XG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwbHVjayhmbikge1xuICAgICAgdmFyIGZvdW5kLCBpbmRleCwgb2xkO1xuICAgICAgaW5kZXggPSB0aGlzLl9hcnJheS5maW5kSW5kZXgoZm4pO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XG4gICAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdO1xuICAgICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdG9BcnJheSgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xuICAgIH1cblxuICAgIGNvdW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBzdGF0aWMgbmV3U3ViQ2xhc3MoZm4sIGFycikge1xuICAgICAgdmFyIFN1YkNsYXNzO1xuICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgU3ViQ2xhc3MgPSBjbGFzcyBleHRlbmRzIHRoaXMge307XG4gICAgICAgIE9iamVjdC5hc3NpZ24oU3ViQ2xhc3MucHJvdG90eXBlLCBmbik7XG4gICAgICAgIHJldHVybiBuZXcgU3ViQ2xhc3MoYXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhhcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvcHkoYXJyKSB7XG4gICAgICB2YXIgY29sbDtcbiAgICAgIGlmIChhcnIgPT0gbnVsbCkge1xuICAgICAgICBhcnIgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIH1cbiAgICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpO1xuICAgICAgcmV0dXJuIGNvbGw7XG4gICAgfVxuXG4gICAgZXF1YWxzKGFycikge1xuICAgICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuIGFycltpXSA9PT0gdmFsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0QWRkZWRGcm9tKGFycikge1xuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiAhYXJyLmluY2x1ZGVzKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UmVtb3ZlZEZyb20oYXJyKSB7XG4gICAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMuaW5jbHVkZXMoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBDb2xsZWN0aW9uLnJlYWRGdW5jdGlvbnMgPSBbJ2V2ZXJ5JywgJ2ZpbmQnLCAnZmluZEluZGV4JywgJ2ZvckVhY2gnLCAnaW5jbHVkZXMnLCAnaW5kZXhPZicsICdqb2luJywgJ2xhc3RJbmRleE9mJywgJ21hcCcsICdyZWR1Y2UnLCAncmVkdWNlUmlnaHQnLCAnc29tZScsICd0b1N0cmluZyddO1xuXG4gIENvbGxlY3Rpb24ucmVhZExpc3RGdW5jdGlvbnMgPSBbJ2NvbmNhdCcsICdmaWx0ZXInLCAnc2xpY2UnXTtcblxuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXTtcblxuICBDb2xsZWN0aW9uLnJlYWRGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbihmdW5jdCkge1xuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKTtcbiAgICB9O1xuICB9KTtcblxuICBDb2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpKTtcbiAgICB9O1xuICB9KTtcblxuICBDb2xsZWN0aW9uLndyaXRlZnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcbiAgICByZXR1cm4gQ29sbGVjdGlvbi5wcm90b3R5cGVbZnVuY3RdID0gZnVuY3Rpb24oLi4uYXJnKSB7XG4gICAgICB2YXIgb2xkLCByZXM7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHJlcyA9IHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuXG4gIHJldHVybiBDb2xsZWN0aW9uO1xuXG59KS5jYWxsKHRoaXMpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY291bnQoKTtcbiAgfVxufSk7XG5cbmlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IHZvaWQgMCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgfTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Db2xsZWN0aW9uLmpzLm1hcFxuIiwidmFyIEVsZW1lbnQsIE1peGFibGUsIFByb3BlcnR5O1xuXG5Qcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHknKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQgPSBjbGFzcyBFbGVtZW50IGV4dGVuZHMgTWl4YWJsZSB7XG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiAodGhpcy5zZXRQcm9wZXJ0aWVzICE9IG51bGwpKSB7XG4gICAgICB0aGlzLnNldFByb3BlcnRpZXMoZGF0YSk7XG4gICAgfVxuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgdGFwKG5hbWUpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG5hbWUuYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2FsbGJhY2sobmFtZSkge1xuICAgIGlmICh0aGlzLl9jYWxsYmFja3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLl9jYWxsYmFja3NbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdLm93bmVyID0gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tuYW1lXTtcbiAgfVxuXG4gIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gWydfcHJvcGVydGllcyddLmNvbmNhdCh0aGlzLl9wcm9wZXJ0aWVzLm1hcChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHJldHVybiBwcm9wLm5hbWU7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICB2YXIgaSwgbGVuLCBvcHRpb25zLCBwcm9wZXJ0eSwgcmVmLCByZXN1bHRzO1xuICAgIGlmICh0aGlzLl9wcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgIHJlZiA9IHRoaXMuX3Byb3BlcnRpZXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcHJvcGVydHkgPSByZWZbaV07XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0eS5vcHRpb25zKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKChuZXcgUHJvcGVydHkocHJvcGVydHkubmFtZSwgb3B0aW9ucykpLmJpbmQodGFyZ2V0KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgcHJvcGVydHkocHJvcCwgZGVzYykge1xuICAgIHJldHVybiAobmV3IFByb3BlcnR5KHByb3AsIGRlc2MpKS5iaW5kKHRoaXMucHJvdG90eXBlKTtcbiAgfVxuXG4gIHN0YXRpYyBwcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICB2YXIgZGVzYywgcHJvcCwgcmVzdWx0cztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChwcm9wIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGRlc2MgPSBwcm9wZXJ0aWVzW3Byb3BdO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucHJvcGVydHkocHJvcCwgZGVzYykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0VsZW1lbnQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBFdmVudEJpbmQ7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4vQmluZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRCaW5kID0gY2xhc3MgRXZlbnRCaW5kIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50MTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDE7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9XG5cbiAgZ2V0UmVmKCkge1xuICAgIHJldHVybiB7XG4gICAgICBldmVudDogdGhpcy5ldmVudCxcbiAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgIH07XG4gIH1cblxuICBiaW5kVG8odGFyZ2V0KSB7XG4gICAgdGhpcy51bmJpbmQoKTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICByZXR1cm4gdGhpcy5iaW5kKCk7XG4gIH1cblxuICBkb0JpbmQoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcbiAgICB9XG4gIH1cblxuICBkb1VuYmluZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfVxuICB9XG5cbiAgZXF1YWxzKGV2ZW50QmluZCkge1xuICAgIHJldHVybiBzdXBlci5lcXVhbHMoZXZlbnRCaW5kKSAmJiBldmVudEJpbmQuZXZlbnQgPT09IHRoaXMuZXZlbnQ7XG4gIH1cblxuICBtYXRjaChldmVudCwgdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGV2ZW50ID09PSB0aGlzLmV2ZW50ICYmIHRhcmdldCA9PT0gdGhpcy50YXJnZXQ7XG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xuICAgIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEJpbmQuanMubWFwXG4iLCJ2YXIgRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRXZlbnRFbWl0dGVyIHtcbiAgICBnZXRBbGxFdmVudHMoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgfVxuXG4gICAgZ2V0TGlzdGVuZXJzKGUpIHtcbiAgICAgIHZhciBldmVudHM7XG4gICAgICBldmVudHMgPSB0aGlzLmdldEFsbEV2ZW50cygpO1xuICAgICAgcmV0dXJuIGV2ZW50c1tlXSB8fCAoZXZlbnRzW2VdID0gW10pO1xuICAgIH1cblxuICAgIGhhc0xpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRMaXN0ZW5lcnMoZSkuaW5jbHVkZXMobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIGFkZExpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzTGlzdGVuZXIoZSwgbGlzdGVuZXIpKSB7XG4gICAgICAgIHRoaXMuZ2V0TGlzdGVuZXJzKGUpLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKSB7fVxuXG4gICAgcmVtb3ZlTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBpbmRleCwgbGlzdGVuZXJzO1xuICAgICAgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnMoZSk7XG4gICAgICBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyUmVtb3ZlZChlLCBsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGlzdGVuZXJSZW1vdmVkKGUsIGxpc3RlbmVyKSB7fVxuXG4gICAgZW1pdEV2ZW50KGUsIC4uLmFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKS5zbGljZSgpO1xuICAgICAgcmV0dXJuIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lciguLi5hcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUFsbExpc3RlbmVycygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICB9XG5cbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRFdmVudDtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5cbiAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FdmVudEVtaXR0ZXIuanMubWFwXG4iLCJ2YXIgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyLCBJbnZhbGlkYXRvciwgUHJvcGVydHlXYXRjaGVyO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5V2F0Y2hlcicpO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgUHJvcGVydHlXYXRjaGVyIHtcbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZSA9IG9wdGlvbnMuYWN0aXZlO1xuICB9XG5cbiAgc2hvdWxkQmluZCgpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGlmICh0aGlzLmFjdGl2ZSAhPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IuY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICAgIGFjdGl2ZSA9IHRoaXMuYWN0aXZlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcy5tYXBcbiIsInZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBQcm9wZXJ0eVdhdGNoZXI7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4vUHJvcGVydHlXYXRjaGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBQcm9wZXJ0eVdhdGNoZXIge1xuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5vbkFkZGVkID0gb3B0aW9ucy5vbkFkZGVkO1xuICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZCA9IG9wdGlvbnMub25SZW1vdmVkO1xuICB9XG5cbiAgaGFuZGxlQ2hhbmdlKHZhbHVlLCBvbGQpIHtcbiAgICBvbGQgPSB2YWx1ZS5jb3B5KG9sZCB8fCBbXSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgb2xkKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCFvbGQuaW5jbHVkZXMoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vbkFkZGVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb2xkLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZC5jYWxsKHRoaXMuc2NvcGUsIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9JbnZhbGlkYXRlZC9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIEludmFsaWRhdGVkLCBJbnZhbGlkYXRvcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkID0gY2xhc3MgSW52YWxpZGF0ZWQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKCEoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuaW5pdEJ5TG9hZGVyIDogdm9pZCAwKSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVua25vd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMuc2NvcGUpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICB0aGlzLmhhbmRsZVVwZGF0ZSh0aGlzLmludmFsaWRhdG9yKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGhhbmRsZVVwZGF0ZShpbnZhbGlkYXRvcikge1xuICAgIGlmICh0aGlzLnNjb3BlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgaW52YWxpZGF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhpbnZhbGlkYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBQcm9wZXJ0eVdhdGNoZXI7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4uL0JpbmRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIFByb3BlcnR5V2F0Y2hlciBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMxKSB7XG4gICAgdmFyIHJlZjtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMxO1xuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH07XG4gICAgdGhpcy51cGRhdGVDYWxsYmFjayA9IChvbGQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZShvbGQpO1xuICAgIH07XG4gICAgaWYgKHRoaXMub3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgfVxuICAgIGlmICghKCgocmVmID0gdGhpcy5vcHRpb25zKSAhPSBudWxsID8gcmVmLmluaXRCeUxvYWRlciA6IHZvaWQgMCkgJiYgKHRoaXMub3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgdGhpcy5wcm9wZXJ0eSA9IG9wdGlvbnMucHJvcGVydHk7XG4gICAgdGhpcy5jYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgcmV0dXJuIHRoaXMuYXV0b0JpbmQgPSBvcHRpb25zLmF1dG9CaW5kO1xuICB9XG5cbiAgY29weVdpdGgob3B0KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3RvcihPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdCkpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5hdXRvQmluZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvcGVydHkoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gdGhpcy5zY29wZS5nZXRQcm9wZXJ0eUluc3RhbmNlKHRoaXMucHJvcGVydHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eTtcbiAgfVxuXG4gIGNoZWNrQmluZCgpIHtcbiAgICByZXR1cm4gdGhpcy50b2dnbGVCaW5kKHRoaXMuc2hvdWxkQmluZCgpKTtcbiAgfVxuXG4gIHNob3VsZEJpbmQoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjYW5CaW5kKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkgIT0gbnVsbDtcbiAgfVxuXG4gIGRvQmluZCgpIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5vbignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5vbigndXBkYXRlZCcsIHRoaXMudXBkYXRlQ2FsbGJhY2spO1xuICB9XG5cbiAgZG9VbmJpbmQoKSB7XG4gICAgdGhpcy5nZXRQcm9wZXJ0eSgpLm9mZignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5vZmYoJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldFJlZigpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3BlcnR5LFxuICAgICAgICB0YXJnZXQ6IHRoaXMuc2NvcGUsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wZXJ0eS5wcm9wZXJ0eS5uYW1lLFxuICAgICAgICB0YXJnZXQ6IHRoaXMucHJvcGVydHkub2JqLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbnZhbGlkYXRlKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KCk7XG4gIH1cblxuICB1cGRhdGUob2xkKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIHZhbHVlID0gdGhpcy5nZXRQcm9wZXJ0eSgpLmdldCgpO1xuICAgIHJldHVybiB0aGlzLmhhbmRsZUNoYW5nZSh2YWx1ZSwgb2xkKTtcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZSh2YWx1ZSwgb2xkKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCBvbGQpO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvUHJvcGVydHlXYXRjaGVyLmpzLm1hcFxuIiwidmFyIEJpbmRlciwgRXZlbnRCaW5kLCBJbnZhbGlkYXRvciwgcGx1Y2s7XG5cbkJpbmRlciA9IHJlcXVpcmUoJy4vQmluZGVyJyk7XG5cbkV2ZW50QmluZCA9IHJlcXVpcmUoJy4vRXZlbnRCaW5kJyk7XG5cbnBsdWNrID0gZnVuY3Rpb24oYXJyLCBmbikge1xuICB2YXIgZm91bmQsIGluZGV4O1xuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XTtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0b3IgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEludmFsaWRhdG9yIGV4dGVuZHMgQmluZGVyIHtcbiAgICBjb25zdHJ1Y3RvcihpbnZhbGlkYXRlZCwgc2NvcGUgPSBudWxsKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IGludmFsaWRhdGVkO1xuICAgICAgdGhpcy5zY29wZSA9IHNjb3BlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXTtcbiAgICAgIHRoaXMucmVjeWNsZWQgPSBbXTtcbiAgICAgIHRoaXMudW5rbm93bnMgPSBbXTtcbiAgICAgIHRoaXMuc3RyaWN0ID0gdGhpcy5jb25zdHJ1Y3Rvci5zdHJpY3Q7XG4gICAgICB0aGlzLmludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzO1xuICAgIH1cblxuICAgIGludmFsaWRhdGUoKSB7XG4gICAgICB2YXIgZnVuY3ROYW1lO1xuICAgICAgdGhpcy5pbnZhbGlkID0gdHJ1ZTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH0gZWxzZSBpZiAoKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQuaW52YWxpZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLmludmFsaWRhdGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5pbnZhbGlkYXRlZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuaW52YWxpZGF0ZWQuc2xpY2UoMSk7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5zY29wZVtmdW5jdE5hbWVdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zY29wZVtmdW5jdE5hbWVdKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2NvcGVbdGhpcy5pbnZhbGlkYXRlZF0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdW5rbm93bigpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAodHlwZW9mICgocmVmID0gdGhpcy5pbnZhbGlkYXRlZCkgIT0gbnVsbCA/IHJlZi51bmtub3duIDogdm9pZCAwKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLnVua25vd24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRFdmVudEJpbmQoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEJpbmRlcihuZXcgRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSk7XG4gICAgfVxuXG4gICAgYWRkQmluZGVyKGJpbmRlcikge1xuICAgICAgaWYgKGJpbmRlci5jYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICAgIGJpbmRlci5jYWxsYmFjayA9IHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5zb21lKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2gocGx1Y2sodGhpcy5yZWN5Y2xlZCwgZnVuY3Rpb24oZXZlbnRCaW5kKSB7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKTtcbiAgICAgICAgfSkgfHwgYmluZGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRVbmtub3duQ2FsbGJhY2socHJvcCkge1xuICAgICAgdmFyIGNhbGxiYWNrO1xuICAgICAgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0KCk7XG4gICAgICAgIH0sIHByb3ApO1xuICAgICAgfTtcbiAgICAgIGNhbGxiYWNrLnJlZiA9IHtcbiAgICAgICAgcHJvcDogcHJvcFxuICAgICAgfTtcbiAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBhZGRVbmtub3duKGZuLCBwcm9wKSB7XG4gICAgICBpZiAoIXRoaXMuZmluZFVua25vd24ocHJvcCkpIHtcbiAgICAgICAgZm4ucmVmID0ge1xuICAgICAgICAgIFwicHJvcFwiOiBwcm9wXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudW5rbm93bnMucHVzaChmbik7XG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd24oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaW5kVW5rbm93bihwcm9wKSB7XG4gICAgICBpZiAoKHByb3AgIT0gbnVsbCkgfHwgKHR5cGVvZiB0YXJnZXQgIT09IFwidW5kZWZpbmVkXCIgJiYgdGFyZ2V0ICE9PSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmtub3ducy5maW5kKGZ1bmN0aW9uKHVua25vd24pIHtcbiAgICAgICAgICByZXR1cm4gdW5rbm93bi5yZWYucHJvcCA9PT0gcHJvcDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXZlbnQoZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIGlmICh0aGlzLmNoZWNrRW1pdHRlcih0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZSh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wKHByb3AsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBwcm9wSW5zdGFuY2U7XG4gICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICgodGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UgIT0gbnVsbCkgJiYgKHByb3BJbnN0YW5jZSA9IHRhcmdldC5nZXRQcm9wZXJ0eUluc3RhbmNlKHByb3ApKSkge1xuICAgICAgICAgIHByb3AgPSBwcm9wSW5zdGFuY2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5jaGVja1Byb3BJbnN0YW5jZShwcm9wKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IG11c3QgYmUgYSBQcm9wZXJ0eUluc3RhbmNlIG9yIGEgc3RyaW5nJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFkZEV2ZW50QmluZCgnaW52YWxpZGF0ZWQnLCBwcm9wLCB0aGlzLmdldFVua25vd25DYWxsYmFjayhwcm9wKSk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZShwcm9wLmdldCgpLCAndXBkYXRlZCcsIHByb3ApO1xuICAgIH1cblxuICAgIHByb3BQYXRoKHBhdGgsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBwcm9wLCB2YWw7XG4gICAgICBwYXRoID0gcGF0aC5zcGxpdCgnLicpO1xuICAgICAgdmFsID0gdGFyZ2V0O1xuICAgICAgd2hpbGUgKCh2YWwgIT0gbnVsbCkgJiYgcGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByb3AgPSBwYXRoLnNoaWZ0KCk7XG4gICAgICAgIHZhbCA9IHRoaXMucHJvcChwcm9wLCB2YWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICBwcm9wSW5pdGlhdGVkKHByb3AsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICAgIHZhciBpbml0aWF0ZWQ7XG4gICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnICYmICh0YXJnZXQuZ2V0UHJvcGVydHlJbnN0YW5jZSAhPSBudWxsKSkge1xuICAgICAgICBwcm9wID0gdGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UocHJvcCk7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLmNoZWNrUHJvcEluc3RhbmNlKHByb3ApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbXVzdCBiZSBhIFByb3BlcnR5SW5zdGFuY2Ugb3IgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIGluaXRpYXRlZCA9IHByb3AuaW5pdGlhdGVkO1xuICAgICAgaWYgKCFpbml0aWF0ZWQpIHtcbiAgICAgICAgdGhpcy5ldmVudCgndXBkYXRlZCcsIHByb3ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluaXRpYXRlZDtcbiAgICB9XG5cbiAgICBmdW5jdChmdW5jdCkge1xuICAgICAgdmFyIGludmFsaWRhdG9yLCByZXM7XG4gICAgICBpbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oKCkgPT4ge1xuICAgICAgICAgIHZhciByZXMyO1xuICAgICAgICAgIHJlczIgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICAgICAgaWYgKHJlcyAhPT0gcmVzMikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgaW52YWxpZGF0b3IpO1xuICAgICAgfSk7XG4gICAgICByZXMgPSBmdW5jdChpbnZhbGlkYXRvcik7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5wdXNoKGludmFsaWRhdG9yKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVVbmtub3ducygpIHtcbiAgICAgIHZhciB1bmtub3ducztcbiAgICAgIHVua25vd25zID0gdGhpcy51bmtub3ducztcbiAgICAgIHRoaXMudW5rbm93bnMgPSBbXTtcbiAgICAgIHJldHVybiB1bmtub3ducy5mb3JFYWNoKGZ1bmN0aW9uKHVua25vd24pIHtcbiAgICAgICAgcmV0dXJuIHVua25vd24oKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlzRW1wdHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMubGVuZ3RoID09PSAwO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICB0aGlzLmludmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmJpbmQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlY3ljbGUoY2FsbGJhY2spIHtcbiAgICAgIHZhciBkb25lLCByZXM7XG4gICAgICB0aGlzLnJlY3ljbGVkID0gdGhpcy5pbnZhbGlkYXRpb25FdmVudHM7XG4gICAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cyA9IFtdO1xuICAgICAgZG9uZSA9IHRoaXMuZW5kUmVjeWNsZS5iaW5kKHRoaXMpO1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHRoaXMsIGRvbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcyA9IGNhbGxiYWNrKHRoaXMpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9uZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbmRSZWN5Y2xlKCkge1xuICAgICAgdGhpcy5yZWN5Y2xlZC5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZWN5Y2xlZCA9IFtdO1xuICAgIH1cblxuICAgIGNoZWNrRW1pdHRlcihlbWl0dGVyKSB7XG4gICAgICByZXR1cm4gRXZlbnRCaW5kLmNoZWNrRW1pdHRlcihlbWl0dGVyLCB0aGlzLnN0cmljdCk7XG4gICAgfVxuXG4gICAgY2hlY2tQcm9wSW5zdGFuY2UocHJvcCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBwcm9wLmdldCA9PT0gXCJmdW5jdGlvblwiICYmIHRoaXMuY2hlY2tFbWl0dGVyKHByb3ApO1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZTtcblxuICByZXR1cm4gSW52YWxpZGF0b3I7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvSW52YWxpZGF0b3IuanMubWFwXG4iLCJ2YXIgTG9hZGVyLCBPdmVycmlkZXI7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBMb2FkZXIgZXh0ZW5kcyBPdmVycmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH1cblxuICAgIGluaXRQcmVsb2FkZWQoKSB7XG4gICAgICB2YXIgZGVmTGlzdDtcbiAgICAgIGRlZkxpc3QgPSB0aGlzLnByZWxvYWRlZDtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gW107XG4gICAgICByZXR1cm4gdGhpcy5sb2FkKGRlZkxpc3QpO1xuICAgIH1cblxuICAgIGxvYWQoZGVmTGlzdCkge1xuICAgICAgdmFyIGxvYWRlZCwgdG9Mb2FkO1xuICAgICAgdG9Mb2FkID0gW107XG4gICAgICBsb2FkZWQgPSBkZWZMaXN0Lm1hcCgoZGVmKSA9PiB7XG4gICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgaWYgKGRlZi5pbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBsb2FkZXI6IHRoaXNcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGluc3RhbmNlID0gTG9hZGVyLmxvYWQoZGVmKTtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaWYgKGRlZi5pbml0QnlMb2FkZXIgJiYgKGluc3RhbmNlLmluaXQgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHRvTG9hZC5wdXNoKGluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSB0aGlzLnByZWxvYWRlZC5jb25jYXQobG9hZGVkKTtcbiAgICAgIHJldHVybiB0b0xvYWQuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlbG9hZChkZWYpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkZWYpKSB7XG4gICAgICAgIGRlZiA9IFtkZWZdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkID0gKHRoaXMucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQoZGVmKTtcbiAgICB9XG5cbiAgICBkZXN0cm95TG9hZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkLmZvckVhY2goZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHJldHVybiAocmVmID0gZGVmLmluc3RhbmNlKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGVzdHJveSgpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldEZpbmFsUHJvcGVydGllcygpLmNvbmNhdChbJ3ByZWxvYWRlZCddKTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIHN1cGVyLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICBpZiAodGhpcy5wcmVsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkZWQgPSAodGFyZ2V0LnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KHRoaXMucHJlbG9hZGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZE1hbnkoZGVmKSB7XG4gICAgICByZXR1cm4gZGVmLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkKGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWQoZGVmKSB7XG4gICAgICBpZiAodHlwZW9mIGRlZi50eXBlLmNvcHlXaXRoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGRlZi50eXBlLmNvcHlXaXRoKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IGRlZi50eXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHByZWxvYWQoZGVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJlbG9hZChkZWYpO1xuICAgIH1cblxuICB9O1xuXG4gIExvYWRlci5wcm90b3R5cGUucHJlbG9hZGVkID0gW107XG5cbiAgTG9hZGVyLm92ZXJyaWRlcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmluaXQud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveUxvYWRlZCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIExvYWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Mb2FkZXIuanMubWFwXG4iLCJ2YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuXG4gIH07XG5cbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZU9uY2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKHNvdXJjZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uoc291cmNlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLCBwcm9wLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmdldEV4dGVuc2lvblByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3AgPSByZWZbaV07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgcHJvcCk7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAmJiB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzID0gdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLmNhbGwodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgfHwgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InLCAnZ2V0RmluYWxQcm9wZXJ0aWVzJ10sXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBhbHdheXNGaW5hbCwgcHJvcHMsIHRhcmdldENoYWluO1xuICAgICAgYWx3YXlzRmluYWwgPSB0aGlzLmFsd2F5c0ZpbmFsO1xuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XG4gICAgICBwcm9wcyA9IFtdO1xuICAgICAgdGhpcy5nZXRQcm90b3R5cGVDaGFpbihzb3VyY2UpLmV2ZXJ5KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgZXhjbHVkZTtcbiAgICAgICAgaWYgKCF0YXJnZXRDaGFpbi5pbmNsdWRlcyhvYmopKSB7XG4gICAgICAgICAgZXhjbHVkZSA9IGFsd2F5c0ZpbmFsO1xuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KFtcImxlbmd0aFwiLCBcInByb3RvdHlwZVwiLCBcIm5hbWVcIl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIiAmJiBpbmRleE9mLmNhbGwoZXhjbHVkZSwga2V5KSA8IDAgJiYgIXByb3BzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBrZXk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgIHByb3AubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSxcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgYmFzZVByb3RvdHlwZSwgY2hhaW47XG4gICAgICBjaGFpbiA9IFtdO1xuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hhaW4ucHVzaChvYmopO1xuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTWl4YWJsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NaXhhYmxlLmpzLm1hcFxuIiwiLy8gdG9kbyA6IFxuLy8gIHNpbXBsaWZpZWQgZm9ybSA6IEB3aXRob3V0TmFtZSBtZXRob2RcbnZhciBPdmVycmlkZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAodGhpcy5fb3ZlcnJpZGVzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFsnX292ZXJyaWRlcyddLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLl9vdmVycmlkZXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT3ZlcnJpZGVyLk92ZXJyaWRlID0ge1xuICAgIG1ha2VNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIgZm4sIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgZm4gPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIGZuKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIGFwcGx5TWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgb3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgb3ZlcnJpZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFwcGx5KHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgZm5OYW1lLCBmbikge1xuICAgICAgdmFyIG92ZXJyaWRlO1xuICAgICAgb3ZlcnJpZGUgPSB7XG4gICAgICAgIGZuOiB7XG4gICAgICAgICAgY3VycmVudDogZm5cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogZm5OYW1lXG4gICAgICB9O1xuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGgnICsgbmFtZXNwYWNlXSA9IGZuO1xuICAgICAgcmV0dXJuIG92ZXJyaWRlO1xuICAgIH0sXG4gICAgZW1wdHlGbjogZnVuY3Rpb24oKSB7fSxcbiAgICBhcHBseTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSB7XG4gICAgICB2YXIgZm5OYW1lLCBvdmVycmlkZXMsIHJlZiwgcmVmMSwgd2l0aG91dDtcbiAgICAgIGZuTmFtZSA9IG92ZXJyaWRlLm5hbWU7XG4gICAgICBvdmVycmlkZXMgPSB0YXJnZXQuX292ZXJyaWRlcyAhPSBudWxsID8gT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0Ll9vdmVycmlkZXMpIDoge307XG4gICAgICB3aXRob3V0ID0gKChyZWYgPSB0YXJnZXQuX292ZXJyaWRlcykgIT0gbnVsbCA/IChyZWYxID0gcmVmW2ZuTmFtZV0pICE9IG51bGwgPyByZWYxLmZuLmN1cnJlbnQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IHRhcmdldFtmbk5hbWVdO1xuICAgICAgb3ZlcnJpZGUgPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZSk7XG4gICAgICBpZiAob3ZlcnJpZGVzW2ZuTmFtZV0gIT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlc1tmbk5hbWVdLmZuLCBvdmVycmlkZS5mbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH1cbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRob3V0JyArIG5hbWVzcGFjZV0gPSB3aXRob3V0IHx8IHRoaXMuZW1wdHlGbjtcbiAgICAgIGlmICh3aXRob3V0ID09IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQgPSAnd2l0aG91dCcgKyBuYW1lc3BhY2U7XG4gICAgICB9IGVsc2UgaWYgKG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0KSB7XG4gICAgICAgIG92ZXJyaWRlLmZuW292ZXJyaWRlLm1pc3NpbmdXaXRob3V0XSA9IHdpdGhvdXQ7XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBmbk5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaW5hbEZuLCBmbiwga2V5LCByZWYyO1xuICAgICAgICAgIGZpbmFsRm4gPSBvdmVycmlkZS5mbi5jdXJyZW50LmJpbmQodGhpcyk7XG4gICAgICAgICAgcmVmMiA9IG92ZXJyaWRlLmZuO1xuICAgICAgICAgIGZvciAoa2V5IGluIHJlZjIpIHtcbiAgICAgICAgICAgIGZuID0gcmVmMltrZXldO1xuICAgICAgICAgICAgZmluYWxGbltrZXldID0gZm4uYmluZCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZm5OYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiBmaW5hbEZuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZpbmFsRm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3ZlcnJpZGVzW2ZuTmFtZV0gPSBvdmVycmlkZTtcbiAgICAgIHJldHVybiB0YXJnZXQuX292ZXJyaWRlcyA9IG92ZXJyaWRlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE92ZXJyaWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCJ2YXIgQmFzaWNQcm9wZXJ0eSwgQ2FsY3VsYXRlZFByb3BlcnR5LCBDb2xsZWN0aW9uUHJvcGVydHksIENvbXBvc2VkUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eSwgTWl4YWJsZSwgUHJvcGVydHksIFByb3BlcnR5T3duZXI7XG5cbkJhc2ljUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eScpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5Jyk7XG5cbkNvbXBvc2VkUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29tcG9zZWRQcm9wZXJ0eScpO1xuXG5EeW5hbWljUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5Jyk7XG5cbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHknKTtcblxuSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5Jyk7XG5cblByb3BlcnR5T3duZXIgPSByZXF1aXJlKCcuL1Byb3BlcnR5T3duZXInKTtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBQcm9wZXJ0eSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBiaW5kKHRhcmdldCkge1xuICAgICAgdmFyIHBhcmVudCwgcHJvcDtcbiAgICAgIHByb3AgPSB0aGlzO1xuICAgICAgaWYgKCEodHlwZW9mIHRhcmdldC5nZXRQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyAmJiB0YXJnZXQuZ2V0UHJvcGVydHkodGhpcy5uYW1lKSA9PT0gdGhpcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQuZ2V0UHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgKChwYXJlbnQgPSB0YXJnZXQuZ2V0UHJvcGVydHkodGhpcy5uYW1lKSkgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLm92ZXJyaWRlKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXRJbnN0YW5jZVR5cGUoKS5iaW5kKHRhcmdldCwgcHJvcCk7XG4gICAgICAgIHRhcmdldC5fcHJvcGVydGllcyA9ICh0YXJnZXQuX3Byb3BlcnRpZXMgfHwgW10pLmNvbmNhdChbcHJvcF0pO1xuICAgICAgICBpZiAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICB0YXJnZXQuX3Byb3BlcnRpZXMgPSB0YXJnZXQuX3Byb3BlcnRpZXMuZmlsdGVyKGZ1bmN0aW9uKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhpc3RpbmcgIT09IHBhcmVudDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1ha2VPd25lcih0YXJnZXQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3A7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUocGFyZW50KSB7XG4gICAgICB2YXIga2V5LCByZWYsIHJlc3VsdHMsIHZhbHVlO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMucGFyZW50ID0gcGFyZW50Lm9wdGlvbnM7XG4gICAgICAgIHJlZiA9IHBhcmVudC5vcHRpb25zO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgICAgIHZhbHVlID0gcmVmW2tleV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnNba2V5XSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm9wdGlvbnNba2V5XS5vdmVycmlkZWQgPSB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5vcHRpb25zW2tleV0gPSB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtYWtlT3duZXIodGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKFByb3BlcnR5T3duZXIucHJvdG90eXBlKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgcmV0dXJuIE1peGFibGUuRXh0ZW5zaW9uLm1ha2UoUHJvcGVydHlPd25lci5wcm90b3R5cGUsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SW5zdGFuY2VWYXJOYW1lKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pbnN0YW5jZVZhck5hbWUgfHwgJ18nICsgdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIGlzSW5zdGFudGlhdGVkKG9iaikge1xuICAgICAgcmV0dXJuIG9ialt0aGlzLmdldEluc3RhbmNlVmFyTmFtZSgpXSAhPSBudWxsO1xuICAgIH1cblxuICAgIGdldEluc3RhbmNlKG9iaikge1xuICAgICAgdmFyIFR5cGUsIHZhck5hbWU7XG4gICAgICB2YXJOYW1lID0gdGhpcy5nZXRJbnN0YW5jZVZhck5hbWUoKTtcbiAgICAgIGlmICghdGhpcy5pc0luc3RhbnRpYXRlZChvYmopKSB7XG4gICAgICAgIFR5cGUgPSB0aGlzLmdldEluc3RhbmNlVHlwZSgpO1xuICAgICAgICBvYmpbdmFyTmFtZV0gPSBuZXcgVHlwZSh0aGlzLCBvYmopO1xuICAgICAgICBvYmpbdmFyTmFtZV0uaW5pdCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialt2YXJOYW1lXTtcbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZVR5cGUoKSB7XG4gICAgICBpZiAoIXRoaXMuaW5zdGFuY2VUeXBlKSB7XG4gICAgICAgIHRoaXMuY29tcG9zZXJzLmZvckVhY2goKGNvbXBvc2VyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBvc2VyLmNvbXBvc2UodGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VUeXBlO1xuICAgIH1cblxuICB9O1xuXG4gIFByb3BlcnR5LnByb3RvdHlwZS5jb21wb3NlcnMgPSBbQ29tcG9zZWRQcm9wZXJ0eSwgQ29sbGVjdGlvblByb3BlcnR5LCBEeW5hbWljUHJvcGVydHksIEJhc2ljUHJvcGVydHksIENhbGN1bGF0ZWRQcm9wZXJ0eSwgSW52YWxpZGF0ZWRQcm9wZXJ0eV07XG5cbiAgcmV0dXJuIFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1Byb3BlcnR5LmpzLm1hcFxuIiwidmFyIFByb3BlcnR5T3duZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlPd25lciA9IGNsYXNzIFByb3BlcnR5T3duZXIge1xuICBnZXRQcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMgJiYgdGhpcy5fcHJvcGVydGllcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IG5hbWU7XG4gICAgfSk7XG4gIH1cblxuICBnZXRQcm9wZXJ0eUluc3RhbmNlKG5hbWUpIHtcbiAgICB2YXIgcmVzO1xuICAgIHJlcyA9IHRoaXMuZ2V0UHJvcGVydHkobmFtZSk7XG4gICAgaWYgKHJlcykge1xuICAgICAgcmV0dXJuIHJlcy5nZXRJbnN0YW5jZSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnNsaWNlKCk7XG4gIH1cblxuICBnZXRQcm9wZXJ0eUluc3RhbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5tYXAoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0SW5zdGFudGlhdGVkUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5maWx0ZXIoKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmlzSW5zdGFudGlhdGVkKHRoaXMpO1xuICAgIH0pLm1hcCgocHJvcCkgPT4ge1xuICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRNYW51YWxEYXRhUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5yZWR1Y2UoKHJlcywgcHJvcCkgPT4ge1xuICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgaWYgKHByb3AuaXNJbnN0YW50aWF0ZWQodGhpcykpIHtcbiAgICAgICAgaW5zdGFuY2UgPSBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xuICAgICAgICBpZiAoaW5zdGFuY2UuY2FsY3VsYXRlZCAmJiBpbnN0YW5jZS5tYW51YWwpIHtcbiAgICAgICAgICByZXNbcHJvcC5uYW1lXSA9IGluc3RhbmNlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sIHt9KTtcbiAgfVxuXG4gIHNldFByb3BlcnRpZXMoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdmFyIGtleSwgcHJvcCwgdmFsO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHlJbnN0YW5jZShrZXkpO1xuICAgICAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICAgICAgcHJvcC5zZXQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlc3Ryb3lQcm9wZXJ0aWVzKCkge1xuICAgIHRoaXMuZ2V0SW5zdGFudGlhdGVkUHJvcGVydGllcygpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIHJldHVybiBwcm9wLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgICB0aGlzLl9wcm9wZXJ0aWVzID0gW107XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsaXN0ZW5lckFkZGVkKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wLmdldEluc3RhbmNlVHlwZSgpLnByb3RvdHlwZS5jaGFuZ2VFdmVudE5hbWUgPT09IGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5saXN0ZW5lckFkZGVkID0gdGhpcy5saXN0ZW5lckFkZGVkO1xuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHlPd25lci5qcy5tYXBcbiIsInZhciBCYXNpY1Byb3BlcnR5LCBFdmVudEVtaXR0ZXIsIExvYWRlciwgTWl4YWJsZSwgUHJvcGVydHlXYXRjaGVyLCBSZWZlcnJlZDtcblxuTWl4YWJsZSA9IHJlcXVpcmUoJy4uL01peGFibGUnKTtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi4vRXZlbnRFbWl0dGVyJyk7XG5cbkxvYWRlciA9IHJlcXVpcmUoJy4uL0xvYWRlcicpO1xuXG5Qcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRlZC9Qcm9wZXJ0eVdhdGNoZXInKTtcblxuUmVmZXJyZWQgPSByZXF1aXJlKCcuLi9SZWZlcnJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIEJhc2ljUHJvcGVydHkgZXh0ZW5kcyBNaXhhYmxlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eSwgb2JqKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgICAgdGhpcy5vYmogPSBvYmo7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgIHZhciBwcmVsb2FkO1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5nZXN0KHRoaXMuZGVmYXVsdCk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW5pdGlhdGVkID0gZmFsc2U7XG4gICAgICBwcmVsb2FkID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRQcmVsb2FkKHRoaXMub2JqLCB0aGlzLnByb3BlcnR5LCB0aGlzKTtcbiAgICAgIGlmIChwcmVsb2FkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIExvYWRlci5sb2FkTWFueShwcmVsb2FkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCF0aGlzLmluaXRpYXRlZCkge1xuICAgICAgICB0aGlzLmluaXRpYXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQoKTtcbiAgICB9XG5cbiAgICBzZXQodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRBbmRDaGVja0NoYW5nZXModmFsKTtcbiAgICB9XG5cbiAgICBjYWxsYmFja1NldCh2YWwpIHtcbiAgICAgIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwic2V0XCIsIHZhbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRBbmRDaGVja0NoYW5nZXModmFsKSB7XG4gICAgICB2YXIgb2xkO1xuICAgICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKTtcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh2YWwsIHRoaXMudmFsdWUpKSB7XG4gICAgICAgIG9sZCA9IHRoaXMudmFsdWU7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gICAgICAgIHRoaXMubWFudWFsID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjaGVja0NoYW5nZXModmFsLCBvbGQpIHtcbiAgICAgIHJldHVybiB2YWwgIT09IG9sZDtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICh0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVzdHJveSA9PT0gdHJ1ZSAmJiAoKChyZWYgPSB0aGlzLnZhbHVlKSAhPSBudWxsID8gcmVmLmRlc3Ryb3kgOiB2b2lkIDApICE9IG51bGwpKSB7XG4gICAgICAgIHRoaXMudmFsdWUuZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLmNhbGxPcHRpb25GdW5jdCgnZGVzdHJveScsIHRoaXMudmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWUgPSBudWxsO1xuICAgIH1cblxuICAgIGNhbGxPcHRpb25GdW5jdChmdW5jdCwgLi4uYXJncykge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZnVuY3QgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnNbZnVuY3RdO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBmdW5jdC5vdmVycmlkZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYXJncy5wdXNoKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0Lm92ZXJyaWRlZCwgLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0LmFwcGx5KHRoaXMub2JqLCBhcmdzKTtcbiAgICB9XG5cbiAgICByZXZhbGlkYXRlZCgpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWF0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGluZ2VzdCh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3V0cHV0KCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZWQob2xkKSB7XG4gICAgICB0aGlzLmVtaXRFdmVudCgndXBkYXRlZCcsIG9sZCk7XG4gICAgICB0aGlzLmVtaXRFdmVudCgnY2hhbmdlZCcsIG9sZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XG4gICAgICBpZiAocHJvcC5pbnN0YW5jZVR5cGUgPT0gbnVsbCkge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQmFzaWNQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLnNldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuc2V0ID0gdGhpcy5wcm90b3R5cGUuY2FsbGJhY2tTZXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuc2V0ID0gdGhpcy5wcm90b3R5cGUuc2V0QW5kQ2hlY2tDaGFuZ2VzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5kZWZhdWx0ID0gcHJvcC5vcHRpb25zLmRlZmF1bHQ7XG4gICAgfVxuXG4gICAgc3RhdGljIGJpbmQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICB2YXIgbWFqLCBvcHQsIHByZWxvYWQ7XG4gICAgICBtYWogPSBwcm9wLm5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLm5hbWUuc2xpY2UoMSk7XG4gICAgICBvcHQgPSB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5nZXQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMuc2V0ICE9PSBmYWxzZSkge1xuICAgICAgICBvcHQuc2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuc2V0KHZhbCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIG9wdCk7XG4gICAgICB0YXJnZXRbJ2dldCcgKyBtYWpdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xuICAgICAgfTtcbiAgICAgIGlmIChwcm9wLm9wdGlvbnMuc2V0ICE9PSBmYWxzZSkge1xuICAgICAgICB0YXJnZXRbJ3NldCcgKyBtYWpdID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5zZXQodmFsKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRhcmdldFsnaW52YWxpZGF0ZScgKyBtYWpdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuaW52YWxpZGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICBwcmVsb2FkID0gdGhpcy5nZXRQcmVsb2FkKHRhcmdldCwgcHJvcCk7XG4gICAgICBpZiAocHJlbG9hZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIE1peGFibGUuRXh0ZW5zaW9uLm1ha2VPbmNlKExvYWRlci5wcm90b3R5cGUsIHRhcmdldCk7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJlbG9hZChwcmVsb2FkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UHJlbG9hZCh0YXJnZXQsIHByb3AsIGluc3RhbmNlKSB7XG4gICAgICB2YXIgcHJlbG9hZCwgcmVmLCByZWYxLCB0b0xvYWQ7XG4gICAgICBwcmVsb2FkID0gW107XG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jaGFuZ2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0b0xvYWQgPSB7XG4gICAgICAgICAgdHlwZTogUHJvcGVydHlXYXRjaGVyLFxuICAgICAgICAgIGxvYWRlckFzU2NvcGU6IHRydWUsXG4gICAgICAgICAgcHJvcGVydHk6IGluc3RhbmNlIHx8IHByb3AubmFtZSxcbiAgICAgICAgICBpbml0QnlMb2FkZXI6IHRydWUsXG4gICAgICAgICAgYXV0b0JpbmQ6IHRydWUsXG4gICAgICAgICAgY2FsbGJhY2s6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgcmVmOiB7XG4gICAgICAgICAgICBwcm9wOiBwcm9wLm5hbWUsXG4gICAgICAgICAgICBjYWxsYmFjazogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjaGFuZ2UnXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiAoKHJlZiA9IHByb3Aub3B0aW9ucy5jaGFuZ2UpICE9IG51bGwgPyByZWYuY29weVdpdGggOiB2b2lkIDApID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdG9Mb2FkID0ge1xuICAgICAgICAgIHR5cGU6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgbG9hZGVyQXNTY29wZTogdHJ1ZSxcbiAgICAgICAgICBwcm9wZXJ0eTogaW5zdGFuY2UgfHwgcHJvcC5uYW1lLFxuICAgICAgICAgIGluaXRCeUxvYWRlcjogdHJ1ZSxcbiAgICAgICAgICBhdXRvQmluZDogdHJ1ZSxcbiAgICAgICAgICByZWY6IHtcbiAgICAgICAgICAgIHByb3A6IHByb3AubmFtZSxcbiAgICAgICAgICAgIHR5cGU6IHByb3Aub3B0aW9ucy5jaGFuZ2UsXG4gICAgICAgICAgICBjb250ZXh0OiAnY2hhbmdlJ1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICgodG9Mb2FkICE9IG51bGwpICYmICEoKHJlZjEgPSB0YXJnZXQucHJlbG9hZGVkKSAhPSBudWxsID8gcmVmMS5maW5kKGZ1bmN0aW9uKGxvYWRlZCkge1xuICAgICAgICByZXR1cm4gUmVmZXJyZWQuY29tcGFyZVJlZih0b0xvYWQucmVmLCBsb2FkZWQucmVmKSAmJiAhaW5zdGFuY2UgfHwgKGxvYWRlZC5pbnN0YW5jZSAhPSBudWxsKTtcbiAgICAgIH0pIDogdm9pZCAwKSkge1xuICAgICAgICBwcmVsb2FkLnB1c2godG9Mb2FkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmVsb2FkO1xuICAgIH1cblxuICB9O1xuXG4gIEJhc2ljUHJvcGVydHkuZXh0ZW5kKEV2ZW50RW1pdHRlcik7XG5cbiAgcmV0dXJuIEJhc2ljUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzLm1hcFxuIiwidmFyIENhbGN1bGF0ZWRQcm9wZXJ0eSwgRHluYW1pY1Byb3BlcnR5LCBJbnZhbGlkYXRvciwgT3ZlcnJpZGVyO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbkR5bmFtaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4uL092ZXJyaWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGN1bGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ2FsY3VsYXRlZFByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBjYWxjdWwoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5jYWxjdWxGdW5jdCk7XG4gICAgICB0aGlzLm1hbnVhbCA9IGZhbHNlO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuY2FsY3VsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jYWxjdWxGdW5jdCA9IHByb3Aub3B0aW9ucy5jYWxjdWw7XG4gICAgICAgIGlmICghKHByb3Aub3B0aW9ucy5jYWxjdWwubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKENhbGN1bGF0ZWRQcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDYWxjdWxhdGVkUHJvcGVydHkuZXh0ZW5kKE92ZXJyaWRlcik7XG5cbiAgQ2FsY3VsYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbml0aWF0ZWQsIG9sZDtcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgICAgb2xkID0gdGhpcy52YWx1ZTtcbiAgICAgICAgaW5pdGlhdGVkID0gdGhpcy5pbml0aWF0ZWQ7XG4gICAgICAgIHRoaXMuY2FsY3VsKCk7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrQ2hhbmdlcyh0aGlzLnZhbHVlLCBvbGQpKSB7XG4gICAgICAgICAgaWYgKGluaXRpYXRlZCkge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJywgb2xkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWluaXRpYXRlZCkge1xuICAgICAgICAgIHRoaXMuZW1pdEV2ZW50KCd1cGRhdGVkJywgb2xkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ2FsY3VsYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvQ2FsY3VsYXRlZFByb3BlcnR5LmpzLm1hcFxuIiwidmFyIENvbGxlY3Rpb24sIENvbGxlY3Rpb25Qcm9wZXJ0eSwgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciwgRHluYW1pY1Byb3BlcnR5LCBSZWZlcnJlZDtcblxuRHluYW1pY1Byb3BlcnR5ID0gcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcblxuQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL0NvbGxlY3Rpb24nKTtcblxuUmVmZXJyZWQgPSByZXF1aXJlKCcuLi9SZWZlcnJlZCcpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0ZWQvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25Qcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgQ29sbGVjdGlvblByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcbiAgICBpbmdlc3QodmFsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbmdlc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdmFsLnRvQXJyYXkoKTtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHJldHVybiB2YWwuc2xpY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbdmFsXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0NoYW5nZWRJdGVtcyh2YWwsIG9sZCkge1xuICAgICAgdmFyIGNvbXBhcmVGdW5jdGlvbjtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbXBhcmVGdW5jdGlvbiA9IHRoaXMuY29sbGVjdGlvbk9wdGlvbnMuY29tcGFyZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAobmV3IENvbGxlY3Rpb24odmFsKSkuY2hlY2tDaGFuZ2VzKG9sZCwgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5vcmRlcmVkLCBjb21wYXJlRnVuY3Rpb24pO1xuICAgIH1cblxuICAgIG91dHB1dCgpIHtcbiAgICAgIHZhciBjb2wsIHByb3AsIHZhbHVlO1xuICAgICAgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJvdXRwdXRcIiwgdGhpcy52YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcm9wID0gdGhpcztcbiAgICAgIGNvbCA9IENvbGxlY3Rpb24ubmV3U3ViQ2xhc3ModGhpcy5jb2xsZWN0aW9uT3B0aW9ucywgdmFsdWUpO1xuICAgICAgY29sLmNoYW5nZWQgPSBmdW5jdGlvbihvbGQpIHtcbiAgICAgICAgcmV0dXJuIHByb3AuY2hhbmdlZChvbGQpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBjb2w7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIENvbGxlY3Rpb25Qcm9wZXJ0eSB7fTtcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmNvbGxlY3Rpb25PcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0Q29sbGVjdGlvbk9wdGlvbnMsIHR5cGVvZiBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ29iamVjdCcgPyBwcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA6IHt9KTtcbiAgICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uLmNvbXBhcmUgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2hlY2tDaGFuZ2VzID0gdGhpcy5wcm90b3R5cGUuY2hlY2tDaGFuZ2VkSXRlbXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UHJlbG9hZCh0YXJnZXQsIHByb3AsIGluc3RhbmNlKSB7XG4gICAgICB2YXIgcHJlbG9hZCwgcmVmLCByZWYxO1xuICAgICAgcHJlbG9hZCA9IFtdO1xuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuY2hhbmdlID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5pdGVtQWRkZWQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZWYgPSB7XG4gICAgICAgICAgcHJvcDogcHJvcC5uYW1lLFxuICAgICAgICAgIGNvbnRleHQ6ICdjaGFuZ2UnXG4gICAgICAgIH07XG4gICAgICAgIGlmICghKChyZWYxID0gdGFyZ2V0LnByZWxvYWRlZCkgIT0gbnVsbCA/IHJlZjEuZmluZChmdW5jdGlvbihsb2FkZWQpIHtcbiAgICAgICAgICByZXR1cm4gUmVmZXJyZWQuY29tcGFyZVJlZihyZWYsIGxvYWRlZC5yZWYpICYmIChsb2FkZWQuaW5zdGFuY2UgIT0gbnVsbCk7XG4gICAgICAgIH0pIDogdm9pZCAwKSkge1xuICAgICAgICAgIHByZWxvYWQucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLFxuICAgICAgICAgICAgbG9hZGVyQXNTY29wZTogdHJ1ZSxcbiAgICAgICAgICAgIHNjb3BlOiB0YXJnZXQsXG4gICAgICAgICAgICBwcm9wZXJ0eTogaW5zdGFuY2UgfHwgcHJvcC5uYW1lLFxuICAgICAgICAgICAgaW5pdEJ5TG9hZGVyOiB0cnVlLFxuICAgICAgICAgICAgYXV0b0JpbmQ6IHRydWUsXG4gICAgICAgICAgICBjYWxsYmFjazogcHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgICAgIG9uQWRkZWQ6IHByb3Aub3B0aW9ucy5pdGVtQWRkZWQsXG4gICAgICAgICAgICBvblJlbW92ZWQ6IHByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCxcbiAgICAgICAgICAgIHJlZjogcmVmXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmVsb2FkO1xuICAgIH1cblxuICB9O1xuXG4gIENvbGxlY3Rpb25Qcm9wZXJ0eS5kZWZhdWx0Q29sbGVjdGlvbk9wdGlvbnMgPSB7XG4gICAgY29tcGFyZTogZmFsc2UsXG4gICAgb3JkZXJlZDogdHJ1ZVxuICB9O1xuXG4gIHJldHVybiBDb2xsZWN0aW9uUHJvcGVydHk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMubWFwXG4iLCJ2YXIgQ2FsY3VsYXRlZFByb3BlcnR5LCBDb2xsZWN0aW9uLCBDb21wb3NlZFByb3BlcnR5LCBJbnZhbGlkYXRvcjtcblxuQ2FsY3VsYXRlZFByb3BlcnR5ID0gcmVxdWlyZSgnLi9DYWxjdWxhdGVkUHJvcGVydHknKTtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xuXG5Db2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vQ29sbGVjdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvc2VkUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIENvbXBvc2VkUHJvcGVydHkgZXh0ZW5kcyBDYWxjdWxhdGVkUHJvcGVydHkge1xuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLmluaXRDb21wb3NlZCgpO1xuICAgICAgcmV0dXJuIHN1cGVyLmluaXQoKTtcbiAgICB9XG5cbiAgICBpbml0Q29tcG9zZWQoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmhhc093blByb3BlcnR5KCdkZWZhdWx0JykpIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmRlZmF1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnZhbHVlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWVtYmVycyA9IG5ldyBDb21wb3NlZFByb3BlcnR5Lk1lbWJlcnModGhpcy5wcm9wZXJ0eS5vcHRpb25zLm1lbWJlcnMpO1xuICAgICAgdGhpcy5tZW1iZXJzLmNoYW5nZWQgPSAob2xkKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5qb2luID0gdHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA6IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSA/IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5vciA6IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5hbmQ7XG4gICAgfVxuXG4gICAgY2FsY3VsKCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5vYmopO1xuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5tZW1iZXJzLnJlZHVjZSgocHJldiwgbWVtYmVyKSA9PiB7XG4gICAgICAgICAgdmFyIHZhbDtcbiAgICAgICAgICB2YWwgPSB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nID8gbWVtYmVyKHRoaXMuaW52YWxpZGF0b3IpIDogbWVtYmVyO1xuICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4ocHJldiwgdmFsKTtcbiAgICAgICAgfSwgdGhpcy5kZWZhdWx0KTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQ29tcG9zZWRQcm9wZXJ0eSB7fTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcbiAgICAgIENhbGN1bGF0ZWRQcm9wZXJ0eS5iaW5kKHRhcmdldCwgcHJvcCk7XG4gICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lICsgJ01lbWJlcnMnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5tZW1iZXJzO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICBDb21wb3NlZFByb3BlcnR5LmpvaW5GdW5jdGlvbnMgPSB7XG4gICAgYW5kOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAmJiBiO1xuICAgIH0sXG4gICAgb3I6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIHx8IGI7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb21wb3NlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5Db21wb3NlZFByb3BlcnR5Lk1lbWJlcnMgPSBjbGFzcyBNZW1iZXJzIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIGFkZFByb3BlcnR5UmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBmbjtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AobmFtZSwgb2JqKTtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopIHtcbiAgICB2YXIgZm47XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbiA9IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9O1xuICAgICAgZm4ucmVmID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgdmFsOiB2YWxcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcbiAgICB9XG4gIH1cblxuICBzZXRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xuICAgIHZhciBmbiwgaSwgcmVmO1xuICAgIGkgPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xuICAgIGlmIChpID09PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmFsdWVSZWYodmFsLCBuYW1lLCBvYmopO1xuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkucmVmLnZhbCAhPT0gdmFsKSB7XG4gICAgICByZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqLFxuICAgICAgICB2YWw6IHZhbFxuICAgICAgfTtcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH07XG4gICAgICBmbi5yZWYgPSByZWY7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoaSwgZm4pO1xuICAgIH1cbiAgfVxuXG4gIGdldFZhbHVlUmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihuYW1lLCBvYmopLnJlZi52YWw7XG4gIH1cblxuICBhZGRGdW5jdGlvblJlZihmbiwgbmFtZSwgb2JqKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICBmbi5yZWYgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XG4gICAgfVxuICB9XG5cbiAgZmluZEJ5UmVmKG5hbWUsIG9iaikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopXTtcbiAgfVxuXG4gIGZpbmRSZWZJbmRleChuYW1lLCBvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgcmV0dXJuIChtZW1iZXIucmVmICE9IG51bGwpICYmIG1lbWJlci5yZWYub2JqID09PSBvYmogJiYgbWVtYmVyLnJlZi5uYW1lID09PSBuYW1lO1xuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlUmVmKG5hbWUsIG9iaikge1xuICAgIHZhciBpbmRleCwgb2xkO1xuICAgIGluZGV4ID0gdGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGFuZ2VkKG9sZCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzLm1hcFxuIiwidmFyIEJhc2ljUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgSW52YWxpZGF0b3I7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKTtcblxuQmFzaWNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vQmFzaWNQcm9wZXJ0eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IER5bmFtaWNQcm9wZXJ0eSA9IGNsYXNzIER5bmFtaWNQcm9wZXJ0eSBleHRlbmRzIEJhc2ljUHJvcGVydHkge1xuICBjYWxsYmFja0dldCgpIHtcbiAgICB2YXIgcmVzO1xuICAgIHJlcyA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiZ2V0XCIpO1xuICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfaW52YWxpZGF0ZU5vdGljZSgpIHtcbiAgICB0aGlzLmVtaXRFdmVudCgnaW52YWxpZGF0ZWQnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChwcm9wLmluc3RhbmNlVHlwZSA9PSBudWxsKSB7XG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlID0gY2xhc3MgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge307XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5nZXQgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja0dldDtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0R5bmFtaWNQcm9wZXJ0eS5qcy5tYXBcbiIsInZhciBDYWxjdWxhdGVkUHJvcGVydHksIEludmFsaWRhdGVkUHJvcGVydHksIEludmFsaWRhdG9yO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XG5cbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgSW52YWxpZGF0ZWRQcm9wZXJ0eSBleHRlbmRzIENhbGN1bGF0ZWRQcm9wZXJ0eSB7XG4gICAgdW5rbm93bigpIHtcbiAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQgfHwgdGhpcy5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChJbnZhbGlkYXRlZFByb3BlcnR5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBJbnZhbGlkYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XG4gICAgY2FsY3VsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuY2FsY3VsRnVuY3QsIGludmFsaWRhdG9yKTtcbiAgICAgICAgdGhpcy5tYW51YWwgPSBmYWxzZTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGVzdHJveS53aXRob3V0SW52YWxpZGF0ZWRQcm9wZXJ0eSgpO1xuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGludmFsaWRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuY2FsY3VsYXRlZCB8fCB0aGlzLmFjdGl2ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcbiAgICAgICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQgJiYgKHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBJbnZhbGlkYXRlZFByb3BlcnR5O1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcy5tYXBcbiIsInZhciBSZWZlcnJlZDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWZlcnJlZCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUmVmZXJyZWQge1xuICAgIGNvbXBhcmVSZWZlcmVkKHJlZmVyZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmNvbXBhcmVSZWZlcmVkKHJlZmVyZWQsIHRoaXMpO1xuICAgIH1cblxuICAgIGdldFJlZigpIHt9XG5cbiAgICBzdGF0aWMgY29tcGFyZVJlZmVyZWQob2JqMSwgb2JqMikge1xuICAgICAgcmV0dXJuIG9iajEgPT09IG9iajIgfHwgKChvYmoxICE9IG51bGwpICYmIChvYmoyICE9IG51bGwpICYmIG9iajEuY29uc3RydWN0b3IgPT09IG9iajIuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlUmVmKG9iajEucmVmLCBvYmoyLnJlZikpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjb21wYXJlUmVmKHJlZjEsIHJlZjIpIHtcbiAgICAgIHJldHVybiAocmVmMSAhPSBudWxsKSAmJiAocmVmMiAhPSBudWxsKSAmJiAocmVmMSA9PT0gcmVmMiB8fCAoQXJyYXkuaXNBcnJheShyZWYxKSAmJiBBcnJheS5pc0FycmF5KHJlZjEpICYmIHJlZjEuZXZlcnkoKHZhbCwgaSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlUmVmZXJlZChyZWYxW2ldLCByZWYyW2ldKTtcbiAgICAgIH0pKSB8fCAodHlwZW9mIHJlZjEgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlZjIgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmtleXMocmVmMSkuam9pbigpID09PSBPYmplY3Qua2V5cyhyZWYyKS5qb2luKCkgJiYgT2JqZWN0LmtleXMocmVmMSkuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlUmVmZXJlZChyZWYxW2tleV0sIHJlZjJba2V5XSk7XG4gICAgICB9KSkpO1xuICAgIH1cblxuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWZlcnJlZC5wcm90b3R5cGUsICdyZWYnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlZigpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFJlZmVycmVkO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL1JlZmVycmVkLmpzLm1hcFxuIiwidmFyIEJpbmRlciwgVXBkYXRlcjtcblxuQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBVcGRhdGVyID0gY2xhc3MgVXBkYXRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5uZXh0ID0gW107XG4gICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICAgIGlmICgob3B0aW9ucyAhPSBudWxsID8gb3B0aW9ucy5jYWxsYmFjayA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5hZGRDYWxsYmFjayhvcHRpb25zLmNhbGxiYWNrKTtcbiAgICB9XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyAocmVmID0gb3B0aW9ucy5jYWxsYmFja3MpICE9IG51bGwgPyByZWYuZm9yRWFjaCA6IHZvaWQgMCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHZhciBjYWxsYmFjaztcbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLm5leHQgPSB0aGlzLmNhbGxiYWNrcy5zbGljZSgpO1xuICAgIHdoaWxlICh0aGlzLmNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tzLnNoaWZ0KCk7XG4gICAgICB0aGlzLnJ1bkNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgdGhpcy5jYWxsYmFja3MgPSB0aGlzLm5leHQ7XG4gICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcnVuQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfVxuXG4gIGFkZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcy5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAodGhpcy51cGRhdGluZyAmJiAhdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBuZXh0VGljayhjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICBpZiAoIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gdGhpcy5jYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLm5leHQuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGdldEJpbmRlcigpIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZXIuQmluZGVyKHRoaXMpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIHJldHVybiB0aGlzLm5leHQgPSBbXTtcbiAgfVxuXG59O1xuXG5VcGRhdGVyLkJpbmRlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGNsYXNzIEJpbmRlciBleHRlbmRzIHN1cGVyQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHRhcmdldCwgY2FsbGJhY2sxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sxO1xuICAgIH1cblxuICAgIGdldFJlZigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRvQmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBkb1VuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gQmluZGVyO1xuXG59KS5jYWxsKHRoaXMsIEJpbmRlcik7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVXBkYXRlci5qcy5tYXBcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkJpbmRlclwiOiByZXF1aXJlKFwiLi9CaW5kZXJcIiksXG4gIFwiQ29sbGVjdGlvblwiOiByZXF1aXJlKFwiLi9Db2xsZWN0aW9uXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJFdmVudEJpbmRcIjogcmVxdWlyZShcIi4vRXZlbnRCaW5kXCIpLFxuICBcIkV2ZW50RW1pdHRlclwiOiByZXF1aXJlKFwiLi9FdmVudEVtaXR0ZXJcIiksXG4gIFwiSW52YWxpZGF0b3JcIjogcmVxdWlyZShcIi4vSW52YWxpZGF0b3JcIiksXG4gIFwiTG9hZGVyXCI6IHJlcXVpcmUoXCIuL0xvYWRlclwiKSxcbiAgXCJNaXhhYmxlXCI6IHJlcXVpcmUoXCIuL01peGFibGVcIiksXG4gIFwiT3ZlcnJpZGVyXCI6IHJlcXVpcmUoXCIuL092ZXJyaWRlclwiKSxcbiAgXCJQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVwiKSxcbiAgXCJQcm9wZXJ0eU93bmVyXCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5T3duZXJcIiksXG4gIFwiUmVmZXJyZWRcIjogcmVxdWlyZShcIi4vUmVmZXJyZWRcIiksXG4gIFwiVXBkYXRlclwiOiByZXF1aXJlKFwiLi9VcGRhdGVyXCIpLFxuICBcIkludmFsaWRhdGVkXCI6IHtcbiAgICBcIkFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXJcIiksXG4gICAgXCJDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyXCI6IHJlcXVpcmUoXCIuL0ludmFsaWRhdGVkL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXJcIiksXG4gICAgXCJJbnZhbGlkYXRlZFwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZFwiKSxcbiAgICBcIlByb3BlcnR5V2F0Y2hlclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9Qcm9wZXJ0eVdhdGNoZXJcIiksXG4gIH0sXG4gIFwiUHJvcGVydHlUeXBlc1wiOiB7XG4gICAgXCJCYXNpY1Byb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eVwiKSxcbiAgICBcIkNhbGN1bGF0ZWRQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eVwiKSxcbiAgICBcIkNvbGxlY3Rpb25Qcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0NvbGxlY3Rpb25Qcm9wZXJ0eVwiKSxcbiAgICBcIkNvbXBvc2VkUHJvcGVydHlcIjogcmVxdWlyZShcIi4vUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5XCIpLFxuICAgIFwiRHluYW1pY1Byb3BlcnR5XCI6IHJlcXVpcmUoXCIuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5XCIpLFxuICAgIFwiSW52YWxpZGF0ZWRQcm9wZXJ0eVwiOiByZXF1aXJlKFwiLi9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHlcIiksXG4gIH0sXG59Il19
