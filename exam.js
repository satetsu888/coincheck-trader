var bot = process.argv[2] || "bot1.json"
var examdata  = process.argv[3] || "exam.json"

var Fitness = require('./fitness.js');
var fs = require('fs');

var f = new Fitness('exam.json');

var entity = JSON.parse(fs.readFileSync(bot, 'utf8'));

f.printOrder(entity);
f.printStats(entity);

