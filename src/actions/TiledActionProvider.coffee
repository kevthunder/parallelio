ActionProvider = require('./ActionProvider')
Mixable = require('spark-starter').Mixable

class TiledActionProvider extends ActionProvider
  @properties
    tile:
      change: (old,overrided) ->
        overrided(old)
        @forwardedActions

    actionTiles:
      collection: true
      calcul: (invalidator)->
        myTile = invalidator.prop('tile')
        if myTile
          @actionTilesCoord.map (coord)=>
              myTile.getRelativeTile(coord.x,coord.y)
            .filter (tile)=>
              @validActionTile(tile)
        else
          []

    forwardedActions:
      collection: 
        compare: (a,b) ->
          a.action == b.action && a.location == b.location
      calcul: (invalidator)->
        actionTiles = invalidator.prop('actionTiles')
        actions = invalidator.prop('providedActions')
        actionTiles.reduce( (res,tile)=>
          res.concat actions.map (act)->
            {action:act, location:tile}
        , [])


      itemAdded: (forwarded) ->
        @prepareActionTile(forwarded.location)
        forwarded.location.providedActions.add(forwarded.action)

      itemRemoved: (forwarded) ->
        forwarded.location.providedActions.remove(forwarded.action)

  actionTilesCoord : [
    {x:0,y:-1}
    {x:-1,y:0},{x:0,y:0},{x:+1,y:0}
    {x:0,y:+1}
  ]

  validActionTile: (tile)->
    tile?

  prepareActionTile: (tile)->
    unless tile.getPropertyInstance('providedActions')
      Mixable.Extension.make(ActionProvider.prototype, tile)


    

