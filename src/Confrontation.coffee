Element = require('spark-starter').Element
View = require('./View')
Ship = require('./Ship')

module.exports = class Confrontation extends Element
  @properties
    game:
      default: null
    subject:
      default: null
    view:
      calcul: ->
        new View()
    opponent:
      calcul: ->
        new Ship()

  start: ->
    game.mainView = @view
    subject.container = @view
    opponent.container = @view
    
    
    
