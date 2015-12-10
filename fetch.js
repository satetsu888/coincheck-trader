var config = require('./config.js');

var request = require('sync-request');
var mysql      = require('mysql');

var connection = mysql.createConnection( config.mysql );

var fetch = function(offset){
    var url = 'https://coincheck.jp/api/trades?offset=' + offset;
    console.log(url);

    var res = request('GET', url);

    var trades = JSON.parse(res.getBody('utf8'));
    if(trades.length === 0){
        process.exit();
    }
    var query = trades.map(function(e){
        return [ e.id, e.amount, e.rate, e.created_at, e.order_type ]
    });
    connection.query('insert ignore into trades ( id, amount, rate, created_at, order_type ) values ?',[query],function(error,results,fields){
        console.log(error);
        console.log(results);
        fetch(offset + 50);
    });

};

var offset = parseInt(process.argv[2]) || 0;

fetch(offset);
