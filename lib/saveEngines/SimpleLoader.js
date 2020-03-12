
class SimpleLoader {
  constructor (construct, alias = null) {
    this.construct = construct
    this.alias = alias || construct.name
  }

  register (game) {
    game.loaders.add(this)
  }

  match (data) {
    return data.typeAlias === this.alias
  }

  load (data) {
    const Construct = this.construct
    return new Construct(data)
  }
}

module.exports = SimpleLoader
