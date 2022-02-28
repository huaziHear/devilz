const {Devil} = require('../../dist/devil');
const fs = require('fs');
const path = require('path');

const aes = fs.readFileSync(path.join(__dirname, './code/aes.js'), 'utf-8');
const DESCODE = fs.readFileSync(path.join(__dirname, './code/des.js'), 'utf-8');
const lodash = fs.readFileSync(path.join(__dirname, './code/lodash.js'), 'utf-8');
const underscore = fs.readFileSync(path.join(__dirname, './code/underscore.js'), 'utf-8');

const assert = require('assert');
let output = require('../output');
require('colors');

describe('#第三方代码库混淆测试', function () {
    it('des ', function () {
        let ncode = new Devil({
            stringSplit: false,
            compact: false
        }).devil(DESCODE);
        output('./olib/dist/des', ncode);
        new Function(ncode)();
        let des = global.DES.createNew();
    });

    it('aes ', function () {
        let ncode = new Devil().devil(aes);
        output('./olib/dist/aes',ncode);
        new Function(ncode)();
        var AES = global.aesjs.AES;
        var buf = new Buffer('fuckyouervrnydss');
        let aesins = new AES(buf)
        let result = aesins.encrypt('fuckyouervrnydss').toString('utf-8');
    });

    it('underscore', function () {
        let ncode = new Devil().devil(underscore);
        output('./olib/dist/underscore', ncode);
        new Function(ncode)();
        var _ = global._;
        var size = _.size({ one: 1, two: 2, three: 3 });
        var keys = _.keys({ one: 1, two: 2, three: 3 }).join('');
        var flatten = _.flatten([1, [2], [3, [[4]]]]).join('');
        assert.equal(size, 3);
        assert.equal(keys, 'onetwothree');
        assert.equal(flatten, '1234');

    });

    it('lodash', function() {
        let ncode = new Devil().devil(lodash);
        output('./olib/dist/lodash', ncode);
        new Function(ncode)();
        var _ = global._;
        
        var users = [
            { 'user': 'barney', 'active': false },
            { 'user': 'fred', 'active': false },
            { 'user': 'pebbles', 'active': true }
        ];
        let res = _.findIndex(users, function (o) { return o.user == 'barney'; });
        let flattenDeep = _.flattenDeep([1, [2, [3, [4]], 5]]).join('');

        let take4 = _.take([1, 2, 3], 0);

        var a = _.map(['6', '8', '10'], _.unary(parseInt));

        assert.equal(res, 0);
        assert.equal(flattenDeep, '12345');
        assert.equal(take4.length, 0);
        assert.equal(a.join(''), '6810')
    });
});