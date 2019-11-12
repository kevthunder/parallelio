var ActionProvider, Element;

Element = require('spark-starter').Element;

module.exports = ActionProvider = (function() {
  class ActionProvider extends Element {};

  ActionProvider.properties({
    actions: {
      collection: true,
      composed: true
    },
    owner: {}
  });

  return ActionProvider;

}).call(this);

//# sourceMappingURL=../maps/actions/ActionProvider.js.map
