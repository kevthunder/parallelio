const Element = require('spark-starter').Element
const Travel = require('./Travel')
const TravelAction = require('./actions/TravelAction')
const ActionProvider = require('./actions/ActionProvider')
const ShipInterior = require('./actions/ShipInterior')

class Ship extends Element {
  travelTo (location) {
    var travel
    travel = new Travel({
      traveller: this,
      startLocation: this.location,
      targetLocation: location
    })
    if (travel.valid) {
      travel.start()
      this.travel = travel
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
  interrior: {
    calcul: function () {
      return new ShipInterior({ ship: this })
    }
  },
  actionProvider: {
    calcul: function () {
      const provider = new ActionProvider({
        owner: this
      })
      provider.actionsMembers.add(new TravelAction({
        actor: this
      }))
      return provider
    }
  },
  spaceCoodinate: {
    calcul: function (invalidator) {
      if (invalidator.prop(this.travelProperty)) {
        return invalidator.propPath('travel.spaceCoodinate')
      } else {
        return {
          x: invalidator.propPath('location.x'),
          y: invalidator.propPath('location.y')
        }
      }
    }
  }
})

module.exports = Ship
