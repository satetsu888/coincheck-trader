var Trader = require('./trader.js');

module.exports = (function(){
    'use strict';

    var Fitness = function(){
        this.hoge = "hogehoge";
    };

    Fitness.prototype.calcFitness = function(entity){
        var config = {
            current_yen: 40000,
            current_btc: 1,
            rate: 40000,
        };

        var trader = new Trader(entity, config);
        console.log(trader);

        return trader.current_assets();
    };

    return Fitness;
})();
