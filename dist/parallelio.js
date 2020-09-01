(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Parallelio = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Tile = require('parallelio-tiles').Tile

class Airlock extends Tile {
  attachTo (airlock) {
    this.attachedTo = airlock
  }

  copyAndRotate (angle, origin) {
    const copy = super.copyAndRotate(angle, origin)
    copy.direction = this.direction.rotate(angle)
    return copy
  }
}

Airlock.properties({
  direction: {},
  attachedTo: {}
})

module.exports = Airlock

},{"parallelio-tiles":93}],2:[function(require,module,exports){
const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')

class Approach extends Element {
  start () {
    if (this.valid) {
      this.moving = true
      this.subject.xMembers.addPropertyPath('currentPos.x', this)
      this.subject.yMembers.addPropertyPath('currentPos.x', this)
      this.timeout = this.timing.setTimeout(() => {
        return this.done()
      }, this.duration)
    }
  }

  done () {
    this.subject.xMembers.removeRef({
      name: 'currentPos.x',
      obj: this
    })
    this.subject.yMembers.removeRef({
      name: 'currentPos.x',
      obj: this
    })
    this.subject.x = this.targetPos.x
    this.subject.y = this.targetPos.x
    this.subjectAirlock.attachTo(this.targetAirlock)
    this.moving = false
    this.complete = true
  }

  destroy () {
    if (this.timeout) {
      this.timeout.destroy()
    }
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
      return airlocks.get(0)
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

},{"parallelio-timing":103,"spark-starter":161}],3:[function(require,module,exports){
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

},{"./Character":4,"./Door":9}],4:[function(require,module,exports){
const Tiled = require('parallelio-tiles').Tiled
const Damageable = require('./Damageable')
const WalkAction = require('./actions/WalkAction')
const ActionProvider = require('./actions/ActionProvider')

class Character extends Tiled {
  constructor (options) {
    if (typeof options === 'string') {
      options = { name: options }
    }
    super(options)
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
    action.start()
    return action
  }

  isSelectableBy (player) {
    return true
  }
};

Character.extend(Damageable)

Character.properties({
  name: {},
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

},{"./Damageable":8,"./actions/ActionProvider":32,"./actions/WalkAction":39,"parallelio-tiles":93}],5:[function(require,module,exports){
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
      action.start()
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
      action.start()
      return action
    }
  }
}

module.exports = CharacterAI

},{"./Door":9,"./VisionCalculator":30,"./actions/AttackMoveAction":34,"./actions/WalkAction":39,"parallelio-tiles":93,"spark-starter":161}],6:[function(require,module,exports){
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

},{"./Approach":2,"./Ship":24,"./View":29,"spark-starter":161}],7:[function(require,module,exports){
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

},{"./LineOfSight":15,"parallelio-tiles":93,"spark-starter":161}],8:[function(require,module,exports){
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

},{"spark-starter":161}],9:[function(require,module,exports){
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

},{"parallelio-tiles":93}],10:[function(require,module,exports){
module.exports = require('spark-starter').Element

},{"spark-starter":161}],11:[function(require,module,exports){
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

},{"./Confrontation":6,"spark-starter":161}],12:[function(require,module,exports){
const Tile = require('parallelio-tiles').Tile

class Floor extends Tile {};

Floor.properties({
  walkable: {
    composed: true,
    default: true
  },
  transparent: {
    composed: true,
    default: true
  }
})

module.exports = Floor

},{"parallelio-tiles":93}],13:[function(require,module,exports){
const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')
const View = require('./View')
const Player = require('./Player')
const LoaderCollection = require('./saveEngines/LoaderCollection')

class Game extends Element {
  start () {
    return this.currentPlayer
  }

  add (elem) {
    if (Array.isArray(elem)) {
      return elem.map((e) => {
        return this.add(e)
      })
    }
    elem.game = this
    return elem
  }

  load (slot) {
    if (!this.saveEngine) {
      throw (new Error('No Save engine enabled'))
    }
    const data = this.saveEngine.load(slot)
    const loaded = this.loaders.load(data)
    this.add(loaded)
  }

  save (slot) {
    if (!this.saveEngine) {
      throw (new Error('No Save engine enabled'))
    }
    const data = this.savables.map((elem) => {
      return elem.getSaveData()
    })
    this.saveEngine.save(data, slot)
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
  },
  savables: {
    collection: true
  },
  loaders: {
    calcul: function () {
      return new LoaderCollection()
    }
  }
})

Game.prototype.defaultViewClass = View

Game.prototype.defaultPlayerClass = Player

module.exports = Game

},{"./Player":20,"./View":29,"./saveEngines/LoaderCollection":46,"parallelio-timing":103,"spark-starter":161}],14:[function(require,module,exports){
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

},{"spark-starter":161}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"spark-starter":161}],17:[function(require,module,exports){
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

},{"parallelio-tiles":93}],18:[function(require,module,exports){
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

},{"events":49,"parallelio-timing":103,"spark-starter":161}],19:[function(require,module,exports){
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

},{"./LineOfSight":15,"parallelio-timing":103,"spark-starter":161}],20:[function(require,module,exports){
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

},{"spark-starter":161}],21:[function(require,module,exports){
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

},{"parallelio-timing":103,"spark-starter":161}],22:[function(require,module,exports){
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

},{"spark-starter":161}],23:[function(require,module,exports){
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

},{"./Ressource":22,"spark-starter":161}],24:[function(require,module,exports){
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

},{"./ShipInterior":25,"./Travel":28,"./actions/ActionProvider":32,"./actions/TravelAction":38,"spark-starter":161}],25:[function(require,module,exports){
const TileContainer = require('parallelio-tiles').TileContainer
const ShipInteriorGenerator = require('./generators/ShipInteriorGenerator')

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
    generator = generator || new ShipInteriorGenerator()
    generator.shipInterior = this
    generator.generate()
  }
}

ShipInterior.properties({
  x: {
    composed: true,
    default: 0
  },
  y: {
    composed: true,
    default: 0
  },
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
      return this.allTiles().filter((t) => typeof t.attachTo === 'function')
    }
  }
})

module.exports = ShipInterior

},{"./generators/ShipInteriorGenerator":42,"parallelio-tiles":93}],26:[function(require,module,exports){
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

},{"./Damageable":8,"./Projectile":21,"parallelio-tiles":93,"parallelio-timing":103}],27:[function(require,module,exports){
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

},{"spark-starter":161}],28:[function(require,module,exports){
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

},{"parallelio-timing":103,"spark-starter":161}],29:[function(require,module,exports){
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

},{"parallelio-grids":53,"spark-starter":161}],30:[function(require,module,exports){
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

},{"./LineOfSight":15,"parallelio-tiles":93}],31:[function(require,module,exports){
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
    this.actor.currentAction = this
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
    if (this.actor && this.actor.currentAction === this) {
      this.actor.currentAction = null
    }
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

},{"events":49,"spark-starter":161}],32:[function(require,module,exports){
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

},{"spark-starter":161}],33:[function(require,module,exports){
const WalkAction = require('./WalkAction')
const TargetAction = require('./TargetAction')
const EventBind = require('spark-starter').EventBind
const PropertyWatcher = require('spark-starter').watchers.PropertyWatcher

class AttackAction extends TargetAction {
  validTarget () {
    return this.targetIsAttackable() && (this.canUseWeapon() || this.canWalkToTarget())
  }

  targetIsAttackable () {
    return this.target.damageable && this.target.health > 0
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
        target: this.target.tile,
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

},{"./TargetAction":36,"./WalkAction":39,"spark-starter":161}],34:[function(require,module,exports){
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
      if (!this.attackAction.isReady()) {
        return null
      }
      this.attackAction.on('finished', () => {
        if (this.isReady()) {
          return this.execute()
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
        return this.finish()
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

},{"../LineOfSight":15,"./AttackAction":33,"./TargetAction":36,"./WalkAction":39,"parallelio-pathfinder":74,"spark-starter":161}],35:[function(require,module,exports){
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

},{"./ActionProvider":32}],36:[function(require,module,exports){
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

},{"./Action":31}],37:[function(require,module,exports){
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

},{"./ActionProvider":32}],38:[function(require,module,exports){
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

},{"../Travel":28,"./TargetAction":36}],39:[function(require,module,exports){
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
    if (!this.target) {
      return false
    }
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

},{"../PathWalk":18,"./TargetAction":36,"parallelio-pathfinder":74}],40:[function(require,module,exports){
const Element = require('spark-starter').Element
const TileContainer = require('parallelio-tiles').TileContainer
const Tile = require('parallelio-tiles').Tile
const Direction = require('parallelio-tiles').Direction
const Airlock = require('../Airlock')
const Floor = require('../Floor')

class AirlockGenerator extends Element {
  generate () {
    const pos = this.getPos()
    this.structure.allTiles().map((tile) => {
      tile = tile.copyAndRotate(this.direction.angle)
      tile.x += pos.x
      tile.y += pos.y
      this.tileContainer.removeTileAt(tile.x, tile.y)
      this.tileContainer.addTile(tile)
    })
  }

  getPos () {
    const direction = this.direction
    const boundaries = this.tileContainer.boundaries
    let i = 0
    while (i < 20) {
      const x = this.getAxisPos(direction.x, boundaries.left, boundaries.right)
      const y = this.getAxisPos(direction.y, boundaries.top, boundaries.bottom)
      const tileToTest = this.tileContainer.getTile(x + direction.getInverse().x, y + direction.getInverse().y)
      if (tileToTest && tileToTest.walkable) {
        return { x: x, y: y }
      }
      i++
    }
  }

  getAxisPos (mode, min, max) {
    if (mode === 0) {
      return Math.floor(this.rng() * (max - min)) + min
    } else if (mode === 1) {
      return max
    } else {
      return min
    }
  }

  airlockFactory (opt) {
    opt.direction = Direction.up
    return new Airlock(opt)
  }
}

AirlockGenerator.properties({
  tileContainer: {},
  direction: {
    default: Direction.up
  },
  rng: {
    default: Math.random
  },
  wallFactory: {
    calcul: function () {
      return this.parent ? this.parent.wallFactory : function (opt) {
        return new Tile(opt)
      }
    }
  },
  floorFactory: {
    calcul: function () {
      return this.parent ? this.parent.wallFactory : function (opt) {
        return new Floor(opt)
      }
    }
  },
  structure: {
    calcul: function () {
      const tiles = new TileContainer()
      const w = this.wallFactory
      const f = this.floorFactory
      const a = this.airlockFactory.bind(this)
      tiles.loadMatrix([
        [w, a, w],
        [w, f, w]
      ], { x: -1, y: -1 })
      return tiles
    }
  }
})

module.exports = AirlockGenerator

},{"../Airlock":1,"../Floor":12,"parallelio-tiles":93,"spark-starter":161}],41:[function(require,module,exports){
var indexOf = [].indexOf
const Element = require('spark-starter').Element
const TileContainer = require('parallelio-tiles').TileContainer
const Tile = require('parallelio-tiles').Tile
const Direction = require('parallelio-tiles').Direction
const Door = require('../Door')

class RoomGenerator extends Element {
  initTiles () {
    this.finalTiles = null
    this.rooms = []
    this.free = this.plan.allTiles().filter((tile) => {
      return !Direction.all.some((direction) => {
        return this.plan.getTile(tile.x + direction.x, tile.y + direction.y) == null
      })
    })
  }

  generate () {
    this.getTiles().forEach((tile) => {
      this.tileContainer.addTile(tile)
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
    this.finalTiles = this.plan.allTiles().map((tile) => {
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
    return room.tiles.slice().reduce((success, tile) => {
      if (max === 0 || room.tiles.length < max) {
        const next = this.tileOffsetIsFree(tile, direction)
        if (next) {
          this.allocateTile(next, room)
          success = true
          const second = this.tileOffsetIsFree(tile, direction, 2)
          if (second && !this.tileOffsetIsFree(tile, direction, 3)) {
            this.allocateTile(second, room)
          }
        }
      }
      return success
    }, false)
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
          next = this.plan.getTile(tile.x + direction.x, tile.y + direction.y)
          if ((next != null) && next.room !== room) {
            if (indexOf.call(Direction.corners, direction) < 0) {
              otherSide = this.plan.getTile(tile.x + direction.x * 2, tile.y + direction.y * 2)
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
            adjacent = this.plan.getTile(door.x + 1, door.y)
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
    tile = this.plan.getTile(x, y)
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
  tileContainer: {
    calcul: function () {
      return new TileContainer()
    }
  },
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
  plan: {
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

},{"../Door":9,"parallelio-tiles":93,"spark-starter":161}],42:[function(require,module,exports){
const Tile = require('parallelio-tiles').Tile
const RoomGenerator = require('./RoomGenerator')
const AirlockGenerator = require('./AirlockGenerator')
const Floor = require('../Floor')
const Door = require('../AutomaticDoor')
const Element = require('spark-starter').Element
const Direction = require('parallelio-tiles').Direction

class ShipInteriorGenerator extends Element {
  generate () {
    this.roomGenerator.generate()

    this.airlockGenerators.forEach((airlockGen) => {
      airlockGen.generate()
    })

    return this.shipInterior
  }

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

ShipInteriorGenerator.properties({
  shipInterior: {
  },
  rng: {
    default: Math.random
  },
  roomGenerator: {
    calcul: function () {
      const roomGen = new RoomGenerator({
        tileContainer: this.shipInterior,
        rng: this.rng
      })
      roomGen.wallFactory = this.wallFactory
      roomGen.floorFactory = this.floorFactory
      roomGen.doorFactory = this.doorFactory
      return roomGen
    }
  },
  airlockGenerators: {
    calcul: function () {
      return [
        new AirlockGenerator({
          tileContainer: this.shipInterior,
          rng: this.rng,
          direction: Direction.up
        }),
        new AirlockGenerator({
          tileContainer: this.shipInterior,
          rng: this.rng,
          direction: Direction.down
        })
      ]
    }
  }
})

module.exports = ShipInteriorGenerator

},{"../AutomaticDoor":3,"../Floor":12,"./AirlockGenerator":40,"./RoomGenerator":41,"parallelio-tiles":93,"spark-starter":161}],43:[function(require,module,exports){
const Element = require('spark-starter').Element
const Map = require('../Map')
const StarSystem = require('../StarSystem')
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

},{"../Map":16,"../StarSystem":27,"parallelio-strings":84,"spark-starter":161}],44:[function(require,module,exports){
module.exports = {
  "Airlock": require("./Airlock"),
  "Approach": require("./Approach"),
  "AutomaticDoor": require("./AutomaticDoor"),
  "Character": require("./Character"),
  "CharacterAI": require("./CharacterAI"),
  "Confrontation": require("./Confrontation"),
  "Damageable": require("./Damageable"),
  "DamagePropagation": require("./DamagePropagation"),
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
  "Ship": require("./Ship"),
  "ShipInterior": require("./ShipInterior"),
  "ShipWeapon": require("./ShipWeapon"),
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
  "generators": {
    "AirlockGenerator": require("./generators/AirlockGenerator"),
    "RoomGenerator": require("./generators/RoomGenerator"),
    "ShipInteriorGenerator": require("./generators/ShipInteriorGenerator"),
    "StarMapGenerator": require("./generators/StarMapGenerator"),
  },
  "saveEngines": {
    "LoaderCollection": require("./saveEngines/LoaderCollection"),
    "SimpleLoader": require("./saveEngines/SimpleLoader"),
    "SimpleSavable": require("./saveEngines/SimpleSavable"),
  },
}
},{"./Airlock":1,"./Approach":2,"./AutomaticDoor":3,"./Character":4,"./CharacterAI":5,"./Confrontation":6,"./DamagePropagation":7,"./Damageable":8,"./Door":9,"./Element":10,"./EncounterManager":11,"./Floor":12,"./Game":13,"./Inventory":14,"./LineOfSight":15,"./Map":16,"./Obstacle":17,"./PathWalk":18,"./PersonalWeapon":19,"./Player":20,"./Projectile":21,"./Ressource":22,"./RessourceType":23,"./Ship":24,"./ShipInterior":25,"./ShipWeapon":26,"./StarSystem":27,"./Travel":28,"./View":29,"./VisionCalculator":30,"./actions/Action":31,"./actions/ActionProvider":32,"./actions/AttackAction":33,"./actions/AttackMoveAction":34,"./actions/SimpleActionProvider":35,"./actions/TargetAction":36,"./actions/TiledActionProvider":37,"./actions/TravelAction":38,"./actions/WalkAction":39,"./generators/AirlockGenerator":40,"./generators/RoomGenerator":41,"./generators/ShipInteriorGenerator":42,"./generators/StarMapGenerator":43,"./saveEngines/LoaderCollection":46,"./saveEngines/SimpleLoader":47,"./saveEngines/SimpleSavable":48}],45:[function(require,module,exports){
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

},{"./libs":44,"parallelio-grids":53,"parallelio-pathfinder":74,"parallelio-strings":84,"parallelio-tiles":93,"parallelio-timing":103,"parallelio-wiring":110,"spark-starter":161}],46:[function(require,module,exports){
const Collection = require('spark-starter').Collection

class LoaderCollection extends Collection {
  load (data) {
    return data.map(elem => {
      const loader = this.loaders.find(l => l.match(elem))
      if (loader) {
        loader.load(elem)
      }
    })
  }
}

module.exports = LoaderCollection

},{"spark-starter":161}],47:[function(require,module,exports){

class SimpleLoader {
  constructor (construct, alias = null) {
    this.construct = construct
    this.alias = alias || construct.name
  }

  register (game) {
    game.loaders.add(this)
  }

  match (data) {
    return data.typeAlias === this.alias
  }

  load (data) {
    const Construct = this.construct
    return new Construct(data)
  }
}

module.exports = SimpleLoader

},{}],48:[function(require,module,exports){

const SimpleLoader = require('./SimpleLoader')

class SimpleSavable {
  constructor (obj, alias = null, loader = null) {
    this.obj = obj
    this.alias = alias || obj.constructor.name
    this.loader = loader
  }

  makeDefaultLoader () {
    if (!this.obj.constructor.loader) {
      this.obj.constructor.loader = new SimpleLoader(this.obj.constructor, this.alias)
    }
    return this.obj.constructor.loader
  }

  register (game) {
    if (!this.loader) {
      this.loader = this.makeDefaultLoader()
    }
    this.loader.register(game)
    game.savables.add(this)
  }

  getRawData () {
    if (typeof this.obj.getSaveData === 'function') {
      return this.obj.getSaveData()
    }
    return this.obj.propertiesManager.getManualDataProperties()
  }

  getSaveData () {
    return Object.assign(
      { typeAlias: this.alias },
      this.getRawData()
    )
  }
}

module.exports = SimpleSavable

},{"./SimpleLoader":47}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
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
},{"./GridCell":51,"./GridRow":52,"spark-starter":73}],51:[function(require,module,exports){
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
},{"spark-starter":73}],52:[function(require,module,exports){
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
},{"./GridCell":51,"spark-starter":73}],53:[function(require,module,exports){
if(module){
  module.exports = {
    Grid: require('./Grid.js'),
    GridCell: require('./GridCell.js'),
    GridRow: require('./GridRow.js')
  };
}
},{"./Grid.js":50,"./GridCell.js":51,"./GridRow.js":52}],54:[function(require,module,exports){
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


},{}],55:[function(require,module,exports){
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


},{}],56:[function(require,module,exports){
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


},{"./Mixable":60,"./Property":62}],57:[function(require,module,exports){
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


},{"./Binder":54}],58:[function(require,module,exports){
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


},{}],59:[function(require,module,exports){
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


},{"./Binder":54,"./EventBind":57}],60:[function(require,module,exports){
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


},{}],61:[function(require,module,exports){
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


},{}],62:[function(require,module,exports){
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


},{"./Mixable":60,"./PropertyOwner":63,"./PropertyTypes/ActivableProperty":64,"./PropertyTypes/BasicProperty":65,"./PropertyTypes/CalculatedProperty":66,"./PropertyTypes/CollectionProperty":67,"./PropertyTypes/ComposedProperty":68,"./PropertyTypes/DynamicProperty":69,"./PropertyTypes/InvalidatedProperty":70,"./PropertyTypes/UpdatedProperty":71}],63:[function(require,module,exports){
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


},{}],64:[function(require,module,exports){
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


},{"../Invalidator":59,"../Overrider":61,"./BasicProperty":65}],65:[function(require,module,exports){
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


},{"../Mixable":60}],66:[function(require,module,exports){
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


},{"../Invalidator":59,"../Overrider":61,"./DynamicProperty":69}],67:[function(require,module,exports){
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


},{"../Collection":55,"./DynamicProperty":69}],68:[function(require,module,exports){
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


},{"../Collection":55,"../Invalidator":59,"./CalculatedProperty":66}],69:[function(require,module,exports){
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


},{"../Invalidator":59,"./BasicProperty":65}],70:[function(require,module,exports){
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


},{"../Invalidator":59,"./CalculatedProperty":66}],71:[function(require,module,exports){
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


},{"../Invalidator":59,"../Overrider":61,"./DynamicProperty":69}],72:[function(require,module,exports){
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


},{"./Binder":54}],73:[function(require,module,exports){
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
},{"./Binder.js":54,"./Collection.js":55,"./Element.js":56,"./EventBind.js":57,"./EventEmitter.js":58,"./Invalidator.js":59,"./Mixable.js":60,"./Overrider.js":61,"./Property.js":62,"./PropertyOwner.js":63,"./PropertyTypes/ActivableProperty.js":64,"./PropertyTypes/BasicProperty.js":65,"./PropertyTypes/CalculatedProperty.js":66,"./PropertyTypes/CollectionProperty.js":67,"./PropertyTypes/ComposedProperty.js":68,"./PropertyTypes/DynamicProperty.js":69,"./PropertyTypes/InvalidatedProperty.js":70,"./PropertyTypes/UpdatedProperty.js":71,"./Updater.js":72}],74:[function(require,module,exports){
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
},{"spark-starter":83}],75:[function(require,module,exports){
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



},{"./Mixable":79,"spark-properties":134}],76:[function(require,module,exports){
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



},{"spark-properties":134}],77:[function(require,module,exports){
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



},{"spark-properties":134}],78:[function(require,module,exports){
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



},{"./Overrider":80}],79:[function(require,module,exports){
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



},{}],80:[function(require,module,exports){
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



},{}],81:[function(require,module,exports){
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



},{"spark-binding":128}],82:[function(require,module,exports){
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
},{"./Element":75,"./Invalidated/ActivablePropertyWatcher":76,"./Invalidated/Invalidated":77,"./Loader":78,"./Mixable":79,"./Overrider":80,"./Updater":81}],83:[function(require,module,exports){
var libs;

libs = require('./libs');

module.exports = Object.assign({
  'Collection': require('spark-collection')
}, libs, require('spark-properties'), require('spark-binding'));



},{"./libs":82,"spark-binding":128,"spark-collection":132,"spark-properties":134}],84:[function(require,module,exports){
if (typeof module !== "undefined" && module !== null) {
  module.exports = {
      greekAlphabet: require('./strings/greekAlphabet'),
      starNames: require('./strings/starNames')
  };
}
},{"./strings/greekAlphabet":85,"./strings/starNames":86}],85:[function(require,module,exports){
module.exports=[
"alpha",   "beta",    "gamma",   "delta",
"epsilon", "zeta",    "eta",     "theta",
"iota",    "kappa",   "lambda",  "mu",
"nu",      "xi",      "omicron", "pi",	
"rho",     "sigma",   "tau",     "upsilon",
"phi",     "chi",     "psi",     "omega"
]
},{}],86:[function(require,module,exports){
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
},{}],87:[function(require,module,exports){
module.exports = {
  /**
   * @param {{x: number, y: number}} coord
   * @param {number} angle
   * @param {{x: number, y: number}} origin
   * @returns {{x: number, y: number}}
   */
  rotate: function (coord, angle, origin = { x: 0, y: 0 }) {
    const recenterX = coord.x - origin.x
    const recenterY = coord.y - origin.y
    return {
      x: Math.round(Math.cos(angle) * recenterX - Math.sin(angle) * recenterY) + origin.x + 0,
      y: Math.round(Math.sin(angle) * recenterX + Math.cos(angle) * recenterY) + origin.y + 0
    }
  }
}

},{}],88:[function(require,module,exports){

const CoordHelper = require('./CoordHelper')

class Direction {
  constructor (name, x, y, angle, inverseName) {
    this.name = name
    this.x = x
    this.y = y
    this.angle = angle
    this.inverseName = inverseName
  }

  getInverse () {
    return this.constructor[this.inverseName]
  }

  rotate (angle) {
    const coord = CoordHelper.rotate(this, angle)
    return Direction.all.find((d) => {
      return d.x === coord.x && d.y === coord.y
    })
  }
}

Direction.up = new Direction('up', 0, -1, 0, 'down')

Direction.down = new Direction('down', 0, 1, Math.PI, 'up')

Direction.left = new Direction('left', -1, 0, Math.PI / 2 * 3, 'right')

Direction.right = new Direction('right', 1, 0, Math.PI / 2, 'left')

Direction.adjacents = [Direction.up, Direction.down, Direction.left, Direction.right]

Direction.topLeft = new Direction('topLeft', -1, -1, Math.PI / 4 * 7, 'bottomRight')

Direction.topRight = new Direction('topRight', 1, -1, Math.PI / 4, 'bottomLeft')

Direction.bottomRight = new Direction('bottomRight', 1, 1, Math.PI / 4 * 3, 'topLeft')

Direction.bottomLeft = new Direction('bottomLeft', -1, 1, Math.PI / 4 * 5, 'topRight')

Direction.corners = [Direction.topLeft, Direction.topRight, Direction.bottomRight, Direction.bottomLeft]

Direction.all = [Direction.up, Direction.down, Direction.left, Direction.right, Direction.topLeft, Direction.topRight, Direction.bottomRight, Direction.bottomLeft]

module.exports = Direction

},{"./CoordHelper":87}],89:[function(require,module,exports){
const Element = require('spark-starter').Element
const Direction = require('./Direction')
const CoordHelper = require('./CoordHelper')

class Tile extends Element {
  constructor (xOrOptions, y = 0) {
    let opt = xOrOptions
    if (typeof xOrOptions !== 'object') {
      opt = { x: xOrOptions, y: y }
    }
    super(opt)
    this.x = opt.x
    this.y = opt.y
  }

  getRelativeTile (x, y) {
    if (x === 0 && y === 0) {
      return this
    }
    if (this.container != null) {
      return this.container.getTile(this.x + x, this.y + y)
    }
  }

  findDirectionOf (tile) {
    if (tile.tile) {
      tile = tile.tile
    }
    if ((tile.x != null) && (tile.y != null)) {
      return Direction.all.find((d) => {
        return d.x === tile.x - this.x && d.y === tile.y - this.y
      })
    }
  }

  addChild (child, checkRef = true) {
    var index
    index = this.children.indexOf(child)
    if (index === -1) {
      this.children.push(child)
    }
    if (checkRef) {
      child.tile = this
    }
    return child
  }

  removeChild (child, checkRef = true) {
    var index
    index = this.children.indexOf(child)
    if (index > -1) {
      this.children.splice(index, 1)
    }
    if (checkRef && child.tile === this) {
      child.tile = null
    }
  }

  dist (tile) {
    var ctnDist, ref, x, y
    if ((tile != null ? tile.getFinalTile : null) != null) {
      tile = tile.getFinalTile()
    }
    if (((tile != null ? tile.x : null) != null) && (tile.y != null) && (this.x != null) && (this.y != null) && (this.container === tile.container || (ctnDist = (ref = this.container) != null ? typeof ref.dist === 'function' ? ref.dist(tile.container) : null : null))) {
      x = tile.x - this.x
      y = tile.y - this.y
      if (ctnDist) {
        x += ctnDist.x
        y += ctnDist.y
      }
      return {
        x: x,
        y: y,
        length: Math.sqrt(x * x + y * y)
      }
    } else {
      return null
    }
  }

  /**
   * @param {number} angle
   * @param {{x: number, y: number}} origin
   * @returns {this}
   */
  copyAndRotate (angle, origin = { x: 0, y: 0 }) {
    const TileClass = this.constructor
    const data = Object.assign(
      this.propertiesManager.getManualDataProperties(),
      CoordHelper.rotate(this, angle, origin)
    )
    return new TileClass(data)
  }

  getFinalTile () {
    return this
  }

  getCoord () {
    return { x: this.x, y: this.y }
  }
};

Tile.properties({
  children: {
    collection: true
  },
  container: {
    change: function () {
      if (this.container != null) {
        return this.adjacentTiles.forEach(function (tile) {
          return tile.adjacentTilesProperty.invalidate()
        })
      }
    }
  },
  adjacentTiles: {
    calcul: function (invalidation) {
      if (invalidation.prop(this.containerProperty)) {
        return Direction.adjacents.map((d) => {
          return this.getRelativeTile(d.x, d.y)
        }).filter((t) => {
          return t != null
        })
      }
    },
    collection: true
  }
})

module.exports = Tile

},{"./CoordHelper":87,"./Direction":88,"spark-starter":102}],90:[function(require,module,exports){
const Element = require('spark-starter').Element
const TileReference = require('./TileReference')

class TileContainer extends Element {
  _addToBondaries (tile, boundaries) {
    if ((boundaries.top == null) || tile.y < boundaries.top) {
      boundaries.top = tile.y
    }
    if ((boundaries.left == null) || tile.x < boundaries.left) {
      boundaries.left = tile.x
    }
    if ((boundaries.bottom == null) || tile.y > boundaries.bottom) {
      boundaries.bottom = tile.y
    }
    if ((boundaries.right == null) || tile.x > boundaries.right) {
      boundaries.right = tile.x
    }
  }

  init () {
    this.coords = {}
    this.tiles = []
  }

  addTile (tile) {
    if (!this.tiles.includes(tile)) {
      this.tiles.push(tile)
      if (this.coords[tile.x] == null) {
        this.coords[tile.x] = {}
      }
      this.coords[tile.x][tile.y] = tile
      if (this.owner) {
        tile.container = this
      }
      if (this.boundariesProperty.getter.calculated) {
        this._addToBondaries(tile, this.boundariesProperty.value)
      }
    }
    return this
  }

  removeTile (tile) {
    var index
    index = this.tiles.indexOf(tile)
    if (index > -1) {
      this.tiles.splice(index, 1)
      delete this.coords[tile.x][tile.y]
      if (this.owner) {
        tile.container = null
      }
      if (this.boundariesProperty.getter.calculated) {
        if (this.boundaries.top === tile.y || this.boundaries.bottom === tile.y || this.boundaries.left === tile.x || this.boundaries.right === tile.x) {
          return this.boundariesProperty.invalidate()
        }
      }
    }
  }

  removeTileAt (x, y) {
    const tile = this.getTile(x, y)
    if (tile) {
      return this.removeTile(tile)
    }
  }

  getTile (x, y) {
    var ref
    if (((ref = this.coords[x]) != null ? ref[y] : null) != null) {
      return this.coords[x][y]
    }
  }

  loadMatrix (matrix, offset = { x: 0, y: 0 }) {
    var options, row, tile, x, y
    for (y in matrix) {
      row = matrix[y]
      for (x in row) {
        tile = row[x]
        options = {
          x: parseInt(x) + offset.x,
          y: parseInt(y) + offset.y
        }
        if (typeof tile === 'function') {
          this.addTile(tile(options))
        } else {
          tile.x = options.x
          tile.y = options.y
          this.addTile(tile)
        }
      }
    }
    return this
  }

  reduceMatrix (matrix, initalValue = null, offset = { x: 0, y: 0 }) {
    let value = initalValue
    for (const y in matrix) {
      const row = matrix[y]
      for (const x in row) {
        const fn = row[x]
        const pos = {
          x: parseInt(x) + offset.x,
          y: parseInt(y) + offset.y
        }
        value = fn(value, this.getTile(pos.x, pos.y), pos)
      }
    }
    return value
  }

  inRange (tile, range) {
    var found, i, j, ref, ref1, ref2, ref3, tiles, x, y
    tiles = []
    range--
    for (x = i = ref = tile.x - range, ref1 = tile.x + range; (ref <= ref1 ? i <= ref1 : i >= ref1); x = ref <= ref1 ? ++i : --i) {
      for (y = j = ref2 = tile.y - range, ref3 = tile.y + range; (ref2 <= ref3 ? j <= ref3 : j >= ref3); y = ref2 <= ref3 ? ++j : --j) {
        if (Math.sqrt((x - tile.x) * (x - tile.x) + (y - tile.y) * (y - tile.y)) <= range && ((found = this.getTile(x, y)) != null)) {
          tiles.push(found)
        }
      }
    }
    return tiles
  }

  allTiles () {
    return this.tiles.slice()
  }

  clearAll () {
    var i, len, ref, tile
    if (this.owner) {
      ref = this.tiles
      for (i = 0, len = ref.length; i < len; i++) {
        tile = ref[i]
        tile.container = null
      }
    }
    this.coords = {}
    this.tiles = []
    return this
  }

  closest (originTile, filter) {
    var candidates, getScore
    getScore = function (candidate) {
      if (candidate.score == null) {
        candidate.score = candidate.getFinalTile().dist(originTile).length
      }
      return candidate.score
    }
    candidates = this.tiles.filter(filter).map((t) => {
      return new TileReference(t)
    })
    candidates.sort((a, b) => {
      return getScore(a) - getScore(b)
    })
    if (candidates.length > 0) {
      return candidates[0].tile
    } else {
      return null
    }
  }

  copy () {
    var out
    out = new TileContainer()
    out.coords = this.coords
    out.tiles = this.tiles
    out.owner = false
    return out
  }

  merge (ctn, mergeFn, asOwner = false) {
    var out, tmp
    out = new TileContainer()
    out.owner = asOwner
    tmp = ctn.copy()
    this.tiles.forEach(function (tileA) {
      var mergedTile, tileB
      tileB = tmp.getTile(tileA.x, tileA.y)
      if (tileB) {
        tmp.removeTile(tileB)
      }
      mergedTile = mergeFn(tileA, tileB)
      if (mergedTile) {
        return out.addTile(mergedTile)
      }
    })
    tmp.tiles.forEach(function (tileB) {
      var mergedTile
      mergedTile = mergeFn(null, tileB)
      if (mergedTile) {
        return out.addTile(mergedTile)
      }
    })
    return out
  }
};

TileContainer.properties({
  owner: {
    default: true
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
      this.tiles.forEach((tile) => {
        return this._addToBondaries(tile, boundaries)
      })
      return boundaries
    },
    output: function (val) {
      return Object.assign({}, val)
    }
  }
})

module.exports = TileContainer

},{"./TileReference":91,"spark-starter":102}],91:[function(require,module,exports){
class TileReference {
  constructor (tile) {
    this.tile = tile
    Object.defineProperties(this, {
      x: {
        get: () => {
          return this.getFinalTile().x
        }
      },
      y: {
        get: () => {
          return this.getFinalTile().y
        }
      }
    })
  }

  getFinalTile () {
    return this.tile.getFinalTile()
  }
}
module.exports = TileReference

},{}],92:[function(require,module,exports){
const Element = require('spark-starter').Element

class Tiled extends Element {
  putOnRandomTile (tiles) {
    var found
    found = this.getRandomValidTile(tiles)
    if (found) {
      this.tile = found
    }
  }

  getRandomValidTile (tiles, validator = this.canGoOnTile.bind(this)) {
    var candidate, pos, remaining
    remaining = tiles.slice()
    while (remaining.length > 0) {
      pos = Math.floor(Math.random() * remaining.length)
      candidate = remaining.splice(pos, 1)[0]
      if (validator(candidate)) {
        return candidate
      }
    }
    return null
  }

  canGoOnTile (tile) {
    return true
  }

  getFinalTile () {
    return this.tile.getFinalTile()
  }
};

Tiled.properties({
  tile: {
    change: function (val, old) {
      if (old != null) {
        old.removeChild(this)
      }
      if (this.tile) {
        return this.tile.addChild(this)
      }
    }
  },
  offsetX: {
    default: 0
  },
  offsetY: {
    default: 0
  }
})

module.exports = Tiled

},{"spark-starter":102}],93:[function(require,module,exports){
module.exports = {
  CoordHelper: require('./CoordHelper'),
  Direction: require('./Direction'),
  Tile: require('./Tile'),
  TileContainer: require('./TileContainer'),
  TileReference: require('./TileReference'),
  Tiled: require('./Tiled')
}

},{"./CoordHelper":87,"./Direction":88,"./Tile":89,"./TileContainer":90,"./TileReference":91,"./Tiled":92}],94:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"./Mixable":98,"dup":75,"spark-properties":134}],95:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"dup":76,"spark-properties":134}],96:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"dup":77,"spark-properties":134}],97:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"./Overrider":99,"dup":78}],98:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"dup":79}],99:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"dup":80}],100:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"dup":81,"spark-binding":128}],101:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./Element":94,"./Invalidated/ActivablePropertyWatcher":95,"./Invalidated/Invalidated":96,"./Loader":97,"./Mixable":98,"./Overrider":99,"./Updater":100,"dup":82}],102:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"./libs":101,"dup":83,"spark-binding":128,"spark-collection":132,"spark-properties":134}],103:[function(require,module,exports){
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

},{"_process":127,"spark-starter":161,"timers":162}],104:[function(require,module,exports){
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

},{"./SignalOperation":106,"spark-starter":126}],105:[function(require,module,exports){
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

},{"spark-starter":126}],106:[function(require,module,exports){
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

},{"spark-starter":126}],107:[function(require,module,exports){
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

},{"./Connected":104,"./Signal":105,"./SignalOperation":106}],108:[function(require,module,exports){
var Connected, Switch;

Connected = require('./Connected');

module.exports = Switch = class Switch extends Connected {};

},{"./Connected":104}],109:[function(require,module,exports){
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

},{"./Connected":104,"parallelio-tiles":117}],110:[function(require,module,exports){
module.exports = {
  "Connected": require("./Connected"),
  "Signal": require("./Signal"),
  "SignalOperation": require("./SignalOperation"),
  "SignalSource": require("./SignalSource"),
  "Switch": require("./Switch"),
  "Wire": require("./Wire"),
}
},{"./Connected":104,"./Signal":105,"./SignalOperation":106,"./SignalSource":107,"./Switch":108,"./Wire":109}],111:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"dup":87}],112:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"./CoordHelper":111,"dup":88}],113:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"./CoordHelper":111,"./Direction":112,"dup":89,"spark-starter":126}],114:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"./TileReference":115,"dup":90,"spark-starter":126}],115:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"dup":91}],116:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"dup":92,"spark-starter":126}],117:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./CoordHelper":111,"./Direction":112,"./Tile":113,"./TileContainer":114,"./TileReference":115,"./Tiled":116,"dup":93}],118:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"./Mixable":122,"dup":75,"spark-properties":134}],119:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"dup":76,"spark-properties":134}],120:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"dup":77,"spark-properties":134}],121:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"./Overrider":123,"dup":78}],122:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"dup":79}],123:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"dup":80}],124:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"dup":81,"spark-binding":128}],125:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./Element":118,"./Invalidated/ActivablePropertyWatcher":119,"./Invalidated/Invalidated":120,"./Loader":121,"./Mixable":122,"./Overrider":123,"./Updater":124,"dup":82}],126:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"./libs":125,"dup":83,"spark-binding":128,"spark-collection":132,"spark-properties":134}],127:[function(require,module,exports){
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

},{}],128:[function(require,module,exports){
module.exports = {
  Binder: require('./src/Binder'),
  EventBind: require('./src/EventBind'),
  Reference: require('./src/Reference')
}

},{"./src/Binder":129,"./src/EventBind":130,"./src/Reference":131}],129:[function(require,module,exports){
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

},{}],130:[function(require,module,exports){

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

},{"./Binder":129,"./Reference":131}],131:[function(require,module,exports){
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

},{}],132:[function(require,module,exports){
module.exports = require('./src/Collection')

},{"./src/Collection":133}],133:[function(require,module,exports){
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

},{}],134:[function(require,module,exports){
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

},{"./src/Invalidator":137,"./src/PropertiesManager":138,"./src/Property":139,"./src/getters/BaseGetter":140,"./src/getters/CalculatedGetter":141,"./src/getters/CompositeGetter":142,"./src/getters/InvalidatedGetter":143,"./src/getters/ManualGetter":144,"./src/getters/SimpleGetter":145,"./src/setters/BaseSetter":146,"./src/setters/BaseValueSetter":147,"./src/setters/CollectionSetter":148,"./src/setters/ManualSetter":149,"./src/setters/SimpleSetter":150,"./src/watchers/CollectionPropertyWatcher":151,"./src/watchers/PropertyWatcher":152}],135:[function(require,module,exports){
arguments[4][132][0].apply(exports,arguments)
},{"./src/Collection":136,"dup":132}],136:[function(require,module,exports){
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

},{}],137:[function(require,module,exports){
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

},{"spark-binding":128}],138:[function(require,module,exports){
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

},{"./Property":139}],139:[function(require,module,exports){
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

},{"./getters/CalculatedGetter":141,"./getters/CompositeGetter":142,"./getters/InvalidatedGetter":143,"./getters/ManualGetter":144,"./getters/SimpleGetter":145,"./setters/BaseValueSetter":147,"./setters/CollectionSetter":148,"./setters/ManualSetter":149,"./setters/SimpleSetter":150,"events":49}],140:[function(require,module,exports){

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

},{}],141:[function(require,module,exports){

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

},{"./BaseGetter":140}],142:[function(require,module,exports){
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

},{"../Invalidator":137,"./InvalidatedGetter":143,"spark-binding":128,"spark-collection":135}],143:[function(require,module,exports){
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

},{"../Invalidator":137,"./CalculatedGetter":141}],144:[function(require,module,exports){
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

},{"./BaseGetter":140}],145:[function(require,module,exports){
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

},{"./BaseGetter":140}],146:[function(require,module,exports){

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

},{"../watchers/PropertyWatcher":152}],147:[function(require,module,exports){
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

},{"./BaseSetter":146}],148:[function(require,module,exports){
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

},{"../watchers/CollectionPropertyWatcher":151,"./SimpleSetter":150,"spark-collection":135}],149:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class ManualSetter extends BaseSetter {
  set (val) {
    this.prop.callOptionFunct('set', val)
  }
}

module.exports = ManualSetter

},{"./BaseSetter":146}],150:[function(require,module,exports){
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

},{"./BaseSetter":146}],151:[function(require,module,exports){

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

},{"./PropertyWatcher":152}],152:[function(require,module,exports){

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
    this.getProperty().events.addListener('invalidated', this.invalidateCallback)
    return this.getProperty().events.addListener('updated', this.updateCallback)
  }

  doUnbind () {
    this.getProperty().events.removeListener('invalidated', this.invalidateCallback)
    return this.getProperty().events.removeListener('updated', this.updateCallback)
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

},{"spark-binding":128}],153:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"./Mixable":157,"dup":75,"spark-properties":134}],154:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"dup":76,"spark-properties":134}],155:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"dup":77,"spark-properties":134}],156:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"./Overrider":158,"dup":78}],157:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"dup":79}],158:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"dup":80}],159:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"dup":81,"spark-binding":128}],160:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./Element":153,"./Invalidated/ActivablePropertyWatcher":154,"./Invalidated/Invalidated":155,"./Loader":156,"./Mixable":157,"./Overrider":158,"./Updater":159,"dup":82}],161:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"./libs":160,"dup":83,"spark-binding":128,"spark-collection":132,"spark-properties":134}],162:[function(require,module,exports){
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

},{"process/browser.js":127,"timers":162}]},{},[45])(45)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQWlybG9jay5qcyIsImxpYi9BcHByb2FjaC5qcyIsImxpYi9BdXRvbWF0aWNEb29yLmpzIiwibGliL0NoYXJhY3Rlci5qcyIsImxpYi9DaGFyYWN0ZXJBSS5qcyIsImxpYi9Db25mcm9udGF0aW9uLmpzIiwibGliL0RhbWFnZVByb3BhZ2F0aW9uLmpzIiwibGliL0RhbWFnZWFibGUuanMiLCJsaWIvRG9vci5qcyIsImxpYi9FbGVtZW50LmpzIiwibGliL0VuY291bnRlck1hbmFnZXIuanMiLCJsaWIvRmxvb3IuanMiLCJsaWIvR2FtZS5qcyIsImxpYi9JbnZlbnRvcnkuanMiLCJsaWIvTGluZU9mU2lnaHQuanMiLCJsaWIvTWFwLmpzIiwibGliL09ic3RhY2xlLmpzIiwibGliL1BhdGhXYWxrLmpzIiwibGliL1BlcnNvbmFsV2VhcG9uLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9Qcm9qZWN0aWxlLmpzIiwibGliL1Jlc3NvdXJjZS5qcyIsImxpYi9SZXNzb3VyY2VUeXBlLmpzIiwibGliL1NoaXAuanMiLCJsaWIvU2hpcEludGVyaW9yLmpzIiwibGliL1NoaXBXZWFwb24uanMiLCJsaWIvU3RhclN5c3RlbS5qcyIsImxpYi9UcmF2ZWwuanMiLCJsaWIvVmlldy5qcyIsImxpYi9WaXNpb25DYWxjdWxhdG9yLmpzIiwibGliL2FjdGlvbnMvQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9BdHRhY2tBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9BdHRhY2tNb3ZlQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXIuanMiLCJsaWIvYWN0aW9ucy9UYXJnZXRBY3Rpb24uanMiLCJsaWIvYWN0aW9ucy9UaWxlZEFjdGlvblByb3ZpZGVyLmpzIiwibGliL2FjdGlvbnMvVHJhdmVsQWN0aW9uLmpzIiwibGliL2FjdGlvbnMvV2Fsa0FjdGlvbi5qcyIsImxpYi9nZW5lcmF0b3JzL0FpcmxvY2tHZW5lcmF0b3IuanMiLCJsaWIvZ2VuZXJhdG9ycy9Sb29tR2VuZXJhdG9yLmpzIiwibGliL2dlbmVyYXRvcnMvU2hpcEludGVyaW9yR2VuZXJhdG9yLmpzIiwibGliL2dlbmVyYXRvcnMvU3Rhck1hcEdlbmVyYXRvci5qcyIsImxpYi9saWJzLmpzIiwibGliL3BhcmFsbGVsaW8uanMiLCJsaWIvc2F2ZUVuZ2luZXMvTG9hZGVyQ29sbGVjdGlvbi5qcyIsImxpYi9zYXZlRW5naW5lcy9TaW1wbGVMb2FkZXIuanMiLCJsaWIvc2F2ZUVuZ2luZXMvU2ltcGxlU2F2YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbGliL0dyaWQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9saWIvR3JpZENlbGwuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9saWIvR3JpZFJvdy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL2xpYi9ncmlkcy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9CaW5kZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvQ29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9FbGVtZW50LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0V2ZW50QmluZC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9FdmVudEVtaXR0ZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvSW52YWxpZGF0b3IuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvTWl4YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9PdmVycmlkZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlPd25lci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0FjdGl2YWJsZVByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvQmFzaWNQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NvbGxlY3Rpb25Qcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLWdyaWRzL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1Byb3BlcnR5VHlwZXMvVXBkYXRlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tZ3JpZHMvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1VwZGF0ZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1ncmlkcy9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvc3Bhcmstc3RhcnRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvZGlzdC9wYXRoZmluZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tcGF0aGZpbmRlci9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvRWxlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL0ludmFsaWRhdGVkL0ludmFsaWRhdGVkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tcGF0aGZpbmRlci9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvTG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tcGF0aGZpbmRlci9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvTWl4YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL092ZXJyaWRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXBhdGhmaW5kZXIvbm9kZV9tb2R1bGVzL3NwYXJrLXN0YXJ0ZXIvbGliL1VwZGF0ZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1wYXRoZmluZGVyL25vZGVfbW9kdWxlcy9zcGFyay1zdGFydGVyL2xpYi9saWJzLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tcGF0aGZpbmRlci9ub2RlX21vZHVsZXMvc3Bhcmstc3RhcnRlci9saWIvc3Bhcmstc3RhcnRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXN0cmluZ3Mvc3RyaW5ncy9ncmVla0FscGhhYmV0Lmpzb24iLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby1zdHJpbmdzL3N0cmluZ3Mvc3Rhck5hbWVzLmpzb24iLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvQ29vcmRIZWxwZXIuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvRGlyZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby10aWxlcy9saWIvVGlsZUNvbnRhaW5lci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXRpbGVzL2xpYi9UaWxlUmVmZXJlbmNlLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL1RpbGVkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGlsZXMvbGliL3RpbGVzLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8tdGltaW5nL2Rpc3QvdGltaW5nLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9Db25uZWN0ZWQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby13aXJpbmcvbGliL1NpZ25hbC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXdpcmluZy9saWIvU2lnbmFsT3BlcmF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGVsaW8td2lyaW5nL2xpYi9TaWduYWxTb3VyY2UuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsZWxpby13aXJpbmcvbGliL1N3aXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXdpcmluZy9saWIvV2lyZS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxlbGlvLXdpcmluZy9saWIvd2lyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1iaW5kaW5nL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLWJpbmRpbmcvc3JjL0JpbmRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1iaW5kaW5nL3NyYy9FdmVudEJpbmQuanMiLCJub2RlX21vZHVsZXMvc3BhcmstYmluZGluZy9zcmMvUmVmZXJlbmNlLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLWNvbGxlY3Rpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3BhcmstY29sbGVjdGlvbi9zcmMvQ29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvbm9kZV9tb2R1bGVzL3NwYXJrLWNvbGxlY3Rpb24vc3JjL0NvbGxlY3Rpb24uanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvSW52YWxpZGF0b3IuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvUHJvcGVydGllc01hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9CYXNlR2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL2dldHRlcnMvQ2FsY3VsYXRlZEdldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0NvbXBvc2l0ZUdldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0ludmFsaWRhdGVkR2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL2dldHRlcnMvTWFudWFsR2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL2dldHRlcnMvU2ltcGxlR2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvQmFzZVNldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL0Jhc2VWYWx1ZVNldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL0NvbGxlY3Rpb25TZXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9NYW51YWxTZXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9TaW1wbGVTZXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvd2F0Y2hlcnMvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBUaWxlID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVcblxuY2xhc3MgQWlybG9jayBleHRlbmRzIFRpbGUge1xuICBhdHRhY2hUbyAoYWlybG9jaykge1xuICAgIHRoaXMuYXR0YWNoZWRUbyA9IGFpcmxvY2tcbiAgfVxuXG4gIGNvcHlBbmRSb3RhdGUgKGFuZ2xlLCBvcmlnaW4pIHtcbiAgICBjb25zdCBjb3B5ID0gc3VwZXIuY29weUFuZFJvdGF0ZShhbmdsZSwgb3JpZ2luKVxuICAgIGNvcHkuZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb24ucm90YXRlKGFuZ2xlKVxuICAgIHJldHVybiBjb3B5XG4gIH1cbn1cblxuQWlybG9jay5wcm9wZXJ0aWVzKHtcbiAgZGlyZWN0aW9uOiB7fSxcbiAgYXR0YWNoZWRUbzoge31cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQWlybG9ja1xuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5cbmNsYXNzIEFwcHJvYWNoIGV4dGVuZHMgRWxlbWVudCB7XG4gIHN0YXJ0ICgpIHtcbiAgICBpZiAodGhpcy52YWxpZCkge1xuICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlXG4gICAgICB0aGlzLnN1YmplY3QueE1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdjdXJyZW50UG9zLngnLCB0aGlzKVxuICAgICAgdGhpcy5zdWJqZWN0LnlNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgnY3VycmVudFBvcy54JywgdGhpcylcbiAgICAgIHRoaXMudGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kb25lKClcbiAgICAgIH0sIHRoaXMuZHVyYXRpb24pXG4gICAgfVxuICB9XG5cbiAgZG9uZSAoKSB7XG4gICAgdGhpcy5zdWJqZWN0LnhNZW1iZXJzLnJlbW92ZVJlZih7XG4gICAgICBuYW1lOiAnY3VycmVudFBvcy54JyxcbiAgICAgIG9iajogdGhpc1xuICAgIH0pXG4gICAgdGhpcy5zdWJqZWN0LnlNZW1iZXJzLnJlbW92ZVJlZih7XG4gICAgICBuYW1lOiAnY3VycmVudFBvcy54JyxcbiAgICAgIG9iajogdGhpc1xuICAgIH0pXG4gICAgdGhpcy5zdWJqZWN0LnggPSB0aGlzLnRhcmdldFBvcy54XG4gICAgdGhpcy5zdWJqZWN0LnkgPSB0aGlzLnRhcmdldFBvcy54XG4gICAgdGhpcy5zdWJqZWN0QWlybG9jay5hdHRhY2hUbyh0aGlzLnRhcmdldEFpcmxvY2spXG4gICAgdGhpcy5tb3ZpbmcgPSBmYWxzZVxuICAgIHRoaXMuY29tcGxldGUgPSB0cnVlXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy50aW1lb3V0KSB7XG4gICAgICB0aGlzLnRpbWVvdXQuZGVzdHJveSgpXG4gICAgfVxuICB9XG59O1xuXG5BcHByb2FjaC5wcm9wZXJ0aWVzKHtcbiAgdGltaW5nOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgfVxuICB9LFxuICBpbml0aWFsRGlzdDoge1xuICAgIGRlZmF1bHQ6IDUwMFxuICB9LFxuICBybmc6IHtcbiAgICBkZWZhdWx0OiBNYXRoLnJhbmRvbVxuICB9LFxuICBhbmdsZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucm5nICogTWF0aC5QSSAqIDJcbiAgICB9XG4gIH0sXG4gIHN0YXJ0aW5nUG9zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLnN0YXJ0aW5nUG9zLnggKyB0aGlzLmluaXRpYWxEaXN0ICogTWF0aC5jb3ModGhpcy5hbmdsZSksXG4gICAgICAgIHk6IHRoaXMuc3RhcnRpbmdQb3MueSArIHRoaXMuaW5pdGlhbERpc3QgKiBNYXRoLnNpbih0aGlzLmFuZ2xlKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdGFyZ2V0UG9zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLnRhcmdldEFpcmxvY2sueCAtIHRoaXMuc3ViamVjdEFpcmxvY2sueCxcbiAgICAgICAgeTogdGhpcy50YXJnZXRBaXJsb2NrLnkgLSB0aGlzLnN1YmplY3RBaXJsb2NrLnlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHN1YmplY3Q6IHt9LFxuICB0YXJnZXQ6IHt9LFxuICB2YWxpZDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3ViamVjdCAhPSBudWxsICYmXG4gICAgICAgIHRoaXMudGFyZ2V0ICE9IG51bGwgJiZcbiAgICAgICAgdGhpcy5zdWJqZWN0LmFpcmxvY2tzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgdGhpcy50YXJnZXQuYWlybG9ja3MubGVuZ3RoID4gMFxuICAgIH1cbiAgfSxcbiAgc3ViamVjdEFpcmxvY2s6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhaXJsb2Nrc1xuICAgICAgYWlybG9ja3MgPSB0aGlzLnN1YmplY3QuYWlybG9ja3Muc2xpY2UoKVxuICAgICAgYWlybG9ja3Muc29ydCgoYSwgYikgPT4ge1xuICAgICAgICB2YXIgdmFsQSwgdmFsQlxuICAgICAgICB2YWxBID0gTWF0aC5hYnMoYS5kaXJlY3Rpb24ueCAtIE1hdGguY29zKHRoaXMuYW5nbGUpKSArIE1hdGguYWJzKGEuZGlyZWN0aW9uLnkgLSBNYXRoLnNpbih0aGlzLmFuZ2xlKSlcbiAgICAgICAgdmFsQiA9IE1hdGguYWJzKGIuZGlyZWN0aW9uLnggLSBNYXRoLmNvcyh0aGlzLmFuZ2xlKSkgKyBNYXRoLmFicyhiLmRpcmVjdGlvbi55IC0gTWF0aC5zaW4odGhpcy5hbmdsZSkpXG4gICAgICAgIHJldHVybiB2YWxBIC0gdmFsQlxuICAgICAgfSlcbiAgICAgIHJldHVybiBhaXJsb2Nrcy5nZXQoMClcbiAgICB9XG4gIH0sXG4gIHRhcmdldEFpcmxvY2s6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5haXJsb2Nrcy5maW5kKCh0YXJnZXQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5kaXJlY3Rpb24uZ2V0SW52ZXJzZSgpID09PSB0aGlzLnN1YmplY3RBaXJsb2NrLmRpcmVjdGlvblxuICAgICAgfSlcbiAgICB9XG4gIH0sXG4gIG1vdmluZzoge1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gIH0sXG4gIGNvbXBsZXRlOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgY3VycmVudFBvczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgZW5kLCBwcmMsIHN0YXJ0XG4gICAgICBzdGFydCA9IGludmFsaWRhdG9yLnByb3AodGhpcy5zdGFydGluZ1Bvc1Byb3BlcnR5KVxuICAgICAgZW5kID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnRhcmdldFBvc1Byb3BlcnR5KVxuICAgICAgcHJjID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RpbWVvdXQucHJjJykgfHwgMFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogKGVuZC54IC0gc3RhcnQueCkgKiBwcmMgKyBzdGFydC54LFxuICAgICAgICB5OiAoZW5kLnkgLSBzdGFydC55KSAqIHByYyArIHN0YXJ0LnlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGR1cmF0aW9uOiB7XG4gICAgZGVmYXVsdDogMTAwMDBcbiAgfSxcbiAgdGltZW91dDoge31cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwcm9hY2hcbiIsImNvbnN0IERvb3IgPSByZXF1aXJlKCcuL0Rvb3InKVxuY29uc3QgQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9DaGFyYWN0ZXInKVxuXG5jbGFzcyBBdXRvbWF0aWNEb29yIGV4dGVuZHMgRG9vciB7XG4gIHVwZGF0ZVRpbGVNZW1iZXJzIChvbGQpIHtcbiAgICB2YXIgcmVmLCByZWYxLCByZWYyLCByZWYzXG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgcmVmLnJlbW92ZVByb3BlcnR5KHRoaXMudW5sb2NrZWRQcm9wZXJ0eSlcbiAgICAgIH1cbiAgICAgIGlmICgocmVmMSA9IG9sZC50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgcmVmMS5yZW1vdmVQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGlsZSkge1xuICAgICAgaWYgKChyZWYyID0gdGhpcy50aWxlLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYyLmFkZFByb3BlcnR5KHRoaXMudW5sb2NrZWRQcm9wZXJ0eSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAocmVmMyA9IHRoaXMudGlsZS50cmFuc3BhcmVudE1lbWJlcnMpICE9IG51bGwgPyByZWYzLmFkZFByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KSA6IG51bGxcbiAgICB9XG4gIH1cblxuICBpbml0ICgpIHtcbiAgICBzdXBlci5pbml0KClcbiAgICByZXR1cm4gdGhpcy5vcGVuXG4gIH1cblxuICBpc0FjdGl2YXRvclByZXNlbnQgKGludmFsaWRhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZWFjdGl2ZVRpbGVzKGludmFsaWRhdGUpLnNvbWUoKHRpbGUpID0+IHtcbiAgICAgIHZhciBjaGlsZHJlblxuICAgICAgY2hpbGRyZW4gPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKHRpbGUuY2hpbGRyZW5Qcm9wZXJ0eSkgOiB0aWxlLmNoaWxkcmVuXG4gICAgICByZXR1cm4gY2hpbGRyZW4uc29tZSgoY2hpbGQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FuQmVBY3RpdmF0ZWRCeShjaGlsZClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGNhbkJlQWN0aXZhdGVkQnkgKGVsZW0pIHtcbiAgICByZXR1cm4gZWxlbSBpbnN0YW5jZW9mIENoYXJhY3RlclxuICB9XG5cbiAgZ2V0UmVhY3RpdmVUaWxlcyAoaW52YWxpZGF0ZSkge1xuICAgIHZhciBkaXJlY3Rpb24sIHRpbGVcbiAgICB0aWxlID0gaW52YWxpZGF0ZSA/IGludmFsaWRhdGUucHJvcCh0aGlzLnRpbGVQcm9wZXJ0eSkgOiB0aGlzLnRpbGVcbiAgICBpZiAoIXRpbGUpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICBkaXJlY3Rpb24gPSBpbnZhbGlkYXRlID8gaW52YWxpZGF0ZS5wcm9wKHRoaXMuZGlyZWN0aW9uUHJvcGVydHkpIDogdGhpcy5kaXJlY3Rpb25cbiAgICBpZiAoZGlyZWN0aW9uID09PSBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbCkge1xuICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgwLCAxKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoMCwgLTEpXS5maWx0ZXIoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgIT0gbnVsbFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFt0aWxlLCB0aWxlLmdldFJlbGF0aXZlVGlsZSgxLCAwKSwgdGlsZS5nZXRSZWxhdGl2ZVRpbGUoLTEsIDApXS5maWx0ZXIoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgIT0gbnVsbFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn07XG5cbkF1dG9tYXRpY0Rvb3IucHJvcGVydGllcyh7XG4gIG9wZW46IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICByZXR1cm4gIWludmFsaWRhdGUucHJvcCh0aGlzLmxvY2tlZFByb3BlcnR5KSAmJiB0aGlzLmlzQWN0aXZhdG9yUHJlc2VudChpbnZhbGlkYXRlKVxuICAgIH1cbiAgfSxcbiAgbG9ja2VkOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgdW5sb2NrZWQ6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICByZXR1cm4gIWludmFsaWRhdGUucHJvcCh0aGlzLmxvY2tlZFByb3BlcnR5KVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvbWF0aWNEb29yXG4iLCJjb25zdCBUaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZFxuY29uc3QgRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpXG5jb25zdCBXYWxrQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL1dhbGtBY3Rpb24nKVxuY29uc3QgQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXInKVxuXG5jbGFzcyBDaGFyYWN0ZXIgZXh0ZW5kcyBUaWxlZCB7XG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgb3B0aW9ucyA9IHsgbmFtZTogb3B0aW9ucyB9XG4gICAgfVxuICAgIHN1cGVyKG9wdGlvbnMpXG4gIH1cblxuICBzZXREZWZhdWx0cyAoKSB7XG4gICAgaWYgKCF0aGlzLnRpbGUgJiYgKHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lciAhPSBudWxsKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHV0T25SYW5kb21UaWxlKHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lci50aWxlcylcbiAgICB9XG4gIH1cblxuICBjYW5Hb09uVGlsZSAodGlsZSkge1xuICAgIHJldHVybiAodGlsZSAhPSBudWxsID8gdGlsZS53YWxrYWJsZSA6IG51bGwpICE9PSBmYWxzZVxuICB9XG5cbiAgd2Fsa1RvICh0aWxlKSB7XG4gICAgdmFyIGFjdGlvblxuICAgIGFjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgIGFjdG9yOiB0aGlzLFxuICAgICAgdGFyZ2V0OiB0aWxlXG4gICAgfSlcbiAgICBhY3Rpb24uc3RhcnQoKVxuICAgIHJldHVybiBhY3Rpb25cbiAgfVxuXG4gIGlzU2VsZWN0YWJsZUJ5IChwbGF5ZXIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59O1xuXG5DaGFyYWN0ZXIuZXh0ZW5kKERhbWFnZWFibGUpXG5cbkNoYXJhY3Rlci5wcm9wZXJ0aWVzKHtcbiAgbmFtZToge30sXG4gIGdhbWU6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXREZWZhdWx0cygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBvZmZzZXRYOiB7XG4gICAgY29tcG9zZWQ6IHRydWUsXG4gICAgZGVmYXVsdDogMC41XG4gIH0sXG4gIG9mZnNldFk6IHtcbiAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICBkZWZhdWx0OiAwLjVcbiAgfSxcbiAgdGlsZToge1xuICAgIGNvbXBvc2VkOiB0cnVlXG4gIH0sXG4gIGRlZmF1bHRBY3Rpb246IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzXG4gICAgICB9KVxuICAgIH1cbiAgfSxcbiAgYWN0aW9uUHJvdmlkZXI6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgQWN0aW9uUHJvdmlkZXIoe1xuICAgICAgICBvd25lcjogdGhpc1xuICAgICAgfSlcbiAgICAgIHByb3ZpZGVyLmFjdGlvbnNNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgnb3duZXIudGlsZS5hY3Rpb25Qcm92aWRlci5hY3Rpb25zJylcbiAgICAgIHJldHVybiBwcm92aWRlclxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXJcbiIsImNvbnN0IFRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lclxuY29uc3QgVmlzaW9uQ2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vVmlzaW9uQ2FsY3VsYXRvcicpXG5jb25zdCBEb29yID0gcmVxdWlyZSgnLi9Eb29yJylcbmNvbnN0IFdhbGtBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvV2Fsa0FjdGlvbicpXG5jb25zdCBBdHRhY2tNb3ZlQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL0F0dGFja01vdmVBY3Rpb24nKVxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlclxuXG5jbGFzcyBDaGFyYWN0ZXJBSSB7XG4gIGNvbnN0cnVjdG9yIChjaGFyYWN0ZXIpIHtcbiAgICB0aGlzLmNoYXJhY3RlciA9IGNoYXJhY3RlclxuICAgIHRoaXMubmV4dEFjdGlvbkNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dEFjdGlvbigpXG4gICAgfVxuICAgIHRoaXMudmlzaW9uTWVtb3J5ID0gbmV3IFRpbGVDb250YWluZXIoKVxuICAgIHRoaXMudGlsZVdhdGNoZXIgPSBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpc2lvbk1lbW9yeSgpXG4gICAgICB9LFxuICAgICAgcHJvcGVydHk6IHRoaXMuY2hhcmFjdGVyLnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KCd0aWxlJylcbiAgICB9KVxuICB9XG5cbiAgc3RhcnQgKCkge1xuICAgIHRoaXMudGlsZVdhdGNoZXIuYmluZCgpXG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGlvbigpXG4gIH1cblxuICBuZXh0QWN0aW9uICgpIHtcbiAgICB0aGlzLnVwZGF0ZVZpc2lvbk1lbW9yeSgpXG4gICAgY29uc3QgZW5lbXkgPSB0aGlzLmdldENsb3Nlc3RFbmVteSgpXG4gICAgaWYgKGVuZW15KSB7XG4gICAgICByZXR1cm4gdGhpcy5hdHRhY2tNb3ZlVG8oZW5lbXkpLm9uKCdlbmQnLCB0aGlzLm5leHRBY3Rpb25DYWxsYmFjaylcbiAgICB9XG4gICAgY29uc3QgdW5leHBsb3JlZCA9IHRoaXMuZ2V0Q2xvc2VzdFVuZXhwbG9yZWQoKVxuICAgIGlmICh1bmV4cGxvcmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrVG8odW5leHBsb3JlZCkub24oJ2VuZCcsIHRoaXMubmV4dEFjdGlvbkNhbGxiYWNrKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc2V0VmlzaW9uTWVtb3J5KClcbiAgICAgIHJldHVybiB0aGlzLndhbGtUbyh0aGlzLmdldENsb3Nlc3RVbmV4cGxvcmVkKCkpLm9uKCdlbmQnLCB0aGlzLm5leHRBY3Rpb25DYWxsYmFjaylcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaXNpb25NZW1vcnkgKCkge1xuICAgIHZhciBjYWxjdWxhdG9yXG4gICAgY2FsY3VsYXRvciA9IG5ldyBWaXNpb25DYWxjdWxhdG9yKHRoaXMuY2hhcmFjdGVyLnRpbGUpXG4gICAgY2FsY3VsYXRvci5jYWxjdWwoKVxuICAgIHRoaXMudmlzaW9uTWVtb3J5ID0gY2FsY3VsYXRvci50b0NvbnRhaW5lcigpLm1lcmdlKHRoaXMudmlzaW9uTWVtb3J5LCAoYSwgYikgPT4ge1xuICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICBhID0gdGhpcy5hbmFseXplVGlsZShhKVxuICAgICAgfVxuICAgICAgaWYgKChhICE9IG51bGwpICYmIChiICE9IG51bGwpKSB7XG4gICAgICAgIGEudmlzaWJpbGl0eSA9IE1hdGgubWF4KGEudmlzaWJpbGl0eSwgYi52aXNpYmlsaXR5KVxuICAgICAgICByZXR1cm4gYVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGEgfHwgYlxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhbmFseXplVGlsZSAodGlsZSkge1xuICAgIHZhciByZWZcbiAgICB0aWxlLmVubmVteVNwb3R0ZWQgPSAocmVmID0gdGlsZS5nZXRGaW5hbFRpbGUoKS5jaGlsZHJlbikgIT0gbnVsbCA/IHJlZi5maW5kKChjKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5pc0VubmVteShjKVxuICAgIH0pIDogbnVsbFxuICAgIHRpbGUuZXhwbG9yYWJsZSA9IHRoaXMuaXNFeHBsb3JhYmxlKHRpbGUpXG4gICAgcmV0dXJuIHRpbGVcbiAgfVxuXG4gIGlzRW5uZW15IChlbGVtKSB7XG4gICAgdmFyIHJlZlxuICAgIHJldHVybiAocmVmID0gdGhpcy5jaGFyYWN0ZXIub3duZXIpICE9IG51bGwgPyB0eXBlb2YgcmVmLmlzRW5lbXkgPT09ICdmdW5jdGlvbicgPyByZWYuaXNFbmVteShlbGVtKSA6IG51bGwgOiBudWxsXG4gIH1cblxuICBnZXRDbG9zZXN0RW5lbXkgKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2lvbk1lbW9yeS5jbG9zZXN0KHRoaXMuY2hhcmFjdGVyLnRpbGUsICh0KSA9PiB7XG4gICAgICByZXR1cm4gdC5lbm5lbXlTcG90dGVkXG4gICAgfSlcbiAgfVxuXG4gIGdldENsb3Nlc3RVbmV4cGxvcmVkICgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpb25NZW1vcnkuY2xvc2VzdCh0aGlzLmNoYXJhY3Rlci50aWxlLCAodCkgPT4ge1xuICAgICAgcmV0dXJuIHQudmlzaWJpbGl0eSA8IDEgJiYgdC5leHBsb3JhYmxlXG4gICAgfSlcbiAgfVxuXG4gIGlzRXhwbG9yYWJsZSAodGlsZSkge1xuICAgIHZhciByZWZcbiAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKVxuICAgIHJldHVybiB0aWxlLndhbGthYmxlIHx8ICgocmVmID0gdGlsZS5jaGlsZHJlbikgIT0gbnVsbCA/IHJlZi5maW5kKChjKSA9PiB7XG4gICAgICByZXR1cm4gYyBpbnN0YW5jZW9mIERvb3JcbiAgICB9KSA6IG51bGwpXG4gIH1cblxuICBhdHRhY2tNb3ZlVG8gKHRpbGUpIHtcbiAgICB2YXIgYWN0aW9uXG4gICAgdGlsZSA9IHRpbGUuZ2V0RmluYWxUaWxlKClcbiAgICBhY3Rpb24gPSBuZXcgQXR0YWNrTW92ZUFjdGlvbih7XG4gICAgICBhY3RvcjogdGhpcy5jaGFyYWN0ZXIsXG4gICAgICB0YXJnZXQ6IHRpbGVcbiAgICB9KVxuICAgIGlmIChhY3Rpb24uaXNSZWFkeSgpKSB7XG4gICAgICBhY3Rpb24uc3RhcnQoKVxuICAgICAgcmV0dXJuIGFjdGlvblxuICAgIH1cbiAgfVxuXG4gIHdhbGtUbyAodGlsZSkge1xuICAgIHZhciBhY3Rpb25cbiAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKVxuICAgIGFjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgIGFjdG9yOiB0aGlzLmNoYXJhY3RlcixcbiAgICAgIHRhcmdldDogdGlsZVxuICAgIH0pXG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5zdGFydCgpXG4gICAgICByZXR1cm4gYWN0aW9uXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhcmFjdGVyQUlcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgVmlldyA9IHJlcXVpcmUoJy4vVmlldycpXG5jb25zdCBTaGlwID0gcmVxdWlyZSgnLi9TaGlwJylcbmNvbnN0IEFwcHJvYWNoID0gcmVxdWlyZSgnLi9BcHByb2FjaCcpXG5cbmNsYXNzIENvbmZyb250YXRpb24gZXh0ZW5kcyBFbGVtZW50IHtcbiAgc3RhcnQgKCkge1xuICAgIHRoaXMuc3ViamVjdC5lbmNvdW50ZXIgPSB0aGlzXG4gICAgdGhpcy5nYW1lLm1haW5WaWV3ID0gdGhpcy52aWV3XG4gICAgdGhpcy5nYW1lLmFkZCh0aGlzLnN1YmplY3QuaW50ZXJyaW9yKVxuICAgIHRoaXMuc3ViamVjdC5pbnRlcnJpb3IuY29udGFpbmVyID0gdGhpcy52aWV3XG4gICAgdGhpcy5nYW1lLmFkZCh0aGlzLm9wcG9uZW50LmludGVycmlvcilcbiAgICB0aGlzLm9wcG9uZW50LmludGVycmlvci5jb250YWluZXIgPSB0aGlzLnZpZXdcbiAgICB0aGlzLmFwcHJvYWNoLnN0YXJ0KClcbiAgfVxufTtcblxuQ29uZnJvbnRhdGlvbi5wcm9wZXJ0aWVzKHtcbiAgZ2FtZToge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgc3ViamVjdDoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgdmlldzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBWaWV3KClcbiAgICB9XG4gIH0sXG4gIG9wcG9uZW50OiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFNoaXAoKVxuICAgIH1cbiAgfSxcbiAgYXBwcm9hY2g6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgQXBwcm9hY2goe1xuICAgICAgICBzdWJqZWN0OiB0aGlzLm9wcG9uZW50LmludGVycmlvcixcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnN1YmplY3QuaW50ZXJyaW9yXG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBDb25mcm9udGF0aW9uXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IExpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpXG5jb25zdCBEaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uXG5cbmNsYXNzIERhbWFnZVByb3BhZ2F0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gIGdldFRpbGVDb250YWluZXIgKCkge1xuICAgIHJldHVybiB0aGlzLnRpbGUuY29udGFpbmVyXG4gIH1cblxuICBhcHBseSAoKSB7XG4gICAgdGhpcy5nZXREYW1hZ2VkKCkuZm9yRWFjaCgoZGFtYWdlKSA9PiB7XG4gICAgICBkYW1hZ2UudGFyZ2V0LmRhbWFnZShkYW1hZ2UuZGFtYWdlKVxuICAgIH0pXG4gIH1cblxuICBnZXRJbml0aWFsVGlsZXMgKCkge1xuICAgIHZhciBjdG5cbiAgICBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKVxuICAgIHJldHVybiBjdG4uaW5SYW5nZSh0aGlzLnRpbGUsIHRoaXMucmFuZ2UpXG4gIH1cblxuICBnZXRJbml0aWFsRGFtYWdlcyAoKSB7XG4gICAgY29uc3QgdGlsZXMgPSB0aGlzLmdldEluaXRpYWxUaWxlcygpXG4gICAgcmV0dXJuIHRpbGVzLnJlZHVjZSgoZGFtYWdlcywgdGlsZSkgPT4ge1xuICAgICAgaWYgKHRpbGUuZGFtYWdlYWJsZSkge1xuICAgICAgICBjb25zdCBkbWcgPSB0aGlzLmluaXRpYWxEYW1hZ2UodGlsZSwgdGlsZXMubGVuZ3RoKVxuICAgICAgICBpZiAoZG1nKSB7XG4gICAgICAgICAgZGFtYWdlcy5wdXNoKGRtZylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGRhbWFnZXNcbiAgICB9LCBbXSlcbiAgfVxuXG4gIGdldERhbWFnZWQgKCkge1xuICAgIHZhciBhZGRlZFxuICAgIGlmICh0aGlzLl9kYW1hZ2VkID09IG51bGwpIHtcbiAgICAgIGFkZGVkID0gbnVsbFxuICAgICAgZG8ge1xuICAgICAgICBhZGRlZCA9IHRoaXMuc3RlcChhZGRlZClcbiAgICAgIH0gd2hpbGUgKGFkZGVkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZGFtYWdlZFxuICB9XG5cbiAgc3RlcCAoYWRkZWQpIHtcbiAgICBpZiAoYWRkZWQgIT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuZXh0ZW5kZWREYW1hZ2UgIT0gbnVsbCkge1xuICAgICAgICBhZGRlZCA9IHRoaXMuZXh0ZW5kKGFkZGVkKVxuICAgICAgICB0aGlzLl9kYW1hZ2VkID0gYWRkZWQuY29uY2F0KHRoaXMuX2RhbWFnZWQpXG4gICAgICAgIHJldHVybiBhZGRlZC5sZW5ndGggPiAwICYmIGFkZGVkXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhbWFnZWQgPSB0aGlzLmdldEluaXRpYWxEYW1hZ2VzKClcbiAgICAgIHJldHVybiB0aGlzLl9kYW1hZ2VkXG4gICAgfVxuICB9XG5cbiAgaW5EYW1hZ2VkICh0YXJnZXQsIGRhbWFnZWQpIHtcbiAgICBjb25zdCBwb3MgPSBkYW1hZ2VkLmZpbmRJbmRleCgoZGFtYWdlKSA9PiBkYW1hZ2UudGFyZ2V0ID09PSB0YXJnZXQpXG4gICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gcG9zXG4gIH1cblxuICBleHRlbmQgKGRhbWFnZWQpIHtcbiAgICBjb25zdCBjdG4gPSB0aGlzLmdldFRpbGVDb250YWluZXIoKVxuICAgIHJldHVybiBkYW1hZ2VkLnJlZHVjZSgoYWRkZWQsIGRhbWFnZSkgPT4ge1xuICAgICAgaWYgKGRhbWFnZS50YXJnZXQueCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhZGRlZFxuICAgICAgfVxuICAgICAgY29uc3QgbG9jYWwgPSBEaXJlY3Rpb24uYWRqYWNlbnRzLnJlZHVjZSgobG9jYWwsIGRpcikgPT4ge1xuICAgICAgICBjb25zdCB0aWxlID0gY3RuLmdldFRpbGUoZGFtYWdlLnRhcmdldC54ICsgZGlyLngsIGRhbWFnZS50YXJnZXQueSArIGRpci55KVxuICAgICAgICBpZiAoKHRpbGUgIT0gbnVsbCkgJiYgdGlsZS5kYW1hZ2VhYmxlICYmIHRoaXMuaW5EYW1hZ2VkKHRpbGUsIHRoaXMuX2RhbWFnZWQpID09PSBmYWxzZSkge1xuICAgICAgICAgIGxvY2FsLnB1c2godGlsZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG9jYWxcbiAgICAgIH0sIFtdKVxuICAgICAgcmV0dXJuIGxvY2FsLnJlZHVjZSgoYWRkZWQsIHRhcmdldCkgPT4ge1xuICAgICAgICBjb25zdCBkbWcgPSB0aGlzLmV4dGVuZGVkRGFtYWdlKHRhcmdldCwgZGFtYWdlLCBsb2NhbC5sZW5ndGgpXG4gICAgICAgIGlmIChkbWcpIHtcbiAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuaW5EYW1hZ2VkKHRhcmdldCwgYWRkZWQpXG4gICAgICAgICAgaWYgKGV4aXN0aW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYWRkZWQucHVzaChkbWcpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFkZGVkW2V4aXN0aW5nXSA9IHRoaXMubWVyZ2VEYW1hZ2UoYWRkZWRbZXhpc3RpbmddLCBkbWcpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhZGRlZFxuICAgICAgfSwgYWRkZWQpXG4gICAgfSwgW10pXG4gIH1cblxuICBtZXJnZURhbWFnZSAoZDEsIGQyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhcmdldDogZDEudGFyZ2V0LFxuICAgICAgcG93ZXI6IGQxLnBvd2VyICsgZDIucG93ZXIsXG4gICAgICBkYW1hZ2U6IGQxLmRhbWFnZSArIGQyLmRhbWFnZVxuICAgIH1cbiAgfVxuXG4gIG1vZGlmeURhbWFnZSAodGFyZ2V0LCBwb3dlcikge1xuICAgIGlmICh0eXBlb2YgdGFyZ2V0Lm1vZGlmeURhbWFnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGFyZ2V0Lm1vZGlmeURhbWFnZShwb3dlciwgdGhpcy50eXBlKSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocG93ZXIpXG4gICAgfVxuICB9XG59O1xuXG5EYW1hZ2VQcm9wYWdhdGlvbi5wcm9wZXJ0aWVzKHtcbiAgdGlsZToge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgcG93ZXI6IHtcbiAgICBkZWZhdWx0OiAxMFxuICB9LFxuICByYW5nZToge1xuICAgIGRlZmF1bHQ6IDFcbiAgfSxcbiAgdHlwZToge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfVxufSlcblxuRGFtYWdlUHJvcGFnYXRpb24uTm9ybWFsID0gY2xhc3MgTm9ybWFsIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICBpbml0aWFsRGFtYWdlICh0YXJnZXQsIG5iKSB7XG4gICAgdmFyIGRtZ1xuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgdGhpcy5wb3dlcilcbiAgICBpZiAoZG1nID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5EYW1hZ2VQcm9wYWdhdGlvbi5UaGVybWljID0gY2xhc3MgVGhlcm1pYyBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgZXh0ZW5kZWREYW1hZ2UgKHRhcmdldCwgbGFzdCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlclxuICAgIHBvd2VyID0gKGxhc3QuZGFtYWdlIC0gMSkgLyAyIC8gbmIgKiBNYXRoLm1pbigxLCBsYXN0LnRhcmdldC5oZWFsdGggLyBsYXN0LnRhcmdldC5tYXhIZWFsdGggKiA1KVxuICAgIGRtZyA9IHRoaXMubW9kaWZ5RGFtYWdlKHRhcmdldCwgcG93ZXIpXG4gICAgaWYgKGRtZyA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBwb3dlcjogcG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaW5pdGlhbERhbWFnZSAodGFyZ2V0LCBuYikge1xuICAgIHZhciBkbWcsIHBvd2VyXG4gICAgcG93ZXIgPSB0aGlzLnBvd2VyIC8gbmJcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKVxuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5EYW1hZ2VQcm9wYWdhdGlvbi5LaW5ldGljID0gY2xhc3MgS2luZXRpYyBleHRlbmRzIERhbWFnZVByb3BhZ2F0aW9uIHtcbiAgZXh0ZW5kZWREYW1hZ2UgKHRhcmdldCwgbGFzdCwgbmIpIHtcbiAgICB2YXIgZG1nLCBwb3dlclxuICAgIHBvd2VyID0gKGxhc3QucG93ZXIgLSBsYXN0LmRhbWFnZSkgKiBNYXRoLm1pbigxLCBsYXN0LnRhcmdldC5oZWFsdGggLyBsYXN0LnRhcmdldC5tYXhIZWFsdGggKiAyKSAtIDFcbiAgICBkbWcgPSB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHBvd2VyKVxuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHBvd2VyLFxuICAgICAgICBkYW1hZ2U6IGRtZ1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxEYW1hZ2UgKHRhcmdldCwgbmIpIHtcbiAgICB2YXIgZG1nXG4gICAgZG1nID0gdGhpcy5tb2RpZnlEYW1hZ2UodGFyZ2V0LCB0aGlzLnBvd2VyKVxuICAgIGlmIChkbWcgPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcG93ZXI6IHRoaXMucG93ZXIsXG4gICAgICAgIGRhbWFnZTogZG1nXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbW9kaWZ5RGFtYWdlICh0YXJnZXQsIHBvd2VyKSB7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQubW9kaWZ5RGFtYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih0YXJnZXQubW9kaWZ5RGFtYWdlKHBvd2VyLCB0aGlzLnR5cGUpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwb3dlciAqIDAuMjUpXG4gICAgfVxuICB9XG5cbiAgbWVyZ2VEYW1hZ2UgKGQxLCBkMikge1xuICAgIHJldHVybiB7XG4gICAgICB0YXJnZXQ6IGQxLnRhcmdldCxcbiAgICAgIHBvd2VyOiBNYXRoLmZsb29yKChkMS5wb3dlciArIGQyLnBvd2VyKSAvIDIpLFxuICAgICAgZGFtYWdlOiBNYXRoLmZsb29yKChkMS5kYW1hZ2UgKyBkMi5kYW1hZ2UpIC8gMilcbiAgICB9XG4gIH1cbn1cblxuRGFtYWdlUHJvcGFnYXRpb24uRXhwbG9zaXZlID0gKGZ1bmN0aW9uICgpIHtcbiAgY2xhc3MgRXhwbG9zaXZlIGV4dGVuZHMgRGFtYWdlUHJvcGFnYXRpb24ge1xuICAgIGdldERhbWFnZWQgKCkge1xuICAgICAgdmFyIGFuZ2xlLCBpbnNpZGUsIHNoYXJkUG93ZXIsIHRhcmdldFxuICAgICAgdGhpcy5fZGFtYWdlZCA9IFtdXG4gICAgICBjb25zdCBzaGFyZHMgPSBNYXRoLnBvdyh0aGlzLnJhbmdlICsgMSwgMilcbiAgICAgIHNoYXJkUG93ZXIgPSB0aGlzLnBvd2VyIC8gc2hhcmRzXG4gICAgICBpbnNpZGUgPSB0aGlzLnRpbGUuaGVhbHRoIDw9IHRoaXMubW9kaWZ5RGFtYWdlKHRoaXMudGlsZSwgc2hhcmRQb3dlcilcbiAgICAgIGlmIChpbnNpZGUpIHtcbiAgICAgICAgc2hhcmRQb3dlciAqPSA0XG4gICAgICB9XG4gICAgICB0aGlzLl9kYW1hZ2VkID0gQXJyYXkoLi4uQXJyYXkoc2hhcmRzICsgMSkpLnJlZHVjZSgoZGFtYWdlZCkgPT4ge1xuICAgICAgICBhbmdsZSA9IHRoaXMucm5nKCkgKiBNYXRoLlBJICogMlxuICAgICAgICB0YXJnZXQgPSB0aGlzLmdldFRpbGVIaXRCeVNoYXJkKGluc2lkZSwgYW5nbGUpXG4gICAgICAgIGlmICh0YXJnZXQgIT0gbnVsbCkge1xuICAgICAgICAgIGRhbWFnZWQucHVzaCh7XG4gICAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgIHBvd2VyOiBzaGFyZFBvd2VyLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLm1vZGlmeURhbWFnZSh0YXJnZXQsIHNoYXJkUG93ZXIpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGFtYWdlZFxuICAgICAgfSwgW10pXG4gICAgICByZXR1cm4gdGhpcy5fZGFtYWdlZFxuICAgIH1cblxuICAgIGdldFRpbGVIaXRCeVNoYXJkIChpbnNpZGUsIGFuZ2xlKSB7XG4gICAgICB2YXIgY3RuLCBkaXN0LCB0YXJnZXQsIHZlcnRleFxuICAgICAgY3RuID0gdGhpcy5nZXRUaWxlQ29udGFpbmVyKClcbiAgICAgIGRpc3QgPSB0aGlzLnJhbmdlICogdGhpcy5ybmcoKVxuICAgICAgdGFyZ2V0ID0ge1xuICAgICAgICB4OiB0aGlzLnRpbGUueCArIDAuNSArIGRpc3QgKiBNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41ICsgZGlzdCAqIE1hdGguc2luKGFuZ2xlKVxuICAgICAgfVxuICAgICAgaWYgKGluc2lkZSkge1xuICAgICAgICB2ZXJ0ZXggPSBuZXcgTGluZU9mU2lnaHQoY3RuLCB0aGlzLnRpbGUueCArIDAuNSwgdGhpcy50aWxlLnkgKyAwLjUsIHRhcmdldC54LCB0YXJnZXQueSlcbiAgICAgICAgdmVydGV4LnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSAodGlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiAhaW5zaWRlIHx8ICgodGlsZSAhPSBudWxsKSAmJiB0aGlzLnRyYXZlcnNhYmxlQ2FsbGJhY2sodGlsZSkpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnRleC5nZXRFbmRQb2ludCgpLnRpbGVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjdG4uZ2V0VGlsZShNYXRoLmZsb29yKHRhcmdldC54KSwgTWF0aC5mbG9vcih0YXJnZXQueSkpXG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEV4cGxvc2l2ZS5wcm9wZXJ0aWVzKHtcbiAgICBybmc6IHtcbiAgICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gICAgfSxcbiAgICB0cmF2ZXJzYWJsZUNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICByZXR1cm4gISh0eXBlb2YgdGlsZS5nZXRTb2xpZCA9PT0gJ2Z1bmN0aW9uJyAmJiB0aWxlLmdldFNvbGlkKCkpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBFeHBsb3NpdmVcbn0uY2FsbCh0aGlzKSlcblxubW9kdWxlLmV4cG9ydHMgPSBEYW1hZ2VQcm9wYWdhdGlvblxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5cbmNsYXNzIERhbWFnZWFibGUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgZGFtYWdlICh2YWwpIHtcbiAgICB0aGlzLmhlYWx0aCA9IE1hdGgubWF4KDAsIHRoaXMuaGVhbHRoIC0gdmFsKVxuICB9XG5cbiAgd2hlbk5vSGVhbHRoICgpIHt9XG59O1xuXG5EYW1hZ2VhYmxlLnByb3BlcnRpZXMoe1xuICBkYW1hZ2VhYmxlOiB7XG4gICAgZGVmYXVsdDogdHJ1ZVxuICB9LFxuICBtYXhIZWFsdGg6IHtcbiAgICBkZWZhdWx0OiAxMDAwXG4gIH0sXG4gIGhlYWx0aDoge1xuICAgIGRlZmF1bHQ6IDEwMDAsXG4gICAgY2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5oZWFsdGggPD0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aGVuTm9IZWFsdGgoKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBEYW1hZ2VhYmxlXG4iLCJjb25zdCBUaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZFxuXG5jb25zdCBkaXJlY3Rpb25zID0ge1xuICBob3Jpem9udGFsOiAnaG9yaXpvbnRhbCcsXG4gIHZlcnRpY2FsOiAndmVydGljYWwnXG59XG5cbmNsYXNzIERvb3IgZXh0ZW5kcyBUaWxlZCB7XG4gIHVwZGF0ZVRpbGVNZW1iZXJzIChvbGQpIHtcbiAgICB2YXIgcmVmLCByZWYxLCByZWYyLCByZWYzXG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBpZiAoKHJlZiA9IG9sZC53YWxrYWJsZU1lbWJlcnMpICE9IG51bGwpIHtcbiAgICAgICAgcmVmLnJlbW92ZVByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KVxuICAgICAgfVxuICAgICAgaWYgKChyZWYxID0gb2xkLnRyYW5zcGFyZW50TWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYxLnJlbW92ZVByb3BlcnR5KHRoaXMub3BlblByb3BlcnR5KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICBpZiAoKHJlZjIgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsKSB7XG4gICAgICAgIHJlZjIuYWRkUHJvcGVydHkodGhpcy5vcGVuUHJvcGVydHkpXG4gICAgICB9XG4gICAgICByZXR1cm4gKHJlZjMgPSB0aGlzLnRpbGUudHJhbnNwYXJlbnRNZW1iZXJzKSAhPSBudWxsID8gcmVmMy5hZGRQcm9wZXJ0eSh0aGlzLm9wZW5Qcm9wZXJ0eSkgOiBudWxsXG4gICAgfVxuICB9XG59O1xuXG5Eb29yLnByb3BlcnRpZXMoe1xuICB0aWxlOiB7XG4gICAgY2hhbmdlOiBmdW5jdGlvbiAodmFsLCBvbGQpIHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVRpbGVNZW1iZXJzKG9sZClcbiAgICB9XG4gIH0sXG4gIG9wZW46IHtcbiAgICBkZWZhdWx0OiBmYWxzZVxuICB9LFxuICBkaXJlY3Rpb246IHtcbiAgICBkZWZhdWx0OiBkaXJlY3Rpb25zLmhvcml6b250YWxcbiAgfVxufSlcblxuRG9vci5kaXJlY3Rpb25zID0gZGlyZWN0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9IERvb3JcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlclxuY29uc3QgQ29uZnJvbnRhdGlvbiA9IHJlcXVpcmUoJy4vQ29uZnJvbnRhdGlvbicpXG5cbmNsYXNzIEVuY291bnRlck1hbmFnZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgaW5pdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRpb25XYXRjaGVyLmJpbmQoKVxuICB9XG5cbiAgdGVzdEVuY291bnRlciAoKSB7XG4gICAgaWYgKHRoaXMucm5nKCkgPD0gdGhpcy5iYXNlUHJvYmFiaWxpdHkpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0RW5jb3VudGVyKClcbiAgICB9XG4gIH1cblxuICBzdGFydEVuY291bnRlciAoKSB7XG4gICAgdmFyIGVuY291bnRlclxuICAgIGVuY291bnRlciA9IG5ldyBDb25mcm9udGF0aW9uKHtcbiAgICAgIHN1YmplY3Q6IHRoaXMuc3ViamVjdCxcbiAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgIH0pXG4gICAgcmV0dXJuIGVuY291bnRlci5zdGFydCgpXG4gIH1cbn07XG5cbkVuY291bnRlck1hbmFnZXIucHJvcGVydGllcyh7XG4gIHN1YmplY3Q6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIGdhbWU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIGJhc2VQcm9iYWJpbGl0eToge1xuICAgIGRlZmF1bHQ6IDAuMlxuICB9LFxuICBsb2NhdGlvbldhdGNoZXI6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50ZXN0RW5jb3VudGVyKClcbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydHk6IHRoaXMuc3ViamVjdC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eSgnbG9jYXRpb24nKVxuICAgICAgfSlcbiAgICB9XG4gIH0sXG4gIHJuZzoge1xuICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gRW5jb3VudGVyTWFuYWdlclxuIiwiY29uc3QgVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlXG5cbmNsYXNzIEZsb29yIGV4dGVuZHMgVGlsZSB7fTtcblxuRmxvb3IucHJvcGVydGllcyh7XG4gIHdhbGthYmxlOiB7XG4gICAgY29tcG9zZWQ6IHRydWUsXG4gICAgZGVmYXVsdDogdHJ1ZVxuICB9LFxuICB0cmFuc3BhcmVudDoge1xuICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgIGRlZmF1bHQ6IHRydWVcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5jb25zdCBWaWV3ID0gcmVxdWlyZSgnLi9WaWV3JylcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJylcbmNvbnN0IExvYWRlckNvbGxlY3Rpb24gPSByZXF1aXJlKCcuL3NhdmVFbmdpbmVzL0xvYWRlckNvbGxlY3Rpb24nKVxuXG5jbGFzcyBHYW1lIGV4dGVuZHMgRWxlbWVudCB7XG4gIHN0YXJ0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UGxheWVyXG4gIH1cblxuICBhZGQgKGVsZW0pIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShlbGVtKSkge1xuICAgICAgcmV0dXJuIGVsZW0ubWFwKChlKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZChlKVxuICAgICAgfSlcbiAgICB9XG4gICAgZWxlbS5nYW1lID0gdGhpc1xuICAgIHJldHVybiBlbGVtXG4gIH1cblxuICBsb2FkIChzbG90KSB7XG4gICAgaWYgKCF0aGlzLnNhdmVFbmdpbmUpIHtcbiAgICAgIHRocm93IChuZXcgRXJyb3IoJ05vIFNhdmUgZW5naW5lIGVuYWJsZWQnKSlcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2F2ZUVuZ2luZS5sb2FkKHNsb3QpXG4gICAgY29uc3QgbG9hZGVkID0gdGhpcy5sb2FkZXJzLmxvYWQoZGF0YSlcbiAgICB0aGlzLmFkZChsb2FkZWQpXG4gIH1cblxuICBzYXZlIChzbG90KSB7XG4gICAgaWYgKCF0aGlzLnNhdmVFbmdpbmUpIHtcbiAgICAgIHRocm93IChuZXcgRXJyb3IoJ05vIFNhdmUgZW5naW5lIGVuYWJsZWQnKSlcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2F2YWJsZXMubWFwKChlbGVtKSA9PiB7XG4gICAgICByZXR1cm4gZWxlbS5nZXRTYXZlRGF0YSgpXG4gICAgfSlcbiAgICB0aGlzLnNhdmVFbmdpbmUuc2F2ZShkYXRhLCBzbG90KVxuICB9XG59O1xuXG5HYW1lLnByb3BlcnRpZXMoe1xuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH0sXG4gIG1haW5WaWV3OiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy52aWV3cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZpZXdzLmdldCgwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgVmlld0NsYXNzID0gdGhpcy5kZWZhdWx0Vmlld0NsYXNzXG4gICAgICAgIHJldHVybiB0aGlzLmFkZChuZXcgVmlld0NsYXNzKCkpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB2aWV3czoge1xuICAgIGNvbGxlY3Rpb246IHRydWVcbiAgfSxcbiAgY3VycmVudFBsYXllcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMucGxheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllcnMuZ2V0KDApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBQbGF5ZXJDbGFzcyA9IHRoaXMuZGVmYXVsdFBsYXllckNsYXNzXG4gICAgICAgIHJldHVybiB0aGlzLmFkZChuZXcgUGxheWVyQ2xhc3MoKSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBsYXllcnM6IHtcbiAgICBjb2xsZWN0aW9uOiB0cnVlXG4gIH0sXG4gIHNhdmFibGVzOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZVxuICB9LFxuICBsb2FkZXJzOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IExvYWRlckNvbGxlY3Rpb24oKVxuICAgIH1cbiAgfVxufSlcblxuR2FtZS5wcm90b3R5cGUuZGVmYXVsdFZpZXdDbGFzcyA9IFZpZXdcblxuR2FtZS5wcm90b3R5cGUuZGVmYXVsdFBsYXllckNsYXNzID0gUGxheWVyXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVxuIiwiY29uc3QgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5Db2xsZWN0aW9uXG5cbmNsYXNzIEludmVudG9yeSBleHRlbmRzIENvbGxlY3Rpb24ge1xuICBnZXRCeVR5cGUgKHR5cGUpIHtcbiAgICB2YXIgcmVzXG4gICAgcmVzID0gdGhpcy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgIHJldHVybiByLnR5cGUgPT09IHR5cGVcbiAgICB9KVxuICAgIGlmIChyZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmVzWzBdXG4gICAgfVxuICB9XG5cbiAgYWRkQnlUeXBlICh0eXBlLCBxdGUsIHBhcnRpYWwgPSBmYWxzZSkge1xuICAgIHZhciByZXNzb3VyY2VcbiAgICByZXNzb3VyY2UgPSB0aGlzLmdldEJ5VHlwZSh0eXBlKVxuICAgIGlmICghcmVzc291cmNlKSB7XG4gICAgICByZXNzb3VyY2UgPSB0aGlzLmluaXRSZXNzb3VyY2UodHlwZSlcbiAgICB9XG4gICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgIHJlc3NvdXJjZS5wYXJ0aWFsQ2hhbmdlKHJlc3NvdXJjZS5xdGUgKyBxdGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3NvdXJjZS5xdGUgKz0gcXRlXG4gICAgfVxuICB9XG5cbiAgaW5pdFJlc3NvdXJjZSAodHlwZSwgb3B0KSB7XG4gICAgcmV0dXJuIHR5cGUuaW5pdFJlc3NvdXJjZShvcHQpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZlbnRvcnlcbiIsImNsYXNzIExpbmVPZlNpZ2h0IHtcbiAgY29uc3RydWN0b3IgKHRpbGVzLCB4MSA9IDAsIHkxID0gMCwgeDIgPSAwLCB5MiA9IDApIHtcbiAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB0aGlzLngxID0geDFcbiAgICB0aGlzLnkxID0geTFcbiAgICB0aGlzLngyID0geDJcbiAgICB0aGlzLnkyID0geTJcbiAgfVxuXG4gIHNldFgxICh2YWwpIHtcbiAgICB0aGlzLngxID0gdmFsXG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpXG4gIH1cblxuICBzZXRZMSAodmFsKSB7XG4gICAgdGhpcy55MSA9IHZhbFxuICAgIHJldHVybiB0aGlzLmludmFsaWRhZGUoKVxuICB9XG5cbiAgc2V0WDIgKHZhbCkge1xuICAgIHRoaXMueDIgPSB2YWxcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYWRlKClcbiAgfVxuXG4gIHNldFkyICh2YWwpIHtcbiAgICB0aGlzLnkyID0gdmFsXG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGFkZSgpXG4gIH1cblxuICBpbnZhbGlkYWRlICgpIHtcbiAgICB0aGlzLmVuZFBvaW50ID0gbnVsbFxuICAgIHRoaXMuc3VjY2VzcyA9IG51bGxcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICB9XG5cbiAgdGVzdFRpbGUgKHRpbGUsIGVudHJ5WCwgZW50cnlZKSB7XG4gICAgaWYgKHRoaXMudHJhdmVyc2FibGVDYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmF2ZXJzYWJsZUNhbGxiYWNrKHRpbGUsIGVudHJ5WCwgZW50cnlZKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRpbGUgIT0gbnVsbCkgJiYgKHR5cGVvZiB0aWxlLmdldFRyYW5zcGFyZW50ID09PSAnZnVuY3Rpb24nID8gdGlsZS5nZXRUcmFuc3BhcmVudCgpIDogdGlsZS50cmFuc3BhcmVudCAhPSBudWxsID8gdGlsZS50cmFuc3BhcmVudCA6IHRydWUpXG4gICAgfVxuICB9XG5cbiAgdGVzdFRpbGVBdCAoeCwgeSwgZW50cnlYLCBlbnRyeVkpIHtcbiAgICByZXR1cm4gdGhpcy50ZXN0VGlsZSh0aGlzLnRpbGVzLmdldFRpbGUoTWF0aC5mbG9vcih4KSwgTWF0aC5mbG9vcih5KSksIGVudHJ5WCwgZW50cnlZKVxuICB9XG5cbiAgcmV2ZXJzZVRyYWNpbmcgKCkge1xuICAgIHZhciB0bXBYLCB0bXBZXG4gICAgdG1wWCA9IHRoaXMueDFcbiAgICB0bXBZID0gdGhpcy55MVxuICAgIHRoaXMueDEgPSB0aGlzLngyXG4gICAgdGhpcy55MSA9IHRoaXMueTJcbiAgICB0aGlzLngyID0gdG1wWFxuICAgIHRoaXMueTIgPSB0bXBZXG4gICAgdGhpcy5yZXZlcnNlZCA9ICF0aGlzLnJldmVyc2VkXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHZhciBuZXh0WCwgbmV4dFksIHBvc2l0aXZlWCwgcG9zaXRpdmVZLCByYXRpbywgdGlsZVgsIHRpbGVZLCB0b3RhbCwgeCwgeVxuICAgIHJhdGlvID0gKHRoaXMueDIgLSB0aGlzLngxKSAvICh0aGlzLnkyIC0gdGhpcy55MSlcbiAgICB0b3RhbCA9IE1hdGguYWJzKHRoaXMueDIgLSB0aGlzLngxKSArIE1hdGguYWJzKHRoaXMueTIgLSB0aGlzLnkxKVxuICAgIHBvc2l0aXZlWCA9ICh0aGlzLngyIC0gdGhpcy54MSkgPj0gMFxuICAgIHBvc2l0aXZlWSA9ICh0aGlzLnkyIC0gdGhpcy55MSkgPj0gMFxuICAgIHRpbGVYID0geCA9IHRoaXMueDFcbiAgICB0aWxlWSA9IHkgPSB0aGlzLnkxXG4gICAgaWYgKHRoaXMucmV2ZXJzZWQpIHtcbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDFcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICB9XG4gICAgd2hpbGUgKHRvdGFsID4gTWF0aC5hYnMoeCAtIHRoaXMueDEpICsgTWF0aC5hYnMoeSAtIHRoaXMueTEpICYmIHRoaXMudGVzdFRpbGVBdCh0aWxlWCwgdGlsZVksIHgsIHkpKSB7XG4gICAgICBuZXh0WCA9IHBvc2l0aXZlWCA/IE1hdGguZmxvb3IoeCkgKyAxIDogTWF0aC5jZWlsKHgpIC0gMVxuICAgICAgbmV4dFkgPSBwb3NpdGl2ZVkgPyBNYXRoLmZsb29yKHkpICsgMSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICAgIGlmICh0aGlzLngyIC0gdGhpcy54MSA9PT0gMCkge1xuICAgICAgICB5ID0gbmV4dFlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy55MiAtIHRoaXMueTEgPT09IDApIHtcbiAgICAgICAgeCA9IG5leHRYXG4gICAgICB9IGVsc2UgaWYgKE1hdGguYWJzKChuZXh0WCAtIHgpIC8gKHRoaXMueDIgLSB0aGlzLngxKSkgPCBNYXRoLmFicygobmV4dFkgLSB5KSAvICh0aGlzLnkyIC0gdGhpcy55MSkpKSB7XG4gICAgICAgIHggPSBuZXh0WFxuICAgICAgICB5ID0gKG5leHRYIC0gdGhpcy54MSkgLyByYXRpbyArIHRoaXMueTFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHggPSAobmV4dFkgLSB0aGlzLnkxKSAqIHJhdGlvICsgdGhpcy54MVxuICAgICAgICB5ID0gbmV4dFlcbiAgICAgIH1cbiAgICAgIHRpbGVYID0gcG9zaXRpdmVYID8geCA6IE1hdGguY2VpbCh4KSAtIDFcbiAgICAgIHRpbGVZID0gcG9zaXRpdmVZID8geSA6IE1hdGguY2VpbCh5KSAtIDFcbiAgICB9XG4gICAgaWYgKHRvdGFsIDw9IE1hdGguYWJzKHggLSB0aGlzLngxKSArIE1hdGguYWJzKHkgLSB0aGlzLnkxKSkge1xuICAgICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgICAgeDogdGhpcy54MixcbiAgICAgICAgeTogdGhpcy55MixcbiAgICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGhpcy54MiksIE1hdGguZmxvb3IodGhpcy55MikpXG4gICAgICB9XG4gICAgICB0aGlzLnN1Y2Nlc3MgPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kUG9pbnQgPSB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHRpbGU6IHRoaXMudGlsZXMuZ2V0VGlsZShNYXRoLmZsb29yKHRpbGVYKSwgTWF0aC5mbG9vcih0aWxlWSkpXG4gICAgICB9XG4gICAgICB0aGlzLnN1Y2Nlc3MgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGZvcmNlU3VjY2VzcyAoKSB7XG4gICAgdGhpcy5lbmRQb2ludCA9IHtcbiAgICAgIHg6IHRoaXMueDIsXG4gICAgICB5OiB0aGlzLnkyLFxuICAgICAgdGlsZTogdGhpcy50aWxlcy5nZXRUaWxlKE1hdGguZmxvb3IodGhpcy54MiksIE1hdGguZmxvb3IodGhpcy55MikpXG4gICAgfVxuICAgIHRoaXMuc3VjY2VzcyA9IHRydWVcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGdldFN1Y2Nlc3MgKCkge1xuICAgIGlmICghdGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bCgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3NcbiAgfVxuXG4gIGdldEVuZFBvaW50ICgpIHtcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xuICAgICAgdGhpcy5jYWxjdWwoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmRQb2ludFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZU9mU2lnaHRcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBNYXAgZXh0ZW5kcyBFbGVtZW50IHtcbiAgX2FkZFRvQm9uZGFyaWVzIChsb2NhdGlvbiwgYm91bmRhcmllcykge1xuICAgIGlmICgoYm91bmRhcmllcy50b3AgPT0gbnVsbCkgfHwgbG9jYXRpb24ueSA8IGJvdW5kYXJpZXMudG9wKSB7XG4gICAgICBib3VuZGFyaWVzLnRvcCA9IGxvY2F0aW9uLnlcbiAgICB9XG4gICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgbG9jYXRpb24ueCA8IGJvdW5kYXJpZXMubGVmdCkge1xuICAgICAgYm91bmRhcmllcy5sZWZ0ID0gbG9jYXRpb24ueFxuICAgIH1cbiAgICBpZiAoKGJvdW5kYXJpZXMuYm90dG9tID09IG51bGwpIHx8IGxvY2F0aW9uLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgYm91bmRhcmllcy5ib3R0b20gPSBsb2NhdGlvbi55XG4gICAgfVxuICAgIGlmICgoYm91bmRhcmllcy5yaWdodCA9PSBudWxsKSB8fCBsb2NhdGlvbi54ID4gYm91bmRhcmllcy5yaWdodCkge1xuICAgICAgYm91bmRhcmllcy5yaWdodCA9IGxvY2F0aW9uLnhcbiAgICB9XG4gIH1cbn07XG5cbk1hcC5wcm9wZXJ0aWVzKHtcbiAgbG9jYXRpb25zOiB7XG4gICAgY29sbGVjdGlvbjoge1xuICAgICAgY2xvc2VzdDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdmFyIG1pbiwgbWluRGlzdFxuICAgICAgICBtaW4gPSBudWxsXG4gICAgICAgIG1pbkRpc3QgPSBudWxsXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgICAgICB2YXIgZGlzdFxuICAgICAgICAgIGRpc3QgPSBsb2NhdGlvbi5kaXN0KHgsIHkpXG4gICAgICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgICAgIG1pbiA9IGxvY2F0aW9uXG4gICAgICAgICAgICBtaW5EaXN0ID0gZGlzdFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIG1pblxuICAgICAgfSxcbiAgICAgIGNsb3Nlc3RzOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB2YXIgZGlzdHNcbiAgICAgICAgZGlzdHMgPSB0aGlzLm1hcChmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlzdDogbG9jYXRpb24uZGlzdCh4LCB5KSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgZGlzdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3RcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weShkaXN0cy5tYXAoZnVuY3Rpb24gKGRpc3QpIHtcbiAgICAgICAgICByZXR1cm4gZGlzdC5sb2NhdGlvblxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJvdW5kYXJpZXM6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBib3VuZGFyaWVzXG4gICAgICBib3VuZGFyaWVzID0ge1xuICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgIGxlZnQ6IG51bGwsXG4gICAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgICAgcmlnaHQ6IG51bGxcbiAgICAgIH1cbiAgICAgIHRoaXMubG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRUb0JvbmRhcmllcyhsb2NhdGlvbiwgYm91bmRhcmllcylcbiAgICAgIH0pXG4gICAgICByZXR1cm4gYm91bmRhcmllc1xuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBcbiIsImNvbnN0IFRpbGVkID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVkXG5cbmNsYXNzIE9ic3RhY2xlIGV4dGVuZHMgVGlsZWQge1xuICB1cGRhdGVXYWxrYWJsZXMgKG9sZCkge1xuICAgIHZhciByZWYsIHJlZjFcbiAgICBpZiAob2xkICE9IG51bGwpIHtcbiAgICAgIGlmICgocmVmID0gb2xkLndhbGthYmxlTWVtYmVycykgIT0gbnVsbCkge1xuICAgICAgICByZWYucmVtb3ZlUmVmKHtcbiAgICAgICAgICBuYW1lOiAnd2Fsa2FibGUnLFxuICAgICAgICAgIG9iajogdGhpc1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50aWxlKSB7XG4gICAgICByZXR1cm4gKHJlZjEgPSB0aGlzLnRpbGUud2Fsa2FibGVNZW1iZXJzKSAhPSBudWxsID8gcmVmMS5zZXRWYWx1ZVJlZihmYWxzZSwgJ3dhbGthYmxlJywgdGhpcykgOiBudWxsXG4gICAgfVxuICB9XG59O1xuXG5PYnN0YWNsZS5wcm9wZXJ0aWVzKHtcbiAgdGlsZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkLCBvdmVycmlkZWQpIHtcbiAgICAgIG92ZXJyaWRlZChvbGQpXG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVXYWxrYWJsZXMob2xkKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBPYnN0YWNsZVxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jbGFzcyBQYXRoV2FsayBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAod2Fsa2VyLCBwYXRoLCBvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucylcbiAgICB0aGlzLndhbGtlciA9IHdhbGtlclxuICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgfVxuXG4gIHN0YXJ0ICgpIHtcbiAgICBpZiAoIXRoaXMucGF0aC5zb2x1dGlvbikge1xuICAgICAgdGhpcy5wYXRoLmNhbGN1bCgpXG4gICAgfVxuICAgIGlmICh0aGlzLnBhdGguc29sdXRpb24pIHtcbiAgICAgIHRoaXMucGF0aFRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKClcbiAgICAgIH0sIHRoaXMudG90YWxUaW1lKVxuICAgICAgdGhpcy53YWxrZXIudGlsZU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi50aWxlJywgdGhpcylcbiAgICAgIHRoaXMud2Fsa2VyLm9mZnNldFhNZW1iZXJzLmFkZFByb3BlcnR5UGF0aCgncG9zaXRpb24ub2Zmc2V0WCcsIHRoaXMpXG4gICAgICByZXR1cm4gdGhpcy53YWxrZXIub2Zmc2V0WU1lbWJlcnMuYWRkUHJvcGVydHlQYXRoKCdwb3NpdGlvbi5vZmZzZXRZJywgdGhpcylcbiAgICB9XG4gIH1cblxuICBzdG9wICgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoVGltZW91dC5wYXVzZSgpXG4gIH1cblxuICBmaW5pc2ggKCkge1xuICAgIHRoaXMud2Fsa2VyLnRpbGUgPSB0aGlzLnBvc2l0aW9uLnRpbGVcbiAgICB0aGlzLndhbGtlci5vZmZzZXRYID0gdGhpcy5wb3NpdGlvbi5vZmZzZXRYXG4gICAgdGhpcy53YWxrZXIub2Zmc2V0WSA9IHRoaXMucG9zaXRpb24ub2Zmc2V0WVxuICAgIHRoaXMuZW1pdCgnZmluaXNoZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBpbnRlcnJ1cHQgKCkge1xuICAgIHRoaXMuZW1pdCgnaW50ZXJydXB0ZWQnKVxuICAgIHJldHVybiB0aGlzLmVuZCgpXG4gIH1cblxuICBlbmQgKCkge1xuICAgIHRoaXMuZW1pdCgnZW5kJylcbiAgICByZXR1cm4gdGhpcy5kZXN0cm95KClcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLndhbGtlci53YWxrID09PSB0aGlzKSB7XG4gICAgICB0aGlzLndhbGtlci53YWxrID0gbnVsbFxuICAgIH1cbiAgICB0aGlzLndhbGtlci50aWxlTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLnRpbGUnLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLndhbGtlci5vZmZzZXRYTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFgnLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLndhbGtlci5vZmZzZXRZTWVtYmVycy5yZW1vdmVSZWYoe1xuICAgICAgbmFtZTogJ3Bvc2l0aW9uLm9mZnNldFknLFxuICAgICAgb2JqOiB0aGlzXG4gICAgfSlcbiAgICB0aGlzLnBhdGhUaW1lb3V0LmRlc3Ryb3koKVxuICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKClcbiAgfVxufTtcblxuUGF0aFdhbGsuaW5jbHVkZShFdmVudEVtaXR0ZXIucHJvdG90eXBlKVxuXG5QYXRoV2Fsay5wcm9wZXJ0aWVzKHtcbiAgc3BlZWQ6IHtcbiAgICBkZWZhdWx0OiA1XG4gIH0sXG4gIHRpbWluZzoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlZlxuICAgICAgaWYgKChyZWYgPSB0aGlzLndhbGtlci5nYW1lKSAhPSBudWxsID8gcmVmLnRpbWluZyA6IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2VyLmdhbWUudGltaW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwYXRoTGVuZ3RoOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKClcbiAgICB9XG4gIH0sXG4gIHRvdGFsVGltZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aExlbmd0aCAvIHRoaXMuc3BlZWQgKiAxMDAwXG4gICAgfVxuICB9LFxuICBwb3NpdGlvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoLmdldFBvc0F0UHJjKGludmFsaWRhdG9yLnByb3BQYXRoKCdwYXRoVGltZW91dC5wcmMnKSB8fCAwKVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoV2Fsa1xuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBMaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4vTGluZU9mU2lnaHQnKVxuY29uc3QgVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKVxuXG5jbGFzcyBQZXJzb25hbFdlYXBvbiBleHRlbmRzIEVsZW1lbnQge1xuICBjYW5CZVVzZWQgKCkge1xuICAgIHJldHVybiB0aGlzLmNoYXJnZWRcbiAgfVxuXG4gIGNhblVzZU9uICh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5jYW5Vc2VGcm9tKHRoaXMudXNlci50aWxlLCB0YXJnZXQpXG4gIH1cblxuICBjYW5Vc2VGcm9tICh0aWxlLCB0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5yYW5nZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5NZWxlZVJhbmdlKHRpbGUsIHRhcmdldClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5SYW5nZSh0aWxlLCB0YXJnZXQpICYmIHRoaXMuaGFzTGluZU9mU2lnaHQodGlsZSwgdGFyZ2V0KVxuICAgIH1cbiAgfVxuXG4gIGluUmFuZ2UgKHRpbGUsIHRhcmdldCkge1xuICAgIHZhciByZWYsIHRhcmdldFRpbGVcbiAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0XG4gICAgcmV0dXJuICgocmVmID0gdGlsZS5kaXN0KHRhcmdldFRpbGUpKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IG51bGwpIDw9IHRoaXMucmFuZ2VcbiAgfVxuXG4gIGluTWVsZWVSYW5nZSAodGlsZSwgdGFyZ2V0KSB7XG4gICAgdmFyIHRhcmdldFRpbGVcbiAgICB0YXJnZXRUaWxlID0gdGFyZ2V0LnRpbGUgfHwgdGFyZ2V0XG4gICAgcmV0dXJuIE1hdGguYWJzKHRhcmdldFRpbGUueCAtIHRpbGUueCkgKyBNYXRoLmFicyh0YXJnZXRUaWxlLnkgLSB0aWxlLnkpID09PSAxXG4gIH1cblxuICBoYXNMaW5lT2ZTaWdodCAodGlsZSwgdGFyZ2V0KSB7XG4gICAgdmFyIGxvcywgdGFyZ2V0VGlsZVxuICAgIHRhcmdldFRpbGUgPSB0YXJnZXQudGlsZSB8fCB0YXJnZXRcbiAgICBsb3MgPSBuZXcgTGluZU9mU2lnaHQodGFyZ2V0VGlsZS5jb250YWluZXIsIHRpbGUueCArIDAuNSwgdGlsZS55ICsgMC41LCB0YXJnZXRUaWxlLnggKyAwLjUsIHRhcmdldFRpbGUueSArIDAuNSlcbiAgICBsb3MudHJhdmVyc2FibGVDYWxsYmFjayA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICByZXR1cm4gdGlsZS53YWxrYWJsZVxuICAgIH1cbiAgICByZXR1cm4gbG9zLmdldFN1Y2Nlc3MoKVxuICB9XG5cbiAgdXNlT24gKHRhcmdldCkge1xuICAgIGlmICh0aGlzLmNhbkJlVXNlZCgpKSB7XG4gICAgICB0YXJnZXQuZGFtYWdlKHRoaXMucG93ZXIpXG4gICAgICB0aGlzLmNoYXJnZWQgPSBmYWxzZVxuICAgICAgcmV0dXJuIHRoaXMucmVjaGFyZ2UoKVxuICAgIH1cbiAgfVxuXG4gIHJlY2hhcmdlICgpIHtcbiAgICB0aGlzLmNoYXJnaW5nID0gdHJ1ZVxuICAgIHRoaXMuY2hhcmdlVGltZW91dCA9IHRoaXMudGltaW5nLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5jaGFyZ2luZyA9IGZhbHNlXG4gICAgICByZXR1cm4gdGhpcy5yZWNoYXJnZWQoKVxuICAgIH0sIHRoaXMucmVjaGFyZ2VUaW1lKVxuICB9XG5cbiAgcmVjaGFyZ2VkICgpIHtcbiAgICB0aGlzLmNoYXJnZWQgPSB0cnVlXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5jaGFyZ2VUaW1lb3V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFyZ2VUaW1lb3V0LmRlc3Ryb3koKVxuICAgIH1cbiAgfVxufTtcblxuUGVyc29uYWxXZWFwb24ucHJvcGVydGllcyh7XG4gIHJlY2hhcmdlVGltZToge1xuICAgIGRlZmF1bHQ6IDEwMDBcbiAgfSxcbiAgY2hhcmdlZDoge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgY2hhcmdpbmc6IHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgZHBzOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMucG93ZXJQcm9wZXJ0eSkgLyBpbnZhbGlkYXRvci5wcm9wKHRoaXMucmVjaGFyZ2VUaW1lUHJvcGVydHkpICogMTAwMFxuICAgIH1cbiAgfSxcbiAgcmFuZ2U6IHtcbiAgICBkZWZhdWx0OiAxMFxuICB9LFxuICB1c2VyOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUGVyc29uYWxXZWFwb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgc2V0RGVmYXVsdHMgKCkge1xuICAgIHZhciBmaXJzdFxuICAgIGZpcnN0ID0gdGhpcy5nYW1lLnBsYXllcnMubGVuZ3RoID09PSAwXG4gICAgdGhpcy5nYW1lLnBsYXllcnMuYWRkKHRoaXMpXG4gICAgaWYgKGZpcnN0ICYmICF0aGlzLmNvbnRyb2xsZXIgJiYgdGhpcy5nYW1lLmRlZmF1bHRQbGF5ZXJDb250cm9sbGVyQ2xhc3MpIHtcbiAgICAgIGNvbnN0IFBsYXllckNvbnRyb2xsZXJDbGFzcyA9IHRoaXMuZ2FtZS5kZWZhdWx0UGxheWVyQ29udHJvbGxlckNsYXNzXG4gICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgUGxheWVyQ29udHJvbGxlckNsYXNzKClcbiAgICB9XG4gIH1cblxuICBjYW5UYXJnZXRBY3Rpb25PbiAoZWxlbSkge1xuICAgIHZhciBhY3Rpb24sIHJlZlxuICAgIGFjdGlvbiA9IHRoaXMuc2VsZWN0ZWRBY3Rpb24gfHwgKChyZWYgPSB0aGlzLnNlbGVjdGVkKSAhPSBudWxsID8gcmVmLmRlZmF1bHRBY3Rpb24gOiBudWxsKVxuICAgIHJldHVybiAoYWN0aW9uICE9IG51bGwpICYmIHR5cGVvZiBhY3Rpb24uY2FuVGFyZ2V0ID09PSAnZnVuY3Rpb24nICYmIGFjdGlvbi5jYW5UYXJnZXQoZWxlbSlcbiAgfVxuXG4gIGd1ZXNzQWN0aW9uVGFyZ2V0IChhY3Rpb24pIHtcbiAgICB2YXIgc2VsZWN0ZWRcbiAgICBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWRcbiAgICBpZiAodHlwZW9mIGFjdGlvbi5jYW5UYXJnZXQgPT09ICdmdW5jdGlvbicgJiYgKGFjdGlvbi50YXJnZXQgPT0gbnVsbCkgJiYgYWN0aW9uLmFjdG9yICE9PSBzZWxlY3RlZCAmJiBhY3Rpb24uY2FuVGFyZ2V0KHNlbGVjdGVkKSkge1xuICAgICAgcmV0dXJuIGFjdGlvbi53aXRoVGFyZ2V0KHNlbGVjdGVkKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYWN0aW9uXG4gICAgfVxuICB9XG5cbiAgY2FuU2VsZWN0IChlbGVtKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlbGVtLmlzU2VsZWN0YWJsZUJ5ID09PSAnZnVuY3Rpb24nICYmIGVsZW0uaXNTZWxlY3RhYmxlQnkodGhpcylcbiAgfVxuXG4gIGNhbkZvY3VzT24gKGVsZW0pIHtcbiAgICBpZiAodHlwZW9mIGVsZW0uSXNGb2N1c2FibGVCeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGVsZW0uSXNGb2N1c2FibGVCeSh0aGlzKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0uSXNTZWxlY3RhYmxlQnkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBlbGVtLklzU2VsZWN0YWJsZUJ5KHRoaXMpXG4gICAgfVxuICB9XG5cbiAgc2VsZWN0QWN0aW9uIChhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLmlzUmVhZHkoKSkge1xuICAgICAgYWN0aW9uLnN0YXJ0KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZWxlY3RlZEFjdGlvbiA9IGFjdGlvblxuICAgIH1cbiAgfVxuXG4gIHNldEFjdGlvblRhcmdldCAoZWxlbSkge1xuICAgIHZhciBhY3Rpb25cbiAgICBhY3Rpb24gPSB0aGlzLnNlbGVjdGVkQWN0aW9uIHx8ICh0aGlzLnNlbGVjdGVkICE9IG51bGwgPyB0aGlzLnNlbGVjdGVkLmRlZmF1bHRBY3Rpb24gOiBudWxsKVxuICAgIGFjdGlvbiA9IGFjdGlvbi53aXRoVGFyZ2V0KGVsZW0pXG4gICAgaWYgKGFjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgIGFjdGlvbi5zdGFydCgpXG4gICAgICB0aGlzLnNlbGVjdGVkQWN0aW9uID0gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGVkQWN0aW9uID0gYWN0aW9uXG4gICAgfVxuICB9XG59O1xuXG5QbGF5ZXIucHJvcGVydGllcyh7XG4gIG5hbWU6IHtcbiAgICBkZWZhdWx0OiAnUGxheWVyJ1xuICB9LFxuICBmb2N1c2VkOiB7fSxcbiAgc2VsZWN0ZWQ6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKG9sZCAhPSBudWxsICYmIG9sZC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsICYmIG9sZC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eSgnc2VsZWN0ZWQnKSkge1xuICAgICAgICBvbGQuc2VsZWN0ZWQgPSBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKHZhbCAhPSBudWxsICYmIHZhbC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsICYmIHZhbC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eSgnc2VsZWN0ZWQnKSkge1xuICAgICAgICB2YWwuc2VsZWN0ZWQgPSB0aGlzXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBnbG9iYWxBY3Rpb25Qcm92aWRlcnM6IHtcbiAgICBjb2xsZWN0aW9uOiB0cnVlXG4gIH0sXG4gIGFjdGlvblByb3ZpZGVyczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgcmVzLCBzZWxlY3RlZFxuICAgICAgcmVzID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLmdsb2JhbEFjdGlvblByb3ZpZGVyc1Byb3BlcnR5KS50b0FycmF5KClcbiAgICAgIHNlbGVjdGVkID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnNlbGVjdGVkUHJvcGVydHkpXG4gICAgICBpZiAoc2VsZWN0ZWQgJiYgc2VsZWN0ZWQuYWN0aW9uUHJvdmlkZXIpIHtcbiAgICAgICAgcmVzLnB1c2goc2VsZWN0ZWQuYWN0aW9uUHJvdmlkZXIpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICB9LFxuICBhdmFpbGFibGVBY3Rpb25zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKHRoaXMuYWN0aW9uUHJvdmlkZXJzUHJvcGVydHkpLnJlZHVjZSgocmVzLCBwcm92aWRlcikgPT4ge1xuICAgICAgICB2YXIgYWN0aW9ucywgc2VsZWN0ZWRcbiAgICAgICAgYWN0aW9ucyA9IGludmFsaWRhdG9yLnByb3AocHJvdmlkZXIuYWN0aW9uc1Byb3BlcnR5KS50b0FycmF5KClcbiAgICAgICAgc2VsZWN0ZWQgPSBpbnZhbGlkYXRvci5wcm9wKHRoaXMuc2VsZWN0ZWRQcm9wZXJ0eSlcbiAgICAgICAgaWYgKHNlbGVjdGVkICE9IG51bGwpIHtcbiAgICAgICAgICBhY3Rpb25zID0gYWN0aW9ucy5tYXAoKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ3Vlc3NBY3Rpb25UYXJnZXQoYWN0aW9uKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLmNvbmNhdChhY3Rpb25zKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXNcbiAgICAgICAgfVxuICAgICAgfSwgW10pXG4gICAgfVxuICB9LFxuICBzZWxlY3RlZEFjdGlvbjoge30sXG4gIGNvbnRyb2xsZXI6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKHRoaXMuY29udHJvbGxlcikge1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIucGxheWVyID0gdGhpc1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZ2FtZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkKSB7XG4gICAgICBpZiAodGhpcy5nYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldERlZmF1bHRzKClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFRpbWluZyA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGltaW5nJylcblxuY2xhc3MgUHJvamVjdGlsZSBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpXG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGluaXQgKCkge31cblxuICBsYXVuY2ggKCkge1xuICAgIHRoaXMubW92aW5nID0gdHJ1ZVxuICAgIHRoaXMucGF0aFRpbWVvdXQgPSB0aGlzLnRpbWluZy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuZGVsaXZlclBheWxvYWQoKVxuICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZVxuICAgIH0sIHRoaXMucGF0aExlbmd0aCAvIHRoaXMuc3BlZWQgKiAxMDAwKVxuICB9XG5cbiAgZGVsaXZlclBheWxvYWQgKCkge1xuICAgIGNvbnN0IFByb3BhZ2F0aW9uVHlwZSA9IHRoaXMucHJvcGFnYXRpb25UeXBlXG4gICAgY29uc3QgcGF5bG9hZCA9IG5ldyBQcm9wYWdhdGlvblR5cGUoe1xuICAgICAgdGlsZTogdGhpcy50YXJnZXQudGlsZSB8fCB0aGlzLnRhcmdldCxcbiAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgcmFuZ2U6IHRoaXMuYmxhc3RSYW5nZVxuICAgIH0pXG4gICAgcGF5bG9hZC5hcHBseSgpXG4gICAgdGhpcy5wYXlsb2FkRGVsaXZlcmVkKClcbiAgICByZXR1cm4gcGF5bG9hZFxuICB9XG5cbiAgcGF5bG9hZERlbGl2ZXJlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVzdHJveSgpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5kZXN0cm95KClcbiAgfVxufTtcblxuUHJvamVjdGlsZS5wcm9wZXJ0aWVzKHtcbiAgb3JpZ2luOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICB0YXJnZXQ6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgYmxhc3RSYW5nZToge1xuICAgIGRlZmF1bHQ6IDFcbiAgfSxcbiAgcHJvcGFnYXRpb25UeXBlOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBzcGVlZDoge1xuICAgIGRlZmF1bHQ6IDEwXG4gIH0sXG4gIHBhdGhMZW5ndGg6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkaXN0XG4gICAgICBpZiAoKHRoaXMub3JpZ2luVGlsZSAhPSBudWxsKSAmJiAodGhpcy50YXJnZXRUaWxlICE9IG51bGwpKSB7XG4gICAgICAgIGRpc3QgPSB0aGlzLm9yaWdpblRpbGUuZGlzdCh0aGlzLnRhcmdldFRpbGUpXG4gICAgICAgIGlmIChkaXN0KSB7XG4gICAgICAgICAgcmV0dXJuIGRpc3QubGVuZ3RoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAxMDBcbiAgICB9XG4gIH0sXG4gIG9yaWdpblRpbGU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgdmFyIG9yaWdpblxuICAgICAgb3JpZ2luID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLm9yaWdpblByb3BlcnR5KVxuICAgICAgaWYgKG9yaWdpbiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW4udGlsZSB8fCBvcmlnaW5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHRhcmdldFRpbGU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRvcikge1xuICAgICAgdmFyIHRhcmdldFxuICAgICAgdGFyZ2V0ID0gaW52YWxpZGF0b3IucHJvcCh0aGlzLnRhcmdldFByb3BlcnR5KVxuICAgICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQudGlsZSB8fCB0YXJnZXRcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGNvbnRhaW5lcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdGUpIHtcbiAgICAgIHZhciBvcmlnaW5UaWxlLCB0YXJnZXRUaWxlXG4gICAgICBvcmlnaW5UaWxlID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMub3JpZ2luVGlsZVByb3BlcnR5KVxuICAgICAgdGFyZ2V0VGlsZSA9IGludmFsaWRhdGUucHJvcCh0aGlzLnRhcmdldFRpbGVQcm9wZXJ0eSlcbiAgICAgIGlmIChvcmlnaW5UaWxlLmNvbnRhaW5lciA9PT0gdGFyZ2V0VGlsZS5jb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpblRpbGUuY29udGFpbmVyXG4gICAgICB9IGVsc2UgaWYgKGludmFsaWRhdGUucHJvcCh0aGlzLnByY1BhdGhQcm9wZXJ0eSkgPiAwLjUpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFRpbGUuY29udGFpbmVyXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb3JpZ2luVGlsZS5jb250YWluZXJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHg6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgc3RhcnRQb3NcbiAgICAgIHN0YXJ0UG9zID0gaW52YWxpZGF0ZS5wcm9wKHRoaXMuc3RhcnRQb3NQcm9wZXJ0eSlcbiAgICAgIHJldHVybiAoaW52YWxpZGF0ZS5wcm9wKHRoaXMudGFyZ2V0UG9zUHJvcGVydHkpLnggLSBzdGFydFBvcy54KSAqIGludmFsaWRhdGUucHJvcCh0aGlzLnByY1BhdGhQcm9wZXJ0eSkgKyBzdGFydFBvcy54XG4gICAgfVxuICB9LFxuICB5OiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0ZSkge1xuICAgICAgdmFyIHN0YXJ0UG9zXG4gICAgICBzdGFydFBvcyA9IGludmFsaWRhdGUucHJvcCh0aGlzLnN0YXJ0UG9zUHJvcGVydHkpXG4gICAgICByZXR1cm4gKGludmFsaWRhdGUucHJvcCh0aGlzLnRhcmdldFBvc1Byb3BlcnR5KS55IC0gc3RhcnRQb3MueSkgKiBpbnZhbGlkYXRlLnByb3AodGhpcy5wcmNQYXRoUHJvcGVydHkpICsgc3RhcnRQb3MueVxuICAgIH1cbiAgfSxcbiAgc3RhcnRQb3M6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgY29udGFpbmVyLCBkaXN0LCBvZmZzZXQsIG9yaWdpblRpbGVcbiAgICAgIG9yaWdpblRpbGUgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5vcmlnaW5UaWxlUHJvcGVydHkpXG4gICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5jb250YWluZXJQcm9wZXJ0eSlcbiAgICAgIG9mZnNldCA9IHRoaXMuc3RhcnRPZmZzZXRcbiAgICAgIGlmIChvcmlnaW5UaWxlLmNvbnRhaW5lciAhPT0gY29udGFpbmVyKSB7XG4gICAgICAgIGRpc3QgPSBjb250YWluZXIuZGlzdChvcmlnaW5UaWxlLmNvbnRhaW5lcilcbiAgICAgICAgb2Zmc2V0LnggKz0gZGlzdC54XG4gICAgICAgIG9mZnNldC55ICs9IGRpc3QueVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogb3JpZ2luVGlsZS54ICsgb2Zmc2V0LngsXG4gICAgICAgIHk6IG9yaWdpblRpbGUueSArIG9mZnNldC55XG4gICAgICB9XG4gICAgfSxcbiAgICBvdXRwdXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpXG4gICAgfVxuICB9LFxuICB0YXJnZXRQb3M6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uIChpbnZhbGlkYXRlKSB7XG4gICAgICB2YXIgY29udGFpbmVyLCBkaXN0LCBvZmZzZXQsIHRhcmdldFRpbGVcbiAgICAgIHRhcmdldFRpbGUgPSBpbnZhbGlkYXRlLnByb3AodGhpcy50YXJnZXRUaWxlUHJvcGVydHkpXG4gICAgICBjb250YWluZXIgPSBpbnZhbGlkYXRlLnByb3AodGhpcy5jb250YWluZXJQcm9wZXJ0eSlcbiAgICAgIG9mZnNldCA9IHRoaXMudGFyZ2V0T2Zmc2V0XG4gICAgICBpZiAodGFyZ2V0VGlsZS5jb250YWluZXIgIT09IGNvbnRhaW5lcikge1xuICAgICAgICBkaXN0ID0gY29udGFpbmVyLmRpc3QodGFyZ2V0VGlsZS5jb250YWluZXIpXG4gICAgICAgIG9mZnNldC54ICs9IGRpc3QueFxuICAgICAgICBvZmZzZXQueSArPSBkaXN0LnlcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRhcmdldFRpbGUueCArIG9mZnNldC54LFxuICAgICAgICB5OiB0YXJnZXRUaWxlLnkgKyBvZmZzZXQueVxuICAgICAgfVxuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfSxcbiAgc3RhcnRPZmZzZXQ6IHtcbiAgICBkZWZhdWx0OiB7XG4gICAgICB4OiAwLjUsXG4gICAgICB5OiAwLjVcbiAgICB9LFxuICAgIG91dHB1dDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbClcbiAgICB9XG4gIH0sXG4gIHRhcmdldE9mZnNldDoge1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHg6IDAuNSxcbiAgICAgIHk6IDAuNVxuICAgIH0sXG4gICAgb3V0cHV0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdmFsKVxuICAgIH1cbiAgfSxcbiAgcHJjUGF0aDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlZlxuICAgICAgcmV0dXJuICgocmVmID0gdGhpcy5wYXRoVGltZW91dCkgIT0gbnVsbCA/IHJlZi5wcmMgOiBudWxsKSB8fCAwXG4gICAgfVxuICB9LFxuICB0aW1pbmc6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVGltaW5nKClcbiAgICB9XG4gIH0sXG4gIG1vdmluZzoge1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdGlsZVxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5cbmNsYXNzIFJlc3NvdXJjZSBleHRlbmRzIEVsZW1lbnQge1xuICBwYXJ0aWFsQ2hhbmdlIChxdGUpIHtcbiAgICB2YXIgYWNjZXB0YWJsZVxuICAgIGFjY2VwdGFibGUgPSBNYXRoLm1heCh0aGlzLm1pblF0ZSwgTWF0aC5taW4odGhpcy5tYXhRdGUsIHF0ZSkpXG4gICAgdGhpcy5xdGUgPSBhY2NlcHRhYmxlXG4gICAgcmV0dXJuIHF0ZSAtIGFjY2VwdGFibGVcbiAgfVxufTtcblxuUmVzc291cmNlLnByb3BlcnRpZXMoe1xuICB0eXBlOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBxdGU6IHtcbiAgICBkZWZhdWx0OiAwLFxuICAgIGluZ2VzdDogZnVuY3Rpb24gKHF0ZSkge1xuICAgICAgaWYgKHRoaXMubWF4UXRlICE9PSBudWxsICYmIHF0ZSA+IHRoaXMubWF4UXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudCBoYXZlIG1vcmUgdGhhbiAnICsgdGhpcy5tYXhRdGUgKyAnIG9mICcgKyB0aGlzLnR5cGUubmFtZSlcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm1pblF0ZSAhPT0gbnVsbCAmJiBxdGUgPCB0aGlzLm1pblF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgaGF2ZSBsZXNzIHRoYW4gJyArIHRoaXMubWluUXRlICsgJyBvZiAnICsgdGhpcy50eXBlLm5hbWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gcXRlXG4gICAgfVxuICB9LFxuICBtYXhRdGU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIG1pblF0ZToge1xuICAgIGRlZmF1bHQ6IDBcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNzb3VyY2VcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgUmVzc291cmNlID0gcmVxdWlyZSgnLi9SZXNzb3VyY2UnKVxuXG5jbGFzcyBSZXNzb3VyY2VUeXBlIGV4dGVuZHMgRWxlbWVudCB7XG4gIGluaXRSZXNzb3VyY2UgKG9wdCkge1xuICAgIGlmICh0eXBlb2Ygb3B0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgb3B0ID0ge1xuICAgICAgICBxdGU6IG9wdFxuICAgICAgfVxuICAgIH1cbiAgICBvcHQgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHQpXG4gICAgY29uc3QgUmVzc291cmNlQ2xhc3MgPSB0aGlzLnJlc3NvdXJjZUNsYXNzXG4gICAgcmV0dXJuIG5ldyBSZXNzb3VyY2VDbGFzcyhvcHQpXG4gIH1cbn07XG5cblJlc3NvdXJjZVR5cGUucHJvcGVydGllcyh7XG4gIG5hbWU6IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHJlc3NvdXJjZUNsYXNzOiB7XG4gICAgZGVmYXVsdDogUmVzc291cmNlXG4gIH0sXG4gIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgZGVmYXVsdDoge31cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNzb3VyY2VUeXBlXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFRyYXZlbCA9IHJlcXVpcmUoJy4vVHJhdmVsJylcbmNvbnN0IFRyYXZlbEFjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9UcmF2ZWxBY3Rpb24nKVxuY29uc3QgQWN0aW9uUHJvdmlkZXIgPSByZXF1aXJlKCcuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXInKVxuY29uc3QgU2hpcEludGVyaW9yID0gcmVxdWlyZSgnLi9TaGlwSW50ZXJpb3InKVxuXG5jbGFzcyBTaGlwIGV4dGVuZHMgRWxlbWVudCB7XG4gIHRyYXZlbFRvIChsb2NhdGlvbikge1xuICAgIHZhciB0cmF2ZWxcbiAgICB0cmF2ZWwgPSBuZXcgVHJhdmVsKHtcbiAgICAgIHRyYXZlbGxlcjogdGhpcyxcbiAgICAgIHN0YXJ0TG9jYXRpb246IHRoaXMubG9jYXRpb24sXG4gICAgICB0YXJnZXRMb2NhdGlvbjogbG9jYXRpb25cbiAgICB9KVxuICAgIGlmICh0cmF2ZWwudmFsaWQpIHtcbiAgICAgIHRyYXZlbC5zdGFydCgpXG4gICAgICB0aGlzLnRyYXZlbCA9IHRyYXZlbFxuICAgIH1cbiAgfVxufTtcblxuU2hpcC5wcm9wZXJ0aWVzKHtcbiAgbG9jYXRpb246IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIHRyYXZlbDoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgaW50ZXJyaW9yOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFNoaXBJbnRlcmlvcih7IHNoaXA6IHRoaXMgfSlcbiAgICB9XG4gIH0sXG4gIGFjdGlvblByb3ZpZGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBwcm92aWRlciA9IG5ldyBBY3Rpb25Qcm92aWRlcih7XG4gICAgICAgIG93bmVyOiB0aGlzXG4gICAgICB9KVxuICAgICAgcHJvdmlkZXIuYWN0aW9uc01lbWJlcnMuYWRkKG5ldyBUcmF2ZWxBY3Rpb24oe1xuICAgICAgICBhY3RvcjogdGhpc1xuICAgICAgfSkpXG4gICAgICByZXR1cm4gcHJvdmlkZXJcbiAgICB9XG4gIH0sXG4gIHNwYWNlQ29vZGluYXRlOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIGlmIChpbnZhbGlkYXRvci5wcm9wKHRoaXMudHJhdmVsUHJvcGVydHkpKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wUGF0aCgndHJhdmVsLnNwYWNlQ29vZGluYXRlJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogaW52YWxpZGF0b3IucHJvcFBhdGgoJ2xvY2F0aW9uLngnKSxcbiAgICAgICAgICB5OiBpbnZhbGlkYXRvci5wcm9wUGF0aCgnbG9jYXRpb24ueScpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFxuIiwiY29uc3QgVGlsZUNvbnRhaW5lciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlQ29udGFpbmVyXG5jb25zdCBTaGlwSW50ZXJpb3JHZW5lcmF0b3IgPSByZXF1aXJlKCcuL2dlbmVyYXRvcnMvU2hpcEludGVyaW9yR2VuZXJhdG9yJylcblxuY2xhc3MgU2hpcEludGVyaW9yIGV4dGVuZHMgVGlsZUNvbnRhaW5lciB7XG4gIHNldERlZmF1bHRzICgpIHtcbiAgICBpZiAoISh0aGlzLnRpbGVzLmxlbmd0aCA+IDApKSB7XG4gICAgICB0aGlzLmdlbmVyYXRlKClcbiAgICB9XG4gICAgaWYgKHRoaXMuZ2FtZS5tYWluVGlsZUNvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmdhbWUubWFpblRpbGVDb250YWluZXIgPSB0aGlzXG4gICAgfVxuICB9XG5cbiAgZ2VuZXJhdGUgKGdlbmVyYXRvcikge1xuICAgIGdlbmVyYXRvciA9IGdlbmVyYXRvciB8fCBuZXcgU2hpcEludGVyaW9yR2VuZXJhdG9yKClcbiAgICBnZW5lcmF0b3Iuc2hpcEludGVyaW9yID0gdGhpc1xuICAgIGdlbmVyYXRvci5nZW5lcmF0ZSgpXG4gIH1cbn1cblxuU2hpcEludGVyaW9yLnByb3BlcnRpZXMoe1xuICB4OiB7XG4gICAgY29tcG9zZWQ6IHRydWUsXG4gICAgZGVmYXVsdDogMFxuICB9LFxuICB5OiB7XG4gICAgY29tcG9zZWQ6IHRydWUsXG4gICAgZGVmYXVsdDogMFxuICB9LFxuICBjb250YWluZXI6IHt9LFxuICBzaGlwOiB7fSxcbiAgZ2FtZToge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKHZhbCwgb2xkKSB7XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldERlZmF1bHRzKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGFpcmxvY2tzOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmFsbFRpbGVzKCkuZmlsdGVyKCh0KSA9PiB0eXBlb2YgdC5hdHRhY2hUbyA9PT0gJ2Z1bmN0aW9uJylcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcEludGVyaW9yXG4iLCJjb25zdCBUaWxlZCA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlZFxuY29uc3QgVGltaW5nID0gcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKVxuY29uc3QgRGFtYWdlYWJsZSA9IHJlcXVpcmUoJy4vRGFtYWdlYWJsZScpXG5jb25zdCBQcm9qZWN0aWxlID0gcmVxdWlyZSgnLi9Qcm9qZWN0aWxlJylcblxuY2xhc3MgU2hpcFdlYXBvbiBleHRlbmRzIFRpbGVkIHtcbiAgZmlyZSAoKSB7XG4gICAgdmFyIHByb2plY3RpbGVcbiAgICBpZiAodGhpcy5jYW5GaXJlKSB7XG4gICAgICBjb25zdCBQcm9qZWN0aWxlQ2xhc3MgPSB0aGlzLnByb2plY3RpbGVDbGFzc1xuICAgICAgcHJvamVjdGlsZSA9IG5ldyBQcm9qZWN0aWxlQ2xhc3Moe1xuICAgICAgICBvcmlnaW46IHRoaXMsXG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIHBvd2VyOiB0aGlzLnBvd2VyLFxuICAgICAgICBibGFzdFJhbmdlOiB0aGlzLmJsYXN0UmFuZ2UsXG4gICAgICAgIHByb3BhZ2F0aW9uVHlwZTogdGhpcy5wcm9wYWdhdGlvblR5cGUsXG4gICAgICAgIHNwZWVkOiB0aGlzLnByb2plY3RpbGVTcGVlZCxcbiAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgfSlcbiAgICAgIHByb2plY3RpbGUubGF1bmNoKClcbiAgICAgIHRoaXMuY2hhcmdlZCA9IGZhbHNlXG4gICAgICB0aGlzLnJlY2hhcmdlKClcbiAgICAgIHJldHVybiBwcm9qZWN0aWxlXG4gICAgfVxuICB9XG5cbiAgcmVjaGFyZ2UgKCkge1xuICAgIHRoaXMuY2hhcmdpbmcgPSB0cnVlXG4gICAgdGhpcy5jaGFyZ2VUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmNoYXJnaW5nID0gZmFsc2VcbiAgICAgIHJldHVybiB0aGlzLnJlY2hhcmdlZCgpXG4gICAgfSwgdGhpcy5yZWNoYXJnZVRpbWUpXG4gIH1cblxuICByZWNoYXJnZWQgKCkge1xuICAgIHRoaXMuY2hhcmdlZCA9IHRydWVcbiAgICBpZiAodGhpcy5hdXRvRmlyZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlyZSgpXG4gICAgfVxuICB9XG59O1xuXG5TaGlwV2VhcG9uLmV4dGVuZChEYW1hZ2VhYmxlKVxuXG5TaGlwV2VhcG9uLnByb3BlcnRpZXMoe1xuICByZWNoYXJnZVRpbWU6IHtcbiAgICBkZWZhdWx0OiAxMDAwXG4gIH0sXG4gIHBvd2VyOiB7XG4gICAgZGVmYXVsdDogMTBcbiAgfSxcbiAgYmxhc3RSYW5nZToge1xuICAgIGRlZmF1bHQ6IDFcbiAgfSxcbiAgcHJvcGFnYXRpb25UeXBlOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9LFxuICBwcm9qZWN0aWxlU3BlZWQ6IHtcbiAgICBkZWZhdWx0OiAxMFxuICB9LFxuICB0YXJnZXQ6IHtcbiAgICBkZWZhdWx0OiBudWxsLFxuICAgIGNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYXV0b0ZpcmUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyZSgpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBjaGFyZ2VkOiB7XG4gICAgZGVmYXVsdDogdHJ1ZVxuICB9LFxuICBjaGFyZ2luZzoge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgZW5hYmxlZDoge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgYXV0b0ZpcmU6IHtcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG4gIGNyaXRpY2FsSGVhbHRoOiB7XG4gICAgZGVmYXVsdDogMC4zXG4gIH0sXG4gIGNhbkZpcmU6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldCAmJiB0aGlzLmVuYWJsZWQgJiYgdGhpcy5jaGFyZ2VkICYmIHRoaXMuaGVhbHRoIC8gdGhpcy5tYXhIZWFsdGggPj0gdGhpcy5jcml0aWNhbEhlYWx0aFxuICAgIH1cbiAgfSxcbiAgdGltaW5nOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgfVxuICB9LFxuICBwcm9qZWN0aWxlQ2xhc3M6IHtcbiAgICBkZWZhdWx0OiBQcm9qZWN0aWxlXG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFdlYXBvblxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5cbmNsYXNzIFN0YXJTeXN0ZW0gZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IgKGRhdGEpIHtcbiAgICBzdXBlcihkYXRhKVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBpbml0ICgpIHt9XG5cbiAgbGlua1RvIChzdGFyKSB7XG4gICAgaWYgKCF0aGlzLmxpbmtzLmZpbmRTdGFyKHN0YXIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRMaW5rKG5ldyB0aGlzLmNvbnN0cnVjdG9yLkxpbmsodGhpcywgc3RhcikpXG4gICAgfVxuICB9XG5cbiAgYWRkTGluayAobGluaykge1xuICAgIHRoaXMubGlua3MuYWRkKGxpbmspXG4gICAgbGluay5vdGhlclN0YXIodGhpcykubGlua3MuYWRkKGxpbmspXG4gICAgcmV0dXJuIGxpbmtcbiAgfVxuXG4gIGRpc3QgKHgsIHkpIHtcbiAgICB2YXIgeERpc3QsIHlEaXN0XG4gICAgeERpc3QgPSB0aGlzLnggLSB4XG4gICAgeURpc3QgPSB0aGlzLnkgLSB5XG4gICAgcmV0dXJuIE1hdGguc3FydCgoeERpc3QgKiB4RGlzdCkgKyAoeURpc3QgKiB5RGlzdCkpXG4gIH1cblxuICBpc1NlbGVjdGFibGVCeSAocGxheWVyKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufTtcblxuU3RhclN5c3RlbS5wcm9wZXJ0aWVzKHtcbiAgeDoge30sXG4gIHk6IHt9LFxuICBuYW1lOiB7fSxcbiAgbGlua3M6IHtcbiAgICBjb2xsZWN0aW9uOiB7XG4gICAgICBmaW5kU3RhcjogZnVuY3Rpb24gKHN0YXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZChmdW5jdGlvbiAobGluaykge1xuICAgICAgICAgIHJldHVybiBsaW5rLnN0YXIyID09PSBzdGFyIHx8IGxpbmsuc3RhcjEgPT09IHN0YXJcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cblN0YXJTeXN0ZW0uY29sbGVuY3Rpb25GbiA9IHtcbiAgY2xvc2VzdDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB2YXIgbWluLCBtaW5EaXN0XG4gICAgbWluID0gbnVsbFxuICAgIG1pbkRpc3QgPSBudWxsXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGFyKSB7XG4gICAgICB2YXIgZGlzdFxuICAgICAgZGlzdCA9IHN0YXIuZGlzdCh4LCB5KVxuICAgICAgaWYgKChtaW4gPT0gbnVsbCkgfHwgbWluRGlzdCA+IGRpc3QpIHtcbiAgICAgICAgbWluID0gc3RhclxuICAgICAgICBtaW5EaXN0ID0gZGlzdFxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG1pblxuICB9LFxuICBjbG9zZXN0czogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB2YXIgZGlzdHNcbiAgICBkaXN0cyA9IHRoaXMubWFwKGZ1bmN0aW9uIChzdGFyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXN0OiBzdGFyLmRpc3QoeCwgeSksXG4gICAgICAgIHN0YXI6IHN0YXJcbiAgICAgIH1cbiAgICB9KVxuICAgIGRpc3RzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmRpc3QgLSBiLmRpc3RcbiAgICB9KVxuICAgIHJldHVybiB0aGlzLmNvcHkoZGlzdHMubWFwKGZ1bmN0aW9uIChkaXN0KSB7XG4gICAgICByZXR1cm4gZGlzdC5zdGFyXG4gICAgfSkpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyU3lzdGVtXG5cblN0YXJTeXN0ZW0uTGluayA9IGNsYXNzIExpbmsgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IgKHN0YXIxLCBzdGFyMikge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnN0YXIxID0gc3RhcjFcbiAgICB0aGlzLnN0YXIyID0gc3RhcjJcbiAgfVxuXG4gIHJlbW92ZSAoKSB7XG4gICAgdGhpcy5zdGFyMS5saW5rcy5yZW1vdmUodGhpcylcbiAgICByZXR1cm4gdGhpcy5zdGFyMi5saW5rcy5yZW1vdmUodGhpcylcbiAgfVxuXG4gIG90aGVyU3RhciAoc3Rhcikge1xuICAgIGlmIChzdGFyID09PSB0aGlzLnN0YXIxKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFyMlxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFyMVxuICAgIH1cbiAgfVxuXG4gIGdldExlbmd0aCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcjEuZGlzdCh0aGlzLnN0YXIyLngsIHRoaXMuc3RhcjIueSlcbiAgfVxuXG4gIGluQm91bmRhcnlCb3ggKHgsIHksIHBhZGRpbmcgPSAwKSB7XG4gICAgdmFyIHgxLCB4MiwgeTEsIHkyXG4gICAgeDEgPSBNYXRoLm1pbih0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgLSBwYWRkaW5nXG4gICAgeTEgPSBNYXRoLm1pbih0aGlzLnN0YXIxLnksIHRoaXMuc3RhcjIueSkgLSBwYWRkaW5nXG4gICAgeDIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLngsIHRoaXMuc3RhcjIueCkgKyBwYWRkaW5nXG4gICAgeTIgPSBNYXRoLm1heCh0aGlzLnN0YXIxLnksIHRoaXMuc3RhcjIueSkgKyBwYWRkaW5nXG4gICAgcmV0dXJuIHggPj0geDEgJiYgeCA8PSB4MiAmJiB5ID49IHkxICYmIHkgPD0geTJcbiAgfVxuXG4gIGNsb3NlVG9Qb2ludCAoeCwgeSwgbWluRGlzdCkge1xuICAgIHZhciBhLCBhYmNBbmdsZSwgYWJ4QW5nbGUsIGFjRGlzdCwgYWN4QW5nbGUsIGIsIGMsIGNkRGlzdCwgeEFiRGlzdCwgeEFjRGlzdCwgeUFiRGlzdCwgeUFjRGlzdFxuICAgIGlmICghdGhpcy5pbkJvdW5kYXJ5Qm94KHgsIHksIG1pbkRpc3QpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgYSA9IHRoaXMuc3RhcjFcbiAgICBiID0gdGhpcy5zdGFyMlxuICAgIGMgPSB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeVxuICAgIH1cbiAgICB4QWJEaXN0ID0gYi54IC0gYS54XG4gICAgeUFiRGlzdCA9IGIueSAtIGEueVxuICAgIGFieEFuZ2xlID0gTWF0aC5hdGFuKHlBYkRpc3QgLyB4QWJEaXN0KVxuICAgIHhBY0Rpc3QgPSBjLnggLSBhLnhcbiAgICB5QWNEaXN0ID0gYy55IC0gYS55XG4gICAgYWNEaXN0ID0gTWF0aC5zcXJ0KCh4QWNEaXN0ICogeEFjRGlzdCkgKyAoeUFjRGlzdCAqIHlBY0Rpc3QpKVxuICAgIGFjeEFuZ2xlID0gTWF0aC5hdGFuKHlBY0Rpc3QgLyB4QWNEaXN0KVxuICAgIGFiY0FuZ2xlID0gYWJ4QW5nbGUgLSBhY3hBbmdsZVxuICAgIGNkRGlzdCA9IE1hdGguYWJzKE1hdGguc2luKGFiY0FuZ2xlKSAqIGFjRGlzdClcbiAgICByZXR1cm4gY2REaXN0IDw9IG1pbkRpc3RcbiAgfVxuXG4gIGludGVyc2VjdExpbmsgKGxpbmspIHtcbiAgICB2YXIgcywgczF4LCBzMXksIHMyeCwgczJ5LCB0LCB4MSwgeDIsIHgzLCB4NCwgeTEsIHkyLCB5MywgeTRcbiAgICB4MSA9IHRoaXMuc3RhcjEueFxuICAgIHkxID0gdGhpcy5zdGFyMS55XG4gICAgeDIgPSB0aGlzLnN0YXIyLnhcbiAgICB5MiA9IHRoaXMuc3RhcjIueVxuICAgIHgzID0gbGluay5zdGFyMS54XG4gICAgeTMgPSBsaW5rLnN0YXIxLnlcbiAgICB4NCA9IGxpbmsuc3RhcjIueFxuICAgIHk0ID0gbGluay5zdGFyMi55XG4gICAgczF4ID0geDIgLSB4MVxuICAgIHMxeSA9IHkyIC0geTFcbiAgICBzMnggPSB4NCAtIHgzXG4gICAgczJ5ID0geTQgLSB5M1xuICAgIHMgPSAoLXMxeSAqICh4MSAtIHgzKSArIHMxeCAqICh5MSAtIHkzKSkgLyAoLXMyeCAqIHMxeSArIHMxeCAqIHMyeSlcbiAgICB0ID0gKHMyeCAqICh5MSAtIHkzKSAtIHMyeSAqICh4MSAtIHgzKSkgLyAoLXMyeCAqIHMxeSArIHMxeCAqIHMyeSlcbiAgICByZXR1cm4gcyA+IDAgJiYgcyA8IDEgJiYgdCA+IDAgJiYgdCA8IDFcbiAgfVxufVxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaW1pbmcgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbWluZycpXG5cbmNsYXNzIFRyYXZlbCBleHRlbmRzIEVsZW1lbnQge1xuICBzdGFydCAobG9jYXRpb24pIHtcbiAgICBpZiAodGhpcy52YWxpZCkge1xuICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlXG4gICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSB0aGlzXG4gICAgICB0aGlzLnBhdGhUaW1lb3V0ID0gdGhpcy50aW1pbmcuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudHJhdmVsbGVyLmxvY2F0aW9uID0gdGhpcy50YXJnZXRMb2NhdGlvblxuICAgICAgICB0aGlzLnRyYXZlbGxlci50cmF2ZWwgPSBudWxsXG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2VcbiAgICAgIH0sIHRoaXMuZHVyYXRpb24pXG4gICAgfVxuICB9XG59O1xuXG5UcmF2ZWwucHJvcGVydGllcyh7XG4gIHRyYXZlbGxlcjoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgc3RhcnRMb2NhdGlvbjoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgdGFyZ2V0TG9jYXRpb246IHtcbiAgICBkZWZhdWx0OiBudWxsXG4gIH0sXG4gIGN1cnJlbnRTZWN0aW9uOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydExvY2F0aW9uLmxpbmtzLmZpbmRTdGFyKHRoaXMudGFyZ2V0TG9jYXRpb24pXG4gICAgfVxuICB9LFxuICBkdXJhdGlvbjoge1xuICAgIGRlZmF1bHQ6IDEwMDBcbiAgfSxcbiAgbW92aW5nOiB7XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcbiAgdmFsaWQ6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZWYsIHJlZjFcbiAgICAgIGlmICh0aGlzLnRhcmdldExvY2F0aW9uID09PSB0aGlzLnN0YXJ0TG9jYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAoKCgocmVmID0gdGhpcy50YXJnZXRMb2NhdGlvbikgIT0gbnVsbCA/IHJlZi5saW5rcyA6IG51bGwpICE9IG51bGwpICYmICgoKHJlZjEgPSB0aGlzLnN0YXJ0TG9jYXRpb24pICE9IG51bGwgPyByZWYxLmxpbmtzIDogbnVsbCkgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlY3Rpb24gIT0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdGltaW5nOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWluZygpXG4gICAgfVxuICB9LFxuICBzcGFjZUNvb2RpbmF0ZToge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgZW5kWCwgZW5kWSwgcHJjLCBzdGFydFgsIHN0YXJ0WVxuICAgICAgc3RhcnRYID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3N0YXJ0TG9jYXRpb24ueCcpXG4gICAgICBzdGFydFkgPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgnc3RhcnRMb2NhdGlvbi55JylcbiAgICAgIGVuZFggPSBpbnZhbGlkYXRvci5wcm9wUGF0aCgndGFyZ2V0TG9jYXRpb24ueCcpXG4gICAgICBlbmRZID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3RhcmdldExvY2F0aW9uLnknKVxuICAgICAgcHJjID0gaW52YWxpZGF0b3IucHJvcFBhdGgoJ3BhdGhUaW1lb3V0LnByYycpXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiAoc3RhcnRYIC0gZW5kWCkgKiBwcmMgKyBlbmRYLFxuICAgICAgICB5OiAoc3RhcnRZIC0gZW5kWSkgKiBwcmMgKyBlbmRZXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYXZlbFxuIiwiY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBHcmlkID0gcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLkdyaWRcblxuY2xhc3MgVmlldyBleHRlbmRzIEVsZW1lbnQge1xuICBzZXREZWZhdWx0cyAoKSB7XG4gICAgdmFyIHJlZlxuICAgIGlmICghdGhpcy5ib3VuZHMpIHtcbiAgICAgIHRoaXMuZ3JpZCA9IHRoaXMuZ3JpZCB8fCAoKHJlZiA9IHRoaXMuZ2FtZS5tYWluVmlld1Byb3BlcnR5LnZhbHVlKSAhPSBudWxsID8gcmVmLmdyaWQgOiBudWxsKSB8fCBuZXcgR3JpZCgpXG4gICAgICB0aGlzLmJvdW5kcyA9IHRoaXMuZ3JpZC5hZGRDZWxsKClcbiAgICB9XG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmdhbWUgPSBudWxsXG4gIH1cbn07XG5cblZpZXcucHJvcGVydGllcyh7XG4gIGdhbWU6IHtcbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICh2YWwsIG9sZCkge1xuICAgICAgaWYgKHRoaXMuZ2FtZSkge1xuICAgICAgICB0aGlzLmdhbWUudmlld3MuYWRkKHRoaXMpXG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdHMoKVxuICAgICAgfVxuICAgICAgaWYgKG9sZCkge1xuICAgICAgICByZXR1cm4gb2xkLnZpZXdzLnJlbW92ZSh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgeDoge1xuICAgIGRlZmF1bHQ6IDBcbiAgfSxcbiAgeToge1xuICAgIGRlZmF1bHQ6IDBcbiAgfSxcbiAgZ3JpZDoge1xuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSxcbiAgYm91bmRzOiB7XG4gICAgZGVmYXVsdDogbnVsbFxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdcbiIsImNvbnN0IExpbmVPZlNpZ2h0ID0gcmVxdWlyZSgnLi9MaW5lT2ZTaWdodCcpXG5jb25zdCBEaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uXG5jb25zdCBUaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXJcbmNvbnN0IFRpbGVSZWZlcmVuY2UgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVJlZmVyZW5jZVxuXG5jbGFzcyBWaXNpb25DYWxjdWxhdG9yIHtcbiAgY29uc3RydWN0b3IgKG9yaWdpblRpbGUsIG9mZnNldCA9IHtcbiAgICB4OiAwLjUsXG4gICAgeTogMC41XG4gIH0pIHtcbiAgICB0aGlzLm9yaWdpblRpbGUgPSBvcmlnaW5UaWxlXG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXRcbiAgICB0aGlzLnB0cyA9IHt9XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge31cbiAgICB0aGlzLnN0YWNrID0gW11cbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICB0aGlzLmluaXQoKVxuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdGVwKClcbiAgICB9XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZVxuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgdmFyIGZpcnN0QmF0Y2gsIGluaXRpYWxQdHNcbiAgICB0aGlzLnB0cyA9IHt9XG4gICAgdGhpcy52aXNpYmlsaXR5ID0ge31cbiAgICBpbml0aWFsUHRzID0gW3sgeDogMCwgeTogMCB9LCB7IHg6IDEsIHk6IDAgfSwgeyB4OiAwLCB5OiAxIH0sIHsgeDogMSwgeTogMSB9XVxuICAgIGluaXRpYWxQdHMuZm9yRWFjaCgocHQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnNldFB0KHRoaXMub3JpZ2luVGlsZS54ICsgcHQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyBwdC55LCB0cnVlKVxuICAgIH0pXG4gICAgZmlyc3RCYXRjaCA9IFtcbiAgICAgIHsgeDogLTEsIHk6IC0xIH0sIHsgeDogLTEsIHk6IDAgfSwgeyB4OiAtMSwgeTogMSB9LCB7IHg6IC0xLCB5OiAyIH0sXG4gICAgICB7IHg6IDIsIHk6IC0xIH0sIHsgeDogMiwgeTogMCB9LCB7IHg6IDIsIHk6IDEgfSwgeyB4OiAyLCB5OiAyIH0sXG4gICAgICB7IHg6IDAsIHk6IC0xIH0sIHsgeDogMSwgeTogLTEgfSxcbiAgICAgIHsgeDogMCwgeTogMiB9LCB7IHg6IDEsIHk6IDIgfVxuICAgIF1cbiAgICB0aGlzLnN0YWNrID0gZmlyc3RCYXRjaC5tYXAoKHB0KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLm9yaWdpblRpbGUueCArIHB0LngsXG4gICAgICAgIHk6IHRoaXMub3JpZ2luVGlsZS55ICsgcHQueVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBzZXRQdCAoeCwgeSwgdmFsKSB7XG4gICAgdmFyIGFkamFuY2VudFxuICAgIHRoaXMucHRzW3ggKyAnOicgKyB5XSA9IHZhbFxuICAgIGFkamFuY2VudCA9IFtcbiAgICAgIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogLTEsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IC0xXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB4OiAtMSxcbiAgICAgICAgeTogLTFcbiAgICAgIH1cbiAgICBdXG4gICAgcmV0dXJuIGFkamFuY2VudC5mb3JFYWNoKChwdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVmlzaWJpbGl0eSh4ICsgcHQueCwgeSArIHB0LnksIHZhbCA/IDEgLyBhZGphbmNlbnQubGVuZ3RoIDogMClcbiAgICB9KVxuICB9XG5cbiAgZ2V0UHQgKHgsIHkpIHtcbiAgICByZXR1cm4gdGhpcy5wdHNbeCArICc6JyArIHldXG4gIH1cblxuICBhZGRWaXNpYmlsaXR5ICh4LCB5LCB2YWwpIHtcbiAgICBpZiAodGhpcy52aXNpYmlsaXR5W3hdID09IG51bGwpIHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eVt4XSA9IHt9XG4gICAgfVxuICAgIGlmICh0aGlzLnZpc2liaWxpdHlbeF1beV0gIT0gbnVsbCkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5W3hdW3ldICs9IHZhbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlbeF1beV0gPSB2YWxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldFZpc2liaWxpdHkgKHgsIHkpIHtcbiAgICBpZiAoKHRoaXMudmlzaWJpbGl0eVt4XSA9PSBudWxsKSB8fCAodGhpcy52aXNpYmlsaXR5W3hdW3ldID09IG51bGwpKSB7XG4gICAgICByZXR1cm4gMFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpYmlsaXR5W3hdW3ldXG4gICAgfVxuICB9XG5cbiAgY2FuUHJvY2VzcyAoeCwgeSkge1xuICAgIHJldHVybiAhdGhpcy5zdGFjay5zb21lKChwdCkgPT4ge1xuICAgICAgcmV0dXJuIHB0LnggPT09IHggJiYgcHQueSA9PT0geVxuICAgIH0pICYmICh0aGlzLmdldFB0KHgsIHkpID09IG51bGwpXG4gIH1cblxuICBzdGVwICgpIHtcbiAgICB2YXIgbG9zLCBwdFxuICAgIHB0ID0gdGhpcy5zdGFjay5zaGlmdCgpXG4gICAgbG9zID0gbmV3IExpbmVPZlNpZ2h0KHRoaXMub3JpZ2luVGlsZS5jb250YWluZXIsIHRoaXMub3JpZ2luVGlsZS54ICsgdGhpcy5vZmZzZXQueCwgdGhpcy5vcmlnaW5UaWxlLnkgKyB0aGlzLm9mZnNldC55LCBwdC54LCBwdC55KVxuICAgIGxvcy5yZXZlcnNlVHJhY2luZygpXG4gICAgbG9zLnRyYXZlcnNhYmxlQ2FsbGJhY2sgPSAodGlsZSwgZW50cnlYLCBlbnRyeVkpID0+IHtcbiAgICAgIGlmICh0aWxlICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0VmlzaWJpbGl0eSh0aWxlLngsIHRpbGUueSkgPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gbG9zLmZvcmNlU3VjY2VzcygpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRpbGUudHJhbnNwYXJlbnRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFB0KHB0LngsIHB0LnksIGxvcy5nZXRTdWNjZXNzKCkpXG4gICAgaWYgKGxvcy5nZXRTdWNjZXNzKCkpIHtcbiAgICAgIHJldHVybiBEaXJlY3Rpb24uYWxsLmZvckVhY2goKGRpcmVjdGlvbikgPT4ge1xuICAgICAgICB2YXIgbmV4dFB0XG4gICAgICAgIG5leHRQdCA9IHtcbiAgICAgICAgICB4OiBwdC54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgeTogcHQueSArIGRpcmVjdGlvbi55XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2FuUHJvY2VzcyhuZXh0UHQueCwgbmV4dFB0LnkpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2sucHVzaChuZXh0UHQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Qm91bmRzICgpIHtcbiAgICB2YXIgYm91bmRhcmllcywgY29sLCByZWYsIHgsIHlcbiAgICBib3VuZGFyaWVzID0ge1xuICAgICAgdG9wOiBudWxsLFxuICAgICAgbGVmdDogbnVsbCxcbiAgICAgIGJvdHRvbTogbnVsbCxcbiAgICAgIHJpZ2h0OiBudWxsXG4gICAgfVxuICAgIHJlZiA9IHRoaXMudmlzaWJpbGl0eVxuICAgIGZvciAoeCBpbiByZWYpIHtcbiAgICAgIGNvbCA9IHJlZlt4XVxuICAgICAgZm9yICh5IGluIGNvbCkge1xuICAgICAgICBpZiAoKGJvdW5kYXJpZXMudG9wID09IG51bGwpIHx8IHkgPCBib3VuZGFyaWVzLnRvcCkge1xuICAgICAgICAgIGJvdW5kYXJpZXMudG9wID0geVxuICAgICAgICB9XG4gICAgICAgIGlmICgoYm91bmRhcmllcy5sZWZ0ID09IG51bGwpIHx8IHggPCBib3VuZGFyaWVzLmxlZnQpIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmxlZnQgPSB4XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB5ID4gYm91bmRhcmllcy5ib3R0b20pIHtcbiAgICAgICAgICBib3VuZGFyaWVzLmJvdHRvbSA9IHlcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGJvdW5kYXJpZXMucmlnaHQgPT0gbnVsbCkgfHwgeCA+IGJvdW5kYXJpZXMucmlnaHQpIHtcbiAgICAgICAgICBib3VuZGFyaWVzLnJpZ2h0ID0geFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBib3VuZGFyaWVzXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1RpbGVDb250YWluZXJ9XG4gICAqL1xuICB0b0NvbnRhaW5lciAoKSB7XG4gICAgdmFyIGNvbCwgcmVmLCB0aWxlLCB2YWwsIHgsIHlcbiAgICBjb25zdCByZXMgPSBuZXcgVGlsZUNvbnRhaW5lcigpXG4gICAgcmVzLm93bmVyID0gZmFsc2VcbiAgICByZWYgPSB0aGlzLnZpc2liaWxpdHlcbiAgICBmb3IgKHggaW4gcmVmKSB7XG4gICAgICBjb2wgPSByZWZbeF1cbiAgICAgIGZvciAoeSBpbiBjb2wpIHtcbiAgICAgICAgdmFsID0gY29sW3ldXG4gICAgICAgIHRpbGUgPSB0aGlzLm9yaWdpblRpbGUuY29udGFpbmVyLmdldFRpbGUoeCwgeSlcbiAgICAgICAgaWYgKHZhbCAhPT0gMCAmJiAodGlsZSAhPSBudWxsKSkge1xuICAgICAgICAgIHRpbGUgPSBuZXcgVGlsZVJlZmVyZW5jZSh0aWxlKVxuICAgICAgICAgIHRpbGUudmlzaWJpbGl0eSA9IHZhbFxuICAgICAgICAgIHJlcy5hZGRUaWxlKHRpbGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgdG9NYXAgKCkge1xuICAgIHZhciBpLCBqLCByZWYsIHJlZjEsIHJlZjIsIHJlZjMsIHJlcywgeCwgeVxuICAgIHJlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbWFwOiBbXVxuICAgIH0sIHRoaXMuZ2V0Qm91bmRzKCkpXG4gICAgZm9yICh5ID0gaSA9IHJlZiA9IHJlcy50b3AsIHJlZjEgPSByZXMuYm90dG9tIC0gMTsgKHJlZiA8PSByZWYxID8gaSA8PSByZWYxIDogaSA+PSByZWYxKTsgeSA9IHJlZiA8PSByZWYxID8gKytpIDogLS1pKSB7XG4gICAgICByZXMubWFwW3kgLSByZXMudG9wXSA9IFtdXG4gICAgICBmb3IgKHggPSBqID0gcmVmMiA9IHJlcy5sZWZ0LCByZWYzID0gcmVzLnJpZ2h0IC0gMTsgKHJlZjIgPD0gcmVmMyA/IGogPD0gcmVmMyA6IGogPj0gcmVmMyk7IHggPSByZWYyIDw9IHJlZjMgPyArK2ogOiAtLWopIHtcbiAgICAgICAgcmVzLm1hcFt5IC0gcmVzLnRvcF1beCAtIHJlcy5sZWZ0XSA9IHRoaXMuZ2V0VmlzaWJpbGl0eSh4LCB5KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBWaXNpb25DYWxjdWxhdG9yXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNsYXNzIEFjdGlvbiBleHRlbmRzIEVsZW1lbnQge1xuICB3aXRoQWN0b3IgKGFjdG9yKSB7XG4gICAgaWYgKHRoaXMuYWN0b3IgIT09IGFjdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7XG4gICAgICAgIGFjdG9yOiBhY3RvclxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH1cblxuICBjb3B5V2l0aCAob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihPYmplY3QuYXNzaWduKHtcbiAgICAgIGJhc2U6IHRoaXMuYmFzZU9yVGhpcygpXG4gICAgfSwgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5nZXRNYW51YWxEYXRhUHJvcGVydGllcygpLCBvcHRpb25zKSlcbiAgfVxuXG4gIGJhc2VPclRoaXMgKCkge1xuICAgIHJldHVybiB0aGlzLmJhc2UgfHwgdGhpc1xuICB9XG5cbiAgc3RhcnQgKCkge1xuICAgIHRoaXMuYWN0b3IuY3VycmVudEFjdGlvbiA9IHRoaXNcbiAgICByZXR1cm4gdGhpcy5leGVjdXRlKClcbiAgfVxuXG4gIHZhbGlkQWN0b3IgKCkge1xuICAgIHJldHVybiB0aGlzLmFjdG9yICE9IG51bGxcbiAgfVxuXG4gIGlzUmVhZHkgKCkge1xuICAgIHJldHVybiB0aGlzLnZhbGlkQWN0b3IoKVxuICB9XG5cbiAgZmluaXNoICgpIHtcbiAgICB0aGlzLmVtaXQoJ2ZpbmlzaGVkJylcbiAgICByZXR1cm4gdGhpcy5lbmQoKVxuICB9XG5cbiAgaW50ZXJydXB0ICgpIHtcbiAgICB0aGlzLmVtaXQoJ2ludGVycnVwdGVkJylcbiAgICByZXR1cm4gdGhpcy5lbmQoKVxuICB9XG5cbiAgZW5kICgpIHtcbiAgICBpZiAodGhpcy5hY3RvciAmJiB0aGlzLmFjdG9yLmN1cnJlbnRBY3Rpb24gPT09IHRoaXMpIHtcbiAgICAgIHRoaXMuYWN0b3IuY3VycmVudEFjdGlvbiA9IG51bGxcbiAgICB9XG4gICAgdGhpcy5lbWl0KCdlbmQnKVxuICAgIHJldHVybiB0aGlzLmRlc3Ryb3koKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpXG4gIH1cbn07XG5cbkFjdGlvbi5pbmNsdWRlKEV2ZW50RW1pdHRlci5wcm90b3R5cGUpXG5cbkFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgYWN0b3I6IHt9LFxuICBiYXNlOiB7fVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpb25cbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBBY3Rpb25Qcm92aWRlciBleHRlbmRzIEVsZW1lbnQge307XG5cbkFjdGlvblByb3ZpZGVyLnByb3BlcnRpZXMoe1xuICBhY3Rpb25zOiB7XG4gICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICBjb21wb3NlZDogdHJ1ZVxuICB9LFxuICBvd25lcjoge31cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uUHJvdmlkZXJcbiIsImNvbnN0IFdhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKVxuY29uc3QgVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKVxuY29uc3QgRXZlbnRCaW5kID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50QmluZFxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlclxuXG5jbGFzcyBBdHRhY2tBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICB2YWxpZFRhcmdldCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0SXNBdHRhY2thYmxlKCkgJiYgKHRoaXMuY2FuVXNlV2VhcG9uKCkgfHwgdGhpcy5jYW5XYWxrVG9UYXJnZXQoKSlcbiAgfVxuXG4gIHRhcmdldElzQXR0YWNrYWJsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmRhbWFnZWFibGUgJiYgdGhpcy50YXJnZXQuaGVhbHRoID4gMFxuICB9XG5cbiAgY2FuTWVsZWUgKCkge1xuICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnRhcmdldC50aWxlLnggLSB0aGlzLmFjdG9yLnRpbGUueCkgKyBNYXRoLmFicyh0aGlzLnRhcmdldC50aWxlLnkgLSB0aGlzLmFjdG9yLnRpbGUueSkgPT09IDFcbiAgfVxuXG4gIGNhblVzZVdlYXBvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmVzdFVzYWJsZVdlYXBvbiAhPSBudWxsXG4gIH1cblxuICBjYW5Vc2VXZWFwb25BdCAodGlsZSkge1xuICAgIHZhciByZWZcbiAgICByZXR1cm4gKChyZWYgPSB0aGlzLmFjdG9yLndlYXBvbnMpICE9IG51bGwgPyByZWYubGVuZ3RoIDogbnVsbCkgJiYgdGhpcy5hY3Rvci53ZWFwb25zLmZpbmQoKHdlYXBvbikgPT4ge1xuICAgICAgcmV0dXJuIHdlYXBvbi5jYW5Vc2VGcm9tKHRpbGUsIHRoaXMudGFyZ2V0KVxuICAgIH0pXG4gIH1cblxuICBjYW5XYWxrVG9UYXJnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24uaXNSZWFkeSgpXG4gIH1cblxuICB1c2VXZWFwb24gKCkge1xuICAgIHRoaXMuYmVzdFVzYWJsZVdlYXBvbi51c2VPbih0aGlzLnRhcmdldClcbiAgICByZXR1cm4gdGhpcy5maW5pc2goKVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgaWYgKHRoaXMuYWN0b3Iud2FsayAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFjdG9yLndhbGsuaW50ZXJydXB0KClcbiAgICB9XG4gICAgaWYgKHRoaXMuYmVzdFVzYWJsZVdlYXBvbiAhPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5iZXN0VXNhYmxlV2VhcG9uLmNoYXJnZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlV2VhcG9uKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLndlYXBvbkNoYXJnZVdhdGNoZXIuYmluZCgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMud2Fsa0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLnVuYmluZCgpXG4gICAgICAgIHRoaXMud2Fsa0FjdGlvbi5kZXN0cm95KClcbiAgICAgICAgdGhpcy53YWxrQWN0aW9uUHJvcGVydHkuaW52YWxpZGF0ZSgpXG4gICAgICAgIGlmICh0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuaW50ZXJydXB0QmluZGVyLmJpbmRUbyh0aGlzLndhbGtBY3Rpb24pXG4gICAgICByZXR1cm4gdGhpcy53YWxrQWN0aW9uLmV4ZWN1dGUoKVxuICAgIH1cbiAgfVxufTtcblxuQXR0YWNrQWN0aW9uLnByb3BlcnRpZXMoe1xuICB3YWxrQWN0aW9uOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgd2Fsa0FjdGlvblxuICAgICAgd2Fsa0FjdGlvbiA9IG5ldyBXYWxrQWN0aW9uKHtcbiAgICAgICAgYWN0b3I6IHRoaXMuYWN0b3IsXG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQudGlsZSxcbiAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxuICAgICAgfSlcbiAgICAgIHdhbGtBY3Rpb24ucGF0aEZpbmRlci5hcnJpdmVkQ2FsbGJhY2sgPSAoc3RlcCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW5Vc2VXZWFwb25BdChzdGVwLnRpbGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gd2Fsa0FjdGlvblxuICAgIH1cbiAgfSxcbiAgYmVzdFVzYWJsZVdlYXBvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdG9yKSB7XG4gICAgICB2YXIgcmVmLCB1c2FibGVXZWFwb25zXG4gICAgICBpbnZhbGlkYXRvci5wcm9wUGF0aCgnYWN0b3IudGlsZScpXG4gICAgICBpZiAoKHJlZiA9IHRoaXMuYWN0b3Iud2VhcG9ucykgIT0gbnVsbCA/IHJlZi5sZW5ndGggOiBudWxsKSB7XG4gICAgICAgIHVzYWJsZVdlYXBvbnMgPSB0aGlzLmFjdG9yLndlYXBvbnMuZmlsdGVyKCh3ZWFwb24pID0+IHtcbiAgICAgICAgICByZXR1cm4gd2VhcG9uLmNhblVzZU9uKHRoaXMudGFyZ2V0KVxuICAgICAgICB9KVxuICAgICAgICB1c2FibGVXZWFwb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICByZXR1cm4gYi5kcHMgLSBhLmRwc1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gdXNhYmxlV2VhcG9uc1swXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGludGVycnVwdEJpbmRlcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBFdmVudEJpbmQoJ2ludGVycnVwdGVkJywgbnVsbCwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGRlc3Ryb3k6IHRydWVcbiAgfSxcbiAgd2VhcG9uQ2hhcmdlV2F0Y2hlcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmJlc3RVc2FibGVXZWFwb24uY2hhcmdlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlV2VhcG9uKClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLmJlc3RVc2FibGVXZWFwb24ucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ2NoYXJnZWQnKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGRlc3Ryb3k6IHRydWVcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2tBY3Rpb25cbiIsImNvbnN0IFdhbGtBY3Rpb24gPSByZXF1aXJlKCcuL1dhbGtBY3Rpb24nKVxuY29uc3QgQXR0YWNrQWN0aW9uID0gcmVxdWlyZSgnLi9BdHRhY2tBY3Rpb24nKVxuY29uc3QgVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKVxuY29uc3QgUGF0aEZpbmRlciA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tcGF0aGZpbmRlcicpXG5jb25zdCBMaW5lT2ZTaWdodCA9IHJlcXVpcmUoJy4uL0xpbmVPZlNpZ2h0JylcbmNvbnN0IFByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS53YXRjaGVycy5Qcm9wZXJ0eVdhdGNoZXJcbmNvbnN0IEV2ZW50QmluZCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FdmVudEJpbmRcblxuY2xhc3MgQXR0YWNrTW92ZUFjdGlvbiBleHRlbmRzIFRhcmdldEFjdGlvbiB7XG4gIGlzRW5lbXkgKGVsZW0pIHtcbiAgICB2YXIgcmVmXG4gICAgcmV0dXJuIChyZWYgPSB0aGlzLmFjdG9yLm93bmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5pc0VuZW15ID09PSAnZnVuY3Rpb24nID8gcmVmLmlzRW5lbXkoZWxlbSkgOiBudWxsIDogbnVsbFxuICB9XG5cbiAgdmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLndhbGtBY3Rpb24udmFsaWRUYXJnZXQoKVxuICB9XG5cbiAgdGVzdEVuZW15U3BvdHRlZCAoKSB7XG4gICAgdGhpcy5lbmVteVNwb3R0ZWRQcm9wZXJ0eS5pbnZhbGlkYXRlKClcbiAgICBpZiAodGhpcy5lbmVteVNwb3R0ZWQpIHtcbiAgICAgIHRoaXMuYXR0YWNrQWN0aW9uID0gbmV3IEF0dGFja0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzLmFjdG9yLFxuICAgICAgICB0YXJnZXQ6IHRoaXMuZW5lbXlTcG90dGVkXG4gICAgICB9KVxuICAgICAgaWYgKCF0aGlzLmF0dGFja0FjdGlvbi5pc1JlYWR5KCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICAgIHRoaXMuYXR0YWNrQWN0aW9uLm9uKCdmaW5pc2hlZCcsICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZSgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLmludGVycnVwdEJpbmRlci5iaW5kVG8odGhpcy5hdHRhY2tBY3Rpb24pXG4gICAgICB0aGlzLndhbGtBY3Rpb24uaW50ZXJydXB0KClcbiAgICAgIHRoaXMud2Fsa0FjdGlvblByb3BlcnR5LmludmFsaWRhdGUoKVxuICAgICAgcmV0dXJuIHRoaXMuYXR0YWNrQWN0aW9uLmV4ZWN1dGUoKVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICghdGhpcy50ZXN0RW5lbXlTcG90dGVkKCkpIHtcbiAgICAgIHRoaXMud2Fsa0FjdGlvbi5vbignZmluaXNoZWQnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaCgpXG4gICAgICB9KVxuICAgICAgdGhpcy5pbnRlcnJ1cHRCaW5kZXIuYmluZFRvKHRoaXMud2Fsa0FjdGlvbilcbiAgICAgIHRoaXMudGlsZVdhdGNoZXIuYmluZCgpXG4gICAgICByZXR1cm4gdGhpcy53YWxrQWN0aW9uLmV4ZWN1dGUoKVxuICAgIH1cbiAgfVxufTtcblxuQXR0YWNrTW92ZUFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgd2Fsa0FjdGlvbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHdhbGtBY3Rpb25cbiAgICAgIHdhbGtBY3Rpb24gPSBuZXcgV2Fsa0FjdGlvbih7XG4gICAgICAgIGFjdG9yOiB0aGlzLmFjdG9yLFxuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHdhbGtBY3Rpb25cbiAgICB9XG4gIH0sXG4gIGVuZW15U3BvdHRlZDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlZlxuICAgICAgdGhpcy5wYXRoID0gbmV3IFBhdGhGaW5kZXIodGhpcy5hY3Rvci50aWxlLmNvbnRhaW5lciwgdGhpcy5hY3Rvci50aWxlLCBmYWxzZSwge1xuICAgICAgICB2YWxpZFRpbGU6ICh0aWxlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRpbGUudHJhbnNwYXJlbnQgJiYgKG5ldyBMaW5lT2ZTaWdodCh0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUueCwgdGhpcy5hY3Rvci50aWxlLnksIHRpbGUueCwgdGlsZS55KSkuZ2V0U3VjY2VzcygpXG4gICAgICAgIH0sXG4gICAgICAgIGFycml2ZWQ6IChzdGVwKSA9PiB7XG4gICAgICAgICAgc3RlcC5lbmVteSA9IHN0ZXAudGlsZS5jaGlsZHJlbi5maW5kKChjKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc0VuZW15KGMpXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gc3RlcC5lbmVteVxuICAgICAgICB9LFxuICAgICAgICBlZmZpY2llbmN5OiAodGlsZSkgPT4ge31cbiAgICAgIH0pXG4gICAgICB0aGlzLnBhdGguY2FsY3VsKClcbiAgICAgIHJldHVybiAocmVmID0gdGhpcy5wYXRoLnNvbHV0aW9uKSAhPSBudWxsID8gcmVmLmVuZW15IDogbnVsbFxuICAgIH1cbiAgfSxcbiAgdGlsZVdhdGNoZXI6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50ZXN0RW5lbXlTcG90dGVkKClcbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydHk6IHRoaXMuYWN0b3IucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkoJ3RpbGUnKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGRlc3Ryb3k6IHRydWVcbiAgfSxcbiAgaW50ZXJydXB0QmluZGVyOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbmV3IEV2ZW50QmluZCgnaW50ZXJydXB0ZWQnLCBudWxsLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVycnVwdCgpXG4gICAgICB9KVxuICAgIH0sXG4gICAgZGVzdHJveTogdHJ1ZVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFja01vdmVBY3Rpb25cbiIsImNvbnN0IEFjdGlvblByb3ZpZGVyID0gcmVxdWlyZSgnLi9BY3Rpb25Qcm92aWRlcicpXG5cbmNsYXNzIFNpbXBsZUFjdGlvblByb3ZpZGVyIGV4dGVuZHMgQWN0aW9uUHJvdmlkZXIge307XG5cblNpbXBsZUFjdGlvblByb3ZpZGVyLnByb3BlcnRpZXMoe1xuICBhY3Rpb25zOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYWN0aW9uc1xuICAgICAgYWN0aW9ucyA9IHRoaXMuYWN0aW9uT3B0aW9ucyB8fCB0aGlzLmNvbnN0cnVjdG9yLmFjdGlvbnMgfHwgW11cbiAgICAgIGlmICh0eXBlb2YgYWN0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYWN0aW9ucyA9IE9iamVjdC5rZXlzKGFjdGlvbnMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGFjdGlvbnNba2V5XVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb24ud2l0aFRhcmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiBhY3Rpb24ud2l0aFRhcmdldCh0aGlzKVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBBY3Rpb25DbGFzcyA9IGFjdGlvblxuICAgICAgICAgIHJldHVybiBuZXcgQWN0aW9uQ2xhc3Moe1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYWN0aW9uXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZUFjdGlvblByb3ZpZGVyXG4iLCJjb25zdCBBY3Rpb24gPSByZXF1aXJlKCcuL0FjdGlvbicpXG5cbmNsYXNzIFRhcmdldEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gIHdpdGhUYXJnZXQgKHRhcmdldCkge1xuICAgIGlmICh0aGlzLnRhcmdldCAhPT0gdGFyZ2V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfVxuXG4gIGNhblRhcmdldCAodGFyZ2V0KSB7XG4gICAgdmFyIGluc3RhbmNlXG4gICAgaW5zdGFuY2UgPSB0aGlzLndpdGhUYXJnZXQodGFyZ2V0KVxuICAgIGlmIChpbnN0YW5jZS52YWxpZFRhcmdldCgpKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2VcbiAgICB9XG4gIH1cblxuICB2YWxpZFRhcmdldCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0ICE9IG51bGxcbiAgfVxuXG4gIGlzUmVhZHkgKCkge1xuICAgIHJldHVybiBzdXBlci5pc1JlYWR5KCkgJiYgdGhpcy52YWxpZFRhcmdldCgpXG4gIH1cbn07XG5cblRhcmdldEFjdGlvbi5wcm9wZXJ0aWVzKHtcbiAgdGFyZ2V0OiB7fVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBUYXJnZXRBY3Rpb25cbiIsImNvbnN0IEFjdGlvblByb3ZpZGVyID0gcmVxdWlyZSgnLi9BY3Rpb25Qcm92aWRlcicpXG5cbmNsYXNzIFRpbGVkQWN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBY3Rpb25Qcm92aWRlciB7XG4gIHZhbGlkQWN0aW9uVGlsZSAodGlsZSkge1xuICAgIHJldHVybiB0aWxlICE9IG51bGxcbiAgfVxuXG4gIHByZXBhcmVBY3Rpb25UaWxlICh0aWxlKSB7XG4gICAgaWYgKCF0aWxlLmFjdGlvblByb3ZpZGVyKSB7XG4gICAgICB0aWxlLmFjdGlvblByb3ZpZGVyID0gbmV3IEFjdGlvblByb3ZpZGVyKHtcbiAgICAgICAgb3duZXI6IHRpbGVcbiAgICAgIH0pXG4gICAgfVxuICB9XG59O1xuXG5UaWxlZEFjdGlvblByb3ZpZGVyLnByb3BlcnRpZXMoe1xuICBvcmlnaW5UaWxlOiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wUGF0aCgnb3duZXIudGlsZScpXG4gICAgfVxuICB9LFxuICBhY3Rpb25UaWxlczoge1xuICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoaW52YWxpZGF0b3IpIHtcbiAgICAgIHZhciBteVRpbGVcbiAgICAgIG15VGlsZSA9IGludmFsaWRhdG9yLnByb3AodGhpcy5vcmlnaW5UaWxlUHJvcGVydHkpXG4gICAgICBpZiAobXlUaWxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGlvblRpbGVzQ29vcmQubWFwKChjb29yZCkgPT4ge1xuICAgICAgICAgIHJldHVybiBteVRpbGUuZ2V0UmVsYXRpdmVUaWxlKGNvb3JkLngsIGNvb3JkLnkpXG4gICAgICAgIH0pLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkQWN0aW9uVGlsZSh0aWxlKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9XG4gICAgfSxcbiAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICB0aGlzLnByZXBhcmVBY3Rpb25UaWxlKHRpbGUpXG4gICAgICByZXR1cm4gdGlsZS5hY3Rpb25Qcm92aWRlci5hY3Rpb25zTWVtYmVycy5hZGRQcm9wZXJ0eSh0aGlzLmFjdGlvbnNQcm9wZXJ0eSlcbiAgICB9LFxuICAgIGl0ZW1SZW1vdmVkOiBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgcmV0dXJuIHRpbGUuYWN0aW9uUHJvdmlkZXIuYWN0aW9uc01lbWJlcnMucmVtb3ZlUHJvcGVydHkodGhpcy5hY3Rpb25zUHJvcGVydHkpXG4gICAgfVxuICB9XG59KVxuXG5UaWxlZEFjdGlvblByb3ZpZGVyLnByb3RvdHlwZS5hY3Rpb25UaWxlc0Nvb3JkID0gW1xuICB7XG4gICAgeDogMCxcbiAgICB5OiAtMVxuICB9LFxuICB7XG4gICAgeDogLTEsXG4gICAgeTogMFxuICB9LFxuICB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH0sXG4gIHtcbiAgICB4OiArMSxcbiAgICB5OiAwXG4gIH0sXG4gIHtcbiAgICB4OiAwLFxuICAgIHk6ICsxXG4gIH1cbl1cblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZEFjdGlvblByb3ZpZGVyXG4iLCJjb25zdCBUYXJnZXRBY3Rpb24gPSByZXF1aXJlKCcuL1RhcmdldEFjdGlvbicpXG5jb25zdCBUcmF2ZWwgPSByZXF1aXJlKCcuLi9UcmF2ZWwnKVxuXG5jbGFzcyBUcmF2ZWxBY3Rpb24gZXh0ZW5kcyBUYXJnZXRBY3Rpb24ge1xuICB2YWxpZFRhcmdldCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhdmVsLnZhbGlkXG4gIH1cblxuICBleGVjdXRlICgpIHtcbiAgICByZXR1cm4gdGhpcy50cmF2ZWwuc3RhcnQoKVxuICB9XG59O1xuXG5UcmF2ZWxBY3Rpb24ucHJvcGVydGllcyh7XG4gIHRyYXZlbDoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBUcmF2ZWwoe1xuICAgICAgICB0cmF2ZWxsZXI6IHRoaXMuYWN0b3IsXG4gICAgICAgIHN0YXJ0TG9jYXRpb246IHRoaXMuYWN0b3IubG9jYXRpb24sXG4gICAgICAgIHRhcmdldExvY2F0aW9uOiB0aGlzLnRhcmdldFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhdmVsQWN0aW9uXG4iLCJjb25zdCBQYXRoRmluZGVyID0gcmVxdWlyZSgncGFyYWxsZWxpby1wYXRoZmluZGVyJylcbmNvbnN0IFBhdGhXYWxrID0gcmVxdWlyZSgnLi4vUGF0aFdhbGsnKVxuY29uc3QgVGFyZ2V0QWN0aW9uID0gcmVxdWlyZSgnLi9UYXJnZXRBY3Rpb24nKVxuXG5jbGFzcyBXYWxrQWN0aW9uIGV4dGVuZHMgVGFyZ2V0QWN0aW9uIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgaWYgKHRoaXMuYWN0b3Iud2FsayAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFjdG9yLndhbGsuaW50ZXJydXB0KClcbiAgICB9XG4gICAgdGhpcy53YWxrID0gdGhpcy5hY3Rvci53YWxrID0gbmV3IFBhdGhXYWxrKHRoaXMuYWN0b3IsIHRoaXMucGF0aEZpbmRlcilcbiAgICB0aGlzLmFjdG9yLndhbGsub24oJ2ZpbmlzaGVkJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoKClcbiAgICB9KVxuICAgIHRoaXMuYWN0b3Iud2Fsay5vbignaW50ZXJydXB0ZWQnLCAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5pbnRlcnJ1cHQoKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXMuYWN0b3Iud2Fsay5zdGFydCgpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBzdXBlci5kZXN0cm95KClcbiAgICBpZiAodGhpcy53YWxrKSB7XG4gICAgICByZXR1cm4gdGhpcy53YWxrLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIHZhbGlkVGFyZ2V0ICgpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgdGhpcy5wYXRoRmluZGVyLmNhbGN1bCgpXG4gICAgcmV0dXJuIHRoaXMucGF0aEZpbmRlci5zb2x1dGlvbiAhPSBudWxsXG4gIH1cbn07XG5cbldhbGtBY3Rpb24ucHJvcGVydGllcyh7XG4gIHBhdGhGaW5kZXI6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgUGF0aEZpbmRlcih0aGlzLmFjdG9yLnRpbGUuY29udGFpbmVyLCB0aGlzLmFjdG9yLnRpbGUsIHRoaXMudGFyZ2V0LCB7XG4gICAgICAgIHZhbGlkVGlsZTogKHRpbGUpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuYWN0b3IuY2FuR29PblRpbGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdG9yLmNhbkdvT25UaWxlKHRpbGUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aWxlLndhbGthYmxlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBXYWxrQWN0aW9uXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IFRpbGVDb250YWluZXIgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZUNvbnRhaW5lclxuY29uc3QgVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlXG5jb25zdCBEaXJlY3Rpb24gPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuRGlyZWN0aW9uXG5jb25zdCBBaXJsb2NrID0gcmVxdWlyZSgnLi4vQWlybG9jaycpXG5jb25zdCBGbG9vciA9IHJlcXVpcmUoJy4uL0Zsb29yJylcblxuY2xhc3MgQWlybG9ja0dlbmVyYXRvciBleHRlbmRzIEVsZW1lbnQge1xuICBnZW5lcmF0ZSAoKSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRQb3MoKVxuICAgIHRoaXMuc3RydWN0dXJlLmFsbFRpbGVzKCkubWFwKCh0aWxlKSA9PiB7XG4gICAgICB0aWxlID0gdGlsZS5jb3B5QW5kUm90YXRlKHRoaXMuZGlyZWN0aW9uLmFuZ2xlKVxuICAgICAgdGlsZS54ICs9IHBvcy54XG4gICAgICB0aWxlLnkgKz0gcG9zLnlcbiAgICAgIHRoaXMudGlsZUNvbnRhaW5lci5yZW1vdmVUaWxlQXQodGlsZS54LCB0aWxlLnkpXG4gICAgICB0aGlzLnRpbGVDb250YWluZXIuYWRkVGlsZSh0aWxlKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb3MgKCkge1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uXG4gICAgY29uc3QgYm91bmRhcmllcyA9IHRoaXMudGlsZUNvbnRhaW5lci5ib3VuZGFyaWVzXG4gICAgbGV0IGkgPSAwXG4gICAgd2hpbGUgKGkgPCAyMCkge1xuICAgICAgY29uc3QgeCA9IHRoaXMuZ2V0QXhpc1BvcyhkaXJlY3Rpb24ueCwgYm91bmRhcmllcy5sZWZ0LCBib3VuZGFyaWVzLnJpZ2h0KVxuICAgICAgY29uc3QgeSA9IHRoaXMuZ2V0QXhpc1BvcyhkaXJlY3Rpb24ueSwgYm91bmRhcmllcy50b3AsIGJvdW5kYXJpZXMuYm90dG9tKVxuICAgICAgY29uc3QgdGlsZVRvVGVzdCA9IHRoaXMudGlsZUNvbnRhaW5lci5nZXRUaWxlKHggKyBkaXJlY3Rpb24uZ2V0SW52ZXJzZSgpLngsIHkgKyBkaXJlY3Rpb24uZ2V0SW52ZXJzZSgpLnkpXG4gICAgICBpZiAodGlsZVRvVGVzdCAmJiB0aWxlVG9UZXN0LndhbGthYmxlKSB7XG4gICAgICAgIHJldHVybiB7IHg6IHgsIHk6IHkgfVxuICAgICAgfVxuICAgICAgaSsrXG4gICAgfVxuICB9XG5cbiAgZ2V0QXhpc1BvcyAobW9kZSwgbWluLCBtYXgpIHtcbiAgICBpZiAobW9kZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5ybmcoKSAqIChtYXggLSBtaW4pKSArIG1pblxuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIG1heFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWluXG4gICAgfVxuICB9XG5cbiAgYWlybG9ja0ZhY3RvcnkgKG9wdCkge1xuICAgIG9wdC5kaXJlY3Rpb24gPSBEaXJlY3Rpb24udXBcbiAgICByZXR1cm4gbmV3IEFpcmxvY2sob3B0KVxuICB9XG59XG5cbkFpcmxvY2tHZW5lcmF0b3IucHJvcGVydGllcyh7XG4gIHRpbGVDb250YWluZXI6IHt9LFxuICBkaXJlY3Rpb246IHtcbiAgICBkZWZhdWx0OiBEaXJlY3Rpb24udXBcbiAgfSxcbiAgcm5nOiB7XG4gICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgfSxcbiAgd2FsbEZhY3Rvcnk6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LndhbGxGYWN0b3J5IDogZnVuY3Rpb24gKG9wdCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUob3B0KVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZmxvb3JGYWN0b3J5OiB7XG4gICAgY2FsY3VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC53YWxsRmFjdG9yeSA6IGZ1bmN0aW9uIChvcHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbG9vcihvcHQpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzdHJ1Y3R1cmU6IHtcbiAgICBjYWxjdWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHRpbGVzID0gbmV3IFRpbGVDb250YWluZXIoKVxuICAgICAgY29uc3QgdyA9IHRoaXMud2FsbEZhY3RvcnlcbiAgICAgIGNvbnN0IGYgPSB0aGlzLmZsb29yRmFjdG9yeVxuICAgICAgY29uc3QgYSA9IHRoaXMuYWlybG9ja0ZhY3RvcnkuYmluZCh0aGlzKVxuICAgICAgdGlsZXMubG9hZE1hdHJpeChbXG4gICAgICAgIFt3LCBhLCB3XSxcbiAgICAgICAgW3csIGYsIHddXG4gICAgICBdLCB7IHg6IC0xLCB5OiAtMSB9KVxuICAgICAgcmV0dXJuIHRpbGVzXG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFpcmxvY2tHZW5lcmF0b3JcbiIsInZhciBpbmRleE9mID0gW10uaW5kZXhPZlxuY29uc3QgRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50XG5jb25zdCBUaWxlQ29udGFpbmVyID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLlRpbGVDb250YWluZXJcbmNvbnN0IFRpbGUgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZVxuY29uc3QgRGlyZWN0aW9uID0gcmVxdWlyZSgncGFyYWxsZWxpby10aWxlcycpLkRpcmVjdGlvblxuY29uc3QgRG9vciA9IHJlcXVpcmUoJy4uL0Rvb3InKVxuXG5jbGFzcyBSb29tR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gIGluaXRUaWxlcyAoKSB7XG4gICAgdGhpcy5maW5hbFRpbGVzID0gbnVsbFxuICAgIHRoaXMucm9vbXMgPSBbXVxuICAgIHRoaXMuZnJlZSA9IHRoaXMucGxhbi5hbGxUaWxlcygpLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgcmV0dXJuICFEaXJlY3Rpb24uYWxsLnNvbWUoKGRpcmVjdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGFuLmdldFRpbGUodGlsZS54ICsgZGlyZWN0aW9uLngsIHRpbGUueSArIGRpcmVjdGlvbi55KSA9PSBudWxsXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBnZW5lcmF0ZSAoKSB7XG4gICAgdGhpcy5nZXRUaWxlcygpLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgIHRoaXMudGlsZUNvbnRhaW5lci5hZGRUaWxlKHRpbGUpXG4gICAgfSlcbiAgfVxuXG4gIGNhbGN1bCAoKSB7XG4gICAgdGhpcy5pbml0VGlsZXMoKVxuICAgIHdoaWxlICh0aGlzLnN0ZXAoKSB8fCB0aGlzLm5ld1Jvb20oKSkge31cbiAgICB0aGlzLmNyZWF0ZURvb3JzKClcbiAgICB0aGlzLm1ha2VGaW5hbFRpbGVzKClcbiAgfVxuXG4gIGZsb29yRmFjdG9yeSAob3B0KSB7XG4gICAgcmV0dXJuIG5ldyBUaWxlKG9wdC54LCBvcHQueSlcbiAgfVxuXG4gIGRvb3JGYWN0b3J5IChvcHQpIHtcbiAgICByZXR1cm4gdGhpcy5mbG9vckZhY3Rvcnkob3B0KVxuICB9XG5cbiAgbWFrZUZpbmFsVGlsZXMgKCkge1xuICAgIHRoaXMuZmluYWxUaWxlcyA9IHRoaXMucGxhbi5hbGxUaWxlcygpLm1hcCgodGlsZSkgPT4ge1xuICAgICAgdmFyIG9wdFxuICAgICAgaWYgKHRpbGUuZmFjdG9yeSAhPSBudWxsKSB7XG4gICAgICAgIG9wdCA9IHtcbiAgICAgICAgICB4OiB0aWxlLngsXG4gICAgICAgICAgeTogdGlsZS55XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpbGUuZmFjdG9yeU9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICAgIG9wdCA9IE9iamVjdC5hc3NpZ24ob3B0LCB0aWxlLmZhY3RvcnlPcHRpb25zKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlLmZhY3Rvcnkob3B0KVxuICAgICAgfVxuICAgIH0pLmZpbHRlcigodGlsZSkgPT4ge1xuICAgICAgcmV0dXJuIHRpbGUgIT0gbnVsbFxuICAgIH0pXG4gIH1cblxuICBnZXRUaWxlcyAoKSB7XG4gICAgaWYgKHRoaXMuZmluYWxUaWxlcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLmNhbGN1bCgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbmFsVGlsZXNcbiAgfVxuXG4gIG5ld1Jvb20gKCkge1xuICAgIGlmICh0aGlzLmZyZWUubGVuZ3RoKSB7XG4gICAgICB0aGlzLnZvbHVtZSA9IE1hdGguZmxvb3IodGhpcy5ybmcoKSAqICh0aGlzLm1heFZvbHVtZSAtIHRoaXMubWluVm9sdW1lKSkgKyB0aGlzLm1pblZvbHVtZVxuICAgICAgdGhpcy5yb29tID0gbmV3IFJvb21HZW5lcmF0b3IuUm9vbSgpXG4gICAgICByZXR1cm4gdGhpcy5yb29tXG4gICAgfVxuICB9XG5cbiAgcmFuZG9tRGlyZWN0aW9ucyAoKSB7XG4gICAgdmFyIGksIGosIG8sIHhcbiAgICBvID0gRGlyZWN0aW9uLmFkamFjZW50cy5zbGljZSgpXG4gICAgaiA9IG51bGxcbiAgICB4ID0gbnVsbFxuICAgIGkgPSBvLmxlbmd0aFxuICAgIHdoaWxlIChpKSB7XG4gICAgICBqID0gTWF0aC5mbG9vcih0aGlzLnJuZygpICogaSlcbiAgICAgIHggPSBvWy0taV1cbiAgICAgIG9baV0gPSBvW2pdXG4gICAgICBvW2pdID0geFxuICAgIH1cbiAgICByZXR1cm4gb1xuICB9XG5cbiAgc3RlcCAoKSB7XG4gICAgdmFyIHN1Y2Nlc3MsIHRyaWVzXG4gICAgaWYgKHRoaXMucm9vbSkge1xuICAgICAgaWYgKHRoaXMuZnJlZS5sZW5ndGggJiYgdGhpcy5yb29tLnRpbGVzLmxlbmd0aCA8IHRoaXMudm9sdW1lIC0gMSkge1xuICAgICAgICBpZiAodGhpcy5yb29tLnRpbGVzLmxlbmd0aCkge1xuICAgICAgICAgIHRyaWVzID0gdGhpcy5yYW5kb21EaXJlY3Rpb25zKClcbiAgICAgICAgICBzdWNjZXNzID0gZmFsc2VcbiAgICAgICAgICB3aGlsZSAodHJpZXMubGVuZ3RoICYmICFzdWNjZXNzKSB7XG4gICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5leHBhbmQodGhpcy5yb29tLCB0cmllcy5wb3AoKSwgdGhpcy52b2x1bWUpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5yb29tRG9uZSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBzdWNjZXNzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUodGhpcy5yYW5kb21GcmVlVGlsZSgpLCB0aGlzLnJvb20pXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb29tRG9uZSgpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJvb21Eb25lICgpIHtcbiAgICB0aGlzLnJvb21zLnB1c2godGhpcy5yb29tKVxuICAgIHRoaXMuYWxsb2NhdGVXYWxscyh0aGlzLnJvb20pXG4gICAgdGhpcy5yb29tID0gbnVsbFxuICB9XG5cbiAgZXhwYW5kIChyb29tLCBkaXJlY3Rpb24sIG1heCA9IDApIHtcbiAgICByZXR1cm4gcm9vbS50aWxlcy5zbGljZSgpLnJlZHVjZSgoc3VjY2VzcywgdGlsZSkgPT4ge1xuICAgICAgaWYgKG1heCA9PT0gMCB8fCByb29tLnRpbGVzLmxlbmd0aCA8IG1heCkge1xuICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbilcbiAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICB0aGlzLmFsbG9jYXRlVGlsZShuZXh0LCByb29tKVxuICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlXG4gICAgICAgICAgY29uc3Qgc2Vjb25kID0gdGhpcy50aWxlT2Zmc2V0SXNGcmVlKHRpbGUsIGRpcmVjdGlvbiwgMilcbiAgICAgICAgICBpZiAoc2Vjb25kICYmICF0aGlzLnRpbGVPZmZzZXRJc0ZyZWUodGlsZSwgZGlyZWN0aW9uLCAzKSkge1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZVRpbGUoc2Vjb25kLCByb29tKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN1Y2Nlc3NcbiAgICB9LCBmYWxzZSlcbiAgfVxuXG4gIGFsbG9jYXRlV2FsbHMgKHJvb20pIHtcbiAgICB2YXIgZGlyZWN0aW9uLCBrLCBsZW4sIG5leHQsIG5leHRSb29tLCBvdGhlclNpZGUsIHJlZiwgcmVzdWx0cywgdGlsZVxuICAgIHJlZiA9IHJvb20udGlsZXNcbiAgICByZXN1bHRzID0gW11cbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHRpbGUgPSByZWZba11cbiAgICAgIHJlc3VsdHMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMVxuICAgICAgICByZWYxID0gRGlyZWN0aW9uLmFsbFxuICAgICAgICByZXN1bHRzMSA9IFtdXG4gICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgIGRpcmVjdGlvbiA9IHJlZjFbbF1cbiAgICAgICAgICBuZXh0ID0gdGhpcy5wbGFuLmdldFRpbGUodGlsZS54ICsgZGlyZWN0aW9uLngsIHRpbGUueSArIGRpcmVjdGlvbi55KVxuICAgICAgICAgIGlmICgobmV4dCAhPSBudWxsKSAmJiBuZXh0LnJvb20gIT09IHJvb20pIHtcbiAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwoRGlyZWN0aW9uLmNvcm5lcnMsIGRpcmVjdGlvbikgPCAwKSB7XG4gICAgICAgICAgICAgIG90aGVyU2lkZSA9IHRoaXMucGxhbi5nZXRUaWxlKHRpbGUueCArIGRpcmVjdGlvbi54ICogMiwgdGlsZS55ICsgZGlyZWN0aW9uLnkgKiAyKVxuICAgICAgICAgICAgICBuZXh0Um9vbSA9IChvdGhlclNpZGUgIT0gbnVsbCA/IG90aGVyU2lkZS5yb29tIDogbnVsbCkgIT0gbnVsbCA/IG90aGVyU2lkZS5yb29tIDogbnVsbFxuICAgICAgICAgICAgICByb29tLmFkZFdhbGwobmV4dCwgbmV4dFJvb20pXG4gICAgICAgICAgICAgIGlmIChuZXh0Um9vbSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV4dFJvb20uYWRkV2FsbChuZXh0LCByb29tKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy53YWxsRmFjdG9yeSkge1xuICAgICAgICAgICAgICBuZXh0LmZhY3RvcnkgPSAob3B0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2FsbEZhY3Rvcnkob3B0KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG5leHQuZmFjdG9yeS5iYXNlID0gdGhpcy53YWxsRmFjdG9yeVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0czEucHVzaCh0aGlzLmFsbG9jYXRlVGlsZShuZXh0KSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChudWxsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0czFcbiAgICAgIH0uY2FsbCh0aGlzKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuXG4gIGNyZWF0ZURvb3JzICgpIHtcbiAgICB2YXIgYWRqYWNlbnQsIGRvb3IsIGssIGxlbiwgcmVmLCByZXN1bHRzLCByb29tLCB3YWxsc1xuICAgIHJlZiA9IHRoaXMucm9vbXNcbiAgICByZXN1bHRzID0gW11cbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHJvb20gPSByZWZba11cbiAgICAgIHJlc3VsdHMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsLCBsZW4xLCByZWYxLCByZXN1bHRzMVxuICAgICAgICByZWYxID0gcm9vbS53YWxsc0J5Um9vbXMoKVxuICAgICAgICByZXN1bHRzMSA9IFtdXG4gICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICAgIHdhbGxzID0gcmVmMVtsXVxuICAgICAgICAgIGlmICgod2FsbHMucm9vbSAhPSBudWxsKSAmJiByb29tLmRvb3JzRm9yUm9vbSh3YWxscy5yb29tKSA8IDEpIHtcbiAgICAgICAgICAgIGRvb3IgPSB3YWxscy50aWxlc1tNYXRoLmZsb29yKHRoaXMucm5nKCkgKiB3YWxscy50aWxlcy5sZW5ndGgpXVxuICAgICAgICAgICAgZG9vci5mYWN0b3J5ID0gKG9wdCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kb29yRmFjdG9yeShvcHQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb29yLmZhY3RvcnkuYmFzZSA9IHRoaXMuZG9vckZhY3RvcnlcbiAgICAgICAgICAgIGFkamFjZW50ID0gdGhpcy5wbGFuLmdldFRpbGUoZG9vci54ICsgMSwgZG9vci55KVxuICAgICAgICAgICAgZG9vci5mYWN0b3J5T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgZGlyZWN0aW9uOiBhZGphY2VudC5mYWN0b3J5ICYmIGFkamFjZW50LmZhY3RvcnkuYmFzZSA9PT0gdGhpcy5mbG9vckZhY3RvcnkgPyBEb29yLmRpcmVjdGlvbnMudmVydGljYWwgOiBEb29yLmRpcmVjdGlvbnMuaG9yaXpvbnRhbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcm9vbS5hZGREb29yKGRvb3IsIHdhbGxzLnJvb20pXG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKHdhbGxzLnJvb20uYWRkRG9vcihkb29yLCByb29tKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChudWxsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0czFcbiAgICAgIH0uY2FsbCh0aGlzKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuXG4gIGFsbG9jYXRlVGlsZSAodGlsZSwgcm9vbSA9IG51bGwpIHtcbiAgICB2YXIgaW5kZXhcbiAgICBpZiAocm9vbSAhPSBudWxsKSB7XG4gICAgICByb29tLmFkZFRpbGUodGlsZSlcbiAgICAgIHRpbGUuZmFjdG9yeSA9IChvcHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvb3JGYWN0b3J5KG9wdClcbiAgICAgIH1cbiAgICAgIHRpbGUuZmFjdG9yeS5iYXNlID0gdGhpcy5mbG9vckZhY3RvcnlcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLmZyZWUuaW5kZXhPZih0aWxlKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5mcmVlLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICB0aWxlT2Zmc2V0SXNGcmVlICh0aWxlLCBkaXJlY3Rpb24sIG11bHRpcGx5ID0gMSkge1xuICAgIHJldHVybiB0aGlzLnRpbGVJc0ZyZWUodGlsZS54ICsgZGlyZWN0aW9uLnggKiBtdWx0aXBseSwgdGlsZS55ICsgZGlyZWN0aW9uLnkgKiBtdWx0aXBseSlcbiAgfVxuXG4gIHRpbGVJc0ZyZWUgKHgsIHkpIHtcbiAgICB2YXIgdGlsZVxuICAgIHRpbGUgPSB0aGlzLnBsYW4uZ2V0VGlsZSh4LCB5KVxuICAgIGlmICgodGlsZSAhPSBudWxsKSAmJiBpbmRleE9mLmNhbGwodGhpcy5mcmVlLCB0aWxlKSA+PSAwKSB7XG4gICAgICByZXR1cm4gdGlsZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICByYW5kb21GcmVlVGlsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJlZVtNYXRoLmZsb29yKHRoaXMucm5nKCkgKiB0aGlzLmZyZWUubGVuZ3RoKV1cbiAgfVxufTtcblxuUm9vbUdlbmVyYXRvci5wcm9wZXJ0aWVzKHtcbiAgdGlsZUNvbnRhaW5lcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBUaWxlQ29udGFpbmVyKClcbiAgICB9XG4gIH0sXG4gIHJuZzoge1xuICAgIGRlZmF1bHQ6IE1hdGgucmFuZG9tXG4gIH0sXG4gIG1heFZvbHVtZToge1xuICAgIGRlZmF1bHQ6IDI1XG4gIH0sXG4gIG1pblZvbHVtZToge1xuICAgIGRlZmF1bHQ6IDUwXG4gIH0sXG4gIHdpZHRoOiB7XG4gICAgZGVmYXVsdDogMzBcbiAgfSxcbiAgaGVpZ2h0OiB7XG4gICAgZGVmYXVsdDogMTVcbiAgfSxcbiAgcGxhbjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgdGlsZXMgPSBuZXcgVGlsZUNvbnRhaW5lcigpXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICB0aWxlcy5hZGRUaWxlKG5ldyBUaWxlKHgsIHkpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGlsZXNcbiAgICB9XG4gIH1cbn0pXG5cblJvb21HZW5lcmF0b3IuUm9vbSA9IGNsYXNzIFJvb20ge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy50aWxlcyA9IFtdXG4gICAgdGhpcy53YWxscyA9IFtdXG4gICAgdGhpcy5kb29ycyA9IFtdXG4gIH1cblxuICBhZGRUaWxlICh0aWxlKSB7XG4gICAgdGhpcy50aWxlcy5wdXNoKHRpbGUpXG4gICAgdGlsZS5yb29tID0gdGhpc1xuICB9XG5cbiAgY29udGFpbnNXYWxsICh0aWxlKSB7XG4gICAgdmFyIGssIGxlbiwgcmVmLCB3YWxsXG4gICAgcmVmID0gdGhpcy53YWxsc1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgd2FsbCA9IHJlZltrXVxuICAgICAgaWYgKHdhbGwudGlsZSA9PT0gdGlsZSkge1xuICAgICAgICByZXR1cm4gd2FsbFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGFkZFdhbGwgKHRpbGUsIG5leHRSb29tKSB7XG4gICAgdmFyIGV4aXN0aW5nXG4gICAgZXhpc3RpbmcgPSB0aGlzLmNvbnRhaW5zV2FsbCh0aWxlKVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcubmV4dFJvb20gPSBuZXh0Um9vbVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndhbGxzLnB1c2goe1xuICAgICAgICB0aWxlOiB0aWxlLFxuICAgICAgICBuZXh0Um9vbTogbmV4dFJvb21cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgd2FsbHNCeVJvb21zICgpIHtcbiAgICB2YXIgaywgbGVuLCBwb3MsIHJlZiwgcmVzLCByb29tcywgd2FsbFxuICAgIHJvb21zID0gW11cbiAgICByZXMgPSBbXVxuICAgIHJlZiA9IHRoaXMud2FsbHNcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHdhbGwgPSByZWZba11cbiAgICAgIHBvcyA9IHJvb21zLmluZGV4T2Yod2FsbC5uZXh0Um9vbSlcbiAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgIHBvcyA9IHJvb21zLmxlbmd0aFxuICAgICAgICByb29tcy5wdXNoKHdhbGwubmV4dFJvb20pXG4gICAgICAgIHJlcy5wdXNoKHtcbiAgICAgICAgICByb29tOiB3YWxsLm5leHRSb29tLFxuICAgICAgICAgIHRpbGVzOiBbXVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgcmVzW3Bvc10udGlsZXMucHVzaCh3YWxsLnRpbGUpXG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGFkZERvb3IgKHRpbGUsIG5leHRSb29tKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9vcnMucHVzaCh7XG4gICAgICB0aWxlOiB0aWxlLFxuICAgICAgbmV4dFJvb206IG5leHRSb29tXG4gICAgfSlcbiAgfVxuXG4gIGRvb3JzRm9yUm9vbSAocm9vbSkge1xuICAgIHJldHVybiB0aGlzLmRvb3JzXG4gICAgICAuZmlsdGVyKChkb29yKSA9PiBkb29yLm5leHRSb29tID09PSByb29tKVxuICAgICAgLm1hcCgoZG9vcikgPT4gZG9vci50aWxlKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vbUdlbmVyYXRvclxuIiwiY29uc3QgVGlsZSA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5UaWxlXG5jb25zdCBSb29tR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9Sb29tR2VuZXJhdG9yJylcbmNvbnN0IEFpcmxvY2tHZW5lcmF0b3IgPSByZXF1aXJlKCcuL0FpcmxvY2tHZW5lcmF0b3InKVxuY29uc3QgRmxvb3IgPSByZXF1aXJlKCcuLi9GbG9vcicpXG5jb25zdCBEb29yID0gcmVxdWlyZSgnLi4vQXV0b21hdGljRG9vcicpXG5jb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IERpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb25cblxuY2xhc3MgU2hpcEludGVyaW9yR2VuZXJhdG9yIGV4dGVuZHMgRWxlbWVudCB7XG4gIGdlbmVyYXRlICgpIHtcbiAgICB0aGlzLnJvb21HZW5lcmF0b3IuZ2VuZXJhdGUoKVxuXG4gICAgdGhpcy5haXJsb2NrR2VuZXJhdG9ycy5mb3JFYWNoKChhaXJsb2NrR2VuKSA9PiB7XG4gICAgICBhaXJsb2NrR2VuLmdlbmVyYXRlKClcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXMuc2hpcEludGVyaW9yXG4gIH1cblxuICB3YWxsRmFjdG9yeSAob3B0KSB7XG4gICAgcmV0dXJuIChuZXcgVGlsZShvcHQueCwgb3B0LnkpKS50YXAoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy53YWxrYWJsZSA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGZsb29yRmFjdG9yeSAob3B0KSB7XG4gICAgcmV0dXJuIG5ldyBGbG9vcihvcHQueCwgb3B0LnkpXG4gIH1cblxuICBkb29yRmFjdG9yeSAob3B0KSB7XG4gICAgcmV0dXJuIChuZXcgRmxvb3Iob3B0LngsIG9wdC55KSkudGFwKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRkQ2hpbGQobmV3IERvb3Ioe1xuICAgICAgICBkaXJlY3Rpb246IG9wdC5kaXJlY3Rpb25cbiAgICAgIH0pKVxuICAgIH0pXG4gIH1cbn1cblxuU2hpcEludGVyaW9yR2VuZXJhdG9yLnByb3BlcnRpZXMoe1xuICBzaGlwSW50ZXJpb3I6IHtcbiAgfSxcbiAgcm5nOiB7XG4gICAgZGVmYXVsdDogTWF0aC5yYW5kb21cbiAgfSxcbiAgcm9vbUdlbmVyYXRvcjoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3Qgcm9vbUdlbiA9IG5ldyBSb29tR2VuZXJhdG9yKHtcbiAgICAgICAgdGlsZUNvbnRhaW5lcjogdGhpcy5zaGlwSW50ZXJpb3IsXG4gICAgICAgIHJuZzogdGhpcy5ybmdcbiAgICAgIH0pXG4gICAgICByb29tR2VuLndhbGxGYWN0b3J5ID0gdGhpcy53YWxsRmFjdG9yeVxuICAgICAgcm9vbUdlbi5mbG9vckZhY3RvcnkgPSB0aGlzLmZsb29yRmFjdG9yeVxuICAgICAgcm9vbUdlbi5kb29yRmFjdG9yeSA9IHRoaXMuZG9vckZhY3RvcnlcbiAgICAgIHJldHVybiByb29tR2VuXG4gICAgfVxuICB9LFxuICBhaXJsb2NrR2VuZXJhdG9yczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbmV3IEFpcmxvY2tHZW5lcmF0b3Ioe1xuICAgICAgICAgIHRpbGVDb250YWluZXI6IHRoaXMuc2hpcEludGVyaW9yLFxuICAgICAgICAgIHJuZzogdGhpcy5ybmcsXG4gICAgICAgICAgZGlyZWN0aW9uOiBEaXJlY3Rpb24udXBcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBBaXJsb2NrR2VuZXJhdG9yKHtcbiAgICAgICAgICB0aWxlQ29udGFpbmVyOiB0aGlzLnNoaXBJbnRlcmlvcixcbiAgICAgICAgICBybmc6IHRoaXMucm5nLFxuICAgICAgICAgIGRpcmVjdGlvbjogRGlyZWN0aW9uLmRvd25cbiAgICAgICAgfSlcbiAgICAgIF1cbiAgICB9XG4gIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcEludGVyaW9yR2VuZXJhdG9yXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IE1hcCA9IHJlcXVpcmUoJy4uL01hcCcpXG5jb25zdCBTdGFyU3lzdGVtID0gcmVxdWlyZSgnLi4vU3RhclN5c3RlbScpXG5jb25zdCBzdGFyTmFtZXMgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXN0cmluZ3MnKS5zdGFyTmFtZXNcblxuY2xhc3MgU3Rhck1hcEdlbmVyYXRvciBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm9wdCA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmT3B0LCBvcHRpb25zKVxuICB9XG5cbiAgZ2VuZXJhdGUgKCkge1xuICAgIGNvbnN0IE1hcENsYXNzID0gdGhpcy5vcHQubWFwQ2xhc3NcbiAgICB0aGlzLm1hcCA9IG5ldyBNYXBDbGFzcygpXG4gICAgdGhpcy5zdGFycyA9IHRoaXMubWFwLmxvY2F0aW9ucy5jb3B5KClcbiAgICB0aGlzLmxpbmtzID0gW11cbiAgICB0aGlzLmNyZWF0ZVN0YXJzKHRoaXMub3B0Lm5iU3RhcnMpXG4gICAgdGhpcy5tYWtlTGlua3MoKVxuICAgIHJldHVybiB0aGlzLm1hcFxuICB9XG5cbiAgY3JlYXRlU3RhcnMgKG5iKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oQXJyYXkobmIpLCAoKSA9PiB0aGlzLmNyZWF0ZVN0YXIoKSlcbiAgfVxuXG4gIGNyZWF0ZVN0YXIgKG9wdCA9IHt9KSB7XG4gICAgdmFyIG5hbWUsIHBvcywgc3RhclxuICAgIGlmICghKG9wdC54ICYmIG9wdC55KSkge1xuICAgICAgcG9zID0gdGhpcy5yYW5kb21TdGFyUG9zKClcbiAgICAgIGlmIChwb3MgIT0gbnVsbCkge1xuICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKHt9LCBvcHQsIHtcbiAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICB5OiBwb3MueVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvcHQubmFtZSkge1xuICAgICAgbmFtZSA9IHRoaXMucmFuZG9tU3Rhck5hbWUoKVxuICAgICAgaWYgKG5hbWUgIT0gbnVsbCkge1xuICAgICAgICBvcHQgPSBPYmplY3QuYXNzaWduKHt9LCBvcHQsIHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBTdGFyQ2xhc3MgPSB0aGlzLm9wdC5zdGFyQ2xhc3NcbiAgICBzdGFyID0gbmV3IFN0YXJDbGFzcyhvcHQpXG4gICAgdGhpcy5tYXAubG9jYXRpb25zLnB1c2goc3RhcilcbiAgICB0aGlzLnN0YXJzLnB1c2goc3RhcilcbiAgICByZXR1cm4gc3RhclxuICB9XG5cbiAgcmFuZG9tU3RhclBvcyAoKSB7XG4gICAgdmFyIGosIHBvc1xuICAgIGogPSAwXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHBvcyA9IHtcbiAgICAgICAgeDogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhYIC0gdGhpcy5vcHQubWluWCkgKyB0aGlzLm9wdC5taW5YKSxcbiAgICAgICAgeTogTWF0aC5mbG9vcih0aGlzLm9wdC5ybmcoKSAqICh0aGlzLm9wdC5tYXhZIC0gdGhpcy5vcHQubWluWSkgKyB0aGlzLm9wdC5taW5ZKVxuICAgICAgfVxuICAgICAgaWYgKCEoaiA8IDEwICYmIHRoaXMuc3RhcnMuZmluZCgoc3RhcikgPT4ge1xuICAgICAgICByZXR1cm4gc3Rhci5kaXN0KHBvcy54LCBwb3MueSkgPD0gdGhpcy5vcHQubWluU3RhckRpc3RcbiAgICAgIH0pKSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaisrXG4gICAgfVxuICAgIGlmICghKGogPj0gMTApKSB7XG4gICAgICByZXR1cm4gcG9zXG4gICAgfVxuICB9XG5cbiAgcmFuZG9tU3Rhck5hbWUgKCkge1xuICAgIHZhciBuYW1lLCBwb3MsIHJlZlxuICAgIGlmICgocmVmID0gdGhpcy5vcHQuc3Rhck5hbWVzKSAhPSBudWxsID8gcmVmLmxlbmd0aCA6IG51bGwpIHtcbiAgICAgIHBvcyA9IE1hdGguZmxvb3IodGhpcy5vcHQucm5nKCkgKiB0aGlzLm9wdC5zdGFyTmFtZXMubGVuZ3RoKVxuICAgICAgbmFtZSA9IHRoaXMub3B0LnN0YXJOYW1lc1twb3NdXG4gICAgICB0aGlzLm9wdC5zdGFyTmFtZXMuc3BsaWNlKHBvcywgMSlcbiAgICAgIHJldHVybiBuYW1lXG4gICAgfVxuICB9XG5cbiAgbWFrZUxpbmtzICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFycy5mb3JFYWNoKChzdGFyKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5tYWtlTGlua3NGcm9tKHN0YXIpXG4gICAgfSlcbiAgfVxuXG4gIG1ha2VMaW5rc0Zyb20gKHN0YXIpIHtcbiAgICB2YXIgY2xvc2UsIGNsb3Nlc3RzLCBsaW5rLCBuZWVkZWQsIHJlc3VsdHMsIHRyaWVzXG4gICAgdHJpZXMgPSB0aGlzLm9wdC5saW5rVHJpZXNcbiAgICBuZWVkZWQgPSB0aGlzLm9wdC5saW5rc0J5U3RhcnMgLSBzdGFyLmxpbmtzLmNvdW50KClcbiAgICBpZiAobmVlZGVkID4gMCkge1xuICAgICAgY2xvc2VzdHMgPSB0aGlzLnN0YXJzLmZpbHRlcigoc3RhcjIpID0+IHtcbiAgICAgICAgcmV0dXJuIHN0YXIyICE9PSBzdGFyICYmICFzdGFyLmxpbmtzLmZpbmRTdGFyKHN0YXIyKVxuICAgICAgfSkuY2xvc2VzdHMoc3Rhci54LCBzdGFyLnkpXG4gICAgICBpZiAoY2xvc2VzdHMuY291bnQoKSA+IDApIHtcbiAgICAgICAgcmVzdWx0cyA9IFtdXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY2xvc2UgPSBjbG9zZXN0cy5zaGlmdCgpXG4gICAgICAgICAgbGluayA9IHRoaXMuY3JlYXRlTGluayhzdGFyLCBjbG9zZSlcbiAgICAgICAgICBpZiAodGhpcy52YWxpZGF0ZUxpbmsobGluaykpIHtcbiAgICAgICAgICAgIHRoaXMubGlua3MucHVzaChsaW5rKVxuICAgICAgICAgICAgc3Rhci5hZGRMaW5rKGxpbmspXG4gICAgICAgICAgICBuZWVkZWQgLT0gMVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmllcyAtPSAxXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghKG5lZWRlZCA+IDAgJiYgdHJpZXMgPiAwICYmIGNsb3Nlc3RzLmNvdW50KCkgPiAwKSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG51bGwpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlTGluayAoc3RhcjEsIHN0YXIyKSB7XG4gICAgY29uc3QgTGlua0NsYXNzID0gdGhpcy5vcHQubGlua0NsYXNzXG4gICAgcmV0dXJuIG5ldyBMaW5rQ2xhc3Moc3RhcjEsIHN0YXIyKVxuICB9XG5cbiAgdmFsaWRhdGVMaW5rIChsaW5rKSB7XG4gICAgcmV0dXJuICF0aGlzLnN0YXJzLmZpbmQoKHN0YXIpID0+IHtcbiAgICAgIHJldHVybiBzdGFyICE9PSBsaW5rLnN0YXIxICYmIHN0YXIgIT09IGxpbmsuc3RhcjIgJiYgbGluay5jbG9zZVRvUG9pbnQoc3Rhci54LCBzdGFyLnksIHRoaXMub3B0Lm1pbkxpbmtEaXN0KVxuICAgIH0pICYmICF0aGlzLmxpbmtzLmZpbmQoKGxpbmsyKSA9PiB7XG4gICAgICByZXR1cm4gbGluazIuaW50ZXJzZWN0TGluayhsaW5rKVxuICAgIH0pXG4gIH1cbn07XG5cblN0YXJNYXBHZW5lcmF0b3IucHJvdG90eXBlLmRlZk9wdCA9IHtcbiAgbmJTdGFyczogMjAsXG4gIG1pblg6IDAsXG4gIG1heFg6IDUwMCxcbiAgbWluWTogMCxcbiAgbWF4WTogNTAwLFxuICBtaW5TdGFyRGlzdDogMjAsXG4gIG1pbkxpbmtEaXN0OiAyMCxcbiAgbGlua3NCeVN0YXJzOiAzLFxuICBsaW5rVHJpZXM6IDMsXG4gIG1hcENsYXNzOiBNYXAsXG4gIHN0YXJDbGFzczogU3RhclN5c3RlbSxcbiAgbGlua0NsYXNzOiBTdGFyU3lzdGVtLkxpbmssXG4gIHJuZzogTWF0aC5yYW5kb20sXG4gIHN0YXJOYW1lczogc3Rhck5hbWVzXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3Rhck1hcEdlbmVyYXRvclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiQWlybG9ja1wiOiByZXF1aXJlKFwiLi9BaXJsb2NrXCIpLFxuICBcIkFwcHJvYWNoXCI6IHJlcXVpcmUoXCIuL0FwcHJvYWNoXCIpLFxuICBcIkF1dG9tYXRpY0Rvb3JcIjogcmVxdWlyZShcIi4vQXV0b21hdGljRG9vclwiKSxcbiAgXCJDaGFyYWN0ZXJcIjogcmVxdWlyZShcIi4vQ2hhcmFjdGVyXCIpLFxuICBcIkNoYXJhY3RlckFJXCI6IHJlcXVpcmUoXCIuL0NoYXJhY3RlckFJXCIpLFxuICBcIkNvbmZyb250YXRpb25cIjogcmVxdWlyZShcIi4vQ29uZnJvbnRhdGlvblwiKSxcbiAgXCJEYW1hZ2VhYmxlXCI6IHJlcXVpcmUoXCIuL0RhbWFnZWFibGVcIiksXG4gIFwiRGFtYWdlUHJvcGFnYXRpb25cIjogcmVxdWlyZShcIi4vRGFtYWdlUHJvcGFnYXRpb25cIiksXG4gIFwiRG9vclwiOiByZXF1aXJlKFwiLi9Eb29yXCIpLFxuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJFbmNvdW50ZXJNYW5hZ2VyXCI6IHJlcXVpcmUoXCIuL0VuY291bnRlck1hbmFnZXJcIiksXG4gIFwiRmxvb3JcIjogcmVxdWlyZShcIi4vRmxvb3JcIiksXG4gIFwiR2FtZVwiOiByZXF1aXJlKFwiLi9HYW1lXCIpLFxuICBcIkludmVudG9yeVwiOiByZXF1aXJlKFwiLi9JbnZlbnRvcnlcIiksXG4gIFwiTGluZU9mU2lnaHRcIjogcmVxdWlyZShcIi4vTGluZU9mU2lnaHRcIiksXG4gIFwiTWFwXCI6IHJlcXVpcmUoXCIuL01hcFwiKSxcbiAgXCJPYnN0YWNsZVwiOiByZXF1aXJlKFwiLi9PYnN0YWNsZVwiKSxcbiAgXCJQYXRoV2Fsa1wiOiByZXF1aXJlKFwiLi9QYXRoV2Fsa1wiKSxcbiAgXCJQZXJzb25hbFdlYXBvblwiOiByZXF1aXJlKFwiLi9QZXJzb25hbFdlYXBvblwiKSxcbiAgXCJQbGF5ZXJcIjogcmVxdWlyZShcIi4vUGxheWVyXCIpLFxuICBcIlByb2plY3RpbGVcIjogcmVxdWlyZShcIi4vUHJvamVjdGlsZVwiKSxcbiAgXCJSZXNzb3VyY2VcIjogcmVxdWlyZShcIi4vUmVzc291cmNlXCIpLFxuICBcIlJlc3NvdXJjZVR5cGVcIjogcmVxdWlyZShcIi4vUmVzc291cmNlVHlwZVwiKSxcbiAgXCJTaGlwXCI6IHJlcXVpcmUoXCIuL1NoaXBcIiksXG4gIFwiU2hpcEludGVyaW9yXCI6IHJlcXVpcmUoXCIuL1NoaXBJbnRlcmlvclwiKSxcbiAgXCJTaGlwV2VhcG9uXCI6IHJlcXVpcmUoXCIuL1NoaXBXZWFwb25cIiksXG4gIFwiU3RhclN5c3RlbVwiOiByZXF1aXJlKFwiLi9TdGFyU3lzdGVtXCIpLFxuICBcIlRyYXZlbFwiOiByZXF1aXJlKFwiLi9UcmF2ZWxcIiksXG4gIFwiVmlld1wiOiByZXF1aXJlKFwiLi9WaWV3XCIpLFxuICBcIlZpc2lvbkNhbGN1bGF0b3JcIjogcmVxdWlyZShcIi4vVmlzaW9uQ2FsY3VsYXRvclwiKSxcbiAgXCJhY3Rpb25zXCI6IHtcbiAgICBcIkFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL0FjdGlvblwiKSxcbiAgICBcIkFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJBdHRhY2tBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9BdHRhY2tBY3Rpb25cIiksXG4gICAgXCJBdHRhY2tNb3ZlQWN0aW9uXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvQXR0YWNrTW92ZUFjdGlvblwiKSxcbiAgICBcIlNpbXBsZUFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvU2ltcGxlQWN0aW9uUHJvdmlkZXJcIiksXG4gICAgXCJUYXJnZXRBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9UYXJnZXRBY3Rpb25cIiksXG4gICAgXCJUaWxlZEFjdGlvblByb3ZpZGVyXCI6IHJlcXVpcmUoXCIuL2FjdGlvbnMvVGlsZWRBY3Rpb25Qcm92aWRlclwiKSxcbiAgICBcIlRyYXZlbEFjdGlvblwiOiByZXF1aXJlKFwiLi9hY3Rpb25zL1RyYXZlbEFjdGlvblwiKSxcbiAgICBcIldhbGtBY3Rpb25cIjogcmVxdWlyZShcIi4vYWN0aW9ucy9XYWxrQWN0aW9uXCIpLFxuICB9LFxuICBcImdlbmVyYXRvcnNcIjoge1xuICAgIFwiQWlybG9ja0dlbmVyYXRvclwiOiByZXF1aXJlKFwiLi9nZW5lcmF0b3JzL0FpcmxvY2tHZW5lcmF0b3JcIiksXG4gICAgXCJSb29tR2VuZXJhdG9yXCI6IHJlcXVpcmUoXCIuL2dlbmVyYXRvcnMvUm9vbUdlbmVyYXRvclwiKSxcbiAgICBcIlNoaXBJbnRlcmlvckdlbmVyYXRvclwiOiByZXF1aXJlKFwiLi9nZW5lcmF0b3JzL1NoaXBJbnRlcmlvckdlbmVyYXRvclwiKSxcbiAgICBcIlN0YXJNYXBHZW5lcmF0b3JcIjogcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9TdGFyTWFwR2VuZXJhdG9yXCIpLFxuICB9LFxuICBcInNhdmVFbmdpbmVzXCI6IHtcbiAgICBcIkxvYWRlckNvbGxlY3Rpb25cIjogcmVxdWlyZShcIi4vc2F2ZUVuZ2luZXMvTG9hZGVyQ29sbGVjdGlvblwiKSxcbiAgICBcIlNpbXBsZUxvYWRlclwiOiByZXF1aXJlKFwiLi9zYXZlRW5naW5lcy9TaW1wbGVMb2FkZXJcIiksXG4gICAgXCJTaW1wbGVTYXZhYmxlXCI6IHJlcXVpcmUoXCIuL3NhdmVFbmdpbmVzL1NpbXBsZVNhdmFibGVcIiksXG4gIH0sXG59IiwiY29uc3QgbGlicyA9IHJlcXVpcmUoJy4vbGlicycpXG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgbGlicywge1xuICBncmlkczogcmVxdWlyZSgncGFyYWxsZWxpby1ncmlkcycpLFxuICBQYXRoRmluZGVyOiByZXF1aXJlKCdwYXJhbGxlbGlvLXBhdGhmaW5kZXInKSxcbiAgc3RyaW5nczogcmVxdWlyZSgncGFyYWxsZWxpby1zdHJpbmdzJyksXG4gIHRpbGVzOiByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJyksXG4gIFRpbWluZzogcmVxdWlyZSgncGFyYWxsZWxpby10aW1pbmcnKSxcbiAgd2lyaW5nOiByZXF1aXJlKCdwYXJhbGxlbGlvLXdpcmluZycpLFxuICBTcGFyazogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpXG59KVxuIiwiY29uc3QgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5Db2xsZWN0aW9uXHJcblxyXG5jbGFzcyBMb2FkZXJDb2xsZWN0aW9uIGV4dGVuZHMgQ29sbGVjdGlvbiB7XHJcbiAgbG9hZCAoZGF0YSkge1xyXG4gICAgcmV0dXJuIGRhdGEubWFwKGVsZW0gPT4ge1xyXG4gICAgICBjb25zdCBsb2FkZXIgPSB0aGlzLmxvYWRlcnMuZmluZChsID0+IGwubWF0Y2goZWxlbSkpXHJcbiAgICAgIGlmIChsb2FkZXIpIHtcclxuICAgICAgICBsb2FkZXIubG9hZChlbGVtKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkZXJDb2xsZWN0aW9uXHJcbiIsIlxuY2xhc3MgU2ltcGxlTG9hZGVyIHtcbiAgY29uc3RydWN0b3IgKGNvbnN0cnVjdCwgYWxpYXMgPSBudWxsKSB7XG4gICAgdGhpcy5jb25zdHJ1Y3QgPSBjb25zdHJ1Y3RcbiAgICB0aGlzLmFsaWFzID0gYWxpYXMgfHwgY29uc3RydWN0Lm5hbWVcbiAgfVxuXG4gIHJlZ2lzdGVyIChnYW1lKSB7XG4gICAgZ2FtZS5sb2FkZXJzLmFkZCh0aGlzKVxuICB9XG5cbiAgbWF0Y2ggKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS50eXBlQWxpYXMgPT09IHRoaXMuYWxpYXNcbiAgfVxuXG4gIGxvYWQgKGRhdGEpIHtcbiAgICBjb25zdCBDb25zdHJ1Y3QgPSB0aGlzLmNvbnN0cnVjdFxuICAgIHJldHVybiBuZXcgQ29uc3RydWN0KGRhdGEpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVMb2FkZXJcbiIsIlxuY29uc3QgU2ltcGxlTG9hZGVyID0gcmVxdWlyZSgnLi9TaW1wbGVMb2FkZXInKVxuXG5jbGFzcyBTaW1wbGVTYXZhYmxlIHtcbiAgY29uc3RydWN0b3IgKG9iaiwgYWxpYXMgPSBudWxsLCBsb2FkZXIgPSBudWxsKSB7XG4gICAgdGhpcy5vYmogPSBvYmpcbiAgICB0aGlzLmFsaWFzID0gYWxpYXMgfHwgb2JqLmNvbnN0cnVjdG9yLm5hbWVcbiAgICB0aGlzLmxvYWRlciA9IGxvYWRlclxuICB9XG5cbiAgbWFrZURlZmF1bHRMb2FkZXIgKCkge1xuICAgIGlmICghdGhpcy5vYmouY29uc3RydWN0b3IubG9hZGVyKSB7XG4gICAgICB0aGlzLm9iai5jb25zdHJ1Y3Rvci5sb2FkZXIgPSBuZXcgU2ltcGxlTG9hZGVyKHRoaXMub2JqLmNvbnN0cnVjdG9yLCB0aGlzLmFsaWFzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vYmouY29uc3RydWN0b3IubG9hZGVyXG4gIH1cblxuICByZWdpc3RlciAoZ2FtZSkge1xuICAgIGlmICghdGhpcy5sb2FkZXIpIHtcbiAgICAgIHRoaXMubG9hZGVyID0gdGhpcy5tYWtlRGVmYXVsdExvYWRlcigpXG4gICAgfVxuICAgIHRoaXMubG9hZGVyLnJlZ2lzdGVyKGdhbWUpXG4gICAgZ2FtZS5zYXZhYmxlcy5hZGQodGhpcylcbiAgfVxuXG4gIGdldFJhd0RhdGEgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5vYmouZ2V0U2F2ZURhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLm9iai5nZXRTYXZlRGF0YSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLm9iai5wcm9wZXJ0aWVzTWFuYWdlci5nZXRNYW51YWxEYXRhUHJvcGVydGllcygpXG4gIH1cblxuICBnZXRTYXZlRGF0YSAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAgICB7IHR5cGVBbGlhczogdGhpcy5hbGlhcyB9LFxuICAgICAgdGhpcy5nZXRSYXdEYXRhKClcbiAgICApXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVTYXZhYmxlXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgb2JqZWN0Q3JlYXRlUG9seWZpbGxcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1BvbHlmaWxsXG52YXIgYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uQmluZFBvbHlmaWxsXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbnZhciBoYXNEZWZpbmVQcm9wZXJ0eTtcbnRyeSB7XG4gIHZhciBvID0ge307XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCAneCcsIHsgdmFsdWU6IDAgfSk7XG4gIGhhc0RlZmluZVByb3BlcnR5ID0gby54ID09PSAwO1xufSBjYXRjaCAoZXJyKSB7IGhhc0RlZmluZVByb3BlcnR5ID0gZmFsc2UgfVxuaWYgKGhhc0RlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGlucHV0IGlzIGEgcG9zaXRpdmUgbnVtYmVyICh3aG9zZSB2YWx1ZSBpcyB6ZXJvIG9yXG4gICAgICAvLyBncmVhdGVyIGFuZCBub3QgYSBOYU4pLlxuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgYXJnICE9PSBhcmcpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZGVmYXVsdE1heExpc3RlbmVyc1wiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcIm5cIiBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gJGdldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbi8vIFRoZXNlIHN0YW5kYWxvbmUgZW1pdCogZnVuY3Rpb25zIGFyZSB1c2VkIHRvIG9wdGltaXplIGNhbGxpbmcgb2YgZXZlbnRcbi8vIGhhbmRsZXJzIGZvciBmYXN0IGNhc2VzIGJlY2F1c2UgZW1pdCgpIGl0c2VsZiBvZnRlbiBoYXMgYSB2YXJpYWJsZSBudW1iZXIgb2Zcbi8vIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGJlY2F1c2Ugb2YgdGhhdC4gVGhlc2UgZnVuY3Rpb25zIGFsd2F5cyBoYXZlXG4vLyB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCB0aHVzIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQsIHNvIHRoZSBjb2RlXG4vLyBpbnNpZGUgdGhlbSBjYW4gZXhlY3V0ZSBmYXN0ZXIuXG5mdW5jdGlvbiBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJncykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgZXZlbnRzO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PSBudWxsKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgY2FzZSAxOlxuICAgICAgZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmICghZXZlbnRzKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgbSA9ICRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICAgIGlmIChtICYmIG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnIFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0LicpO1xuICAgICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignJXM6ICVzJywgdy5uYW1lLCB3Lm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0pO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzJdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpXG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IGJpbmQuY2FsbChvbmNlV3JhcHBlciwgc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmICghbGlzdClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoIWV2bGlzdGVuZXIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/IHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbi8vIEFib3V0IDEuNXggZmFzdGVyIHRoYW4gdGhlIHR3by1hcmcgdmVyc2lvbiBvZiBBcnJheSNzcGxpY2UoKS5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKHZhciBpID0gaW5kZXgsIGsgPSBpICsgMSwgbiA9IGxpc3QubGVuZ3RoOyBrIDwgbjsgaSArPSAxLCBrICs9IDEpXG4gICAgbGlzdFtpXSA9IGxpc3Rba107XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0Q3JlYXRlUG9seWZpbGwocHJvdG8pIHtcbiAgdmFyIEYgPSBmdW5jdGlvbigpIHt9O1xuICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICByZXR1cm4gbmV3IEY7XG59XG5mdW5jdGlvbiBvYmplY3RLZXlzUG9seWZpbGwob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHtcbiAgICBrZXlzLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIGs7XG59XG5mdW5jdGlvbiBmdW5jdGlvbkJpbmRQb2x5ZmlsbChjb250ZXh0KSB7XG4gIHZhciBmbiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEdyaWQ9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO0dyaWQuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1HcmlkO31lbHNle2lmKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIiYmUGFyYWxsZWxpbyE9PW51bGwpe1BhcmFsbGVsaW8uR3JpZD1HcmlkO31lbHNle2lmKHRoaXMuUGFyYWxsZWxpbz09bnVsbCl7dGhpcy5QYXJhbGxlbGlvPXt9O310aGlzLlBhcmFsbGVsaW8uR3JpZD1HcmlkO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIEV2ZW50RW1pdHRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkV2ZW50RW1pdHRlclwiKSA/IGRlcGVuZGVuY2llcy5FdmVudEVtaXR0ZXIgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRXZlbnRFbWl0dGVyO1xudmFyIEdyaWRDZWxsID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiR3JpZENlbGxcIikgPyBkZXBlbmRlbmNpZXMuR3JpZENlbGwgOiByZXF1aXJlKCcuL0dyaWRDZWxsJyk7XG52YXIgR3JpZFJvdyA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkdyaWRSb3dcIikgPyBkZXBlbmRlbmNpZXMuR3JpZFJvdyA6IHJlcXVpcmUoJy4vR3JpZFJvdycpO1xudmFyIEdyaWQ7XG5HcmlkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHcmlkIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgYWRkQ2VsbChjZWxsID0gbnVsbCkge1xuICAgICAgdmFyIHJvdywgc3BvdDtcbiAgICAgIGlmICghY2VsbCkge1xuICAgICAgICBjZWxsID0gbmV3IEdyaWRDZWxsKCk7XG4gICAgICB9XG4gICAgICBzcG90ID0gdGhpcy5nZXRGcmVlU3BvdCgpO1xuICAgICAgcm93ID0gdGhpcy5yb3dzLmdldChzcG90LnJvdyk7XG4gICAgICBpZiAoIXJvdykge1xuICAgICAgICByb3cgPSB0aGlzLmFkZFJvdygpO1xuICAgICAgfVxuICAgICAgcm93LmFkZENlbGwoY2VsbCk7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG5cbiAgICBhZGRSb3cocm93ID0gbnVsbCkge1xuICAgICAgaWYgKCFyb3cpIHtcbiAgICAgICAgcm93ID0gbmV3IEdyaWRSb3coKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucm93cy5wdXNoKHJvdyk7XG4gICAgICByZXR1cm4gcm93O1xuICAgIH1cblxuICAgIGdldEZyZWVTcG90KCkge1xuICAgICAgdmFyIHNwb3Q7XG4gICAgICBzcG90ID0gbnVsbDtcbiAgICAgIHRoaXMucm93cy5zb21lKChyb3cpID0+IHtcbiAgICAgICAgaWYgKHJvdy5jZWxscy5sZW5ndGggPCB0aGlzLm1heENvbHVtbnMpIHtcbiAgICAgICAgICByZXR1cm4gc3BvdCA9IHtcbiAgICAgICAgICAgIHJvdzogcm93LnJvd1Bvc2l0aW9uLFxuICAgICAgICAgICAgY29sdW1uOiByb3cuY2VsbHMubGVuZ3RoXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIXNwb3QpIHtcbiAgICAgICAgaWYgKHRoaXMubWF4Q29sdW1ucyA+IHRoaXMucm93cy5sZW5ndGgpIHtcbiAgICAgICAgICBzcG90ID0ge1xuICAgICAgICAgICAgcm93OiB0aGlzLnJvd3MubGVuZ3RoLFxuICAgICAgICAgICAgY29sdW1uOiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcG90ID0ge1xuICAgICAgICAgICAgcm93OiAwLFxuICAgICAgICAgICAgY29sdW1uOiB0aGlzLm1heENvbHVtbnMgKyAxXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNwb3Q7XG4gICAgfVxuXG4gIH07XG5cbiAgR3JpZC5leHRlbmQoRXZlbnRFbWl0dGVyKTtcblxuICBHcmlkLnByb3BlcnRpZXMoe1xuICAgIHJvd3M6IHtcbiAgICAgIGNvbGxlY3Rpb246IHRydWUsXG4gICAgICBpdGVtQWRkZWQ6IGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gcm93LmdyaWQgPSB0aGlzO1xuICAgICAgfSxcbiAgICAgIGl0ZW1SZW1vdmVkOiBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgaWYgKHJvdy5ncmlkID09PSB0aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIHJvdy5ncmlkID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbWF4Q29sdW1uczoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICB2YXIgcm93cztcbiAgICAgICAgcm93cyA9IGludmFsaWRhdG9yLnByb3AoJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJvd3MucmVkdWNlKGZ1bmN0aW9uKG1heCwgcm93KSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGgubWF4KG1heCwgaW52YWxpZGF0b3IucHJvcCgnY2VsbHMnLCByb3cpLmxlbmd0aCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEdyaWQ7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihHcmlkKTt9KTsiLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEdyaWRDZWxsPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtHcmlkQ2VsbC5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUdyaWRDZWxsO31lbHNle2lmKHR5cGVvZiBQYXJhbGxlbGlvIT09XCJ1bmRlZmluZWRcIiYmUGFyYWxsZWxpbyE9PW51bGwpe1BhcmFsbGVsaW8uR3JpZENlbGw9R3JpZENlbGw7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5HcmlkQ2VsbD1HcmlkQ2VsbDt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBFdmVudEVtaXR0ZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFdmVudEVtaXR0ZXJcIikgPyBkZXBlbmRlbmNpZXMuRXZlbnRFbWl0dGVyIDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcbnZhciBHcmlkQ2VsbDtcbkdyaWRDZWxsID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHcmlkQ2VsbCBleHRlbmRzIEVsZW1lbnQge307XG5cbiAgR3JpZENlbGwuZXh0ZW5kKEV2ZW50RW1pdHRlcik7XG5cbiAgR3JpZENlbGwucHJvcGVydGllcyh7XG4gICAgZ3JpZDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnZ3JpZCcsIGludmFsaWRhdG9yLnByb3AoJ3JvdycpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJvdzoge30sXG4gICAgY29sdW1uUG9zaXRpb246IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdmFyIHJvdztcbiAgICAgICAgcm93ID0gaW52YWxpZGF0b3IucHJvcCgncm93Jyk7XG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnY2VsbHMnLCByb3cpLmluZGV4T2YodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHdpZHRoOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiAxIC8gaW52YWxpZGF0b3IucHJvcCgnY2VsbHMnLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSkubGVuZ3RoO1xuICAgICAgfVxuICAgIH0sXG4gICAgbGVmdDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnd2lkdGgnKSAqIGludmFsaWRhdG9yLnByb3AoJ2NvbHVtblBvc2l0aW9uJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICByaWdodDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgnd2lkdGgnKSAqIChpbnZhbGlkYXRvci5wcm9wKCdjb2x1bW5Qb3NpdGlvbicpICsgMSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2hlaWdodCcsIGludmFsaWRhdG9yLnByb3AoJ3JvdycpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvcDoge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcCgndG9wJywgaW52YWxpZGF0b3IucHJvcCgncm93JykpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYm90dG9tOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdib3R0b20nLCBpbnZhbGlkYXRvci5wcm9wKCdyb3cnKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gR3JpZENlbGw7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihHcmlkQ2VsbCk7fSk7IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBHcmlkUm93PWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtHcmlkUm93LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9R3JpZFJvdzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLkdyaWRSb3c9R3JpZFJvdzt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLkdyaWRSb3c9R3JpZFJvdzt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBFdmVudEVtaXR0ZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFdmVudEVtaXR0ZXJcIikgPyBkZXBlbmRlbmNpZXMuRXZlbnRFbWl0dGVyIDogcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkV2ZW50RW1pdHRlcjtcbnZhciBHcmlkQ2VsbCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkdyaWRDZWxsXCIpID8gZGVwZW5kZW5jaWVzLkdyaWRDZWxsIDogcmVxdWlyZSgnLi9HcmlkQ2VsbCcpO1xudmFyIEdyaWRSb3c7XG5HcmlkUm93ID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBHcmlkUm93IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgYWRkQ2VsbChjZWxsID0gbnVsbCkge1xuICAgICAgaWYgKCFjZWxsKSB7XG4gICAgICAgIGNlbGwgPSBuZXcgR3JpZENlbGwoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2VsbHMucHVzaChjZWxsKTtcbiAgICAgIHJldHVybiBjZWxsO1xuICAgIH1cblxuICB9O1xuXG4gIEdyaWRSb3cuZXh0ZW5kKEV2ZW50RW1pdHRlcik7XG5cbiAgR3JpZFJvdy5wcm9wZXJ0aWVzKHtcbiAgICBncmlkOiB7fSxcbiAgICBjZWxsczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZSxcbiAgICAgIGl0ZW1BZGRlZDogZnVuY3Rpb24oY2VsbCkge1xuICAgICAgICByZXR1cm4gY2VsbC5yb3cgPSB0aGlzO1xuICAgICAgfSxcbiAgICAgIGl0ZW1SZW1vdmVkOiBmdW5jdGlvbihjZWxsKSB7XG4gICAgICAgIGlmIChjZWxsLnJvdyA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiBjZWxsLnJvdyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJvd1Bvc2l0aW9uOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciBncmlkO1xuICAgICAgICBncmlkID0gaW52YWxpZGF0b3IucHJvcCgnZ3JpZCcpO1xuICAgICAgICBpZiAoZ3JpZCkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdyb3dzJywgZ3JpZCkuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiAxIC8gaW52YWxpZGF0b3IucHJvcCgncm93cycsIGludmFsaWRhdG9yLnByb3AoJ2dyaWQnKSkubGVuZ3RoO1xuICAgICAgfVxuICAgIH0sXG4gICAgdG9wOiB7XG4gICAgICBjYWxjdWw6IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wKCdoZWlnaHQnKSAqIGludmFsaWRhdG9yLnByb3AoJ3Jvd1Bvc2l0aW9uJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBib3R0b206IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AoJ2hlaWdodCcpICogKGludmFsaWRhdG9yLnByb3AoJ3Jvd1Bvc2l0aW9uJykgKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBHcmlkUm93O1xuXG59KS5jYWxsKHRoaXMpO1xuXG5yZXR1cm4oR3JpZFJvdyk7fSk7IiwiaWYobW9kdWxlKXtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgR3JpZDogcmVxdWlyZSgnLi9HcmlkLmpzJyksXG4gICAgR3JpZENlbGw6IHJlcXVpcmUoJy4vR3JpZENlbGwuanMnKSxcbiAgICBHcmlkUm93OiByZXF1aXJlKCcuL0dyaWRSb3cuanMnKVxuICB9O1xufSIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQmluZGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtCaW5kZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1CaW5kZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5CaW5kZXI9QmluZGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQmluZGVyPUJpbmRlcjt9fX0pKGZ1bmN0aW9uKCl7XHJcbnZhciBCaW5kZXI7XHJcbkJpbmRlciA9IChmdW5jdGlvbigpIHtcclxuICBjbGFzcyBCaW5kZXIge1xyXG4gICAgYmluZCgpIHtcclxuICAgICAgaWYgKCF0aGlzLmJpbmRlZCAmJiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbCkpIHtcclxuICAgICAgICB0aGlzLmRvQmluZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmJpbmRlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBkb0JpbmQoKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XHJcbiAgICB9XHJcbiAgICB1bmJpbmQoKSB7XHJcbiAgICAgIGlmICh0aGlzLmJpbmRlZCAmJiAodGhpcy5jYWxsYmFjayAhPSBudWxsKSAmJiAodGhpcy50YXJnZXQgIT0gbnVsbCkpIHtcclxuICAgICAgICB0aGlzLmRvVW5iaW5kKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMuYmluZGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBkb1VuYmluZCgpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcclxuICAgIH1cclxuICAgIGVxdWFscyhiaW5kZXIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuY29tcGFyZVJlZmVyZWQoYmluZGVyLCB0aGlzKTtcclxuICAgIH1cclxuICAgIGdldFJlZigpIHt9XHJcbiAgICBzdGF0aWMgY29tcGFyZVJlZmVyZWQob2JqMSwgb2JqMikge1xyXG4gICAgICByZXR1cm4gb2JqMSA9PT0gb2JqMiB8fCAoKG9iajEgIT0gbnVsbCkgJiYgKG9iajIgIT0gbnVsbCkgJiYgb2JqMS5jb25zdHJ1Y3RvciA9PT0gb2JqMi5jb25zdHJ1Y3RvciAmJiB0aGlzLmNvbXBhcmVSZWYob2JqMS5yZWYsIG9iajIucmVmKSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgY29tcGFyZVJlZihyZWYxLCByZWYyKSB7XHJcbiAgICAgIHJldHVybiAocmVmMSAhPSBudWxsKSAmJiAocmVmMiAhPSBudWxsKSAmJiAocmVmMSA9PT0gcmVmMiB8fCAoQXJyYXkuaXNBcnJheShyZWYxKSAmJiBBcnJheS5pc0FycmF5KHJlZjEpICYmIHJlZjEuZXZlcnkoKHZhbCwgaSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVSZWZlcmVkKHJlZjFbaV0sIHJlZjJbaV0pO1xyXG4gICAgICB9KSkgfHwgKHR5cGVvZiByZWYxID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWYyID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5rZXlzKHJlZjEpLmpvaW4oKSA9PT0gT2JqZWN0LmtleXMocmVmMikuam9pbigpICYmIE9iamVjdC5rZXlzKHJlZjEpLmV2ZXJ5KChrZXkpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlUmVmZXJlZChyZWYxW2tleV0sIHJlZjJba2V5XSk7XHJcbiAgICAgIH0pKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQmluZGVyLnByb3RvdHlwZSwgJ3JlZicsIHtcclxuICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldFJlZigpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHJldHVybiBCaW5kZXI7XHJcbn0pLmNhbGwodGhpcyk7XHJcbnJldHVybihCaW5kZXIpO30pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0JpbmRlci5qcy5tYXBcclxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBDb2xsZWN0aW9uPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb2xsZWN0aW9uLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q29sbGVjdGlvbjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkNvbGxlY3Rpb249Q29sbGVjdGlvbjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNvbGxlY3Rpb249Q29sbGVjdGlvbjt9fX0pKGZ1bmN0aW9uKCl7XHJcbnZhciBDb2xsZWN0aW9uO1xyXG5Db2xsZWN0aW9uID0gKGZ1bmN0aW9uKCkge1xyXG4gIGNsYXNzIENvbGxlY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoYXJyKSB7XHJcbiAgICAgIGlmIChhcnIgIT0gbnVsbCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXJyLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xyXG4gICAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX2FycmF5ID0gW107XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNoYW5nZWQoKSB7fVxyXG4gICAgY2hlY2tDaGFuZ2VzKG9sZCwgb3JkZXJlZCA9IHRydWUsIGNvbXBhcmVGdW5jdGlvbiA9IG51bGwpIHtcclxuICAgICAgaWYgKGNvbXBhcmVGdW5jdGlvbiA9PSBudWxsKSB7XHJcbiAgICAgICAgY29tcGFyZUZ1bmN0aW9uID0gZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgcmV0dXJuIGEgPT09IGI7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpO1xyXG4gICAgICByZXR1cm4gdGhpcy5jb3VudCgpICE9PSBvbGQubGVuZ3RoIHx8IChvcmRlcmVkID8gdGhpcy5zb21lKGZ1bmN0aW9uKHZhbCwgaSkge1xyXG4gICAgICAgIHJldHVybiAhY29tcGFyZUZ1bmN0aW9uKG9sZC5nZXQoaSksIHZhbCk7XHJcbiAgICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uKGEpIHtcclxuICAgICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbihiKSB7XHJcbiAgICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGEsIGIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBnZXQoaSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV07XHJcbiAgICB9XHJcbiAgICBzZXQoaSwgdmFsKSB7XHJcbiAgICAgIHZhciBvbGQ7XHJcbiAgICAgIGlmICh0aGlzLl9hcnJheVtpXSAhPT0gdmFsKSB7XHJcbiAgICAgICAgb2xkID0gdGhpcy50b0FycmF5KCk7XHJcbiAgICAgICAgdGhpcy5fYXJyYXlbaV0gPSB2YWw7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxuICAgIGFkZCh2YWwpIHtcclxuICAgICAgaWYgKCF0aGlzLl9hcnJheS5pbmNsdWRlcyh2YWwpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaCh2YWwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmUodmFsKSB7XHJcbiAgICAgIHZhciBpbmRleCwgb2xkO1xyXG4gICAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKTtcclxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xyXG4gICAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlZChvbGQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBwbHVjayhmbikge1xyXG4gICAgICB2YXIgZm91bmQsIGluZGV4LCBvbGQ7XHJcbiAgICAgIGluZGV4ID0gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZuKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcclxuICAgICAgICBmb3VuZCA9IHRoaXMuX2FycmF5W2luZGV4XTtcclxuICAgICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlZChvbGQpO1xyXG4gICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdG9BcnJheSgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5LnNsaWNlKCk7XHJcbiAgICB9XHJcbiAgICBjb3VudCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBuZXdTdWJDbGFzcyhmbiwgYXJyKSB7XHJcbiAgICAgIHZhciBTdWJDbGFzcztcclxuICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBTdWJDbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpcyB7fTtcclxuICAgICAgICBPYmplY3QuYXNzaWduKFN1YkNsYXNzLnByb3RvdHlwZSwgZm4pO1xyXG4gICAgICAgIHJldHVybiBuZXcgU3ViQ2xhc3MoYXJyKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXJyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29weShhcnIpIHtcclxuICAgICAgdmFyIGNvbGw7XHJcbiAgICAgIGlmIChhcnIgPT0gbnVsbCkge1xyXG4gICAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpO1xyXG4gICAgICByZXR1cm4gY29sbDtcclxuICAgIH1cclxuICAgIGVxdWFscyhhcnIpIHtcclxuICAgICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbih2YWwsIGkpIHtcclxuICAgICAgICByZXR1cm4gYXJyW2ldID09PSB2YWw7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZ2V0QWRkZWRGcm9tKGFycikge1xyXG4gICAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICByZXR1cm4gIWFyci5pbmNsdWRlcyhpdGVtKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBnZXRSZW1vdmVkRnJvbShhcnIpIHtcclxuICAgICAgcmV0dXJuIGFyci5maWx0ZXIoKGl0ZW0pID0+IHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaW5jbHVkZXMoaXRlbSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXTtcclxuICBDb2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zID0gWydjb25jYXQnLCAnZmlsdGVyJywgJ3NsaWNlJ107XHJcbiAgQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J107XHJcbiAgQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcclxuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2FycmF5W2Z1bmN0XSguLi5hcmcpO1xyXG4gICAgfTtcclxuICB9KTtcclxuICBDb2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oZnVuY3QpIHtcclxuICAgIHJldHVybiBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiguLi5hcmcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKSk7XHJcbiAgICB9O1xyXG4gIH0pO1xyXG4gIENvbGxlY3Rpb24ud3JpdGVmdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbihmdW5jdCkge1xyXG4gICAgcmV0dXJuIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uKC4uLmFyZykge1xyXG4gICAgICB2YXIgb2xkLCByZXM7XHJcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpO1xyXG4gICAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKTtcclxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZCk7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9O1xyXG4gIH0pO1xyXG4gIHJldHVybiBDb2xsZWN0aW9uO1xyXG59KS5jYWxsKHRoaXMpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XHJcbiAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmNvdW50KCk7XHJcbiAgfVxyXG59KTtcclxuaWYgKHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgU3ltYm9sICE9PSBudWxsID8gU3ltYm9sLml0ZXJhdG9yIDogdm9pZCAwKSB7XHJcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W1N5bWJvbC5pdGVyYXRvcl0oKTtcclxuICB9O1xyXG59XHJcbnJldHVybihDb2xsZWN0aW9uKTt9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Db2xsZWN0aW9uLmpzLm1hcFxyXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEVsZW1lbnQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0VsZW1lbnQuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1FbGVtZW50O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRWxlbWVudD1FbGVtZW50O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuRWxlbWVudD1FbGVtZW50O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XHJcbnZhciBQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIlByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLlByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eScpO1xyXG52YXIgTWl4YWJsZSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk1peGFibGVcIikgPyBkZXBlbmRlbmNpZXMuTWl4YWJsZSA6IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xyXG52YXIgRWxlbWVudDtcclxuRWxlbWVudCA9IGNsYXNzIEVsZW1lbnQgZXh0ZW5kcyBNaXhhYmxlIHtcclxuICB0YXAobmFtZSkge1xyXG4gICAgdmFyIGFyZ3M7XHJcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBuYW1lLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgY2FsbGJhY2sobmFtZSkge1xyXG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrcyA9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXSA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfTtcclxuICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdLm93bmVyID0gdGhpcztcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9jYWxsYmFja3NbbmFtZV07XHJcbiAgfVxyXG5cclxuICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XHJcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBbJ19wcm9wZXJ0aWVzJ10uY29uY2F0KHRoaXMuX3Byb3BlcnRpZXMubWFwKGZ1bmN0aW9uKHByb3ApIHtcclxuICAgICAgICByZXR1cm4gcHJvcC5uYW1lO1xyXG4gICAgICB9KSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBleHRlbmRlZCh0YXJnZXQpIHtcclxuICAgIHZhciBpLCBsZW4sIG9wdGlvbnMsIHByb3BlcnR5LCByZWYsIHJlc3VsdHM7XHJcbiAgICBpZiAodGhpcy5fcHJvcGVydGllcyAhPSBudWxsKSB7XHJcbiAgICAgIHJlZiA9IHRoaXMuX3Byb3BlcnRpZXM7XHJcbiAgICAgIHJlc3VsdHMgPSBbXTtcclxuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgcHJvcGVydHkgPSByZWZbaV07XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnR5Lm9wdGlvbnMpO1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCgobmV3IFByb3BlcnR5KHByb3BlcnR5Lm5hbWUsIG9wdGlvbnMpKS5iaW5kKHRhcmdldCkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHByb3BlcnR5KHByb3AsIGRlc2MpIHtcclxuICAgIHJldHVybiAobmV3IFByb3BlcnR5KHByb3AsIGRlc2MpKS5iaW5kKHRoaXMucHJvdG90eXBlKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBwcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcclxuICAgIHZhciBkZXNjLCBwcm9wLCByZXN1bHRzO1xyXG4gICAgcmVzdWx0cyA9IFtdO1xyXG4gICAgZm9yIChwcm9wIGluIHByb3BlcnRpZXMpIHtcclxuICAgICAgZGVzYyA9IHByb3BlcnRpZXNbcHJvcF07XHJcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnByb3BlcnR5KHByb3AsIGRlc2MpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH1cclxuXHJcbn07XHJcblxyXG5yZXR1cm4oRWxlbWVudCk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRWxlbWVudC5qcy5tYXBcclxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBFdmVudEJpbmQ9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO0V2ZW50QmluZC5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUV2ZW50QmluZDt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkV2ZW50QmluZD1FdmVudEJpbmQ7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5FdmVudEJpbmQ9RXZlbnRCaW5kO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XHJcbnZhciBCaW5kZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJCaW5kZXJcIikgPyBkZXBlbmRlbmNpZXMuQmluZGVyIDogcmVxdWlyZSgnLi9CaW5kZXInKTtcclxudmFyIEV2ZW50QmluZDtcclxuRXZlbnRCaW5kID0gY2xhc3MgRXZlbnRCaW5kIGV4dGVuZHMgQmluZGVyIHtcclxuICBjb25zdHJ1Y3RvcihldmVudDEsIHRhcmdldDEsIGNhbGxiYWNrKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5ldmVudCA9IGV2ZW50MTtcclxuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0MTtcclxuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICB9XHJcblxyXG4gIGdldFJlZigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGV2ZW50OiB0aGlzLmV2ZW50LFxyXG4gICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxyXG4gICAgICBjYWxsYmFjazogdGhpcy5jYWxsYmFja1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGRvQmluZCgpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LmFkZExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vbih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRvVW5iaW5kKCkge1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vZmYodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjayk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIHJlbW92ZSBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBlcXVhbHMoZXZlbnRCaW5kKSB7XHJcbiAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGV2ZW50QmluZCkgJiYgZXZlbnRCaW5kLmV2ZW50ID09PSB0aGlzLmV2ZW50O1xyXG4gIH1cclxuXHJcbiAgbWF0Y2goZXZlbnQsIHRhcmdldCkge1xyXG4gICAgcmV0dXJuIGV2ZW50ID09PSB0aGlzLmV2ZW50ICYmIHRhcmdldCA9PT0gdGhpcy50YXJnZXQ7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIGZhdGFsID0gdHJ1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGVtaXR0ZXIuYWRkTGlzdGVuZXIgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gYWRkIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG59O1xyXG5cclxucmV0dXJuKEV2ZW50QmluZCk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRXZlbnRCaW5kLmpzLm1hcFxyXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEV2ZW50RW1pdHRlcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7RXZlbnRFbWl0dGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RXZlbnRFbWl0dGVyO31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRXZlbnRFbWl0dGVyPUV2ZW50RW1pdHRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkV2ZW50RW1pdHRlcj1FdmVudEVtaXR0ZXI7fX19KShmdW5jdGlvbigpe1xyXG52YXIgRXZlbnRFbWl0dGVyO1xyXG5FdmVudEVtaXR0ZXIgPSAoZnVuY3Rpb24oKSB7XHJcbiAgY2xhc3MgRXZlbnRFbWl0dGVyIHtcclxuICAgIGdldEFsbEV2ZW50cygpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50cyB8fCAodGhpcy5fZXZlbnRzID0ge30pO1xyXG4gICAgfVxyXG4gICAgZ2V0TGlzdGVuZXJzKGUpIHtcclxuICAgICAgdmFyIGV2ZW50cztcclxuICAgICAgZXZlbnRzID0gdGhpcy5nZXRBbGxFdmVudHMoKTtcclxuICAgICAgcmV0dXJuIGV2ZW50c1tlXSB8fCAoZXZlbnRzW2VdID0gW10pO1xyXG4gICAgfVxyXG4gICAgaGFzTGlzdGVuZXIoZSwgbGlzdGVuZXIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGlzdGVuZXJzKGUpLmluY2x1ZGVzKGxpc3RlbmVyKTtcclxuICAgIH1cclxuICAgIGFkZExpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgIGlmICghdGhpcy5oYXNMaXN0ZW5lcihlLCBsaXN0ZW5lcikpIHtcclxuICAgICAgICB0aGlzLmdldExpc3RlbmVycyhlKS5wdXNoKGxpc3RlbmVyKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lckFkZGVkKGUsIGxpc3RlbmVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGlzdGVuZXJBZGRlZChlLCBsaXN0ZW5lcikge31cclxuICAgIHJlbW92ZUxpc3RlbmVyKGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgIHZhciBpbmRleCwgbGlzdGVuZXJzO1xyXG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKTtcclxuICAgICAgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lclJlbW92ZWQoZSwgbGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsaXN0ZW5lclJlbW92ZWQoZSwgbGlzdGVuZXIpIHt9XHJcbiAgICBlbWl0RXZlbnQoZSwgLi4uYXJncykge1xyXG4gICAgICB2YXIgbGlzdGVuZXJzO1xyXG4gICAgICBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVycyhlKS5zbGljZSgpO1xyXG4gICAgICByZXR1cm4gbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgICAgICByZXR1cm4gbGlzdGVuZXIoLi4uYXJncyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0RXZlbnQ7XHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS50cmlnZ2VyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0RXZlbnQ7XHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xyXG4gIHJldHVybiBFdmVudEVtaXR0ZXI7XHJcbn0pLmNhbGwodGhpcyk7XHJcbnJldHVybihFdmVudEVtaXR0ZXIpO30pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL0V2ZW50RW1pdHRlci5qcy5tYXBcclxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBJbnZhbGlkYXRvcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7SW52YWxpZGF0b3IuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1JbnZhbGlkYXRvcjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLkludmFsaWRhdG9yPUludmFsaWRhdG9yO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuSW52YWxpZGF0b3I9SW52YWxpZGF0b3I7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cclxudmFyIEJpbmRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJpbmRlclwiKSA/IGRlcGVuZGVuY2llcy5CaW5kZXIgOiByZXF1aXJlKCcuL0JpbmRlcicpO1xyXG52YXIgRXZlbnRCaW5kID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRXZlbnRCaW5kXCIpID8gZGVwZW5kZW5jaWVzLkV2ZW50QmluZCA6IHJlcXVpcmUoJy4vRXZlbnRCaW5kJyk7XHJcbnZhciBJbnZhbGlkYXRvciwgcGx1Y2s7XHJcbnBsdWNrID0gZnVuY3Rpb24oYXJyLCBmbikge1xyXG4gIHZhciBmb3VuZCwgaW5kZXg7XHJcbiAgaW5kZXggPSBhcnIuZmluZEluZGV4KGZuKTtcclxuICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgZm91bmQgPSBhcnJbaW5kZXhdO1xyXG4gICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICByZXR1cm4gZm91bmQ7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufTtcclxuXHJcbkludmFsaWRhdG9yID0gKGZ1bmN0aW9uKCkge1xyXG4gIGNsYXNzIEludmFsaWRhdG9yIGV4dGVuZHMgQmluZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByb3BlcnR5LCBvYmogPSBudWxsKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcclxuICAgICAgdGhpcy5vYmogPSBvYmo7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW107XHJcbiAgICAgIHRoaXMucmVjeWNsZWQgPSBbXTtcclxuICAgICAgdGhpcy51bmtub3ducyA9IFtdO1xyXG4gICAgICB0aGlzLnN0cmljdCA9IHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0O1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9O1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjay5vd25lciA9IHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaW52YWxpZGF0ZSgpIHtcclxuICAgICAgdmFyIGZ1bmN0TmFtZTtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IHRydWU7XHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydHkoKTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soKTtcclxuICAgICAgfSBlbHNlIGlmICgodGhpcy5wcm9wZXJ0eSAhPSBudWxsKSAmJiB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5pbnZhbGlkYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eS5pbnZhbGlkYXRlKCk7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICBmdW5jdE5hbWUgPSAnaW52YWxpZGF0ZScgKyB0aGlzLnByb3BlcnR5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5wcm9wZXJ0eS5zbGljZSgxKTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub2JqW2Z1bmN0TmFtZV0gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMub2JqW2Z1bmN0TmFtZV0oKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMub2JqW3RoaXMucHJvcGVydHldID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmtub3duKCkge1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkudW5rbm93biA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydHkudW5rbm93bigpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xyXG4gICAgICByZXR1cm4gdGhpcy5hZGRCaW5kZXIobmV3IEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEJpbmRlcihiaW5kZXIpIHtcclxuICAgICAgaWYgKGJpbmRlci5jYWxsYmFjayA9PSBudWxsKSB7XHJcbiAgICAgICAgYmluZGVyLmNhbGxiYWNrID0gdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2s7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5zb21lKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xyXG4gICAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcik7XHJcbiAgICAgIH0pKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2gocGx1Y2sodGhpcy5yZWN5Y2xlZCwgZnVuY3Rpb24oZXZlbnRCaW5kKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpO1xyXG4gICAgICAgIH0pIHx8IGJpbmRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRVbmtub3duQ2FsbGJhY2socHJvcCwgdGFyZ2V0KSB7XHJcbiAgICAgIHZhciBjYWxsYmFjaztcclxuICAgICAgY2FsbGJhY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XHJcbiAgICAgICAgfSwgcHJvcCwgdGFyZ2V0KTtcclxuICAgICAgfTtcclxuICAgICAgY2FsbGJhY2sucmVmID0ge1xyXG4gICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXRcclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIGNhbGxiYWNrO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFVua25vd24oZm4sIHByb3AsIHRhcmdldCkge1xyXG4gICAgICBpZiAoIXRoaXMuZmluZFVua25vd24ocHJvcCwgdGFyZ2V0KSkge1xyXG4gICAgICAgIGZuLnJlZiA9IHtcclxuICAgICAgICAgIFwicHJvcFwiOiBwcm9wLFxyXG4gICAgICAgICAgXCJ0YXJnZXRcIjogdGFyZ2V0XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnVua25vd25zLnB1c2goZm4pO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZpbmRVbmtub3duKHByb3AsIHRhcmdldCkge1xyXG4gICAgICBpZiAoKHByb3AgIT0gbnVsbCkgfHwgKHRhcmdldCAhPSBudWxsKSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVua25vd25zLmZpbmQoZnVuY3Rpb24odW5rbm93bikge1xyXG4gICAgICAgICAgcmV0dXJuIHVua25vd24ucmVmLnByb3AgPT09IHByb3AgJiYgdW5rbm93bi5yZWYudGFyZ2V0ID09PSB0YXJnZXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBldmVudChldmVudCwgdGFyZ2V0ID0gdGhpcy5vYmopIHtcclxuICAgICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hZGRFdmVudEJpbmQoZXZlbnQsIHRhcmdldCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YWx1ZSh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLm9iaikge1xyXG4gICAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpO1xyXG4gICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3AocHJvcCwgdGFyZ2V0ID0gdGhpcy5vYmopIHtcclxuICAgICAgaWYgKHR5cGVvZiBwcm9wICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbmFtZSBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50QmluZChwcm9wICsgJ0ludmFsaWRhdGVkJywgdGFyZ2V0LCB0aGlzLmdldFVua25vd25DYWxsYmFjayhwcm9wLCB0YXJnZXQpKTtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSh0YXJnZXRbcHJvcF0sIHByb3AgKyAnVXBkYXRlZCcsIHRhcmdldCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3BJbml0aWF0ZWQocHJvcCwgdGFyZ2V0ID0gdGhpcy5vYmopIHtcclxuICAgICAgdmFyIGluaXRpYXRlZDtcclxuICAgICAgaW5pdGlhdGVkID0gdGFyZ2V0LmdldFByb3BlcnR5SW5zdGFuY2UocHJvcCkuaW5pdGlhdGVkO1xyXG4gICAgICBpZiAoIWluaXRpYXRlZCAmJiB0aGlzLmNoZWNrRW1pdHRlcih0YXJnZXQpKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudChwcm9wICsgJ1VwZGF0ZWQnLCB0YXJnZXQpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBpbml0aWF0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3QoZnVuY3QpIHtcclxuICAgICAgdmFyIGludmFsaWRhdG9yLCByZXM7XHJcbiAgICAgIGludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKCgpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hZGRVbmtub3duKCgpID0+IHtcclxuICAgICAgICAgIHZhciByZXMyO1xyXG4gICAgICAgICAgcmVzMiA9IGZ1bmN0KGludmFsaWRhdG9yKTtcclxuICAgICAgICAgIGlmIChyZXMgIT09IHJlczIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIGludmFsaWRhdG9yKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJlcyA9IGZ1bmN0KGludmFsaWRhdG9yKTtcclxuICAgICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChpbnZhbGlkYXRvcik7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGVVbmtub3ducyhwcm9wLCB0YXJnZXQgPSB0aGlzLm9iaikge1xyXG4gICAgICB2YXIgdW5rbm93bnM7XHJcbiAgICAgIHVua25vd25zID0gdGhpcy51bmtub3ducztcclxuICAgICAgdGhpcy51bmtub3ducyA9IFtdO1xyXG4gICAgICByZXR1cm4gdW5rbm93bnMuZm9yRWFjaChmdW5jdGlvbih1bmtub3duKSB7XHJcbiAgICAgICAgcmV0dXJuIHVua25vd24oKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNFbXB0eSgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBiaW5kKCkge1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVkID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50QmluZCkge1xyXG4gICAgICAgIHJldHVybiBldmVudEJpbmQuYmluZCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZWN5Y2xlKGNhbGxiYWNrKSB7XHJcbiAgICAgIHZhciBkb25lLCByZXM7XHJcbiAgICAgIHRoaXMucmVjeWNsZWQgPSB0aGlzLmludmFsaWRhdGlvbkV2ZW50cztcclxuICAgICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXTtcclxuICAgICAgZG9uZSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnJlY3ljbGVkLmZvckVhY2goZnVuY3Rpb24oZXZlbnRCaW5kKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlY3ljbGVkID0gW107XHJcbiAgICAgIH07XHJcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgIGlmIChjYWxsYmFjay5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodGhpcywgZG9uZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlcyA9IGNhbGxiYWNrKHRoaXMpO1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGRvbmU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjaGVja0VtaXR0ZXIoZW1pdHRlcikge1xyXG4gICAgICByZXR1cm4gRXZlbnRCaW5kLmNoZWNrRW1pdHRlcihlbWl0dGVyLCB0aGlzLnN0cmljdCk7XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudEJpbmQpIHtcclxuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLnVuYmluZCgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZTtcclxuXHJcbiAgcmV0dXJuIEludmFsaWRhdG9yO1xyXG5cclxufSkuY2FsbCh0aGlzKTtcclxuXHJcbnJldHVybihJbnZhbGlkYXRvcik7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvSW52YWxpZGF0b3IuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgTWl4YWJsZT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7TWl4YWJsZS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPU1peGFibGU7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5NaXhhYmxlPU1peGFibGU7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5NaXhhYmxlPU1peGFibGU7fX19KShmdW5jdGlvbigpe1xyXG52YXIgTWl4YWJsZSxcclxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcclxuTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcclxuICBjbGFzcyBNaXhhYmxlIHtcclxuICAgIHN0YXRpYyBleHRlbmQob2JqKSB7XHJcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcclxuICAgICAgaWYgKG9iai5wcm90b3R5cGUgIT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLkV4dGVuc2lvbi5tYWtlKG9iai5wcm90b3R5cGUsIHRoaXMucHJvdG90eXBlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGluY2x1ZGUob2JqKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLkV4dGVuc2lvbi5tYWtlKG9iaiwgdGhpcy5wcm90b3R5cGUpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XHJcbiAgICBtYWtlOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xyXG4gICAgICB2YXIgaSwgbGVuLCBwcm9wLCByZWY7XHJcbiAgICAgIHJlZiA9IHRoaXMuZ2V0RXh0ZW5zaW9uUHJvcGVydGllcyhzb3VyY2UsIHRhcmdldCk7XHJcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgIHByb3AgPSByZWZbaV07XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcC5uYW1lLCBwcm9wKTtcclxuICAgICAgfVxyXG4gICAgICB0YXJnZXQuZXh0ZW5zaW9ucyA9ICh0YXJnZXQuZXh0ZW5zaW9ucyB8fCBbXSkuY29uY2F0KFtzb3VyY2VdKTtcclxuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICByZXR1cm4gc291cmNlLmV4dGVuZGVkKHRhcmdldCk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhbHdheXNGaW5hbDogWydleHRlbmRlZCcsICdleHRlbnNpb25zJywgJ19fc3VwZXJfXycsICdjb25zdHJ1Y3RvciddLFxyXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcclxuICAgICAgdmFyIGFsd2F5c0ZpbmFsLCBwcm9wcywgdGFyZ2V0Q2hhaW47XHJcbiAgICAgIGFsd2F5c0ZpbmFsID0gdGhpcy5hbHdheXNGaW5hbDtcclxuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XHJcbiAgICAgIHByb3BzID0gW107XHJcbiAgICAgIHRoaXMuZ2V0UHJvdG90eXBlQ2hhaW4oc291cmNlKS5ldmVyeShmdW5jdGlvbihvYmopIHtcclxuICAgICAgICB2YXIgZXhjbHVkZTtcclxuICAgICAgICBpZiAoIXRhcmdldENoYWluLmluY2x1ZGVzKG9iaikpIHtcclxuICAgICAgICAgIGV4Y2x1ZGUgPSBhbHdheXNGaW5hbDtcclxuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBleGNsdWRlID0gZXhjbHVkZS5jb25jYXQoW1wibGVuZ3RoXCIsIFwicHJvdG90eXBlXCIsIFwibmFtZVwiXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAhdGFyZ2V0Lmhhc093blByb3BlcnR5KGtleSkgJiYga2V5LnN1YnN0cigwLCAyKSAhPT0gXCJfX1wiICYmIGluZGV4T2YuY2FsbChleGNsdWRlLCBrZXkpIDwgMCAmJiAhcHJvcHMuZmluZChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3AubmFtZSA9PT0ga2V5O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pLm1hcChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIHByb3A7XHJcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcclxuICAgICAgICAgICAgcHJvcC5uYW1lID0ga2V5O1xyXG4gICAgICAgICAgICByZXR1cm4gcHJvcDtcclxuICAgICAgICAgIH0pKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBwcm9wcztcclxuICAgIH0sXHJcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHZhciBiYXNlUHJvdG90eXBlLCBjaGFpbjtcclxuICAgICAgY2hhaW4gPSBbXTtcclxuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xyXG4gICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgIGNoYWluLnB1c2gob2JqKTtcclxuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2hhaW47XHJcbiAgICB9XHJcbiAgfTtcclxuICByZXR1cm4gTWl4YWJsZTtcclxufSkuY2FsbCh0aGlzKTtcclxucmV0dXJuKE1peGFibGUpO30pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL01peGFibGUuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgT3ZlcnJpZGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtPdmVycmlkZXIuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1PdmVycmlkZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5PdmVycmlkZXI9T3ZlcnJpZGVyO31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuT3ZlcnJpZGVyPU92ZXJyaWRlcjt9fX0pKGZ1bmN0aW9uKCl7XHJcbnZhciBPdmVycmlkZXI7XHJcbk92ZXJyaWRlciA9IChmdW5jdGlvbigpIHtcclxuICBjbGFzcyBPdmVycmlkZXIge1xyXG4gICAgc3RhdGljIG92ZXJyaWRlcyhvdmVycmlkZXMpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuT3ZlcnJpZGUuYXBwbHlNYW55KHRoaXMucHJvdG90eXBlLCB0aGlzLm5hbWUsIG92ZXJyaWRlcyk7XHJcbiAgICB9XHJcbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XHJcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBbJ19vdmVycmlkZXMnXS5jb25jYXQoT2JqZWN0LmtleXModGhpcy5fb3ZlcnJpZGVzKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcclxuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5PdmVycmlkZS5hcHBseU1hbnkodGFyZ2V0LCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIHRoaXMuX292ZXJyaWRlcyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IgPT09IE92ZXJyaWRlcikge1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQuZXh0ZW5kZWQgPSB0aGlzLmV4dGVuZGVkO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuICBPdmVycmlkZXIuT3ZlcnJpZGUgPSB7XHJcbiAgICBtYWtlTWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xyXG4gICAgICB2YXIgZm4sIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XHJcbiAgICAgIHJlc3VsdHMgPSBbXTtcclxuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XHJcbiAgICAgICAgZm4gPSBvdmVycmlkZXNba2V5XTtcclxuICAgICAgICByZXN1bHRzLnB1c2gob3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgZm4pKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH0sXHJcbiAgICBhcHBseU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcclxuICAgICAgdmFyIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XHJcbiAgICAgIHJlc3VsdHMgPSBbXTtcclxuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XHJcbiAgICAgICAgb3ZlcnJpZGUgPSBvdmVycmlkZXNba2V5XTtcclxuICAgICAgICBpZiAodHlwZW9mIG92ZXJyaWRlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgIG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIG92ZXJyaWRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYXBwbHkodGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9LFxyXG4gICAgbWFrZTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIGZuTmFtZSwgZm4pIHtcclxuICAgICAgdmFyIG92ZXJyaWRlO1xyXG4gICAgICBvdmVycmlkZSA9IHtcclxuICAgICAgICBmbjoge1xyXG4gICAgICAgICAgY3VycmVudDogZm5cclxuICAgICAgICB9LFxyXG4gICAgICAgIG5hbWU6IGZuTmFtZVxyXG4gICAgICB9O1xyXG4gICAgICBvdmVycmlkZS5mblsnd2l0aCcgKyBuYW1lc3BhY2VdID0gZm47XHJcbiAgICAgIHJldHVybiBvdmVycmlkZTtcclxuICAgIH0sXHJcbiAgICBlbXB0eUZuOiBmdW5jdGlvbigpIHt9LFxyXG4gICAgYXBwbHk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkge1xyXG4gICAgICB2YXIgZm5OYW1lLCBvdmVycmlkZXMsIHJlZiwgcmVmMSwgd2l0aG91dDtcclxuICAgICAgZm5OYW1lID0gb3ZlcnJpZGUubmFtZTtcclxuICAgICAgb3ZlcnJpZGVzID0gdGFyZ2V0Ll9vdmVycmlkZXMgIT0gbnVsbCA/IE9iamVjdC5hc3NpZ24oe30sIHRhcmdldC5fb3ZlcnJpZGVzKSA6IHt9O1xyXG4gICAgICB3aXRob3V0ID0gKChyZWYgPSB0YXJnZXQuX292ZXJyaWRlcykgIT0gbnVsbCA/IChyZWYxID0gcmVmW2ZuTmFtZV0pICE9IG51bGwgPyByZWYxLmZuLmN1cnJlbnQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IHRhcmdldFtmbk5hbWVdO1xyXG4gICAgICBvdmVycmlkZSA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlKTtcclxuICAgICAgaWYgKG92ZXJyaWRlc1tmbk5hbWVdICE9IG51bGwpIHtcclxuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlc1tmbk5hbWVdLmZuLCBvdmVycmlkZS5mbik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb3ZlcnJpZGUuZm4gPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZS5mbik7XHJcbiAgICAgIH1cclxuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGhvdXQnICsgbmFtZXNwYWNlXSA9IHdpdGhvdXQgfHwgdGhpcy5lbXB0eUZuO1xyXG4gICAgICBpZiAod2l0aG91dCA9PSBudWxsKSB7XHJcbiAgICAgICAgb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQgPSAnd2l0aG91dCcgKyBuYW1lc3BhY2U7XHJcbiAgICAgIH0gZWxzZSBpZiAob3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQpIHtcclxuICAgICAgICBvdmVycmlkZS5mbltvdmVycmlkZS5taXNzaW5nV2l0aG91dF0gPSB3aXRob3V0O1xyXG4gICAgICB9XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGZuTmFtZSwge1xyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIGZpbmFsRm4sIGZuLCBrZXksIHJlZjI7XHJcbiAgICAgICAgICBmaW5hbEZuID0gb3ZlcnJpZGUuZm4uY3VycmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgcmVmMiA9IG92ZXJyaWRlLmZuO1xyXG4gICAgICAgICAgZm9yIChrZXkgaW4gcmVmMikge1xyXG4gICAgICAgICAgICBmbiA9IHJlZjJba2V5XTtcclxuICAgICAgICAgICAgZmluYWxGbltrZXldID0gZm4uYmluZCh0aGlzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAhPT0gdGhpcykge1xyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZm5OYW1lLCB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IGZpbmFsRm5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZmluYWxGbjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBvdmVycmlkZXNbZm5OYW1lXSA9IG92ZXJyaWRlO1xyXG4gICAgICByZXR1cm4gdGFyZ2V0Ll9vdmVycmlkZXMgPSBvdmVycmlkZXM7XHJcbiAgICB9XHJcbiAgfTtcclxuICByZXR1cm4gT3ZlcnJpZGVyO1xyXG59KS5jYWxsKHRoaXMpO1xyXG5yZXR1cm4oT3ZlcnJpZGVyKTt9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgUHJvcGVydHk9ZGVmaW5pdGlvbih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiP1NwYXJrOnRoaXMuU3BhcmspO1Byb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9UHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Qcm9wZXJ0eT1Qcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLlByb3BlcnR5PVByb3BlcnR5O319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XHJcbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHknKTtcclxudmFyIENvbGxlY3Rpb25Qcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNvbGxlY3Rpb25Qcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5Jyk7XHJcbnZhciBDb21wb3NlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ29tcG9zZWRQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5Db21wb3NlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NvbXBvc2VkUHJvcGVydHknKTtcclxudmFyIER5bmFtaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkR5bmFtaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5EeW5hbWljUHJvcGVydHkgOiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5Jyk7XHJcbnZhciBDYWxjdWxhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJDYWxjdWxhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQ2FsY3VsYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xyXG52YXIgSW52YWxpZGF0ZWRQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkludmFsaWRhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9JbnZhbGlkYXRlZFByb3BlcnR5Jyk7XHJcbnZhciBBY3RpdmFibGVQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkFjdGl2YWJsZVByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkFjdGl2YWJsZVByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0FjdGl2YWJsZVByb3BlcnR5Jyk7XHJcbnZhciBVcGRhdGVkUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJVcGRhdGVkUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuVXBkYXRlZFByb3BlcnR5IDogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eScpO1xyXG52YXIgUHJvcGVydHlPd25lciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIlByb3BlcnR5T3duZXJcIikgPyBkZXBlbmRlbmNpZXMuUHJvcGVydHlPd25lciA6IHJlcXVpcmUoJy4vUHJvcGVydHlPd25lcicpO1xyXG52YXIgTWl4YWJsZSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk1peGFibGVcIikgPyBkZXBlbmRlbmNpZXMuTWl4YWJsZSA6IHJlcXVpcmUoJy4vTWl4YWJsZScpO1xyXG52YXIgUHJvcGVydHk7XHJcblByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xyXG4gIGNsYXNzIFByb3BlcnR5IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xyXG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGJpbmQodGFyZ2V0KSB7XHJcbiAgICAgIHZhciBwYXJlbnQsIHByb3A7XHJcbiAgICAgIHByb3AgPSB0aGlzO1xyXG4gICAgICBpZiAoISh0eXBlb2YgdGFyZ2V0LmdldFByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmIHRhcmdldC5nZXRQcm9wZXJ0eSh0aGlzLm5hbWUpID09PSB0aGlzKSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0LmdldFByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmICgocGFyZW50ID0gdGFyZ2V0LmdldFByb3BlcnR5KHRoaXMubmFtZSkpICE9IG51bGwpKSB7XHJcbiAgICAgICAgICB0aGlzLm92ZXJyaWRlKHBhcmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2V0SW5zdGFuY2VUeXBlKCkuYmluZCh0YXJnZXQsIHByb3ApO1xyXG4gICAgICAgIHRhcmdldC5fcHJvcGVydGllcyA9ICh0YXJnZXQuX3Byb3BlcnRpZXMgfHwgW10pLmNvbmNhdChbcHJvcF0pO1xyXG4gICAgICAgIGlmIChwYXJlbnQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgdGFyZ2V0Ll9wcm9wZXJ0aWVzID0gdGFyZ2V0Ll9wcm9wZXJ0aWVzLmZpbHRlcihmdW5jdGlvbihleGlzdGluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhpc3RpbmcgIT09IHBhcmVudDtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1ha2VPd25lcih0YXJnZXQpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBwcm9wO1xyXG4gICAgfVxyXG5cclxuICAgIG92ZXJyaWRlKHBhcmVudCkge1xyXG4gICAgICB2YXIga2V5LCByZWYsIHJlc3VsdHMsIHZhbHVlO1xyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBhcmVudCA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnBhcmVudCA9IHBhcmVudC5vcHRpb25zO1xyXG4gICAgICAgIHJlZiA9IHBhcmVudC5vcHRpb25zO1xyXG4gICAgICAgIHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBmb3IgKGtleSBpbiByZWYpIHtcclxuICAgICAgICAgIHZhbHVlID0gcmVmW2tleV07XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9uc1trZXldID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5vcHRpb25zW2tleV0ub3ZlcnJpZGVkID0gdmFsdWUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLm9wdGlvbnNba2V5XSA9IHZhbHVlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VPd25lcih0YXJnZXQpIHtcclxuICAgICAgdmFyIHJlZjtcclxuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKFByb3BlcnR5T3duZXIucHJvdG90eXBlKSA6IHZvaWQgMCkpIHtcclxuICAgICAgICByZXR1cm4gTWl4YWJsZS5FeHRlbnNpb24ubWFrZShQcm9wZXJ0eU93bmVyLnByb3RvdHlwZSwgdGFyZ2V0KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEluc3RhbmNlVmFyTmFtZSgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pbnN0YW5jZVZhck5hbWUgfHwgJ18nICsgdGhpcy5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGlzSW5zdGFudGlhdGVkKG9iaikge1xyXG4gICAgICByZXR1cm4gb2JqW3RoaXMuZ2V0SW5zdGFuY2VWYXJOYW1lKCldICE9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SW5zdGFuY2Uob2JqKSB7XHJcbiAgICAgIHZhciBUeXBlLCB2YXJOYW1lO1xyXG4gICAgICB2YXJOYW1lID0gdGhpcy5nZXRJbnN0YW5jZVZhck5hbWUoKTtcclxuICAgICAgaWYgKCF0aGlzLmlzSW5zdGFudGlhdGVkKG9iaikpIHtcclxuICAgICAgICBUeXBlID0gdGhpcy5nZXRJbnN0YW5jZVR5cGUoKTtcclxuICAgICAgICBvYmpbdmFyTmFtZV0gPSBuZXcgVHlwZSh0aGlzLCBvYmopO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBvYmpbdmFyTmFtZV07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SW5zdGFuY2VUeXBlKCkge1xyXG4gICAgICBpZiAoIXRoaXMuaW5zdGFuY2VUeXBlKSB7XHJcbiAgICAgICAgdGhpcy5jb21wb3NlcnMuZm9yRWFjaCgoY29tcG9zZXIpID0+IHtcclxuICAgICAgICAgIHJldHVybiBjb21wb3Nlci5jb21wb3NlKHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlVHlwZTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgUHJvcGVydHkucHJvdG90eXBlLmNvbXBvc2VycyA9IFtDb21wb3NlZFByb3BlcnR5LCBDb2xsZWN0aW9uUHJvcGVydHksIER5bmFtaWNQcm9wZXJ0eSwgQmFzaWNQcm9wZXJ0eSwgVXBkYXRlZFByb3BlcnR5LCBDYWxjdWxhdGVkUHJvcGVydHksIEludmFsaWRhdGVkUHJvcGVydHksIEFjdGl2YWJsZVByb3BlcnR5XTtcclxuXHJcbiAgcmV0dXJuIFByb3BlcnR5O1xyXG5cclxufSkuY2FsbCh0aGlzKTtcclxuXHJcbnJldHVybihQcm9wZXJ0eSk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvUHJvcGVydHkuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgUHJvcGVydHlPd25lcj1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7UHJvcGVydHlPd25lci5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVByb3BlcnR5T3duZXI7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Qcm9wZXJ0eU93bmVyPVByb3BlcnR5T3duZXI7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5Qcm9wZXJ0eU93bmVyPVByb3BlcnR5T3duZXI7fX19KShmdW5jdGlvbigpe1xyXG52YXIgUHJvcGVydHlPd25lcjtcclxuUHJvcGVydHlPd25lciA9IGNsYXNzIFByb3BlcnR5T3duZXIge1xyXG4gIGdldFByb3BlcnR5KG5hbWUpIHtcclxuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzICYmIHRoaXMuX3Byb3BlcnRpZXMuZmluZChmdW5jdGlvbihwcm9wKSB7XHJcbiAgICAgIHJldHVybiBwcm9wLm5hbWUgPT09IG5hbWU7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0UHJvcGVydHlJbnN0YW5jZShuYW1lKSB7XHJcbiAgICB2YXIgcmVzO1xyXG4gICAgcmVzID0gdGhpcy5nZXRQcm9wZXJ0eShuYW1lKTtcclxuICAgIGlmIChyZXMpIHtcclxuICAgICAgcmV0dXJuIHJlcy5nZXRJbnN0YW5jZSh0aGlzKTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0UHJvcGVydGllcygpIHtcclxuICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzLnNsaWNlKCk7XHJcbiAgfVxyXG4gIGdldFByb3BlcnR5SW5zdGFuY2VzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXMubWFwKChwcm9wKSA9PiB7XHJcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5maWx0ZXIoKHByb3ApID0+IHtcclxuICAgICAgcmV0dXJuIHByb3AuaXNJbnN0YW50aWF0ZWQodGhpcyk7XHJcbiAgICB9KS5tYXAoKHByb3ApID0+IHtcclxuICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0TWFudWFsRGF0YVByb3BlcnRpZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5yZWR1Y2UoKHJlcywgcHJvcCkgPT4ge1xyXG4gICAgICB2YXIgaW5zdGFuY2U7XHJcbiAgICAgIGlmIChwcm9wLmlzSW5zdGFudGlhdGVkKHRoaXMpKSB7XHJcbiAgICAgICAgaW5zdGFuY2UgPSBwcm9wLmdldEluc3RhbmNlKHRoaXMpO1xyXG4gICAgICAgIGlmIChpbnN0YW5jZS5jYWxjdWxhdGVkICYmIGluc3RhbmNlLm1hbnVhbCkge1xyXG4gICAgICAgICAgcmVzW3Byb3AubmFtZV0gPSBpbnN0YW5jZS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0sIHt9KTtcclxuICB9XHJcbiAgc2V0UHJvcGVydGllcyhkYXRhLCBvcHRpb25zID0ge30pIHtcclxuICAgIHZhciBrZXksIHByb3AsIHZhbDtcclxuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcclxuICAgICAgdmFsID0gZGF0YVtrZXldO1xyXG4gICAgICBpZiAoKChvcHRpb25zLndoaXRlbGlzdCA9PSBudWxsKSB8fCBvcHRpb25zLndoaXRlbGlzdC5pbmRleE9mKGtleSkgIT09IC0xKSAmJiAoKG9wdGlvbnMuYmxhY2tsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMuYmxhY2tsaXN0LmluZGV4T2Yoa2V5KSA9PT0gLTEpKSB7XHJcbiAgICAgICAgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHlJbnN0YW5jZShrZXkpO1xyXG4gICAgICAgIGlmIChwcm9wICE9IG51bGwpIHtcclxuICAgICAgICAgIHByb3Auc2V0KHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcbiAgZGVzdHJveVByb3BlcnRpZXMoKSB7XHJcbiAgICB0aGlzLmdldEluc3RhbnRpYXRlZFByb3BlcnRpZXMoKS5mb3JFYWNoKChwcm9wKSA9PiB7XHJcbiAgICAgIHJldHVybiBwcm9wLmRlc3Ryb3koKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fcHJvcGVydGllcyA9IFtdO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIGxpc3RlbmVyQWRkZWQoZXZlbnQsIGxpc3RlbmVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiB7XHJcbiAgICAgIGlmIChwcm9wLmdldEluc3RhbmNlVHlwZSgpLnByb3RvdHlwZS5jaGFuZ2VFdmVudE5hbWUgPT09IGV2ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuZ2V0KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBleHRlbmRlZCh0YXJnZXQpIHtcclxuICAgIHJldHVybiB0YXJnZXQubGlzdGVuZXJBZGRlZCA9IHRoaXMubGlzdGVuZXJBZGRlZDtcclxuICB9XHJcbn07XHJcbnJldHVybihQcm9wZXJ0eU93bmVyKTt9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Qcm9wZXJ0eU93bmVyLmpzLm1hcFxyXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIEFjdGl2YWJsZVByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtBY3RpdmFibGVQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUFjdGl2YWJsZVByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQWN0aXZhYmxlUHJvcGVydHk9QWN0aXZhYmxlUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5BY3RpdmFibGVQcm9wZXJ0eT1BY3RpdmFibGVQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxyXG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XHJcbnZhciBCYXNpY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmFzaWNQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5CYXNpY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9CYXNpY1Byb3BlcnR5Jyk7XHJcbnZhciBPdmVycmlkZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJPdmVycmlkZXJcIikgPyBkZXBlbmRlbmNpZXMuT3ZlcnJpZGVyIDogcmVxdWlyZSgnLi4vT3ZlcnJpZGVyJyk7XHJcbnZhciBBY3RpdmFibGVQcm9wZXJ0eTtcclxuQWN0aXZhYmxlUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgY2xhc3MgQWN0aXZhYmxlUHJvcGVydHkgZXh0ZW5kcyBCYXNpY1Byb3BlcnR5IHtcclxuICAgIGlzQWN0aXZlKCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBtYW51YWxBY3RpdmUoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxsYmFja0FjdGl2ZSgpIHtcclxuICAgICAgdmFyIGludmFsaWRhdG9yO1xyXG4gICAgICBpbnZhbGlkYXRvciA9IHRoaXMuYWN0aXZlSW52YWxpZGF0b3IgfHwgbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcclxuICAgICAgaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuYWN0aXZlRnVuY3QsIGludmFsaWRhdG9yKTtcclxuICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlIHx8IGludmFsaWRhdG9yLmlzRW1wdHkoKSkge1xyXG4gICAgICAgICAgaW52YWxpZGF0b3IudW5iaW5kKCk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJbnZhbGlkYXRvciA9IG51bGw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBpbnZhbGlkYXRvcjtcclxuICAgICAgICAgIHRoaXMuYWN0aXZlSW52YWxpZGF0b3IgPSBpbnZhbGlkYXRvcjtcclxuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcclxuICAgICAgaWYgKHR5cGVvZiBwcm9wLm9wdGlvbnMuYWN0aXZlICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKEFjdGl2YWJsZVByb3BlcnR5KTtcclxuICAgICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5hY3RpdmUgPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuYWN0aXZlID0gcHJvcC5vcHRpb25zLmFjdGl2ZTtcclxuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaXNBY3RpdmUgPSB0aGlzLnByb3RvdHlwZS5tYW51YWxBY3RpdmU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHJvcC5vcHRpb25zLmFjdGl2ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmFjdGl2ZUZ1bmN0ID0gcHJvcC5vcHRpb25zLmFjdGl2ZTtcclxuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaXNBY3RpdmUgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja0FjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgQWN0aXZhYmxlUHJvcGVydHkuZXh0ZW5kKE92ZXJyaWRlcik7XHJcblxyXG4gIEFjdGl2YWJsZVByb3BlcnR5Lm92ZXJyaWRlcyh7XHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgb3V0O1xyXG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSgpKSB7XHJcbiAgICAgICAgb3V0ID0gdGhpcy5nZXQud2l0aG91dEFjdGl2YWJsZVByb3BlcnR5KCk7XHJcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcclxuICAgICAgICAgIHRoaXMuY2hhbmdlZCh0aGlzLnBlbmRpbmdPbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgY2hhbmdlZDogZnVuY3Rpb24ob2xkKSB7XHJcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkpIHtcclxuICAgICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nT2xkID0gdm9pZCAwO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlZC53aXRob3V0QWN0aXZhYmxlUHJvcGVydHkob2xkKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMucGVuZGluZ09sZCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIHRoaXMucGVuZGluZ09sZCA9IG9sZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBBY3RpdmFibGVQcm9wZXJ0eTtcclxuXHJcbn0pLmNhbGwodGhpcyk7XHJcblxyXG5yZXR1cm4oQWN0aXZhYmxlUHJvcGVydHkpO30pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL1Byb3BlcnR5VHlwZXMvQWN0aXZhYmxlUHJvcGVydHkuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQmFzaWNQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7QmFzaWNQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUJhc2ljUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5CYXNpY1Byb3BlcnR5PUJhc2ljUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5CYXNpY1Byb3BlcnR5PUJhc2ljUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cclxudmFyIE1peGFibGUgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJNaXhhYmxlXCIpID8gZGVwZW5kZW5jaWVzLk1peGFibGUgOiByZXF1aXJlKCcuLi9NaXhhYmxlJyk7XHJcbnZhciBCYXNpY1Byb3BlcnR5O1xyXG5CYXNpY1Byb3BlcnR5ID0gY2xhc3MgQmFzaWNQcm9wZXJ0eSBleHRlbmRzIE1peGFibGUge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BlcnR5LCBvYmopIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XHJcbiAgICB0aGlzLm9iaiA9IG9iajtcclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgaW5pdCgpIHtcclxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluZ2VzdCh0aGlzLmRlZmF1bHQpO1xyXG4gICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZ2V0KCkge1xyXG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZTtcclxuICAgIHJldHVybiB0aGlzLm91dHB1dCgpO1xyXG4gIH1cclxuXHJcbiAgc2V0KHZhbCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0QW5kQ2hlY2tDaGFuZ2VzKHZhbCk7XHJcbiAgfVxyXG5cclxuICBjYWxsYmFja1NldCh2YWwpIHtcclxuICAgIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwic2V0XCIsIHZhbCk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHNldEFuZENoZWNrQ2hhbmdlcyh2YWwpIHtcclxuICAgIHZhciBvbGQ7XHJcbiAgICB2YWwgPSB0aGlzLmluZ2VzdCh2YWwpO1xyXG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xyXG4gICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHZhbCwgdGhpcy52YWx1ZSkpIHtcclxuICAgICAgb2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgdGhpcy52YWx1ZSA9IHZhbDtcclxuICAgICAgdGhpcy5tYW51YWwgPSB0cnVlO1xyXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tDaGFuZ2VzKHZhbCwgb2xkKSB7XHJcbiAgICByZXR1cm4gdmFsICE9PSBvbGQ7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95KCkge31cclxuXHJcbiAgY2FsbE9wdGlvbkZ1bmN0KGZ1bmN0LCAuLi5hcmdzKSB7XHJcbiAgICBpZiAodHlwZW9mIGZ1bmN0ID09PSAnc3RyaW5nJykge1xyXG4gICAgICBmdW5jdCA9IHRoaXMucHJvcGVydHkub3B0aW9uc1tmdW5jdF07XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGZ1bmN0Lm92ZXJyaWRlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBhcmdzLnB1c2goKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYWxsT3B0aW9uRnVuY3QoZnVuY3Qub3ZlcnJpZGVkLCAuLi5hcmdzKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnVuY3QuYXBwbHkodGhpcy5vYmosIGFyZ3MpO1xyXG4gIH1cclxuXHJcbiAgcmV2YWxpZGF0ZWQoKSB7XHJcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGluZ2VzdCh2YWwpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmluZ2VzdCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICByZXR1cm4gdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBvdXRwdXQoKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5vdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwib3V0cHV0XCIsIHRoaXMudmFsdWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjaGFuZ2VkKG9sZCkge1xyXG4gICAgdGhpcy5jYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpO1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9iai5lbWl0RXZlbnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMudXBkYXRlRXZlbnROYW1lLCBbb2xkXSk7XHJcbiAgICAgIHRoaXMub2JqLmVtaXRFdmVudCh0aGlzLmNoYW5nZUV2ZW50TmFtZSwgW29sZF0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBjYWxsQ2hhbmdlZEZ1bmN0aW9ucyhvbGQpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJjaGFuZ2VcIiwgb2xkKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGhhc0NoYW5nZWRGdW5jdGlvbnMoKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbic7XHJcbiAgfVxyXG5cclxuICBoYXNDaGFuZ2VkRXZlbnRzKCkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLm9iai5nZXRMaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicgJiYgdGhpcy5vYmouZ2V0TGlzdGVuZXJzKHRoaXMuY2hhbmdlRXZlbnROYW1lKS5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xyXG4gICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcclxuICAgICAgcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIEJhc2ljUHJvcGVydHkge307XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLnNldCA9IHRoaXMucHJvdG90eXBlLmNhbGxiYWNrU2V0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLnNldCA9IHRoaXMucHJvdG90eXBlLnNldEFuZENoZWNrQ2hhbmdlcztcclxuICAgIH1cclxuICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5kZWZhdWx0ID0gcHJvcC5vcHRpb25zLmRlZmF1bHQ7XHJcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuaW5pdGlhdGVkID0gdHlwZW9mIHByb3Aub3B0aW9ucy5kZWZhdWx0ICE9PSAndW5kZWZpbmVkJztcclxuICAgIHJldHVybiB0aGlzLnNldEV2ZW50TmFtZXMocHJvcCk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc2V0RXZlbnROYW1lcyhwcm9wKSB7XHJcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2hhbmdlRXZlbnROYW1lID0gcHJvcC5vcHRpb25zLmNoYW5nZUV2ZW50TmFtZSB8fCBwcm9wLm5hbWUgKyAnQ2hhbmdlZCc7XHJcbiAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUudXBkYXRlRXZlbnROYW1lID0gcHJvcC5vcHRpb25zLnVwZGF0ZUV2ZW50TmFtZSB8fCBwcm9wLm5hbWUgKyAnVXBkYXRlZCc7XHJcbiAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUucHJvdG90eXBlLmludmFsaWRhdGVFdmVudE5hbWUgPSBwcm9wLm9wdGlvbnMuaW52YWxpZGF0ZUV2ZW50TmFtZSB8fCBwcm9wLm5hbWUgKyAnSW52YWxpZGF0ZWQnO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGJpbmQodGFyZ2V0LCBwcm9wKSB7XHJcbiAgICB2YXIgbWFqLCBvcHQ7XHJcbiAgICBtYWogPSBwcm9wLm5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLm5hbWUuc2xpY2UoMSk7XHJcbiAgICBvcHQgPSB7XHJcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5nZXQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGlmIChwcm9wLm9wdGlvbnMuc2V0ICE9PSBmYWxzZSkge1xyXG4gICAgICBvcHQuc2V0ID0gZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykuc2V0KHZhbCk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIG9wdCk7XHJcbiAgICB0YXJnZXRbJ2dldCcgKyBtYWpdID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmdldCgpO1xyXG4gICAgfTtcclxuICAgIGlmIChwcm9wLm9wdGlvbnMuc2V0ICE9PSBmYWxzZSkge1xyXG4gICAgICB0YXJnZXRbJ3NldCcgKyBtYWpdID0gZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgcHJvcC5nZXRJbnN0YW5jZSh0aGlzKS5zZXQodmFsKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiB0YXJnZXRbJ2ludmFsaWRhdGUnICsgbWFqXSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBwcm9wLmdldEluc3RhbmNlKHRoaXMpLmludmFsaWRhdGUoKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbn07XHJcblxyXG5yZXR1cm4oQmFzaWNQcm9wZXJ0eSk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9CYXNpY1Byb3BlcnR5LmpzLm1hcFxyXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIENhbGN1bGF0ZWRQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7Q2FsY3VsYXRlZFByb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9Q2FsY3VsYXRlZFByb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuQ2FsY3VsYXRlZFByb3BlcnR5PUNhbGN1bGF0ZWRQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkNhbGN1bGF0ZWRQcm9wZXJ0eT1DYWxjdWxhdGVkUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cclxudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xyXG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XHJcbnZhciBPdmVycmlkZXIgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJPdmVycmlkZXJcIikgPyBkZXBlbmRlbmNpZXMuT3ZlcnJpZGVyIDogcmVxdWlyZSgnLi4vT3ZlcnJpZGVyJyk7XHJcbnZhciBDYWxjdWxhdGVkUHJvcGVydHk7XHJcbkNhbGN1bGF0ZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcclxuICBjbGFzcyBDYWxjdWxhdGVkUHJvcGVydHkgZXh0ZW5kcyBEeW5hbWljUHJvcGVydHkge1xyXG4gICAgY2FsY3VsKCkge1xyXG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QodGhpcy5jYWxjdWxGdW5jdCk7XHJcbiAgICAgIHRoaXMubWFudWFsID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xyXG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZS5wcm90b3R5cGUuY2FsY3VsRnVuY3QgPSBwcm9wLm9wdGlvbnMuY2FsY3VsO1xyXG4gICAgICAgIGlmICghKHByb3Aub3B0aW9ucy5jYWxjdWwubGVuZ3RoID4gMCkpIHtcclxuICAgICAgICAgIHJldHVybiBwcm9wLmluc3RhbmNlVHlwZS5leHRlbmQoQ2FsY3VsYXRlZFByb3BlcnR5KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgQ2FsY3VsYXRlZFByb3BlcnR5LmV4dGVuZChPdmVycmlkZXIpO1xyXG5cclxuICBDYWxjdWxhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcclxuICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBpbml0aWF0ZWQsIG9sZDtcclxuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IpIHtcclxuICAgICAgICB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCkge1xyXG4gICAgICAgIG9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgaW5pdGlhdGVkID0gdGhpcy5pbml0aWF0ZWQ7XHJcbiAgICAgICAgdGhpcy5jYWxjdWwoKTtcclxuICAgICAgICBpZiAodGhpcy5jaGVja0NoYW5nZXModGhpcy52YWx1ZSwgb2xkKSkge1xyXG4gICAgICAgICAgaWYgKGluaXRpYXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZWQob2xkKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub2JqLmVtaXRFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aGlzLm9iai5lbWl0RXZlbnQodGhpcy51cGRhdGVFdmVudE5hbWUsIFtvbGRdKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0KCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBDYWxjdWxhdGVkUHJvcGVydHk7XHJcblxyXG59KS5jYWxsKHRoaXMpO1xyXG5cclxucmV0dXJuKENhbGN1bGF0ZWRQcm9wZXJ0eSk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9DYWxjdWxhdGVkUHJvcGVydHkuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQ29sbGVjdGlvblByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtDb2xsZWN0aW9uUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1Db2xsZWN0aW9uUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Db2xsZWN0aW9uUHJvcGVydHk9Q29sbGVjdGlvblByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuQ29sbGVjdGlvblByb3BlcnR5PUNvbGxlY3Rpb25Qcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxyXG52YXIgRHluYW1pY1Byb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiRHluYW1pY1Byb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkR5bmFtaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vRHluYW1pY1Byb3BlcnR5Jyk7XHJcbnZhciBDb2xsZWN0aW9uID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ29sbGVjdGlvblwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uIDogcmVxdWlyZSgnLi4vQ29sbGVjdGlvbicpO1xyXG52YXIgQ29sbGVjdGlvblByb3BlcnR5O1xyXG5Db2xsZWN0aW9uUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgY2xhc3MgQ29sbGVjdGlvblByb3BlcnR5IGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHtcclxuICAgIGluZ2VzdCh2YWwpIHtcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaW5nZXN0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdmFsID0gdGhpcy5jYWxsT3B0aW9uRnVuY3QoXCJpbmdlc3RcIiwgdmFsKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodmFsID09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbC50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbC50b0FycmF5KCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBbdmFsXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrQ2hhbmdlZEl0ZW1zKHZhbCwgb2xkKSB7XHJcbiAgICAgIHZhciBjb21wYXJlRnVuY3Rpb247XHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY29tcGFyZUZ1bmN0aW9uID0gdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5jb21wYXJlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAobmV3IENvbGxlY3Rpb24odmFsKSkuY2hlY2tDaGFuZ2VzKG9sZCwgdGhpcy5jb2xsZWN0aW9uT3B0aW9ucy5vcmRlcmVkLCBjb21wYXJlRnVuY3Rpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIG91dHB1dCgpIHtcclxuICAgICAgdmFyIGNvbCwgcHJvcCwgdmFsdWU7XHJcbiAgICAgIHZhbHVlID0gdGhpcy52YWx1ZTtcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMub3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdmFsdWUgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcIm91dHB1dFwiLCB0aGlzLnZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgICBwcm9wID0gdGhpcztcclxuICAgICAgY29sID0gQ29sbGVjdGlvbi5uZXdTdWJDbGFzcyh0aGlzLmNvbGxlY3Rpb25PcHRpb25zLCB2YWx1ZSk7XHJcbiAgICAgIGNvbC5jaGFuZ2VkID0gZnVuY3Rpb24ob2xkKSB7XHJcbiAgICAgICAgcmV0dXJuIHByb3AuY2hhbmdlZChvbGQpO1xyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gY29sO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGxDaGFuZ2VkRnVuY3Rpb25zKG9sZCkge1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pdGVtQWRkZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLnZhbHVlLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcclxuICAgICAgICAgIGlmICghb2xkLmluY2x1ZGVzKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxPcHRpb25GdW5jdChcIml0ZW1BZGRlZFwiLCBpdGVtLCBpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pdGVtUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIG9sZC5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XHJcbiAgICAgICAgICBpZiAoIXRoaXMudmFsdWUuaW5jbHVkZXMoaXRlbSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KFwiaXRlbVJlbW92ZWRcIiwgaXRlbSwgaSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN1cGVyLmNhbGxDaGFuZ2VkRnVuY3Rpb25zKG9sZCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFzQ2hhbmdlZEZ1bmN0aW9ucygpIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLmhhc0NoYW5nZWRGdW5jdGlvbnMoKSB8fCB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLml0ZW1BZGRlZCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdGhpcy5wcm9wZXJ0eS5vcHRpb25zLml0ZW1SZW1vdmVkID09PSAnZnVuY3Rpb24nO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcclxuICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwpIHtcclxuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgQ29sbGVjdGlvblByb3BlcnR5IHt9O1xyXG4gICAgICAgIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jb2xsZWN0aW9uT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdENvbGxlY3Rpb25PcHRpb25zLCB0eXBlb2YgcHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gPT09ICdvYmplY3QnID8gcHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gOiB7fSk7XHJcbiAgICAgICAgaWYgKHByb3Aub3B0aW9ucy5jb2xsZWN0aW9uLmNvbXBhcmUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5jaGVja0NoYW5nZXMgPSB0aGlzLnByb3RvdHlwZS5jaGVja0NoYW5nZWRJdGVtcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgQ29sbGVjdGlvblByb3BlcnR5LmRlZmF1bHRDb2xsZWN0aW9uT3B0aW9ucyA9IHtcclxuICAgIGNvbXBhcmU6IGZhbHNlLFxyXG4gICAgb3JkZXJlZDogdHJ1ZVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBDb2xsZWN0aW9uUHJvcGVydHk7XHJcblxyXG59KS5jYWxsKHRoaXMpO1xyXG5cclxucmV0dXJuKENvbGxlY3Rpb25Qcm9wZXJ0eSk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db2xsZWN0aW9uUHJvcGVydHkuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgQ29tcG9zZWRQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7Q29tcG9zZWRQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUNvbXBvc2VkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5Db21wb3NlZFByb3BlcnR5PUNvbXBvc2VkUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5Db21wb3NlZFByb3BlcnR5PUNvbXBvc2VkUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cclxudmFyIENhbGN1bGF0ZWRQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkNhbGN1bGF0ZWRQcm9wZXJ0eVwiKSA/IGRlcGVuZGVuY2llcy5DYWxjdWxhdGVkUHJvcGVydHkgOiByZXF1aXJlKCcuL0NhbGN1bGF0ZWRQcm9wZXJ0eScpO1xyXG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XHJcbnZhciBDb2xsZWN0aW9uID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ29sbGVjdGlvblwiKSA/IGRlcGVuZGVuY2llcy5Db2xsZWN0aW9uIDogcmVxdWlyZSgnLi4vQ29sbGVjdGlvbicpO1xyXG52YXIgQ29tcG9zZWRQcm9wZXJ0eTtcclxuQ29tcG9zZWRQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcclxuICBjbGFzcyBDb21wb3NlZFByb3BlcnR5IGV4dGVuZHMgQ2FsY3VsYXRlZFByb3BlcnR5IHtcclxuICAgIGluaXQoKSB7XHJcbiAgICAgIHN1cGVyLmluaXQoKTtcclxuICAgICAgcmV0dXJuIHRoaXMuaW5pdENvbXBvc2VkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdENvbXBvc2VkKCkge1xyXG4gICAgICBpZiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmhhc093blByb3BlcnR5KCdkZWZhdWx0JykpIHtcclxuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuZGVmYXVsdDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLnZhbHVlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1lbWJlcnMgPSBuZXcgQ29tcG9zZWRQcm9wZXJ0eS5NZW1iZXJzKHRoaXMucHJvcGVydHkub3B0aW9ucy5tZW1iZXJzKTtcclxuICAgICAgdGhpcy5tZW1iZXJzLmNoYW5nZWQgPSAob2xkKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gdGhpcy5qb2luID0gdHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMucHJvcGVydHkub3B0aW9ucy5jb21wb3NlZCA6IHRoaXMucHJvcGVydHkub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSA/IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5vciA6IENvbXBvc2VkUHJvcGVydHkuam9pbkZ1bmN0aW9ucy5hbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgY2FsY3VsKCkge1xyXG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcclxuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubWVtYmVycy5yZWR1Y2UoKHByZXYsIG1lbWJlcikgPT4ge1xyXG4gICAgICAgICAgdmFyIHZhbDtcclxuICAgICAgICAgIHZhbCA9IHR5cGVvZiBtZW1iZXIgPT09ICdmdW5jdGlvbicgPyBtZW1iZXIodGhpcy5pbnZhbGlkYXRvcikgOiBtZW1iZXI7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5qb2luKHByZXYsIHZhbCk7XHJcbiAgICAgICAgfSwgdGhpcy5kZWZhdWx0KTtcclxuICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgaWYgKGludmFsaWRhdG9yLmlzRW1wdHkoKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IuYmluZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xyXG4gICAgICBpZiAocHJvcC5vcHRpb25zLmNvbXBvc2VkICE9IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUgPSBjbGFzcyBleHRlbmRzIENvbXBvc2VkUHJvcGVydHkge307XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYmluZCh0YXJnZXQsIHByb3ApIHtcclxuICAgICAgQ2FsY3VsYXRlZFByb3BlcnR5LmJpbmQodGFyZ2V0LCBwcm9wKTtcclxuICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSArICdNZW1iZXJzJywge1xyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHByb3AuZ2V0SW5zdGFuY2UodGhpcykubWVtYmVycztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBDb21wb3NlZFByb3BlcnR5LmpvaW5GdW5jdGlvbnMgPSB7XHJcbiAgICBhbmQ6IGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgcmV0dXJuIGEgJiYgYjtcclxuICAgIH0sXHJcbiAgICBvcjogZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICByZXR1cm4gYSB8fCBiO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBDb21wb3NlZFByb3BlcnR5O1xyXG5cclxufSkuY2FsbCh0aGlzKTtcclxuXHJcbkNvbXBvc2VkUHJvcGVydHkuTWVtYmVycyA9IGNsYXNzIE1lbWJlcnMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcclxuICBhZGRQcm9wZXJ0eVJlZihuYW1lLCBvYmopIHtcclxuICAgIHZhciBmbjtcclxuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopID09PSAtMSkge1xyXG4gICAgICBmbiA9IGZ1bmN0aW9uKGludmFsaWRhdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AobmFtZSwgb2JqKTtcclxuICAgICAgfTtcclxuICAgICAgZm4ucmVmID0ge1xyXG4gICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgb2JqOiBvYmpcclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhZGRWYWx1ZVJlZih2YWwsIG5hbWUsIG9iaikge1xyXG4gICAgdmFyIGZuO1xyXG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XHJcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgICB9O1xyXG4gICAgICBmbi5yZWYgPSB7XHJcbiAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICBvYmo6IG9iaixcclxuICAgICAgICB2YWw6IHZhbFxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGZuKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldFZhbHVlUmVmKHZhbCwgbmFtZSwgb2JqKSB7XHJcbiAgICB2YXIgZm4sIGksIHJlZjtcclxuICAgIGkgPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xyXG4gICAgaWYgKGkgPT09IC0xKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkZFZhbHVlUmVmKHZhbCwgbmFtZSwgb2JqKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkucmVmLnZhbCAhPT0gdmFsKSB7XHJcbiAgICAgIHJlZiA9IHtcclxuICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgIG9iajogb2JqLFxyXG4gICAgICAgIHZhbDogdmFsXHJcbiAgICAgIH07XHJcbiAgICAgIGZuID0gZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgICB9O1xyXG4gICAgICBmbi5yZWYgPSByZWY7XHJcbiAgICAgIHJldHVybiB0aGlzLnNldChpLCBmbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRWYWx1ZVJlZihuYW1lLCBvYmopIHtcclxuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihuYW1lLCBvYmopLnJlZi52YWw7XHJcbiAgfVxyXG5cclxuICBhZGRGdW5jdGlvblJlZihmbiwgbmFtZSwgb2JqKSB7XHJcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKSA9PT0gLTEpIHtcclxuICAgICAgZm4ucmVmID0ge1xyXG4gICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgb2JqOiBvYmpcclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIHRoaXMucHVzaChmbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmaW5kQnlSZWYobmFtZSwgb2JqKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbdGhpcy5maW5kUmVmSW5kZXgobmFtZSwgb2JqKV07XHJcbiAgfVxyXG5cclxuICBmaW5kUmVmSW5kZXgobmFtZSwgb2JqKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmluZEluZGV4KGZ1bmN0aW9uKG1lbWJlcikge1xyXG4gICAgICByZXR1cm4gKG1lbWJlci5yZWYgIT0gbnVsbCkgJiYgbWVtYmVyLnJlZi5vYmogPT09IG9iaiAmJiBtZW1iZXIucmVmLm5hbWUgPT09IG5hbWU7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHJlbW92ZVJlZihuYW1lLCBvYmopIHtcclxuICAgIHZhciBpbmRleCwgb2xkO1xyXG4gICAgaW5kZXggPSB0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopO1xyXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKTtcclxuICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlZChvbGQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn07XHJcblxyXG5yZXR1cm4oQ29tcG9zZWRQcm9wZXJ0eSk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9Db21wb3NlZFByb3BlcnR5LmpzLm1hcFxyXG4iLCIoZnVuY3Rpb24oZGVmaW5pdGlvbil7dmFyIER5bmFtaWNQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7RHluYW1pY1Byb3BlcnR5LmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9RHluYW1pY1Byb3BlcnR5O31lbHNle2lmKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCImJlNwYXJrIT09bnVsbCl7U3BhcmsuRHluYW1pY1Byb3BlcnR5PUR5bmFtaWNQcm9wZXJ0eTt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLkR5bmFtaWNQcm9wZXJ0eT1EeW5hbWljUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cclxudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xyXG52YXIgQmFzaWNQcm9wZXJ0eSA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkJhc2ljUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuQmFzaWNQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQmFzaWNQcm9wZXJ0eScpO1xyXG52YXIgRHluYW1pY1Byb3BlcnR5O1xyXG5EeW5hbWljUHJvcGVydHkgPSBjbGFzcyBEeW5hbWljUHJvcGVydHkgZXh0ZW5kcyBCYXNpY1Byb3BlcnR5IHtcclxuICBjYWxsYmFja0dldCgpIHtcclxuICAgIHZhciByZXM7XHJcbiAgICByZXMgPSB0aGlzLmNhbGxPcHRpb25GdW5jdChcImdldFwiKTtcclxuICAgIHRoaXMucmV2YWxpZGF0ZWQoKTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfVxyXG5cclxuICBpbnZhbGlkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuY2FsY3VsYXRlZCB8fCB0aGlzLmFjdGl2ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgdGhpcy5jYWxjdWxhdGVkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVOb3RpY2UoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgX2ludmFsaWRhdGVOb3RpY2UoKSB7XHJcbiAgICBpZiAodGhpcy5pc0ltbWVkaWF0ZSgpKSB7XHJcbiAgICAgIHRoaXMuZ2V0KCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vYmouZW1pdEV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5vYmouZW1pdEV2ZW50KHRoaXMuaW52YWxpZGF0ZUV2ZW50TmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpc0ltbWVkaWF0ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLnByb3BlcnR5Lm9wdGlvbnMuaW1tZWRpYXRlICE9PSBmYWxzZSAmJiAodGhpcy5wcm9wZXJ0eS5vcHRpb25zLmltbWVkaWF0ZSA9PT0gdHJ1ZSB8fCAodHlwZW9mIHRoaXMucHJvcGVydHkub3B0aW9ucy5pbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgPyB0aGlzLmNhbGxPcHRpb25GdW5jdChcImltbWVkaWF0ZVwiKSA6IHRoaXMuaGFzQ2hhbmdlZEV2ZW50cygpIHx8IHRoaXMuaGFzQ2hhbmdlZEZ1bmN0aW9ucygpKSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY29tcG9zZShwcm9wKSB7XHJcbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHByb3Aub3B0aW9ucy5hY3RpdmUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgaWYgKHByb3AuaW5zdGFuY2VUeXBlID09IG51bGwpIHtcclxuICAgICAgICBwcm9wLmluc3RhbmNlVHlwZSA9IGNsYXNzIGV4dGVuZHMgRHluYW1pY1Byb3BlcnR5IHt9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLnByb3RvdHlwZS5nZXQgPSB0aGlzLnByb3RvdHlwZS5jYWxsYmFja0dldDtcclxuICAgIH1cclxuICB9XHJcblxyXG59O1xyXG5cclxucmV0dXJuKER5bmFtaWNQcm9wZXJ0eSk7fSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvUHJvcGVydHlUeXBlcy9EeW5hbWljUHJvcGVydHkuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgSW52YWxpZGF0ZWRQcm9wZXJ0eT1kZWZpbml0aW9uKHR5cGVvZiBTcGFyayE9PVwidW5kZWZpbmVkXCI/U3Bhcms6dGhpcy5TcGFyayk7SW52YWxpZGF0ZWRQcm9wZXJ0eS5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPUludmFsaWRhdGVkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5JbnZhbGlkYXRlZFByb3BlcnR5PUludmFsaWRhdGVkUHJvcGVydHk7fWVsc2V7aWYodGhpcy5TcGFyaz09bnVsbCl7dGhpcy5TcGFyaz17fTt9dGhpcy5TcGFyay5JbnZhbGlkYXRlZFByb3BlcnR5PUludmFsaWRhdGVkUHJvcGVydHk7fX19KShmdW5jdGlvbihkZXBlbmRlbmNpZXMpe2lmKGRlcGVuZGVuY2llcz09bnVsbCl7ZGVwZW5kZW5jaWVzPXt9O31cclxudmFyIEludmFsaWRhdG9yID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiSW52YWxpZGF0b3JcIikgPyBkZXBlbmRlbmNpZXMuSW52YWxpZGF0b3IgOiByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpO1xyXG52YXIgQ2FsY3VsYXRlZFByb3BlcnR5ID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQ2FsY3VsYXRlZFByb3BlcnR5XCIpID8gZGVwZW5kZW5jaWVzLkNhbGN1bGF0ZWRQcm9wZXJ0eSA6IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZFByb3BlcnR5Jyk7XHJcbnZhciBJbnZhbGlkYXRlZFByb3BlcnR5O1xyXG5JbnZhbGlkYXRlZFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xyXG4gIGNsYXNzIEludmFsaWRhdGVkUHJvcGVydHkgZXh0ZW5kcyBDYWxjdWxhdGVkUHJvcGVydHkge1xyXG4gICAgdW5rbm93bigpIHtcclxuICAgICAgaWYgKHRoaXMuY2FsY3VsYXRlZCB8fCB0aGlzLmFjdGl2ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNvbXBvc2UocHJvcCkge1xyXG4gICAgICBpZiAodHlwZW9mIHByb3Aub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicgJiYgcHJvcC5vcHRpb25zLmNhbGN1bC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHByb3AuaW5zdGFuY2VUeXBlLmV4dGVuZChJbnZhbGlkYXRlZFByb3BlcnR5KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBJbnZhbGlkYXRlZFByb3BlcnR5Lm92ZXJyaWRlcyh7XHJcbiAgICBjYWxjdWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcclxuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMub2JqKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY2FsbE9wdGlvbkZ1bmN0KHRoaXMuY2FsY3VsRnVuY3QsIGludmFsaWRhdG9yKTtcclxuICAgICAgICB0aGlzLm1hbnVhbCA9IGZhbHNlO1xyXG4gICAgICAgIGRvbmUoKTtcclxuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvciA9IG51bGw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5iaW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5yZXZhbGlkYXRlZCgpO1xyXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH0sXHJcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5kZXN0cm95LndpdGhvdXRJbnZhbGlkYXRlZFByb3BlcnR5KCk7XHJcbiAgICAgIGlmICh0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGludmFsaWRhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy5jYWxjdWxhdGVkIHx8IHRoaXMuYWN0aXZlID09PSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnZhbGlkYXRlTm90aWNlKCkgJiYgIXRoaXMuY2FsY3VsYXRlZCAmJiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSkge1xyXG4gICAgICAgICAgdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBJbnZhbGlkYXRlZFByb3BlcnR5O1xyXG5cclxufSkuY2FsbCh0aGlzKTtcclxuXHJcbnJldHVybihJbnZhbGlkYXRlZFByb3BlcnR5KTt9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL0ludmFsaWRhdGVkUHJvcGVydHkuanMubWFwXHJcbiIsIihmdW5jdGlvbihkZWZpbml0aW9uKXt2YXIgVXBkYXRlZFByb3BlcnR5PWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtVcGRhdGVkUHJvcGVydHkuZGVmaW5pdGlvbj1kZWZpbml0aW9uO2lmKHR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiJiZtb2R1bGUhPT1udWxsKXttb2R1bGUuZXhwb3J0cz1VcGRhdGVkUHJvcGVydHk7fWVsc2V7aWYodHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIiYmU3BhcmshPT1udWxsKXtTcGFyay5VcGRhdGVkUHJvcGVydHk9VXBkYXRlZFByb3BlcnR5O31lbHNle2lmKHRoaXMuU3Bhcms9PW51bGwpe3RoaXMuU3Bhcms9e307fXRoaXMuU3BhcmsuVXBkYXRlZFByb3BlcnR5PVVwZGF0ZWRQcm9wZXJ0eTt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxyXG52YXIgSW52YWxpZGF0b3IgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJJbnZhbGlkYXRvclwiKSA/IGRlcGVuZGVuY2llcy5JbnZhbGlkYXRvciA6IHJlcXVpcmUoJy4uL0ludmFsaWRhdG9yJyk7XHJcbnZhciBEeW5hbWljUHJvcGVydHkgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJEeW5hbWljUHJvcGVydHlcIikgPyBkZXBlbmRlbmNpZXMuRHluYW1pY1Byb3BlcnR5IDogcmVxdWlyZSgnLi9EeW5hbWljUHJvcGVydHknKTtcclxudmFyIE92ZXJyaWRlciA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIk92ZXJyaWRlclwiKSA/IGRlcGVuZGVuY2llcy5PdmVycmlkZXIgOiByZXF1aXJlKCcuLi9PdmVycmlkZXInKTtcclxudmFyIFVwZGF0ZWRQcm9wZXJ0eTtcclxuVXBkYXRlZFByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xyXG4gIGNsYXNzIFVwZGF0ZWRQcm9wZXJ0eSBleHRlbmRzIER5bmFtaWNQcm9wZXJ0eSB7XHJcbiAgICBpbml0UmV2YWxpZGF0ZSgpIHtcclxuICAgICAgdGhpcy5yZXZhbGlkYXRlQ2FsbGJhY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5nZXQoKTtcclxuICAgICAgICB0aGlzLmdldFVwZGF0ZXIoKS51bmJpbmQoKTtcclxuICAgICAgICBpZiAodGhpcy5wZW5kaW5nQ2hhbmdlcykge1xyXG4gICAgICAgICAgdGhpcy5jaGFuZ2VkKHRoaXMucGVuZGluZ09sZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XHJcbiAgICAgIH07XHJcbiAgICAgIHJldHVybiB0aGlzLnJldmFsaWRhdGVDYWxsYmFjay5vd25lciA9IHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VXBkYXRlcigpIHtcclxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZXIgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucHJvcGVydHkub3B0aW9ucy51cGRhdGVyICE9IG51bGwpIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlciA9IHRoaXMucHJvcGVydHkub3B0aW9ucy51cGRhdGVyO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZXIuZ2V0QmluZGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlciA9IHRoaXMudXBkYXRlci5nZXRCaW5kZXIoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy51cGRhdGVyLmJpbmQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHRoaXMudXBkYXRlci51bmJpbmQgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVyID0gbnVsbDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlci5jYWxsYmFjayA9IHRoaXMucmV2YWxpZGF0ZUNhbGxiYWNrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVyO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjb21wb3NlKHByb3ApIHtcclxuICAgICAgaWYgKHByb3Aub3B0aW9ucy51cGRhdGVyICE9IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gcHJvcC5pbnN0YW5jZVR5cGUuZXh0ZW5kKFVwZGF0ZWRQcm9wZXJ0eSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgVXBkYXRlZFByb3BlcnR5LmV4dGVuZChPdmVycmlkZXIpO1xyXG5cclxuICBVcGRhdGVkUHJvcGVydHkub3ZlcnJpZGVzKHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLmluaXQud2l0aG91dFVwZGF0ZWRQcm9wZXJ0eSgpO1xyXG4gICAgICByZXR1cm4gdGhpcy5pbml0UmV2YWxpZGF0ZSgpO1xyXG4gICAgfSxcclxuICAgIF9pbnZhbGlkYXRlTm90aWNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIHJlcztcclxuICAgICAgcmVzID0gdGhpcy5faW52YWxpZGF0ZU5vdGljZS53aXRob3V0VXBkYXRlZFByb3BlcnR5KCk7XHJcbiAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICB0aGlzLmdldFVwZGF0ZXIoKS5iaW5kKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0sXHJcbiAgICBpc0ltbWVkaWF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBjaGFuZ2VkOiBmdW5jdGlvbihvbGQpIHtcclxuICAgICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcclxuICAgICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nT2xkID0gdm9pZCAwO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlZC53aXRob3V0VXBkYXRlZFByb3BlcnR5KG9sZCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBlbmRpbmdPbGQgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmdPbGQgPSBvbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2V0VXBkYXRlcigpLmJpbmQoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIFVwZGF0ZWRQcm9wZXJ0eTtcclxuXHJcbn0pLmNhbGwodGhpcyk7XHJcblxyXG5yZXR1cm4oVXBkYXRlZFByb3BlcnR5KTt9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9Qcm9wZXJ0eVR5cGVzL1VwZGF0ZWRQcm9wZXJ0eS5qcy5tYXBcclxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBVcGRhdGVyPWRlZmluaXRpb24odHlwZW9mIFNwYXJrIT09XCJ1bmRlZmluZWRcIj9TcGFyazp0aGlzLlNwYXJrKTtVcGRhdGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9VXBkYXRlcjt9ZWxzZXtpZih0eXBlb2YgU3BhcmshPT1cInVuZGVmaW5lZFwiJiZTcGFyayE9PW51bGwpe1NwYXJrLlVwZGF0ZXI9VXBkYXRlcjt9ZWxzZXtpZih0aGlzLlNwYXJrPT1udWxsKXt0aGlzLlNwYXJrPXt9O310aGlzLlNwYXJrLlVwZGF0ZXI9VXBkYXRlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxyXG52YXIgQmluZGVyID0gZGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KFwiQmluZGVyXCIpID8gZGVwZW5kZW5jaWVzLkJpbmRlciA6IHJlcXVpcmUoJy4vQmluZGVyJyk7XHJcbnZhciBVcGRhdGVyO1xyXG5VcGRhdGVyID0gY2xhc3MgVXBkYXRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xyXG4gICAgdGhpcy5uZXh0ID0gW107XHJcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICB2YXIgY2FsbGJhY2s7XHJcbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcclxuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XHJcbiAgICB3aGlsZSAodGhpcy5jYWxsYmFja3MubGVuZ3RoID4gMCkge1xyXG4gICAgICBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tzLnNoaWZ0KCk7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcclxuICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgIGlmICghdGhpcy5jYWxsYmFja3MuaW5jbHVkZXMoY2FsbGJhY2spKSB7XHJcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudXBkYXRpbmcgJiYgIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5leHRUaWNrKGNhbGxiYWNrKSB7XHJcbiAgICBpZiAodGhpcy51cGRhdGluZykge1xyXG4gICAgICBpZiAoIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW1vdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgdmFyIGluZGV4O1xyXG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIGluZGV4ID0gdGhpcy5uZXh0LmluZGV4T2YoY2FsbGJhY2spO1xyXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRCaW5kZXIoKSB7XHJcbiAgICByZXR1cm4gbmV3IFVwZGF0ZXIuQmluZGVyKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgZGVzdHJveSgpIHtcclxuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XHJcbiAgICByZXR1cm4gdGhpcy5uZXh0ID0gW107XHJcbiAgfVxyXG5cclxufTtcclxuXHJcblVwZGF0ZXIuQmluZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcclxuICBjbGFzcyBCaW5kZXIgZXh0ZW5kcyBzdXBlckNsYXNzIHtcclxuICAgIGNvbnN0cnVjdG9yKHRhcmdldCwgY2FsbGJhY2sxKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sxO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJlZigpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxyXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZG9CaW5kKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQuYWRkQ2FsbGJhY2sodGhpcy5jYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZG9VbmJpbmQoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEJpbmRlcjtcclxuXHJcbn0pLmNhbGwodGhpcywgQmluZGVyKTtcclxuXHJcbnJldHVybihVcGRhdGVyKTt9KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9VcGRhdGVyLmpzLm1hcFxyXG4iLCJpZihtb2R1bGUpe1xyXG4gIG1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQmluZGVyOiByZXF1aXJlKCcuL0JpbmRlci5qcycpLFxyXG4gICAgQ29sbGVjdGlvbjogcmVxdWlyZSgnLi9Db2xsZWN0aW9uLmpzJyksXHJcbiAgICBFbGVtZW50OiByZXF1aXJlKCcuL0VsZW1lbnQuanMnKSxcclxuICAgIEV2ZW50QmluZDogcmVxdWlyZSgnLi9FdmVudEJpbmQuanMnKSxcclxuICAgIEV2ZW50RW1pdHRlcjogcmVxdWlyZSgnLi9FdmVudEVtaXR0ZXIuanMnKSxcclxuICAgIEludmFsaWRhdG9yOiByZXF1aXJlKCcuL0ludmFsaWRhdG9yLmpzJyksXHJcbiAgICBNaXhhYmxlOiByZXF1aXJlKCcuL01peGFibGUuanMnKSxcclxuICAgIE92ZXJyaWRlcjogcmVxdWlyZSgnLi9PdmVycmlkZXIuanMnKSxcclxuICAgIFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5LmpzJyksXHJcbiAgICBQcm9wZXJ0eU93bmVyOiByZXF1aXJlKCcuL1Byb3BlcnR5T3duZXIuanMnKSxcclxuICAgIFVwZGF0ZXI6IHJlcXVpcmUoJy4vVXBkYXRlci5qcycpLFxyXG4gICAgQWN0aXZhYmxlUHJvcGVydHk6IHJlcXVpcmUoJy4vUHJvcGVydHlUeXBlcy9BY3RpdmFibGVQcm9wZXJ0eS5qcycpLFxyXG4gICAgQmFzaWNQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0Jhc2ljUHJvcGVydHkuanMnKSxcclxuICAgIENhbGN1bGF0ZWRQcm9wZXJ0eTogcmVxdWlyZSgnLi9Qcm9wZXJ0eVR5cGVzL0NhbGN1bGF0ZWRQcm9wZXJ0eS5qcycpLFxyXG4gICAgQ29sbGVjdGlvblByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29sbGVjdGlvblByb3BlcnR5LmpzJyksXHJcbiAgICBDb21wb3NlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvQ29tcG9zZWRQcm9wZXJ0eS5qcycpLFxyXG4gICAgRHluYW1pY1Byb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvRHluYW1pY1Byb3BlcnR5LmpzJyksXHJcbiAgICBJbnZhbGlkYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvSW52YWxpZGF0ZWRQcm9wZXJ0eS5qcycpLFxyXG4gICAgVXBkYXRlZFByb3BlcnR5OiByZXF1aXJlKCcuL1Byb3BlcnR5VHlwZXMvVXBkYXRlZFByb3BlcnR5LmpzJylcclxuICB9O1xyXG59IiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBQYXRoRmluZGVyPWRlZmluaXRpb24odHlwZW9mIFBhcmFsbGVsaW8hPT1cInVuZGVmaW5lZFwiP1BhcmFsbGVsaW86dGhpcy5QYXJhbGxlbGlvKTtQYXRoRmluZGVyLmRlZmluaXRpb249ZGVmaW5pdGlvbjtpZih0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIiYmbW9kdWxlIT09bnVsbCl7bW9kdWxlLmV4cG9ydHM9UGF0aEZpbmRlcjt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9ZWxzZXtpZih0aGlzLlBhcmFsbGVsaW89PW51bGwpe3RoaXMuUGFyYWxsZWxpbz17fTt9dGhpcy5QYXJhbGxlbGlvLlBhdGhGaW5kZXI9UGF0aEZpbmRlcjt9fX0pKGZ1bmN0aW9uKGRlcGVuZGVuY2llcyl7aWYoZGVwZW5kZW5jaWVzPT1udWxsKXtkZXBlbmRlbmNpZXM9e307fVxudmFyIEVsZW1lbnQgPSBkZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkoXCJFbGVtZW50XCIpID8gZGVwZW5kZW5jaWVzLkVsZW1lbnQgOiByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudDtcbnZhciBQYXRoRmluZGVyO1xuUGF0aEZpbmRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgUGF0aEZpbmRlciBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzQ29udGFpbmVyLCBmcm9tMSwgdG8xLCBvcHRpb25zID0ge30pIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRpbGVzQ29udGFpbmVyID0gdGlsZXNDb250YWluZXI7XG4gICAgICB0aGlzLmZyb20gPSBmcm9tMTtcbiAgICAgIHRoaXMudG8gPSB0bzE7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICBpZiAob3B0aW9ucy52YWxpZFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnZhbGlkVGlsZUNhbGxiYWNrID0gb3B0aW9ucy52YWxpZFRpbGU7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5hcnJpdmVkICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hcnJpdmVkQ2FsbGJhY2sgPSBvcHRpb25zLmFycml2ZWQ7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5lZmZpY2llbmN5ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5Q2FsbGJhY2sgPSBvcHRpb25zLmVmZmljaWVuY3k7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICB0aGlzLnBhdGhzID0ge307XG4gICAgICB0aGlzLnNvbHV0aW9uID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjYWxjdWwoKSB7XG4gICAgICB3aGlsZSAoIXRoaXMuc29sdXRpb24gJiYgKCF0aGlzLnN0YXJ0ZWQgfHwgdGhpcy5xdWV1ZS5sZW5ndGgpKSB7XG4gICAgICAgIHRoaXMuc3RlcCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0aCgpO1xuICAgIH1cblxuICAgIHN0ZXAoKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wb3AoKTtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMobmV4dCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMudG8gPT09IGZhbHNlIHx8IHRoaXMudGlsZUlzVmFsaWQodGhpcy50bykpIHtcbiAgICAgICAgdGhpcy5hZGROZXh0U3RlcHMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UGF0aCgpIHtcbiAgICAgIHZhciByZXMsIHN0ZXA7XG4gICAgICBpZiAodGhpcy5zb2x1dGlvbikge1xuICAgICAgICByZXMgPSBbdGhpcy5zb2x1dGlvbl07XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICByZXMudW5zaGlmdChzdGVwLnByZXYpO1xuICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb3NBdFByYyhwcmMpIHtcbiAgICAgIGlmIChpc05hTihwcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFBvc0F0VGltZSh0aGlzLnNvbHV0aW9uLmdldFRvdGFsTGVuZ3RoKCkgKiBwcmMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc0F0VGltZSh0aW1lKSB7XG4gICAgICB2YXIgcHJjLCBzdGVwO1xuICAgICAgaWYgKHRoaXMuc29sdXRpb24pIHtcbiAgICAgICAgaWYgKHRpbWUgPj0gdGhpcy5zb2x1dGlvbi5nZXRUb3RhbExlbmd0aCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc29sdXRpb24ucG9zVG9UaWxlT2Zmc2V0KHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLngsIHRoaXMuc29sdXRpb24uZ2V0RXhpdCgpLnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICAgIHdoaWxlIChzdGVwLmdldFN0YXJ0TGVuZ3RoKCkgPiB0aW1lICYmIChzdGVwLnByZXYgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHN0ZXAgPSBzdGVwLnByZXY7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByYyA9ICh0aW1lIC0gc3RlcC5nZXRTdGFydExlbmd0aCgpKSAvIHN0ZXAuZ2V0TGVuZ3RoKCk7XG4gICAgICAgICAgcmV0dXJuIHN0ZXAucG9zVG9UaWxlT2Zmc2V0KHN0ZXAuZ2V0RW50cnkoKS54ICsgKHN0ZXAuZ2V0RXhpdCgpLnggLSBzdGVwLmdldEVudHJ5KCkueCkgKiBwcmMsIHN0ZXAuZ2V0RW50cnkoKS55ICsgKHN0ZXAuZ2V0RXhpdCgpLnkgLSBzdGVwLmdldEVudHJ5KCkueSkgKiBwcmMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U29sdXRpb25UaWxlTGlzdCgpIHtcbiAgICAgIHZhciBzdGVwLCB0aWxlbGlzdDtcbiAgICAgIGlmICh0aGlzLnNvbHV0aW9uKSB7XG4gICAgICAgIHN0ZXAgPSB0aGlzLnNvbHV0aW9uO1xuICAgICAgICB0aWxlbGlzdCA9IFtzdGVwLnRpbGVdO1xuICAgICAgICB3aGlsZSAoc3RlcC5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICBzdGVwID0gc3RlcC5wcmV2O1xuICAgICAgICAgIHRpbGVsaXN0LnVuc2hpZnQoc3RlcC50aWxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZWxpc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGlsZUlzVmFsaWQodGlsZSkge1xuICAgICAgaWYgKHRoaXMudmFsaWRUaWxlQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZFRpbGVDYWxsYmFjayh0aWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodGlsZSAhPSBudWxsKSAmJiAoIXRpbGUuZW11bGF0ZWQgfHwgKHRpbGUudGlsZSAhPT0gMCAmJiB0aWxlLnRpbGUgIT09IGZhbHNlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VGlsZSh4LCB5KSB7XG4gICAgICB2YXIgcmVmMTtcbiAgICAgIGlmICh0aGlzLnRpbGVzQ29udGFpbmVyLmdldFRpbGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc0NvbnRhaW5lci5nZXRUaWxlKHgsIHkpO1xuICAgICAgfSBlbHNlIGlmICgoKHJlZjEgPSB0aGlzLnRpbGVzQ29udGFpbmVyW3ldKSAhPSBudWxsID8gcmVmMVt4XSA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgeTogeSxcbiAgICAgICAgICB0aWxlOiB0aGlzLnRpbGVzQ29udGFpbmVyW3ldW3hdLFxuICAgICAgICAgIGVtdWxhdGVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0Q29ubmVjdGVkVG9UaWxlKHRpbGUpIHtcbiAgICAgIHZhciBjb25uZWN0ZWQsIHQ7XG4gICAgICBpZiAodGlsZS5nZXRDb25uZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGlsZS5nZXRDb25uZWN0ZWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbm5lY3RlZCA9IFtdO1xuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLnggKyAxLCB0aWxlLnkpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPSB0aGlzLmdldFRpbGUodGlsZS54IC0gMSwgdGlsZS55KSkge1xuICAgICAgICAgIGNvbm5lY3RlZC5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ID0gdGhpcy5nZXRUaWxlKHRpbGUueCwgdGlsZS55ICsgMSkpIHtcbiAgICAgICAgICBjb25uZWN0ZWQucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodCA9IHRoaXMuZ2V0VGlsZSh0aWxlLngsIHRpbGUueSAtIDEpKSB7XG4gICAgICAgICAgY29ubmVjdGVkLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbm5lY3RlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGROZXh0U3RlcHMoc3RlcCA9IG51bGwpIHtcbiAgICAgIHZhciBpLCBsZW4sIG5leHQsIHJlZjEsIHJlc3VsdHMsIHRpbGU7XG4gICAgICB0aWxlID0gc3RlcCAhPSBudWxsID8gc3RlcC5uZXh0VGlsZSA6IHRoaXMuZnJvbTtcbiAgICAgIHJlZjEgPSB0aGlzLmdldENvbm5lY3RlZFRvVGlsZSh0aWxlKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZjEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgbmV4dCA9IHJlZjFbaV07XG4gICAgICAgIGlmICh0aGlzLnRpbGVJc1ZhbGlkKG5leHQpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYWRkU3RlcChuZXcgUGF0aEZpbmRlci5TdGVwKHRoaXMsIChzdGVwICE9IG51bGwgPyBzdGVwIDogbnVsbCksIHRpbGUsIG5leHQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIHRpbGVFcXVhbCh0aWxlQSwgdGlsZUIpIHtcbiAgICAgIHJldHVybiB0aWxlQSA9PT0gdGlsZUIgfHwgKCh0aWxlQS5lbXVsYXRlZCB8fCB0aWxlQi5lbXVsYXRlZCkgJiYgdGlsZUEueCA9PT0gdGlsZUIueCAmJiB0aWxlQS55ID09PSB0aWxlQi55KTtcbiAgICB9XG5cbiAgICBhcnJpdmVkQXREZXN0aW5hdGlvbihzdGVwKSB7XG4gICAgICBpZiAodGhpcy5hcnJpdmVkQ2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcnJpdmVkQ2FsbGJhY2soc3RlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlRXF1YWwoc3RlcC50aWxlLCB0aGlzLnRvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBzb2x1dGlvbkNhbmRpZGF0ZTtcbiAgICAgIGlmICh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XSA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKCEoKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkgJiYgdGhpcy5wYXRoc1tzdGVwLmdldEV4aXQoKS54XVtzdGVwLmdldEV4aXQoKS55XS5nZXRUb3RhbExlbmd0aCgpIDw9IHN0ZXAuZ2V0VG90YWxMZW5ndGgoKSkpIHtcbiAgICAgICAgaWYgKHRoaXMucGF0aHNbc3RlcC5nZXRFeGl0KCkueF1bc3RlcC5nZXRFeGl0KCkueV0gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlU3RlcCh0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhdGhzW3N0ZXAuZ2V0RXhpdCgpLnhdW3N0ZXAuZ2V0RXhpdCgpLnldID0gc3RlcDtcbiAgICAgICAgdGhpcy5xdWV1ZS5zcGxpY2UodGhpcy5nZXRTdGVwUmFuayhzdGVwKSwgMCwgc3RlcCk7XG4gICAgICAgIHNvbHV0aW9uQ2FuZGlkYXRlID0gbmV3IFBhdGhGaW5kZXIuU3RlcCh0aGlzLCBzdGVwLCBzdGVwLm5leHRUaWxlLCBudWxsKTtcbiAgICAgICAgaWYgKHRoaXMuYXJyaXZlZEF0RGVzdGluYXRpb24oc29sdXRpb25DYW5kaWRhdGUpICYmICEoKHRoaXMuc29sdXRpb24gIT0gbnVsbCkgJiYgdGhpcy5zb2x1dGlvbi5wcmV2LmdldFRvdGFsTGVuZ3RoKCkgPD0gc3RlcC5nZXRUb3RhbExlbmd0aCgpKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNvbHV0aW9uID0gc29sdXRpb25DYW5kaWRhdGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVTdGVwKHN0ZXApIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIGluZGV4ID0gdGhpcy5xdWV1ZS5pbmRleE9mKHN0ZXApO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBiZXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5xdWV1ZS5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBnZXRTdGVwUmFuayhzdGVwKSB7XG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3RlcFJhbmsoc3RlcC5nZXRFZmZpY2llbmN5KCksIDAsIHRoaXMucXVldWUubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgbWF4KSB7XG4gICAgICB2YXIgcmVmLCByZWZQb3M7XG4gICAgICByZWZQb3MgPSBNYXRoLmZsb29yKChtYXggLSBtaW4pIC8gMikgKyBtaW47XG4gICAgICByZWYgPSB0aGlzLnF1ZXVlW3JlZlBvc10uZ2V0RWZmaWNpZW5jeSgpO1xuICAgICAgaWYgKHJlZiA9PT0gZWZmaWNpZW5jeSkge1xuICAgICAgICByZXR1cm4gcmVmUG9zO1xuICAgICAgfSBlbHNlIGlmIChyZWYgPiBlZmZpY2llbmN5KSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1pbikge1xuICAgICAgICAgIHJldHVybiBtaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0ZXBSYW5rKGVmZmljaWVuY3ksIG1pbiwgcmVmUG9zIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZWZQb3MgPT09IG1heCkge1xuICAgICAgICAgIHJldHVybiBtYXggKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRTdGVwUmFuayhlZmZpY2llbmN5LCByZWZQb3MgKyAxLCBtYXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgUGF0aEZpbmRlci5wcm9wZXJ0aWVzKHtcbiAgICB2YWxpZFRpbGVDYWxsYmFjazoge31cbiAgfSk7XG5cbiAgcmV0dXJuIFBhdGhGaW5kZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cblBhdGhGaW5kZXIuU3RlcCA9IGNsYXNzIFN0ZXAge1xuICBjb25zdHJ1Y3RvcihwYXRoRmluZGVyLCBwcmV2LCB0aWxlMSwgbmV4dFRpbGUpIHtcbiAgICB0aGlzLnBhdGhGaW5kZXIgPSBwYXRoRmluZGVyO1xuICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgdGhpcy50aWxlID0gdGlsZTE7XG4gICAgdGhpcy5uZXh0VGlsZSA9IG5leHRUaWxlO1xuICB9XG5cbiAgcG9zVG9UaWxlT2Zmc2V0KHgsIHkpIHtcbiAgICB2YXIgdGlsZTtcbiAgICB0aWxlID0gTWF0aC5mbG9vcih4KSA9PT0gdGhpcy50aWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy50aWxlLnkgPyB0aGlzLnRpbGUgOiAodGhpcy5uZXh0VGlsZSAhPSBudWxsKSAmJiBNYXRoLmZsb29yKHgpID09PSB0aGlzLm5leHRUaWxlLnggJiYgTWF0aC5mbG9vcih5KSA9PT0gdGhpcy5uZXh0VGlsZS55ID8gdGhpcy5uZXh0VGlsZSA6ICh0aGlzLnByZXYgIT0gbnVsbCkgJiYgTWF0aC5mbG9vcih4KSA9PT0gdGhpcy5wcmV2LnRpbGUueCAmJiBNYXRoLmZsb29yKHkpID09PSB0aGlzLnByZXYudGlsZS55ID8gdGhpcy5wcmV2LnRpbGUgOiBjb25zb2xlLmxvZygnTWF0aC5mbG9vcignICsgeCArICcpID09ICcgKyB0aGlzLnRpbGUueCwgJ01hdGguZmxvb3IoJyArIHkgKyAnKSA9PSAnICsgdGhpcy50aWxlLnksIHRoaXMpO1xuICAgIHJldHVybiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICBvZmZzZXRYOiB4IC0gdGlsZS54LFxuICAgICAgb2Zmc2V0WTogeSAtIHRpbGUueVxuICAgIH07XG4gIH1cblxuICBnZXRFeGl0KCkge1xuICAgIGlmICh0aGlzLmV4aXQgPT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMubmV4dFRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmV4aXQgPSB7XG4gICAgICAgICAgeDogKHRoaXMudGlsZS54ICsgdGhpcy5uZXh0VGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMubmV4dFRpbGUueSArIDEpIC8gMlxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5leGl0ID0ge1xuICAgICAgICAgIHg6IHRoaXMudGlsZS54ICsgMC41LFxuICAgICAgICAgIHk6IHRoaXMudGlsZS55ICsgMC41XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4aXQ7XG4gIH1cblxuICBnZXRFbnRyeSgpIHtcbiAgICBpZiAodGhpcy5lbnRyeSA9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5wcmV2ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5lbnRyeSA9IHtcbiAgICAgICAgICB4OiAodGhpcy50aWxlLnggKyB0aGlzLnByZXYudGlsZS54ICsgMSkgLyAyLFxuICAgICAgICAgIHk6ICh0aGlzLnRpbGUueSArIHRoaXMucHJldi50aWxlLnkgKyAxKSAvIDJcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZW50cnkgPSB7XG4gICAgICAgICAgeDogdGhpcy50aWxlLnggKyAwLjUsXG4gICAgICAgICAgeTogdGhpcy50aWxlLnkgKyAwLjVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW50cnk7XG4gIH1cblxuICBnZXRMZW5ndGgoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gKHRoaXMubmV4dFRpbGUgPT0gbnVsbCkgfHwgKHRoaXMucHJldiA9PSBudWxsKSA/IDAuNSA6IHRoaXMucHJldi50aWxlLnggPT09IHRoaXMubmV4dFRpbGUueCB8fCB0aGlzLnByZXYudGlsZS55ID09PSB0aGlzLm5leHRUaWxlLnkgPyAxIDogTWF0aC5zcXJ0KDAuNSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmxlbmd0aDtcbiAgfVxuXG4gIGdldFN0YXJ0TGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLnN0YXJ0TGVuZ3RoID09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhcnRMZW5ndGggPSB0aGlzLnByZXYgIT0gbnVsbCA/IHRoaXMucHJldi5nZXRUb3RhbExlbmd0aCgpIDogMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRMZW5ndGg7XG4gIH1cblxuICBnZXRUb3RhbExlbmd0aCgpIHtcbiAgICBpZiAodGhpcy50b3RhbExlbmd0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnRvdGFsTGVuZ3RoID0gdGhpcy5nZXRTdGFydExlbmd0aCgpICsgdGhpcy5nZXRMZW5ndGgoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG90YWxMZW5ndGg7XG4gIH1cblxuICBnZXRFZmZpY2llbmN5KCkge1xuICAgIGlmICh0aGlzLmVmZmljaWVuY3kgPT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhdGhGaW5kZXIuZWZmaWNpZW5jeUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5lZmZpY2llbmN5ID0gdGhpcy5wYXRoRmluZGVyLmVmZmljaWVuY3lDYWxsYmFjayh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWZmaWNpZW5jeSA9IC10aGlzLmdldFJlbWFpbmluZygpICogMS4xIC0gdGhpcy5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lZmZpY2llbmN5O1xuICB9XG5cbiAgZ2V0UmVtYWluaW5nKCkge1xuICAgIHZhciBmcm9tLCB0bywgeCwgeTtcbiAgICBpZiAodGhpcy5yZW1haW5pbmcgPT0gbnVsbCkge1xuICAgICAgZnJvbSA9IHRoaXMuZ2V0RXhpdCgpO1xuICAgICAgdG8gPSB7XG4gICAgICAgIHg6IHRoaXMucGF0aEZpbmRlci50by54ICsgMC41LFxuICAgICAgICB5OiB0aGlzLnBhdGhGaW5kZXIudG8ueSArIDAuNVxuICAgICAgfTtcbiAgICAgIHggPSB0by54IC0gZnJvbS54O1xuICAgICAgeSA9IHRvLnkgLSBmcm9tLnk7XG4gICAgICB0aGlzLnJlbWFpbmluZyA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVtYWluaW5nO1xuICB9XG5cbn07XG5cbnJldHVybihQYXRoRmluZGVyKTt9KTsiLCJ2YXIgRWxlbWVudCwgTWl4YWJsZSwgUHJvcGVydGllc01hbmFnZXI7XG5cblByb3BlcnRpZXNNYW5hZ2VyID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLlByb3BlcnRpZXNNYW5hZ2VyO1xuXG5NaXhhYmxlID0gcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRWxlbWVudCBleHRlbmRzIE1peGFibGUge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmluaXRQcm9wZXJ0aWVzTWFuYWdlcihkYXRhKTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5pbml0V2F0Y2hlcnMoKTtcbiAgICB9XG5cbiAgICBpbml0UHJvcGVydGllc01hbmFnZXIoZGF0YSkge1xuICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlciA9IHRoaXMucHJvcGVydGllc01hbmFnZXIudXNlU2NvcGUodGhpcyk7XG4gICAgICB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmluaXRQcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLmNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycygpO1xuICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuc2V0UHJvcGVydGllc0RhdGEoZGF0YSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGFwKG5hbWUpIHtcbiAgICAgIHZhciBhcmdzO1xuICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbmFtZS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncy5zbGljZSgxKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjYWxsYmFjayhuYW1lKSB7XG4gICAgICBpZiAodGhpcy5fY2FsbGJhY2tzID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY2FsbGJhY2tzW25hbWVdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2tzW25hbWVdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0ub3duZXIgPSB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tuYW1lXTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICAgIHJldHVybiBbJ3Byb3BlcnRpZXNNYW5hZ2VyJ107XG4gICAgfVxuXG4gICAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJvcGVydGllc01hbmFnZXIgPSB0YXJnZXQucHJvcGVydGllc01hbmFnZXIuY29weVdpdGgodGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5wcm9wZXJ0aWVzT3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyID0gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydHkocHJvcCwgZGVzYykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLnByb3BlcnRpZXNNYW5hZ2VyID0gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIud2l0aFByb3BlcnR5KHByb3AsIGRlc2MpO1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3RvdHlwZS5wcm9wZXJ0aWVzTWFuYWdlciA9IHRoaXMucHJvdG90eXBlLnByb3BlcnRpZXNNYW5hZ2VyLmNvcHlXaXRoKHByb3BlcnRpZXMpO1xuICAgIH1cblxuICB9O1xuXG4gIEVsZW1lbnQucHJvdG90eXBlLnByb3BlcnRpZXNNYW5hZ2VyID0gbmV3IFByb3BlcnRpZXNNYW5hZ2VyKCk7XG5cbiAgcmV0dXJuIEVsZW1lbnQ7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvRWxlbWVudC5qcy5tYXBcbiIsInZhciBBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIsIEludmFsaWRhdG9yLCBQcm9wZXJ0eVdhdGNoZXI7XG5cblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJ3NwYXJrLXByb3BlcnRpZXMnKS53YXRjaGVycy5Qcm9wZXJ0eVdhdGNoZXI7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLkludmFsaWRhdG9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlciA9IGNsYXNzIEFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlciBleHRlbmRzIFByb3BlcnR5V2F0Y2hlciB7XG4gIGxvYWRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBzdXBlci5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmUgPSBvcHRpb25zLmFjdGl2ZTtcbiAgfVxuXG4gIHNob3VsZEJpbmQoKSB7XG4gICAgdmFyIGFjdGl2ZTtcbiAgICBpZiAodGhpcy5hY3RpdmUgIT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuaW52YWxpZGF0b3IgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMuc2NvcGUpO1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yLmNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrQmluZCgpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKCk7XG4gICAgICBhY3RpdmUgPSB0aGlzLmFjdGl2ZSh0aGlzLmludmFsaWRhdG9yKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IuZW5kUmVjeWNsZSgpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgICByZXR1cm4gYWN0aXZlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Li4vbWFwcy9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIuanMubWFwXG4iLCJ2YXIgSW52YWxpZGF0ZWQsIEludmFsaWRhdG9yO1xuXG5JbnZhbGlkYXRvciA9IHJlcXVpcmUoJ3NwYXJrLXByb3BlcnRpZXMnKS5JbnZhbGlkYXRvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnZhbGlkYXRlZCA9IGNsYXNzIEludmFsaWRhdGVkIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMubG9hZE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuICAgIGlmICghKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmluaXRCeUxvYWRlciA6IHZvaWQgMCkgJiYgKG9wdGlvbnMubG9hZGVyICE9IG51bGwpKSkge1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICB9XG5cbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xuICAgIGlmIChvcHRpb25zLmxvYWRlckFzU2NvcGUgJiYgKG9wdGlvbnMubG9hZGVyICE9IG51bGwpKSB7XG4gICAgICB0aGlzLnNjb3BlID0gb3B0aW9ucy5sb2FkZXI7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICB1bmtub3duKCkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnZhbGlkYXRlVW5rbm93bnMoKTtcbiAgfVxuXG4gIGludmFsaWRhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0b3IgPT0gbnVsbCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLCB0aGlzLnNjb3BlKTtcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKCk7XG4gICAgdGhpcy5oYW5kbGVVcGRhdGUodGhpcy5pbnZhbGlkYXRvcik7XG4gICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgdGhpcy5pbnZhbGlkYXRvci5iaW5kKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBoYW5kbGVVcGRhdGUoaW52YWxpZGF0b3IpIHtcbiAgICBpZiAodGhpcy5zY29wZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuc2NvcGUsIGludmFsaWRhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soaW52YWxpZGF0b3IpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0ludmFsaWRhdGVkLmpzLm1hcFxuIiwidmFyIExvYWRlciwgT3ZlcnJpZGVyO1xuXG5PdmVycmlkZXIgPSByZXF1aXJlKCcuL092ZXJyaWRlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTG9hZGVyIGV4dGVuZHMgT3ZlcnJpZGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmluaXRQcmVsb2FkZWQoKTtcbiAgICB9XG5cbiAgICBpbml0UHJlbG9hZGVkKCkge1xuICAgICAgdmFyIGRlZkxpc3Q7XG4gICAgICBkZWZMaXN0ID0gdGhpcy5wcmVsb2FkZWQ7XG4gICAgICB0aGlzLnByZWxvYWRlZCA9IFtdO1xuICAgICAgcmV0dXJuIHRoaXMubG9hZChkZWZMaXN0KTtcbiAgICB9XG5cbiAgICBsb2FkKGRlZkxpc3QpIHtcbiAgICAgIHZhciBsb2FkZWQsIHRvTG9hZDtcbiAgICAgIHRvTG9hZCA9IFtdO1xuICAgICAgbG9hZGVkID0gZGVmTGlzdC5tYXAoKGRlZikgPT4ge1xuICAgICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICAgIGlmIChkZWYuaW5zdGFuY2UgPT0gbnVsbCkge1xuICAgICAgICAgIGRlZiA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgbG9hZGVyOiB0aGlzXG4gICAgICAgICAgfSwgZGVmKTtcbiAgICAgICAgICBpbnN0YW5jZSA9IExvYWRlci5sb2FkKGRlZik7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGlmIChkZWYuaW5pdEJ5TG9hZGVyICYmIChpbnN0YW5jZS5pbml0ICE9IG51bGwpKSB7XG4gICAgICAgICAgICB0b0xvYWQucHVzaChpbnN0YW5jZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWY7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gdGhpcy5wcmVsb2FkZWQuY29uY2F0KGxvYWRlZCk7XG4gICAgICByZXR1cm4gdG9Mb2FkLmZvckVhY2goZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmluaXQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZWxvYWQoZGVmKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGVmKSkge1xuICAgICAgICBkZWYgPSBbZGVmXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnByZWxvYWRlZCA9ICh0aGlzLnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KGRlZik7XG4gICAgfVxuXG4gICAgZGVzdHJveUxvYWRlZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnByZWxvYWRlZC5mb3JFYWNoKGZ1bmN0aW9uKGRlZikge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICByZXR1cm4gKHJlZiA9IGRlZi5pbnN0YW5jZSkgIT0gbnVsbCA/IHR5cGVvZiByZWYuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiID8gcmVmLmRlc3Ryb3koKSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEZpbmFsUHJvcGVydGllcygpIHtcbiAgICAgIHJldHVybiBzdXBlci5nZXRGaW5hbFByb3BlcnRpZXMoKS5jb25jYXQoWydwcmVsb2FkZWQnXSk7XG4gICAgfVxuXG4gICAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgICBzdXBlci5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgaWYgKHRoaXMucHJlbG9hZGVkKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJlbG9hZGVkID0gKHRhcmdldC5wcmVsb2FkZWQgfHwgW10pLmNvbmNhdCh0aGlzLnByZWxvYWRlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWRNYW55KGRlZikge1xuICAgICAgcmV0dXJuIGRlZi5tYXAoKGQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZChkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkKGRlZikge1xuICAgICAgaWYgKHR5cGVvZiBkZWYudHlwZS5jb3B5V2l0aCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBkZWYudHlwZS5jb3B5V2l0aChkZWYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBkZWYudHlwZShkZWYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBwcmVsb2FkKGRlZikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLnByZWxvYWQoZGVmKTtcbiAgICB9XG5cbiAgfTtcblxuICBMb2FkZXIucHJvdG90eXBlLnByZWxvYWRlZCA9IFtdO1xuXG4gIExvYWRlci5vdmVycmlkZXMoe1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5pbml0LndpdGhvdXRMb2FkZXIoKTtcbiAgICAgIHJldHVybiB0aGlzLmluaXRQcmVsb2FkZWQoKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kZXN0cm95LndpdGhvdXRMb2FkZXIoKTtcbiAgICAgIHJldHVybiB0aGlzLmRlc3Ryb3lMb2FkZWQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBMb2FkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvTG9hZGVyLmpzLm1hcFxuIiwidmFyIE1peGFibGUsXG4gIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1peGFibGUgPSAoZnVuY3Rpb24oKSB7XG4gIGNsYXNzIE1peGFibGUge1xuICAgIHN0YXRpYyBleHRlbmQob2JqKSB7XG4gICAgICB0aGlzLkV4dGVuc2lvbi5tYWtlKG9iaiwgdGhpcyk7XG4gICAgICBpZiAob2JqLnByb3RvdHlwZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkV4dGVuc2lvbi5tYWtlKG9iai5wcm90b3R5cGUsIHRoaXMucHJvdG90eXBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgaW5jbHVkZShvYmopIHtcbiAgICAgIHJldHVybiB0aGlzLkV4dGVuc2lvbi5tYWtlKG9iaiwgdGhpcy5wcm90b3R5cGUpO1xuICAgIH1cblxuICB9O1xuXG4gIE1peGFibGUuRXh0ZW5zaW9uID0ge1xuICAgIG1ha2VPbmNlOiBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICghKChyZWYgPSB0YXJnZXQuZXh0ZW5zaW9ucykgIT0gbnVsbCA/IHJlZi5pbmNsdWRlcyhzb3VyY2UpIDogdm9pZCAwKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYWtlKHNvdXJjZSwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgaSwgbGVuLCBvcmlnaW5hbEZpbmFsUHJvcGVydGllcywgcHJvcCwgcmVmO1xuICAgICAgcmVmID0gdGhpcy5nZXRFeHRlbnNpb25Qcm9wZXJ0aWVzKHNvdXJjZSwgdGFyZ2V0KTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBwcm9wID0gcmVmW2ldO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLm5hbWUsIHByb3ApO1xuICAgICAgfVxuICAgICAgaWYgKHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgJiYgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcykge1xuICAgICAgICBvcmlnaW5hbEZpbmFsUHJvcGVydGllcyA9IHRhcmdldC5nZXRGaW5hbFByb3BlcnRpZXM7XG4gICAgICAgIHRhcmdldC5nZXRGaW5hbFByb3BlcnRpZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc291cmNlLmdldEZpbmFsUHJvcGVydGllcygpLmNvbmNhdChvcmlnaW5hbEZpbmFsUHJvcGVydGllcy5jYWxsKHRoaXMpKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldC5nZXRGaW5hbFByb3BlcnRpZXMgPSBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzIHx8IHRhcmdldC5nZXRGaW5hbFByb3BlcnRpZXM7XG4gICAgICB9XG4gICAgICB0YXJnZXQuZXh0ZW5zaW9ucyA9ICh0YXJnZXQuZXh0ZW5zaW9ucyB8fCBbXSkuY29uY2F0KFtzb3VyY2VdKTtcbiAgICAgIGlmICh0eXBlb2Ygc291cmNlLmV4dGVuZGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2UuZXh0ZW5kZWQodGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFsd2F5c0ZpbmFsOiBbJ2V4dGVuZGVkJywgJ2V4dGVuc2lvbnMnLCAnX19zdXBlcl9fJywgJ2NvbnN0cnVjdG9yJywgJ2dldEZpbmFsUHJvcGVydGllcyddLFxuICAgIGdldEV4dGVuc2lvblByb3BlcnRpZXM6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgYWx3YXlzRmluYWwsIHByb3BzLCB0YXJnZXRDaGFpbjtcbiAgICAgIGFsd2F5c0ZpbmFsID0gdGhpcy5hbHdheXNGaW5hbDtcbiAgICAgIHRhcmdldENoYWluID0gdGhpcy5nZXRQcm90b3R5cGVDaGFpbih0YXJnZXQpO1xuICAgICAgcHJvcHMgPSBbXTtcbiAgICAgIHRoaXMuZ2V0UHJvdG90eXBlQ2hhaW4oc291cmNlKS5ldmVyeShmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIGV4Y2x1ZGU7XG4gICAgICAgIGlmICghdGFyZ2V0Q2hhaW4uaW5jbHVkZXMob2JqKSkge1xuICAgICAgICAgIGV4Y2x1ZGUgPSBhbHdheXNGaW5hbDtcbiAgICAgICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBleGNsdWRlID0gZXhjbHVkZS5jb25jYXQoc291cmNlLmdldEZpbmFsUHJvcGVydGllcygpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChbXCJsZW5ndGhcIiwgXCJwcm90b3R5cGVcIiwgXCJuYW1lXCJdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvcHMgPSBwcm9wcy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICF0YXJnZXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkuc3Vic3RyKDAsIDIpICE9PSBcIl9fXCIgJiYgaW5kZXhPZi5jYWxsKGV4Y2x1ZGUsIGtleSkgPCAwICYmICFwcm9wcy5maW5kKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3AubmFtZSA9PT0ga2V5O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgdmFyIHByb3A7XG4gICAgICAgICAgICBwcm9wID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSk7XG4gICAgICAgICAgICBwcm9wLm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0sXG4gICAgZ2V0UHJvdG90eXBlQ2hhaW46IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGJhc2VQcm90b3R5cGUsIGNoYWluO1xuICAgICAgY2hhaW4gPSBbXTtcbiAgICAgIGJhc2VQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0KTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGNoYWluLnB1c2gob2JqKTtcbiAgICAgICAgaWYgKCEoKG9iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSAmJiBvYmogIT09IE9iamVjdCAmJiBvYmogIT09IGJhc2VQcm90b3R5cGUpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFpbjtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE1peGFibGU7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvTWl4YWJsZS5qcy5tYXBcbiIsIi8vIHRvZG8gOiBcbi8vICBzaW1wbGlmaWVkIGZvcm0gOiBAd2l0aG91dE5hbWUgbWV0aG9kXG52YXIgT3ZlcnJpZGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE92ZXJyaWRlciA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgT3ZlcnJpZGVyIHtcbiAgICBzdGF0aWMgb3ZlcnJpZGVzKG92ZXJyaWRlcykge1xuICAgICAgcmV0dXJuIHRoaXMuT3ZlcnJpZGUuYXBwbHlNYW55KHRoaXMucHJvdG90eXBlLCB0aGlzLm5hbWUsIG92ZXJyaWRlcyk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKHRoaXMuX292ZXJyaWRlcyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbJ19vdmVycmlkZXMnXS5jb25jYXQoT2JqZWN0LmtleXModGhpcy5fb3ZlcnJpZGVzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXh0ZW5kZWQodGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5fb3ZlcnJpZGVzICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5PdmVycmlkZS5hcHBseU1hbnkodGFyZ2V0LCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIHRoaXMuX292ZXJyaWRlcyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jb25zdHJ1Y3RvciA9PT0gT3ZlcnJpZGVyKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQuZXh0ZW5kZWQgPSB0aGlzLmV4dGVuZGVkO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIE92ZXJyaWRlci5PdmVycmlkZSA9IHtcbiAgICBtYWtlTWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGZuLCBrZXksIG92ZXJyaWRlLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XG4gICAgICAgIGZuID0gb3ZlcnJpZGVzW2tleV07XG4gICAgICAgIHJlc3VsdHMucHVzaChvdmVycmlkZSA9IHRoaXMubWFrZSh0YXJnZXQsIG5hbWVzcGFjZSwga2V5LCBmbikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBhcHBseU1hbnk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZXMpIHtcbiAgICAgIHZhciBrZXksIG92ZXJyaWRlLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gb3ZlcnJpZGVzKSB7XG4gICAgICAgIG92ZXJyaWRlID0gb3ZlcnJpZGVzW2tleV07XG4gICAgICAgIGlmICh0eXBlb2Ygb3ZlcnJpZGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIG92ZXJyaWRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hcHBseSh0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIGZuTmFtZSwgZm4pIHtcbiAgICAgIHZhciBvdmVycmlkZTtcbiAgICAgIG92ZXJyaWRlID0ge1xuICAgICAgICBmbjoge1xuICAgICAgICAgIGN1cnJlbnQ6IGZuXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6IGZuTmFtZVxuICAgICAgfTtcbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRoJyArIG5hbWVzcGFjZV0gPSBmbjtcbiAgICAgIHJldHVybiBvdmVycmlkZTtcbiAgICB9LFxuICAgIGVtcHR5Rm46IGZ1bmN0aW9uKCkge30sXG4gICAgYXBwbHk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkge1xuICAgICAgdmFyIGZuTmFtZSwgb3ZlcnJpZGVzLCByZWYsIHJlZjEsIHdpdGhvdXQ7XG4gICAgICBmbk5hbWUgPSBvdmVycmlkZS5uYW1lO1xuICAgICAgb3ZlcnJpZGVzID0gdGFyZ2V0Ll9vdmVycmlkZXMgIT0gbnVsbCA/IE9iamVjdC5hc3NpZ24oe30sIHRhcmdldC5fb3ZlcnJpZGVzKSA6IHt9O1xuICAgICAgd2l0aG91dCA9ICgocmVmID0gdGFyZ2V0Ll9vdmVycmlkZXMpICE9IG51bGwgPyAocmVmMSA9IHJlZltmbk5hbWVdKSAhPSBudWxsID8gcmVmMS5mbi5jdXJyZW50IDogdm9pZCAwIDogdm9pZCAwKSB8fCB0YXJnZXRbZm5OYW1lXTtcbiAgICAgIG92ZXJyaWRlID0gT2JqZWN0LmFzc2lnbih7fSwgb3ZlcnJpZGUpO1xuICAgICAgaWYgKG92ZXJyaWRlc1tmbk5hbWVdICE9IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUuZm4gPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZXNbZm5OYW1lXS5mbiwgb3ZlcnJpZGUuZm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3ZlcnJpZGUuZm4gPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZS5mbik7XG4gICAgICB9XG4gICAgICBvdmVycmlkZS5mblsnd2l0aG91dCcgKyBuYW1lc3BhY2VdID0gd2l0aG91dCB8fCB0aGlzLmVtcHR5Rm47XG4gICAgICBpZiAod2l0aG91dCA9PSBudWxsKSB7XG4gICAgICAgIG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0ID0gJ3dpdGhvdXQnICsgbmFtZXNwYWNlO1xuICAgICAgfSBlbHNlIGlmIChvdmVycmlkZS5taXNzaW5nV2l0aG91dCkge1xuICAgICAgICBvdmVycmlkZS5mbltvdmVycmlkZS5taXNzaW5nV2l0aG91dF0gPSB3aXRob3V0O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZm5OYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZmluYWxGbiwgZm4sIGtleSwgcmVmMjtcbiAgICAgICAgICBmaW5hbEZuID0gb3ZlcnJpZGUuZm4uY3VycmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAgIHJlZjIgPSBvdmVycmlkZS5mbjtcbiAgICAgICAgICBmb3IgKGtleSBpbiByZWYyKSB7XG4gICAgICAgICAgICBmbiA9IHJlZjJba2V5XTtcbiAgICAgICAgICAgIGZpbmFsRm5ba2V5XSA9IGZuLmJpbmQodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAhPT0gdGhpcykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGZuTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZTogZmluYWxGblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmaW5hbEZuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG92ZXJyaWRlc1tmbk5hbWVdID0gb3ZlcnJpZGU7XG4gICAgICByZXR1cm4gdGFyZ2V0Ll9vdmVycmlkZXMgPSBvdmVycmlkZXM7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBPdmVycmlkZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvT3ZlcnJpZGVyLmpzLm1hcFxuIiwidmFyIEJpbmRlciwgVXBkYXRlcjtcblxuQmluZGVyID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkJpbmRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBVcGRhdGVyID0gY2xhc3MgVXBkYXRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5uZXh0ID0gW107XG4gICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICAgIGlmICgob3B0aW9ucyAhPSBudWxsID8gb3B0aW9ucy5jYWxsYmFjayA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5hZGRDYWxsYmFjayhvcHRpb25zLmNhbGxiYWNrKTtcbiAgICB9XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyAocmVmID0gb3B0aW9ucy5jYWxsYmFja3MpICE9IG51bGwgPyByZWYuZm9yRWFjaCA6IHZvaWQgMCA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHZhciBjYWxsYmFjaztcbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLm5leHQgPSB0aGlzLmNhbGxiYWNrcy5zbGljZSgpO1xuICAgIHdoaWxlICh0aGlzLmNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tzLnNoaWZ0KCk7XG4gICAgICB0aGlzLnJ1bkNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgdGhpcy5jYWxsYmFja3MgPSB0aGlzLm5leHQ7XG4gICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcnVuQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfVxuXG4gIGFkZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcy5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAodGhpcy51cGRhdGluZyAmJiAhdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBuZXh0VGljayhjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICBpZiAoIXRoaXMubmV4dC5pbmNsdWRlcyhjYWxsYmFjaykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dC5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gdGhpcy5jYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLm5leHQuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGdldEJpbmRlcigpIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZXIuQmluZGVyKHRoaXMpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIHJldHVybiB0aGlzLm5leHQgPSBbXTtcbiAgfVxuXG59O1xuXG5VcGRhdGVyLkJpbmRlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGNsYXNzIEJpbmRlciBleHRlbmRzIHN1cGVyQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHRhcmdldCwgY2FsbGJhY2sxKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sxO1xuICAgIH1cblxuICAgIGdldFJlZigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmNhbGxiYWNrXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRvQmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBkb1VuYmluZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW1vdmVDYWxsYmFjayh0aGlzLmNhbGxiYWNrKTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gQmluZGVyO1xuXG59KS5jYWxsKHRoaXMsIEJpbmRlcik7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcHMvVXBkYXRlci5qcy5tYXBcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkVsZW1lbnRcIjogcmVxdWlyZShcIi4vRWxlbWVudFwiKSxcbiAgXCJMb2FkZXJcIjogcmVxdWlyZShcIi4vTG9hZGVyXCIpLFxuICBcIk1peGFibGVcIjogcmVxdWlyZShcIi4vTWl4YWJsZVwiKSxcbiAgXCJPdmVycmlkZXJcIjogcmVxdWlyZShcIi4vT3ZlcnJpZGVyXCIpLFxuICBcIlVwZGF0ZXJcIjogcmVxdWlyZShcIi4vVXBkYXRlclwiKSxcbiAgXCJJbnZhbGlkYXRlZFwiOiB7XG4gICAgXCJBY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXJcIjogcmVxdWlyZShcIi4vSW52YWxpZGF0ZWQvQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyXCIpLFxuICAgIFwiSW52YWxpZGF0ZWRcIjogcmVxdWlyZShcIi4vSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWRcIiksXG4gIH0sXG59IiwidmFyIGxpYnM7XG5cbmxpYnMgPSByZXF1aXJlKCcuL2xpYnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKHtcbiAgJ0NvbGxlY3Rpb24nOiByZXF1aXJlKCdzcGFyay1jb2xsZWN0aW9uJylcbn0sIGxpYnMsIHJlcXVpcmUoJ3NwYXJrLXByb3BlcnRpZXMnKSwgcmVxdWlyZSgnc3BhcmstYmluZGluZycpKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9zcGFyay1zdGFydGVyLmpzLm1hcFxuIiwiaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSB7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgZ3JlZWtBbHBoYWJldDogcmVxdWlyZSgnLi9zdHJpbmdzL2dyZWVrQWxwaGFiZXQnKSxcbiAgICAgIHN0YXJOYW1lczogcmVxdWlyZSgnLi9zdHJpbmdzL3N0YXJOYW1lcycpXG4gIH07XG59IiwibW9kdWxlLmV4cG9ydHM9W1xuXCJhbHBoYVwiLCAgIFwiYmV0YVwiLCAgICBcImdhbW1hXCIsICAgXCJkZWx0YVwiLFxuXCJlcHNpbG9uXCIsIFwiemV0YVwiLCAgICBcImV0YVwiLCAgICAgXCJ0aGV0YVwiLFxuXCJpb3RhXCIsICAgIFwia2FwcGFcIiwgICBcImxhbWJkYVwiLCAgXCJtdVwiLFxuXCJudVwiLCAgICAgIFwieGlcIiwgICAgICBcIm9taWNyb25cIiwgXCJwaVwiLFx0XG5cInJob1wiLCAgICAgXCJzaWdtYVwiLCAgIFwidGF1XCIsICAgICBcInVwc2lsb25cIixcblwicGhpXCIsICAgICBcImNoaVwiLCAgICAgXCJwc2lcIiwgICAgIFwib21lZ2FcIlxuXSIsIm1vZHVsZS5leHBvcnRzPVtcblwiQWNoZXJuYXJcIiwgICAgIFwiTWFpYVwiLCAgICAgICAgXCJBdGxhc1wiLCAgICAgICAgXCJTYWxtXCIsICAgICAgIFwiQWxuaWxhbVwiLCAgICAgIFwiTmVra2FyXCIsICAgICAgXCJFbG5hdGhcIiwgICAgICAgXCJUaHViYW5cIixcblwiQWNoaXJkXCIsICAgICAgIFwiTWFyZmlrXCIsICAgICAgXCJBdXZhXCIsICAgICAgICAgXCJTYXJnYXNcIiwgICAgIFwiQWxuaXRha1wiLCAgICAgIFwiTmloYWxcIiwgICAgICAgXCJFbmlmXCIsICAgICAgICAgXCJUb3JjdWxhcmlzXCIsXG5cIkFjcnV4XCIsICAgICAgICBcIk1hcmthYlwiLCAgICAgIFwiQXZpb3JcIiwgICAgICAgIFwiU2FyaW5cIiwgICAgICBcIkFscGhhcmRcIiwgICAgICBcIk51bmtpXCIsICAgICAgIFwiRXRhbWluXCIsICAgICAgIFwiVHVyYWlzXCIsXG5cIkFjdWJlbnNcIiwgICAgICBcIk1hdGFyXCIsICAgICAgIFwiQXplbGZhZmFnZVwiLCAgIFwiU2NlcHRydW1cIiwgICBcIkFscGhla2thXCIsICAgICBcIk51c2FrYW5cIiwgICAgIFwiRm9tYWxoYXV0XCIsICAgIFwiVHlsXCIsXG5cIkFkYXJhXCIsICAgICAgICBcIk1lYnN1dGFcIiwgICAgIFwiQXpoYVwiLCAgICAgICAgIFwiU2NoZWF0XCIsICAgICBcIkFscGhlcmF0elwiLCAgICBcIlBlYWNvY2tcIiwgICAgIFwiRm9ybmFjaXNcIiwgICAgIFwiVW51a2FsaGFpXCIsXG5cIkFkaGFmZXJhXCIsICAgICBcIk1lZ3JlelwiLCAgICAgIFwiQXptaWRpc2tlXCIsICAgIFwiU2VnaW5cIiwgICAgICBcIkFscmFpXCIsICAgICAgICBcIlBoYWRcIiwgICAgICAgIFwiRnVydWRcIiwgICAgICAgIFwiVmVnYVwiLFxuXCJBZGhpbFwiLCAgICAgICAgXCJNZWlzc2FcIiwgICAgICBcIkJhaGFtXCIsICAgICAgICBcIlNlZ2ludXNcIiwgICAgXCJBbHJpc2hhXCIsICAgICAgXCJQaGFldFwiLCAgICAgICBcIkdhY3J1eFwiLCAgICAgICBcIlZpbmRlbWlhdHJpeFwiLFxuXCJBZ2VuYVwiLCAgICAgICAgXCJNZWtidWRhXCIsICAgICBcIkJlY3J1eFwiLCAgICAgICBcIlNoYW1cIiwgICAgICAgXCJBbHNhZmlcIiwgICAgICAgXCJQaGVya2FkXCIsICAgICBcIkdpYW5mYXJcIiwgICAgICBcIldhc2F0XCIsXG5cIkFsYWRmYXJcIiwgICAgICBcIk1lbmthbGluYW5cIiwgIFwiQmVpZFwiLCAgICAgICAgIFwiU2hhcmF0YW5cIiwgICBcIkFsc2NpYXVrYXRcIiwgICBcIlBsZWlvbmVcIiwgICAgIFwiR29tZWlzYVwiLCAgICAgIFwiV2V6ZW5cIixcblwiQWxhdGhmYXJcIiwgICAgIFwiTWVua2FyXCIsICAgICAgXCJCZWxsYXRyaXhcIiwgICAgXCJTaGF1bGFcIiwgICAgIFwiQWxzaGFpblwiLCAgICAgIFwiUG9sYXJpc1wiLCAgICAgXCJHcmFmZmlhc1wiLCAgICAgXCJXZXpuXCIsXG5cIkFsYmFsZGFoXCIsICAgICBcIk1lbmtlbnRcIiwgICAgIFwiQmV0ZWxnZXVzZVwiLCAgIFwiU2hlZGlyXCIsICAgICBcIkFsc2hhdFwiLCAgICAgICBcIlBvbGx1eFwiLCAgICAgIFwiR3JhZmlhc1wiLCAgICAgIFwiWWVkXCIsXG5cIkFsYmFsaVwiLCAgICAgICBcIk1lbmtpYlwiLCAgICAgIFwiQm90ZWluXCIsICAgICAgIFwiU2hlbGlha1wiLCAgICBcIkFsc3VoYWlsXCIsICAgICBcIlBvcnJpbWFcIiwgICAgIFwiR3J1bWl1bVwiLCAgICAgIFwiWWlsZHVuXCIsXG5cIkFsYmlyZW9cIiwgICAgICBcIk1lcmFrXCIsICAgICAgIFwiQnJhY2hpdW1cIiwgICAgIFwiU2lyaXVzXCIsICAgICBcIkFsdGFpclwiLCAgICAgICBcIlByYWVjaXB1YVwiLCAgIFwiSGFkYXJcIiwgICAgICAgIFwiWmFuaWFoXCIsXG5cIkFsY2hpYmFcIiwgICAgICBcIk1lcmdhXCIsICAgICAgIFwiQ2Fub3B1c1wiLCAgICAgIFwiU2l0dWxhXCIsICAgICBcIkFsdGFyZlwiLCAgICAgICBcIlByb2N5b25cIiwgICAgIFwiSGFlZGlcIiwgICAgICAgIFwiWmF1cmFrXCIsXG5cIkFsY29yXCIsICAgICAgICBcIk1lcm9wZVwiLCAgICAgIFwiQ2FwZWxsYVwiLCAgICAgIFwiU2thdFwiLCAgICAgICBcIkFsdGVyZlwiLCAgICAgICBcIlByb3B1c1wiLCAgICAgIFwiSGFtYWxcIiwgICAgICAgIFwiWmF2aWphaFwiLFxuXCJBbGN5b25lXCIsICAgICAgXCJNZXNhcnRoaW1cIiwgICBcIkNhcGhcIiwgICAgICAgICBcIlNwaWNhXCIsICAgICAgXCJBbHVkcmFcIiwgICAgICAgXCJSYW5hXCIsICAgICAgICBcIkhhc3NhbGVoXCIsICAgICBcIlppYmFsXCIsXG5cIkFsZGVyYW1pblwiLCAgICBcIk1ldGFsbGFoXCIsICAgIFwiQ2FzdG9yXCIsICAgICAgIFwiU3Rlcm9wZVwiLCAgICBcIkFsdWxhXCIsICAgICAgICBcIlJhc1wiLCAgICAgICAgIFwiSGV6ZVwiLCAgICAgICAgIFwiWm9zbWFcIixcblwiQWxkaGliYWhcIiwgICAgIFwiTWlhcGxhY2lkdXNcIiwgXCJDZWJhbHJhaVwiLCAgICAgXCJTdWFsb2NpblwiLCAgIFwiQWx5YVwiLCAgICAgICAgIFwiUmFzYWxnZXRoaVwiLCAgXCJIb2VkdXNcIiwgICAgICAgXCJBcXVhcml1c1wiLFxuXCJBbGZpcmtcIiwgICAgICAgXCJNaW5rYXJcIiwgICAgICBcIkNlbGFlbm9cIiwgICAgICBcIlN1YnJhXCIsICAgICAgXCJBbHppcnJcIiwgICAgICAgXCJSYXNhbGhhZ3VlXCIsICBcIkhvbWFtXCIsICAgICAgICBcIkFyaWVzXCIsXG5cIkFsZ2VuaWJcIiwgICAgICBcIk1pbnRha2FcIiwgICAgIFwiQ2hhcmFcIiwgICAgICAgIFwiU3VoYWlsXCIsICAgICBcIkFuY2hhXCIsICAgICAgICBcIlJhc3RhYmFuXCIsICAgIFwiSHlhZHVtXCIsICAgICAgIFwiQ2VwaGV1c1wiLFxuXCJBbGdpZWJhXCIsICAgICAgXCJNaXJhXCIsICAgICAgICBcIkNob3J0XCIsICAgICAgICBcIlN1bGFmYXRcIiwgICAgXCJBbmdldGVuYXJcIiwgICAgXCJSZWd1bHVzXCIsICAgICBcIkl6YXJcIiwgICAgICAgICBcIkNldHVzXCIsXG5cIkFsZ29sXCIsICAgICAgICBcIk1pcmFjaFwiLCAgICAgIFwiQ3Vyc2FcIiwgICAgICAgIFwiU3lybWFcIiwgICAgICBcIkFua2FhXCIsICAgICAgICBcIlJpZ2VsXCIsICAgICAgIFwiSmFiYmFoXCIsICAgICAgIFwiQ29sdW1iYVwiLFxuXCJBbGdvcmFiXCIsICAgICAgXCJNaXJhbVwiLCAgICAgICBcIkRhYmloXCIsICAgICAgICBcIlRhYml0XCIsICAgICAgXCJBbnNlclwiLCAgICAgICAgXCJSb3RhbmV2XCIsICAgICBcIkthamFtXCIsICAgICAgICBcIkNvbWFcIixcblwiQWxoZW5hXCIsICAgICAgIFwiTWlycGhha1wiLCAgICAgXCJEZW5lYlwiLCAgICAgICAgXCJUYWxpdGhhXCIsICAgIFwiQW50YXJlc1wiLCAgICAgIFwiUnVjaGJhXCIsICAgICAgXCJLYXVzXCIsICAgICAgICAgXCJDb3JvbmFcIixcblwiQWxpb3RoXCIsICAgICAgIFwiTWl6YXJcIiwgICAgICAgXCJEZW5lYm9sYVwiLCAgICAgXCJUYW5pYVwiLCAgICAgIFwiQXJjdHVydXNcIiwgICAgIFwiUnVjaGJhaFwiLCAgICAgXCJLZWlkXCIsICAgICAgICAgXCJDcnV4XCIsXG5cIkFsa2FpZFwiLCAgICAgICBcIk11ZnJpZFwiLCAgICAgIFwiRGhlbmViXCIsICAgICAgIFwiVGFyYXplZFwiLCAgICBcIkFya2FiXCIsICAgICAgICBcIlJ1a2JhdFwiLCAgICAgIFwiS2l0YWxwaGFcIiwgICAgIFwiRHJhY29cIixcblwiQWxrYWx1cm9wc1wiLCAgIFwiTXVsaXBoZW5cIiwgICAgXCJEaWFkZW1cIiwgICAgICAgXCJUYXlnZXRhXCIsICAgIFwiQXJuZWJcIiwgICAgICAgIFwiU2FiaWtcIiwgICAgICAgXCJLb2NhYlwiLCAgICAgICAgXCJHcnVzXCIsXG5cIkFsa2VzXCIsICAgICAgICBcIk11cnppbVwiLCAgICAgIFwiRGlwaGRhXCIsICAgICAgIFwiVGVnbWVuXCIsICAgICBcIkFycmFraXNcIiwgICAgICBcIlNhZGFsYWNoYmlhXCIsIFwiS29ybmVwaG9yb3NcIiwgIFwiSHlkcmFcIixcblwiQWxrdXJoYWhcIiwgICAgIFwiTXVzY2lkYVwiLCAgICAgXCJEc2NodWJiYVwiLCAgICAgXCJUZWphdFwiLCAgICAgIFwiQXNjZWxsYVwiLCAgICAgIFwiU2FkYWxtZWxpa1wiLCAgXCJLcmF6XCIsICAgICAgICAgXCJMYWNlcnRhXCIsXG5cIkFsbWFha1wiLCAgICAgICBcIk5hb3NcIiwgICAgICAgIFwiRHNpYmFuXCIsICAgICAgIFwiVGVyZWJlbGx1bVwiLCBcIkFzZWxsdXNcIiwgICAgICBcIlNhZGFsc3V1ZFwiLCAgIFwiS3VtYVwiLCAgICAgICAgIFwiTWVuc2FcIixcblwiQWxuYWlyXCIsICAgICAgIFwiTmFzaFwiLCAgICAgICAgXCJEdWJoZVwiLCAgICAgICAgXCJUaGFiaXRcIiwgICAgIFwiQXN0ZXJvcGVcIiwgICAgIFwiU2FkclwiLCAgICAgICAgXCJMZXNhdGhcIiwgICAgICAgXCJNYWFzeW1cIixcblwiQWxuYXRoXCIsICAgICAgIFwiTmFzaGlyYVwiLCAgICAgXCJFbGVjdHJhXCIsICAgICAgXCJUaGVlbWltXCIsICAgIFwiQXRpa1wiLCAgICAgICAgIFwiU2FpcGhcIiwgICAgICAgXCJQaG9lbml4XCIsICAgICAgXCJOb3JtYVwiXG5dIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IGNvb3JkXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxuICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IG9yaWdpblxuICAgKiBAcmV0dXJucyB7e3g6IG51bWJlciwgeTogbnVtYmVyfX1cbiAgICovXG4gIHJvdGF0ZTogZnVuY3Rpb24gKGNvb3JkLCBhbmdsZSwgb3JpZ2luID0geyB4OiAwLCB5OiAwIH0pIHtcbiAgICBjb25zdCByZWNlbnRlclggPSBjb29yZC54IC0gb3JpZ2luLnhcbiAgICBjb25zdCByZWNlbnRlclkgPSBjb29yZC55IC0gb3JpZ2luLnlcbiAgICByZXR1cm4ge1xuICAgICAgeDogTWF0aC5yb3VuZChNYXRoLmNvcyhhbmdsZSkgKiByZWNlbnRlclggLSBNYXRoLnNpbihhbmdsZSkgKiByZWNlbnRlclkpICsgb3JpZ2luLnggKyAwLFxuICAgICAgeTogTWF0aC5yb3VuZChNYXRoLnNpbihhbmdsZSkgKiByZWNlbnRlclggKyBNYXRoLmNvcyhhbmdsZSkgKiByZWNlbnRlclkpICsgb3JpZ2luLnkgKyAwXG4gICAgfVxuICB9XG59XG4iLCJcbmNvbnN0IENvb3JkSGVscGVyID0gcmVxdWlyZSgnLi9Db29yZEhlbHBlcicpXG5cbmNsYXNzIERpcmVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yIChuYW1lLCB4LCB5LCBhbmdsZSwgaW52ZXJzZU5hbWUpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgICB0aGlzLmFuZ2xlID0gYW5nbGVcbiAgICB0aGlzLmludmVyc2VOYW1lID0gaW52ZXJzZU5hbWVcbiAgfVxuXG4gIGdldEludmVyc2UgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yW3RoaXMuaW52ZXJzZU5hbWVdXG4gIH1cblxuICByb3RhdGUgKGFuZ2xlKSB7XG4gICAgY29uc3QgY29vcmQgPSBDb29yZEhlbHBlci5yb3RhdGUodGhpcywgYW5nbGUpXG4gICAgcmV0dXJuIERpcmVjdGlvbi5hbGwuZmluZCgoZCkgPT4ge1xuICAgICAgcmV0dXJuIGQueCA9PT0gY29vcmQueCAmJiBkLnkgPT09IGNvb3JkLnlcbiAgICB9KVxuICB9XG59XG5cbkRpcmVjdGlvbi51cCA9IG5ldyBEaXJlY3Rpb24oJ3VwJywgMCwgLTEsIDAsICdkb3duJylcblxuRGlyZWN0aW9uLmRvd24gPSBuZXcgRGlyZWN0aW9uKCdkb3duJywgMCwgMSwgTWF0aC5QSSwgJ3VwJylcblxuRGlyZWN0aW9uLmxlZnQgPSBuZXcgRGlyZWN0aW9uKCdsZWZ0JywgLTEsIDAsIE1hdGguUEkgLyAyICogMywgJ3JpZ2h0JylcblxuRGlyZWN0aW9uLnJpZ2h0ID0gbmV3IERpcmVjdGlvbigncmlnaHQnLCAxLCAwLCBNYXRoLlBJIC8gMiwgJ2xlZnQnKVxuXG5EaXJlY3Rpb24uYWRqYWNlbnRzID0gW0RpcmVjdGlvbi51cCwgRGlyZWN0aW9uLmRvd24sIERpcmVjdGlvbi5sZWZ0LCBEaXJlY3Rpb24ucmlnaHRdXG5cbkRpcmVjdGlvbi50b3BMZWZ0ID0gbmV3IERpcmVjdGlvbigndG9wTGVmdCcsIC0xLCAtMSwgTWF0aC5QSSAvIDQgKiA3LCAnYm90dG9tUmlnaHQnKVxuXG5EaXJlY3Rpb24udG9wUmlnaHQgPSBuZXcgRGlyZWN0aW9uKCd0b3BSaWdodCcsIDEsIC0xLCBNYXRoLlBJIC8gNCwgJ2JvdHRvbUxlZnQnKVxuXG5EaXJlY3Rpb24uYm90dG9tUmlnaHQgPSBuZXcgRGlyZWN0aW9uKCdib3R0b21SaWdodCcsIDEsIDEsIE1hdGguUEkgLyA0ICogMywgJ3RvcExlZnQnKVxuXG5EaXJlY3Rpb24uYm90dG9tTGVmdCA9IG5ldyBEaXJlY3Rpb24oJ2JvdHRvbUxlZnQnLCAtMSwgMSwgTWF0aC5QSSAvIDQgKiA1LCAndG9wUmlnaHQnKVxuXG5EaXJlY3Rpb24uY29ybmVycyA9IFtEaXJlY3Rpb24udG9wTGVmdCwgRGlyZWN0aW9uLnRvcFJpZ2h0LCBEaXJlY3Rpb24uYm90dG9tUmlnaHQsIERpcmVjdGlvbi5ib3R0b21MZWZ0XVxuXG5EaXJlY3Rpb24uYWxsID0gW0RpcmVjdGlvbi51cCwgRGlyZWN0aW9uLmRvd24sIERpcmVjdGlvbi5sZWZ0LCBEaXJlY3Rpb24ucmlnaHQsIERpcmVjdGlvbi50b3BMZWZ0LCBEaXJlY3Rpb24udG9wUmlnaHQsIERpcmVjdGlvbi5ib3R0b21SaWdodCwgRGlyZWN0aW9uLmJvdHRvbUxlZnRdXG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0aW9uXG4iLCJjb25zdCBFbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnRcbmNvbnN0IERpcmVjdGlvbiA9IHJlcXVpcmUoJy4vRGlyZWN0aW9uJylcbmNvbnN0IENvb3JkSGVscGVyID0gcmVxdWlyZSgnLi9Db29yZEhlbHBlcicpXG5cbmNsYXNzIFRpbGUgZXh0ZW5kcyBFbGVtZW50IHtcbiAgY29uc3RydWN0b3IgKHhPck9wdGlvbnMsIHkgPSAwKSB7XG4gICAgbGV0IG9wdCA9IHhPck9wdGlvbnNcbiAgICBpZiAodHlwZW9mIHhPck9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgICBvcHQgPSB7IHg6IHhPck9wdGlvbnMsIHk6IHkgfVxuICAgIH1cbiAgICBzdXBlcihvcHQpXG4gICAgdGhpcy54ID0gb3B0LnhcbiAgICB0aGlzLnkgPSBvcHQueVxuICB9XG5cbiAgZ2V0UmVsYXRpdmVUaWxlICh4LCB5KSB7XG4gICAgaWYgKHggPT09IDAgJiYgeSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gICAgaWYgKHRoaXMuY29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5nZXRUaWxlKHRoaXMueCArIHgsIHRoaXMueSArIHkpXG4gICAgfVxuICB9XG5cbiAgZmluZERpcmVjdGlvbk9mICh0aWxlKSB7XG4gICAgaWYgKHRpbGUudGlsZSkge1xuICAgICAgdGlsZSA9IHRpbGUudGlsZVxuICAgIH1cbiAgICBpZiAoKHRpbGUueCAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpKSB7XG4gICAgICByZXR1cm4gRGlyZWN0aW9uLmFsbC5maW5kKChkKSA9PiB7XG4gICAgICAgIHJldHVybiBkLnggPT09IHRpbGUueCAtIHRoaXMueCAmJiBkLnkgPT09IHRpbGUueSAtIHRoaXMueVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBhZGRDaGlsZCAoY2hpbGQsIGNoZWNrUmVmID0gdHJ1ZSkge1xuICAgIHZhciBpbmRleFxuICAgIGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKVxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZClcbiAgICB9XG4gICAgaWYgKGNoZWNrUmVmKSB7XG4gICAgICBjaGlsZC50aWxlID0gdGhpc1xuICAgIH1cbiAgICByZXR1cm4gY2hpbGRcbiAgfVxuXG4gIHJlbW92ZUNoaWxkIChjaGlsZCwgY2hlY2tSZWYgPSB0cnVlKSB7XG4gICAgdmFyIGluZGV4XG4gICAgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpXG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKVxuICAgIH1cbiAgICBpZiAoY2hlY2tSZWYgJiYgY2hpbGQudGlsZSA9PT0gdGhpcykge1xuICAgICAgY2hpbGQudGlsZSA9IG51bGxcbiAgICB9XG4gIH1cblxuICBkaXN0ICh0aWxlKSB7XG4gICAgdmFyIGN0bkRpc3QsIHJlZiwgeCwgeVxuICAgIGlmICgodGlsZSAhPSBudWxsID8gdGlsZS5nZXRGaW5hbFRpbGUgOiBudWxsKSAhPSBudWxsKSB7XG4gICAgICB0aWxlID0gdGlsZS5nZXRGaW5hbFRpbGUoKVxuICAgIH1cbiAgICBpZiAoKCh0aWxlICE9IG51bGwgPyB0aWxlLnggOiBudWxsKSAhPSBudWxsKSAmJiAodGlsZS55ICE9IG51bGwpICYmICh0aGlzLnggIT0gbnVsbCkgJiYgKHRoaXMueSAhPSBudWxsKSAmJiAodGhpcy5jb250YWluZXIgPT09IHRpbGUuY29udGFpbmVyIHx8IChjdG5EaXN0ID0gKHJlZiA9IHRoaXMuY29udGFpbmVyKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kaXN0ID09PSAnZnVuY3Rpb24nID8gcmVmLmRpc3QodGlsZS5jb250YWluZXIpIDogbnVsbCA6IG51bGwpKSkge1xuICAgICAgeCA9IHRpbGUueCAtIHRoaXMueFxuICAgICAgeSA9IHRpbGUueSAtIHRoaXMueVxuICAgICAgaWYgKGN0bkRpc3QpIHtcbiAgICAgICAgeCArPSBjdG5EaXN0LnhcbiAgICAgICAgeSArPSBjdG5EaXN0LnlcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIGxlbmd0aDogTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxuICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IG9yaWdpblxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIGNvcHlBbmRSb3RhdGUgKGFuZ2xlLCBvcmlnaW4gPSB7IHg6IDAsIHk6IDAgfSkge1xuICAgIGNvbnN0IFRpbGVDbGFzcyA9IHRoaXMuY29uc3RydWN0b3JcbiAgICBjb25zdCBkYXRhID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuZ2V0TWFudWFsRGF0YVByb3BlcnRpZXMoKSxcbiAgICAgIENvb3JkSGVscGVyLnJvdGF0ZSh0aGlzLCBhbmdsZSwgb3JpZ2luKVxuICAgIClcbiAgICByZXR1cm4gbmV3IFRpbGVDbGFzcyhkYXRhKVxuICB9XG5cbiAgZ2V0RmluYWxUaWxlICgpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0Q29vcmQgKCkge1xuICAgIHJldHVybiB7IHg6IHRoaXMueCwgeTogdGhpcy55IH1cbiAgfVxufTtcblxuVGlsZS5wcm9wZXJ0aWVzKHtcbiAgY2hpbGRyZW46IHtcbiAgICBjb2xsZWN0aW9uOiB0cnVlXG4gIH0sXG4gIGNvbnRhaW5lcjoge1xuICAgIGNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuY29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRqYWNlbnRUaWxlcy5mb3JFYWNoKGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRpbGUuYWRqYWNlbnRUaWxlc1Byb3BlcnR5LmludmFsaWRhdGUoKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYWRqYWNlbnRUaWxlczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKGludmFsaWRhdGlvbikge1xuICAgICAgaWYgKGludmFsaWRhdGlvbi5wcm9wKHRoaXMuY29udGFpbmVyUHJvcGVydHkpKSB7XG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uYWRqYWNlbnRzLm1hcCgoZCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFJlbGF0aXZlVGlsZShkLngsIGQueSlcbiAgICAgICAgfSkuZmlsdGVyKCh0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHQgIT0gbnVsbFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgY29sbGVjdGlvbjogdHJ1ZVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuY29uc3QgVGlsZVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vVGlsZVJlZmVyZW5jZScpXG5cbmNsYXNzIFRpbGVDb250YWluZXIgZXh0ZW5kcyBFbGVtZW50IHtcbiAgX2FkZFRvQm9uZGFyaWVzICh0aWxlLCBib3VuZGFyaWVzKSB7XG4gICAgaWYgKChib3VuZGFyaWVzLnRvcCA9PSBudWxsKSB8fCB0aWxlLnkgPCBib3VuZGFyaWVzLnRvcCkge1xuICAgICAgYm91bmRhcmllcy50b3AgPSB0aWxlLnlcbiAgICB9XG4gICAgaWYgKChib3VuZGFyaWVzLmxlZnQgPT0gbnVsbCkgfHwgdGlsZS54IDwgYm91bmRhcmllcy5sZWZ0KSB7XG4gICAgICBib3VuZGFyaWVzLmxlZnQgPSB0aWxlLnhcbiAgICB9XG4gICAgaWYgKChib3VuZGFyaWVzLmJvdHRvbSA9PSBudWxsKSB8fCB0aWxlLnkgPiBib3VuZGFyaWVzLmJvdHRvbSkge1xuICAgICAgYm91bmRhcmllcy5ib3R0b20gPSB0aWxlLnlcbiAgICB9XG4gICAgaWYgKChib3VuZGFyaWVzLnJpZ2h0ID09IG51bGwpIHx8IHRpbGUueCA+IGJvdW5kYXJpZXMucmlnaHQpIHtcbiAgICAgIGJvdW5kYXJpZXMucmlnaHQgPSB0aWxlLnhcbiAgICB9XG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB0aGlzLmNvb3JkcyA9IHt9XG4gICAgdGhpcy50aWxlcyA9IFtdXG4gIH1cblxuICBhZGRUaWxlICh0aWxlKSB7XG4gICAgaWYgKCF0aGlzLnRpbGVzLmluY2x1ZGVzKHRpbGUpKSB7XG4gICAgICB0aGlzLnRpbGVzLnB1c2godGlsZSlcbiAgICAgIGlmICh0aGlzLmNvb3Jkc1t0aWxlLnhdID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5jb29yZHNbdGlsZS54XSA9IHt9XG4gICAgICB9XG4gICAgICB0aGlzLmNvb3Jkc1t0aWxlLnhdW3RpbGUueV0gPSB0aWxlXG4gICAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgICB0aWxlLmNvbnRhaW5lciA9IHRoaXNcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmJvdW5kYXJpZXNQcm9wZXJ0eS5nZXR0ZXIuY2FsY3VsYXRlZCkge1xuICAgICAgICB0aGlzLl9hZGRUb0JvbmRhcmllcyh0aWxlLCB0aGlzLmJvdW5kYXJpZXNQcm9wZXJ0eS52YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJlbW92ZVRpbGUgKHRpbGUpIHtcbiAgICB2YXIgaW5kZXhcbiAgICBpbmRleCA9IHRoaXMudGlsZXMuaW5kZXhPZih0aWxlKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLnRpbGVzLnNwbGljZShpbmRleCwgMSlcbiAgICAgIGRlbGV0ZSB0aGlzLmNvb3Jkc1t0aWxlLnhdW3RpbGUueV1cbiAgICAgIGlmICh0aGlzLm93bmVyKSB7XG4gICAgICAgIHRpbGUuY29udGFpbmVyID0gbnVsbFxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYm91bmRhcmllc1Byb3BlcnR5LmdldHRlci5jYWxjdWxhdGVkKSB7XG4gICAgICAgIGlmICh0aGlzLmJvdW5kYXJpZXMudG9wID09PSB0aWxlLnkgfHwgdGhpcy5ib3VuZGFyaWVzLmJvdHRvbSA9PT0gdGlsZS55IHx8IHRoaXMuYm91bmRhcmllcy5sZWZ0ID09PSB0aWxlLnggfHwgdGhpcy5ib3VuZGFyaWVzLnJpZ2h0ID09PSB0aWxlLngpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ib3VuZGFyaWVzUHJvcGVydHkuaW52YWxpZGF0ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZW1vdmVUaWxlQXQgKHgsIHkpIHtcbiAgICBjb25zdCB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpXG4gICAgaWYgKHRpbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbW92ZVRpbGUodGlsZSlcbiAgICB9XG4gIH1cblxuICBnZXRUaWxlICh4LCB5KSB7XG4gICAgdmFyIHJlZlxuICAgIGlmICgoKHJlZiA9IHRoaXMuY29vcmRzW3hdKSAhPSBudWxsID8gcmVmW3ldIDogbnVsbCkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29vcmRzW3hdW3ldXG4gICAgfVxuICB9XG5cbiAgbG9hZE1hdHJpeCAobWF0cml4LCBvZmZzZXQgPSB7IHg6IDAsIHk6IDAgfSkge1xuICAgIHZhciBvcHRpb25zLCByb3csIHRpbGUsIHgsIHlcbiAgICBmb3IgKHkgaW4gbWF0cml4KSB7XG4gICAgICByb3cgPSBtYXRyaXhbeV1cbiAgICAgIGZvciAoeCBpbiByb3cpIHtcbiAgICAgICAgdGlsZSA9IHJvd1t4XVxuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgIHg6IHBhcnNlSW50KHgpICsgb2Zmc2V0LngsXG4gICAgICAgICAgeTogcGFyc2VJbnQoeSkgKyBvZmZzZXQueVxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGlsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuYWRkVGlsZSh0aWxlKG9wdGlvbnMpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRpbGUueCA9IG9wdGlvbnMueFxuICAgICAgICAgIHRpbGUueSA9IG9wdGlvbnMueVxuICAgICAgICAgIHRoaXMuYWRkVGlsZSh0aWxlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICByZWR1Y2VNYXRyaXggKG1hdHJpeCwgaW5pdGFsVmFsdWUgPSBudWxsLCBvZmZzZXQgPSB7IHg6IDAsIHk6IDAgfSkge1xuICAgIGxldCB2YWx1ZSA9IGluaXRhbFZhbHVlXG4gICAgZm9yIChjb25zdCB5IGluIG1hdHJpeCkge1xuICAgICAgY29uc3Qgcm93ID0gbWF0cml4W3ldXG4gICAgICBmb3IgKGNvbnN0IHggaW4gcm93KSB7XG4gICAgICAgIGNvbnN0IGZuID0gcm93W3hdXG4gICAgICAgIGNvbnN0IHBvcyA9IHtcbiAgICAgICAgICB4OiBwYXJzZUludCh4KSArIG9mZnNldC54LFxuICAgICAgICAgIHk6IHBhcnNlSW50KHkpICsgb2Zmc2V0LnlcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IGZuKHZhbHVlLCB0aGlzLmdldFRpbGUocG9zLngsIHBvcy55KSwgcG9zKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIGluUmFuZ2UgKHRpbGUsIHJhbmdlKSB7XG4gICAgdmFyIGZvdW5kLCBpLCBqLCByZWYsIHJlZjEsIHJlZjIsIHJlZjMsIHRpbGVzLCB4LCB5XG4gICAgdGlsZXMgPSBbXVxuICAgIHJhbmdlLS1cbiAgICBmb3IgKHggPSBpID0gcmVmID0gdGlsZS54IC0gcmFuZ2UsIHJlZjEgPSB0aWxlLnggKyByYW5nZTsgKHJlZiA8PSByZWYxID8gaSA8PSByZWYxIDogaSA+PSByZWYxKTsgeCA9IHJlZiA8PSByZWYxID8gKytpIDogLS1pKSB7XG4gICAgICBmb3IgKHkgPSBqID0gcmVmMiA9IHRpbGUueSAtIHJhbmdlLCByZWYzID0gdGlsZS55ICsgcmFuZ2U7IChyZWYyIDw9IHJlZjMgPyBqIDw9IHJlZjMgOiBqID49IHJlZjMpOyB5ID0gcmVmMiA8PSByZWYzID8gKytqIDogLS1qKSB7XG4gICAgICAgIGlmIChNYXRoLnNxcnQoKHggLSB0aWxlLngpICogKHggLSB0aWxlLngpICsgKHkgLSB0aWxlLnkpICogKHkgLSB0aWxlLnkpKSA8PSByYW5nZSAmJiAoKGZvdW5kID0gdGhpcy5nZXRUaWxlKHgsIHkpKSAhPSBudWxsKSkge1xuICAgICAgICAgIHRpbGVzLnB1c2goZm91bmQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRpbGVzXG4gIH1cblxuICBhbGxUaWxlcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZXMuc2xpY2UoKVxuICB9XG5cbiAgY2xlYXJBbGwgKCkge1xuICAgIHZhciBpLCBsZW4sIHJlZiwgdGlsZVxuICAgIGlmICh0aGlzLm93bmVyKSB7XG4gICAgICByZWYgPSB0aGlzLnRpbGVzXG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdGlsZSA9IHJlZltpXVxuICAgICAgICB0aWxlLmNvbnRhaW5lciA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb29yZHMgPSB7fVxuICAgIHRoaXMudGlsZXMgPSBbXVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjbG9zZXN0IChvcmlnaW5UaWxlLCBmaWx0ZXIpIHtcbiAgICB2YXIgY2FuZGlkYXRlcywgZ2V0U2NvcmVcbiAgICBnZXRTY29yZSA9IGZ1bmN0aW9uIChjYW5kaWRhdGUpIHtcbiAgICAgIGlmIChjYW5kaWRhdGUuc2NvcmUgPT0gbnVsbCkge1xuICAgICAgICBjYW5kaWRhdGUuc2NvcmUgPSBjYW5kaWRhdGUuZ2V0RmluYWxUaWxlKCkuZGlzdChvcmlnaW5UaWxlKS5sZW5ndGhcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYW5kaWRhdGUuc2NvcmVcbiAgICB9XG4gICAgY2FuZGlkYXRlcyA9IHRoaXMudGlsZXMuZmlsdGVyKGZpbHRlcikubWFwKCh0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFRpbGVSZWZlcmVuY2UodClcbiAgICB9KVxuICAgIGNhbmRpZGF0ZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGdldFNjb3JlKGEpIC0gZ2V0U2NvcmUoYilcbiAgICB9KVxuICAgIGlmIChjYW5kaWRhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBjYW5kaWRhdGVzWzBdLnRpbGVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICBjb3B5ICgpIHtcbiAgICB2YXIgb3V0XG4gICAgb3V0ID0gbmV3IFRpbGVDb250YWluZXIoKVxuICAgIG91dC5jb29yZHMgPSB0aGlzLmNvb3Jkc1xuICAgIG91dC50aWxlcyA9IHRoaXMudGlsZXNcbiAgICBvdXQub3duZXIgPSBmYWxzZVxuICAgIHJldHVybiBvdXRcbiAgfVxuXG4gIG1lcmdlIChjdG4sIG1lcmdlRm4sIGFzT3duZXIgPSBmYWxzZSkge1xuICAgIHZhciBvdXQsIHRtcFxuICAgIG91dCA9IG5ldyBUaWxlQ29udGFpbmVyKClcbiAgICBvdXQub3duZXIgPSBhc093bmVyXG4gICAgdG1wID0gY3RuLmNvcHkoKVxuICAgIHRoaXMudGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZUEpIHtcbiAgICAgIHZhciBtZXJnZWRUaWxlLCB0aWxlQlxuICAgICAgdGlsZUIgPSB0bXAuZ2V0VGlsZSh0aWxlQS54LCB0aWxlQS55KVxuICAgICAgaWYgKHRpbGVCKSB7XG4gICAgICAgIHRtcC5yZW1vdmVUaWxlKHRpbGVCKVxuICAgICAgfVxuICAgICAgbWVyZ2VkVGlsZSA9IG1lcmdlRm4odGlsZUEsIHRpbGVCKVxuICAgICAgaWYgKG1lcmdlZFRpbGUpIHtcbiAgICAgICAgcmV0dXJuIG91dC5hZGRUaWxlKG1lcmdlZFRpbGUpXG4gICAgICB9XG4gICAgfSlcbiAgICB0bXAudGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZUIpIHtcbiAgICAgIHZhciBtZXJnZWRUaWxlXG4gICAgICBtZXJnZWRUaWxlID0gbWVyZ2VGbihudWxsLCB0aWxlQilcbiAgICAgIGlmIChtZXJnZWRUaWxlKSB7XG4gICAgICAgIHJldHVybiBvdXQuYWRkVGlsZShtZXJnZWRUaWxlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG91dFxuICB9XG59O1xuXG5UaWxlQ29udGFpbmVyLnByb3BlcnRpZXMoe1xuICBvd25lcjoge1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgfSxcbiAgYm91bmRhcmllczoge1xuICAgIGNhbGN1bDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGJvdW5kYXJpZXNcbiAgICAgIGJvdW5kYXJpZXMgPSB7XG4gICAgICAgIHRvcDogbnVsbCxcbiAgICAgICAgbGVmdDogbnVsbCxcbiAgICAgICAgYm90dG9tOiBudWxsLFxuICAgICAgICByaWdodDogbnVsbFxuICAgICAgfVxuICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRUb0JvbmRhcmllcyh0aWxlLCBib3VuZGFyaWVzKVxuICAgICAgfSlcbiAgICAgIHJldHVybiBib3VuZGFyaWVzXG4gICAgfSxcbiAgICBvdXRwdXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB2YWwpXG4gICAgfVxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVDb250YWluZXJcbiIsImNsYXNzIFRpbGVSZWZlcmVuY2Uge1xuICBjb25zdHJ1Y3RvciAodGlsZSkge1xuICAgIHRoaXMudGlsZSA9IHRpbGVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICB4OiB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbmFsVGlsZSgpLnhcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHk6IHtcbiAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmluYWxUaWxlKCkueVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGdldEZpbmFsVGlsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZS5nZXRGaW5hbFRpbGUoKVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVSZWZlcmVuY2VcbiIsImNvbnN0IEVsZW1lbnQgPSByZXF1aXJlKCdzcGFyay1zdGFydGVyJykuRWxlbWVudFxuXG5jbGFzcyBUaWxlZCBleHRlbmRzIEVsZW1lbnQge1xuICBwdXRPblJhbmRvbVRpbGUgKHRpbGVzKSB7XG4gICAgdmFyIGZvdW5kXG4gICAgZm91bmQgPSB0aGlzLmdldFJhbmRvbVZhbGlkVGlsZSh0aWxlcylcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIHRoaXMudGlsZSA9IGZvdW5kXG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZG9tVmFsaWRUaWxlICh0aWxlcywgdmFsaWRhdG9yID0gdGhpcy5jYW5Hb09uVGlsZS5iaW5kKHRoaXMpKSB7XG4gICAgdmFyIGNhbmRpZGF0ZSwgcG9zLCByZW1haW5pbmdcbiAgICByZW1haW5pbmcgPSB0aWxlcy5zbGljZSgpXG4gICAgd2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwKSB7XG4gICAgICBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByZW1haW5pbmcubGVuZ3RoKVxuICAgICAgY2FuZGlkYXRlID0gcmVtYWluaW5nLnNwbGljZShwb3MsIDEpWzBdXG4gICAgICBpZiAodmFsaWRhdG9yKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY2FuR29PblRpbGUgKHRpbGUpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZ2V0RmluYWxUaWxlICgpIHtcbiAgICByZXR1cm4gdGhpcy50aWxlLmdldEZpbmFsVGlsZSgpXG4gIH1cbn07XG5cblRpbGVkLnByb3BlcnRpZXMoe1xuICB0aWxlOiB7XG4gICAgY2hhbmdlOiBmdW5jdGlvbiAodmFsLCBvbGQpIHtcbiAgICAgIGlmIChvbGQgIT0gbnVsbCkge1xuICAgICAgICBvbGQucmVtb3ZlQ2hpbGQodGhpcylcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnRpbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZS5hZGRDaGlsZCh0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgb2Zmc2V0WDoge1xuICAgIGRlZmF1bHQ6IDBcbiAgfSxcbiAgb2Zmc2V0WToge1xuICAgIGRlZmF1bHQ6IDBcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlZFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvb3JkSGVscGVyOiByZXF1aXJlKCcuL0Nvb3JkSGVscGVyJyksXG4gIERpcmVjdGlvbjogcmVxdWlyZSgnLi9EaXJlY3Rpb24nKSxcbiAgVGlsZTogcmVxdWlyZSgnLi9UaWxlJyksXG4gIFRpbGVDb250YWluZXI6IHJlcXVpcmUoJy4vVGlsZUNvbnRhaW5lcicpLFxuICBUaWxlUmVmZXJlbmNlOiByZXF1aXJlKCcuL1RpbGVSZWZlcmVuY2UnKSxcbiAgVGlsZWQ6IHJlcXVpcmUoJy4vVGlsZWQnKVxufVxuIiwiKGZ1bmN0aW9uKGRlZmluaXRpb24pe3ZhciBUaW1pbmc9ZGVmaW5pdGlvbih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCI/UGFyYWxsZWxpbzp0aGlzLlBhcmFsbGVsaW8pO1RpbWluZy5kZWZpbml0aW9uPWRlZmluaXRpb247aWYodHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCImJm1vZHVsZSE9PW51bGwpe21vZHVsZS5leHBvcnRzPVRpbWluZzt9ZWxzZXtpZih0eXBlb2YgUGFyYWxsZWxpbyE9PVwidW5kZWZpbmVkXCImJlBhcmFsbGVsaW8hPT1udWxsKXtQYXJhbGxlbGlvLlRpbWluZz1UaW1pbmc7fWVsc2V7aWYodGhpcy5QYXJhbGxlbGlvPT1udWxsKXt0aGlzLlBhcmFsbGVsaW89e307fXRoaXMuUGFyYWxsZWxpby5UaW1pbmc9VGltaW5nO319fSkoZnVuY3Rpb24oZGVwZW5kZW5jaWVzKXtpZihkZXBlbmRlbmNpZXM9PW51bGwpe2RlcGVuZGVuY2llcz17fTt9XG52YXIgRWxlbWVudCA9IGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShcIkVsZW1lbnRcIikgPyBkZXBlbmRlbmNpZXMuRWxlbWVudCA6IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xudmFyIFRpbWluZztcblRpbWluZyA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgVGltaW5nIGV4dGVuZHMgRWxlbWVudCB7XG4gICAgdG9nZ2xlKHZhbCkge1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdmFsID0gIXRoaXMucnVubmluZztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJ1bm5pbmcgPSB2YWw7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgdGltZSkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yLlRpbWVyKHtcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICB0aW1pbmc6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEludGVydmFsKGNhbGxiYWNrLCB0aW1lKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IuVGltZXIoe1xuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgIHJlcGVhdDogdHJ1ZSxcbiAgICAgICAgdGltaW5nOiB0aGlzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZSh0cnVlKTtcbiAgICB9XG5cbiAgfTtcblxuICBUaW1pbmcucHJvcGVydGllcyh7XG4gICAgcnVubmluZzoge1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFRpbWluZztcblxufSkuY2FsbCh0aGlzKTtcblxuVGltaW5nLlRpbWVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBUaW1lciBleHRlbmRzIEVsZW1lbnQge1xuICAgIHRvZ2dsZSh2YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHZhbCA9ICF0aGlzLnBhdXNlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBhdXNlZCA9IHZhbDtcbiAgICB9XG5cbiAgICBpbW1lZGlhdGVJbnZhbGlkYXRpb24oKSB7XG4gICAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuaW52YWxpZGF0ZSh7XG4gICAgICAgICAgcHJldmVudEltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW46IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICByZXR1cm4gdGhpcy50b2dnbGUodHJ1ZSk7XG4gICAgfVxuXG4gICAgdW5wYXVzZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuY29uc3RydWN0b3Iubm93KCk7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQgPSBzZXRJbnRlcnZhbCh0aGlzLnRpY2suYmluZCh0aGlzKSwgdGhpcy5yZW1haW5pbmdUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlkID0gc2V0VGltZW91dCh0aGlzLnRpY2suYmluZCh0aGlzKSwgdGhpcy5yZW1haW5pbmdUaW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wKCkge1xuICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gKHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSk7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgcmV0dXJuIGNsZWFySW50ZXJ2YWwodGhpcy5pZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBub3coKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdyAhPT0gbnVsbCA/IChyZWYgPSB3aW5kb3cucGVyZm9ybWFuY2UpICE9IG51bGwgPyByZWYubm93IDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsID8gcHJvY2Vzcy51cHRpbWUgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MudXB0aW1lKCkgKiAxMDAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgIHRoaXMucmVwZXRpdGlvbiArPSAxO1xuICAgICAgaWYgKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5vdygpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbWFpbmluZ1RpbWUgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBpZiAodGhpcy5yZXBlYXQpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc01hbmFnZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICB9O1xuXG4gIFRpbWVyLnByb3BlcnRpZXMoe1xuICAgIHRpbWU6IHtcbiAgICAgIGRlZmF1bHQ6IDEwMDBcbiAgICB9LFxuICAgIHBhdXNlZDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJ1bm5pbmc6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuICFpbnZhbGlkYXRvci5wcm9wKHRoaXMucGF1c2VkUHJvcGVydHkpICYmIGludmFsaWRhdG9yLnByb3BQYXRoKCd0aW1pbmcucnVubmluZycpICE9PSBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBjaGFuZ2U6IGZ1bmN0aW9uKHZhbCwgb2xkKSB7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpO1xuICAgICAgICB9IGVsc2UgaWYgKG9sZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGltaW5nOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfSxcbiAgICBlbGFwc2VkVGltZToge1xuICAgICAgY2FsY3VsOiBmdW5jdGlvbihpbnZhbGlkYXRvcikge1xuICAgICAgICBpZiAoaW52YWxpZGF0b3IucHJvcCh0aGlzLnJ1bm5pbmdQcm9wZXJ0eSkpIHtcbiAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1tZWRpYXRlSW52YWxpZGF0aW9uKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iubm93KCkgLSB0aGlzLnN0YXJ0VGltZSArIHRoaXMudGltZSAtIHRoaXMucmVtYWluaW5nVGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50aW1lIC0gdGhpcy5yZW1haW5pbmdUaW1lO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIHRoaXMucmVtYWluaW5nVGltZSA9IHRoaXMudGltZSAtIHZhbDtcbiAgICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdUaW1lIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRpY2soKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZW1haW5pbmdUaW1lID0gdGhpcy50aW1lIC0gdmFsO1xuICAgICAgICAgIHJldHVybiB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkuaW52YWxpZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AodGhpcy5lbGFwc2VkVGltZVByb3BlcnR5KSAvIHRoaXMudGltZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMudGltZSAqIHZhbDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbWFpbmluZ1RpbWU6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcGVhdDoge1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHJlcGV0aXRpb246IHtcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIGNhbGxiYWNrOiB7XG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gVGltZXI7XG5cbn0pLmNhbGwodGhpcyk7XG5cbnJldHVybihUaW1pbmcpO30pOyIsInZhciBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLCBDb25uZWN0ZWQsIEVsZW1lbnQsIFNpZ25hbE9wZXJhdGlvbjtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5TaWduYWxPcGVyYXRpb24gPSByZXF1aXJlKCcuL1NpZ25hbE9wZXJhdGlvbicpO1xuXG5Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLndhdGNoZXJzLkNvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdGVkID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBDb25uZWN0ZWQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRhcmdldC5hZGRTaWduYWwgPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9XG5cbiAgICBhY2NlcHRTaWduYWwoc2lnbmFsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBvbkFkZENvbm5lY3Rpb24oY29ubikge31cblxuICAgIG9uUmVtb3ZlQ29ubmVjdGlvbihjb25uKSB7fVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCkge31cblxuICAgIG9uQWRkU2lnbmFsKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7fVxuXG4gICAgb25SZW1vdmVTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHt9XG5cbiAgICBvblJlcGxhY2VTaWduYWwob2xkU2lnbmFsLCBuZXdTaWduYWwsIG9wKSB7fVxuXG4gICAgY29udGFpbnNTaWduYWwoc2lnbmFsLCBjaGVja0xhc3QgPSBmYWxzZSwgY2hlY2tPcmlnaW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZmluZChmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLm1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0LCBjaGVja09yaWdpbik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIGF1dG9TdGFydDtcbiAgICAgIGlmICghKG9wICE9IG51bGwgPyBvcC5maW5kTGltaXRlcih0aGlzKSA6IHZvaWQgMCkpIHtcbiAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgIG9wID0gbmV3IFNpZ25hbE9wZXJhdGlvbigpO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgc2ltaWxhcjtcbiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSAmJiB0aGlzLmFjY2VwdFNpZ25hbChzaWduYWwpKSB7XG4gICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnB1c2goc2lnbmFsKTtcbiAgICAgICAgICAgIHRoaXMub25BZGRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICBpZiAoIXNpbWlsYXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhdXRvU3RhcnQpIHtcbiAgICAgICAgICBvcC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc2lnbmFsO1xuICAgIH1cblxuICAgIHJlbW92ZVNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgYXV0b1N0YXJ0O1xuICAgICAgaWYgKCEob3AgIT0gbnVsbCA/IG9wLmZpbmRMaW1pdGVyKHRoaXMpIDogdm9pZCAwKSkge1xuICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgb3AgPSBuZXcgU2lnbmFsT3BlcmF0aW9uO1xuICAgICAgICAgIGF1dG9TdGFydCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgb3AuYWRkT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgICB2YXIgZXhpc3Rpbmc7XG4gICAgICAgICAgaWYgKChleGlzdGluZyA9IHRoaXMuY29udGFpbnNTaWduYWwoc2lnbmFsLCB0cnVlKSkgJiYgdGhpcy5hY2NlcHRTaWduYWwoc2lnbmFsKSkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnNwbGljZSh0aGlzLnNpZ25hbHMuaW5kZXhPZihleGlzdGluZyksIDEpO1xuICAgICAgICAgICAgdGhpcy5vblJlbW92ZVNpZ25hbChzaWduYWwsIG9wKTtcbiAgICAgICAgICAgIG9wLmFkZE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgICAgICAgIHZhciBzaW1pbGFyO1xuICAgICAgICAgICAgICBzaW1pbGFyID0gdGhpcy5jb250YWluc1NpZ25hbChzaWduYWwpO1xuICAgICAgICAgICAgICBpZiAoc2ltaWxhcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVwbGFjZVNpZ25hbChzaWduYWwsIHNpbWlsYXIsIG9wKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vblJlbW92ZVNpZ25hbFR5cGUoc2lnbmFsLCBvcCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RlcEJ5U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wLnN0ZXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoYXV0b1N0YXJ0KSB7XG4gICAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCkge1xuICAgICAgaWYgKHNpZ25hbC5sYXN0ID09PSB0aGlzKSB7XG4gICAgICAgIHJldHVybiBzaWduYWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2lnbmFsLndpdGhMYXN0KHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRm9yd2FyZFdhdGNoZXIoKSB7XG4gICAgICBpZiAoIXRoaXMuZm9yd2FyZFdhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5mb3J3YXJkV2F0Y2hlciA9IG5ldyBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgICBzY29wZTogdGhpcyxcbiAgICAgICAgICBwcm9wZXJ0eTogJ291dHB1dHMnLFxuICAgICAgICAgIG9uQWRkZWQ6IGZ1bmN0aW9uKG91dHB1dCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZFNpZ25hbFRvKHNpZ25hbCwgb3V0cHV0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgb25SZW1vdmVkOiBmdW5jdGlvbihvdXRwdXQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcndhcmRlZFNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3BGb3J3YXJkZWRTaWduYWxUbyhzaWduYWwsIG91dHB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkV2F0Y2hlci5iaW5kKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yd2FyZFNpZ25hbChzaWduYWwsIG9wKSB7XG4gICAgICB2YXIgbmV4dDtcbiAgICAgIHRoaXMuZm9yd2FyZGVkU2lnbmFscy5hZGQoc2lnbmFsKTtcbiAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm4pIHtcbiAgICAgICAgaWYgKHNpZ25hbC5sYXN0ICE9PSBjb25uKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0ZvcndhcmRXYXRjaGVyKCk7XG4gICAgfVxuXG4gICAgZm9yd2FyZEFsbFNpZ25hbHNUbyhjb25uLCBvcCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lnbmFscy5mb3JFYWNoKChzaWduYWwpID0+IHtcbiAgICAgICAgdmFyIG5leHQ7XG4gICAgICAgIG5leHQgPSB0aGlzLnByZXBGb3J3YXJkZWRTaWduYWwoc2lnbmFsKTtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0b3BGb3J3YXJkZWRTaWduYWwoc2lnbmFsLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICB0aGlzLmZvcndhcmRlZFNpZ25hbHMucmVtb3ZlKHNpZ25hbCk7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24oY29ubikge1xuICAgICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgICByZXR1cm4gY29ubi5yZW1vdmVTaWduYWwobmV4dCwgb3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdG9wQWxsRm9yd2FyZGVkU2lnbmFsVG8oY29ubiwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZ25hbHMuZm9yRWFjaCgoc2lnbmFsKSA9PiB7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICAgIHJldHVybiBjb25uLnJlbW92ZVNpZ25hbChuZXh0LCBvcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3J3YXJkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4uYWRkU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wRm9yd2FyZGVkU2lnbmFsVG8oc2lnbmFsLCBjb25uLCBvcCkge1xuICAgICAgdmFyIG5leHQ7XG4gICAgICBuZXh0ID0gdGhpcy5wcmVwRm9yd2FyZGVkU2lnbmFsKHNpZ25hbCk7XG4gICAgICBpZiAoc2lnbmFsLmxhc3QgIT09IGNvbm4pIHtcbiAgICAgICAgcmV0dXJuIGNvbm4ucmVtb3ZlU2lnbmFsKG5leHQsIG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICBDb25uZWN0ZWQucHJvcGVydGllcyh7XG4gICAgc2lnbmFsczoge1xuICAgICAgY29sbGVjdGlvbjogdHJ1ZVxuICAgIH0sXG4gICAgaW5wdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBvdXRwdXRzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfSxcbiAgICBmb3J3YXJkZWRTaWduYWxzOiB7XG4gICAgICBjb2xsZWN0aW9uOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQ29ubmVjdGVkO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEVsZW1lbnQsIFNpZ25hbDtcblxuRWxlbWVudCA9IHJlcXVpcmUoJ3NwYXJrLXN0YXJ0ZXInKS5FbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbCA9IGNsYXNzIFNpZ25hbCBleHRlbmRzIEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihvcmlnaW4sIHR5cGUgPSAnc2lnbmFsJywgZXhjbHVzaXZlID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5leGNsdXNpdmUgPSBleGNsdXNpdmU7XG4gICAgdGhpcy5sYXN0ID0gdGhpcy5vcmlnaW47XG4gIH1cblxuICB3aXRoTGFzdChsYXN0KSB7XG4gICAgdmFyIHNpZ25hbDtcbiAgICBzaWduYWwgPSBuZXcgdGhpcy5fX3Byb3RvX18uY29uc3RydWN0b3IodGhpcy5vcmlnaW4sIHRoaXMudHlwZSwgdGhpcy5leGNsdXNpdmUpO1xuICAgIHNpZ25hbC5sYXN0ID0gbGFzdDtcbiAgICByZXR1cm4gc2lnbmFsO1xuICB9XG5cbiAgY29weSgpIHtcbiAgICB2YXIgc2lnbmFsO1xuICAgIHNpZ25hbCA9IG5ldyB0aGlzLl9fcHJvdG9fXy5jb25zdHJ1Y3Rvcih0aGlzLm9yaWdpbiwgdGhpcy50eXBlLCB0aGlzLmV4Y2x1c2l2ZSk7XG4gICAgc2lnbmFsLmxhc3QgPSB0aGlzLmxhc3Q7XG4gICAgcmV0dXJuIHNpZ25hbDtcbiAgfVxuXG4gIG1hdGNoKHNpZ25hbCwgY2hlY2tMYXN0ID0gZmFsc2UsIGNoZWNrT3JpZ2luID0gdGhpcy5leGNsdXNpdmUpIHtcbiAgICByZXR1cm4gKCFjaGVja0xhc3QgfHwgc2lnbmFsLmxhc3QgPT09IHRoaXMubGFzdCkgJiYgKGNoZWNrT3JpZ2luIHx8IHNpZ25hbC5vcmlnaW4gPT09IHRoaXMub3JpZ2luKSAmJiBzaWduYWwudHlwZSA9PT0gdGhpcy50eXBlO1xuICB9XG5cbn07XG4iLCJ2YXIgRWxlbWVudCwgU2lnbmFsT3BlcmF0aW9uO1xuXG5FbGVtZW50ID0gcmVxdWlyZSgnc3Bhcmstc3RhcnRlcicpLkVsZW1lbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsT3BlcmF0aW9uID0gY2xhc3MgU2lnbmFsT3BlcmF0aW9uIGV4dGVuZHMgRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIHRoaXMubGltaXRlcnMgPSBbXTtcbiAgfVxuXG4gIGFkZE9wZXJhdGlvbihmdW5jdCwgcHJpb3JpdHkgPSAxKSB7XG4gICAgaWYgKHByaW9yaXR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS51bnNoaWZ0KGZ1bmN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUucHVzaChmdW5jdCk7XG4gICAgfVxuICB9XG5cbiAgYWRkTGltaXRlcihjb25uZWN0ZWQpIHtcbiAgICBpZiAoIXRoaXMuZmluZExpbWl0ZXIoY29ubmVjdGVkKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGltaXRlcnMucHVzaChjb25uZWN0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRMaW1pdGVyKGNvbm5lY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmxpbWl0ZXJzLmluZGV4T2YoY29ubmVjdGVkKSA+IC0xO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHJlc3VsdHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuc3RlcCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBzdGVwKCkge1xuICAgIHZhciBmdW5jdDtcbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRvbmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVuY3QgPSB0aGlzLnF1ZXVlLnNoaWZ0KGZ1bmN0KTtcbiAgICAgIHJldHVybiBmdW5jdCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBkb25lKCkge31cblxufTtcbiIsInZhciBDb25uZWN0ZWQsIFNpZ25hbCwgU2lnbmFsT3BlcmF0aW9uLCBTaWduYWxTb3VyY2U7XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cblNpZ25hbCA9IHJlcXVpcmUoJy4vU2lnbmFsJyk7XG5cblNpZ25hbE9wZXJhdGlvbiA9IHJlcXVpcmUoJy4vU2lnbmFsT3BlcmF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsU291cmNlID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBTaWduYWxTb3VyY2UgZXh0ZW5kcyBDb25uZWN0ZWQge307XG5cbiAgU2lnbmFsU291cmNlLnByb3BlcnRpZXMoe1xuICAgIGFjdGl2YXRlZDoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wO1xuICAgICAgICBvcCA9IG5ldyBTaWduYWxPcGVyYXRpb24oKTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGVkKSB7XG4gICAgICAgICAgdGhpcy5mb3J3YXJkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdG9wRm9yd2FyZGVkU2lnbmFsKHRoaXMuc2lnbmFsLCBvcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzaWduYWw6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2lnbmFsKHRoaXMsICdwb3dlcicsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFNpZ25hbFNvdXJjZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBDb25uZWN0ZWQsIFN3aXRjaDtcblxuQ29ubmVjdGVkID0gcmVxdWlyZSgnLi9Db25uZWN0ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l0Y2ggPSBjbGFzcyBTd2l0Y2ggZXh0ZW5kcyBDb25uZWN0ZWQge307XG4iLCJ2YXIgQ29ubmVjdGVkLCBEaXJlY3Rpb24sIFRpbGVkLCBXaXJlLFxuICBpbmRleE9mID0gW10uaW5kZXhPZjtcblxuVGlsZWQgPSByZXF1aXJlKCdwYXJhbGxlbGlvLXRpbGVzJykuVGlsZWQ7XG5cbkRpcmVjdGlvbiA9IHJlcXVpcmUoJ3BhcmFsbGVsaW8tdGlsZXMnKS5EaXJlY3Rpb247XG5cbkNvbm5lY3RlZCA9IHJlcXVpcmUoJy4vQ29ubmVjdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2lyZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgV2lyZSBleHRlbmRzIFRpbGVkIHtcbiAgICBjb25zdHJ1Y3Rvcih3aXJlVHlwZSA9ICdyZWQnKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy53aXJlVHlwZSA9IHdpcmVUeXBlO1xuICAgIH1cblxuICAgIGZpbmREaXJlY3Rpb25zVG8oY29ubikge1xuICAgICAgdmFyIGRpcmVjdGlvbnM7XG4gICAgICBkaXJlY3Rpb25zID0gY29ubi50aWxlcyAhPSBudWxsID8gY29ubi50aWxlcy5tYXAoKHRpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZS5maW5kRGlyZWN0aW9uT2YodGlsZSk7XG4gICAgICB9KSA6IFt0aGlzLnRpbGUuZmluZERpcmVjdGlvbk9mKGNvbm4pXTtcbiAgICAgIHJldHVybiBkaXJlY3Rpb25zLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICE9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYW5Db25uZWN0VG8odGFyZ2V0KSB7XG4gICAgICByZXR1cm4gQ29ubmVjdGVkLnByb3RvdHlwZS5jYW5Db25uZWN0VG8uY2FsbCh0aGlzLCB0YXJnZXQpICYmICgodGFyZ2V0LndpcmVUeXBlID09IG51bGwpIHx8IHRhcmdldC53aXJlVHlwZSA9PT0gdGhpcy53aXJlVHlwZSk7XG4gICAgfVxuXG4gICAgb25OZXdTaWduYWxUeXBlKHNpZ25hbCwgb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLmZvcndhcmRTaWduYWwoc2lnbmFsLCBvcCk7XG4gICAgfVxuXG4gIH07XG5cbiAgV2lyZS5leHRlbmQoQ29ubmVjdGVkKTtcblxuICBXaXJlLnByb3BlcnRpZXMoe1xuICAgIG91dHB1dHM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHZhciBwYXJlbnQ7XG4gICAgICAgIHBhcmVudCA9IGludmFsaWRhdGlvbi5wcm9wKHRoaXMudGlsZVByb3BlcnR5KTtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgIHJldHVybiBpbnZhbGlkYXRpb24ucHJvcChwYXJlbnQuYWRqYWNlbnRUaWxlc1Byb3BlcnR5KS5yZWR1Y2UoKHJlcywgdGlsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5jb25jYXQoaW52YWxpZGF0aW9uLnByb3AodGlsZS5jaGlsZHJlblByb3BlcnR5KS5maWx0ZXIoKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbkNvbm5lY3RUbyhjaGlsZCk7XG4gICAgICAgICAgICB9KS50b0FycmF5KCkpO1xuICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbm5lY3RlZERpcmVjdGlvbnM6IHtcbiAgICAgIGNhbGN1bDogZnVuY3Rpb24oaW52YWxpZGF0aW9uKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRpb24ucHJvcCh0aGlzLm91dHB1dHNQcm9wZXJ0eSkucmVkdWNlKChvdXQsIGNvbm4pID0+IHtcbiAgICAgICAgICB0aGlzLmZpbmREaXJlY3Rpb25zVG8oY29ubikuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKG91dCwgZCkgPCAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvdXQucHVzaChkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9LCBbXSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV2lyZTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIkNvbm5lY3RlZFwiOiByZXF1aXJlKFwiLi9Db25uZWN0ZWRcIiksXG4gIFwiU2lnbmFsXCI6IHJlcXVpcmUoXCIuL1NpZ25hbFwiKSxcbiAgXCJTaWduYWxPcGVyYXRpb25cIjogcmVxdWlyZShcIi4vU2lnbmFsT3BlcmF0aW9uXCIpLFxuICBcIlNpZ25hbFNvdXJjZVwiOiByZXF1aXJlKFwiLi9TaWduYWxTb3VyY2VcIiksXG4gIFwiU3dpdGNoXCI6IHJlcXVpcmUoXCIuL1N3aXRjaFwiKSxcbiAgXCJXaXJlXCI6IHJlcXVpcmUoXCIuL1dpcmVcIiksXG59IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBCaW5kZXI6IHJlcXVpcmUoJy4vc3JjL0JpbmRlcicpLFxuICBFdmVudEJpbmQ6IHJlcXVpcmUoJy4vc3JjL0V2ZW50QmluZCcpLFxuICBSZWZlcmVuY2U6IHJlcXVpcmUoJy4vc3JjL1JlZmVyZW5jZScpXG59XG4iLCJjbGFzcyBCaW5kZXIge1xuICB0b2dnbGVCaW5kICh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudW5iaW5kKClcbiAgICB9XG4gIH1cblxuICBiaW5kICgpIHtcbiAgICBpZiAoIXRoaXMuYmluZGVkICYmIHRoaXMuY2FuQmluZCgpKSB7XG4gICAgICB0aGlzLmRvQmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpXG4gIH1cblxuICB1bmJpbmQgKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaW5kZXJcbiIsIlxuY29uc3QgQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKVxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnLi9SZWZlcmVuY2UnKVxuXG5jbGFzcyBFdmVudEJpbmQgZXh0ZW5kcyBCaW5kZXIge1xuICBjb25zdHJ1Y3RvciAoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnQxXG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQxXG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0ICE9IG51bGwpXG4gIH1cblxuICBiaW5kVG8gKHRhcmdldCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgIHJldHVybiB0aGlzLmJpbmQoKVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byBhZGQgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpXG4gICAgfVxuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKVxuICAgIH1cbiAgfVxuXG4gIGVxdWFscyAoZXZlbnRCaW5kKSB7XG4gICAgcmV0dXJuIGV2ZW50QmluZCAhPSBudWxsICYmXG4gICAgICBldmVudEJpbmQuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiZcbiAgICAgIGV2ZW50QmluZC5ldmVudCA9PT0gdGhpcy5ldmVudCAmJlxuICAgICAgUmVmZXJlbmNlLmNvbXBhcmVWYWwoZXZlbnRCaW5kLnRhcmdldCwgdGhpcy50YXJnZXQpICYmXG4gICAgICBSZWZlcmVuY2UuY29tcGFyZVZhbChldmVudEJpbmQuY2FsbGJhY2ssIHRoaXMuY2FsbGJhY2spXG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyIChlbWl0dGVyLCBmYXRhbCA9IHRydWUpIHtcbiAgICBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50QmluZFxuIiwiY2xhc3MgUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IgKGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gIH1cblxuICBlcXVhbHMgKHJlZikge1xuICAgIHJldHVybiByZWYgIT0gbnVsbCAmJiByZWYuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlRGF0YShyZWYuZGF0YSlcbiAgfVxuXG4gIGNvbXBhcmVEYXRhIChkYXRhKSB7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhkYXRhKVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09PSBkYXRhKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09IG51bGwgfHwgZGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkubGVuZ3RoID09PSBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggJiYgT2JqZWN0LmtleXMoZGF0YSkuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgICByZXR1cm4gUmVmZXJlbmNlLmNvbXBhcmVWYWwodGhpcy5kYXRhW2tleV0sIGRhdGFba2V5XSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBSZWZlcmVuY2UuY29tcGFyZVZhbCh0aGlzLmRhdGEsIGRhdGEpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSB2YWwxXG4gICAqIEBwYXJhbSB7Kn0gdmFsMlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIGNvbXBhcmVWYWwgKHZhbDEsIHZhbDIpIHtcbiAgICBpZiAodmFsMSA9PT0gdmFsMikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKHZhbDEgPT0gbnVsbCB8fCB2YWwyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbDEuZXF1YWxzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdmFsMS5lcXVhbHModmFsMilcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWwyLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbDIuZXF1YWxzKHZhbDEpXG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbDEpICYmIEFycmF5LmlzQXJyYXkodmFsMikpIHtcbiAgICAgIHJldHVybiB2YWwxLmxlbmd0aCA9PT0gdmFsMi5sZW5ndGggJiYgdmFsMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsLCB2YWwyW2ldKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gaWYgKHR5cGVvZiB2YWwxID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsMiA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwxKS5sZW5ndGggPT09IE9iamVjdC5rZXlzKHZhbDIpLmxlbmd0aCAmJiBPYmplY3Qua2V5cyh2YWwxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsMVtrZXldLCB2YWwyW2tleV0pXG4gICAgLy8gICB9KVxuICAgIC8vIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRpYyBtYWtlUmVmZXJyZWQgKG9iaiwgZGF0YSkge1xuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICBvYmoucmVmID0gZGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICBvYmoucmVmID0gbmV3IFJlZmVyZW5jZShkYXRhKVxuICAgIH1cbiAgICBvYmouZXF1YWxzID0gZnVuY3Rpb24gKG9iajIpIHtcbiAgICAgIHJldHVybiBvYmoyICE9IG51bGwgJiYgdGhpcy5yZWYuZXF1YWxzKG9iajIucmVmKVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVmZXJlbmNlXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL0NvbGxlY3Rpb24nKVxuIiwiLyoqXG4gKiBAdGVtcGxhdGUgVFxuICovXG5jbGFzcyBDb2xsZWN0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoYXJyKSB7XG4gICAgaWYgKGFyciAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXJyYXkgPSBbXVxuICAgIH1cbiAgfVxuXG4gIGNoYW5nZWQgKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IG9sZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9yZGVyZWRcbiAgICogQHBhcmFtIHtmdW5jdGlvbihULFQpOiBib29sZWFufSBjb21wYXJlRnVuY3Rpb25cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGNoZWNrQ2hhbmdlcyAob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgY29tcGFyZUZ1bmN0aW9uID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGJcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZCA9IFtdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50KCkgIT09IG9sZC5sZW5ndGggfHwgKG9yZGVyZWQgPyB0aGlzLnNvbWUoZnVuY3Rpb24gKHZhbCwgaSkge1xuICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKVxuICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbiAoYikge1xuICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGEsIGIpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBnZXQgKGkpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgZ2V0UmFuZG9tICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaVxuICAgKiBAcGFyYW0ge1R9IHZhbFxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgc2V0IChpLCB2YWwpIHtcbiAgICB2YXIgb2xkXG4gICAgaWYgKHRoaXMuX2FycmF5W2ldICE9PSB2YWwpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbFxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VH0gdmFsXG4gICAqL1xuICBhZGQgKHZhbCkge1xuICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHVzaCh2YWwpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtUfSB2YWxcbiAgICovXG4gIHJlbW92ZSAodmFsKSB7XG4gICAgdmFyIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oVCk6IGJvb2xlYW59IGZuXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwbHVjayAoZm4pIHtcbiAgICB2YXIgZm91bmQsIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmZpbmRJbmRleChmbilcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgICAgcmV0dXJuIGZvdW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIHRvQXJyYXkgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgY291bnQgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5sZW5ndGhcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgSXRlbVR5cGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHRvQXBwZW5kXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48SXRlbVR5cGU+fEFycmF5LjxJdGVtVHlwZT58SXRlbVR5cGV9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPEl0ZW1UeXBlPn1cbiAgICovXG4gIHN0YXRpYyBuZXdTdWJDbGFzcyAodG9BcHBlbmQsIGFycikge1xuICAgIHZhciBTdWJDbGFzc1xuICAgIGlmICh0eXBlb2YgdG9BcHBlbmQgPT09ICdvYmplY3QnKSB7XG4gICAgICBTdWJDbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpcyB7fVxuICAgICAgT2JqZWN0LmFzc2lnbihTdWJDbGFzcy5wcm90b3R5cGUsIHRvQXBwZW5kKVxuICAgICAgcmV0dXJuIG5ldyBTdWJDbGFzcyhhcnIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyhhcnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPFQ+fVxuICAgKi9cbiAgY29weSAoYXJyKSB7XG4gICAgdmFyIGNvbGxcbiAgICBpZiAoYXJyID09IG51bGwpIHtcbiAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpXG4gICAgfVxuICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpXG4gICAgcmV0dXJuIGNvbGxcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IGFyclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZXF1YWxzIChhcnIpIHtcbiAgICByZXR1cm4gKHRoaXMuY291bnQoKSA9PT0gKHR5cGVvZiBhcnIuY291bnQgPT09ICdmdW5jdGlvbicgPyBhcnIuY291bnQoKSA6IGFyci5sZW5ndGgpKSAmJiB0aGlzLmV2ZXJ5KGZ1bmN0aW9uICh2YWwsIGkpIHtcbiAgICAgIHJldHVybiBhcnJbaV0gPT09IHZhbFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICBnZXRBZGRlZEZyb20gKGFycikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiAhYXJyLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPFQ+fEFycmF5LjxUPn0gYXJyXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIGdldFJlbW92ZWRGcm9tIChhcnIpIHtcbiAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuICF0aGlzLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxufTtcblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXVxuXG5Db2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zID0gWydjb25jYXQnLCAnZmlsdGVyJywgJ3NsaWNlJ11cblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J11cblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGZ1bmN0KSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uICguLi5hcmcpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZylcbiAgfVxufSlcblxuQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKSlcbiAgfVxufSlcblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgdmFyIG9sZCwgcmVzXG4gICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKVxuICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgcmV0dXJuIHJlc1xuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmNvdW50KClcbiAgfVxufSlcblxuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbU3ltYm9sLml0ZXJhdG9yXSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgSW52YWxpZGF0b3I6IHJlcXVpcmUoJy4vc3JjL0ludmFsaWRhdG9yJyksXG4gIFByb3BlcnRpZXNNYW5hZ2VyOiByZXF1aXJlKCcuL3NyYy9Qcm9wZXJ0aWVzTWFuYWdlcicpLFxuICBQcm9wZXJ0eTogcmVxdWlyZSgnLi9zcmMvUHJvcGVydHknKSxcbiAgZ2V0dGVyczoge1xuICAgIEJhc2VHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQmFzZUdldHRlcicpLFxuICAgIENhbGN1bGF0ZWRHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQ2FsY3VsYXRlZEdldHRlcicpLFxuICAgIENvbXBvc2l0ZUdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXInKSxcbiAgICBJbnZhbGlkYXRlZEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9JbnZhbGlkYXRlZEdldHRlcicpLFxuICAgIE1hbnVhbEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9NYW51YWxHZXR0ZXInKSxcbiAgICBTaW1wbGVHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvU2ltcGxlR2V0dGVyJylcbiAgfSxcbiAgc2V0dGVyczoge1xuICAgIEJhc2VTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvQmFzZVNldHRlcicpLFxuICAgIEJhc2VWYWx1ZVNldHRlcjogcmVxdWlyZSgnLi9zcmMvc2V0dGVycy9CYXNlVmFsdWVTZXR0ZXInKSxcbiAgICBDb2xsZWN0aW9uU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL0NvbGxlY3Rpb25TZXR0ZXInKSxcbiAgICBNYW51YWxTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvTWFudWFsU2V0dGVyJyksXG4gICAgU2ltcGxlU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL1NpbXBsZVNldHRlcicpXG4gIH0sXG4gIHdhdGNoZXJzOiB7XG4gICAgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcjogcmVxdWlyZSgnLi9zcmMvd2F0Y2hlcnMvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcicpLFxuICAgIFByb3BlcnR5V2F0Y2hlcjogcmVxdWlyZSgnLi9zcmMvd2F0Y2hlcnMvUHJvcGVydHlXYXRjaGVyJylcbiAgfVxufVxuIiwiLyoqXG4gKiBAdGVtcGxhdGUgVFxuICovXG5jbGFzcyBDb2xsZWN0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoYXJyKSB7XG4gICAgaWYgKGFyciAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXJyYXkgPSBbXVxuICAgIH1cbiAgfVxuXG4gIGNoYW5nZWQgKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IG9sZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9yZGVyZWRcbiAgICogQHBhcmFtIHtmdW5jdGlvbihULFQpOiBib29sZWFufSBjb21wYXJlRnVuY3Rpb25cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGNoZWNrQ2hhbmdlcyAob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgY29tcGFyZUZ1bmN0aW9uID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGJcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZCA9IFtdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50KCkgIT09IG9sZC5sZW5ndGggfHwgKG9yZGVyZWQgPyB0aGlzLnNvbWUoZnVuY3Rpb24gKHZhbCwgaSkge1xuICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKVxuICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbiAoYikge1xuICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGEsIGIpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBnZXQgKGkpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgZ2V0UmFuZG9tICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaVxuICAgKiBAcGFyYW0ge1R9IHZhbFxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgc2V0IChpLCB2YWwpIHtcbiAgICB2YXIgb2xkXG4gICAgaWYgKHRoaXMuX2FycmF5W2ldICE9PSB2YWwpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbFxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VH0gdmFsXG4gICAqL1xuICBhZGQgKHZhbCkge1xuICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHVzaCh2YWwpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtUfSB2YWxcbiAgICovXG4gIHJlbW92ZSAodmFsKSB7XG4gICAgdmFyIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oVCk6IGJvb2xlYW59IGZuXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwbHVjayAoZm4pIHtcbiAgICB2YXIgZm91bmQsIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmZpbmRJbmRleChmbilcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgICAgcmV0dXJuIGZvdW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7QXJyYXkuPENvbGxlY3Rpb24uPFQ+PnxBcnJheS48QXJyYXkuPFQ+PnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtDb2xsZWN0aW9uLjxUPn1cbiAgICovXG4gIGNvbmNhdCAoLi4uYXJyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheS5jb25jYXQoLi4uYXJyLm1hcCgoYSkgPT4gYS50b0FycmF5ID09IG51bGwgPyBhIDogYS50b0FycmF5KCkpKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICB0b0FycmF5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuc2xpY2UoKVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGNvdW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkubGVuZ3RoXG4gIH1cblxuICAvKipcbiAgICogQHRlbXBsYXRlIEl0ZW1UeXBlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0b0FwcGVuZFxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPEl0ZW1UeXBlPnxBcnJheS48SXRlbVR5cGU+fEl0ZW1UeXBlfSBbYXJyXVxuICAgKiBAcmV0dXJuIHtDb2xsZWN0aW9uLjxJdGVtVHlwZT59XG4gICAqL1xuICBzdGF0aWMgbmV3U3ViQ2xhc3MgKHRvQXBwZW5kLCBhcnIpIHtcbiAgICB2YXIgU3ViQ2xhc3NcbiAgICBpZiAodHlwZW9mIHRvQXBwZW5kID09PSAnb2JqZWN0Jykge1xuICAgICAgU3ViQ2xhc3MgPSBjbGFzcyBleHRlbmRzIHRoaXMge31cbiAgICAgIE9iamVjdC5hc3NpZ24oU3ViQ2xhc3MucHJvdG90eXBlLCB0b0FwcGVuZClcbiAgICAgIHJldHVybiBuZXcgU3ViQ2xhc3MoYXJyKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMoYXJyKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPFQ+fEFycmF5LjxUPnxUfSBbYXJyXVxuICAgKiBAcmV0dXJuIHtDb2xsZWN0aW9uLjxUPn1cbiAgICovXG4gIGNvcHkgKGFycikge1xuICAgIHZhciBjb2xsXG4gICAgaWYgKGFyciA9PSBudWxsKSB7XG4gICAgICBhcnIgPSB0aGlzLnRvQXJyYXkoKVxuICAgIH1cbiAgICBjb2xsID0gbmV3IHRoaXMuY29uc3RydWN0b3IoYXJyKVxuICAgIHJldHVybiBjb2xsXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBhcnJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGVxdWFscyAoYXJyKSB7XG4gICAgcmV0dXJuICh0aGlzLmNvdW50KCkgPT09ICh0eXBlb2YgYXJyLmNvdW50ID09PSAnZnVuY3Rpb24nID8gYXJyLmNvdW50KCkgOiBhcnIubGVuZ3RoKSkgJiYgdGhpcy5ldmVyeShmdW5jdGlvbiAodmFsLCBpKSB7XG4gICAgICByZXR1cm4gYXJyW2ldID09PSB2YWxcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fSBhcnJcbiAgICogQHJldHVybiB7QXJyYXkuPFQ+fVxuICAgKi9cbiAgZ2V0QWRkZWRGcm9tIChhcnIpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gIWFyci5pbmNsdWRlcyhpdGVtKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICBnZXRSZW1vdmVkRnJvbSAoYXJyKSB7XG4gICAgcmV0dXJuIGFyci5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgIHJldHVybiAhdGhpcy5pbmNsdWRlcyhpdGVtKVxuICAgIH0pXG4gIH1cbn07XG5cbkNvbGxlY3Rpb24ucmVhZEZ1bmN0aW9ucyA9IFsnZXZlcnknLCAnZmluZCcsICdmaW5kSW5kZXgnLCAnZm9yRWFjaCcsICdpbmNsdWRlcycsICdpbmRleE9mJywgJ2pvaW4nLCAnbGFzdEluZGV4T2YnLCAnbWFwJywgJ3JlZHVjZScsICdyZWR1Y2VSaWdodCcsICdzb21lJywgJ3RvU3RyaW5nJ11cblxuQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucyA9IFsnZmlsdGVyJywgJ3NsaWNlJ11cblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J11cblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGZ1bmN0KSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uICguLi5hcmcpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZylcbiAgfVxufSlcblxuQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKSlcbiAgfVxufSlcblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgdmFyIG9sZCwgcmVzXG4gICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKVxuICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgcmV0dXJuIHJlc1xuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmNvdW50KClcbiAgfVxufSlcblxuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbU3ltYm9sLml0ZXJhdG9yXSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uXG4iLCJjb25zdCBCaW5kZXIgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuQmluZGVyXG5jb25zdCBFdmVudEJpbmQgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuRXZlbnRCaW5kXG5cbmNvbnN0IHBsdWNrID0gZnVuY3Rpb24gKGFyciwgZm4pIHtcbiAgdmFyIGZvdW5kLCBpbmRleFxuICBpbmRleCA9IGFyci5maW5kSW5kZXgoZm4pXG4gIGlmIChpbmRleCA+IC0xKSB7XG4gICAgZm91bmQgPSBhcnJbaW5kZXhdXG4gICAgYXJyLnNwbGljZShpbmRleCwgMSlcbiAgICByZXR1cm4gZm91bmRcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmNsYXNzIEludmFsaWRhdG9yIGV4dGVuZHMgQmluZGVyIHtcbiAgY29uc3RydWN0b3IgKGludmFsaWRhdGVkLCBzY29wZSA9IG51bGwpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pbnZhbGlkYXRlZCA9IGludmFsaWRhdGVkXG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXVxuICAgIHRoaXMucmVjeWNsZWQgPSBbXVxuICAgIHRoaXMudW5rbm93bnMgPSBbXVxuICAgIHRoaXMuc3RyaWN0ID0gdGhpcy5jb25zdHJ1Y3Rvci5zdHJpY3RcbiAgICB0aGlzLmludmFsaWQgPSBmYWxzZVxuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKClcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sub3duZXIgPSB0aGlzXG4gICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2sgPSAob2xkLCBjb250ZXh0KSA9PiB7XG4gICAgICB0aGlzLmludmFsaWRhdGUoY29udGV4dClcbiAgICB9XG4gICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2sub3duZXIgPSB0aGlzXG4gIH1cblxuICBpbnZhbGlkYXRlIChjb250ZXh0KSB7XG4gICAgdmFyIGZ1bmN0TmFtZVxuICAgIHRoaXMuaW52YWxpZCA9IHRydWVcbiAgICBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQoY29udGV4dClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrKGNvbnRleHQpXG4gICAgfSBlbHNlIGlmICgodGhpcy5pbnZhbGlkYXRlZCAhPSBudWxsKSAmJiB0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZC5pbnZhbGlkYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmludmFsaWRhdGVkLmludmFsaWRhdGUoY29udGV4dClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludmFsaWRhdGVkID09PSAnc3RyaW5nJykge1xuICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5pbnZhbGlkYXRlZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuaW52YWxpZGF0ZWQuc2xpY2UoMSlcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zY29wZVtmdW5jdE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc2NvcGVbZnVuY3ROYW1lXShjb250ZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zY29wZVt0aGlzLmludmFsaWRhdGVkXSA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKGNvbnRleHQpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRlZCAhPSBudWxsICYmIHR5cGVvZiB0aGlzLmludmFsaWRhdGVkLnVua25vd24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGVkLnVua25vd24oY29udGV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZShjb250ZXh0KVxuICAgIH1cbiAgfVxuXG4gIGFkZEV2ZW50QmluZCAoZXZlbnQsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5hZGRCaW5kZXIobmV3IEV2ZW50QmluZChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykpXG4gIH1cblxuICBhZGRCaW5kZXIgKGJpbmRlcikge1xuICAgIGlmIChiaW5kZXIuY2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgYmluZGVyLmNhbGxiYWNrID0gdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2tcbiAgICB9XG4gICAgaWYgKCF0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5zb21lKGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcilcbiAgICB9KSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2gocGx1Y2sodGhpcy5yZWN5Y2xlZCwgZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgICByZXR1cm4gZXZlbnRCaW5kLmVxdWFscyhiaW5kZXIpXG4gICAgICB9KSB8fCBiaW5kZXIpXG4gICAgfVxuICB9XG5cbiAgZ2V0VW5rbm93bkNhbGxiYWNrIChwcm9wKSB7XG4gICAgdmFyIGNhbGxiYWNrXG4gICAgY2FsbGJhY2sgPSAoY29udGV4dCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBwcm9wLmdldCgpXG4gICAgICB9LCBwcm9wLCBjb250ZXh0KVxuICAgIH1cbiAgICBjYWxsYmFjay5wcm9wID0gcHJvcFxuICAgIGNhbGxiYWNrLm93bmVyID0gdGhpc1xuICAgIHJldHVybiBjYWxsYmFja1xuICB9XG5cbiAgYWRkVW5rbm93biAoZm4sIHByb3AsIGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuZmluZFVua25vd24ocHJvcCkpIHtcbiAgICAgIGZuLnByb3AgPSBwcm9wXG4gICAgICBmbi5vd25lciA9IHRoaXNcbiAgICAgIHRoaXMudW5rbm93bnMucHVzaChmbilcbiAgICAgIHJldHVybiB0aGlzLnVua25vd24oY29udGV4dClcbiAgICB9XG4gIH1cblxuICBmaW5kVW5rbm93biAocHJvcCkge1xuICAgIGlmIChwcm9wICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnVua25vd25zLmZpbmQoZnVuY3Rpb24gKHVua25vd24pIHtcbiAgICAgICAgcmV0dXJuIHVua25vd24ucHJvcCA9PT0gcHJvcFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBldmVudCAoZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICBpZiAodGhpcy5jaGVja0VtaXR0ZXIodGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQpXG4gICAgfVxuICB9XG5cbiAgdmFsdWUgKHZhbCwgZXZlbnQsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICB0aGlzLmV2ZW50KGV2ZW50LCB0YXJnZXQpXG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSB7UHJvcGVydHk8VD59IHByb3BcbiAgICogQHJldHVybiB7VH1cbiAgICovXG4gIHByb3AgKHByb3ApIHtcbiAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50QmluZCgnaW52YWxpZGF0ZWQnLCBwcm9wLmV2ZW50cywgdGhpcy5nZXRVbmtub3duQ2FsbGJhY2socHJvcCkpXG4gICAgICB0aGlzLmFkZEV2ZW50QmluZCgndXBkYXRlZCcsIHByb3AuZXZlbnRzLCB0aGlzLmNoYW5nZWRDYWxsYmFjaylcbiAgICAgIHJldHVybiBwcm9wLmdldCgpXG4gICAgfVxuICB9XG5cbiAgcHJvcEJ5TmFtZSAocHJvcCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgIGlmICh0YXJnZXQucHJvcGVydGllc01hbmFnZXIgIT0gbnVsbCkge1xuICAgICAgY29uc3QgcHJvcGVydHkgPSB0YXJnZXQucHJvcGVydGllc01hbmFnZXIuZ2V0UHJvcGVydHkocHJvcClcbiAgICAgIGlmIChwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wKHByb3BlcnR5KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGFyZ2V0W3Byb3AgKyAnUHJvcGVydHknXSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wKHRhcmdldFtwcm9wICsgJ1Byb3BlcnR5J10pXG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRbcHJvcF1cbiAgfVxuXG4gIHByb3BQYXRoIChwYXRoLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgdmFyIHByb3AsIHZhbFxuICAgIHBhdGggPSBwYXRoLnNwbGl0KCcuJylcbiAgICB2YWwgPSB0YXJnZXRcbiAgICB3aGlsZSAoKHZhbCAhPSBudWxsKSAmJiBwYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgIHByb3AgPSBwYXRoLnNoaWZ0KClcbiAgICAgIHZhbCA9IHRoaXMucHJvcEJ5TmFtZShwcm9wLCB2YWwpXG4gICAgfVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIGZ1bmN0IChmdW5jdCkge1xuICAgIHZhciBpbnZhbGlkYXRvciwgcmVzXG4gICAgaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkVW5rbm93bigoKSA9PiB7XG4gICAgICAgIHZhciByZXMyXG4gICAgICAgIHJlczIgPSBmdW5jdChpbnZhbGlkYXRvcilcbiAgICAgICAgaWYgKHJlcyAhPT0gcmVzMikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdGUoKVxuICAgICAgICB9XG4gICAgICB9LCBpbnZhbGlkYXRvcilcbiAgICB9KVxuICAgIHJlcyA9IGZ1bmN0KGludmFsaWRhdG9yKVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnB1c2goaW52YWxpZGF0b3IpXG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgdmFsaWRhdGVVbmtub3ducyAoKSB7XG4gICAgdGhpcy51bmtub3ducy5zbGljZSgpLmZvckVhY2goZnVuY3Rpb24gKHVua25vd24pIHtcbiAgICAgIHVua25vd24oKVxuICAgIH0pXG4gICAgdGhpcy51bmtub3ducyA9IFtdXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5sZW5ndGggPT09IDBcbiAgfVxuXG4gIGJpbmQgKCkge1xuICAgIHRoaXMuaW52YWxpZCA9IGZhbHNlXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICBldmVudEJpbmQuYmluZCgpXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcmVjeWNsZSAoZm4pIHtcbiAgICB2YXIgZG9uZSwgcmVzXG4gICAgdGhpcy5yZWN5Y2xlZCA9IHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMgPSBbXVxuICAgIGRvbmUgPSB0aGlzLmVuZFJlY3ljbGUuYmluZCh0aGlzKVxuICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChmbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIHJldHVybiBmbih0aGlzLCBkb25lKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gZm4odGhpcylcbiAgICAgICAgZG9uZSgpXG4gICAgICAgIHJldHVybiByZXNcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRvbmVcbiAgICB9XG4gIH1cblxuICBlbmRSZWN5Y2xlICgpIHtcbiAgICB0aGlzLnJlY3ljbGVkLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgcmV0dXJuIGV2ZW50QmluZC51bmJpbmQoKVxuICAgIH0pXG4gICAgdGhpcy5yZWN5Y2xlZCA9IFtdXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNoZWNrRW1pdHRlciAoZW1pdHRlcikge1xuICAgIHJldHVybiBFdmVudEJpbmQuY2hlY2tFbWl0dGVyKGVtaXR0ZXIsIHRoaXMuc3RyaWN0KVxuICB9XG5cbiAgY2hlY2tQcm9wSW5zdGFuY2UgKHByb3ApIHtcbiAgICByZXR1cm4gdHlwZW9mIHByb3AuZ2V0ID09PSAnZnVuY3Rpb24nICYmIHRoaXMuY2hlY2tFbWl0dGVyKHByb3AuZXZlbnRzKVxuICB9XG5cbiAgdW5iaW5kICgpIHtcbiAgICB0aGlzLmludmFsaWRhdGlvbkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgIGV2ZW50QmluZC51bmJpbmQoKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufTtcblxuSW52YWxpZGF0b3Iuc3RyaWN0ID0gdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdG9yXG4iLCJjb25zdCBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vUHJvcGVydHknKVxuXG5jbGFzcyBQcm9wZXJ0aWVzTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yIChwcm9wZXJ0aWVzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheS48UHJvcGVydHk+fVxuICAgICAqL1xuICAgIHRoaXMucHJvcGVydGllcyA9IFtdXG4gICAgdGhpcy5nbG9iYWxPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IGluaXRXYXRjaGVyczogZmFsc2UgfSwgb3B0aW9ucylcbiAgICB0aGlzLnByb3BlcnRpZXNPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcGVydGllcylcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IHByb3BlcnRpZXNcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zXG4gICAqIEByZXR1cm4ge1Byb3BlcnRpZXNNYW5hZ2VyfVxuICAgKi9cbiAgY29weVdpdGggKHByb3BlcnRpZXMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMubWVyZ2VQcm9wZXJ0aWVzT3B0aW9ucyh0aGlzLnByb3BlcnRpZXNPcHRpb25zLCBwcm9wZXJ0aWVzKSwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nbG9iYWxPcHRpb25zLCBvcHRpb25zKSlcbiAgfVxuXG4gIHdpdGhQcm9wZXJ0eSAocHJvcCwgb3B0aW9ucykge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fVxuICAgIHByb3BlcnRpZXNbcHJvcF0gPSBvcHRpb25zXG4gICAgcmV0dXJuIHRoaXMuY29weVdpdGgocHJvcGVydGllcylcbiAgfVxuXG4gIHVzZVNjb3BlIChzY29wZSkge1xuICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHt9LCB7IHNjb3BlOiBzY29wZSB9KVxuICB9XG5cbiAgbWVyZ2VQcm9wZXJ0aWVzT3B0aW9ucyAoLi4uYXJnKSB7XG4gICAgcmV0dXJuIGFyZy5yZWR1Y2UoKHJlcywgb3B0KSA9PiB7XG4gICAgICBPYmplY3Qua2V5cyhvcHQpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgcmVzW25hbWVdID0gdGhpcy5tZXJnZVByb3BlcnR5T3B0aW9ucyhyZXNbbmFtZV0gfHwge30sIG9wdFtuYW1lXSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcmVzXG4gICAgfSwge30pXG4gIH1cblxuICBtZXJnZVByb3BlcnR5T3B0aW9ucyAoLi4uYXJnKSB7XG4gICAgY29uc3Qgbm90TWVyZ2FibGUgPSBbJ2RlZmF1bHQnLCAnc2NvcGUnXVxuICAgIHJldHVybiBhcmcucmVkdWNlKChyZXMsIG9wdCkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMob3B0KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzW25hbWVdID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvcHRbbmFtZV0gPT09ICdmdW5jdGlvbicgJiYgIW5vdE1lcmdhYmxlLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICAgICAgcmVzW25hbWVdID0gdGhpcy5tZXJnZUNhbGxiYWNrKHJlc1tuYW1lXSwgb3B0W25hbWVdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc1tuYW1lXSA9IG9wdFtuYW1lXVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0sIHt9KVxuICB9XG5cbiAgbWVyZ2VDYWxsYmFjayAob2xkRnVuY3QsIG5ld0Z1bmN0KSB7XG4gICAgY29uc3QgZm4gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgICByZXR1cm4gbmV3RnVuY3QuY2FsbCh0aGlzLCAuLi5hcmcsIG9sZEZ1bmN0LmJpbmQodGhpcykpXG4gICAgfVxuICAgIGZuLmNvbXBvbmVudHMgPSAob2xkRnVuY3QuY29tcG9uZW50cyB8fCBbb2xkRnVuY3RdKS5jb25jYXQoKG9sZEZ1bmN0Lm5ld0Z1bmN0IHx8IFtuZXdGdW5jdF0pKVxuICAgIGZuLm5iUGFyYW1zID0gbmV3RnVuY3QubmJQYXJhbXMgfHwgbmV3RnVuY3QubGVuZ3RoXG4gICAgcmV0dXJuIGZuXG4gIH1cblxuICBpbml0UHJvcGVydGllcyAoKSB7XG4gICAgdGhpcy5hZGRQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllc09wdGlvbnMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycyAoKSB7XG4gICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHByb3AuY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzKCkpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGluaXRXYXRjaGVycyAoKSB7XG4gICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHByb3AuaW5pdFdhdGNoZXJzKCkpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGluaXRTY29wZSAoKSB7XG4gICAgdGhpcy5pbml0UHJvcGVydGllcygpXG4gICAgdGhpcy5jcmVhdGVTY29wZUdldHRlclNldHRlcnMoKVxuICAgIHRoaXMuaW5pdFdhdGNoZXJzKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eTxUPn1cbiAgICovXG4gIGFkZFByb3BlcnR5IChuYW1lLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcHJvcCA9IG5ldyBQcm9wZXJ0eShPYmplY3QuYXNzaWduKHsgbmFtZTogbmFtZSB9LCB0aGlzLmdsb2JhbE9wdGlvbnMsIG9wdGlvbnMpKVxuICAgIHRoaXMucHJvcGVydGllcy5wdXNoKHByb3ApXG4gICAgcmV0dXJuIHByb3BcbiAgfVxuXG4gIGFkZFByb3BlcnRpZXMgKG9wdGlvbnMpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKChuYW1lKSA9PiB0aGlzLmFkZFByb3BlcnR5KG5hbWUsIG9wdGlvbnNbbmFtZV0pKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybnMge1Byb3BlcnR5fVxuICAgKi9cbiAgZ2V0UHJvcGVydHkgKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLmZpbmQoKHByb3ApID0+IHByb3Aub3B0aW9ucy5uYW1lID09PSBuYW1lKVxuICB9XG5cbiAgc2V0UHJvcGVydGllc0RhdGEgKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKCgob3B0aW9ucy53aGl0ZWxpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy53aGl0ZWxpc3QuaW5kZXhPZihrZXkpICE9PSAtMSkgJiYgKChvcHRpb25zLmJsYWNrbGlzdCA9PSBudWxsKSB8fCBvcHRpb25zLmJsYWNrbGlzdC5pbmRleE9mKGtleSkgPT09IC0xKSkge1xuICAgICAgICBjb25zdCBwcm9wID0gdGhpcy5nZXRQcm9wZXJ0eShrZXkpXG4gICAgICAgIGlmIChwcm9wKSB7XG4gICAgICAgICAgcHJvcC5zZXQoZGF0YVtrZXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0TWFudWFsRGF0YVByb3BlcnRpZXMgKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXMucmVkdWNlKChyZXMsIHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wLmdldHRlci5jYWxjdWxhdGVkICYmIHByb3AubWFudWFsKSB7XG4gICAgICAgIHJlc1twcm9wLm9wdGlvbnMubmFtZV0gPSBwcm9wLmdldCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfSwge30pXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLnByb3BlcnRpZXMuZm9yRWFjaCgocHJvcCkgPT4gcHJvcC5kZXN0cm95KCkpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0aWVzTWFuYWdlclxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG5cbmNvbnN0IFNpbXBsZUdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9TaW1wbGVHZXR0ZXInKVxuY29uc3QgQ2FsY3VsYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9DYWxjdWxhdGVkR2V0dGVyJylcbmNvbnN0IEludmFsaWRhdGVkR2V0dGVyID0gcmVxdWlyZSgnLi9nZXR0ZXJzL0ludmFsaWRhdGVkR2V0dGVyJylcbmNvbnN0IE1hbnVhbEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9NYW51YWxHZXR0ZXInKVxuY29uc3QgQ29tcG9zaXRlR2V0dGVyID0gcmVxdWlyZSgnLi9nZXR0ZXJzL0NvbXBvc2l0ZUdldHRlcicpXG5cbmNvbnN0IE1hbnVhbFNldHRlciA9IHJlcXVpcmUoJy4vc2V0dGVycy9NYW51YWxTZXR0ZXInKVxuY29uc3QgU2ltcGxlU2V0dGVyID0gcmVxdWlyZSgnLi9zZXR0ZXJzL1NpbXBsZVNldHRlcicpXG5jb25zdCBCYXNlVmFsdWVTZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvQmFzZVZhbHVlU2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb25TZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvQ29sbGVjdGlvblNldHRlcicpXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuY2xhc3MgUHJvcGVydHkge1xuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gUHJvcGVydHlPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7VH0gW2RlZmF1bHRdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oaW1wb3J0KFwiLi9JbnZhbGlkYXRvclwiKSk6IFR9IFtjYWxjdWxdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oKTogVH0gW2dldF1cbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihUKX0gW3NldF1cbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihULFQpfGltcG9ydChcIi4vUHJvcGVydHlXYXRjaGVyXCIpPFQ+fSBbY2hhbmdlXVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW58c3RyaW5nfGZ1bmN0aW9uKFQsVCk6VH0gW2NvbXBvc2VkXVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW58T2JqZWN0fSBbY29sbGVjdGlvbl1cbiAgICogQHByb3BlcnR5IHsqfSBbc2NvcGVdXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlPcHRpb25zfSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgUHJvcGVydHkuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtFdmVudEVtaXR0ZXJ9XG4gICAgICovXG4gICAgdGhpcy5ldmVudHMgPSBuZXcgdGhpcy5vcHRpb25zLkV2ZW50RW1pdHRlckNsYXNzKClcbiAgICB0aGlzLm1ha2VTZXR0ZXIoKVxuICAgIHRoaXMubWFrZUdldHRlcigpXG4gICAgdGhpcy5zZXR0ZXIuaW5pdCgpXG4gICAgdGhpcy5nZXR0ZXIuaW5pdCgpXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pbml0V2F0Y2hlcnMpIHtcbiAgICAgIHRoaXMuaW5pdFdhdGNoZXJzKClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldFF1YWxpZmllZE5hbWUgKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMubmFtZSkge1xuICAgICAgbGV0IG5hbWUgPSB0aGlzLm9wdGlvbnMubmFtZVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zY29wZSAmJiB0aGlzLm9wdGlvbnMuc2NvcGUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgbmFtZSA9IHRoaXMub3B0aW9ucy5zY29wZS5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsgbmFtZVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5hbWVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvU3RyaW5nICgpIHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5nZXRRdWFsaWZpZWROYW1lKClcbiAgICBpZiAobmFtZSkge1xuICAgICAgcmV0dXJuIGBbUHJvcGVydHkgJHtuYW1lfV1gXG4gICAgfVxuICAgIHJldHVybiAnW1Byb3BlcnR5XSdcbiAgfVxuXG4gIGluaXRXYXRjaGVycyAoKSB7XG4gICAgdGhpcy5zZXR0ZXIubG9hZEludGVybmFsV2F0Y2hlcigpXG4gIH1cblxuICBtYWtlR2V0dGVyICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5nZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuZ2V0dGVyID0gbmV3IE1hbnVhbEdldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvbXBvc2VkICE9IG51bGwgJiYgdGhpcy5vcHRpb25zLmNvbXBvc2VkICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5nZXR0ZXIgPSBuZXcgQ29tcG9zaXRlR2V0dGVyKHRoaXMpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNhbGN1bCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKCh0aGlzLm9wdGlvbnMuY2FsY3VsLm5iUGFyYW1zIHx8IHRoaXMub3B0aW9ucy5jYWxjdWwubGVuZ3RoKSA9PT0gMCkge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBDYWxjdWxhdGVkR2V0dGVyKHRoaXMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBJbnZhbGlkYXRlZEdldHRlcih0aGlzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldHRlciA9IG5ldyBTaW1wbGVHZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICBtYWtlU2V0dGVyICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IE1hbnVhbFNldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvbGxlY3Rpb24gIT0gbnVsbCAmJiB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbiAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IENvbGxlY3Rpb25TZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsICYmIHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IEJhc2VWYWx1ZVNldHRlcih0aGlzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldHRlciA9IG5ldyBTaW1wbGVTZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eTxUPn1cbiAgICovXG4gIGNvcHlXaXRoIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1R9XG4gICAqL1xuICBnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLmdldHRlci5nZXQoKVxuICB9XG5cbiAgaW52YWxpZGF0ZSAoY29udGV4dCkge1xuICAgIHRoaXMuZ2V0dGVyLmludmFsaWRhdGUoY29udGV4dClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdW5rbm93biAoY29udGV4dCkge1xuICAgIHRoaXMuZ2V0dGVyLnVua25vd24oY29udGV4dClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0ICh2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5zZXR0ZXIuc2V0KHZhbClcbiAgfVxuXG4gIGNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycyAoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zY29wZSkge1xuICAgICAgY29uc3QgcHJvcCA9IHRoaXNcbiAgICAgIGxldCBvcHQgPSB7fVxuICAgICAgb3B0W3RoaXMub3B0aW9ucy5uYW1lICsgJ1Byb3BlcnR5J10gPSB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBwcm9wXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9wdCA9IHRoaXMuZ2V0dGVyLmdldFNjb3BlR2V0dGVyU2V0dGVycyhvcHQpXG4gICAgICBvcHQgPSB0aGlzLnNldHRlci5nZXRTY29wZUdldHRlclNldHRlcnMob3B0KVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcy5vcHRpb25zLnNjb3BlLCBvcHQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlc3Ryb3kgPT09IHRydWUgJiYgdGhpcy52YWx1ZSAhPSBudWxsICYmIHRoaXMudmFsdWUuZGVzdHJveSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnZhbHVlLmRlc3Ryb3koKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmNhbGxPcHRpb25GdW5jdCgnZGVzdHJveScsIHRoaXMudmFsdWUpXG4gICAgfVxuICAgIHRoaXMuZ2V0dGVyLmRlc3Ryb3koKVxuICAgIHRoaXMudmFsdWUgPSBudWxsXG4gIH1cblxuICBjYWxsT3B0aW9uRnVuY3QgKGZ1bmN0LCAuLi5hcmdzKSB7XG4gICAgaWYgKHR5cGVvZiBmdW5jdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGZ1bmN0ID0gdGhpcy5vcHRpb25zW2Z1bmN0XVxuICAgIH1cbiAgICByZXR1cm4gZnVuY3QuYXBwbHkodGhpcy5vcHRpb25zLnNjb3BlIHx8IHRoaXMsIGFyZ3MpXG4gIH1cbn1cblxuUHJvcGVydHkuZGVmYXVsdE9wdGlvbnMgPSB7XG4gIEV2ZW50RW1pdHRlckNsYXNzOiBFdmVudEVtaXR0ZXIsXG4gIGluaXRXYXRjaGVyczogdHJ1ZVxufVxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0eVxuIiwiXG5jbGFzcyBCYXNlR2V0dGVyIHtcbiAgY29uc3RydWN0b3IgKHByb3ApIHtcbiAgICB0aGlzLnByb3AgPSBwcm9wXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICAgIHRoaXMuaW5pdGlhdGVkID0gZmFsc2VcbiAgICB0aGlzLmludmFsaWRhdGVkID0gZmFsc2VcbiAgfVxuXG4gIGdldCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKVxuICB9XG5cbiAgb3V0cHV0ICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLm91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ291dHB1dCcsIHRoaXMucHJvcC52YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICAgIH1cbiAgfVxuXG4gIHJldmFsaWRhdGVkICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgdGhpcy5pbml0aWF0ZWQgPSB0cnVlXG4gICAgdGhpcy5pbnZhbGlkYXRlZCA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKGNvbnRleHQpIHtcbiAgICBpZiAoIXRoaXMuaW52YWxpZGF0ZWQpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQgPSB0cnVlXG4gICAgICB0aGlzLmludmFsaWRhdGVOb3RpY2UoY29udGV4dClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGludmFsaWRhdGUgKGNvbnRleHQpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICAgIGlmICghdGhpcy5pbnZhbGlkYXRlZCkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZCA9IHRydWVcbiAgICAgIHRoaXMuaW52YWxpZGF0ZU5vdGljZShjb250ZXh0KVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaW52YWxpZGF0ZU5vdGljZSAoY29udGV4dCkge1xuICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IHsgb3JpZ2luOiB0aGlzLnByb3AgfVxuICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgnaW52YWxpZGF0ZWQnLCBjb250ZXh0KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfSBvcHRcbiAgICogQHJldHVybiB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfVxuICAgKi9cbiAgZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzIChvcHQpIHtcbiAgICBjb25zdCBwcm9wID0gdGhpcy5wcm9wXG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdID0gb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdIHx8IHt9XG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBwcm9wLmdldCgpXG4gICAgfVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5lbnVtZXJhYmxlID0gdHJ1ZVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5jb25maWd1cmFibGUgPSB0cnVlXG4gICAgcmV0dXJuIG9wdFxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlR2V0dGVyXG4iLCJcbmNvbnN0IEJhc2VHZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VHZXR0ZXInKVxuXG5jbGFzcyBDYWxjdWxhdGVkR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIGNvbnN0IG9sZCA9IHRoaXMucHJvcC52YWx1ZVxuICAgICAgY29uc3QgaW5pdGlhdGVkID0gdGhpcy5pbml0aWF0ZWRcbiAgICAgIHRoaXMuY2FsY3VsKClcbiAgICAgIGlmICghaW5pdGlhdGVkKSB7XG4gICAgICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgndXBkYXRlZCcsIG9sZClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wLnNldHRlci5jaGVja0NoYW5nZXModGhpcy5wcm9wLnZhbHVlLCBvbGQpKSB7XG4gICAgICAgIHRoaXMucHJvcC5zZXR0ZXIuY2hhbmdlZChvbGQpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzLm91dHB1dCgpXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHRoaXMucHJvcC5zZXR0ZXIuc2V0UmF3VmFsdWUodGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnY2FsY3VsJykpXG4gICAgdGhpcy5wcm9wLm1hbnVhbCA9IGZhbHNlXG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsY3VsYXRlZEdldHRlclxuIiwiY29uc3QgSW52YWxpZGF0ZWRHZXR0ZXIgPSByZXF1aXJlKCcuL0ludmFsaWRhdGVkR2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb24gPSByZXF1aXJlKCdzcGFyay1jb2xsZWN0aW9uJylcbmNvbnN0IEludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKVxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLlJlZmVyZW5jZVxuXG5jbGFzcyBDb21wb3NpdGVHZXR0ZXIgZXh0ZW5kcyBJbnZhbGlkYXRlZEdldHRlciB7XG4gIGluaXQgKCkge1xuICAgIHN1cGVyLmluaXQoKVxuICAgIGlmICh0aGlzLnByb3Aub3B0aW9ucy5kZWZhdWx0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZVZhbHVlID0gdGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKG51bGwpXG4gICAgICB0aGlzLmJhc2VWYWx1ZSA9IG51bGxcbiAgICB9XG4gICAgdGhpcy5tZW1iZXJzID0gbmV3IENvbXBvc2l0ZUdldHRlci5NZW1iZXJzKHRoaXMucHJvcC5vcHRpb25zLm1lbWJlcnMpXG4gICAgaWYgKHRoaXMucHJvcC5vcHRpb25zLmNhbGN1bCAhPSBudWxsKSB7XG4gICAgICB0aGlzLm1lbWJlcnMudW5zaGlmdCgocHJldiwgaW52YWxpZGF0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcC5vcHRpb25zLmNhbGN1bC5iaW5kKHRoaXMucHJvcC5vcHRpb25zLnNjb3BlKShpbnZhbGlkYXRvcilcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMubWVtYmVycy5jaGFuZ2VkID0gKG9sZCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHRoaXMucHJvcC5tZW1iZXJzID0gdGhpcy5tZW1iZXJzXG4gICAgdGhpcy5qb2luID0gdGhpcy5ndWVzc0pvaW5GdW5jdGlvbigpXG4gIH1cblxuICBndWVzc0pvaW5GdW5jdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5jb21wb3NlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWQgPT09ICdzdHJpbmcnICYmIENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zW3RoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkXSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnNbdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWRdXG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3Aub3B0aW9ucy5jb2xsZWN0aW9uICE9IG51bGwgJiYgdGhpcy5wcm9wLm9wdGlvbnMuY29sbGVjdGlvbiAhPT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9ucy5jb25jYXRcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMub3JcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9ucy5hbmRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zLmxhc3RcbiAgICB9XG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIGlmICh0aGlzLm1lbWJlcnMubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLnByb3AsIHRoaXMucHJvcC5vcHRpb25zLnNjb3BlKVxuICAgICAgfVxuICAgICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMubWVtYmVycy5yZWR1Y2UoKHByZXYsIG1lbWJlcikgPT4ge1xuICAgICAgICAgIHZhciB2YWxcbiAgICAgICAgICB2YWwgPSB0eXBlb2YgbWVtYmVyID09PSAnZnVuY3Rpb24nID8gbWVtYmVyKHByZXYsIHRoaXMuaW52YWxpZGF0b3IpIDogbWVtYmVyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuam9pbihwcmV2LCB2YWwpXG4gICAgICAgIH0sIHRoaXMuYmFzZVZhbHVlKSlcbiAgICAgICAgZG9uZSgpXG4gICAgICAgIGlmIChpbnZhbGlkYXRvci5pc0VtcHR5KCkpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbnVsbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludmFsaWRhdG9yLmJpbmQoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMuYmFzZVZhbHVlKVxuICAgIH1cbiAgICB0aGlzLnJldmFsaWRhdGVkKClcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9IG9wdFxuICAgKiBAcmV0dXJuIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9XG4gICAqL1xuICBnZXRTY29wZUdldHRlclNldHRlcnMgKG9wdCkge1xuICAgIG9wdCA9IHN1cGVyLmdldFNjb3BlR2V0dGVyU2V0dGVycyhvcHQpXG4gICAgY29uc3QgbWVtYmVycyA9IHRoaXMubWVtYmVyc1xuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lICsgJ01lbWJlcnMnXSA9IHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbWVtYmVyc1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0XG4gIH1cbn1cblxuQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMgPSB7XG4gIGFuZDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiXG4gIH0sXG4gIG9yOiBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhIHx8IGJcbiAgfSxcbiAgbGFzdDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYlxuICB9LFxuICBzdW06IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEgKyBiXG4gIH0sXG4gIGNvbmNhdDogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYSA9PSBudWxsKSB7XG4gICAgICBhID0gW11cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGEudG9BcnJheSAhPSBudWxsKSB7XG4gICAgICAgIGEgPSBhLnRvQXJyYXkoKVxuICAgICAgfVxuICAgICAgaWYgKGEuY29uY2F0ID09IG51bGwpIHtcbiAgICAgICAgYSA9IFthXVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYiA9PSBudWxsKSB7XG4gICAgICBiID0gW11cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGIudG9BcnJheSAhPSBudWxsKSB7XG4gICAgICAgIGIgPSBiLnRvQXJyYXkoKVxuICAgICAgfVxuICAgICAgaWYgKGIuY29uY2F0ID09IG51bGwpIHtcbiAgICAgICAgYiA9IFtiXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYS5jb25jYXQoYilcbiAgfVxufVxuXG5Db21wb3NpdGVHZXR0ZXIuTWVtYmVycyA9IGNsYXNzIE1lbWJlcnMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgYWRkUHJvcGVydHkgKHByb3ApIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgobnVsbCwgcHJvcCkgPT09IC0xKSB7XG4gICAgICB0aGlzLnB1c2goUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmdW5jdGlvbiAocHJldiwgaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3AocHJvcClcbiAgICAgIH0sIHtcbiAgICAgICAgcHJvcDogcHJvcFxuICAgICAgfSkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZGRQcm9wZXJ0eVBhdGggKG5hbWUsIG9iaikge1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChuYW1lLCBvYmopID09PSAtMSkge1xuICAgICAgdGhpcy5wdXNoKFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiBpbnZhbGlkYXRvci5wcm9wUGF0aChuYW1lLCBvYmopXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIG9iajogb2JqXG4gICAgICB9KSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJlbW92ZVByb3BlcnR5IChwcm9wKSB7XG4gICAgdGhpcy5yZW1vdmVSZWYoeyBwcm9wOiBwcm9wIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZFZhbHVlUmVmICh2YWwsIGRhdGEpIHtcbiAgICBpZiAodGhpcy5maW5kUmVmSW5kZXgoZGF0YSkgPT09IC0xKSB7XG4gICAgICBjb25zdCBmbiA9IFJlZmVyZW5jZS5tYWtlUmVmZXJyZWQoZnVuY3Rpb24gKHByZXYsIGludmFsaWRhdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH0sIGRhdGEpXG4gICAgICBmbi52YWwgPSB2YWxcbiAgICAgIHRoaXMucHVzaChmbilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFZhbHVlUmVmICh2YWwsIGRhdGEpIHtcbiAgICBjb25zdCBpID0gdGhpcy5maW5kUmVmSW5kZXgoZGF0YSlcbiAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuYWRkVmFsdWVSZWYodmFsLCBkYXRhKVxuICAgIH0gZWxzZSBpZiAodGhpcy5nZXQoaSkudmFsICE9PSB2YWwpIHtcbiAgICAgIGNvbnN0IGZuID0gUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmdW5jdGlvbiAocHJldiwgaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgfSwgZGF0YSlcbiAgICAgIGZuLnZhbCA9IHZhbFxuICAgICAgdGhpcy5zZXQoaSwgZm4pXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBnZXRWYWx1ZVJlZiAoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRCeVJlZihkYXRhKS52YWxcbiAgfVxuXG4gIGFkZEZ1bmN0aW9uUmVmIChmbiwgZGF0YSkge1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChkYXRhKSA9PT0gLTEpIHtcbiAgICAgIGZuID0gUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmbiwgZGF0YSlcbiAgICAgIHRoaXMucHVzaChmbilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZpbmRCeVJlZiAoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLmZpbmRSZWZJbmRleChkYXRhKV1cbiAgfVxuXG4gIGZpbmRSZWZJbmRleCAoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maW5kSW5kZXgoZnVuY3Rpb24gKG1lbWJlcikge1xuICAgICAgcmV0dXJuIChtZW1iZXIucmVmICE9IG51bGwpICYmIG1lbWJlci5yZWYuY29tcGFyZURhdGEoZGF0YSlcbiAgICB9KVxuICB9XG5cbiAgcmVtb3ZlUmVmIChkYXRhKSB7XG4gICAgdmFyIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuZmluZFJlZkluZGV4KGRhdGEpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIHRoaXMuX2FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb3NpdGVHZXR0ZXJcbiIsImNvbnN0IEludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKVxuY29uc3QgQ2FsY3VsYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vQ2FsY3VsYXRlZEdldHRlcicpXG5cbmNsYXNzIEludmFsaWRhdGVkR2V0dGVyIGV4dGVuZHMgQ2FsY3VsYXRlZEdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpXG4gICAgfVxuICAgIHJldHVybiBzdXBlci5nZXQoKVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICBpZiAoIXRoaXMuaW52YWxpZGF0b3IpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcy5wcm9wLCB0aGlzLnByb3Aub3B0aW9ucy5zY29wZSlcbiAgICB9XG4gICAgdGhpcy5pbnZhbGlkYXRvci5yZWN5Y2xlKChpbnZhbGlkYXRvciwgZG9uZSkgPT4ge1xuICAgICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdjYWxjdWwnLCBpbnZhbGlkYXRvcikpXG4gICAgICB0aGlzLnByb3AubWFudWFsID0gZmFsc2VcbiAgICAgIGRvbmUoKVxuICAgICAgaWYgKGludmFsaWRhdG9yLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yID0gbnVsbFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW52YWxpZGF0b3IuYmluZCgpXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLnJldmFsaWRhdGVkKClcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQoKVxuICB9XG5cbiAgaW52YWxpZGF0ZSAoY29udGV4dCkge1xuICAgIHN1cGVyLmludmFsaWRhdGUoY29udGV4dClcbiAgICBpZiAoIXRoaXMuY2FsY3VsYXRlZCAmJiB0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLmludmFsaWRhdG9yICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW52YWxpZGF0ZWRHZXR0ZXJcbiIsImNvbnN0IEJhc2VHZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VHZXR0ZXInKVxuXG5jbGFzcyBNYW51YWxHZXR0ZXIgZXh0ZW5kcyBCYXNlR2V0dGVyIHtcbiAgZ2V0ICgpIHtcbiAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ2dldCcpKVxuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWVcbiAgICB0aGlzLmluaXRpYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFudWFsR2V0dGVyXG4iLCJjb25zdCBCYXNlR2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlR2V0dGVyJylcblxuY2xhc3MgU2ltcGxlR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVkID0gdHJ1ZVxuICAgIGlmICghdGhpcy5pbml0aWF0ZWQpIHtcbiAgICAgIHRoaXMuaW5pdGlhdGVkID0gdHJ1ZVxuICAgICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCd1cGRhdGVkJylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZUdldHRlclxuIiwiXG5jb25zdCBQcm9wZXJ0eVdhdGNoZXIgPSByZXF1aXJlKCcuLi93YXRjaGVycy9Qcm9wZXJ0eVdhdGNoZXInKVxuXG5jbGFzcyBCYXNlU2V0dGVyIHtcbiAgY29uc3RydWN0b3IgKHByb3ApIHtcbiAgICB0aGlzLnByb3AgPSBwcm9wXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB0aGlzLnNldERlZmF1bHRWYWx1ZSgpXG4gIH1cblxuICBzZXREZWZhdWx0VmFsdWUgKCkge1xuICAgIHRoaXMuc2V0UmF3VmFsdWUodGhpcy5pbmdlc3QodGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdCkpXG4gIH1cblxuICBsb2FkSW50ZXJuYWxXYXRjaGVyICgpIHtcbiAgICBjb25zdCBjaGFuZ2VPcHQgPSB0aGlzLnByb3Aub3B0aW9ucy5jaGFuZ2VcbiAgICBpZiAodHlwZW9mIGNoYW5nZU9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy53YXRjaGVyID0gbmV3IFByb3BlcnR5V2F0Y2hlcih7XG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnByb3AsXG4gICAgICAgIGNhbGxiYWNrOiBjaGFuZ2VPcHQsXG4gICAgICAgIHNjb3BlOiB0aGlzLnByb3Aub3B0aW9ucy5zY29wZSxcbiAgICAgICAgYXV0b0JpbmQ6IHRydWVcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChjaGFuZ2VPcHQgIT0gbnVsbCAmJiB0eXBlb2YgY2hhbmdlT3B0LmNvcHlXaXRoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLndhdGNoZXIgPSBjaGFuZ2VPcHQuY29weVdpdGgoe1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wLFxuICAgICAgICBzY29wZTogdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUsXG4gICAgICAgIGF1dG9CaW5kOiB0cnVlXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy53YXRjaGVyXG4gIH1cblxuICBzZXQgKHZhbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIHNldFJhd1ZhbHVlICh2YWwpIHtcbiAgICB0aGlzLnByb3AudmFsdWUgPSB2YWxcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cblxuICBpbmdlc3QgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuaW5nZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YWwgPSB0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdpbmdlc3QnLCB2YWwpXG4gICAgfVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIGNoZWNrQ2hhbmdlcyAodmFsLCBvbGQpIHtcbiAgICByZXR1cm4gdmFsICE9PSBvbGRcbiAgfVxuXG4gIGNoYW5nZWQgKG9sZCkge1xuICAgIGNvbnN0IGNvbnRleHQgPSB7IG9yaWdpbjogdGhpcy5wcm9wIH1cbiAgICB0aGlzLnByb3AuZXZlbnRzLmVtaXQoJ3VwZGF0ZWQnLCBvbGQsIGNvbnRleHQpXG4gICAgdGhpcy5wcm9wLmV2ZW50cy5lbWl0KCdjaGFuZ2VkJywgb2xkLCBjb250ZXh0KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9IG9wdFxuICAgKiBAcmV0dXJuIHtQcm9wZXJ0eURlc2NyaXB0b3JNYXB9XG4gICAqL1xuICBnZXRTY29wZUdldHRlclNldHRlcnMgKG9wdCkge1xuICAgIGNvbnN0IHByb3AgPSB0aGlzLnByb3BcbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0gPSBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0gfHwge31cbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZV0uc2V0ID0gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIHByb3Auc2V0KHZhbClcbiAgICB9XG4gICAgcmV0dXJuIG9wdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVNldHRlclxuIiwiY29uc3QgQmFzZVNldHRlciA9IHJlcXVpcmUoJy4vQmFzZVNldHRlcicpXG5cbmNsYXNzIEJhc2VWYWx1ZVNldHRlciBleHRlbmRzIEJhc2VTZXR0ZXIge1xuICBzZXQgKHZhbCkge1xuICAgIHZhbCA9IHRoaXMuaW5nZXN0KHZhbClcbiAgICBpZiAodGhpcy5wcm9wLmdldHRlci5iYXNlVmFsdWUgIT09IHZhbCkge1xuICAgICAgdGhpcy5wcm9wLmdldHRlci5iYXNlVmFsdWUgPSB2YWxcbiAgICAgIHRoaXMucHJvcC5pbnZhbGlkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VWYWx1ZVNldHRlclxuIiwiY29uc3QgU2ltcGxlU2V0dGVyID0gcmVxdWlyZSgnLi9TaW1wbGVTZXR0ZXInKVxuY29uc3QgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJ3NwYXJrLWNvbGxlY3Rpb24nKVxuY29uc3QgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4uL3dhdGNoZXJzL0NvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXInKVxuXG5jbGFzcyBDb2xsZWN0aW9uU2V0dGVyIGV4dGVuZHMgU2ltcGxlU2V0dGVyIHtcbiAgaW5pdCAoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAgQ29sbGVjdGlvblNldHRlci5kZWZhdWx0T3B0aW9ucyxcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5jb2xsZWN0aW9uID09PSAnb2JqZWN0JyA/IHRoaXMucHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gOiB7fVxuICAgIClcbiAgICBzdXBlci5pbml0KClcbiAgfVxuXG4gIGxvYWRJbnRlcm5hbFdhdGNoZXIgKCkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5jaGFuZ2UgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5pdGVtQWRkZWQgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgIHR5cGVvZiB0aGlzLnByb3Aub3B0aW9ucy5pdGVtUmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgcmV0dXJuIG5ldyBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgcHJvcGVydHk6IHRoaXMucHJvcCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMucHJvcC5vcHRpb25zLmNoYW5nZSxcbiAgICAgICAgb25BZGRlZDogdGhpcy5wcm9wLm9wdGlvbnMuaXRlbUFkZGVkLFxuICAgICAgICBvblJlbW92ZWQ6IHRoaXMucHJvcC5vcHRpb25zLml0ZW1SZW1vdmVkLFxuICAgICAgICBzY29wZTogdGhpcy5wcm9wLm9wdGlvbnMuc2NvcGUsXG4gICAgICAgIGF1dG9CaW5kOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5sb2FkSW50ZXJuYWxXYXRjaGVyKClcbiAgICB9XG4gIH1cblxuICBzZXRSYXdWYWx1ZSAodmFsKSB7XG4gICAgdGhpcy5wcm9wLnZhbHVlID0gdGhpcy5tYWtlQ29sbGVjdGlvbih2YWwpXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG5cbiAgbWFrZUNvbGxlY3Rpb24gKHZhbCkge1xuICAgIHZhbCA9IHRoaXMudmFsVG9BcnJheSh2YWwpXG4gICAgY29uc3QgcHJvcCA9IHRoaXMucHJvcFxuICAgIGNvbnN0IGNvbCA9IENvbGxlY3Rpb24ubmV3U3ViQ2xhc3ModGhpcy5vcHRpb25zLCB2YWwpXG4gICAgY29sLmNoYW5nZWQgPSBmdW5jdGlvbiAob2xkKSB7XG4gICAgICBwcm9wLnNldHRlci5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIGNvbFxuICB9XG5cbiAgdmFsVG9BcnJheSAodmFsKSB7XG4gICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwudG9BcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbC50b0FycmF5KClcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5zbGljZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbdmFsXVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrQ2hhbmdlcyAodmFsLCBvbGQpIHtcbiAgICB2YXIgY29tcGFyZUZ1bmN0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY29tcGFyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcGFyZUZ1bmN0aW9uID0gdGhpcy5vcHRpb25zLmNvbXBhcmVcbiAgICB9XG4gICAgcmV0dXJuIChuZXcgQ29sbGVjdGlvbih2YWwpKS5jaGVja0NoYW5nZXMob2xkLCB0aGlzLm9wdGlvbnMub3JkZXJlZCwgY29tcGFyZUZ1bmN0aW9uKVxuICB9XG59XG5cbkNvbGxlY3Rpb25TZXR0ZXIuZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGNvbXBhcmU6IGZhbHNlLFxuICBvcmRlcmVkOiB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblNldHRlclxuIiwiY29uc3QgQmFzZVNldHRlciA9IHJlcXVpcmUoJy4vQmFzZVNldHRlcicpXG5cbmNsYXNzIE1hbnVhbFNldHRlciBleHRlbmRzIEJhc2VTZXR0ZXIge1xuICBzZXQgKHZhbCkge1xuICAgIHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ3NldCcsIHZhbClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnVhbFNldHRlclxuIiwiY29uc3QgQmFzZVNldHRlciA9IHJlcXVpcmUoJy4vQmFzZVNldHRlcicpXG5cbmNsYXNzIFNpbXBsZVNldHRlciBleHRlbmRzIEJhc2VTZXR0ZXIge1xuICBzZXQgKHZhbCkge1xuICAgIHZhciBvbGRcbiAgICB2YWwgPSB0aGlzLmluZ2VzdCh2YWwpXG4gICAgdGhpcy5wcm9wLmdldHRlci5yZXZhbGlkYXRlZCgpXG4gICAgaWYgKHRoaXMuY2hlY2tDaGFuZ2VzKHZhbCwgdGhpcy5wcm9wLnZhbHVlKSkge1xuICAgICAgb2xkID0gdGhpcy5wcm9wLnZhbHVlXG4gICAgICB0aGlzLnNldFJhd1ZhbHVlKHZhbClcbiAgICAgIHRoaXMucHJvcC5tYW51YWwgPSB0cnVlXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlU2V0dGVyXG4iLCJcbmNvbnN0IFByb3BlcnR5V2F0Y2hlciA9IHJlcXVpcmUoJy4vUHJvcGVydHlXYXRjaGVyJylcblxuY2xhc3MgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlciBleHRlbmRzIFByb3BlcnR5V2F0Y2hlciB7XG4gIGxvYWRPcHRpb25zIChvcHRpb25zKSB7XG4gICAgc3VwZXIubG9hZE9wdGlvbnMob3B0aW9ucylcbiAgICB0aGlzLm9uQWRkZWQgPSBvcHRpb25zLm9uQWRkZWRcbiAgICB0aGlzLm9uUmVtb3ZlZCA9IG9wdGlvbnMub25SZW1vdmVkXG4gIH1cblxuICBoYW5kbGVDaGFuZ2UgKHZhbHVlLCBvbGQpIHtcbiAgICBvbGQgPSB2YWx1ZS5jb3B5KG9sZCB8fCBbXSlcbiAgICBpZiAodHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLnNjb3BlLCB2YWx1ZSwgb2xkKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25BZGRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFsdWUuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICBpZiAoIW9sZC5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uQWRkZWQuY2FsbCh0aGlzLnNjb3BlLCBpdGVtKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25SZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb2xkLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZS5pbmNsdWRlcyhpdGVtKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uUmVtb3ZlZC5jYWxsKHRoaXMuc2NvcGUsIGl0ZW0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlclxuIiwiXG5jb25zdCBCaW5kZXIgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuQmluZGVyXG5jb25zdCBSZWZlcmVuY2UgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuUmVmZXJlbmNlXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuY2xhc3MgUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgQmluZGVyIHtcbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFByb3BlcnR5V2F0Y2hlck9wdGlvbnNcbiAgICogQHByb3BlcnR5IHtpbXBvcnQoXCIuL1Byb3BlcnR5XCIpPFQ+fHN0cmluZ30gcHJvcGVydHlcbiAgICogQHByb3BlcnR5IHtmdW5jdGlvbihULFQpfSBjYWxsYmFja1xuICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IFthdXRvQmluZF1cbiAgICogQHByb3BlcnR5IHsqfSBbc2NvcGVdXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlXYXRjaGVyT3B0aW9uc30gb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrID0gKGNvbnRleHQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZhbGlkQ29udGV4dChjb250ZXh0KSkge1xuICAgICAgICB0aGlzLmludmFsaWRhdGUoKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNhbGxiYWNrID0gKG9sZCwgY29udGV4dCkgPT4ge1xuICAgICAgaWYgKHRoaXMudmFsaWRDb250ZXh0KGNvbnRleHQpKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKG9sZClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxvYWRPcHRpb25zKHRoaXMub3B0aW9ucylcbiAgICB9XG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGxvYWRPcHRpb25zIChvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGVcbiAgICB0aGlzLnByb3BlcnR5ID0gb3B0aW9ucy5wcm9wZXJ0eVxuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrXG4gICAgdGhpcy5hdXRvQmluZCA9IG9wdGlvbnMuYXV0b0JpbmRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgY29weVdpdGggKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKSlcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIGlmICh0aGlzLmF1dG9CaW5kKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0JpbmQoKVxuICAgIH1cbiAgfVxuXG4gIGdldFByb3BlcnR5ICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcGVydHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQcm9wQnlOYW1lKHRoaXMucHJvcGVydHkpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb3BlcnR5XG4gIH1cblxuICBnZXRQcm9wQnlOYW1lIChwcm9wLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0LnByb3BlcnRpZXNNYW5hZ2VyLmdldFByb3BlcnR5KHByb3ApXG4gICAgfSBlbHNlIGlmICh0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgdGhlIHByb3BlcnR5ICR7cHJvcH1gKVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrQmluZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9nZ2xlQmluZCh0aGlzLnNob3VsZEJpbmQoKSlcbiAgfVxuXG4gIHNob3VsZEJpbmQgKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpICE9IG51bGxcbiAgfVxuXG4gIGRvQmluZCAoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMuYWRkTGlzdGVuZXIoJ2ludmFsaWRhdGVkJywgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMuYWRkTGlzdGVuZXIoJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKVxuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMucmVtb3ZlTGlzdGVuZXIoJ2ludmFsaWRhdGVkJywgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKS5ldmVudHMucmVtb3ZlTGlzdGVuZXIoJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKVxuICB9XG5cbiAgZXF1YWxzICh3YXRjaGVyKSB7XG4gICAgcmV0dXJuIHdhdGNoZXIuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiZcbiAgICAgIHdhdGNoZXIgIT0gbnVsbCAmJlxuICAgICAgd2F0Y2hlci5ldmVudCA9PT0gdGhpcy5ldmVudCAmJlxuICAgICAgd2F0Y2hlci5nZXRQcm9wZXJ0eSgpID09PSB0aGlzLmdldFByb3BlcnR5KCkgJiZcbiAgICAgIFJlZmVyZW5jZS5jb21wYXJlVmFsKHdhdGNoZXIuY2FsbGJhY2ssIHRoaXMuY2FsbGJhY2spXG4gIH1cblxuICB2YWxpZENvbnRleHQgKGNvbnRleHQpIHtcbiAgICByZXR1cm4gY29udGV4dCA9PSBudWxsIHx8ICFjb250ZXh0LnByZXZlbnRJbW1lZGlhdGVcbiAgfVxuXG4gIGludmFsaWRhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KClcbiAgfVxuXG4gIHVwZGF0ZSAob2xkKSB7XG4gICAgdmFyIHZhbHVlXG4gICAgdmFsdWUgPSB0aGlzLmdldFByb3BlcnR5KCkuZ2V0KClcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVDaGFuZ2UodmFsdWUsIG9sZClcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZSAodmFsdWUsIG9sZCkge1xuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgdmFsdWUsIG9sZClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0eVdhdGNoZXJcbiIsInZhciBuZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MvYnJvd3Nlci5qcycpLm5leHRUaWNrO1xudmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGltbWVkaWF0ZUlkcyA9IHt9O1xudmFyIG5leHRJbW1lZGlhdGVJZCA9IDA7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7IHRpbWVvdXQuY2xvc2UoKTsgfTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBUaGF0J3Mgbm90IGhvdyBub2RlLmpzIGltcGxlbWVudHMgaXQgYnV0IHRoZSBleHBvc2VkIGFwaSBpcyB0aGUgc2FtZS5cbmV4cG9ydHMuc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogZnVuY3Rpb24oZm4pIHtcbiAgdmFyIGlkID0gbmV4dEltbWVkaWF0ZUlkKys7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBmYWxzZSA6IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBpbW1lZGlhdGVJZHNbaWRdID0gdHJ1ZTtcblxuICBuZXh0VGljayhmdW5jdGlvbiBvbk5leHRUaWNrKCkge1xuICAgIGlmIChpbW1lZGlhdGVJZHNbaWRdKSB7XG4gICAgICAvLyBmbi5jYWxsKCkgaXMgZmFzdGVyIHNvIHdlIG9wdGltaXplIGZvciB0aGUgY29tbW9uIHVzZS1jYXNlXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2NhbGwtYXBwbHktc2VndVxuICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5jYWxsKG51bGwpO1xuICAgICAgfVxuICAgICAgLy8gUHJldmVudCBpZHMgZnJvbSBsZWFraW5nXG4gICAgICBleHBvcnRzLmNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSB0eXBlb2YgY2xlYXJJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IGNsZWFySW1tZWRpYXRlIDogZnVuY3Rpb24oaWQpIHtcbiAgZGVsZXRlIGltbWVkaWF0ZUlkc1tpZF07XG59OyJdfQ==
