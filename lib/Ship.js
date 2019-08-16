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
    },
    spaceCoodinate: {
      calcul: function(invalidator) {
        var endX, endY, prc, startX, startY;
        if (invalidator.prop('travel')) {
          startX = invalidator.propPath('travel.startLocation.x');
          startY = invalidator.propPath('travel.startLocation.y');
          endX = invalidator.propPath('travel.targetLocation.x');
          endY = invalidator.propPath('travel.targetLocation.y');
          prc = invalidator.propPath('travel.pathTimeout.prc');
          return {
            x: (startX - endX) * prc + endX,
            y: (startY - endY) * prc + endY
          };
        } else {
          return {
            x: invalidator.propPath('location.x'),
            y: invalidator.propPath('location.y')
          };
        }
      }
    }
  });

  return Ship;

}).call(this);

//# sourceMappingURL=maps/Ship.js.map
