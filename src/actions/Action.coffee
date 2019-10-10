Element = require('spark-starter').Element
EventEmitter = require('events')

module.exports = class Action extends Element
  @include EventEmitter.prototype
  constructor: (options) ->
    super(options)
  @properties
    actor: {}
    base: {}
  withActor: (actor)->
    if @actor != actor
      @copyWith actor: actor
    else
      this
  copyWith:(options)->
    new this.constructor(Object.assign({base:@baseOrThis()},@propertiesManager.getManualDataProperties(),options))
  baseOrThis:->
    @base || this
  start:->
    @execute()
  validActor: ()->
    @actor?
  isReady: ->
    @validActor()
  finish: ->
    @emit('finished')
    @end()
  interrupt: ->
    @emit('interrupted')
    @end()
  end: ->
    @emit('end')
    @destroy()
  destroy: ->
    @propertiesManager.destroy()