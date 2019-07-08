TileContainer = require('parallelio-tiles').TileContainer
VisionCalculator = require('./VisionCalculator')
Door = require('./Door')
WalkAction = require('./actions/WalkAction')
AttackMoveAction = require('./actions/AttackMoveAction')

class CharacterAI
  constructor: (@character)->
    @nextActionCallback = => @nextAction()
    visionMemory = new TileContainer()

  start: ->
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
    visionMemory = calculator.toContainer().merge visionMemory, (a, b)=>
      if a?
        a = @analyzeTile(a)
      if a? and b?
        a.visibility = Math.max(a.visibility, b.visibility)
        a
      else
        a || b

  analyzeTile: (tile)->
    tile.ennemySpotted = a.tile.children.find (c)=> @isEnnemy(c)
    tile.explorable = @isExplorable(tile)
    tile

  isEnnemy: (elem)->
    false

  getClosestEnemy: ->
    visionMemory.closest (t)=> t.ennemySpotted

  getClosestUnexplored: ->
    visionMemory.closest (t)=> t.visibility < 1 and t.explorable

  isExplorable: (tile)->
    t.walkable or a.tile.children.find (c)=>
      c instanceof Door

  attackMoveTo: (tile)->
    action = new AttackMoveAction(actor: @character, target: tile)
    if action.isReady()
      action.execute()
      action

  walkTo: (tile)->
    action = new WalkAction(actor: @character, target: tile)
    if action.isReady()
      action.execute()
      action
  
  



