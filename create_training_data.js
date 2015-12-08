var config = require('./config.js');
var fs = require('fs');
var mysql      = require('mysql');
var connection = mysql.createConnection( config.mysql );

connection.query('select * from trades order by id limit 1000', function(error,results,fields){
    //console.log(error);
    //console.log(results);
    fs.writeFile('train.json', JSON.stringify(results), function(){
        process.exit();
    });
});
