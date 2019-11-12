Element = require('spark-starter').Element

module.exports = class ActionProvider extends Element
  @properties
    actions: 
      collection: true
      composed: true
    owner: {}
