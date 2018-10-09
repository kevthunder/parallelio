Element = require('spark-starter').Element

class Game extends Element
  @properties
    timing:
      calcul: ->
        new Parallelio.Timing()
  start: ->
  add: (elem) ->
    elem.game = this