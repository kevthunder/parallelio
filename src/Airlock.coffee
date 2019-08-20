Tile = require('parallelio-tiles').Tile

module.exports = class Airlock extends Tile
  @properties
    direction: {}
    attachedTo: {}
  
  attachTo: (airlock)->
    @attachedTo = airlock
