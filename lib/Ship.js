var Element, Ship, Travel, TravelAction;

Element = require('spark-starter').Element;

Travel = require('./Travel');

TravelAction = require('./actions/TravelAction');

module.exports = Ship = (function() {
  class Ship extends Element {
    travelTo(location) {
      var travel;
      travel = new Travel({
        traveller: this,
        startLocation: this.location,
        targetLocation: location
      });
      if (travel.valid) {
        travel.start();
        return this.travel = travel;
      }
    }

  };

  Ship.properties({
    location: {
      default: null
    },
    travel: {
      default: null
    },
    availableActions: {
      collection: true,
      calcul: function(invalidator) {
        return new TravelAction({
          actor: this
        });
      }
    }
  });

  return Ship;

}).call(this);

//# sourceMappingURL=maps/Ship.js.map
