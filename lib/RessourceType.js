const Element = require('spark-starter').Element
const Ressource = require('./Ressource')

class RessourceType extends Element {
  initRessource (opt) {
    if (typeof opt !== 'object') {
      opt = {
        qte: opt
      }
    }
    opt = Object.assign({}, this.defaultOptions, opt)
    const RessourceClass = this.ressourceClass
    return new RessourceClass(opt)
  }
};

RessourceType.properties({
  name: {
    default: null
  },
  ressourceClass: {
    default: Ressource
  },
  defaultOptions: {
    default: {}
  }
})

module.exports = RessourceType
