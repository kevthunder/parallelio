Element = require('spark-starter').Element
Grid = require('parallelio-grids').Grid

class View extends Element
  @properties
    game:
      change: (old)->
        if @game 
          @game.views.add(this)
          @setDefaults()
        if old
          old.views.remove(this)
    x:
      default: 0
    y:
      default: 0
    grid:
      default: null
    bounds:
      default: null

  setDefaults: ->
    if !@bounds
      @grid = @grid || @game._mainView?.value?.grid || new Grid()
      @bounds = @grid.addCell()

  destroy: ->
    @game = null