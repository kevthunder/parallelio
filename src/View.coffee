Element = require('parallelio').Element

class View extends Element
  @properties
    game:
      change: (old)->
        if @game 
          @game.views.add(this)
          @setDefaults()
        if old
          old.views.remove(this)

  setDefaults: ->
    if !@bounds
      @grid = @grid || @game.mainView.grid
      @bounds = @grid.addCell()

  destroy: ->
    @game = null