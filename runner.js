var bot = process.argv[2] || "bot1.json"
var config = require('./config.js');
var Trader = require('./trader.js');
var request = require('request');
var co = require('co');

var fs = require('fs');
var coincheck = require('node-coincheck');
var publicApi = coincheck.PublicApi;
var privateApi = coincheck.createPrivateApi(config.coincheck.apikey, config.coincheck.secretkey, 'user agent is node-coincheck');

var trader;
var lastId;

var getBalanceAsync = function(res){
    return new Promise(function(resolve, reject){
        privateApi.getBalance(function(err, body){
            if(err){
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};

var setupTraderAsync = function(res){
    return new Promise(function(resolve, reject){
        var entity = JSON.parse(fs.readFileSync(bot, 'utf8'));
        var option = {
            calc_weight: 0.0001,
            order_threshold: 200,
            order_allowed: false,
            order_weight: 0.0002,
            api: privateApi,
            publicApi: publicApi,
            verbose: true,
            use_tick: true,
        };
        trader = new Trader(entity, res, option);
        resolve();
    });
};

var allowCreateOrderAsync = function(){
    return new Promise(function(resolve, reject){
        trader.order_allowed = true;
        resolve();
    });
};

var fetchTradesAsync = function(offset){
    return new Promise(function(resolve, reject){
        publicApi.trades(offset, function(err, body){
            if(err){
                reject(err);
            } else { 
                resolve(body.reverse());
            }
        });
    });
};

var filterTradesAsync = function(data){
    return new Promise(function(resolve, reject){
        var res = data.filter(function(trade){
            if(lastId){
                if(trade.id <= lastId){
                    return false;
                }
            }
            lastId = trade.id;
            return true;
        });
        resolve(res);
    });
};

var updateTradeAsync = function(trades){
    return new Promise(function(resolve, reject){
        console.log("update " + trades.length + " Trades");
        if(trades.length != 0){
            co(function* (){
                for(var i=0;i<trades.length;i++){
                    yield trader.updateAsync(trades[i]);
                }
                resolve(trader);
            }).catch(function(err){
                reject(err);
                return;
            });
        } else {
            resolve(trader);
        }
    });
}

var update = function(offset){
    return function(){
        return new Promise(function(resolve, reject){
            fetchTradesAsync(offset)
            .then(filterTradesAsync)
            .then(updateTradeAsync)
            .then(resolve)
            .catch(reject);
        });
    }
};

var sleep = function(){
    return new Promise(function(resolve, reject){
        setTimeout(resolve, 5000);
    });
};

var mainloop = function(){
    return new Promise(function(resolve, reject){
        (update(0))()
        .then(function(trader) {
            var date = new Date();
            console.log("--" + date + "--");
            co(function* (){
                var assets = yield trader.current_assetsAsync();
                console.log("CurrentAssets: " + assets);
            }).catch(function(err){
                console.log(err.stack);
                reject(err);
                return;
            });
        })
        .then(sleep)
        .then(mainloop)
        .catch(function(err){
            console.log(err.stack);
            mainloop();
        });
    });
};

getBalanceAsync()
.then(setupTraderAsync)
//.then(update(100))
.then(update(50))
.then(update(0))
.then(allowCreateOrderAsync)
.then(mainloop)
.catch(function(err){
    console.log("err occured at out of main loop");
    console.log(err.stack);
});

