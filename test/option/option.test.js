
const {Devil} = require('../../dist/devil');
let output = require('../output');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const saveString = fs.readFileSync(path.join(__dirname, './code/saveString.js'), 'utf-8');


require('colors');

describe('#配置参数测试', function () {
    it('配置参数测试： saveStrings ', function () {
        let ncode = new Devil({
            saveStrings: ['{{{token1}}}', '{{{token2}}}', '{{{token3}}}', '{{{token4}}}', '{{{token5}}}','{{{tokenTime}}}']
        }).devil(saveString);
        output('./option/dist/saveStrings', ncode);
    })
});