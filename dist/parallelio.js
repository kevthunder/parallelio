(function() {
  var Collection, Element, EventBind, Invalidator, Parallelio, PathFinder, Property, PropertyInstance, Spark, Star, Tile, TileContainer, pluck,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof Parallelio === "undefined" || Parallelio === null) {
    Parallelio = {};
  }

  if (typeof Spark === "undefined" || Spark === null) {
    Spark = {};
  }

  EventBind = (function() {
    function EventBind(event1, target1, callback1) {
      this.event = event1;
      this.target = target1;
      this.callback = callback1;
      this.binded = false;
    }

    EventBind.prototype.bind = function() {
      if (!this.binded) {
        if (typeof this.target.addEventListener === 'function') {
          this.target.addEventListener(this.event, this.callback);
        } else if (typeof this.target.addListener === 'function') {
          this.target.addListener(this.event, this.callback);
        } else if (typeof this.target.on === 'function') {
          this.target.on(this.event, this.callback);
        } else {
          throw 'No function to add a event listener found';
        }
      }
      return this.binded = true;
    };

    EventBind.prototype.unbind = function() {
      if (this.binded) {
        if (typeof this.target.removeEventListener === 'function') {
          this.target.removeEventListener(this.event, this.callback);
        } else if (typeof this.target.removeListener === 'function') {
          this.target.removeListener(this.event, this.callback);
        } else if (typeof this.target.off === 'function') {
          this.target.off(this.event, this.callback);
        } else {
          throw 'No function to remove a event listener found';
        }
      }
      return this.binded = false;
    };

    EventBind.prototype.equals = function(eventBind) {
      return eventBind.event === this.event && eventBind.target === this.target && eventBind.callback === this.callback;
    };

    EventBind.prototype.match = function(event, target) {
      return event === this.event && target === this.target;
    };

    return EventBind;

  })();

  if (Spark != null) {
    Spark.EventBind = EventBind;
  }

  pluck = function(arr, fn) {
    var found, index;
    index = arr.findIndex(fn);
    if (index > -1) {
      found = arr[index];
      arr.splice(index, 1);
      return found;
    } else {
      return null;
    }
  };

  Invalidator = (function() {
    function Invalidator(property, obj1) {
      this.property = property;
      this.obj = obj1 != null ? obj1 : null;
      this.invalidationEvents = [];
      this.recycled = [];
      this.invalidateCallback = (function(_this) {
        return function() {
          _this.invalidate();
          return null;
        };
      })(this);
    }

    Invalidator.prototype.invalidate = function() {
      var functName;
      if (typeof this.property.invalidate === "function") {
        return this.property.invalidate();
      } else {
        functName = 'invalidate' + this.property.charAt(0).toUpperCase() + this.property.slice(1);
        if (typeof this.obj[functName] === "function") {
          return this.obj[functName]();
        } else {
          return this.obj[this.property] = null;
        }
      }
    };

    Invalidator.prototype.event = function(event, target) {
      if (target == null) {
        target = this.obj;
      }
      if (!this.invalidationEvents.some(function(eventBind) {
        return eventBind.match(event, target);
      })) {
        return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
          return eventBind.match(event, target);
        }) || new EventBind(event, target, this.invalidateCallback));
      }
    };

    Invalidator.prototype.value = function(val, event, target) {
      if (target == null) {
        target = this.obj;
      }
      this.event(event, target);
      return val;
    };

    Invalidator.prototype.prop = function(prop, target) {
      if (target == null) {
        target = this.obj;
      }
      return this.value(target[prop], prop + 'Changed', target);
    };

    Invalidator.prototype.isEmpty = function() {
      return this.invalidationEvents.length === 0;
    };

    Invalidator.prototype.bind = function() {
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.bind();
      });
    };

    Invalidator.prototype.recycle = function(callback) {
      var done, res;
      this.recycled = this.invalidationEvents;
      this.invalidationEvents = [];
      done = (function(_this) {
        return function() {
          _this.recycled.forEach(function(eventBind) {
            return eventBind.unbind();
          });
          return _this.recycled = [];
        };
      })(this);
      if (typeof callback === "function") {
        if (callback.length > 1) {
          return callback(this, done);
        } else {
          res = callback(this);
          done();
          return res;
        }
      } else {
        return done;
      }
    };

    Invalidator.prototype.unbind = function() {
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.unbind();
      });
    };

    return Invalidator;

  })();

  if (Spark != null) {
    Spark.Invalidator = Invalidator;
  }

  Collection = (function() {
    function Collection(arr) {
      if (arr != null) {
        if (typeof arr.toArray === 'function') {
          this._array = arr.toArray();
        } else if (Array.isArray(arr)) {
          this._array = arr;
        } else {
          this._array = [arr];
        }
      } else {
        this._array = [];
      }
    }

    Collection.prototype.changed = function() {};

    Collection.prototype.get = function(i) {
      return this._array[i];
    };

    Collection.prototype.set = function(i, val) {
      var old;
      if (this._array[i] !== val) {
        old = this.toArray();
        this._array[i] = val;
        this.changed(old);
      }
      return val;
    };

    Collection.prototype.add = function(val) {
      if (!this._array.includes(val)) {
        return this.push(val);
      }
    };

    Collection.prototype.remove = function(val) {
      var index, old;
      index = this._array.indexOf(val);
      if (index !== -1) {
        old = this.toArray();
        this._array.splice(index, 1);
        return this.changed(old);
      }
    };

    Collection.prototype.toArray = function() {
      return this._array.slice();
    };

    Collection.prototype.count = function() {
      return this._array.length;
    };

    Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString'];

    Collection.readListFunctions = ['concat', 'filter', 'slice'];

    Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

    Collection.readFunctions.forEach(function(funct) {
      return Collection.prototype[funct] = function() {
        var arg, ref1;
        arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return (ref1 = this._array)[funct].apply(ref1, arg);
      };
    });

    Collection.readListFunctions.forEach(function(funct) {
      return Collection.prototype[funct] = function() {
        var arg, ref1;
        arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return this.copy((ref1 = this._array)[funct].apply(ref1, arg));
      };
    });

    Collection.writefunctions.forEach(function(funct) {
      return Collection.prototype[funct] = function() {
        var arg, old, ref1, res;
        arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        old = this.toArray();
        res = (ref1 = this._array)[funct].apply(ref1, arg);
        this.changed(old);
        return res;
      };
    });

    Collection.newSubClass = function(fn, arr) {
      var SubClass;
      if (typeof fn === 'object') {
        SubClass = (function(superClass) {
          extend(_Class, superClass);

          function _Class() {
            return _Class.__super__.constructor.apply(this, arguments);
          }

          return _Class;

        })(this);
        Object.assign(SubClass.prototype, fn);
        return new SubClass(arr);
      } else {
        return new this(arr);
      }
    };

    Collection.prototype.copy = function(arr) {
      var coll;
      if (arr == null) {
        arr = this.toArray();
      }
      coll = new this.constructor(arr);
      return coll;
    };

    Collection.prototype.equals = function(arr) {
      return (this.count() === (tyepeof(arr.count === 'function') ? arr.count() : arr.length)) && this.every(function(val, i) {
        return arr[i] === val;
      });
    };

    Collection.prototype.getAddedFrom = function(arr) {
      return this._array.filter(function(item) {
        return !arr.includes(item);
      });
    };

    Collection.prototype.getRemovedFrom = function(arr) {
      return arr.filter((function(_this) {
        return function(item) {
          return !_this.includes(item);
        };
      })(this));
    };

    return Collection;

  })();

  if (Spark != null) {
    Spark.Collection = Collection;
  }

  PropertyInstance = (function() {
    function PropertyInstance(property, obj1) {
      this.property = property;
      this.obj = obj1;
      this.value = this.ingest(this.property.options["default"]);
      this.calculated = false;
    }

    PropertyInstance.prototype.get = function() {
      if (this.property.options.get === false) {
        return void 0;
      } else if (typeof this.property.options.get === 'function') {
        return this.callOptionFunct("get");
      } else {
        if (!this.calculated) {
          this.calcul();
        }
        return this.output();
      }
    };

    PropertyInstance.prototype.set = function(val) {
      var old;
      if (this.property.options.set === false) {
        void 0;
      } else if (typeof this.property.options.set === 'function') {
        this.callOptionFunct("set", val);
      } else {
        val = this.ingest(val);
        if (this.value !== val) {
          old = this.value;
          this.value = val;
          this.changed(old);
        }
      }
      return this;
    };

    PropertyInstance.prototype.invalidate = function() {
      var old;
      if (this.calculated) {
        this.calculated = false;
        if (this.isImmediate()) {
          old = this.value;
          this.get();
          if (this.value !== old) {
            return this.changed(old);
          }
        } else if (this.invalidator != null) {
          return this.invalidator.unbind();
        }
      }
    };

    PropertyInstance.prototype.destroy = function() {
      if (this.invalidator != null) {
        return this.invalidator.unbind();
      }
    };

    PropertyInstance.prototype.callOptionFunct = function() {
      var args, funct;
      funct = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (typeof funct === 'string') {
        funct = this.property.options[funct];
      }
      if (typeof funct.overrided === 'function') {
        args.push((function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.callOptionFunct.apply(_this, [funct.overrided].concat(slice.call(args)));
          };
        })(this));
      }
      return funct.apply(this.obj, args);
    };

    PropertyInstance.prototype.calcul = function() {
      if (typeof this.property.options.calcul === 'function') {
        if (!this.invalidator) {
          this.invalidator = new Invalidator(this, this.obj);
        }
        this.invalidator.recycle((function(_this) {
          return function(invalidator, done) {
            _this.value = _this.callOptionFunct("calcul", invalidator);
            done();
            if (invalidator.isEmpty()) {
              return _this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          };
        })(this));
      }
      this.calculated = true;
      return this.value;
    };

    PropertyInstance.prototype.isACollection = function(val) {
      return this.property.options.collection != null;
    };

    PropertyInstance.prototype.ingest = function(val) {
      if (typeof this.property.options.ingest === 'function') {
        return val = this.callOptionFunct("ingest", val);
      } else if (this.isACollection()) {
        if (val == null) {
          return [];
        } else if (typeof val.toArray === 'function') {
          return val.toArray();
        } else if (Array.isArray(val)) {
          return val.slice();
        } else {
          return [val];
        }
      } else {
        return val;
      }
    };

    PropertyInstance.prototype.output = function() {
      var col, prop;
      if (typeof this.property.options.output === 'function') {
        return this.callOptionFunct("output", this.value);
      } else if (this.isACollection()) {
        prop = this;
        col = Collection.newSubClass(this.property.options.collection, this.value);
        col.changed = function(old) {
          return prop.changed(old);
        };
        return col;
      } else {
        return this.value;
      }
    };

    PropertyInstance.prototype.changed = function(old) {
      if (typeof this.property.options.change === 'function') {
        this.callOptionFunct("change", old);
      }
      if (typeof this.obj.emitEvent === 'function') {
        return this.obj.emitEvent(this.property.getChangeEventName(), [old]);
      }
    };

    PropertyInstance.prototype.isImmediate = function() {
      return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.property.getChangeEventName()).length > 0) || typeof this.property.options.change === 'function');
    };

    return PropertyInstance;

  })();

  if (Spark != null) {
    Spark.PropertyInstance = PropertyInstance;
  }

  Property = (function() {
    function Property(name1, options1) {
      var calculated;
      this.name = name1;
      this.options = options1 != null ? options1 : {};
      calculated = false;
    }

    Property.prototype.bind = function(target) {
      var maj, parent, prop;
      prop = this;
      if (typeof target.getProperty === 'function' && ((parent = target.getProperty(this.name)) != null)) {
        this.override(parent);
      }
      maj = this.name.charAt(0).toUpperCase() + this.name.slice(1);
      Object.defineProperty(target, this.name, {
        configurable: true,
        get: function() {
          return prop.getInstance(this).get();
        },
        set: function(val) {
          return prop.getInstance(this).set(val);
        }
      });
      target['get' + maj] = function() {
        return prop.getInstance(this).get();
      };
      target['set' + maj] = function(val) {
        prop.getInstance(this).set(val);
        return this;
      };
      target['invalidate' + maj] = function() {
        prop.getInstance(this).invalidate();
        return this;
      };
      target._properties = (target._properties || []).concat([prop]);
      if (parent != null) {
        target._properties = target._properties.filter(function(existing) {
          return existing !== parent;
        });
      }
      this.checkFunctions(target);
      this.checkAfterAddListener(target);
      return prop;
    };

    Property.prototype.override = function(parent) {
      var key, ref1, results, value;
      this.options.parent = parent.options;
      ref1 = parent.options;
      results = [];
      for (key in ref1) {
        value = ref1[key];
        if (typeof this.options[key] === 'function' && typeof value === 'function') {
          results.push(this.options[key].overrided = value);
        } else if (typeof this.options[key] === 'undefined') {
          results.push(this.options[key] = value);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Property.prototype.checkFunctions = function(target) {
      var funct, name, ref1, results;
      this.checkAfterAddListener(target);
      ref1 = Property.fn;
      results = [];
      for (name in ref1) {
        funct = ref1[name];
        if (typeof target[name] === 'undefined') {
          results.push(target[name] = funct);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Property.prototype.checkAfterAddListener = function(target) {
      var overrided;
      if (typeof target.addListener === 'function' && typeof target.afterAddListener === 'undefined') {
        target.afterAddListener = Property.optionalFn.afterAddListener;
        overrided = target.addListener;
        target.addListener = function(evt, listener) {
          this.addListener.overrided.call(this, evt, listener);
          return this.afterAddListener(evt);
        };
        return target.addListener.overrided = overrided;
      }
    };

    Property.prototype.getInstanceVarName = function() {
      return this.options.instanceVarName || '_' + this.name;
    };

    Property.prototype.isInstantiated = function(obj) {
      return obj[this.getInstanceVarName()] != null;
    };

    Property.prototype.getInstance = function(obj) {
      var varName;
      varName = this.getInstanceVarName();
      if (!this.isInstantiated(obj)) {
        obj[varName] = new PropertyInstance(this, obj);
      }
      return obj[varName];
    };

    Property.prototype.getChangeEventName = function() {
      return this.options.changeEventName || this.name + 'Changed';
    };

    Property.fn = {
      getProperty: function(name) {
        return this._properties.find(function(prop) {
          return prop.name === name;
        });
      },
      getPropertyInstance: function(name) {
        var res;
        res = this.getProperty(name);
        if (res) {
          return res.getInstance(this);
        }
      },
      getProperties: function() {
        return this._properties.slice();
      },
      getPropertyInstances: function() {
        return this._properties.map((function(_this) {
          return function(prop) {
            return prop.getInstance(_this);
          };
        })(this));
      },
      getInstantiatedProperties: function() {
        return this._properties.filter((function(_this) {
          return function(prop) {
            return prop.isInstantiated(_this);
          };
        })(this)).map((function(_this) {
          return function(prop) {
            return prop.getInstance(_this);
          };
        })(this));
      },
      setProperties: function(data, options) {
        var key, prop, val;
        if (options == null) {
          options = {};
        }
        for (key in data) {
          val = data[key];
          if (((options.whitelist == null) || options.whitelist.indexOf(key) !== -1) && ((options.blacklist == null) || options.blacklist.indexOf(key) === -1)) {
            prop = this.getPropertyInstance(key);
            if (prop != null) {
              prop.set(val);
            }
          }
        }
        return this;
      },
      destroyProperties: function() {
        this.getInstantiatedProperties().forEach((function(_this) {
          return function(prop) {
            return prop.destroy();
          };
        })(this));
        this._properties = [];
        return true;
      }
    };

    Property.optionalFn = {
      afterAddListener: function(event) {
        return this._properties.forEach((function(_this) {
          return function(prop) {
            if (prop.getChangeEventName() === event) {
              return prop.getInstance(_this).get();
            }
          };
        })(this));
      }
    };

    return Property;

  })();

  if (Spark != null) {
    Spark.Property = Property;
  }

  Element = (function() {
    function Element() {}

    Element.elementKeywords = ['extended', 'included'];

    Element.prototype.tap = function(name) {
      var args;
      args = Array.prototype.slice.call(arguments);
      if (typeof name === 'function') {
        name.apply(this, args.slice(1));
      } else {
        this[name].apply(this, args.slice(1));
      }
      return this;
    };

    Element.prototype.callback = function(name) {
      if (this._callbacks == null) {
        this._callbacks = {};
      }
      if (this._callbacks[name] != null) {
        return this._callbacks[name];
      } else {
        return this._callbacks[name] = (function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            _this[name].call(_this, args);
            return null;
          };
        })(this);
      }
    };

    Element.extend = function(obj) {
      var key, ref1, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref1 = obj.extended) != null) {
        ref1.apply(this);
      }
      return this;
    };

    Element.include = function(obj) {
      var key, ref1, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref1 = obj.included) != null) {
        ref1.apply(this);
      }
      return this;
    };

    Element.property = function(prop, desc) {
      return (new Property(prop, desc)).bind(this.prototype);
    };

    Element.properties = function(properties) {
      var desc, prop, results;
      results = [];
      for (prop in properties) {
        desc = properties[prop];
        results.push(this.property(prop, desc));
      }
      return results;
    };

    return Element;

  })();

  if (Spark != null) {
    Spark.Element = Element;
  }

  Star = (function(superClass) {
    extend(Star, superClass);

    function Star(x5, y5) {
      this.x = x5;
      this.y = y5;
      this.init();
    }

    Star.properties({
      x: {},
      y: {},
      links: {
        collection: {
          findStar: function(star) {
            return this.find(function(link) {
              return link.star2 === star || link.star1 === star;
            });
          }
        }
      }
    });

    Star.prototype.init = function() {};

    Star.prototype.linkTo = function(star) {
      if (!this.links.findStar(star)) {
        return this.addLink(new this.constructor.Link(this, star));
      }
    };

    Star.prototype.addLink = function(link) {
      this.links.add(link);
      link.otherStar(this).links.add(link);
      return link;
    };

    Star.prototype.dist = function(x, y) {
      var xDist, yDist;
      xDist = this.x - x;
      yDist = this.y - y;
      return Math.sqrt((xDist * xDist) + (yDist * yDist));
    };

    Star.collenctionFn = {
      closest: function(x, y) {
        var min, minDist;
        min = null;
        minDist = null;
        this.forEach(function(star) {
          var dist;
          dist = star.dist(x, y);
          if ((min == null) || minDist > dist) {
            min = star;
            return minDist = dist;
          }
        });
        return min;
      },
      closests: function(x, y) {
        var dists;
        dists = this.map(function(star) {
          return {
            dist: star.dist(x, y),
            star: star
          };
        });
        dists.sort(function(a, b) {
          return a.dist - b.dist;
        });
        return this.copy(dists.map(function(dist) {
          return dist.star;
        }));
      }
    };

    return Star;

  })(Element);

  Star.Link = (function(superClass) {
    extend(Link, superClass);

    function Link(star1, star2) {
      this.star1 = star1;
      this.star2 = star2;
    }

    Link.prototype.remove = function() {
      this.star1.links.remove(this);
      return this.star2.links.remove(this);
    };

    Link.prototype.otherStar = function(star) {
      if (star === this.star1) {
        return this.star2;
      } else {
        return this.star1;
      }
    };

    Link.prototype.getLength = function() {
      return this.star1.dist(this.star2.x, this.star2.y);
    };

    Link.prototype.inBoundaryBox = function(x, y, padding) {
      var x1, x2, y1, y2;
      if (padding == null) {
        padding = 0;
      }
      x1 = Math.min(this.star1.x, this.star2.x) - padding;
      y1 = Math.min(this.star1.y, this.star2.y) - padding;
      x2 = Math.max(this.star1.x, this.star2.x) + padding;
      y2 = Math.max(this.star1.y, this.star2.y) + padding;
      return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    };

    Link.prototype.closeToPoint = function(x, y, minDist) {
      var a, abDist, abcAngle, abxAngle, acDist, acxAngle, b, c, cdDist, xAbDist, xAcDist, yAbDist, yAcDist;
      if (!this.inBoundaryBox(x, y, minDist)) {
        return false;
      }
      a = this.star1;
      b = this.star2;
      c = {
        "x": x,
        "y": y
      };
      xAbDist = b.x - a.x;
      yAbDist = b.y - a.y;
      abDist = Math.sqrt((xAbDist * xAbDist) + (yAbDist * yAbDist));
      abxAngle = Math.atan(yAbDist / xAbDist);
      xAcDist = c.x - a.x;
      yAcDist = c.y - a.y;
      acDist = Math.sqrt((xAcDist * xAcDist) + (yAcDist * yAcDist));
      acxAngle = Math.atan(yAcDist / xAcDist);
      abcAngle = abxAngle - acxAngle;
      cdDist = Math.abs(Math.sin(abcAngle) * acDist);
      return cdDist <= minDist;
    };

    Link.prototype.intersectLink = function(link) {
      var s, s1_x, s1_y, s2_x, s2_y, t, x1, x2, x3, x4, y1, y2, y3, y4;
      x1 = this.star1.x;
      y1 = this.star1.y;
      x2 = this.star2.x;
      y2 = this.star2.y;
      x3 = link.star1.x;
      y3 = link.star1.y;
      x4 = link.star2.x;
      y4 = link.star2.y;
      s1_x = x2 - x1;
      s1_y = y2 - y1;
      s2_x = x4 - x3;
      s2_y = y4 - y3;
      s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
      t = (s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);
      return s > 0 && s < 1 && t > 0 && t < 1;
    };

    return Link;

  })(Element);

  if (Parallelio != null) {
    Parallelio.Star = Star;
  }

  if (Spark == null) {
    Spark = {};
  }

  PathFinder = (function(superClass) {
    extend(PathFinder, superClass);

    function PathFinder(tilesContainer, from1, to1, options) {
      this.tilesContainer = tilesContainer;
      this.from = from1;
      this.to = to1;
      if (options == null) {
        options = {};
      }
      this.reset();
      if (options.validTile != null) {
        this.validTileCallback = options.validTile;
      }
    }

    PathFinder.properties({
      validTileCallback: {}
    });

    PathFinder.prototype.reset = function() {
      this.queue = [];
      this.paths = {};
      this.solution = null;
      return this.started = false;
    };

    PathFinder.prototype.calcul = function() {
      while (!this.solution && (!this.started || this.queue.length)) {
        this.step();
      }
      return this.getPath();
    };

    PathFinder.prototype.step = function() {
      var next;
      if (this.queue.length) {
        next = this.queue.pop();
        this.addNextSteps(next);
        return true;
      } else if (!this.started) {
        this.started = true;
        this.addNextSteps();
        return true;
      }
    };

    PathFinder.prototype.getPath = function() {
      var res, step;
      if (this.solution) {
        res = [this.solution];
        step = this.solution;
        while (step.prev != null) {
          res.unshift(step.prev);
          step = step.prev;
        }
        return res;
      }
    };

    PathFinder.prototype.getPosAtTime = function(time) {
      var prc, step;
      if (this.solution) {
        if (time >= this.solution.getTotalLength()) {
          return this.solution.posToTileOffset(this.solution.getExit().x, this.solution.getExit().y);
        } else {
          step = this.solution;
          while (step.getStartLength() > time && (step.prev != null)) {
            step = step.prev;
          }
          prc = (time - step.getStartLength()) / step.getLength();
          return step.posToTileOffset(step.getEntry().x + (step.getExit().x - step.getEntry().x) * prc, step.getEntry().y + (step.getExit().y - step.getEntry().y) * prc);
        }
      }
    };

    PathFinder.prototype.tileIsValid = function(tile) {
      if (this.validTileCallback != null) {
        return this.validTileCallback(tile);
      } else {
        return !tile.emulated || (tile.tile !== 0 && tile.tile !== false);
      }
    };

    PathFinder.prototype.getTile = function(x, y) {
      var ref1;
      if (this.tilesContainer.getTile != null) {
        return this.tilesContainer.getTile(x, y);
      } else if (((ref1 = this.tilesContainer[y]) != null ? ref1[x] : void 0) != null) {
        return {
          x: x,
          y: y,
          tile: this.tilesContainer[y][x],
          emulated: true
        };
      }
    };

    PathFinder.prototype.getConnectedToTile = function(tile) {
      var connected, t;
      if (tile.getConnected != null) {
        return tile.getConnected();
      } else {
        connected = [];
        if (t = this.getTile(tile.x + 1, tile.y)) {
          connected.push(t);
        }
        if (t = this.getTile(tile.x - 1, tile.y)) {
          connected.push(t);
        }
        if (t = this.getTile(tile.x, tile.y + 1)) {
          connected.push(t);
        }
        if (t = this.getTile(tile.x, tile.y - 1)) {
          connected.push(t);
        }
        return connected;
      }
    };

    PathFinder.prototype.addNextSteps = function(step) {
      var j, len, next, ref1, results, tile;
      if (step == null) {
        step = null;
      }
      tile = step != null ? step.nextTile : this.from;
      ref1 = this.getConnectedToTile(tile);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        next = ref1[j];
        if (this.tileIsValid(next)) {
          results.push(this.addStep(new PathFinder.Step(this, (step != null ? step : null), tile, next)));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    PathFinder.prototype.tileEqual = function(tileA, tileB) {
      return tileA === tileB || ((tileA.emulated || tileB.emulated) && tileA.x === tileB.x && tileA.y === tileB.y);
    };

    PathFinder.prototype.addStep = function(step) {
      if (this.paths[step.getExit().x] == null) {
        this.paths[step.getExit().x] = {};
      }
      if (!((this.paths[step.getExit().x][step.getExit().y] != null) && this.paths[step.getExit().x][step.getExit().y].getTotalLength() <= step.getTotalLength())) {
        if (this.paths[step.getExit().x][step.getExit().y] != null) {
          this.removeStep(this.paths[step.getExit().x][step.getExit().y]);
        }
        this.paths[step.getExit().x][step.getExit().y] = step;
        this.queue.splice(this.getStepRank(step), 0, step);
        if (this.tileEqual(step.nextTile, this.to) && !((this.solution != null) && this.solution.prev.getTotalLength() <= step.getTotalLength())) {
          return this.solution = new PathFinder.Step(this, step, step.nextTile, null);
        }
      }
    };

    PathFinder.prototype.removeStep = function(step) {
      var index;
      index = this.queue.indexOf(step);
      if (index > -1) {
        return this.queue.splice(index, 1);
      }
    };

    PathFinder.prototype.best = function() {
      return this.queue[this.queue.length - 1];
    };

    PathFinder.prototype.getStepRank = function(step) {
      if (this.queue.length === 0) {
        return 0;
      } else {
        return this._getStepRank(step.getEfficiency(), 0, this.queue.length - 1);
      }
    };

    PathFinder.prototype._getStepRank = function(efficiency, min, max) {
      var ref, refPos;
      refPos = Math.floor((max - min) / 2) + min;
      ref = this.queue[refPos].getEfficiency();
      if (ref === efficiency) {
        return refPos;
      } else if (ref > efficiency) {
        if (refPos === min) {
          return min;
        } else {
          return this._getStepRank(efficiency, min, refPos - 1);
        }
      } else {
        if (refPos === max) {
          return max + 1;
        } else {
          return this._getStepRank(efficiency, refPos + 1, max);
        }
      }
    };

    return PathFinder;

  })(Element);

  PathFinder.Step = (function() {
    function Step(pathFinder, prev, tile1, nextTile) {
      this.pathFinder = pathFinder;
      this.prev = prev;
      this.tile = tile1;
      this.nextTile = nextTile;
    }

    Step.prototype.posToTileOffset = function(x, y) {
      var tile;
      tile = Math.floor(x) === this.tile.x && Math.floor(y) === this.tile.y ? this.tile : Math.floor(x) === this.nextTile.x && Math.floor(y) === this.nextTile.y ? this.nextTile : (this.prev != null) && Math.floor(x) === this.prev.tile.x && Math.floor(y) === this.prev.tile.y ? this.prev.tile : console.log('Math.floor(' + x + ') == ' + this.tile.x, 'Math.floor(' + y + ') == ' + this.tile.y, this);
      return {
        x: x,
        y: y,
        tile: tile,
        offsetX: x - tile.x,
        offsetY: y - tile.y
      };
    };

    Step.prototype.getExit = function() {
      if (this.exit == null) {
        if (this.nextTile != null) {
          this.exit = {
            x: (this.tile.x + this.nextTile.x + 1) / 2,
            y: (this.tile.y + this.nextTile.y + 1) / 2
          };
        } else {
          this.exit = {
            x: this.tile.x + 0.5,
            y: this.tile.y + 0.5
          };
        }
      }
      return this.exit;
    };

    Step.prototype.getEntry = function() {
      if (this.entry == null) {
        if (this.prev != null) {
          this.entry = {
            x: (this.tile.x + this.prev.tile.x + 1) / 2,
            y: (this.tile.y + this.prev.tile.y + 1) / 2
          };
        } else {
          this.entry = {
            x: this.tile.x + 0.5,
            y: this.tile.y + 0.5
          };
        }
      }
      return this.entry;
    };

    Step.prototype.getLength = function() {
      if (this.length == null) {
        this.length = (this.nextTile == null) || (this.prev == null) ? 0.5 : this.prev.tile.x === this.nextTile.x || this.prev.tile.y === this.nextTile.y ? 1 : Math.sqrt(0.5);
      }
      return this.length;
    };

    Step.prototype.getStartLength = function() {
      if (this.startLength == null) {
        this.startLength = this.prev != null ? this.prev.getTotalLength() : 0;
      }
      return this.startLength;
    };

    Step.prototype.getTotalLength = function() {
      if (this.totalLength == null) {
        this.totalLength = this.getStartLength() + this.getLength();
      }
      return this.totalLength;
    };

    Step.prototype.getEfficiency = function() {
      if (this.efficiency == null) {
        this.efficiency = -this.getRemaining() * 1.1 - this.getTotalLength();
      }
      return this.efficiency;
    };

    Step.prototype.getRemaining = function() {
      var from, to, x, y;
      if (this.remaining == null) {
        from = this.getExit();
        to = {
          x: this.pathFinder.to.x + 0.5,
          y: this.pathFinder.to.y + 0.5
        };
        x = to.x - from.x;
        y = to.y - from.y;
        this.remaining = Math.sqrt(x * x + y * y);
      }
      return this.remaining;
    };

    return Step;

  })();

  if (Parallelio != null) {
    Parallelio.PathFinder = PathFinder;
  }

  Tile = (function(superClass) {
    extend(Tile, superClass);

    function Tile(x5, y5) {
      this.x = x5;
      this.y = y5;
      this.init();
    }

    Tile.prototype.init = function() {
      return this.children = [];
    };

    Tile.prototype.getRelativeTile = function(x, y) {
      return this.container.getTile(this.x + x, this.y + y);
    };

    Tile.prototype.addChild = function(child) {
      var index;
      index = this.children.indexOf(child);
      if (index === -1) {
        this.children.push(child);
      }
      child.tile = this;
      return child;
    };

    Tile.prototype.removeChild = function(child) {
      var index;
      index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      if (child.tile === this) {
        return child.tile = null;
      }
    };

    return Tile;

  })(Element);

  if (Parallelio != null) {
    Parallelio.Tile = Tile;
  }

  TileContainer = (function(superClass) {
    extend(TileContainer, superClass);

    function TileContainer() {
      this.init();
    }

    TileContainer.prototype.init = function() {
      this.coords = {};
      return this.tiles = [];
    };

    TileContainer.prototype.addTile = function(tile) {
      this.tiles.push(tile);
      if (this.coords[tile.x] == null) {
        this.coords[tile.x] = {};
      }
      this.coords[tile.x][tile.y] = tile;
      return tile.container = this;
    };

    TileContainer.prototype.getTile = function(x, y) {
      var ref1;
      if (((ref1 = this.coords[x]) != null ? ref1[y] : void 0) != null) {
        return this.coords[x][y];
      }
    };

    TileContainer.prototype.loadMatrix = function(matrix) {
      var options, results, row, tile, x, y;
      results = [];
      for (y in matrix) {
        row = matrix[y];
        results.push((function() {
          var results1;
          results1 = [];
          for (x in row) {
            tile = row[x];
            options = {
              x: parseInt(x),
              y: parseInt(y)
            };
            if (typeof tile === "function") {
              results1.push(this.addTile(tile(options)));
            } else {
              tile.x = options.x;
              tile.y = options.y;
              results1.push(this.addTile(tile));
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    TileContainer.prototype.allTiles = function() {
      return this.tiles.slice();
    };

    TileContainer.prototype.clearAll = function() {
      var j, len, ref1, tile;
      ref1 = this.tiles;
      for (j = 0, len = ref1.length; j < len; j++) {
        tile = ref1[j];
        tile.container = null;
      }
      this.coords = {};
      return this.tiles = [];
    };

    return TileContainer;

  })(Element);

  if (Parallelio != null) {
    Parallelio.TileContainer = TileContainer;
  }

  Parallelio.Element = Spark.Element;

  Parallelio.spark = Spark;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Parallelio;
  } else {
    this.Parallelio = Parallelio;
  }

  Parallelio.strings = {
    "greekAlphabet": ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"],
    "starNames": ["Achernar", "Maia", "Atlas", "Salm", "Alnilam", "Nekkar", "Elnath", "Thuban", "Achird", "Marfik", "Auva", "Sargas", "Alnitak", "Nihal", "Enif", "Torcularis", "Acrux", "Markab", "Avior", "Sarin", "Alphard", "Nunki", "Etamin", "Turais", "Acubens", "Matar", "Azelfafage", "Sceptrum", "Alphekka", "Nusakan", "Fomalhaut", "Tyl", "Adara", "Mebsuta", "Azha", "Scheat", "Alpheratz", "Peacock", "Fornacis", "Unukalhai", "Adhafera", "Megrez", "Azmidiske", "Segin", "Alrai", "Phad", "Furud", "Vega", "Adhil", "Meissa", "Baham", "Seginus", "Alrisha", "Phaet", "Gacrux", "Vindemiatrix", "Agena", "Mekbuda", "Becrux", "Sham", "Alsafi", "Pherkad", "Gianfar", "Wasat", "Aladfar", "Menkalinan", "Beid", "Sharatan", "Alsciaukat", "Pleione", "Gomeisa", "Wezen", "Alathfar", "Menkar", "Bellatrix", "Shaula", "Alshain", "Polaris", "Graffias", "Wezn", "Albaldah", "Menkent", "Betelgeuse", "Shedir", "Alshat", "Pollux", "Grafias", "Yed", "Albali", "Menkib", "Botein", "Sheliak", "Alsuhail", "Porrima", "Grumium", "Yildun", "Albireo", "Merak", "Brachium", "Sirius", "Altair", "Praecipua", "Hadar", "Zaniah", "Alchiba", "Merga", "Canopus", "Situla", "Altarf", "Procyon", "Haedi", "Zaurak", "Alcor", "Merope", "Capella", "Skat", "Alterf", "Propus", "Hamal", "Zavijah", "Alcyone", "Mesarthim", "Caph", "Spica", "Aludra", "Rana", "Hassaleh", "Zibal", "Alderamin", "Metallah", "Castor", "Sterope", "Alula", "Ras", "Heze", "Zosma", "Aldhibah", "Miaplacidus", "Cebalrai", "Sualocin", "Alya", "Rasalgethi", "Hoedus", "Aquarius", "Alfirk", "Minkar", "Celaeno", "Subra", "Alzirr", "Rasalhague", "Homam", "Aries", "Algenib", "Mintaka", "Chara", "Suhail", "Ancha", "Rastaban", "Hyadum", "Cepheus", "Algieba", "Mira", "Chort", "Sulafat", "Angetenar", "Regulus", "Izar", "Cetus", "Algol", "Mirach", "Cursa", "Syrma", "Ankaa", "Rigel", "Jabbah", "Columba", "Algorab", "Miram", "Dabih", "Tabit", "Anser", "Rotanev", "Kajam", "Coma", "Alhena", "Mirphak", "Deneb", "Talitha", "Antares", "Ruchba", "Kaus", "Corona", "Alioth", "Mizar", "Denebola", "Tania", "Arcturus", "Ruchbah", "Keid", "Crux", "Alkaid", "Mufrid", "Dheneb", "Tarazed", "Arkab", "Rukbat", "Kitalpha", "Draco", "Alkalurops", "Muliphen", "Diadem", "Taygeta", "Arneb", "Sabik", "Kocab", "Grus", "Alkes", "Murzim", "Diphda", "Tegmen", "Arrakis", "Sadalachbia", "Kornephoros", "Hydra", "Alkurhah", "Muscida", "Dschubba", "Tejat", "Ascella", "Sadalmelik", "Kraz", "Lacerta", "Almaak", "Naos", "Dsiban", "Terebellum", "Asellus", "Sadalsuud", "Kuma", "Mensa", "Alnair", "Nash", "Dubhe", "Thabit", "Asterope", "Sadr", "Lesath", "Maasym", "Alnath", "Nashira", "Electra", "Theemim", "Atik", "Saiph", "Phoenix", "Norma"]
  };

}).call(this);
