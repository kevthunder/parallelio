Tile = require('parallelio-tiles').Tile

module.exports = class Floor extends Tile
  @properties
    walkable:
      composed: true
    transparent:
      composed: true

