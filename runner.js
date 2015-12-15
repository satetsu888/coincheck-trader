var bot = process.argv[2] || "bot1.json"
var config = require('./config.js');
var Trader = require('./trader.js');
var request = require('request');

var fs = require('fs');
var coincheck = require('node-coincheck');
var Promise = require('bluebird');
var publicApi = coincheck.PublicApi;
var privateApi = coincheck.createPrivateApi(config.coincheck.apikey, config.coincheck.secretkey, 'user agent is node-coincheck');

var trader;
var lastId;

var getBalanceAsync = function(res){
    return new Promise(function(resolve, reject){
        privateApi.getBalance(function(body){
            resolve(body);
        });
    });
};

var setupTraderAsync = function(res){
    return new Promise(function(resolve, reject){
        var entity = JSON.parse(fs.readFileSync(bot, 'utf8'));
        var option = {
            calc_weight: 0.0001,
            order_threshold: 200,
        };
        trader = new Trader(entity, res, option);
        resolve();
    });
};

var fetchTradesAsync = function(offset){
    return new Promise(function(resolve, reject){
        request.get(
            {url: 'https://coincheck.jp/api/trades?offset=' + offset, json: true},
            function(error, response, body){
                resolve(body.reverse());
            }
        );
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
        if(trades){
            trades.forEach(function(trade){
                trader.updateTrades(trade);
            });
        }
        resolve(trader);
    });
}

var update = function(offset){
    return function(){
        return new Promise(function(resolve, reject){
            fetchTradesAsync(offset)
            .then(filterTradesAsync)
            .then(updateTradeAsync)
            .then(resolve);
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
            console.log(trader.orders);
        })
        .then(sleep)
        .then(mainloop);
    });
};

getBalanceAsync()
.then(setupTraderAsync)
.then(update(100))
.then(update(50))
.then(mainloop);

