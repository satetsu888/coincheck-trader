var config = require('./config.js');

module.exports = (function(){

    var calcFitness = function(entity){
        var stat = {
            current_yen: 40000,
            current_btc: 1,
        };
        var calcProperty = function(stat, last_rate){
            return stat.current_yen + stat.current_btc * last_rate;
        };

        // TODO

        return calcProperty(stat, 40000);
    };

    return {
        calcFitness: calcFitness
    };
})();
