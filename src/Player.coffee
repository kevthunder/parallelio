Element = require('spark-starter').Element
EventEmitter = require('spark-starter').EventEmitter


module.exports = class Player extends Element
  @include EventEmitter.prototype
  constructor: (options) ->
    super()
    @setProperties(options)
  @properties
    name:
      default: 'Player'
    focused: {}
    selected: 
      change: (old)->
        if old?.getProperty('selected')
          old.selected = false
        if @selected?.getProperty('selected')
          @selected.selected = this
    globalActionProviders:
      collection: true
    actionProviders:
      calcul: (invalidator)->
        res = invalidator.prop('globalActionProviders').toArray()
        selected = invalidator.prop('selected')
        if selected
          res.push(selected)
        res
    availableActions:
      calcul: (invalidator)->
        invalidator.prop("actionProviders").reduce((res,provider)=>
          actions = invalidator.prop("availableActions", provider)
          if actions
            res.concat(actions.toArray())
          else
            res
        ,[])
    selectedAction: {}
    controller: 
      change: (old)->
        if @controller
          @controller.player = this
    game:
      change: (old)->
        if @game 
          @setDefaults()

  setDefaults: ()->
    first = @game.players.length == 0
    @game.players.add(this)
    if first && !@controller && @game.defaultPlayerControllerClass
      @controller = new @game.defaultPlayerControllerClass()

  canTargetActionOn: (elem)->
    action = @selectedAction || @selected?.defaultAction
    action? && typeof action.canTarget == "function" && action.canTarget(elem)
  canSelect: (elem)->
    typeof elem.isSelectableBy == "function" && elem.isSelectableBy(this)
  canFocusOn: (elem)->
    if typeof elem.IsFocusableBy == "function" 
      elem.IsFocusableBy(this)
    else if typeof elem.IsSelectableBy == "function"
      elem.IsSelectableBy(this)
  selectAction: (action)->
    if action.isReady()
      action.start()
    else
      @selectedAction = action
  setActionTarget: (elem)->
    action = @selectedAction || @selected?.defaultAction
    action = action.withTarget(elem)
    if action.isReady()
      action.start()
      @selectedAction = null
    else
      @selectedAction = action