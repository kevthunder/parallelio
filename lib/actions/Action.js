(function(definition){var Action=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Action.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Action;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Action=Action;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Action=Action;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Action;
Action = (function() {
  class Action extends Element {
    constructor(options) {
      super();
      this.setProperties(options);
    }

    copyWith(options) {
      return new this.constructor(Object.assign({
        base: this
      }, this.getManualDataProperties(), options));
    }

    start() {
      return this.execute();
    }

    isReady() {
      return true;
    }

  };

  Action.properties({
    actor: {}
  });

  return Action;

}).call(this);

return(Action);});