var a = 1;
var b = 2;
var c = 3;
var d = 4;
global.__res = a + b + c + d;
var ef = a + b - c - d;
global.__add = ef;
function name(a,b,c,d,e) {
    return a+b+c+d+e;
}
global.__name = name(2,3,4,5,6);