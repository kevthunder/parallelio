var Airlock, Tile;

Tile = require('parallelio-tiles').Tile;

module.exports = Airlock = (function() {
  class Airlock extends Tile {
    attachTo(airlock) {
      return this.attachedTo = airlock;
    }

  };

  Airlock.properties({
    direction: {},
    attachedTo: {}
  });

  return Airlock;

}).call(this);

//# sourceMappingURL=maps/Airlock.js.map
