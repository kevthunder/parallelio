Element = require('spark-starter').Element

module.exports = class Damageable extends Element
  @properties
    damageable:
      default: true
    maxHealth:
      default: 1000
    health:
      default: 1000
      change: ->
        if @health <= 0
          @whenNoHealth()
  damage: (val) ->
    @health = Math.max(0, @health - val)

  whenNoHealth: ->


