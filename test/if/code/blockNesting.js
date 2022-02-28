if (p===2) {
    var a = {
        k:1,
        v:2
    }
    for(var key in a) {
        if (key == 'k') {
            global.__res = 10;
        }
        if (key === 'v') {
            global.__res *= 10;
        }
    }
}