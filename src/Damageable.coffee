Element = require('spark-starter').Element

class Damageable extends Element
  @properties
    damageable:
      default: true
    maxHealth:
      default: 1000
    health:
      default: 1000
      change: ->
        if @health == 0 && typeof @destroy == 'function'
          @destroy()
  damage: (val) ->
    @health = Math.max(0, @health - val)

