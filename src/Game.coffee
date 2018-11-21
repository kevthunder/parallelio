Element = require('spark-starter').Element
Timing = require('parallelio-timing')
View = require('./View')
Player = require('./Player')

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
    currentPlayer:
      calcul: ->
        if @players.length > 0
          @players.get(0)
        else
          @add(new @defaultPlayerClass())
    players:
      collection: true
  defaultViewClass: View
  defaultPlayerClass: Player
  start: ->
    @currentPlayer
  add: (elem) ->
    elem.game = this
    elem