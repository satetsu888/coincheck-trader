var bot = process.argv[2] || "bot1.json"
var examdata  = process.argv[3] || "exam.json"

var Fitness = require('./fitness.js');
var fs = require('fs');
var co = require('co');

var f = new Fitness(examdata);
f.logging = false;
//var f = new Fitness('train_test.json');

var entity = JSON.parse(fs.readFileSync(bot, 'utf8'));


co(function* (){
    var result = yield f.calcScoreAsync(entity);
    console.log(result);
}).catch(function(err){
    console.log(err.stack);
});

