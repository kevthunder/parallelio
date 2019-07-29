Element = require('spark-starter').Element

class Ship extends Element
  @properties
    location: 
      default: null
    travelTarget:
      default: null
    travelProgress:
      default: null

