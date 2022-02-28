/*
import { stringLiteral } from '@babel/types';
 * @Author: huazihear 
 * @Date: 2019-06-03 11:53:38 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-05 02:11:58
 * 字符串加解密算法测试
 */
const {Devil} = require('../../dist/devil');
let output = require('../output');
const fs = require('fs');
const path = require('path');
const simple = fs.readFileSync(path.join(__dirname, './code/simple.js'), 'utf-8');

require('colors');

describe('#属性混淆', function () {
    let ncode = new Devil().devil(simple);
    output('./attribute/dist/simple', ncode);
});