module.exports = (function(){
    'use strict';

    var Trader = function(entity, config){
        this.current_yen = config.current_yen;
        this.current_btc = config.current_btc;

        this.current_rate = config.rate;
    }


    Trader.prototype.trades = function(){
        console.log(this.current_yen);
    };

    Trader.prototype.current_assets = function(){
        return this.current_yen + this.current_btc * this.current_rate;
    };

    return Trader;
})();
