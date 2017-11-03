#= require <Tile>
#--- Standalone ---
Tile = @Parallelio?.Tile || require('parallelio-tiles').Tile
#--- Standalone end ---

class Floor extends Tile
  @properties
    walkable:
      composed: true
    transparent:
      composed: true

if Parallelio?
  Parallelio.Tile.Floor = Floor
#--- Standalone ---
if module?
  module.exports = Floor
else
  unless @Parallelio?
    @Parallelio = {}
  @Parallelio.Tile.Floor = Floor
#--- Standalone end ---