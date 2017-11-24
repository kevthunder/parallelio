assert = require('chai').assert
Damageable = require('../lib/Damageable')

describe 'Damageable', ->
  it 'can be damaged', ->
    damageable = new Damageable()
    assert.isTrue damageable.damageable
    init = damageable.health
    damageable.damage(10)
    assert.equal damageable.health, init-10
  it 'call whenNoHealth when no health', ->
    calls = 0
    damageable = new Damageable()
    damageable.whenNoHealth = ->
      calls++
    assert.equal calls, 0
    damageable.damage(damageable.maxHealth*2)
    assert.equal damageable.health, 0
    assert.equal calls, 1
