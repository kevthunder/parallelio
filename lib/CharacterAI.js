(function(definition){var CharacterAI=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);CharacterAI.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CharacterAI;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.CharacterAI=CharacterAI;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.CharacterAI=CharacterAI;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var TileContainer = dependencies.hasOwnProperty("TileContainer") ? dependencies.TileContainer : require('parallelio-tiles').TileContainer;
var VisionCalculator = dependencies.hasOwnProperty("VisionCalculator") ? dependencies.VisionCalculator : require('./VisionCalculator');
var Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : require('./Door');
var WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : require('./actions/WalkAction');
var CharacterAI;
CharacterAI = class CharacterAI {
  constructor(character) {
    var visionMemory;
    this.character = character;
    this.nextActionCallback = () => {
      return this.nextAction();
    };
    visionMemory = new TileContainer();
  }

  start() {
    return this.nextAction();
  }

  nextAction() {
    var ennemy, unexplored;
    this.updateVisionMemory();
    if (ennemy = this.getClosestEnemy()) {
      return this.attackMoveTo(ennemy).on('end', nextActionCallback);
    } else if (unexplored = this.getClosestUnexplored()) {
      return this.walkTo(unexplored).on('end', nextActionCallback);
    } else {
      this.resetVisionMemory();
      return this.walkTo(this.getClosestUnexplored()).on('end', nextActionCallback);
    }
  }

  updateVisionMemory() {
    var calculator, visionMemory;
    calculator = new VisionCalculator(this.character.tile);
    calculator.calcul();
    return visionMemory = calculator.toContainer().merge(visionMemory, (a, b) => {
      if (a != null) {
        a = this.analyzeTile(a);
      }
      if ((a != null) && (b != null)) {
        a.visibility = Math.max(a.visibility, b.visibility);
        return a;
      } else {
        return a || b;
      }
    });
  }

  analyzeTile(tile) {
    tile.ennemySpotted = a.tile.children.find((c) => {
      return this.isEnnemy(c);
    });
    tile.explorable = this.isExplorable(tile);
    return tile;
  }

  isEnnemy(elem) {
    return false;
  }

  getClosestEnemy() {
    return visionMemory.closest((t) => {
      return t.ennemySpotted;
    });
  }

  getClosestUnexplored() {
    return visionMemory.closest((t) => {
      return t.visibility < 1 && t.explorable;
    });
  }

  isExplorable(tile) {
    return t.walkable || a.tile.children.find((c) => {
      return c instanceof Door;
    });
  }

  attackMoveTo(tile) {
    // todo
    return this.walkTo(tile);
  }

  walkTo(tile) {
    var action;
    action = new WalkAction({
      actor: this.character,
      target: tile
    });
    if (action.isReady()) {
      action.execute();
      return action;
    }
  }

};

return(CharacterAI);});