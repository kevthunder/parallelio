(function(definition){var CharacterAI=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);CharacterAI.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CharacterAI;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.CharacterAI=CharacterAI;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.CharacterAI=CharacterAI;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var TileContainer = dependencies.hasOwnProperty("TileContainer") ? dependencies.TileContainer : require('parallelio-tiles').TileContainer;
var VisionCalculator = dependencies.hasOwnProperty("VisionCalculator") ? dependencies.VisionCalculator : require('./VisionCalculator');
var Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : require('./Door');
var WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : require('./actions/WalkAction');
var AttackMoveAction = dependencies.hasOwnProperty("AttackMoveAction") ? dependencies.AttackMoveAction : require('./actions/AttackMoveAction');
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('spark-starter').PropertyWatcher;
var CharacterAI;
CharacterAI = class CharacterAI {
  constructor(character) {
    this.character = character;
    this.nextActionCallback = () => {
      return this.nextAction();
    };
    this.visionMemory = new TileContainer();
    this.tileWatcher = new PropertyWatcher({
      callback: () => {
        return this.updateVisionMemory();
      },
      property: this.character.getPropertyInstance('tile')
    });
  }

  start() {
    this.tileWatcher.bind();
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
    var calculator;
    calculator = new VisionCalculator(this.character.tile);
    calculator.calcul();
    return this.visionMemory = calculator.toContainer().merge(this.visionMemory, (a, b) => {
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
    var ref;
    tile.ennemySpotted = (ref = tile.getFinalTile().children) != null ? ref.find((c) => {
      return this.isEnnemy(c);
    }) : void 0;
    tile.explorable = this.isExplorable(tile);
    return tile;
  }

  isEnnemy(elem) {
    var ref;
    return (ref = this.character.owner) != null ? typeof ref.isEnemy === "function" ? ref.isEnemy(elem) : void 0 : void 0;
  }

  getClosestEnemy() {
    return this.visionMemory.closest(this.character.tile, (t) => {
      return t.ennemySpotted;
    });
  }

  getClosestUnexplored() {
    return this.visionMemory.closest(this.character.tile, (t) => {
      return t.visibility < 1 && t.explorable;
    });
  }

  isExplorable(tile) {
    var ref;
    tile = tile.getFinalTile();
    return tile.walkable || ((ref = tile.children) != null ? ref.find((c) => {
      return c instanceof Door;
    }) : void 0);
  }

  attackMoveTo(tile) {
    var action;
    tile = tile.getFinalTile();
    action = new AttackMoveAction({
      actor: this.character,
      target: tile
    });
    if (action.isReady()) {
      action.execute();
      return action;
    }
  }

  walkTo(tile) {
    var action;
    tile = tile.getFinalTile();
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