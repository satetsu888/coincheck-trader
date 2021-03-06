module.exports = (function(){
    'use strict';

    var co = require('co');
    var promisify = require('promisify-node');

    var updateLogAsync = function(trader){
        var self = this;
        return new Promise(function(resolve, reject){
            if(self.logger){
                self.logger.log(trader, function(){
                    resolve(trader);
                });
            } else {
                resolve(trader);
            }
        });
    };

    var applyTradesAsync = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            co(function* (){
                if(!self.order_allowed){
                    resolve();
                    return;
                };
                var current_date = 0;
                if(self.last_trade()){
                    current_date = new Date(self.last_trade().created_at);
                }

                var result = yield self.api.activeOrders();
                var orders = result.orders;
                //console.log(orders);
                for(var i=0;i<orders.length;i++){
                    var order_cancel_date = new Date(orders[i].created_at);
                    order_cancel_date.setHours(order_cancel_date.getHours() + 5);
                    if(order_cancel_date < current_date){
                        self.stats.cancel_order++;
                        yield self.api.cancelOrder(orders[i].id);
                    }

                };

                var positionsResult = yield self.api.getLeveragePositions('open');
                var positions = positionsResult.data;
                for(var i=0;i<positions.length;i++){
                    var position_cancel_date = new Date(positions[i].created_at);
                    position_cancel_date.setHours(position_cancel_date.getHours() + 10);
                    if(position_cancel_date < current_date){
                        self.stats.cancel_position++;
                        var action;
                        if(positions[i].side == "buy"){
                            action = "close_long";
                        } else {
                            action = "close_short";
                        }
                        yield self.api.closeTrade(
                            "btc_jpy",
                            action,
                            null,
                            positions[i].amount,
                            positions[i].id
                        );
                    }

                };

                resolve();
            }).catch(function(err){
                console.log(err.stack);
                reject(err);
            });
        });
    };

    var updateTradesAsync = function(trade){
        var self = this;
        return new Promise(function(resolve, reject){

            self.trades.push(trade);
            self.stats.update_trade_count++;

            if(self.trades.length <= 100){
                resolve(self);
                return;
            }

            self.trades.shift();

            if(!self.order_allowed){
                console.log("order not allowed");
                resolve(self);
                return;
            }
            resolve(self);
        });
    };

    var updateAsync = function(trade){
        var self = this;
        return new Promise(function(resolve, reject){
            co(function* (){
                yield self.updateTradesAsync(trade);
                self.current_score = self.calcScore(self.trades, {});
                yield self.applyTradesAsync();
                yield self.createOrderAsync(self.trades);
                yield self.updateLogAsync(self);
                resolve(self);
            }).catch(function(err){
                console.log(err.stack);
                reject(err);
                return;
            });
        });
    };

    var calcScore = function(trades, option){
        var self = this;
        var score = 0;

        var trades_rate_sum = 0;
        var trades_rate_ave;
        var trades_rate_var = 0;
        var trades_rate_sd = 0;
        var trades_amount_sum = 0;
        var trades_amount_ave;
        var trades_amount_var = 0;
        var trades_amount_sd = 0;

        for(var i=0;i<trades.length;i++){
            trades_rate_sum += parseFloat(trades[i].rate);
            trades_amount_sum += parseFloat(trades[i].amount);
        }

        trades_rate_ave = trades_rate_sum / trades.length;
        trades_amount_ave = trades_amount_sum / trades.length;

        for(var i=0;i<trades.length;i++){
            trades_rate_var += Math.pow(trades[i].rate - trades_rate_ave, 2);
            trades_amount_var += Math.pow(trades[i].amount - trades_amount_ave, 2);
        }
        trades_rate_var = trades_rate_var / trades.length;
        trades_amount_var = trades_amount_var / trades.length;
        trades_rate_sd = Math.sqrt(trades_rate_var);
        trades_amount_sd = Math.sqrt(trades_amount_var);


        var sign;
        trades.forEach(function(element, index){
            if( element.order_type == "buy"){
                sign = 1;
            } else if( element.order_type == "sell"){
                sign = -1;
            }

            var delta = sign *  ( (element.amount - trades_amount_ave) / trades_amount_sd ) * ( (element.rate - trades_rate_ave) / trades_rate_sd ) * self.entity[index] * self.calc_weight;
            score += delta;
        });
        score += 10 * self.entity[100] * (self.current_yen / self.current_rate() - self.current_btc);

        return score;
    };

    var createOrder = function(trades, cb){
        var self = this;

        if(self.mode == 'spot'){
            self._createSpotOrder(cb);
        } else if(self.mode == 'future'){
            self._createFutureOrder(cb);
        } else {
            console.log('invalid mode: ' + self.mode);
            cb('invalid mode', null);
        }
    };

    var createOrderAsync = function(trades){
        var self = this;
        return new Promise(function(resolve, reject){
            self.createOrder(trades, function(err, result){
                if(err){
                    console.log(err);
                    reject(err);
                    return;
                } else {
                    resolve(result);
                }
            });
        });
    };

    var _createSpotOrder = function(cb){
        var self = this;

        var amount = Math.floor(Math.abs(self.order_weight * self.current_score * self.entity[101]) * 10000) / 10000;

        co(function* (){
            var ticker;
            if(self.use_tick){
                ticker = yield new Promise(function(resolve, reject){
                    self.publicApi.ticker(function(err, result){
                        if(err){
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            }
            if(self.verbose){
                console.log("tick: " + JSON.stringify(ticker));
            }

            if(self.current_score < -1 * self.order_threshold && self.current_btc > 0.01){
                var rate = self.current_rate();
                if(self.use_tick){
                   rate = Math.max(self.current_rate(), ticker.ask);
                }
                self.stats.order.sell++;
                return yield self.api.trade(
                    "btc_jpy",
                    "sell",
                    rate,
                    amount
                );
            } else if(self.order_threshold < self.current_score && (self.current_yen / self.current_rate()) > 0.01){
                var rate = self.current_rate();
                if(self.use_tick){
                   rate = Math.min(self.current_rate(), ticker.bid);
                }
                self.stats.order.buy++;
                return yield self.api.trade(
                    "btc_jpy",
                    "buy",
                    rate,
                    amount
                );
            }
        }).then(function(result){
            if(result && self.verbose){
                console.log(result);
            }
            if(self.verbose){
                console.log("current score: " + self.current_score);
            }
            cb(null, self);
        }).catch(function(err){
            console.log(err);
            console.log(err.stack);
            cb(err, null);
        });
    };

    var _createFutureOrder = function(cb){
        var self = this;

        var amount = Math.floor(Math.abs(self.order_weight * self.current_score * self.entity[101]) * 10000) / 10000;

        co(function* (){
            var ticker;
            if(self.use_tick){
                ticker = yield new Promise(function(resolve, reject){
                    self.publicApi.ticker(function(err, result){
                        if(err){
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            }
            if(self.verbose){
                console.log("tick: " + JSON.stringify(ticker));
            }

            var positionsResult = yield self.api.getLeveragePositions('open');
            var positions = positionsResult.data;
            var shortPositions = positions.filter(function(position){
                if(position.side == "sell"){
                    return true;
                } else {
                    return false;
                }
            });
            var longPositions = positions.filter(function(position){
                if(position.side == "buy"){
                    return true;
                } else {
                    return false;
                }
            });
            var rate = self.current_rate();
            if(self.use_tick){
                rate = Math.max(self.current_rate(), ticker.ask);
            }

            var result = yield self.api.activeOrders();
            var orders = result.orders;

            if(positions.length == 0 && self.current_score < -1 * self.order_threshold){
                for(var i=0;i<orders.length;i++){
                    yield self.api.cancelOrder(orders[i].id);
                }
                if(self.use_tick){
                    rate = Math.max(self.current_rate(), ticker.ask);
                }

                self.stats.order.short++;
                return yield self.api.trade(
                    "btc_jpy",
                    "leverage_sell",
                    rate,
                    amount
                );
            } else if(positions.length == 0 && self.order_threshold < self.current_score){
                for(var i=0;i<orders.length;i++){
                    yield self.api.cancelOrder(orders[i].id);
                }
                if(self.use_tick){
                   rate = Math.min(self.current_rate(), ticker.bid);
                }

                self.stats.order.long++;
                return yield self.api.trade(
                    "btc_jpy",
                    "leverage_buy",
                    rate,
                    amount
                );
            } else if(longPositions.length > 0 && self.current_score < -1 * self.close_threshold){
                var position = longPositions[0];
                var close_amount = Math.min(amount, position.amount);
                var result = {};
                if(self.use_tick){
                   rate = Math.min(self.current_rate(), ticker.bid);
                }
                result["close"] = yield self.api.closeTrade(
                    "btc_jpy",
                    "close_long",
                    rate,
                    close_amount,
                    position.id
                );
                if(self.current_score < -1 * self.order_threshold){
                    for(var i=0;i<orders.length;i++){
                        yield self.api.cancelOrder(orders[i].id);
                    }

                    self.stats.order.doten_short++;
                    result["open"] =  yield self.api.trade(
                        "btc_jpy",
                        "leverage_sell",
                        rate,
                        amount
                    );
                }
                return result;
            } else if(shortPositions.length > 0 && self.close_threshold < self.current_score){
                var position = shortPositions[0];
                var close_amount = Math.min(amount, position.amount);
                var result = {};
                if(self.use_tick){
                    rate = Math.max(self.current_rate(), ticker.ask);
                }
                result["close"] = yield self.api.closeTrade(
                    "btc_jpy",
                    "close_short",
                    rate,
                    close_amount,
                    position.id
                );
                if(self.order_threshold < self.current_score){
                    for(var i=0;i<orders.length;i++){
                        yield self.api.cancelOrder(orders[i].id);
                    }

                    self.stats.order.doten_long++;
                    result["open"] = yield self.api.trade(
                        "btc_jpy",
                        "leverage_buy",
                        rate,
                        amount
                    );
                }
                return result;
            }
        }).then(function(result){
            if(result && self.verbose){
                console.log(result);
            }
            if(self.verbose){
                console.log("current score: " + self.current_score);
            }
            cb(null, self);
        }).catch(function(err){
            console.log(err);
            console.log(err.stack);
            cb(err, null);
        });

    };


    var current_assetsAsync = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            co(function* (){
                var balance;
                var assets;
                if(self.mode == 'spot'){
                    balance = yield self.api.getBalance();
                    assets = parseFloat(balance.jpy) + parseFloat(balance.btc * self.current_rate());
                    self.current_yen = balance.jpy;
                    self.current_btc = balance.btc;
                } else if(self.mode == 'future'){
                    balance = yield self.api.getLeverageBalance();
                    assets = balance.margin.jpy;
                    self.current_yen = assets;
                } else {
                    reject('invalid mode');
                }

                self.current_assets_all = assets;
                if(self.stats.max_asset < assets){
                    self.stats.max_asset = assets;
                }
                var draw_down =  self.stats.max_asset - assets;
                if(self.stats.max_draw_down < draw_down){
                    self.stats.max_draw_down = draw_down;
                }

                resolve(assets);
            }).catch(function(err){
                console.log(err.stack);
                reject(err);
            });
        });
    };

    var current_rate = function(){
        var last_trade = this.last_trade() || 0;
        return last_trade.rate;
    };

    var last_trade = function(){
        return this.trades[this.trades.length-1] || undefined;
    };

    var Trader = function(entity, config, option){
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
                short: 0,
                doten_long: 0,
                doten_short: 0,
            },
            cancel_order: 0,
            cancel_position: 0,
            update_trade_count: 0,
        };

        this.api = promisify(option.api);
        this.publicApi = promisify(option.publicApi);
        this.logger = option.logger || undefined;
        this.calc_weight = option.calc_weight || 1;
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
        this.createOrderAsync = createOrderAsync;
        this.current_assetsAsync = current_assetsAsync;
        this.current_rate = current_rate;
        this.last_trade = last_trade;

        this._createSpotOrder = _createSpotOrder;
        this._createFutureOrder = _createFutureOrder;

        //console.log(option);
    }

    return Trader;
})();
