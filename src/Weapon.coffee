Tiled = require('parallelio-tiles').Tiled
Timing = require('./Timing')
Damageable = require('./Damageable')

class Weapon extends Tiled
  @extend Damageable
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
        if @autoFire
          @fire()
    charged:
      default: true
    enabled:
      default: true
    autoFire:
      default: true
    criticalHealth:
      default: 0.3
    canFire:
      get: ->
        @target and @enabled and @charged and @health / @maxHealth >= @criticalHealth
    timing:
      calcul: ->
        new Timing()
  fire: ->
    if @canFire
      projectile = new Projectile({
        origin: this
        target: @target
        power: @power
        blastRange: @blastRange
        propagationType: @propagationType
        speed: @projectileSpeed
        timing: @timing
      })
      projectile.launch()
      @charged = false
      @recharge()
      projectile
  recharge: ->
    @chargeTimeout = @timing.setTimeout =>
      @recharged()
    , @rechargeTime
  recharged: ->
    @charged = true
    if @autoFire
      @fire()


