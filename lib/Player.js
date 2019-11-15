const Element = require('spark-starter').Element

class Player extends Element {
  setDefaults () {
    var first
    first = this.game.players.length === 0
    this.game.players.add(this)
    if (first && !this.controller && this.game.defaultPlayerControllerClass) {
      const PlayerControllerClass = this.game.defaultPlayerControllerClass
      this.controller = new PlayerControllerClass()
    }
  }

  canTargetActionOn (elem) {
    var action, ref
    action = this.selectedAction || ((ref = this.selected) != null ? ref.defaultAction : null)
    return (action != null) && typeof action.canTarget === 'function' && action.canTarget(elem)
  }

  guessActionTarget (action) {
    var selected
    selected = this.selected
    if (typeof action.canTarget === 'function' && (action.target == null) && action.actor !== selected && action.canTarget(selected)) {
      return action.withTarget(selected)
    } else {
      return action
    }
  }

  canSelect (elem) {
    return typeof elem.isSelectableBy === 'function' && elem.isSelectableBy(this)
  }

  canFocusOn (elem) {
    if (typeof elem.IsFocusableBy === 'function') {
      return elem.IsFocusableBy(this)
    } else if (typeof elem.IsSelectableBy === 'function') {
      return elem.IsSelectableBy(this)
    }
  }

  selectAction (action) {
    if (action.isReady()) {
      action.start()
    } else {
      this.selectedAction = action
    }
  }

  setActionTarget (elem) {
    var action, ref
    action = this.selectedAction || ((ref = this.selected) != null ? ref.defaultAction : null)
    action = action.withTarget(elem)
    if (action.isReady()) {
      action.start()
      this.selectedAction = null
    } else {
      this.selectedAction = action
    }
  }
};

Player.properties({
  name: {
    default: 'Player'
  },
  focused: {},
  selected: {
    change: function (val, old) {
      var ref
      if (old != null ? old.propertiesManager.getProperty('selected') : null) {
        old.selected = false
      }
      if ((ref = this.selected) != null ? ref.propertiesManager.getProperty('selected') : null) {
        this.selected.selected = this
      }
    }
  },
  globalActionProviders: {
    collection: true
  },
  actionProviders: {
    calcul: function (invalidator) {
      var res, selected
      res = invalidator.prop(this.globalActionProvidersProperty).toArray()
      selected = invalidator.prop(this.selectedProperty)
      if (selected) {
        res.push(selected)
      }
      return res
    }
  },
  availableActions: {
    calcul: function (invalidator) {
      return invalidator.prop(this.actionProvidersProperty).reduce((res, provider) => {
        var actions, selected
        actions = invalidator.prop(provider.actionsProperty).toArray()
        selected = invalidator.prop(this.selectedProperty)
        if (selected != null) {
          actions = actions.map((action) => {
            return this.guessActionTarget(action)
          })
        }
        if (actions) {
          return res.concat(actions)
        } else {
          return res
        }
      }, [])
    }
  },
  selectedAction: {},
  controller: {
    change: function (val, old) {
      if (this.controller) {
        this.controller.player = this
      }
    }
  },
  game: {
    change: function (val, old) {
      if (this.game) {
        return this.setDefaults()
      }
    }
  }
})

module.exports = Player
