Element = require('spark-starter').Element
Timing = require('parallelio-timing')
Grid = require('parallelio-grid')
View = require('.View')

class Game extends Element
  @properties
    timing:
      calcul: ->
        new Timing()
    mainView:
      calcul: ->
        @add(
          new View().tap ->
            @grid = new Grid
        )
  start: ->
  add: (elem) ->
    elem.game = this
    elem