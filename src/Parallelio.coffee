#= require <_start>
#= require <Element>
#= require <PathFinder>

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
    Element: require('spark-starter'),
    PathFinder: require('parallelio-pathfinder')
  }
#--- Standalone end ---