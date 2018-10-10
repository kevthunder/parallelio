Element = require('parallelio').Element

class View extends Element
  @properties
    game:
      change: ->
        if @game && !@bounds
          @grid = @grid || @game.mainView.grid
          @bounds = @grid.addCell()
