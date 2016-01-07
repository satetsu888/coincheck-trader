//api dummy wrapper
module.exports = (function(){
    'use strict';

    var trade = function(currency_pair, action, price, amount, callback){

        var id = Math.floor(Math.random() * 0xFFFF);

        var result = {
            "success": true,
            "id": id,
            "rate": price,
            "amount": amount,
            "order_type": action,
            "pair": currency_pair || "btc_jpy",
            "created_at": this.current_time,
        };

        var order = {
            id: id,
            order_type: action,
            rate: price,
            pair: currency_pair || "btc_jpy_jpy",
            pending_amount: amount,
            created_at: this.current_time,
            _original_amount: amount,
            _status: "open",
        };
        //console.log(order);
        this.orders.push(order);

        setTimeout(callback, 1, null, result);
    };

    var cancelOrder = function(order_id, callback){
        var result = {};

        this.orders.forEach(function(order){
            if(order.id == order_id){
                order._status = "canceled";

                result = {
                    "success": true,
                    "id": order.id
                };
            }
        });

        setTimeout(callback, 1, null, result);
    };

    var activeOrders = function(callback){
        if(!this.orders){
            setTimeout(callback, 1, null, []);
            return;
        }

        var orders = this.orders.filter(function(element){
            if(element._status == "open"){
                return true;
            } else {
                return false;
            }
        });

        var result = {
            "success": true,
            "orders" : orders
        }

        setTimeout(callback, 1, null, result);
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

        setTimeout(callback, 1, null, balance);
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
            if(order._status != "open"){
                return;
            }

            if(order.order_type == "buy"){
                if(trade.rate <= order.rate){
                    var traded_amount = Math.min(order.pending_amount, trade.amount);
                    order.pending_amount -= traded_amount;
                    if(order.pending_amount <= 0){
                        order._status = "closed";
                    }
                    self.current_btc += traded_amount;
                    self.current_yen -= traded_amount * trade.rate;
                }
            } else if(order.order_type == "sell"){
                if(trade.rate >= order.rate){
                    var traded_amount = Math.min(order.pending_amount, trade.amount);
                    order.pending_amount -= traded_amount;
                    if(order.pending_amount <= 0){
                        order._status = "closed";
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
