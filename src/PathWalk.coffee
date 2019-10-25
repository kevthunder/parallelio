Element = require('spark-starter').Element
Timing = require('parallelio-timing')
EventEmitter = require('events')

module.exports = class PathWalk extends Element
  @include EventEmitter.prototype
  constructor: (@walker, @path, options) ->
    super(options)
  @properties
    speed:
      default: 5
    timing:
      calcul: ->
        new Timing()
    pathLength:
      calcul: ->
        @path.solution.getTotalLength()
    totalTime:
      calcul: ->
        @pathLength / @speed * 1000
    position:
      calcul: (invalidator)->
        @path.getPosAtPrc(invalidator.propPath('pathTimeout.prc') || 0)
  start: ->
    if !@path.solution
      @path.calcul()
    if @path.solution
      @pathTimeout = @timing.setTimeout =>
        @finish()
      , @totalTime
      
      @walker.tileMembers.addPropertyPath('position.tile',this)
      @walker.offsetXMembers.addPropertyPath('position.offsetX',this)
      @walker.offsetYMembers.addPropertyPath('position.offsetY',this)
  stop: ->
    @pathTimeout.pause()
  finish: ->
    @walker.tile = @position.tile
    @walker.offsetX = @position.offsetX
    @walker.offsetY = @position.offsetY
    @emit('finished')
    @end()
  interrupt: ->
    @emit('interrupted')
    @end()
  end: ->
    @emit('end')
    @destroy()
  destroy: ->
    if @walker.walk == this
      @walker.walk = null
    @walker.tileMembers.removeRef({name: 'position.tile', obj: this})
    @walker.offsetXMembers.removeRef({name: 'position.offsetX', obj: this})
    @walker.offsetYMembers.removeRef({name: 'position.offsetY', obj: this})
    @pathTimeout.destroy()
    @propertiesManager.destroy()
    @removeAllListeners()

