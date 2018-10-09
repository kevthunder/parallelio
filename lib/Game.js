(function(definition){var Game=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Game.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Game;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Game=Game;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Game=Game;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Game;
Game = (function() {
  class Game extends Element {
    start() {}

    add(elem) {
      return elem.game = this;
    }

  };

  Game.properties({
    timing: {
      calcul: function() {
        return new Parallelio.Timing();
      }
    }
  });

  return Game;

}).call(this);

return(Game);});