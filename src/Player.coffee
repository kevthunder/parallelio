Element = require('spark-starter').Element


module.exports = class Player extends Element
  constructor: (options) ->
    super(options)
  @properties
    name:
      default: 'Player'
    focused: {}
    selected: 
      change: (val, old)->
        if old?.propertiesManager.getProperty('selected')
          old.selected = false
        if @selected?.propertiesManager.getProperty('selected')
          @selected.selected = this
    globalActionProviders:
      collection: true
    actionProviders:
      calcul: (invalidator)->
        res = invalidator.prop(@globalActionProvidersProperty).toArray()
        selected = invalidator.prop(@selectedProperty)
        if selected
          res.push(selected)
        res
    availableActions:
      calcul: (invalidator)->
        invalidator.prop(@actionProvidersProperty).reduce((res,provider)=>
          actions = invalidator.prop(provider.actionsProperty).toArray()
          selected = invalidator.prop(@selectedProperty)
          if selected?
            actions = actions.map (action)=>
              @guessActionTarget(action)
          if actions
            res.concat(actions)
          else
            res
        ,[])
    selectedAction: {}
    controller: 
      change: (val, old)->
        if @controller
          @controller.player = this
    game:
      change: (val, old)->
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

  guessActionTarget: (action)->
    selected = @selected
    if typeof action.canTarget == "function" && !action.target? && action.actor != selected && action.canTarget(selected)
      action.withTarget(selected)
    else
      action

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