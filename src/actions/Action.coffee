Element = require('spark-starter').Element
EventEmitter = require('spark-starter').EventEmitter

module.exports = class Action extends Element
  @include EventEmitter.prototype
  constructor: (options) ->
    super()
    @setProperties(options)
  @properties
    actor: {}
    base: {}
  withActor: (actor)->
    if @actor != actor
      @copyWith actor: actor
    else
      this
  copyWith:(options)->
    new this.constructor(Object.assign({base:@baseOrThis()},@getManualDataProperties(),options))
  baseOrThis:->
    @base || this
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