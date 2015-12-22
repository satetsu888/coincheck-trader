var config = require('./config.js');
var fs = require('fs');
var mysql      = require('mysql');
var connection = mysql.createConnection( config.mysql );

connection.query('select * from trades where date(created_at) > "2015-12-01" order by id', function(error,results,fields){
    //console.log(error);
    //console.log(results);
    fs.writeFile('train_recent.json', JSON.stringify(results), function(){
        process.exit();
    });
});
