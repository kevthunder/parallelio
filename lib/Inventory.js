const Collection = require('spark-starter').Collection

class Inventory extends Collection {
  getByType (type) {
    var res
    res = this.filter(function (r) {
      return r.type === type
    })
    if (res.length) {
      return res[0]
    }
  }

  addByType (type, qte, partial = false) {
    var ressource
    ressource = this.getByType(type)
    if (!ressource) {
      ressource = this.initRessource(type)
    }
    if (partial) {
      ressource.partialChange(ressource.qte + qte)
    } else {
      ressource.qte += qte
    }
  }

  initRessource (type, opt) {
    return type.initRessource(opt)
  }
}

module.exports = Inventory
