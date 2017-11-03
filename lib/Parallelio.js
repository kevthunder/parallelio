if (typeof module !== "undefined" && module !== null) {
  module.exports = {
    Star: require('./Star'),
    Element: require('spark-starter').Element,
    spark: require('spark-starter'),
    PathFinder: require('parallelio-pathfinder'),
    Tile: require('parallelio-tiles').Tile,
    Tiled: require('parallelio-tiles').Tiled,
    TileContainer: require('parallelio-tiles').TileContainer,
    Floor: require('./Floor'),
    Door: require('./Door'),
    RoomGenerator: require('./RoomGenerator'),
    strings: require('parallelio-strings')
  };
}
