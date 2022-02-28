for (var a = 0; a < 10; a++) {
    for(var d=0;d<2;d++) {
        global.__res += (a+d);
    }
    if (a == 9) {
        global.__res *= 10;
    }
}
var b = 0;
for (; b < 10; b++) {
    if (a == 4) {
        global.__res += b;
    }
}
var c = 0;
for (;c < 10;) {
    if (a == 4) {
        global.__res += c;
    } else {
        global.__res -= c === 0 ? c : 10;
    }
    c++;
}