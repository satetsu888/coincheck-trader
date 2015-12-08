var Trader = require('./trader.js');
var fs = require('fs');

var JSONstream = require('JSONstream');

module.exports = (function(){
    'use strict';

    var Fitness = function(){
    };

    Fitness.prototype.calcFitness = function(entity, cb){
        var config = {
            current_yen: 40000,
            current_btc: 1,
            rate: 40000,
        };
        var option = {
        };

        var trader = new Trader(entity, config, option);
        fs.createReadStream('train_test.json', {encoding: 'utf8'})
        .pipe(JSONstream.parse('*'))
        .on('data', function(trade){
            trader.updateTrades(trade);
        })
        .on('end', function(){
            cb(trader.current_assets());
        });
    };

    return Fitness;
})();
