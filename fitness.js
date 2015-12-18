var fs = require('fs');
var co = require('co');

module.exports = (function(){
    'use strict';


    global.base_dir = __dirname;

    var calcAssets = function(entity, callback){
        var self = this;
        co(function* (){
            return yield self.doFitnessAsync(entity);
        }).then(function(trader){
            callback(trader.current_assets());
        });
    };

    var calcAssetsAsync = function(entity){
        var self = this;
        return new Promise(function(resolve, reject){
            self.calcAssets(entity, resolve);
        });
    };

    var printStats = function(entity, callback){
        console.log(JSON.stringify(entity));

        var trader = this.doFitness(entity);

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

    var doFitness = function(entity, callback){
        var self = this;
        var seriarized_entity = self.seriarize(entity);
        if(self.cache[seriarized_entity]){
            callback(self.cache[seriarized_entity]);
        }

        var Trader = require(base_dir + '/trader.js');
        var config = {
            jpy: 50000,
            btc: 0,
        };
        var option = {
            calc_weight: 0.0001,
            order_threshold: 200,
            order_allowed: true,
            api: self.api,
        };

        var trader = new Trader(entity, config, option);

        co(function* (){
            for(var i=0; i<self.train.length; i++){
                yield trader.updateTradesAsync(self.train[i]);
            }
            console.log("finish");
            self.cache[seriarized_entity] = trader;
            callback(self.cache[seriarized_entity]);    
        }).catch(function(err){
            console.log(err);
        });
    };

    var doFitnessAsync = function(entity){
        var self = this;
        return new Promise(function(resolve, reject){
            self.doFitness(entity, resolve);
        });
    };

    var seriarize = function(entity){
       return JSON.stringify(entity);
    };
    var api = require(base_dir + '/api_mock.js');

    var Fitness = function(file){
        this.train = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.api = new api(),
        this.cache = {};
        this.calcAssets = calcAssets;
        this.calcAssetsAsync = calcAssetsAsync;
        this.printStats = printStats;
        this.doFitness = doFitness;
        this.doFitnessAsync = doFitnessAsync;
        this.seriarize = seriarize;
    };

    return Fitness;
})();
