Action = require('./Action')

class TargetAction extends Action
  @properties
    target: {}
  withTarget: (target)->
    if @target != target
      @copyWith target: target
    else
      this
  canTarget: (target)->
    instance = @withTarget(target)
    if instance.validTarget()
      instance
  validTarget: ()->
    @target?
  isReady: ->
    super() && @validTarget()