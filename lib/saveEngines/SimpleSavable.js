
const SimpleLoader = require('./SimpleLoader')

class SimpleSavable {
  constructor (obj, alias = null, loader = null) {
    this.obj = obj
    this.alias = alias || obj.constructor.name
    this.loader = loader
  }

  makeDefaultLoader () {
    if (!this.obj.constructor.loader) {
      this.obj.constructor.loader = new SimpleLoader(this.obj.constructor, this.alias)
    }
    return this.obj.constructor.loader
  }

  register (game) {
    if (!this.loader) {
      this.loader = this.makeDefaultLoader()
    }
    this.loader.register(game)
    game.savables.add(this)
  }

  getRawData () {
    if (typeof this.obj.getSaveData === 'function') {
      return this.obj.getSaveData()
    }
    return this.obj.propertiesManager.getManualDataProperties()
  }

  getSaveData () {
    return Object.assign(
      { typeAlias: this.alias },
      this.getRawData()
    )
  }
}

module.exports = SimpleSavable
