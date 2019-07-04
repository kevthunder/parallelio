if(module){
  module.exports = {
    AutomaticDoor: require('./AutomaticDoor.js'),
    Character: require('./Character.js'),
    Damageable: require('./Damageable.js'),
    DamagePropagation: require('./DamagePropagation.js'),
    Door: require('./Door.js'),
    Element: require('./Element.js'),
    Floor: require('./Floor.js'),
    Game: require('./Game.js'),
    LineOfSight: require('./LineOfSight.js'),
    Obstacle: require('./Obstacle.js'),
    PathWalk: require('./PathWalk.js'),
    PersonalWeapon: require('./PersonalWeapon.js'),
    Player: require('./Player.js'),
    Projectile: require('./Projectile.js'),
    RoomGenerator: require('./RoomGenerator.js'),
    ShipWeapon: require('./ShipWeapon.js'),
    Star: require('./Star.js'),
    View: require('./View.js'),
    Action: require('./actions/Action.js'),
    ActionProvider: require('./actions/ActionProvider.js'),
    AttackAction: require('./actions/AttackAction.js'),
    SimpleActionProvider: require('./actions/SimpleActionProvider.js'),
    TargetAction: require('./actions/TargetAction.js'),
    TiledActionProvider: require('./actions/TiledActionProvider.js'),
    WalkAction: require('./actions/WalkAction.js')
  };
}