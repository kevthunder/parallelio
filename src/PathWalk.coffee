Element = require('spark-starter').Element


class PathWalk extends Element
  constructor: (@walker, @path, @options) ->
    @setProperties(options)
    super()
  @properties
    speed:
      default: 5
    timing:
      calcul: ->
        new Timing()
    pathLength:
      calcul: ->
        @path.solution.getTotalLength()
  start: ->
    if !@path.solution
      path.calcul()
    if @path.solution
      @pathTimeout = @timing.setTimeout =>
        @end()
      , @pathLength / @speed * 1000
      @pathTimeout.updater.addCallback(@callback('update'))
  stop: ->
    @pathTimeout.pause()
  update: ->
    pos = @path.getPosAtPrc(@pathTimeout.getPrc)
    @walker.tile = pos.tile
    @walker.offsetX = pos.offsetX
    @walker.offsetY = pos.offsetY
  end: ->
    @update()
    @destroy()
  destroy: ->
    @pathTimeout.destroy()
    @destroyProperties()

