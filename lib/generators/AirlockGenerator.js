const Element = require('spark-starter').Element
const TileContainer = require('parallelio-tiles').TileContainer
const Tile = require('parallelio-tiles').Tile
const Direction = require('parallelio-tiles').Direction
const Airlock = require('../Airlock')

class AirlockGenerator extends Element {
  generate () {
  }

  getPos (direction) {
    const boundaries = this.parent.tileContainer.boundaries
    let i = 0
    while (i < 20) {
      const x = Math.floor(this.rng.random() * (boundaries.right - boundaries.left)) + boundaries.left
      const y = Math.floor(this.rng.random() * 2) * (boundaries.bottom - boundaries.top) + boundaries.top
      const tileToTest = this.parent.tileContainer.getTile(x + direction.getInverse().x, y + direction.getInverse().y)
      if (tileToTest.factory({ x: 0, y: 0 }).walkable) {
        return { x: x, y: y, direction: direction }
      }
      i++
    }
  }

  airlockFactory (opt) {
    opt.direction = Direction.top
    return new Airlock(opt)
  }
}

AirlockGenerator.properties({
  rng: {
    default: Math.random
  },
  structure: {
    calcul: function () {
      const tiles = new TileContainer()
      const w = (opt) => {
        const tile = new Tile(opt.x - 1, opt.y - 1)
        tile.factory = this.parent.wallFactory.bind(this.parent)
        return tile
      }
      const f = (opt) => {
        const tile = new Tile(opt.x - 1, opt.y - 1)
        tile.factory = this.parent.floorFactory.bind(this.parent)
        return tile
      }
      const a = (opt) => {
        const tile = new Tile(opt.x - 1, opt.y - 1)
        tile.factory = this.airlockFactory.bind(this)
        return tile
      }
      tiles.loadMatrix([
        [w, a, w],
        [w, f, w]
      ])
    }
  }
})

module.exports = AirlockGenerator
