var fs = require('fs');
var co = require('co');
var md5 = require('md5');

module.exports = (function(){
    'use strict';


    global.base_dir = __dirname;

    var calcScore = function(entity, callback){
        var self = this;

        co(function* (){
            var trader = yield self.doFitnessAsync(entity);
            var asset = yield trader.current_assetsAsync();

            return {
                score : parseFloat(asset - 50000) - parseFloat(trader.stats.max_draw_down),
                stats : trader.stats,
                entity: entity,
            };
        }).then(function(result){
            var seriarized_entity = self.seriarize(entity);
            self.scoreCache[seriarized_entity] = result.score;
            callback(null, result);
        }).catch(function(err){
            console.log(err.stack);
            callback(err, null);
        });
    };

    var calcScoreAsync = function(entity){
        var self = this;
        return new Promise(function(resolve, reject){
            var seriarized_entity = self.seriarize(entity);
            if(self.scoreCache[seriarized_entity]){
                //console.log("cache hit");
                //console.log(self.scoreCache);
                resolve({
                    "message": "cached score",
                    "score": self.scoreCache[seriarized_entity],
                });
            }

            self.calcScore(entity, function(err, result){
                if(err){
                    reject(err);
                    return;
                } else {
                    resolve(result);
                }
            });
        });
    };

    var doFitness = function(entity, callback){
        var self = this;

        var api = require(base_dir + '/api_mock.js');
        var logger = require(base_dir + '/spreadsheet_logger.js');
        var Trader = require(base_dir + '/trader.js');
        var config = {
            jpy: 50000,
            btc: 0,
        };
        var myLogger;
        if(self.logging){
            myLogger = new logger(self.seriarize(entity) + '_' + self.file );
        };
        var option = {
            calc_weight: 10,
            order_threshold: 100,
            order_allowed: true,
            order_weight: 0.0002,
            api: new api(config),
            logger: myLogger,
            mode: 'future',
        };

        var trader = new Trader(entity, config, option);

        co(function* (){
            for(var i=0; i<self.train.length; i++){
                trader.api._updateCurrent(self.train[i]);
                yield trader.current_assetsAsync();
                yield trader.updateAsync(self.train[i]);
            }
            //console.log("finish");
            callback(null, trader);
        }).catch(function(err){
            console.log(err.stack);
            callback(err, null);
        });
    };

    var doFitnessAsync = function(entity){
        var self = this;
        return new Promise(function(resolve, reject){
            self.doFitness(entity, function(err, result){
                if(err){
                    reject(err);
                    return;
                } else {
                    resolve(result);
                }
                
            });
        });
    };

    var seriarize = function(entity){
       var str = JSON.stringify(entity);
       return md5(str);
    };

    var Fitness = function(file){
        this.file = file;
        this.logging = false;
        this.train = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.scoreCache = {};
        this.calcScore = calcScore;
        this.calcScoreAsync = calcScoreAsync;
        this.doFitness = doFitness;
        this.doFitnessAsync = doFitnessAsync;
        this.seriarize = seriarize;
    };

    return Fitness;
})();
