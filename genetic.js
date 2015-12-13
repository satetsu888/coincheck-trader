global.base_dir = __dirname;

var Genetic = require('genetic-js');
var genetic = Genetic.create();
var Fitness = require(base_dir + '/fitness.js');

genetic.optimize = Genetic.Optimize.Maximize;
genetic.select1 = Genetic.Select1.Tournament2;
genetic.select2 = Genetic.Select2.Tournament2;

genetic.seed = function() {
    var length = this.userData["tradesLength"];
    var orderSize = this.userData["orderSize"];

    var createRand = function(orderSize){
        var rand = Math.random() * orderSize * 2 - orderSize;
        return Math.floor(rand * 100000) / 100000;
    };

    var seed = new Array(length);
    for(var i = 0; i < length; i++){
        seed[i] = createRand(orderSize);
    }
    return seed;
};

genetic.mutate = function(entity) {
    var orderSize = this.userData["orderSize"];

    function mutateAt(entity, index) {
        var rand = Math.random() * orderSize * 2 - orderSize;
        entity[index] = Math.floor(rand * 100000) / 100000;
        return entity;
    }

    for(var i=0;i<entity.length / 2 ; i++){
        entity = mutateAt(entity, Math.floor(Math.random() * this.userData["tradesLength"]));
    }
    return entity;
    //return mutateAt(entity, Math.floor(Math.random() * this.userData["tradesLength"]));
    //return mutateAt(entity, 100);
};

genetic.crossover = function(mother, father) {
    var length = this.userData["tradesLength"];
    var son      = new Array(length);
    var daughter = new Array(length);

    for(var i = 0; i < length; i++){
        var ca = Math.floor(Math.random()*length);
        var cb = Math.floor(Math.random()*length);		
        if (ca > cb) {
            son[i] = father[i];
            daughter[i] = mother[i];
        } else {
            son[i] = mother[i];
            daughter[i] = father[i];
        }
    }

    return [son, daughter];
};

genetic.fitness = function(entity) {
    return this.userData.fitness.calcAseets(entity);
};

genetic.generation = function(pop, generation, stats) {
    return true;
};

genetic.notification = function(pop, gen, stats, isFinished){

    this.userData.fitness.printStats(pop[0].entity);

    console.log(gen);
    console.log(stats);
};

var config = {
    "iterations": 30,
    "size": 20,
    "crossover": 0.5,
    "mutation": 0.2,
    "skip": 0
};

var userData = {
    tradesLength: 102,
    orderSize: 1,
    fitness: new Fitness('train.json'),
};

genetic.evolve(config, userData);

