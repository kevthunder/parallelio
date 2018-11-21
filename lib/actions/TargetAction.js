(function(definition){var TargetAction=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);TargetAction.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=TargetAction;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.TargetAction=TargetAction;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.TargetAction=TargetAction;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Action = dependencies.hasOwnProperty("Action") ? dependencies.Action : require('./Action');
var TargetAction;
TargetAction = (function() {
  class TargetAction extends Action {
    withTarget(target) {
      if (this.target !== target) {
        return this.copyWith({
          target: target
        });
      } else {
        return this;
      }
    }

    canTarget(target) {
      var instance;
      instance = this.withTarget(target);
      if (instance.validTarget()) {
        return instance;
      }
    }

    validTarget() {
      return this.actor != null;
    }

    isReady() {
      return super.isReady() && this.validTarget();
    }

  };

  TargetAction.properties({
    target: {}
  });

  return TargetAction;

}).call(this);

return(TargetAction);});