var fs = require('fs');

var JSONstream = require('JSONstream');

module.exports = (function(){
    'use strict';

    global.base_dir = __dirname;
    var Trader = require(base_dir + '/trader.js');

    var calcFitness = function(entity){
        var Trader = require(base_dir + '/trader.js');

        var config = {
            current_yen: 0,
            current_btc: 0,
        };
        var option = {
            calc_weight: 0.0001,
            order_threshold: 20,
        };

        var trader = new Trader(entity, config, option);
        this.train.forEach(function(trade){
            trader.updateTrades(trade);
        });
        return trader.current_assets();
    };

    var printOrder = function(entity){
        var Trader = require(base_dir + '/trader.js');
        console.log(entity);
        var config = {
            current_yen: 0,
            current_btc: 0,
        };
        var option = {
            calc_weight: 0.0001,
            order_threshold: 20,
        };

        var trader = new Trader(entity, config, option);
        this.train.forEach(function(trade){
            trader.updateTrades(trade);
        });

        console.log("order_num: " + trader.orders.length);
        console.log("current_yen: " + trader.current_yen);
        console.log("current_btc:" + trader.current_btc);
        console.log("current_rate: " + trader.current_rate());
        console.log("current_assets: " + trader.current_assets());
    };

    var Fitness = function(){
        this.train = JSON.parse(fs.readFileSync('train_test.json', 'utf8'));
        this.calcFitness = calcFitness;
        this.printOrder = printOrder;
    };

    return Fitness;
})();
