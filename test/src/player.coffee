assert = require('chai').assert
Player = require('../lib/Player')
TargetAction = require('../lib/actions/TargetAction')
SimpleActionProvider = require('../lib/actions/SimpleActionProvider')


describe 'Player', ->
  it 'can get action from selected action provider', ->
    action = new TargetAction()
    provider = new SimpleActionProvider()
    provider.actions.add(action)

    player = new Player()
    player.selected = provider

    assert.equal player.availableActions.length, 1
    assert.equal player.availableActions[0].baseOrThis(), action

  it 'can get action from global action provider', ->
    action = new TargetAction()
    provider = new SimpleActionProvider()
    provider.actions.add(action)

    player = new Player()
    player.globalActionProviders.add(provider)

    assert.equal player.availableActions.length, 1
    assert.equal player.availableActions[0].baseOrThis(), action
