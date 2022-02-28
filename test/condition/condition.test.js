const {Devil} = require('../../dist/devil');
const fs = require('fs');
const path = require('path');

const conditionCode = fs.readFileSync(path.join(__dirname, './code/simpleCondition.js'), 'utf-8');
const condition = fs.readFileSync(path.join(__dirname, './code/condition.js'), 'utf-8');
const conditionAndOther = fs.readFileSync(path.join(__dirname, './code/conditionAndOther.js'), 'utf-8');
const limit = fs.readFileSync(path.join(__dirname, './code/limit.js'), 'utf-8');

const assert = require('assert');
let outputfile = require('../output');

require('colors');

describe('#condition循环代码块测试，condition嵌套其他代码块等', function () {
    it('simple condition ', function () {
        global.__res = 0
        let ncode = new Devil().devil(conditionCode);
        outputfile('./condition/dist/simplecondition', ncode);
        new Function('p', ncode)();
        assert.equal(global.__res, 10086);
    });
    it('condition nesting', function () {
        global.__res = 0
        let ncode = new Devil().devil(condition);
        outputfile('./condition/dist/condition', ncode);
        new Function('p', ncode)(1);
        assert.equal(global.__res, 10086);
    });
    it('condition conditionAndOther', function () {
        global.__res = 0
        let ncode = new Devil().devil(conditionAndOther);
        outputfile('./condition/dist/conditionAndOther', ncode);
        new Function('p', ncode)(1);
        assert.equal(global.__res, 2);
    });
    it('limit', function () {
        global.__res = 0
        let ncode = new Devil().devil(limit);
        outputfile('./condition/dist/limit', ncode);
        new Function(ncode)();
        assert.equal(global.__res, 10084);
    });
});