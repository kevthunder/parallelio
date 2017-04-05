#= require <_start>
#= require <Element>

### Concatened ###
Parallelio.Element = Spark.Element
if module?
  module.exports = Parallelio
else 
  @Parallelio = Parallelio
### Concatened end ###

### Standalone ###
if module?
  module.exports = {
    Element: require('spark-starter')
  }
### Standalone end ###