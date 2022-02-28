const {Devil} = require('../../dist/devil');
const fs = require('fs');
const path = require('path');

const addAndSub = fs.readFileSync(path.join(__dirname, './code/addAndSub.js'), 'utf-8');
const objectSplit = fs.readFileSync(path.join(__dirname, './code/objectSplit.js'), 'utf-8');
const stringSplit = fs.readFileSync(path.join(__dirname, './code/stringSplit.js'), 'utf-8');

const assert = require('assert');
let outputfile = require('../output');

require('colors');

describe('#各种细粒度的拆解', function () {
    it('加减法表达式的拆解', function() {
        global.__res = 0;
        let ncode = new Devil({
            compact: false
        }).devil(addAndSub);
        outputfile('./splitCode/dist/addAndSub', ncode);
        new Function(ncode)();
        assert.equal(global.__res, 10);
        assert.equal(global.__add, -4);
        assert.equal(global.__name, 20);
    });
    it('对象的拆解', function () {
        global.__res = 0;
        let ncode = new Devil({
            compact: false
        }).devil(objectSplit);
        outputfile('./splitCode/dist/objectSplit', ncode);
        new Function(ncode)();
    });
    it('字符串拆解', function() {
        global.a = '';
        let ncode = new Devil({
            compact: false
        }).devil(stringSplit);
        outputfile('./splitCode/dist/stringSplit', ncode);
        new Function(ncode)();
        assert.equal(global.a, 'fuckyoueveryday');
    })
});