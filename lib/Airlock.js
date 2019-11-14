const Tile = require('parallelio-tiles').Tile

class Airlock extends Tile {
  attachTo (airlock) {
    return this.attachedTo = airlock
  }
};

Airlock.properties({
  direction: {},
  attachedTo: {}
})

module.exports = Airlock
