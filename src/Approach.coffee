Element = require('spark-starter').Element
Timing = require('parallelio-timing')

module.exports = class Approach extends Element
  @properties
    timing:
      calcul: ->
        new Timing()
    initialDist:
      default: 500
    rng: 
      default: Math.random
    angle:
      calcul: ->
        @rng * Math.PI * 2
    startingPos:
      calcul: ->
        {
          x: @startingPos.x + @initialDist * Math.cos(@angle)
          y: @startingPos.y + @initialDist * Math.sin(@angle)
        }
    targetPos:
      calcul: ->
        {
          x: @targetAirlock.x - @subjectAirlock.x
          y: @targetAirlock.y - @subjectAirlock.y
        }
    subject: {}
    target: {}
    subjectAirlock: 
      calcul: ->
        airlocks = @subject.airlocks.slice();
        airlocks.sort (a,b)=>
          valA = Math.abs(a.direction.x - Math.cos(@angle)) + Math.abs(a.direction.y - Math.sin(@angle))
          valB = Math.abs(b.direction.x - Math.cos(@angle)) + Math.abs(b.direction.y - Math.sin(@angle))
          valA - valB
        airlocks[0]
    targetAirlock: 
      calcul: ->
        @target.airlocks.find (target)=>
          target.direction.getInverse() == @subjectAirlock.direction
    moving:
      default: false
    complete:
      default: false
    currentPos:
      calcul: (invalidator)->
        start = invalidator.prop(@startingPosProperty)
        end = invalidator.prop(@targetPosProperty)
        prc = invalidator.propPath("timeout.prc") || 0
        {
          x: (end.x-start.x) * prc + start.x
          y: (end.y-start.y) * prc + start.y
        }
    duration:
      default: 10000
    timeout: {}
    
  start: (location)->
    if @valid
      @moving = true
      @subject.xMembers.addPropertyRef('position.offsetX', this)
      @subject.yMembers.addPropertyRef('position.offsetY', this)

      @timeout = @timing.setTimeout =>
        @done()
      , @duration

  done: ->
    @subject.xMembers.removeRef({name: 'position.offsetX', obj: this})
    @subject.yMembers.removeRef({name: 'position.offsetY', obj: this})
    @subject.x = @targetPos.x
    @subject.y = @targetPos.x
    @subjectAirlock.attachTo(targetAirlock)
    @moving = false
    @complete = true
