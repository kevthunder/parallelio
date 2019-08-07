(function() {
  var AttackMoveAction, Character, PersonalWeapon, Tile, TileContainer, assert, createStage;

  assert = require('chai').assert;

  AttackMoveAction = require('../lib/actions/AttackMoveAction');

  Tile = require('parallelio-tiles').Tile;

  TileContainer = require('parallelio-tiles').TileContainer;

  Character = require('../lib/Character');

  PersonalWeapon = require('../lib/PersonalWeapon');

  createStage = function() {
    var ctn;
    ctn = new TileContainer();
    return ctn.tap(function() {
      var f, w;
      w = function(opt) {
        return (new Tile(opt.x, opt.y)).tap(function() {
          this.walkable = false;
          return this.transparent = false;
        });
      };
      f = function(opt) {
        return (new Tile(opt.x, opt.y)).tap(function() {
          this.walkable = true;
          return this.transparent = true;
        });
      };
      return this.loadMatrix([[f, f, f, f, f], [w, w, f, w, w], [f, f, f, f, f], [w, w, f, w, w], [f, f, f, f, f]]);
    });
  };

  describe('AttackMoveAction', function() {
    return it('can attack a target if spotted', function() {
      var action, char1, char2, ctn, p1, p2;
      ctn = createStage();
      p1 = {
        isEnemy: function(elem) {
          return (elem.owner != null) && elem.owner !== this;
        }
      };
      p2 = {};
      char1 = new Character();
      char1.tap(function() {
        this.tile = ctn.getTile(0, 2);
        this.weapons = [
          new PersonalWeapon({
            user: char1
          })
        ];
        return this.owner = p1;
      });
      char2 = new Character().tap(function() {
        this.tile = ctn.getTile(2, 0);
        return this.owner = p2;
      });
      action = new AttackMoveAction({
        actor: char1,
        target: ctn.getTile(4, 2)
      });
      assert.isTrue(action.isReady());
      assert.equal(char2.health, 1000);
      action.execute();
      assert.equal(char1.tile.x, 0);
      assert.equal(char1.tile.y, 2);
      char1.walk.timing.running = false;
      char1.walk.pathTimeout.setPrc(0.5);
      assert.equal(char1.tile.x, 2);
      assert.equal(char1.tile.y, 2);
      assert.isNotNull(action.enemySpotted);
      assert.equal(char2.health, 990);
      char1.weapons[0].chargeTimeout.destroy();
      char1.weapons[0].charged = true;
      assert.equal(char2.health, 980);
      action.interrupt();
      return char1.weapons.forEach((w) => {
        return w.destroy();
      });
    });
  });

}).call(this);

//# sourceMappingURL=maps/attackMoveAction.js.map
