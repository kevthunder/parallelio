Element = require('spark-starter').Element
Ressource = require('./Ressource')

module.exports = class RessourceType extends Element
  @properties
    name: 
      default: null
    ressourceClass:
      default: Ressource
    defaultOptions:
      default: {}
  
  initRessource: (opt)->
    unless typeof opt == "object"
      opt = {qte:opt}
    opt = Object.assign({},@defaultOptions,opt)
    new @ressourceClass(opt)