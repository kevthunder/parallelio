assert = require('chai').assert
Timing = require('../lib/Timing')


describe 'Timing.Timer', ->
  it 'trigger a callback after a time', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(20,callback)
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,30
  it 'can trigger a callback in loop', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(20,callback,true,true)
    setTimeout ->
      assert.isTrue timer.running
      assert.equal calls, 2
      timer.destroy()
      done()
    ,50
  it 'can pause', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(20,callback)
    setTimeout ->
      assert.equal calls, 0
      assert.isTrue timer.running
      timer.pause()
      assert.isFalse timer.running
    ,10
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 0
      timer.unpause()
    ,30
    setTimeout ->
      assert.isTrue timer.running
      assert.equal calls, 0
    ,40
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,60

describe 'Timing', ->
  it 'can start 1 timer', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing()
    timer = timing.setTimeout(callback,20)
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,30
  it 'can start paused', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing(false)
    timer = timing.setTimeout(callback,20)
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 0
      done()
    ,30
  it 'can start many timers', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing()
    timer1 = timing.setTimeout(callback,20)
    timer2 = timing.setTimeout(callback,20)
    timer3 = timing.setTimeout(callback,20)
    setTimeout ->
      assert.isFalse timer1.running
      assert.isFalse timer2.running
      assert.isFalse timer3.running
      assert.equal calls, 3
      done()
    ,30
  it 'can pause many timers', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing()
    timer1 = timing.setTimeout(callback,20)
    timer2 = timing.setTimeout(callback,20)
    timer3 = timing.setTimeout(callback,20)
    setTimeout ->
      assert.equal calls, 0
      assert.isTrue timer1.running
      assert.isTrue timer2.running
      assert.isTrue timer3.running
      timing.pause()
      assert.isFalse timer1.running
      assert.isFalse timer2.running
      assert.isFalse timer3.running
    ,10
    setTimeout ->
      assert.isFalse timer1.running
      assert.isFalse timer2.running
      assert.isFalse timer3.running
      assert.equal calls, 0
      timing.unpause()
    ,30
    setTimeout ->
      assert.isTrue timer1.running
      assert.isTrue timer2.running
      assert.isTrue timer3.running
      assert.equal calls, 0
    ,40
    setTimeout ->
      assert.isFalse timer1.running
      assert.isFalse timer2.running
      assert.isFalse timer3.running
      assert.equal calls, 3
      done()
    ,60