var bot = process.argv[2] || "bot1.json"
var examdata  = process.argv[3] || "exam.json"

var Fitness = require('./fitness.js');
var fs = require('fs');
var co = require('co');

var f = new Fitness('exam.json');

var entity = JSON.parse(fs.readFileSync(bot, 'utf8'));


co(function* (){
    var result = yield f.doFitnessAsync(entity);
    console.log(result);
}).catch(function(err){
    throw err;
});

//f.printStats(entity);

