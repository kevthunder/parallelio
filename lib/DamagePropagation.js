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

//# sourceMappingURL=maps/DamagePropagation.js.map
