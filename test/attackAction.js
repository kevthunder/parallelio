(function() {
  var AttackAction, Character, PersonalWeapon, Tile, TileContainer, assert, createStage;

  assert = require('chai').assert;

  AttackAction = require('../lib/actions/AttackAction');

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
          return this.walkable = false;
        });
      };
      f = function(opt) {
        return (new Tile(opt.x, opt.y)).tap(function() {
          return this.walkable = true;
        });
      };
      return this.loadMatrix([[f, f, f, f, f], [f, w, f, f, f], [f, w, f, f, f]]);
    });
  };

  describe('AttackAction', function() {
    it('can attack a target', function() {
      var action, char1, char2, ctn;
      ctn = createStage();
      char1 = new Character();
      char1.tap(function() {
        this.tile = ctn.getTile(0, 0);
        return this.weapons = [
          new PersonalWeapon({
            user: char1
          })
        ];
      });
      char2 = new Character().tap(function() {
        return this.tile = ctn.getTile(2, 0);
      });
      action = new AttackAction({
        actor: char1,
        target: char2
      });
      assert.isTrue(action.isReady());
      assert.equal(char2.health, 1000);
      action.execute();
      return assert.equal(char2.health, 990);
    });
    return it('can move to attack a target', function() {
      var action, char1, char2, ctn;
      ctn = createStage();
      char1 = new Character();
      char1.tap(function() {
        this.tile = ctn.getTile(0, 2);
        return this.weapons = [
          new PersonalWeapon({
            user: char1
          })
        ];
      });
      char2 = new Character().tap(function() {
        return this.tile = ctn.getTile(4, 2);
      });
      action = new AttackAction({
        actor: char1,
        target: char2
      });
      assert.isTrue(action.isReady());
      action.execute();
      assert.equal(char2.health, 1000);
      assert.exists(char1.walk);
      char1.walk.pathTimeout.setPrc(1);
      char1.walk.endReached();
      assert.equal(char1.tile.x, 1);
      assert.equal(char1.tile.y, 0);
      assert.isTrue(action.canUseWeapon());
      return assert.equal(char2.health, 990);
    });
  });

}).call(this);
