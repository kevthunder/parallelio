Element = require('spark-starter').Element
Timing = require('parallelio-timing')
View = require('./View')

class Game extends Element
  @properties
    timing:
      calcul: ->
        new Timing()
    mainView:
      calcul: ->
        if @views.length > 0
          @views.get(0)
        else
          @add(new @defaultViewClass())
    views:
      collection: true
  defaultViewClass: View
  start: ->
  add: (elem) ->
    elem.game = this
    elem