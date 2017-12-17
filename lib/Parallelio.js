if(module){
  module.exports = {
    Character: require('./Character.js'),
    Damageable: require('./Damageable.js'),
    DamagePropagation: require('./DamagePropagation.js'),
    Door: require('./Door.js'),
    Element: require('./Element.js'),
    Floor: require('./Floor.js'),
    LineOfSight: require('./LineOfSight.js'),
    PathWalk: require('./PathWalk.js'),
    Projectile: require('./Projectile.js'),
    RoomGenerator: require('./RoomGenerator.js'),
    Star: require('./Star.js'),
    Weapon: require('./Weapon.js')
  };
}