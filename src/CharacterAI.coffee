TileContainer = require('parallelio-tiles').TileContainer
VisionCalculator = require('./VisionCalculator')
Door = require('./Door')
WalkAction = require('./actions/WalkAction')
AttackMoveAction = require('./actions/AttackMoveAction')
PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher

module.exports = class CharacterAI
  constructor: (@character)->
    @nextActionCallback = => @nextAction()
    @visionMemory = new TileContainer()
    @tileWatcher = new PropertyWatcher
      callback: =>
        @updateVisionMemory()
      property: @character.getPropertyInstance('tile')
      

  start: ->
    @tileWatcher.bind()
    @nextAction()

  nextAction: ->
    @updateVisionMemory()
    if ennemy = @getClosestEnemy()
      @attackMoveTo(ennemy).on('end', nextActionCallback)
    else if unexplored = @getClosestUnexplored()
      @walkTo(unexplored).on('end', nextActionCallback)
    else
      @resetVisionMemory()
      @walkTo(@getClosestUnexplored()).on('end', nextActionCallback)

  updateVisionMemory: ->
    calculator = new VisionCalculator(@character.tile)
    calculator.calcul()
    @visionMemory = calculator.toContainer().merge @visionMemory, (a, b)=>
      if a?
        a = @analyzeTile(a)
      if a? and b?
        a.visibility = Math.max(a.visibility, b.visibility)
        a
      else
        a || b

  analyzeTile: (tile)->
    tile.ennemySpotted = tile.getFinalTile().children?.find (c)=> @isEnnemy(c)
    tile.explorable = @isExplorable(tile)
    tile

  isEnnemy: (elem)->
    @character.owner?.isEnemy?(elem)

  getClosestEnemy: ->
    @visionMemory.closest @character.tile, (t)=> t.ennemySpotted

  getClosestUnexplored: ->
    @visionMemory.closest @character.tile, (t)=> t.visibility < 1 and t.explorable

  isExplorable: (tile)->
    tile = tile.getFinalTile()
    tile.walkable or tile.children?.find (c)=>
      c instanceof Door

  attackMoveTo: (tile)->
    tile = tile.getFinalTile()
    action = new AttackMoveAction(actor: @character, target: tile)
    if action.isReady()
      action.execute()
      action

  walkTo: (tile)->
    tile = tile.getFinalTile()
    action = new WalkAction(actor: @character, target: tile)
    if action.isReady()
      action.execute()
      action
  
  



