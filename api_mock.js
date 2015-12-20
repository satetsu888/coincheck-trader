//api dummy wrapper
module.exports = (function(){
    'use strict';


    var trade = function(currency_pair, action, price, amount, callback){

        var result = {
            "success": true,
            "id": Math.floor(Math.random() * 0xFFFF),
            "rate": price,
            "amount": amount,
            "order_type": action,
            "pair": currency_pair || "btc_jpy",
            "created_at": this.current_time,
        };

        var order = {
            rate: price,
            amount: amount,
            original_amount: amount,
            order_type: action,
            pair: currency_pair || "btc_jpy_jpy",
            status: "open",
            created_at: this.current_time,
        };
        this.orders.push(order);

        setTimeout(callback, 10, result);
    };

    var tradeAsync = function(currency_pair, action, price, amount){
        var self = this;
        return new Promise(function(resolve, reject){
            self.trade(currency_pair, action, price, amount, resolve);
        });
    };
        
    var cancelOrder = function(order_id, callback){
        var result = {};
        // TODO
        setTimeout(callback, 10, result);
    };

    var activeOrders = function(callback){
        var result = this.activeOrders;
        // TODO
        setTimeout(callback, 10, result);
    };

    var _updateCurrent = function(lastTrade){
        this.current_time = lastTrade.created_at;
        this.current_rate = lastTrade.rate;
        this._applyOrder(lastTrade);
    };

    var _applyOrder = function(trade){

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
                    this.current_btc += traded_amount;
                    this.current_yen -= traded_amount * trade.rate;
                }
            } else if(order.order_type == "sell"){
                if(trade.rate >= order.rate){
                    var traded_amount = Math.min(order.amount, trade.amount);
                    order.amount -= traded_amount;
                    if(order.amount <= 0){
                        order.status = "closed";
                    }
                    this.current_btc -= traded_amount;
                    this.current_yen += traded_amount * trade.rate;
                }
            }
        });
    };


    var api = function(){
        this.trade = trade;
        this.tradeAsync = tradeAsync;
        this.cancelOrder = cancelOrder;
        this.activeOrders = activeOrders;

        this._updateCurrent = _updateCurrent;
        this._applyOrder = _applyOrder;

        this.current_yen;
        this.current_btc;
        this.current_time;
        this.current_rate;
        this.orders = [];
    };

    return api;
})();
