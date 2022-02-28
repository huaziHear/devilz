const {Devil} = require('../../dist/devil');
const fs = require('fs');
const path = require('path');

const codeSimple = fs.readFileSync(path.join(__dirname, './code/codeSimple.js'), 'utf-8');
const codeFor = fs.readFileSync(path.join(__dirname, './code/codeFor.js'), 'utf-8');
const codeForEnd = fs.readFileSync(path.join(__dirname, './code/codeForEnd.js'), 'utf-8');
const ifnesting = fs.readFileSync(path.join(__dirname, './code/ifnesting.js'), 'utf-8');
const blockNesting = fs.readFileSync(path.join(__dirname, './code/blockNesting.js'), 'utf-8');
const limit = fs.readFileSync(path.join(__dirname,'./code/limit.js'),'utf-8');

const assert = require('assert');
let output = require('../output');

require('colors');

describe('#if代码块测试，if else 嵌套其他代码块等', function () {
    it('simple if ', function () {
        global.__res = 0
        let ncode = new Devil({
            compact: false
        }).devil(codeSimple);
        output('./if/dist/iftrue',ncode);
        new Function('p', ncode)(1,0);
        assert.equal(global.a, 2);
    });
    it('if nesting for', function () {
        global.__res = 0
        let ncode = new Devil().devil(codeFor);
        output('./if/dist/incluedefor', ncode);
        new Function(ncode)();
        assert.equal(global.__res, 45);
    });
    it('else include for()', function () {
        global.__res = 0
        let ncode = new Devil().devil(codeFor);
        output('./if/dist/falseinclusefor', ncode);
        new Function('p', ncode)(0);
        assert.equal(global.__res, 45);
    });
    it('if nesting for while ', function () {
        global.__res = 0
        let ncode = new Devil().devil(codeForEnd);
        output('./if/dist/trueincluseforend', ncode);
        new Function('p', ncode)(1);
        assert.equal(global.__res, 55);
    })
    it('else include for end', function () {
        global.__res = 0
        let ncode = new Devil().devil(codeForEnd);
        output('./if/dist/falseincluseforend', ncode);
        new Function('p', ncode)(0);
        assert.equal(global.__res, 55);
    })
    it ('if ifnesting', function() {
        global.__res = 0
        let ncode = new Devil().devil(ifnesting);
        output('./if/dist/ifnesting', ncode);
        new Function('p', ncode)(1);
        assert.equal(global.__res, 1001);
    });
    it('if other block nesting', function () {
        global.__res = 0
        let ncode = new Devil().devil(blockNesting);
        output('./if/dist/blockNesting', ncode);
        new Function('p', ncode)(2);
        assert.equal(global.__res, 100);
    });
    it('if limit', function() {
        global.__res = 0
        let ncode = new Devil().devil(limit);
        output('./if/dist/limit', ncode);
        new Function('p', ncode)(2);
        assert.equal(global.__res, 36);
    });
});