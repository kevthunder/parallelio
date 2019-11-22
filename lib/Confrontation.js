const Element = require('spark-starter').Element
const View = require('./View')
const Ship = require('./Ship')
const Approach = require('./Approach')

class Confrontation extends Element {
  start () {
    this.subject.encounter = this
    this.game.mainView = this.view
    this.game.add(this.subject.interrior)
    this.subject.interrior.container = this.view
    this.game.add(this.opponent.interrior)
    this.opponent.interrior.container = this.view
    this.approach.start()
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
  },
  approach: {
    calcul: function () {
      return new Approach({
        subject: this.opponent.interrior,
        target: this.subject.interrior
      })
    }
  }
})

module.exports = Confrontation
