(function() {
  var Parallelio,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Parallelio = typeof module !== "undefined" && module !== null ? module.exports = {} : (this.Parallelio == null ? this.Parallelio = {} : void 0, this.Parallelio);

  if (Parallelio.Spark == null) {
    Parallelio.Spark = {};
  }

  Parallelio.strings = {
    "greekAlphabet": ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"],
    "starNames": ["Achernar", "Maia", "Atlas", "Salm", "Alnilam", "Nekkar", "Elnath", "Thuban", "Achird", "Marfik", "Auva", "Sargas", "Alnitak", "Nihal", "Enif", "Torcularis", "Acrux", "Markab", "Avior", "Sarin", "Alphard", "Nunki", "Etamin", "Turais", "Acubens", "Matar", "Azelfafage", "Sceptrum", "Alphekka", "Nusakan", "Fomalhaut", "Tyl", "Adara", "Mebsuta", "Azha", "Scheat", "Alpheratz", "Peacock", "Fornacis", "Unukalhai", "Adhafera", "Megrez", "Azmidiske", "Segin", "Alrai", "Phad", "Furud", "Vega", "Adhil", "Meissa", "Baham", "Seginus", "Alrisha", "Phaet", "Gacrux", "Vindemiatrix", "Agena", "Mekbuda", "Becrux", "Sham", "Alsafi", "Pherkad", "Gianfar", "Wasat", "Aladfar", "Menkalinan", "Beid", "Sharatan", "Alsciaukat", "Pleione", "Gomeisa", "Wezen", "Alathfar", "Menkar", "Bellatrix", "Shaula", "Alshain", "Polaris", "Graffias", "Wezn", "Albaldah", "Menkent", "Betelgeuse", "Shedir", "Alshat", "Pollux", "Grafias", "Yed", "Albali", "Menkib", "Botein", "Sheliak", "Alsuhail", "Porrima", "Grumium", "Yildun", "Albireo", "Merak", "Brachium", "Sirius", "Altair", "Praecipua", "Hadar", "Zaniah", "Alchiba", "Merga", "Canopus", "Situla", "Altarf", "Procyon", "Haedi", "Zaurak", "Alcor", "Merope", "Capella", "Skat", "Alterf", "Propus", "Hamal", "Zavijah", "Alcyone", "Mesarthim", "Caph", "Spica", "Aludra", "Rana", "Hassaleh", "Zibal", "Alderamin", "Metallah", "Castor", "Sterope", "Alula", "Ras", "Heze", "Zosma", "Aldhibah", "Miaplacidus", "Cebalrai", "Sualocin", "Alya", "Rasalgethi", "Hoedus", "Aquarius", "Alfirk", "Minkar", "Celaeno", "Subra", "Alzirr", "Rasalhague", "Homam", "Aries", "Algenib", "Mintaka", "Chara", "Suhail", "Ancha", "Rastaban", "Hyadum", "Cepheus", "Algieba", "Mira", "Chort", "Sulafat", "Angetenar", "Regulus", "Izar", "Cetus", "Algol", "Mirach", "Cursa", "Syrma", "Ankaa", "Rigel", "Jabbah", "Columba", "Algorab", "Miram", "Dabih", "Tabit", "Anser", "Rotanev", "Kajam", "Coma", "Alhena", "Mirphak", "Deneb", "Talitha", "Antares", "Ruchba", "Kaus", "Corona", "Alioth", "Mizar", "Denebola", "Tania", "Arcturus", "Ruchbah", "Keid", "Crux", "Alkaid", "Mufrid", "Dheneb", "Tarazed", "Arkab", "Rukbat", "Kitalpha", "Draco", "Alkalurops", "Muliphen", "Diadem", "Taygeta", "Arneb", "Sabik", "Kocab", "Grus", "Alkes", "Murzim", "Diphda", "Tegmen", "Arrakis", "Sadalachbia", "Kornephoros", "Hydra", "Alkurhah", "Muscida", "Dschubba", "Tejat", "Ascella", "Sadalmelik", "Kraz", "Lacerta", "Almaak", "Naos", "Dsiban", "Terebellum", "Asellus", "Sadalsuud", "Kuma", "Mensa", "Alnair", "Nash", "Dubhe", "Thabit", "Asterope", "Sadr", "Lesath", "Maasym", "Alnath", "Nashira", "Electra", "Theemim", "Atik", "Saiph", "Phoenix", "Norma"]
  };

  (function(definition) {
    Parallelio.Spark.Collection = definition();
    return Parallelio.Spark.Collection.definition = definition;
  })(function() {
    var Collection;
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
    return Collection;
  });

  (function(definition) {
    Parallelio.Spark.EventBind = definition();
    return Parallelio.Spark.EventBind.definition = definition;
  })(function() {
    var EventBind;
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
            throw new Error('No function to add event listeners was found');
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
            throw new Error('No function to remove event listeners was found');
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
    return EventBind;
  });

  (function(definition) {
    Parallelio.Spark.Invalidator = definition();
    return Parallelio.Spark.Invalidator.definition = definition;
  })(function(dependencies) {
    var EventBind, Invalidator, pluck;
    if (dependencies == null) {
      dependencies = {};
    }
    EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : Parallelio.Spark.EventBind;
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
      function Invalidator(property1, obj1) {
        this.property = property1;
        this.obj = obj1 != null ? obj1 : null;
        this.invalidationEvents = [];
        this.recycled = [];
        this.unknowns = [];
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

      Invalidator.prototype.unknown = function() {
        if (typeof this.property.unknown === "function") {
          return this.property.unknown();
        } else {
          return this.invalidate();
        }
      };

      Invalidator.prototype.addEventBind = function(event, target, callback) {
        if (!this.invalidationEvents.some(function(eventBind) {
          return eventBind.match(event, target);
        })) {
          return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
            return eventBind.match(event, target);
          }) || new EventBind(event, target, callback));
        }
      };

      Invalidator.prototype.getUnknownCallback = function(prop, target) {
        return (function(_this) {
          return function() {
            if (!_this.unknowns.some(function(unknown) {
              return unknown.prop === prop && unknown.target === target;
            })) {
              _this.unknowns.push({
                "prop": prop,
                "target": target
              });
              return _this.unknown();
            }
          };
        })(this);
      };

      Invalidator.prototype.event = function(event, target) {
        if (target == null) {
          target = this.obj;
        }
        return this.addEventBind(event, target, this.invalidateCallback);
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
        if (typeof prop !== 'string') {
          throw new Error('Property name must be a string');
        }
        this.addEventBind(prop + 'Invalidated', target, this.getUnknownCallback(prop, target));
        return this.value(target[prop], prop + 'Updated', target);
      };

      Invalidator.prototype.propInitiated = function(prop, target) {
        var initiated;
        if (target == null) {
          target = this.obj;
        }
        initiated = target.getPropertyInstance(prop).initiated;
        if (!initiated) {
          this.event(prop + 'Updated', target);
        }
        return initiated;
      };

      Invalidator.prototype.validateUnknowns = function(prop, target) {
        var unknowns;
        if (target == null) {
          target = this.obj;
        }
        unknowns = this.unknowns;
        this.unknowns = [];
        return unknowns.forEach(function(unknown) {
          return unknown.target[unknown.prop];
        });
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
    return Invalidator;
  });

  (function(definition) {
    Parallelio.Spark.PropertyInstance = definition();
    return Parallelio.Spark.PropertyInstance.definition = definition;
  })(function(dependencies) {
    var Invalidator, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    PropertyInstance = (function() {
      function PropertyInstance(property1, obj1) {
        this.property = property1;
        this.obj = obj1;
        this.init();
      }

      PropertyInstance.prototype.init = function() {
        this.value = this.ingest(this.property.options["default"]);
        this.calculated = false;
        this.initiated = typeof this.property.options["default"] !== 'undefined';
        return this.revalidateCallback = (function(_this) {
          return function() {
            return _this.get();
          };
        })(this);
      };

      PropertyInstance.prototype.get = function() {
        var initiated, old;
        if (this.property.options.get === false) {
          return void 0;
        } else if (typeof this.property.options.get === 'function') {
          return this.callOptionFunct("get");
        } else {
          if (this.invalidator) {
            this.invalidator.validateUnknowns();
          }
          if (this.isActive()) {
            if (!this.calculated) {
              old = this.value;
              initiated = this.initiated;
              this.calcul();
              if (this.value !== old) {
                if (initiated) {
                  this.changed(old);
                } else if (typeof this.obj.emitEvent === 'function') {
                  this.obj.emitEvent(this.property.getUpdateEventName(), [old]);
                }
              }
            }
            if (this.pendingChanges) {
              this.changed(this.pendingOld);
            }
            return this.output();
          } else {
            this.initiated = true;
            return void 0;
          }
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
          this.revalidated();
          if (this.value !== val) {
            old = this.value;
            this.value = val;
            this.changed(old);
          }
        }
        return this;
      };

      PropertyInstance.prototype.invalidate = function() {
        if (this.calculated || this.active === false) {
          this.calculated = false;
          if (this._invalidateNotice()) {
            if (this.invalidator != null) {
              this.invalidator.unbind();
            }
          }
        }
        return this;
      };

      PropertyInstance.prototype.unknown = function() {
        if (this.calculated || this.active === false) {
          this._invalidateNotice();
        }
        return this;
      };

      PropertyInstance.prototype._invalidateNotice = function() {
        if (this.isImmediate()) {
          this.get();
          return false;
        } else {
          if (typeof this.obj.emitEvent === 'function') {
            this.obj.emitEvent(this.property.getInvalidateEventName());
          }
          if (this.getUpdater() != null) {
            this.getUpdater().bind();
          }
          return true;
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

      PropertyInstance.prototype.isActive = function() {
        var invalidator;
        if (typeof this.property.options.active === "boolean") {
          return this.property.options.active;
        } else if (typeof this.property.options.active === 'function') {
          invalidator = this.activeInvalidator || new Invalidator(this, this.obj);
          invalidator.recycle((function(_this) {
            return function(invalidator, done) {
              _this.active = _this.callOptionFunct("active", invalidator);
              done();
              if (_this.active || invalidator.isEmpty()) {
                invalidator.unbind();
                return _this.activeInvalidator = null;
              } else {
                _this.invalidator = invalidator;
                _this.activeInvalidator = invalidator;
                return invalidator.bind();
              }
            };
          })(this));
          return this.active;
        } else {
          return true;
        }
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
        this.revalidated();
        return this.value;
      };

      PropertyInstance.prototype.revalidated = function() {
        this.calculated = true;
        this.initiated = true;
        if (this.getUpdater() != null) {
          return this.getUpdater().unbind();
        }
      };

      PropertyInstance.prototype.getUpdater = function() {
        if (typeof this.updater === 'undefined') {
          if (this.property.options.updater != null) {
            this.updater = this.property.options.updater;
            if (typeof this.updater.getBinder === 'function') {
              this.updater = this.updater.getBinder();
            }
            if (typeof this.updater.bind !== 'function' || typeof this.updater.unbind !== 'function') {
              this.updater = null;
            } else {
              this.updater.callback = this.revalidateCallback;
            }
          } else {
            this.updater = null;
          }
        }
        return this.updater;
      };

      PropertyInstance.prototype.ingest = function(val) {
        if (typeof this.property.options.ingest === 'function') {
          return val = this.callOptionFunct("ingest", val);
        } else {
          return val;
        }
      };

      PropertyInstance.prototype.output = function() {
        if (typeof this.property.options.output === 'function') {
          return this.callOptionFunct("output", this.value);
        } else {
          return this.value;
        }
      };

      PropertyInstance.prototype.changed = function(old) {
        if (this.isActive()) {
          this.pendingChanges = false;
          this.pendingOld = void 0;
          if (typeof this.property.options.change === 'function') {
            this.callOptionFunct("change", old);
          }
          if (typeof this.obj.emitEvent === 'function') {
            this.obj.emitEvent(this.property.getUpdateEventName(), [old]);
            this.obj.emitEvent(this.property.getChangeEventName(), [old]);
          }
        } else {
          this.pendingChanges = true;
          if (typeof this.pendingOld === 'undefined') {
            this.pendingOld = old;
          }
        }
        return this;
      };

      PropertyInstance.prototype.isImmediate = function() {
        return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (this.getUpdater() == null) && ((typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.property.getChangeEventName()).length > 0) || typeof this.property.options.change === 'function')));
      };

      PropertyInstance.bind = function(target, prop) {
        var maj;
        maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
        Object.defineProperty(target, prop.name, {
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
        return target['invalidate' + maj] = function() {
          prop.getInstance(this).invalidate();
          return this;
        };
      };

      return PropertyInstance;

    })();
    return PropertyInstance;
  });

  (function(definition) {
    Parallelio.Spark.CollectionProperty = definition();
    return Parallelio.Spark.CollectionProperty.definition = definition;
  })(function(dependencies) {
    var Collection, CollectionProperty, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Parallelio.Spark.PropertyInstance;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Parallelio.Spark.Collection;
    CollectionProperty = (function(superClass) {
      extend(CollectionProperty, superClass);

      function CollectionProperty() {
        return CollectionProperty.__super__.constructor.apply(this, arguments);
      }

      CollectionProperty.prototype.ingest = function(val) {
        if (typeof this.property.options.ingest === 'function') {
          val = this.callOptionFunct("ingest", val);
        }
        if (val == null) {
          return [];
        } else if (typeof val.toArray === 'function') {
          return val.toArray();
        } else if (Array.isArray(val)) {
          return val.slice();
        } else {
          return [val];
        }
      };

      CollectionProperty.prototype.output = function() {
        var col, prop, value;
        value = this.value;
        if (typeof this.property.options.output === 'function') {
          value = this.callOptionFunct("output", this.value);
        }
        prop = this;
        col = Collection.newSubClass(this.property.options.collection, value);
        col.changed = function(old) {
          return prop.changed(old);
        };
        return col;
      };

      return CollectionProperty;

    })(PropertyInstance);
    return CollectionProperty;
  });

  (function(definition) {
    Parallelio.Spark.ComposedProperty = definition();
    return Parallelio.Spark.ComposedProperty.definition = definition;
  })(function(dependencies) {
    var Collection, ComposedProperty, Invalidator, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Parallelio.Spark.PropertyInstance;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Parallelio.Spark.Collection;
    ComposedProperty = (function(superClass) {
      extend(ComposedProperty, superClass);

      function ComposedProperty() {
        return ComposedProperty.__super__.constructor.apply(this, arguments);
      }

      ComposedProperty.prototype.init = function() {
        ComposedProperty.__super__.init.call(this);
        if (this.property.options.hasOwnProperty('default')) {
          this["default"] = this.property.options["default"];
        } else {
          this["default"] = this.value = true;
        }
        this.members = new ComposedProperty.Members(this.property.options.members);
        this.members.changed = (function(_this) {
          return function(old) {
            return _this.invalidate();
          };
        })(this);
        return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options["default"] === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
      };

      ComposedProperty.prototype.calcul = function() {
        if (!this.invalidator) {
          this.invalidator = new Invalidator(this, this.obj);
        }
        this.invalidator.recycle((function(_this) {
          return function(invalidator, done) {
            _this.value = _this.members.reduce(function(prev, member) {
              var val;
              val = typeof member === 'function' ? member(_this.invalidator) : member;
              return _this.join(prev, val);
            }, _this["default"]);
            done();
            if (invalidator.isEmpty()) {
              return _this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          };
        })(this));
        this.revalidated();
        return this.value;
      };

      ComposedProperty.bind = function(target, prop) {
        PropertyInstance.bind(target, prop);
        return Object.defineProperty(target, prop.name + 'Members', {
          configurable: true,
          get: function() {
            return prop.getInstance(this).members;
          }
        });
      };

      ComposedProperty.joinFunctions = {
        and: function(a, b) {
          return a && b;
        },
        or: function(a, b) {
          return a || b;
        }
      };

      return ComposedProperty;

    })(PropertyInstance);
    ComposedProperty.Members = (function(superClass) {
      extend(Members, superClass);

      function Members() {
        return Members.__super__.constructor.apply(this, arguments);
      }

      Members.prototype.addPropertyRef = function(name, obj) {
        var fn;
        if (this.findRefIndex(name, obj) === -1) {
          fn = function(invalidator) {
            return invalidator.prop(name, obj);
          };
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      };

      Members.prototype.addValueRef = function(val, name, obj) {
        var fn;
        if (this.findRefIndex(name, obj) === -1) {
          fn = function(invalidator) {
            return val;
          };
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      };

      Members.prototype.addFunctionRef = function(fn, name, obj) {
        if (this.findRefIndex(name, obj) === -1) {
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      };

      Members.prototype.findRefIndex = function(name, obj) {
        return this._array.findIndex(function(member) {
          return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
        });
      };

      Members.prototype.removeRef = function(name, obj) {
        var index, old;
        index = this.findRefIndex(name, obj);
        if (index !== -1) {
          old = this.toArray();
          this._array.splice(index, 1);
          return this.changed(old);
        }
      };

      return Members;

    })(Collection);
    return ComposedProperty;
  });

  (function(definition) {
    Parallelio.Spark.Property = definition();
    return Parallelio.Spark.Property.definition = definition;
  })(function(dependencies) {
    var CollectionProperty, ComposedProperty, Property, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Parallelio.Spark.PropertyInstance;
    CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : Parallelio.Spark.CollectionProperty;
    ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : Parallelio.Spark.ComposedProperty;
    Property = (function() {
      function Property(name1, options1) {
        var calculated;
        this.name = name1;
        this.options = options1 != null ? options1 : {};
        calculated = false;
      }

      Property.prototype.bind = function(target) {
        var parent, prop;
        prop = this;
        if (!(typeof target.getProperty === 'function' && target.getProperty(this.name) === this)) {
          if (typeof target.getProperty === 'function' && ((parent = target.getProperty(this.name)) != null)) {
            this.override(parent);
          }
          this.getInstanceType().bind(target, prop);
          target._properties = (target._properties || []).concat([prop]);
          if (parent != null) {
            target._properties = target._properties.filter(function(existing) {
              return existing !== parent;
            });
          }
          this.checkFunctions(target);
          this.checkAfterAddListener(target);
        }
        return prop;
      };

      Property.prototype.override = function(parent) {
        var key, ref1, results, value;
        if (this.options.parent == null) {
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
        }
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
        if (typeof target.addListener === 'function' && typeof target.afterAddListener === 'undefined' && typeof target.addListener.overrided === 'undefined') {
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
        var Type, varName;
        varName = this.getInstanceVarName();
        if (!this.isInstantiated(obj)) {
          Type = this.getInstanceType();
          obj[varName] = new Type(this, obj);
        }
        return obj[varName];
      };

      Property.prototype.getInstanceType = function() {
        if (this.options.composed != null) {
          return ComposedProperty;
        }
        if (this.options.collection != null) {
          return CollectionProperty;
        }
        return PropertyInstance;
      };

      Property.prototype.getChangeEventName = function() {
        return this.options.changeEventName || this.name + 'Changed';
      };

      Property.prototype.getUpdateEventName = function() {
        return this.options.changeEventName || this.name + 'Updated';
      };

      Property.prototype.getInvalidateEventName = function() {
        return this.options.changeEventName || this.name + 'Invalidated';
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
    return Property;
  });

  (function(definition) {
    Parallelio.Spark.Element = definition();
    return Parallelio.Spark.Element.definition = definition;
  })(function(dependencies) {
    var Element, Property;
    if (dependencies == null) {
      dependencies = {};
    }
    Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : Parallelio.Spark.Property;
    Element = (function() {
      function Element() {}

      Element.elementKeywords = ['extended', 'included', '__super__', 'constructor'];

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
        if (obj.prototype != null) {
          this.include(obj.prototype);
        }
        if ((ref1 = obj.extended) != null) {
          ref1.apply(this);
        }
        return this;
      };

      Element.include = function(obj) {
        var k, key, len, property, ref1, value;
        for (key in obj) {
          value = obj[key];
          if (indexOf.call(Element.elementKeywords, key) < 0) {
            if (key === '_properties') {
              for (k = 0, len = value.length; k < len; k++) {
                property = value[k];
                property.bind(this.prototype);
              }
            } else {
              this.prototype[key] = value;
            }
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
    return Element;
  });

  (function(definition) {
    Parallelio.Damageable = definition();
    return Parallelio.Damageable.definition = definition;
  })(function(dependencies) {
    var Damageable, Element;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Damageable = (function(superClass) {
      extend(Damageable, superClass);

      function Damageable() {
        return Damageable.__super__.constructor.apply(this, arguments);
      }

      Damageable.properties({
        damageable: {
          "default": true
        },
        maxHealth: {
          "default": 1000
        },
        health: {
          "default": 1000,
          change: function() {
            if (this.health === 0) {
              return this.whenNoHealth();
            }
          }
        }
      });

      Damageable.prototype.damage = function(val) {
        return this.health = Math.max(0, this.health - val);
      };

      Damageable.prototype.whenNoHealth = function() {};

      return Damageable;

    })(Element);
    return Damageable;
  });

  (function(definition) {
    Parallelio.Direction = definition();
    return Parallelio.Direction.definition = definition;
  })(function() {
    var Direction;
    Direction = (function() {
      function Direction(name1, x5, y5, inverseName) {
        this.name = name1;
        this.x = x5;
        this.y = y5;
        this.inverseName = inverseName;
      }

      Direction.prototype.getInverse = function() {
        return this.constructor[this.inverseName];
      };

      return Direction;

    })();
    Direction.up = new Direction('up', 0, -1, 'down');
    Direction.down = new Direction('down', 0, 1, 'up');
    Direction.left = new Direction('left', -1, 0, 'right');
    Direction.right = new Direction('right', 1, 0, 'left');
    Direction.adjacents = [Direction.up, Direction.down, Direction.left, Direction.right];
    Direction.topLeft = new Direction('topLeft', -1, -1, 'bottomRight');
    Direction.topRight = new Direction('topRight', 1, -1, 'bottomLeft');
    Direction.bottomRight = new Direction('bottomRight', 1, 1, 'topLeft');
    Direction.bottomLeft = new Direction('bottomLeft', -1, 1, 'topRight');
    Direction.corners = [Direction.topLeft, Direction.topRight, Direction.bottomRight, Direction.bottomLeft];
    Direction.all = [Direction.up, Direction.down, Direction.left, Direction.right, Direction.topLeft, Direction.topRight, Direction.bottomRight, Direction.bottomLeft];
    return Direction;
  });

  (function(definition) {
    Parallelio.LineOfSight = definition();
    return Parallelio.LineOfSight.definition = definition;
  })(function() {
    var LineOfSight;
    LineOfSight = (function() {
      function LineOfSight(tiles1, x11, y11, x21, y21) {
        this.tiles = tiles1;
        this.x1 = x11 != null ? x11 : 0;
        this.y1 = y11 != null ? y11 : 0;
        this.x2 = x21 != null ? x21 : 0;
        this.y2 = y21 != null ? y21 : 0;
      }

      LineOfSight.prototype.setX1 = function(val) {
        this.x1 = val;
        return this.invalidade();
      };

      LineOfSight.prototype.setY1 = function(val) {
        this.y1 = val;
        return this.invalidade();
      };

      LineOfSight.prototype.setX2 = function(val) {
        this.x2 = val;
        return this.invalidade();
      };

      LineOfSight.prototype.setY2 = function(val) {
        this.y2 = val;
        return this.invalidade();
      };

      LineOfSight.prototype.invalidade = function() {
        this.endPoint = null;
        this.success = null;
        return this.calculated = false;
      };

      LineOfSight.prototype.testTile = function(tile, entryX, entryY) {
        if (this.traversableCallback != null) {
          return this.traversableCallback(tile, entryX, entryY);
        } else {
          return (tile != null) && (typeof tile.getTransparent === 'function' ? tile.getTransparent() : typeof tile.transparent !== void 0 ? tile.transparent : true);
        }
      };

      LineOfSight.prototype.testTileAt = function(x, y, entryX, entryY) {
        return this.testTile(this.tiles.getTile(Math.floor(x), Math.floor(y)), entryX, entryY);
      };

      LineOfSight.prototype.calcul = function() {
        var nextX, nextY, positiveX, positiveY, ratio, tileX, tileY, total, x, y;
        ratio = (this.x2 - this.x1) / (this.y2 - this.y1);
        total = Math.abs(this.x2 - this.x1) + Math.abs(this.y2 - this.y1);
        positiveX = (this.x2 - this.x1) >= 0;
        positiveY = (this.y2 - this.y1) >= 0;
        tileX = x = this.x1;
        tileY = y = this.y1;
        while (total > Math.abs(x - this.x1) + Math.abs(y - this.y1) && this.testTileAt(tileX, tileY, x, y)) {
          nextX = positiveX ? Math.floor(x) + 1 : Math.ceil(x) - 1;
          nextY = positiveY ? Math.floor(y) + 1 : Math.ceil(y) - 1;
          if (this.x2 - this.x1 === 0) {
            y = nextY;
          } else if (this.y2 - this.y1 === 0) {
            x = nextX;
          } else if (Math.abs((nextX - x) / (this.x2 - this.x1)) < Math.abs((nextY - y) / (this.y2 - this.y1))) {
            x = nextX;
            y = (nextX - this.x1) / ratio + this.y1;
          } else {
            x = (nextY - this.y1) * ratio + this.x1;
            y = nextY;
          }
          tileX = positiveX ? x : Math.ceil(x) - 1;
          tileY = positiveY ? y : Math.ceil(y) - 1;
        }
        if (total <= Math.abs(x - this.x1) + Math.abs(y - this.y1)) {
          this.endPoint = {
            x: this.x2,
            y: this.y2,
            tile: this.tiles.getTile(Math.floor(this.x2), Math.floor(this.y2))
          };
          return this.success = true;
        } else {
          this.endPoint = {
            x: x,
            y: y,
            tile: this.tiles.getTile(Math.floor(tileX), Math.floor(tileY))
          };
          return this.success = false;
        }
      };

      LineOfSight.prototype.getSuccess = function() {
        if (!this.calculated) {
          this.calcul();
        }
        return this.success;
      };

      LineOfSight.prototype.getEndPoint = function() {
        if (!this.calculated) {
          this.calcul();
        }
        return this.endPoint;
      };

      return LineOfSight;

    })();
    return LineOfSight;
  });

  (function(definition) {
    Parallelio.DamagePropagation = definition();
    return Parallelio.DamagePropagation.definition = definition;
  })(function(dependencies) {
    var DamagePropagation, Direction, Element, LineOfSight;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : Parallelio.LineOfSight;
    Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : Parallelio.Direction;
    DamagePropagation = (function(superClass) {
      extend(DamagePropagation, superClass);

      function DamagePropagation(options) {
        this.setProperties(options);
      }

      DamagePropagation.properties({
        tile: {
          "default": null
        },
        power: {
          "default": 10
        },
        range: {
          "default": 1
        },
        type: {
          "default": null
        }
      });

      DamagePropagation.prototype.getTileContainer = function() {
        return this.tile.container;
      };

      DamagePropagation.prototype.apply = function() {
        var damage, k, len, ref1, results;
        ref1 = this.getDamaged();
        results = [];
        for (k = 0, len = ref1.length; k < len; k++) {
          damage = ref1[k];
          results.push(damage.target.damage(damage.damage));
        }
        return results;
      };

      DamagePropagation.prototype.getInitialTiles = function() {
        var ctn;
        ctn = this.getTileContainer();
        return ctn.inRange(this.tile, this.range);
      };

      DamagePropagation.prototype.getInitialDamages = function() {
        var damages, dmg, k, len, tile, tiles;
        damages = [];
        tiles = this.getInitialTiles();
        for (k = 0, len = tiles.length; k < len; k++) {
          tile = tiles[k];
          if (tile.damageable && (dmg = this.initialDamage(tile, tiles.length))) {
            damages.push(dmg);
          }
        }
        return damages;
      };

      DamagePropagation.prototype.getDamaged = function() {
        var added;
        if (this._damaged == null) {
          added = null;
          while (added = this.step(added)) {
            true;
          }
        }
        return this._damaged;
      };

      DamagePropagation.prototype.step = function(added) {
        if (added != null) {
          if (this.extendedDamage != null) {
            added = this.extend(added);
            this._damaged = added.concat(this._damaged);
            return added.length > 0 && added;
          }
        } else {
          return this._damaged = this.getInitialDamages();
        }
      };

      DamagePropagation.prototype.inDamaged = function(target, damaged) {
        var damage, index, k, len;
        for (index = k = 0, len = damaged.length; k < len; index = ++k) {
          damage = damaged[index];
          if (damage.target === target) {
            return index;
          }
        }
        return false;
      };

      DamagePropagation.prototype.extend = function(damaged) {
        var added, ctn, damage, dir, dmg, existing, k, l, len, len1, len2, local, m, ref1, target, tile;
        ctn = this.getTileContainer();
        added = [];
        for (k = 0, len = damaged.length; k < len; k++) {
          damage = damaged[k];
          local = [];
          if (damage.target.x != null) {
            ref1 = Direction.adjacents;
            for (l = 0, len1 = ref1.length; l < len1; l++) {
              dir = ref1[l];
              tile = ctn.getTile(damage.target.x + dir.x, damage.target.y + dir.y);
              if ((tile != null) && tile.damageable && this.inDamaged(tile, this._damaged) === false) {
                local.push(tile);
              }
            }
          }
          for (m = 0, len2 = local.length; m < len2; m++) {
            target = local[m];
            if (dmg = this.extendedDamage(target, damage, local.length)) {
              if ((existing = this.inDamaged(target, added)) === false) {
                added.push(dmg);
              } else {
                added[existing] = this.mergeDamage(added[existing], dmg);
              }
            }
          }
        }
        return added;
      };

      DamagePropagation.prototype.mergeDamage = function(d1, d2) {
        return {
          target: d1.target,
          power: d1.power + d2.power,
          damage: d1.damage + d2.damage
        };
      };

      DamagePropagation.prototype.modifyDamage = function(target, power) {
        if (typeof target.modifyDamage === 'function') {
          return Math.floor(target.modifyDamage(power, this.type));
        } else {
          return Math.floor(power);
        }
      };

      return DamagePropagation;

    })(Element);
    DamagePropagation.Normal = (function(superClass) {
      extend(Normal, superClass);

      function Normal() {
        return Normal.__super__.constructor.apply(this, arguments);
      }

      Normal.prototype.initialDamage = function(target, nb) {
        var dmg;
        dmg = this.modifyDamage(target, this.power);
        if (dmg > 0) {
          return {
            target: target,
            power: this.power,
            damage: dmg
          };
        }
      };

      return Normal;

    })(DamagePropagation);
    DamagePropagation.Thermic = (function(superClass) {
      extend(Thermic, superClass);

      function Thermic() {
        return Thermic.__super__.constructor.apply(this, arguments);
      }

      Thermic.prototype.extendedDamage = function(target, last, nb) {
        var dmg, power;
        power = (last.damage - 1) / 2 / nb * Math.min(1, last.target.health / last.target.maxHealth * 5);
        dmg = this.modifyDamage(target, power);
        if (dmg > 0) {
          return {
            target: target,
            power: power,
            damage: dmg
          };
        }
      };

      Thermic.prototype.initialDamage = function(target, nb) {
        var dmg, power;
        power = this.power / nb;
        dmg = this.modifyDamage(target, power);
        if (dmg > 0) {
          return {
            target: target,
            power: power,
            damage: dmg
          };
        }
      };

      return Thermic;

    })(DamagePropagation);
    DamagePropagation.Kinetic = (function(superClass) {
      extend(Kinetic, superClass);

      function Kinetic() {
        return Kinetic.__super__.constructor.apply(this, arguments);
      }

      Kinetic.prototype.extendedDamage = function(target, last, nb) {
        var dmg, power;
        power = (last.power - last.damage) * Math.min(1, last.target.health / last.target.maxHealth * 2) - 1;
        dmg = this.modifyDamage(target, power);
        if (dmg > 0) {
          return {
            target: target,
            power: power,
            damage: dmg
          };
        }
      };

      Kinetic.prototype.initialDamage = function(target, nb) {
        var dmg;
        dmg = this.modifyDamage(target, this.power);
        if (dmg > 0) {
          return {
            target: target,
            power: this.power,
            damage: dmg
          };
        }
      };

      Kinetic.prototype.modifyDamage = function(target, power) {
        if (typeof target.modifyDamage === 'function') {
          return Math.floor(target.modifyDamage(power, this.type));
        } else {
          return Math.floor(power * 0.25);
        }
      };

      Kinetic.prototype.mergeDamage = function(d1, d2) {
        return {
          target: d1.target,
          power: Math.floor((d1.power + d2.power) / 2),
          damage: Math.floor((d1.damage + d2.damage) / 2)
        };
      };

      return Kinetic;

    })(DamagePropagation);
    DamagePropagation.Explosive = (function(superClass) {
      extend(Explosive, superClass);

      function Explosive() {
        return Explosive.__super__.constructor.apply(this, arguments);
      }

      Explosive.properties({
        rng: {
          "default": Math.random
        },
        traversableCallback: {
          "default": function(tile) {
            return !(typeof tile.getSolid === 'function' && tile.getSolid());
          }
        }
      });

      Explosive.prototype.getDamaged = function() {
        var angle, inside, k, ref1, shard, shardPower, shards, target;
        this._damaged = [];
        shards = Math.pow(this.range + 1, 2);
        shardPower = this.power / shards;
        inside = this.tile.health <= this.modifyDamage(this.tile, shardPower);
        if (inside) {
          shardPower *= 4;
        }
        for (shard = k = 0, ref1 = shards; 0 <= ref1 ? k <= ref1 : k >= ref1; shard = 0 <= ref1 ? ++k : --k) {
          angle = this.rng() * Math.PI * 2;
          target = this.getTileHitByShard(inside, angle);
          if (target != null) {
            this._damaged.push({
              target: target,
              power: shardPower,
              damage: this.modifyDamage(target, shardPower)
            });
          }
        }
        return this._damaged;
      };

      Explosive.prototype.getTileHitByShard = function(inside, angle) {
        var ctn, dist, target, vertex;
        ctn = this.getTileContainer();
        dist = this.range * this.rng();
        target = {
          x: this.tile.x + 0.5 + dist * Math.cos(angle),
          y: this.tile.y + 0.5 + dist * Math.sin(angle)
        };
        if (inside) {
          vertex = new LineOfSight(ctn, this.tile.x + 0.5, this.tile.y + 0.5, target.x, target.y);
          vertex.traversableCallback = (function(_this) {
            return function(tile) {
              return !inside || ((tile != null) && _this.traversableCallback(tile));
            };
          })(this);
          return vertex.getEndPoint().tile;
        } else {
          return ctn.getTile(Math.floor(target.x), Math.floor(target.y));
        }
      };

      return Explosive;

    })(DamagePropagation);
    return DamagePropagation;
  });

  (function(definition) {
    Parallelio.Tile = definition();
    return Parallelio.Tile.definition = definition;
  })(function(dependencies) {
    var Element, Tile;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
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

      Tile.prototype.dist = function(tile) {
        var ctnDist, ref1, x, y;
        if (((tile != null ? tile.x : void 0) != null) && (tile.y != null) && (this.x != null) && (this.y != null) && (this.container === tile.container || (ctnDist = (ref1 = this.container) != null ? typeof ref1.dist === "function" ? ref1.dist(tile.container) : void 0 : void 0))) {
          x = tile.x - this.x;
          y = tile.y - this.y;
          if (ctnDist) {
            x += ctnDist.x;
            y += ctnDist.y;
          }
          return {
            x: x,
            y: y,
            length: Math.sqrt(x * x + y * y)
          };
        } else {
          return null;
        }
      };

      return Tile;

    })(Element);
    return Tile;
  });

  (function(definition) {
    Parallelio.Door = definition();
    return Parallelio.Door.definition = definition;
  })(function(dependencies) {
    var Door, Tiled;
    if (dependencies == null) {
      dependencies = {};
    }
    Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : Parallelio.Tile;
    Door = (function(superClass) {
      extend(Door, superClass);

      function Door(direction1) {
        this.direction = direction1 != null ? direction1 : Door.directions.horizontal;
        Door.__super__.constructor.call(this);
      }

      Door.properties({
        tile: {
          change: function(old, overrided) {
            var ref1, ref2, ref3, ref4;
            overrided();
            if (old != null) {
              if ((ref1 = old.walkableMembers) != null) {
                ref1.removeRef('open', this);
              }
              if ((ref2 = old.transparentMembers) != null) {
                ref2.removeRef('open', this);
              }
            }
            if (this.tile) {
              if ((ref3 = this.tile.walkableMembers) != null) {
                ref3.addPropertyRef('open', this);
              }
              return (ref4 = this.tile.transparentMembers) != null ? ref4.addPropertyRef('open', this) : void 0;
            }
          }
        },
        open: {
          "default": false
        },
        direction: {}
      });

      Door.directions = {
        horizontal: 'horizontal',
        vertical: 'vertical'
      };

      return Door;

    })(Tiled);
    return Door;
  });

  (function(definition) {
    Parallelio.Element = definition();
    return Parallelio.Element.definition = definition;
  })(function(dependencies) {
    var Element;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    return Element;
  });

  (function(definition) {
    Parallelio.Floor = definition();
    return Parallelio.Floor.definition = definition;
  })(function(dependencies) {
    var Floor, Tile;
    if (dependencies == null) {
      dependencies = {};
    }
    Tile = dependencies.hasOwnProperty("Tile") ? dependencies.Tile : Parallelio.Tile;
    Floor = (function(superClass) {
      extend(Floor, superClass);

      function Floor() {
        return Floor.__super__.constructor.apply(this, arguments);
      }

      Floor.properties({
        walkable: {
          composed: true
        },
        transparent: {
          composed: true
        }
      });

      return Floor;

    })(Tile);
    return Floor;
  });

  (function(definition) {
    Parallelio.Timing = definition();
    return Parallelio.Timing.definition = definition;
  })(function() {
    var Timing;
    Timing = (function() {
      function Timing(running) {
        this.running = running != null ? running : true;
        this.children = [];
      }

      Timing.prototype.addChild = function(child) {
        var index;
        index = this.children.indexOf(child);
        if (index === -1) {
          this.children.push(child);
        }
        child.parent = this;
        return this;
      };

      Timing.prototype.removeChild = function(child) {
        var index;
        index = this.children.indexOf(child);
        if (index > -1) {
          this.children.splice(index, 1);
        }
        if (child.parent === this) {
          child.parent = null;
        }
        return this;
      };

      Timing.prototype.toggle = function(val) {
        if (typeof val === "undefined") {
          val = !this.running;
        }
        this.running = val;
        return this.children.forEach(function(child) {
          return child.toggle(val);
        });
      };

      Timing.prototype.setTimeout = function(callback, time) {
        var timer;
        timer = new this.constructor.Timer(time, callback, this.running);
        this.addChild(timer);
        return timer;
      };

      Timing.prototype.setInterval = function(callback, time) {
        var timer;
        timer = new this.constructor.Timer(time, callback, this.running, true);
        this.addChild(timer);
        return timer;
      };

      Timing.prototype.pause = function() {
        return this.toggle(false);
      };

      Timing.prototype.unpause = function() {
        return this.toggle(true);
      };

      return Timing;

    })();
    Timing.Timer = (function() {
      function Timer(time1, callback1, running, repeat) {
        this.time = time1;
        this.callback = callback1;
        this.running = running != null ? running : true;
        this.repeat = repeat != null ? repeat : false;
        this.remainingTime = this.time;
        if (this.running) {
          this._start();
        }
      }

      Timer.now = function() {
        var ref1;
        if ((typeof window !== "undefined" && window !== null ? (ref1 = window.performance) != null ? ref1.now : void 0 : void 0) != null) {
          return window.performance.now();
        } else if ((typeof process !== "undefined" && process !== null ? process.uptime : void 0) != null) {
          return process.uptime() * 1000;
        } else {
          return Date.now();
        }
      };

      Timer.prototype.toggle = function(val) {
        if (typeof val === "undefined") {
          val = !this.running;
        }
        if (val) {
          return this._start();
        } else {
          return this._stop();
        }
      };

      Timer.prototype.pause = function() {
        return this.toggle(false);
      };

      Timer.prototype.unpause = function() {
        return this.toggle(true);
      };

      Timer.prototype.getElapsedTime = function() {
        if (this.running) {
          return this.constructor.now() - this.startTime;
        } else {
          return this.time - this.remainingTime;
        }
      };

      Timer.prototype.getPrc = function() {
        return this.getElapsedTime() / this.time;
      };

      Timer.prototype._start = function() {
        this.running = true;
        this.startTime = this.constructor.now();
        if (this.repeat && !this.interupted) {
          return this.id = setInterval(this.tick.bind(this), this.remainingTime);
        } else {
          return this.id = setTimeout(this.tick.bind(this), this.remainingTime);
        }
      };

      Timer.prototype._stop = function() {
        var wasInterupted;
        wasInterupted = this.interupted;
        this.running = false;
        this.remainingTime = this.time - (this.constructor.now() - this.startTime);
        this.interupted = this.remainingTime !== this.time;
        if (this.repeat && !wasInterupted) {
          return clearInterval(this.id);
        } else {
          return clearTimeout(this.id);
        }
      };

      Timer.prototype.tick = function() {
        var wasInterupted;
        wasInterupted = this.interupted;
        this.interupted = false;
        this.remainingTime = this.time;
        if (this.callback != null) {
          this.callback();
        }
        if (this.repeat) {
          if (wasInterupted) {
            return this._start();
          } else {
            return this.startTime = this.constructor.now();
          }
        } else {
          return this.destroy();
        }
      };

      Timer.prototype.destroy = function() {
        this.running = false;
        if (this.parent) {
          return this.parent.removeChild(this);
        }
      };

      return Timer;

    })();
    return Timing;
  });

  (function(definition) {
    Parallelio.Projectile = definition();
    return Parallelio.Projectile.definition = definition;
  })(function(dependencies) {
    var Element, Projectile, Timing;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : Parallelio.Timing;
    Projectile = (function(superClass) {
      extend(Projectile, superClass);

      function Projectile(options) {
        this.setProperties(options);
        this.init();
      }

      Projectile.prototype.init = function() {};

      Projectile.properties({
        origin: {
          "default": null
        },
        target: {
          "default": null
        },
        power: {
          "default": 10
        },
        blastRange: {
          "default": 1
        },
        propagationType: {
          "default": null
        },
        speed: {
          "default": 10
        },
        pathLength: {
          calcul: function() {
            var dist, originTile, targetTile;
            if ((this.origin != null) && (this.target != null)) {
              originTile = this.origin.tile || this.origin;
              targetTile = this.target.tile || this.target;
              dist = originTile.dist(targetTile);
              if (dist) {
                return dist.length;
              }
            }
            return 100;
          }
        },
        timing: {
          calcul: function() {
            return new Timing();
          }
        },
        moving: {
          "default": false
        }
      });

      Projectile.prototype.launch = function() {
        this.moving = true;
        return this.pathTimeout = this.timing.setTimeout((function(_this) {
          return function() {
            _this.deliverPayload();
            return _this.moving = false;
          };
        })(this), this.pathLength / this.speed * 1000);
      };

      Projectile.prototype.deliverPayload = function() {
        var payload;
        payload = new this.propagationType({
          tile: this.target.tile || this.target,
          power: this.power,
          range: this.blastRange
        });
        payload.apply();
        this.payloadDelivered();
        return payload;
      };

      Projectile.prototype.payloadDelivered = function() {
        return this.destroy();
      };

      Projectile.prototype.destroy = function() {};

      return Projectile;

    })(Element);
    return Projectile;
  });

  (function(definition) {
    Parallelio.TileContainer = definition();
    return Parallelio.TileContainer.definition = definition;
  })(function(dependencies) {
    var Element, TileContainer;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    TileContainer = (function(superClass) {
      extend(TileContainer, superClass);

      function TileContainer() {
        this.init();
      }

      TileContainer.properties({
        boundaries: {
          calcul: function() {
            var boundaries;
            boundaries = {
              top: null,
              left: null,
              bottom: null,
              right: null
            };
            this.tiles.forEach((function(_this) {
              return function(tile) {
                return _this._addToBondaries(tile, boundaries);
              };
            })(this));
            return boundaries;
          },
          output: function(val) {
            return Object.assign(val);
          }
        }
      });

      TileContainer.prototype._addToBondaries = function(tile, boundaries) {
        if ((boundaries.top == null) || tile.y < boundaries.top) {
          boundaries.top = tile.y;
        }
        if ((boundaries.left == null) || tile.x < boundaries.left) {
          boundaries.left = tile.x;
        }
        if ((boundaries.bottom == null) || tile.y > boundaries.bottom) {
          boundaries.bottom = tile.y;
        }
        if ((boundaries.right == null) || tile.x > boundaries.right) {
          return boundaries.right = tile.x;
        }
      };

      TileContainer.prototype.init = function() {
        this.coords = {};
        return this.tiles = [];
      };

      TileContainer.prototype.addTile = function(tile) {
        var ref1;
        if (!this.tiles.includes(tile)) {
          this.tiles.push(tile);
          if (this.coords[tile.x] == null) {
            this.coords[tile.x] = {};
          }
          this.coords[tile.x][tile.y] = tile;
          tile.container = this;
          if ((ref1 = this._boundaries) != null ? ref1.calculated : void 0) {
            this._addToBondaries(tile, this._boundaries.value);
          }
        }
        return this;
      };

      TileContainer.prototype.removeTile = function(tile) {
        var index, ref1;
        index = this.tiles.indexOf(tile);
        if (index > -1) {
          this.tiles.splice(index, 1);
          delete this.coords[tile.x][tile.y];
          tile.container = null;
          if ((ref1 = this._boundaries) != null ? ref1.calculated : void 0) {
            if (this.boundaries.top === tile.y || this.boundaries.bottom === tile.y || this.boundaries.left === tile.x || this.boundaries.right === tile.x) {
              return this.invalidateBoundaries();
            }
          }
        }
      };

      TileContainer.prototype.removeTileAt = function(x, y) {
        var tile;
        if (tile = this.getTile(x, y)) {
          return this.removeTile(tile);
        }
      };

      TileContainer.prototype.getTile = function(x, y) {
        var ref1;
        if (((ref1 = this.coords[x]) != null ? ref1[y] : void 0) != null) {
          return this.coords[x][y];
        }
      };

      TileContainer.prototype.loadMatrix = function(matrix) {
        var options, row, tile, x, y;
        for (y in matrix) {
          row = matrix[y];
          for (x in row) {
            tile = row[x];
            options = {
              x: parseInt(x),
              y: parseInt(y)
            };
            if (typeof tile === "function") {
              this.addTile(tile(options));
            } else {
              tile.x = options.x;
              tile.y = options.y;
              this.addTile(tile);
            }
          }
        }
        return this;
      };

      TileContainer.prototype.inRange = function(tile, range) {
        var found, k, l, ref1, ref2, ref3, ref4, tiles, x, y;
        tiles = [];
        range--;
        for (x = k = ref1 = tile.x - range, ref2 = tile.x + range; ref1 <= ref2 ? k <= ref2 : k >= ref2; x = ref1 <= ref2 ? ++k : --k) {
          for (y = l = ref3 = tile.y - range, ref4 = tile.y + range; ref3 <= ref4 ? l <= ref4 : l >= ref4; y = ref3 <= ref4 ? ++l : --l) {
            if (Math.sqrt((x - tile.x) * (x - tile.x) + (y - tile.y) * (y - tile.y)) <= range && ((found = this.getTile(x, y)) != null)) {
              tiles.push(found);
            }
          }
        }
        return tiles;
      };

      TileContainer.prototype.allTiles = function() {
        return this.tiles.slice();
      };

      TileContainer.prototype.clearAll = function() {
        var k, len, ref1, tile;
        ref1 = this.tiles;
        for (k = 0, len = ref1.length; k < len; k++) {
          tile = ref1[k];
          tile.container = null;
        }
        this.coords = {};
        this.tiles = [];
        return this;
      };

      return TileContainer;

    })(Element);
    return TileContainer;
  });

  (function(definition) {
    Parallelio.RoomGenerator = definition();
    return Parallelio.RoomGenerator.definition = definition;
  })(function(dependencies) {
    var Door, Element, RoomGenerator, Tile, TileContainer;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    TileContainer = dependencies.hasOwnProperty("TileContainer") ? dependencies.TileContainer : Parallelio.TileContainer;
    Tile = dependencies.hasOwnProperty("Tile") ? dependencies.Tile : Parallelio.Tile;
    Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : Parallelio.Door;
    RoomGenerator = (function(superClass) {
      extend(RoomGenerator, superClass);

      function RoomGenerator(options) {
        this.setProperties(options);
        this.directions = [
          {
            x: 1,
            y: 0
          }, {
            x: -1,
            y: 0
          }, {
            x: 0,
            y: 1
          }, {
            x: 0,
            y: -1
          }
        ];
        this.corners = [
          {
            x: 1,
            y: 1
          }, {
            x: -1,
            y: -1
          }, {
            x: -1,
            y: 1
          }, {
            x: 1,
            y: -1
          }
        ];
        this.allDirections = this.directions.concat(this.corners);
      }

      RoomGenerator.properties({
        rng: {
          "default": Math.random
        },
        maxVolume: {
          "default": 25
        },
        minVolume: {
          "default": 50
        },
        width: {
          "default": 30
        },
        height: {
          "default": 15
        },
        tiles: {
          calcul: function() {
            var k, l, ref1, ref2, tiles, x, y;
            tiles = new TileContainer();
            for (x = k = 0, ref1 = this.width; 0 <= ref1 ? k <= ref1 : k >= ref1; x = 0 <= ref1 ? ++k : --k) {
              for (y = l = 0, ref2 = this.height; 0 <= ref2 ? l <= ref2 : l >= ref2; y = 0 <= ref2 ? ++l : --l) {
                tiles.addTile(new Tile(x, y));
              }
            }
            return tiles;
          }
        },
        floorFactory: {
          "default": function(opt) {
            return new Tile(opt.x, opt.y);
          }
        },
        wallFactory: {
          "default": null
        },
        doorFactory: {
          calcul: function() {
            return this.floorFactory;
          }
        }
      });

      RoomGenerator.prototype.init = function() {
        this.finalTiles = null;
        this.rooms = [];
        return this.free = this.tiles.allTiles().filter((function(_this) {
          return function(tile) {
            var direction, k, len, next, ref1;
            ref1 = _this.allDirections;
            for (k = 0, len = ref1.length; k < len; k++) {
              direction = ref1[k];
              next = _this.tiles.getTile(tile.x + direction.x, tile.y + direction.y);
              if (next == null) {
                return false;
              }
            }
            return true;
          };
        })(this));
      };

      RoomGenerator.prototype.calcul = function() {
        var i;
        this.init();
        i = 0;
        while (this.step() || this.newRoom()) {
          i++;
        }
        this.createDoors();
        this.rooms;
        return this.makeFinalTiles();
      };

      RoomGenerator.prototype.makeFinalTiles = function() {
        return this.finalTiles = this.tiles.allTiles().map((function(_this) {
          return function(tile) {
            var opt;
            if (tile.factory != null) {
              opt = {
                x: tile.x,
                y: tile.y
              };
              if (tile.factoryOptions != null) {
                opt = Object.assign(opt, tile.factoryOptions);
              }
              return tile.factory(opt);
            }
          };
        })(this)).filter((function(_this) {
          return function(tile) {
            return tile != null;
          };
        })(this));
      };

      RoomGenerator.prototype.getTiles = function() {
        if (this.finalTiles == null) {
          this.calcul();
        }
        return this.finalTiles;
      };

      RoomGenerator.prototype.newRoom = function() {
        if (this.free.length) {
          this.volume = Math.floor(this.rng() * (this.maxVolume - this.minVolume)) + this.minVolume;
          return this.room = new RoomGenerator.Room();
        }
      };

      RoomGenerator.prototype.randomDirections = function() {
        var i, j, o, x;
        o = this.directions.slice();
        j = void 0;
        x = void 0;
        i = o.length;
        while (i) {
          j = Math.floor(this.rng() * i);
          x = o[--i];
          o[i] = o[j];
          o[j] = x;
        }
        return o;
      };

      RoomGenerator.prototype.step = function() {
        var success, tries;
        if (this.room) {
          if (this.free.length && this.room.tiles.length < this.volume - 1) {
            if (this.room.tiles.length) {
              tries = this.randomDirections();
              success = false;
              while (tries.length && !success) {
                success = this.expand(this.room, tries.pop(), this.volume);
              }
              if (!success) {
                this.roomDone();
              }
              return success;
            } else {
              this.allocateTile(this.randomFreeTile(), this.room);
              return true;
            }
          } else {
            this.roomDone();
            return false;
          }
        }
      };

      RoomGenerator.prototype.roomDone = function() {
        this.rooms.push(this.room);
        this.allocateWalls(this.room);
        return this.room = null;
      };

      RoomGenerator.prototype.expand = function(room, direction, max) {
        var k, len, next, ref1, second, success, tile;
        if (max == null) {
          max = 0;
        }
        success = false;
        ref1 = room.tiles;
        for (k = 0, len = ref1.length; k < len; k++) {
          tile = ref1[k];
          if (max === 0 || room.tiles.length < max) {
            if (next = this.tileOffsetIsFree(tile, direction)) {
              this.allocateTile(next, room);
              success = true;
            }
            if ((second = this.tileOffsetIsFree(tile, direction, 2)) && !this.tileOffsetIsFree(tile, direction, 3)) {
              this.allocateTile(second, room);
            }
          }
        }
        return success;
      };

      RoomGenerator.prototype.allocateWalls = function(room) {
        var direction, k, len, next, nextRoom, otherSide, ref1, results, tile;
        ref1 = room.tiles;
        results = [];
        for (k = 0, len = ref1.length; k < len; k++) {
          tile = ref1[k];
          results.push((function() {
            var l, len1, ref2, results1;
            ref2 = this.allDirections;
            results1 = [];
            for (l = 0, len1 = ref2.length; l < len1; l++) {
              direction = ref2[l];
              next = this.tiles.getTile(tile.x + direction.x, tile.y + direction.y);
              if ((next != null) && next.room !== room) {
                if (indexOf.call(this.corners, direction) < 0) {
                  otherSide = this.tiles.getTile(tile.x + direction.x * 2, tile.y + direction.y * 2);
                  nextRoom = (otherSide != null ? otherSide.room : void 0) != null ? otherSide.room : null;
                  room.addWall(next, nextRoom);
                  if (nextRoom != null) {
                    nextRoom.addWall(next, room);
                  }
                }
                next.factory = this.wallFactory;
                results1.push(this.allocateTile(next));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        }
        return results;
      };

      RoomGenerator.prototype.createDoors = function() {
        var door, k, len, ref1, results, room, walls;
        ref1 = this.rooms;
        results = [];
        for (k = 0, len = ref1.length; k < len; k++) {
          room = ref1[k];
          results.push((function() {
            var l, len1, ref2, results1;
            ref2 = room.wallsByRooms();
            results1 = [];
            for (l = 0, len1 = ref2.length; l < len1; l++) {
              walls = ref2[l];
              if ((walls.room != null) && room.doorsForRoom(walls.room) < 1) {
                door = walls.tiles[Math.floor(this.rng() * walls.tiles.length)];
                door.factory = this.doorFactory;
                door.factoryOptions = {
                  direction: this.tiles.getTile(door.x + 1, door.y).factory === this.floorFactory ? Door.directions.vertical : Door.directions.horizontal
                };
                room.addDoor(door, walls.room);
                results1.push(walls.room.addDoor(door, room));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        }
        return results;
      };

      RoomGenerator.prototype.allocateTile = function(tile, room) {
        var index;
        if (room == null) {
          room = null;
        }
        if (room != null) {
          room.addTile(tile);
          tile.factory = this.floorFactory;
        }
        index = this.free.indexOf(tile);
        if (index > -1) {
          return this.free.splice(index, 1);
        }
      };

      RoomGenerator.prototype.tileOffsetIsFree = function(tile, direction, multiply) {
        if (multiply == null) {
          multiply = 1;
        }
        return this.tileIsFree(tile.x + direction.x * multiply, tile.y + direction.y * multiply);
      };

      RoomGenerator.prototype.tileIsFree = function(x, y) {
        var tile;
        tile = this.tiles.getTile(x, y);
        if ((tile != null) && indexOf.call(this.free, tile) >= 0) {
          return tile;
        } else {
          return false;
        }
      };

      RoomGenerator.prototype.randomFreeTile = function() {
        return this.free[Math.floor(this.rng() * this.free.length)];
      };

      return RoomGenerator;

    })(Element);
    RoomGenerator.Room = (function() {
      function Room() {
        this.tiles = [];
        this.walls = [];
        this.doors = [];
      }

      Room.prototype.addTile = function(tile) {
        this.tiles.push(tile);
        return tile.room = this;
      };

      Room.prototype.containsWall = function(tile) {
        var k, len, ref1, wall;
        ref1 = this.walls;
        for (k = 0, len = ref1.length; k < len; k++) {
          wall = ref1[k];
          if (wall.tile === tile) {
            return wall;
          }
        }
        return false;
      };

      Room.prototype.addWall = function(tile, nextRoom) {
        var existing;
        existing = this.containsWall(tile);
        if (existing) {
          return existing.nextRoom = nextRoom;
        } else {
          return this.walls.push({
            tile: tile,
            nextRoom: nextRoom
          });
        }
      };

      Room.prototype.wallsByRooms = function() {
        var k, len, pos, ref1, res, rooms, wall;
        rooms = [];
        res = [];
        ref1 = this.walls;
        for (k = 0, len = ref1.length; k < len; k++) {
          wall = ref1[k];
          pos = rooms.indexOf(wall.nextRoom);
          if (pos === -1) {
            pos = rooms.length;
            rooms.push(wall.nextRoom);
            res.push({
              room: wall.nextRoom,
              tiles: []
            });
          }
          res[pos].tiles.push(wall.tile);
        }
        return res;
      };

      Room.prototype.addDoor = function(tile, nextRoom) {
        return this.doors.push({
          tile: tile,
          nextRoom: nextRoom
        });
      };

      Room.prototype.doorsForRoom = function(room) {
        var door, k, len, ref1, res;
        res = [];
        ref1 = this.doors;
        for (k = 0, len = ref1.length; k < len; k++) {
          door = ref1[k];
          if (door.nextRoom === room) {
            res.push(door.tile);
          }
        }
        return res;
      };

      return Room;

    })();
    return RoomGenerator;
  });

  (function(definition) {
    Parallelio.PathFinder = definition();
    return Parallelio.PathFinder.definition = definition;
  })(function(dependencies) {
    var Element, PathFinder;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
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
        var k, len, next, ref1, results, tile;
        if (step == null) {
          step = null;
        }
        tile = step != null ? step.nextTile : this.from;
        ref1 = this.getConnectedToTile(tile);
        results = [];
        for (k = 0, len = ref1.length; k < len; k++) {
          next = ref1[k];
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
      function Step(pathFinder, prev1, tile1, nextTile) {
        this.pathFinder = pathFinder;
        this.prev = prev1;
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
    return PathFinder;
  });

  (function(definition) {
    Parallelio.Tiled = definition();
    return Parallelio.Tiled.definition = definition;
  })(function(dependencies) {
    var Element, Tiled;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Tiled = (function(superClass) {
      extend(Tiled, superClass);

      function Tiled() {
        return Tiled.__super__.constructor.apply(this, arguments);
      }

      Tiled.properties({
        tile: {
          change: function(old) {
            if (old != null) {
              old.removeChild(this);
            }
            if (this.tile) {
              return this.tile.addChild(this);
            }
          }
        }
      });

      return Tiled;

    })(Element);
    return Tiled;
  });

  (function(definition) {
    Parallelio.Spark.Updater = definition();
    return Parallelio.Spark.Updater.definition = definition;
  })(function() {
    var Updater;
    Updater = (function() {
      function Updater() {
        this.callbacks = [];
        this.next = [];
        this.updating = false;
      }

      Updater.prototype.update = function() {
        var callback;
        this.updating = true;
        this.next = this.callbacks.slice();
        while (this.callbacks.length > 0) {
          callback = this.callbacks.shift();
          callback();
        }
        this.callbacks = this.next;
        this.updating = false;
        return this;
      };

      Updater.prototype.addCallback = function(callback) {
        if (!this.callbacks.includes(callback)) {
          this.callbacks.push(callback);
        }
        if (this.updating && !this.next.includes(callback)) {
          return this.next.push(callback);
        }
      };

      Updater.prototype.nextTick = function(callback) {
        if (this.updating) {
          if (!this.next.includes(callback)) {
            return this.next.push(callback);
          }
        } else {
          return this.addCallback(callback);
        }
      };

      Updater.prototype.removeCallback = function(callback) {
        var index;
        index = this.callbacks.indexOf(callback);
        if (index !== -1) {
          this.callbacks.splice(index, 1);
        }
        index = this.next.indexOf(callback);
        if (index !== -1) {
          return this.next.splice(index, 1);
        }
      };

      Updater.prototype.getBinder = function() {
        return new Updater.Binder(this);
      };

      return Updater;

    })();
    Updater.Binder = (function() {
      function Binder(target1) {
        this.target = target1;
        this.binded = false;
      }

      Binder.prototype.bind = function() {
        if (!this.binded && (this.callback != null)) {
          this.target.addCallback(this.callback);
        }
        return this.binded = true;
      };

      Binder.prototype.unbind = function() {
        if (this.binded && (this.callback != null)) {
          this.target.removeCallback(this.callback);
        }
        return this.binded = false;
      };

      return Binder;

    })();
    return Updater;
  });

  (function(definition) {
    Parallelio.Star = definition();
    return Parallelio.Star.definition = definition;
  })(function(dependencies) {
    var Element, Star;
    if (dependencies == null) {
      dependencies = {};
    }
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
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
    return Star;
  });

  (function(definition) {
    Parallelio.Weapon = definition();
    return Parallelio.Weapon.definition = definition;
  })(function(dependencies) {
    var Damageable, Tiled, Timing, Weapon;
    if (dependencies == null) {
      dependencies = {};
    }
    Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : Parallelio.Tile;
    Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : Parallelio.Timing;
    Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : Parallelio.Damageable;
    Weapon = (function(superClass) {
      extend(Weapon, superClass);

      Weapon.extend(Damageable);

      function Weapon(options) {
        this.setProperties(options);
      }

      Weapon.properties({
        rechargeTime: {
          "default": 1000
        },
        power: {
          "default": 10
        },
        blastRange: {
          "default": 1
        },
        propagationType: {
          "default": null
        },
        projectileSpeed: {
          "default": 10
        },
        target: {
          "default": null,
          change: function() {
            if (this.autoFire) {
              return this.fire();
            }
          }
        },
        charged: {
          "default": true
        },
        charging: {
          "default": true
        },
        enabled: {
          "default": true
        },
        autoFire: {
          "default": true
        },
        criticalHealth: {
          "default": 0.3
        },
        canFire: {
          get: function() {
            return this.target && this.enabled && this.charged && this.health / this.maxHealth >= this.criticalHealth;
          }
        },
        timing: {
          calcul: function() {
            return new Timing();
          }
        }
      });

      Weapon.prototype.fire = function() {
        var projectile;
        if (this.canFire) {
          projectile = new Projectile({
            origin: this,
            target: this.target,
            power: this.power,
            blastRange: this.blastRange,
            propagationType: this.propagationType,
            speed: this.projectileSpeed,
            timing: this.timing
          });
          projectile.launch();
          this.charged = false;
          this.recharge();
          return projectile;
        }
      };

      Weapon.prototype.recharge = function() {
        this.charging = true;
        return this.chargeTimeout = this.timing.setTimeout((function(_this) {
          return function() {
            _this.charging = false;
            return _this.recharged();
          };
        })(this), this.rechargeTime);
      };

      Weapon.prototype.recharged = function() {
        this.charged = true;
        if (this.autoFire) {
          return this.fire();
        }
      };

      return Weapon;

    })(Tiled);
    return Weapon;
  });

}).call(this);
