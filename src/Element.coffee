#= require ../node_modules/spark-starter/src/Element.coffee

Element = @Spark?.Element || require('spark-starter')
      
if typeof @exports == 'undefined'
  @exports = Element
else 
  if typeof @Spark == 'undefined'
    @Parallelio = {}
  @Parallelio.Element = Element
  
  