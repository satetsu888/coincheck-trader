module.exports = (function(){
    'use strict';

    var co = require('co');

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
            if(score < -1 * order_threshold && self.current_btc > 0.01){
                return yield self.api.tradeAsync(
                    "btc_jpy",
                    "sell",
                    self.current_rate(),
                    amount
                );
            } else if(order_threshold < score && (self.current_yen / self.current_rate()) > 0.01){
                return yield self.api.tradeAsync(
                    "btc_jpy",
                    "buy",
                    self.current_rate(),
                    amount
                );
            }
        }).then(function(result){
            cb(result);
        }).catch(function(err){
            console.log(err);
        });
    };


    var current_assets = function(){
        return this.current_yen + this.current_btc * this.current_rate();
    };

    var current_rate = function(){
        var last_trade = this.trades[this.trades.length-1] || 0;

        return last_trade.rate;
    };

    var current_ts = function(){
        var last_trade = this.trades[this.trades.length-1] || 0;

        return last_trade.created_at;
    };

    var Trader = function(entity, config, option){
        this.entity = entity;
        this.current_yen = config.jpy;
        this.current_btc = config.btc;

        this.update_count = 0;

        this.api = option.api; // TODO coincheckのAPIとつなぐ
        this.calc_weight = option.calc_weight || 0.0001;
        this.order_threshold = option.order_threshold || 100;
        this.order_allowed = option.order_allowed || false;

        this.orders = [];
        this.trades = [];

        this.updateTrades = updateTrades;
        this.updateTradesAsync = updateTradesAsync;
        this.createOrder = createOrder;
        this.current_assets = current_assets;
        this.current_rate = current_rate;
        this.current_ts = current_ts;
    }

    return Trader;
})();
