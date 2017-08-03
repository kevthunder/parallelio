if (typeof module !== "undefined" && module !== null) {
  module.exports = {
    Star: require('./Star'),
    Element: require('spark-starter').Element,
    spark: require('spark-starter'),
    PathFinder: require('parallelio-pathfinder'),
    Tile: require('parallelio-tiles').Tile,
    TileContainer: require('parallelio-tiles').TileContainer
  };
}
