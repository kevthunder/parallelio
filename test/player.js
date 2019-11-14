
const assert = require('chai').assert
const Player = require('../lib/Player')
const TargetAction = require('../lib/actions/TargetAction')
const SimpleActionProvider = require('../lib/actions/SimpleActionProvider')

describe('Player', function () {
  it('can get action from selected action provider', function () {
    var action, player, provider
    action = new TargetAction()
    provider = new SimpleActionProvider()
    provider.actions.add(action)
    player = new Player()
    player.selected = provider
    assert.equal(player.availableActions.length, 1)
    return assert.equal(player.availableActions[0].baseOrThis(), action)
  })
  it('can get action from global action provider', function () {
    var action, player, provider
    action = new TargetAction()
    provider = new SimpleActionProvider()
    provider.actions.add(action)
    player = new Player()
    player.globalActionProviders.add(provider)
    assert.equal(player.availableActions.length, 1)
    return assert.equal(player.availableActions[0].baseOrThis(), action)
  })
})
