Element = require('spark-starter').Element
EventEmitter = require('spark-starter').EventEmitter

class Action extends Element
  @include EventEmitter.prototype
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
  finish: ->
    @trigger('finished')
    @end()
  interrupt: ->
    @trigger('interrupted')
    @end()
  end: ->
    @trigger('end')
    @destroy()
  destroy: ->
    @destroyProperties()