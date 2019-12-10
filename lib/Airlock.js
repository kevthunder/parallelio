const Tile = require('parallelio-tiles').Tile

class Airlock extends Tile {
  attachTo (airlock) {
    this.attachedTo = airlock
  }

  copyAndRotate (angle, origin) {
    const copy = super.copyAndRotate(angle, origin)
    copy.direction = this.direction.rotate(angle)
    return copy
  }
}

Airlock.properties({
  direction: {},
  attachedTo: {}
})

module.exports = Airlock
