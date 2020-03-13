const Element = require('spark-starter').Element
const Timing = require('parallelio-timing')
const View = require('./View')
const Player = require('./Player')
const LoaderCollection = require('./saveEngines/LoaderCollection')

class Game extends Element {
  start () {
    return this.currentPlayer
  }

  add (elem) {
    if (Array.isArray(elem)) {
      return elem.map((e) => {
        return this.add(e)
      })
    }
    elem.game = this
    return elem
  }

  load (slot) {
    if (!this.saveEngine) {
      throw (new Error('No Save engine enabled'))
    }
    const data = this.saveEngine.load(slot)
    const loaded = this.loaders.load(data)
    this.add(loaded)
  }

  save (slot) {
    if (!this.saveEngine) {
      throw (new Error('No Save engine enabled'))
    }
    const data = this.savables.map((elem) => {
      return elem.getSaveData()
    })
    this.saveEngine.save(data, slot)
  }
};

Game.properties({
  timing: {
    calcul: function () {
      return new Timing()
    }
  },
  mainView: {
    calcul: function () {
      if (this.views.length > 0) {
        return this.views.get(0)
      } else {
        const ViewClass = this.defaultViewClass
        return this.add(new ViewClass())
      }
    }
  },
  views: {
    collection: true
  },
  currentPlayer: {
    calcul: function () {
      if (this.players.length > 0) {
        return this.players.get(0)
      } else {
        const PlayerClass = this.defaultPlayerClass
        return this.add(new PlayerClass())
      }
    }
  },
  players: {
    collection: true
  },
  savables: {
    collection: true
  },
  loaders: {
    calcul: function () {
      return new LoaderCollection()
    }
  }
})

Game.prototype.defaultViewClass = View

Game.prototype.defaultPlayerClass = Player

module.exports = Game
