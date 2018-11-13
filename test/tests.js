(function() {
  require('./star');

  require('./damageable');

  require('parallelio-tiles/test/tests.js');

  require('parallelio-pathfinder/test/path_finder.js');

  require('parallelio-wiring/test/tests.js');

  require('parallelio-grids/test/tests.js');

  require('./game');

  require('./view');

  require('./door');

  require('./automatic_door');

  require('./line_of_sight');

  require('./damage_propagation');

  require('./weapon');

  require('./projectile');

  require('./room_generator');

  require('./path_walk');

  require('./concat');

}).call(this);
