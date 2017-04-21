#= require <_start>
#= require <Element>
#= require <PathFinder>
#= require <Tile>
#= require <TileContainer>

#--- Concatened ---
Parallelio.Element = Spark.Element
if module?
  module.exports = Parallelio
else 
  @Parallelio = Parallelio
#--- Concatened end ---

#--- Standalone ---
if module?
  module.exports = {
    Element: require('spark-starter')
    PathFinder: require('parallelio-pathfinder')
    Tile: require('parallelio-tiles').Tile
    TileContainer: require('parallelio-tiles').TileContainer
  }
#--- Standalone end ---