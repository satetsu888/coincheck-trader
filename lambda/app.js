exports.handler = function(event, context){
    require('babel-polyfill');
    var co = require('co');

    co(function *(){
        var entity = event.entity;

        var trader = yield doFitnessAsync(entity);
        var asset = yield trader.current_assetsAsync();

        context.succeed({
            score : parseFloat(asset - 20000) - parseFloat(trader.stats.max_draw_down),
            stats : trader.stats,
            entity: entity,
        });
    }).catch(function(err){
        context.fail(err);
    });
}

var doFitnessAsync = function(entity){
    return new Promise(function(resolve, reject){
        doFitness(entity, function(err, result){
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

    var api = require('./api_mock.js');
    var Trader = require('./trader.js');
    var config = {
        jpy: 20000,
        btc: 0,
    };
    var option = {
        calc_weight: 0.0001,
        order_threshold: 200,
        order_allowed: true,
        order_weight: 0.0002,
        api: new api(config),
        mode: 'future',
    };

    var trader = new Trader(entity, config, option);

    var train = require('./train.json');

    var co = require('co');
    co(function* (){
        for(var i=0; i<train.length; i++){
            trader.api._updateCurrent(train[i]);
            yield trader.current_assetsAsync();
            yield trader.updateAsync(train[i]);
        }
        //console.log("finish");
        callback(null, trader);
    }).catch(function(err){
        console.log(err.stack);
        callback(err, null);
    });
};
