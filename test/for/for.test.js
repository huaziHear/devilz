const {Devil} = require('../../dist/devil');
const fs = require('fs');
const path = require('path');

const forCode = fs.readFileSync(path.join(__dirname, './code/for.js'), 'utf-8');
const forAndOther = fs.readFileSync(path.join(__dirname, './code/forAndOther.js'), 'utf-8');
const limit = fs.readFileSync(path.join(__dirname, './code/limit.js'), 'utf-8');

const assert = require('assert');
let outputfile = require('../output');

require('colors');

describe('#for循环代码块测试，for嵌套其他代码块等', function () {
    it('simple for ', function () {
        global.__res = 0
        let ncode = new Devil().devil(forCode);
        outputfile('./for/dist/simplefor',ncode);
        new Function('p', ncode)();
        assert.equal(global.__res, 135);
    });
    it('for and other', function() {
        global.__res = 0
        let ncode = new Devil().devil(forAndOther);
        outputfile('./for/dist/forAndOther', ncode);
        new Function('p', ncode)();
        assert.equal(global.__res, 910);
    });
    it('limit', function () {
        global.__res = 0
        let ncode = new Devil().devil(limit);
        outputfile('./for/dist/limit', ncode);
        new Function('p', ncode)(0);
        assert.equal(global.__res, 216);
    });
});