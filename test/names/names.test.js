/*
import { stringLiteral } from '@babel/types';
 * @Author: huazihear 
 * @Date: 2019-06-03 11:53:38 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-05 02:13:30
 * 字符串加解密算法测试
 */
const {Devil} = require('../../dist/devil');
let output = require('../output');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const varName = fs.readFileSync(path.join(__dirname, './code/varName.js'), 'utf-8');


require('colors');

describe('#变量名混淆相关', function () {
    it('变量名混淆', function () {
        let ncode = new Devil().devil(varName);
        output('./names/dist/varName', ncode);
    })
});