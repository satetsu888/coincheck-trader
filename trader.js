module.exports = (function(){
    'use strict';

    var Trader = function(entity, config, option){
        this.entity = entity;
        this.current_yen = config.current_yen;
        this.current_btc = config.current_btc;

        this.api = option.api; // TODO coincheckのAPIとつなぐ
        this.calc_weight = option.calc_weight || 0.0001;
        this.order_threshold = option.order_threshold || 100;

        this.order = [];
        this.trades = [];
    }

    Trader.prototype.updateTrades = function(trade){

        this.trades.push(trade);
        if(this.trades.length > 100){
            this.trades.shift();
            this.createOrder(this.trades);
        }

        this.applyOrder();
    };

    Trader.prototype.createOrder = function(trades){
        var entity = this.entity;
        var calc_weight = this.calc_weight;
        var order_threshold = this.order_threshold;

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

        if(score < -1 * order_threshold){
            this.order.push({
                rate: this.current_rate(),
                amount: 1,
                order_type: "sell",
                pair: "btc_jpy",
            })
        } else if(order_threshold < score){
            this.order.push({
                rate: this.current_rate(),
                amount: 1,
                order_type: "buy",
                pair: "btc_jpy",
            })
        }
    };

    Trader.prototype.applyOrder = function(){
        // TODO 発行した注文の約定と資産の更新を行う
        console.log(this.order);
    };

    Trader.prototype.current_assets = function(){
        return this.current_yen + this.current_btc * this.current_rate();
    };

    Trader.prototype.current_rate = function(){
        var last_trade = this.trades[this.trades.length-1] || 0;

        return last_trade.rate;
    };

    return Trader;
})();
