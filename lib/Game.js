(function(definition){var Game=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Game.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Game;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Game=Game;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Game=Game;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : require('parallelio-timing');
var View = dependencies.hasOwnProperty("View") ? dependencies.View : require('./View');
var Game;
Game = (function() {
  class Game extends Element {
    start() {}

    add(elem) {
      elem.game = this;
      return elem;
    }

  };

  Game.properties({
    timing: {
      calcul: function() {
        return new Timing();
      }
    },
    mainView: {
      calcul: function() {
        if (this.views.length > 0) {
          return this.views.get(0);
        } else {
          return this.add(new View());
        }
      }
    },
    views: {
      collection: true
    }
  });

  return Game;

}).call(this);

return(Game);});