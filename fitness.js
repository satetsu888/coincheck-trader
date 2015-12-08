var Trader = require('./trader.js');
var fs = require('fs');

var JSONstream = require('JSONstream');

module.exports = (function(){
    'use strict';

    var Fitness = function(){
    };

    Fitness.prototype.calcFitness = function(entity){
        var config = {
            current_yen: 0,
            current_btc: 0,
        };
        var option = {
            calc_weight: 0.0001,
            order_threshold: 20,
        };

        var trader = new Trader(entity, config, option);
        var train = JSON.parse(fs.readFileSync('train_test.json', 'utf8'));
        train.forEach(function(trade){
            trader.updateTrades(trade);
        });
        return trader.current_assets();
    };

    Fitness.prototype.printOrder = function(entity){
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
        var train = JSON.parse(fs.readFileSync('train_test.json', 'utf8'));
        train.forEach(function(trade){
            trader.updateTrades(trade);
        });

        console.log(trader.orders);
        console.log(trader.orders.length);
    };

    return Fitness;
})();
