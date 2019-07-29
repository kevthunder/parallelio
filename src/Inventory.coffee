Collection = require('spark-starter').Collection

class Inventory extends Collection
  getByType: (type)->
    res = @filter (r)->
      r.type == type
    if res.length
      res[0]
      
  addByType: (type, qte, partial = false)->
    ressource = @getByType(type);
    unless ressource
      ressource = @initRessource(type)
    if partial
      ressource.partialChange(ressource.qte + qte)
    else
      ressource.qte += qte
      
  initRessource: (type, opt)->
    type.initRessource(opt)