module.exports = (function(){
    'use strict';

    var co = require('co');
    var promisify = require('promisify-node');
    var coincheck = require('node-coincheck');
    var publicApi = coincheck.PublicApi;

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
                var orders = yield self.api.activeOrders();
                // TODO 一定時間後にキャンセルする処理
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

            self.createOrder(self.trades, function(err, trader){
                if(err){
                    reject(err);
                    return;
                } else {
                    resolve(trader);
                    return;
                }
            });
        });
    };

    var updateAsync = function(trade){
        var self = this;
        return new Promise(function(resolve, reject){
            co(function* (){
                yield self.applyTradesAsync();
                yield self.updateTradesAsync(trade);
                yield self.updateLogAsync(self);
                resolve(self);
            }).catch(function(err){
                console.log(err);
                reject(err);
                return;
            });
        });
    };

    var calcScore = function(trades, option){
        var self = this;
        var score = 0;

        var sign;
        trades.forEach(function(element, index){
            if( element.order_type == "buy"){
                sign = 1;    
            } else if( element.order_type == "sell"){
                sign = -1;
            }

            var delta = sign * element.amount * element.rate * self.entity[index] * self.calc_weight;
            score += delta;
        });
        score += 10 * self.entity[100] * (self.current_yen / self.current_rate() - self.current_btc);

        return score;
    };

    var createOrder = function(trades, cb){
        var self = this;
        self.current_score = self.calcScore(trades, {});

        var amount = Math.floor(Math.abs(self.order_weight * self.current_score * self.entity[101]) * 10000) / 10000;

        co(function* (){
            var ticker;
            if(self.use_tick){
                ticker = yield new Promise(function(resolve, reject){
                    publicApi.ticker(function(err, result){
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
            cb(err, null);
        });
    };

    var current_assetsAsync = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            co(function* (){
                var balance = yield self.api.getBalance();
                var assets = parseFloat(balance.jpy) + parseFloat(balance.btc * self.current_rate());
                self.current_yen = balance.jpy;
                self.current_btc = balance.btc;
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
                console.log(err);
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
            },
            update_trade_count: 0,
        };

        this.api = promisify(option.api);
        this.logger = option.logger || undefined;
        this.calc_weight = option.calc_weight || 0.0001;
        this.order_weight = option.order_weight || 0.0001;
        this.order_threshold = option.order_threshold || 100;
        this.order_allowed = option.order_allowed || false;
        this.verbose = option.verbose || false;
        this.use_tick = option.use_tick || false;

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

        //console.log(option);
    }

    return Trader;
})();
