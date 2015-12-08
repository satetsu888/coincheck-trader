module.exports = (function(){
    'use strict';

    var Trader = function(entity, config, option){
        this.entity = entity;
        this.current_yen = config.current_yen;
        this.current_btc = config.current_btc;

        this.api = option.api; // TODO coincheckのAPIとつなぐ
        this.calc_weight = option.calc_weight || 0.0001;
        this.order_threshold = option.order_threshold || 100;

        this.orders = [];
        this.trades = [];
    }

    Trader.prototype.updateTrades = function(trade){
        this.applyOrder(trade);
        this.trades.push(trade);
        if(this.trades.length > 100){
            this.trades.shift();
            this.createOrder(this.trades);
        }
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
            this.orders.push({
                rate: this.current_rate(),
                amount: 1,
                order_type: "sell",
                pair: "btc_jpy",
                is_open: true,
                created_at: this.current_ts(),

            })
        } else if(order_threshold < score){
            this.orders.push({
                rate: this.current_rate(),
                amount: 1,
                order_type: "buy",
                pair: "btc_jpy",
                is_open: true,
                created_at: this.current_ts(),
            })
        }
    };

    Trader.prototype.applyOrder = function(trade){
        // TODO 発行した注文の約定と資産の更新を行う
        var trader = this;

        this.orders.forEach(function(order, index){
            if(!order.is_open){
                return;
            }

            var order_cancel_date = new Date(order.created_at);
            order_cancel_date.setDate(order_cancel_date.getDate() + 1);
            var trade_date = new Date(trade.created_at);
            if(order_cancel_date  < trade.created_at){
                order.is_open = false;
                return;
            }

            if(order.order_type == "buy"){
                if(trade.rate <= order.rate){
                    var traded_amount = Math.max(order.amount, trade.amount);
                    order.amount -= traded_amount;
                    if(order.amount <= 0){
                        order.is_open = false;
                    }
                    trader.current_btc += traded_amount;
                    trader.current_yen -= traded_amount * trade.rate;
                }
            } else if(order.order_type == "sell"){
                if(trade.rate >= order.rate){
                    var traded_amount = Math.max(order.amount, trade.amount);
                    order.amount -= traded_amount;
                    if(order.amount <= 0){
                        order.is_open = false;
                    }
                    trader.current_btc -= traded_amount;
                    trader.current_yen += traded_amount * trade.rate;
                }
            }
        });
    };

    Trader.prototype.current_assets = function(){
        return this.current_yen + this.current_btc * this.current_rate();
    };

    Trader.prototype.current_rate = function(){
        var last_trade = this.trades[this.trades.length-1] || 0;

        return last_trade.rate;
    };

    Trader.prototype.current_ts = function(){
        var last_trade = this.trades[this.trades.length-1] || 0;

        return last_trade.created_at;
    };

    return Trader;
})();
