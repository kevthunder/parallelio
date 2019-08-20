var ActionProvider, SimpleActionProvider;

ActionProvider = require('./ActionProvider');

module.exports = SimpleActionProvider = (function() {
  class SimpleActionProvider extends ActionProvider {};

  SimpleActionProvider.properties({
    providedActions: {
      calcul: function() {
        var actions;
        actions = this.actions || this.constructor.actions || [];
        if (typeof actions === "object") {
          actions = Object.keys(actions).map(function(key) {
            return actions[key];
          });
        }
        return actions.map((action) => {
          if (typeof action.withTarget === "function") {
            return action.withTarget(this);
          } else if (typeof action === "function") {
            return new action({
              target: this
            });
          } else {
            return action;
          }
        });
      }
    }
  });

  return SimpleActionProvider;

}).call(this);

//# sourceMappingURL=../maps/actions/SimpleActionProvider.js.map
