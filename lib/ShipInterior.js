const Tile = require('parallelio-tiles').Tile
const TileContainer = require('parallelio-tiles').TileContainer
const DefaultGenerator = require('./generators/RoomGenerator')
const Floor = require('./Floor')
const Door = require('./AutomaticDoor')

class ShipInterior extends TileContainer {
  setDefaults () {
    if (!(this.tiles.length > 0)) {
      this.generate()
    }
    if (this.game.mainTileContainer == null) {
      this.game.mainTileContainer = this
    }
  }

  generate (generator) {
    generator = generator || (new ShipInterior.Generator()).tap(function () {})
    generator.getTiles().forEach((tile) => {
      this.addTile(tile)
    })
  }
}

ShipInterior.properties({
  container: {},
  ship: {},
  game: {
    change: function (val, old) {
      if (val) {
        return this.setDefaults()
      }
    }
  },
  airlocks: {
    collection: true,
    calcul: function () {
      this.allTiles().filter((t) => typeof t.attachTo === 'function')
    }
  }
})

ShipInterior.Generator = class Generator extends DefaultGenerator {
  wallFactory (opt) {
    return (new Tile(opt.x, opt.y)).tap(function () {
      this.walkable = false
    })
  }

  floorFactory (opt) {
    return new Floor(opt.x, opt.y)
  }

  doorFactory (opt) {
    return (new Floor(opt.x, opt.y)).tap(function () {
      this.addChild(new Door({
        direction: opt.direction
      }))
    })
  }
}

module.exports = ShipInterior
