(function() {
  require('./timing');

  require('./star');

  require('./damageable');

  require('parallelio-tiles/test/tests.js');

  require('parallelio-pathfinder/test/path_finder.js');

  require('./door');

  require('./line_of_sight');

  require('./damage_propagation');

  require('./weapon');

  require('./room_generator');

  require('./concat');

}).call(this);
