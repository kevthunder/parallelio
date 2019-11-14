const Element = require('spark-starter').Element
const View = require('./View')
const Ship = require('./Ship')

class Confrontation extends Element {
  start () {
    this.game.mainView = this.view
    this.subject.container = this.view
    this.opponent.container = this.view
  }
};

Confrontation.properties({
  game: {
    default: null
  },
  subject: {
    default: null
  },
  view: {
    calcul: function () {
      return new View()
    }
  },
  opponent: {
    calcul: function () {
      return new Ship()
    }
  }
})

module.exports = Confrontation
