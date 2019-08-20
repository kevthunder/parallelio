var Confrontation, Element, EncounterManager, PropertyWatcher;

Element = require('spark-starter').Element;

PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher;

Confrontation = require('./Confrontation');

module.exports = EncounterManager = (function() {
  class EncounterManager extends Element {
    init() {
      return this.locationWatcher.bind();
    }

    testEncounter() {
      if (this.rng() <= this.baseProbability) {
        return this.startEncounter();
      }
    }

    startEncounter() {
      var encounter;
      encounter = new Confrontation({
        subject: this.subject
      });
      return encounter.start();
    }

  };

  EncounterManager.properties({
    subject: {
      default: null
    },
    baseProbability: {
      default: 0.2
    },
    locationWatcher: {
      calcul: function() {
        return new PropertyWatcher({
          callback: () => {
            return this.testEncounter();
          },
          property: this.subject.getPropertyInstance('location')
        });
      }
    },
    rng: {
      default: Math.random
    }
  });

  return EncounterManager;

}).call(this);

//# sourceMappingURL=maps/EnconterManager.js.map
