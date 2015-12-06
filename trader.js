module.exports = (function(){
    'use strict';

    var Trader = function(entity, config, option){
        this.current_yen = config.current_yen;
        this.current_btc = config.current_btc;

        this.current_rate = config.rate;

        this.api = option.api; // TODO coincheckのAPIとつなぐ

        this.order = [];
        this.trades = [];
    }

    Trader.prototype.updateTrades = function(){
        // TODO 計算対象の取引状況を更新
    };

    Trader.prototype.getOrder = function(){
        //TODO 現在の注文状態を取得
    };

    Trader.prototype.applyOrder = function(){
        // TODO 発行した注文の約定と資産の更新を行う
    };

    Trader.prototype.current_assets = function(){
        return this.current_yen + this.current_btc * this.current_rate;
    };

    return Trader;
})();
