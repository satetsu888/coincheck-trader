var fs = require('fs');
var co = require('co');

module.exports = (function(){
    'use strict';


    global.base_dir = __dirname;

    var calcScore = function(entity, callback){
        var self = this;
        co(function* (){
            var trader = yield self.doFitnessAsync(entity);
            var asset = yield trader.current_assetsAsync();

            //console.log(asset);
            //console.log(trader.max_draw_down);
            return (parseFloat(asset - 50000) - parseFloat(trader.max_draw_down));
            //console.log(fitness);
            //console.log(trader.current_yen);
            //console.log(trader.current_btc);
            //callback(fitness);
        }).then(function(score){
            console.log(score);
            callback(score);
        }).catch(function(err){
            console.log(err);
        });
    };

    var calcScoreAsync = function(entity){
        var self = this;
        return new Promise(function(resolve, reject){
            self.calcScore(entity, resolve);
        });
    };

    var doFitness = function(entity, callback){
        var self = this;
        var seriarized_entity = self.seriarize(entity);
        if(self.cache[seriarized_entity]){
            callback(self.cache[seriarized_entity]);
        }

        var api = require(base_dir + '/api_mock.js');
        var Trader = require(base_dir + '/trader.js');
        var config = {
            jpy: 50000,
            btc: 0,
        };
        var option = {
            calc_weight: 0.0001,
            order_threshold: 200,
            order_allowed: true,
            order_weight: 0.0002,
            api: new api(config),
        };

        var trader = new Trader(entity, config, option);

        co(function* (){
            for(var i=0; i<self.train.length; i++){
                trader.api._updateCurrent(self.train[i]);
                trader.current_assetsAsync();
                yield trader.updateTradesAsync(self.train[i]);
            }
            //console.log("finish");
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

    var Fitness = function(file){
        this.train = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.cache = {};
        this.calcScore = calcScore;
        this.calcScoreAsync = calcScoreAsync;
        this.doFitness = doFitness;
        this.doFitnessAsync = doFitnessAsync;
        this.seriarize = seriarize;
    };

    return Fitness;
})();
