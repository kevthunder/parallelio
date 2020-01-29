const Element = require('spark-starter').Element
const TileContainer = require('parallelio-tiles').TileContainer
const Tile = require('parallelio-tiles').Tile
const Direction = require('parallelio-tiles').Direction
const Airlock = require('../Airlock')
const Floor = require('../Floor')

class AirlockGenerator extends Element {
  generate () {
    const pos = this.getPos()
    this.structure.allTiles().map((tile) => {
      tile = tile.copyAndRotate(this.direction.angle)
      tile.x += pos.x
      tile.y += pos.y
      this.tileContainer.removeTileAt(tile.x, tile.y)
      this.tileContainer.addTile(tile)
    })
  }

  getPos () {
    const direction = this.direction
    const boundaries = this.tileContainer.boundaries
    let i = 0
    while (i < 20) {
      const x = this.getAxisPos(direction.x, boundaries.left, boundaries.right)
      const y = this.getAxisPos(direction.y, boundaries.top, boundaries.bottom)
      const tileToTest = this.tileContainer.getTile(x + direction.getInverse().x, y + direction.getInverse().y)
      if (tileToTest && tileToTest.walkable) {
        return { x: x, y: y }
      }
      i++
    }
  }

  getAxisPos (mode, min, max) {
    if (mode === 0) {
      return Math.floor(this.rng() * (max - min)) + min
    } else if (mode === 1) {
      return max
    } else {
      return min
    }
  }

  airlockFactory (opt) {
    opt.direction = Direction.up
    return new Airlock(opt)
  }
}

AirlockGenerator.properties({
  tileContainer: {},
  direction: {
    default: Direction.up
  },
  rng: {
    default: Math.random
  },
  wallFactory: {
    calcul: function () {
      return this.parent ? this.parent.wallFactory : function (opt) {
        return new Tile(opt)
      }
    }
  },
  floorFactory: {
    calcul: function () {
      return this.parent ? this.parent.wallFactory : function (opt) {
        return new Floor(opt)
      }
    }
  },
  structure: {
    calcul: function () {
      const tiles = new TileContainer()
      const w = this.wallFactory
      const f = this.floorFactory
      const a = this.airlockFactory.bind(this)
      tiles.loadMatrix([
        [w, a, w],
        [w, f, w]
      ], { x: -1, y: -1 })
      return tiles
    }
  }
})

module.exports = AirlockGenerator
