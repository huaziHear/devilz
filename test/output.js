const fs = require('fs');
const path = require('path');

module.exports = function (pathname,code) {
    fs.writeFileSync(path.join(__dirname,  pathname + '.js'), code);
}