#= require <_start>
#= require <Element>
#= require <PathFinder>
#= require <Tile>
#= require <TileContainer>
#= require <Floor>
#= require <Door>
#= require <RoomGenerator>

#--- Concatened ---
Parallelio.Element = Spark.Element
Parallelio.spark = Spark
if module?
  module.exports = Parallelio
else 
  @Parallelio = Parallelio
#--- Concatened end ---

#--- Standalone ---
if module?
  module.exports = {
    Star: require('./Star')
    Element: require('spark-starter').Element
    spark: require('spark-starter')
    PathFinder: require('parallelio-pathfinder')
    Tile: require('parallelio-tiles').Tile
    Tiled: require('parallelio-tiles').Tiled
    TileContainer: require('parallelio-tiles').TileContainer
    Floor: require('./Floor')
    Door: require('./Door')
    RoomGenerator: require('./RoomGenerator')
    strings: require('parallelio-strings')
  }
#--- Standalone end ---