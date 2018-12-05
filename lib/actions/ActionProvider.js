(function(definition){var ActionProvider=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);ActionProvider.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ActionProvider;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.ActionProvider=ActionProvider;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.ActionProvider=ActionProvider;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var ActionProvider;
ActionProvider = (function() {
  class ActionProvider extends Element {};

  ActionProvider.properties({
    providedActions: {
      collection: true
    }
  });

  return ActionProvider;

}).call(this);

return(ActionProvider);});