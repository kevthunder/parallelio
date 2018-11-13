(function(definition){var View=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);View.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=View;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.View=View;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.View=View;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Grid = dependencies.hasOwnProperty("Grid") ? dependencies.Grid : require('parallelio-grids').Grid;
var View;
View = (function() {
  class View extends Element {
    setDefaults() {
      var ref, ref1;
      if (!this.bounds) {
        this.grid = this.grid || ((ref = this.game._mainView) != null ? (ref1 = ref.value) != null ? ref1.grid : void 0 : void 0) || new Grid();
        return this.bounds = this.grid.addCell();
      }
    }

    destroy() {
      return this.game = null;
    }

  };

  View.properties({
    game: {
      change: function(old) {
        if (this.game) {
          this.game.views.add(this);
          this.setDefaults();
        }
        if (old) {
          return old.views.remove(this);
        }
      }
    },
    x: {
      default: 0
    },
    y: {
      default: 0
    },
    grid: {
      default: null
    },
    bounds: {
      default: null
    }
  });

  return View;

}).call(this);

return(View);});