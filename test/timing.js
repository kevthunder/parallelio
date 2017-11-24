(function() {
  var Timing, assert;

  assert = require('chai').assert;

  Timing = require('../lib/Timing');

  describe('Timing.Timer', function() {
    it('trigger a callback after a time', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(20, callback);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 30);
    });
    it('can trigger a callback in loop', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(20, callback, true, true);
      return setTimeout(function() {
        assert.isTrue(timer.running);
        assert.equal(calls, 2);
        timer.destroy();
        return done();
      }, 50);
    });
    return it('can pause', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(20, callback);
      setTimeout(function() {
        assert.equal(calls, 0);
        assert.isTrue(timer.running);
        timer.pause();
        return assert.isFalse(timer.running);
      }, 10);
      setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 0);
        return timer.unpause();
      }, 30);
      setTimeout(function() {
        assert.isTrue(timer.running);
        return assert.equal(calls, 0);
      }, 40);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 60);
    });
  });

  describe('Timing', function() {
    it('can start 1 timer', function(done) {
      var callback, calls, timer, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing();
      timer = timing.setTimeout(callback, 20);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 30);
    });
    it('can start paused', function(done) {
      var callback, calls, timer, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing(false);
      timer = timing.setTimeout(callback, 20);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 0);
        return done();
      }, 30);
    });
    it('can start many timers', function(done) {
      var callback, calls, timer1, timer2, timer3, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing();
      timer1 = timing.setTimeout(callback, 20);
      timer2 = timing.setTimeout(callback, 20);
      timer3 = timing.setTimeout(callback, 20);
      return setTimeout(function() {
        assert.isFalse(timer1.running);
        assert.isFalse(timer2.running);
        assert.isFalse(timer3.running);
        assert.equal(calls, 3);
        return done();
      }, 30);
    });
    return it('can pause many timers', function(done) {
      var callback, calls, timer1, timer2, timer3, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing();
      timer1 = timing.setTimeout(callback, 20);
      timer2 = timing.setTimeout(callback, 20);
      timer3 = timing.setTimeout(callback, 20);
      setTimeout(function() {
        assert.equal(calls, 0);
        assert.isTrue(timer1.running);
        assert.isTrue(timer2.running);
        assert.isTrue(timer3.running);
        timing.pause();
        assert.isFalse(timer1.running);
        assert.isFalse(timer2.running);
        return assert.isFalse(timer3.running);
      }, 10);
      setTimeout(function() {
        assert.isFalse(timer1.running);
        assert.isFalse(timer2.running);
        assert.isFalse(timer3.running);
        assert.equal(calls, 0);
        return timing.unpause();
      }, 30);
      setTimeout(function() {
        assert.isTrue(timer1.running);
        assert.isTrue(timer2.running);
        assert.isTrue(timer3.running);
        return assert.equal(calls, 0);
      }, 40);
      return setTimeout(function() {
        assert.isFalse(timer1.running);
        assert.isFalse(timer2.running);
        assert.isFalse(timer3.running);
        assert.equal(calls, 3);
        return done();
      }, 60);
    });
  });

}).call(this);
