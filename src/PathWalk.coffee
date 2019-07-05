Element = require('spark-starter').Element
Timing = require('parallelio-timing')
EventEmitter = require('spark-starter').EventEmitter


class PathWalk extends Element
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
  start: ->
    if !@path.solution
      @path.calcul()
    if @path.solution
      @pathTimeout = @timing.setTimeout =>
        @finish()
      , @totalTime
      @pathTimeout.updater.addCallback(@callback('update'))
  stop: ->
    @pathTimeout.pause()
  update: ->
    pos = @path.getPosAtPrc(@pathTimeout.getPrc())
    @walker.tile = pos.tile
    @walker.offsetX = pos.offsetX
    @walker.offsetY = pos.offsetY
  finish: ->
    @update()
    @trigger('finished')
    @end()
  interrupt: ->
    @update()
    @trigger('interrupted')
    @end()
  end: ->
    @trigger('end')
    @destroy()
  destroy: ->
    @pathTimeout.destroy()
    @destroyProperties()

