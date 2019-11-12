ActionProvider = require('./ActionProvider')
Mixable = require('spark-starter').Mixable

module.exports = class TiledActionProvider extends ActionProvider
  @properties
    originTile:
      calcul: (invalidator)->
        invalidator.propPath('owner.tile')

    actionTiles:
      collection: true
      calcul: (invalidator)->
        myTile = invalidator.prop(@originTileProperty)
        if myTile
          @actionTilesCoord.map (coord)=>
              myTile.getRelativeTile(coord.x,coord.y)
            .filter (tile)=>
              @validActionTile(tile)
        else
          []

      itemAdded: (tile) ->
        @prepareActionTile(tile)
        tile.actionProvider.actionsMember.addProperty(@actionsProperty)

      itemRemoved: (forwarded) ->
        tile.actionProvider.actionsMember.removeProperty(@actionsProperty)

  actionTilesCoord : [
    {x:0,y:-1}
    {x:-1,y:0},{x:0,y:0},{x:+1,y:0}
    {x:0,y:+1}
  ]

  validActionTile: (tile)->
    tile?

  prepareActionTile: (tile)->
    unless tile.actionProvider
      tile.actionProvider = new ActionProvider({owner:tile})


    

