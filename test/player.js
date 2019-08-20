(function() {
  var Player, SimpleActionProvider, TargetAction, assert;

  assert = require('chai').assert;

  Player = require('../lib/Player');

  TargetAction = require('../lib/actions/TargetAction');

  SimpleActionProvider = require('../lib/actions/SimpleActionProvider');

  describe('Player', function() {
    it('can get action from selected action provider', function() {
      var action, player, provider;
      action = new TargetAction();
      provider = new SimpleActionProvider();
      provider.providedActions.add(action);
      player = new Player();
      player.selected = provider;
      assert.equal(player.availableActions.length, 1);
      return assert.equal(player.availableActions[0].baseOrThis(), action);
    });
    return it('can get action from global action provider', function() {
      var action, player, provider;
      action = new TargetAction();
      provider = new SimpleActionProvider();
      provider.providedActions.add(action);
      player = new Player();
      player.globalActionProviders.add(provider);
      assert.equal(player.availableActions.length, 1);
      return assert.equal(player.availableActions[0].baseOrThis(), action);
    });
  });

}).call(this);

//# sourceMappingURL=maps/player.js.map
