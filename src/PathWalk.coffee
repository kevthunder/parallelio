Element = require('spark-starter').Element
Timing = require('parallelio-timing')
EventEmitter = require('spark-starter').EventEmitter


module.exports = class PathWalk extends Element
  @include EventEmitter.prototype
  constructor: (@walker, @path, options) ->
    super()
    @setProperties(options)
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
        @path.getPosAtPrc(invalidator.propPath('pathTimeout.prc'))
  start: ->
    if !@path.solution
      @path.calcul()
    if @path.solution
      @pathTimeout = @timing.setTimeout =>
        @finish()
      , @totalTime
      
      @walker.tileMembers.addPropertyRef('position.tile',this)
      @walker.offsetXMembers.addPropertyRef('position.offsetX',this)
      @walker.offsetYMembers.addPropertyRef('position.offsetY',this)
  stop: ->
    @pathTimeout.pause()
  finish: ->
    @walker.tile = @position.tile
    @walker.offsetX = @position.offsetX
    @walker.offsetY = @position.offsetY
    @trigger('finished')
    @end()
  interrupt: ->
    @trigger('interrupted')
    @end()
  end: ->
    @trigger('end')
    @destroy()
  destroy: ->
    if @walker.walk == this
      @walker.walk = null
    @walker.tileMembers.removeRef('position.tile',this)
    @walker.offsetXMembers.removeRef('position.offsetX',this)
    @walker.offsetYMembers.removeRef('position.offsetY',this)
    @pathTimeout.destroy()
    @destroyProperties()
    @removeAllListeners()

