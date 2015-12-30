var GoogleSpreadsheet = require('google-spreadsheet');
var co = require('co');
var Promise = require('bluebird');
var google_spread_sheet = new GoogleSpreadsheet('1qzJ0VAYWNn98sFejhu951kiMos2mEUdJJJ_XlAsHF3w');
var config = require(base_dir + '/config.js');

module.exports = (function(){
    'use strict';

    var create_work_sheet = function(work_sheet_name, callback){

        global.base_dir = __dirname;
        var cred = config.google_spread_sheet;

        co(function *(){
            var err = yield Promise.promisify(google_spread_sheet.useServiceAccountAuth)(cred);
            var work_sheet = yield Promise.promisify(google_spread_sheet.addWorksheet)({title: work_sheet_name, rowCount: 1, colCount: 6});
            var info = yield Promise.promisify(google_spread_sheet.getInfo);
            var work_sheet_id = info.worksheets.length;
            console.log(work_sheet_id);
            var cells = yield Promise.promisify(info.worksheets[work_sheet_id-1].getCells)({
                'min-row':1,
                'max-row':1,
                'min-col':1,
                'max-col':6,
                'return-empty': true
            });
            yield Promise.promisify(cells[0].setValue)('date');
            yield Promise.promisify(cells[1].setValue)('rate');
            yield Promise.promisify(cells[2].setValue)('score');
            yield Promise.promisify(cells[3].setValue)('yen');
            yield Promise.promisify(cells[4].setValue)('btc');
            yield Promise.promisify(cells[5].setValue)('assets');

            callback(err, work_sheet_id);
        }).catch(function(e){
            console.log(e.stack);
        });
    };

    var log = function(trader, callback){
        var self = this;
        co(function *(){
            if(!self.work_sheet_id){
                self.work_sheet_id = yield Promise.promisify(create_work_sheet)(self.work_sheet_name);
            }

            var data = {
                date: trader.last_trade().created_at,
                rate: trader.current_rate(),
                score: trader.current_score,
                yen : trader.current_yen,
                btc : trader.current_btc,
                assets : trader.current_assets_all,
            };
            var cred = config.google_spread_sheet;
            var err = yield Promise.promisify(google_spread_sheet.useServiceAccountAuth)(cred);
            var result = yield Promise.promisify(google_spread_sheet.addRow)(self.work_sheet_id, data);
            callback(result);
        }).catch(function(e){
            console.log(e.stack);
        });
    };

    var Logger = function(work_sheet_name){
        this.work_sheet_name = work_sheet_name;
        this.work_sheet_id;

        this.log = log;
    };

    return Logger;
})();
