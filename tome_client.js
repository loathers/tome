"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// node_modules/dataloader/index.js
var require_dataloader = __commonJS({
  "node_modules/dataloader/index.js"(exports, module2) {
    "use strict";
    var DataLoader3 = /* @__PURE__ */ function() {
      function DataLoader4(batchLoadFn, options) {
        if (typeof batchLoadFn != "function")
          throw new TypeError("DataLoader must be constructed with a function which accepts " + ("Array<key> and returns Promise<Array<value>>, but got: " + batchLoadFn + "."));
        this._batchLoadFn = batchLoadFn, this._maxBatchSize = getValidMaxBatchSize(options), this._batchScheduleFn = getValidBatchScheduleFn(options), this._cacheKeyFn = getValidCacheKeyFn(options), this._cacheMap = getValidCacheMap(options), this._batch = null, this.name = getValidName(options);
      }
      var _proto = DataLoader4.prototype;
      return _proto.load = function(key) {
        if (key == null)
          throw new TypeError("The loader.load() function must be called with a value, " + ("but got: " + String(key) + "."));
        var batch = getCurrentBatch(this), cacheMap = this._cacheMap, cacheKey = this._cacheKeyFn(key);
        if (cacheMap) {
          var cachedPromise = cacheMap.get(cacheKey);
          if (cachedPromise) {
            var cacheHits = batch.cacheHits || (batch.cacheHits = []);
            return new Promise(function(resolve) {
              cacheHits.push(function() {
                resolve(cachedPromise);
              });
            });
          }
        }
        batch.keys.push(key);
        var promise = new Promise(function(resolve, reject) {
          batch.callbacks.push({
            resolve,
            reject
          });
        });
        return cacheMap && cacheMap.set(cacheKey, promise), promise;
      }, _proto.loadMany = function(keys) {
        if (!isArrayLike(keys))
          throw new TypeError("The loader.loadMany() function must be called with Array<key> " + ("but got: " + keys + "."));
        for (var loadPromises = [], i = 0; i < keys.length; i++)
          loadPromises.push(this.load(keys[i]).catch(function(error) {
            return error;
          }));
        return Promise.all(loadPromises);
      }, _proto.clear = function(key) {
        var cacheMap = this._cacheMap;
        if (cacheMap) {
          var cacheKey = this._cacheKeyFn(key);
          cacheMap.delete(cacheKey);
        }
        return this;
      }, _proto.clearAll = function() {
        var cacheMap = this._cacheMap;
        return cacheMap && cacheMap.clear(), this;
      }, _proto.prime = function(key, value) {
        var cacheMap = this._cacheMap;
        if (cacheMap) {
          var cacheKey = this._cacheKeyFn(key);
          if (cacheMap.get(cacheKey) === void 0) {
            var promise;
            value instanceof Error ? (promise = Promise.reject(value), promise.catch(function() {
            })) : promise = Promise.resolve(value), cacheMap.set(cacheKey, promise);
          }
        }
        return this;
      }, DataLoader4;
    }(), enqueuePostPromiseJob = typeof process == "object" && typeof process.nextTick == "function" ? function(fn) {
      resolvedPromise || (resolvedPromise = Promise.resolve()), resolvedPromise.then(function() {
        process.nextTick(fn);
      });
    } : typeof setImmediate == "function" ? function(fn) {
      setImmediate(fn);
    } : function(fn) {
      setTimeout(fn);
    }, resolvedPromise;
    function getCurrentBatch(loader) {
      var existingBatch = loader._batch;
      if (existingBatch !== null && !existingBatch.hasDispatched && existingBatch.keys.length < loader._maxBatchSize)
        return existingBatch;
      var newBatch = {
        hasDispatched: !1,
        keys: [],
        callbacks: []
      };
      return loader._batch = newBatch, loader._batchScheduleFn(function() {
        dispatchBatch(loader, newBatch);
      }), newBatch;
    }
    function dispatchBatch(loader, batch) {
      if (batch.hasDispatched = !0, batch.keys.length === 0) {
        resolveCacheHits(batch);
        return;
      }
      var batchPromise;
      try {
        batchPromise = loader._batchLoadFn(batch.keys);
      } catch (e) {
        return failedDispatch(loader, batch, new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function " + ("errored synchronously: " + String(e) + ".")));
      }
      if (!batchPromise || typeof batchPromise.then != "function")
        return failedDispatch(loader, batch, new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did " + ("not return a Promise: " + String(batchPromise) + ".")));
      batchPromise.then(function(values) {
        if (!isArrayLike(values))
          throw new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did " + ("not return a Promise of an Array: " + String(values) + "."));
        if (values.length !== batch.keys.length)
          throw new TypeError("DataLoader must be constructed with a function which accepts Array<key> and returns Promise<Array<value>>, but the function did not return a Promise of an Array of the same length as the Array of keys." + (`

Keys:
` + String(batch.keys)) + (`

Values:
` + String(values)));
        resolveCacheHits(batch);
        for (var i = 0; i < batch.callbacks.length; i++) {
          var value = values[i];
          value instanceof Error ? batch.callbacks[i].reject(value) : batch.callbacks[i].resolve(value);
        }
      }).catch(function(error) {
        failedDispatch(loader, batch, error);
      });
    }
    function failedDispatch(loader, batch, error) {
      resolveCacheHits(batch);
      for (var i = 0; i < batch.keys.length; i++)
        loader.clear(batch.keys[i]), batch.callbacks[i].reject(error);
    }
    function resolveCacheHits(batch) {
      if (batch.cacheHits)
        for (var i = 0; i < batch.cacheHits.length; i++)
          batch.cacheHits[i]();
    }
    function getValidMaxBatchSize(options) {
      var shouldBatch = !options || options.batch !== !1;
      if (!shouldBatch)
        return 1;
      var maxBatchSize = options && options.maxBatchSize;
      if (maxBatchSize === void 0)
        return 1 / 0;
      if (typeof maxBatchSize != "number" || maxBatchSize < 1)
        throw new TypeError("maxBatchSize must be a positive number: " + maxBatchSize);
      return maxBatchSize;
    }
    function getValidBatchScheduleFn(options) {
      var batchScheduleFn = options && options.batchScheduleFn;
      if (batchScheduleFn === void 0)
        return enqueuePostPromiseJob;
      if (typeof batchScheduleFn != "function")
        throw new TypeError("batchScheduleFn must be a function: " + batchScheduleFn);
      return batchScheduleFn;
    }
    function getValidCacheKeyFn(options) {
      var cacheKeyFn = options && options.cacheKeyFn;
      if (cacheKeyFn === void 0)
        return function(key) {
          return key;
        };
      if (typeof cacheKeyFn != "function")
        throw new TypeError("cacheKeyFn must be a function: " + cacheKeyFn);
      return cacheKeyFn;
    }
    function getValidCacheMap(options) {
      var shouldCache = !options || options.cache !== !1;
      if (!shouldCache)
        return null;
      var cacheMap = options && options.cacheMap;
      if (cacheMap === void 0)
        return /* @__PURE__ */ new Map();
      if (cacheMap !== null) {
        var cacheFunctions = ["get", "set", "delete", "clear"], missingFunctions = cacheFunctions.filter(function(fnName) {
          return cacheMap && typeof cacheMap[fnName] != "function";
        });
        if (missingFunctions.length !== 0)
          throw new TypeError("Custom cacheMap missing methods: " + missingFunctions.join(", "));
      }
      return cacheMap;
    }
    function getValidName(options) {
      return options && options.name ? options.name : null;
    }
    function isArrayLike(x) {
      return typeof x == "object" && x !== null && typeof x.length == "number" && (x.length === 0 || x.length > 0 && Object.prototype.hasOwnProperty.call(x, x.length - 1));
    }
    module2.exports = DataLoader3;
  }
});

// node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "node_modules/react/cjs/react.production.min.js"(exports) {
    "use strict";
    var l = Symbol.for("react.element"), n = Symbol.for("react.portal"), p = Symbol.for("react.fragment"), q = Symbol.for("react.strict_mode"), r = Symbol.for("react.profiler"), t = Symbol.for("react.provider"), u = Symbol.for("react.context"), v = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), x = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), z = Symbol.iterator;
    function A(a) {
      return a === null || typeof a != "object" ? null : (a = z && a[z] || a["@@iterator"], typeof a == "function" ? a : null);
    }
    var B = {
      isMounted: function() {
        return !1;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    }, C = Object.assign, D = {};
    function E(a, b, e) {
      this.props = a, this.context = b, this.refs = D, this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if (typeof a != "object" && typeof a != "function" && a != null)
        throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a, this.context = b, this.refs = D, this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = !0;
    var I = Array.isArray, J = Object.prototype.hasOwnProperty, K = {
      current: null
    }, L = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    };
    function M(a, b, e) {
      var d, c = {}, k = null, h = null;
      if (b != null)
        for (d in b.ref !== void 0 && (h = b.ref), b.key !== void 0 && (k = "" + b.key), b)
          J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (g === 1)
        c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++)
          f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps)
        for (d in g = a.defaultProps, g)
          c[d] === void 0 && (c[d] = g[d]);
      return {
        $$typeof: l,
        type: a,
        key: k,
        ref: h,
        props: c,
        _owner: K.current
      };
    }
    function N(a, b) {
      return {
        $$typeof: l,
        type: a.type,
        key: b,
        ref: a.ref,
        props: a.props,
        _owner: a._owner
      };
    }
    function O(a) {
      return typeof a == "object" && a !== null && a.$$typeof === l;
    }
    function escape(a) {
      var b = {
        "=": "=0",
        ":": "=2"
      };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return typeof a == "object" && a !== null && a.key != null ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      (k === "undefined" || k === "boolean") && (a = null);
      var h = !1;
      if (a === null)
        h = !0;
      else
        switch (k) {
          case "string":
          case "number":
            h = !0;
            break;
          case "object":
            switch (a.$$typeof) {
              case l:
              case n:
                h = !0;
            }
        }
      if (h)
        return h = a, c = c(h), a = d === "" ? "." + Q(h, 0) : d, I(c) ? (e = "", a != null && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
          return a2;
        })) : c != null && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      if (h = 0, d = d === "" ? "." : d + ":", I(a))
        for (var g = 0; g < a.length; g++) {
          k = a[g];
          var f = d + Q(k, g);
          h += R(k, b, e, f, c);
        }
      else if (f = A(a), typeof f == "function")
        for (a = f.call(a), g = 0; !(k = a.next()).done; )
          k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
      else if (k === "object")
        throw b = String(a), Error("Objects are not valid as a React child (found: " + (b === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h;
    }
    function S(a, b, e) {
      if (a == null)
        return a;
      var d = [], c = 0;
      return R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      }), d;
    }
    function T(a) {
      if (a._status === -1) {
        var b = a._result;
        b = b(), b.then(function(b2) {
          (a._status === 0 || a._status === -1) && (a._status = 1, a._result = b2);
        }, function(b2) {
          (a._status === 0 || a._status === -1) && (a._status = 2, a._result = b2);
        }), a._status === -1 && (a._status = 0, a._result = b);
      }
      if (a._status === 1)
        return a._result.default;
      throw a._result;
    }
    var U = {
      current: null
    }, V = {
      transition: null
    }, W = {
      ReactCurrentDispatcher: U,
      ReactCurrentBatchConfig: V,
      ReactCurrentOwner: K
    };
    exports.Children = {
      map: S,
      forEach: function(a, b, e) {
        S(a, function() {
          b.apply(this, arguments);
        }, e);
      },
      count: function(a) {
        var b = 0;
        return S(a, function() {
          b++;
        }), b;
      },
      toArray: function(a) {
        return S(a, function(a2) {
          return a2;
        }) || [];
      },
      only: function(a) {
        if (!O(a))
          throw Error("React.Children.only expected to receive a single React element child.");
        return a;
      }
    };
    exports.Component = E;
    exports.Fragment = p;
    exports.Profiler = r;
    exports.PureComponent = G;
    exports.StrictMode = q;
    exports.Suspense = w;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports.cloneElement = function(a, b, e) {
      if (a == null)
        throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
      if (b != null) {
        if (b.ref !== void 0 && (k = b.ref, h = K.current), b.key !== void 0 && (c = "" + b.key), a.type && a.type.defaultProps)
          var g = a.type.defaultProps;
        for (f in b)
          J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = b[f] === void 0 && g !== void 0 ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (f === 1)
        d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++)
          g[m] = arguments[m + 2];
        d.children = g;
      }
      return {
        $$typeof: l,
        type: a.type,
        key: c,
        ref: k,
        props: d,
        _owner: h
      };
    };
    exports.createContext = function(a) {
      return a = {
        $$typeof: u,
        _currentValue: a,
        _currentValue2: a,
        _threadCount: 0,
        Provider: null,
        Consumer: null,
        _defaultValue: null,
        _globalName: null
      }, a.Provider = {
        $$typeof: t,
        _context: a
      }, a.Consumer = a;
    };
    exports.createElement = M;
    exports.createFactory = function(a) {
      var b = M.bind(null, a);
      return b.type = a, b;
    };
    exports.createRef = function() {
      return {
        current: null
      };
    };
    exports.forwardRef = function(a) {
      return {
        $$typeof: v,
        render: a
      };
    };
    exports.isValidElement = O;
    exports.lazy = function(a) {
      return {
        $$typeof: y,
        _payload: {
          _status: -1,
          _result: a
        },
        _init: T
      };
    };
    exports.memo = function(a, b) {
      return {
        $$typeof: x,
        type: a,
        compare: b === void 0 ? null : b
      };
    };
    exports.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    exports.unstable_act = function() {
      throw Error("act(...) is not supported in production builds of React.");
    };
    exports.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    exports.useContext = function(a) {
      return U.current.useContext(a);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    exports.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    exports.useId = function() {
      return U.current.useId();
    };
    exports.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    exports.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    exports.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    exports.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    exports.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    exports.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports.useState = function(a) {
      return U.current.useState(a);
    };
    exports.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    exports.useTransition = function() {
      return U.current.useTransition();
    };
    exports.version = "18.2.0";
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_react_production_min();
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Bounty: () => Bounty,
  Class: () => Class,
  Coinmaster: () => Coinmaster,
  Effect: () => Effect,
  Element: () => Element,
  Familiar: () => Familiar,
  Item: () => Item,
  Location: () => Location,
  Modifier: () => Modifier,
  Monster: () => Monster,
  Path: () => Path,
  Phylum: () => Phylum,
  RefreshContextProvider: () => RefreshContextProvider,
  Servant: () => Servant,
  Skill: () => Skill,
  Slot: () => Slot,
  Stat: () => Stat,
  Thrall: () => Thrall,
  Vykea: () => Vykea,
  abort: () => abort,
  absorbedMonsters: () => absorbedMonsters,
  addItemCondition: () => addItemCondition,
  adv1: () => adv1,
  advCost: () => advCost,
  adventure: () => adventure,
  allMonstersWithId: () => allMonstersWithId,
  allNormalOutfits: () => allNormalOutfits,
  apiCall: () => apiCall,
  appearanceRates: () => appearanceRates,
  append: () => append,
  attack: () => attack,
  autosell: () => autosell,
  autosellPrice: () => autosellPrice,
  availableAmount: () => availableAmount,
  availableChoiceOptions: () => availableChoiceOptions,
  availableChoiceSelectInputs: () => availableChoiceSelectInputs,
  availableChoiceTextInputs: () => availableChoiceTextInputs,
  availablePocket: () => availablePocket,
  batchClose: () => batchClose,
  batchFunction: () => batchFunction,
  batchOpen: () => batchOpen,
  batchProperties: () => batchProperties,
  bjornifyFamiliar: () => bjornifyFamiliar,
  blackMarketAvailable: () => blackMarketAvailable,
  booleanModifier: () => booleanModifier,
  buffedHitStat: () => buffedHitStat,
  bufferToFile: () => bufferToFile,
  buy: () => buy,
  buyPrice: () => buyPrice,
  buyUsingStorage: () => buyUsingStorage,
  buysItem: () => buysItem,
  call: () => call,
  canAdventure: () => canAdventure,
  canDrink: () => canDrink,
  canEat: () => canEat,
  canEquip: () => canEquip,
  canFaxbot: () => canFaxbot,
  canInteract: () => canInteract,
  canStillSteal: () => canStillSteal,
  canadiaAvailable: () => canadiaAvailable,
  candyForTier: () => candyForTier,
  ceil: () => ceil,
  changeMcd: () => changeMcd,
  charAt: () => charAt,
  chatClan: () => chatClan,
  chatMacro: () => chatMacro,
  chatNotify: () => chatNotify,
  chatPrivate: () => chatPrivate,
  chew: () => chew,
  choiceFollowsFight: () => choiceFollowsFight,
  classModifier: () => classModifier,
  clear: () => clear,
  clearBoozeHelper: () => clearBoozeHelper,
  clearFoodHelper: () => clearFoodHelper,
  cliExecute: () => cliExecute,
  cliExecuteOutput: () => cliExecuteOutput,
  closetAmount: () => closetAmount,
  combatManaCostModifier: () => combatManaCostModifier,
  combatRateModifier: () => combatRateModifier,
  combatSkillAvailable: () => combatSkillAvailable,
  concoctionPrice: () => concoctionPrice,
  containsText: () => containsText,
  council: () => council,
  count: () => count,
  craft: () => craft,
  craftType: () => craftType,
  creatableAmount: () => creatableAmount,
  creatableTurns: () => creatableTurns,
  create: () => create,
  currentHitStat: () => currentHitStat,
  currentMcd: () => currentMcd,
  currentPvpStances: () => currentPvpStances,
  currentRadSickness: () => currentRadSickness,
  currentRound: () => currentRound,
  dadSeaMonkeeWeakness: () => dadSeaMonkeeWeakness,
  dailySpecial: () => dailySpecial,
  damageAbsorptionPercent: () => damageAbsorptionPercent,
  damageReduction: () => damageReduction,
  dateToTimestamp: () => dateToTimestamp,
  daycount: () => daycount,
  debugprint: () => debugprint,
  defineDefault: () => defineDefault,
  descToEffect: () => descToEffect,
  descToItem: () => descToItem,
  disable: () => disable,
  dispensaryAvailable: () => dispensaryAvailable,
  displayAmount: () => displayAmount,
  drink: () => drink,
  drinksilent: () => drinksilent,
  dump: () => dump,
  eat: () => eat,
  eatsilent: () => eatsilent,
  effectModifier: () => effectModifier,
  effectPockets: () => effectPockets,
  eightBitPoints: () => eightBitPoints,
  elementalResistance: () => elementalResistance,
  emptyCloset: () => emptyCloset,
  enable: () => enable,
  endsWith: () => endsWith,
  enthroneFamiliar: () => enthroneFamiliar,
  entityDecode: () => entityDecode,
  entityEncode: () => entityEncode,
  equip: () => equip,
  equipAllFamiliars: () => equipAllFamiliars,
  equippedAmount: () => equippedAmount,
  equippedItem: () => equippedItem,
  eudora: () => eudora,
  eudoraItem: () => eudoraItem,
  everyCardName: () => everyCardName,
  expectedColdMedicineCabinet: () => expectedColdMedicineCabinet,
  expectedDamage: () => expectedDamage,
  experienceBonus: () => experienceBonus,
  expressionEval: () => expressionEval,
  extractItems: () => extractItems,
  extractMeat: () => extractMeat,
  familiarEquipment: () => familiarEquipment,
  familiarEquippedEquipment: () => familiarEquippedEquipment,
  familiarWeight: () => familiarWeight,
  favoriteFamiliars: () => favoriteFamiliars,
  faxbot: () => faxbot,
  fightFollowsChoice: () => fightFollowsChoice,
  fileToArray: () => fileToArray,
  fileToBuffer: () => fileToBuffer,
  fileToMap: () => fileToMap,
  floor: () => floor,
  floristAvailable: () => floristAvailable,
  flushMonsterManuelCache: () => flushMonsterManuelCache,
  formField: () => formField,
  formFields: () => formFields,
  formatDateTime: () => formatDateTime,
  friarsAvailable: () => friarsAvailable,
  fuelCost: () => fuelCost,
  fullnessLimit: () => fullnessLimit,
  gamedayToInt: () => gamedayToInt,
  gamedayToString: () => gamedayToString,
  gametimeToInt: () => gametimeToInt,
  getAllProperties: () => getAllProperties,
  getAutoAttack: () => getAutoAttack,
  getAutumnatonLocations: () => getAutumnatonLocations,
  getCampground: () => getCampground,
  getCcsAction: () => getCcsAction,
  getChateau: () => getChateau,
  getClanId: () => getClanId,
  getClanLounge: () => getClanLounge,
  getClanName: () => getClanName,
  getClanRumpus: () => getClanRumpus,
  getCloset: () => getCloset,
  getCounter: () => getCounter,
  getCounters: () => getCounters,
  getCustomOutfits: () => getCustomOutfits,
  getDisplay: () => getDisplay,
  getDwelling: () => getDwelling,
  getFishingLocations: () => getFishingLocations,
  getFloristPlants: () => getFloristPlants,
  getFreePulls: () => getFreePulls,
  getFuel: () => getFuel,
  getGoals: () => getGoals,
  getIgnoreZoneWarnings: () => getIgnoreZoneWarnings,
  getIngredients: () => getIngredients,
  getInventory: () => getInventory,
  getLocationMonsters: () => getLocationMonsters,
  getLocketMonsters: () => getLocketMonsters,
  getMonsterMapping: () => getMonsterMapping,
  getMonsters: () => getMonsters,
  getMoods: () => getMoods,
  getOutfits: () => getOutfits,
  getPath: () => getPath,
  getPathFull: () => getPathFull,
  getPathVariables: () => getPathVariables,
  getPermedSkills: () => getPermedSkills,
  getPlayerId: () => getPlayerId,
  getPlayerName: () => getPlayerName,
  getPower: () => getPower,
  getProperty: () => getProperty,
  getRelated: () => getRelated,
  getRevision: () => getRevision,
  getShop: () => getShop,
  getShopLog: () => getShopLog,
  getStackTrace: () => getStackTrace,
  getStash: () => getStash,
  getStorage: () => getStorage,
  getVersion: () => getVersion,
  getWorkshed: () => getWorkshed,
  getZapWand: () => getZapWand,
  gitAtHead: () => gitAtHead,
  gitExists: () => gitExists,
  gitInfo: () => gitInfo,
  gitList: () => gitList,
  globalTypes: () => globalTypes,
  gnomadsAvailable: () => gnomadsAvailable,
  goalExists: () => goalExists,
  groupString: () => groupString,
  guildAvailable: () => guildAvailable,
  guildStoreAvailable: () => guildStoreAvailable,
  handlingChoice: () => handlingChoice,
  haveBartender: () => haveBartender,
  haveChef: () => haveChef,
  haveDisplay: () => haveDisplay,
  haveEffect: () => haveEffect,
  haveEquipped: () => haveEquipped,
  haveFamiliar: () => haveFamiliar,
  haveMushroomPlot: () => haveMushroomPlot,
  haveOutfit: () => haveOutfit,
  haveServant: () => haveServant,
  haveShop: () => haveShop,
  haveSkill: () => haveSkill,
  hedgeMaze: () => hedgeMaze,
  heist: () => heist,
  heistTargets: () => heistTargets,
  hermit: () => hermit,
  hiddenTempleUnlocked: () => hiddenTempleUnlocked,
  hippyStoneBroken: () => hippyStoneBroken,
  hippyStoreAvailable: () => hippyStoreAvailable,
  historicalAge: () => historicalAge,
  historicalPrice: () => historicalPrice,
  holiday: () => holiday,
  hpCost: () => hpCost,
  imageToMonster: () => imageToMonster,
  inBadMoon: () => inBadMoon,
  inCasual: () => inCasual,
  inHardcore: () => inHardcore,
  inMoxieSign: () => inMoxieSign,
  inMultiFight: () => inMultiFight,
  inMuscleSign: () => inMuscleSign,
  inMysticalitySign: () => inMysticalitySign,
  inTerrarium: () => inTerrarium,
  inaccessibleReason: () => inaccessibleReason,
  indexOf: () => indexOf,
  inebrietyLimit: () => inebrietyLimit,
  initiativeModifier: () => initiativeModifier,
  insert: () => insert,
  isAccessible: () => isAccessible,
  isBanished: () => isBanished,
  isCoinmasterItem: () => isCoinmasterItem,
  isDarkMode: () => isDarkMode,
  isDiscardable: () => isDiscardable,
  isDisplayable: () => isDisplayable,
  isFamiliarEquipmentLocked: () => isFamiliarEquipmentLocked,
  isGiftable: () => isGiftable,
  isGoal: () => isGoal,
  isHeadless: () => isHeadless,
  isInteger: () => isInteger,
  isNpcItem: () => isNpcItem,
  isOnline: () => isOnline,
  isTradeable: () => isTradeable,
  isTrendy: () => isTrendy,
  isUnrestricted: () => isUnrestricted,
  isWearingOutfit: () => isWearingOutfit,
  itemAmount: () => itemAmount,
  itemDropModifier: () => itemDropModifier,
  itemDrops: () => itemDrops,
  itemDropsArray: () => itemDropsArray,
  itemPockets: () => itemPockets,
  itemType: () => itemType,
  joinStrings: () => joinStrings,
  jokePockets: () => jokePockets,
  jumpChance: () => jumpChance,
  knollAvailable: () => knollAvailable,
  lastChoice: () => lastChoice,
  lastDecision: () => lastDecision,
  lastIndexOf: () => lastIndexOf,
  lastItemMessage: () => lastItemMessage,
  lastMonster: () => lastMonster,
  lastSkillMessage: () => lastSkillMessage,
  leetify: () => leetify,
  length: () => length,
  lightningCost: () => lightningCost,
  limitMode: () => limitMode,
  loadHtml: () => loadHtml,
  lockFamiliarEquipment: () => lockFamiliarEquipment,
  logN: () => logN,
  logprint: () => logprint,
  makePlaceholder: () => makePlaceholder,
  makeUrl: () => makeUrl,
  mallPrice: () => mallPrice,
  mallPrices: () => mallPrices,
  manaCostModifier: () => manaCostModifier,
  mapToFile: () => mapToFile,
  markRemoteCallCacheDirty: () => markRemoteCallCacheDirty,
  max: () => max,
  maximize: () => maximize,
  meatDrop: () => meatDrop,
  meatDropModifier: () => meatDropModifier,
  meatPockets: () => meatPockets,
  min: () => min,
  minstrelInstrument: () => minstrelInstrument,
  minstrelLevel: () => minstrelLevel,
  minstrelQuest: () => minstrelQuest,
  modifierEval: () => modifierEval,
  monkeyPaw: () => monkeyPaw,
  monsterAttack: () => monsterAttack,
  monsterDefense: () => monsterDefense,
  monsterElement: () => monsterElement,
  monsterEval: () => monsterEval,
  monsterFactoidsAvailable: () => monsterFactoidsAvailable,
  monsterHp: () => monsterHp,
  monsterInitiative: () => monsterInitiative,
  monsterLevelAdjustment: () => monsterLevelAdjustment,
  monsterManuelText: () => monsterManuelText,
  monsterModifier: () => monsterModifier,
  monsterPhylum: () => monsterPhylum,
  monsterPockets: () => monsterPockets,
  moodExecute: () => moodExecute,
  moodList: () => moodList,
  moonLight: () => moonLight,
  moonPhase: () => moonPhase,
  mpCost: () => mpCost,
  myAbsorbs: () => myAbsorbs,
  myAdventures: () => myAdventures,
  myAscensions: () => myAscensions,
  myAudience: () => myAudience,
  myBasestat: () => myBasestat,
  myBjornedFamiliar: () => myBjornedFamiliar,
  myBuffedstat: () => myBuffedstat,
  myClass: () => myClass,
  myClosetMeat: () => myClosetMeat,
  myCompanion: () => myCompanion,
  myDaycount: () => myDaycount,
  myDiscomomentum: () => myDiscomomentum,
  myEffectiveFamiliar: () => myEffectiveFamiliar,
  myEffects: () => myEffects,
  myEnthronedFamiliar: () => myEnthronedFamiliar,
  myFamiliar: () => myFamiliar,
  myFullness: () => myFullness,
  myFury: () => myFury,
  myGardenType: () => myGardenType,
  myHash: () => myHash,
  myHp: () => myHp,
  myId: () => myId,
  myInebriety: () => myInebriety,
  myLevel: () => myLevel,
  myLightning: () => myLightning,
  myLocation: () => myLocation,
  myMask: () => myMask,
  myMaxfury: () => myMaxfury,
  myMaxhp: () => myMaxhp,
  myMaxmp: () => myMaxmp,
  myMaxpp: () => myMaxpp,
  myMeat: () => myMeat,
  myMp: () => myMp,
  myName: () => myName,
  myPath: () => myPath,
  myPathId: () => myPathId,
  myPokeFam: () => myPokeFam,
  myPp: () => myPp,
  myPrimestat: () => myPrimestat,
  myRain: () => myRain,
  myRobotEnergy: () => myRobotEnergy,
  myRobotScraps: () => myRobotScraps,
  myServant: () => myServant,
  mySessionAdv: () => mySessionAdv,
  mySessionItems: () => mySessionItems,
  mySessionMeat: () => mySessionMeat,
  mySessionResults: () => mySessionResults,
  mySign: () => mySign,
  mySoulsauce: () => mySoulsauce,
  mySpleenUse: () => mySpleenUse,
  myStorageMeat: () => myStorageMeat,
  myThrall: () => myThrall,
  myThunder: () => myThunder,
  myTotalTurnsSpent: () => myTotalTurnsSpent,
  myTurncount: () => myTurncount,
  myVykeaCompanion: () => myVykeaCompanion,
  myWildfireWater: () => myWildfireWater,
  nowToInt: () => nowToInt,
  nowToString: () => nowToString,
  npcPrice: () => npcPrice,
  numberologyPrize: () => numberologyPrize,
  numericModifier: () => numericModifier,
  outfit: () => outfit,
  outfitPieces: () => outfitPieces,
  outfitTattoo: () => outfitTattoo,
  outfitTreats: () => outfitTreats,
  overdrink: () => overdrink,
  pathIdToName: () => pathIdToName,
  pathNameToId: () => pathNameToId,
  pickPocket: () => pickPocket,
  pickedPockets: () => pickedPockets,
  pickedScraps: () => pickedScraps,
  ping: () => ping,
  placeholderIdentifier: () => placeholderIdentifier,
  placeholderTypes: () => placeholderTypes,
  pocketEffects: () => pocketEffects,
  pocketItems: () => pocketItems,
  pocketJoke: () => pocketJoke,
  pocketMeat: () => pocketMeat,
  pocketMonster: () => pocketMonster,
  pocketPoem: () => pocketPoem,
  pocketScrap: () => pocketScrap,
  pocketStats: () => pocketStats,
  poemPockets: () => poemPockets,
  potentialPockets: () => potentialPockets,
  preValidateAdventure: () => preValidateAdventure,
  prepareForAdventure: () => prepareForAdventure,
  print: () => print,
  printHtml: () => printHtml,
  propertyDefaultValue: () => propertyDefaultValue,
  propertyExists: () => propertyExists,
  propertyHasDefault: () => propertyHasDefault,
  pullsRemaining: () => pullsRemaining,
  putCloset: () => putCloset,
  putDisplay: () => putDisplay,
  putShop: () => putShop,
  putShopUsingStorage: () => putShopUsingStorage,
  putStash: () => putStash,
  pvpAttacksLeft: () => pvpAttacksLeft,
  rainCost: () => rainCost,
  random: () => random,
  rawDamageAbsorption: () => rawDamageAbsorption,
  readCcs: () => readCcs,
  receiveFax: () => receiveFax,
  refreshShop: () => refreshShop,
  refreshStash: () => refreshStash,
  refreshStatus: () => refreshStatus,
  removeItemCondition: () => removeItemCondition,
  removeProperty: () => removeProperty,
  renameProperty: () => renameProperty,
  replace: () => replace,
  replaceString: () => replaceString,
  repriceShop: () => repriceShop,
  restorationPockets: () => restorationPockets,
  restoreHp: () => restoreHp,
  restoreMp: () => restoreMp,
  retrieveItem: () => retrieveItem,
  retrievePrice: () => retrievePrice,
  reverseNumberology: () => reverseNumberology,
  rollover: () => rollover,
  round: () => round,
  runChoice: () => runChoice,
  runCombat: () => runCombat,
  runTurn: () => runTurn,
  runaway: () => runaway,
  sausageGoblinChance: () => sausageGoblinChance,
  scrapPockets: () => scrapPockets,
  sell: () => sell,
  sellPrice: () => sellPrice,
  sellsItem: () => sellsItem,
  sendFax: () => sendFax,
  sessionLogs: () => sessionLogs,
  setAutoAttack: () => setAutoAttack,
  setCcs: () => setCcs,
  setLength: () => setLength,
  setLocation: () => setLocation,
  setProperty: () => setProperty,
  shopAmount: () => shopAmount,
  shopLimit: () => shopLimit,
  shopPrice: () => shopPrice,
  skillModifier: () => skillModifier,
  slashCount: () => slashCount,
  soulsauceCost: () => soulsauceCost,
  spleenLimit: () => spleenLimit,
  splitModifiers: () => splitModifiers,
  splitString: () => splitString,
  squareRoot: () => squareRoot,
  startsWith: () => startsWith,
  stashAmount: () => stashAmount,
  statBonusToday: () => statBonusToday,
  statBonusTomorrow: () => statBonusTomorrow,
  statModifier: () => statModifier,
  statsPockets: () => statsPockets,
  steal: () => steal,
  stillsAvailable: () => stillsAvailable,
  stopCounter: () => stopCounter,
  storageAmount: () => storageAmount,
  stringModifier: () => stringModifier,
  stunSkill: () => stunSkill,
  substring: () => substring,
  svnAtHead: () => svnAtHead,
  svnExists: () => svnExists,
  svnInfo: () => svnInfo,
  svnList: () => svnList,
  sweetSynthesis: () => sweetSynthesis,
  sweetSynthesisPair: () => sweetSynthesisPair,
  sweetSynthesisPairing: () => sweetSynthesisPairing,
  sweetSynthesisResult: () => sweetSynthesisResult,
  takeCloset: () => takeCloset,
  takeDisplay: () => takeDisplay,
  takeShop: () => takeShop,
  takeStash: () => takeStash,
  takeStorage: () => takeStorage,
  tavern: () => tavern,
  throwItem: () => throwItem,
  throwItems: () => throwItems,
  thunderCost: () => thunderCost,
  timeToString: () => timeToString,
  timestampToDate: () => timestampToDate,
  toBoolean: () => toBoolean,
  toBounty: () => toBounty,
  toBuffer: () => toBuffer,
  toClass: () => toClass,
  toCoinmaster: () => toCoinmaster,
  toEffect: () => toEffect,
  toElement: () => toElement,
  toFamiliar: () => toFamiliar,
  toFloat: () => toFloat,
  toInt: () => toInt,
  toItem: () => toItem,
  toJson: () => toJson,
  toLocation: () => toLocation,
  toLowerCase: () => toLowerCase,
  toMonster: () => toMonster,
  toPath: () => toPath,
  toPhylum: () => toPhylum,
  toPlural: () => toPlural,
  toServant: () => toServant,
  toSkill: () => toSkill,
  toSlot: () => toSlot,
  toStat: () => toStat,
  toString: () => toString,
  toThrall: () => toThrall,
  toUpperCase: () => toUpperCase,
  toUrl: () => toUrl,
  toVykea: () => toVykea,
  toWikiUrl: () => toWikiUrl,
  todayToString: () => todayToString,
  totalFreeRests: () => totalFreeRests,
  totalTurnsPlayed: () => totalTurnsPlayed,
  towerDoor: () => towerDoor,
  traceprint: () => traceprint,
  triggerSoftRefresh: () => triggerSoftRefresh,
  truncate: () => truncate,
  turnsPerCast: () => turnsPerCast,
  turnsPlayed: () => turnsPlayed,
  twiddle: () => twiddle,
  unusualConstructDisc: () => unusualConstructDisc,
  updateCandyPrices: () => updateCandyPrices,
  urlDecode: () => urlDecode,
  urlEncode: () => urlEncode,
  use: () => use,
  useFamiliar: () => useFamiliar,
  useServant: () => useServant,
  useSkill: () => useSkill,
  userConfirm: () => userConfirm,
  userNotify: () => userNotify,
  userPrompt: () => userPrompt,
  visit: () => visit,
  visitUrl: () => visitUrl,
  votingBoothInitiatives: () => votingBoothInitiatives,
  wait: () => wait,
  waitq: () => waitq,
  weaponHands: () => weaponHands,
  weaponType: () => weaponType,
  weightAdjustment: () => weightAdjustment,
  wellStocked: () => wellStocked,
  whiteCitadelAvailable: () => whiteCitadelAvailable,
  whoClan: () => whoClan,
  willUsuallyDodge: () => willUsuallyDodge,
  willUsuallyMiss: () => willUsuallyMiss,
  write: () => write,
  writeCcs: () => writeCcs,
  writeln: () => writeln,
  xpath: () => xpath,
  zap: () => zap
});
module.exports = __toCommonJS(src_exports);

// src/api/base.ts
function apiCall(request) {
  return fetch("/tome_server.js?relay=true", {
    method: "post",
    body: new URLSearchParams({
      body: JSON.stringify(request)
    }),
    headers: {
      // Mafia only accepts this format.
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).then((response) => response.json());
}

// src/api/function.ts
var import_setimmediate = require("setimmediate"), import_dataloader = __toESM(require_dataloader());
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _unsupportedIterableToArray(o, minLen) {
  if (o) {
    if (typeof o == "string")
      return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor && (n = o.constructor.name), n === "Map" || n === "Set")
      return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray(o, minLen);
  }
}
function _iterableToArray(iter) {
  if (typeof Symbol < "u" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
}
function _arrayLikeToArray(arr, len) {
  (len == null || len > arr.length) && (len = arr.length);
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function batchFunction(functions) {
  var allFunctions = new Map(functions.map((f) => [JSON.stringify(f), f]));
  return apiCall({
    functions: Array.from(allFunctions.values())
  }).then((returnValues) => functions.map((_ref) => {
    var _returnValues$functio, name = _ref.name, args = _ref.args, value = (_returnValues$functio = returnValues.functions) === null || _returnValues$functio === void 0 ? void 0 : _returnValues$functio[JSON.stringify([name].concat(_toConsumableArray(args)))];
    if (value === void 0)
      throw new Error("Unable to find return value for function ".concat(JSON.stringify([name].concat(_toConsumableArray(args))), "."));
    return value;
  }));
}
var functionsLoader = new import_dataloader.default(batchFunction, {
  batchScheduleFn: (callback) => setTimeout(callback, 50)
});
function callFunctionInternal(name, args) {
  return functionsLoader.load({
    name,
    args
  }).then((value) => value);
}
var call = new Proxy({}, {
  get: function(target, property) {
    if (typeof property != "symbol")
      return function() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)
          args[_key] = arguments[_key];
        return callFunctionInternal(property, args);
      };
  }
});

// node_modules/libram/dist/propertyTypes.js
var booleanProperties = ["abortOnChoiceWhenNotInChoice", "addChatCommandLine", "addCreationQueue", "addStatusBarToFrames", "allowCloseableDesktopTabs", "allowNegativeTally", "allowNonMoodBurning", "allowSummonBurning", "autoHighlightOnFocus", "broadcastEvents", "cacheMallSearches", "chatBeep", "chatLinksUseRelay", "compactChessboard", "copyAsHTML", "customizedTabs", "debugBuy", "debugConsequences", "debugFoxtrotRemoval", "debugPathnames", "gapProtection", "gitInstallDependencies", "gitShowCommitMessages", "gitUpdateOnLogin", "greenScreenProtection", "guiUsesOneWindow", "hideServerDebugText", "logAcquiredItems", "logBattleAction", "logBrowserInteractions", "logChatMessages", "logChatRequests", "logCleanedHTML", "logDecoratedResponses", "logFamiliarActions", "logGainMessages", "logReadableHTML", "logPreferenceChange", "logMonsterHealth", "logReverseOrder", "logStatGains", "logStatusEffects", "logStatusOnLogin", "macroDebug", "macroLens", "mementoListActive", "mergeHobopolisChat", "printStackOnAbort", "proxySet", "relayAddSounds", "relayAddsCustomCombat", "relayAddsDiscoHelper", "relayAddsGraphicalCLI", "relayAddsQuickScripts", "relayAddsRestoreLinks", "relayAddsUpArrowLinks", "relayAddsUseLinks", "relayAddsWikiLinks", "relayAllowRemoteAccess", "relayBrowserOnly", "relayCacheUncacheable", "relayFormatsChatText", "relayHidesJunkMallItems", "relayMaintainsEffects", "relayMaintainsHealth", "relayMaintainsMana", "relayOverridesImages", "relayRunsAfterAdventureScript", "relayRunsBeforeBattleScript", "relayRunsBeforePVPScript", "relayScriptButtonFirst", "relayTextualizesEffects", "relayTrimsZapList", "relayUsesInlineLinks", "relayUsesIntegratedChat", "relayWarnOnRecoverFailure", "removeMalignantEffects", "saveSettingsOnSet", "sharePriceData", "showAllRequests", "showExceptionalRequests", "stealthLogin", "svnInstallDependencies", "svnShowCommitMessages", "svnUpdateOnLogin", "switchEquipmentForBuffs", "syncAfterSvnUpdate", "useChatToolbar", "useContactsFrame", "useDevProxyServer", "useDockIconBadge", "useHugglerChannel", "useImageCache", "useLastUserAgent", "useSystemTrayIcon", "useTabbedChatFrame", "useToolbars", "useCachedVolcanoMaps", "useZoneComboBox", "verboseSpeakeasy", "verboseFloundry", "wrapLongLines", "_gitUpdated", "_svnRepoFileFetched", "_svnUpdated", "antagonisticSnowmanKitAvailable", "arcadeGameHints", "armoryUnlocked", "autoForbidIgnoringStores", "autoCraft", "autoQuest", "autoEntangle", "autoGarish", "autoManaRestore", "autoFillMayoMinder", "autoPinkyRing", "autoPlantHardcore", "autoPlantSoftcore", "autoPotionID", "autoRepairBoxServants", "autoSatisfyWithCloset", "autoSatisfyWithCoinmasters", "autoSatisfyWithMall", "autoSatisfyWithNPCs", "autoSatisfyWithStash", "autoSatisfyWithStorage", "autoSetConditions", "autoSteal", "autoTuxedo", "backupCameraReverserEnabled", "badMoonEncounter01", "badMoonEncounter02", "badMoonEncounter03", "badMoonEncounter04", "badMoonEncounter05", "badMoonEncounter06", "badMoonEncounter07", "badMoonEncounter08", "badMoonEncounter09", "badMoonEncounter10", "badMoonEncounter11", "badMoonEncounter12", "badMoonEncounter13", "badMoonEncounter14", "badMoonEncounter15", "badMoonEncounter16", "badMoonEncounter17", "badMoonEncounter18", "badMoonEncounter19", "badMoonEncounter20", "badMoonEncounter21", "badMoonEncounter22", "badMoonEncounter23", "badMoonEncounter24", "badMoonEncounter25", "badMoonEncounter26", "badMoonEncounter27", "badMoonEncounter28", "badMoonEncounter29", "badMoonEncounter30", "badMoonEncounter31", "badMoonEncounter32", "badMoonEncounter33", "badMoonEncounter34", "badMoonEncounter35", "badMoonEncounter36", "badMoonEncounter37", "badMoonEncounter38", "badMoonEncounter39", "badMoonEncounter40", "badMoonEncounter41", "badMoonEncounter42", "badMoonEncounter43", "badMoonEncounter44", "badMoonEncounter45", "badMoonEncounter46", "badMoonEncounter47", "badMoonEncounter48", "barrelShrineUnlocked", "bigBrotherRescued", "blackBartsBootyAvailable", "bondAdv", "bondBeach", "bondBeat", "bondBooze", "bondBridge", "bondDesert", "bondDR", "bondDrunk1", "bondDrunk2", "bondHoney", "bondHP", "bondInit", "bondItem1", "bondItem2", "bondItem3", "bondJetpack", "bondMartiniDelivery", "bondMartiniPlus", "bondMartiniTurn", "bondMeat", "bondMox1", "bondMox2", "bondMPregen", "bondMus1", "bondMus2", "bondMys1", "bondMys2", "bondSpleen", "bondStat", "bondStat2", "bondStealth", "bondStealth2", "bondSymbols", "bondWar", "bondWeapon2", "bondWpn", "booPeakLit", "bootsCharged", "breakfastCompleted", "burrowgrubHiveUsed", "calzoneOfLegendEaten", "canteenUnlocked", "chaosButterflyThrown", "chatbotScriptExecuted", "chateauAvailable", "chatLiterate", "chatServesUpdates", "checkJackassHardcore", "checkJackassSoftcore", "clanAttacksEnabled", "coldAirportAlways", "considerShadowNoodles", "controlRoomUnlock", "concertVisited", "controlPanel1", "controlPanel2", "controlPanel3", "controlPanel4", "controlPanel5", "controlPanel6", "controlPanel7", "controlPanel8", "controlPanel9", "corralUnlocked", "dailyDungeonDone", "dampOldBootPurchased", "daycareOpen", "deepDishOfLegendEaten", "demonSummoned", "dinseyAudienceEngagement", "dinseyGarbagePirate", "dinseyRapidPassEnabled", "dinseyRollercoasterNext", "dinseySafetyProtocolsLoose", "doghouseBoarded", "dontStopForCounters", "drippingHallUnlocked", "drippyShieldUnlocked", "edUsedLash", "eldritchFissureAvailable", "eldritchHorrorAvailable", "essenceOfAnnoyanceAvailable", "essenceOfBearAvailable", "expressCardUsed", "falloutShelterChronoUsed", "falloutShelterCoolingTankUsed", "fireExtinguisherBatHoleUsed", "fireExtinguisherChasmUsed", "fireExtinguisherCyrptUsed", "fireExtinguisherDesertUsed", "fireExtinguisherHaremUsed", "fistTeachingsHaikuDungeon", "fistTeachingsPokerRoom", "fistTeachingsBarroomBrawl", "fistTeachingsConservatory", "fistTeachingsBatHole", "fistTeachingsFunHouse", "fistTeachingsMenagerie", "fistTeachingsSlums", "fistTeachingsFratHouse", "fistTeachingsRoad", "fistTeachingsNinjaSnowmen", "flickeringPixel1", "flickeringPixel2", "flickeringPixel3", "flickeringPixel4", "flickeringPixel5", "flickeringPixel6", "flickeringPixel7", "flickeringPixel8", "frAlways", "frCemetaryUnlocked", "friarsBlessingReceived", "frMountainsUnlocked", "frSwampUnlocked", "frVillageUnlocked", "frWoodUnlocked", "getawayCampsiteUnlocked", "ghostPencil1", "ghostPencil2", "ghostPencil3", "ghostPencil4", "ghostPencil5", "ghostPencil6", "ghostPencil7", "ghostPencil8", "ghostPencil9", "gingerAdvanceClockUnlocked", "gingerBlackmailAccomplished", "gingerbreadCityAvailable", "gingerExtraAdventures", "gingerNegativesDropped", "gingerSewersUnlocked", "gingerSubwayLineUnlocked", "gingerRetailUnlocked", "glitchItemAvailable", "grabCloversHardcore", "grabCloversSoftcore", "guideToSafariAvailable", "guyMadeOfBeesDefeated", "hallowienerDefiledNook", "hallowienerGuanoJunction", "hallowienerKnollGym", "hallowienerMadnessBakery", "hallowienerMiddleChamber", "hallowienerOvergrownLot", "hallowienerSkeletonStore", "hallowienerSmutOrcs", "hallowienerSonofaBeach", "hallowienerVolcoino", "hardcorePVPWarning", "harvestBatteriesHardcore", "harvestBatteriesSoftcore", "hasAutumnaton", "hasBartender", "hasChef", "hasCocktailKit", "hasCosmicBowlingBall", "hasDetectiveSchool", "hasMaydayContract", "hasOven", "hasRange", "hasShaker", "hasSushiMat", "haveBoxingDaydreamHardcore", "haveBoxingDaydreamSoftcore", "hermitHax0red", "holidayHalsBookAvailable", "horseryAvailable", "hotAirportAlways", "implementGlitchItem", "intenseCurrents", "itemBoughtPerAscension637", "itemBoughtPerAscension8266", "itemBoughtPerAscension10790", "itemBoughtPerAscension10794", "itemBoughtPerAscension10795", "itemBoughtPerCharacter6423", "itemBoughtPerCharacter6428", "itemBoughtPerCharacter6429", "kingLiberated", "lastPirateInsult1", "lastPirateInsult2", "lastPirateInsult3", "lastPirateInsult4", "lastPirateInsult5", "lastPirateInsult6", "lastPirateInsult7", "lastPirateInsult8", "lawOfAveragesAvailable", "leafletCompleted", "libraryCardUsed", "lockPicked", "logBastilleBattalionBattles", "loginRecoveryHardcore", "loginRecoverySoftcore", "lovebugsUnlocked", "loveTunnelAvailable", "lowerChamberUnlock", "madnessBakeryAvailable", "makePocketWishesHardcore", "makePocketWishesSoftcore", "manualOfNumberologyAvailable", "mappingMonsters", "mapToAnemoneMinePurchased", "mapToKokomoAvailable", "mapToMadnessReefPurchased", "mapToTheDiveBarPurchased", "mapToTheMarinaraTrenchPurchased", "mapToTheSkateParkPurchased", "maraisBeaverUnlock", "maraisCorpseUnlock", "maraisDarkUnlock", "maraisVillageUnlock", "maraisWildlifeUnlock", "maraisWizardUnlock", "maximizerAlwaysCurrent", "maximizerCreateOnHand", "maximizerCurrentMallPrices", "maximizerFoldables", "maximizerIncludeAll", "maximizerNoAdventures", "middleChamberUnlock", "milkOfMagnesiumActive", "moonTuned", "neverendingPartyAlways", "oasisAvailable", "odeBuffbotCheck", "oilPeakLit", "oscusSodaUsed", "outrageousSombreroUsed", "overgrownLotAvailable", "ownsSpeakeasy", "pathedSummonsHardcore", "pathedSummonsSoftcore", "pizzaOfLegendEaten", "popularTartUnlocked", "potatoAlarmClockUsed", "prAlways", "prayedForGlamour", "prayedForProtection", "prayedForVigor", "primaryLabCheerCoreGrabbed", "pyramidBombUsed", "ROMOfOptimalityAvailable", "rageGlandVented", "readManualHardcore", "readManualSoftcore", "relayShowSpoilers", "relayShowWarnings", "rememberDesktopSize", "restUsingChateau", "restUsingCampAwayTent", "requireBoxServants", "requireSewerTestItems", "safePickpocket", "schoolOfHardKnocksDiplomaAvailable", "scriptCascadingMenus", "serverAddsCustomCombat", "SHAWARMAInitiativeUnlocked", "showForbiddenStores", "showGainsPerUnit", "showIgnoringStorePrices", "showNoSummonOnly", "showTurnFreeOnly", "skeletonStoreAvailable", "sleazeAirportAlways", "snojoAvailable", "sortByEffect", "sortByRoom", "spacegateAlways", "spacegateVaccine1", "spacegateVaccine2", "spacegateVaccine3", "spaceInvaderDefeated", "spelunkyHints", "spiceMelangeUsed", "spookyAirportAlways", "stenchAirportAlways", "stopForFixedWanderer", "stopForUltraRare", "styxPixieVisited", "superconductorDefeated", "suppressInappropriateNags", "suppressPowerPixellation", "suppressMallPriceCacheMessages", "telegraphOfficeAvailable", "telescopeLookedHigh", "timeTowerAvailable", "trackLightsOut", "uneffectWithHotTub", "universalSeasoningActive", "universalSeasoningAvailable", "useBookOfEverySkillHardcore", "useBookOfEverySkillSoftcore", "useCrimboToysHardcore", "useCrimboToysSoftcore", "verboseMaximizer", "visitLoungeHardcore", "visitLoungeSoftcore", "visitRumpusHardcore", "visitRumpusSoftcore", "voteAlways", "wildfireBarrelCaulked", "wildfireDusted", "wildfireFracked", "wildfirePumpGreased", "wildfireSprinkled", "yearbookCameraPending", "youRobotScavenged", "_affirmationCookieEaten", "_affirmationHateUsed", "_airFryerUsed", "_akgyxothUsed", "_alienAnimalMilkUsed", "_alienPlantPodUsed", "_allYearSucker", "_aprilShower", "_armyToddlerCast", "_authorsInkUsed", "_baconMachineUsed", "_bagOfCandy", "_bagOfCandyUsed", "_bagOTricksUsed", "_ballastTurtleUsed", "_ballInACupUsed", "_ballpit", "_barrelPrayer", "_bastilleLastBattleWon", "_beachCombing", "_bendHellUsed", "_blankoutUsed", "_bonersSummoned", "_bookOfEverySkillUsed", "_borrowedTimeUsed", "_bowleggedSwaggerUsed", "_bowlFullOfJellyUsed", "_boxOfHammersUsed", "_brainPreservationFluidUsed", "_brassDreadFlaskUsed", "_cameraUsed", "_canSeekBirds", "_carboLoaded", "_cargoPocketEmptied", "_ceciHatUsed", "_chateauDeskHarvested", "_chateauMonsterFought", "_chronerCrossUsed", "_chronerTriggerUsed", "_chubbyAndPlumpUsed", "_circleDrumUsed", "_clanFortuneBuffUsed", "_claraBellUsed", "_coalPaperweightUsed", "_cocoaDispenserUsed", "_cocktailShakerUsed", "_coldAirportToday", "_coldOne", "_communismUsed", "_confusingLEDClockUsed", "_controlPanelUsed", "_cookbookbatRecipeDrops", "_corruptedStardustUsed", "_cosmicSixPackConjured", "_crappyCameraUsed", "_creepyVoodooDollUsed", "_crimboTraining", "_crimboTree", "_cursedKegUsed", "_cursedMicrowaveUsed", "_dailyDungeonMalwareUsed", "_darkChocolateHeart", "_daycareFights", "_daycareNap", "_daycareSpa", "_daycareToday", "_defectiveTokenChecked", "_defectiveTokenUsed", "_dinseyGarbageDisposed", "_discoKnife", "_distentionPillUsed", "_dnaHybrid", "_docClocksThymeCocktailDrunk", "_drippingHallDoor1", "_drippingHallDoor2", "_drippingHallDoor3", "_drippingHallDoor4", "_drippyCaviarUsed", "_drippyNuggetUsed", "_drippyPilsnerUsed", "_drippyPlumUsed", "_drippyWineUsed", "_eldritchHorrorEvoked", "_eldritchTentacleFought", "_entauntaunedToday", "_envyfishEggUsed", "_essentialTofuUsed", "_etchedHourglassUsed", "_eternalCarBatteryUsed", "_everfullGlassUsed", "_eyeAndATwistUsed", "_fancyChessSetUsed", "_falloutShelterSpaUsed", "_fancyHotDogEaten", "_farmerItemsCollected", "_favoriteBirdVisited", "_firedJokestersGun", "_fireExtinguisherRefilled", "_fireStartingKitUsed", "_fireworksShop", "_fireworksShopHatBought", "_fireworksShopEquipmentBought", "_fireworkUsed", "_fishyPipeUsed", "_floundryItemCreated", "_floundryItemUsed", "_freePillKeeperUsed", "_frToday", "_fudgeSporkUsed", "_garbageItemChanged", "_gingerBiggerAlligators", "_gingerbreadCityToday", "_gingerbreadClockAdvanced", "_gingerbreadClockVisited", "_gingerbreadColumnDestroyed", "_gingerbreadMobHitUsed", "_glennGoldenDiceUsed", "_glitchItemImplemented", "_gnollEyeUsed", "_governmentPerDiemUsed", "_grimBuff", "_guildManualUsed", "_guzzlrQuestAbandoned", "_hardKnocksDiplomaUsed", "_hippyMeatCollected", "_hobbyHorseUsed", "_holidayFunUsed", "_holoWristCrystal", "_hotAirportToday", "_hungerSauceUsed", "_hyperinflatedSealLungUsed", "_iceHotelRoomsRaided", "_iceSculptureUsed", "_incredibleSelfEsteemCast", "_infernoDiscoVisited", "_internetDailyDungeonMalwareBought", "_internetGallonOfMilkBought", "_internetPlusOneBought", "_internetPrintScreenButtonBought", "_internetViralVideoBought", "_interviewIsabella", "_interviewMasquerade", "_interviewVlad", "_inquisitorsUnidentifiableObjectUsed", "_ironicMoustache", "_jackassPlumberGame", "_jarlsCheeseSummoned", "_jarlsCreamSummoned", "_jarlsDoughSummoned", "_jarlsEggsSummoned", "_jarlsFruitSummoned", "_jarlsMeatSummoned", "_jarlsPotatoSummoned", "_jarlsVeggiesSummoned", "_jingleBellUsed", "_jukebox", "_kgbFlywheelCharged", "_kgbLeftDrawerUsed", "_kgbOpened", "_kgbRightDrawerUsed", "_kolConSixPackUsed", "_kolhsCutButNotDried", "_kolhsIsskayLikeAnAshtray", "_kolhsPoeticallyLicenced", "_kolhsSchoolSpirited", "_kudzuSaladEaten", "_lastCombatWon", "_latteBanishUsed", "_latteCopyUsed", "_latteDrinkUsed", "_legendaryBeat", "_licenseToChillUsed", "_lodestoneUsed", "_lookingGlass", "_loveTunnelToday", "_loveTunnelUsed", "_luckyGoldRingVolcoino", "_lunchBreak", "_lupineHormonesUsed", "_lyleFavored", "_madLiquorDrunk", "_madTeaParty", "_mafiaMiddleFingerRingUsed", "_managerialManipulationUsed", "_mansquitoSerumUsed", "_maydayDropped", "_mayoDeviceRented", "_mayoTankSoaked", "_meatballMachineUsed", "_meatifyMatterUsed", "_milkOfMagnesiumUsed", "_mimeArmyShotglassUsed", "_missGravesVermouthDrunk", "_missileLauncherUsed", "_molehillMountainUsed", "_momFoodReceived", "_mrBurnsgerEaten", "_muffinOrderedToday", "_mushroomGardenVisited", "_neverendingPartyToday", "_newYouQuestCompleted", "_olympicSwimmingPool", "_olympicSwimmingPoolItemFound", "_overflowingGiftBasketUsed", "_partyHard", "_pastaAdditive", "_perfectFreezeUsed", "_perfectlyFairCoinUsed", "_petePartyThrown", "_peteRiotIncited", "_photocopyUsed", "_pickyTweezersUsed", "_pingPongGame", "_pirateBellowUsed", "_pirateForkUsed", "_pixelOrbUsed", "_plumbersMushroomStewEaten", "_pneumaticityPotionUsed", "_portableSteamUnitUsed", "_pottedTeaTreeUsed", "_prToday", "_psychoJarFilled", "_psychoJarUsed", "_psychokineticHugUsed", "_rainStickUsed", "_redwoodRainStickUsed", "_requestSandwichSucceeded", "_rhinestonesAcquired", "_seaJellyHarvested", "_setOfJacksUsed", "_sewingKitUsed", "_sexChanged", "_shadowAffinityToday", "_shadowForestLooted", "_shrubDecorated", "_silverDreadFlaskUsed", "_sitCourseCompleted", "_skateBuff1", "_skateBuff2", "_skateBuff3", "_skateBuff4", "_skateBuff5", "_sleazeAirportToday", "_sobrieTeaUsed", "_softwareGlitchTurnReceived", "_spacegateMurderbot", "_spacegateRuins", "_spacegateSpant", "_spacegateToday", "_spacegateVaccine", "_spaghettiBreakfast", "_spaghettiBreakfastEaten", "_spinmasterLatheVisited", "_spinningWheel", "_spookyAirportToday", "_stabonicScrollUsed", "_steelyEyedSquintUsed", "_stenchAirportToday", "_stinkyCheeseBanisherUsed", "_strangeStalagmiteUsed", "_streamsCrossed", "_stuffedPocketwatchUsed", "_styxSprayUsed", "_summonAnnoyanceUsed", "_summonCarrotUsed", "_summonResortPassUsed", "_sweetToothUsed", "_syntheticDogHairPillUsed", "_tacoFlierUsed", "_telegraphOfficeToday", "_templeHiddenPower", "_tempuraAirUsed", "_thesisDelivered", "_timeSpinnerReplicatorUsed", "_toastSummoned", "_tonicDjinn", "_treasuryEliteMeatCollected", "_treasuryHaremMeatCollected", "_trivialAvocationsGame", "_tryptophanDartUsed", "_turtlePowerCast", "_twelveNightEnergyUsed", "_ultraMegaSourBallUsed", "_victorSpoilsUsed", "_villainLairCanLidUsed", "_villainLairColorChoiceUsed", "_villainLairDoorChoiceUsed", "_villainLairFirecrackerUsed", "_villainLairSymbologyChoiceUsed", "_villainLairWebUsed", "_vmaskBanisherUsed", "_voraciTeaUsed", "_volcanoItemRedeemed", "_volcanoSuperduperheatedMetal", "_voteToday", "_VYKEACafeteriaRaided", "_VYKEALoungeRaided", "_walfordQuestStartedToday", "_warbearBankUsed", "_warbearBreakfastMachineUsed", "_warbearGyrocopterUsed", "_warbearSodaMachineUsed", "_wildfireBarrelHarvested", "_witchessBuff", "_workshedItemUsed", "_zombieClover", "_preventScurvy", "lockedItem4637", "lockedItem4638", "lockedItem4639", "lockedItem4646", "lockedItem4647", "unknownRecipe3542", "unknownRecipe3543", "unknownRecipe3544", "unknownRecipe3545", "unknownRecipe3546", "unknownRecipe3547", "unknownRecipe3548", "unknownRecipe3749", "unknownRecipe3751", "unknownRecipe4172", "unknownRecipe4173", "unknownRecipe4174", "unknownRecipe5060", "unknownRecipe5061", "unknownRecipe5062", "unknownRecipe5063", "unknownRecipe5064", "unknownRecipe5066", "unknownRecipe5067", "unknownRecipe5069", "unknownRecipe5070", "unknownRecipe5072", "unknownRecipe5073", "unknownRecipe5670", "unknownRecipe5671", "unknownRecipe6501", "unknownRecipe6564", "unknownRecipe6565", "unknownRecipe6566", "unknownRecipe6567", "unknownRecipe6568", "unknownRecipe6569", "unknownRecipe6570", "unknownRecipe6571", "unknownRecipe6572", "unknownRecipe6573", "unknownRecipe6574", "unknownRecipe6575", "unknownRecipe6576", "unknownRecipe6577", "unknownRecipe6578", "unknownRecipe7752", "unknownRecipe7753", "unknownRecipe7754", "unknownRecipe7755", "unknownRecipe7756", "unknownRecipe7757", "unknownRecipe7758", "unknownRecipe10970", "unknownRecipe10971", "unknownRecipe10972", "unknownRecipe10973", "unknownRecipe10974", "unknownRecipe10975", "unknownRecipe10976", "unknownRecipe10977", "unknownRecipe10978", "unknownRecipe10988", "unknownRecipe10989", "unknownRecipe10990", "unknownRecipe10991", "unknownRecipe10992", "unknownRecipe11000"], numericProperties = ["coinMasterIndex", "dailyDeedsVersion", "defaultDropdown1", "defaultDropdown2", "defaultDropdownSplit", "defaultLimit", "fixedThreadPoolSize", "itemManagerIndex", "lastBuffRequestType", "lastGlobalCounterDay", "lastImageCacheClear", "previousUpdateRevision", "relayDelayForSVN", "relaySkillButtonCount", "scriptButtonPosition", "statusDropdown", "svnThreadPoolSize", "toolbarPosition", "_g9Effect", "8BitBonusTurns", "8BitScore", "addingScrolls", "affirmationCookiesEaten", "aminoAcidsUsed", "antagonisticSnowmanKitCost", "ascensionsToday", "asolDeferredPoints", "asolPointsPigSkinner", "asolPointsCheeseWizard", "asolPointsJazzAgent", "autoAbortThreshold", "autoAntidote", "autoBuyPriceLimit", "autumnatonQuestTurn", "availableCandyCredits", "availableDimes", "availableFunPoints", "availableQuarters", "availableStoreCredits", "availableSwagger", "averageSwagger", "awolMedicine", "awolPointsBeanslinger", "awolPointsCowpuncher", "awolPointsSnakeoiler", "awolDeferredPointsBeanslinger", "awolDeferredPointsCowpuncher", "awolDeferredPointsSnakeoiler", "awolVenom", "bagOTricksCharges", "ballpitBonus", "bankedKarma", "bartenderTurnsUsed", "basementMallPrices", "basementSafetyMargin", "batmanFundsAvailable", "batmanBonusInitialFunds", "batmanTimeLeft", "bearSwagger", "beeCounter", "beGregariousCharges", "beGregariousFightsLeft", "birdformCold", "birdformHot", "birdformRoc", "birdformSleaze", "birdformSpooky", "birdformStench", "blackBartsBootyCost", "blackPuddingsDefeated", "blackForestProgress", "blankOutUsed", "bloodweiserDrunk", "bondPoints", "bondVillainsDefeated", "boneAbacusVictories", "booPeakProgress", "borisPoints", "breakableHandling", "breakableHandling1964", "breakableHandling9691", "breakableHandling9692", "breakableHandling9699", "breathitinCharges", "brodenBacteria", "brodenSprinkles", "buffBotMessageDisposal", "buffBotPhilanthropyType", "buffJimmyIngredients", "burnoutsDefeated", "burrowgrubSummonsRemaining", "camelSpit", "camerasUsed", "campAwayDecoration", "candyWitchTurnsUsed", "candyWitchCandyTotal", "carboLoading", "catBurglarBankHeists", "cellarLayout", "charitableDonations", "chasmBridgeProgress", "chefTurnsUsed", "chessboardsCleared", "chilledToTheBone", "cinderellaMinutesToMidnight", "cinderellaScore", "cocktailSummons", "commerceGhostCombats", "controlPanelOmega", "cornucopiasOpened", "cosmicBowlingBallReturnCombats", "cozyCounter6332", "cozyCounter6333", "cozyCounter6334", "craftingClay", "craftingLeather", "craftingStraw", "crimbo16BeardChakraCleanliness", "crimbo16BootsChakraCleanliness", "crimbo16BungChakraCleanliness", "crimbo16CrimboHatChakraCleanliness", "crimbo16GutsChakraCleanliness", "crimbo16HatChakraCleanliness", "crimbo16JellyChakraCleanliness", "crimbo16LiverChakraCleanliness", "crimbo16NippleChakraCleanliness", "crimbo16NoseChakraCleanliness", "crimbo16ReindeerChakraCleanliness", "crimbo16SackChakraCleanliness", "crimboTrainingSkill", "crimboTreeDays", "cubelingProgress", "currentExtremity", "currentHedgeMazeRoom", "currentMojoFilters", "currentNunneryMeat", "currentPortalEnergy", "cursedMagnifyingGlassCount", "cyrptAlcoveEvilness", "cyrptCrannyEvilness", "cyrptNicheEvilness", "cyrptNookEvilness", "cyrptTotalEvilness", "darkGyfftePoints", "daycareEquipment", "daycareInstructors", "daycareLastScavenge", "daycareToddlers", "dbNemesisSkill1", "dbNemesisSkill2", "dbNemesisSkill3", "desertExploration", "desktopHeight", "desktopWidth", "dinseyFilthLevel", "dinseyFunProgress", "dinseyNastyBearsDefeated", "dinseySocialJusticeIProgress", "dinseySocialJusticeIIProgress", "dinseyTouristsFed", "dinseyToxicMultiplier", "doctorBagQuestLights", "doctorBagUpgrades", "dreadScroll1", "dreadScroll2", "dreadScroll3", "dreadScroll4", "dreadScroll5", "dreadScroll6", "dreadScroll7", "dreadScroll8", "dripAdventuresSinceAscension", "drippingHallAdventuresSinceAscension", "drippingTreesAdventuresSinceAscension", "drippyBatsUnlocked", "drippyJuice", "drippyOrbsClaimed", "drunkenSwagger", "edDefeatAbort", "edPoints", "eldritchTentaclesFought", "electricKoolAidEaten", "elfGratitude", "encountersUntilDMTChoice", "encountersUntilNEPChoice", "encountersUntilSRChoice", "ensorceleeLevel", "entauntaunedColdRes", "essenceOfAnnoyanceCost", "essenceOfBearCost", "extraRolloverAdventures", "falloutShelterLevel", "familiarSweat", "fingernailsClipped", "fistSkillsKnown", "flyeredML", "fossilB", "fossilD", "fossilN", "fossilP", "fossilS", "fossilW", "fratboysDefeated", "frenchGuardTurtlesFreed", "funGuyMansionKills", "garbageChampagneCharge", "garbageFireProgress", "garbageShirtCharge", "garbageTreeCharge", "garlandUpgrades", "getsYouDrunkTurnsLeft", "ghostPepperTurnsLeft", "gingerDigCount", "gingerLawChoice", "gingerMuscleChoice", "gingerTrainScheduleStudies", "gladiatorBallMovesKnown", "gladiatorBladeMovesKnown", "gladiatorNetMovesKnown", "glitchItemCost", "glitchItemImplementationCount", "glitchItemImplementationLevel", "glitchSwagger", "gloverPoints", "gnasirProgress", "goldenMrAccessories", "gongPath", "gooseDronesRemaining", "goreCollected", "gourdItemCount", "greyYouPoints", "grimoire1Summons", "grimoire2Summons", "grimoire3Summons", "grimstoneCharge", "guardTurtlesFreed", "guideToSafariCost", "guyMadeOfBeesCount", "guzzlrBronzeDeliveries", "guzzlrDeliveryProgress", "guzzlrGoldDeliveries", "guzzlrPlatinumDeliveries", "haciendaLayout", "hallowiener8BitRealm", "hallowienerCoinspiracy", "hareMillisecondsSaved", "hareTurnsUsed", "heavyRainsStartingThunder", "heavyRainsStartingRain", "heavyRainsStartingLightning", "heroDonationBoris", "heroDonationJarlsberg", "heroDonationSneakyPete", "hiddenApartmentProgress", "hiddenBowlingAlleyProgress", "hiddenHospitalProgress", "hiddenOfficeProgress", "hiddenTavernUnlock", "highTopPumped", "hippiesDefeated", "holidayHalsBookCost", "holidaySwagger", "homemadeRobotUpgrades", "homebodylCharges", "hpAutoRecovery", "hpAutoRecoveryTarget", "iceSwagger", "jarlsbergPoints", "jungCharge", "junglePuns", "knownAscensions", "kolhsTotalSchoolSpirited", "lastAnticheeseDay", "lastArcadeAscension", "lastBadMoonReset", "lastBangPotionReset", "lastBattlefieldReset", "lastBeardBuff", "lastBreakfast", "lastCartographyBooPeak", "lastCartographyCastleTop", "lastCartographyDarkNeck", "lastCartographyDefiledNook", "lastCartographyFratHouse", "lastCartographyFratHouseVerge", "lastCartographyGuanoJunction", "lastCartographyHauntedBilliards", "lastCartographyHippyCampVerge", "lastCartographyZeppelinProtesters", "lastCastleGroundUnlock", "lastCastleTopUnlock", "lastCellarReset", "lastChanceThreshold", "lastChasmReset", "lastColosseumRoundWon", "lastCouncilVisit", "lastCounterDay", "lastDesertUnlock", "lastDispensaryOpen", "lastDMTDuplication", "lastDwarfFactoryReset", "lastEVHelmetValue", "lastEVHelmetReset", "lastEmptiedStorage", "lastFilthClearance", "lastGoofballBuy", "lastGuildStoreOpen", "lastGuyMadeOfBeesReset", "lastFratboyCall", "lastFriarCeremonyAscension", "lastFriarElbowNC", "lastFriarHeartNC", "lastFriarNeckNC", "lastHippyCall", "lastIslandUnlock", "lastKeyotronUse", "lastKingLiberation", "lastLightsOutTurn", "lastMushroomPlot", "lastMiningReset", "lastNemesisReset", "lastPaperStripReset", "lastPirateEphemeraReset", "lastPirateInsultReset", "lastPlusSignUnlock", "lastQuartetAscension", "lastQuartetRequest", "lastSecondFloorUnlock", "lastShadowForgeUnlockAdventure", "lastSkateParkReset", "lastStillBeatingSpleen", "lastTavernAscension", "lastTavernSquare", "lastTelescopeReset", "lastTempleAdventures", "lastTempleButtonsUnlock", "lastTempleUnlock", "lastThingWithNoNameDefeated", "lastTowelAscension", "lastTr4pz0rQuest", "lastTrainsetConfiguration", "lastVioletFogMap", "lastVoteMonsterTurn", "lastWartDinseyDefeated", "lastWuTangDefeated", "lastYearbookCameraAscension", "lastZapperWand", "lastZapperWandExplosionDay", "lawOfAveragesCost", "libramSummons", "lightsOutAutomation", "louvreDesiredGoal", "louvreGoal", "lovebugsAridDesert", "lovebugsBeachBuck", "lovebugsBooze", "lovebugsChroner", "lovebugsCoinspiracy", "lovebugsCyrpt", "lovebugsFreddy", "lovebugsFunFunds", "lovebugsHoboNickel", "lovebugsItemDrop", "lovebugsMeat", "lovebugsMeatDrop", "lovebugsMoxie", "lovebugsMuscle", "lovebugsMysticality", "lovebugsOilPeak", "lovebugsOrcChasm", "lovebugsPowder", "lovebugsWalmart", "lttQuestDifficulty", "lttQuestStageCount", "manaBurnSummonThreshold", "manaBurningThreshold", "manaBurningTrigger", "manorDrawerCount", "manualOfNumberologyCost", "mapToKokomoCost", "masksUnlocked", "maximizerMRUSize", "maximizerCombinationLimit", "maximizerEquipmentLevel", "maximizerEquipmentScope", "maximizerMaxPrice", "maximizerPriceLevel", "maxManaBurn", "mayflyExperience", "mayoLevel", "meansuckerPrice", "merkinVocabularyMastery", "miniAdvClass", "miniMartinisDrunk", "moleTunnelLevel", "mothershipProgress", "mpAutoRecovery", "mpAutoRecoveryTarget", "munchiesPillsUsed", "mushroomGardenCropLevel", "nextParanormalActivity", "nextQuantumFamiliarOwnerId", "nextQuantumFamiliarTurn", "noobPoints", "noobDeferredPoints", "noodleSummons", "nsContestants1", "nsContestants2", "nsContestants3", "nuclearAutumnPoints", "numericSwagger", "nunsVisits", "oilPeakProgress", "optimalSwagger", "optimisticCandleProgress", "palindomeDudesDefeated", "parasolUsed", "pendingMapReflections", "pingpongSkill", "pirateSwagger", "plantingDay", "plumberBadgeCost", "plumberCostumeCost", "plumberPoints", "poolSharkCount", "poolSkill", "primaryLabGooIntensity", "prismaticSummons", "procrastinatorLanguageFluency", "promptAboutCrafting", "puzzleChampBonus", "pyramidPosition", "rockinRobinProgress", "ROMOfOptimalityCost", "quantumPoints", "reagentSummons", "reanimatorArms", "reanimatorLegs", "reanimatorSkulls", "reanimatorWeirdParts", "reanimatorWings", "recentLocations", "redSnapperProgress", "relayPort", "relocatePygmyJanitor", "relocatePygmyLawyer", "rumpelstiltskinTurnsUsed", "rumpelstiltskinKidsRescued", "safariSwagger", "sausageGrinderUnits", "schoolOfHardKnocksDiplomaCost", "schoolSwagger", "scrapbookCharges", "scriptMRULength", "seaodesFound", "SeasoningSwagger", "sexChanges", "shenInitiationDay", "shockingLickCharges", "singleFamiliarRun", "skillBurn3", "skillBurn90", "skillBurn153", "skillBurn154", "skillBurn155", "skillBurn1019", "skillBurn5017", "skillBurn6014", "skillBurn6015", "skillBurn6016", "skillBurn6020", "skillBurn6021", "skillBurn6022", "skillBurn6023", "skillBurn6024", "skillBurn6026", "skillBurn6028", "skillBurn7323", "skillBurn14008", "skillBurn14028", "skillBurn14038", "skillBurn15011", "skillBurn15028", "skillBurn17005", "skillBurn22034", "skillBurn22035", "skillBurn23301", "skillBurn23302", "skillBurn23303", "skillBurn23304", "skillBurn23305", "skillBurn23306", "skillLevel46", "skillLevel47", "skillLevel48", "skillLevel117", "skillLevel118", "skillLevel121", "skillLevel128", "skillLevel134", "skillLevel144", "skillLevel180", "skillLevel188", "skillLevel7254", "slimelingFullness", "slimelingStacksDropped", "slimelingStacksDue", "smoresEaten", "smutOrcNoncombatProgress", "sneakyPetePoints", "snojoMoxieWins", "snojoMuscleWins", "snojoMysticalityWins", "sourceAgentsDefeated", "sourceEnlightenment", "sourceInterval", "sourcePoints", "sourceTerminalGram", "sourceTerminalPram", "sourceTerminalSpam", "spaceBabyLanguageFluency", "spacePirateLanguageFluency", "spelunkyNextNoncombat", "spelunkySacrifices", "spelunkyWinCount", "spookyPuttyCopiesMade", "statbotUses", "sugarCounter4178", "sugarCounter4179", "sugarCounter4180", "sugarCounter4181", "sugarCounter4182", "sugarCounter4183", "sugarCounter4191", "summonAnnoyanceCost", "sweat", "tacoDanCocktailSauce", "tacoDanFishMeat", "tavernLayout", "telescopeUpgrades", "tempuraSummons", "timeSpinnerMedals", "timesRested", "tomeSummons", "totalCharitableDonations", "trainsetPosition", "turtleBlessingTurns", "twinPeakProgress", "twoCRSPoints", "unicornHornInflation", "universalSeasoningCost", "usable1HWeapons", "usable1xAccs", "usable2HWeapons", "usable3HWeapons", "usableAccessories", "usableHats", "usableOffhands", "usableOther", "usablePants", "usableShirts", "valueOfAdventure", "valueOfInventory", "valueOfStill", "valueOfTome", "vintnerCharge", "vintnerWineLevel", "violetFogGoal", "walfordBucketProgress", "warehouseProgress", "welcomeBackAdv", "whetstonesUsed", "wolfPigsEvicted", "wolfTurnsUsed", "writingDesksDefeated", "xoSkeleltonXProgress", "xoSkeleltonOProgress", "yearbookCameraAscensions", "yearbookCameraUpgrades", "youRobotBody", "youRobotBottom", "youRobotLeft", "youRobotPoints", "youRobotRight", "youRobotTop", "zeppelinProtestors", "zigguratLianas", "zombiePoints", "_absintheDrops", "_abstractionDropsCrown", "_aguaDrops", "_xenomorphCharge", "_ancestralRecallCasts", "_antihangoverBonus", "_astralDrops", "_autumnatonQuests", "_backUpUses", "_badlyRomanticArrows", "_badgerCharge", "_balefulHowlUses", "_banderRunaways", "_bastilleCheese", "_bastilleGames", "_bastilleGameTurn", "_bastilleLastCheese", "_beanCannonUses", "_bearHugs", "_beerLensDrops", "_bellydancerPickpockets", "_benettonsCasts", "_birdsSoughtToday", "_boomBoxFights", "_boomBoxSongsLeft", "_bootStomps", "_boxingGloveArrows", "_brickoEyeSummons", "_brickoFights", "_campAwayCloudBuffs", "_campAwaySmileBuffs", "_candySummons", "_captainHagnkUsed", "_carnieCandyDrops", "_carrotNoseDrops", "_catBurglarCharge", "_catBurglarHeistsComplete", "_cheerleaderSteam", "_chestXRayUsed", "_chipBags", "_chocolateCigarsUsed", "_chocolateCoveredPingPongBallsUsed", "_chocolateSculpturesUsed", "_chocolatesUsed", "_chronolithActivations", "_chronolithNextCost", "_clanFortuneConsultUses", "_clipartSummons", "_cloversPurchased", "_coldMedicineConsults", "_coldMedicineEquipmentTaken", "_companionshipCasts", "_cookbookbatCrafting", "_cosmicBowlingSkillsUsed", "_crimbo21ColdResistance", "_dailySpecialPrice", "_daycareGymScavenges", "_daycareRecruits", "_deckCardsDrawn", "_deluxeKlawSummons", "_demandSandwich", "_detectiveCasesCompleted", "_disavowed", "_dnaPotionsMade", "_donhosCasts", "_dreamJarDrops", "_drunkPygmyBanishes", "_edDefeats", "_edLashCount", "_elronsCasts", "_enamorangs", "_energyCollected", "_expertCornerCutterUsed", "_favorRareSummons", "_feastUsed", "_feelinTheRhythm", "_feelPrideUsed", "_feelExcitementUsed", "_feelHatredUsed", "_feelLonelyUsed", "_feelNervousUsed", "_feelEnvyUsed", "_feelDisappointedUsed", "_feelSuperiorUsed", "_feelLostUsed", "_feelNostalgicUsed", "_feelPeacefulUsed", "_fingertrapArrows", "_fireExtinguisherCharge", "_fragrantHerbsUsed", "_freeBeachWalksUsed", "_frButtonsPressed", "_fudgeWaspFights", "_gapBuffs", "_garbageFireDrops", "_garbageFireDropsCrown", "_genieFightsUsed", "_genieWishesUsed", "_gibbererAdv", "_gibbererCharge", "_gingerbreadCityTurns", "_glarkCableUses", "_glitchMonsterFights", "_gnomeAdv", "_godLobsterFights", "_goldenMoneyCharge", "_gongDrops", "_gothKidCharge", "_gothKidFights", "_greyYouAdventures", "_grimBrotherCharge", "_grimFairyTaleDrops", "_grimFairyTaleDropsCrown", "_grimoireConfiscatorSummons", "_grimoireGeekySummons", "_grimstoneMaskDrops", "_grimstoneMaskDropsCrown", "_grooseCharge", "_grooseDrops", "_grubbyWoolDrops", "_guzzlrDeliveries", "_guzzlrGoldDeliveries", "_guzzlrPlatinumDeliveries", "_hareAdv", "_hareCharge", "_highTopPumps", "_hipsterAdv", "_hoardedCandyDropsCrown", "_hoboUnderlingSummons", "_holoWristDrops", "_holoWristProgress", "_hotAshesDrops", "_hotJellyUses", "_hotTubSoaks", "_humanMuskUses", "_iceballUses", "_inigosCasts", "_jerksHealthMagazinesUsed", "_jiggleCheese", "_jiggleCream", "_jiggleLife", "_jiggleSteak", "_jitbCharge", "_juneCleaverFightsLeft", "_juneCleaverEncounters", "_juneCleaverStench", "_juneCleaverSpooky", "_juneCleaverSleaze", "_juneCleaverHot", "_juneCleaverCold", "_juneCleaverSkips", "_jungDrops", "_kgbClicksUsed", "_kgbDispenserUses", "_kgbTranquilizerDartUses", "_klawSummons", "_kloopCharge", "_kloopDrops", "_kolhsAdventures", "_kolhsSavedByTheBell", "_lastDailyDungeonRoom", "_lastSausageMonsterTurn", "_lastZomboEye", "_latteRefillsUsed", "_leafblowerML", "_legionJackhammerCrafting", "_llamaCharge", "_longConUsed", "_lovebugsBeachBuck", "_lovebugsChroner", "_lovebugsCoinspiracy", "_lovebugsFreddy", "_lovebugsFunFunds", "_lovebugsHoboNickel", "_lovebugsWalmart", "_loveChocolatesUsed", "_lynyrdSnareUses", "_machineTunnelsAdv", "_macrometeoriteUses", "_mafiaThumbRingAdvs", "_mayflowerDrops", "_mayflySummons", "_mediumSiphons", "_meteoriteAdesUsed", "_meteorShowerUses", "_micrometeoriteUses", "_miniMartiniDrops", "_monkeyPawWishesUsed", "_monstersMapped", "_mushroomGardenFights", "_nanorhinoCharge", "_navelRunaways", "_neverendingPartyFreeTurns", "_newYouQuestSharpensDone", "_newYouQuestSharpensToDo", "_nextColdMedicineConsult", "_nextQuantumAlignment", "_nightmareFuelCharges", "_noobSkillCount", "_nuclearStockpileUsed", "_oilExtracted", "_olfactionsUsed", "_optimisticCandleDropsCrown", "_oreDropsCrown", "_otoscopeUsed", "_oysterEggsFound", "_pantsgivingBanish", "_pantsgivingCount", "_pantsgivingCrumbs", "_pantsgivingFullness", "_pasteDrops", "_peteJukeboxFixed", "_peteJumpedShark", "_petePeeledOut", "_pieDrops", "_piePartsCount", "_pixieCharge", "_pocketProfessorLectures", "_poisonArrows", "_pokeGrowFertilizerDrops", "_poolGames", "_powderedGoldDrops", "_powderedMadnessUses", "_powerfulGloveBatteryPowerUsed", "_powerPillDrops", "_powerPillUses", "_precisionCasts", "_radlibSummons", "_raindohCopiesMade", "_rapidPrototypingUsed", "_raveStealCount", "_reflexHammerUsed", "_resolutionAdv", "_resolutionRareSummons", "_riftletAdv", "_robinEggDrops", "_roboDrops", "_rogueProgramCharge", "_romanticFightsLeft", "_saberForceMonsterCount", "_saberForceUses", "_saberMod", "_saltGrainsConsumed", "_sandwormCharge", "_saplingsPlanted", "_sausageFights", "_sausagesEaten", "_sausagesMade", "_sealFigurineUses", "_sealScreeches", "_sealsSummoned", "_shadowBricksUsed", "_shadowRiftCombats", "_shatteringPunchUsed", "_shortOrderCookCharge", "_shrubCharge", "_sloppyDinerBeachBucks", "_smilesOfMrA", "_smithsnessSummons", "_snojoFreeFights", "_snojoParts", "_snokebombUsed", "_snowconeSummons", "_snowglobeDrops", "_snowSuitCount", "_sourceTerminalDigitizeMonsterCount", "_sourceTerminalDigitizeUses", "_sourceTerminalDuplicateUses", "_sourceTerminalEnhanceUses", "_sourceTerminalExtrudes", "_sourceTerminalPortscanUses", "_spaceFurDropsCrown", "_spacegatePlanetIndex", "_spacegateTurnsLeft", "_spaceJellyfishDrops", "_speakeasyDrinksDrunk", "_speakeasyFreeFights", "_spelunkerCharges", "_spelunkingTalesDrops", "_spikolodonSpikeUses", "_spookyJellyUses", "_stackLumpsUses", "_steamCardDrops", "_stickerSummons", "_stinkyCheeseCount", "_stressBallSqueezes", "_sugarSummons", "_sweatOutSomeBoozeUsed", "_taffyRareSummons", "_taffyYellowSummons", "_thanksgettingFoodsEaten", "_thingfinderCasts", "_thinknerdPackageDrops", "_thorsPliersCrafting", "_timeHelmetAdv", "_timeSpinnerMinutesUsed", "_tokenDrops", "_transponderDrops", "_turkeyBlastersUsed", "_turkeyBooze", "_turkeyMuscle", "_turkeyMyst", "_turkeyMoxie", "_unaccompaniedMinerUsed", "_unconsciousCollectiveCharge", "_universalSeasoningsUsed", "_universeCalculated", "_universeImploded", "_usedReplicaBatoomerang", "_vampyreCloakeFormUses", "_villainLairProgress", "_vitachocCapsulesUsed", "_vmaskAdv", "_voidFreeFights", "_volcanoItem1", "_volcanoItem2", "_volcanoItem3", "_volcanoItemCount1", "_volcanoItemCount2", "_volcanoItemCount3", "_voteFreeFights", "_VYKEACompanionLevel", "_warbearAutoAnvilCrafting", "_waxGlobDrops", "_whiteRiceDrops", "_witchessFights", "_xoHugsUsed", "_yellowPixelDropsCrown", "_zapCount", "_zombieSmashPocketsUsed"], monsterProperties = ["beGregariousMonster", "cameraMonster", "chateauMonster", "clumsinessGroveBoss", "crappyCameraMonster", "crudeMonster", "enamorangMonster", "envyfishMonster", "glacierOfJerksBoss", "iceSculptureMonster", "lastCopyableMonster", "longConMonster", "maelstromOfLoversBoss", "makeFriendsMonster", "merkinLockkeyMonster", "monkeyPointMonster", "motifMonster", "nosyNoseMonster", "olfactedMonster", "photocopyMonster", "rainDohMonster", "romanticTarget", "rufusDesiredEntity", "screencappedMonster", "spookyPuttyMonster", "stenchCursedMonster", "superficiallyInterestedMonster", "waxMonster", "yearbookCameraTarget", "_gallapagosMonster", "_jiggleCreamedMonster", "_latteMonster", "_nanorhinoBanishedMonster", "_newYouQuestMonster", "_relativityMonster", "_saberForceMonster", "_sourceTerminalDigitizeMonster", "_voteMonster"], locationProperties = ["autumnatonQuestLocation", "currentJunkyardLocation", "doctorBagQuestLocation", "ghostLocation", "guzzlrQuestLocation", "nextSpookyravenElizabethRoom", "nextSpookyravenStephenRoom", "sourceOracleTarget", "_floundryBassLocation", "_floundryCarpLocation", "_floundryCodLocation", "_floundryHatchetfishLocation", "_floundryTroutLocation", "_floundryTunaLocation", "_sotParcelLocation"], stringProperties = ["autoLogin", "browserBookmarks", "chatFontSize", "combatHotkey0", "combatHotkey1", "combatHotkey2", "combatHotkey3", "combatHotkey4", "combatHotkey5", "combatHotkey6", "combatHotkey7", "combatHotkey8", "combatHotkey9", "commandLineNamespace", "dailyDeedsOptions", "defaultBorderColor", "displayName", "externalEditor", "getBreakfast", "headerStates", "highlightList", "http.proxyHost", "http.proxyPassword", "http.proxyPort", "http.proxyUser", "https.proxyHost", "https.proxyPassword", "https.proxyPort", "https.proxyUser", "initialDesktop", "initialFrames", "lastRelayUpdate", "lastUserAgent", "lastUsername", "logPreferenceChangeFilter", "loginScript", "loginServerName", "loginWindowLogo", "logoutScript", "previousNotifyList", "previousUpdateVersion", "saveState", "saveStateActive", "scriptList", "swingLookAndFeel", "userAgent", "8BitColor", "afterAdventureScript", "autoOlfact", "autoPutty", "autumnatonUpgrades", "backupCameraMode", "banishedMonsters", "banishingShoutMonsters", "batmanStats", "batmanZone", "batmanUpgrades", "battleAction", "beachHeadsUnlocked", "beforePVPScript", "betweenBattleScript", "boomBoxSong", "breakfastAlways", "breakfastHardcore", "breakfastSoftcore", "buffBotCasting", "buyScript", "cargoPocketsEmptied", "cargoPocketScraps", "chatbotScript", "chatPlayerScript", "choiceAdventureScript", "chosenTrip", "clanFortuneReply1", "clanFortuneReply2", "clanFortuneReply3", "clanFortuneWord1", "clanFortuneWord2", "clanFortuneWord3", "commerceGhostItem", "counterScript", "copperheadClubHazard", "crimbotChassis", "crimbotArm", "crimbotPropulsion", "crystalBallPredictions", "csServicesPerformed", "currentAstralTrip", "currentDistillateMods", "currentEasyBountyItem", "currentHardBountyItem", "currentHippyStore", "currentJunkyardTool", "currentLlamaForm", "currentMood", "currentPVPSeason", "currentPvpVictories", "currentSpecialBountyItem", "currentSITSkill", "customCombatScript", "cyrusAdjectives", "defaultFlowerLossMessage", "defaultFlowerWinMessage", "demonName1", "demonName2", "demonName3", "demonName4", "demonName5", "demonName6", "demonName7", "demonName8", "demonName9", "demonName10", "demonName11", "demonName12", "demonName13", "dinseyGatorStenchDamage", "dinseyRollercoasterStats", "doctorBagQuestItem", "dolphinItem", "duckAreasCleared", "duckAreasSelected", "edPiece", "enamorangMonsterTurn", "ensorcelee", "EVEDirections", "extraCosmeticModifiers", "familiarScript", "forbiddenStores", "gameProBossSpecialPower", "gooseReprocessed", "grimoireSkillsHardcore", "grimoireSkillsSoftcore", "grimstoneMaskPath", "guzzlrQuestClient", "guzzlrQuestBooze", "guzzlrQuestTier", "harvestGardenHardcore", "harvestGardenSoftcore", "hpAutoRecoveryItems", "invalidBuffMessage", "jickSwordModifier", "juneCleaverQueue", "kingLiberatedScript", "lassoTraining", "lastAdventure", "lastBangPotion819", "lastBangPotion820", "lastBangPotion821", "lastBangPotion822", "lastBangPotion823", "lastBangPotion824", "lastBangPotion825", "lastBangPotion826", "lastBangPotion827", "lastChanceBurn", "lastChessboard", "lastCombatEnvironments", "lastDwarfDiceRolls", "lastDwarfDigitRunes", "lastDwarfEquipmentRunes", "lastDwarfFactoryItem118", "lastDwarfFactoryItem119", "lastDwarfFactoryItem120", "lastDwarfFactoryItem360", "lastDwarfFactoryItem361", "lastDwarfFactoryItem362", "lastDwarfFactoryItem363", "lastDwarfFactoryItem364", "lastDwarfFactoryItem365", "lastDwarfFactoryItem910", "lastDwarfFactoryItem3199", "lastDwarfOfficeItem3208", "lastDwarfOfficeItem3209", "lastDwarfOfficeItem3210", "lastDwarfOfficeItem3211", "lastDwarfOfficeItem3212", "lastDwarfOfficeItem3213", "lastDwarfOfficeItem3214", "lastDwarfOreRunes", "lastDwarfHopper1", "lastDwarfHopper2", "lastDwarfHopper3", "lastDwarfHopper4", "lastEncounter", "lastMacroError", "lastMessageId", "lastPaperStrip3144", "lastPaperStrip4138", "lastPaperStrip4139", "lastPaperStrip4140", "lastPaperStrip4141", "lastPaperStrip4142", "lastPaperStrip4143", "lastPaperStrip4144", "lastPirateEphemera", "lastPorkoBoard", "lastPorkoPayouts", "lastPorkoExpected", "lastSlimeVial3885", "lastSlimeVial3886", "lastSlimeVial3887", "lastSlimeVial3888", "lastSlimeVial3889", "lastSlimeVial3890", "lastSlimeVial3891", "lastSlimeVial3892", "lastSlimeVial3893", "lastSlimeVial3894", "lastSlimeVial3895", "lastSlimeVial3896", "latteIngredients", "latteModifier", "latteUnlocks", "libramSkillsHardcore", "libramSkillsSoftcore", "louvreOverride", "lovePotion", "lttQuestName", "maximizerList", "maximizerMRUList", "mayoInMouth", "mayoMinderSetting", "merkinQuestPath", "mineLayout1", "mineLayout2", "mineLayout3", "mineLayout4", "mineLayout5", "mineLayout6", "mpAutoRecoveryItems", "muffinOnOrder", "nextAdventure", "nextDistillateMods", "nextQuantumFamiliarName", "nextQuantumFamiliarOwner", "nsChallenge2", "nsChallenge3", "nsChallenge4", "nsChallenge5", "nsTowerDoorKeysUsed", "oceanAction", "oceanDestination", "parkaMode", "pastaThrall1", "pastaThrall2", "pastaThrall3", "pastaThrall4", "pastaThrall5", "pastaThrall6", "pastaThrall7", "pastaThrall8", "peteMotorbikeTires", "peteMotorbikeGasTank", "peteMotorbikeHeadlight", "peteMotorbikeCowling", "peteMotorbikeMuffler", "peteMotorbikeSeat", "pieStuffing", "plantingDate", "plantingLength", "plantingScript", "plumberCostumeWorn", "pokefamBoosts", "postAscensionScript", "preAscensionScript", "retroCapeSuperhero", "retroCapeWashingInstructions", "questClumsinessGrove", "questDoctorBag", "questECoBucket", "questESlAudit", "questESlBacteria", "questESlCheeseburger", "questESlCocktail", "questESlDebt", "questESlFish", "questESlMushStash", "questESlSalt", "questESlSprinkles", "questESpEVE", "questESpJunglePun", "questESpGore", "questESpClipper", "questESpFakeMedium", "questESpSerum", "questESpSmokes", "questESpOutOfOrder", "questEStFishTrash", "questEStGiveMeFuel", "questEStNastyBears", "questEStSocialJusticeI", "questEStSocialJusticeII", "questEStSuperLuber", "questEStWorkWithFood", "questEStZippityDooDah", "questEUNewYou", "questF01Primordial", "questF02Hyboria", "questF03Future", "questF04Elves", "questF05Clancy", "questG01Meatcar", "questG02Whitecastle", "questG03Ego", "questG04Nemesis", "questG05Dark", "questG06Delivery", "questG07Myst", "questG08Moxie", "questG09Muscle", "questGlacierOfJerks", "questGuzzlr", "questI01Scapegoat", "questI02Beat", "questL02Larva", "questL03Rat", "questL04Bat", "questL05Goblin", "questL06Friar", "questL07Cyrptic", "questL08Trapper", "questL09Topping", "questL10Garbage", "questL11MacGuffin", "questL11Black", "questL11Business", "questL11Curses", "questL11Desert", "questL11Doctor", "questL11Manor", "questL11Palindome", "questL11Pyramid", "questL11Ron", "questL11Shen", "questL11Spare", "questL11Worship", "questL12War", "questL12HippyFrat", "questL13Final", "questL13Warehouse", "questLTTQuestByWire", "questM01Untinker", "questM02Artist", "questM03Bugbear", "questM05Toot", "questM06Gourd", "questM07Hammer", "questM08Baker", "questM09Rocks", "questM10Azazel", "questM11Postal", "questM12Pirate", "questM13Escape", "questM14Bounty", "questM15Lol", "questM16Temple", "questM17Babies", "questM18Swamp", "questM19Hippy", "questM20Necklace", "questM21Dance", "questM22Shirt", "questM23Meatsmith", "questM24Doc", "questM25Armorer", "questM26Oracle", "questMaelstromOfLovers", "questPAGhost", "questRufus", "questS01OldGuy", "questS02Monkees", "raveCombo1", "raveCombo2", "raveCombo3", "raveCombo4", "raveCombo5", "raveCombo6", "recoveryScript", "relayCounters", "royalty", "rufusDesiredArtifact", "rufusDesiredItems", "rufusQuestTarget", "rufusQuestType", "scriptMRUList", "seahorseName", "shadowLabyrinthGoal", "shadowRiftIngress", "shenQuestItem", "shrubGarland", "shrubGifts", "shrubLights", "shrubTopper", "sideDefeated", "sidequestArenaCompleted", "sidequestFarmCompleted", "sidequestJunkyardCompleted", "sidequestLighthouseCompleted", "sidequestNunsCompleted", "sidequestOrchardCompleted", "skateParkStatus", "snowsuit", "sourceTerminalChips", "sourceTerminalEducate1", "sourceTerminalEducate2", "sourceTerminalEnquiry", "sourceTerminalEducateKnown", "sourceTerminalEnhanceKnown", "sourceTerminalEnquiryKnown", "sourceTerminalExtrudeKnown", "spadingData", "spadingScript", "speakeasyName", "spelunkyStatus", "spelunkyUpgrades", "spookyravenRecipeUsed", "stationaryButton1", "stationaryButton2", "stationaryButton3", "stationaryButton4", "stationaryButton5", "streamCrossDefaultTarget", "sweetSynthesisBlacklist", "telescope1", "telescope2", "telescope3", "telescope4", "telescope5", "testudinalTeachings", "textColors", "thanksMessage", "tomeSkillsHardcore", "tomeSkillsSoftcore", "trackVoteMonster", "trainsetConfiguration", "trapperOre", "umbrellaState", "umdLastObtained", "vintnerWineEffect", "vintnerWineName", "vintnerWineType", "violetFogLayout", "volcanoMaze1", "volcanoMaze2", "volcanoMaze3", "volcanoMaze4", "volcanoMaze5", "walfordBucketItem", "warProgress", "watchedPreferences", "workteaClue", "yourFavoriteBird", "yourFavoriteBirdMods", "youRobotCPUUpgrades", "_bastilleBoosts", "_bastilleChoice1", "_bastilleChoice2", "_bastilleChoice3", "_bastilleCurrentStyles", "_bastilleEnemyCastle", "_bastilleEnemyName", "_bastilleLastBattleResults", "_bastilleLastEncounter", "_bastilleStats", "_beachHeadsUsed", "_beachLayout", "_beachMinutes", "_birdOfTheDay", "_birdOfTheDayMods", "_bittycar", "_campAwaySmileBuffSign", "_cloudTalkMessage", "_cloudTalkSmoker", "_coatOfPaintModifier", "_dailySpecial", "_deckCardsSeen", "_feastedFamiliars", "_floristPlantsUsed", "_frAreasUnlocked", "_frHoursLeft", "_frMonstersKilled", "_horsery", "_horseryCrazyMox", "_horseryCrazyMus", "_horseryCrazyMys", "_horseryCrazyName", "_horseryCurrentName", "_horseryDarkName", "_horseryNormalName", "_horseryPaleName", "_jickJarAvailable", "_jiggleCheesedMonsters", "_lastCombatStarted", "_lastPirateRealmIsland", "_locketMonstersFought", "_mummeryMods", "_mummeryUses", "_newYouQuestSkill", "_noHatModifier", "_pantogramModifier", "_pottedPowerPlant", "_questESp", "_questPartyFair", "_questPartyFairProgress", "_questPartyFairQuest", "_roboDrinks", "_roninStoragePulls", "_sotParcelReturned  false", "_spacegateAnimalLife", "_spacegateCoordinates", "_spacegateGear", "_spacegateHazards", "_spacegateIntelligentLife", "_spacegatePlanetName", "_spacegatePlantLife", "_stolenAccordions", "_tempRelayCounters", "_timeSpinnerFoodAvailable", "_unknownEasyBountyItem", "_unknownHardBountyItem", "_unknownSpecialBountyItem", "_untakenEasyBountyItem", "_untakenHardBountyItem", "_untakenSpecialBountyItem", "_userMods", "_villainLairColor", "_villainLairKey", "_voteLocal1", "_voteLocal2", "_voteLocal3", "_voteLocal4", "_voteMonster1", "_voteMonster2", "_voteModifier", "_VYKEACompanionType", "_VYKEACompanionRune", "_VYKEACompanionName"], numericOrStringProperties = ["statusEngineering", "statusGalley", "statusMedbay", "statusMorgue", "statusNavigation", "statusScienceLab", "statusSonar", "statusSpecialOps", "statusWasteProcessing", "choiceAdventure2", "choiceAdventure3", "choiceAdventure4", "choiceAdventure5", "choiceAdventure6", "choiceAdventure7", "choiceAdventure8", "choiceAdventure9", "choiceAdventure10", "choiceAdventure11", "choiceAdventure12", "choiceAdventure14", "choiceAdventure15", "choiceAdventure16", "choiceAdventure17", "choiceAdventure18", "choiceAdventure19", "choiceAdventure20", "choiceAdventure21", "choiceAdventure22", "choiceAdventure23", "choiceAdventure24", "choiceAdventure25", "choiceAdventure26", "choiceAdventure27", "choiceAdventure28", "choiceAdventure29", "choiceAdventure40", "choiceAdventure41", "choiceAdventure42", "choiceAdventure45", "choiceAdventure46", "choiceAdventure47", "choiceAdventure71", "choiceAdventure72", "choiceAdventure73", "choiceAdventure74", "choiceAdventure75", "choiceAdventure76", "choiceAdventure77", "choiceAdventure86", "choiceAdventure87", "choiceAdventure88", "choiceAdventure89", "choiceAdventure90", "choiceAdventure91", "choiceAdventure105", "choiceAdventure106", "choiceAdventure107", "choiceAdventure108", "choiceAdventure109", "choiceAdventure110", "choiceAdventure111", "choiceAdventure112", "choiceAdventure113", "choiceAdventure114", "choiceAdventure115", "choiceAdventure116", "choiceAdventure117", "choiceAdventure118", "choiceAdventure120", "choiceAdventure123", "choiceAdventure125", "choiceAdventure126", "choiceAdventure127", "choiceAdventure129", "choiceAdventure131", "choiceAdventure132", "choiceAdventure135", "choiceAdventure136", "choiceAdventure137", "choiceAdventure138", "choiceAdventure139", "choiceAdventure140", "choiceAdventure141", "choiceAdventure142", "choiceAdventure143", "choiceAdventure144", "choiceAdventure145", "choiceAdventure146", "choiceAdventure147", "choiceAdventure148", "choiceAdventure149", "choiceAdventure151", "choiceAdventure152", "choiceAdventure153", "choiceAdventure154", "choiceAdventure155", "choiceAdventure156", "choiceAdventure157", "choiceAdventure158", "choiceAdventure159", "choiceAdventure160", "choiceAdventure161", "choiceAdventure162", "choiceAdventure163", "choiceAdventure164", "choiceAdventure165", "choiceAdventure166", "choiceAdventure167", "choiceAdventure168", "choiceAdventure169", "choiceAdventure170", "choiceAdventure171", "choiceAdventure172", "choiceAdventure177", "choiceAdventure178", "choiceAdventure180", "choiceAdventure181", "choiceAdventure182", "choiceAdventure184", "choiceAdventure185", "choiceAdventure186", "choiceAdventure187", "choiceAdventure188", "choiceAdventure189", "choiceAdventure191", "choiceAdventure197", "choiceAdventure198", "choiceAdventure199", "choiceAdventure200", "choiceAdventure201", "choiceAdventure202", "choiceAdventure203", "choiceAdventure204", "choiceAdventure205", "choiceAdventure206", "choiceAdventure207", "choiceAdventure208", "choiceAdventure211", "choiceAdventure212", "choiceAdventure213", "choiceAdventure214", "choiceAdventure215", "choiceAdventure216", "choiceAdventure217", "choiceAdventure218", "choiceAdventure219", "choiceAdventure220", "choiceAdventure221", "choiceAdventure222", "choiceAdventure223", "choiceAdventure224", "choiceAdventure225", "choiceAdventure230", "choiceAdventure272", "choiceAdventure273", "choiceAdventure276", "choiceAdventure277", "choiceAdventure278", "choiceAdventure279", "choiceAdventure280", "choiceAdventure281", "choiceAdventure282", "choiceAdventure283", "choiceAdventure284", "choiceAdventure285", "choiceAdventure286", "choiceAdventure287", "choiceAdventure288", "choiceAdventure289", "choiceAdventure290", "choiceAdventure291", "choiceAdventure292", "choiceAdventure293", "choiceAdventure294", "choiceAdventure295", "choiceAdventure296", "choiceAdventure297", "choiceAdventure298", "choiceAdventure299", "choiceAdventure302", "choiceAdventure303", "choiceAdventure304", "choiceAdventure305", "choiceAdventure306", "choiceAdventure307", "choiceAdventure308", "choiceAdventure309", "choiceAdventure310", "choiceAdventure311", "choiceAdventure317", "choiceAdventure318", "choiceAdventure319", "choiceAdventure320", "choiceAdventure321", "choiceAdventure322", "choiceAdventure326", "choiceAdventure327", "choiceAdventure328", "choiceAdventure329", "choiceAdventure330", "choiceAdventure331", "choiceAdventure332", "choiceAdventure333", "choiceAdventure334", "choiceAdventure335", "choiceAdventure336", "choiceAdventure337", "choiceAdventure338", "choiceAdventure339", "choiceAdventure340", "choiceAdventure341", "choiceAdventure342", "choiceAdventure343", "choiceAdventure344", "choiceAdventure345", "choiceAdventure346", "choiceAdventure347", "choiceAdventure348", "choiceAdventure349", "choiceAdventure350", "choiceAdventure351", "choiceAdventure352", "choiceAdventure353", "choiceAdventure354", "choiceAdventure355", "choiceAdventure356", "choiceAdventure357", "choiceAdventure358", "choiceAdventure360", "choiceAdventure361", "choiceAdventure362", "choiceAdventure363", "choiceAdventure364", "choiceAdventure365", "choiceAdventure366", "choiceAdventure367", "choiceAdventure372", "choiceAdventure376", "choiceAdventure387", "choiceAdventure388", "choiceAdventure389", "choiceAdventure390", "choiceAdventure391", "choiceAdventure392", "choiceAdventure393", "choiceAdventure395", "choiceAdventure396", "choiceAdventure397", "choiceAdventure398", "choiceAdventure399", "choiceAdventure400", "choiceAdventure401", "choiceAdventure402", "choiceAdventure403", "choiceAdventure423", "choiceAdventure424", "choiceAdventure425", "choiceAdventure426", "choiceAdventure427", "choiceAdventure428", "choiceAdventure429", "choiceAdventure430", "choiceAdventure431", "choiceAdventure432", "choiceAdventure433", "choiceAdventure435", "choiceAdventure438", "choiceAdventure439", "choiceAdventure442", "choiceAdventure444", "choiceAdventure445", "choiceAdventure446", "choiceAdventure447", "choiceAdventure448", "choiceAdventure449", "choiceAdventure451", "choiceAdventure452", "choiceAdventure453", "choiceAdventure454", "choiceAdventure455", "choiceAdventure456", "choiceAdventure457", "choiceAdventure458", "choiceAdventure460", "choiceAdventure461", "choiceAdventure462", "choiceAdventure463", "choiceAdventure464", "choiceAdventure465", "choiceAdventure467", "choiceAdventure468", "choiceAdventure469", "choiceAdventure470", "choiceAdventure471", "choiceAdventure472", "choiceAdventure473", "choiceAdventure474", "choiceAdventure475", "choiceAdventure477", "choiceAdventure478", "choiceAdventure480", "choiceAdventure483", "choiceAdventure484", "choiceAdventure485", "choiceAdventure486", "choiceAdventure488", "choiceAdventure489", "choiceAdventure490", "choiceAdventure491", "choiceAdventure496", "choiceAdventure497", "choiceAdventure502", "choiceAdventure503", "choiceAdventure504", "choiceAdventure505", "choiceAdventure506", "choiceAdventure507", "choiceAdventure509", "choiceAdventure510", "choiceAdventure511", "choiceAdventure512", "choiceAdventure513", "choiceAdventure514", "choiceAdventure515", "choiceAdventure517", "choiceAdventure518", "choiceAdventure519", "choiceAdventure521", "choiceAdventure522", "choiceAdventure523", "choiceAdventure527", "choiceAdventure528", "choiceAdventure529", "choiceAdventure530", "choiceAdventure531", "choiceAdventure532", "choiceAdventure533", "choiceAdventure534", "choiceAdventure535", "choiceAdventure536", "choiceAdventure538", "choiceAdventure539", "choiceAdventure542", "choiceAdventure543", "choiceAdventure544", "choiceAdventure546", "choiceAdventure548", "choiceAdventure549", "choiceAdventure550", "choiceAdventure551", "choiceAdventure552", "choiceAdventure553", "choiceAdventure554", "choiceAdventure556", "choiceAdventure557", "choiceAdventure558", "choiceAdventure559", "choiceAdventure560", "choiceAdventure561", "choiceAdventure562", "choiceAdventure563", "choiceAdventure564", "choiceAdventure565", "choiceAdventure566", "choiceAdventure567", "choiceAdventure568", "choiceAdventure569", "choiceAdventure571", "choiceAdventure572", "choiceAdventure573", "choiceAdventure574", "choiceAdventure575", "choiceAdventure576", "choiceAdventure577", "choiceAdventure578", "choiceAdventure579", "choiceAdventure581", "choiceAdventure582", "choiceAdventure583", "choiceAdventure584", "choiceAdventure594", "choiceAdventure595", "choiceAdventure596", "choiceAdventure597", "choiceAdventure598", "choiceAdventure599", "choiceAdventure600", "choiceAdventure603", "choiceAdventure604", "choiceAdventure616", "choiceAdventure634", "choiceAdventure640", "choiceAdventure654", "choiceAdventure655", "choiceAdventure656", "choiceAdventure657", "choiceAdventure658", "choiceAdventure664", "choiceAdventure669", "choiceAdventure670", "choiceAdventure671", "choiceAdventure672", "choiceAdventure673", "choiceAdventure674", "choiceAdventure675", "choiceAdventure676", "choiceAdventure677", "choiceAdventure678", "choiceAdventure679", "choiceAdventure681", "choiceAdventure683", "choiceAdventure684", "choiceAdventure685", "choiceAdventure686", "choiceAdventure687", "choiceAdventure688", "choiceAdventure689", "choiceAdventure690", "choiceAdventure691", "choiceAdventure692", "choiceAdventure693", "choiceAdventure694", "choiceAdventure695", "choiceAdventure696", "choiceAdventure697", "choiceAdventure698", "choiceAdventure700", "choiceAdventure701", "choiceAdventure705", "choiceAdventure706", "choiceAdventure707", "choiceAdventure708", "choiceAdventure709", "choiceAdventure710", "choiceAdventure711", "choiceAdventure712", "choiceAdventure713", "choiceAdventure714", "choiceAdventure715", "choiceAdventure716", "choiceAdventure717", "choiceAdventure721", "choiceAdventure725", "choiceAdventure729", "choiceAdventure733", "choiceAdventure737", "choiceAdventure741", "choiceAdventure745", "choiceAdventure749", "choiceAdventure753", "choiceAdventure771", "choiceAdventure778", "choiceAdventure780", "choiceAdventure781", "choiceAdventure783", "choiceAdventure784", "choiceAdventure785", "choiceAdventure786", "choiceAdventure787", "choiceAdventure788", "choiceAdventure789", "choiceAdventure791", "choiceAdventure793", "choiceAdventure794", "choiceAdventure795", "choiceAdventure796", "choiceAdventure797", "choiceAdventure803", "choiceAdventure805", "choiceAdventure808", "choiceAdventure809", "choiceAdventure813", "choiceAdventure815", "choiceAdventure830", "choiceAdventure832", "choiceAdventure833", "choiceAdventure834", "choiceAdventure835", "choiceAdventure837", "choiceAdventure838", "choiceAdventure839", "choiceAdventure840", "choiceAdventure841", "choiceAdventure842", "choiceAdventure851", "choiceAdventure852", "choiceAdventure853", "choiceAdventure854", "choiceAdventure855", "choiceAdventure856", "choiceAdventure857", "choiceAdventure858", "choiceAdventure866", "choiceAdventure873", "choiceAdventure875", "choiceAdventure876", "choiceAdventure877", "choiceAdventure878", "choiceAdventure879", "choiceAdventure880", "choiceAdventure881", "choiceAdventure882", "choiceAdventure888", "choiceAdventure889", "choiceAdventure918", "choiceAdventure919", "choiceAdventure920", "choiceAdventure921", "choiceAdventure923", "choiceAdventure924", "choiceAdventure925", "choiceAdventure926", "choiceAdventure927", "choiceAdventure928", "choiceAdventure929", "choiceAdventure930", "choiceAdventure931", "choiceAdventure932", "choiceAdventure940", "choiceAdventure941", "choiceAdventure942", "choiceAdventure943", "choiceAdventure944", "choiceAdventure945", "choiceAdventure946", "choiceAdventure950", "choiceAdventure955", "choiceAdventure957", "choiceAdventure958", "choiceAdventure959", "choiceAdventure960", "choiceAdventure961", "choiceAdventure962", "choiceAdventure963", "choiceAdventure964", "choiceAdventure965", "choiceAdventure966", "choiceAdventure970", "choiceAdventure973", "choiceAdventure974", "choiceAdventure975", "choiceAdventure976", "choiceAdventure977", "choiceAdventure979", "choiceAdventure980", "choiceAdventure981", "choiceAdventure982", "choiceAdventure983", "choiceAdventure988", "choiceAdventure989", "choiceAdventure993", "choiceAdventure998", "choiceAdventure1000", "choiceAdventure1003", "choiceAdventure1005", "choiceAdventure1006", "choiceAdventure1007", "choiceAdventure1008", "choiceAdventure1009", "choiceAdventure1010", "choiceAdventure1011", "choiceAdventure1012", "choiceAdventure1013", "choiceAdventure1015", "choiceAdventure1016", "choiceAdventure1017", "choiceAdventure1018", "choiceAdventure1019", "choiceAdventure1020", "choiceAdventure1021", "choiceAdventure1022", "choiceAdventure1023", "choiceAdventure1026", "choiceAdventure1027", "choiceAdventure1028", "choiceAdventure1029", "choiceAdventure1030", "choiceAdventure1031", "choiceAdventure1032", "choiceAdventure1033", "choiceAdventure1034", "choiceAdventure1035", "choiceAdventure1036", "choiceAdventure1037", "choiceAdventure1038", "choiceAdventure1039", "choiceAdventure1040", "choiceAdventure1041", "choiceAdventure1042", "choiceAdventure1044", "choiceAdventure1045", "choiceAdventure1046", "choiceAdventure1048", "choiceAdventure1051", "choiceAdventure1052", "choiceAdventure1053", "choiceAdventure1054", "choiceAdventure1055", "choiceAdventure1056", "choiceAdventure1057", "choiceAdventure1059", "choiceAdventure1060", "choiceAdventure1061", "choiceAdventure1062", "choiceAdventure1065", "choiceAdventure1067", "choiceAdventure1068", "choiceAdventure1069", "choiceAdventure1070", "choiceAdventure1071", "choiceAdventure1073", "choiceAdventure1077", "choiceAdventure1080", "choiceAdventure1081", "choiceAdventure1082", "choiceAdventure1083", "choiceAdventure1084", "choiceAdventure1085", "choiceAdventure1091", "choiceAdventure1094", "choiceAdventure1095", "choiceAdventure1096", "choiceAdventure1097", "choiceAdventure1102", "choiceAdventure1106", "choiceAdventure1107", "choiceAdventure1108", "choiceAdventure1110", "choiceAdventure1114", "choiceAdventure1115", "choiceAdventure1116", "choiceAdventure1118", "choiceAdventure1119", "choiceAdventure1120", "choiceAdventure1121", "choiceAdventure1122", "choiceAdventure1123", "choiceAdventure1171", "choiceAdventure1172", "choiceAdventure1173", "choiceAdventure1174", "choiceAdventure1175", "choiceAdventure1193", "choiceAdventure1195", "choiceAdventure1196", "choiceAdventure1197", "choiceAdventure1198", "choiceAdventure1199", "choiceAdventure1202", "choiceAdventure1203", "choiceAdventure1204", "choiceAdventure1205", "choiceAdventure1206", "choiceAdventure1207", "choiceAdventure1208", "choiceAdventure1209", "choiceAdventure1210", "choiceAdventure1211", "choiceAdventure1212", "choiceAdventure1213", "choiceAdventure1214", "choiceAdventure1215", "choiceAdventure1219", "choiceAdventure1222", "choiceAdventure1223", "choiceAdventure1224", "choiceAdventure1225", "choiceAdventure1226", "choiceAdventure1227", "choiceAdventure1228", "choiceAdventure1229", "choiceAdventure1236", "choiceAdventure1237", "choiceAdventure1238", "choiceAdventure1239", "choiceAdventure1240", "choiceAdventure1241", "choiceAdventure1242", "choiceAdventure1243", "choiceAdventure1244", "choiceAdventure1245", "choiceAdventure1246", "choiceAdventure1247", "choiceAdventure1248", "choiceAdventure1249", "choiceAdventure1250", "choiceAdventure1251", "choiceAdventure1252", "choiceAdventure1253", "choiceAdventure1254", "choiceAdventure1255", "choiceAdventure1256", "choiceAdventure1266", "choiceAdventure1280", "choiceAdventure1281", "choiceAdventure1282", "choiceAdventure1283", "choiceAdventure1284", "choiceAdventure1285", "choiceAdventure1286", "choiceAdventure1287", "choiceAdventure1288", "choiceAdventure1289", "choiceAdventure1290", "choiceAdventure1291", "choiceAdventure1292", "choiceAdventure1293", "choiceAdventure1294", "choiceAdventure1295", "choiceAdventure1296", "choiceAdventure1297", "choiceAdventure1298", "choiceAdventure1299", "choiceAdventure1300", "choiceAdventure1301", "choiceAdventure1302", "choiceAdventure1303", "choiceAdventure1304", "choiceAdventure1305", "choiceAdventure1307", "choiceAdventure1310", "choiceAdventure1312", "choiceAdventure1313", "choiceAdventure1314", "choiceAdventure1315", "choiceAdventure1316", "choiceAdventure1317", "choiceAdventure1318", "choiceAdventure1319", "choiceAdventure1321", "choiceAdventure1322", "choiceAdventure1323", "choiceAdventure1324", "choiceAdventure1325", "choiceAdventure1326", "choiceAdventure1327", "choiceAdventure1328", "choiceAdventure1332", "choiceAdventure1333", "choiceAdventure1335", "choiceAdventure1340", "choiceAdventure1341", "choiceAdventure1345", "choiceAdventure1389", "choiceAdventure1392", "choiceAdventure1397", "choiceAdventure1399", "choiceAdventure1405", "choiceAdventure1411", "choiceAdventure1415", "choiceAdventure1427", "choiceAdventure1428", "choiceAdventure1429", "choiceAdventure1430", "choiceAdventure1431", "choiceAdventure1432", "choiceAdventure1433", "choiceAdventure1434", "choiceAdventure1436", "choiceAdventure1460", "choiceAdventure1461", "choiceAdventure1467", "choiceAdventure1468", "choiceAdventure1469", "choiceAdventure1470", "choiceAdventure1471", "choiceAdventure1472", "choiceAdventure1473", "choiceAdventure1474", "choiceAdventure1475", "choiceAdventure1486", "choiceAdventure1487", "choiceAdventure1488", "choiceAdventure1489", "choiceAdventure1491", "choiceAdventure1494"], familiarProperties = ["commaFamiliar", "nextQuantumFamiliar", "stillsuitFamiliar"], statProperties = ["nsChallenge1", "snojoSetting"], phylumProperties = ["dnaSyringe", "locketPhylum", "redSnapperPhylum"];

// node_modules/libram/dist/propertyTyping.js
var booleanPropertiesSet = new Set(booleanProperties), numericPropertiesSet = new Set(numericProperties), numericOrStringPropertiesSet = new Set(numericOrStringProperties), stringPropertiesSet = new Set(stringProperties), locationPropertiesSet = new Set(locationProperties), monsterPropertiesSet = new Set(monsterProperties), familiarPropertiesSet = new Set(familiarProperties), statPropertiesSet = new Set(statProperties), phylumPropertiesSet = new Set(phylumProperties);
function isBooleanProperty(property) {
  return booleanPropertiesSet.has(property);
}
function isNumericProperty(property) {
  return numericPropertiesSet.has(property);
}
function isNumericOrStringProperty(property) {
  return numericOrStringPropertiesSet.has(property);
}
function isStringProperty(property) {
  return stringPropertiesSet.has(property);
}

// src/api/property.ts
function _regeneratorRuntime() {
  "use strict";
  _regeneratorRuntime = function() {
    return e;
  };
  var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function(t2, e2, r2) {
    t2[e2] = r2.value;
  }, i = typeof Symbol == "function" ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag";
  function define(t2, e2, r2) {
    return Object.defineProperty(t2, e2, { value: r2, enumerable: !0, configurable: !0, writable: !0 }), t2[e2];
  }
  try {
    define({}, "");
  } catch {
    define = function(t3, e2, r2) {
      return t3[e2] = r2;
    };
  }
  function wrap(t2, e2, r2, n2) {
    var i2 = e2 && e2.prototype instanceof Generator ? e2 : Generator, a2 = Object.create(i2.prototype), c2 = new Context(n2 || []);
    return o(a2, "_invoke", { value: makeInvokeMethod(t2, r2, c2) }), a2;
  }
  function tryCatch(t2, e2, r2) {
    try {
      return { type: "normal", arg: t2.call(e2, r2) };
    } catch (t3) {
      return { type: "throw", arg: t3 };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  var p = {};
  define(p, a, function() {
    return this;
  });
  var d = Object.getPrototypeOf, v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t2) {
    ["next", "throw", "return"].forEach(function(e2) {
      define(t2, e2, function(t3) {
        return this._invoke(e2, t3);
      });
    });
  }
  function AsyncIterator(t2, e2) {
    function invoke(r3, o2, i2, a2) {
      var c2 = tryCatch(t2[r3], t2, o2);
      if (c2.type !== "throw") {
        var u2 = c2.arg, h2 = u2.value;
        return h2 && typeof h2 == "object" && n.call(h2, "__await") ? e2.resolve(h2.__await).then(function(t3) {
          invoke("next", t3, i2, a2);
        }, function(t3) {
          invoke("throw", t3, i2, a2);
        }) : e2.resolve(h2).then(function(t3) {
          u2.value = t3, i2(u2);
        }, function(t3) {
          return invoke("throw", t3, i2, a2);
        });
      }
      a2(c2.arg);
    }
    var r2;
    o(this, "_invoke", { value: function(t3, n2) {
      function callInvokeWithMethodAndArg() {
        return new e2(function(e3, r3) {
          invoke(t3, n2, e3, r3);
        });
      }
      return r2 = r2 ? r2.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } });
  }
  function makeInvokeMethod(e2, r2, n2) {
    var o2 = h;
    return function(i2, a2) {
      if (o2 === f)
        throw new Error("Generator is already running");
      if (o2 === s) {
        if (i2 === "throw")
          throw a2;
        return { value: t, done: !0 };
      }
      for (n2.method = i2, n2.arg = a2; ; ) {
        var c2 = n2.delegate;
        if (c2) {
          var u2 = maybeInvokeDelegate(c2, n2);
          if (u2) {
            if (u2 === y)
              continue;
            return u2;
          }
        }
        if (n2.method === "next")
          n2.sent = n2._sent = n2.arg;
        else if (n2.method === "throw") {
          if (o2 === h)
            throw o2 = s, n2.arg;
          n2.dispatchException(n2.arg);
        } else
          n2.method === "return" && n2.abrupt("return", n2.arg);
        o2 = f;
        var p2 = tryCatch(e2, r2, n2);
        if (p2.type === "normal") {
          if (o2 = n2.done ? s : l, p2.arg === y)
            continue;
          return { value: p2.arg, done: n2.done };
        }
        p2.type === "throw" && (o2 = s, n2.method = "throw", n2.arg = p2.arg);
      }
    };
  }
  function maybeInvokeDelegate(e2, r2) {
    var n2 = r2.method, o2 = e2.iterator[n2];
    if (o2 === t)
      return r2.delegate = null, n2 === "throw" && e2.iterator.return && (r2.method = "return", r2.arg = t, maybeInvokeDelegate(e2, r2), r2.method === "throw") || n2 !== "return" && (r2.method = "throw", r2.arg = new TypeError("The iterator does not provide a '" + n2 + "' method")), y;
    var i2 = tryCatch(o2, e2.iterator, r2.arg);
    if (i2.type === "throw")
      return r2.method = "throw", r2.arg = i2.arg, r2.delegate = null, y;
    var a2 = i2.arg;
    return a2 ? a2.done ? (r2[e2.resultName] = a2.value, r2.next = e2.nextLoc, r2.method !== "return" && (r2.method = "next", r2.arg = t), r2.delegate = null, y) : a2 : (r2.method = "throw", r2.arg = new TypeError("iterator result is not an object"), r2.delegate = null, y);
  }
  function pushTryEntry(t2) {
    var e2 = { tryLoc: t2[0] };
    1 in t2 && (e2.catchLoc = t2[1]), 2 in t2 && (e2.finallyLoc = t2[2], e2.afterLoc = t2[3]), this.tryEntries.push(e2);
  }
  function resetTryEntry(t2) {
    var e2 = t2.completion || {};
    e2.type = "normal", delete e2.arg, t2.completion = e2;
  }
  function Context(t2) {
    this.tryEntries = [{ tryLoc: "root" }], t2.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e2) {
    if (e2 || e2 === "") {
      var r2 = e2[a];
      if (r2)
        return r2.call(e2);
      if (typeof e2.next == "function")
        return e2;
      if (!isNaN(e2.length)) {
        var o2 = -1, i2 = function next() {
          for (; ++o2 < e2.length; )
            if (n.call(e2, o2))
              return next.value = e2[o2], next.done = !1, next;
          return next.value = t, next.done = !0, next;
        };
        return i2.next = i2;
      }
    }
    throw new TypeError(typeof e2 + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function(t2) {
    var e2 = typeof t2 == "function" && t2.constructor;
    return !!e2 && (e2 === GeneratorFunction || (e2.displayName || e2.name) === "GeneratorFunction");
  }, e.mark = function(t2) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t2, GeneratorFunctionPrototype) : (t2.__proto__ = GeneratorFunctionPrototype, define(t2, u, "GeneratorFunction")), t2.prototype = Object.create(g), t2;
  }, e.awrap = function(t2) {
    return { __await: t2 };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function() {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function(t2, r2, n2, o2, i2) {
    i2 === void 0 && (i2 = Promise);
    var a2 = new AsyncIterator(wrap(t2, r2, n2, o2), i2);
    return e.isGeneratorFunction(r2) ? a2 : a2.next().then(function(t3) {
      return t3.done ? t3.value : a2.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function() {
    return this;
  }), define(g, "toString", function() {
    return "[object Generator]";
  }), e.keys = function(t2) {
    var e2 = Object(t2), r2 = [];
    for (var n2 in e2)
      r2.push(n2);
    return r2.reverse(), function next() {
      for (; r2.length; ) {
        var t3 = r2.pop();
        if (t3 in e2)
          return next.value = t3, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = { constructor: Context, reset: function(e2) {
    if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e2)
      for (var r2 in this)
        r2.charAt(0) === "t" && n.call(this, r2) && !isNaN(+r2.slice(1)) && (this[r2] = t);
  }, stop: function() {
    this.done = !0;
    var t2 = this.tryEntries[0].completion;
    if (t2.type === "throw")
      throw t2.arg;
    return this.rval;
  }, dispatchException: function(e2) {
    if (this.done)
      throw e2;
    var r2 = this;
    function handle(n2, o3) {
      return a2.type = "throw", a2.arg = e2, r2.next = n2, o3 && (r2.method = "next", r2.arg = t), !!o3;
    }
    for (var o2 = this.tryEntries.length - 1; o2 >= 0; --o2) {
      var i2 = this.tryEntries[o2], a2 = i2.completion;
      if (i2.tryLoc === "root")
        return handle("end");
      if (i2.tryLoc <= this.prev) {
        var c2 = n.call(i2, "catchLoc"), u2 = n.call(i2, "finallyLoc");
        if (c2 && u2) {
          if (this.prev < i2.catchLoc)
            return handle(i2.catchLoc, !0);
          if (this.prev < i2.finallyLoc)
            return handle(i2.finallyLoc);
        } else if (c2) {
          if (this.prev < i2.catchLoc)
            return handle(i2.catchLoc, !0);
        } else {
          if (!u2)
            throw new Error("try statement without catch or finally");
          if (this.prev < i2.finallyLoc)
            return handle(i2.finallyLoc);
        }
      }
    }
  }, abrupt: function(t2, e2) {
    for (var r2 = this.tryEntries.length - 1; r2 >= 0; --r2) {
      var o2 = this.tryEntries[r2];
      if (o2.tryLoc <= this.prev && n.call(o2, "finallyLoc") && this.prev < o2.finallyLoc) {
        var i2 = o2;
        break;
      }
    }
    i2 && (t2 === "break" || t2 === "continue") && i2.tryLoc <= e2 && e2 <= i2.finallyLoc && (i2 = null);
    var a2 = i2 ? i2.completion : {};
    return a2.type = t2, a2.arg = e2, i2 ? (this.method = "next", this.next = i2.finallyLoc, y) : this.complete(a2);
  }, complete: function(t2, e2) {
    if (t2.type === "throw")
      throw t2.arg;
    return t2.type === "break" || t2.type === "continue" ? this.next = t2.arg : t2.type === "return" ? (this.rval = this.arg = t2.arg, this.method = "return", this.next = "end") : t2.type === "normal" && e2 && (this.next = e2), y;
  }, finish: function(t2) {
    for (var e2 = this.tryEntries.length - 1; e2 >= 0; --e2) {
      var r2 = this.tryEntries[e2];
      if (r2.finallyLoc === t2)
        return this.complete(r2.completion, r2.afterLoc), resetTryEntry(r2), y;
    }
  }, catch: function(t2) {
    for (var e2 = this.tryEntries.length - 1; e2 >= 0; --e2) {
      var r2 = this.tryEntries[e2];
      if (r2.tryLoc === t2) {
        var n2 = r2.completion;
        if (n2.type === "throw") {
          var o2 = n2.arg;
          resetTryEntry(r2);
        }
        return o2;
      }
    }
    throw new Error("illegal catch attempt");
  }, delegateYield: function(e2, r2, n2) {
    return this.delegate = { iterator: values(e2), resultName: r2, nextLoc: n2 }, this.method === "next" && (this.arg = t), y;
  } }, e;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray2(arr, i) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _unsupportedIterableToArray2(o, minLen) {
  if (o) {
    if (typeof o == "string")
      return _arrayLikeToArray2(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor && (n = o.constructor.name), n === "Map" || n === "Set")
      return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray2(o, minLen);
  }
}
function _arrayLikeToArray2(arr, len) {
  (len == null || len > arr.length) && (len = arr.length);
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit(r, l) {
  var t = r == null ? null : typeof Symbol < "u" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e, n, i, u, a = [], f = !0, o = !1;
    try {
      if (i = (t = t.call(r)).next, l === 0) {
        if (Object(t) !== t)
          return;
        f = !1;
      } else
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0)
          ;
    } catch (r2) {
      o = !0, n = r2;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u))
          return;
      } finally {
        if (o)
          throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr))
    return arr;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg), value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
}
function _asyncToGenerator(fn) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
function getPropertiesRaw(_x) {
  return _getPropertiesRaw.apply(this, arguments);
}
function _getPropertiesRaw() {
  return _getPropertiesRaw = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee(properties) {
    var _response$properties, response, propertyValues;
    return _regeneratorRuntime().wrap(function(_context) {
      for (; ; )
        switch (_context.prev = _context.next) {
          case 0:
            return _context.next = 2, apiCall({
              properties
            });
          case 2:
            return response = _context.sent, propertyValues = (_response$properties = response.properties) !== null && _response$properties !== void 0 ? _response$properties : {}, _context.abrupt("return", Object.fromEntries(properties.map((name) => [name, propertyValues[name]])));
          case 5:
          case "end":
            return _context.stop();
        }
    }, _callee);
  })), _getPropertiesRaw.apply(this, arguments);
}
function batchProperties(propertyDefaults) {
  var allProperties = propertyDefaults.map((_ref) => {
    var _ref2 = _slicedToArray(_ref, 1), name = _ref2[0];
    return name;
  });
  return getPropertiesRaw(allProperties).then((propertyValues) => propertyDefaults.map((_ref3) => {
    var _ref4 = _slicedToArray(_ref3, 2), name = _ref4[0], default_ = _ref4[1], value = propertyValues[name];
    return value === "" ? default_ : typeof default_ == "boolean" && typeof value != "boolean" ? value === "true" : typeof default_ == "number" && typeof value == "string" ? parseInt(value) : value;
  }));
}
function defineDefault(property, default_) {
  return default_ === void 0 && (isBooleanProperty(property) ? default_ = !1 : isNumericProperty(property) ? default_ = 0 : isStringProperty(property) || isNumericOrStringProperty(property) ? default_ = "" : default_ = null), default_;
}

// src/contexts/RefreshContext.tsx
var import_react = __toESM(require_react());

// src/kolmafia/remote.ts
var import_setimmediate2 = require("setimmediate"), import_dataloader2 = __toESM(require_dataloader());

// src/makeValue.ts
function _defineProperty(obj, key, value) {
  return key = _toPropertyKey(key), key in obj ? Object.defineProperty(obj, key, { value, enumerable: !0, configurable: !0, writable: !0 }) : obj[key] = value, obj;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key == "symbol" ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (typeof input != "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res != "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var placeholderTypes = {
  Bounty: "bounties",
  Class: "classes",
  Coinmaster: "coinmasters",
  Effect: "effects",
  Element: "elements",
  Familiar: "familiars",
  Item: "items",
  Location: "locations",
  Modifier: "modifiers",
  Monster: "monsters",
  Path: "paths",
  Phylum: "phyla",
  Servant: "servants",
  Skill: "skills",
  Slot: "slot",
  Stat: "stat",
  Thrall: "thralls",
  Vykea: "vykea"
};
function makePlaceholder(objectType, identifier) {
  return _defineProperty({
    objectType
  }, typeof identifier == "number" ? "identifierNumber" : "identifierString", identifier);
}
function placeholderIdentifier(placeholder) {
  return "identifierString" in placeholder ? placeholder.identifierString : placeholder.identifierNumber;
}

// src/kolmafia/types.ts
var _class2, _class3, _class4, _class5, _class6, _class7, _class8, _class9, _class10, _class11, _class12, _class13, _class14, _class15, _class16, _class17, _class18, _class19;
function _inherits(subClass, superClass) {
  if (typeof superClass != "function" && superClass !== null)
    throw new TypeError("Super expression must either be null or a function");
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: !0, configurable: !0 } }), Object.defineProperty(subClass, "prototype", { writable: !1 }), superClass && _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(o2, p2) {
    return o2.__proto__ = p2, o2;
  }, _setPrototypeOf(o, p);
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else
      result = Super.apply(this, arguments);
    return _possibleConstructorReturn(this, result);
  };
}
function _possibleConstructorReturn(self, call2) {
  if (call2 && (typeof call2 == "object" || typeof call2 == "function"))
    return call2;
  if (call2 !== void 0)
    throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(self);
}
function _assertThisInitialized(self) {
  if (self === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return self;
}
function _isNativeReflectConstruct() {
  if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham)
    return !1;
  if (typeof Proxy == "function")
    return !0;
  try {
    return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    })), !0;
  } catch {
    return !1;
  }
}
function _getPrototypeOf(o) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  }, _getPrototypeOf(o);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function(r2) {
      _defineProperty2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor))
    throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, _toPropertyKey2(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  return protoProps && _defineProperties(Constructor.prototype, protoProps), staticProps && _defineProperties(Constructor, staticProps), Object.defineProperty(Constructor, "prototype", { writable: !1 }), Constructor;
}
function _defineProperty2(obj, key, value) {
  return key = _toPropertyKey2(key), key in obj ? Object.defineProperty(obj, key, { value, enumerable: !0, configurable: !0, writable: !0 }) : obj[key] = value, obj;
}
function _toPropertyKey2(arg) {
  var key = _toPrimitive2(arg, "string");
  return typeof key == "symbol" ? key : String(key);
}
function _toPrimitive2(input, hint) {
  if (typeof input != "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res != "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var MafiaClass = /* @__PURE__ */ function() {
  function MafiaClass2(values) {
    _classCallCheck(this, MafiaClass2), _defineProperty2(this, "objectType", void 0), _defineProperty2(this, "identifierString", void 0), _defineProperty2(this, "identifierNumber", void 0), this.objectType = values.objectType, this.identifierString = values.identifierString, this.identifierNumber = values.identifierNumber, this.replaceValues(values);
  }
  return _createClass(MafiaClass2, [{
    key: "replaceValues",
    value: function(values) {
      Object.assign(this, values);
    }
  }], [{
    key: "get",
    value: function(idOrArray) {
      var ids = Array.isArray(idOrArray) ? idOrArray : [idOrArray], results = ids.map((id) => {
        var placeholder = makePlaceholder(this.staticType, id), default_ = "identifierNumber" in placeholder ? _objectSpread(_objectSpread({}, placeholder), {}, {
          identifierString: "".concat(placeholder.identifierNumber)
        }) : _objectSpread(_objectSpread({}, placeholder), {}, {
          identifierNumber: -1
        });
        return remoteCall("identity", [placeholder], default_);
      });
      return Array.isArray(idOrArray) ? results : results[0];
    }
  }, {
    key: "all",
    value: function() {
      return [];
    }
  }]), MafiaClass2;
}();
_defineProperty2(MafiaClass, "staticType", void 0);
var Bounty = /* @__PURE__ */ function(_MafiaClass) {
  _inherits(Bounty2, _MafiaClass);
  var _super = _createSuper(Bounty2);
  function Bounty2() {
    var _this;
    _classCallCheck(this, Bounty2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)
      args[_key] = arguments[_key];
    return _this = _super.call.apply(_super, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this), "plural", void 0), _defineProperty2(_assertThisInitialized(_this), "type", void 0), _defineProperty2(_assertThisInitialized(_this), "kolInternalType", void 0), _defineProperty2(_assertThisInitialized(_this), "number", void 0), _defineProperty2(_assertThisInitialized(_this), "image", void 0), _defineProperty2(_assertThisInitialized(_this), "monster", void 0), _defineProperty2(_assertThisInitialized(_this), "location", void 0), _this;
  }
  return _createClass(Bounty2);
}(MafiaClass);
_class2 = Bounty;
_defineProperty2(Bounty, "staticType", "Bounty");
_defineProperty2(Bounty, "none", _class2.get("none"));
var Class = /* @__PURE__ */ function(_MafiaClass2) {
  _inherits(Class2, _MafiaClass2);
  var _super2 = _createSuper(Class2);
  function Class2() {
    var _this2;
    _classCallCheck(this, Class2);
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++)
      args[_key2] = arguments[_key2];
    return _this2 = _super2.call.apply(_super2, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this2), "id", void 0), _defineProperty2(_assertThisInitialized(_this2), "primestat", void 0), _defineProperty2(_assertThisInitialized(_this2), "path", void 0), _this2;
  }
  return _createClass(Class2);
}(MafiaClass);
_class3 = Class;
_defineProperty2(Class, "staticType", "Class");
_defineProperty2(Class, "none", _class3.get("none"));
var Coinmaster = /* @__PURE__ */ function(_MafiaClass3) {
  _inherits(Coinmaster2, _MafiaClass3);
  var _super3 = _createSuper(Coinmaster2);
  function Coinmaster2() {
    var _this3;
    _classCallCheck(this, Coinmaster2);
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++)
      args[_key3] = arguments[_key3];
    return _this3 = _super3.call.apply(_super3, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this3), "token", void 0), _defineProperty2(_assertThisInitialized(_this3), "item", void 0), _defineProperty2(_assertThisInitialized(_this3), "property", void 0), _defineProperty2(_assertThisInitialized(_this3), "availableTokens", void 0), _defineProperty2(_assertThisInitialized(_this3), "buys", void 0), _defineProperty2(_assertThisInitialized(_this3), "sells", void 0), _defineProperty2(_assertThisInitialized(_this3), "nickname", void 0), _this3;
  }
  return _createClass(Coinmaster2);
}(MafiaClass);
_class4 = Coinmaster;
_defineProperty2(Coinmaster, "staticType", "Coinmaster");
_defineProperty2(Coinmaster, "none", _class4.get("none"));
var Effect = /* @__PURE__ */ function(_MafiaClass4) {
  _inherits(Effect2, _MafiaClass4);
  var _super4 = _createSuper(Effect2);
  function Effect2() {
    var _this4;
    _classCallCheck(this, Effect2);
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++)
      args[_key4] = arguments[_key4];
    return _this4 = _super4.call.apply(_super4, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this4), "id", void 0), _defineProperty2(_assertThisInitialized(_this4), "name", void 0), _defineProperty2(_assertThisInitialized(_this4), "default", void 0), _defineProperty2(_assertThisInitialized(_this4), "note", void 0), _defineProperty2(_assertThisInitialized(_this4), "all", void 0), _defineProperty2(_assertThisInitialized(_this4), "image", void 0), _defineProperty2(_assertThisInitialized(_this4), "descid", void 0), _defineProperty2(_assertThisInitialized(_this4), "candyTier", void 0), _defineProperty2(_assertThisInitialized(_this4), "quality", void 0), _defineProperty2(_assertThisInitialized(_this4), "attributes", void 0), _defineProperty2(_assertThisInitialized(_this4), "song", void 0), _this4;
  }
  return _createClass(Effect2);
}(MafiaClass);
_class5 = Effect;
_defineProperty2(Effect, "staticType", "Effect");
_defineProperty2(Effect, "none", _class5.get("none"));
var Element = /* @__PURE__ */ function(_MafiaClass5) {
  _inherits(Element2, _MafiaClass5);
  var _super5 = _createSuper(Element2);
  function Element2() {
    var _this5;
    _classCallCheck(this, Element2);
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++)
      args[_key5] = arguments[_key5];
    return _this5 = _super5.call.apply(_super5, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this5), "image", void 0), _this5;
  }
  return _createClass(Element2);
}(MafiaClass);
_class6 = Element;
_defineProperty2(Element, "staticType", "Element");
_defineProperty2(Element, "none", _class6.get("none"));
var Familiar = /* @__PURE__ */ function(_MafiaClass6) {
  _inherits(Familiar2, _MafiaClass6);
  var _super6 = _createSuper(Familiar2);
  function Familiar2() {
    var _this6;
    _classCallCheck(this, Familiar2);
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++)
      args[_key6] = arguments[_key6];
    return _this6 = _super6.call.apply(_super6, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this6), "id", void 0), _defineProperty2(_assertThisInitialized(_this6), "hatchling", void 0), _defineProperty2(_assertThisInitialized(_this6), "image", void 0), _defineProperty2(_assertThisInitialized(_this6), "name", void 0), _defineProperty2(_assertThisInitialized(_this6), "owner", void 0), _defineProperty2(_assertThisInitialized(_this6), "ownerId", void 0), _defineProperty2(_assertThisInitialized(_this6), "experience", void 0), _defineProperty2(_assertThisInitialized(_this6), "charges", void 0), _defineProperty2(_assertThisInitialized(_this6), "dropName", void 0), _defineProperty2(_assertThisInitialized(_this6), "dropItem", void 0), _defineProperty2(_assertThisInitialized(_this6), "dropsToday", void 0), _defineProperty2(_assertThisInitialized(_this6), "dropsLimit", void 0), _defineProperty2(_assertThisInitialized(_this6), "fightsToday", void 0), _defineProperty2(_assertThisInitialized(_this6), "fightsLimit", void 0), _defineProperty2(_assertThisInitialized(_this6), "combat", void 0), _defineProperty2(_assertThisInitialized(_this6), "physicalDamage", void 0), _defineProperty2(_assertThisInitialized(_this6), "elementalDamage", void 0), _defineProperty2(_assertThisInitialized(_this6), "block", void 0), _defineProperty2(_assertThisInitialized(_this6), "delevel", void 0), _defineProperty2(_assertThisInitialized(_this6), "hpDuringCombat", void 0), _defineProperty2(_assertThisInitialized(_this6), "mpDuringCombat", void 0), _defineProperty2(_assertThisInitialized(_this6), "otherActionDuringCombat", void 0), _defineProperty2(_assertThisInitialized(_this6), "hpAfterCombat", void 0), _defineProperty2(_assertThisInitialized(_this6), "mpAfterCombat", void 0), _defineProperty2(_assertThisInitialized(_this6), "otherActionAfterCombat", void 0), _defineProperty2(_assertThisInitialized(_this6), "passive", void 0), _defineProperty2(_assertThisInitialized(_this6), "underwater", void 0), _defineProperty2(_assertThisInitialized(_this6), "variable", void 0), _defineProperty2(_assertThisInitialized(_this6), "feasted", void 0), _defineProperty2(_assertThisInitialized(_this6), "attributes", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeLevel", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeLevel2Power", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeLevel2Hp", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeLevel3Power", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeLevel3Hp", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeLevel4Power", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeLevel4Hp", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeMove1", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeMove2", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeMove3", void 0), _defineProperty2(_assertThisInitialized(_this6), "pokeAttribute", void 0), _this6;
  }
  return _createClass(Familiar2);
}(MafiaClass);
_class7 = Familiar;
_defineProperty2(Familiar, "staticType", "Familiar");
_defineProperty2(Familiar, "none", _class7.get("none"));
var Item = /* @__PURE__ */ function(_MafiaClass7) {
  _inherits(Item2, _MafiaClass7);
  var _super7 = _createSuper(Item2);
  function Item2() {
    var _this7;
    _classCallCheck(this, Item2);
    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++)
      args[_key7] = arguments[_key7];
    return _this7 = _super7.call.apply(_super7, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this7), "id", void 0), _defineProperty2(_assertThisInitialized(_this7), "name", void 0), _defineProperty2(_assertThisInitialized(_this7), "plural", void 0), _defineProperty2(_assertThisInitialized(_this7), "descid", void 0), _defineProperty2(_assertThisInitialized(_this7), "image", void 0), _defineProperty2(_assertThisInitialized(_this7), "smallimage", void 0), _defineProperty2(_assertThisInitialized(_this7), "levelreq", void 0), _defineProperty2(_assertThisInitialized(_this7), "quality", void 0), _defineProperty2(_assertThisInitialized(_this7), "adventures", void 0), _defineProperty2(_assertThisInitialized(_this7), "muscle", void 0), _defineProperty2(_assertThisInitialized(_this7), "mysticality", void 0), _defineProperty2(_assertThisInitialized(_this7), "moxie", void 0), _defineProperty2(_assertThisInitialized(_this7), "fullness", void 0), _defineProperty2(_assertThisInitialized(_this7), "inebriety", void 0), _defineProperty2(_assertThisInitialized(_this7), "spleen", void 0), _defineProperty2(_assertThisInitialized(_this7), "minhp", void 0), _defineProperty2(_assertThisInitialized(_this7), "maxhp", void 0), _defineProperty2(_assertThisInitialized(_this7), "minmp", void 0), _defineProperty2(_assertThisInitialized(_this7), "maxmp", void 0), _defineProperty2(_assertThisInitialized(_this7), "dailyusesleft", void 0), _defineProperty2(_assertThisInitialized(_this7), "notes", void 0), _defineProperty2(_assertThisInitialized(_this7), "quest", void 0), _defineProperty2(_assertThisInitialized(_this7), "gift", void 0), _defineProperty2(_assertThisInitialized(_this7), "tradeable", void 0), _defineProperty2(_assertThisInitialized(_this7), "discardable", void 0), _defineProperty2(_assertThisInitialized(_this7), "combat", void 0), _defineProperty2(_assertThisInitialized(_this7), "combatReusable", void 0), _defineProperty2(_assertThisInitialized(_this7), "usable", void 0), _defineProperty2(_assertThisInitialized(_this7), "reusable", void 0), _defineProperty2(_assertThisInitialized(_this7), "multi", void 0), _defineProperty2(_assertThisInitialized(_this7), "fancy", void 0), _defineProperty2(_assertThisInitialized(_this7), "pasteable", void 0), _defineProperty2(_assertThisInitialized(_this7), "smithable", void 0), _defineProperty2(_assertThisInitialized(_this7), "cookable", void 0), _defineProperty2(_assertThisInitialized(_this7), "mixable", void 0), _defineProperty2(_assertThisInitialized(_this7), "candy", void 0), _defineProperty2(_assertThisInitialized(_this7), "candyType", void 0), _defineProperty2(_assertThisInitialized(_this7), "chocolate", void 0), _defineProperty2(_assertThisInitialized(_this7), "potion", void 0), _defineProperty2(_assertThisInitialized(_this7), "seller", void 0), _defineProperty2(_assertThisInitialized(_this7), "buyer", void 0), _defineProperty2(_assertThisInitialized(_this7), "nameLength", void 0), _defineProperty2(_assertThisInitialized(_this7), "noobSkill", void 0), _defineProperty2(_assertThisInitialized(_this7), "tcrsName", void 0), _defineProperty2(_assertThisInitialized(_this7), "skill", void 0), _defineProperty2(_assertThisInitialized(_this7), "recipe", void 0), _this7;
  }
  return _createClass(Item2);
}(MafiaClass);
_class8 = Item;
_defineProperty2(Item, "staticType", "Item");
_defineProperty2(Item, "none", _class8.get("none"));
var Location = /* @__PURE__ */ function(_MafiaClass8) {
  _inherits(Location2, _MafiaClass8);
  var _super8 = _createSuper(Location2);
  function Location2() {
    var _this8;
    _classCallCheck(this, Location2);
    for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++)
      args[_key8] = arguments[_key8];
    return _this8 = _super8.call.apply(_super8, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this8), "id", void 0), _defineProperty2(_assertThisInitialized(_this8), "nocombats", void 0), _defineProperty2(_assertThisInitialized(_this8), "combatPercent", void 0), _defineProperty2(_assertThisInitialized(_this8), "zone", void 0), _defineProperty2(_assertThisInitialized(_this8), "parent", void 0), _defineProperty2(_assertThisInitialized(_this8), "parentdesc", void 0), _defineProperty2(_assertThisInitialized(_this8), "root", void 0), _defineProperty2(_assertThisInitialized(_this8), "difficultyLevel", void 0), _defineProperty2(_assertThisInitialized(_this8), "environment", void 0), _defineProperty2(_assertThisInitialized(_this8), "fireLevel", void 0), _defineProperty2(_assertThisInitialized(_this8), "bounty", void 0), _defineProperty2(_assertThisInitialized(_this8), "combatQueue", void 0), _defineProperty2(_assertThisInitialized(_this8), "noncombatQueue", void 0), _defineProperty2(_assertThisInitialized(_this8), "turnsSpent", void 0), _defineProperty2(_assertThisInitialized(_this8), "kisses", void 0), _defineProperty2(_assertThisInitialized(_this8), "recommendedStat", void 0), _defineProperty2(_assertThisInitialized(_this8), "poison", void 0), _defineProperty2(_assertThisInitialized(_this8), "waterLevel", void 0), _defineProperty2(_assertThisInitialized(_this8), "wanderers", void 0), _defineProperty2(_assertThisInitialized(_this8), "pledgeAllegiance", void 0), _this8;
  }
  return _createClass(Location2);
}(MafiaClass);
_class9 = Location;
_defineProperty2(Location, "staticType", "Location");
_defineProperty2(Location, "none", _class9.get("none"));
var Modifier = /* @__PURE__ */ function(_MafiaClass9) {
  _inherits(Modifier2, _MafiaClass9);
  var _super9 = _createSuper(Modifier2);
  function Modifier2() {
    var _this9;
    _classCallCheck(this, Modifier2);
    for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++)
      args[_key9] = arguments[_key9];
    return _this9 = _super9.call.apply(_super9, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this9), "name", void 0), _defineProperty2(_assertThisInitialized(_this9), "type", void 0), _this9;
  }
  return _createClass(Modifier2);
}(MafiaClass);
_class10 = Modifier;
_defineProperty2(Modifier, "staticType", "Modifier");
_defineProperty2(Modifier, "none", _class10.get("none"));
var Monster = /* @__PURE__ */ function(_MafiaClass10) {
  _inherits(Monster2, _MafiaClass10);
  var _super10 = _createSuper(Monster2);
  function Monster2() {
    var _this10;
    _classCallCheck(this, Monster2);
    for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++)
      args[_key10] = arguments[_key10];
    return _this10 = _super10.call.apply(_super10, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this10), "name", void 0), _defineProperty2(_assertThisInitialized(_this10), "article", void 0), _defineProperty2(_assertThisInitialized(_this10), "id", void 0), _defineProperty2(_assertThisInitialized(_this10), "baseHp", void 0), _defineProperty2(_assertThisInitialized(_this10), "baseAttack", void 0), _defineProperty2(_assertThisInitialized(_this10), "baseDefense", void 0), _defineProperty2(_assertThisInitialized(_this10), "rawHp", void 0), _defineProperty2(_assertThisInitialized(_this10), "rawAttack", void 0), _defineProperty2(_assertThisInitialized(_this10), "rawDefense", void 0), _defineProperty2(_assertThisInitialized(_this10), "baseInitiative", void 0), _defineProperty2(_assertThisInitialized(_this10), "rawInitiative", void 0), _defineProperty2(_assertThisInitialized(_this10), "attackElement", void 0), _defineProperty2(_assertThisInitialized(_this10), "attackElements", void 0), _defineProperty2(_assertThisInitialized(_this10), "defenseElement", void 0), _defineProperty2(_assertThisInitialized(_this10), "physicalResistance", void 0), _defineProperty2(_assertThisInitialized(_this10), "elementalResistance", void 0), _defineProperty2(_assertThisInitialized(_this10), "minMeat", void 0), _defineProperty2(_assertThisInitialized(_this10), "maxMeat", void 0), _defineProperty2(_assertThisInitialized(_this10), "minSprinkles", void 0), _defineProperty2(_assertThisInitialized(_this10), "maxSprinkles", void 0), _defineProperty2(_assertThisInitialized(_this10), "baseMainstatExp", void 0), _defineProperty2(_assertThisInitialized(_this10), "group", void 0), _defineProperty2(_assertThisInitialized(_this10), "phylum", void 0), _defineProperty2(_assertThisInitialized(_this10), "poison", void 0), _defineProperty2(_assertThisInitialized(_this10), "boss", void 0), _defineProperty2(_assertThisInitialized(_this10), "copyable", void 0), _defineProperty2(_assertThisInitialized(_this10), "image", void 0), _defineProperty2(_assertThisInitialized(_this10), "images", void 0), _defineProperty2(_assertThisInitialized(_this10), "subTypes", void 0), _defineProperty2(_assertThisInitialized(_this10), "randomModifiers", void 0), _defineProperty2(_assertThisInitialized(_this10), "manuelName", void 0), _defineProperty2(_assertThisInitialized(_this10), "wikiName", void 0), _defineProperty2(_assertThisInitialized(_this10), "attributes", void 0), _this10;
  }
  return _createClass(Monster2);
}(MafiaClass);
_class11 = Monster;
_defineProperty2(Monster, "staticType", "Monster");
_defineProperty2(Monster, "none", _class11.get("none"));
var Path = /* @__PURE__ */ function(_MafiaClass11) {
  _inherits(Path2, _MafiaClass11);
  var _super11 = _createSuper(Path2);
  function Path2() {
    var _this11;
    _classCallCheck(this, Path2);
    for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++)
      args[_key11] = arguments[_key11];
    return _this11 = _super11.call.apply(_super11, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this11), "id", void 0), _defineProperty2(_assertThisInitialized(_this11), "name", void 0), _defineProperty2(_assertThisInitialized(_this11), "avatar", void 0), _defineProperty2(_assertThisInitialized(_this11), "image", void 0), _defineProperty2(_assertThisInitialized(_this11), "points", void 0), _defineProperty2(_assertThisInitialized(_this11), "familiars", void 0), _this11;
  }
  return _createClass(Path2);
}(MafiaClass);
_class12 = Path;
_defineProperty2(Path, "staticType", "Path");
_defineProperty2(Path, "none", _class12.get("none"));
var Phylum = /* @__PURE__ */ function(_MafiaClass12) {
  _inherits(Phylum2, _MafiaClass12);
  var _super12 = _createSuper(Phylum2);
  function Phylum2() {
    var _this12;
    _classCallCheck(this, Phylum2);
    for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++)
      args[_key12] = arguments[_key12];
    return _this12 = _super12.call.apply(_super12, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this12), "image", void 0), _this12;
  }
  return _createClass(Phylum2);
}(MafiaClass);
_class13 = Phylum;
_defineProperty2(Phylum, "staticType", "Phylum");
_defineProperty2(Phylum, "none", _class13.get("none"));
var Servant = /* @__PURE__ */ function(_MafiaClass13) {
  _inherits(Servant2, _MafiaClass13);
  var _super13 = _createSuper(Servant2);
  function Servant2() {
    var _this13;
    _classCallCheck(this, Servant2);
    for (var _len13 = arguments.length, args = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++)
      args[_key13] = arguments[_key13];
    return _this13 = _super13.call.apply(_super13, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this13), "id", void 0), _defineProperty2(_assertThisInitialized(_this13), "name", void 0), _defineProperty2(_assertThisInitialized(_this13), "level", void 0), _defineProperty2(_assertThisInitialized(_this13), "experience", void 0), _defineProperty2(_assertThisInitialized(_this13), "image", void 0), _defineProperty2(_assertThisInitialized(_this13), "level1Ability", void 0), _defineProperty2(_assertThisInitialized(_this13), "level7Ability", void 0), _defineProperty2(_assertThisInitialized(_this13), "level14Ability", void 0), _defineProperty2(_assertThisInitialized(_this13), "level21Ability", void 0), _this13;
  }
  return _createClass(Servant2);
}(MafiaClass);
_class14 = Servant;
_defineProperty2(Servant, "staticType", "Servant");
_defineProperty2(Servant, "none", _class14.get("none"));
var Skill = /* @__PURE__ */ function(_MafiaClass14) {
  _inherits(Skill2, _MafiaClass14);
  var _super14 = _createSuper(Skill2);
  function Skill2() {
    var _this14;
    _classCallCheck(this, Skill2);
    for (var _len14 = arguments.length, args = new Array(_len14), _key14 = 0; _key14 < _len14; _key14++)
      args[_key14] = arguments[_key14];
    return _this14 = _super14.call.apply(_super14, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this14), "id", void 0), _defineProperty2(_assertThisInitialized(_this14), "name", void 0), _defineProperty2(_assertThisInitialized(_this14), "type", void 0), _defineProperty2(_assertThisInitialized(_this14), "level", void 0), _defineProperty2(_assertThisInitialized(_this14), "image", void 0), _defineProperty2(_assertThisInitialized(_this14), "traincost", void 0), _defineProperty2(_assertThisInitialized(_this14), "class", void 0), _defineProperty2(_assertThisInitialized(_this14), "libram", void 0), _defineProperty2(_assertThisInitialized(_this14), "passive", void 0), _defineProperty2(_assertThisInitialized(_this14), "buff", void 0), _defineProperty2(_assertThisInitialized(_this14), "combat", void 0), _defineProperty2(_assertThisInitialized(_this14), "song", void 0), _defineProperty2(_assertThisInitialized(_this14), "expression", void 0), _defineProperty2(_assertThisInitialized(_this14), "walk", void 0), _defineProperty2(_assertThisInitialized(_this14), "summon", void 0), _defineProperty2(_assertThisInitialized(_this14), "permable", void 0), _defineProperty2(_assertThisInitialized(_this14), "dailylimit", void 0), _defineProperty2(_assertThisInitialized(_this14), "dailylimitpref", void 0), _defineProperty2(_assertThisInitialized(_this14), "timescast", void 0), _this14;
  }
  return _createClass(Skill2);
}(MafiaClass);
_class15 = Skill;
_defineProperty2(Skill, "staticType", "Skill");
_defineProperty2(Skill, "none", _class15.get("none"));
var Slot = /* @__PURE__ */ function(_MafiaClass15) {
  _inherits(Slot2, _MafiaClass15);
  var _super15 = _createSuper(Slot2);
  function Slot2() {
    return _classCallCheck(this, Slot2), _super15.apply(this, arguments);
  }
  return _createClass(Slot2);
}(MafiaClass);
_class16 = Slot;
_defineProperty2(Slot, "staticType", "Slot");
_defineProperty2(Slot, "none", _class16.get("none"));
var Stat = /* @__PURE__ */ function(_MafiaClass16) {
  _inherits(Stat2, _MafiaClass16);
  var _super16 = _createSuper(Stat2);
  function Stat2() {
    return _classCallCheck(this, Stat2), _super16.apply(this, arguments);
  }
  return _createClass(Stat2);
}(MafiaClass);
_class17 = Stat;
_defineProperty2(Stat, "staticType", "Stat");
_defineProperty2(Stat, "none", _class17.get("none"));
var Thrall = /* @__PURE__ */ function(_MafiaClass17) {
  _inherits(Thrall2, _MafiaClass17);
  var _super17 = _createSuper(Thrall2);
  function Thrall2() {
    var _this15;
    _classCallCheck(this, Thrall2);
    for (var _len15 = arguments.length, args = new Array(_len15), _key15 = 0; _key15 < _len15; _key15++)
      args[_key15] = arguments[_key15];
    return _this15 = _super17.call.apply(_super17, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this15), "id", void 0), _defineProperty2(_assertThisInitialized(_this15), "name", void 0), _defineProperty2(_assertThisInitialized(_this15), "level", void 0), _defineProperty2(_assertThisInitialized(_this15), "image", void 0), _defineProperty2(_assertThisInitialized(_this15), "tinyimage", void 0), _defineProperty2(_assertThisInitialized(_this15), "skill", void 0), _defineProperty2(_assertThisInitialized(_this15), "currentModifiers", void 0), _this15;
  }
  return _createClass(Thrall2);
}(MafiaClass);
_class18 = Thrall;
_defineProperty2(Thrall, "staticType", "Thrall");
_defineProperty2(Thrall, "none", _class18.get("none"));
var Vykea = /* @__PURE__ */ function(_MafiaClass18) {
  _inherits(Vykea2, _MafiaClass18);
  var _super18 = _createSuper(Vykea2);
  function Vykea2() {
    var _this16;
    _classCallCheck(this, Vykea2);
    for (var _len16 = arguments.length, args = new Array(_len16), _key16 = 0; _key16 < _len16; _key16++)
      args[_key16] = arguments[_key16];
    return _this16 = _super18.call.apply(_super18, [this].concat(args)), _defineProperty2(_assertThisInitialized(_this16), "id", void 0), _defineProperty2(_assertThisInitialized(_this16), "name", void 0), _defineProperty2(_assertThisInitialized(_this16), "type", void 0), _defineProperty2(_assertThisInitialized(_this16), "rune", void 0), _defineProperty2(_assertThisInitialized(_this16), "level", void 0), _defineProperty2(_assertThisInitialized(_this16), "image", void 0), _defineProperty2(_assertThisInitialized(_this16), "modifiers", void 0), _defineProperty2(_assertThisInitialized(_this16), "attackElement", void 0), _this16;
  }
  return _createClass(Vykea2);
}(MafiaClass);
_class19 = Vykea;
_defineProperty2(Vykea, "staticType", "Vykea");
_defineProperty2(Vykea, "none", _class19.get("none"));
var globalTypes = {
  Bounty,
  Class,
  Coinmaster,
  Effect,
  Element,
  Familiar,
  Item,
  Location,
  Modifier,
  Monster,
  Path,
  Phylum,
  Servant,
  Skill,
  Slot,
  Stat,
  Thrall,
  Vykea
};

// src/kolmafia/singletonize.ts
function _slicedToArray2(arr, i) {
  return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i) || _unsupportedIterableToArray3(arr, i) || _nonIterableRest2();
}
function _nonIterableRest2() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _unsupportedIterableToArray3(o, minLen) {
  if (o) {
    if (typeof o == "string")
      return _arrayLikeToArray3(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor && (n = o.constructor.name), n === "Map" || n === "Set")
      return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray3(o, minLen);
  }
}
function _arrayLikeToArray3(arr, len) {
  (len == null || len > arr.length) && (len = arr.length);
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit2(r, l) {
  var t = r == null ? null : typeof Symbol < "u" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e, n, i, u, a = [], f = !0, o = !1;
    try {
      if (i = (t = t.call(r)).next, l === 0) {
        if (Object(t) !== t)
          return;
        f = !1;
      } else
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0)
          ;
    } catch (r2) {
      o = !0, n = r2;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u))
          return;
      } finally {
        if (o)
          throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles2(arr) {
  if (Array.isArray(arr))
    return arr;
}
var objectCache = Object.fromEntries(Object.keys(placeholderTypes).map((type) => [type, /* @__PURE__ */ new Map()]));
function isIdentified(object) {
  var _ref = object, objectType = _ref.objectType, identifierString = _ref.identifierString, identifierNumber = _ref.identifierNumber;
  return typeof objectType == "string" && objectType in placeholderTypes && typeof identifierString == "string" && (identifierNumber === void 0 || typeof identifierNumber == "number");
}
function cacheIdentified(object) {
  var objectType = object.objectType, identifierString = object.identifierString, identifierNumber = object.identifierNumber, identifier = identifierNumber !== void 0 ? "[".concat(identifierNumber, "]").concat(identifierString) : identifierString, cached = objectCache[objectType].get(identifier);
  if (cached !== void 0)
    return Object.assign(cached, object), cached;
  var result = new globalTypes[objectType](object);
  return objectCache[objectType].set(identifier, result), result;
}
function singletonize(object) {
  return Array.isArray(object) ? object.map((item) => singletonize(item)) : typeof object == "object" && object !== null ? isIdentified(object) ? cacheIdentified(object) : Object.fromEntries(Object.entries(object).map((_ref2) => {
    var _ref3 = _slicedToArray2(_ref2, 2), key = _ref3[0], value = _ref3[1];
    return [key, singletonize(value)];
  })) : object;
}

// src/kolmafia/remote.ts
var remoteFunctionsLoader = new import_dataloader2.default(batchFunction), cachedValues, dirtyCachedValues = /* @__PURE__ */ new Set(), clearCount = 0;
function getCachedValues() {
  return cachedValues === void 0 && (cachedValues = /* @__PURE__ */ new Map()), cachedValues;
}
function markRemoteCallCacheDirty() {
  for (var _i = 0, _Array$from = Array.from(cachedValues.keys()); _i < _Array$from.length; _i++) {
    var key = _Array$from[_i];
    dirtyCachedValues.add(key);
  }
  clearCount++;
}
var refreshCount = 0;
function fetchResult(name, args) {
  var initialClearCount = clearCount;
  remoteFunctionsLoader.load({
    name,
    args
  }).then((value) => {
    var singletonized = singletonize(value), key = JSON.stringify([name, args]);
    if (getCachedValues().set(key, singletonized), clearCount === initialClearCount) {
      dirtyCachedValues.delete(key);
      var initialRefreshCount = refreshCount;
      setTimeout(() => {
        refreshCount === initialRefreshCount && (refreshCount++, triggerSoftRefresh && triggerSoftRefresh());
      });
    }
  });
}
function remoteCall(name, args, default_) {
  var key = JSON.stringify([name, args]);
  if (name === "getProperty" && typeof args[0] == "string") {
    var override = localStorage.getItem(args[0]);
    if (override !== null)
      return override;
  }
  var cached = getCachedValues().get(key);
  return (cached === void 0 || dirtyCachedValues.has(key)) && setTimeout(() => fetchResult(name, args)), cached !== void 0 ? cached : default_;
}

// src/contexts/RefreshContext.tsx
function _regeneratorRuntime2() {
  "use strict";
  _regeneratorRuntime2 = function() {
    return e;
  };
  var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function(t2, e2, r2) {
    t2[e2] = r2.value;
  }, i = typeof Symbol == "function" ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag";
  function define(t2, e2, r2) {
    return Object.defineProperty(t2, e2, { value: r2, enumerable: !0, configurable: !0, writable: !0 }), t2[e2];
  }
  try {
    define({}, "");
  } catch {
    define = function(t3, e2, r2) {
      return t3[e2] = r2;
    };
  }
  function wrap(t2, e2, r2, n2) {
    var i2 = e2 && e2.prototype instanceof Generator ? e2 : Generator, a2 = Object.create(i2.prototype), c2 = new Context(n2 || []);
    return o(a2, "_invoke", { value: makeInvokeMethod(t2, r2, c2) }), a2;
  }
  function tryCatch(t2, e2, r2) {
    try {
      return { type: "normal", arg: t2.call(e2, r2) };
    } catch (t3) {
      return { type: "throw", arg: t3 };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  var p = {};
  define(p, a, function() {
    return this;
  });
  var d = Object.getPrototypeOf, v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t2) {
    ["next", "throw", "return"].forEach(function(e2) {
      define(t2, e2, function(t3) {
        return this._invoke(e2, t3);
      });
    });
  }
  function AsyncIterator(t2, e2) {
    function invoke(r3, o2, i2, a2) {
      var c2 = tryCatch(t2[r3], t2, o2);
      if (c2.type !== "throw") {
        var u2 = c2.arg, h2 = u2.value;
        return h2 && typeof h2 == "object" && n.call(h2, "__await") ? e2.resolve(h2.__await).then(function(t3) {
          invoke("next", t3, i2, a2);
        }, function(t3) {
          invoke("throw", t3, i2, a2);
        }) : e2.resolve(h2).then(function(t3) {
          u2.value = t3, i2(u2);
        }, function(t3) {
          return invoke("throw", t3, i2, a2);
        });
      }
      a2(c2.arg);
    }
    var r2;
    o(this, "_invoke", { value: function(t3, n2) {
      function callInvokeWithMethodAndArg() {
        return new e2(function(e3, r3) {
          invoke(t3, n2, e3, r3);
        });
      }
      return r2 = r2 ? r2.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } });
  }
  function makeInvokeMethod(e2, r2, n2) {
    var o2 = h;
    return function(i2, a2) {
      if (o2 === f)
        throw new Error("Generator is already running");
      if (o2 === s) {
        if (i2 === "throw")
          throw a2;
        return { value: t, done: !0 };
      }
      for (n2.method = i2, n2.arg = a2; ; ) {
        var c2 = n2.delegate;
        if (c2) {
          var u2 = maybeInvokeDelegate(c2, n2);
          if (u2) {
            if (u2 === y)
              continue;
            return u2;
          }
        }
        if (n2.method === "next")
          n2.sent = n2._sent = n2.arg;
        else if (n2.method === "throw") {
          if (o2 === h)
            throw o2 = s, n2.arg;
          n2.dispatchException(n2.arg);
        } else
          n2.method === "return" && n2.abrupt("return", n2.arg);
        o2 = f;
        var p2 = tryCatch(e2, r2, n2);
        if (p2.type === "normal") {
          if (o2 = n2.done ? s : l, p2.arg === y)
            continue;
          return { value: p2.arg, done: n2.done };
        }
        p2.type === "throw" && (o2 = s, n2.method = "throw", n2.arg = p2.arg);
      }
    };
  }
  function maybeInvokeDelegate(e2, r2) {
    var n2 = r2.method, o2 = e2.iterator[n2];
    if (o2 === t)
      return r2.delegate = null, n2 === "throw" && e2.iterator.return && (r2.method = "return", r2.arg = t, maybeInvokeDelegate(e2, r2), r2.method === "throw") || n2 !== "return" && (r2.method = "throw", r2.arg = new TypeError("The iterator does not provide a '" + n2 + "' method")), y;
    var i2 = tryCatch(o2, e2.iterator, r2.arg);
    if (i2.type === "throw")
      return r2.method = "throw", r2.arg = i2.arg, r2.delegate = null, y;
    var a2 = i2.arg;
    return a2 ? a2.done ? (r2[e2.resultName] = a2.value, r2.next = e2.nextLoc, r2.method !== "return" && (r2.method = "next", r2.arg = t), r2.delegate = null, y) : a2 : (r2.method = "throw", r2.arg = new TypeError("iterator result is not an object"), r2.delegate = null, y);
  }
  function pushTryEntry(t2) {
    var e2 = { tryLoc: t2[0] };
    1 in t2 && (e2.catchLoc = t2[1]), 2 in t2 && (e2.finallyLoc = t2[2], e2.afterLoc = t2[3]), this.tryEntries.push(e2);
  }
  function resetTryEntry(t2) {
    var e2 = t2.completion || {};
    e2.type = "normal", delete e2.arg, t2.completion = e2;
  }
  function Context(t2) {
    this.tryEntries = [{ tryLoc: "root" }], t2.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e2) {
    if (e2 || e2 === "") {
      var r2 = e2[a];
      if (r2)
        return r2.call(e2);
      if (typeof e2.next == "function")
        return e2;
      if (!isNaN(e2.length)) {
        var o2 = -1, i2 = function next() {
          for (; ++o2 < e2.length; )
            if (n.call(e2, o2))
              return next.value = e2[o2], next.done = !1, next;
          return next.value = t, next.done = !0, next;
        };
        return i2.next = i2;
      }
    }
    throw new TypeError(typeof e2 + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function(t2) {
    var e2 = typeof t2 == "function" && t2.constructor;
    return !!e2 && (e2 === GeneratorFunction || (e2.displayName || e2.name) === "GeneratorFunction");
  }, e.mark = function(t2) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t2, GeneratorFunctionPrototype) : (t2.__proto__ = GeneratorFunctionPrototype, define(t2, u, "GeneratorFunction")), t2.prototype = Object.create(g), t2;
  }, e.awrap = function(t2) {
    return { __await: t2 };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function() {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function(t2, r2, n2, o2, i2) {
    i2 === void 0 && (i2 = Promise);
    var a2 = new AsyncIterator(wrap(t2, r2, n2, o2), i2);
    return e.isGeneratorFunction(r2) ? a2 : a2.next().then(function(t3) {
      return t3.done ? t3.value : a2.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function() {
    return this;
  }), define(g, "toString", function() {
    return "[object Generator]";
  }), e.keys = function(t2) {
    var e2 = Object(t2), r2 = [];
    for (var n2 in e2)
      r2.push(n2);
    return r2.reverse(), function next() {
      for (; r2.length; ) {
        var t3 = r2.pop();
        if (t3 in e2)
          return next.value = t3, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = { constructor: Context, reset: function(e2) {
    if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e2)
      for (var r2 in this)
        r2.charAt(0) === "t" && n.call(this, r2) && !isNaN(+r2.slice(1)) && (this[r2] = t);
  }, stop: function() {
    this.done = !0;
    var t2 = this.tryEntries[0].completion;
    if (t2.type === "throw")
      throw t2.arg;
    return this.rval;
  }, dispatchException: function(e2) {
    if (this.done)
      throw e2;
    var r2 = this;
    function handle(n2, o3) {
      return a2.type = "throw", a2.arg = e2, r2.next = n2, o3 && (r2.method = "next", r2.arg = t), !!o3;
    }
    for (var o2 = this.tryEntries.length - 1; o2 >= 0; --o2) {
      var i2 = this.tryEntries[o2], a2 = i2.completion;
      if (i2.tryLoc === "root")
        return handle("end");
      if (i2.tryLoc <= this.prev) {
        var c2 = n.call(i2, "catchLoc"), u2 = n.call(i2, "finallyLoc");
        if (c2 && u2) {
          if (this.prev < i2.catchLoc)
            return handle(i2.catchLoc, !0);
          if (this.prev < i2.finallyLoc)
            return handle(i2.finallyLoc);
        } else if (c2) {
          if (this.prev < i2.catchLoc)
            return handle(i2.catchLoc, !0);
        } else {
          if (!u2)
            throw new Error("try statement without catch or finally");
          if (this.prev < i2.finallyLoc)
            return handle(i2.finallyLoc);
        }
      }
    }
  }, abrupt: function(t2, e2) {
    for (var r2 = this.tryEntries.length - 1; r2 >= 0; --r2) {
      var o2 = this.tryEntries[r2];
      if (o2.tryLoc <= this.prev && n.call(o2, "finallyLoc") && this.prev < o2.finallyLoc) {
        var i2 = o2;
        break;
      }
    }
    i2 && (t2 === "break" || t2 === "continue") && i2.tryLoc <= e2 && e2 <= i2.finallyLoc && (i2 = null);
    var a2 = i2 ? i2.completion : {};
    return a2.type = t2, a2.arg = e2, i2 ? (this.method = "next", this.next = i2.finallyLoc, y) : this.complete(a2);
  }, complete: function(t2, e2) {
    if (t2.type === "throw")
      throw t2.arg;
    return t2.type === "break" || t2.type === "continue" ? this.next = t2.arg : t2.type === "return" ? (this.rval = this.arg = t2.arg, this.method = "return", this.next = "end") : t2.type === "normal" && e2 && (this.next = e2), y;
  }, finish: function(t2) {
    for (var e2 = this.tryEntries.length - 1; e2 >= 0; --e2) {
      var r2 = this.tryEntries[e2];
      if (r2.finallyLoc === t2)
        return this.complete(r2.completion, r2.afterLoc), resetTryEntry(r2), y;
    }
  }, catch: function(t2) {
    for (var e2 = this.tryEntries.length - 1; e2 >= 0; --e2) {
      var r2 = this.tryEntries[e2];
      if (r2.tryLoc === t2) {
        var n2 = r2.completion;
        if (n2.type === "throw") {
          var o2 = n2.arg;
          resetTryEntry(r2);
        }
        return o2;
      }
    }
    throw new Error("illegal catch attempt");
  }, delegateYield: function(e2, r2, n2) {
    return this.delegate = { iterator: values(e2), resultName: r2, nextLoc: n2 }, this.method === "next" && (this.arg = t), y;
  } }, e;
}
function _slicedToArray3(arr, i) {
  return _arrayWithHoles3(arr) || _iterableToArrayLimit3(arr, i) || _unsupportedIterableToArray4(arr, i) || _nonIterableRest3();
}
function _nonIterableRest3() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _unsupportedIterableToArray4(o, minLen) {
  if (o) {
    if (typeof o == "string")
      return _arrayLikeToArray4(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor && (n = o.constructor.name), n === "Map" || n === "Set")
      return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray4(o, minLen);
  }
}
function _arrayLikeToArray4(arr, len) {
  (len == null || len > arr.length) && (len = arr.length);
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit3(r, l) {
  var t = r == null ? null : typeof Symbol < "u" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e, n, i, u, a = [], f = !0, o = !1;
    try {
      if (i = (t = t.call(r)).next, l === 0) {
        if (Object(t) !== t)
          return;
        f = !1;
      } else
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0)
          ;
    } catch (r2) {
      o = !0, n = r2;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u))
          return;
      } finally {
        if (o)
          throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles3(arr) {
  if (Array.isArray(arr))
    return arr;
}
function asyncGeneratorStep2(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg), value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
}
function _asyncToGenerator2(fn) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
var triggerSoftRefresh;
function useInterval(callback, delay) {
  var savedCallback = (0, import_react.useRef)(callback);
  (0, import_react.useLayoutEffect)(() => {
    savedCallback.current = callback;
  }, [callback]), (0, import_react.useEffect)(() => {
    if (!(!delay && delay !== 0)) {
      var id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
var RefreshContext = /* @__PURE__ */ (0, import_react.createContext)({
  // Re-render without going back to the server.
  softRefreshCount: 0,
  // Re-render and go back to the server.
  hardRefreshCount: 0
});
function getCharacterState() {
  return _getCharacterState.apply(this, arguments);
}
function _getCharacterState() {
  return _getCharacterState = _asyncToGenerator2(/* @__PURE__ */ _regeneratorRuntime2().mark(function _callee2() {
    var _yield$Promise$all, _yield$Promise$all2, myTurncount2, myMeat2, myHp2, myMp2, myFamiliar2, myAdventures2;
    return _regeneratorRuntime2().wrap(function(_context2) {
      for (; ; )
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.next = 2, Promise.all([call.myTurncount(), call.myMeat(), call.myHp(), call.myMp(), call.myFamiliar().name, call.myAdventures()]);
          case 2:
            return _yield$Promise$all = _context2.sent, _yield$Promise$all2 = _slicedToArray3(_yield$Promise$all, 6), myTurncount2 = _yield$Promise$all2[0], myMeat2 = _yield$Promise$all2[1], myHp2 = _yield$Promise$all2[2], myMp2 = _yield$Promise$all2[3], myFamiliar2 = _yield$Promise$all2[4], myAdventures2 = _yield$Promise$all2[5], _context2.abrupt("return", {
              myTurncount: myTurncount2,
              myMeat: myMeat2,
              myHp: myHp2,
              myMp: myMp2,
              myFamiliar: myFamiliar2,
              myAdventures: myAdventures2
            });
          case 11:
          case "end":
            return _context2.stop();
        }
    }, _callee2);
  })), _getCharacterState.apply(this, arguments);
}
var RefreshContextProvider = (_ref) => {
  var charStateOverride = _ref.charStateOverride, children = _ref.children, _ref2 = charStateOverride ? (0, import_react.useState)({}) : (0, import_react.useState)({}), _ref3 = _slicedToArray3(_ref2, 2), lastCharacterState = _ref3[0], setLastCharacterState = _ref3[1], _useState = (0, import_react.useState)(0), _useState2 = _slicedToArray3(_useState, 2), softRefreshCount = _useState2[0], setSoftRefreshCount = _useState2[1], _useState3 = (0, import_react.useState)(0), _useState4 = _slicedToArray3(_useState3, 2), hardRefreshCount = _useState4[0], setHardRefreshCount = _useState4[1];
  return useInterval(/* @__PURE__ */ _asyncToGenerator2(/* @__PURE__ */ _regeneratorRuntime2().mark(function _callee() {
    var characterState;
    return _regeneratorRuntime2().wrap(function(_context) {
      for (; ; )
        switch (_context.prev = _context.next) {
          case 0:
            if (!charStateOverride) {
              _context.next = 6;
              break;
            }
            return _context.next = 3, charStateOverride();
          case 3:
            _context.t0 = _context.sent, _context.next = 9;
            break;
          case 6:
            return _context.next = 8, getCharacterState();
          case 8:
            _context.t0 = _context.sent;
          case 9:
            characterState = _context.t0, Object.entries(characterState).every((_ref5) => {
              var _ref6 = _slicedToArray3(_ref5, 2), key = _ref6[0], value = _ref6[1];
              return lastCharacterState[key] === value;
            }) || (setLastCharacterState(characterState), markRemoteCallCacheDirty(), setHardRefreshCount((count2) => count2 + 1));
          case 11:
          case "end":
            return _context.stop();
        }
    }, _callee);
  })), 2e3), (0, import_react.useEffect)(() => {
    var callback = (event) => {
      event.origin === "http://localhost:3000" && event.data === "refresh" && (markRemoteCallCacheDirty(), setSoftRefreshCount((count2) => count2 + 1));
    };
    window.addEventListener("message", callback);
  }, []), (0, import_react.useEffect)(() => {
    triggerSoftRefresh = () => {
      setSoftRefreshCount((count2) => count2 + 1);
    };
  }, []), /* @__PURE__ */ import_react.default.createElement(RefreshContext.Provider, {
    value: {
      softRefreshCount,
      hardRefreshCount
    }
  }, children);
};

// src/kolmafia/functions.ts
function abort() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++)
    args[_key] = arguments[_key];
  throw remoteCall("abort", args);
}
function absorbedMonsters() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++)
    args[_key2] = arguments[_key2];
  return remoteCall("absorbedMonsters", args, {});
}
function addItemCondition() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++)
    args[_key3] = arguments[_key3];
  return remoteCall("addItemCondition", args);
}
function adv1() {
  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++)
    args[_key4] = arguments[_key4];
  return remoteCall("adv1", args, !1);
}
function advCost() {
  for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++)
    args[_key5] = arguments[_key5];
  return remoteCall("advCost", args, 0);
}
function adventure() {
  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++)
    args[_key6] = arguments[_key6];
  return remoteCall("adventure", args, !1);
}
function allMonstersWithId() {
  for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++)
    args[_key7] = arguments[_key7];
  return remoteCall("allMonstersWithId", args, {});
}
function allNormalOutfits() {
  for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++)
    args[_key8] = arguments[_key8];
  return remoteCall("allNormalOutfits", args, []);
}
function appearanceRates() {
  for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++)
    args[_key9] = arguments[_key9];
  return remoteCall("appearanceRates", args, {});
}
function append() {
  for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++)
    args[_key10] = arguments[_key10];
  return remoteCall("append", args, "");
}
function attack() {
  for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++)
    args[_key11] = arguments[_key11];
  return remoteCall("attack", args, "");
}
function autosell() {
  for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++)
    args[_key12] = arguments[_key12];
  return remoteCall("autosell", args, !1);
}
function autosellPrice() {
  for (var _len13 = arguments.length, args = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++)
    args[_key13] = arguments[_key13];
  return remoteCall("autosellPrice", args, 0);
}
function availableAmount() {
  for (var _len14 = arguments.length, args = new Array(_len14), _key14 = 0; _key14 < _len14; _key14++)
    args[_key14] = arguments[_key14];
  return remoteCall("availableAmount", args, 0);
}
function availableChoiceOptions() {
  for (var _len15 = arguments.length, args = new Array(_len15), _key15 = 0; _key15 < _len15; _key15++)
    args[_key15] = arguments[_key15];
  return remoteCall("availableChoiceOptions", args, {});
}
function availableChoiceSelectInputs() {
  for (var _len16 = arguments.length, args = new Array(_len16), _key16 = 0; _key16 < _len16; _key16++)
    args[_key16] = arguments[_key16];
  return remoteCall("availableChoiceSelectInputs", args, {});
}
function availableChoiceTextInputs() {
  for (var _len17 = arguments.length, args = new Array(_len17), _key17 = 0; _key17 < _len17; _key17++)
    args[_key17] = arguments[_key17];
  return remoteCall("availableChoiceTextInputs", args, {});
}
function availablePocket() {
  for (var _len18 = arguments.length, args = new Array(_len18), _key18 = 0; _key18 < _len18; _key18++)
    args[_key18] = arguments[_key18];
  return remoteCall("availablePocket", args, 0);
}
function batchClose() {
  for (var _len19 = arguments.length, args = new Array(_len19), _key19 = 0; _key19 < _len19; _key19++)
    args[_key19] = arguments[_key19];
  return remoteCall("batchClose", args, !1);
}
function batchOpen() {
  for (var _len20 = arguments.length, args = new Array(_len20), _key20 = 0; _key20 < _len20; _key20++)
    args[_key20] = arguments[_key20];
  return remoteCall("batchOpen", args);
}
function bjornifyFamiliar() {
  for (var _len21 = arguments.length, args = new Array(_len21), _key21 = 0; _key21 < _len21; _key21++)
    args[_key21] = arguments[_key21];
  return remoteCall("bjornifyFamiliar", args, !1);
}
function blackMarketAvailable() {
  for (var _len22 = arguments.length, args = new Array(_len22), _key22 = 0; _key22 < _len22; _key22++)
    args[_key22] = arguments[_key22];
  return remoteCall("blackMarketAvailable", args, !1);
}
function booleanModifier() {
  for (var _len23 = arguments.length, args = new Array(_len23), _key23 = 0; _key23 < _len23; _key23++)
    args[_key23] = arguments[_key23];
  return remoteCall("booleanModifier", args, !1);
}
function buffedHitStat() {
  for (var _len24 = arguments.length, args = new Array(_len24), _key24 = 0; _key24 < _len24; _key24++)
    args[_key24] = arguments[_key24];
  return remoteCall("buffedHitStat", args, 0);
}
function bufferToFile() {
  for (var _len25 = arguments.length, args = new Array(_len25), _key25 = 0; _key25 < _len25; _key25++)
    args[_key25] = arguments[_key25];
  return remoteCall("bufferToFile", args, !1);
}
function buy() {
  for (var _len26 = arguments.length, args = new Array(_len26), _key26 = 0; _key26 < _len26; _key26++)
    args[_key26] = arguments[_key26];
  return remoteCall("buy", args, !1);
}
function buyPrice() {
  for (var _len27 = arguments.length, args = new Array(_len27), _key27 = 0; _key27 < _len27; _key27++)
    args[_key27] = arguments[_key27];
  return remoteCall("buyPrice", args, 0);
}
function buyUsingStorage() {
  for (var _len28 = arguments.length, args = new Array(_len28), _key28 = 0; _key28 < _len28; _key28++)
    args[_key28] = arguments[_key28];
  return remoteCall("buyUsingStorage", args, !1);
}
function buysItem() {
  for (var _len29 = arguments.length, args = new Array(_len29), _key29 = 0; _key29 < _len29; _key29++)
    args[_key29] = arguments[_key29];
  return remoteCall("buysItem", args, !1);
}
function canAdventure() {
  for (var _len30 = arguments.length, args = new Array(_len30), _key30 = 0; _key30 < _len30; _key30++)
    args[_key30] = arguments[_key30];
  return remoteCall("canAdventure", args, !1);
}
function canDrink() {
  for (var _len31 = arguments.length, args = new Array(_len31), _key31 = 0; _key31 < _len31; _key31++)
    args[_key31] = arguments[_key31];
  return remoteCall("canDrink", args, !1);
}
function canEat() {
  for (var _len32 = arguments.length, args = new Array(_len32), _key32 = 0; _key32 < _len32; _key32++)
    args[_key32] = arguments[_key32];
  return remoteCall("canEat", args, !1);
}
function canEquip() {
  for (var _len33 = arguments.length, args = new Array(_len33), _key33 = 0; _key33 < _len33; _key33++)
    args[_key33] = arguments[_key33];
  return remoteCall("canEquip", args, !1);
}
function canFaxbot() {
  for (var _len34 = arguments.length, args = new Array(_len34), _key34 = 0; _key34 < _len34; _key34++)
    args[_key34] = arguments[_key34];
  return remoteCall("canFaxbot", args, !1);
}
function canInteract() {
  for (var _len35 = arguments.length, args = new Array(_len35), _key35 = 0; _key35 < _len35; _key35++)
    args[_key35] = arguments[_key35];
  return remoteCall("canInteract", args, !1);
}
function canStillSteal() {
  for (var _len36 = arguments.length, args = new Array(_len36), _key36 = 0; _key36 < _len36; _key36++)
    args[_key36] = arguments[_key36];
  return remoteCall("canStillSteal", args, !1);
}
function canadiaAvailable() {
  for (var _len37 = arguments.length, args = new Array(_len37), _key37 = 0; _key37 < _len37; _key37++)
    args[_key37] = arguments[_key37];
  return remoteCall("canadiaAvailable", args, !1);
}
function candyForTier() {
  for (var _len38 = arguments.length, args = new Array(_len38), _key38 = 0; _key38 < _len38; _key38++)
    args[_key38] = arguments[_key38];
  return remoteCall("candyForTier", args, []);
}
function ceil() {
  for (var _len39 = arguments.length, args = new Array(_len39), _key39 = 0; _key39 < _len39; _key39++)
    args[_key39] = arguments[_key39];
  return remoteCall("ceil", args, 0);
}
function changeMcd() {
  for (var _len40 = arguments.length, args = new Array(_len40), _key40 = 0; _key40 < _len40; _key40++)
    args[_key40] = arguments[_key40];
  return remoteCall("changeMcd", args, !1);
}
function charAt() {
  for (var _len41 = arguments.length, args = new Array(_len41), _key41 = 0; _key41 < _len41; _key41++)
    args[_key41] = arguments[_key41];
  return remoteCall("charAt", args, "");
}
function chatClan() {
  for (var _len42 = arguments.length, args = new Array(_len42), _key42 = 0; _key42 < _len42; _key42++)
    args[_key42] = arguments[_key42];
  return remoteCall("chatClan", args);
}
function chatMacro() {
  for (var _len43 = arguments.length, args = new Array(_len43), _key43 = 0; _key43 < _len43; _key43++)
    args[_key43] = arguments[_key43];
  return remoteCall("chatMacro", args);
}
function chatNotify() {
  for (var _len44 = arguments.length, args = new Array(_len44), _key44 = 0; _key44 < _len44; _key44++)
    args[_key44] = arguments[_key44];
  return remoteCall("chatNotify", args);
}
function chatPrivate() {
  for (var _len45 = arguments.length, args = new Array(_len45), _key45 = 0; _key45 < _len45; _key45++)
    args[_key45] = arguments[_key45];
  return remoteCall("chatPrivate", args);
}
function chew() {
  for (var _len46 = arguments.length, args = new Array(_len46), _key46 = 0; _key46 < _len46; _key46++)
    args[_key46] = arguments[_key46];
  return remoteCall("chew", args, !1);
}
function choiceFollowsFight() {
  for (var _len47 = arguments.length, args = new Array(_len47), _key47 = 0; _key47 < _len47; _key47++)
    args[_key47] = arguments[_key47];
  return remoteCall("choiceFollowsFight", args, !1);
}
function classModifier() {
  for (var _len48 = arguments.length, args = new Array(_len48), _key48 = 0; _key48 < _len48; _key48++)
    args[_key48] = arguments[_key48];
  return remoteCall("classModifier", args, makePlaceholder("Class", "none"));
}
function clear() {
  for (var _len49 = arguments.length, args = new Array(_len49), _key49 = 0; _key49 < _len49; _key49++)
    args[_key49] = arguments[_key49];
  return remoteCall("clear", args);
}
function clearBoozeHelper() {
  for (var _len50 = arguments.length, args = new Array(_len50), _key50 = 0; _key50 < _len50; _key50++)
    args[_key50] = arguments[_key50];
  return remoteCall("clearBoozeHelper", args);
}
function clearFoodHelper() {
  for (var _len51 = arguments.length, args = new Array(_len51), _key51 = 0; _key51 < _len51; _key51++)
    args[_key51] = arguments[_key51];
  return remoteCall("clearFoodHelper", args);
}
function cliExecute() {
  for (var _len52 = arguments.length, args = new Array(_len52), _key52 = 0; _key52 < _len52; _key52++)
    args[_key52] = arguments[_key52];
  return remoteCall("cliExecute", args, !1);
}
function cliExecuteOutput() {
  for (var _len53 = arguments.length, args = new Array(_len53), _key53 = 0; _key53 < _len53; _key53++)
    args[_key53] = arguments[_key53];
  return remoteCall("cliExecuteOutput", args, "");
}
function closetAmount() {
  for (var _len54 = arguments.length, args = new Array(_len54), _key54 = 0; _key54 < _len54; _key54++)
    args[_key54] = arguments[_key54];
  return remoteCall("closetAmount", args, 0);
}
function combatManaCostModifier() {
  for (var _len55 = arguments.length, args = new Array(_len55), _key55 = 0; _key55 < _len55; _key55++)
    args[_key55] = arguments[_key55];
  return remoteCall("combatManaCostModifier", args, 0);
}
function combatRateModifier() {
  for (var _len56 = arguments.length, args = new Array(_len56), _key56 = 0; _key56 < _len56; _key56++)
    args[_key56] = arguments[_key56];
  return remoteCall("combatRateModifier", args, 0);
}
function combatSkillAvailable() {
  for (var _len57 = arguments.length, args = new Array(_len57), _key57 = 0; _key57 < _len57; _key57++)
    args[_key57] = arguments[_key57];
  return remoteCall("combatSkillAvailable", args, !1);
}
function concoctionPrice() {
  for (var _len58 = arguments.length, args = new Array(_len58), _key58 = 0; _key58 < _len58; _key58++)
    args[_key58] = arguments[_key58];
  return remoteCall("concoctionPrice", args, 0);
}
function containsText() {
  for (var _len59 = arguments.length, args = new Array(_len59), _key59 = 0; _key59 < _len59; _key59++)
    args[_key59] = arguments[_key59];
  return remoteCall("containsText", args, !1);
}
function council() {
  for (var _len60 = arguments.length, args = new Array(_len60), _key60 = 0; _key60 < _len60; _key60++)
    args[_key60] = arguments[_key60];
  return remoteCall("council", args);
}
function count() {
  for (var _len61 = arguments.length, args = new Array(_len61), _key61 = 0; _key61 < _len61; _key61++)
    args[_key61] = arguments[_key61];
  return remoteCall("count", args, 0);
}
function craft() {
  for (var _len62 = arguments.length, args = new Array(_len62), _key62 = 0; _key62 < _len62; _key62++)
    args[_key62] = arguments[_key62];
  return remoteCall("craft", args, 0);
}
function craftType() {
  for (var _len63 = arguments.length, args = new Array(_len63), _key63 = 0; _key63 < _len63; _key63++)
    args[_key63] = arguments[_key63];
  return remoteCall("craftType", args, "");
}
function creatableAmount() {
  for (var _len64 = arguments.length, args = new Array(_len64), _key64 = 0; _key64 < _len64; _key64++)
    args[_key64] = arguments[_key64];
  return remoteCall("creatableAmount", args, 0);
}
function creatableTurns() {
  for (var _len65 = arguments.length, args = new Array(_len65), _key65 = 0; _key65 < _len65; _key65++)
    args[_key65] = arguments[_key65];
  return remoteCall("creatableTurns", args, 0);
}
function create() {
  for (var _len66 = arguments.length, args = new Array(_len66), _key66 = 0; _key66 < _len66; _key66++)
    args[_key66] = arguments[_key66];
  return remoteCall("create", args, !1);
}
function currentHitStat() {
  for (var _len67 = arguments.length, args = new Array(_len67), _key67 = 0; _key67 < _len67; _key67++)
    args[_key67] = arguments[_key67];
  return remoteCall("currentHitStat", args, makePlaceholder("Stat", "none"));
}
function currentMcd() {
  for (var _len68 = arguments.length, args = new Array(_len68), _key68 = 0; _key68 < _len68; _key68++)
    args[_key68] = arguments[_key68];
  return remoteCall("currentMcd", args, 0);
}
function currentPvpStances() {
  for (var _len69 = arguments.length, args = new Array(_len69), _key69 = 0; _key69 < _len69; _key69++)
    args[_key69] = arguments[_key69];
  return remoteCall("currentPvpStances", args, {});
}
function currentRadSickness() {
  for (var _len70 = arguments.length, args = new Array(_len70), _key70 = 0; _key70 < _len70; _key70++)
    args[_key70] = arguments[_key70];
  return remoteCall("currentRadSickness", args, 0);
}
function currentRound() {
  for (var _len71 = arguments.length, args = new Array(_len71), _key71 = 0; _key71 < _len71; _key71++)
    args[_key71] = arguments[_key71];
  return remoteCall("currentRound", args, 0);
}
function dadSeaMonkeeWeakness() {
  for (var _len72 = arguments.length, args = new Array(_len72), _key72 = 0; _key72 < _len72; _key72++)
    args[_key72] = arguments[_key72];
  return remoteCall("dadSeaMonkeeWeakness", args, makePlaceholder("Element", "none"));
}
function dailySpecial() {
  for (var _len73 = arguments.length, args = new Array(_len73), _key73 = 0; _key73 < _len73; _key73++)
    args[_key73] = arguments[_key73];
  return remoteCall("dailySpecial", args, makePlaceholder("Item", "none"));
}
function damageAbsorptionPercent() {
  for (var _len74 = arguments.length, args = new Array(_len74), _key74 = 0; _key74 < _len74; _key74++)
    args[_key74] = arguments[_key74];
  return remoteCall("damageAbsorptionPercent", args, 0);
}
function damageReduction() {
  for (var _len75 = arguments.length, args = new Array(_len75), _key75 = 0; _key75 < _len75; _key75++)
    args[_key75] = arguments[_key75];
  return remoteCall("damageReduction", args, 0);
}
function dateToTimestamp() {
  for (var _len76 = arguments.length, args = new Array(_len76), _key76 = 0; _key76 < _len76; _key76++)
    args[_key76] = arguments[_key76];
  return remoteCall("dateToTimestamp", args, 0);
}
function daycount() {
  for (var _len77 = arguments.length, args = new Array(_len77), _key77 = 0; _key77 < _len77; _key77++)
    args[_key77] = arguments[_key77];
  return remoteCall("daycount", args, 0);
}
function debugprint() {
  for (var _len78 = arguments.length, args = new Array(_len78), _key78 = 0; _key78 < _len78; _key78++)
    args[_key78] = arguments[_key78];
  return remoteCall("debugprint", args);
}
function descToEffect() {
  for (var _len79 = arguments.length, args = new Array(_len79), _key79 = 0; _key79 < _len79; _key79++)
    args[_key79] = arguments[_key79];
  return remoteCall("descToEffect", args, makePlaceholder("Effect", "none"));
}
function descToItem() {
  for (var _len80 = arguments.length, args = new Array(_len80), _key80 = 0; _key80 < _len80; _key80++)
    args[_key80] = arguments[_key80];
  return remoteCall("descToItem", args, makePlaceholder("Item", "none"));
}
function disable() {
  for (var _len81 = arguments.length, args = new Array(_len81), _key81 = 0; _key81 < _len81; _key81++)
    args[_key81] = arguments[_key81];
  return remoteCall("disable", args);
}
function dispensaryAvailable() {
  for (var _len82 = arguments.length, args = new Array(_len82), _key82 = 0; _key82 < _len82; _key82++)
    args[_key82] = arguments[_key82];
  return remoteCall("dispensaryAvailable", args, !1);
}
function displayAmount() {
  for (var _len83 = arguments.length, args = new Array(_len83), _key83 = 0; _key83 < _len83; _key83++)
    args[_key83] = arguments[_key83];
  return remoteCall("displayAmount", args, 0);
}
function drink() {
  for (var _len84 = arguments.length, args = new Array(_len84), _key84 = 0; _key84 < _len84; _key84++)
    args[_key84] = arguments[_key84];
  return remoteCall("drink", args, !1);
}
function drinksilent() {
  for (var _len85 = arguments.length, args = new Array(_len85), _key85 = 0; _key85 < _len85; _key85++)
    args[_key85] = arguments[_key85];
  return remoteCall("drinksilent", args, !1);
}
function dump() {
  for (var _len86 = arguments.length, args = new Array(_len86), _key86 = 0; _key86 < _len86; _key86++)
    args[_key86] = arguments[_key86];
  return remoteCall("dump", args);
}
function eat() {
  for (var _len87 = arguments.length, args = new Array(_len87), _key87 = 0; _key87 < _len87; _key87++)
    args[_key87] = arguments[_key87];
  return remoteCall("eat", args, !1);
}
function eatsilent() {
  for (var _len88 = arguments.length, args = new Array(_len88), _key88 = 0; _key88 < _len88; _key88++)
    args[_key88] = arguments[_key88];
  return remoteCall("eatsilent", args, !1);
}
function effectModifier() {
  for (var _len89 = arguments.length, args = new Array(_len89), _key89 = 0; _key89 < _len89; _key89++)
    args[_key89] = arguments[_key89];
  return remoteCall("effectModifier", args, makePlaceholder("Effect", "none"));
}
function effectPockets() {
  for (var _len90 = arguments.length, args = new Array(_len90), _key90 = 0; _key90 < _len90; _key90++)
    args[_key90] = arguments[_key90];
  return remoteCall("effectPockets", args, {});
}
function eightBitPoints() {
  for (var _len91 = arguments.length, args = new Array(_len91), _key91 = 0; _key91 < _len91; _key91++)
    args[_key91] = arguments[_key91];
  return remoteCall("eightBitPoints", args, 0);
}
function elementalResistance() {
  for (var _len92 = arguments.length, args = new Array(_len92), _key92 = 0; _key92 < _len92; _key92++)
    args[_key92] = arguments[_key92];
  return remoteCall("elementalResistance", args, 0);
}
function emptyCloset() {
  for (var _len93 = arguments.length, args = new Array(_len93), _key93 = 0; _key93 < _len93; _key93++)
    args[_key93] = arguments[_key93];
  return remoteCall("emptyCloset", args, !1);
}
function enable() {
  for (var _len94 = arguments.length, args = new Array(_len94), _key94 = 0; _key94 < _len94; _key94++)
    args[_key94] = arguments[_key94];
  return remoteCall("enable", args);
}
function endsWith() {
  for (var _len95 = arguments.length, args = new Array(_len95), _key95 = 0; _key95 < _len95; _key95++)
    args[_key95] = arguments[_key95];
  return remoteCall("endsWith", args, !1);
}
function enthroneFamiliar() {
  for (var _len96 = arguments.length, args = new Array(_len96), _key96 = 0; _key96 < _len96; _key96++)
    args[_key96] = arguments[_key96];
  return remoteCall("enthroneFamiliar", args, !1);
}
function entityDecode() {
  for (var _len97 = arguments.length, args = new Array(_len97), _key97 = 0; _key97 < _len97; _key97++)
    args[_key97] = arguments[_key97];
  return remoteCall("entityDecode", args, "");
}
function entityEncode() {
  for (var _len98 = arguments.length, args = new Array(_len98), _key98 = 0; _key98 < _len98; _key98++)
    args[_key98] = arguments[_key98];
  return remoteCall("entityEncode", args, "");
}
function equip() {
  for (var _len99 = arguments.length, args = new Array(_len99), _key99 = 0; _key99 < _len99; _key99++)
    args[_key99] = arguments[_key99];
  return remoteCall("equip", args, !1);
}
function equipAllFamiliars() {
  for (var _len100 = arguments.length, args = new Array(_len100), _key100 = 0; _key100 < _len100; _key100++)
    args[_key100] = arguments[_key100];
  return remoteCall("equipAllFamiliars", args, !1);
}
function equippedAmount() {
  for (var _len101 = arguments.length, args = new Array(_len101), _key101 = 0; _key101 < _len101; _key101++)
    args[_key101] = arguments[_key101];
  return remoteCall("equippedAmount", args, 0);
}
function equippedItem() {
  for (var _len102 = arguments.length, args = new Array(_len102), _key102 = 0; _key102 < _len102; _key102++)
    args[_key102] = arguments[_key102];
  return remoteCall("equippedItem", args, makePlaceholder("Item", "none"));
}
function eudora() {
  for (var _len103 = arguments.length, args = new Array(_len103), _key103 = 0; _key103 < _len103; _key103++)
    args[_key103] = arguments[_key103];
  return remoteCall("eudora", args, "");
}
function eudoraItem() {
  for (var _len104 = arguments.length, args = new Array(_len104), _key104 = 0; _key104 < _len104; _key104++)
    args[_key104] = arguments[_key104];
  return remoteCall("eudoraItem", args, makePlaceholder("Item", "none"));
}
function everyCardName() {
  for (var _len105 = arguments.length, args = new Array(_len105), _key105 = 0; _key105 < _len105; _key105++)
    args[_key105] = arguments[_key105];
  return remoteCall("everyCardName", args, "");
}
function expectedColdMedicineCabinet() {
  for (var _len106 = arguments.length, args = new Array(_len106), _key106 = 0; _key106 < _len106; _key106++)
    args[_key106] = arguments[_key106];
  return remoteCall("expectedColdMedicineCabinet", args, {});
}
function expectedDamage() {
  for (var _len107 = arguments.length, args = new Array(_len107), _key107 = 0; _key107 < _len107; _key107++)
    args[_key107] = arguments[_key107];
  return remoteCall("expectedDamage", args, 0);
}
function experienceBonus() {
  for (var _len108 = arguments.length, args = new Array(_len108), _key108 = 0; _key108 < _len108; _key108++)
    args[_key108] = arguments[_key108];
  return remoteCall("experienceBonus", args, 0);
}
function expressionEval() {
  for (var _len109 = arguments.length, args = new Array(_len109), _key109 = 0; _key109 < _len109; _key109++)
    args[_key109] = arguments[_key109];
  return remoteCall("expressionEval", args, 0);
}
function extractItems() {
  for (var _len110 = arguments.length, args = new Array(_len110), _key110 = 0; _key110 < _len110; _key110++)
    args[_key110] = arguments[_key110];
  return remoteCall("extractItems", args, {});
}
function extractMeat() {
  for (var _len111 = arguments.length, args = new Array(_len111), _key111 = 0; _key111 < _len111; _key111++)
    args[_key111] = arguments[_key111];
  return remoteCall("extractMeat", args, 0);
}
function familiarEquipment() {
  for (var _len112 = arguments.length, args = new Array(_len112), _key112 = 0; _key112 < _len112; _key112++)
    args[_key112] = arguments[_key112];
  return remoteCall("familiarEquipment", args, makePlaceholder("Item", "none"));
}
function familiarEquippedEquipment() {
  for (var _len113 = arguments.length, args = new Array(_len113), _key113 = 0; _key113 < _len113; _key113++)
    args[_key113] = arguments[_key113];
  return remoteCall("familiarEquippedEquipment", args, makePlaceholder("Item", "none"));
}
function familiarWeight() {
  for (var _len114 = arguments.length, args = new Array(_len114), _key114 = 0; _key114 < _len114; _key114++)
    args[_key114] = arguments[_key114];
  return remoteCall("familiarWeight", args, 0);
}
function favoriteFamiliars() {
  for (var _len115 = arguments.length, args = new Array(_len115), _key115 = 0; _key115 < _len115; _key115++)
    args[_key115] = arguments[_key115];
  return remoteCall("favoriteFamiliars", args, {});
}
function faxbot() {
  for (var _len116 = arguments.length, args = new Array(_len116), _key116 = 0; _key116 < _len116; _key116++)
    args[_key116] = arguments[_key116];
  return remoteCall("faxbot", args, !1);
}
function fightFollowsChoice() {
  for (var _len117 = arguments.length, args = new Array(_len117), _key117 = 0; _key117 < _len117; _key117++)
    args[_key117] = arguments[_key117];
  return remoteCall("fightFollowsChoice", args, !1);
}
function fileToArray() {
  for (var _len118 = arguments.length, args = new Array(_len118), _key118 = 0; _key118 < _len118; _key118++)
    args[_key118] = arguments[_key118];
  return remoteCall("fileToArray", args, {});
}
function fileToBuffer() {
  for (var _len119 = arguments.length, args = new Array(_len119), _key119 = 0; _key119 < _len119; _key119++)
    args[_key119] = arguments[_key119];
  return remoteCall("fileToBuffer", args, "");
}
function fileToMap() {
  for (var _len120 = arguments.length, args = new Array(_len120), _key120 = 0; _key120 < _len120; _key120++)
    args[_key120] = arguments[_key120];
  return remoteCall("fileToMap", args, !1);
}
function floor() {
  for (var _len121 = arguments.length, args = new Array(_len121), _key121 = 0; _key121 < _len121; _key121++)
    args[_key121] = arguments[_key121];
  return remoteCall("floor", args, 0);
}
function floristAvailable() {
  for (var _len122 = arguments.length, args = new Array(_len122), _key122 = 0; _key122 < _len122; _key122++)
    args[_key122] = arguments[_key122];
  return remoteCall("floristAvailable", args, !1);
}
function flushMonsterManuelCache() {
  for (var _len123 = arguments.length, args = new Array(_len123), _key123 = 0; _key123 < _len123; _key123++)
    args[_key123] = arguments[_key123];
  return remoteCall("flushMonsterManuelCache", args, !1);
}
function formField() {
  for (var _len124 = arguments.length, args = new Array(_len124), _key124 = 0; _key124 < _len124; _key124++)
    args[_key124] = arguments[_key124];
  return remoteCall("formField", args, "");
}
function formFields() {
  for (var _len125 = arguments.length, args = new Array(_len125), _key125 = 0; _key125 < _len125; _key125++)
    args[_key125] = arguments[_key125];
  return remoteCall("formFields", args, {});
}
function formatDateTime() {
  for (var _len126 = arguments.length, args = new Array(_len126), _key126 = 0; _key126 < _len126; _key126++)
    args[_key126] = arguments[_key126];
  return remoteCall("formatDateTime", args, "");
}
function friarsAvailable() {
  for (var _len127 = arguments.length, args = new Array(_len127), _key127 = 0; _key127 < _len127; _key127++)
    args[_key127] = arguments[_key127];
  return remoteCall("friarsAvailable", args, !1);
}
function fuelCost() {
  for (var _len128 = arguments.length, args = new Array(_len128), _key128 = 0; _key128 < _len128; _key128++)
    args[_key128] = arguments[_key128];
  return remoteCall("fuelCost", args, 0);
}
function fullnessLimit() {
  for (var _len129 = arguments.length, args = new Array(_len129), _key129 = 0; _key129 < _len129; _key129++)
    args[_key129] = arguments[_key129];
  return remoteCall("fullnessLimit", args, 0);
}
function gamedayToInt() {
  for (var _len130 = arguments.length, args = new Array(_len130), _key130 = 0; _key130 < _len130; _key130++)
    args[_key130] = arguments[_key130];
  return remoteCall("gamedayToInt", args, 0);
}
function gamedayToString() {
  for (var _len131 = arguments.length, args = new Array(_len131), _key131 = 0; _key131 < _len131; _key131++)
    args[_key131] = arguments[_key131];
  return remoteCall("gamedayToString", args, "");
}
function gametimeToInt() {
  for (var _len132 = arguments.length, args = new Array(_len132), _key132 = 0; _key132 < _len132; _key132++)
    args[_key132] = arguments[_key132];
  return remoteCall("gametimeToInt", args, 0);
}
function getAllProperties() {
  for (var _len133 = arguments.length, args = new Array(_len133), _key133 = 0; _key133 < _len133; _key133++)
    args[_key133] = arguments[_key133];
  return remoteCall("getAllProperties", args, {});
}
function getAutoAttack() {
  for (var _len134 = arguments.length, args = new Array(_len134), _key134 = 0; _key134 < _len134; _key134++)
    args[_key134] = arguments[_key134];
  return remoteCall("getAutoAttack", args, 0);
}
function getAutumnatonLocations() {
  for (var _len135 = arguments.length, args = new Array(_len135), _key135 = 0; _key135 < _len135; _key135++)
    args[_key135] = arguments[_key135];
  return remoteCall("getAutumnatonLocations", args, []);
}
function getCampground() {
  for (var _len136 = arguments.length, args = new Array(_len136), _key136 = 0; _key136 < _len136; _key136++)
    args[_key136] = arguments[_key136];
  return remoteCall("getCampground", args, {});
}
function getCcsAction() {
  for (var _len137 = arguments.length, args = new Array(_len137), _key137 = 0; _key137 < _len137; _key137++)
    args[_key137] = arguments[_key137];
  return remoteCall("getCcsAction", args, "");
}
function getChateau() {
  for (var _len138 = arguments.length, args = new Array(_len138), _key138 = 0; _key138 < _len138; _key138++)
    args[_key138] = arguments[_key138];
  return remoteCall("getChateau", args, {});
}
function getClanId() {
  for (var _len139 = arguments.length, args = new Array(_len139), _key139 = 0; _key139 < _len139; _key139++)
    args[_key139] = arguments[_key139];
  return remoteCall("getClanId", args, 0);
}
function getClanLounge() {
  for (var _len140 = arguments.length, args = new Array(_len140), _key140 = 0; _key140 < _len140; _key140++)
    args[_key140] = arguments[_key140];
  return remoteCall("getClanLounge", args, {});
}
function getClanName() {
  for (var _len141 = arguments.length, args = new Array(_len141), _key141 = 0; _key141 < _len141; _key141++)
    args[_key141] = arguments[_key141];
  return remoteCall("getClanName", args, "");
}
function getClanRumpus() {
  for (var _len142 = arguments.length, args = new Array(_len142), _key142 = 0; _key142 < _len142; _key142++)
    args[_key142] = arguments[_key142];
  return remoteCall("getClanRumpus", args, {});
}
function getCloset() {
  for (var _len143 = arguments.length, args = new Array(_len143), _key143 = 0; _key143 < _len143; _key143++)
    args[_key143] = arguments[_key143];
  return remoteCall("getCloset", args, {});
}
function getCounter() {
  for (var _len144 = arguments.length, args = new Array(_len144), _key144 = 0; _key144 < _len144; _key144++)
    args[_key144] = arguments[_key144];
  return remoteCall("getCounter", args, 0);
}
function getCounters() {
  for (var _len145 = arguments.length, args = new Array(_len145), _key145 = 0; _key145 < _len145; _key145++)
    args[_key145] = arguments[_key145];
  return remoteCall("getCounters", args, "");
}
function getCustomOutfits() {
  for (var _len146 = arguments.length, args = new Array(_len146), _key146 = 0; _key146 < _len146; _key146++)
    args[_key146] = arguments[_key146];
  return remoteCall("getCustomOutfits", args, []);
}
function getDisplay() {
  for (var _len147 = arguments.length, args = new Array(_len147), _key147 = 0; _key147 < _len147; _key147++)
    args[_key147] = arguments[_key147];
  return remoteCall("getDisplay", args, {});
}
function getDwelling() {
  for (var _len148 = arguments.length, args = new Array(_len148), _key148 = 0; _key148 < _len148; _key148++)
    args[_key148] = arguments[_key148];
  return remoteCall("getDwelling", args, makePlaceholder("Item", "none"));
}
function getFishingLocations() {
  for (var _len149 = arguments.length, args = new Array(_len149), _key149 = 0; _key149 < _len149; _key149++)
    args[_key149] = arguments[_key149];
  return remoteCall("getFishingLocations", args, {});
}
function getFloristPlants() {
  for (var _len150 = arguments.length, args = new Array(_len150), _key150 = 0; _key150 < _len150; _key150++)
    args[_key150] = arguments[_key150];
  return remoteCall("getFloristPlants", args, {});
}
function getFreePulls() {
  for (var _len151 = arguments.length, args = new Array(_len151), _key151 = 0; _key151 < _len151; _key151++)
    args[_key151] = arguments[_key151];
  return remoteCall("getFreePulls", args, {});
}
function getFuel() {
  for (var _len152 = arguments.length, args = new Array(_len152), _key152 = 0; _key152 < _len152; _key152++)
    args[_key152] = arguments[_key152];
  return remoteCall("getFuel", args, 0);
}
function getGoals() {
  for (var _len153 = arguments.length, args = new Array(_len153), _key153 = 0; _key153 < _len153; _key153++)
    args[_key153] = arguments[_key153];
  return remoteCall("getGoals", args, []);
}
function getIgnoreZoneWarnings() {
  for (var _len154 = arguments.length, args = new Array(_len154), _key154 = 0; _key154 < _len154; _key154++)
    args[_key154] = arguments[_key154];
  return remoteCall("getIgnoreZoneWarnings", args, !1);
}
function getIngredients() {
  for (var _len155 = arguments.length, args = new Array(_len155), _key155 = 0; _key155 < _len155; _key155++)
    args[_key155] = arguments[_key155];
  return remoteCall("getIngredients", args, {});
}
function getInventory() {
  for (var _len156 = arguments.length, args = new Array(_len156), _key156 = 0; _key156 < _len156; _key156++)
    args[_key156] = arguments[_key156];
  return remoteCall("getInventory", args, {});
}
function getLocationMonsters() {
  for (var _len157 = arguments.length, args = new Array(_len157), _key157 = 0; _key157 < _len157; _key157++)
    args[_key157] = arguments[_key157];
  return remoteCall("getLocationMonsters", args, {});
}
function getLocketMonsters() {
  for (var _len158 = arguments.length, args = new Array(_len158), _key158 = 0; _key158 < _len158; _key158++)
    args[_key158] = arguments[_key158];
  return remoteCall("getLocketMonsters", args, {});
}
function getMonsterMapping() {
  for (var _len159 = arguments.length, args = new Array(_len159), _key159 = 0; _key159 < _len159; _key159++)
    args[_key159] = arguments[_key159];
  return remoteCall("getMonsterMapping", args, {});
}
function getMonsters() {
  for (var _len160 = arguments.length, args = new Array(_len160), _key160 = 0; _key160 < _len160; _key160++)
    args[_key160] = arguments[_key160];
  return remoteCall("getMonsters", args, []);
}
function getMoods() {
  for (var _len161 = arguments.length, args = new Array(_len161), _key161 = 0; _key161 < _len161; _key161++)
    args[_key161] = arguments[_key161];
  return remoteCall("getMoods", args, []);
}
function getOutfits() {
  for (var _len162 = arguments.length, args = new Array(_len162), _key162 = 0; _key162 < _len162; _key162++)
    args[_key162] = arguments[_key162];
  return remoteCall("getOutfits", args, []);
}
function getPath() {
  for (var _len163 = arguments.length, args = new Array(_len163), _key163 = 0; _key163 < _len163; _key163++)
    args[_key163] = arguments[_key163];
  return remoteCall("getPath", args, "");
}
function getPathFull() {
  for (var _len164 = arguments.length, args = new Array(_len164), _key164 = 0; _key164 < _len164; _key164++)
    args[_key164] = arguments[_key164];
  return remoteCall("getPathFull", args, "");
}
function getPathVariables() {
  for (var _len165 = arguments.length, args = new Array(_len165), _key165 = 0; _key165 < _len165; _key165++)
    args[_key165] = arguments[_key165];
  return remoteCall("getPathVariables", args, "");
}
function getPermedSkills() {
  for (var _len166 = arguments.length, args = new Array(_len166), _key166 = 0; _key166 < _len166; _key166++)
    args[_key166] = arguments[_key166];
  return remoteCall("getPermedSkills", args, {});
}
function getPlayerId() {
  for (var _len167 = arguments.length, args = new Array(_len167), _key167 = 0; _key167 < _len167; _key167++)
    args[_key167] = arguments[_key167];
  return remoteCall("getPlayerId", args, "");
}
function getPlayerName() {
  for (var _len168 = arguments.length, args = new Array(_len168), _key168 = 0; _key168 < _len168; _key168++)
    args[_key168] = arguments[_key168];
  return remoteCall("getPlayerName", args, "");
}
function getPower() {
  for (var _len169 = arguments.length, args = new Array(_len169), _key169 = 0; _key169 < _len169; _key169++)
    args[_key169] = arguments[_key169];
  return remoteCall("getPower", args, 0);
}
function getProperty() {
  for (var _len170 = arguments.length, args = new Array(_len170), _key170 = 0; _key170 < _len170; _key170++)
    args[_key170] = arguments[_key170];
  return remoteCall("getProperty", args, "");
}
function getRelated() {
  for (var _len171 = arguments.length, args = new Array(_len171), _key171 = 0; _key171 < _len171; _key171++)
    args[_key171] = arguments[_key171];
  return remoteCall("getRelated", args, {});
}
function getRevision() {
  for (var _len172 = arguments.length, args = new Array(_len172), _key172 = 0; _key172 < _len172; _key172++)
    args[_key172] = arguments[_key172];
  return remoteCall("getRevision", args, 0);
}
function getShop() {
  for (var _len173 = arguments.length, args = new Array(_len173), _key173 = 0; _key173 < _len173; _key173++)
    args[_key173] = arguments[_key173];
  return remoteCall("getShop", args, {});
}
function getShopLog() {
  for (var _len174 = arguments.length, args = new Array(_len174), _key174 = 0; _key174 < _len174; _key174++)
    args[_key174] = arguments[_key174];
  return remoteCall("getShopLog", args, []);
}
function getStackTrace() {
  for (var _len175 = arguments.length, args = new Array(_len175), _key175 = 0; _key175 < _len175; _key175++)
    args[_key175] = arguments[_key175];
  return remoteCall("getStackTrace", args, {
    file: "",
    name: "",
    line: 0
  });
}
function getStash() {
  for (var _len176 = arguments.length, args = new Array(_len176), _key176 = 0; _key176 < _len176; _key176++)
    args[_key176] = arguments[_key176];
  return remoteCall("getStash", args, {});
}
function getStorage() {
  for (var _len177 = arguments.length, args = new Array(_len177), _key177 = 0; _key177 < _len177; _key177++)
    args[_key177] = arguments[_key177];
  return remoteCall("getStorage", args, {});
}
function getVersion() {
  for (var _len178 = arguments.length, args = new Array(_len178), _key178 = 0; _key178 < _len178; _key178++)
    args[_key178] = arguments[_key178];
  return remoteCall("getVersion", args, "");
}
function getWorkshed() {
  for (var _len179 = arguments.length, args = new Array(_len179), _key179 = 0; _key179 < _len179; _key179++)
    args[_key179] = arguments[_key179];
  return remoteCall("getWorkshed", args, makePlaceholder("Item", "none"));
}
function getZapWand() {
  for (var _len180 = arguments.length, args = new Array(_len180), _key180 = 0; _key180 < _len180; _key180++)
    args[_key180] = arguments[_key180];
  return remoteCall("getZapWand", args, makePlaceholder("Item", "none"));
}
function gitAtHead() {
  for (var _len181 = arguments.length, args = new Array(_len181), _key181 = 0; _key181 < _len181; _key181++)
    args[_key181] = arguments[_key181];
  return remoteCall("gitAtHead", args, !1);
}
function gitExists() {
  for (var _len182 = arguments.length, args = new Array(_len182), _key182 = 0; _key182 < _len182; _key182++)
    args[_key182] = arguments[_key182];
  return remoteCall("gitExists", args, !1);
}
function gitInfo() {
  for (var _len183 = arguments.length, args = new Array(_len183), _key183 = 0; _key183 < _len183; _key183++)
    args[_key183] = arguments[_key183];
  return remoteCall("gitInfo", args, {
    url: "",
    branch: "",
    commit: "",
    last_changed_author: "",
    last_changed_date: ""
  });
}
function gitList() {
  for (var _len184 = arguments.length, args = new Array(_len184), _key184 = 0; _key184 < _len184; _key184++)
    args[_key184] = arguments[_key184];
  return remoteCall("gitList", args, []);
}
function gnomadsAvailable() {
  for (var _len185 = arguments.length, args = new Array(_len185), _key185 = 0; _key185 < _len185; _key185++)
    args[_key185] = arguments[_key185];
  return remoteCall("gnomadsAvailable", args, !1);
}
function goalExists() {
  for (var _len186 = arguments.length, args = new Array(_len186), _key186 = 0; _key186 < _len186; _key186++)
    args[_key186] = arguments[_key186];
  return remoteCall("goalExists", args, !1);
}
function groupString() {
  for (var _len187 = arguments.length, args = new Array(_len187), _key187 = 0; _key187 < _len187; _key187++)
    args[_key187] = arguments[_key187];
  return remoteCall("groupString", args, {});
}
function guildAvailable() {
  for (var _len188 = arguments.length, args = new Array(_len188), _key188 = 0; _key188 < _len188; _key188++)
    args[_key188] = arguments[_key188];
  return remoteCall("guildAvailable", args, !1);
}
function guildStoreAvailable() {
  for (var _len189 = arguments.length, args = new Array(_len189), _key189 = 0; _key189 < _len189; _key189++)
    args[_key189] = arguments[_key189];
  return remoteCall("guildStoreAvailable", args, !1);
}
function handlingChoice() {
  for (var _len190 = arguments.length, args = new Array(_len190), _key190 = 0; _key190 < _len190; _key190++)
    args[_key190] = arguments[_key190];
  return remoteCall("handlingChoice", args, !1);
}
function haveBartender() {
  for (var _len191 = arguments.length, args = new Array(_len191), _key191 = 0; _key191 < _len191; _key191++)
    args[_key191] = arguments[_key191];
  return remoteCall("haveBartender", args, !1);
}
function haveChef() {
  for (var _len192 = arguments.length, args = new Array(_len192), _key192 = 0; _key192 < _len192; _key192++)
    args[_key192] = arguments[_key192];
  return remoteCall("haveChef", args, !1);
}
function haveDisplay() {
  for (var _len193 = arguments.length, args = new Array(_len193), _key193 = 0; _key193 < _len193; _key193++)
    args[_key193] = arguments[_key193];
  return remoteCall("haveDisplay", args, !1);
}
function haveEffect() {
  for (var _len194 = arguments.length, args = new Array(_len194), _key194 = 0; _key194 < _len194; _key194++)
    args[_key194] = arguments[_key194];
  return remoteCall("haveEffect", args, 0);
}
function haveEquipped() {
  for (var _len195 = arguments.length, args = new Array(_len195), _key195 = 0; _key195 < _len195; _key195++)
    args[_key195] = arguments[_key195];
  return remoteCall("haveEquipped", args, !1);
}
function haveFamiliar() {
  for (var _len196 = arguments.length, args = new Array(_len196), _key196 = 0; _key196 < _len196; _key196++)
    args[_key196] = arguments[_key196];
  return remoteCall("haveFamiliar", args, !1);
}
function haveMushroomPlot() {
  for (var _len197 = arguments.length, args = new Array(_len197), _key197 = 0; _key197 < _len197; _key197++)
    args[_key197] = arguments[_key197];
  return remoteCall("haveMushroomPlot", args, !1);
}
function haveOutfit() {
  for (var _len198 = arguments.length, args = new Array(_len198), _key198 = 0; _key198 < _len198; _key198++)
    args[_key198] = arguments[_key198];
  return remoteCall("haveOutfit", args, !1);
}
function haveServant() {
  for (var _len199 = arguments.length, args = new Array(_len199), _key199 = 0; _key199 < _len199; _key199++)
    args[_key199] = arguments[_key199];
  return remoteCall("haveServant", args, !1);
}
function haveShop() {
  for (var _len200 = arguments.length, args = new Array(_len200), _key200 = 0; _key200 < _len200; _key200++)
    args[_key200] = arguments[_key200];
  return remoteCall("haveShop", args, !1);
}
function haveSkill() {
  for (var _len201 = arguments.length, args = new Array(_len201), _key201 = 0; _key201 < _len201; _key201++)
    args[_key201] = arguments[_key201];
  return remoteCall("haveSkill", args, !1);
}
function hedgeMaze() {
  for (var _len202 = arguments.length, args = new Array(_len202), _key202 = 0; _key202 < _len202; _key202++)
    args[_key202] = arguments[_key202];
  return remoteCall("hedgeMaze", args, !1);
}
function heist() {
  for (var _len203 = arguments.length, args = new Array(_len203), _key203 = 0; _key203 < _len203; _key203++)
    args[_key203] = arguments[_key203];
  return remoteCall("heist", args, !1);
}
function heistTargets() {
  for (var _len204 = arguments.length, args = new Array(_len204), _key204 = 0; _key204 < _len204; _key204++)
    args[_key204] = arguments[_key204];
  return remoteCall("heistTargets", args, {});
}
function hermit() {
  for (var _len205 = arguments.length, args = new Array(_len205), _key205 = 0; _key205 < _len205; _key205++)
    args[_key205] = arguments[_key205];
  return remoteCall("hermit", args, !1);
}
function hiddenTempleUnlocked() {
  for (var _len206 = arguments.length, args = new Array(_len206), _key206 = 0; _key206 < _len206; _key206++)
    args[_key206] = arguments[_key206];
  return remoteCall("hiddenTempleUnlocked", args, !1);
}
function hippyStoneBroken() {
  for (var _len207 = arguments.length, args = new Array(_len207), _key207 = 0; _key207 < _len207; _key207++)
    args[_key207] = arguments[_key207];
  return remoteCall("hippyStoneBroken", args, !1);
}
function hippyStoreAvailable() {
  for (var _len208 = arguments.length, args = new Array(_len208), _key208 = 0; _key208 < _len208; _key208++)
    args[_key208] = arguments[_key208];
  return remoteCall("hippyStoreAvailable", args, !1);
}
function historicalAge() {
  for (var _len209 = arguments.length, args = new Array(_len209), _key209 = 0; _key209 < _len209; _key209++)
    args[_key209] = arguments[_key209];
  return remoteCall("historicalAge", args, 0);
}
function historicalPrice() {
  for (var _len210 = arguments.length, args = new Array(_len210), _key210 = 0; _key210 < _len210; _key210++)
    args[_key210] = arguments[_key210];
  return remoteCall("historicalPrice", args, 0);
}
function holiday() {
  for (var _len211 = arguments.length, args = new Array(_len211), _key211 = 0; _key211 < _len211; _key211++)
    args[_key211] = arguments[_key211];
  return remoteCall("holiday", args, "");
}
function hpCost() {
  for (var _len212 = arguments.length, args = new Array(_len212), _key212 = 0; _key212 < _len212; _key212++)
    args[_key212] = arguments[_key212];
  return remoteCall("hpCost", args, 0);
}
function imageToMonster() {
  for (var _len213 = arguments.length, args = new Array(_len213), _key213 = 0; _key213 < _len213; _key213++)
    args[_key213] = arguments[_key213];
  return remoteCall("imageToMonster", args, makePlaceholder("Monster", "none"));
}
function inBadMoon() {
  for (var _len214 = arguments.length, args = new Array(_len214), _key214 = 0; _key214 < _len214; _key214++)
    args[_key214] = arguments[_key214];
  return remoteCall("inBadMoon", args, !1);
}
function inCasual() {
  for (var _len215 = arguments.length, args = new Array(_len215), _key215 = 0; _key215 < _len215; _key215++)
    args[_key215] = arguments[_key215];
  return remoteCall("inCasual", args, !1);
}
function inHardcore() {
  for (var _len216 = arguments.length, args = new Array(_len216), _key216 = 0; _key216 < _len216; _key216++)
    args[_key216] = arguments[_key216];
  return remoteCall("inHardcore", args, !1);
}
function inMoxieSign() {
  for (var _len217 = arguments.length, args = new Array(_len217), _key217 = 0; _key217 < _len217; _key217++)
    args[_key217] = arguments[_key217];
  return remoteCall("inMoxieSign", args, !1);
}
function inMultiFight() {
  for (var _len218 = arguments.length, args = new Array(_len218), _key218 = 0; _key218 < _len218; _key218++)
    args[_key218] = arguments[_key218];
  return remoteCall("inMultiFight", args, !1);
}
function inMuscleSign() {
  for (var _len219 = arguments.length, args = new Array(_len219), _key219 = 0; _key219 < _len219; _key219++)
    args[_key219] = arguments[_key219];
  return remoteCall("inMuscleSign", args, !1);
}
function inMysticalitySign() {
  for (var _len220 = arguments.length, args = new Array(_len220), _key220 = 0; _key220 < _len220; _key220++)
    args[_key220] = arguments[_key220];
  return remoteCall("inMysticalitySign", args, !1);
}
function inTerrarium() {
  for (var _len221 = arguments.length, args = new Array(_len221), _key221 = 0; _key221 < _len221; _key221++)
    args[_key221] = arguments[_key221];
  return remoteCall("inTerrarium", args, !1);
}
function inaccessibleReason() {
  for (var _len222 = arguments.length, args = new Array(_len222), _key222 = 0; _key222 < _len222; _key222++)
    args[_key222] = arguments[_key222];
  return remoteCall("inaccessibleReason", args, "");
}
function indexOf() {
  for (var _len223 = arguments.length, args = new Array(_len223), _key223 = 0; _key223 < _len223; _key223++)
    args[_key223] = arguments[_key223];
  return remoteCall("indexOf", args, 0);
}
function inebrietyLimit() {
  for (var _len224 = arguments.length, args = new Array(_len224), _key224 = 0; _key224 < _len224; _key224++)
    args[_key224] = arguments[_key224];
  return remoteCall("inebrietyLimit", args, 0);
}
function initiativeModifier() {
  for (var _len225 = arguments.length, args = new Array(_len225), _key225 = 0; _key225 < _len225; _key225++)
    args[_key225] = arguments[_key225];
  return remoteCall("initiativeModifier", args, 0);
}
function insert() {
  for (var _len226 = arguments.length, args = new Array(_len226), _key226 = 0; _key226 < _len226; _key226++)
    args[_key226] = arguments[_key226];
  return remoteCall("insert", args, "");
}
function isAccessible() {
  for (var _len227 = arguments.length, args = new Array(_len227), _key227 = 0; _key227 < _len227; _key227++)
    args[_key227] = arguments[_key227];
  return remoteCall("isAccessible", args, !1);
}
function isBanished() {
  for (var _len228 = arguments.length, args = new Array(_len228), _key228 = 0; _key228 < _len228; _key228++)
    args[_key228] = arguments[_key228];
  return remoteCall("isBanished", args, !1);
}
function isCoinmasterItem() {
  for (var _len229 = arguments.length, args = new Array(_len229), _key229 = 0; _key229 < _len229; _key229++)
    args[_key229] = arguments[_key229];
  return remoteCall("isCoinmasterItem", args, !1);
}
function isDarkMode() {
  for (var _len230 = arguments.length, args = new Array(_len230), _key230 = 0; _key230 < _len230; _key230++)
    args[_key230] = arguments[_key230];
  return remoteCall("isDarkMode", args, !1);
}
function isDiscardable() {
  for (var _len231 = arguments.length, args = new Array(_len231), _key231 = 0; _key231 < _len231; _key231++)
    args[_key231] = arguments[_key231];
  return remoteCall("isDiscardable", args, !1);
}
function isDisplayable() {
  for (var _len232 = arguments.length, args = new Array(_len232), _key232 = 0; _key232 < _len232; _key232++)
    args[_key232] = arguments[_key232];
  return remoteCall("isDisplayable", args, !1);
}
function isFamiliarEquipmentLocked() {
  for (var _len233 = arguments.length, args = new Array(_len233), _key233 = 0; _key233 < _len233; _key233++)
    args[_key233] = arguments[_key233];
  return remoteCall("isFamiliarEquipmentLocked", args, !1);
}
function isGiftable() {
  for (var _len234 = arguments.length, args = new Array(_len234), _key234 = 0; _key234 < _len234; _key234++)
    args[_key234] = arguments[_key234];
  return remoteCall("isGiftable", args, !1);
}
function isGoal() {
  for (var _len235 = arguments.length, args = new Array(_len235), _key235 = 0; _key235 < _len235; _key235++)
    args[_key235] = arguments[_key235];
  return remoteCall("isGoal", args, !1);
}
function isHeadless() {
  for (var _len236 = arguments.length, args = new Array(_len236), _key236 = 0; _key236 < _len236; _key236++)
    args[_key236] = arguments[_key236];
  return remoteCall("isHeadless", args, !1);
}
function isInteger() {
  for (var _len237 = arguments.length, args = new Array(_len237), _key237 = 0; _key237 < _len237; _key237++)
    args[_key237] = arguments[_key237];
  return remoteCall("isInteger", args, !1);
}
function isNpcItem() {
  for (var _len238 = arguments.length, args = new Array(_len238), _key238 = 0; _key238 < _len238; _key238++)
    args[_key238] = arguments[_key238];
  return remoteCall("isNpcItem", args, !1);
}
function isOnline() {
  for (var _len239 = arguments.length, args = new Array(_len239), _key239 = 0; _key239 < _len239; _key239++)
    args[_key239] = arguments[_key239];
  return remoteCall("isOnline", args, !1);
}
function isTradeable() {
  for (var _len240 = arguments.length, args = new Array(_len240), _key240 = 0; _key240 < _len240; _key240++)
    args[_key240] = arguments[_key240];
  return remoteCall("isTradeable", args, !1);
}
function isTrendy() {
  for (var _len241 = arguments.length, args = new Array(_len241), _key241 = 0; _key241 < _len241; _key241++)
    args[_key241] = arguments[_key241];
  return remoteCall("isTrendy", args, !1);
}
function isUnrestricted() {
  for (var _len242 = arguments.length, args = new Array(_len242), _key242 = 0; _key242 < _len242; _key242++)
    args[_key242] = arguments[_key242];
  return remoteCall("isUnrestricted", args, !1);
}
function isWearingOutfit() {
  for (var _len243 = arguments.length, args = new Array(_len243), _key243 = 0; _key243 < _len243; _key243++)
    args[_key243] = arguments[_key243];
  return remoteCall("isWearingOutfit", args, !1);
}
function itemAmount() {
  for (var _len244 = arguments.length, args = new Array(_len244), _key244 = 0; _key244 < _len244; _key244++)
    args[_key244] = arguments[_key244];
  return remoteCall("itemAmount", args, 0);
}
function itemDropModifier() {
  for (var _len245 = arguments.length, args = new Array(_len245), _key245 = 0; _key245 < _len245; _key245++)
    args[_key245] = arguments[_key245];
  return remoteCall("itemDropModifier", args, 0);
}
function itemDrops() {
  for (var _len246 = arguments.length, args = new Array(_len246), _key246 = 0; _key246 < _len246; _key246++)
    args[_key246] = arguments[_key246];
  return remoteCall("itemDrops", args, {});
}
function itemDropsArray() {
  for (var _len247 = arguments.length, args = new Array(_len247), _key247 = 0; _key247 < _len247; _key247++)
    args[_key247] = arguments[_key247];
  return remoteCall("itemDropsArray", args, {
    drop: makePlaceholder("Item", "none"),
    rate: 0,
    type: ""
  });
}
function itemPockets() {
  for (var _len248 = arguments.length, args = new Array(_len248), _key248 = 0; _key248 < _len248; _key248++)
    args[_key248] = arguments[_key248];
  return remoteCall("itemPockets", args, {});
}
function itemType() {
  for (var _len249 = arguments.length, args = new Array(_len249), _key249 = 0; _key249 < _len249; _key249++)
    args[_key249] = arguments[_key249];
  return remoteCall("itemType", args, "");
}
function joinStrings() {
  for (var _len250 = arguments.length, args = new Array(_len250), _key250 = 0; _key250 < _len250; _key250++)
    args[_key250] = arguments[_key250];
  return remoteCall("joinStrings", args, "");
}
function jokePockets() {
  for (var _len251 = arguments.length, args = new Array(_len251), _key251 = 0; _key251 < _len251; _key251++)
    args[_key251] = arguments[_key251];
  return remoteCall("jokePockets", args, {});
}
function jumpChance() {
  for (var _len252 = arguments.length, args = new Array(_len252), _key252 = 0; _key252 < _len252; _key252++)
    args[_key252] = arguments[_key252];
  return remoteCall("jumpChance", args, 0);
}
function knollAvailable() {
  for (var _len253 = arguments.length, args = new Array(_len253), _key253 = 0; _key253 < _len253; _key253++)
    args[_key253] = arguments[_key253];
  return remoteCall("knollAvailable", args, !1);
}
function lastChoice() {
  for (var _len254 = arguments.length, args = new Array(_len254), _key254 = 0; _key254 < _len254; _key254++)
    args[_key254] = arguments[_key254];
  return remoteCall("lastChoice", args, 0);
}
function lastDecision() {
  for (var _len255 = arguments.length, args = new Array(_len255), _key255 = 0; _key255 < _len255; _key255++)
    args[_key255] = arguments[_key255];
  return remoteCall("lastDecision", args, 0);
}
function lastIndexOf() {
  for (var _len256 = arguments.length, args = new Array(_len256), _key256 = 0; _key256 < _len256; _key256++)
    args[_key256] = arguments[_key256];
  return remoteCall("lastIndexOf", args, 0);
}
function lastItemMessage() {
  for (var _len257 = arguments.length, args = new Array(_len257), _key257 = 0; _key257 < _len257; _key257++)
    args[_key257] = arguments[_key257];
  return remoteCall("lastItemMessage", args, "");
}
function lastMonster() {
  for (var _len258 = arguments.length, args = new Array(_len258), _key258 = 0; _key258 < _len258; _key258++)
    args[_key258] = arguments[_key258];
  return remoteCall("lastMonster", args, makePlaceholder("Monster", "none"));
}
function lastSkillMessage() {
  for (var _len259 = arguments.length, args = new Array(_len259), _key259 = 0; _key259 < _len259; _key259++)
    args[_key259] = arguments[_key259];
  return remoteCall("lastSkillMessage", args, "");
}
function leetify() {
  for (var _len260 = arguments.length, args = new Array(_len260), _key260 = 0; _key260 < _len260; _key260++)
    args[_key260] = arguments[_key260];
  return remoteCall("leetify", args, "");
}
function length() {
  for (var _len261 = arguments.length, args = new Array(_len261), _key261 = 0; _key261 < _len261; _key261++)
    args[_key261] = arguments[_key261];
  return remoteCall("length", args, 0);
}
function lightningCost() {
  for (var _len262 = arguments.length, args = new Array(_len262), _key262 = 0; _key262 < _len262; _key262++)
    args[_key262] = arguments[_key262];
  return remoteCall("lightningCost", args, 0);
}
function limitMode() {
  for (var _len263 = arguments.length, args = new Array(_len263), _key263 = 0; _key263 < _len263; _key263++)
    args[_key263] = arguments[_key263];
  return remoteCall("limitMode", args, "");
}
function loadHtml() {
  for (var _len264 = arguments.length, args = new Array(_len264), _key264 = 0; _key264 < _len264; _key264++)
    args[_key264] = arguments[_key264];
  return remoteCall("loadHtml", args, "");
}
function lockFamiliarEquipment() {
  for (var _len265 = arguments.length, args = new Array(_len265), _key265 = 0; _key265 < _len265; _key265++)
    args[_key265] = arguments[_key265];
  return remoteCall("lockFamiliarEquipment", args);
}
function logN() {
  for (var _len266 = arguments.length, args = new Array(_len266), _key266 = 0; _key266 < _len266; _key266++)
    args[_key266] = arguments[_key266];
  return remoteCall("logN", args, 0);
}
function logprint() {
  for (var _len267 = arguments.length, args = new Array(_len267), _key267 = 0; _key267 < _len267; _key267++)
    args[_key267] = arguments[_key267];
  return remoteCall("logprint", args);
}
function makeUrl() {
  for (var _len268 = arguments.length, args = new Array(_len268), _key268 = 0; _key268 < _len268; _key268++)
    args[_key268] = arguments[_key268];
  return remoteCall("makeUrl", args, "");
}
function mallPrice() {
  for (var _len269 = arguments.length, args = new Array(_len269), _key269 = 0; _key269 < _len269; _key269++)
    args[_key269] = arguments[_key269];
  return remoteCall("mallPrice", args, 0);
}
function mallPrices() {
  for (var _len270 = arguments.length, args = new Array(_len270), _key270 = 0; _key270 < _len270; _key270++)
    args[_key270] = arguments[_key270];
  return remoteCall("mallPrices", args, 0);
}
function manaCostModifier() {
  for (var _len271 = arguments.length, args = new Array(_len271), _key271 = 0; _key271 < _len271; _key271++)
    args[_key271] = arguments[_key271];
  return remoteCall("manaCostModifier", args, 0);
}
function mapToFile() {
  for (var _len272 = arguments.length, args = new Array(_len272), _key272 = 0; _key272 < _len272; _key272++)
    args[_key272] = arguments[_key272];
  return remoteCall("mapToFile", args, !1);
}
function max() {
  for (var _len273 = arguments.length, args = new Array(_len273), _key273 = 0; _key273 < _len273; _key273++)
    args[_key273] = arguments[_key273];
  return remoteCall("max", args, 0);
}
function maximize() {
  for (var _len274 = arguments.length, args = new Array(_len274), _key274 = 0; _key274 < _len274; _key274++)
    args[_key274] = arguments[_key274];
  return remoteCall("maximize", args, !1);
}
function meatDrop() {
  for (var _len275 = arguments.length, args = new Array(_len275), _key275 = 0; _key275 < _len275; _key275++)
    args[_key275] = arguments[_key275];
  return remoteCall("meatDrop", args, 0);
}
function meatDropModifier() {
  for (var _len276 = arguments.length, args = new Array(_len276), _key276 = 0; _key276 < _len276; _key276++)
    args[_key276] = arguments[_key276];
  return remoteCall("meatDropModifier", args, 0);
}
function meatPockets() {
  for (var _len277 = arguments.length, args = new Array(_len277), _key277 = 0; _key277 < _len277; _key277++)
    args[_key277] = arguments[_key277];
  return remoteCall("meatPockets", args, {});
}
function min() {
  for (var _len278 = arguments.length, args = new Array(_len278), _key278 = 0; _key278 < _len278; _key278++)
    args[_key278] = arguments[_key278];
  return remoteCall("min", args, 0);
}
function minstrelInstrument() {
  for (var _len279 = arguments.length, args = new Array(_len279), _key279 = 0; _key279 < _len279; _key279++)
    args[_key279] = arguments[_key279];
  return remoteCall("minstrelInstrument", args, makePlaceholder("Item", "none"));
}
function minstrelLevel() {
  for (var _len280 = arguments.length, args = new Array(_len280), _key280 = 0; _key280 < _len280; _key280++)
    args[_key280] = arguments[_key280];
  return remoteCall("minstrelLevel", args, 0);
}
function minstrelQuest() {
  for (var _len281 = arguments.length, args = new Array(_len281), _key281 = 0; _key281 < _len281; _key281++)
    args[_key281] = arguments[_key281];
  return remoteCall("minstrelQuest", args, !1);
}
function modifierEval() {
  for (var _len282 = arguments.length, args = new Array(_len282), _key282 = 0; _key282 < _len282; _key282++)
    args[_key282] = arguments[_key282];
  return remoteCall("modifierEval", args, 0);
}
function monkeyPaw() {
  for (var _len283 = arguments.length, args = new Array(_len283), _key283 = 0; _key283 < _len283; _key283++)
    args[_key283] = arguments[_key283];
  return remoteCall("monkeyPaw", args, !1);
}
function monsterAttack() {
  for (var _len284 = arguments.length, args = new Array(_len284), _key284 = 0; _key284 < _len284; _key284++)
    args[_key284] = arguments[_key284];
  return remoteCall("monsterAttack", args, 0);
}
function monsterDefense() {
  for (var _len285 = arguments.length, args = new Array(_len285), _key285 = 0; _key285 < _len285; _key285++)
    args[_key285] = arguments[_key285];
  return remoteCall("monsterDefense", args, 0);
}
function monsterElement() {
  for (var _len286 = arguments.length, args = new Array(_len286), _key286 = 0; _key286 < _len286; _key286++)
    args[_key286] = arguments[_key286];
  return remoteCall("monsterElement", args, makePlaceholder("Element", "none"));
}
function monsterEval() {
  for (var _len287 = arguments.length, args = new Array(_len287), _key287 = 0; _key287 < _len287; _key287++)
    args[_key287] = arguments[_key287];
  return remoteCall("monsterEval", args, 0);
}
function monsterFactoidsAvailable() {
  for (var _len288 = arguments.length, args = new Array(_len288), _key288 = 0; _key288 < _len288; _key288++)
    args[_key288] = arguments[_key288];
  return remoteCall("monsterFactoidsAvailable", args, 0);
}
function monsterHp() {
  for (var _len289 = arguments.length, args = new Array(_len289), _key289 = 0; _key289 < _len289; _key289++)
    args[_key289] = arguments[_key289];
  return remoteCall("monsterHp", args, 0);
}
function monsterInitiative() {
  for (var _len290 = arguments.length, args = new Array(_len290), _key290 = 0; _key290 < _len290; _key290++)
    args[_key290] = arguments[_key290];
  return remoteCall("monsterInitiative", args, 0);
}
function monsterLevelAdjustment() {
  for (var _len291 = arguments.length, args = new Array(_len291), _key291 = 0; _key291 < _len291; _key291++)
    args[_key291] = arguments[_key291];
  return remoteCall("monsterLevelAdjustment", args, 0);
}
function monsterManuelText() {
  for (var _len292 = arguments.length, args = new Array(_len292), _key292 = 0; _key292 < _len292; _key292++)
    args[_key292] = arguments[_key292];
  return remoteCall("monsterManuelText", args, "");
}
function monsterModifier() {
  for (var _len293 = arguments.length, args = new Array(_len293), _key293 = 0; _key293 < _len293; _key293++)
    args[_key293] = arguments[_key293];
  return remoteCall("monsterModifier", args, makePlaceholder("Monster", "none"));
}
function monsterPhylum() {
  for (var _len294 = arguments.length, args = new Array(_len294), _key294 = 0; _key294 < _len294; _key294++)
    args[_key294] = arguments[_key294];
  return remoteCall("monsterPhylum", args, makePlaceholder("Phylum", "none"));
}
function monsterPockets() {
  for (var _len295 = arguments.length, args = new Array(_len295), _key295 = 0; _key295 < _len295; _key295++)
    args[_key295] = arguments[_key295];
  return remoteCall("monsterPockets", args, {});
}
function moodExecute() {
  for (var _len296 = arguments.length, args = new Array(_len296), _key296 = 0; _key296 < _len296; _key296++)
    args[_key296] = arguments[_key296];
  return remoteCall("moodExecute", args);
}
function moodList() {
  for (var _len297 = arguments.length, args = new Array(_len297), _key297 = 0; _key297 < _len297; _key297++)
    args[_key297] = arguments[_key297];
  return remoteCall("moodList", args, []);
}
function moonLight() {
  for (var _len298 = arguments.length, args = new Array(_len298), _key298 = 0; _key298 < _len298; _key298++)
    args[_key298] = arguments[_key298];
  return remoteCall("moonLight", args, 0);
}
function moonPhase() {
  for (var _len299 = arguments.length, args = new Array(_len299), _key299 = 0; _key299 < _len299; _key299++)
    args[_key299] = arguments[_key299];
  return remoteCall("moonPhase", args, 0);
}
function mpCost() {
  for (var _len300 = arguments.length, args = new Array(_len300), _key300 = 0; _key300 < _len300; _key300++)
    args[_key300] = arguments[_key300];
  return remoteCall("mpCost", args, 0);
}
function myAbsorbs() {
  for (var _len301 = arguments.length, args = new Array(_len301), _key301 = 0; _key301 < _len301; _key301++)
    args[_key301] = arguments[_key301];
  return remoteCall("myAbsorbs", args, 0);
}
function myAdventures() {
  for (var _len302 = arguments.length, args = new Array(_len302), _key302 = 0; _key302 < _len302; _key302++)
    args[_key302] = arguments[_key302];
  return remoteCall("myAdventures", args, 0);
}
function myAscensions() {
  for (var _len303 = arguments.length, args = new Array(_len303), _key303 = 0; _key303 < _len303; _key303++)
    args[_key303] = arguments[_key303];
  return remoteCall("myAscensions", args, 0);
}
function myAudience() {
  for (var _len304 = arguments.length, args = new Array(_len304), _key304 = 0; _key304 < _len304; _key304++)
    args[_key304] = arguments[_key304];
  return remoteCall("myAudience", args, 0);
}
function myBasestat() {
  for (var _len305 = arguments.length, args = new Array(_len305), _key305 = 0; _key305 < _len305; _key305++)
    args[_key305] = arguments[_key305];
  return remoteCall("myBasestat", args, 0);
}
function myBjornedFamiliar() {
  for (var _len306 = arguments.length, args = new Array(_len306), _key306 = 0; _key306 < _len306; _key306++)
    args[_key306] = arguments[_key306];
  return remoteCall("myBjornedFamiliar", args, makePlaceholder("Familiar", "none"));
}
function myBuffedstat() {
  for (var _len307 = arguments.length, args = new Array(_len307), _key307 = 0; _key307 < _len307; _key307++)
    args[_key307] = arguments[_key307];
  return remoteCall("myBuffedstat", args, 0);
}
function myClass() {
  for (var _len308 = arguments.length, args = new Array(_len308), _key308 = 0; _key308 < _len308; _key308++)
    args[_key308] = arguments[_key308];
  return remoteCall("myClass", args, makePlaceholder("Class", "none"));
}
function myClosetMeat() {
  for (var _len309 = arguments.length, args = new Array(_len309), _key309 = 0; _key309 < _len309; _key309++)
    args[_key309] = arguments[_key309];
  return remoteCall("myClosetMeat", args, 0);
}
function myCompanion() {
  for (var _len310 = arguments.length, args = new Array(_len310), _key310 = 0; _key310 < _len310; _key310++)
    args[_key310] = arguments[_key310];
  return remoteCall("myCompanion", args, "");
}
function myDaycount() {
  for (var _len311 = arguments.length, args = new Array(_len311), _key311 = 0; _key311 < _len311; _key311++)
    args[_key311] = arguments[_key311];
  return remoteCall("myDaycount", args, 0);
}
function myDiscomomentum() {
  for (var _len312 = arguments.length, args = new Array(_len312), _key312 = 0; _key312 < _len312; _key312++)
    args[_key312] = arguments[_key312];
  return remoteCall("myDiscomomentum", args, 0);
}
function myEffectiveFamiliar() {
  for (var _len313 = arguments.length, args = new Array(_len313), _key313 = 0; _key313 < _len313; _key313++)
    args[_key313] = arguments[_key313];
  return remoteCall("myEffectiveFamiliar", args, makePlaceholder("Familiar", "none"));
}
function myEffects() {
  for (var _len314 = arguments.length, args = new Array(_len314), _key314 = 0; _key314 < _len314; _key314++)
    args[_key314] = arguments[_key314];
  return remoteCall("myEffects", args, {});
}
function myEnthronedFamiliar() {
  for (var _len315 = arguments.length, args = new Array(_len315), _key315 = 0; _key315 < _len315; _key315++)
    args[_key315] = arguments[_key315];
  return remoteCall("myEnthronedFamiliar", args, makePlaceholder("Familiar", "none"));
}
function myFamiliar() {
  for (var _len316 = arguments.length, args = new Array(_len316), _key316 = 0; _key316 < _len316; _key316++)
    args[_key316] = arguments[_key316];
  return remoteCall("myFamiliar", args, makePlaceholder("Familiar", "none"));
}
function myFullness() {
  for (var _len317 = arguments.length, args = new Array(_len317), _key317 = 0; _key317 < _len317; _key317++)
    args[_key317] = arguments[_key317];
  return remoteCall("myFullness", args, 0);
}
function myFury() {
  for (var _len318 = arguments.length, args = new Array(_len318), _key318 = 0; _key318 < _len318; _key318++)
    args[_key318] = arguments[_key318];
  return remoteCall("myFury", args, 0);
}
function myGardenType() {
  for (var _len319 = arguments.length, args = new Array(_len319), _key319 = 0; _key319 < _len319; _key319++)
    args[_key319] = arguments[_key319];
  return remoteCall("myGardenType", args, "");
}
function myHash() {
  for (var _len320 = arguments.length, args = new Array(_len320), _key320 = 0; _key320 < _len320; _key320++)
    args[_key320] = arguments[_key320];
  return remoteCall("myHash", args, "");
}
function myHp() {
  for (var _len321 = arguments.length, args = new Array(_len321), _key321 = 0; _key321 < _len321; _key321++)
    args[_key321] = arguments[_key321];
  return remoteCall("myHp", args, 0);
}
function myId() {
  for (var _len322 = arguments.length, args = new Array(_len322), _key322 = 0; _key322 < _len322; _key322++)
    args[_key322] = arguments[_key322];
  return remoteCall("myId", args, "");
}
function myInebriety() {
  for (var _len323 = arguments.length, args = new Array(_len323), _key323 = 0; _key323 < _len323; _key323++)
    args[_key323] = arguments[_key323];
  return remoteCall("myInebriety", args, 0);
}
function myLevel() {
  for (var _len324 = arguments.length, args = new Array(_len324), _key324 = 0; _key324 < _len324; _key324++)
    args[_key324] = arguments[_key324];
  return remoteCall("myLevel", args, 0);
}
function myLightning() {
  for (var _len325 = arguments.length, args = new Array(_len325), _key325 = 0; _key325 < _len325; _key325++)
    args[_key325] = arguments[_key325];
  return remoteCall("myLightning", args, 0);
}
function myLocation() {
  for (var _len326 = arguments.length, args = new Array(_len326), _key326 = 0; _key326 < _len326; _key326++)
    args[_key326] = arguments[_key326];
  return remoteCall("myLocation", args, makePlaceholder("Location", "none"));
}
function myMask() {
  for (var _len327 = arguments.length, args = new Array(_len327), _key327 = 0; _key327 < _len327; _key327++)
    args[_key327] = arguments[_key327];
  return remoteCall("myMask", args, "");
}
function myMaxfury() {
  for (var _len328 = arguments.length, args = new Array(_len328), _key328 = 0; _key328 < _len328; _key328++)
    args[_key328] = arguments[_key328];
  return remoteCall("myMaxfury", args, 0);
}
function myMaxhp() {
  for (var _len329 = arguments.length, args = new Array(_len329), _key329 = 0; _key329 < _len329; _key329++)
    args[_key329] = arguments[_key329];
  return remoteCall("myMaxhp", args, 0);
}
function myMaxmp() {
  for (var _len330 = arguments.length, args = new Array(_len330), _key330 = 0; _key330 < _len330; _key330++)
    args[_key330] = arguments[_key330];
  return remoteCall("myMaxmp", args, 0);
}
function myMaxpp() {
  for (var _len331 = arguments.length, args = new Array(_len331), _key331 = 0; _key331 < _len331; _key331++)
    args[_key331] = arguments[_key331];
  return remoteCall("myMaxpp", args, 0);
}
function myMeat() {
  for (var _len332 = arguments.length, args = new Array(_len332), _key332 = 0; _key332 < _len332; _key332++)
    args[_key332] = arguments[_key332];
  return remoteCall("myMeat", args, 0);
}
function myMp() {
  for (var _len333 = arguments.length, args = new Array(_len333), _key333 = 0; _key333 < _len333; _key333++)
    args[_key333] = arguments[_key333];
  return remoteCall("myMp", args, 0);
}
function myName() {
  for (var _len334 = arguments.length, args = new Array(_len334), _key334 = 0; _key334 < _len334; _key334++)
    args[_key334] = arguments[_key334];
  return remoteCall("myName", args, "");
}
function myPath() {
  for (var _len335 = arguments.length, args = new Array(_len335), _key335 = 0; _key335 < _len335; _key335++)
    args[_key335] = arguments[_key335];
  return remoteCall("myPath", args, makePlaceholder("Path", "none"));
}
function myPathId() {
  for (var _len336 = arguments.length, args = new Array(_len336), _key336 = 0; _key336 < _len336; _key336++)
    args[_key336] = arguments[_key336];
  return remoteCall("myPathId", args, 0);
}
function myPokeFam() {
  for (var _len337 = arguments.length, args = new Array(_len337), _key337 = 0; _key337 < _len337; _key337++)
    args[_key337] = arguments[_key337];
  return remoteCall("myPokeFam", args, makePlaceholder("Familiar", "none"));
}
function myPp() {
  for (var _len338 = arguments.length, args = new Array(_len338), _key338 = 0; _key338 < _len338; _key338++)
    args[_key338] = arguments[_key338];
  return remoteCall("myPp", args, 0);
}
function myPrimestat() {
  for (var _len339 = arguments.length, args = new Array(_len339), _key339 = 0; _key339 < _len339; _key339++)
    args[_key339] = arguments[_key339];
  return remoteCall("myPrimestat", args, makePlaceholder("Stat", "none"));
}
function myRain() {
  for (var _len340 = arguments.length, args = new Array(_len340), _key340 = 0; _key340 < _len340; _key340++)
    args[_key340] = arguments[_key340];
  return remoteCall("myRain", args, 0);
}
function myRobotEnergy() {
  for (var _len341 = arguments.length, args = new Array(_len341), _key341 = 0; _key341 < _len341; _key341++)
    args[_key341] = arguments[_key341];
  return remoteCall("myRobotEnergy", args, 0);
}
function myRobotScraps() {
  for (var _len342 = arguments.length, args = new Array(_len342), _key342 = 0; _key342 < _len342; _key342++)
    args[_key342] = arguments[_key342];
  return remoteCall("myRobotScraps", args, 0);
}
function myServant() {
  for (var _len343 = arguments.length, args = new Array(_len343), _key343 = 0; _key343 < _len343; _key343++)
    args[_key343] = arguments[_key343];
  return remoteCall("myServant", args, makePlaceholder("Servant", "none"));
}
function mySessionAdv() {
  for (var _len344 = arguments.length, args = new Array(_len344), _key344 = 0; _key344 < _len344; _key344++)
    args[_key344] = arguments[_key344];
  return remoteCall("mySessionAdv", args, 0);
}
function mySessionItems() {
  for (var _len345 = arguments.length, args = new Array(_len345), _key345 = 0; _key345 < _len345; _key345++)
    args[_key345] = arguments[_key345];
  return remoteCall("mySessionItems", args, {});
}
function mySessionMeat() {
  for (var _len346 = arguments.length, args = new Array(_len346), _key346 = 0; _key346 < _len346; _key346++)
    args[_key346] = arguments[_key346];
  return remoteCall("mySessionMeat", args, 0);
}
function mySessionResults() {
  for (var _len347 = arguments.length, args = new Array(_len347), _key347 = 0; _key347 < _len347; _key347++)
    args[_key347] = arguments[_key347];
  return remoteCall("mySessionResults", args, {});
}
function mySign() {
  for (var _len348 = arguments.length, args = new Array(_len348), _key348 = 0; _key348 < _len348; _key348++)
    args[_key348] = arguments[_key348];
  return remoteCall("mySign", args, "");
}
function mySoulsauce() {
  for (var _len349 = arguments.length, args = new Array(_len349), _key349 = 0; _key349 < _len349; _key349++)
    args[_key349] = arguments[_key349];
  return remoteCall("mySoulsauce", args, 0);
}
function mySpleenUse() {
  for (var _len350 = arguments.length, args = new Array(_len350), _key350 = 0; _key350 < _len350; _key350++)
    args[_key350] = arguments[_key350];
  return remoteCall("mySpleenUse", args, 0);
}
function myStorageMeat() {
  for (var _len351 = arguments.length, args = new Array(_len351), _key351 = 0; _key351 < _len351; _key351++)
    args[_key351] = arguments[_key351];
  return remoteCall("myStorageMeat", args, 0);
}
function myThrall() {
  for (var _len352 = arguments.length, args = new Array(_len352), _key352 = 0; _key352 < _len352; _key352++)
    args[_key352] = arguments[_key352];
  return remoteCall("myThrall", args, makePlaceholder("Thrall", "none"));
}
function myThunder() {
  for (var _len353 = arguments.length, args = new Array(_len353), _key353 = 0; _key353 < _len353; _key353++)
    args[_key353] = arguments[_key353];
  return remoteCall("myThunder", args, 0);
}
function myTotalTurnsSpent() {
  for (var _len354 = arguments.length, args = new Array(_len354), _key354 = 0; _key354 < _len354; _key354++)
    args[_key354] = arguments[_key354];
  return remoteCall("myTotalTurnsSpent", args, 0);
}
function myTurncount() {
  for (var _len355 = arguments.length, args = new Array(_len355), _key355 = 0; _key355 < _len355; _key355++)
    args[_key355] = arguments[_key355];
  return remoteCall("myTurncount", args, 0);
}
function myVykeaCompanion() {
  for (var _len356 = arguments.length, args = new Array(_len356), _key356 = 0; _key356 < _len356; _key356++)
    args[_key356] = arguments[_key356];
  return remoteCall("myVykeaCompanion", args, makePlaceholder("Vykea", "none"));
}
function myWildfireWater() {
  for (var _len357 = arguments.length, args = new Array(_len357), _key357 = 0; _key357 < _len357; _key357++)
    args[_key357] = arguments[_key357];
  return remoteCall("myWildfireWater", args, 0);
}
function nowToInt() {
  for (var _len358 = arguments.length, args = new Array(_len358), _key358 = 0; _key358 < _len358; _key358++)
    args[_key358] = arguments[_key358];
  return remoteCall("nowToInt", args, 0);
}
function nowToString() {
  for (var _len359 = arguments.length, args = new Array(_len359), _key359 = 0; _key359 < _len359; _key359++)
    args[_key359] = arguments[_key359];
  return remoteCall("nowToString", args, "");
}
function npcPrice() {
  for (var _len360 = arguments.length, args = new Array(_len360), _key360 = 0; _key360 < _len360; _key360++)
    args[_key360] = arguments[_key360];
  return remoteCall("npcPrice", args, 0);
}
function numberologyPrize() {
  for (var _len361 = arguments.length, args = new Array(_len361), _key361 = 0; _key361 < _len361; _key361++)
    args[_key361] = arguments[_key361];
  return remoteCall("numberologyPrize", args, "");
}
function numericModifier() {
  for (var _len362 = arguments.length, args = new Array(_len362), _key362 = 0; _key362 < _len362; _key362++)
    args[_key362] = arguments[_key362];
  return remoteCall("numericModifier", args, 0);
}
function outfit() {
  for (var _len363 = arguments.length, args = new Array(_len363), _key363 = 0; _key363 < _len363; _key363++)
    args[_key363] = arguments[_key363];
  return remoteCall("outfit", args, !1);
}
function outfitPieces() {
  for (var _len364 = arguments.length, args = new Array(_len364), _key364 = 0; _key364 < _len364; _key364++)
    args[_key364] = arguments[_key364];
  return remoteCall("outfitPieces", args, []);
}
function outfitTattoo() {
  for (var _len365 = arguments.length, args = new Array(_len365), _key365 = 0; _key365 < _len365; _key365++)
    args[_key365] = arguments[_key365];
  return remoteCall("outfitTattoo", args, "");
}
function outfitTreats() {
  for (var _len366 = arguments.length, args = new Array(_len366), _key366 = 0; _key366 < _len366; _key366++)
    args[_key366] = arguments[_key366];
  return remoteCall("outfitTreats", args, {});
}
function overdrink() {
  for (var _len367 = arguments.length, args = new Array(_len367), _key367 = 0; _key367 < _len367; _key367++)
    args[_key367] = arguments[_key367];
  return remoteCall("overdrink", args, !1);
}
function pathIdToName() {
  for (var _len368 = arguments.length, args = new Array(_len368), _key368 = 0; _key368 < _len368; _key368++)
    args[_key368] = arguments[_key368];
  return remoteCall("pathIdToName", args, "");
}
function pathNameToId() {
  for (var _len369 = arguments.length, args = new Array(_len369), _key369 = 0; _key369 < _len369; _key369++)
    args[_key369] = arguments[_key369];
  return remoteCall("pathNameToId", args, 0);
}
function pickPocket() {
  for (var _len370 = arguments.length, args = new Array(_len370), _key370 = 0; _key370 < _len370; _key370++)
    args[_key370] = arguments[_key370];
  return remoteCall("pickPocket", args, !1);
}
function pickedPockets() {
  for (var _len371 = arguments.length, args = new Array(_len371), _key371 = 0; _key371 < _len371; _key371++)
    args[_key371] = arguments[_key371];
  return remoteCall("pickedPockets", args, {});
}
function pickedScraps() {
  for (var _len372 = arguments.length, args = new Array(_len372), _key372 = 0; _key372 < _len372; _key372++)
    args[_key372] = arguments[_key372];
  return remoteCall("pickedScraps", args, {});
}
function ping() {
  for (var _len373 = arguments.length, args = new Array(_len373), _key373 = 0; _key373 < _len373; _key373++)
    args[_key373] = arguments[_key373];
  return remoteCall("ping", args, {
    page: "",
    count: 0,
    low: 0,
    high: 0,
    total: 0,
    bytes: 0,
    average: 0,
    bps: 0
  });
}
function pocketEffects() {
  for (var _len374 = arguments.length, args = new Array(_len374), _key374 = 0; _key374 < _len374; _key374++)
    args[_key374] = arguments[_key374];
  return remoteCall("pocketEffects", args, {});
}
function pocketItems() {
  for (var _len375 = arguments.length, args = new Array(_len375), _key375 = 0; _key375 < _len375; _key375++)
    args[_key375] = arguments[_key375];
  return remoteCall("pocketItems", args, {});
}
function pocketJoke() {
  for (var _len376 = arguments.length, args = new Array(_len376), _key376 = 0; _key376 < _len376; _key376++)
    args[_key376] = arguments[_key376];
  return remoteCall("pocketJoke", args, "");
}
function pocketMeat() {
  for (var _len377 = arguments.length, args = new Array(_len377), _key377 = 0; _key377 < _len377; _key377++)
    args[_key377] = arguments[_key377];
  return remoteCall("pocketMeat", args, {});
}
function pocketMonster() {
  for (var _len378 = arguments.length, args = new Array(_len378), _key378 = 0; _key378 < _len378; _key378++)
    args[_key378] = arguments[_key378];
  return remoteCall("pocketMonster", args, makePlaceholder("Monster", "none"));
}
function pocketPoem() {
  for (var _len379 = arguments.length, args = new Array(_len379), _key379 = 0; _key379 < _len379; _key379++)
    args[_key379] = arguments[_key379];
  return remoteCall("pocketPoem", args, {});
}
function pocketScrap() {
  for (var _len380 = arguments.length, args = new Array(_len380), _key380 = 0; _key380 < _len380; _key380++)
    args[_key380] = arguments[_key380];
  return remoteCall("pocketScrap", args, {});
}
function pocketStats() {
  for (var _len381 = arguments.length, args = new Array(_len381), _key381 = 0; _key381 < _len381; _key381++)
    args[_key381] = arguments[_key381];
  return remoteCall("pocketStats", args, {});
}
function poemPockets() {
  for (var _len382 = arguments.length, args = new Array(_len382), _key382 = 0; _key382 < _len382; _key382++)
    args[_key382] = arguments[_key382];
  return remoteCall("poemPockets", args, {});
}
function potentialPockets() {
  for (var _len383 = arguments.length, args = new Array(_len383), _key383 = 0; _key383 < _len383; _key383++)
    args[_key383] = arguments[_key383];
  return remoteCall("potentialPockets", args, {});
}
function preValidateAdventure() {
  for (var _len384 = arguments.length, args = new Array(_len384), _key384 = 0; _key384 < _len384; _key384++)
    args[_key384] = arguments[_key384];
  return remoteCall("preValidateAdventure", args, !1);
}
function prepareForAdventure() {
  for (var _len385 = arguments.length, args = new Array(_len385), _key385 = 0; _key385 < _len385; _key385++)
    args[_key385] = arguments[_key385];
  return remoteCall("prepareForAdventure", args, !1);
}
function print() {
  for (var _len386 = arguments.length, args = new Array(_len386), _key386 = 0; _key386 < _len386; _key386++)
    args[_key386] = arguments[_key386];
  return remoteCall("print", args);
}
function printHtml() {
  for (var _len387 = arguments.length, args = new Array(_len387), _key387 = 0; _key387 < _len387; _key387++)
    args[_key387] = arguments[_key387];
  return remoteCall("printHtml", args);
}
function propertyDefaultValue() {
  for (var _len388 = arguments.length, args = new Array(_len388), _key388 = 0; _key388 < _len388; _key388++)
    args[_key388] = arguments[_key388];
  return remoteCall("propertyDefaultValue", args, "");
}
function propertyExists() {
  for (var _len389 = arguments.length, args = new Array(_len389), _key389 = 0; _key389 < _len389; _key389++)
    args[_key389] = arguments[_key389];
  return remoteCall("propertyExists", args, !1);
}
function propertyHasDefault() {
  for (var _len390 = arguments.length, args = new Array(_len390), _key390 = 0; _key390 < _len390; _key390++)
    args[_key390] = arguments[_key390];
  return remoteCall("propertyHasDefault", args, !1);
}
function pullsRemaining() {
  for (var _len391 = arguments.length, args = new Array(_len391), _key391 = 0; _key391 < _len391; _key391++)
    args[_key391] = arguments[_key391];
  return remoteCall("pullsRemaining", args, 0);
}
function putCloset() {
  for (var _len392 = arguments.length, args = new Array(_len392), _key392 = 0; _key392 < _len392; _key392++)
    args[_key392] = arguments[_key392];
  return remoteCall("putCloset", args, !1);
}
function putDisplay() {
  for (var _len393 = arguments.length, args = new Array(_len393), _key393 = 0; _key393 < _len393; _key393++)
    args[_key393] = arguments[_key393];
  return remoteCall("putDisplay", args, !1);
}
function putShop() {
  for (var _len394 = arguments.length, args = new Array(_len394), _key394 = 0; _key394 < _len394; _key394++)
    args[_key394] = arguments[_key394];
  return remoteCall("putShop", args, !1);
}
function putShopUsingStorage() {
  for (var _len395 = arguments.length, args = new Array(_len395), _key395 = 0; _key395 < _len395; _key395++)
    args[_key395] = arguments[_key395];
  return remoteCall("putShopUsingStorage", args, !1);
}
function putStash() {
  for (var _len396 = arguments.length, args = new Array(_len396), _key396 = 0; _key396 < _len396; _key396++)
    args[_key396] = arguments[_key396];
  return remoteCall("putStash", args, !1);
}
function pvpAttacksLeft() {
  for (var _len397 = arguments.length, args = new Array(_len397), _key397 = 0; _key397 < _len397; _key397++)
    args[_key397] = arguments[_key397];
  return remoteCall("pvpAttacksLeft", args, 0);
}
function rainCost() {
  for (var _len398 = arguments.length, args = new Array(_len398), _key398 = 0; _key398 < _len398; _key398++)
    args[_key398] = arguments[_key398];
  return remoteCall("rainCost", args, 0);
}
function random() {
  for (var _len399 = arguments.length, args = new Array(_len399), _key399 = 0; _key399 < _len399; _key399++)
    args[_key399] = arguments[_key399];
  return remoteCall("random", args, 0);
}
function rawDamageAbsorption() {
  for (var _len400 = arguments.length, args = new Array(_len400), _key400 = 0; _key400 < _len400; _key400++)
    args[_key400] = arguments[_key400];
  return remoteCall("rawDamageAbsorption", args, 0);
}
function readCcs() {
  for (var _len401 = arguments.length, args = new Array(_len401), _key401 = 0; _key401 < _len401; _key401++)
    args[_key401] = arguments[_key401];
  return remoteCall("readCcs", args, "");
}
function receiveFax() {
  for (var _len402 = arguments.length, args = new Array(_len402), _key402 = 0; _key402 < _len402; _key402++)
    args[_key402] = arguments[_key402];
  return remoteCall("receiveFax", args);
}
function refreshShop() {
  for (var _len403 = arguments.length, args = new Array(_len403), _key403 = 0; _key403 < _len403; _key403++)
    args[_key403] = arguments[_key403];
  return remoteCall("refreshShop", args, !1);
}
function refreshStash() {
  for (var _len404 = arguments.length, args = new Array(_len404), _key404 = 0; _key404 < _len404; _key404++)
    args[_key404] = arguments[_key404];
  return remoteCall("refreshStash", args, !1);
}
function refreshStatus() {
  for (var _len405 = arguments.length, args = new Array(_len405), _key405 = 0; _key405 < _len405; _key405++)
    args[_key405] = arguments[_key405];
  return remoteCall("refreshStatus", args, !1);
}
function removeItemCondition() {
  for (var _len406 = arguments.length, args = new Array(_len406), _key406 = 0; _key406 < _len406; _key406++)
    args[_key406] = arguments[_key406];
  return remoteCall("removeItemCondition", args);
}
function removeProperty() {
  for (var _len407 = arguments.length, args = new Array(_len407), _key407 = 0; _key407 < _len407; _key407++)
    args[_key407] = arguments[_key407];
  return remoteCall("removeProperty", args, "");
}
function renameProperty() {
  for (var _len408 = arguments.length, args = new Array(_len408), _key408 = 0; _key408 < _len408; _key408++)
    args[_key408] = arguments[_key408];
  return remoteCall("renameProperty", args, !1);
}
function replace() {
  for (var _len409 = arguments.length, args = new Array(_len409), _key409 = 0; _key409 < _len409; _key409++)
    args[_key409] = arguments[_key409];
  return remoteCall("replace", args, "");
}
function replaceString() {
  for (var _len410 = arguments.length, args = new Array(_len410), _key410 = 0; _key410 < _len410; _key410++)
    args[_key410] = arguments[_key410];
  return remoteCall("replaceString", args, "");
}
function repriceShop() {
  for (var _len411 = arguments.length, args = new Array(_len411), _key411 = 0; _key411 < _len411; _key411++)
    args[_key411] = arguments[_key411];
  return remoteCall("repriceShop", args, !1);
}
function restorationPockets() {
  for (var _len412 = arguments.length, args = new Array(_len412), _key412 = 0; _key412 < _len412; _key412++)
    args[_key412] = arguments[_key412];
  return remoteCall("restorationPockets", args, {});
}
function restoreHp() {
  for (var _len413 = arguments.length, args = new Array(_len413), _key413 = 0; _key413 < _len413; _key413++)
    args[_key413] = arguments[_key413];
  return remoteCall("restoreHp", args, !1);
}
function restoreMp() {
  for (var _len414 = arguments.length, args = new Array(_len414), _key414 = 0; _key414 < _len414; _key414++)
    args[_key414] = arguments[_key414];
  return remoteCall("restoreMp", args, !1);
}
function retrieveItem() {
  for (var _len415 = arguments.length, args = new Array(_len415), _key415 = 0; _key415 < _len415; _key415++)
    args[_key415] = arguments[_key415];
  return remoteCall("retrieveItem", args, !1);
}
function retrievePrice() {
  for (var _len416 = arguments.length, args = new Array(_len416), _key416 = 0; _key416 < _len416; _key416++)
    args[_key416] = arguments[_key416];
  return remoteCall("retrievePrice", args, 0);
}
function reverseNumberology() {
  for (var _len417 = arguments.length, args = new Array(_len417), _key417 = 0; _key417 < _len417; _key417++)
    args[_key417] = arguments[_key417];
  return remoteCall("reverseNumberology", args, {});
}
function rollover() {
  for (var _len418 = arguments.length, args = new Array(_len418), _key418 = 0; _key418 < _len418; _key418++)
    args[_key418] = arguments[_key418];
  return remoteCall("rollover", args, 0);
}
function round() {
  for (var _len419 = arguments.length, args = new Array(_len419), _key419 = 0; _key419 < _len419; _key419++)
    args[_key419] = arguments[_key419];
  return remoteCall("round", args, 0);
}
function runChoice() {
  for (var _len420 = arguments.length, args = new Array(_len420), _key420 = 0; _key420 < _len420; _key420++)
    args[_key420] = arguments[_key420];
  return remoteCall("runChoice", args, "");
}
function runCombat() {
  for (var _len421 = arguments.length, args = new Array(_len421), _key421 = 0; _key421 < _len421; _key421++)
    args[_key421] = arguments[_key421];
  return remoteCall("runCombat", args, "");
}
function runTurn() {
  for (var _len422 = arguments.length, args = new Array(_len422), _key422 = 0; _key422 < _len422; _key422++)
    args[_key422] = arguments[_key422];
  return remoteCall("runTurn", args, "");
}
function runaway() {
  for (var _len423 = arguments.length, args = new Array(_len423), _key423 = 0; _key423 < _len423; _key423++)
    args[_key423] = arguments[_key423];
  return remoteCall("runaway", args, "");
}
function sausageGoblinChance() {
  for (var _len424 = arguments.length, args = new Array(_len424), _key424 = 0; _key424 < _len424; _key424++)
    args[_key424] = arguments[_key424];
  return remoteCall("sausageGoblinChance", args, 0);
}
function scrapPockets() {
  for (var _len425 = arguments.length, args = new Array(_len425), _key425 = 0; _key425 < _len425; _key425++)
    args[_key425] = arguments[_key425];
  return remoteCall("scrapPockets", args, {});
}
function sell() {
  for (var _len426 = arguments.length, args = new Array(_len426), _key426 = 0; _key426 < _len426; _key426++)
    args[_key426] = arguments[_key426];
  return remoteCall("sell", args, !1);
}
function sellPrice() {
  for (var _len427 = arguments.length, args = new Array(_len427), _key427 = 0; _key427 < _len427; _key427++)
    args[_key427] = arguments[_key427];
  return remoteCall("sellPrice", args, 0);
}
function sellsItem() {
  for (var _len428 = arguments.length, args = new Array(_len428), _key428 = 0; _key428 < _len428; _key428++)
    args[_key428] = arguments[_key428];
  return remoteCall("sellsItem", args, !1);
}
function sendFax() {
  for (var _len429 = arguments.length, args = new Array(_len429), _key429 = 0; _key429 < _len429; _key429++)
    args[_key429] = arguments[_key429];
  return remoteCall("sendFax", args);
}
function sessionLogs() {
  for (var _len430 = arguments.length, args = new Array(_len430), _key430 = 0; _key430 < _len430; _key430++)
    args[_key430] = arguments[_key430];
  return remoteCall("sessionLogs", args, []);
}
function setAutoAttack() {
  for (var _len431 = arguments.length, args = new Array(_len431), _key431 = 0; _key431 < _len431; _key431++)
    args[_key431] = arguments[_key431];
  return remoteCall("setAutoAttack", args);
}
function setCcs() {
  for (var _len432 = arguments.length, args = new Array(_len432), _key432 = 0; _key432 < _len432; _key432++)
    args[_key432] = arguments[_key432];
  return remoteCall("setCcs", args, !1);
}
function setLength() {
  for (var _len433 = arguments.length, args = new Array(_len433), _key433 = 0; _key433 < _len433; _key433++)
    args[_key433] = arguments[_key433];
  return remoteCall("setLength", args);
}
function setLocation() {
  for (var _len434 = arguments.length, args = new Array(_len434), _key434 = 0; _key434 < _len434; _key434++)
    args[_key434] = arguments[_key434];
  return remoteCall("setLocation", args);
}
function setProperty() {
  for (var _len435 = arguments.length, args = new Array(_len435), _key435 = 0; _key435 < _len435; _key435++)
    args[_key435] = arguments[_key435];
  return remoteCall("setProperty", args);
}
function shopAmount() {
  for (var _len436 = arguments.length, args = new Array(_len436), _key436 = 0; _key436 < _len436; _key436++)
    args[_key436] = arguments[_key436];
  return remoteCall("shopAmount", args, 0);
}
function shopLimit() {
  for (var _len437 = arguments.length, args = new Array(_len437), _key437 = 0; _key437 < _len437; _key437++)
    args[_key437] = arguments[_key437];
  return remoteCall("shopLimit", args, 0);
}
function shopPrice() {
  for (var _len438 = arguments.length, args = new Array(_len438), _key438 = 0; _key438 < _len438; _key438++)
    args[_key438] = arguments[_key438];
  return remoteCall("shopPrice", args, 0);
}
function skillModifier() {
  for (var _len439 = arguments.length, args = new Array(_len439), _key439 = 0; _key439 < _len439; _key439++)
    args[_key439] = arguments[_key439];
  return remoteCall("skillModifier", args, makePlaceholder("Skill", "none"));
}
function slashCount() {
  for (var _len440 = arguments.length, args = new Array(_len440), _key440 = 0; _key440 < _len440; _key440++)
    args[_key440] = arguments[_key440];
  return remoteCall("slashCount", args, 0);
}
function soulsauceCost() {
  for (var _len441 = arguments.length, args = new Array(_len441), _key441 = 0; _key441 < _len441; _key441++)
    args[_key441] = arguments[_key441];
  return remoteCall("soulsauceCost", args, 0);
}
function spleenLimit() {
  for (var _len442 = arguments.length, args = new Array(_len442), _key442 = 0; _key442 < _len442; _key442++)
    args[_key442] = arguments[_key442];
  return remoteCall("spleenLimit", args, 0);
}
function splitModifiers() {
  for (var _len443 = arguments.length, args = new Array(_len443), _key443 = 0; _key443 < _len443; _key443++)
    args[_key443] = arguments[_key443];
  return remoteCall("splitModifiers", args, {});
}
function splitString() {
  for (var _len444 = arguments.length, args = new Array(_len444), _key444 = 0; _key444 < _len444; _key444++)
    args[_key444] = arguments[_key444];
  return remoteCall("splitString", args, []);
}
function squareRoot() {
  for (var _len445 = arguments.length, args = new Array(_len445), _key445 = 0; _key445 < _len445; _key445++)
    args[_key445] = arguments[_key445];
  return remoteCall("squareRoot", args, 0);
}
function startsWith() {
  for (var _len446 = arguments.length, args = new Array(_len446), _key446 = 0; _key446 < _len446; _key446++)
    args[_key446] = arguments[_key446];
  return remoteCall("startsWith", args, !1);
}
function stashAmount() {
  for (var _len447 = arguments.length, args = new Array(_len447), _key447 = 0; _key447 < _len447; _key447++)
    args[_key447] = arguments[_key447];
  return remoteCall("stashAmount", args, 0);
}
function statBonusToday() {
  for (var _len448 = arguments.length, args = new Array(_len448), _key448 = 0; _key448 < _len448; _key448++)
    args[_key448] = arguments[_key448];
  return remoteCall("statBonusToday", args, makePlaceholder("Stat", "none"));
}
function statBonusTomorrow() {
  for (var _len449 = arguments.length, args = new Array(_len449), _key449 = 0; _key449 < _len449; _key449++)
    args[_key449] = arguments[_key449];
  return remoteCall("statBonusTomorrow", args, makePlaceholder("Stat", "none"));
}
function statModifier() {
  for (var _len450 = arguments.length, args = new Array(_len450), _key450 = 0; _key450 < _len450; _key450++)
    args[_key450] = arguments[_key450];
  return remoteCall("statModifier", args, makePlaceholder("Stat", "none"));
}
function statsPockets() {
  for (var _len451 = arguments.length, args = new Array(_len451), _key451 = 0; _key451 < _len451; _key451++)
    args[_key451] = arguments[_key451];
  return remoteCall("statsPockets", args, {});
}
function steal() {
  for (var _len452 = arguments.length, args = new Array(_len452), _key452 = 0; _key452 < _len452; _key452++)
    args[_key452] = arguments[_key452];
  return remoteCall("steal", args, "");
}
function stillsAvailable() {
  for (var _len453 = arguments.length, args = new Array(_len453), _key453 = 0; _key453 < _len453; _key453++)
    args[_key453] = arguments[_key453];
  return remoteCall("stillsAvailable", args, 0);
}
function stopCounter() {
  for (var _len454 = arguments.length, args = new Array(_len454), _key454 = 0; _key454 < _len454; _key454++)
    args[_key454] = arguments[_key454];
  return remoteCall("stopCounter", args);
}
function storageAmount() {
  for (var _len455 = arguments.length, args = new Array(_len455), _key455 = 0; _key455 < _len455; _key455++)
    args[_key455] = arguments[_key455];
  return remoteCall("storageAmount", args, 0);
}
function stringModifier() {
  for (var _len456 = arguments.length, args = new Array(_len456), _key456 = 0; _key456 < _len456; _key456++)
    args[_key456] = arguments[_key456];
  return remoteCall("stringModifier", args, "");
}
function stunSkill() {
  for (var _len457 = arguments.length, args = new Array(_len457), _key457 = 0; _key457 < _len457; _key457++)
    args[_key457] = arguments[_key457];
  return remoteCall("stunSkill", args, makePlaceholder("Skill", "none"));
}
function substring() {
  for (var _len458 = arguments.length, args = new Array(_len458), _key458 = 0; _key458 < _len458; _key458++)
    args[_key458] = arguments[_key458];
  return remoteCall("substring", args, "");
}
function svnAtHead() {
  for (var _len459 = arguments.length, args = new Array(_len459), _key459 = 0; _key459 < _len459; _key459++)
    args[_key459] = arguments[_key459];
  return remoteCall("svnAtHead", args, !1);
}
function svnExists() {
  for (var _len460 = arguments.length, args = new Array(_len460), _key460 = 0; _key460 < _len460; _key460++)
    args[_key460] = arguments[_key460];
  return remoteCall("svnExists", args, !1);
}
function svnInfo() {
  for (var _len461 = arguments.length, args = new Array(_len461), _key461 = 0; _key461 < _len461; _key461++)
    args[_key461] = arguments[_key461];
  return remoteCall("svnInfo", args, {
    url: "",
    revision: 0,
    last_changed_author: "",
    last_changed_rev: 0,
    last_changed_date: ""
  });
}
function svnList() {
  for (var _len462 = arguments.length, args = new Array(_len462), _key462 = 0; _key462 < _len462; _key462++)
    args[_key462] = arguments[_key462];
  return remoteCall("svnList", args, []);
}
function sweetSynthesis() {
  for (var _len463 = arguments.length, args = new Array(_len463), _key463 = 0; _key463 < _len463; _key463++)
    args[_key463] = arguments[_key463];
  return remoteCall("sweetSynthesis", args, !1);
}
function sweetSynthesisPair() {
  for (var _len464 = arguments.length, args = new Array(_len464), _key464 = 0; _key464 < _len464; _key464++)
    args[_key464] = arguments[_key464];
  return remoteCall("sweetSynthesisPair", args, []);
}
function sweetSynthesisPairing() {
  for (var _len465 = arguments.length, args = new Array(_len465), _key465 = 0; _key465 < _len465; _key465++)
    args[_key465] = arguments[_key465];
  return remoteCall("sweetSynthesisPairing", args, []);
}
function sweetSynthesisResult() {
  for (var _len466 = arguments.length, args = new Array(_len466), _key466 = 0; _key466 < _len466; _key466++)
    args[_key466] = arguments[_key466];
  return remoteCall("sweetSynthesisResult", args, makePlaceholder("Effect", "none"));
}
function takeCloset() {
  for (var _len467 = arguments.length, args = new Array(_len467), _key467 = 0; _key467 < _len467; _key467++)
    args[_key467] = arguments[_key467];
  return remoteCall("takeCloset", args, !1);
}
function takeDisplay() {
  for (var _len468 = arguments.length, args = new Array(_len468), _key468 = 0; _key468 < _len468; _key468++)
    args[_key468] = arguments[_key468];
  return remoteCall("takeDisplay", args, !1);
}
function takeShop() {
  for (var _len469 = arguments.length, args = new Array(_len469), _key469 = 0; _key469 < _len469; _key469++)
    args[_key469] = arguments[_key469];
  return remoteCall("takeShop", args, !1);
}
function takeStash() {
  for (var _len470 = arguments.length, args = new Array(_len470), _key470 = 0; _key470 < _len470; _key470++)
    args[_key470] = arguments[_key470];
  return remoteCall("takeStash", args, !1);
}
function takeStorage() {
  for (var _len471 = arguments.length, args = new Array(_len471), _key471 = 0; _key471 < _len471; _key471++)
    args[_key471] = arguments[_key471];
  return remoteCall("takeStorage", args, !1);
}
function tavern() {
  for (var _len472 = arguments.length, args = new Array(_len472), _key472 = 0; _key472 < _len472; _key472++)
    args[_key472] = arguments[_key472];
  return remoteCall("tavern", args, 0);
}
function throwItem() {
  for (var _len473 = arguments.length, args = new Array(_len473), _key473 = 0; _key473 < _len473; _key473++)
    args[_key473] = arguments[_key473];
  return remoteCall("throwItem", args, "");
}
function throwItems() {
  for (var _len474 = arguments.length, args = new Array(_len474), _key474 = 0; _key474 < _len474; _key474++)
    args[_key474] = arguments[_key474];
  return remoteCall("throwItems", args, "");
}
function thunderCost() {
  for (var _len475 = arguments.length, args = new Array(_len475), _key475 = 0; _key475 < _len475; _key475++)
    args[_key475] = arguments[_key475];
  return remoteCall("thunderCost", args, 0);
}
function timeToString() {
  for (var _len476 = arguments.length, args = new Array(_len476), _key476 = 0; _key476 < _len476; _key476++)
    args[_key476] = arguments[_key476];
  return remoteCall("timeToString", args, "");
}
function timestampToDate() {
  for (var _len477 = arguments.length, args = new Array(_len477), _key477 = 0; _key477 < _len477; _key477++)
    args[_key477] = arguments[_key477];
  return remoteCall("timestampToDate", args, "");
}
function toBoolean() {
  for (var _len478 = arguments.length, args = new Array(_len478), _key478 = 0; _key478 < _len478; _key478++)
    args[_key478] = arguments[_key478];
  return remoteCall("toBoolean", args, !1);
}
function toBounty() {
  for (var _len479 = arguments.length, args = new Array(_len479), _key479 = 0; _key479 < _len479; _key479++)
    args[_key479] = arguments[_key479];
  return remoteCall("toBounty", args, makePlaceholder("Bounty", "none"));
}
function toBuffer() {
  for (var _len480 = arguments.length, args = new Array(_len480), _key480 = 0; _key480 < _len480; _key480++)
    args[_key480] = arguments[_key480];
  return remoteCall("toBuffer", args, "");
}
function toClass() {
  for (var _len481 = arguments.length, args = new Array(_len481), _key481 = 0; _key481 < _len481; _key481++)
    args[_key481] = arguments[_key481];
  return remoteCall("toClass", args, makePlaceholder("Class", "none"));
}
function toCoinmaster() {
  for (var _len482 = arguments.length, args = new Array(_len482), _key482 = 0; _key482 < _len482; _key482++)
    args[_key482] = arguments[_key482];
  return remoteCall("toCoinmaster", args, makePlaceholder("Coinmaster", "none"));
}
function toEffect() {
  for (var _len483 = arguments.length, args = new Array(_len483), _key483 = 0; _key483 < _len483; _key483++)
    args[_key483] = arguments[_key483];
  return remoteCall("toEffect", args, makePlaceholder("Effect", "none"));
}
function toElement() {
  for (var _len484 = arguments.length, args = new Array(_len484), _key484 = 0; _key484 < _len484; _key484++)
    args[_key484] = arguments[_key484];
  return remoteCall("toElement", args, makePlaceholder("Element", "none"));
}
function toFamiliar() {
  for (var _len485 = arguments.length, args = new Array(_len485), _key485 = 0; _key485 < _len485; _key485++)
    args[_key485] = arguments[_key485];
  return remoteCall("toFamiliar", args, makePlaceholder("Familiar", "none"));
}
function toFloat() {
  for (var _len486 = arguments.length, args = new Array(_len486), _key486 = 0; _key486 < _len486; _key486++)
    args[_key486] = arguments[_key486];
  return remoteCall("toFloat", args, 0);
}
function toInt() {
  for (var _len487 = arguments.length, args = new Array(_len487), _key487 = 0; _key487 < _len487; _key487++)
    args[_key487] = arguments[_key487];
  return remoteCall("toInt", args, 0);
}
function toItem() {
  for (var _len488 = arguments.length, args = new Array(_len488), _key488 = 0; _key488 < _len488; _key488++)
    args[_key488] = arguments[_key488];
  return remoteCall("toItem", args, makePlaceholder("Item", "none"));
}
function toJson() {
  for (var _len489 = arguments.length, args = new Array(_len489), _key489 = 0; _key489 < _len489; _key489++)
    args[_key489] = arguments[_key489];
  return remoteCall("toJson", args, "");
}
function toLocation() {
  for (var _len490 = arguments.length, args = new Array(_len490), _key490 = 0; _key490 < _len490; _key490++)
    args[_key490] = arguments[_key490];
  return remoteCall("toLocation", args, makePlaceholder("Location", "none"));
}
function toLowerCase() {
  for (var _len491 = arguments.length, args = new Array(_len491), _key491 = 0; _key491 < _len491; _key491++)
    args[_key491] = arguments[_key491];
  return remoteCall("toLowerCase", args, "");
}
function toMonster() {
  for (var _len492 = arguments.length, args = new Array(_len492), _key492 = 0; _key492 < _len492; _key492++)
    args[_key492] = arguments[_key492];
  return remoteCall("toMonster", args, makePlaceholder("Monster", "none"));
}
function toPath() {
  for (var _len493 = arguments.length, args = new Array(_len493), _key493 = 0; _key493 < _len493; _key493++)
    args[_key493] = arguments[_key493];
  return remoteCall("toPath", args, makePlaceholder("Path", "none"));
}
function toPhylum() {
  for (var _len494 = arguments.length, args = new Array(_len494), _key494 = 0; _key494 < _len494; _key494++)
    args[_key494] = arguments[_key494];
  return remoteCall("toPhylum", args, makePlaceholder("Phylum", "none"));
}
function toPlural() {
  for (var _len495 = arguments.length, args = new Array(_len495), _key495 = 0; _key495 < _len495; _key495++)
    args[_key495] = arguments[_key495];
  return remoteCall("toPlural", args, "");
}
function toServant() {
  for (var _len496 = arguments.length, args = new Array(_len496), _key496 = 0; _key496 < _len496; _key496++)
    args[_key496] = arguments[_key496];
  return remoteCall("toServant", args, makePlaceholder("Servant", "none"));
}
function toSkill() {
  for (var _len497 = arguments.length, args = new Array(_len497), _key497 = 0; _key497 < _len497; _key497++)
    args[_key497] = arguments[_key497];
  return remoteCall("toSkill", args, makePlaceholder("Skill", "none"));
}
function toSlot() {
  for (var _len498 = arguments.length, args = new Array(_len498), _key498 = 0; _key498 < _len498; _key498++)
    args[_key498] = arguments[_key498];
  return remoteCall("toSlot", args, makePlaceholder("Slot", "none"));
}
function toStat() {
  for (var _len499 = arguments.length, args = new Array(_len499), _key499 = 0; _key499 < _len499; _key499++)
    args[_key499] = arguments[_key499];
  return remoteCall("toStat", args, makePlaceholder("Stat", "none"));
}
function toString() {
  for (var _len500 = arguments.length, args = new Array(_len500), _key500 = 0; _key500 < _len500; _key500++)
    args[_key500] = arguments[_key500];
  return remoteCall("toString", args, "");
}
function toThrall() {
  for (var _len501 = arguments.length, args = new Array(_len501), _key501 = 0; _key501 < _len501; _key501++)
    args[_key501] = arguments[_key501];
  return remoteCall("toThrall", args, makePlaceholder("Thrall", "none"));
}
function toUpperCase() {
  for (var _len502 = arguments.length, args = new Array(_len502), _key502 = 0; _key502 < _len502; _key502++)
    args[_key502] = arguments[_key502];
  return remoteCall("toUpperCase", args, "");
}
function toUrl() {
  for (var _len503 = arguments.length, args = new Array(_len503), _key503 = 0; _key503 < _len503; _key503++)
    args[_key503] = arguments[_key503];
  return remoteCall("toUrl", args, "");
}
function toVykea() {
  for (var _len504 = arguments.length, args = new Array(_len504), _key504 = 0; _key504 < _len504; _key504++)
    args[_key504] = arguments[_key504];
  return remoteCall("toVykea", args, makePlaceholder("Vykea", "none"));
}
function toWikiUrl() {
  for (var _len505 = arguments.length, args = new Array(_len505), _key505 = 0; _key505 < _len505; _key505++)
    args[_key505] = arguments[_key505];
  return remoteCall("toWikiUrl", args, "");
}
function todayToString() {
  for (var _len506 = arguments.length, args = new Array(_len506), _key506 = 0; _key506 < _len506; _key506++)
    args[_key506] = arguments[_key506];
  return remoteCall("todayToString", args, "");
}
function totalFreeRests() {
  for (var _len507 = arguments.length, args = new Array(_len507), _key507 = 0; _key507 < _len507; _key507++)
    args[_key507] = arguments[_key507];
  return remoteCall("totalFreeRests", args, 0);
}
function totalTurnsPlayed() {
  for (var _len508 = arguments.length, args = new Array(_len508), _key508 = 0; _key508 < _len508; _key508++)
    args[_key508] = arguments[_key508];
  return remoteCall("totalTurnsPlayed", args, 0);
}
function towerDoor() {
  for (var _len509 = arguments.length, args = new Array(_len509), _key509 = 0; _key509 < _len509; _key509++)
    args[_key509] = arguments[_key509];
  return remoteCall("towerDoor", args, !1);
}
function traceprint() {
  for (var _len510 = arguments.length, args = new Array(_len510), _key510 = 0; _key510 < _len510; _key510++)
    args[_key510] = arguments[_key510];
  return remoteCall("traceprint", args);
}
function truncate() {
  for (var _len511 = arguments.length, args = new Array(_len511), _key511 = 0; _key511 < _len511; _key511++)
    args[_key511] = arguments[_key511];
  return remoteCall("truncate", args, 0);
}
function turnsPerCast() {
  for (var _len512 = arguments.length, args = new Array(_len512), _key512 = 0; _key512 < _len512; _key512++)
    args[_key512] = arguments[_key512];
  return remoteCall("turnsPerCast", args, 0);
}
function turnsPlayed() {
  for (var _len513 = arguments.length, args = new Array(_len513), _key513 = 0; _key513 < _len513; _key513++)
    args[_key513] = arguments[_key513];
  return remoteCall("turnsPlayed", args, 0);
}
function twiddle() {
  for (var _len514 = arguments.length, args = new Array(_len514), _key514 = 0; _key514 < _len514; _key514++)
    args[_key514] = arguments[_key514];
  return remoteCall("twiddle", args, "");
}
function unusualConstructDisc() {
  for (var _len515 = arguments.length, args = new Array(_len515), _key515 = 0; _key515 < _len515; _key515++)
    args[_key515] = arguments[_key515];
  return remoteCall("unusualConstructDisc", args, makePlaceholder("Item", "none"));
}
function updateCandyPrices() {
  for (var _len516 = arguments.length, args = new Array(_len516), _key516 = 0; _key516 < _len516; _key516++)
    args[_key516] = arguments[_key516];
  return remoteCall("updateCandyPrices", args);
}
function urlDecode() {
  for (var _len517 = arguments.length, args = new Array(_len517), _key517 = 0; _key517 < _len517; _key517++)
    args[_key517] = arguments[_key517];
  return remoteCall("urlDecode", args, "");
}
function urlEncode() {
  for (var _len518 = arguments.length, args = new Array(_len518), _key518 = 0; _key518 < _len518; _key518++)
    args[_key518] = arguments[_key518];
  return remoteCall("urlEncode", args, "");
}
function use() {
  for (var _len519 = arguments.length, args = new Array(_len519), _key519 = 0; _key519 < _len519; _key519++)
    args[_key519] = arguments[_key519];
  return remoteCall("use", args, !1);
}
function useFamiliar() {
  for (var _len520 = arguments.length, args = new Array(_len520), _key520 = 0; _key520 < _len520; _key520++)
    args[_key520] = arguments[_key520];
  return remoteCall("useFamiliar", args, !1);
}
function useServant() {
  for (var _len521 = arguments.length, args = new Array(_len521), _key521 = 0; _key521 < _len521; _key521++)
    args[_key521] = arguments[_key521];
  return remoteCall("useServant", args, !1);
}
function useSkill() {
  for (var _len522 = arguments.length, args = new Array(_len522), _key522 = 0; _key522 < _len522; _key522++)
    args[_key522] = arguments[_key522];
  return remoteCall("useSkill", args, !1);
}
function userConfirm() {
  for (var _len523 = arguments.length, args = new Array(_len523), _key523 = 0; _key523 < _len523; _key523++)
    args[_key523] = arguments[_key523];
  return remoteCall("userConfirm", args, !1);
}
function userNotify() {
  for (var _len524 = arguments.length, args = new Array(_len524), _key524 = 0; _key524 < _len524; _key524++)
    args[_key524] = arguments[_key524];
  return remoteCall("userNotify", args);
}
function userPrompt() {
  for (var _len525 = arguments.length, args = new Array(_len525), _key525 = 0; _key525 < _len525; _key525++)
    args[_key525] = arguments[_key525];
  return remoteCall("userPrompt", args, "");
}
function visit() {
  for (var _len526 = arguments.length, args = new Array(_len526), _key526 = 0; _key526 < _len526; _key526++)
    args[_key526] = arguments[_key526];
  return remoteCall("visit", args, !1);
}
function visitUrl() {
  for (var _len527 = arguments.length, args = new Array(_len527), _key527 = 0; _key527 < _len527; _key527++)
    args[_key527] = arguments[_key527];
  return remoteCall("visitUrl", args, "");
}
function votingBoothInitiatives() {
  for (var _len528 = arguments.length, args = new Array(_len528), _key528 = 0; _key528 < _len528; _key528++)
    args[_key528] = arguments[_key528];
  return remoteCall("votingBoothInitiatives", args, {});
}
function wait() {
  for (var _len529 = arguments.length, args = new Array(_len529), _key529 = 0; _key529 < _len529; _key529++)
    args[_key529] = arguments[_key529];
  return remoteCall("wait", args);
}
function waitq() {
  for (var _len530 = arguments.length, args = new Array(_len530), _key530 = 0; _key530 < _len530; _key530++)
    args[_key530] = arguments[_key530];
  return remoteCall("waitq", args);
}
function weaponHands() {
  for (var _len531 = arguments.length, args = new Array(_len531), _key531 = 0; _key531 < _len531; _key531++)
    args[_key531] = arguments[_key531];
  return remoteCall("weaponHands", args, 0);
}
function weaponType() {
  for (var _len532 = arguments.length, args = new Array(_len532), _key532 = 0; _key532 < _len532; _key532++)
    args[_key532] = arguments[_key532];
  return remoteCall("weaponType", args, makePlaceholder("Stat", "none"));
}
function weightAdjustment() {
  for (var _len533 = arguments.length, args = new Array(_len533), _key533 = 0; _key533 < _len533; _key533++)
    args[_key533] = arguments[_key533];
  return remoteCall("weightAdjustment", args, 0);
}
function wellStocked() {
  for (var _len534 = arguments.length, args = new Array(_len534), _key534 = 0; _key534 < _len534; _key534++)
    args[_key534] = arguments[_key534];
  return remoteCall("wellStocked", args, !1);
}
function whiteCitadelAvailable() {
  for (var _len535 = arguments.length, args = new Array(_len535), _key535 = 0; _key535 < _len535; _key535++)
    args[_key535] = arguments[_key535];
  return remoteCall("whiteCitadelAvailable", args, !1);
}
function whoClan() {
  for (var _len536 = arguments.length, args = new Array(_len536), _key536 = 0; _key536 < _len536; _key536++)
    args[_key536] = arguments[_key536];
  return remoteCall("whoClan", args, {});
}
function willUsuallyDodge() {
  for (var _len537 = arguments.length, args = new Array(_len537), _key537 = 0; _key537 < _len537; _key537++)
    args[_key537] = arguments[_key537];
  return remoteCall("willUsuallyDodge", args, !1);
}
function willUsuallyMiss() {
  for (var _len538 = arguments.length, args = new Array(_len538), _key538 = 0; _key538 < _len538; _key538++)
    args[_key538] = arguments[_key538];
  return remoteCall("willUsuallyMiss", args, !1);
}
function write() {
  for (var _len539 = arguments.length, args = new Array(_len539), _key539 = 0; _key539 < _len539; _key539++)
    args[_key539] = arguments[_key539];
  return remoteCall("write", args);
}
function writeCcs() {
  for (var _len540 = arguments.length, args = new Array(_len540), _key540 = 0; _key540 < _len540; _key540++)
    args[_key540] = arguments[_key540];
  return remoteCall("writeCcs", args, !1);
}
function writeln() {
  for (var _len541 = arguments.length, args = new Array(_len541), _key541 = 0; _key541 < _len541; _key541++)
    args[_key541] = arguments[_key541];
  return remoteCall("writeln", args);
}
function xpath() {
  for (var _len542 = arguments.length, args = new Array(_len542), _key542 = 0; _key542 < _len542; _key542++)
    args[_key542] = arguments[_key542];
  return remoteCall("xpath", args, []);
}
function zap() {
  for (var _len543 = arguments.length, args = new Array(_len543), _key543 = 0; _key543 < _len543; _key543++)
    args[_key543] = arguments[_key543];
  return remoteCall("zap", args, makePlaceholder("Item", "none"));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Bounty,
  Class,
  Coinmaster,
  Effect,
  Element,
  Familiar,
  Item,
  Location,
  Modifier,
  Monster,
  Path,
  Phylum,
  RefreshContextProvider,
  Servant,
  Skill,
  Slot,
  Stat,
  Thrall,
  Vykea,
  abort,
  absorbedMonsters,
  addItemCondition,
  adv1,
  advCost,
  adventure,
  allMonstersWithId,
  allNormalOutfits,
  apiCall,
  appearanceRates,
  append,
  attack,
  autosell,
  autosellPrice,
  availableAmount,
  availableChoiceOptions,
  availableChoiceSelectInputs,
  availableChoiceTextInputs,
  availablePocket,
  batchClose,
  batchFunction,
  batchOpen,
  batchProperties,
  bjornifyFamiliar,
  blackMarketAvailable,
  booleanModifier,
  buffedHitStat,
  bufferToFile,
  buy,
  buyPrice,
  buyUsingStorage,
  buysItem,
  call,
  canAdventure,
  canDrink,
  canEat,
  canEquip,
  canFaxbot,
  canInteract,
  canStillSteal,
  canadiaAvailable,
  candyForTier,
  ceil,
  changeMcd,
  charAt,
  chatClan,
  chatMacro,
  chatNotify,
  chatPrivate,
  chew,
  choiceFollowsFight,
  classModifier,
  clear,
  clearBoozeHelper,
  clearFoodHelper,
  cliExecute,
  cliExecuteOutput,
  closetAmount,
  combatManaCostModifier,
  combatRateModifier,
  combatSkillAvailable,
  concoctionPrice,
  containsText,
  council,
  count,
  craft,
  craftType,
  creatableAmount,
  creatableTurns,
  create,
  currentHitStat,
  currentMcd,
  currentPvpStances,
  currentRadSickness,
  currentRound,
  dadSeaMonkeeWeakness,
  dailySpecial,
  damageAbsorptionPercent,
  damageReduction,
  dateToTimestamp,
  daycount,
  debugprint,
  defineDefault,
  descToEffect,
  descToItem,
  disable,
  dispensaryAvailable,
  displayAmount,
  drink,
  drinksilent,
  dump,
  eat,
  eatsilent,
  effectModifier,
  effectPockets,
  eightBitPoints,
  elementalResistance,
  emptyCloset,
  enable,
  endsWith,
  enthroneFamiliar,
  entityDecode,
  entityEncode,
  equip,
  equipAllFamiliars,
  equippedAmount,
  equippedItem,
  eudora,
  eudoraItem,
  everyCardName,
  expectedColdMedicineCabinet,
  expectedDamage,
  experienceBonus,
  expressionEval,
  extractItems,
  extractMeat,
  familiarEquipment,
  familiarEquippedEquipment,
  familiarWeight,
  favoriteFamiliars,
  faxbot,
  fightFollowsChoice,
  fileToArray,
  fileToBuffer,
  fileToMap,
  floor,
  floristAvailable,
  flushMonsterManuelCache,
  formField,
  formFields,
  formatDateTime,
  friarsAvailable,
  fuelCost,
  fullnessLimit,
  gamedayToInt,
  gamedayToString,
  gametimeToInt,
  getAllProperties,
  getAutoAttack,
  getAutumnatonLocations,
  getCampground,
  getCcsAction,
  getChateau,
  getClanId,
  getClanLounge,
  getClanName,
  getClanRumpus,
  getCloset,
  getCounter,
  getCounters,
  getCustomOutfits,
  getDisplay,
  getDwelling,
  getFishingLocations,
  getFloristPlants,
  getFreePulls,
  getFuel,
  getGoals,
  getIgnoreZoneWarnings,
  getIngredients,
  getInventory,
  getLocationMonsters,
  getLocketMonsters,
  getMonsterMapping,
  getMonsters,
  getMoods,
  getOutfits,
  getPath,
  getPathFull,
  getPathVariables,
  getPermedSkills,
  getPlayerId,
  getPlayerName,
  getPower,
  getProperty,
  getRelated,
  getRevision,
  getShop,
  getShopLog,
  getStackTrace,
  getStash,
  getStorage,
  getVersion,
  getWorkshed,
  getZapWand,
  gitAtHead,
  gitExists,
  gitInfo,
  gitList,
  globalTypes,
  gnomadsAvailable,
  goalExists,
  groupString,
  guildAvailable,
  guildStoreAvailable,
  handlingChoice,
  haveBartender,
  haveChef,
  haveDisplay,
  haveEffect,
  haveEquipped,
  haveFamiliar,
  haveMushroomPlot,
  haveOutfit,
  haveServant,
  haveShop,
  haveSkill,
  hedgeMaze,
  heist,
  heistTargets,
  hermit,
  hiddenTempleUnlocked,
  hippyStoneBroken,
  hippyStoreAvailable,
  historicalAge,
  historicalPrice,
  holiday,
  hpCost,
  imageToMonster,
  inBadMoon,
  inCasual,
  inHardcore,
  inMoxieSign,
  inMultiFight,
  inMuscleSign,
  inMysticalitySign,
  inTerrarium,
  inaccessibleReason,
  indexOf,
  inebrietyLimit,
  initiativeModifier,
  insert,
  isAccessible,
  isBanished,
  isCoinmasterItem,
  isDarkMode,
  isDiscardable,
  isDisplayable,
  isFamiliarEquipmentLocked,
  isGiftable,
  isGoal,
  isHeadless,
  isInteger,
  isNpcItem,
  isOnline,
  isTradeable,
  isTrendy,
  isUnrestricted,
  isWearingOutfit,
  itemAmount,
  itemDropModifier,
  itemDrops,
  itemDropsArray,
  itemPockets,
  itemType,
  joinStrings,
  jokePockets,
  jumpChance,
  knollAvailable,
  lastChoice,
  lastDecision,
  lastIndexOf,
  lastItemMessage,
  lastMonster,
  lastSkillMessage,
  leetify,
  length,
  lightningCost,
  limitMode,
  loadHtml,
  lockFamiliarEquipment,
  logN,
  logprint,
  makePlaceholder,
  makeUrl,
  mallPrice,
  mallPrices,
  manaCostModifier,
  mapToFile,
  markRemoteCallCacheDirty,
  max,
  maximize,
  meatDrop,
  meatDropModifier,
  meatPockets,
  min,
  minstrelInstrument,
  minstrelLevel,
  minstrelQuest,
  modifierEval,
  monkeyPaw,
  monsterAttack,
  monsterDefense,
  monsterElement,
  monsterEval,
  monsterFactoidsAvailable,
  monsterHp,
  monsterInitiative,
  monsterLevelAdjustment,
  monsterManuelText,
  monsterModifier,
  monsterPhylum,
  monsterPockets,
  moodExecute,
  moodList,
  moonLight,
  moonPhase,
  mpCost,
  myAbsorbs,
  myAdventures,
  myAscensions,
  myAudience,
  myBasestat,
  myBjornedFamiliar,
  myBuffedstat,
  myClass,
  myClosetMeat,
  myCompanion,
  myDaycount,
  myDiscomomentum,
  myEffectiveFamiliar,
  myEffects,
  myEnthronedFamiliar,
  myFamiliar,
  myFullness,
  myFury,
  myGardenType,
  myHash,
  myHp,
  myId,
  myInebriety,
  myLevel,
  myLightning,
  myLocation,
  myMask,
  myMaxfury,
  myMaxhp,
  myMaxmp,
  myMaxpp,
  myMeat,
  myMp,
  myName,
  myPath,
  myPathId,
  myPokeFam,
  myPp,
  myPrimestat,
  myRain,
  myRobotEnergy,
  myRobotScraps,
  myServant,
  mySessionAdv,
  mySessionItems,
  mySessionMeat,
  mySessionResults,
  mySign,
  mySoulsauce,
  mySpleenUse,
  myStorageMeat,
  myThrall,
  myThunder,
  myTotalTurnsSpent,
  myTurncount,
  myVykeaCompanion,
  myWildfireWater,
  nowToInt,
  nowToString,
  npcPrice,
  numberologyPrize,
  numericModifier,
  outfit,
  outfitPieces,
  outfitTattoo,
  outfitTreats,
  overdrink,
  pathIdToName,
  pathNameToId,
  pickPocket,
  pickedPockets,
  pickedScraps,
  ping,
  placeholderIdentifier,
  placeholderTypes,
  pocketEffects,
  pocketItems,
  pocketJoke,
  pocketMeat,
  pocketMonster,
  pocketPoem,
  pocketScrap,
  pocketStats,
  poemPockets,
  potentialPockets,
  preValidateAdventure,
  prepareForAdventure,
  print,
  printHtml,
  propertyDefaultValue,
  propertyExists,
  propertyHasDefault,
  pullsRemaining,
  putCloset,
  putDisplay,
  putShop,
  putShopUsingStorage,
  putStash,
  pvpAttacksLeft,
  rainCost,
  random,
  rawDamageAbsorption,
  readCcs,
  receiveFax,
  refreshShop,
  refreshStash,
  refreshStatus,
  removeItemCondition,
  removeProperty,
  renameProperty,
  replace,
  replaceString,
  repriceShop,
  restorationPockets,
  restoreHp,
  restoreMp,
  retrieveItem,
  retrievePrice,
  reverseNumberology,
  rollover,
  round,
  runChoice,
  runCombat,
  runTurn,
  runaway,
  sausageGoblinChance,
  scrapPockets,
  sell,
  sellPrice,
  sellsItem,
  sendFax,
  sessionLogs,
  setAutoAttack,
  setCcs,
  setLength,
  setLocation,
  setProperty,
  shopAmount,
  shopLimit,
  shopPrice,
  skillModifier,
  slashCount,
  soulsauceCost,
  spleenLimit,
  splitModifiers,
  splitString,
  squareRoot,
  startsWith,
  stashAmount,
  statBonusToday,
  statBonusTomorrow,
  statModifier,
  statsPockets,
  steal,
  stillsAvailable,
  stopCounter,
  storageAmount,
  stringModifier,
  stunSkill,
  substring,
  svnAtHead,
  svnExists,
  svnInfo,
  svnList,
  sweetSynthesis,
  sweetSynthesisPair,
  sweetSynthesisPairing,
  sweetSynthesisResult,
  takeCloset,
  takeDisplay,
  takeShop,
  takeStash,
  takeStorage,
  tavern,
  throwItem,
  throwItems,
  thunderCost,
  timeToString,
  timestampToDate,
  toBoolean,
  toBounty,
  toBuffer,
  toClass,
  toCoinmaster,
  toEffect,
  toElement,
  toFamiliar,
  toFloat,
  toInt,
  toItem,
  toJson,
  toLocation,
  toLowerCase,
  toMonster,
  toPath,
  toPhylum,
  toPlural,
  toServant,
  toSkill,
  toSlot,
  toStat,
  toString,
  toThrall,
  toUpperCase,
  toUrl,
  toVykea,
  toWikiUrl,
  todayToString,
  totalFreeRests,
  totalTurnsPlayed,
  towerDoor,
  traceprint,
  triggerSoftRefresh,
  truncate,
  turnsPerCast,
  turnsPlayed,
  twiddle,
  unusualConstructDisc,
  updateCandyPrices,
  urlDecode,
  urlEncode,
  use,
  useFamiliar,
  useServant,
  useSkill,
  userConfirm,
  userNotify,
  userPrompt,
  visit,
  visitUrl,
  votingBoothInitiatives,
  wait,
  waitq,
  weaponHands,
  weaponType,
  weightAdjustment,
  wellStocked,
  whiteCitadelAvailable,
  whoClan,
  willUsuallyDodge,
  willUsuallyMiss,
  write,
  writeCcs,
  writeln,
  xpath,
  zap
});
/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
