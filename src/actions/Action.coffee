Element = require('spark-starter').Element

class Action extends Element
  constructor: (options) ->
    super()
    @setProperties(options)
  @properties
    actor: {}
  copyWith:(options)->
    new this.constructor(Object.assign({base:this},@getManualDataProperties(),options))
  start:->
    @execute()
  isReady: ->
    true