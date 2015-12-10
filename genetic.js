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

    var seed = new Array(length);
    for(var i = 0; i < length; i++){
        seed[i] = Math.random() * orderSize * 2 - orderSize;
    }
    return seed;
};

genetic.mutate = function(entity) {
    var orderSize = this.userData["orderSize"];

    function mutateAt(entity, index) {
        entity[index] = Math.random() * orderSize * 2 - orderSize;
        return entity;
    }

    return mutateAt(entity, Math.floor(Math.random() * this.userData["tradesLength"]));
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
    return this.userData.fitness.calcFitness(entity);
};

genetic.generation = function(pop, generation, stats) {
    return true;
};

genetic.notification = function(pop, gen, stats, isFinished){

    var Fitness = require(base_dir + '/fitness.js');
    var fitness = new Fitness();
    fitness.printOrder(pop[0].entity);

    console.log(gen);
    console.log(stats);
};

var config = {
    "iterations": 100,
    "size": 8,
    "crossover": 0.3,
    "mutation": 0.3,
    "skip": 10
};

var userData = {
    tradesLength: 100,
    orderSize: 1,
    fitness: new Fitness(),
};

genetic.evolve(config, userData);

