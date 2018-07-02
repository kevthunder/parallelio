(function(definition){var LineOfSight=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);LineOfSight.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=LineOfSight;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.LineOfSight=LineOfSight;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.LineOfSight=LineOfSight;}}})(function(){
var LineOfSight;
LineOfSight = (function() {
  function LineOfSight(tiles, x1, y1, x2, y2) {
    this.tiles = tiles;
    this.x1 = x1 != null ? x1 : 0;
    this.y1 = y1 != null ? y1 : 0;
    this.x2 = x2 != null ? x2 : 0;
    this.y2 = y2 != null ? y2 : 0;
  }
  LineOfSight.prototype.setX1 = function(val) {
    this.x1 = val;
    return this.invalidade();
  };
  LineOfSight.prototype.setY1 = function(val) {
    this.y1 = val;
    return this.invalidade();
  };
  LineOfSight.prototype.setX2 = function(val) {
    this.x2 = val;
    return this.invalidade();
  };
  LineOfSight.prototype.setY2 = function(val) {
    this.y2 = val;
    return this.invalidade();
  };
  LineOfSight.prototype.invalidade = function() {
    this.endPoint = null;
    this.success = null;
    return this.calculated = false;
  };
  LineOfSight.prototype.testTile = function(tile, entryX, entryY) {
    if (this.traversableCallback != null) {
      return this.traversableCallback(tile, entryX, entryY);
    } else {
      return (tile != null) && (typeof tile.getTransparent === 'function' ? tile.getTransparent() : typeof tile.transparent !== void 0 ? tile.transparent : true);
    }
  };
  LineOfSight.prototype.testTileAt = function(x, y, entryX, entryY) {
    return this.testTile(this.tiles.getTile(Math.floor(x), Math.floor(y)), entryX, entryY);
  };
  LineOfSight.prototype.calcul = function() {
    var nextX, nextY, positiveX, positiveY, ratio, tileX, tileY, total, x, y;
    ratio = (this.x2 - this.x1) / (this.y2 - this.y1);
    total = Math.abs(this.x2 - this.x1) + Math.abs(this.y2 - this.y1);
    positiveX = (this.x2 - this.x1) >= 0;
    positiveY = (this.y2 - this.y1) >= 0;
    tileX = x = this.x1;
    tileY = y = this.y1;
    while (total > Math.abs(x - this.x1) + Math.abs(y - this.y1) && this.testTileAt(tileX, tileY, x, y)) {
      nextX = positiveX ? Math.floor(x) + 1 : Math.ceil(x) - 1;
      nextY = positiveY ? Math.floor(y) + 1 : Math.ceil(y) - 1;
      if (this.x2 - this.x1 === 0) {
        y = nextY;
      } else if (this.y2 - this.y1 === 0) {
        x = nextX;
      } else if (Math.abs((nextX - x) / (this.x2 - this.x1)) < Math.abs((nextY - y) / (this.y2 - this.y1))) {
        x = nextX;
        y = (nextX - this.x1) / ratio + this.y1;
      } else {
        x = (nextY - this.y1) * ratio + this.x1;
        y = nextY;
      }
      tileX = positiveX ? x : Math.ceil(x) - 1;
      tileY = positiveY ? y : Math.ceil(y) - 1;
    }
    if (total <= Math.abs(x - this.x1) + Math.abs(y - this.y1)) {
      this.endPoint = {
        x: this.x2,
        y: this.y2,
        tile: this.tiles.getTile(Math.floor(this.x2), Math.floor(this.y2))
      };
      return this.success = true;
    } else {
      this.endPoint = {
        x: x,
        y: y,
        tile: this.tiles.getTile(Math.floor(tileX), Math.floor(tileY))
      };
      return this.success = false;
    }
  };
  LineOfSight.prototype.getSuccess = function() {
    if (!this.calculated) {
      this.calcul();
    }
    return this.success;
  };
  LineOfSight.prototype.getEndPoint = function() {
    if (!this.calculated) {
      this.calcul();
    }
    return this.endPoint;
  };
  return LineOfSight;
})();
return(LineOfSight);});