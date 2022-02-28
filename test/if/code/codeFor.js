var r = 0;
var p = function(){
    return 1;
}
if (p()) {
    for (var i = 0; i < 10; i++) {
        r += i;
    }
    global.__res = r;
} else {
    for (var i = 0; i < 10; i++) {
        r += i;
    }
    global.__res = r;
}