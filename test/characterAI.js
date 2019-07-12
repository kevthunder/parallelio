(function() {
  var Character, CharacterAI, PersonalWeapon, Tile, TileContainer, assert, createStage;

  assert = require('chai').assert;

  CharacterAI = require('../lib/CharacterAI');

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
      return this.loadMatrix([[w, w, w, w, w, w, w], [w, f, f, f, f, f, w], [w, w, f, w, w, w, w], [w, f, f, f, f, f, w], [w, f, f, f, f, f, w], [w, f, f, f, f, w, w], [w, w, w, w, w, w, f]]);
    });
  };

  describe('CharacterAI', function() {
    it('can find the next tile to explore', function() {
      var ai, char, ctn;
      ctn = createStage();
      char = (new Character()).tap(function() {
        return this.tile = ctn.getTile(4, 3);
      });
      ai = new CharacterAI(char);
      ai.updateVisionMemory();
      return assert.equal(ai.getClosestUnexplored().getFinalTile(), ctn.getTile(2, 2));
    });
    it('update vision when tile change', function() {
      var ai, char, ctn;
      ctn = createStage();
      char = (new Character()).tap(function() {
        return this.tile = ctn.getTile(6, 6);
      });
      ai = new CharacterAI(char);
      ai.tileWatcher.bind();
      assert.isNull(ai.getClosestUnexplored());
      char.tile = ctn.getTile(4, 3);
      return assert.equal(ai.getClosestUnexplored().getFinalTile(), ctn.getTile(2, 2));
    });
    return it('can remember past seen tile', function() {
      var ai, char, ctn;
      ctn = createStage();
      char = (new Character()).tap(function() {
        return this.tile = ctn.getTile(4, 3);
      });
      ai = new CharacterAI(char);
      ai.tileWatcher.bind();
      char.tile = ctn.getTile(6, 6);
      return assert.equal(ai.getClosestUnexplored().getFinalTile(), ctn.getTile(2, 2));
    });
  });

}).call(this);
