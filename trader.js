module.exports = (function(){
    'use strict';

    var co = require('co');
    var coincheck = require('node-coincheck');
    var publicApi = coincheck.PublicApi;

    var updateTrades = function(trade, cb){
        var self = this;
        self.trades.push(trade);
        self.update_count++;
        if(self.trades.length > 100){
            self.trades.shift();
            if(self.order_allowed){
                self.createOrder(self.trades, cb);
            } else {
                console.log("order not allowed");
                cb(self);
            }
        } else {
            cb(self);
        }
    };

    var updateTradesAsync = function(trade){
        var self = this;
        return new Promise(function(resolve, reject){
            self.updateTrades(trade, resolve);
        });
    };

    var createOrder = function(trades, cb){
        var self = this;
        var entity = self.entity;
        var calc_weight = self.calc_weight;
        var order_threshold = self.order_threshold;

        var score = 0;
        var sign;
        trades.forEach(function(element, index){
            if( element.order_type == "buy"){
                sign = 1;    
            } else if( element.order_type == "sell"){
                sign = -1;
            }

            var delta = sign * element.amount * element.rate * entity[index] * calc_weight;
            score += delta;
        });
        score += 10 * entity[100] * (self.current_yen / self.current_rate() - self.current_btc);

        var amount = Math.floor(Math.abs(0.0001 * score * entity[101]) * 10000) / 10000;

        co(function* (){
            var ticker = yield publicApi.ticker;

            if(score < -1 * order_threshold && self.current_btc > 0.01){
                return yield self.tradeAsync(
                    "btc_jpy",
                    "sell",
                    Math.min(self.current_rate(), ticker.bid),
                    amount
                );
            } else if(order_threshold < score && (self.current_yen / self.current_rate()) > 0.01){
                return yield self.tradeAsync(
                    "btc_jpy",
                    "buy",
                    Math.max(self.current_rate(), ticker.ask),
                    amount
                );
            }
        }).then(function(result){
            if(result && self.verbose){
                console.log(result);
            }
            if(self.verbose){
                console.log("current score: " + score);
            }
            cb(self);
        }).catch(function(err){
            console.log(err);
        });
    };

    var tradeAsync = function(currency_pair, action, price, amount){
        var self = this;
        return new Promise(function(resolve, reject){
            self.api.trade(currency_pair, action, price, amount, resolve);
        });
    };
        

    var current_assets = function(callback){
        var self = this;
        var balance = self.api.getBalance(function(balance){
            var assets = parseFloat(balance.jpy) + parseFloat(balance.btc * self.current_rate());
            self.current_yen = balance.jpy;
            self.current_btc = balance.btc;
            callback(assets);
        });
    };

    var current_assetsAsync = function(){
        var self = this;
        return new Promise(function(resolve, reject){
            self.current_assets(resolve);
        });
    };

    var current_rate = function(){
        var last_trade = this.trades[this.trades.length-1] || 0;

        return last_trade.rate;
    };

    var Trader = function(entity, config, option){
        this.entity = entity;
        this.current_yen = config.jpy;
        this.current_btc = config.btc;

        this.update_count = 0;

        this.api = option.api;
        this.calc_weight = option.calc_weight || 0.0001;
        this.order_threshold = option.order_threshold || 100;
        this.order_allowed = option.order_allowed || false;
        this.verbose = option.verbose || false;

        this.trades = [];

        this.updateTrades = updateTrades;
        this.updateTradesAsync = updateTradesAsync;
        this.tradeAsync = tradeAsync;
        this.createOrder = createOrder;
        this.current_assets = current_assets;
        this.current_assetsAsync = current_assetsAsync;
        this.current_rate = current_rate;
    }

    return Trader;
})();
