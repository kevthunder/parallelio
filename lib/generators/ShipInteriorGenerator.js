const Tile = require('parallelio-tiles').Tile
const RoomGenerator = require('./RoomGenerator')
const AirlockGenerator = require('./AirlockGenerator')
const Floor = require('../Floor')
const Door = require('../AutomaticDoor')
const Element = require('spark-starter').Element
const Direction = require('parallelio-tiles').Direction

class ShipInteriorGenerator extends Element {
  generate () {
    this.roomGenerator.generate()

    this.airlockGenerators.forEach((airlockGen) => {
      airlockGen.generate()
    })

    return this.shipInterior
  }

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

ShipInteriorGenerator.properties({
  shipInterior: {
  },
  rng: {
    default: Math.random
  },
  roomGenerator: {
    calcul: function () {
      const roomGen = new RoomGenerator({
        tileContainer: this.shipInterior,
        rng: this.rng
      })
      roomGen.wallFactory = this.wallFactory
      roomGen.floorFactory = this.floorFactory
      roomGen.doorFactory = this.doorFactory
      return roomGen
    }
  },
  airlockGenerators: {
    calcul: function () {
      return [
        new AirlockGenerator({
          tileContainer: this.shipInterior,
          rng: this.rng,
          direction: Direction.up
        }),
        new AirlockGenerator({
          tileContainer: this.shipInterior,
          rng: this.rng,
          direction: Direction.down
        })
      ]
    }
  }
})

module.exports = ShipInteriorGenerator
