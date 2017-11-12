Tile = require('parallelio-tiles').Tile

class Floor extends Tile
  @properties
    walkable:
      composed: true
    transparent:
      composed: true

