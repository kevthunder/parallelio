if (typeof module !== "undefined" && module !== null) {
  module.exports = {
    Element: require('spark-starter'),
    PathFinder: require('parallelio-pathfinder'),
    Tile: require('parallelio-tiles').Tile,
    TileContainer: require('parallelio-tiles').TileContainer
  };
}