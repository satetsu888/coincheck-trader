global.base_dir = __dirname;
var co = require('co');

var Fitness = require(base_dir + '/fitness.js');


var userData = {
    tradesLength: 102,
    orderSize: 1,
    fitness: new Fitness('train_recent.json'),
};

function getRandomSolution(callback) {
    var length = userData.tradesLength;
    var orderSize = userData.orderSize;

    var createRand = function(orderSize){
        var rand = Math.random() * orderSize * 2 - orderSize;
        return Math.floor(rand * 100000) / 100000;
    };

    var seed = new Array(length);
    for(var i = 0; i < length; i++){
        seed[i] = createRand(orderSize);
    }
    callback(seed);
};

function fitness(solution, callback) {
    co(function* (){
        //console.log(solution);
        var result = yield userData.fitness.calcAssetsAsync(solution);
        //console.log(result);
        callback(result - 50000);
    }).catch(function(err){
        console.log(err);
    });
};

function mutate(solution, callback){
    var orderSize = userData.orderSize;

    function mutateAt(entity, index) {
        var rand = Math.random() * orderSize * 2 - orderSize;
        entity[index] = Math.floor(rand * 100000) / 100000;
        return entity;
    }

    for(var i=0;i<solution.length / 2 ; i++){
        solution = mutateAt(solution, Math.floor(Math.random() * userData.tradesLength));
    }
    callback(solution);
};

function crossover(father, mother, callback){
    var length = userData.tradesLength;
    var son      = new Array(length);

    for(var i = 0; i < length; i++){
        var ca = Math.floor(Math.random()*length);
        var cb = Math.floor(Math.random()*length);		
        if (ca > cb) {
            son[i] = father[i];
        } else {
            son[i] = mother[i];
        }
    }

    callback(son);
};

function stopCriteria() {
    console.log("generation: " + this.generation);
    console.log("stat: " + JSON.stringify(this.statistics));
      return (this.generation == 10);
}


var  options = {
    getRandomSolution : getRandomSolution,
    popSize : 30,
    stopCriteria : stopCriteria,
    fitness : fitness,
    minimize : false,
    mutateProbability : 0.2,
    mutate : mutate,
    crossoverProbability : 0.3,
    crossover : crossover,
}

var Task = require('genetic').Task
  , taskInstance = new Task(options);

taskInstance.run(function (stats) {
    console.log('results');
    console.log(stats);
});
