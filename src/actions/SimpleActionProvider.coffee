ActionProvider = require('./ActionProvider')

module.exports = class SimpleActionProvider extends ActionProvider
  @properties
    actions: 
      calcul: ->
        actions = @actionOptions || @constructor.actions || []
        if typeof actions == "object"
          actions = Object.keys(actions).map (key)->
            actions[key]
        actions.map (action)=>
          if typeof action.withTarget == "function"
            action.withTarget(this)
          else if typeof action == "function"
            new action(target: this)
          else
            action


