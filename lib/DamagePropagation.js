(function(definition){DamagePropagation=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);DamagePropagation.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=DamagePropagation;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.DamagePropagation=DamagePropagation;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.DamagePropagation=DamagePropagation;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : require('./LineOfSight');
var Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : require('parallelio-tiles').Direction;
var DamagePropagation, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
DamagePropagation = (function(superClass) {
  extend(DamagePropagation, superClass);

  function DamagePropagation(options) {
    this.setProperties(options);
  }

  DamagePropagation.properties({
    tile: {
      "default": null
    },
    power: {
      "default": 10
    },
    range: {
      "default": 1
    },
    type: {
      "default": null
    }
  });

  DamagePropagation.prototype.getTileContainer = function() {
    return this.tile.container;
  };

  DamagePropagation.prototype.apply = function() {
    var damage, i, len, ref, results;
    ref = this.getDamaged();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      damage = ref[i];
      results.push(damage.target.damage(damage.damage));
    }
    return results;
  };

  DamagePropagation.prototype.getInitialTiles = function() {
    var ctn;
    ctn = this.getTileContainer();
    return ctn.inRange(this.tile, this.range);
  };

  DamagePropagation.prototype.getDamaged = function() {
    var added, dmg, i, len, tile, tiles;
    if (this._damaged == null) {
      this._damaged = [];
      tiles = this.getInitialTiles();
      for (i = 0, len = tiles.length; i < len; i++) {
        tile = tiles[i];
        if (tile.damageable && (dmg = this.initialDamage(tile, tiles.length))) {
          this._damaged.push(dmg);
        }
      }
      if (this.extendedDamage != null) {
        added = this._damaged;
        while ((added = this.extend(added)).length) {
          this._damaged = added.concat(this._damaged);
        }
      }
    }
    return this._damaged;
  };

  DamagePropagation.prototype.inDamaged = function(target, damaged) {
    var damage, i, len;
    for (i = 0, len = damaged.length; i < len; i++) {
      damage = damaged[i];
      if (damage.target === target) {
        return damage;
      }
    }
    return false;
  };

  DamagePropagation.prototype.extend = function(damaged) {
    var added, ctn, damage, dir, dmg, i, j, k, len, len1, len2, local, ref, target, tile;
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
          if ((tile != null) && tile.damageable && !this.inDamaged(tile, added.concat(this._damaged))) {
            local.push(tile);
          }
        }
      }
      for (k = 0, len2 = local.length; k < len2; k++) {
        target = local[k];
        if (dmg = this.extendedDamage(target, damage, local.length)) {
          added.push(dmg);
        }
      }
    }
    return added;
  };

  DamagePropagation.prototype.modifyDamage = function(target, power) {
    if (typeof target.modifyDamage === 'function') {
      return Math.floor(target.modifyDamage(power, this.type));
    } else {
      return Math.floor(power);
    }
  };

  return DamagePropagation;

})(Element);

DamagePropagation.Normal = (function(superClass) {
  extend(Normal, superClass);

  function Normal() {
    return Normal.__super__.constructor.apply(this, arguments);
  }

  Normal.prototype.initialDamage = function(target, nb) {
    var dmg;
    dmg = this.modifyDamage(target, this.power);
    if (dmg > 0) {
      return {
        target: target,
        power: this.power,
        damage: dmg
      };
    }
  };

  return Normal;

})(DamagePropagation);

DamagePropagation.Thermic = (function(superClass) {
  extend(Thermic, superClass);

  function Thermic() {
    return Thermic.__super__.constructor.apply(this, arguments);
  }

  Thermic.prototype.extendedDamage = function(target, last, nb) {
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
  };

  Thermic.prototype.initialDamage = function(target, nb) {
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
  };

  return Thermic;

})(DamagePropagation);

DamagePropagation.Kinetic = (function(superClass) {
  extend(Kinetic, superClass);

  function Kinetic() {
    return Kinetic.__super__.constructor.apply(this, arguments);
  }

  Kinetic.prototype.extendedDamage = function(target, last, nb) {
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
  };

  Kinetic.prototype.initialDamage = function(target, nb) {
    var dmg;
    dmg = this.modifyDamage(target, this.power);
    if (dmg > 0) {
      return {
        target: target,
        power: this.power,
        damage: dmg
      };
    }
  };

  return Kinetic;

})(DamagePropagation);

DamagePropagation.Explosive = (function(superClass) {
  extend(Explosive, superClass);

  function Explosive() {
    return Explosive.__super__.constructor.apply(this, arguments);
  }

  Explosive.prototype.getDamaged = function() {
    var angle, ctn, dist, i, inside, ref, shard, shardPower, shards, target, vertex;
    this._damaged = [];
    ctn = this.getTileContainer();
    shards = Math.pow(this.range + 1, 2);
    shardPower = this.power / shards;
    inside = this.tile.health <= this.modifyDamage(this.tile, shardPower);
    if (inside) {
      shardPower *= 4;
    }
    for (shard = i = 0, ref = shards; 0 <= ref ? i <= ref : i >= ref; shard = 0 <= ref ? ++i : --i) {
      angle = Math.random() * Math.PI * 2;
      dist = this.range * Math.random();
      target = {
        x: this.tile.x + dist * Math.cos(angle),
        y: this.tile.y + dist * Math.sin(angle)
      };
      vertex = new LineOfSight(ctn, this.tile.x + 0.5, this.tile.y + 0.5, target.x + 0.5, target.y + 0.5);
      vertex.traversableCallback = function(tile) {
        return !inside || !tile.getSolid();
      };
      if (vertex.getEndPoint().tile != null) {
        target = vertex.getEndPoint().tile;
        this._damaged.push({
          target: target,
          power: shardPower,
          damage: this.modifyDamage(target, shardPower)
        });
      }
    }
    return this._damaged;
  };

  return Explosive;

})(DamagePropagation);

return(DamagePropagation);});