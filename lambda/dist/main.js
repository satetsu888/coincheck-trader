module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.handler = function (event, context) {
	    var co = __webpack_require__(1);

	    co(regeneratorRuntime.mark(function _callee() {
	        var entity, trader, asset;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	            while (1) {
	                switch (_context.prev = _context.next) {
	                    case 0:
	                        entity = event.entity;
	                        _context.next = 3;
	                        return doFitnessAsync(entity);

	                    case 3:
	                        trader = _context.sent;
	                        _context.next = 6;
	                        return trader.current_assetsAsync();

	                    case 6:
	                        asset = _context.sent;

	                        context.succeed({
	                            score: parseFloat(asset - 20000) - parseFloat(trader.stats.max_draw_down),
	                            stats: trader.stats,
	                            entity: entity
	                        });

	                    case 8:
	                    case 'end':
	                        return _context.stop();
	                }
	            }
	        }, _callee, this);
	    })).catch(function (err) {
	        context.fail(err);
	    });
	};

	var doFitnessAsync = function doFitnessAsync(entity) {
	    return new Promise(function (resolve, reject) {
	        doFitness(entity, function (err, result) {
	            if (err) {
	                reject(err);
	                return;
	            } else {
	                resolve(result);
	            }
	        });
	    });
	};

	var doFitness = function doFitness(entity, callback) {

	    var api = __webpack_require__(2);
	    var Trader = __webpack_require__(3);
	    var config = {
	        jpy: 20000,
	        btc: 0
	    };
	    var option = {
	        calc_weight: 0.0001,
	        order_threshold: 200,
	        order_allowed: true,
	        order_weight: 0.0002,
	        api: new api(config),
	        mode: 'future'
	    };

	    var trader = new Trader(entity, config, option);

	    var train = __webpack_require__(23);

	    co(regeneratorRuntime.mark(function _callee2() {
	        var i;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	            while (1) {
	                switch (_context2.prev = _context2.next) {
	                    case 0:
	                        i = 0;

	                    case 1:
	                        if (!(i < train.length)) {
	                            _context2.next = 10;
	                            break;
	                        }

	                        trader.api._updateCurrent(train[i]);
	                        _context2.next = 5;
	                        return trader.current_assetsAsync();

	                    case 5:
	                        _context2.next = 7;
	                        return trader.updateAsync(train[i]);

	                    case 7:
	                        i++;
	                        _context2.next = 1;
	                        break;

	                    case 10:
	                        //console.log("finish");
	                        callback(null, trader);

	                    case 11:
	                    case 'end':
	                        return _context2.stop();
	                }
	            }
	        }, _callee2, this);
	    })).catch(function (err) {
	        console.log(err.stack);
	        callback(err, null);
	    });
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	
	/**
	 * slice() reference.
	 */

	var slice = Array.prototype.slice;

	/**
	 * Expose `co`.
	 */

	module.exports = co['default'] = co.co = co;

	/**
	 * Wrap the given generator `fn` into a
	 * function that returns a promise.
	 * This is a separate function so that
	 * every `co()` call doesn't create a new,
	 * unnecessary closure.
	 *
	 * @param {GeneratorFunction} fn
	 * @return {Function}
	 * @api public
	 */

	co.wrap = function (fn) {
	  createPromise.__generatorFunction__ = fn;
	  return createPromise;
	  function createPromise() {
	    return co.call(this, fn.apply(this, arguments));
	  }
	};

	/**
	 * Execute the generator function or a generator
	 * and return a promise.
	 *
	 * @param {Function} fn
	 * @return {Promise}
	 * @api public
	 */

	function co(gen) {
	  var ctx = this;
	  var args = slice.call(arguments, 1)

	  // we wrap everything in a promise to avoid promise chaining,
	  // which leads to memory leak errors.
	  // see https://github.com/tj/co/issues/180
	  return new Promise(function(resolve, reject) {
	    if (typeof gen === 'function') gen = gen.apply(ctx, args);
	    if (!gen || typeof gen.next !== 'function') return resolve(gen);

	    onFulfilled();

	    /**
	     * @param {Mixed} res
	     * @return {Promise}
	     * @api private
	     */

	    function onFulfilled(res) {
	      var ret;
	      try {
	        ret = gen.next(res);
	      } catch (e) {
	        return reject(e);
	      }
	      next(ret);
	    }

	    /**
	     * @param {Error} err
	     * @return {Promise}
	     * @api private
	     */

	    function onRejected(err) {
	      var ret;
	      try {
	        ret = gen.throw(err);
	      } catch (e) {
	        return reject(e);
	      }
	      next(ret);
	    }

	    /**
	     * Get the next value in the generator,
	     * return a promise.
	     *
	     * @param {Object} ret
	     * @return {Promise}
	     * @api private
	     */

	    function next(ret) {
	      if (ret.done) return resolve(ret.value);
	      var value = toPromise.call(ctx, ret.value);
	      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
	      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
	        + 'but the following object was passed: "' + String(ret.value) + '"'));
	    }
	  });
	}

	/**
	 * Convert a `yield`ed value into a promise.
	 *
	 * @param {Mixed} obj
	 * @return {Promise}
	 * @api private
	 */

	function toPromise(obj) {
	  if (!obj) return obj;
	  if (isPromise(obj)) return obj;
	  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
	  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
	  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
	  if (isObject(obj)) return objectToPromise.call(this, obj);
	  return obj;
	}

	/**
	 * Convert a thunk to a promise.
	 *
	 * @param {Function}
	 * @return {Promise}
	 * @api private
	 */

	function thunkToPromise(fn) {
	  var ctx = this;
	  return new Promise(function (resolve, reject) {
	    fn.call(ctx, function (err, res) {
	      if (err) return reject(err);
	      if (arguments.length > 2) res = slice.call(arguments, 1);
	      resolve(res);
	    });
	  });
	}

	/**
	 * Convert an array of "yieldables" to a promise.
	 * Uses `Promise.all()` internally.
	 *
	 * @param {Array} obj
	 * @return {Promise}
	 * @api private
	 */

	function arrayToPromise(obj) {
	  return Promise.all(obj.map(toPromise, this));
	}

	/**
	 * Convert an object of "yieldables" to a promise.
	 * Uses `Promise.all()` internally.
	 *
	 * @param {Object} obj
	 * @return {Promise}
	 * @api private
	 */

	function objectToPromise(obj){
	  var results = new obj.constructor();
	  var keys = Object.keys(obj);
	  var promises = [];
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var promise = toPromise.call(this, obj[key]);
	    if (promise && isPromise(promise)) defer(promise, key);
	    else results[key] = obj[key];
	  }
	  return Promise.all(promises).then(function () {
	    return results;
	  });

	  function defer(promise, key) {
	    // predefine the key in the result
	    results[key] = undefined;
	    promises.push(promise.then(function (res) {
	      results[key] = res;
	    }));
	  }
	}

	/**
	 * Check if `obj` is a promise.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isPromise(obj) {
	  return 'function' == typeof obj.then;
	}

	/**
	 * Check if `obj` is a generator.
	 *
	 * @param {Mixed} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isGenerator(obj) {
	  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
	}

	/**
	 * Check if `obj` is a generator function.
	 *
	 * @param {Mixed} obj
	 * @return {Boolean}
	 * @api private
	 */
	function isGeneratorFunction(obj) {
	  var constructor = obj.constructor;
	  if (!constructor) return false;
	  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
	  return isGenerator(constructor.prototype);
	}

	/**
	 * Check for plain object.
	 *
	 * @param {Mixed} val
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(val) {
	  return Object == val.constructor;
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	//api dummy wrapper
	module.exports = function () {
	    'use strict';

	    var trade = function trade(currency_pair, action, price, amount, callback) {

	        var id = Math.floor(Math.random() * 0xFFFF);

	        var result = {
	            "success": true,
	            "id": id,
	            "rate": price,
	            "amount": amount,
	            "order_type": action,
	            "pair": currency_pair || "btc_jpy",
	            "created_at": this.current_time
	        };

	        var order = {
	            id: id,
	            order_type: action,
	            rate: price,
	            pair: currency_pair || "btc_jpy_jpy",
	            pending_amount: amount,
	            created_at: this.current_time,
	            _original_amount: amount,
	            _status: "open"
	        };
	        console.log(order);

	        if (action == "leverage_buy" || action == "leverage_sell") {
	            this.current_yen -= amount * price * 0.0005;
	        }

	        this.orders.push(order);

	        setTimeout(callback, 1, null, result);
	    };

	    var closeTrade = function closeTrade(currency_pair, action, price, amount, position_id, callback) {
	        var id = Math.floor(Math.random() * 0xFFFF);

	        if (!price) {
	            price = this.current_rate;
	        }

	        var result = {
	            "success": true,
	            "id": id,
	            "rate": price,
	            "amount": amount,
	            "order_type": action,
	            "pair": currency_pair || "btc_jpy",
	            "created_at": this.current_time
	        };

	        var order = {
	            id: id,
	            order_type: action,
	            rate: price,
	            pair: currency_pair || "btc_jpy",
	            pending_amount: amount,
	            created_at: this.current_time,
	            _original_amount: amount,
	            _status: "open",
	            _position_id: position_id
	        };
	        console.log(order);
	        this.orders.push(order);

	        setTimeout(callback, 1, null, result);
	    };

	    var getLeveragePositions = function getLeveragePositions(status, callback) {
	        var result;
	        if (status == "open") {
	            var data;
	            if (this.open_positions.buy || this.open_positions.sell) {
	                data = [this.open_positions.buy || this.open_positions.sell];
	            } else {
	                data = [];
	            }
	            result = {
	                "success": true,
	                "data": data
	            };
	        } else if (status == "close") {
	            // TODO
	        }

	        setTimeout(callback, 1, null, result);
	    };

	    var cancelOrder = function cancelOrder(order_id, callback) {
	        var result = {};

	        this.orders.forEach(function (order) {
	            if (order.id == order_id) {
	                order._status = "canceled";
	                console.log(order);

	                result = {
	                    "success": true,
	                    "id": order.id
	                };
	            }
	        });

	        setTimeout(callback, 1, null, result);
	    };

	    var activeOrders = function activeOrders(callback) {
	        if (!this.orders) {
	            setTimeout(callback, 1, null, []);
	            return;
	        }

	        var orders = this.orders.filter(function (element) {
	            if (element._status == "open") {
	                return true;
	            } else {
	                return false;
	            }
	        });

	        var result = {
	            "success": true,
	            "orders": orders
	        };

	        setTimeout(callback, 1, null, result);
	    };

	    var getBalance = function getBalance(callback) {
	        var self = this;

	        var balance = {
	            "success": true,
	            "jpy": self.current_yen,
	            "btc": self.current_btc,
	            "jpy_reserved": "0", // 未決済注文から計算する
	            "btc_reserved": "0", // 同上
	            "jpy_lend_in_use": "0",
	            "btc_lend_in_use": "0",
	            "jpy_lent": "0",
	            "btc_lent": "0",
	            "jpy_debt": "0",
	            "btc_debt": "0"
	        };

	        setTimeout(callback, 1, null, balance);
	    };

	    var getLeverageBalance = function getLeverageBalance(callback) {
	        var self = this;

	        var balance = {
	            "success": true,
	            "margin": {
	                "jpy": self.current_yen
	            },
	            "margin_available": {
	                "jpy": "xxxx"
	            },
	            "margin_level": "xxxx"
	        };

	        setTimeout(callback, 1, null, balance);
	    };

	    var _updateCurrent = function _updateCurrent(lastTrade) {
	        this.current_time = lastTrade.created_at;
	        this.current_rate = lastTrade.rate;
	        if (lastTrade) {
	            this._applyOrder(lastTrade);
	        }
	    };

	    var _applyOrder = function _applyOrder(trade) {
	        var self = this;

	        if (!this.orders) {
	            return;
	        }

	        this.orders.forEach(function (order, index) {
	            if (order._status != "open") {
	                return;
	            }

	            if (order.order_type == "buy") {
	                if (trade.rate <= order.rate) {
	                    var traded_amount = Math.min(order.pending_amount, trade.amount);
	                    order.pending_amount -= traded_amount;
	                    if (order.pending_amount <= 0) {
	                        order._status = "closed";
	                    }
	                    self.current_btc += traded_amount;
	                    self.current_yen -= traded_amount * trade.rate;
	                }
	            } else if (order.order_type == "sell") {
	                if (trade.rate >= order.rate) {
	                    var traded_amount = Math.min(order.pending_amount, trade.amount);
	                    order.pending_amount -= traded_amount;
	                    if (order.pending_amount <= 0) {
	                        order._status = "closed";
	                    }
	                    self.current_btc -= traded_amount;
	                    self.current_yen += traded_amount * trade.rate;
	                }
	            } else if (order.order_type == "leverage_buy") {
	                if (trade.rate <= order.rate) {
	                    var traded_amount = Math.min(order.pending_amount, trade.amount);
	                    order.pending_amount -= traded_amount;
	                    if (order.pending_amount <= 0) {
	                        order._status = "closed";
	                    }
	                    self._open_position("buy", trade.rate, traded_amount);
	                }
	            } else if (order.order_type == "leverage_sell") {
	                var traded_amount = Math.min(order.pending_amount, trade.amount);
	                order.pending_amount -= traded_amount;
	                if (order.pending_amount <= 0) {
	                    order._status = "closed";
	                }
	                self._open_position("sell", trade.rate, traded_amount);
	            } else if (order.order_type == "close_long") {
	                var traded_amount = Math.min(order.pending_amount, trade.amount);
	                order.pending_amount -= traded_amount;
	                if (order.pending_amount <= 0) {
	                    order._status = "closed";
	                }
	                self._close_position("buy", trade.rate, traded_amount);
	            } else if (order.order_type == "close_short") {
	                var traded_amount = Math.min(order.pending_amount, trade.amount);
	                order.pending_amount -= traded_amount;
	                if (order.pending_amount <= 0) {
	                    order._status = "closed";
	                }
	                self._close_position("sell", trade.rate, traded_amount);
	            }
	        });
	    };

	    var _open_position = function _open_position(side, rate, amount) {
	        if (this.open_positions[side]) {
	            var old_position = this.open_positions[side];

	            this.open_positions[side] = {
	                "id": old_position.id,
	                "open_rate": (old_position.open_rate * old_position.amount + rate * amount) / (old_position.amount + amount),
	                "amount": old_position.amount + amount,
	                "side": old_position.side,
	                "created_at": old_position.created_at
	            };
	        } else {
	            this.open_positions[side] = {
	                "id": Math.floor(Math.random() * 0xFFFF),
	                "open_rate": rate,
	                "amount": amount,
	                "side": side,
	                "created_at": this.current_time
	            };
	        }
	    };

	    var _close_position = function _close_position(side, rate, amount) {
	        if (this.open_positions[side]) {
	            var old_position = this.open_positions[side];

	            this.open_positions[side] = {
	                "id": old_position.id,
	                "open_rate": old_position.open_rate,
	                "amount": old_position.amount - amount,
	                "side": old_position.side,
	                "created_at": old_position.created_at
	            };

	            var sign;
	            if (side == "buy") {
	                sign = 1;
	            } else {
	                sign = -1;
	            }

	            this.current_yen += sign * amount * (rate - old_position.open_rate);

	            if (old_position.amount - amount <= 0) {
	                this.closed_posisions.push(this.open_positions[side]);
	                this.open_positions[side] = null;
	            }
	        }
	        console.log("yen: " + this.current_yen);
	    };

	    var api = function api(config) {
	        this.trade = trade;
	        this.cancelOrder = cancelOrder;
	        this.activeOrders = activeOrders;
	        this.getBalance = getBalance;
	        this.getLeverageBalance = getLeverageBalance;
	        this.closeTrade = closeTrade;
	        this.getLeveragePositions = getLeveragePositions;

	        this._updateCurrent = _updateCurrent;
	        this._applyOrder = _applyOrder;

	        this._open_position = _open_position;
	        this._close_position = _close_position;

	        this.current_yen = config.jpy;
	        this.current_btc = config.btc;
	        this.current_time;
	        this.current_rate;
	        this.orders = [];
	        this.open_positions = {
	            buy: null,
	            sell: null
	        };
	        this.closed_posisions = [];
	    };

	    return api;
	}();

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = function () {
	    'use strict';

	    var co = __webpack_require__(1);
	    var promisify = __webpack_require__(4);

	    var updateLogAsync = function updateLogAsync(trader) {
	        var self = this;
	        return new Promise(function (resolve, reject) {
	            if (self.logger) {
	                self.logger.log(trader, function () {
	                    resolve(trader);
	                });
	            } else {
	                resolve(trader);
	            }
	        });
	    };

	    var applyTradesAsync = function applyTradesAsync() {
	        var self = this;
	        return new Promise(function (resolve, reject) {
	            co(regeneratorRuntime.mark(function _callee() {
	                var current_date, result, orders, i, order_cancel_date, positionsResult, positions, position_cancel_date, action;
	                return regeneratorRuntime.wrap(function _callee$(_context) {
	                    while (1) {
	                        switch (_context.prev = _context.next) {
	                            case 0:
	                                if (self.order_allowed) {
	                                    _context.next = 3;
	                                    break;
	                                }

	                                resolve();
	                                return _context.abrupt('return');

	                            case 3:
	                                ;
	                                current_date = 0;

	                                if (self.last_trade()) {
	                                    current_date = new Date(self.last_trade().created_at);
	                                }

	                                _context.next = 8;
	                                return self.api.activeOrders();

	                            case 8:
	                                result = _context.sent;
	                                orders = result.orders;
	                                //console.log(orders);

	                                i = 0;

	                            case 11:
	                                if (!(i < orders.length)) {
	                                    _context.next = 21;
	                                    break;
	                                }

	                                order_cancel_date = new Date(orders[i].created_at);

	                                order_cancel_date.setHours(order_cancel_date.getHours() + 5);

	                                if (!(order_cancel_date < current_date)) {
	                                    _context.next = 18;
	                                    break;
	                                }

	                                self.stats.cancel_order++;
	                                _context.next = 18;
	                                return self.api.cancelOrder(orders[i].id);

	                            case 18:
	                                i++;
	                                _context.next = 11;
	                                break;

	                            case 21:
	                                ;

	                                _context.next = 24;
	                                return self.api.getLeveragePositions('open');

	                            case 24:
	                                positionsResult = _context.sent;
	                                positions = positionsResult.data;
	                                i = 0;

	                            case 27:
	                                if (!(i < positions.length)) {
	                                    _context.next = 38;
	                                    break;
	                                }

	                                position_cancel_date = new Date(positions[i].created_at);

	                                position_cancel_date.setHours(position_cancel_date.getHours() + 10);

	                                if (!(position_cancel_date < current_date)) {
	                                    _context.next = 35;
	                                    break;
	                                }

	                                self.stats.cancel_position++;

	                                if (positions[i].side == "buy") {
	                                    action = "close_long";
	                                } else {
	                                    action = "close_short";
	                                }
	                                _context.next = 35;
	                                return self.api.closeTrade("btc_jpy", action, null, positions[i].amount, positions[i].id);

	                            case 35:
	                                i++;
	                                _context.next = 27;
	                                break;

	                            case 38:
	                                ;

	                                resolve();

	                            case 40:
	                            case 'end':
	                                return _context.stop();
	                        }
	                    }
	                }, _callee, this);
	            })).catch(function (err) {
	                console.log(err.stack);
	                reject(err);
	            });
	        });
	    };

	    var updateTradesAsync = function updateTradesAsync(trade) {
	        var self = this;
	        return new Promise(function (resolve, reject) {

	            self.trades.push(trade);
	            self.stats.update_trade_count++;

	            if (self.trades.length <= 100) {
	                resolve(self);
	                return;
	            }

	            self.trades.shift();

	            if (!self.order_allowed) {
	                console.log("order not allowed");
	                resolve(self);
	                return;
	            }

	            self.createOrder(self.trades, function (err, trader) {
	                if (err) {
	                    reject(err);
	                    return;
	                } else {
	                    resolve(trader);
	                    return;
	                }
	            });
	        });
	    };

	    var updateAsync = function updateAsync(trade) {
	        var self = this;
	        return new Promise(function (resolve, reject) {
	            co(regeneratorRuntime.mark(function _callee2() {
	                return regeneratorRuntime.wrap(function _callee2$(_context2) {
	                    while (1) {
	                        switch (_context2.prev = _context2.next) {
	                            case 0:
	                                _context2.next = 2;
	                                return self.applyTradesAsync();

	                            case 2:
	                                _context2.next = 4;
	                                return self.updateTradesAsync(trade);

	                            case 4:
	                                _context2.next = 6;
	                                return self.updateLogAsync(self);

	                            case 6:
	                                resolve(self);

	                            case 7:
	                            case 'end':
	                                return _context2.stop();
	                        }
	                    }
	                }, _callee2, this);
	            })).catch(function (err) {
	                console.log(err.stack);
	                reject(err);
	                return;
	            });
	        });
	    };

	    var calcScore = function calcScore(trades, option) {
	        var self = this;
	        var score = 0;

	        var sign;
	        trades.forEach(function (element, index) {
	            if (element.order_type == "buy") {
	                sign = 1;
	            } else if (element.order_type == "sell") {
	                sign = -1;
	            }

	            var delta = sign * element.amount * element.rate * self.entity[index] * self.calc_weight;
	            score += delta;
	        });
	        score += 10 * self.entity[100] * (self.current_yen / self.current_rate() - self.current_btc);

	        return score;
	    };

	    var createOrder = function createOrder(trades, cb) {
	        var self = this;
	        self.current_score = self.calcScore(trades, {});

	        if (self.mode == 'spot') {
	            self._createSpotOrder(cb);
	        } else if (self.mode == 'future') {
	            self._createFutureOrder(cb);
	        } else {
	            console.log('invalid mode');
	            cb('invalid mode', null);
	        }
	    };

	    var _createSpotOrder = function _createSpotOrder(cb) {
	        var self = this;

	        var amount = Math.floor(Math.abs(self.order_weight * self.current_score * self.entity[101]) * 10000) / 10000;

	        co(regeneratorRuntime.mark(function _callee3() {
	            var ticker, rate;
	            return regeneratorRuntime.wrap(function _callee3$(_context3) {
	                while (1) {
	                    switch (_context3.prev = _context3.next) {
	                        case 0:
	                            if (!self.use_tick) {
	                                _context3.next = 4;
	                                break;
	                            }

	                            _context3.next = 3;
	                            return new Promise(function (resolve, reject) {
	                                self.publicApi.ticker(function (err, result) {
	                                    if (err) {
	                                        reject(err);
	                                    } else {
	                                        resolve(result);
	                                    }
	                                });
	                            });

	                        case 3:
	                            ticker = _context3.sent;

	                        case 4:
	                            if (self.verbose) {
	                                console.log("tick: " + JSON.stringify(ticker));
	                            }

	                            if (!(self.current_score < -1 * self.order_threshold && self.current_btc > 0.01)) {
	                                _context3.next = 14;
	                                break;
	                            }

	                            rate = self.current_rate();

	                            if (self.use_tick) {
	                                rate = Math.max(self.current_rate(), ticker.ask);
	                            }
	                            self.stats.order.sell++;
	                            _context3.next = 11;
	                            return self.api.trade("btc_jpy", "sell", rate, amount);

	                        case 11:
	                            return _context3.abrupt('return', _context3.sent);

	                        case 14:
	                            if (!(self.order_threshold < self.current_score && self.current_yen / self.current_rate() > 0.01)) {
	                                _context3.next = 21;
	                                break;
	                            }

	                            rate = self.current_rate();

	                            if (self.use_tick) {
	                                rate = Math.min(self.current_rate(), ticker.bid);
	                            }
	                            self.stats.order.buy++;
	                            _context3.next = 20;
	                            return self.api.trade("btc_jpy", "buy", rate, amount);

	                        case 20:
	                            return _context3.abrupt('return', _context3.sent);

	                        case 21:
	                        case 'end':
	                            return _context3.stop();
	                    }
	                }
	            }, _callee3, this);
	        })).then(function (result) {
	            if (result && self.verbose) {
	                console.log(result);
	            }
	            if (self.verbose) {
	                console.log("current score: " + self.current_score);
	            }
	            cb(null, self);
	        }).catch(function (err) {
	            console.log(err);
	            console.log(err.stack);
	            cb(err, null);
	        });
	    };

	    var _createFutureOrder = function _createFutureOrder(cb) {
	        var self = this;

	        var amount = Math.floor(Math.abs(self.order_weight * self.current_score * self.entity[101]) * 10000) / 10000;

	        co(regeneratorRuntime.mark(function _callee4() {
	            var ticker, positionsResult, positions, shortPositions, longPositions, rate, result, orders, i, position;
	            return regeneratorRuntime.wrap(function _callee4$(_context4) {
	                while (1) {
	                    switch (_context4.prev = _context4.next) {
	                        case 0:
	                            if (!self.use_tick) {
	                                _context4.next = 4;
	                                break;
	                            }

	                            _context4.next = 3;
	                            return new Promise(function (resolve, reject) {
	                                self.publicApi.ticker(function (err, result) {
	                                    if (err) {
	                                        reject(err);
	                                    } else {
	                                        resolve(result);
	                                    }
	                                });
	                            });

	                        case 3:
	                            ticker = _context4.sent;

	                        case 4:
	                            if (self.verbose) {
	                                console.log("tick: " + JSON.stringify(ticker));
	                            }

	                            _context4.next = 7;
	                            return self.api.getLeveragePositions('open');

	                        case 7:
	                            positionsResult = _context4.sent;
	                            positions = positionsResult.data;
	                            shortPositions = positions.filter(function (position) {
	                                if (position.side == "sell") {
	                                    return true;
	                                } else {
	                                    return false;
	                                }
	                            });
	                            longPositions = positions.filter(function (position) {
	                                if (position.side == "buy") {
	                                    return true;
	                                } else {
	                                    return false;
	                                }
	                            });

	                            if (!(positions.length == 0 && self.current_score < -1 * self.order_threshold)) {
	                                _context4.next = 31;
	                                break;
	                            }

	                            rate = self.current_rate();

	                            if (self.use_tick) {
	                                rate = Math.max(self.current_rate(), ticker.ask);
	                            }

	                            _context4.next = 16;
	                            return self.api.activeOrders();

	                        case 16:
	                            result = _context4.sent;
	                            orders = result.orders;
	                            i = 0;

	                        case 19:
	                            if (!(i < orders.length)) {
	                                _context4.next = 25;
	                                break;
	                            }

	                            _context4.next = 22;
	                            return self.api.cancelOrder(orders[i].id);

	                        case 22:
	                            i++;
	                            _context4.next = 19;
	                            break;

	                        case 25:

	                            self.stats.order.short++;
	                            _context4.next = 28;
	                            return self.api.trade("btc_jpy", "leverage_sell", rate, amount);

	                        case 28:
	                            return _context4.abrupt('return', _context4.sent);

	                        case 31:
	                            if (!(positions.length == 0 && self.order_threshold < self.current_score)) {
	                                _context4.next = 51;
	                                break;
	                            }

	                            rate = self.current_rate();

	                            if (self.use_tick) {
	                                rate = Math.min(self.current_rate(), ticker.bid);
	                            }

	                            _context4.next = 36;
	                            return self.api.activeOrders();

	                        case 36:
	                            result = _context4.sent;
	                            orders = result.orders;
	                            i = 0;

	                        case 39:
	                            if (!(i < orders.length)) {
	                                _context4.next = 45;
	                                break;
	                            }

	                            _context4.next = 42;
	                            return self.api.cancelOrder(orders[i].id);

	                        case 42:
	                            i++;
	                            _context4.next = 39;
	                            break;

	                        case 45:

	                            self.stats.order.long++;
	                            _context4.next = 48;
	                            return self.api.trade("btc_jpy", "leverage_buy", rate, amount);

	                        case 48:
	                            return _context4.abrupt('return', _context4.sent);

	                        case 51:
	                            if (!(longPositions.length > 0 && self.current_score < -1 * self.close_threshold)) {
	                                _context4.next = 61;
	                                break;
	                            }

	                            rate = self.current_rate();

	                            if (self.use_tick) {
	                                rate = Math.min(self.current_rate(), ticker.bid);
	                            }
	                            position = longPositions[0];

	                            amount = Math.min(amount, position.amount);
	                            _context4.next = 58;
	                            return self.api.closeTrade("btc_jpy", "close_long", rate, amount, position.id);

	                        case 58:
	                            return _context4.abrupt('return', _context4.sent);

	                        case 61:
	                            if (!(shortPositions.length > 0 && self.close_threshold < self.current_score)) {
	                                _context4.next = 69;
	                                break;
	                            }

	                            rate = self.current_rate();

	                            if (self.use_tick) {
	                                rate = Math.min(self.current_rate(), ticker.bid);
	                            }
	                            position = shortPositions[0];

	                            amount = Math.min(amount, position.amount);
	                            _context4.next = 68;
	                            return self.api.closeTrade("btc_jpy", "close_short", rate, amount, position.id);

	                        case 68:
	                            return _context4.abrupt('return', _context4.sent);

	                        case 69:
	                        case 'end':
	                            return _context4.stop();
	                    }
	                }
	            }, _callee4, this);
	        })).then(function (result) {
	            if (result && self.verbose) {
	                console.log(result);
	            }
	            if (self.verbose) {
	                console.log("current score: " + self.current_score);
	            }
	            cb(null, self);
	        }).catch(function (err) {
	            console.log(err);
	            console.log(err.stack);
	            cb(err, null);
	        });
	    };

	    var current_assetsAsync = function current_assetsAsync() {
	        var self = this;
	        return new Promise(function (resolve, reject) {
	            co(regeneratorRuntime.mark(function _callee5() {
	                var balance, assets, draw_down;
	                return regeneratorRuntime.wrap(function _callee5$(_context5) {
	                    while (1) {
	                        switch (_context5.prev = _context5.next) {
	                            case 0:
	                                if (!(self.mode == 'spot')) {
	                                    _context5.next = 9;
	                                    break;
	                                }

	                                _context5.next = 3;
	                                return self.api.getBalance();

	                            case 3:
	                                balance = _context5.sent;

	                                assets = parseFloat(balance.jpy) + parseFloat(balance.btc * self.current_rate());
	                                self.current_yen = balance.jpy;
	                                self.current_btc = balance.btc;
	                                _context5.next = 18;
	                                break;

	                            case 9:
	                                if (!(self.mode == 'future')) {
	                                    _context5.next = 17;
	                                    break;
	                                }

	                                _context5.next = 12;
	                                return self.api.getLeverageBalance();

	                            case 12:
	                                balance = _context5.sent;

	                                assets = balance.margin.jpy;
	                                self.current_yen = assets;
	                                _context5.next = 18;
	                                break;

	                            case 17:
	                                reject('invalid mode');

	                            case 18:

	                                self.current_assets_all = assets;
	                                if (self.stats.max_asset < assets) {
	                                    self.stats.max_asset = assets;
	                                }
	                                draw_down = self.stats.max_asset - assets;

	                                if (self.stats.max_draw_down < draw_down) {
	                                    self.stats.max_draw_down = draw_down;
	                                }

	                                resolve(assets);

	                            case 23:
	                            case 'end':
	                                return _context5.stop();
	                        }
	                    }
	                }, _callee5, this);
	            })).catch(function (err) {
	                console.log(err.stack);
	                reject(err);
	            });
	        });
	    };

	    var current_rate = function current_rate() {
	        var last_trade = this.last_trade() || 0;
	        return last_trade.rate;
	    };

	    var last_trade = function last_trade() {
	        return this.trades[this.trades.length - 1] || undefined;
	    };

	    var Trader = function Trader(entity, config, option) {
	        this.entity = entity;
	        this.current_yen = config.jpy;
	        this.current_btc = config.btc;
	        this.current_assets_all = 0;
	        this.current_score = 0;

	        this.stats = {
	            max_asset: 0,
	            max_draw_down: 0,
	            order: {
	                buy: 0,
	                sell: 0,
	                long: 0,
	                short: 0
	            },
	            cancel_order: 0,
	            cancel_position: 0,
	            update_trade_count: 0
	        };

	        this.api = promisify(option.api);
	        this.publicApi = promisify(option.publicApi);
	        this.logger = option.logger || undefined;
	        this.calc_weight = option.calc_weight || 0.0001;
	        this.order_weight = option.order_weight || 0.0001;
	        this.order_threshold = option.order_threshold || 100;
	        this.close_threshold = option.close_threshold || this.order_threshold * 0.7;
	        this.order_allowed = option.order_allowed || false;
	        this.verbose = option.verbose || false;
	        this.use_tick = option.use_tick || false;
	        this.mode = option.mode || 'spot';

	        this.trades = [];

	        this.updateLogAsync = updateLogAsync;
	        this.applyTradesAsync = applyTradesAsync;
	        this.updateTradesAsync = updateTradesAsync;
	        this.updateAsync = updateAsync;
	        this.calcScore = calcScore;
	        this.createOrder = createOrder;
	        this.current_assetsAsync = current_assetsAsync;
	        this.current_rate = current_rate;
	        this.last_trade = last_trade;

	        this._createSpotOrder = _createSpotOrder;
	        this._createFutureOrder = _createFutureOrder;

	        //console.log(option);
	    };

	    return Trader;
	}();

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	const Promise = __webpack_require__(5);
	const args = __webpack_require__(16);

	// Unfortunately this list is not exhaustive, so if you find that a method does
	// not use a "standard"-ish name, you'll have to extend this list.
	var callbacks = ["cb", "callback", "callback_", "done"];

	/**
	 * Recursively operate over an object locating "asynchronous" functions by
	 * inspecting the last argument in the parameter signature for a callback.
	 *
	 * @param {*} exports - Should be a function or an object, identity other.
	 * @param {Function} test - Optional function to identify async methods.
	 * @param {String} parentKeyName - Tracks the keyName in a digestable format.
	 * @returns {*} exports - Identity.
	 */
	function processExports(exports, test, cached, parentKeyName) {
	  // Return early if this object has already been processed.
	  if (cached.indexOf(exports) > -1) {
	    return exports;
	  }

	  // Record this object in the cache.
	  cached.push(exports);

	  // Pass through if not an object or function.
	  if (typeof exports != "object" && typeof exports != "function") {
	    return exports;
	  }

	  var name = exports.name + "#";

	  // If a function, simply return it wrapped.
	  if (typeof exports === "function") {
	    // Find properties added to functions.
	    for (var keyName in exports) {
	      exports[keyName] = processExports(exports[keyName], test, cached, name);
	    }

	    // Assign the new function in place.
	    var wrapped = Promise.denodeify(exports);

	    // Find methods on the prototype, if there are any.
	    if (Object.keys(exports.prototype).length) {
	      processExports(exports.prototype, test, cached, name);
	    }

	    // Attach the augmented prototype.
	    wrapped.prototype = exports.prototype;

	    // Ensure attached properties to the previous function are accessible.
	    wrapped.__proto__ = exports;

	    return wrapped;
	  }

	  Object.keys(exports).map(function(keyName) {
	    // Convert to values.
	    return [keyName, exports[keyName]];
	  }).filter(function(keyVal) {
	    var keyName = keyVal[0];
	    var value = keyVal[1];

	    // If an object is encountered, recursively traverse.
	    if (typeof value === "object") {
	      processExports(exports, test, cached, keyName + ".");
	    }
	    // Filter to functions with callbacks only.
	    else if (typeof value === "function") {
	      // If a filter function exists, use this to determine if the function
	      // is asynchronous.
	      if (test) {
	        // Pass the function itself, its keyName, and the parent keyName.
	        return test(value, keyName, parentKeyName);
	      }

	      // If the callback name exists as the last argument, consider it an
	      // asynchronous function.  Brittle? Fragile? Effective.
	      if (callbacks.indexOf(args(value).slice(-1)[0]) > -1) {
	        return true;
	      }
	    }
	  }).forEach(function(keyVal) {
	    var keyName = keyVal[0];
	    var func = keyVal[1];

	    // Wrap this function and reassign.
	    exports[keyName] = processExports(func, test, cached, parentKeyName);
	  });

	  return exports;
	}

	/**
	 * Public API for Promisify.  Will resolve modules names using `require`.
	 *
	 * @param {*} name - Can be a module name, object, or function.
	 * @param {Function} test - Optional function to identify async methods.
	 * @returns {*} exports - The resolved value from require or passed in value.
	 */
	module.exports = function(name, test) {
	  var exports = name;

	  // If the name argument is a String, will need to resovle using the built in
	  // Node require function.
	  if (typeof name === "string") {
	    exports = __webpack_require__(17)(name);
	  }

	  // Iterate over all properties and find asynchronous functions to convert to
	  // promises.
	  return processExports(exports, test, []);
	};

	// Export callbacks to the module.
	module.exports.callbacks = callbacks;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(6)


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(7);
	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(15);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var asap = __webpack_require__(8);

	function noop() {}

	// States:
	//
	// 0 - pending
	// 1 - fulfilled with _value
	// 2 - rejected with _value
	// 3 - adopted the state of another promise, _value
	//
	// once the state is no longer pending (0) it is immutable

	// All `_` prefixed properties will be reduced to `_{random number}`
	// at build time to obfuscate them and discourage their use.
	// We don't use symbols or Object.defineProperty to fully hide them
	// because the performance isn't good enough.


	// to avoid using try/catch inside critical functions, we
	// extract them to here.
	var LAST_ERROR = null;
	var IS_ERROR = {};
	function getThen(obj) {
	  try {
	    return obj.then;
	  } catch (ex) {
	    LAST_ERROR = ex;
	    return IS_ERROR;
	  }
	}

	function tryCallOne(fn, a) {
	  try {
	    return fn(a);
	  } catch (ex) {
	    LAST_ERROR = ex;
	    return IS_ERROR;
	  }
	}
	function tryCallTwo(fn, a, b) {
	  try {
	    fn(a, b);
	  } catch (ex) {
	    LAST_ERROR = ex;
	    return IS_ERROR;
	  }
	}

	module.exports = Promise;

	function Promise(fn) {
	  if (typeof this !== 'object') {
	    throw new TypeError('Promises must be constructed via new');
	  }
	  if (typeof fn !== 'function') {
	    throw new TypeError('not a function');
	  }
	  this._55 = 0;
	  this._87 = null;
	  this._28 = [];
	  if (fn === noop) return;
	  doResolve(fn, this);
	}
	Promise._32 = noop;

	Promise.prototype.then = function(onFulfilled, onRejected) {
	  if (this.constructor !== Promise) {
	    return safeThen(this, onFulfilled, onRejected);
	  }
	  var res = new Promise(noop);
	  handle(this, new Handler(onFulfilled, onRejected, res));
	  return res;
	};

	function safeThen(self, onFulfilled, onRejected) {
	  return new self.constructor(function (resolve, reject) {
	    var res = new Promise(noop);
	    res.then(resolve, reject);
	    handle(self, new Handler(onFulfilled, onRejected, res));
	  });
	};
	function handle(self, deferred) {
	  while (self._55 === 3) {
	    self = self._87;
	  }
	  if (self._55 === 0) {
	    self._28.push(deferred);
	    return;
	  }
	  asap(function() {
	    var cb = self._55 === 1 ? deferred.onFulfilled : deferred.onRejected;
	    if (cb === null) {
	      if (self._55 === 1) {
	        resolve(deferred.promise, self._87);
	      } else {
	        reject(deferred.promise, self._87);
	      }
	      return;
	    }
	    var ret = tryCallOne(cb, self._87);
	    if (ret === IS_ERROR) {
	      reject(deferred.promise, LAST_ERROR);
	    } else if (ret && ret._55 === 2) {
	      reject(deferred.promise, ret._87);
	    } else {
	      resolve(deferred.promise, ret);
	    }
	  });
	}
	function resolve(self, newValue) {
	  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	  if (newValue === self) {
	    return reject(
	      self,
	      new TypeError('A promise cannot be resolved with itself.')
	    );
	  }
	  if (
	    newValue &&
	    (typeof newValue === 'object' || typeof newValue === 'function')
	  ) {
	    var then = getThen(newValue);
	    if (then === IS_ERROR) {
	      return reject(self, LAST_ERROR);
	    }
	    if (
	      then === self.then &&
	      newValue instanceof Promise
	    ) {
	      self._55 = 3;
	      self._87 = newValue;
	      finale(self);
	      return;
	    } else if (typeof then === 'function') {
	      doResolve(then.bind(newValue), self);
	      return;
	    }
	  }
	  self._55 = 1;
	  self._87 = newValue;
	  finale(self);
	}

	function reject(self, newValue) {
	  self._55 = 2;
	  self._87 = newValue;
	  finale(self);
	}
	function finale(self) {
	  for (var i = 0; i < self._28.length; i++) {
	    handle(self, self._28[i]);
	  }
	  self._28 = null;
	}

	function Handler(onFulfilled, onRejected, promise){
	  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	  this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, promise) {
	  var done = false;
	  var res = tryCallTwo(fn, function (value) {
	    if (done) return;
	    done = true;
	    resolve(promise, value);
	  }, function (reason) {
	    if (done) return;
	    done = true;
	    reject(promise, reason);
	  })
	  if (!done && res === IS_ERROR) {
	    done = true;
	    reject(promise, LAST_ERROR);
	  }
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var domain; // The domain module is executed on demand
	var hasSetImmediate = typeof setImmediate === "function";

	// Use the fastest means possible to execute a task in its own turn, with
	// priority over other events including network IO events in Node.js.
	//
	// An exception thrown by a task will permanently interrupt the processing of
	// subsequent tasks. The higher level `asap` function ensures that if an
	// exception is thrown by a task, that the task queue will continue flushing as
	// soon as possible, but if you use `rawAsap` directly, you are responsible to
	// either ensure that no exceptions are thrown from your task, or to manually
	// call `rawAsap.requestFlush` if an exception is thrown.
	module.exports = rawAsap;
	function rawAsap(task) {
	    if (!queue.length) {
	        requestFlush();
	        flushing = true;
	    }
	    // Avoids a function call
	    queue[queue.length] = task;
	}

	var queue = [];
	// Once a flush has been requested, no further calls to `requestFlush` are
	// necessary until the next `flush` completes.
	var flushing = false;
	// The position of the next task to execute in the task queue. This is
	// preserved between calls to `flush` so that it can be resumed if
	// a task throws an exception.
	var index = 0;
	// If a task schedules additional tasks recursively, the task queue can grow
	// unbounded. To prevent memory excaustion, the task queue will periodically
	// truncate already-completed tasks.
	var capacity = 1024;

	// The flush function processes all tasks that have been scheduled with
	// `rawAsap` unless and until one of those tasks throws an exception.
	// If a task throws an exception, `flush` ensures that its state will remain
	// consistent and will resume where it left off when called again.
	// However, `flush` does not make any arrangements to be called again if an
	// exception is thrown.
	function flush() {
	    while (index < queue.length) {
	        var currentIndex = index;
	        // Advance the index before calling the task. This ensures that we will
	        // begin flushing on the next task the task throws an error.
	        index = index + 1;
	        queue[currentIndex].call();
	        // Prevent leaking memory for long chains of recursive calls to `asap`.
	        // If we call `asap` within tasks scheduled by `asap`, the queue will
	        // grow, but to avoid an O(n) walk for every task we execute, we don't
	        // shift tasks off the queue after they have been executed.
	        // Instead, we periodically shift 1024 tasks off the queue.
	        if (index > capacity) {
	            // Manually shift all values starting at the index back to the
	            // beginning of the queue.
	            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
	                queue[scan] = queue[scan + index];
	            }
	            queue.length -= index;
	            index = 0;
	        }
	    }
	    queue.length = 0;
	    index = 0;
	    flushing = false;
	}

	rawAsap.requestFlush = requestFlush;
	function requestFlush() {
	    // Ensure flushing is not bound to any domain.
	    // It is not sufficient to exit the domain, because domains exist on a stack.
	    // To execute code outside of any domain, the following dance is necessary.
	    var parentDomain = process.domain;
	    if (parentDomain) {
	        if (!domain) {
	            // Lazy execute the domain module.
	            // Only employed if the user elects to use domains.
	            domain = __webpack_require__(9);
	        }
	        domain.active = process.domain = null;
	    }

	    // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
	    // cannot handle recursion.
	    // `requestFlush` will only be called recursively from `asap.js`, to resume
	    // flushing after an error is thrown into a domain.
	    // Conveniently, `setImmediate` was introduced in the same version
	    // `process.nextTick` started throwing recursion errors.
	    if (flushing && hasSetImmediate) {
	        setImmediate(flush);
	    } else {
	        process.nextTick(flush);
	    }

	    if (parentDomain) {
	        domain.active = process.domain = parentDomain;
	    }
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("domain");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Promise = __webpack_require__(7);

	module.exports = Promise;
	Promise.prototype.done = function (onFulfilled, onRejected) {
	  var self = arguments.length ? this.then.apply(this, arguments) : this;
	  self.then(null, function (err) {
	    setTimeout(function () {
	      throw err;
	    }, 0);
	  });
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Promise = __webpack_require__(7);

	module.exports = Promise;
	Promise.prototype['finally'] = function (f) {
	  return this.then(function (value) {
	    return Promise.resolve(f()).then(function () {
	      return value;
	    });
	  }, function (err) {
	    return Promise.resolve(f()).then(function () {
	      throw err;
	    });
	  });
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	//This file contains the ES6 extensions to the core Promises/A+ API

	var Promise = __webpack_require__(7);

	module.exports = Promise;

	/* Static Functions */

	var TRUE = valuePromise(true);
	var FALSE = valuePromise(false);
	var NULL = valuePromise(null);
	var UNDEFINED = valuePromise(undefined);
	var ZERO = valuePromise(0);
	var EMPTYSTRING = valuePromise('');

	function valuePromise(value) {
	  var p = new Promise(Promise._32);
	  p._55 = 1;
	  p._87 = value;
	  return p;
	}
	Promise.resolve = function (value) {
	  if (value instanceof Promise) return value;

	  if (value === null) return NULL;
	  if (value === undefined) return UNDEFINED;
	  if (value === true) return TRUE;
	  if (value === false) return FALSE;
	  if (value === 0) return ZERO;
	  if (value === '') return EMPTYSTRING;

	  if (typeof value === 'object' || typeof value === 'function') {
	    try {
	      var then = value.then;
	      if (typeof then === 'function') {
	        return new Promise(then.bind(value));
	      }
	    } catch (ex) {
	      return new Promise(function (resolve, reject) {
	        reject(ex);
	      });
	    }
	  }
	  return valuePromise(value);
	};

	Promise.all = function (arr) {
	  var args = Array.prototype.slice.call(arr);

	  return new Promise(function (resolve, reject) {
	    if (args.length === 0) return resolve([]);
	    var remaining = args.length;
	    function res(i, val) {
	      if (val && (typeof val === 'object' || typeof val === 'function')) {
	        if (val instanceof Promise && val.then === Promise.prototype.then) {
	          while (val._55 === 3) {
	            val = val._87;
	          }
	          if (val._55 === 1) return res(i, val._87);
	          if (val._55 === 2) reject(val._87);
	          val.then(function (val) {
	            res(i, val);
	          }, reject);
	          return;
	        } else {
	          var then = val.then;
	          if (typeof then === 'function') {
	            var p = new Promise(then.bind(val));
	            p.then(function (val) {
	              res(i, val);
	            }, reject);
	            return;
	          }
	        }
	      }
	      args[i] = val;
	      if (--remaining === 0) {
	        resolve(args);
	      }
	    }
	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	};

	Promise.reject = function (value) {
	  return new Promise(function (resolve, reject) {
	    reject(value);
	  });
	};

	Promise.race = function (values) {
	  return new Promise(function (resolve, reject) {
	    values.forEach(function(value){
	      Promise.resolve(value).then(resolve, reject);
	    });
	  });
	};

	/* Prototype Methods */

	Promise.prototype['catch'] = function (onRejected) {
	  return this.then(null, onRejected);
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// This file contains then/promise specific extensions that are only useful
	// for node.js interop

	var Promise = __webpack_require__(7);
	var asap = __webpack_require__(14);

	module.exports = Promise;

	/* Static Functions */

	Promise.denodeify = function (fn, argumentCount) {
	  argumentCount = argumentCount || Infinity;
	  return function () {
	    var self = this;
	    var args = Array.prototype.slice.call(arguments, 0,
	        argumentCount > 0 ? argumentCount : 0);
	    return new Promise(function (resolve, reject) {
	      args.push(function (err, res) {
	        if (err) reject(err);
	        else resolve(res);
	      })
	      var res = fn.apply(self, args);
	      if (res &&
	        (
	          typeof res === 'object' ||
	          typeof res === 'function'
	        ) &&
	        typeof res.then === 'function'
	      ) {
	        resolve(res);
	      }
	    })
	  }
	}
	Promise.nodeify = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments);
	    var callback =
	      typeof args[args.length - 1] === 'function' ? args.pop() : null;
	    var ctx = this;
	    try {
	      return fn.apply(this, arguments).nodeify(callback, ctx);
	    } catch (ex) {
	      if (callback === null || typeof callback == 'undefined') {
	        return new Promise(function (resolve, reject) {
	          reject(ex);
	        });
	      } else {
	        asap(function () {
	          callback.call(ctx, ex);
	        })
	      }
	    }
	  }
	}

	Promise.prototype.nodeify = function (callback, ctx) {
	  if (typeof callback != 'function') return this;

	  this.then(function (value) {
	    asap(function () {
	      callback.call(ctx, null, value);
	    });
	  }, function (err) {
	    asap(function () {
	      callback.call(ctx, err);
	    });
	  });
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var rawAsap = __webpack_require__(8);
	var freeTasks = [];

	/**
	 * Calls a task as soon as possible after returning, in its own event, with
	 * priority over IO events. An exception thrown in a task can be handled by
	 * `process.on("uncaughtException") or `domain.on("error")`, but will otherwise
	 * crash the process. If the error is handled, all subsequent tasks will
	 * resume.
	 *
	 * @param {{call}} task A callable object, typically a function that takes no
	 * arguments.
	 */
	module.exports = asap;
	function asap(task) {
	    var rawTask;
	    if (freeTasks.length) {
	        rawTask = freeTasks.pop();
	    } else {
	        rawTask = new RawTask();
	    }
	    rawTask.task = task;
	    rawTask.domain = process.domain;
	    rawAsap(rawTask);
	}

	function RawTask() {
	    this.task = null;
	    this.domain = null;
	}

	RawTask.prototype.call = function () {
	    if (this.domain) {
	        this.domain.enter();
	    }
	    var threw = true;
	    try {
	        this.task.call();
	        threw = false;
	        // If the task throws an exception (presumably) Node.js restores the
	        // domain stack for the next event.
	        if (this.domain) {
	            this.domain.exit();
	        }
	    } finally {
	        // We use try/finally and a threw flag to avoid messing up stack traces
	        // when we catch and release errors.
	        if (threw) {
	            // In Node.js, uncaught exceptions are considered fatal errors.
	            // Re-throw them to interrupt flushing!
	            // Ensure that flushing continues if an uncaught exception is
	            // suppressed listening process.on("uncaughtException") or
	            // domain.on("error").
	            rawAsap.requestFlush();
	        }
	        // If the task threw an error, we do not want to exit the domain here.
	        // Exiting the domain would prevent the domain from catching the error.
	        this.task = null;
	        this.domain = null;
	        freeTasks.push(this);
	    }
	};



/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Promise = __webpack_require__(7);

	module.exports = Promise;
	Promise.enableSynchronous = function () {
	  Promise.prototype.isPending = function() {
	    return this.getState() == 0;
	  };

	  Promise.prototype.isFulfilled = function() {
	    return this.getState() == 1;
	  };

	  Promise.prototype.isRejected = function() {
	    return this.getState() == 2;
	  };

	  Promise.prototype.getValue = Promise.prototype.value = function () {
	    if (this._55 === 3) {
	      return this._87.getValue();
	    }

	    if (!this.isFulfilled()) {
	      throw new Error('Cannot get a value of an unfulfilled promise.');
	    }

	    return this._87;
	  };

	  Promise.prototype.getReason = Promise.prototype.reason = function () {
	    if (this._55 === 3) {
	      return this._87.getReason();
	    }

	    if (!this.isRejected()) {
	      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
	    }

	    return this._87;
	  };

	  Promise.prototype.getState = function () {
	    if (this._55 === 3) {
	      return this._87.getState();
	    }

	    return this._55;
	  };
	};

	Promise.disableSynchronous = function() {
	  Promise.prototype.isPending = undefined;
	  Promise.prototype.isFulfilled = undefined;
	  Promise.prototype.isRejected = undefined;
	  Promise.prototype.value = undefined;
	  Promise.prototype.getValue = undefined;
	  Promise.prototype.reason = undefined;
	  Promise.prototype.getReason = undefined;
	  Promise.prototype.getState = undefined;
	};

	Promise.enableSynchronous();


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * Get the argument names from a given function.
	 *
	 * @param {Function} func - The function to parse.
	 * @returns {Array} arg - List of arguments in the function.
	 */
	module.exports = function(func) {
	  // First match everything inside the function argument parens.
	  var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
	 
	  // Split the arguments string into an array comma delimited.
	  return args.split(", ").map(function(arg) {
	    // Ensure no inline comments are parsed and trim the whitespace.
	    return arg.replace(/\/\*.*\*\//, "").trim();
	  }).filter(function(arg) {
	    // Ensure no undefineds are added.
	    return arg;
	  });
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./index": 4,
		"./index.js": 4,
		"./package": 20,
		"./package.json": 20,
		"./test/index": 21,
		"./test/index.js": 21,
		"./utils/args": 16,
		"./utils/args.js": 16
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 17;


/***/ },
/* 18 */,
/* 19 */,
/* 20 */
/***/ function(module, exports) {

	module.exports = {
		"_args": [
			[
				"promisify-node",
				"/Users/satetsu888/work/coincheck/lambda"
			]
		],
		"_from": "promisify-node@*",
		"_id": "promisify-node@0.3.0",
		"_inCache": true,
		"_installable": true,
		"_location": "/promisify-node",
		"_nodeVersion": "0.12.7",
		"_npmUser": {
			"email": "johnhaley81@gmail.com",
			"name": "johnhaley81"
		},
		"_npmVersion": "2.14.8",
		"_phantomChildren": {},
		"_requested": {
			"name": "promisify-node",
			"raw": "promisify-node",
			"rawSpec": "",
			"scope": null,
			"spec": "*",
			"type": "range"
		},
		"_requiredBy": [
			"/"
		],
		"_resolved": "https://registry.npmjs.org/promisify-node/-/promisify-node-0.3.0.tgz",
		"_shasum": "b4b55acf90faa7d2b8b90ca396899086c03060cf",
		"_shrinkwrap": null,
		"_spec": "promisify-node",
		"_where": "/Users/satetsu888/work/coincheck/lambda",
		"author": {
			"name": "Tim Branyen",
			"url": "@tbranyen"
		},
		"bugs": {
			"url": "https://github.com/nodegit/promisify-node/issues"
		},
		"dependencies": {
			"nodegit-promise": "~4.0.0"
		},
		"description": "Wrap Node-callback functions to return Promises.",
		"devDependencies": {
			"istanbul": "~0.2.7",
			"mocha": "~1.18.2"
		},
		"directories": {},
		"dist": {
			"shasum": "b4b55acf90faa7d2b8b90ca396899086c03060cf",
			"tarball": "http://registry.npmjs.org/promisify-node/-/promisify-node-0.3.0.tgz"
		},
		"gitHead": "193b0c4b954b3701d714b458f0e9142b4401dce3",
		"homepage": "https://github.com/nodegit/promisify-node#readme",
		"license": "MIT",
		"main": "index.js",
		"maintainers": [
			{
				"name": "tbranyen",
				"email": "tim@tabdeveloper.com"
			},
			{
				"name": "johnhaley81",
				"email": "johnhaley81@gmail.com"
			}
		],
		"name": "promisify-node",
		"optionalDependencies": {},
		"readme": "ERROR: No README data found!",
		"repository": {
			"type": "git",
			"url": "git+https://github.com/nodegit/promisify-node.git"
		},
		"scripts": {
			"test": "istanbul cover _mocha -- test"
		},
		"version": "0.3.0"
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {var promisify = __webpack_require__(4);
	var assert = __webpack_require__(22);

	describe("Promisify", function() {
	  it("can convert a basic async function", function() {
	    function test(cb) {
	      cb(null, true);
	    }

	    var wrappedTest = promisify(test);

	    return wrappedTest().then(function(value) {
	      assert.ok(value);
	    });
	  });

	  it("exports a callbacks array", function() {
	    assert(Array.isArray(promisify.callbacks));
	  });

	  describe("node modules", function() {
	    it("can be consumed", function() {
	      var fs = promisify("fs");
	      return fs.readFile(__dirname + "/../LICENSE");
	    });

	    it("can promisify the same object twice without breaking", function() {
	      var fs = promisify("fs");
	      fs = promisify("fs");

	      return fs.readFile(__dirname + "/../LICENSE");
	    });
	  });

	  describe("asynchronous method inference", function() {
	    var later = function(cb) {
	      setTimeout(cb(null), 0);
	    };

	    it("does not modify methods that do not appear to be asynchronous", function() {
	      var obj = {
	        a: function(probably, not, async) {}
	      };
	      var wrappedObj = promisify(obj);

	      assert.equal(
	        obj.a,
	        wrappedObj.a
	      );
	    });

	    it("can infer callback-accepting functions by argument list", function() {
	      var obj = promisify({
	        a: function(cb) { later(cb); }
	      });

	      return obj.a();
	    });

	    it("can infer callback-accepting functions by argument list", function() {
	      var obj = promisify({
	        a: function(callback) { later(callback); }
	      });

	      return obj.a();
	    });

	    it("can infer callback-accepting functions by argument list", function() {
	      var obj = promisify({
	        a: function(callback_) { later(callback_); }
	      });

	      return obj.a();
	    });

	    it("can infer callback-accepting functions by argument list", function() {
	      var obj = promisify({
	        a: function(done) { later(done); }
	      });

	      return obj.a();
	    });

	    it("can identify an asynchronous function by filter function", function() {
	      var obj = promisify({
	        a: function a() { arguments[0](); }
	      }, function(func) {
	        return func.name === "a";
	      });

	      return obj.a();
	    });

	    it("can iterate over prototypes", function() {
	      function Test() {}

	      Test.prototype = {
	        a: function a() { arguments[0](); }
	      };

	      promisify(Test, function(func, keyName, parentKeyName) {
	        return func.name === "a";
	      });

	      return new Test().a();
	    });
	  });
	});

	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = require("assert");

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = [
		{
			"id": 1,
			"rate": 36880,
			"order_type": "sell",
			"amount": 0.0951,
			"created_at": "2014-10-30T21:12:09.000Z"
		},
		{
			"id": 2,
			"rate": 38880,
			"order_type": "buy",
			"amount": 1.2366,
			"created_at": "2014-10-30T22:13:24.000Z"
		},
		{
			"id": 3,
			"rate": 39130,
			"order_type": "buy",
			"amount": 0.5094,
			"created_at": "2014-10-30T22:21:25.000Z"
		},
		{
			"id": 4,
			"rate": 39180,
			"order_type": "buy",
			"amount": 1.298,
			"created_at": "2014-10-30T22:47:23.000Z"
		},
		{
			"id": 5,
			"rate": 37680,
			"order_type": "sell",
			"amount": 0.0028,
			"created_at": "2014-10-30T23:10:24.000Z"
		},
		{
			"id": 6,
			"rate": 39040,
			"order_type": "buy",
			"amount": 0.1841,
			"created_at": "2014-10-30T23:56:23.000Z"
		},
		{
			"id": 7,
			"rate": 39040,
			"order_type": "buy",
			"amount": 0.8716,
			"created_at": "2014-10-30T23:59:23.000Z"
		},
		{
			"id": 8,
			"rate": 38920,
			"order_type": "buy",
			"amount": 0.1824,
			"created_at": "2014-10-31T00:57:25.000Z"
		},
		{
			"id": 9,
			"rate": 38920,
			"order_type": "buy",
			"amount": 0.0347,
			"created_at": "2014-10-31T01:00:25.000Z"
		},
		{
			"id": 10,
			"rate": 39310,
			"order_type": "buy",
			"amount": 0.0839,
			"created_at": "2014-10-31T01:54:26.000Z"
		},
		{
			"id": 11,
			"rate": 37510,
			"order_type": "sell",
			"amount": 0.0738,
			"created_at": "2014-10-31T02:12:26.000Z"
		},
		{
			"id": 12,
			"rate": 37330,
			"order_type": "sell",
			"amount": 0.8512,
			"created_at": "2014-10-31T16:28:07.000Z"
		},
		{
			"id": 13,
			"rate": 37090,
			"order_type": "sell",
			"amount": 0.5437,
			"created_at": "2014-10-31T16:41:08.000Z"
		},
		{
			"id": 14,
			"rate": 39000,
			"order_type": "buy",
			"amount": 0.1853,
			"created_at": "2014-10-31T20:17:05.000Z"
		},
		{
			"id": 15,
			"rate": 38880,
			"order_type": "buy",
			"amount": 0.7606,
			"created_at": "2014-10-31T20:38:03.000Z"
		},
		{
			"id": 16,
			"rate": 36680,
			"order_type": "sell",
			"amount": 0.9902,
			"created_at": "2014-11-01T00:29:10.000Z"
		},
		{
			"id": 17,
			"rate": 36720,
			"order_type": "sell",
			"amount": 0.1356,
			"created_at": "2014-11-01T00:58:10.000Z"
		},
		{
			"id": 18,
			"rate": 36870,
			"order_type": "sell",
			"amount": 1.1229,
			"created_at": "2014-11-01T01:32:05.000Z"
		},
		{
			"id": 19,
			"rate": 38070,
			"order_type": "buy",
			"amount": 1.4053,
			"created_at": "2014-11-01T04:59:05.000Z"
		},
		{
			"id": 20,
			"rate": 35620,
			"order_type": "sell",
			"amount": 0.7773,
			"created_at": "2014-11-01T05:07:07.000Z"
		},
		{
			"id": 21,
			"rate": 36090,
			"order_type": "sell",
			"amount": 0.3396,
			"created_at": "2014-11-01T05:15:07.000Z"
		},
		{
			"id": 22,
			"rate": 38350,
			"order_type": "buy",
			"amount": 0.7621,
			"created_at": "2014-11-01T16:52:04.000Z"
		},
		{
			"id": 23,
			"rate": 36590,
			"order_type": "sell",
			"amount": 0.9651,
			"created_at": "2014-11-01T17:51:03.000Z"
		},
		{
			"id": 24,
			"rate": 38070,
			"order_type": "buy",
			"amount": 1.1304,
			"created_at": "2014-11-01T18:37:08.000Z"
		},
		{
			"id": 25,
			"rate": 38070,
			"order_type": "buy",
			"amount": 0.1275,
			"created_at": "2014-11-01T18:39:08.000Z"
		},
		{
			"id": 26,
			"rate": 38380,
			"order_type": "buy",
			"amount": 0.6158,
			"created_at": "2014-11-01T22:58:06.000Z"
		},
		{
			"id": 28,
			"rate": 38460,
			"order_type": "buy",
			"amount": 0.2099,
			"created_at": "2014-11-02T00:21:06.000Z"
		},
		{
			"id": 29,
			"rate": 38160,
			"order_type": "buy",
			"amount": 0.4763,
			"created_at": "2014-11-02T01:37:08.000Z"
		},
		{
			"id": 30,
			"rate": 38570,
			"order_type": "buy",
			"amount": 0.5458,
			"created_at": "2014-11-02T04:05:04.000Z"
		},
		{
			"id": 31,
			"rate": 35840,
			"order_type": "buy",
			"amount": 0.01,
			"created_at": "2014-11-02T06:36:05.000Z"
		},
		{
			"id": 32,
			"rate": 36820,
			"order_type": "sell",
			"amount": 0.2324,
			"created_at": "2014-11-02T17:51:03.000Z"
		},
		{
			"id": 33,
			"rate": 38300,
			"order_type": "buy",
			"amount": 1.26,
			"created_at": "2014-11-02T18:53:05.000Z"
		},
		{
			"id": 34,
			"rate": 38080,
			"order_type": "buy",
			"amount": 0.896,
			"created_at": "2014-11-02T20:33:07.000Z"
		},
		{
			"id": 35,
			"rate": 37640,
			"order_type": "buy",
			"amount": 0.1124,
			"created_at": "2014-11-02T21:08:09.000Z"
		},
		{
			"id": 36,
			"rate": 38040,
			"order_type": "buy",
			"amount": 0.2382,
			"created_at": "2014-11-02T23:11:03.000Z"
		},
		{
			"id": 37,
			"rate": 38000,
			"order_type": "buy",
			"amount": 0.02,
			"created_at": "2014-11-02T23:47:48.000Z"
		},
		{
			"id": 38,
			"rate": 37600,
			"order_type": "buy",
			"amount": 0.2349,
			"created_at": "2014-11-03T00:26:05.000Z"
		},
		{
			"id": 39,
			"rate": 37870,
			"order_type": "buy",
			"amount": 0.0778,
			"created_at": "2014-11-03T01:14:07.000Z"
		},
		{
			"id": 40,
			"rate": 36060,
			"order_type": "sell",
			"amount": 1.0423,
			"created_at": "2014-11-03T01:30:08.000Z"
		},
		{
			"id": 41,
			"rate": 35910,
			"order_type": "sell",
			"amount": 0.1786,
			"created_at": "2014-11-03T06:08:03.000Z"
		},
		{
			"id": 42,
			"rate": 38110,
			"order_type": "buy",
			"amount": 1.0843,
			"created_at": "2014-11-03T21:52:21.000Z"
		},
		{
			"id": 43,
			"rate": 38110,
			"order_type": "buy",
			"amount": 0.4268,
			"created_at": "2014-11-03T21:52:22.000Z"
		},
		{
			"id": 44,
			"rate": 36440,
			"order_type": "sell",
			"amount": 0.0022,
			"created_at": "2014-11-03T21:52:24.000Z"
		},
		{
			"id": 45,
			"rate": 36440,
			"order_type": "sell",
			"amount": 0.29,
			"created_at": "2014-11-03T21:52:24.000Z"
		},
		{
			"id": 46,
			"rate": 38300,
			"order_type": "buy",
			"amount": 0.233,
			"created_at": "2014-11-03T23:12:31.000Z"
		},
		{
			"id": 47,
			"rate": 36430,
			"order_type": "sell",
			"amount": 0.6616,
			"created_at": "2014-11-04T00:01:08.000Z"
		},
		{
			"id": 48,
			"rate": 38230,
			"order_type": "buy",
			"amount": 0.6888,
			"created_at": "2014-11-04T01:28:10.000Z"
		},
		{
			"id": 49,
			"rate": 38230,
			"order_type": "buy",
			"amount": 0.9393,
			"created_at": "2014-11-04T01:40:11.000Z"
		},
		{
			"id": 51,
			"rate": 36490,
			"order_type": "sell",
			"amount": 0.1828,
			"created_at": "2014-11-04T02:55:03.000Z"
		},
		{
			"id": 53,
			"rate": 37130,
			"order_type": "sell",
			"amount": 0.0976,
			"created_at": "2014-11-04T15:23:04.000Z"
		},
		{
			"id": 54,
			"rate": 38380,
			"order_type": "buy",
			"amount": 0.4422,
			"created_at": "2014-11-04T15:27:03.000Z"
		},
		{
			"id": 55,
			"rate": 37050,
			"order_type": "sell",
			"amount": 0.1231,
			"created_at": "2014-11-04T17:30:06.000Z"
		},
		{
			"id": 56,
			"rate": 38970,
			"order_type": "buy",
			"amount": 0.3022,
			"created_at": "2014-11-04T21:20:08.000Z"
		},
		{
			"id": 57,
			"rate": 37460,
			"order_type": "sell",
			"amount": 1.145,
			"created_at": "2014-11-04T23:15:07.000Z"
		},
		{
			"id": 58,
			"rate": 37720,
			"order_type": "sell",
			"amount": 0.9866,
			"created_at": "2014-11-04T23:39:08.000Z"
		},
		{
			"id": 59,
			"rate": 37650,
			"order_type": "sell",
			"amount": 0.0274,
			"created_at": "2014-11-05T05:44:04.000Z"
		},
		{
			"id": 60,
			"rate": 39000,
			"order_type": "buy",
			"amount": 0.05,
			"created_at": "2014-11-05T05:45:07.000Z"
		},
		{
			"id": 61,
			"rate": 40440,
			"order_type": "buy",
			"amount": 0.1699,
			"created_at": "2014-11-05T06:16:09.000Z"
		},
		{
			"id": 62,
			"rate": 40610,
			"order_type": "buy",
			"amount": 0.4992,
			"created_at": "2014-11-05T06:38:10.000Z"
		},
		{
			"id": 63,
			"rate": 40680,
			"order_type": "buy",
			"amount": 0.2104,
			"created_at": "2014-11-05T06:51:07.000Z"
		},
		{
			"id": 64,
			"rate": 40640,
			"order_type": "buy",
			"amount": 0.06,
			"created_at": "2014-11-05T15:33:14.000Z"
		},
		{
			"id": 65,
			"rate": 40640,
			"order_type": "buy",
			"amount": 1.863,
			"created_at": "2014-11-05T15:35:55.000Z"
		},
		{
			"id": 66,
			"rate": 40080,
			"order_type": "buy",
			"amount": 0.54,
			"created_at": "2014-11-05T15:37:10.000Z"
		},
		{
			"id": 67,
			"rate": 40000,
			"order_type": "buy",
			"amount": 1.689,
			"created_at": "2014-11-05T15:57:38.000Z"
		},
		{
			"id": 68,
			"rate": 40000,
			"order_type": "sell",
			"amount": 0.811,
			"created_at": "2014-11-05T16:05:17.000Z"
		},
		{
			"id": 69,
			"rate": 38280,
			"order_type": "sell",
			"amount": 0.007,
			"created_at": "2014-11-05T17:46:03.000Z"
		},
		{
			"id": 70,
			"rate": 39920,
			"order_type": "buy",
			"amount": 0.1252505,
			"created_at": "2014-11-05T17:47:39.000Z"
		},
		{
			"id": 71,
			"rate": 38410,
			"order_type": "sell",
			"amount": 0.0998,
			"created_at": "2014-11-05T18:51:04.000Z"
		},
		{
			"id": 72,
			"rate": 39950,
			"order_type": "sell",
			"amount": 0.25,
			"created_at": "2014-11-05T18:55:42.000Z"
		},
		{
			"id": 73,
			"rate": 38880,
			"order_type": "sell",
			"amount": 0.7292,
			"created_at": "2014-11-05T20:10:04.000Z"
		},
		{
			"id": 74,
			"rate": 39900,
			"order_type": "buy",
			"amount": 0.0248,
			"created_at": "2014-11-05T20:44:25.000Z"
		},
		{
			"id": 75,
			"rate": 38890,
			"order_type": "sell",
			"amount": 0.1977,
			"created_at": "2014-11-05T21:56:02.000Z"
		},
		{
			"id": 76,
			"rate": 39999,
			"order_type": "buy",
			"amount": 0.112,
			"created_at": "2014-11-06T04:29:15.000Z"
		},
		{
			"id": 77,
			"rate": 39999,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-06T04:31:39.000Z"
		},
		{
			"id": 78,
			"rate": 40260,
			"order_type": "buy",
			"amount": 0.623,
			"created_at": "2014-11-06T05:50:06.000Z"
		},
		{
			"id": 79,
			"rate": 40020,
			"order_type": "buy",
			"amount": 0.2961,
			"created_at": "2014-11-06T06:03:10.000Z"
		},
		{
			"id": 80,
			"rate": 39320,
			"order_type": "sell",
			"amount": 0.0855,
			"created_at": "2014-11-06T06:57:03.000Z"
		},
		{
			"id": 81,
			"rate": 40770,
			"order_type": "buy",
			"amount": 0.01,
			"created_at": "2014-11-06T07:02:09.000Z"
		},
		{
			"id": 82,
			"rate": 39260,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:17:47.000Z"
		},
		{
			"id": 83,
			"rate": 39780,
			"order_type": "sell",
			"amount": 0.0011,
			"created_at": "2014-11-06T13:18:32.000Z"
		},
		{
			"id": 84,
			"rate": 39780,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:18:48.000Z"
		},
		{
			"id": 85,
			"rate": 39781,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-06T13:19:34.000Z"
		},
		{
			"id": 86,
			"rate": 39781,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:20:33.000Z"
		},
		{
			"id": 87,
			"rate": 41629,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:21:59.000Z"
		},
		{
			"id": 88,
			"rate": 39781,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:23:35.000Z"
		},
		{
			"id": 89,
			"rate": 39780,
			"order_type": "sell",
			"amount": 0.0069,
			"created_at": "2014-11-06T13:23:35.000Z"
		},
		{
			"id": 90,
			"rate": 39780,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:23:55.000Z"
		},
		{
			"id": 91,
			"rate": 41630,
			"order_type": "buy",
			"amount": 0.00102402,
			"created_at": "2014-11-06T13:24:39.000Z"
		},
		{
			"id": 92,
			"rate": 39781,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-06T13:25:58.000Z"
		},
		{
			"id": 93,
			"rate": 41170,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-06T13:30:51.000Z"
		},
		{
			"id": 94,
			"rate": 40130,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:31:40.000Z"
		},
		{
			"id": 95,
			"rate": 40130,
			"order_type": "sell",
			"amount": 0.00102402,
			"created_at": "2014-11-06T13:31:57.000Z"
		},
		{
			"id": 96,
			"rate": 41170,
			"order_type": "buy",
			"amount": 0.01,
			"created_at": "2014-11-06T13:34:25.000Z"
		},
		{
			"id": 97,
			"rate": 41170,
			"order_type": "buy",
			"amount": 0.02,
			"created_at": "2014-11-06T13:34:32.000Z"
		},
		{
			"id": 98,
			"rate": 41170,
			"order_type": "buy",
			"amount": 0.03,
			"created_at": "2014-11-06T13:35:08.000Z"
		},
		{
			"id": 99,
			"rate": 40150,
			"order_type": "sell",
			"amount": 0.06,
			"created_at": "2014-11-06T13:36:10.000Z"
		},
		{
			"id": 100,
			"rate": 41490,
			"order_type": "buy",
			"amount": 0.8,
			"created_at": "2014-11-06T13:37:14.000Z"
		},
		{
			"id": 101,
			"rate": 41490,
			"order_type": "buy",
			"amount": 0.523,
			"created_at": "2014-11-06T13:41:39.000Z"
		},
		{
			"id": 102,
			"rate": 41750,
			"order_type": "buy",
			"amount": 0.441,
			"created_at": "2014-11-06T13:43:04.000Z"
		},
		{
			"id": 103,
			"rate": 41920,
			"order_type": "buy",
			"amount": 1.421,
			"created_at": "2014-11-06T13:43:40.000Z"
		},
		{
			"id": 104,
			"rate": 41920,
			"order_type": "sell",
			"amount": 0.421,
			"created_at": "2014-11-06T13:45:04.000Z"
		},
		{
			"id": 105,
			"rate": 41920,
			"order_type": "sell",
			"amount": 0.158,
			"created_at": "2014-11-06T13:45:05.000Z"
		},
		{
			"id": 106,
			"rate": 41750,
			"order_type": "sell",
			"amount": 0.143,
			"created_at": "2014-11-06T13:45:05.000Z"
		},
		{
			"id": 107,
			"rate": 41750,
			"order_type": "sell",
			"amount": 0.416,
			"created_at": "2014-11-06T13:45:06.000Z"
		},
		{
			"id": 108,
			"rate": 41400,
			"order_type": "buy",
			"amount": 1,
			"created_at": "2014-11-06T13:45:33.000Z"
		},
		{
			"id": 109,
			"rate": 41400,
			"order_type": "buy",
			"amount": 0.21,
			"created_at": "2014-11-06T13:47:14.000Z"
		},
		{
			"id": 110,
			"rate": 42040,
			"order_type": "buy",
			"amount": 1.746,
			"created_at": "2014-11-06T13:47:14.000Z"
		},
		{
			"id": 111,
			"rate": 42920,
			"order_type": "buy",
			"amount": 0.044,
			"created_at": "2014-11-06T13:47:14.000Z"
		},
		{
			"id": 112,
			"rate": 42920,
			"order_type": "buy",
			"amount": 0.859,
			"created_at": "2014-11-06T13:47:40.000Z"
		},
		{
			"id": 113,
			"rate": 45000,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-06T13:47:40.000Z"
		},
		{
			"id": 114,
			"rate": 40090,
			"order_type": "sell",
			"amount": 0.006,
			"created_at": "2014-11-06T13:50:55.000Z"
		},
		{
			"id": 115,
			"rate": 40190,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-06T13:52:04.000Z"
		},
		{
			"id": 116,
			"rate": 40090,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-06T13:52:17.000Z"
		},
		{
			"id": 117,
			"rate": 40190,
			"order_type": "buy",
			"amount": 0.09,
			"created_at": "2014-11-06T13:53:05.000Z"
		},
		{
			"id": 119,
			"rate": 40190,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-06T13:53:45.000Z"
		},
		{
			"id": 120,
			"rate": 40190,
			"order_type": "buy",
			"amount": 0.008,
			"created_at": "2014-11-06T13:54:08.000Z"
		},
		{
			"id": 121,
			"rate": 42170,
			"order_type": "buy",
			"amount": 1,
			"created_at": "2014-11-06T13:55:13.000Z"
		},
		{
			"id": 122,
			"rate": 42170,
			"order_type": "buy",
			"amount": 0.04,
			"created_at": "2014-11-06T13:55:19.000Z"
		},
		{
			"id": 123,
			"rate": 42540,
			"order_type": "buy",
			"amount": 0.96,
			"created_at": "2014-11-06T13:55:19.000Z"
		},
		{
			"id": 124,
			"rate": 42540,
			"order_type": "buy",
			"amount": 0.12,
			"created_at": "2014-11-06T13:55:24.000Z"
		},
		{
			"id": 125,
			"rate": 42880,
			"order_type": "buy",
			"amount": 0.88,
			"created_at": "2014-11-06T13:55:24.000Z"
		},
		{
			"id": 126,
			"rate": 42880,
			"order_type": "buy",
			"amount": 0.24,
			"created_at": "2014-11-06T13:55:28.000Z"
		},
		{
			"id": 127,
			"rate": 43320,
			"order_type": "buy",
			"amount": 0.64,
			"created_at": "2014-11-06T13:55:28.000Z"
		},
		{
			"id": 128,
			"rate": 43340,
			"order_type": "buy",
			"amount": 1.12,
			"created_at": "2014-11-06T13:55:28.000Z"
		},
		{
			"id": 129,
			"rate": 41670,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-06T15:31:28.000Z"
		},
		{
			"id": 130,
			"rate": 41790,
			"order_type": "buy",
			"amount": 0.05,
			"created_at": "2014-11-06T17:27:29.000Z"
		},
		{
			"id": 131,
			"rate": 40170,
			"order_type": "sell",
			"amount": 1.696,
			"created_at": "2014-11-06T19:17:14.000Z"
		},
		{
			"id": 132,
			"rate": 40020,
			"order_type": "sell",
			"amount": 1.1942,
			"created_at": "2014-11-06T19:18:14.000Z"
		},
		{
			"id": 133,
			"rate": 41630,
			"order_type": "buy",
			"amount": 0.4217,
			"created_at": "2014-11-06T23:08:11.000Z"
		},
		{
			"id": 134,
			"rate": 40670,
			"order_type": "sell",
			"amount": 0.0226,
			"created_at": "2014-11-06T23:56:03.000Z"
		},
		{
			"id": 135,
			"rate": 41750,
			"order_type": "buy",
			"amount": 0.2096,
			"created_at": "2014-11-07T00:28:04.000Z"
		},
		{
			"id": 136,
			"rate": 41510,
			"order_type": "buy",
			"amount": 0.5383,
			"created_at": "2014-11-07T03:56:06.000Z"
		},
		{
			"id": 137,
			"rate": 40980,
			"order_type": "buy",
			"amount": 0.2546,
			"created_at": "2014-11-08T03:40:05.000Z"
		},
		{
			"id": 138,
			"rate": 41560,
			"order_type": "buy",
			"amount": 0.1677,
			"created_at": "2014-11-08T07:37:03.000Z"
		},
		{
			"id": 139,
			"rate": 41210,
			"order_type": "buy",
			"amount": 0.101,
			"created_at": "2014-11-08T15:39:05.000Z"
		},
		{
			"id": 140,
			"rate": 40790,
			"order_type": "buy",
			"amount": 0.419,
			"created_at": "2014-11-08T22:03:03.000Z"
		},
		{
			"id": 141,
			"rate": 41000,
			"order_type": "buy",
			"amount": 0.02,
			"created_at": "2014-11-09T14:27:03.000Z"
		},
		{
			"id": 142,
			"rate": 42000,
			"order_type": "buy",
			"amount": 0.02,
			"created_at": "2014-11-09T15:50:02.000Z"
		},
		{
			"id": 143,
			"rate": 42170,
			"order_type": "buy",
			"amount": 0.21603035,
			"created_at": "2014-11-09T15:50:02.000Z"
		},
		{
			"id": 144,
			"rate": 42500,
			"order_type": "buy",
			"amount": 0.16,
			"created_at": "2014-11-09T17:11:23.000Z"
		},
		{
			"id": 145,
			"rate": 42170,
			"order_type": "buy",
			"amount": 0.1647,
			"created_at": "2014-11-09T17:58:09.000Z"
		},
		{
			"id": 146,
			"rate": 42300,
			"order_type": "buy",
			"amount": 0.023,
			"created_at": "2014-11-09T18:24:14.000Z"
		},
		{
			"id": 147,
			"rate": 42360,
			"order_type": "buy",
			"amount": 0.1144,
			"created_at": "2014-11-09T20:33:05.000Z"
		},
		{
			"id": 148,
			"rate": 42500,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-09T23:40:15.000Z"
		},
		{
			"id": 149,
			"rate": 42320,
			"order_type": "buy",
			"amount": 0.03,
			"created_at": "2014-11-10T00:00:35.000Z"
		},
		{
			"id": 150,
			"rate": 42320,
			"order_type": "buy",
			"amount": 0.01,
			"created_at": "2014-11-10T00:05:18.000Z"
		},
		{
			"id": 151,
			"rate": 43000,
			"order_type": "buy",
			"amount": 0.08,
			"created_at": "2014-11-10T18:02:52.000Z"
		},
		{
			"id": 152,
			"rate": 42350,
			"order_type": "sell",
			"amount": 0.1252505,
			"created_at": "2014-11-10T19:10:13.000Z"
		},
		{
			"id": 153,
			"rate": 43000,
			"order_type": "buy",
			"amount": 1.106,
			"created_at": "2014-11-10T19:54:05.000Z"
		},
		{
			"id": 154,
			"rate": 42920,
			"order_type": "sell",
			"amount": 0.6589,
			"created_at": "2014-11-10T23:10:04.000Z"
		},
		{
			"id": 155,
			"rate": 43040,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-10T23:48:26.000Z"
		},
		{
			"id": 156,
			"rate": 43040,
			"order_type": "sell",
			"amount": 0.001,
			"created_at": "2014-11-10T23:51:06.000Z"
		},
		{
			"id": 157,
			"rate": 43140,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-10T23:52:25.000Z"
		},
		{
			"id": 158,
			"rate": 43800,
			"order_type": "buy",
			"amount": 0.00196529,
			"created_at": "2014-11-10T23:56:15.000Z"
		},
		{
			"id": 159,
			"rate": 42910,
			"order_type": "sell",
			"amount": 0.9396,
			"created_at": "2014-11-11T04:05:03.000Z"
		},
		{
			"id": 160,
			"rate": 43800,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-11T16:55:52.000Z"
		},
		{
			"id": 161,
			"rate": 43800,
			"order_type": "buy",
			"amount": 0.22716,
			"created_at": "2014-11-11T18:09:17.000Z"
		},
		{
			"id": 162,
			"rate": 43800,
			"order_type": "buy",
			"amount": 0.564,
			"created_at": "2014-11-11T18:18:05.000Z"
		},
		{
			"id": 163,
			"rate": 43800,
			"order_type": "buy",
			"amount": 0.16087471,
			"created_at": "2014-11-11T18:36:05.000Z"
		},
		{
			"id": 164,
			"rate": 44860,
			"order_type": "sell",
			"amount": 0.23,
			"created_at": "2014-11-11T19:52:50.000Z"
		},
		{
			"id": 165,
			"rate": 46000,
			"order_type": "buy",
			"amount": 0.05,
			"created_at": "2014-11-11T19:58:37.000Z"
		},
		{
			"id": 166,
			"rate": 47410,
			"order_type": "buy",
			"amount": 0.16,
			"created_at": "2014-11-11T19:58:37.000Z"
		},
		{
			"id": 167,
			"rate": 45090,
			"order_type": "sell",
			"amount": 0.3726,
			"created_at": "2014-11-11T20:48:03.000Z"
		},
		{
			"id": 168,
			"rate": 46830,
			"order_type": "buy",
			"amount": 0.8949,
			"created_at": "2014-11-11T22:38:07.000Z"
		},
		{
			"id": 169,
			"rate": 46830,
			"order_type": "buy",
			"amount": 0.033,
			"created_at": "2014-11-11T22:44:54.000Z"
		},
		{
			"id": 170,
			"rate": 46690,
			"order_type": "buy",
			"amount": 0.1981,
			"created_at": "2014-11-12T00:01:02.000Z"
		},
		{
			"id": 171,
			"rate": 46100,
			"order_type": "buy",
			"amount": 0.1527,
			"created_at": "2014-11-12T00:15:06.000Z"
		},
		{
			"id": 172,
			"rate": 44640,
			"order_type": "sell",
			"amount": 0.6568,
			"created_at": "2014-11-12T01:56:03.000Z"
		},
		{
			"id": 173,
			"rate": 47320,
			"order_type": "buy",
			"amount": 0.4151,
			"created_at": "2014-11-12T02:30:03.000Z"
		},
		{
			"id": 174,
			"rate": 47080,
			"order_type": "buy",
			"amount": 0.5,
			"created_at": "2014-11-12T04:24:40.000Z"
		},
		{
			"id": 175,
			"rate": 44850,
			"order_type": "sell",
			"amount": 1.7083,
			"created_at": "2014-11-12T04:28:07.000Z"
		},
		{
			"id": 176,
			"rate": 45210,
			"order_type": "sell",
			"amount": 0.0294,
			"created_at": "2014-11-12T05:36:08.000Z"
		},
		{
			"id": 177,
			"rate": 45170,
			"order_type": "sell",
			"amount": 0.1,
			"created_at": "2014-11-12T07:51:09.000Z"
		},
		{
			"id": 178,
			"rate": 47500,
			"order_type": "buy",
			"amount": 0.178,
			"created_at": "2014-11-12T10:18:06.000Z"
		},
		{
			"id": 179,
			"rate": 47500,
			"order_type": "buy",
			"amount": 0.322,
			"created_at": "2014-11-12T10:27:05.000Z"
		},
		{
			"id": 180,
			"rate": 52730,
			"order_type": "buy",
			"amount": 0.18964536,
			"created_at": "2014-11-12T15:24:26.000Z"
		},
		{
			"id": 181,
			"rate": 53100,
			"order_type": "buy",
			"amount": 0.9155,
			"created_at": "2014-11-12T15:32:04.000Z"
		},
		{
			"id": 182,
			"rate": 52520,
			"order_type": "buy",
			"amount": 0.19040365,
			"created_at": "2014-11-12T16:46:46.000Z"
		},
		{
			"id": 183,
			"rate": 49700,
			"order_type": "sell",
			"amount": 0.3984,
			"created_at": "2014-11-12T17:29:03.000Z"
		},
		{
			"id": 184,
			"rate": 52070,
			"order_type": "buy",
			"amount": 0.19204916,
			"created_at": "2014-11-12T17:45:01.000Z"
		},
		{
			"id": 185,
			"rate": 49600,
			"order_type": "sell",
			"amount": 0.1,
			"created_at": "2014-11-12T17:56:49.000Z"
		},
		{
			"id": 186,
			"rate": 50740,
			"order_type": "sell",
			"amount": 0.5,
			"created_at": "2014-11-12T18:10:16.000Z"
		},
		{
			"id": 187,
			"rate": 50740,
			"order_type": "sell",
			"amount": 0.05842,
			"created_at": "2014-11-12T18:11:19.000Z"
		},
		{
			"id": 188,
			"rate": 53510,
			"order_type": "sell",
			"amount": 0.6327,
			"created_at": "2014-11-12T19:28:08.000Z"
		},
		{
			"id": 189,
			"rate": 54720,
			"order_type": "buy",
			"amount": 0.09,
			"created_at": "2014-11-12T19:30:32.000Z"
		},
		{
			"id": 190,
			"rate": 53510,
			"order_type": "sell",
			"amount": 0.5283,
			"created_at": "2014-11-12T19:35:23.000Z"
		},
		{
			"id": 191,
			"rate": 53080,
			"order_type": "sell",
			"amount": 0.4617,
			"created_at": "2014-11-12T19:35:23.000Z"
		},
		{
			"id": 192,
			"rate": 54710,
			"order_type": "buy",
			"amount": 0.4056,
			"created_at": "2014-11-12T23:13:08.000Z"
		},
		{
			"id": 193,
			"rate": 54380,
			"order_type": "buy",
			"amount": 0.162,
			"created_at": "2014-11-12T23:58:26.000Z"
		},
		{
			"id": 194,
			"rate": 54380,
			"order_type": "buy",
			"amount": 0.2986,
			"created_at": "2014-11-13T00:17:04.000Z"
		},
		{
			"id": 195,
			"rate": 53990,
			"order_type": "buy",
			"amount": 0.0789,
			"created_at": "2014-11-13T01:07:06.000Z"
		},
		{
			"id": 196,
			"rate": 52110,
			"order_type": "buy",
			"amount": 0.1674,
			"created_at": "2014-11-13T02:31:03.000Z"
		},
		{
			"id": 197,
			"rate": 47230,
			"order_type": "sell",
			"amount": 0.7052,
			"created_at": "2014-11-13T02:34:04.000Z"
		},
		{
			"id": 198,
			"rate": 52180,
			"order_type": "buy",
			"amount": 0.019,
			"created_at": "2014-11-13T02:55:05.000Z"
		},
		{
			"id": 199,
			"rate": 51310,
			"order_type": "buy",
			"amount": 0.033,
			"created_at": "2014-11-13T04:11:10.000Z"
		},
		{
			"id": 200,
			"rate": 51510,
			"order_type": "buy",
			"amount": 0.0131,
			"created_at": "2014-11-13T04:40:03.000Z"
		},
		{
			"id": 201,
			"rate": 51510,
			"order_type": "buy",
			"amount": 0.384,
			"created_at": "2014-11-13T05:10:07.000Z"
		},
		{
			"id": 202,
			"rate": 49800,
			"order_type": "buy",
			"amount": 0.00246,
			"created_at": "2014-11-13T09:09:39.000Z"
		},
		{
			"id": 203,
			"rate": 45440,
			"order_type": "sell",
			"amount": 0.76,
			"created_at": "2014-11-13T13:41:01.000Z"
		},
		{
			"id": 204,
			"rate": 45360,
			"order_type": "sell",
			"amount": 0.24,
			"created_at": "2014-11-13T13:41:01.000Z"
		},
		{
			"id": 205,
			"rate": 47560,
			"order_type": "sell",
			"amount": 0.9652,
			"created_at": "2014-11-13T16:44:05.000Z"
		},
		{
			"id": 206,
			"rate": 48440,
			"order_type": "buy",
			"amount": 0.01032204,
			"created_at": "2014-11-13T17:15:28.000Z"
		},
		{
			"id": 207,
			"rate": 49160,
			"order_type": "buy",
			"amount": 0.03051262,
			"created_at": "2014-11-13T17:22:16.000Z"
		},
		{
			"id": 208,
			"rate": 48440,
			"order_type": "sell",
			"amount": 0.0078654,
			"created_at": "2014-11-13T17:27:02.000Z"
		},
		{
			"id": 209,
			"rate": 47240,
			"order_type": "buy",
			"amount": 0.0235,
			"created_at": "2014-11-13T18:14:08.000Z"
		},
		{
			"id": 210,
			"rate": 47120,
			"order_type": "buy",
			"amount": 0.0846,
			"created_at": "2014-11-13T20:22:02.000Z"
		},
		{
			"id": 211,
			"rate": 46200,
			"order_type": "buy",
			"amount": 0.0322,
			"created_at": "2014-11-13T20:51:02.000Z"
		},
		{
			"id": 212,
			"rate": 48190,
			"order_type": "buy",
			"amount": 0.1052,
			"created_at": "2014-11-13T22:23:03.000Z"
		},
		{
			"id": 213,
			"rate": 44760,
			"order_type": "sell",
			"amount": 0.02246,
			"created_at": "2014-11-14T01:34:03.000Z"
		},
		{
			"id": 214,
			"rate": 44860,
			"order_type": "sell",
			"amount": 0.0388,
			"created_at": "2014-11-14T03:15:02.000Z"
		},
		{
			"id": 215,
			"rate": 48190,
			"order_type": "buy",
			"amount": 0.0211,
			"created_at": "2014-11-14T03:44:02.000Z"
		},
		{
			"id": 216,
			"rate": 45400,
			"order_type": "sell",
			"amount": 0.0426,
			"created_at": "2014-11-14T04:18:06.000Z"
		},
		{
			"id": 217,
			"rate": 46920,
			"order_type": "buy",
			"amount": 0.3323,
			"created_at": "2014-11-14T06:05:03.000Z"
		},
		{
			"id": 218,
			"rate": 48580,
			"order_type": "buy",
			"amount": 0.4433,
			"created_at": "2014-11-14T07:09:06.000Z"
		},
		{
			"id": 219,
			"rate": 47600,
			"order_type": "buy",
			"amount": 0.0307,
			"created_at": "2014-11-14T15:00:03.000Z"
		},
		{
			"id": 220,
			"rate": 45130,
			"order_type": "sell",
			"amount": 0.7286,
			"created_at": "2014-11-14T15:48:03.000Z"
		},
		{
			"id": 221,
			"rate": 48340,
			"order_type": "buy",
			"amount": 0.4192,
			"created_at": "2014-11-14T16:03:03.000Z"
		},
		{
			"id": 222,
			"rate": 45270,
			"order_type": "sell",
			"amount": 1.1283,
			"created_at": "2014-11-14T16:27:06.000Z"
		},
		{
			"id": 223,
			"rate": 45270,
			"order_type": "sell",
			"amount": 0.4097,
			"created_at": "2014-11-14T16:31:02.000Z"
		},
		{
			"id": 224,
			"rate": 44850,
			"order_type": "sell",
			"amount": 0.6855,
			"created_at": "2014-11-14T16:58:04.000Z"
		},
		{
			"id": 225,
			"rate": 44850,
			"order_type": "sell",
			"amount": 0.00113,
			"created_at": "2014-11-14T17:04:44.000Z"
		},
		{
			"id": 226,
			"rate": 44850,
			"order_type": "sell",
			"amount": 0.00113,
			"created_at": "2014-11-14T17:08:17.000Z"
		},
		{
			"id": 227,
			"rate": 44770,
			"order_type": "sell",
			"amount": 0.00113,
			"created_at": "2014-11-14T18:27:32.000Z"
		},
		{
			"id": 228,
			"rate": 45040,
			"order_type": "sell",
			"amount": 0.00112,
			"created_at": "2014-11-14T19:15:43.000Z"
		},
		{
			"id": 229,
			"rate": 44990,
			"order_type": "sell",
			"amount": 0.1858,
			"created_at": "2014-11-14T20:00:03.000Z"
		},
		{
			"id": 230,
			"rate": 45310,
			"order_type": "sell",
			"amount": 0.3904,
			"created_at": "2014-11-15T03:23:04.000Z"
		},
		{
			"id": 231,
			"rate": 47130,
			"order_type": "buy",
			"amount": 0.7432,
			"created_at": "2014-11-15T05:04:03.000Z"
		},
		{
			"id": 232,
			"rate": 44760,
			"order_type": "sell",
			"amount": 0.04456412,
			"created_at": "2014-11-15T09:35:34.000Z"
		},
		{
			"id": 233,
			"rate": 42820,
			"order_type": "sell",
			"amount": 0.09433588,
			"created_at": "2014-11-15T09:35:34.000Z"
		},
		{
			"id": 234,
			"rate": 47520,
			"order_type": "buy",
			"amount": 0.421,
			"created_at": "2014-11-15T16:03:02.000Z"
		},
		{
			"id": 235,
			"rate": 44140,
			"order_type": "sell",
			"amount": 0.1251,
			"created_at": "2014-11-15T18:36:02.000Z"
		},
		{
			"id": 236,
			"rate": 46820,
			"order_type": "buy",
			"amount": 0.212,
			"created_at": "2014-11-15T19:33:40.000Z"
		},
		{
			"id": 237,
			"rate": 44820,
			"order_type": "sell",
			"amount": 0.0782,
			"created_at": "2014-11-15T22:24:03.000Z"
		},
		{
			"id": 238,
			"rate": 44270,
			"order_type": "sell",
			"amount": 0.00228,
			"created_at": "2014-11-15T22:30:03.000Z"
		},
		{
			"id": 239,
			"rate": 44770,
			"order_type": "sell",
			"amount": 0.00112,
			"created_at": "2014-11-15T23:36:06.000Z"
		},
		{
			"id": 240,
			"rate": 47130,
			"order_type": "buy",
			"amount": 0.1566,
			"created_at": "2014-11-15T23:44:03.000Z"
		},
		{
			"id": 241,
			"rate": 45520,
			"order_type": "sell",
			"amount": 0.3432,
			"created_at": "2014-11-16T03:19:02.000Z"
		},
		{
			"id": 242,
			"rate": 47340,
			"order_type": "buy",
			"amount": 0.2388,
			"created_at": "2014-11-16T03:23:03.000Z"
		},
		{
			"id": 243,
			"rate": 45610,
			"order_type": "sell",
			"amount": 0.8372,
			"created_at": "2014-11-16T03:34:02.000Z"
		},
		{
			"id": 244,
			"rate": 45280,
			"order_type": "sell",
			"amount": 0.22,
			"created_at": "2014-11-16T03:41:05.000Z"
		},
		{
			"id": 245,
			"rate": 47740,
			"order_type": "buy",
			"amount": 0.0404,
			"created_at": "2014-11-16T05:15:03.000Z"
		},
		{
			"id": 246,
			"rate": 47340,
			"order_type": "buy",
			"amount": 0.084,
			"created_at": "2014-11-16T07:10:03.000Z"
		},
		{
			"id": 247,
			"rate": 43580,
			"order_type": "sell",
			"amount": 0.05766,
			"created_at": "2014-11-16T08:23:58.000Z"
		},
		{
			"id": 248,
			"rate": 46280,
			"order_type": "buy",
			"amount": 1.19,
			"created_at": "2014-11-16T15:14:08.000Z"
		},
		{
			"id": 249,
			"rate": 46950,
			"order_type": "buy",
			"amount": 0.506,
			"created_at": "2014-11-16T15:20:26.000Z"
		},
		{
			"id": 250,
			"rate": 47250,
			"order_type": "buy",
			"amount": 0.65968465,
			"created_at": "2014-11-16T15:23:40.000Z"
		},
		{
			"id": 251,
			"rate": 47490,
			"order_type": "buy",
			"amount": 0.1982,
			"created_at": "2014-11-16T16:34:03.000Z"
		},
		{
			"id": 252,
			"rate": 45630,
			"order_type": "sell",
			"amount": 0.3656,
			"created_at": "2014-11-16T16:54:07.000Z"
		},
		{
			"id": 253,
			"rate": 47440,
			"order_type": "buy",
			"amount": 0.1777,
			"created_at": "2014-11-16T16:59:03.000Z"
		},
		{
			"id": 254,
			"rate": 46580,
			"order_type": "sell",
			"amount": 0.2854,
			"created_at": "2014-11-16T17:10:03.000Z"
		},
		{
			"id": 255,
			"rate": 48300,
			"order_type": "buy",
			"amount": 0.4353,
			"created_at": "2014-11-16T17:41:02.000Z"
		},
		{
			"id": 256,
			"rate": 48350,
			"order_type": "buy",
			"amount": 0.01,
			"created_at": "2014-11-16T17:52:19.000Z"
		},
		{
			"id": 257,
			"rate": 48350,
			"order_type": "buy",
			"amount": 0.107,
			"created_at": "2014-11-16T18:11:03.000Z"
		},
		{
			"id": 258,
			"rate": 48440,
			"order_type": "buy",
			"amount": 0.304,
			"created_at": "2014-11-16T18:11:03.000Z"
		},
		{
			"id": 259,
			"rate": 48880,
			"order_type": "buy",
			"amount": 0.268,
			"created_at": "2014-11-16T19:34:21.000Z"
		},
		{
			"id": 260,
			"rate": 49460,
			"order_type": "buy",
			"amount": 0.732,
			"created_at": "2014-11-16T19:34:21.000Z"
		},
		{
			"id": 261,
			"rate": 46970,
			"order_type": "sell",
			"amount": 0.0633,
			"created_at": "2014-11-16T19:37:03.000Z"
		},
		{
			"id": 262,
			"rate": 48400,
			"order_type": "buy",
			"amount": 0.592,
			"created_at": "2014-11-16T19:41:27.000Z"
		},
		{
			"id": 263,
			"rate": 48690,
			"order_type": "buy",
			"amount": 0.408,
			"created_at": "2014-11-16T19:41:27.000Z"
		},
		{
			"id": 264,
			"rate": 48300,
			"order_type": "buy",
			"amount": 0.01,
			"created_at": "2014-11-16T20:52:04.000Z"
		},
		{
			"id": 265,
			"rate": 47110,
			"order_type": "sell",
			"amount": 1.2188,
			"created_at": "2014-11-16T21:56:02.000Z"
		},
		{
			"id": 266,
			"rate": 48670,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-16T23:29:11.000Z"
		},
		{
			"id": 267,
			"rate": 49650,
			"order_type": "buy",
			"amount": 0.02004,
			"created_at": "2014-11-17T01:17:14.000Z"
		},
		{
			"id": 268,
			"rate": 47840,
			"order_type": "sell",
			"amount": 0.451,
			"created_at": "2014-11-17T02:28:03.000Z"
		},
		{
			"id": 269,
			"rate": 47080,
			"order_type": "sell",
			"amount": 0.5737,
			"created_at": "2014-11-17T03:49:04.000Z"
		},
		{
			"id": 270,
			"rate": 49690,
			"order_type": "buy",
			"amount": 0.2,
			"created_at": "2014-11-17T03:51:02.000Z"
		},
		{
			"id": 271,
			"rate": 47030,
			"order_type": "sell",
			"amount": 0.0384,
			"created_at": "2014-11-17T05:56:21.000Z"
		},
		{
			"id": 272,
			"rate": 47660,
			"order_type": "buy",
			"amount": 0.4175,
			"created_at": "2014-11-17T15:23:37.000Z"
		},
		{
			"id": 273,
			"rate": 47240,
			"order_type": "buy",
			"amount": 0.02,
			"created_at": "2014-11-17T15:40:22.000Z"
		},
		{
			"id": 274,
			"rate": 48440,
			"order_type": "buy",
			"amount": 0.03,
			"created_at": "2014-11-17T16:29:06.000Z"
		},
		{
			"id": 275,
			"rate": 48580,
			"order_type": "buy",
			"amount": 0.001,
			"created_at": "2014-11-17T16:41:20.000Z"
		},
		{
			"id": 276,
			"rate": 47980,
			"order_type": "buy",
			"amount": 0.012,
			"created_at": "2014-11-17T17:28:37.000Z"
		},
		{
			"id": 277,
			"rate": 47980,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-17T17:36:54.000Z"
		},
		{
			"id": 278,
			"rate": 48140,
			"order_type": "buy",
			"amount": 0.103,
			"created_at": "2014-11-17T18:08:43.000Z"
		},
		{
			"id": 279,
			"rate": 46260,
			"order_type": "sell",
			"amount": 0.3801,
			"created_at": "2014-11-17T18:12:04.000Z"
		},
		{
			"id": 280,
			"rate": 47290,
			"order_type": "buy",
			"amount": 0.3,
			"created_at": "2014-11-17T18:29:10.000Z"
		},
		{
			"id": 281,
			"rate": 47850,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-17T18:37:08.000Z"
		},
		{
			"id": 282,
			"rate": 46300,
			"order_type": "sell",
			"amount": 0.8676,
			"created_at": "2014-11-17T18:57:04.000Z"
		},
		{
			"id": 283,
			"rate": 47430,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-17T18:58:58.000Z"
		},
		{
			"id": 284,
			"rate": 47520,
			"order_type": "buy",
			"amount": 0.4291,
			"created_at": "2014-11-17T19:18:07.000Z"
		},
		{
			"id": 285,
			"rate": 47520,
			"order_type": "buy",
			"amount": 0.3491,
			"created_at": "2014-11-17T19:35:03.000Z"
		},
		{
			"id": 286,
			"rate": 48000,
			"order_type": "buy",
			"amount": 0.089,
			"created_at": "2014-11-17T20:34:41.000Z"
		},
		{
			"id": 287,
			"rate": 48600,
			"order_type": "buy",
			"amount": 0.111,
			"created_at": "2014-11-17T20:34:41.000Z"
		},
		{
			"id": 288,
			"rate": 47690,
			"order_type": "buy",
			"amount": 0.0625,
			"created_at": "2014-11-17T20:47:38.000Z"
		},
		{
			"id": 289,
			"rate": 47690,
			"order_type": "buy",
			"amount": 0.0208,
			"created_at": "2014-11-17T20:57:38.000Z"
		},
		{
			"id": 290,
			"rate": 47690,
			"order_type": "buy",
			"amount": 0.5502,
			"created_at": "2014-11-17T20:59:49.000Z"
		},
		{
			"id": 291,
			"rate": 47900,
			"order_type": "buy",
			"amount": 0.4498,
			"created_at": "2014-11-17T20:59:49.000Z"
		},
		{
			"id": 292,
			"rate": 46640,
			"order_type": "buy",
			"amount": 0.005,
			"created_at": "2014-11-17T21:10:57.000Z"
		},
		{
			"id": 293,
			"rate": 47010,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-17T21:42:38.000Z"
		},
		{
			"id": 294,
			"rate": 47010,
			"order_type": "buy",
			"amount": 0.002,
			"created_at": "2014-11-17T21:44:29.000Z"
		},
		{
			"id": 295,
			"rate": 46400,
			"order_type": "sell",
			"amount": 0.076,
			"created_at": "2014-11-18T00:18:02.000Z"
		},
		{
			"id": 296,
			"rate": 46730,
			"order_type": "buy",
			"amount": 0.1,
			"created_at": "2014-11-18T01:27:07.000Z"
		},
		{
			"id": 297,
			"rate": 46400,
			"order_type": "sell",
			"amount": 0.024,
			"created_at": "2014-11-18T02:18:02.000Z"
		},
		{
			"id": 298,
			"rate": 46600,
			"order_type": "buy",
			"amount": 0.06309434,
			"created_at": "2014-11-18T03:28:52.000Z"
		},
		{
			"id": 299,
			"rate": 46600,
			"order_type": "buy",
			"amount": 0.01,
			"created_at": "2014-11-18T03:30:49.000Z"
		},
		{
			"id": 300,
			"rate": 46960,
			"order_type": "buy",
			"amount": 0.577,
			"created_at": "2014-11-18T04:40:04.000Z"
		},
		{
			"id": 301,
			"rate": 46100,
			"order_type": "buy",
			"amount": 0.1427,
			"created_at": "2014-11-18T05:06:03.000Z"
		},
		{
			"id": 302,
			"rate": 46080,
			"order_type": "sell",
			"amount": 0.0305,
			"created_at": "2014-11-18T06:11:27.000Z"
		},
		{
			"id": 303,
			"rate": 46080,
			"order_type": "sell",
			"amount": 0.734,
			"created_at": "2014-11-18T06:27:03.000Z"
		},
		{
			"id": 304,
			"rate": 46500,
			"order_type": "sell",
			"amount": 0.03,
			"created_at": "2014-11-18T07:09:03.000Z"
		}
	];

/***/ }
/******/ ]);