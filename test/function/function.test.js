const {Devil} = require('../../dist/devil');
const fs = require('fs');
const path = require('path');

const functionthis = fs.readFileSync(path.join(__dirname, './code/functionthis.js'), 'utf-8');
const badcase = fs.readFileSync(path.join(__dirname, './code/badcase.js'), 'utf-8');

const assert = require('assert');
let output = require('../output');
require('colors');

describe('#function + prototype + this', function () {
    it('function variable lifting', function () {
        let ncode = new Devil({
            compact: false
        }).devil(functionthis);
        output('./function/dist/functionthis', ncode);
        new Function(ncode)();
        assert.equal(true, true);
    });
    // it('badcase test', function () {
    //     let ncode = '';
    //         ncode = new Devil({
    //             compact: false,
    //             stringSplit: false,
    //             objectSplit: false
    //         }).devil(badcase);
           
    //     output('./function/dist/badcase', ncode);
    //     new Function(ncode)();
    //     var _ = global._;
    // });
});