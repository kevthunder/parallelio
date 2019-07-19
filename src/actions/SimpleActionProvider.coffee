ActionProvider = require('./ActionProvider')

module.exports = class SimpleActionProvider extends ActionProvider
  @properties
    providedActions: 
      calcul: ->
        actions = @actions || @constructor.actions
        if typeof actions == "object"
          actions = Object.keys(actions).map (key)->
            actions[key]
        actions.map (action)=>
          new action(target:this)


