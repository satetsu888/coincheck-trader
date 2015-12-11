var fs = require('fs');

var JSONstream = require('JSONstream');

module.exports = (function(){
    'use strict';

    global.base_dir = __dirname;

    var calcFitness = function(entity){
        var seriarized_entity = this.seriarize(entity);
        if(this.cache[seriarized_entity]){
            return this.cache[seriarized_entity];
        }

        var Trader = require(base_dir + '/trader.js');

        var config = {
            current_yen: 50000,
            current_btc: 1,
        };
        var option = {
            calc_weight: 0.0001,
            order_threshold: 30,
        };

        var trader = new Trader(entity, config, option);
        this.train.forEach(function(trade){
            trader.updateTrades(trade);
        });

        this.cache[seriarized_entity] = trader.current_assets();
        return trader.current_assets();
    };

    var printOrder = function(entity){
        var Trader = require(base_dir + '/trader.js');
        console.log(JSON.stringify(entity));
        var config = {
            current_yen: 50000,
            current_btc: 1,
        };
        var option = {
            calc_weight: 0.0001,
            order_threshold: 30,
        };

        var trader = new Trader(entity, config, option);
        this.train.forEach(function(trade){
            trader.updateTrades(trade);
        });

        var buy = 0;
        var sell = 0;
        trader.orders.forEach(function(e){
            if(e.order_type == 'buy'){
                buy++;
            } else {
                sell++;
            }
        });
        console.log("order_num: " + trader.orders.length);
        console.log("order: sell: " + sell + " buy: " + buy);
        console.log("current_yen: " + trader.current_yen);
        console.log("current_btc:" + trader.current_btc);
        console.log("current_rate: " + trader.current_rate());
        console.log("current_assets: " + trader.current_assets());
    };

    var seriarize = function(entity){
       return JSON.stringify(entity);
    };

    var Fitness = function(file){
        this.train = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.cache = {};
        this.calcFitness = calcFitness;
        this.printOrder = printOrder;
        this.seriarize = seriarize;
    };

    return Fitness;
})();
