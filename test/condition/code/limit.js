var p = 0;
var a = function () {
    p = 1;
    return 10084;
};

for(var i=0; i<1;i++) {
    p = p === 0 ? a() : 10086;
}

while(p===1) {
    p = p === 1 ? 10010 : typeof p === 'number' ? 100 : 200;
}

global.__res = p;