/*
import { stringLiteral } from '@babel/types';
 * @Author: huazihear 
 * @Date: 2019-06-03 11:53:38 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-13 11:35:52
 * 字符串加解密算法测试
 */
const {Devil} = require('../../dist/devil');
var stringPrefix = require('../../dist/literal/stringPrefix');
let output = require('../output');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const someString = fs.readFileSync(path.join(__dirname, './code/someString.js'), 'utf-8');

var splitChar = ["_ř", "_Ś", "_Ŝ", "_Ş", "_Š", "_ś", "_ŝ", "_ş", "_š", "_Ţ", "_Ť", "_Ŧ", "_ţ", "_ť", "_ŧ"];
function obtain(str, rdNumber, xorNumber) {
    var sa = str.split('#');
    str = sa[0];
    rdNumber = sa[1];
    xorNumber = sa[2];
    var splitCh = splitChar[rdNumber];
    var strArray = str.split(splitCh);
    strArray.shift();
    if (strArray.length === 0) {
        strArray = str.split('');
        rdNumber = strArray.splice(0, 1)[0].charCodeAt();
        xorNumber = strArray.pop().charCodeAt();
    }
    var result = [];
    var prefix = xorNumber ^ rdNumber;

    for (var i = 0; i < strArray.length; i++) {
        var s = strArray[i];
        s = Number(s) || s.charCodeAt();
        var sCode = s - prefix;
        var nCode = String.fromCharCode(sCode);
        result.push(nCode);
    }
    return result.join('');
}

require('colors');

describe('#字符串动态偏移算法测试', function () {
    it('偏移“fuckyou”', function () {
        var str = "fuckyou";
        var literal = stringPrefix.default(str);
        var result = obtain(literal)
        assert.equal(result, str);
    });
    it('偏移"1dbb2355-6a5815-75421778-83aa2210e"', function () {
        var str = "1dbb2355-6a5815-75421778-83aa2210e";
        var literal = stringPrefix.default(str);
        var result = obtain(literal)
        assert.equal(result, str);
    });
    it('测试，一些字符串的混淆', function () {
        let ncode = new Devil({
            compact:false
        }).devil(someString);
        output('./literal/dist/someString', ncode);
    })
});