(function() {
  var Parallelio,
    indexOf = [].indexOf;

  Parallelio = typeof module !== "undefined" && module !== null ? module.exports = {} : (this.Parallelio == null ? this.Parallelio = {} : void 0, this.Parallelio);

  if (Parallelio.Spark == null) {
    Parallelio.Spark = {};
  }

  Parallelio.strings = {
    "greekAlphabet": ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"],
    "starNames": ["Achernar", "Maia", "Atlas", "Salm", "Alnilam", "Nekkar", "Elnath", "Thuban", "Achird", "Marfik", "Auva", "Sargas", "Alnitak", "Nihal", "Enif", "Torcularis", "Acrux", "Markab", "Avior", "Sarin", "Alphard", "Nunki", "Etamin", "Turais", "Acubens", "Matar", "Azelfafage", "Sceptrum", "Alphekka", "Nusakan", "Fomalhaut", "Tyl", "Adara", "Mebsuta", "Azha", "Scheat", "Alpheratz", "Peacock", "Fornacis", "Unukalhai", "Adhafera", "Megrez", "Azmidiske", "Segin", "Alrai", "Phad", "Furud", "Vega", "Adhil", "Meissa", "Baham", "Seginus", "Alrisha", "Phaet", "Gacrux", "Vindemiatrix", "Agena", "Mekbuda", "Becrux", "Sham", "Alsafi", "Pherkad", "Gianfar", "Wasat", "Aladfar", "Menkalinan", "Beid", "Sharatan", "Alsciaukat", "Pleione", "Gomeisa", "Wezen", "Alathfar", "Menkar", "Bellatrix", "Shaula", "Alshain", "Polaris", "Graffias", "Wezn", "Albaldah", "Menkent", "Betelgeuse", "Shedir", "Alshat", "Pollux", "Grafias", "Yed", "Albali", "Menkib", "Botein", "Sheliak", "Alsuhail", "Porrima", "Grumium", "Yildun", "Albireo", "Merak", "Brachium", "Sirius", "Altair", "Praecipua", "Hadar", "Zaniah", "Alchiba", "Merga", "Canopus", "Situla", "Altarf", "Procyon", "Haedi", "Zaurak", "Alcor", "Merope", "Capella", "Skat", "Alterf", "Propus", "Hamal", "Zavijah", "Alcyone", "Mesarthim", "Caph", "Spica", "Aludra", "Rana", "Hassaleh", "Zibal", "Alderamin", "Metallah", "Castor", "Sterope", "Alula", "Ras", "Heze", "Zosma", "Aldhibah", "Miaplacidus", "Cebalrai", "Sualocin", "Alya", "Rasalgethi", "Hoedus", "Aquarius", "Alfirk", "Minkar", "Celaeno", "Subra", "Alzirr", "Rasalhague", "Homam", "Aries", "Algenib", "Mintaka", "Chara", "Suhail", "Ancha", "Rastaban", "Hyadum", "Cepheus", "Algieba", "Mira", "Chort", "Sulafat", "Angetenar", "Regulus", "Izar", "Cetus", "Algol", "Mirach", "Cursa", "Syrma", "Ankaa", "Rigel", "Jabbah", "Columba", "Algorab", "Miram", "Dabih", "Tabit", "Anser", "Rotanev", "Kajam", "Coma", "Alhena", "Mirphak", "Deneb", "Talitha", "Antares", "Ruchba", "Kaus", "Corona", "Alioth", "Mizar", "Denebola", "Tania", "Arcturus", "Ruchbah", "Keid", "Crux", "Alkaid", "Mufrid", "Dheneb", "Tarazed", "Arkab", "Rukbat", "Kitalpha", "Draco", "Alkalurops", "Muliphen", "Diadem", "Taygeta", "Arneb", "Sabik", "Kocab", "Grus", "Alkes", "Murzim", "Diphda", "Tegmen", "Arrakis", "Sadalachbia", "Kornephoros", "Hydra", "Alkurhah", "Muscida", "Dschubba", "Tejat", "Ascella", "Sadalmelik", "Kraz", "Lacerta", "Almaak", "Naos", "Dsiban", "Terebellum", "Asellus", "Sadalsuud", "Kuma", "Mensa", "Alnair", "Nash", "Dubhe", "Thabit", "Asterope", "Sadr", "Lesath", "Maasym", "Alnath", "Nashira", "Electra", "Theemim", "Atik", "Saiph", "Phoenix", "Norma"]
  };

  (function(definition) {
    Parallelio.Spark.Mixable = definition();
    return Parallelio.Spark.Mixable.definition = definition;
  })(function() {
    var Mixable;
    Mixable = (function() {
      class Mixable {
        static extend(obj) {
          this.Extension.make(obj, this);
          if (obj.prototype != null) {
            return this.Extension.make(obj.prototype, this.prototype);
          }
        }

        static include(obj) {
          return this.Extension.make(obj, this.prototype);
        }

      };

      Mixable.Extension = {
        makeOnce: function(source, target) {
          var ref3;
          if (!((ref3 = target.extensions) != null ? ref3.includes(source) : void 0)) {
            return this.make(source, target);
          }
        },
        make: function(source, target) {
          var k, len, originalFinalProperties, prop, ref3;
          ref3 = this.getExtensionProperties(source, target);
          for (k = 0, len = ref3.length; k < len; k++) {
            prop = ref3[k];
            Object.defineProperty(target, prop.name, prop);
          }
          if (source.getFinalProperties && target.getFinalProperties) {
            originalFinalProperties = target.getFinalProperties;
            target.getFinalProperties = function() {
              return source.getFinalProperties().concat(originalFinalProperties.call(this));
            };
          } else {
            target.getFinalProperties = source.getFinalProperties || target.getFinalProperties;
          }
          target.extensions = (target.extensions || []).concat([source]);
          if (typeof source.extended === 'function') {
            return source.extended(target);
          }
        },
        alwaysFinal: ['extended', 'extensions', '__super__', 'constructor', 'getFinalProperties'],
        getExtensionProperties: function(source, target) {
          var alwaysFinal, props, targetChain;
          alwaysFinal = this.alwaysFinal;
          targetChain = this.getPrototypeChain(target);
          props = [];
          this.getPrototypeChain(source).every(function(obj) {
            var exclude;
            if (!targetChain.includes(obj)) {
              exclude = alwaysFinal;
              if (source.getFinalProperties != null) {
                exclude = exclude.concat(source.getFinalProperties());
              }
              if (typeof obj === 'function') {
                exclude = exclude.concat(["length", "prototype", "name"]);
              }
              props = props.concat(Object.getOwnPropertyNames(obj).filter((key) => {
                return !target.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && !props.find(function(prop) {
                  return prop.name === key;
                });
              }).map(function(key) {
                var prop;
                prop = Object.getOwnPropertyDescriptor(obj, key);
                prop.name = key;
                return prop;
              }));
              return true;
            }
          });
          return props;
        },
        getPrototypeChain: function(obj) {
          var basePrototype, chain;
          chain = [];
          basePrototype = Object.getPrototypeOf(Object);
          while (true) {
            chain.push(obj);
            if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== basePrototype)) {
              break;
            }
          }
          return chain;
        }
      };

      return Mixable;

    }).call(this);
    return Mixable;
  });

  (function(definition) {
    Parallelio.Spark.EventEmitter = definition();
    return Parallelio.Spark.EventEmitter.definition = definition;
  })(function() {
    var EventEmitter;
    EventEmitter = (function() {
      class EventEmitter {
        getAllEvents() {
          return this._events || (this._events = {});
        }

        getListeners(e) {
          var events;
          events = this.getAllEvents();
          return events[e] || (events[e] = []);
        }

        hasListener(e, listener) {
          return this.getListeners(e).includes(listener);
        }

        addListener(e, listener) {
          if (!this.hasListener(e, listener)) {
            this.getListeners(e).push(listener);
            return this.listenerAdded(e, listener);
          }
        }

        listenerAdded(e, listener) {}

        removeListener(e, listener) {
          var index, listeners;
          listeners = this.getListeners(e);
          index = listeners.indexOf(listener);
          if (index !== -1) {
            listeners.splice(index, 1);
            return this.listenerRemoved(e, listener);
          }
        }

        listenerRemoved(e, listener) {}

        emitEvent(e, ...args) {
          var listeners;
          listeners = this.getListeners(e).slice();
          return listeners.forEach(function(listener) {
            return listener(...args);
          });
        }

        removeAllListeners() {
          return this._events = {};
        }

      };

      EventEmitter.prototype.emit = EventEmitter.prototype.emitEvent;

      EventEmitter.prototype.trigger = EventEmitter.prototype.emitEvent;

      EventEmitter.prototype.on = EventEmitter.prototype.addListener;

      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

      return EventEmitter;

    }).call(this);
    return EventEmitter;
  });

  (function(definition) {
    Parallelio.Spark.PropertyOwner = definition();
    return Parallelio.Spark.PropertyOwner.definition = definition;
  })(function() {
    var PropertyOwner;
    PropertyOwner = class PropertyOwner {
      getProperty(name) {
        return this._properties && this._properties.find(function(prop) {
          return prop.name === name;
        });
      }

      getPropertyInstance(name) {
        var res;
        res = this.getProperty(name);
        if (res) {
          return res.getInstance(this);
        }
      }

      getProperties() {
        return this._properties.slice();
      }

      getPropertyInstances() {
        return this._properties.map((prop) => {
          return prop.getInstance(this);
        });
      }

      getInstantiatedProperties() {
        return this._properties.filter((prop) => {
          return prop.isInstantiated(this);
        }).map((prop) => {
          return prop.getInstance(this);
        });
      }

      getManualDataProperties() {
        return this._properties.reduce((res, prop) => {
          var instance;
          if (prop.isInstantiated(this)) {
            instance = prop.getInstance(this);
            if (instance.calculated && instance.manual) {
              res[prop.name] = instance.value;
            }
          }
          return res;
        }, {});
      }

      setProperties(data, options = {}) {
        var key, prop, val;
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
      }

      destroyProperties() {
        this.getInstantiatedProperties().forEach((prop) => {
          return prop.destroy();
        });
        this._properties = [];
        return true;
      }

      listenerAdded(event, listener) {
        return this._properties.forEach((prop) => {
          if (prop.getInstanceType().prototype.changeEventName === event) {
            return prop.getInstance(this).get();
          }
        });
      }

      extended(target) {
        return target.listenerAdded = this.listenerAdded;
      }

    };
    return PropertyOwner;
  });

  (function(definition) {
    Parallelio.Spark.Referred = definition();
    return Parallelio.Spark.Referred.definition = definition;
  })(function() {
    var Referred;
    Referred = (function() {
      class Referred {
        compareRefered(refered) {
          return this.constructor.compareRefered(refered, this);
        }

        getRef() {}

        static compareRefered(obj1, obj2) {
          return obj1 === obj2 || ((obj1 != null) && (obj2 != null) && obj1.constructor === obj2.constructor && this.compareRef(obj1.ref, obj2.ref));
        }

        static compareRef(ref1, ref2) {
          return (ref1 != null) && (ref2 != null) && (ref1 === ref2 || (Array.isArray(ref1) && Array.isArray(ref1) && ref1.every((val, i) => {
            return this.compareRefered(ref1[i], ref2[i]);
          })) || (typeof ref1 === "object" && typeof ref2 === "object" && Object.keys(ref1).join() === Object.keys(ref2).join() && Object.keys(ref1).every((key) => {
            return this.compareRefered(ref1[key], ref2[key]);
          })));
        }

      };

      Object.defineProperty(Referred.prototype, 'ref', {
        get: function() {
          return this.getRef();
        }
      });

      return Referred;

    }).call(this);
    return Referred;
  });

  (function(definition) {
    Parallelio.Spark.Collection = definition();
    return Parallelio.Spark.Collection.definition = definition;
  })(function() {
    var Collection;
    Collection = (function() {
      class Collection {
        constructor(arr) {
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

        changed() {}

        checkChanges(old, ordered = true, compareFunction = null) {
          if (compareFunction == null) {
            compareFunction = function(a, b) {
              return a === b;
            };
          }
          if (old != null) {
            old = this.copy(old.slice());
          } else {
            old = [];
          }
          return this.count() !== old.length || (ordered ? this.some(function(val, i) {
            return !compareFunction(old.get(i), val);
          }) : this.some(function(a) {
            return !old.pluck(function(b) {
              return compareFunction(a, b);
            });
          }));
        }

        get(i) {
          return this._array[i];
        }

        getRandom() {
          return this._array[Math.floor(Math.random() * this._array.length)];
        }

        set(i, val) {
          var old;
          if (this._array[i] !== val) {
            old = this.toArray();
            this._array[i] = val;
            this.changed(old);
          }
          return val;
        }

        add(val) {
          if (!this._array.includes(val)) {
            return this.push(val);
          }
        }

        remove(val) {
          var index, old;
          index = this._array.indexOf(val);
          if (index !== -1) {
            old = this.toArray();
            this._array.splice(index, 1);
            return this.changed(old);
          }
        }

        pluck(fn) {
          var found, index, old;
          index = this._array.findIndex(fn);
          if (index > -1) {
            old = this.toArray();
            found = this._array[index];
            this._array.splice(index, 1);
            this.changed(old);
            return found;
          } else {
            return null;
          }
        }

        toArray() {
          return this._array.slice();
        }

        count() {
          return this._array.length;
        }

        static newSubClass(fn, arr) {
          var SubClass;
          if (typeof fn === 'object') {
            SubClass = class extends this {};
            Object.assign(SubClass.prototype, fn);
            return new SubClass(arr);
          } else {
            return new this(arr);
          }
        }

        copy(arr) {
          var coll;
          if (arr == null) {
            arr = this.toArray();
          }
          coll = new this.constructor(arr);
          return coll;
        }

        equals(arr) {
          return (this.count() === (typeof arr.count === 'function' ? arr.count() : arr.length)) && this.every(function(val, i) {
            return arr[i] === val;
          });
        }

        getAddedFrom(arr) {
          return this._array.filter(function(item) {
            return !arr.includes(item);
          });
        }

        getRemovedFrom(arr) {
          return arr.filter((item) => {
            return !this.includes(item);
          });
        }

      };

      Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString'];

      Collection.readListFunctions = ['concat', 'filter', 'slice'];

      Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

      Collection.readFunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function(...arg) {
          return this._array[funct](...arg);
        };
      });

      Collection.readListFunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function(...arg) {
          return this.copy(this._array[funct](...arg));
        };
      });

      Collection.writefunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function(...arg) {
          var old, res;
          old = this.toArray();
          res = this._array[funct](...arg);
          this.changed(old);
          return res;
        };
      });

      return Collection;

    }).call(this);
    Object.defineProperty(Collection.prototype, 'length', {
      get: function() {
        return this.count();
      }
    });
    if (typeof Symbol !== "undefined" && Symbol !== null ? Symbol.iterator : void 0) {
      Collection.prototype[Symbol.iterator] = function() {
        return this._array[Symbol.iterator]();
      };
    }
    return Collection;
  });

  (function(definition) {
    Parallelio.Spark.Overrider = definition();
    return Parallelio.Spark.Overrider.definition = definition;
  })(function() {
    var Overrider;
    Overrider = (function() {
      // todo : 
      //  simplified form : @withoutName method
      class Overrider {
        static overrides(overrides) {
          return this.Override.applyMany(this.prototype, this.name, overrides);
        }

        getFinalProperties() {
          if (this._overrides != null) {
            return ['_overrides'].concat(Object.keys(this._overrides));
          } else {
            return [];
          }
        }

        extended(target) {
          if (this._overrides != null) {
            this.constructor.Override.applyMany(target, this.constructor.name, this._overrides);
          }
          if (this.constructor === Overrider) {
            return target.extended = this.extended;
          }
        }

      };

      Overrider.Override = {
        makeMany: function(target, namespace, overrides) {
          var fn, key, override, results;
          results = [];
          for (key in overrides) {
            fn = overrides[key];
            results.push(override = this.make(target, namespace, key, fn));
          }
          return results;
        },
        applyMany: function(target, namespace, overrides) {
          var key, override, results;
          results = [];
          for (key in overrides) {
            override = overrides[key];
            if (typeof override === "function") {
              override = this.make(target, namespace, key, override);
            }
            results.push(this.apply(target, namespace, override));
          }
          return results;
        },
        make: function(target, namespace, fnName, fn) {
          var override;
          override = {
            fn: {
              current: fn
            },
            name: fnName
          };
          override.fn['with' + namespace] = fn;
          return override;
        },
        emptyFn: function() {},
        apply: function(target, namespace, override) {
          var fnName, overrides, ref3, ref4, without;
          fnName = override.name;
          overrides = target._overrides != null ? Object.assign({}, target._overrides) : {};
          without = ((ref3 = target._overrides) != null ? (ref4 = ref3[fnName]) != null ? ref4.fn.current : void 0 : void 0) || target[fnName];
          override = Object.assign({}, override);
          if (overrides[fnName] != null) {
            override.fn = Object.assign({}, overrides[fnName].fn, override.fn);
          } else {
            override.fn = Object.assign({}, override.fn);
          }
          override.fn['without' + namespace] = without || this.emptyFn;
          if (without == null) {
            override.missingWithout = 'without' + namespace;
          } else if (override.missingWithout) {
            override.fn[override.missingWithout] = without;
          }
          Object.defineProperty(target, fnName, {
            configurable: true,
            get: function() {
              var finalFn, fn, key, ref5;
              finalFn = override.fn.current.bind(this);
              ref5 = override.fn;
              for (key in ref5) {
                fn = ref5[key];
                finalFn[key] = fn.bind(this);
              }
              if (this.constructor.prototype !== this) {
                Object.defineProperty(this, fnName, {
                  value: finalFn
                });
              }
              return finalFn;
            }
          });
          overrides[fnName] = override;
          return target._overrides = overrides;
        }
      };

      return Overrider;

    }).call(this);
    return Overrider;
  });

  (function(definition) {
    Parallelio.Spark.Loader = definition();
    return Parallelio.Spark.Loader.definition = definition;
  })(function(dependencies = {}) {
    var Loader, Overrider;
    Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : Parallelio.Spark.Overrider;
    Loader = (function() {
      class Loader extends Overrider {
        constructor() {
          super();
          this.initPreloaded();
        }

        initPreloaded() {
          var defList;
          defList = this.preloaded;
          this.preloaded = [];
          return this.load(defList);
        }

        load(defList) {
          var loaded, toLoad;
          toLoad = [];
          loaded = defList.map((def) => {
            var instance;
            if (def.instance == null) {
              def = Object.assign({
                loader: this
              }, def);
              instance = Loader.load(def);
              def = Object.assign({
                instance: instance
              }, def);
              if (def.initByLoader && (instance.init != null)) {
                toLoad.push(instance);
              }
            }
            return def;
          });
          this.preloaded = this.preloaded.concat(loaded);
          return toLoad.forEach(function(instance) {
            return instance.init();
          });
        }

        preload(def) {
          if (!Array.isArray(def)) {
            def = [def];
          }
          return this.preloaded = (this.preloaded || []).concat(def);
        }

        destroyLoaded() {
          return this.preloaded.forEach(function(def) {
            var ref3;
            return (ref3 = def.instance) != null ? typeof ref3.destroy === "function" ? ref3.destroy() : void 0 : void 0;
          });
        }

        getFinalProperties() {
          return super.getFinalProperties().concat(['preloaded']);
        }

        extended(target) {
          super.extended(target);
          if (this.preloaded) {
            return target.preloaded = (target.preloaded || []).concat(this.preloaded);
          }
        }

        static loadMany(def) {
          return def.map((d) => {
            return this.load(d);
          });
        }

        static load(def) {
          if (typeof def.type.copyWith === "function") {
            return def.type.copyWith(def);
          } else {
            return new def.type(def);
          }
        }

        static preload(def) {
          return this.prototype.preload(def);
        }

      };

      Loader.prototype.preloaded = [];

      Loader.overrides({
        init: function() {
          this.init.withoutLoader();
          return this.initPreloaded();
        },
        destroy: function() {
          this.destroy.withoutLoader();
          return this.destroyLoaded();
        }
      });

      return Loader;

    }).call(this);
    return Loader;
  });

  (function(definition) {
    Parallelio.Spark.Binder = definition();
    return Parallelio.Spark.Binder.definition = definition;
  })(function(dependencies = {}) {
    var Binder, Referred;
    Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : Parallelio.Spark.Referred;
    Binder = class Binder extends Referred {
      toggleBind(val = !this.binded) {
        if (val) {
          return this.bind();
        } else {
          return this.unbind();
        }
      }

      bind() {
        if (!this.binded && this.canBind()) {
          this.doBind();
        }
        return this.binded = true;
      }

      canBind() {
        return (this.callback != null) && (this.target != null);
      }

      doBind() {
        throw new Error('Not implemented');
      }

      unbind() {
        if (this.binded && this.canBind()) {
          this.doUnbind();
        }
        return this.binded = false;
      }

      doUnbind() {
        throw new Error('Not implemented');
      }

      equals(binder) {
        return this.compareRefered(binder);
      }

      destroy() {
        return this.unbind();
      }

    };
    return Binder;
  });

  (function(definition) {
    Parallelio.Spark.Updater = definition();
    return Parallelio.Spark.Updater.definition = definition;
  })(function(dependencies = {}) {
    var Binder, Updater;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Parallelio.Spark.Binder;
    Updater = class Updater {
      constructor(options) {
        var ref3;
        this.callbacks = [];
        this.next = [];
        this.updating = false;
        if ((options != null ? options.callback : void 0) != null) {
          this.addCallback(options.callback);
        }
        if ((options != null ? (ref3 = options.callbacks) != null ? ref3.forEach : void 0 : void 0) != null) {
          options.callbacks.forEach((callback) => {
            return this.addCallback(callback);
          });
        }
      }

      update() {
        var callback;
        this.updating = true;
        this.next = this.callbacks.slice();
        while (this.callbacks.length > 0) {
          callback = this.callbacks.shift();
          this.runCallback(callback);
        }
        this.callbacks = this.next;
        this.updating = false;
        return this;
      }

      runCallback(callback) {
        return callback();
      }

      addCallback(callback) {
        if (!this.callbacks.includes(callback)) {
          this.callbacks.push(callback);
        }
        if (this.updating && !this.next.includes(callback)) {
          return this.next.push(callback);
        }
      }

      nextTick(callback) {
        if (this.updating) {
          if (!this.next.includes(callback)) {
            return this.next.push(callback);
          }
        } else {
          return this.addCallback(callback);
        }
      }

      removeCallback(callback) {
        var index;
        index = this.callbacks.indexOf(callback);
        if (index !== -1) {
          this.callbacks.splice(index, 1);
        }
        index = this.next.indexOf(callback);
        if (index !== -1) {
          return this.next.splice(index, 1);
        }
      }

      getBinder() {
        return new Updater.Binder(this);
      }

      destroy() {
        this.callbacks = [];
        return this.next = [];
      }

    };
    Updater.Binder = (function(superClass) {
      class Binder extends superClass {
        constructor(target1, callback1) {
          super();
          this.target = target1;
          this.callback = callback1;
        }

        getRef() {
          return {
            target: this.target,
            callback: this.callback
          };
        }

        doBind() {
          return this.target.addCallback(this.callback);
        }

        doUnbind() {
          return this.target.removeCallback(this.callback);
        }

      };

      return Binder;

    }).call(this, Binder);
    return Updater;
  });

  (function(definition) {
    Parallelio.Timing = definition();
    return Parallelio.Timing.definition = definition;
  })(function(dependencies = {}) {
    var BaseUpdater, Timing;
    BaseUpdater = dependencies.hasOwnProperty("BaseUpdater") ? dependencies.BaseUpdater : Parallelio.Spark.Updater;
    Timing = class Timing {
      constructor(running = true) {
        this.running = running;
        this.children = [];
      }

      addChild(child) {
        var index;
        index = this.children.indexOf(child);
        if (this.updater) {
          child.updater.dispatcher = this.updater;
        }
        if (index === -1) {
          this.children.push(child);
        }
        child.parent = this;
        return this;
      }

      removeChild(child) {
        var index;
        index = this.children.indexOf(child);
        if (index > -1) {
          this.children.splice(index, 1);
        }
        if (child.parent === this) {
          child.parent = null;
        }
        return this;
      }

      toggle(val) {
        if (typeof val === "undefined") {
          val = !this.running;
        }
        this.running = val;
        return this.children.forEach(function(child) {
          return child.toggle(val);
        });
      }

      setTimeout(callback, time) {
        var timer;
        timer = new this.constructor.Timer(time, callback, this.running);
        this.addChild(timer);
        return timer;
      }

      setInterval(callback, time) {
        var timer;
        timer = new this.constructor.Timer(time, callback, this.running, true);
        this.addChild(timer);
        return timer;
      }

      pause() {
        return this.toggle(false);
      }

      unpause() {
        return this.toggle(true);
      }

    };
    Timing.Timer = class Timer {
      constructor(time1, callback, running = true, repeat = false) {
        this.time = time1;
        this.running = running;
        this.repeat = repeat;
        this.remainingTime = this.time;
        this.updater = new Timing.Updater(this);
        this.dispatcher = new BaseUpdater();
        if (callback) {
          this.dispatcher.addCallback(callback);
        }
        if (this.running) {
          this._start();
        }
      }

      static now() {
        var ref3;
        if ((typeof window !== "undefined" && window !== null ? (ref3 = window.performance) != null ? ref3.now : void 0 : void 0) != null) {
          return window.performance.now();
        } else if ((typeof process !== "undefined" && process !== null ? process.uptime : void 0) != null) {
          return process.uptime() * 1000;
        } else {
          return Date.now();
        }
      }

      toggle(val) {
        if (typeof val === "undefined") {
          val = !this.running;
        }
        if (val) {
          return this._start();
        } else {
          return this._stop();
        }
      }

      pause() {
        return this.toggle(false);
      }

      unpause() {
        return this.toggle(true);
      }

      getElapsedTime() {
        if (this.running) {
          return this.constructor.now() - this.startTime + this.time - this.remainingTime;
        } else {
          return this.time - this.remainingTime;
        }
      }

      setElapsedTime(val) {
        this._stop();
        this.remainingTime = this.time - val;
        return this._start();
      }

      getPrc() {
        return this.getElapsedTime() / this.time;
      }

      setPrc(val) {
        return this.setElapsedTime(this.time * val);
      }

      _start() {
        this.running = true;
        this.updater.forwardCallbacks();
        this.startTime = this.constructor.now();
        if (this.repeat && !this.interupted) {
          return this.id = setInterval(this.tick.bind(this), this.remainingTime);
        } else {
          return this.id = setTimeout(this.tick.bind(this), this.remainingTime);
        }
      }

      _stop() {
        var wasInterupted;
        wasInterupted = this.interupted;
        this.running = false;
        this.updater.unforwardCallbacks();
        this.remainingTime = this.time - (this.constructor.now() - this.startTime);
        this.interupted = this.remainingTime !== this.time;
        if (this.repeat && !wasInterupted) {
          return clearInterval(this.id);
        } else {
          return clearTimeout(this.id);
        }
      }

      tick() {
        var wasInterupted;
        wasInterupted = this.interupted;
        this.interupted = false;
        if (this.repeat) {
          this.remainingTime = this.time;
        } else {
          this.remainingTime = 0;
        }
        this.dispatcher.update();
        if (this.repeat) {
          if (wasInterupted) {
            return this._start();
          } else {
            return this.startTime = this.constructor.now();
          }
        } else {
          return this.destroy();
        }
      }

      destroy() {
        if (this.repeat) {
          clearInterval(this.id);
        } else {
          clearTimeout(this.id);
        }
        this.updater.destroy();
        this.dispatcher.destroy();
        this.running = false;
        if (this.parent) {
          return this.parent.removeChild(this);
        }
      }

    };
    Timing.Updater = class Updater {
      constructor(parent1) {
        this.parent = parent1;
        this.dispatcher = new BaseUpdater();
        this.callbacks = [];
      }

      addCallback(callback) {
        var ref3;
        if (!this.callbacks.includes(callback)) {
          this.callbacks.push(callback);
        }
        if (((ref3 = this.parent) != null ? ref3.running : void 0) && this.dispatcher) {
          return this.dispatcher.addCallback(callback);
        }
      }

      removeCallback(callback) {
        var index;
        index = this.callbacks.indexOf(callback);
        if (index !== -1) {
          this.callbacks.splice(index, 1);
        }
        if (this.dispatcher) {
          return this.dispatcher.removeCallback(callback);
        }
      }

      getBinder() {
        if (this.dispatcher) {
          return new BaseUpdater.Binder(this);
        }
      }

      forwardCallbacks() {
        if (this.dispatcher) {
          return this.callbacks.forEach((callback) => {
            return this.dispatcher.addCallback(callback);
          });
        }
      }

      unforwardCallbacks() {
        if (this.dispatcher) {
          return this.callbacks.forEach((callback) => {
            return this.dispatcher.removeCallback(callback);
          });
        }
      }

      destroy() {
        this.unforwardCallbacks();
        this.callbacks = [];
        return this.parent = null;
      }

    };
    return Timing;
  });

  (function(definition) {
    Parallelio.Spark.PropertyWatcher = definition();
    return Parallelio.Spark.PropertyWatcher.definition = definition;
  })(function(dependencies = {}) {
    var Binder, PropertyWatcher;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Parallelio.Spark.Binder;
    PropertyWatcher = class PropertyWatcher extends Binder {
      constructor(options1) {
        var ref3;
        super();
        this.options = options1;
        this.invalidateCallback = () => {
          return this.invalidate();
        };
        this.updateCallback = (old) => {
          return this.update(old);
        };
        if (this.options != null) {
          this.loadOptions(this.options);
        }
        if (!(((ref3 = this.options) != null ? ref3.initByLoader : void 0) && (this.options.loader != null))) {
          this.init();
        }
      }

      loadOptions(options) {
        this.scope = options.scope;
        if (options.loaderAsScope && (options.loader != null)) {
          this.scope = options.loader;
        }
        this.property = options.property;
        this.callback = options.callback;
        return this.autoBind = options.autoBind;
      }

      copyWith(opt) {
        return new this.__proto__.constructor(Object.assign({}, this.options, opt));
      }

      init() {
        if (this.autoBind) {
          return this.checkBind();
        }
      }

      getProperty() {
        if (typeof this.property === "string") {
          this.property = this.scope.getPropertyInstance(this.property);
        }
        return this.property;
      }

      checkBind() {
        return this.toggleBind(this.shouldBind());
      }

      shouldBind() {
        return true;
      }

      canBind() {
        return this.getProperty() != null;
      }

      doBind() {
        this.update();
        this.getProperty().on('invalidated', this.invalidateCallback);
        return this.getProperty().on('updated', this.updateCallback);
      }

      doUnbind() {
        this.getProperty().off('invalidated', this.invalidateCallback);
        return this.getProperty().off('updated', this.updateCallback);
      }

      getRef() {
        if (typeof this.property === "string") {
          return {
            property: this.property,
            target: this.scope,
            callback: this.callback
          };
        } else {
          return {
            property: this.property.property.name,
            target: this.property.obj,
            callback: this.callback
          };
        }
      }

      invalidate() {
        return this.getProperty().get();
      }

      update(old) {
        var value;
        value = this.getProperty().get();
        return this.handleChange(value, old);
      }

      handleChange(value, old) {
        return this.callback.call(this.scope, old);
      }

    };
    return PropertyWatcher;
  });

  (function(definition) {
    Parallelio.Spark.EventBind = definition();
    return Parallelio.Spark.EventBind.definition = definition;
  })(function(dependencies = {}) {
    var Binder, EventBind;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Parallelio.Spark.Binder;
    EventBind = class EventBind extends Binder {
      constructor(event1, target1, callback1) {
        super();
        this.event = event1;
        this.target = target1;
        this.callback = callback1;
      }

      getRef() {
        return {
          event: this.event,
          target: this.target,
          callback: this.callback
        };
      }

      bindTo(target) {
        this.unbind();
        this.target = target;
        return this.bind();
      }

      doBind() {
        if (typeof this.target.addEventListener === 'function') {
          return this.target.addEventListener(this.event, this.callback);
        } else if (typeof this.target.addListener === 'function') {
          return this.target.addListener(this.event, this.callback);
        } else if (typeof this.target.on === 'function') {
          return this.target.on(this.event, this.callback);
        } else {
          throw new Error('No function to add event listeners was found');
        }
      }

      doUnbind() {
        if (typeof this.target.removeEventListener === 'function') {
          return this.target.removeEventListener(this.event, this.callback);
        } else if (typeof this.target.removeListener === 'function') {
          return this.target.removeListener(this.event, this.callback);
        } else if (typeof this.target.off === 'function') {
          return this.target.off(this.event, this.callback);
        } else {
          throw new Error('No function to remove event listeners was found');
        }
      }

      equals(eventBind) {
        return super.equals(eventBind) && eventBind.event === this.event;
      }

      match(event, target) {
        return event === this.event && target === this.target;
      }

      static checkEmitter(emitter, fatal = true) {
        if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
          return true;
        } else if (fatal) {
          throw new Error('No function to add event listeners was found');
        } else {
          return false;
        }
      }

    };
    return EventBind;
  });

  (function(definition) {
    Parallelio.Spark.Invalidator = definition();
    return Parallelio.Spark.Invalidator.definition = definition;
  })(function(dependencies = {}) {
    var Binder, EventBind, Invalidator, pluck;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Parallelio.Spark.Binder;
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
      class Invalidator extends Binder {
        constructor(invalidated, scope = null) {
          super();
          this.invalidated = invalidated;
          this.scope = scope;
          this.invalidationEvents = [];
          this.recycled = [];
          this.unknowns = [];
          this.strict = this.constructor.strict;
          this.invalid = false;
          this.invalidateCallback = () => {
            this.invalidate();
            return null;
          };
          this.invalidateCallback.owner = this;
        }

        invalidate() {
          var functName;
          this.invalid = true;
          if (typeof this.invalidated === "function") {
            return this.invalidated();
          } else if (typeof this.callback === "function") {
            return this.callback();
          } else if ((this.invalidated != null) && typeof this.invalidated.invalidate === "function") {
            return this.invalidated.invalidate();
          } else if (typeof this.invalidated === "string") {
            functName = 'invalidate' + this.invalidated.charAt(0).toUpperCase() + this.invalidated.slice(1);
            if (typeof this.scope[functName] === "function") {
              return this.scope[functName]();
            } else {
              return this.scope[this.invalidated] = null;
            }
          }
        }

        unknown() {
          var ref3;
          if (typeof ((ref3 = this.invalidated) != null ? ref3.unknown : void 0) === "function") {
            return this.invalidated.unknown();
          } else {
            return this.invalidate();
          }
        }

        addEventBind(event, target, callback) {
          return this.addBinder(new EventBind(event, target, callback));
        }

        addBinder(binder) {
          if (binder.callback == null) {
            binder.callback = this.invalidateCallback;
          }
          if (!this.invalidationEvents.some(function(eventBind) {
            return eventBind.equals(binder);
          })) {
            return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
              return eventBind.equals(binder);
            }) || binder);
          }
        }

        getUnknownCallback(prop) {
          var callback;
          callback = () => {
            return this.addUnknown(function() {
              return prop.get();
            }, prop);
          };
          callback.ref = {
            prop: prop
          };
          return callback;
        }

        addUnknown(fn, prop) {
          if (!this.findUnknown(prop)) {
            fn.ref = {
              "prop": prop
            };
            this.unknowns.push(fn);
            return this.unknown();
          }
        }

        findUnknown(prop) {
          if ((prop != null) || (typeof target !== "undefined" && target !== null)) {
            return this.unknowns.find(function(unknown) {
              return unknown.ref.prop === prop;
            });
          }
        }

        event(event, target = this.scope) {
          if (this.checkEmitter(target)) {
            return this.addEventBind(event, target);
          }
        }

        value(val, event, target = this.scope) {
          this.event(event, target);
          return val;
        }

        prop(prop, target = this.scope) {
          var propInstance;
          if (typeof prop === 'string') {
            if ((target.getPropertyInstance != null) && (propInstance = target.getPropertyInstance(prop))) {
              prop = propInstance;
            } else {
              return target[prop];
            }
          } else if (!this.checkPropInstance(prop)) {
            throw new Error('Property must be a PropertyInstance or a string');
          }
          this.addEventBind('invalidated', prop, this.getUnknownCallback(prop));
          return this.value(prop.get(), 'updated', prop);
        }

        propPath(path, target = this.scope) {
          var prop, val;
          path = path.split('.');
          val = target;
          while ((val != null) && path.length > 0) {
            prop = path.shift();
            val = this.prop(prop, val);
          }
          return val;
        }

        propInitiated(prop, target = this.scope) {
          var initiated;
          if (typeof prop === 'string' && (target.getPropertyInstance != null)) {
            prop = target.getPropertyInstance(prop);
          } else if (!this.checkPropInstance(prop)) {
            throw new Error('Property must be a PropertyInstance or a string');
          }
          initiated = prop.initiated;
          if (!initiated) {
            this.event('updated', prop);
          }
          return initiated;
        }

        funct(funct) {
          var invalidator, res;
          invalidator = new Invalidator(() => {
            return this.addUnknown(() => {
              var res2;
              res2 = funct(invalidator);
              if (res !== res2) {
                return this.invalidate();
              }
            }, invalidator);
          });
          res = funct(invalidator);
          this.invalidationEvents.push(invalidator);
          return res;
        }

        validateUnknowns() {
          var unknowns;
          unknowns = this.unknowns;
          this.unknowns = [];
          return unknowns.forEach(function(unknown) {
            return unknown();
          });
        }

        isEmpty() {
          return this.invalidationEvents.length === 0;
        }

        bind() {
          this.invalid = false;
          return this.invalidationEvents.forEach(function(eventBind) {
            return eventBind.bind();
          });
        }

        recycle(callback) {
          var done, res;
          this.recycled = this.invalidationEvents;
          this.invalidationEvents = [];
          done = this.endRecycle.bind(this);
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
        }

        endRecycle() {
          this.recycled.forEach(function(eventBind) {
            return eventBind.unbind();
          });
          return this.recycled = [];
        }

        checkEmitter(emitter) {
          return EventBind.checkEmitter(emitter, this.strict);
        }

        checkPropInstance(prop) {
          return typeof prop.get === "function" && this.checkEmitter(prop);
        }

        unbind() {
          return this.invalidationEvents.forEach(function(eventBind) {
            return eventBind.unbind();
          });
        }

      };

      Invalidator.strict = true;

      return Invalidator;

    }).call(this);
    return Invalidator;
  });

  (function(definition) {
    Parallelio.Spark.CollectionPropertyWatcher = definition();
    return Parallelio.Spark.CollectionPropertyWatcher.definition = definition;
  })(function(dependencies = {}) {
    var CollectionPropertyWatcher, PropertyWatcher;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Parallelio.Spark.PropertyWatcher;
    CollectionPropertyWatcher = class CollectionPropertyWatcher extends PropertyWatcher {
      loadOptions(options) {
        super.loadOptions(options);
        this.onAdded = options.onAdded;
        return this.onRemoved = options.onRemoved;
      }

      handleChange(value, old) {
        old = value.copy(old || []);
        if (typeof this.callback === 'function') {
          this.callback.call(this.scope, old);
        }
        if (typeof this.onAdded === 'function') {
          value.forEach((item, i) => {
            if (!old.includes(item)) {
              return this.onAdded.call(this.scope, item);
            }
          });
        }
        if (typeof this.onRemoved === 'function') {
          return old.forEach((item, i) => {
            if (!value.includes(item)) {
              return this.onRemoved.call(this.scope, item);
            }
          });
        }
      }

    };
    return CollectionPropertyWatcher;
  });

  (function(definition) {
    Parallelio.Spark.BasicProperty = definition();
    return Parallelio.Spark.BasicProperty.definition = definition;
  })(function(dependencies = {}) {
    var BasicProperty, EventEmitter, Loader, Mixable, PropertyWatcher, Referred;
    Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : Parallelio.Spark.Mixable;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Parallelio.Spark.EventEmitter;
    Loader = dependencies.hasOwnProperty("Loader") ? dependencies.Loader : Parallelio.Spark.Loader;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Parallelio.Spark.PropertyWatcher;
    Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : Parallelio.Spark.Referred;
    BasicProperty = (function() {
      class BasicProperty extends Mixable {
        constructor(property1, obj3) {
          super();
          this.property = property1;
          this.obj = obj3;
        }

        init() {
          var preload;
          this.value = this.ingest(this.default);
          this.calculated = false;
          this.initiated = false;
          preload = this.constructor.getPreload(this.obj, this.property, this);
          if (preload.length > 0) {
            return Loader.loadMany(preload);
          }
        }

        get() {
          this.calculated = true;
          if (!this.initiated) {
            this.initiated = true;
            this.emitEvent('updated');
          }
          return this.output();
        }

        set(val) {
          return this.setAndCheckChanges(val);
        }

        callbackSet(val) {
          this.callOptionFunct("set", val);
          return this;
        }

        setAndCheckChanges(val) {
          var old;
          val = this.ingest(val);
          this.revalidated();
          if (this.checkChanges(val, this.value)) {
            old = this.value;
            this.value = val;
            this.manual = true;
            this.changed(old);
          }
          return this;
        }

        checkChanges(val, old) {
          return val !== old;
        }

        destroy() {
          var ref3;
          if (this.property.options.destroy === true && (((ref3 = this.value) != null ? ref3.destroy : void 0) != null)) {
            this.value.destroy();
          }
          if (typeof this.property.options.destroy === 'function') {
            this.callOptionFunct('destroy', this.value);
          }
          return this.value = null;
        }

        callOptionFunct(funct, ...args) {
          if (typeof funct === 'string') {
            funct = this.property.options[funct];
          }
          if (typeof funct.overrided === 'function') {
            args.push((...args) => {
              return this.callOptionFunct(funct.overrided, ...args);
            });
          }
          return funct.apply(this.obj, args);
        }

        revalidated() {
          this.calculated = true;
          return this.initiated = true;
        }

        ingest(val) {
          if (typeof this.property.options.ingest === 'function') {
            return val = this.callOptionFunct("ingest", val);
          } else {
            return val;
          }
        }

        output() {
          if (typeof this.property.options.output === 'function') {
            return this.callOptionFunct("output", this.value);
          } else {
            return this.value;
          }
        }

        changed(old) {
          this.emitEvent('updated', old);
          this.emitEvent('changed', old);
          return this;
        }

        static compose(prop) {
          if (prop.instanceType == null) {
            prop.instanceType = class extends BasicProperty {};
          }
          if (typeof prop.options.set === 'function') {
            prop.instanceType.prototype.set = this.prototype.callbackSet;
          } else {
            prop.instanceType.prototype.set = this.prototype.setAndCheckChanges;
          }
          return prop.instanceType.prototype.default = prop.options.default;
        }

        static bind(target, prop) {
          var maj, opt, preload;
          maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
          opt = {
            configurable: true,
            get: function() {
              return prop.getInstance(this).get();
            }
          };
          if (prop.options.set !== false) {
            opt.set = function(val) {
              return prop.getInstance(this).set(val);
            };
          }
          Object.defineProperty(target, prop.name, opt);
          target['get' + maj] = function() {
            return prop.getInstance(this).get();
          };
          if (prop.options.set !== false) {
            target['set' + maj] = function(val) {
              prop.getInstance(this).set(val);
              return this;
            };
          }
          target['invalidate' + maj] = function() {
            prop.getInstance(this).invalidate();
            return this;
          };
          preload = this.getPreload(target, prop);
          if (preload.length > 0) {
            Mixable.Extension.makeOnce(Loader.prototype, target);
            return target.preload(preload);
          }
        }

        static getPreload(target, prop, instance) {
          var preload, ref3, ref4, toLoad;
          preload = [];
          if (typeof prop.options.change === "function") {
            toLoad = {
              type: PropertyWatcher,
              loaderAsScope: true,
              property: instance || prop.name,
              initByLoader: true,
              autoBind: true,
              callback: prop.options.change,
              ref: {
                prop: prop.name,
                callback: prop.options.change,
                context: 'change'
              }
            };
          }
          if (typeof ((ref3 = prop.options.change) != null ? ref3.copyWith : void 0) === "function") {
            toLoad = {
              type: prop.options.change,
              loaderAsScope: true,
              property: instance || prop.name,
              initByLoader: true,
              autoBind: true,
              ref: {
                prop: prop.name,
                type: prop.options.change,
                context: 'change'
              }
            };
          }
          if ((toLoad != null) && !((ref4 = target.preloaded) != null ? ref4.find(function(loaded) {
            return Referred.compareRef(toLoad.ref, loaded.ref) && !instance || (loaded.instance != null);
          }) : void 0)) {
            preload.push(toLoad);
          }
          return preload;
        }

      };

      BasicProperty.extend(EventEmitter);

      return BasicProperty;

    }).call(this);
    return BasicProperty;
  });

  (function(definition) {
    Parallelio.Spark.DynamicProperty = definition();
    return Parallelio.Spark.DynamicProperty.definition = definition;
  })(function(dependencies = {}) {
    var BasicProperty, DynamicProperty, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : Parallelio.Spark.BasicProperty;
    DynamicProperty = class DynamicProperty extends BasicProperty {
      callbackGet() {
        var res;
        res = this.callOptionFunct("get");
        this.revalidated();
        return res;
      }

      invalidate() {
        if (this.calculated) {
          this.calculated = false;
          this._invalidateNotice();
        }
        return this;
      }

      _invalidateNotice() {
        this.emitEvent('invalidated');
        return true;
      }

      static compose(prop) {
        if (typeof prop.options.get === 'function' || typeof prop.options.calcul === 'function') {
          if (prop.instanceType == null) {
            prop.instanceType = class extends DynamicProperty {};
          }
        }
        if (typeof prop.options.get === 'function') {
          return prop.instanceType.prototype.get = this.prototype.callbackGet;
        }
      }

    };
    return DynamicProperty;
  });

  (function(definition) {
    Parallelio.Spark.CollectionProperty = definition();
    return Parallelio.Spark.CollectionProperty.definition = definition;
  })(function(dependencies = {}) {
    var Collection, CollectionProperty, CollectionPropertyWatcher, DynamicProperty, Referred;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Parallelio.Spark.DynamicProperty;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Parallelio.Spark.Collection;
    Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : Parallelio.Spark.Referred;
    CollectionPropertyWatcher = dependencies.hasOwnProperty("CollectionPropertyWatcher") ? dependencies.CollectionPropertyWatcher : Parallelio.Spark.CollectionPropertyWatcher;
    CollectionProperty = (function() {
      class CollectionProperty extends DynamicProperty {
        ingest(val) {
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
        }

        checkChangedItems(val, old) {
          var compareFunction;
          if (typeof this.collectionOptions.compare === 'function') {
            compareFunction = this.collectionOptions.compare;
          }
          return (new Collection(val)).checkChanges(old, this.collectionOptions.ordered, compareFunction);
        }

        output() {
          var col, prop, value;
          value = this.value;
          if (typeof this.property.options.output === 'function') {
            value = this.callOptionFunct("output", this.value);
          }
          prop = this;
          col = Collection.newSubClass(this.collectionOptions, value);
          col.changed = function(old) {
            return prop.changed(old);
          };
          return col;
        }

        static compose(prop) {
          if (prop.options.collection != null) {
            prop.instanceType = class extends CollectionProperty {};
            prop.instanceType.prototype.collectionOptions = Object.assign({}, this.defaultCollectionOptions, typeof prop.options.collection === 'object' ? prop.options.collection : {});
            if (prop.options.collection.compare != null) {
              return prop.instanceType.prototype.checkChanges = this.prototype.checkChangedItems;
            }
          }
        }

        static getPreload(target, prop, instance) {
          var preload, ref, ref3;
          preload = [];
          if (typeof prop.options.change === "function" || typeof prop.options.itemAdded === 'function' || typeof prop.options.itemRemoved === 'function') {
            ref = {
              prop: prop.name,
              context: 'change'
            };
            if (!((ref3 = target.preloaded) != null ? ref3.find(function(loaded) {
              return Referred.compareRef(ref, loaded.ref) && (loaded.instance != null);
            }) : void 0)) {
              preload.push({
                type: CollectionPropertyWatcher,
                loaderAsScope: true,
                scope: target,
                property: instance || prop.name,
                initByLoader: true,
                autoBind: true,
                callback: prop.options.change,
                onAdded: prop.options.itemAdded,
                onRemoved: prop.options.itemRemoved,
                ref: ref
              });
            }
          }
          return preload;
        }

      };

      CollectionProperty.defaultCollectionOptions = {
        compare: false,
        ordered: true
      };

      return CollectionProperty;

    }).call(this);
    return CollectionProperty;
  });

  (function(definition) {
    Parallelio.Spark.CalculatedProperty = definition();
    return Parallelio.Spark.CalculatedProperty.definition = definition;
  })(function(dependencies = {}) {
    var CalculatedProperty, DynamicProperty, Invalidator, Overrider;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Parallelio.Spark.DynamicProperty;
    Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : Parallelio.Spark.Overrider;
    CalculatedProperty = (function() {
      class CalculatedProperty extends DynamicProperty {
        calcul() {
          this.value = this.callOptionFunct(this.calculFunct);
          this.manual = false;
          this.revalidated();
          return this.value;
        }

        static compose(prop) {
          if (typeof prop.options.calcul === 'function') {
            prop.instanceType.prototype.calculFunct = prop.options.calcul;
            if (!(prop.options.calcul.length > 0)) {
              return prop.instanceType.extend(CalculatedProperty);
            }
          }
        }

      };

      CalculatedProperty.extend(Overrider);

      CalculatedProperty.overrides({
        get: function() {
          var initiated, old;
          if (this.invalidator) {
            this.invalidator.validateUnknowns();
          }
          if (!this.calculated) {
            old = this.value;
            initiated = this.initiated;
            this.calcul();
            if (this.checkChanges(this.value, old)) {
              if (initiated) {
                this.changed(old);
              } else {
                this.emitEvent('updated', old);
              }
            } else if (!initiated) {
              this.emitEvent('updated', old);
            }
          }
          return this.output();
        }
      });

      return CalculatedProperty;

    }).call(this);
    return CalculatedProperty;
  });

  (function(definition) {
    Parallelio.Spark.ComposedProperty = definition();
    return Parallelio.Spark.ComposedProperty.definition = definition;
  })(function(dependencies = {}) {
    var CalculatedProperty, Collection, ComposedProperty, Invalidator;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Parallelio.Spark.CalculatedProperty;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Parallelio.Spark.Collection;
    ComposedProperty = (function() {
      class ComposedProperty extends CalculatedProperty {
        init() {
          this.initComposed();
          return super.init();
        }

        initComposed() {
          if (this.property.options.hasOwnProperty('default')) {
            this.default = this.property.options.default;
          } else {
            this.default = this.value = true;
          }
          this.members = new ComposedProperty.Members(this.property.options.members);
          this.members.changed = (old) => {
            return this.invalidate();
          };
          return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options.default === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
        }

        calcul() {
          if (!this.invalidator) {
            this.invalidator = new Invalidator(this, this.obj);
          }
          this.invalidator.recycle((invalidator, done) => {
            this.value = this.members.reduce((prev, member) => {
              var val;
              val = typeof member === 'function' ? member(this.invalidator) : member;
              return this.join(prev, val);
            }, this.default);
            done();
            if (invalidator.isEmpty()) {
              return this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          });
          this.revalidated();
          return this.value;
        }

        static compose(prop) {
          if (prop.options.composed != null) {
            return prop.instanceType = class extends ComposedProperty {};
          }
        }

        static bind(target, prop) {
          CalculatedProperty.bind(target, prop);
          return Object.defineProperty(target, prop.name + 'Members', {
            configurable: true,
            get: function() {
              return prop.getInstance(this).members;
            }
          });
        }

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

    }).call(this);
    ComposedProperty.Members = class Members extends Collection {
      addPropertyRef(name, obj) {
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
      }

      addValueRef(val, name, obj) {
        var fn;
        if (this.findRefIndex(name, obj) === -1) {
          fn = function(invalidator) {
            return val;
          };
          fn.ref = {
            name: name,
            obj: obj,
            val: val
          };
          return this.push(fn);
        }
      }

      setValueRef(val, name, obj) {
        var fn, i, ref;
        i = this.findRefIndex(name, obj);
        if (i === -1) {
          return this.addValueRef(val, name, obj);
        } else if (this.get(i).ref.val !== val) {
          ref = {
            name: name,
            obj: obj,
            val: val
          };
          fn = function(invalidator) {
            return val;
          };
          fn.ref = ref;
          return this.set(i, fn);
        }
      }

      getValueRef(name, obj) {
        return this.findByRef(name, obj).ref.val;
      }

      addFunctionRef(fn, name, obj) {
        if (this.findRefIndex(name, obj) === -1) {
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      }

      findByRef(name, obj) {
        return this._array[this.findRefIndex(name, obj)];
      }

      findRefIndex(name, obj) {
        return this._array.findIndex(function(member) {
          return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
        });
      }

      removeRef(name, obj) {
        var index, old;
        index = this.findRefIndex(name, obj);
        if (index !== -1) {
          old = this.toArray();
          this._array.splice(index, 1);
          return this.changed(old);
        }
      }

    };
    return ComposedProperty;
  });

  (function(definition) {
    Parallelio.Spark.InvalidatedProperty = definition();
    return Parallelio.Spark.InvalidatedProperty.definition = definition;
  })(function(dependencies = {}) {
    var CalculatedProperty, InvalidatedProperty, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Parallelio.Spark.CalculatedProperty;
    InvalidatedProperty = (function() {
      class InvalidatedProperty extends CalculatedProperty {
        unknown() {
          if (this.calculated || this.active === false) {
            this._invalidateNotice();
          }
          return this;
        }

        static compose(prop) {
          if (typeof prop.options.calcul === 'function' && prop.options.calcul.length > 0) {
            return prop.instanceType.extend(InvalidatedProperty);
          }
        }

      };

      InvalidatedProperty.overrides({
        calcul: function() {
          if (!this.invalidator) {
            this.invalidator = new Invalidator(this, this.obj);
          }
          this.invalidator.recycle((invalidator, done) => {
            this.value = this.callOptionFunct(this.calculFunct, invalidator);
            this.manual = false;
            done();
            if (invalidator.isEmpty()) {
              return this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          });
          this.revalidated();
          return this.value;
        },
        destroy: function() {
          this.destroy.withoutInvalidatedProperty();
          if (this.invalidator != null) {
            return this.invalidator.unbind();
          }
        },
        invalidate: function() {
          if (this.calculated || this.active === false) {
            this.calculated = false;
            this._invalidateNotice();
            if (!this.calculated && (this.invalidator != null)) {
              this.invalidator.unbind();
            }
          }
          return this;
        }
      });

      return InvalidatedProperty;

    }).call(this);
    return InvalidatedProperty;
  });

  (function(definition) {
    Parallelio.Spark.Property = definition();
    return Parallelio.Spark.Property.definition = definition;
  })(function(dependencies = {}) {
    var BasicProperty, CalculatedProperty, CollectionProperty, ComposedProperty, DynamicProperty, InvalidatedProperty, Mixable, Property, PropertyOwner;
    BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : Parallelio.Spark.BasicProperty;
    CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : Parallelio.Spark.CollectionProperty;
    ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : Parallelio.Spark.ComposedProperty;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Parallelio.Spark.DynamicProperty;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Parallelio.Spark.CalculatedProperty;
    InvalidatedProperty = dependencies.hasOwnProperty("InvalidatedProperty") ? dependencies.InvalidatedProperty : Parallelio.Spark.InvalidatedProperty;
    PropertyOwner = dependencies.hasOwnProperty("PropertyOwner") ? dependencies.PropertyOwner : Parallelio.Spark.PropertyOwner;
    Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : Parallelio.Spark.Mixable;
    Property = (function() {
      class Property {
        constructor(name1, options1 = {}) {
          this.name = name1;
          this.options = options1;
        }

        bind(target) {
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
            this.makeOwner(target);
          }
          return prop;
        }

        override(parent) {
          var key, ref3, results, value;
          if (this.options.parent == null) {
            this.options.parent = parent.options;
            ref3 = parent.options;
            results = [];
            for (key in ref3) {
              value = ref3[key];
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
        }

        makeOwner(target) {
          var ref3;
          if (!((ref3 = target.extensions) != null ? ref3.includes(PropertyOwner.prototype) : void 0)) {
            return Mixable.Extension.make(PropertyOwner.prototype, target);
          }
        }

        getInstanceVarName() {
          return this.options.instanceVarName || '_' + this.name;
        }

        isInstantiated(obj) {
          return obj[this.getInstanceVarName()] != null;
        }

        getInstance(obj) {
          var Type, varName;
          varName = this.getInstanceVarName();
          if (!this.isInstantiated(obj)) {
            Type = this.getInstanceType();
            obj[varName] = new Type(this, obj);
            obj[varName].init();
          }
          return obj[varName];
        }

        getInstanceType() {
          if (!this.instanceType) {
            this.composers.forEach((composer) => {
              return composer.compose(this);
            });
          }
          return this.instanceType;
        }

      };

      Property.prototype.composers = [ComposedProperty, CollectionProperty, DynamicProperty, BasicProperty, CalculatedProperty, InvalidatedProperty];

      return Property;

    }).call(this);
    return Property;
  });

  (function(definition) {
    Parallelio.Spark.Element = definition();
    return Parallelio.Spark.Element.definition = definition;
  })(function(dependencies = {}) {
    var Element, Mixable, Property;
    Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : Parallelio.Spark.Property;
    Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : Parallelio.Spark.Mixable;
    Element = class Element extends Mixable {
      constructor() {
        super();
        this.init();
      }

      init() {}

      tap(name) {
        var args;
        args = Array.prototype.slice.call(arguments);
        if (typeof name === 'function') {
          name.apply(this, args.slice(1));
        } else {
          this[name].apply(this, args.slice(1));
        }
        return this;
      }

      callback(name) {
        if (this._callbacks == null) {
          this._callbacks = {};
        }
        if (this._callbacks[name] == null) {
          this._callbacks[name] = (...args) => {
            this[name].apply(this, args);
            return null;
          };
          this._callbacks[name].owner = this;
        }
        return this._callbacks[name];
      }

      getFinalProperties() {
        if (this._properties != null) {
          return ['_properties'].concat(this._properties.map(function(prop) {
            return prop.name;
          }));
        } else {
          return [];
        }
      }

      extended(target) {
        var k, len, options, property, ref3, results;
        if (this._properties != null) {
          ref3 = this._properties;
          results = [];
          for (k = 0, len = ref3.length; k < len; k++) {
            property = ref3[k];
            options = Object.assign({}, property.options);
            results.push((new Property(property.name, options)).bind(target));
          }
          return results;
        }
      }

      static property(prop, desc) {
        return (new Property(prop, desc)).bind(this.prototype);
      }

      static properties(properties) {
        var desc, prop, results;
        results = [];
        for (prop in properties) {
          desc = properties[prop];
          results.push(this.property(prop, desc));
        }
        return results;
      }

    };
    return Element;
  });

  (function(definition) {
    Parallelio.PathWalk = definition();
    return Parallelio.PathWalk.definition = definition;
  })(function(dependencies = {}) {
    var Element, EventEmitter, PathWalk, Timing;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : Parallelio.Timing;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Parallelio.Spark.EventEmitter;
    PathWalk = (function() {
      class PathWalk extends Element {
        constructor(walker, path1, options) {
          super();
          this.walker = walker;
          this.path = path1;
          this.setProperties(options);
        }

        start() {
          if (!this.path.solution) {
            this.path.calcul();
          }
          if (this.path.solution) {
            this.pathTimeout = this.timing.setTimeout(() => {
              return this.finish();
            }, this.totalTime);
            return this.pathTimeout.updater.addCallback(this.callback('update'));
          }
        }

        stop() {
          return this.pathTimeout.pause();
        }

        update() {
          var pos;
          pos = this.path.getPosAtPrc(this.pathTimeout.getPrc());
          this.walker.tile = pos.tile;
          this.walker.offsetX = pos.offsetX;
          return this.walker.offsetY = pos.offsetY;
        }

        finish() {
          this.update();
          this.trigger('finished');
          return this.end();
        }

        interrupt() {
          this.update();
          this.trigger('interrupted');
          return this.end();
        }

        end() {
          this.trigger('end');
          return this.destroy();
        }

        destroy() {
          if (this.walker.walk === this) {
            this.walker.walk = null;
          }
          this.pathTimeout.destroy();
          this.destroyProperties();
          return this.removeAllListeners();
        }

      };

      PathWalk.include(EventEmitter.prototype);

      PathWalk.properties({
        speed: {
          default: 5
        },
        timing: {
          calcul: function() {
            return new Timing();
          }
        },
        pathLength: {
          calcul: function() {
            return this.path.solution.getTotalLength();
          }
        },
        totalTime: {
          calcul: function() {
            return this.pathLength / this.speed * 1000;
          }
        }
      });

      return PathWalk;

    }).call(this);
    return PathWalk;
  });

  (function(definition) {
    Parallelio.Tiled = definition();
    return Parallelio.Tiled.definition = definition;
  })(function(dependencies = {}) {
    var Element, Tiled;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Tiled = (function() {
      class Tiled extends Element {
        putOnRandomTile(tiles) {
          var found;
          found = this.getRandomValidTile(tiles);
          if (found) {
            return this.tile = found;
          }
        }

        getRandomValidTile(tiles) {
          var candidate, pos, remaining;
          remaining = tiles.slice();
          while (remaining.length > 0) {
            pos = Math.floor(Math.random() * remaining.length);
            candidate = remaining.splice(pos, 1)[0];
            if (this.canGoOnTile(candidate)) {
              return candidate;
            }
          }
          return null;
        }

        canGoOnTile(tile) {
          return true;
        }

        getFinalTile() {
          return this.tile.getFinalTile();
        }

      };

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
        },
        offsetX: {
          default: 0
        },
        offsetY: {
          default: 0
        }
      });

      return Tiled;

    }).call(this);
    return Tiled;
  });

  (function(definition) {
    Parallelio.Door = definition();
    return Parallelio.Door.definition = definition;
  })(function(dependencies = {}) {
    var Door, Tiled;
    Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : Parallelio.Tiled;
    Door = (function() {
      class Door extends Tiled {
        constructor(direction1 = Door.directions.horizontal) {
          super();
          this.direction = direction1;
        }

        updateTileMembers(old) {
          var ref3, ref4, ref5, ref6;
          if (old != null) {
            if ((ref3 = old.walkableMembers) != null) {
              ref3.removeRef('open', this);
            }
            if ((ref4 = old.transparentMembers) != null) {
              ref4.removeRef('open', this);
            }
          }
          if (this.tile) {
            if ((ref5 = this.tile.walkableMembers) != null) {
              ref5.addPropertyRef('open', this);
            }
            return (ref6 = this.tile.transparentMembers) != null ? ref6.addPropertyRef('open', this) : void 0;
          }
        }

      };

      Door.properties({
        tile: {
          change: function(old) {
            return this.updateTileMembers(old);
          }
        },
        open: {
          default: false
        },
        direction: {}
      });

      Door.directions = {
        horizontal: 'horizontal',
        vertical: 'vertical'
      };

      return Door;

    }).call(this);
    return Door;
  });

  (function(definition) {
    Parallelio.PathFinder = definition();
    return Parallelio.PathFinder.definition = definition;
  })(function(dependencies = {}) {
    var Element, PathFinder;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    PathFinder = (function() {
      class PathFinder extends Element {
        constructor(tilesContainer, from1, to1, options = {}) {
          super();
          this.tilesContainer = tilesContainer;
          this.from = from1;
          this.to = to1;
          this.reset();
          if (options.validTile != null) {
            this.validTileCallback = options.validTile;
          }
          if (options.arrived != null) {
            this.arrivedCallback = options.arrived;
          }
          if (options.efficiency != null) {
            this.efficiencyCallback = options.efficiency;
          }
        }

        reset() {
          this.queue = [];
          this.paths = {};
          this.solution = null;
          return this.started = false;
        }

        calcul() {
          while (!this.solution && (!this.started || this.queue.length)) {
            this.step();
          }
          return this.getPath();
        }

        step() {
          var next;
          if (this.queue.length) {
            next = this.queue.pop();
            this.addNextSteps(next);
            return true;
          } else if (!this.started) {
            return this.start();
          }
        }

        start() {
          this.started = true;
          if (this.to === false || this.tileIsValid(this.to)) {
            this.addNextSteps();
            return true;
          }
        }

        getPath() {
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
        }

        getPosAtPrc(prc) {
          if (isNaN(prc)) {
            throw new Error('Invalid number');
          }
          if (this.solution) {
            return this.getPosAtTime(this.solution.getTotalLength() * prc);
          }
        }

        getPosAtTime(time) {
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
        }

        getSolutionTileList() {
          var step, tilelist;
          if (this.solution) {
            step = this.solution;
            tilelist = [step.tile];
            while (step.prev != null) {
              step = step.prev;
              tilelist.unshift(step.tile);
            }
            return tilelist;
          }
        }

        tileIsValid(tile) {
          if (this.validTileCallback != null) {
            return this.validTileCallback(tile);
          } else {
            return (tile != null) && (!tile.emulated || (tile.tile !== 0 && tile.tile !== false));
          }
        }

        getTile(x, y) {
          var ref3;
          if (this.tilesContainer.getTile != null) {
            return this.tilesContainer.getTile(x, y);
          } else if (((ref3 = this.tilesContainer[y]) != null ? ref3[x] : void 0) != null) {
            return {
              x: x,
              y: y,
              tile: this.tilesContainer[y][x],
              emulated: true
            };
          }
        }

        getConnectedToTile(tile) {
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
        }

        addNextSteps(step = null) {
          var k, len, next, ref3, results, tile;
          tile = step != null ? step.nextTile : this.from;
          ref3 = this.getConnectedToTile(tile);
          results = [];
          for (k = 0, len = ref3.length; k < len; k++) {
            next = ref3[k];
            if (this.tileIsValid(next)) {
              results.push(this.addStep(new PathFinder.Step(this, (step != null ? step : null), tile, next)));
            } else {
              results.push(void 0);
            }
          }
          return results;
        }

        tileEqual(tileA, tileB) {
          return tileA === tileB || ((tileA.emulated || tileB.emulated) && tileA.x === tileB.x && tileA.y === tileB.y);
        }

        arrivedAtDestination(step) {
          if (this.arrivedCallback != null) {
            return this.arrivedCallback(step);
          } else {
            return this.tileEqual(step.tile, this.to);
          }
        }

        addStep(step) {
          var solutionCandidate;
          if (this.paths[step.getExit().x] == null) {
            this.paths[step.getExit().x] = {};
          }
          if (!((this.paths[step.getExit().x][step.getExit().y] != null) && this.paths[step.getExit().x][step.getExit().y].getTotalLength() <= step.getTotalLength())) {
            if (this.paths[step.getExit().x][step.getExit().y] != null) {
              this.removeStep(this.paths[step.getExit().x][step.getExit().y]);
            }
            this.paths[step.getExit().x][step.getExit().y] = step;
            this.queue.splice(this.getStepRank(step), 0, step);
            solutionCandidate = new PathFinder.Step(this, step, step.nextTile, null);
            if (this.arrivedAtDestination(solutionCandidate) && !((this.solution != null) && this.solution.prev.getTotalLength() <= step.getTotalLength())) {
              return this.solution = solutionCandidate;
            }
          }
        }

        removeStep(step) {
          var index;
          index = this.queue.indexOf(step);
          if (index > -1) {
            return this.queue.splice(index, 1);
          }
        }

        best() {
          return this.queue[this.queue.length - 1];
        }

        getStepRank(step) {
          if (this.queue.length === 0) {
            return 0;
          } else {
            return this._getStepRank(step.getEfficiency(), 0, this.queue.length - 1);
          }
        }

        _getStepRank(efficiency, min, max) {
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
        }

      };

      PathFinder.properties({
        validTileCallback: {}
      });

      return PathFinder;

    }).call(this);
    PathFinder.Step = class Step {
      constructor(pathFinder, prev1, tile1, nextTile) {
        this.pathFinder = pathFinder;
        this.prev = prev1;
        this.tile = tile1;
        this.nextTile = nextTile;
      }

      posToTileOffset(x, y) {
        var tile;
        tile = Math.floor(x) === this.tile.x && Math.floor(y) === this.tile.y ? this.tile : (this.nextTile != null) && Math.floor(x) === this.nextTile.x && Math.floor(y) === this.nextTile.y ? this.nextTile : (this.prev != null) && Math.floor(x) === this.prev.tile.x && Math.floor(y) === this.prev.tile.y ? this.prev.tile : console.log('Math.floor(' + x + ') == ' + this.tile.x, 'Math.floor(' + y + ') == ' + this.tile.y, this);
        return {
          x: x,
          y: y,
          tile: tile,
          offsetX: x - tile.x,
          offsetY: y - tile.y
        };
      }

      getExit() {
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
      }

      getEntry() {
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
      }

      getLength() {
        if (this.length == null) {
          this.length = (this.nextTile == null) || (this.prev == null) ? 0.5 : this.prev.tile.x === this.nextTile.x || this.prev.tile.y === this.nextTile.y ? 1 : Math.sqrt(0.5);
        }
        return this.length;
      }

      getStartLength() {
        if (this.startLength == null) {
          this.startLength = this.prev != null ? this.prev.getTotalLength() : 0;
        }
        return this.startLength;
      }

      getTotalLength() {
        if (this.totalLength == null) {
          this.totalLength = this.getStartLength() + this.getLength();
        }
        return this.totalLength;
      }

      getEfficiency() {
        if (this.efficiency == null) {
          if (typeof this.pathFinder.efficiencyCallback === "function") {
            this.efficiency = this.pathFinder.efficiencyCallback(this);
          } else {
            this.efficiency = -this.getRemaining() * 1.1 - this.getTotalLength();
          }
        }
        return this.efficiency;
      }

      getRemaining() {
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
      }

    };
    return PathFinder;
  });

  (function(definition) {
    Parallelio.Action = definition();
    return Parallelio.Action.definition = definition;
  })(function(dependencies = {}) {
    var Action, Element, EventEmitter;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Parallelio.Spark.EventEmitter;
    Action = (function() {
      class Action extends Element {
        constructor(options) {
          super();
          this.setProperties(options);
        }

        withActor(actor) {
          if (this.actor !== actor) {
            return this.copyWith({
              actor: actor
            });
          } else {
            return this;
          }
        }

        copyWith(options) {
          return new this.constructor(Object.assign({
            base: this
          }, this.getManualDataProperties(), options));
        }

        start() {
          return this.execute();
        }

        validActor() {
          return this.actor != null;
        }

        isReady() {
          return this.validActor();
        }

        finish() {
          this.trigger('finished');
          return this.end();
        }

        interrupt() {
          this.trigger('interrupted');
          return this.end();
        }

        end() {
          this.trigger('end');
          return this.destroy();
        }

        destroy() {
          return this.destroyProperties();
        }

      };

      Action.include(EventEmitter.prototype);

      Action.properties({
        actor: {}
      });

      return Action;

    }).call(this);
    return Action;
  });

  (function(definition) {
    Parallelio.TargetAction = definition();
    return Parallelio.TargetAction.definition = definition;
  })(function(dependencies = {}) {
    var Action, TargetAction;
    Action = dependencies.hasOwnProperty("Action") ? dependencies.Action : Parallelio.Action;
    TargetAction = (function() {
      class TargetAction extends Action {
        withTarget(target) {
          if (this.target !== target) {
            return this.copyWith({
              target: target
            });
          } else {
            return this;
          }
        }

        canTarget(target) {
          var instance;
          instance = this.withTarget(target);
          if (instance.validTarget()) {
            return instance;
          }
        }

        validTarget() {
          return this.target != null;
        }

        isReady() {
          return super.isReady() && this.validTarget();
        }

      };

      TargetAction.properties({
        target: {}
      });

      return TargetAction;

    }).call(this);
    return TargetAction;
  });

  (function(definition) {
    Parallelio.WalkAction = definition();
    return Parallelio.WalkAction.definition = definition;
  })(function(dependencies = {}) {
    var PathFinder, PathWalk, TargetAction, WalkAction;
    PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : Parallelio.PathFinder;
    PathWalk = dependencies.hasOwnProperty("PathWalk") ? dependencies.PathWalk : Parallelio.PathWalk;
    TargetAction = dependencies.hasOwnProperty("TargetAction") ? dependencies.TargetAction : Parallelio.TargetAction;
    WalkAction = (function() {
      class WalkAction extends TargetAction {
        execute() {
          if (this.actor.walk != null) {
            this.actor.walk.interrupt();
          }
          this.walk = this.actor.walk = new PathWalk(this.actor, this.pathFinder);
          this.actor.walk.on('finished', () => {
            return this.finish();
          });
          this.actor.walk.on('interrupted', () => {
            return this.interrupt();
          });
          return this.actor.walk.start();
        }

        destroy() {
          super.destroy();
          if (this.walk) {
            return this.walk.destroy();
          }
        }

        validTarget() {
          this.pathFinder.calcul();
          return this.pathFinder.solution != null;
        }

      };

      WalkAction.properties({
        pathFinder: {
          calcul: function() {
            return new PathFinder(this.actor.tile.container, this.actor.tile, this.target, {
              validTile: (tile) => {
                if (typeof this.actor.canGoOnTile === "function") {
                  return this.actor.canGoOnTile(tile);
                } else {
                  return tile.walkable;
                }
              }
            });
          }
        }
      });

      return WalkAction;

    }).call(this);
    return WalkAction;
  });

  (function(definition) {
    Parallelio.Damageable = definition();
    return Parallelio.Damageable.definition = definition;
  })(function(dependencies = {}) {
    var Damageable, Element;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Damageable = (function() {
      class Damageable extends Element {
        damage(val) {
          return this.health = Math.max(0, this.health - val);
        }

        whenNoHealth() {}

      };

      Damageable.properties({
        damageable: {
          default: true
        },
        maxHealth: {
          default: 1000
        },
        health: {
          default: 1000,
          change: function() {
            if (this.health <= 0) {
              return this.whenNoHealth();
            }
          }
        }
      });

      return Damageable;

    }).call(this);
    return Damageable;
  });

  (function(definition) {
    Parallelio.Character = definition();
    return Parallelio.Character.definition = definition;
  })(function(dependencies = {}) {
    var Character, Damageable, Tiled, WalkAction;
    Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : Parallelio.Tiled;
    Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : Parallelio.Damageable;
    WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : Parallelio.WalkAction;
    Character = (function() {
      class Character extends Tiled {
        constructor(name1) {
          super();
          this.name = name1;
        }

        setDefaults() {
          if (!this.tile && (this.game.mainTileContainer != null)) {
            return this.putOnRandomTile(this.game.mainTileContainer.tiles);
          }
        }

        canGoOnTile(tile) {
          return (tile != null ? tile.walkable : void 0) !== false;
        }

        walkTo(tile) {
          var action;
          action = new WalkAction({
            actor: this,
            target: tile
          });
          action.execute();
          return action;
        }

        isSelectableBy(player) {
          return true;
        }

      };

      Character.extend(Damageable);

      Character.properties({
        game: {
          change: function(old) {
            if (this.game) {
              return this.setDefaults();
            }
          }
        },
        offsetX: {
          default: 0.5
        },
        offsetY: {
          default: 0.5
        },
        defaultAction: {
          calcul: function() {
            return new WalkAction({
              actor: this
            });
          }
        },
        availableActions: {
          collection: true,
          calcul: function(invalidator) {
            var tile;
            tile = invalidator.prop("tile");
            if (tile) {
              return invalidator.prop("providedActions", tile);
            } else {
              return [];
            }
          }
        }
      });

      return Character;

    }).call(this);
    return Character;
  });

  (function(definition) {
    Parallelio.AutomaticDoor = definition();
    return Parallelio.AutomaticDoor.definition = definition;
  })(function(dependencies = {}) {
    var AutomaticDoor, Character, Door;
    Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : Parallelio.Door;
    Character = dependencies.hasOwnProperty("Character") ? dependencies.Character : Parallelio.Character;
    AutomaticDoor = (function() {
      class AutomaticDoor extends Door {
        updateTileMembers(old) {
          var ref3, ref4, ref5, ref6;
          if (old != null) {
            if ((ref3 = old.walkableMembers) != null) {
              ref3.removeRef('unlocked', this);
            }
            if ((ref4 = old.transparentMembers) != null) {
              ref4.removeRef('open', this);
            }
          }
          if (this.tile) {
            if ((ref5 = this.tile.walkableMembers) != null) {
              ref5.addPropertyRef('unlocked', this);
            }
            return (ref6 = this.tile.transparentMembers) != null ? ref6.addPropertyRef('open', this) : void 0;
          }
        }

        init() {
          super.init();
          return this.open;
        }

        isActivatorPresent(invalidate) {
          return this.getReactiveTiles(invalidate).some((tile) => {
            var children;
            children = invalidate ? invalidate.prop('children', tile) : tile.children;
            return children.some((child) => {
              return this.canBeActivatedBy(child);
            });
          });
        }

        canBeActivatedBy(elem) {
          return elem instanceof Character;
        }

        getReactiveTiles(invalidate) {
          var direction, tile;
          tile = invalidate ? invalidate.prop('tile') : this.tile;
          if (!tile) {
            return [];
          }
          direction = invalidate ? invalidate.prop('direction') : this.direction;
          if (direction === Door.directions.horizontal) {
            return [tile, tile.getRelativeTile(0, 1), tile.getRelativeTile(0, -1)].filter(function(t) {
              return t != null;
            });
          } else {
            return [tile, tile.getRelativeTile(1, 0), tile.getRelativeTile(-1, 0)].filter(function(t) {
              return t != null;
            });
          }
        }

      };

      AutomaticDoor.properties({
        open: {
          calcul: function(invalidate) {
            return !invalidate.prop('locked') && this.isActivatorPresent(invalidate);
          }
        },
        locked: {
          default: false
        },
        unlocked: {
          calcul: function(invalidate) {
            return !invalidate.prop('locked');
          }
        }
      });

      return AutomaticDoor;

    }).call(this);
    return AutomaticDoor;
  });

  (function(definition) {
    Parallelio.TileReference = definition();
    return Parallelio.TileReference.definition = definition;
  })(function() {
    var TileReference;
    TileReference = class TileReference {
      constructor(tile1) {
        this.tile = tile1;
        Object.defineProperties(this, {
          x: {
            get: () => {
              return this.getFinalTile().x;
            }
          },
          y: {
            get: () => {
              return this.getFinalTile().y;
            }
          }
        });
      }

      getFinalTile() {
        return this.tile.getFinalTile();
      }

    };
    return TileReference;
  });

  (function(definition) {
    Parallelio.TileContainer = definition();
    return Parallelio.TileContainer.definition = definition;
  })(function(dependencies = {}) {
    var Element, TileContainer, TileReference;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    TileReference = dependencies.hasOwnProperty("TileReference") ? dependencies.TileReference : Parallelio.TileReference;
    TileContainer = (function() {
      class TileContainer extends Element {
        constructor() {
          super();
          this.init();
        }

        _addToBondaries(tile, boundaries) {
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
        }

        init() {
          this.coords = {};
          return this.tiles = [];
        }

        addTile(tile) {
          var ref3;
          if (!this.tiles.includes(tile)) {
            this.tiles.push(tile);
            if (this.coords[tile.x] == null) {
              this.coords[tile.x] = {};
            }
            this.coords[tile.x][tile.y] = tile;
            if (this.owner) {
              tile.container = this;
            }
            if ((ref3 = this._boundaries) != null ? ref3.calculated : void 0) {
              this._addToBondaries(tile, this._boundaries.value);
            }
          }
          return this;
        }

        removeTile(tile) {
          var index, ref3;
          index = this.tiles.indexOf(tile);
          if (index > -1) {
            this.tiles.splice(index, 1);
            delete this.coords[tile.x][tile.y];
            if (this.owner) {
              tile.container = null;
            }
            if ((ref3 = this._boundaries) != null ? ref3.calculated : void 0) {
              if (this.boundaries.top === tile.y || this.boundaries.bottom === tile.y || this.boundaries.left === tile.x || this.boundaries.right === tile.x) {
                return this.invalidateBoundaries();
              }
            }
          }
        }

        removeTileAt(x, y) {
          var tile;
          if (tile = this.getTile(x, y)) {
            return this.removeTile(tile);
          }
        }

        getTile(x, y) {
          var ref3;
          if (((ref3 = this.coords[x]) != null ? ref3[y] : void 0) != null) {
            return this.coords[x][y];
          }
        }

        loadMatrix(matrix) {
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
        }

        inRange(tile, range) {
          var found, k, l, ref3, ref4, ref5, ref6, tiles, x, y;
          tiles = [];
          range--;
          for (x = k = ref3 = tile.x - range, ref4 = tile.x + range; (ref3 <= ref4 ? k <= ref4 : k >= ref4); x = ref3 <= ref4 ? ++k : --k) {
            for (y = l = ref5 = tile.y - range, ref6 = tile.y + range; (ref5 <= ref6 ? l <= ref6 : l >= ref6); y = ref5 <= ref6 ? ++l : --l) {
              if (Math.sqrt((x - tile.x) * (x - tile.x) + (y - tile.y) * (y - tile.y)) <= range && ((found = this.getTile(x, y)) != null)) {
                tiles.push(found);
              }
            }
          }
          return tiles;
        }

        allTiles() {
          return this.tiles.slice();
        }

        clearAll() {
          var k, len, ref3, tile;
          if (this.owner) {
            ref3 = this.tiles;
            for (k = 0, len = ref3.length; k < len; k++) {
              tile = ref3[k];
              tile.container = null;
            }
          }
          this.coords = {};
          this.tiles = [];
          return this;
        }

        closest(originTile, filter) {
          var candidates, getScore;
          getScore = function(candidate) {
            if (candidate.score != null) {
              return candidate.score;
            } else {
              return candidate.score = candidate.getFinalTile().dist(originTile).length;
            }
          };
          candidates = this.tiles.filter(filter).map((t) => {
            return new TileReference(t);
          });
          candidates.sort((a, b) => {
            return getScore(a) - getScore(b);
          });
          if (candidates.length > 0) {
            return candidates[0].tile;
          } else {
            return null;
          }
        }

        copy() {
          var out;
          out = new TileContainer();
          out.coords = this.coords;
          out.tiles = this.tiles;
          out.owner = false;
          return out;
        }

        merge(ctn, mergeFn, asOwner = false) {
          var out, tmp;
          out = new TileContainer();
          out.owner = asOwner;
          tmp = ctn.copy();
          this.tiles.forEach(function(tileA) {
            var mergedTile, tileB;
            tileB = tmp.getTile(tileA.x, tileA.y);
            if (tileB) {
              tmp.removeTile(tileB);
            }
            mergedTile = mergeFn(tileA, tileB);
            if (mergedTile) {
              return out.addTile(mergedTile);
            }
          });
          tmp.tiles.forEach(function(tileB) {
            var mergedTile;
            mergedTile = mergeFn(null, tileB);
            if (mergedTile) {
              return out.addTile(mergedTile);
            }
          });
          return out;
        }

      };

      TileContainer.properties({
        owner: {
          default: true
        },
        boundaries: {
          calcul: function() {
            var boundaries;
            boundaries = {
              top: null,
              left: null,
              bottom: null,
              right: null
            };
            this.tiles.forEach((tile) => {
              return this._addToBondaries(tile, boundaries);
            });
            return boundaries;
          },
          output: function(val) {
            return Object.assign({}, val);
          }
        }
      });

      return TileContainer;

    }).call(this);
    return TileContainer;
  });

  (function(definition) {
    Parallelio.Direction = definition();
    return Parallelio.Direction.definition = definition;
  })(function() {
    var Direction;
    Direction = class Direction {
      constructor(name1, x5, y5, inverseName) {
        this.name = name1;
        this.x = x5;
        this.y = y5;
        this.inverseName = inverseName;
      }

      getInverse() {
        return this.constructor[this.inverseName];
      }

    };
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
    LineOfSight = class LineOfSight {
      constructor(tiles1, x11 = 0, y11 = 0, x21 = 0, y21 = 0) {
        this.tiles = tiles1;
        this.x1 = x11;
        this.y1 = y11;
        this.x2 = x21;
        this.y2 = y21;
      }

      setX1(val) {
        this.x1 = val;
        return this.invalidade();
      }

      setY1(val) {
        this.y1 = val;
        return this.invalidade();
      }

      setX2(val) {
        this.x2 = val;
        return this.invalidade();
      }

      setY2(val) {
        this.y2 = val;
        return this.invalidade();
      }

      invalidade() {
        this.endPoint = null;
        this.success = null;
        return this.calculated = false;
      }

      testTile(tile, entryX, entryY) {
        if (this.traversableCallback != null) {
          return this.traversableCallback(tile, entryX, entryY);
        } else {
          return (tile != null) && (typeof tile.getTransparent === 'function' ? tile.getTransparent() : typeof tile.transparent !== void 0 ? tile.transparent : true);
        }
      }

      testTileAt(x, y, entryX, entryY) {
        return this.testTile(this.tiles.getTile(Math.floor(x), Math.floor(y)), entryX, entryY);
      }

      reverseTracing() {
        var tmpX, tmpY;
        tmpX = this.x1;
        tmpY = this.y1;
        this.x1 = this.x2;
        this.y1 = this.y2;
        this.x2 = tmpX;
        this.y2 = tmpY;
        return this.reversed = !this.reversed;
      }

      calcul() {
        var nextX, nextY, positiveX, positiveY, ratio, tileX, tileY, total, x, y;
        ratio = (this.x2 - this.x1) / (this.y2 - this.y1);
        total = Math.abs(this.x2 - this.x1) + Math.abs(this.y2 - this.y1);
        positiveX = (this.x2 - this.x1) >= 0;
        positiveY = (this.y2 - this.y1) >= 0;
        tileX = x = this.x1;
        tileY = y = this.y1;
        if (this.reversed) {
          tileX = positiveX ? x : Math.ceil(x) - 1;
          tileY = positiveY ? y : Math.ceil(y) - 1;
        }
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
      }

      forceSuccess() {
        this.endPoint = {
          x: this.x2,
          y: this.y2,
          tile: this.tiles.getTile(Math.floor(this.x2), Math.floor(this.y2))
        };
        this.success = true;
        return this.calculated = true;
      }

      getSuccess() {
        if (!this.calculated) {
          this.calcul();
        }
        return this.success;
      }

      getEndPoint() {
        if (!this.calculated) {
          this.calcul();
        }
        return this.endPoint;
      }

    };
    return LineOfSight;
  });

  (function(definition) {
    Parallelio.AttackAction = definition();
    return Parallelio.AttackAction.definition = definition;
  })(function(dependencies = {}) {
    var AttackAction, EventBind, PropertyWatcher, TargetAction, WalkAction;
    WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : Parallelio.WalkAction;
    TargetAction = dependencies.hasOwnProperty("TargetAction") ? dependencies.TargetAction : Parallelio.TargetAction;
    EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : Parallelio.Spark.EventBind;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Parallelio.Spark.PropertyWatcher;
    AttackAction = (function() {
      class AttackAction extends TargetAction {
        validTarget() {
          return this.targetIsAttackable() && (this.canUseWeapon() || this.canWalkToTarget());
        }

        targetIsAttackable() {
          return this.target.damageable && this.target.health >= 0;
        }

        canMelee() {
          return Math.abs(this.target.tile.x - this.actor.tile.x) + Math.abs(this.target.tile.y - this.actor.tile.y) === 1;
        }

        canUseWeapon() {
          return this.bestUsableWeapon != null;
        }

        canUseWeaponAt(tile) {
          var ref3;
          return ((ref3 = this.actor.weapons) != null ? ref3.length : void 0) && this.actor.weapons.find((weapon) => {
            return weapon.canUseFrom(tile, this.target);
          });
        }

        canWalkToTarget() {
          return this.walkAction.isReady();
        }

        useWeapon() {
          this.bestUsableWeapon.useOn(this.target);
          return this.finish();
        }

        execute() {
          if (this.actor.walk != null) {
            this.actor.walk.interrupt();
          }
          if (this.bestUsableWeapon != null) {
            if (this.bestUsableWeapon.charged) {
              return this.useWeapon();
            } else {
              return this.weaponChargeWatcher.bind();
            }
          } else {
            this.walkAction.on('finished', () => {
              this.interruptBinder.unbind();
              if (this.isReady()) {
                return this.start();
              }
            });
            this.interruptBinder.bindTo(this.walkAction);
            return this.walkAction.execute();
          }
        }

      };

      AttackAction.properties({
        walkAction: {
          calcul: function() {
            var walkAction;
            walkAction = new WalkAction({
              actor: this.actor,
              target: this.target,
              parent: this.parent
            });
            walkAction.pathFinder.arrivedCallback = (step) => {
              return this.canUseWeaponAt(step.tile);
            };
            return walkAction;
          }
        },
        bestUsableWeapon: {
          calcul: function(invalidator) {
            var ref3, usableWeapons;
            invalidator.propPath('actor.tile');
            if ((ref3 = this.actor.weapons) != null ? ref3.length : void 0) {
              usableWeapons = this.actor.weapons.filter((weapon) => {
                return weapon.canUseOn(this.target);
              });
              usableWeapons.sort((a, b) => {
                return b.dps - a.dps;
              });
              return usableWeapons[0];
            } else {
              return null;
            }
          }
        },
        interruptBinder: {
          calcul: function() {
            return new EventBind('interrupted', null, () => {
              return this.interrupt();
            });
          },
          destroy: true
        },
        weaponChargeWatcher: {
          calcul: function() {
            return new PropertyWatcher({
              callback: () => {
                if (this.bestUsableWeapon.charged) {
                  return this.useWeapon();
                }
              },
              property: this.bestUsableWeapon.getPropertyInstance('charged')
            });
          },
          destroy: true
        }
      });

      return AttackAction;

    }).call(this);
    return AttackAction;
  });

  (function(definition) {
    Parallelio.VisionCalculator = definition();
    return Parallelio.VisionCalculator.definition = definition;
  })(function(dependencies = {}) {
    var Direction, LineOfSight, TileContainer, TileReference, VisionCalculator;
    LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : Parallelio.LineOfSight;
    Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : Parallelio.Direction;
    TileContainer = dependencies.hasOwnProperty("TileContainer") ? dependencies.TileContainer : Parallelio.TileContainer;
    TileReference = dependencies.hasOwnProperty("TileReference") ? dependencies.TileReference : Parallelio.TileReference;
    VisionCalculator = class VisionCalculator {
      constructor(originTile1, offset1 = {
          x: 0.5,
          y: 0.5
        }) {
        this.originTile = originTile1;
        this.offset = offset1;
        this.pts = {};
        this.visibility = {};
        this.stack = [];
        this.calculated = false;
      }

      calcul() {
        this.init();
        while (this.stack.length) {
          this.step();
        }
        return this.calculated = true;
      }

      init() {
        var firstBatch, initialPts;
        this.pts = {};
        this.visibility = {};
        initialPts = [
          {
            x: 0,
            y: 0
          },
          {
            x: 1,
            y: 0
          },
          {
            x: 0,
            y: 1
          },
          {
            x: 1,
            y: 1
          }
        ];
        initialPts.forEach((pt) => {
          return this.setPt(this.originTile.x + pt.x, this.originTile.y + pt.y, true);
        });
        firstBatch = [
          {
            x: -1,
            y: -1
          },
          {
            x: -1,
            y: 0
          },
          {
            x: -1,
            y: 1
          },
          {
            x: -1,
            y: 2
          },
          {
            x: 2,
            y: -1
          },
          {
            x: 2,
            y: 0
          },
          {
            x: 2,
            y: 1
          },
          {
            x: 2,
            y: 2
          },
          {
            x: 0,
            y: -1
          },
          {
            x: 1,
            y: -1
          },
          {
            x: 0,
            y: 2
          },
          {
            x: 1,
            y: 2
          }
        ];
        return this.stack = firstBatch.map((pt) => {
          return {
            x: this.originTile.x + pt.x,
            y: this.originTile.y + pt.y
          };
        });
      }

      setPt(x, y, val) {
        var adjancent;
        this.pts[x + ':' + y] = val;
        adjancent = [
          {
            x: 0,
            y: 0
          },
          {
            x: -1,
            y: 0
          },
          {
            x: 0,
            y: -1
          },
          {
            x: -1,
            y: -1
          }
        ];
        return adjancent.forEach((pt) => {
          return this.addVisibility(x + pt.x, y + pt.y, val ? 1 / adjancent.length : 0);
        });
      }

      getPt(x, y) {
        return this.pts[x + ':' + y];
      }

      addVisibility(x, y, val) {
        if (this.visibility[x] == null) {
          this.visibility[x] = {};
        }
        if (this.visibility[x][y] != null) {
          return this.visibility[x][y] += val;
        } else {
          return this.visibility[x][y] = val;
        }
      }

      getVisibility(x, y) {
        if ((this.visibility[x] == null) || (this.visibility[x][y] == null)) {
          return 0;
        } else {
          return this.visibility[x][y];
        }
      }

      canProcess(x, y) {
        return !this.stack.some((pt) => {
          return pt.x === x && pt.y === y;
        }) && (this.getPt(x, y) == null);
      }

      step() {
        var los, pt;
        pt = this.stack.shift();
        los = new LineOfSight(this.originTile.container, this.originTile.x + this.offset.x, this.originTile.y + this.offset.y, pt.x, pt.y);
        los.reverseTracing();
        los.traversableCallback = (tile, entryX, entryY) => {
          if (tile != null) {
            if (this.getVisibility(tile.x, tile.y) === 1) {
              return los.forceSuccess();
            } else {
              return tile.transparent;
            }
          }
        };
        this.setPt(pt.x, pt.y, los.getSuccess());
        if (los.getSuccess()) {
          return Direction.all.forEach((direction) => {
            var nextPt;
            nextPt = {
              x: pt.x + direction.x,
              y: pt.y + direction.y
            };
            if (this.canProcess(nextPt.x, nextPt.y)) {
              return this.stack.push(nextPt);
            }
          });
        }
      }

      getBounds() {
        var boundaries, col, ref3, val, x, y;
        boundaries = {
          top: null,
          left: null,
          bottom: null,
          right: null
        };
        ref3 = this.visibility;
        for (x in ref3) {
          col = ref3[x];
          for (y in col) {
            val = col[y];
            if ((boundaries.top == null) || y < boundaries.top) {
              boundaries.top = y;
            }
            if ((boundaries.left == null) || x < boundaries.left) {
              boundaries.left = x;
            }
            if ((boundaries.bottom == null) || y > boundaries.bottom) {
              boundaries.bottom = y;
            }
            if ((boundaries.right == null) || x > boundaries.right) {
              boundaries.right = x;
            }
          }
        }
        return boundaries;
      }

      toContainer() {
        var col, ref3, res, tile, val, x, y;
        res = new TileContainer();
        res.owner = false;
        ref3 = this.visibility;
        for (x in ref3) {
          col = ref3[x];
          for (y in col) {
            val = col[y];
            tile = this.originTile.container.getTile(x, y);
            if (val !== 0 && (tile != null)) {
              tile = new TileReference(tile);
              tile.visibility = val;
              res.addTile(tile);
            }
          }
        }
        return res;
      }

      toMap() {
        var k, l, ref3, ref4, ref5, ref6, res, x, y;
        res = Object.assign({
          map: []
        }, this.getBounds());
        for (y = k = ref3 = res.top, ref4 = res.bottom - 1; (ref3 <= ref4 ? k <= ref4 : k >= ref4); y = ref3 <= ref4 ? ++k : --k) {
          res.map[y - res.top] = [];
          for (x = l = ref5 = res.left, ref6 = res.right - 1; (ref5 <= ref6 ? l <= ref6 : l >= ref6); x = ref5 <= ref6 ? ++l : --l) {
            res.map[y - res.top][x - res.left] = this.getVisibility(x, y);
          }
        }
        return res;
      }

    };
    return VisionCalculator;
  });

  (function(definition) {
    Parallelio.AttackMoveAction = definition();
    return Parallelio.AttackMoveAction.definition = definition;
  })(function(dependencies = {}) {
    var AttackAction, AttackMoveAction, EventBind, LineOfSight, PathFinder, PropertyWatcher, TargetAction, WalkAction;
    WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : Parallelio.WalkAction;
    AttackAction = dependencies.hasOwnProperty("AttackAction") ? dependencies.AttackAction : Parallelio.AttackAction;
    TargetAction = dependencies.hasOwnProperty("TargetAction") ? dependencies.TargetAction : Parallelio.TargetAction;
    PathFinder = dependencies.hasOwnProperty("PathFinder") ? dependencies.PathFinder : Parallelio.PathFinder;
    LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : Parallelio.LineOfSight;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Parallelio.Spark.PropertyWatcher;
    EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : Parallelio.Spark.EventBind;
    AttackMoveAction = (function() {
      class AttackMoveAction extends TargetAction {
        isEnemy(elem) {
          var ref3;
          return (ref3 = this.actor.owner) != null ? typeof ref3.isEnemy === "function" ? ref3.isEnemy(elem) : void 0 : void 0;
        }

        validTarget() {
          return this.walkAction.validTarget();
        }

        testEnemySpotted() {
          this.invalidateEnemySpotted();
          if (this.enemySpotted) {
            this.attackAction = new AttackAction({
              actor: this.actor,
              target: this.enemySpotted
            });
            this.attackAction.on('finished', () => {
              if (this.isReady()) {
                return this.start();
              }
            });
            this.interruptBinder.bindTo(this.attackAction);
            this.walkAction.interrupt();
            this.invalidateWalkAction();
            return this.attackAction.execute();
          }
        }

        execute() {
          if (!this.testEnemySpotted()) {
            this.walkAction.on('finished', () => {
              return this.finished();
            });
            this.interruptBinder.bindTo(this.walkAction);
            this.tileWatcher.bind();
            return this.walkAction.execute();
          }
        }

      };

      AttackMoveAction.properties({
        walkAction: {
          calcul: function() {
            var walkAction;
            walkAction = new WalkAction({
              actor: this.actor,
              target: this.target,
              parent: this.parent
            });
            return walkAction;
          }
        },
        enemySpotted: {
          calcul: function() {
            var ref3;
            this.path = new PathFinder(this.actor.tile.container, this.actor.tile, false, {
              validTile: (tile) => {
                return tile.transparent && (new LineOfSight(this.actor.tile.container, this.actor.tile.x, this.actor.tile.y, tile.x, tile.y)).getSuccess();
              },
              arrived: (step) => {
                return step.enemy = step.tile.children.find((c) => {
                  return this.isEnemy(c);
                });
              },
              efficiency: (tile) => {}
            });
            this.path.calcul();
            return (ref3 = this.path.solution) != null ? ref3.enemy : void 0;
          }
        },
        tileWatcher: {
          calcul: function() {
            return new PropertyWatcher({
              callback: () => {
                return this.testEnemySpotted();
              },
              property: this.actor.getPropertyInstance('tile')
            });
          },
          destroy: true
        },
        interruptBinder: {
          calcul: function() {
            return new EventBind('interrupted', null, () => {
              return this.interrupt();
            });
          },
          destroy: true
        }
      });

      return AttackMoveAction;

    }).call(this);
    return AttackMoveAction;
  });

  (function(definition) {
    Parallelio.CharacterAI = definition();
    return Parallelio.CharacterAI.definition = definition;
  })(function(dependencies = {}) {
    var AttackMoveAction, CharacterAI, Door, PropertyWatcher, TileContainer, VisionCalculator, WalkAction;
    TileContainer = dependencies.hasOwnProperty("TileContainer") ? dependencies.TileContainer : Parallelio.TileContainer;
    VisionCalculator = dependencies.hasOwnProperty("VisionCalculator") ? dependencies.VisionCalculator : Parallelio.VisionCalculator;
    Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : Parallelio.Door;
    WalkAction = dependencies.hasOwnProperty("WalkAction") ? dependencies.WalkAction : Parallelio.WalkAction;
    AttackMoveAction = dependencies.hasOwnProperty("AttackMoveAction") ? dependencies.AttackMoveAction : Parallelio.AttackMoveAction;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Parallelio.Spark.PropertyWatcher;
    CharacterAI = class CharacterAI {
      constructor(character) {
        this.character = character;
        this.nextActionCallback = () => {
          return this.nextAction();
        };
        this.visionMemory = new TileContainer();
        this.tileWatcher = new PropertyWatcher({
          callback: () => {
            return this.updateVisionMemory();
          },
          property: this.character.getPropertyInstance('tile')
        });
      }

      start() {
        this.tileWatcher.bind();
        return this.nextAction();
      }

      nextAction() {
        var ennemy, unexplored;
        this.updateVisionMemory();
        if (ennemy = this.getClosestEnemy()) {
          return this.attackMoveTo(ennemy).on('end', nextActionCallback);
        } else if (unexplored = this.getClosestUnexplored()) {
          return this.walkTo(unexplored).on('end', nextActionCallback);
        } else {
          this.resetVisionMemory();
          return this.walkTo(this.getClosestUnexplored()).on('end', nextActionCallback);
        }
      }

      updateVisionMemory() {
        var calculator;
        calculator = new VisionCalculator(this.character.tile);
        calculator.calcul();
        return this.visionMemory = calculator.toContainer().merge(this.visionMemory, (a, b) => {
          if (a != null) {
            a = this.analyzeTile(a);
          }
          if ((a != null) && (b != null)) {
            a.visibility = Math.max(a.visibility, b.visibility);
            return a;
          } else {
            return a || b;
          }
        });
      }

      analyzeTile(tile) {
        var ref3;
        tile.ennemySpotted = (ref3 = tile.getFinalTile().children) != null ? ref3.find((c) => {
          return this.isEnnemy(c);
        }) : void 0;
        tile.explorable = this.isExplorable(tile);
        return tile;
      }

      isEnnemy(elem) {
        var ref3;
        return (ref3 = this.character.owner) != null ? typeof ref3.isEnemy === "function" ? ref3.isEnemy(elem) : void 0 : void 0;
      }

      getClosestEnemy() {
        return this.visionMemory.closest(this.character.tile, (t) => {
          return t.ennemySpotted;
        });
      }

      getClosestUnexplored() {
        return this.visionMemory.closest(this.character.tile, (t) => {
          return t.visibility < 1 && t.explorable;
        });
      }

      isExplorable(tile) {
        var ref3;
        tile = tile.getFinalTile();
        return tile.walkable || ((ref3 = tile.children) != null ? ref3.find((c) => {
          return c instanceof Door;
        }) : void 0);
      }

      attackMoveTo(tile) {
        var action;
        tile = tile.getFinalTile();
        action = new AttackMoveAction({
          actor: this.character,
          target: tile
        });
        if (action.isReady()) {
          action.execute();
          return action;
        }
      }

      walkTo(tile) {
        var action;
        tile = tile.getFinalTile();
        action = new WalkAction({
          actor: this.character,
          target: tile
        });
        if (action.isReady()) {
          action.execute();
          return action;
        }
      }

    };
    return CharacterAI;
  });

  (function(definition) {
    Parallelio.DamagePropagation = definition();
    return Parallelio.DamagePropagation.definition = definition;
  })(function(dependencies = {}) {
    var DamagePropagation, Direction, Element, LineOfSight;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : Parallelio.LineOfSight;
    Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : Parallelio.Direction;
    DamagePropagation = (function() {
      class DamagePropagation extends Element {
        constructor(options) {
          super();
          this.setProperties(options);
        }

        getTileContainer() {
          return this.tile.container;
        }

        apply() {
          var damage, k, len, ref3, results;
          ref3 = this.getDamaged();
          results = [];
          for (k = 0, len = ref3.length; k < len; k++) {
            damage = ref3[k];
            results.push(damage.target.damage(damage.damage));
          }
          return results;
        }

        getInitialTiles() {
          var ctn;
          ctn = this.getTileContainer();
          return ctn.inRange(this.tile, this.range);
        }

        getInitialDamages() {
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
        }

        getDamaged() {
          var added;
          if (this._damaged == null) {
            added = null;
            while (added = this.step(added)) {
              true;
            }
          }
          return this._damaged;
        }

        step(added) {
          if (added != null) {
            if (this.extendedDamage != null) {
              added = this.extend(added);
              this._damaged = added.concat(this._damaged);
              return added.length > 0 && added;
            }
          } else {
            return this._damaged = this.getInitialDamages();
          }
        }

        inDamaged(target, damaged) {
          var damage, index, k, len;
          for (index = k = 0, len = damaged.length; k < len; index = ++k) {
            damage = damaged[index];
            if (damage.target === target) {
              return index;
            }
          }
          return false;
        }

        extend(damaged) {
          var added, ctn, damage, dir, dmg, existing, k, l, len, len1, len2, local, m, ref3, target, tile;
          ctn = this.getTileContainer();
          added = [];
          for (k = 0, len = damaged.length; k < len; k++) {
            damage = damaged[k];
            local = [];
            if (damage.target.x != null) {
              ref3 = Direction.adjacents;
              for (l = 0, len1 = ref3.length; l < len1; l++) {
                dir = ref3[l];
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
        }

        mergeDamage(d1, d2) {
          return {
            target: d1.target,
            power: d1.power + d2.power,
            damage: d1.damage + d2.damage
          };
        }

        modifyDamage(target, power) {
          if (typeof target.modifyDamage === 'function') {
            return Math.floor(target.modifyDamage(power, this.type));
          } else {
            return Math.floor(power);
          }
        }

      };

      DamagePropagation.properties({
        tile: {
          default: null
        },
        power: {
          default: 10
        },
        range: {
          default: 1
        },
        type: {
          default: null
        }
      });

      return DamagePropagation;

    }).call(this);
    DamagePropagation.Normal = class Normal extends DamagePropagation {
      initialDamage(target, nb) {
        var dmg;
        dmg = this.modifyDamage(target, this.power);
        if (dmg > 0) {
          return {
            target: target,
            power: this.power,
            damage: dmg
          };
        }
      }

    };
    DamagePropagation.Thermic = class Thermic extends DamagePropagation {
      extendedDamage(target, last, nb) {
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
      }

      initialDamage(target, nb) {
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
      }

    };
    DamagePropagation.Kinetic = class Kinetic extends DamagePropagation {
      extendedDamage(target, last, nb) {
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
      }

      initialDamage(target, nb) {
        var dmg;
        dmg = this.modifyDamage(target, this.power);
        if (dmg > 0) {
          return {
            target: target,
            power: this.power,
            damage: dmg
          };
        }
      }

      modifyDamage(target, power) {
        if (typeof target.modifyDamage === 'function') {
          return Math.floor(target.modifyDamage(power, this.type));
        } else {
          return Math.floor(power * 0.25);
        }
      }

      mergeDamage(d1, d2) {
        return {
          target: d1.target,
          power: Math.floor((d1.power + d2.power) / 2),
          damage: Math.floor((d1.damage + d2.damage) / 2)
        };
      }

    };
    DamagePropagation.Explosive = (function() {
      class Explosive extends DamagePropagation {
        getDamaged() {
          var angle, inside, k, ref3, shard, shardPower, shards, target;
          this._damaged = [];
          shards = Math.pow(this.range + 1, 2);
          shardPower = this.power / shards;
          inside = this.tile.health <= this.modifyDamage(this.tile, shardPower);
          if (inside) {
            shardPower *= 4;
          }
          for (shard = k = 0, ref3 = shards; (0 <= ref3 ? k <= ref3 : k >= ref3); shard = 0 <= ref3 ? ++k : --k) {
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
        }

        getTileHitByShard(inside, angle) {
          var ctn, dist, target, vertex;
          ctn = this.getTileContainer();
          dist = this.range * this.rng();
          target = {
            x: this.tile.x + 0.5 + dist * Math.cos(angle),
            y: this.tile.y + 0.5 + dist * Math.sin(angle)
          };
          if (inside) {
            vertex = new LineOfSight(ctn, this.tile.x + 0.5, this.tile.y + 0.5, target.x, target.y);
            vertex.traversableCallback = (tile) => {
              return !inside || ((tile != null) && this.traversableCallback(tile));
            };
            return vertex.getEndPoint().tile;
          } else {
            return ctn.getTile(Math.floor(target.x), Math.floor(target.y));
          }
        }

      };

      Explosive.properties({
        rng: {
          default: Math.random
        },
        traversableCallback: {
          default: function(tile) {
            return !(typeof tile.getSolid === 'function' && tile.getSolid());
          }
        }
      });

      return Explosive;

    }).call(this);
    return DamagePropagation;
  });

  (function(definition) {
    Parallelio.Element = definition();
    return Parallelio.Element.definition = definition;
  })(function(dependencies = {}) {
    var Element;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    return Element;
  });

  (function(definition) {
    Parallelio.Tile = definition();
    return Parallelio.Tile.definition = definition;
  })(function(dependencies = {}) {
    var Direction, Element, Tile;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : Parallelio.Direction;
    Tile = (function() {
      class Tile extends Element {
        constructor(x5, y5) {
          super();
          this.x = x5;
          this.y = y5;
          this.init();
        }

        init() {
          var container;
          return container = null;
        }

        getRelativeTile(x, y) {
          if (this.container != null) {
            return this.container.getTile(this.x + x, this.y + y);
          }
        }

        findDirectionOf(tile) {
          if (tile.tile) {
            tile = tile.tile;
          }
          if ((tile.x != null) && (tile.y != null)) {
            return Direction.all.find((d) => {
              return d.x === tile.x - this.x && d.y === tile.y - this.y;
            });
          }
        }

        addChild(child, checkRef = true) {
          var index;
          index = this.children.indexOf(child);
          if (index === -1) {
            this.children.push(child);
          }
          if (checkRef) {
            child.tile = this;
          }
          return child;
        }

        removeChild(child, checkRef = true) {
          var index;
          index = this.children.indexOf(child);
          if (index > -1) {
            this.children.splice(index, 1);
          }
          if (checkRef && child.tile === this) {
            return child.tile = null;
          }
        }

        dist(tile) {
          var ctnDist, ref3, x, y;
          if ((tile != null ? tile.getFinalTile : void 0) != null) {
            tile = tile.getFinalTile();
          }
          if (((tile != null ? tile.x : void 0) != null) && (tile.y != null) && (this.x != null) && (this.y != null) && (this.container === tile.container || (ctnDist = (ref3 = this.container) != null ? typeof ref3.dist === "function" ? ref3.dist(tile.container) : void 0 : void 0))) {
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
        }

        getFinalTile() {
          return this;
        }

      };

      Tile.properties({
        children: {
          collection: true
        },
        container: {
          change: function() {
            if (this.container != null) {
              return this.adjacentTiles.forEach(function(tile) {
                return tile.invalidateAdjacentTiles();
              });
            }
          }
        },
        adjacentTiles: {
          calcul: function(invalidation) {
            if (invalidation.prop('container')) {
              return Direction.adjacents.map((d) => {
                return this.getRelativeTile(d.x, d.y);
              }).filter((t) => {
                return t != null;
              });
            }
          },
          collection: true
        }
      });

      return Tile;

    }).call(this);
    return Tile;
  });

  (function(definition) {
    Parallelio.Floor = definition();
    return Parallelio.Floor.definition = definition;
  })(function(dependencies = {}) {
    var Floor, Tile;
    Tile = dependencies.hasOwnProperty("Tile") ? dependencies.Tile : Parallelio.Tile;
    Floor = (function() {
      class Floor extends Tile {};

      Floor.properties({
        walkable: {
          composed: true
        },
        transparent: {
          composed: true
        }
      });

      return Floor;

    }).call(this);
    return Floor;
  });

  (function(definition) {
    Parallelio.Player = definition();
    return Parallelio.Player.definition = definition;
  })(function(dependencies = {}) {
    var Element, EventEmitter, Player;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Parallelio.Spark.EventEmitter;
    Player = (function() {
      class Player extends Element {
        constructor(options) {
          super();
          this.setProperties(options);
        }

        setDefaults() {
          var first;
          first = this.game.players.length === 0;
          this.game.players.add(this);
          if (first && !this.controller && this.game.defaultPlayerControllerClass) {
            return this.controller = new this.game.defaultPlayerControllerClass();
          }
        }

        canTargetActionOn(elem) {
          var action, ref3;
          action = this.selectedAction || ((ref3 = this.selected) != null ? ref3.defaultAction : void 0);
          return (action != null) && typeof action.canTarget === "function" && action.canTarget(elem);
        }

        canSelect(elem) {
          return typeof elem.isSelectableBy === "function" && elem.isSelectableBy(this);
        }

        canFocusOn(elem) {
          if (typeof elem.IsFocusableBy === "function") {
            return elem.IsFocusableBy(this);
          } else if (typeof elem.IsSelectableBy === "function") {
            return elem.IsSelectableBy(this);
          }
        }

        setActionTarget(elem) {
          var action, ref3;
          action = this.selectedAction || ((ref3 = this.selected) != null ? ref3.defaultAction : void 0);
          action = action.withTarget(elem);
          if (action.isReady()) {
            action.start();
            return this.selectedAction = null;
          } else {
            return this.selectedAction = action;
          }
        }

      };

      Player.include(EventEmitter.prototype);

      Player.properties({
        name: {
          default: 'Player'
        },
        focused: {},
        selected: {
          change: function(old) {
            var ref3;
            if (old != null ? old.getProperty('selected') : void 0) {
              old.selected = false;
            }
            if ((ref3 = this.selected) != null ? ref3.getProperty('selected') : void 0) {
              return this.selected.selected = this;
            }
          }
        },
        selectedAction: {},
        controller: {
          change: function(old) {
            if (this.controller) {
              return this.controller.player = this;
            }
          }
        },
        game: {
          change: function(old) {
            if (this.game) {
              return this.setDefaults();
            }
          }
        }
      });

      return Player;

    }).call(this);
    return Player;
  });

  (function(definition) {
    Parallelio.GridCell = definition();
    return Parallelio.GridCell.definition = definition;
  })(function(dependencies = {}) {
    var Element, EventEmitter, GridCell;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Parallelio.Spark.EventEmitter;
    GridCell = (function() {
      class GridCell extends Element {};

      GridCell.extend(EventEmitter);

      GridCell.properties({
        grid: {
          calcul: function(invalidator) {
            return invalidator.prop('grid', invalidator.prop('row'));
          }
        },
        row: {},
        columnPosition: {
          calcul: function(invalidator) {
            var row;
            row = invalidator.prop('row');
            if (row) {
              return invalidator.prop('cells', row).indexOf(this);
            }
          }
        },
        width: {
          calcul: function(invalidator) {
            return 1 / invalidator.prop('cells', invalidator.prop('row')).length;
          }
        },
        left: {
          calcul: function(invalidator) {
            return invalidator.prop('width') * invalidator.prop('columnPosition');
          }
        },
        right: {
          calcul: function(invalidator) {
            return invalidator.prop('width') * (invalidator.prop('columnPosition') + 1);
          }
        },
        height: {
          calcul: function(invalidator) {
            return invalidator.prop('height', invalidator.prop('row'));
          }
        },
        top: {
          calcul: function(invalidator) {
            return invalidator.prop('top', invalidator.prop('row'));
          }
        },
        bottom: {
          calcul: function(invalidator) {
            return invalidator.prop('bottom', invalidator.prop('row'));
          }
        }
      });

      return GridCell;

    }).call(this);
    return GridCell;
  });

  (function(definition) {
    Parallelio.GridRow = definition();
    return Parallelio.GridRow.definition = definition;
  })(function(dependencies = {}) {
    var Element, EventEmitter, GridCell, GridRow;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Parallelio.Spark.EventEmitter;
    GridCell = dependencies.hasOwnProperty("GridCell") ? dependencies.GridCell : Parallelio.GridCell;
    GridRow = (function() {
      class GridRow extends Element {
        addCell(cell = null) {
          if (!cell) {
            cell = new GridCell();
          }
          this.cells.push(cell);
          return cell;
        }

      };

      GridRow.extend(EventEmitter);

      GridRow.properties({
        grid: {},
        cells: {
          collection: true,
          itemAdded: function(cell) {
            return cell.row = this;
          },
          itemRemoved: function(cell) {
            if (cell.row === this) {
              return cell.row = null;
            }
          }
        },
        rowPosition: {
          calcul: function(invalidator) {
            var grid;
            grid = invalidator.prop('grid');
            if (grid) {
              return invalidator.prop('rows', grid).indexOf(this);
            }
          }
        },
        height: {
          calcul: function(invalidator) {
            return 1 / invalidator.prop('rows', invalidator.prop('grid')).length;
          }
        },
        top: {
          calcul: function(invalidator) {
            return invalidator.prop('height') * invalidator.prop('rowPosition');
          }
        },
        bottom: {
          calcul: function(invalidator) {
            return invalidator.prop('height') * (invalidator.prop('rowPosition') + 1);
          }
        }
      });

      return GridRow;

    }).call(this);
    return GridRow;
  });

  (function(definition) {
    Parallelio.Grid = definition();
    return Parallelio.Grid.definition = definition;
  })(function(dependencies = {}) {
    var Element, EventEmitter, Grid, GridCell, GridRow;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Parallelio.Spark.EventEmitter;
    GridCell = dependencies.hasOwnProperty("GridCell") ? dependencies.GridCell : Parallelio.GridCell;
    GridRow = dependencies.hasOwnProperty("GridRow") ? dependencies.GridRow : Parallelio.GridRow;
    Grid = (function() {
      class Grid extends Element {
        addCell(cell = null) {
          var row, spot;
          if (!cell) {
            cell = new GridCell();
          }
          spot = this.getFreeSpot();
          row = this.rows.get(spot.row);
          if (!row) {
            row = this.addRow();
          }
          row.addCell(cell);
          return cell;
        }

        addRow(row = null) {
          if (!row) {
            row = new GridRow();
          }
          this.rows.push(row);
          return row;
        }

        getFreeSpot() {
          var spot;
          spot = null;
          this.rows.some((row) => {
            if (row.cells.length < this.maxColumns) {
              return spot = {
                row: row.rowPosition,
                column: row.cells.length
              };
            }
          });
          if (!spot) {
            if (this.maxColumns > this.rows.length) {
              spot = {
                row: this.rows.length,
                column: 0
              };
            } else {
              spot = {
                row: 0,
                column: this.maxColumns + 1
              };
            }
          }
          return spot;
        }

      };

      Grid.extend(EventEmitter);

      Grid.properties({
        rows: {
          collection: true,
          itemAdded: function(row) {
            return row.grid = this;
          },
          itemRemoved: function(row) {
            if (row.grid === this) {
              return row.grid = null;
            }
          }
        },
        maxColumns: {
          calcul: function(invalidator) {
            var rows;
            rows = invalidator.prop('rows');
            return rows.reduce(function(max, row) {
              return Math.max(max, invalidator.prop('cells', row).length);
            }, 0);
          }
        }
      });

      return Grid;

    }).call(this);
    return Grid;
  });

  (function(definition) {
    Parallelio.View = definition();
    return Parallelio.View.definition = definition;
  })(function(dependencies = {}) {
    var Element, Grid, View;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Grid = dependencies.hasOwnProperty("Grid") ? dependencies.Grid : Parallelio.Grid;
    View = (function() {
      class View extends Element {
        setDefaults() {
          var ref3, ref4;
          if (!this.bounds) {
            this.grid = this.grid || ((ref3 = this.game._mainView) != null ? (ref4 = ref3.value) != null ? ref4.grid : void 0 : void 0) || new Grid();
            return this.bounds = this.grid.addCell();
          }
        }

        destroy() {
          return this.game = null;
        }

      };

      View.properties({
        game: {
          change: function(old) {
            if (this.game) {
              this.game.views.add(this);
              this.setDefaults();
            }
            if (old) {
              return old.views.remove(this);
            }
          }
        },
        x: {
          default: 0
        },
        y: {
          default: 0
        },
        grid: {
          default: null
        },
        bounds: {
          default: null
        }
      });

      return View;

    }).call(this);
    return View;
  });

  (function(definition) {
    Parallelio.Game = definition();
    return Parallelio.Game.definition = definition;
  })(function(dependencies = {}) {
    var Element, Game, Player, Timing, View;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : Parallelio.Timing;
    View = dependencies.hasOwnProperty("View") ? dependencies.View : Parallelio.View;
    Player = dependencies.hasOwnProperty("Player") ? dependencies.Player : Parallelio.Player;
    Game = (function() {
      class Game extends Element {
        start() {
          return this.currentPlayer;
        }

        add(elem) {
          elem.game = this;
          return elem;
        }

      };

      Game.properties({
        timing: {
          calcul: function() {
            return new Timing();
          }
        },
        mainView: {
          calcul: function() {
            if (this.views.length > 0) {
              return this.views.get(0);
            } else {
              return this.add(new this.defaultViewClass());
            }
          }
        },
        views: {
          collection: true
        },
        currentPlayer: {
          calcul: function() {
            if (this.players.length > 0) {
              return this.players.get(0);
            } else {
              return this.add(new this.defaultPlayerClass());
            }
          }
        },
        players: {
          collection: true
        }
      });

      Game.prototype.defaultViewClass = View;

      Game.prototype.defaultPlayerClass = Player;

      return Game;

    }).call(this);
    return Game;
  });

  (function(definition) {
    Parallelio.Obstacle = definition();
    return Parallelio.Obstacle.definition = definition;
  })(function(dependencies = {}) {
    var Obstacle, Tiled;
    Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : Parallelio.Tiled;
    Obstacle = (function() {
      class Obstacle extends Tiled {
        updateWalkables(old) {
          var ref3, ref4;
          if (old != null) {
            if ((ref3 = old.walkableMembers) != null) {
              ref3.removeRef('walkable', this);
            }
          }
          if (this.tile) {
            return (ref4 = this.tile.walkableMembers) != null ? ref4.setValueRef(false, 'walkable', this) : void 0;
          }
        }

      };

      Obstacle.properties({
        tile: {
          change: function(old, overrided) {
            overrided(old);
            return this.updateWalkables(old);
          }
        }
      });

      return Obstacle;

    }).call(this);
    return Obstacle;
  });

  (function(definition) {
    Parallelio.PersonalWeapon = definition();
    return Parallelio.PersonalWeapon.definition = definition;
  })(function(dependencies = {}) {
    var Element, LineOfSight, PersonalWeapon, Timing;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    LineOfSight = dependencies.hasOwnProperty("LineOfSight") ? dependencies.LineOfSight : Parallelio.LineOfSight;
    Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : Parallelio.Timing;
    PersonalWeapon = (function() {
      class PersonalWeapon extends Element {
        constructor(options) {
          super();
          this.setProperties(options);
        }

        canBeUsed() {
          return this.charged;
        }

        canUseOn(target) {
          return this.canUseFrom(this.user.tile, target);
        }

        canUseFrom(tile, target) {
          if (this.range === 1) {
            return this.inMeleeRange(tile, target);
          } else {
            return this.inRange(tile, target) && this.hasLineOfSight(tile, target);
          }
        }

        inRange(tile, target) {
          var ref3, targetTile;
          targetTile = target.tile || target;
          return ((ref3 = tile.dist(targetTile)) != null ? ref3.length : void 0) <= this.range;
        }

        inMeleeRange(tile, target) {
          var targetTile;
          targetTile = target.tile || target;
          return Math.abs(targetTile.x - tile.x) + Math.abs(targetTile.y - tile.y) === 1;
        }

        hasLineOfSight(tile, target) {
          var los, targetTile;
          targetTile = target.tile || target;
          los = new LineOfSight(targetTile.container, tile.x + 0.5, tile.y + 0.5, targetTile.x + 0.5, targetTile.y + 0.5);
          los.traversableCallback = function(tile) {
            return tile.walkable;
          };
          return los.getSuccess();
        }

        useOn(target) {
          if (this.canBeUsed()) {
            target.damage(this.power);
            this.charged = false;
            return this.recharge();
          }
        }

        recharge() {
          this.charging = true;
          return this.chargeTimeout = this.timing.setTimeout(() => {
            this.charging = false;
            return this.recharged();
          }, this.rechargeTime);
        }

        recharged() {
          return this.charged = true;
        }

        destroy() {
          if (this.chargeTimeout) {
            return this.chargeTimeout.destroy();
          }
        }

      };

      PersonalWeapon.properties({
        rechargeTime: {
          default: 1000
        },
        charged: {
          default: true
        },
        charging: {
          default: true
        },
        power: {
          default: 10
        },
        dps: {
          calcul: function(invalidator) {
            return invalidator.prop('power') / invalidator.prop('rechargeTime') * 1000;
          }
        },
        range: {
          default: 10
        },
        user: {
          default: null
        },
        timing: {
          calcul: function() {
            return new Timing();
          }
        }
      });

      return PersonalWeapon;

    }).call(this);
    return PersonalWeapon;
  });

  (function(definition) {
    Parallelio.Projectile = definition();
    return Parallelio.Projectile.definition = definition;
  })(function(dependencies = {}) {
    var Element, Projectile, Timing;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : Parallelio.Timing;
    Projectile = (function() {
      class Projectile extends Element {
        constructor(options) {
          super();
          this.setProperties(options);
          this.init();
        }

        init() {}

        launch() {
          this.moving = true;
          return this.pathTimeout = this.timing.setTimeout(() => {
            this.deliverPayload();
            return this.moving = false;
          }, this.pathLength / this.speed * 1000);
        }

        deliverPayload() {
          var payload;
          payload = new this.propagationType({
            tile: this.target.tile || this.target,
            power: this.power,
            range: this.blastRange
          });
          payload.apply();
          this.payloadDelivered();
          return payload;
        }

        payloadDelivered() {
          return this.destroy();
        }

        destroy() {
          return this.destroyProperties();
        }

      };

      Projectile.properties({
        origin: {
          default: null
        },
        target: {
          default: null
        },
        power: {
          default: 10
        },
        blastRange: {
          default: 1
        },
        propagationType: {
          default: null
        },
        speed: {
          default: 10
        },
        pathLength: {
          calcul: function() {
            var dist;
            if ((this.originTile != null) && (this.targetTile != null)) {
              dist = this.originTile.dist(this.targetTile);
              if (dist) {
                return dist.length;
              }
            }
            return 100;
          }
        },
        originTile: {
          calcul: function(invalidator) {
            var origin;
            origin = invalidator.prop('origin');
            if (origin != null) {
              return origin.tile || origin;
            }
          }
        },
        targetTile: {
          calcul: function(invalidator) {
            var target;
            target = invalidator.prop('target');
            if (target != null) {
              return target.tile || target;
            }
          }
        },
        container: {
          calcul: function(invalidate) {
            var originTile, targetTile;
            originTile = invalidate.prop('originTile');
            targetTile = invalidate.prop('targetTile');
            if (originTile.container === targetTile.container) {
              return originTile.container;
            } else if (invalidate.prop('prcPath') > 0.5) {
              return targetTile.container;
            } else {
              return originTile.container;
            }
          }
        },
        x: {
          calcul: function(invalidate) {
            var startPos;
            startPos = invalidate.prop('startPos');
            return (invalidate.prop('targetPos').x - startPos.x) * invalidate.prop('prcPath') + startPos.x;
          }
        },
        y: {
          calcul: function(invalidate) {
            var startPos;
            startPos = invalidate.prop('startPos');
            return (invalidate.prop('targetPos').y - startPos.y) * invalidate.prop('prcPath') + startPos.y;
          }
        },
        startPos: {
          calcul: function(invalidate) {
            var container, dist, offset, originTile;
            originTile = invalidate.prop('originTile');
            container = invalidate.prop('container');
            offset = this.startOffset;
            if (originTile.container !== container) {
              dist = container.dist(originTile.container);
              offset.x += dist.x;
              offset.y += dist.y;
            }
            return {
              x: originTile.x + offset.x,
              y: originTile.y + offset.y
            };
          },
          output: function(val) {
            return Object.assign({}, val);
          }
        },
        targetPos: {
          calcul: function(invalidate) {
            var container, dist, offset, targetTile;
            targetTile = invalidate.prop('targetTile');
            container = invalidate.prop('container');
            offset = this.targetOffset;
            if (targetTile.container !== container) {
              dist = container.dist(targetTile.container);
              offset.x += dist.x;
              offset.y += dist.y;
            }
            return {
              x: targetTile.x + offset.x,
              y: targetTile.y + offset.y
            };
          },
          output: function(val) {
            return Object.assign({}, val);
          }
        },
        startOffset: {
          default: {
            x: 0.5,
            y: 0.5
          },
          output: function(val) {
            return Object.assign({}, val);
          }
        },
        targetOffset: {
          default: {
            x: 0.5,
            y: 0.5
          },
          output: function(val) {
            return Object.assign({}, val);
          }
        },
        prcPath: {
          calcul: function() {
            var ref3;
            return ((ref3 = this.pathTimeout) != null ? ref3.getPrc() : void 0) || 0;
          }
        },
        timing: {
          calcul: function() {
            return new Timing();
          }
        },
        moving: {
          default: false
        }
      });

      return Projectile;

    }).call(this);
    return Projectile;
  });

  (function(definition) {
    Parallelio.RoomGenerator = definition();
    return Parallelio.RoomGenerator.definition = definition;
  })(function(dependencies = {}) {
    var Direction, Door, Element, RoomGenerator, Tile, TileContainer;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    TileContainer = dependencies.hasOwnProperty("TileContainer") ? dependencies.TileContainer : Parallelio.TileContainer;
    Tile = dependencies.hasOwnProperty("Tile") ? dependencies.Tile : Parallelio.Tile;
    Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : Parallelio.Direction;
    Door = dependencies.hasOwnProperty("Door") ? dependencies.Door : Parallelio.Door;
    RoomGenerator = (function() {
      class RoomGenerator extends Element {
        constructor(options) {
          super();
          this.setProperties(options);
        }

        initTiles() {
          this.finalTiles = null;
          this.rooms = [];
          return this.free = this.tileContainer.allTiles().filter((tile) => {
            var direction, k, len, next, ref3;
            ref3 = Direction.all;
            for (k = 0, len = ref3.length; k < len; k++) {
              direction = ref3[k];
              next = this.tileContainer.getTile(tile.x + direction.x, tile.y + direction.y);
              if (next == null) {
                return false;
              }
            }
            return true;
          });
        }

        calcul() {
          var i;
          this.initTiles();
          i = 0;
          while (this.step() || this.newRoom()) {
            i++;
          }
          this.createDoors();
          this.rooms;
          return this.makeFinalTiles();
        }

        makeFinalTiles() {
          return this.finalTiles = this.tileContainer.allTiles().map((tile) => {
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
          }).filter((tile) => {
            return tile != null;
          });
        }

        getTiles() {
          if (this.finalTiles == null) {
            this.calcul();
          }
          return this.finalTiles;
        }

        newRoom() {
          if (this.free.length) {
            this.volume = Math.floor(this.rng() * (this.maxVolume - this.minVolume)) + this.minVolume;
            return this.room = new RoomGenerator.Room();
          }
        }

        randomDirections() {
          var i, j, o, x;
          o = Direction.adjacents.slice();
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
        }

        step() {
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
        }

        roomDone() {
          this.rooms.push(this.room);
          this.allocateWalls(this.room);
          return this.room = null;
        }

        expand(room, direction, max = 0) {
          var k, len, next, ref3, second, success, tile;
          success = false;
          ref3 = room.tiles;
          for (k = 0, len = ref3.length; k < len; k++) {
            tile = ref3[k];
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
        }

        allocateWalls(room) {
          var direction, k, len, next, nextRoom, otherSide, ref3, results, tile;
          ref3 = room.tiles;
          results = [];
          for (k = 0, len = ref3.length; k < len; k++) {
            tile = ref3[k];
            results.push((function() {
              var l, len1, ref4, results1;
              ref4 = Direction.all;
              results1 = [];
              for (l = 0, len1 = ref4.length; l < len1; l++) {
                direction = ref4[l];
                next = this.tileContainer.getTile(tile.x + direction.x, tile.y + direction.y);
                if ((next != null) && next.room !== room) {
                  if (indexOf.call(Direction.corners, direction) < 0) {
                    otherSide = this.tileContainer.getTile(tile.x + direction.x * 2, tile.y + direction.y * 2);
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
        }

        createDoors() {
          var door, k, len, ref3, results, room, walls;
          ref3 = this.rooms;
          results = [];
          for (k = 0, len = ref3.length; k < len; k++) {
            room = ref3[k];
            results.push((function() {
              var l, len1, ref4, results1;
              ref4 = room.wallsByRooms();
              results1 = [];
              for (l = 0, len1 = ref4.length; l < len1; l++) {
                walls = ref4[l];
                if ((walls.room != null) && room.doorsForRoom(walls.room) < 1) {
                  door = walls.tiles[Math.floor(this.rng() * walls.tiles.length)];
                  door.factory = this.doorFactory;
                  door.factoryOptions = {
                    direction: this.tileContainer.getTile(door.x + 1, door.y).factory === this.floorFactory ? Door.directions.vertical : Door.directions.horizontal
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
        }

        allocateTile(tile, room = null) {
          var index;
          if (room != null) {
            room.addTile(tile);
            tile.factory = this.floorFactory;
          }
          index = this.free.indexOf(tile);
          if (index > -1) {
            return this.free.splice(index, 1);
          }
        }

        tileOffsetIsFree(tile, direction, multiply = 1) {
          return this.tileIsFree(tile.x + direction.x * multiply, tile.y + direction.y * multiply);
        }

        tileIsFree(x, y) {
          var tile;
          tile = this.tileContainer.getTile(x, y);
          if ((tile != null) && indexOf.call(this.free, tile) >= 0) {
            return tile;
          } else {
            return false;
          }
        }

        randomFreeTile() {
          return this.free[Math.floor(this.rng() * this.free.length)];
        }

      };

      RoomGenerator.properties({
        rng: {
          default: Math.random
        },
        maxVolume: {
          default: 25
        },
        minVolume: {
          default: 50
        },
        width: {
          default: 30
        },
        height: {
          default: 15
        },
        tileContainer: {
          calcul: function() {
            var k, l, ref3, ref4, tiles, x, y;
            tiles = new TileContainer();
            for (x = k = 0, ref3 = this.width; (0 <= ref3 ? k <= ref3 : k >= ref3); x = 0 <= ref3 ? ++k : --k) {
              for (y = l = 0, ref4 = this.height; (0 <= ref4 ? l <= ref4 : l >= ref4); y = 0 <= ref4 ? ++l : --l) {
                tiles.addTile(new Tile(x, y));
              }
            }
            return tiles;
          }
        },
        floorFactory: {
          default: function(opt) {
            return new Tile(opt.x, opt.y);
          }
        },
        wallFactory: {
          default: null
        },
        doorFactory: {
          calcul: function() {
            return this.floorFactory;
          }
        }
      });

      return RoomGenerator;

    }).call(this);
    RoomGenerator.Room = class Room {
      constructor() {
        this.tiles = [];
        this.walls = [];
        this.doors = [];
      }

      addTile(tile) {
        this.tiles.push(tile);
        return tile.room = this;
      }

      containsWall(tile) {
        var k, len, ref3, wall;
        ref3 = this.walls;
        for (k = 0, len = ref3.length; k < len; k++) {
          wall = ref3[k];
          if (wall.tile === tile) {
            return wall;
          }
        }
        return false;
      }

      addWall(tile, nextRoom) {
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
      }

      wallsByRooms() {
        var k, len, pos, ref3, res, rooms, wall;
        rooms = [];
        res = [];
        ref3 = this.walls;
        for (k = 0, len = ref3.length; k < len; k++) {
          wall = ref3[k];
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
      }

      addDoor(tile, nextRoom) {
        return this.doors.push({
          tile: tile,
          nextRoom: nextRoom
        });
      }

      doorsForRoom(room) {
        var door, k, len, ref3, res;
        res = [];
        ref3 = this.doors;
        for (k = 0, len = ref3.length; k < len; k++) {
          door = ref3[k];
          if (door.nextRoom === room) {
            res.push(door.tile);
          }
        }
        return res;
      }

    };
    return RoomGenerator;
  });

  (function(definition) {
    Parallelio.ShipWeapon = definition();
    return Parallelio.ShipWeapon.definition = definition;
  })(function(dependencies = {}) {
    var Damageable, Projectile, ShipWeapon, Tiled, Timing;
    Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : Parallelio.Tiled;
    Timing = dependencies.hasOwnProperty("Timing") ? dependencies.Timing : Parallelio.Timing;
    Damageable = dependencies.hasOwnProperty("Damageable") ? dependencies.Damageable : Parallelio.Damageable;
    Projectile = dependencies.hasOwnProperty("Projectile") ? dependencies.Projectile : Parallelio.Projectile;
    ShipWeapon = (function() {
      class ShipWeapon extends Tiled {
        constructor(options) {
          super();
          this.setProperties(options);
        }

        fire() {
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
        }

        recharge() {
          this.charging = true;
          return this.chargeTimeout = this.timing.setTimeout(() => {
            this.charging = false;
            return this.recharged();
          }, this.rechargeTime);
        }

        recharged() {
          this.charged = true;
          if (this.autoFire) {
            return this.fire();
          }
        }

      };

      ShipWeapon.extend(Damageable);

      ShipWeapon.properties({
        rechargeTime: {
          default: 1000
        },
        power: {
          default: 10
        },
        blastRange: {
          default: 1
        },
        propagationType: {
          default: null
        },
        projectileSpeed: {
          default: 10
        },
        target: {
          default: null,
          change: function() {
            if (this.autoFire) {
              return this.fire();
            }
          }
        },
        charged: {
          default: true
        },
        charging: {
          default: true
        },
        enabled: {
          default: true
        },
        autoFire: {
          default: true
        },
        criticalHealth: {
          default: 0.3
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

      return ShipWeapon;

    }).call(this);
    return ShipWeapon;
  });

  (function(definition) {
    Parallelio.Star = definition();
    return Parallelio.Star.definition = definition;
  })(function(dependencies = {}) {
    var Element, Star;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Star = (function() {
      class Star extends Element {
        constructor(x5, y5) {
          super();
          this.x = x5;
          this.y = y5;
          this.init();
        }

        init() {}

        linkTo(star) {
          if (!this.links.findStar(star)) {
            return this.addLink(new this.constructor.Link(this, star));
          }
        }

        addLink(link) {
          this.links.add(link);
          link.otherStar(this).links.add(link);
          return link;
        }

        dist(x, y) {
          var xDist, yDist;
          xDist = this.x - x;
          yDist = this.y - y;
          return Math.sqrt((xDist * xDist) + (yDist * yDist));
        }

      };

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

    }).call(this);
    Star.Link = class Link extends Element {
      constructor(star1, star2) {
        super();
        this.star1 = star1;
        this.star2 = star2;
      }

      remove() {
        this.star1.links.remove(this);
        return this.star2.links.remove(this);
      }

      otherStar(star) {
        if (star === this.star1) {
          return this.star2;
        } else {
          return this.star1;
        }
      }

      getLength() {
        return this.star1.dist(this.star2.x, this.star2.y);
      }

      inBoundaryBox(x, y, padding = 0) {
        var x1, x2, y1, y2;
        x1 = Math.min(this.star1.x, this.star2.x) - padding;
        y1 = Math.min(this.star1.y, this.star2.y) - padding;
        x2 = Math.max(this.star1.x, this.star2.x) + padding;
        y2 = Math.max(this.star1.y, this.star2.y) + padding;
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
      }

      closeToPoint(x, y, minDist) {
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
      }

      intersectLink(link) {
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
      }

    };
    return Star;
  });

  (function(definition) {
    Parallelio.ActionProvider = definition();
    return Parallelio.ActionProvider.definition = definition;
  })(function(dependencies = {}) {
    var ActionProvider, Element;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    ActionProvider = (function() {
      class ActionProvider extends Element {};

      ActionProvider.properties({
        providedActions: {
          collection: true
        }
      });

      return ActionProvider;

    }).call(this);
    return ActionProvider;
  });

  (function(definition) {
    Parallelio.SignalOperation = definition();
    return Parallelio.SignalOperation.definition = definition;
  })(function(dependencies = {}) {
    var Element, SignalOperation;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    SignalOperation = class SignalOperation extends Element {
      constructor() {
        super();
        this.queue = [];
        this.limiters = [];
      }

      addOperation(funct, priority = 1) {
        if (priority) {
          return this.queue.unshift(funct);
        } else {
          return this.queue.push(funct);
        }
      }

      addLimiter(connected) {
        if (!this.findLimiter(connected)) {
          return this.limiters.push(connected);
        }
      }

      findLimiter(connected) {
        return this.limiters.indexOf(connected) > -1;
      }

      start() {
        var results;
        results = [];
        while (this.queue.length) {
          results.push(this.step());
        }
        return results;
      }

      step() {
        var funct;
        if (this.queue.length === 0) {
          return this.done();
        } else {
          funct = this.queue.shift(funct);
          return funct(this);
        }
      }

      done() {}

    };
    return SignalOperation;
  });

  (function(definition) {
    Parallelio.Connected = definition();
    return Parallelio.Connected.definition = definition;
  })(function(dependencies = {}) {
    var CollectionPropertyWatcher, Connected, Element, SignalOperation;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    SignalOperation = dependencies.hasOwnProperty("SignalOperation") ? dependencies.SignalOperation : Parallelio.SignalOperation;
    CollectionPropertyWatcher = dependencies.hasOwnProperty("CollectionPropertyWatcher") ? dependencies.CollectionPropertyWatcher : Parallelio.Spark.CollectionPropertyWatcher;
    Connected = (function() {
      class Connected extends Element {
        canConnectTo(target) {
          return typeof target.addSignal === "function";
        }

        acceptSignal(signal) {
          return true;
        }

        onAddConnection(conn) {}

        onRemoveConnection(conn) {}

        onNewSignalType(signal) {}

        onAddSignal(signal, op) {}

        onRemoveSignal(signal, op) {}

        onRemoveSignalType(signal, op) {}

        onReplaceSignal(oldSignal, newSignal, op) {}

        containsSignal(signal, checkLast = false, checkOrigin) {
          return this.signals.find(function(c) {
            return c.match(signal, checkLast, checkOrigin);
          });
        }

        addSignal(signal, op) {
          var autoStart;
          if (!(op != null ? op.findLimiter(this) : void 0)) {
            if (!op) {
              op = new SignalOperation();
              autoStart = true;
            }
            op.addOperation(() => {
              var similar;
              if (!this.containsSignal(signal, true) && this.acceptSignal(signal)) {
                similar = this.containsSignal(signal);
                this.signals.push(signal);
                this.onAddSignal(signal, op);
                if (!similar) {
                  return this.onNewSignalType(signal, op);
                }
              }
            });
            if (autoStart) {
              op.start();
            }
          }
          return signal;
        }

        removeSignal(signal, op) {
          var autoStart;
          if (!(op != null ? op.findLimiter(this) : void 0)) {
            if (!op) {
              op = new SignalOperation;
              autoStart = true;
            }
            op.addOperation(() => {
              var existing;
              if ((existing = this.containsSignal(signal, true)) && this.acceptSignal(signal)) {
                this.signals.splice(this.signals.indexOf(existing), 1);
                this.onRemoveSignal(signal, op);
                op.addOperation(() => {
                  var similar;
                  similar = this.containsSignal(signal);
                  if (similar) {
                    return this.onReplaceSignal(signal, similar, op);
                  } else {
                    return this.onRemoveSignalType(signal, op);
                  }
                }, 0);
              }
              if (stepByStep) {
                return op.step();
              }
            });
            if (autoStart) {
              return op.start();
            }
          }
        }

        prepForwardedSignal(signal) {
          if (signal.last === this) {
            return signal;
          } else {
            return signal.withLast(this);
          }
        }

        checkForwardWatcher() {
          if (!this.forwardWatcher) {
            this.forwardWatcher = new CollectionPropertyWatcher({
              scope: this,
              property: 'outputs',
              onAdded: function(output, i) {
                return this.forwardedSignals.forEach((signal) => {
                  return this.forwardSignalTo(signal, output);
                });
              },
              onRemoved: function(output, i) {
                return this.forwardedSignals.forEach((signal) => {
                  return this.stopForwardedSignalTo(signal, output);
                });
              }
            });
            return this.forwardWatcher.bind();
          }
        }

        forwardSignal(signal, op) {
          var next;
          this.forwardedSignals.add(signal);
          next = this.prepForwardedSignal(signal);
          this.outputs.forEach(function(conn) {
            if (signal.last !== conn) {
              return conn.addSignal(next, op);
            }
          });
          return this.checkForwardWatcher();
        }

        forwardAllSignalsTo(conn, op) {
          return this.signals.forEach((signal) => {
            var next;
            next = this.prepForwardedSignal(signal);
            return conn.addSignal(next, op);
          });
        }

        stopForwardedSignal(signal, op) {
          var next;
          this.forwardedSignals.remove(signal);
          next = this.prepForwardedSignal(signal);
          return this.outputs.forEach(function(conn) {
            if (signal.last !== conn) {
              return conn.removeSignal(next, op);
            }
          });
        }

        stopAllForwardedSignalTo(conn, op) {
          return this.signals.forEach((signal) => {
            var next;
            next = this.prepForwardedSignal(signal);
            return conn.removeSignal(next, op);
          });
        }

        forwardSignalTo(signal, conn, op) {
          var next;
          next = this.prepForwardedSignal(signal);
          if (signal.last !== conn) {
            return conn.addSignal(next, op);
          }
        }

        stopForwardedSignalTo(signal, conn, op) {
          var next;
          next = this.prepForwardedSignal(signal);
          if (signal.last !== conn) {
            return conn.removeSignal(next, op);
          }
        }

      };

      Connected.properties({
        signals: {
          collection: true
        },
        inputs: {
          collection: true
        },
        outputs: {
          collection: true
        },
        forwardedSignals: {
          collection: true
        }
      });

      return Connected;

    }).call(this);
    return Connected;
  });

  (function(definition) {
    Parallelio.Signal = definition();
    return Parallelio.Signal.definition = definition;
  })(function(dependencies = {}) {
    var Element, Signal;
    Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : Parallelio.Spark.Element;
    Signal = class Signal extends Element {
      constructor(origin1, type = 'signal', exclusive = false) {
        super();
        this.origin = origin1;
        this.type = type;
        this.exclusive = exclusive;
        this.last = this.origin;
      }

      withLast(last) {
        var signal;
        signal = new this.__proto__.constructor(this.origin, this.type, this.exclusive);
        signal.last = last;
        return signal;
      }

      copy() {
        var signal;
        signal = new this.__proto__.constructor(this.origin, this.type, this.exclusive);
        signal.last = this.last;
        return signal;
      }

      match(signal, checkLast = false, checkOrigin = this.exclusive) {
        return (!checkLast || signal.last === this.last) && (checkOrigin || signal.origin === this.origin) && signal.type === this.type;
      }

    };
    return Signal;
  });

  (function(definition) {
    Parallelio.SignalSource = definition();
    return Parallelio.SignalSource.definition = definition;
  })(function(dependencies = {}) {
    var Connected, Signal, SignalOperation, SignalSource;
    Connected = dependencies.hasOwnProperty("Connected") ? dependencies.Connected : Parallelio.Connected;
    Signal = dependencies.hasOwnProperty("Signal") ? dependencies.Signal : Parallelio.Signal;
    SignalOperation = dependencies.hasOwnProperty("SignalOperation") ? dependencies.SignalOperation : Parallelio.SignalOperation;
    SignalSource = (function() {
      class SignalSource extends Connected {};

      SignalSource.properties({
        activated: {
          change: function() {
            var op;
            op = new SignalOperation();
            if (this.activated) {
              this.forwardSignal(this.signal, op);
            } else {
              this.stopForwardedSignal(this.signal, op);
            }
            return op.start();
          }
        },
        signal: {
          calcul: function() {
            return new Signal(this, 'power', true);
          }
        }
      });

      return SignalSource;

    }).call(this);
    return SignalSource;
  });

  (function(definition) {
    Parallelio.Switch = definition();
    return Parallelio.Switch.definition = definition;
  })(function(dependencies = {}) {
    var Connected, Switch;
    Connected = dependencies.hasOwnProperty("Connected") ? dependencies.Connected : Parallelio.Connected;
    Switch = class Switch extends Connected {};
    return Switch;
  });

  (function(definition) {
    Parallelio.Wire = definition();
    return Parallelio.Wire.definition = definition;
  })(function(dependencies = {}) {
    var Connected, Direction, Tiled, Wire;
    Tiled = dependencies.hasOwnProperty("Tiled") ? dependencies.Tiled : Parallelio.Tiled;
    Direction = dependencies.hasOwnProperty("Direction") ? dependencies.Direction : Parallelio.Direction;
    Connected = dependencies.hasOwnProperty("Connected") ? dependencies.Connected : Parallelio.Connected;
    Wire = (function() {
      class Wire extends Tiled {
        constructor(wireType = 'red') {
          super();
          this.wireType = wireType;
        }

        findDirectionsTo(conn) {
          var directions;
          directions = conn.tiles != null ? conn.tiles.map((tile) => {
            return this.tile.findDirectionOf(tile);
          }) : [this.tile.findDirectionOf(conn)];
          return directions.filter(function(d) {
            return d != null;
          });
        }

        canConnectTo(target) {
          return Connected.prototype.canConnectTo.call(this, target) && ((target.wireType == null) || target.wireType === this.wireType);
        }

        onNewSignalType(signal, op) {
          return this.forwardSignal(signal, op);
        }

      };

      Wire.extend(Connected);

      Wire.properties({
        outputs: {
          calcul: function(invalidation) {
            var parent;
            parent = invalidation.prop('tile');
            if (parent) {
              return invalidation.prop('adjacentTiles', parent).reduce((res, tile) => {
                return res.concat(invalidation.prop('children', tile).filter((child) => {
                  return this.canConnectTo(child);
                }).toArray());
              }, []);
            } else {
              return [];
            }
          }
        },
        connectedDirections: {
          calcul: function(invalidation) {
            return invalidation.prop('outputs').reduce((out, conn) => {
              this.findDirectionsTo(conn).forEach(function(d) {
                if (indexOf.call(out, d) < 0) {
                  return out.push(d);
                }
              });
              return out;
            }, []);
          }
        }
      });

      return Wire;

    }).call(this);
    return Wire;
  });

  (function(definition) {
    Parallelio.Spark.ActivablePropertyWatcher = definition();
    return Parallelio.Spark.ActivablePropertyWatcher.definition = definition;
  })(function(dependencies = {}) {
    var ActivablePropertyWatcher, Invalidator, PropertyWatcher;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Parallelio.Spark.PropertyWatcher;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    ActivablePropertyWatcher = class ActivablePropertyWatcher extends PropertyWatcher {
      loadOptions(options) {
        super.loadOptions(options);
        return this.active = options.active;
      }

      shouldBind() {
        var active;
        if (this.active != null) {
          if (this.invalidator == null) {
            this.invalidator = new Invalidator(this, this.scope);
            this.invalidator.callback = () => {
              return this.checkBind();
            };
          }
          this.invalidator.recycle();
          active = this.active(this.invalidator);
          this.invalidator.endRecycle();
          this.invalidator.bind();
          return active;
        } else {
          return true;
        }
      }

    };
    return ActivablePropertyWatcher;
  });

  (function(definition) {
    Parallelio.Spark.Invalidated = definition();
    return Parallelio.Spark.Invalidated.definition = definition;
  })(function(dependencies = {}) {
    var Invalidated, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Parallelio.Spark.Invalidator;
    Invalidated = class Invalidated {
      constructor(options) {
        if (options != null) {
          this.loadOptions(options);
        }
        if (!((options != null ? options.initByLoader : void 0) && (options.loader != null))) {
          this.init();
        }
      }

      loadOptions(options) {
        this.scope = options.scope;
        if (options.loaderAsScope && (options.loader != null)) {
          this.scope = options.loader;
        }
        return this.callback = options.callback;
      }

      init() {
        return this.update();
      }

      unknown() {
        return this.invalidator.validateUnknowns();
      }

      invalidate() {
        return this.update();
      }

      update() {
        if (this.invalidator == null) {
          this.invalidator = new Invalidator(this, this.scope);
        }
        this.invalidator.recycle();
        this.handleUpdate(this.invalidator);
        this.invalidator.endRecycle();
        this.invalidator.bind();
        return this;
      }

      handleUpdate(invalidator) {
        if (this.scope != null) {
          return this.callback.call(this.scope, invalidator);
        } else {
          return this.callback(invalidator);
        }
      }

      destroy() {
        if (this.invalidator) {
          return this.invalidator.unbind();
        }
      }

    };
    return Invalidated;
  });

  (function(definition) {
    Parallelio.SimpleActionProvider = definition();
    return Parallelio.SimpleActionProvider.definition = definition;
  })(function(dependencies = {}) {
    var ActionProvider, SimpleActionProvider;
    ActionProvider = dependencies.hasOwnProperty("ActionProvider") ? dependencies.ActionProvider : Parallelio.ActionProvider;
    SimpleActionProvider = (function() {
      class SimpleActionProvider extends ActionProvider {};

      SimpleActionProvider.properties({
        providedActions: {
          calcul: function() {
            var actions;
            actions = this.actions || this.constructor.actions;
            if (typeof actions === "object") {
              actions = Object.keys(actions).map(function(key) {
                return actions[key];
              });
            }
            return actions.map((action) => {
              return new action({
                target: this
              });
            });
          }
        }
      });

      return SimpleActionProvider;

    }).call(this);
    return SimpleActionProvider;
  });

  (function(definition) {
    Parallelio.TiledActionProvider = definition();
    return Parallelio.TiledActionProvider.definition = definition;
  })(function(dependencies = {}) {
    var ActionProvider, Mixable, TiledActionProvider;
    ActionProvider = dependencies.hasOwnProperty("ActionProvider") ? dependencies.ActionProvider : Parallelio.ActionProvider;
    Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : Parallelio.Spark.Mixable;
    TiledActionProvider = (function() {
      class TiledActionProvider extends ActionProvider {
        validActionTile(tile) {
          return tile != null;
        }

        prepareActionTile(tile) {
          if (!tile.getPropertyInstance('providedActions')) {
            return Mixable.Extension.make(ActionProvider.prototype, tile);
          }
        }

      };

      TiledActionProvider.properties({
        tile: {
          change: function(old, overrided) {
            overrided(old);
            return this.forwardedActions;
          }
        },
        actionTiles: {
          collection: true,
          calcul: function(invalidator) {
            var myTile;
            myTile = invalidator.prop('tile');
            if (myTile) {
              return this.actionTilesCoord.map((coord) => {
                return myTile.getRelativeTile(coord.x, coord.y);
              }).filter((tile) => {
                return this.validActionTile(tile);
              });
            } else {
              return [];
            }
          }
        },
        forwardedActions: {
          collection: {
            compare: function(a, b) {
              return a.action === b.action && a.location === b.location;
            }
          },
          calcul: function(invalidator) {
            var actionTiles, actions;
            actionTiles = invalidator.prop('actionTiles');
            actions = invalidator.prop('providedActions');
            return actionTiles.reduce((res, tile) => {
              return res.concat(actions.map(function(act) {
                return {
                  action: act,
                  location: tile
                };
              }));
            }, []);
          },
          itemAdded: function(forwarded) {
            this.prepareActionTile(forwarded.location);
            return forwarded.location.providedActions.add(forwarded.action);
          },
          itemRemoved: function(forwarded) {
            return forwarded.location.providedActions.remove(forwarded.action);
          }
        }
      });

      TiledActionProvider.prototype.actionTilesCoord = [
        {
          x: 0,
          y: -1
        },
        {
          x: -1,
          y: 0
        },
        {
          x: 0,
          y: 0
        },
        {
          x: +1,
          y: 0
        },
        {
          x: 0,
          y: +1
        }
      ];

      return TiledActionProvider;

    }).call(this);
    return TiledActionProvider;
  });

}).call(this);
