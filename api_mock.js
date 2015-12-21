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

        setTimeout(callback, 1, result);
    };

    var cancelOrder = function(order_id, callback){
        var result = {};
        // TODO
        setTimeout(callback, 1, result);
    };

    var activeOrders = function(callback){
        var result = this.activeOrders;
        // TODO
        setTimeout(callback, 1, result);
    };

    var getBalance = function(callback){
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

        setTimeout(callback, 1, balance);
    };

    var _updateCurrent = function(lastTrade){
        this.current_time = lastTrade.created_at;
        this.current_rate = lastTrade.rate;
        if(lastTrade){
            this._applyOrder(lastTrade);
        }
    };

    var _applyOrder = function(trade){
        var self = this;

        if(!this.orders){
            return;
        }

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
                    self.current_btc += traded_amount;
                    self.current_yen -= traded_amount * trade.rate;
                }
            } else if(order.order_type == "sell"){
                if(trade.rate >= order.rate){
                    var traded_amount = Math.min(order.amount, trade.amount);
                    order.amount -= traded_amount;
                    if(order.amount <= 0){
                        order.status = "closed";
                    }
                    self.current_btc -= traded_amount;
                    self.current_yen += traded_amount * trade.rate;
                }
            }
        });
    };


    var api = function(config){
        this.trade = trade;
        this.cancelOrder = cancelOrder;
        this.activeOrders = activeOrders;
        this.getBalance = getBalance;

        this._updateCurrent = _updateCurrent;
        this._applyOrder = _applyOrder;

        this.current_yen = config.jpy;
        this.current_btc = config.btc;
        this.current_time;
        this.current_rate;
        this.orders = [];
    };

    return api;
})();
