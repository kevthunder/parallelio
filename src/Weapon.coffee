Tiled = require('parallelio-tiles').Tiled

class Weapon extends Tiled
  constructor: (options) ->
    @setProperties(options)
  @properties
    rechargeTime:
      default: 1000
    power:
      default: 10
    blastRange:
      default: 1
    propagationType:
      default: null
    projectileSpeed:
      default: 10
    target:
      default: null
      change: ->
        if @target and @enabled and @charged
          @fire()
    charged:
      default: true
    enabled:
      default: true
  fire: ->
    projectile = new Projectile({
      origin: this
      target: @target
      power: @power
      blastRange: @blastRange
      propagationType: @propagationType
      speed: @projectileSpeed
    })
    @charged = false
    @recharge()
    projectile
  recharge: ->
    @chargeTimeout = setTimeout =>
      recharged()
    , rechargeTime
  recharged: ->
    @charged = true
    if @target and @enabled
      @fire()


