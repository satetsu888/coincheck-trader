module.exports = (function(){
    'use strict';

    var updateTrades = function(trade, cb){
        if(this.order_applyed){
            this.applyOrder(trade);
        }
        this.trades.push(trade);
        this.update_count++;
        if(this.trades.length > 100){
            this.trades.shift();
            if(this.order_allowed){
                this.createOrder(this.trades);
            }
        }
        if(cb){
            cb(this);
        }
    };

    var createOrder = function(trades){
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
        score += 10 * entity[100] * (this.current_yen / this.current_rate() - this.current_btc);

        var amount = Math.floor(Math.abs(0.0001 * score * entity[101]) * 10000) / 10000;
        if(score < -1 * order_threshold && this.current_btc > 0.01){
            this.orders.push({
                rate: this.current_rate(),
                amount: amount,
                original_amount: amount,
                order_type: "sell",
                pair: "btc_jpy",
                status: "open",
                created_at: this.current_ts(),

            })
        } else if(order_threshold < score && (this.current_yen / this.current_rate()) > 0.01){
            this.orders.push({
                rate: this.current_rate(),
                amount: amount,
                original_amount: amount,
                order_type: "buy",
                pair: "btc_jpy",
                status: "open",
                created_at: this.current_ts(),
            })
        }
    };

    var applyOrder = function(trade){
        var trader = this;

        this.orders.forEach(function(order, index){
            if(order.status != "open"){
                return;
            }

            var order_cancel_date = new Date(order.created_at);
            order_cancel_date.setDate(order_cancel_date.getDate() + 1);
            var trade_date = new Date(trade.created_at);
            if(order_cancel_date  < trade.created_at){
                order.status = "canceled";
                return;
            }

            if(order.order_type == "buy"){
                if(trade.rate <= order.rate){
                    var traded_amount = Math.min(order.amount, trade.amount);
                    order.amount -= traded_amount;
                    if(order.amount <= 0){
                        order.status = "closed";
                    }
                    trader.current_btc += traded_amount;
                    trader.current_yen -= traded_amount * trade.rate;
                }
            } else if(order.order_type == "sell"){
                if(trade.rate >= order.rate){
                    var traded_amount = Math.min(order.amount, trade.amount);
                    order.amount -= traded_amount;
                    if(order.amount <= 0){
                        order.status = "closed";
                    }
                    trader.current_btc -= traded_amount;
                    trader.current_yen += traded_amount * trade.rate;
                }
            }
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
        this.order_applyed = option.order_applyed || false;
        this.order_allowed = option.order_allowed || false;

        this.orders = [];
        this.trades = [];

        this.updateTrades = updateTrades;
        this.createOrder = createOrder;
        this.applyOrder = applyOrder;
        this.current_assets = current_assets;
        this.current_rate = current_rate;
        this.current_ts = current_ts;
    }

    return Trader;
})();
