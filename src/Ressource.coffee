Element = require('spark-starter').Element

module.exports = class Ressource extends Element
  @properties
    type: 
      default: null
    qte: 
      default: 0
      ingest: (qte)->
        if @maxQte != null and qte > @maxQte
          throw new Error('Cant have more than '+@maxQte+' of '+@type.name)
        if @minQte != null and qte < @minQte
          throw new Error('Cant have less than '+@minQte+' of '+@type.name)
        qte
    maxQte: 
      default: null
    minQte: 
      default: 0

  partialChange: (qte)->
    acceptable = Math.max(@minQte, Math.min(@maxQte,qte))
    @qte = acceptable
    qte - acceptable
      
