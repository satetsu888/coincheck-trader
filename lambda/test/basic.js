var assert = require('assert');

describe('basic',function(){
    it('Should create', function(testDone){
        var data = {
            entity: require('./bot.json'),
        };
        var context = {
            invokeid: 'invokeid',
            succeed: function(result){
                console.log(result);
                testDone();
                return;
            },
            fail: function(err){
                console.log(err);
                testDone();
                return;
            },
        };

        var lambda = require("../index.js");
        lambda.handler(data,context);
        assert(lambda);
    });
});
