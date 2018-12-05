(function(definition){var SimpleActionProvider=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);SimpleActionProvider.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=SimpleActionProvider;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.SimpleActionProvider=SimpleActionProvider;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.SimpleActionProvider=SimpleActionProvider;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var ActionProvider = dependencies.hasOwnProperty("ActionProvider") ? dependencies.ActionProvider : require('./ActionProvider');
var SimpleActionProvider;
SimpleActionProvider = (function() {
  class SimpleActionProvider extends ActionProvider {};

  SimpleActionProvider.properties({
    providedActions: {
      calcul: function() {
        var actions;
        actions = this.actions || this.constructor.actions;
        if (typeof actions === "object") {
          actions = Object.keys(actions).map(function(key) {
            return actions[key];
          });
        }
        return actions.map((action) => {
          return new action({
            target: this
          });
        });
      }
    }
  });

  return SimpleActionProvider;

}).call(this);

return(SimpleActionProvider);});