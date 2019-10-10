Tiled = require('parallelio-tiles').Tiled
Timing = require('parallelio-timing')
Damageable = require('./Damageable')
Projectile = require('./Projectile')

module.exports = class ShipWeapon extends Tiled
  @extend Damageable
  constructor: (options) ->
    super(options)
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
    charging:
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
    projectileClass:
      default: Projectile
  fire: ->
    if @canFire
      projectile = new @projectileClass({
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
    @charging = true
    @chargeTimeout = @timing.setTimeout =>
      @charging = false
      @recharged()
    , @rechargeTime
  recharged: ->
    @charged = true
    if @autoFire
      @fire()


