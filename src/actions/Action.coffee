Element = require('spark-starter').Element

class Action extends Element
  constructor: (options) ->
    super()
    @setProperties(options)
  @properties
    actor: {}
  withActor: (actor)->
    if @actor != actor
      @copyWith actor: actor
    else
      this
  copyWith:(options)->
    new this.constructor(Object.assign({base:this},@getManualDataProperties(),options))
  start:->
    @execute()
  validActor: ()->
    @actor?
  isReady: ->
    @validActor()